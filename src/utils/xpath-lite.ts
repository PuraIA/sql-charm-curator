/**
 * A deliberately scoped XPath 1.0 evaluator — not the full language.
 *
 * A real XPath engine belongs in a browser as `document.evaluate()`, which every
 * browser already ships. The reason this file exists rather than just calling that is
 * the same reason xml-json-convert.ts has its own XML parser: `document.evaluate()`
 * needs a live DOM, which only exists in a browser, and this needs to run identically
 * in the browser and during the build-time prerender (Node) and in tests. So this
 * implements the subset of XPath 1.0 that covers what people actually type into an
 * XPath tester — see "Supported syntax" below — over this project's own XML parser
 * (xml-json-convert.ts's parseXmlTree), not the full W3C grammar and function library.
 *
 * Supported syntax:
 *   - Location steps: /a/b, a/b (relative), //a (descendant-or-self shorthand,
 *     anywhere in the path, not just at the start), *, ., .. (any number of ".." in a
 *     row, walking up as many ancestors as written)
 *   - Node tests: a tag name, * (any element), @name (an attribute), @* (all
 *     attributes), text() (direct text content)
 *   - Predicates (any number, applied in sequence): [N] (1-indexed position),
 *     [last()], [@name] (attribute present), [@name='value'], [name] (has a child
 *     element with this tag), [not(...)], [contains(@name, 'x')], [contains(text(), 'x')]
 *   - count(path) as a whole expression, returning the match count as a number
 *
 * Not supported, deliberately: the union operator (|), the following/preceding/
 * namespace axes, XPath 2.0/3.0 (sequences, for/if/quantified expressions), most of
 * the function library (string manipulation beyond contains(), node-set functions
 * beyond count()), and namespace-aware matching — a prefixed name like soap:Body is
 * matched as the literal string "soap:Body", the same simplification xml-json-convert.ts
 * makes. See /xml/xpath's "Known limitations" for the worked examples.
 */
import { parseXmlTree, XmlParseError, type RawElement } from './xml-json-convert';

export { XmlParseError };

export class XPathSyntaxError extends Error {}

export type XPathMatch =
    | { kind: 'element'; label: string; snippet: string }
    | { kind: 'attribute'; label: string; value: string }
    | { kind: 'text'; label: string; value: string };

export type XPathResult =
    | { kind: 'nodes'; matches: XPathMatch[] }
    | { kind: 'count'; value: number };

/** Parses `xml` and evaluates `expression` against it, from the document root. */
export function evaluateXPath(xml: string, expression: string): XPathResult {
    const root = parseXmlTree(xml);
    return evaluateAgainst(root, expression);
}

/**
 * Same as evaluateXPath, but against an already-parsed tree — used by tests and by
 * anything that wants to run several expressions against one document without
 * re-parsing it each time.
 */
export function evaluateAgainst(root: RawElement, expression: string): XPathResult {
    const trimmed = expression.trim();

    const countMatch = /^count\((.+)\)$/.exec(trimmed);
    if (countMatch) {
        const nodes = runPath(root, countMatch[1]);
        return { kind: 'count', value: nodes.length };
    }

    const nodes = runPath(root, trimmed);
    return { kind: 'nodes', matches: nodes.map(describe) };
}

// --------------------------------------------------------------------- node model
//
// ElementCtx carries a link to its own parent context (not just the raw parent
// element), so the parent axis (..) can walk up an arbitrary number of ancestors —
// `../..` — rather than only one level.

interface ElementCtx {
    kind: 'element';
    el: RawElement;
    parentCtx: ElementCtx | null;
}
interface AttributeCtx {
    kind: 'attribute';
    name: string;
    value: string;
    owner: RawElement;
}
interface TextCtx {
    kind: 'text';
    value: string;
    owner: RawElement;
}
type Ctx = ElementCtx | AttributeCtx | TextCtx;

