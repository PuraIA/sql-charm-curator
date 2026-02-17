import { useTranslation } from 'react-i18next';
import { Braces, Shield, Zap, Search } from 'lucide-react';

export function JSONContent() {
    const { t } = useTranslation();

    return (
        <div className="space-y-12">
            <section>
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
                    <Braces className="w-8 h-8 text-primary" />
                    Comprehensive Guide to JSON Formatting and Optimization
                </h2>
                <p>
                    JSON, or JavaScript Object Notation, has become the de facto standard for data exchange on the modern web. Its simplicity and readability have made it the preferred choice for APIs, configuration files, and even database storage. However, as JSON structures grow in complexity, they can quickly become difficult to manage and debug without proper formatting.
                </p>
                <p>
                    A well-formatted JSON document is not just about aesthetics; it's about structural clarity. By applying consistent indentation and grouping, developers can easily identify nesting levels, verify data types, and spot syntax errors like missing commas or mismatched brackets. Our JSON Formatter is designed to help you maintain this clarity, whether you're working with a small config file or a massive API response.
                </p>

                <h3>The Anatomy of a JSON Object</h3>
                <p>
                    JSON is built on two structures: a collection of name/value pairs (an object) and an ordered list of values (an array). Understanding these primitives is crucial for effective data modeling. Objects are enclosed in curly braces <code className="bg-secondary px-1 rounded">{ }</code>, while arrays use square brackets <code className="bg-secondary px-1 rounded">[]</code>.
                </p>
                <p>
                    Values in JSON can be strings (in double quotes), numbers, booleans (true/false), null, or even other objects and arrays. This recursive nature allows for deeply nested data structures that can represent complex real-world entities. For instance, a user object might contain an array of order objects, each containing its own metadata and item lists.
                </p>

                <h3>Why Use a JSON Formatter and Validator?</h3>
                <p>
                    While many IDEs provide built-in formatting, a dedicated web-based tool offers unique advantages, especially for quick tasks or when working in restricted environments. Here are the key benefits:
                </p>
                <ul>
                    <li><strong>Error Identification:</strong> Our tool validates your JSON in real-time. If you have an unescaped character or a trailing comma, the validator will immediately flag the error, saving you minutes of manual debugging.</li>
                    <li><strong>Minification and Compression:</strong> For production environments, reducing the size of JSON payloads is vital for performance. Our formatter allows you to minify JSON by removing all unnecessary whitespace, significantly reducing bandwidth usage and improving load times for your users.</li>
                    <li><strong>Schema Visualization:</strong> Seeing your JSON in a tree view or a table view (like we offer here) helps you understand the schema and data distribution at a glance, which is much more efficient than scrolling through raw text.</li>
                    <li><strong>Data Security:</strong> Unlike some online tools that send your data to a server for processing, our formatter runs entirely in your browser. Your sensitive API data or configuration secrets never leave your machine.</li>
                </ul>

                <h3>Advanced JSON Techniques: Sorting and Escaping</h3>
                <p>
                    Intermediate and advanced users often need more than just simple formatting. One common requirement is alphabetizing object keys. In large JSON files, having keys sorted alphabetically (A-Z) makes it much faster to locate specific attributes. Our tool includes a "Sort Keys" toggle that recursively sorts every object in your JSON structure.
                </p>
                <p>
                    Another critical area is Unicode escaping. When transferring data across different systems, special characters can sometimes cause encoding issues. By escaping non-ASCII characters to their Unicode representative (e.g., converting "á" to "\u00e1"), you ensure that your data remains consistent across all platforms and programming languages.
                </p>

                <h3>Best Practices for JSON Data Modeling</h3>
                <p>
                    To get the most out of your JSON documents, consider these industry best practices:
                </p>
                <ol>
                    <li><strong>Use Meaningful Key Names:</strong> Avoid cryptic abbreviations. Use descriptive names like <code className="text-primary italic">"total_price_incl_tax"</code> instead of <code className="text-primary italic">"tp_tax"</code>.</li>
                    <li><strong>Keep It Flat Where Possible:</strong> While nesting is supported, deeply nested structures (more than 4-5 levels) can be harder to parse and manage. Try to flatten your data model if it simplifies the logic.</li>
                    <li><strong>Consistency is Key:</strong> Choose a naming convention (camelCase or snake_case) and stick to it across your entire system. This reduces cognitive load for other developers consuming your API.</li>
                    <li><strong>Leverage Arrays for Lists:</strong> Use arrays for any collection of similar items. This makes it easier to iterate over the data and apply filters or transformations.</li>
                </ol>

                <div className="bg-primary/5 p-6 rounded-xl border border-primary/20 my-8">
                    <h4 className="text-xl font-bold mb-3 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-primary" />
                        A Note on Privacy
                    </h4>
                    <p className="text-sm m-0">
                        At Pretty Format, we prioritize your data security. This tool uses the native JavaScript <code className="bg-secondary px-1 rounded">JSON.parse()</code> and <code className="bg-secondary px-1 rounded">JSON.stringify()</code> methods locally. We do not use any external APIs to process your data, ensuring that your queries are private and secure.
                    </p>
                </div>

                <h3>JSON vs XML: When to Choose Which?</h3>
                <p>
                    While XML was the standard for years, JSON has largely taken over for web APIs due to its lower overhead and native compatibility with JavaScript. JSON's syntax is less verbose, which translates to smaller file sizes. However, XML still has its place, particularly in enterprise systems that require strict schema validation (XSD) and complex document structures. For most modern web and mobile applications, JSON is the clear winner for its speed and developer ergonomics.
                </p>

                <h3>Frequently Asked Questions About JSON</h3>
                <div className="grid md:grid-cols-2 gap-6 mt-6">
                    <div className="bg-secondary/20 p-4 rounded-lg">
                        <strong>Q: Can JSON contain comments?</strong>
                        <p className="text-sm mt-2">A: Standard JSON (RFC 8259) does not support comments. Some variations like JSONC (JSON with Comments) do, but for standard compatibility, you should avoid them in your data exchange files.</p>
                    </div>
                    <div className="bg-secondary/20 p-4 rounded-lg">
                        <strong>Q: Is there a maximum size for JSON files?</strong>
                        <p className="text-sm mt-2">A: While the specification doesn't set a hard limit, practical limits are determined by the memory available to the parsing environment (like the browser or its runtime). For files larger than 100MB, streaming parsers are often recommended over standard JSON.parse().</p>
                    </div>
                </div>
            </section>
        </div>
    );
}
