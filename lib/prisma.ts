import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

/**
 * On serverless (Vercel), every function instance gets its own Prisma pool.
 * The default pool size (~num_cpus * 2 + 1) multiplied across concurrent
 * lambdas exhausts Postgres connection limits fast ("too many connections").
 * Cap each instance to a single connection there.
 *
 * A `prisma+postgres://` URL (Prisma Postgres pooled/Accelerate connection)
 * is passed through untouched — pooling happens server-side there, and query
 * params would be invalid on that protocol.
 */
function getDatabaseUrl(): string | undefined {
    const url = process.env.DATABASE_URL
    if (!url || !process.env.VERCEL) return url
    if (url.startsWith("prisma+postgres://") || url.includes("connection_limit")) return url
    return `${url}${url.includes("?") ? "&" : "?"}connection_limit=1&pool_timeout=15`
}

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        datasources: { db: { url: getDatabaseUrl() } },
    })

// Cache on globalThis in every environment: prevents dev hot-reload leaks and
// duplicate clients if a warm serverless instance re-evaluates the module.
globalForPrisma.prisma = prisma
