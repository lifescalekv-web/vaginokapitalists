/* ═══════════════════════════════════════════════════════
   ВАГИНОКАПИТАЛИСТЫ — Shared Script
   Custom cursor · 3D tilt · Stat counters · Particles
═══════════════════════════════════════════════════════ */

/* ── 1. CUSTOM GOLD CROWN CURSOR ── */
(function initCursor() {
  const cursor = document.createElement('div');
  cursor.id = 'custom-cursor';
  cursor.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" fill="none">
      <path d="M4 22h20l-2-12-5 5-3-8-3 8-5-5z" fill="#FFD700" opacity="0.95"/>
      <circle cx="4" cy="10" r="2.5" fill="#FFD700"/>
      <circle cx="14" cy="5" r="2.5" fill="#FFD700"/>
      <circle cx="24" cy="10" r="2.5" fill="#FFD700"/>
      <rect x="4" y="22" width="20" height="3" rx="1" fill="#B8860B"/>
    </svg>`;
  document.body.appendChild(cursor);

  let mx = -100, my = -100;
  let cx = -100, cy = -100;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
  });

  function animateCursor() {
    cx += (mx - cx) * 0.18;
    cy += (my - cy) * 0.18;
    cursor.style.left = cx + 'px';
    cursor.style.top  = cy + 'px';
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  document.addEventListener('mousedown', () => cursor.style.transform = 'translate(-50%,-50%) scale(0.8)');
  document.addEventListener('mouseup',   () => cursor.style.transform = 'translate(-50%,-50%) scale(1)');
})();

/* ── 2. NAVBAR HAMBURGER ── */
(function initHamburger() {
  const btn  = document.querySelector('.navbar-hamburger');
  const menu = document.querySelector('.mobile-menu');
  if (!btn || !menu) return;
  btn.addEventListener('click', () => {
    menu.classList.toggle('open');
  });
  menu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => menu.classList.remove('open'));
  });
})();

/* ── 3. 3D CARD TILT ── */
(function initCardTilt() {
  const MAX_TILT = 8;

  function applyTilt(card, e) {
    const rect = card.getBoundingClientRect();
    const cx   = rect.left + rect.width  / 2;
    const cy   = rect.top  + rect.height / 2;
    const dx   = (e.clientX - cx) / (rect.width  / 2);
    const dy   = (e.clientY - cy) / (rect.height / 2);
    const rotY =  dx * MAX_TILT;
    const rotX = -dy * MAX_TILT;
    card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(6px)`;
  }

  function resetTilt(card) {
    card.style.transform = '';
    card.style.transition = 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)';
    setTimeout(() => card.style.transition = '', 600);
  }

  function attachTilt() {
    document.querySelectorAll('.card, .member-card, .tier-member-card').forEach(card => {
      if (card.dataset.tiltBound) return;
      card.dataset.tiltBound = true;
      card.style.transition = 'transform 0.1s ease, box-shadow 0.4s ease';
      card.addEventListener('mousemove',  e => applyTilt(card, e));
      card.addEventListener('mouseleave', () => resetTilt(card));
    });
  }

  attachTilt();
  // Re-run after DOM mutations (for dynamically added cards)
  const obs = new MutationObserver(attachTilt);
  obs.observe(document.body, { childList: true, subtree: true });
})();

/* ── 4. STAT BAR COUNTER ANIMATION ── */
(function initStatBars() {
  const animated = new Set();

  function animateBar(bar) {
    if (animated.has(bar)) return;
    animated.add(bar);

    const target = parseFloat(bar.dataset.value) || 0;
    const fill   = bar.querySelector('.stat-fill');
    const valEl  = bar.closest('.stat-row')?.querySelector('.stat-value');
    const duration = 1600;
    const start    = performance.now();

    function tick(now) {
      const t = Math.min((now - start) / duration, 1);
      // easeOutExpo
      const ease = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      const cur  = ease * target;

      if (fill) fill.style.width = Math.min(cur, 115) + '%';
      if (valEl) valEl.textContent = Math.round(cur) + (bar.dataset.suffix || '');

      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) animateBar(entry.target);
    });
  }, { threshold: 0.3 });

  function observeBars() {
    document.querySelectorAll('.stat-bar-animated').forEach(bar => {
      if (!bar.dataset.observed) {
        bar.dataset.observed = true;
        io.observe(bar);
      }
    });
  }

  observeBars();
  document.addEventListener('DOMContentLoaded', observeBars);
})();

/* ── 5. PARTICLE SYSTEM (canvas) ── */
(function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, particles;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function Particle() {
    this.reset = function() {
      this.x  = Math.random() * W;
      this.y  = Math.random() * H;
      this.r  = Math.random() * 1.8 + 0.4;
      this.vx = (Math.random() - 0.5) * 0.25;
      this.vy = (Math.random() - 0.5) * 0.25 - 0.1;
      this.a  = Math.random() * 0.6 + 0.1;
      this.life = Math.random() * 300 + 200;
      this.age  = 0;
      const shade = Math.random();
      if      (shade < 0.6) this.color = '#FFD700';
      else if (shade < 0.85) this.color = '#B8860B';
      else                   this.color = '#f5d060';
    };
    this.reset();
    this.y = Math.random() * H; // scatter initial positions
  }

  function init() {
    resize();
    const count = Math.min(Math.floor((W * H) / 8000), 150);
    particles = Array.from({ length: count }, () => new Particle());
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      p.x  += p.vx;
      p.y  += p.vy;
      p.age++;
      const frac = p.age / p.life;
      const a    = p.a * (frac < 0.1 ? frac / 0.1 : frac > 0.8 ? (1 - frac) / 0.2 : 1);
      ctx.save();
      ctx.globalAlpha = Math.max(0, a);
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur  = 6;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      if (p.age > p.life || p.x < -10 || p.x > W + 10 || p.y < -10) p.reset();
    });
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => { resize(); });
  init();
  draw();
})();

/* ── 6. PARALLAX HERO ── */
(function initParallax() {
  const hero = document.querySelector('.parallax-hero');
  if (!hero) return;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    hero.style.transform = `translateY(${y * 0.35}px)`;
  }, { passive: true });
})();

/* ── 7. PAGE ENTRANCE ANIMATION ── */
(function initEntrance() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
})();

/* ── 8. SENYA REVEAL ── */
(function initSenyaReveal() {
  const el = document.getElementById('senya-dots');
  if (!el) return;
  setTimeout(() => {
    el.style.transition = 'opacity 2s ease';
    el.style.opacity = '1';
  }, 3000);
})();
