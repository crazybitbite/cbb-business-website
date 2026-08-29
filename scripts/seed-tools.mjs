/**
 * Seeds the Tools category, sub-categories, and one published page per
 * registered tool at tools/<sub-category>/<tool-name>. Idempotent — existing
 * slugs are skipped. All tools start FREE; adjust access per tool in admin.
 *
 * Run: node --env-file=.env.local scripts/seed-tools.mjs
 */
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()
const slugify = (t) => t.toLowerCase().trim().replace(/&/g, "and").replace(/[^\w\s-]/g, "").replace(/\s+/g, "-")

const STRUCTURE = [
    {
        sub: "Formatters",
        desc: "Beautify, minify, and validate data formats",
        tools: [
            { key: "json-beautifier", name: "JSON Beautifier", short: "Format, minify, and validate JSON right in your browser.", about: "Paste any JSON to pretty-print it with your preferred indentation, minify it for production, or just validate the syntax. Everything runs locally in your browser — your data never leaves your machine." },
            { key: "xml-beautifier", name: "XML Beautifier", short: "Format and validate XML documents instantly.", about: "Clean up messy XML with proper indentation, compress it to a single line, or check it for syntax errors. Processing happens entirely in your browser." },
        ],
    },
    {
        sub: "Testers",
        desc: "Test APIs, sockets, and webhooks",
        tools: [
            { key: "websocket-tester", name: "WebSocket Tester", short: "Connect to any WebSocket server, send messages, and watch the responses live.", about: "Enter a ws:// or wss:// URL, connect, and exchange messages with a live log of everything sent and received — perfect for debugging real-time APIs." },
            { key: "socketio-tester", name: "Socket.IO Tester", short: "Connect to Socket.IO servers, emit events, and log everything that comes back.", about: "Connect to any Socket.IO server, emit custom events with JSON or text payloads, and monitor all incoming events in real time." },
            { key: "post-data-receiver", name: "POST Data Receiver", short: "Get a unique URL that captures any HTTP request so you can inspect it.", about: "Generate a personal endpoint URL, point your webhook, form, or API client at it, and inspect every incoming request — method, headers, and body. Great for debugging integrations." },
        ],
    },
    {
        sub: "Optimizers",
        desc: "Compress and optimize assets",
        tools: [
            { key: "image-resizer", name: "Image Resizer", short: "Resize images to any dimensions and download them — no upload needed.", about: "Pick an image, set the target size (with aspect-ratio lock), choose JPEG, PNG, or WebP with adjustable quality, and download the result. The image is processed entirely in your browser." },
            { key: "js-compressor", name: "JavaScript Compressor", short: "Strip comments and whitespace from JavaScript safely.", about: "A conservative JavaScript compressor that removes comments and indentation while preserving strings and line structure, with size savings shown instantly." },
            { key: "css-compressor", name: "CSS Compressor", short: "Minify CSS stylesheets in one click.", about: "Removes comments, collapses whitespace, and trims redundant syntax from your CSS — with before/after size stats." },
        ],
    },
]

async function main() {
    let category = await prisma.category.findFirst({ where: { name: { equals: "Tools", mode: "insensitive" } } })
    if (!category) {
        const count = await prisma.category.count()
        category = await prisma.category.create({ data: { name: "Tools", description: "Free online tools", order: count + 1 } })
        console.log("Created Tools category")
    }

    let created = 0
    for (const group of STRUCTURE) {
        let sub = await prisma.subCategory.findFirst({
            where: { categoryId: category.id, name: { equals: group.sub, mode: "insensitive" } },
        })
        if (!sub) {
            const order = await prisma.subCategory.count({ where: { categoryId: category.id } })
            sub = await prisma.subCategory.create({
                data: { name: group.sub, description: group.desc, categoryId: category.id, order: order + 1 },
            })
            console.log(`Created sub-category: ${group.sub} (sub-${sub.id})`)
        }

        for (const tool of group.tools) {
            const slug = `tools/${slugify(group.sub)}/${tool.key}`
            const exists = await prisma.page.findUnique({ where: { slug } })
            if (exists) continue

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
    console.log(`Done — ${created} tool pages created`)
}

main()
    .catch((e) => { console.error(e); process.exitCode = 1 })
    .finally(() => prisma.$disconnect())
