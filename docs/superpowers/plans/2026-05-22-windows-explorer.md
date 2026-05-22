# Windows Explorer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-stack Windows Explorer-like web app with a collapsible folder tree, split-panel UI, search, and hexagonal architecture.

**Architecture:** Bun monorepo with `apps/backend` (Elysia + Prisma + PostgreSQL, hexagonal/ports-and-adapters) and `apps/frontend` (Vue 3 + Pinia). Backend use cases depend only on port interfaces; Prisma adapters implement those ports. Frontend builds the folder tree client-side in O(n) and renders it with a custom virtual scroll.

**Tech Stack:** Bun · Elysia · Prisma · PostgreSQL · Vue 3 Composition API · Pinia · Vitest · Playwright · TypeScript

---

## File Map

```
windows-explorer/
├── package.json                                      # Bun workspace root
├── docker-compose.yml                                # PostgreSQL dev (port 5432)
├── docker-compose.test.yml                           # PostgreSQL test (port 5433)
├── .env.example
├── .gitignore
├── README.md
├── apps/
│   ├── backend/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── .env.example
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── seed.ts
│   │   ├── src/
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   ├── Folder.ts
│   │   │   │   │   └── File.ts
│   │   │   │   └── ports/
│   │   │   │       ├── IFolderRepository.ts
│   │   │   │       ├── IFileRepository.ts
│   │   │   │       └── ICache.ts
│   │   │   ├── application/
│   │   │   │   ├── dtos/
│   │   │   │   │   ├── FolderDto.ts
│   │   │   │   │   └── FileDto.ts
│   │   │   │   ├── errors/
│   │   │   │   │   └── AppError.ts
│   │   │   │   └── use-cases/
│   │   │   │       ├── GetFolderTree.ts
│   │   │   │       ├── GetFolderChildren.ts
│   │   │   │       └── SearchItems.ts
│   │   │   └── infrastructure/
│   │   │       ├── database/
│   │   │       │   └── prisma.ts
│   │   │       ├── repositories/
│   │   │       │   ├── PrismaFolderRepository.ts
│   │   │       │   └── PrismaFileRepository.ts
│   │   │       ├── cache/
│   │   │       │   └── InMemoryCache.ts
│   │   │       └── http/
│   │   │           ├── app.ts
│   │   │           ├── middleware/
│   │   │           │   └── error-handler.ts
│   │   │           └── routes/
│   │   │               ├── folder.routes.ts
│   │   │               └── search.routes.ts
│   │   ├── src/index.ts
│   │   └── tests/
│   │       ├── unit/
│   │       │   ├── application/
│   │       │   │   ├── get-folder-tree.usecase.test.ts
│   │       │   │   ├── get-folder-children.usecase.test.ts
│   │       │   │   └── search-items.usecase.test.ts
│   │       │   └── infrastructure/
│   │       │       └── in-memory-cache.test.ts
│   │       └── integration/
│   │           ├── folder-repository.test.ts
│   │           └── search-repository.test.ts
│   └── frontend/
│       ├── package.json
│       ├── tsconfig.json
│       ├── vite.config.ts
│       ├── vitest.config.ts
│       ├── playwright.config.ts
│       ├── index.html
│       ├── .env.example
│       ├── src/
│       │   ├── main.ts
│       │   ├── App.vue
│       │   ├── types/
│       │   │   └── folder.ts
│       │   ├── services/
│       │   │   └── folderService.ts
│       │   ├── stores/
│       │   │   └── folderStore.ts
│       │   ├── composables/
│       │   │   ├── useFolderTree.ts
│       │   │   ├── useVirtualScroll.ts
│       │   │   └── useSearch.ts
│       │   ├── components/
│       │   │   ├── SearchBar.vue
│       │   │   ├── FolderNode.vue
│       │   │   ├── FolderTree.vue
│       │   │   ├── BreadcrumbBar.vue
│       │   │   ├── FolderGrid.vue
│       │   │   ├── FileGrid.vue
│       │   │   └── ContentPanel.vue
│       │   └── views/
│       │       └── ExplorerView.vue
│       └── tests/
│           ├── unit/
│           │   ├── composables/
│           │   │   ├── useFolderTree.test.ts
│           │   │   ├── useVirtualScroll.test.ts
│           │   │   └── useSearch.test.ts
│           │   └── components/
│           │       ├── FolderNode.test.ts
│           │       └── SearchBar.test.ts
│           └── e2e/
│               └── explorer.spec.ts
```

---

## Task 1: Monorepo scaffold

**Files:**
- Create: `package.json`
- Create: `docker-compose.yml`
- Create: `docker-compose.test.yml`
- Create: `.env.example`

- [ ] **Step 1: Create workspace root `package.json`**

```json
{
  "name": "windows-explorer",
  "private": true,
  "workspaces": ["apps/*"],
  "scripts": {
    "dev": "bun run --filter '*' dev",
    "test": "bun run --filter '*' test",
    "build": "bun run --filter '*' build"
  }
}
```

- [ ] **Step 2: Create `docker-compose.yml`**

```yaml
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: explorer
      POSTGRES_PASSWORD: explorer
      POSTGRES_DB: explorer_dev
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

- [ ] **Step 3: Create `docker-compose.test.yml`**

```yaml
services:
  db_test:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: explorer
      POSTGRES_PASSWORD: explorer
      POSTGRES_DB: explorer_test
    ports:
      - "5433:5432"
```

- [ ] **Step 4: Create `.env.example`**

```
# Copy to .env and fill in values
DATABASE_URL=postgresql://explorer:explorer@localhost:5432/explorer_dev
TEST_DATABASE_URL=postgresql://explorer:explorer@localhost:5433/explorer_test
PORT=3000
```

- [ ] **Step 5: Create `.gitignore`** (at root, replaces the one already committed)

```
node_modules/
.env
.env.*
dist/
.superpowers/
*.log
prisma/migrations/
```

- [ ] **Step 6: Start dev database**

```bash
docker compose up -d
```

Expected: `Container windows-explorer-db-1 Started`

- [ ] **Step 7: Commit**

```bash
git add package.json docker-compose.yml docker-compose.test.yml .env.example .gitignore
git commit -m "chore: monorepo scaffold with Bun workspaces and Docker"
```

---

## Task 2: Backend project setup

**Files:**
- Create: `apps/backend/package.json`
- Create: `apps/backend/tsconfig.json`
- Create: `apps/backend/.env.example`

- [ ] **Step 1: Create `apps/backend/package.json`**

```json
{
  "name": "@windows-explorer/backend",
  "version": "1.0.0",
  "scripts": {
    "dev": "bun run --watch src/index.ts",
    "start": "bun run src/index.ts",
    "test": "bun test tests/unit",
    "test:integration": "DATABASE_URL=$TEST_DATABASE_URL bun test tests/integration",
    "db:generate": "bunx prisma generate",
    "db:migrate": "bunx prisma migrate dev",
    "db:seed": "bun run prisma/seed.ts",
    "db:reset:test": "TEST_DATABASE_URL=$TEST_DATABASE_URL bunx prisma migrate reset --force --skip-seed"
  },
  "dependencies": {
    "@elysiajs/cors": "^1.1.0",
    "@prisma/client": "^5.20.0",
    "elysia": "^1.1.0"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "prisma": "^5.20.0",
    "typescript": "^5.7.0"
  }
}
```

- [ ] **Step 2: Create `apps/backend/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "skipLibCheck": true,
    "outDir": "dist",
    "rootDir": "src",
    "paths": {
      "@domain/*": ["src/domain/*"],
      "@application/*": ["src/application/*"],
      "@infrastructure/*": ["src/infrastructure/*"]
    }
  },
  "include": ["src", "tests", "prisma"]
}
```

- [ ] **Step 3: Create `apps/backend/.env.example`**

```
DATABASE_URL=postgresql://explorer:explorer@localhost:5432/explorer_dev
TEST_DATABASE_URL=postgresql://explorer:explorer@localhost:5433/explorer_test
PORT=3000
ALLOWED_ORIGINS=http://localhost:5173
```

- [ ] **Step 4: Install backend dependencies**

```bash
cd apps/backend && bun install
```

Expected: `bun install v1.x [...] done`

- [ ] **Step 5: Copy env and commit**

```bash
cp apps/backend/.env.example apps/backend/.env
git add apps/backend/
git commit -m "chore: backend project setup — Elysia, Prisma, TypeScript"
```

---

## Task 3: Prisma schema and migration

**Files:**
- Create: `apps/backend/prisma/schema.prisma`
- Create: `apps/backend/prisma/seed.ts`

- [ ] **Step 1: Create `apps/backend/prisma/schema.prisma`**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Folder {
  id        String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name      String   @db.VarChar(255)
  parentId  String?  @map("parent_id") @db.Uuid
  createdAt DateTime @default(now()) @map("created_at") @db.Timestamptz
  updatedAt DateTime @updatedAt @map("updated_at") @db.Timestamptz

  parent   Folder?  @relation("FolderToFolder", fields: [parentId], references: [id], onDelete: Cascade)
  children Folder[] @relation("FolderToFolder")
  files    File[]

  @@index([parentId])
  @@map("folders")
}

model File {
  id        String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name      String   @db.VarChar(255)
  folderId  String   @map("folder_id") @db.Uuid
  mimeType  String?  @map("mime_type") @db.VarChar(100)
  size      BigInt   @default(0)
  createdAt DateTime @default(now()) @map("created_at") @db.Timestamptz
  updatedAt DateTime @updatedAt @map("updated_at") @db.Timestamptz

  folder Folder @relation(fields: [folderId], references: [id], onDelete: Cascade)

  @@index([folderId])
  @@map("files")
}
```

- [ ] **Step 2: Generate Prisma client and run migration**

```bash
cd apps/backend
bunx prisma generate
bunx prisma migrate dev --name init
```

Expected: `✔ Generated Prisma Client` and `Your database is now in sync with your schema.`

- [ ] **Step 3: Add trigram indexes via raw SQL migration**

Create `apps/backend/prisma/migrations/<timestamp>_init/migration.sql` already exists from the step above. Open it and append at the bottom:

```sql
-- Trigram extension + GIN indexes for fast ILIKE search
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_folders_name_trgm ON folders USING GIN(name gin_trgm_ops);
CREATE INDEX idx_files_name_trgm ON files USING GIN(name gin_trgm_ops);
```

Then apply:

```bash
bunx prisma migrate resolve --applied "$(ls prisma/migrations | tail -1)"
# Or simply re-run dev migration which applies the SQL
bunx prisma db push
```

Alternative (simpler for dev): run the SQL directly:

```bash
bunx prisma db execute --stdin <<'SQL'
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_folders_name_trgm ON folders USING GIN(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_files_name_trgm ON files USING GIN(name gin_trgm_ops);
SQL
```

Expected: no errors.

