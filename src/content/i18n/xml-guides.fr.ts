import type { XmlGuideSlug, XmlGuideTranslation } from '../xml-guides';

/** Traductions françaises pour /xml/<slug>. Voir xml-guides.ts pour les champs acceptés. */
export const XML_TRANSLATIONS_FR: Partial<Record<XmlGuideSlug, XmlGuideTranslation>> = {
    minify: {
        h1: 'Minifieur XML',
        tagline: "Réduit les espaces entre les balises avec le Mode Compact, sans toucher aux CDATA ni aux commentaires.",
        intro: [
            "Le Mode Compact, l'interrupteur à côté de Charger l'exemple ci-dessous, supprime les espaces qu'un embellisseur ajoute entre les balises — le saut de ligne et l'indentation après une >, avant la < suivante. Il le fait avec une règle étroite plutôt qu'une réécriture complète consciente du XML : seuls les espaces situés strictement entre deux balises sont touchés. Les espaces à l'intérieur du contenu propre d'un nœud texte, à l'intérieur d'une valeur d'attribut, ou à l'intérieur d'une section CDATA sont laissés exactement tels quels, car ces espaces peuvent faire partie des données plutôt que de la mise en forme.",
            "L'exemple en forme de SOAP ci-dessous est chargé dans l'éditeur au-dessus. Activez le Mode Compact pour le voir se réduire de la forme embellie à la ligne unique montrée ici — une réduction de 18 % sur cet exemple, calculée de la même façon pour ce que vous collez.",
        ],
        sections: [
            {
                heading: 'Ce qui reste intact, et pourquoi c\'est le comportement par défaut sûr',
                body: [
                    "Un commentaire (<!-- ... -->) et une section CDATA (<![CDATA[ ... ]]>) peuvent tous deux contenir légitimement les caractères < et > en tant que données, pas en tant que balisage — un bloc CDATA est exactement la façon d'intégrer un extrait de HTML ou de JavaScript à l'intérieur du XML sans l'échapper. La règle de réduction des espaces ici ne correspond qu'à une > littérale immédiatement suivie d'un espace et d'une < littérale, donc elle n'atteint jamais l'intérieur de l'une ou l'autre construction pour réécrire ce qui est, sémantiquement, une chaîne.",
                ],
            },
            {
                heading: 'Le contenu mixte est généralement sûr, à une exception réelle près',
                body: [
                    "Le XML de type prose — un élément dont le texte et les balises enfants sont entrelacés, comme <p>Préchauffez le four à <b>220</b> degrés.</p> — survit à la minification sans changement dès lors qu'un texte réel touche la limite de la balise d'au moins un côté, ce qui couvre l'immense majorité des documents réels.",
                    "Le seul cas où cela pose problème est délibéré : un contenu constitué uniquement d'espaces sous xml:space=\"preserve\" — un élément dont tout l'intérêt est que ses espaces comptent et il n'y a pas d'autre contenu auquel les rattacher. Là, un élément comme <code xml:space=\"preserve\">   </code> perd entièrement ses trois espaces, car pour cette règle ils sont identiques à de l'indentation de mise en forme. Ceci est répertorié dans les Limites connues ci-dessous car c'est un cas réel et démontré, pas hypothétique.",
                ],
            },
            {
                heading: 'Ce que le Mode Compact ne fait pas',
                body: [
                    "Il ne touche pas aux espaces à l'intérieur d'une balise elle-même — les espaces supplémentaires entre les attributs, comme <a   b=\"1\"    c=\"2\" />, sont laissés tels qu'écrits, car les réduire risquerait de ressembler à un type d'édition différent de « supprimer la mise en forme ». Il ne supprime pas non plus les commentaires ni les instructions de traitement ; si vous voulez que ceux-ci soient aussi retirés, c'est une transformation séparée et plus invasive que cet interrupteur n'effectue pas.",
                ],
            },
        ],
        limitations: [
            'Un nœud texte constitué uniquement d\'espaces à l\'intérieur d\'un élément marqué xml:space="preserve" est réduit comme n\'importe quel autre espace entre balises, même s\'il est censé être préservé. C\'est une limite réelle et vérifiée — <code xml:space="preserve">   </code> devient <code xml:space="preserve"></code> — pas un cas limite hypothétique.',
            "L'espacement des attributs, les commentaires et les instructions de traitement sont laissés exactement tels qu'écrits ; si votre document a un espacement redondant à l'intérieur d'une balise, cet interrupteur ne le supprimera pas.",
        ],
        faq: [
            {
                q: 'La minification va-t-elle casser une section CDATA ?',
                a: "Non. Le contenu CDATA n'est jamais touché, y compris les chevrons à l'intérieur — la règle ne correspond qu'aux espaces situés strictement entre une > et une < au niveau de la balise, jamais à l'intérieur des délimiteurs CDATA.",
            },
            {
                q: 'Est-ce sûr pour les documents avec du texte et des balises mélangés, comme du XML façon HTML ?',
                a: "Dans presque tous les cas, oui — tant qu'il y a du texte réel à côté de la limite de la balise. La seule exception documentée est un élément xml:space=\"preserve\" ne contenant que des espaces, répertorié dans les Limites connues.",
            },
            {
                q: 'La minification économise-t-elle autant que le ferait déjà le gzip ?',
                a: "Moins que ne le suggère le nombre brut d'octets, si la réponse est déjà compressée — gzip gère déjà efficacement les espaces répétés. Minifier compte le plus pour les charges utiles non compressées, comme certaines requêtes SOAP et appels de service internes.",
            },
            {
                q: 'Mon XML est-il envoyé quelque part ?',
                a: "Non. La mise en forme et la minification s'exécutent toutes deux dans votre navigateur. Rien n'est téléversé, ce qui compte puisque les charges utiles XML comme l'exemple SOAP ci-dessus portent souvent des noms de services internes.",
            },
        ],
    },

    validate: {
        h1: 'Validateur XML',
        tagline: "Vérifiez la bonne formation avec l'analyseur XML natif du navigateur — et sachez ce que cela ne couvre pas.",
        intro: [
            "Cet outil valide le XML avec l'analyseur natif du navigateur — DOMParser, qui interprète votre entrée en tant que text/xml — plutôt qu'un vérificateur séparé écrit sur mesure. Si l'analyseur du navigateur accepte le document, l'outil le signale comme valide ; si l'analyseur signale un nœud parsererror, c'est ce qui déclenche l'indicateur rouge ⚠ à côté de l'onglet XML Original.",
            "Les exemples ci-dessous sont des façons courantes dont du XML réel se brise. Plutôt que de citer le texte d'erreur d'un navigateur spécifique — la formulation de DOMParser diffère entre Chromium, Firefox et WebKit, donc une chaîne exactement correcte dans l'un est trompeuse dans un autre — chacun nomme la règle de bonne formation qu'il enfreint, laquelle est identique dans tout analyseur conforme même quand la formulation de l'erreur ne l'est pas.",
        ],
        invalidExamples: [
            {
                label: 'Balise fermante non correspondante',
                rule: "Chaque balise ouvrante doit correspondre à une balise fermante avec un nom identique, sensible à la casse. <book> a été ouverte et </books> a été fermée — un nom différent — donc le document n'est pas bien formé.",
            },
            {
                label: "Valeur d'attribut non citée",
                rule: "Les valeurs d'attribut doivent être entre guillemets, soit \" soit '. Contrairement au HTML, le XML n'a pas de raccourci pour une valeur non citée — c'est l'une des ruptures les plus courantes quand du XML est édité à la main par quelqu'un habitué au HTML.",
            },
            {
                label: 'Plus d\'un élément racine',
                rule: "Un document XML bien formé a exactement un élément racine contenant tout le reste. Deux éléments frères sans rien pour les envelopper ne constituent pas un document — enveloppez-les dans un parent commun.",
            },
            {
                label: 'Une & nue dans le contenu texte',
                rule: '& démarre toujours une référence d\'entité (&amp;, &#38;, une entité personnalisée) pour un analyseur XML, donc une esperluette littérale dans le contenu texte doit être écrite &amp;. Ceci est invisible en texte brut mais casse l\'analyse immédiatement.',
            },
        ],
        sections: [
            {
                heading: 'Bien formé versus valide : deux questions différentes',
                body: [
                    "Un document peut être parfaitement bien formé — chaque balise fermée, correctement imbriquée, une seule racine — tout en ayant la mauvaise forme pour ce qu'attend un consommateur : un élément requis manquant, un attribut au mauvais endroit, un élément enfant qui ne devrait pas être là. Cette seconde question, plus stricte, est la validité de schéma, vérifiée par rapport à une DTD ou un XSD, et c'est un travail différent de ce que fait cet outil.",
                    "Cette distinction compte car « mon validateur XML dit que c'est bon » et « mon client SOAP le rejette » peuvent être deux affirmations vraies sur le même document quand le problème est la forme du schéma plutôt que la syntaxe. Cet outil répond à la première question ; un validateur de schéma, vérifié par rapport à la DTD ou au XSD spécifique qu'attend votre système, répond à la seconde.",
                ],
            },
            {
                heading: "Pourquoi la formulation exacte de l'erreur est laissée non spécifiée ici",
                body: [
                    "DOMParser est une API de navigateur réelle et en production, mais son rapport d'erreurs n'a jamais été standardisé en détail — l'analyseur XML de chaque moteur (dérivé de libxml2 pour certains, un analyseur maison pour d'autres) écrit son propre texte de message pour le même problème sous-jacent. Plutôt que de publier la formulation d'un navigateur comme si elle était universelle, la règle que chaque exemple enfreint est décrite directement ; cette règle est identique partout, ce que la phrase spécifique qui la décrit n'est pas.",
                ],
            },
        ],
        limitations: [
            "La validation ici vérifie uniquement la bonne formation — les règles syntaxiques génériques du XML. Elle ne vérifie pas un document par rapport à une DTD ou un schéma XSD, donc un document bien formé avec de mauvais éléments, de mauvais attributs, ou une structure incorrecte pour votre format spécifique sera quand même signalé comme valide.",
            "Le message d'erreur exact affiché dépend du navigateur que vous utilisez, puisque le texte d'erreur de DOMParser n'est pas standardisé entre les moteurs. La règle enfreinte est cohérente ; la phrase qui la décrit ne l'est pas.",
        ],
        faq: [
            {
                q: '« Bien formé » signifie-t-il que mon XML correspond au schéma attendu par mon API ?',
                a: "Non — ce sont des vérifications différentes. Bien formé signifie que les balises sont correctement imbriquées et fermées. Que les éléments et attributs correspondent à ce qu'attend une API ou un format spécifique relève de la validation de schéma, par rapport à une DTD ou un XSD, que cet outil n'effectue pas.",
            },
            {
                q: 'Pourquoi une & littérale est-elle rejetée alors qu\'elle ressemble à du texte ordinaire ?',
                a: "Parce que & démarre toujours une référence d'entité pour un analyseur XML, que ce soit voulu ou non. Écrivez &amp; pour une esperluette littérale dans le contenu texte.",
            },
            {
                q: "Un document peut-il avoir plus d'un élément racine ?",
                a: "Non. Un document XML bien formé a exactement un élément contenant tout le reste. Deux éléments frères de premier niveau ont besoin d'un parent commun qui les enveloppe.",
            },
            {
                q: 'Mon XML est-il téléversé pour être vérifié ?',
                a: "Non. La validation s'exécute via le propre DOMParser de votre navigateur, localement — rien n'est envoyé nulle part.",
            },
        ],
    },
};
