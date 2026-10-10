# Checklist de prontidão para reenvio ao Google AdSense

## Atualização 2026-10-09 — reprovado novamente

O reenvio feito após a verificação abaixo foi **reprovado de novo por "Conteúdo de baixo valor"**, agora como único item sinalizado (os problemas técnicos não aparecem mais). O AdSense bloqueou novas tentativas até **2026-10-16**.

Conclusão: a checklist técnica abaixo estava correta, mas não era o critério que faltava. A política cita "valor único substancial", "curadoria e manutenção estrutural contínuas" e "interesse genuíno do usuário", e aponta para as políticas de conteúdo superficial/em escala. Duas correções sobre o que este documento afirmava:

- **A contagem de palavras da tabela estava inflada**: incluía o texto do JSON-LD e da navegação. A prosa real das páginas de guia ficava entre 567 e 1085 palavras.
- **A recomendação "apto" foi prematura**: ela avaliou SEO técnico, não diferenciação de conteúdo nem maturidade/tráfego do site.

### O que mudou depois disso (branch `feat/blog-and-content-depth`)

- **Blog (`/blog`)** com três artigos de estrutura própria, baseados no que foi descoberto construindo o site — não no molde dos guias. Toda saída de ferramenta citada é gerada pela ferramenta real no build, e cada afirmação tem teste (`src/content/blog/blog.test.ts`).
- **Removida `/xml/to-yaml`** (301 → `/xml/to-json`): a própria introdução dizia que a página existia porque "xml to yaml" é uma busca, não porque a conversão fosse diferente — a definição de página-porta.
- **Removida a FAQ "meu conteúdo é enviado a algum lugar?"** das 15 páginas de guia (e das 90 traduções): a mesma pergunta, com outras palavras, em todas as páginas.
- **Conteúdo novo e verificado** onde a página ficou curta: o "problema da Noruega" em `/json/to-yaml` e o caso `name` → `NAME` no Oracle (descoberto nesta rodada).
- **`lastmod` do sitemap** agora vem da data real de revisão do conteúdo, não da data do build (que mudava todas as URLs a cada deploy).
- **Política de Privacidade** mostrava "última atualização: hoje" (`new Date()`); agora mostra a data real da última alteração.

### Antes de reenviar em 16/10

- Conferir o tráfego real no Search Console (Desempenho → cliques/impressões). O GA4 do site só carrega após interação ou 5 s, então subconta visitas curtas.
- Pedir indexação de `/blog` e dos três artigos na Inspeção de URL.
- Não reenviar sem mudança de substância: o limite de tentativas já foi atingido uma vez.

---

## Verificação original (2026-09-29)

