import type { SqlToolSlug, SqlToolGuideTranslation } from '../sql-tools';

/** Traducciones al español para /sql/<slug> (herramientas, no dialectos). */
export const SQL_TOOL_TRANSLATIONS_ES: Partial<Record<SqlToolSlug, SqlToolGuideTranslation>> = {
    diff: {
        h1: 'Diff de SQL',
        tagline: 'Formatea ambas consultas de la misma forma primero, para que solo el cambio real aparezca en el diff.',
        intro: [
            'Comparar dos consultas SQL como texto plano casi nunca muestra lo que realmente cambió: una versión con palabras clave en minúsculas, la otra en mayúsculas; una envuelta a los 80 caracteres, la otra a los 120 — nada de eso es un cambio real, pero un diff a nivel de texto no puede distinguir entre "reformateado" y "reescrito". Esta herramienta pasa ambas consultas por exactamente el mismo proceso de sql-formatter —mismo dialecto, mismas mayúsculas, misma sangría— antes de compararlas línea por línea, así que un reformateo produce un par *idéntico*, y el diff queda vacío. Lo que queda después de eso es el cambio que importa.',
            'El ejemplo de abajo está cargado en el editor de arriba: una consulta gana un filtro WHERE y un ORDER BY / LIMIT para paginación. Ambas consultas se formatean con el mismo estilo, así que el diff de abajo aísla exactamente esas adiciones —ni una sola línea de ruido proveniente del propio reformateo.',
        ],
        sections: [
            {
                heading: 'El diff es a nivel de línea, calculado de la misma forma en que `diff` calcula uno',
                body: [
                    'Esto no es una comparación ingenua línea por línea, que haría que una sola línea insertada en el medio pareciera que todas las líneas siguientes cambiaron. Implementa el algoritmo de guion de edición más corto de Myers —el mismo algoritmo detrás de la utilidad Unix diff y de git diff— que encuentra el conjunto mínimo de adiciones y eliminaciones de líneas que convierte la consulta Antes en la consulta Después.',
                    'En el ejemplo, la nueva cláusula WHERE y la nueva cláusula ORDER BY / LIMIT son las únicas líneas marcadas como cambiadas; cada línea que existe en ambas consultas, incluidas las que van después del punto de inserción, permanece sin marcar.',
                ],
            },
            {
                heading: 'Formatear primero es lo que hace significativo el diff',
                body: [
                    'Ambas consultas se formatean con el dialecto y las opciones seleccionadas arriba antes de comparar nada. Pega exactamente la misma consulta en ambos cuadros, en el estilo en que originalmente la escribiste, y el diff no mostrará nada —lo cual es la respuesta correcta, y la forma más rápida de confirmar que un cambio que hiciste fue puramente cosmético.',
                ],
            },
            {
                heading: 'Cuando una consulta no logra formatearse',
                body: [
                    'Si una consulta no se analiza correctamente bajo el dialecto seleccionado, esta herramienta recurre a un respaldo de la misma forma que lo hace el Formateador SQL: un conjunto de opciones reducido, luego un paso SQL genérico, antes de rendirse y reportar un error. Un diff aún necesita que ambos lados hayan pasado por la misma ruta de respaldo para ser significativo, así que si un lado llega al respaldo genérico y el otro no, pequeñas diferencias de formato provenientes de ese desajuste pueden aparecer como ruido en el diff.',
                ],
            },
        ],
        limitations: [
            'El diff se basa en líneas, no en tokens: una sola palabra cambiada en medio de una línea larga (un alias renombrado, un valor literal cambiado) marca la línea completa como eliminada y vuelta a añadir, en lugar de resaltar solo la palabra cambiada dentro de ella.',
            'Comparar entre dos dialectos distintos es posible —la herramienta no lo impide— pero rara vez es útil, ya que la misma consulta puede formatearse de forma diferente bajo las gramáticas de distintos dialectos por razones que no tienen nada que ver con una edición real.',
        ],
        faq: [
            {
                q: '¿Por qué pegar la misma consulta en ambos lados a veces igual muestra un diff?',
                a: 'No debería, y no lo hace, siempre que ambos lados se analicen de la misma forma bajo el dialecto seleccionado. Si un lado llega a un nivel de respaldo distinto al otro —uno necesita el paso genérico, el otro no— los dos pueden terminar formateados de forma ligeramente distinta aunque la entrada fuera idéntica.',
            },
            {
                q: '¿Puedo comparar consultas escritas en distintos dialectos SQL?',
                a: 'La herramienta te lo permite, pero un diff entre dos gramáticas distintas normalmente refleja diferencias de dialecto, no una edición real —está construida para comparar dos versiones de la misma consulta en el mismo dialecto.',
            },
            {
                q: '¿Compara sentencias completas o líneas individuales?',
                a: 'Líneas, después de formatear —la misma unidad que usa git diff para código. Un cambio dentro de una sola línea (como una columna renombrada) marca toda esa línea como cambiada, no solo la parte cambiada de ella.',
            },
            {
                q: '¿Se suben mis consultas a algún lugar?',
                a: 'No. Tanto el formateo como el diff se ejecutan en tu navegador, lo cual importa aquí ya que comparar dos versiones de una consulta a menudo significa comparar dos versiones con nombres reales de tablas y columnas en ellas.',
            },
        ],
    },
};
