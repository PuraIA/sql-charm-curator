import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Languages, Newspaper } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ScrollToTop } from '@/components/ScrollToTop';
import { BLOG_POSTS, readingMinutes } from '@/content/blog';

/** /blog — every article, newest first. */
const BlogIndex = () => {
    const { t, i18n } = useTranslation();
    const isEnglish = (i18n.language ?? 'en').startsWith('en');

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <div className="fixed inset-0 pointer-events-none" style={{ background: 'var(--gradient-glow)' }} />
            <Header />

            <main id="main-content" className="relative z-10 container mx-auto px-4 py-8 max-w-3xl flex-grow">
                <header className="mb-10">
                    <div className="flex items-center gap-3 mb-4">
                        <Newspaper className="w-9 h-9 text-primary" />
                        <h1 className="text-4xl md:text-5xl font-bold text-gradient">{t('blogIndexTitle')}</h1>
                    </div>
                    <p className="text-lg text-muted-foreground">{t('blogIndexSubtitle')}</p>
                    {!isEnglish && (
                        <p className="flex items-center gap-2 text-sm text-muted-foreground mt-4">
                            <Languages className="w-4 h-4 text-primary shrink-0" />
                            {t('blogEnglishOnlyNote')}
                        </p>
                    )}
                </header>

                <div className="space-y-6">
                    {BLOG_POSTS.map(post => (
                        <article key={post.slug} className="glass-card p-6 rounded-xl border border-border/50">
                            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mb-3">
                                <time dateTime={post.published}>
                                    {new Date(`${post.published}T00:00:00Z`).toLocaleDateString(i18n.language, {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                        timeZone: 'UTC',
                                    })}
                                </time>
                                <span aria-hidden="true">·</span>
                                <span>{t('blogMinRead', { count: readingMinutes(post) })}</span>
                                <span aria-hidden="true">·</span>
                                <span>{post.tags.join(', ')}</span>
                            </div>
                            <h2 className="text-2xl font-bold mb-2">
                                <Link to={`/blog/${post.slug}`} className="hover:text-primary transition-colors">
                                    {post.title}
                                </Link>
                            </h2>
                            <p className="text-muted-foreground mb-4">{post.description}</p>
                            <Link
                                to={`/blog/${post.slug}`}
                                className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                            >
                                {t('blogReadArticle')}
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </article>
                    ))}
                </div>
            </main>

            <Footer />
            <ScrollToTop />
        </div>
    );
};

export default BlogIndex;
