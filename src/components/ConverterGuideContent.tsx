import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { AdPlaceholder } from './AdPlaceholder';
import { ContentMeta } from './ContentMeta';
import { CodePanel } from './CodePanel';
import { DATA_FORMAT_LABELS } from '@/utils/format-convert';
import { CONVERTER_GUIDES, type ConverterGuide } from '@/content/converter-guides';

/**
 * Renders one converter guide page (/json/to-xml, /xml/to-json, ...). Plain markup
 * throughout: it has to exist in the prerendered HTML.
 */
export const ConverterGuideContent = ({ guide }: { guide: ConverterGuide }) => (
    <div className="space-y-12">
        <section>
            <ContentMeta updated={guide.updated} />
            {guide.intro.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
            ))}
        </section>

        <section>
            <h2 className="text-3xl font-bold mb-6">Before and after</h2>
            <p>This is loaded in the converter above.</p>
            <div className="not-prose grid gap-4 lg:grid-cols-2 my-8">
                <CodePanel label={DATA_FORMAT_LABELS[guide.fromFormat]} code={guide.sample.input} tone="muted" />
                <CodePanel label={DATA_FORMAT_LABELS[guide.toFormat]} code={guide.sample.output} tone="primary" />
            </div>
        </section>

        <div className="my-12 py-8 border-y border-border/50">
            <AdPlaceholder slotId="content-middle" />
        </div>

        <section>
            <h2 className="text-3xl font-bold mb-6">How the mapping works</h2>
            {guide.mapping.map((rule, i) => (
                <div key={i} className="mb-8">
                    <h3>{rule.heading}</h3>
                    {rule.body.map((paragraph, j) => (
                        <p key={j}>{paragraph}</p>
                    ))}
                    {rule.code && <CodePanel code={rule.code} tone="muted" />}
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

        <RelatedConverters current={`${guide.hostFormat}/${guide.slug}`} />
    </div>
);

function RelatedConverters({ current }: { current: string }) {
    const others = Object.entries(CONVERTER_GUIDES).filter(([key]) => key !== current);

    return (
        <section>
            <h2 className="text-3xl font-bold mb-6">Other conversions</h2>
            <div className="not-prose grid gap-4 sm:grid-cols-2">
                {others.map(([key, guide]) => (
                    <Link
                        key={key}
                        to={`/${key}`}
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
                Every direction between JSON, XML and YAML — including YAML as a starting
                point — is available directly from the From/To selectors in the converter
                above, whichever page you're on.
            </p>
        </section>
    );
}
