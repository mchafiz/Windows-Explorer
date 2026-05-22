<script setup lang="ts">
import type { FlatNode } from '../types/folder'

const props = defineProps<{
  node: FlatNode
  isSelected: boolean
}>()

const emit = defineEmits<{
  select: [id: string]
  toggle: [id: string]
}>()
</script>

<template>
  <div
    class="folder-node"
    :class="{ selected: isSelected }"
    :style="{ paddingLeft: `${8 + node.depth * 16}px` }"
    @click="emit('select', node.id)"
  >
    <span
      v-if="node.hasChildren"
      data-testid="toggle"
      class="toggle-arrow"
      @click.stop="emit('toggle', node.id)"
    >
      {{ node.isOpen ? '▼' : '▶' }}
    </span>
    <span v-else class="toggle-spacer" />
    <span class="folder-icon">📁</span>
    <span class="folder-name">{{ node.name }}</span>
  </div>
</template>

<style scoped>
.folder-node {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  cursor: pointer;
  border-radius: 4px;
  user-select: none;
  padding-right: 8px;
}
.folder-node:hover { background: #e8f0fe; }
.folder-node.selected { background: #cce4ff; font-weight: 500; }
.toggle-arrow {
  font-size: 10px;
  width: 14px;
  text-align: center;
  color: #555;
  flex-shrink: 0;
}
.toggle-spacer { width: 14px; flex-shrink: 0; }
.folder-icon { font-size: 14px; flex-shrink: 0; }
.folder-name {
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
