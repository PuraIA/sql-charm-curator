import type { XmlToolSlug, XmlToolGuideTranslation } from '../xml-tools';

/** Traducciones al español para /xml/<slug> (herramientas, no guías). */
export const XML_TOOL_TRANSLATIONS_ES: Partial<Record<XmlToolSlug, XmlToolGuideTranslation>> = {
    xpath: {
        h1: 'Probador de XPath',
        tagline: 'Un evaluador de XPath 1.0 de alcance acotado —rutas, predicados y pruebas text()/@nombre— sobre el propio analizador XML de este sitio.',
        intro: [
            'Un navegador ya incluye un motor de XPath 1.0 real y completo —document.evaluate()— pero necesita un DOM activo, que solo existe en una pestaña de navegador, no durante la generación de páginas en tiempo de compilación de este sitio ni en sus pruebas automatizadas. Así que esta herramienta funciona con su propio evaluador: un subconjunto de XPath 1.0 deliberadamente acotado que cubre lo que la gente realmente escribe en un probador de XPath —rutas de ubicación, el puñado de formas de predicado que aparecen constantemente, y las pruebas de nodo @nombre / text()— construido sobre el propio analizador XML de este sitio en lugar de la gramática completa del W3C y su biblioteca de funciones.',
            "El ejemplo de librería de abajo está cargado en el editor de arriba con /bookstore/book[@category='children']/title como expresión inicial —cambia la expresión y la lista de coincidencias de abajo se actualiza de inmediato.",
        ],
        examples: [
            {
                explanation: 'Los tres elementos <book>, en el orden del documento —una ruta absoluta simple.',
            },
            {
                explanation: 'Cada <title>, encontrado a cualquier profundidad —el atajo // busca, no exige una ruta exacta.',
            },
            {
                explanation: 'Solo el libro cuyo atributo category es exactamente "children" —una coincidencia.',
            },
            {
                explanation: 'El primer libro por posición en el documento —las posiciones en XPath empiezan en 1, no en 0.',
            },
            {
                explanation: 'El último libro, sea cual sea el conteo —last() se adapta si se añaden o quitan libros.',
            },
            {
                explanation: 'El contenido de texto del elemento <price> del primer libro, como su propio tipo de coincidencia —no el elemento en sí.',
            },
            {
                explanation: 'Cada atributo del primer libro —@category y @id— usando el eje de atributo en lugar del nombre de un atributo específico.',
            },
            {
                explanation: 'El padre de cada <title> —el <book> que lo envuelve— un nivel de .. por cada nivel escrito.',
            },
            {
                explanation: 'Solo el <title> cuyo texto contiene "Potter" como subcadena —una coincidencia parcial, no exacta.',
            },
            {
                explanation: 'No es en absoluto una lista de nodos —es un único número, 3, el conteo de elementos coincidentes.',
            },
        ],
        sections: [
            {
                heading: 'Los predicados se ejecutan en secuencia, cada uno acotando lo anterior',
                body: [
                    "/bookstore/book[@category='cooking'][1] aplica dos predicados: primero conserva solo los libros de cocina, luego toma el primero de lo que queda. Cada [..] filtra el resultado de todo lo anterior a él, de la misma forma en que lo harían llamadas encadenadas a .filter() en código —no son condiciones independientes comprobadas todas contra la lista original.",
                ],
            },
            {
                heading: '@nombre y text() leen el elemento actual, no sus hijos',
                body: [
                    'book[1]/@category lee el propio atributo category de book[1]. Esto parece obvio, pero es una distinción real respecto a book[1]/title, que sí desciende a un hijo —@ y text() son sus propios ejes (attribute:: y una prueba de nodo de texto), no un atajo para "mirar dentro." Escribir //@category en su lugar busca los atributos de cada descendiente, lo cual es una consulta genuinamente diferente y más amplia.',
                ],
            },
            {
                heading: 'Una ruta con cero coincidencias no es un error',
                body: [
                    '/bookstore/nonexistent se evalúa limpiamente a cero coincidencias —de la misma forma que una consulta de base de datos que no coincide con ninguna fila no es un error de base de datos. Un error en rojo solo aparece para algo que este evaluador no puede analizar o evaluar en absoluto, como un [ desbalanceado o una función que no implementa.',
                ],
            },
        ],
        limitations: [
            'Solo se recorre un nivel de ".." por cada ".." escrito —//title/../.. sube correctamente dos niveles porque hay dos ".." escritos, pero este evaluador no tiene forma de subir más allá del número de ".." realmente presentes en la expresión (lo cual coincide con la semántica real de XPath; no hay atajo para "subir N niveles" aparte de escribir ".." N veces).',
            'Una etiqueta con prefijo de espacio de nombres como soap:Body se compara como la cadena literal "soap:Body", sin resolverse contra su declaración xmlns —la misma simplificación que hace el convertidor de XML a JSON de este sitio, por la misma razón: la resolución adecuada de espacios de nombres es un problema considerablemente mayor que lo que la mayoría de las pruebas de XPath realmente necesitan.',
            'El operador de unión (|), los ejes following/preceding, y la mayor parte de la biblioteca de funciones de XPath más allá de contains() y count() no están implementados —una expresión que los use falla al analizarse con un error claro en lugar de interpretarse mal silenciosamente.',
        ],
        faq: [
            {
                q: '¿Por qué no usar simplemente el soporte de XPath integrado del navegador?',
                a: 'document.evaluate() necesita un DOM activo, que solo existe en una pestaña de navegador —no puede ejecutarse durante la generación de páginas en tiempo de compilación de este sitio ni en sus pruebas automatizadas, ambas necesitando exactamente la misma lógica de evaluación que usa la herramienta interactiva. Este evaluador funciona de forma idéntica en todas partes.',
            },
            {
                q: '¿Qué pasa si mi expresión usa una sintaxis que esto no soporta?',
                a: 'Obtienes un error de análisis claro que nombra qué está mal, en lugar de un resultado silenciosamente incorrecto. El operador de unión, la mayoría de los ejes más allá de child/descendant-or-self/self/parent, y la mayoría de las funciones más allá de contains() y count() caen en esta categoría —ver Limitaciones conocidas.',
            },
            {
                q: '¿Las posiciones empiezan en 0 o en 1?',
                a: 'Empiezan en 1, igual que el XPath real: [1] es la primera coincidencia, no la segunda. Esta es una fuente común de errores de desfase para cualquiera acostumbrado a lenguajes que empiezan en 0.',
            },
            {
                q: '¿Se sube mi XML a algún lugar?',
                a: 'No. Tanto el análisis como la evaluación se ejecutan en tu navegador.',
            },
        ],
    },
};
