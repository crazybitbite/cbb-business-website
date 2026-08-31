"use client"

import { useState } from "react"
import { ToolPanel, CopyButton, toolInput } from "./ui"

export default function BoxShadowGenerator() {
    const [x, setX] = useState(0)
    const [y, setY] = useState(10)
    const [blur, setBlur] = useState(25)
    const [spread, setSpread] = useState(-5)
    const [color, setColor] = useState("#000000")
    const [opacity, setOpacity] = useState(35)

    const rgba = (() => {
        const n = parseInt(color.slice(1), 16)
        return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${opacity / 100})`
    })()
    const css = `box-shadow: ${x}px ${y}px ${blur}px ${spread}px ${rgba};`

    const Slider = ({ label, val, set, min, max }: any) => (
        <label className="flex items-center justify-between gap-3 text-sm text-gray-300">
            <span className="w-16">{label}</span>
            <input type="range" min={min} max={max} value={val} onChange={(e) => set(parseInt(e.target.value))} className="flex-1 accent-orange-600" />
            <span className="w-12 text-right font-mono text-xs">{val}</span>
        </label>
    )

    return (
        <ToolPanel>
            <div className="grid gap-2 md:grid-cols-2">
                <Slider label="X" val={x} set={setX} min={-50} max={50} />
                <Slider label="Y" val={y} set={setY} min={-50} max={50} />
                <Slider label="Blur" val={blur} set={setBlur} min={0} max={100} />
                <Slider label="Spread" val={spread} set={setSpread} min={-50} max={50} />
                <Slider label="Opacity" val={opacity} set={setOpacity} min={0} max={100} />
                <label className="flex items-center gap-2 text-sm text-gray-300">Color
                    <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-8 w-12 rounded cursor-pointer bg-transparent" />
                </label>
            </div>
            <div className="flex items-center justify-center h-48 rounded-xl bg-white/5">
                <div className="h-24 w-40 rounded-xl bg-white" style={{ boxShadow: `${x}px ${y}px ${blur}px ${spread}px ${rgba}` }} />
            </div>
            <div className="flex items-center gap-2">
                <input readOnly value={css} className={toolInput} onFocus={(e) => e.target.select()} />
                <CopyButton text={css} />
            </div>
        </ToolPanel>
    )
}
