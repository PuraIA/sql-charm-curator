/**
 * Reference material for /xml/<slug> pages, and the tool state each one opens with.
 *
 * 'minify' documents a real feature: the formatter's Compact Mode switch, backed by
 * src/utils/xml-utils.ts. src/utils/xml-utils.test.ts checks the published before/after
 * pair against that function's real output, and 'validate' documents what well-formed
 * XML validation does and does not cover.
 */
import type { GuideSection, FaqEntry } from './guide-shared';
import { minifyXml, prettyPrintXml } from '@/utils/xml-utils';

export const XML_GUIDE_SLUGS = ['minify', 'validate'] as const;
export type XmlGuideSlug = (typeof XML_GUIDE_SLUGS)[number];

export interface InvalidXmlExample {
    label: string;
    code: string;
    rule: string;
}

export interface XmlGuide {
    slug: XmlGuideSlug;
    name: string;
    tagline: string;
    seoTitle: string;
    seoDescription: string;
    seoKeywords: string;
    h1: string;
    intro: string[];
    /** XML loaded into the editor on first render. */
    tool: { input: string };
    /** Static before/after panel; present for 'minify', omitted for 'validate'. */
    sample?: { input: string; output: string };
    invalidExamples?: InvalidXmlExample[];
    sections: GuideSection[];
    limitations: string[];
    faq: FaqEntry[];
    updated: string;
}

const UPDATED = '2026-09-21';

// Derived from raw, unindented XML through the site's own functions — not hand-typed
// — so the "before" the pages show can never drift from what the live tool produces.
// xml-utils.test.ts re-derives both and asserts equality with what is exported here.
const SOAP_RAW =
    '<?xml version="1.0" encoding="UTF-8"?><soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope"><soap:Header><AuthToken>a1b2c3d4</AuthToken></soap:Header><soap:Body><GetOrderResponse xmlns="http://example.com/orders"><Order id="4821"><Customer>Ana Torres</Customer><Items><Item sku="SKU-100" qty="2">Widget</Item><Item sku="SKU-204" qty="1">Gadget</Item></Items><Total currency="BRL">259.80</Total></Order></GetOrderResponse></soap:Body></soap:Envelope>';

const SOAP_PRETTY = prettyPrintXml(SOAP_RAW);
const SOAP_MINIFIED = minifyXml(SOAP_PRETTY);

const BOOKSTORE_RAW =
    '<?xml version="1.0" encoding="UTF-8"?><bookstore><book category="cooking"><title lang="en">Everyday Italian</title><author>Giada De Laurentiis</author><price>30.00</price></book></bookstore>';

const BOOKSTORE_VALID = prettyPrintXml(BOOKSTORE_RAW);

