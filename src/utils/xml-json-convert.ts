/**
 * Converts between XML and the JSON data model, in both directions.
 *
 * There is no canonical mapping between the two — JSON has no attributes, no mixed
 * content, no distinction between "one child" and "one child that happens to be the
 * only item in a list", and XML has no arrays, no numbers, no booleans, no null. Any
 * converter has to pick a convention and be explicit about it, so this file documents
 * its own rules rather than behaving like it's just "obviously" translating one format
 * into the other:
 *
 *   - An XML attribute becomes a JSON key prefixed with `@` (`id="4"` -> `"@id": "4"`).
 *   - Text content becomes the key `#text` when the element also has attributes or
 *     child elements; otherwise the element collapses straight to a string.
 *   - Sibling elements that share a tag name become a JSON array under that tag name.
 *   - Every XML text value becomes a JSON *string*. XML has no type system — a text
 *     node is just characters — so guessing "008" means the number 8, or "true" means
 *     the boolean, would be exactly that: a guess. This mirrors the same call already
 *     made in json-to-ts.ts for the reverse problem (inferring types from JSON).
 *   - Converting back, a JS `null` becomes an empty element, and an array becomes
 *     repeated sibling elements under its key's tag name.
 *
 * The XML side is parsed and built by this file's own code, not DOMParser: DOMParser
 * only exists in a browser, and this needs to run identically during the build-time
 * prerender (Node) and in tests, the same reasoning as prettyPrintXml in xml-utils.ts.
 * It is a deliberately narrow parser — real elements, attributes, text, CDATA,
 * comments, and a best-effort skip over the XML declaration and DOCTYPE — not a
 * general-purpose one. See "Known limitations" on /xml/to-json and /json/to-xml for
 * what it does not attempt: namespaces are treated as plain string prefixes, and there
 * is no DTD/entity-declaration support.
 */

// ---------------------------------------------------------------------- XML -> JSON

export interface XmlToJsonResult {
    /** The root element's tag name. */
    rootName: string;
    /** The JSON-convention value for everything inside the root element. */
    value: JsonValue;
}

export type JsonValue = string | JsonObject | JsonValue[];
export interface JsonObject {
    [key: string]: JsonValue;
}

export class XmlParseError extends Error {}

/** Parses an XML document into `{ [rootTagName]: value }`, per the conventions above. */
export function xmlToJson(xml: string): { [rootName: string]: JsonValue } {
    const { rootName, value } = parseXmlDocument(xml);
    return { [rootName]: value };
}

function parseXmlDocument(xml: string): XmlToJsonResult {
    const root = parseXmlTree(xml);
    return { rootName: root.tag, value: elementToJson(root) };
}

/**
 * Parses XML into its raw element tree — tag, attributes, and ordered content — with
 * no JSON convention applied. Exported for xpath-lite.ts, which needs the actual tree
 * shape (parent/child structure, attributes, text runs in document order) rather than
 * the @/#text-flavored JSON value xmlToJson produces.
 */
export function parseXmlTree(xml: string): RawElement {
    const tokens = new Tokenizer(xml);
    tokens.skipProlog();
    const root = tokens.readElement();
    if (!root) throw new XmlParseError('No root element found.');
    return root;
}

export interface RawElement {
    tag: string;
    attrs: Record<string, string>;
    /** Interleaved child elements and text runs, in document order. */
    content: (RawElement | { text: string })[];
}

function elementToJson(el: RawElement): JsonValue {
    const attrEntries = Object.entries(el.attrs);
    const childElements = el.content.filter((c): c is RawElement => 'tag' in c);
    const text = el.content
        .filter((c): c is { text: string } => 'text' in c)
        .map(c => c.text)
        .join('');
    const meaningfulText = text.trim().length > 0;

    // A pure leaf — no attributes, no children — collapses to its text, or "" if empty.
    if (attrEntries.length === 0 && childElements.length === 0) {
        return meaningfulText ? text : '';
    }

    const obj: JsonObject = {};
    for (const [name, value] of attrEntries) obj[`@${name}`] = value;
    if (meaningfulText) obj['#text'] = text;

    // Group children by tag name, preserving first-seen order, so repeated tags become
    // one array in that position rather than being scattered across separate keys.
    const order: string[] = [];
    const groups = new Map<string, JsonValue[]>();
    for (const child of childElements) {
        if (!groups.has(child.tag)) {
            groups.set(child.tag, []);
            order.push(child.tag);
        }
        groups.get(child.tag)!.push(elementToJson(child));
    }
    for (const tag of order) {
        const values = groups.get(tag)!;
        obj[tag] = values.length === 1 ? values[0] : values;
    }

    return obj;
}

/** A minimal, hand-rolled XML tokenizer — see the file header for its exact scope. */
class Tokenizer {
    private pos = 0;
    private readonly src: string;
    constructor(src: string) {
        this.src = src;
    }

