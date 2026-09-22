import { describe, it, expect } from 'vitest';
import { xmlToJson, jsonToXml, XmlParseError } from './xml-json-convert';

describe('xmlToJson', () => {
    it('collapses a pure text leaf to a string', () => {
        expect(xmlToJson('<a>hello</a>')).toEqual({ a: 'hello' });
    });

    it('collapses an empty leaf to an empty string', () => {
        expect(xmlToJson('<a></a>')).toEqual({ a: '' });
        expect(xmlToJson('<a/>')).toEqual({ a: '' });
    });

    it('prefixes attributes with @ and keeps an attributes-only element free of #text', () => {
        expect(xmlToJson('<img src="x.png" width="10"/>')).toEqual({
            img: { '@src': 'x.png', '@width': '10' },
        });
    });

    it('groups repeated sibling tags into an array, in document order', () => {
        const xml = '<root><item>a</item><item>b</item><item>c</item></root>';
        expect(xmlToJson(xml)).toEqual({ root: { item: ['a', 'b', 'c'] } });
    });

    it('keeps a single occurrence of a tag as a scalar, not a one-item array', () => {
        expect(xmlToJson('<root><item>a</item></root>')).toEqual({ root: { item: 'a' } });
    });

    it('takes CDATA content verbatim, without re-parsing it as markup', () => {
        expect(xmlToJson('<script><![CDATA[if (a < b) { x(); }]]></script>')).toEqual({
            script: 'if (a < b) { x(); }',
        });
    });

    it('ignores comments entirely', () => {
        expect(xmlToJson('<root><!-- note --><a>1</a></root>')).toEqual({ root: { a: '1' } });
    });

    it('decodes the five predefined entities and numeric character references', () => {
        expect(xmlToJson('<a>Tom &amp; Jerry &#65; &#x42;</a>')).toEqual({ a: 'Tom & Jerry A B' });
    });

    it('accepts both single- and double-quoted attribute values', () => {
        expect(xmlToJson(`<a id='7'/>`)).toEqual({ a: { '@id': '7' } });
    });

    it('skips the XML declaration and DOCTYPE before the root element', () => {
        const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE root>\n<root>ok</root>';
        expect(xmlToJson(xml)).toEqual({ root: 'ok' });
    });

    it('known limitation: mixed content loses the ordering between text and child elements', () => {
        // Text runs are concatenated and child elements are collected separately, so
        // "Hello <b>world</b>!" and "!<b>world</b>Hello " would produce the same JSON.
        // This is a real, demonstrated property of the key-based representation, not a
        // hypothetical — documented on /xml/to-json's "Known limitations".
        expect(xmlToJson('<p>Hello <b>world</b>!</p>')).toEqual({
            p: { '#text': 'Hello !', b: 'world' },
        });
    });

    it('throws XmlParseError on a document with no root element', () => {
        expect(() => xmlToJson('   ')).toThrow(XmlParseError);
    });

    it('throws XmlParseError on a mismatched closing tag', () => {
        expect(() => xmlToJson('<a><b>x</a></b>')).toThrow(XmlParseError);
    });
});

