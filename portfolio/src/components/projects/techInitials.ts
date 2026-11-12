/**
 * Short stand-in for a tool with no brand mark: the first letter of each word
 * for multi-word names (at most three), otherwise the first two letters.
 */
export function techInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length > 1) {
    return words
      .slice(0, 3)
      .map((word) => word[0].toUpperCase())
      .join('')
  }
  return name.trim().slice(0, 2)
}
