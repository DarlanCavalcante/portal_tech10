// Gerenciador de Conteúdo Dinâmico
class ContentManager {
  constructor() {
    this.products = [];
    this.categories = [];
    this.settings = {};
  }

  // Inicializar conteúdo
  async init() {
    try {
      await Promise.all([
        this.loadCategories(),
        this.loadProducts(),
        this.loadSettings()
      ]);
      
      this.renderCategories();
      this.renderProducts();
      this.updateSiteInfo();
      this.setupSearch();
      
      console.log('✅ Conteúdo carregado do backend com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao carregar conteúdo:', error);
      this.showError('Não foi possível carregar o conteúdo. Usando dados padrão.');
    }
  }

  // Carregar categorias
  async loadCategories() {
    this.categories = await TechAPI.getCategories({ active: '1' });
  }

  // Carregar produtos
  async loadProducts() {
    this.products = await TechAPI.getProducts({ active: '1' });
  }

  // Carregar configurações
  async loadSettings() {
    const settings = await TechAPI.getPublicSettings();
    this.settings = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});
  }

  // Renderizar categorias
  renderCategories() {
    const categoriesGrid = document.querySelector('.categories-grid');
    if (!categoriesGrid) return;

    categoriesGrid.innerHTML = '';

    this.categories.slice(0, 8).forEach(category => {
      const card = this.createCategoryCard(category);
      categoriesGrid.appendChild(card);
    });
  }

  // Criar card de categoria
  createCategoryCard(category) {
    const div = document.createElement('div');
    div.className = 'category-card';
    div.style.border = `2px solid ${category.color || '#1a73e8'}`;
    div.setAttribute('data-category-id', category.id);
    
    div.innerHTML = `
      <i class="${category.icon || 'fas fa-tag'}" style="color: ${category.color || '#1a73e8'};"></i>
      <h3>${category.name}</h3>
      <p>${category.description || ''}</p>
      <span class="product-count">${category.products_count || 0} produtos</span>
    `;

    div.addEventListener('click', () => this.filterByCategory(category.id));
    
    return div;
  }

  // Renderizar produtos
  renderProducts(filter = null) {
    const productsGrid = document.querySelector('.products-grid');
    if (!productsGrid) return;

    productsGrid.innerHTML = '';

    let productsToShow = this.products;
    
    // Filtrar por categoria
    if (filter && filter.category) {
      productsToShow = productsToShow.filter(p => p.category_id === filter.category);
    }

    // Filtrar por busca
    if (filter && filter.search) {
      const searchTerm = filter.search.toLowerCase();
      productsToShow = productsToShow.filter(p => 
        p.name.toLowerCase().includes(searchTerm) ||
        (p.description && p.description.toLowerCase().includes(searchTerm))
      );
    }

    // Mostrar mensagem se não houver produtos
    if (productsToShow.length === 0) {
      productsGrid.innerHTML = '<p class="no-products">Nenhum produto encontrado.</p>';
      return;
    }

    // Renderizar produtos
    productsToShow.forEach(product => {
      const card = this.createProductCard(product);
      productsGrid.appendChild(card);
    });
  }

  // Criar card de produto
  createProductCard(product) {
    const div = document.createElement('div');
    div.className = 'product-card';
    div.setAttribute('data-product-id', product.id);

    const price = product.sale_price || product.price;
    const hasDiscount = product.sale_price && product.sale_price < product.price;
    
    // Parse images JSON
    let images = [];
    try {
      images = product.images ? JSON.parse(product.images) : [];
    } catch (e) {
      images = [];
    }
    
    const mainImage = images[0] || 'imagem/placeholder.jpg';

    div.innerHTML = `
      ${hasDiscount ? '<span class="badge sale">Promoção</span>' : ''}
      ${product.is_featured ? '<span class="badge featured">Destaque</span>' : ''}
      <img src="${mainImage}" alt="${product.name}" loading="lazy">
      <h3>${product.name}</h3>
      <p class="product-description">${product.short_description || ''}</p>
      <div class="product-price">
        ${hasDiscount ? `<span class="old-price">${TechAPI.formatPrice(product.price)}</span>` : ''}
        <span class="price">${TechAPI.formatPrice(price)}</span>
      </div>
      ${product.stock > 0 ? 
        `<button class="btn btn-primary" onclick="contentManager.addToCart(${product.id})">
          <i class="fas fa-shopping-cart"></i> Adicionar
        </button>` : 
        '<button class="btn btn-secondary" disabled>Indisponível</button>'
      }
    `;

    div.addEventListener('click', (e) => {
      if (!e.target.closest('button')) {
        this.showProductDetails(product.id);
      }
    });

    return div;
  }

  // Filtrar por categoria
  async filterByCategory(categoryId) {
    this.renderProducts({ category: categoryId });
    
    // Scroll para produtos
    document.querySelector('.products-grid')?.scrollIntoView({ 
      behavior: 'smooth' 
    });
  }

  // Atualizar informações do site
  updateSiteInfo() {
    // Nome do site
    const siteName = this.settings.site_name || 'Tech10 Informática e Tecnologia';
    document.querySelectorAll('.site-name').forEach(el => {
      el.textContent = siteName;
    });

    // Descrição
    const siteDesc = this.settings.site_description || '';
    document.querySelectorAll('.site-description').forEach(el => {
      el.textContent = siteDesc;
    });

    // Contato
    if (this.settings.contact_phone) {
      document.querySelectorAll('.contact-phone').forEach(el => {
        el.textContent = this.settings.contact_phone;
        el.href = `tel:${this.settings.contact_phone.replace(/\D/g, '')}`;
      });
    }

    if (this.settings.contact_whatsapp) {
      document.querySelectorAll('.contact-whatsapp').forEach(el => {
        el.href = `https://wa.me/${this.settings.contact_whatsapp}`;
      });
    }

    if (this.settings.contact_email) {
      document.querySelectorAll('.contact-email').forEach(el => {
        el.textContent = this.settings.contact_email;
        el.href = `mailto:${this.settings.contact_email}`;
      });
    }

    // Endereço
    if (this.settings.address) {
      document.querySelectorAll('.contact-address').forEach(el => {
        el.textContent = this.settings.address;
      });
    }

    // Redes sociais
    if (this.settings.social_instagram) {
      document.querySelectorAll('.social-instagram').forEach(el => {
        el.href = this.settings.social_instagram;
      });
    }

    if (this.settings.social_facebook) {
      document.querySelectorAll('.social-facebook').forEach(el => {
        el.href = this.settings.social_facebook;
      });
    }
  }

  // Configurar busca
  setupSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;

    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        const query = e.target.value.trim();
        if (query.length > 2) {
          this.renderProducts({ search: query });
        } else if (query.length === 0) {
          this.renderProducts();
        }
      }, 300);
    });
  }

  // Mostrar produto em modal
  async showProduct(productId) {
    const product = await TechAPI.getProduct(productId);
    if (!product) return;

    // Usar ModalManager se disponível
    if (typeof ModalManager !== 'undefined') {
      const modalManager = window.modalManager || (window.modalManager = new ModalManager());
      const content = this.createProductContent(product);
      const modalId = modalManager.create({
        title: product.name,
        content: content,
        size: 'large'
      });
      modalManager.open(modalId);
    } else {
      // Fallback para modal customizado
      const modal = this.createProductModal(product);
      document.body.appendChild(modal);
      modal.style.display = 'flex';
    }
  }

  // Criar conteúdo do produto para modal
  createProductContent(product) {
    const price = product.sale_price || product.price;
    let images = [];
    try {
      images = product.images ? JSON.parse(product.images) : [];
    } catch (e) {
      images = [];
    }
    let features = [];
    try {
      features = product.features ? JSON.parse(product.features) : [];
    } catch (e) {
      features = [];
    }

    return `
      <div class="modal-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
        <div class="modal-images">
          <img src="${images[0] || 'imagem/placeholder.jpg'}" alt="${product.name}" style="width: 100%; border-radius: 10px;">
        </div>
        
        <div class="modal-info">
          <p class="modal-sku" style="color: #666;">SKU: ${product.sku || 'N/A'}</p>
          <div class="modal-price" style="margin: 1rem 0;">
            <span class="price" style="font-size: 2rem; color: #1a73e8; font-weight: bold;">
              ${TechAPI.formatPrice(price)}
            </span>
          </div>
          
          <div class="modal-description" style="margin: 1.5rem 0;">
            <p style="line-height: 1.6;">${product.description || product.short_description || ''}</p>
          </div>
          
          ${features.length > 0 ? `
            <div class="modal-features" style="margin: 1.5rem 0;">
              <h3 style="margin-bottom: 1rem;">Características:</h3>
              <ul style="list-style: none; padding: 0;">
                ${features.map(f => `<li style="padding: 0.5rem 0; border-bottom: 1px solid #eee;"><i class="fas fa-check" style="color: #1a73e8; margin-right: 0.5rem;"></i>${f}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
          
          <div class="modal-stock" style="margin: 1.5rem 0;">
            <span style="color: ${product.stock > 0 ? '#28a745' : '#dc3545'}; font-weight: bold;">
              <i class="fas fa-${product.stock > 0 ? 'check-circle' : 'times-circle'}"></i>
              ${product.stock > 0 ? 'Em estoque' : 'Indisponível'}
            </span>
          </div>
          
          <button onclick="addToCart(${product.id})" class="btn btn-primary" style="width: 100%; padding: 1rem; font-size: 1.1rem; background: #1a73e8; color: white; border: none; border-radius: 5px; cursor: pointer;">
            <i class="fas fa-shopping-cart"></i> Adicionar ao Carrinho
          </button>
        </div>
      </div>
    `;
  }

  // Criar modal de produto (fallback legado)
  createProductModal(product) {
    const modal = document.createElement('div');
    modal.className = 'product-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      padding: 2rem;
    `;

    const price = product.sale_price || product.price;
    
    let images = [];
    try {
      images = product.images ? JSON.parse(product.images) : [];
    } catch (e) {
      images = [];
    }

    let features = [];
    try {
      features = product.features ? JSON.parse(product.features) : [];
    } catch (e) {
      features = [];
    }

    modal.innerHTML = `
      <div class="modal-content" style="
        background: white;
        border-radius: 10px;
        max-width: 900px;
        width: 100%;
        max-height: 90vh;
        overflow-y: auto;
        padding: 2rem;
        position: relative;
      ">
        <button class="close-modal" style="
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: none;
          border: none;
          font-size: 2rem;
          cursor: pointer;
        ">&times;</button>
        
        <div class="modal-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
          <div class="modal-images">
            <img src="${images[0] || 'imagem/placeholder.jpg'}" alt="${product.name}" style="width: 100%; border-radius: 10px;">
          </div>
          
          <div class="modal-info">
            <h2>${product.name}</h2>
            <p class="modal-sku">SKU: ${product.sku || 'N/A'}</p>
            <div class="modal-price" style="margin: 1rem 0;">
              <span class="price" style="font-size: 2rem; color: #1a73e8; font-weight: bold;">
                ${TechAPI.formatPrice(price)}
              </span>
            </div>
            
            <div class="modal-description">
              <p>${product.description || product.short_description || ''}</p>
            </div>
            
            ${features.length > 0 ? `
              <div class="modal-features" style="margin-top: 1rem;">
                <h3>Características:</h3>
                <ul>
                  ${features.map(f => `<li>${f}</li>`).join('')}
                </ul>
              </div>
            ` : ''}
            
            <div class="modal-stock" style="margin-top: 1rem;">
              ${product.stock > 0 ? 
                `<p style="color: green;"><i class="fas fa-check"></i> ${product.stock} em estoque</p>` :
                '<p style="color: red;"><i class="fas fa-times"></i> Indisponível</p>'
              }
            </div>
            
            ${product.stock > 0 ? `
              <button class="btn btn-primary btn-large" onclick="contentManager.addToCart(${product.id})" style="
                width: 100%;
                padding: 1rem;
                margin-top: 1rem;
                font-size: 1.1rem;
              ">
                <i class="fas fa-shopping-cart"></i> Adicionar ao Carrinho
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    `;

    modal.querySelector('.close-modal').addEventListener('click', () => {
      modal.remove();
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });

    return modal;
  }

  // Adicionar ao carrinho
  addToCart(productId) {
    console.log('Adicionar ao carrinho:', productId);
    
    // Obter carrinho do localStorage
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Verificar se produto já está no carrinho
    const existingIndex = cart.findIndex(item => item.id === productId);
    
    if (existingIndex >= 0) {
      cart[existingIndex].quantity++;
    } else {
      const product = this.products.find(p => p.id === productId);
      if (product) {
        cart.push({
          id: product.id,
          name: product.name,
          price: product.sale_price || product.price,
          quantity: 1
        });
      }
    }
    
    // Salvar carrinho
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Atualizar contador
    this.updateCartCount();
    
    // Mostrar notificação
    this.showNotification('Produto adicionado ao carrinho!');
  }

  // Atualizar contador do carrinho
  updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
      cartCount.textContent = totalItems;
    }
  }

  // Mostrar notificação
  showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4CAF50;
      color: white;
      padding: 1rem 2rem;
      border-radius: 5px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  // Mostrar erro
  showError(message) {
    console.error(message);
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #f44336;
      color: white;
      padding: 1rem 2rem;
      border-radius: 5px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      z-index: 10000;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 5000);
  }
}

// Inicializar quando o DOM estiver pronto
let contentManager;

document.addEventListener('DOMContentLoaded', () => {
  contentManager = new ContentManager();
  contentManager.init();
  contentManager.updateCartCount();
});

// Exportar globalmente
if (typeof window !== 'undefined') {
  window.ContentManager = ContentManager;
  window.contentManager = contentManager;
}
