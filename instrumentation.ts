export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        const { schedule } = await import('node-cron')
        const { prisma } = await import('./lib/prisma')
        const { verifyAndSaveSubscription } = await import('./lib/subscriptionVerification')
        const { fetchAndStoreCurrencyRates, getCurrencyRates } = await import('./lib/currencyRates')

        console.log("Scheduler registered: Daily verification at 8 PM IST")

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

        // 8 PM IST = 14:30 UTC
        // Cron format: Minute Hour Day Month DayOfWeek
        schedule('04 09 * * *', async () => {
            console.log(`[Scheduler] Running daily checks at ${new Date().toISOString()}`)
            try {
                const subs = await prisma.userSubscription.findMany()
                console.log(`[Scheduler] Checking ${subs.length} users...`)

                for (const sub of subs) {
                    const userId = sub.userId
                    const subscriptionData = sub.subscription as Record<string, any>

                    if (subscriptionData && typeof subscriptionData === 'object') {
                        // Check every platform the user has in their subscription object
                        const platforms = Object.keys(subscriptionData)
                        console.log(`[Scheduler] User ${userId}: checking platforms [${platforms.join(', ')}]`)

                        for (const platform of platforms) {
                            await verifyAndSaveSubscription(userId, platform)
                        }
                    }
                }
            } catch (e) {
                console.error("[Scheduler] Error", e)
            }
        })
    }
}
