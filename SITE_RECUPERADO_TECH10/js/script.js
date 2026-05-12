// Estado global da aplicação
function resolveLegacyStoreApiBaseUrl() {
    if (window.API_CONFIG && window.API_CONFIG.STORE_API) {
        return window.API_CONFIG.STORE_API;
    }
    return `${window.location.origin}/api/store`;
}

const state = {
    cart: [],
    products: [],
    filteredProducts: [],
    currentFilter: 'all',
    dicas: [],
    currentDicaPage: 0,
    dicasPerPage: 3,
    currentScreenSize: 'desktop',
    apiBaseUrl: resolveLegacyStoreApiBaseUrl()
};

// Mapeamento de categorias do banco para slugs do frontend
const categoryMapping = {
    'Notebooks': 'notebook',
    'Computadores': 'desktop',
    'Desktops': 'desktop',
    'Smartphones': 'smartphone',
    'Tablets': 'acessorio',
    'Periféricos': 'acessorio',
    'Acessórios': 'acessorio'
};

// Quando o storefront standalone está ativo, load-products.js já definiu loadProductsFromAPI; não sobrescrever.
if (!(window.API_CONFIG && typeof window.loadProductsFromAPI === 'function')) {
// Função para carregar produtos da API quando a camada canônica não assumir a listagem
async function loadProductsFromAPI() {
    try {
        console.log('🔄 Carregando produtos da API...');
        const response = await fetch(`${state.apiBaseUrl}/products?limit=100&active=1`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        // A API retorna { products: [], pagination: {} }
        const apiProducts = data.products || data;
        console.log('✅ Produtos carregados:', apiProducts.length);
        
        // Converter formato da API para o formato do frontend
        return apiProducts.map(product => {
            const categoryName = product.category_name || 'outros';
            const categorySlug = categoryMapping[categoryName] || categoryName.toLowerCase();
            
            return {
                id: product.id,
                name: product.name,
                description: product.short_description || product.description || '',
                price: parseFloat(product.sale_price || product.price),
                oldPrice: product.sale_price ? parseFloat(product.price) : null,
                category: categorySlug,
                categoryName: categoryName,
                image: product.images && product.images.length > 0 ? product.images[0] : 'placeholder.jpg',
                badge: product.is_featured ? 'DESTAQUE' : null,
                inStock: product.stock > 0,
                stock: product.stock,
                features: product.features || []
            };
        });
    } catch (error) {
        console.error('❌ Erro ao carregar produtos da API:', error);
        // Retornar array vazio em caso de erro - usar dados estáticos como fallback
        return [];
    }
}
}

async function loadLocalSampleProducts() {
    try {
        const response = await fetch('/dev/local-sample-products.json', { cache: 'no-store' });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('❌ Erro ao carregar catálogo local de exemplo:', error);
        return [];
    }
}

// Dados das Dicas do Especialista
const dicasData = [
    {
        id: 1,
        title: 'Como Evitar Superaquecimento do Notebook',
        description: 'Dicas essenciais para manter seu notebook funcionando na temperatura ideal e prolongar sua vida útil.',
        image: 'imagem/propaganda loja/dica-especialista-evitar-aquecimento-notebook.jpeg',
        content: 'O superaquecimento é um dos principais problemas que afetam notebooks. Para evitar este problema: 1) Mantenha as entradas de ar sempre limpas, 2) Use o notebook em superfícies rígidas e planas, 3) Evite obstruir as saídas de ventilação, 4) Faça limpeza regular do sistema de refrigeração.',
        tags: ['Notebook', 'Manutenção', 'Temperatura'],
        difficulty: 2,
        readTime: '3 min',
        category: 'Manutenção'
    },
    {
        id: 2,
        title: 'Importância do Carregador Original',
        description: 'Entenda por que usar o carregador original é fundamental para a segurança e durabilidade do seu equipamento.',
        image: 'imagem/propaganda loja/dica-especialista-carregador-original.jpeg',
        content: 'Usar carregadores não originais pode causar sérios danos ao seu equipamento. Carregadores falsificados não possuem os mesmos controles de qualidade e podem: 1) Fornecer voltagem incorreta, 2) Causar superaquecimento, 3) Danificar a bateria permanentemente, 4) Representar risco de incêndio.',
        tags: ['Segurança', 'Carregador', 'Bateria'],
        difficulty: 1,
        readTime: '2 min',
        category: 'Segurança'
    },
    {
        id: 3,
        title: 'Ventilação Adequada para Equipamentos',
        description: 'Como garantir ventilação adequada para seus equipamentos eletrônicos funcionarem perfeitamente.',
        image: 'imagem/propaganda loja/dica-ventilacaoadequada.jpeg',
        content: 'A ventilação adequada é crucial para o bom funcionamento dos equipamentos eletrônicos. Siga estas dicas: 1) Deixe pelo menos 15cm de espaço livre ao redor do equipamento, 2) Evite locais fechados sem circulação de ar, 3) Use suportes que elevem notebooks da superfície, 4) Considere ventiladores externos em ambientes muito quentes.',
        tags: ['Ventilação', 'Cuidados', 'Performance'],
        difficulty: 1,
        readTime: '3 min',
        category: 'Cuidados'
    },
    {
        id: 4,
        title: 'Limpeza Regular e Manutenção Preventiva',
        description: 'A importância da limpeza regular para manter seus equipamentos sempre funcionando como novos.',
        image: 'imagem/propaganda loja/dica-limpeza-regular-manutencao.jpeg',
        content: 'A manutenção preventiva é a chave para a longevidade dos equipamentos: 1) Faça limpeza externa semanalmente com pano seco, 2) Limpeza interna profissional a cada 6 meses, 3) Mantenha software sempre atualizado, 4) Faça backup regular dos dados importantes, 5) Monitore a temperatura do sistema regularmente.',
        tags: ['Limpeza', 'Manutenção', 'Preventiva'],
        difficulty: 2,
        readTime: '4 min',
        category: 'Manutenção'
    },
    {
        id: 5,
        title: 'Cuidados com Temperatura Ambiente',
        description: 'Como a temperatura do ambiente afeta seus equipamentos e o que fazer para protegê-los.',
        image: 'imagem/propaganda loja/dica-deolhona temperatura.jpeg',
        content: 'A temperatura ambiente tem impacto direto na performance e vida útil dos equipamentos: 1) Mantenha a temperatura entre 18°C e 24°C, 2) Evite exposição direta ao sol, 3) Use ar condicionado em dias muito quentes, 4) Monitore sinais de superaquecimento como lentidão ou desligamentos inesperados.',
        tags: ['Temperatura', 'Ambiente', 'Cuidados'],
        difficulty: 1,
        readTime: '2 min',
        category: 'Ambiente'
    },
    {
        id: 6,
        title: 'Evite Ambientes Quentes',
        description: 'Por que você deve evitar usar equipamentos eletrônicos em locais com temperatura elevada.',
        image: 'imagem/propaganda loja/dica-eviteambientesquentes.jpeg',
        content: 'Ambientes quentes são inimigos dos equipamentos eletrônicos: 1) Temperatura alta reduz performance do processador, 2) Acelera degradação da bateria, 3) Pode causar travamentos e instabilidade, 4) Em casos extremos, pode danificar componentes permanentemente. Sempre prefira ambientes climatizados.',
        tags: ['Temperatura', 'Performance', 'Segurança'],
        difficulty: 1,
        readTime: '2 min',
        category: 'Ambiente'
    },
    {
        id: 7,
        title: 'O que Fazer Quando PC/Notebook Molha',
        description: 'Procedimentos de emergência para quando seu equipamento entra em contato com líquidos.',
        image: 'imagem/propaganda loja/dica-pc-notebook-molhou.jpeg',
        content: 'Se seu equipamento molhou, aja rapidamente: 1) DESLIGUE IMEDIATAMENTE o equipamento, 2) Remova a bateria se possível, 3) Seque externamente com pano absorvente, 4) Deixe secar em local arejado por pelo menos 48h, 5) NÃO LIGUE antes de ter certeza que está completamente seco, 6) Procure assistência técnica especializada.',
        tags: ['Emergência', 'Líquidos', 'Primeiros Socorros'],
        difficulty: 3,
        readTime: '4 min',
        category: 'Emergência'
    },
    {
        id: 8,
        title: 'Proteja Seu Equipamento',
        description: 'Medidas essenciais de proteção para manter seus equipamentos seguros e funcionando por mais tempo.',
        image: 'imagem/propaganda loja/dica-proteja-seubem.jpeg',
        content: 'Proteger seus equipamentos é investir no futuro: 1) Use capas e cases de qualidade, 2) Instale antivírus confiável, 3) Faça backups regulares, 4) Evite downloads de fontes duvidosas, 5) Mantenha sistema operacional atualizado, 6) Use estabilizadores ou nobreaks, 7) Transporte com cuidado.',
        tags: ['Proteção', 'Segurança', 'Cuidados'],
        difficulty: 2,
        readTime: '5 min',
        category: 'Proteção'
    },
    {
        id: 9,
        title: 'Quando Levar para Assistência Técnica',
        description: 'Saiba identificar os sinais de que é hora de procurar ajuda profissional especializada.',
        image: 'imagem/propaganda loja/dica-leveparassistencia.jpeg',
        content: 'Procure assistência técnica quando: 1) Equipamento apresenta travamentos frequentes, 2) Superaquecimento constante, 3) Ruídos estranhos no funcionamento, 4) Tela com problemas de imagem, 5) Bateria não carrega ou descarrega muito rápido, 6) Lentidão extrema mesmo após limpeza de software, 7) Qualquer dano físico visível.',
        tags: ['Assistência', 'Diagnóstico', 'Profissional'],
        difficulty: 1,
        readTime: '3 min',
        category: 'Assistência'
    }
];

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

async function initializeApp() {
    // O storefront canônico gerencia os produtos; este arquivo só entra como contingência.
    console.log('🔄 Inicializando app (produtos serão carregados pelo storefront canônico)...');
    
    // Limpar state.products para evitar conflitos
    state.products = [];
    state.filteredProducts = [];
    
    // Fallback: se load-products.js nao renderizou via API, tentar aqui
    setTimeout(async function() {
      var produtosGrid = document.getElementById('produtosGrid');
      var hasCards = produtosGrid && (produtosGrid.querySelector('.lp-card') || produtosGrid.querySelector('.product-card'));
      if (hasCards) return;
      var isLocalRuntime = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

      try {
        var hasCanonicalStorefrontLoader =
          typeof window.loadProductsFromAPI === 'function' &&
          typeof window.renderProductsFromAPI === 'function';

        if (hasCanonicalStorefrontLoader) {
          var canonicalProducts = await window.loadProductsFromAPI();
          window.renderProductsFromAPI(canonicalProducts, 'produtosGrid');
          return;
        }

        var apiProducts = typeof loadProductsFromAPI === 'function' ? await loadProductsFromAPI() : [];
        if (apiProducts.length > 0) {
          state.products = apiProducts;
          state.filteredProducts = state.products;
          renderProducts();
          return;
        }

        if (isLocalRuntime) {
          var localSampleProducts = await loadLocalSampleProducts();
          if (localSampleProducts.length > 0) {
            state.products = localSampleProducts;
            state.filteredProducts = localSampleProducts;
            renderProducts();
          }
        }
      } catch (e) {
        if (isLocalRuntime) {
          var localFallbackProducts = await loadLocalSampleProducts();
          if (localFallbackProducts.length > 0) {
            state.products = localFallbackProducts;
            state.filteredProducts = localFallbackProducts;
            renderProducts();
          }
        } else if (
          typeof window.renderProductsFromAPI === 'function'
          && typeof window.loadProductsFromAPI === 'function'
        ) {
          window.renderProductsFromAPI([], 'produtosGrid');
        }
      }
    }, 800);
    
    state.dicas = dicasData;
    
    setupResponsiveDicas();
    setupEventListeners();
    
    // Não renderizar produtos aqui - deixar o storefront canônico fazer isso.
    // Se a camada principal falhar, o fallback acima assume a renderização.
    renderDicas();
    // O contador agora usa o helper global do carrinho ativo do storefront.
    function syncStorefrontCartCount() {
        var cart = typeof window.getActiveStorefrontCart === 'function'
            ? window.getActiveStorefrontCart()
            : (window.storefrontCart || null);
        if (cart && typeof cart.updateCartCount === 'function') {
            cart.updateCartCount().catch(err => console.error('Erro ao atualizar contador:', err));
        }
    }
    syncStorefrontCartCount();
    setupScrollEffects();
    setupMobileMenu();
    setupHeroVideo();
    initializeGallery();
    initializeBackToTop();
    
    // Marcar como carregado para prevenir piscar
    document.body.classList.add('loaded');
}

// Função para configurar dicas responsivas
function setupResponsiveDicas() {
    function updateDicasPerPage() {
        const screenWidth = window.innerWidth;
        let newDicasPerPage;
        let newScreenSize;
        
        if (screenWidth <= 480) {
            // Mobile pequeno - 1 dica
            newDicasPerPage = 1;
            newScreenSize = 'mobile-small';
        } else if (screenWidth <= 768) {
            // Mobile/Tablet - 2 dicas
            newDicasPerPage = 2;
            newScreenSize = 'mobile';
        } else if (screenWidth <= 1024) {
            // Tablet grande - 2 dicas
            newDicasPerPage = 2;
            newScreenSize = 'tablet';
        } else if (screenWidth <= 1366) {
            // Desktop pequeno - 3 dicas
            newDicasPerPage = 3;
            newScreenSize = 'desktop';
        } else {
            // Desktop grande - 3 dicas
            newDicasPerPage = 3;
            newScreenSize = 'desktop-large';
        }
        
        // Só atualiza se mudou
        if (newDicasPerPage !== state.dicasPerPage || newScreenSize !== state.currentScreenSize) {
            state.dicasPerPage = newDicasPerPage;
            state.currentScreenSize = newScreenSize;
            
            // Ajustar página atual para não ultrapassar os limites
            const totalPages = Math.ceil(state.dicas.length / state.dicasPerPage);
            if (state.currentDicaPage >= totalPages) {
                state.currentDicaPage = Math.max(0, totalPages - 1);
            }
            
            // Re-renderizar dicas se já foram carregadas
            if (state.dicas.length > 0) {
                renderDicas();
            }
        }
    }
    
    // Executar na inicialização
    updateDicasPerPage();
    
    // Escutar mudanças na tela
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(updateDicasPerPage, 250);
    });
}

