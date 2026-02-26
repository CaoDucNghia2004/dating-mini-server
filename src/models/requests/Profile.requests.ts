import { JwtPayload } from 'jsonwebtoken'
import { TokenType } from '~/constants/enums'

export interface CreateProfileReqBody {
  name: string
  age: number
  gender: 'male' | 'female' | 'other'
  bio?: string
  email: string
  password: string
}

export interface LoginReqBody {
  email: string
  password: string
}

export interface LikeProfileReqParams {
  id: string // ID của người được like
}

export interface TokenPayload extends JwtPayload {
  user_id: string
  token_type: TokenType
  exp: number
  iat: number
}
