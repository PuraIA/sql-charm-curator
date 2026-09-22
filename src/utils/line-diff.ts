/**
 * Line-level diff between two arrays of strings, producing the same kind of edit
 * script `diff`/`git diff` produce: a sequence of "keep this line", "remove this line
 * from the old side", "add this line on the new side" operations.
 *
 * Implements Myers' O(ND) shortest-edit-script algorithm (Myers, 1986, "An O(ND)
 * Difference Algorithm and Its Variations") rather than a naive line-by-line compare,
 * so a single inserted or deleted line in the middle of a query doesn't make every
 * following line look changed — the algorithm finds the *minimal* set of adds/removes
 * that turns the old sequence into the new one, the same guarantee `diff` makes.
 *
 * Deliberately line-based, not character-based: for formatted SQL (or any code), a
 * line is the natural unit of "one change", and it's what SQLDiff.tsx feeds this after
 * running both queries through sql-formatter with the same options — same reasoning as
 * comparing two `git diff`-ed files rather than two raw byte streams.
 */

export type DiffOpType = 'equal' | 'remove' | 'add';

export interface DiffOp {
    type: DiffOpType;
    value: string;
}

export function diffLines(oldLines: string[], newLines: string[]): DiffOp[] {
    const trace = shortestEditTrace(oldLines, newLines);
    return backtrack(trace, oldLines, newLines);
}

/**
 * Runs Myers' algorithm forward, recording a snapshot of the furthest-reaching
 * "D-path" endpoints after each round. `backtrack` walks these snapshots in reverse to
 * reconstruct one shortest edit script.
 */
function shortestEditTrace(a: string[], b: string[]): Map<number, number>[] {
    const n = a.length;
    const m = b.length;
    const max = n + m;
    const v = new Map<number, number>([[1, 0]]);
    const trace: Map<number, number>[] = [];

    for (let d = 0; d <= max; d++) {
        trace.push(new Map(v));

        for (let k = -d; k <= d; k += 2) {
            let x: number;
            // Choosing whether this diagonal's furthest point came from moving down
            // (an insertion from b) or right (a deletion from a) — the standard rule:
            // at the very first or last diagonal of this round, there's only one
            // choice; otherwise take whichever neighbor reached further.
            if (k === -d || (k !== d && (v.get(k - 1) ?? 0) < (v.get(k + 1) ?? 0))) {
                x = v.get(k + 1) ?? 0;
            } else {
                x = (v.get(k - 1) ?? 0) + 1;
            }
            let y = x - k;

            // Follow any run of matching lines along this diagonal for free — these
            // become 'equal' ops during backtracking, at no extra edit cost.
            while (x < n && y < m && a[x] === b[y]) {
                x++;
                y++;
            }

            v.set(k, x);

            if (x >= n && y >= m) {
                trace[trace.length - 1] = new Map(v);
                return trace;
            }
        }
    }

    // Only reachable if a or b is degenerate in a way the loop above didn't already
    // resolve; kept as a defined fallback rather than an unreachable-code assumption.
    return trace;
}

function backtrack(trace: Map<number, number>[], a: string[], b: string[]): DiffOp[] {
    const ops: DiffOp[] = [];
    let x = a.length;
    let y = b.length;

    for (let d = trace.length - 1; d >= 0; d--) {
        const v = trace[d];
        const k = x - y;

        let prevK: number;
        if (k === -d || (k !== d && (v.get(k - 1) ?? 0) < (v.get(k + 1) ?? 0))) {
            prevK = k + 1;
        } else {
            prevK = k - 1;
        }
        const prevX = v.get(prevK) ?? 0;
        const prevY = prevX - prevK;

        // The diagonal run (equal lines) between the previous snapshot's endpoint and
        // this one, walked backwards.
        while (x > prevX && y > prevY) {
            ops.push({ type: 'equal', value: a[x - 1] });
            x--;
            y--;
        }

        if (d > 0) {
            if (x === prevX) {
                ops.push({ type: 'add', value: b[y - 1] });
                y--;
            } else {
                ops.push({ type: 'remove', value: a[x - 1] });
                x--;
            }
        }
    }

    return ops.reverse();
}
