import { describe, expect, it } from 'vitest';
import { compactParenthesesFormat, superCompactSQL, compactWhereClauses, formatSqlWithFallback } from './sql-utils';
import { dialectLabels, sampleQueries, type Dialect } from '@/components/SQLFormatter';
import { DIALECT_GUIDE_LIST } from '@/content/sql-dialects';

describe('compactParenthesesFormat', () => {
  it('joins a short parenthesized expression split across lines', () => {
    const input = 'WHERE (\n  a = 1\n)';
    expect(compactParenthesesFormat(input)).toBe('WHERE (a = 1)');
  });

  it('preserves the internal line break when the joined content would be too long', () => {
    const chunk = 'x'.repeat(60);
    const input = `(\n  ${chunk},\n  ${chunk}\n)`;
    expect(compactParenthesesFormat(input)).toBe(`(${chunk},\n  ${chunk})`);
  });
});

describe('superCompactSQL', () => {
  it('joins a keyword with its first argument on the next line', () => {
    const input = 'SELECT\n  col1';
    expect(superCompactSQL(input)).toBe('SELECT col1');
  });

  it('joins comma-separated columns across lines', () => {
    const input = 'SELECT col1,\n  col2';
    expect(superCompactSQL(input)).toBe('SELECT col1, col2');
  });

  it('does not join a line with a trailing comment', () => {
    const input = 'SELECT col1,\n  -- comment\n  col2';
    expect(superCompactSQL(input)).toBe('SELECT col1,\n  -- comment\n  col2');
  });
});

describe('compactWhereClauses', () => {
  it('delegates to superCompactSQL', () => {
    const input = 'SELECT col1,\n  col2';
    expect(compactWhereClauses(input)).toBe(superCompactSQL(input));
  });
});

describe('formatSqlWithFallback', () => {
  const OPTIONS = {
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

  it('regression: the full pass uses the selected dialect, not the generic grammar', async () => {
    const result = await formatSqlWithFallback('select x::int from t;', { ...OPTIONS, dialect: 'postgresql' });
    expect(result.usedFallback).toBe('full');
    expect(result.formatted).toContain('x::INT');
  });

  it('regression: PostgreSQL keeps the JSONB ?| and ?& operators intact', async () => {
    const { formatted } = await formatSqlWithFallback("select d ?| array['a'], d ?& array['b'] from t;", {
      ...OPTIONS,
      dialect: 'postgresql',
    });
    expect(formatted).toContain("d ?| ARRAY['a']");
    expect(formatted).toContain("d ?& ARRAY['b']");
  });

  it.each(Object.keys(dialectLabels) as Dialect[])('%s: its sample query formats on the full pass', async dialect => {
    const result = await formatSqlWithFallback(sampleQueries[dialect], { ...OPTIONS, dialect });
    expect(result.usedFallback).toBe('full');
    expect(result.formatted.split('\n').length).toBeGreaterThan(3);
  });

  it.each(DIALECT_GUIDE_LIST.map(g => [g.slug, g] as const))(
    '%s: the live tool produces exactly the verified output its page shows',
    async (_slug, guide) => {
      const result = await formatSqlWithFallback(guide.sample.messy, { ...OPTIONS, dialect: guide.dialect });
      expect(result.usedFallback).toBe('full');
      expect(result.formatted).toBe(guide.sample.formatted);
    }
  );
});
