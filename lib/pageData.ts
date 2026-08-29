import { prisma } from "@/lib/prisma"
import { hasSideContent, normalizeSideContent } from "@/lib/sideContent"

/**
 * Resolve a stored category value ("cat-3", "sub-12", legacy plain id or text)
 * into a breadcrumb of names plus the root category id.
 */
export async function resolveCategoryInfo(categoryValue: string | null): Promise<{ crumbs: string[]; rootCategoryId: number | null }> {
    if (!categoryValue) return { crumbs: [], rootCategoryId: null }

    // Legacy plain numbers (e.g. "2") are CATEGORY ids; "sub-N" are sub-category ids
    const catMatch = categoryValue.match(/^cat-(\d+)$/) || categoryValue.match(/^(\d+)$/)
    const subMatch = categoryValue.match(/^sub-(\d+)$/)

    try {
        if (catMatch) {
            const category = await prisma.category.findUnique({ where: { id: parseInt(catMatch[1]) } })
            return category
                ? { crumbs: [category.name], rootCategoryId: category.id }
                : { crumbs: [], rootCategoryId: null }
        }

        if (subMatch) {
            const crumbs: string[] = []
            let current = await prisma.subCategory.findUnique({ where: { id: parseInt(subMatch[1]) } })
            if (!current) return { crumbs: [], rootCategoryId: null }

            const categoryId = current.categoryId
            for (let depth = 0; current && depth < 10; depth++) {
                crumbs.unshift(current.name)
                current = current.parentSubCategoryId
                    ? await prisma.subCategory.findUnique({ where: { id: current.parentSubCategoryId } })
                    : null
            }

            const category = await prisma.category.findUnique({ where: { id: categoryId } })
            if (category) crumbs.unshift(category.name)
            return { crumbs, rootCategoryId: categoryId }
        }

        return { crumbs: [categoryValue], rootCategoryId: null }
    } catch (error) {
        console.error("Error resolving category info:", error)
        return { crumbs: [], rootCategoryId: null }
    }
}

export interface CrumbItem { name: string; href: string | null }

// Root categories that have a public listing route their breadcrumb can link to.
const ROOT_ROUTES: Record<string, string> = {
    "digital products": "/digital-products",
    "blog": "/blog",
}

/**
 * Build clickable breadcrumb items. When the page's slug mirrors the category
 * hierarchy (digital-products/tools/courses pages), every ancestor links to its
 * listing URL derived from the slug segments. Otherwise only the root category
 * links, to its known listing route.
 */
export function buildCrumbItems(crumbs: string[], slug: string): CrumbItem[] {
    if (!crumbs.length) return []
    const segments = slug.split("/").filter(Boolean)

    if (segments.length - 1 === crumbs.length) {
        return crumbs.map((name, i) => ({ name, href: "/" + segments.slice(0, i + 1).join("/") }))
    }

    const base = ROOT_ROUTES[crumbs[0]?.toLowerCase()] || null
    return crumbs.map((name, i) => ({ name, href: i === 0 ? base : null }))
}

export interface CourseLesson { id: number; name: string; slug: string }
export interface CourseLevel { name: string; lessons: CourseLesson[] }
export interface CourseOutline {
    courseName: string
    levels: CourseLevel[]
    prev: CourseLesson | null
    next: CourseLesson | null
    currentId: number
    /** 1-based position of the current lesson within its level */
    lessonNumberInLevel: number
    currentLevel: string
}

/**
 * If the page is a lesson under Digital Products → Courses → <Course> → <Level>,
 * return the full ordered course outline plus prev/next. Otherwise null.
 */
