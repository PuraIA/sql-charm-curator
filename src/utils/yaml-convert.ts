/**
 * YAML <-> JSON, via js-yaml.
 *
 * Unlike the XML side, this direction has no ambiguity to design around: YAML's data
 * model (mappings, sequences, strings, numbers, booleans, null) already is JSON's data
 * model, just with a different surface syntax and a few extra scalar spellings
 * (unquoted strings, block scalars, `~` for null). js-yaml's `load` parses those into
 * plain JS values and its `dump` serializes plain JS values back — there is no
 * "convention" to write down the way there is for xml-json-convert.ts.
 *
 * `load` is safe by default (js-yaml v4+): it only resolves the JSON/core schema types
 * and rejects unknown tags like `!!python/object`, rather than trying to construct
 * arbitrary types from the document.
 */
import { load, dump, YAMLException } from 'js-yaml';

export { YAMLException };

export function yamlToJson(yaml: string): unknown {
    return load(yaml);
}

export function jsonToYaml(value: unknown): string {
    return dump(value);
}
