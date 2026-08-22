import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

/**
 * Convert epoch timestamp (BigInt, number, or string in seconds) to Date object
 * @param timestamp - Epoch timestamp in seconds (from database) or as string
 * @returns Date object or null
 */
export function epochToDate(timestamp: number | bigint | string | null | undefined): Date | null {
    if (timestamp === null || timestamp === undefined || timestamp === '') {
        return null
    }
    try {
        // Handle string (from JSON serialization of bigint)
        const seconds = typeof timestamp === 'string' ? parseInt(timestamp, 10) : typeof timestamp === 'bigint' ? Number(timestamp) : timestamp
        if (isNaN(seconds)) return null
        return new Date(seconds * 1000)
    } catch {
        return null
    }
}

