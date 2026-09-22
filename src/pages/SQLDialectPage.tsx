import { useParams } from 'react-router-dom';
import { SQLFormatter } from '@/components/SQLFormatter';
import { DialectGuideContent } from '@/components/DialectGuideContent';
import { getDialectGuide } from '@/content/sql-dialects';
import NotFound from './NotFound';

/**
 * /sql/<dialect> — the formatter opened on one dialect, with that dialect's example
 * already loaded, followed by reference material written for it.
 *
 * The page is a different tool state, not just different prose: the grammar, the
 * parameter syntax and the sample query all change with the route.
 */
const SQLDialectPage = () => {
    const { dialect: slug } = useParams();
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
