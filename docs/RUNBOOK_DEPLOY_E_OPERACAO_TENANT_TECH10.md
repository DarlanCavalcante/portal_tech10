# Runbook de Deploy e Operação do Tenant Tech10

Data-base: `2026-05-11`

## Deploy recomendado

1. criar projeto dedicado `tech10-portal`
2. definir `SITE_RECUPERADO_TECH10/` como root directory
3. cadastrar variáveis do contrato de ambiente
4. publicar preview
5. rodar smoke do runtime
6. anexar `tech10.tech10cloud.com`
7. repetir smoke no domínio final

## Checklist de operação diária

1. validar `GET /api/health`
2. validar `GET /api/runtime-config`
3. abrir `/`
4. abrir `/loja`
5. abrir `/portal`

## Diagnóstico rápido

### `health = degraded`

- verifique se `TECH10_CATALOG_BACKEND_URL` está configurada
- se `TECH10_CHECKOUT_MODE=store_backend`, valide também `TECH10_CHECKOUT_BACKEND_URL`
- verifique se os backends alvo respondem `/health`

### Loja abre, mas sem catálogo

- chamar `/api/store/...`
- se receber `TECH10_CATALOG_BACKEND_NOT_CONFIGURED`, a env do catálogo não foi definida
- se receber `TECH10_STORE_PROXY_ERROR`, investigar conectividade ou credencial

### Loja navega, mas carrinho não entra

- validar `TECH10_CHECKOUT_MODE`
- se estiver em `quote_only`, o comportamento correto é abrir atendimento
- se receber `TECH10_CHECKOUT_BACKEND_NOT_CONFIGURED`, cadastrar `TECH10_CHECKOUT_BACKEND_URL`
- validar também o modal do produto:
  - o botão principal deve pedir atendimento
  - o botão secundário deve levar ao WhatsApp
  - não deve aparecer fluxo de compra transacional falso

### Portal abre, mas não segue a O.S.

- validar `TECH10_ERP_PORTAL_BASE_URL`
- validar `TECH10_ERP_STATUS_BASE_URL`

## Comandos úteis

```bash
cd /Users/darlancavalcante/Documents/TECH/portal_tech10/SITE_RECUPERADO_TECH10
node scripts/validate-runtime-contract.mjs
node scripts/smoke-runtime.mjs
```
