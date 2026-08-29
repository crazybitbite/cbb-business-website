"use client"

import { useState } from "react"
import QRCode from "qrcode"
import { ToolPanel, toolBtn, toolBtnGhost, toolArea } from "./ui"

export default function QrGenerator() {
    const [text, setText] = useState("")
    const [size, setSize] = useState(300)
    const [dataUrl, setDataUrl] = useState("")
    const [error, setError] = useState("")

    const generate = async () => {
        setError("")
        try {
            setDataUrl(await QRCode.toDataURL(text, { width: size, margin: 2, errorCorrectionLevel: "M" }))
        } catch (e) {
            setError((e as Error).message)
        }
    }

    return (
        <ToolPanel>
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4}
                placeholder="URL or text to encode, e.g. https://crazybitbite.com" className={toolArea} />
            <div className="flex flex-wrap items-center gap-3">
                <label className="text-sm text-gray-300">Size: {size}px</label>
                <input type="range" min={128} max={1024} step={32} value={size} onChange={(e) => setSize(parseInt(e.target.value))} className="w-40 accent-orange-600" />
                <button className={toolBtn} onClick={generate} disabled={!text.trim()}>Generate QR</button>
                {dataUrl && (
                    <a href={dataUrl} download="qrcode.png" className={toolBtnGhost}>Download PNG</a>
                )}
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            {dataUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={dataUrl} alt="Generated QR code" className="rounded-xl bg-white p-2 w-64 h-64 object-contain" />
            )}
        </ToolPanel>
    )
}
