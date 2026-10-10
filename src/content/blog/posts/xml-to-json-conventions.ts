import { jsonToXml, xmlToJson } from '@/utils/xml-json-convert';
import { jsonToYaml } from '@/utils/yaml-convert';
import type { BlogPost } from '../types';

const json = (value: unknown) => JSON.stringify(value, null, 2);

// Produced by this site's own converter at build time; blog.test.ts asserts the
// properties the article relies on (array vs. string, lost ordering, string values).
export const CONVENTION_SAMPLES = {
    attrAndText: { input: '<book id="7" lang="en">Dune</book>' },
    oneBook: { input: '<shelf><book>Dune</book></shelf>' },
    twoBooks: { input: '<shelf><book>Dune</book><book>Emma</book></shelf>' },
    mixed: { input: '<p>Hello <b>world</b>!</p>' },
    price: { input: '<price currency="BRL">129.90</price>' },
};

export const CONVENTION_OUTPUTS = {
    attrAndText: xmlToJson(CONVENTION_SAMPLES.attrAndText.input),
    oneBook: xmlToJson(CONVENTION_SAMPLES.oneBook.input),
    twoBooks: xmlToJson(CONVENTION_SAMPLES.twoBooks.input),
    mixed: xmlToJson(CONVENTION_SAMPLES.mixed.input),
    mixedBackToXml: jsonToXml(xmlToJson(CONVENTION_SAMPLES.mixed.input) as Record<string, unknown>),
    price: xmlToJson(CONVENTION_SAMPLES.price.input),
    priceYaml: jsonToYaml(xmlToJson(CONVENTION_SAMPLES.price.input)),
};

