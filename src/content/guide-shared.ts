/** Shared building blocks for the /sql/:dialect, /json/:guide and /xml/:guide content modules. */

export interface GuideSection {
    heading: string;
    body: string[];
    code?: string;
}

export interface FaqEntry {
    q: string;
    a: string;
}
