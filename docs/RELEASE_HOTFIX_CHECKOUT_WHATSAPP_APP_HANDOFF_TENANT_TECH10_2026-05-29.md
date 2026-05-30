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

## Checklist executado

- [x] abrir fluxo web com mensagem pré-preenchida
- [x] abrir fluxo via `whatsapp://send`
- [x] comparar conversa, conteúdo e revisão antes do envio
- [x] capturar evidência visual do web e do app desktop
- [x] decidir fluxo oficial com base no comportamento real

## Evidências

- web: `/Users/darlancavalcante/Documents/TECH/tmp-tech10-checkout-issue-124/tmp-handoff-evidence/web-draft.png`
- app via handoff: `/Users/darlancavalcante/Documents/TECH/tmp-tech10-checkout-issue-124/tmp-handoff-evidence/app-handoff.png`
- app em primeiro plano após o handoff: `/Users/darlancavalcante/Documents/TECH/tmp-tech10-checkout-issue-124/tmp-handoff-evidence/app-frontmost.png`

## Resultado dos testes

### WhatsApp Web

- preservou o comportamento de rascunho revisável;
- manteve a mensagem em edição antes do envio;
- carregou o texto com os itens da seleção.

### WhatsApp Desktop

- abriu a conversa correta;
- carregou o conteúdo da mensagem;
- **não preservou a revisão manual com segurança**;
- na evidência final, a mensagem de teste aparece na linha da conversa com
  timestamp e checkmarks, caracterizando envio real;
- o fluxo também gerou conflito de instância entre web e app, com aviso de
  "Outra instância do WhatsApp já está em execução".

## Decisão

**App desktop rejeitado como fluxo oficial do checkout.**

Motivo:

1. o app não se comportou de forma equivalente ao WhatsApp Web;
2. houve evidência de envio real no app durante o handoff;
3. o protocolo nativo não garante rascunho seguro revisável.

## Fluxo oficial mantido

O checkout da Tech10 deve continuar em:

- `WhatsApp Web`
- modo `draft seguro`
- com a seleção atual do carrinho pré-preenchida
- sem dependência do protocolo `whatsapp://`

## Próximo passo

Encerrar esta frente como investigação concluída e manter a produção no fluxo
web seguro já publicado.

## Status final

- frente encerrada: sim
- alteração de produção necessária: não
- decisão vigente em produção: `WhatsApp Web draft seguro`
