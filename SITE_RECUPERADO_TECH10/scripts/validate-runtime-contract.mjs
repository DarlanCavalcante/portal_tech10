import fs from 'node:fs';
import path from 'node:path';

const runtimeRoot = process.cwd();
const repoRoot = path.resolve(runtimeRoot, '..');

const requiredFiles = [
  'vercel.json',
  '.env.example',
  'api/health.js',
  'api/runtime-config.js',
  'api/store-proxy.js',
  'portal/index.html',
  'js/tenant-config.js',
  'js/tenant-routes.js',
  'js/portal-entry.js',
  'README.md',
];

const requiredDocs = [
  'docs/DECISAO_ARQUITETURAL_PUBLICACAO_STANDALONE_TECH10.md',
  'docs/RAIOX_PORTAL_TECH10_2026-05-11.md',
  'docs/VARIAVEIS_E_CONFIGURACAO_PORTAL_TECH10.md',
  'docs/CONTRATO_DE_AMBIENTE_TENANT_TECH10.md',
  'docs/RUNBOOK_DEPLOY_E_OPERACAO_TENANT_TECH10.md',
  'docs/GOVERNANCA_E_BOAS_PRATICAS_TENANT_TECH10.md',
  'docs/SMOKE_E_VALIDACAO_TENANT_TECH10.md',
  'docs/adr/ADR-001-RUNTIME-STANDALONE-TECH10.md',
];

const requiredEnvKeys = [
  'TECH10_STORE_BACKEND_URL',
  'TECH10_ERP_PORTAL_BASE_URL',
  'TECH10_ERP_STATUS_BASE_URL',
];

const requiredRewriteDestinations = [
  '/loja',
  '/carrinho',
  '/checkout',
  '/pedido-confirmado',
  '/portal',
];

const failures = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

for (const relativeFile of requiredFiles) {
  const fullPath = path.join(runtimeRoot, relativeFile);
  assert(fs.existsSync(fullPath), `Arquivo obrigatório ausente no runtime: ${relativeFile}`);
}

for (const relativeFile of requiredDocs) {
  const fullPath = path.join(repoRoot, relativeFile);
  assert(fs.existsSync(fullPath), `Documento canônico ausente: ${relativeFile}`);
}

const envExamplePath = path.join(runtimeRoot, '.env.example');
if (fs.existsSync(envExamplePath)) {
  const envExample = fs.readFileSync(envExamplePath, 'utf8');
  for (const key of requiredEnvKeys) {
    assert(envExample.includes(`${key}=`), `.env.example não contém a variável obrigatória ${key}`);
  }
}

const vercelConfigPath = path.join(runtimeRoot, 'vercel.json');
if (fs.existsSync(vercelConfigPath)) {
  const vercelConfig = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf8'));
  const rewrites = Array.isArray(vercelConfig.rewrites) ? vercelConfig.rewrites : [];
  const destinations = rewrites.map((item) => item.source);
  for (const route of requiredRewriteDestinations) {
    assert(
      destinations.includes(route) || rewrites.some((item) => item.destination === `${route}.html`),
      `vercel.json não expõe a rota canônica esperada: ${route}`
    );
  }
}

const tenantConfigPath = path.join(runtimeRoot, 'js', 'tenant-config.js');
if (fs.existsSync(tenantConfigPath)) {
  const tenantConfig = fs.readFileSync(tenantConfigPath, 'utf8');
  assert(tenantConfig.includes("provider: 'tech10-standalone'"), 'tenant-config.js não está em modo tech10-standalone');
  assert(tenantConfig.includes("portalPath: '/portal'"), 'tenant-config.js não declara portalPath canônico');
  assert(tenantConfig.includes("apiBasePath: '/api/store'"), 'tenant-config.js não aponta para /api/store');
}

if (failures.length > 0) {
  console.error('Falhas na validação do runtime Tech10:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('Runtime Tech10 validado com sucesso.');
