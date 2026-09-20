/**
 * Consultation booking helpers — pricing and timezone math.
 * The price map is the single source of truth; the API always prices
 * server-side from this map and never trusts a client-supplied amount.
 */

export const BOOKING_CURRENCY = "INR"

// Duration (minutes) → price. Keep in sync with the modal's UI.
export const BOOKING_PRICES: Record<number, number> = {
    15: 200,
    30: 400,
    45: 500,
    60: 600,
}

export const BOOKING_DURATIONS = [15, 30, 45, 60] as const

// Bookable window (wall-clock minutes since midnight, in MEETING_TIMEZONE) and
// the grid granularity. A slot must fully fit inside [open, close).
export const BOOKING_OPEN_MIN = 9 * 60 // 09:00
export const BOOKING_CLOSE_MIN = 18 * 60 // 18:00
export const SLOT_STEP_MIN = 15
// A PENDING (unpaid) booking holds its slot for this long before it's released.
export const PENDING_HOLD_MIN = 20

export function priceForDuration(durationMin: number): number | null {
    return BOOKING_PRICES[durationMin] ?? null
}

export function minToTime(m: number): string {
    const h = Math.floor(m / 60)
    const mm = m % 60
    return `${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`
}

export function timeToMin(t: string): number | null {
    if (!/^\d{2}:\d{2}$/.test(t || "")) return null
    const [h, m] = t.split(":").map(Number)
    return h * 60 + m
}

// Default "current work hours" used when a day has no configured hours.
export const DEFAULT_OPEN_TIME = minToTime(BOOKING_OPEN_MIN) // "09:00"
export const DEFAULT_CLOSE_TIME = minToTime(BOOKING_CLOSE_MIN) // "18:00"

// Weekday keys. WEEKDAYS is the admin display order (Mon–Sun); DOW_KEYS is
// indexed by Date.getUTCDay() (0 = Sunday).
export const WEEKDAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const
export const DOW_KEYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const

export interface DayHours {
    enabled: boolean
    open: string
    close: string
}
export type ConsultationHours = Partial<Record<string, DayHours>>
export interface PauseWindow {
    start: string // "YYYY-MM-DDTHH:MM" (local to MEETING_TIMEZONE)
    end: string
    reason?: string
}

// The weekday key for a calendar date (tz-independent — a date is one weekday).
export function weekdayKeyForDate(dateStr: string): string {
    const dow = new Date(`${dateStr}T12:00:00Z`).getUTCDay()
    return DOW_KEYS[dow]
}

// Effective [open, close) minutes for a date, or null if that day is closed.
// A missing/undefined day falls back to the default work hours.
export function effectiveDayHours(hours: ConsultationHours | undefined, dateStr: string): { openMin: number; closeMin: number } | null {
    const day = hours?.[weekdayKeyForDate(dateStr)]
    if (!day) return { openMin: BOOKING_OPEN_MIN, closeMin: BOOKING_CLOSE_MIN }
    if (day.enabled === false) return null
    const openMin = timeToMin(day.open) ?? BOOKING_OPEN_MIN
    const closeMin = timeToMin(day.close) ?? BOOKING_CLOSE_MIN
    if (closeMin <= openMin) return null
    return { openMin, closeMin }
}

// All candidate start times (HH:MM) whose full duration fits the bookable window.
export function candidateStartTimes(
    durationMin: number,
    openMin: number = BOOKING_OPEN_MIN,
    closeMin: number = BOOKING_CLOSE_MIN
): string[] {
    const times: string[] = []
    for (let m = openMin; m + durationMin <= closeMin; m += SLOT_STEP_MIN) {
        times.push(minToTime(m))
    }
    return times
}

// India has no DST, but resolve the offset generically so other zones work too.
function zoneOffsetMs(timeZone: string, date: Date): number {
    const dtf = new Intl.DateTimeFormat("en-US", {
        timeZone,
        hour12: false,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    })
    const parts = dtf.formatToParts(date)
    const map: Record<string, string> = {}
    for (const p of parts) map[p.type] = p.value
    const asUTC = Date.UTC(
        Number(map.year),
        Number(map.month) - 1,
        Number(map.day),
        Number(map.hour === "24" ? "0" : map.hour),
        Number(map.minute),
        Number(map.second)
    )
    return asUTC - date.getTime()
}

/**
 * Interpret a wall-clock date + time in the given IANA timezone and return
 * the absolute instant (UTC) it represents.
 * @param dateStr YYYY-MM-DD
 * @param timeStr HH:MM
 */
export function zonedToUtc(dateStr: string, timeStr: string, timeZone: string): Date {
    const naiveUTC = new Date(`${dateStr}T${timeStr}:00Z`)
    if (Number.isNaN(naiveUTC.getTime())) throw new Error("Invalid date/time")
    const offset = zoneOffsetMs(timeZone, naiveUTC)
    return new Date(naiveUTC.getTime() - offset)
}

// RFC3339 local date-time string (no zone suffix) for the Google Calendar API,
// which pairs it with an explicit timeZone field.
export function toLocalRfc3339(dateStr: string, timeStr: string): string {
    return `${dateStr}T${timeStr}:00`
}

// Format an absolute instant as a zone-local RFC3339 string (no offset suffix),
// paired with a timeZone field for the Google Calendar API.
export function formatLocalRfc3339(date: Date, timeZone: string): string {
    const dtf = new Intl.DateTimeFormat("en-CA", {
        timeZone,
        hour12: false,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    })
    const map: Record<string, string> = {}
    for (const p of dtf.formatToParts(date)) map[p.type] = p.value
    const hour = map.hour === "24" ? "00" : map.hour
    return `${map.year}-${map.month}-${map.day}T${hour}:${map.minute}:${map.second}`
}

export function addMinutesToLocal(dateStr: string, timeStr: string, minutes: number): string {
    // Compute the end wall-clock time by adding minutes to a zone-agnostic base.
    const base = new Date(`${dateStr}T${timeStr}:00Z`)
    const end = new Date(base.getTime() + minutes * 60_000)
    const y = end.getUTCFullYear()
    const mo = String(end.getUTCMonth() + 1).padStart(2, "0")
    const d = String(end.getUTCDate()).padStart(2, "0")
    const h = String(end.getUTCHours()).padStart(2, "0")
    const mi = String(end.getUTCMinutes()).padStart(2, "0")
    return `${y}-${mo}-${d}T${h}:${mi}:00`
}
