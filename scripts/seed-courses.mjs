/**
 * Seeds Digital Products → Courses → <Course> → <Level> → lesson pages.
 * Pure data: categories, sub-categories, and pages — no hardcoding in the app.
 * Lessons render with in-content hero + mid images and topical featured images
 * (all verified live, with keyword-photo fallback). Idempotent.
 *
 * Run: node --env-file=.env.local scripts/seed-courses.mjs
 */
import { PrismaClient } from "@prisma/client"
import { PYTHON } from "./courses/python.mjs"
import { JAVASCRIPT } from "./courses/javascript.mjs"
import { QUANTUM } from "./courses/quantum.mjs"
import { MARKETING } from "./courses/marketing.mjs"
import { CYBERSECURITY } from "./courses/cybersecurity.mjs"
import { FORENSICS } from "./courses/forensics.mjs"
import { REACT } from "./courses/react.mjs"
import { TYPESCRIPT } from "./courses/typescript.mjs"
import { BOOTSTRAP } from "./courses/bootstrap.mjs"
import { NODEJS } from "./courses/nodejs.mjs"
import { HTML } from "./courses/html.mjs"

const prisma = new PrismaClient()
const COURSES = [PYTHON, JAVASCRIPT, QUANTUM, MARKETING, CYBERSECURITY, FORENSICS, REACT, TYPESCRIPT, BOOTSTRAP, NODEJS, HTML]
const LEVELS = ["Basic", "Intermediate", "Advanced"]

const slugify = (t) => t.toLowerCase().trim().replace(/&/g, "and").replace(/\+\+/g, "pp").replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-")
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
const clip = (s, n) => (s.length <= n ? s : s.slice(0, n - 1).replace(/\s+\S*$/, "") + "…")

const unsplash = (id, w, h) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`
const fallback = (kw, lock, w, h) => `https://loremflickr.com/${w}/${h}/${kw.split(",")[0]}?lock=${lock}`

async function alive(url) {
    try { return (await fetch(url, { method: "HEAD", redirect: "follow" })).ok } catch { return false }
}

// Resolve a course image id (verified) to a usable URL, else keyword fallback
const heroCache = new Map()
async function pickImage(course, index, w, h, lock) {
    const id = course.images[index % course.images.length]
    const key = `${id}-${w}x${h}`
    if (!heroCache.has(key)) {
        const u = unsplash(id, w, h)
        heroCache.set(key, (await alive(u)) ? u : null)
    }
    return heroCache.get(key) || fallback(course.kw, lock, w, h)
}

function lessonHtml(course, lesson, heroUrl, midUrl) {
    const [c1, c2] = course.palette
    const toc = lesson.sec.map(([h]) => `<span class="cbb-art-toc-item">${esc(h)}</span>`).join("")

    const sections = lesson.sec.map(([h, p, code], i) => {
        const codeBlock = code ? `\n        <pre><code>${esc(code)}</code></pre>` : ""
        const midImage = i === 0 && midUrl
            ? `\n    <figure class="cbb-art-fig"><img src="${midUrl}" alt="${esc(lesson.t)}" loading="lazy" /></figure>`
            : ""
        return `
    <div class="cbb-art-sec">
        <h2><span class="cbb-art-num">${String(i + 1).padStart(2, "0")}</span>${esc(h)}</h2>
        <p>${esc(p)}</p>${codeBlock}
    </div>${midImage}`
    }).join("")

    const tips = lesson.tips.map((t) => `
            <li><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${c1}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>${esc(t)}</li>`).join("")

    return `<div class="cbb-art" style="--a1:${c1};--a2:${c2}">
    <figure class="cbb-art-hero" style="margin:0 0 26px;border-radius:20px;overflow:hidden;border:1px solid rgba(255,255,255,0.1)"><img src="${heroUrl}" alt="${esc(lesson.t)}" style="width:100%;display:block;aspect-ratio:16/9;object-fit:cover" /></figure>
    <p class="cbb-art-lead">${esc(lesson.e)}</p>
    <div class="cbb-art-toc">${toc}</div>
    ${sections}
    <div class="cbb-exercise">
        <h3>✍️ Practice Exercise</h3>
        <p>${esc(lesson.ex)}</p>
    </div>
    <div class="cbb-art-tips">
        <h3>Key Takeaways</h3>
        <ul>${tips}
        </ul>
    </div>
</div>`
}

async function getOrCreateSub(name, description, categoryId, parentSubCategoryId) {
    let sub = await prisma.subCategory.findFirst({
        where: { categoryId, parentSubCategoryId, name: { equals: name, mode: "insensitive" } },
    })
    if (!sub) {
        const order = await prisma.subCategory.count({ where: { parentSubCategoryId } })
        sub = await prisma.subCategory.create({
            data: { name, description, categoryId, parentSubCategoryId, order: order + 1 },
        })
        console.log(`  + sub-category: ${name} (sub-${sub.id})`)
    }
    return sub
}

async function main() {
    const dp = await prisma.category.findFirst({ where: { name: { equals: "Digital Products", mode: "insensitive" } } })
    if (!dp) throw new Error("Digital Products category not found")

    // Digital Products → Courses
    const coursesSub = await getOrCreateSub("Courses", "Structured learning paths", dp.id, null)

    let created = 0, updated = 0, imgFallbacks = 0
    let lock = 1000

    for (const course of COURSES) {
        console.log(`\n${course.name}`)
        const courseSub = await getOrCreateSub(course.name, `${course.name} — from beginner to advanced`, dp.id, coursesSub.id)

        let lessonIndex = 0
        for (const level of LEVELS) {
            const levelSub = await getOrCreateSub(level, `${course.name} — ${level} level`, dp.id, courseSub.id)
            const lessons = course.levels[level] || []

            for (let i = 0; i < lessons.length; i++) {
                const lesson = lessons[i]
                const slug = `digital-products/courses/${slugify(course.name)}/${slugify(level)}/${lesson.s}`

                const heroUrl = await pickImage(course, lessonIndex, 1200, 675, lock++)
                const midUrl = await pickImage(course, lessonIndex + 1, 1000, 560, lock++)
                const featured = await pickImage(course, lessonIndex, 800, 450, lock++)
                if (heroUrl.includes("loremflickr")) imgFallbacks++

                const data = {
                    name: lesson.t,
                    shortDescription: lesson.e,
                    description: lessonHtml(course, lesson, heroUrl, midUrl),
                    category: `sub-${levelSub.id}`,
                    isPublished: true,
                    showcase: false,
                    showcaseOrder: i + 1,
                    featuredImages: [featured],
                    bannerImages: [],
                    seoTitle: clip(`${lesson.t} | ${course.name} Course`, 70),
                    seoDescription: clip(lesson.e, 170),
                    seoKeywords: `${course.name.toLowerCase()}, ${level.toLowerCase()}, ${slugify(course.name).replace(/-/g, " ")}, tutorial, crazybitbite`,
                }

                const existing = await prisma.page.findUnique({ where: { slug } })
                if (existing) {
                    await prisma.page.update({ where: { id: existing.id }, data })
                    updated++
                } else {
                    await prisma.page.create({ data: { ...data, slug } })
                    created++
                }
                lessonIndex++
                process.stdout.write(".")
            }
        }
    }

    console.log(`\n\nDone: ${created} lessons created, ${updated} updated, ${imgFallbacks} image fallbacks`)
}

main().catch((e) => { console.error(e); process.exitCode = 1 }).finally(() => prisma.$disconnect())
