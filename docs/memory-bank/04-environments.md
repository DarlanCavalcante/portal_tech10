# 04 — Ambientes

## Produção
- **URL pública canônica**: `https://tech10.loja.tech10cloud.com/` (per `docs/DIAGNOSTICO_BASE_CANONICA_TENANT_TECH10_2026-05-13.md`).
- **Base publicada**: `SITE_RECUPERADO_TECH10/` (confirmado por fingerprint do HTML de produção + `server: Vercel`).

## Deploy
- **Plataforma**: Vercel.
- **Projeto Vercel (raiz)**: `tech10-portal` — `projectId: prj_JydCVoSW39Cfcnd1Lne0CAeo9FYI`, `orgId: team_gc5PSv0gAWtdcGUVK33GHLZV` (`.vercel/project.json`).
- **Projeto do runtime canônico**: `SITE_RECUPERADO_TECH10/.vercel/` existe; recomendação nos docs é criar projeto dedicado com **root dir `SITE_RECUPERADO_TECH10`** e anexar domínio. (a investigar: se já foi feito)
- Alternativas citadas no README raiz: Netlify (drop), GitHub Pages — para o site legado.

## CI/CD
- **Sem `.github/workflows`, sem `.forgejo`** no repo. Não há pipeline versionado.
- `scripts/bootstrap-smoke-gh-secrets.sh` (raiz) e `SMOKE_CI_VERCEL.md` sugerem smoke pós-deploy manual/externo. (a investigar: CI real)

## Backends externos (via env, valores default do `.env.example`)
- Catálogo/checkout: `TECH10_CATALOG_BACKEND_URL` / `TECH10_CHECKOUT_BACKEND_URL` (default de exemplo `https://catalogo.tech10cloud.internal`). Valor real de produção = "(a investigar)".
- ERP portal: `https://sistema.tech10cloud.com/portal`; status O.S.: `https://sistema.tech10cloud.com/status`; API core/telemetria: `https://core.tech10cloud.com`.

## Headers de segurança (`vercel.json`)
`Referrer-Policy`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Permissions-Policy` (camera/mic/geo desativados); `/api/*` com `Cache-Control: no-store`.
