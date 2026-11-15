/* SD HUB — 3D scroll tour + hero parallax. Plain JS, no libraries. */
(() => {
  const scene = document.getElementById('scene');
  if (!scene) return;

  const sticky = scene.querySelector('.scene-sticky');
  const stage = document.getElementById('scene-stage');
  const world = document.getElementById('scene-world');
  const floor = document.getElementById('scene-floor');
  const cards = [...scene.querySelectorAll('.scene-card')];
  const nameEl = document.getElementById('scene-name');
  const descEl = document.getElementById('scene-desc');
  const countEl = document.getElementById('scene-count');
  const prevBtn = document.getElementById('scene-prev');
  const nextBtn = document.getElementById('scene-next');
  const openBtn = document.getElementById('scene-open');
  const N = cards.length;

  const reduceMq = window.matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const navH = () => (document.querySelector('.studio-nav') || { offsetHeight: 88 }).offsetHeight;

  let f = 0;            // smoothed position (0 … N-1)
  let target = 0;       // wanted position
  let tx = 0, ty = 0;   // smoothed tilt (deg)
  let ttx = 0, tty = 0; // wanted tilt
  let active = -1;
  let raf = 0;

  /* ---------- scroll → position ---------- */
  const scrollRange = () => Math.max(1, scene.offsetHeight - sticky.offsetHeight);
  const sceneTop = () => scene.getBoundingClientRect().top + window.scrollY - navH();
  const progress = () => clamp((navH() - scene.getBoundingClientRect().top) / scrollRange(), 0, 1);

  /* ---------- render ---------- */
  const setActive = (i) => {
    if (i === active) return;
    active = i;
    const c = cards[i];
    nameEl.textContent = c.dataset.name;
    descEl.textContent = c.dataset.desc;
    countEl.textContent = String(i + 1).padStart(2, '0') + ' / ' + String(N).padStart(2, '0');
    nameEl.classList.remove('swap'); void nameEl.offsetWidth; nameEl.classList.add('swap');
    descEl.classList.remove('swap'); void descEl.offsetWidth; descEl.classList.add('swap');
    cards.forEach((el, k) => {
      el.setAttribute('aria-label', el.dataset.name + (k === i ? ' — open in the document studio' : ' — bring to front'));
      el.tabIndex = 0;
    });
    prevBtn.disabled = i === 0;
    nextBtn.disabled = i === N - 1;
  };

  const render = () => {
    const W = world.offsetWidth || 300;
    const narrow = window.innerWidth < 800;
    cards.forEach((el, i) => {
      const d = i - f, ad = Math.abs(d);
      const x = d * W * (narrow ? 0.5 : 0.54);
      const z = -Math.min(ad, 3) * W * 0.5;
      const ry = clamp(-d * 30, -58, 58);
      const s = 1 - Math.min(ad, 2.5) * 0.06;
      const o = clamp(1 - Math.max(0, ad - 1.3) * 0.75, 0, 1);
      el.style.transform = `translate3d(${x.toFixed(1)}px,0,${z.toFixed(1)}px) rotateY(${ry.toFixed(2)}deg) scale(${s.toFixed(3)})`;
      el.style.opacity = o.toFixed(3);
      el.style.zIndex = String(100 - Math.round(ad * 10));
      el.style.setProperty('--b', (1 - Math.min(ad, 1.6) * 0.32).toFixed(3));
      el.style.pointerEvents = o < 0.08 ? 'none' : 'auto';
    });
    world.style.transform = `rotateX(${ty.toFixed(2)}deg) rotateY(${tx.toFixed(2)}deg)`;
    if (floor) floor.style.backgroundPosition = `0 ${(f * 90).toFixed(1)}px, ${(f * -90).toFixed(1)}px 0`;
    scene.style.setProperty('--p', (f / (N - 1)).toFixed(4));
    setActive(clamp(Math.round(f), 0, N - 1));
  };

  const tick = () => {
    raf = 0;
    f += (target - f) * 0.14;
    tx += (ttx - tx) * 0.1;
    ty += (tty - ty) * 0.1;
    if (Math.abs(target - f) < 0.0008) f = target;
    render();
    if (f !== target || Math.abs(ttx - tx) > 0.02 || Math.abs(tty - ty) > 0.02) raf = requestAnimationFrame(tick);
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };

  const syncFromScroll = () => {
    if (reduceMq.matches) return;
    target = progress() * (N - 1);
    kick();
  };

  /* ---------- navigation ---------- */
  const go = (i) => {
    i = clamp(i, 0, N - 1);
    if (reduceMq.matches) { target = i; f = i; render(); return; }
    window.scrollTo({ top: sceneTop() + (i / (N - 1)) * scrollRange(), behavior: 'smooth' });
  };

  const openDoc = (i) => {
    const id = cards[i].dataset.doc;
    const tab = document.querySelector('.tab-btn[data-target="' + id + '"]');
    if (tab) tab.click();
    const t = document.getElementById('templates');
    if (t) t.scrollIntoView({ behavior: reduceMq.matches ? 'auto' : 'smooth', block: 'start' });
  };

  cards.forEach((el, i) => el.addEventListener('click', () => (i === active ? openDoc(i) : go(i))));
  prevBtn.addEventListener('click', () => go(active - 1));
  nextBtn.addEventListener('click', () => go(active + 1));
  openBtn.addEventListener('click', () => openDoc(active < 0 ? 0 : active));

  /* ---------- mouse tilt on the stage ---------- */
  stage.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse' || reduceMq.matches) return;
    const r = stage.getBoundingClientRect();
    ttx = ((e.clientX - r.left) / r.width - 0.5) * 16;
    tty = -((e.clientY - r.top) / r.height - 0.5) * 9;
    kick();
  });
  stage.addEventListener('pointerleave', () => { ttx = 0; tty = 0; kick(); });

  /* ---------- hero parallax (mouse + scroll) ---------- */
  const hero = document.querySelector('.studio-hero');
  if (hero) {
    const art = hero.querySelector('.hero-art');
    const content = hero.querySelector('.hero-content');
    const note = hero.querySelector('.hero-note');
    let hx = 0, hy = 0, thx = 0, thy = 0, hraf = 0;
    const heroTick = () => {
      hraf = 0;
      hx += (thx - hx) * 0.08; hy += (thy - hy) * 0.08;
      const sy = Math.min(window.scrollY, hero.offsetHeight) * 0.18;
      if (art) art.style.transform = `translate3d(${(-hx * 22).toFixed(1)}px,${(-hy * 14 + sy).toFixed(1)}px,0) scale(1.07)`;
      if (content) content.style.transform = `translate3d(${(hx * 10).toFixed(1)}px,${(hy * 6 - sy * 0.35).toFixed(1)}px,0)`;
      if (note) note.style.transform = `translate3d(${(hx * 16).toFixed(1)}px,${(hy * 10).toFixed(1)}px,0)`;
      if (Math.abs(thx - hx) > 0.002 || Math.abs(thy - hy) > 0.002) hraf = requestAnimationFrame(heroTick);
    };
    const heroKick = () => { if (!hraf) hraf = requestAnimationFrame(heroTick); };
    hero.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse' || reduceMq.matches) return;
      const r = hero.getBoundingClientRect();
      thx = (e.clientX - r.left) / r.width - 0.5;
      thy = (e.clientY - r.top) / r.height - 0.5;
      heroKick();
    });
    hero.addEventListener('pointerleave', () => { thx = 0; thy = 0; heroKick(); });
    window.addEventListener('scroll', () => { if (!reduceMq.matches && window.scrollY < hero.offsetHeight + 200) heroKick(); }, { passive: true });
  }

  window.addEventListener('scroll', syncFromScroll, { passive: true });
  window.addEventListener('resize', () => { syncFromScroll(); render(); });
  reduceMq.addEventListener && reduceMq.addEventListener('change', () => { syncFromScroll(); render(); });

  syncFromScroll();
  f = target;
  render();
})();

