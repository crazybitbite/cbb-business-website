import { prisma } from "@/lib/prisma"
import {
    zonedToUtc,
    candidateStartTimes,
    effectiveDayHours,
    PENDING_HOLD_MIN,
    type ConsultationHours,
    type PauseWindow,
} from "@/lib/booking"

export interface Slot {
    time: string
    available: boolean
}

// Minimum lead time before a slot can be booked.
const LEAD_MIN = 15

function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
    return aStart < bEnd && bStart < aEnd
}

/** Admin-configured consultation hours + pause windows from Settings. */
async function getConsultationConfig(): Promise<{ hours: ConsultationHours; pauses: PauseWindow[] }> {
    const rows = await prisma.settings.findMany({
        where: { key: { in: ["consultationHours", "consultationPauses"] } },
    })
    const map: Record<string, any> = {}
    for (const r of rows) map[r.key] = r.value
    const hours = (map.consultationHours && typeof map.consultationHours === "object" ? map.consultationHours : {}) as ConsultationHours
    const pauses = (Array.isArray(map.consultationPauses) ? map.consultationPauses : []) as PauseWindow[]
    return { hours, pauses }
}

function pauseToInterval(p: PauseWindow, tz: string): { start: number; end: number } | null {
    if (!p?.start || !p?.end) return null
    const [sd, st] = String(p.start).split("T")
    const [ed, et] = String(p.end).split("T")
    if (!sd || !st || !ed || !et) return null
    try {
        const start = zonedToUtc(sd, st.slice(0, 5), tz).getTime()
        const end = zonedToUtc(ed, et.slice(0, 5), tz).getTime()
        return end > start ? { start, end } : null
    } catch {
        return null
    }
}

/**
 * Time ranges (epoch ms) that block new bookings on a given day: all CONFIRMED
 * bookings, PENDING ones still within their payment hold, and admin pause
 * windows. Overlaps use [start, start + duration), so different durations that
 * overlap in time correctly block each other.
 */
async function getBlockingIntervals(
    dateStr: string,
    tz: string,
    pauses: PauseWindow[]
): Promise<{ start: number; end: number }[]> {
    const dayStart = zonedToUtc(dateStr, "00:00", tz)
    const dayEnd = new Date(dayStart.getTime() + 24 * 3600_000)
    const holdCutoffSec = Math.floor(Date.now() / 1000) - PENDING_HOLD_MIN * 60

    const bookings = await prisma.booking.findMany({
        where: {
            startsAt: { gte: new Date(dayStart.getTime() - 4 * 3600_000), lt: dayEnd },
            status: { in: ["CONFIRMED", "PENDING"] },
        },
        select: { startsAt: true, durationMin: true, status: true, createdAt: true },
    })

    const intervals: { start: number; end: number }[] = []
    for (const b of bookings) {
        if (b.status === "PENDING" && Number(b.createdAt) < holdCutoffSec) continue // release abandoned holds
        const start = b.startsAt.getTime()
        intervals.push({ start, end: start + b.durationMin * 60_000 })
    }
    // Admin pause windows block like bookings, so paused slots render as "booked".
    for (const p of pauses) {
        const iv = pauseToInterval(p, tz)
        if (iv) intervals.push(iv)
    }
    return intervals
}

/** Availability grid for a date + duration: every candidate slot, marked. */
export async function getDayAvailability(dateStr: string, durationMin: number, tz: string): Promise<Slot[]> {
    const { hours, pauses } = await getConsultationConfig()
    const dh = effectiveDayHours(hours, dateStr)
    if (!dh) return [] // closed day → no bookable slots

    const intervals = await getBlockingIntervals(dateStr, tz, pauses)
    const earliest = Date.now() + LEAD_MIN * 60_000

    return candidateStartTimes(durationMin, dh.openMin, dh.closeMin).map((time) => {
        const start = zonedToUtc(dateStr, time, tz).getTime()
        const end = start + durationMin * 60_000
        let available = start >= earliest
        if (available) {
            for (const iv of intervals) {
                if (overlaps(start, end, iv.start, iv.end)) {
                    available = false
                    break
                }
            }
        }
        return { time, available }
    })
}

/** Authoritative re-check used at checkout to guard against races. */
export async function isSlotAvailable(
    dateStr: string,
    timeStr: string,
    durationMin: number,
    tz: string
): Promise<boolean> {
    const { hours, pauses } = await getConsultationConfig()
    const dh = effectiveDayHours(hours, dateStr)
    if (!dh) return false

    // Must be a valid in-hours, aligned start time for this duration.
    if (!candidateStartTimes(durationMin, dh.openMin, dh.closeMin).includes(timeStr)) return false

    const intervals = await getBlockingIntervals(dateStr, tz, pauses)
    const start = zonedToUtc(dateStr, timeStr, tz).getTime()
    const end = start + durationMin * 60_000
    if (start < Date.now() + LEAD_MIN * 60_000) return false
    return !intervals.some((iv) => overlaps(start, end, iv.start, iv.end))
}
