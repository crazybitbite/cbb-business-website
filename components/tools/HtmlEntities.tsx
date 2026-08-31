"use client"

import { useState } from "react"
import { ToolPanel, CopyButton, toolBtn, toolBtnGhost, toolArea } from "./ui"

const NAMED: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }

function encode(s: string) {
    return s.replace(/[&<>"']/g, (c) => NAMED[c])
}
function decode(s: string) {
    const el = document.createElement("textarea")
    el.innerHTML = s
    return el.value
}

export default function HtmlEntities() {
    const [input, setInput] = useState("")
    const [output, setOutput] = useState("")

    return (
        <ToolPanel>
            <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={6} placeholder="Text or HTML…" className={toolArea} />
            <div className="flex flex-wrap gap-2">
                <button className={toolBtn} onClick={() => setOutput(encode(input))}>Encode entities</button>
                <button className={toolBtnGhost} onClick={() => setOutput(decode(input))}>Decode entities</button>
                <CopyButton text={output} />
            </div>
            {output && <textarea readOnly value={output} rows={6} className={toolArea} />}
        </ToolPanel>
    )
}
