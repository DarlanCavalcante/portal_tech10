/**
 * Carregar e renderizar produtos — Tech10
 * Usa MarketplaceAdapter (VivaCommerce) quando API_CONFIG.provider === 'vivacommerce'.
 * Carregue na ordem: api-config.js → api-adapter.js → load-products.js
 */
(function (global) {
  'use strict';

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
    const raw = (cat.handle || cat.name || '').toLowerCase().replace(/\s+/g, '-');
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
    if (config.provider === 'vivacommerce' && adapter && adapter.getProducts) {
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
      container.innerHTML = '<div class="lp-empty"><i class="fas fa-box-open"></i><p>Nenhum produto encontrado nesta categoria.</p><a href="/tech10/produtos.html" class="lp-empty-link">Ver todos os produtos</a></div>';
      return;
    }

    var basePath = (typeof window !== 'undefined' && window.location.pathname.indexOf('/tech10') !== -1) ? '/tech10' : '';
    var fallbackImg = basePath + '/imagem/propaganda loja/tecnologia.jpeg';

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
            '<p class="lp-card-desc">' + description.replace(/</g, '&lt;') + '</p>' +
            '<div class="lp-card-price">R$ ' + priceFormatted + '</div>' +
            '<div class="lp-card-stock ' + stockClass + '">' +
              '<i class="fas ' + (isInStock ? 'fa-check-circle' : 'fa-times-circle') + '"></i>' +
              '<span>' + stockText + '</span>' +
            '</div>' +
            '<div class="lp-card-actions">' +
              '<div class="lp-qty-ctrl" data-pid="' + pid + '">' +
                '<button class="lp-qty-btn lp-qty-minus" type="button" aria-label="Diminuir quantidade">−</button>' +
                '<span class="lp-qty-val">1</span>' +
                '<button class="lp-qty-btn lp-qty-plus" type="button" aria-label="Aumentar quantidade">+</button>' +
              '</div>' +
              '<button class="lp-btn-add ' + stockClass + '" type="button" data-pid="' + pid + '" data-vid="' + variantId + '" ' + (!isInStock ? 'disabled' : '') + '>' +
                (isInStock ? '<i class="fas fa-shopping-cart"></i> Adicionar' : '<i class="fas fa-times-circle"></i> Indisponível') +
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
        var pid = btn.dataset.pid;
        var vid = btn.dataset.vid;
        var qty = getQty(pid);
        _addToCart(vid, pid, qty, btn);
        return;
      }
    });
  }

  async function _addToCart(variantId, productId, qty, btn) {
    if (!variantId || !productId) return;
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adicionando...';
    }
    try {
      for (var i = 0; i < (qty || 1); i++) {
        var cart = global.medusaCart || global.cartVivaCommerce;
        if (cart && cart.addItem) {
          await cart.addItem(variantId, productId, 1, false);
        } else if (typeof global.addToCartMedusa === 'function') {
          await global.addToCartMedusa(variantId, productId, false);
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

  global.addToCartMedusa = async function (variantId, productId, buyNow) {
    var cart = global.medusaCart || global.cartVivaCommerce;
    if (cart && cart.addItem) {
      await cart.addItem(variantId, productId, 1, buyNow);
    } else {
      console.warn('Carrinho não inicializado. Carregue medusa-cart.js ou cart-vivacommerce.js.');
    }
  };

})(typeof window !== 'undefined' ? window : this);
