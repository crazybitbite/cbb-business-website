import { prisma } from "@/lib/prisma"

/**
 * Refresh an OAuth access token for a given provider
 */
async function refreshAccessToken(account: any, provider: string): Promise<{ access_token: string; refresh_token?: string } | null> {
    try {
        let tokenEndpoint: string
        let params: URLSearchParams

        switch (provider) {
            case "google":
                tokenEndpoint = "https://oauth2.googleapis.com/token"
                params = new URLSearchParams()
                params.append("client_id", process.env.AUTH_GOOGLE_ID!)
                params.append("client_secret", process.env.AUTH_GOOGLE_SECRET!)
                params.append("grant_type", "refresh_token")
                params.append("refresh_token", account.refresh_token)
                break

            case "twitter":
                tokenEndpoint = "https://api.twitter.com/2/oauth2/token"
                params = new URLSearchParams()
                params.append("client_id", process.env.AUTH_TWITTER_ID!)
                params.append("grant_type", "refresh_token")
                params.append("refresh_token", account.refresh_token)
                // Twitter requires Basic Auth
                const twitterAuth = Buffer.from(`${process.env.AUTH_TWITTER_ID}:${process.env.AUTH_TWITTER_SECRET}`).toString('base64')
                const twitterRes = await fetch(tokenEndpoint, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        "Authorization": `Basic ${twitterAuth}`
                    },
                    body: params
                })
                if (twitterRes.ok) {
                    return await twitterRes.json()
                }
                console.error("Failed to refresh Twitter token", await twitterRes.text())
                return null

            case "linkedin":
                tokenEndpoint = "https://www.linkedin.com/oauth/v2/accessToken"
                params = new URLSearchParams()
                params.append("client_id", process.env.AUTH_LINKEDIN_ID!)
                params.append("client_secret", process.env.AUTH_LINKEDIN_SECRET!)
                params.append("grant_type", "refresh_token")
                params.append("refresh_token", account.refresh_token)
                break

            case "facebook":
                // Facebook uses long-lived token exchange instead of refresh tokens
                tokenEndpoint = "https://graph.facebook.com/v18.0/oauth/access_token"
                params = new URLSearchParams()
                params.append("grant_type", "fb_exchange_token")
                params.append("client_id", process.env.AUTH_FACEBOOK_ID!)
                params.append("client_secret", process.env.AUTH_FACEBOOK_SECRET!)
                params.append("fb_exchange_token", account.access_token)
                break

            default:
                console.error(`Token refresh not implemented for provider: ${provider}`)
                return null
        }

        const refreshRes = await fetch(tokenEndpoint, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: params
        })

        if (refreshRes.ok) {
            return await refreshRes.json()
        } else {
            console.error(`Failed to refresh ${provider} token`, await refreshRes.text())
            return null
        }
    } catch (error) {
        console.error(`Error refreshing ${provider} token:`, error)
        return null
    }
}

/**
 * Update account tokens in database
 */
async function updateAccountTokens(accountId: number, newTokens: any, provider: string) {
    await prisma.account.update({
        where: { id: accountId },
        data: {
            access_token: newTokens.access_token,
            refresh_token: newTokens.refresh_token ?? undefined,
            updatedAt: BigInt(Math.floor(Date.now() / 1000))
        }
    })
}

/**
 * Verify and save user's subscription status for a given platform
 */
