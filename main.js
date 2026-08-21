document.addEventListener('DOMContentLoaded', () => {
  initArcPreloader(revealHeroContent);
  initFaqAccordion();
  initCodeAnimation();
  initNavRouting();
  initNavScroll();
  initNavPill();
  initContactForm();
  initScrollDrivenAnimations();
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

  const GREETINGS = ['Automate.', 'Systemize.', 'Optimize.', 'Delegate.', 'Scale.', 'Accelerate.', 'Innovate.', 'A1.'];
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
    const word = GREETINGS[i];
    const isLast = i === GREETINGS.length - 1;

    if (isLast) {
      greetingEl.innerHTML = `<span style="color: #c4845a">${word}</span>`;
    } else {
      const text = word.slice(0, -1);
      const period = word.slice(-1);
      greetingEl.innerHTML = `<span style="color: var(--accent)">${text}</span><span style="color: #c4845a">${period}</span>`;
    }

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

/* ---------- FAQ accordion ---------- */

function initFaqAccordion() {
  const items = document.querySelectorAll('.faq-item');
  if (!items.length) return;

  items.forEach((item) => {
    const question = item.querySelector('.faq-question');
    if (!question) return;

    question.addEventListener('click', () => {
      const wasOpen = item.classList.contains('is-open');

      items.forEach((other) => {
        other.classList.remove('is-open');
        const otherIcon = other.querySelector('.faq-toggle-icon');
        if (otherIcon) otherIcon.textContent = '+';
      });

      if (!wasOpen) {
        item.classList.add('is-open');
        const icon = item.querySelector('.faq-toggle-icon');
        if (icon) icon.textContent = '−';
      }
    });
  });
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

/* ---------- Scroll-driven animation system ---------- */
/* Every animation below is a direct function of current scroll position,
   recomputed on every scroll (and resize) tick — nothing fires once and
   stops; everything responds to scrolling in both directions. */

function getScrollProgress(element, enterAt = 0.85, exitAt = 0.1) {
  const rect = element.getBoundingClientRect();
  const windowH = window.innerHeight;
  const enterProgress = Math.max(0, Math.min(1, (windowH * enterAt - rect.top) / (windowH * 0.4)));
  return enterProgress;
}

function initScrollDrivenAnimations() {
  const problemSection = document.getElementById('problem-section');
  const timeCard = problemSection ? problemSection.querySelector('.time-card') : null;
  const revenueCard = problemSection ? problemSection.querySelector('.revenue-card') : null;

  const offerSection = document.getElementById('offer-section');
  const offerTitleArea = offerSection ? offerSection.querySelector('.offer-title-area') : null;
  const offerCard = offerSection ? offerSection.querySelector('.offer-card') : null;

  const processSection = document.getElementById('process-section');
  const lineTrack = processSection ? processSection.querySelector('.process-line-track') : null;
  const lineFill = processSection ? processSection.querySelector('.process-line-fill') : null;
  const processSteps = processSection ? Array.from(processSection.querySelectorAll('.process-step')) : [];

  const approachRows = Array.from(document.querySelectorAll('.approach-row'));

  const fitSection = document.getElementById('fit-section');
  const faqSection = document.getElementById('faq-section');
  const finalCta = document.getElementById('final-cta');
  const faqItems = faqSection ? Array.from(faqSection.querySelectorAll('.faq-item')) : [];
  const finalCtaBtn = finalCta ? finalCta.querySelector('.final-cta-btn') : null;

  function positionProcessLine() {
    if (!processSection || !lineTrack || !lineFill) return;
    const firstIconBox = processSection.querySelector('.process-step-icon');
    if (!firstIconBox) return;
    const lineTop = firstIconBox.offsetTop + firstIconBox.offsetHeight / 2;
    lineTrack.style.top = lineTop + 'px';
    lineFill.style.top = lineTop + 'px';
  }

  function runProblemCards() {
    if (!problemSection || !timeCard || !revenueCard) return;

    const rect = problemSection.getBoundingClientRect();
    const sectionScrolled = -rect.top;
    const sectionHeight = problemSection.offsetHeight - window.innerHeight;
    const progress = Math.max(0, Math.min(1, sectionScrolled / Math.max(sectionHeight, 1)));

    // Phase 1 (0 → 0.4): cards slide in from the sides.
    const slideInProgress = Math.max(0, Math.min(1, progress / 0.4));
    const timeX = (1 - slideInProgress) * -100;
    const revenueX = (1 - slideInProgress) * 100;

    // Phase 2 (0.6 → 1.0): cards continue sliding out the far side.
    const slideOutProgress = Math.max(0, Math.min(1, (progress - 0.6) / 0.4));
    const timeXFinal = timeX - slideOutProgress * 100;
    const revenueXFinal = revenueX + slideOutProgress * 100;

    timeCard.style.transform = 'translateX(' + timeXFinal + 'vw)';
    revenueCard.style.transform = 'translateX(' + revenueXFinal + 'vw)';

    const opacity = progress < 0.4 ? slideInProgress : progress > 0.6 ? 1 - slideOutProgress : 1;
    timeCard.style.opacity = String(opacity);
    revenueCard.style.opacity = String(opacity);
  }

  function runOfferCard() {
    if (!offerSection || !offerTitleArea || !offerCard) return;

    const offerRect = offerSection.getBoundingClientRect();
    const offerScrolled = window.scrollY - offerSection.offsetTop;
    const offerHeight = offerSection.offsetHeight - window.innerHeight;
    const offerProgress = Math.max(0, Math.min(1, offerScrolled / Math.max(offerHeight, 1)));

    const rotateX = 20 - offerProgress * 20;

    const isMobile = window.innerWidth <= 768;
    const scaleStart = isMobile ? 0.7 : 1.05;
    const scaleEnd = isMobile ? 0.9 : 1.0;
    const scale = scaleStart + offerProgress * (scaleEnd - scaleStart);

    const titleTranslateY = offerProgress * -80;

    if (offerRect.bottom > 0 && offerRect.top < window.innerHeight * 1.2) {
      offerCard.style.transform = 'rotateX(' + rotateX + 'deg) scale(' + scale + ')';
      offerTitleArea.style.transform = 'translateY(' + titleTranslateY + 'px)';

      const fadeProgress = Math.max(0, Math.min(1, (window.innerHeight - offerRect.top) / (window.innerHeight * 0.5)));
      offerSection.style.opacity = String(fadeProgress);
    }

    if (offerRect.bottom < -100) {
      offerCard.style.transform = 'rotateX(0deg) scale(1)';
      offerTitleArea.style.transform = 'translateY(-80px)';
    }

    if (offerRect.top > window.innerHeight * 1.2) {
      offerCard.style.transform = 'rotateX(20deg) scale(1.05)';
      offerTitleArea.style.transform = 'translateY(0px)';
      offerSection.style.opacity = '0';
    }
  }

  function runProcessLine() {
    if (!processSection || !lineFill) return;

    const rect = processSection.getBoundingClientRect();
    const windowH = window.innerHeight;

    const drawProgress = Math.max(0, Math.min(1, (windowH * 0.85 - rect.top) / (windowH * 0.55)));
    lineFill.style.transform = 'scaleX(' + drawProgress + ')';

    if (drawProgress > 0.5) {
      lineFill.style.animationPlayState = 'running';
    } else {
      lineFill.style.animationPlayState = 'paused';
      lineFill.style.backgroundPosition = '100% 0';
    }

    processSteps.forEach((step, i) => {
      const stepRect = step.getBoundingClientRect();
      const enterAt = 0.85 - i * 0.05; // slight per-step cascade purely from scroll position
      const p = Math.max(0, Math.min(1, (windowH * enterAt - stepRect.top) / (windowH * 0.4)));
      step.style.opacity = String(p);
      step.style.transform = 'translateX(' + (1 - p) * -30 + 'px)';
    });
  }

  function runApproachRows() {
    const windowH = window.innerHeight;
    approachRows.forEach((row) => {
      const rect = row.getBoundingClientRect();
      if (rect.top < windowH * 0.85 && rect.bottom > 0) {
        row.classList.add('is-in');
      } else {
        row.classList.remove('is-in');
      }
    });
  }

  function runBottomSections() {
    [fitSection, faqSection, finalCta].forEach((section) => {
      if (!section) return;
      const progress = getScrollProgress(section);
      section.style.opacity = String(progress);
      section.style.transform = 'translateY(' + (1 - progress) * 40 + 'px)';
    });

    if (faqSection && faqItems.length) {
      const faqProgress = getScrollProgress(faqSection);
      faqItems.forEach((item, i) => {
        const itemVisible = faqProgress > i * 0.12;
        item.style.opacity = itemVisible ? '1' : '0';
        item.style.transform = itemVisible ? 'translateY(0)' : 'translateY(20px)';
      });
    }

    if (finalCta && finalCtaBtn) {
      const finalProgress = getScrollProgress(finalCta);
      finalCtaBtn.classList.toggle('is-pulsing', finalProgress > 0.8);
    }
  }

  function runAllScrollAnimations() {
    runProblemCards();
    runOfferCard();
    runProcessLine();
    runApproachRows();
    runBottomSections();
  }

  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        runAllScrollAnimations();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  window.addEventListener('resize', () => {
    positionProcessLine();
    runAllScrollAnimations();
  });

  positionProcessLine();
  runAllScrollAnimations();
}
