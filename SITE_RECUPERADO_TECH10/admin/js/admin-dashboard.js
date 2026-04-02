/**
 * 📊 TECH10 ADMIN DASHBOARD
 * Dashboard principal com métricas e gráficos
 */

class AdminDashboard {
  constructor() {
    this.charts = {};
    this.stats = {};
    this.refreshInterval = null;
    this.init();
  }

  init() {
    this.bindEvents();
    this.setupAutoRefresh();
  }

  bindEvents() {
    // Botão de refresh
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-refresh-dashboard]')) {
        this.loadDashboard();
      }
    });

    // Seletores de período
    document.addEventListener('change', (e) => {
      if (e.target.matches('[data-period-selector]')) {
        this.loadDashboard(e.target.value);
      }
    });
  }

  setupAutoRefresh() {
    // Refresh automático a cada 5 minutos
    this.refreshInterval = setInterval(() => {
      if (adminAPI.isAuthenticated && this.isVisible()) {
        this.loadDashboard();
      }
    }, 5 * 60 * 1000);
  }

  isVisible() {
    const dashboardSection = document.getElementById('dashboard-section');
    return dashboardSection && !dashboardSection.hidden;
  }

  async loadDashboard(period = '30') {
    try {
      this.showLoading();
      
      // Carregar dados em paralelo
      const [dashboardData, categoryStats, productsReport] = await Promise.all([
        adminAPI.getDashboard(),
        adminAPI.getCategoryStats(),
        adminAPI.getProductsReport(period)
      ]);

      this.stats = { ...dashboardData, categoryStats, productsReport };
      
      // Atualizar interface
      this.updateStats(dashboardData);
      this.updateCharts(categoryStats, productsReport);
      this.updateRecentActivity(dashboardData.recentActivity || []);
      
      this.hideLoading();
      
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      this.hideLoading();
      adminUtils.showToast('Erro ao carregar dados do dashboard', 'error');
    }
  }

  updateStats(data) {
    // Estatísticas principais
    this.updateStatCard('total-products', data.totalProducts, 'produtos');
    this.updateStatCard('total-categories', data.totalCategories, 'categorias');
    this.updateStatCard('total-views', data.totalViews, 'visualizações');
    this.updateStatCard('active-products', data.activeProducts, 'ativos');

    // Estatísticas secundárias
    this.updateStatCard('products-today', data.productsToday, 'hoje');
    this.updateStatCard('categories-with-products', data.categoriesWithProducts, 'com produtos');
    this.updateStatCard('avg-products-per-category', data.avgProductsPerCategory?.toFixed(1), 'média');
    this.updateStatCard('storage-used', this.formatBytes(data.storageUsed), 'storage');
  }

  updateStatCard(id, value, label) {
    const card = document.querySelector(`[data-stat="${id}"]`);
    if (!card) return;

    const valueEl = card.querySelector('.stat-value');
    const labelEl = card.querySelector('.stat-label');

    if (valueEl) {
      // Animação de counter
      this.animateCounter(valueEl, value);
    }

    if (labelEl && label) {
      labelEl.textContent = label;
    }
  }

  animateCounter(element, targetValue) {
    const startValue = parseInt(element.textContent) || 0;
    const target = parseInt(targetValue) || 0;
    const duration = 1000;
    const increment = (target - startValue) / (duration / 16);

    let current = startValue;
    const timer = setInterval(() => {
      current += increment;
      
      if ((increment > 0 && current >= target) || (increment < 0 && current <= target)) {
        current = target;
        clearInterval(timer);
      }
      
      element.textContent = Math.round(current);
    }, 16);
  }

  updateCharts(categoryStats, productsReport) {
    this.updateCategoryChart(categoryStats);
    this.updateProductsChart(productsReport);
    this.updateActivityChart(productsReport);
  }

  updateCategoryChart(categoryStats) {
    const canvas = document.getElementById('categories-chart');
    if (!canvas) return;

    // Destruir gráfico anterior
    if (this.charts.categories) {
      this.charts.categories.destroy();
    }

    const ctx = canvas.getContext('2d');
    
    this.charts.categories = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: categoryStats.map(cat => cat.name),
        datasets: [{
          data: categoryStats.map(cat => cat.product_count),
          backgroundColor: [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
            '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
          ],
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              usePointStyle: true
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((context.raw / total) * 100).toFixed(1);
                return `${context.label}: ${context.raw} produtos (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }

  updateProductsChart(productsReport) {
    const canvas = document.getElementById('products-chart');
    if (!canvas) return;

    if (this.charts.products) {
      this.charts.products.destroy();
    }

    const ctx = canvas.getContext('2d');
    
    this.charts.products = new Chart(ctx, {
      type: 'line',
      data: {
        labels: productsReport.map(item => this.formatDate(item.date)),
        datasets: [{
          label: 'Produtos Criados',
          data: productsReport.map(item => item.count),
          borderColor: '#36A2EB',
          backgroundColor: 'rgba(54, 162, 235, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: {
              display: false
            }
          },
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });
  }

  updateActivityChart(data) {
    const canvas = document.getElementById('activity-chart');
    if (!canvas) return;

    if (this.charts.activity) {
      this.charts.activity.destroy();
    }

    const ctx = canvas.getContext('2d');
    
    // Processar dados para gráfico de atividade
    const activityData = this.processActivityData(data);
    
    this.charts.activity = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: activityData.labels,
        datasets: [{
          label: 'Atividade',
          data: activityData.values,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });
  }

  processActivityData(data) {
    // Agrupar por dia da semana
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const activity = new Array(7).fill(0);

    data.forEach(item => {
      const date = new Date(item.date);
      const dayIndex = date.getDay();
      activity[dayIndex] += item.count;
    });

    return {
      labels: days,
      values: activity
    };
  }

  updateRecentActivity(activities) {
    const container = document.getElementById('recent-activity');
    if (!container) return;

    if (!activities || activities.length === 0) {
      container.innerHTML = `
        <div class="no-activity">
          <i class="fas fa-info-circle"></i>
          <p>Nenhuma atividade recente</p>
        </div>
      `;
      return;
    }

    const html = activities.map(activity => `
      <div class="activity-item">
        <div class="activity-icon">
          <i class="fas ${this.getActivityIcon(activity.type)}"></i>
        </div>
        <div class="activity-content">
          <p class="activity-text">${this.formatActivityText(activity)}</p>
          <small class="activity-time">${this.formatRelativeTime(activity.created_at)}</small>
        </div>
      </div>
    `).join('');

    container.innerHTML = html;
  }

  getActivityIcon(type) {
    const icons = {
      'product_created': 'fa-plus-circle',
      'product_updated': 'fa-edit',
      'product_deleted': 'fa-trash',
      'category_created': 'fa-folder-plus',
      'category_updated': 'fa-folder-open',
      'category_deleted': 'fa-folder-minus',
      'settings_updated': 'fa-cog',
      'login': 'fa-sign-in-alt',
      'logout': 'fa-sign-out-alt'
    };
    return icons[type] || 'fa-circle';
  }

  formatActivityText(activity) {
    const templates = {
      'product_created': `Produto "${activity.details}" foi criado`,
      'product_updated': `Produto "${activity.details}" foi atualizado`,
      'product_deleted': `Produto foi removido`,
      'category_created': `Categoria "${activity.details}" foi criada`,
      'category_updated': `Categoria "${activity.details}" foi atualizada`,
      'category_deleted': `Categoria foi removida`,
      'settings_updated': `Configurações foram atualizadas`,
      'login': `Login realizado`,
      'logout': `Logout realizado`
    };
    
    return templates[activity.type] || `Ação: ${activity.type}`;
  }

  formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'agora';
    if (diffMins < 60) return `${diffMins}min atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays < 7) return `${diffDays}d atrás`;
    
    return date.toLocaleDateString('pt-BR');
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit'
    });
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  showLoading() {
    const dashboard = document.getElementById('dashboard-content');
    if (dashboard) {
      dashboard.classList.add('loading');
    }
  }

  hideLoading() {
    const dashboard = document.getElementById('dashboard-content');
    if (dashboard) {
      dashboard.classList.remove('loading');
    }
  }

  destroy() {
    // Limpar interval
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }

    // Destruir gráficos
    Object.values(this.charts).forEach(chart => {
      if (chart && chart.destroy) {
        chart.destroy();
      }
    });

    this.charts = {};
  }
}

// Inicializar dashboard
document.addEventListener('DOMContentLoaded', () => {
  window.adminDashboard = new AdminDashboard();
});