import { Elysia } from 'elysia'
import { AppError } from '../../../application/errors/AppError'

export const errorHandler = new Elysia({ name: 'error-handler' }).onError(
  ({ error, set }) => {
    if (error instanceof AppError) {
      set.status = error.statusCode
      return { error: { code: error.code, message: error.message, statusCode: error.statusCode } }
    }

    console.error('[ERROR]', error)
    set.status = 500
    return {
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'Something went wrong', statusCode: 500 },
    }
  },
)
