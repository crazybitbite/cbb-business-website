"use client"

import { useState } from "react"
import { ToolPanel, CopyButton, toolBtn, toolBtnGhost, toolArea } from "./ui"

export default function JsonBeautifier() {
    const [input, setInput] = useState("")
    const [output, setOutput] = useState("")
    const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null)
    const [indent, setIndent] = useState(2)

    const run = (mode: "beautify" | "minify" | "validate") => {
        try {
            const parsed = JSON.parse(input)
            if (mode === "validate") {
                setStatus({ ok: true, msg: "Valid JSON ✓" })
                return
            }
            setOutput(mode === "beautify" ? JSON.stringify(parsed, null, indent) : JSON.stringify(parsed))
            setStatus({ ok: true, msg: mode === "beautify" ? "Beautified" : "Minified" })
        } catch (e) {
            setStatus({ ok: false, msg: `Invalid JSON: ${(e as Error).message}` })
        }
    }

    return (
        <ToolPanel>
            <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={10}
                placeholder='Paste JSON here, e.g. {"hello": "world"}'
                className={toolArea}
            />
            <div className="flex flex-wrap items-center gap-2">
                <button className={toolBtn} onClick={() => run("beautify")}>Beautify</button>
                <button className={toolBtnGhost} onClick={() => run("minify")}>Minify</button>
                <button className={toolBtnGhost} onClick={() => run("validate")}>Validate</button>
                <select
                    value={indent}
                    onChange={(e) => setIndent(parseInt(e.target.value))}
                    className="rounded-lg bg-white/5 border border-white/10 px-2 py-2 text-sm text-white [&>option]:bg-gray-900"
                >
                    <option value={2}>2 spaces</option>
                    <option value={4}>4 spaces</option>
                </select>
                <CopyButton text={output} />
            </div>
            {status && (
                <p className={`text-sm ${status.ok ? "text-green-400" : "text-red-400"}`}>{status.msg}</p>
            )}
            {output && (
                <textarea readOnly value={output} rows={10} className={toolArea} />
            )}
        </ToolPanel>
    )
}
