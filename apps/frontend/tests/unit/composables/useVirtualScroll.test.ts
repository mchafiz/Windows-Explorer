import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { useVirtualScroll } from '../../../src/composables/useVirtualScroll'

const items = Array.from({ length: 100 }, (_, i) => ({ id: i, label: `Item ${i}` }))

describe('useVirtualScroll', () => {
  it('returns only items that fit in the visible window', () => {
    const { visibleItems } = useVirtualScroll(ref(items), ref(200), ref(0), { itemHeight: 32 })
    expect(visibleItems.value.items.length).toBeLessThan(30)
  })

  it('reports correct totalHeight', () => {
    const { visibleItems } = useVirtualScroll(ref(items), ref(200), ref(0), { itemHeight: 32 })
    expect(visibleItems.value.totalHeight).toBe(100 * 32)
  })

  it('shifts the visible window when scrolled', () => {
    const scrollTop = ref(0)
    const { visibleItems } = useVirtualScroll(ref(items), ref(200), scrollTop, { itemHeight: 32 })
    const firstBefore = visibleItems.value.items[0].item.id
    scrollTop.value = 320
    const firstAfter = visibleItems.value.items[0].item.id
    expect(firstAfter).toBeGreaterThan(firstBefore)
  })

  it('each visible item has a correct offsetY', () => {
    const { visibleItems } = useVirtualScroll(ref(items), ref(200), ref(0), { itemHeight: 32 })
    const first = visibleItems.value.items[0]
    expect(first.offsetY).toBe(first.index * 32)
  })

  it('handles empty list', () => {
    const { visibleItems } = useVirtualScroll(ref([]), ref(200), ref(0), { itemHeight: 32 })
    expect(visibleItems.value.items).toHaveLength(0)
    expect(visibleItems.value.totalHeight).toBe(0)
  })
})
