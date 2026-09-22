/**
 * Single entry point the converter UI calls: parse text in one format, serialize the
 * resulting value in another. Pure and synchronous — no dynamic import, no browser API
 * — so it can run identically during the initial render on the server (the build-time
 * prerender) and in the browser, which is what lets FormatConverter seed its result
 * with a plain `useState(() => convert(...))` initializer instead of a separately
 * precomputed prop that could drift from what the function actually does.
 */
import { xmlToJson, jsonToXml } from './xml-json-convert';
import { yamlToJson, jsonToYaml } from './yaml-convert';

export type DataFormat = 'json' | 'xml' | 'yaml';

export const DATA_FORMAT_LABELS: Record<DataFormat, string> = {
    json: 'JSON',
    xml: 'XML',
    yaml: 'YAML',
};

export interface ConvertResult {
    output: string;
    error: string | null;
}

export function convert(input: string, from: DataFormat, to: DataFormat): ConvertResult {
    if (!input.trim()) return { output: '', error: null };

    let value: unknown;
    try {
        value = parse(input, from);
    } catch (error) {
        return { output: '', error: `Couldn't parse this as ${DATA_FORMAT_LABELS[from]}: ${message(error)}` };
    }

    try {
        const output = serialize(value, to);
        // None of the three parsers should produce `undefined` for input that didn't
        // already throw (checked directly: JSON.parse and js-yaml's load() both throw
        // rather than returning it, and xmlToJson always returns an object). This guard
        // exists so a future change to one of them fails loudly here instead of handing
        // the UI the literal JS value `undefined` where it expects a string.
        if (output === undefined) throw new Error('produced no value to serialize');
        return { output, error: null };
    } catch (error) {
        return { output: '', error: `Couldn't convert to ${DATA_FORMAT_LABELS[to]}: ${message(error)}` };
    }
}

function parse(input: string, format: DataFormat): unknown {
    switch (format) {
        case 'json': return JSON.parse(input);
        case 'xml': return xmlToJson(input);
        case 'yaml': return yamlToJson(input);
    }
}

function serialize(value: unknown, format: DataFormat): string {
    switch (format) {
        case 'json': return JSON.stringify(value, null, 2);
        case 'xml': return jsonToXml(value);
        case 'yaml': return jsonToYaml(value);
    }
}

function message(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
}
