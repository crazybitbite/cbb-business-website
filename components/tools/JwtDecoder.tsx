"use client"

import { useState } from "react"
import { ToolPanel, toolArea } from "./ui"

function decodePart(part: string): string {
    try {
        const json = decodeURIComponent(
            atob(part.replace(/-/g, "+").replace(/_/g, "/"))
                .split("").map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0")).join("")
        )
        return JSON.stringify(JSON.parse(json), null, 2)
    } catch {
        return ""
    }
}

export default function JwtDecoder() {
    const [token, setToken] = useState("")
    const parts = token.trim().split(".")
    const header = parts[0] ? decodePart(parts[0]) : ""
    const payload = parts[1] ? decodePart(parts[1]) : ""
    const valid = parts.length === 3 && header && payload

    // Human-readable expiry
    let expiry = ""
    try {
        const exp = JSON.parse(payload || "{}").exp
        if (exp) expiry = `Expires: ${new Date(exp * 1000).toLocaleString()} (${exp * 1000 < Date.now() ? "EXPIRED" : "valid"})`
    } catch { }

    return (
        <ToolPanel>
            <textarea value={token} onChange={(e) => setToken(e.target.value)} rows={4} placeholder="Paste a JWT (header.payload.signature)" className={toolArea} />
            <p className="text-xs text-gray-500">Decodes the header and payload locally — this does NOT verify the signature. Never paste production secrets.</p>
            {token && !valid && <p className="text-sm text-red-400">Not a valid JWT (expected three dot-separated parts).</p>}
            {valid && (
                <div className="space-y-3">
                    <div><p className="text-xs font-bold text-orange-400 mb-1">Header</p><pre className="rounded bg-black/40 border border-white/10 p-3 text-xs text-green-400 overflow-x-auto">{header}</pre></div>
                    <div><p className="text-xs font-bold text-orange-400 mb-1">Payload</p><pre className="rounded bg-black/40 border border-white/10 p-3 text-xs text-green-400 overflow-x-auto">{payload}</pre></div>
                    {expiry && <p className="text-sm text-gray-300">{expiry}</p>}
                </div>
            )}
        </ToolPanel>
    )
}
