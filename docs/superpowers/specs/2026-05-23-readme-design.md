# Spec: README Documentation
**Tanggal:** 2026-05-23  
**Status:** Approved

---

## Konteks

Project ini adalah reimplementasi Windows Explorer di browser — full-stack app dengan hexagonal backend (Bun + Elysia + Prisma + PostgreSQL) dan Vue 3 SPA di frontend. README yang ada sudah ada tapi perlu diganti dengan dokumentasi yang lebih lengkap dan akurat.

## Tujuan

Menulis ulang `README.md` yang melayani dua audiens sekaligus:
1. **Reviewer / recruiter** — baca bagian atas, langsung paham apa ini dan kenapa menarik
2. **Developer** — scroll ke bawah untuk detail arsitektur, flow, dan cara setup

## Pendekatan

**Opsi A — Top-Down Storytelling:** satu README dengan alur hero → fitur → stack → arsitektur backend → arsitektur frontend → database → flow → API → setup → testing.

---

## Struktur README

### Bagian 1: Hero + Fitur

- Judul + tagline satu kalimat yang menjelaskan apa dan kenapa
- Screenshot placeholder: `docs/screenshots/explorer-main.png`
- Satu kalimat konteks: "dibuat sebagai studi kasus arsitektur"
- Daftar fitur dalam prosa natural — tidak per-kategori, tidak emoji berjajar
- Fitur yang masuk (terverifikasi dari kode):
  - Folder: create, rename, move, delete (cascade)
  - File: upload, rename, move, delete, copy (nama `(copy)`, file fisik ikut disalin)
  - Multi-select: Ctrl+click, Shift+click, Ctrl+A
  - Keyboard: Del, Escape, Ctrl+A
  - Drag & drop multi-item dengan custom ghost image
  - Clipboard in-app: copy → paste file antar folder
  - Pencarian as-you-type debounce 300ms, case-insensitive
  - URL dinamis per folder (`/folder/:id`) dan file (`/file/:id`)
  - Dark/light mode, view mode (icons/details), sort A↔Z
  - File viewer: video, audio, image, download

### Bagian 2: Stack

Tabel sederhana: Runtime, HTTP Framework, ORM, Database, Frontend, State, Unit test BE, Unit test FE, E2E.

### Bagian 3: Arsitektur Backend

- Penjelasan Hexagonal Architecture (Domain / Application / Infrastructure)
- Directory tree dengan komentar per folder
- Satu kalimat kunci: "use case bisa diuji unit tanpa menyentuh database"
- Penjelasan tiap komponen:
  - Domain entities: plain TypeScript interface, zero dependency
  - Port interfaces: IFolderRepository, IFileRepository, ICache\<T\>
  - Use cases: GetFolderTree (cache TTL 30s), GetFolderChildren, SearchItems (Promise.all), MutateFolder (cache invalidate), MutateFile (UUID filename)
  - InMemoryCache\<T\>: Map internal + TTL per-entry, swappable
  - Routes: Elysia + schema validation, UUID divalidasi di route
  - File serving: MIME map, Cache-Control: public max-age=3600

### Bagian 4: Arsitektur Frontend

- Penjelasan singkat: Vue 3 SPA, tidak ada library tree eksternal
- Directory tree dengan komentar per file/folder
- Tiga hal menarik:
  1. **O(n) tree build** — dua pass Map, tidak ada rekursi, tidak ada find() berulang
  2. **Virtual scroll** — DOM tetap sekitar viewport ÷ 28px, pakai ResizeObserver
  3. **childrenMap** — cache client-side, fetch hanya saat folder pertama dibuka

### Bagian 5: Database

- Schema dua tabel: `folders` (self-referencing) dan `files`
- Adjacency list, CASCADE DELETE, UUID primary key
- `storage_path` menyimpan nama UUID, `name` menyimpan nama asli → rename tidak sentuh disk
- Index: `parent_id`, `folder_id`, GIN pg_trgm untuk ILIKE

### Bagian 6: Flow Lengkap

Dua contoh flow dalam ASCII diagram:
1. User buka folder → fetch children → update childrenMap → URL update
2. User upload file → multipart POST → tulis disk → simpan DB → update store lokal

### Bagian 7: API Reference

Tabel lengkap 13 endpoint:
- GET /api/v1/folders
- GET /api/v1/folders/:id/children
- POST /api/v1/folders
- PATCH /api/v1/folders/:id
- DELETE /api/v1/folders/:id
- GET /api/v1/files/:id
- POST /api/v1/files/upload
- POST /api/v1/files/:id/copy
- PATCH /api/v1/files/:id
- DELETE /api/v1/files/:id
- GET /api/v1/search?q=&type=
- GET /uploads/:filename
- GET /health

### Bagian 8: Getting Started

Prerequisites, clone, install, docker compose up, copy env, migrate, seed, jalankan dua terminal.

### Bagian 9: Testing

4 perintah: unit BE, integration BE (butuh test DB), unit FE, E2E.

---

## Tone & Gaya

- Bahasa Indonesia
- Tidak ada emoji berjajar per bullet
- Tidak ada framing "keuntungan nyata dari" atau kalimat terjemahan kaku
- Prosa direct dan opinionated — jelaskan *kenapa*, bukan hanya *apa*
- Kode dan command harus diambil langsung dari kode, bukan dikarang

---

## Catatan Akurasi (dari code review)

- Search: **debounce 300ms**, bukan real-time
- Folder copy: **tidak ada** (hanya file yang bisa dicopy)
- `MediaPlayer.vue` ada tapi tidak aktif dipakai di route — file viewer ada di `FileView.vue`
- Cache invalidation terjadi di setiap mutasi folder, bukan file
- `moveFolder` trigger re-fetch tree karena struktur berubah; mutasi lain cukup update lokal
