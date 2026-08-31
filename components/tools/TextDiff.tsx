"use client"

import { useState } from "react"
import { ToolPanel, toolArea } from "./ui"

// Simple line-based LCS diff
function diffLines(a: string[], b: string[]) {
    const n = a.length, m = b.length
    const dp: number[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0))
    for (let i = n - 1; i >= 0; i--)
        for (let j = m - 1; j >= 0; j--)
            dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1])

    const rows: { type: "same" | "add" | "del"; text: string }[] = []
    let i = 0, j = 0
    while (i < n && j < m) {
        if (a[i] === b[j]) { rows.push({ type: "same", text: a[i] }); i++; j++ }
        else if (dp[i + 1][j] >= dp[i][j + 1]) { rows.push({ type: "del", text: a[i] }); i++ }
        else { rows.push({ type: "add", text: b[j] }); j++ }
    }
    while (i < n) rows.push({ type: "del", text: a[i++] })
    while (j < m) rows.push({ type: "add", text: b[j++] })
    return rows
}

export default function TextDiff() {
    const [left, setLeft] = useState("")
    const [right, setRight] = useState("")
    const [rows, setRows] = useState<{ type: string; text: string }[] | null>(null)

    return (
        <ToolPanel>
            <div className="grid gap-3 md:grid-cols-2">
                <textarea value={left} onChange={(e) => setLeft(e.target.value)} rows={8} placeholder="Original text" className={toolArea} />
                <textarea value={right} onChange={(e) => setRight(e.target.value)} rows={8} placeholder="Changed text" className={toolArea} />
            </div>
            <button onClick={() => setRows(diffLines(left.split("\n"), right.split("\n")))} className="rounded-lg bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 text-sm font-bold">Compare</button>
            {rows && (
                <div className="rounded-lg bg-black/40 border border-white/10 p-3 font-mono text-xs overflow-x-auto">
                    {rows.map((r, i) => (
                        <div key={i} className={r.type === "add" ? "text-green-400 bg-green-500/10" : r.type === "del" ? "text-red-400 bg-red-500/10" : "text-gray-400"}>
                            <span className="select-none opacity-60">{r.type === "add" ? "+ " : r.type === "del" ? "- " : "  "}</span>{r.text || " "}
                        </div>
                    ))}
                </div>
            )}
        </ToolPanel>
    )
}
