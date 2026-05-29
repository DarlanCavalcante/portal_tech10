# Handoff da Branch de SEO/Publico do Tenant Tech10

Data-base: `2026-05-28`

Repo: `portal_tech10__codex_prod`

Branch: `codex/tech10-public-seo-20260528`

## Objetivo

Registrar o que foi preparado nesta branch para a presenca publica da Tech10,
sem confundir esse trabalho com o sistema operacional de O.S., vendas,
checkout, autenticacao, APIs ou integracoes do tenant.

## Escopo seguro desta branch

- atua somente em `SITE_RECUPERADO_TECH10/`
- foco em identidade comercial, horarios, links publicos e SEO local
- nao inclui mudancas em `portal`, `checkout`, `carrinho`, `pedido-confirmado`,
  `api/*`, login, ERP, catalogo operacional ou backend
- nao foi publicada em producao

## Dados canonicos da Tech10 usados nesta branch

- nome: `Tech10 Informatica e Tecnologia`
- endereco: `Rua Dr. Bozano, 968 - Loja 8, Centro, Santa Maria - RS`
- telefone principal: `(55) 3317-0762`
- WhatsApp: `(55) 97400-1960`
- e-mail comercial: `tech10.infor@gmail.com`
- site: `https://tech10.loja.tech10cloud.com/`
- Instagram: `https://www.instagram.com/tech10info/`
- Facebook: `https://www.facebook.com/Tech10Infor/`
- horario:
  - segunda a sexta: `09:00-12:00` e `13:00-18:00`
  - sabado: `09:00-13:00`
  - domingo: `fechado`

## O que foi preparado na branch

### 1. Padronizacao da identidade comercial

Arquivos:

- `SITE_RECUPERADO_TECH10/js/tenant-config.js`
- `SITE_RECUPERADO_TECH10/js/empresa-config.js`

Resumo:

- nome comercial padronizado para `Tech10 Informatica e Tecnologia`
- slogan e descricao ajustados para a operacao real da loja
- endereco padronizado com `Rua Dr. Bozano`
- horario ajustado para `9h-12h / 13h-18h` e `sabado 9h-13h`
- Facebook corrigido para `https://www.facebook.com/Tech10Infor/`
- configuracao de SEO consolidada para o site oficial

### 2. Ajustes da home institucional

Arquivo:

- `SITE_RECUPERADO_TECH10/index.html`

Resumo:

- `meta description` local com foco em Santa Maria/RS
- blocos de servicos da home apontando para rotas dedicadas de SEO local
- nomes e chamadas ajustados para paginas especificas de servico
- horario do bloco de contato e rodape alinhado com o padrao oficial
- link publico do Facebook adicionado no contato
- carga de `js/site-seo.js` adicionada

### 3. SEO tecnico de baixo risco

Arquivos:

- `SITE_RECUPERADO_TECH10/js/site-seo.js`
- `SITE_RECUPERADO_TECH10/produtos.html`

Resumo:

- injecao por pagina de:
  - `title`
  - `meta description`
  - `keywords`
  - `canonical`
  - Open Graph
  - Twitter Cards
  - `meta robots`
- JSON-LD para:
  - `Organization`
  - `LocalBusiness` (`ComputerStore`)
  - `BreadcrumbList`
  - `Service`
  - `FAQPage` quando houver FAQ real na pagina
- `/portal`, `/status`, `/carrinho`, `/checkout` e `/pedido-confirmado`
  marcados como `noindex`
- `produtos.html` preparado com titulo e descricao melhores para busca local

## 4. Rotas amigaveis para SEO local

Arquivo:

- `SITE_RECUPERADO_TECH10/vercel.json`

Rotas preparadas:

- `/assistencia-tecnica-apple-santa-maria`
- `/conserto-iphone-santa-maria`
- `/assistencia-samsung-santa-maria`
- `/conserto-notebook-santa-maria`
- `/manutencao-computador-santa-maria`
- `/redes-e-infraestrutura-santa-maria`
- `/desenvolvimento-de-sistemas-santa-maria`
- `/loja-de-informatica-santa-maria`

## 5. Paginas de servico preparadas

Arquivos alterados:

- `SITE_RECUPERADO_TECH10/categorias/apple.html`
- `SITE_RECUPERADO_TECH10/categorias/android.html`
- `SITE_RECUPERADO_TECH10/categorias/assistencia.html`
- `SITE_RECUPERADO_TECH10/categorias/desenvolvimento.html`
- `SITE_RECUPERADO_TECH10/categorias/notebooks.html`
- `SITE_RECUPERADO_TECH10/categorias/smartphones.html`

