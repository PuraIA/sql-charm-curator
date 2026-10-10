import { format, type FormatOptionsWithLanguage } from 'sql-formatter';
import type { BlogPost } from '../types';

/** The options this site's formatter opens with on every /sql/<dialect> page. */
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

function run(language: FormatOptionsWithLanguage['language'], sql: string, extra: Partial<FormatOptionsWithLanguage> = {}) {
    return format(sql, { language, ...OPTIONS, ...extra });
}

// Every "output" below is produced by the library at build time, not typed by hand.
// blog.test.ts asserts the specific behaviour the prose describes for each one.
export const EDGE_CASES = {
    distinctOn: {
        input: 'select distinct on (customer_id) customer_id, created_at, total from orders order by customer_id, created_at desc;',
        get output() {
            return run('postgresql', this.input);
        },
    },
    withTies: {
        input: 'select top (3) with ties name, score from players order by score desc;',
        get output() {
            return run('transactsql', this.input);
        },
    },
    withTiesDisabled: {
        input: '/* sql-formatter-disable */\nselect top (3) with ties name, score from players order by score desc;\n/* sql-formatter-enable */\nselect a from b;',
        get output() {
            return run('transactsql', this.input);
        },
    },
    interval: {
        input: 'select id from sessions where created_at < date_sub(now(), interval 30 day);',
        get output() {
            return run('mysql', this.input);
        },
    },
    intervalTypedUpper: {
        input: 'select id from sessions where created_at < date_sub(now(), INTERVAL 30 DAY);',
        get output() {
            return run('mysql', this.input);
        },
    },
    oracleName: {
        input: 'select id, name from employees order by name fetch first 25 rows only;',
        get output() {
            return run('plsql', this.input);
        },
    },
    mergeUsing: {
        input: 'merge into dbo.stock as t using dbo.incoming as s on t.sku = s.sku when matched then update set t.qty = t.qty + s.qty;',
        get output() {
            return run('transactsql', this.input);
        },
    },
    tableSuffix: {
        input: "select * from `proj.ds.events_*` where _table_suffix between '20260101' and '20260131';",
        get output() {
            return run('bigquery', this.input);
        },
    },
};

