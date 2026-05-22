import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { prisma } from '../database/prisma'
import { PrismaFolderRepository } from '../repositories/PrismaFolderRepository'
import { PrismaFileRepository } from '../repositories/PrismaFileRepository'
import { InMemoryCache } from '../cache/InMemoryCache'
import { GetFolderTree } from '../../application/use-cases/GetFolderTree'
import { GetFolderChildren } from '../../application/use-cases/GetFolderChildren'
import { SearchItems } from '../../application/use-cases/SearchItems'
import { errorHandler } from './middleware/error-handler'
import { folderRoutes } from './routes/folder.routes'
import { searchRoutes } from './routes/search.routes'
import type { FolderDto } from '../../application/dtos/FolderDto'

export function createApp() {
  const folderRepo = new PrismaFolderRepository(prisma)
  const fileRepo   = new PrismaFileRepository(prisma)
  const cache      = new InMemoryCache<FolderDto[]>()

  const getFolderTree     = new GetFolderTree(folderRepo, cache)
  const getFolderChildren = new GetFolderChildren(folderRepo, fileRepo)
  const searchItems       = new SearchItems(folderRepo, fileRepo)

  return new Elysia()
    .use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(',') ?? true }))
    .use(errorHandler)
    .get('/health', () => ({ status: 'ok', timestamp: new Date().toISOString() }))
    .use(folderRoutes(getFolderTree, getFolderChildren))
    .use(searchRoutes(searchItems))
}
