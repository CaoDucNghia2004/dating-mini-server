import express from 'express'
import { addAvailabilityController, getAvailabilityController } from '~/controllers/availability.controllers'
import { addAvailabilityValidator } from '~/middlewares/availability.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const availabilityRouter = express.Router()

availabilityRouter.post('/', addAvailabilityValidator, wrapRequestHandler(addAvailabilityController))

availabilityRouter.get('/:userId/:matchId', wrapRequestHandler(getAvailabilityController))

export default availabilityRouter
