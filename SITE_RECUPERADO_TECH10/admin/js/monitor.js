let systemChart, requestsChart;
let autoRefreshInterval = null;
let isAutoRefreshing = false;
let previousData = {};

// Inicializar charts
function initCharts() {
    // System Chart
    const systemCtx = document.getElementById('systemChart').getContext('2d');
    systemChart = new Chart(systemCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'CPU %',
                data: [],
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                tension: 0.4
            }, {
                label: 'Memory %',
                data: [],
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: '#e2e8f0' }
                }
            },
            scales: {
                x: {
                    ticks: { color: '#94a3b8' },
                    grid: { color: '#334155' }
                },
                y: {
                    ticks: { color: '#94a3b8' },
                    grid: { color: '#334155' },
                    min: 0,
                    max: 100
                }
            }
        }
    });

    // Requests Chart
    const requestsCtx = document.getElementById('requestsChart').getContext('2d');
    requestsChart = new Chart(requestsCtx, {
        type: 'doughnut',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [
                    '#10b981',
                    '#f59e0b', 
                    '#ef4444',
                    '#8b5cf6',
                    '#06b6d4'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: '#e2e8f0' }
                }
            }
        }
    });
}

// Carregar dados do sistema
async function loadSystemData() {
    try {
        const response = await fetch('/api/monitor/stats');
        const data = await response.json();
        
        updateMetrics(data);
        updateCharts(data);
        updateAlerts(data.alerts || []);
        updateStatus('online');
        
        document.getElementById('lastUpdate').textContent = new Date().toLocaleTimeString('pt-BR');
        
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        updateStatus('error');
    }
}

// Carregar dados do cache
async function loadCacheData() {
    try {
        const response = await fetch('/api/monitor/cache');
        const data = await response.json();
        
        document.getElementById('cacheHitRate').innerHTML = 
            `${data.hitRate.toFixed(1)}<span class="metric-unit">%</span>`;
        
        // Calcular mudança do cache
        const change = calculateChange(data.hitRate, previousData.cacheHitRate);
        updateChangeIndicator('cacheChange', change);
        
        previousData.cacheHitRate = data.hitRate;
        
    } catch (error) {
        console.error('Erro ao carregar dados do cache:', error);
    }
}

// Atualizar métricas
function updateMetrics(data) {
    const { system, requests } = data;
    
    // CPU
    const currentCPU = system.currentCPU || 0;
    document.getElementById('cpuUsage').innerHTML = 
        `${currentCPU}<span class="metric-unit">%</span>`;
    
    const cpuChange = calculateChange(currentCPU, previousData.cpu);
    updateChangeIndicator('cpuChange', cpuChange);
    previousData.cpu = currentCPU;

    // Memory
    const currentMemory = system.currentMemory?.usedPercent || 0;
    document.getElementById('memoryUsage').innerHTML = 
        `${currentMemory}<span class="metric-unit">%</span>`;
    
    const memoryChange = calculateChange(currentMemory, previousData.memory);
    updateChangeIndicator('memoryChange', memoryChange);
    previousData.memory = currentMemory;

    // Requests
    document.getElementById('totalRequests').textContent = requests.total || 0;
    const requestsChange = calculateChange(requests.total, previousData.requests);
    updateChangeIndicator('requestsChange', requestsChange);
    previousData.requests = requests.total;

    // Response Time
    const avgResponseTime = requests.averageResponseTime || 0;
    document.getElementById('avgResponseTime').innerHTML = 
        `${avgResponseTime}<span class="metric-unit">ms</span>`;
    
    const responseTimeChange = calculateChange(avgResponseTime, previousData.responseTime);
    updateChangeIndicator('responseTimeChange', responseTimeChange);
    previousData.responseTime = avgResponseTime;

    // Error Rate
    const errorRate = requests.errorRate || 0;
    document.getElementById('errorRate').innerHTML = 
        `${errorRate}<span class="metric-unit">%</span>`;
    
    const errorRateChange = calculateChange(errorRate, previousData.errorRate);
    updateChangeIndicator('errorRateChange', errorRateChange);
    previousData.errorRate = errorRate;
}