function directText(el: RawElement): string {
    return el.content
        .filter((c): c is { text: string } => 'text' in c)
        .map(c => c.text)
        .join('')
        .trim();
}

function childElements(el: RawElement): RawElement[] {
    return el.content.filter((c): c is RawElement => 'tag' in c);
}

function describe(ctx: Ctx): XPathMatch {
    if (ctx.kind === 'attribute') {
        return { kind: 'attribute', label: `@${ctx.name}`, value: ctx.value };
    }
    if (ctx.kind === 'text') {
        return { kind: 'text', label: `text() of <${ctx.owner.tag}>`, value: ctx.value };
    }
    const attrs = Object.entries(ctx.el.attrs).map(([k, v]) => ` ${k}="${v}"`).join('');
    const text = directText(ctx.el);
    const childCount = childElements(ctx.el).length;
    const snippet = childCount > 0 ? `${childCount} child element${childCount === 1 ? '' : 's'}` : text || '(empty)';
    return { kind: 'element', label: `<${ctx.el.tag}${attrs}>`, snippet };
}

// --------------------------------------------------------------------------- parsing

type Axis = 'child' | 'descendant-or-self' | 'self' | 'parent';

interface NodeTest {
    kind: 'name' | 'wildcard' | 'attribute' | 'allAttributes' | 'text';
    name?: string;
}

type Predicate =
    | { kind: 'position'; index: number }
    | { kind: 'last' }
    | { kind: 'hasAttr'; name: string }
    | { kind: 'attrEquals'; name: string; value: string }
    | { kind: 'hasChild'; name: string }
    | { kind: 'not'; inner: Predicate }
    | { kind: 'contains'; target: 'attr' | 'text'; attrName?: string; needle: string };

interface Step {
    axis: Axis;
    test: NodeTest;
    predicates: Predicate[];
}

function runPath(root: RawElement, path: string): Ctx[] {
    const { steps } = parsePath(path);
    let current: Ctx[] = [{ kind: 'element', el: root, parentCtx: null }];
    // The very first step is special: /bookstore (or a relative bookstore/...) has to
    // match the root element *itself*, not root's children — the root is the only
    // "child" of the implicit document node a real XPath engine evaluates paths
    // against. Every later step's 'child' axis means exactly what it says.
    let isFirstStep = true;
    for (const step of steps) {
        current = applyStep(current, step, isFirstStep);
        isFirstStep = false;
    }
    return current;
}

/** Splits a path on top-level `/`, treating `[...]` (including quoted strings inside) as opaque. */
function splitTopLevel(path: string): string[] {
    const parts: string[] = [];
    let depth = 0;
    let quote: '"' | "'" | null = null;
    let current = '';

    for (const ch of path) {
        if (quote) {
            current += ch;
            if (ch === quote) quote = null;
            continue;
        }
        if (ch === '"' || ch === "'") {
            quote = ch;
            current += ch;
        } else if (ch === '[') {
            depth++;
            current += ch;
        } else if (ch === ']') {
            depth--;
            current += ch;
        } else if (ch === '/' && depth === 0) {
            parts.push(current);
            current = '';
        } else {
            current += ch;
        }
    }
    parts.push(current);
    return parts;
}

function parsePath(path: string): { steps: Step[] } {
    if (!path.trim()) throw new XPathSyntaxError('Empty expression.');

    const raw = splitTopLevel(path.trim());
    const steps: Step[] = [];

    // splitTopLevel("/a/b") -> ["", "a", "b"]; ("//a/b") -> ["", "", "a", "b"];
    // ("a//b") -> ["a", "", "b"]. An empty segment always means "descendant-or-self
    // from here", whether it opens the path (the leading "" of an absolute path) or
    // sits between two real steps (a written //).
    let pendingDescendant = false;
    for (let i = 0; i < raw.length; i++) {
        const segment = raw[i].trim();
        if (segment === '') {
            if (i === 0) continue;
            pendingDescendant = true;
            continue;
        }
        steps.push(parseStep(segment, pendingDescendant));
        pendingDescendant = false;
    }

    if (pendingDescendant) throw new XPathSyntaxError('A path cannot end with "//".');
    return { steps };
}