describe('jsonToXml', () => {
    it('uses the single top-level key as the root tag', () => {
        expect(jsonToXml({ bookstore: { book: 'Dune' } })).toBe(
            '<?xml version="1.0" encoding="UTF-8"?>\n<bookstore>\n  <book>Dune</book>\n</bookstore>\n'
        );
    });

    it('wraps a multi-key top-level object in a default root', () => {
        expect(jsonToXml({ a: '1', b: '2' })).toBe(
            '<?xml version="1.0" encoding="UTF-8"?>\n<root>\n  <a>1</a>\n  <b>2</b>\n</root>\n'
        );
    });

    it('wraps a bare top-level array in one root, using itemName for each entry', () => {
        expect(jsonToXml(['x', 'y'])).toBe(
            '<?xml version="1.0" encoding="UTF-8"?>\n<root>\n  <item>x</item>\n  <item>y</item>\n</root>\n'
        );
    });

    it('regression: a single key whose own value is a bare array does not produce two root elements', () => {
        // Previously: renderElement's array branch reused the tag name for every item,
        // so {users: [1, 2]} produced two sibling <users> elements — not well-formed
        // XML, since a document can only have one root.
        const xml = jsonToXml({ users: [1, 2] });
        expect(xml).toBe(
            '<?xml version="1.0" encoding="UTF-8"?>\n<users>\n  <item>1</item>\n  <item>2</item>\n</users>\n'
        );
        expect(xml.match(/<users/g)).toHaveLength(1);
    });

    it('expands an array value under an object key into repeated sibling elements', () => {
        const xml = jsonToXml({ bookstore: { book: ['Dune', 'Foundation'] } });
        expect(xml).toContain('<book>Dune</book>');
        expect(xml).toContain('<book>Foundation</book>');
        expect(xml.match(/<book>/g)).toHaveLength(2);
    });

    it('turns @-prefixed keys into attributes and #text into text content, together', () => {
        // With no child elements, the attribute-plus-text element collapses to one line.
        expect(jsonToXml({ note: { '@id': '1', '#text': 'hi' } })).toContain('<note id="1">hi</note>');
    });

    it('puts #text on its own indented line when the element also has child elements', () => {
        expect(jsonToXml({ note: { '@id': '1', '#text': 'hi', extra: null } })).toContain(
            '<note id="1">\n  hi\n  <extra/>\n</note>'
        );
    });

    it('renders null as an empty element', () => {
        expect(jsonToXml({ a: null })).toContain('<a/>');
    });

    it('regression: an explicit undefined #text does not render the literal word "undefined"', () => {
        // Previously: text = String(obj['#text']) turned `undefined` into the 9-character
        // string "undefined" instead of being treated as "no text content".
        const xml = jsonToXml({ note: { '@id': '1', '#text': undefined, tag: 'x' } });
        expect(xml).not.toContain('undefined');
        expect(xml).toContain('<note id="1">\n  <tag>x</tag>\n</note>');
    });

    it('regression: an explicit undefined attribute does not render as the string "undefined"', () => {
        const xml = jsonToXml({ a: { '@maybe': undefined, '#text': 'x' } });
        expect(xml).not.toContain('undefined');
        expect(xml).toBe('<?xml version="1.0" encoding="UTF-8"?>\n<a>x</a>\n');
    });

    it('escapes &, < and > in text, and additionally " in attribute values', () => {
        const xml = jsonToXml({ a: { '@q': 'a"b', '#text': 'x < y & z > w' } });
        expect(xml).toContain('q="a&quot;b"');
        expect(xml).toContain('x &lt; y &amp; z &gt; w');
    });

    it('sanitizes a key that is not a valid XML name, visibly rather than silently', () => {
        const xml = jsonToXml({ '2fa': true, 'weird key!': 'x' });
        expect(xml).toContain('<_2fa>true</_2fa>');
        expect(xml).toContain('<weird_key_>x</weird_key_>');
    });
});

describe('xmlToJson / jsonToXml round trip', () => {
    it('is structurally faithful for a realistic document (attributes, repeated siblings, nesting)', () => {
        const xml =
            '<bookstore><book category="cooking"><title lang="en">Everyday Italian</title><price>30.00</price></book></bookstore>';
        const json = xmlToJson(xml);
        const roundTripped = xmlToJson(jsonToXml(json));
        expect(roundTripped).toEqual(json);
    });

    it('known limitation: every XML text value becomes a JSON string, so JSON -> XML -> JSON does not preserve number/boolean/null types', () => {
        const original = { config: { port: 8080, debug: true, timeout: null, name: 'svc' } };
        const xml = jsonToXml(original);
        expect(xmlToJson(xml)).toEqual({
            config: { port: '8080', debug: 'true', timeout: '', name: 'svc' },
        });
    });
});
