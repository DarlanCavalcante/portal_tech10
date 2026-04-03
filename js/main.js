/* =====================================================
   TECH10 — Animations & Interactions
   GSAP + ScrollTrigger + Particles + Custom Cursor
   ===================================================== */

document.addEventListener('DOMContentLoaded', () => {
  gsap.registerPlugin(ScrollTrigger);

  // =================== LOADER ===================
  const loader = document.getElementById('loader');
  const loaderPill = document.querySelector('.loader-toggle-pill');

  const isStoreOpen = updateStoreStatus();

  // Força o pill do loader a começar vermelho (fechado)
  if (loaderPill) {
    loaderPill.classList.remove('open');
    loaderPill.classList.add('closed');
    
    // Após 800ms, transiciona para verde SOMENTE SE a loja estiver aberta
    setTimeout(() => {
      if (isStoreOpen) {
        loaderPill.classList.remove('closed');
        loaderPill.classList.add('open');
      }
    }, 800);
  }

  // Esconde o loader quando terminar a transição (2.2s)
  setTimeout(() => {
    loader.classList.add('hidden');
    initAnimations();
  }, 2200);

  // Update every 30 seconds
  setInterval(updateStoreStatus, 30000);

  // =================== STORE STATUS TOGGLE ===================
  function updateStoreStatus() {
    const now = new Date();
    const day = now.getDay(); // 0=Dom, 1=Seg, ..., 6=Sáb
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentMinutes = hours * 60 + minutes;

    // Horários: Seg-Sex 9h-18h, Sáb 9h-13h
    let isOpen = false;
    let statusText = '';
    let timeInfo = '';

    if (day >= 1 && day <= 5) {
      // Segunda a Sexta
      if (currentMinutes >= 540 && currentMinutes < 1080) { // 9:00 - 18:00
        isOpen = true;
        statusText = 'Aberto Agora';
        const remaining = 1080 - currentMinutes;
        const rH = Math.floor(remaining / 60);
        const rM = remaining % 60;
        timeInfo = `Fecha em ${rH}h${rM > 0 ? rM + 'min' : ''}`;
      } else {
        statusText = 'Fechado';
        if (currentMinutes < 540) {
          const until = 540 - currentMinutes;
          const uH = Math.floor(until / 60);
          const uM = until % 60;
          timeInfo = `Abre em ${uH}h${uM > 0 ? uM + 'min' : ''}`;
        } else {
          if (day === 5) { // Sexta após 18h
            timeInfo = 'Abre Sáb às 9h';
          } else {
            timeInfo = 'Abre amanhã às 9h';
          }
        }
      }
    } else if (day === 6) {
      // Sábado
      if (currentMinutes >= 540 && currentMinutes < 780) { // 9:00 - 13:00
        isOpen = true;
        statusText = 'Aberto Agora';
        const remaining = 780 - currentMinutes;
        const rH = Math.floor(remaining / 60);
        const rM = remaining % 60;
        timeInfo = `Fecha em ${rH}h${rM > 0 ? rM + 'min' : ''}`;
      } else {
        statusText = 'Fechado';
        if (currentMinutes < 540) {
          timeInfo = 'Abre às 9h';
        } else {
          timeInfo = 'Abre Seg às 9h';
        }
      }
    } else {
      // Domingo
      statusText = 'Fechado';
      timeInfo = 'Abre Seg às 9h';
    }

    const state = isOpen ? 'open' : 'closed';

    // Update all toggle pills (exceto o loader, que tem a animação fixa Red -> Green)
    document.querySelectorAll('.toggle-pill, .ftoggle-pill').forEach(pill => {
      pill.classList.remove('open', 'closed');
      pill.classList.add(state);
    });

    // Update status badge
    const badge = document.getElementById('status-badge');
    if (badge) {
      badge.classList.remove('open', 'closed');
      badge.classList.add(state);
      const textEl = badge.querySelector('.status-text');
      const timeEl = badge.querySelector('.status-time');
      if (textEl) textEl.textContent = statusText;
      if (timeEl) timeEl.textContent = timeInfo;
    }
    
    return isOpen;
  }

  // =================== CUSTOM CURSOR ===================
  const cursor = document.getElementById('cursor');
  const follower = document.getElementById('cursor-follower');

  if (cursor && follower && window.innerWidth > 768) {
    let mouseX = 0, mouseY = 0, posX = 0, posY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursor.style.left = mouseX - 4 + 'px';
      cursor.style.top = mouseY - 4 + 'px';
    });

    function animateCursor() {
      posX += (mouseX - posX) * 0.12;
      posY += (mouseY - posY) * 0.12;
      follower.style.left = posX - 18 + 'px';
      follower.style.top = posY - 18 + 'px';
      requestAnimationFrame(animateCursor);
    }
    animateCursor();

    document.querySelectorAll('a, button, .service-card, .plan-card, .tip-card').forEach(el => {
      el.addEventListener('mouseenter', () => follower.classList.add('hover'));
      el.addEventListener('mouseleave', () => follower.classList.remove('hover'));
    });
  }

  // =================== PARTICLES ===================
  const canvas = document.getElementById('particles-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    const particleCount = 60;

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Particle {
      constructor() { this.reset(); }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.speedY = (Math.random() - 0.5) * 0.3;
        this.opacity = Math.random() * 0.4 + 0.1;
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    function drawLines() {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.06 * (1 - dist / 150)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    }

    function animateParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => { p.update(); p.draw(); });
      drawLines();
      requestAnimationFrame(animateParticles);
    }
    animateParticles();
  }

  // =================== NAVBAR ===================
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  });

  // Mobile toggle
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');
  if (navToggle) {
    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });
    navLinks.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => navLinks.classList.remove('open'));
    });
  }

  // Active nav link on scroll
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY + 200;
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      const link = document.querySelector(`.nav-link[href="#${id}"]`);
      if (link) {
        link.classList.toggle('active', scrollY >= top && scrollY < top + height);
      }
    });
  });

  // =================== INIT ANIMATIONS ===================
  function initAnimations() {
    // Fade-up animations
    gsap.utils.toArray('[data-animate="fade-up"]').forEach((el, i) => {
      gsap.from(el, {
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        y: 50,
        opacity: 0,
        duration: 0.8,
        delay: i * 0.05,
        ease: 'power3.out'
      });
    });

    // Fade-right
    gsap.utils.toArray('[data-animate="fade-right"]').forEach(el => {
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: 'top 80%' },
        x: -60, opacity: 0, duration: 1, ease: 'power3.out'
      });
    });

    // Fade-left
    gsap.utils.toArray('[data-animate="fade-left"]').forEach(el => {
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: 'top 80%' },
        x: 60, opacity: 0, duration: 1, ease: 'power3.out'
      });
    });

    // Counter animation
    document.querySelectorAll('.stat-number').forEach(el => {
      const target = parseInt(el.dataset.count);
      gsap.to(el, {
        scrollTrigger: { trigger: el, start: 'top 85%' },
        innerText: target,
        duration: 2,
        snap: { innerText: 1 },
        ease: 'power2.out'
      });
    });

    // =================== REPAIR ANIMATION ===================
    initRepairAnimation();
  }

  function initRepairAnimation() {
    const videoWrapper = document.getElementById('hero-video-wrapper');
    if (!videoWrapper) return;

    // Main timeline on load
    const tl = gsap.timeline({
      delay: 0.5
    });

    tl.fromTo(videoWrapper, 
      { scale: 0.9, opacity: 0, y: 40, filter: 'drop-shadow(0 0 0px rgba(255, 255, 255, 0))' },
      { duration: 1.5, scale: 1.0, opacity: 1, y: 0, filter: 'drop-shadow(0 0 30px rgba(255, 255, 255, 0.1))', ease: 'power3.out' }
    );

    // Flutuação contínua suave
    gsap.to(videoWrapper, {
      y: -10,
      duration: 4,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut',
      delay: 2.0
    });

    // =================== HERO VIDEO REEL ===================
    const reels = document.querySelectorAll('.hero-reel');
    if (reels.length <= 1) return;

    let currentReel = 0;
    const REEL_DURATION = 6000; // 6 segundos por vídeo

    function nextReel() {
      const prev = reels[currentReel];
      currentReel = (currentReel + 1) % reels.length;
      const next = reels[currentReel];

      // Pausa o anterior
      prev.classList.remove('active');
      prev.pause();

      // Inicia o próximo
      next.currentTime = 0;
      next.play();
      next.classList.add('active');
    }

    // Inicia o carrossel
    setInterval(nextReel, REEL_DURATION);
  }

  // =================== FORM HANDLING ===================
  const form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('form-name').value;
      const phone = document.getElementById('form-phone').value;
      const service = document.getElementById('form-service').value;
      const message = document.getElementById('form-message').value;

      const whatsappMsg = encodeURIComponent(
        `Olá Tech10! 👋\n\n` +
        `*Nome:* ${name}\n` +
        `*Telefone:* ${phone}\n` +
        `*Serviço:* ${service}\n` +
        `*Mensagem:* ${message}`
      );
      window.open(`https://wa.me/5555999990000?text=${whatsappMsg}`, '_blank');
    });
  }

  // =================== SMOOTH SCROLL ===================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // =================== WHATSAPP BTN ANIMATION ===================
  const wppBtn = document.getElementById('whatsapp-btn');
  if (wppBtn) {
    gsap.fromTo(wppBtn,
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.6, delay: 2.5, ease: 'back.out(1.7)' }
    );
  }

  // =================== MAGNETIC GLOW CARDS ===================
  const cards = document.querySelectorAll('.service-card, .plan-card, .tip-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });

  // =================== CAROUSEL DRAG E MODAL ===================
  const slider = document.getElementById('tipsCarousel');
  const modal = document.getElementById('imageModal');
  const modalImg = document.getElementById('modalImg');
  const captionText = document.getElementById('modalCaption');
  const closeModal = document.getElementById('closeModal');

  let isDown = false;
  let startX;
  let scrollLeft;
  let isDragging = false;

  if (slider) {
    slider.addEventListener('mousedown', (e) => {
      isDown = true;
      isDragging = false;
      slider.classList.add('active');
      startX = e.pageX - slider.offsetLeft;
      scrollLeft = slider.scrollLeft;
    });
    slider.addEventListener('mouseleave', () => {
      isDown = false;
      slider.classList.remove('active');
    });
    slider.addEventListener('mouseup', () => {
      isDown = false;
      slider.classList.remove('active');
    });
    slider.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - startX) * 2; 
      if (Math.abs(walk) > 5) isDragging = true;
      slider.scrollLeft = scrollLeft - walk;
    });

    // Abrir Modal de Imagem para Dicas e Galeria
    const tipImages = slider.querySelectorAll('.tip-image-wrapper img');
    const galleryImages = document.querySelectorAll('.gallery-img');
    
    const triggerModal = (img, skipDraggingCheck = false) => {
      img.style.cursor = 'pointer';
      img.addEventListener('click', (e) => {
        if (!skipDraggingCheck && isDragging) {
           e.preventDefault();
           return;
        }
        if(modal) {
          modal.classList.add('show');
          modalImg.src = img.src;
          captionText.innerHTML = img.alt;
        }
      });
    };

    tipImages.forEach(img => triggerModal(img, false));
    galleryImages.forEach(img => triggerModal(img, true));
  }

  // Fechar Modal
  if (closeModal) {
    closeModal.onclick = function() {
      modal.classList.remove('show');
    }
  }
  if (modal) {
    modal.addEventListener('click', (e) => {
      // Se clicar fora da imagem, fecha o modal
      if (e.target === modal || e.target === captionText) {
        modal.classList.remove('show');
      }
    });
  }

  // =================== PARALLAX PHOTO (ESPECIALISTA) ===================
  const parallaxContainer = document.getElementById('parallax-container');
  if (parallaxContainer) {
    parallaxContainer.addEventListener('mousemove', (e) => {
      const rect = parallaxContainer.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2; // -1 to 1
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2; // -1 to 1
      
      gsap.utils.toArray('.floating-item').forEach((item) => {
        const speed = item.getAttribute('data-speed');
        gsap.to(item, {
          x: x * 30 * speed,
          y: y * 30 * speed,
          rotation: x * 15 * speed,
          duration: 1,
          ease: 'power2.out'
        });
      });
      
      gsap.to('.about-slide.active', {
        x: x * 10,
        y: y * 10,
        rotationY: x * 5,
        rotationX: -y * 5,
        duration: 2,
        ease: 'power2.out'
      });
    });

    parallaxContainer.addEventListener('mouseleave', () => {
      gsap.to('.floating-item', { x: 0, y: 0, rotation: 0, duration: 1 });
      gsap.to('.about-slide.active', { x: 0, y: 0, rotationY: 0, rotationX: 0, duration: 1 });
    });

    // =================== ABOUT PHOTO REEL ===================
    const aboutSlides = document.querySelectorAll('.about-slide');
    if (aboutSlides.length > 1) {
      let currentAbout = 0;
      setInterval(() => {
        aboutSlides[currentAbout].classList.remove('active');
        currentAbout = (currentAbout + 1) % aboutSlides.length;
        aboutSlides[currentAbout].classList.add('active');
      }, 4000);
    }
  }

  // =================== FAQ ACCORDION ===================
  const faqItems = document.querySelectorAll('.faq-question');
  faqItems.forEach(item => {
    item.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      // Fechar todos
      faqItems.forEach(faq => {
        faq.classList.remove('active');
        if (faq.nextElementSibling) faq.nextElementSibling.style.maxHeight = null;
      });
      // Se não tava ativo, abre apenas esse
      if (!isActive) {
        item.classList.add('active');
        if (item.nextElementSibling) {
          item.nextElementSibling.style.maxHeight = item.nextElementSibling.scrollHeight + "px";
        }
      }
    });
  });

  // =================== BEFORE/AFTER SLIDER ===================
  const baSlider = document.getElementById('baSlider');
  if (baSlider) {
    const baBefore = document.getElementById('baBefore');
    const baHandle = document.getElementById('baHandle');

    let baIsDragging = false;

    const slide = (x) => {
      let width = baSlider.offsetWidth;
      let percent = Math.max(0, Math.min(x / width * 100, 100));
      baBefore.style.width = percent + "%";
      baHandle.style.left = percent + "%";
    };

    baSlider.addEventListener('mousedown', () => baIsDragging = true);
    window.addEventListener('mouseup', () => baIsDragging = false);
    window.addEventListener('mousemove', (e) => {
      if (!baIsDragging) return;
      const rect = baSlider.getBoundingClientRect();
      slide(e.clientX - rect.left);
    });

    // Mobile touch support
    baSlider.addEventListener('touchstart', () => baIsDragging = true, {passive: true});
    window.addEventListener('touchend', () => baIsDragging = false);
    window.addEventListener('touchmove', (e) => {
      if (!baIsDragging) return;
      const rect = baSlider.getBoundingClientRect();
      slide(e.touches[0].clientX - rect.left);
    }, {passive: true});
  }

});

