<script setup lang="ts">
import BreadcrumbBar from './BreadcrumbBar.vue'
import FolderGrid from './FolderGrid.vue'
import FileGrid from './FileGrid.vue'
import type { FolderDto, FileDto } from '../types/folder'

const props = defineProps<{
  breadcrumb: string
  folders: FolderDto[]
  files: FileDto[]
  loading: boolean
}>()

const emit = defineEmits<{ navigate: [id: string] }>()

const totalItems = () => props.folders.length + props.files.length
</script>

<template>
  <div class="content-panel">
    <BreadcrumbBar :path="breadcrumb" />

    <div v-if="loading" class="state-message">Loading...</div>

    <div v-else-if="!breadcrumb" class="state-message empty-state">
      Select a folder to view its contents
    </div>

    <div v-else class="content-scroll">
      <FolderGrid :folders="folders" @select="emit('navigate', $event)" />
      <FileGrid :files="files" />
      <p v-if="!folders.length && !files.length" class="state-message">
        This folder is empty
      </p>
    </div>

    <div class="status-bar">
      <template v-if="breadcrumb">
        {{ totalItems() }} item{{ totalItems() !== 1 ? 's' : '' }}
        · {{ folders.length }} folder{{ folders.length !== 1 ? 's' : '' }},
        {{ files.length }} file{{ files.length !== 1 ? 's' : '' }}
      </template>
      <template v-else>
        Ready
      </template>
    </div>
  </div>
</template>

<style scoped>
.content-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}
.content-scroll { flex: 1; overflow-y: auto; }
.status-bar {
  padding: 4px 12px;
  font-size: 11px;
  color: #666;
  border-top: 1px solid #eee;
  background: #fafafa;
  min-height: 24px;
}
.state-message {
  padding: 16px;
  color: #888;
  font-size: 13px;
}
.empty-state { margin-top: 60px; text-align: center; }
</style>
