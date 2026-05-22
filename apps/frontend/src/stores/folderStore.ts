import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { folderService } from '../services/folderService'
import { buildTree } from '../composables/useFolderTree'
import type { FolderDto, FileDto, TreeNode } from '../types/folder'

export const useFolderStore = defineStore('folder', () => {
  const folders          = ref<FolderDto[]>([])
  const selectedFolderId = ref<string | null>(null)
  const childrenMap      = ref<Record<string, { folders: FolderDto[]; files: FileDto[] }>>({})
  const loading          = ref(false)
  const error            = ref<string | null>(null)

  const treeRoots = computed<TreeNode[]>(() => buildTree(folders.value))

  const selectedChildren = computed(() =>
    selectedFolderId.value ? (childrenMap.value[selectedFolderId.value] ?? null) : null,
  )

  async function fetchAll() {
    loading.value = true
    error.value   = null
    try {
      folders.value = await folderService.getFolders()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load folders'
    } finally {
      loading.value = false
    }
  }

  async function selectFolder(id: string) {
    selectedFolderId.value = id

    if (childrenMap.value[id]) return // client-side cache hit

    try {
      const result = await folderService.getChildren(id)
      childrenMap.value = { ...childrenMap.value, [id]: result }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load folder contents'
    }
  }

  function clearSelection() {
    selectedFolderId.value = null
  }

  return {
    folders,
    selectedFolderId,
    childrenMap,
    loading,
    error,
    treeRoots,
    selectedChildren,
    fetchAll,
    selectFolder,
    clearSelection,
  }
})
