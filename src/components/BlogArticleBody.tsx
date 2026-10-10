import { Info } from 'lucide-react';
import { AdPlaceholder } from './AdPlaceholder';
import { CodePanel } from './CodePanel';
import { InlineText } from './InlineText';
import type { BlogBlock } from '@/content/blog';

/**
 * Renders an article's blocks in order. One ad slot is placed roughly a third of the
 * way in, at a heading boundary, so it never interrupts a paragraph and code pair.
 */
export function BlogArticleBody({ blocks }: { blocks: BlogBlock[] }) {
    const adBefore = blocks.findIndex((block, i) => block.type === 'h2' && i >= blocks.length / 3);

    return (
        <>
            {blocks.map((block, i) => (
                <div key={i}>
                    {i === adBefore && (
                        <div className="not-prose my-10 py-6 border-y border-border/50">
                            <AdPlaceholder slotId="content-middle" />
                        </div>
                    )}
                    <Block block={block} />
                </div>
            ))}
        </>
    );
}

function Block({ block }: { block: BlogBlock }) {
    switch (block.type) {
        case 'p':
            return (
                <p>
                    <InlineText text={block.text} />
                </p>
            );
        case 'h2':
            return (
                <h2>
                    <InlineText text={block.text} />
                </h2>
            );
        case 'code':
            return (
                <div className="my-6">
                    <CodePanel code={block.code} label={block.label} tone="muted" />
                </div>
            );
        case 'list':
            return (
                <ul>
                    {block.items.map((item, i) => (
                        <li key={i}>
                            <InlineText text={item} />
                        </li>
                    ))}
                </ul>
            );
        case 'note':
            return (
                <div className="not-prose flex gap-3 text-sm text-muted-foreground bg-primary/5 border border-primary/20 rounded-lg p-4 my-8">
                    <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>
                        <InlineText text={block.text} />
                    </span>
                </div>
            );
    }
}
