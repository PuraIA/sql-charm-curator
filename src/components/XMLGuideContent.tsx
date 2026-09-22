import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { AdPlaceholder } from './AdPlaceholder';
import { ContentMeta } from './ContentMeta';
import { CodePanel } from './CodePanel';
import { XML_GUIDE_LIST, type XmlGuide } from '@/content/xml-guides';

/**
 * Renders one /xml/<slug> page. Plain markup throughout: it has to exist in the
 * prerendered HTML, so nothing here waits on a lazy chunk or client-only state.
 */
export const XMLGuideContent = ({ guide }: { guide: XmlGuide }) => (
    <div className="space-y-12">
        <section>
            <ContentMeta updated={guide.updated} />
            {guide.intro.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
            ))}
        </section>

        {guide.sample && (
            <section>
                <h2 className="text-3xl font-bold mb-6">Before and after</h2>
                <p>
                    This is loaded in the editor above with Compact Mode off. Toggle it on to see this
                    exact transform happen live.
                </p>
                <div className="not-prose grid gap-4 lg:grid-cols-2 my-8">
                    <CodePanel label="Pretty" code={guide.sample.input} tone="muted" />
                    <CodePanel label="Compact Mode on" code={guide.sample.output} tone="primary" />
                </div>
                <ByteStat input={guide.sample.input} output={guide.sample.output} />
            </section>
        )}

        <div className="my-12 py-8 border-y border-border/50">
            <AdPlaceholder slotId="content-middle" />
        </div>

        <section>
            <h2 className="text-3xl font-bold mb-6">How it works</h2>
            {guide.sections.map((section, i) => (
                <div key={i} className="mb-8">
                    <h3>{section.heading}</h3>
                    {section.body.map((paragraph, j) => (
                        <p key={j}>{paragraph}</p>
                    ))}
                    {section.code && <CodePanel code={section.code} tone="muted" />}
                </div>
            ))}
        </section>

        {guide.invalidExamples && (
            <section>
                <h2 className="text-3xl font-bold mb-6">Not well-formed, and which rule it breaks</h2>
                <p>
                    The exact error text depends on which browser's XML parser produced it, so each
                    example names the well-formedness rule instead — that rule is the same everywhere.
                </p>
                <div className="not-prose space-y-4 my-6">
                    {guide.invalidExamples.map((example, i) => (
                        <div key={i} className="rounded-xl border border-border/50 bg-secondary/10 overflow-hidden">
                            <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground border-b border-border/50">
                                {example.label}
                            </div>
                            <pre className="p-4 overflow-x-auto text-xs leading-relaxed border-b border-border/50">
                                <code className="font-mono">{example.code}</code>
                            </pre>
                            <p className="p-4 text-sm text-muted-foreground m-0">{example.rule}</p>
                        </div>
                    ))}
                </div>
            </section>
        )}

        <section>
            <h2 className="text-3xl font-bold mb-6">Known limitations</h2>
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

        <div className="my-12 py-8 border-y border-border/50">
            <AdPlaceholder slotId="content-bottom" />
        </div>

        <section>
            <h2 className="text-3xl font-bold mb-6">{guide.name} FAQ</h2>
            <div className="not-prose grid gap-4 md:grid-cols-2">
                {guide.faq.map((entry, i) => (
                    <div key={i} className="bg-secondary/20 p-6 rounded-xl border border-border/50">
                        <h3 className="font-bold mb-2">{entry.q}</h3>
                        <p className="text-sm text-muted-foreground">{entry.a}</p>
                    </div>
                ))}
            </div>
        </section>

        <RelatedXmlGuides current={guide.slug} />
    </div>
);

/** Computed from the actual strings, so the percentage can never drift from the sample. */
function ByteStat({ input, output }: { input: string; output: string }) {
    const before = new Blob([input]).size;
    const after = new Blob([output]).size;
    const pct = Math.round((1 - after / before) * 100);

    return (
        <p className="not-prose text-sm text-muted-foreground">
            {before.toLocaleString('en-US')} bytes &rarr; {after.toLocaleString('en-US')} bytes
            {pct > 0 && <> — a {pct}% reduction on this sample.</>}
        </p>
    );
}

function RelatedXmlGuides({ current }: { current: string }) {
    const others = XML_GUIDE_LIST.filter(guide => guide.slug !== current);

    return (
        <section>
            <h2 className="text-3xl font-bold mb-6">Other XML tools</h2>
            <div className="not-prose grid gap-4 sm:grid-cols-2">
                {others.map(guide => (
                    <Link
                        key={guide.slug}
                        to={`/xml/${guide.slug}`}
                        className="flex items-start gap-4 p-5 rounded-xl bg-secondary/20 border border-border/50 hover:bg-secondary/40 hover:border-primary/30 transition-colors"
                    >
                        <span className="min-w-0">
                            <span className="font-semibold flex items-center gap-1">
                                {guide.name}
                                <ArrowRight className="w-4 h-4 text-primary" />
                            </span>
                            <span className="block text-sm text-muted-foreground mt-1">{guide.tagline}</span>
                        </span>
                    </Link>
                ))}
            </div>
            <p className="mt-6">
                Need the full formatter, without a specific guide attached?{' '}
                <Link to="/xml" className="text-primary hover:underline">
                    The general XML formatter
                </Link>{' '}
                has the same beautifier and Compact Mode switch.
            </p>
        </section>
    );
}
