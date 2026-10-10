import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import { DIALECT_GUIDE_LIST, localizeDialectGuide } from '@/content/sql-dialects';
import { SQL_TOOL_GUIDES, localizeSqlToolGuide } from '@/content/sql-tools';
import { JSON_GUIDE_LIST, localizeJsonGuide } from '@/content/json-guides';
import { XML_GUIDE_LIST, localizeXmlGuide } from '@/content/xml-guides';
import { converterGuidesFor, localizeConverterGuide } from '@/content/converter-guides';
import { XML_TOOL_GUIDES, localizeXmlToolGuide } from '@/content/xml-tools';
import { BLOG_POSTS } from '@/content/blog';

/**
 * Every tool page and the latest articles, linked from the homepage.
 *
 * The homepage is the page search engines crawl most often; before this it linked only
 * to the three hubs, so every guide page sat two clicks deep and most of them were still
 * "Discovered – currently not indexed" in Search Console. Labels come from the same
 * content modules (and translations) as the pages themselves.
 */
export function HomeDirectory() {
    const { t, i18n } = useTranslation();
    const lng = i18n.language;

    const groups = [
        {
            title: 'SQL',
            hub: '/sql',
            links: [
                ...DIALECT_GUIDE_LIST.map(g => ({ to: `/sql/${g.slug}`, label: localizeDialectGuide(g, lng).h1 })),
                ...Object.values(SQL_TOOL_GUIDES).map(g => ({ to: `/sql/${g.slug}`, label: localizeSqlToolGuide(g, lng).h1 })),
            ],
        },
        {
            title: 'JSON',
            hub: '/json',
            links: [
                ...JSON_GUIDE_LIST.map(g => ({ to: `/json/${g.slug}`, label: localizeJsonGuide(g, lng).h1 })),
                ...converterGuidesFor('json').map(g => ({ to: `/json/${g.slug}`, label: localizeConverterGuide(g, lng).h1 })),
            ],
        },
        {
            title: 'XML',
            hub: '/xml',
            links: [
                ...XML_GUIDE_LIST.map(g => ({ to: `/xml/${g.slug}`, label: localizeXmlGuide(g, lng).h1 })),
                ...converterGuidesFor('xml').map(g => ({ to: `/xml/${g.slug}`, label: localizeConverterGuide(g, lng).h1 })),
                ...Object.values(XML_TOOL_GUIDES).map(g => ({ to: `/xml/${g.slug}`, label: localizeXmlToolGuide(g, lng).h1 })),
            ],
        },
    ];

    return (
        <>
            <section aria-labelledby="home-directory-title" className="mb-20">
                <h2 id="home-directory-title" className="text-3xl font-bold mb-3">
                    {t('homeDirectoryTitle')}
                </h2>
                <p className="text-muted-foreground mb-8 max-w-3xl">{t('homeDirectoryIntro')}</p>
                <div className="grid gap-8 md:grid-cols-3">
                    {groups.map(group => (
                        <nav key={group.title} aria-label={group.title}>
                            <h3 className="font-bold text-lg mb-3">
                                <Link to={group.hub} className="hover:text-primary transition-colors">
                                    {group.title}
                                </Link>
                            </h3>
                            <ul className="space-y-2">
                                {group.links.map(link => (
                                    <li key={link.to}>
                                        <Link
                                            to={link.to}
                                            className="text-sm text-muted-foreground hover:text-primary transition-colors"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    ))}
                </div>
            </section>

            <section aria-labelledby="home-articles-title" className="mb-20">
                <div className="flex flex-wrap items-baseline justify-between gap-4 mb-6">
                    <h2 id="home-articles-title" className="text-3xl font-bold">
                        {t('homeLatestArticlesTitle')}
                    </h2>
                    <Link to="/blog" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                        {t('homeAllArticlesLink')}
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
                <div className="grid gap-6 md:grid-cols-3">
                    {BLOG_POSTS.slice(0, 3).map(post => (
                        <Link
                            key={post.slug}
                            to={`/blog/${post.slug}`}
                            className="block rounded-xl border border-border/50 bg-secondary/10 p-6 hover:border-primary/30 hover:bg-secondary/30 transition-colors"
                        >
                            <span className="block text-xs text-muted-foreground mb-2">{post.tags.join(' · ')}</span>
                            <span className="block font-bold mb-2">{post.title}</span>
                            <span className="block text-sm text-muted-foreground">{post.description}</span>
                        </Link>
                    ))}
                </div>
            </section>
        </>
    );
}