- [ ] **Step 4: Create `apps/backend/prisma/seed.ts`**

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const documents = await prisma.folder.create({ data: { name: 'Documents' } })
  const pictures  = await prisma.folder.create({ data: { name: 'Pictures' } })
  const videos    = await prisma.folder.create({ data: { name: 'Videos' } })

  const work     = await prisma.folder.create({ data: { name: 'Work',     parentId: documents.id } })
  const personal = await prisma.folder.create({ data: { name: 'Personal', parentId: documents.id } })

  await prisma.folder.createMany({
    data: [
      { name: 'Projects', parentId: work.id },
      { name: 'Reports',  parentId: work.id },
      { name: 'Holidays', parentId: pictures.id },
      { name: 'Family',   parentId: pictures.id },
      { name: 'Lectures', parentId: videos.id },
    ],
  })

  await prisma.file.createMany({
    data: [
      { name: 'resume.pdf',    folderId: documents.id, mimeType: 'application/pdf',       size: 245_000 },
      { name: 'budget.xlsx',   folderId: work.id,      mimeType: 'application/vnd.ms-excel', size: 48_000 },
      { name: 'vacation.jpg',  folderId: pictures.id,  mimeType: 'image/jpeg',             size: 3_200_000 },
      { name: 'portrait.png',  folderId: personal.id,  mimeType: 'image/png',              size: 1_500_000 },
      { name: 'lecture01.mp4', folderId: videos.id,    mimeType: 'video/mp4',              size: 450_000_000 },
    ],
  })

  console.log('✅ Seed complete')
}

