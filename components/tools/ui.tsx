"use client"

// Tiny shared UI atoms for tool components.

export const toolBtn = "rounded-lg bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 text-sm font-bold transition-colors disabled:opacity-50"
export const toolBtnGhost = "rounded-lg bg-white/10 hover:bg-white/20 text-white px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
export const toolInput = "w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:border-orange-500 focus:outline-none font-mono"
export const toolArea = "w-full rounded-lg bg-white/5 border border-white/10 p-3 text-sm text-white focus:border-orange-500 focus:outline-none font-mono resize-y"

export function ToolPanel({ children }: { children: React.ReactNode }) {
    return <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4">{children}</div>
}

export function CopyButton({ text }: { text: string }) {
    return (
        <button
            className={toolBtnGhost}
            onClick={() => navigator.clipboard.writeText(text).catch(() => { })}
            disabled={!text}
        >
            Copy
        </button>
    )
}
