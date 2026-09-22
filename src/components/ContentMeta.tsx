import { CalendarDays, PenLine } from 'lucide-react';

interface ContentMetaProps {
    /** ISO date (YYYY-MM-DD). */
    updated: string;
    author?: string;
}

/**
 * Byline for reference pages: who maintains the page and when it was last checked.
 *
 * Rendered from a date in the content module rather than from the build time, so the
 * date reflects when someone actually reviewed the text.
 */
export const ContentMeta = ({ updated, author = 'Pura IA' }: ContentMetaProps) => {
    const formatted = new Date(`${updated}T00:00:00Z`).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC',
    });

    return (
        <div className="not-prose flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground border-y border-border/50 py-3 my-8">
            <span className="flex items-center gap-2">
                <PenLine className="w-4 h-4 text-primary" />
                Written and maintained by {author}
            </span>
            <span className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-primary" />
                Last reviewed <time dateTime={updated}>{formatted}</time>
            </span>
        </div>
    );
};
