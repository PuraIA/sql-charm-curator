import type { DialectSlug, DialectGuideTranslation } from '../sql-dialects';

/** Spanish translations for /sql/<dialect>. See sql-dialects.pt.ts for the pattern. */
export const DIALECT_TRANSLATIONS_ES: Partial<Record<DialectSlug, DialectGuideTranslation>> = {
    postgresql: {
        h1: 'Formateador de PostgreSQL',
        tagline: 'Casts, operadores JSONB y joins LATERAL, formateados sin romperlos por la mitad.',
        intro: [
            'Formatear PostgreSQL rara vez tiene que ver con la lista del SELECT. La dificultad es que Postgres ha acumulado un conjunto de operadores que parecen puntuación normal: :: para casts, -> y ->> para acceder a JSON, @> para contención, ?| para existencia de clave. Un formateador que tokeniza de forma ingenua termina partiendo estos operadores por la mitad, o confunde los primeros dos puntos con un marcador de parámetro con nombre y rompe la línea en el lugar equivocado.',
            'Esta página ejecuta el formateador con la gramática de PostgreSQL seleccionada y la sintaxis de parámetros configurada como con nombre (:nombre) más numerada ($1), que es lo que usan el protocolo de Postgres y la mayoría de los drivers. El ejemplo de abajo está cargado en el editor de arriba, así que puedes cambiar las opciones y ver cómo se reformatea la misma consulta.',
        ],
        quirks: [
            {
                heading: 'El operador de cast :: frente a los parámetros :con nombre',
                body: [
                    'PostgreSQL usa :: para el casting y : para introducir un parámetro con nombre, lo que pone dos significados en el mismo carácter. Un formateador configurado para un dialecto donde : es solo un marcador de parámetro leerá los primeros dos puntos de o.total::numeric como el inicio de un placeholder y romperá la expresión.',
                    'Seleccionar la gramática de PostgreSQL le indica al analizador que :: se une como un único operador de cast, mientras que :nombre y $1 siguen siendo placeholders. Los casts permanecen pegados a su expresión, como en la línea (c.profile -> \'prefs\' ->> \'locale\')::TEXT de arriba.',
                ],
            },
            {
                heading: 'Operadores JSONB, incluyendo la familia ?',
                body: [
                    'Postgres expone el acceso a JSON mediante operadores en lugar de funciones: -> devuelve jsonb, ->> devuelve texto, #> y #>> reciben un array de ruta, y @> comprueba contención. Se tratan como operadores, así que mantienen sus operandos en la misma línea cuando el ancho de expresión lo permite.',
                    'Los operadores de existencia merecen una mención especial. ? comprueba una clave de nivel superior, ?| comprueba cualquier clave en un array y ?& comprueba todas ellas — y ? es también el placeholder posicional usado por JDBC y varios otros drivers. Con la gramática de PostgreSQL seleccionada, se interpretan como operadores:',
                ],
            },
            {
                heading: 'Los cuerpos de función con dollar-quote se dejan intactos',
                body: [
                    'Un cuerpo de PL/pgSQL escrito entre $$ o $tag$ es, para el analizador de SQL, un único literal de cadena largo. El formateador lo preserva exactamente en lugar de reindentarlo, que es el comportamiento seguro — reformatear el interior de una cadena cambiaría el valor almacenado en el catálogo.',
                    'En la práctica esto significa que las sentencias CREATE FUNCTION salen con el SQL circundante formateado y el cuerpo intacto en una sola línea. Si quieres el cuerpo en sí formateado, formatéalo por separado como un bloque independiente y pégalo de vuelta.',
                ],
            },
            {
                heading: 'FILTER, LATERAL y otras cláusulas que se anidan',
                body: [
                    'COUNT(*) FILTER (WHERE ...) coloca una cláusula WHERE completa dentro de una llamada de agregación, y LEFT JOIN LATERAL coloca una subconsulta completa dentro de un join. Ambas se expanden como bloques anidados, que es lo que hace legible la forma de la consulta — se ve de inmediato que la subconsulta lateral es una búsqueda de "top 1 por fila".',
                    'ON CONFLICT ... DO UPDATE con una cláusula RETURNING se trata de la misma manera, incluyendo las referencias a la pseudo-tabla excluded.',
                ],
            },
            {
                heading: 'Plegado de identificadores: por qué Preserve es el valor correcto por defecto',
                body: [
                    'PostgreSQL pliega los identificadores sin comillas a minúsculas, así que MyTable y mytable son el mismo objeto, mientras que "MyTable" entre comillas dobles es un objeto diferente. Eso hace que el caso del identificador sea significativo de una forma que no lo es en la mayoría de los dialectos.',
                    'Por eso la opción de caso de identificador usa Preserve por defecto. Cambiarla a Upper o Lower también reescribirá los identificadores entre comillas, lo que puede hacer que una consulta apunte a una tabla que no existe. El caso de las palabras clave es una opción independiente, así que puedes seguir poniendo SELECT y FROM en mayúsculas sin tocar los nombres de tu esquema.',
                ],
            },
        ],
        limitations: [
            'DISTINCT ON (col) se coloca en la línea después de SELECT DISTINCT en lugar de junto a él. La salida es SQL válido, pero se lee peor que el resto.',
            'Dentro de un cuerpo con dollar-quote el formateador no hace ningún cambio, incluyendo la parte final language plpgsql de una sentencia CREATE FUNCTION, que queda en el caso en que la escribiste.',
        ],
        conventions: [
            {
                heading: 'Palabras clave en mayúsculas, identificadores intactos',
                body: [
                    'El estilo más usado en Postgres pone las palabras reservadas en mayúsculas y deja los nombres de tablas y columnas en el snake_case con que se creó el esquema. Esa es la configuración por defecto aquí: caso de palabra clave, tipo de dato y función en Upper, caso de identificador en Preserve.',
                ],
            },
            {
                heading: 'Prefiere las CTE, y ten en cuenta que ya no son barreras de optimización',
                body: [
                    'Dividir una consulta en bloques WITH se lee mucho mejor que anidar subconsultas tres niveles de profundidad, y desde PostgreSQL 12 una CTE simple es incluida en línea por el planificador en lugar de materializada, así que la legibilidad ya no cuesta un cambio de plan. Añade MATERIALIZED explícitamente cuando realmente quieras el antiguo comportamiento de barrera.',
                    'La opción Líneas entre consultas controla las líneas en blanco que el formateador coloca entre sentencias, que es lo que mantiene legible un script de migración con varias sentencias.',
                ],
            },
        ],
        faq: [
            {
                q: '¿Formatear cambia cómo PostgreSQL ejecuta mi consulta?',
                a: 'No. El analizador descarta los espacios en blanco y pliega los identificadores sin comillas antes de planificar, así que el plan de una consulta formateada es idéntico al de la misma consulta en una sola línea. El formateo es para las personas que leen el código.',
            },
            {
                q: '¿Romperá mis identificadores entre comillas en "CamelCase"?',
                a: 'No, con la configuración por defecto. El caso de identificador está en Preserve, así que los identificadores entre comillas salen exactamente como los escribiste. Cambia esa opción solo si estás seguro de que tu esquema usa nombres sin comillas y sin distinción de mayúsculas en todas partes.',
            },
            {
                q: '¿Puede formatear el cuerpo de una función PL/pgSQL?',
                a: 'El cuerpo entre delimitadores $$ es un literal de cadena para el analizador de SQL, así que se preserva literalmente en lugar de reindentarse. Para formatear el cuerpo en sí, pega solo el bloque entre los delimitadores.',
            },
            {
                q: '¿Se envían mis consultas a algún sitio?',
                a: 'No. El formateador es una biblioteca de JavaScript que se ejecuta en tu navegador. No se sube nada, lo que hace seguro pegar una consulta que contenga nombres de tablas y columnas de producción.',
            },
        ],
    },

    mysql: {
        h1: 'Formateador de MySQL y MariaDB',
        tagline: 'Identificadores con comillas invertidas, hints de índice y LIMIT de dos argumentos, preservados exactamente.',
        intro: [
            'El problema recurrente al formatear MySQL son los identificadores. La lista de palabras reservadas ha crecido en cada versión — rank, groups, window y system se volvieron reservadas en la 8.0 — así que los esquemas reales están llenos de columnas entre comillas invertidas que solo existen porque el nombre chocó con una palabra clave. Un formateador que trata las comillas invertidas como decoración, o que aplica el caso de palabra clave al texto dentro de ellas, producirá SQL que ya no funciona.',
            'Seleccionar la gramática de MySQL mantiene intacto el uso de comillas invertidas e interpreta las cláusulas específicas de este dialecto: hints de índice entre la tabla y el join, el LIMIT de dos argumentos, y los argumentos con forma de cláusula de GROUP_CONCAT. La consulta de abajo está cargada en el editor de arriba.',
        ],
        quirks: [
            {
                heading: 'Identificadores entre comillas invertidas y sensibilidad a mayúsculas',
                body: [
                    'La columna llamada `order` en el ejemplo es el caso común: un término de negocio perfectamente razonable que resulta ser una palabra reservada. Las comillas invertidas son lo único que mantiene válida esa consulta, así que se preservan y nunca se les cambia el caso.',
                    'Esto importa más en MySQL que en la mayoría de las bases de datos porque la sensibilidad a mayúsculas del nombre de tabla depende del sistema de archivos del host. En Linux, Users y users son tablas diferentes; en macOS y Windows normalmente no lo son. Un formateador que pone los identificadores en mayúsculas funcionará silenciosamente en desarrollo y fallará en producción, por lo que el caso de identificador usa Preserve por defecto aquí.',
                ],
            },
            {
                heading: 'LIMIT con dos argumentos',
                body: [
                    'MySQL acepta tanto LIMIT cantidad como LIMIT posición, cantidad. La forma de dos argumentos no tiene equivalente en SQL estándar — LIMIT 40, 20 significa saltar 40, devolver 20, que es el orden inverso al que la gente espera de LIMIT ... OFFSET.',
                    'El formateador mantiene ambos argumentos en una sola línea en lugar de dividirlos en la coma, porque dividirlos empeora una cláusula ya confusa.',
                ],
            },
            {
                heading: 'Los hints de índice se sitúan entre la tabla y el join',
                body: [
                    'FORCE INDEX, USE INDEX, IGNORE INDEX y STRAIGHT_JOIN se adjuntan a una referencia de tabla, así que aparecen después del alias y antes del siguiente JOIN. Se interpretan como parte de la referencia de tabla y permanecen en su línea, lo que mantiene legible la lista de joins.',
                ],
            },
            {
                heading: 'Funciones cuyos argumentos contienen cláusulas',
                body: [
                    'GROUP_CONCAT no es una llamada de función corriente: su lista de argumentos puede contener DISTINCT, un ORDER BY completo y un SEPARATOR. Por eso se expande como un bloque anidado, con el ORDER BY indentado dentro de la llamada.',
                ],
            },
            {
                heading: 'ON DUPLICATE KEY UPDATE, forma antigua y nueva',
                body: [
                    'La cláusula de upsert se reconoce en las dos grafías — la forma tradicional VALUES(col) y el alias de fila introducido en MySQL 8.0.20, que la dejó obsoleta. La forma con alias se interpreta sin problemas:',
                ],
            },
            {
                heading: 'Tres sintaxis de comentario, una de ellas una trampa',
                body: [
                    'MySQL acepta # hasta el final de línea, bloques /* */ y -- hasta el final de línea. La última tiene una condición que sorprende a la gente: MySQL exige un espacio en blanco después del guion doble, así que --comentario no es un comentario y normalmente se lee como una resta seguida de un identificador.',
                    'Los comentarios se preservan en su lugar. Si un comentario -- sobrevive al formateo pero la consulta luego falla al ejecutarse, comprueba si falta el espacio.',
                ],
            },
        ],
        limitations: [
            'En DATE_SUB(NOW(), interval 30 day) la palabra clave INTERVAL y su unidad quedan en el caso en que las escribiste, porque se interpretan como parte del argumento de la función en lugar de palabras clave de nivel superior. La consulta es válida de cualquiera de las dos formas.',
        ],
        conventions: [
            {
                heading: 'Cita entre comillas invertidas solo lo que lo necesita',
                body: [
                    'Poner comillas invertidas en cada identificador es un hábito heredado de herramientas gráficas que las generan incondicionalmente. No está mal, pero añade ruido — el ejemplo de arriba cita `users` y `order` y deja los alias sin comillas, que es el estilo más común al escribir a mano.',
                ],
            },
            {
                heading: 'MariaDB usa la misma configuración',
                body: [
                    'MariaDB divergió de MySQL después de la versión 5.5, pero la sintaxis relevante para el formateo — comillas invertidas, hints de índice, LIMIT, los estilos de comentario — se comparte. Usa el dialecto MySQL para las consultas de MariaDB.',
                ],
            },
        ],
        faq: [
            {
                q: '¿Poner las palabras clave en mayúsculas romperá mis nombres de tabla sensibles a mayúsculas?',
                a: 'No. El caso de palabra clave y el caso de identificador son configuraciones independientes. El valor por defecto pone SELECT, FROM y JOIN en mayúsculas mientras deja cada nombre de tabla y columna exactamente como lo escribiste.',
            },
            {
                q: '¿Funciona esto para MariaDB?',
                a: 'Sí. Selecciona el dialecto MySQL. La sintaxis que afecta al formateo es la misma en ambos.',
            },
            {
                q: '¿Por qué mi comentario -- no se trata como comentario?',
                a: 'MySQL exige un carácter de espacio después del guion doble. --nota se interpreta como una expresión; -- nota es un comentario. Esta es una regla de MySQL, no un comportamiento del formateador.',
            },
            {
                q: '¿Se envía mi SQL a un servidor?',
                a: 'No. El formateo ocurre en tu navegador y nada sale de tu máquina, lo que hace seguro pegar consultas con nombres reales de esquema.',
            },
        ],
    },

    't-sql': {
        h1: 'Formateador de T-SQL para SQL Server',
        tagline: 'Identificadores entre corchetes, operadores APPLY, marcos de ventana y lotes GO.',
        intro: [
            'T-SQL lleva más sintaxis procedural que cualquier otro dialecto popular, y buena parte de ella no es realmente SQL — GO es una directiva de cliente, las variables de tabla se declaran con la misma @ que marca un parámetro, y los hints de consulta viajan al final de una sentencia entre paréntesis. Formatear bien T-SQL consiste en gran parte en reconocer cuáles de estas cosas son sentencias y cuáles son decoración.',
            'La consulta de abajo, cargada en el editor de arriba, ejercita las partes que más suelen fallar: nombres de varias partes entre corchetes, un OUTER APPLY correlacionado con la fila externa, y un ROW_NUMBER con ventana usando su propio PARTITION BY y ORDER BY.',
        ],
        quirks: [
            {
                heading: 'Identificadores entre corchetes y nombres de cuatro partes',
                body: [
                    'SQL Server cita los identificadores con corchetes, y un nombre totalmente cualificado puede tener cuatro partes: servidor.base_de_datos.esquema.objeto. Los corchetes se preservan y los puntos entre ellos no se tratan como operadores, así que [dbo].[Customers] permanece intacto.',
                    'Las comillas dobles también funcionan como delimitador de identificador cuando QUOTED_IDENTIFIER está en ON, que es el valor por defecto para la mayoría de los drivers. Se aceptan ambas grafías.',
                ],
            },
            {
                heading: 'CROSS APPLY y OUTER APPLY',
                body: [
                    'APPLY es el join lateral de T-SQL: la subconsulta del lado derecho se evalúa una vez por cada fila de la tabla del lado izquierdo y puede referenciar sus columnas. CROSS APPLY descarta las filas externas que no producen nada, OUTER APPLY las mantiene con NULLs — la misma relación que entre INNER y LEFT JOIN.',
                    'La subconsulta se expande como un bloque anidado, lo que hace visible la correlación. En el ejemplo, o.[CustomerID] = c.[CustomerID] dentro del APPLY es lo que la vincula a la fila externa.',
                ],
            },
            {
                heading: 'Marcos de ventana',
                body: [
                    'Una cláusula OVER puede contener PARTITION BY, ORDER BY y una especificación de marco, lo que la convierte en una cláusula anidada dentro de un elemento de select. Cada parte se coloca en su propia línea en lugar de juntarlas, porque un PARTITION BY mal leído es una de las formas más fáciles de obtener una respuesta incorrecta que aun así parece plausible.',
                    'Las cláusulas de marco como ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW se mantienen en la misma línea que sus palabras clave.',
                ],
            },
            {
                heading: 'GO es un separador de lotes, no una sentencia',
                body: [
                    'GO es entendido por SSMS, Azure Data Studio y sqlcmd, no por el motor de SQL Server — el cliente divide el script en él y envía cada lote por separado. Los scripts que contienen GO se manejan correctamente: los lotes se formatean de forma independiente y el separador queda en su propia línea.',
                ],
            },
            {
                heading: 'MERGE',
                body: [
                    'MERGE combina inserción, actualización y eliminación contra un destino usando un origen, con ramas WHEN MATCHED, WHEN NOT MATCHED BY TARGET y WHEN NOT MATCHED BY SOURCE. Cada rama empieza en su propia línea para que los tres casos se puedan leer por separado:',
                ],
            },
            {
                heading: 'El punto y coma antes de WITH',
                body: [
                    'Los scripts a menudo empiezan una CTE con ;WITH en lugar de WITH. El punto y coma termina lo que venía antes, porque WITH es ambiguo — también introduce hints de tabla — y SQL Server exige que la sentencia anterior esté terminada cuando le sigue una CTE.',
                    'El hábito es inofensivo y el formateador lo acepta, pero terminar cada sentencia con punto y coma lo hace innecesario, que es la mejor corrección.',
                ],
            },
        ],
        limitations: [
            'TOP (n) WITH TIES no se interpreta correctamente: WITH se lee como el inicio de una common table expression, y la cláusula se rompe en varias líneas como TOP (n) / WITH / ties. El ejemplo de esta página usa TOP (3) sin WITH TIES por este motivo. Si necesitas WITH TIES, formatea la consulta y luego repara esa cláusula a mano.',
            'En una sentencia MERGE la palabra clave USING queda en el caso en que la escribiste en lugar de ponerse en mayúsculas con las demás palabras clave.',
        ],
        conventions: [
            {
                heading: 'Esquemas en PascalCase, caso de identificador en Preserve',
                body: [
                    'Los esquemas de SQL Server suelen usar PascalCase — CustomerID, OrderDate — y SQL Server compara los identificadores usando el collation de la base de datos, que normalmente no distingue mayúsculas de minúsculas. Preserve sigue siendo el valor por defecto correcto: mantiene tus nombres legibles y evita sorpresas en la minoría de bases de datos que usan un collation sensible a mayúsculas.',
                ],
            },
            {
                heading: 'Termina las sentencias',
                body: [
                    'Microsoft documenta la omisión del terminador de sentencia como obsoleta desde hace varias versiones. Terminar cada sentencia con punto y coma elimina la necesidad del truco del punto y coma inicial, y permite que el formateador coloque líneas en blanco entre sentencias de forma fiable.',
                ],
            },
        ],
        faq: [
            {
                q: '¿Puedo pegar un script con separadores GO?',
                a: 'Sí. Los lotes se formatean de forma independiente y cada GO queda en su propia línea. GO es una directiva de cliente y no T-SQL, así que se transmite tal cual en lugar de interpretarse como una sentencia.',
            },
            {
                q: '¿Por qué TOP (3) WITH TIES sale roto?',
                a: 'El analizador lee WITH como el inicio de una common table expression. Es una limitación conocida, listada arriba. El resto de la consulta se formatea con normalidad, así que la solución habitual es corregir esa única cláusula después.',
            },
            {
                q: '¿Formatea el cuerpo de los procedimientos almacenados?',
                a: 'Las sentencias dentro de un procedimiento se formatean como T-SQL normal. Las construcciones de control de flujo como IF y WHILE se reconocen, pero el resultado es menos pulido que para un SELECT simple — el código procedural es donde cualquier formateador de SQL es más débil.',
            },
            {
                q: '¿Se envía mi T-SQL a un servidor?',
                a: 'No. Todo se ejecuta en tu navegador, así que las consultas con nombres internos de esquema u objeto nunca salen de tu máquina.',
            },
        ],
    },

    'oracle-plsql': {
        h1: 'Formateador de Oracle SQL y PL/SQL',
        tagline: 'Hints de optimizador mantenidos intactos, consultas jerárquicas y joins heredados con (+).',
        intro: [
            'Oracle es el dialecto donde formatear puede cambiar genuinamente el comportamiento, por una característica: los hints de optimizador se escriben como comentarios. Un formateador que normaliza o descarta comentarios eliminará silenciosamente /*+ INDEX(...) */ y cambiará el plan de ejecución de una consulta que aún parece correcta. Preservar los hints exactamente es el primer requisito para cualquier cosa que toque SQL de Oracle.',
            'Más allá de los hints, Oracle acarrea décadas de sintaxis acumulada — la notación de outer join (+) anterior a los joins ANSI, CONNECT BY para jerarquías, DUAL, y el mecanismo de q-quote para cadenas que contienen apóstrofos. La consulta de abajo, cargada en el editor de arriba, usa varias de ellas a la vez.',
        ],
        quirks: [
            {
                heading: 'Los hints de optimizador son comentarios que importan',
                body: [
                    'Un hint se escribe /*+ ... */ y debe aparecer inmediatamente después de la palabra clave SELECT, INSERT, UPDATE, DELETE o MERGE. Colócalo en cualquier otro lugar y Oracle lo ignora sin generar error, por lo que un formateador que mueve comentarios de sitio es peligroso aquí.',
                    'Los hints se preservan en su posición y su contenido nunca cambia de caso ni se reformatea. En la salida de arriba, /*+ index(e emp_dept_ix) */ permanece justo después de SELECT y conserva la grafía en minúsculas con la que se escribió.',
                ],
            },
            {
                heading: 'El outer join heredado con (+)',
                body: [
                    'Antes de que se admitiera la sintaxis de join ANSI, Oracle marcaba el lado opcional de un outer join con (+) en el predicado del join. Sigue siendo muy común en código antiguo. d.department_id(+) significa que la fila de departments puede faltar — el equivalente a un LEFT JOIN desde employees.',
                    'La notación se preserva. Nótese que se inserta un espacio antes del marcador, produciendo d.department_id (+), que Oracle interpreta de forma idéntica.',
                ],
            },
            {
                heading: 'Consultas jerárquicas: CONNECT BY, LEVEL, ORDER SIBLINGS BY',
                body: [
                    'Oracle recorre estructuras de árbol con START WITH para elegir las raíces y CONNECT BY PRIOR para describir la relación padre-hijo, exponiendo la profundidad mediante la pseudo-columna LEVEL. ORDER SIBLINGS BY ordena entonces dentro de cada nivel sin romper la jerarquía.',
                    'Estas son cláusulas de nivel superior, así que se colocan con la misma indentación que WHERE y GROUP BY en lugar de incluirse dentro de la cláusula WHERE a la que siguen.',
                ],
            },
            {
                heading: 'Literales de cadena con q-quote',
                body: [
                    "Duplicar cada apóstrofo dentro de una cadena es propenso a errores, así que Oracle ofrece una comilla alternativa: q'[...]' — o cualquier otro par de delimitadores — hace literal el contenido. Los delimitadores y el contenido se preservan exactamente:",
                ],
            },
            {
                heading: 'DUAL, NVL y DECODE',
                body: [
                    'DUAL es la tabla de una fila de Oracle, usada siempre que una expresión necesita una cláusula FROM. NVL es la sustitución de nulo con dos argumentos y DECODE es el condicional posicional anterior a CASE. Los tres se tratan como identificadores y funciones corrientes.',
                    'Para código nuevo, COALESCE y CASE son los equivalentes portables de NVL y DECODE, y se comportan de forma ligeramente distinta respecto a la conversión de tipos y la evaluación en cortocircuito.',
                ],
            },
        ],
        limitations: [
            'Los bloques PL/SQL se formatean mucho peor que las consultas. Un bloque DECLARE / BEGIN / END se divide en líneas separadas con líneas en blanco entre las secciones en lugar de indentarse como una estructura anidada. Las sentencias SQL dentro de un bloque se formatean con normalidad; la estructura del bloque que las rodea no.',
            'En FETCH FIRST 25 rows ONLY la palabra rows queda en minúsculas, porque se interpreta como parte de la cláusula de limitación de filas en lugar de como una palabra clave independiente.',
            'La barra final que usa SQL*Plus para ejecutar un bloque es una directiva de cliente, no PL/SQL. No la incluyas en lo que pegues.',
        ],
        conventions: [
            {
                heading: 'Prefiere los joins ANSI en código nuevo',
                body: [
                    'La notación (+) no puede expresar un full outer join, no se combina con la sintaxis de join ANSI en la misma consulta, y dificulta separar la condición de join de la condición de filtro. LEFT JOIN es más claro y es lo que Oracle recomienda desde hace años. Formatear código antiguo con (+) es útil para leerlo; convertirlo es un trabajo aparte.',
                ],
            },
            {
                heading: 'ROWNUM frente a FETCH FIRST',
                body: [
                    'Limitar filas con ROWNUM requiere una vista en línea cuando se combina con ORDER BY, porque ROWNUM se asigna antes de ordenar — la fuente clásica de consultas de "top N" que devuelven los N registros equivocados. Oracle 12c introdujo FETCH FIRST n ROWS ONLY, que ordena primero y es lo que usa el ejemplo de arriba.',
                ],
            },
        ],
        faq: [
            {
                q: '¿Se preservan los hints de optimizador?',
                a: 'Sí. Los hints permanecen en su posición inmediatamente después de la palabra clave inicial y su contenido no se modifica. Este es el comportamiento mostrado en el ejemplo de arriba.',
            },
            {
                q: '¿Puede formatear el cuerpo de un paquete o un bloque PL/SQL grande?',
                a: 'Las sentencias SQL internas se formatearán, pero la estructura del bloque se maneja mal — esto está listado en las limitaciones conocidas. Para código procedural, un IDE con un formateador específico para PL/SQL lo hará mejor.',
            },
            {
                q: '¿Debo mantener la barra final?',
                a: 'No. La / es una instrucción de SQL*Plus para ejecutar el bloque anterior, no forma parte de PL/SQL. Pega la sentencia sin ella.',
            },
            {
                q: '¿Se sube mi SQL a algún sitio?',
                a: 'No. El formateo se ejecuta enteramente en tu navegador, lo cual importa aquí porque las consultas de Oracle suelen incluir nombres de esquema y lógica de negocio.',
            },
        ],
    },

    bigquery: {
        h1: 'Formateador de SQL de BigQuery',
        tagline: 'Nombres cualificados entre comillas invertidas, UNNEST, SELECT * EXCEPT y QUALIFY.',
        intro: [
            'Las consultas de BigQuery están marcadas por dos cosas que otros dialectos no tienen: nombres de tabla con tres partes separadas por punto dentro de un único par de comillas invertidas, y columnas que son arrays de structs en lugar de escalares. Ambas cambian lo que un formateador tiene que acertar — los puntos dentro de `project.dataset.table` no son operadores, y un UNNEST en la cláusula FROM es un join aunque parezca una llamada a función.',
            'GoogleSQL también ha añadido cláusulas que eliminan capas enteras de anidamiento. QUALIFY filtra sobre una función de ventana sin la subconsulta envolvente que exigiría el estándar, y SELECT * EXCEPT descarta columnas sin listar las que quieres conservar. La consulta de abajo, cargada en el editor de arriba, usa ambas.',
        ],
        quirks: [
            {
                heading: 'Nombres cualificados entre comillas invertidas',
                body: [
                    'Una referencia de tabla en BigQuery es `project.dataset.table`, con los puntos dentro de las comillas en lugar de entre partes citadas por separado. Los ID de proyecto suelen contener guiones — analytics-prod en el ejemplo — que es exactamente por qué las comillas invertidas son obligatorias: sin ellas el guion se interpretaría como una resta.',
                    'La referencia completa se trata como un único token identificador, así que nunca se divide en un punto o en un guion.',
                ],
            },
            {
                heading: 'UNNEST es un join, no una llamada a función',
                body: [
                    'Cuando una columna es un ARRAY, UNNEST en la cláusula FROM lo aplana en filas, correlacionadas con la fila de la que proceden. La coma antes de él es un CROSS JOIN, por lo que el ejemplo se lee FROM tabla e, UNNEST(e.hits) AS h — una fila por hit, arrastrando su sesión.',
                    'Se coloca en su propia línea en la lista FROM, al mismo nivel que la tabla que expande, que es la representación honesta de lo que es.',
                ],
            },
            {
                heading: 'SELECT * EXCEPT y * REPLACE',
                body: [
                    'Las tablas de eventos anchas hacen impráctico listar cada columna, así que GoogleSQL permite restar en su lugar: * EXCEPT (payload) selecciona todo menos esa columna, y * REPLACE (expr AS col) sustituye el valor de una columna manteniendo el resto. Ambas se interpretan como modificadores del asterisco en lugar de llamadas a función.',
                ],
            },
            {
                heading: 'QUALIFY',
                body: [
                    'Filtrar sobre una función de ventana normalmente exige calcularla en una subconsulta y filtrar por fuera, porque WHERE se ejecuta antes que las funciones de ventana. QUALIFY lo hace en un solo nivel — el ejemplo conserva el evento más reciente por usuario sin un SELECT envolvente.',
                    'Es una cláusula de nivel superior y se coloca junto a WHERE y GROUP BY. QUALIFY exige un WHERE, GROUP BY o HAVING en el mismo bloque de consulta, o una cláusula WINDOW.',
                ],
            },
            {
                heading: 'Tablas comodín y _TABLE_SUFFIX',
                body: [
                    'Un * al final de un nombre de tabla coincide con cada tabla que comparte ese prefijo, y la pseudo-columna _TABLE_SUFFIX guarda la parte que coincidió — la forma estándar de recorrer una exportación particionada por fecha. Filtrar por _TABLE_SUFFIX es lo que evita que la consulta lea cada fragmento, así que pertenece a la cláusula WHERE en lugar de a un filtro posterior.',
                    'SAFE_CAST y el prefijo de función SAFE. devuelven NULL en lugar de generar un error con entradas inválidas, lo cual importa cuando los datos son JSON proporcionado por el usuario. Ambos se reconocen como sintaxis de función corriente.',
                ],
            },
        ],
        limitations: [
            'Las pseudo-columnas _table_suffix, _partitiontime y _partitiondate quedan en el caso en que las escribiste, porque se interpretan como identificadores en lugar de palabras clave. BigQuery acepta cualquier caso para ellas.',
            'Las sentencias de scripting — DECLARE, SET, BEGIN ... END, EXECUTE IMMEDIATE — se formatean mucho peor que las consultas, como ocurre con el código procedural en todos los dialectos.',
        ],
        conventions: [
            {
                heading: 'Formatear no cambia lo que cuesta una consulta',
                body: [
                    'BigQuery cobra por bytes leídos, que depende de las columnas que referencias y las particiones que tocas — no de los espacios en blanco. Formatear una consulta nunca cambia su costo. SELECT * sí lo hace, que es el verdadero argumento a favor de EXCEPT frente al asterisco cuando la tabla es ancha.',
                ],
            },
            {
                heading: 'Solo GoogleSQL',
                body: [
                    'Legacy SQL, el dialecto anterior a 2016 con sintaxis de corchetes [project:dataset.table], es una gramática diferente y no se admite aquí. Si tu consulta usa dos puntos y corchetes en nombres de tabla, es Legacy SQL y necesita migrarse en lugar de formatearse.',
                ],
            },
        ],
        faq: [
            {
                q: '¿Afecta el formateo a lo que cuesta mi consulta?',
                a: 'No. El costo lo determinan los bytes leídos — las columnas referenciadas y las particiones leídas. Los espacios en blanco y el caso de las palabras clave no afectan a ninguno de los dos.',
            },
            {
                q: '¿Admite Legacy SQL?',
                a: 'No, solo GoogleSQL (antes llamado Standard SQL). Legacy SQL usa una sintaxis de referencia de tabla diferente y una gramática diferente.',
            },
            {
                q: '¿Se manejan las expresiones STRUCT y ARRAY?',
                a: 'Sí. Los constructores STRUCT anidados y las llamadas ARRAY_AGG se interpretan como expresiones corrientes, y UNNEST se reconoce como parte de la cláusula FROM.',
            },
            {
                q: '¿Se envía mi consulta a Google o a algún servidor?',
                a: 'No. Esta página ejecuta el formateador en tu navegador. La consulta no se envía a ningún sitio, ni siquiera a BigQuery.',
            },
        ],
    },
};
