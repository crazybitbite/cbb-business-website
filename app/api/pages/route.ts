import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { isValidSlug } from "@/lib/slugify"
import { storeDownloadFile } from "@/lib/downloadFileStorage"

export async function GET(req: Request) {
    try {
        const pages = await prisma.page.findMany({
            orderBy: { createdAt: "desc" },
        })
        return NextResponse.json(pages)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch pages" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const json = await req.json()

        // Validate slug format
        if (!json.slug || !isValidSlug(json.slug)) {
            return NextResponse.json({ error: "Invalid slug format" }, { status: 400 })
        }

        // Check slug uniqueness
        const existingPage = await prisma.page.findUnique({
            where: { slug: json.slug }
        })

        if (existingPage) {
            return NextResponse.json({ error: "Slug already exists" }, { status: 400 })
        }

        // Optional uploaded download file (base64 data URL from the admin form)
        let downloadFileId: number | undefined = undefined
        if (typeof json.downloadFileData === "string" && json.downloadFileData.startsWith("data:")) {
            const newFileId = await storeDownloadFile(json.downloadFileData, json.downloadFileName)
            if (!newFileId) {
                return NextResponse.json({ error: "Invalid or too large download file (max 3 MB)" }, { status: 400 })
            }
            downloadFileId = newFileId
        }

        const page = await prisma.page.create({
            data: {
                downloadFileId,
                name: json.name,
                slug: json.slug,
                description: json.description,
                shortDescription: json.shortDescription || null,
                price: json.price === "" || json.price == null ? null : parseFloat(json.price),
                currency: json.currency || "USD",
                category: json.category?.toString() ?? "",
                featured: !!json.featured,
                isPublished: !!json.isPublished,
                showcase: !!json.showcase,
                showcaseOrder: json.showcaseOrder === "" || json.showcaseOrder == null ? null : parseInt(json.showcaseOrder),
                downloadable: !!json.downloadable,
                downloadPlatforms: json.downloadable && Array.isArray(json.downloadPlatforms) ? json.downloadPlatforms : [],
                modelUrl: json.modelUrl || null,
                sideContent: json.sideContent ?? undefined,
                cta: json.cta ?? undefined,
                featuredImages: json.featuredImages || [],
                bannerImages: json.bannerImages || [],
            },
        })
        return NextResponse.json(page)
    } catch (error) {
        console.error("Error creating page:", error)
        return NextResponse.json({ error: "Failed to create page", details: (error as Error).message }, { status: 500 })
    }
}
