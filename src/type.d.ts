import { Request } from 'express'
import { TokenPayload } from '~/models/requests/Profile.requests'

declare module 'express' {
  interface Request {
    decoded_authorization?: TokenPayload
  }
}
