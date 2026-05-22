<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import FolderNode from './FolderNode.vue'
import { useFolderTree } from '../composables/useFolderTree'
import { useVirtualScroll } from '../composables/useVirtualScroll'
import type { TreeNode } from '../types/folder'

const props = defineProps<{
  roots: TreeNode[]
  selectedId: string | null
}>()

const emit = defineEmits<{
  select: [id: string]
}>()

const ITEM_HEIGHT = 32

const containerRef    = ref<HTMLElement | null>(null)
const containerHeight = ref(400)
const scrollTop       = ref(0)

const { flatVisible, toggle } = useFolderTree(() => props.roots)
const { visibleItems }        = useVirtualScroll(flatVisible, containerHeight, scrollTop, {
  itemHeight: ITEM_HEIGHT,
})

function onScroll(e: Event) {
  scrollTop.value = (e.target as HTMLElement).scrollTop
}

let ro: ResizeObserver | null = null

onMounted(() => {
  if (!containerRef.value) return
  containerHeight.value = containerRef.value.clientHeight
  ro = new ResizeObserver(() => {
    containerHeight.value = containerRef.value?.clientHeight ?? 400
  })
  ro.observe(containerRef.value)
})

onUnmounted(() => ro?.disconnect())
</script>

<template>
  <div
    ref="containerRef"
    class="folder-tree"
    @scroll="onScroll"
  >
    <div :style="{ height: `${visibleItems.totalHeight}px`, position: 'relative' }">
      <div
        v-for="{ item, offsetY } in visibleItems.items"
        :key="item.id"
        :style="{ position: 'absolute', top: `${offsetY}px`, width: '100%', height: `${ITEM_HEIGHT}px` }"
      >
        <FolderNode
          :node="item"
          :is-selected="item.id === selectedId"
          @select="emit('select', $event)"
          @toggle="toggle"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.folder-tree {
  overflow-y: auto;
  height: 100%;
  position: relative;
}
</style>
