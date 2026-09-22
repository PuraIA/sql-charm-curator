import type { JsonGuideSlug, JsonGuideTranslation } from '../json-guides';

/** Traductions françaises pour /json/<slug>. Voir json-guides.ts pour les champs acceptés. */
export const JSON_TRANSLATIONS_FR: Partial<Record<JsonGuideSlug, JsonGuideTranslation>> = {
    minify: {
        h1: 'Minifieur JSON',
        tagline: "Supprime chaque octet qui n'existe que pour les yeux humains, vérifié face à JSON.stringify.",
        intro: [
            "Minifier du JSON est délibérément la transformation la plus simple que ce site effectue : l'outil appelle JSON.stringify() sur la valeur déjà analysée sans argument d'indentation, si bien que les espaces disparaissent et que rien d'autre ne change — mêmes clés, même ordre des clés, mêmes nombres, même contenu de chaîne. Il n'y a pas d'algorithme de minification séparé qui pourrait se tromper, car le sérialiseur du moteur lui-même est le minifieur.",
            "Cette simplicité est aussi la raison d'être de cette page : minifier est facile à faire correctement et facile à juger à tort comme incorrect. L'exemple ci-dessous est chargé dans l'éditeur au-dessus avec Minifié sélectionné, vous pouvez donc coller votre propre JSON et observer exactement la même substitution s'y produire.",
        ],
        sections: [
            {
                heading: 'Ce qui est réellement supprimé',
                body: [
                    "Seuls les espaces qui existent entre des tokens structurels — après une {, avant une }, autour d'un : ou d'une , — sont des espaces que JSON.stringify() n'émet jamais sans argument d'indentation. Ce n'est pas un balayage textuel de votre fichier ; c'est le même chemin de code qui produit tout autre appel à JSON.stringify() dans le langage, donc il n'a aucun des bugs d'échappement qu'un minifieur de chaînes écrit à la main pourrait introduire.",
                    "L'ordre des clés est préservé exactement tel qu'il était dans l'objet analysé. Les objets JavaScript conservent l'ordre d'insertion pour les clés de type chaîne (à une exception près — les clés ressemblant à des entiers comme \"1\" ou \"42\" sont toujours triées numériquement en premier, avant toute autre clé, quel que soit l'endroit où elles apparaissaient dans la source). Ce réordonnancement fait partie de la spécification JavaScript, ce n'est pas quelque chose que cet outil ajoute.",
                ],
            },
            {
                heading: "Minifié n'est pas la même chose que Compact",
                body: [
                    "Le sélecteur de format ci-dessus propose aussi Compact, une transformation différente et plus douce : JSON.stringify(parsed, null, 1) — un espace d'indentation au lieu de deux ou quatre, mais toujours une valeur par ligne. Minifié supprime entièrement la structure ; Compact ne fait que la réduire. Utilisez Compact quand un humain doit encore lire le diff, et Minifié quand seule une machine consommera le résultat.",
                ],
            },
            {
                heading: "Où minifier économise réellement des octets",
                body: [
                    "Si une réponse est déjà servie compressée en gzip ou brotli, la majeure partie du gain de la minification disparaît avant d'atteindre le réseau : les espaces répétés sont exactement le type de redondance que ces algorithmes suppriment déjà bien. Minifier compte le plus pour les charges utiles non compressées — certains corps de webhooks, caches locaux, fichiers de configuration intégrés — et pour réduire le travail que JSON.parse() doit effectuer sur de très grands documents, puisque moins d'octets signifie moins de caractères à parcourir, indépendamment de la compression.",
                ],
            },
        ],
        limitations: [
            "Minifier ne change pas le formatage des nombres, ne supprime pas les champs inutilisés et ne raccourcit pas les noms de clés — cela supprime uniquement les espaces. Si vous avez besoin d'une charge utile plus petite au-delà de cela, c'est un changement de schéma, pas un réglage de minification.",
            "Pour un document de plusieurs mégaoctets, JSON.parse() et JSON.stringify() s'exécutent tous deux de façon synchrone sur le thread principal. Coller un très grand contenu peut rendre l'onglet brièvement non réactif pendant leur exécution ; c'est une propriété de l'implémentation JSON du navigateur, pas quelque chose que cette page ajoute par-dessus.",
        ],
        faq: [
            {
                q: 'La minification change-t-elle les données de quelque façon que ce soit ?',
                a: 'Non. Chaque clé, valeur et élément de tableau est préservé exactement. Seuls les espaces entre eux sont supprimés.',
            },
            {
                q: 'Quelle est la différence entre Minifié et Compact ?',
                a: "Minifié supprime tous les espaces, produisant une seule ligne. Compact garde une valeur par ligne mais avec une indentation minimale. Utilisez Compact quand une personne doit encore le lire, Minifié quand seule une machine le fera.",
            },
            {
                q: 'Est-ce que cela aidera si mes réponses API sont déjà en gzip ?',
                a: "Moins que vous ne pourriez l'espérer. Gzip compresse déjà efficacement les espaces répétés, donc minifier avant compression apporte une économie supplémentaire plus faible que ne le suggère le nombre d'octets ci-dessus. Cela compte plus pour les charges utiles non compressées.",
            },
            {
                q: 'Mon JSON est-il envoyé quelque part ?',
                a: "Non. JSON.parse() et JSON.stringify() s'exécutent dans votre navigateur. Rien n'est envoyé à un serveur, ce qui compte si la charge utile contient de vraies données clients ou de compte.",
            },
        ],
    },

    validate: {
        h1: 'Validateur JSON',
        tagline: "Voyez exactement quelle règle votre JSON enfreint, avec le message d'erreur du parseur lui-même.",
        intro: [
            "Cet outil valide le JSON exactement de la même façon que tout appel à JSON.parse() dans votre navigateur, car c'est ce qui s'exécute en dessous — il n'y a pas de couche de validation séparée et plus permissive. Si JSON.parse() accepte votre entrée, l'outil la signale comme valide ; s'il lève une exception, l'outil affiche le message de cette exception à côté de l'onglet JSON Original, avec un indicateur vert ✓ ou rouge ⚠.",
            "Les quatre exemples ci-dessous sont de vraies entrées et le vrai texte d'erreur qu'un moteur basé sur V8 (Chrome, Edge et Node.js utilisent tous V8) lève pour chacune d'elles, générés en les faisant réellement passer par JSON.parse() plutôt que décrits de mémoire. Firefox et Safari utilisent des moteurs JavaScript différents et formulent ces erreurs différemment, mais rejettent les mêmes entrées pour la même raison sous-jacente.",
        ],
        invalidExamples: [
            {
                label: 'Virgule superflue',
                explanation:
                    "JSON n'a aucune notion de virgule superflue. Contrairement à un littéral d'objet JavaScript, la virgule avant la } fermante doit toujours être suivie d'une autre paire \"clé\": valeur.",
            },
            {
                label: 'Clé non citée',
                explanation:
                    "Chaque clé d'objet doit être une chaîne entre guillemets doubles. Ceci est valide dans un littéral d'objet JavaScript, ce qui explique pourquoi l'erreur est fréquente quand le JSON est tapé à la main plutôt que généré.",
            },
            {
                label: 'Un commentaire //',
                explanation:
                    "JSON n'a aucune syntaxe de commentaire — ni //, ni /* */. Certains outils acceptent le « JSONC » (JSON avec commentaires) comme format d'entrée, mais le JSON.parse() standard non.",
            },
            {
                label: 'Un zéro de tête',
                explanation:
                    "Un nombre JSON ne peut pas avoir de zéro de tête avant d'autres chiffres (01, 007). Cela reflète la même règle que pour les littéraux numériques JavaScript et existe pour éviter toute ambiguïté avec la notation octale.",
            },
        ],
        sections: [
            {
                heading: 'Ce que "valide" signifie, et ce que cela ne signifie pas',
                body: [
                    "Cet outil vérifie que votre texte est du JSON bien formé selon la RFC 8259 — chaque accolade correspond, chaque chaîne est entre guillemets, chaque valeur a la bonne forme. C'est une question différente et plus étroite que « est-ce le JSON que mon application attend ». Une réponse à laquelle il manque un champ obligatoire, ou qui envoie une chaîne là où votre code attend un nombre, est du JSON parfaitement valide et passera cette vérification tout en cassant quand même votre application.",
                    "Détecter cette seconde catégorie de problème nécessite une validation de schéma — un document JSON Schema, ou un vérificateur de type à l'exécution comme Zod — vérifié par rapport à la forme spécifique que vous attendez. Cet outil est la première vérification rapide qui vient avant cette étape, pas un substitut à celle-ci.",
                ],
            },
            {
                heading: "Pourquoi le message d'erreur est spécifique",
                body: [
                    "Un validateur qui dit seulement « JSON invalide » vous oblige à parcourir tout le document à l'œil. Le message que cet outil affiche — le même que celui que lève JSON.parse() — inclut une position de caractère et, dans la plupart des moteurs, une ligne et une colonne, ce qui suffit généralement à aller directement à l'erreur sans comparaison manuelle avec une copie connue comme correcte.",
                ],
            },
        ],
        limitations: [
            "Le libellé exact du message d'erreur est spécifique aux moteurs basés sur V8. Firefox et Safari signalent les mêmes violations avec une formulation différente, donc si vous dépannez un rapport d'un utilisateur sur l'un de ces navigateurs, attendez-vous à ce que le texte du message — pas le problème sous-jacent — diffère.",
            "Ceci ne vérifie que la syntaxe. Un JSON valide mais mal formé (un champ manquant, une chaîne au lieu d'un nombre) ne sera pas signalé ici ; cela nécessite une validation de schéma par rapport à votre propre structure attendue.",
        ],
        faq: [
            {
                q: 'Pourquoi cela dit-il juste que le JSON est invalide, sans plus de détails ?',
                a: "Ce n'est pas le cas — passez à l'onglet JSON Formaté (ou commencez simplement à taper) et l'erreur exacte du parseur, y compris la position du caractère, est affichée. Les exemples ci-dessus sont ce même message, vérifié par rapport à la sortie réelle de JSON.parse().",
            },
            {
                q: '« Valide » signifie-t-il que mon API l\'acceptera ?',
                a: "Cela signifie que le JSON est bien formé. Que les champs et types spécifiques correspondent à ce qu'attend une API est une question distincte à laquelle cet outil ne répond pas — cela nécessite une validation de schéma par rapport au contrat de cette API.",
            },
            {
                q: 'Puis-je valider du JSON contenant des commentaires (JSONC) ?',
                a: "Pas avec cet outil — il vérifie par rapport au JSON standard (RFC 8259), qui n'a aucune syntaxe de commentaire. Retirez d'abord les commentaires si vous travaillez avec un fichier de configuration JSONC.",
            },
            {
                q: 'Mon JSON est-il envoyé quelque part pour être vérifié ?',
                a: "Non. La validation s'exécute via le propre JSON.parse() de votre navigateur, localement. Rien n'est téléversé.",
            },
        ],
    },

    'to-typescript': {
        h1: 'Convertisseur JSON vers TypeScript',
        tagline: 'Transforme une vraie réponse API en interfaces nommées — champs optionnels compris.',
        intro: [
            "Coller une réponse API et récupérer en retour des interfaces typées est un travail réellement différent de formater du JSON, il a donc son propre générateur plutôt que d'être un style de sortie de plus greffé sur l'embellisseur. Il parcourt la valeur analysée une fois : chaque objet devient une interface nommée, les tableaux d'objets sont fusionnés en une seule interface, et un champ absent de certains (mais pas tous) les éléments d'un tableau devient optionnel plutôt que de produire un type distinct par élément.",
            "L'exemple ci-dessous est chargé dans l'éditeur au-dessus avec JSON → TypeScript sélectionné. C'est une forme réaliste — un enregistrement utilisateur avec une adresse imbriquée, un tableau d'étiquettes de type chaîne, et un tableau de commandes où une seule commande a un trackingCode — choisie parce qu'elle sollicite les trois cas qui comptent : imbrication, tableaux et champs optionnels incohérents.",
        ],
        sections: [
            {
                heading: "Comment l'imbrication devient des interfaces nommées",
                body: [
                    "Chaque champ objet obtient sa propre interface, nommée d'après le champ (address devient Address, l'élément de orders devient Order). C'est délibéré : un type imbriqué en ligne est plus difficile à réutiliser et plus difficile à lire dans l'infobulle au survol d'un éditeur qu'un type nommé. Deux champs avec exactement le même ensemble de clés et de types — une adresse de facturation et une adresse de livraison, par exemple — sont reconnus comme ayant la même forme et partagent une interface au lieu d'en générer une dupliquée.",
                ],
            },
            {
                heading: 'Les tableaux d\'objets sont fusionnés, pas énumérés',
                body: [
                    "orders est un tableau où le premier élément n'a pas de trackingCode et le second en a un. Plutôt que de générer Order et Order2, le générateur examine chaque élément du tableau, rassemble l'union de chaque clé apparaissant dans l'un quelconque d'entre eux, et marque une clé comme optionnelle si elle manque dans au moins un élément — ce qu'exprime exactement trackingCode?: string ci-dessus. Cela reflète la façon dont vous le typeriez vous-même à la main après avoir réellement lu quelques réponses d'exemple.",
                ],
            },
            {
                heading: 'Les tableaux de types mixtes deviennent une union',
                body: [
                    "Un tableau dont les éléments ne sont pas tous du même type — [1, \"two\", 3] — produit (number | string)[] plutôt que de choisir un type et de masquer l'incohérence, ou de refuser de générer quoi que ce soit. Un tableau vide n'a rien à partir de quoi inférer et est typé unknown[] ; affinez-le à la main une fois que vous savez ce que le tableau est censé contenir.",
                ],
            },
            {
                heading: "Ce qu'il n'infère délibérément pas",
                body: [
                    "Chaque chaîne devient string et chaque nombre devient number — il n'y a aucune tentative de détecter qu'un champ ressemble toujours à une date, un e-mail, ou l'une de trois valeurs fixes, et de l'affiner vers une union littérale ou un type marqué. Un affinement fiable nécessiterait soit un échantillon plus grand qu'une seule réponse, soit une connaissance du domaine que cet outil n'a pas ; deviner à tort serait pire que de laisser le champ en string.",
                ],
            },
        ],
        limitations: [
            "Une réponse d'exemple est un échantillon, pas un schéma. Un champ qui se trouve être null ou un nombre entier dans votre unique collage, mais qui est parfois une chaîne ou un décimal dans d'autres réponses, sera typé de façon trop étroite. Testez l'interface générée par rapport à plusieurs vraies réponses différentes, pas une seule.",
            "Les noms d'interfaces et de propriétés générés proviennent de vos clés JSON et ne sont pas dédupliqués au-delà des formes de champ identiques — deux objets de formes différentes provenant tous deux d'un champ appelé « data » seront tous deux nommés Data et Data2, ce qui se lit comme « le deuxième » plutôt que quelque chose de descriptif. Renommez-les une fois que vous savez ce qu'ils représentent.",
        ],
        faq: [
            {
                q: 'Gère-t-il le JSON profondément imbriqué ?',
                a: "Oui — l'imbrication n'a aucune limite de profondeur. Chaque objet imbriqué devient sa propre interface nommée, quel que soit le nombre de niveaux de profondeur auquel il apparaît.",
            },
            {
                q: "Que se passe-t-il avec un tableau qui mélange objets et primitifs ?",
                a: "Les éléments objets sont fusionnés en une interface comme d'habitude, les éléments primitifs apportent leurs propres types, et le type d'élément du tableau est l'union des deux — par exemple (Order | string)[].",
            },
            {
                q: 'Puis-je définir mon propre nom d\'interface racine ?',
                a: "L'interface racine générée s'appelle Root par défaut lorsque vous modifiez le JSON dans l'outil. Cette page la nomme d'après ce que représente l'exemple (ApiUser) purement pour la lisibilité dans l'exemple.",
            },
            {
                q: 'Mon JSON est-il envoyé à un serveur pour générer les types ?',
                a: "Non. Le générateur s'exécute dans votre navigateur et ne téléverse jamais ce que vous collez, ce qui compte puisqu'une vraie réponse API est exactement ce que vous colleriez ici.",
            },
        ],
    },
};
