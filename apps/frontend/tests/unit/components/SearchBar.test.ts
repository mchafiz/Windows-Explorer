import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SearchBar from '../../../src/components/SearchBar.vue'

describe('SearchBar', () => {
  it('renders an input field', () => {
    const wrapper = mount(SearchBar, { props: { modelValue: '' } })
    expect(wrapper.find('input').exists()).toBe(true)
  })

  it('emits update:modelValue on input', async () => {
    const wrapper = mount(SearchBar, { props: { modelValue: '' } })
    await wrapper.find('input').setValue('hello')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['hello'])
  })

  it('shows clear button when query is non-empty', () => {
    const wrapper = mount(SearchBar, { props: { modelValue: 'test' } })
    expect(wrapper.find('[data-testid="clear-btn"]').exists()).toBe(true)
  })

  it('hides clear button when query is empty', () => {
    const wrapper = mount(SearchBar, { props: { modelValue: '' } })
    expect(wrapper.find('[data-testid="clear-btn"]').exists()).toBe(false)
  })

  it('emits empty string when clear is clicked', async () => {
    const wrapper = mount(SearchBar, { props: { modelValue: 'test' } })
    await wrapper.find('[data-testid="clear-btn"]').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([''])
  })
})
