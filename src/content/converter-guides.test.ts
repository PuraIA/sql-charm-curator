import { describe, it, expect } from 'vitest';
import { convert } from '@/utils/format-convert';
import { CONVERTER_GUIDES, getConverterGuide } from './converter-guides';

describe('converter guides', () => {
    it.each(Object.entries(CONVERTER_GUIDES))(
        '%s: the published output is exactly what convert() produces from the published input',
        (_key, guide) => {
            const result = convert(guide.sample.input, guide.fromFormat, guide.toFormat);
            expect(result.error).toBeNull();
            expect(result.output).toBe(guide.sample.output);
        }
    );

    it('json/to-xml and xml/to-json use the same underlying pair, in opposite directions', () => {
        const jsonToXml = CONVERTER_GUIDES['json/to-xml'];
        const xmlToJson = CONVERTER_GUIDES['xml/to-json'];
        expect(jsonToXml.fromFormat).toBe('json');
        expect(jsonToXml.toFormat).toBe('xml');
        expect(xmlToJson.fromFormat).toBe('xml');
        expect(xmlToJson.toFormat).toBe('json');
    });

    it('xml/to-yaml shares its sample XML input with xml/to-json, so the two pages are directly comparable', () => {
        expect(CONVERTER_GUIDES['xml/to-yaml'].sample.input).toBe(CONVERTER_GUIDES['xml/to-json'].sample.input);
    });

    it('has a guide for every expected slug, each with substantial content', () => {
        for (const key of ['json/to-xml', 'xml/to-json', 'json/to-yaml', 'xml/to-yaml']) {
            const [host, slug] = key.split('/');
            const guide = getConverterGuide(host as 'json' | 'xml', slug);
            expect(guide, key).toBeDefined();
            expect(guide!.mapping.length, `${key} mapping`).toBeGreaterThanOrEqual(2);
            expect(guide!.faq.length, `${key} faq`).toBeGreaterThanOrEqual(3);
            expect(guide!.limitations.length, `${key} limitations`).toBeGreaterThanOrEqual(1);

            const words = [
                ...guide!.intro,
                ...guide!.mapping.flatMap(m => m.body),
                ...guide!.faq.map(f => f.a),
            ]
                .join(' ')
                .split(/\s+/).length;
            // Lower than the SQL/JSON/XML guides' floor: xml/to-yaml is honestly two
            // conversions run back to back (see its intro), so it defers most of its
            // mapping explanation to /xml/to-json rather than repeating it.
            expect(words, `${key} word count`).toBeGreaterThan(300);
        }
    });

    it('gives each guide its own title, description and sample', () => {
        const guides = Object.values(CONVERTER_GUIDES);
        expect(new Set(guides.map(g => g.seoTitle)).size).toBe(guides.length);
        expect(new Set(guides.map(g => g.seoDescription)).size).toBe(guides.length);
        expect(new Set(guides.map(g => g.sample.input)).size).toBeLessThanOrEqual(guides.length);
    });

    it('json/to-yaml: the colon-space and multi-line claims in "mapping" are true of the real dump()', async () => {
        const { jsonToYaml } = await import('@/utils/yaml-convert');
        expect(jsonToYaml({ note: 'see: readme' })).toBe("note: 'see: readme'\n");
        expect(jsonToYaml({ multi: 'line1\nline2' })).toBe('multi: |-\n  line1\n  line2\n');
    });

    it('returns undefined for an unknown host/slug pair', () => {
        expect(getConverterGuide('json', 'to-yaml-fast')).toBeUndefined();
    });
});
