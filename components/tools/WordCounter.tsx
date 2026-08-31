"use client"

import { useState } from "react"
import { ToolPanel, toolArea } from "./ui"

export default function WordCounter() {
    const [text, setText] = useState("")
    const words = text.trim() ? text.trim().split(/\s+/).length : 0
    const chars = text.length
    const charsNoSpace = text.replace(/\s/g, "").length
    const sentences = text.trim() ? (text.match(/[.!?]+/g) || []).length || 1 : 0
    const paragraphs = text.trim() ? text.split(/\n\s*\n/).filter(p => p.trim()).length : 0
    const readingTime = Math.ceil(words / 200)   // ~200 wpm

    const stats = [
        ["Words", words], ["Characters", chars], ["Characters (no spaces)", charsNoSpace],
        ["Sentences", sentences], ["Paragraphs", paragraphs], ["Reading time", `${readingTime} min`],
    ] as const

    return (
        <ToolPanel>
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={10} placeholder="Type or paste your text…" className={toolArea} />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {stats.map(([label, val]) => (
                    <div key={label} className="rounded-lg bg-black/40 border border-white/10 p-3 text-center">
                        <div className="text-2xl font-bold text-orange-400">{val}</div>
                        <div className="text-xs text-gray-500">{label}</div>
                    </div>
                ))}
            </div>
        </ToolPanel>
    )
}
