# Hotfix Follow-up — Checkout assistido deve usar seleção persistida

Data: 29/05/2026

Branch:

- `codex/tech10-checkout-assisted-message-followup-20260529`

Motivação:

- após a publicação da mensagem dinâmica do checkout assistido, foi observado
  que ainda havia casos em que o CTA do WhatsApp abria o texto genérico;
- isso sugere um timing problem: o link podia ser clicado antes da seleção ser
  reidratada em memória na página, embora o carrinho já estivesse salvo.

Objetivo:

- fazer o CTA do checkout assistido usar a seleção persistida mais recente
  (`assisted_cart` / `cart id`) sempre que houver dados disponíveis;
- não depender apenas do carregamento assíncrono do resumo visual da página.

Critério de aceite:

1. Se houver carrinho assistido persistido, o link do WhatsApp leva o resumo.
2. Se não houver seleção persistida, o fallback genérico continua aceitável.
3. Escopo continua restrito ao checkout assistido e documentação.