// Event Listeners
function setupEventListeners() {
    // Filtros de produtos
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', handleFilterClick);
    });
    
    // Busca
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }
    
    // Carrinho - sempre usar a rota canônica do storefront
    const cartIcon = document.getElementById('cartIcon');
    if (cartIcon) {
        const explicitSupportMode = cartIcon.getAttribute('data-cart-link-mode') === 'support';
        const href = cartIcon.getAttribute('href') || '';
        const isWhatsappSupport = /wa\.me\//i.test(href);

        if (explicitSupportMode || isWhatsappSupport) {
            return;
        }

        // Remover qualquer handler anterior
        cartIcon.onclick = null;
        // Adicionar nosso handler que sempre redireciona para a rota canônica do carrinho
        cartIcon.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            window.location.href = '/carrinho';
        });
        // Também configurar onclick diretamente como fallback
        cartIcon.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            window.location.href = '/carrinho';
        };
    }
    
    // Carrinho agora usa o storefront canônico - removido handler do modal antigo
    
    // Formulário de contato
    const contatoForm = document.getElementById('contatoForm');
    if (contatoForm) {
        contatoForm.addEventListener('submit', handleContactForm);
    }
    
    // Navegação das dicas
    const prevDica = document.getElementById('prevDica');
    const nextDica = document.getElementById('nextDica');
    if (prevDica) prevDica.addEventListener('click', () => changeDicaPage(-1));
    if (nextDica) nextDica.addEventListener('click', () => changeDicaPage(1));
    
    // Navegação suave
    const navLinks = document.querySelectorAll('.nav-link, .btn');
    navLinks.forEach(link => {
        link.addEventListener('click', handleSmoothScroll);
    });
    
    // Modal antigo do carrinho removido - agora usa a rota canônica /carrinho
}

