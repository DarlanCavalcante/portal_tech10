# Release Hotfix — Checkout branco Tech10

Data-base: `2026-05-29`

Repositorio: `portal_tech10`

Issue: `#124` - `Investigar tela branca no /checkout em producao e alias`

Branch de trabalho: `codex/tech10-checkout-white-screen-20260529`

Base de abertura: `main` no commit `1ceab6282d6a27c26c6a48b812a17f273036089b`

## Objetivo

Investigar e corrigir a tela branca em `/checkout` no tenant publico da
Tech10, sem misturar esse trabalho com a vitrine ja publicada e sem tocar
portal, API operacional ou fluxos fora do checkout.

## Contexto confirmado na abertura

- a vitrine publica foi consolidada e mergeada pela PR `#123`
- o checkout branco ja existia antes desse merge
- `portal/index.html`, `carrinho.html`, `checkout.html` e `api/*` ficaram fora
  do diff da PR `#123`
- o problema foi isolado corretamente na issue `#124`

## Escopo desta frente

- diagnosticar por que `/checkout` abre em branco
- confirmar comportamento no alias e no dominio oficial
- revisar diferenca entre `/checkout` e `/checkout.html`
- revisar dependencias de `localStorage`, `sessionStorage` e carrinho
- revisar assets JS/CSS, erros de runtime e regras de rewrite
- corrigir somente o necessario para o checkout abrir sem tela branca

## Fora do escopo

- home
- `/loja`
- SEO local
- portal do cliente
- carrinho, exceto se for dependencia minima para o checkout funcionar
- integracoes de backend e API operacional
- redesign amplo
- novas features de vitrine

## Criterios de aceite

- `/checkout` abre sem tela branca
- se nao houver carrinho, o checkout mostra estado vazio ou orientacao segura
- se houver carrinho valido, o checkout mostra o fluxo esperado
- console sem erro critico
- nenhuma alteracao colateral em `/`, `/loja`, `/portal` ou `/carrinho`

## Checklist inicial da frente

1. reproduzir no dominio oficial e no alias
2. capturar console e network
3. revisar `checkout.html` e scripts associados
4. validar se a falha depende de acesso direto versus navegacao pelo carrinho
5. corrigir em branch isolada
6. publicar preview antes de qualquer merge

## Evidencia de abertura

- branch criada a partir de `main`: `codex/tech10-checkout-white-screen-20260529`
- worktree limpo e isolado:
  - `/Users/darlancavalcante/Documents/TECH/tmp-tech10-checkout-issue-124`
- issue de referencia:
  - `https://github.com/DarlanCavalcante/portal_tech10/issues/124`
