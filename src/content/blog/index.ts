import type { BlogPost } from './types';
import { sqlFormatterEdgeCases } from './posts/sql-formatter-edge-cases';
import { xmlToJsonConventions } from './posts/xml-to-json-conventions';
import { scopedXpathEvaluator } from './posts/scoped-xpath-evaluator';

export type { BlogPost, BlogBlock } from './types';

/**
 * Articles for /blog, newest first. Posts are written in English only: the site's
 * prerendered HTML is English, and unlike the guide pages the articles are not
 * translated — /blog says so to visitors who picked another language.
 */
export const BLOG_POSTS: BlogPost[] = [sqlFormatterEdgeCases, xmlToJsonConventions, scopedXpathEvaluator].sort(
    (a, b) => b.published.localeCompare(a.published)
);

export const BLOG_SLUGS = BLOG_POSTS.map(post => post.slug);

export function getBlogPost(slug: string): BlogPost | undefined {
    return BLOG_POSTS.find(post => post.slug === slug);
}

/** Articles that list `path` among the tools they cover — used to link tool pages to them. */
export function postsAboutPath(path: string): BlogPost[] {
    return BLOG_POSTS.filter(post => post.relatedTools.some(tool => tool.path === path));
}

/** Approximate reading time, from the prose and list text (code blocks excluded). */
export function readingMinutes(post: BlogPost): number {
    const words = post.blocks
        .flatMap(block => (block.type === 'list' ? block.items : block.type === 'code' ? [] : [block.text]))
        .join(' ')
        .split(/\s+/).length;
    return Math.max(1, Math.round(words / 220));
}
