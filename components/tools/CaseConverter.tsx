"use client"

import { useState } from "react"
import { ToolPanel, CopyButton, toolArea } from "./ui"

const words = (s: string) => s.replace(/([a-z])([A-Z])/g, "$1 $2").split(/[\s_-]+/).filter(Boolean)

const TRANSFORMS: [string, (s: string) => string][] = [
    ["UPPERCASE", (s) => s.toUpperCase()],
    ["lowercase", (s) => s.toLowerCase()],
    ["Title Case", (s) => words(s).map(w => w[0].toUpperCase() + w.slice(1).toLowerCase()).join(" ")],
    ["Sentence case", (s) => { const l = s.toLowerCase(); return l.charAt(0).toUpperCase() + l.slice(1); }],
    ["camelCase", (s) => words(s).map((w, i) => i === 0 ? w.toLowerCase() : w[0].toUpperCase() + w.slice(1).toLowerCase()).join("")],
    ["PascalCase", (s) => words(s).map(w => w[0].toUpperCase() + w.slice(1).toLowerCase()).join("")],
    ["snake_case", (s) => words(s).map(w => w.toLowerCase()).join("_")],
    ["kebab-case", (s) => words(s).map(w => w.toLowerCase()).join("-")],
]

export default function CaseConverter() {
    const [text, setText] = useState("")
    const [result, setResult] = useState("")

    return (
        <ToolPanel>
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} placeholder="Type or paste text…" className={toolArea} />
            <div className="flex flex-wrap gap-2">
                {TRANSFORMS.map(([label, fn]) => (
                    <button key={label} onClick={() => setResult(fn(text))} className="rounded-lg bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 text-sm font-mono transition-colors">{label}</button>
                ))}
            </div>
            {result && (
                <div className="space-y-2">
                    <textarea readOnly value={result} rows={4} className={toolArea} />
                    <CopyButton text={result} />
                </div>
            )}
        </ToolPanel>
    )
}
