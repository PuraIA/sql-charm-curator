/**
 * Reference material for the format-converter pages, plus the tool state each one
 * opens with.
 *
 * These sit under the existing /json/<slug> and /xml/<slug> route namespaces — hostFormat
 * says which one — reusing JSONGuidePage/XMLGuidePage's routing rather than introducing
 * a third top-level format section for YAML, which has no formatter tool of its own on
 * this site (see the "Known limitations" note on scope in each JSON<->XML page: YAML is
 * reachable as a source or target from the interactive tool on every converter page
 * regardless of which pair the page is dedicated to, just not as its own landing page).
 *
 * Every sample is produced by the site's own conversion functions, not hand-typed;
 * converter-guides.test.ts re-derives each one and asserts equality.
 */
import type { DataFormat } from '@/utils/format-convert';
import type { GuideSection, FaqEntry } from './guide-shared';
import { jsonToXml, xmlToJson } from '@/utils/xml-json-convert';
import { jsonToYaml } from '@/utils/yaml-convert';
import {
    toExtraLocale,
    mergeArray,
    mergeSections,
    mergeFaq,
    type ExtraLocale,
    type SectionTranslation,
    type FaqTranslation,
} from './i18n-guide';
import { CONVERTER_TRANSLATIONS_PT } from './i18n/converter-guides.pt';
import { CONVERTER_TRANSLATIONS_ES } from './i18n/converter-guides.es';
import { CONVERTER_TRANSLATIONS_DE } from './i18n/converter-guides.de';
import { CONVERTER_TRANSLATIONS_FR } from './i18n/converter-guides.fr';
import { CONVERTER_TRANSLATIONS_ZH } from './i18n/converter-guides.zh';
import { CONVERTER_TRANSLATIONS_JA } from './i18n/converter-guides.ja';

export type ConverterHost = 'json' | 'xml';

export interface ConverterGuide {
    hostFormat: ConverterHost;
    slug: string;
    fromFormat: DataFormat;
    toFormat: DataFormat;
    name: string;
    tagline: string;
    seoTitle: string;
    seoDescription: string;
    seoKeywords: string;
    h1: string;
    intro: string[];
    sample: { input: string; output: string };
    mapping: GuideSection[];
    limitations: string[];
    faq: FaqEntry[];
    updated: string;
}

const UPDATED = '2026-10-09';

// ------------------------------------------------------------------ json -> xml sample
const ORDERS_JSON = {
    order: [
        { '@id': '1001', customer: 'Ana Torres', total: '129.90', status: 'shipped' },
        { '@id': '1002', customer: 'Bruno Lima', total: '44.00', status: 'pending' },
    ],
};
const ORDERS_JSON_TEXT = JSON.stringify({ orders: ORDERS_JSON }, null, 2);
const ORDERS_XML_TEXT = jsonToXml({ orders: ORDERS_JSON });

// ------------------------------------------------------------------ xml -> json sample
const PRODUCTS_XML_TEXT = `<?xml version="1.0" encoding="UTF-8"?>
<products>
  <product sku="SKU-100">
    <name>Wireless Mouse</name>
    <price currency="BRL">129.90</price>
  </product>
  <product sku="SKU-204">
    <name>Mechanical Keyboard</name>
    <price currency="BRL">349.00</price>
  </product>
</products>`;
const PRODUCTS_JSON_VALUE = xmlToJson(PRODUCTS_XML_TEXT);
const PRODUCTS_JSON_TEXT = JSON.stringify(PRODUCTS_JSON_VALUE, null, 2);

// ------------------------------------------------------------------ json -> yaml sample
const K8S_DEPLOYMENT = {
    apiVersion: 'apps/v1',
    kind: 'Deployment',
    metadata: { name: 'checkout', labels: { app: 'checkout' } },
    spec: { replicas: 3, selector: { matchLabels: { app: 'checkout' } } },
};
const K8S_JSON_TEXT = JSON.stringify(K8S_DEPLOYMENT, null, 2);
const K8S_YAML_TEXT = jsonToYaml(K8S_DEPLOYMENT);

