import { CreateProfileReqBody, LoginReqBody } from '~/models/requests/Profile.requests'
import databaseService from './database.services'
import { hashPassword, comparePassword } from '~/utils/crypto'
import { signAccessToken } from '~/utils/jwt'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import { PROFILE_MESSAGES } from '~/constants/messages'

class ProfilesService {
  async createProfile(payload: CreateProfileReqBody) {
    const db = databaseService.getDb()

    const hashedPassword = hashPassword(payload.password)

    const stmt = db.prepare(`
      INSERT INTO profiles (name, age, gender, bio, email, password)
      VALUES (?, ?, ?, ?, ?, ?)
    `)
    const result = stmt.run(payload.name, payload.age, payload.gender, payload.bio || '', payload.email, hashedPassword)

    const profile = db
      .prepare('SELECT id, name, age, gender, bio, email, created_at FROM profiles WHERE id = ?')
      .get(result.lastInsertRowid) as any

    return profile
  }

  async login(payload: LoginReqBody) {
    const db = databaseService.getDb()

    const user = db.prepare('SELECT * FROM profiles WHERE email = ?').get(payload.email) as any

    if (!user) {
      throw new ErrorWithStatus({
        message: PROFILE_MESSAGES.EMAIL_OR_PASSWORD_INCORRECT,
        status: HTTP_STATUS.UNAUTHORIZED
      })
    }

    const isPasswordValid = comparePassword(payload.password, user.password)

    if (!isPasswordValid) {
      throw new ErrorWithStatus({
        message: PROFILE_MESSAGES.EMAIL_OR_PASSWORD_INCORRECT,
        status: HTTP_STATUS.UNAUTHORIZED
      })
    }

    const access_token = await signAccessToken({ user_id: String(user.id) })

    const { password, ...userWithoutPassword } = user

    return {
      ...userWithoutPassword,
      access_token
    }
  }

  async getAllProfiles() {
    const db = databaseService.getDb()
    const profiles = db
      .prepare('SELECT id, name, age, gender, bio, email, created_at FROM profiles ORDER BY created_at DESC')
      .all()
    return profiles
  }

  async getProfileById(profileId: number) {
    const db = databaseService.getDb()

    const profile = db
      .prepare('SELECT id, name, age, gender, bio, email, created_at FROM profiles WHERE id = ?')
      .get(profileId) as any

    if (!profile) {
      throw new ErrorWithStatus({
        message: PROFILE_MESSAGES.PROFILE_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    return profile
  }

  async likeProfile(fromUserId: number, toUserId: number) {
    const db = databaseService.getDb()

    const existingLike = db
      .prepare(
        `
    SELECT * FROM likes 
    WHERE from_user_id = ? AND to_user_id = ?
  `
      )
      .get(fromUserId, toUserId)

    if (existingLike) {
      return {
        isMatch: false,
        message: 'Already liked this profile'
      }
    }

    db.prepare(
      `
    INSERT INTO likes (from_user_id, to_user_id)
    VALUES (?, ?)
  `
    ).run(fromUserId, toUserId)

    const reverseLike = db
      .prepare(
        `
    SELECT * FROM likes 
    WHERE from_user_id = ? AND to_user_id = ?
  `
      )
      .get(toUserId, fromUserId)

    if (reverseLike) {
      const user1Id = Math.min(fromUserId, toUserId)
      const user2Id = Math.max(fromUserId, toUserId)

      const existingMatch = db
        .prepare(
          `
      SELECT * FROM matches 
      WHERE user1_id = ? AND user2_id = ?
    `
        )
        .get(user1Id, user2Id)

      if (!existingMatch) {
        db.prepare(
          `
        INSERT INTO matches (user1_id, user2_id)
        VALUES (?, ?)
      `
        ).run(user1Id, user2Id)
      }

      return {
        isMatch: true,
        message: "It's a Match!"
      }
    }

    return {
      isMatch: false,
      message: 'Like saved successfully'
    }
  }

  async getLikedProfiles(userId: number) {
    const db = databaseService.getDb()

    const likedProfiles = db
      .prepare(
        `
      SELECT
        l.id as like_id,
        l.to_user_id,
        l.created_at as liked_at,
        p.id,
        p.name,
        p.age,
        p.gender,
        p.bio,
        p.email,
        p.created_at
      FROM likes l
      INNER JOIN profiles p ON l.to_user_id = p.id
      WHERE l.from_user_id = ?
      ORDER BY l.created_at DESC
    `
      )
      .all(userId) as any[]

    return likedProfiles.map((row) => ({
      like_id: row.like_id,
      liked_at: row.liked_at,
      profile: {
        id: row.id,
        name: row.name,
        age: row.age,
        gender: row.gender,
        bio: row.bio
      }
    }))
  }

  async getMatches(userId: number) {
    const db = databaseService.getDb()

    const matches = db
      .prepare(
        `
    SELECT 
      m.id as match_id,
      m.matched_at,
      CASE 
        WHEN m.user1_id = ? THEN m.user2_id
        ELSE m.user1_id
      END as matched_user_id
    FROM matches m
    WHERE m.user1_id = ? OR m.user2_id = ?
  `
      )
      .all(userId, userId, userId)

    const matchesWithProfiles = matches.map((match: any) => {
      const profile = db
        .prepare(
          `
      SELECT id, name, age, gender, bio
      FROM profiles
      WHERE id = ?
    `
        )
        .get(match.matched_user_id)

      return {
        match_id: match.match_id,
        matched_at: match.matched_at,
        profile: profile
      }
    })

    return matchesWithProfiles
  }
}

const profilesService = new ProfilesService()
export default profilesService
