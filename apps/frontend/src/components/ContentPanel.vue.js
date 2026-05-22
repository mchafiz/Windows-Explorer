import BreadcrumbBar from './BreadcrumbBar.vue';
import FolderGrid from './FolderGrid.vue';
import FileGrid from './FileGrid.vue';
const props = defineProps();
const emit = defineEmits();
const totalItems = () => props.folders.length + props.files.length;
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "content-panel" },
});
/** @type {[typeof BreadcrumbBar, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(BreadcrumbBar, new BreadcrumbBar({
    path: (__VLS_ctx.breadcrumb),
}));
const __VLS_1 = __VLS_0({
    path: (__VLS_ctx.breadcrumb),
}, ...__VLS_functionalComponentArgsRest(__VLS_0));
if (__VLS_ctx.loading) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "state-message" },
    });
}
else if (!__VLS_ctx.breadcrumb) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "state-message empty-state" },
    });
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "content-scroll" },
    });
    /** @type {[typeof FolderGrid, ]} */ ;
    // @ts-ignore
    const __VLS_3 = __VLS_asFunctionalComponent(FolderGrid, new FolderGrid({
        ...{ 'onSelect': {} },
        folders: (__VLS_ctx.folders),
    }));
    const __VLS_4 = __VLS_3({
        ...{ 'onSelect': {} },
        folders: (__VLS_ctx.folders),
    }, ...__VLS_functionalComponentArgsRest(__VLS_3));
    let __VLS_6;
    let __VLS_7;
    let __VLS_8;
    const __VLS_9 = {
        onSelect: (...[$event]) => {
            if (!!(__VLS_ctx.loading))
                return;
            if (!!(!__VLS_ctx.breadcrumb))
                return;
            __VLS_ctx.emit('navigate', $event);
        }
    };
    var __VLS_5;
    /** @type {[typeof FileGrid, ]} */ ;
    // @ts-ignore
    const __VLS_10 = __VLS_asFunctionalComponent(FileGrid, new FileGrid({
        files: (__VLS_ctx.files),
    }));
    const __VLS_11 = __VLS_10({
        files: (__VLS_ctx.files),
    }, ...__VLS_functionalComponentArgsRest(__VLS_10));
    if (!__VLS_ctx.folders.length && !__VLS_ctx.files.length) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: "state-message" },
        });
    }
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "status-bar" },
});
if (__VLS_ctx.breadcrumb) {
    (__VLS_ctx.totalItems());
    (__VLS_ctx.totalItems() !== 1 ? 's' : '');
    (__VLS_ctx.folders.length);
    (__VLS_ctx.folders.length !== 1 ? 's' : '');
    (__VLS_ctx.files.length);
    (__VLS_ctx.files.length !== 1 ? 's' : '');
}
else {
}
/** @type {__VLS_StyleScopedClasses['content-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['state-message']} */ ;
/** @type {__VLS_StyleScopedClasses['state-message']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['content-scroll']} */ ;
/** @type {__VLS_StyleScopedClasses['state-message']} */ ;
/** @type {__VLS_StyleScopedClasses['status-bar']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            BreadcrumbBar: BreadcrumbBar,
            FolderGrid: FolderGrid,
            FileGrid: FileGrid,
            emit: emit,
            totalItems: totalItems,
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
