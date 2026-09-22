import { describe, it, expect } from 'vitest';
import { yamlToJson, jsonToYaml, YAMLException } from './yaml-convert';

describe('yamlToJson', () => {
    it('parses mappings, sequences, and scalars into their JS equivalents', () => {
        const yaml = 'name: checkout\nport: 8080\nenabled: true\ntags:\n  - a\n  - b\nnote: null\n';
        expect(yamlToJson(yaml)).toEqual({
            name: 'checkout',
            port: 8080,
            enabled: true,
            tags: ['a', 'b'],
            note: null,
        });
    });

    it('accepts the ~ and empty spellings of null', () => {
        expect(yamlToJson('a: ~\nb:\n')).toEqual({ a: null, b: null });
    });

    it('rejects an unknown/unsafe tag rather than constructing it', () => {
        expect(() => yamlToJson('a: !!python/object:os.system {}')).toThrow(YAMLException);
    });

    it('throws YAMLException on malformed indentation', () => {
        expect(() => yamlToJson('a:\n  b: 1\n c: 2')).toThrow(YAMLException);
    });
});

describe('jsonToYaml', () => {
    it('round-trips a realistic config through dump then load', () => {
        const value = {
            name: 'checkout-service',
            port: 8080,
            retries: 3,
            features: { fastCheckout: true, giftCards: false },
            allowedOrigins: ['https://shop.example.com', 'https://admin.example.com'],
        };
        expect(yamlToJson(jsonToYaml(value))).toEqual(value);
    });

    it('represents null as the literal "null"', () => {
        expect(jsonToYaml({ a: null })).toBe('a: null\n');
    });

    it('omits a key whose value is undefined, the same as JSON.stringify does', () => {
        expect(jsonToYaml({ a: 1, b: undefined })).toBe('a: 1\n');
    });
});
