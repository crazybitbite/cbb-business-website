/**
 * Adds Converters + Generators sub-categories, 13 new high-traffic tool pages,
 * and topical featured images for EVERY tool page (verified live, with a
 * keyword-photo fallback). Idempotent.
 *
 * Run: node --env-file=.env.local scripts/seed-tools-2.mjs
 */
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()
const slugify = (t) => t.toLowerCase().trim().replace(/&/g, "and").replace(/[^\w\s-]/g, "").replace(/\s+/g, "-")

const IMG = {
    "json-beautifier": { id: "1555066931-4365d14bab8c", kw: "code,editor" },
    "xml-beautifier": { id: "1542831371-29b0f74f9713", kw: "code,screen" },
    "websocket-tester": { id: "1544197150-b99a580bb7a8", kw: "network,laptop" },
    "socketio-tester": { id: "1573164713988-8665fc963095", kw: "programming,screen" },
    "post-data-receiver": { id: "1516259762381-22954d7d3ad2", kw: "server,code" },
    "image-resizer": { id: "1493863641943-9b68992a8d07", kw: "photography,editing" },
    "js-compressor": { id: "1627398242454-45a1465c2479", kw: "javascript,code" },
    "css-compressor": { id: "1461749280684-dccba630e2f6", kw: "css,code" },
    "html-beautifier": { id: "1547658719-da2b51169166", kw: "html,webdesign" },
    "sql-formatter": { id: "1489389944381-3471b5b30f04", kw: "database,data" },
    "regex-tester": { id: "1515879218367-8466d910aaa4", kw: "code,terminal" },
    "base64-encoder": { id: "1526374965328-7f61d4dc18c5", kw: "encryption,matrix" },
    "url-encoder": { id: "1481487196290-c152efe083f5", kw: "web,browser" },
    "json-csv-converter": { id: "1551288049-bebda4e38f71", kw: "spreadsheet,data" },
    "epoch-converter": { id: "1495364141860-b0d03eccd065", kw: "clock,time" },
    "color-converter": { id: "1513151233558-d860c5398176", kw: "colors,palette" },
    "uuid-generator": { id: "1518186285589-2f7649de83e0", kw: "abstract,technology" },
    "password-generator": { id: "1633265486064-086b219458ec", kw: "security,padlock" },
    "hash-generator": { id: "1563986768609-322da13575f3", kw: "cybersecurity,digital" },
    "qr-generator": { id: "1595079676339-1534801ad6cf", kw: "qrcode,phone" },
    "lorem-generator": { id: "1455390582262-044cdead277a", kw: "typewriter,writing" },
}

const unsplash = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&h=450&q=80`
const fallback = (kw, lock) => `https://loremflickr.com/800/450/${kw}?lock=${lock}`

async function alive(url) {
    try { return (await fetch(url, { method: "HEAD", redirect: "follow" })).ok } catch { return false }
}

