/**
 * Seeds the blog: 5 sub-categories under "Blog", 10 articles each (skips slugs
 * that already exist), with generated SVG featured images and full SEO fields.
 * Also backfills SEO fields for ALL existing pages that lack them.
 *
 * Run against the app database:
 *   node --env-file=.env.local scripts/seed-blog.mjs
 */
import { PrismaClient } from "@prisma/client"
import { BLOG_CATEGORIES } from "./blog-data.mjs"

const prisma = new PrismaClient()

const slugify = (t) => t.toLowerCase().trim().replace(/&/g, "and").replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-")

// ---------- SVG featured image (800x450 data URI) ----------
function wrapTitle(title, max = 26) {
    const words = title.split(" ")
    const lines = [""]
    for (const w of words) {
        const cur = lines[lines.length - 1]
        if ((cur + " " + w).trim().length > max && cur) lines.push(w)
        else lines[lines.length - 1] = (cur + " " + w).trim()
    }
    return lines.slice(0, 3)
}

function esc(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

function featuredImage(title, category, [c1, c2]) {
    const lines = wrapTitle(title)
    const tspans = lines
        .map((l, i) => `<tspan x="60" dy="${i === 0 ? 0 : 52}">${esc(l)}</tspan>`)
        .join("")
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs>
<rect width="800" height="450" fill="#0a0a0f"/>
<rect width="800" height="450" fill="url(#g)" opacity="0.22"/>
<circle cx="700" cy="60" r="180" fill="${c1}" opacity="0.28"/>
<circle cx="80" cy="420" r="140" fill="${c2}" opacity="0.22"/>
<circle cx="640" cy="380" r="60" fill="${c2}" opacity="0.3"/>
<rect x="60" y="70" rx="16" width="${category.length * 10 + 40}" height="32" fill="${c1}" opacity="0.25"/>
<text x="80" y="91" font-family="Arial, sans-serif" font-size="15" font-weight="bold" fill="#ffffff" opacity="0.95">${esc(category.toUpperCase())}</text>
<text x="60" y="${450 / 2 - (lines.length - 1) * 20}" font-family="Arial, sans-serif" font-size="40" font-weight="bold" fill="#ffffff">${tspans}</text>
<text x="60" y="400" font-family="Arial, sans-serif" font-size="16" fill="#ffffff" opacity="0.6">CrazyBitBite Blog</text>
</svg>`
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

// ---------- Article HTML (goes into page.description) ----------
function articleHtml(article, categoryName, [c1, c2]) {
    const sections = article.sec
        .map(
            ([h, p], i) => `
    <div class="cbb-art-sec">
        <h2><span class="cbb-art-num">${String(i + 1).padStart(2, "0")}</span>${esc(h)}</h2>
        <p>${esc(p)}</p>
    </div>`
        )
        .join("")

    const tips = article.tips
        .map(
            (t) => `
            <li><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${c1}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>${esc(t)}</li>`
        )
        .join("")

    const tags = [categoryName, ...article.t.split(" ").filter((w) => w.length > 5).slice(0, 2)]
        .map((t) => `<span class="cbb-art-tag">#${esc(t.replace(/\s+/g, ""))}</span>`)
        .join("")

    return `<style>
    .cbb-art { color: #d1d5db; font-size: 17px; line-height: 1.85; max-width: 760px; }
    .cbb-art h2 { color: #fff; font-size: 24px; font-weight: 800; margin: 42px 0 14px !important; display: flex; align-items: center; gap: 12px; line-height: 1.3; }
    .cbb-art p { margin: 0 0 14px !important; }
    @keyframes cbbArtFade { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    .cbb-art-lead { font-size: 20px; color: #e5e7eb; border-left: 4px solid ${c1}; padding-left: 18px; margin: 10px 0 30px !important; opacity: 0; animation: cbbArtFade 0.8s ease forwards; }
    .cbb-art-sec { opacity: 0; animation: cbbArtFade 0.8s ease 0.15s forwards; }
    .cbb-art-num { display: inline-flex; align-items: center; justify-content: center; width: 38px; height: 38px; border-radius: 12px; flex-shrink: 0; font-size: 15px; background: linear-gradient(135deg, ${c1}33, ${c2}33); border: 1px solid ${c1}55; color: ${c1}; }
    .cbb-art-tips { margin: 46px 0 !important; padding: 26px 28px; border-radius: 20px; background: linear-gradient(135deg, ${c1}14, ${c2}10); border: 1px solid ${c1}40; }
    .cbb-art-tips h3 { color: #fff; font-size: 19px; font-weight: 800; margin: 0 0 14px !important; }
    .cbb-art-tips ul { list-style: none; margin: 0 !important; padding: 0 !important; }
    .cbb-art-tips li { display: flex; align-items: flex-start; gap: 10px; padding: 6px 0; color: #e5e7eb; font-size: 15.5px; }
    .cbb-art-tips li svg { flex-shrink: 0; margin-top: 5px; }
    .cbb-art-tag { display: inline-block; margin: 0 8px 8px 0; padding: 6px 14px; border-radius: 999px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.12); color: #9ca3af; font-size: 13px; }
    @media (prefers-reduced-motion: reduce) { .cbb-art-lead, .cbb-art-sec { animation: none; opacity: 1; } }
</style>
<div class="cbb-art">
    <p class="cbb-art-lead">${esc(article.e)}</p>
    ${sections}
    <div class="cbb-art-tips">
        <h3>Key Takeaways</h3>
        <ul>${tips}
        </ul>
    </div>
    <div>${tags}</div>
</div>`
}

// ---------- SEO helpers ----------
const clip = (s, n) => (s.length <= n ? s : s.slice(0, n - 1).replace(/\s+\S*$/, "") + "…")
const stripHtml = (s) => s.replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()

function keywordsFor(name, category) {
    const words = name.toLowerCase().replace(/[^\w\s]/g, "").split(/\s+/).filter((w) => w.length > 4).slice(0, 5)
    return [...new Set([...words, category.toLowerCase(), "crazybitbite"])].join(", ")
}

// ---------- main ----------
async function main() {
    // 1. Blog category
    let blog = await prisma.category.findFirst({ where: { name: { equals: "Blog", mode: "insensitive" } } })
    if (!blog) {
        const count = await prisma.category.count()
        blog = await prisma.category.create({ data: { name: "Blog", description: "Articles and insights", order: count + 1 } })
        console.log("Created Blog category")
    }

    let created = 0
    let skipped = 0

    for (const cat of BLOG_CATEGORIES) {
        // 2. Sub-category
        let sub = await prisma.subCategory.findFirst({
            where: { categoryId: blog.id, name: { equals: cat.name, mode: "insensitive" } },
        })
        if (!sub) {
            const order = await prisma.subCategory.count({ where: { categoryId: blog.id } })
            sub = await prisma.subCategory.create({
                data: { name: cat.name, description: `${cat.name} articles`, categoryId: blog.id, order: order + 1 },
            })
            console.log(`Created sub-category: ${cat.name} (sub-${sub.id})`)
        }

        // 3. Articles
        for (let i = 0; i < cat.articles.length; i++) {
            const a = cat.articles[i]
            const slug = `blog/${a.s}`
            const existing = await prisma.page.findUnique({ where: { slug } })
            if (existing) {
                skipped++
                continue
            }

            await prisma.page.create({
                data: {
                    name: a.t,
                    slug,
                    shortDescription: a.e,
                    description: articleHtml(a, cat.name, cat.palette),
                    category: `sub-${sub.id}`,
                    isPublished: true,
                    showcase: i === 0, // first article per category appears in Latest Insights
                    featuredImages: [featuredImage(a.t, cat.name, cat.palette)],
                    bannerImages: [],
                    seoTitle: clip(`${a.t} | CrazyBitBite`, 70),
                    seoDescription: clip(a.e, 170),
                    seoKeywords: keywordsFor(a.t, cat.name),
                },
            })
            created++
        }
    }

    console.log(`Articles: ${created} created, ${skipped} already existed`)

    // 4. SEO backfill for every page missing fields
    const pages = await prisma.page.findMany({
        select: { id: true, name: true, shortDescription: true, description: true, seoTitle: true, seoDescription: true, seoKeywords: true, category: true },
    })

    let backfilled = 0
    for (const p of pages) {
        const data = {}
        if (!p.seoTitle) data.seoTitle = clip(`${p.name} | CrazyBitBite`, 70)
        if (!p.seoDescription) data.seoDescription = clip(p.shortDescription || stripHtml(p.description) || p.name, 170)
        if (!p.seoKeywords) data.seoKeywords = keywordsFor(p.name, "digital services")
        if (Object.keys(data).length) {
            await prisma.page.update({ where: { id: p.id }, data })
            backfilled++
        }
    }
    console.log(`SEO backfilled on ${backfilled} pages`)
}

main()
    .catch((e) => {
        console.error("Seed failed:", e)
        process.exitCode = 1
    })
    .finally(() => prisma.$disconnect())
