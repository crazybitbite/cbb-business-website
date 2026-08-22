"use client"

import Link from "next/link"
import type { SideBlock } from "@/lib/sideContent"

/**
 * Renders a stack of configured side blocks (ads, menus, custom HTML)
 * in a page's left or right rail.
 */
export function SideRail({ blocks }: { blocks: SideBlock[] }) {
    if (!blocks?.length) return null

    return (
        <div className="space-y-6">
            {blocks.map((block, idx) => {
                if (block.type === "ad" && block.image) {
                    const img = (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={block.image}
                            alt={block.alt || "Advertisement"}
                            className="w-full rounded-xl border border-white/10 object-cover"
                        />
                    )
                    return (
                        <div key={idx}>
                            {block.link ? (
                                <a href={block.link} target="_blank" rel="noopener noreferrer" className="block hover:opacity-90 transition-opacity">
                                    {img}
                                </a>
                            ) : img}
                        </div>
                    )
                }

                if (block.type === "menu" && block.items?.length) {
                    return (
                        <nav key={idx} className="rounded-xl border border-white/10 bg-white/5 p-4">
                            {block.title && (
                                <h4 className="text-sm font-semibold text-white mb-3">{block.title}</h4>
                            )}
                            <ul className="space-y-2">
                                {block.items.map((item, i) => (
                                    <li key={i}>
                                        <Link
                                            href={item.url || "#"}
                                            className="text-sm text-gray-400 hover:text-orange-400 transition-colors"
                                        >
                                            {item.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    )
                }

                if (block.type === "html" && block.html) {
                    return (
                        <div
                            key={idx}
                            className="rounded-xl border border-white/10 bg-white/5 p-4 prose prose-invert prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: block.html }}
                        />
                    )
                }

                return null
            })}
        </div>
    )
}