// Manipulação de produtos
function renderProducts() {
    const grid = document.getElementById('produtosGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    state.filteredProducts.forEach(product => {
        const productCard = createProductCard(product);
        grid.appendChild(productCard);
    });
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'produto-card';
    card.dataset.category = product.category;
    const runtime = window.__tech10_runtime_config || {};
    const commerce = runtime.commerce || {};
    const capabilities = commerce.capabilities || {};
    const quoteOnly = capabilities.quoteOnly === true || capabilities.cart === false || commerce.checkoutMode === 'quote_only';
    
    const badgeHtml = product.badge ? 
        `<div class="produto-badge">${product.badge}</div>` : '';
    
    const oldPriceHtml = product.oldPrice ? 
        `<span class="price-old">R$ ${formatPrice(product.oldPrice)}</span>` : '';
    
    const stockClass = product.inStock ? '' : 'out-of-stock';
    const stockText = product.inStock
        ? (quoteOnly ? 'Pedir atendimento' : 'Adicionar ao Carrinho')
        : 'Fora de Estoque';
    const stockIcon = product.inStock
        ? (quoteOnly ? 'fa-comments' : 'fa-shopping-cart')
        : 'fa-times-circle';
    
    // Determinar caminho da imagem
    let imagePath = product.image;
    const isEmbeddedOrAbsoluteImage = product.image && (
        product.image.startsWith('http') ||
        product.image.startsWith('//') ||
        product.image.startsWith('data:') ||
        product.image.startsWith('blob:')
    );

    if (product.image && !isEmbeddedOrAbsoluteImage && !product.image.startsWith('/uploads') && !product.image.startsWith('/imagem')) {
        // Se a imagem não é URL completa/embutida e não está em /uploads ou /imagem, assume que está em imagem/
        imagePath = `imagem/${product.image}`;
    } else if (product.image && product.image.startsWith('/uploads')) {
        // Imagem já está no formato correto (/uploads/products/...)
        imagePath = product.image;
    } else if (product.image && product.image.startsWith('/imagem')) {
        // Remove a barra inicial se já começa com /imagem
        imagePath = product.image.substring(1);
    }
    
    // Se não houver imagem, usar ícone padrão
    const imageHtml = product.image ? 
        `<img src="${imagePath}" alt="${product.name}" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
         <i class="fas fa-laptop" style="display:none;"></i>` :
        `<i class="fas fa-laptop"></i>`;
    
    card.innerHTML = `
        <div class="produto-image" onclick="openProductModal(${product.id})" style="cursor: pointer;">
            ${imageHtml}
            ${badgeHtml}
        </div>
        <div class="produto-info">
            <h3 class="produto-title" onclick="openProductModal(${product.id})" style="cursor: pointer;">${product.name}</h3>
            <p class="produto-description">${product.description}</p>
            <div class="produto-price">
                ${oldPriceHtml}
                <span class="price-current">R$ ${formatPrice(product.price)}</span>
            </div>
            <div class="produto-actions">
                <button class="btn btn-small btn-cart ${stockClass}" 
                        onclick="addToCart(${product.id})"
                        ${!product.inStock ? 'disabled' : ''}>
                    <i class="fas ${stockIcon}"></i>
                    ${stockText}
                </button>
                <button class="btn btn-small btn-favorite" onclick="toggleFavorite(event, ${product.id})">
                    <i class="far fa-heart"></i>
                </button>
            </div>
        </div>
    `;
    
    return card;
}

