import { ref, computed } from 'vue';
export function buildTree(folders) {
    const map = new Map();
    const roots = [];
    for (const f of folders) {
        map.set(f.id, { ...f, children: [], isOpen: false });
    }
    for (const node of map.values()) {
        if (node.parentId === null) {
            roots.push(node);
        }
        else {
            map.get(node.parentId)?.children.push(node);
        }
    }
    const sortNodes = (nodes) => {
        nodes.sort((a, b) => a.name.localeCompare(b.name));
        nodes.forEach(n => sortNodes(n.children));
        return nodes;
    };
    return sortNodes(roots);
}
export function useFolderTree(getRoots) {
    const openIds = ref(new Set());
    function toggle(id) {
        const next = new Set(openIds.value);
        if (next.has(id)) {
            next.delete(id);
        }
        else {
            next.add(id);
        }
        openIds.value = next;
    }
    const flatVisible = computed(() => {
        const result = [];
        function walk(nodes, depth) {
            for (const node of nodes) {
                const isOpen = openIds.value.has(node.id);
                result.push({
                    id: node.id,
                    name: node.name,
                    parentId: node.parentId,
                    depth,
                    hasChildren: node.children.length > 0,
                    isOpen,
                });
                if (isOpen)
                    walk(node.children, depth + 1);
            }
        }
        walk(getRoots(), 0);
        return result;
    });
    return { flatVisible, toggle, openIds };
}
