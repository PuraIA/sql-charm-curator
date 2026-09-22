/**
 * Reference material for /xml/<slug> pages that aren't a formatter guide or a
 * converter — currently just /xml/xpath — checked by XMLGuidePage before it falls
 * back to the converter-guide and then the formatter-guide lookup, the same layered
 * pattern SQLDialectPage uses for /sql/diff.
 *
 * Every example is checked against the real evaluator by xml-tools.test.ts.
 */
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
import { XML_TOOL_TRANSLATIONS_PT } from './i18n/xml-tools.pt';
import { XML_TOOL_TRANSLATIONS_ES } from './i18n/xml-tools.es';
import { XML_TOOL_TRANSLATIONS_DE } from './i18n/xml-tools.de';
import { XML_TOOL_TRANSLATIONS_FR } from './i18n/xml-tools.fr';
import { XML_TOOL_TRANSLATIONS_ZH } from './i18n/xml-tools.zh';
import { XML_TOOL_TRANSLATIONS_JA } from './i18n/xml-tools.ja';

export const XML_TOOL_SLUGS = ['xpath'] as const;
export type XmlToolSlug = (typeof XML_TOOL_SLUGS)[number];

export interface WorkedExample {
    expression: string;
    explanation: string;
}

export interface XmlToolGuide {
    slug: XmlToolSlug;
    name: string;
    tagline: string;
    seoTitle: string;
    seoDescription: string;
    seoKeywords: string;
    h1: string;
    intro: string[];
    sampleXml: string;
    /** Loaded into the tool by default. */
    defaultExpression: string;
    examples: WorkedExample[];
    sections: GuideSection[];
    limitations: string[];
    faq: FaqEntry[];
    updated: string;
}

const UPDATED = '2026-09-21';

const BOOKSTORE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<bookstore>
  <book category="cooking" id="b1">
    <title lang="en">Everyday Italian</title>
    <author>Giada De Laurentiis</author>
    <year>2005</year>
    <price>30.00</price>
  </book>
  <book category="children" id="b2">
    <title lang="en">Harry Potter</title>
    <author>J K. Rowling</author>
    <year>2005</year>
    <price>29.99</price>
  </book>
  <book category="web" id="b3">
    <title lang="en">Learning XML</title>
    <author>Erik T. Ray</author>
    <year>2003</year>
    <price>39.95</price>
  </book>
