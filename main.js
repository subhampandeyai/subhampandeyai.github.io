/* ============================================================
   SUBHAM PANDEY — PORTFOLIO JAVASCRIPT
   • Animated canvas particle mesh
   • Custom cursor
   • Typewriter effect
   • Scroll reveal (IntersectionObserver)
   • Navbar scroll state
   • Hamburger menu
   ============================================================ */

// ─── Wait for DOM ───────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initCanvas();
  initCursor();
  initTypewriter();
  initScrollReveal();
  initNavbar();
  initHamburger();
});

// ─────────────────────────────────────────────────────────────
// 1. CANVAS — Animated particle mesh background
// ─────────────────────────────────────────────────────────────
function initCanvas() {
  const canvas  = document.getElementById('bgCanvas');
  const ctx     = canvas.getContext('2d');
  const ACCENT  = '0,255,135';
  const ACCENT2 = '0,201,255';

  let W, H, particles, mouse = { x: -999, y: -999 };

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() { this.reset(true); }
    reset(init) {
      this.x    = Math.random() * W;
      this.y    = init ? Math.random() * H : Math.random() < 0.5 ? -5 : H + 5;
      this.vx   = (Math.random() - 0.5) * 0.35;
      this.vy   = (Math.random() - 0.5) * 0.35;
      this.r    = Math.random() * 1.4 + 0.4;
      this.base = this.r;
      this.alpha= Math.random() * 0.5 + 0.2;
      this.hue  = Math.random() > 0.6 ? ACCENT2 : ACCENT;
    }
    update() {
      // Subtle mouse repulsion
      const dx   = this.x - mouse.x;
      const dy   = this.y - mouse.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < 120) {
        const force = (120 - dist) / 120;
        this.vx += (dx / dist) * force * 0.4;
        this.vy += (dy / dist) * force * 0.4;
      }
      // Dampen velocity
      this.vx *= 0.98;
      this.vy *= 0.98;
      this.x += this.vx;
      this.y += this.vy;
      // Wrap edges
      if (this.x < -10) this.x = W + 10;
      if (this.x > W+10) this.x = -10;
      if (this.y < -10) this.y = H + 10;
      if (this.y > H+10) this.y = -10;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.hue},${this.alpha})`;
      ctx.fill();
    }
  }

  function buildParticles() {
    const count = Math.floor((W * H) / 9000);
    particles = Array.from({ length: count }, () => new Particle());
  }

  function drawConnections() {
    const LINK_DIST = 110;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < LINK_DIST) {
          const alpha = (1 - dist / LINK_DIST) * 0.12;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(${ACCENT},${alpha})`;
          ctx.lineWidth   = 0.6;
          ctx.stroke();
        }
      }
    }
  }

  // Floating gradient orbs
  let orbTime = 0;
  function drawOrbs() {
    orbTime += 0.004;
    const orbs = [
      { x: W*0.18 + Math.sin(orbTime*0.7)*W*0.06, y: H*0.35 + Math.cos(orbTime*0.5)*H*0.07, r: W*0.18, c: ACCENT,  a: 0.04 },
      { x: W*0.82 + Math.cos(orbTime*0.6)*W*0.05, y: H*0.25 + Math.sin(orbTime*0.8)*H*0.06, r: W*0.16, c: ACCENT2, a: 0.035 },
      { x: W*0.55 + Math.sin(orbTime*0.4)*W*0.04, y: H*0.75 + Math.cos(orbTime*0.7)*H*0.04, r: W*0.14, c: ACCENT,  a: 0.025 },
    ];
    orbs.forEach(o => {
      const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
      g.addColorStop(0,   `rgba(${o.c},${o.a})`);
      g.addColorStop(1,   `rgba(${o.c},0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(o.x, o.y, o.r, 0, Math.PI*2);
      ctx.fill();
    });
  }

  function frame() {
    ctx.clearRect(0, 0, W, H);
    drawOrbs();
    drawConnections();
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(frame);
  }

  window.addEventListener('resize', () => { resize(); buildParticles(); });
  window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });

  resize();
  buildParticles();
  frame();
}

// ─────────────────────────────────────────────────────────────
// 2. CUSTOM CURSOR
// ─────────────────────────────────────────────────────────────
function initCursor() {
  const dot  = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (!dot || !ring) return;

  let rx = 0, ry = 0;
  let cx = 0, cy = 0;

  document.addEventListener('mousemove', e => {
    cx = e.clientX; cy = e.clientY;
    dot.style.left  = cx + 'px';
    dot.style.top   = cy + 'px';
  });

  function lerpRing() {
    rx += (cx - rx) * 0.12;
    ry += (cy - ry) * 0.12;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(lerpRing);
  }
  lerpRing();

  // Hover effect on interactive elements
  const targets = 'a, button, .project-card, .exp-card, .info-card, .cert-card, .pub-card, .skill-block';
  document.querySelectorAll(targets).forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hovered'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hovered'));
  });

  // Hide default cursor
  document.body.style.cursor = 'none';
}

// ─────────────────────────────────────────────────────────────
// 3. TYPEWRITER EFFECT
// ─────────────────────────────────────────────────────────────
function initTypewriter() {
  const el = document.getElementById('tw');
  if (!el) return;

  const phrases = [
    'intelligent AI systems.',
    'scalable deep learning.',
    'computer vision models.',
    'solar energy forecasts.',
    'the future with code.',
  ];

  let pi = 0, ci = 0, deleting = false;
  const SPEED_TYPE = 60, SPEED_DEL = 30, PAUSE = 1800;

  function tick() {
    const phrase = phrases[pi];
    if (!deleting) {
      el.textContent = phrase.slice(0, ++ci);
      if (ci === phrase.length) {
        deleting = true;
        setTimeout(tick, PAUSE);
        return;
      }
    } else {
      el.textContent = phrase.slice(0, --ci);
      if (ci === 0) {
        deleting = false;
        pi = (pi + 1) % phrases.length;
      }
    }
    setTimeout(tick, deleting ? SPEED_DEL : SPEED_TYPE);
  }
  setTimeout(tick, 1200);
}

// ─────────────────────────────────────────────────────────────
// 4. SCROLL REVEAL
// ─────────────────────────────────────────────────────────────
function initScrollReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger siblings in same parent
        const siblings = Array.from(entry.target.parentElement.querySelectorAll('.reveal:not(.visible)'));
        const idx = siblings.indexOf(entry.target);
        entry.target.style.transitionDelay = `${idx * 0.07}s`;
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

  els.forEach(el => observer.observe(el));
}

// ─────────────────────────────────────────────────────────────
// 5. NAVBAR — scroll state
// ─────────────────────────────────────────────────────────────
function initNavbar() {
  const nav = document.getElementById('navbar');
  if (!nav) return;
  const check = () => {
    if (window.scrollY > 30) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  };
  window.addEventListener('scroll', check, { passive: true });
  check();

  // Smooth close mobile menu on link click
  document.querySelectorAll('.mobile-menu a').forEach(a => {
    a.addEventListener('click', () => {
      document.getElementById('mobileMenu')?.classList.remove('open');
    });
  });
}

// ─────────────────────────────────────────────────────────────
// 6. HAMBURGER TOGGLE
// ─────────────────────────────────────────────────────────────
function initHamburger() {
  const btn  = document.getElementById('hamburger');
  const menu = document.getElementById('mobileMenu');
  if (!btn || !menu) return;
  btn.addEventListener('click', () => {
    menu.classList.toggle('open');
  });
}

// ─────────────────────────────────────────────────────────────
// 7. STAGGERED NAV LINKS on page load
// ─────────────────────────────────────────────────────────────
window.addEventListener('load', () => {
  document.querySelectorAll('.pill-link').forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(-8px)';
    el.style.transition = `opacity 0.4s ease ${0.3 + i*0.07}s, transform 0.4s ease ${0.3 + i*0.07}s`;
    requestAnimationFrame(() => {
      el.style.opacity   = '';
      el.style.transform = '';
    });
  });
});
