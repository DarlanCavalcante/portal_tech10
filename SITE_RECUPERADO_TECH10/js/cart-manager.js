/**
 * Cart Manager - Gerenciador de Carrinho
 * Integração com Medusa para Tech10
 */

class CartManager {
  constructor(medusaClient) {
    this.client = medusaClient;
    this.cart = null;
    this.updateCallbacks = [];
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
          <p>Seu carrinho está vazio</p>
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
          <span>Calcular</span>
        </div>
        <div class="cart-total-row cart-total-final">
          <span>Total:</span>
          <span>R$ ${total}</span>
        </div>
        <button onclick="checkout()" class="btn-checkout">Finalizar Compra</button>
      </div>
    `;
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
    localStorage.removeItem('medusa_cart_id');
    this.updateUI();
    this.notifyUpdate();
  }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
  window.CartManager = CartManager;
}