function parseStep(segment: string, viaDescendant: boolean): Step {
    if (segment === '..') return { axis: 'parent', test: { kind: 'wildcard' }, predicates: [] };
    if (segment === '.') return { axis: 'self', test: { kind: 'wildcard' }, predicates: [] };

    const bracketStart = segment.indexOf('[');
    const testPart = bracketStart === -1 ? segment : segment.slice(0, bracketStart);
    const predicatesPart = bracketStart === -1 ? '' : segment.slice(bracketStart);

    const test = parseNodeTest(testPart.trim());
    const predicates = parsePredicates(predicatesPart);
    const axis: Axis = viaDescendant ? 'descendant-or-self' : 'child';
    return { axis, test, predicates };
}

function parseNodeTest(text: string): NodeTest {
    if (text === '*') return { kind: 'wildcard' };
    if (text === '@*') return { kind: 'allAttributes' };
    if (text === 'text()') return { kind: 'text' };
    if (text.startsWith('@')) return { kind: 'attribute', name: text.slice(1) };
    if (/^[A-Za-z_][\w.:-]*$/.test(text)) return { kind: 'name', name: text };
    throw new XPathSyntaxError(`Unrecognized step "${text}".`);
}

function parsePredicates(text: string): Predicate[] {
    const predicates: Predicate[] = [];
    let i = 0;
    while (i < text.length) {
        if (text[i] !== '[') throw new XPathSyntaxError(`Expected "[" at "${text.slice(i)}".`);
        let depth = 1;
        let j = i + 1;
        while (j < text.length && depth > 0) {
            if (text[j] === '[') depth++;
            else if (text[j] === ']') depth--;
            j++;
        }
        if (depth !== 0) throw new XPathSyntaxError('Unbalanced "[" in predicate.');
        predicates.push(parsePredicate(text.slice(i + 1, j - 1).trim()));
        i = j;
    }
    return predicates;
}

