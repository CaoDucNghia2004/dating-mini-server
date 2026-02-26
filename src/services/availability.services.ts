import databaseService from './database.services'
import { AvailabilitySlot } from '~/models/requests/Availability.requests'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import { AVAILABILITY_MESSAGES } from '~/constants/messages'
import { formatDateVN } from '~/utils/date'

class AvailabilityService {
  async addAvailability(userId: number, matchId: number, slots: AvailabilitySlot[]) {
    const db = databaseService.getDb()

    const match = db
      .prepare(
        `
      SELECT user1_id, user2_id FROM matches WHERE id = ?
    `
      )
      .get(matchId) as any

    if (!match) {
      throw new ErrorWithStatus({
        message: AVAILABILITY_MESSAGES.MATCH_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    if (match.user1_id !== userId && match.user2_id !== userId) {
      throw new ErrorWithStatus({
        message: AVAILABILITY_MESSAGES.USER_NOT_IN_MATCH,
        status: HTTP_STATUS.FORBIDDEN
      })
    }

    db.prepare(
      `
      DELETE FROM availabilities
      WHERE user_id = ? AND match_id = ?
    `
    ).run(userId, matchId)

    const stmt = db.prepare(`
      INSERT INTO availabilities (user_id, match_id, date, start_time, end_time)
      VALUES (?, ?, ?, ?, ?)
    `)

    for (const slot of slots) {
      stmt.run(userId, matchId, slot.date, slot.start_time, slot.end_time)
    }

    return {
      message: AVAILABILITY_MESSAGES.ADD_AVAILABILITY_SUCCESS,
      count: slots.length
    }
  }

  async findAllCommonSlots(matchId: number) {
    const db = databaseService.getDb()

    const match = db
      .prepare(
        `
      SELECT user1_id, user2_id FROM matches WHERE id = ?
    `
      )
      .get(matchId) as any

    if (!match) {
      throw new ErrorWithStatus({
        message: AVAILABILITY_MESSAGES.MATCH_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const user1Slots = db
      .prepare(
        `
      SELECT date, start_time, end_time
      FROM availabilities
      WHERE user_id = ? AND match_id = ?
      ORDER BY date, start_time
    `
      )
      .all(match.user1_id, matchId) as any[]

    const user2Slots = db
      .prepare(
        `
      SELECT date, start_time, end_time
      FROM availabilities
      WHERE user_id = ? AND match_id = ?
      ORDER BY date, start_time
    `
      )
      .all(match.user2_id, matchId) as any[]

    if (user1Slots.length === 0 || user2Slots.length === 0) {
      return {
        found: false,
        message: AVAILABILITY_MESSAGES.BOTH_USERS_NEED_AVAILABILITY,
        commonSlots: []
      }
    }

    const commonSlots: any[] = []

    for (const slot1 of user1Slots) {
      for (const slot2 of user2Slots) {
        if (slot1.date === slot2.date) {
          const overlap = this.findOverlap(slot1.start_time, slot1.end_time, slot2.start_time, slot2.end_time)

          if (overlap) {
            commonSlots.push({
              date: slot1.date,
              start_time: overlap.start,
              end_time: overlap.end
            })
          }
        }
      }
    }

    if (commonSlots.length === 0) {
      return {
        found: false,
        message: AVAILABILITY_MESSAGES.NO_COMMON_TIME_FOUND,
        commonSlots: []
      }
    }

    return {
      found: true,
      message: `TÃ¬m tháº¥y ${commonSlots.length} slot trÃ¹ng nhau`,
      commonSlots
    }
  }

  async findCommonDate(matchId: number) {
    const db = databaseService.getDb()

    const match = db
      .prepare(
        `
      SELECT user1_id, user2_id FROM matches WHERE id = ?
    `
      )
      .get(matchId) as any

    if (!match) {
      throw new ErrorWithStatus({
        message: AVAILABILITY_MESSAGES.MATCH_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const user1Slots = db
      .prepare(
        `
      SELECT date, start_time, end_time
      FROM availabilities
      WHERE user_id = ? AND match_id = ?
      ORDER BY date, start_time
    `
      )
      .all(match.user1_id, matchId) as any[]

    const user2Slots = db
      .prepare(
        `
      SELECT date, start_time, end_time
      FROM availabilities
      WHERE user_id = ? AND match_id = ?
      ORDER BY date, start_time
    `
      )
      .all(match.user2_id, matchId) as any[]

    if (user1Slots.length === 0 || user2Slots.length === 0) {
      return {
        found: false,
        message: AVAILABILITY_MESSAGES.BOTH_USERS_NEED_AVAILABILITY
      }
    }

    for (const slot1 of user1Slots) {
      for (const slot2 of user2Slots) {
        if (slot1.date === slot2.date) {
          const overlap = this.findOverlap(slot1.start_time, slot1.end_time, slot2.start_time, slot2.end_time)

          if (overlap) {
            const existingDate = db
              .prepare(
                `
              SELECT * FROM dates WHERE match_id = ?
            `
              )
              .get(matchId)

            if (!existingDate) {
              db.prepare(
                `
                INSERT INTO dates (match_id, date, start_time, end_time)
                VALUES (?, ?, ?, ?)
              `
              ).run(matchId, slot1.date, overlap.start, overlap.end)
            }

            const dateFormatted = formatDateVN(slot1.date)

            return {
              found: true,
              message: `${AVAILABILITY_MESSAGES.COMMON_TIME_FOUND}: ${dateFormatted} tá»« ${overlap.start} Ä‘áº¿n ${overlap.end}`,
              date: {
                date: slot1.date,
                start_time: overlap.start,
                end_time: overlap.end
              }
            }
          }
        }
      }
    }

    return {
      found: false,
      message: AVAILABILITY_MESSAGES.NO_COMMON_TIME_FOUND
    }
  }

  private findOverlap(
    start1: string,
    end1: string,
    start2: string,
    end2: string
  ): { start: string; end: string } | null {
    const toMinutes = (time: string) => {
      const [h, m] = time.split(':').map(Number)
      return h * 60 + m
    }

    const toTimeString = (minutes: number) => {
      const h = Math.floor(minutes / 60)
        .toString()
        .padStart(2, '0')
      const m = (minutes % 60).toString().padStart(2, '0')
      return `${h}:${m}`
    }

    const s1 = toMinutes(start1)
    const e1 = toMinutes(end1)
    const s2 = toMinutes(start2)
    const e2 = toMinutes(end2)

    const overlapStart = Math.max(s1, s2)
    const overlapEnd = Math.min(e1, e2)

    if (overlapEnd - overlapStart >= 30) {
      return {
        start: toTimeString(overlapStart),
        end: toTimeString(overlapEnd)
      }
    }

    return null
  }

  async getDate(matchId: number) {
    const db = databaseService.getDb()

    const date = db
      .prepare(
        `
      SELECT * FROM dates WHERE match_id = ?
    `
      )
      .get(matchId)

    return date
  }

  async getAvailability(userId: number, matchId: number) {
    const db = databaseService.getDb()

    const match = db
      .prepare(
        `
      SELECT user1_id, user2_id FROM matches WHERE id = ?
    `
      )
      .get(matchId) as any

    if (!match) {
      throw new ErrorWithStatus({
        message: AVAILABILITY_MESSAGES.MATCH_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    if (match.user1_id !== userId && match.user2_id !== userId) {
      throw new ErrorWithStatus({
        message: AVAILABILITY_MESSAGES.USER_NOT_IN_MATCH,
        status: HTTP_STATUS.FORBIDDEN
      })
    }

    const slots = db
      .prepare(
        `
      SELECT date, start_time, end_time, created_at
      FROM availabilities
      WHERE user_id = ? AND match_id = ?
      ORDER BY date, start_time
    `
      )
      .all(userId, matchId)

    return slots
  }
}

const availabilityService = new AvailabilityService()
export default availabilityService
