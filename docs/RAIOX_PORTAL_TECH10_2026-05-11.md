# Raio-X do portal_tech10

Data de referência: `2026-05-11`

## 1. O que este repositório é hoje

O repositório `portal_tech10` contém duas camadas distintas:

1. uma home institucional estática na raiz do projeto;
2. uma camada mais completa em `SITE_RECUPERADO_TECH10/`, com loja, carrinho, checkout e admin.

Esse segundo núcleo é a base mais promissora para uma futura experiência de site + portal + vendas por tenant.

## 2. Estrutura confirmada

### Raiz

- `index.html`
- `css/`
- `js/`
- `imagem/`
- `README.md`

Essa camada é institucional e centrada na marca Tech10.

### Núcleo recuperado

Diretório: `SITE_RECUPERADO_TECH10/`

Arquivos e áreas relevantes:

- `index.html`
- `produtos.html`
- `carrinho.html`
- `checkout.html`
- `pedido-confirmado.html`
- `home-shop.html`
- `categorias/`
- `admin/login.html`
- `admin/dashboard.html`
- `admin/monitor.html`
- `js/api-config.js`
- `js/api-adapter.js`
- `js/cart-vivacommerce.js`
- `js/load-products.js`
- `js/empresa-config.js`
- `INTEGRACAO_VIVACOMMERCE.md`
- `README.md`

## 3. O que já existe de site + vendas

Foi confirmado que a camada `SITE_RECUPERADO_TECH10/` já possui:

- catálogo de produtos;
- páginas por categoria;
- carrinho;
- checkout;
- confirmação de pedido;
- painel admin estático acoplado a API;
- integração com backend via rotas de loja por slug.

Além disso, existe um documento histórico interno em:

- `SITE_RECUPERADO_TECH10/DOCUMENTACAO/PROJETO_CORRETO_CONFIRMADO.md`

Esse arquivo registra que essa linha de frontend foi confirmada como a base correta do projeto em `2025-01-15`.

## 4. Sinais reais de modo tenant

O projeto já possui sinais concretos de uma arquitetura por tenant:

- slug de loja em `js/api-config.js`
- adapter consumindo rotas por slug em `js/api-adapter.js`
- links para `/lojas/revivah-tech/shop`
- links de categoria com `?store=revivah-tech`
- home agregadora em `home-shop.html`

Ou seja: a ideia de uma página/site por tenant não é hipotética; ela já aparece no código. Hoje ela está apenas incompleta e parcialmente hardcoded na Tech10.

## 5. O que ainda está hardcoded

Os principais hardcodes atuais estão em:

- identidade visual Tech10
- WhatsApp Tech10
- email Tech10
- endereço Tech10
- paths como `/tech10/`
- slug `revivah-tech`
- fallback local `localhost`

Esses pontos estão detalhados em `VARIAVEIS_E_CONFIGURACAO_PORTAL_TECH10.md`.

## 6. Relação com o ERP

No repositório principal `SaaS_redevivah_tech-manager`, já existem:

- portal do cliente: `/portal/[osNumber]`
- status público: `/status/[id]`
- PDV interno autenticado: `/vendas`

Mas o storefront/site público deste repositório não está embutido no ERP como código canônico. Portanto, hoje:

- o ERP resolve operação, portal e status;
- `portal_tech10` é um projeto satélite de site/loja;
- a integração ideal é por APIs e rotas canônicas, não por mistura de bases.

## 6.1. Relação com a hospedagem atual

Na Vercel da conta atual, foi confirmado um projeto separado:

- projeto: `vivacommerce`
- root directory: `storefront`
- framework: `Next.js`
- deployment inspecionado: `dpl_Acevj2BYpeVupGXoXEFzjKZakjsd`
- aliases:
  - `https://vivacommerce.com.br`
  - `https://vivacommerce-darlancavalcantes-projects.vercel.app`
  - `https://vivacommerce-git-main-darlancavalcantes-projects.vercel.app`

Essa evidência sugere que a experiência pública de loja/tenant pode estar, hoje, sendo publicada por uma base de storefront separada da cópia estática/documental do `portal_tech10`.

Ao mesmo tempo, a checagem de domínio e deployment mostrou:

- `vivacommerce.com.br` está associado ao projeto certo, mas com DNS mal configurado na Vercel;
- o deployment `.vercel.app` respondeu `401 Unauthorized`;
- o corpo da resposta confirmou `Authentication Required` da própria Vercel;
- as checagens externas de `https://vivacommerce.com.br` falharam por resolução de nome, reforçando que o DNS público ainda não está funcional.

Também foi confirmado que, no escopo Vercel atual:

- não apareceu um domínio público Tech10 separado já ativo;
- não apareceu um alias próprio da Tech10 fora do projeto `vivacommerce`;
- a experiência Tech10 pública conhecida depende hoje da plataforma `vivacommerce`, não de um host isolado do tenant.
- `vivacommerce.com.br` e `www.vivacommerce.com.br` não resolveram por DNS nas checagens diretas desta rodada.

Portanto, o vínculo entre:

- código canônico;
- host público ativo;
- domínio final;

ainda exige saneamento operacional antes de qualquer publicação forte.

## 6.2. Relação com os outros repositórios Tech10

Também foi confirmado que existem outros repositórios no ecossistema:

- `tech10-informatica`
- `VIVACOMMERCE`

O achado mais importante foi:

- o projeto Vercel `vivacommerce` aponta para `Root Directory: storefront`
- o monorepo `VIVACOMMERCE` contém:
  - `storefront/` com rotas tenant reais
  - `loja_tech_site/` com integração estática da Tech10
  - documentação explícita de inventário e tenant architecture

Isso muda a leitura de canonicidade:

- `portal_tech10` é uma base útil e rica;
- mas o runtime multi-tenant mais provável de produção está em `VIVACOMMERCE/storefront`.

Ver documento complementar:

- `OWNERSHIP_E_PUBLICACAO_TENANT_TECH10.md`

## 7. Fronteira obrigatória

Este raio-x assume explicitamente:

- `redevivah.com.br` é outro projeto;
- `redevivah-storefront` não deve ser alterado neste fluxo;
- qualquer evolução aqui deve ficar restrita ao tenant Tech10 e a uma futura arquitetura genérica por tenant.

## 8. Leitura honesta do estado atual

O projeto não está “só começado”. Ele já tem:

- UX institucional;
- UX de loja;
- checkout;
- admin;
- contrato inicial de integração com backend.

O problema real é governança técnica:

- configuração espalhada;
- hardcodes de tenant;
- ausência de documentação canônica de variáveis;
- falta de empacotamento profissional para multi-tenant;
- bloqueio operacional de domínio e autenticação de borda na runtime canônica.

## 9. Próximo passo recomendado

O próximo passo certo é transformar a Tech10 em tenant-config canônico:

1. centralizar variáveis e branding;
2. eliminar paths fixos como `/tech10/`;
3. padronizar slug, base URL e contatos por tenant;
4. definir o contrato de integração com ERP, portal e loja;
5. fechar o go-live operacional do `vivacommerce` com domínio íntegro e superfície pública validada.
