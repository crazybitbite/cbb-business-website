"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Download, Loader2 } from "lucide-react"
import { SubscribeModal } from "@/components/SubscribeModal"

/**
 * Download action for a downloadable page. Checks requirements server-side;
 * prompts sign-in or the required-subscriptions modal when needed.
 */
export function DownloadButton({ pageId, className }: { pageId: number | string; className?: string }) {
    const router = useRouter()
    const [modalPlatforms, setModalPlatforms] = useState<string[] | null>(null)
    const [isDownloading, setIsDownloading] = useState(false)

    const triggerDownload = async () => {
        setIsDownloading(true)
        try {
            const res = await fetch(`/api/pages/${pageId}/download`)
            const data = await res.json()

            if (res.ok && data.allowed) {
                setModalPlatforms(null)
                if (data.url) {
                    window.open(data.url, "_blank")
                } else {
                    alert("This download will be available soon.")
                }
            } else if (res.status === 401) {
                router.push("/login?callbackUrl=/")
            } else if (res.status === 403 && Array.isArray(data.missing)) {
                setModalPlatforms(data.missing)
            } else {
                alert(data.error || "Download is not available.")
            }
        } catch {
            alert("Download failed. Please try again.")
        } finally {
            setIsDownloading(false)
        }
    }

    return (
        <>
            <button
                onClick={triggerDownload}
                disabled={isDownloading}
                className={className || "w-full flex items-center justify-center gap-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white py-2 text-sm font-bold transition-colors disabled:opacity-50"}
            >
                {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                <span>Download</span>
            </button>

            {modalPlatforms && (
                <SubscribeModal
                    platforms={modalPlatforms}
                    onClose={() => setModalPlatforms(null)}
                    onAllVerified={triggerDownload}
                />
            )}
        </>
    )
}
