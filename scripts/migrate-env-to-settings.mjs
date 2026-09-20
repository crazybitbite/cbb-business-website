/**
 * One-time migration: copy movable configuration from environment variables
 * into the admin Settings table (so it can be managed from the control panel).
 *
 * Connects to whichever DATABASE_URL is loaded, and only writes keys whose env
 * value is non-empty (never overwrites an existing setting with a blank).
 *
 * Run once per database:
 *   node --env-file=.env.local scripts/migrate-env-to-settings.mjs   # remote (prisma.io)
 *   node --env-file=.env       scripts/migrate-env-to-settings.mjs   # localhost
 */
import { PrismaClient } from "@prisma/client"

const MAP = {
    SMTP_HOST: "smtpHost",
    SMTP_PORT: "smtpPort",
    SMTP_USER: "smtpUser",
    SMTP_PASSWORD: "smtpPassword",
    SMTP_FROM: "smtpFrom",
    STRIPE_SECRET_KEY: "stripeSecretKey",
    STRIPE_PUBLISHABLE_KEY: "stripePublishableKey",
    STRIPE_WEBHOOK_SECRET: "stripeWebhookSecret",
    MEETING_EMAIL: "meetingEmail",
    MEETING_TIMEZONE: "meetingTimezone",
    GOOGLE_CALENDAR_CLIENT_ID: "googleCalendarClientId",
    GOOGLE_CALENDAR_CLIENT_SECRET: "googleCalendarClientSecret",
    GOOGLE_CALENDAR_REFRESH_TOKEN: "googleCalendarRefreshToken",
    GOOGLE_CALENDAR_ID: "googleCalendarId",
    YOUTUBE_CHANNEL_ID: "youtubeChannelId",
    TWITTER_TARGET_ACCOUNT_ID: "twitterTargetAccountId",
    LINKEDIN_COMPANY_ID: "linkedinCompanyId",
    FACEBOOK_PAGE_ID: "facebookPageId",
    INSTAGRAM_BUSINESS_ACCOUNT_ID: "instagramBusinessAccountId",
}

const prisma = new PrismaClient()

async function main() {
    const host = (process.env.DATABASE_URL || "").replace(/.*@([^/:]+).*/, "$1") || "unknown"
    console.log(`Migrating env → Settings on ${host}`)

    let migrated = 0
    let skipped = 0
    for (const [envVar, key] of Object.entries(MAP)) {
        const value = (process.env[envVar] || "").trim()
        if (!value) {
            skipped++
            continue
        }
        await prisma.settings.upsert({
            where: { key },
            update: { value },
            create: { key, value },
        })
        migrated++
        console.log(`  ✓ ${key}  (from ${envVar}, ${value.length} chars)`)
    }
    console.log(`Done — ${migrated} settings written, ${skipped} skipped (empty env).`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exitCode = 1
    })
    .finally(() => prisma.$disconnect())
