import express from 'express'
import { findCommonDateController, getDateController } from '~/controllers/dates.controllers'
import { wrapRequestHandler } from '~/utils/handlers'

const datesRouter = express.Router()

datesRouter.post('/find-common', wrapRequestHandler(findCommonDateController))

datesRouter.get('/:matchId', wrapRequestHandler(getDateController))

export default datesRouter

