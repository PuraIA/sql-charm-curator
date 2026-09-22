import type { ConverterGuideTranslation } from '../converter-guides';

/** Traductions françaises pour /json/to-xml, /xml/to-json, /json/to-yaml, /xml/to-yaml. */
export const CONVERTER_TRANSLATIONS_FR: Partial<Record<string, ConverterGuideTranslation>> = {
    'json/to-xml': {
        h1: 'Convertisseur JSON vers XML',
        tagline: 'Attributs avec @, tableaux comme frères répétés — le mappage est explicite, pas deviné.',
        intro: [
            "JSON et XML ne partagent pas de modèle de données, donc tout convertisseur entre les deux s'engage en réalité envers une convention en espérant qu'elle corresponde à ce dont vous avez besoin. La convention de ce convertisseur est petite et explicite : une clé commençant par @ devient un attribut, une clé #text devient du contenu texte, et un tableau devient des éléments frères répétés sous le nom de balise de cette clé — pas un élément enveloppant avec des enfants numérotés, qui est l'autre choix courant et se lit moins bien en pratique.",
            "L'exemple ci-dessous est chargé dans le convertisseur au-dessus. Deux commandes, toutes deux avec un attribut @id, deviennent deux éléments frères <order> plutôt qu'une enveloppe <orders><order>...</order><order>...</order></orders> — la clé du tableau elle-même (order) est déjà le nom de balise répété.",
        ],
        mapping: [
            {
                heading: '@clé devient un attribut',
                body: [
                    "Une clé commençant par @ voit ce préfixe retiré et est attachée à son élément comme attribut, dans l'ordre où elle apparaît dans l'objet. @id: \"1001\" sur un objet de commande devient id=\"1001\" sur cette balise <order>.",
                ],
            },
            {
                heading: '#text devient du contenu texte — utilisable aux côtés des attributs',
                body: [
                    'Un objet JSON ordinaire n\'a nulle part où placer « cet élément a un attribut et aussi du texte » — les objets n\'ont pas de position implicite pour le texte comme le font les éléments XML. #text est la clé explicite pour cela : {"@id": "1", "#text": "hello"} produit <tag id="1">hello</tag>.',
                ],
            },
            {
                heading: 'Les tableaux deviennent des éléments répétés, pas une enveloppe',
                body: [
                    "order: [ {...}, {...} ] produit deux éléments frères <order> — la clé elle-même fournit le nom de balise répété. Un tableau nu sans une telle clé (convertir un tableau JSON directement, sans rien qui l'enveloppe) n'a pas de nom de balise naturel à réutiliser, il se replie donc sur un <item> générique pour chaque entrée à l'intérieur d'un <root> par défaut.",
                ],
            },
            {
                heading: 'null devient un élément vide ; tout autre scalaire devient du texte',
                body: [
                    "Un null JSON n'a pas d'équivalent XML, il devient donc un élément vide autofermant : null -> <key/>. Les nombres et booléens deviennent leur forme chaîne comme texte d'élément — 8080 devient le texte \"8080\" — puisque le texte XML n'est toujours que des caractères.",
                ],
            },
        ],
        limitations: [
            "Une clé JSON qui n'est pas un nom XML valide — espaces, chiffre en tête, la plupart des ponctuations — est réécrite plutôt que rejetée : les caractères invalides deviennent _, et un nom qui commencerait toujours par un chiffre reçoit un _ en tête. Il s'agit d'une transformation visible et testée (2fa devient _2fa), pas silencieuse, mais cela signifie que le nom de balise en sortie n'est pas toujours identique à la clé d'entrée.",
            "Convertir un tableau JSON depuis le XML puis à nouveau vers l'avant n'est pas parfaitement stable quand le tableau contient un mélange d'objets et de valeurs simples — le mappage est conçu autour de tableaux d'une forme cohérente, ce qui couvre l'immense majorité des réponses API réelles et des tableaux de configuration.",
        ],
        faq: [
            {
                q: 'Pourquoi @ pour les attributs plutôt qu\'une autre convention ?',
                a: "Il n'y a pas de norme ici — plusieurs bibliothèques JSON-XML utilisent @, et cela a l'avantage de se trier distinctement des clés ordinaires et d'être sans ambiguïté à l'intérieur d'une clé JSON en texte brut. Ce convertisseur documente son choix exact plutôt que de supposer que c'est le seul raisonnable.",
            },
            {
                q: 'Puis-je convertir un tableau JSON directement, sans rien qui l\'enveloppe ?',
                a: "Oui — il est enveloppé dans un <root> par défaut, chaque élément devenant un <item>, puisqu'un tableau nu n'a pas de clé propre à réutiliser comme nom de balise répété.",
            },
            {
                q: 'La conversion est-elle réversible ?',
                a: "Pour les formes que cette convention vise — objets, attributs, tableaux d'une forme cohérente — oui : reconvertir le résultat avec XML vers JSON reproduit le même JSON, vérifié par les propres tests de ce site. Le contenu mixte texte-et-éléments est le seul cas qui ne l'est pas : voir les propres limites de /xml/to-json pour la raison.",
            },
            {
                q: 'Mon JSON est-il envoyé quelque part ?',
                a: "Non. La conversion s'exécute dans votre navigateur ; rien n'est envoyé à un serveur.",
            },
        ],
    },

    'xml/to-json': {
        h1: 'Convertisseur XML vers JSON',
        tagline: 'Attributs, balises répétées et contenu texte, mappés vers des clés JSON simples.',
        intro: [
            "La partie difficile de la transformation du XML en JSON n'est pas la syntaxe, c'est que le XML porte des informations pour lesquelles JSON n'a pas de place native : les attributs, et le texte qui se trouve à côté d'éléments enfants plutôt que d'être le seul contenu. La règle de ce convertisseur pour les deux est explicite plutôt qu'implicite — voir le mappage ci-dessous — et c'est la même règle que /json/to-xml utilise en sens inverse, donc un aller-retour à travers les deux pages est stable pour les formes que cela couvre.",
            "L'exemple ci-dessous — un petit flux de produits, du genre que pourrait renvoyer une ancienne API interne — est chargé dans le convertisseur au-dessus. Chaque <product> porte un attribut sku et un <price> imbriqué qui a lui-même un attribut currency et du texte : exactement le cas qui nécessite à la fois @ et #text pour être représenté fidèlement.",
        ],
        mapping: [
            {
                heading: 'Les attributs deviennent des clés préfixées par @',
                body: [
                    "sku=\"SKU-100\" sur un élément <product> devient \"@sku\": \"SKU-100\" dans son objet JSON. Le @ garde les attributs visuellement distincts des éléments enfants quand vous lisez le JSON, et c'est ce que /json/to-xml recherche pour reconvertir dans l'autre sens.",
                ],
            },
            {
                heading: 'Un élément avec seulement du texte se réduit à une simple chaîne',
                body: [
                    '<name>Wireless Mouse</name> devient directement "name": "Wireless Mouse" — pas {"#text": "Wireless Mouse"} — car il n\'y a rien d\'autre sur cet élément (pas d\'attributs, pas d\'enfants) à côté de quoi la clé #text devrait se trouver.',
                ],
            },
            {
                heading: "...mais #text apparaît dès qu'il y a aussi un attribut",
                body: [
                    "L'élément <price> ci-dessus a à la fois un attribut et du texte, il ne peut donc pas se réduire à une chaîne nue — il n'y aurait nulle part où placer la devise. Il devient plutôt {\"@currency\": \"BRL\", \"#text\": \"129.90\"}.",
                ],
            },
            {
                heading: "Les balises répétées deviennent un tableau, dans l'ordre du document",
                body: [
                    "Deux éléments <product> sous <products> deviennent un tableau \"product\" avec deux entrées, dans l'ordre où elles sont apparues — pas deux clés séparées et pas fusionnées en un objet. Un seul <product> (sans frères) reste un objet simple, pas un tableau à un élément.",
                ],
            },
            {
                heading: 'Chaque valeur devient une chaîne — délibérément',
                body: [
                    "Le texte XML n'est toujours que des caractères ; le XML lui-même n'a pas de type nombre ou booléen. Le 129.90 ci-dessus reste la chaîne \"129.90\" plutôt que d'être analysé comme le nombre 129,9, ce qui normaliserait aussi silencieusement ce zéro final. Deviner le type serait exactement cela — une supposition — le même choix que fait le convertisseur JSON-vers-TypeScript de ce site, pour la même raison.",
                ],
            },
        ],
        limitations: [
            "Le contenu mixte — texte entrelacé avec des éléments enfants, comme <p>Hello <b>world</b>!</p> — perd l'ordre entre le texte et l'élément : il devient {\"#text\": \"Hello !\", \"b\": \"world\"}, qui ne peut pas distinguer cela de \"!<b>world</b>Hello \". Ce convertisseur est construit pour du XML structuré, en forme de configuration ou d'API, pas du balisage de type prose, et c'est là que cela se voit.",
            "Les espaces de noms XML sont traités comme de simples préfixes de chaîne — soap:Envelope devient la clé JSON \"soap:Envelope\" en tant que texte littéral, non résolu par rapport à sa déclaration xmlns. C'est une limite de portée réelle et délibérée : la résolution consciente des espaces de noms est un problème sensiblement plus vaste que le XML de configuration et de réponse API que vise ce convertisseur.",
            "Les commentaires et instructions de traitement sont abandonnés — ce ne sont pas des données, donc il n'y a pas de clé JSON pour qu'ils deviennent.",
        ],
        faq: [
            {
                q: 'Pourquoi un élément devient-il une simple chaîne et un autre un objet ?',
                a: "Un élément sans attributs et sans enfants se réduit à juste son texte, en tant que chaîne. Un élément avec un attribut, un élément enfant, ou les deux, devient un objet — car une simple chaîne n'a nulle part où attacher cette information supplémentaire.",
            },
            {
                q: 'Que deviennent les commentaires XML ?',
                a: "Ils sont abandonnés. Les commentaires documentent le XML pour un lecteur humain ; ils ne font pas partie des données, donc il n'y a pas de valeur JSON correspondante pour eux.",
            },
            {
                q: 'Gère-t-il les sections CDATA ?',
                a: "Oui — le contenu à l'intérieur de <![CDATA[ ... ]]> est pris tel quel comme texte, sans le réanalyser comme balisage, exactement comme un nœud texte normal.",
            },
            {
                q: 'Mon XML est-il envoyé quelque part ?',
                a: "Non. L'analyse et la conversion s'exécutent toutes deux dans votre navigateur en utilisant le propre analyseur XML de ce site, pas un appel serveur.",
            },
        ],
    },

    'json/to-yaml': {
        h1: 'Convertisseur JSON vers YAML',
        tagline: "Aucune convention à concevoir — YAML est déjà le modèle de données du JSON, juste écrit différemment.",
        intro: [
            "Contrairement à JSON vers XML, cette direction n'a aucune convention à inventer : un mapping YAML est un objet JSON, une séquence YAML est un tableau JSON, et les scalaires de YAML sont les mêmes chaînes, nombres, booléens et null que JSON possède déjà. Convertir consiste vraiment juste à re-sérialiser les mêmes valeurs — ce qui explique aussi pourquoi c'est la seule conversion de ce site sans « limites connues » concernant une information perdue.",
            "L'exemple ci-dessous est un fragment de Deployment Kubernetes — le genre de document pour lequel YAML est constamment utilisé et JSON presque jamais, ce qui est généralement la vraie raison pour laquelle quelqu'un veut cette conversion : éditer des données structurées à la main dans le format que ses outils attendent.",
        ],
        mapping: [
            {
                heading: "L'imbrication devient de l'indentation",
                body: [
                    "Les clés d'un objet JSON deviennent la syntaxe de mapping en bloc de YAML (clé : valeur, indentée sous son parent), et un tableau JSON devient une séquence en bloc (- élément, un par ligne). Il n'y a pas de distinction attribut/texte autour de laquelle concevoir, car aucun des deux formats n'a d'attributs.",
                ],
            },
            {
                heading: "Les chaînes ne sont citées que lorsque YAML les mal-interpréterait sinon",
                body: [
                    "apiVersion: apps/v1 est écrit nu — un scalaire simple non cité — car YAML n'a aucune difficulté à l'analyser comme une chaîne. Une valeur qui ressemble à un nombre, un booléen ou un null YAML (comme le texte \"true\", \"null\", ou \"123\") est citée pour qu'elle revienne comme une chaîne plutôt que d'être réinterprétée comme cet autre type. Une chaîne contenant « : » (deux-points-espace) est citée pour la même raison : non citée, YAML la lirait comme une autre paire clé-valeur plutôt que comme une seule valeur.",
                ],
            },
            {
                heading: "Une chaîne multiligne devient un littéral de bloc, pas une ligne unique échappée",
                body: [
                    "Une chaîne JSON contenant \\n est écrite en utilisant le style littéral de bloc | de YAML — le texte sur ses propres lignes indentées — plutôt que comme une seule ligne citée avec un antislash-n littéral dedans. Elle se lit comme le texte original apparaît réellement, ce qui compte pour tout ce qui ressemble à une description multiligne ou une commande shell intégrée dans une configuration CI.",
                ],
            },
        ],
        limitations: [
            "Aucune spécifique à cette direction : chaque valeur JSON (objet, tableau, chaîne, nombre, booléen, null) a un équivalent YAML direct, donc rien ici n'est une supposition comme le sont un attribut ou un nom de balise répété du côté XML. La seule chose à savoir est générale à YAML, pas à ce convertisseur : un document YAML peut exprimer des choses que JSON ne peut pas (ancres et alias pour des structures répétées, plusieurs documents dans un seul fichier, commentaires) — convertir du JSON en YAML ne produira jamais cela, puisque JSON n'a rien dont cela pourrait provenir.",
        ],
        faq: [
            {
                q: 'Cette conversion est-elle parfois avec perte ?',
                a: "Pas pour ce que JSON lui-même peut représenter. Chaque objet, tableau, chaîne, nombre, booléen et null se mappe directement vers son équivalent YAML sans rien laissant à deviner.",
            },
            {
                q: 'Pourquoi certaines chaînes sont-elles citées et d\'autres non ?',
                a: 'Une chaîne n\'est citée que lorsque la laisser nue changerait sa signification en YAML — par exemple le texte littéral "true" ou "123", qui sinon serait ré-analysé comme un booléen ou un nombre plutôt qu\'une chaîne.',
            },
            {
                q: 'Puis-je convertir un manifeste Kubernetes ou un fichier docker-compose de cette façon ?',
                a: "Oui, pour le sens coller du JSON et obtenir du YAML en sortie — la plupart des outils d'infrastructure acceptent les deux, et cela produit du YAML valide pour tout ce qui a commencé comme du JSON valide.",
            },
            {
                q: 'Mes données sont-elles envoyées quelque part ?',
                a: "Non. La conversion s'exécute dans votre navigateur, ce qui compte ici puisque les configurations Kubernetes et CI contiennent souvent des noms de services internes.",
            },
        ],
    },

    'xml/to-yaml': {
        h1: 'Convertisseur XML vers YAML',
        tagline: 'Passe par la même convention @ / #text que XML vers JSON, puis sérialise en YAML.',
        intro: [
            "Ce sont deux conversions exécutées l'une après l'autre, pas une conversion directe séparée : le XML est analysé dans la même représentation JSON attribut-@ / #text / balise-répétée que produit /xml/to-json, et cette valeur est ensuite écrite en YAML plutôt qu'en JSON. Chaque règle et chaque limite documentée sur /xml/to-json s'applique ici de façon identique — cette page existe parce que « xml vers yaml » est une recherche que quelqu'un tape réellement, pas parce que la conversion sous-jacente est différente en quoi que ce soit.",
            "L'exemple réutilise le même flux de produits que /xml/to-json, vous pouvez donc comparer les deux sorties directement : mêmes clés @sku et #text, juste écrites comme des mappings YAML plutôt que des objets JSON.",
        ],
        mapping: [
            {
                heading: 'Les attributs et le texte suivent exactement la convention XML vers JSON',
                body: [
                    "@sku: SKU-100 et #text: '129.90' ci-dessous sont les mêmes clés d'attribut préfixé par @ et de contenu #text documentées sur /xml/to-json, juste rendues dans la syntaxe clé : valeur de YAML plutôt que \"clé\": \"valeur\" de JSON. La mise entre guillemets côté YAML suit la règle YAML habituelle : '@sku' est cité car une clé commençant par @ en a besoin, et '129.90' est cité pour qu'il reste une chaîne plutôt que d'être relu comme un nombre.",
                ],
            },
            {
                heading: 'Les éléments répétés deviennent une séquence YAML',
                body: [
                    "Deux éléments frères <product> deviennent une clé product: contenant une séquence YAML (- @sku: ... / - @sku: ...) — l'étape de tableau se produit pendant l'analyse XML, exactement comme sur /xml/to-json ; seule l'étape finale de sérialisation diffère.",
                ],
            },
            {
                heading: 'Les nombres provenant du XML restent des chaînes citées dans le YAML',
                body: [
                    "Le 129.90 ci-dessus ressort comme la chaîne YAML citée '129.90', pas le nombre nu 129,9 — car il n'a jamais été un nombre au départ. Le texte XML est toujours des caractères (voir le mappage de /xml/to-json pour la raison pour laquelle ce convertisseur ne devine pas le contraire), donc l'étape YAML a une chaîne à sérialiser, et la cite de la même façon qu'elle citerait toute chaîne qui se trouve ressembler à un nombre.",
                ],
            },
        ],
        limitations: [
            "Chaque limite de /xml/to-json s'applique ici en premier, avant même que YAML n'entre en jeu : le contenu mixte perd l'ordre, les espaces de noms sont traités comme des préfixes de chaîne littéraux, les commentaires sont abandonnés, et chaque valeur texte XML devient une chaîne plutôt que d'être analysée comme un nombre ou un booléen.",
        ],
        faq: [
            {
                q: "S'agit-il d'une conversion différente de XML vers JSON ?",
                a: "Non — elle analyse le XML en utilisant exactement les mêmes règles, puis sérialise le résultat en YAML plutôt qu'en JSON. Chaque règle de mappage et chaque limite est partagée avec /xml/to-json.",
            },
            {
                q: "Pourquoi certaines clés sont-elles citées dans la sortie YAML, comme '@sku' ?",
                a: "YAML exige de citer un scalaire simple qui serait autrement ambigu — une clé commençant par @ en est un exemple. C'est une exigence de syntaxe YAML, pas quelque chose que ce convertisseur ajoute en plus.",
            },
            {
                q: 'Mon XML est-il envoyé quelque part ?',
                a: "Non. L'étape d'analyse et la sérialisation YAML s'exécutent toutes deux dans votre navigateur.",
            },
        ],
    },
};
