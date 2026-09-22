import type { SqlToolSlug, SqlToolGuideTranslation } from '../sql-tools';

/** Traduções em português para /sql/<slug> (ferramentas, não dialetos). */
export const SQL_TOOL_TRANSLATIONS_PT: Partial<Record<SqlToolSlug, SqlToolGuideTranslation>> = {
    diff: {
        h1: 'Diff de SQL',
        tagline: 'Formata as duas consultas da mesma forma primeiro, para que só a mudança real apareça no diff.',
        intro: [
            'Comparar duas consultas SQL como texto bruto quase nunca mostra o que realmente mudou: uma versão com palavras-chave em minúsculas, a outra em maiúsculas; uma quebrada em 80 caracteres, a outra em 120 — nada disso é uma mudança real, mas um diff em nível de texto não consegue distinguir entre "reformatado" e "reescrito". Esta ferramenta roda as duas consultas pela mesma passagem exata do sql-formatter — mesmo dialeto, mesma capitalização, mesma indentação — antes de compará-las linha por linha, então uma reformatação produz um par *idêntico*, e o diff fica vazio. O que sobra depois disso é a mudança que importa.',
            'O exemplo abaixo está carregado no editor acima: uma consulta ganha um filtro WHERE e um ORDER BY / LIMIT para paginação. As duas consultas são formatadas no mesmo estilo, então o diff abaixo isola exatamente essas adições — nem uma linha de ruído vindo da própria reformatação.',
        ],
        sections: [
            {
                heading: 'O diff é em nível de linha, calculado da mesma forma que o `diff` calcula um',
                body: [
                    'Isso não é uma comparação ingênua linha por linha, que faria uma única linha inserida no meio parecer que todas as linhas seguintes mudaram. Ele implementa o algoritmo de menor script de edição de Myers — o mesmo algoritmo por trás do utilitário Unix diff e do git diff — que encontra o conjunto mínimo de adições e remoções de linhas que transforma a consulta Antes na consulta Depois.',
                    'No exemplo, a nova cláusula WHERE e a nova cláusula ORDER BY / LIMIT são as únicas linhas marcadas como alteradas; toda linha que existe em ambas as consultas, incluindo as que vêm depois do ponto de inserção, permanece sem marcação.',
                ],
            },
            {
                heading: 'Formatar primeiro é o que torna o diff significativo',
                body: [
                    'As duas consultas são formatadas com o dialeto e as opções selecionadas acima antes de qualquer comparação. Cole exatamente a mesma consulta nas duas caixas, no estilo que você originalmente escreveu, e o diff não vai mostrar nada — o que é a resposta correta, e a forma mais rápida de confirmar que uma mudança que você fez foi puramente cosmética.',
                ],
            },
            {
                heading: 'Quando uma consulta falha ao formatar',
                body: [
                    'Se uma consulta não é interpretada corretamente no dialeto selecionado, esta ferramenta recai da mesma forma que o Formatador SQL faz: um conjunto reduzido de opções, depois uma passagem SQL genérica, antes de desistir e reportar um erro. Um diff ainda precisa que os dois lados tenham passado pelo mesmo caminho de recuo para ser significativo, então se um lado cai no recuo genérico e o outro não, pequenas diferenças de formatação vindas dessa incompatibilidade podem aparecer como ruído no diff.',
                ],
            },
        ],
        limitations: [
            'O diff é baseado em linhas, não em tokens: uma única palavra alterada no meio de uma linha longa (um alias renomeado, um valor literal alterado) marca a linha inteira como removida e readicionada, em vez de destacar apenas a palavra alterada dentro dela.',
            'Comparar entre dois dialetos diferentes é possível — a ferramenta não impede — mas raramente é útil, já que a mesma consulta pode se formatar de forma diferente sob as gramáticas de dialetos diferentes por motivos que não têm nada a ver com uma edição real.',
        ],
        faq: [
            {
                q: 'Por que colar a mesma consulta nos dois lados às vezes ainda mostra um diff?',
                a: 'Não deveria, e não mostra, desde que os dois lados sejam interpretados da mesma forma sob o dialeto selecionado. Se um lado cai em um nível de recuo diferente do outro — um precisa da passagem genérica, o outro não — os dois podem acabar formatados de forma ligeiramente diferente mesmo que a entrada fosse idêntica.',
            },
            {
                q: 'Posso comparar consultas escritas em dialetos SQL diferentes?',
                a: 'A ferramenta permite, mas um diff entre duas gramáticas diferentes geralmente reflete diferenças de dialeto, não uma edição real — ela é feita para comparar duas versões da mesma consulta no mesmo dialeto.',
            },
            {
                q: 'Ele compara instruções inteiras ou linhas individuais?',
                a: 'Linhas, depois da formatação — a mesma unidade que o git diff usa para código. Uma mudança dentro de uma única linha (como uma coluna renomeada) marca a linha inteira como alterada, não apenas a parte alterada dela.',
            },
            {
                q: 'Minhas consultas são enviadas para algum lugar?',
                a: 'Não. Tanto a formatação quanto o diff rodam no seu navegador, o que importa aqui já que comparar duas versões de uma consulta costuma significar comparar duas versões com nomes reais de tabelas e colunas nelas.',
            },
        ],
    },
};
