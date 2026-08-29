"use client"

import { useState } from "react"
import { ToolPanel, toolBtn, toolBtnGhost } from "./ui"

export default function PasswordGenerator() {
    const [length, setLength] = useState(16)
    const [sets, setSets] = useState({ lower: true, upper: true, digits: true, symbols: true })
    const [password, setPassword] = useState("")

    const generate = () => {
        const pools: string[] = []
        if (sets.lower) pools.push("abcdefghijkmnopqrstuvwxyz")
        if (sets.upper) pools.push("ABCDEFGHJKLMNPQRSTUVWXYZ")
        if (sets.digits) pools.push("23456789")
        if (sets.symbols) pools.push("!@#$%^&*()-_=+[]{}?")
        if (!pools.length) return
        const all = pools.join("")
        const rand = new Uint32Array(length)
        crypto.getRandomValues(rand)
        // Guarantee one char from each selected set, fill the rest randomly
        const chars = pools.map((p, i) => p[rand[i] % p.length])
        for (let i = pools.length; i < length; i++) chars.push(all[rand[i] % all.length])
        setPassword(chars.sort(() => 0.5 - (crypto.getRandomValues(new Uint8Array(1))[0] / 255)).join(""))
    }

    const strength = length >= 20 ? "Very strong" : length >= 14 ? "Strong" : length >= 10 ? "Okay" : "Weak"

    return (
        <ToolPanel>
            <div className="space-y-3">
                <label className="text-sm text-gray-300">Length: <span className="font-bold text-white">{length}</span> <span className="text-xs text-gray-500">({strength})</span></label>
                <input type="range" min={6} max={64} value={length} onChange={(e) => setLength(parseInt(e.target.value))} className="w-full accent-orange-600" />
                <div className="flex flex-wrap gap-4">
                    {([["lower", "a-z"], ["upper", "A-Z"], ["digits", "0-9"], ["symbols", "!@#$"]] as const).map(([key, label]) => (
                        <label key={key} className="flex items-center gap-2 text-sm text-white cursor-pointer">
                            <input type="checkbox" checked={sets[key]} onChange={(e) => setSets({ ...sets, [key]: e.target.checked })} className="accent-orange-600" />
                            {label}
                        </label>
                    ))}
                </div>
            </div>
            <div className="flex flex-wrap gap-2">
                <button className={toolBtn} onClick={generate}>Generate Password</button>
                <button className={toolBtnGhost} onClick={() => navigator.clipboard.writeText(password).catch(() => { })} disabled={!password}>Copy</button>
            </div>
            {password && (
                <p className="rounded-lg bg-black/40 border border-white/10 p-4 text-lg font-mono text-green-400 break-all text-center">{password}</p>
            )}
            <p className="text-xs text-gray-500">Generated locally with cryptographic randomness — never sent anywhere. Ambiguous characters (l, 1, O, 0) are excluded.</p>
        </ToolPanel>
    )
}
