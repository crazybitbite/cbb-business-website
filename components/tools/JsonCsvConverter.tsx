"use client"

import { useState } from "react"
import { ToolPanel, CopyButton, toolBtn, toolBtnGhost, toolArea } from "./ui"

function jsonToCsv(json: string): string {
    const data = JSON.parse(json)
    const rows: Record<string, unknown>[] = Array.isArray(data) ? data : [data]
    if (!rows.length) return ""
    const cols = [...new Set(rows.flatMap((r) => Object.keys(r)))]
    const cell = (v: unknown) => {
        const s = v == null ? "" : typeof v === "object" ? JSON.stringify(v) : String(v)
        return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
    }
    return [cols.join(","), ...rows.map((r) => cols.map((c) => cell(r[c])).join(","))].join("\n")
}

function csvToJson(csv: string): string {
    const lines = csv.trim().split(/\r?\n/)
    if (lines.length < 2) throw new Error("Need a header row and at least one data row")
    const parseLine = (line: string): string[] => {
        const out: string[] = []
        let cur = ""
        let inQ = false
        for (let i = 0; i < line.length; i++) {
            const c = line[i]
            if (inQ) {
                if (c === '"' && line[i + 1] === '"') { cur += '"'; i++ }
                else if (c === '"') inQ = false
                else cur += c
            } else if (c === '"') inQ = true
            else if (c === ",") { out.push(cur); cur = "" }
            else cur += c
        }
        out.push(cur)
        return out
    }
    const headers = parseLine(lines[0])
    const rows = lines.slice(1).map((l) => {
        const vals = parseLine(l)
        return Object.fromEntries(headers.map((h, i) => [h, vals[i] ?? ""]))
    })
    return JSON.stringify(rows, null, 2)
}

export default function JsonCsvConverter() {
    const [input, setInput] = useState("")
    const [output, setOutput] = useState("")
    const [error, setError] = useState("")

    const run = (dir: "toCsv" | "toJson") => {
        setError("")
        try {
            setOutput(dir === "toCsv" ? jsonToCsv(input) : csvToJson(input))
        } catch (e) {
            setError((e as Error).message)
        }
    }

    return (
        <ToolPanel>
            <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={9}
                placeholder='JSON array [{"name":"A","age":1}] or CSV with a header row' className={toolArea} />
            <div className="flex flex-wrap gap-2">
                <button className={toolBtn} onClick={() => run("toCsv")}>JSON → CSV</button>
                <button className={toolBtnGhost} onClick={() => run("toJson")}>CSV → JSON</button>
                <CopyButton text={output} />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            {output && <textarea readOnly value={output} rows={9} className={toolArea} />}
        </ToolPanel>
    )
}
