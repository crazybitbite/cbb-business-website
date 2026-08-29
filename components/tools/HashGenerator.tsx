"use client"

import { useState } from "react"
import { ToolPanel, toolBtn, toolArea, toolBtnGhost } from "./ui"

const ALGOS = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"] as const

export default function HashGenerator() {
    const [input, setInput] = useState("")
    const [hashes, setHashes] = useState<Record<string, string>>({})

    const run = async () => {
        const data = new TextEncoder().encode(input)
        const result: Record<string, string> = {}
        for (const algo of ALGOS) {
            const buf = await crypto.subtle.digest(algo, data)
            result[algo] = Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("")
        }
        setHashes(result)
    }

    return (
        <ToolPanel>
            <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={6} placeholder="Text to hash..." className={toolArea} />
            <button className={toolBtn} onClick={run}>Generate Hashes</button>
            {Object.entries(hashes).map(([algo, hex]) => (
                <div key={algo} className="space-y-1">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-orange-400">{algo}</span>
                        <button className={`${toolBtnGhost} !py-1 !px-2 text-xs`} onClick={() => navigator.clipboard.writeText(hex).catch(() => { })}>Copy</button>
                    </div>
                    <p className="rounded bg-black/40 border border-white/10 p-2 text-xs font-mono text-green-400 break-all">{hex}</p>
                </div>
            ))}
        </ToolPanel>
    )
}