export const sqlFormatterEdgeCases: BlogPost = {
    slug: 'sql-formatter-edge-cases',
    title: 'Six places sql-formatter still trips up, and what to do about each',
    description:
        'What we found running real PostgreSQL, T-SQL, MySQL, Oracle and BigQuery queries through sql-formatter while writing this site’s dialect pages — with the actual output and a workaround for each case.',
    keywords: 'sql-formatter bugs, sql formatter limitations, t-sql top with ties, distinct on formatting, sql-formatter-disable',
    published: '2026-10-09',
    tags: ['SQL', 'sql-formatter', 'Field notes'],
    relatedTools: [
        { label: 'SQL Formatter', path: '/sql' },
        { label: 'T-SQL Formatter', path: '/sql/t-sql' },
        { label: 'PostgreSQL Formatter', path: '/sql/postgresql' },
    ],
    blocks: [
        {
            type: 'p',
            text: 'Every SQL formatter on this site is the open-source [sql-formatter](https://github.com/sql-formatter-org/sql-formatter) library, version 15.6.12 at the time of writing, running in your browser. It is a good library, and this is not a takedown. But when we wrote the dialect pages, we made one rule: every "formatted output" shown on a page had to be produced by the library and checked by a test, never typed by hand. That rule surfaced a handful of cases where the output is valid SQL but not what a person would write — and in one case, not what the query means.',
        },
        {
            type: 'p',
            text: 'All of the outputs below were generated with the options the site opens with: keywords, functions and data types in upper case, identifiers left as typed, two-space indentation. Paste any of them into the [SQL formatter](/sql) and you will see the same thing.',
        },
        { type: 'h2', text: '1. T-SQL: TOP (n) WITH TIES is split into three lines' },
        {
            type: 'p',
            text: 'This is the only case on the list where the output reads as a different statement. The parser sees `WITH` and treats it as the start of a common table expression, so the clause is broken apart:',
        },
        { type: 'code', label: 'Input', code: EDGE_CASES.withTies.input },
        { type: 'code', label: 'sql-formatter output (transactsql)', code: EDGE_CASES.withTies.output },
        {
            type: 'p',
            text: 'Dropping the parentheses (`TOP 3`) does not help — the same split happens. What does work is the library’s own escape hatch: a region wrapped in `/* sql-formatter-disable */` and `/* sql-formatter-enable */` comments is passed through untouched, while everything after it is still formatted.',
        },
        { type: 'code', label: 'With the disable comments', code: EDGE_CASES.withTiesDisabled.output },
        {
            type: 'p',
            text: 'Those comments are plain SQL comments, so SQL Server ignores them, and they work in this site’s formatter as well — you can leave them in a migration file permanently.',
        },
        { type: 'h2', text: '2. PostgreSQL: DISTINCT ON is separated from DISTINCT' },
        { type: 'code', label: 'sql-formatter output (postgresql)', code: EDGE_CASES.distinctOn.output },
        {
            type: 'p',
            text: '`DISTINCT ON (customer_id)` is one construct — "keep the first row per customer_id" — but the formatter puts `DISTINCT` on the `SELECT` line and starts the next line with `ON (customer_id)`, which makes the select list look like it begins with a stray `ON`. The query is unchanged and runs fine; it just reads worse than the rest of the output. There is no option that changes this, so if it bothers you in a reviewed file, fix the one line by hand after formatting.',
        },
        { type: 'h2', text: '3. Oracle: a column called name becomes NAME' },
        { type: 'code', label: 'sql-formatter output (plsql)', code: EDGE_CASES.oracleName.output },
        {
            type: 'p',
            text: 'We asked for identifiers to be preserved, and `id` and `employees` were. But `name` came back as `NAME`, because the PL/SQL grammar knows `NAME` as a keyword and keyword casing wins. The same output also leaves `rows` in lower case inside `FETCH FIRST 25 rows ONLY`, the opposite inconsistency.',
        },
        {
            type: 'p',
            text: 'In Oracle this happens to be harmless: unquoted identifiers are case-insensitive and stored in upper case, so `name` and `NAME` are the same column. The tempting "fix" is the dangerous one. Writing `"name"` in double quotes does keep it lower case in the output — but in Oracle a quoted identifier is case-sensitive, so `"name"` refers to a column literally named in lower case, which in a typical schema does not exist. If the casing matters to you, set keyword casing to Preserve instead; that leaves the whole query exactly as typed.',
        },
        { type: 'h2', text: '4. MySQL: INTERVAL keeps whatever case you typed' },
        { type: 'code', label: 'sql-formatter output (mysql)', code: EDGE_CASES.interval.output },
        {
            type: 'p',
            text: 'Inside `DATE_SUB(...)`, `interval 30 day` is read as part of the function’s argument rather than as keywords, so keyword casing is not applied to it. The fix is simply to type it the way you want it — the formatter preserves `INTERVAL 30 DAY` exactly when it is written that way:',
        },
        { type: 'code', label: 'Same query, INTERVAL typed in upper case', code: EDGE_CASES.intervalTypedUpper.output },
        { type: 'h2', text: '5. T-SQL MERGE: USING stays lower case and on the target line' },
        { type: 'code', label: 'sql-formatter output (transactsql)', code: EDGE_CASES.mergeUsing.output },
        {
            type: 'p',
            text: 'The `WHEN MATCHED` branch gets its own line, which is the part that matters most when reading a `MERGE`. But `using` is neither upper-cased nor moved to its own line, so source and target end up on one line. As with `INTERVAL`, typing `USING` in upper case at least makes the casing consistent.',
        },
        { type: 'h2', text: '6. BigQuery: pseudo-columns are treated as identifiers' },
        { type: 'code', label: 'sql-formatter output (bigquery)', code: EDGE_CASES.tableSuffix.output },
        {
            type: 'p',
            text: '`_TABLE_SUFFIX`, `_PARTITIONTIME` and `_PARTITIONDATE` are documented in upper case, but the formatter reads them as ordinary identifiers and, with identifier casing on Preserve, leaves them as typed. BigQuery accepts any casing for them, so this is cosmetic only.',
        },
        { type: 'h2', text: 'What the list has in common' },
        {
            type: 'p',
            text: 'Five of the six are about casing or line placement and never change what the query does. The one that reads as a different statement — `TOP ... WITH TIES` — comes from a keyword (`WITH`) that means two unrelated things in T-SQL. That is the general shape of formatter bugs: they cluster where a dialect reuses a word, not where its syntax is unusual. The genuinely unusual syntax (PostgreSQL’s `::` casts and JSONB operators, BigQuery’s backtick-qualified names, Oracle’s optimizer hints) all came through correctly in our tests.',
        },
        {
            type: 'note',
            text: 'Each case above is pinned by a test in this site’s repository. When sql-formatter is upgraded and one of them changes, the test fails and this article gets revised — so if you are reading it, it still matches what the tool on this site does.',
        },
    ],
};
