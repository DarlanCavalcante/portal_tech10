// Configurações da Empresa - Tech10 Informática
const empresaConfig = {
    // INFORMAÇÕES BÁSICAS
    nome: "Tech10 Informática", // Nome da empresa
    slogan: "20 Anos de Experiência em Tecnologia", // Slogan da empresa
    descricao: "Especialistas em equipamentos Apple, Samsung e desenvolvimento Full Stack há 20 anos.", // Descrição breve
    
    // CONTATO
    telefone: "(55) 3317-0762", // Telefone fixo
    whatsapp: "55974001960", // WhatsApp (formato: 55 + DDD + número)
    email: "tech10.infor@gmail.com", // Email da empresa
    
    // ENDEREÇO
    endereco: {
        rua: "Rua Doutor Bozano, 968 - Loja 8", // Endereço da loja
        bairro: "Centro", // Assumindo centro (pode ajustar se necessário)
        cidade: "Santa Maria", // Assumindo Santa Maria pelo DDD 55
        estado: "RS", // Rio Grande do Sul
        cep: "97015-001" // CEP estimado (pode ajustar)
    },
    
    // HORÁRIOS
    horarios: {
        semana: "Segunda a Sexta: 9h às 18h", // Horário informado
        sabado: "Sábado: Fechado", // Não informado, assumindo fechado
        domingo: "Domingo: Fechado" // Fechado aos domingos
    },
    
    // REDES SOCIAIS
    social: {
        facebook: "https://www.facebook.com/share/19wtZjc61F/", // Facebook da Tech10
        instagram: "https://www.instagram.com/tech10info/", // Instagram da Tech10
        twitter: "", // Não informado
        whatsappLink: "https://wa.me/55974001960", // Link do WhatsApp
        tiktok: "", // Não informado
        youtube: "" // Não informado
    },
    
    // ESTATÍSTICAS (para seção "Sobre")
    stats: {
        anosExperiencia: "20+", // 20 anos de experiência
        clientesSatisfeitos: "1000+", // Mais de 1000 clientes
        produtosDisponiveis: "500+" // Produtos disponíveis (estimativa)
    },
    
    // SOBRE A EMPRESA
    sobre: {
        historia: "Com 20 anos de sólida experiência no mercado de tecnologia, a Tech10 Informática é especializada em desenvolvimento Full Stack e assistência técnica especializada em equipamentos Apple, Samsung e demais marcas renomadas do mercado.", // História da empresa
        missao: "Nossa missão é oferecer soluções tecnológicas inovadoras e serviços especializados com excelência, combinando nossa vasta experiência em desenvolvimento Full Stack com assistência técnica de qualidade para equipamentos das principais marcas do mercado." // Missão da empresa
    },
    
    // SEO
    seo: {
        titulo: "Tech10 Informática - 20 Anos de Experiência em Tecnologia", // Título da página
        descricao: "Tech10 Informática em Santa Maria/RS. Especialistas em Apple, Samsung e desenvolvimento Full Stack há 20 anos. Assistência técnica e vendas com qualidade garantida!" // Descrição para SEO
    }
};

