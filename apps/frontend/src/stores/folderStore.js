import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { folderService } from '../services/folderService';
import { buildTree } from '../composables/useFolderTree';
export const useFolderStore = defineStore('folder', () => {
    const folders = ref([]);
    const selectedFolderId = ref(null);
    const childrenMap = ref({});
    const loading = ref(false);
    const error = ref(null);
    const treeRoots = computed(() => buildTree(folders.value));
    const selectedChildren = computed(() => selectedFolderId.value ? (childrenMap.value[selectedFolderId.value] ?? null) : null);
    async function fetchAll() {
        loading.value = true;
        error.value = null;
        try {
            folders.value = await folderService.getFolders();
        }
        catch (e) {
            error.value = e instanceof Error ? e.message : 'Failed to load folders';
        }
        finally {
            loading.value = false;
        }
    }
    async function selectFolder(id) {
        selectedFolderId.value = id;
        if (childrenMap.value[id])
            return; // client-side cache hit
        try {
            const result = await folderService.getChildren(id);
            childrenMap.value = { ...childrenMap.value, [id]: result };
        }
        catch (e) {
            error.value = e instanceof Error ? e.message : 'Failed to load folder contents';
        }
    }
    function clearSelection() {
        selectedFolderId.value = null;
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
    };
});
