import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getPageSeo } from '@/seo/routes';

/**
 * Keeps <head> in sync during client-side navigation.
 *
 * The first paint of every route already ships the correct head, baked in by
 * scripts/prerender.mjs from the same getPageSeo() data. This component only has to
 * handle in-app navigation and language switches.
 *
 * It takes no props on purpose: the route is the single input, so two pages can no
 * longer end up sharing a title or a canonical.
 */
export const SEO = () => {
    const { pathname } = useLocation();
    const { t, i18n } = useTranslation();

    useEffect(() => {
        const seo = getPageSeo(pathname, (key: string) => t(key));

        document.title = seo.title;
        document.documentElement.lang = i18n.language || 'en';

        setMeta('name', 'description', seo.description);
        setMeta('name', 'keywords', seo.keywords);
        setMeta('name', 'robots', seo.robots);
        setMeta('property', 'og:title', seo.ogTitle);
        setMeta('property', 'og:description', seo.ogDescription);
        setMeta('property', 'og:url', seo.canonical);
        setMeta('name', 'twitter:title', seo.twitterTitle);
        setMeta('name', 'twitter:description', seo.twitterDescription);
        setMeta('name', 'twitter:url', seo.canonical);

        setCanonical(seo.canonical);
        setJsonLd(seo.jsonLd);
    }, [pathname, t, i18n.language]);

    return null;
};

function setMeta(attr: 'name' | 'property', key: string, content: string) {
    let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
    if (!content) {
        el?.remove();
        return;
    }
    if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
    }
    el.setAttribute('content', content);
}

function setCanonical(href: string) {
    let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!href) {
        el?.remove();
        return;
    }
    if (!el) {
        el = document.createElement('link');
        el.rel = 'canonical';
        document.head.appendChild(el);
    }
    el.href = href;
}

/**
 * Replaces the prerendered structured data wholesale. Blocks are tagged with
 * data-seo so the tags baked in at build time are the ones swapped out, rather than
 * accumulating a new set on every navigation.
 */
function setJsonLd(blocks: Record<string, unknown>[]) {
    document.head
        .querySelectorAll('script[type="application/ld+json"][data-seo]')
        .forEach(node => node.remove());

    for (const block of blocks) {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.setAttribute('data-seo', '');
        script.textContent = JSON.stringify(block);
        document.head.appendChild(script);
    }
}
