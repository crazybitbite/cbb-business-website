"use client"

import { useState, useEffect } from "react"
import { ToolPanel, toolBtn, toolBtnGhost, toolInput } from "./ui"

export default function EpochConverter() {
    const [now, setNow] = useState(Math.floor(Date.now() / 1000))
    const [epoch, setEpoch] = useState("")
    const [human, setHuman] = useState("")
    const [result, setResult] = useState<{ label: string; rows: [string, string][] } | null>(null)

    useEffect(() => {
        const id = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000)
        return () => clearInterval(id)
    }, [])

    const fromEpoch = () => {
        const n = parseInt(epoch.trim())
        if (Number.isNaN(n)) return
        const ms = epoch.trim().length > 11 ? n : n * 1000 // detect ms vs s
        const d = new Date(ms)
        setResult({
            label: `Epoch ${epoch.trim()} (${epoch.trim().length > 11 ? "milliseconds" : "seconds"})`,
            rows: [
                ["Local time", d.toLocaleString()],
                ["UTC", d.toUTCString()],
                ["ISO 8601", d.toISOString()],
                ["Relative", relative(d)],
            ],
        })
    }

    const fromHuman = () => {
        const d = new Date(human)
        if (isNaN(d.getTime())) return
        setResult({
            label: d.toLocaleString(),
            rows: [
                ["Epoch (seconds)", String(Math.floor(d.getTime() / 1000))],
                ["Epoch (milliseconds)", String(d.getTime())],
                ["ISO 8601", d.toISOString()],
            ],
        })
    }

    const relative = (d: Date) => {
        const diff = Math.round((d.getTime() - Date.now()) / 1000)
        const abs = Math.abs(diff)
        const unit = abs > 86400 * 365 ? [31536000, "year"] : abs > 86400 * 30 ? [2592000, "month"] : abs > 86400 ? [86400, "day"] : abs > 3600 ? [3600, "hour"] : abs > 60 ? [60, "minute"] : [1, "second"]
        const n = Math.round(abs / (unit[0] as number))
        return diff < 0 ? `${n} ${unit[1]}${n !== 1 ? "s" : ""} ago` : `in ${n} ${unit[1]}${n !== 1 ? "s" : ""}`
    }

    return (
        <ToolPanel>
            <div className="rounded-lg bg-black/40 border border-white/10 p-3 flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm text-gray-400">Current epoch:</span>
                <span className="font-mono text-green-400">{now}</span>
                <button className={toolBtnGhost} onClick={() => navigator.clipboard.writeText(String(now)).catch(() => { })}>Copy</button>
            </div>
            <div className="flex flex-wrap gap-2">
                <input value={epoch} onChange={(e) => setEpoch(e.target.value)} placeholder="Epoch, e.g. 1767225600" className={`${toolInput} flex-1 min-w-[180px]`} onKeyDown={(e) => e.key === "Enter" && fromEpoch()} />
                <button className={toolBtn} onClick={fromEpoch}>Epoch → Date</button>
            </div>
            <div className="flex flex-wrap gap-2">
                <input type="datetime-local" value={human} onChange={(e) => setHuman(e.target.value)} className={`${toolInput} flex-1 min-w-[180px]`} />
                <button className={toolBtn} onClick={fromHuman}>Date → Epoch</button>
            </div>
            {result && (
                <div className="rounded-lg bg-black/40 border border-white/10 p-4 space-y-2">
                    <p className="text-sm font-bold text-white">{result.label}</p>
                    {result.rows.map(([k, v]) => (
                        <p key={k} className="text-sm"><span className="text-gray-500 inline-block w-44">{k}</span><span className="font-mono text-green-400">{v}</span></p>
                    ))}
                </div>
            )}
        </ToolPanel>
    )
}
