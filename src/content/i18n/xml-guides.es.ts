import type { XmlGuideSlug, XmlGuideTranslation } from '../xml-guides';

/** Traducciones al español para /xml/<slug>. Ver xml-guides.ts para los campos aceptados. */
export const XML_TRANSLATIONS_ES: Partial<Record<XmlGuideSlug, XmlGuideTranslation>> = {
    minify: {
        h1: 'Minificador de XML',
        tagline: 'Colapsa el espacio en blanco entre etiquetas con el Modo Compacto, sin tocar CDATA ni comentarios.',
        intro: [
            'El Modo Compacto, el interruptor junto a Cargar Ejemplo más abajo, elimina el espacio en blanco que un formateador bonito añade entre etiquetas — el salto de línea y la sangría después de un >, antes del siguiente <. Lo hace con una regla estrecha en lugar de una reescritura completa consciente del XML: solo se toca el espacio en blanco que está estrictamente entre dos etiquetas. El espacio en blanco dentro del propio contenido de un nodo de texto, dentro de un valor de atributo, o dentro de una sección CDATA se deja exactamente como estaba, porque ese espacio en blanco puede ser parte de los datos en lugar de formato.',
            'El ejemplo con forma de SOAP de abajo está cargado en el editor de arriba. Activa el Modo Compacto para verlo colapsar de la forma bonita a la línea única mostrada aquí — una reducción del 18% en esta muestra, calculada de la misma forma para lo que tú pegues.',
        ],
        sections: [
            {
                heading: 'Qué permanece intacto, y por qué ese es el valor por defecto seguro',
                body: [
                    'Un comentario (<!-- ... -->) y una sección CDATA (<![CDATA[ ... ]]>) pueden ambos contener legítimamente los caracteres < y > como datos, no como marcado — un bloque CDATA es exactamente cómo se incrusta un fragmento de HTML o JavaScript dentro de XML sin escaparlo. La regla de colapso de espacio en blanco aquí solo coincide con un > literal inmediatamente seguido de espacio en blanco y un < literal, así que nunca llega dentro de ninguna de las dos construcciones para reescribir lo que es, semánticamente, una cadena.',
                ],
            },
            {
                heading: 'El contenido mixto suele ser seguro, con una excepción real',
                body: [
                    'El XML tipo prosa —un elemento cuyo texto y etiquetas hijas están entrelazados, como <p>Precalienta el horno a <b>220</b> grados.</p>— sobrevive a la minificación sin cambios siempre que haya texto real tocando el límite de la etiqueta en al menos un lado, lo cual cubre la inmensa mayoría de los documentos reales.',
                    'El único caso en que esto sale mal es deliberado, contenido de solo espacio en blanco bajo xml:space="preserve" — un elemento cuyo único propósito es que su espacio en blanco importe y no haya otro contenido al que anclarlo. Ahí, un elemento como <code xml:space="preserve">   </code> pierde sus tres espacios por completo, porque para esta regla se ven idénticos a la sangría de formato. Esto está listado en Limitaciones conocidas más abajo porque es un caso real y demostrado, no hipotético.',
                ],
            },
            {
                heading: 'Lo que el Modo Compacto no hace',
                body: [
                    'No toca el espacio en blanco dentro de una etiqueta en sí —espacios extra entre atributos, como <a   b="1"    c="2" />, se dejan tal como se escribieron, ya que colapsarlos corre el riesgo de parecer un tipo distinto de edición a "eliminar formato". Tampoco elimina comentarios ni instrucciones de procesamiento; si también quieres que se eliminen, esa es una transformación separada y más invasiva que este interruptor no realiza.',
                ],
            },
        ],
        limitations: [
            'Un nodo de texto que solo contiene espacio en blanco dentro de un elemento marcado con xml:space="preserve" se colapsa como cualquier otro espacio en blanco entre etiquetas, aunque se supone que debe preservarse. Esta es una limitación real y verificada —<code xml:space="preserve">   </code> se convierte en <code xml:space="preserve"></code>— no un caso límite hipotético.',
            'El espaciado de atributos, los comentarios y las instrucciones de procesamiento se dejan exactamente como se escribieron; si tu documento tiene espaciado redundante dentro de una etiqueta, este interruptor no lo eliminará.',
        ],
        faq: [
            {
                q: '¿Minificar romperá una sección CDATA?',
                a: 'No. El contenido CDATA nunca se toca, incluidos los corchetes angulares dentro de él —la regla solo coincide con el espacio en blanco que está estrictamente entre un > y un < al nivel de la etiqueta, nunca dentro de los delimitadores CDATA.',
            },
            {
                q: '¿Es seguro para documentos con texto y etiquetas mezclados, como XML al estilo HTML?',
                a: 'En casi todos los casos, sí —siempre que haya texto real junto al límite de la etiqueta. La única excepción documentada es un elemento xml:space="preserve" que contiene solo espacio en blanco, listado en Limitaciones conocidas.',
            },
            {
                q: '¿Minificar ahorra tanto como ya lo haría gzip?',
                a: 'Menos de lo que sugiere el conteo bruto de bytes, si la respuesta ya está comprimida —gzip maneja el espacio en blanco repetido de forma eficiente por sí solo. Minificar importa más para payloads que no están comprimidos, como algunas solicitudes SOAP y llamadas internas de servicio.',
            },
            {
                q: '¿Se envía mi XML a algún lugar?',
                a: 'No. Tanto formatear como minificar se ejecutan en tu navegador. No se sube nada, lo cual importa ya que los payloads XML como el ejemplo SOAP de arriba a menudo llevan nombres internos de servicios.',
            },
        ],
    },

    validate: {
        h1: 'Validador de XML',
        tagline: 'Comprueba la buena formación contra el propio analizador XML del navegador — y conoce lo que eso no cubre.',
        intro: [
            'Esta herramienta valida XML con el propio analizador del navegador —DOMParser, interpretando tu entrada como text/xml— en lugar de un verificador separado hecho a medida. Si el analizador del navegador acepta el documento, la herramienta lo reporta como válido; si el analizador marca un nodo parsererror, eso es lo que activa el indicador rojo ⚠ junto a la pestaña XML Original.',
            'Los ejemplos de abajo son formas comunes en que se rompe el XML real. En lugar de citar el texto de error de un navegador específico —la redacción de DOMParser difiere entre Chromium, Firefox y WebKit, así que una cadena que es exactamente correcta en uno es engañosa en otro— cada uno nombra la regla de buena formación que incumple, la cual es la misma en todo analizador conforme aunque la redacción del error no lo sea.',
        ],
        invalidExamples: [
            {
                label: 'Etiqueta de cierre no coincidente',
                rule: 'Toda etiqueta de apertura debe coincidir con una etiqueta de cierre con el nombre idéntico, sensible a mayúsculas y minúsculas. <book> se abrió y </books> se cerró —un nombre distinto— así que el documento no está bien formado.',
            },
            {
                label: 'Valor de atributo sin comillas',
                rule: "Los valores de atributo deben ir entre comillas, ya sean \" o '. A diferencia de HTML, XML no tiene una forma abreviada para un valor sin comillas —esta es una de las roturas más comunes cuando el XML es editado a mano por alguien acostumbrado a HTML.",
            },
            {
                label: 'Más de un elemento raíz',
                rule: 'Un documento XML bien formado tiene exactamente un elemento raíz que contiene todo lo demás. Dos elementos hermanos sin nada que los envuelva no son un documento —envuélvelos en un padre común.',
            },
            {
                label: 'Un & suelto en el contenido de texto',
                rule: '& siempre inicia una referencia de entidad (&amp;, &#38;, una entidad personalizada) para un analizador XML, así que un ampersand literal en el contenido de texto debe escribirse &amp;. Esto es invisible en texto plano pero rompe el análisis de inmediato.',
            },
        ],
        sections: [
            {
                heading: 'Bien formado frente a válido: dos preguntas distintas',
                body: [
                    'Un documento puede estar perfectamente bien formado —cada etiqueta cerrada, correctamente anidada, una raíz— y aun así tener la forma equivocada para lo que un consumidor espera: un elemento requerido faltante, un atributo en el lugar equivocado, un elemento hijo que no debería estar ahí. Esa segunda pregunta, más estricta, es la validez de esquema, comprobada contra un DTD o un XSD, y es un trabajo distinto al que hace esta herramienta.',
                    'Esta distinción importa porque "mi validador de XML dice que está bien" y "mi cliente SOAP lo rechaza" pueden ser ambas afirmaciones verdaderas sobre el mismo documento cuando el problema es la forma del esquema en lugar de la sintaxis. Esta herramienta responde la primera pregunta; un validador de esquema, comprobado contra el DTD o XSD específico que tu sistema espera, responde la segunda.',
                ],
            },
            {
                heading: 'Por qué aquí se deja sin especificar la redacción exacta del error',
                body: [
                    'DOMParser es una API de navegador real y en producción, pero su reporte de errores nunca se estandarizó en detalle —el analizador XML de cada motor (derivado de libxml2 en algunos, un analizador propio en otros) escribe su propio texto de mensaje para el mismo problema subyacente. En lugar de publicar la redacción de un navegador como si fuera universal, la regla que incumple cada ejemplo se describe directamente; esa regla es idéntica en todas partes, cosa que la frase específica que la describe no es.',
                ],
            },
        ],
        limitations: [
            'La validación aquí comprueba solo la buena formación —las reglas genéricas de sintaxis XML. No comprueba un documento contra un DTD o un esquema XSD, así que un documento bien formado con elementos incorrectos, atributos incorrectos, o estructura incorrecta para tu formato específico igualmente se reportará como válido.',
            'El mensaje de error exacto mostrado depende de qué navegador estés usando, ya que el texto de error de DOMParser no está estandarizado entre motores. La regla que se viola es consistente; la frase que la describe no lo es.',
        ],
        faq: [
            {
                q: '¿"Bien formado" significa que mi XML coincide con el esquema que espera mi API?',
                a: 'No —son comprobaciones distintas. Bien formado significa que las etiquetas están correctamente anidadas y cerradas. Si los elementos y atributos coinciden con lo que espera una API o formato específico es validación de esquema, contra un DTD o XSD, que esta herramienta no realiza.',
            },
            {
                q: '¿Por qué se rechaza un & literal cuando parece texto normal?',
                a: 'Porque & siempre inicia una referencia de entidad para un analizador XML, sea o no tu intención. Escribe &amp; para un ampersand literal en el contenido de texto.',
            },
            {
                q: '¿Puede un documento tener más de un elemento raíz?',
                a: 'No. Un documento XML bien formado tiene exactamente un elemento que contiene todo lo demás. Dos elementos hermanos de nivel superior necesitan un padre común que los envuelva.',
            },
            {
                q: '¿Se sube mi XML para comprobarlo?',
                a: 'No. La validación se ejecuta a través del propio DOMParser de tu navegador, de forma local —no se envía nada a ningún lugar.',
            },
        ],
    },
};
