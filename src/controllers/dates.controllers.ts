import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import HTTP_STATUS from '~/constants/httpStatus'
import { AVAILABILITY_MESSAGES } from '~/constants/messages'
import { FindCommonDateReqBody, GetDateReqParams } from '~/models/requests/Availability.requests'
import availabilityService from '~/services/availability.services'

export const findCommonDateController = async (
  req: Request<ParamsDictionary, any, FindCommonDateReqBody>,
  res: Response
) => {
  const { match_id } = req.body

  const result = await availabilityService.findCommonDate(match_id)

  return res.status(HTTP_STATUS.OK).json({
    message: result.message,
    data: {
      found: result.found,
      date: result.date || null
    }
  })
}

export const getDateController = async (req: Request<GetDateReqParams>, res: Response) => {
  const matchId = Number(req.params.matchId)

  const result = await availabilityService.getDate(matchId)

  if (!result) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      message: AVAILABILITY_MESSAGES.DATE_NOT_FOUND
    })
  }

  return res.status(HTTP_STATUS.OK).json({
    message: AVAILABILITY_MESSAGES.GET_DATE_SUCCESS,
    data: result
  })
}
