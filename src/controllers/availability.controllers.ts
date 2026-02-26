import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import HTTP_STATUS from '~/constants/httpStatus'
import { AVAILABILITY_MESSAGES } from '~/constants/messages'
import { AddAvailabilityReqBody, GetAvailabilityReqParams } from '~/models/requests/Availability.requests'
import availabilityService from '~/services/availability.services'

export const addAvailabilityController = async (
  req: Request<ParamsDictionary, any, AddAvailabilityReqBody>,
  res: Response
) => {
  const { user_id, match_id, availabilities } = req.body

  const result = await availabilityService.addAvailability(user_id, match_id, availabilities)

  return res.status(HTTP_STATUS.CREATED).json({
    message: result.message,
    data: {
      count: result.count
    }
  })
}

export const getAvailabilityController = async (req: Request<GetAvailabilityReqParams>, res: Response) => {
  const userId = Number(req.params.userId)
  const matchId = Number(req.params.matchId)

  const result = await availabilityService.getAvailability(userId, matchId)

  return res.status(HTTP_STATUS.OK).json({
    message: AVAILABILITY_MESSAGES.GET_AVAILABILITY_SUCCESS,
    data: result
  })
}
