/**
 * 📦 TECH10 ADMIN PRODUTOS
 * Gerenciamento de produtos
 */

class AdminProducts {
  constructor() {
    this.products = [];
    this.categories = [];
    this.currentPage = 1;
    this.itemsPerPage = 12;
    this.totalItems = 0;
    this.currentFilters = {};
    this.cache = new Map();
    this.init();
  }

  init() {
    this.bindEvents();
    this.loadCategories();
  }

  bindEvents() {
    // Botões de ação
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-add-product]')) {
        this.showProductModal();
      }
      
      if (e.target.matches('[data-edit-product]')) {
        const id = e.target.getAttribute('data-edit-product');
        this.editProduct(id);
      }
      
      if (e.target.matches('[data-delete-product]')) {
        const id = e.target.getAttribute('data-delete-product');
        this.deleteProduct(id);
      }
      
      if (e.target.matches('[data-view-product]')) {
        const id = e.target.getAttribute('data-view-product');
        this.viewProduct(id);
      }

      if (e.target.matches('[data-remove-image]')) {
        this.removeImage(e.target);
      }
    });

    // Form de produto
    const productForm = document.getElementById('product-form');
    if (productForm) {
      productForm.addEventListener('submit', this.handleProductSubmit.bind(this));
    }

    // Filtros
    document.addEventListener('change', (e) => {
      if (e.target.matches('[data-filter]')) {
        this.applyFilters();
      }
    });

    // Busca
    const searchInput = document.getElementById('product-search');
    if (searchInput) {
      let searchTimeout;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          this.currentFilters.search = e.target.value;
          this.loadProducts();
        }, 500);
      });
    }

    // Paginação
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-page]')) {
        const page = parseInt(e.target.getAttribute('data-page'));
        this.changePage(page);
      }
    });

    // Upload de imagens
    const imageInput = document.getElementById('product-images');
    if (imageInput) {
      imageInput.addEventListener('change', this.handleImageSelect.bind(this));
    }

    // Drag and drop para imagens
    this.setupImageDragDrop();
  }

  async loadProducts(page = 1) {
    try {
      this.showLoading();
      
      const params = {
        page,
        limit: this.itemsPerPage,
        ...this.currentFilters
      };

      const data = await adminAPI.getProducts(params);
      
      this.products = data.products;
      this.totalItems = data.total;
      this.currentPage = page;
      
      this.renderProducts();
      this.renderPagination();
      
      this.hideLoading();
      
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      this.hideLoading();
      adminUtils.showToast('Erro ao carregar produtos', 'error');
    }
  }

  async loadCategories() {
    try {
      const data = await adminAPI.getCategories();
      this.categories = data.categories;
      this.renderCategoryOptions();
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  }

  renderProducts() {
    const container = document.getElementById('products-grid');
    if (!container) return;

    if (this.products.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-box-open"></i>
          <h3>Nenhum produto encontrado</h3>
          <p>Comece adicionando seu primeiro produto</p>
          <button class="btn btn-primary" data-add-product>
            <i class="fas fa-plus"></i>
            Adicionar Produto
          </button>
        </div>
      `;
      return;
    }

    const html = this.products.map(product => this.renderProductCard(product)).join('');
    container.innerHTML = html;
  }

  renderProductCard(product) {
    const mainImage = product.images && product.images.length > 0 
      ? `/uploads/products/${product.images[0]}` 
      : '/imagem/placeholder.jpg';

    const categoryName = this.categories.find(cat => cat.id === product.category_id)?.name || 'Sem categoria';
    
    return `
      <div class="product-card" data-product-id="${product.id}">
        <div class="product-image">
          <img src="${mainImage}" alt="${product.name}" loading="lazy">
          <div class="product-overlay">
            <button class="btn btn-sm btn-primary" data-view-product="${product.id}" title="Visualizar">
              <i class="fas fa-eye"></i>
            </button>
            <button class="btn btn-sm btn-warning" data-edit-product="${product.id}" title="Editar">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-danger" data-delete-product="${product.id}" title="Excluir">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
        
        <div class="product-info">
          <h4 class="product-name">${product.name}</h4>
          <p class="product-category">
            <i class="fas fa-tag"></i>
            ${categoryName}
          </p>
          
          ${product.price ? `
            <p class="product-price">
              R$ ${this.formatPrice(product.price)}
            </p>
          ` : ''}
          
          <div class="product-meta">
            <span class="product-status ${product.active ? 'active' : 'inactive'}">
              <i class="fas ${product.active ? 'fa-check-circle' : 'fa-pause-circle'}"></i>
              ${product.active ? 'Ativo' : 'Inativo'}
            </span>
            
            ${product.images && product.images.length > 1 ? `
              <span class="product-images-count">
                <i class="fas fa-images"></i>
                ${product.images.length} fotos
              </span>
            ` : ''}
          </div>
          
          <small class="product-date">
            Criado em ${this.formatDate(product.created_at)}
          </small>
        </div>
      </div>
    `;
  }

  renderCategoryOptions() {
    const selects = document.querySelectorAll('select[data-categories]');
    
    selects.forEach(select => {
      const currentValue = select.value;
      
      let html = '<option value="">Selecione uma categoria</option>';
      
      // Separar categorias pai e filhas
      const parentCategories = this.categories.filter(cat => !cat.parent_id);
      const childCategories = this.categories.filter(cat => cat.parent_id);
      
      parentCategories.forEach(parent => {
        html += `<option value="${parent.id}">${parent.name}</option>`;
        
        const children = childCategories.filter(child => child.parent_id === parent.id);
        children.forEach(child => {
          html += `<option value="${child.id}">└ ${child.name}</option>`;
        });
      });
      
      select.innerHTML = html;
      if (currentValue) {
        select.value = currentValue;
      }
    });
  }

  renderPagination() {
    const container = document.getElementById('products-pagination');
    if (!container) return;

    const totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    
    if (totalPages <= 1) {
      container.innerHTML = '';
      return;
    }

    let html = '<div class="pagination">';
    
    // Página anterior
    if (this.currentPage > 1) {
      html += `<button class="btn btn-sm" data-page="${this.currentPage - 1}">
        <i class="fas fa-chevron-left"></i>
      </button>`;
    }
    
    // Páginas numéricas
    const startPage = Math.max(1, this.currentPage - 2);
    const endPage = Math.min(totalPages, this.currentPage + 2);
    
    if (startPage > 1) {
      html += `<button class="btn btn-sm" data-page="1">1</button>`;
      if (startPage > 2) {
        html += '<span class="pagination-dots">...</span>';
      }
    }
    
    for (let i = startPage; i <= endPage; i++) {
      html += `<button class="btn btn-sm ${i === this.currentPage ? 'active' : ''}" data-page="${i}">
        ${i}
      </button>`;
    }
    
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        html += '<span class="pagination-dots">...</span>';
      }
      html += `<button class="btn btn-sm" data-page="${totalPages}">${totalPages}</button>`;
    }
    
    // Próxima página
    if (this.currentPage < totalPages) {
      html += `<button class="btn btn-sm" data-page="${this.currentPage + 1}">
        <i class="fas fa-chevron-right"></i>
      </button>`;
    }
    
    html += '</div>';
    
    // Info da paginação
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
    
    html += `<div class="pagination-info">
      Mostrando ${start}-${end} de ${this.totalItems} produtos
    </div>`;
    
    container.innerHTML = html;
  }

  showProductModal(productId = null) {
    const modal = document.getElementById('product-modal');
    if (!modal) return;

    // Limpar form
    const form = document.getElementById('product-form');
    if (form) {
      form.reset();
      this.clearImagePreview();
    }

    // Configurar título
    const title = modal.querySelector('.modal-title');
    if (title) {
      title.innerHTML = productId 
        ? '<i class="fas fa-edit"></i> Editar Produto'
        : '<i class="fas fa-plus"></i> Novo Produto';
    }

    // Configurar action do form
    if (form) {
      form.setAttribute('data-product-id', productId || '');
    }

    // Carregar dados se for edição
    if (productId) {
      this.loadProductData(productId);
    }

    adminUtils.openModal('product-modal');
  }

  async loadProductData(productId) {
    try {
      const data = await adminAPI.getProduct(productId);
      const product = data.product;
      
      // Preencher form
      const form = document.getElementById('product-form');
      if (form) {
        form.name.value = product.name || '';
        form.description.value = product.description || '';
        form.price.value = product.price || '';
        form.category_id.value = product.category_id || '';
        form.active.checked = product.active;
        form.featured.checked = product.featured;
        form.meta_title.value = product.meta_title || '';
        form.meta_description.value = product.meta_description || '';
      }
      
      // Mostrar imagens existentes
      if (product.images && product.images.length > 0) {
        this.showExistingImages(product.images, productId);
      }
      
    } catch (error) {
      console.error('Erro ao carregar produto:', error);
      adminUtils.showToast('Erro ao carregar dados do produto', 'error');
    }
  }

  showExistingImages(images, productId) {
    const container = document.getElementById('image-preview');
    if (!container) return;

    const html = images.map((image, index) => `
      <div class="image-preview-item" data-existing="true">
        <img src="/uploads/products/${image}" alt="Produto">
        <button type="button" class="remove-image" data-remove-image data-product-id="${productId}" data-image-index="${index}">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `).join('');

    container.innerHTML = html;
  }

  async handleProductSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const productId = form.getAttribute('data-product-id');
    const isEdit = !!productId;

    try {
      // Validar form
      if (!this.validateProductForm(form)) {
        return;
      }

      // Mostrar loading
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';

      // Preparar dados
      const formData = new FormData(form);
      
      // Adicionar arquivos de imagem
      const imageInput = document.getElementById('product-images');
      if (imageInput && imageInput.files.length > 0) {
        Array.from(imageInput.files).forEach(file => {
          formData.append('images', file);
        });
      }

      // Enviar dados
      let result;
      if (isEdit) {
        result = await adminAPI.updateProduct(productId, Object.fromEntries(formData));
      } else {
        result = await adminAPI.createProduct(Object.fromEntries(formData));
      }

      // Sucesso
      adminUtils.showToast(
        isEdit ? 'Produto atualizado com sucesso!' : 'Produto criado com sucesso!',
        'success'
      );
      
      adminUtils.closeModal('product-modal');
      this.loadProducts(this.currentPage);

    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      adminUtils.showToast(error.message || 'Erro ao salvar produto', 'error');
      
    } finally {
      // Restaurar botão
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  }

  validateProductForm(form) {
    const name = form.name.value.trim();
    const categoryId = form.category_id.value;

    if (!name) {
      adminUtils.showToast('Nome do produto é obrigatório', 'warning');
      form.name.focus();
      return false;
    }

    if (name.length < 3) {
      adminUtils.showToast('Nome deve ter pelo menos 3 caracteres', 'warning');
      form.name.focus();
      return false;
    }

    if (!categoryId) {
      adminUtils.showToast('Selecione uma categoria', 'warning');
      form.category_id.focus();
      return false;
    }

    return true;
  }

  async deleteProduct(productId) {
    const product = this.products.find(p => p.id == productId);
    if (!product) return;

    const confirmed = confirm(
      `Tem certeza que deseja excluir o produto "${product.name}"?\n\nEsta ação não pode ser desfeita.`
    );

    if (!confirmed) return;

    try {
      await adminAPI.deleteProduct(productId);
      adminUtils.showToast('Produto excluído com sucesso!', 'success');
      this.loadProducts(this.currentPage);
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      adminUtils.showToast(error.message || 'Erro ao excluir produto', 'error');
    }
  }

  async removeImage(button) {
    const productId = button.getAttribute('data-product-id');
    const imageIndex = parseInt(button.getAttribute('data-image-index'));

    if (!confirm('Deseja remover esta imagem?')) return;

    try {
      await adminAPI.removeProductImage(productId, imageIndex);
      button.closest('.image-preview-item').remove();
      adminUtils.showToast('Imagem removida com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao remover imagem:', error);
      adminUtils.showToast('Erro ao remover imagem', 'error');
    }
  }

  handleImageSelect(e) {
    const files = Array.from(e.target.files);
    this.showImagePreview(files);
  }

  showImagePreview(files) {
    const container = document.getElementById('image-preview');
    if (!container) return;

    // Manter imagens existentes
    const existingImages = container.querySelectorAll('[data-existing]');
    
    const newImagesHtml = files.map((file, index) => {
      const url = URL.createObjectURL(file);
      return `
        <div class="image-preview-item" data-new="true">
          <img src="${url}" alt="Nova imagem">
          <button type="button" class="remove-image" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
          </button>
        </div>
      `;
    }).join('');

    // Adicionar novas imagens após as existentes
    container.insertAdjacentHTML('beforeend', newImagesHtml);
  }

  clearImagePreview() {
    const container = document.getElementById('image-preview');
    if (container) {
      container.innerHTML = '';
    }
  }

  setupImageDragDrop() {
    const dropZone = document.getElementById('image-drop-zone');
    if (!dropZone) return;

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      dropZone.addEventListener(eventName, this.preventDefaults, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
      dropZone.addEventListener(eventName, () => dropZone.classList.add('drag-over'), false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropZone.addEventListener(eventName, () => dropZone.classList.remove('drag-over'), false);
    });

    dropZone.addEventListener('drop', this.handleDrop.bind(this), false);
  }

  preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  handleDrop(e) {
    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
    
    if (files.length > 0) {
      const imageInput = document.getElementById('product-images');
      if (imageInput) {
        // Criar novo FileList
        const dt = new DataTransfer();
        files.forEach(file => dt.items.add(file));
        imageInput.files = dt.files;
        
        this.showImagePreview(files);
      }
    }
  }

  applyFilters() {
    const categoryFilter = document.querySelector('[data-filter="category"]');
    const statusFilter = document.querySelector('[data-filter="status"]');
    
    this.currentFilters = {};
    
    if (categoryFilter && categoryFilter.value) {
      this.currentFilters.category_id = categoryFilter.value;
    }
    
    if (statusFilter && statusFilter.value) {
      this.currentFilters.active = statusFilter.value === 'active';
    }
    
    this.loadProducts(1);
  }

  changePage(page) {
    if (page !== this.currentPage) {
      this.loadProducts(page);
    }
  }

  // Utilitários
  formatPrice(price) {
    return parseFloat(price).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('pt-BR');
  }

  showLoading() {
    const container = document.getElementById('products-grid');
    if (container) {
      container.innerHTML = `
        <div class="loading-spinner">
          <i class="fas fa-spinner fa-spin"></i>
          <p>Carregando produtos...</p>
        </div>
      `;
    }
  }

  hideLoading() {
    // O loading será substituído pelo conteúdo
  }

  clearCache() {
    this.cache.clear();
    this.products = [];
  }
}

// Inicializar gerenciamento de produtos
document.addEventListener('DOMContentLoaded', () => {
  window.adminProducts = new AdminProducts();
});