import { google } from "googleapis"
import { getCalendarConfig } from "@/lib/serverConfig"

/**
 * Creates real Google Calendar events (with a Google Meet link) for paid
 * consultation bookings, on the meeting host's calendar.
 *
 * Configuration comes from admin Settings (with env fallback), see
 * lib/serverConfig.ts getCalendarConfig: the meeting-host email, the OAuth2
 * client id/secret (falling back to the NextAuth Google credentials), a
 * refresh token for that account (obtain once via
 * scripts/google-calendar-token.mjs), and the target calendar id.
 *
 * If any of these are missing the helper degrades gracefully: it returns
 * null and logs a warning, so a booking is never lost just because the
 * calendar integration hasn't been configured yet.
 */

export interface CalendarInvite {
    summary: string
    description: string
    startIsoLocal: string // "2026-09-25T15:00:00" (no zone suffix)
    endIsoLocal: string
    timeZone: string
    attendeeEmail: string
    attendeeName?: string
}

export interface CalendarResult {
    eventId: string
    meetingLink: string | null
    htmlLink: string | null
}

export async function createCalendarInvite(invite: CalendarInvite): Promise<CalendarResult | null> {
    const cfg = await getCalendarConfig()
    if (!cfg.clientId || !cfg.clientSecret || !cfg.refreshToken || !cfg.meetingEmail) {
        console.warn("Google Calendar not configured (meeting host / refresh token missing) — skipping invite creation")
        return null
    }

    try {
        const oauth2 = new google.auth.OAuth2(cfg.clientId, cfg.clientSecret)
        oauth2.setCredentials({ refresh_token: cfg.refreshToken })

        const calendar = google.calendar({ version: "v3", auth: oauth2 })
        const hostEmail = cfg.meetingEmail
        // Default to the authenticated account's own calendar ("primary").
        // Only pass a specific email/id if that calendar is actually shared with
        // the token's account — otherwise the API returns 404.
        const calendarId = cfg.calendarId || "primary"

        const res = await calendar.events.insert({
            calendarId,
            sendUpdates: "all", // email invites to the attendee and host
            conferenceDataVersion: 1,
            requestBody: {
                summary: invite.summary,
                description: invite.description,
                start: { dateTime: invite.startIsoLocal, timeZone: invite.timeZone },
                end: { dateTime: invite.endIsoLocal, timeZone: invite.timeZone },
                attendees: [
                    { email: invite.attendeeEmail, displayName: invite.attendeeName },
                    { email: hostEmail },
                ],
                conferenceData: {
                    createRequest: {
                        requestId: `cbb-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                        conferenceSolutionKey: { type: "hangoutsMeet" },
                    },
                },
                reminders: {
                    useDefault: false,
                    overrides: [
                        { method: "email", minutes: 60 },
                        { method: "popup", minutes: 10 },
                    ],
                },
            },
        })

        const event = res.data
        const meetingLink =
            event.hangoutLink ||
            event.conferenceData?.entryPoints?.find((e) => e.entryPointType === "video")?.uri ||
            null

        return {
            eventId: event.id || "",
            meetingLink,
            htmlLink: event.htmlLink || null,
        }
    } catch (error) {
        console.error("Failed to create Google Calendar invite:", error)
        return null
    }
}
