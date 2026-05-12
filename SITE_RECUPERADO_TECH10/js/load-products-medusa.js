/**
 * Camada legada de contingência para carregar e exibir produtos no frontend.
 * Mantida por compatibilidade enquanto o storefront canônico cobre a jornada principal.
 */

// Usa MarketplaceAdapter (api-adapter.js) com slug definido em api-config.js
// A URL base e o slug vêm de window.API_CONFIG — não usar URL legada de storefront.

async function loadProductsFromMedusa() {
  try {
    if (!window.MarketplaceAdapter) {
      throw new Error('MarketplaceAdapter não carregado. Verifique ordem dos scripts.');
    }
    const products = await window.MarketplaceAdapter.getProducts({ limit: 50 });
    return Array.isArray(products) ? products : [];
  } catch (error) {
    console.error('Erro ao carregar produtos via adapter:', error);
    return [];
  }
}

function getFallbackRuntimeCommerce() {
  const runtime = window.__tech10_runtime_config || {};
  const commerce = runtime.commerce || {};
  if (!commerce.checkoutMode && window.API_CONFIG && window.API_CONFIG.CHECKOUT_MODE) {
    commerce.checkoutMode = window.API_CONFIG.CHECKOUT_MODE;
  }
  return commerce;
}

function isQuoteOnlyRuntime() {
  const commerce = getFallbackRuntimeCommerce();
  const capabilities = commerce.capabilities || {};
  return capabilities.quoteOnly === true || commerce.checkoutMode === 'quote_only';
}

function buildSupportUrlForProduct(product, quantity = 1) {
  const variant = product && product.variants && product.variants.length > 0 ? product.variants[0] : null;
  const amount = variant?.prices?.[0]?.amount || 0;
  const metadata = product && product.metadata ? product.metadata : {};
  const lines = [
    'Olá! Vim pela loja da Tech10 e tenho interesse neste produto:',
    product?.title || 'Produto da loja',
    metadata.brand ? `Marca: ${metadata.brand}` : '',
    metadata.sku ? `SKU: ${metadata.sku}` : '',
    quantity > 1 ? `Quantidade desejada: ${quantity}` : '',
    amount ? `Preço exibido: R$ ${(amount / 100).toFixed(2).replace('.', ',')}` : '',
    '',
    'Quero confirmar disponibilidade e atendimento.',
  ].filter(Boolean);

  if (window.TenantRoutes && typeof window.TenantRoutes.supportUrl === 'function') {
    return window.TenantRoutes.supportUrl(lines.join('\n'));
  }

  const company = (window.TENANT_CONFIG && window.TENANT_CONFIG.company) || {};
  const whatsapp = String(company.whatsapp || '55974001960').replace(/\D/g, '');
  return `https://wa.me/${whatsapp}?text=${encodeURIComponent(lines.join('\n'))}`;
}

