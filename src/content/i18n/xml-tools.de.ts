import type { XmlToolSlug, XmlToolGuideTranslation } from '../xml-tools';

/** Deutsche Übersetzungen für /xml/<slug> (Werkzeuge, keine Anleitungen). */
export const XML_TOOL_TRANSLATIONS_DE: Partial<Record<XmlToolSlug, XmlToolGuideTranslation>> = {
    xpath: {
        h1: 'XPath-Tester',
        tagline: 'Ein eng gefasster XPath-1.0-Auswerter — Pfade, Prädikate und text()/@name-Tests — über den eigenen XML-Parser dieser Seite.',
        intro: [
            'Ein Browser bringt bereits eine echte, vollständige XPath-1.0-Engine mit — document.evaluate() —, aber sie braucht ein lebendiges DOM, das nur in einem Browser-Tab existiert, nicht während der Build-Zeit-Seitenerzeugung dieser Seite oder in ihren automatisierten Tests. Deshalb läuft dieses Werkzeug stattdessen mit seinem eigenen Auswerter: einer bewusst eng gefassten Teilmenge von XPath 1.0, die abdeckt, was Leute tatsächlich in einen XPath-Tester eintippen — Pfadausdrücke, die Handvoll Prädikatformen, die ständig vorkommen, und die @name-/text()-Knotentests — aufgebaut über den eigenen XML-Parser dieser Seite statt über die vollständige W3C-Grammatik und Funktionsbibliothek.',
            "Das Buchladen-Beispiel unten ist oben im Editor geladen, mit /bookstore/book[@category='children']/title als Startausdruck — ändere den Ausdruck, und die Trefferliste unten aktualisiert sich sofort.",
        ],
        examples: [
            {
                explanation: 'Alle drei <book>-Elemente, in Dokumentreihenfolge — ein einfacher absoluter Pfad.',
            },
            {
                explanation: 'Jedes <title>, in beliebiger Tiefe gefunden — die Abkürzung // sucht, sie verlangt keinen exakten Pfad.',
            },
            {
                explanation: 'Nur das Buch, dessen category-Attribut exakt „children“ ist — ein Treffer.',
            },
            {
                explanation: 'Das erste Buch nach Dokumentposition — XPath-Positionen sind 1-indiziert, nicht 0-indiziert.',
            },
            {
                explanation: 'Das letzte Buch, unabhängig von der Anzahl — last() passt sich an, wenn Bücher hinzugefügt oder entfernt werden.',
            },
            {
                explanation: 'Der Textinhalt des <price>-Elements des ersten Buchs, als eigene Art von Treffer — nicht das Element selbst.',
            },
            {
                explanation: 'Jedes Attribut des ersten Buchs — @category und @id — unter Verwendung der Attributachse statt des Namens eines bestimmten Attributs.',
            },
            {
                explanation: 'Das Elternelement jedes <title> — das jeweils umschließende <book> — eine Ebene .. pro geschriebener Ebene.',
            },
            {
                explanation: 'Nur das <title>, dessen Text „Potter“ als Teilzeichenkette enthält — ein Teiltreffer, kein exakter.',
            },
            {
                explanation: 'Überhaupt keine Knotenliste — eine einzelne Zahl, 3, die Anzahl der übereinstimmenden Elemente.',
            },
        ],
        sections: [
            {
                heading: 'Prädikate laufen nacheinander ab, jedes schränkt ein, was zuvor kam',
                body: [
                    '/bookstore/book[@category=\'cooking\'][1] wendet zwei Prädikate an: Zuerst nur Kochbücher behalten, dann das erste von dem nehmen, was übrig bleibt. Jedes [..] filtert das Ergebnis von allem, was davor kam, genau so, wie es verkettete .filter()-Aufrufe im Code täten — nicht unabhängige Bedingungen, die alle gegen die ursprüngliche Liste geprüft werden.',
                ],
            },
            {
                heading: '@name und text() lesen das aktuelle Element, nicht seine Kinder',
                body: [
                    'book[1]/@category liest das eigene category-Attribut von book[1]. Das wirkt offensichtlich, ist aber eine echte Unterscheidung zu book[1]/title, das tatsächlich zu einem Kind hinabsteigt — @ und text() sind eigene Achsen (attribute:: und ein Textknotentest), keine Abkürzung für „hineinschauen.“ //@category zu schreiben durchsucht stattdessen die Attribute jedes Nachfahren, was eine echt andere, breitere Abfrage ist.',
                ],
            },
            {
                heading: 'Ein Pfad mit null Treffern ist kein Fehler',
                body: [
                    '/bookstore/nonexistent wertet sauber zu null Treffern aus — genau so, wie eine Datenbankabfrage, die auf keine Zeilen passt, kein Datenbankfehler ist. Ein roter Fehler erscheint nur für etwas, das dieser Auswerter überhaupt nicht parsen oder auswerten kann, wie eine unausgeglichene [ oder eine Funktion, die er nicht implementiert.',
                ],
            },
        ],
        limitations: [
            'Pro geschriebenem „..“ wird nur eine Ebene „..“ gegangen — //title/../.. geht korrekt zwei Ebenen hoch, weil zwei „..“ geschrieben sind, aber dieser Auswerter hat keine Möglichkeit, weiter zu gehen als die Anzahl der tatsächlich im Ausdruck vorhandenen „..“ (was der echten XPath-Semantik entspricht; es gibt keine Abkürzung für „N Ebenen hochgehen“ außer „..“ N-mal zu schreiben).',
            'Ein Tag mit Namensraum-Präfix wie soap:Body wird als der wörtliche String „soap:Body“ abgeglichen, nicht gegen seine xmlns-Deklaration aufgelöst — dieselbe Vereinfachung, die der XML-zu-JSON-Konverter dieser Seite aus demselben Grund vornimmt: eine ordentliche Namensraumauflösung ist ein deutlich größeres Problem, als die meisten XPath-Tests tatsächlich brauchen.',
            'Der Vereinigungsoperator (|), die following-/preceding-Achsen und der größte Teil der XPath-Funktionsbibliothek jenseits von contains() und count() sind nicht implementiert — ein Ausdruck, der sie verwendet, scheitert beim Parsen mit einem klaren Fehler, statt still falsch interpretiert zu werden.',
        ],
        faq: [
            {
                q: 'Warum nicht einfach die eingebaute XPath-Unterstützung des Browsers verwenden?',
                a: 'document.evaluate() braucht ein lebendiges DOM, das nur in einem Browser-Tab existiert — es kann nicht während der Build-Zeit-Seitenerzeugung dieser Seite oder in ihren automatisierten Tests laufen, die beide genau dieselbe Auswertungslogik brauchen, die das interaktive Werkzeug verwendet. Dieser Auswerter läuft überall identisch.',
            },
            {
                q: 'Was passiert, wenn mein Ausdruck eine Syntax verwendet, die dies nicht unterstützt?',
                a: 'Du bekommst einen klaren Parse-Fehler, der benennt, was falsch ist, statt eines still falschen Ergebnisses. Der Vereinigungsoperator, die meisten Achsen jenseits von child/descendant-or-self/self/parent, und die meisten Funktionen jenseits von contains() und count() fallen in diese Kategorie — siehe Bekannte Einschränkungen.',
            },
            {
                q: 'Sind Positionen 0-indiziert oder 1-indiziert?',
                a: '1-indiziert, wie echtes XPath: [1] ist der erste Treffer, nicht der zweite. Das ist eine häufige Quelle von Off-by-one-Fehlern für alle, die an 0-indizierte Sprachen gewöhnt sind.',
            },
            {
                q: 'Wird mein XML irgendwohin hochgeladen?',
                a: 'Nein. Sowohl das Parsen als auch die Auswertung laufen in deinem Browser.',
            },
        ],
    },
};
