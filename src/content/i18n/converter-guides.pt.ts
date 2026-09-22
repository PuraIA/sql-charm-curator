import type { ConverterGuideTranslation } from '../converter-guides';

/** Traduções em português para /json/to-xml, /xml/to-json, /json/to-yaml, /xml/to-yaml. */
export const CONVERTER_TRANSLATIONS_PT: Partial<Record<string, ConverterGuideTranslation>> = {
    'json/to-xml': {
        h1: 'Conversor de JSON para XML',
        tagline: 'Atributos com @, arrays como irmãos repetidos — o mapeamento é explícito, não adivinhado.',
        intro: [
            'JSON e XML não compartilham um modelo de dados, então qualquer conversor entre eles está, na verdade, se comprometendo com uma convenção e torcendo para que ela corresponda ao que você precisa. A convenção deste conversor é pequena e explícita: uma chave que começa com @ vira um atributo, uma chave #text vira conteúdo de texto, e um array vira elementos irmãos repetidos sob o nome de tag daquela chave — não um elemento envoltório com filhos numerados, que é a outra escolha comum e, na prática, fica pior de ler.',
            'O exemplo abaixo está carregado no conversor acima. Dois pedidos, ambos com um atributo @id, viram dois elementos irmãos <order> em vez de um envoltório <orders><order>...</order><order>...</order></orders> — a própria chave do array (order) já é o nome de tag repetido.',
        ],
        mapping: [
            {
                heading: '@chave vira um atributo',
                body: [
                    'Uma chave que começa com @ tem esse prefixo removido e é anexada ao seu elemento como atributo, na ordem em que aparece no objeto. @id: "1001" em um objeto de pedido vira id="1001" naquela tag <order>.',
                ],
            },
            {
                heading: '#text vira conteúdo de texto — utilizável ao lado de atributos',
                body: [
                    'Um objeto JSON comum não tem onde colocar "este elemento tem um atributo e também texto" — objetos não têm uma posição implícita para texto como os elementos XML têm. #text é a chave explícita para isso: {"@id": "1", "#text": "hello"} produz <tag id="1">hello</tag>.',
                ],
            },
            {
                heading: 'Arrays viram elementos repetidos, não um envoltório',
                body: [
                    'order: [ {...}, {...} ] produz dois elementos irmãos <order> — a própria chave fornece o nome de tag repetido. Um array solto sem essa chave (convertendo um array JSON diretamente, sem nada o envolvendo) não tem um nome de tag natural para reutilizar, então recai para um <item> genérico para cada entrada dentro de um <root> padrão.',
                ],
            },
            {
                heading: 'null vira um elemento vazio; qualquer outro escalar vira texto',
                body: [
                    'Um null do JSON não tem equivalente em XML, então vira um elemento vazio autofechado: null -> <key/>. Números e booleanos viram sua forma de string como texto do elemento — 8080 vira o texto "8080" — já que o texto em XML são sempre apenas caracteres.',
                ],
            },
        ],
        limitations: [
            'Uma chave JSON que não é um nome XML válido — espaços, um dígito inicial, a maioria da pontuação — é reescrita em vez de rejeitada: caracteres inválidos viram _, e um nome que ainda começaria com dígito ganha um _ na frente. Essa é uma transformação visível e testada (2fa vira _2fa), não silenciosa, mas significa que o nome de tag de saída nem sempre é idêntico à chave de entrada.',
            'Converter um array JSON de volta a partir de XML e novamente para frente não é perfeitamente estável quando o array contém uma mistura de objetos e valores simples — o mapeamento é projetado em torno de arrays de um formato consistente, o que cobre a esmagadora maioria das respostas de API reais e arrays de configuração.',
        ],
        faq: [
            {
                q: 'Por que @ para atributos em vez de outra convenção?',
                a: 'Não há um padrão aqui — várias bibliotecas JSON-XML usam @, e isso tem a vantagem de ordenar de forma distinta das chaves comuns e ser inequívoco dentro de uma chave JSON em texto simples. Este conversor documenta sua escolha exata em vez de presumir que é a única razoável.',
            },
            {
                q: 'Posso converter um array JSON diretamente, sem nada o envolvendo?',
                a: 'Sim — ele é envolvido em um <root> padrão, com cada item como um elemento <item>, já que um array solto não tem chave própria para reutilizar como o nome de tag repetido.',
            },
            {
                q: 'A conversão é reversível?',
                a: 'Para os formatos que essa convenção visa — objetos, atributos, arrays de um formato consistente — sim: converter o resultado de volta com XML para JSON reproduz o mesmo JSON, verificado pelos próprios testes deste site. Conteúdo misto de texto e elementos é o único caso que não é: veja as próprias limitações de /xml/to-json para o motivo.',
            },
            {
                q: 'Meu JSON é enviado para algum lugar?',
                a: 'Não. A conversão roda no seu navegador; nada é enviado a um servidor.',
            },
        ],
    },

    'xml/to-json': {
        h1: 'Conversor de XML para JSON',
        tagline: 'Atributos, tags repetidas e conteúdo de texto, mapeados para chaves JSON simples.',
        intro: [
            'A parte difícil de transformar XML em JSON não é a sintaxe, é que XML carrega informação para a qual o JSON não tem um lugar nativo: atributos, e texto que fica ao lado de elementos filhos em vez de ser o único conteúdo. A regra deste conversor para ambos é explícita em vez de implícita — veja o mapeamento abaixo — e é a mesma regra que /json/to-xml usa ao contrário, então uma ida e volta pelas duas páginas é estável para os formatos que isso cobre.',
            'O exemplo abaixo — um pequeno feed de produtos, do tipo que uma API interna mais antiga poderia retornar — está carregado no conversor acima. Cada <product> carrega um atributo sku e um <price> aninhado que por si só tem um atributo currency e texto: exatamente o caso que precisa tanto de @ quanto de #text para representar fielmente.',
        ],
        mapping: [
            {
                heading: 'Atributos viram chaves prefixadas com @',
                body: [
                    'sku="SKU-100" em um elemento <product> vira "@sku": "SKU-100" no seu objeto JSON. O @ mantém os atributos visualmente distintos dos elementos filhos quando você está lendo o JSON, e é o que /json/to-xml procura para converter de volta no outro sentido.',
                ],
            },
            {
                heading: 'Um elemento com apenas texto colapsa para uma string simples',
                body: [
                    '<name>Wireless Mouse</name> vira "name": "Wireless Mouse" diretamente — não {"#text": "Wireless Mouse"} — porque não há mais nada nesse elemento (sem atributos, sem filhos) ao lado do qual a chave #text precisaria estar.',
                ],
            },
            {
                heading: '...mas #text aparece assim que também há um atributo',
                body: [
                    'O elemento <price> acima tem tanto um atributo quanto texto, então não pode colapsar para uma string simples — não haveria onde colocar a moeda. Ele vira {"@currency": "BRL", "#text": "129.90"} em vez disso.',
                ],
            },
            {
                heading: 'Tags repetidas viram um array, na ordem do documento',
                body: [
                    'Dois elementos <product> sob <products> viram um array "product" com duas entradas, na ordem em que apareceram — não duas chaves separadas e não mesclados em um objeto. Um único <product> (sem irmãos) permanece um objeto simples, não um array de um item.',
                ],
            },
            {
                heading: 'Todo valor vira uma string — de propósito',
                body: [
                    'O texto em XML são sempre apenas caracteres; o próprio XML não tem tipo de número ou booleano. 129.90 acima permanece a string "129.90" em vez de ser interpretado como o número 129.9, o que também normalizaria silenciosamente aquele zero à direita. Adivinhar o tipo seria exatamente isso — um palpite — a mesma decisão que o conversor JSON-para-TypeScript deste site toma, pelo mesmo motivo.',
                ],
            },
        ],
        limitations: [
            'Conteúdo misto — texto intercalado com elementos filhos, como <p>Hello <b>world</b>!</p> — perde a ordenação entre o texto e o elemento: ele vira {"#text": "Hello !", "b": "world"}, que não consegue distinguir isso de "!<b>world</b>Hello ". Este conversor é feito para XML no formato de configuração e API, não para marcação tipo prosa, e é aí que isso aparece.',
            'Namespaces XML são tratados como prefixos de string simples — soap:Envelope vira a chave JSON "soap:Envelope" como texto literal, não resolvido contra sua declaração xmlns. Este é um limite de escopo real e deliberado: resolução consciente de namespace é um problema significativamente maior do que o XML de configuração e resposta de API que este conversor visa.',
            'Comentários e instruções de processamento são descartados — eles não são dados, então não há chave JSON para eles se tornarem.',
        ],
        faq: [
            {
                q: 'Por que um elemento vira uma string simples e outro vira um objeto?',
                a: 'Um elemento sem atributos e sem filhos colapsa para apenas seu texto, como uma string. Um com um atributo, um elemento filho, ou ambos, vira um objeto — porque uma string simples não tem onde anexar essa informação extra.',
            },
            {
                q: 'O que acontece com os comentários XML?',
                a: 'Eles são descartados. Comentários documentam o XML para um leitor humano; não fazem parte dos dados, então não há valor JSON correspondente para eles.',
            },
            {
                q: 'Ele lida com seções CDATA?',
                a: 'Sim — o conteúdo dentro de <![CDATA[ ... ]]> é tomado literalmente como texto, sem reinterpretá-lo como marcação, exatamente como um nó de texto normal.',
            },
            {
                q: 'Meu XML é enviado para algum lugar?',
                a: 'Não. Tanto a interpretação quanto a conversão rodam no seu navegador usando o próprio parser XML deste site, não uma chamada ao servidor.',
            },
        ],
    },

    'json/to-yaml': {
        h1: 'Conversor de JSON para YAML',
        tagline: 'Nenhuma convenção a projetar — YAML já é o modelo de dados do JSON, apenas escrito de forma diferente.',
        intro: [
            'Diferente de JSON para XML, esta direção não tem convenção a inventar: um mapeamento YAML é um objeto JSON, uma sequência YAML é um array JSON, e os escalares do YAML são as mesmas strings, números, booleanos e null que o JSON já tem. Converter é realmente apenas re-serializar os mesmos valores — que é também por que esta é a única conversão neste site sem "limitações conhecidas" sobre informação perdida.',
            'O exemplo abaixo é um fragmento de Deployment do Kubernetes — o tipo de documento para o qual YAML é usado constantemente e JSON quase nunca é, o que geralmente é o motivo real pelo qual alguém quer essa conversão: editar dados estruturados à mão no formato que suas ferramentas esperam.',
        ],
        mapping: [
            {
                heading: 'Aninhamento vira indentação',
                body: [
                    'As chaves de um objeto JSON viram a sintaxe de mapeamento em bloco do YAML (chave: valor, indentado sob seu pai), e um array JSON vira uma sequência em bloco (- item, um por linha). Não há distinção atributo/texto para projetar em torno, porque nenhum dos dois formatos tem atributos.',
                ],
            },
            {
                heading: 'Strings só são citadas quando o YAML as interpretaria mal de outra forma',
                body: [
                    'apiVersion: apps/v1 é escrito sem aspas — um escalar simples sem citação — porque o YAML não tem dificuldade em interpretá-lo como uma string. Um valor que parece um número, booleano ou null do YAML (como o texto "true", "null", ou "123") é citado para que ele volte como uma string em vez de ser reinterpretado como esse outro tipo. Uma string contendo ": " (dois-pontos-espaço) é citada pelo mesmo motivo: sem aspas, o YAML a leria como outro par chave-valor em vez de um único valor.',
                ],
            },
            {
                heading: 'Uma string multilinha vira um literal em bloco, não uma linha única escapada',
                body: [
                    'Uma string JSON contendo \\n é escrita usando o estilo de literal em bloco | do YAML — o texto em suas próprias linhas indentadas — em vez de uma linha citada única com um \\n literal nela. Isso é lido da forma como o texto original realmente parece, o que importa para qualquer coisa como uma descrição multilinha ou um comando shell embutido em uma configuração de CI.',
                ],
            },
        ],
        limitations: [
            'Nenhuma específica desta direção: todo valor JSON (objeto, array, string, número, booleano, null) tem um equivalente YAML direto, então nada aqui é um palpite da forma como um atributo ou um nome de tag repetido é do lado do XML. A única coisa a saber é geral do YAML, não deste conversor: um documento YAML pode expressar coisas que o JSON não pode (âncoras e aliases para estruturas repetidas, múltiplos documentos em um arquivo, comentários) — converter JSON para YAML nunca vai produzir isso, já que o JSON não tem nada de onde eles poderiam vir.',
        ],
        faq: [
            {
                q: 'Essa conversão alguma vez tem perda?',
                a: 'Não para nada que o próprio JSON possa representar. Todo objeto, array, string, número, booleano e null mapeia diretamente para seu equivalente YAML sem nada restando para adivinhar.',
            },
            {
                q: 'Por que algumas strings são citadas e outras não?',
                a: 'Uma string só é citada quando deixá-la sem aspas mudaria seu significado no YAML — por exemplo o texto literal "true" ou "123", que de outra forma seria interpretado de volta como um booleano ou um número em vez de uma string.',
            },
            {
                q: 'Posso converter um manifesto do Kubernetes ou um arquivo docker-compose dessa forma?',
                a: 'Sim, para a direção de colar JSON e obter YAML de saída — a maioria das ferramentas de infraestrutura aceita ambos, e isso produz YAML válido para qualquer coisa que começou como JSON válido.',
            },
            {
                q: 'Meus dados são enviados para algum lugar?',
                a: 'Não. A conversão roda no seu navegador, o que importa aqui já que configurações de Kubernetes e CI costumam conter nomes internos de serviços.',
            },
        ],
    },

    'xml/to-yaml': {
        h1: 'Conversor de XML para YAML',
        tagline: 'Passa pela mesma convenção @ / #text que XML para JSON, depois serializa como YAML.',
        intro: [
            'Isso são duas conversões executadas uma atrás da outra, não uma direta separada: o XML é interpretado na mesma representação JSON de atributo-@ / #text / tag-repetida que /xml/to-json produz, e esse valor é então escrito como YAML em vez de JSON. Toda regra e toda limitação documentada em /xml/to-json se aplica aqui de forma idêntica — esta página existe porque "xml to yaml" é uma busca que alguém realmente digita, não porque a conversão subjacente é diferente de alguma forma.',
            'O exemplo reutiliza o mesmo feed de produtos de /xml/to-json, então você pode comparar as duas saídas diretamente: as mesmas chaves @sku e #text, apenas escritas como mapeamentos YAML em vez de objetos JSON.',
        ],
        mapping: [
            {
                heading: 'Atributos e texto seguem exatamente a convenção de XML para JSON',
                body: [
                    "@sku: SKU-100 e #text: '129.90' abaixo são as mesmas chaves de atributo prefixado com @ e conteúdo #text documentadas em /xml/to-json, apenas renderizadas na sintaxe chave: valor do YAML em vez de \"chave\": \"valor\" do JSON. A citação do lado do YAML segue a regra usual do YAML: '@sku' é citado porque uma chave começando com @ precisa disso, e '129.90' é citado para que permaneça uma string em vez de ser lido de volta como um número.",
                ],
            },
            {
                heading: 'Elementos repetidos viram uma sequência YAML',
                body: [
                    'Dois elementos irmãos <product> viram uma chave product: contendo uma sequência YAML (- @sku: ... / - @sku: ...) — a etapa de array acontece durante a interpretação do XML, exatamente como em /xml/to-json; só a etapa final de serialização difere.',
                ],
            },
            {
                heading: 'Números do XML permanecem strings citadas no YAML',
                body: [
                    "129.90 acima sai como a string YAML citada '129.90', não o número simples 129.9 — porque nunca foi um número para começo de conversa. O texto em XML são sempre caracteres (veja o mapeamento de /xml/to-json para o motivo deste conversor não adivinhar o contrário), então a etapa YAML tem uma string para serializar, e a cita da mesma forma que citaria qualquer string que por acaso pareça numérica.",
                ],
            },
        ],
        limitations: [
            'Toda limitação de /xml/to-json se aplica aqui primeiro, antes mesmo do YAML entrar em cena: conteúdo misto perde ordenação, namespaces são tratados como prefixos de string literais, comentários são descartados, e todo valor de texto XML vira uma string em vez de ser interpretado como um número ou booleano.',
        ],
        faq: [
            {
                q: 'Essa é uma conversão diferente de XML para JSON?',
                a: 'Não — ela interpreta o XML usando exatamente as mesmas regras, depois serializa o resultado como YAML em vez de JSON. Toda regra de mapeamento e limitação é compartilhada com /xml/to-json.',
            },
            {
                q: "Por que algumas chaves são citadas na saída YAML, como '@sku'?",
                a: 'O YAML exige citar um escalar simples que de outra forma seria ambíguo — uma chave começando com @ é um desses casos. É uma exigência de sintaxe do YAML, não algo que este conversor adiciona por cima.',
            },
            {
                q: 'Meu XML é enviado para algum lugar?',
                a: 'Não. Tanto a etapa de interpretação quanto a serialização YAML rodam no seu navegador.',
            },
        ],
    },
};
