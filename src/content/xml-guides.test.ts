import { describe, it, expect } from 'vitest';
import { prettyPrintXml, minifyXml } from '@/utils/xml-utils';
import { XML_GUIDES, XML_GUIDE_LIST, XML_GUIDE_SLUGS, getXmlGuide } from './xml-guides';

describe('xml guides', () => {
    it('every tool.input is exactly what the live tool would produce for itself (idempotent)', () => {
        // XMLGuidePage seeds `initialFormattedOutput` with the same string as `tool.input`,
        // assuming pretty-printing an already-pretty document is a no-op. This is the check
        // that assumption relies on, for every guide.
        for (const guide of XML_GUIDE_LIST) {
            expect(prettyPrintXml(guide.tool.input), guide.slug).toBe(guide.tool.input);
        }
    });

    it('minify: the published output is exactly what minifyXml produces from the published input', () => {
        const guide = XML_GUIDES.minify;
        expect(minifyXml(guide.sample!.input)).toBe(guide.sample!.output);
        expect(guide.sample!.input).toBe(guide.tool.input);
    });

    it('has a guide for every slug, each with substantial content', () => {
        for (const slug of XML_GUIDE_SLUGS) {
            const guide = getXmlGuide(slug);
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

    it('gives each guide its own title and description', () => {
        const titles = XML_GUIDE_LIST.map(g => g.seoTitle);
        const descriptions = XML_GUIDE_LIST.map(g => g.seoDescription);
        expect(new Set(titles).size).toBe(XML_GUIDE_LIST.length);
        expect(new Set(descriptions).size).toBe(XML_GUIDE_LIST.length);
    });

    it('returns undefined for an unknown slug', () => {
        expect(getXmlGuide('to-json')).toBeUndefined();
    });
});