function renderProducts(products, containerId = 'produtosGrid') {
  // CORREÇÃO: Garantir que products é sempre um array
  if (!products) {
    console.warn('⚠️ renderProducts chamado com products undefined, usando array vazio');
    products = [];
  }
  
  // Se não for array, tentar converter
  if (!Array.isArray(products)) {
    console.warn('⚠️ renderProducts recebeu algo que não é array:', typeof products);
    products = [];
  }
  
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`Container #${containerId} não encontrado`);
    // Tentar encontrar qualquer container de produtos
    const alternative = document.querySelector('#produtosGrid, .produtos-grid, #produtos-medusa');
    if (alternative) {
      console.log(`✅ Usando container alternativo: ${alternative.id || alternative.className}`);
      return renderProducts(products, alternative.id || 'produtosGrid');
    }
    return;
  }

  // Agora products é garantido ser um array
  if (products.length === 0) {
    container.innerHTML = '<p style="text-align: center; padding: 40px; color: #666;">Nenhum produto encontrado.</p>';
    return;
  }

    // CORREÇÃO: Validar cada produto antes de renderizar
    const validProducts = products.filter(product => product && product.id && product.title);
    window.__tech10_legacy_products = validProducts;
    const quoteOnly = isQuoteOnlyRuntime();

    container.innerHTML = validProducts
      .map(product => {
        try {
          const variant = product.variants?.[0];
          const price = variant?.prices?.[0]?.amount || 0;
      const priceFormatted = (price / 100).toFixed(2).replace('.', ',');
      const thumbnail = product.thumbnail || '/imagem/propaganda loja/tecnologia.jpeg';
          const description = product.description ? product.description.substring(0, 100) + '...' : 'Sem descrição disponível';
          
          // VALIDAÇÃO DE ESTOQUE
          const inventoryQty = variant?.inventory_quantity || 0;
          const isInStock = inventoryQty > 0;
          const stockText = isInStock 
            ? (inventoryQty <= 5 ? `Últimas ${inventoryQty} unidades!` : 'Em estoque')
            : 'Fora de estoque';
          const stockClass = isInStock ? 'in-stock' : 'out-of-stock';
          const buttonDisabled = !isInStock ? 'disabled' : '';
          const buttonText = isInStock 
            ? (quoteOnly
              ? '<i class="fab fa-whatsapp"></i> Pedir atendimento'
              : '<i class="fas fa-shopping-cart"></i> Comprar')
            : '<i class="fas fa-times-circle"></i> Indisponível';
          const buttonAction = quoteOnly
            ? `requestLegacySupport('${product.id}'); event.stopPropagation();`
            : `addToStorefrontCart('${variant?.id || ''}', '${product.id}'); event.stopPropagation();`;
      
      return `
      <div class="product-card ${stockClass}" data-product-id="${product.id}">
        <div class="product-image" onclick="openProductModal('${product.id}')" style="cursor: pointer;">
                <img src="${thumbnail}" alt="${product.title || 'Produto'}" loading="lazy" onerror="this.src='/imagem/propaganda loja/tecnologia.jpeg'">
          <div class="product-overlay">
            <i class="fas fa-search-plus"></i>
          </div>
          ${!isInStock ? '<div class="stock-badge out-of-stock-badge"><i class="fas fa-times-circle"></i> Indisponível</div>' : ''}
          ${isInStock && inventoryQty <= 5 ? '<div class="stock-badge low-stock-badge"><i class="fas fa-exclamation-triangle"></i> Últimas unidades!</div>' : ''}
        </div>
        <div class="product-info">
                <h3 class="product-title">${product.title || 'Produto sem nome'}</h3>
                <p class="product-description">${description}</p>
          <div class="product-price">R$ ${priceFormatted}</div>
          <div class="product-stock ${stockClass}">
            <i class="fas ${isInStock ? 'fa-check-circle' : 'fa-times-circle'}"></i>
            <span>${stockText}</span>
            ${isInStock && inventoryQty > 5 ? `<small>(${inventoryQty} disponíveis)</small>` : ''}
          </div>
                <button class="btn-comprar ${stockClass}" ${buttonDisabled} onclick="${buttonAction}" data-product-id="${product.id}" data-variant-id="${variant?.id || ''}" data-inventory="${inventoryQty}">
            ${buttonText}
          </button>
        </div>
      </div>
    `;
        } catch (error) {
          console.error('❌ Erro ao renderizar produto:', product, error);
          return ''; // Retornar string vazia para produtos inválidos
        }
      })
      .filter(html => html !== '') // Remover produtos que falharam
      .join('');
    
    if (container.innerHTML === '') {
      container.innerHTML = '<p style="text-align: center; padding: 40px; color: #666;">Nenhum produto válido encontrado.</p>';
    }

  // Função global canônica para adicionar ao carrinho do storefront
  window.addToStorefrontCart = async function(variantId, productId, buyNow = false) {
    const activeCart = typeof window.getActiveStorefrontCart === 'function'
      ? window.getActiveStorefrontCart()
      : (window.storefrontCart || null);
    try {
      if (!variantId) {
        if (activeCart) {
          activeCart.showNotification('❌ Erro: Variante do produto não encontrada', 'error');
        } else {
        alert('❌ Erro: Variante do produto não encontrada');
        }
        return;
      }
      
      // VALIDAÇÃO DE ESTOQUE ANTES DE ADICIONAR
      const button = document.querySelector(`button[data-variant-id="${variantId}"]`);
      const inventory = button ? parseInt(button.getAttribute('data-inventory') || '0') : 0;
      
      if (inventory <= 0) {
        if (activeCart) {
          activeCart.showNotification('❌ Produto fora de estoque', 'error');
        } else {
          alert('❌ Este produto está fora de estoque no momento.');
        }
        return;
      }

      // Verificar estoque disponível no carrinho atual
      if (activeCart && activeCart.cartId) {
        try {
          const cart = await activeCart.getCart();
          if (cart && cart.items) {
            const itemInCart = cart.items.find(item => item.variant_id === variantId);
            const qtyInCart = itemInCart ? itemInCart.quantity : 0;
            
            if (qtyInCart >= inventory) {
              if (activeCart) {
                activeCart.showNotification(`❌ Estoque insuficiente. Disponível: ${inventory} unidades`, 'error');
              } else {
                alert(`❌ Estoque insuficiente. Disponível: ${inventory} unidades`);
              }
              return;
            }
          }
        } catch (err) {
          console.warn('⚠️ Não foi possível verificar estoque no carrinho:', err);
        }
      }

      // Usar o carrinho ativo do storefront se disponível, senão usar MarketplaceAdapter
      if (activeCart) {
        await activeCart.addItem(variantId, productId, 1, buyNow);
      } else if (window.MarketplaceAdapter) {
        // Fallback via adapter storefront
        console.warn('⚠️ Carrinho do storefront não disponível, usando MarketplaceAdapter');
        let cartId = localStorage.getItem('tech10_storefront_cart_id') || localStorage.getItem('vc_cart_id');
        if (!cartId) {
          const created = await window.MarketplaceAdapter.createCart();
          cartId = created.cart?.id;
          if (cartId) {
            localStorage.setItem('tech10_storefront_cart_id', cartId);
            localStorage.setItem('vc_cart_id', cartId);
          }
        }
        if (cartId) {
          await window.MarketplaceAdapter.addLineItem(cartId, variantId, 1);
          showNotification('✅ Produto adicionado ao carrinho!');
          if (buyNow) {
            const cartHref = (window.TenantRoutes && window.TenantRoutes.cart) || '/carrinho';
            setTimeout(() => { window.location.href = cartHref; }, 1000);
          }
        }
      } else {
        console.error('[tech10] Nenhum mecanismo de carrinho disponível');
        showNotification('❌ Carrinho indisponível', 'error');
      }
    } catch (error) {
      console.error('Erro ao adicionar ao carrinho:', error);
      if (activeCart) {
        activeCart.showNotification('❌ Erro ao adicionar produto', 'error');
      } else {
        alert('❌ Erro ao adicionar produto ao carrinho');
      }
      throw error;
    }
  };

  // Alias legado preservado para superfícies antigas
  window.addToCartMedusa = window.addToStorefrontCart;

  window.requestLegacySupport = function(productId, quantity = 1) {
    const products = window.__tech10_legacy_products || [];
    const product = products.find(item => String(item.id) === String(productId));
    const supportUrl = buildSupportUrlForProduct(product, quantity);
    if (supportUrl) {
      window.open(supportUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // Função para abrir modal do produto
  window.openProductModal = async function(productId) {
    console.log('🖼️ Abrindo modal do produto:', productId);
    // Buscar produto via adapter (sem URL legada Medusa)
    Promise.resolve(window.MarketplaceAdapter
      ? window.MarketplaceAdapter.getProductById(productId)
      : fetch(`${window.API_CONFIG?.STORE_API || '/api/store'}/products/${productId}`).then(r => r.json()).then(d => d.product ? d.product : null)
    ).then(product => {
        if (!product) { console.warn('[tech10] produto não encontrado:', productId); return; }
        if (!product) {
          alert('Produto não encontrado');
          return;
        }
        
        const variant = product.variants && product.variants.length > 0 ? product.variants[0] : null;
        const price = variant?.prices && variant.prices.length > 0 
          ? (variant.prices[0]?.amount / 100).toFixed(2).replace('.', ',')
          : '0,00';
        
        const quoteOnly = isQuoteOnlyRuntime();
        const actionButtonsHtml = quoteOnly
          ? `
                <button onclick="requestLegacySupport('${product.id}')"
                        style="background: #0f766e; color: white; border: none; padding: 12px 24px; border-radius: 5px; cursor: pointer; font-size: 16px; font-weight: 600;">
                  <i class="fab fa-whatsapp"></i> Pedir atendimento
                </button>
                <button onclick="closeProductModal()"
                        style="background: #e2e8f0; color: #0f172a; border: none; padding: 12px 24px; border-radius: 5px; cursor: pointer; font-size: 16px; font-weight: 600;">
                  Continuar vendo
                </button>
            `
          : `
                <button onclick="handleBuyNow('${variant?.id || ''}', '${product.id}')"
                        style="background: #2563eb; color: white; border: none; padding: 12px 24px; border-radius: 5px; cursor: pointer; font-size: 16px; font-weight: 600;">
                  <i class="fas fa-shopping-bag"></i> Comprar Agora
                </button>
                <button onclick="handleAddToCart('${variant?.id || ''}', '${product.id}')"
                        style="background: #10b981; color: white; border: none; padding: 12px 24px; border-radius: 5px; cursor: pointer; font-size: 16px; font-weight: 600;">
                  <i class="fas fa-cart-plus"></i> Adicionar ao Carrinho
                </button>
            `;

        // Usar ModalManager global se disponível
        if (window.modalManager && typeof window.modalManager.create === 'function') {
          const modalId = window.modalManager.create({
            title: product.title,
            content: `
              <div style="text-align: center; padding: 20px;">
                <img src="${product.thumbnail || '/imagem/propaganda loja/tecnologia.jpeg'}" 
                     alt="${product.title}" 
                     style="max-width: 100%; max-height: 400px; height: auto; border-radius: 8px; margin-bottom: 20px;"
                     onerror="this.src='/imagem/propaganda loja/tecnologia.jpeg'">
                <p style="margin: 15px 0; color: #666; text-align: left;">${product.description || ''}</p>
                <div style="font-size: 28px; font-weight: bold; color: #2563eb; margin: 20px 0;">
                  R$ ${price}
                </div>
                <div style="display: flex; gap: 10px; justify-content: center; margin-top: 20px;">
                  ${actionButtonsHtml}
                </div>
              </div>
            `,
            size: 'large'
          });
          window.modalManager.open(modalId);
        } else {
          // Fallback: criar modal manualmente
          const modalHtml = `
            <div id="product-modal-overlay" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 20px;">
              <div style="background: white; border-radius: 10px; max-width: 600px; width: 100%; max-height: 90vh; overflow-y: auto; position: relative;">
                <button onclick="closeProductModal()" style="position: absolute; top: 10px; right: 10px; background: #f3f4f6; border: none; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; font-size: 18px;">×</button>
                <div style="padding: 30px; text-align: center;">
                  <img src="${product.thumbnail || '/imagem/propaganda loja/tecnologia.jpeg'}" 
                       alt="${product.title}" 
                       style="max-width: 100%; max-height: 400px; height: auto; border-radius: 8px; margin-bottom: 20px;">
                  <h2 style="margin: 0 0 15px 0;">${product.title}</h2>
                  <p style="margin: 15px 0; color: #666; text-align: left;">${product.description || ''}</p>
                  <div style="font-size: 28px; font-weight: bold; color: #2563eb; margin: 20px 0;">
                    R$ ${price}
                  </div>
                  <div style="display: flex; gap: 10px; justify-content: center; margin-top: 20px;">
                    ${actionButtonsHtml}
                  </div>
                </div>
              </div>
            </div>
          `;
          document.body.insertAdjacentHTML('beforeend', modalHtml);
        }
      })
      .catch(error => {
        console.error('Erro ao buscar produto:', error);
        alert('Erro ao carregar detalhes do produto');
      });
  };

  // Função para fechar modal manual
  window.closeProductModal = function() {
    const overlay = document.getElementById('product-modal-overlay');
    if (overlay) {
      overlay.remove();
    }
    if (window.modalManager) {
      window.modalManager.closeAll();
    }
  };

  // Função Comprar Agora (redireciona para carrinho/checkout)
  window.handleBuyNow = async function(variantId, productId) {
    try {
      if (window.closeProductModal) window.closeProductModal();
      if (isQuoteOnlyRuntime()) {
        window.requestLegacySupport(productId);
        return;
      }
      
      // Adicionar ao carrinho
      await window.addToStorefrontCart(variantId, productId);
      
      // Redirecionar para carrinho
      showNotification('✅ Produto adicionado! Redirecionando...');
      setTimeout(() => {
        window.location.href = '/carrinho';
      }, 1000);
      
    } catch (error) {
      console.error('Erro ao comprar agora:', error);
      showNotification('❌ Erro ao processar compra', 'error');
    }
  };

  // Função Adicionar ao Carrinho (continua comprando)
  window.handleAddToCart = async function(variantId, productId) {
    try {
      if (window.closeProductModal) window.closeProductModal();
      if (isQuoteOnlyRuntime()) {
        window.requestLegacySupport(productId);
        return;
      }
      await window.addToStorefrontCart(variantId, productId);
    } catch (error) {
      console.error('Erro ao adicionar ao carrinho:', error);
      showNotification('❌ Erro ao adicionar produto ao carrinho', 'error');
    }
  };
  
  // Função para mostrar notificação
  function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 25px;
      background: ${type === 'success' ? '#10b981' : '#ef4444'};
      color: white;
      border-radius: 8px;
      z-index: 10000;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }
  
  // Adicionar animação CSS se não existir
  if (!document.getElementById('notification-style')) {
    const style = document.createElement('style');
    style.id = 'notification-style';
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);
  }
}

