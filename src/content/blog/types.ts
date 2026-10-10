/**
 * Shape of a /blog/<slug> article.
 *
 * Unlike the guide modules (sql-dialects.ts, json-guides.ts, ...), a post has no fixed
 * set of sections: it is an ordered list of blocks, so each article can be structured
 * around its own argument instead of a shared template.
 *
 * Inline syntax inside `text` and list items is deliberately tiny — `code` and
 * [label](/path) — and is rendered by <InlineText />. Anything a code block claims is
 * tool output is computed from the real function in the post module itself, and the
 * claim the prose makes about it is asserted in blog.test.ts.
 */
export type BlogBlock =
    | { type: 'p'; text: string }
    | { type: 'h2'; text: string }
    | { type: 'code'; code: string; label?: string }
    | { type: 'list'; items: string[] }
    | { type: 'note'; text: string };

export interface BlogPost {
    slug: string;
    title: string;
    /** Used for <meta name="description"> and as the summary on /blog. */
    description: string;
    keywords: string;
    /** ISO date (YYYY-MM-DD) the post was first published. */
    published: string;
    /** ISO date of the last substantive revision, if any. */
    updated?: string;
    tags: string[];
    /** Site tools the post is about, linked at the end of the article. */
    relatedTools: { label: string; path: string }[];
    blocks: BlogBlock[];
}
