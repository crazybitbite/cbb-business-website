"use client"

import { useState } from "react"
import { ToolPanel, CopyButton, toolInput } from "./ui"

export default function GradientGenerator() {
    const [c1, setC1] = useState("#f97316")
    const [c2, setC2] = useState("#ec4899")
    const [angle, setAngle] = useState(90)
    const css = `background: linear-gradient(${angle}deg, ${c1}, ${c2});`

    return (
        <ToolPanel>
            <div className="flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-gray-300">Color 1
                    <input type="color" value={c1} onChange={(e) => setC1(e.target.value)} className="h-9 w-12 rounded cursor-pointer bg-transparent" />
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-300">Color 2
                    <input type="color" value={c2} onChange={(e) => setC2(e.target.value)} className="h-9 w-12 rounded cursor-pointer bg-transparent" />
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-300">Angle {angle}°
                    <input type="range" min={0} max={360} value={angle} onChange={(e) => setAngle(parseInt(e.target.value))} className="w-40 accent-orange-600" />
                </label>
            </div>
            <div className="h-48 rounded-xl border border-white/10" style={{ background: `linear-gradient(${angle}deg, ${c1}, ${c2})` }} />
            <div className="flex items-center gap-2">
                <input readOnly value={css} className={toolInput} onFocus={(e) => e.target.select()} />
                <CopyButton text={css} />
            </div>
        </ToolPanel>
    )
}
