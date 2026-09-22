/**
 * Reference material for /json/<slug> pages, and the tool state each one opens with.
 *
 * Each page is a specific job someone searches for ("minify json", "validate json",
 * "json to typescript"), not just different words wrapped around the same generic JSON
 * content. The tool it opens is set up for that job — a different formatStyle, and for
 * the TypeScript page, a real conversion this site did not previously offer.
 *
 * `sample.output` for 'minify' and 'to-typescript' is checked against the real output
 * of the code it documents by src/utils/xml-utils.test.ts's sibling,
 * src/utils/json-to-ts.test.ts, and by json-guides.test.ts — never hand-adjusted
 * independently of what the tool actually produces.
 */
import type { FormatStyle } from '@/components/JSONFormatter';
import type { GuideSection, FaqEntry } from './guide-shared';
import {
    toExtraLocale,
    mergeArray,
    mergeSections,
    mergeFaq,
    type ExtraLocale,
    type SectionTranslation,
    type FaqTranslation,
} from './i18n-guide';
import { JSON_TRANSLATIONS_PT } from './i18n/json-guides.pt';
import { JSON_TRANSLATIONS_ES } from './i18n/json-guides.es';
import { JSON_TRANSLATIONS_DE } from './i18n/json-guides.de';
import { JSON_TRANSLATIONS_FR } from './i18n/json-guides.fr';
import { JSON_TRANSLATIONS_ZH } from './i18n/json-guides.zh';
import { JSON_TRANSLATIONS_JA } from './i18n/json-guides.ja';

export const JSON_GUIDE_SLUGS = ['minify', 'validate', 'to-typescript'] as const;
export type JsonGuideSlug = (typeof JSON_GUIDE_SLUGS)[number];

export interface InvalidExample {
    label: string;
    code: string;
    /** Exact message a V8-based engine (Chrome, Edge, Node.js) throws for this input. */
    message: string;
    explanation: string;
}

export interface JsonGuide {
    slug: JsonGuideSlug;
    name: string;
    tagline: string;
    seoTitle: string;
    seoDescription: string;
    seoKeywords: string;
    h1: string;
    intro: string[];
    /** Tool state the page opens with. */
    tool: {
        formatStyle: FormatStyle;
        input: string;
        output: string;
    };
    /** Root interface name for the TypeScript page only. */
    rootTypeName?: string;
    /**
     * The same input/output pair as `tool`, shown as a static before/after panel.
     * Omitted for pages (like 'validate') where a single transform isn't the point.
     */
    sample?: { input: string; output: string; note?: string };
    invalidExamples?: InvalidExample[];
    sections: GuideSection[];
    limitations: string[];
    faq: FaqEntry[];
    updated: string;
}

const UPDATED = '2026-09-21';

/** products.length === 2 keeps the arrays and byte counts on the page honest and small. */
const CATALOG_PRETTY = `{
  "products": [
    {
      "id": 101,
      "name": "Wireless Mouse",
      "price": 129.9,
      "inStock": true,
      "tags": [
        "electronics",
        "accessories"
      ]
    },
    {
      "id": 102,
      "name": "Mechanical Keyboard",
      "price": 349,
      "inStock": false,
      "tags": [
        "electronics",
        "accessories",
        "gaming"
      ]
    }
  ],
  "page": 1,
  "totalPages": 12
}`;

const CATALOG_MINIFIED =
    '{"products":[{"id":101,"name":"Wireless Mouse","price":129.9,"inStock":true,"tags":["electronics","accessories"]},{"id":102,"name":"Mechanical Keyboard","price":349,"inStock":false,"tags":["electronics","accessories","gaming"]}],"page":1,"totalPages":12}';

const API_USER_PRETTY = `{
  "id": 4821,
  "name": "Ana Torres",
  "email": "ana@example.com",
  "active": true,
  "address": {
    "city": "São Paulo",
    "zip": "01310-100"
  },
  "tags": [
    "vip",
    "wholesale"
  ],
  "orders": [
    {
      "id": 1,
      "total": 129.9,
      "status": "shipped"
    },
    {
      "id": 2,
      "total": 44,
      "status": "pending",
      "trackingCode": "BR928374"
    }
  ],
  "lastLogin": null
}`;

