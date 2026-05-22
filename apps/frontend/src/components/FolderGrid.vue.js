const __VLS_props = defineProps();
const emit = defineEmits();
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['grid-item']} */ ;
// CSS variable injection 
// CSS variable injection end 
if (__VLS_ctx.folders.length) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "folder-grid" },
    });
    for (const [folder] of __VLS_getVForSourceType((__VLS_ctx.folders))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ onDblclick: (...[$event]) => {
                    if (!(__VLS_ctx.folders.length))
                        return;
                    __VLS_ctx.emit('select', folder.id);
                } },
            key: (folder.id),
            ...{ class: "grid-item" },
            'data-testid': (`folder-item-${folder.id}`),
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "item-icon" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "item-name" },
            title: (folder.name),
        });
        (folder.name);
    }
}
/** @type {__VLS_StyleScopedClasses['folder-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-item']} */ ;
/** @type {__VLS_StyleScopedClasses['item-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['item-name']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            emit: emit,
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
