/**
 * Single source of truth for per-route SEO metadata.
 *
 * Consumed twice:
 *  - at build time by scripts/prerender.mjs (through src/entry-server.tsx), to bake
 *    <title>, canonical, meta and JSON-LD into each static HTML file;
 *  - at runtime by <SEO />, to keep the head in sync during client-side navigation.
 *
 * Keeping both paths on the same data is what prevents the previous bug where every
 * route shipped the homepage's title and canonical.
 */

import { DIALECT_GUIDE_LIST, DIALECT_SLUGS, getDialectGuide } from '@/content/sql-dialects';
import { SQL_TOOL_SLUGS, getSqlToolGuide } from '@/content/sql-tools';
import { JSON_GUIDE_LIST, JSON_GUIDE_SLUGS, getJsonGuide } from '@/content/json-guides';
import { XML_GUIDE_LIST, XML_GUIDE_SLUGS, getXmlGuide } from '@/content/xml-guides';
import { CONVERTER_GUIDES, getConverterGuide } from '@/content/converter-guides';
import { XML_TOOL_SLUGS, getXmlToolGuide } from '@/content/xml-tools';

/** Converter guide slugs, split by which host namespace (/json/ or /xml/) they live under. */
const CONVERTER_SLUGS_BY_HOST = Object.keys(CONVERTER_GUIDES).reduce<Record<'json' | 'xml', string[]>>(
    (acc, key) => {
        const [host, slug] = key.split('/') as ['json' | 'xml', string];
        acc[host].push(slug);
        return acc;
    },
    { json: [], xml: [] }
);

export const SITE_URL = 'https://www.prettyformat.com';

/** Minimal shape of i18next's `t`, so this module stays framework-agnostic. */
type Translate = (key: string, fallback?: string) => string;

export interface PageSeo {
    title: string;
    description: string;
    keywords: string;
    ogTitle: string;
    ogDescription: string;
    twitterTitle: string;
    twitterDescription: string;
    /** Absolute URL. Must differ per route. */
    canonical: string;
    robots: string;
    jsonLd: Record<string, unknown>[];
}

/** Routes that get a static HTML file at build time, in sitemap order. */
export const PRERENDER_ROUTES: string[] = [
    '/',
    '/sql',
    ...DIALECT_SLUGS.map(slug => `/sql/${slug}`),
    ...SQL_TOOL_SLUGS.map(slug => `/sql/${slug}`),
    '/json',
    ...JSON_GUIDE_SLUGS.map(slug => `/json/${slug}`),
    ...CONVERTER_SLUGS_BY_HOST.json.map(slug => `/json/${slug}`),
    '/xml',
    ...XML_GUIDE_SLUGS.map(slug => `/xml/${slug}`),
    ...CONVERTER_SLUGS_BY_HOST.xml.map(slug => `/xml/${slug}`),
    ...XML_TOOL_SLUGS.map(slug => `/xml/${slug}`),
    '/about',
    '/contact',
    '/privacy',
    '/terms',
];

const ORGANIZATION = {
    '@type': 'Organization',
    name: 'Pura IA',
    url: 'https://www.pura.ia.br',
};

const INDEXABLE = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

function breadcrumb(trail: { name: string; path: string }[]) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: trail.map((item, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: item.name,
            item: `${SITE_URL}${item.path}`,
        })),
    };
}

function faqPage(entries: { q: string; a: string }[]) {
    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: entries.map(({ q, a }) => ({
            '@type': 'Question',
            name: q,
            acceptedAnswer: { '@type': 'Answer', text: a },
        })),
    };
}

function webApplication(name: string, description: string, featureList: string[]) {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name,
        url: SITE_URL,
        description,
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'All',
        browserRequirements: 'Requires JavaScript',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        author: ORGANIZATION,
        featureList,
    };
}

/**
 * Resolves the metadata for a pathname. Unknown paths fall back to a noindex 404
 * profile, so soft-404 URLs never advertise themselves as indexable content.
 */
