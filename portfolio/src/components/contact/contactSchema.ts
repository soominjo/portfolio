import { z } from 'zod'

/** The longest value /api/contact keeps for each field (it slices anything longer). */
export const CONTACT_LIMITS = { name: 100, email: 254, message: 2000 } as const

// Mirrors the checks in /api/contact, which trims before measuring.
export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(CONTACT_LIMITS.name, `Name must be ${CONTACT_LIMITS.name} characters or fewer`),
  email: z
    .string()
    .trim()
    .max(CONTACT_LIMITS.email, 'Please enter a valid email address')
    .pipe(z.email('Please enter a valid email address')),
  message: z
    .string()
    .trim()
    .min(10, 'Message must be at least 10 characters')
    .max(CONTACT_LIMITS.message, `Message must be ${CONTACT_LIMITS.message} characters or fewer`),
})

export type ContactFormData = z.infer<typeof contactSchema>
