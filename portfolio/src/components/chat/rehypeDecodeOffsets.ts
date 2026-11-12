import type { Element, ElementContent, Root, RootContent } from 'hast'

const VISIBLE = /\S/

/**
 * Rehype plugin for the decoding copy of a reply. It wraps every text node
 * that has visible characters in `<span data-decode-offset="n">`, where `n`
 * counts the characters of earlier wrapped nodes in reading order, so each
 * span knows where it sits in the reply-wide decode.
 *
 * Unified transformers edit the tree in place; this one only ever runs on the
 * fresh tree react-markdown builds for each render.
 */
export function rehypeDecodeOffsets(): (tree: Root) => void {
  return (tree) => {
    let offset = 0

    const wrapText = (children: Array<RootContent | ElementContent>): void => {
      children.forEach((child, index) => {
        if (child.type === 'element') {
          wrapText(child.children)
          return
        }
        if (child.type !== 'text' || !VISIBLE.test(child.value)) return

        const span: Element = {
          type: 'element',
          tagName: 'span',
          properties: { dataDecodeOffset: offset },
          children: [child],
        }
        offset += child.value.length
        children[index] = span
      })
    }

    wrapText(tree.children)
  }
}