    /** Skips the XML declaration, comments, processing instructions, and DOCTYPE before the root element. */
    skipProlog(): void {
        for (;;) {
            this.skipWhitespace();
            if (this.src.startsWith('<?', this.pos)) {
                const end = this.src.indexOf('?>', this.pos);
                if (end === -1) throw new XmlParseError('Unterminated processing instruction.');
                this.pos = end + 2;
            } else if (this.src.startsWith('<!--', this.pos)) {
                this.skipComment();
            } else if (this.src.startsWith('<!DOCTYPE', this.pos) || this.src.startsWith('<!doctype', this.pos)) {
                this.skipDoctype();
            } else {
                return;
            }
        }
    }

    private skipDoctype(): void {
        let depth = 0;
        for (let i = this.pos; i < this.src.length; i++) {
            const ch = this.src[i];
            if (ch === '[') depth++;
            else if (ch === ']') depth--;
            else if (ch === '>' && depth <= 0) {
                this.pos = i + 1;
                return;
            }
        }
        throw new XmlParseError('Unterminated DOCTYPE.');
    }

    private skipComment(): void {
        const end = this.src.indexOf('-->', this.pos);
        if (end === -1) throw new XmlParseError('Unterminated comment.');
        this.pos = end + 3;
    }

    private skipWhitespace(): void {
        while (this.pos < this.src.length && /\s/.test(this.src[this.pos])) this.pos++;
    }

    /** Reads one element (and everything nested inside it), or null at end of input. */
    readElement(): RawElement | null {
        this.skipWhitespace();
        if (this.pos >= this.src.length) return null;
        if (this.src[this.pos] !== '<') {
            throw new XmlParseError(`Expected '<' at position ${this.pos}.`);
        }

        const tagMatch = /^<([^\s/>]+)/.exec(this.src.slice(this.pos));
        if (!tagMatch) throw new XmlParseError(`Malformed tag at position ${this.pos}.`);
        const tag = tagMatch[1];
        this.pos += tagMatch[0].length;

        const attrs = this.readAttributes();

        this.skipWhitespace();
        if (this.src.startsWith('/>', this.pos)) {
            this.pos += 2;
            return { tag, attrs, content: [] };
        }
        if (this.src[this.pos] !== '>') {
            throw new XmlParseError(`Expected '>' to close <${tag}> at position ${this.pos}.`);
        }
        this.pos += 1;

        const content: (RawElement | { text: string })[] = [];
        for (;;) {
            const closeTag = `</${tag}`;
            if (this.src.startsWith(closeTag, this.pos)) {
                this.pos += closeTag.length;
                this.skipWhitespace();
                if (this.src[this.pos] !== '>') {
                    throw new XmlParseError(`Expected '>' after ${closeTag} at position ${this.pos}.`);
                }
                this.pos += 1;
                return { tag, attrs, content };
            }
            if (this.src.startsWith('<!--', this.pos)) {
                this.skipComment();
                continue;
            }
            if (this.src.startsWith('<![CDATA[', this.pos)) {
                const end = this.src.indexOf(']]>', this.pos);
                if (end === -1) throw new XmlParseError('Unterminated CDATA section.');
                content.push({ text: this.src.slice(this.pos + 9, end) });
                this.pos = end + 3;
                continue;
            }
            if (this.src.startsWith('<?', this.pos)) {
                const end = this.src.indexOf('?>', this.pos);
                if (end === -1) throw new XmlParseError('Unterminated processing instruction.');
                this.pos = end + 2;
                continue;
            }
            if (this.src[this.pos] === '<') {
                const child = this.readElement();
                if (child) content.push(child);
                continue;
            }
            const nextTag = this.src.indexOf('<', this.pos);
            const end = nextTag === -1 ? this.src.length : nextTag;
            if (end === this.pos) throw new XmlParseError(`Unexpected end of input inside <${tag}>.`);
            content.push({ text: unescapeXmlText(this.src.slice(this.pos, end)) });
            this.pos = end;
            if (nextTag === -1) throw new XmlParseError(`Unterminated element <${tag}>.`);
        }
    }

    private readAttributes(): Record<string, string> {
        const attrs: Record<string, string> = {};
        for (;;) {
            this.skipWhitespace();
            const match = /^([^\s/>=]+)\s*=\s*("([^"]*)"|'([^']*)')/.exec(this.src.slice(this.pos));
            if (!match) return attrs;
            const [full, name, , dq, sq] = match;
            attrs[name] = unescapeXmlText(dq !== undefined ? dq : sq);
            this.pos += full.length;
        }
    }
}

function unescapeXmlText(text: string): string {
    return text.replace(/&(#x[0-9a-fA-F]+|#\d+|[a-zA-Z]+);/g, (entity, body: string) => {
        if (body[0] === '#') {
            const codePoint = body[1] === 'x' ? parseInt(body.slice(2), 16) : parseInt(body.slice(1), 10);
            return Number.isNaN(codePoint) ? entity : String.fromCodePoint(codePoint);
        }
        switch (body) {
            case 'amp': return '&';
            case 'lt': return '<';
            case 'gt': return '>';
            case 'quot': return '"';
            case 'apos': return "'";
            default: return entity; // Unknown named entity: leave it exactly as written.
        }
    });
}

// ---------------------------------------------------------------------- JSON -> XML

