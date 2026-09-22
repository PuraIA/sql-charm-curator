/**
 * One config object, rendered in all three formats. Used to seed the converter tool's
 * "Load Example" button and the guide pages' before/after panels, so a reader can
 * compare the exact same data across JSON, XML and YAML side by side.
 *
 * The XML and YAML strings are derived from the JSON one through the site's own
 * conversion functions, not hand-typed — format-convert.test.ts and the guide content
 * tests re-derive them and assert equality, so they can never drift from what the tool
 * actually produces.
 */
import { jsonToXml } from '@/utils/xml-json-convert';
import { jsonToYaml } from '@/utils/yaml-convert';

export const SAMPLE_CONFIG = {
    name: 'checkout-service',
    port: 8080,
    retries: 3,
    features: { fastCheckout: true, giftCards: false },
    allowedOrigins: ['https://shop.example.com', 'https://admin.example.com'],
};

export const SAMPLE_CONFIG_JSON = JSON.stringify(SAMPLE_CONFIG, null, 2);
export const SAMPLE_CONFIG_XML = jsonToXml({ config: SAMPLE_CONFIG });
export const SAMPLE_CONFIG_YAML = jsonToYaml(SAMPLE_CONFIG);
