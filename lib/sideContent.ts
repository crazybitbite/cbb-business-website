// Shared types for the configurable left/right side rails on dynamic pages.
// Stored as JSON on Page.sideContent (page-level, wins) and Category.sideContent
// (applies to every page under that category when the page defines none).

export interface AdBlock {
    type: "ad"
    image: string // URL or base64 data URI
    link?: string
    alt?: string
}

export interface MenuBlock {
    type: "menu"
    title?: string
    items: { label: string; url: string }[]
}

export interface HtmlBlock {
    type: "html"
    html: string
}

export type SideBlock = AdBlock | MenuBlock | HtmlBlock

export interface SideContent {
    left: SideBlock[]
    right: SideBlock[]
}

export const EMPTY_SIDE_CONTENT: SideContent = { left: [], right: [] }

export function normalizeSideContent(value: unknown): SideContent {
    const v = value as Partial<SideContent> | null | undefined
    return {
        left: Array.isArray(v?.left) ? (v!.left as SideBlock[]) : [],
        right: Array.isArray(v?.right) ? (v!.right as SideBlock[]) : [],
    }
}

/** "Defined" means at least one block on either side — used for page-vs-category precedence */
export function hasSideContent(value: unknown): boolean {
    const sc = normalizeSideContent(value)
    return sc.left.length > 0 || sc.right.length > 0
}
