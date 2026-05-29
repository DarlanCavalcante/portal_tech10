# RELEASE HOTFIX — CHECKOUT WHATSAPP APP-FIRST TENANT TECH10 — 2026-05-29

## Objetivo

Fazer o CTA de checkout assistido da Tech10 tentar abrir primeiro o app do WhatsApp (`whatsapp://`) e cair para o canal web se o app não estiver disponível.

## Contexto

- A frente anterior já corrigiu a mensagem assistida para incluir a seleção atual do carrinho.
- O comportamento ainda priorizava o fluxo web.
- Necessidade atual: preferir o app do WhatsApp quando existir, mantendo fallback automático para web.

## Escopo

- apenas `checkout.html`
- sem tocar portal, carrinho, API operacional ou checkout transacional
- sem alterar o conteúdo da mensagem além do que já foi corrigido nas frentes anteriores

## Regra funcional

1. no clique em `Falar com a Tech10`, recalcular a mensagem com o carrinho mais recente;
2. tentar abrir `whatsapp://send?...`;
3. se o app assumir o foco, cancelar o fallback;
4. se o app não abrir, cair automaticamente para o link web do WhatsApp.

## Evidência esperada

- ambiente sem app: abre fallback web com a mensagem preenchida;
- ambiente com app instalado: tenta abrir o app primeiro;
- nenhuma mensagem deve ser enviada automaticamente.
