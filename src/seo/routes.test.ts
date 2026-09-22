import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { getPageSeo, PRERENDER_ROUTES, SITE_URL } from './routes';

const translation = JSON.parse(
    readFileSync(new URL('../../public/locales/en/translation.json', import.meta.url), 'utf8')
) as Record<string, string>;

/** Mirrors i18next: a missing key resolves to the key itself. */
const t = (key: string) => translation[key] ?? key;

describe('getPageSeo', () => {
    it('gives every route its own canonical URL', () => {
        const canonicals = PRERENDER_ROUTES.map(route => getPageSeo(route, t).canonical);
        expect(new Set(canonicals).size).toBe(PRERENDER_ROUTES.length);
    });

    it('gives every route its own title and description', () => {
        const titles = PRERENDER_ROUTES.map(route => getPageSeo(route, t).title);
        const descriptions = PRERENDER_ROUTES.map(route => getPageSeo(route, t).description);
        expect(new Set(titles).size).toBe(PRERENDER_ROUTES.length);
        expect(new Set(descriptions).size).toBe(PRERENDER_ROUTES.length);
    });

    it('points each canonical at its own path, not the homepage', () => {
        for (const route of PRERENDER_ROUTES) {
            expect(getPageSeo(route, t).canonical).toBe(`${SITE_URL}${route}`);
        }
    });

    it('resolves every key it asks for, in every locale', () => {
        const locales = ['en', 'pt', 'es', 'de', 'fr', 'zh', 'ja'];
        for (const locale of locales) {
            const messages = JSON.parse(
                readFileSync(new URL(`../../public/locales/${locale}/translation.json`, import.meta.url), 'utf8')
            ) as Record<string, string>;

            for (const route of PRERENDER_ROUTES) {
                const seo = getPageSeo(route, key => {
                    expect(messages, `${locale} is missing "${key}" (needed by ${route})`).toHaveProperty(key);
                    return messages[key] ?? key;
                });
                expect(seo.title, `${locale} ${route}`).toBeTruthy();
                expect(seo.description, `${locale} ${route}`).toBeTruthy();
            }
        }
    });

    it('marks unknown paths noindex and gives them no canonical', () => {
        const seo = getPageSeo('/does-not-exist', t);
        expect(seo.robots).toBe('noindex, follow');
        expect(seo.canonical).toBe('');
    });

    it('normalises trailing slashes, casing and the /privacy-policy alias', () => {
        const privacy = getPageSeo('/privacy', t).canonical;
        expect(getPageSeo('/privacy/', t).canonical).toBe(privacy);
        expect(getPageSeo('/PRIVACY', t).canonical).toBe(privacy);
        expect(getPageSeo('/privacy-policy', t).canonical).toBe(privacy);
    });

    it('emits structured data whose @type set is unique per tool page', () => {
        const typesFor = (route: string) =>
            getPageSeo(route, t).jsonLd.map(block => block['@type']).join(',');

        expect(getPageSeo('/sql', t).jsonLd.length).toBeGreaterThan(0);
        expect(typesFor('/sql')).toContain('FAQPage');
        expect(typesFor('/')).toContain('WebSite');
    });
});
