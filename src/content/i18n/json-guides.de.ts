import type { JsonGuideSlug, JsonGuideTranslation } from '../json-guides';

/** Deutsche Übersetzungen für /json/<slug>. Siehe json-guides.ts für die zulässigen Felder. */
export const JSON_TRANSLATIONS_DE: Partial<Record<JsonGuideSlug, JsonGuideTranslation>> = {
    minify: {
        h1: 'JSON-Minifizierer',
        tagline: 'Entfernt jedes Byte, das nur für menschliche Augen existiert, geprüft gegen JSON.stringify.',
        intro: [
            'Das Minifizieren von JSON ist bewusst die einfachste Transformation dieser Seite: Das Werkzeug ruft JSON.stringify() auf dem bereits geparsten Wert ohne Einrückungsargument auf, sodass die Leerzeichen verschwinden und sich sonst nichts ändert — dieselben Schlüssel, dieselbe Schlüsselreihenfolge, dieselben Zahlen, derselbe Zeichenketteninhalt. Es gibt keinen separaten Minifizierungsalgorithmus, der falsch sein könnte, weil der eigene Serialisierer der Engine der Minifizierer ist.',
            'Diese Einfachheit ist auch der Grund, warum es diese Seite gibt: Minifizieren lässt sich leicht richtig machen und leicht falsch beurteilen. Das Beispiel unten ist oben im Editor mit ausgewähltem Minifiziert geladen, sodass du dein eigenes JSON einfügen und genau dieselbe Ersetzung daran beobachten kannst.',
        ],
        sections: [
            {
                heading: 'Was tatsächlich entfernt wird',
                body: [
                    'Nur Leerraum, der zwischen strukturellen Token existiert — nach einer {, vor einer }, um einen : oder ein , herum — ist Leerraum, den JSON.stringify() ohne Einrückungsargument nie ausgibt. Es ist kein textscannender Durchlauf über deine Datei; es ist derselbe Codepfad, der jeden anderen JSON.stringify()-Aufruf in der Sprache erzeugt, sodass er keine der Escaping-Fehler hat, die ein handgeschriebener String-Minifizierer einführen könnte.',
                    'Die Schlüsselreihenfolge bleibt exakt so erhalten, wie sie im geparsten Objekt war. JavaScript-Objekte behalten die Einfügereihenfolge für String-Schlüssel bei (mit einer Ausnahme — ganzzahlartige Schlüssel wie "1" oder "42" werden immer zuerst numerisch sortiert, vor allen anderen Schlüsseln, unabhängig davon, wo sie in der Quelle erschienen sind). Diese Umsortierung ist Teil der JavaScript-Spezifikation, nicht etwas, das dieses Werkzeug hinzufügt.',
                ],
            },
            {
                heading: 'Minifiziert ist nicht dasselbe wie Kompakt',
                body: [
                    'Die obige Formatauswahl bietet außerdem Kompakt an, was eine andere, sanftere Transformation ist: JSON.stringify(parsed, null, 1) — ein Leerzeichen Einrückung statt zwei oder vier, aber weiterhin ein Wert pro Zeile. Minifiziert entfernt die Struktur vollständig; Kompakt verkleinert sie nur. Greife zu Kompakt, wenn ein Mensch den Diff noch lesen muss, und zu Minifiziert, wenn nur eine Maschine das Ergebnis verarbeiten wird.',
                ],
            },
            {
                heading: 'Wo Minifizieren tatsächlich Bytes spart',
                body: [
                    'Wenn eine Antwort bereits gzip- oder brotli-komprimiert ausgeliefert wird, verschwindet der größte Teil des Gewinns durch Minifizierung, bevor er das Netzwerk erreicht: wiederholter Leerraum ist genau die Art von Redundanz, die diese Algorithmen bereits gut entfernen. Minifizieren zählt am meisten bei Nutzlasten, die nicht komprimiert sind — manche Webhook-Bodys, lokale Caches, eingebettete Konfigurationsdateien — und um den Aufwand zu reduzieren, den JSON.parse() bei sehr großen Dokumenten leisten muss, da weniger Bytes unabhängig von der Kompression weniger zu scannende Zeichen bedeuten.',
                ],
            },
        ],
        limitations: [
            'Minifizieren ändert nicht die Zahlenformatierung, entfernt keine ungenutzten Felder und kürzt keine Schlüsselnamen — es entfernt nur Leerraum. Wenn du darüber hinaus eine kleinere Nutzlast brauchst, ist das eine Schemaänderung, keine Minifizierungseinstellung.',
            'Bei einem mehrere Megabyte großen Dokument laufen sowohl JSON.parse() als auch JSON.stringify() synchron im Hauptthread. Sehr große Einfügungen können den Tab kurzzeitig unresponsiv machen, während sie laufen; das ist eine Eigenschaft der JSON-Implementierung des Browsers, nichts, was diese Seite obendrauf hinzufügt.',
        ],
        faq: [
            {
                q: 'Ändert Minifizieren die Daten in irgendeiner Weise?',
                a: 'Nein. Jeder Schlüssel, Wert und jedes Array-Element bleibt exakt erhalten. Nur der Leerraum dazwischen wird entfernt.',
            },
            {
                q: 'Was ist der Unterschied zwischen Minifiziert und Kompakt?',
                a: 'Minifiziert entfernt jeglichen Leerraum und erzeugt eine einzige Zeile. Kompakt behält einen Wert pro Zeile bei, aber mit minimaler Einrückung. Verwende Kompakt, wenn ein Mensch es noch lesen muss, Minifiziert, wenn nur eine Maschine es tun wird.',
            },
            {
                q: 'Hilft das, wenn meine API-Antworten bereits gzip-komprimiert sind?',
                a: 'Weniger, als man erwarten könnte. Gzip komprimiert wiederholten Leerraum bereits effizient, sodass Minifizieren vor der Kompression eine geringere zusätzliche Ersparnis bringt, als die obige Byte-Zahl vermuten lässt. Es zählt mehr bei unkomprimierten Nutzlasten.',
            },
            {
                q: 'Wird mein JSON irgendwohin hochgeladen?',
                a: 'Nein. JSON.parse() und JSON.stringify() laufen in deinem Browser. Es wird nichts an einen Server gesendet, was wichtig ist, wenn die Nutzlast echte Kunden- oder Kontodaten enthält.',
            },
        ],
    },

    validate: {
        h1: 'JSON-Validator',
        tagline: 'Sieh genau, welche Regel dein JSON verletzt, mit der eigenen Fehlermeldung des Parsers.',
        intro: [
            'Dieses Werkzeug validiert JSON genau so, wie es jeder JSON.parse()-Aufruf in deinem Browser tut, denn genau das läuft darunter — es gibt keine separate, nachsichtigere Validierungsschicht. Wenn JSON.parse() deine Eingabe akzeptiert, meldet das Werkzeug sie als gültig; wirft es eine Ausnahme, zeigt das Werkzeug deren Meldung neben dem Tab JSON Original an, zusammen mit einem grünen ✓ oder roten ⚠ Indikator.',
            'Die vier Beispiele unten sind echte Eingaben und der echte Fehlertext, den eine V8-basierte Engine (Chrome, Edge und Node.js verwenden alle V8) für jede von ihnen wirft, erzeugt, indem sie tatsächlich durch JSON.parse() geschickt wurden, statt aus dem Gedächtnis beschrieben zu werden. Firefox und Safari verwenden andere JavaScript-Engines und formulieren diese Fehler anders, lehnen aber dieselben Eingaben aus demselben zugrunde liegenden Grund ab.',
        ],
        invalidExamples: [
            {
                label: 'Überzähliges Komma',
                explanation:
                    'JSON kennt kein überzähliges Komma. Anders als bei einem JavaScript-Objektliteral muss auf das Komma vor der schließenden } immer ein weiteres "Schlüssel": Wert-Paar folgen.',
            },
            {
                label: 'Nicht in Anführungszeichen gesetzter Schlüssel',
                explanation:
                    'Jeder Objektschlüssel muss eine in doppelte Anführungszeichen gesetzte Zeichenkette sein. Dies ist in einem JavaScript-Objektliteral gültig, weshalb der Fehler häufig vorkommt, wenn JSON von Hand statt generiert getippt wird.',
            },
            {
                label: 'Ein //-Kommentar',
                explanation:
                    'JSON hat überhaupt keine Kommentarsyntax — weder //, noch /* */. Manche Werkzeuge akzeptieren „JSONC“ (JSON mit Kommentaren) als Eingabeformat, aber das standardmäßige JSON.parse() nicht.',
            },
            {
                label: 'Eine führende Null',
                explanation:
                    'Eine JSON-Zahl darf keine führende Null vor anderen Ziffern haben (01, 007). Dies spiegelt dieselbe Regel bei JavaScript-Zahlenliteralen wider und existiert, um Mehrdeutigkeit mit der Oktalnotation zu vermeiden.',
            },
        ],
        sections: [
            {
                heading: 'Was „gültig“ bedeutet und was nicht',
                body: [
                    'Dieses Werkzeug prüft, dass dein Text wohlgeformtes JSON gemäß RFC 8259 ist — jede Klammer passt, jede Zeichenkette ist in Anführungszeichen, jeder Wert hat die richtige Form. Das ist eine andere, engere Frage als „ist das das JSON, das meine Anwendung erwartet“. Eine Antwort, der ein erforderliches Feld fehlt, oder die eine Zeichenkette sendet, wo dein Code eine Zahl erwartet, ist vollkommen gültiges JSON und besteht diese Prüfung, obwohl sie deine Anwendung trotzdem zum Absturz bringt.',
                    'Diese zweite Klasse von Problemen zu erkennen, erfordert Schemavalidierung — ein JSON-Schema-Dokument oder einen Laufzeit-Typprüfer wie Zod — geprüft gegen die spezifische Form, die du erwartest. Dieses Werkzeug ist die erste, schnelle Prüfung, die vor diesen Schritt gehört, kein Ersatz dafür.',
                ],
            },
            {
                heading: 'Warum die Fehlermeldung spezifisch ist',
                body: [
                    'Ein Validator, der nur „ungültiges JSON“ sagt, zwingt dich, das ganze Dokument mit dem Auge zu durchsuchen. Die Meldung, die dieses Werkzeug zeigt — dieselbe, die JSON.parse() wirft — enthält eine Zeichenposition und in den meisten Engines eine Zeile und Spalte, was meist ausreicht, um direkt zum Fehler zu springen, ohne manuell mit einer bekanntermaßen korrekten Kopie zu vergleichen.',
                ],
            },
        ],
        limitations: [
            'Der genaue Wortlaut der Fehlermeldung ist spezifisch für V8-basierte Engines. Firefox und Safari melden dieselben Verstöße mit anderer Formulierung. Wenn du also einen Bericht eines Nutzers eines dieser Browser untersuchst, erwarte, dass der Meldungstext — nicht das zugrunde liegende Problem — anders ausfällt.',
            'Dies prüft nur die Syntax. Gültiges, aber falsch geformtes JSON (ein fehlendes Feld, eine Zeichenkette statt einer Zahl) wird hier nicht angezeigt; das erfordert Schemavalidierung gegen deine eigene erwartete Struktur.',
        ],
        faq: [
            {
                q: 'Warum wird nur gesagt, dass das JSON ungültig ist, ohne weitere Details?',
                a: 'Das stimmt nicht — wechsle zum Tab Formatiertes JSON (oder fang einfach an zu tippen), und der genaue Parser-Fehler, einschließlich der Zeichenposition, wird angezeigt. Die obigen Beispiele sind genau diese Meldung, verifiziert gegen die tatsächliche Ausgabe von JSON.parse().',
            },
            {
                q: 'Bedeutet „gültig“, dass meine API es akzeptiert?',
                a: 'Es bedeutet, dass das JSON wohlgeformt ist. Ob die spezifischen Felder und Typen dem entsprechen, was eine API erwartet, ist eine separate Frage, die dieses Werkzeug nicht beantwortet — dafür ist Schemavalidierung gegen den Vertrag dieser API nötig.',
            },
            {
                q: 'Kann ich JSON mit Kommentaren darin validieren (JSONC)?',
                a: 'Nicht mit diesem Werkzeug — es prüft gegen standardmäßiges JSON (RFC 8259), das keine Kommentarsyntax hat. Entferne zuerst die Kommentare, wenn du mit einer JSONC-Konfigurationsdatei arbeitest.',
            },
            {
                q: 'Wird mein JSON irgendwohin gesendet, um geprüft zu werden?',
                a: 'Nein. Die Validierung läuft über das eigene JSON.parse() deines Browsers, lokal. Es wird nichts hochgeladen.',
            },
        ],
    },

    'to-typescript': {
        h1: 'JSON-zu-TypeScript-Konverter',
        tagline: 'Verwandelt eine echte API-Antwort in benannte Interfaces — optionale Felder inklusive.',
        intro: [
            'Eine API-Antwort einzufügen und dafür typisierte Interfaces zurückzubekommen, ist eine wirklich andere Aufgabe als JSON zu formatieren, weshalb es einen eigenen Generator bekommt, statt nur ein weiterer Ausgabestil zu sein, der an den Pretty-Printer angeflanscht wird. Er durchläuft den geparsten Wert einmal: Jedes Objekt wird zu einem benannten Interface, Arrays von Objekten werden zu einem einzigen Interface zusammengeführt, und ein Feld, das in manchen (aber nicht allen) Elementen eines Arrays fehlt, wird optional, statt einen separaten Typ pro Element zu erzeugen.',
            'Das Beispiel unten ist oben im Editor mit ausgewähltem JSON → TypeScript geladen. Es ist eine realistische Form — ein Benutzerdatensatz mit einer verschachtelten Adresse, einem Array von String-Tags und einem Array von Bestellungen, bei dem nur eine Bestellung einen trackingCode hat — gewählt, weil sie die drei wichtigen Fälle abdeckt: Verschachtelung, Arrays und uneinheitliche optionale Felder.',
        ],
        sections: [
            {
                heading: 'Wie Verschachtelung zu benannten Interfaces wird',
                body: [
                    'Jedes Objektfeld erhält sein eigenes Interface, benannt nach dem Feld (address wird zu Address, das Element von orders wird zu Order). Das ist beabsichtigt: Ein inline verschachtelter Typ ist schwerer wiederzuverwenden und schwerer im Hover-Tooltip eines Editors zu lesen als ein benannter. Zwei Felder mit exakt derselben Menge an Schlüsseln und Typen — eine Rechnungs- und eine Lieferadresse zum Beispiel — werden als dieselbe Form erkannt und teilen sich ein Interface, statt ein Duplikat zu erzeugen.',
                ],
            },
            {
                heading: 'Arrays von Objekten werden zusammengeführt, nicht aufgezählt',
                body: [
                    'orders ist ein Array, bei dem das erste Element keinen trackingCode hat und das zweite schon. Statt Order und Order2 zu erzeugen, betrachtet der Generator jedes Element im Array, sammelt die Vereinigung jedes Schlüssels, der in irgendeinem von ihnen vorkommt, und markiert einen Schlüssel als optional, wenn er in mindestens einem Element fehlt — genau das, was trackingCode?: string oben ausdrückt. Das spiegelt wider, wie du es selbst von Hand typisieren würdest, nachdem du tatsächlich ein paar Beispielantworten gelesen hast.',
                ],
            },
            {
                heading: 'Arrays mit gemischten Typen werden zu einer Union',
                body: [
                    'Ein Array, dessen Elemente nicht alle vom gleichen Typ sind — [1, "two", 3] — erzeugt (number | string)[], statt einen Typ auszuwählen und die Diskrepanz zu verbergen, oder sich zu weigern, überhaupt etwas zu erzeugen. Ein leeres Array hat nichts, woraus abgeleitet werden könnte, und wird als unknown[] typisiert; verenge es von Hand, sobald du weißt, was das Array enthalten soll.',
                ],
            },
            {
                heading: 'Was er bewusst nicht ableitet',
                body: [
                    'Jede Zeichenkette wird zu string und jede Zahl zu number — es wird nicht versucht zu erkennen, dass ein Feld immer wie ein Datum, eine E-Mail-Adresse oder einer von drei festen Werten aussieht, und es auf eine literale Union oder einen markierten Typ zu verengen. Zuverlässige Verengung würde entweder eine größere Stichprobe als eine einzelne Antwort oder Domänenwissen erfordern, das dieses Werkzeug nicht hat; falsch zu raten wäre schlimmer, als das Feld als string zu belassen.',
                ],
            },
        ],
        limitations: [
            'Eine Beispielantwort ist eine Stichprobe, kein Schema. Ein Feld, das in deiner einzelnen Einfügung zufällig null oder eine ganze Zahl ist, in anderen Antworten aber manchmal eine Zeichenkette oder eine Dezimalzahl ist, wird zu eng typisiert. Teste das generierte Interface gegen einige verschiedene echte Antworten, nicht nur eine.',
            'Generierte Interface- und Eigenschaftsnamen stammen aus deinen JSON-Schlüsseln und werden nicht über identische Feldformen hinaus dedupliziert — zwei unterschiedlich geformte Objekte, die beide von einem Feld namens „data“ stammen, werden beide Data und Data2 genannt, was sich wie „das zweite“ liest statt wie etwas Beschreibendes. Benenne sie um, sobald du weißt, wofür sie stehen.',
        ],
        faq: [
            {
                q: 'Kommt er mit tief verschachteltem JSON zurecht?',
                a: 'Ja — die Verschachtelung hat keine Tiefenbegrenzung. Jedes verschachtelte Objekt wird zu seinem eigenen benannten Interface, egal auf wie vielen Ebenen es erscheint.',
            },
            {
                q: 'Was passiert bei einem Array, das Objekte und Primitive mischt?',
                a: 'Die Objektelemente werden wie üblich zu einem Interface zusammengeführt, die primitiven Elemente steuern ihre eigenen Typen bei, und der Elementtyp des Arrays ist die Vereinigung beider — zum Beispiel (Order | string)[].',
            },
            {
                q: 'Kann ich meinen eigenen Namen für das Wurzel-Interface festlegen?',
                a: 'Das generierte Wurzel-Interface heißt standardmäßig Root, wenn du das JSON im Werkzeug bearbeitest. Diese Seite benennt es nach dem, was das Beispiel darstellt (ApiUser), rein zur besseren Lesbarkeit im Beispiel.',
            },
            {
                q: 'Wird mein JSON an einen Server gesendet, um die Typen zu erzeugen?',
                a: 'Nein. Der Generator läuft in deinem Browser und lädt niemals hoch, was du einfügst, was wichtig ist, da eine echte API-Antwort genau das ist, was du hier einfügen würdest.',
            },
        ],
    },
};
