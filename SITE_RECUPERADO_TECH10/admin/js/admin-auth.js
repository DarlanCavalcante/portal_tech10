/**
 * 🔐 TECH10 ADMIN AUTH
 * Sistema de autenticação
 */

class AdminAuth {
  constructor() {
    this.loginForm = null;
    this.loginModal = null;
    this.init();
  }

  init() {
    this.createLoginModal();
    this.bindEvents();
    this.checkAuthStatus();
  }

  createLoginModal() {
    // Criar modal de login se não existir
    if (document.getElementById('login-modal')) return;

    const modalHTML = `
      <div id="login-modal" class="modal" role="dialog" aria-labelledby="login-title" aria-hidden="true">
        <div class="modal-content">
          <div class="modal-header">
            <h2 id="login-title">
              <i class="fas fa-shield-alt"></i>
              Acesso Administrativo
            </h2>
          </div>
          
          <div class="modal-body">
            <form id="login-form">
              <div class="form-group">
                <label for="login-email">
                  <i class="fas fa-envelope"></i>
                  Email
                </label>
                <input 
                  type="email" 
                  id="login-email" 
                  name="email" 
                  required
                  autocomplete="email"
                  placeholder="seu@email.com"
                >
              </div>
              
              <div class="form-group">
                <label for="login-password">
                  <i class="fas fa-lock"></i>
                  Senha
                </label>
                <input 
                  type="password" 
                  id="login-password" 
                  name="password" 
                  required
                  autocomplete="current-password"
                  placeholder="Sua senha"
                >
              </div>
              
              <div class="login-actions">
                <button type="submit" class="btn btn-primary">
                  <i class="fas fa-sign-in-alt"></i>
                  Entrar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    this.loginModal = document.getElementById('login-modal');
    this.loginForm = document.getElementById('login-form');
  }

  bindEvents() {
    // Form de login
    if (this.loginForm) {
      this.loginForm.addEventListener('submit', this.handleLogin.bind(this));
    }

    // Botão de logout
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-logout]')) {
        this.handleLogout();
      }
    });

    // Tecla ESC no modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.loginModal?.style.display === 'block') {
        this.hideLogin();
      }
    });
  }

  async checkAuthStatus() {
    try {
      const user = await adminAPI.checkAuth();
      
      if (user) {
        this.onAuthSuccess(user);
      } else {
        this.showLogin();
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      this.showLogin();
    }
  }

  async handleLogin(e) {
    e.preventDefault();
    
    const formData = new FormData(this.loginForm);
    const email = formData.get('email');
    const password = formData.get('password');

    if (!email || !password) {
      adminUtils.showToast('Por favor, preencha todos os campos', 'warning');
      return;
    }

    const submitBtn = this.loginForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    try {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verificando...';

      const data = await adminAPI.login(email, password);
      
      this.onAuthSuccess(data.user);
      this.hideLogin();
      adminUtils.showToast('Login realizado com sucesso!', 'success');
      
    } catch (error) {
      console.error('Erro no login:', error);
      adminUtils.showToast(error.message || 'Erro ao fazer login', 'error');
      
      // Focar no campo de email para nova tentativa
      document.getElementById('login-email').focus();
      
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  }

  async handleLogout() {
    if (!confirm('Deseja realmente sair do sistema?')) {
      return;
    }

    try {
      await adminAPI.logout();
      this.onAuthLogout();
      adminUtils.showToast('Logout realizado com sucesso', 'info');
    } catch (error) {
      console.error('Erro no logout:', error);
      // Mesmo com erro, fazer logout local
      this.onAuthLogout();
      adminUtils.showToast('Sessão encerrada', 'info');
    }
  }

  onAuthSuccess(user) {
    // Atualizar estado global
    adminAPI.isAuthenticated = true;
    adminAPI.user = user;

    // Mostrar interface admin
    this.showAdminInterface();
    
    // Atualizar informações do usuário na interface
    this.updateUserInfo(user);
    
    // Carregar dados iniciais
    if (window.adminDashboard) {
      adminDashboard.loadDashboard();
    }
  }

  onAuthLogout() {
    // Limpar estado
    adminAPI.isAuthenticated = false;
    adminAPI.user = null;
    
    // Esconder interface e mostrar login
    this.hideAdminInterface();
    this.showLogin();
    
    // Limpar dados sensíveis do DOM
    this.clearSensitiveData();
  }

  showLogin() {
    if (this.loginModal) {
      this.loginModal.style.display = 'block';
      this.loginModal.setAttribute('aria-hidden', 'false');
      
      // Focar no campo de email
      setTimeout(() => {
        document.getElementById('login-email')?.focus();
      }, 100);
    }
  }

  hideLogin() {
    if (this.loginModal) {
      this.loginModal.style.display = 'none';
      this.loginModal.setAttribute('aria-hidden', 'true');
      
      // Limpar form
      this.loginForm?.reset();
    }
  }

  showAdminInterface() {
    // Mostrar elementos da interface admin
    const adminElements = document.querySelectorAll('.admin-interface');
    adminElements.forEach(el => {
      el.style.display = 'block';
    });

    // Esconder loading se existir
    const loading = document.querySelector('.loading-screen');
    if (loading) {
      loading.style.display = 'none';
    }
  }

  hideAdminInterface() {
    // Esconder elementos da interface admin
    const adminElements = document.querySelectorAll('.admin-interface');
    adminElements.forEach(el => {
      el.style.display = 'none';
    });
  }

  updateUserInfo(user) {
    // Atualizar nome do usuário
    const userNameElements = document.querySelectorAll('[data-user-name]');
    userNameElements.forEach(el => {
      el.textContent = user.name || user.email;
    });

    // Atualizar email do usuário
    const userEmailElements = document.querySelectorAll('[data-user-email]');
    userEmailElements.forEach(el => {
      el.textContent = user.email;
    });

    // Atualizar avatar (iniciais)
    const avatarElements = document.querySelectorAll('[data-user-avatar]');
    avatarElements.forEach(el => {
      const initials = (user.name || user.email)
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
      el.textContent = initials;
    });

    // Atualizar role se existir
    if (user.role) {
      const roleElements = document.querySelectorAll('[data-user-role]');
      roleElements.forEach(el => {
        el.textContent = user.role;
      });
    }
  }

  clearSensitiveData() {
    // Limpar dados sensíveis do DOM
    const sensitiveElements = document.querySelectorAll('[data-sensitive]');
    sensitiveElements.forEach(el => {
      if (el.tagName === 'INPUT') {
        el.value = '';
      } else {
        el.textContent = '';
      }
    });

    // Limpar caches de dados
    if (window.adminProducts) {
      adminProducts.clearCache();
    }
    if (window.adminCategories) {
      adminCategories.clearCache();
    }
  }

  // Verificar se usuário está autenticado
  isAuthenticated() {
    return adminAPI.isAuthenticated && adminAPI.user;
  }

  // Obter usuário atual
  getCurrentUser() {
    return adminAPI.user;
  }

  // Verificar permissões (para futuras implementações)
  hasPermission(permission) {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    // Por enquanto, admin tem todas as permissões
    if (user.role === 'admin') return true;
    
    // Implementar sistema de permissões mais granular no futuro
    return false;
  }
}

// Inicializar autenticação quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  window.adminAuth = new AdminAuth();
});