import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

(BigInt.prototype as any).toJSON = function () {
  return this.toString()
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const subCategory = await prisma.subCategory.findUnique({
      where: { id: parseInt(params.id) },
    })
    if (!subCategory) {
      return NextResponse.json({ error: "Sub-category not found" }, { status: 404 })
    }
    return NextResponse.json(subCategory)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch sub-category" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const json = await req.json()
    const subCategory = await prisma.subCategory.update({
      where: { id: parseInt(params.id) },
      data: {
        name: json.name,
        description: json.description,
        categoryId: parseInt(json.categoryId),
        parentSubCategoryId: json.parentSubCategoryId ? parseInt(json.parentSubCategoryId) : null,
      },
    })
    return NextResponse.json(subCategory)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update sub-category" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const subcategoryId = parseInt(params.id)
    const subcategoryStringId = params.id

    // Check if any pages are using this subcategory
    // Note: Page.category is still a String in the schema for now
    const linkedPages = await prisma.page.findMany({
      where: { category: subcategoryStringId },
      select: { id: true, name: true }
    })

    if (linkedPages.length > 0) {
      const pageNames = linkedPages.map(p => p.name).join(', ')
      return NextResponse.json({
        error: `Cannot delete subcategory. It is linked to ${linkedPages.length} page(s): ${pageNames}. Please unlink the subcategory from these pages first.`
      }, { status: 400 })
    }

    await prisma.subCategory.delete({
      where: { id: subcategoryId },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete sub-category" }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const json = await req.json()
    const subCategory = await prisma.subCategory.update({
      where: { id: parseInt(params.id) },
      data: {
        parentSubCategoryId: json.parentSubCategoryId === null ? null : parseInt(json.parentSubCategoryId),
      },
    })
    return NextResponse.json(subCategory)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update sub-category hierarchy" }, { status: 500 })
  }
}
