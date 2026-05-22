const props = defineProps();
const emit = defineEmits();
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['folder-node']} */ ;
/** @type {__VLS_StyleScopedClasses['folder-node']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.emit('select', __VLS_ctx.node.id);
        } },
    ...{ class: "folder-node" },
    ...{ class: ({ selected: __VLS_ctx.isSelected }) },
    ...{ style: ({ paddingLeft: `${8 + __VLS_ctx.node.depth * 16}px` }) },
});
if (__VLS_ctx.node.hasChildren) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.node.hasChildren))
                    return;
                __VLS_ctx.emit('toggle', __VLS_ctx.node.id);
            } },
        'data-testid': "toggle",
        ...{ class: "toggle-arrow" },
    });
    (__VLS_ctx.node.isOpen ? '▼' : '▶');
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span)({
        ...{ class: "toggle-spacer" },
    });
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "folder-icon" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "folder-name" },
});
(__VLS_ctx.node.name);
/** @type {__VLS_StyleScopedClasses['folder-node']} */ ;
/** @type {__VLS_StyleScopedClasses['toggle-arrow']} */ ;
/** @type {__VLS_StyleScopedClasses['toggle-spacer']} */ ;
/** @type {__VLS_StyleScopedClasses['folder-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['folder-name']} */ ;
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