export async function getCourseOutline(categoryValue: string | null, pageId: number): Promise<CourseOutline | null> {
    const m = categoryValue?.match(/^sub-(\d+)$/)
    if (!m) return null

    try {
        const level = await prisma.subCategory.findUnique({ where: { id: parseInt(m[1]) } })
        if (!level?.parentSubCategoryId) return null
        const course = await prisma.subCategory.findUnique({ where: { id: level.parentSubCategoryId } })
        if (!course?.parentSubCategoryId) return null
        const grandparent = await prisma.subCategory.findUnique({ where: { id: course.parentSubCategoryId } })
        if (!grandparent || grandparent.name.toLowerCase() !== "courses") return null

        // All levels under this course, in defined order
        const levelSubs = await prisma.subCategory.findMany({
            where: { parentSubCategoryId: course.id },
            orderBy: { order: "asc" },
        })

        const levels: CourseLevel[] = []
        for (const lv of levelSubs) {
            const lessons = await prisma.page.findMany({
                where: { category: `sub-${lv.id}`, isPublished: true },
                orderBy: [{ showcaseOrder: { sort: "asc", nulls: "last" } }, { name: "asc" }],
                select: { id: true, name: true, slug: true },
            })
            levels.push({ name: lv.name, lessons })
        }

        // Flat ordered list for prev/next
        const flat = levels.flatMap((l) => l.lessons)
        const idx = flat.findIndex((l) => l.id === pageId)
        const currentLevel = levels.find((l) => l.lessons.some((x) => x.id === pageId))
        const lessonNumberInLevel = currentLevel ? currentLevel.lessons.findIndex((x) => x.id === pageId) + 1 : 0

        return {
            courseName: course.name,
            levels,
            prev: idx > 0 ? flat[idx - 1] : null,
            next: idx >= 0 && idx < flat.length - 1 ? flat[idx + 1] : null,
            currentId: pageId,
            lessonNumberInLevel,
            currentLevel: currentLevel?.name || "",
        }
    } catch (error) {
        console.error("Error building course outline:", error)
        return null
    }
}

import { slugify } from "@/lib/slugify"

async function getCoursesRootSub() {
    const dp = await prisma.category.findFirst({ where: { name: { equals: "Digital Products", mode: "insensitive" } } })
    if (!dp) return null
    return prisma.subCategory.findFirst({
        where: { categoryId: dp.id, parentSubCategoryId: null, name: { equals: "Courses", mode: "insensitive" } },
    })
}

export interface CourseCard {
    name: string
    slug: string          // digital-products/courses/<course-slug>
    description: string
    image: string | null
    totalLessons: number
    levels: { name: string; count: number }[]
}

/** One card per course for the /digital-products/courses index. */
export async function getCoursesIndex(): Promise<CourseCard[]> {
    const root = await getCoursesRootSub()
    if (!root) return []

    const courseSubs = await prisma.subCategory.findMany({
        where: { parentSubCategoryId: root.id },
        orderBy: { order: "asc" },
    })

    const cards: CourseCard[] = []
    for (const course of courseSubs) {
        const levelSubs = await prisma.subCategory.findMany({
            where: { parentSubCategoryId: course.id },
            orderBy: { order: "asc" },
        })
        const levels: { name: string; count: number }[] = []
        let total = 0
        let image: string | null = null
        for (const lv of levelSubs) {
            const lessons = await prisma.page.findMany({
                where: { category: `sub-${lv.id}`, isPublished: true },
                orderBy: [{ showcaseOrder: { sort: "asc", nulls: "last" } }, { name: "asc" }],
                select: { featuredImages: true },
            })
            levels.push({ name: lv.name, count: lessons.length })
            total += lessons.length
            if (!image && lessons[0]?.featuredImages?.[0]) image = lessons[0].featuredImages[0]
        }
        cards.push({
            name: course.name,
            slug: `digital-products/courses/${slugify(course.name)}`,
            description: course.description,
            image,
            totalLessons: total,
            levels,
        })
    }
    return cards
}

export interface CourseOverviewData {
    name: string
    description: string
    image: string | null
    firstLessonSlug: string | null
    levels: { name: string; description: string; lessons: CourseLesson[] }[]
    outline: CourseOutline   // for the sidebar (currentId = 0)
}

