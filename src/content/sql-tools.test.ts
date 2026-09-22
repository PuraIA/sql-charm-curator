import { describe, it, expect } from 'vitest';
import { format } from 'sql-formatter';
import { diffLines } from '@/utils/line-diff';
import { getParamTypesForDialect } from '@/utils/sql-utils';
import { SQL_TOOL_GUIDES, SQL_TOOL_SLUGS, getSqlToolGuide } from './sql-tools';

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

describe('sql-tools guides', () => {
    it('diff: the published "formatted" pair is exactly what sql-formatter produces', () => {
        const guide = SQL_TOOL_GUIDES.diff;
        const paramTypes = getParamTypesForDialect(guide.dialect);
        const before = format(guide.sample.before, { language: guide.dialect, ...FORMAT_OPTIONS, paramTypes });
        const after = format(guide.sample.after, { language: guide.dialect, ...FORMAT_OPTIONS, paramTypes });
        expect(before).toBe(guide.formatted.before);
        expect(after).toBe(guide.formatted.after);
    });

    it('diff: formatting the same query on both sides produces an empty diff', () => {
        const guide = SQL_TOOL_GUIDES.diff;
        const ops = diffLines(guide.formatted.before.split('\n'), guide.formatted.before.split('\n'));
        expect(ops.every(op => op.type === 'equal')).toBe(true);
    });

    it('diff: the published before/after isolates exactly the added WHERE/ORDER BY/LIMIT clauses', () => {
        const guide = SQL_TOOL_GUIDES.diff;
        const ops = diffLines(guide.formatted.before.split('\n'), guide.formatted.after.split('\n'));
        // The only "removal" is the old trailing semicolon line — it moves onto the new
        // LIMIT line — everything else in common (SELECT, FROM, the join, GROUP BY) is
        // untouched by the diff.
        expect(ops.filter(op => op.type === 'remove').map(op => op.value)).toEqual(['  u.name;']);
        expect(ops.filter(op => op.type === 'add').map(op => op.value)).toEqual([
            'WHERE',
            "  u.status = 'active'",
            '  u.name',
            'ORDER BY',
            '  orders DESC',
            'LIMIT',
            '  20;',
        ]);
    });

    it('has a guide for every slug, each with substantial content', () => {
        for (const slug of SQL_TOOL_SLUGS) {
            const guide = getSqlToolGuide(slug);
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
            expect(words, `${slug} word count`).toBeGreaterThan(300);
        }
    });

    it('returns undefined for an unknown slug', () => {
        expect(getSqlToolGuide('explain')).toBeUndefined();
    });
});
