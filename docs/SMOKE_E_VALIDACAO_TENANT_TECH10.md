# Smoke e Validação do Tenant Tech10

Data-base: `2026-05-11`

## Objetivo

Padronizar a validação mínima do runtime standalone antes de deploy e após deploy.

## Validação estrutural

```bash
cd /Users/darlancavalcante/Documents/TECH/portal_tech10/SITE_RECUPERADO_TECH10
node scripts/validate-runtime-contract.mjs
```

## Smoke local

Com `vercel dev` em execução:

```bash
cd /Users/darlancavalcante/Documents/TECH/portal_tech10/SITE_RECUPERADO_TECH10
node scripts/smoke-runtime.mjs
```

## Smoke com catálogo configurado

```bash
EXPECT_CATALOG_BACKEND=1 SMOKE_BASE_URL=https://tech10.tech10cloud.com node scripts/smoke-runtime.mjs
```

## Rotas validadas

- `/`
- `/loja`
- `/carrinho`
- `/checkout`
- `/portal`
- `/api/runtime-config`
- `/api/health`

## Leitura operacional esperada

- `commerce.catalogSource` indica de onde os produtos vêm
- `commerce.checkoutMode` indica se a loja fecha pedido ou opera em atendimento
- `commerce.capabilities.cart=false` é esperado quando o catálogo está em `quote_only`

## Checklist visual/comercial mínimo

Depois do smoke técnico, validar também:

- a loja pública não exibe categorias fallback como `Outros`
- nomes públicos de categoria aparecem em formato comercial
- produtos publicados carregam imagem principal
- a sidebar mostra apenas categorias reais do tenant
- o CTA principal continua coerente com `quote_only`
- o modal do produto não oferece checkout falso quando a loja está em `quote_only`
- produtos com nome parecido ficam distinguíveis por marca e/ou SKU
- a busca encontra produtos também por `marca` e `SKU`