const NEW_TOOLS = [
    {
        sub: "Formatters", tools: [
            { key: "html-beautifier", name: "HTML Beautifier", short: "Format messy HTML with clean indentation, or minify it for production.", about: "Paste any HTML markup to re-indent it tag by tag, or strip it down to a single compact line. Runs entirely in your browser." },
            { key: "sql-formatter", name: "SQL Formatter", short: "Turn one-line SQL into readable, properly indented queries.", about: "Formats SELECT, INSERT, UPDATE, JOIN, and other clauses onto their own lines with uppercase keywords — string literals are preserved untouched." },
        ]
    },
    {
        sub: "Testers", tools: [
            { key: "regex-tester", name: "Regex Tester", short: "Test regular expressions live, with match highlighting and capture groups.", about: "Type a pattern and flags, paste your test string, and see every match highlighted instantly — including capture groups from the first match. Supports all JavaScript regex flags." },
        ]
    },
    {
        sub: "Converters", desc: "Convert between formats, encodings, and units", tools: [
            { key: "base64-encoder", name: "Base64 Encoder / Decoder", short: "Encode any text to Base64 or decode Base64 back to text — UTF-8 safe.", about: "Full Unicode support in both directions, with one click to feed the output back in as new input." },
            { key: "url-encoder", name: "URL Encoder / Decoder", short: "Percent-encode text for URLs, or decode encoded components.", about: "Uses standard encodeURIComponent semantics, ideal for query-string values, redirects, and webhook payloads." },
            { key: "json-csv-converter", name: "JSON ⇄ CSV Converter", short: "Convert JSON arrays to CSV spreadsheets and CSV files back to JSON.", about: "Handles quoted fields, embedded commas, and uneven objects — columns are unioned across all rows. Perfect for moving data between APIs and spreadsheets." },
            { key: "epoch-converter", name: "Epoch / Timestamp Converter", short: "Convert Unix timestamps to human dates and back, with a live current-epoch clock.", about: "Detects seconds vs milliseconds automatically and shows local time, UTC, ISO 8601, and a relative description." },
            { key: "color-converter", name: "Color Converter", short: "Convert colors between HEX, RGB, and HSL with a live swatch preview.", about: "Type or pick any color and copy it in every common CSS format instantly." },
        ]
    },
    {
        sub: "Generators", desc: "Generate IDs, passwords, QR codes, and placeholder content", tools: [
            { key: "uuid-generator", name: "UUID Generator", short: "Generate up to 100 version-4 UUIDs at once with cryptographic randomness.", about: "Standards-compliant v4 UUIDs generated locally via the Web Crypto API — copy one or all with a click." },
            { key: "password-generator", name: "Password Generator", short: "Create strong random passwords with custom length and character sets.", about: "Choose length 6–64 and which character classes to include; every selected class is guaranteed present. Ambiguous characters are excluded and nothing ever leaves your browser." },
            { key: "hash-generator", name: "Hash Generator", short: "Compute SHA-1, SHA-256, SHA-384, and SHA-512 hashes of any text.", about: "Powered by the browser's native Web Crypto — hashes are computed locally and shown as lowercase hex with copy buttons." },
            { key: "qr-generator", name: "QR Code Generator", short: "Turn any URL or text into a crisp QR code and download it as PNG.", about: "Adjustable size up to 1024px with medium error correction — great for links, WiFi details, and payment references." },
            { key: "lorem-generator", name: "Lorem Ipsum Generator", short: "Generate classic placeholder paragraphs for designs and mockups.", about: "Choose how many paragraphs you need and copy them straight into your layout." },
        ]
    },
]

async function main() {
    const dp = await prisma.category.findFirst({ where: { name: { equals: "Digital Products", mode: "insensitive" } } })
    const toolsSub = await prisma.subCategory.findFirst({
        where: { categoryId: dp.id, parentSubCategoryId: null, name: { equals: "Tools", mode: "insensitive" } },
    })
    if (!toolsSub) throw new Error("Digital Products > Tools sub-category not found")

    let created = 0
    for (const group of NEW_TOOLS) {
        let sub = await prisma.subCategory.findFirst({
            where: { categoryId: dp.id, parentSubCategoryId: toolsSub.id, name: { equals: group.sub, mode: "insensitive" } },
        })
        if (!sub) {
            const order = await prisma.subCategory.count({ where: { parentSubCategoryId: toolsSub.id } })
            sub = await prisma.subCategory.create({
                data: { name: group.sub, description: group.desc || `${group.sub} tools`, categoryId: dp.id, parentSubCategoryId: toolsSub.id, order: order + 1 },
            })
            console.log(`Created sub-category: ${group.sub} (sub-${sub.id})`)
        }

        for (const tool of group.tools) {
            const slug = `digital-products/tools/${slugify(group.sub)}/${tool.key}`
            if (await prisma.page.findUnique({ where: { slug } })) continue
            await prisma.page.create({
                data: {
                    name: tool.name,
                    slug,
                    shortDescription: tool.short,
                    description: `<p>${tool.about}</p>`,
                    category: `sub-${sub.id}`,
                    toolKey: tool.key,
                    isPublished: true,
                    featuredImages: [],
                    bannerImages: [],
                    seoTitle: `${tool.name} — Free Online Tool | CrazyBitBite`.slice(0, 70),
                    seoDescription: tool.short.slice(0, 170),
                    seoKeywords: `${tool.name.toLowerCase()}, online tool, free, ${group.sub.toLowerCase()}, crazybitbite`,
                },
            })
            created++
            console.log(`Created: /${slug}`)
        }
    }

    // Featured images for EVERY tool page (existing + new)
    const toolPages = await prisma.page.findMany({ where: { toolKey: { not: null } }, select: { id: true, toolKey: true } })
    let imgSet = 0, fallbacks = 0
    for (const p of toolPages) {
        const img = IMG[p.toolKey]
        if (!img) continue
        let url = unsplash(img.id)
        if (!(await alive(url))) {
            url = fallback(img.kw, p.id)
            fallbacks++
            console.warn(`fallback image: ${p.toolKey}`)
        }
        await prisma.page.update({ where: { id: p.id }, data: { featuredImages: [url] } })
        imgSet++
    }
    console.log(`Done: ${created} new tools, images set on ${imgSet} pages (${fallbacks} fallbacks)`)
}

main().catch((e) => { console.error(e); process.exitCode = 1 }).finally(() => prisma.$disconnect())
