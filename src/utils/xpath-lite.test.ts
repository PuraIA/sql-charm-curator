import { describe, it, expect } from 'vitest';
import { evaluateXPath, XPathSyntaxError, XmlParseError } from './xpath-lite';

const BOOKSTORE = `<?xml version="1.0" encoding="UTF-8"?>
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

function nodes(expr: string) {
    const result = evaluateXPath(BOOKSTORE, expr);
    if (result.kind !== 'nodes') throw new Error('expected a node-set result');
    return result.matches;
}

describe('evaluateXPath', () => {
    it('/bookstore/book selects all three books, in document order', () => {
        expect(nodes('/bookstore/book').map(m => m.label)).toEqual([
            '<book category="cooking" id="b1">',
            '<book category="children" id="b2">',
            '<book category="web" id="b3">',
        ]);
    });

    it('//title finds elements at any depth, not just direct children', () => {
        expect(nodes('//title')).toHaveLength(3);
    });

    it('[@attr=\'value\'] filters by attribute equality', () => {
        const matches = nodes("/bookstore/book[@category='children']");
        expect(matches).toHaveLength(1);
        expect(matches[0].label).toContain('id="b2"');
    });

    it('[N] is 1-indexed position, and [last()] is the final match', () => {
        expect(nodes('/bookstore/book[1]')[0].label).toContain('id="b1"');
        expect(nodes('/bookstore/book[last()]')[0].label).toContain('id="b3"');
    });

    it('[@attr] tests attribute presence without checking its value', () => {
        expect(nodes('/bookstore/book[@id]')).toHaveLength(3);
        expect(nodes('/bookstore/book[@nonexistent]')).toHaveLength(0);
    });

    it('text() returns the trimmed direct text content', () => {
        const matches = nodes('/bookstore/book[1]/price/text()');
        expect(matches).toEqual([{ kind: 'text', label: 'text() of <price>', value: '30.00' }]);
    });

    it('@name selects an attribute as its own node, separate from the element', () => {
        const matches = nodes('/bookstore/book[1]/@category');
        expect(matches).toEqual([{ kind: 'attribute', label: '@category', value: 'cooking' }]);
    });

    it('@* selects every attribute of the matched elements', () => {
        expect(nodes('/bookstore/book[1]/@*').map(m => m.label)).toEqual(['@category', '@id']);
    });

    it('* matches any child element, by count', () => {
        expect(nodes('/bookstore/book[1]/*')).toHaveLength(4); // title, author, year, price
    });

    it('.. walks up to the parent, and a chained ../.. walks up two levels', () => {
        const parents = nodes('//title/..');
        expect(parents.every(m => m.label.startsWith('<book'))).toBe(true);
        const grandparents = nodes('//title/../..');
        expect(grandparents.every(m => m.label === '<bookstore>')).toBe(true);
    });

    it('not() negates a predicate', () => {
        const matches = nodes("/bookstore/book[not(@category='web')]");
        expect(matches).toHaveLength(2);
    });

    it('contains(text(), ...) does a substring test on text content', () => {
        const matches = nodes("//title[contains(text(), 'Potter')]");
        expect(matches).toHaveLength(1);
    });

    it('contains(@attr, ...) does a substring test on an attribute', () => {
        expect(nodes("/bookstore/book[contains(@category, 'cook')]")).toHaveLength(1);
    });

    it('count(path) returns a scalar count instead of a node list', () => {
        expect(evaluateXPath(BOOKSTORE, 'count(/bookstore/book)')).toEqual({ kind: 'count', value: 3 });
        expect(evaluateXPath(BOOKSTORE, "count(//title[contains(text(), 'Harry')])")).toEqual({
            kind: 'count',
            value: 1,
        });
    });

    it('. (self) is a no-op step', () => {
        expect(nodes('/bookstore/book[1]/.')).toEqual(nodes('/bookstore/book[1]'));
    });

    it('a path with no matches returns an empty node list, not an error', () => {
        expect(nodes('/bookstore/nonexistent')).toEqual([]);
    });

    it('throws XPathSyntaxError on a malformed predicate', () => {
        expect(() => evaluateXPath(BOOKSTORE, '/bookstore/book[@id=]')).toThrow(XPathSyntaxError);
    });

    it('throws XPathSyntaxError on an empty expression', () => {
        expect(() => evaluateXPath(BOOKSTORE, '   ')).toThrow(XPathSyntaxError);
    });

    it('throws XmlParseError (not XPathSyntaxError) on malformed XML', () => {
        expect(() => evaluateXPath('<a><b></a>', '/a/b')).toThrow(XmlParseError);
    });

    it('regression: @name reads the current element\'s own attribute, not one from its children', () => {
        // book[1]'s first child, <title lang="en">, has an attribute that could have
        // been picked up by mistake if @category were treated as a child-axis step.
        expect(nodes('/bookstore/book[1]/@category')).toEqual([
            { kind: 'attribute', label: '@category', value: 'cooking' },
        ]);
        expect(nodes('/bookstore/book[1]/@*').map(m => m.label)).toEqual(['@category', '@id']);
    });

    it('//@name searches every descendant\'s attributes, unlike a plain @name step', () => {
        // Every book has @category; no other element in the document does.
        expect(nodes('//@category')).toHaveLength(3);
    });

    it('a bare @name or text() as the whole expression reads it from the document root', () => {
        expect(nodes('@nonexistent')).toEqual([]);
        // <bookstore> itself has no direct text (only whitespace between its <book>
        // children), so this is empty — a real, not a hypothetical, edge case.
        expect(nodes('text()')).toEqual([]);
    });

    it('known limitation: a namespace-prefixed tag is matched as a literal string, not resolved', () => {
        const soap =
            '<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope"><soap:Body><Order id="1"/></soap:Body></soap:Envelope>';
        // The only correct way to select this element with this evaluator is to spell
        // the prefix out exactly as written in the document — soap:Body, not Body, and
        // not a namespace-aware match against the xmlns declaration.
        const withPrefix = evaluateXPath(soap, '/soap:Envelope/soap:Body/Order');
        expect(withPrefix).toEqual({ kind: 'nodes', matches: [{ kind: 'element', label: '<Order id="1">', snippet: '(empty)' }] });
        const withoutPrefix = evaluateXPath(soap, '/Envelope/Body/Order');
        expect(withoutPrefix).toEqual({ kind: 'nodes', matches: [] });
    });

    it('rejects the union operator with a clear error rather than silently mis-parsing it', () => {
        expect(() => evaluateXPath(BOOKSTORE, '/bookstore/book | /bookstore/title')).toThrow(XPathSyntaxError);
    });
});
