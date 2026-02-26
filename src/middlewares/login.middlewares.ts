import { checkSchema } from 'express-validator'
import { validate } from '~/utils/validation'

export const loginValidator = validate(
  checkSchema(
    {
      email: {
        notEmpty: {
          errorMessage: 'Email is required'
        },
        isEmail: {
          errorMessage: 'Email is invalid'
        },
        trim: true
      },
      password: {
        notEmpty: {
          errorMessage: 'Password is required'
        },
        isString: {
          errorMessage: 'Password must be a string'
        }
      }
    },
    ['body']
  )
)