export interface JsonToXmlOptions {
    /** Root tag name to use when the input doesn't unambiguously suggest one. */
    rootName?: string;
    /** Tag name for array items that don't otherwise have one (a bare top-level array). */
    itemName?: string;
    indent?: string;
}

/**
 * Builds an XML document from a JS value, inverting the conventions documented above:
 * `@`-prefixed keys become attributes, `#text` becomes text content, an array becomes
 * repeated sibling elements, and null becomes an empty element.
 *
 * If `value` is a plain object with exactly one key and no explicit `rootName` was
 * given, that key becomes the root tag — the inverse of what xmlToJson produces. Any
 * other shape (an array, a primitive, or an object with more than one key) has no
 * natural single tag name, so it's wrapped in `rootName` (default "root").
 */
export function jsonToXml(value: unknown, options: JsonToXmlOptions = {}): string {
    const indent = options.indent ?? '  ';
    const itemName = options.itemName ?? 'item';

    let rootName = options.rootName;
    let rootValue = value;
    if (!rootName && isPlainObject(value)) {
        const keys = Object.keys(value);
        if (keys.length === 1) {
            rootName = keys[0];
            rootValue = value[keys[0]];
        }
    }
    rootName = sanitizeTagName(rootName ?? 'root');

    const lines: string[] = ['<?xml version="1.0" encoding="UTF-8"?>'];
    if (Array.isArray(rootValue)) {
        // A bare array has no natural single tag name of its own — renderElement's
        // array branch would otherwise emit one <rootName> per item, which is several
        // sibling root elements and not well-formed XML. Wrap them in one root instead,
        // with itemName for each entry — this is the one place itemName is actually used.
        lines.push(`<${rootName}>`);
        for (const item of rootValue) renderElement(itemName, item, 1, indent, itemName, lines);
        lines.push(`</${rootName}>`);
    } else {
        renderElement(rootName, rootValue, 0, indent, itemName, lines);
    }
    return lines.join('\n') + '\n';
}

function renderElement(
    tag: string,
    value: unknown,
    depth: number,
    indentUnit: string,
    itemName: string,
    lines: string[]
): void {
    const pad = indentUnit.repeat(depth);
    const safeTag = sanitizeTagName(tag);

    if (Array.isArray(value)) {
        // A bare array at this position becomes one sibling per item, under the same
        // tag name — mirroring how xmlToJson turns repeated siblings into an array.
        for (const item of value) renderElement(safeTag, item, depth, indentUnit, itemName, lines);
        return;
    }

    if (value === null || value === undefined) {
        lines.push(`${pad}<${safeTag}/>`);
        return;
    }

    if (typeof value !== 'object') {
        const text = escapeXmlText(String(value));
        lines.push(text ? `${pad}<${safeTag}>${text}</${safeTag}>` : `${pad}<${safeTag}/>`);
        return;
    }

    const obj = value as Record<string, unknown>;
    const attrParts: string[] = [];
    const childKeys: string[] = [];
    let text: string | undefined;

    for (const key of Object.keys(obj)) {
        // undefined behaves like JSON.stringify treats it on an object: as if the key
        // were never there. null is a real, present value (see the top of this
        // function), so — unlike undefined — it still renders, as an empty element.
        if (obj[key] === undefined) continue;

        if (key === '#text') {
            if (obj[key] !== null) text = String(obj[key]);
        } else if (key.startsWith('@')) {
            if (obj[key] !== null) {
                attrParts.push(` ${sanitizeTagName(key.slice(1))}="${escapeXmlAttr(String(obj[key]))}"`);
            }
        } else {
            childKeys.push(key);
        }
    }
    const openTag = `<${safeTag}${attrParts.join('')}`;

    if (childKeys.length === 0 && text === undefined) {
        lines.push(`${pad}${openTag}/>`);
        return;
    }

    if (childKeys.length === 0) {
        // Text-only content stays on one line with its tag, like a leaf XML element.
        lines.push(`${pad}${openTag}>${escapeXmlText(text!)}</${safeTag}>`);
        return;
    }

    lines.push(`${pad}${openTag}>`);
    if (text !== undefined && text.trim() !== '') {
        lines.push(`${pad}${indentUnit}${escapeXmlText(text)}`);
    }
    for (const key of childKeys) {
        renderElement(key, obj[key], depth + 1, indentUnit, itemName, lines);
    }
    lines.push(`${pad}</${safeTag}>`);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Makes a JSON key safe to use as an XML tag or attribute name: XML names cannot start
 * with a digit and cannot contain most punctuation or whitespace. Invalid characters
 * become `_`; a name that would still start with a digit is prefixed with `_`. This is
 * a real, visible transformation — not a silent one — and is called out in the page's
 * "Known limitations".
 */
function sanitizeTagName(name: string): string {
    const cleaned = name.replace(/[^A-Za-z0-9_.:-]/g, '_');
    return /^[A-Za-z_]/.test(cleaned) ? cleaned : `_${cleaned}`;
}

function escapeXmlText(text: string): string {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeXmlAttr(text: string): string {
    return escapeXmlText(text).replace(/"/g, '&quot;');
}
