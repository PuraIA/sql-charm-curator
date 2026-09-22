import type { JsonGuideSlug, JsonGuideTranslation } from '../json-guides';

/** Traduções em português para /json/<slug>. Ver json-guides.ts para os campos aceitos. */
export const JSON_TRANSLATIONS_PT: Partial<Record<JsonGuideSlug, JsonGuideTranslation>> = {
    minify: {
        h1: 'Minificador de JSON',
        tagline: 'Remove cada byte que só existe para os olhos humanos, verificado contra JSON.stringify.',
        intro: [
            'Minificar JSON é, de propósito, a transformação mais simples que este site faz: a ferramenta chama JSON.stringify() sobre o valor já interpretado sem argumento de indentação, então os espaços em branco desaparecem e mais nada muda — as mesmas chaves, a mesma ordem de chaves, os mesmos números, o mesmo conteúdo de string. Não existe um algoritmo de minificação separado para dar errado, porque o próprio serializador do motor é o minificador.',
            'Essa simplicidade também é o motivo desta página existir: minificar é fácil de fazer corretamente e fácil de julgar errado. O exemplo abaixo está carregado no editor acima com Minificado selecionado, então você pode colar seu próprio JSON e ver exatamente a mesma substituição acontecer nele.',
        ],
        sections: [
            {
                heading: 'O que realmente é removido',
                body: [
                    'Só o espaço em branco que existe entre tokens estruturais — depois de um {, antes de um }, ao redor de um : ou uma , — é o que JSON.stringify() nunca emite sem um argumento de indentação. Não é uma varredura textual do seu arquivo; é o mesmo caminho de código que produz qualquer outra chamada de JSON.stringify() na linguagem, então não tem nenhum dos bugs de escape que um minificador de string feito à mão poderia introduzir.',
                    'A ordem das chaves é preservada exatamente como estava no objeto interpretado. Objetos JavaScript preservam a ordem de inserção para chaves de string (com uma exceção — chaves numéricas como "1" ou "42" são sempre ordenadas numericamente primeiro, antes de qualquer outra chave, independentemente de onde apareceram na origem). Essa reordenação faz parte da especificação do JavaScript, não é algo que esta ferramenta adiciona.',
                ],
            },
            {
                heading: 'Minificado não é o mesmo que Compacto',
                body: [
                    'O seletor de formato acima também oferece Compacto, que é uma transformação diferente e mais suave: JSON.stringify(parsed, null, 1) — um espaço de indentação em vez de dois ou quatro, mas ainda um valor por linha. Minificado remove a estrutura por completo; Compacto só a encolhe. Use Compacto quando uma pessoa ainda precisa ler o diff, e Minificado quando só uma máquina vai consumir o resultado.',
                ],
            },
            {
                heading: 'Onde minificar realmente economiza bytes',
                body: [
                    'Se uma resposta já é servida comprimida em gzip ou brotli, a maior parte do ganho da minificação desaparece antes de chegar à rede: espaço em branco repetido é exatamente o tipo de redundância que esses algoritmos já removem bem. Minificar importa mais para payloads que não são comprimidos — corpos de alguns webhooks, caches locais, arquivos de configuração embutidos — e para reduzir o trabalho que JSON.parse() precisa fazer em documentos muito grandes, já que menos bytes significa menos caracteres para varrer independentemente da compressão.',
                ],
            },
        ],
        limitations: [
            'Minificar não muda a formatação de números, não remove campos não usados nem encurta nomes de chaves — só remove espaço em branco. Se você precisa de um payload menor além disso, isso é uma mudança de esquema, não uma configuração de minificação.',
            'Para um documento de vários megabytes, tanto JSON.parse() quanto JSON.stringify() rodam de forma síncrona na thread principal. Colagens muito grandes podem deixar a aba brevemente sem resposta enquanto rodam; isso é uma propriedade da implementação de JSON do navegador, não algo que esta página adiciona por cima dela.',
        ],
        faq: [
            {
                q: 'Minificar muda os dados de alguma forma?',
                a: 'Não. Cada chave, valor e elemento de array é preservado exatamente. Só o espaço em branco entre eles é removido.',
            },
            {
                q: 'Qual a diferença entre Minificado e Compacto?',
                a: 'Minificado remove todo o espaço em branco, produzindo uma única linha. Compacto mantém um valor por linha, mas com indentação mínima. Use Compacto quando uma pessoa ainda precisa ler, Minificado quando só uma máquina vai ler.',
            },
            {
                q: 'Isso vai ajudar se minhas respostas de API já estiverem em gzip?',
                a: 'Menos do que você imagina. O gzip já comprime espaço em branco repetido de forma eficiente, então minificar antes da compressão rende uma economia extra menor do que a contagem de bytes acima sugere. Importa mais para payloads não comprimidos.',
            },
            {
                q: 'Meu JSON é enviado para algum lugar?',
                a: 'Não. JSON.parse() e JSON.stringify() rodam no seu navegador. Nada é enviado a um servidor, o que importa se o payload contém dados reais de clientes ou de conta.',
            },
        ],
    },

    validate: {
        h1: 'Validador de JSON',
        tagline: 'Veja exatamente qual regra o seu JSON quebra, com a mensagem de erro do próprio parser.',
        intro: [
            'Esta ferramenta valida JSON exatamente da mesma forma que toda chamada de JSON.parse() no seu navegador faz, porque é isso que roda por baixo dela — não existe uma camada de validação separada e mais permissiva. Se JSON.parse() aceita sua entrada, a ferramenta reporta como válido; se lançar uma exceção, a ferramenta mostra a mensagem dessa exceção ao lado da aba JSON Original, junto com um indicador verde ✓ ou vermelho ⚠.',
            'Os quatro exemplos abaixo são entradas reais e o texto de erro real que um motor baseado em V8 (Chrome, Edge e Node.js usam V8) lança para cada um deles, gerados de fato rodando-os pelo JSON.parse() em vez de descritos de memória. Firefox e Safari usam motores JavaScript diferentes e formulam esses erros de forma diferente, mas rejeitam as mesmas entradas pelo mesmo motivo subjacente.',
        ],
        invalidExamples: [
            {
                label: 'Vírgula sobrando',
                explanation:
                    'JSON não tem o conceito de vírgula sobrando. Diferente de um objeto literal em JavaScript, a vírgula antes do } de fechamento sempre precisa ser seguida por outro par "chave": valor.',
            },
            {
                label: 'Chave sem aspas',
                explanation:
                    'Toda chave de objeto precisa ser uma string entre aspas duplas. Isso é válido em um objeto literal JavaScript, por isso o erro é comum quando o JSON é digitado à mão em vez de gerado.',
            },
            {
                label: 'Um comentário //',
                explanation:
                    'JSON não tem sintaxe de comentário nenhuma — nem //, nem /* */. Algumas ferramentas aceitam "JSONC" (JSON com comentários) como formato de entrada, mas o JSON.parse() padrão não.',
            },
            {
                label: 'Um zero à esquerda',
                explanation:
                    'Um número JSON não pode ter um zero à esquerda antes de outros dígitos (01, 007). Isso espelha a mesma regra dos literais numéricos do JavaScript e existe para evitar ambiguidade com a notação octal.',
            },
        ],
        sections: [
            {
                heading: 'O que "válido" significa e o que não significa',
                body: [
                    'Esta ferramenta verifica que seu texto é JSON bem formado conforme a RFC 8259 — toda chave corresponde, toda string está entre aspas, todo valor tem o formato certo. Essa é uma pergunta diferente e mais restrita do que "esse é o JSON que minha aplicação espera". Uma resposta com um campo obrigatório faltando, ou que envia uma string onde seu código espera um número, é um JSON perfeitamente válido e vai passar nesta verificação mesmo assim quebrando sua aplicação.',
                    'Capturar essa segunda classe de problema exige validação de esquema — um documento JSON Schema, ou um verificador de tipos em tempo de execução como o Zod — checado contra o formato específico que você espera. Esta ferramenta é a primeira verificação rápida que pertence antes desse passo, não um substituto para ele.',
                ],
            },
            {
                heading: 'Por que a mensagem de erro é específica',
                body: [
                    'Um validador que só diz "JSON inválido" te obriga a varrer o documento inteiro a olho nu. A mensagem que esta ferramenta mostra — a mesma que JSON.parse() lança — inclui uma posição de caractere e, na maioria dos motores, uma linha e coluna, o que geralmente é suficiente para ir direto ao erro sem precisar comparar manualmente com uma cópia conhecida como correta.',
                ],
            },
        ],
        limitations: [
            'A formulação exata da mensagem de erro é específica de motores baseados em V8. Firefox e Safari relatam as mesmas violações com uma redação diferente, então, se você estiver investigando um relato de um usuário em um desses navegadores, espere que o texto da mensagem — não o problema em si — seja diferente.',
            'Isso verifica apenas sintaxe. JSON válido mas com o formato errado (um campo faltando, uma string em vez de um número) não será sinalizado aqui; isso exige validação de esquema contra a sua própria estrutura esperada.',
        ],
        faq: [
            {
                q: 'Por que só diz que o JSON é inválido, sem mais detalhes?',
                a: 'Na verdade não diz — mude para a aba JSON Formatado (ou simplesmente comece a digitar) e o erro exato do parser, incluindo a posição do caractere, é mostrado. Os exemplos acima são essa mesma mensagem, verificada contra a saída real de JSON.parse().',
            },
            {
                q: '"Válido" significa que minha API vai aceitar?',
                a: 'Significa que o JSON está bem formado. Se os campos e tipos específicos correspondem ao que uma API espera é uma questão separada que esta ferramenta não responde — isso exige validação de esquema contra o contrato daquela API.',
            },
            {
                q: 'Posso validar JSON com comentários dentro (JSONC)?',
                a: 'Não com esta ferramenta — ela verifica contra o JSON padrão (RFC 8259), que não tem sintaxe de comentário. Remova os comentários primeiro se você estiver trabalhando com um arquivo de configuração JSONC.',
            },
            {
                q: 'Meu JSON é enviado para algum lugar para ser verificado?',
                a: 'Não. A validação roda através do próprio JSON.parse() do seu navegador, localmente. Nada é enviado.',
            },
        ],
    },

    'to-typescript': {
        h1: 'Conversor de JSON para TypeScript',
        tagline: 'Transforme uma resposta real de API em interfaces nomeadas — campos opcionais e tudo mais.',
        intro: [
            'Colar uma resposta de API e receber de volta interfaces tipadas é um trabalho genuinamente diferente de formatar JSON, então ganha seu próprio gerador em vez de ser mais um estilo de saída grudado no formatador bonito. Ele percorre o valor interpretado uma vez: todo objeto vira uma interface nomeada, arrays de objetos são mesclados em uma única interface, e um campo que falta em alguns (mas não todos) os itens de um array vira opcional em vez de gerar um tipo separado por item.',
            'O exemplo abaixo está carregado no editor acima com JSON → TypeScript selecionado. É um formato realista — um registro de usuário com um endereço aninhado, um array de tags de string e um array de pedidos onde só um pedido tem trackingCode — escolhido porque exercita os três casos que importam: aninhamento, arrays e campos opcionais inconsistentes.',
        ],
        sections: [
            {
                heading: 'Como o aninhamento vira interfaces nomeadas',
                body: [
                    'Todo campo de objeto ganha sua própria interface, nomeada a partir do campo (address vira Address, o elemento de orders vira Order). Isso é proposital: um tipo aninhado inline é mais difícil de reutilizar e mais difícil de ler no tooltip de hover de um editor do que um nomeado. Dois campos com exatamente o mesmo conjunto de chaves e tipos — um endereço de cobrança e um de entrega, por exemplo — são reconhecidos como o mesmo formato e compartilham uma interface em vez de gerar uma duplicata.',
                ],
            },
            {
                heading: 'Arrays de objetos são mesclados, não enumerados',
                body: [
                    'orders é um array onde o primeiro item não tem trackingCode e o segundo tem. Em vez de gerar Order e Order2, o gerador olha para cada item do array, coleta a união de toda chave que aparece em qualquer um deles, e marca uma chave como opcional se ela faltar em pelo menos um item — que é exatamente o que trackingCode?: string acima expressa. Isso espelha como você mesmo tiparia isso à mão depois de realmente ler algumas respostas de exemplo.',
                ],
            },
            {
                heading: 'Arrays de tipos mistos viram uma união',
                body: [
                    'Um array cujos elementos não são todos do mesmo tipo — [1, "two", 3] — produz (number | string)[] em vez de escolher um tipo e esconder a incompatibilidade, ou se recusar a gerar qualquer coisa. Um array vazio não tem de onde inferir e é tipado unknown[]; estreite-o à mão assim que souber o que o array deve conter.',
                ],
            },
            {
                heading: 'O que ele deliberadamente não infere',
                body: [
                    'Toda string vira string e todo número vira number — não há tentativa de detectar que um campo sempre parece uma data, um e-mail, ou um de três valores fixos, e estreitá-lo para uma união literal ou um tipo marcado. Um estreitamento confiável precisaria de uma amostra maior do que uma única resposta ou conhecimento de domínio que esta ferramenta não tem; adivinhar errado seria pior do que deixar o campo como string.',
                ],
            },
        ],
        limitations: [
            'Uma resposta de exemplo é uma amostra, não um esquema. Um campo que por acaso é null ou um número inteiro na sua única colagem, mas às vezes é uma string ou um decimal em outras respostas, será tipado de forma restrita demais. Teste a interface gerada contra algumas respostas reais diferentes, não só uma.',
            'Os nomes de interfaces e propriedades gerados vêm das suas chaves JSON e não são desduplicados além de formatos de campo idênticos — dois objetos com formatos diferentes que vêm de um campo chamado "data" serão nomeados Data e Data2, o que se lê como "o segundo" em vez de algo descritivo. Renomeie-os assim que souber o que representam.',
        ],
        faq: [
            {
                q: 'Ele lida com JSON profundamente aninhado?',
                a: 'Sim — o aninhamento não tem limite de profundidade. Todo objeto aninhado vira sua própria interface nomeada, não importa em quantos níveis de profundidade apareça.',
            },
            {
                q: 'O que acontece com um array que mistura objetos e primitivos?',
                a: 'Os itens de objeto são mesclados em uma interface como de costume, os itens primitivos contribuem com seus próprios tipos, e o tipo do elemento do array é a união dos dois — por exemplo (Order | string)[].',
            },
            {
                q: 'Posso definir meu próprio nome de interface raiz?',
                a: 'A interface raiz gerada se chama Root por padrão quando você edita o JSON na ferramenta. Esta página a nomeia de acordo com o que o exemplo representa (ApiUser) puramente para facilitar a leitura no exemplo.',
            },
            {
                q: 'Meu JSON é enviado a um servidor para gerar os tipos?',
                a: 'Não. O gerador roda no seu navegador e nunca envia o que você cola, o que importa já que uma resposta real de API é exatamente o que você colaria aqui.',
            },
        ],
    },
};
