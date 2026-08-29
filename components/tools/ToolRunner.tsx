"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Lock, ShoppingCart, Check, LogIn } from "lucide-react"
import { TOOL_COMPONENTS } from "./registry"
import { SubscribeModal } from "@/components/SubscribeModal"
import { useCartStore } from "@/lib/store"
import { useSiteSettings } from "@/components/SiteSettingsProvider"

export interface ToolAccessInfo {
    allowed: boolean
    reason?: "login" | "purchase" | "subscription"
    missing?: string[]
    price?: number
    currency?: string
}

interface ToolRunnerProps {
    pageId: number
    pageName: string
    pageSlug: string
    toolKey: string
    access: ToolAccessInfo
    image?: string
}

/**
 * Renders the tool when access is granted; otherwise shows the exact gate the
 * admin configured (sign in / purchase / subscribe). Access is decided
 * server-side — this component only presents it.
 */
export function ToolRunner({ pageId, pageName, pageSlug, toolKey, access, image }: ToolRunnerProps) {
    const router = useRouter()
    const addItem = useCartStore((s) => s.addItem)
    const { displayPrice } = useSiteSettings()
    const [showSubscribe, setShowSubscribe] = useState(false)
    const [justAdded, setJustAdded] = useState(false)

    if (access.allowed) {
        const Tool = TOOL_COMPONENTS[toolKey]
        if (!Tool) {
            return <p className="text-red-400 text-sm">Tool &quot;{toolKey}&quot; is not registered.</p>
        }
        return <Tool />
    }

    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-orange-500/10 border border-orange-500/30">
                <Lock className="h-6 w-6 text-orange-400" />
            </div>

            {access.reason === "login" && (
                <>
                    <h3 className="text-xl font-bold text-white">Sign in to use this tool</h3>
                    <p className="text-sm text-gray-400">This tool requires an account.</p>
                    <Link
                        href={`/login?callbackUrl=/${pageSlug}`}
                        className="inline-flex items-center gap-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white px-6 py-2.5 font-bold transition-colors"
                    >
                        <LogIn className="h-4 w-4" /> Sign In
                    </Link>
                </>
            )}

            {access.reason === "purchase" && (
                <>
                    <h3 className="text-xl font-bold text-white">This is a premium tool</h3>
                    <p className="text-sm text-gray-400">
                        Purchase once for <span className="font-bold text-orange-400">{displayPrice(access.price || 0, access.currency || "USD")}</span> to unlock unlimited use.
                    </p>
                    <button
                        onClick={() => {
                            addItem({ id: pageId, name: pageName, price: access.price || 0, currency: access.currency || "USD", image })
                            setJustAdded(true)
                            setTimeout(() => router.push("/cart"), 600)
                        }}
                        className={`inline-flex items-center gap-2 rounded-lg px-6 py-2.5 font-bold text-white transition-colors ${justAdded ? "bg-green-600" : "bg-orange-600 hover:bg-orange-700"}`}
                    >
                        {justAdded ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
                        {justAdded ? "Added — going to cart..." : "Buy Access"}
                    </button>
                    <p className="text-xs text-gray-500">Already purchased? <button onClick={() => router.refresh()} className="text-orange-400 hover:underline">Refresh access</button></p>
                </>
            )}

            {access.reason === "subscription" && (
                <>
                    <h3 className="text-xl font-bold text-white">Subscribe to unlock this tool</h3>
                    <p className="text-sm text-gray-400">
                        This tool is free once you follow us on: <span className="text-white font-medium capitalize">{(access.missing || []).join(", ")}</span>
                    </p>
                    <button
                        onClick={() => setShowSubscribe(true)}
                        className="inline-flex items-center gap-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white px-6 py-2.5 font-bold transition-colors"
                    >
                        Subscribe &amp; Unlock
                    </button>
                    {showSubscribe && (
                        <SubscribeModal
                            platforms={access.missing || []}
                            onClose={() => setShowSubscribe(false)}
                            onAllVerified={() => {
                                setShowSubscribe(false)
                                router.refresh()
                            }}
                        />
                    )}
                </>
            )}
        </div>
    )
}
