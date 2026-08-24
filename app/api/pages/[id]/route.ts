import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { isValidSlug } from "@/lib/slugify"
import { storeDownloadFile, deleteDownloadFile } from "@/lib/downloadFileStorage"

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const page = await prisma.page.findUnique({
            where: { id: parseInt(params.id) },
            // File metadata only — the binary is served by the gated download route
            include: { downloadFile: { select: { fileName: true, size: true } } },
        })

        if (!page) {
            return NextResponse.json({ error: "Page not found" }, { status: 404 })
        }

        return NextResponse.json(page)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch page" }, { status: 500 })
    }
}

export async function PUT(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth()
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const json = await req.json()
        const pageId = parseInt(params.id)

        // Validate slug format if provided
        if (json.slug && !isValidSlug(json.slug)) {
            return NextResponse.json({ error: "Invalid slug format" }, { status: 400 })
        }

        // Check slug uniqueness (excluding current page)
        if (json.slug) {
            const existingPage = await prisma.page.findUnique({
                where: { slug: json.slug }
            })

            if (existingPage && existingPage.id !== pageId) {
                return NextResponse.json({ error: "Slug already exists" }, { status: 400 })
            }
        }

        // Download file handling: a new upload replaces any existing file;
        // removeDownloadFile detaches and deletes the stored one.
        const existing = await prisma.page.findUnique({
            where: { id: pageId },
            select: { downloadFileId: true },
        })
        let downloadFileId: number | null | undefined = undefined
        let staleFileId: number | null = null

        if (typeof json.downloadFileData === "string" && json.downloadFileData.startsWith("data:")) {
            const newFileId = await storeDownloadFile(json.downloadFileData, json.downloadFileName)
            if (!newFileId) {
                return NextResponse.json({ error: "Invalid or too large download file (max 3 MB)" }, { status: 400 })
            }
            downloadFileId = newFileId
            staleFileId = existing?.downloadFileId ?? null
        } else if (json.removeDownloadFile) {
            downloadFileId = null
            staleFileId = existing?.downloadFileId ?? null
        }

        const page = await prisma.page.update({
            where: { id: pageId },
            data: {
                downloadFileId,
                name: json.name,
                slug: json.slug,
                description: json.description,
                shortDescription: json.shortDescription || null,
                price: json.price === "" || json.price == null ? null : parseFloat(json.price),
                currency: json.currency || "USD",
                paymentMethods: json.paymentMethods || null,
                checkoutNote: json.checkoutNote || null,
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

        // Only after the page no longer references it
        await deleteDownloadFile(staleFileId)

        return NextResponse.json(page)
    } catch (error) {
        console.error("Error updating page:", error)
        return NextResponse.json({ error: "Failed to update page", details: (error as Error).message }, { status: 500 })
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth()
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        await prisma.page.delete({
            where: { id: parseInt(params.id) },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete page" }, { status: 500 })
    }
}