</bookstore>`;

export const XML_TOOL_GUIDES: Record<XmlToolSlug, XmlToolGuide> = {
    xpath: {
        slug: 'xpath',
        name: 'XPath Tester',
        tagline: 'A scoped XPath 1.0 evaluator — paths, predicates and text()/@name tests — over this site\'s own XML parser.',
        seoTitle: 'XPath Tester - Evaluate XPath Expressions Online',
        seoDescription:
            'Free online XPath tester. Evaluate location paths, predicates like [@id=\'x\'] and [1], and text()/@name node tests against your XML, with every match listed. Runs in your browser.',
        seoKeywords:
            'xpath tester, xpath evaluator online, test xpath expression, xpath online, xpath query tool',
        h1: 'XPath Tester',
        intro: [
            "A browser already ships a real, complete XPath 1.0 engine — document.evaluate() — but it needs a live DOM, which only exists in a browser tab, not during this site's build-time page generation or in its automated tests. So this tool runs on its own evaluator instead: a deliberately scoped subset of XPath 1.0 that covers what people actually type into an XPath tester — location paths, the handful of predicate forms that come up constantly, and the @name / text() node tests — built over this site's own XML parser rather than the full W3C grammar and function library.",
            "The bookstore example below is loaded into the editor above with /bookstore/book[@category='children']/title as the starting expression — change the expression and the match list below updates immediately.",
        ],
        sampleXml: BOOKSTORE_XML,
        defaultExpression: "/bookstore/book[@category='children']/title",
        examples: [
            {
                expression: '/bookstore/book',
                explanation: 'All three <book> elements, in document order — a plain absolute path.',
            },
            {
                expression: '//title',
                explanation: 'Every <title>, found at any depth — the // shorthand searches, it doesn\'t require an exact path.',
            },
            {
                expression: "/bookstore/book[@category='children']",
                explanation: 'Only the book whose category attribute is exactly "children" — one match.',
            },
            {
                expression: '/bookstore/book[1]',
                explanation: 'The first book by document position — XPath positions are 1-indexed, not 0-indexed.',
            },
            {
                expression: '/bookstore/book[last()]',
                explanation: 'The final book, whatever the count — last() adapts if books are added or removed.',
            },
            {
                expression: '/bookstore/book[1]/price/text()',
                explanation: 'The text content of the first book\'s <price> element, as its own kind of match — not the element itself.',
            },
            {
                expression: '/bookstore/book[1]/@*',
                explanation: "Every attribute of the first book — @category and @id — using the attribute axis rather than a specific attribute's name.",
            },
            {
                expression: '//title/..',
                explanation: 'The parent of every <title> — each one\'s enclosing <book> — one level of .. per level written.',
            },
            {
                expression: "//title[contains(text(), 'Potter')]",
                explanation: "Only the <title> whose text contains \"Potter\" as a substring — a partial match, not an exact one.",
            },
            {
                expression: 'count(/bookstore/book)',
                explanation: 'Not a node list at all — a single number, 3, the count of matching elements.',
            },
        ],
        sections: [
            {
                heading: 'Predicates run in sequence, each narrowing what came before',
                body: [
                    "/bookstore/book[@category='cooking'][1] applies two predicates: first keep only cooking books, then take the first of what's left. Each [..] filters the result of everything before it, the same way chained .filter() calls would in code — not independent conditions all checked against the original list.",
                ],
            },
            {
                heading: '@name and text() read the current element, not its children',
                body: [
                    'book[1]/@category reads book[1]\'s own category attribute. This looks like it should be obvious, but it\'s a real distinction from book[1]/title, which does step down into a child — @ and text() are their own axes (attribute:: and a text node test), not shorthand for "look inside." Writing //@category instead searches every descendant\'s attributes, which is a genuinely different, broader query.',
                ],
            },
            {
                heading: 'A path with zero matches is not an error',
                body: [
                    "/bookstore/nonexistent evaluates cleanly to zero matches — the same way a database query that matches no rows isn't a database error. A red error only appears for something this evaluator can't parse or evaluate at all, like an unbalanced [ or a function it doesn't implement.",
                ],
            },
        ],
        limitations: [
            "Only one level of \"..\" chaining is walked per written \"..\" — //title/../.. correctly walks up two levels because two \"..\" are written, but this evaluator has no way to walk further than the number of \"..\" actually in the expression (which matches real XPath semantics; there's no shorthand for \"walk up N levels\" other than writing \"..\" N times).",
            'A namespace-prefixed tag like soap:Body is matched as the literal string "soap:Body", not resolved against its xmlns declaration — the same simplification this site\'s XML to JSON converter makes, for the same reason: proper namespace resolution is a meaningfully larger problem than what most XPath testing actually needs.',
            'The union operator (|), the following/preceding axes, and most of the XPath function library beyond contains() and count() are not implemented — an expression using them fails to parse with a clear error rather than being silently misinterpreted.',
        ],
        faq: [
            {
                q: 'Why not just use the browser\'s built-in XPath support?',
                a: "document.evaluate() needs a live DOM, which only exists in a browser tab — it can't run during this site's build-time page generation or in its automated tests, both of which need the exact same evaluation logic the interactive tool uses. This evaluator runs identically everywhere.",
            },
            {
                q: 'What happens if my expression uses syntax this doesn\'t support?',
                a: "You get a clear parse error naming what's wrong, rather than a silently wrong result. The union operator, most axes beyond child/descendant-or-self/self/parent, and most functions beyond contains() and count() fall into this category — see Known limitations.",
            },
            {
                q: 'Are positions 0-indexed or 1-indexed?',
                a: '1-indexed, matching real XPath: [1] is the first match, not the second. This is a common source of off-by-one mistakes for anyone used to 0-indexed languages.',
            },
            {
                q: 'Is my XML uploaded anywhere?',
                a: 'No. Both parsing and evaluation run in your browser.',
            },
        ],
        updated: UPDATED,
    },
};

export function getXmlToolGuide(slug: string): XmlToolGuide | undefined {
    return XML_TOOL_GUIDES[slug as XmlToolSlug];
}

/** explanation is prose and translatable; expression is real XPath kept language-independent. */
export interface WorkedExampleTranslation {
    explanation: string;
}

export interface XmlToolGuideTranslation {
    h1?: string;
    tagline?: string;
    intro?: string[];
    examples?: WorkedExampleTranslation[];
    sections?: SectionTranslation[];
    limitations?: string[];
    faq?: FaqTranslation[];
}

function mergeExamples(
    base: WorkedExample[],
    override: WorkedExampleTranslation[] | undefined
): WorkedExample[] {
    if (!override) return base;
    return base.map((example, i) => {
        const t = override[i];
        if (!t) return example;
        return { ...example, explanation: t.explanation ?? example.explanation };
    });
}

const XML_TOOL_TRANSLATIONS: Record<ExtraLocale, Partial<Record<XmlToolSlug, XmlToolGuideTranslation>>> = {
    pt: XML_TOOL_TRANSLATIONS_PT,
    es: XML_TOOL_TRANSLATIONS_ES,
    de: XML_TOOL_TRANSLATIONS_DE,
    fr: XML_TOOL_TRANSLATIONS_FR,
    zh: XML_TOOL_TRANSLATIONS_ZH,
    ja: XML_TOOL_TRANSLATIONS_JA,
};

/** Overlays the active language's translation onto the English base guide (see i18n-guide.ts). */
export function localizeXmlToolGuide(guide: XmlToolGuide, language: string): XmlToolGuide {
    const locale = toExtraLocale(language);
    const t = locale ? XML_TOOL_TRANSLATIONS[locale][guide.slug] : undefined;
    if (!t) return guide;
    return {
        ...guide,
        h1: t.h1 ?? guide.h1,
        tagline: t.tagline ?? guide.tagline,
        intro: mergeArray(guide.intro, t.intro),
        examples: mergeExamples(guide.examples, t.examples),
        sections: mergeSections(guide.sections, t.sections),
        limitations: mergeArray(guide.limitations, t.limitations),
        faq: mergeFaq(guide.faq, t.faq),
    };
}
