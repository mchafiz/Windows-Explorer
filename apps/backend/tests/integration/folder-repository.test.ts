import { describe, test, expect, beforeAll, afterAll } from 'bun:test'
import { PrismaClient } from '@prisma/client'
import { PrismaFolderRepository } from '../../src/infrastructure/repositories/PrismaFolderRepository'
import { PrismaFileRepository } from '../../src/infrastructure/repositories/PrismaFileRepository'

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.TEST_DATABASE_URL! } },
})

let parentId: string
let childId: string

describe('PrismaFolderRepository (integration)', () => {
  beforeAll(async () => {
    const parent = await prisma.folder.create({ data: { name: 'IntTestParent' } })
    const child  = await prisma.folder.create({ data: { name: 'IntTestChild', parentId: parent.id } })
    await prisma.file.create({
      data: { name: 'inttest.pdf', folderId: parent.id, mimeType: 'application/pdf', size: 1024 },
    })
    parentId = parent.id
    childId  = child.id
  })

  afterAll(async () => {
    await prisma.folder.deleteMany({ where: { name: { startsWith: 'IntTest' } } })
    await prisma.$disconnect()
  })

  test('findAll returns at least the seeded folders', async () => {
    const repo = new PrismaFolderRepository(prisma)
    const all = await repo.findAll()
    expect(all.length).toBeGreaterThanOrEqual(2)
    expect(all.every(f => typeof f.id === 'string')).toBe(true)
  })

  test('findById returns the correct folder', async () => {
    const repo = new PrismaFolderRepository(prisma)
    const result = await repo.findById(parentId)
    expect(result?.name).toBe('IntTestParent')
  })

  test('findById returns null for unknown id', async () => {
    const repo = new PrismaFolderRepository(prisma)
    const result = await repo.findById('00000000-0000-0000-0000-000000000000')
    expect(result).toBeNull()
  })

  test('findChildren returns only direct children', async () => {
    const repo = new PrismaFolderRepository(prisma)
    const children = await repo.findChildren(parentId)
    expect(children.length).toBe(1)
    expect(children[0].id).toBe(childId)
  })

  test('searchByName matches partial, case-insensitive', async () => {
    const repo = new PrismaFolderRepository(prisma)
    const results = await repo.searchByName('inttestpar')
    expect(results.some(f => f.id === parentId)).toBe(true)
  })

  test('PrismaFileRepository.findByFolderId returns files in folder', async () => {
    const repo = new PrismaFileRepository(prisma)
    const files = await repo.findByFolderId(parentId)
    expect(files.length).toBe(1)
    expect(files[0].name).toBe('inttest.pdf')
    expect(typeof files[0].size).toBe('number')
  })
})