/** Full overview for one course, matched by its slugified name. */
export async function getCourseOverview(courseSlugSegment: string): Promise<CourseOverviewData | null> {
    const root = await getCoursesRootSub()
    if (!root) return null

    const courseSubs = await prisma.subCategory.findMany({ where: { parentSubCategoryId: root.id } })
    const course = courseSubs.find((c) => slugify(c.name) === courseSlugSegment)
    if (!course) return null

    const levelSubs = await prisma.subCategory.findMany({
        where: { parentSubCategoryId: course.id },
        orderBy: { order: "asc" },
    })

    const levels: { name: string; description: string; lessons: CourseLesson[] }[] = []
    let image: string | null = null
    for (const lv of levelSubs) {
        const lessons = await prisma.page.findMany({
            where: { category: `sub-${lv.id}`, isPublished: true },
            orderBy: [{ showcaseOrder: { sort: "asc", nulls: "last" } }, { name: "asc" }],
            select: { id: true, name: true, slug: true, featuredImages: true },
        })
        if (!image && lessons[0]?.featuredImages?.[0]) image = lessons[0].featuredImages[0]
        levels.push({
            name: lv.name,
            description: lv.description,
            lessons: lessons.map(({ id, name, slug }) => ({ id, name, slug })),
        })
    }

    const firstLessonSlug = levels[0]?.lessons[0]?.slug || null

    return {
        name: course.name,
        description: course.description,
        image,
        firstLessonSlug,
        levels,
        outline: {
            courseName: course.name,
            levels: levels.map((l) => ({ name: l.name, lessons: l.lessons })),
            prev: null,
            next: null,
            currentId: 0,
            lessonNumberInLevel: 0,
            currentLevel: levels[0]?.name || "",
        },
    }
}

/** Site-wide SEO defaults from Settings, used when a page has no SEO of its own. */
export async function getDefaultSeo() {
    try {
        const rows = await prisma.settings.findMany({
            where: { key: { in: ["defaultSeoTitle", "defaultSeoDescription", "defaultSeoKeywords"] } },
        })
        const map = rows.reduce((acc, r) => {
            acc[r.key] = typeof r.value === "string" ? r.value : ""
            return acc
        }, {} as Record<string, string>)
        return {
            title: map.defaultSeoTitle || null,
            description: map.defaultSeoDescription || null,
            keywords: map.defaultSeoKeywords || null,
        }
    } catch {
        return { title: null, description: null, keywords: null }
    }
}

/**
 * Load a published page by slug with its breadcrumb and resolved side content
 * (page → category → site-wide settings). Direct DB access — pages must NOT
 * fetch their own HTTP API during SSR (self-fetches are flaky and caused
 * intermittent 404s on client navigation).
 */
export async function getPublishedPageBySlug(slugPath: string) {
    const page = await prisma.page.findUnique({ where: { slug: slugPath } })
    if (!page || !page.isPublished) return null

    const { crumbs: categoryBreadcrumb, rootCategoryId } = await resolveCategoryInfo(page.category)
    const rootCategoryName = categoryBreadcrumb[0] || null

    // Side content precedence: page → category → site-wide settings
    let sideContent = normalizeSideContent(page.sideContent)
    if (!hasSideContent(sideContent)) {
        if (rootCategoryId) {
            const category = await prisma.category.findUnique({ where: { id: rootCategoryId } })
            sideContent = normalizeSideContent(category?.sideContent)
        }
        if (!hasSideContent(sideContent)) {
            const globalRow = await prisma.settings.findUnique({ where: { key: "sideContent" } })
            sideContent = normalizeSideContent(globalRow?.value)
        }
    }

    const categoryBreadcrumbItems = buildCrumbItems(categoryBreadcrumb, page.slug)
    const courseOutline = await getCourseOutline(page.category, page.id)

    // JSON-safe shape (BigInt createdAt/updatedAt stripped)
    const { createdAt, updatedAt, ...rest } = page
    return { ...rest, categoryBreadcrumb, categoryBreadcrumbItems, rootCategoryName, sideContent, courseOutline }
}
