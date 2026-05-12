// Cliente legado para comunicação direta com o storefront.
function resolveLegacyStoreApiUrl() {
  if (window.API_CONFIG && window.API_CONFIG.STORE_API) {
    return window.API_CONFIG.STORE_API;
  }
  return `${window.location.origin}/api/store`;
}

class TechAPI {
  static get baseUrl() {
    return resolveLegacyStoreApiUrl();
  }

  // Produtos
  static async getProducts(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`${this.baseUrl}/products?${queryString}`);
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      return [];
    }
  }

  static async getProduct(id) {
    try {
      const response = await fetch(`${this.baseUrl}/products/${id}`);
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      return null;
    }
  }

  static async getFeaturedProducts() {
    try {
      const response = await fetch(`${this.baseUrl}/products?featured=true&limit=6`);
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar produtos em destaque:', error);
      return [];
    }
  }

  // Categorias
  static async getCategories(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`${this.baseUrl}/categories?${queryString}`);
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      return [];
    }
  }

  static async getCategory(id) {
    try {
      const response = await fetch(`${this.baseUrl}/categories/${id}`);
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar categoria:', error);
      return null;
    }
  }

  static async getCategoryStats(id) {
    try {
      const response = await fetch(`${this.baseUrl}/categories/${id}/stats`);
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar estatísticas da categoria:', error);
      return null;
    }
  }

  // Configurações
  static async getSettings(group = null) {
    try {
      const url = group ? `${this.baseUrl}/settings?group=${group}` : `${this.baseUrl}/settings`;
      const response = await fetch(url);
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
      return [];
    }
  }

  static async getPublicSettings() {
    try {
      const response = await fetch(`${this.baseUrl}/settings/public`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar configurações públicas:', error);
      return [];
    }
  }

  static async getSetting(key) {
    try {
      const response = await fetch(`${this.baseUrl}/settings/${key}`);
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar configuração:', error);
      return null;
    }
  }

  // Busca
  static async searchProducts(query) {
    try {
      const response = await fetch(`${this.baseUrl}/products?search=${encodeURIComponent(query)}`);
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      return [];
    }
  }

  // Utilitários
  static formatPrice(price) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  }

  static formatDate(date) {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
  }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
  window.TechAPI = TechAPI;
}
