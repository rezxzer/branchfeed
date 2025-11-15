/**
 * Path Sharing Utilities
 * 
 * Functions for encoding/decoding story paths to/from URL query parameters
 */

/**
 * Encode a path array to a URL-safe string
 * @param path - Array of path choices ('A' | 'B')
 * @returns Comma-separated string (e.g., "A,B,A") or empty string if path is empty
 */
export function encodePath(path: string[]): string {
  if (!path || path.length === 0) {
    return ''
  }
  
  // Filter out empty strings and join with commas
  return path
    .filter((p) => p && p.trim().length > 0)
    .map((p) => p.trim())
    .join(',')
}

/**
 * Decode a URL query parameter string to a path array
 * @param raw - Raw string from URL query parameter (can be null, undefined, or empty)
 * @returns Array of path choices, or empty array if input is invalid
 */
export function decodePath(raw: string | null | undefined): string[] {
  // Handle null, undefined, or empty string
  if (!raw || raw.trim().length === 0) {
    return []
  }
  
  // Split by comma, trim each part, and filter out empty strings
  return raw
    .split(',')
    .map((p) => p.trim())
    .filter((p) => p.length > 0)
}