export function getPageSeo(pathname: string, t: Translate): PageSeo {
    const path = normalize(pathname);
    const canonical = `${SITE_URL}${path === '/' ? '/' : path}`;

    function converterSeo(guide: NonNullable<ReturnType<typeof getConverterGuide>>): PageSeo {
        return {
            title: guide.seoTitle,
            description: guide.seoDescription,
            keywords: guide.seoKeywords,
            ogTitle: guide.seoTitle,
            ogDescription: guide.seoDescription,
            twitterTitle: guide.seoTitle,
            twitterDescription: guide.seoDescription,
            canonical,
            robots: INDEXABLE,
            jsonLd: [
                webApplication(guide.h1, guide.seoDescription, [
                    `${guide.name} conversion`,
                    'Runs entirely in the browser',
                ]),
                {
                    '@context': 'https://schema.org',
                    '@type': 'TechArticle',
                    headline: guide.h1,
                    description: guide.seoDescription,
                    url: canonical,
                    datePublished: guide.updated,
                    dateModified: guide.updated,
                    author: ORGANIZATION,
                    publisher: ORGANIZATION,
                    articleSection: guide.mapping.map(m => m.heading),
                },
                faqPage(guide.faq.map(({ q, a }) => ({ q, a }))),
                breadcrumb([
                    { name: 'Home', path: '/' },
                    { name: guide.hostFormat === 'json' ? 'JSON Formatter' : 'XML Formatter', path: `/${guide.hostFormat}` },
                    { name: guide.name, path: `/${guide.hostFormat}/${guide.slug}` },
                ]),
            ],
        };
    }

    // /sql/<dialect> pages are driven by the content module rather than by a case here.
    if (path.startsWith('/sql/')) {
        const toolGuide = getSqlToolGuide(path.slice('/sql/'.length));
        if (toolGuide) {
            return {
                title: toolGuide.seoTitle,
                description: toolGuide.seoDescription,
                keywords: toolGuide.seoKeywords,
                ogTitle: toolGuide.seoTitle,
                ogDescription: toolGuide.seoDescription,
                twitterTitle: toolGuide.seoTitle,
                twitterDescription: toolGuide.seoDescription,
                canonical,
                robots: INDEXABLE,
                jsonLd: [
                    webApplication(toolGuide.h1, toolGuide.seoDescription, [
                        'Line-level diff after formatting both sides identically',
                        'Runs entirely in the browser',
                    ]),
                    {
                        '@context': 'https://schema.org',
                        '@type': 'TechArticle',
                        headline: toolGuide.h1,
                        description: toolGuide.seoDescription,
                        url: canonical,
                        datePublished: toolGuide.updated,
                        dateModified: toolGuide.updated,
                        author: ORGANIZATION,
                        publisher: ORGANIZATION,
                        articleSection: toolGuide.sections.map(s => s.heading),
                    },
                    faqPage(toolGuide.faq.map(({ q, a }) => ({ q, a }))),
                    breadcrumb([
                        { name: 'Home', path: '/' },
                        { name: 'SQL Formatter', path: '/sql' },
                        { name: toolGuide.name, path: `/sql/${toolGuide.slug}` },
                    ]),
                ],
            };
        }

        const guide = getDialectGuide(path.slice('/sql/'.length));
        if (guide) {
            return {
                title: guide.seoTitle,
                description: guide.seoDescription,
                keywords: guide.seoKeywords,
                ogTitle: guide.seoTitle,
                ogDescription: guide.seoDescription,
                twitterTitle: guide.seoTitle,
                twitterDescription: guide.seoDescription,
                canonical,
                robots: INDEXABLE,
                jsonLd: [
                    webApplication(guide.h1, guide.seoDescription, [
                        `${guide.name} grammar`,
                        'Configurable keyword and identifier casing',
                        'Adjustable indentation and expression width',
                        'Runs entirely in the browser',
                    ]),
                    {
                        '@context': 'https://schema.org',
                        '@type': 'TechArticle',
                        headline: guide.h1,
                        description: guide.seoDescription,
                        url: canonical,
                        datePublished: guide.updated,
                        dateModified: guide.updated,
                        author: ORGANIZATION,
                        publisher: ORGANIZATION,
                        // Mirrors the "Known limitations" and "What is specific to" headings.
                        articleSection: guide.quirks.map(q => q.heading),
                    },
                    faqPage(guide.faq.map(({ q, a }) => ({ q, a }))),
                    breadcrumb([
                        { name: 'Home', path: '/' },
                        { name: 'SQL Formatter', path: '/sql' },
                        { name: guide.name, path: `/sql/${guide.slug}` },
                    ]),
                ],
            };
        }
    }

    if (path.startsWith('/json/')) {
        const converterGuide = getConverterGuide('json', path.slice('/json/'.length));
        if (converterGuide) return converterSeo(converterGuide);

        const guide = getJsonGuide(path.slice('/json/'.length));
        if (guide) {
            return {
                title: guide.seoTitle,
                description: guide.seoDescription,
                keywords: guide.seoKeywords,
                ogTitle: guide.seoTitle,
                ogDescription: guide.seoDescription,
                twitterTitle: guide.seoTitle,
                twitterDescription: guide.seoDescription,
                canonical,
                robots: INDEXABLE,
                jsonLd: [
                    webApplication(guide.h1, guide.seoDescription, [
                        `${guide.name} tool state`,
                        'Runs entirely in the browser',
                    ]),
                    {
                        '@context': 'https://schema.org',
                        '@type': 'TechArticle',
                        headline: guide.h1,
                        description: guide.seoDescription,
                        url: canonical,
                        datePublished: guide.updated,
                        dateModified: guide.updated,
                        author: ORGANIZATION,
                        publisher: ORGANIZATION,
                        articleSection: guide.sections.map(s => s.heading),
                    },
                    faqPage(guide.faq.map(({ q, a }) => ({ q, a }))),
                    breadcrumb([
                        { name: 'Home', path: '/' },
                        { name: 'JSON Formatter', path: '/json' },
                        { name: guide.name, path: `/json/${guide.slug}` },
                    ]),
                ],
            };
        }
    }

    if (path.startsWith('/xml/')) {
        const toolGuide = getXmlToolGuide(path.slice('/xml/'.length));
        if (toolGuide) {
            return {
                title: toolGuide.seoTitle,
                description: toolGuide.seoDescription,
                keywords: toolGuide.seoKeywords,
                ogTitle: toolGuide.seoTitle,
                ogDescription: toolGuide.seoDescription,
                twitterTitle: toolGuide.seoTitle,
                twitterDescription: toolGuide.seoDescription,
                canonical,
                robots: INDEXABLE,
                jsonLd: [
                    webApplication(toolGuide.h1, toolGuide.seoDescription, [
                        'Scoped XPath 1.0 evaluation',
                        'Runs entirely in the browser',
                    ]),
                    {
                        '@context': 'https://schema.org',
                        '@type': 'TechArticle',
                        headline: toolGuide.h1,
                        description: toolGuide.seoDescription,
                        url: canonical,
                        datePublished: toolGuide.updated,
                        dateModified: toolGuide.updated,
                        author: ORGANIZATION,
                        publisher: ORGANIZATION,
                        articleSection: toolGuide.sections.map(s => s.heading),
                    },
                    faqPage(toolGuide.faq.map(({ q, a }) => ({ q, a }))),
                    breadcrumb([
                        { name: 'Home', path: '/' },
                        { name: 'XML Formatter', path: '/xml' },
                        { name: toolGuide.name, path: `/xml/${toolGuide.slug}` },
                    ]),
                ],
            };
        }

        const converterGuide = getConverterGuide('xml', path.slice('/xml/'.length));
        if (converterGuide) return converterSeo(converterGuide);

        const guide = getXmlGuide(path.slice('/xml/'.length));
        if (guide) {
            return {
                title: guide.seoTitle,
                description: guide.seoDescription,
                keywords: guide.seoKeywords,
                ogTitle: guide.seoTitle,
                ogDescription: guide.seoDescription,
                twitterTitle: guide.seoTitle,
                twitterDescription: guide.seoDescription,
                canonical,
                robots: INDEXABLE,
                jsonLd: [
                    webApplication(guide.h1, guide.seoDescription, [
                        `${guide.name} tool state`,
                        'Runs entirely in the browser',
                    ]),
                    {
                        '@context': 'https://schema.org',
                        '@type': 'TechArticle',
                        headline: guide.h1,
                        description: guide.seoDescription,
                        url: canonical,
                        datePublished: guide.updated,
                        dateModified: guide.updated,
                        author: ORGANIZATION,
                        publisher: ORGANIZATION,
                        articleSection: guide.sections.map(s => s.heading),
                    },
                    faqPage(guide.faq.map(({ q, a }) => ({ q, a }))),
                    breadcrumb([
                        { name: 'Home', path: '/' },
                        { name: 'XML Formatter', path: '/xml' },
                        { name: guide.name, path: `/xml/${guide.slug}` },
                    ]),
                ],
            };
        }
    }

    switch (path) {
        case '/':
            return {
                title: t('homeSeoTitle'),
                description: t('homeSeoDescription'),
                keywords: t('homeSeoKeywords'),
                ogTitle: t('homeOgTitle'),
                ogDescription: t('homeOgDescription'),
                twitterTitle: t('homeTwitterTitle'),
                twitterDescription: t('homeTwitterDescription'),
                canonical,
                robots: INDEXABLE,
                jsonLd: [
                    {
                        '@context': 'https://schema.org',
                        '@type': 'WebSite',
                        name: 'Pretty Format',
                        url: SITE_URL,
                        description: t('homeSeoDescription'),
                        publisher: ORGANIZATION,
                        inLanguage: ['en', 'pt', 'es', 'de', 'fr', 'zh', 'ja'],
                    },
                    {
                        '@context': 'https://schema.org',
                        '@type': 'ItemList',
                        name: t('homeTitle'),
                        itemListElement: [
                            { '@type': 'ListItem', position: 1, name: t('sqlCardTitle'), url: `${SITE_URL}/sql` },
                            { '@type': 'ListItem', position: 2, name: t('jsonCardTitle'), url: `${SITE_URL}/json` },
                            { '@type': 'ListItem', position: 3, name: t('xmlCardTitle'), url: `${SITE_URL}/xml` },
                        ],
                    },
                    breadcrumb([{ name: 'Home', path: '/' }]),
                ],
            };

        case '/sql':
            return {
                title: t('seoTitle'),
                description: t('seoDescription'),
                keywords: t('seoKeywords'),
                ogTitle: t('ogTitle'),
                ogDescription: t('ogDescription'),
                twitterTitle: t('twitterTitle'),
                twitterDescription: t('twitterDescription'),
                canonical,
                robots: INDEXABLE,
                jsonLd: [
                    webApplication(t('title'), t('seoDescription'), [
                        'PostgreSQL formatting',
                        'MySQL formatting',
                        'Oracle PL/SQL formatting',
                        'SQL Server T-SQL formatting',
                        'BigQuery formatting',
                        'Customizable keyword casing',
                        'Adjustable indentation',
                    ]),
                    // Mirrors the questions actually rendered by <FormatterFAQ />.
                    faqPage([
                        { q: t('faq1Question'), a: t('faq1Answer') },
                        { q: t('faq2Question'), a: t('faq2Answer') },
                        { q: t('faq3Question'), a: t('faq3Answer') },
                    ]),
                    {
                        '@context': 'https://schema.org',
                        '@type': 'ItemList',
                        name: 'SQL formatters by dialect',
                        itemListElement: DIALECT_GUIDE_LIST.map((guide, i) => ({
                            '@type': 'ListItem',
                            position: i + 1,
                            name: guide.h1,
                            url: `${SITE_URL}/sql/${guide.slug}`,
                        })),
                    },
                    breadcrumb([
                        { name: 'Home', path: '/' },
                        { name: t('title'), path: '/sql' },
                    ]),
                ],
            };

        case '/json':
            return {
                title: t('jsonSeoTitle'),
                description: t('jsonSeoDescription'),
                keywords: t('jsonSeoKeywords'),
                ogTitle: t('jsonOgTitle'),
                ogDescription: t('jsonOgDescription'),
                twitterTitle: t('jsonTwitterTitle'),
                twitterDescription: t('jsonTwitterDescription'),
                canonical,
                robots: INDEXABLE,
                jsonLd: [
                    webApplication(t('jsonTitle'), t('jsonSeoDescription'), [
                        'JSON validation',
                        'JSON beautify and minify',
                        'Recursive key sorting',
                        'Unicode escaping',
                        'Tree and table views',
                    ]),
                    // Mirrors the questions actually rendered by <JSONContent />.
                    faqPage([
                        {
                            q: 'Can JSON contain comments?',
                            a: 'Standard JSON (RFC 8259) does not support comments. Some variations like JSONC (JSON with Comments) do, but for standard compatibility you should avoid them in data exchange files.',
                        },
                        {
                            q: 'Is there a maximum size for JSON files?',
                            a: "While the specification doesn't set a hard limit, practical limits are determined by the memory available to the parsing environment. For files larger than 100MB, streaming parsers are recommended over standard JSON.parse().",
                        },
                    ]),
                    {
                        '@context': 'https://schema.org',
                        '@type': 'ItemList',
                        name: 'JSON tools',
                        itemListElement: JSON_GUIDE_LIST.map((guide, i) => ({
                            '@type': 'ListItem',
                            position: i + 1,
                            name: guide.h1,
                            url: `${SITE_URL}/json/${guide.slug}`,
                        })),
                    },
                    breadcrumb([
                        { name: 'Home', path: '/' },
                        { name: t('jsonTitle'), path: '/json' },
                    ]),
                ],
            };

        case '/xml':
            return {
                title: t('xmlSeoTitle'),
                description: t('xmlSeoDescription'),
                keywords: t('xmlSeoKeywords'),
                ogTitle: t('xmlOgTitle'),
                ogDescription: t('xmlOgDescription'),
                twitterTitle: t('xmlTwitterTitle'),
                twitterDescription: t('xmlTwitterDescription'),
                canonical,
                robots: INDEXABLE,
                jsonLd: [
                    webApplication(t('xmlTitle'), t('xmlSeoDescription'), [
                        'Well-formedness checking',
                        'Hierarchical indentation',
                        'Namespace preservation',
                        'CDATA and comment preservation',
                        'XML minification',
                    ]),
                    // Mirrors the questions actually rendered by <XMLContent />.
                    faqPage([
                        {
                            q: 'What is CDATA in XML?',
                            a: 'CDATA blocks include text that would otherwise be interpreted as markup. To store an HTML or JavaScript snippet inside XML, wrap it in <![CDATA[ ... ]]> so the parser ignores any angle brackets inside.',
                        },
                        {
                            q: 'Can XML have empty elements?',
                            a: 'Yes. An empty element can be written as <item></item> or with the shorthand <item/>. Both are correct and treated identically by parsers.',
                        },
                    ]),
                    {
                        '@context': 'https://schema.org',
                        '@type': 'ItemList',
                        name: 'XML tools',
                        itemListElement: XML_GUIDE_LIST.map((guide, i) => ({
                            '@type': 'ListItem',
                            position: i + 1,
                            name: guide.h1,
                            url: `${SITE_URL}/xml/${guide.slug}`,
                        })),
                    },
                    breadcrumb([
                        { name: 'Home', path: '/' },
                        { name: t('xmlTitle'), path: '/xml' },
                    ]),
                ],
            };

        case '/about': {
            const title = `${t('aboutTitle')} | Pretty Format`;
            return {
                title,
                description: t('aboutIntroContent'),
                keywords: t('aboutKeywords'),
                ogTitle: title,
                ogDescription: t('aboutIntroContent'),
                twitterTitle: title,
                twitterDescription: t('aboutIntroContent'),
                canonical,
                robots: INDEXABLE,
                jsonLd: [
                    {
                        '@context': 'https://schema.org',
                        '@type': 'AboutPage',
                        name: title,
                        url: canonical,
                        description: t('aboutIntroContent'),
                        publisher: ORGANIZATION,
                    },
                    breadcrumb([
                        { name: 'Home', path: '/' },
                        { name: t('aboutTitle'), path: '/about' },
                    ]),
                ],
            };
        }

        case '/contact': {
            const title = `${t('contactTitle')} | Pretty Format`;
            return {
                title,
                description: t('contactSubtitle'),
                keywords: t('contactKeywords'),
                ogTitle: title,
                ogDescription: t('contactSubtitle'),
                twitterTitle: title,
                twitterDescription: t('contactSubtitle'),
                canonical,
                robots: INDEXABLE,
                jsonLd: [
                    {
                        '@context': 'https://schema.org',
                        '@type': 'ContactPage',
                        name: title,
                        url: canonical,
                        description: t('contactSubtitle'),
                        publisher: ORGANIZATION,
                    },
                    breadcrumb([
                        { name: 'Home', path: '/' },
                        { name: t('contactTitle'), path: '/contact' },
                    ]),
                ],
            };
        }

        case '/privacy': {
            const title = `${t('privacyPolicyTitle')} | Pretty Format`;
            const description = t('privacyIntroContent');
            return {
                title,
                description,
                keywords: 'privacy policy, data protection, gdpr, lgpd, cookies, google adsense',
                ogTitle: title,
                ogDescription: description,
                twitterTitle: title,
                twitterDescription: description,
                canonical,
                robots: INDEXABLE,
                jsonLd: [
                    {
                        '@context': 'https://schema.org',
                        '@type': 'WebPage',
                        name: title,
                        url: canonical,
                        description,
                        publisher: ORGANIZATION,
                    },
                    breadcrumb([
                        { name: 'Home', path: '/' },
                        { name: t('privacyPolicyTitle'), path: '/privacy' },
                    ]),
                ],
            };
        }

        case '/terms': {
            const title = `${t('termsTitle')} | Pretty Format`;
            const description = t('termsIntroContent');
            return {
                title,
                description,
                keywords: 'terms of service, terms of use, acceptable use, disclaimer',
                ogTitle: title,
                ogDescription: description,
                twitterTitle: title,
                twitterDescription: description,
                canonical,
                robots: INDEXABLE,
                jsonLd: [
                    {
                        '@context': 'https://schema.org',
                        '@type': 'WebPage',
                        name: title,
                        url: canonical,
                        description,
                        publisher: ORGANIZATION,
                    },
                    breadcrumb([
                        { name: 'Home', path: '/' },
                        { name: t('termsTitle'), path: '/terms' },
                    ]),
                ],
            };
        }

        default: {
            // Anything not on the route table is a 404. Never advertise it as indexable.
            const title = '404 - Page Not Found | Pretty Format';
            return {
                title,
                description: 'The page you are looking for does not exist.',
                keywords: '',
                ogTitle: title,
                ogDescription: 'The page you are looking for does not exist.',
                twitterTitle: title,
                twitterDescription: 'The page you are looking for does not exist.',
                // Deliberately empty: a 404 body is not the canonical version of anything.
                canonical: '',
                robots: 'noindex, follow',
                jsonLd: [],
            };
        }
    }
}

/** `/sql/` and `/SQL` resolve to the same route as `/sql`. */
function normalize(pathname: string): string {
    if (!pathname) return '/';
    const withoutTrailingSlash = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
    const lower = (withoutTrailingSlash || '/').toLowerCase();
    // /privacy-policy is an alias route kept for backwards compatibility.
    return lower === '/privacy-policy' ? '/privacy' : lower;
}