function formatPrice(price) {
    if (price === null || price === undefined || isNaN(price)) return '0,00';
    return Number(price).toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// Filtros
function handleFilterClick(event) {
    const filter = event.target.dataset.filter;
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    state.currentFilter = filter;

    // Quando os produtos vêm da API pública da Tech10, usar filtro que não esvazia a lista
    if (typeof window.filterTech10Products === 'function' && window.__tech10_products && window.__tech10_products.length > 0) {
        window.filterTech10Products({ category: filter, search: (document.getElementById('searchInput') && document.getElementById('searchInput').value) || '' });
        animateProductCards();
        return;
    }
    
    filterProducts(filter);
}

function filterProducts(filter) {
    state.currentFilter = filter;
    
    if (filter === 'all') {
        state.filteredProducts = state.products;
    } else {
        state.filteredProducts = state.products.filter(product => 
            product.category === filter
        );
    }
    
    renderProducts();
    animateProductCards();
}

function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase().trim();
    const filter = state.currentFilter || 'all';

    if (typeof window.filterTech10Products === 'function' && window.__tech10_products && window.__tech10_products.length > 0) {
        window.filterTech10Products({ category: filter, search: searchTerm });
        animateProductCards();
        return;
    }
    
    if (searchTerm === '') {
        filterProducts(filter);
        return;
    }
    
    state.filteredProducts = state.products.filter(product =>
        (product.name || '').toLowerCase().includes(searchTerm) ||
        (product.description || '').toLowerCase().includes(searchTerm)
    );
    
    renderProducts();
    animateProductCards();
}

