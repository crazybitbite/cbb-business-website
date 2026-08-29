"use client"

import { useState, useRef } from "react"
import { ToolPanel, toolBtn, toolBtnGhost, toolInput } from "./ui"

export default function ImageResizer() {
    const [src, setSrc] = useState<string | null>(null)
    const [fileName, setFileName] = useState("image")
    const [original, setOriginal] = useState<{ w: number; h: number } | null>(null)
    const [width, setWidth] = useState(800)
    const [height, setHeight] = useState(600)
    const [keepRatio, setKeepRatio] = useState(true)
    const [format, setFormat] = useState<"image/jpeg" | "image/png" | "image/webp">("image/jpeg")
    const [quality, setQuality] = useState(85)
    const imgRef = useRef<HTMLImageElement | null>(null)

    const onFile = (file: File | undefined) => {
        if (!file) return
        setFileName(file.name.replace(/\.[^.]+$/, ""))
        const reader = new FileReader()
        reader.onload = (e) => {
            const url = e.target?.result as string
            const img = new Image()
            img.onload = () => {
                imgRef.current = img
                setOriginal({ w: img.width, h: img.height })
                setWidth(img.width)
                setHeight(img.height)
                setSrc(url)
            }
            img.src = url
        }
        reader.readAsDataURL(file)
    }

    const setW = (w: number) => {
        setWidth(w)
        if (keepRatio && original) setHeight(Math.round((w / original.w) * original.h))
    }
    const setH = (h: number) => {
        setHeight(h)
        if (keepRatio && original) setWidth(Math.round((h / original.h) * original.w))
    }

    const download = () => {
        const img = imgRef.current
        if (!img || !width || !height) return
        const canvas = document.createElement("canvas")
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext("2d")!
        ctx.imageSmoothingQuality = "high"
        ctx.drawImage(img, 0, 0, width, height)
        const link = document.createElement("a")
        link.download = `${fileName}-${width}x${height}.${format.split("/")[1]}`
        link.href = canvas.toDataURL(format, quality / 100)
        link.click()
    }

    return (
        <ToolPanel>
            <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:bg-white/5 transition-colors">
                <p className="text-sm text-gray-400">{src ? "Click to choose a different image" : "Click to choose an image"}</p>
                {original && <p className="text-xs text-gray-500 mt-1">Original: {original.w} × {original.h}px</p>}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
            </label>

            {src && (
                <>
                    <div className="flex flex-wrap items-end gap-3">
                        <div>
                            <label className="text-xs text-gray-400">Width</label>
                            <input type="number" min={1} value={width} onChange={(e) => setW(parseInt(e.target.value) || 1)} className={`${toolInput} w-28`} />
                        </div>
                        <div>
                            <label className="text-xs text-gray-400">Height</label>
                            <input type="number" min={1} value={height} onChange={(e) => setH(parseInt(e.target.value) || 1)} className={`${toolInput} w-28`} />
                        </div>
                        <label className="flex items-center gap-2 text-sm text-gray-300 pb-2 cursor-pointer">
                            <input type="checkbox" checked={keepRatio} onChange={(e) => setKeepRatio(e.target.checked)} className="accent-orange-600" />
                            Keep ratio
                        </label>
                        <div>
                            <label className="text-xs text-gray-400">Format</label>
                            <select value={format} onChange={(e) => setFormat(e.target.value as any)} className="block rounded-lg bg-white/5 border border-white/10 px-2 py-2 text-sm text-white [&>option]:bg-gray-900">
                                <option value="image/jpeg">JPEG</option>
                                <option value="image/png">PNG</option>
                                <option value="image/webp">WebP</option>
                            </select>
                        </div>
                        {format !== "image/png" && (
                            <div>
                                <label className="text-xs text-gray-400">Quality: {quality}%</label>
                                <input type="range" min={10} max={100} value={quality} onChange={(e) => setQuality(parseInt(e.target.value))} className="block w-32 accent-orange-600" />
                            </div>
                        )}
                        <button className={toolBtn} onClick={download}>Resize &amp; Download</button>
                        {original && (
                            <button className={toolBtnGhost} onClick={() => { setW(Math.round(original.w / 2)) }}>50%</button>
                        )}
                    </div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="Preview" className="max-h-72 rounded-lg border border-white/10 object-contain" />
                    <p className="text-xs text-gray-500">Everything happens in your browser — the image is never uploaded to a server.</p>
                </>
            )}
        </ToolPanel>
    )
}