main().catch(console.error).finally(() => prisma.$disconnect())
```

- [ ] **Step 5: Run seed**

```bash
cd apps/backend && bun run db:seed
```

Expected: `✅ Seed complete`

- [ ] **Step 6: Commit**

```bash
git add apps/backend/prisma/
git commit -m "feat(db): Prisma schema, migration, trigram indexes, seed data"
```

---

## Task 4: Domain entities

**Files:**
- Create: `apps/backend/src/domain/entities/Folder.ts`
- Create: `apps/backend/src/domain/entities/File.ts`

- [ ] **Step 1: Create `apps/backend/src/domain/entities/Folder.ts`**

```typescript
export interface Folder {
  id: string
  name: string
  parentId: string | null
  createdAt: Date
  updatedAt: Date
}
```

- [ ] **Step 2: Create `apps/backend/src/domain/entities/File.ts`**

```typescript
export interface File {
  id: string
  name: string
  folderId: string
  mimeType: string | null
  size: number
  createdAt: Date
  updatedAt: Date
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/backend/src/domain/entities/
git commit -m "feat(domain): Folder and File entities"
```

---

## Task 5: Domain port interfaces

**Files:**
- Create: `apps/backend/src/domain/ports/IFolderRepository.ts`
- Create: `apps/backend/src/domain/ports/IFileRepository.ts`
- Create: `apps/backend/src/domain/ports/ICache.ts`

- [ ] **Step 1: Create `apps/backend/src/domain/ports/IFolderRepository.ts`**

```typescript
import type { Folder } from '../entities/Folder'

export interface IFolderRepository {
  findAll(): Promise<Folder[]>
  findById(id: string): Promise<Folder | null>
  findChildren(parentId: string): Promise<Folder[]>
  searchByName(query: string): Promise<Folder[]>
}
```

- [ ] **Step 2: Create `apps/backend/src/domain/ports/IFileRepository.ts`**

```typescript
import type { File } from '../entities/File'

export interface IFileRepository {
  findByFolderId(folderId: string): Promise<File[]>
  searchByName(query: string): Promise<File[]>
}
```

- [ ] **Step 3: Create `apps/backend/src/domain/ports/ICache.ts`**

```typescript
export interface ICache<T> {
  get(key: string): T | null
  set(key: string, value: T, ttlMs?: number): void
  invalidate(key: string): void
  clear(): void
}
```

- [ ] **Step 4: Commit**

```bash
git add apps/backend/src/domain/ports/
git commit -m "feat(domain): port interfaces — IFolderRepository, IFileRepository, ICache"
```

---

## Task 6: Application DTOs and AppError

**Files:**
- Create: `apps/backend/src/application/dtos/FolderDto.ts`
- Create: `apps/backend/src/application/dtos/FileDto.ts`
- Create: `apps/backend/src/application/errors/AppError.ts`

- [ ] **Step 1: Create `apps/backend/src/application/dtos/FolderDto.ts`**

```typescript
export interface FolderDto {
  id: string
  name: string
  parentId: string | null
  createdAt: string
}
```

- [ ] **Step 2: Create `apps/backend/src/application/dtos/FileDto.ts`**

```typescript
export interface FileDto {
  id: string
  name: string
  folderId: string
  mimeType: string | null
  size: number
  createdAt: string
}
```

- [ ] **Step 3: Create `apps/backend/src/application/errors/AppError.ts`**

```typescript
export class AppError extends Error {
  constructor(
    public readonly code: string,
    public readonly message: string,
    public readonly statusCode: number,
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export const Errors = {
  folderNotFound: (id: string) =>
    new AppError('FOLDER_NOT_FOUND', `Folder '${id}' not found`, 404),

  invalidSearchQuery: () =>
    new AppError('INVALID_SEARCH_QUERY', 'Search query must not be empty', 400),
}
```

- [ ] **Step 4: Commit**

```bash
git add apps/backend/src/application/
git commit -m "feat(application): DTOs and AppError"
```

---

## Task 7: GetFolderTree use case (TDD)

**Files:**
- Create: `apps/backend/tests/unit/application/get-folder-tree.usecase.test.ts`
- Create: `apps/backend/src/application/use-cases/GetFolderTree.ts`

- [ ] **Step 1: Write the failing test**

`apps/backend/tests/unit/application/get-folder-tree.usecase.test.ts`:

```typescript
import { describe, test, expect, mock, beforeEach } from 'bun:test'
import { GetFolderTree } from '../../../src/application/use-cases/GetFolderTree'
import type { IFolderRepository } from '../../../src/domain/ports/IFolderRepository'
import type { ICache } from '../../../src/domain/ports/ICache'
import type { FolderDto } from '../../../src/application/dtos/FolderDto'

const mockFolders = [
  { id: 'a1', name: 'Documents', parentId: null, createdAt: new Date('2024-01-01'), updatedAt: new Date('2024-01-01') },
  { id: 'b2', name: 'Work', parentId: 'a1', createdAt: new Date('2024-01-02'), updatedAt: new Date('2024-01-02') },
]

function makeRepo(overrides?: Partial<IFolderRepository>): IFolderRepository {
  return {
    findAll: mock(() => Promise.resolve(mockFolders)),
    findById: mock(() => Promise.resolve(null)),
    findChildren: mock(() => Promise.resolve([])),
    searchByName: mock(() => Promise.resolve([])),
    ...overrides,
  }
}

function makeCache(): ICache<FolderDto[]> {
  const store = new Map<string, FolderDto[]>()
  return {
    get: (key) => store.get(key) ?? null,
    set: (key, value) => { store.set(key, value) },
    invalidate: (key) => { store.delete(key) },
    clear: () => { store.clear() },
  }
}

describe('GetFolderTree', () => {
  let repo: IFolderRepository
  let cache: ICache<FolderDto[]>
  let useCase: GetFolderTree

  beforeEach(() => {
    repo = makeRepo()
    cache = makeCache()
    useCase = new GetFolderTree(repo, cache)
  })

  test('returns all folders as DTOs', async () => {
    const result = await useCase.execute()
    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({
      id: 'a1',
      name: 'Documents',
      parentId: null,
      createdAt: '2024-01-01T00:00:00.000Z',
    })
  })

  test('caches result on first call', async () => {
    await useCase.execute()
    await useCase.execute()
    expect(repo.findAll).toHaveBeenCalledTimes(1)
  })

  test('hits repo again after cache miss (fresh cache)', async () => {
    const freshCache = makeCache()
    const uc = new GetFolderTree(repo, freshCache)
    await uc.execute()
    expect(repo.findAll).toHaveBeenCalledTimes(1)
  })
})
```

- [ ] **Step 2: Run test — verify it fails**

```bash
cd apps/backend && bun test tests/unit/application/get-folder-tree.usecase.test.ts
```

Expected: `error: Cannot find module '../../../src/application/use-cases/GetFolderTree'`

- [ ] **Step 3: Implement `apps/backend/src/application/use-cases/GetFolderTree.ts`**

```typescript
import type { IFolderRepository } from '../../domain/ports/IFolderRepository'
import type { ICache } from '../../domain/ports/ICache'
import type { FolderDto } from '../dtos/FolderDto'
import type { Folder } from '../../domain/entities/Folder'

const CACHE_KEY = 'all-folders'
const DEFAULT_TTL_MS = 30_000

export class GetFolderTree {
  constructor(
    private readonly folderRepo: IFolderRepository,
    private readonly cache: ICache<FolderDto[]>,
  ) {}

  async execute(): Promise<FolderDto[]> {
    const cached = this.cache.get(CACHE_KEY)
    if (cached) return cached

    const folders = await this.folderRepo.findAll()
    const dtos = folders.map(this.toDto)
    this.cache.set(CACHE_KEY, dtos, DEFAULT_TTL_MS)
    return dtos
  }

  private toDto(folder: Folder): FolderDto {
    return {
      id: folder.id,
      name: folder.name,
      parentId: folder.parentId,
      createdAt: folder.createdAt.toISOString(),
    }
  }
}
```

- [ ] **Step 4: Run test — verify it passes**

```bash
cd apps/backend && bun test tests/unit/application/get-folder-tree.usecase.test.ts
```

Expected: `3 pass, 0 fail`

- [ ] **Step 5: Commit**

```bash
git add apps/backend/src/application/use-cases/GetFolderTree.ts apps/backend/tests/unit/application/get-folder-tree.usecase.test.ts
git commit -m "feat(application): GetFolderTree use case with cache"
```

---

## Task 8: GetFolderChildren use case (TDD)

**Files:**
- Create: `apps/backend/tests/unit/application/get-folder-children.usecase.test.ts`
- Create: `apps/backend/src/application/use-cases/GetFolderChildren.ts`

- [ ] **Step 1: Write the failing test**

`apps/backend/tests/unit/application/get-folder-children.usecase.test.ts`:

```typescript
import { describe, test, expect, mock } from 'bun:test'
import { GetFolderChildren } from '../../../src/application/use-cases/GetFolderChildren'
import { AppError } from '../../../src/application/errors/AppError'
import type { IFolderRepository } from '../../../src/domain/ports/IFolderRepository'
import type { IFileRepository } from '../../../src/domain/ports/IFileRepository'

const parentFolder = {
  id: 'parent-1', name: 'Documents', parentId: null,
  createdAt: new Date('2024-01-01'), updatedAt: new Date('2024-01-01'),
}
const childFolder = {
  id: 'child-1', name: 'Work', parentId: 'parent-1',
  createdAt: new Date('2024-01-02'), updatedAt: new Date('2024-01-02'),
}
const childFile = {
  id: 'file-1', name: 'resume.pdf', folderId: 'parent-1',
  mimeType: 'application/pdf', size: 245_000,
  createdAt: new Date('2024-01-03'), updatedAt: new Date('2024-01-03'),
}

function makeRepo(found: boolean): IFolderRepository {
  return {
    findAll: mock(() => Promise.resolve([])),
    findById: mock(() => Promise.resolve(found ? parentFolder : null)),
    findChildren: mock(() => Promise.resolve([childFolder])),
    searchByName: mock(() => Promise.resolve([])),
  }
}

function makeFileRepo(): IFileRepository {
  return {
    findByFolderId: mock(() => Promise.resolve([childFile])),
    searchByName: mock(() => Promise.resolve([])),
  }
}

describe('GetFolderChildren', () => {
  test('returns subfolders and files for a valid folder', async () => {
    const useCase = new GetFolderChildren(makeRepo(true), makeFileRepo())
    const result = await useCase.execute('parent-1')

    expect(result.folders).toHaveLength(1)
    expect(result.folders[0].name).toBe('Work')
    expect(result.files).toHaveLength(1)
    expect(result.files[0].name).toBe('resume.pdf')
    expect(result.files[0].size).toBe(245_000)
  })

  test('throws AppError when folder does not exist', async () => {
    const useCase = new GetFolderChildren(makeRepo(false), makeFileRepo())
    await expect(useCase.execute('ghost-id')).rejects.toBeInstanceOf(AppError)
  })

  test('fetches folders and files in parallel', async () => {
    const folderRepo = makeRepo(true)
    const fileRepo = makeFileRepo()
    const useCase = new GetFolderChildren(folderRepo, fileRepo)
    await useCase.execute('parent-1')
    expect(folderRepo.findChildren).toHaveBeenCalledWith('parent-1')
    expect(fileRepo.findByFolderId).toHaveBeenCalledWith('parent-1')
  })
})
```

- [ ] **Step 2: Run — verify it fails**

```bash
cd apps/backend && bun test tests/unit/application/get-folder-children.usecase.test.ts
```

Expected: `error: Cannot find module '../../../src/application/use-cases/GetFolderChildren'`

- [ ] **Step 3: Implement `apps/backend/src/application/use-cases/GetFolderChildren.ts`**

```typescript
import type { IFolderRepository } from '../../domain/ports/IFolderRepository'
import type { IFileRepository } from '../../domain/ports/IFileRepository'
import type { FolderDto } from '../dtos/FolderDto'
import type { FileDto } from '../dtos/FileDto'
import type { Folder } from '../../domain/entities/Folder'
import type { File } from '../../domain/entities/File'
import { Errors } from '../errors/AppError'

export interface ChildrenResult {
  folders: FolderDto[]
  files: FileDto[]
}

export class GetFolderChildren {
  constructor(
    private readonly folderRepo: IFolderRepository,
    private readonly fileRepo: IFileRepository,
  ) {}

  async execute(folderId: string): Promise<ChildrenResult> {
    const folder = await this.folderRepo.findById(folderId)
    if (!folder) throw Errors.folderNotFound(folderId)

    const [folders, files] = await Promise.all([
      this.folderRepo.findChildren(folderId),
      this.fileRepo.findByFolderId(folderId),
    ])

    return {
      folders: folders.map(this.folderToDto),
      files: files.map(this.fileToDto),
    }
  }

  private folderToDto(f: Folder): FolderDto {
    return { id: f.id, name: f.name, parentId: f.parentId, createdAt: f.createdAt.toISOString() }
  }

  private fileToDto(f: File): FileDto {
    return {
      id: f.id,
      name: f.name,
      folderId: f.folderId,
      mimeType: f.mimeType,
      size: f.size,
      createdAt: f.createdAt.toISOString(),
    }
  }
}
```

- [ ] **Step 4: Run — verify it passes**

```bash
cd apps/backend && bun test tests/unit/application/get-folder-children.usecase.test.ts
```

Expected: `3 pass, 0 fail`

- [ ] **Step 5: Commit**

```bash
git add apps/backend/src/application/use-cases/GetFolderChildren.ts apps/backend/tests/unit/application/get-folder-children.usecase.test.ts
git commit -m "feat(application): GetFolderChildren use case"
```

---

## Task 9: SearchItems use case (TDD)

**Files:**
- Create: `apps/backend/tests/unit/application/search-items.usecase.test.ts`
- Create: `apps/backend/src/application/use-cases/SearchItems.ts`

- [ ] **Step 1: Write the failing test**

`apps/backend/tests/unit/application/search-items.usecase.test.ts`:

```typescript
import { describe, test, expect, mock } from 'bun:test'
import { SearchItems } from '../../../src/application/use-cases/SearchItems'
import { AppError } from '../../../src/application/errors/AppError'
import type { IFolderRepository } from '../../../src/domain/ports/IFolderRepository'
import type { IFileRepository } from '../../../src/domain/ports/IFileRepository'

const folder = {
  id: 'f1', name: 'Holiday Photos', parentId: null,
  createdAt: new Date('2024-01-01'), updatedAt: new Date('2024-01-01'),
}
const file = {
  id: 'fi1', name: 'holiday.jpg', folderId: 'f1',
  mimeType: 'image/jpeg', size: 500_000,
  createdAt: new Date('2024-01-02'), updatedAt: new Date('2024-01-02'),
}

const folderRepo: IFolderRepository = {
  findAll: mock(() => Promise.resolve([])),
  findById: mock(() => Promise.resolve(null)),
  findChildren: mock(() => Promise.resolve([])),
  searchByName: mock(() => Promise.resolve([folder])),
}
const fileRepo: IFileRepository = {
  findByFolderId: mock(() => Promise.resolve([])),
  searchByName: mock(() => Promise.resolve([file])),
}

describe('SearchItems', () => {
  test('returns folders and files matching the query', async () => {
    const useCase = new SearchItems(folderRepo, fileRepo)
    const result = await useCase.execute('holiday')

    expect(result.folders).toHaveLength(1)
    expect(result.folders[0].name).toBe('Holiday Photos')
    expect(result.files).toHaveLength(1)
    expect(result.files[0].name).toBe('holiday.jpg')
    expect(result.meta.query).toBe('holiday')
    expect(result.meta.total).toBe(2)
  })

  test('type=folders skips file search', async () => {
    const fileRepoSpy: IFileRepository = {
      findByFolderId: mock(() => Promise.resolve([])),
      searchByName: mock(() => Promise.resolve([])),
    }
    const useCase = new SearchItems(folderRepo, fileRepoSpy)
    await useCase.execute('holiday', 'folders')
    expect(fileRepoSpy.searchByName).not.toHaveBeenCalled()
  })

  test('type=files skips folder search', async () => {
    const folderRepoSpy: IFolderRepository = {
      findAll: mock(() => Promise.resolve([])),
      findById: mock(() => Promise.resolve(null)),
      findChildren: mock(() => Promise.resolve([])),
      searchByName: mock(() => Promise.resolve([])),
    }
    const useCase = new SearchItems(folderRepoSpy, fileRepo)
    await useCase.execute('holiday', 'files')
    expect(folderRepoSpy.searchByName).not.toHaveBeenCalled()
  })

  test('throws on empty query', async () => {
    const useCase = new SearchItems(folderRepo, fileRepo)
    await expect(useCase.execute('  ')).rejects.toBeInstanceOf(AppError)
  })
})
```

- [ ] **Step 2: Run — verify it fails**

```bash
cd apps/backend && bun test tests/unit/application/search-items.usecase.test.ts
```

Expected: `error: Cannot find module '../../../src/application/use-cases/SearchItems'`

- [ ] **Step 3: Implement `apps/backend/src/application/use-cases/SearchItems.ts`**

```typescript
import type { IFolderRepository } from '../../domain/ports/IFolderRepository'
import type { IFileRepository } from '../../domain/ports/IFileRepository'
import type { FolderDto } from '../dtos/FolderDto'
import type { FileDto } from '../dtos/FileDto'
import type { Folder } from '../../domain/entities/Folder'
import type { File } from '../../domain/entities/File'
import { Errors } from '../errors/AppError'

export type SearchType = 'all' | 'folders' | 'files'

export interface SearchResult {
  folders: FolderDto[]
  files: FileDto[]
  meta: { query: string; total: number }
}

export class SearchItems {
  constructor(
    private readonly folderRepo: IFolderRepository,
    private readonly fileRepo: IFileRepository,
  ) {}

  async execute(query: string, type: SearchType = 'all'): Promise<SearchResult> {
    if (!query.trim()) throw Errors.invalidSearchQuery()

    const [folders, files] = await Promise.all([
      type !== 'files' ? this.folderRepo.searchByName(query) : Promise.resolve([]),
      type !== 'folders' ? this.fileRepo.searchByName(query) : Promise.resolve([]),
    ])

    const folderDtos = folders.map((f: Folder): FolderDto => ({
      id: f.id, name: f.name, parentId: f.parentId, createdAt: f.createdAt.toISOString(),
    }))

    const fileDtos = files.map((f: File): FileDto => ({
      id: f.id, name: f.name, folderId: f.folderId,
      mimeType: f.mimeType, size: f.size, createdAt: f.createdAt.toISOString(),
    }))

    return {
      folders: folderDtos,
      files: fileDtos,
      meta: { query, total: folderDtos.length + fileDtos.length },
    }
  }
}
```

- [ ] **Step 4: Run — verify it passes**

```bash
cd apps/backend && bun test tests/unit/application/search-items.usecase.test.ts
```

Expected: `4 pass, 0 fail`

- [ ] **Step 5: Run all unit tests**

```bash
cd apps/backend && bun test tests/unit
```

Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add apps/backend/src/application/use-cases/SearchItems.ts apps/backend/tests/unit/application/search-items.usecase.test.ts
git commit -m "feat(application): SearchItems use case"
```

---

## Task 10: InMemoryCache (TDD)

**Files:**
- Create: `apps/backend/tests/unit/infrastructure/in-memory-cache.test.ts`
- Create: `apps/backend/src/infrastructure/cache/InMemoryCache.ts`

- [ ] **Step 1: Write the failing test**

`apps/backend/tests/unit/infrastructure/in-memory-cache.test.ts`:

```typescript
import { describe, test, expect } from 'bun:test'
import { InMemoryCache } from '../../../src/infrastructure/cache/InMemoryCache'

describe('InMemoryCache', () => {
  test('returns null for unknown key', () => {
    const cache = new InMemoryCache<string>()
    expect(cache.get('missing')).toBeNull()
  })

  test('stores and retrieves a value', () => {
    const cache = new InMemoryCache<string>()
    cache.set('key', 'value')
    expect(cache.get('key')).toBe('value')
  })

  test('returns null after TTL expires', async () => {
    const cache = new InMemoryCache<string>()
    cache.set('key', 'value', 10) // 10ms TTL
    await Bun.sleep(20)
    expect(cache.get('key')).toBeNull()
  })

  test('invalidate removes a specific key', () => {
    const cache = new InMemoryCache<string>()
    cache.set('a', 'one')
    cache.set('b', 'two')
    cache.invalidate('a')
    expect(cache.get('a')).toBeNull()
    expect(cache.get('b')).toBe('two')
  })

  test('clear removes all keys', () => {
    const cache = new InMemoryCache<string>()
    cache.set('a', 'one')
    cache.set('b', 'two')
    cache.clear()
    expect(cache.get('a')).toBeNull()
    expect(cache.get('b')).toBeNull()
  })
})
```

- [ ] **Step 2: Run — verify it fails**

```bash
cd apps/backend && bun test tests/unit/infrastructure/in-memory-cache.test.ts
```

Expected: `error: Cannot find module '../../../src/infrastructure/cache/InMemoryCache'`

- [ ] **Step 3: Implement `apps/backend/src/infrastructure/cache/InMemoryCache.ts`**

```typescript
import type { ICache } from '../../domain/ports/ICache'

interface CacheEntry<T> {
  value: T
  expiresAt: number
}

export class InMemoryCache<T> implements ICache<T> {
  private readonly store = new Map<string, CacheEntry<T>>()

  get(key: string): T | null {
    const entry = this.store.get(key)
    if (!entry) return null
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key)
      return null
    }
    return entry.value
  }

  set(key: string, value: T, ttlMs = 30_000): void {
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs })
  }

  invalidate(key: string): void {
    this.store.delete(key)
  }

  clear(): void {
    this.store.clear()
  }
}
```

- [ ] **Step 4: Run — verify it passes**

```bash
cd apps/backend && bun test tests/unit/infrastructure/in-memory-cache.test.ts
```

Expected: `5 pass, 0 fail`

- [ ] **Step 5: Commit**

```bash
git add apps/backend/src/infrastructure/cache/ apps/backend/tests/unit/infrastructure/
git commit -m "feat(infrastructure): InMemoryCache with TTL"
```

---

## Task 11: Prisma repositories (integration tests)

**Files:**
- Create: `apps/backend/src/infrastructure/database/prisma.ts`
- Create: `apps/backend/src/infrastructure/repositories/PrismaFolderRepository.ts`
- Create: `apps/backend/src/infrastructure/repositories/PrismaFileRepository.ts`
- Create: `apps/backend/tests/integration/folder-repository.test.ts`
- Create: `apps/backend/tests/integration/search-repository.test.ts`

- [ ] **Step 1: Start the test database**

```bash
docker compose -f docker-compose.test.yml up -d
```

Expected: `Container windows-explorer-db_test-1 Started`

- [ ] **Step 2: Run test DB migration**

```bash
cd apps/backend
TEST_DATABASE_URL=postgresql://explorer:explorer@localhost:5433/explorer_test \
  bunx prisma migrate deploy
```

Expected: `All migrations have been successfully applied.`

- [ ] **Step 3: Create `apps/backend/src/infrastructure/database/prisma.ts`**

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
```

- [ ] **Step 4: Create `apps/backend/src/infrastructure/repositories/PrismaFolderRepository.ts`**

```typescript
import type { PrismaClient } from '@prisma/client'
import type { IFolderRepository } from '../../domain/ports/IFolderRepository'
import type { Folder } from '../../domain/entities/Folder'

export class PrismaFolderRepository implements IFolderRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(): Promise<Folder[]> {
    const rows = await this.prisma.folder.findMany({ orderBy: { name: 'asc' } })
    return rows.map(this.toDomain)
  }

  async findById(id: string): Promise<Folder | null> {
    const row = await this.prisma.folder.findUnique({ where: { id } })
    return row ? this.toDomain(row) : null
  }

  async findChildren(parentId: string): Promise<Folder[]> {
    const rows = await this.prisma.folder.findMany({
      where: { parentId },
      orderBy: { name: 'asc' },
    })
    return rows.map(this.toDomain)
  }

  async searchByName(query: string): Promise<Folder[]> {
    const rows = await this.prisma.folder.findMany({
      where: { name: { contains: query, mode: 'insensitive' } },
      orderBy: { name: 'asc' },
      take: 50,
    })
    return rows.map(this.toDomain)
  }

  private toDomain(row: {
    id: string; name: string; parentId: string | null
    createdAt: Date; updatedAt: Date
  }): Folder {
    return {
      id: row.id,
      name: row.name,
      parentId: row.parentId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }
  }
}
```

- [ ] **Step 5: Create `apps/backend/src/infrastructure/repositories/PrismaFileRepository.ts`**

```typescript
import type { PrismaClient } from '@prisma/client'
import type { IFileRepository } from '../../domain/ports/IFileRepository'
import type { File } from '../../domain/entities/File'

export class PrismaFileRepository implements IFileRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByFolderId(folderId: string): Promise<File[]> {
    const rows = await this.prisma.file.findMany({
      where: { folderId },
      orderBy: { name: 'asc' },
    })
    return rows.map(this.toDomain)
  }

