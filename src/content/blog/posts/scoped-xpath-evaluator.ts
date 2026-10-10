import { evaluateXPath, type XPathResult } from '@/utils/xpath-lite';
import type { BlogPost } from '../types';

export const XPATH_SAMPLE_XML = `<bookstore>
  <book category="cooking"><title>Everyday Italian</title></book>
  <book category="web"><title>Learning XML</title></book>
</bookstore>`;

/** Renders an evaluator result the way the tester's match list reads, one match per line. */
export function describeResult(result: XPathResult): string {
    if (result.kind === 'count') return String(result.value);
    if (result.matches.length === 0) return '(no matches)';
    return result.matches
        .map(match => (match.kind === 'element' ? `${match.label}  — ${match.snippet}` : `${match.label} = "${match.value}"`))
        .join('\n');
}

// Evaluated by the real evaluator at build time; blog.test.ts pins the match counts.
export const XPATH_EXAMPLES = {
    absolute: '/bookstore/book',
    relativeFromDocument: 'book',
    ownAttribute: '/bookstore/book[1]/@category',
    descendantAttributes: '//@category',
    filterThenPosition: "/bookstore/book[@category='web'][1]",
    positionThenFilter: "/bookstore/book[1][@category='web']",
};

const shown = (expression: string) => `${expression}\n\n${describeResult(evaluateXPath(XPATH_SAMPLE_XML, expression))}`;

