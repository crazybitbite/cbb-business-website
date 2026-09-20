/**
 * Rewrites an env file to keep ONLY the variables that cannot live in the
 * admin Settings table. Everything in REMOVE has been migrated to Settings
 * (see scripts/migrate-env-to-settings.mjs) and is dropped here.
 *
 * Usage: node scripts/rewrite-env.mjs <path-to-env-file>
 * (Back up the file first — this overwrites it in place.)
 */
import { readFileSync, writeFileSync } from "node:fs"

// Moved to admin Settings → removed from env.
const REMOVE = new Set([
    "SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASSWORD", "SMTP_FROM",
    "STRIPE_SECRET_KEY", "STRIPE_PUBLISHABLE_KEY", "STRIPE_WEBHOOK_SECRET",
    "MEETING_EMAIL", "MEETING_TIMEZONE",
    "GOOGLE_CALENDAR_CLIENT_ID", "GOOGLE_CALENDAR_CLIENT_SECRET",
    "GOOGLE_CALENDAR_REFRESH_TOKEN", "GOOGLE_CALENDAR_ID",
    "YOUTUBE_CHANNEL_ID", "TWITTER_TARGET_ACCOUNT_ID", "LINKEDIN_COMPANY_ID",
    "FACEBOOK_PAGE_ID", "INSTAGRAM_BUSINESS_ACCOUNT_ID",
    // Stale, unused LinkedIn duplicates
    "LINKEDIN_CLIENT_ID", "LINKEDIN_CLIENT_SECRET", "LINKEDIN_ORGANIZATION_URN",
])

// Vars that must stay in env, in the order we want them written.
const KEEP_ORDER = [
    "DATABASE_URL",
    "AUTH_SECRET",
    "AUTH_GOOGLE_ID", "AUTH_GOOGLE_SECRET",
    "AUTH_TWITTER_ID", "AUTH_TWITTER_SECRET",
    "AUTH_LINKEDIN_ID", "AUTH_LINKEDIN_SECRET",
    "AUTH_FACEBOOK_ID", "AUTH_FACEBOOK_SECRET",
    "NEXT_PUBLIC_BASE_URL",
    "CRON_SECRET",
]

const path = process.argv[2]
if (!path) {
    console.error("Usage: node scripts/rewrite-env.mjs <path-to-env-file>")
    process.exit(1)
}

const raw = readFileSync(path, "utf8")
const found = {} // key -> full original line (preserves exact value/quotes)
for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=/)
    if (m) found[m[1]] = line.trimEnd()
}

const header = [
    "# Only variables that CANNOT be stored in the database live here.",
    "# Everything else (SMTP, Stripe, Google Calendar, social IDs, meeting host)",
    "# is managed in the control panel: /controlpanel/settings",
    "#",
    "# - DATABASE_URL   : needed to connect before any DB read",
    "# - AUTH_*         : NextAuth secret + OAuth provider credentials (loaded at",
    "#                    config/edge time, cannot be read from the DB)",
    "# - NEXT_PUBLIC_*  : build-time / client-exposed values",
    "# - CRON_SECRET    : read by the platform to authorize cron requests",
    "",
]

const out = [...header]
const keptKeys = []
for (const key of KEEP_ORDER) {
    if (found[key] !== undefined) {
        out.push(found[key])
        keptKeys.push(key)
    } else {
        // Add a placeholder so the required var is discoverable.
        out.push(`${key}=`)
        keptKeys.push(`${key} (placeholder)`)
    }
}

// Preserve any other keys we didn't explicitly plan for and didn't remove,
// so nothing unexpected is silently lost.
const known = new Set(KEEP_ORDER)
const extras = Object.keys(found).filter((k) => !known.has(k) && !REMOVE.has(k))
if (extras.length) {
    out.push("", "# Preserved (not recognized by the migration):")
    for (const k of extras) out.push(found[k])
}

writeFileSync(path, out.join("\n") + "\n")
console.log(`Rewrote ${path}`)
console.log(`  kept: ${keptKeys.join(", ")}`)
if (extras.length) console.log(`  preserved extras: ${extras.join(", ")}`)
const removed = Object.keys(found).filter((k) => REMOVE.has(k))
console.log(`  removed (now in Settings): ${removed.join(", ") || "(none)"}`)
