/**
 * Adds a Text sub-category and 12 new tool pages, with topical featured images
 * (verified live, keyword-photo fallback). Idempotent.
 *
 * Run: node --env-file=.env.local scripts/seed-tools-3.mjs
 */
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()
const slugify = (t) => t.toLowerCase().trim().replace(/&/g, "and").replace(/[^\w\s-]/g, "").replace(/\s+/g, "-")

const IMG = {
    "gradient-generator": { id: "1550859492-d5da9d8e45f3", kw: "gradient,color" },
    "box-shadow-generator": { id: "1618005182384-a83a8bd57fbe", kw: "design,abstract" },
    "number-base-converter": { id: "1518432031352-d6fc5c10da5a", kw: "numbers,binary" },
    "unit-converter": { id: "1509228468518-180dd4864904", kw: "measure,ruler" },
    "case-converter": { id: "1455390582262-044cdead277a", kw: "typography,text" },
    "jwt-decoder": { id: "1614064641938-3bbee52942c7", kw: "security,token" },
    "html-entities": { id: "1547658719-da2b51169166", kw: "html,code" },
    "word-counter": { id: "1457369804613-52c61a468e7d", kw: "writing,document" },
    "text-diff": { id: "1522542550221-31fd19575a2d", kw: "compare,code" },
    "markdown-previewer": { id: "1517842645767-c639042777db", kw: "markdown,writing" },
    "slug-generator": { id: "1481487196290-c152efe083f5", kw: "url,web" },
    "cron-parser": { id: "1495364141860-b0d03eccd065", kw: "schedule,clock" },
}
const unsplash = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&h=450&q=80`
const fallback = (kw, lock) => `https://loremflickr.com/800/450/${kw.split(",")[0]}?lock=${lock}`
async function alive(url) { try { return (await fetch(url, { method: "HEAD", redirect: "follow" })).ok } catch { return false } }

const GROUPS = [
    {
        sub: "Generators", tools: [
            { key: "gradient-generator", name: "CSS Gradient Generator", short: "Design linear CSS gradients visually and copy the code." },
            { key: "box-shadow-generator", name: "Box Shadow Generator", short: "Build CSS box-shadows with live preview and copy the code." },
        ]
    },
    {
        sub: "Converters", tools: [
            { key: "number-base-converter", name: "Number Base Converter", short: "Convert numbers between binary, octal, decimal, and hexadecimal." },
            { key: "unit-converter", name: "Unit Converter", short: "Convert length, weight, and data-size units instantly." },
            { key: "case-converter", name: "Case Converter", short: "Convert text between camelCase, snake_case, Title Case, and more." },
            { key: "jwt-decoder", name: "JWT Decoder", short: "Decode a JWT's header and payload locally (no signature check)." },
            { key: "html-entities", name: "HTML Entities Encoder / Decoder", short: "Escape and unescape HTML entities like &amp; and &lt;." },
        ]
    },
    {
        sub: "Testers", tools: [
            { key: "cron-parser", name: "Cron Expression Parser", short: "Explain and validate a cron schedule in plain English." },
        ]
    },
    {
        sub: "Text", desc: "Text analysis, formatting, and conversion tools", tools: [
            { key: "word-counter", name: "Word & Character Counter", short: "Count words, characters, sentences, and estimate reading time." },
            { key: "text-diff", name: "Text Diff Checker", short: "Compare two blocks of text line by line and highlight changes." },
            { key: "markdown-previewer", name: "Markdown Previewer", short: "Write markdown and see it rendered live, side by side." },
            { key: "slug-generator", name: "Slug Generator", short: "Turn any title into a clean, URL-friendly slug." },
        ]
    },
]

async function main() {
    const dp = await prisma.category.findFirst({ where: { name: { equals: "Digital Products", mode: "insensitive" } } })
    const toolsSub = await prisma.subCategory.findFirst({
        where: { categoryId: dp.id, parentSubCategoryId: null, name: { equals: "Tools", mode: "insensitive" } },
    })
    if (!toolsSub) throw new Error("Digital Products > Tools not found")

    let created = 0
    for (const group of GROUPS) {
        let sub = await prisma.subCategory.findFirst({
            where: { categoryId: dp.id, parentSubCategoryId: toolsSub.id, name: { equals: group.sub, mode: "insensitive" } },
        })
        if (!sub) {
            const order = await prisma.subCategory.count({ where: { parentSubCategoryId: toolsSub.id } })
            sub = await prisma.subCategory.create({
                data: { name: group.sub, description: group.desc || `${group.sub} tools`, categoryId: dp.id, parentSubCategoryId: toolsSub.id, order: order + 1 },
            })
            console.log(`+ sub-category: ${group.sub} (sub-${sub.id})`)
        }
        for (const tool of group.tools) {
            const slug = `digital-products/tools/${slugify(group.sub)}/${tool.key}`
            if (await prisma.page.findUnique({ where: { slug } })) continue
            const img = IMG[tool.key]
            let url = unsplash(img.id)
            if (!(await alive(url))) url = fallback(img.kw, Math.floor(Math.random() * 9999))
            await prisma.page.create({
                data: {
                    name: tool.name, slug, shortDescription: tool.short,
                    description: `<p>${tool.short}</p>`,
                    category: `sub-${sub.id}`, toolKey: tool.key, isPublished: true,
                    featuredImages: [url], bannerImages: [],
                    seoTitle: `${tool.name} — Free Online Tool | CrazyBitBite`.slice(0, 70),
                    seoDescription: tool.short.slice(0, 170),
                    seoKeywords: `${tool.name.toLowerCase()}, online tool, free, crazybitbite`,
                },
            })
            created++
            console.log(`Created: /${slug}`)
        }
    }
    console.log(`Done — ${created} new tools`)
}
main().catch((e) => { console.error(e); process.exitCode = 1 }).finally(() => prisma.$disconnect())
