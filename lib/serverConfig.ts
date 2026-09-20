import { prisma } from "@/lib/prisma"

/**
 * Server-side configuration resolved from the admin Settings table, with an
 * environment-variable fallback for each key. This lets operators manage
 * credentials from the control panel instead of .env, while env vars still
 * work for values that can't live in the DB or during first-run setup.
 *
 * Secrets stored here (SMTP password, Stripe secret, Google refresh token, …)
 * are only ever returned by the admin-only /api/settings route — they must
 * never be added to /api/settings/public.
 */

// Short in-process cache so a single request that reads several keys doesn't
// hit the DB repeatedly. Not a correctness cache — TTL is tiny.
let cache: { at: number; map: Record<string, string> } | null = null
const TTL_MS = 10_000

async function loadMap(): Promise<Record<string, string>> {
    if (cache && Date.now() - cache.at < TTL_MS) return cache.map
    try {
        const rows = await prisma.settings.findMany()
        const map: Record<string, string> = {}
        for (const r of rows) {
            if (typeof r.value === "string") map[r.key] = r.value
        }
        cache = { at: Date.now(), map }
        return map
    } catch (error) {
        console.error("Failed to load settings for serverConfig:", error)
        return cache?.map ?? {}
    }
}

/** Clear the cache (call after saving settings if immediate freshness matters). */
export function clearConfigCache() {
    cache = null
}

/**
 * Resolve a single value: Settings[key] → process.env[envVar] → fallback.
 */
export async function getConfigValue(key: string, envVar?: string, fallback = ""): Promise<string> {
    const map = await loadMap()
    const v = map[key]
    if (typeof v === "string" && v.trim()) return v.trim()
    if (envVar && process.env[envVar] && String(process.env[envVar]).trim()) {
        return String(process.env[envVar]).trim()
    }
    return fallback
}

export interface SmtpConfig {
    host: string
    port: number
    user: string
    password: string
    from: string
}

export async function getSmtpConfig(): Promise<SmtpConfig> {
    const map = await loadMap()
    const pick = (key: string, envVar: string) => {
        const v = map[key]
        if (typeof v === "string" && v.trim()) return v.trim()
        return (process.env[envVar] || "").trim()
    }
    return {
        host: pick("smtpHost", "SMTP_HOST"),
        port: parseInt(pick("smtpPort", "SMTP_PORT") || "587", 10),
        user: pick("smtpUser", "SMTP_USER"),
        password: pick("smtpPassword", "SMTP_PASSWORD"),
        from: pick("smtpFrom", "SMTP_FROM"),
    }
}

export interface CalendarConfig {
    meetingEmail: string
    timeZone: string
    clientId: string
    clientSecret: string
    refreshToken: string
    calendarId: string
}

export async function getCalendarConfig(): Promise<CalendarConfig> {
    const map = await loadMap()
    const pick = (key: string, envVar: string, fallback = "") => {
        const v = map[key]
        if (typeof v === "string" && v.trim()) return v.trim()
        if (process.env[envVar] && String(process.env[envVar]).trim()) return String(process.env[envVar]).trim()
        return fallback
    }
    return {
        meetingEmail: pick("meetingEmail", "MEETING_EMAIL"),
        timeZone: pick("meetingTimezone", "MEETING_TIMEZONE", "Asia/Kolkata"),
        // OAuth client falls back to the NextAuth Google credentials.
        clientId: pick("googleCalendarClientId", "GOOGLE_CALENDAR_CLIENT_ID") || (process.env.AUTH_GOOGLE_ID || "").trim(),
        clientSecret:
            pick("googleCalendarClientSecret", "GOOGLE_CALENDAR_CLIENT_SECRET") || (process.env.AUTH_GOOGLE_SECRET || "").trim(),
        refreshToken: pick("googleCalendarRefreshToken", "GOOGLE_CALENDAR_REFRESH_TOKEN"),
        calendarId: pick("googleCalendarId", "GOOGLE_CALENDAR_ID", "primary"),
    }
}

export interface SocialConfig {
    youtubeChannelId: string
    twitterTargetAccountId: string
    linkedinCompanyId: string
    facebookPageId: string
    instagramBusinessAccountId: string
}

export async function getSocialConfig(): Promise<SocialConfig> {
    const map = await loadMap()
    const pick = (key: string, envVar: string) => {
        const v = map[key]
        if (typeof v === "string" && v.trim()) return v.trim()
        return (process.env[envVar] || "").trim()
    }
    return {
        youtubeChannelId: pick("youtubeChannelId", "YOUTUBE_CHANNEL_ID"),
        twitterTargetAccountId: pick("twitterTargetAccountId", "TWITTER_TARGET_ACCOUNT_ID"),
        linkedinCompanyId: pick("linkedinCompanyId", "LINKEDIN_COMPANY_ID"),
        facebookPageId: pick("facebookPageId", "FACEBOOK_PAGE_ID"),
        instagramBusinessAccountId: pick("instagramBusinessAccountId", "INSTAGRAM_BUSINESS_ACCOUNT_ID"),
    }
}
