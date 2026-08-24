/**
 * Upgrades all 50 seeded blog articles in place:
 *  - real topic-matched photography (verified live before saving; keyword-photo
 *    fallback if an image URL doesn't resolve)
 *  - richer article body: hero photo, table of contents, expanded sections
 *    with pro-tip callouts, pull quote, mid-article photo, takeaways, tags
 *
 * Run: node --env-file=.env.local scripts/update-blog.mjs
 */
import { PrismaClient } from "@prisma/client"
import { BLOG_CATEGORIES } from "./blog-data.mjs"
import { EXTRAS_1 } from "./blog-extras-1.mjs"
import { EXTRAS_2 } from "./blog-extras-2.mjs"
import { ARTICLE_IMAGES, unsplashUrl, fallbackUrl } from "./blog-images.mjs"

const prisma = new PrismaClient()
const EXTRAS = { ...EXTRAS_1, ...EXTRAS_2 }

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

async function urlAlive(url) {
    try {
        const res = await fetch(url, { method: "HEAD", redirect: "follow" })
        return res.ok
    } catch {
        return false
    }
}

function articleHtml(article, categoryName, [c1, c2], heroUrl, midUrl) {
    const extras = EXTRAS[article.s] || []

    const toc = article.sec
        .map(([h]) => `<span class="cbb-art-toc-item">${esc(h)}</span>`)
        .join("")

    const sections = article.sec
        .map(([h, p], i) => {
            const extra = extras[i] ? `<p>${esc(extras[i])}</p>` : ""
            const tip = article.tips[i]
                ? `<div class="cbb-art-tip"><span class="cbb-art-tip-label">Pro tip</span>${esc(article.tips[i])}</div>`
                : ""
            const midImage = i === 1 && midUrl
                ? `<figure class="cbb-art-fig"><img src="${midUrl}" alt="${esc(article.t)} — illustration" loading="lazy" /></figure>`
                : ""
            return `
    <div class="cbb-art-sec">
        <h2><span class="cbb-art-num">${String(i + 1).padStart(2, "0")}</span>${esc(h)}</h2>
        <p>${esc(p)}</p>
        ${extra}
        ${tip}
    </div>${midImage}`
        })
        .join("")

    const tips = article.tips
        .map((t) => `
            <li><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${c1}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>${esc(t)}</li>`)
        .join("")

    const tags = [categoryName, ...article.t.split(" ").filter((w) => w.length > 5).slice(0, 2)]
        .map((t) => `<span class="cbb-art-tag">#${esc(t.replace(/[^\w]/g, ""))}</span>`)
        .join("")

    // Styling lives in app/globals.css (.cbb-art*) so the admin editor
    // round-trip can never strip it; the palette rides on CSS variables.
    // The hero image is NOT embedded — PageRenderer shows featuredImages[0].
    return `<div class="cbb-art" style="--a1:${c1};--a2:${c2}">
    <p class="cbb-art-lead">${esc(article.e)}</p>
    <div class="cbb-art-toc">${toc}</div>
    ${sections}
    <blockquote class="cbb-art-quote">"${esc(article.tips[0])}" — if you take one thing from this article, make it that.</blockquote>
    <div class="cbb-art-tips">
        <h3>Key Takeaways</h3>
        <ul>${tips}
        </ul>
    </div>
    <div>${tags}</div>
</div>`
}

async function main() {
    let updated = 0
    let fallbacks = 0

    for (const cat of BLOG_CATEGORIES) {
        for (let i = 0; i < cat.articles.length; i++) {
            const a = cat.articles[i]
            const slug = `blog/${a.s}`
            const page = await prisma.page.findUnique({ where: { slug }, select: { id: true } })
            if (!page) {
                console.warn(`missing page: ${slug}`)
                continue
            }

            const img = ARTICLE_IMAGES[a.s]
            let heroUrl = img ? unsplashUrl(img.id) : null
            if (!heroUrl || !(await urlAlive(heroUrl))) {
                heroUrl = fallbackUrl(img?.kw || cat.name.toLowerCase(), page.id)
                fallbacks++
                console.warn(`fallback image for ${a.s}`)
            }
            const featured = heroUrl.replace("w=1200&h=675", "w=800&h=450")
            const midUrl = fallbackUrl(img?.kw || cat.name.toLowerCase(), page.id + 500)

            await prisma.page.update({
                where: { id: page.id },
                data: {
                    description: articleHtml(a, cat.name, cat.palette, heroUrl, midUrl),
                    featuredImages: [featured],
                },
            })
            updated++
            process.stdout.write(".")
        }
    }

    console.log(`\nUpdated ${updated} articles (${fallbacks} image fallbacks used)`)
}

main()
    .catch((e) => {
        console.error("Update failed:", e)
        process.exitCode = 1
    })
    .finally(() => prisma.$disconnect())
