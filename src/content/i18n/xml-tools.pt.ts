import type { XmlToolSlug, XmlToolGuideTranslation } from '../xml-tools';

/** Traduções em português para /xml/<slug> (ferramentas, não guias). */
export const XML_TOOL_TRANSLATIONS_PT: Partial<Record<XmlToolSlug, XmlToolGuideTranslation>> = {
    xpath: {
        h1: 'Testador de XPath',
        tagline: 'Um avaliador de XPath 1.0 com escopo restrito — caminhos, predicados e testes text()/@nome — sobre o próprio parser XML deste site.',
        intro: [
            'Um navegador já vem com um motor de XPath 1.0 real e completo — document.evaluate() — mas ele precisa de um DOM ativo, que só existe em uma aba de navegador, não durante a geração de páginas em tempo de build deste site nem em seus testes automatizados. Então esta ferramenta roda com seu próprio avaliador: um subconjunto de XPath 1.0 deliberadamente restrito que cobre o que as pessoas realmente digitam em um testador de XPath — caminhos de localização, o punhado de formas de predicado que aparecem constantemente, e os testes de nó @nome / text() — construído sobre o próprio parser XML deste site em vez da gramática completa do W3C e sua biblioteca de funções.',
            "O exemplo de livraria abaixo está carregado no editor acima com /bookstore/book[@category='children']/title como expressão inicial — mude a expressão e a lista de correspondências abaixo é atualizada imediatamente.",
        ],
        examples: [
            {
                explanation: 'Todos os três elementos <book>, na ordem do documento — um caminho absoluto simples.',
            },
            {
                explanation: 'Todo <title>, encontrado em qualquer profundidade — o atalho // pesquisa, não exige um caminho exato.',
            },
            {
                explanation: 'Só o livro cujo atributo category é exatamente "children" — uma correspondência.',
            },
            {
                explanation: 'O primeiro livro pela posição no documento — posições em XPath começam em 1, não em 0.',
            },
            {
                explanation: 'O último livro, seja qual for a quantidade — last() se adapta se livros forem adicionados ou removidos.',
            },
            {
                explanation: 'O conteúdo de texto do elemento <price> do primeiro livro, como seu próprio tipo de correspondência — não o elemento em si.',
            },
            {
                explanation: 'Todo atributo do primeiro livro — @category e @id — usando o eixo de atributo em vez do nome de um atributo específico.',
            },
            {
                explanation: 'O pai de cada <title> — o <book> que o envolve — um nível de .. por nível escrito.',
            },
            {
                explanation: 'Só o <title> cujo texto contém "Potter" como substring — uma correspondência parcial, não exata.',
            },
            {
                explanation: 'Não é uma lista de nós — é um único número, 3, a contagem de elementos correspondentes.',
            },
        ],
        sections: [
            {
                heading: 'Os predicados rodam em sequência, cada um restringindo o que veio antes',
                body: [
                    "/bookstore/book[@category='cooking'][1] aplica dois predicados: primeiro mantém só os livros de culinária, depois pega o primeiro do que sobrou. Cada [..] filtra o resultado de tudo que veio antes dele, da mesma forma que chamadas encadeadas de .filter() fariam em código — não são condições independentes todas checadas contra a lista original.",
                ],
            },
            {
                heading: '@nome e text() leem o elemento atual, não seus filhos',
                body: [
                    'book[1]/@category lê o próprio atributo category de book[1]. Isso parece óbvio, mas é uma distinção real de book[1]/title, que de fato desce para um filho — @ e text() são seus próprios eixos (attribute:: e um teste de nó de texto), não um atalho para "olhar dentro." Escrever //@category em vez disso pesquisa os atributos de todo descendente, o que é uma consulta genuinamente diferente e mais ampla.',
                ],
            },
            {
                heading: 'Um caminho com zero correspondências não é um erro',
                body: [
                    '/bookstore/nonexistent avalia limpamente para zero correspondências — da mesma forma que uma consulta de banco de dados que não corresponde a nenhuma linha não é um erro de banco de dados. Um erro vermelho só aparece para algo que este avaliador não consegue interpretar ou avaliar de forma alguma, como um [ desbalanceado ou uma função que ele não implementa.',
                ],
            },
        ],
        limitations: [
            'Só um nível de ".." é percorrido por ".." escrito — //title/../.. corretamente sobe dois níveis porque dois ".." estão escritos, mas este avaliador não tem como subir mais do que o número de ".." realmente presentes na expressão (o que corresponde à semântica real do XPath; não há atalho para "subir N níveis" além de escrever ".." N vezes).',
            'Uma tag com prefixo de namespace como soap:Body é comparada como a string literal "soap:Body", não resolvida contra sua declaração xmlns — a mesma simplificação que o conversor de XML para JSON deste site faz, pelo mesmo motivo: a resolução adequada de namespace é um problema significativamente maior do que o que a maioria dos testes de XPath realmente precisa.',
            'O operador de união (|), os eixos following/preceding, e a maior parte da biblioteca de funções XPath além de contains() e count() não estão implementados — uma expressão que os usa falha ao ser interpretada com um erro claro em vez de ser mal interpretada silenciosamente.',
        ],
        faq: [
            {
                q: 'Por que não usar simplesmente o suporte a XPath embutido do navegador?',
                a: 'document.evaluate() precisa de um DOM ativo, que só existe em uma aba de navegador — não pode rodar durante a geração de páginas em tempo de build deste site nem em seus testes automatizados, ambos precisando da exata mesma lógica de avaliação que a ferramenta interativa usa. Este avaliador roda de forma idêntica em todo lugar.',
            },
            {
                q: 'O que acontece se minha expressão usa uma sintaxe que isso não suporta?',
                a: 'Você recebe um erro de interpretação claro nomeando o que está errado, em vez de um resultado silenciosamente incorreto. O operador de união, a maioria dos eixos além de child/descendant-or-self/self/parent, e a maioria das funções além de contains() e count() se enquadram nessa categoria — veja Limitações conhecidas.',
            },
            {
                q: 'As posições começam em 0 ou em 1?',
                a: 'Começam em 1, seguindo o XPath real: [1] é a primeira correspondência, não a segunda. Essa é uma fonte comum de erros por um deslocamento para quem está acostumado com linguagens que começam em 0.',
            },
            {
                q: 'Meu XML é enviado para algum lugar?',
                a: 'Não. Tanto a interpretação quanto a avaliação rodam no seu navegador.',
            },
        ],
    },
};
