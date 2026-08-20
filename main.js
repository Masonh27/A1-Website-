document.addEventListener('DOMContentLoaded', () => {
  initArcPreloader(revealHeroContent);
  animateCounter();
  initIntegrationScroll();
  initCodeAnimation();
  initNavRouting();
  initNavScroll();
  initNavPill();
  initContactForm();
});

/* ---------- Arc preloader ---------- */

function cubicBezier(x1, y1, x2, y2) {
  const A = (a1, a2) => 1.0 - 3.0 * a2 + 3.0 * a1;
  const B = (a1, a2) => 3.0 * a2 - 6.0 * a1;
  const C = (a1) => 3.0 * a1;
  const calcBezier = (t, a1, a2) => ((A(a1, a2) * t + B(a1, a2)) * t + C(a1)) * t;
  const calcSlope = (t, a1, a2) => 3.0 * A(a1, a2) * t * t + 2.0 * B(a1, a2) * t + C(a1);

  function getTForX(x) {
    let t = x;
    for (let i = 0; i < 8; i++) {
      const slope = calcSlope(t, x1, x2);
      if (slope === 0) return t;
      t -= (calcBezier(t, x1, x2) - x) / slope;
    }
    return t;
  }

  return (x) => calcBezier(getTForX(x), y1, y2);
}

function initArcPreloader(onDone) {
  const el = document.getElementById('arc-preloader');
  const greetingEl = document.getElementById('arc-preloader-greeting');
  const pathEl = document.getElementById('arc-preloader-path');
  if (!el || !greetingEl || !pathEl) return;

  const GREETINGS = ['Quiet.', 'Sharp.', 'Calm.', 'Crafted.', 'Considered.', 'Composed.', 'Honest.', 'Ready.'];
  const HOLD = 420; // ms each word stays fully visible
  const EXIT = 240; // ms fade-out before the next word
  const REVEAL_DURATION = 1500; // ms curtain sweep
  const ease = cubicBezier(0.85, 0, 0.15, 1);

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function setPath(edge) {
    const control = edge + 25;
    pathEl.setAttribute('d', `M 0 ${edge} Q 50 ${control} 100 ${edge} L 100 110 L 0 110 Z`);
  }

  function finish() {
    el.setAttribute('data-done', 'true');
    document.documentElement.style.overflow = '';
    window.setTimeout(() => {
      el.hidden = true;
    }, 500);
    if (typeof onDone === 'function') {
      onDone();
    }
  }

  if (prefersReducedMotion) {
    setPath(-30);
    finish();
    return;
  }

  document.documentElement.style.overflow = 'hidden';
  setPath(110);

  function showWord(i) {
    greetingEl.textContent = GREETINGS[i];
    greetingEl.classList.remove('is-leaving');
    void greetingEl.offsetWidth; // force reflow so the transition re-triggers
    greetingEl.classList.add('is-visible');
  }

  function startReveal() {
    const start = performance.now();

    function tick(now) {
      const t = Math.min((now - start) / REVEAL_DURATION, 1);
      setPath(110 - ease(t) * 140);

      if (t < 1) {
        requestAnimationFrame(tick);
      } else {
        finish();
      }
    }

    requestAnimationFrame(tick);
  }

  function cycle(i) {
    showWord(i);
    const isLast = i >= GREETINGS.length - 1;
    const holdTime = isLast ? HOLD + 220 : HOLD;

    window.setTimeout(() => {
      greetingEl.classList.remove('is-visible');
      greetingEl.classList.add('is-leaving');

      if (isLast) {
        startReveal();
      } else {
        window.setTimeout(() => cycle(i + 1), EXIT);
      }
    }, holdTime);
  }

  cycle(0);
}

/* ---------- Hero content reveal ---------- */

function revealHeroContent() {
  const el = document.getElementById('hero-content');
  if (!el) return;

  window.setTimeout(() => {
    el.classList.add('is-visible');
  }, 100);
}

/* ---------- Integration scroll reveal ---------- */

function initIntegrationScroll() {
  const wrap = document.getElementById('integration-scroll-wrap');
  const headline = document.getElementById('integration-headline');
  const iconRow = document.getElementById('integration-icon-row');
  if (!wrap || !headline || !iconRow) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  const words = Array.from(headline.querySelectorAll('.scrub-word'));
  const icons = Array.from(iconRow.querySelectorAll('.integration-icon-item'));
  const wordCenter = (words.length - 1) / 2;
  const iconCenter = (icons.length - 1) / 2;

  function lerp(from, to, t) {
    return from + (to - from) * t;
  }

  function rangeProgress(t, start, end) {
    return Math.min(Math.max((t - start) / (end - start), 0), 1);
  }

  let ticking = false;

  function update() {
    ticking = false;

    const rect = wrap.getBoundingClientRect();
    const scrollableDistance = wrap.offsetHeight - window.innerHeight;
    const scrolled = -rect.top;
    const progress = scrollableDistance > 0
      ? Math.min(Math.max(scrolled / scrollableDistance, 0), 1)
      : 0;

    const wordT = rangeProgress(progress, 0, 0.5);
    words.forEach((word, i) => {
      const distance = i - wordCenter;
      const x = lerp(distance * 60, 0, wordT);
      const rotateX = lerp(distance * 15, 0, wordT);
      word.style.transform = `translateX(${x}px) rotateX(${rotateX}deg)`;
    });

    const iconT = rangeProgress(progress, 0.35, 0.85);
    icons.forEach((icon, i) => {
      const distance = i - iconCenter;
      const x = lerp(distance * 70, 0, iconT);
      const y = lerp(Math.abs(distance) * 40, 0, iconT);
      const scale = lerp(0.6, 1, iconT);
      icon.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
    });
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
}

/* ---------- Counter animation ---------- */

function animateCounter() {
  const el = document.getElementById('counter');
  if (!el) return;

  const target = parseInt(el.getAttribute('data-target'), 10) || 0;
  const duration = 2000;
  const start = performance.now();

  function tick(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 2); // ease-out
    const value = Math.round(eased * target);
    el.textContent = value;

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      el.textContent = target;
    }
  }

  requestAnimationFrame(tick);
}

