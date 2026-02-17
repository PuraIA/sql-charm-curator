import { useEffect } from 'react';

interface SEOProps {
    title: string;
    description: string;
    keywords?: string;
    ogTitle?: string;
    ogDescription?: string;
    twitterTitle?: string;
    twitterDescription?: string;
}

export const SEO = ({
    title,
    description,
    keywords,
    ogTitle,
    ogDescription,
    twitterTitle,
    twitterDescription
}: SEOProps) => {
    useEffect(() => {
        // Update document title
        document.title = title;

        const updateMeta = (name: string, content: string, attr: 'name' | 'property' = 'name') => {
            if (!content) return;
            let element = document.querySelector(`meta[${attr}="${name}"]`);
            if (!element) {
                element = document.createElement('meta');
                element.setAttribute(attr, name);
                document.head.appendChild(element);
            }
            element.setAttribute('content', content);
        };

        // Standard Meta Tags
        updateMeta('description', description);
        if (keywords) updateMeta('keywords', keywords);

        // Open Graph / Facebook
        updateMeta('og:title', ogTitle || title, 'property');
        updateMeta('og:description', ogDescription || description, 'property');

        // Twitter
        updateMeta('twitter:title', twitterTitle || title);
        updateMeta('twitter:description', twitterDescription || description);
    }, [title, description, keywords, ogTitle, ogDescription, twitterTitle, twitterDescription]);

    return null;
};
