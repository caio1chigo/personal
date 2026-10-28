const burger = document.querySelector('.burger');
const nav = document.querySelector('#navigation');

function closeMenu() {
  nav.classList.remove('open');
  burger.setAttribute('aria-expanded', 'false');
  burger.setAttribute('aria-label', 'Abrir menu');
}

burger.addEventListener('click', () => {
  const open = burger.getAttribute('aria-expanded') !== 'true';
  nav.classList.toggle('open', open);
  burger.setAttribute('aria-expanded', String(open));
  burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
});
nav.addEventListener('click', (event) => {
  if (event.target.closest('a')) closeMenu();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && nav.classList.contains('open')) {
    closeMenu();
    burger.focus();
  }
});
document.addEventListener('click', (event) => {
  if (!event.target.closest('header') && nav.classList.contains('open')) closeMenu();
});
window.addEventListener('resize', () => {
  if (window.innerWidth > 760) closeMenu();
});

// O contato real deve substituir este comportamento antes de publicar para um cliente.
document.querySelector('.demo-contact').addEventListener('click', () => {
  document.querySelector('#contact-status').textContent =
    'Este é um projeto demonstrativo. O agendamento ainda não está disponível.';
});

// Fundo escuro como fallback, sem ícone de imagem quebrada na chamada final.
const finalImage = document.querySelector('.final-img');
function hideUnavailableImage() {
  finalImage.closest('.final-media').classList.add('image-unavailable');
}
finalImage.addEventListener('error', hideUnavailableImage);
if (finalImage.complete && finalImage.naturalWidth === 0) hideUnavailableImage();
/* Carregar com defer, depois de script.js. Não substitui o JS do menu. */
(() => {
  if (document.documentElement.dataset.fitoraMotion) return;
  document.documentElement.dataset.fitoraMotion = 'ready';
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (preference.matches) return;

  let loader;
  let done = false;
  let observer;
  let finishTimer;
  let maxTimer;
  const start = performance.now();
  const reveals = [];

  function showEverything() {
    if (observer) observer.disconnect();
    reveals.forEach(el => el.classList.add('is-visible'));
  }
  function setupReveal() {
    if (!('IntersectionObserver' in window)) return;
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0, rootMargin: '0px 0px -24px 0px' });

    // Não anima containers de fundos, fotos absolutas ou seções inteiras.
    const selectors = [
      '.hero-copy > .eyebrow', '.hero h1',
      '.hero-copy > p:not(.eyebrow)', '.hero-copy > .button',
      '.pillars', '.hero-note', '.coach-copy', '.coach-quote',
      '.section-heading', '.journey-grid > article',
      '.programs > .center', '.program-card',
      '.plans-wrap > .center', '.price-card', '.investment > div',
      '.values-grid > div', '.values-grid > .handwritten',
      '.feedback > .eyebrow', '.feedback > h2', '.feedback-intro',
      '.feedback-grid > article', '.feedback > .text-link', '.faq',
      '.final-copy', '.final-note', '.footer-grid > div'
    ];
    const groupDelays = [
      '.journey-grid', '.program-grid', '.price-grid',
      '.values-grid', '.feedback-grid', '.footer-grid'
    ];
    groupDelays.forEach(selector => {
      const group = document.querySelector(selector);
      if (group) [...group.children].forEach((el, index) => {
        el.style.setProperty('--reveal-delay', `${Math.min(index * 70, 210)}ms`);
      });
    });
    [...new Set(document.querySelectorAll(selectors.join(',')))].forEach(el => {
      reveals.push(el);
      el.classList.add('fitora-reveal');
      observer.observe(el);
    });
  }
  function finish() {
    if (done) return;
    done = true;
    clearTimeout(finishTimer);
    clearTimeout(maxTimer);
    try { setupReveal(); } catch (error) { showEverything(); }
    if (loader) {
      loader.classList.add('is-finished');
      setTimeout(() => loader.remove(), 500);
    }
  }
  try {
    loader = document.createElement('div');
    loader.className = 'fitora-loader';
    loader.setAttribute('aria-hidden', 'true');
    loader.innerHTML = `
      <div class="fitora-loader__content">
        <div class="fitora-loader__mark">✳</div>
        <div class="fitora-loader__brand">Fitora</div>
        <div class="fitora-loader__caption">FIT MIND · FIT LIFE</div>
        <div class="fitora-loader__line"></div>
      </div>`;
    document.body.append(loader);
    // O loading espera apenas o hero e as fontes, não todas as fotos lazy.
    const hero = document.querySelector('.hero-img');
    const heroReady = new Promise(resolve => {
      if (!hero || hero.complete) resolve();
      else {
        hero.addEventListener('load', resolve, { once: true });
        hero.addEventListener('error', resolve, { once: true });
      }
    });
    const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
    Promise.all([heroReady, fontsReady]).then(() => {
      finishTimer = setTimeout(finish, Math.max(0, 550 - (performance.now() - start)));
    }).catch(finish);
    maxTimer = setTimeout(finish, 2500);
  } catch (error) { finish(); }

  // Navegação por teclado não fica escondida por efeitos decorativos.
  document.addEventListener('keydown', event => {
    if (event.key === 'Tab' && !done) finish();
  }, true);
  document.addEventListener('focusin', event => {
    if (!done) finish();
    const parent = event.target.closest('.fitora-reveal');
    if (parent) {
      parent.classList.add('is-visible');
      if (observer) observer.unobserve(parent);
    }
  });
  // Ir para uma âncora torna o conteúdo do destino visível imediatamente.
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    const id = link.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (!target) return;
    if (!done) finish();
    target.querySelectorAll('.fitora-reveal').forEach(el => {
      el.classList.add('is-visible');
      if (observer) observer.unobserve(el);
    });
  });
  const onMotionChange = event => {
    if (!event.matches) return;
    finish();
    showEverything();
  };
  if (preference.addEventListener) preference.addEventListener('change', onMotionChange);
})();