/**
 * Per-dialect reference material for the /sql/<dialect> pages.
 *
 * Each entry is written against the behaviour of the formatter this site actually
 * ships (sql-formatter), not against the dialect in the abstract. Every `sample` pair
 * was produced by running `messy` through the formatter with the page's default
 * options; src/content/sql-dialects.test.ts re-runs them so the published output can
 * never drift from what the tool does.
 *
 * `limitations` is deliberately part of the data model: the pages document what the
 * formatter gets wrong as well as what it gets right.
 */
import type { Dialect } from '@/components/SQLFormatter';
import type { GuideSection } from './guide-shared';
import {
    EXTRA_LOCALES,
    toExtraLocale,
    mergeArray,
    mergeSections,
    mergeFaq,
    type ExtraLocale,
    type SectionTranslation,
    type FaqTranslation,
} from './i18n-guide';
import { DIALECT_TRANSLATIONS_PT } from './i18n/sql-dialects.pt';
import { DIALECT_TRANSLATIONS_ES } from './i18n/sql-dialects.es';
import { DIALECT_TRANSLATIONS_DE } from './i18n/sql-dialects.de';
import { DIALECT_TRANSLATIONS_FR } from './i18n/sql-dialects.fr';
import { DIALECT_TRANSLATIONS_ZH } from './i18n/sql-dialects.zh';
import { DIALECT_TRANSLATIONS_JA } from './i18n/sql-dialects.ja';

export const DIALECT_SLUGS = ['postgresql', 'mysql', 't-sql', 'oracle-plsql', 'bigquery'] as const;
export type DialectSlug = (typeof DIALECT_SLUGS)[number];

/**
 * Translatable prose for one dialect guide. Deliberately excludes seoTitle/
 * seoDescription/seoKeywords (the prerendered <head> is always English; see
 * src/content/i18n-guide.ts) and anything code (sample, quirk.code) — only what a
 * reader sees as running text.
 */
export interface DialectGuideTranslation {
    h1?: string;
    tagline?: string;
    intro?: string[];
    quirks?: SectionTranslation[];
    limitations?: string[];
    conventions?: SectionTranslation[];
    faq?: FaqTranslation[];
}

export interface DialectGuide {
    slug: DialectSlug;
    /** Language id passed to sql-formatter. */
    dialect: Dialect;
    name: string;
    icon: string;
    tagline: string;
    seoTitle: string;
    seoDescription: string;
    seoKeywords: string;
    h1: string;
    intro: string[];
    sample: { messy: string; formatted: string };
    quirks: GuideSection[];
    limitations: string[];
    conventions: GuideSection[];
    faq: { q: string; a: string }[];
    /** ISO date, surfaced on the page and in structured data. */
    updated: string;
}

const UPDATED = '2026-09-21';

