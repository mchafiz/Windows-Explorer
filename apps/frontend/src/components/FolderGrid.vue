<script setup lang="ts">
import type { FolderDto } from '../types/folder'

defineProps<{ folders: FolderDto[] }>()
const emit = defineEmits<{ select: [id: string] }>()
</script>

<template>
  <div v-if="folders.length" class="folder-grid">
    <div
      v-for="folder in folders"
      :key="folder.id"
      class="grid-item"
      :data-testid="`folder-item-${folder.id}`"
      @dblclick="emit('select', folder.id)"
    >
      <span class="item-icon">📁</span>
      <span class="item-name" :title="folder.name">{{ folder.name }}</span>
    </div>
  </div>
</template>

<style scoped>
.folder-grid { display: flex; flex-wrap: wrap; gap: 8px; padding: 12px; }
.grid-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  width: 80px;
  padding: 8px 4px;
  border-radius: 4px;
  cursor: pointer;
  user-select: none;
  border: 1px solid transparent;
}
.grid-item:hover { background: #e8f0fe; border-color: #b3d1ff; }
.item-icon { font-size: 32px; }
.item-name {
  font-size: 11px;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
}
</style>
