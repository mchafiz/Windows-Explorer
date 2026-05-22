import { test, expect } from '@playwright/test'

test.describe('Windows Explorer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('[data-testid="sidebar"] .folder-node', { timeout: 5000 })
  })

  test('page loads and displays folder tree in left panel', async ({ page }) => {
    const nodes = page.locator('[data-testid="sidebar"] .folder-node')
    await expect(nodes).not.toHaveCount(0)
    await expect(page.locator('[data-testid="sidebar"]')).toContainText('Documents')
    await expect(page.locator('[data-testid="sidebar"]')).toContainText('Pictures')
    await expect(page.locator('[data-testid="sidebar"]')).toContainText('Videos')
  })

  test('right panel shows placeholder before selecting a folder', async ({ page }) => {
    const panel = page.locator('[data-testid="content-panel"]')
    await expect(panel).toContainText('Select a folder')
  })

  test('clicking a folder shows its subfolders and files in the right panel', async ({ page }) => {
    await page.locator('[data-testid="sidebar"] .folder-node', { hasText: 'Documents' }).click()

    const panel = page.locator('[data-testid="content-panel"]')
    await expect(panel).toContainText('Work', { timeout: 3000 })
    await expect(panel).toContainText('Personal')
    await expect(panel).toContainText('resume.pdf')
  })

  test('expanding a folder in the tree reveals its children', async ({ page }) => {
    const arrow = page.locator('[data-testid="sidebar"] .folder-node', { hasText: 'Documents' })
      .locator('[data-testid="toggle"]')
    await arrow.click()

    await expect(page.locator('[data-testid="sidebar"]')).toContainText('Work', { timeout: 2000 })
    await expect(page.locator('[data-testid="sidebar"]')).toContainText('Personal')
  })

  test('collapsing a folder hides its children in the tree', async ({ page }) => {
    const arrow = page.locator('[data-testid="sidebar"] .folder-node', { hasText: 'Documents' })
      .locator('[data-testid="toggle"]')

    await arrow.click()
    await expect(page.locator('[data-testid="sidebar"]')).toContainText('Work')

    await arrow.click()
    await expect(page.locator('[data-testid="sidebar"]')).not.toContainText('Work')
  })

  test('search returns matching folders and files', async ({ page }) => {
    await page.locator('[data-testid="search-input"]').fill('holiday')
    await page.waitForTimeout(400)

    const panel = page.locator('[data-testid="content-panel"]')
    await expect(panel).toContainText('Holiday', { timeout: 3000 })
  })
})
