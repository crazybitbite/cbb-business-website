"use client"

import { useState } from "react"
import { ToolPanel, toolInput } from "./ui"

const BASES: [string, number][] = [["Binary", 2], ["Octal", 8], ["Decimal", 10], ["Hexadecimal", 16]]

export default function NumberBaseConverter() {
    const [value, setValue] = useState("42")
    const [base, setBase] = useState(10)
    const [error, setError] = useState("")

    const parsed = (() => {
        const clean = value.trim().replace(/^0[bxo]/i, "")
        const n = parseInt(clean, base)
        return Number.isNaN(n) ? null : n
    })()

    const update = (v: string, b: number) => {
        setValue(v); setBase(b)
        const n = parseInt(v.trim(), b)
        setError(v.trim() && Number.isNaN(n) ? `Not a valid base-${b} number` : "")
    }

    return (
        <ToolPanel>
            <div className="flex flex-wrap gap-2 items-center">
                <input value={value} onChange={(e) => update(e.target.value, base)} className={`${toolInput} flex-1 min-w-[160px]`} placeholder="Enter a number" />
                <select value={base} onChange={(e) => update(value, parseInt(e.target.value))} className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white [&>option]:bg-gray-900">
                    {BASES.map(([label, b]) => <option key={b} value={b}>{label} (base {b})</option>)}
                </select>
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            {parsed !== null && (
                <div className="space-y-2">
                    {BASES.map(([label, b]) => (
                        <div key={b} className="flex items-center gap-2">
                            <span className="w-28 text-xs text-gray-500">{label}</span>
                            <code className="flex-1 rounded bg-black/40 border border-white/10 px-3 py-1.5 text-sm text-green-400 font-mono break-all">
                                {b === 16 ? parsed.toString(16).toUpperCase() : parsed.toString(b)}
                            </code>
                        </div>
                    ))}
                </div>
            )}
        </ToolPanel>
    )
}
