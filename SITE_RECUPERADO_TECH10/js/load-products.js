/**
 * Carregar e renderizar produtos — Tech10
 * Usa MarketplaceAdapter same-origin quando disponível.
 * Carregue na ordem: api-config.js → api-adapter.js → load-products.js
 */
(function (global) {
  'use strict';

  function getRuntimeCommerce() {
    var runtime = global.__tech10_runtime_config || {};
    return runtime.commerce || { capabilities: { cart: true } };
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
    'redes-conectividade': ['redes-conectividade', 'roteadores-wifi', 'switches-hubs'],
    'eletronicos-tecnologia': ['eletronicos-tecnologia', 'computadores', 'notebooks-gamer', 'notebooks-office', 'desktops', 'all-in-one', 'smartphones', 'android', 'iphone-apple', 'perifericos', 'teclados', 'mouses', 'monitores', 'webcams-headsets', 'componentes', 'ssd-hd', 'memoria-ram', 'processadores', 'placas-video', 'nobreaks-energia', 'nobreaks', 'estabilizadores', 'redes-conectividade', 'roteadores-wifi', 'switches-hubs'],
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

    if (!products || !Array.isArray(products) || products.length === 0) {
      var emptyShopHref = (global.TenantRoutes && global.TenantRoutes.shopHome) || '/loja';
      container.innerHTML = '<div class="lp-empty"><i class="fas fa-box-open"></i><p>Nenhum produto encontrado nesta categoria.</p><a href="' + emptyShopHref + '" class="lp-empty-link">Ver todos os produtos</a></div>';
      return;
    }

    var fallbackImg = (global.TENANT_CONFIG && global.TENANT_CONFIG.brand && global.TENANT_CONFIG.brand.fallbackProductImageUrl)
      || '/imagem/propaganda loja/tecnologia.jpeg';
    var runtimeCommerce = getRuntimeCommerce();
    var cartEnabled = !(runtimeCommerce.capabilities && runtimeCommerce.capabilities.cart === false);

    var html = products
      .filter(function (p) { return p && p.id && p.title; })
      .map(function (product) {
        var variant = product.variants && product.variants[0];
        var price = (variant && variant.prices && variant.prices[0] && variant.prices[0].amount) ? variant.prices[0].amount : 0;
        var priceFormatted = formatPrice(price);
        var thumbnail = product.thumbnail || (product.images && product.images[0] && product.images[0].url) || fallbackImg;
        var description = product.description ? product.description.substring(0, 90) + '...' : 'Sem descrição';
        var inventoryQty = (variant && typeof variant.inventory_quantity !== 'undefined') ? variant.inventory_quantity : 0;
        var isInStock = inventoryQty > 0;
        var stockText = isInStock ? (inventoryQty <= 5 ? ('Últimas ' + inventoryQty + ' un.') : 'Em estoque') : 'Fora de estoque';
        var stockClass = isInStock ? 'in-stock' : 'out-of-stock';
        var catSlug = product.categorySlug || toCategorySlug(product.category);
        var catName = (product.category && product.category.name) ? product.category.name : '';
        var variantId = (variant && variant.id) ? variant.id : '';
        var maxQty = inventoryQty > 0 ? inventoryQty : 99;
        var pid = product.id;
        var actionMode = cartEnabled ? 'cart' : 'quote';
        var metaChips = getProductMetaChips(product);
        var metaHtml = metaChips.length
          ? '<div class="lp-card-meta">' + metaChips.map(function (chip) {
              return '<span class="lp-card-meta-chip"><strong>' + chip.label + ':</strong> ' + String(chip.value).replace(/</g, '&lt;') + '</span>';
            }).join('') + '</div>'
          : '';
        var supportNoteHtml = !cartEnabled
          ? '<div class="lp-card-mode-note"><i class="fas fa-headset"></i> Venda assistida via atendimento Tech10.</div>'
          : '';
        var duplicateIdentityHtml = isDuplicateTitleProduct(product) && product.metadata && product.metadata.sku
          ? '<div class="lp-card-identity-note"><i class="fas fa-fingerprint"></i> Identifique este item pelo SKU <strong>' + String(product.metadata.sku).replace(/</g, '&lt;') + '</strong></div>'
          : '';
        var buttonLabel = cartEnabled
          ? '<i class="fas fa-shopping-cart"></i> Adicionar'
          : '<i class="fab fa-whatsapp"></i> Falar com a Tech10';
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
        btn.innerHTML = '<i class="fab fa-whatsapp"></i> Falar com a Tech10';
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
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adicionando...';
    }
    try {
      for (var i = 0; i < (qty || 1); i++) {
        var cart = typeof global.getActiveStorefrontCart === 'function'
          ? global.getActiveStorefrontCart()
          : (global.storefrontCart || null);
        if (cart && cart.addItem) {
          await cart.addItem(variantId, productId, 1, false);
        } else if (typeof global.addToStorefrontCart === 'function') {
          await global.addToStorefrontCart(variantId, productId, false);
        }
      }
      if (btn) {
        btn.innerHTML = '<i class="fas fa-check"></i> Adicionado!';
        btn.style.background = '#10b981';
        setTimeout(function () {
          if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-shopping-cart"></i> Adicionar';
            btn.style.background = '';
          }
        }, 2000);
      }
    } catch (err) {
      console.error('[load-products] addToCart error:', err);
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-shopping-cart"></i> Adicionar';
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
        return (p.title || '').toLowerCase().indexOf(search) !== -1 ||
               (p.description || '').toLowerCase().indexOf(search) !== -1;
      });
    }
    renderProducts(list, (opts && opts.containerId) ? opts.containerId : 'produtosGrid');
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Exports globais
  // ─────────────────────────────────────────────────────────────────────────
  global.loadProductsFromAPI = loadProducts;
  global.renderProductsFromAPI = renderProducts;

  global.addToStorefrontCart = async function (variantId, productId, buyNow) {
    var cart = typeof global.getActiveStorefrontCart === 'function'
      ? global.getActiveStorefrontCart()
      : (global.storefrontCart || null);
    if (cart && cart.addItem) {
      await cart.addItem(variantId, productId, 1, buyNow);
    } else {
      console.warn('Carrinho não inicializado. Carregue cart-storefront.js.');
    }
  };

  global.addToCartMedusa = global.addToStorefrontCart;

})(typeof window !== 'undefined' ? window : this);
