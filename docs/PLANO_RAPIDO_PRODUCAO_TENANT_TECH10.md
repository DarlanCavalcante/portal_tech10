# Plano Rápido de Produção do Tenant Tech10

Data-base: `2026-05-11`

## Objetivo

Colocar a Tech10 em produção com `site + vendas + portal` no menor caminho
seguro possível, sem depender de projeto externo não autorizado.

## Verdade confirmada

- o `portal_tech10` é a base principal desta trilha;
- `SITE_RECUPERADO_TECH10/` já possui home, catálogo, carrinho, checkout,
  pedido confirmado e admin;
- há sinais históricos de integração por slug e adapters, mas eles não devem ser
  tratados como vínculo operacional ativo.

## Caminho mais curto para produção

### Opção recomendada

Usar a própria base Tech10 como origem da publicação:

- `portal_tech10` como base principal de saneamento e deploy;
- `tech10-informatica` como base adjacente a comparar antes da decisão final;
- projeto de deploy próprio da Tech10, sem reaproveitar runtime externo.

## O que já ficou adiantado

- `SITE_RECUPERADO_TECH10/js/tenant-config.js`
- `SITE_RECUPERADO_TECH10/js/tenant-routes.js`
- `SITE_RECUPERADO_TECH10/js/api-config.js` adaptado para `TENANT_CONFIG`
- `SITE_RECUPERADO_TECH10/js/empresa-config.js` adaptado para `TENANT_CONFIG`
- documentação de variáveis, ownership, raio-x e checklist

## Bloqueios reais hoje

### 1. Base única

Ainda falta declarar se a publicação final sairá de:

- `portal_tech10`
- `tech10-informatica`

### 2. Domínio final

O alvo mais natural continua sendo:

- `https://tech10.tech10cloud.com`

Mas esse domínio agora está livre de vínculo com `vivacommerce` e deve ser
apontado apenas depois da criação do projeto próprio da Tech10.

### 3. Hardcodes remanescentes

Mesmo com `tenant-config.js` e `tenant-routes.js`, ainda existem pontos com
acoplamento Tech10 que precisam de rodada posterior:

- `SITE_RECUPERADO_TECH10/sw.js`
- `SITE_RECUPERADO_TECH10/manifest.json`
- `SITE_RECUPERADO_TECH10/js/product-modal.js`
- `SITE_RECUPERADO_TECH10/js/load-products.js`
- `SITE_RECUPERADO_TECH10/js/load-products-medusa.js`
- `SITE_RECUPERADO_TECH10/js/home-shop.js`
- `SITE_RECUPERADO_TECH10/admin/*`

## URL pública recomendada

- `https://tech10.tech10cloud.com` = entrada institucional
- `https://tech10.tech10cloud.com/loja` = vendas
- `https://tech10.tech10cloud.com/portal` = entrada do portal, via redirect ou
  integração explícita com o ERP

## Próxima ordem recomendada

1. escolher a base única entre `portal_tech10` e `tech10-informatica`;
2. criar projeto próprio da Tech10 na Vercel ou no provedor escolhido;
3. apontar `tech10.tech10cloud.com` para esse projeto;
4. migrar os hardcodes remanescentes para configuração;
5. executar um raio-x final de publicação com smoke.

## Veredito

O cenário mais seguro agora é:

- manter `portal_tech10` como base de saneamento e referência;
- criar publicação própria da Tech10;
- só depois anexar o domínio final.
