import express from 'express'
import {
  createProfileController,
  getAllProfilesController,
  getProfileByIdController,
  getLikedProfilesController,
  getMatchesController,
  likeProfileController,
  loginController
} from '~/controllers/profiles.controllers'
import { profileValidator } from '~/middlewares/profiles.middlewares'
import { loginValidator } from '~/middlewares/login.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'
const profilesRouter = express.Router()

profilesRouter.post('/create', profileValidator, wrapRequestHandler(createProfileController))
profilesRouter.post('/login', loginValidator, wrapRequestHandler(loginController))
profilesRouter.get('/', wrapRequestHandler(getAllProfilesController))
profilesRouter.get('/:id', wrapRequestHandler(getProfileByIdController))
profilesRouter.post('/:id/like', wrapRequestHandler(likeProfileController))
profilesRouter.get('/:id/likes', wrapRequestHandler(getLikedProfilesController))
profilesRouter.get('/:id/matches', wrapRequestHandler(getMatchesController))

export default profilesRouter
