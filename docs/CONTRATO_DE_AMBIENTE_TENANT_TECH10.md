# Contrato de Ambiente do Tenant Tech10

Data-base: `2026-05-11`

## Objetivo

Definir as variáveis de ambiente canônicas do runtime standalone da Tech10.

## Variáveis obrigatórias

| Variável | Obrigatória | Papel | Exemplo |
|---|---|---|---|
| `TECH10_STORE_BACKEND_URL` | Sim | Backend alvo do proxy `/api/store/*` | `https://catalogo.tech10cloud.com` |
| `TECH10_ERP_PORTAL_BASE_URL` | Sim | Base do portal completo do ERP | `https://sistema.tech10cloud.com/portal` |
| `TECH10_ERP_STATUS_BASE_URL` | Sim | Base da consulta pública simples | `https://sistema.tech10cloud.com/status` |

## Variáveis opcionais

| Variável | Papel |
|---|---|
| `TECH10_STORE_BEARER_TOKEN` | Bearer token server-to-server para o backend da loja |
| `TECH10_STORE_API_KEY` | Chave técnica alternativa ao bearer |
| `STORE_BACKEND_URL` | Fallback temporário compatível para `TECH10_STORE_BACKEND_URL` |

## Semântica operacional

- sem `TECH10_STORE_BACKEND_URL`, o runtime sobe mas fica `degraded`
- sem `TECH10_ERP_PORTAL_BASE_URL` ou `TECH10_ERP_STATUS_BASE_URL`, o runtime perde a ponte oficial com o ERP
- tokens nunca devem ir para o HTML ou para `tenant-config.js`

## Fonte de verdade

- arquivo de exemplo: [SITE_RECUPERADO_TECH10/.env.example](/Users/darlancavalcante/Documents/TECH/portal_tech10/SITE_RECUPERADO_TECH10/.env.example)
- endpoint público de leitura operacional: `/api/runtime-config`
