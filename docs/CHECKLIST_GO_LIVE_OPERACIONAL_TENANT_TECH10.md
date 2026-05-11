# Checklist de Go-Live Operacional do Tenant Tech10

Data-base: `2026-05-11`

## Escopo

Checklist para colocar no ar o runtime próprio da Tech10, usando
`SITE_RECUPERADO_TECH10/`.

## Pré-condições

- projeto dedicado criado no provedor de deploy
- root directory configurado como `SITE_RECUPERADO_TECH10`
- domínio `tech10.tech10cloud.com` sem vínculo com projeto externo

## Variáveis mínimas

1. `TECH10_STORE_BACKEND_URL`
2. `TECH10_ERP_PORTAL_BASE_URL`
3. `TECH10_ERP_STATUS_BASE_URL`

Opcional:

4. `TECH10_STORE_BEARER_TOKEN`
5. `TECH10_STORE_API_KEY`

## Rotas que precisam responder

1. `/`
2. `/loja`
3. `/carrinho`
4. `/checkout`
5. `/pedido-confirmado`
6. `/portal`
7. `/api/health`
8. `/api/runtime-config`

## Smoke mínimo

1. home institucional abre sem erro
2. catálogo carrega produtos via `/api/store/*`
3. carrinho recebe item
4. checkout abre com resumo do carrinho
5. portal abre e redireciona corretamente para status/portal do ERP
6. `/api/health?deep=1` retorna `ok` ou indica claramente o upstream que falhou

## Domínio

1. anexar `tech10.tech10cloud.com` ao projeto correto
2. criar registro DNS apontando para a Vercel
3. validar:
   - `https://tech10.tech10cloud.com`
   - `https://tech10.tech10cloud.com/loja`
   - `https://tech10.tech10cloud.com/portal`

## Veredito

Depois desta rodada, o go-live da Tech10 depende mais de deploy e DNS do que de
reestruturação de código.
