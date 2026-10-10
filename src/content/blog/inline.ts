/** `code` or [label](href) — the only inline syntax blog text supports (see <InlineText />). */
export const INLINE_TOKEN = /`([^`]+)`|\[([^\]]+)\]\(([^)\s]+)\)/g;

/** Every [label](href) target in a piece of blog text — used by tests to check internal links. */
export function linkTargets(text: string): string[] {
    return [...text.matchAll(INLINE_TOKEN)].filter(m => m[3] !== undefined).map(m => m[3]);
}
