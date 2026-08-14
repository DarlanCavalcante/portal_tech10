# 07 — Active Context

_Atualizado: 2026-08-14_

## Estado geral
Projeto **dormente desde 2026-05-20** (data do último commit). Sem atividade de git posterior. Sem CI versionado.

## Git
- **Branch atual**: `main`.
- **Remote**: `origin` → `https://github.com/DarlanCavalcante/portal_tech10.git`.
- **Último commit**: `d85d4cd` — `fix(runtime): restore branded store header` — 2026-05-20 19:34 -0300.
- Commits anteriores recentes: `fix(runtime): clamp assisted cart to live stock` (2026-05-20); vários merges via branches `codex/*` até 2026-05-12 (banner assistido da loja, spotlight da home, títulos dinâmicos).

## Foco da última fase (segundo commits + docs)
Refino do **runtime canônico da loja/portal** em `SITE_RECUPERADO_TECH10/`: header da loja com marca, carrinho assistido travado ao estoque real, conversão da home. Direção planejada seguinte: **telemetria do funil do portal** (ver [[05-portal-cliente-frentes]]).

## O que um novo agente deve saber primeiro
- Mudanças de produção vão em `SITE_RECUPERADO_TECH10/` (base canônica), **não** na raiz (legado).
- Validar com `npm run validate:runtime` e `npm run smoke:runtime` dentro dessa pasta.
- Nunca expor tokens no frontend; integrações via `/api/store/*`.

Ver [[08-progress]] e [[09-decisions]].
