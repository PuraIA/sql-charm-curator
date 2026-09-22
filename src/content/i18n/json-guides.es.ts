import type { JsonGuideSlug, JsonGuideTranslation } from '../json-guides';

/** Traducciones al español para /json/<slug>. Ver json-guides.ts para los campos aceptados. */
export const JSON_TRANSLATIONS_ES: Partial<Record<JsonGuideSlug, JsonGuideTranslation>> = {
    minify: {
        h1: 'Minificador de JSON',
        tagline: 'Elimina cada byte que solo existe para ojos humanos, verificado contra JSON.stringify.',
        intro: [
            'Minificar JSON es, deliberadamente, la transformación más simple que hace este sitio: la herramienta llama a JSON.stringify() sobre el valor ya interpretado sin argumento de sangría, así que los espacios en blanco desaparecen y nada más cambia — las mismas claves, el mismo orden de claves, los mismos números, el mismo contenido de cadena. No hay un algoritmo de minificación separado que pueda fallar, porque el propio serializador del motor es el minificador.',
            'Esa simplicidad es también la razón de ser de esta página: minificar es fácil de hacer bien y fácil de juzgar mal. El ejemplo de abajo está cargado en el editor de arriba con Minificado seleccionado, así que puedes pegar tu propio JSON y ver exactamente la misma sustitución ocurrir en él.',
        ],
        sections: [
            {
                heading: 'Qué se elimina realmente',
                body: [
                    'Solo el espacio en blanco que existe entre tokens estructurales — después de un {, antes de un }, alrededor de un : o una , — es el que JSON.stringify() nunca emite sin un argumento de sangría. No es un barrido de texto sobre tu archivo; es la misma ruta de código que produce cualquier otra llamada a JSON.stringify() en el lenguaje, así que no tiene ninguno de los errores de escape que un minificador de cadenas escrito a mano podría introducir.',
                    'El orden de las claves se preserva exactamente como estaba en el objeto interpretado. Los objetos de JavaScript mantienen el orden de inserción para las claves de tipo cadena (con una excepción: las claves similares a enteros, como "1" o "42", siempre se ordenan numéricamente primero, antes de cualquier otra clave, sin importar dónde aparecieran en el origen). Ese reordenamiento es parte de la especificación de JavaScript, no algo que añada esta herramienta.',
                ],
            },
            {
                heading: 'Minificado no es lo mismo que Compacto',
                body: [
                    'El selector de formato de arriba también ofrece Compacto, que es una transformación distinta y más suave: JSON.stringify(parsed, null, 1) — un espacio de sangría en lugar de dos o cuatro, pero todavía un valor por línea. Minificado elimina la estructura por completo; Compacto solo la reduce. Usa Compacto cuando una persona todavía necesita leer el diff, y Minificado cuando solo una máquina va a consumir el resultado.',
                ],
            },
            {
                heading: 'Dónde minificar realmente ahorra bytes',
                body: [
                    'Si una respuesta ya se sirve comprimida con gzip o brotli, la mayor parte de la ganancia de minificar desaparece antes de llegar a la red: el espacio en blanco repetido es exactamente el tipo de redundancia que esos algoritmos ya eliminan bien. Minificar importa más para payloads que no están comprimidos —algunos cuerpos de webhooks, cachés locales, archivos de configuración incrustados— y para reducir el trabajo que JSON.parse() tiene que hacer en documentos muy grandes, ya que menos bytes significa menos caracteres que recorrer, independientemente de la compresión.',
                ],
            },
        ],
        limitations: [
            'Minificar no cambia el formato de los números, no elimina campos sin usar ni acorta nombres de claves — solo elimina espacio en blanco. Si necesitas un payload más pequeño más allá de eso, eso es un cambio de esquema, no una opción de minificación.',
            'Para un documento de varios megabytes, tanto JSON.parse() como JSON.stringify() se ejecutan de forma síncrona en el hilo principal. Pegar textos muy grandes puede dejar la pestaña brevemente sin respuesta mientras se procesan; esto es una propiedad de la implementación de JSON del navegador, no algo que esta página añada encima.',
        ],
        faq: [
            {
                q: '¿Minificar cambia los datos de alguna forma?',
                a: 'No. Cada clave, valor y elemento de array se preserva exactamente. Solo se elimina el espacio en blanco entre ellos.',
            },
            {
                q: '¿Cuál es la diferencia entre Minificado y Compacto?',
                a: 'Minificado elimina todo el espacio en blanco, produciendo una sola línea. Compacto mantiene un valor por línea pero con sangría mínima. Usa Compacto cuando una persona todavía necesita leerlo, Minificado cuando solo lo hará una máquina.',
            },
            {
                q: '¿Esto ayudará si las respuestas de mi API ya están en gzip?',
                a: 'Menos de lo que podrías esperar. Gzip ya comprime el espacio en blanco repetido de forma eficiente, así que minificar antes de comprimir produce un ahorro extra menor de lo que sugiere el conteo de bytes de arriba. Importa más para payloads sin comprimir.',
            },
            {
                q: '¿Se sube mi JSON a algún lugar?',
                a: 'No. JSON.parse() y JSON.stringify() se ejecutan en tu navegador. No se envía nada a un servidor, lo cual importa si el payload contiene datos reales de clientes o de cuentas.',
            },
        ],
    },

    validate: {
        h1: 'Validador de JSON',
        tagline: 'Ve exactamente qué regla incumple tu JSON, con el propio mensaje de error del parser.',
        intro: [
            'Esta herramienta valida JSON exactamente de la misma forma que lo hace cada llamada a JSON.parse() en tu navegador, porque eso es lo que corre por debajo — no hay una capa de validación separada y más permisiva. Si JSON.parse() acepta tu entrada, la herramienta la reporta como válida; si lanza una excepción, la herramienta muestra el mensaje de esa excepción junto a la pestaña JSON Original, junto con un indicador verde ✓ o rojo ⚠.',
            'Los cuatro ejemplos de abajo son entradas reales y el texto de error real que lanza un motor basado en V8 (Chrome, Edge y Node.js usan todos V8) para cada una de ellas, generados ejecutándolas de verdad a través de JSON.parse() en lugar de describirlos de memoria. Firefox y Safari usan motores de JavaScript distintos y redactan estos errores de forma diferente, pero rechazan las mismas entradas por la misma razón subyacente.',
        ],
        invalidExamples: [
            {
                label: 'Coma sobrante',
                explanation:
                    'JSON no tiene el concepto de coma sobrante. A diferencia de un literal de objeto en JavaScript, la coma antes del } de cierre siempre debe ir seguida de otro par "clave": valor.',
            },
            {
                label: 'Clave sin comillas',
                explanation:
                    'Toda clave de objeto debe ser una cadena entre comillas dobles. Esto es válido en un literal de objeto de JavaScript, por eso el error es común cuando el JSON se escribe a mano en lugar de generarse.',
            },
            {
                label: 'Un comentario //',
                explanation:
                    'JSON no tiene ninguna sintaxis de comentario — ni //, ni /* */. Algunas herramientas aceptan "JSONC" (JSON con comentarios) como formato de entrada, pero el JSON.parse() estándar no.',
            },
            {
                label: 'Un cero a la izquierda',
                explanation:
                    'Un número JSON no puede tener un cero a la izquierda antes de otros dígitos (01, 007). Esto refleja la misma regla de los literales numéricos de JavaScript y existe para evitar ambigüedad con la notación octal.',
            },
        ],
        sections: [
            {
                heading: 'Qué significa "válido" y qué no significa',
                body: [
                    'Esta herramienta comprueba que tu texto es JSON bien formado según la RFC 8259 — cada llave coincide, cada cadena está entre comillas, cada valor tiene la forma correcta. Esa es una pregunta distinta y más estrecha que "¿es este el JSON que espera mi aplicación?". Una respuesta a la que le falta un campo obligatorio, o que envía una cadena donde tu código espera un número, es JSON perfectamente válido y pasará esta comprobación aunque igualmente rompa tu aplicación.',
                    'Detectar esa segunda clase de problema requiere validación de esquema —un documento JSON Schema, o un verificador de tipos en tiempo de ejecución como Zod— comprobado contra la forma específica que esperas. Esta herramienta es la primera comprobación rápida que corresponde antes de ese paso, no un sustituto de él.',
                ],
            },
            {
                heading: 'Por qué el mensaje de error es específico',
                body: [
                    'Un validador que solo dice "JSON inválido" te obliga a recorrer todo el documento a simple vista. El mensaje que muestra esta herramienta —el mismo que lanza JSON.parse()— incluye una posición de carácter y, en la mayoría de los motores, una línea y columna, lo cual suele ser suficiente para ir directo al error sin necesidad de una comparación manual con una copia conocida como correcta.',
                ],
            },
        ],
        limitations: [
            'La redacción exacta del mensaje de error es específica de los motores basados en V8. Firefox y Safari reportan las mismas violaciones con una redacción diferente, así que si estás depurando un reporte de un usuario en uno de esos navegadores, espera que el texto del mensaje —no el problema subyacente— sea distinto.',
            'Esto solo comprueba la sintaxis. Un JSON válido pero con una forma incorrecta (un campo faltante, una cadena en lugar de un número) no se señalará aquí; eso requiere validación de esquema contra tu propia estructura esperada.',
        ],
        faq: [
            {
                q: '¿Por qué solo dice que el JSON es inválido, sin más detalle?',
                a: 'No lo hace — cambia a la pestaña JSON Formateado (o simplemente empieza a escribir) y se muestra el error exacto del parser, incluida la posición del carácter. Los ejemplos de arriba son ese mismo mensaje, verificado contra la salida real de JSON.parse().',
            },
            {
                q: '¿"Válido" significa que mi API lo aceptará?',
                a: 'Significa que el JSON está bien formado. Si los campos y tipos específicos coinciden con lo que espera una API es una cuestión distinta que esta herramienta no responde — eso requiere validación de esquema contra el contrato de esa API.',
            },
            {
                q: '¿Puedo validar JSON con comentarios dentro (JSONC)?',
                a: 'No con esta herramienta — comprueba contra el JSON estándar (RFC 8259), que no tiene sintaxis de comentarios. Quita los comentarios primero si trabajas con un archivo de configuración JSONC.',
            },
            {
                q: '¿Se envía mi JSON a algún lugar para comprobarse?',
                a: 'No. La validación se ejecuta mediante el propio JSON.parse() de tu navegador, de forma local. No se sube nada.',
            },
        ],
    },

    'to-typescript': {
        h1: 'Convertidor de JSON a TypeScript',
        tagline: 'Convierte una respuesta real de API en interfaces con nombre — campos opcionales incluidos.',
        intro: [
            'Pegar una respuesta de API y obtener a cambio interfaces tipadas es una tarea genuinamente distinta de formatear JSON, así que tiene su propio generador en lugar de ser un estilo de salida más pegado al formateador. Recorre el valor interpretado una vez: cada objeto se convierte en una interfaz con nombre, los arrays de objetos se fusionan en una sola interfaz, y un campo que falta en algunos (pero no todos) los elementos de un array se vuelve opcional en lugar de generar un tipo distinto por elemento.',
            'El ejemplo de abajo está cargado en el editor de arriba con JSON → TypeScript seleccionado. Es una forma realista —un registro de usuario con una dirección anidada, un array de etiquetas de cadena y un array de pedidos donde solo uno tiene trackingCode— elegida porque ejercita los tres casos que importan: anidamiento, arrays y campos opcionales inconsistentes.',
        ],
        sections: [
            {
                heading: 'Cómo el anidamiento se convierte en interfaces con nombre',
                body: [
                    'Cada campo de objeto obtiene su propia interfaz, nombrada según el campo (address se convierte en Address, el elemento de orders se convierte en Order). Esto es deliberado: un tipo anidado en línea es más difícil de reutilizar y más difícil de leer en el tooltip de un editor que uno con nombre. Dos campos con exactamente el mismo conjunto de claves y tipos —una dirección de facturación y una de envío, por ejemplo— se reconocen como la misma forma y comparten una interfaz en lugar de generar un duplicado.',
                ],
            },
            {
                heading: 'Los arrays de objetos se fusionan, no se enumeran',
                body: [
                    'orders es un array donde el primer elemento no tiene trackingCode y el segundo sí. En lugar de generar Order y Order2, el generador examina cada elemento del array, recopila la unión de cada clave que aparece en cualquiera de ellos, y marca una clave como opcional si falta en al menos un elemento —que es exactamente lo que expresa trackingCode?: string arriba. Esto refleja cómo lo tiparías tú mismo a mano después de leer de verdad unas cuantas respuestas de ejemplo.',
                ],
            },
            {
                heading: 'Los arrays de tipos mixtos se convierten en una unión',
                body: [
                    'Un array cuyos elementos no son todos del mismo tipo —[1, "two", 3]— produce (number | string)[] en lugar de elegir un tipo y ocultar la discrepancia, o negarse a generar nada. Un array vacío no tiene de qué inferir y se tipa como unknown[]; acótalo a mano una vez que sepas qué se supone que debe contener el array.',
                ],
            },
            {
                heading: 'Lo que deliberadamente no infiere',
                body: [
                    'Toda cadena se convierte en string y todo número en number — no hay ningún intento de detectar que un campo siempre parece una fecha, un correo electrónico, o uno de tres valores fijos, y acotarlo a una unión literal o a un tipo marcado. Un acotamiento fiable necesitaría una muestra mayor que una sola respuesta, o conocimiento del dominio que esta herramienta no tiene; adivinar mal sería peor que dejar el campo como string.',
                ],
            },
        ],
        limitations: [
            'Una respuesta de ejemplo es una muestra, no un esquema. Un campo que resulta ser null o un número entero en tu único pegado, pero que a veces es una cadena o un decimal en otras respuestas, se tipará de forma demasiado estricta. Prueba la interfaz generada contra varias respuestas reales distintas, no solo una.',
            'Los nombres de interfaces y propiedades generados provienen de tus claves JSON y no se deduplican más allá de formas de campo idénticas — dos objetos con formas distintas que provienen ambos de un campo llamado "data" se llamarán Data y Data2, lo cual se lee como "el segundo" en lugar de algo descriptivo. Renómbralos una vez que sepas qué representan.',
        ],
        faq: [
            {
                q: '¿Maneja JSON profundamente anidado?',
                a: 'Sí — el anidamiento no tiene límite de profundidad. Cada objeto anidado se convierte en su propia interfaz con nombre, sin importar a cuántos niveles de profundidad aparezca.',
            },
            {
                q: '¿Qué pasa con un array que mezcla objetos y primitivos?',
                a: 'Los elementos de objeto se fusionan en una interfaz como de costumbre, los elementos primitivos aportan sus propios tipos, y el tipo del elemento del array es la unión de ambos — por ejemplo (Order | string)[].',
            },
            {
                q: '¿Puedo establecer mi propio nombre de interfaz raíz?',
                a: 'La interfaz raíz generada se llama Root por defecto cuando editas el JSON en la herramienta. Esta página la nombra según lo que representa el ejemplo (ApiUser) puramente por legibilidad en el ejemplo.',
            },
            {
                q: '¿Se envía mi JSON a un servidor para generar los tipos?',
                a: 'No. El generador se ejecuta en tu navegador y nunca sube lo que pegas, lo cual importa dado que una respuesta real de API es exactamente lo que pegarías aquí.',
            },
        ],
    },
};
