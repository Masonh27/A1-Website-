document.addEventListener('DOMContentLoaded', () => {
  initArcPreloader(revealHeroContent);
  initFaqAccordion();
  initCodeAnimation();
  initNavRouting();
  initNavScroll();
  initNavPill();
  initContactForm();
  initScrollDrivenAnimations();
  initOrbitCanvas();
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
  // --- Problem cards + Free Audit: one continuous sticky sequence ---
  const sequence = document.getElementById('problem-offer-sequence');
  const timeCard = sequence ? sequence.querySelector('.time-card') : null;
  const revenueCard = sequence ? sequence.querySelector('.revenue-card') : null;
  const offerLayer = sequence ? sequence.querySelector('.offer-layer') : null;
  const offerCard = sequence ? sequence.querySelector('.offer-card') : null;
  const offerTitleArea = sequence ? sequence.querySelector('.offer-title-area') : null;
  const sequenceHeader = sequence ? sequence.querySelector('.sequence-header') : null;

  // --- Process section: dotted connector line ---
  const processSection = document.getElementById('process-section');
  const stepsRow = processSection ? processSection.querySelector('.process-steps-row') : null;
  const connectorDots = processSection ? processSection.querySelector('.connector-dots') : null;
  const connectorPulse = processSection ? processSection.querySelector('.connector-pulse') : null;

  // --- Who This Is For: stays a standalone reveal, not part of any sequence ---
  const fitSection = document.getElementById('fit-section');

  // --- FAQ + Final CTA: slide sequence ---
  const faqCtaSequence = document.getElementById('faq-cta-sequence');
  const faqPanel = faqCtaSequence ? faqCtaSequence.querySelector('.faq-panel') : null;
  const ctaPanel = faqCtaSequence ? faqCtaSequence.querySelector('.cta-panel') : null;
  const faqItems = faqPanel ? Array.from(faqPanel.querySelectorAll('.faq-item')) : [];
  const finalCtaBtn = ctaPanel ? ctaPanel.querySelector('.final-cta-btn') : null;

  function positionConnector() {
    if (!processSection || !stepsRow) return;
    const allBoxes = stepsRow.querySelectorAll('.step-icon-box');
    if (!allBoxes.length) return;
    const svgContainer = processSection.querySelector('.process-connector');
    if (!svgContainer) return;

    // .process-step carries a `transform` (its scroll-driven entrance
    // offset), and a transformed ancestor becomes the offsetParent for
    // its descendants — which would make every icon box's offsetLeft
    // relative to its own step instead of the shared row. Neutralize
    // the transforms just long enough to measure true layout position.
    const steps = stepsRow.querySelectorAll('.process-step');
    const savedTransforms = Array.from(steps).map((step) => step.style.transform);
    steps.forEach((step) => { step.style.transform = 'none'; });

    const first = allBoxes[0];
    const last = allBoxes[allBoxes.length - 1];
    const iconCenter = first.offsetTop + first.offsetHeight / 2;
    const left = first.offsetLeft + first.offsetWidth / 2;
    const right = last.offsetLeft + last.offsetWidth / 2;

    steps.forEach((step, i) => { step.style.transform = savedTransforms[i]; });

    svgContainer.style.left = left + 'px';
    svgContainer.style.width = (right - left) + 'px';
    svgContainer.style.top = iconCenter + 'px';
    svgContainer.style.height = '2px';
  }

  function runProblemOfferSequence() {
    if (!sequence || !timeCard || !revenueCard || !offerLayer || !offerCard || !offerTitleArea || !sequenceHeader) return;

    const rect = sequence.getBoundingClientRect();
    const scrolled = -rect.top;
    const totalHeight = sequence.offsetHeight - window.innerHeight;
    const progress = Math.max(0, Math.min(1, scrolled / Math.max(totalHeight, 1)));

    // Phase 1 (0 → 0.25): cards slide IN from sides.
    const slideInP = Math.max(0, Math.min(1, progress / 0.25));
    // Phase 2 (0.25 → 0.5): cards HOLD, fully visible.
    // Phase 3 (0.5 → 0.75): cards slide OUT + offer rises up simultaneously.
    const slideOutP = Math.max(0, Math.min(1, (progress - 0.5) / 0.25));
    // Phase 4 (0.75 → 1.0): offer holds, fully visible.

    const timeX = (1 - slideInP) * -110 - slideOutP * 110;
    const revenueX = (1 - slideInP) * 110 + slideOutP * 110;
    const cardsOpacity = slideInP - slideOutP;

    timeCard.style.transform = 'translateX(' + timeX + 'vw)';
    timeCard.style.opacity = String(Math.max(0, cardsOpacity));
    revenueCard.style.transform = 'translateX(' + revenueX + 'vw)';
    revenueCard.style.opacity = String(Math.max(0, cardsOpacity));

    // Header fades out as the offer rises.
    sequenceHeader.style.opacity = String(Math.max(0, 1 - slideOutP * 2));

    // Offer layer: rises up from below, 3D tilt flattens.
    const offerRise = slideOutP;
    const offerY = (1 - offerRise) * 120;
    const offerRotateX = (1 - offerRise) * 18;
    const offerScale = 0.95 + offerRise * 0.05;
    const offerOpacity = slideOutP;

    offerTitleArea.style.transform = 'translateY(' + offerY * 0.6 + 'px)';
    offerTitleArea.style.opacity = String(offerOpacity);
    offerCard.style.transform = 'rotateX(' + offerRotateX + 'deg) translateY(' + offerY + 'px) scale(' + offerScale + ')';
    offerCard.style.opacity = String(offerOpacity);
    offerLayer.style.opacity = String(offerOpacity);
  }

  function runProcessLine() {
    if (!processSection || !stepsRow || !connectorDots || !connectorPulse) return;

    const rect = processSection.getBoundingClientRect();
    const windowH = window.innerHeight;

    // Draw progress: 0 when section enters, 1 when fully scrolled into view.
    const drawProgress = Math.max(0, Math.min(1, (windowH * 0.85 - rect.top) / (windowH * 0.55)));
    connectorDots.style.transform = 'scaleX(' + drawProgress + ')';

    if (drawProgress > 0.3) {
      connectorPulse.style.animationPlayState = 'running';
    } else {
      connectorPulse.style.animationPlayState = 'paused';
    }

    // Steps animate in left to right, based on draw progress.
    const steps = stepsRow.querySelectorAll('.process-step');
    steps.forEach((step, i) => {
      const stepThreshold = i / (steps.length - 1); // 0, 0.33, 0.66, 1
      const stepProgress = Math.max(0, Math.min(1, (drawProgress - stepThreshold * 0.5) / 0.3));
      step.style.opacity = String(stepProgress);
      step.style.transform = 'translateX(' + (1 - stepProgress) * -40 + 'px)'; // from the left
    });
  }

  function runFitSection() {
    if (!fitSection) return;
    const progress = getScrollProgress(fitSection);
    fitSection.style.opacity = String(progress);
    fitSection.style.transform = 'translateY(' + (1 - progress) * 40 + 'px)';
  }

  function runFaqCtaSequence() {
    if (!faqCtaSequence || !faqPanel || !ctaPanel) return;

    const rect = faqCtaSequence.getBoundingClientRect();
    const scrolled = -rect.top;
    const totalHeight = faqCtaSequence.offsetHeight - window.innerHeight;
    const progress = Math.max(0, Math.min(1, scrolled / Math.max(totalHeight, 1)));

    // Phase 1 (0 → 0.4): FAQ fades/slides in from below.
    const faqInP = Math.max(0, Math.min(1, progress / 0.4));
    // Phase 2 (0.5 → 1.0): CTA slides in from the right, FAQ slides out to the left.
    const ctaInP = Math.max(0, Math.min(1, (progress - 0.5) / 0.5));

    const faqX = -ctaInP * 100;
    const faqOpacity = faqInP * (1 - ctaInP);
    faqPanel.style.transform = 'translateX(' + faqX + 'vw) translateY(' + (1 - faqInP) * 40 + 'px)';
    faqPanel.style.opacity = String(Math.max(0, faqOpacity));

    const ctaX = (1 - ctaInP) * 100;
    ctaPanel.style.transform = 'translateX(' + ctaX + 'vw)';
    ctaPanel.style.opacity = String(ctaInP);

    if (faqItems.length) {
      faqItems.forEach((item, i) => {
        const itemVisible = faqInP > i * 0.12;
        item.style.opacity = itemVisible ? '1' : '0';
        item.style.transform = itemVisible ? 'translateY(0)' : 'translateY(20px)';
      });
    }

    if (finalCtaBtn) {
      finalCtaBtn.classList.toggle('is-pulsing', ctaInP > 0.8);
    }
  }

  function runAllScrollAnimations() {
    runProblemOfferSequence();
    runProcessLine();
    runFitSection();
    runFaqCtaSequence();
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
    positionConnector();
    runAllScrollAnimations();
  });

  positionConnector();
  runAllScrollAnimations();
}

