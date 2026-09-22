import { describe, it, expect } from 'vitest';
import { diffLines, type DiffOp } from './line-diff';

/** Filtering out 'add' ops must reproduce the old sequence exactly, and vice versa —
 * the correctness property any diff has to satisfy, independent of which edit script
 * it happens to choose among the shortest ones. */
function reconstructOld(ops: DiffOp[]): string[] {
    return ops.filter(o => o.type !== 'add').map(o => o.value);
}
function reconstructNew(ops: DiffOp[]): string[] {
    return ops.filter(o => o.type !== 'remove').map(o => o.value);
}

function expectValidDiff(a: string[], b: string[]) {
    const ops = diffLines(a, b);
    expect(reconstructOld(ops)).toEqual(a);
    expect(reconstructNew(ops)).toEqual(b);
    return ops;
}

describe('diffLines', () => {
    it('is all equal ops for identical input', () => {
        const ops = expectValidDiff(['a', 'b', 'c'], ['a', 'b', 'c']);
        expect(ops.every(o => o.type === 'equal')).toBe(true);
    });

    it('is all removes then all adds for completely disjoint input', () => {
        expectValidDiff(['a', 'b'], ['x', 'y']);
    });

    it('handles one side empty in both directions', () => {
        expect(expectValidDiff([], ['a', 'b', 'c']).every(o => o.type === 'add')).toBe(true);
        expect(expectValidDiff(['a', 'b', 'c'], []).every(o => o.type === 'remove')).toBe(true);
    });

    it('handles both sides empty', () => {
        expect(diffLines([], [])).toEqual([]);
    });

    it('finds a minimal edit script for a single inserted line, keeping the common prefix and suffix equal', () => {
        const ops = expectValidDiff(['a', 'b', 'c'], ['a', 'x', 'b', 'c']);
        expect(ops).toEqual([
            { type: 'equal', value: 'a' },
            { type: 'add', value: 'x' },
            { type: 'equal', value: 'b' },
            { type: 'equal', value: 'c' },
        ]);
    });

    it('finds a minimal edit script for a single deleted line', () => {
        const ops = expectValidDiff(['a', 'b', 'c'], ['a', 'c']);
        expect(ops).toEqual([
            { type: 'equal', value: 'a' },
            { type: 'remove', value: 'b' },
            { type: 'equal', value: 'c' },
        ]);
    });

    it('isolates a one-line change to a remove+add pair, without touching the unchanged lines around it', () => {
        const ops = expectValidDiff(['SELECT', 'a', 'FROM t'], ['SELECT', 'b', 'FROM t']);
        expect(ops).toEqual([
            { type: 'equal', value: 'SELECT' },
            { type: 'remove', value: 'a' },
            { type: 'add', value: 'b' },
            { type: 'equal', value: 'FROM t' },
        ]);
    });

    it('produces the minimal edit distance for the algorithm\'s own canonical example (Myers 1986)', () => {
        // "ABCABBA" -> "CBABAC": a longest common subsequence of length 4 (e.g. CBBA),
        // so the shortest edit script has (7 - 4) + (6 - 4) = 5 operations — the
        // distance the original paper uses to introduce the algorithm.
        const ops = expectValidDiff('ABCABBA'.split(''), 'CBABAC'.split(''));
        expect(ops.filter(o => o.type !== 'equal')).toHaveLength(5);
    });

    it('remains valid (reconstructs both sides) for duplicate and reordered lines', () => {
        expectValidDiff(['x', 'x', 'x'], ['x', 'x']);
        expectValidDiff(['a', 'b', 'c'], ['c', 'b', 'a']);
    });
});
