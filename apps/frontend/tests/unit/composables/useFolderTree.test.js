import { describe, it, expect } from 'vitest';
import { ref } from 'vue';
import { buildTree, useFolderTree } from '../../../src/composables/useFolderTree';
const flat = [
    { id: 'root', name: 'Root', parentId: null, createdAt: '' },
    { id: 'child1', name: 'Alpha', parentId: 'root', createdAt: '' },
    { id: 'child2', name: 'Beta', parentId: 'root', createdAt: '' },
    { id: 'grand', name: 'Sub', parentId: 'child1', createdAt: '' },
];
describe('buildTree', () => {
    it('builds a nested tree from a flat array', () => {
        const roots = buildTree(flat);
        expect(roots).toHaveLength(1);
        expect(roots[0].id).toBe('root');
        expect(roots[0].children).toHaveLength(2);
    });
    it('sorts children alphabetically', () => {
        const roots = buildTree(flat);
        expect(roots[0].children[0].name).toBe('Alpha');
        expect(roots[0].children[1].name).toBe('Beta');
    });
    it('nests grandchildren correctly', () => {
        const roots = buildTree(flat);
        expect(roots[0].children[0].children[0].name).toBe('Sub');
    });
    it('returns empty array for empty input', () => {
        expect(buildTree([])).toEqual([]);
    });
});
describe('useFolderTree', () => {
    it('flatVisible starts with all root-level nodes closed', () => {
        const roots = ref(buildTree(flat));
        const { flatVisible } = useFolderTree(() => roots.value);
        expect(flatVisible.value).toHaveLength(1);
        expect(flatVisible.value[0].id).toBe('root');
    });
    it('toggle opens a node and exposes its children', () => {
        const roots = ref(buildTree(flat));
        const { flatVisible, toggle } = useFolderTree(() => roots.value);
        toggle('root');
        expect(flatVisible.value).toHaveLength(3); // root + child1 + child2
    });
    it('toggle closes an open node', () => {
        const roots = ref(buildTree(flat));
        const { flatVisible, toggle } = useFolderTree(() => roots.value);
        toggle('root');
        toggle('root');
        expect(flatVisible.value).toHaveLength(1);
    });
    it('depth reflects nesting level', () => {
        const roots = ref(buildTree(flat));
        const { flatVisible, toggle } = useFolderTree(() => roots.value);
        toggle('root');
        const child = flatVisible.value.find(n => n.id === 'child1');
        expect(child.depth).toBe(1);
    });
    it('hasChildren is true for nodes with children', () => {
        const roots = ref(buildTree(flat));
        const { flatVisible, toggle } = useFolderTree(() => roots.value);
        toggle('root');
        const withChild = flatVisible.value.find(n => n.id === 'child1');
        const leaf = flatVisible.value.find(n => n.id === 'child2');
        expect(withChild.hasChildren).toBe(true);
        expect(leaf.hasChildren).toBe(false);
    });
});
