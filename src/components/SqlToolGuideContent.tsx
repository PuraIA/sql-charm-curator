import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { AdPlaceholder } from './AdPlaceholder';
import { ContentMeta } from './ContentMeta';
import { CodePanel } from './CodePanel';
import { DIALECT_GUIDE_LIST } from '@/content/sql-dialects';
import type { SqlToolGuide } from '@/content/sql-tools';

/** Renders one /sql/<tool-slug> page (currently just /sql/diff). */
export const SqlToolGuideContent = ({ guide }: { guide: SqlToolGuide }) => (
    <div className="space-y-12">
        <section>
            <ContentMeta updated={guide.updated} />
            {guide.intro.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
            ))}
        </section>

        <section>
            <h2 className="text-3xl font-bold mb-6">The example, before and after formatting</h2>
            <p>This is loaded into the Before/After editors above.</p>
            <div className="not-prose grid gap-4 lg:grid-cols-2 my-8">
                <CodePanel label="Before, formatted" code={guide.formatted.before} tone="muted" />
                <CodePanel label="After, formatted" code={guide.formatted.after} tone="primary" />
            </div>
        </section>

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

        <section>
            <h2 className="text-3xl font-bold mb-6">SQL dialect formatters</h2>
            <div className="not-prose grid gap-4 sm:grid-cols-2">
                {DIALECT_GUIDE_LIST.map(dialectGuide => (
                    <Link
                        key={dialectGuide.slug}
                        to={`/sql/${dialectGuide.slug}`}
                        className="flex items-start gap-4 p-5 rounded-xl bg-secondary/20 border border-border/50 hover:bg-secondary/40 hover:border-primary/30 transition-colors"
                    >
                        <span className="text-2xl" aria-hidden="true">{dialectGuide.icon}</span>
                        <span className="min-w-0">
                            <span className="font-semibold flex items-center gap-1">
                                {dialectGuide.name} formatter
                                <ArrowRight className="w-4 h-4 text-primary" />
                            </span>
                            <span className="block text-sm text-muted-foreground mt-1">{dialectGuide.tagline}</span>
                        </span>
                    </Link>
                ))}
            </div>
        </section>
    </div>
);
