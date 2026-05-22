# Windows Explorer

A full-stack file explorer web application — split-panel UI with a collapsible folder tree, file browsing, and real-time search.

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

## Architecture

**Backend** — Hexagonal (Ports & Adapters) with three layers:

```
domain/        # Entities and port interfaces. Zero framework dependencies.
application/   # Use cases that depend only on port interfaces — fully unit-testable.
infrastructure/ # Elysia routes, Prisma repositories, in-memory TTL cache.
```

**Frontend** — Vue 3 SPA with Pinia. The folder tree is built client-side from a flat API response using an **O(n) Map algorithm** — no third-party tree libraries. A custom `useVirtualScroll` composable keeps the DOM at ~30 nodes regardless of total folder count.

## Getting Started

**Prerequisites:** Bun ≥ 1.1, Docker (or Podman)

```bash
# 1. Install
git clone <repo> && cd windows-explorer
bun install

# 2. Start the database
docker compose up -d   # or: podman-compose up -d

# 3. Configure backend
cp apps/backend/.env.example apps/backend/.env

# 4. Run migrations and seed
cd apps/backend
bun run db:migrate
bun run db:seed

# 5. Start servers (two terminals)
bun run dev   # backend: http://localhost:3001
              # frontend: http://localhost:5173
```

Open **http://localhost:5173**.

## Running Tests

```bash
# Backend — unit tests
cd apps/backend && bun test tests/unit

# Backend — integration tests (test DB must be running)
docker compose -f docker-compose.test.yml up -d
bun run test:integration

# Frontend — unit tests
cd apps/frontend && bun run test

# E2E (backend + frontend both running)
bun run test:e2e
```

## API

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/v1/folders` | All folders (flat array, frontend builds tree) |
| `GET` | `/api/v1/folders/:id/children` | Direct subfolders and files |
| `GET` | `/api/v1/search?q=&type=` | Search by name (`type`: `all` \| `folders` \| `files`) |
| `GET` | `/health` | Health check |

## Design Notes

- **Adjacency list** for the schema — simple indexed reads (`WHERE parent_id = $id`), single-row writes, ORM-native
- **O(n) client-side tree build** — one Map pass, no recursion, no repeated array searches
- **Virtual scroll** — flattens visible nodes to a plain array; only renders the visible slice
- **In-process TTL cache** — the hot `GET /folders` endpoint caches for 30s behind a swappable interface
- **`pg_trgm` GIN index** — case-insensitive `ILIKE` search stays fast at scale
