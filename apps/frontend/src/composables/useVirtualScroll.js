import { computed } from 'vue';
export function useVirtualScroll(items, containerHeight, scrollTop, { itemHeight, overscan = 3 }) {
    const visibleItems = computed(() => {
        const total = items.value.length;
        const start = Math.max(0, Math.floor(scrollTop.value / itemHeight) - overscan);
        const count = Math.ceil(containerHeight.value / itemHeight);
        const end = Math.min(total, start + count + overscan * 2);
        return {
            items: items.value.slice(start, end).map((item, i) => ({
                item,
                index: start + i,
                offsetY: (start + i) * itemHeight,
            })),
            totalHeight: total * itemHeight,
        };
    });
    return { visibleItems };
}
