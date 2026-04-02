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
  var _sortValue = 'recent';
  var _totalFromApi = 0;

  // ─────────────────────────────────────────────────────────────────────────
  // Inicialização
  // ─────────────────────────────────────────────────────────────────────────
  function init() {
    // Ler parâmetro de URL: ?category=handle
    var params = new URLSearchParams(window.location.search);
    var initCat = params.get('category') || 'all';
    _activeHandle = initCat;

    // Carregar categorias
    _loadCategories().then(function () {
      _setActiveCategory(_activeHandle, _activeLabel);
    });

    // Carregar produtos
    _loadAllProducts();

    // Eventos
    var searchInput = document.getElementById('pp-search');
    if (searchInput) {
      searchInput.addEventListener('input', function () {
        clearTimeout(_searchDebounce);
        _searchDebounce = setTimeout(function () {
          _applyFilterAndRender();
        }, 300);
      });
    }

    var sortSel = document.getElementById('pp-sort');
    if (sortSel) {
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

    // Atualizar contador do carrinho
    _updateCartCount();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Carregar árvore de categorias
  // ─────────────────────────────────────────────────────────────────────────
  async function _loadCategories() {
    var config = global.API_CONFIG || {};
    var baseUrl = config.ACTIVE_URL || window.location.origin;
    var listEl = document.getElementById('pp-cat-list');
    var loadingEl = document.getElementById('pp-cat-loading');

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
          { name: 'Redes & Conectividade', handle: 'redes-conectividade', children: [
            { name: 'Roteadores Wi-Fi', handle: 'roteadores-wifi', productCount: 0 },
          ]},
        ]},
      ], listEl);
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
    _activeLabel = label || handle;
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
    try {
      var url = new URL(window.location.href);
      if (handle === 'all') url.searchParams.delete('category');
      else url.searchParams.set('category', handle);
      history.replaceState(null, '', url.toString());
    } catch(e) {}
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Carregar todos os produtos
  // ─────────────────────────────────────────────────────────────────────────
  async function _loadAllProducts() {
    try {
      var products = await (global.loadProductsFromAPI ? global.loadProductsFromAPI({ limit: 200, offset: 0 }) : Promise.resolve([]));
      _allProducts = products || [];
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
    var search = (document.getElementById('pp-search') ? document.getElementById('pp-search').value : '').toLowerCase().trim();

    var filtered = _allProducts.slice();

    // Filtro de categoria
    if (handle && handle !== 'all') {
      filtered = filtered.filter(function (p) {
        var catSlug = (p.categorySlug || _slugify((p.category && (p.category.handle || p.category.name)) || '')).toLowerCase();
        return catSlug === handle || catSlug.indexOf(handle) === 0 || handle.indexOf(catSlug) === 0;
      });
    }

    // Filtro de busca
    if (search) {
      filtered = filtered.filter(function (p) {
        return (p.title || '').toLowerCase().indexOf(search) !== -1 ||
               (p.description || '').toLowerCase().indexOf(search) !== -1;
      });
    }

    // Sort
    filtered = _sort(filtered, _sortValue);

    _currentProducts = filtered;
    _offset = 0;
    _renderPage();
  }

  function _sort(list, mode) {
    var sorted = list.slice();
    if (mode === 'price-asc') {
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

  function _slugify(str) {
    return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
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
      var cart = global.medusaCart || global.cartVivaCommerce;
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
