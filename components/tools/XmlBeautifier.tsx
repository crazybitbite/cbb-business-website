"use client"

import { useState } from "react"
import { ToolPanel, CopyButton, toolBtn, toolBtnGhost, toolArea } from "./ui"

function formatXml(xml: string, indent = "  "): string {
    // Normalize, then re-indent tag by tag
    const compact = xml.replace(/>\s+</g, "><").trim()
    let depth = 0
    let out = ""
    const tokens = compact.split(/(?=<)|(?<=>)/g).filter(Boolean)
    for (const token of tokens) {
        if (/^<\/(.+)>/.test(token)) {
            depth = Math.max(0, depth - 1)
            out += `${indent.repeat(depth)}${token.trim()}\n`
        } else if (/^<[^!?][^>]*[^/]>$/.test(token) && !/<.+<\/.+>/.test(token)) {
            out += `${indent.repeat(depth)}${token.trim()}\n`
            depth++
        } else if (token.trim()) {
            out += `${indent.repeat(depth)}${token.trim()}\n`
        }
    }
    return out.trim()
}

export default function XmlBeautifier() {
    const [input, setInput] = useState("")
    const [output, setOutput] = useState("")
    const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null)

    const validate = (): boolean => {
        const doc = new DOMParser().parseFromString(input, "application/xml")
        const err = doc.querySelector("parsererror")
        if (err) {
            setStatus({ ok: false, msg: `Invalid XML: ${err.textContent?.split("\n")[0] || "parse error"}` })
            return false
        }
        return true
    }

    return (
        <ToolPanel>
            <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={10}
                placeholder="Paste XML here, e.g. <root><item>value</item></root>"
                className={toolArea}
            />
            <div className="flex flex-wrap items-center gap-2">
                <button
                    className={toolBtn}
                    onClick={() => {
                        if (!validate()) return
                        setOutput(formatXml(input))
                        setStatus({ ok: true, msg: "Beautified" })
                    }}
                >
                    Beautify
                </button>
                <button
                    className={toolBtnGhost}
                    onClick={() => {
                        if (!validate()) return
                        setOutput(input.replace(/>\s+</g, "><").trim())
                        setStatus({ ok: true, msg: "Minified" })
                    }}
                >
                    Minify
                </button>
                <button
                    className={toolBtnGhost}
                    onClick={() => {
                        if (validate()) setStatus({ ok: true, msg: "Valid XML ✓" })
                    }}
                >
                    Validate
                </button>
                <CopyButton text={output} />
            </div>
            {status && (
                <p className={`text-sm ${status.ok ? "text-green-400" : "text-red-400"}`}>{status.msg}</p>
            )}
            {output && <textarea readOnly value={output} rows={10} className={toolArea} />}
        </ToolPanel>
    )
}
