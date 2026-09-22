import type { DialectSlug, DialectGuideTranslation } from '../sql-dialects';

/**
 * Portuguese translations for /sql/<dialect>. See i18n-guide.ts for how this overlays
 * onto the English base in sql-dialects.ts — code (sample queries, quirk.code) has no
 * entry here because it is never translated.
 */
export const DIALECT_TRANSLATIONS_PT: Partial<Record<DialectSlug, DialectGuideTranslation>> = {
    postgresql: {
        h1: 'Formatador de PostgreSQL',
        tagline: 'Casts, operadores JSONB e joins LATERAL, formatados sem serem quebrados ao meio.',
        intro: [
            'Formatar PostgreSQL raramente é sobre a lista do SELECT. A dificuldade é que o Postgres acumulou um conjunto de operadores que parecem pontuação comum: :: para casts, -> e ->> para acesso a JSON, @> para contenção, ?| para existência de chave. Um formatador que tokeniza de forma ingênua acaba dividindo esses operadores ao meio, ou confunde os dois pontos iniciais com um marcador de parâmetro nomeado e quebra a linha no lugar errado.',
            'Esta página roda o formatador com a gramática do PostgreSQL selecionada e a sintaxe de parâmetros configurada como nomeada (:nome) mais numerada ($1), que é o que o protocolo do Postgres e a maioria dos drivers usam. O exemplo abaixo está carregado no editor acima, então você pode mudar as opções e ver a mesma query se reformatar.',
        ],
        quirks: [
            {
                heading: 'O operador de cast :: contra parâmetros :nomeados',
                body: [
                    'O PostgreSQL usa :: para casting e : para introduzir um parâmetro nomeado, o que coloca dois significados no mesmo caractere. Um formatador configurado para um dialeto onde : é só um marcador de parâmetro vai ler os primeiros dois pontos de o.total::numeric como o início de um placeholder e quebrar a expressão.',
                    'Selecionar a gramática do PostgreSQL diz ao parser que :: se liga como um único operador de cast, enquanto :nome e $1 continuam sendo placeholders. Os casts permanecem grudados à sua expressão, como na linha (c.profile -> \'prefs\' ->> \'locale\')::TEXT acima.',
                ],
            },
            {
                heading: 'Operadores JSONB, incluindo a família ?',
                body: [
                    'O Postgres expõe acesso a JSON através de operadores em vez de funções: -> retorna jsonb, ->> retorna texto, #> e #>> recebem um array de caminho, e @> testa contenção. Eles são tratados como operadores, então mantêm seus operandos na mesma linha onde a largura de expressão permitir.',
                    'Os operadores de existência merecem uma menção especial. ? testa uma chave de nível superior, ?| testa qualquer chave em um array e ?& testa todas elas — e ? também é o placeholder posicional usado pelo JDBC e vários outros drivers. Com a gramática do PostgreSQL selecionada, eles são interpretados como operadores:',
                ],
            },
            {
                heading: 'Corpos de função com dollar-quote são deixados intactos',
                body: [
                    'Um corpo de PL/pgSQL escrito entre $$ ou $tag$ é, para o parser de SQL, um único literal de string longo. O formatador o preserva exatamente em vez de reindentá-lo, o que é o comportamento seguro — reformatar o interior de uma string mudaria o valor armazenado no catálogo.',
                    'Na prática isso significa que instruções CREATE FUNCTION saem com o SQL ao redor formatado e o corpo intocado em uma única linha. Se você quiser o corpo em si formatado, formate-o separadamente como um bloco independente e cole de volta.',
                ],
            },
            {
                heading: 'FILTER, LATERAL e outras cláusulas que se aninham',
                body: [
                    'COUNT(*) FILTER (WHERE ...) coloca uma cláusula WHERE completa dentro de uma chamada de agregação, e LEFT JOIN LATERAL coloca uma subquery completa dentro de um join. Ambos são expandidos como blocos aninhados, o que é o que torna a forma da query legível — você percebe de imediato que a subquery lateral é uma busca do tipo "top 1 por linha".',
                    'ON CONFLICT ... DO UPDATE com uma cláusula RETURNING é tratado da mesma forma, incluindo referências à pseudo-tabela excluded.',
                ],
            },
            {
                heading: 'Dobragem de identificadores: por que Preserve é o padrão certo',
                body: [
                    'O PostgreSQL dobra identificadores sem aspas para minúsculas, então MyTable e mytable são o mesmo objeto, enquanto "MyTable" entre aspas duplas é um objeto diferente. Isso torna o caso do identificador significativo de uma forma que não é na maioria dos dialetos.',
                    'A opção de caso de identificador por isso usa Preserve como padrão. Mudá-la para Upper ou Lower também vai reescrever identificadores entre aspas, o que pode fazer uma query apontar para uma tabela que não existe. O caso das palavras-chave é uma opção separada, então você ainda pode deixar SELECT e FROM em maiúsculas sem tocar nos nomes do seu schema.',
                ],
            },
        ],
        limitations: [
            'DISTINCT ON (col) é colocado na linha depois de SELECT DISTINCT em vez de ficar junto dela. A saída é SQL válido, mas fica com leitura pior que o restante.',
            'Dentro de um corpo com dollar-quote o formatador não faz nenhuma alteração, incluindo a parte final language plpgsql de uma instrução CREATE FUNCTION, que fica no caso em que você digitou.',
        ],
        conventions: [
            {
                heading: 'Palavras-chave em maiúsculas, identificadores intocados',
                body: [
                    'O estilo mais usado no Postgres deixa palavras reservadas em maiúsculas e mantém nomes de tabelas e colunas no snake_case com que o schema foi criado. Essa é a configuração padrão aqui: caso de palavra-chave, tipo de dado e função definido como Upper, caso de identificador definido como Preserve.',
                ],
            },
            {
                heading: 'Prefira CTEs, e saiba que elas não são mais barreiras de otimização',
                body: [
                    'Quebrar uma query em blocos WITH tem uma leitura muito melhor que aninhar subqueries três níveis de profundidade, e desde o PostgreSQL 12 uma CTE simples é embutida (inline) pelo planejador em vez de materializada, então a legibilidade não custa mais uma mudança de plano de execução. Adicione MATERIALIZED explicitamente quando você realmente quiser o comportamento antigo de barreira.',
                    'A opção Linhas entre queries controla as linhas em branco que o formatador coloca entre instruções, o que é o que mantém um script de migração com várias instruções legível.',
                ],
            },
        ],
        faq: [
            {
                q: 'Formatar muda como o PostgreSQL executa minha query?',
                a: 'Não. O parser descarta espaços em branco e dobra identificadores sem aspas antes do planejamento, então o plano de execução de uma query formatada é idêntico ao de uma query igual em uma única linha. Formatação é para as pessoas que leem o código.',
            },
            {
                q: 'Isso vai quebrar meus identificadores entre aspas em "CamelCase"?',
                a: 'Não, com as configurações padrão. O caso de identificador é definido como Preserve, então identificadores entre aspas saem exatamente como você os escreveu. Só mude essa configuração se tiver certeza de que seu schema usa nomes sem aspas e sem distinção de maiúsculas em todo lugar.',
            },
            {
                q: 'Consegue formatar o corpo de uma função PL/pgSQL?',
                a: 'O corpo entre delimitadores $$ é um literal de string do ponto de vista do parser de SQL, então é preservado literalmente em vez de reindentado. Para formatar o corpo em si, cole apenas o bloco entre os delimitadores.',
            },
            {
                q: 'Minhas queries são enviadas para algum lugar?',
                a: 'Não. O formatador é uma biblioteca JavaScript rodando no seu navegador. Nada é enviado, o que é o que torna seguro colar uma query que contenha nomes de tabelas e colunas de produção.',
            },
        ],
    },

    mysql: {
        h1: 'Formatador de MySQL & MariaDB',
        tagline: 'Identificadores com crase, hints de índice e LIMIT de dois argumentos, preservados exatamente.',
        intro: [
            'O problema recorrente ao formatar MySQL são os identificadores. A lista de palavras reservadas cresce a cada versão — rank, groups, window e system se tornaram reservadas na 8.0 — então schemas reais estão cheios de colunas entre crases que só existem porque o nome colidiu com uma palavra-chave. Um formatador que trata as crases como decoração, ou que aplica o caso de palavra-chave ao texto dentro delas, vai produzir SQL que não roda mais.',
            'Selecionar a gramática do MySQL mantém a citação com crases intacta e interpreta as cláusulas específicas deste dialeto: hints de índice entre a tabela e o join, o LIMIT de dois argumentos, e os argumentos em forma de cláusula do GROUP_CONCAT. A query abaixo está carregada no editor acima.',
        ],
        quirks: [
            {
                heading: 'Identificadores entre crases e sensibilidade a maiúsculas',
                body: [
                    'A coluna chamada `order` no exemplo é o caso comum: um termo de negócio perfeitamente razoável que por acaso é uma palavra reservada. As crases são a única coisa que mantém essa query válida, então elas são preservadas e nunca têm o caso alterado.',
                    'Isso importa mais no MySQL do que na maioria dos bancos porque a sensibilidade a maiúsculas do nome de tabela depende do sistema de arquivos do host. No Linux, Users e users são tabelas diferentes; no macOS e no Windows geralmente não são. Um formatador que coloca identificadores em maiúsculas vai funcionar silenciosamente em desenvolvimento e falhar em produção, o que é por que o caso de identificador usa Preserve como padrão aqui.',
                ],
            },
            {
                heading: 'LIMIT com dois argumentos',
                body: [
                    'O MySQL aceita tanto LIMIT quantidade quanto LIMIT posição, quantidade. A forma de dois argumentos não tem equivalente em SQL padrão — LIMIT 40, 20 significa pular 40, retornar 20, que é a ordem inversa da que as pessoas esperam de LIMIT ... OFFSET.',
                    'O formatador mantém os dois argumentos em uma única linha em vez de dividi-los na vírgula, porque dividi-los deixa uma cláusula já confusa ainda pior.',
                ],
            },
            {
                heading: 'Hints de índice ficam entre a tabela e o join',
                body: [
                    'FORCE INDEX, USE INDEX, IGNORE INDEX e STRAIGHT_JOIN se ligam a uma referência de tabela, então aparecem depois do alias e antes do próximo JOIN. Eles são interpretados como parte da referência de tabela e ficam na sua linha, o que mantém a lista de joins legível.',
                ],
            },
            {
                heading: 'Funções cujos argumentos contêm cláusulas',
                body: [
                    'GROUP_CONCAT não é uma chamada de função comum: sua lista de argumentos pode conter DISTINCT, um ORDER BY completo e um SEPARATOR. Por isso ela é expandida como um bloco aninhado, com o ORDER BY indentado dentro da chamada.',
                ],
            },
            {
                heading: 'ON DUPLICATE KEY UPDATE, forma antiga e nova',
                body: [
                    'A cláusula de upsert é reconhecida nas duas grafias — a forma tradicional VALUES(col) e o alias de linha introduzido no MySQL 8.0.20, que a tornou obsoleta. A forma com alias é interpretada normalmente:',
                ],
            },
            {
                heading: 'Três sintaxes de comentário, uma delas uma armadilha',
                body: [
                    'O MySQL aceita # até o fim da linha, blocos /* */, e -- até o fim da linha. O último tem uma condição que pega as pessoas de surpresa: o MySQL exige espaço em branco depois do traço duplo, então --comentario não é um comentário e geralmente é lido como uma subtração seguida de um identificador.',
                    'Comentários são preservados no lugar. Se um comentário -- sobrevive à formatação mas a query depois falha ao rodar, verifique se falta o espaço.',
                ],
            },
        ],
        limitations: [
            'Em DATE_SUB(NOW(), interval 30 day) a palavra-chave INTERVAL e sua unidade ficam no caso em que você digitou, porque são interpretadas como parte do argumento da função em vez de palavras-chave de nível superior. A query é válida das duas formas.',
        ],
        conventions: [
            {
                heading: 'Cite entre crases só o que precisa',
                body: [
                    'Colocar crases em todo identificador é um hábito herdado de ferramentas gráficas que as geram incondicionalmente. Não está errado, mas adiciona ruído — o exemplo acima cita `users` e `order` e deixa os aliases sem crases, que é o estilo mais comum ao escrever à mão.',
                ],
            },
            {
                heading: 'MariaDB usa a mesma configuração',
                body: [
                    'O MariaDB divergiu do MySQL depois da versão 5.5, mas a sintaxe relevante para formatação — crases, hints de índice, LIMIT, os estilos de comentário — é compartilhada. Use o dialeto MySQL para queries de MariaDB.',
                ],
            },
        ],
        faq: [
            {
                q: 'Colocar palavras-chave em maiúsculas vai quebrar meus nomes de tabela sensíveis a maiúsculas?',
                a: 'Não. O caso de palavra-chave e o caso de identificador são configurações independentes. O padrão deixa SELECT, FROM e JOIN em maiúsculas enquanto mantém cada nome de tabela e coluna exatamente como você digitou.',
            },
            {
                q: 'Isso funciona para MariaDB?',
                a: 'Sim. Selecione o dialeto MySQL. A sintaxe que afeta a formatação é a mesma nos dois.',
            },
            {
                q: 'Por que meu comentário -- não está sendo tratado como comentário?',
                a: 'O MySQL exige um caractere de espaço depois do traço duplo. --nota é interpretado como uma expressão; -- nota é um comentário. Essa é uma regra do MySQL, não um comportamento do formatador.',
            },
            {
                q: 'Meu SQL é enviado para um servidor?',
                a: 'Não. A formatação acontece no seu navegador e nada sai da sua máquina, o que torna seguro colar queries com nomes reais de schema.',
            },
        ],
    },

    't-sql': {
        h1: 'Formatador de T-SQL para SQL Server',
        tagline: 'Identificadores entre colchetes, operadores APPLY, janelas (window frames) e lotes GO.',
        intro: [
            'O T-SQL carrega mais sintaxe procedural do que qualquer outro dialeto popular, e boa parte dela não é realmente SQL — GO é uma diretiva de cliente, variáveis de tabela são declaradas com o mesmo @ que marca um parâmetro, e hints de query viajam junto no fim de uma instrução entre parênteses. Formatar bem T-SQL é, em boa parte, uma questão de reconhecer quais dessas coisas são instruções e quais são decoração.',
            'A query abaixo, carregada no editor acima, exercita as partes que mais costumam dar errado: nomes com múltiplas partes entre colchetes, um OUTER APPLY correlacionado à linha externa, e um ROW_NUMBER com janela usando seu próprio PARTITION BY e ORDER BY.',
        ],
        quirks: [
            {
                heading: 'Identificadores entre colchetes e nomes de quatro partes',
                body: [
                    'O SQL Server cita identificadores com colchetes, e um nome totalmente qualificado pode ter quatro partes: servidor.banco.schema.objeto. Os colchetes são preservados e os pontos entre eles não são tratados como operadores, então [dbo].[Customers] permanece intacto.',
                    'Aspas duplas também funcionam como delimitador de identificador quando QUOTED_IDENTIFIER está ON, que é o padrão para a maioria dos drivers. As duas grafias são aceitas.',
                ],
            },
            {
                heading: 'CROSS APPLY e OUTER APPLY',
                body: [
                    'APPLY é o join lateral do T-SQL: a subquery do lado direito é avaliada uma vez para cada linha da tabela do lado esquerdo e pode referenciar suas colunas. CROSS APPLY descarta linhas externas que não produzem nada, OUTER APPLY as mantém com NULLs — a mesma relação entre INNER e LEFT JOIN.',
                    'A subquery é expandida como um bloco aninhado, o que torna a correlação visível. No exemplo, o.[CustomerID] = c.[CustomerID] dentro do APPLY é o que a liga à linha externa.',
                ],
            },
            {
                heading: 'Janelas (window frames)',
                body: [
                    'Uma cláusula OVER pode conter PARTITION BY, ORDER BY e uma especificação de frame, o que a torna uma cláusula aninhada dentro de um item de select. Cada parte é colocada em sua própria linha em vez de ficarem juntas, porque um PARTITION BY mal lido é uma das formas mais fáceis de obter uma resposta errada que ainda parece plausível.',
                    'Cláusulas de frame como ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW ficam na mesma linha das suas palavras-chave.',
                ],
            },
            {
                heading: 'GO é um separador de lote, não uma instrução',
                body: [
                    'GO é reconhecido pelo SSMS, Azure Data Studio e sqlcmd, não pelo motor do SQL Server — o cliente divide o script nele e envia cada lote separadamente. Scripts contendo GO são tratados corretamente: os lotes são formatados de forma independente e o separador fica em sua própria linha.',
                ],
            },
            {
                heading: 'MERGE',
                body: [
                    'MERGE combina inserção, atualização e exclusão contra um destino usando uma origem, com ramos WHEN MATCHED, WHEN NOT MATCHED BY TARGET e WHEN NOT MATCHED BY SOURCE. Cada ramo começa em sua própria linha para que os três casos possam ser lidos separadamente:',
                ],
            },
            {
                heading: 'O ponto e vírgula antes de WITH',
                body: [
                    'Scripts frequentemente começam uma CTE com ;WITH em vez de WITH. O ponto e vírgula termina o que veio antes, porque WITH é ambíguo — também introduz hints de tabela — e o SQL Server exige que a instrução anterior seja terminada quando uma CTE vem em seguida.',
                    'O hábito é inofensivo e o formatador o aceita, mas terminar toda instrução com ponto e vírgula torna isso desnecessário, o que é a correção melhor.',
                ],
            },
        ],
        limitations: [
            'TOP (n) WITH TIES não é interpretado corretamente: WITH é lido como o início de uma common table expression, e a cláusula é quebrada em várias linhas como TOP (n) / WITH / ties. O exemplo nesta página usa TOP (3) sem WITH TIES por esse motivo. Se você precisar de WITH TIES, formate a query e depois conserte essa cláusula à mão.',
            'Em uma instrução MERGE a palavra-chave USING fica no caso em que você digitou em vez de ser colocada em maiúsculas com as outras palavras-chave.',
        ],
        conventions: [
            {
                heading: 'Schemas em PascalCase, caso de identificador em Preserve',
                body: [
                    'Schemas do SQL Server costumam usar PascalCase — CustomerID, OrderDate — e o SQL Server compara identificadores usando o collation do banco, que geralmente não diferencia maiúsculas de minúsculas. Preserve continua sendo o padrão certo: mantém seus nomes legíveis e evita surpresas na minoria de bancos que rodam um collation sensível a maiúsculas.',
                ],
            },
            {
                heading: 'Termine as instruções',
                body: [
                    'A Microsoft documenta a omissão do terminador de instrução como obsoleta há várias versões. Terminar toda instrução com ponto e vírgula remove a necessidade do truque do ponto e vírgula inicial, e permite que o formatador coloque linhas em branco entre instruções de forma confiável.',
                ],
            },
        ],
        faq: [
            {
                q: 'Posso colar um script com separadores GO?',
                a: 'Sim. Os lotes são formatados de forma independente e cada GO fica em sua própria linha. GO é uma diretiva de cliente, não T-SQL, então é repassado em vez de interpretado como uma instrução.',
            },
            {
                q: 'Por que TOP (3) WITH TIES sai quebrado?',
                a: 'O parser lê WITH como o início de uma common table expression. É uma limitação conhecida, listada acima. Todo o resto da query é formatado normalmente, então a solução de contorno costuma ser corrigir só essa cláusula depois.',
            },
            {
                q: 'Formata o corpo de stored procedures?',
                a: 'As instruções dentro de um procedimento são formatadas como T-SQL comum. Construções de controle de fluxo como IF e WHILE são reconhecidas, mas o resultado é menos refinado do que para um SELECT simples — código procedural é onde qualquer formatador de SQL é mais fraco.',
            },
            {
                q: 'Meu T-SQL é enviado a um servidor?',
                a: 'Não. Tudo roda no seu navegador, então queries com nomes internos de schema ou objeto nunca saem da sua máquina.',
            },
        ],
    },

    'oracle-plsql': {
        h1: 'Formatador de Oracle SQL & PL/SQL',
        tagline: 'Hints de otimizador mantidos intactos, queries hierárquicas e joins legados com (+).',
        intro: [
            'Oracle é o dialeto onde formatar pode genuinamente mudar o comportamento, por causa de um recurso: hints de otimizador são escritos como comentários. Um formatador que normaliza ou descarta comentários vai remover silenciosamente /*+ INDEX(...) */ e mudar o plano de execução de uma query que ainda parece correta. Preservar hints exatamente é o primeiro requisito para qualquer coisa que toque em SQL do Oracle.',
            'Além dos hints, o Oracle carrega décadas de sintaxe acumulada — a notação de outer join (+) que é anterior aos joins ANSI, CONNECT BY para hierarquias, DUAL, e o mecanismo de q-quote para strings contendo apóstrofos. A query abaixo, carregada no editor acima, usa várias delas ao mesmo tempo.',
        ],
        quirks: [
            {
                heading: 'Hints de otimizador são comentários que importam',
                body: [
                    'Um hint é escrito /*+ ... */ e precisa aparecer imediatamente depois da palavra-chave SELECT, INSERT, UPDATE, DELETE ou MERGE. Coloque em qualquer outro lugar e o Oracle o ignora sem levantar erro, o que é por que um formatador que move comentários de lugar é perigoso aqui.',
                    'Hints são preservados na posição e seu conteúdo nunca tem o caso alterado ou é reformatado. Na saída acima, /*+ index(e emp_dept_ix) */ permanece logo depois de SELECT e mantém a grafia em minúsculas com que foi escrito.',
                ],
            },
            {
                heading: 'O outer join legado com (+)',
                body: [
                    'Antes de a sintaxe de join ANSI ser suportada, o Oracle marcava o lado opcional de um outer join com (+) no predicado do join. Ainda é muito comum em código antigo. d.department_id(+) significa que a linha de departments pode estar ausente — o equivalente a um LEFT JOIN a partir de employees.',
                    'A notação é preservada. Note que um espaço é inserido antes do marcador, produzindo d.department_id (+), que o Oracle interpreta de forma idêntica.',
                ],
            },
            {
                heading: 'Queries hierárquicas: CONNECT BY, LEVEL, ORDER SIBLINGS BY',
                body: [
                    'O Oracle percorre estruturas de árvore com START WITH para escolher as raízes e CONNECT BY PRIOR para descrever a relação pai-filho, expondo a profundidade através da pseudo-coluna LEVEL. ORDER SIBLINGS BY então ordena dentro de cada nível sem quebrar a hierarquia.',
                    'Essas são cláusulas de nível superior, então são colocadas na mesma indentação que WHERE e GROUP BY em vez de serem embutidas na cláusula WHERE que seguem.',
                ],
            },
            {
                heading: 'Literais de string com q-quote',
                body: [
                    'Duplicar todo apóstrofo dentro de uma string é propenso a erro, então o Oracle oferece uma citação alternativa: q\'[...]\' — ou qualquer outro par de delimitadores — torna o conteúdo literal. Os delimitadores e o conteúdo são preservados exatamente:',
                ],
            },
            {
                heading: 'DUAL, NVL e DECODE',
                body: [
                    'DUAL é a tabela de uma linha do Oracle, usada sempre que uma expressão precisa de uma cláusula FROM. NVL é a substituição de nulo com dois argumentos e DECODE é o condicional posicional que é anterior ao CASE. Os três são tratados como identificadores e funções comuns.',
                    'Para código novo, COALESCE e CASE são os equivalentes portáveis de NVL e DECODE, e se comportam de forma ligeiramente diferente em relação a conversão de tipo e avaliação de curto-circuito.',
                ],
            },
        ],
        limitations: [
            'Blocos PL/SQL são formatados de forma muito menos refinada do que queries. Um bloco DECLARE / BEGIN / END é quebrado em linhas separadas com linhas em branco entre as seções em vez de ser indentado como uma estrutura aninhada. As instruções SQL dentro de um bloco são formatadas normalmente; a estrutura do bloco ao redor não.',
            'Em FETCH FIRST 25 rows ONLY a palavra rows fica em minúsculas, porque é interpretada como parte da cláusula de limite de linhas em vez de uma palavra-chave isolada.',
            'A barra final que o SQL*Plus usa para executar um bloco é uma diretiva de cliente, não PL/SQL. Deixe-a fora do que você cola.',
        ],
        conventions: [
            {
                heading: 'Prefira joins ANSI em código novo',
                body: [
                    'A notação (+) não consegue expressar um full outer join, não se combina com sintaxe de join ANSI na mesma query, e torna difícil separar a condição de join da condição de filtro. LEFT JOIN é mais claro e é o que o Oracle recomenda há anos. Formatar código antigo com (+) é útil para lê-lo; convertê-lo é um trabalho separado.',
                ],
            },
            {
                heading: 'ROWNUM contra FETCH FIRST',
                body: [
                    'Limitar linhas com ROWNUM exige uma view embutida quando combinado com ORDER BY, porque o ROWNUM é atribuído antes da ordenação — a fonte clássica de queries de "top N" que retornam os N registros errados. O Oracle 12c introduziu FETCH FIRST n ROWS ONLY, que ordena primeiro e é o que o exemplo acima usa.',
                ],
            },
        ],
        faq: [
            {
                q: 'Hints de otimizador são preservados?',
                a: 'Sim. Hints ficam na posição imediatamente depois da palavra-chave inicial e seu conteúdo não é modificado. É o comportamento mostrado no exemplo acima.',
            },
            {
                q: 'Consegue formatar o corpo de um package ou um bloco PL/SQL grande?',
                a: 'As instruções SQL internas são formatadas, mas a estrutura do bloco é tratada de forma ruim — isso está listado nas limitações conhecidas. Para código procedural, uma IDE com um formatador específico para PL/SQL vai se sair melhor.',
            },
            {
                q: 'Devo manter a barra final?',
                a: 'Não. A / é uma instrução do SQL*Plus para executar o bloco anterior, não faz parte do PL/SQL. Cole a instrução sem ela.',
            },
            {
                q: 'Meu SQL é enviado para algum lugar?',
                a: 'Não. A formatação roda inteiramente no seu navegador, o que importa aqui porque queries do Oracle costumam embutir nomes de schema e lógica de negócio.',
            },
        ],
    },

    bigquery: {
        h1: 'Formatador de SQL do BigQuery',
        tagline: 'Nomes qualificados entre crases, UNNEST, SELECT * EXCEPT e QUALIFY.',
        intro: [
            'Queries do BigQuery são moldadas por duas coisas que outros dialetos não têm: nomes de tabela com três partes separadas por ponto dentro de um único par de crases, e colunas que são arrays de structs em vez de escalares. As duas mudam o que um formatador precisa acertar — os pontos dentro de `project.dataset.table` não são operadores, e um UNNEST na cláusula FROM é um join mesmo parecendo uma chamada de função.',
            'O GoogleSQL também adicionou cláusulas que eliminam camadas inteiras de aninhamento. QUALIFY filtra sobre uma função de janela sem a subquery envolvente que o padrão exigiria, e SELECT * EXCEPT descarta colunas sem listar as que você quer manter. A query abaixo, carregada no editor acima, usa as duas.',
        ],
        quirks: [
            {
                heading: 'Nomes qualificados entre crases',
                body: [
                    'Uma referência de tabela no BigQuery é `project.dataset.table`, com os pontos dentro da citação em vez de entre partes citadas separadamente. IDs de projeto rotineiramente contêm hífens — analytics-prod no exemplo — que é exatamente por que as crases são obrigatórias: sem elas o hífen seria interpretado como subtração.',
                    'A referência inteira é tratada como um único token identificador, então nunca é dividida em um ponto ou em um hífen.',
                ],
            },
            {
                heading: 'UNNEST é um join, não uma chamada de função',
                body: [
                    'Quando uma coluna é um ARRAY, UNNEST na cláusula FROM o achata em linhas, correlacionadas à linha de onde vieram. A vírgula antes dele é um CROSS JOIN, o que é por que o exemplo lê FROM tabela e, UNNEST(e.hits) AS h — uma linha por hit, carregando sua sessão.',
                    'Ele é colocado em sua própria linha na lista FROM, no mesmo nível da tabela que expande, o que é a representação honesta do que ele é.',
                ],
            },
            {
                heading: 'SELECT * EXCEPT e * REPLACE',
                body: [
                    'Tabelas de eventos largas tornam impraticável listar toda coluna, então o GoogleSQL permite subtrair em vez disso: * EXCEPT (payload) seleciona tudo menos essa coluna, e * REPLACE (expr AS col) substitui o valor de uma coluna mantendo o resto. Os dois são interpretados como modificadores do asterisco em vez de chamadas de função.',
                ],
            },
            {
                heading: 'QUALIFY',
                body: [
                    'Filtrar sobre uma função de janela normalmente exige calculá-la em uma subquery e filtrar por fora, porque WHERE roda antes das funções de janela. QUALIFY faz isso em um único nível — o exemplo mantém o evento mais recente por usuário sem um SELECT envolvente.',
                    'É uma cláusula de nível superior e é colocada ao lado de WHERE e GROUP BY. QUALIFY exige um WHERE, GROUP BY ou HAVING no mesmo bloco de query, ou uma cláusula WINDOW.',
                ],
            },
            {
                heading: 'Tabelas curinga e _TABLE_SUFFIX',
                body: [
                    'Um * no final de um nome de tabela combina com toda tabela que compartilha esse prefixo, e a pseudo-coluna _TABLE_SUFFIX guarda a parte que combinou — a forma padrão de varrer uma exportação particionada por data. Filtrar por _TABLE_SUFFIX é o que impede a query de ler todo shard, então ele pertence à cláusula WHERE em vez de um filtro posterior.',
                    'SAFE_CAST e o prefixo de função SAFE. retornam NULL em vez de gerar erro com entrada inválida, o que importa quando os dados são JSON fornecido pelo usuário. Ambos são reconhecidos como sintaxe de função comum.',
                ],
            },
        ],
        limitations: [
            'As pseudo-colunas _table_suffix, _partitiontime e _partitiondate ficam no caso em que você digitou, porque são interpretadas como identificadores em vez de palavras-chave. O BigQuery aceita qualquer caso para elas.',
            'Instruções de script — DECLARE, SET, BEGIN ... END, EXECUTE IMMEDIATE — são formatadas de forma muito menos refinada do que queries, assim como código procedural em todo dialeto.',
        ],
        conventions: [
            {
                heading: 'Formatar não muda quanto uma query custa',
                body: [
                    'O BigQuery cobra por bytes lidos, que depende das colunas que você referencia e das partições que você toca — não de espaços em branco. Formatar uma query nunca muda seu custo. SELECT * muda, o que é o verdadeiro argumento para usar EXCEPT em vez do asterisco quando a tabela é larga.',
                ],
            },
            {
                heading: 'Só GoogleSQL',
                body: [
                    'O Legacy SQL, o dialeto anterior a 2016 com sintaxe de colchetes [project:dataset.table], é uma gramática diferente e não é suportado aqui. Se sua query usa dois-pontos e colchetes em nomes de tabela, é Legacy SQL e precisa ser migrada em vez de formatada.',
                ],
            },
        ],
        faq: [
            {
                q: 'Formatar afeta quanto minha query custa?',
                a: 'Não. O custo é determinado pelos bytes lidos — as colunas referenciadas e as partições lidas. Espaços em branco e o caso das palavras-chave não afetam nenhum dos dois.',
            },
            {
                q: 'Suporta Legacy SQL?',
                a: 'Não, só GoogleSQL (antes chamado de Standard SQL). O Legacy SQL usa uma sintaxe de referência de tabela diferente e uma gramática diferente.',
            },
            {
                q: 'Expressões STRUCT e ARRAY são tratadas?',
                a: 'Sim. Construtores STRUCT aninhados e chamadas ARRAY_AGG são interpretados como expressões comuns, e UNNEST é reconhecido como parte da cláusula FROM.',
            },
            {
                q: 'Minha query é enviada ao Google ou a algum servidor?',
                a: 'Não. Esta página roda o formatador no seu navegador. A query não é enviada a lugar nenhum, nem mesmo ao BigQuery.',
            },
        ],
    },
};
