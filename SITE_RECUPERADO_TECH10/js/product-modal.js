/**
 * product-modal.js — Modal completo de produto
 * Galeria de imagens, seletor de variante, especificações, quantidade, add-to-cart
 * Inclua APÓS: api-config.js, api-adapter.js, load-products.js, cart-vivacommerce.js
 */
(function (global) {
  'use strict';

  var MODAL_ID = 'pm-modal';
  var _currentProduct = null;
  var _selectedVariantIndex = 0;
  var _qty = 1;

  // ─────────────────────────────────────────────────────────────────────────
  // Injetar HTML do modal no body
  // ─────────────────────────────────────────────────────────────────────────
  function _injectModal() {
    if (document.getElementById(MODAL_ID)) return;

    var el = document.createElement('div');
    el.id = MODAL_ID;
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-label', 'Detalhes do produto');
    el.style.display = 'none';
    var basePath = (typeof window !== 'undefined' && window.location.pathname.indexOf('/tech10') !== -1) ? '/tech10' : '';
    el.innerHTML = [
      '<div class="pm-backdrop" id="pm-backdrop"></div>',
      '<div class="pm-container" role="document">',
        '<div class="pm-header-brand">',
          '<a href="' + basePath + '/" class="pm-logo-link" aria-label="Tech10">',
            '<img src="' + basePath + '/imagem/logo/tech10-logo-fundo-azul.png" alt="Tech10" class="pm-logo-img">',
          '</a>',
        '</div>',
        '<button class="pm-close" id="pm-close" aria-label="Fechar">&times;</button>',
        '<div class="pm-inner">',
          // — Coluna esquerda: galeria
          '<div class="pm-gallery">',
            '<div class="pm-img-main">',
              '<img id="pm-img-main" src="" alt="Produto" />',
            '</div>',
            '<div class="pm-thumbs" id="pm-thumbs"></div>',
          '</div>',
          // — Coluna direita: info
          '<div class="pm-info">',
            '<span class="pm-cat" id="pm-cat"></span>',
            '<h2 class="pm-title" id="pm-title"></h2>',
            '<div class="pm-price-row">',
              '<span class="pm-price" id="pm-price"></span>',
              '<span class="pm-old-price" id="pm-old-price" style="display:none"></span>',
            '</div>',
            '<div class="pm-stock" id="pm-stock"></div>',
            // Variantes
            '<div class="pm-variants" id="pm-variants-wrap" style="display:none">',
              '<p class="pm-label">Versão:</p>',
              '<div class="pm-variants-list" id="pm-variants-list"></div>',
            '</div>',
            // Quantidade
            '<div class="pm-qty-row">',
              '<span class="pm-label">Quantidade:</span>',
              '<div class="pm-qty-ctrl">',
                '<button class="pm-qty-btn" id="pm-qty-minus" type="button">−</button>',
                '<span class="pm-qty-val" id="pm-qty-val">1</span>',
                '<button class="pm-qty-btn" id="pm-qty-plus" type="button">+</button>',
              '</div>',
            '</div>',
            // Avaliação placeholder
            '<div class="pm-rating" id="pm-rating">',
              '<span class="pm-stars">',
                '<i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star-half-alt"></i>',
              '</span>',
              '<span class="pm-rating-text">4.5 &nbsp;·&nbsp; Clientes satisfeitos</span>',
            '</div>',
            // Botões
            '<div class="pm-btns">',
              '<button class="pm-btn-add" id="pm-btn-add" type="button">',
                '<i class="fas fa-shopping-cart"></i> Adicionar ao Carrinho',
              '</button>',
              '<button class="pm-btn-buy" id="pm-btn-buy" type="button">',
                '<i class="fas fa-bolt"></i> Comprar Agora',
              '</button>',
            '</div>',
            // WhatsApp tirar dúvida
            '<a class="pm-whatsapp-btn" id="pm-whatsapp-btn" href="#" target="_blank" rel="noopener noreferrer">',
              '<i class="fab fa-whatsapp"></i> Tirar dúvida no WhatsApp',
            '</a>',
            // Tabs: Características | Especificações | Descrição
            '<div class="pm-tabs">',
              '<button class="pm-tab active" data-tab="features">Características</button>',
              '<button class="pm-tab" data-tab="specs">Especificações</button>',
              '<button class="pm-tab" data-tab="desc">Descrição</button>',
            '</div>',
            '<div class="pm-tab-content" id="pm-tab-features"></div>',
            '<div class="pm-tab-content" id="pm-tab-specs" style="display:none"></div>',
            '<div class="pm-tab-content" id="pm-tab-desc" style="display:none"></div>',
          '</div>',
        '</div>',
      '</div>',
    ].join('');
    document.body.appendChild(el);

    // Injetar CSS
    _injectCSS();

    // Eventos
    document.getElementById('pm-close').addEventListener('click', closeProductModal);
    document.getElementById('pm-backdrop').addEventListener('click', closeProductModal);
    document.getElementById('pm-qty-minus').addEventListener('click', function () { _changeQty(-1); });
    document.getElementById('pm-qty-plus').addEventListener('click', function () { _changeQty(1); });
    document.getElementById('pm-btn-add').addEventListener('click', function () { _addToCart(false); });
    document.getElementById('pm-btn-buy').addEventListener('click', function () { _addToCart(true); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeProductModal();
    });

    // Tabs
    el.querySelectorAll('.pm-tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        el.querySelectorAll('.pm-tab').forEach(function (t) { t.classList.remove('active'); });
        el.querySelectorAll('.pm-tab-content').forEach(function (tc) { tc.style.display = 'none'; });
        tab.classList.add('active');
        document.getElementById('pm-tab-' + tab.dataset.tab).style.display = 'block';
      });
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Abrir modal
  // ─────────────────────────────────────────────────────────────────────────
  function openProductModal(productId) {
    _injectModal();

    // Buscar produto nos caches
    var product = null;
    var pools = [global.__tech10_products, global.__pm_product_cache];
    for (var pi = 0; pi < pools.length; pi++) {
      if (pools[pi]) {
        product = pools[pi].find ? pools[pi].find(function (p) { return p && p.id === productId; }) : null;
        if (product) break;
      }
    }

    // Se não encontrado, buscar via adapter
    if (!product) {
      _fetchAndOpen(productId);
      return;
    }

    _renderModal(product);
  }

  async function _fetchAndOpen(productId) {
    var modal = document.getElementById(MODAL_ID);
    modal.style.display = 'block';
    document.getElementById('pm-title').textContent = 'Carregando...';
    document.getElementById('pm-img-main').src = '';

    try {
      var adapter = global.MarketplaceAdapter;
      if (adapter && adapter.getProductById) {
        var product = await adapter.getProductById(productId);
        if (product) {
          if (!global.__pm_product_cache) global.__pm_product_cache = [];
          global.__pm_product_cache.push(product);
          _renderModal(product);
          return;
        }
      }
    } catch (e) {
      console.error('[product-modal] fetch error:', e);
    }
    document.getElementById('pm-title').textContent = 'Produto não encontrado';
  }

  function _renderModal(product) {
    _currentProduct = product;
    _selectedVariantIndex = 0;
    _qty = 1;

    var modal = document.getElementById(MODAL_ID);
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';

    // Categoria
    var catEl = document.getElementById('pm-cat');
    var catName = product.category && product.category.name ? product.category.name : '';
    catEl.textContent = catName;
    catEl.style.display = catName ? '' : 'none';

    // Título
    document.getElementById('pm-title').textContent = product.title || 'Produto';

    // Galeria de imagens
    var images = [];
    if (product.thumbnail) images.push(product.thumbnail);
    if (product.images && product.images.length) {
      product.images.forEach(function (img) {
        var url = img.url || img;
        if (url && images.indexOf(url) === -1) images.push(url);
      });
    }
    if (images.length === 0) images.push('/tech10/imagem/propaganda loja/tecnologia.jpeg');

    document.getElementById('pm-img-main').src = images[0];
    document.getElementById('pm-img-main').alt = product.title || 'Produto';

    var thumbsEl = document.getElementById('pm-thumbs');
    if (images.length <= 1) {
      thumbsEl.style.display = 'none';
    } else {
      thumbsEl.style.display = '';
      thumbsEl.innerHTML = images.map(function (url, i) {
        return '<img src="' + url.replace(/"/g, '') + '" alt="Imagem ' + (i + 1) + '" class="pm-thumb' + (i === 0 ? ' active' : '') + '" data-src="' + url.replace(/"/g, '') + '">';
      }).join('');
      thumbsEl.querySelectorAll('.pm-thumb').forEach(function (thumb) {
        thumb.addEventListener('click', function () {
          document.getElementById('pm-img-main').src = thumb.dataset.src;
          thumbsEl.querySelectorAll('.pm-thumb').forEach(function (t) { t.classList.remove('active'); });
          thumb.classList.add('active');
        });
      });
    }

    // WhatsApp link com nome do produto
    var waBtn = document.getElementById('pm-whatsapp-btn');
    if (waBtn) {
      var waText = encodeURIComponent('Olá! Tenho interesse no produto: ' + (product.title || '') + '. Pode me ajudar?');
      waBtn.href = 'https://wa.me/55974001960?text=' + waText;
    }

    // Variantes
    var variants = product.variants || [];
    var variantsWrap = document.getElementById('pm-variants-wrap');
    var variantsList = document.getElementById('pm-variants-list');
    if (variants.length > 1) {
      variantsWrap.style.display = '';
      variantsList.innerHTML = variants.map(function (v, i) {
        return '<button class="pm-variant-btn' + (i === 0 ? ' active' : '') + '" data-idx="' + i + '">' + (v.title || ('Opção ' + (i + 1))) + '</button>';
      }).join('');
      variantsList.querySelectorAll('.pm-variant-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
          variantsList.querySelectorAll('.pm-variant-btn').forEach(function (b) { b.classList.remove('active'); });
          btn.classList.add('active');
          _selectedVariantIndex = parseInt(btn.dataset.idx, 10);
          _updatePriceStock();
        });
      });
    } else {
      variantsWrap.style.display = 'none';
    }

    // Preço, estoque e quantidade
    _updatePriceStock();
    document.getElementById('pm-qty-val').textContent = '1';

    // Features
    var featTab = document.getElementById('pm-tab-features');
    var features = product.features || [];
    if (features.length) {
      featTab.innerHTML = '<ul class="pm-features-list">' + features.map(function (f) { return '<li><i class="fas fa-check-circle"></i> ' + String(f).replace(/</g, '&lt;') + '</li>'; }).join('') + '</ul>';
    } else {
      featTab.innerHTML = '<p class="pm-empty-tab">Nenhuma característica listada.</p>';
    }

    // Especificações
    var specsTab = document.getElementById('pm-tab-specs');
    var specs = product.specifications || {};
    var specsKeys = Object.keys(specs);
    if (specsKeys.length) {
      specsTab.innerHTML = '<table class="pm-specs-table"><tbody>' +
        specsKeys.map(function (k) {
          return '<tr><td class="pm-spec-key">' + String(k).replace(/</g, '&lt;') + '</td><td class="pm-spec-val">' + String(specs[k]).replace(/</g, '&lt;') + '</td></tr>';
        }).join('') + '</tbody></table>';
    } else {
      specsTab.innerHTML = '<p class="pm-empty-tab">Nenhuma especificação disponível.</p>';
    }

    // Descrição
    var descTab = document.getElementById('pm-tab-desc');
    descTab.innerHTML = product.description ? '<p class="pm-desc-text">' + String(product.description).replace(/</g, '&lt;') + '</p>' : '<p class="pm-empty-tab">Sem descrição disponível.</p>';

    // Resetar tab ativa
    document.querySelectorAll('#' + MODAL_ID + ' .pm-tab').forEach(function (t) { t.classList.remove('active'); });
    document.querySelectorAll('#' + MODAL_ID + ' .pm-tab-content').forEach(function (tc) { tc.style.display = 'none'; });
    document.querySelector('#' + MODAL_ID + ' .pm-tab[data-tab="features"]').classList.add('active');
    document.getElementById('pm-tab-features').style.display = 'block';
  }

  function _updatePriceStock() {
    if (!_currentProduct) return;
    var variants = _currentProduct.variants || [];
    var variant = variants[_selectedVariantIndex] || variants[0];
    var prices = (variant && variant.prices) ? variant.prices : [];
    var amount = prices.length ? (prices[0].amount || 0) : 0;
    var inventoryQty = (variant && typeof variant.inventory_quantity !== 'undefined') ? variant.inventory_quantity : 0;
    var isInStock = inventoryQty > 0;

    document.getElementById('pm-price').textContent = 'R$ ' + (amount / 100).toFixed(2).replace('.', ',');

    var stockEl = document.getElementById('pm-stock');
    if (isInStock) {
      stockEl.innerHTML = '<i class="fas fa-check-circle" style="color:#10b981"></i> <span style="color:#10b981">' + (inventoryQty <= 5 ? 'Últimas ' + inventoryQty + ' unidades!' : 'Em estoque') + '</span>';
    } else {
      stockEl.innerHTML = '<i class="fas fa-times-circle" style="color:#ef4444"></i> <span style="color:#ef4444">Fora de estoque</span>';
    }

    var addBtn = document.getElementById('pm-btn-add');
    var buyBtn = document.getElementById('pm-btn-buy');
    addBtn.disabled = !isInStock;
    buyBtn.disabled = !isInStock;
    addBtn.style.opacity = isInStock ? '1' : '0.5';
    buyBtn.style.opacity = isInStock ? '1' : '0.5';
  }

  function _changeQty(delta) {
    if (!_currentProduct) return;
    var variants = _currentProduct.variants || [];
    var variant = variants[_selectedVariantIndex] || variants[0];
    var max = (variant && typeof variant.inventory_quantity !== 'undefined') ? variant.inventory_quantity : 99;
    _qty = Math.max(1, Math.min(_qty + delta, max > 0 ? max : 99));
    document.getElementById('pm-qty-val').textContent = _qty;
  }

  async function _addToCart(buyNow) {
    if (!_currentProduct) return;
    var variants = _currentProduct.variants || [];
    var variant = variants[_selectedVariantIndex] || variants[0];
    if (!variant) return;

    var variantId = variant.id;
    var productId = _currentProduct.id;
    var qty = _qty;

    var addBtn = document.getElementById('pm-btn-add');
    var buyBtn = document.getElementById('pm-btn-buy');
    var activeBtn = buyNow ? buyBtn : addBtn;
    activeBtn.disabled = true;
    activeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adicionando...';

    try {
      for (var i = 0; i < qty; i++) {
        var cart = global.medusaCart || global.cartVivaCommerce;
        if (cart && cart.addItem) {
          await cart.addItem(variantId, productId, 1, false);
        }
      }
      activeBtn.innerHTML = '<i class="fas fa-check"></i> Adicionado!';
      activeBtn.style.background = '#10b981';
      setTimeout(function () {
        if (buyNow) {
          window.location.href = 'carrinho.html';
        } else {
          activeBtn.disabled = false;
          activeBtn.style.background = '';
          activeBtn.innerHTML = '<i class="fas fa-shopping-cart"></i> Adicionar ao Carrinho';
        }
      }, 800);
    } catch (err) {
      console.error('[product-modal] addToCart error:', err);
      activeBtn.disabled = false;
      activeBtn.style.background = '';
      activeBtn.innerHTML = buyNow ? '<i class="fas fa-bolt"></i> Comprar Agora' : '<i class="fas fa-shopping-cart"></i> Adicionar ao Carrinho';
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Fechar modal
  // ─────────────────────────────────────────────────────────────────────────
  function closeProductModal() {
    var modal = document.getElementById(MODAL_ID);
    if (modal) modal.style.display = 'none';
    document.body.style.overflow = '';
    _currentProduct = null;
    _qty = 1;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CSS do modal (injetado dinamicamente)
  // ─────────────────────────────────────────────────────────────────────────
  function _injectCSS() {
    if (document.getElementById('pm-styles')) return;
    var style = document.createElement('style');
    style.id = 'pm-styles';
    style.textContent = [
      '#pm-modal { position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center; }',
      '.pm-backdrop { position:absolute;inset:0;background:rgba(0,0,0,0.6);backdrop-filter:blur(4px); }',
      '.pm-container { position:relative;background:#fff;border-radius:16px;width:min(960px,96vw);max-height:90vh;overflow-y:auto;z-index:1;box-shadow:0 24px 64px rgba(0,0,0,0.25); }',
      '.pm-header-brand { padding:16px 20px;border-bottom:1px solid #f3f4f6;display:flex;justify-content:center;align-items:center; }',
      '.pm-logo-link { display:flex;align-items:center;justify-content:center; }',
      '.pm-logo-img { height:40px;width:auto;max-width:220px;object-fit:contain;display:block; }',
      '.pm-close { position:absolute;top:14px;right:14px;background:#f3f4f6;border:none;width:36px;height:36px;border-radius:50%;font-size:22px;cursor:pointer;z-index:2;display:flex;align-items:center;justify-content:center;color:#374151;transition:background .15s; }',
      '.pm-close:hover { background:#e5e7eb; }',
      '.pm-inner { display:grid;grid-template-columns:1fr 1fr;gap:0; }',
      '@media(max-width:640px){ .pm-inner{grid-template-columns:1fr;} }',

      // Galeria
      '.pm-gallery { padding:24px 20px 24px 24px;border-right:1px solid #f3f4f6; }',
      '.pm-img-main { background:#f9fafb;border-radius:12px;overflow:hidden;aspect-ratio:1/1;display:flex;align-items:center;justify-content:center;margin-bottom:12px; }',
      '.pm-img-main img { max-width:100%;max-height:100%;object-fit:contain;padding:12px; }',
      '.pm-thumbs { display:flex;gap:8px;flex-wrap:wrap; }',
      '.pm-thumb { width:60px;height:60px;object-fit:contain;border-radius:8px;border:2px solid #e5e7eb;cursor:pointer;padding:4px;background:#f9fafb;transition:border-color .15s; }',
      '.pm-thumb.active,.pm-thumb:hover { border-color:#2563eb; }',
      '@media(max-width:640px){ .pm-gallery{padding:16px 16px 0;border-right:none;border-bottom:1px solid #f3f4f6;} .pm-thumbs{display:none;} }',

      // Info
      '.pm-info { padding:24px 24px 24px 20px;display:flex;flex-direction:column;gap:10px; }',
      '@media(max-width:640px){ .pm-info{padding:16px;} }',
      '.pm-cat { font-size:11px;font-weight:700;color:#2563eb;text-transform:uppercase;letter-spacing:.06em; }',
      '.pm-title { font-size:18px;font-weight:700;color:#111827;line-height:1.3;margin:0;word-wrap:break-word;overflow-wrap:break-word; }',
      '.pm-price-row { display:flex;align-items:baseline;gap:10px; }',
      '.pm-price { font-size:28px;font-weight:900;color:#2563eb; }',
      '.pm-old-price { font-size:16px;color:#9ca3af;text-decoration:line-through; }',
      '.pm-stock { font-size:13px;display:flex;align-items:center;gap:6px; }',

      // Variantes
      '.pm-variants { }',
      '.pm-label { font-size:13px;font-weight:600;color:#374151;margin:0 0 8px; }',
      '.pm-variants-list { display:flex;flex-wrap:wrap;gap:8px; }',
      '.pm-variant-btn { padding:6px 14px;border:2px solid #e5e7eb;border-radius:8px;background:#fff;font-size:13px;font-weight:600;cursor:pointer;transition:border-color .15s,background .15s; }',
      '.pm-variant-btn.active,.pm-variant-btn:hover { border-color:#2563eb;background:#eff6ff;color:#2563eb; }',

      // Quantidade
      '.pm-qty-row { display:flex;align-items:center;gap:12px; }',
      '.pm-qty-ctrl { display:flex;align-items:center;border:1.5px solid #e5e7eb;border-radius:8px;overflow:hidden; }',
      '.pm-qty-btn { width:36px;height:38px;background:#f9fafb;border:none;font-size:18px;font-weight:700;cursor:pointer;transition:background .15s;display:flex;align-items:center;justify-content:center; }',
      '.pm-qty-btn:hover { background:#e5e7eb;color:#2563eb; }',
      '.pm-qty-val { min-width:36px;text-align:center;font-size:16px;font-weight:700; }',

      // Botões
      '.pm-btns { display:flex;gap:10px; }',
      '.pm-btn-add,.pm-btn-buy { flex:1;padding:12px;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:background .2s,transform .1s; }',
      '.pm-btn-add { background:#2563eb;color:#fff; }',
      '.pm-btn-add:hover:not(:disabled) { background:#1d4ed8; }',
      '.pm-btn-buy { background:#111827;color:#fff; }',
      '.pm-btn-buy:hover:not(:disabled) { background:#374151; }',
      '.pm-btn-add:active,.pm-btn-buy:active { transform:scale(.97); }',

      // Tabs
      '.pm-tabs { display:flex;gap:2px;border-bottom:2px solid #f3f4f6;margin-top:8px; }',
      '.pm-tab { background:none;border:none;padding:8px 14px;font-size:13px;font-weight:600;color:#6b7280;cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-2px;transition:color .15s; }',
      '.pm-tab.active { color:#2563eb;border-bottom-color:#2563eb; }',
      '.pm-tab-content { padding:14px 0;font-size:13.5px;color:#374151;line-height:1.6; }',

      // Features
      '.pm-features-list { list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:8px; }',
      '.pm-features-list li { display:flex;align-items:flex-start;gap:8px; }',
      '.pm-features-list i { color:#10b981;font-size:14px;margin-top:3px;flex-shrink:0; }',

      // Specs
      '.pm-specs-table { width:100%;border-collapse:collapse; }',
      '.pm-specs-table tr:nth-child(even) { background:#f9fafb; }',
      '.pm-spec-key { padding:8px 12px;font-weight:600;color:#374151;width:40%;font-size:13px; }',
      '.pm-spec-val { padding:8px 12px;color:#6b7280;font-size:13px; }',

      // Rating
      '.pm-rating { display:flex;align-items:center;gap:8px; }',
      '.pm-stars { color:#f59e0b;font-size:14px;display:flex;gap:2px; }',
      '.pm-rating-text { font-size:12.5px;color:#6b7280; }',

      // WhatsApp button
      '.pm-whatsapp-btn { display:flex;align-items:center;justify-content:center;gap:8px;padding:10px 16px;background:#f0fdf4;color:#16a34a;border:1.5px solid #bbf7d0;border-radius:10px;font-size:13.5px;font-weight:700;text-decoration:none;transition:background .15s,border-color .15s; }',
      '.pm-whatsapp-btn:hover { background:#dcfce7;border-color:#86efac; }',
      '.pm-whatsapp-btn i { font-size:18px; }',

      // Misc
      '.pm-desc-text { color:#4b5563;line-height:1.7; }',
      '.pm-empty-tab { color:#9ca3af;font-style:italic; }',
    ].join('\n');
    document.head.appendChild(style);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Exports globais
  // ─────────────────────────────────────────────────────────────────────────
  global.openProductModal = openProductModal;
  global.__openProductModal = openProductModal;
  global.closeProductModal = closeProductModal;

  // Auto-init quando DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _injectModal);
  } else {
    _injectModal();
  }

})(typeof window !== 'undefined' ? window : this);