export const CONVERTER_GUIDES: Record<string, ConverterGuide> = {
    'json/to-xml': {
        hostFormat: 'json',
        slug: 'to-xml',
        fromFormat: 'json',
        toFormat: 'xml',
        name: 'JSON to XML',
        tagline: 'Attributes with @, arrays as repeated siblings — the mapping is explicit, not guessed.',
        seoTitle: 'JSON to XML Converter - Convert JSON to XML Online',
        seoDescription:
            'Free online JSON to XML converter. Turns @-prefixed keys into attributes and array values into repeated sibling elements, with a documented, testable mapping. Runs in your browser.',
        seoKeywords:
            'json to xml converter, convert json to xml, json to xml online, json xml converter free',
        h1: 'JSON to XML Converter',
        intro: [
            "JSON and XML don't share a data model, so any converter between them is really committing to a convention and hoping it matches what you need. This one's convention is small and explicit: a key starting with @ becomes an attribute, a key of #text becomes text content, and an array becomes repeated sibling elements under that key's tag name — not a wrapper element with numbered children, which is the other common choice and reads worse in practice.",
            "The example below is loaded into the converter above. Two orders, both with an @id attribute, become two sibling <order> elements rather than one <orders><order>...</order><order>...</order></orders> wrapper — the array key itself (order) is already the repeated tag name.",
        ],
        sample: { input: ORDERS_JSON_TEXT, output: ORDERS_XML_TEXT },
        mapping: [
            {
                heading: '@key becomes an attribute',
                body: [
                    'A key that starts with @ is stripped of that prefix and attached to its element as an attribute, in the order it appears in the object. @id: "1001" on an order object becomes id="1001" on that <order> tag.',
                ],
            },
            {
                heading: '#text becomes text content — usable alongside attributes',
                body: [
                    "An ordinary JSON object has nowhere to put \"this element has an attribute and also text\" — objects don't have an implicit position for text the way XML elements do. #text is the explicit key for that: {\"@id\": \"1\", \"#text\": \"hello\"} produces <tag id=\"1\">hello</tag>.",
                ],
            },
            {
                heading: 'Arrays become repeated elements, not a wrapper',
                body: [
                    'order: [ {...}, {...} ] produces two sibling <order> elements — the key itself supplies the repeated tag name. A bare array with no such key (converting a JSON array directly, with nothing wrapping it) has no natural tag name to reuse, so it falls back to a generic <item> for each entry inside a default <root>.',
                ],
            },
            {
                heading: 'null becomes an empty element; every other scalar becomes text',
                body: [
                    'A JSON null has no XML equivalent, so it becomes a self-closing empty element: null -> <key/>. Numbers and booleans become their string form as element text — 8080 becomes the text "8080" — since XML text is always just characters.',
                ],
            },
        ],
        limitations: [
            'A JSON key that is not a valid XML name — spaces, a leading digit, most punctuation — is rewritten rather than rejected: invalid characters become _, and a name that would still start with a digit gets a leading _. This is a visible, tested transformation (2fa becomes _2fa), not a silent one, but it does mean the output tag name is not always identical to the input key.',
            "Converting a JSON array back from XML and forth again isn't perfectly stable when the array holds a mix of objects and plain values — the mapping is designed around arrays of one consistent shape, which covers the overwhelming majority of real API responses and config arrays.",
        ],
        faq: [
            {
                q: 'Why @ for attributes instead of some other convention?',
                a: "There's no standard here — several JSON-XML libraries use @, and it has the advantage of sorting distinctly from ordinary keys and being unambiguous inside a plain-text JSON key. This converter documents its exact choice rather than assuming it's the only reasonable one.",
            },
            {
                q: 'Can I convert a JSON array directly, with nothing wrapping it?',
                a: 'Yes — it gets wrapped in a default <root>, with each item as an <item> element, since a bare array has no key of its own to reuse as the repeated tag name.',
            },
            {
                q: 'Is the conversion reversible?',
                a: "For the shapes this convention targets — objects, attributes, arrays of one consistent shape — yes: converting the result back with XML to JSON reproduces the same JSON, checked by this site's own tests. Mixed text-and-elements content is the one case that isn't: see /xml/to-json's own limitations for why.",
            },
        ],
        updated: UPDATED,
    },

    'xml/to-json': {
        hostFormat: 'xml',
        slug: 'to-json',
        fromFormat: 'xml',
        toFormat: 'json',
        name: 'XML to JSON',
        tagline: 'Attributes, repeated tags and text content, mapped to plain JSON keys.',
        seoTitle: 'XML to JSON Converter - Convert XML to JSON Online',
        seoDescription:
            'Free online XML to JSON converter. Attributes become @-prefixed keys, repeated sibling elements become arrays, text content becomes a plain string or a #text key. Runs in your browser.',
        seoKeywords:
            'xml to json converter, convert xml to json, xml to json online, xml json converter free',
        h1: 'XML to JSON Converter',
        intro: [
            "The hard part of turning XML into JSON isn't syntax, it's that XML carries information JSON has no native place for: attributes, and text that sits next to child elements rather than being the only content. This converter's rule for both is explicit rather than implied — see the mapping below — and it's the same rule /json/to-xml uses in reverse, so a round trip through both pages is stable for the shapes this covers.",
            'The example below — a small product feed, the kind an older internal API might return — is loaded into the converter above. Each <product> carries a sku attribute and a nested <price> that itself has a currency attribute and text: exactly the case that needs both @ and #text to represent faithfully.',
        ],
        sample: { input: PRODUCTS_XML_TEXT, output: PRODUCTS_JSON_TEXT },
        mapping: [
            {
                heading: 'Attributes become @-prefixed keys',
                body: [
                    'sku="SKU-100" on a <product> element becomes "@sku": "SKU-100" in its JSON object. The @ keeps attributes visually distinct from child elements when you\'re reading the JSON, and is what /json/to-xml looks for to convert back the other way.',
                ],
            },
            {
                heading: 'An element with only text collapses to a plain string',
                body: [
                    '<name>Wireless Mouse</name> becomes "name": "Wireless Mouse" directly — not {"#text": "Wireless Mouse"} — because there is nothing else on that element (no attributes, no children) that the #text key would need to sit alongside.',
                ],
                code: `<price currency="BRL">129.90</price>`,
            },
            {
                heading: "...but #text appears once there's also an attribute",
                body: [
                    'The <price> element above has both an attribute and text, so it cannot collapse to a bare string — there would be nowhere to put the currency. It becomes {"@currency": "BRL", "#text": "129.90"} instead.',
                ],
            },
            {
                heading: 'Repeated tags become one array, in document order',
                body: [
                    'Two <product> elements under <products> become one "product" array with two entries, in the order they appeared — not two separate keys and not merged into one object. A single <product> (no siblings) stays a plain object, not a one-item array.',
                ],
            },
            {
                heading: 'Every value becomes a string — on purpose',
                body: [
                    'XML text is always just characters; XML itself has no number or boolean type. 129.90 above stays the string "129.90" rather than being parsed into the number 129.9, which would also silently normalize away that trailing zero. Guessing the type would be exactly that — a guess — the same call this site\'s JSON-to-TypeScript converter makes for the same reason.',
                ],
            },
        ],
        limitations: [
            "Mixed content — text interleaved with child elements, like <p>Hello <b>world</b>!</p> — loses the ordering between the text and the element: it becomes {\"#text\": \"Hello !\", \"b\": \"world\"}, which can't distinguish that from \"!<b>world</b>Hello \". This converter is built for structured, config- and API-shaped XML, not prose-like markup, and this is where that shows.",
            'XML namespaces are treated as plain string prefixes — soap:Envelope becomes the JSON key "soap:Envelope" as literal text, not resolved against its xmlns declaration. This is a real, deliberate scope limit: namespace-aware resolution is a meaningfully larger problem than the config-and-API-response XML this converter targets.',
            "Comments and processing instructions are dropped — they aren't data, so there's no JSON key for them to become.",
        ],
        faq: [
            {
                q: 'Why does one element become a plain string and another become an object?',
                a: 'An element with no attributes and no children collapses to just its text, as a string. One with an attribute, a child element, or both becomes an object — because a plain string has nowhere to attach that extra information.',
            },
            {
                q: "What happens to XML comments?",
                a: "They're dropped. Comments document the XML for a human reader; they aren't part of the data, so there's no corresponding JSON value for them.",
            },
            {
                q: 'Does it handle CDATA sections?',
                a: 'Yes — the content inside <![CDATA[ ... ]]> is taken verbatim as text, without re-parsing it as markup, exactly like a normal text node.',
            },
        ],
        updated: UPDATED,
    },

    'json/to-yaml': {
        hostFormat: 'json',
        slug: 'to-yaml',
        fromFormat: 'json',
        toFormat: 'yaml',
        name: 'JSON to YAML',
        tagline: 'No convention to design — YAML already is the JSON data model, just written differently.',
        seoTitle: 'JSON to YAML Converter - Convert JSON to YAML Online',
        seoDescription:
            'Free online JSON to YAML converter, for Kubernetes manifests, Docker Compose files, and CI configs. Lossless for every JSON-native type. Runs in your browser.',
        seoKeywords:
            'json to yaml converter, convert json to yaml, json to yaml online, kubernetes yaml converter',
        h1: 'JSON to YAML Converter',
        intro: [
            "Unlike JSON-to-XML, this direction has no convention to invent: a YAML mapping is a JSON object, a YAML sequence is a JSON array, and YAML's scalars are the same strings, numbers, booleans and null JSON already has. Converting is really just re-serializing the same values — which is also why it's the one conversion on this site with no \"known limitations\" about lost information.",
            'The example below is a Kubernetes Deployment fragment — the kind of document YAML is used for constantly and JSON almost never is, which is usually the actual reason someone wants this conversion: editing structured data by hand in the format their tooling expects.',
        ],
        sample: { input: K8S_JSON_TEXT, output: K8S_YAML_TEXT },
        mapping: [
            {
                heading: 'Nesting becomes indentation',
                body: [
                    "A JSON object's keys become YAML's block-mapping syntax (key: value, indented under their parent), and a JSON array becomes a block sequence (- item, one per line). There's no attribute/text distinction to design around, because neither format has attributes.",
                ],
            },
            {
                heading: 'Strings are quoted only when YAML would otherwise misread them',
                body: [
                    'apiVersion: apps/v1 is written bare — an unquoted plain scalar — because YAML has no trouble parsing it as a string. A value that looks like a YAML number, boolean, or null (like the text "true", "null", or "123") is quoted so it round-trips back as a string rather than being reinterpreted as that other type. A string containing ": " (colon-space) is quoted for the same reason: unquoted, YAML would read it as another key-value pair rather than one value.',
                ],
            },
            {
                heading: 'A multi-line string becomes a block literal, not an escaped one-liner',
                body: [
                    'A JSON string containing \\n is written using YAML\'s | block-literal style — the text on its own indented lines — rather than as one quoted line with a literal backslash-n in it. It reads the way the original text actually looks, which matters for anything like a multi-line description or a shell command embedded in a CI config.',
                ],
            },
            {
                heading: 'Strings that look like something else are always quoted',
                body: [
                    'YAML 1.1, which many parsers still implement, treats more unquoted words as special than JSON does: yes, no, on and off are booleans there, a leading zero as in 0777 can be read as an octal number, 2026-10-09 can become a date, and ~ means null. The classic example is the country code for Norway — country: NO is read by those parsers as country: false.',
                    'So the converter quotes every JSON string that a YAML parser could read as a different type: \'NO\', \'yes\', \'on\', \'01310\', \'0777\', \'2026-10-09\' and \'~\' all come out in single quotes, and convert back to the same strings. The quotes look redundant to a person; they are what keeps a postcode from turning into a number in someone else\'s pipeline.',
                ],
            },
        ],
        limitations: [
            "None specific to this direction: every JSON value (object, array, string, number, boolean, null) has a direct YAML equivalent, so nothing here is a guess the way an attribute or a repeated tag name is on the XML side. The one thing to know is general to YAML, not to this converter: a YAML document can express things JSON can't (anchors and aliases for repeated structures, multiple documents in one file, comments) — converting JSON to YAML will never produce those, since JSON has nothing for them to come from.",
        ],
        faq: [
            {
                q: 'Is this conversion ever lossy?',
                a: 'Not for anything JSON itself can represent. Every object, array, string, number, boolean and null maps directly to its YAML equivalent with nothing left to guess.',
            },
            {
                q: 'Why are some strings quoted and others not?',
                a: 'A string is quoted only when leaving it bare would change its meaning in YAML — for example the literal text "true" or "123", which would otherwise parse back as a boolean or a number instead of a string.',
            },
            {
                q: "Can I convert a Kubernetes manifest or docker-compose file this way?",
                a: 'Yes for the direction of pasting JSON and getting YAML out — most infrastructure tooling accepts both, and this produces valid YAML for anything that started as valid JSON.',
            },
        ],
        updated: UPDATED,
    },
};

