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
