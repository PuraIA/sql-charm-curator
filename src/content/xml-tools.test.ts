import { describe, it, expect } from 'vitest';
import { evaluateXPath, type XPathMatch } from '@/utils/xpath-lite';
import { XML_TOOL_GUIDES, XML_TOOL_SLUGS, getXmlToolGuide } from './xml-tools';

/** Narrows evaluateXPath's result to its node-list case, for tests that don't care about count(). */
function nodesOf(xml: string, expression: string): XPathMatch[] {
    const result = evaluateXPath(xml, expression);
    if (result.kind !== 'nodes') throw new Error(`expected a node-set result for "${expression}"`);
    return result.matches;
}

describe('xml-tools guides', () => {
    it('xpath: every worked example actually evaluates against the sample XML without throwing', () => {
        const guide = XML_TOOL_GUIDES.xpath;
        for (const example of guide.examples) {
            expect(
                () => evaluateXPath(guide.sampleXml, example.expression),
                example.expression
            ).not.toThrow();
        }
    });

    it('xpath: the specific claims each worked example makes are true', () => {
        const guide = XML_TOOL_GUIDES.xpath;
        const run = (expr: string) => nodesOf(guide.sampleXml, expr);

        expect(run('/bookstore/book')).toHaveLength(3);
        expect(run('//title')).toHaveLength(3);
        expect(run("/bookstore/book[@category='children']")).toHaveLength(1);
        expect(run('/bookstore/book[1]')[0].label).toContain('id="b1"');
        expect(run('/bookstore/book[last()]')[0].label).toContain('id="b3"');
        expect(run('/bookstore/book[1]/price/text()')).toEqual([
            { kind: 'text', label: 'text() of <price>', value: '30.00' },
        ]);
        expect(run('/bookstore/book[1]/@*').map(m => m.label)).toEqual(['@category', '@id']);
        expect(run('//title/..').every(m => m.label.startsWith('<book'))).toBe(true);
        expect(run("//title[contains(text(), 'Potter')]")).toHaveLength(1);
        expect(evaluateXPath(guide.sampleXml, 'count(/bookstore/book)')).toEqual({ kind: 'count', value: 3 });
    });

    it("xpath: the default expression loaded into the tool matches exactly one title", () => {
        const guide = XML_TOOL_GUIDES.xpath;
        expect(nodesOf(guide.sampleXml, guide.defaultExpression)).toHaveLength(1);
    });

    it('has a guide for every slug, each with substantial content', () => {
        for (const slug of XML_TOOL_SLUGS) {
            const guide = getXmlToolGuide(slug);
            expect(guide, slug).toBeDefined();
            expect(guide!.examples.length, `${slug} examples`).toBeGreaterThanOrEqual(6);
            expect(guide!.sections.length, `${slug} sections`).toBeGreaterThanOrEqual(2);
            expect(guide!.faq.length, `${slug} faq`).toBeGreaterThanOrEqual(3);
            expect(guide!.limitations.length, `${slug} limitations`).toBeGreaterThanOrEqual(1);

            const words = [
                ...guide!.intro,
                ...guide!.examples.map(e => e.explanation),
                ...guide!.sections.flatMap(s => s.body),
                ...guide!.faq.map(f => f.a),
            ]
                .join(' ')
                .split(/\s+/).length;
            expect(words, `${slug} word count`).toBeGreaterThan(400);
        }
    });

    it('returns undefined for an unknown slug', () => {
        expect(getXmlToolGuide('xslt')).toBeUndefined();
    });
});
