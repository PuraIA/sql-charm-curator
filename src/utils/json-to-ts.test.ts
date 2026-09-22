import { describe, it, expect } from 'vitest';
import { jsonToTypeScript } from './json-to-ts';

describe('jsonToTypeScript', () => {
    it('infers primitive field types', () => {
        expect(jsonToTypeScript({ id: 1, name: 'Ana', active: true }, 'Root')).toBe(
            `interface Root {\n  id: number;\n  name: string;\n  active: boolean;\n}\n`
        );
    });

    it('gives nested objects their own named interface', () => {
        const out = jsonToTypeScript({ user: { id: 1, address: { city: 'SP' } } }, 'Root');
        expect(out).toContain('interface Root {\n  user: User;\n}');
        expect(out).toContain('interface User {\n  id: number;\n  address: Address;\n}');
        expect(out).toContain('interface Address {\n  city: string;\n}');
    });

    it('merges an array of objects into one interface and marks uneven fields optional', () => {
        const out = jsonToTypeScript(
            { users: [{ id: 1, name: 'A' }, { id: 2, name: 'B', nickname: 'Bee' }] },
            'Root'
        );
        expect(out).toContain('users: User[];');
        expect(out).toContain('interface User {\n  id: number;\n  name: string;\n  nickname?: string;\n}');
    });

    it('unions element types for a mixed-type array', () => {
        expect(jsonToTypeScript({ values: [1, 'two', 3] }, 'Root')).toContain(
            'values: (number | string)[];'
        );
    });

    it('reuses one interface for two structurally identical objects', () => {
        const out = jsonToTypeScript(
            { billing: { city: 'SP', zip: '1' }, shipping: { city: 'RJ', zip: '2' } },
            'Root'
        );
        expect(out).toContain('billing: Billing;');
        expect(out).toContain('shipping: Billing;');
        // Only one interface body for the shared shape.
        expect(out.match(/interface Billing/g)).toHaveLength(1);
    });

    it('handles null, empty arrays, and non-identifier keys', () => {
        const out = jsonToTypeScript({ middleName: null, items: [], 'user-id': 1 }, 'Root');
        expect(out).toContain('middleName: null;');
        expect(out).toContain('items: unknown[];');
        expect(out).toContain('"user-id": number;');
    });

    it('emits a type alias, not an interface, for a non-object root', () => {
        expect(jsonToTypeScript(['a', 'b'], 'Tags')).toBe('type Tags = string[];\n');
        expect(jsonToTypeScript(42, 'Answer')).toBe('type Answer = number;\n');
    });

    it('produces the exact output published on /json/to-typescript', async () => {
        const { JSON_GUIDES } = await import('@/content/json-guides');
        const guide = JSON_GUIDES['to-typescript'];
        const parsed = JSON.parse(guide.sample.input);
        expect(jsonToTypeScript(parsed, guide.rootTypeName)).toBe(guide.sample.output);
    });
});
