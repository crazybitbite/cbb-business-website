/**
 * Deletes ALL orders (and their items) and resets the id sequences,
 * so the next order starts fresh from #1.
 *
 * Usage (targets whichever DB the env file points at):
 *   node --env-file=.env.local scripts/clear-orders.mjs --yes   # db in .env.local
 *   node --env-file=.env scripts/clear-orders.mjs --yes         # db in .env
 *
 * The --yes flag is required — without it the script only reports what it
 * would delete.
 */
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()
const confirmed = process.argv.includes("--yes")

async function main() {
    const orderCount = await prisma.order.count()
    const itemCount = await prisma.orderItem.count()
    const dbHost = (process.env.DATABASE_URL || "").replace(/^.*@/, "").split("/")[0] || "unknown"

    console.log(`Database: ${dbHost}`)
    console.log(`Found ${orderCount} orders with ${itemCount} items.`)

    if (!confirmed) {
        console.log("\nDry run — nothing deleted. Re-run with --yes to delete everything and reset order numbering.")
        return
    }

    await prisma.orderItem.deleteMany()
    await prisma.order.deleteMany()

    // Reset auto-increment sequences so the next order is #1
    await prisma.$executeRawUnsafe(`ALTER SEQUENCE "Order_id_seq" RESTART WITH 1`)
    await prisma.$executeRawUnsafe(`ALTER SEQUENCE "OrderItem_id_seq" RESTART WITH 1`)

    console.log(`\nDeleted ${orderCount} orders and ${itemCount} items. Order numbering restarts at #1.`)
}

main()
    .catch((e) => {
        console.error("Failed:", e)
        process.exitCode = 1
    })
    .finally(() => prisma.$disconnect())
