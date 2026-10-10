import { Fragment, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { INLINE_TOKEN } from '@/content/blog/inline';

/**
 * Renders the two inline forms blog text uses: `code` and [label](href). Internal
 * paths become router links; anything else opens in a new tab. Kept this small on
 * purpose — articles are data in src/content/blog, not a Markdown dialect.
 */
export function InlineText({ text }: { text: string }) {
    const parts: ReactNode[] = [];
    let last = 0;
    for (const match of text.matchAll(INLINE_TOKEN)) {
        const index = match.index ?? 0;
        if (index > last) parts.push(text.slice(last, index));
        const [, code, label, href] = match;
        if (code !== undefined) {
            parts.push(
                <code key={index} className="font-mono text-[0.9em] px-1 py-0.5 rounded bg-secondary/60 before:content-none after:content-none">
                    {code}
                </code>
            );
        } else if (href.startsWith('/')) {
            parts.push(
                <Link key={index} to={href} className="text-primary hover:underline">
                    {label}
                </Link>
            );
        } else {
            parts.push(
                <a key={index} href={href} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    {label}
                </a>
            );
        }
        last = index + match[0].length;
    }
    if (last < text.length) parts.push(text.slice(last));
    return <Fragment>{parts}</Fragment>;
}

