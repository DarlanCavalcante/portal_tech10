# Hotfix — Checkout assistido deve enviar a seleção do cliente

Data: 29/05/2026

Branch:

- `codex/tech10-checkout-assisted-message-20260529`

Objetivo:

- corrigir a experiência do checkout assistido da Tech10 para que os links de
  WhatsApp incluam o resumo do que o cliente selecionou na loja;
- manter o escopo restrito ao checkout/vitrine pública;
- não tocar portal operacional, carrinho operacional, API de produção ou
  qualquer integração interna do ERP.

Problema observado:

- o CTA de atendimento do checkout abria o WhatsApp com a mensagem estática:
  `Olá! Vim pela loja da Tech10 e quero finalizar meu pedido com atendimento assistido.`
- a mensagem não carregava os itens selecionados pelo cliente;
- isso atrapalhava o atendimento manual, porque a equipe precisava perguntar
  novamente o que foi escolhido.

Regra desta frente:

- quando existir seleção ativa no checkout, os links de atendimento devem levar
  um resumo do carrinho;
- o resumo precisa incluir pelo menos:
  - nome do produto;
  - quantidade;
  - preço unitário estimado;
  - subtotal estimado;
  - marca/SKU quando disponível;
- quando não existir seleção ativa, o comportamento genérico continua aceitável;
- o submit final do checkout assistido continua podendo enviar a mensagem mais
  completa com dados do cliente, entrega e pagamento.

Critérios de aceite:

1. `/checkout` continua visível e sem tela branca.
2. O layout corrigido do checkout não regride.
3. O botão/link `Falar com a Tech10` no checkout inclui a seleção atual quando
   houver itens no carrinho.
4. O fluxo final de `Enviar para atendimento` continua funcionando.
5. O escopo do diff fica restrito a checkout e documentação.