// Calcular mudança percentual
function calculateChange(current, previous) {
    if (previous === undefined) return null;
    return ((current - previous) / previous) * 100;
}

// Atualizar indicador de mudança
function updateChangeIndicator(elementId, change) {
    const element = document.getElementById(elementId);
    if (change === null) {
        element.textContent = '-';
        element.className = 'metric-change change-neutral';
        return;
    }

    const icon = change > 0 ? '↗' : change < 0 ? '↘' : '→';
    const color = change > 0 ? 'change-positive' : change < 0 ? 'change-negative' : 'change-neutral';
    
    element.textContent = `${icon} ${Math.abs(change).toFixed(1)}%`;
    element.className = `metric-change ${color}`;
}

// Atualizar gráficos
function updateCharts(data) {
    const { system, requests } = data;
    
    // System Chart
    if (system.cpu && system.cpu.length > 0) {
        const cpuData = system.cpu.slice(-20); // Últimos 20 pontos
        const memoryData = system.memory.slice(-20);
        
        systemChart.data.labels = cpuData.map((_, i) => i);
        systemChart.data.datasets[0].data = cpuData.map(d => d.usage);
        systemChart.data.datasets[1].data = memoryData.map(d => d.usedPercent);
        systemChart.update('none');
    }

    // Requests Chart
    if (requests.byStatus) {
        const labels = Object.keys(requests.byStatus);
        const values = Object.values(requests.byStatus);
        
        requestsChart.data.labels = labels;
        requestsChart.data.datasets[0].data = values;
        requestsChart.update('none');
    }
}

// Atualizar alertas
function updateAlerts(alerts) {
    const container = document.getElementById('alertsContainer');
    
    if (alerts.length === 0) {
        container.innerHTML = '<div style="color: #10b981; text-align: center; padding: 1rem;">✅ Nenhum alerta ativo</div>';
        return;
    }

    const alertsHTML = alerts.map(alert => {
        const icon = alert.severity === 'critical' ? 'fas fa-exclamation-circle' :
                   alert.severity === 'warning' ? 'fas fa-exclamation-triangle' : 'fas fa-info-circle';
        
        return `
            <div class="alert-item alert-${alert.severity}">
                <i class="${icon} alert-icon"></i>
                <div class="alert-content">
                    <div class="alert-message">${alert.message}</div>
                    <div class="alert-time">${new Date(alert.timestamp).toLocaleString('pt-BR')}</div>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = alertsHTML;
}

// Atualizar status
function updateStatus(status) {
    const dot = document.getElementById('statusDot');
    const text = document.getElementById('statusText');
    
    dot.className = 'status-dot';
    switch (status) {
        case 'online':
            dot.classList.add('status-online');
            text.textContent = 'Sistema Online';
            break;
        case 'warning':
            dot.classList.add('status-warning');
            text.textContent = 'Sistema com Alertas';
            break;
        case 'error':
            dot.classList.add('status-error');
            text.textContent = 'Sistema Offline';
            break;
    }
}

// Atualizar dados
async function refreshData() {
    await Promise.all([
        loadSystemData(),
        loadCacheData()
    ]);
}

// Toggle auto refresh
function toggleAutoRefresh() {
    const btn = document.getElementById('autoRefreshBtn');
    
    if (isAutoRefreshing) {
        clearInterval(autoRefreshInterval);
        isAutoRefreshing = false;
        btn.innerHTML = '<i class="fas fa-play"></i> Auto Refresh';
    } else {
        autoRefreshInterval = setInterval(refreshData, 5000); // 5 segundos
        isAutoRefreshing = true;
        btn.innerHTML = '<i class="fas fa-pause"></i> Pausar';
    }
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    initCharts();
    refreshData();
    
    // Event listeners
    document.getElementById('refreshBtn').addEventListener('click', refreshData);
    document.getElementById('autoRefreshBtn').addEventListener('click', toggleAutoRefresh);
    
    // Auto refresh padrão
    setTimeout(() => {
        if (!isAutoRefreshing) {
            toggleAutoRefresh();
        }
    }, 1000);
});