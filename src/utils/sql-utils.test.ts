import { describe, expect, it } from 'vitest';
import { compactParenthesesFormat, superCompactSQL, compactWhereClauses } from './sql-utils';

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
