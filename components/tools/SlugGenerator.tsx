"use client"

import { useState } from "react"
import { ToolPanel, CopyButton, toolInput } from "./ui"

export default function SlugGenerator() {
    const [text, setText] = useState("")
    const [sep, setSep] = useState("-")

    const slug = text
        .toLowerCase().trim()
        .normalize("NFKD").replace(/[̀-ͯ]/g, "")   // strip accents
        .replace(/&/g, " and ")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/[\s-]+/g, sep)
        .replace(new RegExp(`^${sep}+|${sep}+$`, "g"), "")

    return (
        <ToolPanel>
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Enter a title, e.g. My First Blog Post!" className={toolInput} />
            <div className="flex items-center gap-3 text-sm text-gray-300">
                Separator:
                <label className="flex items-center gap-1"><input type="radio" checked={sep === "-"} onChange={() => setSep("-")} className="accent-orange-600" /> hyphen</label>
                <label className="flex items-center gap-1"><input type="radio" checked={sep === "_"} onChange={() => setSep("_")} className="accent-orange-600" /> underscore</label>
            </div>
            {slug && (
                <div className="flex items-center gap-2">
                    <code className="flex-1 rounded bg-black/40 border border-white/10 px-3 py-2 text-sm text-green-400 font-mono break-all">{slug}</code>
                    <CopyButton text={slug} />
                </div>
            )}
        </ToolPanel>
    )
}
