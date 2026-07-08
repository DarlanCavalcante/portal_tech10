/**
 * produtos-page.js — Lógica da página de produtos (produtos.html)
 * - Carrega árvore de categorias da API
 * - Renderiza sidebar pai/filho/neto
 * - Carrega e filtra produtos com paginação
 * - Sincroniza busca com debounce
 * Carregue APÓS: api-config.js, api-adapter.js, load-products.js, product-modal.js
 */
(function (global) {
  'use strict';

  var PAGE_LIMIT = 20;
  var _offset = 0;
  var _activeHandle = 'all';
  var _activeLabel = 'Todos';
  var _allProducts = []; // todos carregados para sort/filter client-side
  var _currentProducts = []; // após filtro/sort
  var _searchDebounce = null;
  var _sortValue = 'featured';
  var _totalFromApi = 0;

  function _getSearchInput() {
    return document.getElementById('pp-search');
  }

  function _getCurrentSearchTerm() {
    var searchInput = _getSearchInput();
    return searchInput ? String(searchInput.value || '').toLowerCase().trim() : '';
  }

  function _syncListingUrlState() {
    try {
      var url = new URL(window.location.href);
      if (_activeHandle === 'all') url.searchParams.delete('category');
      else url.searchParams.set('category', _activeHandle);

      var searchTerm = _getCurrentSearchTerm();
      if (searchTerm) {
        url.searchParams.set('search', searchTerm);
      } else {
        url.searchParams.delete('search');
      }
      url.searchParams.delete('q');

      history.replaceState(null, '', url.toString());
    } catch (e) {}
  }

  function _matchesSearch(product, term) {
    if (!term) return true;

    var metadata = product && product.metadata ? product.metadata : {};
    var haystack = [
      product && product.title,
      product && product.description,
      metadata.brand,
      metadata.sku,
      product && product.category && (product.category.name || product.category.handle),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return haystack.indexOf(term) !== -1;
  }

  function _normalizeHandle(value) {
    if (global.MarketplaceAdapter && global.MarketplaceAdapter.normalizeCategoryHandle) {
      return global.MarketplaceAdapter.normalizeCategoryHandle(value);
    }
    return String(value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[>:]+/g, '-')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'outros';
  }

  function _iconForCategory(handle) {
    var normalized = _normalizeHandle(handle);
    if (normalized.indexOf('cabo') !== -1) return '🔌';
    if (normalized.indexOf('mouse') !== -1) return '🖱️';
    if (normalized.indexOf('rede') !== -1 || normalized.indexOf('equipamento') !== -1) return '📶';
    if (normalized.indexOf('veiculo') !== -1) return '🚗';
    return '📦';
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Inicialização
  // ─────────────────────────────────────────────────────────────────────────
  function init() {
    if (document.body) {
      document.body.classList.add('loaded');
    }

    // Ler parâmetro de URL: ?category=handle
    var params = new URLSearchParams(window.location.search);
    var initCat = params.get('category') || 'all';
    var initSearch = params.get('search') || params.get('q') || '';
    _activeHandle = initCat;

    // Carregar categorias
    _loadCategories().then(function () {
      _setActiveCategory(_activeHandle, _activeLabel);
    });

    // Carregar produtos
    _loadAllProducts();

    // Eventos
    var searchInput = _getSearchInput();
    if (searchInput) {
      searchInput.value = initSearch;
      searchInput.addEventListener('input', function () {
        clearTimeout(_searchDebounce);
        _searchDebounce = setTimeout(function () {
          _applyFilterAndRender();
        }, 300);
      });
      searchInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
          event.preventDefault();
          clearTimeout(_searchDebounce);
          _applyFilterAndRender();
        }
      });
    }

    var searchSubmit = document.getElementById('pp-search-submit');
    if (searchSubmit) {
      searchSubmit.addEventListener('click', function () {
        clearTimeout(_searchDebounce);
        _applyFilterAndRender();
        if (searchInput) {
          searchInput.focus();
        }
      });
    }

    var sortSel = document.getElementById('pp-sort');
    if (sortSel) {
      sortSel.value = _sortValue;
      sortSel.addEventListener('change', function () {
        _sortValue = sortSel.value;
        _applyFilterAndRender();
      });
    }

    var loadMoreBtn = document.getElementById('pp-btn-load-more');
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', function () {
        _offset += PAGE_LIMIT;
        _renderPage();
      });
    }

    // Mobile: toggle sidebar com overlay
    var filterToggle = document.getElementById('pp-filter-toggle');
    var sidebar = document.getElementById('pp-sidebar');
    var overlay = document.getElementById('pp-sidebar-overlay');
    function closeSidebar() {
      if (sidebar) sidebar.classList.remove('open');
      if (overlay) overlay.classList.remove('visible');
    }
    if (filterToggle && sidebar) {
      filterToggle.addEventListener('click', function () {
        var isOpen = sidebar.classList.contains('open');
        if (isOpen) {
          closeSidebar();
        } else {
          sidebar.classList.add('open');
          if (overlay) overlay.classList.add('visible');
        }
      });
    }
    if (overlay) {
      overlay.addEventListener('click', closeSidebar);
    }

    _setupHeaderMenu();

    // Atualizar contador do carrinho
    _updateCartCount();
  }

  function _setupHeaderMenu() {
    var menuToggle = document.getElementById('menuToggle');
    var nav = document.querySelector('.pp-store-nav');

    if (!menuToggle || !nav) return;

    menuToggle.addEventListener('click', function () {
      nav.classList.toggle('active');
      menuToggle.classList.toggle('active');
    });

    nav.querySelectorAll('.nav-link').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('active');
        menuToggle.classList.remove('active');
      });
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Carregar árvore de categorias
  // ─────────────────────────────────────────────────────────────────────────
  async function _loadCategories() {
    var listEl = document.getElementById('pp-cat-list');
    var loadingEl = document.getElementById('pp-cat-loading');
    var adapter = global.MarketplaceAdapter;

    if (adapter && adapter.getCategories) {
      try {
        var tenantCategories = await adapter.getCategories();
        if (tenantCategories && tenantCategories.length > 0) {
          if (loadingEl) loadingEl.style.display = 'none';
          _renderTenantCategoryList(tenantCategories, listEl);
          return;
        }
      } catch (err) {
        console.warn('[produtos-page] tenant categories:', err);
      }
    }

    var config = global.API_CONFIG || {};
    var baseUrl = config.ACTIVE_URL || window.location.origin;

    try {
      var res = await fetch(baseUrl + '/api/store/categories/tree');
      if (!res.ok) throw new Error('HTTP ' + res.status);
      var data = await res.json();
      var cats = data.categories || [];
      if (loadingEl) loadingEl.style.display = 'none';
      _renderCategoryTree(cats, listEl);
    } catch (err) {
      console.warn('[produtos-page] Categorias:', err);
      if (loadingEl) loadingEl.style.display = 'none';
      // Fallback: categorias tech estáticas
      _renderCategoryTree([
        { name: 'Eletrônicos & Tecnologia', handle: 'eletronicos-tecnologia', icon: '💻', children: [
          { name: 'Computadores', handle: 'computadores', children: [
            { name: 'Notebooks Gamer', handle: 'notebooks-gamer', productCount: 0 },
            { name: 'Notebooks Office', handle: 'notebooks-office', productCount: 0 },
            { name: 'Desktops', handle: 'desktops', productCount: 0 },
          ]},
          { name: 'Smartphones', handle: 'smartphones', children: [
            { name: 'Android', handle: 'android', productCount: 0 },
            { name: 'iPhone & Apple', handle: 'iphone-apple', productCount: 0 },
          ]},
          { name: 'Periféricos', handle: 'perifericos', children: [
            { name: 'Teclados', handle: 'teclados', productCount: 0 },
            { name: 'Mouses', handle: 'mouses', productCount: 0 },
            { name: 'Monitores', handle: 'monitores', productCount: 0 },
          ]},
          { name: 'Componentes', handle: 'componentes', children: [
            { name: 'SSD & HD', handle: 'ssd-hd', productCount: 0 },
            { name: 'Memória RAM', handle: 'memoria-ram', productCount: 0 },
          ]},
          { name: 'Nobreaks & Energia', handle: 'nobreaks-energia', children: [
            { name: 'Nobreaks', handle: 'nobreaks', productCount: 0 },
            { name: 'Estabilizadores', handle: 'estabilizadores', productCount: 0 },
          ]},
          { name: 'Redes e Conectividade', handle: 'redes-conectividade', children: [
            { name: 'Redes e Equipamentos', handle: 'redes-equipamentos', productCount: 0 },
          ]},
        ]},
      ], listEl);
    }
  }

  function _renderTenantCategoryList(categories, listEl) {
    var html = '';
    categories.forEach(function (category) {
      var handle = _normalizeHandle(category.handle || category.id || category.name);
      var label = category.name || handle;
      html += '<li class="pp-cat-pai" id="pai-' + handle + '">';
      html += '<button class="pp-cat-pai-btn" data-handle="' + handle + '" data-label="' + label + '">';
      html += '<span class="pp-cat-pai-icon">' + _iconForCategory(handle) + '</span>';
      html += ' ' + label;
      html += ' <span class="pp-cat-count" data-category-count="' + handle + '">–</span>';
      html += '</button>';
      html += '</li>';
    });

    listEl.insertAdjacentHTML('beforeend', html);
    _attachCategoryEvents(listEl);

    if (_activeHandle && _activeHandle !== 'all') {
      var active = listEl.querySelector('[data-handle="' + _activeHandle + '"]');
      if (active) {
        _activeLabel = active.dataset.label || _activeLabel;
      }
    }
  }

  function _renderCategoryTree(cats, listEl) {
    // "Todos" já existe no HTML; apenas adicionar os pais/filhos/netos
    var html = '';
    cats.forEach(function (pai) {
      var hasFilhos = pai.children && pai.children.length > 0;
      html += '<li class="pp-cat-pai" id="pai-' + pai.handle + '">';
      html += '<button class="pp-cat-pai-btn" data-handle="' + pai.handle + '" data-label="' + (pai.name || pai.handle) + '">';
      html += '<span class="pp-cat-pai-icon">' + (pai.icon || '📦') + '</span>';
      html += ' ' + (pai.name || pai.handle);
      if (pai.totalProducts != null) html += ' <span class="pp-cat-count">' + pai.totalProducts + '</span>';
      if (hasFilhos) html += '<i class="fas fa-chevron-right pp-cat-arrow"></i>';
      html += '</button>';

      if (hasFilhos) {
        html += '<ul class="pp-cat-filhos">';
        pai.children.forEach(function (filho) {
          var hasNetos = filho.children && filho.children.length > 0;
          html += '<li class="pp-cat-filho" id="filho-' + filho.handle + '">';
          html += '<button class="pp-cat-filho-btn" data-handle="' + filho.handle + '" data-label="' + (filho.name || filho.handle) + '">';
          html += (filho.icon || '') + ' ' + (filho.name || filho.handle);
          if (filho.productCount != null) html += ' <span class="pp-cat-count">' + filho.productCount + '</span>';
          if (hasNetos) html += '<i class="fas fa-chevron-right pp-cat-arrow"></i>';
          html += '</button>';

          if (hasNetos) {
            html += '<ul class="pp-cat-netos">';
            filho.children.forEach(function (neto) {
              html += '<li>';
              html += '<button class="pp-cat-neto-btn" data-handle="' + neto.handle + '" data-label="' + (neto.name || neto.handle) + '">';
              html += (neto.icon || '') + ' ' + (neto.name || neto.handle);
              if (neto.productCount != null) html += ' <span class="pp-cat-count">' + neto.productCount + '</span>';
              html += '</button></li>';
            });
            html += '</ul>';
          }
          html += '</li>';
        });
        html += '</ul>';
      }
      html += '</li>';
    });

    listEl.insertAdjacentHTML('beforeend', html);
    _attachCategoryEvents(listEl);
  }

  function _attachCategoryEvents(listEl) {
    // "Todos"
    var allBtn = document.getElementById('pp-cat-all');
    if (allBtn) {
      allBtn.addEventListener('click', function () {
        _setActiveCategory('all', 'Todos');
        _applyFilterAndRender();
      });
    }

    // Pais
    listEl.querySelectorAll('.pp-cat-pai-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var pai = btn.closest('.pp-cat-pai');
        var isOpen = pai.classList.contains('open');
        // Fechar todos
        listEl.querySelectorAll('.pp-cat-pai').forEach(function (p) { p.classList.remove('open'); });
        if (!isOpen) pai.classList.add('open');
        _setActiveCategory(btn.dataset.handle, btn.dataset.label);
        _applyFilterAndRender();
      });
    });

    // Filhos
    listEl.querySelectorAll('.pp-cat-filho-btn').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var filho = btn.closest('.pp-cat-filho');
        filho.classList.toggle('open');
        _setActiveCategory(btn.dataset.handle, btn.dataset.label);
        _applyFilterAndRender();
      });
    });

    // Netos
    listEl.querySelectorAll('.pp-cat-neto-btn').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        _setActiveCategory(btn.dataset.handle, btn.dataset.label);
        _applyFilterAndRender();
      });
    });
  }

  function _setActiveCategory(handle, label) {
    _activeHandle = handle;
    _activeLabel = label || _findLabelByHandle(handle) || handle;
    _offset = 0;

    // UI: remover active de todos
    document.querySelectorAll('.pp-cat-all, .pp-cat-pai-btn, .pp-cat-filho-btn, .pp-cat-neto-btn').forEach(function (b) {
      b.classList.remove('active');
    });

    if (handle === 'all') {
      var allEl = document.getElementById('pp-cat-all');
      if (allEl) allEl.classList.add('active');
    } else {
      var btns = document.querySelectorAll('[data-handle="' + handle + '"]');
      btns.forEach(function (b) { b.classList.add('active'); });
    }

    var labelEl = document.getElementById('pp-cat-label');
    if (labelEl) labelEl.textContent = _activeLabel;

    // Fechar sidebar em mobile após selecionar categoria
    if (window.innerWidth <= 900) {
      var sb = document.getElementById('pp-sidebar');
      var ov = document.getElementById('pp-sidebar-overlay');
      if (sb) sb.classList.remove('open');
      if (ov) ov.classList.remove('visible');
    }

    // Atualizar URL sem recarregar
    _syncListingUrlState();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Carregar todos os produtos
  // ─────────────────────────────────────────────────────────────────────────
  async function _loadAllProducts() {
    try {
      var products = await (global.loadProductsFromAPI ? global.loadProductsFromAPI({ limit: 200, offset: 0 }) : Promise.resolve([]));
      _allProducts = products || [];
      _refreshCategoryCounts();
      _applyFilterAndRender();
    } catch (err) {
      console.error('[produtos-page] Erro ao carregar produtos:', err);
      var grid = document.getElementById('produtosGrid');
      if (grid) grid.innerHTML = '<div class="lp-empty"><i class="fas fa-exclamation-circle"></i><p>Erro ao carregar produtos. Tente novamente.</p></div>';
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Filtrar + sort + paginar
  // ─────────────────────────────────────────────────────────────────────────
  function _applyFilterAndRender() {
    var handle = _activeHandle;
    var search = _getCurrentSearchTerm();

    var filtered = _allProducts.slice();

    // Filtro de categoria
    if (handle && handle !== 'all') {
      filtered = filtered.filter(function (p) {
        var catSlug = (p.categorySlug || _normalizeHandle((p.category && (p.category.handle || p.category.name)) || '')).toLowerCase();
        return catSlug === handle || catSlug.indexOf(handle) === 0 || handle.indexOf(catSlug) === 0;
      });
    }

    // Filtro de busca
    if (search) {
      filtered = filtered.filter(function (p) {
        return _matchesSearch(p, search);
      });
    }

    // Sort
    filtered = _sort(filtered, _sortValue);

    _currentProducts = filtered;
    _offset = 0;
    _syncListingUrlState();
    _syncCurationPanel();
    _syncQuoteBanner();
    _renderPage();
  }

  function _sort(list, mode) {
    var sorted = list.slice();
    if (mode === 'featured' || mode === 'recent') {
      if (typeof global.getTech10EditorialCatalogCollections === 'function') {
        return global.getTech10EditorialCatalogCollections(sorted, { useInput: true }).orderedProducts;
      }
    } else if (mode === 'price-asc') {
      sorted.sort(function (a, b) { return _getPrice(a) - _getPrice(b); });
    } else if (mode === 'price-desc') {
      sorted.sort(function (a, b) { return _getPrice(b) - _getPrice(a); });
    } else if (mode === 'name') {
      sorted.sort(function (a, b) { return (a.title || '').localeCompare(b.title || ''); });
    }
    return sorted;
  }

  function _getPrice(p) {
    var v = p.variants && p.variants[0];
    return (v && v.prices && v.prices[0]) ? (v.prices[0].amount || 0) : 0;
  }

  function _formatProductCount(count) {
    return count + (count === 1 ? ' produto' : ' produtos');
  }

  function _buildCurationPanelState() {
    var searchInput = _getSearchInput();
    var searchDisplayTerm = searchInput ? String(searchInput.value || '').trim() : '';
    var searchTerm = searchDisplayTerm.toLowerCase();
    var currentCount = _currentProducts.length;
    var collections = (typeof global.getTech10EditorialCatalogCollections === 'function')
      ? global.getTech10EditorialCatalogCollections(_currentProducts, { useInput: true })
      : { categories: [], featured: [], orderedProducts: _currentProducts.slice() };
    var categories = collections.categories || [];
    var featured = collections.featured || [];
    var topCategories = categories.slice(0, 3).map(function (category) {
      return category.label + ' · ' + category.count;
    });
    var featuredNames = featured
      .map(function (entry) { return entry && entry.product && entry.product.title; })
      .filter(Boolean)
      .slice(0, 2);

    var panelState = {
      eyebrow: 'Destaques Tech10',
      title: 'Vitrine editorial baseada no estoque público da Tech10.',
      desc: 'Abrimos a loja com uma leitura mais diversa do catálogo real para reduzir repetição na primeira dobra e facilitar a triagem comercial.',
      chips: [_formatProductCount(currentCount), 'Seleção assistida'].concat(topCategories)
    };

    if (currentCount === 0) {
      panelState.eyebrow = searchTerm ? 'Busca sem resultado' : 'Catálogo vazio';
      panelState.title = searchTerm
        ? 'Nenhum item público encontrado para "' + searchTerm + '".'
        : 'Nenhum item público encontrado nesta combinação de filtros.';
      panelState.desc = 'A Tech10 continua atendendo de forma assistida. Ajuste a busca, volte para outra categoria ou fale com a equipe para confirmar alternativas.';
      panelState.chips = ['Seleção assistida', 'Atendimento Tech10'];
      return panelState;
    }

    if (searchTerm) {
      panelState.eyebrow = 'Busca ativa';
      panelState.title = 'Resultado para "' + searchDisplayTerm + '" no catálogo público.';
      panelState.desc = 'Exibindo ' + _formatProductCount(currentCount) + ' com confirmação assistida da Tech10 para disponibilidade, orientação e fechamento seguro.';
      panelState.chips = [_formatProductCount(currentCount), 'Seleção assistida'].concat(topCategories);
      return panelState;
    }

    if (_activeHandle && _activeHandle !== 'all') {
      panelState.eyebrow = 'Categoria em foco';
      panelState.title = _activeLabel + ' com estoque público agora.';
      panelState.desc = 'Esta leitura mantém a seleção assistida da Tech10 e prioriza os itens mais claros comercialmente dentro da categoria ativa.';
      panelState.chips = [_formatProductCount(currentCount), 'Seleção assistida'].concat(topCategories);
      return panelState;
    }

    if (_sortValue === 'price-asc') {
      panelState.eyebrow = 'Menor preço';
      panelState.title = 'Vitrine ordenada do menor para o maior preço.';
      panelState.desc = 'Boa para triagem rápida por orçamento, mantendo o mesmo estoque público e o atendimento assistido da Tech10.';
      return panelState;
    }

    if (_sortValue === 'price-desc') {
      panelState.eyebrow = 'Maior preço';
      panelState.title = 'Vitrine ordenada do maior para o menor preço.';
      panelState.desc = 'Boa para puxar primeiro os itens de ticket mais alto, sem perder a confirmação assistida no fechamento.';
      return panelState;
    }

    if (_sortValue === 'name') {
      panelState.eyebrow = 'Nome A-Z';
      panelState.title = 'Vitrine ordenada alfabeticamente.';
      panelState.desc = 'Boa para localização direta de produto, marca ou SKU, mantendo a mesma leitura do estoque público da Tech10.';
      return panelState;
    }

    if (featuredNames.length) {
      panelState.desc = 'A abertura da vitrine começa com ' + featuredNames.join(' e ') + ' e depois distribui outras categorias ativas para deixar a dobra inicial mais útil e menos repetitiva.';
    }

    return panelState;
  }

  function _buildQuoteBannerState() {
    var searchInput = _getSearchInput();
    var searchDisplayTerm = searchInput ? String(searchInput.value || '').trim() : '';
    var searchTerm = searchDisplayTerm.toLowerCase();
    var currentCount = _currentProducts.length;
    var state = {
      eyebrow: 'Próximo passo',
      title: 'Feche com atendimento assistido da Tech10',
      desc: 'Escolha o item na vitrine e confirme pelo WhatsApp para disponibilidade, orientação técnica e fechamento seguro. Se já tem O.S., acompanhe tudo pelo portal.',
      primaryLabel: 'Falar com a Tech10',
      supportMessage: 'Olá! Vim pela loja da Tech10 e quero ajuda para escolher e fechar um produto.'
    };

    if (searchTerm) {
      state.eyebrow = 'Resultado em atendimento';
      state.title = currentCount === 1
        ? 'Confirme este item com a Tech10'
        : 'Confirme estes resultados com a Tech10';
      state.desc = 'Use o WhatsApp para validar disponibilidade, orientação técnica e fechamento assistido'
        + (searchDisplayTerm ? ' para "' + searchDisplayTerm + '"' : '')
        + (currentCount ? ', com ' + _formatProductCount(currentCount) + ' visíveis na vitrine.' : '.');
      state.primaryLabel = currentCount === 1 ? 'Falar sobre este item' : 'Falar sobre estes itens';
      state.supportMessage = 'Olá! Vim pela loja da Tech10 e quero ajuda para confirmar'
        + (searchDisplayTerm ? ' "' + searchDisplayTerm + '"' : ' um item da vitrine')
        + ' com atendimento assistido.';
      return state;
    }

    if (_activeHandle && _activeHandle !== 'all') {
      state.eyebrow = 'Categoria ativa';
      state.title = 'Feche ' + _activeLabel + ' com a Tech10';
      state.desc = 'A categoria ' + _activeLabel + ' está em foco com ' + _formatProductCount(currentCount)
        + ' visíveis. Use o WhatsApp para confirmar disponibilidade, orientação técnica e fechamento assistido.';
      state.primaryLabel = 'Falar sobre ' + _activeLabel;
      state.supportMessage = 'Olá! Vim pela loja da Tech10 e quero ajuda para escolher e fechar um item de ' + _activeLabel + '.';
    }

    return state;
  }

  function _syncCurationPanel() {
    var panel = document.getElementById('pp-curation-panel');
    if (!panel) return;

    var state = _buildCurationPanelState();
    var eyebrowEl = panel.querySelector('[data-pp-curation-eyebrow]');
    var titleEl = panel.querySelector('[data-pp-curation-title]');
    var descEl = panel.querySelector('[data-pp-curation-desc]');
    var chipsEl = panel.querySelector('[data-pp-curation-chips]');

    if (eyebrowEl) eyebrowEl.textContent = state.eyebrow;
    if (titleEl) titleEl.textContent = state.title;
    if (descEl) descEl.textContent = state.desc;
    if (chipsEl) {
      chipsEl.innerHTML = '';
      (state.chips || []).filter(Boolean).forEach(function (chip) {
        var span = document.createElement('span');
        span.className = 'pp-curation-chip';
        span.textContent = chip;
        chipsEl.appendChild(span);
      });
    }
  }

  function _syncQuoteBanner() {
    var banner = document.getElementById('pp-quote-banner');
    if (!banner) return;

    var state = _buildQuoteBannerState();
    var eyebrowEl = banner.querySelector('[data-pp-quote-eyebrow]');
    var titleEl = banner.querySelector('[data-pp-quote-title]');
    var descEl = banner.querySelector('[data-pp-quote-desc]');
    var primaryLink = banner.querySelector('[data-tenant-support-link]');
    var primaryLabelEl = banner.querySelector('[data-pp-quote-primary-label]');

    if (eyebrowEl) eyebrowEl.textContent = state.eyebrow;
    if (titleEl) titleEl.textContent = state.title;
    if (descEl) descEl.textContent = state.desc;
    if (primaryLabelEl) primaryLabelEl.textContent = state.primaryLabel;
    if (primaryLink) {
      primaryLink.setAttribute('data-support-message', state.supportMessage);
      if (global.TenantRoutes && typeof global.TenantRoutes.supportUrl === 'function') {
        primaryLink.setAttribute('href', global.TenantRoutes.supportUrl(state.supportMessage));
      }
    }
  }

  function _slugify(str) {
    return _normalizeHandle(str);
  }

  function _findLabelByHandle(handle) {
    if (!handle || handle === 'all') return 'Todos';
    var node = document.querySelector('[data-handle="' + handle + '"]');
    return node ? node.dataset.label : handle;
  }

  function _refreshCategoryCounts() {
    var totals = {};

    _allProducts.forEach(function (product) {
      var handle = _normalizeHandle(product.categorySlug || (product.category && (product.category.handle || product.category.name)) || 'outros');
      totals[handle] = (totals[handle] || 0) + 1;
    });

    var allCount = document.getElementById('pp-cat-all-count');
    if (allCount) allCount.textContent = String(_allProducts.length);

    document.querySelectorAll('[data-category-count]').forEach(function (node) {
      var handle = node.getAttribute('data-category-count');
      node.textContent = String(totals[handle] || 0);
    });
  }

  function _renderPage() {
    var grid = document.getElementById('produtosGrid');
    if (!grid) return;

    var page = _currentProducts.slice(0, _offset + PAGE_LIMIT);

    // Remover skeleton
    var skel = document.getElementById('pp-skeleton');
    if (skel) skel.remove();

    if (typeof global.renderProductsFromAPI === 'function') {
      global.renderProductsFromAPI(page, 'produtosGrid');
    }

    // Resultado count
    var countEl = document.getElementById('pp-result-count');
    if (countEl) {
      var total = _currentProducts.length;
      countEl.textContent = total + (total === 1 ? ' produto' : ' produtos');
    }

    // Load more
    var loadMoreEl = document.getElementById('pp-load-more');
    if (loadMoreEl) {
      var hasMore = _offset + PAGE_LIMIT < _currentProducts.length;
      loadMoreEl.style.display = hasMore ? 'block' : 'none';
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Carrinho count
  // ─────────────────────────────────────────────────────────────────────────
  function _updateCartCount() {
    var countEl = document.getElementById('pp-cart-count');
    if (!countEl) return;
    function update() {
      var cart = typeof global.getActiveStorefrontCart === 'function'
        ? global.getActiveStorefrontCart()
        : (global.storefrontCart || null);
      if (cart && cart.getCount) {
        var n = cart.getCount();
        countEl.textContent = n;
        countEl.style.display = n > 0 ? '' : 'none';
      }
    }
    update();
    setInterval(update, 2000);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Boot
  // ─────────────────────────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})(typeof window !== 'undefined' ? window : this);