**Data desta verificação:** 2026-09-29
**Verificado contra:** produção (`https://www.prettyformat.com`), pós-deploy da branch `feat/ssg-seo-adsense` (mergeada em `main` via PR #33/#35, deploy confirmado em 2026-09-22).

## Motivo da reprovação original

"Conteúdo de baixo valor" — o site, à época, era essencialmente um formatador de SQL genérico: uma única página, título/descrição genéricos em todas as rotas, sem profundidade de conteúdo, sem páginas específicas por caso de uso.

## O que mudou

- **SSG/pré-renderização real**: cada rota gera HTML estático com `<title>`/`<meta>`/canonical próprios em tempo de build (`src/seo/routes.ts`), em vez de um shell de SPA genérico servido para todas as URLs.
- **Conteúdo verificável, não genérico**: 5 páginas de dialeto SQL (PostgreSQL, MySQL, T-SQL, Oracle PL/SQL, BigQuery) com exemplos gerados pela própria lib `sql-formatter` (testados, não digitados à mão), seções de "limitações conhecidas" honestas, e FAQ real. Mesmo padrão nas páginas `/json/*` e `/xml/*`.
- **Ferramentas novas e funcionais**: conversor JSON↔XML↔YAML, diff de SQL (`/sql/diff`), testador de XPath (`/xml/xpath`) — não são só variações de conteúdo, são funcionalidades reais e testadas.
- **Infraestrutura corrigida**: `nginx.conf` reescrito (canonical host, 404 real via `try_files`, cabeçalhos de segurança que antes eram descartados), service worker trocado para network-first em HTML, `AdPlaceholder` corrigido para usar o `slotId` de verdade.
- **Tradução completa do conteúdo dos guias** (pt/es/de/fr/zh/ja) — melhora a experiência para quem troca o idioma manualmente (não afeta indexação/SEO, já que o pré-render é sempre em inglês e não há URLs por idioma — ver decisão registrada na conversa).

## Checklist técnico verificado em produção (2026-09-29)

| Item | Resultado |
|---|---|
| `ads.txt` presente e com o publisher ID correto | ✅ `google.com, pub-4026555335042993, DIRECT, f08c47fec0942fa0` |
| Script `adsbygoogle.js` carregado com o client ID certo | ✅ |
| Meta tag de verificação do AdSense no `<head>` | ✅ `google-adsense-account` = `ca-pub-4026555335042993` |
| HTTPS forçado (`http://` → `https://`) | ✅ 301 |
| Canonical host (`prettyformat.com` → `www.prettyformat.com`) | ✅ 301 |
| Privacy Policy / Terms / About / Contact | ✅ todas HTTP 200, conteúdo real |
| Todas as 24 URLs do `sitemap.xml` | ✅ 24/24 retornando HTTP 200 |
| Título `<title>` único por página | ✅ nenhuma duplicata |
| Canonical `<link>` correto por página | ✅ aponta para a própria URL, sem trailing slash inconsistente |
| 404 real (não soft-404) | ✅ `/404-test-nonexistent-path` → HTTP 404 |
| Profundidade de conteúdo por página | ✅ 598–2259 palavras por página (contagem de texto visível, sem tags) |
| Texto placeholder ("lorem ipsum", "em construção", "TODO") | ✅ nenhum encontrado em nenhuma das 24 páginas |
| Viewport mobile (`<meta name="viewport">`) | ✅ presente |
| `robots.txt` permite `Mediapartners-Google` / `AdsBot-Google` / `AdsBot-Google-Mobile` | ✅ |

### Detalhe por página (palavras de texto visível, `<title>`)

| URL | Palavras | Título |
|---|---|---|
| `/` | 959 | Pretty Format - Free Online Formatting Tools for Developers |
| `/sql` | 1701 | Free Online SQL Formatter - Beautify Your SQL Code |
| `/sql/postgresql` | 2259 | PostgreSQL Formatter - Format Postgres Queries Online |
| `/sql/mysql` | 1826 | MySQL Formatter - Format MySQL and MariaDB Queries Online |
| `/sql/t-sql` | 1960 | T-SQL Formatter - Format SQL Server Queries Online |
| `/sql/oracle-plsql` | 1815 | Oracle SQL Formatter - Format PL/SQL and Oracle Queries Online |
| `/sql/bigquery` | 1715 | BigQuery SQL Formatter - Format GoogleSQL Queries Online |
| `/sql/diff` | 1695 | SQL Diff - Compare Two SQL Queries Online |
| `/json` | 1532 | Free Online JSON Formatter - Validate and Beautify JSON |
| `/json/minify` | 1578 | JSON Minifier - Compact and Minify JSON Online |
| `/json/validate` | 1566 | JSON Validator - Check JSON Syntax Online |
| `/json/to-typescript` | 1650 | JSON to TypeScript Converter - Generate Interfaces Online |
| `/json/to-xml` | 1680 | JSON to XML Converter - Convert JSON to XML Online |
| `/json/to-yaml` | 1450 | JSON to YAML Converter - Convert JSON to YAML Online |
| `/xml` | 1474 | Free Online XML Formatter - Beautify Your XML Code |
| `/xml/minify` | 1674 | XML Minifier - Compact and Minify XML Online |
| `/xml/validate` | 1500 | XML Validator - Check XML Well-Formedness Online |
| `/xml/to-json` | 1568 | XML to JSON Converter - Convert XML to JSON Online |
| `/xml/to-yaml` | 1312 | XML to YAML Converter - Convert XML to YAML Online |
| `/xml/xpath` | 1552 | XPath Tester - Evaluate XPath Expressions Online |
| `/about` | 720 | About Pretty Format \| Pretty Format |
| `/contact` | 598 | Contact Support \| Pretty Format |
| `/privacy` | 829 | Privacy Policy \| Pretty Format |
| `/terms` | 1585 | Terms of Service \| Pretty Format |

## Ressalvas conhecidas (não bloqueantes)

1. **Deploy recente**: no ar desde 2026-09-22, uma semana antes desta verificação. O AdSense usa seu próprio crawler (`AdsBot-Google`, já liberado no `robots.txt`), então não depende da indexação orgânica ter terminado — mas vale conferir o relatório de Páginas no Search Console antes de submeter, por segurança.
2. **Sitemap legado**: `sql.prettyformat.com/sitemap.xml`, cadastrado no Search Console em 2026-01-26, ainda aparece como "Processado" mesmo o subdomínio agora sendo só um redirect 301 para `/sql`. Recomendado remover essa entrada manualmente no Search Console (não é algo que o código deste repositório controle).
3. **Conteúdo de blog/guias**: deixado para depois por decisão explícita durante o desenvolvimento — não é bloqueante para este reenvio, mas seria o investimento natural se o Google rejeitar de novo por profundidade de conteúdo.

## Recomendação (original, 2026-09-29 — ver atualização no topo)

Apto para solicitar reavaliação do AdSense. Nenhum item da checklist técnica falhou; os problemas que motivaram a reprovação original (conteúdo genérico, título/descrição duplicados, soft-404) foram corrigidos e verificados diretamente em produção.
