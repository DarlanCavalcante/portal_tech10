# Ownership e Publicação do Tenant Tech10

Data de referência: `2026-05-11`

## Resumo executivo

O ecossistema Tech10 hoje não está concentrado em um único repositório. Há pelo menos quatro peças com papéis diferentes:

1. `portal_tech10`
2. `tech10-informatica`
3. `VIVACOMMERCE/loja_tech_site`
4. `VIVACOMMERCE/storefront`

O papel correto de cada uma foi mapeado abaixo.

## 1. portal_tech10

Repositório: `DarlanCavalcante/portal_tech10`

Papel atual:

- working copy rica e auditável;
- snapshot funcional do site/loja Tech10;
- contém a camada `SITE_RECUPERADO_TECH10/` com site, carrinho, checkout, pedido confirmado e admin;
- bom candidato para documentação, saneamento e prototipação controlada.

Leitura honesta:

não há evidência de que este seja, sozinho, o host canônico de produção.

## 2. tech10-informatica

Repositório: `DarlanCavalcante/tech10-informatica`

Papel atual:

- pacote estático de publicação do tenant Tech10;
- documentação voltada a Cloudflare Pages, Docker e deploy direto;
- árvore muito próxima da experiência estática do tenant.

Sinal forte:

o projeto é descrito como `Loja Piloto REVIVAH Marketplace`.

Leitura honesta:

parece ser um pacote de publicação/empacotamento do tenant, e não a origem arquitetural central do marketplace.

## 3. VIVACOMMERCE/loja_tech_site

Repositório: `DarlanCavalcante/VIVACOMMERCE`

Pasta: `loja_tech_site/`

Papel atual:

- camada estática de integração Tech10 com o backend VivaCommerce;
- fonte canônica dos scripts JS de integração, segundo o próprio repositório;
- contém:
  - `api-config.js`
  - `api-adapter.js`
  - `load-products.js`
  - `cart-vivacommerce.js`

## 4. VIVACOMMERCE/storefront

Repositório: `DarlanCavalcante/VIVACOMMERCE`

Pasta: `storefront/`

Papel atual:

- runtime canônico multi-tenant do marketplace;
- aplicação Next.js;
- projeto apontado pela Vercel `vivacommerce`;
- contém rotas reais:
  - `/lojas/[slug]`
  - `/lojas/[slug]/shop`
  - `/lojas/[slug]/cart`
  - `/lojas/[slug]/checkout`
  - `/tech10`

Sinais fortes:

- o projeto Vercel `vivacommerce` usa `Root Directory: storefront`
- o monorepo `VIVACOMMERCE` contém documentação explícita sobre tenant architecture e inventário do original vs atual
- a rota `storefront/app/tech10/page.tsx` usa slug `revivah-tech`

## 5. Conclusão de ownership

Hoje, a leitura mais segura é:

- **runtime canônico multi-tenant:** `VIVACOMMERCE/storefront`
- **integração estática Tech10 canônica:** `VIVACOMMERCE/loja_tech_site`
- **snapshot/working copy rica:** `portal_tech10`
- **pacote estático de publicação:** `tech10-informatica`

## 6. O que isso muda na estratégia

Para colocar a experiência de tenant em produção com segurança, o caminho mais profissional não é reinventar tudo dentro do `portal_tech10`.

O caminho correto é:

1. usar `portal_tech10` para saneamento, documentação e extração de componentes/fluxos;
2. alinhar a configuração canônica do tenant com o monorepo `VIVACOMMERCE`;
3. publicar a experiência real do tenant pelo runtime multi-tenant já existente;
4. evitar divergência entre cópia estática e runtime canônico.

## 7. Risco principal

O maior risco hoje é o mesmo fluxo existir em múltiplos lugares:

- `portal_tech10`
- `tech10-informatica`
- `VIVACOMMERCE/loja_tech_site`
- `VIVACOMMERCE/storefront/public/tech10`
- `VIVACOMMERCE/storefront/app/tech10`

Sem governança, isso gera:

- divergência de branding;
- divergência de rotas;
- bugs difíceis de rastrear;
- dúvida sobre qual repositório publicar.

## 8. Próximo passo recomendado

O próximo passo crítico é declarar canonicidade operacional:

1. `portal_tech10` continua como trilha de saneamento/documentação;
2. a publicação real deve apontar para `VIVACOMMERCE/storefront`;
3. a configuração do tenant deve ser consolidada para não depender de hardcodes espalhados.
