"use client"

import { useState } from "react"
import { Send, MessageCircle, QrCode, X } from "lucide-react"
import { useSiteSettings } from "@/components/SiteSettingsProvider"

interface Channel {
    key: "telegram" | "whatsapp"
    label: string
    icon: typeof Send
    color: string
    link?: string
    qr?: string
}

/**
 * Telegram / WhatsApp connect buttons, shown only when configured in Settings.
 * The link opens the group/channel; the QR icon (when a QR is uploaded) opens
 * a scan-to-join modal.
 */
export function MessagingConnect() {
    const { settings } = useSiteSettings()
    const [qrModal, setQrModal] = useState<{ label: string; qr: string } | null>(null)

    const channels: Channel[] = ([
        { key: "telegram" as const, label: "Telegram", icon: Send, color: "text-sky-400 border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20", link: settings.telegram, qr: settings.telegramQr },
        { key: "whatsapp" as const, label: "WhatsApp", icon: MessageCircle, color: "text-green-400 border-green-500/30 bg-green-500/10 hover:bg-green-500/20", link: settings.whatsapp, qr: settings.whatsappQr },
    ]).filter((c) => c.link || c.qr)

    if (!channels.length) return null

    return (
        <>
            <div className="space-y-3">
                <p className="text-sm text-gray-400">Join our community</p>
                <div className="flex flex-wrap gap-3">
                    {channels.map((c) => {
                        const Icon = c.icon
                        return (
                            <div key={c.key} className="flex items-center gap-1.5">
                                {c.link ? (
                                    <a
                                        href={c.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${c.color}`}
                                    >
                                        <Icon className="h-4 w-4" /> {c.label}
                                    </a>
                                ) : (
                                    <span className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium ${c.color}`}>
                                        <Icon className="h-4 w-4" /> {c.label}
                                    </span>
                                )}
                                {c.qr && (
                                    <button
                                        onClick={() => setQrModal({ label: c.label, qr: c.qr! })}
                                        title={`Scan ${c.label} QR code`}
                                        className="p-2 rounded-full border border-white/10 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                                    >
                                        <QrCode className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            {qrModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setQrModal(null)} />
                    <div className="relative w-full max-w-xs rounded-2xl bg-gray-900 border border-white/10 p-6 shadow-2xl text-center space-y-4">
                        <button
                            onClick={() => setQrModal(null)}
                            className="absolute top-3 right-3 p-1 rounded-full hover:bg-white/10 text-gray-400"
                        >
                            <X className="h-5 w-5" />
                        </button>
                        <h3 className="text-lg font-bold text-white">Scan to join on {qrModal.label}</h3>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={qrModal.qr} alt={`${qrModal.label} QR code`} className="mx-auto w-56 h-56 object-contain rounded-xl bg-white p-2" />
                        <p className="text-xs text-gray-500">Open your camera or the app&apos;s QR scanner.</p>
                    </div>
                </div>
            )}
        </>
    )
}
