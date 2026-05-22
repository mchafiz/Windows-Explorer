# Windows Explorer — Design Spec
**Date:** 2026-05-22  
**Stack:** Bun · Elysia · Prisma · PostgreSQL · Vue 3 · TypeScript  
**Pattern:** Hexagonal Architecture · Monorepo

---

## 1. Overview

A Windows Explorer-like web application with a split-panel UI. The left panel displays a complete, collapsible folder tree. Clicking a folder populates the right panel with its direct subfolders and files (grid layout, 30/70 split).

On load, the frontend fetches all folders in a single API call and builds the tree client-side. The right panel fetches its content on demand via a dedicated endpoint, keeping the two concerns cleanly separated.

---

## 2. Project Structure

Bun workspace monorepo:

```
windows-explorer/
├── apps/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── domain/           # Entities, value objects, port interfaces
│   │   │   ├── application/      # Use cases — no framework dependencies
│   │   │   └── infrastructure/   # Elysia routes, Prisma repositories, cache
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   ├── tests/
│   │   │   ├── unit/
│   │   │   ├── integration/
│   │   │   └── e2e/
│   │   └── package.json
│   └── frontend/
│       ├── src/
│       │   ├── components/       # Dumb/presentational components
│       │   ├── composables/      # Business logic hooks
│       │   ├── services/         # API client
│       │   ├── stores/           # Pinia
│       │   └── views/            # Page-level components
│       ├── tests/
│       │   ├── unit/
│       │   └── e2e/
│       └── package.json
├── package.json                  # Bun workspace root
├── docker-compose.yml            # PostgreSQL (dev)
├── docker-compose.test.yml       # PostgreSQL (test, separate port)
└── .gitignore
```

---

## 3. Data Model

### Database: PostgreSQL

Two tables. Adjacency list pattern for the folder hierarchy — chosen for its simplicity, write efficiency, and native ORM support.

```sql
-- Self-referencing folders table
folders (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(255) NOT NULL,
  parent_id   UUID REFERENCES folders(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
)

-- Files belong to a single folder
files (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(255) NOT NULL,
  folder_id   UUID NOT NULL REFERENCES folders(id) ON DELETE CASCADE,
  mime_type   VARCHAR(100),
  size        BIGINT NOT NULL DEFAULT 0,   -- stored in bytes
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
)
```

### Indexes

```sql
-- Fast children lookup
CREATE INDEX idx_folders_parent_id ON folders(parent_id);
CREATE INDEX idx_files_folder_id   ON files(folder_id);

-- Trigram search (fast ILIKE on name)
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_folders_name_trgm ON folders USING GIN(name gin_trgm_ops);
CREATE INDEX idx_files_name_trgm   ON files   USING GIN(name gin_trgm_ops);
```

**Why adjacency list over nested sets / materialized paths:**  
Reads are `WHERE parent_id = $id` — one indexed lookup. Writes are a single row update — no path recalculation. If the dataset ever grows to millions and deep recursive SQL becomes necessary, a `path` (ltree) column can be added and backfilled without breaking the schema.

---

## 4. Backend Architecture

### Hexagonal (Ports & Adapters)

```
domain/
  entities/
    Folder.ts         # Folder value object
    File.ts           # File value object
  ports/
    IFolderRepository.ts   # interface: getFolders, getChildren, search
    IFileRepository.ts     # interface: getByFolderId

application/
  use-cases/
    GetFolderTree.ts       # returns all folders (flat)
    GetFolderChildren.ts   # returns subfolders + files for a given folder
    SearchItems.ts         # search folders and files by name

infrastructure/
  repositories/
    PrismaFolderRepository.ts   # implements IFolderRepository
    PrismaFileRepository.ts     # implements IFileRepository
  cache/
    InMemoryCache.ts            # TTL-based Map cache (30s default)
  http/
    routes/
      folder.routes.ts          # Elysia route definitions
      search.routes.ts
    middleware/
      error-handler.ts          # maps domain errors → HTTP responses
  database/
    prisma.ts                   # PrismaClient singleton
```

