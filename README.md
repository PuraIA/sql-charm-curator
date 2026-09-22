# SQL Charm Curator

A professional, feature-rich SQL formatter application built with React, Vite, and TypeScript. SQL Charm Curator helps developers format their SQL queries according to best practices and custom preferences.

## 🚀 Features

- **Multi-Dialect Support**: Format SQL for PostgreSQL, MySQL, Oracle (PL/SQL), SQL Server (T-SQL), and BigQuery.
- **Customizable Formatting**:
  - Keyword, Data Type, and Function casing (Upper, Lower, Preserve).
  - Indentation styles and width.
  - Logical operator placement.
  - Compact parentheses for WHERE clauses.
- **Syntax Highlighting**: Beautifully highlighted SQL code for better readability.
- **Localization**: Supports multiple languages including English, Portuguese, German, Spanish, Japanese, French, and Chinese.
- **Responsive Design**: Built with Tailwind CSS and Shadcn UI for a modern, responsive experience.

## 🛠️ Tech Stack

- **Framework**: [React 18](https://reactjs.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/)
- **Core Logic**: [SQL Formatter](https://github.com/sql-formatter-org/sql-formatter)
- **Localization**: [i18next](https://www.i18next.com/)
- **Testing**: [Vitest](https://vitest.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 📋 Prerequisites

- **Node.js**: v20+ or v22+ recommended.
- **npm**: (comes with Node.js).

## ⚙️ Getting Started

### 1. Clone the repository
```sh
git clone <YOUR_GIT_URL>
cd sql-charm-curator
```

### 2. Install dependencies
```sh
npm install
```

### 3. Start development server
```sh
npm run dev
```

The application will be available at `http://localhost:8080` (or the port specified by Vite).

## 📜 Available Scripts

- `npm run dev`: Starts the Vite development server.
- `npm run build`: Full production build — client bundle, SSR bundle, then prerender.
- `npm run build:client`: Browser bundle only (`dist/`).
- `npm run build:ssr`: Server bundle used by the prerender step (`dist-ssr/`).
- `npm run prerender`: Writes the static HTML for each route (requires the two builds above).
- `npm run build:dev`: Creates a development build.
- `npm run lint`: Runs ESLint for code quality checks.
- `npm test`: Executes unit tests using Vitest.
- `npm run preview`: Locally previews the production build.

## 🔎 Static rendering and SEO

The app is a SPA, but it is **not** shipped as a bare shell. `npm run build` renders every
route to its own HTML file, so crawlers (and users with JavaScript disabled) get the full
page without executing any JavaScript:

```text
dist/index.html          →  /
dist/sql/index.html      →  /sql
dist/json/index.html     →  /json
...
dist/404.html            →  served with a real 404 status
dist/sitemap.xml         →  generated from the same route table
```

Per-route metadata — title, description, canonical URL, Open Graph, structured data —
lives in a single place, [`src/seo/routes.ts`](src/seo/routes.ts). It is consumed by:

- `scripts/prerender.mjs`, which bakes it into the static HTML at build time;
- [`src/components/SEO.tsx`](src/components/SEO.tsx), which reapplies it during client-side
  navigation.

**Adding a route** means adding it to `PRERENDER_ROUTES` and to the `switch` in
`src/seo/routes.ts`, alongside the `<Route>` in `src/App.tsx`. A route missing from that
table falls back to the noindex 404 profile, and nginx returns a real 404 for any path
without a prerendered file. `src/seo/routes.test.ts` guards the invariant that every route
has its own title, description and canonical.

`index.html` contains `<!--seo:start-->` / `<!--seo:end-->` and `<!--app-html-->` markers
that the prerender script writes into; the build fails loudly if they are removed.

### Dialect pages

`/sql/postgresql`, `/sql/mysql`, `/sql/t-sql`, `/sql/oracle-plsql` and `/sql/bigquery` are
generated from [`src/content/sql-dialects.ts`](src/content/sql-dialects.ts). Each one opens
the formatter with that dialect's grammar selected and its example query already loaded and
formatted, followed by reference material written for that dialect — including a
`limitations` list, which is part of the data model rather than an afterthought.

The `sample.formatted` string published on each page is checked against the real output of
`sql-formatter` by [`src/content/sql-dialects.test.ts`](src/content/sql-dialects.test.ts),
so the before/after shown to readers can never drift from what the tool actually does.
Updating a sample means running the formatter and pasting the new output, or the test fails.

To add a dialect: add an entry to `DIALECT_GUIDES` and its slug to `DIALECT_SLUGS`. The
route, the sitemap entry, the structured data and the cross-links between dialect pages all
follow from that.

### JSON and XML task pages

`/json/minify`, `/json/validate`, `/json/to-typescript`, `/xml/minify` and `/xml/validate`
follow the same pattern as the SQL dialect pages, from
[`src/content/json-guides.ts`](src/content/json-guides.ts) and
[`src/content/xml-guides.ts`](src/content/xml-guides.ts). Each opens the formatter in a
specific mode rather than just wrapping different words around the same generic content:

- **`/json/to-typescript`** is a new feature, not just a new page: [`src/utils/json-to-ts.ts`](src/utils/json-to-ts.ts)
  infers TypeScript interfaces from a JSON value — merging arrays of objects into one
  interface, marking inconsistent fields optional, deduplicating identically-shaped
  objects — and is wired into `JSONFormatter` as a `formatStyle` option, so it is
  available from the general `/json` page too, not only from its guide page.
- **`/xml/minify`** documents `XMLFormatter`'s Compact Mode switch, backed by
  [`src/utils/xml-utils.ts`](src/utils/xml-utils.ts)'s `minifyXml`. That file also holds
  `prettyPrintXml`, extracted from the component so the guide pages' "before" sample can
  be generated by literally running the tool's own formatting function rather than by
  hand-typing an approximation of its output.
- **`/json/validate`** and **`/xml/validate`** are deliberately explicit about the
  difference between syntax validity (well-formed JSON or XML) and schema validity
  (the right shape for a specific consumer) — the tools check the former only.

Every sample before/after pair is asserted against the real function that produces it
(`src/utils/json-to-ts.test.ts`, `src/utils/xml-utils.test.ts`, `src/content/json-guides.test.ts`,
`src/content/xml-guides.test.ts`), the same discipline as the SQL dialect pages.

## 📂 Project Structure

```text
src/
├── components/     # UI and application components
│   ├── ui/         # Shadcn UI base components
│   └── ...
├── config/         # Static configuration (AdSense slot ids)
├── hooks/          # Custom React hooks
├── lib/            # Utility functions and shared libraries
├── pages/          # Application pages
├── seo/            # Per-route SEO metadata (single source of truth) + tests
├── utils/          # Core utility logic (SQL post-processing)
├── App.tsx         # Routes and providers (router-agnostic)
├── entry-server.tsx# Build-time rendering entry, used by scripts/prerender.mjs
└── main.tsx        # Browser entry point

public/locales/     # I18n translation files (JSON), fetched at runtime
scripts/prerender.mjs  # Static HTML generation
```

## 🌍 Localization

Translation files live in `public/locales/<lang>/translation.json` and are fetched at
runtime by `i18next-http-backend`. To add a new language:
1. Create `public/locales/<lang>/translation.json`.
2. Add the code to `supportedLngs` in `src/i18n.ts` and to the picker in `src/components/Header.tsx`.

The prerendered HTML is generated in English (`PRERENDER_LANG` in `scripts/prerender.mjs`);
other languages are applied on the client after the translations load.

## 🧪 Testing

Unit tests are co-located with the source files or placed in `__tests__` folders.
Run tests with:
```sh
npm test
```

## 🐳 Docker

To run the application using Docker:

### 1. Build the image
```sh
docker build -t sql-charm-curator .
```

### 2. Run the container
```sh
docker run -p 8080:80 sql-charm-curator
```

### 3. Use Docker Compose (Recommended)
```sh
docker-compose up -d
```

The application will be available at `http://localhost:8080`.

## 📄 License

TODO: Add license information.
