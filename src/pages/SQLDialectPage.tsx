import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SQLFormatter } from '@/components/SQLFormatter';
import { DialectGuideContent } from '@/components/DialectGuideContent';
import { SQLDiff } from '@/components/SQLDiff';
import { SqlToolGuideContent } from '@/components/SqlToolGuideContent';
import { getDialectGuide, localizeDialectGuide } from '@/content/sql-dialects';
import { getSqlToolGuide } from '@/content/sql-tools';
import NotFound from './NotFound';

/**
 * /sql/<slug> — either the formatter opened on one dialect (a DialectGuide) or a
 * dedicated SQL tool like the diff (a SqlToolGuide), each followed by reference
 * material for that specific page. The tool-guide lookup is checked first since the
 * two slug sets are disjoint but share this one route.
 *
 * The prerendered HTML (and the SEO metadata in src/seo/routes.ts) is always English —
 * `useTranslation()` here is only so that a visitor who has picked another language
 * from the header switcher sees the guide body in that language too, after hydration.
 * `localizeDialectGuide` falls back to English for anything a translation doesn't
 * cover, so this is never a regression for a language with partial coverage.
 */
const SQLDialectPage = () => {
    const { dialect: slug } = useParams();
    const { i18n } = useTranslation();

    const toolGuide = slug ? getSqlToolGuide(slug) : undefined;
    if (toolGuide) {
        return (
            <SQLDiff
                key={toolGuide.slug}
                initialDialect={toolGuide.dialect}
                initialBefore={toolGuide.sample.before}
                initialAfter={toolGuide.sample.after}
                initialFormattedBefore={toolGuide.formatted.before}
                initialFormattedAfter={toolGuide.formatted.after}
                title={toolGuide.h1}
                subtitle={toolGuide.tagline}
                content={<SqlToolGuideContent guide={toolGuide} />}
            />
        );
    }

    const guide = slug ? getDialectGuide(slug) : undefined;
    if (!guide) return <NotFound />;
    const localized = localizeDialectGuide(guide, i18n.language);

    return (
        <SQLFormatter
            // Remount on navigation between dialects, so the preloaded query and the
            // selected grammar follow the route instead of sticking at the first one.
            key={guide.slug}
            initialDialect={guide.dialect}
            initialSql={guide.sample.messy}
            initialFormattedSql={guide.sample.formatted}
            title={localized.h1}
            subtitle={localized.tagline}
            content={<DialectGuideContent guide={localized} />}
        />
    );
};

export default SQLDialectPage;