Arquivos novos:

- `SITE_RECUPERADO_TECH10/categorias/computadores.html`
- `SITE_RECUPERADO_TECH10/categorias/redes-infraestrutura.html`

Resumo:

- rodapes dessas paginas passaram a carregar `js/site-seo.js`
- horarios de atendimento foram alinhados com o padrao oficial
- `apple.html` recebeu ajuste do link publico do Facebook
- foram abertas bases especificas para `computadores` e
  `redes-infraestrutura`

## Estado atual dos arquivos na branch

Modificados:

- `SITE_RECUPERADO_TECH10/categorias/android.html`
- `SITE_RECUPERADO_TECH10/categorias/apple.html`
- `SITE_RECUPERADO_TECH10/categorias/assistencia.html`
- `SITE_RECUPERADO_TECH10/categorias/desenvolvimento.html`
- `SITE_RECUPERADO_TECH10/categorias/notebooks.html`
- `SITE_RECUPERADO_TECH10/categorias/smartphones.html`
- `SITE_RECUPERADO_TECH10/index.html`
- `SITE_RECUPERADO_TECH10/js/empresa-config.js`
- `SITE_RECUPERADO_TECH10/js/tenant-config.js`
- `SITE_RECUPERADO_TECH10/produtos.html`
- `SITE_RECUPERADO_TECH10/vercel.json`

Novos e ainda nao rastreados:

- `SITE_RECUPERADO_TECH10/categorias/computadores.html`
- `SITE_RECUPERADO_TECH10/categorias/redes-infraestrutura.html`
- `SITE_RECUPERADO_TECH10/js/site-seo.js`
- `SITE_RECUPERADO_TECH10/sitemap.xml`

## O que esta pendente antes de qualquer deploy

### 1. Nao publicar direto em producao

Esta branch deve passar primeiro por `preview` ou `staging`, porque:

- o site produtivo ainda esta sob responsabilidade de outra equipe
- a branch toca identidade e rotas publicas
- as paginas novas ainda precisam de validacao editorial e tecnica

### 2. Search Console ainda depende do site

A propriedade `URL-prefix` do Search Console para
`https://tech10.loja.tech10cloud.com/` ja foi criada no Google, mas a
verificacao ainda nao foi concluida.

Dependencia externa atual:

- publicar o arquivo `googleb0bfbd0d7ab63e65.html` na raiz do site
  ou
- inserir a meta tag de verificacao na home

Observacao importante:

- nesta branch nao existe `robots.txt`
- nesta branch tambem nao existe ainda o arquivo HTML de verificacao do Google

### 3. Validar a home e as novas rotas sem tocar o sistema

Checklist minimo:

- home
- contato
- rodape
- links de Instagram, Facebook e WhatsApp
- horario e endereco em todos os blocos institucionais
- paginas de servico novas
- `/portal`
- `/loja`
- `/carrinho`
- `/checkout`

## Dependencias externas que nao se resolvem so pela branch

- Instagram:
  - o campo oficial de `Site` ainda precisa ser trocado no app movel
  - o valor alvo e `https://tech10.loja.tech10cloud.com/`
- Facebook:
  - a pagina publica `Tech10Infor` ainda precisa ser editada em uma sessao
    que realmente consiga alternar para a pagina como pagina
- Google Perfil da Empresa:
  - o nome publico ainda pode aparecer como `Tech10 Informatica & Technologia`
    ate a aprovacao final do Google

## Procedimento recomendado para a outra equipe

1. revisar somente o escopo de `SITE_RECUPERADO_TECH10/`
2. ignorar qualquer alteracao em fluxo operacional fora desse subtree
3. subir `preview` primeiro
4. validar dados comerciais canonicos no preview
5. decidir o que entra de imediato:
   - horario
   - identidade comercial
   - links publicos
   - SEO tecnico
6. decidir separadamente o que merece segunda rodada:
   - paginas novas de servico
   - revisao editorial fina
   - Search Console
7. publicar so depois do smoke basico

## Veredito

Esta branch e um pacote de `vitrine + SEO local`, nao um pacote de sistema.

Ela ajuda a deixar a Tech10 mais coerente para Google e clientes, mas deve ser
tratada como handoff controlado para a equipe do site, com preview, validacao e
rollback simples.
