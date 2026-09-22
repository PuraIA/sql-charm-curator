/**
 * AdSense identifiers, kept out of the component file so the module exports only
 * values (and the component file exports only a component).
 */
export const AD_CLIENT = 'ca-pub-4026555335042993';

/**
 * Named placements mapped to AdSense ad unit ids.
 *
 * Every placement currently points at the same unit, which is what the code already
 * did — the previous `slotId` prop was passed at the call sites but never read by the
 * component. Create one ad unit per placement in the AdSense dashboard and paste the
 * ids here to get per-placement reporting.
 */
export const AD_SLOTS = {
    'content-top': '5322374741',
    'content-middle': '5322374741',
    'content-bottom': '5322374741',
} as const;

export type AdPlacement = keyof typeof AD_SLOTS;