const API_USER_INTERFACE = `interface ApiUser {
  id: number;
  name: string;
  email: string;
  active: boolean;
  address: Address;
  tags: string[];
  orders: Order[];
  lastLogin: null;
}

interface Order {
  id: number;
  total: number;
  status: string;
  trackingCode?: string;
}

interface Address {
  city: string;
  zip: string;
}
`;

/** A config-shaped sample that is already valid, used as the /json/validate default. */
const VALID_CONFIG = `{
  "name": "checkout-service",
  "port": 8080,
  "retries": 3,
  "features": {
    "fastCheckout": true,
    "giftCards": false
  },
  "allowedOrigins": [
    "https://shop.example.com",
    "https://admin.example.com"
  ]
}`;

export const JSON_GUIDES: Record<JsonGuideSlug, JsonGuide> = {
    minify: {
        slug: 'minify',
        name: 'Minify JSON',
        tagline: 'Strip every byte that only exists for human eyes, verified against JSON.stringify.',
        seoTitle: 'JSON Minifier - Compact and Minify JSON Online',
        seoDescription:
            'Free online JSON minifier. Removes whitespace, newlines and indentation from JSON while keeping data and key order intact. Runs entirely in your browser.',
        seoKeywords:
            'json minifier, minify json, compact json, json compress online, remove whitespace json, json to one line',
        h1: 'JSON Minifier',
        intro: [
            "Minifying JSON is deliberately the simplest transform this site does: the tool calls JSON.stringify() on the parsed value with no indentation argument, so the whitespace disappears and nothing else changes — same keys, same key order, same numbers, same string content. There is no separate minification algorithm to get wrong, because the engine's own serializer is the minifier.",
            "That simplicity is also why this page exists: minifying is easy to do correctly and easy to reason about wrong. The sample below is loaded in the editor above with Minified selected, so you can paste your own JSON and watch the exact same substitution happen to it.",
        ],
        tool: { formatStyle: 'minified', input: CATALOG_PRETTY, output: CATALOG_MINIFIED },
        sample: { input: CATALOG_PRETTY, output: CATALOG_MINIFIED },
        sections: [
            {
                heading: 'What actually gets removed',
                body: [
                    'Only whitespace that exists between structural tokens — after a {, before a }, around a : or a , — is whitespace that JSON.stringify() never emits without an indentation argument. It is not a text-scanning pass over your file; it is the same code path that produces every other JSON.stringify() call in the language, so it has none of the escaping bugs a hand-written string minifier could introduce.',
                    "Key order is preserved exactly as it was in the parsed object. JavaScript objects keep insertion order for string keys (with one exception — integer-like keys such as \"1\" or \"42\" are always sorted numerically first, ahead of any other keys, regardless of where they appeared in the source). That reordering is part of the JavaScript specification, not something this tool adds.",
                ],
            },
            {
                heading: 'Minified is not the same as Compact',
                body: [
                    'The format selector above also offers Compact, which is a different, gentler transform: JSON.stringify(parsed, null, 1) — one space of indentation instead of two or four, but still one value per line. Minified removes structure entirely; Compact just shrinks it. Reach for Compact when a human still needs to read the diff, and for Minified when only a machine will consume the result.',
                ],
            },
            {
                heading: 'Where minifying actually saves bytes',
                body: [
                    'If a response is already served gzipped or brotli-compressed, most of the win from minifying disappears before it reaches the network: repeated whitespace is exactly the kind of redundancy those algorithms already remove well. Minifying matters most for payloads that are not compressed — some webhook bodies, local caches, embedded config files — and for reducing the work JSON.parse() has to do on very large documents, since fewer bytes means fewer characters to scan regardless of compression.',
                ],
            },
        ],
        limitations: [
            'Minifying does not change number formatting, remove unused fields, or shorten key names — it removes whitespace only. If you need a smaller payload beyond that, that is a schema change, not a minification setting.',
            'For a multi-megabyte document, JSON.parse() and JSON.stringify() both run synchronously on the main thread. Very large pastes can make the tab briefly unresponsive while they run; this is a property of the browser\'s JSON implementation, not something this page adds on top of it.',
        ],
        faq: [
            {
                q: 'Does minifying change the data in any way?',
                a: 'No. Every key, value, and array element is preserved exactly. Only the whitespace between them is removed.',
            },
            {
                q: "What is the difference between Minified and Compact?",
                a: 'Minified removes all whitespace, producing one line. Compact keeps one value per line but with minimal indentation. Use Compact when a person still needs to read it, Minified when only a machine will.',
            },
            {
                q: 'Will this help if my API responses are already gzipped?',
                a: 'Less than you might expect. Gzip already compresses repeated whitespace efficiently, so minifying before compression yields a smaller extra saving than the raw byte count above suggests. It matters more for uncompressed payloads.',
            },
            {
                q: 'Is my JSON uploaded anywhere?',
                a: 'No. JSON.parse() and JSON.stringify() run in your browser. Nothing is sent to a server, which matters if the payload contains real customer or account data.',
            },
        ],
        updated: UPDATED,
    },

    validate: {
        slug: 'validate',
        name: 'Validate JSON',
        tagline: 'See exactly which rule your JSON breaks, with the parser\'s own error message.',
        seoTitle: 'JSON Validator - Check JSON Syntax Online',
        seoDescription:
            'Free online JSON validator. Paste JSON and get an instant, specific error — not just "invalid JSON" — for trailing commas, unquoted keys, comments and other common mistakes.',
        seoKeywords:
            'json validator, validate json online, json syntax checker, is this json valid, json linter, json error checker',
        h1: 'JSON Validator',
        intro: [
            "This tool validates JSON the same way every JSON.parse() call in your browser does, because that is what runs underneath it — there is no separate, more lenient validation layer. If JSON.parse() accepts your input, the tool reports it valid; if it throws, the tool shows you that exception's message next to the JSON Original tab, along with a green ✓ or red ⚠ indicator.",
            'The four examples below are real inputs and the real error text a V8-based engine (Chrome, Edge, and Node.js all use V8) throws for each of them, generated by actually running them through JSON.parse() rather than described from memory. Firefox and Safari use different JavaScript engines and phrase these errors differently, but they reject the same inputs for the same underlying reason.',
        ],
        tool: { formatStyle: 'pretty', input: VALID_CONFIG, output: VALID_CONFIG },
        invalidExamples: [
            {
                label: 'Trailing comma',
                code: `{"a": 1, "b": 2,}`,
                message: 'Expected double-quoted property name in JSON at position 16 (line 1 column 17)',
                explanation:
                    'JSON has no concept of a trailing comma. Unlike a JavaScript object literal, the comma before the closing } must always be followed by another "key": value pair.',
            },
            {
                label: 'Unquoted key',
                code: `{a: 1}`,
                message: "Expected property name or '}' in JSON at position 1 (line 1 column 2)",
                explanation:
                    'Every object key must be a double-quoted string. This is valid in a JavaScript object literal, which is why the mistake is common when JSON is hand-typed rather than generated.',
            },
            {
                label: 'A // comment',
                code: `{\n  "a": 1 // note\n}`,
                message: "Expected ',' or '}' after property value in JSON at position 11 (line 2 column 10)",
                explanation:
                    'JSON has no comment syntax at all — not //, not /* */. Some tools accept "JSONC" (JSON with comments) as an input format, but standard JSON.parse() does not.',
            },
            {
                label: 'A leading zero',
                code: `{"a": 01}`,
                message: 'Unexpected number in JSON at position 7 (line 1 column 8)',
                explanation:
                    'A JSON number cannot have a leading zero before other digits (01, 007). This mirrors the same rule in JavaScript number literals and exists to avoid ambiguity with octal notation.',
            },
        ],
        sections: [
            {
                heading: 'What "valid" does and does not mean',
                body: [
                    'This tool checks that your text is well-formed JSON per RFC 8259 — every brace matches, every string is quoted, every value has the right shape. That is a different, narrower question than "is this the JSON my application expects." A response that is missing a required field, or that sends a string where your code expects a number, is perfectly valid JSON and will pass this check while still breaking your application.',
                    'Catching that second class of problem needs schema validation — a JSON Schema document, or a runtime type checker like Zod — checked against your specific expected shape. This tool is the first, fast check that belongs before that step, not a replacement for it.',
                ],
            },
            {
                heading: 'Why the error message is specific',
                body: [
                    'A validator that only says "invalid JSON" makes you scan the whole document by eye. The message this tool shows — the same one JSON.parse() throws — includes a character position and, in most engines, a line and column, which is usually enough to jump straight to the mistake without a manual diff against a known-good copy.',
                ],
            },
        ],
        limitations: [
            'The exact wording of the error message is specific to V8-based engines. Firefox and Safari report the same violations with different phrasing, so if you are troubleshooting a report from a user on one of those browsers, expect the message text — not the underlying problem — to differ.',
            'This checks syntax only. Valid-but-wrong-shaped JSON (a missing field, a string instead of a number) will not be flagged here; that requires schema validation against your own expected structure.',
        ],
        faq: [
            {
                q: "Why does it just say the JSON is invalid, without more detail?",
                a: "It doesn't — switch to the Formatted JSON tab (or just start typing) and the exact parser error, including the character position, is shown. The examples above are that same message, verified against real JSON.parse() output.",
            },
            {
                q: 'Does "valid" mean my API will accept it?',
                a: 'It means the JSON is well-formed. Whether the specific fields and types match what an API expects is a separate question this tool does not answer — that needs schema validation against that API\'s contract.',
            },
            {
                q: 'Can I validate JSON with comments in it (JSONC)?',
                a: 'Not with this tool — it checks against standard JSON (RFC 8259), which has no comment syntax. Strip the comments first if you are working with a JSONC config file.',
            },
            {
                q: 'Is my JSON sent anywhere to be checked?',
                a: 'No. Validation runs via your browser\'s own JSON.parse(), locally. Nothing is uploaded.',
            },
        ],
        updated: UPDATED,
    },

    'to-typescript': {
        slug: 'to-typescript',
        name: 'JSON to TypeScript',
        tagline: 'Turn a real API response into named interfaces — optional fields and all.',
        seoTitle: 'JSON to TypeScript Converter - Generate Interfaces Online',
        seoDescription:
            'Free online JSON to TypeScript converter. Generates named interfaces from nested JSON, merges arrays of objects into one type, and marks inconsistent fields optional.',
        seoKeywords:
            'json to typescript, json to interface, generate typescript interface, json to ts converter, typescript type from json',
        h1: 'JSON to TypeScript Converter',
        intro: [
            "Pasting an API response and getting back typed interfaces is a genuinely different job from formatting JSON, so it gets its own generator rather than being one more output style bolted onto the pretty-printer. It walks the parsed value once: every object becomes a named interface, arrays of objects are merged into a single interface, and a field that is missing from some (but not all) items in an array becomes optional rather than producing a separate type per item.",
            "The sample below is loaded in the editor above with JSON → TypeScript selected. It is a realistic shape — a user record with a nested address, an array of string tags, and an array of orders where only one order has a trackingCode — chosen because it exercises the three cases that matter: nesting, arrays, and inconsistent optional fields.",
        ],
        tool: { formatStyle: 'typescript', input: API_USER_PRETTY, output: API_USER_INTERFACE },
        rootTypeName: 'ApiUser',
        sample: { input: API_USER_PRETTY, output: API_USER_INTERFACE },
        sections: [
            {
                heading: 'How nesting becomes named interfaces',
                body: [
                    'Every object field gets its own interface, named after the field (address becomes Address, orders\' element becomes Order). This is deliberate: an inline nested type is harder to reuse and harder to read in an editor\'s hover tooltip than a named one. Two fields with the exact same set of keys and types — a billing address and a shipping address, for instance — are recognised as the same shape and share one interface instead of generating a duplicate.',
                ],
            },
            {
                heading: 'Arrays of objects are merged, not enumerated',
                body: [
                    "orders is an array where the first item has no trackingCode and the second does. Rather than generating Order and Order2, the generator looks at every item in the array, collects the union of every key that appears in any of them, and marks a key optional if it is missing from at least one item — which is exactly what trackingCode?: string above expresses. This mirrors how you would type it by hand after actually reading a few sample responses.",
                ],
            },
            {
                heading: 'Mixed-type arrays become a union',
                body: [
                    'An array whose elements are not all the same type — [1, "two", 3] — produces (number | string)[] rather than picking one type and hiding the mismatch, or refusing to generate anything. An empty array has nothing to infer from and is typed unknown[]; narrow it by hand once you know what the array is supposed to hold.',
                ],
                code: `interface Root {\n  values: (number | string)[];\n}`,
            },
            {
                heading: 'What it deliberately does not infer',
                body: [
                    'Every string becomes string and every number becomes number — there is no attempt to detect that a field always looks like a date, an email, or one of three fixed values and narrow it to a literal union or a branded type. Reliable narrowing needs either a larger sample than one response or domain knowledge this tool does not have; guessing wrong would be worse than leaving the field as string.',
                ],
            },
        ],
        limitations: [
            'One example response is one sample, not a schema. A field that happens to be null or a whole number in your one paste, but is sometimes a string or a decimal in other responses, will be typed too narrowly. Test the generated interface against a few different real responses, not just one.',
            'Generated interface and property names come from your JSON keys and are not deduplicated beyond identical field shapes — two differently-shaped objects that both come from a field called "data" will both be named Data and Data2, which reads as "the second one" rather than anything descriptive. Rename them once you know what they represent.',
        ],
        faq: [
            {
                q: 'Does it handle deeply nested JSON?',
                a: 'Yes — nesting has no depth limit. Every nested object becomes its own named interface, however many levels deep it appears.',
            },
            {
                q: 'What happens with an array that mixes objects and primitives?',
                a: 'The object items are merged into one interface as usual, the primitive items contribute their own types, and the array\'s element type is the union of both — for example (Order | string)[].',
            },
            {
                q: 'Can I set my own root interface name?',
                a: 'The generated root interface is named Root by default when you edit the JSON in the tool. This page names it after what the sample represents (ApiUser) purely for readability in the example.',
            },
            {
                q: 'Is my JSON sent to a server to generate the types?',
                a: 'No. The generator runs in your browser and never uploads what you paste, which matters since a real API response is exactly what you would paste here.',
            },
        ],
        updated: UPDATED,
    },
};

