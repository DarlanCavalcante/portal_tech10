# Commit Storefront Tech10 - 2026-05-29

## Objetivo

Consolidar em um commit único o refinamento seguro da vitrine pública da Tech10,
sem alterar fluxo operacional de `portal`, `api`, `carrinho`, `checkout` ou
integrações de catálogo.

## Escopo incluído

- refinamento visual e comercial da home
- reorganização de `Categorias em Destaque`
- melhoria institucional de `Sobre`, `Contato`, `Serviços`, `Empresas`, `Dicas`
  e `Footer`
- reposicionamento comercial da página
  `/desenvolvimento-de-sistemas-santa-maria`
- criação de páginas adicionais para SEO local
- padronização pública de nome, contato, endereço e horário
- base técnica para SEO local e Search Console
- refinamento seguro da rota `/loja`, limitado à camada de vitrine
- documentação operacional desta rodada

## Fora do escopo

Não entra neste commit:

- `portal/index.html`
- `api/*`
- `carrinho.html`
- `checkout.html`
- `pedido-confirmado.html`
- regras de sincronização de catálogo
- autenticação
- backend operacional

## Arquivos agrupados por área

### Home e vitrine institucional

- `SITE_RECUPERADO_TECH10/index.html`
- `SITE_RECUPERADO_TECH10/css/styles.css`
- `SITE_RECUPERADO_TECH10/js/categories-showcase.js`
- `SITE_RECUPERADO_TECH10/js/script.js`

### Loja pública

- `SITE_RECUPERADO_TECH10/produtos.html`
- `SITE_RECUPERADO_TECH10/css/products-medusa.css`
- `SITE_RECUPERADO_TECH10/js/produtos-page.js`
- `SITE_RECUPERADO_TECH10/js/load-products.js`

### Páginas de serviço e SEO local

- `SITE_RECUPERADO_TECH10/categorias/apple.html`
- `SITE_RECUPERADO_TECH10/categorias/android.html`
- `SITE_RECUPERADO_TECH10/categorias/assistencia.html`
- `SITE_RECUPERADO_TECH10/categorias/notebooks.html`
- `SITE_RECUPERADO_TECH10/categorias/smartphones.html`
- `SITE_RECUPERADO_TECH10/categorias/desenvolvimento.html`
- `SITE_RECUPERADO_TECH10/categorias/computadores.html`
- `SITE_RECUPERADO_TECH10/categorias/redes-infraestrutura.html`
- `SITE_RECUPERADO_TECH10/js/site-seo.js`
- `SITE_RECUPERADO_TECH10/vercel.json`

### Configuração pública da marca

- `SITE_RECUPERADO_TECH10/js/tenant-config.js`
- `SITE_RECUPERADO_TECH10/js/empresa-config.js`

### Indexação e verificação

- `SITE_RECUPERADO_TECH10/sitemap.xml`
- `SITE_RECUPERADO_TECH10/googleb0bfbd0d7ab63e65.html`

### Documentação

- `docs/HANDOFF_BRANCH_TENANT_TECH10_PUBLIC_SEO_2026-05-28.md`
- `docs/EXECUCAO_TECH10_2026-05-29.md`
- `docs/COMMIT_STOREFRONT_TECH10_2026-05-29.md`
- `docs/README.md`

## Resumo funcional do commit

### 1. Home

- hero melhor enquadrado
- hierarquia visual mais consistente
- `Categorias em Destaque` com grupos `Especialidades` e `Loja & apoio`
- melhor leitura em mobile
- blocos institucionais mais coerentes com a proposta da marca

### 2. Página de desenvolvimento

- posicionamento mais comercial
- foco em sistemas, automação, integrações, IA, cloud e suporte contínuo
- inclusão de nichos atendidos e pacotes comerciais

### 3. Loja pública

- topo simplificado para `Catálogo Tech10`
- sidebar de categorias refinada
- cards de produto mais claros e mais comerciais
- busca com limpeza rápida
- recuperação de navegação quando não há resultado

### 4. SEO local

- páginas de serviço preparadas para buscas locais
- rotas amigáveis em `vercel.json`
- `sitemap.xml`
- arquivo de verificação do Search Console

## Fallback configurado

### Fallback Git

Antes deste commit, o ponto-base da branch foi marcado com a tag local:

- `fallback/tech10-before-storefront-20260529`

Uso pretendido:

- comparar rapidamente o antes e depois
- criar rollback por `revert`
- reabrir uma linha segura de referência sem perder a branch de trabalho

### Fallback de navegação na loja

A rota `/loja` ficou com fallback funcional para:

- busca sem resultado
- categoria sem produtos públicos
- falha temporária de carregamento

Com ações de recuperação:

- `Ver todos os produtos`
- `Limpar busca`
- `Tentar novamente`
- `Consultar no WhatsApp`

### Fallback de publicação

O alias de validação registrado naquele momento era:

- `https://site-recuperado-tech-10.vercel.app`

Nota de continuidade em `2026-06-06`:

- esse alias pertencia ao projeto Vercel `site-recuperado-tech-10`
- esse projeto foi aposentado em `2026-06-06`
- o alias canônico atual da Tech10 e `https://tech10-portal.vercel.app`
- o domínio canônico atual continua sendo `https://tech10.loja.tech10cloud.com/`

O domínio oficial `https://tech10.loja.tech10cloud.com/` segue fora do vínculo
acessível nesta conta. Isso preserva um fallback operacional natural, porque a
produção oficial ainda não foi substituída por esta rodada.

## Validação mínima recomendada após o commit

1. Abrir `/`
2. Abrir `/loja`
3. Testar busca com resultado e sem resultado
4. Abrir `/desenvolvimento-de-sistemas-santa-maria`
5. Conferir mobile em `360px`, `390px`, `414px` e `768px`
6. Conferir que `portal`, `checkout` e `carrinho` não entraram no escopo

## Rollback recomendado

Se for preciso desfazer a rodada sem perder histórico:

1. usar `git revert <hash-do-commit>`
2. ou comparar com a tag `fallback/tech10-before-storefront-20260529`
3. se o problema for só de publicação, manter a produção oficial atual e usar o
   alias canônico vigente do tenant como ambiente de revisão até a correção