function animateProductCards() {
    const cards = document.querySelectorAll('.produto-card, .product-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.3s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

function getCommerceRuntimeState() {
    const runtime = window.__tech10_runtime_config || {};
    const commerce = runtime.commerce || {};
    const capabilities = commerce.capabilities || {};

    return {
        runtime,
        commerce,
        capabilities,
        quoteOnly: capabilities.quoteOnly === true || capabilities.cart === false || commerce.checkoutMode === 'quote_only'
    };
}

function getSupportWhatsAppNumber() {
    const tenantCompany = (window.TENANT_CONFIG && window.TENANT_CONFIG.company) || {};
    const { runtime } = getCommerceRuntimeState();
    const support = runtime.support || {};
    return String(support.whatsapp || tenantCompany.whatsapp || '55974001960').replace(/\D/g, '');
}

function toggleCart() {
    const { quoteOnly } = getCommerceRuntimeState();

    if (quoteOnly) {
        const whatsapp = getSupportWhatsAppNumber();
        const message = encodeURIComponent('Olá! Vim pelo site da Tech10 e quero ajuda para escolher ou fechar um produto.');
        window.open(`https://wa.me/${whatsapp}?text=${message}`, '_blank', 'noopener,noreferrer');
        return;
    }

    window.location.href = '/carrinho';
}

function findProductById(productId) {
    return (state.filteredProducts || []).find(p => p.id === productId)
        || (state.products || []).find(p => p.id === productId)
        || null;
}

function openProductSupportChat(product) {
    const whatsapp = getSupportWhatsAppNumber();
    const lines = [
        'Olá! Vim pelo site da Tech10 e quero atendimento para este produto.',
        product && product.name ? `Produto: ${product.name}` : '',
        product && product.categoryName ? `Categoria: ${product.categoryName}` : '',
        product && product.price ? `Preço exibido: R$ ${formatPrice(product.price)}` : '',
        '',
        'Pode me ajudar a confirmar disponibilidade e fechamento?'
    ].filter(Boolean);
    window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener,noreferrer');
}

function addToCart(productId) {
    const { quoteOnly } = getCommerceRuntimeState();
    const product = findProductById(productId);

    if (quoteOnly) {
        openProductSupportChat(product);
        return;
    }

    if (typeof window.__openProductModal === 'function') {
        window.__openProductModal(productId);
        return;
    }

    toggleCart();
}

function toggleFavorite(event, productId) {
    const button = event && event.target ? event.target.closest('.btn-favorite') : null;
    if (!button) return;
    const icon = button.querySelector('i');
    
    if (icon.classList.contains('far')) {
        icon.classList.remove('far');
        icon.classList.add('fas');
        button.style.background = '#ef4444';
        button.style.color = 'white';
    } else {
        icon.classList.remove('fas');
        icon.classList.add('far');
        button.style.background = '#e2e8f0';
        button.style.color = '#64748b';
    }
}

// Armazenamento local legado removido da home pública.
// O carrinho ativo é resolvido pela camada canônica do storefront.

// Formulário de contato
function handleContactForm(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const telefone = document.getElementById('telefone').value;
    const mensagem = document.getElementById('mensagem').value;
    
    // Validação básica
    if (!nome || !email || !mensagem) {
        showNotification('Por favor, preencha todos os campos obrigatórios.', 'error');
        return;
    }
    
    // Simular envio
    showNotification('Mensagem enviada com sucesso! Entraremos em contato em breve.', 'success');
    event.target.reset();
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.textContent = message;
    
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        info: '#2563eb'
    };
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${colors[type]};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
        z-index: 1001;
        max-width: 300px;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Navegação suave
function handleSmoothScroll(event) {
    const href = event.target.getAttribute('href');
    
    if (href && href.startsWith('#')) {
        event.preventDefault();
        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
            const headerHeight = document.querySelector('.header').offsetHeight;
            const targetPosition = targetElement.offsetTop - headerHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    }
}

// Efeitos de scroll
function setupScrollEffects() {
    let lastScrollTop = 0;
    const header = document.querySelector('.header');
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Header shrink effect
        if (scrollTop > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        // Hide/show header on scroll
        if (scrollTop > lastScrollTop && scrollTop > 200) {
            header.style.transform = 'translateY(-100%)';
        } else {
            header.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = scrollTop;
    });
    
    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    document.querySelectorAll('.category-card, .produto-card, .servico-card').forEach(el => {
        observer.observe(el);
    });
}

// Menu mobile
function setupMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const nav = document.querySelector('.nav');
    
    if (menuToggle && nav) {
        menuToggle.addEventListener('click', function() {
            nav.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });
        
        // Fechar menu ao clicar em um link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', function() {
                nav.classList.remove('active');
                menuToggle.classList.remove('active');
            });
        });
    }
}