/* ---------- About page: live code animation ---------- */

function initCodeAnimation() {
  const container = document.getElementById('code-lines');
  if (!container) return;

  const lines = [
    "await ai.analyze(lead.profile)",
    "if (score > 0.82) trigger('follow_up')",
    "crm.update({ status: 'qualified' })",
    "notify.send(rep, lead.summary)",
    "const response = await ghl.createContact(data)",
    "scheduler.book(slot, client.id)",
    "pipeline.move(deal, 'discovery_call')",
    "await voice.transcribe(recording.url)",
    "leads.filter(l => l.intent === 'high')",
    "automation.run('onboarding_sequence')",
  ];

  const MAX_LINES = 8;
  const activeLines = [];
  let index = 0;

  function typeLine(text) {
    const lineEl = document.createElement('div');
    lineEl.className = 'code-line';

    const textSpan = document.createElement('span');
    const cursorSpan = document.createElement('span');
    cursorSpan.className = 'code-cursor';
    cursorSpan.textContent = '█';

    lineEl.appendChild(textSpan);
    lineEl.appendChild(cursorSpan);
    container.appendChild(lineEl);
    activeLines.push(lineEl);

    while (activeLines.length > MAX_LINES) {
      const old = activeLines.shift();
      old.classList.add('fade-out');
      setTimeout(() => old.remove(), 400);
    }

    let charIndex = 0;
    const typeInterval = setInterval(() => {
      charIndex++;
      textSpan.textContent = text.slice(0, charIndex);
      if (charIndex >= text.length) {
        clearInterval(typeInterval);
        cursorSpan.remove();
      }
    }, 30);
  }

  function loop() {
    typeLine(lines[index % lines.length]);
    index++;
  }

  loop();
  setInterval(loop, 1200);
}

/* ---------- Page router (home / about / services) ---------- */

const PAGE_NAMES = ['home', 'about', 'services', 'contact'];

function showPage(name) {
  if (!PAGE_NAMES.includes(name)) {
    name = 'home';
  }

  document.querySelectorAll('.page').forEach((el) => {
    el.hidden = el.id !== 'page-' + name;
  });

  window.scrollTo(0, 0);

  if (name === 'about') {
    revealPage('page-about');
  }

  if (name === 'services') {
    revealPage('page-services');
  }

  if (name === 'contact') {
    revealPage('page-contact');
  }

  closeNavDropdown();
}

function revealPage(pageId) {
  const page = document.getElementById(pageId);
  if (!page) return;

  page.classList.remove('is-visible');
  void page.offsetWidth; // force reflow so the transition re-triggers

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      page.classList.add('is-visible');
    });
  });
}

function initNavRouting() {
  document.querySelectorAll('[data-page]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      showPage(el.getAttribute('data-page'));
    });
  });

  showPage('home');
}

/* ---------- Nav: shrinking pill on scroll ---------- */

function initNavScroll() {
  const THRESHOLD = 80;

  function update() {
    const scrolled = window.scrollY > THRESHOLD;
    document.body.classList.toggle('nav-scrolled', scrolled);
    if (!scrolled) {
      closeNavDropdown();
    }
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
}

function initNavPill() {
  const pill = document.getElementById('nav-pill');
  const dropdown = document.getElementById('nav-dropdown');
  if (!pill || !dropdown) return;

  pill.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('open');
  });

  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target) && !pill.contains(e.target)) {
      dropdown.classList.remove('open');
    }
  });
}

function closeNavDropdown() {
  const dropdown = document.getElementById('nav-dropdown');
  if (dropdown) {
    dropdown.classList.remove('open');
  }
}

/* ---------- Contact form ---------- */

function initContactForm() {
  const form = document.getElementById('contact-form');
  const success = document.getElementById('contact-success');
  if (!form || !success) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    form.hidden = true;
    success.hidden = false;
    success.classList.remove('is-visible');
    void success.offsetWidth; // force reflow so the transition re-triggers

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        success.classList.add('is-visible');
      });
    });
  });
}