export const scopedXpathEvaluator: BlogPost = {
    slug: 'scoped-xpath-evaluator',
    title: 'Why our XPath tester doesn’t use document.evaluate()',
    description:
        'Browsers ship a complete XPath engine, and this site’s XPath tester does not use it. The constraint that forced a hand-written evaluator, what it deliberately leaves out, and the two spec details it got wrong first.',
    keywords: 'xpath evaluator, document.evaluate node, xpath in node without dom, xpath document node, xpath attribute axis',
    published: '2026-10-09',
    tags: ['XML', 'XPath', 'Engineering'],
    relatedTools: [
        { label: 'XPath Tester', path: '/xml/xpath' },
        { label: 'XML Formatter', path: '/xml' },
    ],
    blocks: [
        {
            type: 'p',
            text: 'Every modern browser has a complete XPath 1.0 engine built in: `document.evaluate()`. The obvious way to build an online XPath tester is to parse the user’s XML with `DOMParser` and hand the expression to it. The [XPath tester](/xml/xpath) on this site does not do that, and the reason is not about the browser at all.',
        },
        { type: 'h2', text: 'The constraint: the page is built before any browser sees it' },
        {
            type: 'p',
            text: 'Every page here is rendered to static HTML at build time, in Node, so that the explanation and worked examples exist in the HTML a search engine or a reader without JavaScript receives. The XPath page shows example expressions with their results, and the test suite checks those results. Both of those run in Node, where there is no `document` and no `DOMParser`.',
        },
        {
            type: 'p',
            text: 'There were two honest options. One was to pull in a DOM implementation for Node — a package such as `@xmldom/xmldom` together with an XPath library that runs on top of it — and accept that the build and the browser would be using different engines. The other was to evaluate XPath over the XML parser this site already had for its [XML to JSON converter](/xml/to-json), so that the build, the tests and the browser all run the same code. We chose the second, which only works if the evaluator is small. So it is deliberately not complete.',
        },
        { type: 'h2', text: 'What a tester actually needs' },
        {
            type: 'p',
            text: 'XPath 1.0 has thirteen axes and a function library of a few dozen functions. What people type into a tester is a much smaller set, and that is what the evaluator implements:',
        },
        {
            type: 'list',
            items: [
                'Location paths — absolute (`/a/b`), relative, `//` at any position, `*`, `.` and `..`.',
                'Node tests for elements, `@name`, `@*` and `text()`.',
                'The predicates that come up constantly: position (`[1]`, `[last()]`), attribute presence and equality, `not(...)` and `contains(...)`.',
                '`count(...)` as a whole expression.',
            ],
        },
        {
            type: 'p',
            text: 'Everything else — the union operator `|`, the `following` and `preceding` axes, namespace resolution, the rest of the function library — fails with a parse error that names the problem. The rule was that an unsupported expression must never produce a plausible wrong answer; an error is better than a list of matches that looks right.',
        },
        { type: 'h2', text: 'Spec detail #1: the root is not the top of the tree' },
        {
            type: 'p',
            text: 'The first version returned nothing for every absolute path. The parser produces a tree whose top node is the root element, `<bookstore>`, and the evaluator treated `/` as "start at that node". So `/bookstore/book` looked for a `<bookstore>` among the root element’s children, found none, and stopped.',
        },
        {
            type: 'p',
            text: 'In XPath, `/` is the document node — an invisible parent whose single child is the root element. The fix was to make the first step of an absolute path test the root element itself instead of its children, which is exactly what the document-node rule produces. A useful side effect of following the spec rather than intuition: a relative path evaluated from the document correctly finds nothing, because the document node’s only child is `bookstore`, not `book`.',
        },
        { type: 'code', label: 'Absolute path', code: shown(XPATH_EXAMPLES.absolute) },
        { type: 'code', label: 'Relative path, evaluated from the document', code: shown(XPATH_EXAMPLES.relativeFromDocument) },
        { type: 'h2', text: 'Spec detail #2: @name is an axis, not a child lookup' },
        {
            type: 'p',
            text: 'The second bug was subtler. After the first fix, element steps expanded to the context node’s children, and attribute steps went through the same expansion. So `/bookstore/book[1]/@category` read the `category` attribute of the first book’s children — and returned another element’s attribute, or nothing, depending on the document.',
        },
        {
            type: 'p',
            text: '`@category` is shorthand for `attribute::category`: it reads attributes of the current node, without stepping down. `text()` is the same kind of step. Only when it is written as `//@category` does it search descendants, and that is a different, broader query — the difference is easiest to see side by side:',
        },
        { type: 'code', label: 'The first book’s own attribute', code: shown(XPATH_EXAMPLES.ownAttribute) },
        { type: 'code', label: 'Every category attribute in the document', code: shown(XPATH_EXAMPLES.descendantAttributes) },
        {
            type: 'p',
            text: 'Both bugs are now pinned by regression tests named after the rule they enforce, not after the symptom, so the next person to touch the step logic reads the spec detail before they read the code.',
        },
        { type: 'h2', text: 'The detail people get wrong most: predicate order' },
        {
            type: 'p',
            text: 'Writing the predicate tests surfaced the rule that trips up users more than either bug above. Predicates are applied left to right, and each one filters the result of the one before it — like chained `.filter()` calls, not like conditions joined with `and`. That makes their order significant whenever one of them is positional:',
        },
        { type: 'code', label: 'Filter first, then take the first match', code: shown(XPATH_EXAMPLES.filterThenPosition) },
        { type: 'code', label: 'Take the first book, then check its category', code: shown(XPATH_EXAMPLES.positionThenFilter) },
        {
            type: 'p',
            text: 'The first expression asks for "the first web book" and finds one. The second asks for "the first book, if it is a web book" — and the first book is a cookbook, so the answer is nothing. Both are correct XPath; they are different questions. When an expression with `[1]` or `[last()]` returns less than you expected, swapping the predicates is the first thing to try, and the tester makes that a two-second experiment.',
        },
        {
            type: 'p',
            text: 'The same reading explains why an empty result is not an error in the tester. `/bookstore/nonexistent` is a well-formed question whose answer is "no nodes", the same way a database query that matches no rows is not a database error. The red error state is reserved for expressions the evaluator cannot parse or does not support, so the two situations never look alike.',
        },
        { type: 'h2', text: 'Was it worth it?' },
        {
            type: 'p',
            text: 'For a general XPath library, no — use one that implements the whole specification. For a tester whose examples must be rendered and verified outside a browser, a few hundred lines that do one subset correctly, and refuse the rest loudly, turned out simpler to trust than two engines that are supposed to agree. The cost is the "Known limitations" list on the [XPath tester](/xml/xpath) page, which is the price of writing that list down instead of discovering it.',
        },
    ],
};
