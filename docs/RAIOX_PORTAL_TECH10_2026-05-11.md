# Raio-X do portal_tech10

Data de referência: `2026-05-11`

## 1. O que este repositório é hoje

O `portal_tech10` continua com uma raiz institucional antiga, mas a base real de
publicação do tenant foi consolidada em:

- `SITE_RECUPERADO_TECH10/`

## 2. O que foi confirmado tecnicamente

Essa base já possui:

- home institucional
- catálogo
- carrinho
- checkout
- pedido confirmado
- páginas de categoria
- admin legado
- entrypoint de portal do cliente

## 3. O que entrou nesta rodada

Foi criado um runtime standalone mínimo e profissional:

- `SITE_RECUPERADO_TECH10/vercel.json`
- `SITE_RECUPERADO_TECH10/api/store-proxy.js`
- `SITE_RECUPERADO_TECH10/api/health.js`
- `SITE_RECUPERADO_TECH10/api/runtime-config.js`
- `SITE_RECUPERADO_TECH10/portal/index.html`
- `SITE_RECUPERADO_TECH10/js/portal-entry.js`

Também foram saneados:

- paths antigos `/tech10/*`
- links principais para `/loja`, `/carrinho` e `/portal`
- centralização de rotas e branding em `tenant-config.js` + `tenant-routes.js`

## 4. Rotas canônicas atuais

- `/`
- `/loja`
- `/carrinho`
- `/checkout`
- `/pedido-confirmado`
- `/portal`
- `/api/store/*`
- `/api/health`
- `/api/runtime-config`

## 5. Relação correta com o ERP

O portal Tech10 publica a entrada pública do cliente em `/portal`, mas a jornada
operacional de O.S. continua no ERP, por contrato explícito:

- `TECH10_ERP_PORTAL_BASE_URL`
- `TECH10_ERP_STATUS_BASE_URL`

## 6. Fronteira obrigatória

Este raio-x assume explicitamente:

- `redevivah.com.br` é outro projeto
- `vivacommerce` é outro projeto
- não existe mais vínculo operacional aceito entre a Tech10 e esses runtimes

## 7. Riscos ainda abertos

- aliases legados como `cartVivaCommerce`
- múltiplas chaves de carrinho no `localStorage`
- service worker e `manifest.json` ainda não passaram por rodada de limpeza final
- `admin/` segue como legado estático

## 8. Próximo passo crítico

O próximo passo real agora é operacional:

1. criar projeto próprio de deploy da Tech10
2. configurar as variáveis de runtime
3. anexar `tech10.tech10cloud.com`
4. rodar smoke do domínio final
