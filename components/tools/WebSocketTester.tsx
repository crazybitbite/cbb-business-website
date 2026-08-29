"use client"

import { useState, useRef, useEffect } from "react"
import { ToolPanel, toolBtn, toolBtnGhost, toolInput, toolArea } from "./ui"

interface LogEntry { dir: "in" | "out" | "sys"; text: string; at: string }

export default function WebSocketTester() {
    const [url, setUrl] = useState("wss://echo.websocket.org")
    const [message, setMessage] = useState("")
    const [connected, setConnected] = useState(false)
    const [log, setLog] = useState<LogEntry[]>([])
    const wsRef = useRef<WebSocket | null>(null)

    const addLog = (dir: LogEntry["dir"], text: string) =>
        setLog((prev) => [...prev.slice(-199), { dir, text, at: new Date().toLocaleTimeString() }])

    const connect = () => {
        try {
            const ws = new WebSocket(url)
            wsRef.current = ws
            addLog("sys", `Connecting to ${url}...`)
            ws.onopen = () => { setConnected(true); addLog("sys", "Connected ✓") }
            ws.onmessage = (e) => addLog("in", typeof e.data === "string" ? e.data : "[binary data]")
            ws.onerror = () => addLog("sys", "Connection error")
            ws.onclose = (e) => { setConnected(false); addLog("sys", `Closed (code ${e.code})`) }
        } catch (e) {
            addLog("sys", `Failed: ${(e as Error).message}`)
        }
    }

    const disconnect = () => wsRef.current?.close()

    const send = () => {
        if (!message || wsRef.current?.readyState !== WebSocket.OPEN) return
        wsRef.current.send(message)
        addLog("out", message)
        setMessage("")
    }

    useEffect(() => () => wsRef.current?.close(), [])

    return (
        <ToolPanel>
            <div className="flex flex-wrap gap-2">
                <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="wss://..." className={`${toolInput} flex-1 min-w-[240px]`} disabled={connected} />
                {connected
                    ? <button className={toolBtnGhost} onClick={disconnect}>Disconnect</button>
                    : <button className={toolBtn} onClick={connect}>Connect</button>}
            </div>
            <div className="flex gap-2">
                <input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && send()}
                    placeholder="Message to send"
                    className={`${toolInput} flex-1`}
                    disabled={!connected}
                />
                <button className={toolBtn} onClick={send} disabled={!connected}>Send</button>
            </div>
            <div className="rounded-lg bg-black/40 border border-white/10 p-3 h-72 overflow-y-auto font-mono text-xs space-y-1">
                {log.length === 0 && <p className="text-gray-600">Connection log appears here...</p>}
                {log.map((l, i) => (
                    <p key={i} className={l.dir === "in" ? "text-green-400" : l.dir === "out" ? "text-sky-400" : "text-gray-500"}>
                        <span className="text-gray-600">{l.at}</span> {l.dir === "in" ? "←" : l.dir === "out" ? "→" : "•"} {l.text}
                    </p>
                ))}
            </div>
            <button className={toolBtnGhost} onClick={() => setLog([])}>Clear log</button>
        </ToolPanel>
    )
}
