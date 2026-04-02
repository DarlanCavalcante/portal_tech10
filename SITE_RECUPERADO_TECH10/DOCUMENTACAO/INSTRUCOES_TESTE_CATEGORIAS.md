# 🧪 Instruções de Teste - Páginas de Categorias

**Data:** 15/01/2025  
**Status:** ✅ **PRONTO PARA TESTE**

---

## 🧹 Limpar Cache

### Chrome/Edge:
1. Pressione `Ctrl + Shift + Delete`
2. Selecione "Imagens e arquivos em cache"
3. Período: "Última hora" ou "Todo o período"
4. Clique em "Limpar dados"

### OU (Mais Rápido):
- Pressione `Ctrl + F5` (recarregar forçado)
- Ou `Ctrl + Shift + R`

---

## 🌐 Acessar o Site

**URL:** http://localhost:5500

---

## 📋 Checklist de Teste

### 1. Home Page
- [ ] Página carrega corretamente
- [ ] Vídeo de fundo aparece
- [ ] Seção "Categorias em Destaque" visível
- [ ] 6 cards de categorias aparecem

### 2. Navegação por Categorias
- [ ] Clique em "Especialista Apple" → Abre `categorias/apple.html`
- [ ] Clique em "Samsung & Android" → Abre `categorias/android.html`
- [ ] Clique em "Full Stack" → Abre `categorias/desenvolvimento.html`
- [ ] Clique em "Notebooks" → Abre `categorias/notebooks.html`
- [ ] Clique em "Smartphones" → Abre `categorias/smartphones.html`
- [ ] Clique em "Assistência" → Abre `categorias/assistencia.html`

### 3. Página Apple (`categorias/apple.html`)
- [ ] Hero section com cor laranja
- [ ] Ícone 🍎 aparece
- [ ] Serviços listados (iPhone, iPad, MacBook, iMac)
- [ ] Seção "Por Que Escolher Tech10"
- [ ] FAQ aparece
- [ ] Botão WhatsApp funciona
- [ ] Footer com links para outras categorias

### 4. Página Android (`categorias/android.html`)
- [ ] Hero section com cor verde
- [ ] Ícone 🤖 aparece
- [ ] Serviços listados (Samsung, Motorola, etc.)
- [ ] Botão WhatsApp funciona

### 5. Página Desenvolvimento (`categorias/desenvolvimento.html`)
- [ ] Hero section com cor azul
- [ ] Ícone 💻 aparece
- [ ] Tecnologias listadas (React, Next.js, etc.)
- [ ] Botão WhatsApp funciona

### 6. Página Notebooks (`categorias/notebooks.html`)
- [ ] Hero section com cor roxa
- [ ] Ícone 💻 aparece
- [ ] Serviços listados
- [ ] Botão WhatsApp funciona

### 7. Página Smartphones (`categorias/smartphones.html`)
- [ ] Hero section com cor azul
- [ ] Ícone 📱 aparece
- [ ] Serviços listados
- [ ] Botão WhatsApp funciona

### 8. Página Assistência (`categorias/assistencia.html`)
- [ ] Hero section com cor cinza escuro
- [ ] Ícone 🔧 aparece
- [ ] Serviços listados
- [ ] Botão WhatsApp funciona

### 9. Responsividade
- [ ] Testar em mobile (F12 → Device Toolbar)
- [ ] Cards empilham corretamente
- [ ] Textos legíveis
- [ ] Botões acessíveis

### 10. Links e Navegação
- [ ] Links do footer funcionam
- [ ] Botão "Voltar ao Topo" aparece ao rolar
- [ ] Links para home funcionam
- [ ] Navegação entre categorias funciona

---

## 🐛 Problemas Comuns

### Página não carrega:
1. Verificar se servidor está rodando: `http://localhost:5500`
2. Limpar cache do navegador (Ctrl + F5)
3. Verificar console do navegador (F12)

### Links não funcionam:
1. Verificar caminhos relativos (`../` para voltar)
2. Verificar se arquivos existem em `categorias/`
3. Verificar console do navegador para erros 404

### Estilos não aparecem:
1. Limpar cache (Ctrl + F5)
2. Verificar se `css/styles.css` está carregando
3. Verificar console do navegador

---

## ✅ Resultado Esperado

Todas as 6 páginas devem:
- ✅ Carregar corretamente
- ✅ Ter design consistente
- ✅ Ter conteúdo específico
- ✅ Ter botões WhatsApp funcionando
- ✅ Ser responsivas
- ✅ Ter navegação funcionando

---

## 📝 Notas

- **Cores por categoria:** Cada página tem sua cor única no hero
- **Conteúdo específico:** Cada página tem serviços e FAQ específicos
- **SEO:** Todas as páginas têm meta description otimizada
- **WhatsApp:** Todos os botões abrem WhatsApp com mensagem pré-formatada

---

**Última atualização:** 15/01/2025  
**Status:** ✅ **PRONTO PARA TESTE**