export const XML_GUIDES: Record<XmlGuideSlug, XmlGuide> = {
    minify: {
        slug: 'minify',
        name: 'Minify XML',
        tagline: 'Collapse inter-tag whitespace with Compact Mode, without touching CDATA or comments.',
        seoTitle: 'XML Minifier - Compact and Minify XML Online',
        seoDescription:
            'Free online XML minifier. Collapses whitespace between tags with Compact Mode while leaving CDATA sections, comments and attribute values untouched. Runs in your browser.',
        seoKeywords:
            'xml minifier, minify xml, compact xml, remove whitespace xml, xml compress online, xml to one line',
        h1: 'XML Minifier',
        intro: [
            "Compact Mode, the switch next to Load Example below, removes the whitespace a pretty-printer adds between tags — the newline and indentation after a >, before the next <. It does this with a narrow rule rather than a full XML-aware rewrite: only whitespace that sits strictly between two tags is touched. Whitespace inside a text node's own content, inside an attribute value, or inside a CDATA section is left exactly as it was, because that whitespace can be part of the data rather than formatting.",
            'The SOAP-shaped example below is loaded in the editor above. Toggle Compact Mode to see it collapse from the pretty-printed form to the single line shown here — an 18% reduction on this sample, computed the same way for whatever you paste in.',
        ],
        tool: { input: SOAP_PRETTY },
        sample: { input: SOAP_PRETTY, output: SOAP_MINIFIED },
        sections: [
            {
                heading: 'What stays untouched, and why that is the safe default',
                body: [
                    "A comment (<!-- ... -->) and a CDATA section (<![CDATA[ ... ]]>) can both legitimately contain the characters < and > as data, not markup — a CDATA block is exactly how you embed a snippet of HTML or JavaScript inside XML without escaping it. The whitespace-collapsing rule here only ever matches a literal > immediately followed by whitespace and a literal <, so it never reaches inside either construct to rewrite what is, semantically, a string.",
                ],
                code: `<script><![CDATA[if (a < b) { x(); }]]></script>`,
            },
            {
                heading: 'Mixed content is usually safe, with one real exception',
                body: [
                    'Prose-like XML — an element whose text and child tags are interleaved, like <p>Preheat oven to <b>220</b> degrees.</p> — survives minification unchanged whenever there is real text touching the tag boundary on at least one side, which covers the overwhelming majority of real documents.',
                    "The one case where this goes wrong is deliberate, whitespace-only content under xml:space=\"preserve\" — an element whose entire point is that its whitespace matters and there is no other content to anchor it to. There, an element like <code xml:space=\"preserve\">   </code> loses its three spaces entirely, because to this rule they look identical to formatting indentation. This is listed under Known limitations below because it is a real, demonstrated case, not a hypothetical one.",
                ],
            },
            {
                heading: 'What Compact Mode does not do',
                body: [
                    'It does not touch whitespace inside a tag itself — extra spaces between attributes, like <a   b="1"    c="2" />, are left as written, since collapsing those risks looking like a different kind of edit than "remove formatting." It also does not remove comments or processing instructions; if you want those stripped too, that is a separate, more invasive transform this switch does not perform.',
                ],
            },
        ],
        limitations: [
            'A whitespace-only text node inside an element marked xml:space="preserve" is collapsed away like any other inter-tag whitespace, even though it is meant to be preserved. This is a real, verified limitation — <code xml:space="preserve">   </code> becomes <code xml:space="preserve"></code> — not a hypothetical edge case.',
            'Attribute spacing, comments, and processing instructions are left exactly as written; if your document has redundant spacing inside a tag, this switch will not remove it.',
        ],
        faq: [
            {
                q: 'Will minifying break a CDATA section?',
                a: 'No. CDATA content is never touched, including angle brackets inside it — the rule only matches whitespace that sits strictly between a > and a < at the tag level, never inside CDATA delimiters.',
            },
            {
                q: 'Is it safe for documents with mixed text and tags, like HTML-ish XML?',
                a: 'In almost every case, yes — as long as there is real text next to the tag boundary. The one documented exception is a whitespace-only xml:space="preserve" element, listed under Known limitations.',
            },
            {
                q: 'Does minifying save as much as gzip already would?',
                a: 'Less than the raw byte count suggests, if the response is already compressed — gzip handles repeated whitespace efficiently on its own. Minifying matters most for payloads that are not compressed, like some SOAP requests and internal service calls.',
            },
            {
                q: 'Is my XML sent anywhere?',
                a: 'No. Formatting and minifying both run in your browser. Nothing is uploaded, which matters since XML payloads like the SOAP example above often carry internal service names.',
            },
        ],
        updated: UPDATED,
    },

    validate: {
        slug: 'validate',
        name: 'Validate XML',
        tagline: "Check well-formedness against the browser's own XML parser — and know what that does not cover.",
        seoTitle: 'XML Validator - Check XML Well-Formedness Online',
        seoDescription:
            "Free online XML validator. Checks that your XML is well-formed using the browser's native parser and explains the difference between well-formed and schema-valid.",
        seoKeywords:
            'xml validator, validate xml online, xml well-formed checker, xml syntax checker, xml error checker',
        h1: 'XML Validator',
        intro: [
            "This tool validates XML with the browser's own parser — DOMParser, parsing your input as text/xml — rather than a separate, custom-written checker. If the browser's parser accepts the document, the tool reports it valid; if the parser flags a parsererror node, that is what drives the red ⚠ indicator next to the XML Original tab.",
            'The examples below are common ways real XML breaks. Rather than quoting a specific browser\'s error text — DOMParser\'s wording differs across Chromium, Firefox and WebKit, so a string that is exactly right in one is misleading in another — each one names the well-formedness rule it breaks, which is the same across every conformant parser even when the wording of the error is not.',
        ],
        tool: { input: BOOKSTORE_VALID },
        invalidExamples: [
            {
                label: 'Mismatched closing tag',
                code: `<book><title>Dune</title></books>`,
                rule: 'Every start tag must be matched by an end tag with the identical, case-sensitive name. <book> was opened and </books> was closed — a different name — so the document is not well-formed.',
            },
            {
                label: 'Unquoted attribute value',
                code: `<book category=cooking>...</book>`,
                rule: "Attribute values must be quoted, with either \" or '. Unlike HTML, XML has no shorthand for an unquoted value — this is one of the most common breakages when XML is hand-edited by someone used to HTML.",
            },
            {
                label: 'More than one root element',
                code: `<book>Dune</book><book>Foundation</book>`,
                rule: 'A well-formed XML document has exactly one root element containing everything else. Two sibling elements with nothing wrapping them is not one document — wrap them in a common parent.',
            },
            {
                label: 'A bare & in text content',
                code: `<company>Tom & Jerry Inc.</company>`,
                rule: '& always begins an entity reference (&amp;, &#38;, a custom entity) to an XML parser, so a literal ampersand in text content must be written &amp;. This is invisible in plain text but breaks parsing immediately.',
            },
        ],
        sections: [
            {
                heading: 'Well-formed versus valid: two different questions',
                body: [
                    'A document can be perfectly well-formed — every tag closed, correctly nested, one root — while still being the wrong shape for what a consumer expects: a missing required element, an attribute in the wrong place, a child element that should not be there. That second, stricter question is schema validity, checked against a DTD or an XSD, and it is a different job from what this tool does.',
                    "This distinction matters because “my XML validator says it's fine” and “my SOAP client rejects it” are both true statements about the same document when the problem is schema shape rather than syntax. This tool answers the first question; a schema validator, checked against the specific DTD or XSD your system expects, answers the second.",
                ],
            },
            {
                heading: 'Why the exact error wording is left unspecified here',
                body: [
                    "DOMParser is a real, shipping browser API, but its error reporting was never standardized in detail — each engine's XML parser (libxml2-derived in some, a bespoke parser in others) writes its own message text for the same underlying problem. Rather than publish one browser's wording as if it were universal, the rule each example breaks is described directly; that rule is identical everywhere, which the specific sentence describing it is not.",
                ],
            },
        ],
        limitations: [
            "Validation here checks well-formedness only — the generic XML syntax rules. It does not check a document against a DTD or an XSD schema, so a well-formed document with the wrong elements, wrong attributes, or wrong structure for your specific format will still be reported valid.",
            "The exact error message shown depends on which browser you are using, since DOMParser's error text is not standardized across engines. The rule being violated is consistent; the sentence describing it is not.",
        ],
        faq: [
            {
                q: 'Does "well-formed" mean my XML matches the schema my API expects?',
                a: 'No — those are different checks. Well-formed means the tags are correctly nested and closed. Whether the elements and attributes match what a specific API or format expects is schema validation, against a DTD or XSD, which this tool does not perform.',
            },
            {
                q: 'Why is a literal & rejected when it looks like ordinary text?',
                a: 'Because & always starts an entity reference to an XML parser, whether you intended that or not. Write &amp; for a literal ampersand in text content.',
            },
            {
                q: 'Can a document have more than one root element?',
                a: 'No. A well-formed XML document has exactly one element containing everything else. Two top-level sibling elements need a common wrapping parent.',
            },
            {
                q: 'Is my XML uploaded to check it?',
                a: "No. Validation runs through your browser's own DOMParser, locally — nothing is sent anywhere.",
            },
        ],
        updated: UPDATED,
    },
};

export const XML_GUIDE_LIST: XmlGuide[] = XML_GUIDE_SLUGS.map(slug => XML_GUIDES[slug]);

export function getXmlGuide(slug: string): XmlGuide | undefined {
    return XML_GUIDES[slug as XmlGuideSlug];
}
