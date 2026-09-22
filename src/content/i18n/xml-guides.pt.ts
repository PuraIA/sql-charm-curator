import type { XmlGuideSlug, XmlGuideTranslation } from '../xml-guides';

/** Traduções em português para /xml/<slug>. Ver xml-guides.ts para os campos aceitos. */
export const XML_TRANSLATIONS_PT: Partial<Record<XmlGuideSlug, XmlGuideTranslation>> = {
    minify: {
        h1: 'Minificador de XML',
        tagline: 'Colapsa o espaço em branco entre tags com o Modo Compacto, sem tocar em CDATA ou comentários.',
        intro: [
            'O Modo Compacto, a chave ao lado de Carregar Exemplo abaixo, remove o espaço em branco que um formatador bonito adiciona entre tags — a quebra de linha e a indentação depois de um >, antes do próximo <. Ele faz isso com uma regra restrita em vez de uma reescrita completa e consciente de XML: só o espaço em branco que fica estritamente entre duas tags é tocado. Espaço em branco dentro do próprio conteúdo de um nó de texto, dentro de um valor de atributo, ou dentro de uma seção CDATA é deixado exatamente como estava, porque esse espaço em branco pode ser parte dos dados em vez de formatação.',
            'O exemplo em formato SOAP abaixo está carregado no editor acima. Alterne o Modo Compacto para vê-lo colapsar da forma bonita para a linha única mostrada aqui — uma redução de 18% neste exemplo, calculada da mesma forma para o que você colar.',
        ],
        sections: [
            {
                heading: 'O que permanece intocado, e por que esse é o padrão seguro',
                body: [
                    'Um comentário (<!-- ... -->) e uma seção CDATA (<![CDATA[ ... ]]>) podem ambos conter legitimamente os caracteres < e > como dados, não como marcação — um bloco CDATA é exatamente como você incorpora um trecho de HTML ou JavaScript dentro de XML sem escapá-lo. A regra de colapso de espaço em branco aqui só corresponde a um > literal imediatamente seguido de espaço em branco e um < literal, então nunca alcança o interior de nenhuma dessas construções para reescrever o que é, semanticamente, uma string.',
                ],
            },
            {
                heading: 'Conteúdo misto geralmente é seguro, com uma exceção real',
                body: [
                    'XML tipo prosa — um elemento cujo texto e tags filhas estão intercalados, como <p>Preaqueça o forno a <b>220</b> graus.</p> — sobrevive à minificação sem alteração sempre que há texto real tocando a fronteira da tag em pelo menos um lado, o que cobre a esmagadora maioria dos documentos reais.',
                    'O único caso em que isso dá errado é deliberado, conteúdo apenas de espaço em branco sob xml:space="preserve" — um elemento cujo ponto inteiro é que seu espaço em branco importa e não há outro conteúdo para ancorá-lo. Ali, um elemento como <code xml:space="preserve">   </code> perde seus três espaços completamente, porque para esta regra eles parecem idênticos a indentação de formatação. Isso está listado em Limitações conhecidas abaixo porque é um caso real e demonstrado, não hipotético.',
                ],
            },
            {
                heading: 'O que o Modo Compacto não faz',
                body: [
                    'Ele não toca no espaço em branco dentro de uma tag em si — espaços extras entre atributos, como <a   b="1"    c="2" />, são deixados como escritos, já que colapsá-los arrisca parecer um tipo diferente de edição do que "remover formatação". Também não remove comentários ou instruções de processamento; se você quiser que isso também seja retirado, essa é uma transformação separada e mais invasiva que esta chave não realiza.',
                ],
            },
        ],
        limitations: [
            'Um nó de texto contendo apenas espaço em branco dentro de um elemento marcado com xml:space="preserve" é colapsado como qualquer outro espaço em branco entre tags, mesmo que devesse ser preservado. Essa é uma limitação real e verificada — <code xml:space="preserve">   </code> vira <code xml:space="preserve"></code> — não um caso extremo hipotético.',
            'Espaçamento de atributos, comentários e instruções de processamento são deixados exatamente como escritos; se seu documento tem espaçamento redundante dentro de uma tag, esta chave não vai removê-lo.',
        ],
        faq: [
            {
                q: 'Minificar vai quebrar uma seção CDATA?',
                a: 'Não. O conteúdo CDATA nunca é tocado, incluindo colchetes angulares dentro dele — a regra só corresponde a espaço em branco que fica estritamente entre um > e um < no nível da tag, nunca dentro dos delimitadores CDATA.',
            },
            {
                q: 'É seguro para documentos com texto e tags misturados, como XML no estilo HTML?',
                a: 'Em quase todos os casos, sim — desde que haja texto real ao lado da fronteira da tag. A única exceção documentada é um elemento xml:space="preserve" que contém apenas espaço em branco, listado em Limitações conhecidas.',
            },
            {
                q: 'Minificar economiza tanto quanto o gzip já economizaria?',
                a: 'Menos do que a contagem bruta de bytes sugere, se a resposta já estiver comprimida — o gzip lida com espaço em branco repetido de forma eficiente por conta própria. Minificar importa mais para payloads que não são comprimidos, como algumas requisições SOAP e chamadas internas de serviço.',
            },
            {
                q: 'Meu XML é enviado para algum lugar?',
                a: 'Não. Formatar e minificar rodam ambos no seu navegador. Nada é enviado, o que importa já que payloads XML como o exemplo SOAP acima costumam carregar nomes internos de serviços.',
            },
        ],
    },

    validate: {
        h1: 'Validador de XML',
        tagline: 'Verifique a boa formação contra o próprio parser de XML do navegador — e saiba o que isso não cobre.',
        intro: [
            'Esta ferramenta valida XML com o próprio parser do navegador — DOMParser, interpretando sua entrada como text/xml — em vez de um verificador separado feito sob medida. Se o parser do navegador aceita o documento, a ferramenta reporta como válido; se o parser sinaliza um nó parsererror, é isso que aciona o indicador vermelho ⚠ ao lado da aba XML Original.',
            'Os exemplos abaixo são formas comuns de XML real quebrar. Em vez de citar o texto de erro de um navegador específico — a redação do DOMParser difere entre Chromium, Firefox e WebKit, então uma string exatamente correta em um é enganosa em outro — cada um nomeia a regra de boa formação que quebra, que é a mesma em todo parser conforme mesmo quando a redação do erro não é.',
        ],
        invalidExamples: [
            {
                label: 'Tag de fechamento não correspondente',
                rule: 'Toda tag de abertura deve ser correspondida por uma tag de fechamento com o nome idêntico, sensível a maiúsculas e minúsculas. <book> foi aberta e </books> foi fechada — um nome diferente — então o documento não está bem formado.',
            },
            {
                label: 'Valor de atributo sem aspas',
                rule: 'Valores de atributo devem estar entre aspas, com " ou \'. Diferente do HTML, XML não tem atalho para um valor sem aspas — essa é uma das quebras mais comuns quando XML é editado à mão por alguém acostumado com HTML.',
            },
            {
                label: 'Mais de um elemento raiz',
                rule: 'Um documento XML bem formado tem exatamente um elemento raiz contendo tudo o mais. Dois elementos irmãos sem nada os envolvendo não é um documento — envolva-os em um pai comum.',
            },
            {
                label: 'Um & solto no conteúdo de texto',
                rule: '& sempre inicia uma referência de entidade (&amp;, &#38;, uma entidade personalizada) para um parser XML, então um "e comercial" literal no conteúdo de texto deve ser escrito &amp;. Isso é invisível em texto simples mas quebra a interpretação imediatamente.',
            },
        ],
        sections: [
            {
                heading: 'Bem formado versus válido: duas perguntas diferentes',
                body: [
                    'Um documento pode estar perfeitamente bem formado — toda tag fechada, corretamente aninhada, uma raiz — enquanto ainda tem o formato errado para o que um consumidor espera: um elemento obrigatório faltando, um atributo no lugar errado, um elemento filho que não deveria estar ali. Essa segunda pergunta, mais rigorosa, é validade de esquema, verificada contra um DTD ou um XSD, e é um trabalho diferente do que esta ferramenta faz.',
                    'Essa distinção importa porque "meu validador de XML diz que está tudo bem" e "meu cliente SOAP rejeita" podem ser ambas afirmações verdadeiras sobre o mesmo documento quando o problema é o formato do esquema em vez de sintaxe. Esta ferramenta responde a primeira pergunta; um validador de esquema, verificado contra o DTD ou XSD específico que seu sistema espera, responde a segunda.',
                ],
            },
            {
                heading: 'Por que a redação exata do erro é deixada não especificada aqui',
                body: [
                    'DOMParser é uma API de navegador real e em produção, mas seu relato de erros nunca foi padronizado em detalhe — o parser XML de cada motor (derivado de libxml2 em alguns, um parser sob medida em outros) escreve seu próprio texto de mensagem para o mesmo problema subjacente. Em vez de publicar a redação de um navegador como se fosse universal, a regra que cada exemplo quebra é descrita diretamente; essa regra é idêntica em todo lugar, o que a frase específica que a descreve não é.',
                ],
            },
        ],
        limitations: [
            'A validação aqui verifica apenas a boa formação — as regras genéricas de sintaxe XML. Ela não verifica um documento contra um DTD ou um esquema XSD, então um documento bem formado com elementos errados, atributos errados, ou estrutura errada para seu formato específico ainda será reportado como válido.',
            'A mensagem de erro exata mostrada depende de qual navegador você está usando, já que o texto de erro do DOMParser não é padronizado entre motores. A regra sendo violada é consistente; a frase que a descreve não é.',
        ],
        faq: [
            {
                q: '"Bem formado" significa que meu XML corresponde ao esquema que minha API espera?',
                a: 'Não — essas são verificações diferentes. Bem formado significa que as tags estão corretamente aninhadas e fechadas. Se os elementos e atributos correspondem ao que uma API ou formato específico espera é validação de esquema, contra um DTD ou XSD, que esta ferramenta não realiza.',
            },
            {
                q: 'Por que um & literal é rejeitado quando parece texto comum?',
                a: 'Porque & sempre inicia uma referência de entidade para um parser XML, quer você tenha pretendido isso ou não. Escreva &amp; para um "e comercial" literal no conteúdo de texto.',
            },
            {
                q: 'Um documento pode ter mais de um elemento raiz?',
                a: 'Não. Um documento XML bem formado tem exatamente um elemento contendo tudo o mais. Dois elementos irmãos de nível superior precisam de um pai comum que os envolva.',
            },
            {
                q: 'Meu XML é enviado para verificação?',
                a: 'Não. A validação roda através do próprio DOMParser do seu navegador, localmente — nada é enviado a lugar nenhum.',
            },
        ],
    },
};