export const DIALECT_GUIDES: Record<DialectSlug, DialectGuide> = {
    // ---------------------------------------------------------------- PostgreSQL
    postgresql: {
        slug: 'postgresql',
        dialect: 'postgresql',
        name: 'PostgreSQL',
        icon: '🐘',
        tagline: 'Casts, JSONB operators and LATERAL joins, formatted without breaking them apart.',
        seoTitle: 'PostgreSQL Formatter - Format Postgres Queries Online',
        seoDescription:
            'Free online PostgreSQL formatter that understands :: casts, JSONB operators, LATERAL joins, FILTER clauses and $1 placeholders. Runs entirely in your browser.',
        seoKeywords:
            'postgresql formatter, postgres sql formatter, format postgresql query, jsonb formatter, pretty print postgres, postgres beautifier',
        h1: 'PostgreSQL Formatter',
        intro: [
            'Formatting PostgreSQL is rarely about the SELECT list. The difficulty is that Postgres has accumulated a set of operators that look like ordinary punctuation: :: for casts, -> and ->> for JSON access, @> for containment, ?| for key existence. A formatter that tokenises naively either splits these in half or mistakes the leading colon for a named parameter marker and breaks the line in the wrong place.',
            'This page runs the formatter with the PostgreSQL grammar selected and the parameter syntax set to named (:name) plus numbered ($1), which is what the Postgres wire protocol and most drivers use. The example below is loaded into the editor above, so you can change the options and watch the same query reformat.',
        ],
        sample: {
            messy: `select c.id, c.profile->>'name' as name, (c.profile->'prefs'->>'locale')::text as locale, o.total::numeric(12,2) as last_order, count(*) filter (where o.status = 'shipped') as shipped from customers c left join lateral (select * from orders o where o.customer_id = c.id order by o.created_at desc limit 1) o on true where c.profile @> '{"active": true}'::jsonb and c.created_at >= now() - interval '90 days' group by c.id, c.profile, o.total order by last_order desc nulls last;`,
            formatted: `SELECT
  c.id,
  c.profile ->> 'name' AS name,
  (c.profile -> 'prefs' ->> 'locale')::TEXT AS locale,
  o.total::NUMERIC(12, 2) AS last_order,
  COUNT(*) FILTER (
    WHERE
      o.status = 'shipped'
  ) AS shipped
FROM
  customers c
  LEFT JOIN LATERAL (
    SELECT
      *
    FROM
      orders o
    WHERE
      o.customer_id = c.id
    ORDER BY
      o.created_at DESC
    LIMIT
      1
  ) o ON TRUE
WHERE
  c.profile @> '{"active": true}'::JSONB
  AND c.created_at >= NOW() - INTERVAL '90 days'
GROUP BY
  c.id,
  c.profile,
  o.total
ORDER BY
  last_order DESC NULLS LAST;`,
        },
        quirks: [
            {
                heading: 'The :: cast operator versus :named parameters',
                body: [
                    'PostgreSQL uses :: for casting and : to introduce a named parameter, which puts two meanings on the same character. A formatter configured for a dialect where : is only a parameter marker will read the first colon of o.total::numeric as the start of a placeholder and break the expression.',
                    'Selecting the PostgreSQL grammar tells the parser that :: binds as a single cast operator, while :name and $1 remain placeholders. Casts stay attached to their expression, as in the (c.profile -> \'prefs\' ->> \'locale\')::TEXT line above.',
                ],
            },
            {
                heading: 'JSONB operators, including the ? family',
                body: [
                    'Postgres exposes JSON access through operators rather than functions: -> returns jsonb, ->> returns text, #> and #>> take a path array, and @> tests containment. They are handled as operators, so they keep their operands on the same line where the expression width allows.',
                    'The existence operators deserve a special mention. ? tests for a top-level key, ?| for any key in an array and ?& for all of them — and ? is also the positional placeholder used by JDBC and several other drivers. With the PostgreSQL grammar selected, these parse as operators:',
                ],
                code: `SELECT
  *
FROM
  t
WHERE
  t.data ? 'key'
  AND t.data ?| ARRAY['a', 'b'];`,
            },
            {
                heading: 'Dollar-quoted function bodies are left alone',
                body: [
                    'A PL/pgSQL body written between $$ or $tag$ delimiters is, to the SQL parser, one long string literal. The formatter preserves it exactly rather than reindenting it, which is the safe behaviour — reformatting the inside of a string would change the value stored in the catalog.',
                    'In practice this means CREATE FUNCTION statements come out with the surrounding SQL formatted and the body untouched on a single line. If you want the body itself formatted, format it separately as a standalone block and paste it back.',
                ],
                code: `CREATE FUNCTION f () returns INT AS $$ begin return 1; end; $$ language plpgsql;`,
            },
            {
                heading: 'FILTER, LATERAL and other clauses that nest',
                body: [
                    'COUNT(*) FILTER (WHERE ...) puts a full WHERE clause inside an aggregate call, and LEFT JOIN LATERAL puts a full subquery inside a join. Both are expanded as nested blocks, which is what makes the shape of the query readable — you can see at a glance that the lateral subquery is a per-row top-1 lookup.',
                    'ON CONFLICT ... DO UPDATE with a RETURNING clause is handled the same way, including references to the excluded pseudo-table.',
                ],
                code: `INSERT INTO
  t (id, v)
VALUES
  (1, 'a')
ON CONFLICT (id) DO UPDATE
SET
  v = excluded.v
RETURNING
  id;`,
            },
            {
                heading: 'Identifier folding: why Preserve is the right default',
                body: [
                    'PostgreSQL folds unquoted identifiers to lower case, so MyTable and mytable are the same object, while "MyTable" in double quotes is a different one. That makes identifier case meaningful in a way it is not in most dialects.',
                    'The Identifier case option therefore defaults to Preserve. Changing it to Upper or Lower will rewrite quoted identifiers too, which can point a query at a table that does not exist. Keyword case is a separate setting, so you can still uppercase SELECT and FROM without touching your schema names.',
                ],
            },
        ],
        limitations: [
            'DISTINCT ON (col) is placed on the line after SELECT DISTINCT rather than kept with it. The output is valid SQL, but it reads less well than the rest.',
            'Inside a dollar-quoted body the formatter makes no changes at all, including the language plpgsql tail of a CREATE FUNCTION statement, which is left in the case you typed it.',
        ],
        conventions: [
            {
                heading: 'Keywords upper, identifiers untouched',
                body: [
                    'The most widely used Postgres style uppercases reserved words and leaves table and column names in the snake_case the schema was created with. That is the default configuration here: keyword, data type and function case set to Upper, identifier case set to Preserve.',
                ],
            },
            {
                heading: 'Prefer CTEs, and know that they are no longer fences',
                body: [
                    'Breaking a query into WITH blocks reads far better than nesting subqueries three deep, and since PostgreSQL 12 a plain CTE is inlined by the planner rather than materialised, so the readability no longer costs you a plan change. Add MATERIALIZED explicitly when you do want the old fencing behaviour.',
                    'The Lines between queries option controls the blank lines the formatter puts between statements, which is what keeps a migration script with several statements readable.',
                ],
            },
        ],
        faq: [
            {
                q: 'Does formatting change how PostgreSQL runs my query?',
                a: 'No. The parser discards whitespace and folds unquoted identifiers before planning, so the plan for a formatted query is identical to the plan for the same query on one line. Formatting is for the people reading the code.',
            },
            {
                q: 'Will it break my "CamelCase" quoted identifiers?',
                a: 'Not with the default settings. Identifier case is set to Preserve, so quoted identifiers come out exactly as you wrote them. Only change that setting if you are certain your schema uses unquoted, case-insensitive names throughout.',
            },
            {
                q: 'Can it format the body of a PL/pgSQL function?',
                a: 'The body between $$ delimiters is a string literal as far as the SQL parser is concerned, so it is preserved verbatim rather than reindented. To format the body itself, paste just the block between the delimiters.',
            },
            {
                q: 'Are my queries sent anywhere?',
                a: 'No. The formatter is a JavaScript library running in your browser. Nothing is uploaded, which is what makes it safe to paste a query that contains production table and column names.',
            },
        ],
        updated: UPDATED,
    },

    // --------------------------------------------------------------------- MySQL
    mysql: {
        slug: 'mysql',
        dialect: 'mysql',
        name: 'MySQL & MariaDB',
        icon: '🐬',
        tagline: 'Backtick identifiers, index hints and two-argument LIMIT, preserved exactly.',
        seoTitle: 'MySQL Formatter - Format MySQL and MariaDB Queries Online',
        seoDescription:
            'Free online MySQL and MariaDB formatter. Handles backtick identifiers, index hints, GROUP_CONCAT, ON DUPLICATE KEY UPDATE and the two-argument LIMIT. Runs in your browser.',
        seoKeywords:
            'mysql formatter, mariadb formatter, format mysql query, mysql beautifier, pretty print mysql, sql formatter mysql online',
        h1: 'MySQL & MariaDB Formatter',
        intro: [
            'The recurring problem when formatting MySQL is identifiers. The reserved word list has grown with every release — rank, groups, window and system became reserved in 8.0 — so real schemas are full of backtick-quoted columns that only exist because the name collided with a keyword. A formatter that treats backticks as decoration, or that applies keyword casing to the text inside them, will produce SQL that no longer runs.',
            'Selecting the MySQL grammar keeps backtick quoting intact and parses the clauses that are specific to this dialect: index hints between the table and the join, the two-argument LIMIT, and the clause-like arguments of GROUP_CONCAT. The query below is loaded into the editor above.',
        ],
        sample: {
            messy:
                "select `u`.`id`, `u`.`order`, group_concat(distinct t.name order by t.name separator ', ') as tags, json_extract(u.meta, '$.plan') as plan from `users` `u` force index (idx_users_created) left join `user_tags` ut on ut.user_id = u.id left join `tags` t on t.id = ut.tag_id where u.created_at >= date_sub(now(), interval 30 day) group by `u`.`id`, `u`.`order` having count(t.id) > 0 order by u.created_at desc limit 40, 20;",
            formatted: `SELECT
  \`u\`.\`id\`,
  \`u\`.\`order\`,
  GROUP_CONCAT(
    DISTINCT t.name
    ORDER BY
      t.name SEPARATOR ', '
  ) AS tags,
  JSON_EXTRACT(u.meta, '$.plan') AS plan
FROM
  \`users\` \`u\` FORCE INDEX (idx_users_created)
  LEFT JOIN \`user_tags\` ut ON ut.user_id = u.id
  LEFT JOIN \`tags\` t ON t.id = ut.tag_id
WHERE
  u.created_at >= DATE_SUB(NOW(), interval 30 day)
GROUP BY
  \`u\`.\`id\`,
  \`u\`.\`order\`
HAVING
  COUNT(t.id) > 0
ORDER BY
  u.created_at DESC
LIMIT
  40, 20;`,
        },
        quirks: [
            {
                heading: 'Backtick identifiers and case sensitivity',
                body: [
                    'The column named `order` in the example is the common case: a perfectly reasonable business term that happens to be a reserved word. Backticks are the only thing keeping that query valid, so they are preserved and never re-cased.',
                    'This matters more in MySQL than in most databases because table name case sensitivity depends on the host filesystem. On Linux, Users and users are different tables; on macOS and Windows they usually are not. A formatter that uppercases identifiers will silently work in development and fail in production, which is why identifier case defaults to Preserve here.',
                ],
            },
            {
                heading: 'LIMIT with two arguments',
                body: [
                    'MySQL accepts both LIMIT count and LIMIT offset, count. The two-argument form has no equivalent in standard SQL — LIMIT 40, 20 means skip 40, return 20, which is the reverse of the order people expect from LIMIT ... OFFSET.',
                    'The formatter keeps both arguments on one line rather than splitting them across the comma, because splitting them makes an already confusing clause worse.',
                ],
            },
            {
                heading: 'Index hints sit between the table and the join',
                body: [
                    'FORCE INDEX, USE INDEX, IGNORE INDEX and STRAIGHT_JOIN attach to a table reference, so they appear after the alias and before the next JOIN. They are parsed as part of the table reference and stay on its line, which keeps the join list readable.',
                ],
            },
            {
                heading: 'Functions whose arguments contain clauses',
                body: [
                    'GROUP_CONCAT is not an ordinary function call: its argument list can contain DISTINCT, a full ORDER BY and a SEPARATOR. It is expanded as a nested block for that reason, with the ORDER BY indented inside the call.',
                ],
            },
            {
                heading: 'ON DUPLICATE KEY UPDATE, old and new form',
                body: [
                    'The upsert clause is recognised in both spellings — the long-standing VALUES(col) form and the row alias introduced in MySQL 8.0.20, which deprecated it. The alias form parses cleanly:',
                ],
                code: `INSERT INTO
  t (id, v)
VALUES
  (1, 'a') AS new
ON DUPLICATE KEY UPDATE
  v = new.v;`,
            },
            {
                heading: 'Three comment syntaxes, one of them a trap',
                body: [
                    'MySQL accepts # to end of line, /* */ blocks, and -- to end of line. The last one has a condition that catches people out: MySQL requires whitespace after the double dash, so --comment is not a comment and will usually be read as a subtraction followed by an identifier.',
                    'Comments are preserved in place. If a -- comment survives formatting but the query then fails to run, check for the missing space.',
                ],
            },
        ],
        limitations: [
            'In DATE_SUB(NOW(), interval 30 day) the INTERVAL keyword and its unit are left in the case you typed them, because they are parsed as part of the function argument rather than as top-level keywords. The query is valid either way.',
        ],
        conventions: [
            {
                heading: 'Quote only what needs quoting',
                body: [
                    'Backticks around every identifier is a habit picked up from GUI tools that generate them unconditionally. It is not wrong, but it adds noise — the example above quotes `users` and `order` and leaves the aliases bare, which is the more common hand-written style.',
                ],
            },
            {
                heading: 'MariaDB uses the same setting',
                body: [
                    'MariaDB diverged from MySQL after 5.5, but the formatting-relevant syntax — backticks, index hints, LIMIT, the comment styles — is shared. Use the MySQL dialect for MariaDB queries.',
                ],
            },
        ],
        faq: [
            {
                q: 'Will uppercasing keywords break my case-sensitive table names?',
                a: 'No. Keyword case and identifier case are independent settings. The default uppercases SELECT, FROM and JOIN while leaving every table and column name exactly as you typed it.',
            },
            {
                q: 'Does this work for MariaDB?',
                a: 'Yes. Select the MySQL dialect. The syntax that affects formatting is the same in both.',
            },
            {
                q: 'Why is my -- comment not being treated as a comment?',
                a: 'MySQL requires a whitespace character after the double dash. --note is parsed as an expression; -- note is a comment. This is a MySQL rule, not a formatter behaviour.',
            },
            {
                q: 'Is my SQL uploaded to a server?',
                a: 'No. Formatting happens in your browser and nothing leaves your machine, so it is safe to paste queries containing real schema names.',
            },
        ],
        updated: UPDATED,
    },

    // --------------------------------------------------------------------- T-SQL
    't-sql': {
        slug: 't-sql',
        dialect: 'transactsql',
        name: 'SQL Server (T-SQL)',
        icon: '🔷',
        tagline: 'Bracketed identifiers, APPLY operators, window frames and GO batches.',
        seoTitle: 'T-SQL Formatter - Format SQL Server Queries Online',
        seoDescription:
            'Free online T-SQL formatter for Microsoft SQL Server. Handles bracketed identifiers, CROSS APPLY and OUTER APPLY, window functions, MERGE, query hints and GO batch separators.',
        seoKeywords:
            't-sql formatter, sql server formatter, format tsql query, transact-sql beautifier, mssql formatter, sql server pretty print',
        h1: 'T-SQL Formatter for SQL Server',
        intro: [
            'T-SQL carries more procedural syntax than any other mainstream dialect, and a good deal of it is not really SQL at all — GO is a client directive, table variables are declared with the same @ that marks a parameter, and query hints ride along at the end of a statement in parentheses. Formatting T-SQL well is mostly a matter of recognising which of these are statements and which are decorations.',
            'The query below, loaded into the editor above, exercises the parts that most often go wrong: bracketed multi-part names, an OUTER APPLY correlated to the outer row, and a windowed ROW_NUMBER with its own PARTITION BY and ORDER BY.',
        ],
        sample: {
            messy: `with ranked as (select [c].[CustomerID], [c].[Name], o.[OrderID], o.[Total], row_number() over (partition by [c].[CustomerID] order by o.[OrderDate] desc) as rn from [dbo].[Customers] c outer apply (select top (3) * from [dbo].[Orders] o where o.[CustomerID] = c.[CustomerID] order by o.[Total] desc) o where [c].[IsActive] = 1) select [CustomerID], [Name], [Total] from ranked where rn = 1 order by [Total] desc;`,
            formatted: `WITH
  ranked AS (
    SELECT
      [c].[CustomerID],
      [c].[Name],
      o.[OrderID],
      o.[Total],
      ROW_NUMBER() OVER (
        PARTITION BY
          [c].[CustomerID]
        ORDER BY
          o.[OrderDate] DESC
      ) AS rn
    FROM
      [dbo].[Customers] c
      OUTER APPLY (
        SELECT
          TOP (3) *
        FROM
          [dbo].[Orders] o
        WHERE
          o.[CustomerID] = c.[CustomerID]
        ORDER BY
          o.[Total] DESC
      ) o
    WHERE
      [c].[IsActive] = 1
  )
SELECT
  [CustomerID],
  [Name],
  [Total]
FROM
  ranked
WHERE
  rn = 1
ORDER BY
  [Total] DESC;`,
        },
        quirks: [
            {
                heading: 'Bracketed identifiers and four-part names',
                body: [
                    'SQL Server quotes identifiers with square brackets, and a fully qualified name can carry four parts: server.database.schema.object. Brackets are preserved and the dots between them are not treated as operators, so [dbo].[Customers] stays intact.',
                    'Double quotes also work as identifier delimiters when QUOTED_IDENTIFIER is ON, which is the default for most drivers. Both spellings are accepted.',
                ],
            },
            {
                heading: 'CROSS APPLY and OUTER APPLY',
                body: [
                    'APPLY is the T-SQL lateral join: the right-hand subquery is evaluated once per row of the left-hand table and can reference its columns. CROSS APPLY drops outer rows that produce nothing, OUTER APPLY keeps them with NULLs — the same relationship as INNER and LEFT JOIN.',
                    'The subquery is expanded as a nested block, which makes the correlation visible. In the example, o.[CustomerID] = c.[CustomerID] inside the APPLY is what ties it to the outer row.',
                ],
            },
            {
                heading: 'Window frames',
                body: [
                    'An OVER clause can contain PARTITION BY, ORDER BY and a frame specification, which makes it a clause nested inside a select item. Each part is placed on its own line rather than run together, because a mis-read PARTITION BY is one of the easier ways to get a wrong answer that still looks plausible.',
                    'Frame clauses such as ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW are kept on the line with their keywords.',
                ],
            },
            {
                heading: 'GO is a batch separator, not a statement',
                body: [
                    'GO is understood by SSMS, Azure Data Studio and sqlcmd, not by the SQL Server engine — the client splits the script on it and sends each batch separately. Scripts containing GO are handled correctly: the batches are formatted independently and the separator is kept on its own line.',
                ],
                code: `SELECT
  1
FROM
  t;

GO
SELECT
  2
FROM
  u;`,
            },
            {
                heading: 'MERGE',
                body: [
                    'MERGE combines insert, update and delete against a target using a source, with WHEN MATCHED, WHEN NOT MATCHED BY TARGET and WHEN NOT MATCHED BY SOURCE branches. Each branch starts on its own line so the three cases can be read apart:',
                ],
                code: `MERGE INTO
  target t using source s ON t.id = s.id
WHEN MATCHED THEN
UPDATE SET
  t.v = s.v
WHEN NOT MATCHED BY TARGET THEN
INSERT
  (id, v)
VALUES
  (s.id, s.v);`,
            },
            {
                heading: 'The leading semicolon before WITH',
                body: [
                    'Scripts often start a CTE with ;WITH rather than WITH. The semicolon terminates whatever came before, because WITH is ambiguous — it also introduces table hints — and SQL Server requires the preceding statement to be terminated when a CTE follows.',
                    'The habit is harmless and the formatter accepts it, but terminating every statement with a semicolon makes it unnecessary, which is the better fix.',
                ],
            },
        ],
        limitations: [
            'TOP (n) WITH TIES is not parsed correctly: WITH is read as the start of a common table expression, and the clause is broken across lines as TOP (n) / WITH / ties. The example on this page uses TOP (3) without WITH TIES for that reason. If you need WITH TIES, format the query and then repair that one clause by hand.',
            'In a MERGE statement the USING keyword is left in the case you typed it rather than uppercased with the other keywords.',
        ],
        conventions: [
            {
                heading: 'PascalCase schemas, Preserve identifier case',
                body: [
                    'SQL Server schemas are conventionally PascalCase — CustomerID, OrderDate — and SQL Server compares identifiers using the database collation, which is usually case-insensitive. Preserve is still the right default: it keeps your names readable, and it avoids surprises on the minority of databases running a case-sensitive collation.',
                ],
            },
            {
                heading: 'Terminate statements',
                body: [
                    'Microsoft has documented the omission of the statement terminator as deprecated for several releases. Ending every statement with a semicolon removes the need for the leading-semicolon trick, and lets the formatter place blank lines between statements reliably.',
                ],
            },
        ],
        faq: [
            {
                q: 'Can I paste a script with GO separators?',
                a: 'Yes. The batches are formatted independently and each GO is kept on its own line. GO is a client directive rather than T-SQL, so it is passed through rather than parsed as a statement.',
            },
            {
                q: 'Why does TOP (3) WITH TIES come out broken?',
                a: 'The parser reads WITH as the beginning of a common table expression. It is a known limitation, listed above. Everything else in the query formats normally, so the usual workaround is to fix that single clause afterwards.',
            },
            {
                q: 'Does it format stored procedure bodies?',
                a: 'The statements inside a procedure are formatted as ordinary T-SQL. Control-of-flow constructs such as IF and WHILE are recognised, but the result is less polished than for a plain SELECT — procedural code is where any SQL formatter is weakest.',
            },
            {
                q: 'Is my T-SQL sent to a server?',
                a: 'No. Everything runs in your browser, so queries containing internal schema or object names never leave your machine.',
            },
        ],
        updated: UPDATED,
    },

    // -------------------------------------------------------------- Oracle PL/SQL
    'oracle-plsql': {
        slug: 'oracle-plsql',
        dialect: 'plsql',
        name: 'Oracle (PL/SQL)',
        icon: '🔴',
        tagline: 'Optimizer hints kept intact, hierarchical queries and legacy (+) joins.',
        seoTitle: 'Oracle SQL Formatter - Format PL/SQL and Oracle Queries Online',
        seoDescription:
            'Free online Oracle SQL and PL/SQL formatter. Preserves optimizer hints, handles CONNECT BY hierarchical queries, the legacy (+) outer join and alternative q-quoted strings.',
        seoKeywords:
            'oracle sql formatter, plsql formatter, format oracle query, pl/sql beautifier, oracle sql pretty print, connect by formatter',
        h1: 'Oracle SQL & PL/SQL Formatter',
        intro: [
            'Oracle is the dialect where formatting can genuinely change behaviour, because of one feature: optimizer hints are written as comments. A formatter that normalises or drops comments will silently remove /*+ INDEX(...) */ and change the execution plan of a query that still looks correct. Preserving hints exactly is the first requirement for anything that touches Oracle SQL.',
            'Beyond hints, Oracle carries decades of accumulated syntax — the (+) outer join notation that predates ANSI joins, CONNECT BY for hierarchies, DUAL, and the q-quote mechanism for strings containing apostrophes. The query below, loaded into the editor above, uses several of them at once.',
        ],
        sample: {
            messy: `select /*+ index(e emp_dept_ix) */ e.employee_id, e.last_name, nvl(e.commission_pct, 0) as comm, level as depth, decode(d.location_id, 1700, 'HQ', 'Branch') as site from employees e, departments d where e.department_id = d.department_id(+) and e.hire_date >= add_months(sysdate, -12) start with e.manager_id is null connect by prior e.employee_id = e.manager_id order siblings by e.last_name fetch first 25 rows only;`,
            formatted: `SELECT
  /*+ index(e emp_dept_ix) */ e.employee_id,
  e.last_name,
  NVL(e.commission_pct, 0) AS comm,
  LEVEL AS depth,
  DECODE(d.location_id, 1700, 'HQ', 'Branch') AS site
FROM
  employees e,
  departments d
WHERE
  e.department_id = d.department_id (+)
  AND e.hire_date >= ADD_MONTHS(sysdate, -12)
START WITH e.manager_id IS NULL
CONNECT BY PRIOR e.employee_id = e.manager_id
ORDER SIBLINGS BY
  e.last_name
FETCH FIRST
  25 rows ONLY;`,
        },
        quirks: [
            {
                heading: 'Optimizer hints are comments that matter',
                body: [
                    'A hint is written /*+ ... */ and must appear immediately after the SELECT, INSERT, UPDATE, DELETE or MERGE keyword. Put it anywhere else and Oracle ignores it without raising an error, which is why a formatter that moves comments around is dangerous here.',
                    'Hints are preserved in position and their contents are never re-cased or reflowed. In the output above, /*+ index(e emp_dept_ix) */ stays directly after SELECT and keeps the lower-case spelling it was written with.',
                ],
            },
            {
                heading: 'The legacy (+) outer join',
                body: [
                    'Before ANSI join syntax was supported, Oracle marked the optional side of an outer join with (+) on the join predicate. It is still very common in older code. d.department_id(+) means the row from departments may be missing — the equivalent of a LEFT JOIN from employees.',
                    'The notation is preserved. Note that a space is inserted before the marker, producing d.department_id (+), which Oracle parses identically.',
                ],
            },
            {
                heading: 'Hierarchical queries: CONNECT BY, LEVEL, ORDER SIBLINGS BY',
                body: [
                    'Oracle walks tree structures with START WITH to choose the roots and CONNECT BY PRIOR to describe the parent-child link, exposing the depth through the LEVEL pseudo-column. ORDER SIBLINGS BY then sorts within each level without breaking the hierarchy.',
                    'These are top-level clauses, so they are placed at the same indentation as WHERE and GROUP BY rather than being folded into the WHERE clause they follow.',
                ],
            },
            {
                heading: 'q-quoted string literals',
                body: [
                    "Doubling every apostrophe inside a string is error-prone, so Oracle offers alternative quoting: q'[...]' — or any other delimiter pair — makes the contents literal. The delimiters and the contents are preserved exactly:",
                ],
                code: `DECLARE v VARCHAR2(50) := q'[it's fine]';`,
            },
            {
                heading: 'DUAL, NVL and DECODE',
                body: [
                    'DUAL is Oracle\'s one-row table, used whenever an expression needs a FROM clause. NVL is the two-argument null substitution and DECODE is the positional conditional that predates CASE. All three are treated as ordinary identifiers and functions.',
                    'For new code, COALESCE and CASE are the portable equivalents of NVL and DECODE, and behave slightly differently around type conversion and short-circuiting.',
                ],
            },
        ],
        limitations: [
            'PL/SQL blocks are formatted much less well than queries. A DECLARE / BEGIN / END block is broken onto separate lines with blank lines between the sections rather than being indented as a nested structure. The SQL statements inside a block format normally; the block scaffolding around them does not.',
            'In FETCH FIRST 25 rows ONLY the word rows is left lower case, because it is parsed as part of the row-limiting clause rather than as a standalone keyword.',
            'The trailing / that SQL*Plus uses to execute a block is a client directive, not PL/SQL. Keep it out of what you paste.',
        ],
        conventions: [
            {
                heading: 'Prefer ANSI joins in new code',
                body: [
                    'The (+) notation cannot express a full outer join, does not combine with ANSI join syntax in the same query, and makes the join condition hard to separate from the filter condition. LEFT JOIN is clearer and is what Oracle has recommended for years. Formatting old (+) code is useful for reading it; converting it is a separate job.',
                ],
            },
            {
                heading: 'ROWNUM versus FETCH FIRST',
                body: [
                    'Row limiting with ROWNUM requires an inline view when combined with ORDER BY, because ROWNUM is assigned before sorting — the classic source of "top N" queries that return the wrong N rows. Oracle 12c introduced FETCH FIRST n ROWS ONLY, which sorts first and is what the example above uses.',
                ],
            },
        ],
        faq: [
            {
                q: 'Are optimizer hints preserved?',
                a: 'Yes. Hints are kept in position immediately after the leading keyword and their contents are not modified. This is the behaviour shown in the example above.',
            },
            {
                q: 'Can it format a package body or a large PL/SQL block?',
                a: 'The SQL statements inside will format, but the block scaffolding is handled poorly — this is listed under known limitations. For procedural code, an IDE with a PL/SQL-aware formatter will do better.',
            },
            {
                q: 'Should I keep the trailing slash?',
                a: 'No. The / is a SQL*Plus instruction to execute the preceding block, not part of PL/SQL. Paste the statement without it.',
            },
            {
                q: 'Is my SQL uploaded anywhere?',
                a: 'No. Formatting runs entirely in your browser, which matters here because Oracle queries often embed schema names and business logic.',
            },
        ],
        updated: UPDATED,
    },

    // ------------------------------------------------------------------ BigQuery
    bigquery: {
        slug: 'bigquery',
        dialect: 'bigquery',
        name: 'BigQuery',
        icon: '🔍',
        tagline: 'Qualified backtick names, UNNEST, SELECT * EXCEPT and QUALIFY.',
        seoTitle: 'BigQuery SQL Formatter - Format GoogleSQL Queries Online',
        seoDescription:
            'Free online BigQuery formatter for GoogleSQL. Handles backtick-qualified table names, UNNEST and STRUCT, SELECT * EXCEPT, QUALIFY, wildcard tables and SAFE functions.',
        seoKeywords:
            'bigquery formatter, googlesql formatter, format bigquery query, bigquery sql beautifier, standard sql formatter, bigquery pretty print',
        h1: 'BigQuery SQL Formatter',
        intro: [
            'BigQuery queries are shaped by two things other dialects do not have: table names that are three dotted parts inside a single pair of backticks, and columns that are arrays of structs rather than scalars. Both change what a formatter has to get right — the dots inside `project.dataset.table` are not operators, and an UNNEST in the FROM clause is a join even though it reads like a function call.',
            'GoogleSQL has also added clauses that remove whole layers of nesting. QUALIFY filters on a window function without the wrapping subquery the standard would require, and SELECT * EXCEPT drops columns without listing the ones you keep. The query below, loaded into the editor above, uses both.',
        ],
        sample: {
            messy:
                "select * except(payload), e.user_id, safe_cast(json_value(e.payload, '$.amount') as numeric) as amount, h.name as hit_name from `analytics-prod.events.sessions_*` e, unnest(e.hits) as h where _table_suffix between '20260101' and '20260131' and e.geo.country = 'BR' qualify row_number() over (partition by e.user_id order by e.event_timestamp desc) = 1;",
            formatted: `SELECT
  * EXCEPT (payload),
  e.user_id,
  SAFE_CAST(JSON_VALUE(e.payload, '$.amount') AS NUMERIC) AS amount,
  h.name AS hit_name
FROM
  \`analytics-prod.events.sessions_*\` e,
  UNNEST (e.hits) AS h
WHERE
  _table_suffix BETWEEN '20260101' AND '20260131'
  AND e.geo.country = 'BR'
QUALIFY
  ROW_NUMBER() OVER (
    PARTITION BY
      e.user_id
    ORDER BY
      e.event_timestamp DESC
  ) = 1;`,
        },
        quirks: [
            {
                heading: 'Backtick-quoted qualified names',
                body: [
                    'A BigQuery table reference is `project.dataset.table`, with the dots inside the quoting rather than between separately quoted parts. Project ids routinely contain hyphens — analytics-prod in the example — which is exactly why the backticks are mandatory: without them the hyphen would parse as subtraction.',
                    'The whole reference is treated as a single identifier token, so it is never split at a dot or at a hyphen.',
                ],
            },
            {
                heading: 'UNNEST is a join, not a function call',
                body: [
                    'When a column is an ARRAY, UNNEST in the FROM clause flattens it into rows, correlated to the row it came from. The comma before it is a CROSS JOIN, which is why the example reads FROM table e, UNNEST(e.hits) AS h — one row per hit, carrying its session.',
                    'It is placed on its own line in the FROM list, at the same level as the table it expands, which is the honest representation of what it is.',
                ],
            },
            {
                heading: 'SELECT * EXCEPT and * REPLACE',
                body: [
                    'Wide event tables make listing every column impractical, so GoogleSQL lets you subtract instead: * EXCEPT (payload) selects everything but that column, and * REPLACE (expr AS col) substitutes one column\'s value while keeping the rest. Both are parsed as modifiers of the star rather than as function calls.',
                ],
            },
            {
                heading: 'QUALIFY',
                body: [
                    'Filtering on a window function normally requires computing it in a subquery and filtering outside, because WHERE runs before window functions. QUALIFY does it in one level — the example keeps the most recent event per user without a wrapping SELECT.',
                    'It is a top-level clause and is placed alongside WHERE and GROUP BY. QUALIFY requires a WHERE, GROUP BY or HAVING in the same query block, or a WINDOW clause.',
                ],
            },
            {
                heading: 'Wildcard tables and _TABLE_SUFFIX',
                body: [
                    'A trailing * in a table name matches every table sharing that prefix, and the pseudo-column _TABLE_SUFFIX holds the part that matched — the standard way to scan a date-sharded export. Filtering on _TABLE_SUFFIX is what keeps the query from reading every shard, so it belongs in the WHERE clause rather than in a later filter.',
                    'SAFE_CAST and the SAFE. function prefix return NULL instead of raising on bad input, which matters when the data is user-supplied JSON. Both are recognised as ordinary function syntax.',
                ],
            },
        ],
        limitations: [
            'The pseudo-columns _table_suffix, _partitiontime and _partitiondate are left in the case you typed them, because they are parsed as identifiers rather than keywords. BigQuery accepts any case for them.',
            'Scripting statements — DECLARE, SET, BEGIN ... END, EXECUTE IMMEDIATE — format much less cleanly than queries, in common with procedural code in every dialect.',
        ],
        conventions: [
            {
                heading: 'Formatting does not change what a query costs',
                body: [
                    'BigQuery bills on bytes scanned, which depends on the columns you reference and the partitions you touch — not on whitespace. Formatting a query never changes its cost. SELECT * does, which is the real argument for EXCEPT over the star when the table is wide.',
                ],
            },
            {
                heading: 'GoogleSQL only',
                body: [
                    'Legacy SQL, the pre-2016 dialect with [project:dataset.table] bracket syntax, is a different grammar and is not supported here. If your query uses colons and square brackets in table names, it is Legacy SQL and needs migrating rather than formatting.',
                ],
            },
        ],
        faq: [
            {
                q: 'Does formatting affect how much my query costs?',
                a: 'No. Cost is driven by the bytes scanned — the columns referenced and the partitions read. Whitespace and keyword casing have no effect on either.',
            },
            {
                q: 'Does it support Legacy SQL?',
                a: 'No, only GoogleSQL (formerly Standard SQL). Legacy SQL uses a different table reference syntax and a different grammar.',
            },
            {
                q: 'Are STRUCT and ARRAY expressions handled?',
                a: 'Yes. Nested STRUCT constructors and ARRAY_AGG calls are parsed as ordinary expressions, and UNNEST is recognised as part of the FROM clause.',
            },
            {
                q: 'Is my query sent to Google or to any server?',
                a: 'No. This page runs the formatter in your browser. The query is not sent anywhere, including to BigQuery.',
            },
        ],
        updated: UPDATED,
    },
};

