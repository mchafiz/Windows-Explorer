const __VLS_props = defineProps();
function iconFor(mimeType) {
    if (!mimeType)
        return '📄';
    if (mimeType.startsWith('image/'))
        return '🖼️';
    if (mimeType.startsWith('video/'))
        return '🎬';
    if (mimeType.startsWith('audio/'))
        return '🎵';
    if (mimeType === 'application/pdf')
        return '📕';
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel'))
        return '📊';
    if (mimeType.includes('word'))
        return '📝';
    return '📄';
}
function formatSize(bytes) {
    if (bytes === 0)
        return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['grid-item']} */ ;
// CSS variable injection 
// CSS variable injection end 
if (__VLS_ctx.files.length) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "file-grid" },
    });
    for (const [file] of __VLS_getVForSourceType((__VLS_ctx.files))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (file.id),
            ...{ class: "grid-item" },
            title: (`${file.name} — ${__VLS_ctx.formatSize(file.size)}`),
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "item-icon" },
        });
        (__VLS_ctx.iconFor(file.mimeType));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "item-name" },
        });
        (file.name);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "item-size" },
        });
        (__VLS_ctx.formatSize(file.size));
    }
}
/** @type {__VLS_StyleScopedClasses['file-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-item']} */ ;
/** @type {__VLS_StyleScopedClasses['item-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['item-name']} */ ;
/** @type {__VLS_StyleScopedClasses['item-size']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            iconFor: iconFor,
            formatSize: formatSize,
        };
    },
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
