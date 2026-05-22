import { ref, onMounted, onUnmounted } from 'vue';
import FolderNode from './FolderNode.vue';
import { useFolderTree } from '../composables/useFolderTree';
import { useVirtualScroll } from '../composables/useVirtualScroll';
const props = defineProps();
const emit = defineEmits();
const ITEM_HEIGHT = 32;
const containerRef = ref(null);
const containerHeight = ref(400);
const scrollTop = ref(0);
const { flatVisible, toggle } = useFolderTree(() => props.roots);
const { visibleItems } = useVirtualScroll(flatVisible, containerHeight, scrollTop, {
    itemHeight: ITEM_HEIGHT,
});
function onScroll(e) {
    scrollTop.value = e.target.scrollTop;
}
let ro = null;
onMounted(() => {
    if (!containerRef.value)
        return;
    containerHeight.value = containerRef.value.clientHeight;
    ro = new ResizeObserver(() => {
        containerHeight.value = containerRef.value?.clientHeight ?? 400;
    });
    ro.observe(containerRef.value);
});
onUnmounted(() => ro?.disconnect());
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ onScroll: (__VLS_ctx.onScroll) },
    ref: "containerRef",
    ...{ class: "folder-tree" },
});
/** @type {typeof __VLS_ctx.containerRef} */ ;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ style: ({ height: `${__VLS_ctx.visibleItems.totalHeight}px`, position: 'relative' }) },
});
for (const [{ item, offsetY }] of __VLS_getVForSourceType((__VLS_ctx.visibleItems.items))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (item.id),
        ...{ style: ({ position: 'absolute', top: `${offsetY}px`, width: '100%', height: `${__VLS_ctx.ITEM_HEIGHT}px` }) },
    });
    /** @type {[typeof FolderNode, ]} */ ;
    // @ts-ignore
    const __VLS_0 = __VLS_asFunctionalComponent(FolderNode, new FolderNode({
        ...{ 'onSelect': {} },
        ...{ 'onToggle': {} },
        node: (item),
        isSelected: (item.id === __VLS_ctx.selectedId),
    }));
    const __VLS_1 = __VLS_0({
        ...{ 'onSelect': {} },
        ...{ 'onToggle': {} },
        node: (item),
        isSelected: (item.id === __VLS_ctx.selectedId),
    }, ...__VLS_functionalComponentArgsRest(__VLS_0));
    let __VLS_3;
    let __VLS_4;
    let __VLS_5;
    const __VLS_6 = {
        onSelect: (...[$event]) => {
            __VLS_ctx.emit('select', $event);
        }
    };
    const __VLS_7 = {
        onToggle: (__VLS_ctx.toggle)
    };
    var __VLS_2;
}
/** @type {__VLS_StyleScopedClasses['folder-tree']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            FolderNode: FolderNode,
            emit: emit,
            ITEM_HEIGHT: ITEM_HEIGHT,
            containerRef: containerRef,
            toggle: toggle,
            visibleItems: visibleItems,
            onScroll: onScroll,
        };
    },
    __typeEmits: {},
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeEmits: {},
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
