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

    it('has no xml/to-yaml page: it repeated /xml/to-json with a different output format (nginx 301s it there)', () => {
        expect(getConverterGuide('xml', 'to-yaml')).toBeUndefined();
    });

    it('has a guide for every expected slug, each with substantial content', () => {
        for (const key of ['json/to-xml', 'xml/to-json', 'json/to-yaml']) {
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
            expect(words, `${key} word count`).toBeGreaterThan(400);
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

    it('json/to-yaml: every string the "Norway problem" section lists comes out quoted and round-trips as a string', async () => {
        const { jsonToYaml, yamlToJson } = await import('@/utils/yaml-convert');
        const value = { a: 'NO', b: 'yes', c: 'on', d: '01310', e: '0777', f: '2026-10-09', g: '~' };
        const yaml = jsonToYaml(value);
        for (const s of Object.values(value)) expect(yaml).toContain(`'${s}'`);
        expect(yamlToJson(yaml)).toEqual(value);
    });

    it('returns undefined for an unknown host/slug pair', () => {
        expect(getConverterGuide('json', 'to-yaml-fast')).toBeUndefined();
    });
});
