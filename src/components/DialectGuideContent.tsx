import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { AdPlaceholder } from './AdPlaceholder';
import { ContentMeta } from './ContentMeta';
import { DIALECT_GUIDE_LIST, type DialectGuide } from '@/content/sql-dialects';

/**
 * Renders one dialect reference page.
 *
 * Everything here is plain markup on purpose: it has to be present in the prerendered
 * HTML, so no lazy chunks and no syntax highlighting that only initialises on the
 * client.
 */
export const DialectGuideContent = ({ guide }: { guide: DialectGuide }) => (
    <div className="space-y-12">
        <section>
            <ContentMeta updated={guide.updated} />

            {guide.intro.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
            ))}
        </section>

        <section>
            <h2 className="text-3xl font-bold mb-6">
                A {guide.name} query, before and after
            </h2>
            <p>
                This is the query loaded in the editor above. On the left is what you paste; on the
                right is what the formatter returns with the default options for this dialect.
            </p>
            <div className="not-prose grid gap-4 lg:grid-cols-2 my-8">
                <CodePanel label="Pasted" code={guide.sample.messy} tone="muted" />
                <CodePanel label="Formatted" code={guide.sample.formatted} tone="primary" />
            </div>
        </section>

        <div className="my-12 py-8 border-y border-border/50">
            <AdPlaceholder slotId="content-middle" />
        </div>

        <section>
            <h2 className="text-3xl font-bold mb-6">
                What is specific to {guide.name}
            </h2>
            {guide.quirks.map((quirk, i) => (
                <div key={i} className="mb-8">
                    <h3>{quirk.heading}</h3>
                    {quirk.body.map((paragraph, j) => (
                        <p key={j}>{paragraph}</p>
                    ))}
                    {quirk.code && <CodePanel code={quirk.code} tone="muted" />}
                </div>
            ))}
        </section>

        <section>
            <h2 className="text-3xl font-bold mb-6">Known limitations</h2>
            <p>
                No formatter handles every corner of a dialect. These are the cases where this one
                produces output you may want to correct by hand.
            </p>
            <ul className="not-prose space-y-3 my-6">
                {guide.limitations.map((limitation, i) => (
                    <li
                        key={i}
                        className="flex gap-3 text-sm text-muted-foreground bg-amber-500/5 border border-amber-500/20 rounded-lg p-4"
                    >
                        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                        <span>{limitation}</span>
                    </li>
                ))}
            </ul>
        </section>

        <section>
            <h2 className="text-3xl font-bold mb-6">Conventions worth adopting</h2>
            {guide.conventions.map((convention, i) => (
                <div key={i} className="mb-8">
                    <h3>{convention.heading}</h3>
                    {convention.body.map((paragraph, j) => (
                        <p key={j}>{paragraph}</p>
                    ))}
                </div>
            ))}
        </section>

        <div className="my-12 py-8 border-y border-border/50">
            <AdPlaceholder slotId="content-bottom" />
        </div>

        <section>
            <h2 className="text-3xl font-bold mb-6">{guide.name} formatting FAQ</h2>
            <div className="not-prose grid gap-4 md:grid-cols-2">
                {guide.faq.map((entry, i) => (
                    <div key={i} className="bg-secondary/20 p-6 rounded-xl border border-border/50">
                        <h3 className="font-bold mb-2">{entry.q}</h3>
                        <p className="text-sm text-muted-foreground">{entry.a}</p>
                    </div>
                ))}
            </div>
        </section>

        <RelatedDialects current={guide.slug} />
    </div>
);

function CodePanel({ code, label, tone }: { code: string; label?: string; tone: 'muted' | 'primary' }) {
    const border = tone === 'primary' ? 'border-primary/30' : 'border-border/50';
    const background = tone === 'primary' ? 'bg-primary/5' : 'bg-secondary/20';

    return (
        <div className={`not-prose rounded-xl border ${border} ${background} overflow-hidden`}>
            {label && (
                <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground border-b border-border/50">
                    {label}
                </div>
            )}
            <pre className="p-4 overflow-x-auto text-xs leading-relaxed">
                <code className="font-mono">{code}</code>
            </pre>
        </div>
    );
}

/** Internal links between sibling dialect pages, so none of them is a dead end. */
function RelatedDialects({ current }: { current: string }) {
    const others = DIALECT_GUIDE_LIST.filter(guide => guide.slug !== current);

    return (
        <section>
            <h2 className="text-3xl font-bold mb-6">Other SQL dialects</h2>
            <div className="not-prose grid gap-4 sm:grid-cols-2">
                {others.map(guide => (
                    <Link
                        key={guide.slug}
                        to={`/sql/${guide.slug}`}
                        className="flex items-start gap-4 p-5 rounded-xl bg-secondary/20 border border-border/50 hover:bg-secondary/40 hover:border-primary/30 transition-colors"
                    >
                        <span className="text-2xl" aria-hidden="true">{guide.icon}</span>
                        <span className="min-w-0">
                            <span className="font-semibold flex items-center gap-1">
                                {guide.name} formatter
                                <ArrowRight className="w-4 h-4 text-primary" />
                            </span>
                            <span className="block text-sm text-muted-foreground mt-1">
                                {guide.tagline}
                            </span>
                        </span>
                    </Link>
                ))}
            </div>
            <p className="mt-6">
                Not sure which one you need, or working with more than one?{' '}
                <Link to="/sql" className="text-primary hover:underline">
                    The general SQL formatter
                </Link>{' '}
                lets you switch dialects without leaving the page.
            </p>
        </section>
    );
}
