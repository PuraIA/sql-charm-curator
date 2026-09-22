import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { dialectIcons, dialectLabels, Dialect } from './SQLFormatter';
import { DIALECT_GUIDE_LIST } from '@/content/sql-dialects';
import { SQL_TOOL_GUIDES, SQL_TOOL_SLUGS } from '@/content/sql-tools';

/** Dialects that have a dedicated reference page, keyed by formatter language id. */
const GUIDE_BY_DIALECT = new Map(DIALECT_GUIDE_LIST.map(guide => [guide.dialect, guide]));

export const SQLInfo = () => {
    const { t } = useTranslation();

    return (
        <div className="mt-12">
            {/* SEO Content Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <section>
                    <h2 className="text-2xl font-bold mb-4">{t('whyFormatTitle')}</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        {t('whyFormatDescription')}
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-4">{t('featuresTitle')}</h2>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <li className="bg-secondary/30 p-4 rounded-lg border border-border/50">
                            <h3 className="font-semibold mb-1">{t('feature1Title')}</h3>
                            <p className="text-xs text-muted-foreground">{t('feature1Desc')}</p>
                        </li>
                        <li className="bg-secondary/30 p-4 rounded-lg border border-border/50">
                            <h3 className="font-semibold mb-1">{t('feature2Title')}</h3>
                            <p className="text-xs text-muted-foreground">{t('feature2Desc')}</p>
                        </li>
                        <li className="bg-secondary/30 p-4 rounded-lg border border-border/50">
                            <h3 className="font-semibold mb-1">{t('feature3Title')}</h3>
                            <p className="text-xs text-muted-foreground">{t('feature3Desc')}</p>
                        </li>
                        <li className="bg-secondary/30 p-4 rounded-lg border border-border/50">
                            <h3 className="font-semibold mb-1">{t('feature4Title')}</h3>
                            <p className="text-xs text-muted-foreground">{t('feature4Desc')}</p>
                        </li>
                    </ul>
                </section>
            </div>

            <section className="mb-16 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <h2 className="text-2xl font-bold mb-6 text-center">{t('supportedDialects')}</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {Object.entries(dialectLabels).map(([key, label]) => {
                        const guide = GUIDE_BY_DIALECT.get(key as Dialect);
                        const body = (
                            <>
                                <span className="text-3xl mb-2">{dialectIcons[key as Dialect]}</span>
                                <span className="font-medium text-sm">{label}</span>
                                <p className="text-[10px] text-center text-muted-foreground mt-2">
                                    {t(`${key}Desc`)}
                                </p>
                            </>
                        );
                        const className = 'flex flex-col items-center p-4 rounded-xl bg-secondary/20 border border-border/50 hover:bg-secondary/40 transition-colors';

                        // Standard SQL has no dedicated page; the others link to their guide.
                        return guide ? (
                            <Link
                                key={key}
                                to={`/sql/${guide.slug}`}
                                className={`${className} hover:border-primary/30`}
                                title={`${label} formatter and reference`}
                            >
                                {body}
                            </Link>
                        ) : (
                            <div key={key} className={className}>{body}</div>
                        );
                    })}
                </div>
            </section>

            <section className="mb-16 animate-fade-in" style={{ animationDelay: '0.35s' }}>
                <h2 className="text-2xl font-bold mb-6 text-center">SQL tools</h2>
                <div className="not-prose grid gap-4 sm:grid-cols-2 max-w-2xl mx-auto">
                    {SQL_TOOL_SLUGS.map(slug => {
                        const guide = SQL_TOOL_GUIDES[slug];
                        return (
                            <Link
                                key={slug}
                                to={`/sql/${slug}`}
                                className="flex items-start gap-2 p-4 rounded-xl bg-secondary/20 border border-border/50 hover:bg-secondary/40 hover:border-primary/30 transition-colors"
                            >
                                <span className="min-w-0">
                                    <span className="font-semibold text-sm flex items-center gap-1">
                                        {guide.name}
                                        <ArrowRight className="w-3.5 h-3.5 text-primary" />
                                    </span>
                                    <span className="block text-xs text-muted-foreground mt-1">{guide.tagline}</span>
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </section>

            <section className="max-w-3xl mx-auto mb-16 p-8 rounded-2xl bg-primary/5 border border-primary/10 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <h2 className="text-2xl font-bold mb-6 text-center">{t('howToUseTitle')}</h2>
                <div className="space-y-4 text-muted-foreground">
                    <p>{t('howToUseStep1')}</p>
                    <p>{t('howToUseStep2')}</p>
                    <p>{t('howToUseStep3')}</p>
                    <p>{t('howToUseStep4')}</p>
                </div>
            </section>
        </div>
    );
};
