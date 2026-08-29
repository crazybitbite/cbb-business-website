"use client"

import { useState } from "react"
import { ToolPanel, CopyButton, toolBtn, toolBtnGhost, toolArea } from "./ui"

const VOID_TAGS = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"])

function formatHtml(html: string, indent = "  "): string {
    const compact = html.replace(/>\s+</g, "><").trim()
    const tokens = compact.split(/(?=<)|(?<=>)/g).filter((t) => t.trim())
    let depth = 0
    let out = ""
    for (const token of tokens) {
        const t = token.trim()
        const closing = /^<\//.test(t)
        const tagName = /^<\/?([a-zA-Z0-9-]+)/.exec(t)?.[1]?.toLowerCase()
        const selfClosing = /\/>$/.test(t) || (tagName ? VOID_TAGS.has(tagName) : false)
        const opening = /^<[a-zA-Z]/.test(t) && !closing && !selfClosing
        const comment = /^<!/.test(t)

        if (closing) depth = Math.max(0, depth - 1)
        out += `${indent.repeat(depth)}${t}\n`
        if (opening && !comment) depth++
    }
    return out.trim()
}

export default function HtmlBeautifier() {
    const [input, setInput] = useState("")
    const [output, setOutput] = useState("")

    return (
        <ToolPanel>
            <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={10}
                placeholder="<div><p>Paste HTML here</p></div>" className={toolArea} />
            <div className="flex flex-wrap gap-2">
                <button className={toolBtn} onClick={() => setOutput(formatHtml(input))}>Beautify</button>
                <button className={toolBtnGhost} onClick={() => setOutput(input.replace(/>\s+</g, "><").replace(/\s+/g, " ").trim())}>Minify</button>
                <CopyButton text={output} />
            </div>
            {output && <textarea readOnly value={output} rows={12} className={toolArea} />}
        </ToolPanel>
    )
}
