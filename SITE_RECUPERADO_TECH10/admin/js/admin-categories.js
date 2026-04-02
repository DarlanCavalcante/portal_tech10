/**
 * 🏷️ TECH10 ADMIN CATEGORIAS
 * Gerenciamento de categorias
 */

class AdminCategories {
  constructor() {
    this.categories = [];
    this.flatCategories = [];
    this.sortable = null;
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
      if (e.target.matches('[data-add-category]')) {
        this.showCategoryModal();
      }
      
      if (e.target.matches('[data-edit-category]')) {
        const id = e.target.getAttribute('data-edit-category');
        this.editCategory(id);
      }
      
      if (e.target.matches('[data-delete-category]')) {
        const id = e.target.getAttribute('data-delete-category');
        this.deleteCategory(id);
      }
      
      if (e.target.matches('[data-view-category-stats]')) {
        const id = e.target.getAttribute('data-view-category-stats');
        this.viewCategoryStats(id);
      }

      if (e.target.matches('[data-toggle-category]')) {
        const item = e.target.closest('.category-item');
        this.toggleCategory(item);
      }
    });

    // Form de categoria
    const categoryForm = document.getElementById('category-form');
    if (categoryForm) {
      categoryForm.addEventListener('submit', this.handleCategorySubmit.bind(this));
    }

    // Busca
    const searchInput = document.getElementById('category-search');
    if (searchInput) {
      let searchTimeout;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          this.filterCategories(e.target.value);
        }, 300);
      });
    }
  }

  async loadCategories() {
    try {
      this.showLoading();
      
      const data = await adminAPI.getCategories();
      this.flatCategories = data.categories;
      this.categories = this.buildCategoryTree(data.categories);
      
      this.renderCategories();
      this.setupSortable();
      
      this.hideLoading();
      
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      this.hideLoading();
      adminUtils.showToast('Erro ao carregar categorias', 'error');
    }
  }

  buildCategoryTree(categories) {
    const tree = [];
    const map = new Map();
    
    // Criar mapa de categorias
    categories.forEach(category => {
      map.set(category.id, { ...category, children: [] });
    });
    
    // Construir árvore
    categories.forEach(category => {
      const node = map.get(category.id);
      
      if (category.parent_id) {
        const parent = map.get(category.parent_id);
        if (parent) {
          parent.children.push(node);
        }
      } else {
        tree.push(node);
      }
    });
    
    return tree;
  }

  renderCategories() {
    const container = document.getElementById('categories-tree');
    if (!container) return;

    if (this.categories.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-folder-open"></i>
          <h3>Nenhuma categoria encontrada</h3>
          <p>Comece organizando seus produtos criando categorias</p>
          <button class="btn btn-primary" data-add-category>
            <i class="fas fa-plus"></i>
            Nova Categoria
          </button>
        </div>
      `;
      return;
    }

    const html = this.categories.map(category => 
      this.renderCategoryNode(category, 0)
    ).join('');
    
    container.innerHTML = `<div class="category-tree sortable">${html}</div>`;
  }

  renderCategoryNode(category, level = 0) {
    const hasChildren = category.children && category.children.length > 0;
    const indent = level * 20;
    
    let html = `
      <div class="category-item" data-category-id="${category.id}" data-level="${level}">
        <div class="category-content" style="padding-left: ${indent}px">
          <div class="category-info">
            ${hasChildren ? `
              <button class="category-toggle" data-toggle-category>
                <i class="fas fa-chevron-right"></i>
              </button>
            ` : '<span class="category-spacer"></span>'}
            
            <div class="category-icon">
              <i class="fas ${category.icon || 'fa-folder'}"></i>
            </div>
            
            <div class="category-details">
              <h4 class="category-name">${category.name}</h4>
              ${category.description ? `
                <p class="category-description">${category.description}</p>
              ` : ''}
              <div class="category-meta">
                <span class="category-products-count">
                  <i class="fas fa-box"></i>
                  ${category.product_count || 0} produtos
                </span>
                <span class="category-order">
                  Ordem: ${category.sort_order || 0}
                </span>
              </div>
            </div>
          </div>
          
          <div class="category-actions">
            <button class="btn btn-sm btn-info" data-view-category-stats="${category.id}" title="Estatísticas">
              <i class="fas fa-chart-bar"></i>
            </button>
            <button class="btn btn-sm btn-warning" data-edit-category="${category.id}" title="Editar">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-danger" data-delete-category="${category.id}" title="Excluir">
              <i class="fas fa-trash"></i>
            </button>
            <div class="drag-handle" title="Arrastar para reordenar">
              <i class="fas fa-grip-vertical"></i>
            </div>
          </div>
        </div>
        
        ${hasChildren ? `
          <div class="category-children">
            ${category.children.map(child => 
              this.renderCategoryNode(child, level + 1)
            ).join('')}
          </div>
        ` : ''}
      </div>
    `;
    
    return html;
  }

  setupSortable() {
    const container = document.querySelector('.category-tree.sortable');
    if (!container) return;

    // Destruir sortable anterior
    if (this.sortable) {
      this.sortable.destroy();
    }

    this.sortable = new Sortable(container, {
      animation: 150,
      handle: '.drag-handle',
      ghostClass: 'sortable-ghost',
      chosenClass: 'sortable-chosen',
      dragClass: 'sortable-drag',
      
      onEnd: (evt) => {
        this.handleCategoryReorder(evt);
      }
    });
  }

  async handleCategoryReorder(evt) {
    try {
      // Coletar nova ordem
      const items = Array.from(evt.to.children);
      const categories = items.map((item, index) => ({
        id: parseInt(item.getAttribute('data-category-id')),
        sort_order: index + 1
      }));

      await adminAPI.reorderCategories(categories);
      adminUtils.showToast('Ordem das categorias atualizada!', 'success');
      
      // Recarregar para refletir mudanças
      this.loadCategories();
      
    } catch (error) {
      console.error('Erro ao reordenar categorias:', error);
      adminUtils.showToast('Erro ao atualizar ordem', 'error');
      
      // Reverter mudança visual
      this.renderCategories();
    }
  }

  toggleCategory(item) {
    const children = item.querySelector('.category-children');
    const toggle = item.querySelector('.category-toggle i');
    
    if (children) {
      const isExpanded = !children.hidden;
      children.hidden = isExpanded;
      toggle.className = isExpanded ? 'fas fa-chevron-right' : 'fas fa-chevron-down';
    }
  }

  showCategoryModal(categoryId = null) {
    const modal = document.getElementById('category-modal');
    if (!modal) return;

    // Limpar form
    const form = document.getElementById('category-form');
    if (form) {
      form.reset();
    }

    // Configurar título
    const title = modal.querySelector('.modal-title');
    if (title) {
      title.innerHTML = categoryId 
        ? '<i class="fas fa-edit"></i> Editar Categoria'
        : '<i class="fas fa-plus"></i> Nova Categoria';
    }

    // Configurar action do form
    if (form) {
      form.setAttribute('data-category-id', categoryId || '');
    }

    // Popular select de categoria pai
    this.populateParentSelect(categoryId);

    // Carregar dados se for edição
    if (categoryId) {
      this.loadCategoryData(categoryId);
    }

    adminUtils.openModal('category-modal');
  }

  populateParentSelect(excludeId = null) {
    const select = document.getElementById('category-parent');
    if (!select) return;

    let html = '<option value="">Categoria principal (sem pai)</option>';
    
    // Filtrar categoria atual para evitar loop
    const availableCategories = this.flatCategories.filter(cat => 
      cat.id != excludeId
    );
    
    // Separar por níveis
    const parentCategories = availableCategories.filter(cat => !cat.parent_id);
    const childCategories = availableCategories.filter(cat => cat.parent_id);
    
    parentCategories.forEach(parent => {
      html += `<option value="${parent.id}">${parent.name}</option>`;
      
      const children = childCategories.filter(child => child.parent_id === parent.id);
      children.forEach(child => {
        // Evitar mais de 2 níveis
        if (excludeId != child.id) {
          html += `<option value="${child.id}">└ ${child.name}</option>`;
        }
      });
    });
    
    select.innerHTML = html;
  }

  async loadCategoryData(categoryId) {
    try {
      const data = await adminAPI.getCategory(categoryId);
      const category = data.category;
      
      // Preencher form
      const form = document.getElementById('category-form');
      if (form) {
        form.name.value = category.name || '';
        form.description.value = category.description || '';
        form.parent_id.value = category.parent_id || '';
        form.icon.value = category.icon || '';
        form.color.value = category.color || '#007bff';
        form.active.checked = category.active;
        form.meta_title.value = category.meta_title || '';
        form.meta_description.value = category.meta_description || '';
      }
      
    } catch (error) {
      console.error('Erro ao carregar categoria:', error);
      adminUtils.showToast('Erro ao carregar dados da categoria', 'error');
    }
  }

  async handleCategorySubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const categoryId = form.getAttribute('data-category-id');
    const isEdit = !!categoryId;

    try {
      // Validar form
      if (!this.validateCategoryForm(form)) {
        return;
      }

      // Mostrar loading
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';

      // Preparar dados
      const formData = new FormData(form);
      const categoryData = Object.fromEntries(formData);
      
      // Converter checkbox
      categoryData.active = form.active.checked;

      // Enviar dados
      let result;
      if (isEdit) {
        result = await adminAPI.updateCategory(categoryId, categoryData);
      } else {
        result = await adminAPI.createCategory(categoryData);
      }

      // Sucesso
      adminUtils.showToast(
        isEdit ? 'Categoria atualizada com sucesso!' : 'Categoria criada com sucesso!',
        'success'
      );
      
      adminUtils.closeModal('category-modal');
      this.loadCategories();

    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      adminUtils.showToast(error.message || 'Erro ao salvar categoria', 'error');
      
    } finally {
      // Restaurar botão
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  }

  validateCategoryForm(form) {
    const name = form.name.value.trim();

    if (!name) {
      adminUtils.showToast('Nome da categoria é obrigatório', 'warning');
      form.name.focus();
      return false;
    }

    if (name.length < 2) {
      adminUtils.showToast('Nome deve ter pelo menos 2 caracteres', 'warning');
      form.name.focus();
      return false;
    }

    // Verificar se não é pai de si mesma
    const categoryId = form.getAttribute('data-category-id');
    const parentId = form.parent_id.value;
    
    if (categoryId && parentId && categoryId === parentId) {
      adminUtils.showToast('Uma categoria não pode ser pai de si mesma', 'warning');
      form.parent_id.focus();
      return false;
    }

    return true;
  }

  async deleteCategory(categoryId) {
    const category = this.flatCategories.find(c => c.id == categoryId);
    if (!category) return;

    // Verificar se tem produtos ou subcategorias
    const hasProducts = category.product_count > 0;
    const hasChildren = this.flatCategories.some(c => c.parent_id == categoryId);

    let message = `Tem certeza que deseja excluir a categoria "${category.name}"?`;
    
    if (hasProducts) {
      message += `\n\nEsta categoria possui ${category.product_count} produtos que ficarão sem categoria.`;
    }
    
    if (hasChildren) {
      message += `\n\nEsta categoria possui subcategorias que serão movidas para o nível principal.`;
    }
    
    message += '\n\nEsta ação não pode ser desfeita.';

    const confirmed = confirm(message);
    if (!confirmed) return;

    try {
      await adminAPI.deleteCategory(categoryId);
      adminUtils.showToast('Categoria excluída com sucesso!', 'success');
      this.loadCategories();
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
      adminUtils.showToast(error.message || 'Erro ao excluir categoria', 'error');
    }
  }

  async viewCategoryStats(categoryId) {
    try {
      const data = await adminAPI.getCategoryStats(categoryId);
      const category = this.flatCategories.find(c => c.id == categoryId);
      
      if (!category) return;

      // Mostrar modal com estatísticas
      const modal = document.getElementById('category-stats-modal');
      if (!modal) return;

      // Atualizar título
      const title = modal.querySelector('.modal-title');
      if (title) {
        title.innerHTML = `<i class="fas fa-chart-bar"></i> Estatísticas - ${category.name}`;
      }

      // Atualizar conteúdo
      const content = modal.querySelector('.modal-body');
      if (content) {
        content.innerHTML = this.renderCategoryStats(data.stats, category);
      }

      adminUtils.openModal('category-stats-modal');
      
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      adminUtils.showToast('Erro ao carregar estatísticas', 'error');
    }
  }

  renderCategoryStats(stats, category) {
    return `
      <div class="stats-overview">
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-box"></i>
          </div>
          <div class="stat-info">
            <div class="stat-value">${stats.totalProducts || 0}</div>
            <div class="stat-label">Total de Produtos</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-eye"></i>
          </div>
          <div class="stat-info">
            <div class="stat-value">${stats.totalViews || 0}</div>
            <div class="stat-label">Visualizações</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-calendar"></i>
          </div>
          <div class="stat-info">
            <div class="stat-value">${stats.productsThisMonth || 0}</div>
            <div class="stat-label">Produtos Este Mês</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-star"></i>
          </div>
          <div class="stat-info">
            <div class="stat-value">${stats.featuredProducts || 0}</div>
            <div class="stat-label">Produtos em Destaque</div>
          </div>
        </div>
      </div>
      
      <div class="stats-details">
        <h4>Informações da Categoria</h4>
        <table class="table">
          <tr>
            <td><strong>Nome:</strong></td>
            <td>${category.name}</td>
          </tr>
          <tr>
            <td><strong>Descrição:</strong></td>
            <td>${category.description || 'Não informada'}</td>
          </tr>
          <tr>
            <td><strong>Slug:</strong></td>
            <td>${category.slug || 'Não definido'}</td>
          </tr>
          <tr>
            <td><strong>Status:</strong></td>
            <td>
              <span class="badge ${category.active ? 'badge-success' : 'badge-secondary'}">
                ${category.active ? 'Ativa' : 'Inativa'}
              </span>
            </td>
          </tr>
          <tr>
            <td><strong>Criada em:</strong></td>
            <td>${this.formatDate(category.created_at)}</td>
          </tr>
          <tr>
            <td><strong>Última atualização:</strong></td>
            <td>${this.formatDate(category.updated_at)}</td>
          </tr>
        </table>
      </div>
    `;
  }

  filterCategories(searchTerm) {
    const items = document.querySelectorAll('.category-item');
    const term = searchTerm.toLowerCase();

    items.forEach(item => {
      const name = item.querySelector('.category-name').textContent.toLowerCase();
      const description = item.querySelector('.category-description')?.textContent.toLowerCase() || '';
      
      const matches = name.includes(term) || description.includes(term);
      item.style.display = matches ? 'block' : 'none';
    });
  }

  // Utilitários
  formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  showLoading() {
    const container = document.getElementById('categories-tree');
    if (container) {
      container.innerHTML = `
        <div class="loading-spinner">
          <i class="fas fa-spinner fa-spin"></i>
          <p>Carregando categorias...</p>
        </div>
      `;
    }
  }

  hideLoading() {
    // O loading será substituído pelo conteúdo
  }

  clearCache() {
    this.cache.clear();
    this.categories = [];
    this.flatCategories = [];
  }
}

// Inicializar gerenciamento de categorias
document.addEventListener('DOMContentLoaded', () => {
  window.adminCategories = new AdminCategories();
});