export const DIALECT_GUIDE_LIST: DialectGuide[] = DIALECT_SLUGS.map(slug => DIALECT_GUIDES[slug]);

export function getDialectGuide(slug: string): DialectGuide | undefined {
    return DIALECT_GUIDES[slug as DialectSlug];
}

const DIALECT_TRANSLATIONS: Record<ExtraLocale, Partial<Record<DialectSlug, DialectGuideTranslation>>> = {
    pt: DIALECT_TRANSLATIONS_PT,
    es: DIALECT_TRANSLATIONS_ES,
    de: DIALECT_TRANSLATIONS_DE,
    fr: DIALECT_TRANSLATIONS_FR,
    zh: DIALECT_TRANSLATIONS_ZH,
    ja: DIALECT_TRANSLATIONS_JA,
};

/**
 * Overlays `language`'s translation (if any) onto the English base. Falls back to the
 * base guide unchanged for English itself, an unsupported language, or any field a
 * translation doesn't cover — never renders an empty string. Code (sample, quirk.code)
 * always comes from `guide`; it has no translated counterpart.
 */
export function localizeDialectGuide(guide: DialectGuide, language: string): DialectGuide {
    const locale = toExtraLocale(language);
    const t = locale ? DIALECT_TRANSLATIONS[locale][guide.slug] : undefined;
    if (!t) return guide;
    return {
        ...guide,
        h1: t.h1 ?? guide.h1,
        tagline: t.tagline ?? guide.tagline,
        intro: mergeArray(guide.intro, t.intro),
        quirks: mergeSections(guide.quirks, t.quirks),
        limitations: mergeArray(guide.limitations, t.limitations),
        conventions: mergeSections(guide.conventions, t.conventions),
        faq: mergeFaq(guide.faq, t.faq),
    };
}

/** Every dialect covered in every supported language — i18n-guide-coverage.test.ts's contract. */
export { EXTRA_LOCALES };
