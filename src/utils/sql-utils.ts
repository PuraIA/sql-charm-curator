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
  let lines = sql.split('\n');
  let resultLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trimEnd();
    let nextLine = lines[i + 1]?.trim() || '';

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
