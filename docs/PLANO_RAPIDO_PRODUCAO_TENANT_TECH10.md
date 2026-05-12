# Plano Rápido de Produção do Tenant Tech10

Data-base: `2026-05-11`

## Objetivo

Colocar a Tech10 em produção com `site + vendas + portal` usando base própria,
sem misturar com outros projetos.

## Verdade atual

- base única escolhida: `portal_tech10/SITE_RECUPERADO_TECH10`
- runtime standalone já preparado
- projeto dedicado já criado: `tech10-portal`
- alias de produção já ativo: `https://tech10-portal.vercel.app`
- ERP já ligado como backend de catálogo via `https://core.tech10cloud.com`
- slug público já ativado: `tech10`
- rotas públicas já definidas:
  - `/`
  - `/loja`
  - `/carrinho`
  - `/checkout`
  - `/pedido-confirmado`
  - `/portal`
- proxy de loja já preparado em `/api/store/*`

## Caminho mais curto para produção

1. manter o runtime em `quote_only` enquanto a venda continuar por atendimento
2. manter os produtos vendaveis da Tech10 vinculados ao catalogo publico do ERP
3. revisar categorias/taxonomia e identidade comercial dos itens na loja
4. validar a loja com itens reais:
   - home
   - catálogo
   - carrinho
   - entrada do portal
   - modal do produto em `quote_only`
5. anexar `tech10.tech10cloud.com`
6. executar smoke final em domínio oficial

## O que já ficou adiantado

- `vercel.json`
- `api/store-proxy.js`
- `api/health.js`
- `api/runtime-config.js`
- `portal/index.html`
- `js/portal-entry.js`
- `js/tenant-config.js`
- `js/tenant-routes.js`

## Riscos ainda abertos

- aliases legados como `cartVivaCommerce`
- coexistência de chaves de carrinho no `localStorage`
- `admin/` ainda é legado estático e não deve ser tratado como painel pronto de produção
- service worker e `manifest.json` ainda merecem rodada de saneamento depois do go-live inicial

## Veredito

O bloqueio principal agora nao e mais deploy nem publicacao inicial de catalogo.

E curadoria comercial da vitrine:

1. consolidar taxonomia e apresentacao dos produtos reais
2. manter a UX coerente com `quote_only`
3. so depois apontar o dominio oficial
