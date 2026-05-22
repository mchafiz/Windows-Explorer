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
