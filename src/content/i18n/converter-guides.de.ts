import type { ConverterGuideTranslation } from '../converter-guides';

/** Deutsche Übersetzungen für /json/to-xml, /xml/to-json, /json/to-yaml, /xml/to-yaml. */
export const CONVERTER_TRANSLATIONS_DE: Partial<Record<string, ConverterGuideTranslation>> = {
    'json/to-xml': {
        h1: 'JSON-zu-XML-Konverter',
        tagline: 'Attribute mit @, Arrays als wiederholte Geschwister — die Zuordnung ist explizit, nicht erraten.',
        intro: [
            'JSON und XML teilen kein Datenmodell, also verpflichtet sich jeder Konverter zwischen ihnen tatsächlich auf eine Konvention und hofft, dass sie dem entspricht, was du brauchst. Die Konvention dieses Konverters ist klein und explizit: Ein Schlüssel, der mit @ beginnt, wird zu einem Attribut, ein Schlüssel #text wird zu Textinhalt, und ein Array wird zu wiederholten Geschwisterelementen unter dem Tag-Namen dieses Schlüssels — nicht zu einem Wrapper-Element mit nummerierten Kindern, was die andere gängige Wahl ist und in der Praxis schlechter zu lesen ist.',
            'Das Beispiel unten ist oben in den Konverter geladen. Zwei Bestellungen, beide mit einem @id-Attribut, werden zu zwei Geschwisterelementen <order> statt zu einem Wrapper <orders><order>...</order><order>...</order></orders> — der Array-Schlüssel selbst (order) ist bereits der wiederholte Tag-Name.',
        ],
        mapping: [
            {
                heading: '@Schlüssel wird zu einem Attribut',
                body: [
                    'Ein Schlüssel, der mit @ beginnt, wird von diesem Präfix befreit und seinem Element als Attribut angehängt, in der Reihenfolge, in der er im Objekt erscheint. @id: "1001" auf einem order-Objekt wird zu id="1001" auf diesem <order>-Tag.',
                ],
            },
            {
                heading: '#text wird zu Textinhalt — neben Attributen verwendbar',
                body: [
                    'Ein gewöhnliches JSON-Objekt hat keinen Platz für „dieses Element hat ein Attribut und auch Text“ — Objekte haben keine implizite Position für Text, wie es XML-Elemente haben. #text ist der explizite Schlüssel dafür: {"@id": "1", "#text": "hello"} erzeugt <tag id="1">hello</tag>.',
                ],
            },
            {
                heading: 'Arrays werden zu wiederholten Elementen, nicht zu einem Wrapper',
                body: [
                    'order: [ {...}, {...} ] erzeugt zwei Geschwisterelemente <order> — der Schlüssel selbst liefert den wiederholten Tag-Namen. Ein nacktes Array ohne einen solchen Schlüssel (die direkte Konvertierung eines JSON-Arrays, ohne dass etwas es umschließt) hat keinen natürlichen Tag-Namen zur Wiederverwendung, sodass es auf ein generisches <item> für jeden Eintrag innerhalb eines Standard-<root> zurückfällt.',
                ],
            },
            {
                heading: 'null wird zu einem leeren Element; jeder andere Skalar wird zu Text',
                body: [
                    'Ein JSON-null hat keine XML-Entsprechung, also wird es zu einem selbstschließenden leeren Element: null -> <key/>. Zahlen und Booleans werden zu ihrer String-Form als Elementtext — 8080 wird zum Text „8080“ — da XML-Text immer nur Zeichen sind.',
                ],
            },
        ],
        limitations: [
            'Ein JSON-Schlüssel, der kein gültiger XML-Name ist — Leerzeichen, eine führende Ziffer, die meiste Interpunktion — wird umgeschrieben statt abgelehnt: Ungültige Zeichen werden zu _, und ein Name, der weiterhin mit einer Ziffer beginnen würde, erhält ein führendes _. Das ist eine sichtbare, getestete Transformation (2fa wird zu _2fa), keine stille, bedeutet aber, dass der Ausgabe-Tag-Name nicht immer identisch mit dem Eingabeschlüssel ist.',
            'Ein JSON-Array aus XML zurück- und wieder vorwärtszukonvertieren ist nicht perfekt stabil, wenn das Array eine Mischung aus Objekten und einfachen Werten enthält — die Zuordnung ist auf Arrays einer einheitlichen Form ausgelegt, was die überwältigende Mehrheit echter API-Antworten und Konfigurations-Arrays abdeckt.',
        ],
        faq: [
            {
                q: 'Warum @ für Attribute statt einer anderen Konvention?',
                a: 'Hier gibt es keinen Standard — mehrere JSON-XML-Bibliotheken verwenden @, und es hat den Vorteil, sich von gewöhnlichen Schlüsseln deutlich zu unterscheiden und innerhalb eines reinen Text-JSON-Schlüssels eindeutig zu sein. Dieser Konverter dokumentiert seine genaue Wahl, statt anzunehmen, sie sei die einzig vernünftige.',
            },
            {
                q: 'Kann ich ein JSON-Array direkt konvertieren, ohne dass etwas es umschließt?',
                a: 'Ja — es wird in ein Standard-<root> eingewickelt, wobei jedes Element zu einem <item>-Element wird, da ein nacktes Array keinen eigenen Schlüssel hat, der als wiederholter Tag-Name wiederverwendet werden könnte.',
            },
            {
                q: 'Ist die Konvertierung umkehrbar?',
                a: 'Für die Formen, auf die diese Konvention abzielt — Objekte, Attribute, Arrays einer einheitlichen Form — ja: Das Zurückkonvertieren des Ergebnisses mit XML zu JSON erzeugt wieder dasselbe JSON, geprüft durch die eigenen Tests dieser Seite. Gemischter Text-und-Elemente-Inhalt ist der eine Fall, bei dem das nicht so ist: siehe die eigenen Einschränkungen von /xml/to-json für den Grund.',
            },
            {
                q: 'Wird mein JSON irgendwohin hochgeladen?',
                a: 'Nein. Die Konvertierung läuft in deinem Browser; es wird nichts an einen Server gesendet.',
            },
        ],
    },

    'xml/to-json': {
        h1: 'XML-zu-JSON-Konverter',
        tagline: 'Attribute, wiederholte Tags und Textinhalt, zugeordnet zu einfachen JSON-Schlüsseln.',
        intro: [
            'Der schwierige Teil daran, XML in JSON umzuwandeln, ist nicht die Syntax, sondern dass XML Informationen trägt, für die JSON keinen nativen Platz hat: Attribute und Text, der neben Kindelementen steht, statt der einzige Inhalt zu sein. Die Regel dieses Konverters für beides ist explizit statt impliziert — siehe die Zuordnung unten — und es ist dieselbe Regel, die /json/to-xml umgekehrt verwendet, sodass ein Hin- und Rückweg durch beide Seiten für die hier abgedeckten Formen stabil ist.',
            'Das Beispiel unten — ein kleiner Produkt-Feed, wie ihn eine ältere interne API zurückgeben könnte — ist oben in den Konverter geladen. Jedes <product> trägt ein sku-Attribut und ein verschachteltes <price>, das selbst ein currency-Attribut und Text hat: genau der Fall, der sowohl @ als auch #text braucht, um getreu dargestellt zu werden.',
        ],
        mapping: [
            {
                heading: 'Attribute werden zu Schlüsseln mit @-Präfix',
                body: [
                    'sku="SKU-100" auf einem <product>-Element wird zu "@sku": "SKU-100" in seinem JSON-Objekt. Das @ hält Attribute visuell deutlich von Kindelementen unterschieden, wenn du das JSON liest, und ist das, wonach /json/to-xml sucht, um in die andere Richtung zurückzukonvertieren.',
                ],
            },
            {
                heading: 'Ein Element mit nur Text fällt zu einem einfachen String zusammen',
                body: [
                    '<name>Wireless Mouse</name> wird direkt zu "name": "Wireless Mouse" — nicht {"#text": "Wireless Mouse"} — weil es an diesem Element sonst nichts gibt (keine Attribute, keine Kinder), neben dem der #text-Schlüssel stehen müsste.',
                ],
            },
            {
                heading: '...aber #text erscheint, sobald auch ein Attribut vorhanden ist',
                body: [
                    'Das obige <price>-Element hat sowohl ein Attribut als auch Text, kann also nicht zu einem nackten String zusammenfallen — es gäbe keinen Platz für die Währung. Stattdessen wird es zu {"@currency": "BRL", "#text": "129.90"}.',
                ],
            },
            {
                heading: 'Wiederholte Tags werden zu einem Array, in Dokumentreihenfolge',
                body: [
                    'Zwei <product>-Elemente unter <products> werden zu einem "product"-Array mit zwei Einträgen, in der Reihenfolge, in der sie erschienen — nicht zu zwei separaten Schlüsseln und nicht zu einem Objekt zusammengeführt. Ein einzelnes <product> (ohne Geschwister) bleibt ein einfaches Objekt, kein Ein-Element-Array.',
                ],
            },
            {
                heading: 'Jeder Wert wird zu einem String — absichtlich',
                body: [
                    'XML-Text sind immer nur Zeichen; XML selbst hat keinen Zahl- oder Boolean-Typ. Das obige 129.90 bleibt der String „129.90“, statt zur Zahl 129.9 geparst zu werden, was auch diese nachgestellte Null stillschweigend wegnormalisieren würde. Den Typ zu erraten wäre genau das — eine Vermutung — dieselbe Entscheidung, die der JSON-zu-TypeScript-Konverter dieser Seite aus demselben Grund trifft.',
                ],
            },
        ],
        limitations: [
            'Gemischter Inhalt — Text, der mit Kindelementen verschachtelt ist, wie <p>Hello <b>world</b>!</p> — verliert die Reihenfolge zwischen Text und Element: Er wird zu {"#text": "Hello !", "b": "world"}, was das nicht von "!<b>world</b>Hello " unterscheiden kann. Dieser Konverter ist für strukturiertes, konfigurations- und API-förmiges XML gebaut, nicht für prosaartiges Markup, und hier zeigt sich das.',
            'XML-Namensräume werden als reine String-Präfixe behandelt — soap:Envelope wird zum JSON-Schlüssel "soap:Envelope" als wörtlicher Text, nicht gegen seine xmlns-Deklaration aufgelöst. Das ist eine echte, bewusste Umfangsgrenze: namensraumbewusste Auflösung ist ein deutlich größeres Problem als das konfigurations- und API-Antwort-XML, auf das dieser Konverter abzielt.',
            'Kommentare und Verarbeitungsanweisungen werden verworfen — sie sind keine Daten, also gibt es keinen JSON-Schlüssel, zu dem sie werden könnten.',
        ],
        faq: [
            {
                q: 'Warum wird ein Element zu einem einfachen String und ein anderes zu einem Objekt?',
                a: 'Ein Element ohne Attribute und ohne Kinder fällt zu nur seinem Text als String zusammen. Eines mit einem Attribut, einem Kindelement oder beidem wird zu einem Objekt — weil ein einfacher String keinen Platz hat, um diese zusätzliche Information anzuhängen.',
            },
            {
                q: 'Was passiert mit XML-Kommentaren?',
                a: 'Sie werden verworfen. Kommentare dokumentieren das XML für einen menschlichen Leser; sie sind kein Teil der Daten, also gibt es keinen entsprechenden JSON-Wert für sie.',
            },
            {
                q: 'Werden CDATA-Abschnitte verarbeitet?',
                a: 'Ja — der Inhalt innerhalb von <![CDATA[ ... ]]> wird wörtlich als Text übernommen, ohne ihn erneut als Markup zu parsen, genau wie ein normaler Textknoten.',
            },
            {
                q: 'Wird mein XML irgendwohin hochgeladen?',
                a: 'Nein. Sowohl das Parsen als auch die Konvertierung laufen in deinem Browser mit dem eigenen XML-Parser dieser Seite, nicht über einen Serveraufruf.',
            },
        ],
    },

    'json/to-yaml': {
        h1: 'JSON-zu-YAML-Konverter',
        tagline: 'Keine Konvention zu entwerfen — YAML ist bereits das Datenmodell von JSON, nur anders geschrieben.',
        intro: [
            'Anders als bei JSON-zu-XML gibt es in dieser Richtung keine Konvention zu erfinden: eine YAML-Zuordnung ist ein JSON-Objekt, eine YAML-Sequenz ist ein JSON-Array, und YAMLs Skalare sind dieselben Strings, Zahlen, Booleans und null, die JSON bereits hat. Konvertieren ist wirklich nur ein erneutes Serialisieren derselben Werte — was auch der Grund ist, warum dies die einzige Konvertierung auf dieser Seite ohne „bekannte Einschränkungen“ zu verlorenen Informationen ist.',
            'Das Beispiel unten ist ein Kubernetes-Deployment-Fragment — die Art Dokument, für die YAML ständig verwendet wird und JSON fast nie, was meist der eigentliche Grund ist, warum jemand diese Konvertierung will: strukturierte Daten von Hand im Format zu bearbeiten, das das eigene Tooling erwartet.',
        ],
        mapping: [
            {
                heading: 'Verschachtelung wird zu Einrückung',
                body: [
                    'Die Schlüssel eines JSON-Objekts werden zur Block-Mapping-Syntax von YAML (Schlüssel: Wert, unter dem Elternteil eingerückt), und ein JSON-Array wird zu einer Block-Sequenz (- Element, eines pro Zeile). Es gibt keine Attribut/Text-Unterscheidung, um die herum man entwerfen müsste, weil keines der beiden Formate Attribute hat.',
                ],
            },
            {
                heading: 'Strings werden nur zitiert, wenn YAML sie sonst falsch lesen würde',
                body: [
                    'apiVersion: apps/v1 wird nackt geschrieben — ein unzitiertes einfaches Skalar — weil YAML keine Schwierigkeiten hat, es als String zu parsen. Ein Wert, der wie eine YAML-Zahl, ein Boolean oder null aussieht (wie der Text „true“, „null“ oder „123“), wird zitiert, damit er als String zurückkommt, statt als der andere Typ neu interpretiert zu werden. Ein String, der ": " (Doppelpunkt-Leerzeichen) enthält, wird aus demselben Grund zitiert: Unzitiert würde YAML ihn als weiteres Schlüssel-Wert-Paar statt als einen einzigen Wert lesen.',
                ],
            },
            {
                heading: 'Ein mehrzeiliger String wird zu einem Block-Literal, nicht zu einer escapten Einzeiler',
                body: [
                    'Ein JSON-String, der \\n enthält, wird im |-Block-Literal-Stil von YAML geschrieben — der Text auf seinen eigenen eingerückten Zeilen — statt als eine zitierte Zeile mit einem wörtlichen Backslash-n darin. Er liest sich so, wie der ursprüngliche Text tatsächlich aussieht, was für alles wie eine mehrzeilige Beschreibung oder einen in eine CI-Konfiguration eingebetteten Shell-Befehl wichtig ist.',
                ],
            },
        ],
        limitations: [
            'Keine, die speziell für diese Richtung gilt: Jeder JSON-Wert (Objekt, Array, String, Zahl, Boolean, null) hat eine direkte YAML-Entsprechung, sodass hier nichts eine Vermutung ist, wie es ein Attribut oder ein wiederholter Tag-Name auf der XML-Seite ist. Das Einzige, was man wissen sollte, betrifft YAML im Allgemeinen, nicht diesen Konverter: Ein YAML-Dokument kann Dinge ausdrücken, die JSON nicht kann (Anker und Aliase für wiederholte Strukturen, mehrere Dokumente in einer Datei, Kommentare) — das Konvertieren von JSON zu YAML wird diese niemals erzeugen, da JSON nichts hat, aus dem sie entstehen könnten.',
        ],
        faq: [
            {
                q: 'Ist diese Konvertierung jemals verlustbehaftet?',
                a: 'Nicht für alles, was JSON selbst darstellen kann. Jedes Objekt, Array, String, jede Zahl, jeder Boolean und null wird direkt auf sein YAML-Äquivalent abgebildet, ohne dass etwas zu erraten übrig bleibt.',
            },
            {
                q: 'Warum werden manche Strings zitiert und andere nicht?',
                a: 'Ein String wird nur zitiert, wenn ihn nackt zu lassen seine Bedeutung in YAML ändern würde — zum Beispiel der wörtliche Text „true“ oder „123“, der sonst als Boolean oder Zahl statt als String zurückgeparst würde.',
            },
            {
                q: 'Kann ich ein Kubernetes-Manifest oder eine docker-compose-Datei auf diese Weise konvertieren?',
                a: 'Ja, für die Richtung, JSON einzufügen und YAML herauszubekommen — die meisten Infrastruktur-Tools akzeptieren beides, und dies erzeugt gültiges YAML für alles, was als gültiges JSON begann.',
            },
            {
                q: 'Werden meine Daten irgendwohin hochgeladen?',
                a: 'Nein. Die Konvertierung läuft in deinem Browser, was hier wichtig ist, da Kubernetes- und CI-Konfigurationen oft interne Servicenamen enthalten.',
            },
        ],
    },

    'xml/to-yaml': {
        h1: 'XML-zu-YAML-Konverter',
        tagline: 'Durchläuft dieselbe @/#text-Konvention wie XML zu JSON und serialisiert dann als YAML.',
        intro: [
            'Dies sind zwei Konvertierungen, die hintereinander ausgeführt werden, keine separate direkte: Das XML wird in dieselbe @-Attribut-/#text-/wiederholtes-Tag-JSON-Darstellung geparst, die auch /xml/to-json erzeugt, und dieser Wert wird dann als YAML statt als JSON ausgeschrieben. Jede auf /xml/to-json dokumentierte Regel und Einschränkung gilt hier identisch — diese Seite existiert, weil „xml zu yaml“ eine Suche ist, die jemand tatsächlich eintippt, nicht weil die zugrunde liegende Konvertierung irgendwie anders wäre.',
            'Das Beispiel verwendet denselben Produkt-Feed wie /xml/to-json wieder, sodass du die beiden Ausgaben direkt vergleichen kannst: dieselben @sku- und #text-Schlüssel, nur als YAML-Zuordnungen statt als JSON-Objekte geschrieben.',
        ],
        mapping: [
            {
                heading: 'Attribute und Text folgen exakt der XML-zu-JSON-Konvention',
                body: [
                    "@sku: SKU-100 und #text: '129.90' unten sind dieselben @-Präfix-Attribut- und #text-Inhaltsschlüssel, die auf /xml/to-json dokumentiert sind, nur in YAMLs Schlüssel: Wert-Syntax statt JSONs \"Schlüssel\": \"Wert\" gerendert. Die Zitierung auf der YAML-Seite folgt der üblichen YAML-Regel: '@sku' wird zitiert, weil ein mit @ beginnender Schlüssel es braucht, und '129.90' wird zitiert, damit es ein String bleibt, statt als Zahl zurückgelesen zu werden.",
                ],
            },
            {
                heading: 'Wiederholte Elemente werden zu einer YAML-Sequenz',
                body: [
                    'Zwei Geschwisterelemente <product> werden zu einem product:-Schlüssel, der eine YAML-Sequenz enthält (- @sku: ... / - @sku: ...) — der Array-Schritt geschieht während des XML-Parsens, genau wie auf /xml/to-json; nur der letzte Serialisierungsschritt unterscheidet sich.',
                ],
            },
            {
                heading: 'Zahlen aus XML bleiben im YAML zitierte Strings',
                body: [
                    'Das obige 129.90 kommt als der zitierte YAML-String \'129.90\' heraus, nicht als die nackte Zahl 129.9 — weil es von Anfang an nie eine Zahl war. XML-Text sind immer Zeichen (siehe die Zuordnung von /xml/to-json dafür, warum dieser Konverter nichts anderes vermutet), sodass der YAML-Schritt einen String zum Serialisieren hat und ihn genauso zitiert, wie er jeden String zitieren würde, der zufällig numerisch aussieht.',
                ],
            },
        ],
        limitations: [
            'Jede Einschränkung von /xml/to-json gilt hier zuerst, noch bevor YAML überhaupt ins Spiel kommt: Gemischter Inhalt verliert die Reihenfolge, Namensräume werden als wörtliche String-Präfixe behandelt, Kommentare werden verworfen, und jeder XML-Textwert wird zu einem String, statt als Zahl oder Boolean geparst zu werden.',
        ],
        faq: [
            {
                q: 'Ist dies eine andere Konvertierung als XML zu JSON?',
                a: 'Nein — es parst das XML mit genau denselben Regeln und serialisiert das Ergebnis dann als YAML statt als JSON. Jede Zuordnungsregel und Einschränkung wird mit /xml/to-json geteilt.',
            },
            {
                q: "Warum werden manche Schlüssel in der YAML-Ausgabe zitiert, wie '@sku'?",
                a: 'YAML verlangt das Zitieren eines einfachen Skalars, der sonst mehrdeutig wäre — ein mit @ beginnender Schlüssel ist ein solcher Fall. Das ist eine YAML-Syntaxanforderung, nichts, was dieser Konverter zusätzlich hinzufügt.',
            },
            {
                q: 'Wird mein XML irgendwohin hochgeladen?',
                a: 'Nein. Sowohl der Parsing-Schritt als auch die YAML-Serialisierung laufen in deinem Browser.',
            },
        ],
    },
};
