export interface AvailabilitySlot {
  date: string // YYYY-MM-DD
  start_time: string // HH:MM
  end_time: string // HH:MM
}

export interface AddAvailabilityReqBody {
  user_id: number
  match_id: number
  availabilities: AvailabilitySlot[]
}

export interface FindCommonDateReqBody {
  match_id: number
}

export interface GetDateReqParams {
  matchId: string
}

export interface GetAvailabilityReqParams {
  userId: string
  matchId: string
}

