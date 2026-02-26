import { checkSchema } from 'express-validator'
import { verifyAccessToken } from '~/utils/commons'
import { validate } from '~/utils/validation'

export const profileValidator = validate(
  checkSchema(
    {
      name: {
        notEmpty: {
          errorMessage: 'Name is required'
        },
        isString: {
          errorMessage: 'Name must be a string'
        },
        trim: true,
        isLength: {
          options: { min: 2, max: 50 },
          errorMessage: 'Name must be between 2 and 50 characters'
        }
      },
      age: {
        notEmpty: {
          errorMessage: 'Age is required'
        },
        isInt: {
          options: { min: 13, max: 120 },
          errorMessage: 'Age must be between 13 and 120'
        }
      },
      gender: {
        notEmpty: {
          errorMessage: 'Gender is required'
        },
        isIn: {
          options: [['male', 'female', 'other']],
          errorMessage: 'Gender must be male, female or other'
        }
      },
      bio: {
        optional: true,
        isString: {
          errorMessage: 'Bio must be a string'
        },
        trim: true,
        isLength: {
          options: { max: 500 },
          errorMessage: 'Bio must be less than 500 characters'
        }
      },
      email: {
        notEmpty: {
          errorMessage: 'Email is required'
        },
        isEmail: {
          errorMessage: 'Email is invalid'
        },
        trim: true,
        normalizeEmail: true
      },
      password: {
        notEmpty: {
          errorMessage: 'Password is required'
        },
        isString: {
          errorMessage: 'Password must be a string'
        },
        isLength: {
          options: { min: 6, max: 50 },
          errorMessage: 'Password must be between 6 and 50 characters'
        }
      }
    },
    ['body']
  )
)

export const accessTokenValidator = validate(
  checkSchema(
    {
      Authorization: {
        custom: {
          options: async (value: string, { req }) => {
            const access_token = (value || '').split(' ')[1]

            return await verifyAccessToken(access_token, req as Request)
          }
        }
      }
    },
    ['headers']
  )
)
