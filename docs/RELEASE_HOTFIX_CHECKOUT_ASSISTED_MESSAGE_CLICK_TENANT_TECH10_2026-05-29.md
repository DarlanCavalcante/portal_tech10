# Release Hotfix — Checkout Assistido Tech10 (Click-time cart message)

Data: 2026-05-29
Branch: codex/tech10-checkout-assisted-message-click-20260529
Issue relacionada: #124

## Objetivo
Corrigir o caso em que o checkout assistido abria o WhatsApp com mensagem genérica mesmo com itens já presentes na seleção assistida.

## Causa raiz
O checkout sincronizava os links de suporte cedo demais. No fluxo real da loja, o carrinho podia ser carregado/normalizado depois, então o clique ainda usava um href genérico.

## Correção
- recalcular a mensagem de suporte no momento do clique;
- ler o carrinho atual em memória e, como fallback, o carrinho persistido;
- abrir o WhatsApp com a seleção atual, subtotal e contexto do item.

## Fora do escopo
- portal
- carrinho operacional além do vínculo com checkout
- API operacional
- layout novo
