"use client"

import { useState } from "react"
import { ToolPanel, CopyButton, toolInput } from "./ui"

// Position of a character in the alphabet: A/a → 1 … Z/z → 26.
// Faithful to the reference: ord(c.upper()) - ord('A') + 1.
function letterPos(c: string): number {
    return c.toUpperCase().charCodeAt(0) - "A".charCodeAt(0) + 1
}

// Sum of a number's digits (non-digit chars ignored, matching int(digit) over str()).
function digitSum(n: number): number {
    return String(Math.abs(n))
        .split("")
        .reduce((acc, d) => acc + (d >= "0" && d <= "9" ? Number(d) : 0), 0)
}

// Reduce to a single digit: while number > 9, replace with its digit sum.
function sumTotal(n: number): number {
    let x = n
    while (x > 9) x = digitSum(x)
    return x
}

export default function NameNumber() {
    const [name, setName] = useState("a")

    const chars = [...name]
    const rows = chars.map((c) => ({ char: c, pos: letterPos(c) }))
    const rawSum = rows.reduce((acc, r) => acc + r.pos, 0)
    const total = sumTotal(rawSum)

    // Mirror the program's stdout line-for-line.
    const output =
        rows.map((r) => `${r.char}: ${r.pos}`).join("\n") +
        (rows.length ? "\n" : "") +
        `total of name ${name}: ${total}`

    return (
        <ToolPanel>
            <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-300">Name</label>
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter a name, e.g. a"
                    className={toolInput}
                />
            </div>

            {rows.length > 0 && (
                <>
                    {/* Per-letter breakdown */}
                    <div className="rounded-lg border border-white/10 overflow-hidden">
                        <div className="grid grid-cols-2 bg-white/5 text-xs font-semibold uppercase tracking-wide text-gray-400">
                            <span className="px-3 py-2">Letter</span>
                            <span className="px-3 py-2">Position</span>
                        </div>
                        <div className="divide-y divide-white/10 max-h-56 overflow-y-auto">
                            {rows.map((r, i) => (
                                <div key={i} className="grid grid-cols-2 text-sm">
                                    <span className="px-3 py-1.5 font-mono text-white">
                                        {r.char === " " ? "␣" : r.char}
                                    </span>
                                    <span className="px-3 py-1.5 font-mono text-green-400">{r.pos}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Totals */}
                    <div className="flex flex-wrap gap-3">
                        <div className="flex-1 min-w-[140px] rounded-lg border border-white/10 bg-black/30 px-4 py-3">
                            <p className="text-xs uppercase tracking-wide text-gray-500">Sum of positions</p>
                            <p className="text-lg font-bold text-white">{rawSum}</p>
                        </div>
                        <div className="flex-1 min-w-[140px] rounded-lg border border-orange-500/30 bg-orange-500/10 px-4 py-3">
                            <p className="text-xs uppercase tracking-wide text-orange-300">Name total (single digit)</p>
                            <p className="text-lg font-bold text-orange-400">{total}</p>
                        </div>
                    </div>

                    {/* Raw program output */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold uppercase tracking-wide text-gray-400">Output</label>
                            <CopyButton text={output} />
                        </div>
                        <pre className="rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm text-gray-200 font-mono whitespace-pre-wrap break-all">
                            {output}
                        </pre>
                    </div>
                </>
            )}
        </ToolPanel>
    )
}
