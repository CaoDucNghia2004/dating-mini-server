import { Request, Response, NextFunction } from 'express'
import { omit } from 'lodash'
import HTTP_STATUS from '~/constants/httpStatus'
import { ErrorWithStatus } from '~/models/Errors'

export const defaultErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  try {
    if (err instanceof ErrorWithStatus) {
      return res.status(err.status).json(omit(err, ['status']))
    }

    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: 'Email already exists',
        errors: {
          email: {
            msg: 'This email is already registered'
          }
        }
      })
    }

    if (err.code && err.code.startsWith('SQLITE_')) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: 'Database error',
        errorInfo: {
          code: err.code,
          message: err.message
        }
      })
    }

    const finalError: any = {}

    Object.getOwnPropertyNames(err).forEach((key) => {
      if (
        !Object.getOwnPropertyDescriptor(err, key)?.configurable ||
        !Object.getOwnPropertyDescriptor(err, key)?.writable
      ) {
        return
      }
      finalError[key] = err[key]
    })

    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: finalError.message || 'Internal Server Error',
      errorInfo: omit(finalError, ['stack'])
    })
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: 'Internal Server Error',
      errorInfo: omit(error as any, ['stack'])
    })
  }
}
