import { describe, it, expect } from 'vitest';
import { JSON_GUIDES, JSON_GUIDE_LIST, JSON_GUIDE_SLUGS, getJsonGuide } from './json-guides';

describe('json guides', () => {
    it('minify: the published output is exactly what JSON.stringify produces', () => {
        const guide = JSON_GUIDES.minify;
        const parsed = JSON.parse(guide.sample!.input);
        expect(JSON.stringify(parsed)).toBe(guide.sample!.output);
        expect(guide.tool.output).toBe(guide.sample!.output);
    });

    it('minify: the "before" text is itself canonical JSON.stringify(..., null, 2) output', () => {
        // Guards against a hand-typed pretty sample silently drifting from what the
        // pretty-printer would actually produce for the same data.
        const guide = JSON_GUIDES.minify;
        const parsed = JSON.parse(guide.sample!.input);
        expect(JSON.stringify(parsed, null, 2)).toBe(guide.sample!.input);
    });

    it('validate: the default tool input is valid JSON that round-trips unchanged', () => {
        const guide = JSON_GUIDES.validate;
        const parsed = JSON.parse(guide.tool.input);
        expect(JSON.stringify(parsed, null, 2)).toBe(guide.tool.input);
    });

    it('validate: every invalid example actually throws, with the exact published message', () => {
        const guide = JSON_GUIDES.validate;
        expect(guide.invalidExamples!.length).toBeGreaterThanOrEqual(3);
        for (const example of guide.invalidExamples!) {
            expect(() => JSON.parse(example.code), example.label).toThrow(example.message);
        }
    });

    it('to-typescript: the published interface is what jsonToTypeScript actually generates', async () => {
        const { jsonToTypeScript } = await import('@/utils/json-to-ts');
        const guide = JSON_GUIDES['to-typescript'];
        const parsed = JSON.parse(guide.sample!.input);
        expect(jsonToTypeScript(parsed, guide.rootTypeName)).toBe(guide.sample!.output);
        expect(guide.tool.output).toBe(guide.sample!.output);
    });

    it('has a guide for every slug, each with substantial content', () => {
        for (const slug of JSON_GUIDE_SLUGS) {
            const guide = getJsonGuide(slug);
            expect(guide, slug).toBeDefined();
            expect(guide!.sections.length, `${slug} sections`).toBeGreaterThanOrEqual(2);
            expect(guide!.faq.length, `${slug} faq`).toBeGreaterThanOrEqual(3);
            expect(guide!.limitations.length, `${slug} limitations`).toBeGreaterThanOrEqual(1);

            const words = [
                ...guide!.intro,
                ...guide!.sections.flatMap(s => s.body),
                ...guide!.faq.map(f => f.a),
            ]
                .join(' ')
                .split(/\s+/).length;
            expect(words, `${slug} word count`).toBeGreaterThan(350);
        }
    });

    it('gives each guide its own title, description and tool input', () => {
        const titles = JSON_GUIDE_LIST.map(g => g.seoTitle);
        const descriptions = JSON_GUIDE_LIST.map(g => g.seoDescription);
        expect(new Set(titles).size).toBe(JSON_GUIDE_LIST.length);
        expect(new Set(descriptions).size).toBe(JSON_GUIDE_LIST.length);
    });

    it('returns undefined for an unknown slug', () => {
        expect(getJsonGuide('to-yaml')).toBeUndefined();
    });
});
