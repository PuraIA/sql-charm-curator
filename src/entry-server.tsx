import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { createInstance, type i18n as I18n } from 'i18next';
import { initReactI18next, I18nextProvider } from 'react-i18next';
import { AppRoutes } from './App';
import { getPageSeo, type PageSeo } from './seo/routes';

export interface RenderResult {
    /** Markup for #root, already containing the full editorial content. */
    html: string;
    /** Head metadata for this route, from the same source the runtime <SEO /> uses. */
    seo: PageSeo;
}

/**
 * Renders one route to static HTML at build time.
 *
 * Translations are passed in rather than imported: at runtime they are fetched from
 * /locales/<lng>/translation.json by i18next-http-backend, and files under public/
 * cannot be imported from application code. scripts/prerender.mjs reads them from
 * disk and hands them over, so both paths stay on one set of files.
 */
export async function render(url: string, translation: Record<string, unknown>, lng = 'en'): Promise<RenderResult> {
    const i18n = await createServerI18n(translation, lng);
    const seo = getPageSeo(url, (key: string) => i18n.t(key) as string);

    const html = renderToString(
        <I18nextProvider i18n={i18n}>
            <StaticRouter location={url}>
                <AppRoutes />
            </StaticRouter>
        </I18nextProvider>
    );

    return { html, seo };
}

async function createServerI18n(translation: Record<string, unknown>, lng: string): Promise<I18n> {
    const instance = createInstance();
    await instance.use(initReactI18next).init({
        lng,
        fallbackLng: 'en',
        ns: ['translation'],
        defaultNS: 'translation',
        resources: { [lng]: { translation } },
        interpolation: { escapeValue: false },
        // No async loading happens here, so nothing should ever suspend.
        react: { useSuspense: false },
    });
    return instance;
}

// Re-exported so the prerender script has a single import for everything it needs.
export { PRERENDER_ROUTES, SITE_URL } from './seo/routes';
