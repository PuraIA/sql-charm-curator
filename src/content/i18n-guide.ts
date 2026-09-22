/**
 * Shared machinery for translating the /sql, /json and /xml guide pages.
 *
 * English is the base language every content module (sql-dialects.ts, json-guides.ts,
 * ...) is written in directly — it's what gets prerendered (scripts/prerender.mjs
 * always renders in English; see PRERENDER_LANG) and what src/seo/routes.ts uses for
 * <title>/<meta> regardless of the visitor's language. Nothing about that changes.
 *
 * What changes: after hydration, a visitor who has picked a different language from
 * the header's language switcher now sees the guide *content* (prose, not code) in
 * that language too, not just the surrounding UI chrome. Each content module adds a
 * `translations: Record<Slug, Partial<Record<ExtraLocale, Translation>>>` map, and its
 * *GuideContent.tsx renderer calls `localize()` to overlay the active language's
 * translation onto the English base before rendering.
 *
 * A translation is always *partial*, field by field: a missing field — or a missing
 * language entry entirely — falls back to the English base rather than rendering
 * empty. That's a deliberate safety net, not an expected steady state; every field
 * this session adds a translation for is meant to be complete, and
 * i18n-guide-coverage.test.ts (per content module) checks that it actually is.
 *
 * Code is never part of a translation: sample queries/documents, formatter output, and
 * the `code` on a quirk/section are language-independent and always come from the
 * English base, because they were verified against the real formatter/parser in that
 * language and translating them would invalidate that check.
 */

export const EXTRA_LOCALES = ['pt', 'es', 'de', 'fr', 'zh', 'ja'] as const;
export type ExtraLocale = (typeof EXTRA_LOCALES)[number];

/** i18next resolves e.g. "pt-BR" down to "pt" (nonExplicitSupportedLngs); this does the same for a raw i18n.language value. */
export function toExtraLocale(language: string): ExtraLocale | null {
    const base = language.split('-')[0].toLowerCase();
    return (EXTRA_LOCALES as readonly string[]).includes(base) ? (base as ExtraLocale) : null;
}

export interface SectionTranslation {
    heading: string;
    body: string[];
}

export interface FaqTranslation {
    q: string;
    a: string;
}

function pick<T>(base: T, override: T | undefined): T {
    return override ?? base;
}

/** Overlays a translated string array onto the base, element by element (missing entries fall back). */
export function mergeArray(base: string[], override: string[] | undefined): string[] {
    if (!override) return base;
    return base.map((value, i) => override[i] ?? value);
}

/** Overlays translated {heading, body} onto base sections that may also carry a `code` field. */
export function mergeSections<S extends { heading: string; body: string[] }>(
    base: S[],
    override: SectionTranslation[] | undefined
): S[] {
    if (!override) return base;
    return base.map((section, i) => {
        const t = override[i];
        if (!t) return section;
        return { ...section, heading: pick(section.heading, t.heading), body: pick(section.body, t.body) };
    });
}

export function mergeFaq(base: FaqTranslation[], override: FaqTranslation[] | undefined): FaqTranslation[] {
    if (!override) return base;
    return base.map((entry, i) => {
        const t = override[i];
        if (!t) return entry;
        return { q: pick(entry.q, t.q), a: pick(entry.a, t.a) };
    });
}
