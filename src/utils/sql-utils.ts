// Utility to compact parenthesized expressions
export const compactParenthesesFormat = (sql: string): string => {
  let result = sql.replace(/\(\s*\n\s*/g, '(');
  result = result.replace(/\s*\n\s*\)/g, ')');
  // Combine multiple lines inside parentheses if they are relatively short
  result = result.replace(/\(\s*([^)]+?)\s*\)/gs, (match, content) => {
    const joined = content.replace(/\s*\n\s*/g, ' ');
    return joined.length < 100 ? `(${joined})` : match;
  });
  return result;
};

// Advanced compactor to reduce line count
export const superCompactSQL = (sql: string): string => {
  const lines = sql.split('\n');
  const resultLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trimEnd();
    const nextLine = lines[i + 1]?.trim() || '';

    // 1. Join comma-separated lists (SELECT, GROUP BY, etc.)
    // If current line ends with a comma and the result isn't too long
    if (line.endsWith(',') && nextLine && !nextLine.startsWith('--')) {
      const prospectiveLine = line + ' ' + nextLine;
      if (prospectiveLine.trim().length < 120) {
        lines[i + 1] = prospectiveLine;
        continue;
      }
    }

    // 2. Join keywords with their first argument (SELECT col1, FROM table, etc.)
    const keywordsToJoin = ['SELECT', 'FROM', 'WHERE', 'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'OFFSET', 'WITH', 'AS'];
    let joinedKeyword = false;
    for (const kw of keywordsToJoin) {
      if (line.trim().toUpperCase() === kw && nextLine && !nextLine.startsWith('--') && !keywordsToJoin.some(k => nextLine.toUpperCase().startsWith(k))) {
        const prospectiveLine = line + ' ' + nextLine;
        if (prospectiveLine.trim().length < 120) {
          lines[i + 1] = prospectiveLine;
          joinedKeyword = true;
          break;
        }
      }
    }
    if (joinedKeyword) continue;

    // 3. Join JOIN clauses with ON and subsequent ANDs
    if ((line.toUpperCase().includes('JOIN') || line.toUpperCase().startsWith('AND ') || line.toUpperCase().startsWith('ON ')) &&
      nextLine && (nextLine.toUpperCase().startsWith('ON ') || nextLine.toUpperCase().startsWith('AND '))) {
      const prospectiveLine = line + ' ' + nextLine;
      if (prospectiveLine.trim().length < 120) {
        lines[i + 1] = prospectiveLine;
        continue;
      }
    }

    resultLines.push(line);
  }

  // Final pass for parentheses
  return compactParenthesesFormat(resultLines.join('\n'));
};

export const compactWhereClauses = (sql: string): string => {
  return superCompactSQL(sql);
};

// ---------------------------------------------------------------------------------
// Shared with SQLFormatter.tsx and SQLDiff.tsx, so the two never drift out of sync on
// which placeholder syntax each dialect actually uses.
// ---------------------------------------------------------------------------------
import type { Dialect } from '@/components/SQLFormatter';
import type { FormatOptionsWithLanguage } from 'sql-formatter';

/** Parameter-placeholder syntax sql-formatter should recognize for each dialect. */
export function getParamTypesForDialect(dialect: Dialect): FormatOptionsWithLanguage['paramTypes'] {
  switch (dialect) {
    case 'postgresql':
      return { named: [':'], positional: true, numbered: ['$'] };
    case 'plsql':
      return { named: [':'], positional: false };
    case 'mysql':
      return { positional: true };
    case 'transactsql':
      return { positional: false };
    case 'bigquery':
      return { positional: true };
    default:
      return {};
  }
}

export interface SqlFormatOptions {
  dialect: Dialect;
  keywordCase: 'preserve' | 'upper' | 'lower';
  dataTypeCase: 'preserve' | 'upper' | 'lower';
  functionCase: 'preserve' | 'upper' | 'lower';
  identifierCase: 'preserve' | 'upper' | 'lower';
  indentStyle: 'standard' | 'tabularLeft' | 'tabularRight';
  logicalOperatorNewline: 'before' | 'after';
  tabWidth: number;
  useTabs: boolean;
  expressionWidth: number;
  linesBetweenQueries: number;
  denseOperators: boolean;
  newlineBeforeSemicolon: boolean;
}

export interface SqlFormatResult {
  formatted: string;
  /** True if the full option set failed and a reduced or fully generic pass was used instead. */
  usedFallback: 'full' | 'reduced' | 'generic';
}

/**
 * Formats SQL with the given options, falling back to a reduced option set and then to
 * plain "sql" as sql-formatter's own dialect grammars occasionally reject syntax a more
 * permissive pass accepts — the same three-step fallback SQLFormatter.tsx uses
 * interactively, extracted here so SQLDiff.tsx doesn't reimplement it.
 *
 * Throws only if even the fully generic pass fails, meaning the input isn't SQL
 * sql-formatter can parse at all.
 */
export async function formatSqlWithFallback(sql: string, options: SqlFormatOptions): Promise<SqlFormatResult> {
  const { format } = await import('sql-formatter');
  const paramTypes = getParamTypesForDialect(options.dialect);

  try {
    return { formatted: format(sql, { ...options, paramTypes }), usedFallback: 'full' };
  } catch {
    try {
      return {
        formatted: format(sql, { language: options.dialect, keywordCase: options.keywordCase, tabWidth: options.tabWidth, paramTypes }),
        usedFallback: 'reduced',
      };
    } catch {
      // Lets a genuine parse failure (not SQL at all) propagate to the caller.
      return {
        formatted: format(sql, { language: 'sql', keywordCase: options.keywordCase, tabWidth: options.tabWidth }),
        usedFallback: 'generic',
      };
    }
  }
}
