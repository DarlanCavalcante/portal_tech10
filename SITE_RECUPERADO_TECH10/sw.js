// Service Worker para Tech10 PWA - Estratégia Mercado Livre
const CACHE_NAME = 'tech10-v2.0.0';
const CACHE_STATIC = 'tech10-static-v2.0.0';
const CACHE_DYNAMIC = 'tech10-dynamic-v2.0.0';
const CACHE_IMAGES = 'tech10-images-v2.0.0';

// Assets que raramente mudam (Cache First)
const STATIC_ASSETS = [
  '/manifest.json',
  '/imagem/favico/favicon.ico'
];

// Instalação do Service Worker
self.addEventListener('install', event => {
  console.log('🚀 Tech10 SW v2.0: Instalando (Estratégia Mercado Livre)...');
  event.waitUntil(
    caches.open(CACHE_STATIC)
      .then(cache => {
        console.log('📦 Tech10 SW: Cacheando assets estáticos');
        return Promise.allSettled(
          STATIC_ASSETS.map(url => 
            cache.add(url).catch(err => {
              console.warn(`⚠️ Falha ao cachear ${url}:`, err);
              return null;
            })
          )
        );
      })
      .then(() => {
        console.log('✅ Tech10 SW: Instalação completa - pulando espera');
        return self.skipWaiting();
      })
  );
});

// Ativação e limpeza de caches antigos
self.addEventListener('activate', event => {
  console.log('🔄 Tech10 SW v2.0: Ativando...');
  const currentCaches = [CACHE_NAME, CACHE_STATIC, CACHE_DYNAMIC, CACHE_IMAGES];
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!currentCaches.includes(cacheName)) {
            console.log('🗑️ Tech10 SW: Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ Tech10 SW v2.0: Ativado - assumindo controle de clientes');
      return self.clients.claim();
    })
  );
});

// Estratégia de Cache (Mercado Livre Style)
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Apenas GET requests
  if (request.method !== 'GET') return;
  
  // Ignorar non-HTTP requests
  if (!request.url.startsWith('http')) return;

  // ESTRATÉGIA 1: API - SEMPRE NETWORK (dados frescos)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkOnly(request));
    return;
  }

  // ESTRATÉGIA 2: CSS/JS - NETWORK FIRST (atualizações imediatas)
  if (url.pathname.endsWith('.css') || url.pathname.endsWith('.js')) {
    event.respondWith(networkFirst(request, CACHE_DYNAMIC));
    return;
  }

  // ESTRATÉGIA 3: Imagens - CACHE FIRST (performance)
  if (url.pathname.match(/\.(jpg|jpeg|png|gif|svg|webp|ico)$/i)) {
    event.respondWith(cacheFirst(request, CACHE_IMAGES));
    return;
  }

  // ESTRATÉGIA 4: HTML - NETWORK FIRST (conteúdo atualizado)
  if (request.destination === 'document' || url.pathname.endsWith('.html')) {
    event.respondWith(networkFirst(request, CACHE_DYNAMIC));
    return;
  }

  // ESTRATÉGIA 5: Fonts/CDN - CACHE FIRST (performance)
  if (url.hostname.includes('fonts.googleapis.com') || 
      url.hostname.includes('cdnjs.cloudflare.com') ||
      url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(cacheFirst(request, CACHE_STATIC));
    return;
  }

  // Padrão: Network First
  event.respondWith(networkFirst(request, CACHE_DYNAMIC));
});

// Network Only - Sempre da rede (API)
async function networkOnly(request) {
  try {
    console.log('🌐 Network Only:', request.url);
    return await fetch(request);
  } catch (error) {
    console.error('❌ Network Only falhou:', request.url, error);
    return new Response(JSON.stringify({ error: 'Sem conexão' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Network First - Rede primeiro, cache como fallback (CSS/JS/HTML)
async function networkFirst(request, cacheName) {
  try {
    console.log('🌐 Network First (tentando rede):', request.url);
    const networkResponse = await fetch(request);
    
    // Atualiza cache com versão fresca
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
      console.log('✅ Cache atualizado:', request.url);
    }
    
    return networkResponse;
  } catch (error) {
    console.log('⚠️ Rede falhou, usando cache:', request.url);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback para HTML: Tech10 usa /tech10/, não a raiz
    if (request.destination === 'document') {
      const path = url.pathname || '';
      if (path.startsWith('/tech10/')) {
        const fallback = await caches.match('/tech10/index.html');
        if (fallback) return fallback;
      }
      const fallback = await caches.match('/index.html');
      if (fallback) return fallback;
    }
    
    throw error;
  }
}

// Cache First - Cache primeiro, rede como fallback (Imagens/Fonts)
async function cacheFirst(request, cacheName) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    console.log('📦 Cache Hit:', request.url);
    return cachedResponse;
  }
  
  try {
    console.log('🌐 Cache Miss, buscando na rede:', request.url);
    const networkResponse = await fetch(request);
    
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('❌ Cache e Rede falharam:', request.url, error);
    throw error;
  }
}

// Listener para mensagens (skip waiting)
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('⏭️ Tech10 SW: Pulando espera por comando do cliente');
    self.skipWaiting();
  }
});

// Notificações Push (para futuras implementações)
self.addEventListener('push', event => {
  console.log('📢 Tech10 SW: Notificação push recebida');
  
  const options = {
    body: event.data ? event.data.text() : 'Nova promoção disponível!',
    icon: '/imagem/favico/favicon.ico',
    badge: '/imagem/favico/favicon.ico',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver Produtos',
        icon: '/imagem/favico/favicon.ico'
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/imagem/favico/favicon.ico'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Tech10 Informática', options)
  );
});

// Click em notificações
self.addEventListener('notificationclick', event => {
  console.log('🖱️ Tech10 SW: Notificação clicada:', event.notification.tag);
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/#produtos')
    );
  } else if (event.action === 'close') {
    // Apenas fecha a notificação
  } else {
    // Click na notificação principal
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Sync em background (para formulários offline)
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    console.log('🔄 Tech10 SW: Sincronização em background');
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Implementar sincronização de dados offline
  console.log('📊 Tech10 SW: Executando sincronização...');
}