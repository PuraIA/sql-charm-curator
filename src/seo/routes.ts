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
export const PRERENDER_ROUTES = [
    '/',
    '/sql',
    '/json',
    '/xml',
    '/about',
    '/contact',
    '/privacy',
    '/terms',
] as const;

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
