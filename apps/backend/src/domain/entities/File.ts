export interface File {
  id: string
  name: string
  folderId: string
  mimeType: string | null
  size: number
  createdAt: Date
  updatedAt: Date
}
