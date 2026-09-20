import { NextRequest, NextResponse } from "next/server"
import { priceForDuration } from "@/lib/booking"
import { getDayAvailability } from "@/lib/bookingAvailability"
import { getCalendarConfig } from "@/lib/serverConfig"

export const dynamic = "force-dynamic"

/**
 * Returns the bookable time slots for a given date + duration, each marked
 * available or already taken. Slots are computed in MEETING_TIMEZONE.
 */
export async function GET(req: NextRequest) {
    const date = req.nextUrl.searchParams.get("date") || ""
    const duration = Number(req.nextUrl.searchParams.get("duration"))

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return NextResponse.json({ error: "Invalid date" }, { status: 400 })
    }
    if (priceForDuration(duration) === null) {
        return NextResponse.json({ error: "Invalid duration" }, { status: 400 })
    }

    const timeZone = (await getCalendarConfig()).timeZone
    try {
        const slots = await getDayAvailability(date, duration, timeZone)
        return NextResponse.json({ timeZone, slots })
    } catch (error) {
        console.error("Availability error:", error)
        return NextResponse.json({ error: "Could not load availability" }, { status: 500 })
    }
}
