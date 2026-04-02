/**
 * 🎯 TECH10 ADMIN MAIN
 * Controlador principal da interface administrativa
 */

class AdminMain {
  constructor() {
    this.currentSection = 'dashboard';
    this.sidebarCollapsed = false;
    this.mobileMenuOpen = false;
    this.init();
  }

  init() {
    this.bindEvents();
    this.setupSidebar();
    this.setupResponsive();
    this.loadUserPreferences();
    this.initializeCurrentSection();
  }

  bindEvents() {
    // Navegação da sidebar
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-section]')) {
        e.preventDefault();
        const section = e.target.getAttribute('data-section');
        this.switchSection(section);
      }
    });

    // Toggle da sidebar
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-toggle-sidebar]')) {
        this.toggleSidebar();
      }
    });

    // Menu mobile
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-toggle-mobile-menu]')) {
        this.toggleMobileMenu();
      }
    });

    // Fechar menu mobile ao clicar fora
    document.addEventListener('click', (e) => {
      if (this.mobileMenuOpen && !e.target.closest('.sidebar') && !e.target.matches('[data-toggle-mobile-menu]')) {
        this.closeMobileMenu();
      }
    });

    // Busca global
    const globalSearch = document.getElementById('global-search');
    if (globalSearch) {
      let searchTimeout;
      globalSearch.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          this.performGlobalSearch(e.target.value);
        }, 500);
      });
    }

    // Atalhos de teclado
    this.setupKeyboardShortcuts();

    // Eventos de resize
    window.addEventListener('resize', this.handleResize.bind(this));
  }

  switchSection(sectionName) {
    if (this.currentSection === sectionName) return;

    // Validar seção
    const validSections = ['dashboard', 'products', 'categories', 'settings', 'reports'];
    if (!validSections.includes(sectionName)) {
      console.error('Seção inválida:', sectionName);
      return;
    }

    // Atualizar estado
    const previousSection = this.currentSection;
    this.currentSection = sectionName;

    // Atualizar interface
    this.updateSidebarActive(sectionName);
    this.updateContentSection(sectionName);
    this.updatePageTitle(sectionName);

    // Fechar menu mobile se aberto
    if (this.mobileMenuOpen) {
      this.closeMobileMenu();
    }

    // Salvar preferência
    adminUtils.saveToStorage('currentSection', sectionName);

    // Carregar dados da seção
    this.loadSectionData(sectionName);

    // Event customizado
    this.dispatchSectionChange(previousSection, sectionName);
  }

  updateSidebarActive(sectionName) {
    // Remover active de todos os itens
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
      item.classList.remove('active');
    });

    // Adicionar active ao item atual
    const activeItem = document.querySelector(`[data-section="${sectionName}"]`)?.closest('.nav-item');
    if (activeItem) {
      activeItem.classList.add('active');
    }
  }

  updateContentSection(sectionName) {
    // Esconder todas as seções
    document.querySelectorAll('.content-section').forEach(section => {
      section.hidden = true;
      section.classList.remove('active');
    });

    // Mostrar seção atual
    const currentSection = document.getElementById(`${sectionName}-section`);
    if (currentSection) {
      currentSection.hidden = false;
      currentSection.classList.add('active');
    }
  }

  updatePageTitle(sectionName) {
    const titles = {
      dashboard: 'Dashboard',
      products: 'Produtos',
      categories: 'Categorias',
      settings: 'Configurações',
      reports: 'Relatórios'
    };

    const title = titles[sectionName] || sectionName;
    document.title = `${title} - Tech10 Admin`;

    // Atualizar breadcrumb se existir
    const breadcrumb = document.querySelector('.breadcrumb-current');
    if (breadcrumb) {
      breadcrumb.textContent = title;
    }
  }

  loadSectionData(sectionName) {
    switch (sectionName) {
      case 'dashboard':
        if (window.adminDashboard) {
          adminDashboard.loadDashboard();
        }
        break;
        
      case 'products':
        if (window.adminProducts) {
          adminProducts.loadProducts();
        }
        break;
        
      case 'categories':
        if (window.adminCategories) {
          adminCategories.loadCategories();
        }
        break;
        
      case 'settings':
        if (window.adminSettings) {
          adminSettings.loadSettings();
        }
        break;
        
      case 'reports':
        this.loadReports();
        break;
    }
  }

  dispatchSectionChange(previousSection, currentSection) {
    const event = new CustomEvent('sectionChange', {
      detail: {
        previous: previousSection,
        current: currentSection
      }
    });
    document.dispatchEvent(event);
  }

  // SIDEBAR
  setupSidebar() {
    // Restaurar estado da sidebar
    const collapsed = adminUtils.loadFromStorage('sidebarCollapsed', false);
    if (collapsed) {
      this.collapseSidebar(false);
    }
  }

  toggleSidebar() {
    if (this.sidebarCollapsed) {
      this.expandSidebar();
    } else {
      this.collapseSidebar();
    }
  }

  collapseSidebar(animate = true) {
    const sidebar = document.querySelector('.sidebar');
    const main = document.querySelector('.main-content');
    
    if (sidebar) {
      sidebar.classList.add('collapsed');
      if (animate) {
        sidebar.style.transition = 'width 0.3s ease';
      }
    }
    
    if (main) {
      main.classList.add('sidebar-collapsed');
      if (animate) {
        main.style.transition = 'margin-left 0.3s ease';
      }
    }

    this.sidebarCollapsed = true;
    adminUtils.saveToStorage('sidebarCollapsed', true);

    // Remover transição após animação
    if (animate) {
      setTimeout(() => {
        if (sidebar) sidebar.style.transition = '';
        if (main) main.style.transition = '';
      }, 300);
    }
  }

  expandSidebar(animate = true) {
    const sidebar = document.querySelector('.sidebar');
    const main = document.querySelector('.main-content');
    
    if (sidebar) {
      sidebar.classList.remove('collapsed');
      if (animate) {
        sidebar.style.transition = 'width 0.3s ease';
      }
    }
    
    if (main) {
      main.classList.remove('sidebar-collapsed');
      if (animate) {
        main.style.transition = 'margin-left 0.3s ease';
      }
    }

    this.sidebarCollapsed = false;
    adminUtils.saveToStorage('sidebarCollapsed', false);

    // Remover transição após animação
    if (animate) {
      setTimeout(() => {
        if (sidebar) sidebar.style.transition = '';
        if (main) main.style.transition = '';
      }, 300);
    }
  }

  // MOBILE MENU
  toggleMobileMenu() {
    if (this.mobileMenuOpen) {
      this.closeMobileMenu();
    } else {
      this.openMobileMenu();
    }
  }

  openMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.mobile-overlay') || this.createMobileOverlay();
    
    sidebar?.classList.add('mobile-open');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    this.mobileMenuOpen = true;
  }

  closeMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.mobile-overlay');
    
    sidebar?.classList.remove('mobile-open');
    overlay?.classList.remove('active');
    document.body.style.overflow = '';
    
    this.mobileMenuOpen = false;
  }

  createMobileOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'mobile-overlay';
    overlay.addEventListener('click', () => this.closeMobileMenu());
    document.body.appendChild(overlay);
    return overlay;
  }

  // RESPONSIVE
  setupResponsive() {
    this.handleResize();
  }

  handleResize() {
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
      // Em mobile, sempre colapsar sidebar
      this.collapseSidebar(false);
      // Fechar menu mobile se aberto
      if (this.mobileMenuOpen) {
        this.closeMobileMenu();
      }
    } else {
      // Em desktop, restaurar estado da sidebar
      const shouldBeCollapsed = adminUtils.loadFromStorage('sidebarCollapsed', false);
      if (shouldBeCollapsed && !this.sidebarCollapsed) {
        this.collapseSidebar(false);
      } else if (!shouldBeCollapsed && this.sidebarCollapsed) {
        this.expandSidebar(false);
      }
    }
  }

  // BUSCA GLOBAL
  async performGlobalSearch(query) {
    if (!query || query.length < 2) {
      this.clearSearchResults();
      return;
    }

    try {
      // Mostrar loading na busca
      this.showSearchLoading();

      // Simular busca (implementar com API real)
      const results = await this.searchContent(query);
      
      this.displaySearchResults(results);
    } catch (error) {
      console.error('Erro na busca:', error);
      this.clearSearchResults();
    }
  }

  async searchContent(query) {
    // TODO: Implementar busca real nas APIs
    // Por enquanto, busca mockada
    const mockResults = [
      {
        type: 'product',
        title: `Produto relacionado a "${query}"`,
        description: 'Descrição do produto encontrado',
        url: '#products',
        section: 'products'
      },
      {
        type: 'category',
        title: `Categoria "${query}"`,
        description: 'Categoria encontrada',
        url: '#categories',
        section: 'categories'
      }
    ];

    // Simular delay da API
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return mockResults.filter(result => 
      result.title.toLowerCase().includes(query.toLowerCase())
    );
  }

  showSearchLoading() {
    const dropdown = this.getSearchDropdown();
    dropdown.innerHTML = `
      <div class="search-loading">
        <i class="fas fa-spinner fa-spin"></i>
        <span>Buscando...</span>
      </div>
    `;
    dropdown.classList.add('show');
  }

  displaySearchResults(results) {
    const dropdown = this.getSearchDropdown();
    
    if (results.length === 0) {
      dropdown.innerHTML = `
        <div class="search-no-results">
          <i class="fas fa-search"></i>
          <span>Nenhum resultado encontrado</span>
        </div>
      `;
    } else {
      const html = results.map(result => `
        <div class="search-result-item" data-section="${result.section}">
          <div class="search-result-icon">
            <i class="fas ${this.getSearchResultIcon(result.type)}"></i>
          </div>
          <div class="search-result-content">
            <div class="search-result-title">${result.title}</div>
            <div class="search-result-description">${result.description}</div>
          </div>
        </div>
      `).join('');
      
      dropdown.innerHTML = html;
    }
    
    dropdown.classList.add('show');
  }

  clearSearchResults() {
    const dropdown = this.getSearchDropdown();
    dropdown.classList.remove('show');
    dropdown.innerHTML = '';
  }

  getSearchDropdown() {
    let dropdown = document.getElementById('search-dropdown');
    if (!dropdown) {
      dropdown = document.createElement('div');
      dropdown.id = 'search-dropdown';
      dropdown.className = 'search-dropdown';
      
      const searchContainer = document.querySelector('.global-search-container');
      if (searchContainer) {
        searchContainer.appendChild(dropdown);
      }
    }
    return dropdown;
  }

  getSearchResultIcon(type) {
    const icons = {
      product: 'fa-box',
      category: 'fa-folder',
      setting: 'fa-cog',
      user: 'fa-user'
    };
    return icons[type] || 'fa-file';
  }

  // ATALHOS DE TECLADO
  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Alt + D = Dashboard
      if (e.altKey && e.key === 'd') {
        e.preventDefault();
        this.switchSection('dashboard');
      }

      // Alt + P = Produtos
      if (e.altKey && e.key === 'p') {
        e.preventDefault();
        this.switchSection('products');
      }

      // Alt + C = Categorias
      if (e.altKey && e.key === 'c') {
        e.preventDefault();
        this.switchSection('categories');
      }

      // Alt + S = Configurações
      if (e.altKey && e.key === 's') {
        e.preventDefault();
        this.switchSection('settings');
      }

      // Ctrl/Cmd + B = Toggle Sidebar
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        this.toggleSidebar();
      }
    });
  }

  // PREFERÊNCIAS DO USUÁRIO
  loadUserPreferences() {
    // Restaurar seção atual
    const savedSection = adminUtils.loadFromStorage('currentSection', 'dashboard');
    if (savedSection !== this.currentSection) {
      this.switchSection(savedSection);
    }

    // Restaurar tema
    const theme = adminUtils.getTheme();
    document.documentElement.setAttribute('data-theme', theme);
  }

  initializeCurrentSection() {
    // Garantir que a seção atual está ativa
    this.updateSidebarActive(this.currentSection);
    this.updateContentSection(this.currentSection);
    this.updatePageTitle(this.currentSection);
    
    // Carregar dados iniciais
    this.loadSectionData(this.currentSection);
  }

  // RELATÓRIOS (seção básica)
  async loadReports() {
    const reportsSection = document.getElementById('reports-section');
    if (!reportsSection) return;

    try {
      // Mostrar loading
      reportsSection.innerHTML = `
        <div class="loading-spinner">
          <i class="fas fa-spinner fa-spin"></i>
          <p>Carregando relatórios...</p>
        </div>
      `;

      // Simular carregamento
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mostrar interface básica de relatórios
      reportsSection.innerHTML = `
        <div class="reports-header">
          <h2>
            <i class="fas fa-chart-line"></i>
            Relatórios
          </h2>
          <p>Análises e relatórios do sistema</p>
        </div>
        
        <div class="reports-grid">
          <div class="report-card">
            <div class="report-icon">
              <i class="fas fa-box"></i>
            </div>
            <div class="report-info">
              <h4>Relatório de Produtos</h4>
              <p>Análise completa dos produtos cadastrados</p>
              <button class="btn btn-primary btn-sm">
                <i class="fas fa-download"></i>
                Gerar Relatório
              </button>
            </div>
          </div>
          
          <div class="report-card">
            <div class="report-icon">
              <i class="fas fa-chart-bar"></i>
            </div>
            <div class="report-info">
              <h4>Análise de Categorias</h4>
              <p>Distribuição e performance das categorias</p>
              <button class="btn btn-primary btn-sm">
                <i class="fas fa-download"></i>
                Gerar Relatório
              </button>
            </div>
          </div>
          
          <div class="report-card">
            <div class="report-icon">
              <i class="fas fa-activity"></i>
            </div>
            <div class="report-info">
              <h4>Log de Atividades</h4>
              <p>Histórico de ações no sistema</p>
              <button class="btn btn-primary btn-sm">
                <i class="fas fa-download"></i>
                Gerar Relatório
              </button>
            </div>
          </div>
        </div>
      `;

    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
      reportsSection.innerHTML = `
        <div class="error-state">
          <i class="fas fa-exclamation-triangle"></i>
          <h3>Erro ao carregar relatórios</h3>
          <p>Tente novamente mais tarde</p>
        </div>
      `;
    }
  }

  // LIMPEZA
  destroy() {
    // Remover event listeners
    window.removeEventListener('resize', this.handleResize);
    
    // Restaurar estilos do body
    document.body.style.overflow = '';
    
    // Fechar modais
    adminUtils.closeAllModals();
  }
}

// Inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  // Aguardar outros módulos carregarem
  setTimeout(() => {
    window.adminMain = new AdminMain();
  }, 100);
});