import { ReactNode } from 'react';
import { Database } from 'lucide-react';
import { AdPlaceholder } from './AdPlaceholder';
import { ScrollToTop } from './ScrollToTop';
import { Header } from './Header';
import { Footer } from './Footer';

interface ToolLayoutProps {
    children: ReactNode;
    title: string;
    subtitle: string;
    toolContent: ReactNode; // The text content (FAQ, Guide, Info)
}

export const ToolLayout = ({ children, title, subtitle, toolContent }: ToolLayoutProps) => {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Background gradient effect */}
            <div className="fixed inset-0 pointer-events-none" style={{ background: 'var(--gradient-glow)' }} />

            <Header />

            <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl flex-grow">
                {/* Tool Header Area */}
                <header className="text-center mb-10 animate-fade-in will-change-opacity">
                    <div className="inline-flex items-center gap-3 mb-4">
                        <Database className="w-10 h-10 text-primary" />
                        <h1 className="text-4xl md:text-5xl font-bold text-gradient">
                            {title}
                        </h1>
                    </div>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
                        {subtitle}
                    </p>
                </header>

                <main id="main-content" className="flex flex-col gap-12">
                    {/* Tool Area */}
                    <section className="tool-section">
                        {children}
                    </section>

                    {/* Ad between Tool and Content */}
                    <div className="my-8">
                        <AdPlaceholder slotId="tool-bottom" />
                    </div>

                    {/* Content Area (Guide, FAQ, Context) */}
                    <article className="prose prose-slate dark:prose-invert max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground">
                        {toolContent}
                    </article>
                </main>
            </div>

            <Footer />
            <ScrollToTop />
        </div>
    );
};
