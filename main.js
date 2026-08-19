document.addEventListener('DOMContentLoaded', () => {
  runDecryptEffect();
  animateCounter();
  initCodeAnimation();
  initNavRouting();
  initNavScroll();
  initNavPill();
  initContactForm();
});

/* ---------- Decrypt / scramble headline ---------- */

function runDecryptEffect() {
  const el = document.getElementById('decrypt-headline');
  if (!el) return;

  const glyphs = '#%&@$?!*+=/{}[]<>~^';
  const text = el.getAttribute('data-text') || el.textContent;
  const chars = text.split('');

  const stagger = 80; // ms between each character locking in
  const jitterRange = 100; // +/- 100ms random spread
  const startDelay = 600; // ms before the first character can lock
  const speed = 65; // ms per glyph cycle while scrambling

  el.textContent = '';
  el.setAttribute('aria-label', text);

  const spans = [];
  let wordWrapper = document.createElement('span');
  wordWrapper.className = 'word';
  el.appendChild(wordWrapper);

  chars.forEach((ch) => {
    if (ch === String.fromCharCode(32)) {
      el.appendChild(document.createTextNode(String.fromCharCode(32)));
      wordWrapper = document.createElement('span');
      wordWrapper.className = 'word';
      el.appendChild(wordWrapper);
      spans.push(null);
      return;
    }

    const span = document.createElement('span');
    span.className = 'char';
    span.textContent = ch;
    wordWrapper.appendChild(span);
    spans.push(span);
  });

  chars.forEach((ch, i) => {
    const span = spans[i];

    if (!span) {
      return;
    }

    const jitter = Math.random() * jitterRange * 2 - jitterRange;
    const lockDelay = startDelay + Math.max(0, i * stagger + jitter);

    const scrambleInterval = setInterval(() => {
      span.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
    }, speed);

    setTimeout(() => {
      clearInterval(scrambleInterval);
      span.textContent = ch;
      span.classList.add('flash');

      setTimeout(() => {
        span.classList.remove('flash');
        span.classList.add('locked');
      }, 300);
    }, lockDelay);
  });
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
