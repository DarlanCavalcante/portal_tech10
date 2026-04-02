# Deploy Smoke no Vercel via GitHub Actions - Em 2 Minutos 🚀

Este guia rápido permite que você configure um ambiente de "smoke test" isolado no Vercel (Production) em apenas 2 minutos. 

## Passo 1: Configurar Secrets no GitHub

Use o script de bootstrap para jogar de uma vez os 3 secrets necessários no repositório do GitHub.

Abra o terminal na raiz do projeto e execute. 

**Se estiver usando Git Bash ou Linux/Mac:**
```bash
GITHUB_REPO="seu-org/seu-repo" \
VERCEL_TOKEN="seu-token" \
VERCEL_ORG_ID="sua-org-id" \
VERCEL_PROJECT_ID_SMOKE="seu-project-id" \
bash scripts/bootstrap-smoke-gh-secrets.sh
```

**Se estiver usando o PowerShell (Windows):**
```powershell
$env:GITHUB_REPO="seu-org/seu-repo"
$env:VERCEL_TOKEN="seu-token"
$env:VERCEL_ORG_ID="sua-org-id"
$env:VERCEL_PROJECT_ID_SMOKE="seu-project-id"
bash scripts/bootstrap-smoke-gh-secrets.sh
```

*(Se você preferir adicionar manualmente, vá em "Settings" > "Secrets and variables" > "Actions" do seu repo no GitHub e adicione `VERCEL_TOKEN`, `VERCEL_ORG_ID`, e `VERCEL_PROJECT_ID`.)*

## Passo 2: Rodar o Workflow

1. Vá na aba **Actions** no repositório do GitHub.
2. No menu lateral, clique em **Vercel Smoke Deploy** (ou o nome do seu workflow respectivo).
3. Clique no botão **Run workflow** (no lado direito).
4. Aguarde a execução finalizar.

## Passo 3: Pegar a URL (URL Isolada de Produção)

1. Quando a Action for concluída (ficar verdinho), clique nela para ver os logs do "Deploy to Vercel".
2. Você encontrará a **Production URL** gerada. 
3. Acesse essa URL para validar o seu smoke test num ambiente idêntico de produção, totalmente funcional e isolado.

✅ Pronto! Em menos de 2 minutos seu ambiente smoke está rodando com GitHub Actions e Vercel.
