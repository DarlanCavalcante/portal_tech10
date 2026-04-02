/**
 * Medusa Client - Cliente API para integração com Medusa
 * Tech10 E-commerce
 */

const MEDUSA_BASE_URL = 'http://localhost:9000';

class MedusaClient {
  constructor(baseUrl = MEDUSA_BASE_URL) {
    this.baseUrl = baseUrl;
    this.cartId = localStorage.getItem('medusa_cart_id');
  }

  /**
   * Buscar todos os produtos
   */
  async getProducts(options = {}) {
    try {
      const { limit = 12, offset = 0, category_id, q } = options;
      let url = `${this.baseUrl}/store/products?limit=${limit}&offset=${offset}`;
      
      if (category_id) {
        url += `&category_id[]=${category_id}`;
      }
      if (q) {
        url += `&q=${encodeURIComponent(q)}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.products || [];
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      return [];
    }
  }

  /**
   * Buscar produto por ID
   */
  async getProductById(id) {
    try {
      const response = await fetch(`${this.baseUrl}/store/products/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      return null;
    }
  }

  /**
   * Buscar categorias
   */
  async getCategories() {
    try {
      const response = await fetch(`${this.baseUrl}/store/product-categories`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.product_categories || [];
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      return [];
    }
  }

  /**
   * Criar ou obter carrinho
   */
  async getOrCreateCart() {
    try {
      if (this.cartId) {
        // Tentar recuperar carrinho existente
        const cart = await this.getCart(this.cartId);
        if (cart) {
          return cart;
        }
        // Se não existir, limpar ID
        this.cartId = null;
        localStorage.removeItem('medusa_cart_id');
      }

      // Criar novo carrinho
      const response = await fetch(`${this.baseUrl}/store/carts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const cart = await response.json();
      this.cartId = cart.cart.id;
      localStorage.setItem('medusa_cart_id', this.cartId);
      return cart.cart;
    } catch (error) {
      console.error('Erro ao criar/obter carrinho:', error);
      return null;
    }
  }

  /**
   * Obter carrinho por ID
   */
  async getCart(cartId) {
    try {
      const response = await fetch(`${this.baseUrl}/store/carts/${cartId}`);
      if (!response.ok) {
        return null;
      }
      const data = await response.json();
      return data.cart;
    } catch (error) {
      console.error('Erro ao buscar carrinho:', error);
      return null;
    }
  }

  /**
   * Adicionar item ao carrinho
   */
  async addToCart(variantId, quantity = 1) {
    try {
      const cart = await this.getOrCreateCart();
      if (!cart) {
        throw new Error('Não foi possível criar/obter carrinho');
      }

      const response = await fetch(`${this.baseUrl}/store/carts/${cart.id}/line-items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          variant_id: variantId,
          quantity: quantity
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.cart;
    } catch (error) {
      console.error('Erro ao adicionar ao carrinho:', error);
      throw error;
    }
  }

  /**
   * Atualizar quantidade do item no carrinho
   */
  async updateCartItem(lineItemId, quantity) {
    try {
      const cart = await this.getOrCreateCart();
      if (!cart) {
        throw new Error('Carrinho não encontrado');
      }

      const response = await fetch(`${this.baseUrl}/store/carts/${cart.id}/line-items/${lineItemId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          quantity: quantity
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.cart;
    } catch (error) {
      console.error('Erro ao atualizar item do carrinho:', error);
      throw error;
    }
  }

  /**
   * Remover item do carrinho
   */
  async removeFromCart(lineItemId) {
    try {
      const cart = await this.getOrCreateCart();
      if (!cart) {
        throw new Error('Carrinho não encontrado');
      }

      const response = await fetch(`${this.baseUrl}/store/carts/${cart.id}/line-items/${lineItemId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.cart;
    } catch (error) {
      console.error('Erro ao remover item do carrinho:', error);
      throw error;
    }
  }

  /**
   * Calcular frete
   */
  async calculateShipping(cartId, shippingAddress) {
    try {
      const response = await fetch(`${this.baseUrl}/store/carts/${cartId}/shipping-methods`, {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao calcular frete:', error);
      return null;
    }
  }

  /**
   * Criar pedido (checkout)
   */
  async createOrder(cartId, customerData, shippingAddress) {
    try {
      // Primeiro, adicionar informações de envio ao carrinho
      await fetch(`${this.baseUrl}/store/carts/${cartId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: customerData.email,
          shipping_address: shippingAddress
        })
      });

      // Depois, completar o checkout
      const response = await fetch(`${this.baseUrl}/store/carts/${cartId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Limpar carrinho após checkout
      this.cartId = null;
      localStorage.removeItem('medusa_cart_id');

      return data.order;
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      throw error;
    }
  }
}

// Exportar para uso global ou módulo
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MedusaClient;
} else {
  window.MedusaClient = MedusaClient;
}
