import type { Element, Root, Text } from 'hast'
import { describe, expect, it } from 'vitest'
import { rehypeDecodeOffsets } from './rehypeDecodeOffsets'

describe('rehypeDecodeOffsets', () => {
  it('numbers visible text nodes in reading order and skips whitespace', () => {
    const tree: Root = {
      type: 'root',
      children: [
        {
          type: 'element',
          tagName: 'p',
          properties: {},
          children: [
            { type: 'text', value: 'Hi ' },
            { type: 'element', tagName: 'strong', properties: {}, children: [{ type: 'text', value: 'there' }] },
          ],
        },
        { type: 'text', value: '\n' },
        { type: 'element', tagName: 'p', properties: {}, children: [{ type: 'text', value: 'Bye' }] },
      ],
    }

    rehypeDecodeOffsets()(tree)

    const [p1, gap, p2] = tree.children as [Element, Text, Element]
    expect(p1.children[0]).toMatchObject({
      tagName: 'span',
      properties: { dataDecodeOffset: 0 },
      children: [{ value: 'Hi ' }],
    })
    expect((p1.children[1] as Element).children[0]).toMatchObject({ properties: { dataDecodeOffset: 3 } })
    expect(gap).toEqual({ type: 'text', value: '\n' })
    expect(p2.children[0]).toMatchObject({ properties: { dataDecodeOffset: 8 } })
  })
})
