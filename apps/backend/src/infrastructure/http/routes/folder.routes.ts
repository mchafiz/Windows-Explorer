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
