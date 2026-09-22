/**
 * Build-time static site generation.
 *
 * Runs after `vite build` (client) and `vite build --ssr` (server bundle). For every
 * route it renders the real React tree to HTML and writes a standalone file, so a
 * crawler that never executes JavaScript still sees the full page — title, canonical,
 * structured data and the editorial content.
 *
 * Also emits 404.html and sitemap.xml, generated from the same route table.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const distDir = path.join(projectRoot, 'dist');
const ssrEntry = path.join(projectRoot, 'dist-ssr', 'entry-server.js');
const localesDir = path.join(projectRoot, 'public', 'locales');

/** Language the static HTML is generated in. Also the canonical language of the site. */
const PRERENDER_LANG = 'en';

const SEO_START = '<!--seo:start-->';
const SEO_END = '<!--seo:end-->';
const APP_MARKER = '<!--app-html-->';

async function main() {
    const { render, PRERENDER_ROUTES, SITE_URL } = await import(pathToFileURL(ssrEntry).href);

    const template = await fs.readFile(path.join(distDir, 'index.html'), 'utf8');
    assertTemplateMarkers(template);

    const translation = JSON.parse(
        await fs.readFile(path.join(localesDir, PRERENDER_LANG, 'translation.json'), 'utf8')
    );

    for (const route of PRERENDER_ROUTES) {
        const { html, seo } = await render(route, translation, PRERENDER_LANG);
        const page = compose(template, html, seo);
        const outFile = route === '/'
            ? path.join(distDir, 'index.html')
            : path.join(distDir, route.replace(/^\//, ''), 'index.html');

        await fs.mkdir(path.dirname(outFile), { recursive: true });
        await fs.writeFile(outFile, page, 'utf8');
        report(route, path.relative(distDir, outFile), page, html);
    }

    // A real 404 body for nginx to serve with a 404 status, instead of the SPA
    // shell answering 200 to every made-up URL.
    const notFound = await render('/__not_found__', translation, PRERENDER_LANG);
    await fs.writeFile(
        path.join(distDir, '404.html'),
        compose(template, notFound.html, notFound.seo),
        'utf8'
    );
    report('404', '404.html', '', notFound.html);

    await writeSitemap(distDir, PRERENDER_ROUTES, SITE_URL);
}

function assertTemplateMarkers(template) {
    for (const marker of [SEO_START, SEO_END, APP_MARKER]) {
        if (!template.includes(marker)) {
            throw new Error(
                `index.html is missing the ${marker} marker — prerendering cannot inject content. ` +
                'Restore the marker in index.html.'
            );
        }
    }
}

/** Splices the per-route head and body into the built template. */
function compose(template, appHtml, seo) {
    const headStart = template.indexOf(SEO_START) + SEO_START.length;
    const headEnd = template.indexOf(SEO_END);

    return (
        template.slice(0, headStart) +
        '\n' + renderHead(seo) + '\n  ' +
        template.slice(headEnd)
    ).replace(APP_MARKER, appHtml);
}

function renderHead(seo) {
    const tags = [
        `  <title>${escapeHtml(seo.title)}</title>`,
        meta('name', 'description', seo.description),
        meta('name', 'keywords', seo.keywords),
        meta('name', 'robots', seo.robots),
        seo.canonical ? `  <link rel="canonical" href="${escapeHtml(seo.canonical)}" />` : '',
        meta('property', 'og:title', seo.ogTitle),
        meta('property', 'og:description', seo.ogDescription),
        meta('property', 'og:url', seo.canonical),
        meta('name', 'twitter:title', seo.twitterTitle),
        meta('name', 'twitter:description', seo.twitterDescription),
        meta('name', 'twitter:url', seo.canonical),
        ...seo.jsonLd.map(jsonLdScript),
    ];
    return tags.filter(Boolean).join('\n');
}

function meta(attr, key, content) {
    if (!content) return '';
    return `  <meta ${attr}="${key}" content="${escapeHtml(content)}" />`;
}

/**
 * data-seo marks the block as owned by the SEO layer, so the runtime <SEO /> replaces
 * these on client-side navigation rather than appending a second, stale set.
 */
function jsonLdScript(block) {
    const json = JSON.stringify(block).replace(/</g, '\\u003c');
    return `  <script type="application/ld+json" data-seo>${json}</script>`;
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

async function writeSitemap(outDir, routes, siteUrl) {
    const today = new Date().toISOString().slice(0, 10);
    const toolPriority = { '/': '1.0', '/sql': '0.9', '/json': '0.9', '/xml': '0.9' };
    // Dialect/guide pages rank between the tool hubs and the boilerplate pages.
    const isGuidePage = route => /^\/(sql|json|xml)\//.test(route);
    const priorityFor = route => toolPriority[route] ?? (isGuidePage(route) ? '0.8' : '0.6');
    const changefreqFor = route => (toolPriority[route] ? 'weekly' : 'monthly');

    const urls = routes.map(route => [
        '  <url>',
        `    <loc>${siteUrl}${route}</loc>`,
        `    <lastmod>${today}</lastmod>`,
        `    <changefreq>${changefreqFor(route)}</changefreq>`,
        `    <priority>${priorityFor(route)}</priority>`,
        '  </url>',
    ].join('\n'));

    const xml = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        ...urls,
        '</urlset>',
        '',
    ].join('\n');

    await fs.writeFile(path.join(outDir, 'sitemap.xml'), xml, 'utf8');
    console.log(`  sitemap.xml            ${routes.length} URLs`);
}

/** Prints the rendered word count so a silently empty page is obvious in build logs. */
function report(route, outFile, _page, appHtml) {
    const words = appHtml.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length;
    console.log(`  ${route.padEnd(22)} ${outFile.padEnd(22)} ${words} palavras`);
}

console.log('Prerendering:');
await main();
