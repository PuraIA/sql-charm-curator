/**
 * Collapses the whitespace between tags in an XML document.
 *
 * Deliberately narrow: it only removes whitespace that sits strictly between a `>`
 * and the next `<`, which is the inter-element indentation a pretty-printer adds and
 * nothing else. It does not touch whitespace inside a text node's own content, inside
 * an attribute value, or inside a CDATA section, because that whitespace can be part
 * of the data rather than formatting.
 *
 * That narrowness is also its limitation: for **mixed content** — an element whose
 * text and child elements are interleaved, as in `<p>Hello <b>world</b>!</p>` — the
 * function still removes the whitespace between `<p>` and `Hello`'s neighbouring tags
 * where it exists, which is safe there, but a document that relies on
 * `xml:space="preserve"` to keep formatting-looking whitespace as meaningful content
 * should not be run through this function. See the "Known limitations" section on
 * /xml/minify, which documents this with a worked example.
 */
export function minifyXml(xml: string): string {
    return xml.replace(/>\s+</g, '><').trim();
}

/**
 * Re-indents an XML document with 2-space nesting.
 *
 * This is XMLFormatter's own reformatting algorithm, extracted so it can be run
 * without a browser: it never touches DOMParser (that only validates, in the
 * component, before this runs), so it works identically in Node and produces exactly
 * what the interactive tool would for the same input — which is what lets the /xml
 * guide pages seed their prerendered HTML with a real, verified pretty-print instead
 * of a hand-typed approximation of one.
 *
 * The heuristic is intentionally simple (regex-driven, not a real XML parser) and
 * inherited as-is from the original component: it looks at each tag-delimited
 * fragment and guesses its nesting depth from whether it opens, closes, or
 * self-closes. It has no notion of mixed content, so text interleaved with tags can
 * come out on its own line rather than attached to its element.
 *
 * One specific, verified quirk of that heuristic (see xml-utils.test.ts): a tag with a
 * single-character name and no attributes — <a>, <b>, <p> — is not recognised as an
 * opening tag, because the pattern that detects one needs two spare characters between
 * the tag name and the closing `>` to backtrack into. Its content ends up at the same
 * indent as the tag itself instead of one level deeper. Pre-existing behaviour, not
 * introduced by this extraction.
 */
export function prettyPrintXml(xml: string): string {
    let formatted = '';
    let pad = 0;
    const PADDING = '  ';

    const cleanXml = xml.replace(/>\s*</g, '><').trim();
    const xmlWithNewlines = cleanXml.replace(/(>)(<)(\/*)/g, '$1\r\n$2$3');
    const lines = xmlWithNewlines.split('\r\n');

    lines.forEach(node => {
        let indent = 0;
        if (node.match(/.+<\/\w[^>]*>$/)) {
            indent = 0;
        } else if (node.match(/^<\/\w/)) {
            if (pad !== 0) pad -= 1;
        } else if (node.match(/^<\w[^>]*[^/]>.*$/)) {
            indent = 1;
        } else {
            indent = 0;
        }

        // \r\n above is only an internal split delimiter; the output uses plain \n.
        formatted += PADDING.repeat(pad) + node + '\n';
        pad += indent;
    });

    return formatted.trim();
}
