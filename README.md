# Windows Explorer Web Edition

Reimplementasi Windows Explorer di browser: split-panel UI, folder tree dengan virtual scroll, drag & drop, pencarian as-you-type, dan halaman dedicated per file.

Dibuat sebagai studi kasus arsitektur hexagonal dengan Bun + Elysia + Prisma di backend, dan Vue 3 SPA di frontend tanpa library tree eksternal.

![Screenshot 1](docs/screenshots/screenshot-1.png)
![Screenshot 2](docs/screenshots/screenshot-2.png)
![Screenshot 3](docs/screenshots/screenshot-3.png)
![Screenshot 4](docs/screenshots/screenshot-4.png)

---

## Fitur

- Buat, rename, pindah, dan hapus folder (hapus folder cascade ke seluruh isinya)
- Upload file ke folder aktif, lalu rename, salin, pindah, atau hapus
- Klik kanan untuk context menu, atau pakai keyboard: `Ctrl+A`, `Del`, `Escape`
- Multi-select dengan Ctrl+click dan Shift+click, drag & drop ke folder lain
- Cari file dan folder (debounce 300ms, case-insensitive)
- Setiap folder dan file punya URL sendiri yang bisa dibagikan langsung
- Dark mode, view mode icons/details, sort A-Z atau Z-A

---

## Stack

| Layer | Teknologi |
|---|---|
| Runtime | Bun |
| HTTP Framework | Elysia |
| ORM | Prisma |
| Database | PostgreSQL 16 |
| Frontend | Vue 3 (Composition API) |
| State management | Pinia |
| Unit test (BE) | Bun test |
| Unit test (FE) | Vitest + Vue Test Utils |
| E2E test | Playwright |

---

## Gambaran Sistem

![Architecture](docs/screenshots/arch.png)

Domain layer tidak tahu apa-apa tentang Elysia, Prisma, atau PostgreSQL. Application layer hanya bicara lewat port interface, jadi implementasinya bisa diganti tanpa menyentuh use case.

---

## Arsitektur Backend

Backend pakai **Hexagonal Architecture** (Ports & Adapters) dengan tiga layer yang tidak saling bergantung kecuali lewat interface:

```
src/
├── domain/           # Entity dan port interface, zero framework dependency
│   ├── entities/     # Folder, File (plain TypeScript object)
│   └── ports/        # IFolderRepository, IFileRepository, ICache<T>
│
├── application/      # Use case, hanya kenal port interface bukan implementasi
│   ├── use-cases/    # GetFolderTree, GetFolderChildren, SearchItems, MutateFolder, MutateFile
│   ├── dtos/         # FolderDto, FileDto (batas antara layer)
│   └── errors/       # AppError dengan kode error spesifik
│
└── infrastructure/   # Framework, database, network
    ├── http/          # Elysia routes, error handler middleware
    ├── repositories/  # PrismaFolderRepository, PrismaFileRepository
    └── cache/         # InMemoryCache<T>
```

Use case bisa diuji unit tanpa menyentuh database, cukup inject mock yang implement `IFolderRepository`.

### Detail komponen

**Domain entities** - `Folder` dan `File` adalah plain TypeScript interface, tidak ada method, decorator, atau ORM dependency sama sekali.

**Port interfaces** - `IFolderRepository` mendefinisikan kontrak: `findAll`, `findById`, `findChildren`, `searchByName`, `create`, `rename`, `move`, `delete`. Implementasi bisa diganti dari Prisma ke raw SQL tanpa menyentuh use case.

**Use cases:**

- `GetFolderTree` - ambil semua folder flat, cek cache dulu, TTL 30 detik
- `GetFolderChildren` - ambil subfolder + file dalam satu folder sekaligus
- `SearchItems` - jalankan `Promise.all` ke folder dan file repository secara paralel
- `MutateFolder` - create/rename/move/delete, invalidate cache setelahnya
- `MutateFile` - create/rename/move/delete/copy, upload ke disk dengan UUID filename

**InMemoryCache** - implementasi `ICache<T>` dengan `Map` internal dan TTL per-entry. Bisa diganti Redis tanpa mengubah `GetFolderTree`.

**Routes** - Elysia dengan schema validation bawaan (`t.Object`, `t.String`). UUID divalidasi di level route.

**File serving** - `GET /uploads/:filename` serve file yang sudah diupload dengan MIME type yang tepat dan `Cache-Control: public, max-age=3600`.

---

## Arsitektur Frontend

Vue 3 SPA dengan Composition API dan Pinia. Tidak ada library tree eksternal, semua dibangun sendiri.

