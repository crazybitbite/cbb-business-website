"use client"

import { useState, useEffect, useCallback } from "react"
import { ToolPanel, toolBtn, toolBtnGhost, toolInput } from "./ui"

interface BinRequest {
    id: number
    method: string
    headers: Record<string, string>
    body: string
    ip: string | null
    createdAt: number
}

export default function PostDataReceiver() {
    const [token, setToken] = useState("")
    const [requests, setRequests] = useState<BinRequest[]>([])
    const [polling, setPolling] = useState(false)
    const [expanded, setExpanded] = useState<number | null>(null)

    // Stable per-browser token, survives reloads
    useEffect(() => {
        try {
            let t = localStorage.getItem("postbin-token")
            if (!t) {
                t = crypto.randomUUID().replace(/-/g, "").slice(0, 20)
                localStorage.setItem("postbin-token", t)
            }
            setToken(t)
        } catch {
            setToken(Math.random().toString(36).slice(2, 12))
        }
    }, [])

    const endpoint = token && typeof window !== "undefined" ? `${window.location.origin}/api/tools/postbin/${token}` : ""

    const refresh = useCallback(async () => {
        if (!token) return
        try {
            const res = await fetch(`/api/tools/postbin/${token}`)
            if (res.ok) setRequests((await res.json()).requests || [])
        } catch { }
    }, [token])

    useEffect(() => {
        refresh()
        if (!polling) return
        const id = setInterval(refresh, 3000)
        return () => clearInterval(id)
    }, [refresh, polling])

    const clear = async () => {
        await fetch(`/api/tools/postbin/${token}`, { method: "DELETE" }).catch(() => { })
        setRequests([])
    }

    const newToken = () => {
        const t = crypto.randomUUID().replace(/-/g, "").slice(0, 20)
        try { localStorage.setItem("postbin-token", t) } catch { }
        setToken(t)
        setRequests([])
    }

    return (
        <ToolPanel>
            <p className="text-sm text-gray-400">
                Send any HTTP request (POST, PUT, GET...) to your unique URL below and inspect it here —
                handy for testing webhooks, forms, and API clients.
            </p>
            <div className="flex flex-wrap gap-2">
                <input readOnly value={endpoint} className={`${toolInput} flex-1 min-w-[260px]`} onFocus={(e) => e.target.select()} />
                <button className={toolBtnGhost} onClick={() => navigator.clipboard.writeText(endpoint).catch(() => { })}>Copy URL</button>
                <button className={toolBtnGhost} onClick={newToken}>New URL</button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
                <button className={toolBtn} onClick={refresh}>Refresh</button>
                <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                    <input type="checkbox" checked={polling} onChange={(e) => setPolling(e.target.checked)} className="accent-orange-600" />
                    Auto-refresh every 3s
                </label>
                <button className={toolBtnGhost} onClick={clear}>Clear all</button>
                <span className="text-xs text-gray-500">Try: <code className="text-gray-400">curl -X POST -d &apos;hello&apos; {endpoint.slice(0, 40)}...</code></span>
            </div>

            <div className="space-y-2">
                {requests.length === 0 && (
                    <p className="text-sm text-gray-600 py-6 text-center">No requests captured yet.</p>
                )}
                {requests.map((r) => (
                    <div key={r.id} className="rounded-lg bg-black/40 border border-white/10">
                        <button
                            className="w-full flex flex-wrap items-center gap-3 px-3 py-2 text-left"
                            onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                        >
                            <span className="rounded bg-orange-600/20 text-orange-400 px-2 py-0.5 text-xs font-bold">{r.method}</span>
                            <span className="text-xs text-gray-400">{new Date(r.createdAt * 1000).toLocaleString()}</span>
                            {r.ip && <span className="text-xs text-gray-600">from {r.ip}</span>}
                            <span className="text-xs text-gray-500 truncate flex-1">{r.body?.slice(0, 60) || "(empty body)"}</span>
                        </button>
                        {expanded === r.id && (
                            <div className="px-3 pb-3 space-y-2 text-xs font-mono">
                                <div>
                                    <p className="text-gray-500 mb-1">Headers</p>
                                    <pre className="bg-white/5 rounded p-2 overflow-x-auto text-gray-300">{JSON.stringify(r.headers, null, 2)}</pre>
                                </div>
                                <div>
                                    <p className="text-gray-500 mb-1">Body</p>
                                    <pre className="bg-white/5 rounded p-2 overflow-x-auto text-green-400 whitespace-pre-wrap break-all">{r.body || "(empty)"}</pre>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </ToolPanel>
    )
}
