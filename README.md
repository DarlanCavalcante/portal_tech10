# 🖥️ Tech10 — Portal Institucional

<p align="center">
  <img src="imagem/LOGO_TECH10.png" alt="Tech10 Logo" width="200">
</p>

<p align="center">
  <strong>Assistência Técnica Premium em Santa Maria – RS</strong><br>
  Especialistas em Apple, Notebooks, Redes e Infraestrutura há mais de 20 anos.
</p>

<p align="center">
  <a href="https://github.com/DarlanCavalcante/portal_tech10/actions"><img src="https://img.shields.io/badge/build-passing-brightgreen?style=flat-square" alt="Build"></a>
  <a href="https://github.com/DarlanCavalcante/portal_tech10"><img src="https://img.shields.io/badge/version-2.0-blue?style=flat-square" alt="Version"></a>
  <a href="https://github.com/DarlanCavalcante/portal_tech10/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="License"></a>
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white" alt="HTML5">
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white" alt="CSS3">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black" alt="JavaScript">
  <img src="https://img.shields.io/badge/GSAP-88CE02?style=flat-square&logo=greensock&logoColor=black" alt="GSAP">
</p>

---

## 📋 Sobre o Projeto

Portal institucional da **Tech10 Informática e Tecnologia**, projetado com estética **dark mode premium** e experiência cinematográfica. O site serve como vitrine digital, gerador de leads via WhatsApp e ponto de contato principal para clientes da região de Santa Maria – RS.

### ✨ Destaques

- 🎬 **Hero com Carrossel de Vídeos** — Rodízio automático de 4 vídeos com transição fade
- 🏪 **Status Aberto/Fechado em Tempo Real** — Toggle automático baseado no horário
- 🔬 **Estética Laboratório** — Design dark mode com gradientes metálicos e partículas
- 📱 **Formulário → WhatsApp** — Contato direto via WhatsApp API
- 📸 **Galeria Rotativa** — Fotos reais da loja com efeito parallax
- 🗺️ **Instagram + Google Maps** — Embeds integrados na seção de contato
- ⚡ **Animações GSAP** — Scroll-triggered com ScrollTrigger
- 📊 **SEO Avançado** — Schema.org LocalBusiness + meta tags otimizadas

---

## 🏗️ Arquitetura

```
portal_tech10/
├── index.html              # Página principal (single page)
├── css/
│   └── style.css           # Design system completo (~1750 linhas)
├── js/
│   └── main.js             # Lógica de animações e interações (~580 linhas)
├── imagem/                 # Assets visuais
│   ├── LOGO_TECH10.png     # Logo principal
│   ├── video_hero.mp4      # Vídeo hero principal
│   ├── APPLE1.mp4          # Carrossel vídeo 2
│   ├── componentes_placa.mp4  # Carrossel vídeo 3
│   ├── pcs_antigos.mp4     # Carrossel vídeo 4
│   ├── loja-*.jpg          # Fotos da loja (galeria "Sobre")
│   └── modelo.jpg          # Imagem complementar
├── scripts/                # Scripts auxiliares
├── LOGOS_BACKUP/            # Backup de identidade visual
├── SMOKE_CHECKLIST_2MIN.md # Checklist de validação rápida
├── SMOKE_CI_VERCEL.md      # Guia de deploy Vercel
└── LICENSE                 # Licença MIT
```

---

## 🎨 Design System

| Token | Valor | Uso |
|---|---|---|
| `--bg-primary` | `#0a0e17` | Fundo principal |
| `--bg-card` | `rgba(15,20,35,0.8)` | Cards com glassmorphism |
| `--blue-primary` | `#3b82f6` | Cor de destaque |
| `--gradient-main` | `#3b82f6 → #06b6d4` | Gradiente principal |
| `--font-display` | `Outfit` | Títulos e display |
| `--font-body` | `Inter` | Corpo de texto |

---

## 🛠️ Stack Técnica

| Tecnologia | Versão | Uso |
|---|---|---|
| **HTML5** | Semântico | Estrutura e SEO |
| **CSS3** | Vanilla | Design system, grid, animações |
| **JavaScript** | ES6+ | Interatividade e lógica |
| **GSAP** | 3.x | Animações scroll-triggered |
| **ScrollTrigger** | Plugin GSAP | Trigger de animações por scroll |
| **Font Awesome** | 6.x | Ícones vetoriais |
| **Google Fonts** | Outfit + Inter | Tipografia premium |

