import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Newspaper } from 'lucide-react';
import { postsAboutPath } from '@/content/blog';

/**
 * Links a tool page to the articles that cover it, from each post's `relatedTools`.
 * Renders nothing when no article is about the current page.
 */
export function RelatedArticles() {
    const { pathname } = useLocation();
    const { t } = useTranslation();
    const posts = postsAboutPath(pathname.replace(/\/+$/, '') || '/');
    if (posts.length === 0) return null;

    return (
        <section className="not-prose rounded-xl border border-border/50 bg-secondary/10 p-6">
            <h2 className="flex items-center gap-2 text-xl font-bold mb-4">
                <Newspaper className="w-5 h-5 text-primary" />
                {t('guideFromBlogTitle')}
            </h2>
            <ul className="space-y-3">
                {posts.map(post => (
                    <li key={post.slug}>
                        <Link to={`/blog/${post.slug}`} className="font-medium text-primary hover:underline">
                            {post.title}
                        </Link>
                        <p className="text-sm text-muted-foreground mt-1">{post.description}</p>
                    </li>
                ))}
            </ul>
        </section>
    );
}
