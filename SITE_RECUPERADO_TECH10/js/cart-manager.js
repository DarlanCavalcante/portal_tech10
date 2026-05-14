/**
 * Cart Manager - Gerenciador de Carrinho
 * Compatibilidade legada do storefront para a Tech10.
 */

const LEGACY_DEEP_CART_STORAGE_KEY = 'medusa_cart_id';

class CartManager {
  constructor(legacyStorefrontClient) {
    this.client = legacyStorefrontClient;
    this.cart = null;
    this.updateCallbacks = [];
  }

  isQuoteOnlyRuntime() {
    const runtimeConfig = window.__tech10_runtime_config || {};
    const commerce = runtimeConfig.commerce || {};
    const capabilities = commerce.capabilities || {};
    const checkoutMode = commerce.checkoutMode
      || (window.API_CONFIG && window.API_CONFIG.CHECKOUT_MODE)
      || '';

    return capabilities.quoteOnly === true
      || capabilities.checkout === false
      || checkoutMode === 'quote_only';
  }

  getCheckoutButtonLabel() {
    return this.isQuoteOnlyRuntime()
      ? 'Continuar fechamento assistido'
      : 'Finalizar Compra';
  }

  getShippingSummaryLabel() {
    return this.isQuoteOnlyRuntime()
      ? 'Confirmar com atendimento'
      : 'Calcular';
  }

  getEmptyStateLabel() {
    return this.isQuoteOnlyRuntime()
      ? 'Seu carrinho assistido está vazio'
      : 'Seu carrinho está vazio';
  }

  goToCheckout() {
    window.location.href = '/checkout';
  }

  /**
   * Inicializar carrinho
   */
  async init() {
    try {
      this.cart = await this.client.getOrCreateCart();
      this.updateUI();
      return this.cart;
    } catch (error) {
      console.error('Erro ao inicializar carrinho:', error);
      return null;
    }
  }

  /**
   * Adicionar produto ao carrinho
   */
  async addProduct(variantId, quantity = 1) {
    try {
      this.cart = await this.client.addToCart(variantId, quantity);
      this.updateUI();
      this.notifyUpdate();
      return this.cart;
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
      throw error;
    }
  }

  /**
   * Atualizar quantidade
   */
  async updateQuantity(lineItemId, quantity) {
    try {
      if (quantity <= 0) {
        return await this.removeItem(lineItemId);
      }

      this.cart = await this.client.updateCartItem(lineItemId, quantity);
      this.updateUI();
      this.notifyUpdate();
      return this.cart;
    } catch (error) {
      console.error('Erro ao atualizar quantidade:', error);
      throw error;
    }
  }

  /**
   * Remover item do carrinho
   */
  async removeItem(lineItemId) {
    try {
      this.cart = await this.client.removeFromCart(lineItemId);
      this.updateUI();
      this.notifyUpdate();
      return this.cart;
    } catch (error) {
      console.error('Erro ao remover item:', error);
      throw error;
    }
  }

  /**
   * Obter total de itens
   */
  getItemCount() {
    if (!this.cart || !this.cart.items) {
      return 0;
    }
    return this.cart.items.reduce((total, item) => total + item.quantity, 0);
  }

  /**
   * Obter total do carrinho
   */
  getTotal() {
    if (!this.cart || !this.cart.total) {
      return 0;
    }
    return this.cart.total / 100; // Converter de centavos para reais
  }

  /**
   * Obter subtotal
   */
  getSubtotal() {
    if (!this.cart || !this.cart.subtotal) {
      return 0;
    }
    return this.cart.subtotal / 100;
  }

  /**
   * Atualizar UI do carrinho
   */
  updateUI() {
    // Atualizar contador no header
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
      const count = this.getItemCount();
      cartCount.textContent = count;
      cartCount.style.display = count > 0 ? 'block' : 'none';
    }

    // Atualizar modal/sidebar do carrinho se existir
    const cartContainer = document.getElementById('cart-container');
    if (cartContainer) {
      this.renderCart(cartContainer);
    }
  }

  /**
   * Renderizar carrinho
   */
  renderCart(container) {
    if (!this.cart || !this.cart.items || this.cart.items.length === 0) {
      container.innerHTML = `
        <div class="cart-empty">
          <p>${this.getEmptyStateLabel()}</p>
        </div>
      `;
      return;
    }

    const itemsHTML = this.cart.items.map(item => {
      const price = (item.unit_price / 100).toFixed(2);
      const subtotal = (item.unit_price * item.quantity / 100).toFixed(2);
      
      return `
        <div class="cart-item" data-line-item-id="${item.id}">
          <img src="${item.thumbnail || '/imagem/placeholder.jpg'}" alt="${item.title}">
          <div class="cart-item-details">
            <h4>${item.title}</h4>
            <p class="cart-item-price">R$ ${price}</p>
            <div class="cart-item-quantity">
              <button onclick="cartManager.updateQuantity('${item.id}', ${item.quantity - 1})" class="qty-btn">-</button>
              <span>${item.quantity}</span>
              <button onclick="cartManager.updateQuantity('${item.id}', ${item.quantity + 1})" class="qty-btn">+</button>
            </div>
          </div>
          <div class="cart-item-subtotal">
            <p>R$ ${subtotal}</p>
            <button onclick="cartManager.removeItem('${item.id}')" class="remove-btn">×</button>
          </div>
        </div>
      `;
    }).join('');

    const total = this.getTotal().toFixed(2);

    container.innerHTML = `
      <div class="cart-items">
        ${itemsHTML}
      </div>
      <div class="cart-total">
        <div class="cart-total-row">
          <span>Subtotal:</span>
          <span>R$ ${this.getSubtotal().toFixed(2)}</span>
        </div>
        <div class="cart-total-row">
          <span>Frete:</span>
          <span>${this.getShippingSummaryLabel()}</span>
        </div>
        <div class="cart-total-row cart-total-final">
          <span>Total:</span>
          <span>R$ ${total}</span>
        </div>
        <button class="btn-checkout">${this.getCheckoutButtonLabel()}</button>
      </div>
    `;

    const checkoutButton = container.querySelector('.btn-checkout');
    if (checkoutButton) {
      checkoutButton.addEventListener('click', () => this.goToCheckout());
    }
  }

  /**
   * Registrar callback para atualizações
   */
  onUpdate(callback) {
    this.updateCallbacks.push(callback);
  }

  /**
   * Notificar atualizações
   */
  notifyUpdate() {
    this.updateCallbacks.forEach(callback => {
      try {
        callback(this.cart);
      } catch (error) {
        console.error('Erro em callback de atualização:', error);
      }
    });
  }

  /**
   * Limpar carrinho
   */
  clear() {
    this.cart = null;
    this.client.cartId = null;
    if (window.API_CONFIG && typeof window.API_CONFIG.persistLegacyCartId === 'function') {
      window.API_CONFIG.persistLegacyCartId(null);
    } else if (window.API_CONFIG && typeof window.API_CONFIG.persistStoredCartId === 'function') {
      window.API_CONFIG.persistStoredCartId(null);
    } else {
      localStorage.removeItem(LEGACY_DEEP_CART_STORAGE_KEY);
    }
    this.updateUI();
    this.notifyUpdate();
  }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
  window.CartManager = CartManager;
}
