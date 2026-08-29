"use client"

import { useState } from "react"
import { ToolPanel, CopyButton, toolBtn, toolArea } from "./ui"

function minifyCss(css: string): string {
    return css
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/\s+/g, " ")
        .replace(/\s*([{};:,>+~])\s*/g, "$1")
        .replace(/;}/g, "}")
        .trim()
}

function minifyJs(js: string): string {
    // Conservative minifier: strips comments and collapses indentation while
    // preserving strings, template literals, and line structure (ASI-safe).
    let out = ""
    let inStr: string | null = null
    let inLineComment = false
    let inBlockComment = false
    for (let i = 0; i < js.length; i++) {
        const c = js[i]
        const next = js[i + 1]
        if (inLineComment) {
            if (c === "\n") { inLineComment = false; out += c }
            continue
        }
        if (inBlockComment) {
            if (c === "*" && next === "/") { inBlockComment = false; i++ }
            continue
        }
        if (inStr) {
            out += c
            if (c === "\\") { out += next ?? ""; i++ }
            else if (c === inStr) inStr = null
            continue
        }
        if (c === '"' || c === "'" || c === "`") { inStr = c; out += c; continue }
        if (c === "/" && next === "/") { inLineComment = true; continue }
        if (c === "/" && next === "*") { inBlockComment = true; i++; continue }
        out += c
    }
    return out
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length)
        .join("\n")
}

export default function CodeCompressor({ language }: { language: "js" | "css" }) {
    const [input, setInput] = useState("")
    const [output, setOutput] = useState("")
    const [stats, setStats] = useState("")

    const run = () => {
        const result = language === "css" ? minifyCss(input) : minifyJs(input)
        setOutput(result)
        const saved = input.length ? Math.round((1 - result.length / input.length) * 100) : 0
        setStats(`${input.length.toLocaleString()} → ${result.length.toLocaleString()} chars (${saved}% smaller)`)
    }

    return (
        <ToolPanel>
            <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={12}
                placeholder={language === "css" ? "Paste CSS here..." : "Paste JavaScript here..."}
                className={toolArea}
            />
            <div className="flex flex-wrap items-center gap-2">
                <button className={toolBtn} onClick={run}>Compress</button>
                <CopyButton text={output} />
                {stats && <span className="text-sm text-green-400">{stats}</span>}
            </div>
            {language === "js" && (
                <p className="text-xs text-gray-500">Safe compression: removes comments and indentation while preserving line breaks and strings. For aggressive minification use a build tool like Terser.</p>
            )}
            {output && <textarea readOnly value={output} rows={12} className={toolArea} />}
        </ToolPanel>
    )
}
