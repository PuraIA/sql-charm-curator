import type { ConverterGuideTranslation } from '../converter-guides';

/** Traducciones al español para /json/to-xml, /xml/to-json, /json/to-yaml, /xml/to-yaml. */
export const CONVERTER_TRANSLATIONS_ES: Partial<Record<string, ConverterGuideTranslation>> = {
    'json/to-xml': {
        h1: 'Convertidor de JSON a XML',
        tagline: 'Atributos con @, arrays como hermanos repetidos — el mapeo es explícito, no adivinado.',
        intro: [
            'JSON y XML no comparten un modelo de datos, así que cualquier convertidor entre ellos en realidad se compromete con una convención y espera que coincida con lo que necesitas. La convención de este convertidor es pequeña y explícita: una clave que empieza con @ se convierte en un atributo, una clave #text se convierte en contenido de texto, y un array se convierte en elementos hermanos repetidos bajo el nombre de etiqueta de esa clave — no un elemento envoltorio con hijos numerados, que es la otra opción común y que en la práctica se lee peor.',
            'El ejemplo de abajo está cargado en el convertidor de arriba. Dos pedidos, ambos con un atributo @id, se convierten en dos elementos hermanos <order> en lugar de un envoltorio <orders><order>...</order><order>...</order></orders> — la propia clave del array (order) ya es el nombre de etiqueta repetido.',
        ],
        mapping: [
            {
                heading: '@clave se convierte en un atributo',
                body: [
                    'A una clave que empieza con @ se le quita ese prefijo y se adjunta a su elemento como atributo, en el orden en que aparece en el objeto. @id: "1001" en un objeto de pedido se convierte en id="1001" en esa etiqueta <order>.',
                ],
            },
            {
                heading: '#text se convierte en contenido de texto — utilizable junto con atributos',
                body: [
                    'Un objeto JSON ordinario no tiene dónde poner "este elemento tiene un atributo y también texto" — los objetos no tienen una posición implícita para el texto como sí la tienen los elementos XML. #text es la clave explícita para eso: {"@id": "1", "#text": "hello"} produce <tag id="1">hello</tag>.',
                ],
            },
            {
                heading: 'Los arrays se convierten en elementos repetidos, no en un envoltorio',
                body: [
                    'order: [ {...}, {...} ] produce dos elementos hermanos <order> — la propia clave suministra el nombre de etiqueta repetido. Un array desnudo sin esa clave (convirtiendo un array JSON directamente, sin nada que lo envuelva) no tiene un nombre de etiqueta natural que reutilizar, así que recurre a un <item> genérico para cada entrada dentro de un <root> por defecto.',
                ],
            },
            {
                heading: 'null se convierte en un elemento vacío; cualquier otro escalar se convierte en texto',
                body: [
                    'Un null de JSON no tiene equivalente en XML, así que se convierte en un elemento vacío autocerrado: null -> <key/>. Los números y booleanos se convierten en su forma de cadena como texto del elemento — 8080 se convierte en el texto "8080" — ya que el texto en XML son siempre solo caracteres.',
                ],
            },
        ],
        limitations: [
            'Una clave JSON que no es un nombre XML válido —espacios, un dígito inicial, la mayoría de la puntuación— se reescribe en lugar de rechazarse: los caracteres inválidos se convierten en _, y un nombre que aún empezaría con un dígito recibe un _ inicial. Esta es una transformación visible y probada (2fa se convierte en _2fa), no silenciosa, pero sí significa que el nombre de etiqueta de salida no siempre es idéntico a la clave de entrada.',
            'Convertir un array JSON de vuelta desde XML y otra vez hacia adelante no es perfectamente estable cuando el array contiene una mezcla de objetos y valores simples —el mapeo está diseñado en torno a arrays de una forma consistente, lo cual cubre la inmensa mayoría de las respuestas de API reales y los arrays de configuración.',
        ],
        faq: [
            {
                q: '¿Por qué @ para los atributos en lugar de otra convención?',
                a: 'No hay un estándar aquí —varias bibliotecas JSON-XML usan @, y tiene la ventaja de ordenarse de forma distinta a las claves ordinarias y ser inequívoco dentro de una clave JSON en texto plano. Este convertidor documenta su elección exacta en lugar de asumir que es la única razonable.',
            },
            {
                q: '¿Puedo convertir un array JSON directamente, sin nada que lo envuelva?',
                a: 'Sí —se envuelve en un <root> por defecto, con cada elemento como un <item>, ya que un array desnudo no tiene una clave propia que reutilizar como el nombre de etiqueta repetido.',
            },
            {
                q: '¿Es reversible la conversión?',
                a: 'Para las formas que esta convención tiene como objetivo —objetos, atributos, arrays de una forma consistente— sí: convertir el resultado de vuelta con XML a JSON reproduce el mismo JSON, comprobado por las propias pruebas de este sitio. El contenido mixto de texto y elementos es el único caso que no lo es: consulta las propias limitaciones de /xml/to-json para saber por qué.',
            },
            {
                q: '¿Se sube mi JSON a algún lugar?',
                a: 'No. La conversión se ejecuta en tu navegador; no se envía nada a un servidor.',
            },
        ],
    },

    'xml/to-json': {
        h1: 'Convertidor de XML a JSON',
        tagline: 'Atributos, etiquetas repetidas y contenido de texto, mapeados a claves JSON simples.',
        intro: [
            'Lo difícil de convertir XML en JSON no es la sintaxis, sino que XML lleva información para la que JSON no tiene un lugar nativo: atributos, y texto que está junto a elementos hijos en lugar de ser el único contenido. La regla de este convertidor para ambos es explícita en lugar de implícita —ver el mapeo de abajo— y es la misma regla que /json/to-xml usa a la inversa, así que un viaje de ida y vuelta por ambas páginas es estable para las formas que esto cubre.',
            'El ejemplo de abajo —un pequeño feed de productos, del tipo que una API interna más antigua podría devolver— está cargado en el convertidor de arriba. Cada <product> lleva un atributo sku y un <price> anidado que a su vez tiene un atributo currency y texto: exactamente el caso que necesita tanto @ como #text para representarse fielmente.',
        ],
        mapping: [
            {
                heading: 'Los atributos se convierten en claves con prefijo @',
                body: [
                    'sku="SKU-100" en un elemento <product> se convierte en "@sku": "SKU-100" en su objeto JSON. El @ mantiene los atributos visualmente distintos de los elementos hijos cuando estás leyendo el JSON, y es lo que /json/to-xml busca para convertir de vuelta en la otra dirección.',
                ],
            },
            {
                heading: 'Un elemento con solo texto colapsa a una cadena simple',
                body: [
                    '<name>Wireless Mouse</name> se convierte directamente en "name": "Wireless Mouse" —no {"#text": "Wireless Mouse"}— porque no hay nada más en ese elemento (sin atributos, sin hijos) junto a lo cual la clave #text necesitaría estar.',
                ],
            },
            {
                heading: '...pero #text aparece en cuanto también hay un atributo',
                body: [
                    'El elemento <price> de arriba tiene tanto un atributo como texto, así que no puede colapsar a una cadena desnuda —no habría dónde poner la moneda. En su lugar se convierte en {"@currency": "BRL", "#text": "129.90"}.',
                ],
            },
            {
                heading: 'Las etiquetas repetidas se convierten en un array, en el orden del documento',
                body: [
                    'Dos elementos <product> bajo <products> se convierten en un array "product" con dos entradas, en el orden en que aparecieron —no dos claves separadas ni fusionadas en un objeto. Un único <product> (sin hermanos) sigue siendo un objeto simple, no un array de un elemento.',
                ],
            },
            {
                heading: 'Todo valor se convierte en una cadena — a propósito',
                body: [
                    'El texto en XML son siempre solo caracteres; el propio XML no tiene tipo numérico ni booleano. El 129.90 de arriba permanece como la cadena "129.90" en lugar de interpretarse como el número 129.9, lo cual también normalizaría silenciosamente ese cero final. Adivinar el tipo sería exactamente eso —una suposición— la misma decisión que toma el convertidor de JSON a TypeScript de este sitio, por la misma razón.',
                ],
            },
        ],
        limitations: [
            'El contenido mixto —texto intercalado con elementos hijos, como <p>Hello <b>world</b>!</p>— pierde el orden entre el texto y el elemento: se convierte en {"#text": "Hello !", "b": "world"}, lo cual no puede distinguir eso de "!<b>world</b>Hello ". Este convertidor está construido para XML con forma de configuración y API, no para marcado tipo prosa, y aquí es donde eso se nota.',
            'Los espacios de nombres XML se tratan como simples prefijos de cadena —soap:Envelope se convierte en la clave JSON "soap:Envelope" como texto literal, sin resolverse contra su declaración xmlns. Este es un límite de alcance real y deliberado: la resolución consciente de espacios de nombres es un problema significativamente mayor que el XML de configuración y respuesta de API al que apunta este convertidor.',
            'Los comentarios y las instrucciones de procesamiento se descartan —no son datos, así que no hay una clave JSON en la que puedan convertirse.',
        ],
        faq: [
            {
                q: '¿Por qué un elemento se convierte en una cadena simple y otro en un objeto?',
                a: 'Un elemento sin atributos y sin hijos colapsa a solo su texto, como una cadena. Uno con un atributo, un elemento hijo, o ambos, se convierte en un objeto —porque una cadena simple no tiene dónde adjuntar esa información extra.',
            },
            {
                q: '¿Qué pasa con los comentarios XML?',
                a: 'Se descartan. Los comentarios documentan el XML para un lector humano; no forman parte de los datos, así que no hay un valor JSON correspondiente para ellos.',
            },
            {
                q: '¿Maneja las secciones CDATA?',
                a: 'Sí —el contenido dentro de <![CDATA[ ... ]]> se toma literalmente como texto, sin volver a interpretarlo como marcado, exactamente igual que un nodo de texto normal.',
            },
            {
                q: '¿Se sube mi XML a algún lugar?',
                a: 'No. Tanto el análisis como la conversión se ejecutan en tu navegador usando el propio analizador XML de este sitio, no una llamada a un servidor.',
            },
        ],
    },

    'json/to-yaml': {
        h1: 'Convertidor de JSON a YAML',
        tagline: 'No hay convención que diseñar — YAML ya es el modelo de datos de JSON, solo escrito de otra forma.',
        intro: [
            'A diferencia de JSON a XML, esta dirección no tiene convención que inventar: un mapeo YAML es un objeto JSON, una secuencia YAML es un array JSON, y los escalares de YAML son las mismas cadenas, números, booleanos y null que JSON ya tiene. Convertir es en realidad solo volver a serializar los mismos valores —lo cual también explica por qué esta es la única conversión de este sitio sin "limitaciones conocidas" sobre información perdida.',
            'El ejemplo de abajo es un fragmento de Deployment de Kubernetes —el tipo de documento para el que YAML se usa constantemente y JSON casi nunca, que suele ser el motivo real por el que alguien quiere esta conversión: editar datos estructurados a mano en el formato que espera su herramienta.',
        ],
        mapping: [
            {
                heading: 'El anidamiento se convierte en sangría',
                body: [
                    'Las claves de un objeto JSON se convierten en la sintaxis de mapeo en bloque de YAML (clave: valor, con sangría bajo su padre), y un array JSON se convierte en una secuencia en bloque (- elemento, uno por línea). No hay distinción atributo/texto en torno a la cual diseñar, porque ninguno de los dos formatos tiene atributos.',
                ],
            },
            {
                heading: 'Las cadenas se citan solo cuando YAML las interpretaría mal de otro modo',
                body: [
                    'apiVersion: apps/v1 se escribe sin comillas —un escalar simple sin citar— porque YAML no tiene problema en interpretarlo como una cadena. Un valor que parece un número, booleano o null de YAML (como el texto "true", "null", o "123") se cita para que vuelva como una cadena en lugar de reinterpretarse como ese otro tipo. Una cadena que contiene ": " (dos puntos-espacio) se cita por la misma razón: sin comillas, YAML la leería como otro par clave-valor en lugar de un solo valor.',
                ],
            },
            {
                heading: 'Una cadena multilínea se convierte en un literal de bloque, no en una línea escapada',
                body: [
                    'Una cadena JSON que contiene \\n se escribe usando el estilo de literal de bloque | de YAML —el texto en sus propias líneas con sangría— en lugar de una sola línea citada con una barra invertida n literal dentro. Se lee tal como realmente se ve el texto original, lo cual importa para cualquier cosa como una descripción multilínea o un comando de shell incrustado en una configuración de CI.',
                ],
            },
        ],
        limitations: [
            'Ninguna específica de esta dirección: todo valor JSON (objeto, array, cadena, número, booleano, null) tiene un equivalente YAML directo, así que nada aquí es una suposición de la forma en que lo es un atributo o un nombre de etiqueta repetido en el lado XML. Lo único que hay que saber es general de YAML, no de este convertidor: un documento YAML puede expresar cosas que JSON no puede (anclas y alias para estructuras repetidas, múltiples documentos en un archivo, comentarios) —convertir JSON a YAML nunca producirá eso, ya que JSON no tiene nada de lo que estas puedan surgir.',
        ],
        faq: [
            {
                q: '¿Esta conversión pierde información alguna vez?',
                a: 'No para nada que el propio JSON pueda representar. Todo objeto, array, cadena, número, booleano y null se mapea directamente a su equivalente YAML sin nada que quede por adivinar.',
            },
            {
                q: '¿Por qué algunas cadenas se citan y otras no?',
                a: 'Una cadena se cita solo cuando dejarla sin comillas cambiaría su significado en YAML —por ejemplo el texto literal "true" o "123", que de otro modo se interpretaría de vuelta como un booleano o un número en lugar de una cadena.',
            },
            {
                q: '¿Puedo convertir un manifiesto de Kubernetes o un archivo docker-compose de esta forma?',
                a: 'Sí, para la dirección de pegar JSON y obtener YAML —la mayoría de las herramientas de infraestructura acepta ambos, y esto produce YAML válido para cualquier cosa que empezara como JSON válido.',
            },
            {
                q: '¿Se sube mi información a algún lugar?',
                a: 'No. La conversión se ejecuta en tu navegador, lo cual importa aquí ya que las configuraciones de Kubernetes y CI a menudo contienen nombres internos de servicios.',
            },
        ],
    },

    'xml/to-yaml': {
        h1: 'Convertidor de XML a YAML',
        tagline: 'Pasa por la misma convención @ / #text que XML a JSON, y luego serializa como YAML.',
        intro: [
            'Esto son dos conversiones ejecutadas una tras otra, no una directa separada: el XML se analiza en la misma representación JSON de atributo-@ / #text / etiqueta-repetida que produce /xml/to-json, y ese valor luego se escribe como YAML en lugar de JSON. Cada regla y cada limitación documentada en /xml/to-json se aplica aquí de forma idéntica —esta página existe porque "xml a yaml" es una búsqueda que alguien realmente escribe, no porque la conversión subyacente sea diferente de alguna manera.',
            'El ejemplo reutiliza el mismo feed de productos que /xml/to-json, así que puedes comparar las dos salidas directamente: las mismas claves @sku y #text, solo que escritas como mapeos YAML en lugar de objetos JSON.',
        ],
        mapping: [
            {
                heading: 'Los atributos y el texto siguen exactamente la convención de XML a JSON',
                body: [
                    "@sku: SKU-100 y #text: '129.90' de abajo son las mismas claves de atributo con prefijo @ y contenido #text documentadas en /xml/to-json, solo que renderizadas en la sintaxis clave: valor de YAML en lugar de \"clave\": \"valor\" de JSON. El uso de comillas en el lado de YAML sigue la regla habitual de YAML: '@sku' se cita porque una clave que empieza con @ lo necesita, y '129.90' se cita para que siga siendo una cadena en lugar de leerse de vuelta como un número.",
                ],
            },
            {
                heading: 'Los elementos repetidos se convierten en una secuencia YAML',
                body: [
                    'Dos elementos hermanos <product> se convierten en una clave product: que contiene una secuencia YAML (- @sku: ... / - @sku: ...) —el paso de array ocurre durante el análisis del XML, exactamente igual que en /xml/to-json; solo el paso final de serialización difiere.',
                ],
            },
            {
                heading: 'Los números del XML permanecen como cadenas citadas en el YAML',
                body: [
                    "El 129.90 de arriba sale como la cadena YAML citada '129.90', no como el número desnudo 129.9 —porque nunca fue un número para empezar. El texto en XML son siempre caracteres (ver el mapeo de /xml/to-json para saber por qué este convertidor no adivina lo contrario), así que el paso de YAML tiene una cadena que serializar, y la cita de la misma forma en que citaría cualquier cadena que resulte parecer numérica.",
                ],
            },
        ],
        limitations: [
            'Toda limitación de /xml/to-json se aplica aquí primero, antes incluso de que YAML entre en juego: el contenido mixto pierde el orden, los espacios de nombres se tratan como prefijos de cadena literales, los comentarios se descartan, y todo valor de texto XML se convierte en una cadena en lugar de interpretarse como un número o booleano.',
        ],
        faq: [
            {
                q: '¿Es esta una conversión distinta de XML a JSON?',
                a: 'No —analiza el XML usando exactamente las mismas reglas, y luego serializa el resultado como YAML en lugar de JSON. Cada regla de mapeo y limitación se comparte con /xml/to-json.',
            },
            {
                q: "¿Por qué algunas claves se citan en la salida YAML, como '@sku'?",
                a: 'YAML requiere citar un escalar simple que de otro modo sería ambiguo —una clave que empieza con @ es uno de esos casos. Es un requisito de sintaxis de YAML, no algo que este convertidor añada por su cuenta.',
            },
            {
                q: '¿Se sube mi XML a algún lugar?',
                a: 'No. Tanto el paso de análisis como la serialización a YAML se ejecutan en tu navegador.',
            },
        ],
    },
};
