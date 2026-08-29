"use client"

import { useState } from "react"
import { ToolPanel, toolBtn, toolBtnGhost, toolArea } from "./ui"

export default function UuidGenerator() {
    const [count, setCount] = useState(5)
    const [uuids, setUuids] = useState<string[]>([])

    const generate = () =>
        setUuids(Array.from({ length: Math.min(Math.max(count, 1), 100) }, () => crypto.randomUUID()))

    return (
        <ToolPanel>
            <div className="flex flex-wrap items-center gap-2">
                <label className="text-sm text-gray-300">How many?</label>
                <input type="number" min={1} max={100} value={count} onChange={(e) => setCount(parseInt(e.target.value) || 1)}
                    className="w-24 rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white font-mono focus:border-orange-500 focus:outline-none" />
                <button className={toolBtn} onClick={generate}>Generate UUIDs</button>
                <button className={toolBtnGhost} onClick={() => navigator.clipboard.writeText(uuids.join("\n")).catch(() => { })} disabled={!uuids.length}>Copy all</button>
            </div>
            {uuids.length > 0 && <textarea readOnly value={uuids.join("\n")} rows={Math.min(uuids.length + 1, 15)} className={toolArea} />}
            <p className="text-xs text-gray-500">Version 4 UUIDs generated with the browser&apos;s cryptographic randomness.</p>
        </ToolPanel>
    )
}