The use cases depend **only on port interfaces**, never on Prisma or Elysia. This makes them fully unit-testable with mocks and decoupled from infrastructure decisions.

### Caching

`GET /api/v1/folders` (full tree load) is cached in-process with a `Map<string, { data, expiresAt }>`. TTL: 30 seconds. Cache key: `"all-folders"`. Any future write operation invalidates the cache. No Redis needed for this scale — but the cache is behind an interface so it can be swapped.

---

## 5. API Design

**Base URL:** `/api/v1`  
**Convention:** RESTful, JSON, camelCase in responses.

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/v1/folders` | All folders as flat array |
| `GET` | `/api/v1/folders/:id` | Single folder metadata |
| `GET` | `/api/v1/folders/:id/children` | Direct subfolders + files |
| `GET` | `/api/v1/search?q=&type=` | Search by name (`type`: `all`, `folders`, `files`) |
| `GET` | `/health` | Health check |

### Response shapes

```ts
// GET /api/v1/folders
{ data: FolderDto[] }

// FolderDto
{ id: string; name: string; parentId: string | null; createdAt: string }

// GET /api/v1/folders/:id/children
{
  data: {
    folders: FolderDto[]
    files: FileDto[]
  }
}

// FileDto
{ id: string; name: string; folderId: string; mimeType: string | null; size: number; createdAt: string }

// GET /api/v1/search?q=holiday&type=all
{
  data: {
    folders: FolderDto[]
    files: FileDto[]
  }
  meta: { query: string; total: number }
}

// Error (all endpoints)
{
  error: {
    code: string        // e.g. "FOLDER_NOT_FOUND"
    message: string
    statusCode: number
  }
}
```

---

## 6. Frontend Design

### UI Layout (30/70 split)

```
┌─────────────────────────────────────────────────────────────┐
│  🔍  Search folders and files...                            │  ← toolbar
├──────────────┬──────────────────────────────────────────────┤
│              │  Pictures /                                  │  ← breadcrumb
│  📁 ROOT     │                                              │
│  ▼ 📁 Docs   │  ┌──────┐ ┌──────┐ ┌──────┐               │
│    📁 Work   │  │  📁  │ │  📁  │ │  🖼️  │               │
│    📁 Pers.  │  │Holid.│ │Family│ │photo │               │
│  ▶ 📁 Pics   │  └──────┘ └──────┘ └──────┘               │  ← right grid
│  ▶ 📁 Videos │                                              │
│              │                                              │
├──────────────┴──────────────────────────────────────────────┤
│  4 items · 2 folders, 2 files                               │  ← status bar
└─────────────────────────────────────────────────────────────┘
```

### Component Tree

```
ExplorerView.vue
├── SearchBar.vue              # debounced input, emits search event
├── FolderTree.vue             # virtualised scrollable left panel
│   └── FolderNode.vue         # single flat row: depth prop drives indent, ▶/▼ arrow, name
│                              # (NOT a recursive component — FolderTree maps over flatVisible[])
└── ContentPanel.vue           # right panel
    ├── BreadcrumbBar.vue      # path of selected folder
    ├── FolderGrid.vue         # grid of subfolder cards
    └── FileGrid.vue           # grid of file cards with type icons
