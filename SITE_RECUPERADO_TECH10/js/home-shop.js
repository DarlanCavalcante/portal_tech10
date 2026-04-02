/**
 * Revivah Home Shop — Carrossel horizontal de lojas por categoria
 * Design moderno, sem "setor", apenas nome da categoria
 */

(function () {
  'use strict';

  // Dados de exemplo — substituir por fetch da API /lojas
  const CATEGORIES = [
    {
      name: 'Tecnologia',
      stores: [
        { id: 'tech10', name: 'Tech10', slug: 'revivah-tech', desc: 'Informática e tecnologia', bannerUrl: '/tech10/imagem/logo/tech10-logo-fundo-azul.png', logoUrl: '/tech10/imagem/logo/tech10-logo-fundo-azul.png' },
        { id: '2', name: 'TechStore', slug: 'tech-store', desc: 'Eletrônicos e gadgets', bannerUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400', logoUrl: null },
        { id: '3', name: 'ByteShop', slug: 'byte-shop', desc: 'Hardware e periféricos', bannerUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400', logoUrl: null },
      ]
    },
    {
      name: 'Moda',
      stores: [
        { id: '4', name: 'Style Boutique', slug: 'style-boutique', desc: 'Roupas e acessórios', bannerUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400', logoUrl: null },
        { id: '5', name: 'Urban Wear', slug: 'urban-wear', desc: 'Streetwear', bannerUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', logoUrl: null },
      ]
    },
    {
      name: 'Mercearia',
      stores: [
        { id: '6', name: 'Mercado do Bairro', slug: 'mercado-bairro', desc: 'Alimentos e bebidas', bannerUrl: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400', logoUrl: null },
        { id: '7', name: 'Hortifruti Plus', slug: 'hortifruti-plus', desc: 'Frutas e verduras frescas', bannerUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400', logoUrl: null },
      ]
    },
  ];

  const modal = document.getElementById('rev-modal');
  const backdrop = document.getElementById('rev-modal-backdrop');
  const closeBtn = document.getElementById('rev-modal-close');
  const modalTitle = document.getElementById('rev-modal-title');
  const carouselTrack = document.getElementById('rev-carousel-track');
  const categoriesEl = document.querySelector('.rev-categories');

  function getStoreHref(store) {
    if (store.slug === 'revivah-tech') return '/tech10/';
    return '/lojas/' + (store.slug || store.id) + '/';
  }

  function renderStoreCard(store, inModal) {
    const img = store.bannerUrl || store.logoUrl || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400';
    const href = getStoreHref(store);
    const cls = inModal ? 'rev-modal-store-card' : 'rev-store-card';
    return `
      <a href="${href}" class="${cls}" data-store-id="${store.id}">
        <img src="${img}" alt="${(store.name || '').replace(/"/g, '&quot;')}" class="rev-store-card-img" loading="lazy">
        <div class="rev-store-card-body">
          <div class="rev-store-card-name">${(store.name || 'Loja').replace(/</g, '&lt;')}</div>
          <div class="rev-store-card-desc">${(store.desc || '').replace(/</g, '&lt;')}</div>
        </div>
      </a>
    `;
  }

  function renderCategories() {
    if (!categoriesEl) return;
    categoriesEl.innerHTML = CATEGORIES.map(function (cat) {
      const storesHtml = cat.stores.map(function (s) { return renderStoreCard(s, false); }).join('');
      const safeName = (cat.name || 'Categoria').replace(/</g, '&lt;').replace(/"/g, '&quot;');
      return `
        <div class="rev-category-block" data-category="${safeName}">
          <button type="button" class="rev-category-name rev-category-trigger" data-category="${safeName}" aria-expanded="false">
            ${safeName}
            <span class="rev-category-arrow" aria-hidden="true">→</span>
          </button>
          <div class="rev-category-carousel">
            ${storesHtml}
          </div>
        </div>
      `;
    }).join('');
  }

  function openModal(category) {
    if (!modal || !carouselTrack || !modalTitle) return;
    modalTitle.textContent = category.name || 'Categoria';
    carouselTrack.innerHTML = category.stores.map(function (s) { return renderStoreCard(s, true); }).join('');
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (modal) {
      modal.hidden = true;
      document.body.style.overflow = '';
    }
  }

  function initCarouselButtons() {
    var prev = document.querySelector('.rev-carousel-prev');
    var next = document.querySelector('.rev-carousel-next');
    if (prev && carouselTrack) {
      prev.addEventListener('click', function () {
        carouselTrack.scrollBy({ left: -240, behavior: 'smooth' });
      });
    }
    if (next && carouselTrack) {
      next.addEventListener('click', function () {
        carouselTrack.scrollBy({ left: 240, behavior: 'smooth' });
      });
    }
  }

  function init() {
    renderCategories();
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (backdrop) backdrop.addEventListener('click', closeModal);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal && !modal.hidden) closeModal();
    });

    // Abrir modal ao clicar no nome da categoria
    categoriesEl && categoriesEl.addEventListener('click', function (e) {
      var btn = e.target.closest('.rev-category-trigger');
      if (btn) {
        var name = btn.getAttribute('data-category');
        var cat = CATEGORIES.find(function (c) { return c.name === name; });
        if (cat) openModal(cat);
      }
    });

    initCarouselButtons();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.revOpenCategoryModal = openModal;
  window.revCloseCategoryModal = closeModal;
})();
