import type { DialectSlug, DialectGuideTranslation } from '../sql-dialects';

/** French translations for /sql/<dialect>. See sql-dialects.pt.ts for the pattern. */
export const DIALECT_TRANSLATIONS_FR: Partial<Record<DialectSlug, DialectGuideTranslation>> = {
    postgresql: {
        h1: 'Formateur PostgreSQL',
        tagline: 'Casts, opérateurs JSONB et jointures LATERAL, formatés sans les couper en deux.',
        intro: [
            "Formater du PostgreSQL n'a rarement à voir avec la liste du SELECT. La difficulté vient du fait que Postgres a accumulé une série d'opérateurs qui ressemblent à de la ponctuation ordinaire : :: pour les casts, -> et ->> pour l'accès JSON, @> pour le confinement, ?| pour l'existence de clé. Un formateur qui tokenise naïvement finit par couper ces opérateurs en deux, ou confond les deux-points de tête avec un marqueur de paramètre nommé et casse la ligne au mauvais endroit.",
            "Cette page exécute le formateur avec la grammaire PostgreSQL sélectionnée et la syntaxe des paramètres réglée sur nommée (:nom) plus numérotée ($1), ce qu'utilisent le protocole filaire de Postgres et la plupart des pilotes. L'exemple ci-dessous est chargé dans l'éditeur ci-dessus, vous pouvez donc changer les options et voir la même requête se reformater.",
        ],
        quirks: [
            {
                heading: "L'opérateur de cast :: face aux paramètres :nommés",
                body: [
                    "PostgreSQL utilise :: pour le casting et : pour introduire un paramètre nommé, ce qui donne deux significations au même caractère. Un formateur configuré pour un dialecte où : n'est qu'un marqueur de paramètre lira les deux-points de tête de o.total::numeric comme le début d'un placeholder et cassera l'expression.",
                    "Sélectionner la grammaire PostgreSQL indique à l'analyseur que :: se lie comme un opérateur de cast unique, tandis que :nom et $1 restent des placeholders. Les casts restent collés à leur expression, comme dans la ligne (c.profile -> 'prefs' ->> 'locale')::TEXT ci-dessus.",
                ],
            },
            {
                heading: 'Les opérateurs JSONB, y compris la famille ?',
                body: [
                    "Postgres expose l'accès JSON via des opérateurs plutôt que des fonctions : -> renvoie du jsonb, ->> renvoie du texte, #> et #>> prennent un tableau de chemin, et @> teste le confinement. Ils sont traités comme des opérateurs et gardent donc leurs opérandes sur la même ligne quand la largeur d'expression le permet.",
                    "Les opérateurs d'existence méritent une mention spéciale. ? teste une clé de premier niveau, ?| teste n'importe quelle clé d'un tableau et ?& les teste toutes — et ? est aussi le placeholder positionnel utilisé par JDBC et plusieurs autres pilotes. Avec la grammaire PostgreSQL sélectionnée, ils sont interprétés comme des opérateurs :",
                ],
            },
            {
                heading: 'Les corps de fonction en dollar-quote sont laissés intacts',
                body: [
                    "Un corps PL/pgSQL écrit entre $$ ou $tag$ est, pour l'analyseur SQL, un unique et long littéral de chaîne. Le formateur le préserve exactement plutôt que de le réindenter, ce qui est le comportement sûr — reformater l'intérieur d'une chaîne changerait la valeur stockée dans le catalogue.",
                    "En pratique, cela signifie que les instructions CREATE FUNCTION ressortent avec le SQL environnant formaté et le corps intact sur une seule ligne. Si vous voulez que le corps lui-même soit formaté, formatez-le séparément comme un bloc autonome et recollez-le.",
                ],
            },
            {
                heading: 'FILTER, LATERAL et autres clauses qui s\'imbriquent',
                body: [
                    "COUNT(*) FILTER (WHERE ...) place une clause WHERE complète à l'intérieur d'un appel d'agrégation, et LEFT JOIN LATERAL place une sous-requête complète à l'intérieur d'une jointure. Les deux sont développés comme des blocs imbriqués, ce qui rend la forme de la requête lisible — on voit d'un coup d'œil que la sous-requête latérale est une recherche du type « top 1 par ligne ».",
                    'ON CONFLICT ... DO UPDATE avec une clause RETURNING est traité de la même façon, y compris les références à la pseudo-table excluded.',
                ],
            },
            {
                heading: 'Le repliement des identifiants : pourquoi Preserve est le bon réglage par défaut',
                body: [
                    'PostgreSQL replie les identifiants non cités en minuscules, donc MyTable et mytable sont le même objet, tandis que "MyTable" entre guillemets doubles est un objet différent. Cela rend la casse des identifiants significative d\'une façon qui ne l\'est pas dans la plupart des dialectes.',
                    "L'option de casse des identifiants utilise donc Preserve par défaut. La changer en Upper ou Lower réécrira aussi les identifiants cités, ce qui peut faire pointer une requête vers une table qui n'existe pas. La casse des mots-clés est un réglage séparé, vous pouvez donc toujours mettre SELECT et FROM en majuscules sans toucher aux noms de votre schéma.",
                ],
            },
        ],
        limitations: [
            "DISTINCT ON (col) est placé sur la ligne après SELECT DISTINCT plutôt qu'à côté. Le résultat est du SQL valide, mais se lit moins bien que le reste.",
            "À l'intérieur d'un corps en dollar-quote, le formateur ne fait aucune modification, y compris la partie finale language plpgsql d'une instruction CREATE FUNCTION, qui reste dans la casse où vous l'avez tapée.",
        ],
        conventions: [
            {
                heading: 'Mots-clés en majuscules, identifiants intacts',
                body: [
                    "Le style Postgres le plus répandu met les mots réservés en majuscules et laisse les noms de tables et de colonnes dans le snake_case avec lequel le schéma a été créé. C'est la configuration par défaut ici : casse des mots-clés, des types de données et des fonctions réglée sur Upper, casse des identifiants sur Preserve.",
                ],
            },
            {
                heading: "Préférez les CTE, en sachant qu'elles ne sont plus des barrières",
                body: [
                    "Découper une requête en blocs WITH se lit bien mieux qu'imbriquer des sous-requêtes sur trois niveaux, et depuis PostgreSQL 12, une CTE simple est intégrée en ligne par le planificateur plutôt que matérialisée, si bien que la lisibilité ne coûte plus un changement de plan. Ajoutez MATERIALIZED explicitement si vous voulez vraiment l'ancien comportement de barrière.",
                    "L'option Lignes entre requêtes contrôle les lignes vides que le formateur place entre les instructions, ce qui garde lisible un script de migration comportant plusieurs instructions.",
                ],
            },
        ],
        faq: [
            {
                q: "Le formatage change-t-il la façon dont PostgreSQL exécute ma requête ?",
                a: "Non. L'analyseur élimine les espaces et replie les identifiants non cités avant la planification, donc le plan d'une requête formatée est identique à celui de la même requête sur une seule ligne. Le formatage est destiné aux personnes qui lisent le code.",
            },
            {
                q: 'Cela va-t-il casser mes identifiants cités en « CamelCase » ?',
                a: "Non, avec les réglages par défaut. La casse des identifiants est réglée sur Preserve, donc les identifiants cités ressortent exactement comme vous les avez écrits. Ne changez ce réglage que si vous êtes certain que votre schéma utilise partout des noms non cités et insensibles à la casse.",
            },
            {
                q: "Peut-il formater le corps d'une fonction PL/pgSQL ?",
                a: "Le corps entre délimiteurs $$ est un littéral de chaîne du point de vue de l'analyseur SQL, il est donc préservé tel quel plutôt que réindenté. Pour formater le corps lui-même, collez uniquement le bloc entre les délimiteurs.",
            },
            {
                q: 'Mes requêtes sont-elles envoyées quelque part ?',
                a: "Non. Le formateur est une bibliothèque JavaScript qui s'exécute dans votre navigateur. Rien n'est téléversé, ce qui permet de coller sans risque une requête contenant des noms de tables et de colonnes de production.",
            },
        ],
    },

    mysql: {
        h1: 'Formateur MySQL & MariaDB',
        tagline: 'Identifiants entre backticks, hints d\'index et LIMIT à deux arguments, préservés exactement.',
        intro: [
            "Le problème récurrent en formatant MySQL, ce sont les identifiants. La liste des mots réservés s'allonge à chaque version — rank, groups, window et system sont devenus réservés en 8.0 — si bien que les schémas réels regorgent de colonnes entre backticks qui n'existent que parce que le nom entrait en collision avec un mot-clé. Un formateur qui traite les backticks comme de la décoration, ou qui applique la casse des mots-clés au texte qu'ils contiennent, produira du SQL qui ne fonctionne plus.",
            "Sélectionner la grammaire MySQL garde intacte la citation par backticks et interprète les clauses propres à ce dialecte : les hints d'index entre la table et la jointure, le LIMIT à deux arguments, et les arguments en forme de clause de GROUP_CONCAT. La requête ci-dessous est chargée dans l'éditeur au-dessus.",
        ],
        quirks: [
            {
                heading: 'Identifiants entre backticks et sensibilité à la casse',
                body: [
                    "La colonne nommée `order` dans l'exemple est le cas courant : un terme métier parfaitement raisonnable qui se trouve être un mot réservé. Les backticks sont la seule chose qui garde cette requête valide, ils sont donc préservés et jamais recasés.",
                    "Cela compte plus en MySQL que dans la plupart des bases de données parce que la sensibilité à la casse des noms de tables dépend du système de fichiers de l'hôte. Sous Linux, Users et users sont des tables différentes ; sous macOS et Windows, généralement pas. Un formateur qui met les identifiants en majuscules fonctionnera silencieusement en développement et échouera en production, c'est pourquoi la casse des identifiants utilise Preserve par défaut ici.",
                ],
            },
            {
                heading: 'LIMIT à deux arguments',
                body: [
                    "MySQL accepte à la fois LIMIT quantité et LIMIT position, quantité. La forme à deux arguments n'a pas d'équivalent en SQL standard — LIMIT 40, 20 signifie sauter 40, renvoyer 20, ce qui est l'ordre inverse de ce que les gens attendent de LIMIT ... OFFSET.",
                    "Le formateur garde les deux arguments sur une seule ligne plutôt que de les séparer à la virgule, car les séparer rendrait une clause déjà confuse encore pire.",
                ],
            },
            {
                heading: 'Les hints d\'index se placent entre la table et la jointure',
                body: [
                    "FORCE INDEX, USE INDEX, IGNORE INDEX et STRAIGHT_JOIN s'attachent à une référence de table, ils apparaissent donc après l'alias et avant le JOIN suivant. Ils sont interprétés comme faisant partie de la référence de table et restent sur sa ligne, ce qui garde la liste des jointures lisible.",
                ],
            },
            {
                heading: 'Fonctions dont les arguments contiennent des clauses',
                body: [
                    "GROUP_CONCAT n'est pas un appel de fonction ordinaire : sa liste d'arguments peut contenir DISTINCT, un ORDER BY complet et un SEPARATOR. C'est pourquoi elle est développée comme un bloc imbriqué, avec l'ORDER BY indenté à l'intérieur de l'appel.",
                ],
            },
            {
                heading: 'ON DUPLICATE KEY UPDATE, ancienne et nouvelle forme',
                body: [
                    "La clause d'upsert est reconnue dans les deux écritures — la forme historique VALUES(col) et l'alias de ligne introduit dans MySQL 8.0.20, qui l'a rendue obsolète. La forme avec alias s'interprète proprement :",
                ],
            },
            {
                heading: 'Trois syntaxes de commentaire, dont un piège',
                body: [
                    "MySQL accepte # jusqu'à la fin de ligne, les blocs /* */, et -- jusqu'à la fin de ligne. Ce dernier a une condition qui surprend : MySQL exige un espace après le double tiret, donc --commentaire n'est pas un commentaire et sera généralement lu comme une soustraction suivie d'un identifiant.",
                    "Les commentaires sont préservés en place. Si un commentaire -- survit au formatage mais que la requête échoue ensuite à l'exécution, vérifiez l'espace manquant.",
                ],
            },
        ],
        limitations: [
            "Dans DATE_SUB(NOW(), interval 30 day), le mot-clé INTERVAL et son unité restent dans la casse où vous les avez tapés, car ils sont interprétés comme faisant partie de l'argument de la fonction plutôt que comme des mots-clés de premier niveau. La requête est valide dans les deux cas.",
        ],
        conventions: [
            {
                heading: 'Ne citez que ce qui a besoin de l\'être',
                body: [
                    "Mettre des backticks autour de chaque identifiant est une habitude héritée des outils graphiques qui les génèrent inconditionnellement. Ce n'est pas faux, mais cela ajoute du bruit — l'exemple ci-dessus cite `users` et `order` et laisse les alias sans backticks, ce qui est le style le plus courant à l'écriture manuelle.",
                ],
            },
            {
                heading: 'MariaDB utilise le même réglage',
                body: [
                    "MariaDB a divergé de MySQL après la version 5.5, mais la syntaxe pertinente pour le formatage — backticks, hints d'index, LIMIT, les styles de commentaire — est partagée. Utilisez le dialecte MySQL pour les requêtes MariaDB.",
                ],
            },
        ],
        faq: [
            {
                q: 'Mettre les mots-clés en majuscules va-t-il casser mes noms de tables sensibles à la casse ?',
                a: "Non. La casse des mots-clés et celle des identifiants sont des réglages indépendants. Le réglage par défaut met SELECT, FROM et JOIN en majuscules tout en laissant chaque nom de table et de colonne exactement comme vous l'avez tapé.",
            },
            {
                q: 'Cela fonctionne-t-il pour MariaDB ?',
                a: "Oui. Sélectionnez le dialecte MySQL. La syntaxe qui affecte le formatage est la même dans les deux.",
            },
            {
                q: 'Pourquoi mon commentaire -- n\'est-il pas traité comme un commentaire ?',
                a: 'MySQL exige un caractère espace après le double tiret. --note est interprété comme une expression ; -- note est un commentaire. C\'est une règle de MySQL, pas un comportement du formateur.',
            },
            {
                q: 'Mon SQL est-il envoyé à un serveur ?',
                a: "Non. Le formatage se produit dans votre navigateur et rien ne quitte votre machine, ce qui permet de coller sans risque des requêtes contenant de vrais noms de schéma.",
            },
        ],
    },

    't-sql': {
        h1: 'Formateur T-SQL pour SQL Server',
        tagline: 'Identifiants entre crochets, opérateurs APPLY, fenêtres et lots GO.',
        intro: [
            "T-SQL comporte plus de syntaxe procédurale qu'aucun autre dialecte répandu, et une bonne partie n'est pas vraiment du SQL — GO est une directive client, les variables de table sont déclarées avec le même @ qui marque un paramètre, et les hints de requête voyagent à la fin d'une instruction entre parenthèses. Bien formater le T-SQL consiste surtout à reconnaître ce qui est une instruction et ce qui est de la décoration.",
            "La requête ci-dessous, chargée dans l'éditeur au-dessus, sollicite les parties qui posent le plus souvent problème : des noms à plusieurs parties entre crochets, un OUTER APPLY corrélé à la ligne externe, et un ROW_NUMBER avec fenêtre utilisant son propre PARTITION BY et ORDER BY.",
        ],
        quirks: [
            {
                heading: 'Identifiants entre crochets et noms à quatre parties',
                body: [
                    "SQL Server cite les identifiants avec des crochets, et un nom pleinement qualifié peut comporter quatre parties : serveur.base.schéma.objet. Les crochets sont préservés et les points entre eux ne sont pas traités comme des opérateurs, donc [dbo].[Customers] reste intact.",
                    "Les guillemets doubles fonctionnent aussi comme délimiteur d'identifiant quand QUOTED_IDENTIFIER est sur ON, ce qui est le réglage par défaut pour la plupart des pilotes. Les deux écritures sont acceptées.",
                ],
            },
            {
                heading: 'CROSS APPLY et OUTER APPLY',
                body: [
                    "APPLY est la jointure latérale de T-SQL : la sous-requête de droite est évaluée une fois par ligne de la table de gauche et peut référencer ses colonnes. CROSS APPLY élimine les lignes externes qui ne produisent rien, OUTER APPLY les garde avec des NULL — la même relation qu'entre INNER et LEFT JOIN.",
                    "La sous-requête est développée comme un bloc imbriqué, ce qui rend la corrélation visible. Dans l'exemple, o.[CustomerID] = c.[CustomerID] à l'intérieur de l'APPLY est ce qui le relie à la ligne externe.",
                ],
            },
            {
                heading: 'Fenêtres',
                body: [
                    "Une clause OVER peut contenir PARTITION BY, ORDER BY et une spécification de fenêtre, ce qui en fait une clause imbriquée dans un élément de select. Chaque partie est placée sur sa propre ligne plutôt que regroupée, car un PARTITION BY mal lu est l'une des façons les plus faciles d'obtenir une réponse fausse qui paraît quand même plausible.",
                    "Les clauses de fenêtre comme ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW restent sur la même ligne que leurs mots-clés.",
                ],
            },
            {
                heading: "GO est un séparateur de lot, pas une instruction",
                body: [
                    "GO est compris par SSMS, Azure Data Studio et sqlcmd, pas par le moteur SQL Server — le client découpe le script à cet endroit et envoie chaque lot séparément. Les scripts contenant GO sont traités correctement : les lots sont formatés indépendamment et le séparateur reste sur sa propre ligne.",
                ],
            },
            {
                heading: 'MERGE',
                body: [
                    "MERGE combine insertion, mise à jour et suppression contre une cible en utilisant une source, avec des branches WHEN MATCHED, WHEN NOT MATCHED BY TARGET et WHEN NOT MATCHED BY SOURCE. Chaque branche commence sur sa propre ligne pour que les trois cas se lisent séparément :",
                ],
            },
            {
                heading: 'Le point-virgule avant WITH',
                body: [
                    "Les scripts commencent souvent une CTE par ;WITH plutôt que WITH. Le point-virgule termine ce qui précédait, car WITH est ambigu — il introduit aussi des hints de table — et SQL Server exige que l'instruction précédente soit terminée quand une CTE suit.",
                    "L'habitude est inoffensive et le formateur l'accepte, mais terminer chaque instruction par un point-virgule la rend inutile, ce qui est la meilleure correction.",
                ],
            },
        ],
        limitations: [
            "TOP (n) WITH TIES n'est pas interprété correctement : WITH est lu comme le début d'une common table expression, et la clause est cassée sur plusieurs lignes en TOP (n) / WITH / ties. L'exemple de cette page utilise donc TOP (3) sans WITH TIES. Si vous avez besoin de WITH TIES, formatez la requête puis corrigez cette seule clause à la main.",
            "Dans une instruction MERGE, le mot-clé USING reste dans la casse où vous l'avez tapé plutôt que d'être mis en majuscules avec les autres mots-clés.",
        ],
        conventions: [
            {
                heading: 'Schémas en PascalCase, casse des identifiants sur Preserve',
                body: [
                    "Les schémas SQL Server utilisent classiquement le PascalCase — CustomerID, OrderDate — et SQL Server compare les identifiants selon le collationnement de la base, généralement insensible à la casse. Preserve reste le bon réglage par défaut : il garde vos noms lisibles et évite les surprises sur la minorité de bases utilisant un collationnement sensible à la casse.",
                ],
            },
            {
                heading: 'Terminez les instructions',
                body: [
                    "Microsoft documente depuis plusieurs versions l'omission du terminateur d'instruction comme obsolète. Terminer chaque instruction par un point-virgule supprime le besoin de l'astuce du point-virgule initial, et permet au formateur de placer des lignes vides entre les instructions de façon fiable.",
                ],
            },
        ],
        faq: [
            {
                q: 'Puis-je coller un script avec des séparateurs GO ?',
                a: "Oui. Les lots sont formatés indépendamment et chaque GO reste sur sa propre ligne. GO est une directive client plutôt que du T-SQL, il est donc transmis tel quel plutôt qu'interprété comme une instruction.",
            },
            {
                q: 'Pourquoi TOP (3) WITH TIES ressort-il cassé ?',
                a: "L'analyseur lit WITH comme le début d'une common table expression. C'est une limitation connue, listée ci-dessus. Tout le reste de la requête se formate normalement, donc la solution habituelle est de corriger ensuite cette seule clause.",
            },
            {
                q: 'Formate-t-il le corps des procédures stockées ?',
                a: "Les instructions à l'intérieur d'une procédure sont formatées comme du T-SQL ordinaire. Les constructions de contrôle de flux comme IF et WHILE sont reconnues, mais le résultat est moins soigné que pour un simple SELECT — le code procédural est le point faible de tout formateur SQL.",
            },
            {
                q: 'Mon T-SQL est-il envoyé à un serveur ?',
                a: "Non. Tout s'exécute dans votre navigateur, donc les requêtes contenant des noms internes de schéma ou d'objet ne quittent jamais votre machine.",
            },
        ],
    },

    'oracle-plsql': {
        h1: 'Formateur Oracle SQL & PL/SQL',
        tagline: "Hints d'optimiseur préservés intacts, requêtes hiérarchiques et jointures héritées avec (+).",
        intro: [
            "Oracle est le dialecte où le formatage peut véritablement changer le comportement, à cause d'une fonctionnalité : les hints d'optimiseur sont écrits sous forme de commentaires. Un formateur qui normalise ou supprime les commentaires supprimera silencieusement /*+ INDEX(...) */ et changera le plan d'exécution d'une requête qui semble pourtant toujours correcte. Préserver les hints exactement est la première exigence pour tout ce qui touche au SQL Oracle.",
            "Au-delà des hints, Oracle porte des décennies de syntaxe accumulée — la notation d'outer join (+) antérieure aux jointures ANSI, CONNECT BY pour les hiérarchies, DUAL, et le mécanisme de q-quote pour les chaînes contenant des apostrophes. La requête ci-dessous, chargée dans l'éditeur au-dessus, en utilise plusieurs à la fois.",
        ],
        quirks: [
            {
                heading: "Les hints d'optimiseur sont des commentaires qui comptent",
                body: [
                    "Un hint s'écrit /*+ ... */ et doit apparaître immédiatement après le mot-clé SELECT, INSERT, UPDATE, DELETE ou MERGE. Placez-le ailleurs et Oracle l'ignore sans erreur, ce qui rend dangereux ici un formateur qui déplace les commentaires.",
                    "Les hints sont préservés à leur position et leur contenu n'est jamais recasé ni reformaté. Dans la sortie ci-dessus, /*+ index(e emp_dept_ix) */ reste juste après SELECT et garde la graphie en minuscules avec laquelle il a été écrit.",
                ],
            },
            {
                heading: "L'outer join hérité avec (+)",
                body: [
                    "Avant que la syntaxe de jointure ANSI ne soit prise en charge, Oracle marquait le côté optionnel d'un outer join avec (+) sur le prédicat de jointure. C'est encore très courant dans le code ancien. d.department_id(+) signifie que la ligne de departments peut être absente — l'équivalent d'un LEFT JOIN depuis employees.",
                    "La notation est préservée. Notez qu'un espace est inséré avant le marqueur, produisant d.department_id (+), qu'Oracle interprète de façon identique.",
                ],
            },
            {
                heading: 'Requêtes hiérarchiques : CONNECT BY, LEVEL, ORDER SIBLINGS BY',
                body: [
                    "Oracle parcourt les structures arborescentes avec START WITH pour choisir les racines et CONNECT BY PRIOR pour décrire la relation parent-enfant, exposant la profondeur via la pseudo-colonne LEVEL. ORDER SIBLINGS BY trie ensuite à l'intérieur de chaque niveau sans casser la hiérarchie.",
                    "Ce sont des clauses de premier niveau, elles sont donc placées à la même indentation que WHERE et GROUP BY plutôt que repliées dans la clause WHERE qu'elles suivent.",
                ],
            },
            {
                heading: 'Littéraux de chaîne en q-quote',
                body: [
                    "Doubler chaque apostrophe dans une chaîne est source d'erreurs, Oracle propose donc une citation alternative : q'[...]' — ou toute autre paire de délimiteurs — rend le contenu littéral. Les délimiteurs et le contenu sont préservés exactement :",
                ],
            },
            {
                heading: 'DUAL, NVL et DECODE',
                body: [
                    "DUAL est la table à une ligne d'Oracle, utilisée chaque fois qu'une expression a besoin d'une clause FROM. NVL est la substitution de nul à deux arguments et DECODE est le conditionnel positionnel antérieur à CASE. Les trois sont traités comme des identifiants et fonctions ordinaires.",
                    'Pour du code nouveau, COALESCE et CASE sont les équivalents portables de NVL et DECODE, avec un comportement légèrement différent concernant la conversion de type et l\'évaluation en court-circuit.',
                ],
            },
        ],
        limitations: [
            "Les blocs PL/SQL sont formatés bien moins finement que les requêtes. Un bloc DECLARE / BEGIN / END est cassé en lignes séparées avec des lignes vides entre les sections plutôt qu'indenté comme une structure imbriquée. Les instructions SQL à l'intérieur d'un bloc se formatent normalement ; la charpente du bloc autour, non.",
            "Dans FETCH FIRST 25 rows ONLY, le mot rows reste en minuscules, car il est interprété comme faisant partie de la clause de limitation de lignes plutôt que comme un mot-clé autonome.",
            "La barre oblique finale qu'utilise SQL*Plus pour exécuter un bloc est une directive client, pas du PL/SQL. Laissez-la en dehors de ce que vous collez.",
        ],
        conventions: [
            {
                heading: 'Préférez les jointures ANSI dans le code nouveau',
                body: [
                    "La notation (+) ne peut pas exprimer un full outer join, ne se combine pas avec la syntaxe de jointure ANSI dans la même requête, et rend difficile de séparer la condition de jointure de la condition de filtre. LEFT JOIN est plus clair et c'est ce qu'Oracle recommande depuis des années. Formater du vieux code en (+) est utile pour le lire ; le convertir est un travail à part.",
                ],
            },
            {
                heading: 'ROWNUM face à FETCH FIRST',
                body: [
                    "Limiter les lignes avec ROWNUM exige une vue en ligne quand on le combine à ORDER BY, car ROWNUM est attribué avant le tri — la source classique des requêtes « top N » qui renvoient les mauvaises N lignes. Oracle 12c a introduit FETCH FIRST n ROWS ONLY, qui trie d'abord et c'est ce qu'utilise l'exemple ci-dessus.",
                ],
            },
        ],
        faq: [
            {
                q: 'Les hints d\'optimiseur sont-ils préservés ?',
                a: "Oui. Les hints restent à leur position immédiatement après le mot-clé de tête et leur contenu n'est pas modifié. C'est le comportement montré dans l'exemple ci-dessus.",
            },
            {
                q: 'Peut-il formater le corps d\'un package ou un grand bloc PL/SQL ?',
                a: "Les instructions SQL internes se formateront, mais la charpente du bloc est mal gérée — c'est listé dans les limitations connues. Pour le code procédural, un IDE avec un formateur adapté au PL/SQL fera mieux.",
            },
            {
                q: 'Dois-je garder la barre oblique finale ?',
                a: "Non. Le / est une instruction SQL*Plus pour exécuter le bloc précédent, cela ne fait pas partie du PL/SQL. Collez l'instruction sans elle.",
            },
            {
                q: 'Mon SQL est-il téléversé quelque part ?',
                a: "Non. Le formatage s'exécute entièrement dans votre navigateur, ce qui compte ici car les requêtes Oracle intègrent souvent des noms de schéma et de la logique métier.",
            },
        ],
    },

    bigquery: {
        h1: 'Formateur SQL BigQuery',
        tagline: 'Noms qualifiés entre backticks, UNNEST, SELECT * EXCEPT et QUALIFY.',
        intro: [
            "Les requêtes BigQuery sont façonnées par deux choses que les autres dialectes n'ont pas : des noms de table à trois parties séparées par des points à l'intérieur d'une seule paire de backticks, et des colonnes qui sont des tableaux de structs plutôt que des scalaires. Les deux changent ce qu'un formateur doit bien traiter — les points à l'intérieur de `project.dataset.table` ne sont pas des opérateurs, et un UNNEST dans la clause FROM est une jointure même s'il ressemble à un appel de fonction.",
            "GoogleSQL a aussi ajouté des clauses qui suppriment des couches entières d'imbrication. QUALIFY filtre sur une fonction de fenêtre sans la sous-requête englobante que le standard exigerait, et SELECT * EXCEPT élimine des colonnes sans lister celles que vous gardez. La requête ci-dessous, chargée dans l'éditeur au-dessus, utilise les deux.",
        ],
        quirks: [
            {
                heading: 'Noms qualifiés entre backticks',
                body: [
                    "Une référence de table BigQuery est `project.dataset.table`, avec les points à l'intérieur de la citation plutôt qu'entre des parties citées séparément. Les identifiants de projet contiennent couramment des tirets — analytics-prod dans l'exemple — ce qui explique exactement pourquoi les backticks sont obligatoires : sans eux, le tiret serait interprété comme une soustraction.",
                    "La référence entière est traitée comme un unique jeton identifiant, elle n'est donc jamais coupée à un point ou à un tiret.",
                ],
            },
            {
                heading: "UNNEST est une jointure, pas un appel de fonction",
                body: [
                    "Quand une colonne est un ARRAY, UNNEST dans la clause FROM l'aplatit en lignes, corrélées à la ligne dont elles proviennent. La virgule qui précède est un CROSS JOIN, ce qui explique que l'exemple se lise FROM table e, UNNEST(e.hits) AS h — une ligne par hit, portant sa session.",
                    "Il est placé sur sa propre ligne dans la liste FROM, au même niveau que la table qu'il développe, ce qui est la représentation honnête de ce qu'il est.",
                ],
            },
            {
                heading: 'SELECT * EXCEPT et * REPLACE',
                body: [
                    "Les tables d'événements larges rendent impraticable le fait de lister chaque colonne, GoogleSQL permet donc de soustraire à la place : * EXCEPT (payload) sélectionne tout sauf cette colonne, et * REPLACE (expr AS col) remplace la valeur d'une colonne en gardant le reste. Les deux sont interprétés comme des modificateurs de l'étoile plutôt que comme des appels de fonction.",
                ],
            },
            {
                heading: 'QUALIFY',
                body: [
                    "Filtrer sur une fonction de fenêtre exige normalement de la calculer dans une sous-requête et de filtrer à l'extérieur, car WHERE s'exécute avant les fonctions de fenêtre. QUALIFY le fait en un seul niveau — l'exemple garde l'événement le plus récent par utilisateur sans SELECT englobant.",
                    "C'est une clause de premier niveau placée aux côtés de WHERE et GROUP BY. QUALIFY exige un WHERE, GROUP BY ou HAVING dans le même bloc de requête, ou une clause WINDOW.",
                ],
            },
            {
                heading: 'Tables génériques et _TABLE_SUFFIX',
                body: [
                    "Un * final dans un nom de table correspond à chaque table partageant ce préfixe, et la pseudo-colonne _TABLE_SUFFIX contient la partie qui a correspondu — la façon standard de parcourir un export partitionné par date. Filtrer sur _TABLE_SUFFIX est ce qui empêche la requête de lire chaque fragment, cela appartient donc à la clause WHERE plutôt qu'à un filtre ultérieur.",
                    "SAFE_CAST et le préfixe de fonction SAFE. renvoient NULL plutôt que de générer une erreur sur une entrée invalide, ce qui compte quand les données sont du JSON fourni par l'utilisateur. Les deux sont reconnus comme une syntaxe de fonction ordinaire.",
                ],
            },
        ],
        limitations: [
            "Les pseudo-colonnes _table_suffix, _partitiontime et _partitiondate restent dans la casse où vous les avez tapées, car elles sont interprétées comme des identifiants plutôt que des mots-clés. BigQuery accepte n'importe quelle casse pour elles.",
            "Les instructions de script — DECLARE, SET, BEGIN ... END, EXECUTE IMMEDIATE — se formatent bien moins proprement que les requêtes, comme le code procédural dans tous les dialectes.",
        ],
        conventions: [
            {
                heading: 'Le formatage ne change pas le coût d\'une requête',
                body: [
                    "BigQuery facture au nombre d'octets lus, qui dépend des colonnes référencées et des partitions touchées — pas des espaces. Formater une requête ne change jamais son coût. SELECT * si, ce qui est le véritable argument en faveur d'EXCEPT plutôt que de l'étoile quand la table est large.",
                ],
            },
            {
                heading: 'GoogleSQL uniquement',
                body: [
                    "Legacy SQL, le dialecte antérieur à 2016 avec la syntaxe entre crochets [project:dataset.table], est une grammaire différente et n'est pas pris en charge ici. Si votre requête utilise des deux-points et des crochets dans les noms de table, c'est du Legacy SQL et il faut le migrer plutôt que le formater.",
                ],
            },
        ],
        faq: [
            {
                q: 'Le formatage affecte-t-il le coût de ma requête ?',
                a: "Non. Le coût est déterminé par les octets lus — les colonnes référencées et les partitions lues. Les espaces et la casse des mots-clés n'ont d'effet sur aucun des deux.",
            },
            {
                q: 'Prend-il en charge Legacy SQL ?',
                a: "Non, seulement GoogleSQL (anciennement appelé Standard SQL). Legacy SQL utilise une syntaxe de référence de table différente et une grammaire différente.",
            },
            {
                q: 'Les expressions STRUCT et ARRAY sont-elles traitées ?',
                a: "Oui. Les constructeurs STRUCT imbriqués et les appels ARRAY_AGG sont interprétés comme des expressions ordinaires, et UNNEST est reconnu comme faisant partie de la clause FROM.",
            },
            {
                q: 'Ma requête est-elle envoyée à Google ou à un serveur ?',
                a: "Non. Cette page exécute le formateur dans votre navigateur. La requête n'est envoyée nulle part, pas même à BigQuery.",
            },
        ],
    },
};
