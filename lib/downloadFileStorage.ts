import { prisma } from "@/lib/prisma"

// Vercel's request body limit is ~4.5MB; base64 inflates by ~33%
export const MAX_DOWNLOAD_FILE_BYTES = 3 * 1024 * 1024

/**
 * Persist a base64 data-URL upload as a DownloadFile row.
 * Returns the new file id, or null when the payload isn't a valid data URL.
 */
export async function storeDownloadFile(dataUrl: string, fileName?: string): Promise<number | null> {
    const match = /^data:([^;,]+);base64,(.+)$/.exec(dataUrl)
    if (!match) return null

    const buffer = Buffer.from(match[2], "base64")
    if (buffer.length === 0 || buffer.length > MAX_DOWNLOAD_FILE_BYTES) return null

    const file = await prisma.downloadFile.create({
        data: {
            fileName: fileName?.trim() || "download",
            mimeType: match[1],
            size: buffer.length,
            data: buffer,
        },
    })
    return file.id
}

/** Delete a stored file, ignoring failures (row may already be gone). */
export async function deleteDownloadFile(id: number | null | undefined) {
    if (!id) return
    try {
        await prisma.downloadFile.delete({ where: { id } })
    } catch {
        // already deleted — nothing to do
    }
}
