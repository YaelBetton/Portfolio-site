(function () {
  'use strict';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ============ Préloader ============ */
  const name = 'YAËL BETTON';
  const nameEl = document.getElementById('preloaderName');
  [...name].forEach((ch, i) => {
    const s = document.createElement('span');
    s.textContent = ch === ' ' ? '\u00A0' : ch;
    s.style.animationDelay = (i * 0.045) + 's';
    nameEl.appendChild(s);
  });
  const preloader = document.getElementById('preloader');
  const fill = document.getElementById('preloaderFill');
  const alt = document.getElementById('preloaderAlt');
  const keyboardKeys = [...document.querySelectorAll('.typing-keyboard .key')];
  let lastKey = -1;
  let keyTimer = null;
  let fakeLoad = null;
  const preloaderDone = sessionStorage.getItem('preloaderDone') === 'true';

  function startKeyboardTyping() {
    if (reduceMotion || !keyboardKeys.length) return;
    keyTimer = setInterval(() => {
      let idx = Math.floor(Math.random() * keyboardKeys.length);
      if (keyboardKeys.length > 1) {
        while (idx === lastKey) idx = Math.floor(Math.random() * keyboardKeys.length);
      }
      if (lastKey >= 0) keyboardKeys[lastKey].classList.remove('is-active');
      keyboardKeys[idx].classList.add('is-active');
      lastKey = idx;
    }, 90);
  }

  function stopKeyboardTyping() {
    if (keyTimer) {
      clearInterval(keyTimer);
      keyTimer = null;
    }
    if (lastKey >= 0) keyboardKeys[lastKey].classList.remove('is-active');
  }

  startKeyboardTyping();
  let prog = 0;
  function finishPreloader() {
    preloader.classList.add('is-done');
    sessionStorage.setItem('preloaderDone', 'true');
    revealHeroTitle();
  }

  if (preloaderDone) {
    stopKeyboardTyping();
    finishPreloader();
  } else {
    fakeLoad = setInterval(() => {
      prog = Math.min(100, prog + Math.random() * 16);
      fill.style.transform = 'scaleX(' + (prog / 100) + ')';
      alt.textContent = 'Développement en cours — ' + Math.round(prog) + '%';
      if (prog >= 100) {
        clearInterval(fakeLoad);
        stopKeyboardTyping();
        setTimeout(finishPreloader, 350);
      }
    }, 120);
  }

  function revealHeroTitle() {
    document.querySelectorAll('.hero-title .line > span').forEach((sp, i) => {
      sp.style.transition = 'transform 1.1s cubic-bezier(.16,1,.3,1) ' + (i * 0.13) + 's';
      requestAnimationFrame(() => { sp.style.transform = 'translateY(0) rotate(0)'; });
    });
  }
  if (reduceMotion) {
    if (fakeLoad) clearInterval(fakeLoad);
    stopKeyboardTyping();
    document.getElementById('preloader').classList.add('is-done');
    document.querySelectorAll('.hero-title .line > span').forEach(sp => sp.style.transform = 'none');
  }

  /* ============ Hero marquee continu (sans reset) ============ */
  (function () {
    const marquee = document.querySelector('.hero-marquee');
    const track = marquee?.querySelector('.marquee-track');
    if (!marquee || !track || reduceMotion) return;

    let x = 0;
    let last = 0;
    const speed = 42; // px/s

    function step(ts) {
      if (!last) last = ts;
      const dt = (ts - last) / 1000;
      last = ts;
      x -= speed * dt;

      const first = track.firstElementChild;
      if (first) {
        const firstWidth = first.getBoundingClientRect().width;
        if (-x >= firstWidth) {
          x += firstWidth;
          track.appendChild(first);
        }
      }

      track.style.transform = 'translateX(' + x + 'px)';
      requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  })();

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
      window.dispatchEvent(new Event('themechange'));
    });
    syncThemeUI();
  }

  /* ============ Curseur custom ============ */
  const cursor = document.getElementById('cursor');
  const dot = document.getElementById('cursorDot');
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

  /* ============ Nav + progression ============ */
  const nav = document.getElementById('nav');
  const sp = document.getElementById('scrollProgress');
  addEventListener('scroll', () => {
    nav.classList.toggle('is-scrolled', scrollY > 60);
    const h = document.documentElement.scrollHeight - innerHeight;
    sp.style.transform = 'scaleX(' + (h > 0 ? scrollY / h : 0) + ')';
    const hud = document.getElementById('hudAlt');
    if (hud) hud.textContent = Math.round(120 + scrollY / 8) + ' M';
  }, { passive: true });

  /* ============ Reveal au scroll ============ */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.14 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  /* ============ Compteurs animés ============ */
  const ioCount = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target, target = +el.dataset.count, dur = 1400, t0 = performance.now();
      (function tick(t) {
        const p = Math.min(1, (t - t0) / dur), ease = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * ease);
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
      ioCount.unobserve(el);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('[data-count]').forEach(el => ioCount.observe(el));

  /* ============ Compétences : accordéon ============ */
  (function () {
    const rows = [...document.querySelectorAll('.sk-row')];
    if (!rows.length) return;
    rows.forEach(row => {
      row.querySelectorAll('.sk-item').forEach((it, i) => {
        it.style.setProperty('--d', (0.08 + i * 0.05) + 's');
      });
      const head = row.querySelector('.sk-head, .sk-head-premier');
      head.addEventListener('click', () => {
        const isOpen = row.classList.contains('open');
        rows.forEach(r => r.classList.remove('open'));
        if (!isOpen) row.classList.add('open');
      });
    });
    // première catégorie ouverte quand la section apparaît
    const ioSk = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          ioSk.disconnect();
        }
      });
    }, { threshold: 0.3 });
    ioSk.observe(rows[0]);
  })();

  /* ============ Galerie projets pilotée au scroll ============ */
  (function () {
    const gal = document.getElementById('gal');
    if (!gal) return;
    const pin = gal.querySelector('.gal-pin');
    const track = document.getElementById('galTrack');
    const prog = document.getElementById('galProg');
    const cur = document.getElementById('galCur');
    const tot = document.getElementById('galTot');
    const n = track.children.length;
    tot.textContent = String(n).padStart(2, '0');

    let free = false, maxX = 0, target = 0, current = 0;

    function layout() {
      free = reduceMotion || matchMedia('(max-width:880px), (pointer:coarse)').matches;
      gal.classList.toggle('gal-free', free);
      if (free) { gal.style.height = ''; track.style.transform = ''; return; }
      const cs = getComputedStyle(pin);
      const visible = pin.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      maxX = Math.max(0, track.scrollWidth - visible);
      gal.style.height = (innerHeight + maxX) + 'px';
    }

    function onScroll() {
      if (free || maxX <= 0) return;
      const r = gal.getBoundingClientRect();
      target = Math.max(0, Math.min(1, -r.top / maxX));
    }

    function setUI(p) {
      prog.style.transform = 'scaleX(' + p + ')';
      cur.textContent = String(Math.min(n, Math.round(p * (n - 1)) + 1)).padStart(2, '0');
    }

    (function loop() {
      if (free) {
        const m = track.scrollWidth - track.clientWidth;
        setUI(m > 0 ? track.scrollLeft / m : 0);
      } else {
        current += (target - current) * 0.085;
        if (Math.abs(target - current) < 0.0004) current = target;
        track.style.transform = 'translateX(' + (-current * maxX) + 'px)';
        setUI(current);
      }
      requestAnimationFrame(loop);
    })();

    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', () => { layout(); onScroll(); }, { passive: true });
    if (document.readyState === 'complete') layout();
    else addEventListener('load', layout);
    layout();
  })();

  /* ============ Transition « décollage » depuis le haut ============ */
  (function () {
    const wipe = document.getElementById('wipe');
    const about = document.getElementById('apropos');
    if (!wipe || !about || reduceMotion) return;
    let armed = true, busy = false;

    function heroSkip() {
      if (!armed || busy || scrollY > 80) return false;
      busy = true; armed = false;
      document.body.classList.add('is-leaving');
      wipe.classList.add('cover');
      // saut instantané derrière le rideau
      setTimeout(() => {
        const html = document.documentElement;
        const prev = html.style.scrollBehavior;
        html.style.scrollBehavior = 'auto';
        window.scrollTo({ top: about.offsetTop - 60, behavior: 'auto' });
        html.style.scrollBehavior = prev;
        document.body.classList.remove('is-leaving');
      }, 700);
      // petite pause pour laisser lire le titre, puis levée du rideau
      setTimeout(() => { wipe.classList.add('lift'); }, 1150);
      setTimeout(() => { wipe.classList.remove('cover', 'lift'); busy = false; }, 2050);
      return true;
    }

    addEventListener('wheel', e => {
      if (e.deltaY > 8 && heroSkip()) e.preventDefault();
    }, { passive: false });

    let ty = null;
    addEventListener('touchstart', e => { ty = e.touches[0].clientY; }, { passive: true });
    addEventListener('touchmove', e => {
      if (ty === null) return;
      const dy = ty - e.touches[0].clientY;
      if (dy > 28 && heroSkip()) { ty = null; e.preventDefault(); }
    }, { passive: false });
    addEventListener('touchend', () => { ty = null; }, { passive: true });

    // réarmement quand on revient tout en haut
    addEventListener('scroll', () => { if (scrollY < 10 && !busy) armed = true; }, { passive: true });
  })();

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

  /* ============ Terrain 3D (vue aérienne) ============ */
  if (!reduceMotion && window.THREE) {
    const canvas = document.getElementById('terrain');
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0D1126, 14, 46);
    const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 100);
    camera.position.set(0, 5.6, 13);
    camera.lookAt(0, 0, 0);

    const SEG = 120;
    const geo = new THREE.PlaneGeometry(60, 40, SEG, Math.round(SEG * 0.66));
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position;
    const base = new Float32Array(pos.array); // copie des positions de base

    // Dégradé de couleurs par sommet selon l'altitude (lavande → ambre)
    const colors = new Float32Array(pos.count * 3);
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const cLow = new THREE.Color(0x4B478F);
    const cMid = new THREE.Color(0xB9B4FF);
    const cHigh = new THREE.Color(0xFFB454);

    function setTerrainTheme() {
      const light = document.documentElement.classList.contains('light');
      if (light) {
        scene.fog.color.setHex(0xF5F4FB);
        cLow.setHex(0x8A85C6); cMid.setHex(0x4E4894); cHigh.setHex(0xE68A00);
      } else {
        scene.fog.color.setHex(0x0D1126);
        cLow.setHex(0x4B478F); cMid.setHex(0xB9B4FF); cHigh.setHex(0xFFB454);
      }
    }

    const mat = new THREE.MeshBasicMaterial({ wireframe: true, vertexColors: true, transparent: true, opacity: 0.55 });
    const terrain = new THREE.Mesh(geo, mat);
    scene.add(terrain);

    // Particules « lumières au sol »
    const pCount = 260;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      pPos[i * 3] = (Math.random() - 0.5) * 56;
      pPos[i * 3 + 1] = Math.random() * 5 + 0.4;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 36;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ color: 0xFFB454, size: 0.07, transparent: true, opacity: 0.8 });
    const stars = new THREE.Points(pGeo, pMat);
    scene.add(stars);

    function setParticlesTheme() {
      pMat.color.setHex(document.documentElement.classList.contains('light') ? 0xE68A00 : 0xFFB454);
    }
    setTerrainTheme(); setParticlesTheme();
    addEventListener('themechange', () => { setTerrainTheme(); setParticlesTheme(); });

    function noise(x, z, t) {
      return Math.sin(x * 0.32 + t) * Math.cos(z * 0.28 + t * 0.7) * 0.9
        + Math.sin(x * 0.11 - t * 0.5) * 1.6
        + Math.cos(z * 0.16 + x * 0.06 + t * 0.3) * 0.7;
    }

    let mouseX = 0, mouseY = 0;
    addEventListener('mousemove', e => {
      mouseX = (e.clientX / innerWidth - 0.5);
      mouseY = (e.clientY / innerHeight - 0.5);
    });

    function resize() {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      if (canvas.width !== w || canvas.height !== h) {
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      }
    }

    const tmp = new THREE.Color();
    let scrollFactor = 0;
    addEventListener('scroll', () => { scrollFactor = Math.min(1, scrollY / innerHeight); }, { passive: true });

    function animate(t) {
      requestAnimationFrame(animate);
      resize();
      const time = t * 0.00035;
      for (let i = 0; i < pos.count; i++) {
        const x = base[i * 3], z = base[i * 3 + 2];
        const y = noise(x, z, time);
        pos.array[i * 3 + 1] = y;
        // couleur selon altitude
        const n = Math.max(0, Math.min(1, (y + 2.6) / 5.6));
        if (n < 0.6) tmp.copy(cLow).lerp(cMid, n / 0.6);
        else tmp.copy(cMid).lerp(cHigh, (n - 0.6) / 0.4);
        colors[i * 3] = tmp.r; colors[i * 3 + 1] = tmp.g; colors[i * 3 + 2] = tmp.b;
      }
      pos.needsUpdate = true;
      geo.attributes.color.needsUpdate = true;

      // dérive lente des particules
      stars.rotation.y = time * 0.18;

      // parallaxe souris + remontée au scroll
      camera.position.x += (mouseX * 2.4 - camera.position.x) * 0.04;
      camera.position.y += ((5.6 + mouseY * 1.4 + scrollFactor * 4) - camera.position.y) * 0.05;
      camera.lookAt(0, 0, -2);
      renderer.render(scene, camera);
    }
    requestAnimationFrame(animate);
  }
})();

(function () {
  const params = new URLSearchParams(window.location.search);
  const status = params.get('mail');
  const messageEl = document.getElementById('contact-message');
  if (!messageEl || !status) return;
  if (status === 'ok') {
    messageEl.textContent = 'Merci ! Votre message a bien été envoyé.';
    messageEl.style.color = 'var(--amber)';
  } else if (status === 'error') {
    messageEl.textContent = 'Une erreur est survenue. Vérifiez vos informations et réessayez.';
    messageEl.style.color = '#f87171';
  }
})();
