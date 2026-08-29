"use client"

import { useState, useMemo } from "react"
import { ToolPanel, toolInput, toolArea } from "./ui"

export default function RegexTester() {
    const [pattern, setPattern] = useState("")
    const [flags, setFlags] = useState("g")
    const [text, setText] = useState("")

    const { matches, error, highlighted } = useMemo(() => {
        if (!pattern) return { matches: [], error: "", highlighted: null as React.ReactNode }
        try {
            const safeFlags = flags.includes("g") ? flags : flags + "g"
            const re = new RegExp(pattern, safeFlags)
            const found = [...text.matchAll(re)].slice(0, 500)

            // Build highlighted view
            const parts: React.ReactNode[] = []
            let last = 0
            found.forEach((m, i) => {
                if (m.index == null) return
                parts.push(text.slice(last, m.index))
                parts.push(<mark key={i} className="bg-orange-500/40 text-white rounded px-0.5">{m[0] || "∅"}</mark>)
                last = m.index + (m[0]?.length || 1)
            })
            parts.push(text.slice(last))
            return { matches: found, error: "", highlighted: parts }
        } catch (e) {
            return { matches: [], error: (e as Error).message, highlighted: null }
        }
    }, [pattern, flags, text])

    return (
        <ToolPanel>
            <div className="flex flex-wrap gap-2 items-center">
                <span className="text-gray-500 font-mono">/</span>
                <input value={pattern} onChange={(e) => setPattern(e.target.value)} placeholder="pattern, e.g. \\b\\w+@\\w+\\.\\w+\\b" className={`${toolInput} flex-1 min-w-[200px]`} />
                <span className="text-gray-500 font-mono">/</span>
                <input value={flags} onChange={(e) => setFlags(e.target.value.replace(/[^gimsuy]/g, ""))} className={`${toolInput} w-20`} placeholder="flags" />
            </div>
            {error && <p className="text-sm text-red-400 font-mono">{error}</p>}
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={8} placeholder="Test string..." className={toolArea} />
            {pattern && !error && (
                <>
                    <p className="text-sm text-green-400">{matches.length} match{matches.length !== 1 ? "es" : ""}</p>
                    {text && (
                        <div className="rounded-lg bg-black/40 border border-white/10 p-3 text-sm font-mono text-gray-300 whitespace-pre-wrap break-all max-h-64 overflow-y-auto">
                            {highlighted}
                        </div>
                    )}
                    {matches.length > 0 && matches[0].length > 1 && (
                        <div className="text-xs font-mono text-gray-400 space-y-1">
                            <p className="text-gray-500">Capture groups (first match):</p>
                            {matches[0].slice(1).map((g, i) => (
                                <p key={i}>${i + 1}: <span className="text-sky-400">{g ?? "(no match)"}</span></p>
                            ))}
                        </div>
                    )}
                </>
            )}
        </ToolPanel>
    )
}
