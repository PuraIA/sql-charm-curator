import type { XmlGuideSlug, XmlGuideTranslation } from '../xml-guides';

/** Deutsche Übersetzungen für /xml/<slug>. Siehe xml-guides.ts für die zulässigen Felder. */
export const XML_TRANSLATIONS_DE: Partial<Record<XmlGuideSlug, XmlGuideTranslation>> = {
    minify: {
        h1: 'XML-Minifizierer',
        tagline: 'Reduziert Leerraum zwischen Tags mit dem Kompakt-Modus, ohne CDATA oder Kommentare anzurühren.',
        intro: [
            'Der Kompakt-Modus, der Schalter neben Beispiel laden weiter unten, entfernt den Leerraum, den ein hübscher Formatierer zwischen Tags einfügt — den Zeilenumbruch und die Einrückung nach einer > und vor der nächsten <. Er tut dies mit einer engen Regel statt einer vollständigen, XML-bewussten Umschreibung: Nur Leerraum, der strikt zwischen zwei Tags liegt, wird angefasst. Leerraum innerhalb des eigenen Inhalts eines Textknotens, innerhalb eines Attributwerts oder innerhalb eines CDATA-Abschnitts bleibt exakt so, wie er war, weil dieser Leerraum Teil der Daten sein könnte statt der Formatierung.',
            'Das SOAP-förmige Beispiel unten ist oben im Editor geladen. Schalte den Kompakt-Modus um, um zu sehen, wie es von der hübsch formatierten Form zu der hier gezeigten einzelnen Zeile zusammenfällt — eine Reduktion von 18 % bei diesem Beispiel, auf die gleiche Weise berechnet für das, was du einfügst.',
        ],
        sections: [
            {
                heading: 'Was unangetastet bleibt, und warum das die sichere Voreinstellung ist',
                body: [
                    'Ein Kommentar (<!-- ... -->) und ein CDATA-Abschnitt (<![CDATA[ ... ]]>) können beide legitim die Zeichen < und > als Daten enthalten, nicht als Markup — ein CDATA-Block ist genau die Art, wie man ein Stück HTML oder JavaScript in XML einbettet, ohne es zu escapen. Die Leerraum-Reduzierungsregel hier passt nur auf ein literales >, dem unmittelbar Leerraum und ein literales < folgen, sodass sie niemals in eine der beiden Konstruktionen hineinreicht, um das umzuschreiben, was semantisch gesehen eine Zeichenkette ist.',
                ],
            },
            {
                heading: 'Gemischter Inhalt ist meist sicher, mit einer echten Ausnahme',
                body: [
                    'Prosa-artiges XML — ein Element, dessen Text und Kind-Tags verschachtelt sind, wie <p>Ofen auf <b>220</b> Grad vorheizen.</p> — übersteht die Minifizierung unverändert, sofern auf mindestens einer Seite echter Text die Tag-Grenze berührt, was die überwältigende Mehrheit echter Dokumente abdeckt.',
                    'Der eine Fall, in dem das schiefgeht, ist absichtlicher, reiner Leerraum-Inhalt unter xml:space="preserve" — ein Element, dessen ganzer Sinn darin besteht, dass sein Leerraum zählt und es keinen anderen Inhalt gibt, an dem er verankert werden könnte. Dort verliert ein Element wie <code xml:space="preserve">   </code> seine drei Leerzeichen vollständig, weil sie für diese Regel identisch mit Formatierungseinrückung aussehen. Dies wird unten unter Bekannte Einschränkungen aufgeführt, weil es ein echter, nachgewiesener Fall ist, kein hypothetischer.',
                ],
            },
            {
                heading: 'Was der Kompakt-Modus nicht tut',
                body: [
                    'Er rührt keinen Leerraum innerhalb eines Tags selbst an — zusätzliche Leerzeichen zwischen Attributen, wie <a   b="1"    c="2" />, bleiben so, wie sie geschrieben wurden, da ihr Zusammenfallen riskiert, wie eine andere Art von Bearbeitung auszusehen als „Formatierung entfernen“. Er entfernt außerdem keine Kommentare oder Verarbeitungsanweisungen; wenn du auch diese entfernt haben willst, ist das eine separate, invasivere Transformation, die dieser Schalter nicht durchführt.',
                ],
            },
        ],
        limitations: [
            'Ein reiner Leerraum-Textknoten innerhalb eines mit xml:space="preserve" markierten Elements wird wie jeder andere Leerraum zwischen Tags weggelassen, obwohl er erhalten bleiben soll. Dies ist eine echte, verifizierte Einschränkung — <code xml:space="preserve">   </code> wird zu <code xml:space="preserve"></code> — kein hypothetischer Randfall.',
            'Attributabstände, Kommentare und Verarbeitungsanweisungen bleiben exakt so, wie sie geschrieben wurden; wenn dein Dokument überflüssige Abstände innerhalb eines Tags hat, wird dieser Schalter sie nicht entfernen.',
        ],
        faq: [
            {
                q: 'Wird das Minifizieren einen CDATA-Abschnitt zerstören?',
                a: 'Nein. CDATA-Inhalt wird nie angefasst, einschließlich spitzer Klammern darin — die Regel passt nur auf Leerraum, der strikt zwischen einem > und einem < auf Tag-Ebene liegt, niemals innerhalb der CDATA-Begrenzer.',
            },
            {
                q: 'Ist das sicher für Dokumente mit gemischtem Text und Tags, wie HTML-artiges XML?',
                a: 'In fast jedem Fall ja — solange echter Text neben der Tag-Grenze steht. Die eine dokumentierte Ausnahme ist ein reines Leerraum-xml:space="preserve"-Element, aufgeführt unter Bekannte Einschränkungen.',
            },
            {
                q: 'Spart das Minifizieren so viel, wie gzip es ohnehin schon täte?',
                a: 'Weniger, als die rohe Byte-Anzahl vermuten lässt, wenn die Antwort bereits komprimiert ist — gzip behandelt wiederholten Leerraum ohnehin effizient. Minifizieren zählt am meisten bei Nutzlasten, die nicht komprimiert sind, wie manche SOAP-Anfragen und interne Serviceaufrufe.',
            },
            {
                q: 'Wird mein XML irgendwohin gesendet?',
                a: 'Nein. Formatieren und Minifizieren laufen beide in deinem Browser. Es wird nichts hochgeladen, was wichtig ist, da XML-Nutzlasten wie das obige SOAP-Beispiel oft interne Servicenamen tragen.',
            },
        ],
    },

    validate: {
        h1: 'XML-Validator',
        tagline: 'Prüfe die Wohlgeformtheit gegen den eigenen XML-Parser des Browsers — und wisse, was das nicht abdeckt.',
        intro: [
            'Dieses Werkzeug validiert XML mit dem eigenen Parser des Browsers — DOMParser, der deine Eingabe als text/xml parst — statt mit einem separaten, eigens geschriebenen Prüfer. Wenn der Parser des Browsers das Dokument akzeptiert, meldet das Werkzeug es als gültig; markiert der Parser einen parsererror-Knoten, ist das, was den roten ⚠-Indikator neben dem Tab XML Original antreibt.',
            'Die Beispiele unten sind übliche Arten, wie echtes XML zerbricht. Statt den Fehlertext eines bestimmten Browsers zu zitieren — der Wortlaut von DOMParser unterscheidet sich zwischen Chromium, Firefox und WebKit, sodass eine Zeichenkette, die in einem exakt richtig ist, in einem anderen irreführend ist — benennt jedes Beispiel die Wohlgeformtheitsregel, die es verletzt, was in jedem konformen Parser gleich ist, auch wenn der Wortlaut der Fehlermeldung es nicht ist.',
        ],
        invalidExamples: [
            {
                label: 'Nicht übereinstimmendes schließendes Tag',
                rule: 'Jedes öffnende Tag muss durch ein schließendes Tag mit identischem, groß-/kleinschreibungssensitivem Namen erwidert werden. <book> wurde geöffnet und </books> wurde geschlossen — ein anderer Name — sodass das Dokument nicht wohlgeformt ist.',
            },
            {
                label: 'Nicht in Anführungszeichen gesetzter Attributwert',
                rule: 'Attributwerte müssen in Anführungszeichen stehen, entweder " oder \'. Anders als HTML hat XML keine Kurzform für einen nicht in Anführungszeichen gesetzten Wert — dies ist einer der häufigsten Fehler, wenn XML von jemandem, der an HTML gewöhnt ist, von Hand bearbeitet wird.',
            },
            {
                label: 'Mehr als ein Wurzelelement',
                rule: 'Ein wohlgeformtes XML-Dokument hat genau ein Wurzelelement, das alles andere enthält. Zwei Geschwisterelemente ohne etwas, das sie umschließt, sind kein Dokument — umschließe sie mit einem gemeinsamen Elternelement.',
            },
            {
                label: 'Ein nacktes & im Textinhalt',
                rule: '& beginnt für einen XML-Parser immer eine Entitätsreferenz (&amp;, &#38;, eine benutzerdefinierte Entität), sodass ein wörtliches Und-Zeichen im Textinhalt als &amp; geschrieben werden muss. Das ist in reinem Text unsichtbar, zerstört das Parsen aber sofort.',
            },
        ],
        sections: [
            {
                heading: 'Wohlgeformt versus gültig: zwei verschiedene Fragen',
                body: [
                    'Ein Dokument kann vollkommen wohlgeformt sein — jedes Tag geschlossen, korrekt verschachtelt, eine Wurzel — und dennoch die falsche Form für das haben, was ein Konsument erwartet: ein fehlendes erforderliches Element, ein Attribut an der falschen Stelle, ein Kindelement, das dort nicht sein sollte. Diese zweite, strengere Frage ist Schemagültigkeit, geprüft gegen eine DTD oder ein XSD, und das ist eine andere Aufgabe als das, was dieses Werkzeug tut.',
                    'Diese Unterscheidung ist wichtig, weil „mein XML-Validator sagt, es ist in Ordnung“ und „mein SOAP-Client lehnt es ab“ beide wahre Aussagen über dasselbe Dokument sein können, wenn das Problem die Schemaform statt die Syntax ist. Dieses Werkzeug beantwortet die erste Frage; ein Schema-Validator, geprüft gegen die spezifische DTD oder das XSD, das dein System erwartet, beantwortet die zweite.',
                ],
            },
            {
                heading: 'Warum der genaue Fehlerwortlaut hier unspezifiziert bleibt',
                body: [
                    'DOMParser ist eine echte, ausgelieferte Browser-API, aber ihre Fehlerberichterstattung wurde nie im Detail standardisiert — der XML-Parser jeder Engine (bei manchen von libxml2 abgeleitet, bei anderen ein eigener Parser) schreibt seinen eigenen Nachrichtentext für dasselbe zugrunde liegende Problem. Statt den Wortlaut eines Browsers zu veröffentlichen, als wäre er universell, wird die Regel, die jedes Beispiel verletzt, direkt beschrieben; diese Regel ist überall identisch, was der spezifische Satz, der sie beschreibt, nicht ist.',
                ],
            },
        ],
        limitations: [
            'Die Validierung hier prüft nur die Wohlgeformtheit — die generischen XML-Syntaxregeln. Sie prüft ein Dokument nicht gegen eine DTD oder ein XSD-Schema, sodass ein wohlgeformtes Dokument mit falschen Elementen, falschen Attributen oder falscher Struktur für dein spezifisches Format dennoch als gültig gemeldet wird.',
            'Die genaue angezeigte Fehlermeldung hängt davon ab, welchen Browser du verwendest, da der Fehlertext von DOMParser nicht über Engines hinweg standardisiert ist. Die verletzte Regel ist konsistent; der Satz, der sie beschreibt, ist es nicht.',
        ],
        faq: [
            {
                q: 'Bedeutet „wohlgeformt“, dass mein XML dem Schema entspricht, das meine API erwartet?',
                a: 'Nein — das sind verschiedene Prüfungen. Wohlgeformt bedeutet, dass die Tags korrekt verschachtelt und geschlossen sind. Ob die Elemente und Attribute dem entsprechen, was eine bestimmte API oder ein Format erwartet, ist Schemavalidierung, gegen eine DTD oder ein XSD, die dieses Werkzeug nicht durchführt.',
            },
            {
                q: 'Warum wird ein wörtliches & abgelehnt, wenn es wie normaler Text aussieht?',
                a: 'Weil & für einen XML-Parser immer eine Entitätsreferenz beginnt, ob beabsichtigt oder nicht. Schreibe &amp; für ein wörtliches Und-Zeichen im Textinhalt.',
            },
            {
                q: 'Kann ein Dokument mehr als ein Wurzelelement haben?',
                a: 'Nein. Ein wohlgeformtes XML-Dokument hat genau ein Element, das alles andere enthält. Zwei Geschwisterelemente auf oberster Ebene brauchen ein gemeinsames umschließendes Elternelement.',
            },
            {
                q: 'Wird mein XML zur Prüfung hochgeladen?',
                a: 'Nein. Die Validierung läuft über den eigenen DOMParser deines Browsers, lokal — es wird nichts irgendwohin gesendet.',
            },
        ],
    },
};
