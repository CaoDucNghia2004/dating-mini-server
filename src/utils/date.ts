/**
 * Validate date format YYYY-MM-DD
 */
export const isValidDateFormat = (dateStr: string): boolean => {
  const regex = /^\d{4}-\d{2}-\d{2}$/
  if (!regex.test(dateStr)) return false

  const date = new Date(dateStr)
  return date instanceof Date && !isNaN(date.getTime())
}

/**
 * Validate time format HH:MM (24-hour format)
 */
export const isValidTimeFormat = (timeStr: string): boolean => {
  const regex = /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/
  return regex.test(timeStr)
}

/**
 * Check if date is within next 3 weeks from today
 */
export const isWithinNext3Weeks = (dateStr: string): boolean => {
  const inputDate = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0) // Reset time to start of day

  const threeWeeksLater = new Date(today)
  threeWeeksLater.setDate(today.getDate() + 21) // 3 weeks = 21 days

  return inputDate >= today && inputDate <= threeWeeksLater
}

/**
 * Check if start_time is before end_time
 */
export const isValidTimeRange = (startTime: string, endTime: string): boolean => {
  const [startHour, startMin] = startTime.split(':').map(Number)
  const [endHour, endMin] = endTime.split(':').map(Number)

  const startMinutes = startHour * 60 + startMin
  const endMinutes = endHour * 60 + endMin

  return startMinutes < endMinutes
}

/**
 * Format date to Vietnamese format
 */
export const formatDateVN = (dateStr: string): string => {
  const date = new Date(dateStr)
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

