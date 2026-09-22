import { useParams } from 'react-router-dom';
import { SQLFormatter } from '@/components/SQLFormatter';
import { DialectGuideContent } from '@/components/DialectGuideContent';
import { SQLDiff } from '@/components/SQLDiff';
import { SqlToolGuideContent } from '@/components/SqlToolGuideContent';
import { getDialectGuide } from '@/content/sql-dialects';
import { getSqlToolGuide } from '@/content/sql-tools';
import NotFound from './NotFound';

/**
 * /sql/<slug> — either the formatter opened on one dialect (a DialectGuide) or a
 * dedicated SQL tool like the diff (a SqlToolGuide), each followed by reference
 * material for that specific page. The tool-guide lookup is checked first since the
 * two slug sets are disjoint but share this one route.
 */
const SQLDialectPage = () => {
    const { dialect: slug } = useParams();

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

    return (
        <SQLFormatter
            // Remount on navigation between dialects, so the preloaded query and the
            // selected grammar follow the route instead of sticking at the first one.
            key={guide.slug}
            initialDialect={guide.dialect}
            initialSql={guide.sample.messy}
            initialFormattedSql={guide.sample.formatted}
            title={guide.h1}
            subtitle={guide.tagline}
            content={<DialectGuideContent guide={guide} />}
        />
    );
};

export default SQLDialectPage;
