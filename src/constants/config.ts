import { config } from 'dotenv'

config()

export const envConfig = {
  port: Number(process.env.PORT) || 4000,
  passwordSecret: process.env.PASSWORD_SECRET as string,
  jwtSecretAccessToken: process.env.JWT_SECRET_ACCESS_TOKEN as string,
  accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '7d'
}
