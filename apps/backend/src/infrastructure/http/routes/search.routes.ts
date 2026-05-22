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
