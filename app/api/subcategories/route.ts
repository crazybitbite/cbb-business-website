import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

(BigInt.prototype as any).toJSON = function () {
  return this.toString()
}

export async function POST(request: Request) {
  try {
    const { categoryId, name, description, parentSubCategoryId } = await request.json()
    if (!categoryId || !name || !description) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }
    const count = await prisma.subCategory.count({ where: { categoryId: parseInt(categoryId) } })
    const subcategory = await prisma.subCategory.create({
      data: {
        name,
        description,
        categoryId: parseInt(categoryId),
        parentSubCategoryId: parentSubCategoryId ? parseInt(parentSubCategoryId) : null,
        order: count + 1
      }
    })
    return NextResponse.json(subcategory, { status: 201 })
  } catch (error) {
    console.error("Error creating sub-category:", error)
    return NextResponse.json({ error: "Failed to create sub-category", details: (error as Error).message }, { status: 500 })
  }
}

export async function GET() {
  try {
    const subcategories = await prisma.subCategory.findMany({ orderBy: { order: "asc" } })
    return NextResponse.json(subcategories)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch sub-categories" }, { status: 500 })
  }
}
