/**
 * Infers TypeScript interfaces from a JSON value.
 *
 * Pure and dependency-free: it only walks the parsed value, so it runs identically in
 * the browser and during the build-time prerender. There is no external oracle for
 * "correct" TypeScript output the way sql-formatter is one for SQL — the ground truth
 * here is this function's own behaviour, so src/content/json-guides.test.ts pins its
 * output for the published sample and treats any drift as a regression.
 *
 * What it does:
 *   - Objects become named interfaces. Two objects with the exact same set of fields
 *     and types reuse one interface instead of duplicating it.
 *   - Arrays of objects are merged into a single interface; a field missing from some
 *     items becomes optional rather than producing several interfaces.
 *   - A field whose value type varies across occurrences becomes a union.
 *
 * What it deliberately does not do:
 *   - No attempt at detecting string sub-types (dates, UUIDs, enums-of-string-literals).
 *     Every string is `string`. Narrowing that reliably needs sampling assumptions this
 *     function does not make.
 *   - No numeric literal or integer/float distinction: every number is `number`.
 */

interface Field {
    key: string;
    optional: boolean;
    type: string;
}

interface Ctx {
    /** Structural signature -> interface name already emitted for that exact shape. */
    signatures: Map<string, string>;
    /** Interface name -> rendered `interface Name { ... }` block. */
    bodies: Map<string, string>;
    /** Interface names, in the order their shape was first completed (children before parents). */
    order: string[];
    usedNames: Set<string>;
}

export function jsonToTypeScript(value: unknown, rootName = 'Root'): string {
    const ctx: Ctx = { signatures: new Map(), bodies: new Map(), order: [], usedNames: new Set() };
    const rootType = typeOfValue(value, rootName, ctx);

    // A root that isn't an object (an array of primitives, a bare string, ...) has no
    // interface of its own: emit a type alias for it instead.
    if (!ctx.bodies.has(rootType)) {
        return `type ${toPascalCase(rootName)} = ${rootType};\n`;
    }

    // Root first for readability, then everything else in the order it was completed,
    // which — because a parent's own emit happens after its fields are resolved —
    // comes out roughly outermost-next, innermost-last once reversed.
    const rest = ctx.order.filter(name => name !== rootType).reverse();
    return [rootType, ...rest].map(name => ctx.bodies.get(name)!).join('\n\n') + '\n';
}

function typeOfValue(value: unknown, nameHint: string, ctx: Ctx): string {
    if (value === null) return 'null';
    if (Array.isArray(value)) return typeOfArray(value, nameHint, ctx);

    switch (typeof value) {
        case 'string':
            return 'string';
        case 'number':
            return 'number';
        case 'boolean':
            return 'boolean';
        case 'object':
            return registerInterface([value as Record<string, unknown>], nameHint, ctx);
        default:
            return 'unknown';
    }
}

function typeOfArray(items: unknown[], nameHint: string, ctx: Ctx): string {
    if (items.length === 0) return 'unknown[]';

    const objectItems: Record<string, unknown>[] = [];
    const scalarTypes = new Set<string>();

    for (const item of items) {
        if (item !== null && typeof item === 'object' && !Array.isArray(item)) {
            objectItems.push(item as Record<string, unknown>);
        } else {
            scalarTypes.add(typeOfValue(item, singularize(nameHint), ctx));
        }
    }

    if (objectItems.length > 0) {
        scalarTypes.add(registerInterface(objectItems, singularize(nameHint), ctx));
    }

    const element = unionOf(scalarTypes);
    return `${needsParens(element) ? `(${element})` : element}[]`;
}

/** Merges one or more same-role objects into a single interface. */
function registerInterface(objects: Record<string, unknown>[], nameHint: string, ctx: Ctx): string {
    const allKeys = new Set<string>();
    for (const obj of objects) {
        for (const key of Object.keys(obj)) allKeys.add(key);
    }

    const fields: Field[] = [...allKeys].map(key => {
        const presentIn = objects.filter(obj => Object.prototype.hasOwnProperty.call(obj, key));
        const types = new Set(presentIn.map(obj => typeOfValue(obj[key], key, ctx)));
        return { key, optional: presentIn.length < objects.length, type: unionOf(types) };
    });

    const signature = fields
        .map(f => `${f.key}${f.optional ? '?' : ''}:${f.type}`)
        .sort()
        .join(';');

    const existing = ctx.signatures.get(signature);
    if (existing) return existing;

    const name = uniqueName(toPascalCase(singularize(nameHint)), ctx);
    ctx.signatures.set(signature, name);
    ctx.bodies.set(name, renderInterface(name, fields));
    ctx.order.push(name);
    return name;
}

function renderInterface(name: string, fields: Field[]): string {
    const lines = fields.map(f => `  ${propertyKey(f.key)}${f.optional ? '?' : ''}: ${f.type};`);
    return [`interface ${name} {`, ...lines, '}'].join('\n');
}

function unionOf(types: Set<string>): string {
    if (types.size === 0) return 'unknown';
    return [...types].join(' | ');
}

function needsParens(type: string): boolean {
    return type.includes(' | ');
}

/** camelCase, snake_case or kebab-case key -> PascalCase interface name. */
function toPascalCase(key: string): string {
    const pascal = key
        .replace(/[_-]+(.)/g, (_, c: string) => c.toUpperCase())
        .replace(/^[a-z]/, c => c.toUpperCase())
        .replace(/[^A-Za-z0-9]/g, '');
    return /^[A-Za-z]/.test(pascal) ? pascal : `Type${pascal}`;
}

/** Naive plural -> singular for a nested array's element interface name ("users" -> "User"). */
function singularize(key: string): string {
    if (/ies$/i.test(key)) return key.slice(0, -3) + 'y';
    if (/(s)es$/i.test(key) && !/[aeiou]ses$/i.test(key)) return key.slice(0, -2);
    if (/s$/i.test(key) && !/ss$/i.test(key)) return key.slice(0, -1);
    return key;
}

function uniqueName(base: string, ctx: Ctx): string {
    if (!ctx.usedNames.has(base)) {
        ctx.usedNames.add(base);
        return base;
    }
    let i = 2;
    while (ctx.usedNames.has(`${base}${i}`)) i++;
    const name = `${base}${i}`;
    ctx.usedNames.add(name);
    return name;
}

/** Quotes a property key only when it isn't a valid identifier. */
function propertyKey(key: string): string {
    return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key) ? key : JSON.stringify(key);
}