export const JSON_GUIDE_LIST: JsonGuide[] = JSON_GUIDE_SLUGS.map(slug => JSON_GUIDES[slug]);

export function getJsonGuide(slug: string): JsonGuide | undefined {
    return JSON_GUIDES[slug as JsonGuideSlug];
}

/** label/explanation are prose and translatable; code/message are the parser's real output and are not. */
export interface InvalidExampleTranslation {
    label: string;
    explanation: string;
}

export interface JsonGuideTranslation {
    h1?: string;
    tagline?: string;
    intro?: string[];
    invalidExamples?: InvalidExampleTranslation[];
    sections?: SectionTranslation[];
    limitations?: string[];
    faq?: FaqTranslation[];
}

function mergeInvalidExamples(
    base: InvalidExample[],
    override: InvalidExampleTranslation[] | undefined
): InvalidExample[] {
    if (!override) return base;
    return base.map((example, i) => {
        const t = override[i];
        if (!t) return example;
        return { ...example, label: t.label ?? example.label, explanation: t.explanation ?? example.explanation };
    });
}

const JSON_TRANSLATIONS: Record<ExtraLocale, Partial<Record<JsonGuideSlug, JsonGuideTranslation>>> = {
    pt: JSON_TRANSLATIONS_PT,
    es: JSON_TRANSLATIONS_ES,
    de: JSON_TRANSLATIONS_DE,
    fr: JSON_TRANSLATIONS_FR,
    zh: JSON_TRANSLATIONS_ZH,
    ja: JSON_TRANSLATIONS_JA,
};

/** Overlays the active language's translation onto the English base guide (see i18n-guide.ts). */
export function localizeJsonGuide(guide: JsonGuide, language: string): JsonGuide {
    const locale = toExtraLocale(language);
    const t = locale ? JSON_TRANSLATIONS[locale][guide.slug] : undefined;
    if (!t) return guide;
    return {
        ...guide,
        h1: t.h1 ?? guide.h1,
        tagline: t.tagline ?? guide.tagline,
        intro: mergeArray(guide.intro, t.intro),
        invalidExamples: guide.invalidExamples
            ? mergeInvalidExamples(guide.invalidExamples, t.invalidExamples)
            : guide.invalidExamples,
        sections: mergeSections(guide.sections, t.sections),
        limitations: mergeArray(guide.limitations, t.limitations),
        faq: mergeFaq(guide.faq, t.faq),
    };
}
