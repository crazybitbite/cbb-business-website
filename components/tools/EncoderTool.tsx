"use client"

import { useState } from "react"
import { ToolPanel, CopyButton, toolBtn, toolBtnGhost, toolArea } from "./ui"

export default function EncoderTool({ mode }: { mode: "base64" | "url" }) {
    const [input, setInput] = useState("")
    const [output, setOutput] = useState("")
    const [error, setError] = useState("")

    const run = (dir: "encode" | "decode") => {
        setError("")
        try {
            if (mode === "base64") {
                setOutput(dir === "encode"
                    ? btoa(String.fromCharCode(...new TextEncoder().encode(input)))
                    : new TextDecoder().decode(Uint8Array.from(atob(input.trim()), (c) => c.charCodeAt(0))))
            } else {
                setOutput(dir === "encode" ? encodeURIComponent(input) : decodeURIComponent(input.trim()))
            }
        } catch (e) {
            setError(`Could not ${dir}: ${(e as Error).message}`)
        }
    }

    return (
        <ToolPanel>
            <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={7}
                placeholder={mode === "base64" ? "Text to encode, or Base64 to decode..." : "Text or URL component..."}
                className={toolArea} />
            <div className="flex flex-wrap gap-2">
                <button className={toolBtn} onClick={() => run("encode")}>Encode</button>
                <button className={toolBtnGhost} onClick={() => run("decode")}>Decode</button>
                <button className={toolBtnGhost} onClick={() => { setInput(output); setOutput("") }} disabled={!output}>↑ Use output as input</button>
                <CopyButton text={output} />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            {output && <textarea readOnly value={output} rows={7} className={toolArea} />}
        </ToolPanel>
    )
}
