# TECH10 Logo — Backup do Componente Web

## O que é
Componente puro HTML/CSS da Logo **"TECH10"** no estilo **Metálico Vetorial**, com o `0` funcionando como um Toggle Switch (LED Verde = Aberto / Vermelho = Fechado).

## Arquivos
| Arquivo | Descrição |
|---------|-----------|
| `index.html` | HTML da logo isolada nos 2 estados (aberto e fechado) |
| `style.css` | CSS completo do componente (sem dependências externas) |

## Como usar em outro projeto

### 1. Importar a fonte Google
```html
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700&display=swap" rel="stylesheet">
```

### 2. Copiar o HTML da logo
```html
<div class="logo-text">
  TECH<span class="logo-1">1</span>
  <span class="logo-toggle-wrap">
    <span class="toggle-pill open">
      <span class="toggle-dot"></span>
    </span>
  </span>
</div>
```

### 3. Controlar via JS
```js
// Abrir (verde)
pill.classList.remove('closed');
pill.classList.add('open');

// Fechar (vermelho)
pill.classList.remove('open');
pill.classList.add('closed');
```

### 4. Ajustar tamanho
Altere `font-size` em `.logo-text` para escalar proporcionalmente:
- `5rem` → Tamanho grande (landing page)
- `1.7rem` → Tamanho navbar
- `3rem` → Tamanho loader

---
*Backup gerado em 03/04/2026 — Tech10 Informática e Tecnologia*