export async function verifyAndSaveSubscription(userId: number, platform: string): Promise<boolean> {
    try {
        // Map UI platform IDs to NextAuth provider IDs in database
        const providerMap: { [key: string]: string } = {
            youtube: "google",
            twitter: "twitter",
            linkedin: "linkedin",
            instagram: "facebook",
            facebook: "facebook"
        }

        const provider = providerMap[platform] || platform

        // 1. Fetch User's Access Token from DB
        const account = await prisma.account.findFirst({
            where: {
                userId: userId,
                provider: provider
            }
        })

        if (!account || !account.access_token) {
            console.log(`Verify [CacheBust]: No account or access token found for provider ${provider} (platform: ${platform})`)
            return false
        }

        let accessToken = account.access_token
        let isVerified = false

        // 2. Perform API Checks using User's Token
        switch (platform) {
            case 'youtube':
                const targetChannelId = process.env.YOUTUBE_CHANNEL_ID
                if (!targetChannelId) {
                    console.error("Server configuration error: Missing Target Channel ID")
                    return false
                }

                try {
                    let ytRes = await fetch(
                        `https://www.googleapis.com/youtube/v3/subscriptions?part=snippet&forChannelId=${targetChannelId}&mine=true`,
                        { headers: { Authorization: `Bearer ${accessToken}` } }
                    )

                    // Refresh Logic for 401 Unauthorized
                    if (ytRes.status === 401 && account.refresh_token) {
                        console.log("YouTube API 401: Access Token expired, attempting refresh...")
                        const newTokens = await refreshAccessToken(account, "google")

                        if (newTokens) {
                            console.log("Token Refreshed Successfully")
                            await updateAccountTokens(account.id, newTokens, "google")
                            accessToken = newTokens.access_token

                            // Retry Request
                            ytRes = await fetch(
                                `https://www.googleapis.com/youtube/v3/subscriptions?part=snippet&forChannelId=${targetChannelId}&mine=true`,
                                { headers: { Authorization: `Bearer ${accessToken}` } }
                            )
                        }
                    }

                    if (ytRes.ok) {
                        const ytData = await ytRes.json()
                        isVerified = ytData.items && ytData.items.length > 0
                    } else {
                        console.error("YouTube API Error", await ytRes.text())
                    }
                } catch (e) {
                    console.error("YouTube Fetch Error", e)
                }
                break;

            case 'twitter':
                const targetTwitterId = process.env.TWITTER_TARGET_ACCOUNT_ID
                if (!targetTwitterId) {
                    console.log("Twitter: Missing TWITTER_TARGET_ACCOUNT_ID")
                    return false
                }

                try {
                    const sourceTwitterId = account.providerAccountId
                    let twRes = await fetch(
                        `https://api.twitter.com/2/users/${sourceTwitterId}/following?max_results=1000`,
                        { headers: { Authorization: `Bearer ${accessToken}` } }
                    )

                    // Refresh Logic for 401 Unauthorized
                    if (twRes.status === 401 && account.refresh_token) {
                        console.log("Twitter API 401: Access Token expired, attempting refresh...")
                        const newTokens = await refreshAccessToken(account, "twitter")

                        if (newTokens) {
                            console.log("Twitter Token Refreshed Successfully")
                            await updateAccountTokens(account.id, newTokens, "twitter")
                            accessToken = newTokens.access_token

                            // Retry Request
                            twRes = await fetch(
                                `https://api.twitter.com/2/users/${sourceTwitterId}/following?max_results=1000`,
                                { headers: { Authorization: `Bearer ${accessToken}` } }
                            )
                        }
                    }

                    if (twRes.ok) {
                        const twData = await twRes.json()
                        if (twData.data) {
                            isVerified = twData.data.some((u: any) => u.id === targetTwitterId)
                        }
                    } else {
                        console.error("Twitter API Error", await twRes.text())
                    }
                } catch (e) {
                    console.error("Twitter fetch error", e)
                }
                break;

            case 'linkedin':
                const linkedinCompanyId = process.env.LINKEDIN_COMPANY_ID
                if (!linkedinCompanyId) {
                    console.log("LinkedIn: Missing LINKEDIN_COMPANY_ID")
                    return false
                }

                try {
                    // Check if user is following the company
                    let liRes = await fetch(
                        `https://api.linkedin.com/v2/networkSizes?edgeType=CompanyFollowedByMember`,
                        { headers: { Authorization: `Bearer ${accessToken}` } }
                    )

                    // Refresh Logic for 401 Unauthorized
                    if (liRes.status === 401 && account.refresh_token) {
                        console.log("LinkedIn API 401: Access Token expired, attempting refresh...")
                        const newTokens = await refreshAccessToken(account, "linkedin")

                        if (newTokens) {
                            console.log("LinkedIn Token Refreshed Successfully")
                            await updateAccountTokens(account.id, newTokens, "linkedin")
                            accessToken = newTokens.access_token

                            // Retry Request
                            liRes = await fetch(
                                `https://api.linkedin.com/v2/networkSizes?edgeType=CompanyFollowedByMember`,
                                { headers: { Authorization: `Bearer ${accessToken}` } }
                            )
                        }
                    }

                    // For now, if token is valid, consider verified
                    // LinkedIn's following API is limited; may need custom implementation
                    isVerified = liRes.ok
                } catch (e) {
                    console.error("LinkedIn fetch error", e)
                }
                break;

            case 'facebook':
                const facebookPageId = process.env.FACEBOOK_PAGE_ID
                if (!facebookPageId) {
                    console.log("Facebook: Missing FACEBOOK_PAGE_ID")
                    return false
                }

                try {
                    // Check if user likes the page
                    let fbRes = await fetch(
                        `https://graph.facebook.com/v18.0/me/likes?fields=id,name&limit=1000`,
                        { headers: { Authorization: `Bearer ${accessToken}` } }
                    )

                    // Refresh Logic for 401 Unauthorized
                    if (fbRes.status === 401) {
                        console.log("Facebook API 401: Access Token expired, attempting refresh...")
                        const newTokens = await refreshAccessToken(account, "facebook")

                        if (newTokens) {
                            console.log("Facebook Token Refreshed Successfully")
                            await updateAccountTokens(account.id, newTokens, "facebook")
                            accessToken = newTokens.access_token

                            // Retry Request
                            fbRes = await fetch(
                                `https://graph.facebook.com/v18.0/me/likes?fields=id,name&limit=1000`,
                                { headers: { Authorization: `Bearer ${accessToken}` } }
                            )
                        }
                    }

                    if (fbRes.ok) {
                        const fbData = await fbRes.json()
                        if (fbData.data) {
                            isVerified = fbData.data.some((page: any) => page.id === facebookPageId)
                        }
                    } else {
                        console.error("Facebook API Error", await fbRes.text())
                    }
                } catch (e) {
                    console.error("Facebook fetch error", e)
                }
                break;

            case 'instagram':
                const instagramAccountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID
                if (!instagramAccountId) {
                    console.log("Instagram: Missing INSTAGRAM_BUSINESS_ACCOUNT_ID")
                    return false
                }

                try {
                    // First, get user's Instagram Business Account ID
                    let igRes = await fetch(
                        `https://graph.facebook.com/v18.0/me/accounts?fields=instagram_business_account`,
                        { headers: { Authorization: `Bearer ${accessToken}` } }
                    )

                    // Refresh Logic for 401 Unauthorized
                    if (igRes.status === 401) {
                        console.log("Instagram API 401: Access Token expired, attempting refresh...")
                        const newTokens = await refreshAccessToken(account, "facebook")

                        if (newTokens) {
                            console.log("Instagram Token Refreshed Successfully")
                            await updateAccountTokens(account.id, newTokens, "facebook")
                            accessToken = newTokens.access_token

                            // Retry Request
                            igRes = await fetch(
                                `https://graph.facebook.com/v18.0/me/accounts?fields=instagram_business_account`,
                                { headers: { Authorization: `Bearer ${accessToken}` } }
                            )
                        }
                    }

                    if (igRes.ok) {
                        const igData = await igRes.json()
                        // Check if user has connected Instagram account
                        // For now, verify token validity as Instagram following API is complex
                        isVerified = igData.data && igData.data.length > 0
                    } else {
                        console.error("Instagram API Error", await igRes.text())
                    }
                } catch (e) {
                    console.error("Instagram fetch error", e)
                }
                break;

            case 'whatsapp':
                // WhatsApp doesn't have a "following" concept
                // Just verify token validity
                try {
                    const waRes = await fetch(`https://graph.facebook.com/v18.0/me`, {
                        headers: { Authorization: `Bearer ${accessToken}` }
                    })
                    isVerified = waRes.ok
                } catch (e) {
                    console.error("WhatsApp token check error", e)
                }
                break;

            default:
                break;
        }

        // 3. Update Status in DB
        const existingSub = await prisma.userSubscription.findUnique({
            where: { userId: userId }
        })

        let newSubscriptionData: any = existingSub?.subscription || {}
        if (typeof newSubscriptionData !== 'object' || newSubscriptionData === null) {
            newSubscriptionData = {}
        }

        const currentStatus = newSubscriptionData[platform]

        // Optimize: Only update if changed
        if (currentStatus !== isVerified) {
            newSubscriptionData[platform] = isVerified

            await prisma.userSubscription.upsert({
                where: { userId: userId },
                create: {
                    userId: userId,
                    subscription: newSubscriptionData
                },
                update: {
                    subscription: newSubscriptionData,
                }
            })
            console.log(`Updated subscription for user ${userId} platform ${platform}: ${isVerified}`)
        }

        return isVerified

    } catch (error) {
        console.error("Verification logic failed", error)
        return false
    }
}

/**
 * Re-verify every platform for every user with a stored subscription record.
 * Used by the daily scheduler (self-hosted) and the Vercel cron endpoint.
 */
export async function verifyAllUserSubscriptions(): Promise<{ users: number }> {
    const subs = await prisma.userSubscription.findMany()
    console.log(`[SubscriptionCheck] Checking ${subs.length} users...`)

    for (const sub of subs) {
        const subscriptionData = sub.subscription as Record<string, any>
        if (subscriptionData && typeof subscriptionData === "object") {
            for (const platform of Object.keys(subscriptionData)) {
                await verifyAndSaveSubscription(sub.userId, platform)
            }
        }
    }

    return { users: subs.length }
}