// Inicializar quando DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

async function init() {
  console.log('🛍️ Carregando produtos via adapter canônico do tenant...');
  
  const products = await loadProductsFromMedusa();
  console.log(`✅ ${products.length} produtos carregados`);
  
  if (products.length === 0) {
    console.warn('⚠️ Nenhum produto encontrado');
    return;
  }
  
  // Aguardar um pouco para garantir que o DOM está pronto
  setTimeout(() => {
    // Renderizar em container padrão ou procurar por seção de produtos
    // PRIMEIRO tentar produtosGrid (ID real no HTML)
    const containers = [
      'produtosGrid',  // ID real no HTML - PRIMEIRO!
      'produtos-medusa',
      'products-container',
      'produtos-container',
      'products-grid'
    ];
    
    let rendered = false;
    
    for (const containerId of containers) {
      const container = document.getElementById(containerId);
      if (container) {
        renderProducts(products, containerId);
        rendered = true;
        console.log(`✅ Produtos renderizados em #${containerId}`);
        break;
      }
    }
    
    // Se não encontrou container específico, procurar por classe
    if (!rendered) {
      const productSections = document.querySelectorAll('.products-section, .produtos-section, .produtos');
      productSections.forEach(section => {
        const grid = section.querySelector('.produtos-grid, .products-grid, .grid');
        if (grid) {
          renderProducts(products, grid.id || 'produtos-medusa');
          if (!grid.id) grid.id = 'produtos-medusa';
          rendered = true;
          console.log('✅ Produtos renderizados em grid encontrado');
        }
      });
    }
    
    if (!rendered) {
      console.warn('⚠️ Container de produtos não encontrado. Criando um...');
      // Criar container se não existir
      const produtosSection = document.querySelector('#produtos, .produtos');
      if (produtosSection) {
        const grid = document.createElement('div');
        grid.id = 'produtosGrid';
        grid.className = 'produtos-grid';
        produtosSection.querySelector('.container')?.appendChild(grid) || produtosSection.appendChild(grid);
        renderProducts(products, 'produtosGrid');
      }
    }
  }, 500);
}

// Exportar para uso global
window.loadProductsFromMedusa = loadProductsFromMedusa;
window.renderProducts = renderProducts;
