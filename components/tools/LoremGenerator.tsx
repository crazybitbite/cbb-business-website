"use client"

import { useState } from "react"
import { ToolPanel, CopyButton, toolBtn, toolArea } from "./ui"

const WORDS = "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum".split(" ")

function sentence(rng: () => number): string {
    const len = 8 + Math.floor(rng() * 10)
    const words = Array.from({ length: len }, () => WORDS[Math.floor(rng() * WORDS.length)])
    const s = words.join(" ")
    return s[0].toUpperCase() + s.slice(1) + "."
}

export default function LoremGenerator() {
    const [paragraphs, setParagraphs] = useState(3)
    const [output, setOutput] = useState("")

    const generate = () => {
        const rng = Math.random
        const paras = Array.from({ length: Math.min(Math.max(paragraphs, 1), 20) }, () =>
            Array.from({ length: 4 + Math.floor(rng() * 3) }, () => sentence(rng)).join(" ")
        )
        setOutput(paras.join("\n\n"))
    }

    return (
        <ToolPanel>
            <div className="flex flex-wrap items-center gap-2">
                <label className="text-sm text-gray-300">Paragraphs</label>
                <input type="number" min={1} max={20} value={paragraphs} onChange={(e) => setParagraphs(parseInt(e.target.value) || 1)}
                    className="w-20 rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white font-mono focus:border-orange-500 focus:outline-none" />
                <button className={toolBtn} onClick={generate}>Generate</button>
                <CopyButton text={output} />
            </div>
            {output && <textarea readOnly value={output} rows={14} className={toolArea} />}
        </ToolPanel>
    )
}
