import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { AdPlaceholder } from './AdPlaceholder';
import { ContentMeta } from './ContentMeta';
import { CodePanel } from './CodePanel';
import { LinkedSentence } from './LinkedSentence';
import { DIALECT_GUIDE_LIST, localizeDialectGuide, type DialectGuide } from '@/content/sql-dialects';

/**
 * Renders one dialect reference page.
 *
 * Everything here is plain markup on purpose: it has to be present in the prerendered
 * HTML, so no lazy chunks and no syntax highlighting that only initialises on the
 * client. `guide` is expected to already be localized (see SQLDialectPage.tsx) — this
 * component only translates its own chrome (headings, labels), not the guide's prose.
 */
export const DialectGuideContent = ({ guide }: { guide: DialectGuide }) => {
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
                <h2 className="text-3xl font-bold mb-6">
                    {t('guideBeforeAfterTitle')}
                </h2>
                <p>{t('guideDialectBeforeAfterIntro')}</p>
                <div className="not-prose grid gap-4 lg:grid-cols-2 my-8">
                    <CodePanel label={t('guidePastedLabel')} code={guide.sample.messy} tone="muted" />
                    <CodePanel label={t('guideFormattedLabel')} code={guide.sample.formatted} tone="primary" />
                </div>
            </section>

            <div className="my-12 py-8 border-y border-border/50">
                <AdPlaceholder slotId="content-middle" />
            </div>

            <section>
                <h2 className="text-3xl font-bold mb-6">
                    {t('guideSpecificToTitle', { name: guide.name })}
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
                <h2 className="text-3xl font-bold mb-6">{t('guideKnownLimitationsTitle')}</h2>
                <p>{t('guideDialectLimitationsIntro')}</p>
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
                <h2 className="text-3xl font-bold mb-6">{t('guideConventionsTitle')}</h2>
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
                <h2 className="text-3xl font-bold mb-6">{t('guideDialectFaqTitle', { name: guide.name })}</h2>
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
};

/** Internal links between sibling dialect pages, so none of them is a dead end. */
function RelatedDialects({ current }: { current: string }) {
    const { t, i18n } = useTranslation();
    const others = DIALECT_GUIDE_LIST.filter(guide => guide.slug !== current).map(guide =>
        localizeDialectGuide(guide, i18n.language)
    );

    return (
        <section>
            <h2 className="text-3xl font-bold mb-6">{t('guideOtherDialectsTitle')}</h2>
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
                                {guide.name} {t('guideDialectFormatterLinkSuffix')}
                                <ArrowRight className="w-4 h-4 text-primary" />
                            </span>
                            <span className="block text-sm text-muted-foreground mt-1">
                                {guide.tagline}
                            </span>
                        </span>
                    </Link>
                ))}
            </div>
            <LinkedSentence
                i18nKey="guideOtherDialectsOutro"
                to="/sql"
                linkTextKey="guideGeneralSqlFormatterLink"
            />
        </section>
    );
}
