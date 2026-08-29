"use client"

import { useState, useRef, useEffect } from "react"
import { io, type Socket } from "socket.io-client"
import { ToolPanel, toolBtn, toolBtnGhost, toolInput } from "./ui"

interface LogEntry { dir: "in" | "out" | "sys"; text: string; at: string }

export default function SocketIoTester() {
    const [url, setUrl] = useState("")
    const [eventName, setEventName] = useState("message")
    const [payload, setPayload] = useState("")
    const [connected, setConnected] = useState(false)
    const [log, setLog] = useState<LogEntry[]>([])
    const socketRef = useRef<Socket | null>(null)

    const addLog = (dir: LogEntry["dir"], text: string) =>
        setLog((prev) => [...prev.slice(-199), { dir, text, at: new Date().toLocaleTimeString() }])

    const connect = () => {
        try {
            const socket = io(url, { transports: ["websocket", "polling"], reconnectionAttempts: 2 })
            socketRef.current = socket
            addLog("sys", `Connecting to ${url}...`)
            socket.on("connect", () => { setConnected(true); addLog("sys", `Connected ✓ (id ${socket.id})`) })
            socket.on("connect_error", (e) => addLog("sys", `Connect error: ${e.message}`))
            socket.on("disconnect", (reason) => { setConnected(false); addLog("sys", `Disconnected (${reason})`) })
            socket.onAny((event, ...args) => addLog("in", `${event}: ${args.map((a) => JSON.stringify(a)).join(", ")}`))
        } catch (e) {
            addLog("sys", `Failed: ${(e as Error).message}`)
        }
    }

    const disconnect = () => socketRef.current?.disconnect()

    const emit = () => {
        if (!eventName || !socketRef.current?.connected) return
        let data: unknown = payload
        try { data = JSON.parse(payload) } catch { /* send as raw string */ }
        socketRef.current.emit(eventName, data)
        addLog("out", `${eventName}: ${payload || "(empty)"}`)
    }

    useEffect(() => () => { socketRef.current?.disconnect() }, [])

    return (
        <ToolPanel>
            <div className="flex flex-wrap gap-2">
                <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://your-socketio-server.com" className={`${toolInput} flex-1 min-w-[240px]`} disabled={connected} />
                {connected
                    ? <button className={toolBtnGhost} onClick={disconnect}>Disconnect</button>
                    : <button className={toolBtn} onClick={connect} disabled={!url}>Connect</button>}
            </div>
            <div className="flex flex-wrap gap-2">
                <input value={eventName} onChange={(e) => setEventName(e.target.value)} placeholder="Event name" className={`${toolInput} w-40`} />
                <input value={payload} onChange={(e) => setPayload(e.target.value)} onKeyDown={(e) => e.key === "Enter" && emit()} placeholder='Payload (JSON or plain text)' className={`${toolInput} flex-1 min-w-[200px]`} />
                <button className={toolBtn} onClick={emit} disabled={!connected}>Emit</button>
            </div>
            <div className="rounded-lg bg-black/40 border border-white/10 p-3 h-72 overflow-y-auto font-mono text-xs space-y-1">
                {log.length === 0 && <p className="text-gray-600">All incoming events are logged here (listening with onAny)...</p>}
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
