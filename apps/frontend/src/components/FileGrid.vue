<script setup lang="ts">
import type { FileDto } from '../types/folder'

defineProps<{ files: FileDto[] }>()

function iconFor(mimeType: string | null): string {
  if (!mimeType) return '📄'
  if (mimeType.startsWith('image/'))  return '🖼️'
  if (mimeType.startsWith('video/'))  return '🎬'
  if (mimeType.startsWith('audio/'))  return '🎵'
  if (mimeType === 'application/pdf') return '📕'
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return '📊'
  if (mimeType.includes('word'))      return '📝'
  return '📄'
}

function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`
}
</script>

<template>
  <div v-if="files.length" class="file-grid">
    <div
      v-for="file in files"
      :key="file.id"
      class="grid-item"
      :title="`${file.name} — ${formatSize(file.size)}`"
    >
      <span class="item-icon">{{ iconFor(file.mimeType) }}</span>
      <span class="item-name">{{ file.name }}</span>
      <span class="item-size">{{ formatSize(file.size) }}</span>
    </div>
  </div>
</template>

<style scoped>
.file-grid { display: flex; flex-wrap: wrap; gap: 8px; padding: 12px; padding-top: 0; }
.grid-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  width: 80px;
  padding: 8px 4px;
  border-radius: 4px;
  cursor: default;
  user-select: none;
  border: 1px solid transparent;
}
.grid-item:hover { background: #f5f5f5; border-color: #e0e0e0; }
.item-icon { font-size: 32px; }
.item-name {
  font-size: 11px;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
}
.item-size { font-size: 10px; color: #999; }
</style>
