import { computed, type Ref } from 'vue'

interface Options {
  itemHeight: number
  overscan?: number
}

export function useVirtualScroll<T>(
  items: Ref<T[]>,
  containerHeight: Ref<number>,
  scrollTop: Ref<number>,
  { itemHeight, overscan = 3 }: Options,
) {
  const visibleItems = computed(() => {
    const total = items.value.length
    const start = Math.max(0, Math.floor(scrollTop.value / itemHeight) - overscan)
    const count = Math.ceil(containerHeight.value / itemHeight)
    const end   = Math.min(total, start + count + overscan * 2)

    return {
      items: items.value.slice(start, end).map((item, i) => ({
        item,
        index: start + i,
        offsetY: (start + i) * itemHeight,
      })),
      totalHeight: total * itemHeight,
    }
  })

  return { visibleItems }
}