// Setup do vídeo hero
function setupHeroVideo() {
    const video = document.querySelector('.hero-video video');
    const heroVideo = document.querySelector('.hero-video');
    if (video && heroVideo) {
        // Configurações iniciais
        video.volume = 0;
        video.loop = true;
        video.muted = true;
        video.playsInline = true;
        
        // Prevenir piscar durante carregamento
        video.style.opacity = '0';
        video.style.transition = 'opacity 0.5s ease';
        
        // Garantir que o vídeo seja reproduzido após carregar
        video.addEventListener('loadeddata', function() {
            video.style.opacity = '1';
            video.play().catch(function(error) {
                console.log('Erro ao reproduzir vídeo:', error);
                video.style.display = 'none';
                heroVideo.classList.add('hero-video-fallback');
            });
        });
        
        // Fallback quando vídeo falha ao carregar (404, formato inválido, etc.)
        video.addEventListener('error', function() {
            video.style.display = 'none';
            video.style.opacity = '0';
            heroVideo.classList.add('hero-video-fallback');
        });
        
        // Otimizar performance com Intersection Observer
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (video.paused) {
                        video.play().catch(e => console.log('Erro ao reproduzir:', e));
                    }
                } else {
                    if (!video.paused) {
                        video.pause();
                    }
                }
            });
        }, { threshold: 0.1 });
        
        const heroSection = document.querySelector('.hero');
        if (heroSection) {
            observer.observe(heroSection);
        }
        
        // Fallback para dispositivos que não suportam autoplay
        setTimeout(() => {
            if (video.paused && video.style.opacity === '1') {
                video.play().catch(e => console.log('Autoplay não suportado'));
            }
        }, 1500);
    }
}

