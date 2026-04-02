#!/bin/bash
# Script para configurar os secrets do GitHub Actions rapidamente usando o GitHub CLI (gh)
# REQUISITO: Ter o gh cli instalado e autenticado (gh auth login)

set -e

# Validação se as variáveis estão preenchidas
if [ -z "$VERCEL_TOKEN" ] || [ -z "$VERCEL_ORG_ID" ] || [ -z "$VERCEL_PROJECT_ID_SMOKE" ]; then
  echo "Erro: Variáveis VERCEL_TOKEN, VERCEL_ORG_ID ou VERCEL_PROJECT_ID_SMOKE indisponíveis."
  echo "Exemplo de uso:"
  echo 'VERCEL_TOKEN="xxx" VERCEL_ORG_ID="yyy" VERCEL_PROJECT_ID_SMOKE="zzz" bash bootstrap-smoke-gh-secrets.sh'
  exit 1
fi

REPO_FLAG=""
if [ -n "$GITHUB_REPO" ]; then
  REPO_FLAG="--repo $GITHUB_REPO"
fi

echo "🚀 Configurando secrets para o repositório..."

echo "Configurando VERCEL_TOKEN..."
echo "$VERCEL_TOKEN" | gh secret set VERCEL_TOKEN $REPO_FLAG

echo "Configurando VERCEL_ORG_ID..."
echo "$VERCEL_ORG_ID" | gh secret set VERCEL_ORG_ID $REPO_FLAG

echo "Configurando VERCEL_PROJECT_ID..."
echo "$VERCEL_PROJECT_ID_SMOKE" | gh secret set VERCEL_PROJECT_ID $REPO_FLAG

echo "✅ Todos os secrets do GitHub Actions foram configurados com sucesso para o seu Smoke Deploy!"
echo "Agora vá para a aba 'Actions' e rode o seu workflow!"
