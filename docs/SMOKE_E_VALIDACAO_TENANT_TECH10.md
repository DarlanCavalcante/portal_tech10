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

## Smoke com backend configurado

```bash
EXPECT_STORE_BACKEND=1 SMOKE_BASE_URL=https://tech10.tech10cloud.com node scripts/smoke-runtime.mjs
```

## Rotas validadas

- `/`
- `/loja`
- `/carrinho`
- `/checkout`
- `/portal`
- `/api/runtime-config`
- `/api/health`
