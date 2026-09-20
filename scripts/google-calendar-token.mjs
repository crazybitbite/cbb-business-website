/**
 * One-time helper: obtain a Google Calendar OAuth2 refresh token for the
 * account that will host consultation meetings (MEETING_EMAIL).
 *
 * Prereqs:
 *  - A Google Cloud OAuth 2.0 "Web application" client, with
 *    http://localhost:5555/oauth2callback added as an Authorized redirect URI.
 *  - The Google Calendar API enabled on that project.
 *
 * Credentials are read from (first match wins):
 *  - env GOOGLE_CALENDAR_CLIENT_ID / GOOGLE_CALENDAR_CLIENT_SECRET
 *  - env AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET
 *  - a client_secret*.json file in the project root
 *
 * Run:  node --env-file=.env.local scripts/google-calendar-token.mjs
 * Then sign in AS the MEETING_EMAIL account, approve, and paste the printed
 * GOOGLE_CALENDAR_REFRESH_TOKEN into your .env / .env.local (and Vercel).
 */
import http from "node:http"
import { readdirSync, readFileSync } from "node:fs"
import { google } from "googleapis"

const PORT = 5555
const REDIRECT = `http://localhost:${PORT}/oauth2callback`
const SCOPES = ["https://www.googleapis.com/auth/calendar.events"]

function resolveCreds() {
    let id = process.env.GOOGLE_CALENDAR_CLIENT_ID || process.env.AUTH_GOOGLE_ID
    let secret = process.env.GOOGLE_CALENDAR_CLIENT_SECRET || process.env.AUTH_GOOGLE_SECRET
    if (id && secret) return { id, secret }

    const jsonFile = readdirSync(process.cwd()).find(
        (f) => f.startsWith("client_secret") && f.endsWith(".json")
    )
    if (jsonFile) {
        const parsed = JSON.parse(readFileSync(jsonFile, "utf8"))
        const c = parsed.web || parsed.installed
        if (c?.client_id && c?.client_secret) return { id: c.client_id, secret: c.client_secret }
    }
    return null
}

async function main() {
    const creds = resolveCreds()
    if (!creds) {
        console.error(
            "No OAuth credentials found. Set GOOGLE_CALENDAR_CLIENT_ID/SECRET (or AUTH_GOOGLE_ID/SECRET) " +
            "or place a client_secret*.json in the project root."
        )
        process.exit(1)
    }

    const oauth2 = new google.auth.OAuth2(creds.id, creds.secret, REDIRECT)
    const url = oauth2.generateAuthUrl({
        access_type: "offline",
        prompt: "consent", // force a refresh_token every run
        scope: SCOPES,
    })

    console.log("\n1) Make sure this redirect URI is registered on your OAuth client:")
    console.log(`   ${REDIRECT}`)
    console.log("\n2) Open this URL and sign in as your MEETING_EMAIL account:\n")
    console.log(url + "\n")

    const server = http.createServer(async (req, res) => {
        if (!req.url?.startsWith("/oauth2callback")) {
            res.writeHead(404).end()
            return
        }
        const code = new URL(req.url, REDIRECT).searchParams.get("code")
        if (!code) {
            res.writeHead(400).end("Missing code")
            return
        }
        try {
            const { tokens } = await oauth2.getToken(code)
            res.writeHead(200, { "Content-Type": "text/html" }).end(
                "<h2>Done. You can close this tab and return to the terminal.</h2>"
            )
            console.log("\n✅ Success. Add this to your .env / .env.local (and Vercel):\n")
            console.log(`GOOGLE_CALENDAR_REFRESH_TOKEN=${tokens.refresh_token}\n`)
            if (!tokens.refresh_token) {
                console.warn(
                    "No refresh_token returned. Revoke prior access at https://myaccount.google.com/permissions and re-run."
                )
            }
        } catch (e) {
            console.error("Token exchange failed:", e)
            res.writeHead(500).end("Token exchange failed")
        } finally {
            server.close()
            setTimeout(() => process.exit(0), 200)
        }
    })

    server.listen(PORT, () => console.log(`Waiting for Google redirect on ${REDIRECT} …`))
}

main().catch((e) => {
    console.error(e)
    process.exit(1)
})
