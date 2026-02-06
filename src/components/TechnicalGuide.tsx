
import { useTranslation } from 'react-i18next';

export function TechnicalGuide() {
    const { t } = useTranslation();

    return (
        <section className="mb-16 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <article className="prose prose-slate dark:prose-invert max-w-none">
                <h2 className="text-3xl font-bold mb-6">Comprehensive Guide to SQL Formatting and Standardization</h2>

                <h3>The Importance of SQL Code Formatting</h3>
                <p>
                    Structured Query Language (SQL) is the standard language for managing data held in relational database management systems. While SQL syntax is relatively English-like, complex queries can quickly become unreadable strings of text. Formatting SQL code—applying consistent indentation, capitalization, and spacing—is not just an aesthetic preference; it is a critical practice for maintaining database code quality.
                </p>
                <p>
                    When SQL queries are properly formatted, the underlying logic becomes immediately apparent. Nested subqueries, join conditions, and complex filtering logic can be understood at a glance. This improves code review efficiency, reduces the likelihood of logic errors during maintenance, and facilitates faster debugging. For teams, adopting a unified SQL style guide (enforced by tools like this one) ensures that code written by different developers looks consistent, reducing cognitive load when switching between tasks.
                </p>

                <h3>SQL Dialects: Understanding the Nuances</h3>
                <p>
                    Although SQL is an ANSI standard, every major database management system (DBMS) implements its own "dialect" with specific extensions and proprietary features. This tool supports the major dialects:
                </p>
                <ul>
                    <li><strong>PostgreSQL:</strong> Known for strict standards compliance and powerful JSON handling. Our formatter respects PostgreSQL-specific operators and type casing.</li>
                    <li><strong>MySQL/MariaDB:</strong> Uses backticks for identifiers and has specific function syntaxes. The formatter handles these correctly to prevent syntax errors.</li>
                    <li><strong>T-SQL (SQL Server):</strong> Uses brackets for identifiers and has unique top-clause syntax. Formatting T-SQL requires handling valid batch separators properly.</li>
                    <li><strong>PL/SQL (Oracle):</strong> A procedural extension to SQL. Formatting PL/SQL blocks involves handling BEGIN/END blocks, standard SQL, and Oracle-specific hints.</li>
                    <li><strong>BigQuery Standard SQL:</strong> Cloud-native SQL that supports struct and array data types, often requiring nested formatting support.</li>
                </ul>

                <h3>Best Practices for Writing Maintainable SQL</h3>
                <p>
                    Beyond automated formatting, adhering to best practices ensures your SQL is performant and readable:
                </p>
                <h4>1. Consistent Capitalization</h4>
                <p>
                    A common convention is to uppercase SQL keywords (SELECT, FROM, WHERE) and lowercase identifiers (table_name, column_name). This visual distinction helps the reader separate the language structure from the data model.
                </p>
                <h4>2. Indentation and Spacing</h4>
                <p>
                    Indentation is crucial for exposing the structure of the query. We recommend aligning keywords or indenting clauses (like WHERE or AND) to show hierarchy. For example, join conditions should be indented under the JOIN clause.
                </p>
                <h4>3. Use of Aliases</h4>
                <p>
                    Always use meaningful table aliases, especially in multi-table joins. Short aliases (like u for users) are common, but descriptive aliases (e.g., cust for customers) can be clearer in large queries. Always prefix column names with their alias to avoid ambiguity errors.
                </p>
                <h4>4. CTEs vs Subqueries</h4>
                <p>
                    Common Table Expressions (CTEs), defined using the WITH clause, are generally preferred over deep nested subqueries. CTEs allow you to break down complex logic into named, linear steps, making the final SELECT statement much cleaner. This tool formats CTEs by separating them with newlines to emphasize the logical flow.
                </p>

                <h3>How This Tool Works Technically</h3>
                <p>
                    Under the hood, this SQL formatter uses a sophisticated parsing engine. It doesn't just use Regular Expressions, which are insufficient for nested SQL structures. Instead, it tokenizes the input string into a stream of meaningful units (keywords, identifiers, literals, operators).
                </p>
                <p>
                    These tokens are then processed to build a simplified Abstract Syntax Tree (AST) or token stream that understands the context (e.g., "are we inside a parenthesis?"). The regeneration phase then outputs the formatted code by applying rules matching your configuration options (indent size, casing preferences, dialect specifics). This ensures that even invalid or incomplete SQL is often formatted gracefully, although the primary goal is to beautify valid SQL.
                </p>
                <p>
                    All processing happens client-side in your browser using JavaScript/TypeScript. We utilize the `sql-formatter` library and custom logic to ensure low latency and high privacy—your code never leaves your computer.
                </p>

                <h3>Frequently Asked Questions (Technical)</h3>
                <p><strong>Q: Does formatting affect query performance?</strong><br />
                    A: No. The database engine's query optimizer separates parsing from execution. The query plan generated is identical regardless of whitespace or capitalization. Formatting is purely for humans.</p>

                <p><strong>Q: Can I format PL/pgSQL functions?</strong><br />
                    A: Yes, the tool treats the function body as a string. However, for deep procedural logic, specialized IDEs might offer more context-aware formatting.</p>
            </article>
        </section>
    );
}