```
src/
├── views/
│   ├── ExplorerView.vue    # Shell utama: sidebar + content panel
│   └── FileView.vue        # Halaman per-file: video/audio/image player atau download
│
├── components/
│   ├── FolderTree.vue      # Sidebar tree, render lewat virtual scroll
│   ├── FolderNode.vue      # Satu baris folder di tree
│   ├── ContentPanel.vue    # Area konten kanan, grid atau list
│   ├── FolderGrid.vue      # Render folder di content panel
│   ├── FileGrid.vue        # Render file di content panel
│   ├── BreadcrumbBar.vue   # Path navigasi
│   ├── SearchBar.vue       # Input pencarian
│   ├── ContextMenu.vue     # Menu klik kanan
│   ├── MoveToModal.vue     # Tree picker untuk pindah item
│   ├── PropertiesModal.vue # Metadata file/folder
│   ├── InputDialog.vue     # Pengganti window.prompt
│   └── Toast.vue           # Notifikasi non-blocking
│
├── stores/
│   └── folderStore.ts      # Source of truth: folders, childrenMap, selectedFolderId
│
├── services/
│   └── folderService.ts    # Semua HTTP call ke backend, tidak ada logic di sini
│
├── composables/
│   ├── useFolderTree.ts    # buildTree() + useFolderTree(), O(n) Map, open/close state
│   ├── useVirtualScroll.ts # Hitung slice yang terlihat dari scrollTop dan containerHeight
│   ├── useSearch.ts        # Debounce 300ms, cancel timer tiap keystroke
│   ├── useDragDrop.ts      # Shared state drag items (ref global)
│   ├── useTheme.ts         # Dark/light mode, persist ke localStorage
│   └── useToast.ts         # Toast queue
│
├── router/
│   └── index.ts            # /, /folder/:folderId, /file/:fileId
│
└── types/
    └── folder.ts           # FolderDto, FileDto, TreeNode, FlatNode, SearchResultData
```

### Catatan implementasi

**O(n) tree build** - `buildTree()` di `useFolderTree.ts` dua pass: pertama isi Map `id -> TreeNode`, kedua pasang parent-child. Tidak ada rekursi atau `find()` berulang. Backend kirim flat array, frontend yang bangun pohonnya.

**Virtual scroll** - `FolderTree` tidak render semua node sekaligus. `useVirtualScroll` hitung `start` dan `end` index dari `scrollTop` dan `containerHeight`, render hanya slice itu dengan posisi absolut. DOM tetap sekitar viewport / 28px node, tidak peduli jumlah foldernya.

**childrenMap** - `folderStore` pakai `childrenMap` sebagai cache client-side. Children di-fetch saat folder pertama kali dibuka, request berikutnya ambil dari cache langsung. Setiap mutasi update state lokal tanpa re-fetch, kecuali `moveFolder` yang terpaksa re-fetch karena struktur tree berubah.

---

## Database

Dua tabel dengan **adjacency list**, folder menyimpan `parent_id` yang menunjuk ke folder parent-nya.

```sql
-- Folder: self-referencing dengan cascade delete
folders (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       VARCHAR(255),
  parent_id  UUID REFERENCES folders(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- File: selalu punya folder parent
files (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         VARCHAR(255),
  folder_id    UUID REFERENCES folders(id) ON DELETE CASCADE,
  mime_type    VARCHAR(100),
  size         BIGINT DEFAULT 0,
  storage_path VARCHAR(500),  -- nama file di disk (UUID-based)
  created_at   TIMESTAMPTZ,
  updated_at   TIMESTAMPTZ
)
```

Index: `folders(parent_id)`, `files(folder_id)`, dan GIN index `pg_trgm` untuk pencarian ILIKE case-insensitive.

`storage_path` simpan nama UUID di disk (`<uuid>.<ext>`), nama aslinya di kolom `name`. Jadi rename file tidak perlu sentuh filesystem.

Hapus folder cascade ke subfolder dan file di dalamnya, ditangani PostgreSQL bukan application code.

---

## Flow

**Buka folder**

![Flow buka folder](docs/screenshots/flow-open-folder.png)

**Upload file**

![Flow upload file](docs/screenshots/flow-upload.png)

**Search**

![Flow search](docs/screenshots/flow-search.png)

**Cache lifecycle**

![Flow cache](docs/screenshots/flow-cache.png)

---

## API

| Method | Path | Keterangan |
|---|---|---|
| `GET` | `/api/v1/folders` | Semua folder dalam flat array |
| `GET` | `/api/v1/folders/:id/children` | Subfolder dan file langsung dalam folder |
| `POST` | `/api/v1/folders` | Buat folder baru |
| `PATCH` | `/api/v1/folders/:id` | Rename atau pindah folder |
| `DELETE` | `/api/v1/folders/:id` | Hapus folder beserta seluruh isinya |
| `GET` | `/api/v1/files/:id` | Ambil metadata satu file |
| `POST` | `/api/v1/files/upload` | Upload file (multipart/form-data) |
| `POST` | `/api/v1/files/:id/copy` | Salin file ke folder lain |
| `PATCH` | `/api/v1/files/:id` | Rename atau pindah file |
| `DELETE` | `/api/v1/files/:id` | Hapus file |
| `GET` | `/api/v1/search?q=&type=` | Cari file dan folder (`type`: `all` \| `folders` \| `files`) |
| `GET` | `/uploads/:filename` | Serve file yang sudah diupload |
| `GET` | `/health` | Health check |

---

## Menjalankan Lokal

Butuh: Bun >= 1.1, Docker (atau Podman)

```bash
# clone dan install
git clone <repo-url>
cd windows-explorer-app
bun install

# jalankan database
docker compose up -d

# setup env backend
cp apps/backend/.env.example apps/backend/.env

# migrasi dan seed
cd apps/backend
bun run db:migrate
bun run db:seed

# jalankan (dua terminal)
bun run dev   # backend  -> http://localhost:3001
              # frontend -> http://localhost:5173
```

Buka http://localhost:5173.

---

## Testing

```bash
# unit test backend
cd apps/backend && bun test tests/unit

# integration test (butuh test DB jalan dulu)
docker compose -f docker-compose.test.yml up -d
bun run test:integration

# unit test frontend
cd apps/frontend && bun run test

# e2e (backend dan frontend harus jalan)
bun run test:e2e
```
