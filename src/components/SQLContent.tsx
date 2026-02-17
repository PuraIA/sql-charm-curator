import { useTranslation } from 'react-i18next';
import { Database, Shield, Zap, Search, Info } from 'lucide-react';

export function SQLContent() {
    const { t } = useTranslation();

    return (
        <div className="space-y-12">
            <section>
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
                    <Database className="w-8 h-8 text-primary" />
                    Comprehensive Guide to SQL Formatting and Standardization
                </h2>
                <p>
                    Structured Query Language (SQL) is the backbone of modern data management. While SQL syntax is relatively English-like, the complexity of real-world database queries can quickly lead to what many developers call "wall of text" syndrome. Formatting SQL code—applying consistent indentation, keyword capitalization, and logical spacing—is not just an aesthetic preference; it is a critical engineering practice for maintaining code quality, ensuring security, and facilitating team collaboration.
                </p>
                <p>
                    When SQL queries are properly formatted, the underlying logic becomes immediately apparent. Nested subqueries, join conditions, and complex filtering logic can be understood at a glance. This improves code review efficiency, reduces the likelihood of logic errors during maintenance, and facilitates faster debugging of production issues. For engineering teams, adopting a unified SQL style guide ensures that code written by dozens of different developers looks consistent, drastically reducing cognitive load when switching between tasks.
                </p>

                <h3>SQL Dialects: Navigating the Fragmentation</h3>
                <p>
                    Although SQL is technically an ANSI standard, every major database management system (DBMS) implements its own "dialect" with specific extensions, proprietary features, and unique performance characteristics. Our formatter is built to respect these nuances, offering specialized support for the world's most popular database systems:
                </p>
                <ul>
                    <li><strong>PostgreSQL:</strong> Known for its strict standards compliance and powerful object-relational features. Our formatter respects PostgreSQL-specific operators like <code className="bg-secondary px-1 rounded">::</code> for type casting and handling of sophisticated JSONB functions.</li>
                    <li><strong>MySQL / MariaDB:</strong> The most popular open-source databases. We handle MySQL's unique backtick <code className="bg-secondary px-1 rounded">`</code> identifier quoting and specific function syntaxes that differ from standard SQL.</li>
                    <li><strong>T-SQL (Microsoft SQL Server):</strong> Requires specialized handling for bracketed identifiers <code className="bg-secondary px-1 rounded">[column]</code> and unique procedural extensions like cross-apply and outer-apply.</li>
                    <li><strong>PL/SQL (Oracle):</strong> A robust procedural extension. Formatting Oracle SQL requires handling semicolon-heavy blocks and specific keyword interactions used in enterprise-scale systems.</li>
                    <li><strong>BigQuery Standard SQL:</strong> Cloud-native SQL from Google that introduces arrays, structs, and specific backtick-quoted project/dataset scoping.</li>
                </ul>

                <h3>Best Practices for Writing Maintainable SQL</h3>
                <p>
                    Beyond simply running a formatter, professional developers follow specific patterns to ensure their SQL scripts remain maintainable over years of growth:
                </p>
                <h4>1. Semantic Keyword Capitalization</h4>
                <p>
                    A widely accepted convention is to uppercase all SQL keywords (<code className="text-primary font-bold">SELECT, FROM, JOIN, WHERE, GROUP BY, ORDER BY</code>) while keeping table and column names in lowercase. Helpfully, this creates a visual contrast that allows the eye to skip to the data structures quickly while understanding the query intent through the bolded keywords.
                </p>
                <h4>2. Radical Indentation for Clarity</h4>
                <p>
                    Indentation should be used to expose the hierarchy of the query. For example, every <code className="bg-secondary px-1 rounded">JOIN</code> should be indented under the <code className="bg-secondary px-1 rounded">FROM</code> clause, and every filter condition under the <code className="bg-secondary px-1 rounded">WHERE</code> clause. Our tool automates this, allowing you to choose between 2-space, 4-space, or tabbed indentation styles.
                </p>
                <h4>3. The Power of Common Table Expressions (CTEs)</h4>
                <p>
                    Modern SQL developers prefer using the <code className="bg-secondary px-1 rounded">WITH</code> clause (CTEs) over deeply nested subqueries. CTEs allow you to break down complex logic into small, named, logical units that can be tested and read in a linear fashion. Instead of reading a query "inside out," you read it from top to bottom. Our formatter provides extra newline spacing between CTEs to emphasize this logical flow.
                </p>

                <div className="bg-primary/5 p-6 rounded-xl border border-primary/20 my-8">
                    <h4 className="text-xl font-bold mb-3 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-primary" />
                        Security and Privacy First
                    </h4>
                    <p className="text-sm m-0">
                        We understand that SQL queries often contain sensitive database schemas or logic. That's why <code className="font-bold">Pretty Format</code> processes everything locally. Your SQL strings never leave your browser, providing 100% privacy and making it safe to use even with queries containing production data identifiers or internal business logic.
                    </p>
                </div>

                <h3>How This Tool Works Under the Hood</h3>
                <p>
                    Our SQL formatter utilizes a sophisticated tokenizer and a context-aware parsing engine. Unlike primitive formatters that rely on simple Regular Expressions—which frequently break on nested parentheses or complex string literals—our engine builds a temporary token stream. This stream understands whether a comma is a top-level column separator or part of a function argument list, allowing for intelligent line breaks and indentation.
                </p>
                <p>
                    The formatting process is configurable. You can adjust the expression width (the number of characters before a line wrap is triggered) and the dense operator setting, which controls whitespace around arithmetic and logical operators. This local processing ensures lightning-fast performance without the latency of server-side round trips.
                </p>

                <h3>SQL Formatting FAQ</h3>
                <div className="grid gap-4 mt-6">
                    <details className="group border border-border rounded-lg p-4 bg-secondary/5">
                        <summary className="font-semibold cursor-pointer list-none flex justify-between items-center">
                            Does formatting impact performance?
                            <span className="transition-transform group-open:rotate-180">▼</span>
                        </summary>
                        <p className="mt-3 text-sm text-muted-foreground">
                            Absolutely not. Database engines have their own internal parsers that strip out all whitespace and normalization before executing the query. Formatting is purely for the benefit of developers during writing, debugging, and code reviews.
                        </p>
                    </details>
                    <details className="group border border-border rounded-lg p-4 bg-secondary/5">
                        <summary className="font-semibold cursor-pointer list-none flex justify-between items-center">
                            Can I use this for non-SELECT queries?
                            <span className="transition-transform group-open:rotate-180">▼</span>
                        </summary>
                        <p className="mt-3 text-sm text-muted-foreground">
                            Yes! Our formatter supports <code className="bg-secondary px-1 rounded">INSERT</code>, <code className="bg-secondary px-1 rounded">UPDATE</code>, <code className="bg-secondary px-1 rounded">DELETE</code>, and even DDL statements like <code className="bg-secondary px-1 rounded">CREATE TABLE</code> or <code className="bg-secondary px-1 rounded">ALTER TABLE</code>.
                        </p>
                    </details>
                </div>
            </section>
        </div>
    );
}
