# RELEASE HOTFIX — CHECKOUT WHATSAPP SAFE DRAFT TENANT TECH10 — 2026-05-29

## Objetivo

Corrigir o CTA do checkout assistido para sempre abrir um rascunho seguro com a seleção atual, sem depender do protocolo do app do WhatsApp para desktop.

## Contexto

- A tentativa anterior de priorizar `whatsapp://` no desktop não ficou equivalente ao fluxo do WhatsApp Web.
- No macOS, o app pode consumir o link de modo diferente do navegador, o que quebra a previsibilidade do rascunho.
- Para o checkout da Tech10, o comportamento correto é: abrir um rascunho revisável com os itens selecionados e nunca disparar envio automaticamente.

## Regra funcional

1. recalcular a mensagem no clique usando o carrinho mais recente;
2. abrir o canal web do WhatsApp com o texto preenchido;
3. preservar revisão manual antes do envio;
4. não depender do protocolo nativo do app desktop.
