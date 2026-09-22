import type { XmlToolSlug, XmlToolGuideTranslation } from '../xml-tools';

/** Traductions françaises pour /xml/<slug> (outils, pas des guides). */
export const XML_TOOL_TRANSLATIONS_FR: Partial<Record<XmlToolSlug, XmlToolGuideTranslation>> = {
    xpath: {
        h1: 'Testeur XPath',
        tagline: "Un évaluateur XPath 1.0 à portée restreinte — chemins, prédicats et tests text()/@nom — au-dessus du propre analyseur XML de ce site.",
        intro: [
            "Un navigateur embarque déjà un moteur XPath 1.0 réel et complet — document.evaluate() — mais il a besoin d'un DOM vivant, qui n'existe que dans un onglet de navigateur, pas pendant la génération de pages en temps de build de ce site ni dans ses tests automatisés. Cet outil fonctionne donc avec son propre évaluateur : un sous-ensemble de XPath 1.0 délibérément restreint qui couvre ce que les gens tapent réellement dans un testeur XPath — chemins de localisation, la poignée de formes de prédicats qui reviennent constamment, et les tests de nœud @nom / text() — construit sur le propre analyseur XML de ce site plutôt que sur la grammaire complète du W3C et sa bibliothèque de fonctions.",
            "L'exemple de librairie ci-dessous est chargé dans l'éditeur au-dessus avec /bookstore/book[@category='children']/title comme expression de départ — changez l'expression et la liste de correspondances ci-dessous se met à jour immédiatement.",
        ],
        examples: [
            {
                explanation: "Les trois éléments <book>, dans l'ordre du document — un simple chemin absolu.",
            },
            {
                explanation: "Chaque <title>, trouvé à n'importe quelle profondeur — le raccourci // effectue une recherche, il n'exige pas un chemin exact.",
            },
            {
                explanation: 'Seulement le livre dont l\'attribut category est exactement "children" — une correspondance.',
            },
            {
                explanation: 'Le premier livre selon la position dans le document — les positions XPath sont indexées à partir de 1, pas de 0.',
            },
            {
                explanation: "Le dernier livre, quel que soit le nombre — last() s'adapte si des livres sont ajoutés ou retirés.",
            },
            {
                explanation: "Le contenu texte de l'élément <price> du premier livre, comme son propre type de correspondance — pas l'élément lui-même.",
            },
            {
                explanation: "Chaque attribut du premier livre — @category et @id — en utilisant l'axe attribut plutôt que le nom d'un attribut spécifique.",
            },
            {
                explanation: "Le parent de chaque <title> — le <book> qui l'englobe — un niveau de .. par niveau écrit.",
            },
            {
                explanation: 'Seulement le <title> dont le texte contient "Potter" comme sous-chaîne — une correspondance partielle, pas exacte.',
            },
            {
                explanation: "Pas du tout une liste de nœuds — un simple nombre, 3, le décompte des éléments correspondants.",
            },
        ],
        sections: [
            {
                heading: 'Les prédicats s\'exécutent en séquence, chacun restreignant ce qui précède',
                body: [
                    "/bookstore/book[@category='cooking'][1] applique deux prédicats : d'abord ne garder que les livres de cuisine, puis prendre le premier de ce qui reste. Chaque [..] filtre le résultat de tout ce qui le précède, de la même façon que des appels enchaînés de .filter() le feraient dans du code — pas des conditions indépendantes toutes vérifiées par rapport à la liste originale.",
                ],
            },
            {
                heading: "@nom et text() lisent l'élément courant, pas ses enfants",
                body: [
                    "book[1]/@category lit le propre attribut category de book[1]. Cela semble évident, mais c'est une vraie distinction par rapport à book[1]/title, qui descend réellement vers un enfant — @ et text() sont leurs propres axes (attribute:: et un test de nœud texte), pas un raccourci pour « regarder à l'intérieur. » Écrire //@category à la place recherche les attributs de chaque descendant, ce qui est une requête véritablement différente et plus large.",
                ],
            },
            {
                heading: "Un chemin avec zéro correspondance n'est pas une erreur",
                body: [
                    "/bookstore/nonexistent s'évalue proprement à zéro correspondance — de la même façon qu'une requête de base de données qui ne correspond à aucune ligne n'est pas une erreur de base de données. Une erreur rouge n'apparaît que pour quelque chose que cet évaluateur ne peut pas du tout analyser ou évaluer, comme un [ non équilibré ou une fonction qu'il n'implémente pas.",
                ],
            },
        ],
        limitations: [
            'Un seul niveau de ".." est parcouru par ".." écrit — //title/../.. remonte correctement de deux niveaux car deux ".." sont écrits, mais cet évaluateur n\'a aucun moyen de remonter plus loin que le nombre de ".." réellement présents dans l\'expression (ce qui correspond à la vraie sémantique XPath ; il n\'y a pas de raccourci pour « remonter de N niveaux » autre qu\'écrire ".." N fois).',
            "Une balise préfixée par un espace de noms comme soap:Body est comparée comme la chaîne littérale \"soap:Body\", non résolue par rapport à sa déclaration xmlns — la même simplification que fait le convertisseur XML vers JSON de ce site, pour la même raison : la résolution consciente des espaces de noms est un problème sensiblement plus vaste que ce dont la plupart des tests XPath ont réellement besoin.",
            "L'opérateur d'union (|), les axes following/preceding, et la majeure partie de la bibliothèque de fonctions XPath au-delà de contains() et count() ne sont pas implémentés — une expression qui les utilise échoue à l'analyse avec une erreur claire plutôt que d'être mal interprétée silencieusement.",
        ],
        faq: [
            {
                q: "Pourquoi ne pas simplement utiliser le support XPath intégré du navigateur ?",
                a: "document.evaluate() a besoin d'un DOM vivant, qui n'existe que dans un onglet de navigateur — il ne peut pas s'exécuter pendant la génération de pages en temps de build de ce site ni dans ses tests automatisés, qui ont tous deux besoin exactement de la même logique d'évaluation que celle utilisée par l'outil interactif. Cet évaluateur fonctionne de façon identique partout.",
            },
            {
                q: "Que se passe-t-il si mon expression utilise une syntaxe que cela ne prend pas en charge ?",
                a: "Vous obtenez une erreur d'analyse claire nommant ce qui ne va pas, plutôt qu'un résultat silencieusement erroné. L'opérateur d'union, la plupart des axes au-delà de child/descendant-or-self/self/parent, et la plupart des fonctions au-delà de contains() et count() entrent dans cette catégorie — voir les Limites connues.",
            },
            {
                q: 'Les positions sont-elles indexées à partir de 0 ou de 1 ?',
                a: "Indexées à partir de 1, comme le vrai XPath : [1] est la première correspondance, pas la deuxième. C'est une source fréquente d'erreurs de décalage pour quiconque est habitué aux langages indexés à partir de 0.",
            },
            {
                q: 'Mon XML est-il envoyé quelque part ?',
                a: "Non. L'analyse et l'évaluation s'exécutent toutes deux dans votre navigateur.",
            },
        ],
    },
};