// Função para aplicar as configurações automaticamente
function aplicarConfiguracoes() {
    // Atualizar título da página
    document.title = empresaConfig.seo.titulo;
    
    // Atualizar meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.name = 'description';
        document.head.appendChild(metaDesc);
    }
    metaDesc.content = empresaConfig.seo.descricao;
    
    // Atualizar logo/nome da empresa
    const logos = document.querySelectorAll('.logo span');
    logos.forEach(logo => {
        logo.textContent = empresaConfig.nome;
    });
    
    // Atualizar hero title e subtitle
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) heroTitle.textContent = empresaConfig.slogan;
    
    // Atualizar informações de contato
    const telefoneElements = document.querySelectorAll('[data-info="telefone"]');
    telefoneElements.forEach(el => el.textContent = empresaConfig.telefone);
    
    const emailElements = document.querySelectorAll('[data-info="email"]');
    emailElements.forEach(el => el.textContent = empresaConfig.email);
    
    // Atualizar endereço
    const enderecoElements = document.querySelectorAll('[data-info="endereco"]');
    enderecoElements.forEach(el => {
        el.innerHTML = `${empresaConfig.endereco.rua}<br>${empresaConfig.endereco.bairro}, ${empresaConfig.endereco.cidade} - ${empresaConfig.endereco.estado}`;
    });
    
    // Atualizar horários
    const horariosElements = document.querySelectorAll('[data-info="horarios"]');
    horariosElements.forEach(el => {
        el.innerHTML = `${empresaConfig.horarios.semana}<br>${empresaConfig.horarios.sabado}`;
    });
    
    // Atualizar horários individuais
    const horariosSemanElement = document.querySelector('[data-info="horarios-semana"]');
    if (horariosSemanElement) horariosSemanElement.textContent = empresaConfig.horarios.semana;
    
    const horariosSabadoElement = document.querySelector('[data-info="horarios-sabado"]');
    if (horariosSabadoElement) horariosSabadoElement.textContent = empresaConfig.horarios.sabado;
    
    const horariosDomingoElement = document.querySelector('[data-info="horarios-domingo"]');
    if (horariosDomingoElement) horariosDomingoElement.textContent = empresaConfig.horarios.domingo;
    
    // Atualizar nome da empresa em todos os lugares
    const nomeElements = document.querySelectorAll('[data-info="nome"]');
    nomeElements.forEach(el => el.textContent = empresaConfig.nome);
    
    // Atualizar links das redes sociais
    const facebookLink = document.querySelector('[data-social="facebook"]');
    if (facebookLink && empresaConfig.social.facebook) {
        facebookLink.href = empresaConfig.social.facebook;
    }
    
    const instagramLink = document.querySelector('[data-social="instagram"]');
    if (instagramLink && empresaConfig.social.instagram) {
        instagramLink.href = empresaConfig.social.instagram;
    }
    
    const twitterLink = document.querySelector('[data-social="twitter"]');
    if (twitterLink && empresaConfig.social.twitter) {
        twitterLink.href = empresaConfig.social.twitter;
    }
    
    const whatsappLink = document.querySelector('[data-social="whatsapp"]');
    if (whatsappLink && empresaConfig.social.whatsappLink) {
        whatsappLink.href = empresaConfig.social.whatsappLink;
    }
    
    // Atualizar estatísticas na seção "Sobre"
    const statsElements = document.querySelectorAll('[data-stat]');
    statsElements.forEach(el => {
        const stat = el.dataset.stat;
        if (empresaConfig.stats[stat]) {
            el.textContent = empresaConfig.stats[stat];
        }
    });
    
    // Atualizar textos da seção "Sobre"
    const sobreHistoria = document.querySelector('[data-sobre="historia"]');
    if (sobreHistoria) sobreHistoria.textContent = empresaConfig.sobre.historia;
    
    const sobreMissao = document.querySelector('[data-sobre="missao"]');
    if (sobreMissao) sobreMissao.textContent = empresaConfig.sobre.missao;
    
    // Atualizar descrição no footer
    const footerDesc = document.querySelector('[data-info="descricao"]');
    if (footerDesc) footerDesc.textContent = empresaConfig.descricao;
    
    // Configurar link do Google Maps
    const comoChegar = document.getElementById('comoChegar');
    if (comoChegar) {
        const enderecoCompleto = `${empresaConfig.endereco.rua}, ${empresaConfig.endereco.bairro}, ${empresaConfig.endereco.cidade} - ${empresaConfig.endereco.estado}`;
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(enderecoCompleto)}`;
        comoChegar.href = mapsUrl;
    }
    
    // Configurar mini mapa
    const miniMap = document.getElementById('miniMap');
    if (miniMap) {
        const enderecoCompleto = `${empresaConfig.endereco.rua}, ${empresaConfig.endereco.bairro}, ${empresaConfig.endereco.cidade} - ${empresaConfig.endereco.estado}`;
        // URL simples que sempre funciona para embed do Google Maps
        const embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(enderecoCompleto)}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
        
        miniMap.src = embedUrl;
    }
    
    // Configurar links do WhatsApp
    const mensagemPadrao = `Olá! Vim pelo site da ${empresaConfig.nome}. Gostaria de mais informações.`;
    const whatsappUrl = `https://wa.me/${empresaConfig.whatsapp}?text=${encodeURIComponent(mensagemPadrao)}`;
    
    // Botão flutuante do WhatsApp
    const whatsappFloat = document.getElementById('whatsappFloat');
    if (whatsappFloat) {
        whatsappFloat.href = whatsappUrl;
    }
    
    // Botão do WhatsApp na seção de contato
    const whatsappContato = document.getElementById('whatsappContato');
    if (whatsappContato) {
        whatsappContato.href = whatsappUrl;
    }
}

// Aplicar configurações quando a página carregar
document.addEventListener('DOMContentLoaded', aplicarConfiguracoes);