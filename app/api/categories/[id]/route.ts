import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

(BigInt.prototype as any).toJSON = function () {
    return this.toString()
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        const category = await prisma.category.findUnique({
            where: { id: parseInt(params.id) },
        })
        if (!category) {
            return NextResponse.json({ error: "Category not found" }, { status: 404 })
        }
        return NextResponse.json(category)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch category" }, { status: 500 })
    }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        const json = await req.json()
        const category = await prisma.category.update({
            where: { id: parseInt(params.id) },
            data: {
                name: json.name,
                description: json.description,
                order: typeof json.order === "number" ? json.order : undefined,
                sideContent: json.sideContent ?? undefined,
            },
        })
        return NextResponse.json(category)
    } catch (error) {
        return NextResponse.json({ error: "Failed to update category" }, { status: 500 })
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        const categoryId = parseInt(params.id)

        // Check if any pages are using this category
        const linkedPages = await prisma.page.findMany({
            where: { category: categoryId.toString() },
            select: { id: true, name: true }
        })

        if (linkedPages.length > 0) {
            const pageNames = linkedPages.map(p => p.name).join(', ')
            return NextResponse.json({
                error: `Cannot delete category. It is linked to ${linkedPages.length} page(s): ${pageNames}. Please unlink the category from these pages first.`
            }, { status: 400 })
        }

        // Check if any pages are using subcategories of this category
        const subcategories = await prisma.subCategory.findMany({
            where: { categoryId },
            select: { id: true }
        })

        if (subcategories.length > 0) {
            const subcategoryIds = subcategories.map(sc => sc.id.toString())
            const pagesWithSubcategories = await prisma.page.findMany({
                where: { category: { in: subcategoryIds } },
                select: { id: true, name: true }
            })

            if (pagesWithSubcategories.length > 0) {
                const pageNames = pagesWithSubcategories.map(p => p.name).join(', ')
                return NextResponse.json({
                    error: `Cannot delete category. Its subcategories are linked to ${pagesWithSubcategories.length} page(s): ${pageNames}. Please unlink the subcategories from these pages first.`
                }, { status: 400 })
            }
        }

        // First, delete all subcategories associated with this category
        // This prevents foreign key constraint errors
        await prisma.subCategory.deleteMany({
            where: { categoryId }
        })

        // Now delete the parent category
        await prisma.category.delete({
            where: { id: categoryId },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Delete category error:", error)
        return NextResponse.json({ error: "Failed to delete category" }, { status: 500 })
    }
}
