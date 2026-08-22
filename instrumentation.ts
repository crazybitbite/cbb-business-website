export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        // On Vercel there is no long-lived process: in-process cron never fires
        // reliably, and running this on every lambda cold start just burns DB
        // connections. Scheduled work runs via Vercel Cron instead (vercel.json
        // → /api/cron/currency-rates and /api/cron/verify-subscriptions).
        if (process.env.VERCEL) {
            console.log("Serverless environment detected: skipping in-process scheduler (Vercel Cron handles scheduled jobs)")
            return
        }

        const { schedule } = await import('node-cron')
        const { verifyAllUserSubscriptions } = await import('./lib/subscriptionVerification')
        const { fetchAndStoreCurrencyRates, getCurrencyRates } = await import('./lib/currencyRates')

        console.log("Scheduler registered: rates every 8h, subscription checks daily")

        // Currency rates: refresh three times a day (every 8 hours)
        schedule('0 */8 * * *', async () => {
            console.log(`[Scheduler] Refreshing currency rates at ${new Date().toISOString()}`)
            await fetchAndStoreCurrencyRates()
        })

        // On boot: fetch rates if missing or older than 8 hours
        getCurrencyRates().then(async (rates) => {
            const eightHoursAgo = Math.floor(Date.now() / 1000) - 8 * 3600
            if (rates && rates.fetchedAt < eightHoursAgo) {
                await fetchAndStoreCurrencyRates()
            }
        }).catch(e => console.error("[Scheduler] Initial rates fetch failed", e))

        // Daily subscription re-verification
        schedule('04 09 * * *', async () => {
            console.log(`[Scheduler] Running daily subscription checks at ${new Date().toISOString()}`)
            try {
                await verifyAllUserSubscriptions()
            } catch (e) {
                console.error("[Scheduler] Error", e)
            }
        })
    }
}