---

## 📄 Seções da Página

| # | Seção | Descrição |
|---|---|---|
| 1 | **Hero** | Carrossel de 4 vídeos + CTA principal |
| 2 | **Serviços** | 6 cards com ícones (Apple, Mac, Android, PC, Redes, Dev) |
| 3 | **Como Funciona** | 4 steps do processo de atendimento |
| 4 | **Planos** | 3 tiers (Pessoal, Profissional, Empresarial) |
| 5 | **Antes & Depois** | Slider interativo de resultados |
| 6 | **Depoimentos** | Carrossel de reviews de clientes |
| 7 | **Dicas** | Blog cards com conteúdo educacional |
| 8 | **Sobre** | Galeria rotativa de fotos + história da empresa |
| 9 | **FAQ** | Perguntas frequentes com accordion |
| 10 | **Contato** | Grid 3 colunas: Info + Form + Instagram/Maps |
| 11 | **CTA Final** | Chamada final para ação |
| 12 | **Footer** | Links, redes sociais e créditos |

---

## 🚀 Como Rodar Localmente

```bash
# 1. Clone o repositório
git clone https://github.com/DarlanCavalcante/portal_tech10.git
cd portal_tech10

# 2. Instale e rode o servidor local
npx live-server .

# 3. Acesse no navegador
# http://127.0.0.1:8080
```

> **Pré-requisitos:** Node.js 18+ (apenas para o live-server)

---

## 📦 Deploy

### Vercel (Recomendado)

```bash
# Via CLI
npx vercel --prod
```

### Netlify

Arraste a pasta do projeto para [app.netlify.com/drop](https://app.netlify.com/drop).

### GitHub Pages

1. Vá em **Settings → Pages**
2. Source: `Deploy from a branch`
3. Branch: `main` / `/ (root)`
4. Save

---

## 🔧 Funcionalidades Técnicas

### Status Aberto/Fechado em Tempo Real
```javascript
// Calcula automaticamente baseado no horário atual
// Seg-Sex: 9h às 18h | Sáb: 9h às 13h
// Atualiza a cada 30 segundos
```

### Formulário → WhatsApp
```javascript
// Monta a mensagem com todos os campos e redireciona
// para wa.me/5555974001960 com a mensagem pré-preenchida
```

### Carrossel de Vídeos Hero
```javascript
// 4 vídeos em loop com fade transition a cada 6 segundos
// video_hero.mp4 → APPLE1.mp4 → componentes_placa.mp4 → pcs_antigos.mp4
```

---

## 🗺️ SEO & Local Business

O site implementa **Schema.org LocalBusiness** com:
- Nome, endereço e telefone estruturados
- Coordenadas GPS (latitude/longitude)
- Faixa de preço e horários de funcionamento
- Meta tags otimizadas para busca local

---

## 📊 Performance

| Métrica | Objetivo |
|---|---|
| First Contentful Paint | < 1.5s |
| Time to Interactive | < 3.0s |
| Cumulative Layout Shift | < 0.1 |
| Largest Contentful Paint | < 2.5s |

---

## 🤝 Integração Futura

Este portal está preparado para integração com o **ERP SaaS da Tech10**:
- 📋 Status de Ordem de Serviço em tempo real
- 💬 Agente AI via WhatsApp (consulta de OS)
- 📊 Dashboard de métricas para o proprietário
- 🔐 Sistema de autenticação para área do cliente

---

## 📝 Licença

Distribuído sob a licença MIT. Veja [LICENSE](LICENSE) para mais informações.

---

## 👨‍💻 Autor

**Darlan Cavalcante**  
Tech10 Informática e Tecnologia  
📍 R. Acampamento, 255 – Galeria Village Center, Loja 110 – Santa Maria/RS  
📱 (55) 97400-1960  
📧 tech10.infor@gmail.com  
🔗 [@tech10info](https://instagram.com/tech10info)

---

<p align="center">
  Feito com 💙 por <strong>Tech10</strong> — Santa Maria, RS
</p>
