"use client"

import { useState, useEffect } from "react"
import { Youtube, Instagram, Facebook, Linkedin, Twitter, MessageCircle, Check, Loader2, ExternalLink } from "lucide-react"

interface SubscriptionState {
    [key: string]: boolean
}

const PLATFORMS = [
    { id: "youtube", name: "YouTube", icon: Youtube, color: "text-red-600", action: "Subscribe" },
    { id: "instagram", name: "Instagram", icon: Instagram, color: "text-pink-600", action: "Follow" },
    { id: "facebook", name: "Facebook", icon: Facebook, color: "text-blue-600", action: "Follow" },
    { id: "whatsapp", name: "WhatsApp", icon: MessageCircle, color: "text-green-500", action: "Connect" },
    { id: "linkedin", name: "LinkeIn", icon: Linkedin, color: "text-blue-700", action: "Connect" },
    { id: "twitter", name: "Twitter", icon: Twitter, color: "text-sky-500", action: "Follow" },
]

interface SubscriptionGridProps {
    userEmail?: string | null
}

export function SubscriptionGrid({ userEmail }: SubscriptionGridProps) {
    const [subscriptions, setSubscriptions] = useState<SubscriptionState>({})
    const [loading, setLoading] = useState(true)
    // Tracks which platform is currently pending verification (user opened link, hasn't verified yet)
    const [pendingVerification, setPendingVerification] = useState<string | null>(null)
    // Tracks which platform is currently verifying (spinner)
    const [verifyingId, setVerifyingId] = useState<string | null>(null)

    useEffect(() => {
        fetchSubscriptions()
    }, [])

    const fetchSubscriptions = async () => {
        try {
            const res = await fetch("/api/subscriptions")
            if (res.ok) {
                const data = await res.json()
                setSubscriptions(data)
            }
        } catch (error) {
            console.error("Failed to fetch subscriptions", error)
        } finally {
            setLoading(false)
        }
    }

    const getPlatformUrl = (id: string) => {
        // Replace these with actual IDs/Usernames
        const HANDLES = {
            youtube: "crazybitbite",
            instagram: "crazybitbite",
            facebook: "crazybitbite",
            linkedin: "company/crazybitbite",
            twitter: "crazybitbite",
            whatsapp: "919725449911"
        }

        // Intent URLs that work well in popups
        switch (id) {
            case "youtube": {
                const ytUrl = `https://www.youtube.com/@${HANDLES.youtube}?sub_confirmation=1`
                // The browser may be logged into a different Google account than the one
                // linked to this app. Route through the account chooser pre-filled with
                // the linked email so the subscription lands on the account we verify.
                if (userEmail) {
                    return `https://accounts.google.com/AccountChooser?Email=${encodeURIComponent(userEmail)}&continue=${encodeURIComponent(ytUrl)}`
                }
                return ytUrl
            }
            case "instagram": return `https://www.instagram.com/${HANDLES.instagram}/`
            case "facebook": return `https://www.facebook.com/${HANDLES.facebook}`
            case "linkedin": return `https://www.linkedin.com/${HANDLES.linkedin}`
            case "twitter": return `https://twitter.com/intent/follow?screen_name=${HANDLES.twitter}`
            case "whatsapp": return `https://wa.me/${HANDLES.whatsapp}`
            default: return "#"
        }
    }

    const performVerificationCheck = async (platformId: string): Promise<boolean> => {
        // ---------------------------------------------------------------------------
        // REAL VERIFICATION LOGIC WOULD GO HERE
        // ---------------------------------------------------------------------------
        // To strictly verify, we would need:
        // 1. User to be signed in with that platform (OAuth) to give us read access.
        // 2. Server-side API call to e.g. https://www.googleapis.com/youtube/v3/subscriptions
        // 3. Compare with our channel ID.

        // Since we lack API Keys/OAuth, we SIMULATE verification delay.
        return new Promise((resolve) => {
            setTimeout(() => {
                // Determine random success/fail for demo or always success?
                // Let's assume always success if they clicked 'Verify' for now, 
                // as we can't really fail them without checking.
                resolve(true)
            }, 1500)
        })
    }

    const updateSubscription = async (platformId: string, status: boolean) => {
        try {
            const res = await fetch("/api/subscriptions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ platform: platformId, status }),
            })

            if (res.ok) {
                setSubscriptions(prev => ({ ...prev, [platformId]: status }))
            }
        } catch (error) {
            console.error("Failed to update status", error)
        }
    }

    const handleInteraction = async (platformId: string) => {
        if (subscriptions[platformId]) return;

        // 1. Open the popup
        const url = getPlatformUrl(platformId)
        const width = 600
        const height = 600
        const left = window.screen.width / 2 - width / 2
        const top = window.screen.height / 2 - height / 2

        // We set the verifying state immediately to show something is happening
        setVerifyingId(platformId)

        const popup = window.open(
            url,
            `Connect ${platformId}`,
            `width=${width},height=${height},left=${left},top=${top}`
        )

        // 2. Monitor for close
        const checkPopup = setInterval(async () => {
            if (popup?.closed) {
                clearInterval(checkPopup)

                // 3. Trigger Server-Side Verification
                try {
                    // Call our new verification endpoint
                    const res = await fetch("/api/subscriptions/verify", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ platform: platformId }),
                    })

                    const data = await res.json()

                    if (res.ok && data.verified) {
                        // Success: Update local state
                        setSubscriptions(prev => ({ ...prev, [platformId]: true }))
                    } else {
                        // Failure
                        alert(`Verification failed for ${platformId}. ${data.message || ""}`)
                    }
                } catch (error) {
                    console.error("Verification error", error)
                    alert("An error occurred while verifying.")
                } finally {
                    setVerifyingId(null)
                    setPendingVerification(null)
                }
            }
        }, 1000)
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl text-sm text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900/50">
                <strong>Note:</strong> Opening links in a pop-up window. When you close the window, we will verify your status.
                <br />
                <em>(Strict verification enabled. Requires valid API keys on the server.)</em>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {PLATFORMS.map((platform) => {
                    const isSubscribed = subscriptions[platform.id]
                    const isVerifying = verifyingId === platform.id
                    const Icon = platform.icon

                    return (
                        <div
                            key={platform.id}
                            className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-between group hover:border-orange-500/30 transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-full bg-gray-100 dark:bg-white/10 ${platform.color}`}>
                                    <Icon className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white">{platform.name}</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {isSubscribed ? "Verified" : `Not ${platform.action}ed`}
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => handleInteraction(platform.id)}
                                disabled={isVerifying || isSubscribed}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2
                                    ${isSubscribed
                                        ? "bg-green-500/10 text-green-600 dark:text-green-400 cursor-default"
                                        : "bg-black dark:bg-white text-white dark:text-black hover:scale-105"
                                    }
                                `}
                            >
                                {isVerifying ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span>Verifying...</span>
                                    </>
                                ) : isSubscribed ? (
                                    <>
                                        <Check className="h-4 w-4" />
                                        <span>Done</span>
                                    </>
                                ) : (
                                    <span>{platform.action}</span>
                                )}
                            </button>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
