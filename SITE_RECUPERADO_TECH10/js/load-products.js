/**
 * Carregar e renderizar produtos — Tech10
 * Usa MarketplaceAdapter same-origin quando disponível.
 * Carregue na ordem: api-config.js → api-adapter.js → load-products.js
 */
(function (global) {
  'use strict';

  function getRuntimeCommerce() {
    var runtime = global.__tech10_runtime_config || {};
    if (runtime.commerce) {
      return runtime.commerce;
    }
    var config = global.API_CONFIG || {};
    var quoteOnly = (config.CHECKOUT_MODE || 'store_backend') === 'quote_only';
    return {
      checkoutMode: config.CHECKOUT_MODE || 'store_backend',
      capabilities: {
        cart: !quoteOnly,
        checkout: !quoteOnly,
        quoteOnly: quoteOnly,
        assistedCartBridge: quoteOnly,
        assistedCheckoutBridge: quoteOnly
      }
    };
  }

  function hasAssistedSelectionBridge() {
    var commerce = getRuntimeCommerce();
    var capabilities = commerce.capabilities || {};
    var quoteOnly = commerce.checkoutMode === 'quote_only'
      || capabilities.quoteOnly === true
      || capabilities.cart === false;

    return quoteOnly && capabilities.assistedCartBridge === true;
  }

  function isQuoteOnlyCatalogMode() {
    var commerce = getRuntimeCommerce();
    var capabilities = commerce.capabilities || {};
    return commerce.checkoutMode === 'quote_only'
      || capabilities.quoteOnly === true
      || capabilities.cart === false;
  }

  function applyCatalogModePresentation() {
    if (!global.document) return;

    var quoteOnly = isQuoteOnlyCatalogMode();
    var descriptionNode = global.document.querySelector('meta[name="description"]');
    var supportEyebrow = global.document.querySelector('[data-catalog-support-eyebrow]');
    var cartLink = global.document.querySelector('[data-catalog-cart-link]');
    var cartIcon = global.document.querySelector('[data-catalog-cart-icon]');
    var cartEyebrow = global.document.querySelector('[data-catalog-cart-eyebrow]');
    var cartTitle = global.document.querySelector('[data-catalog-cart-title]');
    var heroModePill = global.document.querySelector('[data-catalog-hero-mode-pill]');
    var heroCartIcon = global.document.querySelector('[data-catalog-hero-cart-icon]');
    var heroCartLabel = global.document.querySelector('[data-catalog-hero-cart-label]');
    var quoteCartIcon = global.document.querySelector('[data-catalog-quote-cart-icon]');
    var quoteCartLabel = global.document.querySelector('[data-catalog-quote-cart-label]');

    if (descriptionNode) {
      descriptionNode.setAttribute('content', quoteOnly
        ? 'Loja de informática em Santa Maria/RS com acessórios, cabos, periféricos e atendimento assistido da Tech10 para escolher o produto certo e fechar com segurança.'
        : 'Loja de informática em Santa Maria/RS com acessórios, cabos, periféricos, carrinho e checkout Pix direto da Tech10, com suporte humano quando você precisar de ajuda.');
    }

    if (supportEyebrow) {
      supportEyebrow.textContent = quoteOnly ? 'Compra assistida' : 'Precisa de ajuda?';
    }

    if (cartLink) {
      cartLink.setAttribute('aria-label', quoteOnly ? 'Abrir minha seleção assistida' : 'Abrir carrinho');
    }

    if (cartIcon) {
      cartIcon.className = quoteOnly ? 'fas fa-list-check' : 'fas fa-shopping-cart';
    }

    if (cartEyebrow) {
      cartEyebrow.textContent = quoteOnly ? 'Seleção assistida' : 'Carrinho';
    }

    if (cartTitle) {
      cartTitle.textContent = quoteOnly ? 'Minha seleção' : 'Ver carrinho';
    }

    if (heroModePill) {
      heroModePill.textContent = quoteOnly ? 'Seleção assistida' : 'Carrinho e Pix direto';
    }

    if (heroCartIcon) {
      heroCartIcon.className = quoteOnly ? 'fas fa-list-check' : 'fas fa-shopping-cart';
    }

    if (heroCartLabel) {
      heroCartLabel.textContent = quoteOnly ? 'Abrir minha seleção' : 'Abrir carrinho';
    }

    if (quoteCartIcon) {
      quoteCartIcon.className = quoteOnly ? 'fas fa-list-check' : 'fas fa-shopping-cart';
    }

    if (quoteCartLabel) {
      quoteCartLabel.textContent = quoteOnly ? 'Ver minha seleção' : 'Ver carrinho';
    }
  }

  function getCatalogButtonLabel(actionMode) {
    if (actionMode === 'assisted') {
      return '<i class="fas fa-list-check"></i> Adicionar à seleção';
    }
    if (actionMode === 'quote') {
      return '<i class="fab fa-whatsapp"></i> Falar com a Tech10';
    }
    return '<i class="fas fa-shopping-cart"></i> Adicionar';
  }

  function getCatalogButtonLoadingLabel(actionMode) {
    if (actionMode === 'assisted') {
      return '<i class="fas fa-spinner fa-spin"></i> Adicionando à seleção...';
    }
    return '<i class="fas fa-spinner fa-spin"></i> Adicionando...';
  }

  function getCatalogButtonSuccessLabel(actionMode) {
    if (actionMode === 'assisted') {
      return '<i class="fas fa-check"></i> Na seleção!';
    }
    return '<i class="fas fa-check"></i> Adicionado!';
  }

  function getSupportWhatsappUrl(product, quantity) {
    var title = product && product.title ? product.title : 'um produto da loja';
    var metadata = product && product.metadata ? product.metadata : {};
    var price = product && product.variants && product.variants[0] && product.variants[0].prices && product.variants[0].prices[0]
      ? product.variants[0].prices[0].amount
      : 0;
    var qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < 1) qty = 1;

    var message = [
      'Olá! Vim pela loja da Tech10 e tenho interesse neste produto:',
      title,
      metadata.brand ? 'Marca: ' + metadata.brand : '',
      metadata.sku ? 'SKU: ' + metadata.sku : '',
      qty > 1 ? 'Quantidade desejada: ' + qty : '',
      price ? 'Preço exibido: R$ ' + formatPrice(price) : '',
      '',
      'Gostaria de confirmar disponibilidade e atendimento.'
    ].filter(Boolean).join('\n');

    var tenantRoutes = global.TenantRoutes || {};
    if (tenantRoutes.supportUrl) {
      return tenantRoutes.supportUrl(message);
    }

    var runtime = global.__tech10_runtime_config || {};
    var support = runtime.support || {};
    var tenantCompany = (global.TENANT_CONFIG && global.TENANT_CONFIG.company) || {};
    var whatsapp = String(support.whatsapp || tenantCompany.whatsapp || '').replace(/\D/g, '');
    if (!whatsapp) return '';
    return 'https://wa.me/' + whatsapp + '?text=' + encodeURIComponent(message);
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getCatalogSupportUrl(message) {
    var tenantRoutes = global.TenantRoutes || {};
    if (tenantRoutes.supportUrl) {
      return tenantRoutes.supportUrl(message);
    }

    var runtime = global.__tech10_runtime_config || {};
    var support = runtime.support || {};
    var tenantCompany = (global.TENANT_CONFIG && global.TENANT_CONFIG.company) || {};
    var whatsapp = String(support.whatsapp || tenantCompany.whatsapp || '').replace(/\D/g, '');
    if (!whatsapp) return '#contato';
    return 'https://wa.me/' + whatsapp + '?text=' + encodeURIComponent(message);
  }

  function buildCatalogEmptyStateHtml(options) {
    var state = global.__tech10_listing_state || {};
    var mode = (options && options.mode) || state.mode || 'generic-empty';
    var emptyShopHref = (global.TenantRoutes && global.TenantRoutes.shopHome) || '/loja';
    var searchTerm = String(state.searchTerm || '');
    var categoryLabel = String(state.activeLabel || 'esta categoria');
    var suggestions = ['iPhone', 'carregador', 'notebook', 'cabo', 'fonte', 'pelicula', 'perifericos'];

    var title = 'Nenhum produto público disponível agora.';
    var desc = 'Tente outra categoria ou fale com a Tech10 para localizar uma opção compatível.';
    var icon = 'fa-box-open';
    var actions = [];
    var suggestionsHtml = '';
    var supportMessage = 'Olá! Vim pela loja da Tech10 e quero ajuda para localizar um produto no catálogo.';

    if (mode === 'search-empty') {
      title = 'Não encontramos "' + searchTerm + '" no catálogo público agora.';
      desc = 'A Tech10 pode verificar disponibilidade, compatibilidade ou indicar uma opção equivalente para você.';
      icon = 'fa-magnifying-glass';
      supportMessage = 'Olá! Procurei "' + searchTerm + '" na loja da Tech10 e quero ajuda para encontrar uma opção equivalente ou confirmar disponibilidade.';
      actions = [
        '<a class="lp-empty-btn lp-empty-btn--primary" href="' + escapeHtml(getCatalogSupportUrl(supportMessage)) + '" target="_blank" rel="noopener noreferrer"><i class="fab fa-whatsapp" aria-hidden="true"></i> Consultar no WhatsApp</a>',
        '<button class="lp-empty-btn lp-empty-btn--secondary" type="button" data-clear-search><i class="fas fa-eraser" aria-hidden="true"></i> Limpar busca</button>',
        '<a class="lp-empty-btn lp-empty-btn--ghost" href="' + escapeHtml(emptyShopHref) + '"><i class="fas fa-grid-2" aria-hidden="true"></i> Ver todos os produtos</a>'
      ];
      suggestionsHtml = '<div class="lp-empty__suggestions">' +
        '<span class="lp-empty__suggestions-label">Tente buscar por:</span>' +
        '<div class="lp-empty__suggestions-chips">' +
          suggestions.map(function (term) {
            return '<button class="lp-empty-suggestion" type="button" data-search-suggestion="' + escapeHtml(term) + '">' + escapeHtml(term) + '</button>';
          }).join('') +
        '</div>' +
      '</div>';
    } else if (mode === 'category-empty') {
      title = 'Esta categoria ainda não tem produtos públicos.';
      desc = 'Mesmo assim, a Tech10 pode consultar opções disponíveis, encomendas ou alternativas compatíveis.';
      icon = 'fa-layer-group';
      supportMessage = 'Olá! Vim pela categoria "' + categoryLabel + '" na loja da Tech10 e quero consultar disponibilidade ou alternativas.';
      actions = [
        '<a class="lp-empty-btn lp-empty-btn--primary" href="' + escapeHtml(getCatalogSupportUrl(supportMessage)) + '" target="_blank" rel="noopener noreferrer"><i class="fab fa-whatsapp" aria-hidden="true"></i> Consultar disponibilidade</a>',
        '<a class="lp-empty-btn lp-empty-btn--secondary" href="' + escapeHtml(emptyShopHref) + '"><i class="fas fa-grid-2" aria-hidden="true"></i> Voltar para todos os produtos</a>'
      ];
    } else if (mode === 'error') {
      title = 'Não conseguimos carregar o catálogo agora.';
      desc = 'Você ainda pode falar com a Tech10 para consultar produtos, preços e disponibilidade.';
      icon = 'fa-triangle-exclamation';
      supportMessage = 'Olá! A loja da Tech10 não carregou agora e quero consultar produtos, preços e disponibilidade.';
      actions = [
        '<button class="lp-empty-btn lp-empty-btn--primary" type="button" data-empty-retry><i class="fas fa-rotate-right" aria-hidden="true"></i> Tentar novamente</button>',
        '<a class="lp-empty-btn lp-empty-btn--secondary" href="' + escapeHtml(getCatalogSupportUrl(supportMessage)) + '" target="_blank" rel="noopener noreferrer"><i class="fab fa-whatsapp" aria-hidden="true"></i> Consultar no WhatsApp</a>'
      ];
    } else {
      actions = [
        '<a class="lp-empty-btn lp-empty-btn--primary" href="' + escapeHtml(getCatalogSupportUrl(supportMessage)) + '" target="_blank" rel="noopener noreferrer"><i class="fab fa-whatsapp" aria-hidden="true"></i> Falar com a Tech10</a>',
        '<a class="lp-empty-btn lp-empty-btn--secondary" href="' + escapeHtml(emptyShopHref) + '"><i class="fas fa-grid-2" aria-hidden="true"></i> Ver todos os produtos</a>'
      ];
    }

    return '<div class="lp-empty lp-empty--' + escapeHtml(mode) + '">' +
      '<div class="lp-empty__icon"><i class="fas ' + escapeHtml(icon) + '" aria-hidden="true"></i></div>' +
      '<h3 class="lp-empty__title">' + escapeHtml(title) + '</h3>' +
      '<p class="lp-empty__desc">' + escapeHtml(desc) + '</p>' +
      '<div class="lp-empty__actions">' + actions.join('') + '</div>' +
      suggestionsHtml +
    '</div>';
  }

  global.renderTech10EmptyState = function renderTech10EmptyState(container, options) {
    if (!container) return;
    container.innerHTML = buildCatalogEmptyStateHtml(options);
  };

  function getProductMetaChips(product) {
    var metadata = product && product.metadata ? product.metadata : {};
    var chips = [];
    if (metadata.brand) chips.push({ label: 'Marca', value: metadata.brand });
    if (metadata.sku) chips.push({ label: 'SKU', value: metadata.sku });
    return chips;
  }

  function getProductTitleKey(product) {
    return String(product && product.title ? product.title : '')
      .trim()
      .toLowerCase();
  }

  function getProductInventoryAmount(product) {
    return product && product.variants && product.variants[0]
      ? Number(product.variants[0].inventory_quantity || 0)
      : 0;
  }

  function getProductCategorySlug(product) {
    return (product && (product.categorySlug || toCategorySlug(product.category)) || 'outros').toLowerCase();
  }

  function getProductCategoryLabel(product) {
    return normalizeCatalogText(product && product.category && product.category.name) || 'Catálogo';
  }

  function isDuplicateTitleProduct(product) {
    var titleKey = getProductTitleKey(product);
    var counts = global.__tech10_product_title_counts || {};
    return Boolean(titleKey && counts[titleKey] > 1);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Helpers internos
  // ─────────────────────────────────────────────────────────────────────────

  // Mapa de categoria-pai para filhos/netos (slugs do banco)
  var PARENT_SLUG_MAP = {
    'computadores': ['computadores', 'notebooks-gamer', 'notebooks-office', 'desktops', 'all-in-one'],
    'smartphones': ['smartphones', 'android', 'iphone-apple'],
    'perifericos': ['perifericos', 'teclados', 'mouses', 'monitores', 'webcams-headsets'],
    'componentes': ['componentes', 'ssd-hd', 'memoria-ram', 'processadores', 'placas-video'],
    'nobreaks-energia': ['nobreaks-energia', 'nobreaks', 'estabilizadores'],
    'redes-conectividade': ['redes-conectividade', 'redes-equipamentos', 'roteadores-wifi', 'switches-hubs'],
    'eletronicos-tecnologia': ['eletronicos-tecnologia', 'computadores', 'notebooks-gamer', 'notebooks-office', 'desktops', 'all-in-one', 'smartphones', 'android', 'iphone-apple', 'perifericos', 'teclados', 'mouses', 'monitores', 'webcams-headsets', 'componentes', 'ssd-hd', 'memoria-ram', 'processadores', 'placas-video', 'nobreaks-energia', 'nobreaks', 'estabilizadores', 'redes-conectividade', 'redes-equipamentos', 'roteadores-wifi', 'switches-hubs'],
  };

  function toCategorySlug(cat) {
    if (!cat) return 'outros';
    if (global.MarketplaceAdapter && global.MarketplaceAdapter.normalizeCategoryHandle) {
      return global.MarketplaceAdapter.normalizeCategoryHandle(cat.handle || cat.name || '');
    }
    const raw = (cat.handle || cat.name || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[>:]+/g, '-')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return raw || 'outros';
  }

  function matchesCategory(product, filterSlug) {
    if (!filterSlug || filterSlug === 'all') return true;
    var productSlug = (product.categorySlug || '').toLowerCase();
    // Verificação direta
    if (productSlug === filterSlug) return true;
    // Verificação via mapa de pai-filhos
    var children = PARENT_SLUG_MAP[filterSlug];
    if (children && children.indexOf(productSlug) !== -1) return true;
    // Fallback: prefixo
    return productSlug.indexOf(filterSlug) === 0 || filterSlug.indexOf(productSlug) === 0;
  }

  function formatPrice(amount) {
    return (amount / 100).toFixed(2).replace('.', ',');
  }

  function normalizeCatalogText(value) {
    return String(value || '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function getHomeCatalogCategorySummary(products, limit) {
    var categoryMap = new Map();

    (products || []).forEach(function (product, index) {
      if (!product) return;
      var slug = (product.categorySlug || toCategorySlug(product.category)).toLowerCase();
      if (!slug || slug === 'outros') return;

      var categoryName = normalizeCatalogText(product.category && product.category.name);
      if (!categoryMap.has(slug)) {
        categoryMap.set(slug, {
          slug: slug,
          label: categoryName || 'Categoria',
          count: 0,
          firstIndex: index
        });
      }

      var entry = categoryMap.get(slug);
      entry.count += 1;
      if (categoryName) {
        entry.label = categoryName;
      }
    });

    return Array.from(categoryMap.values())
      .sort(function (a, b) {
        if (b.count !== a.count) return b.count - a.count;
        return a.firstIndex - b.firstIndex;
      })
      .slice(0, limit || 4);
  }

  function getHomeCatalogSourceProducts(products) {
    if (global.__tech10_products && global.__tech10_products.length) {
      return global.__tech10_products;
    }
    return Array.isArray(products) ? products : [];
  }

  function formatCatalogCategoryItemCount(count) {
    return count === 1 ? '1 item' : count + ' itens';
  }

  function formatCatalogCategoryCountLine(count) {
    return count === 1 ? '1 item público' : count + ' itens públicos';
  }

  function getHomeCatalogIconClass(slug) {
    if (!slug) return 'fas fa-box-open';
    if (slug.indexOf('cabo') !== -1) return 'fas fa-plug';
    if (slug.indexOf('mouse') !== -1 || slug.indexOf('mouses') !== -1) return 'fas fa-computer-mouse';
    if (slug.indexOf('rede') !== -1 || slug.indexOf('equipamento') !== -1 || slug.indexOf('wifi') !== -1) return 'fas fa-wifi';
    if (slug.indexOf('veiculo') !== -1) return 'fas fa-car-side';
    return 'fas fa-box-open';
  }

  function matchesCatalogSearch(product, search) {
    if (!search) return true;

    var metadata = product && product.metadata ? product.metadata : {};
    var category = product && product.category ? product.category : {};
    var haystack = [
      product && product.title,
      product && product.description,
      metadata.brand,
      metadata.sku,
      category.name,
      category.handle,
      product && product.categorySlug
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return haystack.indexOf(search) !== -1;
  }

  function getActiveHomeCatalogFilterSlug(filtersRoot) {
    var activeButton = filtersRoot && filtersRoot.querySelector('.filter-btn.active');
    if (activeButton && activeButton.getAttribute('data-filter')) {
      return activeButton.getAttribute('data-filter');
    }
    return 'all';
  }

  function getHomeCatalogSearchTerm() {
    var searchInput = global.document && global.document.getElementById('searchInput');
    return searchInput ? String(searchInput.value || '').trim() : '';
  }

  function buildHomeCatalogStoreHref(categorySlug, searchTerm) {
    var tenantRoutes = global.TenantRoutes || {};
    var shopHome = tenantRoutes.shopHome || '/loja';
    var url = new URL(shopHome, global.location && global.location.origin ? global.location.origin : 'https://tech10.loja.tech10cloud.com');

    if (categorySlug && categorySlug !== 'all') {
      url.searchParams.set('category', categorySlug);
    }
    if (searchTerm) {
      url.searchParams.set('search', searchTerm);
    }

    return url.pathname + url.search;
  }

  function syncHomeCatalogFilters(products, containerId) {
    if ((containerId || 'produtosGrid') !== 'produtosGrid') return;

    var filtersRoot = global.document && global.document.querySelector('section#produtos .filters');
    if (!filtersRoot) return;

    var sourceProducts = getHomeCatalogSourceProducts(products);
    var categories = getHomeCatalogCategorySummary(sourceProducts, 4);
    if (!categories.length) return;

    var currentActive = 'all';
    var activeButton = filtersRoot.querySelector('.filter-btn.active');
    if (activeButton && activeButton.getAttribute('data-filter')) {
      currentActive = activeButton.getAttribute('data-filter');
    }

    if (currentActive !== 'all' && !categories.some(function (category) { return category.slug === currentActive; })) {
      currentActive = 'all';
    }

    filtersRoot.innerHTML = '';

    function appendButton(label, slug, isActive, count) {
      var button = global.document.createElement('button');
      button.className = 'filter-btn' + (isActive ? ' active' : '');
      button.setAttribute('data-filter', slug);
      button.setAttribute('type', 'button');
      button.innerHTML = '<span class="filter-btn__label">' + String(label).replace(/</g, '&lt;') + '</span>'
        + (typeof count === 'number'
          ? '<span class="filter-btn__count">' + count + '</span>'
          : '');
      button.addEventListener('click', function (event) {
        if (typeof global.handleFilterClick === 'function') {
          global.handleFilterClick(event);
        }
      });
      filtersRoot.appendChild(button);
    }

    appendButton('Todos', 'all', currentActive === 'all', sourceProducts.length);
    categories.forEach(function (category) {
      appendButton(category.label, category.slug, currentActive === category.slug, category.count);
    });
  }

  function syncHomeCatalogFilterContext(products, containerId) {
    if ((containerId || 'produtosGrid') !== 'produtosGrid') return;
    if (!global.document) return;

    var contextRoot = global.document.querySelector('[data-home-filter-context]');
    var filtersRoot = global.document.querySelector('section#produtos .filters');
    if (!contextRoot || !filtersRoot) return;

    var sourceProducts = getHomeCatalogSourceProducts(products);
    if (!sourceProducts.length) return;

    var currentFilter = getActiveHomeCatalogFilterSlug(filtersRoot);
    var currentSearch = getHomeCatalogSearchTerm();
    var categories = getHomeCatalogCategorySummary(sourceProducts, 8);
    var activeCategory = currentFilter !== 'all'
      ? categories.find(function (category) { return category.slug === currentFilter; })
      : null;
    var resultCount = Array.isArray(products) ? products.length : 0;

    var eyebrowNode = contextRoot.querySelector('[data-home-filter-context-eyebrow]');
    var titleNode = contextRoot.querySelector('[data-home-filter-context-title]');
    var metaNode = contextRoot.querySelector('[data-home-filter-context-meta]');
    var primaryNode = contextRoot.querySelector('[data-home-filter-context-primary]');
    var secondaryNode = contextRoot.querySelector('[data-home-filter-context-secondary]');

    var eyebrow = 'Catálogo vivo';
    var title = formatCatalogCategoryCountLine(sourceProducts.length) + ' em destaque agora';
    var quoteOnly = isQuoteOnlyCatalogMode();
    var meta = quoteOnly
      ? 'Filtre por categoria na home ou abra a loja completa para seguir com a seleção assistida.'
      : 'Filtre por categoria na home ou abra a loja completa para seguir com o checkout direto.';
    var primaryLabel = 'Ver catálogo completo';
    var primaryHref = buildHomeCatalogStoreHref(null, currentSearch);
    var supportMessage = 'Olá! Vim pela home da Tech10 e quero ajuda para escolher um item do catálogo público.';

    if (currentSearch) {
      eyebrow = 'Busca ativa';
      title = 'Resultado para "' + currentSearch + '"';
      meta = formatCatalogCategoryCountLine(resultCount)
        + (activeCategory ? ' em ' + activeCategory.label : '')
        + (quoteOnly ? ' para seguir com a seleção assistida na loja.' : ' para seguir com a compra direta na loja.');
      primaryLabel = resultCount === 1 ? 'Ver item na loja' : 'Ver resultados na loja';
      primaryHref = buildHomeCatalogStoreHref(activeCategory ? activeCategory.slug : null, currentSearch);
      supportMessage = 'Olá! Vim pela home da Tech10 e quero ajuda para encontrar "' + currentSearch + '"'
        + (activeCategory ? ' em ' + activeCategory.label : '')
        + ' no catálogo público.';
    } else if (activeCategory) {
      eyebrow = 'Filtro ativo';
      title = activeCategory.label + ' em destaque agora';
      meta = formatCatalogCategoryCountLine(resultCount) + ' em ' + activeCategory.label + (quoteOnly ? ' para seguir com a seleção assistida na loja.' : ' para seguir com a compra direta na loja.');
      primaryLabel = 'Ver ' + formatCatalogCategoryItemCount(resultCount) + ' de ' + activeCategory.label + ' na loja';
      primaryHref = buildHomeCatalogStoreHref(activeCategory.slug, null);
      supportMessage = 'Olá! Vim pela home da Tech10 e quero ajuda para escolher um item de ' + activeCategory.label + (quoteOnly ? ' com atendimento assistido.' : ' e concluir a compra direta.');
    }

    if (eyebrowNode) eyebrowNode.textContent = eyebrow;
    if (titleNode) titleNode.textContent = title;
    if (metaNode) metaNode.textContent = meta;
    if (primaryNode) {
      primaryNode.textContent = primaryLabel;
      primaryNode.setAttribute('href', primaryHref);
    }
    if (secondaryNode) {
      secondaryNode.setAttribute('data-support-message', supportMessage);
      if (global.TenantRoutes && typeof global.TenantRoutes.supportUrl === 'function') {
        secondaryNode.setAttribute('href', global.TenantRoutes.supportUrl(supportMessage));
      }
    }
  }

  function syncHomeCatalogEntryPoints(products, containerId) {
    if ((containerId || 'produtosGrid') !== 'produtosGrid') return;
    if (!global.document) return;

    var sourceProducts = getHomeCatalogSourceProducts(products);
    var categories = getHomeCatalogCategorySummary(sourceProducts, 2);
    if (!categories.length) return;

    categories.forEach(function (category, index) {
      var cardLink = global.document.querySelector('[data-home-catalog-slot="' + index + '"]');
      if (cardLink) {
        cardLink.setAttribute('href', '/loja?category=' + encodeURIComponent(category.slug));

        var icon = cardLink.querySelector('[data-home-catalog-icon]');
        if (icon) {
          icon.className = getHomeCatalogIconClass(category.slug);
          icon.setAttribute('data-home-catalog-icon', '');
        }

        var title = cardLink.querySelector('[data-home-catalog-title]');
        if (title) {
          title.textContent = category.label;
        }

        var description = cardLink.querySelector('[data-home-catalog-description]');
        if (description) {
          description.textContent = formatCatalogCategoryItemCount(category.count) + ' com estoque p' + '\u00fablico agora';
        }

        var route = cardLink.querySelector('[data-home-catalog-route]');
        if (route) {
          route.textContent = 'Ver ' + formatCatalogCategoryItemCount(category.count) + ' na loja';
        }
      }

      var footerLink = global.document.querySelector('[data-home-footer-catalog-slot="' + index + '"]');
      if (footerLink) {
        footerLink.setAttribute('href', '/loja?category=' + encodeURIComponent(category.slug));
        footerLink.textContent = category.label + ' na loja (' + category.count + ')';
      }
    });
  }

  function syncHomeCatalogLiveSummary(products, containerId) {
    if ((containerId || 'produtosGrid') !== 'produtosGrid') return;
    if (!global.document) return;

    var sourceProducts = getHomeCatalogSourceProducts(products);
    var categories = getHomeCatalogCategorySummary(sourceProducts, 4);
    if (!sourceProducts.length || !categories.length) return;
    var filtersRoot = global.document.querySelector('section#produtos .filters');
    var currentFilter = getActiveHomeCatalogFilterSlug(filtersRoot);
    var currentSearch = getHomeCatalogSearchTerm();
    var visibleProducts = Array.isArray(products) ? products : [];
    var visibleCategories = getHomeCatalogCategorySummary(visibleProducts, 4);
    var activeCategory = currentFilter !== 'all'
      ? categories.find(function (category) { return category.slug === currentFilter; })
      : null;
    var contextualCategory = activeCategory || (currentSearch ? visibleCategories[0] : null);
    var visibleCount = visibleProducts.length;

    var totalItemsNode = global.document.querySelector('[data-home-catalog-total]');
    if (totalItemsNode) {
      totalItemsNode.textContent = sourceProducts.length + (sourceProducts.length === 1 ? ' item público hoje' : ' itens públicos hoje');
    }

    var categoryCountNode = global.document.querySelector('[data-home-catalog-categories]');
    if (categoryCountNode) {
      categoryCountNode.textContent = categories.length + (categories.length === 1 ? ' categoria ativa' : ' categorias ativas');
    }

    var modeNode = global.document.querySelector('[data-home-catalog-mode]');
    if (modeNode) {
      modeNode.textContent = isQuoteOnlyCatalogMode()
        ? (currentSearch || activeCategory ? 'Seleção assistida' : 'Fechamento assistido')
        : (currentSearch || activeCategory ? 'Seleção para checkout' : 'Checkout direto');
    }

    var leaderNode = global.document.querySelector('[data-home-catalog-leader]');
    var primaryCtaNode = global.document.querySelector('[data-home-catalog-primary-cta]');
    var primaryCtaLabelNode = global.document.querySelector('[data-home-catalog-primary-cta-label]');
    var supportCtaNode = global.document.querySelector('[data-home-catalog-support-cta]');
    var bannerTitleNode = global.document.querySelector('[data-home-catalog-banner-title]');
    var sectionTitleNode = global.document.querySelector('[data-home-catalog-section-title]');
    var bannerDescNode = global.document.querySelector('[data-home-catalog-banner-desc]');
    var subtitleNode = global.document.querySelector('[data-home-catalog-subtitle]');
    var quoteOnly = isQuoteOnlyCatalogMode();
    var bannerTitle = 'Catálogo Tech10 disponível';
    var sectionTitle = 'Produtos em Destaque';
    var bannerDesc = quoteOnly
      ? categories[0].label + ' lidera o catálogo agora, com ' + formatCatalogCategoryItemCount(categories[0].count) + ' e fechamento assistido para concluir com segurança.'
      : categories[0].label + ' lidera o catálogo agora, com ' + formatCatalogCategoryItemCount(categories[0].count) + ' e checkout direto para concluir com segurança.';
    var subtitle = quoteOnly
      ? 'Comece por ' + categories[0].label + ' ou filtre o catálogo público para seguir com a seleção assistida da Tech10.'
      : 'Comece por ' + categories[0].label + ' ou filtre o catálogo público para seguir com carrinho e Pix direto.';
    var leaderLabel = 'Categoria em foco: ' + categories[0].label;
    var leaderHref = buildHomeCatalogStoreHref(categories[0].slug, null);
    var primaryLabel = 'Explorar ' + categories[0].label;
    var primaryHref = buildHomeCatalogStoreHref(categories[0].slug, null);
    var supportMessage = 'Olá! Vim pelo catálogo da Tech10 e quero ajuda para escolher um item de ' + categories[0].label + (quoteOnly ? ' com atendimento assistido.' : ' e concluir a compra direta.');

    if (currentSearch) {
      var resolvedSearchCategory = contextualCategory ? contextualCategory.label : 'Catálogo';
      bannerTitle = 'Busca ativa no catálogo';
      sectionTitle = visibleCount === 1 ? 'Resultado em Destaque' : 'Resultados em Destaque';
      bannerDesc = 'Busca ativa para "' + currentSearch + '" com ' + formatCatalogCategoryItemCount(visibleCount) + ' no catálogo público'
        + (contextualCategory ? ' em ' + resolvedSearchCategory : '')
        + (quoteOnly ? ' e seleção assistida para seguir com segurança.' : ' e checkout direto para seguir com segurança.');
      subtitle = visibleCount === 1
        ? (quoteOnly
            ? 'Revise o item encontrado para "' + currentSearch + '" ou abra a loja completa para continuar com a seleção assistida da Tech10.'
            : 'Revise o item encontrado para "' + currentSearch + '" ou abra a loja completa para seguir com o checkout direto da Tech10.')
        : (quoteOnly
            ? 'Revise os resultados para "' + currentSearch + '" ou abra a loja completa para continuar com a seleção assistida da Tech10.'
            : 'Revise os resultados para "' + currentSearch + '" ou abra a loja completa para seguir com o checkout direto da Tech10.');
      leaderLabel = 'Resultado em foco';
      leaderHref = buildHomeCatalogStoreHref(contextualCategory && contextualCategory.slug, currentSearch);
      primaryLabel = visibleCount === 1 ? 'Ver item na loja' : 'Ver resultados na loja';
      primaryHref = buildHomeCatalogStoreHref(contextualCategory && contextualCategory.slug, currentSearch);
      supportMessage = 'Olá! Vim pelo catálogo da Tech10 e quero ajuda para encontrar "' + currentSearch + '"'
        + (contextualCategory ? ' em ' + contextualCategory.label : '')
        + (quoteOnly ? ' com atendimento assistido.' : ' e concluir a compra direta.');
      if (totalItemsNode) {
        totalItemsNode.textContent = visibleCount === 1 ? '1 resultado ativo' : visibleCount + ' resultados ativos';
      }
      if (categoryCountNode) {
        categoryCountNode.textContent = contextualCategory ? contextualCategory.label : 'Busca no catálogo';
      }
    } else if (activeCategory) {
      bannerTitle = activeCategory.label + ' em foco';
      sectionTitle = activeCategory.label + ' em Destaque';
      bannerDesc = activeCategory.label + ' está em foco agora, com ' + formatCatalogCategoryItemCount(visibleCount) + ' no catálogo público' + (quoteOnly ? ' e atendimento assistido para seguir com segurança.' : ' e checkout direto para seguir com segurança.');
      subtitle = quoteOnly
        ? 'Veja os ' + formatCatalogCategoryItemCount(visibleCount) + ' de ' + activeCategory.label + ' ou abra a loja completa dessa categoria para continuar com a seleção assistida da Tech10.'
        : 'Veja os ' + formatCatalogCategoryItemCount(visibleCount) + ' de ' + activeCategory.label + ' ou abra a loja completa dessa categoria para seguir com carrinho e Pix direto.';
      leaderLabel = activeCategory.label + ' em foco';
      leaderHref = buildHomeCatalogStoreHref(activeCategory.slug, null);
      primaryLabel = 'Explorar ' + activeCategory.label;
      primaryHref = buildHomeCatalogStoreHref(activeCategory.slug, null);
      supportMessage = 'Olá! Vim pelo catálogo da Tech10 e quero ajuda para escolher um item de ' + activeCategory.label + (quoteOnly ? ' com atendimento assistido.' : ' e concluir a compra direta.');
      if (totalItemsNode) {
        totalItemsNode.textContent = formatCatalogCategoryItemCount(visibleCount) + ' em foco';
      }
      if (categoryCountNode) {
        categoryCountNode.textContent = 'Categoria filtrada';
      }
    }

    if (bannerTitleNode) {
      bannerTitleNode.textContent = bannerTitle;
    }
    if (sectionTitleNode) {
      sectionTitleNode.textContent = sectionTitle;
    }
    if (leaderNode) {
      leaderNode.textContent = leaderLabel;
      leaderNode.setAttribute('href', leaderHref);
    }
    if (primaryCtaNode) {
      primaryCtaNode.setAttribute('href', primaryHref);
    }
    if (primaryCtaLabelNode) {
      primaryCtaLabelNode.textContent = primaryLabel;
    }
    if (supportCtaNode) {
      supportCtaNode.setAttribute('data-support-message', supportMessage);
      if (global.TenantRoutes && typeof global.TenantRoutes.supportUrl === 'function') {
        supportCtaNode.setAttribute('href', global.TenantRoutes.supportUrl(supportMessage));
      }
    }
    if (bannerDescNode) {
      bannerDescNode.textContent = bannerDesc;
    }
    if (subtitleNode) {
      subtitleNode.textContent = subtitle;
    }

    var summaryNode = global.document.querySelector('[data-home-catalog-summary]');
    if (summaryNode) {
      if (currentSearch) {
        summaryNode.textContent = (visibleCount === 0
          ? (isQuoteOnlyCatalogMode()
              ? 'Nenhum item público encontrado para "' + currentSearch + '". Abra a loja completa ou ajuste a busca para seguir com a seleção assistida.'
              : 'Nenhum item público encontrado para "' + currentSearch + '". Abra a loja completa ou ajuste a busca para seguir com o checkout direto.')
          : formatCatalogCategoryCountLine(visibleCount)
            + (contextualCategory ? ' em ' + contextualCategory.label : '')
            + ' para "' + currentSearch + '" no catálogo público. '
            + (isQuoteOnlyCatalogMode()
              ? 'Abra a loja completa ou fale com a Tech10 para seguir com a seleção assistida.'
              : 'Abra a loja completa ou fale com a Tech10 para seguir com a compra direta.'));
      } else if (activeCategory) {
        summaryNode.textContent = activeCategory.label + ' com ' + formatCatalogCategoryCountLine(visibleCount)
          + ' em destaque agora. Continue pela home ou abra a loja completa dessa categoria para '
          + (isQuoteOnlyCatalogMode() ? 'seguir com a seleção assistida.' : 'seguir com o checkout direto.');
      } else {
        var categoryNames = categories.map(function (category) { return category.label; });
        summaryNode.textContent = sourceProducts.length + ' itens públicos em ' + categories.length + (categories.length === 1 ? ' categoria' : ' categorias') + '. Destaque agora para ' + categoryNames.join(', ') + '.';
      }
    }

    var tagsNode = global.document.querySelector('[data-home-catalog-tags]');
    if (tagsNode) {
      tagsNode.innerHTML = '';

      function appendTag(label, href, isActive) {
        var tag = global.document.createElement(href ? 'a' : 'span');
        tag.className = 'catalog-live-tag' + (href ? ' catalog-live-tag--link' : '') + (isActive ? ' catalog-live-tag--active' : '');
        tag.textContent = label;
        if (href) {
          tag.setAttribute('href', href);
        }
        tagsNode.appendChild(tag);
      }

      if (currentSearch) {
        appendTag('Busca ativa · ' + visibleCount, buildHomeCatalogStoreHref(contextualCategory && contextualCategory.slug, currentSearch), true);
        if (contextualCategory) {
          appendTag(contextualCategory.label + ' · ' + visibleCount, buildHomeCatalogStoreHref(contextualCategory.slug, currentSearch), false);
        }
        appendTag('Catálogo completo · ' + sourceProducts.length, buildHomeCatalogStoreHref(null, null), false);
      } else if (activeCategory) {
        appendTag(activeCategory.label + ' · ' + visibleCount, buildHomeCatalogStoreHref(activeCategory.slug, null), true);
        appendTag('Catálogo completo · ' + sourceProducts.length, buildHomeCatalogStoreHref(null, null), false);
        categories
          .filter(function (category) { return category.slug !== activeCategory.slug; })
          .slice(0, 2)
          .forEach(function (category) {
            appendTag(category.label + ' · ' + category.count, buildHomeCatalogStoreHref(category.slug, null), false);
          });
      } else {
        categories.forEach(function (category) {
          appendTag(category.label + ' · ' + category.count, buildHomeCatalogStoreHref(category.slug, null), false);
        });
      }
    }
  }

  function getProductPriceAmount(product) {
    return product && product.variants && product.variants[0] && product.variants[0].prices && product.variants[0].prices[0]
      ? Number(product.variants[0].prices[0].amount || 0)
      : 0;
  }

  function buildProductTitleCountMap(products) {
    var counts = {};
    (products || []).forEach(function (product) {
      var key = getProductTitleKey(product);
      if (!key) return;
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }

  function sortEditorialCategoryProducts(products, titleCounts) {
    return (products || []).slice().sort(function (a, b) {
      var aDuplicate = titleCounts[getProductTitleKey(a)] > 1 ? 1 : 0;
      var bDuplicate = titleCounts[getProductTitleKey(b)] > 1 ? 1 : 0;
      if (aDuplicate !== bDuplicate) return aDuplicate - bDuplicate;

      var priceDiff = getProductPriceAmount(b) - getProductPriceAmount(a);
      if (priceDiff !== 0) return priceDiff;

      var inventoryDiff = getProductInventoryAmount(b) - getProductInventoryAmount(a);
      if (inventoryDiff !== 0) return inventoryDiff;

      return String(a && a.title || '').localeCompare(String(b && b.title || ''), 'pt-BR');
    });
  }

  function rotateCategorySequence(categories, startIndex) {
    if (!categories || !categories.length) return [];
    var safeStart = startIndex >= 0 ? startIndex % categories.length : 0;
    return categories.slice(safeStart).concat(categories.slice(0, safeStart));
  }

  function buildEditorialCatalogCollections(products, options) {
    var sourceProducts = ((options && options.useInput === true)
      ? (Array.isArray(products) ? products : [])
      : getHomeCatalogSourceProducts(products))
      .filter(function (product) {
        return product && product.id && product.title;
      });
    var categories = getHomeCatalogCategorySummary(sourceProducts, 12);
    var titleCounts = buildProductTitleCountMap(sourceProducts);
    var grouped = {};

    categories.forEach(function (category) {
      grouped[category.slug] = sortEditorialCategoryProducts(sourceProducts.filter(function (product) {
        return matchesCategory(product, category.slug);
      }), titleCounts);
    });

    var featured = [];
    var featuredIds = {};
    var leaderCategory = categories[0] || null;

    function addFeatured(product, badgeLabel) {
      if (!product || !product.id || featuredIds[product.id]) return;
      featuredIds[product.id] = true;
      featured.push({
        product: product,
        badgeLabel: badgeLabel,
        categorySlug: getProductCategorySlug(product)
      });
    }

    if (leaderCategory && grouped[leaderCategory.slug] && grouped[leaderCategory.slug][0]) {
      addFeatured(grouped[leaderCategory.slug][0], 'Categoria em foco');
    }

    var secondaryProduct = sourceProducts
      .filter(function (product) { return !featuredIds[product.id]; })
      .sort(function (a, b) {
        var priceDiff = getProductPriceAmount(b) - getProductPriceAmount(a);
        if (priceDiff !== 0) return priceDiff;
        return getProductInventoryAmount(b) - getProductInventoryAmount(a);
      })
      .find(function (product) {
        if (!leaderCategory) return true;
        return !matchesCategory(product, leaderCategory.slug);
      });

    if (!secondaryProduct) {
      secondaryProduct = sourceProducts.find(function (product) {
        return !featuredIds[product.id];
      });
    }

    addFeatured(secondaryProduct, 'Outro destaque do catálogo');

    var orderedProducts = featured.map(function (entry) { return entry.product; });
    var leaderIndex = leaderCategory ? categories.findIndex(function (category) {
      return category.slug === leaderCategory.slug;
    }) : -1;
    var rotatedCategories = rotateCategorySequence(categories, leaderIndex >= 0 ? leaderIndex + 1 : 0);
    var hasRemaining = true;

    while (hasRemaining) {
      hasRemaining = false;
      rotatedCategories.forEach(function (category) {
        var bucket = grouped[category.slug] || [];
        while (bucket.length && featuredIds[bucket[0].id]) {
          bucket.shift();
        }
        if (bucket.length) {
          var nextProduct = bucket.shift();
          featuredIds[nextProduct.id] = true;
          orderedProducts.push(nextProduct);
          hasRemaining = true;
        }
      });
    }

    sourceProducts.forEach(function (product) {
      if (product && product.id && !featuredIds[product.id]) {
        orderedProducts.push(product);
        featuredIds[product.id] = true;
      }
    });

    return {
      sourceProducts: sourceProducts,
      categories: categories,
      featured: featured,
      orderedProducts: orderedProducts
    };
  }

  function getProductSearchHref(product) {
    if (!product) return '/loja';
    var metadata = product.metadata || {};
    var searchTerm = metadata.sku || product.title || '';
    if (!searchTerm) return '/loja';
    return '/loja?search=' + encodeURIComponent(searchTerm);
  }

  function getSpotlightStockState(product) {
    var inventoryQty = getProductInventoryAmount(product);
    if (inventoryQty <= 0) {
      return {
        label: 'Fora de estoque',
        className: 'catalog-spotlight-card__stock catalog-spotlight-card__stock--out',
        iconClass: 'fa-times-circle'
      };
    }
    if (inventoryQty <= 5) {
      return {
        label: 'Últimas ' + inventoryQty + ' un.',
        className: 'catalog-spotlight-card__stock catalog-spotlight-card__stock--low',
        iconClass: 'fa-fire'
      };
    }
    return {
      label: 'Em estoque',
      className: 'catalog-spotlight-card__stock catalog-spotlight-card__stock--in',
      iconClass: 'fa-check-circle'
    };
  }

  function buildSpotlightDescription(product, badgeLabel, categoryLabel) {
    var metadata = product && product.metadata ? product.metadata : {};
    var stockState = getSpotlightStockState(product);
    var parts = [];

    if (badgeLabel === 'Categoria em foco' && categoryLabel) {
      parts.push(categoryLabel + ' lidera o catálogo público da Tech10 agora.');
    } else if (categoryLabel) {
      parts.push(categoryLabel + ' também aparece no ERP com estoque público.');
    }

    if (stockState && stockState.label) {
      parts.push(stockState.label + ' na vitrine pública neste momento.');
    }

    if (metadata.sku) {
      parts.push('Busca por SKU pronta para acelerar o atendimento.');
    }

    return parts.join(' ');
  }

  function getHomeCatalogFeaturedBadgeLabel(index, options) {
    if (options && options.search) {
      return index === 0 ? 'Resultado em foco' : 'Outra opção encontrada';
    }
    if (options && options.categoryLabel) {
      return index === 0 ? options.categoryLabel + ' em foco' : 'Mais em ' + options.categoryLabel;
    }
    return index === 0 ? 'Categoria em foco' : 'Outro destaque do catálogo';
  }

  function getHomeCatalogFeaturedProducts(products, options) {
    var featured = buildEditorialCatalogCollections(products, { useInput: options && options.useInput === true }).featured.slice(0, 2);
    return featured.map(function (entry, index) {
      return {
        product: entry.product,
        categorySlug: entry.categorySlug,
        badgeLabel: getHomeCatalogFeaturedBadgeLabel(index, options)
      };
    });
  }

  function renderHomeCatalogFeaturedFallback(spotlightRoot, options) {
    if (!spotlightRoot) return;

    var title = 'Lendo o catálogo público da Tech10';
    var description = 'Os produtos mais fortes do ERP aparecem aqui assim que a vitrine sincroniza.';
    var href = buildHomeCatalogStoreHref(options && options.categorySlug, options && options.search);

    if (options && options.search) {
      title = 'Nenhum destaque para "' + options.search + '"';
      description = isQuoteOnlyCatalogMode()
        ? 'Abra a loja completa para revisar esse termo ou ajuste a busca para seguir com a seleção assistida.'
        : 'Abra a loja completa para revisar esse termo ou ajuste a busca para seguir com o checkout direto.';
    } else if (options && options.categoryLabel) {
      title = 'Sem destaque visível em ' + options.categoryLabel;
      description = isQuoteOnlyCatalogMode()
        ? 'Abra a loja completa dessa categoria para revisar o catálogo público e seguir com atendimento assistido.'
        : 'Abra a loja completa dessa categoria para revisar o catálogo público e seguir com o checkout direto.';
    }

    spotlightRoot.innerHTML = '<a class="catalog-spotlight-card catalog-spotlight-card--loading" href="' + href + '">' +
      '<div class="catalog-spotlight-card__image">' +
        '<i class="fas fa-box-open"></i>' +
      '</div>' +
      '<div class="catalog-spotlight-card__content">' +
        '<span class="catalog-spotlight-card__eyebrow">Catálogo sincronizado</span>' +
        '<h3 class="catalog-spotlight-card__title">' + String(title).replace(/</g, '&lt;') + '</h3>' +
        '<p class="catalog-spotlight-card__desc">' + String(description).replace(/</g, '&lt;') + '</p>' +
      '</div>' +
    '</a>';
  }

  function syncHomeCatalogFeaturedProducts(products, containerId) {
    if ((containerId || 'produtosGrid') !== 'produtosGrid') return;
    if (!global.document) return;

    var spotlightRoot = global.document.querySelector('[data-home-catalog-featured]');
    if (!spotlightRoot) return;

    var filtersRoot = global.document.querySelector('section#produtos .filters');
    var currentFilter = getActiveHomeCatalogFilterSlug(filtersRoot);
    var currentSearch = getHomeCatalogSearchTerm();
    var sourceProducts = getHomeCatalogSourceProducts(products);
    var activeCategory = currentFilter !== 'all'
      ? getHomeCatalogCategorySummary(sourceProducts, 12).find(function (category) {
          return category.slug === currentFilter;
        })
      : null;
    var featuredSource = (currentSearch || currentFilter !== 'all')
      ? (Array.isArray(products) ? products : [])
      : sourceProducts;
    var featuredProducts = getHomeCatalogFeaturedProducts(featuredSource, {
      useInput: true,
      search: currentSearch,
      categoryLabel: currentSearch ? '' : (activeCategory && activeCategory.label),
      categorySlug: activeCategory && activeCategory.slug
    });
    if (!featuredProducts.length) {
      renderHomeCatalogFeaturedFallback(spotlightRoot, {
        search: currentSearch,
        categoryLabel: activeCategory && activeCategory.label,
        categorySlug: activeCategory && activeCategory.slug
      });
      return;
    }

    var fallbackImg = (global.TENANT_CONFIG && global.TENANT_CONFIG.brand && global.TENANT_CONFIG.brand.fallbackProductImageUrl)
      || '/imagem/propaganda loja/tecnologia.jpeg';

    spotlightRoot.innerHTML = featuredProducts.map(function (entry, index) {
      var product = entry.product;
      var metadata = product.metadata || {};
      var categoryLabel = normalizeCatalogText(product.category && product.category.name) || 'Catálogo';
      var badgeLabel = entry.badgeLabel || 'Produto em destaque';
      var stockState = getSpotlightStockState(product);
      var thumbnail = product.thumbnail || (product.images && product.images[0] && product.images[0].url) || fallbackImg;
      var spotlightClass = index === 0 ? ' catalog-spotlight-card--primary' : ' catalog-spotlight-card--secondary';
      var ctaLabel = currentSearch
        ? (index === 0 ? 'Abrir resultado' : 'Ver alternativa')
        : (index === 0 ? 'Selecionar este item' : 'Ver alternativa');
      var metaBits = [
        categoryLabel,
        metadata.brand ? 'Marca ' + metadata.brand : '',
        metadata.sku ? 'SKU ' + metadata.sku : ''
      ].filter(Boolean);

      return '<a class="catalog-spotlight-card' + spotlightClass + '" href="' + getProductSearchHref(product) + '">' +
        '<div class="catalog-spotlight-card__image">' +
          '<img src="' + String(thumbnail).replace(/"/g, '&quot;') + '" alt="' + String(product.title || '').replace(/"/g, '&quot;') + '" loading="lazy" onerror="this.src=\'' + fallbackImg + '\'" />' +
        '</div>' +
        '<div class="catalog-spotlight-card__content">' +
          '<span class="catalog-spotlight-card__eyebrow">' + badgeLabel + '</span>' +
          '<h3 class="catalog-spotlight-card__title">' + String(product.title || '').replace(/</g, '&lt;') + '</h3>' +
          '<div class="catalog-spotlight-card__meta">' + metaBits.map(function (bit) {
            return '<span>' + String(bit).replace(/</g, '&lt;') + '</span>';
          }).join('') + '</div>' +
          '<p class="catalog-spotlight-card__desc">' + buildSpotlightDescription(product, badgeLabel, categoryLabel).replace(/</g, '&lt;') + '</p>' +
          '<div class="catalog-spotlight-card__footer">' +
            '<span class="catalog-spotlight-card__price">R$ ' + formatPrice(getProductPriceAmount(product)) + '</span>' +
            '<span class="' + stockState.className + '"><i class="fas ' + stockState.iconClass + '"></i> ' + stockState.label + '</span>' +
            '<span class="catalog-spotlight-card__cta">' + ctaLabel + ' <i class="fas fa-arrow-right"></i></span>' +
          '</div>' +
        '</div>' +
      '</a>';
    }).join('');
  }

  function buildProductDescription(product, categoryName) {
    var productTitle = normalizeCatalogText(product && product.title);
    var categoryLabel = normalizeCatalogText(categoryName || (product && product.category && product.category.name));
    var rawDescription = normalizeCatalogText(product && product.description);

    if (rawDescription && rawDescription.toLowerCase() !== productTitle.toLowerCase()) {
      var displayDescription = rawDescription;

      if (rawDescription.length < 18 && categoryLabel) {
        displayDescription = categoryLabel + ' | ' + rawDescription;
      }

      if (displayDescription.length > 90) {
        return displayDescription.substring(0, 87).trimEnd() + '...';
      }

      return displayDescription;
    }

    if (categoryLabel) {
      return isQuoteOnlyCatalogMode()
        ? 'Categoria ' + categoryLabel + ' com atendimento assistido.'
        : 'Categoria ' + categoryLabel + ' com compra direta disponível.';
    }

    return isQuoteOnlyCatalogMode()
      ? 'Produto disponível para atendimento assistido.'
      : 'Produto disponível para compra direta.';
  }

  function resetProductImageProfile(media) {
    if (!media || !media.classList) return;
    media.classList.remove(
      'lp-card-img--landscape',
      'lp-card-img--portrait',
      'lp-card-img--square',
      'lp-card-img--embedded',
      'lp-card-img--fallback'
    );
  }

  function applyProductImageProfile(img, fallbackImg) {
    if (!img || !img.closest) return;
    var media = img.closest('.lp-card-img');
    if (!media) return;

    resetProductImageProfile(media);

    var currentSrc = String(img.currentSrc || img.src || '');
    if (currentSrc.indexOf('data:') === 0) {
      media.classList.add('lp-card-img--embedded');
    }

    if (fallbackImg && currentSrc.indexOf(fallbackImg) !== -1) {
      media.classList.add('lp-card-img--fallback');
      return;
    }

    var width = Number(img.naturalWidth || 0);
    var height = Number(img.naturalHeight || 0);
    if (!width || !height) return;

    var ratio = width / height;
    if (ratio >= 1.35) {
      media.classList.add('lp-card-img--landscape');
      return;
    }
    if (ratio <= 0.85) {
      media.classList.add('lp-card-img--portrait');
      return;
    }
    media.classList.add('lp-card-img--square');
  }

  function enhanceProductCardImages(container, fallbackImg) {
    if (!container || !container.querySelectorAll) return;

    container.querySelectorAll('.lp-card-img img').forEach(function (img) {
      var handleProfile = function () {
        applyProductImageProfile(img, fallbackImg);
      };

      if (img.complete) {
        handleProfile();
      } else {
        img.addEventListener('load', handleProfile, { once: true });
      }

      img.addEventListener('error', function () {
        var media = img.closest('.lp-card-img');
        resetProductImageProfile(media);
        if (media) {
          media.classList.add('lp-card-img--fallback');
        }
      }, { once: true });
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Controle de quantidade por produto
  // ─────────────────────────────────────────────────────────────────────────
  var _qty = {}; // { productId: quantidade }

  function getQty(productId) {
    return _qty[productId] || 1;
  }

  function setQty(productId, val, max) {
    var n = parseInt(val, 10);
    if (isNaN(n) || n < 1) n = 1;
    if (max && n > max) n = max;
    _qty[productId] = n;
    return n;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Carregar produtos da API
  // ─────────────────────────────────────────────────────────────────────────
  async function loadProducts(opts) {
    var options = opts || {};
    var config = global.API_CONFIG || {};
    var adapter = global.MarketplaceAdapter;
    var limit = options.limit || 50;
    var offset = options.offset || 0;
    var category = options.category || null;
    var search = options.search || null;

    var products = [];
    if (adapter && adapter.getRuntimeConfig) {
      global.__tech10_runtime_config = await adapter.getRuntimeConfig();
    }
    applyCatalogModePresentation();
    if (adapter && adapter.getProducts) {
      products = await adapter.getProducts({ limit: limit, offset: offset, category_id: category, q: search });
    } else {
      var base = config.STORE_API || (config.ACTIVE_URL + '/store');
      try {
        var url = base + '/products?limit=' + limit + '&offset=' + offset;
        if (category) url += '&category=' + encodeURIComponent(category);
        if (search) url += '&q=' + encodeURIComponent(search);
        var res = await fetch(url);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        var data = await res.json();
        products = data.products || [];
      } catch (err) {
        console.error('Erro ao carregar produtos:', err);
        return [];
      }
    }

    products = (products || []).map(function (p) {
      return p ? Object.assign({}, p, { categorySlug: toCategorySlug(p.category) }) : p;
    });
    var titleCounts = {};
    products.forEach(function (product) {
      var key = getProductTitleKey(product);
      if (!key) return;
      titleCounts[key] = (titleCounts[key] || 0) + 1;
    });
    global.__tech10_product_title_counts = titleCounts;
    global.__tech10_products = (global.__tech10_products || []);
    if (offset === 0) {
      global.__tech10_products = products;
    } else {
      global.__tech10_products = global.__tech10_products.concat(products);
    }
    return products;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Renderizar produtos com cards estilo marketplace + controles de quantidade
  // ─────────────────────────────────────────────────────────────────────────
  function renderProducts(products, containerId) {
    var container = document.getElementById(containerId || 'produtosGrid');
    if (!container) return;
    applyCatalogModePresentation();
    var isHomeCatalogGrid = (containerId || 'produtosGrid') === 'produtosGrid'
      && !!(global.document && global.document.querySelector('[data-home-catalog-featured]'));
    var renderList = isHomeCatalogGrid && typeof global.getTech10EditorialCatalogCollections === 'function'
      ? global.getTech10EditorialCatalogCollections(products, { useInput: true }).orderedProducts
      : products;

    syncHomeCatalogFilters(products, containerId);
    syncHomeCatalogFilterContext(renderList, containerId);
    syncHomeCatalogEntryPoints(products, containerId);
    syncHomeCatalogLiveSummary(products, containerId);
    syncHomeCatalogFeaturedProducts(products, containerId);

    if (!renderList || !Array.isArray(renderList) || renderList.length === 0) {
      if (typeof global.renderTech10EmptyState === 'function') {
        global.renderTech10EmptyState(container);
      } else {
        var emptyShopHref = (global.TenantRoutes && global.TenantRoutes.shopHome) || '/loja';
        container.innerHTML = '<div class="lp-empty"><i class="fas fa-box-open"></i><p>Nenhum produto encontrado nesta categoria.</p><a href="' + emptyShopHref + '" class="lp-empty-link">Ver todos os produtos</a></div>';
      }
      return;
    }

    var fallbackImg = (global.TENANT_CONFIG && global.TENANT_CONFIG.brand && global.TENANT_CONFIG.brand.fallbackProductImageUrl)
      || '/imagem/propaganda loja/tecnologia.jpeg';
    var runtimeCommerce = getRuntimeCommerce();
    var capabilities = runtimeCommerce.capabilities || {};
    var assistedSelectionEnabled = hasAssistedSelectionBridge();
    var cartEnabled = assistedSelectionEnabled || !(capabilities && capabilities.cart === false);

    var html = renderList
      .filter(function (p) { return p && p.id && p.title; })
      .map(function (product) {
        var variant = product.variants && product.variants[0];
        var price = (variant && variant.prices && variant.prices[0] && variant.prices[0].amount) ? variant.prices[0].amount : 0;
        var priceFormatted = formatPrice(price);
        var thumbnail = product.thumbnail || (product.images && product.images[0] && product.images[0].url) || fallbackImg;
        var inventoryQty = (variant && typeof variant.inventory_quantity !== 'undefined') ? variant.inventory_quantity : 0;
        var isInStock = inventoryQty > 0;
        var stockText = isInStock ? (inventoryQty <= 5 ? ('Últimas ' + inventoryQty + ' un.') : 'Em estoque') : 'Fora de estoque';
        var stockClass = isInStock ? 'in-stock' : 'out-of-stock';
        var catSlug = product.categorySlug || toCategorySlug(product.category);
        var catName = (product.category && product.category.name) ? product.category.name : '';
        var description = buildProductDescription(product, catName);
        var variantId = (variant && variant.id) ? variant.id : '';
        var maxQty = inventoryQty > 0 ? inventoryQty : 99;
        var pid = product.id;
        var actionMode = assistedSelectionEnabled ? 'assisted' : (cartEnabled ? 'cart' : 'quote');
        var metaChips = getProductMetaChips(product);
        var metaHtml = metaChips.length
          ? '<div class="lp-card-meta">' + metaChips.map(function (chip) {
              var chipModifierClass = chip.label === 'SKU'
                ? ' lp-card-meta-chip--sku'
                : chip.label === 'Marca'
                  ? ' lp-card-meta-chip--brand'
                  : '';
              return '<span class="lp-card-meta-chip' + chipModifierClass + '"><strong>' + chip.label + ':</strong> ' + String(chip.value).replace(/</g, '&lt;') + '</span>';
            }).join('') + '</div>'
          : '';
        var supportNoteHtml = assistedSelectionEnabled
          ? '<div class="lp-card-mode-note"><i class="fas fa-list-check"></i> Seleção assistida pela Tech10.</div>'
          : (!cartEnabled
          ? '<div class="lp-card-mode-note"><i class="fas fa-headset"></i> Atendimento assistido Tech10.</div>'
          : '');
        var duplicateIdentityHtml = isDuplicateTitleProduct(product) && product.metadata && product.metadata.sku
          ? '<div class="lp-card-identity-note"><i class="fas fa-fingerprint"></i> Identifique este item pelo SKU <strong>' + String(product.metadata.sku).replace(/</g, '&lt;') + '</strong></div>'
          : '';
        var buttonLabel = getCatalogButtonLabel(actionMode);
        var compactButtonLabel = actionMode === 'assisted'
          ? 'Selecionar'
          : actionMode === 'quote'
            ? 'Pedir'
            : 'Adicionar';
        var buttonLabelHtml = isInStock
          ? '<span class="lp-btn-add-label lp-btn-add-label--full">' + buttonLabel + '</span>' +
            '<span class="lp-btn-add-label lp-btn-add-label--compact">' + compactButtonLabel + '</span>'
          : '<i class="fas fa-times-circle"></i> Indisponível';
        var qtyControlHtml = cartEnabled
          ? '<div class="lp-qty-ctrl" data-pid="' + pid + '">' +
              '<button class="lp-qty-btn lp-qty-minus" type="button" aria-label="Diminuir quantidade">−</button>' +
              '<span class="lp-qty-val">1</span>' +
              '<button class="lp-qty-btn lp-qty-plus" type="button" aria-label="Aumentar quantidade">+</button>' +
            '</div>'
          : '';

        return '<div class="lp-card ' + stockClass + '" data-product-id="' + pid + '" data-category="' + catSlug.replace(/"/g, '') + '" data-variant-id="' + variantId + '" data-max-qty="' + maxQty + '">' +
          '<div class="lp-card-img" onclick="window.__openProductModal && window.__openProductModal(\'' + pid + '\')" style="cursor:pointer">' +
            '<img src="' + thumbnail.replace(/"/g, '&quot;') + '" alt="' + (product.title || '').replace(/"/g, '&quot;') + '" loading="lazy" onerror="this.src=\'' + fallbackImg + '\'">' +
            '<div class="lp-card-overlay"><i class="fas fa-eye"></i> Ver detalhes</div>' +
            (!isInStock ? '<span class="lp-badge lp-badge-out">Indisponível</span>' : '') +
            (isInStock && inventoryQty <= 5 ? '<span class="lp-badge lp-badge-low"><i class="fas fa-fire"></i> Últimas unidades!</span>' : '') +
          '</div>' +
          '<div class="lp-card-body">' +
            (catName ? '<span class="lp-card-cat">' + catName + '</span>' : '') +
            '<h3 class="lp-card-title" onclick="window.__openProductModal && window.__openProductModal(\'' + pid + '\')">' + (product.title || '').replace(/</g, '&lt;') + '</h3>' +
            metaHtml +
            duplicateIdentityHtml +
            '<p class="lp-card-desc">' + description.replace(/</g, '&lt;') + '</p>' +
            '<div class="lp-card-commerce">' +
              '<div class="lp-card-price">R$ ' + priceFormatted + '</div>' +
              '<div class="lp-card-stock ' + stockClass + '">' +
                '<i class="fas ' + (isInStock ? 'fa-check-circle' : 'fa-times-circle') + '"></i>' +
                '<span>' + stockText + '</span>' +
              '</div>' +
            '</div>' +
            supportNoteHtml +
            '<div class="lp-card-actions ' + (cartEnabled ? 'cart-mode' : 'quote-mode') + '">' +
              qtyControlHtml +
              '<button class="lp-btn-add ' + stockClass + '" type="button" data-pid="' + pid + '" data-vid="' + variantId + '" data-action="' + actionMode + '" data-product-title="' + (product.title || '').replace(/"/g, '&quot;') + '" ' + (!isInStock ? 'disabled' : '') + '>' +
                buttonLabelHtml +
              '</button>' +
            '</div>' +
          '</div>' +
        '</div>';
      })
      .join('');

    container.innerHTML = html;
    enhanceProductCardImages(container, fallbackImg);
    _attachCardEvents(container);

    // Esconder bloco "Marketplace em Breve" quando há produtos
    if ((containerId || 'produtosGrid') === 'produtosGrid') {
      var soon = document.querySelector('.marketplace-soon');
      if (soon) soon.style.display = 'none';
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Eventos dos cards (delegação)
  // ─────────────────────────────────────────────────────────────────────────
  function _attachCardEvents(container) {
    container.addEventListener('click', function (e) {
      var target = e.target;

      // Botão − (diminuir)
      if (target.classList.contains('lp-qty-minus')) {
        var ctrl = target.closest('.lp-qty-ctrl');
        if (!ctrl) return;
        var pid = ctrl.dataset.pid;
        var card = ctrl.closest('.lp-card');
        var max = card ? parseInt(card.dataset.maxQty, 10) : 99;
        var curr = getQty(pid);
        var next = setQty(pid, curr - 1, max);
        ctrl.querySelector('.lp-qty-val').textContent = next;
        return;
      }

      // Botão + (aumentar)
      if (target.classList.contains('lp-qty-plus')) {
        var ctrl = target.closest('.lp-qty-ctrl');
        if (!ctrl) return;
        var pid = ctrl.dataset.pid;
        var card = ctrl.closest('.lp-card');
        var max = card ? parseInt(card.dataset.maxQty, 10) : 99;
        var curr = getQty(pid);
        var next = setQty(pid, curr + 1, max);
        ctrl.querySelector('.lp-qty-val').textContent = next;
        return;
      }

      // Botão Adicionar ao Carrinho
      if (target.classList.contains('lp-btn-add') || target.closest('.lp-btn-add')) {
        var btn = target.classList.contains('lp-btn-add') ? target : target.closest('.lp-btn-add');
        if (btn.disabled) return;
        if (btn.dataset.action === 'quote') {
          _requestQuote(btn.dataset.pid, btn);
          return;
        }
        var pid = btn.dataset.pid;
        var vid = btn.dataset.vid;
        var qty = getQty(pid);
        _addToCart(vid, pid, qty, btn);
        return;
      }
    });
  }

  function _requestQuote(productId, btn) {
    var products = global.__tech10_products || [];
    var product = products.find(function (item) {
      return String(item.id) === String(productId);
    });
    var quantity = getQty(productId);
    var whatsappUrl = getSupportWhatsappUrl(product, quantity);

    if (btn) {
      btn.innerHTML = '<i class="fas fa-paper-plane"></i> Abrindo atendimento...';
      btn.disabled = true;
      setTimeout(function () {
        btn.disabled = false;
        btn.innerHTML = getCatalogButtonLabel('quote');
      }, 1800);
    }

    if (whatsappUrl) {
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    if (typeof alert !== 'undefined') {
      alert('Atendimento indisponível no momento. Tente novamente pelo WhatsApp da Tech10.');
    }
  }

  async function _addToCart(variantId, productId, qty, btn) {
    if (!variantId || !productId) return;
    var actionMode = btn && btn.dataset && btn.dataset.action ? btn.dataset.action : 'cart';
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = getCatalogButtonLoadingLabel(actionMode);
    }
    try {
      var cart = typeof global.getActiveStorefrontCart === 'function'
        ? global.getActiveStorefrontCart()
        : (global.storefrontCart || null);
      if (cart && cart.addItem) {
        await cart.addItem(variantId, productId, qty || 1, false);
      } else if (typeof global.addToStorefrontCart === 'function') {
        await global.addToStorefrontCart(variantId, productId, false, qty || 1);
      }
      if (btn) {
        btn.innerHTML = getCatalogButtonSuccessLabel(actionMode);
        btn.style.background = '#10b981';
        setTimeout(function () {
          if (btn) {
            btn.disabled = false;
            btn.innerHTML = getCatalogButtonLabel(actionMode);
            btn.style.background = '';
          }
        }, 2000);
      }
    } catch (err) {
      console.error('[load-products] addToCart error:', err);
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = getCatalogButtonLabel(actionMode);
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Filtro por categoria e busca (usa __tech10_products em memória)
  // ─────────────────────────────────────────────────────────────────────────
  global.filterTech10Products = function (opts) {
    var list = global.__tech10_products || [];
    var category = (opts && opts.category) ? opts.category : 'all';
    var search = (opts && opts.search) ? String(opts.search).toLowerCase().trim() : '';

    if (category !== 'all') {
      list = list.filter(function (p) { return matchesCategory(p, category); });
    }
    if (search) {
      list = list.filter(function (p) {
        return matchesCatalogSearch(p, search);
      });
    }
    renderProducts(list, (opts && opts.containerId) ? opts.containerId : 'produtosGrid');
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Exports globais
  // ─────────────────────────────────────────────────────────────────────────
  function publishLegacyCatalogAliases() {
    global.addToCartMedusa = global.addToStorefrontCart;
  }

  global.loadProductsFromAPI = loadProducts;
  global.renderProductsFromAPI = renderProducts;
  global.getTech10EditorialCatalogCollections = buildEditorialCatalogCollections;

  global.addToStorefrontCart = async function (variantId, productId, buyNow, quantity) {
    var cart = typeof global.getActiveStorefrontCart === 'function'
      ? global.getActiveStorefrontCart()
      : (global.storefrontCart || null);
    if (cart && cart.addItem) {
      await cart.addItem(variantId, productId, quantity || 1, buyNow);
    } else {
      console.warn('Carrinho não inicializado. Carregue cart-storefront.js.');
    }
  };

  publishLegacyCatalogAliases();

})(typeof window !== 'undefined' ? window : this);
