"use client"

import { usePathname } from "next/navigation"
import { useSiteSettings } from "@/components/SiteSettingsProvider"
import { SideRail } from "@/components/SideRail"
import { normalizeSideContent } from "@/lib/sideContent"

/**
 * Wraps site pages with the site-wide side rails configured in admin Settings.
 * Dynamic pages resolve their own rails (page → category → settings) and set
 * suppressGlobalRails while mounted, so nothing renders twice. Admin routes
 * are always excluded.
 */
export function GlobalRailsWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const { settings, suppressGlobalRails } = useSiteSettings()

    const sideContent = normalizeSideContent(settings.sideContent)
    const hasLeft = sideContent.left.length > 0
    const hasRight = sideContent.right.length > 0

    if (pathname.startsWith("/controlpanel") || suppressGlobalRails || (!hasLeft && !hasRight)) {
        return <>{children}</>
    }

    return (
        // Rails sit in the outer side space; the page content in the middle keeps
        // its own standard `container mx-auto px-4` spacing (same as /contact).
        <div className="flex w-full">
            {hasLeft && (
                <aside className="hidden xl:block w-52 shrink-0 px-3 py-24">
                    <div className="sticky top-24">
                        <SideRail blocks={sideContent.left} />
                    </div>
                </aside>
            )}
            <div className="flex-1 min-w-0">
                {children}
                {/* On smaller screens the rails stack below the content */}
                {(hasLeft || hasRight) && (
                    <div className="xl:hidden container mx-auto px-4 pb-16 grid gap-6 sm:grid-cols-2">
                        <SideRail blocks={sideContent.left} />
                        <SideRail blocks={sideContent.right} />
                    </div>
                )}
            </div>
            {hasRight && (
                <aside className="hidden xl:block w-52 shrink-0 px-3 py-24">
                    <div className="sticky top-24">
                        <SideRail blocks={sideContent.right} />
                    </div>
                </aside>
            )}
        </div>
    )
}