  async searchByName(query: string): Promise<File[]> {
    const rows = await this.prisma.file.findMany({
      where: { name: { contains: query, mode: 'insensitive' } },
      orderBy: { name: 'asc' },
      take: 50,
    })
    return rows.map(this.toDomain)
  }

  private toDomain(row: {
    id: string; name: string; folderId: string; mimeType: string | null
    size: bigint; createdAt: Date; updatedAt: Date
  }): File {
    return {
      id: row.id,
      name: row.name,
      folderId: row.folderId,
      mimeType: row.mimeType,
      size: Number(row.size),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }
  }
}
```

- [ ] **Step 6: Write integration test — `apps/backend/tests/integration/folder-repository.test.ts`**

```typescript
import { describe, test, expect, beforeAll, afterAll } from 'bun:test'
import { PrismaClient } from '@prisma/client'
import { PrismaFolderRepository } from '../../src/infrastructure/repositories/PrismaFolderRepository'
import { PrismaFileRepository } from '../../src/infrastructure/repositories/PrismaFileRepository'

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.TEST_DATABASE_URL! } },
})

let parentId: string
let childId: string
let fileId: string

describe('PrismaFolderRepository (integration)', () => {
  beforeAll(async () => {
    const parent = await prisma.folder.create({ data: { name: 'IntTestParent' } })
    const child  = await prisma.folder.create({ data: { name: 'IntTestChild', parentId: parent.id } })
    const file   = await prisma.file.create({
      data: { name: 'inttest.pdf', folderId: parent.id, mimeType: 'application/pdf', size: 1024 },
    })
    parentId = parent.id
    childId  = child.id
    fileId   = file.id
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
```

- [ ] **Step 7: Run integration tests**

```bash
cd apps/backend
TEST_DATABASE_URL=postgresql://explorer:explorer@localhost:5433/explorer_test \
  bun test tests/integration/folder-repository.test.ts
```

Expected: `6 pass, 0 fail`

- [ ] **Step 8: Commit**

```bash
git add apps/backend/src/infrastructure/ apps/backend/tests/integration/
git commit -m "feat(infrastructure): Prisma repositories with integration tests"
```

---

## Task 12: HTTP layer — routes, middleware, app entry

**Files:**
- Create: `apps/backend/src/infrastructure/http/middleware/error-handler.ts`
- Create: `apps/backend/src/infrastructure/http/routes/folder.routes.ts`
- Create: `apps/backend/src/infrastructure/http/routes/search.routes.ts`
- Create: `apps/backend/src/infrastructure/http/app.ts`
- Create: `apps/backend/src/index.ts`

- [ ] **Step 1: Create `apps/backend/src/infrastructure/http/middleware/error-handler.ts`**

```typescript
import { Elysia } from 'elysia'
import { AppError } from '../../../application/errors/AppError'

export const errorHandler = new Elysia({ name: 'error-handler' }).onError(
  ({ error, set }) => {
    if (error instanceof AppError) {
      set.status = error.statusCode
      return { error: { code: error.code, message: error.message, statusCode: error.statusCode } }
    }

    console.error('[ERROR]', error)
    set.status = 500
    return {
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'Something went wrong', statusCode: 500 },
    }
  },
)
```

- [ ] **Step 2: Create `apps/backend/src/infrastructure/http/routes/folder.routes.ts`**

```typescript
import { Elysia, t } from 'elysia'
import type { GetFolderTree } from '../../../application/use-cases/GetFolderTree'
import type { GetFolderChildren } from '../../../application/use-cases/GetFolderChildren'

const UuidParam = t.Object({ id: t.String({ minLength: 36, maxLength: 36 }) })

export function folderRoutes(
  getFolderTree: GetFolderTree,
  getFolderChildren: GetFolderChildren,
) {
  return new Elysia({ prefix: '/api/v1' })
    .get('/folders', async () => {
      const data = await getFolderTree.execute()
      return { data }
    })
    .get(
      '/folders/:id/children',
      async ({ params }) => {
        const data = await getFolderChildren.execute(params.id)
        return { data }
      },
      { params: UuidParam },
    )
}
```

- [ ] **Step 3: Create `apps/backend/src/infrastructure/http/routes/search.routes.ts`**

```typescript
import { Elysia, t } from 'elysia'
import type { SearchItems, SearchType } from '../../../application/use-cases/SearchItems'

export function searchRoutes(searchItems: SearchItems) {
  return new Elysia({ prefix: '/api/v1' }).get(
    '/search',
    async ({ query }) => {
      const type = (query.type ?? 'all') as SearchType
      return searchItems.execute(query.q, type)
    },
    {
      query: t.Object({
        q: t.String({ minLength: 1 }),
        type: t.Optional(t.Union([t.Literal('all'), t.Literal('folders'), t.Literal('files')])),
      }),
    },
  )
}
```

- [ ] **Step 4: Create `apps/backend/src/infrastructure/http/app.ts`**

```typescript
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
```

- [ ] **Step 5: Create `apps/backend/src/index.ts`**

```typescript
import { createApp } from './infrastructure/http/app'

const port = Number(process.env.PORT ?? 3000)
const app  = createApp()

app.listen(port)

console.log(`🦊 Server running at http://localhost:${port}`)
```

- [ ] **Step 6: Smoke-test the server**

```bash
cd apps/backend && bun run dev &
sleep 2
curl -s http://localhost:3000/health | bun -e "process.stdin|async s=>{let d='';for await(const c of s)d+=c;console.log(JSON.parse(d).status)}"
```

Simpler alternative:
```bash
curl -s http://localhost:3000/health
```

Expected: `{"status":"ok","timestamp":"..."}`

```bash
curl -s http://localhost:3000/api/v1/folders | head -c 200
```

Expected: `{"data":[{"id":"...","name":"Documents",...},...]}`

- [ ] **Step 7: Commit**

```bash
git add apps/backend/src/infrastructure/http/ apps/backend/src/index.ts
git commit -m "feat(infrastructure): Elysia HTTP layer — routes, middleware, app factory"
```

---

## Task 13: Frontend project setup

**Files:**
- Create: `apps/frontend/package.json`
- Create: `apps/frontend/tsconfig.json`
- Create: `apps/frontend/vite.config.ts`
- Create: `apps/frontend/vitest.config.ts`
- Create: `apps/frontend/playwright.config.ts`
- Create: `apps/frontend/index.html`
- Create: `apps/frontend/.env.example`

- [ ] **Step 1: Create `apps/frontend/package.json`**

```json
{
  "name": "@windows-explorer/frontend",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test"
  },
  "dependencies": {
    "pinia": "^2.2.0",
    "vue": "^3.5.0"
  },
  "devDependencies": {
    "@playwright/test": "^1.48.0",
    "@vitejs/plugin-vue": "^5.2.0",
    "@vue/test-utils": "^2.4.0",
    "@vitest/coverage-v8": "^2.1.0",
    "jsdom": "^25.0.0",
    "typescript": "^5.7.0",
    "vite": "^5.4.0",
    "vitest": "^2.1.0",
    "vue-tsc": "^2.1.0"
  }
}
```

- [ ] **Step 2: Create `apps/frontend/vite.config.ts`**

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:3000', changeOrigin: true },
      '/health': { target: 'http://localhost:3000', changeOrigin: true },
    },
  },
})
```

- [ ] **Step 3: Create `apps/frontend/vitest.config.ts`**

```typescript
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['tests/unit/**/*.test.ts'],
  },
})
```

- [ ] **Step 4: Create `apps/frontend/playwright.config.ts`**

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'bun run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
})
```

- [ ] **Step 5: Create `apps/frontend/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "jsx": "preserve",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "skipLibCheck": true
  },
  "include": ["src", "tests"]
}
```

- [ ] **Step 6: Create `apps/frontend/index.html`**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Windows Explorer</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

- [ ] **Step 7: Create `apps/frontend/.env.example`**

```
# Leave empty to use Vite proxy (recommended for dev)
VITE_API_BASE=
```

- [ ] **Step 8: Install frontend dependencies**

```bash
cd apps/frontend && bun install && bunx playwright install chromium
```

Expected: `bun install [...] done`

- [ ] **Step 9: Commit**

```bash
git add apps/frontend/
git commit -m "chore: frontend project setup — Vue 3, Vite, Vitest, Playwright"
```

---

## Task 14: Frontend types and API service

**Files:**
- Create: `apps/frontend/src/types/folder.ts`
- Create: `apps/frontend/src/services/folderService.ts`

- [ ] **Step 1: Create `apps/frontend/src/types/folder.ts`**

```typescript
export interface FolderDto {
  id: string
  name: string
  parentId: string | null
  createdAt: string
}