/* ---------- Offer card orbiting glow ---------- */

function initOrbitCanvas() {
  const wrapper = document.querySelector('.offer-card-orbit-wrapper');
  if (!wrapper) return;
  const canvas = wrapper.querySelector('.orbit-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let angle = 0;
  const speed = 0.008; // radians per frame — slow and smooth

  function resizeCanvas() {
    canvas.width = wrapper.offsetWidth + 4;
    canvas.height = wrapper.offsetHeight + 4;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  function getPerimeterPoint(angle, w, h, r) {
    // Travels around a rounded rectangle perimeter
    const perimeter = 2 * (w + h) - 8 * r + 2 * Math.PI * r;
    const dist = ((angle % (2 * Math.PI)) / (2 * Math.PI)) * perimeter;

    // Top edge (left to right)
    const topLen = w - 2 * r;
    if (dist < topLen) return { x: r + dist, y: 0 };
    let d = dist - topLen;

    // Top-right corner
    const quarterCircle = Math.PI * r / 2;
    if (d < quarterCircle) {
      const a = -Math.PI / 2 + (d / r);
      return { x: w - r + Math.cos(a) * r, y: r + Math.sin(a) * r };
    }
    d -= quarterCircle;

    // Right edge (top to bottom)
    const rightLen = h - 2 * r;
    if (d < rightLen) return { x: w, y: r + d };
    d -= rightLen;

    // Bottom-right corner
    if (d < quarterCircle) {
      const a = (d / r);
      return { x: w - r + Math.cos(a) * r, y: h - r + Math.sin(a) * r };
    }
    d -= quarterCircle;

    // Bottom edge (right to left)
    const bottomLen = w - 2 * r;
    if (d < bottomLen) return { x: w - r - d, y: h };
    d -= bottomLen;

    // Bottom-left corner
    if (d < quarterCircle) {
      const a = Math.PI / 2 + (d / r);
      return { x: r + Math.cos(a) * r, y: h - r + Math.sin(a) * r };
    }
    d -= quarterCircle;

    // Left edge (bottom to top)
    const leftLen = h - 2 * r;
    if (d < leftLen) return { x: 0, y: h - r - d };
    d -= leftLen;

    // Top-left corner
    const a = Math.PI + (d / r);
    return { x: r + Math.cos(a) * r, y: r + Math.sin(a) * r };
  }

  function draw() {
    const w = canvas.width;
    const h = canvas.height;
    const r = 16; // border-radius of card

    ctx.clearRect(0, 0, w, h);

    // Get current dot position on perimeter
    const pos = getPerimeterPoint(angle, w, h, r);

    // Draw trailing glow (several dots behind the main dot, fading out)
    for (let i = 20; i >= 0; i--) {
      const trailAngle = angle - i * 0.018;
      const trailPos = getPerimeterPoint(trailAngle, w, h, r);
      const trailOpacity = (1 - i / 20) * 0.25;
      const trailRadius = 3 * (1 - i / 20);

      ctx.beginPath();
      ctx.arc(trailPos.x, trailPos.y, trailRadius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(196, 132, 90, ${trailOpacity})`;
      ctx.fill();
    }

    // Draw glow halo around main dot
    const gradient = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, 14);
    gradient.addColorStop(0, 'rgba(196, 132, 90, 0.6)');
    gradient.addColorStop(0.4, 'rgba(196, 132, 90, 0.2)');
    gradient.addColorStop(1, 'rgba(196, 132, 90, 0)');
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 14, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw main dot
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = '#c4845a';
    ctx.fill();

    angle += speed;
    requestAnimationFrame(draw);
  }

  draw();
}
