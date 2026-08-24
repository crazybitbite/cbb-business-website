import { prisma } from "@/lib/prisma"

export interface NavLink {
    name: string
    href: string
    submenu?: NavLink[]
}

const MATCHERS: Record<"header" | "footer", (nav: any) => boolean> = {
    header: (n) =>
        n.slug === "header" ||
        n.slug === "top-menu" ||
        n.name?.toLowerCase() === "header" ||
        n.name?.toLowerCase() === "top menu",
    footer: (n) =>
        n.slug === "footer" ||
        n.slug === "footer-menu" ||
        n.name?.toLowerCase() === "footer",
}

function filterEnabled(items: any[]): NavLink[] {
    return (items || [])
        .filter((i) => i.isEnabled)
        .map((i) => ({
            name: i.title,
            href: i.path,
            submenu: i.children?.length ? filterEnabled(i.children) : undefined,
        }))
}

/**
 * Server-side navigation lookup, so menus render complete on first paint
 * instead of popping in after a client-side fetch.
 */
export async function getNavigation(kind: "header" | "footer"): Promise<NavLink[] | null> {
    try {
        const setting = await prisma.settings.findUnique({ where: { key: "navigation" } })
        if (!setting?.value) return null

        const navigations = JSON.parse(setting.value as string)
        if (!Array.isArray(navigations)) return null

        const nav = navigations.find(MATCHERS[kind])
        if (!nav?.items) return null

        const links = filterEnabled(nav.items)
        return links.length ? links : null
    } catch (error) {
        console.error(`Failed to load ${kind} navigation:`, error)
        return null
    }
}
