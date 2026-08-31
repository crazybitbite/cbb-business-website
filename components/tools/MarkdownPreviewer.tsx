"use client"

import { useState } from "react"
import { ToolPanel, toolArea } from "./ui"

// Minimal, safe markdown → HTML. Input is escaped FIRST, then a small set of
// formatting rules is applied, so raw HTML in the input can never inject.
function renderMarkdown(md: string): string {
    let s = md.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

    // Fenced code blocks
    s = s.replace(/```([\s\S]*?)```/g, (_, c) => `<pre><code>${c.trim()}</code></pre>`)
    // Headings
    s = s.replace(/^###### (.*)$/gm, "<h6>$1</h6>")
        .replace(/^##### (.*)$/gm, "<h5>$1</h5>")
        .replace(/^#### (.*)$/gm, "<h4>$1</h4>")
        .replace(/^### (.*)$/gm, "<h3>$1</h3>")
        .replace(/^## (.*)$/gm, "<h2>$1</h2>")
        .replace(/^# (.*)$/gm, "<h1>$1</h1>")
    // Blockquotes
    s = s.replace(/^&gt; (.*)$/gm, "<blockquote>$1</blockquote>")
    // Inline: bold, italic, code, links
    s = s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.+?)\*/g, "<em>$1</em>")
        .replace(/`([^`]+?)`/g, "<code>$1</code>")
        .replace(/\[(.+?)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    // Unordered lists
    s = s.replace(/(?:^- .*(?:\n|$))+/gm, (block) => {
        const items = block.trim().split("\n").map((l) => `<li>${l.replace(/^- /, "")}</li>`).join("")
        return `<ul>${items}</ul>`
    })
    // Paragraphs from remaining lines
    return s.split(/\n{2,}/).map((chunk) =>
        /^\s*<(h\d|ul|pre|blockquote)/.test(chunk) ? chunk : `<p>${chunk.replace(/\n/g, "<br>")}</p>`
    ).join("\n")
}

export default function MarkdownPreviewer() {
    const [md, setMd] = useState("# Hello\n\nType **markdown** on the left and see it *rendered* here.\n\n- Lists work\n- `inline code` too\n\n> And blockquotes")

    return (
        <ToolPanel>
            <div className="grid gap-3 md:grid-cols-2">
                <textarea value={md} onChange={(e) => setMd(e.target.value)} rows={16} placeholder="Write markdown…" className={toolArea} />
                <div className="rounded-lg bg-black/40 border border-white/10 p-4 prose prose-invert prose-sm max-w-none overflow-y-auto" style={{ maxHeight: "26rem" }}
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(md) }} />
            </div>
            <p className="text-xs text-gray-500">Supports headings, bold, italic, inline &amp; fenced code, links, lists, and blockquotes. Input is escaped before rendering.</p>
        </ToolPanel>
    )
}
