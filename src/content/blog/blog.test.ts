import { describe, it, expect } from 'vitest';
import { format } from 'sql-formatter';
import { BLOG_POSTS, getBlogPost, readingMinutes } from './index';
import { linkTargets } from './inline';
import { EDGE_CASES } from './posts/sql-formatter-edge-cases';
import { CONVENTION_OUTPUTS } from './posts/xml-to-json-conventions';
import { XPATH_EXAMPLES, XPATH_SAMPLE_XML } from './posts/scoped-xpath-evaluator';
import { evaluateXPath } from '@/utils/xpath-lite';
import { PRERENDER_ROUTES } from '@/seo/routes';

function proseWords(slug: string): number {
    const post = getBlogPost(slug)!;
    return post.blocks
        .flatMap(b => (b.type === 'list' ? b.items : b.type === 'code' ? [] : [b.text]))
        .join(' ')
        .split(/\s+/).length;
}

describe('blog posts', () => {
    it('have unique slugs and titles, valid dates and a real description', () => {
        expect(new Set(BLOG_POSTS.map(p => p.slug)).size).toBe(BLOG_POSTS.length);
        expect(new Set(BLOG_POSTS.map(p => p.title)).size).toBe(BLOG_POSTS.length);
        for (const post of BLOG_POSTS) {
            expect(post.published, post.slug).toMatch(/^\d{4}-\d{2}-\d{2}$/);
            expect(Number.isNaN(Date.parse(post.published)), post.slug).toBe(false);
            expect(post.description.length, post.slug).toBeGreaterThan(80);
        }
    });

    it('are long enough to stand on their own, not stubs', () => {
        for (const post of BLOG_POSTS) {
            expect(proseWords(post.slug), post.slug).toBeGreaterThan(800);
            expect(readingMinutes(post), post.slug).toBeGreaterThanOrEqual(4);
        }
    });

    it('do not share a structure: no two posts have the same sequence of headings', () => {
        const outlines = BLOG_POSTS.map(p => p.blocks.filter(b => b.type === 'h2').map(b => (b as { text: string }).text).join('|'));
        expect(new Set(outlines).size).toBe(BLOG_POSTS.length);
    });

    it('only link to pages that exist on the site', () => {
        for (const post of BLOG_POSTS) {
            const internal = [
                ...post.blocks.flatMap(b => (b.type === 'list' ? b.items : b.type === 'code' ? [] : [b.text])).flatMap(linkTargets),
                ...post.relatedTools.map(t => t.path),
            ].filter(href => href.startsWith('/'));
            for (const href of internal) expect(PRERENDER_ROUTES, `${post.slug} -> ${href}`).toContain(href);
        }
    });
});

describe('sql-formatter-edge-cases: every claim matches what sql-formatter does', () => {
    it('TOP (3) WITH TIES is split, with WITH read as a CTE keyword', () => {
        expect(EDGE_CASES.withTies.output).toContain('TOP (3)\nWITH\n  ties');
    });

    it('dropping the parentheses does not avoid the split', () => {
        const out = format('select top 3 with ties name, score from players order by score desc;', { language: 'transactsql', keywordCase: 'upper' });
        expect(out).toContain('TOP 3\nWITH\n  ties');
    });

    it('the sql-formatter-disable region passes through verbatim and formatting resumes after it', () => {
        expect(EDGE_CASES.withTiesDisabled.output).toContain('select top (3) with ties name, score from players order by score desc;');
        expect(EDGE_CASES.withTiesDisabled.output).toContain('SELECT\n  a\nFROM\n  b;');
    });

    it('DISTINCT ON is split across lines', () => {
        expect(EDGE_CASES.distinctOn.output).toContain('SELECT DISTINCT\n  ON (customer_id)');
    });

    it('Oracle: name is upper-cased as a keyword, rows stays lower case', () => {
        expect(EDGE_CASES.oracleName.output).toContain('  NAME');
        expect(EDGE_CASES.oracleName.output).toContain('25 rows ONLY');
    });

    it('Oracle: keyword casing Preserve leaves name as typed', () => {
        const out = format('select id, name from employees order by name;', { language: 'plsql', keywordCase: 'preserve', identifierCase: 'preserve' });
        expect(out).toContain('  name');
        expect(out).not.toContain('NAME');
    });

    it('MySQL: INTERVAL keeps the case it was typed in', () => {
        expect(EDGE_CASES.interval.output).toContain('interval 30 day');
        expect(EDGE_CASES.intervalTypedUpper.output).toContain('INTERVAL 30 DAY');
    });

    it('T-SQL MERGE: using stays lower case on the target line, WHEN MATCHED gets its own line', () => {
        expect(EDGE_CASES.mergeUsing.output).toContain('dbo.stock AS t using dbo.incoming');
        expect(EDGE_CASES.mergeUsing.output).toContain('\nWHEN MATCHED THEN');
    });

    it('BigQuery: _table_suffix is left as typed', () => {
        expect(EDGE_CASES.tableSuffix.output).toContain('_table_suffix BETWEEN');
    });
});

describe('xml-to-json-conventions: every claim matches the converter', () => {
    it('attributes get @, text moves under #text when there is anything else', () => {
        expect(CONVENTION_OUTPUTS.attrAndText).toEqual({ book: { '@id': '7', '@lang': 'en', '#text': 'Dune' } });
    });

    it('one <book> is a string, two are an array — the shape depends on the count', () => {
        expect(CONVENTION_OUTPUTS.oneBook).toEqual({ shelf: { book: 'Dune' } });
        expect(CONVENTION_OUTPUTS.twoBooks).toEqual({ shelf: { book: ['Dune', 'Emma'] } });
    });

    it('mixed content keeps text and element but loses their relative order', () => {
        expect(CONVENTION_OUTPUTS.mixed).toEqual({ p: { '#text': 'Hello !', b: 'world' } });
        expect(CONVENTION_OUTPUTS.mixedBackToXml).toContain('Hello !');
    });

    it('values stay strings, and YAML quotes the numeric-looking one', () => {
        expect(CONVENTION_OUTPUTS.price).toEqual({ price: { '@currency': 'BRL', '#text': '129.90' } });
        expect(CONVENTION_OUTPUTS.priceYaml).toContain("'129.90'");
    });
});

describe('scoped-xpath-evaluator: every example matches the evaluator', () => {
    const count = (expr: string) => {
        const result = evaluateXPath(XPATH_SAMPLE_XML, expr);
        if (result.kind !== 'nodes') throw new Error('expected nodes');
        return result.matches;
    };

    it('an absolute path starts at the document node', () => {
        expect(count(XPATH_EXAMPLES.absolute)).toHaveLength(2);
    });

    it('a relative path from the document finds nothing', () => {
        expect(count(XPATH_EXAMPLES.relativeFromDocument)).toHaveLength(0);
    });

    it('@category reads the current node, //@category searches descendants', () => {
        const own = count(XPATH_EXAMPLES.ownAttribute);
        expect(own).toHaveLength(1);
        expect(own[0]).toMatchObject({ kind: 'attribute', value: 'cooking' });
        expect(count(XPATH_EXAMPLES.descendantAttributes)).toHaveLength(2);
    });

    it('predicate order matters when one predicate is positional', () => {
        expect(count(XPATH_EXAMPLES.filterThenPosition)).toHaveLength(1);
        expect(count(XPATH_EXAMPLES.positionThenFilter)).toHaveLength(0);
    });

    it('a path with no matches is an empty result, not an error', () => {
        expect(count('/bookstore/nonexistent')).toHaveLength(0);
    });
});