```

### Composables

| Composable | Responsibility |
|------------|----------------|
| `useFolderTree` | Builds tree from flat array (O(n) Map algorithm); manages open/close state |
| `useVirtualScroll` | Flattens visible tree nodes; computes the visible window by scroll offset |
| `useSearch` | Debounces input (300ms); calls `folderService.search()`; returns results |

### Tree-building algorithm — O(n)

```ts
function buildTree(folders: FolderDto[]): TreeNode[] {
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

  return roots
}
```

Single pass, no recursion, no nested array searches. The tree is built once and stored in the Pinia store. Open/close state is toggled in O(1) by node ID.

### Virtual scroll strategy

Before rendering, the tree is flattened into a single array of currently-visible nodes (only nodes whose ancestors are all open). `useVirtualScroll` slices this array based on container scroll position, keeping the DOM to ~30 rows regardless of total count.

```ts
const flatVisible = computed(() => {
  const result: FlatNode[] = []
  function walk(nodes: TreeNode[], depth: number) {
    for (const node of nodes) {
      result.push({ ...node, depth })
      if (node.isOpen) walk(node.children, depth + 1)
    }
  }
  walk(treeRoots.value, 0)
  return result
})
```

### Pinia store — `folderStore`

```ts
state: {
  folders: FolderDto[]          // all folders, flat
  selectedFolderId: string | null
  // Record not Map — Pinia tracks plain objects reactively; Map mutations are not observed
  childrenMap: Record<string, { folders: FolderDto[]; files: FileDto[] }>
  loading: boolean
  error: string | null
}

getters: {
  treeRoots  // computed: buildTree(folders)
}

actions: {
  fetchAll()              // GET /api/v1/folders
  fetchChildren(id)       // GET /api/v1/folders/:id/children
  selectFolder(id)        // sets selectedFolderId, calls fetchChildren if not cached
}
```

---

## 7. Testing Strategy

### Backend — unit tests (Bun test)

Use cases tested with mocked repositories. No database, no HTTP.

```
tests/unit/application/
  get-folder-tree.usecase.test.ts
  get-folder-children.usecase.test.ts
  search-items.usecase.test.ts
tests/unit/domain/
  folder.entity.test.ts
```

### Frontend — unit tests (Vitest + Vue Test Utils)

Composables and components tested in isolation.

```
tests/unit/composables/
  useFolderTree.test.ts       # buildTree correctness, open/close state
  useVirtualScroll.test.ts    # visible window slicing
  useSearch.test.ts           # debounce, query emission
tests/unit/components/
  FolderNode.test.ts          # renders indent + arrow, emits select/toggle
  SearchBar.test.ts           # debounce, emits on input
```

### Backend — integration tests (Bun test + test DB)

Real PostgreSQL via `docker-compose.test.yml`. Schema applied via `prisma migrate reset` before each run.

```
tests/integration/
  folder-repository.test.ts   # CRUD, children lookup, deep hierarchies
  search-repository.test.ts   # trigram search accuracy
```

### E2E — Playwright

Lean — only the critical user journeys.

```
tests/e2e/
  explorer.spec.ts
    ✓ Page load → left panel renders full folder tree
    ✓ Click folder → right panel shows correct subfolders and files
    ✓ Expand/collapse folder → tree state updates correctly
    ✓ Search → results appear in both panels
```

Test DB is isolated (`docker-compose.test.yml`, separate port), seeded with fixtures before E2E runs.

---

## 8. Scalability Considerations

| Concern | Solution |
|---------|----------|
| Large folder count in left panel | Virtual scroll — DOM stays ~30 rows regardless of total |
| Hot `GET /folders` endpoint | In-process TTL cache (30s), behind a swappable interface |
| Search performance | PostgreSQL `pg_trgm` GIN index — ILIKE queries stay fast at scale |
| Concurrent users | Stateless backend — horizontal scaling behind a load balancer is straightforward |
| Schema evolution | Adjacency list is migration-safe; `ltree` path column can be added without breaking changes |

---

## 9. Key Technical Decisions Summary

| Decision | Choice | Reason |
|----------|--------|--------|
| DB schema | Adjacency list | Simple reads, efficient writes, ORM-friendly |
| Tree building | O(n) client-side Map | Single pass, no recursion, easy to test |
| Architecture | Hexagonal | Use cases are framework-agnostic and testable in isolation |
| Caching | In-process TTL Map | Sufficient for this scale; swappable interface for Redis later |
| Virtual scroll | Custom `useVirtualScroll` composable | No library for folder trees — built from scratch per spec |
| ORM | Prisma | TypeScript-first, auto-generated client, migration tooling |
| Runtime | Bun | Faster startup, native test runner, workspace support |