// Gerenciamento das Dicas do Especialista
function renderDicas() {
    const grid = document.getElementById('dicasGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    const startIndex = state.currentDicaPage * state.dicasPerPage;
    const endIndex = startIndex + state.dicasPerPage;
    const dicasToShow = state.dicas.slice(startIndex, endIndex);
    
    dicasToShow.forEach(dica => {
        const dicaCard = createDicaCard(dica);
        grid.appendChild(dicaCard);
    });
    
    updateDicaNavigation();
    createDicaDots();
}

function createDicaCard(dica) {
    const card = document.createElement('div');
    card.className = 'dica-card';
    card.onclick = () => openDicaModal(dica);
    
    const difficultyStars = createDifficultyStars(dica.difficulty);
    
    card.innerHTML = `
        <div class="dica-image">
            <img src="${dica.image}" alt="${dica.title}" loading="lazy">
            <div class="dica-badge">${dica.category}</div>
        </div>
        <div class="dica-content">
            <h3 class="dica-title">${dica.title}</h3>
            <p class="dica-description">${dica.description}</p>
            <div class="dica-tags">
                ${dica.tags.map(tag => `<span class="dica-tag">${tag}</span>`).join('')}
            </div>
            <div class="dica-footer">
                <div class="dica-difficulty">
                    <span>Dificuldade:</span>
                    <div class="difficulty-stars">${difficultyStars}</div>
                </div>
                <div class="dica-read-time">
                    <i class="fas fa-clock"></i> ${dica.readTime}
                </div>
            </div>
        </div>
    `;
    
    return card;
}

function createDifficultyStars(difficulty) {
    let stars = '';
    for (let i = 1; i <= 3; i++) {
        if (i <= difficulty) {
            stars += '<i class="fas fa-star"></i>';
        } else {
            stars += '<i class="far fa-star"></i>';
        }
    }
    return stars;
}

function changeDicaPage(direction) {
    const totalPages = Math.ceil(state.dicas.length / state.dicasPerPage);
    const newPage = state.currentDicaPage + direction;
    
    if (newPage >= 0 && newPage < totalPages) {
        state.currentDicaPage = newPage;
        renderDicas();
    }
}

function updateDicaNavigation() {
    const totalPages = Math.ceil(state.dicas.length / state.dicasPerPage);
    const prevBtn = document.getElementById('prevDica');
    const nextBtn = document.getElementById('nextDica');
    
    if (prevBtn) {
        prevBtn.disabled = state.currentDicaPage === 0;
    }
    
    if (nextBtn) {
        nextBtn.disabled = state.currentDicaPage === totalPages - 1;
    }
}

function createDicaDots() {
    const dotsContainer = document.getElementById('dicasDots');
    if (!dotsContainer) return;
    
    const totalPages = Math.ceil(state.dicas.length / state.dicasPerPage);
    dotsContainer.innerHTML = '';
    
    for (let i = 0; i < totalPages; i++) {
        const dot = document.createElement('div');
        dot.className = `dica-dot ${i === state.currentDicaPage ? 'active' : ''}`;
        dot.onclick = () => goToDicaPage(i);
        dotsContainer.appendChild(dot);
    }
}

function goToDicaPage(page) {
    state.currentDicaPage = page;
    renderDicas();
}

// Variável para armazenar a posição do scroll
let scrollPosition = 0;

function openDicaModal(dica) {
    // Usar ModalManager se disponível
    if (typeof ModalManager !== 'undefined') {
        const modalManager = window.modalManager || (window.modalManager = new ModalManager());
        
        const content = `
            <div class="dica-modal-header" style="text-align: center; margin-bottom: 1.5rem;">
                <img src="${dica.image}" alt="${dica.title}" style="width: 100%; max-height: 300px; object-fit: cover; border-radius: 10px;">
            </div>
            <div class="dica-modal-body">
                <div class="dica-modal-meta" style="display: flex; gap: 1rem; margin-bottom: 1rem; flex-wrap: wrap;">
                    <div class="dica-modal-category" style="background: #e3f2fd; color: #1976d2; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.9rem;">
                        ${dica.category}
                    </div>
                    <div class="dica-modal-difficulty" style="color: #f57c00;">
                        ${createDifficultyStars(dica.difficulty)}
                    </div>
                    <div class="dica-modal-read-time" style="color: #666;">
                        <i class="fas fa-clock"></i> ${dica.readTime}
                    </div>
                </div>
                <div class="dica-modal-tags" style="margin-bottom: 1.5rem;">
                    ${dica.tags.map(tag => `<span class="dica-tag" style="background: #f5f5f5; padding: 0.25rem 0.5rem; border-radius: 5px; font-size: 0.85rem; margin-right: 0.5rem;">${tag}</span>`).join('')}
                </div>
                <div class="dica-modal-text" style="line-height: 1.8; color: #333;">
                    ${dica.content}
                </div>
            </div>
        `;
        
        const modalId = modalManager.create({
            title: `<i class="fas fa-lightbulb"></i> ${dica.title}`,
            content: content,
            size: 'large'
        });
        
        modalManager.open(modalId);
        return;
    }
    
    // Fallback para modal legado
    scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    
    let modal = document.getElementById('dicaModal');
    if (!modal) {
        modal = createDicaModal();
        document.body.appendChild(modal);
    }
    
    const modalImg = modal.querySelector('.dica-modal-header img');
    const modalTitle = modal.querySelector('.dica-modal-title');
    const modalCategory = modal.querySelector('.dica-modal-category');
    const modalDifficulty = modal.querySelector('.dica-modal-difficulty');
    const modalReadTime = modal.querySelector('.dica-modal-read-time');
    const modalTags = modal.querySelector('.dica-modal-tags');
    const modalContent = modal.querySelector('.dica-modal-text');
    
    if (modalImg) modalImg.src = dica.image;
    if (modalTitle) modalTitle.textContent = dica.title;
    if (modalCategory) modalCategory.textContent = dica.category;
    if (modalDifficulty) modalDifficulty.innerHTML = createDifficultyStars(dica.difficulty);
    if (modalReadTime) modalReadTime.textContent = dica.readTime;
    if (modalTags) modalTags.innerHTML = dica.tags.map(tag => `<span class="dica-tag">${tag}</span>`).join('');
    if (modalContent) modalContent.textContent = dica.content;
    
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollPosition}px`;
    document.body.style.width = '100%';
    
    modal.style.display = 'block';
}

function closeDicaModal() {
    const modal = document.getElementById('dicaModal');
    if (modal) {
        modal.style.display = 'none';
        
        // Restaurar scroll do body
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        
        // Restaurar posição do scroll
        window.scrollTo(0, scrollPosition);
    }
}

function createDicaModal() {
    // Usar ModalManager se disponível
    if (typeof ModalManager !== 'undefined') {
        // Modal será criado dinamicamente quando necessário
        return null;
    }
    
    // Fallback para modal legado
    const modal = document.createElement('div');
    modal.id = 'dicaModal';
    modal.className = 'dica-modal';
    
    modal.innerHTML = `
        <div class="dica-modal-content">
            <div class="dica-modal-header">
                <img src="" alt="">
                <button class="dica-modal-close">&times;</button>
            </div>
            <div class="dica-modal-body">
                <h2 class="dica-modal-title"></h2>
                <div class="dica-modal-meta">
                    <div class="dica-modal-category"></div>
                    <div class="dica-modal-difficulty"></div>
                    <div class="dica-modal-read-time"></div>
                </div>
                <div class="dica-modal-tags"></div>
                <div class="dica-modal-text"></div>
            </div>
        </div>
    `;
    
    // Event listeners para fechar modal
    const closeBtn = modal.querySelector('.dica-modal-close');
    closeBtn.onclick = () => closeDicaModal();
    
    modal.onclick = (e) => {
        if (e.target === modal) {
            closeDicaModal();
        }
    };
    
    // Adicionar listener para tecla ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            closeDicaModal();
        }
    });
    
    return modal;
}

// Inicializar ao carregar
window.addEventListener('load', function() {
    // Se o carrinho canônico já estiver inicializado, atualizar contador.
    var cart = (typeof window.getActiveStorefrontCart === 'function')
        ? window.getActiveStorefrontCart()
        : (window.storefrontCart || null);
    if (cart && typeof cart.updateCartCount === 'function') {
        cart.updateCartCount().catch(err => console.error('Erro ao atualizar contador:', err));
    }
    registerServiceWorker();
});

// Registrar Service Worker para PWA
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('✅ Tech10 PWA: Service Worker registrado:', registration.scope);
                
                // Verificar atualizações
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            showNotification('Nova versão disponível! Recarregue a página.', 'info');
                        }
                    });
                });
            })
            .catch(error => {
                console.error('❌ Tech10 PWA: Erro ao registrar Service Worker:', error);
            });
    }
}

// Adicionar estilos CSS dinamicamente para animações
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .header.scrolled {
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
    }
    
    .header {
        transition: transform 0.3s ease, background 0.3s ease;
    }
    
    .animate-in {
        animation: fadeInUp 0.6s ease forwards;
    }
    
    .menu-toggle.active span:nth-child(1) {
        transform: rotate(45deg) translate(5px, 5px);
    }
    
    .menu-toggle.active span:nth-child(2) {
        opacity: 0;
    }
    
    .menu-toggle.active span:nth-child(3) {
        transform: rotate(-45deg) translate(7px, -6px);
    }
    
    .out-of-stock {
        background: #9ca3af !important;
        cursor: not-allowed !important;
    }
`;

document.head.appendChild(style);

// Gallery functionality for About section
let currentGallerySlide = 0;

function changeSlide(direction) {
    const slides = document.querySelectorAll('.gallery-slide');
    const dots = document.querySelectorAll('.dot');
    
    if (slides.length === 0) return;
    
    // Remove active class from current slide and dot
    slides[currentGallerySlide].classList.remove('active');
    dots[currentGallerySlide].classList.remove('active');
    
    // Calculate new slide index
    currentGallerySlide += direction;
    
    if (currentGallerySlide >= slides.length) {
        currentGallerySlide = 0;
    } else if (currentGallerySlide < 0) {
        currentGallerySlide = slides.length - 1;
    }
    
    // Add active class to new slide and dot
    slides[currentGallerySlide].classList.add('active');
    dots[currentGallerySlide].classList.add('active');
}

function currentSlide(slideIndex) {
    const slides = document.querySelectorAll('.gallery-slide');
    const dots = document.querySelectorAll('.dot');
    
    if (slides.length === 0) return;
    
    // Remove active class from current slide and dot
    slides[currentGallerySlide].classList.remove('active');
    dots[currentGallerySlide].classList.remove('active');
    
    // Set new slide index (convert from 1-based to 0-based)
    currentGallerySlide = slideIndex - 1;
    
    // Add active class to new slide and dot
    slides[currentGallerySlide].classList.add('active');
    dots[currentGallerySlide].classList.add('active');
}

function initializeGallery() {
    const gallery = document.getElementById('lojaGallery');
    
    if (!gallery) return;
    
    // Auto-rotate gallery every 8 seconds (menos agressivo)
    setInterval(() => {
        changeSlide(1);
    }, 8000);
    
    console.log('📸 Galeria da loja inicializada!');
}

// Back to Top functionality
function initializeBackToTop() {
    const backToTopBtn = document.getElementById('backToTop');
    
    if (!backToTopBtn) return;
    
    // Show/hide button based on scroll position
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });
    
    // Smooth scroll to top when clicked
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    console.log('🔝 Botão Voltar ao Topo inicializado!');
}

function openProductModal(productId) {
    if (
        window.Tech10ProductModal
        && typeof window.Tech10ProductModal.open === 'function'
        && window.Tech10ProductModal.open !== openProductModal
    ) {
        window.Tech10ProductModal.open(productId);
        return;
    }

    const product = findProductById(productId);
    if (!product) {
        console.error('Produto não encontrado:', productId);
        return;
    }
    openProductSupportChat(product);
}

function closeProductModal() {
    if (
        window.Tech10ProductModal
        && typeof window.Tech10ProductModal.close === 'function'
        && window.Tech10ProductModal.close !== closeProductModal
    ) {
        window.Tech10ProductModal.close();
    }
}
