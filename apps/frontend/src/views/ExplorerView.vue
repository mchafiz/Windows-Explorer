<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useFolderStore } from '../stores/folderStore'
import { useSearch } from '../composables/useSearch'
import SearchBar from '../components/SearchBar.vue'
import FolderTree from '../components/FolderTree.vue'
import ContentPanel from '../components/ContentPanel.vue'

const store = useFolderStore()
const { query, results, searching } = useSearch()

onMounted(() => store.fetchAll())

const isSearching = computed(() => query.value.trim().length > 0)

const displayFolders = computed(() =>
  isSearching.value ? (results.value?.folders ?? []) : (store.selectedChildren?.folders ?? []),
)

const displayFiles = computed(() =>
  isSearching.value ? (results.value?.files ?? []) : (store.selectedChildren?.files ?? []),
)

const breadcrumb = computed(() => {
  if (isSearching.value) return `Search: "${query.value}"`
  if (!store.selectedFolderId) return ''
  const folder = store.folders.find(f => f.id === store.selectedFolderId)
  return folder?.name ?? ''
})

function onSelectFolder(id: string) {
  query.value = ''
  store.selectFolder(id)
}
</script>

<template>
  <div class="explorer">
    <SearchBar v-model="query" />

    <div class="explorer-body">
      <aside class="explorer-sidebar" data-testid="sidebar">
        <div v-if="store.loading" class="sidebar-state">Loading...</div>
        <div v-else-if="store.error" class="sidebar-state error">{{ store.error }}</div>
        <FolderTree
          v-else
          :roots="store.treeRoots"
          :selected-id="store.selectedFolderId"
          @select="onSelectFolder"
        />
      </aside>

      <main class="explorer-main" data-testid="content-panel">
        <ContentPanel
          :breadcrumb="breadcrumb"
          :folders="displayFolders"
          :files="displayFiles"
          :loading="searching"
          @navigate="onSelectFolder"
        />
      </main>
    </div>
  </div>
</template>

<style scoped>
.explorer {
  display: flex;
  flex-direction: column;
  height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 13px;
  color: #1a1a1a;
  background: #fff;
}
.explorer-body {
  display: flex;
  flex: 1;
  overflow: hidden;
  border-top: 1px solid #ddd;
}
.explorer-sidebar {
  width: 30%;
  min-width: 180px;
  max-width: 380px;
  border-right: 1px solid #ddd;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.explorer-main {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.sidebar-state {
  padding: 12px 16px;
  color: #888;
  font-size: 12px;
}
.sidebar-state.error { color: #c0392b; }
</style>
