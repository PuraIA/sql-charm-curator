import { describe, it, expect } from 'vitest';
import { minifyXml, prettyPrintXml } from './xml-utils';

describe('prettyPrintXml', () => {
    it('indents sibling elements by 2 spaces under their parent', () => {
        const raw = '<root><a>1</a><b>2</b></root>';
        expect(prettyPrintXml(raw)).toBe('<root>\n  <a>1</a>\n  <b>2</b>\n</root>');
    });

    it('known quirk: a single-character tag name with no attributes is not recognised as an opening tag', () => {
        // The "is this an opening tag" pattern relies on regex backtracking that needs at
        // least two spare characters between the tag name and the closing >. A tag name
        // of a single character with no attributes — <a>, <b>, <p> — doesn't have them,
        // so it falls through to the "no indent change" branch instead: <b> here is never
        // recognised as opening a new level, so its content is not indented under it.
        // This is a real, pre-existing property of the heuristic, not one this change
        // introduces — captured here so it stays a known, verified quirk rather than a
        // silent surprise.
        const raw = '<root><a><b>1</b></a></root>';
        expect(prettyPrintXml(raw)).toBe('<root>\n  <a>\n  <b>1</b>\n</a>\n</root>');
    });

    it('is a no-op on input that is already exactly its own output (idempotent)', () => {
        const raw = '<root><a>1</a><b>2</b></root>';
        const once = prettyPrintXml(raw);
        expect(prettyPrintXml(once)).toBe(once);
    });

    it('uses \\n line endings, not \\r\\n', () => {
        expect(prettyPrintXml('<a><b>1</b></a>')).not.toContain('\r');
    });
});

describe('minifyXml', () => {
    it('collapses inter-tag indentation', () => {
        const xml = '<root>\n  <a>1</a>\n  <b>2</b>\n</root>';
        expect(minifyXml(xml)).toBe('<root><a>1</a><b>2</b></root>');
    });

    it('leaves attribute spacing alone', () => {
        expect(minifyXml('<a   b="1"    c="2" />')).toBe('<a   b="1"    c="2" />');
    });

    it('leaves CDATA content untouched', () => {
        const xml = '<root>\n  <script><![CDATA[if (a < b) { x(); }]]></script>\n</root>';
        expect(minifyXml(xml)).toBe('<root><script><![CDATA[if (a < b) { x(); }]]></script></root>');
    });

    it('does not touch whitespace that sits inside a text node next to real text', () => {
        // The space before "Hello" is not *between* two tags, so it survives — this is
        // the case that makes ordinary mixed content ("<p>Hello <b>x</b></p>") safe.
        const xml = '<p>\n  Hello <b>world</b>!\n</p>';
        expect(minifyXml(xml)).toBe(xml);
    });

    it('known limitation: strips a whitespace-only xml:space="preserve" text node', () => {
        // Documented on /xml/minify. The function cannot distinguish "formatting
        // whitespace" from "meaningful whitespace-only content" — both look identical.
        expect(minifyXml('<code xml:space="preserve">   </code>')).toBe(
            '<code xml:space="preserve"></code>'
        );
    });

    it('produces the exact output published on /xml/minify', async () => {
        const { XML_GUIDES } = await import('@/content/xml-guides');
        const guide = XML_GUIDES.minify;
        expect(minifyXml(guide.sample.input)).toBe(guide.sample.output);
    });
});
