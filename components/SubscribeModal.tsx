"use client"

import { useState, useEffect, useCallback } from "react"
import { X, Youtube, Instagram, Facebook, Linkedin, Twitter, Check, Loader2 } from "lucide-react"
import { useSession } from "next-auth/react"

const PLATFORM_META: Record<string, { name: string; icon: any; color: string }> = {
    youtube: { name: "YouTube", icon: Youtube, color: "text-red-600" },
    instagram: { name: "Instagram", icon: Instagram, color: "text-pink-600" },
    facebook: { name: "Facebook", icon: Facebook, color: "text-blue-600" },
    linkedin: { name: "LinkedIn", icon: Linkedin, color: "text-blue-700" },
    twitter: { name: "Twitter", icon: Twitter, color: "text-sky-500" },
}

const HANDLES: Record<string, string> = {
    youtube: "crazybitbite",
    instagram: "crazybitbite",
    facebook: "crazybitbite",
    linkedin: "company/crazybitbite",
    twitter: "crazybitbite",
}

function getPlatformUrl(id: string, userEmail?: string | null): string {
    switch (id) {
        case "youtube": {
            const ytUrl = `https://www.youtube.com/@${HANDLES.youtube}?sub_confirmation=1`
            // Pre-select the Google account linked to this site so the subscription
            // lands on the account the server verifies.
            if (userEmail) {
                return `https://accounts.google.com/AccountChooser?Email=${encodeURIComponent(userEmail)}&continue=${encodeURIComponent(ytUrl)}`
            }
            return ytUrl
        }
        case "instagram": return `https://www.instagram.com/${HANDLES.instagram}/`
        case "facebook": return `https://www.facebook.com/${HANDLES.facebook}`
        case "linkedin": return `https://www.linkedin.com/${HANDLES.linkedin}`
        case "twitter": return `https://twitter.com/intent/follow?screen_name=${HANDLES.twitter}`
        default: return "#"
    }
}

interface SubscribeModalProps {
    /** Only the platforms required for this download */
    platforms: string[]
    onClose: () => void
    /** Called once every required platform is verified */
    onAllVerified: () => void
}

export function SubscribeModal({ platforms, onClose, onAllVerified }: SubscribeModalProps) {
    const { data: session } = useSession()
    const [verified, setVerified] = useState<Record<string, boolean>>({})
    const [verifyingId, setVerifyingId] = useState<string | null>(null)

    useEffect(() => {
        // Load current subscription status so already-subscribed platforms show as done
        fetch("/api/subscriptions")
            .then((res) => (res.ok ? res.json() : {}))
            .then((data) => setVerified(data || {}))
            .catch(() => { })
    }, [])

    const allVerified = platforms.every((p) => verified[p])

    const handleSubscribe = useCallback((platformId: string) => {
        const url = getPlatformUrl(platformId, session?.user?.email)
        const width = 600
        const height = 600
        const left = window.screen.width / 2 - width / 2
        const top = window.screen.height / 2 - height / 2

        setVerifyingId(platformId)
        const popup = window.open(url, `Connect ${platformId}`, `width=${width},height=${height},left=${left},top=${top}`)

        const checkPopup = setInterval(async () => {
            if (popup?.closed) {
                clearInterval(checkPopup)
                try {
                    const res = await fetch("/api/subscriptions/verify", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ platform: platformId }),
                    })
                    const data = await res.json()
                    if (res.ok && data.verified) {
                        setVerified((prev) => ({ ...prev, [platformId]: true }))
                    } else {
                        alert(`Verification failed for ${platformId}. ${data.message || ""}`)
                    }
                } catch {
                    alert("An error occurred while verifying.")
                } finally {
                    setVerifyingId(null)
                }
            }
        }, 1000)
    }, [session?.user?.email])

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 border border-black/10 dark:border-white/10 p-6 shadow-2xl">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400"
                >
                    <X className="h-5 w-5" />
                </button>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Subscribe to download</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    This download requires the following subscription{platforms.length > 1 ? "s" : ""}. Subscribe and we&apos;ll verify automatically when you close the window.
                </p>

                <div className="space-y-3">
                    {platforms.map((platformId) => {
                        const meta = PLATFORM_META[platformId]
                        if (!meta) return null
                        const Icon = meta.icon
                        const isDone = !!verified[platformId]
                        const isVerifying = verifyingId === platformId

                        return (
                            <div key={platformId} className="flex items-center justify-between rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 p-3">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full bg-white dark:bg-white/10 ${meta.color}`}>
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <span className="font-medium text-gray-900 dark:text-white">{meta.name}</span>
                                </div>
                                {isDone ? (
                                    <span className="flex items-center gap-1 text-sm font-medium text-green-600 dark:text-green-400">
                                        <Check className="h-4 w-4" /> Subscribed
                                    </span>
                                ) : (
                                    <button
                                        onClick={() => handleSubscribe(platformId)}
                                        disabled={isVerifying}
                                        className="flex items-center gap-2 rounded-full bg-black dark:bg-white text-white dark:text-black px-4 py-1.5 text-sm font-medium hover:scale-105 transition-transform disabled:opacity-50"
                                    >
                                        {isVerifying ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" /> Verifying...
                                            </>
                                        ) : (
                                            "Subscribe"
                                        )}
                                    </button>
                                )}
                            </div>
                        )
                    })}
                </div>

                <button
                    onClick={onAllVerified}
                    disabled={!allVerified}
                    className="mt-6 w-full rounded-lg bg-orange-600 px-6 py-3 font-bold text-white hover:bg-orange-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {allVerified ? "Continue to download" : "Complete subscriptions to download"}
                </button>
            </div>
        </div>
    )
}
