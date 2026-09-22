import { describe, it, expect } from 'vitest';
import { convert } from './format-convert';

describe('convert', () => {
    it('returns an empty, error-free result for blank input', () => {
        expect(convert('   ', 'json', 'xml')).toEqual({ output: '', error: null });
    });

    it('json -> xml', () => {
        const result = convert('{"bookstore":{"book":"Dune"}}', 'json', 'xml');
        expect(result.error).toBeNull();
        expect(result.output).toContain('<bookstore>\n  <book>Dune</book>\n</bookstore>');
    });

    it('xml -> json', () => {
        const result = convert('<a><b>1</b></a>', 'xml', 'json');
        expect(result.error).toBeNull();
        expect(JSON.parse(result.output)).toEqual({ a: { b: '1' } });
    });

    it('json -> yaml -> json is lossless for JSON-native types', () => {
        const original = { name: 'svc', port: 8080, active: true, tags: ['a', 'b'], note: null };
        const toYaml = convert(JSON.stringify(original), 'json', 'yaml');
        expect(toYaml.error).toBeNull();
        const backToJson = convert(toYaml.output, 'yaml', 'json');
        expect(backToJson.error).toBeNull();
        expect(JSON.parse(backToJson.output)).toEqual(original);
    });

    it('xml -> yaml', () => {
        const result = convert('<config port="8080"/>', 'xml', 'yaml');
        expect(result.error).toBeNull();
        expect(result.output).toContain('config:');
        expect(result.output).toContain("'@port': '8080'");
    });

    it('reports a clear, format-specific error for invalid JSON input', () => {
        const result = convert('{not valid json', 'json', 'xml');
        expect(result.error).toMatch(/Couldn't parse this as JSON/);
        expect(result.output).toBe('');
    });

    it('reports a clear, format-specific error for invalid XML input', () => {
        const result = convert('<a><b></a>', 'xml', 'json');
        expect(result.error).toMatch(/Couldn't parse this as XML/);
        expect(result.output).toBe('');
    });

    it('reports a clear error for YAML input that has no actual document (comment only)', () => {
        const result = convert('# just a comment, no data', 'yaml', 'json');
        expect(result.error).toMatch(/Couldn't parse this as YAML/);
        expect(result.output).toBe('');
    });

    it('is idempotent: converting a format to itself round-trips through the same value', () => {
        const original = { a: '1', b: { c: '2' } };
        const result = convert(JSON.stringify(original), 'json', 'json');
        expect(JSON.parse(result.output)).toEqual(original);
    });
});
