import { describe, expect, it } from 'vitest'
import { techInitials } from './techInitials'

describe('techInitials', () => {
  it.each([
    ['TryTerra', 'Tr'],
    ['Zustand', 'Zu'],
    ['POS System', 'PS'],
    ['  Google Vertex AI ', 'GVA'],
    ['', ''],
  ])('turns %j into %j', (name, initials) => {
    expect(techInitials(name)).toBe(initials)
  })
})
