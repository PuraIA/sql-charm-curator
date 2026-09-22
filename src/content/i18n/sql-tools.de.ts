import type { SqlToolSlug, SqlToolGuideTranslation } from '../sql-tools';

/** Deutsche Übersetzungen für /sql/<slug> (Werkzeuge, keine Dialekte). */
export const SQL_TOOL_TRANSLATIONS_DE: Partial<Record<SqlToolSlug, SqlToolGuideTranslation>> = {
    diff: {
        h1: 'SQL-Diff',
        tagline: 'Formatiert zuerst beide Abfragen auf dieselbe Weise, damit nur die echte Änderung im Diff erscheint.',
        intro: [
            'Zwei SQL-Abfragen als rohen Text zu vergleichen, zeigt fast nie, was sich tatsächlich geändert hat: eine Version mit Schlüsselwörtern in Kleinbuchstaben, die andere in Großbuchstaben; eine bei 80 Zeichen umgebrochen, die andere bei 120 — nichts davon ist eine echte Änderung, aber ein Diff auf Textebene kann nicht zwischen „neu formatiert“ und „umgeschrieben“ unterscheiden. Dieses Werkzeug lässt beide Abfragen durch genau denselben sql-formatter-Durchlauf laufen — gleicher Dialekt, gleiche Groß-/Kleinschreibung, gleiche Einrückung —, bevor sie zeilenweise verglichen werden, sodass eine Neuformatierung ein *identisches* Paar erzeugt und das Diff leer bleibt. Was danach übrig bleibt, ist die Änderung, die zählt.',
            'Das Beispiel unten ist oben im Editor geladen: Eine Abfrage erhält einen WHERE-Filter und ein ORDER BY / LIMIT für die Seitennummerierung. Beide Abfragen werden im selben Stil formatiert, sodass das Diff unten genau diese Ergänzungen isoliert — keine einzige Zeile Rauschen durch die Neuformatierung selbst.',
        ],
        sections: [
            {
                heading: 'Das Diff ist zeilenbasiert, berechnet auf dieselbe Weise wie `diff` eines berechnet',
                body: [
                    'Dies ist kein naiver zeilenweiser Vergleich, der eine einzelne eingefügte Zeile in der Mitte so aussehen ließe, als hätten sich alle folgenden Zeilen geändert. Es implementiert Myers\' Algorithmus für das kürzeste Editierskript — denselben Algorithmus, der hinter dem Unix-diff-Werkzeug und git diff steckt —, der die minimale Menge an Zeilenergänzungen und -entfernungen findet, die die Vorher-Abfrage in die Nachher-Abfrage verwandelt.',
                    'Im Beispiel sind die neue WHERE-Klausel und die neue ORDER BY / LIMIT-Klausel die einzigen als geändert markierten Zeilen; jede Zeile, die in beiden Abfragen existiert, einschließlich derer nach der Einfügestelle, bleibt unmarkiert.',
                ],
            },
            {
                heading: 'Erst formatieren macht das Diff aussagekräftig',
                body: [
                    'Beide Abfragen werden mit dem oben ausgewählten Dialekt und den Optionen formatiert, bevor irgendetwas verglichen wird. Füge genau dieselbe Abfrage in beide Felder ein, in welchem Stil auch immer du sie ursprünglich geschrieben hast, und das Diff zeigt nichts — was die richtige Antwort ist und der schnellste Weg, um zu bestätigen, dass eine von dir vorgenommene Änderung rein kosmetisch war.',
                ],
            },
            {
                heading: 'Wenn eine Abfrage nicht formatiert werden kann',
                body: [
                    'Wenn eine Abfrage unter dem ausgewählten Dialekt nicht geparst werden kann, greift dieses Werkzeug auf dieselbe Weise zurück wie der SQL-Formatter: ein reduzierter Optionssatz, dann ein generischer SQL-Durchlauf, bevor aufgegeben und ein Fehler gemeldet wird. Ein Diff muss trotzdem beide Seiten durch denselben Fallback-Pfad gegangen sein, um aussagekräftig zu sein. Wenn also eine Seite den generischen Fallback trifft und die andere nicht, können geringfügige Formatierungsunterschiede aus dieser Diskrepanz als Rauschen im Diff erscheinen.',
                ],
            },
        ],
        limitations: [
            'Das Diff ist zeilenbasiert, nicht tokenbasiert: Ein einzelnes geändertes Wort in der Mitte einer langen Zeile (ein umbenannter Alias, ein geänderter Literalwert) markiert die gesamte Zeile als entfernt und neu hinzugefügt, statt nur das geänderte Wort darin hervorzuheben.',
            'Der Vergleich über zwei verschiedene Dialekte hinweg ist möglich — das Werkzeug verhindert es nicht —, aber selten nützlich, da dieselbe Abfrage unter den Grammatiken verschiedener Dialekte aus Gründen unterschiedlich formatiert werden kann, die nichts mit einer tatsächlichen Bearbeitung zu tun haben.',
        ],
        faq: [
            {
                q: 'Warum zeigt das Einfügen derselben Abfrage auf beiden Seiten manchmal trotzdem ein Diff?',
                a: 'Das sollte es nicht, und tut es auch nicht, solange beide Seiten unter dem ausgewählten Dialekt auf dieselbe Weise geparst werden. Wenn eine Seite eine andere Fallback-Stufe trifft als die andere — eine braucht den generischen Durchlauf, die andere nicht —, können die beiden trotz identischer Eingabe leicht unterschiedlich formatiert enden.',
            },
            {
                q: 'Kann ich Abfragen vergleichen, die in unterschiedlichen SQL-Dialekten geschrieben sind?',
                a: 'Das Werkzeug erlaubt es, aber ein Diff über zwei verschiedene Grammatiken hinweg spiegelt normalerweise Dialektunterschiede wider, keine echte Bearbeitung — es ist dafür gebaut, zwei Versionen derselben Abfrage im selben Dialekt zu vergleichen.',
            },
            {
                q: 'Vergleicht es ganze Anweisungen oder einzelne Zeilen?',
                a: 'Zeilen, nach der Formatierung — dieselbe Einheit, die git diff für Code verwendet. Eine Änderung innerhalb einer einzelnen Zeile (wie eine umbenannte Spalte) markiert die gesamte Zeile als geändert, nicht nur den geänderten Teil davon.',
            },
            {
                q: 'Werden meine Abfragen irgendwohin hochgeladen?',
                a: 'Nein. Sowohl Formatierung als auch Diff laufen in deinem Browser, was hier wichtig ist, da der Vergleich zweier Versionen einer Abfrage oft bedeutet, zwei Versionen mit echten Tabellen- und Spaltennamen darin zu vergleichen.',
            },
        ],
    },
};