export function getConverterGuide(hostFormat: ConverterHost, slug: string): ConverterGuide | undefined {
    return CONVERTER_GUIDES[`${hostFormat}/${slug}`];
}

export function converterGuidesFor(hostFormat: ConverterHost): ConverterGuide[] {
    return Object.values(CONVERTER_GUIDES).filter(g => g.hostFormat === hostFormat);
}

export interface ConverterGuideTranslation {
    h1?: string;
    tagline?: string;
    intro?: string[];
    mapping?: SectionTranslation[];
    limitations?: string[];
    faq?: FaqTranslation[];
}

/** Keyed the same way as CONVERTER_GUIDES: `${hostFormat}/${slug}`, e.g. "json/to-xml". */
const CONVERTER_TRANSLATIONS: Record<ExtraLocale, Partial<Record<string, ConverterGuideTranslation>>> = {
    pt: CONVERTER_TRANSLATIONS_PT,
    es: CONVERTER_TRANSLATIONS_ES,
    de: CONVERTER_TRANSLATIONS_DE,
    fr: CONVERTER_TRANSLATIONS_FR,
    zh: CONVERTER_TRANSLATIONS_ZH,
    ja: CONVERTER_TRANSLATIONS_JA,
};

/** Overlays the active language's translation onto the English base guide (see i18n-guide.ts). */
export function localizeConverterGuide(guide: ConverterGuide, language: string): ConverterGuide {
    const locale = toExtraLocale(language);
    const key = `${guide.hostFormat}/${guide.slug}`;
    const t = locale ? CONVERTER_TRANSLATIONS[locale][key] : undefined;
    if (!t) return guide;
    return {
        ...guide,
        h1: t.h1 ?? guide.h1,
        tagline: t.tagline ?? guide.tagline,
        intro: mergeArray(guide.intro, t.intro),
        mapping: mergeSections(guide.mapping, t.mapping),
        limitations: mergeArray(guide.limitations, t.limitations),
        faq: mergeFaq(guide.faq, t.faq),
    };
}
