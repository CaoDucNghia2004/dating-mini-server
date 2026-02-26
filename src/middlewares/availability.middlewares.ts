import { checkSchema } from 'express-validator'
import { validate } from '~/utils/validation'
import { isValidDateFormat, isValidTimeFormat, isWithinNext3Weeks, isValidTimeRange } from '~/utils/date'
import { AVAILABILITY_MESSAGES } from '~/constants/messages'

export const addAvailabilityValidator = validate(
  checkSchema(
    {
      user_id: {
        notEmpty: {
          errorMessage: 'User ID is required'
        },
        isInt: {
          options: { min: 1 },
          errorMessage: 'User ID must be a positive integer'
        }
      },
      match_id: {
        notEmpty: {
          errorMessage: 'Match ID is required'
        },
        isInt: {
          options: { min: 1 },
          errorMessage: 'Match ID must be a positive integer'
        }
      },
      availabilities: {
        notEmpty: {
          errorMessage: 'Availabilities array is required'
        },
        isArray: {
          options: { min: 1 },
          errorMessage: 'Availabilities must be a non-empty array'
        },
        custom: {
          options: (value) => {
            if (!Array.isArray(value)) return false

            for (const slot of value) {
              if (!slot.date || !slot.start_time || !slot.end_time) {
                throw new Error('Each slot must have date, start_time, and end_time')
              }

              if (!isValidDateFormat(slot.date)) {
                throw new Error(AVAILABILITY_MESSAGES.INVALID_DATE_FORMAT)
              }

              if (!isWithinNext3Weeks(slot.date)) {
                throw new Error(AVAILABILITY_MESSAGES.DATE_NOT_IN_RANGE)
              }

              if (!isValidTimeFormat(slot.start_time)) {
                throw new Error(`${AVAILABILITY_MESSAGES.INVALID_TIME_FORMAT} (start_time)`)
              }

              if (!isValidTimeFormat(slot.end_time)) {
                throw new Error(`${AVAILABILITY_MESSAGES.INVALID_TIME_FORMAT} (end_time)`)
              }

              if (!isValidTimeRange(slot.start_time, slot.end_time)) {
                throw new Error(AVAILABILITY_MESSAGES.INVALID_TIME_RANGE)
              }
            }

            return true
          }
        }
      }
    },
    ['body']
  )
)