export const xmlToJsonConventions: BlogPost = {
    slug: 'xml-to-json-conventions',
    title: 'There is no correct way to convert XML to JSON',
    description:
        'XML has attributes, ordered mixed content and no notion of arrays; JSON has none of those problems and none of those features. Four questions every XML-to-JSON converter has to answer, and the trade-offs behind each answer.',
    keywords: 'xml to json conventions, badgerfish, jsonml, xml attributes json, xml to json array problem',
    published: '2026-10-09',
    tags: ['XML', 'JSON', 'Data formats'],
    relatedTools: [
        { label: 'XML to JSON Converter', path: '/xml/to-json' },
        { label: 'JSON to XML Converter', path: '/json/to-xml' },
        { label: 'JSON to YAML Converter', path: '/json/to-yaml' },
    ],
    blocks: [
        {
            type: 'p',
            text: 'Converting JSON to YAML is mechanical: the two share a data model, so a converter only has to re-serialize the same values. XML to JSON is different. XML can say things JSON has no place for — attributes, text that sits between child elements, the order of differently-named siblings — and JSON has a distinction XML never makes: whether something is a list. Any converter between them is quietly choosing a convention. Most do not tell you which.',
        },
        {
            type: 'p',
            text: 'Building the [XML to JSON converter](/xml/to-json) on this site meant answering four questions. None of them has a right answer, only answers that suit some uses better than others.',
        },
        { type: 'h2', text: 'Question 1: where do attributes go?' },
        {
            type: 'p',
            text: 'An attribute and a child element both look like "a named value under this element", but they are not the same thing, and a converter that merges them cannot be reversed. The common fix is a prefix. This site uses `@`, and keeps the element’s text under a reserved `#text` key when there is anything else on the element:',
        },
        { type: 'code', label: 'Input', code: CONVENTION_SAMPLES.attrAndText.input },
        { type: 'code', label: 'This site’s output', code: json(CONVENTION_OUTPUTS.attrAndText) },
        {
            type: 'p',
            text: 'Other published conventions make the same split with different symbols. BadgerFish, one of the oldest, also uses `@` for attributes but `$` for text; its own documentation’s example turns `<alice charlie="david">bob</alice>` into an object with `"$": "bob"` and `"@charlie": "david"`. The Parker convention goes the other way and drops attributes entirely, which gives the cleanest JSON and loses data. Neither is wrong; they are tuned for different things — round-tripping versus reading.',
        },
        { type: 'h2', text: 'Question 2: does a single element become a string or an object?' },
        {
            type: 'p',
            text: 'If every element became an object, `<name>Dune</name>` would turn into `{"name": {"#text": "Dune"}}` — faithful, and tiring to use. So most converters, including this one, collapse an element with no attributes and no children to its text. The cost shows up as soon as an attribute appears: the same field changes shape. A price with a currency attribute is an object; a price without one would be a string.',
        },
        { type: 'code', label: 'With an attribute, the value moves under #text', code: json(CONVENTION_OUTPUTS.price) },
        { type: 'h2', text: 'Question 3: when does a repeated element become an array?' },
        {
            type: 'p',
            text: 'This is the one that breaks production code. XML has no list type; a list is just the same element written several times. A converter that only sees one document has to guess, and the usual guess — the one this site makes — is "an array if it repeats here":',
        },
        { type: 'code', label: 'One <book>', code: json(CONVENTION_OUTPUTS.oneBook) },
        { type: 'code', label: 'Two <book> elements', code: json(CONVENTION_OUTPUTS.twoBooks) },
        {
            type: 'p',
            text: 'Code written against the second shape — `shelf.book.map(...)` — throws the first time a shelf has exactly one book, because `book` is now a string. Nothing in the XML changed except the count. There are only three ways out, and each costs something:',
        },
        {
            type: 'list',
            items: [
                'Always produce arrays for element children. Predictable, and every single-valued field now needs `[0]` to read.',
                'Use a schema (XSD, or a hand-written list of repeatable element names) to decide. Correct, but the converter is no longer general-purpose.',
                'Normalize on the consuming side: wrap the value in an array if it is not one already. Cheap, and it has to be remembered at every call site.',
            ],
        },
        {
            type: 'p',
            text: 'A browser-based converter like this one cannot know your schema, so it uses the per-document guess and says so. If you are converting an API response you will consume in code, the third option is usually the practical one.',
        },
        { type: 'h2', text: 'Question 4: what happens to mixed content?' },
        {
            type: 'p',
            text: 'Mixed content is text interleaved with elements — normal in documents, rare in data. A JSON object has no order between differently-named keys, so the text and the element can be kept, but not their positions relative to each other:',
        },
        { type: 'code', label: 'Input', code: CONVENTION_SAMPLES.mixed.input },
        { type: 'code', label: 'This site’s output', code: json(CONVENTION_OUTPUTS.mixed) },
        { type: 'code', label: 'Converted back to XML', code: CONVENTION_OUTPUTS.mixedBackToXml },
        {
            type: 'p',
            text: 'The exclamation mark has moved and the sentence no longer reads correctly. The only family of conventions that avoids this is the array-based one, such as JsonML, which represents every element as an array of tag name, attributes and children in order — `["p", "Hello ", ["b", "world"], "!"]`. It round-trips any document perfectly and is awkward to query, because nothing is addressable by name. That is the right trade for markup and the wrong one for API payloads, which is why this site’s converter is built for the latter and documents the loss.',
        },
        { type: 'h2', text: 'A fifth, smaller question: types' },
        {
            type: 'p',
            text: 'XML text is characters. `129.90` might be a price, a version number or a postcode, and parsing it as a number would also silently drop the trailing zero. This converter keeps every value a string, and carries that through to YAML, where it has to quote the value so it is not read back as a number:',
        },
        { type: 'code', label: 'The same price, as YAML', code: CONVENTION_OUTPUTS.priceYaml },
        { type: 'h2', text: 'Choosing a convention' },
        {
            type: 'list',
            items: [
                'If the JSON will be converted back to XML, prefer a convention that keeps attributes (`@` prefixes) and accept the extra keys.',
                'If it will be read by code, decide the array question up front and normalize, instead of trusting whatever shape the first sample had.',
                'If the XML is a document rather than data — paragraphs, inline formatting — use an order-preserving, array-based representation, or do not convert it at all.',
                'Whatever you choose, write it down. Two services using two different converters on the same feed is a common source of "the field is sometimes an object" bugs.',
            ],
        },
        {
            type: 'note',
            text: 'The outputs labelled "this site’s output" are generated by the converter itself when this page is built, and the behaviour described for each is covered by tests. The BadgerFish, Parker and JsonML descriptions summarize those conventions’ own documentation and are not produced by code on this site.',
        },
    ],
};
