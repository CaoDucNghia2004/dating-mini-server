import express from 'express'
import cors from 'cors'

import { envConfig } from './constants/config'
import profilesRouter from './routes/profiles.routes'
import availabilityRouter from './routes/availability.routes'
import datesRouter from './routes/dates.routes'
import databaseService from './services/database.services'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import HTTP_STATUS from './constants/httpStatus'

const app = express()

app.use(
  cors({
    origin: 'http://localhost:3000', // Frontend port
    credentials: true
  })
)

app.use(express.json())
const port = envConfig.port || 4000

app.get('/', (_req, res) => {
  res.json({
    message: 'Dating Mini API',
    status: 'running'
  })
})

app.use('/profile', profilesRouter)
app.use('/availability', availabilityRouter)
app.use('/dates', datesRouter)

app.use((_req, res) => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    message: 'Route not found'
  })
})

app.use(defaultErrorHandler)

app.listen(port, () => {
  console.log(`ðŸš€ Server is running on port ${port}`)
})

process.on('SIGINT', () => {
  databaseService.close()
  process.exit(0)
})
