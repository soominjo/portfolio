import { describe, expect, it } from 'vitest'
import { CONTACT_LIMITS, contactSchema } from './contactSchema'

const valid = { name: 'Jane Smith', email: 'jane@company.com', message: 'I would love to chat about a role.' }

describe('contactSchema', () => {
  it('accepts a complete message and trims the edges', () => {
    const result = contactSchema.safeParse({ ...valid, name: '  Jane Smith  ', message: `  ${valid.message}  ` })
    expect(result.success).toBe(true)
    expect(result.data).toEqual(valid)
  })

  it('counts length after trimming, as /api/contact does', () => {
    expect(contactSchema.safeParse({ ...valid, name: ' J ' }).success).toBe(false)
    expect(contactSchema.safeParse({ ...valid, message: '   short   ' }).success).toBe(false)
  })

  it('rejects an invalid email', () => {
    expect(contactSchema.safeParse({ ...valid, email: 'jane@' }).success).toBe(false)
  })

  it('caps each field at the length the API keeps', () => {
    expect(CONTACT_LIMITS).toEqual({ name: 100, email: 254, message: 2000 })
    expect(contactSchema.safeParse({ ...valid, name: 'a'.repeat(101) }).success).toBe(false)
    expect(contactSchema.safeParse({ ...valid, message: 'a'.repeat(2001) }).success).toBe(false)
  })
})
