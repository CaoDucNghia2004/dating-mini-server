import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import HTTP_STATUS from '~/constants/httpStatus'
import { PROFILE_MESSAGES } from '~/constants/messages'
import { CreateProfileReqBody, LikeProfileReqParams, LoginReqBody } from '~/models/requests/Profile.requests'
import profilesService from '~/services/profiles.services'

export const createProfileController = async (
  req: Request<ParamsDictionary, any, CreateProfileReqBody>,
  res: Response
) => {
  const result = await profilesService.createProfile(req.body)
  return res.status(HTTP_STATUS.CREATED).json({
    message: PROFILE_MESSAGES.CREATE_PROFILE_SUCCESS,
    data: result
  })
}

export const loginController = async (req: Request<ParamsDictionary, any, LoginReqBody>, res: Response) => {
  const result = await profilesService.login(req.body)
  return res.status(HTTP_STATUS.OK).json({
    message: PROFILE_MESSAGES.LOGIN_SUCCESS,
    data: result
  })
}

export const getAllProfilesController = async (_req: Request, res: Response) => {
  const result = await profilesService.getAllProfiles()
  return res.status(HTTP_STATUS.OK).json({
    message: PROFILE_MESSAGES.GET_PROFILES_SUCCESS,
    data: result
  })
}

export const getProfileByIdController = async (req: Request<{ id: string }>, res: Response) => {
  const profileId = Number(req.params.id)

  if (!profileId || isNaN(profileId)) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      message: 'Invalid profile ID'
    })
  }

  const result = await profilesService.getProfileById(profileId)
  return res.status(HTTP_STATUS.OK).json({
    message: PROFILE_MESSAGES.GET_PROFILE_SUCCESS,
    data: result
  })
}

export const likeProfileController = async (req: Request<LikeProfileReqParams>, res: Response) => {
  const toUserId = Number(req.params.id)

  const fromUserId = Number(req.body.from_user_id)

  if (!fromUserId || !toUserId) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      message: 'Invalid user IDs'
    })
  }

  if (fromUserId === toUserId) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      message: 'Cannot like yourself'
    })
  }

  const result = await profilesService.likeProfile(fromUserId, toUserId)

  return res.status(HTTP_STATUS.OK).json({
    message: result.message,
    data: {
      isMatch: result.isMatch
    }
  })
}

export const getLikedProfilesController = async (req: Request<LikeProfileReqParams>, res: Response) => {
  const userId = Number(req.params.id)

  if (!userId) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      message: 'Invalid user ID'
    })
  }

  const result = await profilesService.getLikedProfiles(userId)

  return res.status(HTTP_STATUS.OK).json({
    message: PROFILE_MESSAGES.GET_LIKED_PROFILES_SUCCESS,
    data: result
  })
}

export const getMatchesController = async (req: Request<LikeProfileReqParams>, res: Response) => {
  const userId = Number(req.params.id)

  if (!userId) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      message: 'Invalid user ID'
    })
  }

  const result = await profilesService.getMatches(userId)

  return res.status(HTTP_STATUS.OK).json({
    message: PROFILE_MESSAGES.GET_MATCHES_SUCCESS,
    data: result
  })
}
