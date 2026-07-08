(function (global) {
  'use strict';

  const cfg = global.TENANT_CONFIG || {};
  const company = cfg.company || {};
  const brand = cfg.brand || {};
  const seo = cfg.seo || {};
  const locationObj = global.location || { pathname: '/' };

  const siteUrl = String(seo.siteUrl || company.website || 'https://tech10.loja.tech10cloud.com').replace(/\/$/, '');
  const path = locationObj.pathname || '/';
  const fallbackImage = brand.logoUrl || '/imagem/logo/tech10-logo-principal-pulso-hibrido.svg';
  const phoneDigits = String(company.phone || '').replace(/\D/g, '');
  const whatsappDigits = String(company.whatsapp || '').replace(/\D/g, '');
  const fullAddress = [
    company.address && company.address.street,
    company.address && company.address.neighborhood,
    company.address && company.address.city,
    company.address && company.address.state,
    company.address && company.address.zip,
  ].filter(Boolean).join(', ');

  const pageDefinitions = [
    {
      aliases: ['/'],
      canonical: '/',
      title: 'Tech10 Informática e Tecnologia em Santa Maria/RS | Assistência Apple, Samsung, notebooks, redes e sistemas',
      description: 'Assistência técnica Apple, iPhone, Samsung e Android, conserto de notebooks e computadores, redes, infraestrutura, desenvolvimento de sistemas e loja de informática em Santa Maria/RS.',
      keywords: 'tech10 santa maria, assistência técnica santa maria, loja de informática santa maria, conserto de notebook santa maria, assistência apple santa maria, assistência samsung santa maria',
      kind: 'website',
      breadcrumb: 'Início',
    },
    {
      aliases: ['/loja', '/produtos.html'],
      canonical: '/loja',
      title: 'Loja de Informática em Santa Maria/RS | Tech10 Informática e Tecnologia',
      description: 'Loja de informática em Santa Maria/RS com acessórios, periféricos, cabos, itens de conectividade, carrinho e checkout Pix direto da Tech10, com suporte humano quando necessário.',
      keywords: 'loja de informática santa maria, acessórios para celular santa maria, periféricos santa maria, cabos santa maria',
      kind: 'website',
      breadcrumb: 'Loja',
    },
    {
      aliases: ['/assistencia-tecnica-apple-santa-maria', '/categorias/apple.html'],
      canonical: '/assistencia-tecnica-apple-santa-maria',
      title: 'Assistência Técnica Apple em Santa Maria/RS | Tech10 Informática e Tecnologia',
      description: 'Conserto de iPhone, iPad, MacBook e iMac em Santa Maria/RS com diagnóstico técnico, troca de tela e bateria, reparo de placa e garantia da Tech10.',
      keywords: 'assistência técnica apple santa maria, conserto iphone santa maria, conserto macbook santa maria, assistência ipad santa maria',
      kind: 'service',
      breadcrumb: 'Assistência Apple',
      serviceType: 'Assistência técnica Apple em Santa Maria',
    },
    {
      aliases: ['/conserto-iphone-santa-maria', '/categorias/smartphones.html'],
      canonical: '/conserto-iphone-santa-maria',
      title: 'Conserto de iPhone em Santa Maria/RS | Tech10 Informática e Tecnologia',
      description: 'Conserto de iPhone em Santa Maria/RS com troca de tela, bateria, câmera, conector, placa e recuperação de dados com atendimento rápido da Tech10.',
      keywords: 'conserto de iphone santa maria, troca de tela iphone santa maria, troca bateria iphone santa maria',
      kind: 'service',
      breadcrumb: 'Conserto de iPhone',
      serviceType: 'Conserto de iPhone em Santa Maria',
    },
    {
      aliases: ['/assistencia-samsung-santa-maria', '/categorias/android.html'],
      canonical: '/assistencia-samsung-santa-maria',
      title: 'Assistência Samsung em Santa Maria/RS | Tech10 Informática e Tecnologia',
      description: 'Assistência Samsung em Santa Maria/RS para Galaxy e outras linhas Android, com troca de tela, bateria, software, conector e reparos rápidos na Tech10.',
      keywords: 'assistência samsung santa maria, conserto samsung santa maria, assistência android santa maria, troca tela samsung santa maria',
      kind: 'service',
      breadcrumb: 'Assistência Samsung',
      serviceType: 'Assistência Samsung em Santa Maria',
    },
    {
      aliases: ['/conserto-notebook-santa-maria', '/categorias/notebooks.html'],
      canonical: '/conserto-notebook-santa-maria',
      title: 'Conserto de Notebook em Santa Maria/RS | Tech10 Informática e Tecnologia',
      description: 'Conserto de notebook em Santa Maria/RS para Dell, HP, Lenovo, Acer e outras marcas, com limpeza, formatação, upgrade e suporte técnico da Tech10.',
      keywords: 'conserto de notebook santa maria, manutenção notebook santa maria, formatação notebook santa maria',
      kind: 'service',
      breadcrumb: 'Conserto de Notebook',
      serviceType: 'Conserto de notebook em Santa Maria',
    },
    {
      aliases: ['/manutencao-computador-santa-maria', '/categorias/computadores.html'],
      canonical: '/manutencao-computador-santa-maria',
      title: 'Manutenção de Computador em Santa Maria/RS | Tech10 Informática e Tecnologia',
      description: 'Manutenção de computador em Santa Maria/RS com montagem, upgrade, troca de peças, limpeza, formatação e recuperação de desempenho para PCs domésticos e empresariais.',
      keywords: 'manutenção de computador santa maria, conserto de pc santa maria, upgrade de computador santa maria',
      kind: 'service',
      breadcrumb: 'Manutenção de Computador',
      serviceType: 'Manutenção de computador em Santa Maria',
    },
    {
      aliases: ['/redes-e-infraestrutura-santa-maria', '/categorias/redes-infraestrutura.html'],
      canonical: '/redes-e-infraestrutura-santa-maria',
      title: 'Redes e Infraestrutura em Santa Maria/RS | Tech10 Informática e Tecnologia',
      description: 'Projetos de redes e infraestrutura em Santa Maria/RS para empresas e residências, com Wi‑Fi, cabeamento, roteadores, switches, organização e suporte técnico da Tech10.',
      keywords: 'redes e infraestrutura santa maria, cabeamento estruturado santa maria, wifi empresarial santa maria, suporte de rede santa maria',
      kind: 'service',
      breadcrumb: 'Redes e Infraestrutura',
      serviceType: 'Redes e infraestrutura em Santa Maria',
    },
    {
      aliases: ['/desenvolvimento-de-sistemas-santa-maria', '/categorias/desenvolvimento.html'],
      canonical: '/desenvolvimento-de-sistemas-santa-maria',
      title: 'Desenvolvimento de Sistemas em Santa Maria/RS | Tech10 Informática e Tecnologia',
      description: 'Desenvolvimento de sistemas em Santa Maria/RS com sites, sistemas web, e-commerce, integrações e suporte técnico para empresas e negócios locais.',
      keywords: 'desenvolvimento de sistemas santa maria, criação de site santa maria, sistema web santa maria, e-commerce santa maria',
      kind: 'service',
      breadcrumb: 'Desenvolvimento de Sistemas',
      serviceType: 'Desenvolvimento de sistemas em Santa Maria',
    },
    {
      aliases: ['/loja-de-informatica-santa-maria', '/categorias/assistencia.html'],
      canonical: '/loja-de-informatica-santa-maria',
      title: 'Loja de Informática em Santa Maria/RS | Tech10 Informática e Tecnologia',
      description: 'Loja de informática em Santa Maria/RS com assistência técnica, vendas, upgrades, acessórios e atendimento presencial para empresas e clientes finais.',
      keywords: 'loja de informática santa maria, assistência técnica informática santa maria, informática santa maria centro',
      kind: 'service',
      breadcrumb: 'Loja de Informática',
      serviceType: 'Loja de informática em Santa Maria',
    },
    {
      aliases: ['/portal', '/status', '/carrinho', '/checkout', '/pedido-confirmado'],
      canonical: '/',
      title: 'Tech10 Informática e Tecnologia',
      description: 'Tech10 Informática e Tecnologia em Santa Maria/RS.',
      keywords: 'tech10 santa maria',
      kind: 'utility',
      noindex: true,
      breadcrumb: 'Tech10',
    },
  ];

  function absoluteUrl(urlPath) {
    if (!urlPath) return siteUrl;
    if (/^https?:\/\//i.test(urlPath)) return urlPath;
    return `${siteUrl}${urlPath.startsWith('/') ? '' : '/'}${urlPath}`;
  }

  function findPageDefinition(currentPath) {
    return pageDefinitions.find((page) => page.aliases.includes(currentPath)) || pageDefinitions[0];
  }

  function upsertMeta(selector, attrs, content) {
    let element = document.head.querySelector(selector);
    if (!element) {
      element = document.createElement('meta');
      Object.entries(attrs).forEach(([key, value]) => element.setAttribute(key, value));
      document.head.appendChild(element);
    }
    element.setAttribute('content', content);
  }

  function upsertLink(selector, rel, href) {
    let element = document.head.querySelector(selector);
    if (!element) {
      element = document.createElement('link');
      element.setAttribute('rel', rel);
      document.head.appendChild(element);
    }
    element.setAttribute('href', href);
  }

  function upsertJsonLd(id, payload) {
    if (!payload) return;
    let element = document.getElementById(id);
    if (!element) {
      element = document.createElement('script');
      element.type = 'application/ld+json';
      element.id = id;
      document.head.appendChild(element);
    }
    element.textContent = JSON.stringify(payload);
  }

  function parseFaqEntries() {
    const heading = Array.from(document.querySelectorAll('h2')).find((item) => /Perguntas Frequentes/i.test(item.textContent || ''));
    if (!heading) return [];
    const section = heading.closest('section');
    if (!section) return [];

    return Array.from(section.querySelectorAll('h3')).map((questionEl) => {
      const answerEl = questionEl.nextElementSibling;
      const question = (questionEl.textContent || '').trim();
      const answer = answerEl ? (answerEl.textContent || '').trim() : '';
      return question && answer ? { question, answer } : null;
    }).filter(Boolean);
  }

  function buildOrganizationSchema() {
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: company.name || 'Tech10 Informática e Tecnologia',
      url: siteUrl,
      logo: absoluteUrl(fallbackImage),
      email: company.email || 'tech10.infor@gmail.com',
      telephone: company.phone || '(55) 3317-0762',
      sameAs: [company.instagram, company.facebook].filter(Boolean),
    };
  }

  function buildLocalBusinessSchema() {
    return {
      '@context': 'https://schema.org',
      '@type': 'ComputerStore',
      name: company.name || 'Tech10 Informática e Tecnologia',
      url: siteUrl,
      image: absoluteUrl(fallbackImage),
      telephone: company.phone || '(55) 3317-0762',
      email: company.email || 'tech10.infor@gmail.com',
      priceRange: '$$',
      address: {
        '@type': 'PostalAddress',
        streetAddress: company.address && company.address.street,
        addressLocality: company.address && company.address.city,
        addressRegion: company.address && company.address.state,
        postalCode: company.address && company.address.zip,
        addressCountry: 'BR',
      },
      sameAs: [company.instagram, company.facebook].filter(Boolean),
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          opens: '09:00',
          closes: '12:00',
        },
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          opens: '13:00',
          closes: '18:00',
        },
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: 'Saturday',
          opens: '09:00',
          closes: '13:00',
        },
      ],
      hasMap: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(fullAddress),
      areaServed: {
        '@type': 'City',
        name: 'Santa Maria',
      },
      contactPoint: [
        {
          '@type': 'ContactPoint',
          contactType: 'customer support',
          telephone: company.phone || '(55) 3317-0762',
          email: company.email || 'tech10.infor@gmail.com',
          areaServed: 'BR',
        },
        whatsappDigits
          ? {
              '@type': 'ContactPoint',
              contactType: 'WhatsApp',
              telephone: `+${whatsappDigits}`,
              areaServed: 'BR',
            }
          : null,
      ].filter(Boolean),
    };
  }

  function buildBreadcrumbSchema(page) {
    const items = [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Início',
        item: absoluteUrl('/'),
      },
    ];

    if (page.canonical !== '/') {
      items.push({
        '@type': 'ListItem',
        position: 2,
        name: page.breadcrumb,
        item: absoluteUrl(page.canonical),
      });
    }

    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items,
    };
  }

  function buildServiceSchema(page) {
    if (page.kind !== 'service') return null;

    return {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: page.serviceType,
      serviceType: page.serviceType,
      areaServed: {
        '@type': 'City',
        name: 'Santa Maria',
      },
      provider: {
        '@type': 'ComputerStore',
        name: company.name || 'Tech10 Informática e Tecnologia',
        url: siteUrl,
        telephone: company.phone || '(55) 3317-0762',
      },
      offers: {
        '@type': 'Offer',
        availability: 'https://schema.org/InStock',
        url: absoluteUrl(page.canonical),
      },
      description: page.description,
    };
  }

  function buildFaqSchema() {
    const faqEntries = parseFaqEntries();
    if (!faqEntries.length) return null;

    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqEntries.map((entry) => ({
        '@type': 'Question',
        name: entry.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: entry.answer,
        },
      })),
    };
  }

  const page = findPageDefinition(path);
  const canonicalUrl = absoluteUrl(page.canonical);
  const imageUrl = absoluteUrl(seo.defaultOgImage || fallbackImage);

  document.title = page.title;
  upsertMeta('meta[name="description"]', { name: 'description' }, page.description);
  upsertMeta('meta[name="keywords"]', { name: 'keywords' }, page.keywords);
  upsertMeta('meta[property="og:title"]', { property: 'og:title' }, page.title);
  upsertMeta('meta[property="og:description"]', { property: 'og:description' }, page.description);
  upsertMeta('meta[property="og:url"]', { property: 'og:url' }, canonicalUrl);
  upsertMeta('meta[property="og:type"]', { property: 'og:type' }, page.kind === 'website' ? 'website' : 'article');
  upsertMeta('meta[property="og:image"]', { property: 'og:image' }, imageUrl);
  upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card' }, 'summary_large_image');
  upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title' }, page.title);
  upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description' }, page.description);
  upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image' }, imageUrl);
  upsertMeta('meta[name="robots"]', { name: 'robots' }, page.noindex ? 'noindex,follow' : 'index,follow');
  upsertLink('link[rel="canonical"]', 'canonical', canonicalUrl);

  upsertJsonLd('tech10-organization-schema', buildOrganizationSchema());
  upsertJsonLd('tech10-localbusiness-schema', buildLocalBusinessSchema());
  upsertJsonLd('tech10-breadcrumb-schema', buildBreadcrumbSchema(page));
  upsertJsonLd('tech10-service-schema', buildServiceSchema(page));
  upsertJsonLd('tech10-faq-schema', buildFaqSchema());
})(typeof window !== 'undefined' ? window : this);
