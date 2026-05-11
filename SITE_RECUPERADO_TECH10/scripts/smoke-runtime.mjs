const baseUrl = (process.env.SMOKE_BASE_URL || 'http://localhost:4111').replace(/\/$/, '');
const expectStoreConfigured =
  process.env.EXPECT_CATALOG_BACKEND === '1' || process.env.EXPECT_STORE_BACKEND === '1';

const targets = [
  { path: '/', expectedStatus: 200, label: 'home' },
  { path: '/loja', expectedStatus: 200, label: 'loja' },
  { path: '/carrinho', expectedStatus: 200, label: 'carrinho' },
  { path: '/checkout', expectedStatus: 200, label: 'checkout' },
  { path: '/portal', expectedStatus: 200, label: 'portal' },
  { path: '/api/runtime-config', expectedStatus: 200, label: 'runtime-config' },
  { path: '/api/health', expectedStatus: expectStoreConfigured ? 200 : 503, label: 'health' },
];

async function main() {
  for (const target of targets) {
    const response = await fetch(`${baseUrl}${target.path}`);
    if (response.status !== target.expectedStatus) {
      throw new Error(`Smoke falhou em ${target.label}: esperado ${target.expectedStatus}, recebido ${response.status}`);
    }
  }

  const healthResponse = await fetch(`${baseUrl}/api/health`);
  const health = await healthResponse.json();
  const runtimeConfigResponse = await fetch(`${baseUrl}/api/runtime-config`);
  const runtimeConfig = await runtimeConfigResponse.json();
  console.log(JSON.stringify({
    ok: true,
    baseUrl,
    expectStoreConfigured,
    healthStatus: health.status,
    commerce: runtimeConfig.commerce,
    integrations: health.integrations,
  }, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
