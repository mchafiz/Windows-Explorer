import { onMounted, computed } from 'vue';
import { useFolderStore } from '../stores/folderStore';
import { useSearch } from '../composables/useSearch';
import SearchBar from '../components/SearchBar.vue';
import FolderTree from '../components/FolderTree.vue';
import ContentPanel from '../components/ContentPanel.vue';
const store = useFolderStore();
const { query, results, searching } = useSearch();
onMounted(() => store.fetchAll());
const isSearching = computed(() => query.value.trim().length > 0);
const displayFolders = computed(() => isSearching.value ? (results.value?.folders ?? []) : (store.selectedChildren?.folders ?? []));
const displayFiles = computed(() => isSearching.value ? (results.value?.files ?? []) : (store.selectedChildren?.files ?? []));
const breadcrumb = computed(() => {
    if (isSearching.value)
        return `Search: "${query.value}"`;
    if (!store.selectedFolderId)
        return '';
    const folder = store.folders.find(f => f.id === store.selectedFolderId);
    return folder?.name ?? '';
});
function onSelectFolder(id) {
    query.value = '';
    store.selectFolder(id);
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['sidebar-state']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "explorer" },
});
/** @type {[typeof SearchBar, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(SearchBar, new SearchBar({
    modelValue: (__VLS_ctx.query),
}));
const __VLS_1 = __VLS_0({
    modelValue: (__VLS_ctx.query),
}, ...__VLS_functionalComponentArgsRest(__VLS_0));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "explorer-body" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.aside, __VLS_intrinsicElements.aside)({
    ...{ class: "explorer-sidebar" },
    'data-testid': "sidebar",
});
if (__VLS_ctx.store.loading) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "sidebar-state" },
    });
}
else if (__VLS_ctx.store.error) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "sidebar-state error" },
    });
    (__VLS_ctx.store.error);
}
else {
    /** @type {[typeof FolderTree, ]} */ ;
    // @ts-ignore
    const __VLS_3 = __VLS_asFunctionalComponent(FolderTree, new FolderTree({
        ...{ 'onSelect': {} },
        roots: (__VLS_ctx.store.treeRoots),
        selectedId: (__VLS_ctx.store.selectedFolderId),
    }));
    const __VLS_4 = __VLS_3({
        ...{ 'onSelect': {} },
        roots: (__VLS_ctx.store.treeRoots),
        selectedId: (__VLS_ctx.store.selectedFolderId),
    }, ...__VLS_functionalComponentArgsRest(__VLS_3));
    let __VLS_6;
    let __VLS_7;
    let __VLS_8;
    const __VLS_9 = {
        onSelect: (__VLS_ctx.onSelectFolder)
    };
    var __VLS_5;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.main, __VLS_intrinsicElements.main)({
    ...{ class: "explorer-main" },
    'data-testid': "content-panel",
});
/** @type {[typeof ContentPanel, ]} */ ;
// @ts-ignore
const __VLS_10 = __VLS_asFunctionalComponent(ContentPanel, new ContentPanel({
    ...{ 'onNavigate': {} },
    breadcrumb: (__VLS_ctx.breadcrumb),
    folders: (__VLS_ctx.displayFolders),
    files: (__VLS_ctx.displayFiles),
    loading: (__VLS_ctx.searching),
}));
const __VLS_11 = __VLS_10({
    ...{ 'onNavigate': {} },
    breadcrumb: (__VLS_ctx.breadcrumb),
    folders: (__VLS_ctx.displayFolders),
    files: (__VLS_ctx.displayFiles),
    loading: (__VLS_ctx.searching),
}, ...__VLS_functionalComponentArgsRest(__VLS_10));
let __VLS_13;
let __VLS_14;
let __VLS_15;
const __VLS_16 = {
    onNavigate: (__VLS_ctx.onSelectFolder)
};
var __VLS_12;
/** @type {__VLS_StyleScopedClasses['explorer']} */ ;
/** @type {__VLS_StyleScopedClasses['explorer-body']} */ ;
/** @type {__VLS_StyleScopedClasses['explorer-sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-state']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-state']} */ ;
/** @type {__VLS_StyleScopedClasses['error']} */ ;
/** @type {__VLS_StyleScopedClasses['explorer-main']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            SearchBar: SearchBar,
            FolderTree: FolderTree,
            ContentPanel: ContentPanel,
            store: store,
            query: query,
            searching: searching,
            displayFolders: displayFolders,
            displayFiles: displayFiles,
            breadcrumb: breadcrumb,
            onSelectFolder: onSelectFolder,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
