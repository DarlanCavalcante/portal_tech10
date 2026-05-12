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
    var quoteOnly = (config.CHECKOUT_MODE || 'quote_only') === 'quote_only';
    return {
      checkoutMode: config.CHECKOUT_MODE || 'quote_only',
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

    function appendButton(label, slug, isActive) {
      var button = global.document.createElement('button');
      button.className = 'filter-btn' + (isActive ? ' active' : '');
      button.setAttribute('data-filter', slug);
      button.textContent = label;
      button.addEventListener('click', function (event) {
        if (typeof global.handleFilterClick === 'function') {
          global.handleFilterClick(event);
        }
      });
      filtersRoot.appendChild(button);
    }

    appendButton('Todos', 'all', currentActive === 'all');
    categories.forEach(function (category) {
      appendButton(category.label, category.slug, currentActive === category.slug);
    });
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
      modeNode.textContent = 'Fechamento assistido';
    }

    var leaderNode = global.document.querySelector('[data-home-catalog-leader]');
    if (leaderNode) {
      leaderNode.textContent = 'Categoria em foco: ' + categories[0].label;
      leaderNode.setAttribute('href', '/loja?category=' + encodeURIComponent(categories[0].slug));
    }

    var summaryNode = global.document.querySelector('[data-home-catalog-summary]');
    if (summaryNode) {
      var categoryNames = categories.map(function (category) { return category.label; });
      summaryNode.textContent = sourceProducts.length + ' itens públicos em ' + categories.length + (categories.length === 1 ? ' categoria' : ' categorias') + '. Destaque agora para ' + categoryNames.join(', ') + '.';
    }

    var tagsNode = global.document.querySelector('[data-home-catalog-tags]');
    if (tagsNode) {
      tagsNode.innerHTML = '';
      categories.forEach(function (category) {
        var tag = global.document.createElement('a');
        tag.className = 'catalog-live-tag catalog-live-tag--link';
        tag.setAttribute('href', '/loja?category=' + encodeURIComponent(category.slug));
        tag.textContent = category.label + ' · ' + category.count;
        tagsNode.appendChild(tag);
      });
    }
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
      return 'Categoria ' + categoryLabel + ' com atendimento assistido.';
    }

    return 'Produto disponível para atendimento assistido.';
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

    syncHomeCatalogFilters(products, containerId);
    syncHomeCatalogEntryPoints(products, containerId);
    syncHomeCatalogLiveSummary(products, containerId);

    if (!products || !Array.isArray(products) || products.length === 0) {
      var emptyShopHref = (global.TenantRoutes && global.TenantRoutes.shopHome) || '/loja';
      container.innerHTML = '<div class="lp-empty"><i class="fas fa-box-open"></i><p>Nenhum produto encontrado nesta categoria.</p><a href="' + emptyShopHref + '" class="lp-empty-link">Ver todos os produtos</a></div>';
      return;
    }

    var fallbackImg = (global.TENANT_CONFIG && global.TENANT_CONFIG.brand && global.TENANT_CONFIG.brand.fallbackProductImageUrl)
      || '/imagem/propaganda loja/tecnologia.jpeg';
    var runtimeCommerce = getRuntimeCommerce();
    var capabilities = runtimeCommerce.capabilities || {};
    var assistedSelectionEnabled = hasAssistedSelectionBridge();
    var cartEnabled = assistedSelectionEnabled || !(capabilities && capabilities.cart === false);

    var html = products
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
              return '<span class="lp-card-meta-chip"><strong>' + chip.label + ':</strong> ' + String(chip.value).replace(/</g, '&lt;') + '</span>';
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
            '<div class="lp-card-price">R$ ' + priceFormatted + '</div>' +
            '<div class="lp-card-stock ' + stockClass + '">' +
              '<i class="fas ' + (isInStock ? 'fa-check-circle' : 'fa-times-circle') + '"></i>' +
              '<span>' + stockText + '</span>' +
            '</div>' +
            supportNoteHtml +
            '<div class="lp-card-actions ' + (cartEnabled ? 'cart-mode' : 'quote-mode') + '">' +
              qtyControlHtml +
              '<button class="lp-btn-add ' + stockClass + '" type="button" data-pid="' + pid + '" data-vid="' + variantId + '" data-action="' + actionMode + '" data-product-title="' + (product.title || '').replace(/"/g, '&quot;') + '" ' + (!isInStock ? 'disabled' : '') + '>' +
                (isInStock ? buttonLabel : '<i class="fas fa-times-circle"></i> Indisponível') +
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
