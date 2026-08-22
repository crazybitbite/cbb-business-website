/**
 * Generate a URL-safe slug from a string
 * @param text - The text to convert to a slug
 * @returns A URL-safe slug
 */
export function slugify(text: string): string {
    return text
        .toLowerCase()
        .trim()
        // Replace spaces with hyphens
        .replace(/\s+/g, '-')
        // Remove special characters except hyphens and forward slashes
        .replace(/[^\w\-\/]/g, '')
        // Replace multiple hyphens with single hyphen
        .replace(/\-\-+/g, '-')
        // Remove leading/trailing hyphens
        .replace(/^-+/, '')
        .replace(/-+$/, '')
}

/**
 * Validate a slug format
 * @param slug - The slug to validate
 * @returns True if valid, false otherwise
 */
export function isValidSlug(slug: string): boolean {
    // Allow alphanumeric, hyphens, and forward slashes
    // Must not start or end with hyphen
    // Must not have consecutive hyphens
    const slugRegex = /^[a-z0-9]+(?:(?:\/|-)[a-z0-9]+)*$/
    return slugRegex.test(slug)
}
