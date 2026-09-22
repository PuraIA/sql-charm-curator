import type { DialectSlug, DialectGuideTranslation } from '../sql-dialects';

/** German translations for /sql/<dialect>. See sql-dialects.pt.ts for the pattern. */
export const DIALECT_TRANSLATIONS_DE: Partial<Record<DialectSlug, DialectGuideTranslation>> = {
    postgresql: {
        h1: 'PostgreSQL-Formatierer',
        tagline: 'Casts, JSONB-Operatoren und LATERAL-Joins, formatiert ohne sie auseinanderzureißen.',
        intro: [
            'Beim Formatieren von PostgreSQL geht es selten um die SELECT-Liste. Die Schwierigkeit ist, dass Postgres eine Reihe von Operatoren angesammelt hat, die wie gewöhnliche Satzzeichen aussehen: :: für Casts, -> und ->> für JSON-Zugriff, @> für Enthaltensein, ?| für das Vorhandensein von Schlüsseln. Ein Formatierer, der naiv tokenisiert, teilt diese entweder mittendurch oder verwechselt den führenden Doppelpunkt mit einem benannten Parameter und bricht die Zeile an der falschen Stelle um.',
            'Diese Seite führt den Formatierer mit ausgewählter PostgreSQL-Grammatik aus, wobei die Parametersyntax auf benannt (:name) plus nummeriert ($1) eingestellt ist — genau das, was das Postgres-Wire-Protokoll und die meisten Treiber verwenden. Das Beispiel unten ist oben in den Editor geladen, sodass Sie die Optionen ändern und dieselbe Abfrage neu formatiert sehen können.',
        ],
        quirks: [
            {
                heading: 'Der Cast-Operator :: gegenüber :benannten Parametern',
                body: [
                    'PostgreSQL verwendet :: für Casts und : zur Einleitung eines benannten Parameters, wodurch dasselbe Zeichen zwei Bedeutungen erhält. Ein Formatierer, der für einen Dialekt konfiguriert ist, in dem : nur ein Parametermarker ist, liest den ersten Doppelpunkt von o.total::numeric als Beginn eines Platzhalters und bricht den Ausdruck falsch um.',
                    'Die Wahl der PostgreSQL-Grammatik teilt dem Parser mit, dass :: als einzelner Cast-Operator bindet, während :name und $1 Platzhalter bleiben. Casts bleiben an ihrem Ausdruck haften, wie in der Zeile (c.profile -> \'prefs\' ->> \'locale\')::TEXT oben.',
                ],
            },
            {
                heading: 'JSONB-Operatoren, einschließlich der ?-Familie',
                body: [
                    'Postgres bietet JSON-Zugriff über Operatoren statt Funktionen: -> liefert jsonb, ->> liefert Text, #> und #>> nehmen ein Pfad-Array, und @> prüft auf Enthaltensein. Sie werden als Operatoren behandelt und bleiben daher mit ihren Operanden in derselben Zeile, soweit die Ausdrucksbreite es zulässt.',
                    'Die Existenz-Operatoren verdienen besondere Erwähnung. ? prüft auf einen Schlüssel oberster Ebene, ?| auf irgendeinen Schlüssel in einem Array und ?& auf alle davon — und ? ist zugleich der positionelle Platzhalter, den JDBC und mehrere andere Treiber verwenden. Bei ausgewählter PostgreSQL-Grammatik werden diese als Operatoren interpretiert:',
                ],
            },
            {
                heading: 'Dollar-quotierte Funktionsrümpfe bleiben unangetastet',
                body: [
                    'Ein zwischen $$ oder $tag$ geschriebener PL/pgSQL-Rumpf ist für den SQL-Parser ein einziges langes String-Literal. Der Formatierer bewahrt ihn exakt, statt ihn neu einzurücken — das ist das sichere Verhalten, denn eine Umformatierung des Stringinhalts würde den im Katalog gespeicherten Wert verändern.',
                    'In der Praxis bedeutet das: CREATE FUNCTION-Anweisungen kommen mit formatiertem umgebenden SQL heraus, während der Rumpf unangetastet in einer einzigen Zeile bleibt. Wenn Sie den Rumpf selbst formatiert haben möchten, formatieren Sie ihn separat als eigenständigen Block und fügen Sie ihn wieder ein.',
                ],
            },
            {
                heading: 'FILTER, LATERAL und andere verschachtelnde Klauseln',
                body: [
                    'COUNT(*) FILTER (WHERE ...) setzt eine vollständige WHERE-Klausel innerhalb eines Aggregatsaufrufs, und LEFT JOIN LATERAL setzt eine vollständige Subquery innerhalb eines Joins. Beide werden als verschachtelte Blöcke erweitert, was die Struktur der Abfrage lesbar macht — man erkennt auf einen Blick, dass die laterale Subquery ein Top-1-pro-Zeile-Lookup ist.',
                    'ON CONFLICT ... DO UPDATE mit einer RETURNING-Klausel wird ebenso behandelt, einschließlich Verweisen auf die Pseudo-Tabelle excluded.',
                ],
            },
            {
                heading: 'Identifier-Faltung: warum Preserve die richtige Voreinstellung ist',
                body: [
                    'PostgreSQL faltet unquotierte Identifier zu Kleinbuchstaben, sodass MyTable und mytable dasselbe Objekt sind, während "MyTable" in doppelten Anführungszeichen ein anderes Objekt ist. Dadurch ist die Groß-/Kleinschreibung von Identifiern hier bedeutsam, anders als in den meisten Dialekten.',
                    'Die Option für die Identifier-Schreibweise verwendet daher standardmäßig Preserve. Eine Änderung auf Upper oder Lower schreibt auch quotierte Identifier um, was eine Abfrage auf eine nicht existierende Tabelle verweisen lassen kann. Die Schreibweise von Schlüsselwörtern ist eine separate Einstellung, sodass Sie SELECT und FROM weiterhin groß schreiben können, ohne Ihre Schemanamen anzutasten.',
                ],
            },
        ],
        limitations: [
            'DISTINCT ON (col) wird in die Zeile nach SELECT DISTINCT gesetzt statt direkt daneben. Die Ausgabe ist gültiges SQL, liest sich aber schlechter als der Rest.',
            'Innerhalb eines dollar-quotierten Rumpfs nimmt der Formatierer überhaupt keine Änderungen vor, einschließlich des abschließenden language plpgsql-Teils einer CREATE FUNCTION-Anweisung, der in der eingegebenen Schreibweise bleibt.',
        ],
        conventions: [
            {
                heading: 'Schlüsselwörter groß, Identifier unangetastet',
                body: [
                    'Der am weitesten verbreitete Postgres-Stil schreibt reservierte Wörter groß und belässt Tabellen- und Spaltennamen im snake_case, mit dem das Schema erstellt wurde. Das ist hier die Standardkonfiguration: Schlüsselwort-, Datentyp- und Funktionsschreibweise auf Upper, Identifier-Schreibweise auf Preserve.',
                ],
            },
            {
                heading: 'CTEs bevorzugen, und wissen, dass sie keine Optimierungsbarrieren mehr sind',
                body: [
                    'Eine Abfrage in WITH-Blöcke zu zerlegen liest sich weit besser als drei Ebenen tief verschachtelte Subqueries, und seit PostgreSQL 12 wird eine einfache CTE vom Planer inline eingesetzt statt materialisiert, sodass die Lesbarkeit keinen Planwechsel mehr kostet. Fügen Sie MATERIALIZED explizit hinzu, wenn Sie wirklich das alte Barriere-Verhalten wollen.',
                    'Die Option Zeilen zwischen Abfragen steuert die Leerzeilen, die der Formatierer zwischen Anweisungen setzt — das hält ein Migrationsskript mit mehreren Anweisungen lesbar.',
                ],
            },
        ],
        faq: [
            {
                q: 'Ändert das Formatieren, wie PostgreSQL meine Abfrage ausführt?',
                a: 'Nein. Der Parser verwirft Leerraum und faltet unquotierte Identifier vor der Planung, sodass der Plan einer formatierten Abfrage identisch mit dem derselben Abfrage in einer Zeile ist. Formatierung ist für die Menschen gedacht, die den Code lesen.',
            },
            {
                q: 'Bricht das meine quotierten "CamelCase"-Identifier?',
                a: 'Nicht mit den Standardeinstellungen. Die Identifier-Schreibweise steht auf Preserve, sodass quotierte Identifier exakt so herauskommen, wie Sie sie geschrieben haben. Ändern Sie diese Einstellung nur, wenn Sie sicher sind, dass Ihr Schema durchgehend unquotierte, groß-/kleinschreibungsunabhängige Namen verwendet.',
            },
            {
                q: 'Kann es den Rumpf einer PL/pgSQL-Funktion formatieren?',
                a: 'Der Rumpf zwischen den $$-Begrenzern ist aus Sicht des SQL-Parsers ein String-Literal und wird daher wörtlich bewahrt statt neu eingerückt. Um den Rumpf selbst zu formatieren, fügen Sie nur den Block zwischen den Begrenzern ein.',
            },
            {
                q: 'Werden meine Abfragen irgendwohin gesendet?',
                a: 'Nein. Der Formatierer ist eine JavaScript-Bibliothek, die in Ihrem Browser läuft. Nichts wird hochgeladen, weshalb es sicher ist, eine Abfrage mit echten Tabellen- und Spaltennamen aus der Produktion einzufügen.',
            },
        ],
    },

    mysql: {
        h1: 'MySQL- & MariaDB-Formatierer',
        tagline: 'Identifier in Backticks, Index-Hints und zweiargumentiges LIMIT, exakt bewahrt.',
        intro: [
            'Das wiederkehrende Problem beim Formatieren von MySQL sind Identifier. Die Liste reservierter Wörter wächst mit jeder Version — rank, groups, window und system wurden in 8.0 reserviert — sodass echte Schemata voller Backtick-quotierter Spalten sind, die nur existieren, weil der Name mit einem Schlüsselwort kollidierte. Ein Formatierer, der Backticks als Dekoration behandelt oder Schlüsselwort-Schreibweise auf den Text darin anwendet, erzeugt SQL, das nicht mehr läuft.',
            'Die Wahl der MySQL-Grammatik hält die Backtick-Quotierung intakt und interpretiert die für diesen Dialekt spezifischen Klauseln: Index-Hints zwischen Tabelle und Join, das zweiargumentige LIMIT und die klauselartigen Argumente von GROUP_CONCAT. Die Abfrage unten ist oben in den Editor geladen.',
        ],
        quirks: [
            {
                heading: 'Backtick-Identifier und Groß-/Kleinschreibungsempfindlichkeit',
                body: [
                    'Die im Beispiel mit `order` benannte Spalte ist der häufige Fall: ein völlig vernünftiger Fachbegriff, der zufällig ein reserviertes Wort ist. Backticks sind das Einzige, was diese Abfrage gültig hält, daher werden sie bewahrt und ihre Schreibweise nie geändert.',
                    'Das ist bei MySQL wichtiger als bei den meisten Datenbanken, weil die Groß-/Kleinschreibungsempfindlichkeit von Tabellennamen vom Dateisystem des Hosts abhängt. Unter Linux sind Users und users unterschiedliche Tabellen; unter macOS und Windows meist nicht. Ein Formatierer, der Identifier groß schreibt, funktioniert in der Entwicklung stillschweigend und schlägt in der Produktion fehl — deshalb ist die Identifier-Schreibweise hier standardmäßig auf Preserve gesetzt.',
                ],
            },
            {
                heading: 'LIMIT mit zwei Argumenten',
                body: [
                    'MySQL akzeptiert sowohl LIMIT Anzahl als auch LIMIT Position, Anzahl. Die Zwei-Argument-Form hat kein Äquivalent in Standard-SQL — LIMIT 40, 20 bedeutet: 40 überspringen, 20 zurückgeben, was die umgekehrte Reihenfolge dessen ist, was man von LIMIT ... OFFSET erwartet.',
                    'Der Formatierer hält beide Argumente in einer Zeile, statt sie am Komma zu trennen, weil eine Trennung eine ohnehin verwirrende Klausel noch schlimmer machen würde.',
                ],
            },
            {
                heading: 'Index-Hints stehen zwischen Tabelle und Join',
                body: [
                    'FORCE INDEX, USE INDEX, IGNORE INDEX und STRAIGHT_JOIN hängen an einer Tabellenreferenz, erscheinen also nach dem Alias und vor dem nächsten JOIN. Sie werden als Teil der Tabellenreferenz interpretiert und bleiben in ihrer Zeile, was die Join-Liste lesbar hält.',
                ],
            },
            {
                heading: 'Funktionen, deren Argumente Klauseln enthalten',
                body: [
                    'GROUP_CONCAT ist kein gewöhnlicher Funktionsaufruf: seine Argumentliste kann DISTINCT, ein vollständiges ORDER BY und ein SEPARATOR enthalten. Deshalb wird sie als verschachtelter Block erweitert, wobei das ORDER BY innerhalb des Aufrufs eingerückt ist.',
                ],
            },
            {
                heading: 'ON DUPLICATE KEY UPDATE, alte und neue Form',
                body: [
                    'Die Upsert-Klausel wird in beiden Schreibweisen erkannt — der langjährigen VALUES(col)-Form und dem in MySQL 8.0.20 eingeführten Zeilen-Alias, der sie als veraltet markierte. Die Alias-Form wird sauber interpretiert:',
                ],
            },
            {
                heading: 'Drei Kommentarsyntaxen, eine davon eine Falle',
                body: [
                    'MySQL akzeptiert # bis zum Zeilenende, /* */-Blöcke und -- bis zum Zeilenende. Die letzte hat eine Bedingung, die Leute überrascht: MySQL verlangt ein Leerzeichen nach dem doppelten Bindestrich, sodass --kommentar kein Kommentar ist und meist als Subtraktion gefolgt von einem Identifier gelesen wird.',
                    'Kommentare bleiben an Ort und Stelle erhalten. Wenn ein --Kommentar die Formatierung übersteht, die Abfrage danach aber fehlschlägt, prüfen Sie auf das fehlende Leerzeichen.',
                ],
            },
        ],
        limitations: [
            'In DATE_SUB(NOW(), interval 30 day) bleiben das Schlüsselwort INTERVAL und seine Einheit in der eingegebenen Schreibweise, weil sie als Teil des Funktionsarguments interpretiert werden statt als eigenständige Schlüsselwörter oberster Ebene. Die Abfrage ist in beiden Fällen gültig.',
        ],
        conventions: [
            {
                heading: 'Nur quotieren, was Quotierung braucht',
                body: [
                    'Backticks um jeden Identifier ist eine Gewohnheit, die von GUI-Tools stammt, die sie bedingungslos erzeugen. Das ist nicht falsch, fügt aber Rauschen hinzu — das obige Beispiel quotiert `users` und `order` und lässt die Aliase unquotiert, was der beim Handschreiben üblichere Stil ist.',
                ],
            },
            {
                heading: 'MariaDB verwendet dieselbe Einstellung',
                body: [
                    'MariaDB hat sich nach Version 5.5 von MySQL getrennt entwickelt, aber die für die Formatierung relevante Syntax — Backticks, Index-Hints, LIMIT, die Kommentarstile — wird geteilt. Verwenden Sie den MySQL-Dialekt für MariaDB-Abfragen.',
                ],
            },
        ],
        faq: [
            {
                q: 'Bricht die Großschreibung von Schlüsselwörtern meine groß-/kleinschreibungsempfindlichen Tabellennamen?',
                a: 'Nein. Schlüsselwort-Schreibweise und Identifier-Schreibweise sind unabhängige Einstellungen. Der Standard schreibt SELECT, FROM und JOIN groß, während jeder Tabellen- und Spaltenname exakt so bleibt, wie Sie ihn eingegeben haben.',
            },
            {
                q: 'Funktioniert das für MariaDB?',
                a: 'Ja. Wählen Sie den MySQL-Dialekt. Die für die Formatierung relevante Syntax ist bei beiden gleich.',
            },
            {
                q: 'Warum wird mein --Kommentar nicht als Kommentar behandelt?',
                a: 'MySQL verlangt ein Leerzeichen nach dem doppelten Bindestrich. --hinweis wird als Ausdruck interpretiert; -- hinweis ist ein Kommentar. Das ist eine MySQL-Regel, kein Verhalten des Formatierers.',
            },
            {
                q: 'Wird mein SQL an einen Server gesendet?',
                a: 'Nein. Die Formatierung geschieht in Ihrem Browser, und nichts verlässt Ihren Rechner — deshalb ist es sicher, Abfragen mit echten Schemanamen einzufügen.',
            },
        ],
    },

    't-sql': {
        h1: 'T-SQL-Formatierer für SQL Server',
        tagline: 'Identifier in eckigen Klammern, APPLY-Operatoren, Fensterrahmen und GO-Batches.',
        intro: [
            'T-SQL trägt mehr prozedurale Syntax als jeder andere verbreitete Dialekt, und ein gutes Stück davon ist gar kein richtiges SQL — GO ist eine Client-Direktive, Tabellenvariablen werden mit demselben @ deklariert, das auch einen Parameter kennzeichnet, und Query-Hints reisen am Ende einer Anweisung in Klammern mit. T-SQL gut zu formatieren bedeutet größtenteils, zu erkennen, welche davon Anweisungen und welche Dekoration sind.',
            'Die unten in den Editor geladene Abfrage übt genau die Teile, die am häufigsten schiefgehen: mehrteilige Namen in eckigen Klammern, ein OUTER APPLY, das mit der äußeren Zeile korreliert, und ein Fenster-ROW_NUMBER mit eigenem PARTITION BY und ORDER BY.',
        ],
        quirks: [
            {
                heading: 'Identifier in eckigen Klammern und vierteilige Namen',
                body: [
                    'SQL Server quotiert Identifier mit eckigen Klammern, und ein vollqualifizierter Name kann vier Teile haben: Server.Datenbank.Schema.Objekt. Klammern werden bewahrt, und die Punkte dazwischen werden nicht als Operatoren behandelt, sodass [dbo].[Customers] intakt bleibt.',
                    'Doppelte Anführungszeichen funktionieren ebenfalls als Identifier-Begrenzer, wenn QUOTED_IDENTIFIER auf ON steht, was bei den meisten Treibern der Standard ist. Beide Schreibweisen werden akzeptiert.',
                ],
            },
            {
                heading: 'CROSS APPLY und OUTER APPLY',
                body: [
                    'APPLY ist der laterale Join von T-SQL: die rechte Subquery wird einmal pro Zeile der linken Tabelle ausgewertet und kann deren Spalten referenzieren. CROSS APPLY verwirft äußere Zeilen, die nichts produzieren, OUTER APPLY behält sie mit NULLs — dieselbe Beziehung wie zwischen INNER und LEFT JOIN.',
                    'Die Subquery wird als verschachtelter Block erweitert, was die Korrelation sichtbar macht. Im Beispiel ist o.[CustomerID] = c.[CustomerID] innerhalb des APPLY das, was ihn an die äußere Zeile bindet.',
                ],
            },
            {
                heading: 'Fensterrahmen',
                body: [
                    'Eine OVER-Klausel kann PARTITION BY, ORDER BY und eine Rahmenspezifikation enthalten, was sie zu einer in ein Select-Element verschachtelten Klausel macht. Jeder Teil wird in eine eigene Zeile gesetzt, statt sie zusammenzuführen, weil ein falsch gelesenes PARTITION BY eine der leichtesten Arten ist, eine falsche, aber plausibel wirkende Antwort zu erhalten.',
                    'Rahmenklauseln wie ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW bleiben in derselben Zeile wie ihre Schlüsselwörter.',
                ],
            },
            {
                heading: 'GO ist ein Batch-Trenner, keine Anweisung',
                body: [
                    'GO wird von SSMS, Azure Data Studio und sqlcmd verstanden, nicht von der SQL-Server-Engine — der Client teilt das Skript daran auf und sendet jeden Batch separat. Skripte mit GO werden korrekt behandelt: die Batches werden unabhängig formatiert, und der Trenner bleibt in seiner eigenen Zeile.',
                ],
            },
            {
                heading: 'MERGE',
                body: [
                    'MERGE kombiniert Einfügen, Aktualisieren und Löschen gegen ein Ziel unter Verwendung einer Quelle, mit den Zweigen WHEN MATCHED, WHEN NOT MATCHED BY TARGET und WHEN NOT MATCHED BY SOURCE. Jeder Zweig beginnt in seiner eigenen Zeile, damit die drei Fälle getrennt gelesen werden können:',
                ],
            },
            {
                heading: 'Das Semikolon vor WITH',
                body: [
                    'Skripte beginnen eine CTE oft mit ;WITH statt WITH. Das Semikolon beendet, was vorher stand, weil WITH mehrdeutig ist — es leitet auch Tabellen-Hints ein — und SQL Server verlangt, dass die vorherige Anweisung beendet ist, wenn eine CTE folgt.',
                    'Die Gewohnheit ist harmlos, und der Formatierer akzeptiert sie, aber jede Anweisung mit einem Semikolon zu beenden macht sie unnötig, was die bessere Lösung ist.',
                ],
            },
        ],
        limitations: [
            'TOP (n) WITH TIES wird nicht korrekt interpretiert: WITH wird als Beginn einer Common Table Expression gelesen, und die Klausel wird über mehrere Zeilen als TOP (n) / WITH / ties aufgebrochen. Das Beispiel auf dieser Seite verwendet deshalb TOP (3) ohne WITH TIES. Wenn Sie WITH TIES benötigen, formatieren Sie die Abfrage und korrigieren Sie diese eine Klausel anschließend von Hand.',
            'In einer MERGE-Anweisung bleibt das Schlüsselwort USING in der eingegebenen Schreibweise, statt mit den übrigen Schlüsselwörtern großgeschrieben zu werden.',
        ],
        conventions: [
            {
                heading: 'PascalCase-Schemata, Identifier-Schreibweise auf Preserve',
                body: [
                    'SQL-Server-Schemata verwenden üblicherweise PascalCase — CustomerID, OrderDate — und SQL Server vergleicht Identifier anhand der Datenbank-Collation, die meist nicht zwischen Groß- und Kleinschreibung unterscheidet. Preserve bleibt trotzdem die richtige Voreinstellung: Es hält Ihre Namen lesbar und vermeidet Überraschungen bei der Minderheit von Datenbanken mit einer groß-/kleinschreibungsempfindlichen Collation.',
                ],
            },
            {
                heading: 'Anweisungen abschließen',
                body: [
                    'Microsoft dokumentiert das Weglassen des Anweisungsabschlusszeichens seit mehreren Versionen als veraltet. Jede Anweisung mit einem Semikolon zu beenden macht den Trick mit dem führenden Semikolon überflüssig und erlaubt es dem Formatierer, Leerzeilen zwischen Anweisungen zuverlässig zu setzen.',
                ],
            },
        ],
        faq: [
            {
                q: 'Kann ich ein Skript mit GO-Trennern einfügen?',
                a: 'Ja. Die Batches werden unabhängig formatiert, und jedes GO bleibt in seiner eigenen Zeile. GO ist eine Client-Direktive und kein T-SQL, wird also durchgereicht statt als Anweisung interpretiert.',
            },
            {
                q: 'Warum kommt TOP (3) WITH TIES kaputt heraus?',
                a: 'Der Parser liest WITH als Beginn einer Common Table Expression. Das ist eine bekannte, oben aufgeführte Einschränkung. Alles andere in der Abfrage wird normal formatiert, sodass der übliche Workaround darin besteht, diese eine Klausel anschließend zu korrigieren.',
            },
            {
                q: 'Formatiert es Rümpfe gespeicherter Prozeduren?',
                a: 'Die Anweisungen innerhalb einer Prozedur werden als gewöhnliches T-SQL formatiert. Kontrollflusskonstrukte wie IF und WHILE werden erkannt, aber das Ergebnis ist weniger ausgefeilt als bei einem einfachen SELECT — prozeduraler Code ist die Schwachstelle jedes SQL-Formatierers.',
            },
            {
                q: 'Wird mein T-SQL an einen Server gesendet?',
                a: 'Nein. Alles läuft in Ihrem Browser, sodass Abfragen mit internen Schema- oder Objektnamen Ihren Rechner nie verlassen.',
            },
        ],
    },

    'oracle-plsql': {
        h1: 'Oracle-SQL- & PL/SQL-Formatierer',
        tagline: 'Optimizer-Hints unangetastet gehalten, hierarchische Abfragen und veraltete (+)-Joins.',
        intro: [
            'Oracle ist der Dialekt, bei dem Formatierung das Verhalten tatsächlich ändern kann, wegen einer einzigen Eigenschaft: Optimizer-Hints werden als Kommentare geschrieben. Ein Formatierer, der Kommentare normalisiert oder entfernt, löscht stillschweigend /*+ INDEX(...) */ und ändert den Ausführungsplan einer Abfrage, die weiterhin korrekt aussieht. Hints exakt zu bewahren ist die erste Voraussetzung für alles, was Oracle-SQL berührt.',
            'Über Hints hinaus trägt Oracle Jahrzehnte angesammelter Syntax — die (+)-Outer-Join-Notation, die älter als ANSI-Joins ist, CONNECT BY für Hierarchien, DUAL und den q-Quote-Mechanismus für Strings mit Apostrophen. Die unten in den Editor geladene Abfrage verwendet mehrere davon gleichzeitig.',
        ],
        quirks: [
            {
                heading: 'Optimizer-Hints sind Kommentare, die eine Rolle spielen',
                body: [
                    'Ein Hint wird als /*+ ... */ geschrieben und muss unmittelbar nach dem Schlüsselwort SELECT, INSERT, UPDATE, DELETE oder MERGE stehen. An jeder anderen Stelle ignoriert Oracle ihn stillschweigend ohne Fehler, weshalb ein Formatierer, der Kommentare verschiebt, hier gefährlich ist.',
                    'Hints werden an ihrer Position bewahrt, und ihr Inhalt wird nie umgeschrieben oder neu umbrochen. In der Ausgabe oben bleibt /*+ index(e emp_dept_ix) */ direkt nach SELECT und behält die kleingeschriebene Schreibweise, mit der es verfasst wurde.',
                ],
            },
            {
                heading: 'Der veraltete Outer Join mit (+)',
                body: [
                    'Bevor ANSI-Join-Syntax unterstützt wurde, markierte Oracle die optionale Seite eines Outer Joins mit (+) am Join-Prädikat. In älterem Code ist das immer noch sehr verbreitet. d.department_id(+) bedeutet, dass die Zeile aus departments fehlen kann — das Äquivalent eines LEFT JOIN von employees aus.',
                    'Die Notation wird bewahrt. Beachten Sie, dass vor dem Marker ein Leerzeichen eingefügt wird, wodurch d.department_id (+) entsteht, was Oracle identisch interpretiert.',
                ],
            },
            {
                heading: 'Hierarchische Abfragen: CONNECT BY, LEVEL, ORDER SIBLINGS BY',
                body: [
                    'Oracle durchläuft Baumstrukturen mit START WITH zur Wahl der Wurzeln und CONNECT BY PRIOR zur Beschreibung der Eltern-Kind-Beziehung, wobei die Tiefe über die Pseudo-Spalte LEVEL offengelegt wird. ORDER SIBLINGS BY sortiert dann innerhalb jeder Ebene, ohne die Hierarchie aufzubrechen.',
                    'Das sind Klauseln oberster Ebene, daher werden sie mit derselben Einrückung wie WHERE und GROUP BY platziert, statt in die WHERE-Klausel eingefaltet zu werden, der sie folgen.',
                ],
            },
            {
                heading: 'String-Literale mit q-Quote',
                body: [
                    "Jeden Apostroph in einem String zu verdoppeln ist fehleranfällig, daher bietet Oracle eine alternative Quotierung: q'[...]' — oder jedes andere Begrenzerpaar — macht den Inhalt wörtlich. Die Begrenzer und der Inhalt werden exakt bewahrt:",
                ],
            },
            {
                heading: 'DUAL, NVL und DECODE',
                body: [
                    'DUAL ist Oracles Ein-Zeilen-Tabelle, verwendet, wann immer ein Ausdruck eine FROM-Klausel benötigt. NVL ist die zweiargumentige Nullersetzung, und DECODE ist das positionelle Bedingungskonstrukt, das älter als CASE ist. Alle drei werden als gewöhnliche Identifier und Funktionen behandelt.',
                    'Für neuen Code sind COALESCE und CASE die portablen Äquivalente zu NVL und DECODE und verhalten sich bei der Typumwandlung und Kurzschlussauswertung etwas anders.',
                ],
            },
        ],
        limitations: [
            'PL/SQL-Blöcke werden deutlich schlechter formatiert als Abfragen. Ein DECLARE-/BEGIN-/END-Block wird in separate Zeilen mit Leerzeilen zwischen den Abschnitten aufgebrochen, statt als verschachtelte Struktur eingerückt zu werden. Die SQL-Anweisungen innerhalb eines Blocks werden normal formatiert; das Gerüst des Blocks darum herum nicht.',
            'In FETCH FIRST 25 rows ONLY bleibt das Wort rows kleingeschrieben, weil es als Teil der Zeilenbegrenzungsklausel interpretiert wird, nicht als eigenständiges Schlüsselwort.',
            'Der abschließende / , den SQL*Plus zur Ausführung eines Blocks verwendet, ist eine Client-Direktive und kein PL/SQL. Lassen Sie ihn aus dem heraus, was Sie einfügen.',
        ],
        conventions: [
            {
                heading: 'Bevorzugen Sie ANSI-Joins in neuem Code',
                body: [
                    'Die (+)-Notation kann keinen Full Outer Join ausdrücken, lässt sich in derselben Abfrage nicht mit ANSI-Join-Syntax kombinieren und macht es schwer, die Join-Bedingung von der Filterbedingung zu trennen. LEFT JOIN ist klarer und wird von Oracle seit Jahren empfohlen. Altes (+)-Code zu formatieren ist nützlich, um ihn zu lesen; ihn umzuwandeln ist eine separate Aufgabe.',
                ],
            },
            {
                heading: 'ROWNUM gegenüber FETCH FIRST',
                body: [
                    'Zeilenbegrenzung mit ROWNUM erfordert in Kombination mit ORDER BY eine eingebettete View, weil ROWNUM vor der Sortierung zugewiesen wird — die klassische Quelle von "Top-N"-Abfragen, die die falschen N Zeilen zurückgeben. Oracle 12c führte FETCH FIRST n ROWS ONLY ein, das zuerst sortiert und im obigen Beispiel verwendet wird.',
                ],
            },
        ],
        faq: [
            {
                q: 'Werden Optimizer-Hints bewahrt?',
                a: 'Ja. Hints bleiben unmittelbar nach dem führenden Schlüsselwort an ihrer Position, und ihr Inhalt wird nicht verändert. Das ist das im Beispiel oben gezeigte Verhalten.',
            },
            {
                q: 'Kann es den Rumpf eines Pakets oder einen großen PL/SQL-Block formatieren?',
                a: 'Die enthaltenen SQL-Anweisungen werden formatiert, aber das Blockgerüst wird schlecht behandelt — das ist unter den bekannten Einschränkungen aufgeführt. Für prozeduralen Code leistet eine IDE mit PL/SQL-bewusstem Formatierer bessere Arbeit.',
            },
            {
                q: 'Soll ich den abschließenden Schrägstrich behalten?',
                a: 'Nein. Der / ist eine SQL*Plus-Anweisung zur Ausführung des vorangehenden Blocks, kein Teil von PL/SQL. Fügen Sie die Anweisung ohne ihn ein.',
            },
            {
                q: 'Wird mein SQL irgendwohin hochgeladen?',
                a: 'Nein. Die Formatierung läuft vollständig in Ihrem Browser, was hier wichtig ist, weil Oracle-Abfragen oft Schemanamen und Geschäftslogik enthalten.',
            },
        ],
    },

    bigquery: {
        h1: 'BigQuery-SQL-Formatierer',
        tagline: 'Qualifizierte Backtick-Namen, UNNEST, SELECT * EXCEPT und QUALIFY.',
        intro: [
            'BigQuery-Abfragen werden von zwei Dingen geprägt, die andere Dialekte nicht haben: Tabellennamen mit drei durch Punkte getrennten Teilen innerhalb eines einzigen Backtick-Paars, und Spalten, die Arrays von Structs statt Skalaren sind. Beides ändert, was ein Formatierer richtig machen muss — die Punkte innerhalb von `project.dataset.table` sind keine Operatoren, und ein UNNEST in der FROM-Klausel ist ein Join, auch wenn es wie ein Funktionsaufruf aussieht.',
            'GoogleSQL hat zudem Klauseln hinzugefügt, die ganze Verschachtelungsebenen entfernen. QUALIFY filtert auf einer Fensterfunktion ohne die umschließende Subquery, die der Standard verlangen würde, und SELECT * EXCEPT lässt Spalten weg, ohne die zu behaltenden aufzulisten. Die unten in den Editor geladene Abfrage nutzt beides.',
        ],
        quirks: [
            {
                heading: 'Backtick-quotierte qualifizierte Namen',
                body: [
                    'Eine BigQuery-Tabellenreferenz ist `project.dataset.table`, mit den Punkten innerhalb der Quotierung statt zwischen separat quotierten Teilen. Projekt-IDs enthalten routinemäßig Bindestriche — analytics-prod im Beispiel —, weshalb die Backticks zwingend erforderlich sind: ohne sie würde der Bindestrich als Subtraktion interpretiert.',
                    'Die gesamte Referenz wird als einzelnes Identifier-Token behandelt und daher nie an einem Punkt oder Bindestrich aufgetrennt.',
                ],
            },
            {
                heading: 'UNNEST ist ein Join, kein Funktionsaufruf',
                body: [
                    'Wenn eine Spalte ein ARRAY ist, flacht UNNEST in der FROM-Klausel es zu Zeilen ab, korreliert mit der Zeile, aus der es stammt. Das Komma davor ist ein CROSS JOIN, weshalb das Beispiel FROM tabelle e, UNNEST(e.hits) AS h lautet — eine Zeile pro Hit, die ihre Sitzung mitführt.',
                    'Es wird in eine eigene Zeile in der FROM-Liste gesetzt, auf derselben Ebene wie die Tabelle, die es erweitert, was die ehrliche Darstellung dessen ist, was es ist.',
                ],
            },
            {
                heading: 'SELECT * EXCEPT und * REPLACE',
                body: [
                    'Breite Event-Tabellen machen es unpraktisch, jede Spalte aufzulisten, daher erlaubt GoogleSQL stattdessen zu subtrahieren: * EXCEPT (payload) wählt alles außer dieser Spalte, und * REPLACE (ausdruck AS spalte) ersetzt den Wert einer Spalte, während der Rest erhalten bleibt. Beide werden als Modifikatoren des Sterns interpretiert, nicht als Funktionsaufrufe.',
                ],
            },
            {
                heading: 'QUALIFY',
                body: [
                    'Das Filtern auf einer Fensterfunktion erfordert normalerweise, sie in einer Subquery zu berechnen und außerhalb zu filtern, weil WHERE vor Fensterfunktionen läuft. QUALIFY erledigt das auf einer Ebene — das Beispiel behält das jüngste Ereignis pro Benutzer ohne umschließendes SELECT.',
                    'Es ist eine Klausel oberster Ebene und wird neben WHERE und GROUP BY platziert. QUALIFY erfordert ein WHERE, GROUP BY oder HAVING im selben Abfrageblock, oder eine WINDOW-Klausel.',
                ],
            },
            {
                heading: 'Wildcard-Tabellen und _TABLE_SUFFIX',
                body: [
                    'Ein abschließendes * in einem Tabellennamen passt auf jede Tabelle mit diesem Präfix, und die Pseudo-Spalte _TABLE_SUFFIX enthält den passenden Teil — die Standardmethode, um einen nach Datum partitionierten Export zu durchsuchen. Das Filtern nach _TABLE_SUFFIX verhindert, dass die Abfrage jedes Fragment liest, gehört also in die WHERE-Klausel statt in einen späteren Filter.',
                    'SAFE_CAST und das Funktionspräfix SAFE. liefern NULL statt bei ungültiger Eingabe einen Fehler auszulösen, was wichtig ist, wenn die Daten benutzerdefiniertes JSON sind. Beide werden als gewöhnliche Funktionssyntax erkannt.',
                ],
            },
        ],
        limitations: [
            'Die Pseudo-Spalten _table_suffix, _partitiontime und _partitiondate bleiben in der eingegebenen Schreibweise, weil sie als Identifier statt als Schlüsselwörter interpretiert werden. BigQuery akzeptiert für sie jede Schreibweise.',
            'Scripting-Anweisungen — DECLARE, SET, BEGIN ... END, EXECUTE IMMEDIATE — werden deutlich schlechter formatiert als Abfragen, wie prozeduraler Code in jedem Dialekt.',
        ],
        conventions: [
            {
                heading: 'Formatierung ändert nicht, was eine Abfrage kostet',
                body: [
                    'BigQuery berechnet nach gelesenen Bytes, was von den referenzierten Spalten und den berührten Partitionen abhängt — nicht von Leerraum. Das Formatieren einer Abfrage ändert nie ihre Kosten. SELECT * schon, was das eigentliche Argument für EXCEPT statt des Sterns bei breiten Tabellen ist.',
                ],
            },
            {
                heading: 'Nur GoogleSQL',
                body: [
                    'Legacy SQL, der Dialekt von vor 2016 mit [project:dataset.table]-Klammersyntax, ist eine andere Grammatik und wird hier nicht unterstützt. Wenn Ihre Abfrage Doppelpunkte und eckige Klammern in Tabellennamen verwendet, ist es Legacy SQL und muss migriert statt formatiert werden.',
                ],
            },
        ],
        faq: [
            {
                q: 'Beeinflusst Formatierung, was meine Abfrage kostet?',
                a: 'Nein. Die Kosten werden durch die gelesenen Bytes bestimmt — die referenzierten Spalten und die gelesenen Partitionen. Leerraum und Schlüsselwort-Schreibweise haben auf keines von beiden Einfluss.',
            },
            {
                q: 'Unterstützt es Legacy SQL?',
                a: 'Nein, nur GoogleSQL (früher Standard SQL genannt). Legacy SQL verwendet eine andere Tabellenreferenz-Syntax und eine andere Grammatik.',
            },
            {
                q: 'Werden STRUCT- und ARRAY-Ausdrücke behandelt?',
                a: 'Ja. Verschachtelte STRUCT-Konstruktoren und ARRAY_AGG-Aufrufe werden als gewöhnliche Ausdrücke interpretiert, und UNNEST wird als Teil der FROM-Klausel erkannt.',
            },
            {
                q: 'Wird meine Abfrage an Google oder einen Server gesendet?',
                a: 'Nein. Diese Seite führt den Formatierer in Ihrem Browser aus. Die Abfrage wird nirgendwohin gesendet, auch nicht an BigQuery.',
            },
        ],
    },
};
