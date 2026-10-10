import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight, CalendarDays, Clock, Languages, PenLine } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ScrollToTop } from '@/components/ScrollToTop';
import { BlogArticleBody } from '@/components/BlogArticleBody';
import { BLOG_POSTS, getBlogPost, readingMinutes } from '@/content/blog';
import NotFound from './NotFound';

function formatDate(iso: string, language: string) {
    return new Date(`${iso}T00:00:00Z`).toLocaleDateString(language, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC',
    });
}

/** /blog/<slug>. Articles are English-only; the note below says so to other languages. */
const BlogPostPage = () => {
    const { slug } = useParams();
    const { t, i18n } = useTranslation();
    const post = slug ? getBlogPost(slug) : undefined;
    if (!post) return <NotFound />;

    const others = BLOG_POSTS.filter(other => other.slug !== post.slug);
    const isEnglish = (i18n.language ?? 'en').startsWith('en');

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <div className="fixed inset-0 pointer-events-none" style={{ background: 'var(--gradient-glow)' }} />
            <Header />

            <main id="main-content" className="relative z-10 container mx-auto px-4 py-8 max-w-3xl flex-grow">
                <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8">
                    <ArrowLeft className="w-4 h-4" />
                    {t('blogBackToIndex')}
                </Link>

                <article className="prose prose-slate dark:prose-invert max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-foreground">
                    <header className="not-prose mb-8">
                        <div className="flex flex-wrap gap-2 mb-4">
                            {post.tags.map(tag => (
                                <span key={tag} className="text-xs font-medium px-2 py-1 rounded-md bg-primary/10 text-primary">
                                    {tag}
                                </span>
                            ))}
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">{post.title}</h1>
                        <p className="text-lg text-muted-foreground">{post.description}</p>
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground border-y border-border/50 py-3 mt-6">
                            <span className="flex items-center gap-2">
                                <PenLine className="w-4 h-4 text-primary" />
                                {t('guideWrittenBy', { author: 'Pura IA' })}
                            </span>
                            <span className="flex items-center gap-2">
                                <CalendarDays className="w-4 h-4 text-primary" />
                                <time dateTime={post.published}>{formatDate(post.published, i18n.language)}</time>
                            </span>
                            <span className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-primary" />
                                {t('blogMinRead', { count: readingMinutes(post) })}
                            </span>
                        </div>
                        {!isEnglish && (
                            <p className="flex items-center gap-2 text-sm text-muted-foreground mt-4">
                                <Languages className="w-4 h-4 text-primary shrink-0" />
                                {t('blogEnglishOnlyNote')}
                            </p>
                        )}
                    </header>

                    <BlogArticleBody blocks={post.blocks} />
                </article>

                <section className="mt-12 pt-8 border-t border-border/50">
                    <h2 className="text-xl font-bold mb-4">{t('blogRelatedTools')}</h2>
                    <div className="flex flex-wrap gap-3">
                        {post.relatedTools.map(tool => (
                            <Link
                                key={tool.path}
                                to={tool.path}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border/50 bg-secondary/20 hover:border-primary/30 hover:bg-secondary/40 text-sm font-medium transition-colors"
                            >
                                {tool.label}
                                <ArrowRight className="w-4 h-4 text-primary" />
                            </Link>
                        ))}
                    </div>
                </section>

                {others.length > 0 && (
                    <section className="mt-12">
                        <h2 className="text-xl font-bold mb-4">{t('blogMoreArticles')}</h2>
                        <ul className="space-y-3">
                            {others.map(other => (
                                <li key={other.slug}>
                                    <Link to={`/blog/${other.slug}`} className="text-primary hover:underline font-medium">
                                        {other.title}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}
            </main>

            <Footer />
            <ScrollToTop />
        </div>
    );
};

export default BlogPostPage;
