"use client"

import { useState } from "react"
import { ToolPanel, toolInput } from "./ui"

const FIELDS = ["minute", "hour", "day of month", "month", "day of week"]
const RANGES: [number, number][] = [[0, 59], [0, 23], [1, 31], [1, 12], [0, 6]]

function describeField(expr: string, name: string, [min, max]: [number, number]): string {
    if (expr === "*") return `every ${name}`
    const step = expr.match(/^\*\/(\d+)$/)
    if (step) return `every ${step[1]} ${name}s`
    const range = expr.match(/^(\d+)-(\d+)$/)
    if (range) return `${name}s ${range[1]} through ${range[2]}`
    if (expr.includes(",")) return `${name}s ${expr}`
    if (/^\d+$/.test(expr)) {
        const n = parseInt(expr)
        if (n < min || n > max) return `⚠ ${expr} is out of range (${min}-${max})`
        return `at ${name} ${expr}`
    }
    return `${name}: ${expr}`
}

export default function CronParser() {
    const [expr, setExpr] = useState("0 9 * * 1-5")
    const parts = expr.trim().split(/\s+/)
    const valid = parts.length === 5

    return (
        <ToolPanel>
            <input value={expr} onChange={(e) => setExpr(e.target.value)} placeholder="e.g. 0 9 * * 1-5" className={`${toolInput} text-lg`} />
            <p className="text-xs text-gray-500">Standard 5-field cron: minute hour day-of-month month day-of-week</p>
            {!valid ? (
                <p className="text-sm text-red-400">A cron expression needs exactly 5 fields (found {parts.length}).</p>
            ) : (
                <>
                    <div className="rounded-lg bg-orange-500/10 border border-orange-500/30 p-4 text-white">
                        Runs: {parts.map((p, i) => describeField(p, FIELDS[i], RANGES[i])).join(", ")}.
                    </div>
                    <div className="grid grid-cols-5 gap-2 text-center">
                        {parts.map((p, i) => (
                            <div key={i} className="rounded-lg bg-black/40 border border-white/10 p-2">
                                <div className="text-lg font-mono text-green-400">{p}</div>
                                <div className="text-[10px] text-gray-500">{FIELDS[i]}</div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </ToolPanel>
    )
}
