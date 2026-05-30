# RELEASE HOTFIX — CHECKOUT WHATSAPP APP HANDOFF TENANT TECH10 — 2026-05-29

## Objetivo

Investigar e provar, com evidência real, se o checkout da Tech10 consegue abrir o
app desktop do WhatsApp com o mesmo contexto do fluxo web, preservando o texto
com os itens selecionados e sem causar envio inesperado.

## Estado de partida

- O checkout estável em produção já funciona em modo seguro via WhatsApp Web.
- O fluxo oficial atual é abrir um rascunho revisável no WhatsApp Web com os
  itens do carrinho.
- A tentativa anterior de priorizar `whatsapp://` foi revertida porque o app
  desktop não se comportou de forma equivalente ao web.

## Escopo desta frente

1. avaliar handoff para o app desktop do WhatsApp;
2. testar comportamento real em macOS com navegador real;
3. comparar app desktop x WhatsApp Web com a mesma seleção de carrinho;
4. decidir com evidência se o app pode ser promovido a fluxo oficial;
5. manter a produção atual estável enquanto a decisão não for provada.

## Fora de escopo

- redesign do checkout;
- alteração do carrinho, catálogo ou portal;
- backend/API operacional;
- envio automático de mensagens;
- mudanças em `/portal`, `/carrinho` ou `/api/*`.

## Critério de aprovação

O app desktop só pode ser aprovado se, no fluxo real:

1. abrir a conversa correta;
2. preencher a mensagem com a seleção atual do carrinho;
3. preservar revisão manual antes do envio;
4. não disparar envio inesperado;
5. se comportar de forma consistente em mais de uma tentativa.

## Critério de rejeição

Se o app desktop:

- perder parte do texto;
- abrir sem os itens selecionados;
- depender de comportamento inconsistente do navegador;
- ou disparar envio/ação inesperada,

então o fluxo oficial deve continuar sendo o WhatsApp Web em modo draft seguro.

## Saída esperada

Esta frente deve terminar com uma decisão explícita:

- `app desktop aprovado`, ou
- `web draft mantido como fluxo oficial`.
