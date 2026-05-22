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
