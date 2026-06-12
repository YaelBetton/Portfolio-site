/* ============================================================
   Script léger pour les pages projet (DA « Vol de nuit »)
   ============================================================ */
(function () {
  'use strict';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ============ Curseur custom ============ */
  const cursor = document.getElementById('cursor');
  const dot = document.getElementById('cursorDot');
  if (cursor && dot) {
    let cx = innerWidth / 2, cy = innerHeight / 2, tx = cx, ty = cy;
    addEventListener('mousemove', e => {
      tx = e.clientX; ty = e.clientY;
      dot.style.left = tx + 'px'; dot.style.top = ty + 'px';
    });
    (function loopCursor() {
      cx += (tx - cx) * 0.16; cy += (ty - cy) * 0.16;
      cursor.style.left = cx + 'px'; cursor.style.top = cy + 'px';
      requestAnimationFrame(loopCursor);
    })();
    document.querySelectorAll('a,button,[data-hover]').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('is-hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('is-hover'));
    });
  }

  /* ============ Bascule jour / nuit ============ */
  const themeBtn = document.getElementById('themeToggle');
  function syncThemeUI() {
    if (!themeBtn) return;
    const light = document.documentElement.classList.contains('light');
    const txt = themeBtn.querySelector('.tt-txt');
    if (txt) txt.textContent = light ? 'Nuit' : 'Jour';
    themeBtn.setAttribute('aria-pressed', light ? 'true' : 'false');
  }
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const light = !document.documentElement.classList.contains('light');
      document.documentElement.classList.toggle('light', light);
      try { localStorage.setItem('theme', light ? 'light' : 'dark'); } catch (e) { }
      syncThemeUI();
    });
    syncThemeUI();
  }

  /* ============ Nav + barre de progression ============ */
  const nav = document.getElementById('nav');
  const sp = document.getElementById('scrollProgress');
  addEventListener('scroll', () => {
    if (nav) nav.classList.toggle('is-scrolled', scrollY > 60);
    if (sp) {
      const h = document.documentElement.scrollHeight - innerHeight;
      sp.style.transform = 'scaleX(' + (h > 0 ? scrollY / h : 0) + ')';
    }
  }, { passive: true });

  /* ============ Reveal au scroll ============ */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  /* ============ Boutons magnétiques ============ */
  if (!reduceMotion && matchMedia('(pointer:fine)').matches) {
    document.querySelectorAll('[data-magnetic]').forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
        btn.style.transform = 'translate(' + (x * 0.25) + 'px,' + (y * 0.25) + 'px)';
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transition = 'transform .6s cubic-bezier(.16,1,.3,1)';
        btn.style.transform = 'translate(0,0)';
        setTimeout(() => btn.style.transition = '', 600);
      });
    });
  }
})();
