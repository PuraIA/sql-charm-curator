import { useTranslation } from 'react-i18next';
import { AlertTriangle } from 'lucide-react';
import { AdPlaceholder } from './AdPlaceholder';
import { ContentMeta } from './ContentMeta';
import type { XmlToolGuide } from '@/content/xml-tools';

/** Renders one /xml/<tool-slug> page (currently just /xml/xpath). */
export const XmlToolGuideContent = ({ guide }: { guide: XmlToolGuide }) => {
    const { t } = useTranslation();
    return (
        <div className="space-y-12">
            <section>
                <ContentMeta updated={guide.updated} />
                {guide.intro.map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                ))}
            </section>

            <section>
                <h2 className="text-3xl font-bold mb-6">{t('guideWorkedExamplesTitle')}</h2>
                <p>{t('guideWorkedExamplesIntro')}</p>
                <div className="not-prose space-y-3 my-6">
                    {guide.examples.map((example, i) => (
                        <div key={i} className="rounded-xl border border-border/50 bg-secondary/10 p-4">
                            <code className="font-mono text-sm text-primary block mb-2">{example.expression}</code>
                            <p className="text-sm text-muted-foreground m-0">{example.explanation}</p>
                        </div>
                    ))}
                </div>
            </section>

            <div className="my-12 py-8 border-y border-border/50">
                <AdPlaceholder slotId="content-middle" />
            </div>

            <section>
                <h2 className="text-3xl font-bold mb-6">{t('guideHowItWorksTitle')}</h2>
                {guide.sections.map((section, i) => (
                    <div key={i} className="mb-8">
                        <h3>{section.heading}</h3>
                        {section.body.map((paragraph, j) => (
                            <p key={j}>{paragraph}</p>
                        ))}
                    </div>
                ))}
            </section>

            <section>
                <h2 className="text-3xl font-bold mb-6">{t('guideKnownLimitationsTitle')}</h2>
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
                <h2 className="text-3xl font-bold mb-6">{t('guideFaqTitle', { name: guide.name })}</h2>
                <div className="not-prose grid gap-4 md:grid-cols-2">
                    {guide.faq.map((entry, i) => (
                        <div key={i} className="bg-secondary/20 p-6 rounded-xl border border-border/50">
                            <h3 className="font-bold mb-2">{entry.q}</h3>
                            <p className="text-sm text-muted-foreground">{entry.a}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};
