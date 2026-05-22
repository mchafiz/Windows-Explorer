import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import FolderNode from '../../../src/components/FolderNode.vue';
const leafNode = { id: 'n1', name: 'Documents', parentId: null, depth: 0, hasChildren: false, isOpen: false };
const parentNode = { id: 'n2', name: 'Work', parentId: 'n1', depth: 1, hasChildren: true, isOpen: false };
const openNode = { id: 'n3', name: 'Open', parentId: null, depth: 0, hasChildren: true, isOpen: true };
describe('FolderNode', () => {
    it('renders the folder name', () => {
        const wrapper = mount(FolderNode, { props: { node: leafNode, isSelected: false } });
        expect(wrapper.text()).toContain('Documents');
    });
    it('applies selected class when isSelected is true', () => {
        const wrapper = mount(FolderNode, { props: { node: leafNode, isSelected: true } });
        expect(wrapper.classes()).toContain('selected');
    });
    it('does not show toggle arrow for leaf nodes', () => {
        const wrapper = mount(FolderNode, { props: { node: leafNode, isSelected: false } });
        expect(wrapper.find('[data-testid="toggle"]').exists()).toBe(false);
    });
    it('shows ▶ arrow for closed parent node', () => {
        const wrapper = mount(FolderNode, { props: { node: parentNode, isSelected: false } });
        expect(wrapper.find('[data-testid="toggle"]').text()).toBe('▶');
    });
    it('shows ▼ arrow for open node', () => {
        const wrapper = mount(FolderNode, { props: { node: openNode, isSelected: false } });
        expect(wrapper.find('[data-testid="toggle"]').text()).toBe('▼');
    });
    it('emits select when clicked', async () => {
        const wrapper = mount(FolderNode, { props: { node: leafNode, isSelected: false } });
        await wrapper.trigger('click');
        expect(wrapper.emitted('select')?.[0]).toEqual(['n1']);
    });
    it('emits toggle when arrow clicked', async () => {
        const wrapper = mount(FolderNode, { props: { node: parentNode, isSelected: false } });
        await wrapper.find('[data-testid="toggle"]').trigger('click');
        expect(wrapper.emitted('toggle')?.[0]).toEqual(['n2']);
    });
    it('indents based on depth', () => {
        const wrapper = mount(FolderNode, { props: { node: parentNode, isSelected: false } });
        const style = wrapper.attributes('style') ?? '';
        expect(style).toContain('padding-left');
    });
});
