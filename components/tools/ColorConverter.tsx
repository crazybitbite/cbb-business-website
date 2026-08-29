"use client"

import { useState } from "react"
import { ToolPanel, toolInput, toolBtnGhost } from "./ui"

function hexToRgb(hex: string): [number, number, number] | null {
    const m = /^#?([0-9a-f]{6}|[0-9a-f]{3})$/i.exec(hex.trim())
    if (!m) return null
    let h = m[1]
    if (h.length === 3) h = h.split("").map((c) => c + c).join("")
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
    r /= 255; g /= 255; b /= 255
    const max = Math.max(r, g, b), min = Math.min(r, g, b)
    let h = 0, s = 0
    const l = (max + min) / 2
    if (max !== min) {
        const d = max - min
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
        if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        else if (max === g) h = ((b - r) / d + 2) / 6
        else h = ((r - g) / d + 4) / 6
    }
    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)]
}

export default function ColorConverter() {
    const [input, setInput] = useState("#f97316")

    let rgb = hexToRgb(input)
    if (!rgb) {
        const m = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i.exec(input)
        if (m) rgb = [Math.min(255, +m[1]), Math.min(255, +m[2]), Math.min(255, +m[3])]
    }
    const hex = rgb ? `#${rgb.map((c) => c.toString(16).padStart(2, "0")).join("")}` : null
    const hsl = rgb ? rgbToHsl(...rgb) : null

    const rows: [string, string][] = rgb && hex && hsl ? [
        ["HEX", hex],
        ["RGB", `rgb(${rgb.join(", ")})`],
        ["HSL", `hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)`],
    ] : []

    return (
        <ToolPanel>
            <div className="flex flex-wrap items-center gap-3">
                <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="#f97316 or rgb(249, 115, 22)" className={`${toolInput} flex-1 min-w-[200px]`} />
                <input type="color" value={hex || "#f97316"} onChange={(e) => setInput(e.target.value)} className="h-10 w-14 rounded cursor-pointer bg-transparent" />
            </div>
            {rgb ? (
                <div className="flex flex-wrap gap-4 items-start">
                    <div className="h-28 w-28 rounded-xl border border-white/10" style={{ backgroundColor: hex! }} />
                    <div className="space-y-2 flex-1">
                        {rows.map(([label, value]) => (
                            <div key={label} className="flex items-center gap-2">
                                <span className="text-xs text-gray-500 w-10">{label}</span>
                                <code className="rounded bg-black/40 border border-white/10 px-2 py-1 text-sm text-green-400 font-mono">{value}</code>
                                <button className={`${toolBtnGhost} !py-1 !px-2 text-xs`} onClick={() => navigator.clipboard.writeText(value).catch(() => { })}>Copy</button>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <p className="text-sm text-red-400">Enter a valid HEX (#f97316) or RGB color.</p>
            )}
        </ToolPanel>
    )
}
