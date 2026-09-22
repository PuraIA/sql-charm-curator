import type { SqlToolSlug, SqlToolGuideTranslation } from '../sql-tools';

/** Traductions françaises pour /sql/<slug> (outils, pas des dialectes). */
export const SQL_TOOL_TRANSLATIONS_FR: Partial<Record<SqlToolSlug, SqlToolGuideTranslation>> = {
    diff: {
        h1: 'Diff SQL',
        tagline: "Formate d'abord les deux requêtes de la même façon, pour que seul le vrai changement apparaisse dans le diff.",
        intro: [
            "Comparer deux requêtes SQL en texte brut ne montre presque jamais ce qui a réellement changé : une version avec des mots-clés en minuscules, l'autre en majuscules ; une repliée à 80 caractères, l'autre à 120 — rien de tout cela n'est un vrai changement, mais un diff au niveau du texte ne peut pas distinguer « reformaté » de « réécrit ». Cet outil fait passer les deux requêtes par exactement la même passe de sql-formatter — même dialecte, même casse, même indentation — avant de les comparer ligne par ligne, si bien qu'un reformatage produit une paire *identique*, et le diff est vide. Ce qui reste après cela est le changement qui compte.",
            "L'exemple ci-dessous est chargé dans l'éditeur au-dessus : une requête gagne un filtre WHERE et un ORDER BY / LIMIT pour la pagination. Les deux requêtes sont formatées dans le même style, donc le diff ci-dessous isole exactement ces ajouts — pas une seule ligne de bruit venant du reformatage lui-même.",
        ],
        sections: [
            {
                heading: 'Le diff est au niveau des lignes, calculé de la même façon que `diff` en calcule un',
                body: [
                    "Ce n'est pas une comparaison naïve ligne par ligne, qui ferait qu'une seule ligne insérée au milieu donne l'impression que toutes les lignes suivantes ont changé. Il implémente l'algorithme du plus court script d'édition de Myers — le même algorithme derrière l'utilitaire Unix diff et git diff — qui trouve l'ensemble minimal d'ajouts et de suppressions de lignes qui transforme la requête Avant en la requête Après.",
                    "Dans l'exemple, la nouvelle clause WHERE et la nouvelle clause ORDER BY / LIMIT sont les seules lignes marquées comme modifiées ; chaque ligne qui existe dans les deux requêtes, y compris celles après le point d'insertion, reste non marquée.",
                ],
            },
            {
                heading: "Formater d'abord est ce qui rend le diff pertinent",
                body: [
                    "Les deux requêtes sont formatées avec le dialecte et les options sélectionnés ci-dessus avant toute comparaison. Collez exactement la même requête dans les deux cases, dans le style que vous aviez originellement écrit, et le diff ne montrera rien — ce qui est la bonne réponse, et le moyen le plus rapide de confirmer qu'un changement que vous avez fait était purement cosmétique.",
                ],
            },
            {
                heading: "Quand une requête ne parvient pas à se formater",
                body: [
                    "Si une requête ne s'analyse pas correctement sous le dialecte sélectionné, cet outil se rabat de la même façon que le Formateur SQL : un jeu d'options réduit, puis une passe SQL générique, avant d'abandonner et de signaler une erreur. Un diff a quand même besoin que les deux côtés soient passés par le même chemin de repli pour être pertinent, donc si un côté atteint le repli générique et pas l'autre, de légères différences de formatage issues de ce décalage peuvent apparaître comme du bruit dans le diff.",
                ],
            },
        ],
        limitations: [
            "Le diff est basé sur les lignes, pas sur les tokens : un seul mot changé au milieu d'une longue ligne (un alias renommé, une valeur littérale changée) marque toute la ligne comme supprimée et rajoutée, plutôt que de surligner seulement le mot changé à l'intérieur.",
            "Comparer entre deux dialectes différents est possible — l'outil ne l'empêche pas — mais rarement utile, puisque la même requête peut se formater différemment selon les grammaires de différents dialectes pour des raisons qui n'ont rien à voir avec une modification réelle.",
        ],
        faq: [
            {
                q: 'Pourquoi coller la même requête des deux côtés montre-t-il parfois quand même un diff ?',
                a: "Cela ne devrait pas, et ne le fait pas, tant que les deux côtés s'analysent de la même façon sous le dialecte sélectionné. Si un côté atteint un niveau de repli différent de l'autre — l'un a besoin de la passe générique, l'autre non — les deux peuvent finir formatés légèrement différemment même si l'entrée était identique.",
            },
            {
                q: 'Puis-je comparer des requêtes écrites dans différents dialectes SQL ?',
                a: "L'outil le permet, mais un diff entre deux grammaires différentes reflète généralement des différences de dialecte, pas une vraie modification — il est conçu pour comparer deux versions de la même requête dans le même dialecte.",
            },
            {
                q: 'Compare-t-il des instructions entières ou des lignes individuelles ?',
                a: "Des lignes, après formatage — la même unité qu'utilise git diff pour le code. Un changement à l'intérieur d'une seule ligne (comme une colonne renommée) marque toute cette ligne comme modifiée, pas seulement la partie changée.",
            },
            {
                q: 'Mes requêtes sont-elles envoyées quelque part ?',
                a: "Non. Le formatage et le diff s'exécutent tous deux dans votre navigateur, ce qui compte ici puisque comparer deux versions d'une requête signifie souvent comparer deux versions contenant de vrais noms de tables et de colonnes.",
            },
        ],
    },
};
