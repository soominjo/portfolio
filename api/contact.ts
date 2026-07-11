import type { VercelRequest, VercelResponse } from '@vercel/node'
import { Resend } from 'resend'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { notificationEmail } from './emails/notification'
import { confirmationEmail } from './emails/confirmation'
import { isRateLimited, getClientIp } from './lib/rateLimit'

const resend = new Resend(process.env.RESEND_API_KEY)

// Initialize Firebase Admin only once across warm invocations
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  })
}

const db = getFirestore()

function isValidEmail(email: string): boolean {
  return /^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']+$/.test(email)
}

function formatTimestamp(date: Date): string {
  return date.toISOString().replace('T', ' · ').slice(0, 19) + ' UTC'
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  if (isRateLimited(`contact:${getClientIp(req)}`, 3, 10 * 60 * 1000)) {
    return res.status(429).json({ success: false, error: 'Too many requests. Please try again later.' })
  }

  const { name, email, message } = req.body ?? {}

  // Validate at the boundary — never trust external input
  if (
    typeof name !== 'string' || name.trim().length < 2 ||
    typeof email !== 'string' || !isValidEmail(email) ||
    typeof message !== 'string' || message.trim().length < 10
  ) {
    return res.status(400).json({ success: false, error: 'Invalid input' })
  }

  const sanitized = {
    senderName: name.trim().slice(0, 100),
    senderEmail: email.trim().toLowerCase().slice(0, 254),
    message: message.trim().slice(0, 2000),
    status: 'pending',
    createdAt: new Date(),
  }

  try {
    // 1. Save to Firestore first — ensures no message is lost even if email fails
    await db.collection('contact_messages').add(sanitized)

    const receivedAt = formatTimestamp(sanitized.createdAt)

    // 2. Send both emails concurrently — notification to Genessis + auto-reply to sender
    const [notificationResult, confirmationResult] = await Promise.allSettled([
      resend.emails.send({
        from: 'Portfolio Contact <onboarding@resend.dev>',
        to: process.env.PERSONAL_CONTACT_EMAIL!,
        replyTo: sanitized.senderEmail,
        subject: `Portfolio message from ${sanitized.senderName}`,
        html: notificationEmail({
          senderName: sanitized.senderName,
          senderEmail: sanitized.senderEmail,
          message: sanitized.message,
          receivedAt,
        }),
      }),
      resend.emails.send({
        from: 'Genessis Contreras <onboarding@resend.dev>',
        to: sanitized.senderEmail,
        subject: `Got your message — I'll be in touch soon`,
        html: confirmationEmail({
          senderName: sanitized.senderName,
          message: sanitized.message,
        }),
      }),
    ])

    // Notification to owner is the critical path — fail the request if it didn't send
    if (notificationResult.status === 'rejected') {
      throw notificationResult.reason
    }

    // Log but don't fail if the auto-reply couldn't send
    if (confirmationResult.status === 'rejected') {
      console.warn('[/api/contact] Auto-reply failed:', confirmationResult.reason)
    }

    return res.status(200).json({ success: true })
  } catch (err: unknown) {
    console.error('[/api/contact]', err)
    return res.status(500).json({ success: false, error: 'Failed to send message' })
  }
}