export interface FileDto {
  id: string
  name: string
  folderId: string
  mimeType: string | null
  size: number
  createdAt: string
}

export interface TreeNode extends FolderDto {
  children: TreeNode[]
  isOpen: boolean
}

export interface FlatNode {
  id: string
  name: string
  parentId: string | null
  depth: number
  hasChildren: boolean
  isOpen: boolean
}

export interface SearchResultData {
  folders: FolderDto[]
  files: FileDto[]
  meta: { query: string; total: number }
}
```

- [ ] **Step 2: Create `apps/frontend/src/services/folderService.ts`**

```typescript
import type { FolderDto, FileDto, SearchResultData } from '../types/folder'

const BASE = import.meta.env.VITE_API_BASE ?? ''

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.error?.message ?? `Request failed: ${res.status}`)
  }
  return res.json() as Promise<T>
}

export const folderService = {
  async getFolders(): Promise<FolderDto[]> {
    const { data } = await get<{ data: FolderDto[] }>('/api/v1/folders')
    return data
  },

  async getChildren(id: string): Promise<{ folders: FolderDto[]; files: FileDto[] }> {
    const { data } = await get<{ data: { folders: FolderDto[]; files: FileDto[] } }>(
      `/api/v1/folders/${id}/children`,
    )
    return data
  },

  async search(query: string, type: 'all' | 'folders' | 'files' = 'all'): Promise<SearchResultData> {
    const params = new URLSearchParams({ q: query, type })
    return get<SearchResultData>(`/api/v1/search?${params}`)
  },
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/frontend/src/types/ apps/frontend/src/services/
git commit -m "feat(frontend): shared types and API service layer"
```

---

## Task 15: useFolderTree composable (TDD)

**Files:**
- Create: `apps/frontend/tests/unit/composables/useFolderTree.test.ts`
- Create: `apps/frontend/src/composables/useFolderTree.ts`

- [ ] **Step 1: Write the failing test**

`apps/frontend/tests/unit/composables/useFolderTree.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { buildTree, useFolderTree } from '../../../src/composables/useFolderTree'
import type { FolderDto } from '../../../src/types/folder'

const flat: FolderDto[] = [
  { id: 'root', name: 'Root', parentId: null, createdAt: '' },
  { id: 'child1', name: 'Alpha', parentId: 'root', createdAt: '' },
  { id: 'child2', name: 'Beta', parentId: 'root', createdAt: '' },
  { id: 'grand', name: 'Sub', parentId: 'child1', createdAt: '' },
]

describe('buildTree', () => {
  it('builds a nested tree from a flat array', () => {
    const roots = buildTree(flat)
    expect(roots).toHaveLength(1)
    expect(roots[0].id).toBe('root')
    expect(roots[0].children).toHaveLength(2)
  })

  it('sorts children alphabetically', () => {
    const roots = buildTree(flat)
    expect(roots[0].children[0].name).toBe('Alpha')
    expect(roots[0].children[1].name).toBe('Beta')
  })

  it('nests grandchildren correctly', () => {
    const roots = buildTree(flat)
    expect(roots[0].children[0].children[0].name).toBe('Sub')
  })

  it('returns empty array for empty input', () => {
    expect(buildTree([])).toEqual([])
  })
})

describe('useFolderTree', () => {
  it('flatVisible starts with all root-level nodes closed', () => {
    const roots = ref(buildTree(flat))
    const { flatVisible } = useFolderTree(() => roots.value)
    expect(flatVisible.value).toHaveLength(1)
    expect(flatVisible.value[0].id).toBe('root')
  })

  it('toggle opens a node and exposes its children', () => {
    const roots = ref(buildTree(flat))
    const { flatVisible, toggle } = useFolderTree(() => roots.value)
    toggle('root')
    expect(flatVisible.value).toHaveLength(3) // root + child1 + child2
  })

  it('toggle closes an open node', () => {
    const roots = ref(buildTree(flat))
    const { flatVisible, toggle } = useFolderTree(() => roots.value)
    toggle('root')
    toggle('root')
    expect(flatVisible.value).toHaveLength(1)
  })

  it('depth reflects nesting level', () => {
    const roots = ref(buildTree(flat))
    const { flatVisible, toggle } = useFolderTree(() => roots.value)
    toggle('root')
    const child = flatVisible.value.find(n => n.id === 'child1')!
    expect(child.depth).toBe(1)
  })

  it('hasChildren is true for nodes with children', () => {
    const roots = ref(buildTree(flat))
    const { flatVisible, toggle } = useFolderTree(() => roots.value)
    toggle('root')
    const withChild = flatVisible.value.find(n => n.id === 'child1')!
    const leaf = flatVisible.value.find(n => n.id === 'child2')!
    expect(withChild.hasChildren).toBe(true)
    expect(leaf.hasChildren).toBe(false)
  })
})
```

- [ ] **Step 2: Run — verify it fails**

```bash
cd apps/frontend && bun run test -- tests/unit/composables/useFolderTree.test.ts
```

Expected: `Cannot find module '../../../src/composables/useFolderTree'`

- [ ] **Step 3: Implement `apps/frontend/src/composables/useFolderTree.ts`**

```typescript
import { ref, computed } from 'vue'
import type { FolderDto, TreeNode, FlatNode } from '../types/folder'

export function buildTree(folders: FolderDto[]): TreeNode[] {
  const map = new Map<string, TreeNode>()
  const roots: TreeNode[] = []

  for (const f of folders) {
    map.set(f.id, { ...f, children: [], isOpen: false })
  }

  for (const node of map.values()) {
    if (node.parentId === null) {
      roots.push(node)
    } else {
      map.get(node.parentId)?.children.push(node)
    }
  }

  const sortNodes = (nodes: TreeNode[]): TreeNode[] => {
    nodes.sort((a, b) => a.name.localeCompare(b.name))
    nodes.forEach(n => sortNodes(n.children))
    return nodes
  }

  return sortNodes(roots)
}

export function useFolderTree(getRoots: () => TreeNode[]) {
  const openIds = ref(new Set<string>())

  function toggle(id: string) {
    const next = new Set(openIds.value)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    openIds.value = next
  }

  const flatVisible = computed<FlatNode[]>(() => {
    const result: FlatNode[] = []

    function walk(nodes: TreeNode[], depth: number) {
      for (const node of nodes) {
        const isOpen = openIds.value.has(node.id)
        result.push({
          id: node.id,
          name: node.name,
          parentId: node.parentId,
          depth,
          hasChildren: node.children.length > 0,
          isOpen,
        })
        if (isOpen) walk(node.children, depth + 1)
      }
    }

    walk(getRoots(), 0)
    return result
  })

  return { flatVisible, toggle, openIds }
}
```

- [ ] **Step 4: Run — verify it passes**

```bash
cd apps/frontend && bun run test -- tests/unit/composables/useFolderTree.test.ts
```

Expected: `8 pass, 0 fail`

- [ ] **Step 5: Commit**

```bash
git add apps/frontend/src/composables/useFolderTree.ts apps/frontend/tests/unit/composables/useFolderTree.test.ts
git commit -m "feat(frontend): useFolderTree composable — O(n) buildTree + virtual flatten"
```

---

## Task 16: useVirtualScroll composable (TDD)

**Files:**
- Create: `apps/frontend/tests/unit/composables/useVirtualScroll.test.ts`
- Create: `apps/frontend/src/composables/useVirtualScroll.ts`

- [ ] **Step 1: Write the failing test**

`apps/frontend/tests/unit/composables/useVirtualScroll.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { useVirtualScroll } from '../../../src/composables/useVirtualScroll'

const items = Array.from({ length: 100 }, (_, i) => ({ id: i, label: `Item ${i}` }))

describe('useVirtualScroll', () => {
  it('returns only items that fit in the visible window', () => {
    const { visibleItems } = useVirtualScroll(ref(items), ref(200), ref(0), { itemHeight: 32 })
    // 200px / 32px = ~6 visible + overscan = ~12 items, far fewer than 100
    expect(visibleItems.value.items.length).toBeLessThan(30)
  })

  it('reports correct totalHeight', () => {
    const { visibleItems } = useVirtualScroll(ref(items), ref(200), ref(0), { itemHeight: 32 })
    expect(visibleItems.value.totalHeight).toBe(100 * 32)
  })

  it('shifts the visible window when scrolled', () => {
    const scrollTop = ref(0)
    const { visibleItems } = useVirtualScroll(ref(items), ref(200), scrollTop, { itemHeight: 32 })
    const firstBefore = visibleItems.value.items[0].item.id
    scrollTop.value = 320 // scroll 10 items down
    const firstAfter = visibleItems.value.items[0].item.id
    expect(firstAfter).toBeGreaterThan(firstBefore)
  })

  it('each visible item has a correct offsetY', () => {
    const { visibleItems } = useVirtualScroll(ref(items), ref(200), ref(0), { itemHeight: 32 })
    const first = visibleItems.value.items[0]
    expect(first.offsetY).toBe(first.index * 32)
  })

  it('handles empty list', () => {
    const { visibleItems } = useVirtualScroll(ref([]), ref(200), ref(0), { itemHeight: 32 })
    expect(visibleItems.value.items).toHaveLength(0)
    expect(visibleItems.value.totalHeight).toBe(0)
  })
})
```

- [ ] **Step 2: Run — verify it fails**

```bash
cd apps/frontend && bun run test -- tests/unit/composables/useVirtualScroll.test.ts
```

Expected: `Cannot find module '../../../src/composables/useVirtualScroll'`

- [ ] **Step 3: Implement `apps/frontend/src/composables/useVirtualScroll.ts`**

```typescript
import { computed, type Ref } from 'vue'

interface Options {
  itemHeight: number
  overscan?: number
}

export function useVirtualScroll<T>(
  items: Ref<T[]>,
  containerHeight: Ref<number>,
  scrollTop: Ref<number>,
  { itemHeight, overscan = 3 }: Options,
) {
  const visibleItems = computed(() => {
    const total = items.value.length
    const start = Math.max(0, Math.floor(scrollTop.value / itemHeight) - overscan)
    const count = Math.ceil(containerHeight.value / itemHeight)
    const end   = Math.min(total, start + count + overscan * 2)

    return {
      items: items.value.slice(start, end).map((item, i) => ({
        item,
        index: start + i,
        offsetY: (start + i) * itemHeight,
      })),
      totalHeight: total * itemHeight,
    }
  })

  return { visibleItems }
}
```

- [ ] **Step 4: Run — verify it passes**

```bash
cd apps/frontend && bun run test -- tests/unit/composables/useVirtualScroll.test.ts
```

Expected: `5 pass, 0 fail`

- [ ] **Step 5: Commit**

```bash
git add apps/frontend/src/composables/useVirtualScroll.ts apps/frontend/tests/unit/composables/useVirtualScroll.test.ts
git commit -m "feat(frontend): useVirtualScroll composable"
```

---

## Task 17: useSearch composable (TDD)

**Files:**
- Create: `apps/frontend/tests/unit/composables/useSearch.test.ts`
- Create: `apps/frontend/src/composables/useSearch.ts`

- [ ] **Step 1: Write the failing test**

`apps/frontend/tests/unit/composables/useSearch.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { nextTick } from 'vue'
import { useSearch } from '../../../src/composables/useSearch'

vi.mock('../../../src/services/folderService', () => ({
  folderService: {
    search: vi.fn().mockResolvedValue({
      folders: [{ id: '1', name: 'Holiday', parentId: null, createdAt: '' }],
      files: [],
      meta: { query: 'holiday', total: 1 },
    }),
  },
}))

beforeEach(() => { vi.useFakeTimers() })

describe('useSearch', () => {
  it('results are null initially', () => {
    const { results } = useSearch()
    expect(results.value).toBeNull()
  })

  it('clears results when query is empty', async () => {
    const { query, results } = useSearch()
    query.value = 'test'
    vi.runAllTimers()
    await nextTick()
    query.value = ''
    await nextTick()
    expect(results.value).toBeNull()
  })

  it('debounces — does not call API immediately', async () => {
    const { folderService } = await import('../../../src/services/folderService')
    const { query } = useSearch()
    query.value = 'hol'
    await nextTick()
    expect(folderService.search).not.toHaveBeenCalled()
  })

  it('calls API after 300ms debounce', async () => {
    const { folderService } = await import('../../../src/services/folderService')
    const { query } = useSearch()
    query.value = 'holiday'
    vi.advanceTimersByTime(300)
    await nextTick()
    expect(folderService.search).toHaveBeenCalledWith('holiday', 'all')
  })

  it('clear() resets query and results', async () => {
    const { query, results, clear } = useSearch()
    query.value = 'test'
    vi.runAllTimers()
    await nextTick()
    clear()
    expect(query.value).toBe('')
    expect(results.value).toBeNull()
  })
})
```

- [ ] **Step 2: Run — verify it fails**

```bash
cd apps/frontend && bun run test -- tests/unit/composables/useSearch.test.ts
```

Expected: `Cannot find module '../../../src/composables/useSearch'`

- [ ] **Step 3: Implement `apps/frontend/src/composables/useSearch.ts`**

```typescript
import { ref, watch } from 'vue'
import { folderService } from '../services/folderService'
import type { SearchResultData } from '../types/folder'

const DEBOUNCE_MS = 300

export function useSearch() {
  const query      = ref('')
  const results    = ref<SearchResultData | null>(null)
  const searching  = ref(false)
  const searchError = ref<string | null>(null)

  let timer: ReturnType<typeof setTimeout> | null = null

  watch(query, (val) => {
    if (timer) clearTimeout(timer)

    if (!val.trim()) {
      results.value = null
      return
    }

    timer = setTimeout(async () => {
      searching.value = true
      searchError.value = null
      try {
        results.value = await folderService.search(val.trim())
      } catch (e) {
        searchError.value = e instanceof Error ? e.message : 'Search failed'
      } finally {
        searching.value = false
      }
    }, DEBOUNCE_MS)
  })

  function clear() {
    if (timer) clearTimeout(timer)
    query.value   = ''
    results.value = null
  }

  return { query, results, searching, searchError, clear }
}
```

- [ ] **Step 4: Run — verify it passes**

```bash
cd apps/frontend && bun run test -- tests/unit/composables/useSearch.test.ts
```

Expected: `5 pass, 0 fail`

- [ ] **Step 5: Commit**

```bash
git add apps/frontend/src/composables/useSearch.ts apps/frontend/tests/unit/composables/useSearch.test.ts
git commit -m "feat(frontend): useSearch composable with 300ms debounce"
```

---

## Task 18: Pinia store

**Files:**
- Create: `apps/frontend/src/stores/folderStore.ts`

- [ ] **Step 1: Create `apps/frontend/src/stores/folderStore.ts`**

```typescript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { folderService } from '../services/folderService'
import { buildTree } from '../composables/useFolderTree'
import type { FolderDto, FileDto, TreeNode } from '../types/folder'

export const useFolderStore = defineStore('folder', () => {
  const folders          = ref<FolderDto[]>([])
  const selectedFolderId = ref<string | null>(null)
  const childrenMap      = ref<Record<string, { folders: FolderDto[]; files: FileDto[] }>>({})
  const loading          = ref(false)
  const error            = ref<string | null>(null)

  const treeRoots = computed<TreeNode[]>(() => buildTree(folders.value))

  const selectedChildren = computed(() =>
    selectedFolderId.value ? (childrenMap.value[selectedFolderId.value] ?? null) : null,
  )

  async function fetchAll() {
    loading.value = true
    error.value   = null
    try {
      folders.value = await folderService.getFolders()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load folders'
    } finally {
      loading.value = false
    }
  }

  async function selectFolder(id: string) {
    selectedFolderId.value = id

    if (childrenMap.value[id]) return // client-side cache hit

    try {
      const result = await folderService.getChildren(id)
      childrenMap.value = { ...childrenMap.value, [id]: result }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load folder contents'
    }
  }

  function clearSelection() {
    selectedFolderId.value = null
  }

  return {
    folders,
    selectedFolderId,
    childrenMap,
    loading,
    error,
    treeRoots,
    selectedChildren,
    fetchAll,
    selectFolder,
    clearSelection,
  }
})
```

- [ ] **Step 2: Commit**

```bash
git add apps/frontend/src/stores/
git commit -m "feat(frontend): Pinia folderStore"
```

---

## Task 19: FolderNode and SearchBar components (TDD)

**Files:**
- Create: `apps/frontend/src/components/FolderNode.vue`
- Create: `apps/frontend/src/components/SearchBar.vue`
- Create: `apps/frontend/tests/unit/components/FolderNode.test.ts`
- Create: `apps/frontend/tests/unit/components/SearchBar.test.ts`

- [ ] **Step 1: Write FolderNode test**

`apps/frontend/tests/unit/components/FolderNode.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import FolderNode from '../../../src/components/FolderNode.vue'
import type { FlatNode } from '../../../src/types/folder'

const leafNode: FlatNode = { id: 'n1', name: 'Documents', parentId: null, depth: 0, hasChildren: false, isOpen: false }
const parentNode: FlatNode = { id: 'n2', name: 'Work', parentId: 'n1', depth: 1, hasChildren: true, isOpen: false }
const openNode: FlatNode   = { id: 'n3', name: 'Open', parentId: null, depth: 0, hasChildren: true, isOpen: true }

describe('FolderNode', () => {
  it('renders the folder name', () => {
    const wrapper = mount(FolderNode, { props: { node: leafNode, isSelected: false } })
    expect(wrapper.text()).toContain('Documents')
  })

  it('applies selected class when isSelected is true', () => {
    const wrapper = mount(FolderNode, { props: { node: leafNode, isSelected: true } })
    expect(wrapper.classes()).toContain('selected')
  })

  it('does not show toggle arrow for leaf nodes', () => {
    const wrapper = mount(FolderNode, { props: { node: leafNode, isSelected: false } })
    expect(wrapper.find('[data-testid="toggle"]').exists()).toBe(false)
  })

  it('shows ▶ arrow for closed parent node', () => {
    const wrapper = mount(FolderNode, { props: { node: parentNode, isSelected: false } })
    expect(wrapper.find('[data-testid="toggle"]').text()).toBe('▶')
  })

  it('shows ▼ arrow for open node', () => {
    const wrapper = mount(FolderNode, { props: { node: openNode, isSelected: false } })
    expect(wrapper.find('[data-testid="toggle"]').text()).toBe('▼')
  })

  it('emits select when clicked', async () => {
    const wrapper = mount(FolderNode, { props: { node: leafNode, isSelected: false } })
    await wrapper.trigger('click')
    expect(wrapper.emitted('select')?.[0]).toEqual(['n1'])
  })

  it('emits toggle when arrow clicked without bubbling select', async () => {
    const wrapper = mount(FolderNode, { props: { node: parentNode, isSelected: false } })
    await wrapper.find('[data-testid="toggle"]').trigger('click')
    expect(wrapper.emitted('toggle')?.[0]).toEqual(['n2'])
    // click.stop means select is NOT emitted from the arrow click
    expect(wrapper.emitted('select')).toBeFalsy()
  })

  it('indents based on depth', () => {
    const wrapper = mount(FolderNode, { props: { node: parentNode, isSelected: false } })
    const style = wrapper.attributes('style') ?? ''
    expect(style).toContain('padding-left')
  })
})
```

- [ ] **Step 2: Write SearchBar test**

`apps/frontend/tests/unit/components/SearchBar.test.ts`:

```typescript
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
```

- [ ] **Step 3: Run both tests — verify they fail**

```bash
cd apps/frontend && bun run test -- tests/unit/components/
```

Expected: `Cannot find module '../../../src/components/FolderNode.vue'`

- [ ] **Step 4: Create `apps/frontend/src/components/FolderNode.vue`**

```vue
<script setup lang="ts">
import type { FlatNode } from '../types/folder'

const props = defineProps<{
  node: FlatNode
  isSelected: boolean
}>()

const emit = defineEmits<{
  select: [id: string]
  toggle: [id: string]
}>()
</script>

<template>
  <div
    class="folder-node"
    :class="{ selected: isSelected }"
    :style="{ paddingLeft: `${8 + node.depth * 16}px` }"
    @click="emit('select', node.id)"
  >
    <span
      v-if="node.hasChildren"
      data-testid="toggle"
      class="toggle-arrow"
      @click.stop="emit('toggle', node.id)"
    >
      {{ node.isOpen ? '▼' : '▶' }}
    </span>
    <span v-else class="toggle-spacer" />
    <span class="folder-icon">📁</span>
    <span class="folder-name">{{ node.name }}</span>
  </div>
</template>

<style scoped>
.folder-node {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  cursor: pointer;
  border-radius: 4px;
  user-select: none;
}
.folder-node:hover { background: var(--hover-bg, #f0f0f0); }
.folder-node.selected { background: var(--selected-bg, #cce4ff); }
.toggle-arrow { font-size: 10px; width: 14px; text-align: center; color: #666; }
.toggle-spacer { width: 14px; }
.folder-name { font-size: 13px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
</style>
```

- [ ] **Step 5: Create `apps/frontend/src/components/SearchBar.vue`**

```vue
<script setup lang="ts">
const model = defineModel<string>({ required: true })
</script>

<template>
  <div class="search-bar">
    <span class="search-icon">🔍</span>
    <input
      v-model="model"
      type="text"
      placeholder="Search folders and files..."
      class="search-input"
      data-testid="search-input"
    />
    <button
      v-if="model"
      class="clear-btn"
      data-testid="clear-btn"
      aria-label="Clear search"
      @click="model = ''"
    >
      ✕
    </button>
  </div>
</template>

<style scoped>
.search-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: #f5f5f5;
  border-bottom: 1px solid #ddd;
}
.search-input {
  flex: 1;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 13px;
  outline: none;
}
.search-input:focus { border-color: #0078d4; }
.clear-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  font-size: 12px;
  padding: 2px 4px;
}
</style>
```

- [ ] **Step 6: Run — verify all pass**

```bash
cd apps/frontend && bun run test -- tests/unit/components/
```

Expected: `13 pass, 0 fail`

- [ ] **Step 7: Commit**

```bash
git add apps/frontend/src/components/FolderNode.vue apps/frontend/src/components/SearchBar.vue apps/frontend/tests/unit/components/
git commit -m "feat(frontend): FolderNode and SearchBar components with unit tests"
```

---

## Task 20: FolderTree component

**Files:**
- Create: `apps/frontend/src/components/FolderTree.vue`

- [ ] **Step 1: Create `apps/frontend/src/components/FolderTree.vue`**

```vue
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import FolderNode from './FolderNode.vue'
import { useFolderTree } from '../composables/useFolderTree'
import { useVirtualScroll } from '../composables/useVirtualScroll'
import type { TreeNode } from '../types/folder'

const props = defineProps<{
  roots: TreeNode[]
  selectedId: string | null
}>()

const emit = defineEmits<{
  select: [id: string]
}>()

const ITEM_HEIGHT = 32

const containerRef     = ref<HTMLElement | null>(null)
const containerHeight  = ref(400)
const scrollTop        = ref(0)

const { flatVisible, toggle } = useFolderTree(() => props.roots)
const { visibleItems }        = useVirtualScroll(flatVisible, containerHeight, scrollTop, { itemHeight: ITEM_HEIGHT })

function onScroll(e: Event) {
  scrollTop.value = (e.target as HTMLElement).scrollTop
}

let ro: ResizeObserver | null = null

onMounted(() => {
  if (!containerRef.value) return
  containerHeight.value = containerRef.value.clientHeight
  ro = new ResizeObserver(() => {
    containerHeight.value = containerRef.value?.clientHeight ?? 400
  })
  ro.observe(containerRef.value)
})

onUnmounted(() => ro?.disconnect())
</script>

<template>
  <div
    ref="containerRef"
    class="folder-tree"
    @scroll="onScroll"
  >
    <div :style="{ height: `${visibleItems.totalHeight}px`, position: 'relative' }">
      <div
        v-for="{ item, offsetY } in visibleItems.items"
        :key="item.id"
        :style="{ position: 'absolute', top: `${offsetY}px`, width: '100%', height: `${ITEM_HEIGHT}px` }"
      >
        <FolderNode
          :node="item"
          :is-selected="item.id === selectedId"
          @select="emit('select', $event)"
          @toggle="toggle"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.folder-tree {
  overflow-y: auto;
  height: 100%;
  position: relative;
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add apps/frontend/src/components/FolderTree.vue
git commit -m "feat(frontend): FolderTree component with virtual scroll"
```

---

## Task 21: Content panel components

**Files:**
- Create: `apps/frontend/src/components/BreadcrumbBar.vue`
- Create: `apps/frontend/src/components/FolderGrid.vue`
- Create: `apps/frontend/src/components/FileGrid.vue`
- Create: `apps/frontend/src/components/ContentPanel.vue`

- [ ] **Step 1: Create `apps/frontend/src/components/BreadcrumbBar.vue`**

```vue
<script setup lang="ts">
defineProps<{ path: string }>()
</script>

<template>
  <div class="breadcrumb">
    <span class="path">{{ path }}</span>
  </div>
</template>

<style scoped>
.breadcrumb {
  padding: 6px 12px;
  font-size: 12px;
  color: #555;
  border-bottom: 1px solid #eee;
  background: #fafafa;
}
</style>
```

- [ ] **Step 2: Create `apps/frontend/src/components/FolderGrid.vue`**

```vue
<script setup lang="ts">
import type { FolderDto } from '../types/folder'

defineProps<{ folders: FolderDto[] }>()
const emit = defineEmits<{ select: [id: string] }>()
</script>

<template>
  <div v-if="folders.length" class="folder-grid">
    <div
      v-for="folder in folders"
      :key="folder.id"
      class="grid-item folder-item"
      :data-testid="`folder-item-${folder.id}`"
      @dblclick="emit('select', folder.id)"
    >
      <span class="item-icon">📁</span>
      <span class="item-name" :title="folder.name">{{ folder.name }}</span>
    </div>
  </div>
</template>

<style scoped>
.folder-grid { display: flex; flex-wrap: wrap; gap: 12px; padding: 12px; }
.grid-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  width: 80px;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  user-select: none;
}
.grid-item:hover { background: #e8f0fe; }
.item-icon { font-size: 32px; }
.item-name { font-size: 11px; text-align: center; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%; }
</style>
```

- [ ] **Step 3: Create `apps/frontend/src/components/FileGrid.vue`**

```vue
<script setup lang="ts">
import type { FileDto } from '../types/folder'

defineProps<{ files: FileDto[] }>()

function iconFor(mimeType: string | null): string {
  if (!mimeType) return '📄'
  if (mimeType.startsWith('image/'))  return '🖼️'
  if (mimeType.startsWith('video/'))  return '🎬'
  if (mimeType.startsWith('audio/'))  return '🎵'
  if (mimeType === 'application/pdf') return '📕'
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return '📊'
  if (mimeType.includes('word'))      return '📝'
  return '📄'
}

function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`
}
</script>

<template>
  <div v-if="files.length" class="file-grid">
    <div
      v-for="file in files"
      :key="file.id"
      class="grid-item file-item"
      :title="`${file.name} — ${formatSize(file.size)}`"
    >
      <span class="item-icon">{{ iconFor(file.mimeType) }}</span>
      <span class="item-name">{{ file.name }}</span>
      <span class="item-size">{{ formatSize(file.size) }}</span>
    </div>
  </div>
</template>

<style scoped>
.file-grid { display: flex; flex-wrap: wrap; gap: 12px; padding: 12px; }
.grid-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  width: 80px;
  padding: 8px;
  border-radius: 4px;
  cursor: default;
  user-select: none;
}
.grid-item:hover { background: #f5f5f5; }
.item-icon { font-size: 32px; }
.item-name { font-size: 11px; text-align: center; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%; }
.item-size { font-size: 10px; color: #999; }
</style>
```

- [ ] **Step 4: Create `apps/frontend/src/components/ContentPanel.vue`**

```vue
<script setup lang="ts">
import BreadcrumbBar from './BreadcrumbBar.vue'
import FolderGrid from './FolderGrid.vue'
import FileGrid from './FileGrid.vue'
import type { FolderDto, FileDto } from '../types/folder'

defineProps<{
  breadcrumb: string
  folders: FolderDto[]
  files: FileDto[]
  loading: boolean
}>()

const emit = defineEmits<{ navigate: [id: string] }>()
</script>

<template>
  <div class="content-panel">
    <BreadcrumbBar :path="breadcrumb" />

    <div v-if="loading" class="state-message">Loading...</div>

    <div v-else-if="!breadcrumb" class="state-message empty-state">
      Select a folder to view its contents
    </div>

    <div v-else class="content-scroll">
      <FolderGrid
        :folders="folders"
        @select="emit('navigate', $event)"
      />
      <FileGrid :files="files" />
      <p v-if="!folders.length && !files.length" class="state-message">
        This folder is empty
      </p>
    </div>

    <div class="status-bar">
      {{ folders.length + files.length }} items
      <template v-if="breadcrumb">
        · {{ folders.length }} folder{{ folders.length !== 1 ? 's' : '' }},
        {{ files.length }} file{{ files.length !== 1 ? 's' : '' }}
      </template>
    </div>
  </div>
</template>

<style scoped>
.content-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}
.content-scroll { flex: 1; overflow-y: auto; }
.status-bar {
  padding: 4px 12px;
  font-size: 11px;
  color: #666;
  border-top: 1px solid #eee;
  background: #fafafa;
}
.state-message {
  padding: 24px;
  color: #888;
  font-size: 13px;
  text-align: center;
}
.empty-state { margin-top: 60px; }
</style>
```

- [ ] **Step 5: Commit**

```bash
git add apps/frontend/src/components/BreadcrumbBar.vue apps/frontend/src/components/FolderGrid.vue apps/frontend/src/components/FileGrid.vue apps/frontend/src/components/ContentPanel.vue
git commit -m "feat(frontend): ContentPanel, BreadcrumbBar, FolderGrid, FileGrid components"
```

---

## Task 22: ExplorerView and app entry

**Files:**
- Create: `apps/frontend/src/views/ExplorerView.vue`
- Create: `apps/frontend/src/App.vue`
- Create: `apps/frontend/src/main.ts`

- [ ] **Step 1: Create `apps/frontend/src/views/ExplorerView.vue`**

```vue
<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useFolderStore } from '../stores/folderStore'
import { useSearch } from '../composables/useSearch'
import SearchBar from '../components/SearchBar.vue'
import FolderTree from '../components/FolderTree.vue'
import ContentPanel from '../components/ContentPanel.vue'

const store = useFolderStore()
const { query, results, searching } = useSearch()

onMounted(() => store.fetchAll())

const isSearching = computed(() => query.value.trim().length > 0)

const displayFolders = computed(() =>
  isSearching.value ? (results.value?.folders ?? []) : (store.selectedChildren?.folders ?? []),
)
const displayFiles = computed(() =>
  isSearching.value ? (results.value?.files ?? []) : (store.selectedChildren?.files ?? []),
)

const breadcrumb = computed(() => {
  if (isSearching.value) return `Search: "${query.value}"`
  if (!store.selectedFolderId) return ''
  const folder = store.folders.find(f => f.id === store.selectedFolderId)
  return folder?.name ?? ''
})

function onSelectFolder(id: string) {
  query.value = ''
  store.selectFolder(id)
}
</script>

<template>
  <div class="explorer">
    <SearchBar v-model="query" class="explorer-toolbar" />

    <div class="explorer-body">
      <!-- Left: folder tree (30%) -->
      <aside class="explorer-sidebar" data-testid="sidebar">
        <div v-if="store.loading" class="sidebar-state">Loading tree...</div>
        <div v-else-if="store.error" class="sidebar-state error">{{ store.error }}</div>
        <FolderTree
          v-else
          :roots="store.treeRoots"
          :selected-id="store.selectedFolderId"
          @select="onSelectFolder"
        />
      </aside>

      <!-- Right: content panel (70%) -->
      <main class="explorer-main" data-testid="content-panel">
        <ContentPanel
          :breadcrumb="breadcrumb"
          :folders="displayFolders"
          :files="displayFiles"
          :loading="searching"
          @navigate="onSelectFolder"
        />
      </main>
    </div>
  </div>
</template>

<style scoped>
.explorer {
  display: flex;
  flex-direction: column;
  height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 13px;
  color: #1a1a1a;
  background: #fff;
}
.explorer-body {
  display: flex;
  flex: 1;
  overflow: hidden;
  border-top: 1px solid #ddd;
}
.explorer-sidebar {
  width: 30%;
  min-width: 200px;
  max-width: 400px;
  border-right: 1px solid #ddd;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.explorer-main {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.sidebar-state {
  padding: 16px;
  color: #888;
  font-size: 12px;
}
.sidebar-state.error { color: #c0392b; }
</style>
```

- [ ] **Step 2: Create `apps/frontend/src/App.vue`**

```vue
<script setup lang="ts">
import ExplorerView from './views/ExplorerView.vue'
</script>

<template>
  <ExplorerView />
</template>

<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { overflow: hidden; }
</style>
```

- [ ] **Step 3: Create `apps/frontend/src/main.ts`**

```typescript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

createApp(App).use(createPinia()).mount('#app')
```

- [ ] **Step 4: Start both servers and verify the app works**

In one terminal:
```bash
cd apps/backend && bun run dev
```

In another:
```bash
cd apps/frontend && bun run dev
```

Open `http://localhost:5173`. Verify:
- Left panel shows the folder tree from seed data
- Clicking a folder loads its children in the right panel
- Toggling the arrow opens/closes folders
- Typing in the search bar shows results

- [ ] **Step 5: Commit**

```bash
git add apps/frontend/src/
git commit -m "feat(frontend): ExplorerView, App.vue, main.ts — full UI wired up"
```

---

## Task 23: E2E tests

**Files:**
- Create: `apps/frontend/tests/e2e/explorer.spec.ts`

- [ ] **Step 1: Make sure both servers are running and seed data is present**

```bash
# Backend
cd apps/backend && bun run dev &

# Frontend
cd apps/frontend && bun run dev &

# Verify seed
curl -s http://localhost:3000/api/v1/folders | bun -e "const d=await Bun.stdin.text();console.log(JSON.parse(d).data.length,'folders')"
```

Expected: `10 folders` (or however many the seed created)

- [ ] **Step 2: Create `apps/frontend/tests/e2e/explorer.spec.ts`**

```typescript
import { test, expect } from '@playwright/test'

test.describe('Windows Explorer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Wait for the tree to load
    await page.waitForSelector('[data-testid="sidebar"] .folder-node', { timeout: 5000 })
  })

  test('page loads and displays folder tree in left panel', async ({ page }) => {
    const nodes = page.locator('[data-testid="sidebar"] .folder-node')
    await expect(nodes).not.toHaveCount(0)

    // Root-level folders from seed: Documents, Pictures, Videos
    await expect(page.locator('[data-testid="sidebar"]')).toContainText('Documents')
    await expect(page.locator('[data-testid="sidebar"]')).toContainText('Pictures')
    await expect(page.locator('[data-testid="sidebar"]')).toContainText('Videos')
  })

  test('right panel is empty before selecting a folder', async ({ page }) => {
    const panel = page.locator('[data-testid="content-panel"]')
    await expect(panel).toContainText('Select a folder')
  })

  test('clicking a folder shows its subfolders and files in the right panel', async ({ page }) => {
    // Click "Documents" in the tree
    await page.locator('[data-testid="sidebar"] .folder-node', { hasText: 'Documents' }).click()

    const panel = page.locator('[data-testid="content-panel"]')
    // Documents has Work and Personal as children
    await expect(panel).toContainText('Work', { timeout: 3000 })
    await expect(panel).toContainText('Personal')
    // And resume.pdf as a file
    await expect(panel).toContainText('resume.pdf')
  })

  test('expanding a folder in the tree reveals its children', async ({ page }) => {
    const documentsNode = page.locator('[data-testid="sidebar"] .folder-node', { hasText: 'Documents' })

    // Toggle arrow to expand
    const arrow = documentsNode.locator('[data-testid="toggle"]')
    await arrow.click()

    // Work and Personal should now appear in the sidebar
    await expect(page.locator('[data-testid="sidebar"]')).toContainText('Work', { timeout: 2000 })
    await expect(page.locator('[data-testid="sidebar"]')).toContainText('Personal')
  })

  test('collapsing a folder hides its children', async ({ page }) => {
    const arrow = page.locator('[data-testid="sidebar"] .folder-node', { hasText: 'Documents' })
      .locator('[data-testid="toggle"]')

    // Expand
    await arrow.click()
    await expect(page.locator('[data-testid="sidebar"]')).toContainText('Work')

    // Collapse
    await arrow.click()
    await expect(page.locator('[data-testid="sidebar"]')).not.toContainText('Work')
  })

  test('search returns matching folders and files', async ({ page }) => {
    const searchInput = page.locator('[data-testid="search-input"]')
    await searchInput.fill('holiday')

    // Wait for debounce + API call
    await page.waitForTimeout(400)

    const panel = page.locator('[data-testid="content-panel"]')
    await expect(panel).toContainText('Holiday', { timeout: 3000 })
  })
})
```

- [ ] **Step 3: Run E2E tests**

```bash
cd apps/frontend && bun run test:e2e
```

Expected: `5 passed`

If tests fail due to timing, increase timeouts in the spec or run with `--headed` to debug:

```bash
cd apps/frontend && bunx playwright test --headed
```

- [ ] **Step 4: Commit**

```bash
git add apps/frontend/tests/e2e/
git commit -m "test(e2e): Playwright explorer spec — 5 critical user journeys"
```

---

## Task 24: README

**Files:**
- Create: `README.md`

- [ ] **Step 1: Create `README.md`**

```markdown
# Windows Explorer

A full-stack file explorer web application built with Bun, Elysia, Prisma, Vue 3, and PostgreSQL.

## Architecture

The backend follows **Hexagonal Architecture** (Ports & Adapters):
- **Domain** — entities and port interfaces, no framework dependencies
- **Application** — use cases that depend only on port interfaces (testable in isolation)
- **Infrastructure** — Elysia HTTP handlers, Prisma repositories, in-memory cache

The frontend is a **Vue 3 SPA** with Pinia state management. The folder tree is built client-side from a flat array using an O(n) Map algorithm and rendered with a custom virtual scroll — no third-party tree libraries.

## Stack

| Layer | Tech |
|-------|------|
| Runtime | Bun |
| Backend framework | Elysia |
| ORM | Prisma |
| Database | PostgreSQL 16 |
| Frontend | Vue 3 (Composition API) |
| State | Pinia |
| Unit tests (BE) | Bun test |
| Unit tests (FE) | Vitest + Vue Test Utils |
| E2E tests | Playwright |

## Getting Started

**Prerequisites:** Bun ≥ 1.1, Docker

```bash
# 1. Clone and install
git clone <repo>
cd windows-explorer
bun install

# 2. Start the database
docker compose up -d

# 3. Configure environment
cp apps/backend/.env.example apps/backend/.env

# 4. Run migrations and seed
cd apps/backend
bun run db:migrate
bun run db:seed

# 5. Start both servers
cd ../..
bun run dev   # starts backend (port 3000) and frontend (port 5173)
```

Open `http://localhost:5173`.

## Running Tests

```bash
# Backend unit tests
cd apps/backend && bun test tests/unit

# Backend integration tests (requires test DB)
docker compose -f docker-compose.test.yml up -d
cd apps/backend && bun run test:integration

# Frontend unit tests
cd apps/frontend && bun run test

# E2E tests (requires both servers running)
cd apps/frontend && bun run test:e2e
```

## API

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/v1/folders` | All folders (flat array) |
| `GET` | `/api/v1/folders/:id/children` | Subfolders and files of a folder |
| `GET` | `/api/v1/search?q=&type=` | Search by name (`type`: `all`, `folders`, `files`) |
| `GET` | `/health` | Health check |

## Design Decisions

- **Adjacency list** for the folder schema — simple indexed reads, efficient writes, ORM-friendly
- **Client-side O(n) tree build** — single pass with a Map, no recursive SQL
- **Virtual scroll** — DOM stays at ~30 nodes regardless of total folder count
- **In-process TTL cache** — the hot `GET /folders` endpoint is cached for 30s
- **`pg_trgm` GIN index** — makes case-insensitive ILIKE search fast at scale
```

- [ ] **Step 2: Run the full test suite one final time**

```bash
# Unit tests — backend
cd apps/backend && bun test tests/unit

# Integration tests — backend
bun run test:integration

# Unit tests — frontend
cd ../frontend && bun run test

# E2E
bun run test:e2e
```

Expected: all green.

- [ ] **Step 3: Final commit**

```bash
cd ../..
git add README.md
git commit -m "docs: project README with setup, architecture, and API reference"
```

---

## Self-Review

**Spec coverage check:**

| Requirement | Task(s) |
|-------------|---------|
| Split-panel UI (30/70) | Task 22 — ExplorerView |
| Full folder tree on load | Task 18 (store.fetchAll), Task 22 |
| Right panel — direct children | Task 8 (GetFolderChildren), Task 22 |
| Collapsible folders | Task 15 (useFolderTree toggle), Task 20 |
| Files in right panel | Task 11 (PrismaFileRepository), Task 21 |
| Search | Task 9 (SearchItems), Task 17 (useSearch), Task 22 |
| Hexagonal architecture | Tasks 4–12 |
| Service + repository layers | Tasks 5, 11 |
| Unit tests — backend | Tasks 7, 8, 9, 10 |
| Unit tests — frontend composables | Tasks 15, 16, 17 |
| Unit tests — UI components | Task 19 |
| Integration tests | Task 11 |
| E2E tests | Task 23 |
| REST API standards | Task 12 |
| Bun runtime | Tasks 1, 2, 13 |
| Elysia | Task 12 |
| Monorepo | Task 1 |
| ORM (Prisma) | Tasks 3, 11 |
| Scalability (virtual scroll, cache, indexes) | Tasks 3, 10, 16, 20 |
| PostgreSQL | Tasks 1, 3 |
| SOLID | ✓ throughout — each use case has one responsibility, dependencies injected via interfaces |

All spec sections covered. No TBDs or placeholder steps. Types are consistent throughout (`FolderDto`, `FileDto`, `TreeNode`, `FlatNode`, `SearchResultData`).
