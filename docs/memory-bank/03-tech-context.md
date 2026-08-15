# 03 — Tech Context

## Stack real
- **Frontend**: HTML5 + CSS3 (vanilla) + JavaScript ES6+ (vanilla). Sem framework, sem bundler, sem TypeScript (`tsconfig.json` inexistente; nenhum `.ts` no repo).
- **Animações (site legado da raiz)**: GSAP 3.x + ScrollTrigger via CDN; Font Awesome 6.x; Google Fonts (Outfit + Inter).
- **Runtime canônico**: funções serverless Node (Vercel) em `SITE_RECUPERADO_TECH10/api/*.js`. PWA (`sw.js`, `manifest.json`).
- **Integração loja**: indícios de **Medusa** (`js/medusa-client.js`, `medusa-cart.js`, `load-products-medusa.js`) atrás do proxy `/api/store/*`. Backend concreto = "(a investigar)".

## package.json
- **Raiz**: NÃO existe. Pré-requisito citado no README: Node.js 18+ apenas para `npx live-server`.
- **`SITE_RECUPERADO_TECH10/package.json`**: `name: tech10-portal-runtime`, `version: 1.0.0`, `private: true`. **Sem dependências declaradas.** Scripts:
  - `validate:runtime` → `node scripts/validate-runtime-contract.mjs`
  - `smoke:runtime` → `node scripts/smoke-runtime.mjs`

## Como rodar / validar
- Site legado (raiz): `npx live-server .` → http://127.0.0.1:8080
- Runtime canônico (validação):
  ```bash
  cd SITE_RECUPERADO_TECH10
  npm run validate:runtime
  npm run smoke:runtime
  ```
- Smoke manual: ver `SMOKE_CHECKLIST_2MIN.md`, `SMOKE_CI_VERCEL.md` (raiz).

## Testes
- Sem framework de testes unitários. "Testes" = scripts de smoke/validação de contrato de runtime (`scripts/*.mjs`) + checklists manuais. (a investigar: cobertura real)

## Variáveis de ambiente (contrato do tenant — `.env.example`)
Prefixo `TECH10_*`. Principais:
- Identidade: `TECH10_TENANT_ID` (tech10), `TECH10_PUBLIC_STORE_SLUG` (tech10), `TECH10_SITE_NAME`, `TECH10_RUNTIME_ID`.
- Catálogo: `TECH10_CATALOG_SOURCE` (`store_backend`|`erp_stock`), `TECH10_CATALOG_BACKEND_URL`.
- Checkout: `TECH10_CHECKOUT_MODE` (`store_backend`|`quote_only`), `TECH10_CHECKOUT_BACKEND_URL`.
- Fallback legado: `TECH10_STORE_BACKEND_URL` / `STORE_BACKEND_URL`.
- **Segredos (nunca no frontend)**: `TECH10_STORE_BEARER_TOKEN`, `TECH10_CATALOG_BEARER_TOKEN`, `TECH10_CHECKOUT_BEARER_TOKEN`, `TECH10_STORE_API_KEY`, `TECH10_CATALOG_API_KEY`, `TECH10_CHECKOUT_API_KEY`.
- ERP: `TECH10_ERP_PORTAL_BASE_URL`, `TECH10_ERP_STATUS_BASE_URL`, `TECH10_ERP_API_BASE_URL` (telemetria do funil), `TECH10_SUPPORT_WHATSAPP` (55974001960).

## Armadilhas / atenção
- **Não expor tokens no frontend**; toda integração via `/api/store/*` (server-to-server). Revisar com cuidado mudanças em `vercel.json`, `api/*.js` e rotas públicas (`SECURITY.md`).
- **Não reintroduzir** vínculos operacionais com projetos externos sem ADR explícita (`CONTRIBUTING.md`).
- Preservar rotas canônicas e o contrato de `.env.example` em mudanças grandes.
- `.gitignore` ignora `*.txt` (exceto LICENSE/README) e `package-lock.json` — muitos `.txt` de scratch na raiz não estão versionados.
- Código na raiz é **legado**; mudança de produção vai em `SITE_RECUPERADO_TECH10/`.

## Convenções de contribuição
- `CONTRIBUTING.md`, `SECURITY.md` na raiz. Documentar mudanças estruturais em `docs/`.
- Sem `AGENTS.md`, sem `.cursorrules`, sem `CLAUDE.md`.