function parsePredicate(expr: string): Predicate {
    if (/^\d+$/.test(expr)) return { kind: 'position', index: parseInt(expr, 10) };
    if (expr === 'last()') return { kind: 'last' };

    const notMatch = /^not\((.+)\)$/.exec(expr);
    if (notMatch) return { kind: 'not', inner: parsePredicate(notMatch[1].trim()) };

    const containsMatch = /^contains\(\s*(@[\w.:-]+|text\(\))\s*,\s*(['"])(.*)\2\s*\)$/.exec(expr);
    if (containsMatch) {
        const [, target, , needle] = containsMatch;
        return target === 'text()'
            ? { kind: 'contains', target: 'text', needle }
            : { kind: 'contains', target: 'attr', attrName: target.slice(1), needle };
    }

    const attrEqualsMatch = /^@([\w.:-]+)\s*=\s*(['"])(.*)\2$/.exec(expr);
    if (attrEqualsMatch) return { kind: 'attrEquals', name: attrEqualsMatch[1], value: attrEqualsMatch[3] };

    if (/^@[\w.:-]+$/.test(expr)) return { kind: 'hasAttr', name: expr.slice(1) };
    if (/^[A-Za-z_][\w.:-]*$/.test(expr)) return { kind: 'hasChild', name: expr };

    throw new XPathSyntaxError(`Unsupported predicate "[${expr}]".`);
}

// ---------------------------------------------------------------------- evaluation

function applyStep(input: Ctx[], step: Step, isFirstStep: boolean): Ctx[] {
    const elementInputs = input.filter((ctx): ctx is ElementCtx => ctx.kind === 'element');

    // @name / @* / text() are the attribute axis and a self-only text test, not the
    // child axis — book[1]/@category reads "book[1]'s own @category", the same way
    // real XPath's attribute::category is a distinct axis from child::. So unlike the
    // name/wildcard case below, a plain (non-//) step here operates on the incoming
    // elements directly, with no 'child' expansion first. A written // still means
    // what it always means — search every descendant, including self — so that case
    // does expand, via 'descendant-or-self'.
    if (step.test.kind === 'attribute' || step.test.kind === 'allAttributes') {
        const elements = step.axis === 'descendant-or-self'
            ? elementInputs.flatMap(ctx => expandAxis(ctx, step.axis, isFirstStep))
            : elementInputs;
        const attrs: AttributeCtx[] = [];
        for (const ctx of elements) {
            for (const [name, value] of Object.entries(ctx.el.attrs)) {
                if (step.test.kind === 'allAttributes' || name === step.test.name) {
                    attrs.push({ kind: 'attribute', name, value, owner: ctx.el });
                }
            }
        }
        return applyPredicates(attrs, step.predicates);
    }

    if (step.test.kind === 'text') {
        const elements = step.axis === 'descendant-or-self'
            ? elementInputs.flatMap(ctx => expandAxis(ctx, step.axis, isFirstStep))
            : elementInputs;
        const texts: TextCtx[] = elements
            .map(ctx => ({ kind: 'text' as const, value: directText(ctx.el), owner: ctx.el }))
            .filter(ctx => ctx.value !== '');
        return applyPredicates(texts, step.predicates);
    }

    const elements = elementInputs.flatMap(ctx => expandAxis(ctx, step.axis, isFirstStep));
    const tested = step.test.kind === 'wildcard' ? elements : elements.filter(ctx => ctx.el.tag === step.test.name);
    return applyPredicates(tested, step.predicates);
}

function expandAxis(ctx: ElementCtx, axis: Axis, isFirstStep = false): ElementCtx[] {
    // The root element is the sole "child" of the implicit document node, so the
    // first step's child axis has to test the root itself rather than descend into
    // its children — see the comment in runPath. Every other axis already produces
    // the right answer at the root with no special-casing: 'self' is always [ctx],
    // 'parent' is already [] (the root has no parentCtx), and 'descendant-or-self'
    // already includes ctx itself as its first result.
    if (isFirstStep && axis === 'child') return [ctx];

    switch (axis) {
        case 'self':
            return [ctx];
        case 'parent':
            return ctx.parentCtx ? [ctx.parentCtx] : [];
        case 'child':
            return childElements(ctx.el).map(el => ({ kind: 'element', el, parentCtx: ctx }));
        case 'descendant-or-self': {
            const result: ElementCtx[] = [];
            const walk = (current: ElementCtx) => {
                result.push(current);
                for (const child of childElements(current.el)) {
                    walk({ kind: 'element', el: child, parentCtx: current });
                }
            };
            walk(ctx);
            return result;
        }
    }
}

function applyPredicates<T extends Ctx>(nodes: T[], predicates: Predicate[]): T[] {
    let current = nodes;
    for (const predicate of predicates) {
        current = current.filter((ctx, i) => matchesPredicate(ctx, predicate, i, current.length));
    }
    return current;
}

function matchesPredicate(ctx: Ctx, predicate: Predicate, index: number, total: number): boolean {
    switch (predicate.kind) {
        case 'position':
            return index + 1 === predicate.index;
        case 'last':
            return index === total - 1;
        case 'not':
            return !matchesPredicate(ctx, predicate.inner, index, total);
        case 'hasAttr':
            return ctx.kind === 'element' && predicate.name in ctx.el.attrs;
        case 'attrEquals':
            return ctx.kind === 'element' && ctx.el.attrs[predicate.name] === predicate.value;
        case 'hasChild':
            return ctx.kind === 'element' && childElements(ctx.el).some(c => c.tag === predicate.name);
        case 'contains': {
            if (ctx.kind !== 'element') return false;
            const haystack = predicate.target === 'text' ? directText(ctx.el) : (ctx.el.attrs[predicate.attrName!] ?? '');
            return haystack.includes(predicate.needle);
        }
    }
}
