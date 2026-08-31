"use client"

import { useState } from "react"
import { ToolPanel, toolInput } from "./ui"

// Factors relative to a base unit per category
const CATEGORIES: Record<string, { base: string; units: Record<string, number> }> = {
    Length: { base: "m", units: { mm: 0.001, cm: 0.01, m: 1, km: 1000, inch: 0.0254, ft: 0.3048, mile: 1609.34 } },
    Weight: { base: "g", units: { mg: 0.001, g: 1, kg: 1000, lb: 453.592, oz: 28.3495 } },
    Data: { base: "byte", units: { bit: 0.125, byte: 1, KB: 1024, MB: 1048576, GB: 1073741824 } },
}

export default function UnitConverter() {
    const [category, setCategory] = useState("Length")
    const [value, setValue] = useState("1")
    const units = CATEGORIES[category].units
    const unitNames = Object.keys(units)
    const [from, setFrom] = useState(unitNames[0])

    const changeCategory = (c: string) => {
        setCategory(c); setFrom(Object.keys(CATEGORIES[c].units)[0])
    }

    const num = parseFloat(value)
    const inBase = Number.isNaN(num) ? null : num * units[from]

    return (
        <ToolPanel>
            <div className="flex flex-wrap gap-2 items-center">
                <select value={category} onChange={(e) => changeCategory(e.target.value)} className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white [&>option]:bg-gray-900">
                    {Object.keys(CATEGORIES).map((c) => <option key={c}>{c}</option>)}
                </select>
                <input type="number" value={value} onChange={(e) => setValue(e.target.value)} className={`${toolInput} flex-1 min-w-[120px]`} />
                <select value={from} onChange={(e) => setFrom(e.target.value)} className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white [&>option]:bg-gray-900">
                    {unitNames.map((u) => <option key={u}>{u}</option>)}
                </select>
            </div>
            {inBase !== null && (
                <div className="space-y-1.5">
                    {unitNames.filter((u) => u !== from).map((u) => (
                        <div key={u} className="flex items-center gap-2">
                            <span className="w-16 text-xs text-gray-500">{u}</span>
                            <code className="flex-1 rounded bg-black/40 border border-white/10 px-3 py-1.5 text-sm text-green-400 font-mono">
                                {(inBase / units[u]).toLocaleString(undefined, { maximumFractionDigits: 6 })}
                            </code>
                        </div>
                    ))}
                </div>
            )}
        </ToolPanel>
    )
}
