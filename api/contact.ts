import type { VercelRequest, VercelResponse } from '@vercel/node'
import { Resend } from 'resend'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

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
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
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

    // 2. Send email via Resend
    await resend.emails.send({
      from: 'Portfolio Contact <onboarding@resend.dev>',
      to: process.env.PERSONAL_CONTACT_EMAIL!,
      replyTo: sanitized.senderEmail,
      subject: `Portfolio message from ${sanitized.senderName}`,
      text: `From: ${sanitized.senderName} <${sanitized.senderEmail}>\n\n${sanitized.message}`,
      html: `
        <p><strong>From:</strong> ${sanitized.senderName} &lt;${sanitized.senderEmail}&gt;</p>
        <p><strong>Message:</strong></p>
        <p>${sanitized.message.replace(/\n/g, '<br>')}</p>
      `,
    })

    return res.status(200).json({ success: true })
  } catch (err: unknown) {
    console.error('[/api/contact]', err)
    return res.status(500).json({ success: false, error: 'Failed to send message' })
  }
}
