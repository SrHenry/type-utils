export function buildPath(...segments: (string | undefined)[]): string {
    return segments.filter(Boolean).join('')
}
