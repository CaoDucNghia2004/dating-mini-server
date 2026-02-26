import { createHash } from 'crypto'
import { envConfig } from '~/constants/config'

export function sha256(content: string) {
  return createHash('sha256').update(content).digest('hex')
}

/**
 * Hash password using sha256 with secret
 * @param password - Plain text password
 * @returns Hashed password
 */
export function hashPassword(password: string) {
  return sha256(password + envConfig.passwordSecret)
}

/**
 * Compare plain text password with hashed password
 * @param password - Plain text password
 * @param hashedPassword - Hashed password from database
 * @returns True if password matches, false otherwise
 */
export function comparePassword(password: string, hashedPassword: string): boolean {
  return hashPassword(password) === hashedPassword
}
