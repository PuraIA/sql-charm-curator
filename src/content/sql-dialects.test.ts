import { describe, it, expect } from 'vitest';
import { format } from 'sql-formatter';
import { DIALECT_GUIDE_LIST, DIALECT_SLUGS, getDialectGuide } from './sql-dialects';

/** The options SQLDialectPage renders the tool with. Kept in sync by these tests. */
const FORMAT_OPTIONS = {
    keywordCase: 'upper',
    dataTypeCase: 'upper',
    functionCase: 'upper',
    identifierCase: 'preserve',
    indentStyle: 'standard',
    logicalOperatorNewline: 'before',
    tabWidth: 2,
    useTabs: false,
    expressionWidth: 120,
    linesBetweenQueries: 2,
    denseOperators: false,
    newlineBeforeSemicolon: false,
} as const;

describe('dialect guides', () => {
    it.each(DIALECT_GUIDE_LIST.map(g => [g.slug, g] as const))(
        '%s: the published output is what the formatter actually produces',
        (_slug, guide) => {
            const actual = format(guide.sample.messy, {
                language: guide.dialect,
                ...FORMAT_OPTIONS,
            });
            expect(actual).toBe(guide.sample.formatted);
        }
    );

    it.each(DIALECT_GUIDE_LIST.map(g => [g.slug, g] as const))(
        '%s: every inline code block is valid SQL for this dialect',
        (_slug, guide) => {
            const blocks = guide.quirks.flatMap(q => (q.code ? [q.code] : []));
            for (const block of blocks) {
                expect(() => format(block, { language: guide.dialect })).not.toThrow();
            }
        }
    );

    it('has a guide for every slug, each with substantial content', () => {
        for (const slug of DIALECT_SLUGS) {
            const guide = getDialectGuide(slug);
            expect(guide, slug).toBeDefined();
            expect(guide!.quirks.length, `${slug} quirks`).toBeGreaterThanOrEqual(4);
            expect(guide!.faq.length, `${slug} faq`).toBeGreaterThanOrEqual(3);
            expect(guide!.limitations.length, `${slug} limitations`).toBeGreaterThanOrEqual(1);

            const words = [
                ...guide!.intro,
                ...guide!.quirks.flatMap(q => q.body),
                ...guide!.conventions.flatMap(c => c.body),
                ...guide!.faq.map(f => f.a),
            ]
                .join(' ')
                .split(/\s+/).length;
            // Enough to stand on its own as a page rather than as a stub.
            expect(words, `${slug} word count`).toBeGreaterThan(600);
        }
    });

    it('gives each dialect its own title, description and sample', () => {
        const titles = DIALECT_GUIDE_LIST.map(g => g.seoTitle);
        const descriptions = DIALECT_GUIDE_LIST.map(g => g.seoDescription);
        const samples = DIALECT_GUIDE_LIST.map(g => g.sample.messy);
        expect(new Set(titles).size).toBe(DIALECT_GUIDE_LIST.length);
        expect(new Set(descriptions).size).toBe(DIALECT_GUIDE_LIST.length);
        expect(new Set(samples).size).toBe(DIALECT_GUIDE_LIST.length);
    });

    it('returns undefined for an unknown slug', () => {
        expect(getDialectGuide('mongodb')).toBeUndefined();
    });
});
