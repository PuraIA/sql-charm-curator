/**
 * Reference material for /sql/<slug> pages that aren't a dialect guide — currently just
 * /sql/diff — checked by SQLDialectPage before it falls back to the dialect-guide
 * lookup, the same pattern src/content/converter-guides.ts uses under /json and /xml.
 *
 * The sample pair is formatted with the site's own sql-formatter integration and diffed
 * with the site's own line-diff, both re-derived and asserted equal by
 * sql-tools.test.ts — the before/after shown here can't drift from what the tool does.
 */
import type { GuideSection, FaqEntry } from './guide-shared';
import type { Dialect } from '@/components/SQLFormatter';

export const SQL_TOOL_SLUGS = ['diff'] as const;
export type SqlToolSlug = (typeof SQL_TOOL_SLUGS)[number];

export interface SqlToolGuide {
    slug: SqlToolSlug;
    dialect: Dialect;
    name: string;
    tagline: string;
    seoTitle: string;
    seoDescription: string;
    seoKeywords: string;
    h1: string;
    intro: string[];
    sample: { before: string; after: string };
    /** The formatted pair, before diffing — what "Before" and "After" actually format to. */
    formatted: { before: string; after: string };
    sections: GuideSection[];
    limitations: string[];
    faq: FaqEntry[];
    updated: string;
}

const UPDATED = '2026-09-21';

const BEFORE_QUERY =
    'select u.id, u.name, count(o.id) as orders from users u left join orders o on o.user_id = u.id group by u.id, u.name;';
const AFTER_QUERY =
    "select u.id, u.name, count(o.id) as orders from users u left join orders o on o.user_id = u.id where u.status = 'active' group by u.id, u.name order by orders desc limit 20;";

const BEFORE_FORMATTED = `SELECT
  u.id,
  u.name,
  COUNT(o.id) AS orders
FROM
  users u
  LEFT JOIN orders o ON o.user_id = u.id
GROUP BY
  u.id,
  u.name;`;

const AFTER_FORMATTED = `SELECT
  u.id,
  u.name,
  COUNT(o.id) AS orders
FROM
  users u
  LEFT JOIN orders o ON o.user_id = u.id
WHERE
  u.status = 'active'
GROUP BY
  u.id,
  u.name
ORDER BY
  orders DESC
LIMIT
  20;`;

export const SQL_TOOL_GUIDES: Record<SqlToolSlug, SqlToolGuide> = {
    diff: {
        slug: 'diff',
        dialect: 'postgresql',
        name: 'SQL Diff',
        tagline: 'Format both queries the same way first, so only the real change shows in the diff.',
        seoTitle: 'SQL Diff - Compare Two SQL Queries Online',
        seoDescription:
            'Free online SQL diff tool. Formats both queries with the same options before comparing them line by line, so a query rewritten with different capitalization or line breaks doesn\'t drown out the change that matters. Runs in your browser.',
        seoKeywords:
            'sql diff, compare sql queries, sql query diff tool, sql comparison online, diff two sql queries',
        h1: 'SQL Diff',
        intro: [
            'Diffing two SQL queries as raw text almost never shows what actually changed: one version keyworded in lowercase, the other in upper; one wrapped at 80 characters, the other at 120 — none of that is a real change, but a text-level diff can\'t tell the difference between "reformatted" and "rewritten." This tool runs both queries through the exact same sql-formatter pass — same dialect, same casing, same indentation — before comparing them line by line, so a reformatting produces an *identical* pair, and the diff is empty. What is left after that is the change that matters.',
            "The example below is loaded into the editor above: a query gains a WHERE filter and an ORDER BY / LIMIT for pagination. Both queries format to the same style, so the diff below isolates exactly those additions — not a single line of noise from the reformatting itself.",
        ],
        sample: { before: BEFORE_QUERY, after: AFTER_QUERY },
        formatted: { before: BEFORE_FORMATTED, after: AFTER_FORMATTED },
        sections: [
            {
                heading: 'The diff is line-level, computed the same way `diff` computes one',
                body: [
                    "This isn't a naive line-by-line comparison, which would make one inserted line in the middle look like every following line changed. It implements Myers' shortest-edit-script algorithm — the same algorithm behind the Unix diff utility and git diff — which finds the minimal set of line additions and removals that turns the Before query into the After one.",
                    'In the example, the new WHERE clause and the new ORDER BY / LIMIT clause are the only lines marked changed; every line that exists in both queries, including the ones after the insertion point, stays unmarked.',
                ],
            },
            {
                heading: 'Formatting first is what makes the diff meaningful',
                body: [
                    'Both queries are formatted with the dialect and options selected above before anything is compared. Paste the exact same query into both boxes, in whatever style you originally wrote it, and the diff will show nothing — which is the correct answer, and the quickest way to confirm that a change you made was purely cosmetic.',
                ],
            },
            {
                heading: 'When a query fails to format',
                body: [
                    "If a query doesn't parse under the selected dialect, this tool falls back the same way the SQL Formatter does: a reduced option set, then a generic SQL pass, before giving up and reporting an error. A diff still needs both sides to have gone through the same fallback path to be meaningful, so if one side hits the generic fallback and the other doesn't, minor formatting differences from that mismatch can appear as noise in the diff.",
                ],
            },
        ],
        limitations: [
            'The diff is line-based, not token-based: a single word changed in the middle of a long line (an alias renamed, a literal value changed) marks the whole line as removed and re-added, rather than highlighting just the changed word within it.',
            'Comparing across two different dialects is possible — the tool doesn\'t prevent it — but rarely useful, since the same query can format differently under different dialects\' grammars for reasons that have nothing to do with an actual edit.',
        ],
        faq: [
            {
                q: 'Why does pasting the same query on both sides sometimes still show a diff?',
                a: "It shouldn't, and doesn't, as long as both sides parse the same way under the selected dialect. If one side hits a different fallback level than the other — one needs the generic pass, the other doesn't — the two can end up formatted slightly differently even though the input was identical.",
            },
            {
                q: "Can I compare queries written in different SQL dialects?",
                a: "The tool lets you, but a diff across two different grammars usually reflects dialect differences, not a real edit — it's built for comparing two versions of the same query in the same dialect.",
            },
            {
                q: 'Does it diff whole statements or individual lines?',
                a: 'Lines, after formatting — the same unit git diff uses for code. A change inside a single line (like a renamed column) marks that whole line as changed, not just the changed portion of it.',
            },
            {
                q: 'Are my queries uploaded anywhere?',
                a: 'No. Formatting and diffing both run in your browser, which matters here since comparing two versions of a query often means comparing two versions with real table and column names in them.',
            },
        ],
        updated: UPDATED,
    },
};

export function getSqlToolGuide(slug: string): SqlToolGuide | undefined {
    return SQL_TOOL_GUIDES[slug as SqlToolSlug];
}
