/* Small pixel effects shared by the homepage sections. */
(function () {
'use strict';
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const FX = {};

/* An image drawn into a canvas at a chosen pixel size; .to(size) animates the change. */
FX.pixelImage = function (src, opts) {
  opts = Object.assign({ start: 16, fit: 'cover' }, opts || {});
  const c = document.createElement('canvas'); c.className = 'pximg';
  const x = c.getContext('2d');
  const im = new Image(); im.decoding = 'async'; im.src = src;
  let size = opts.start, target = opts.start, raf = 0, ready = false;
  const tmp = document.createElement('canvas'), tx = tmp.getContext('2d');
  function paint() {
    if (!ready) return;
    const r = c.getBoundingClientRect(); const dpr = Math.min(2, devicePixelRatio || 1);
    const W = Math.max(2, Math.round((r.width || 300) * dpr)), H = Math.max(2, Math.round((r.height || 200) * dpr));
    if (c.width !== W || c.height !== H) { c.width = W; c.height = H; }
    // cover-fit source rect
    const s = opts.fit === 'cover' ? Math.max(W / im.width, H / im.height) : Math.min(W / im.width, H / im.height);
    const sw = W / s, sh = H / s, sx = (im.width - sw) / 2, sy = (im.height - sh) / 2;
    const k = Math.max(1, size * dpr);
    if (k <= 1.01) { x.imageSmoothingEnabled = true; x.clearRect(0, 0, W, H); x.drawImage(im, sx, sy, sw, sh, 0, 0, W, H); return; }
    const w = Math.max(1, Math.round(W / k)), h = Math.max(1, Math.round(H / k));
    tmp.width = w; tmp.height = h; tx.imageSmoothingEnabled = true; tx.drawImage(im, sx, sy, sw, sh, 0, 0, w, h);
    x.imageSmoothingEnabled = false; x.clearRect(0, 0, W, H); x.drawImage(tmp, 0, 0, w, h, 0, 0, W, H);
  }
  function step() {
    raf = 0;
    if (Math.abs(size - target) < .5) size = target; else size += (target - size) * .22;
    paint();
    if (size !== target) raf = requestAnimationFrame(step);
  }
  c.to = (t) => { target = t; if (reduced) { size = t; paint(); return; } if (!raf) raf = requestAnimationFrame(step); };
  c.repaint = paint;
  im.onload = () => { ready = true; paint(); };
  new ResizeObserver(() => paint()).observe(c);
  return c;
};

/* Pixelated until you hover, then it resolves. */
FX.hoverResolve = function (el, canvas, from) {
  el.addEventListener('pointerenter', () => canvas.to(1));
  el.addEventListener('pointerleave', () => canvas.to(from));
  el.addEventListener('focusin', () => canvas.to(1));
  el.addEventListener('focusout', () => canvas.to(from));
};

/* Things with [data-reveal] step in when they scroll into view. */
FX.reveal = function () {
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .15 });
  document.querySelectorAll('[data-reveal]').forEach(el => io.observe(el));
};

/* Type a paragraph out the first time it is seen. Words keep their markup. */
FX.typeOnView = function (el) {
  if (reduced) return;
  const html = el.innerHTML; el.style.minHeight = el.offsetHeight + 'px';
  const io = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return; io.disconnect();
    const tokens = html.split(/(<[^>]+>|\s+)/).filter(Boolean); let i = 0, out = '';
    el.innerHTML = '<span class="caret"></span>';
    const tick = () => {
      if (i >= tokens.length) { el.innerHTML = html; return; }
      out += tokens[i++]; el.innerHTML = out + '<span class="caret"></span>';
      setTimeout(tick, /^</.test(tokens[i - 1]) || /^\s+$/.test(tokens[i - 1]) ? 0 : 55);
    };
    tick();
  }, { threshold: .5 });
  io.observe(el);
};

/* Each letter hops when the pointer passes over it. */
FX.hop = function (el) {
  const text = el.textContent; el.textContent = '';
  el.setAttribute('aria-label', text);
  [...text].forEach(ch => {
    if (ch === '\n') { el.append(document.createElement('br')); return; }
    const s = document.createElement('span'); s.className = 'hop'; s.textContent = ch; s.setAttribute('aria-hidden', 'true');
    s.addEventListener('pointerenter', () => { s.classList.remove('go'); void s.offsetWidth; s.classList.add('go'); });
    el.append(s);
  });
};

/* Drag a horizontal strip with the mouse, with a bit of glide. */
FX.dragScroll = function (el) {
  let down = false, x0 = 0, s0 = 0, v = 0, last = 0, moved = false;
  el.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; down = true; moved = false; x0 = e.clientX; s0 = el.scrollLeft; last = e.clientX; v = 0; el.classList.add('dragging'); });
  addEventListener('pointermove', e => { if (!down) return; const dx = e.clientX - x0; if (Math.abs(dx) > 4) moved = true; el.scrollLeft = s0 - dx; v = e.clientX - last; last = e.clientX; });
  addEventListener('pointerup', () => {
    if (!down) return; down = false; el.classList.remove('dragging');
    const glide = () => { if (Math.abs(v) < .5 || reduced) return; el.scrollLeft -= v; v *= .92; requestAnimationFrame(glide); };
    glide();
  });
  el.addEventListener('click', e => { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
};

/* Pixel cursors drawn at runtime: arrow and pointing hand. */
FX.cursors = function () {
  const make = (rows, hot) => {
    const c = document.createElement('canvas'); c.width = 32; c.height = 32; const x = c.getContext('2d');
    rows.forEach((r, j) => [...r].forEach((ch, i) => { if (ch === '.') return; x.fillStyle = ch === 'o' ? '#2a1f1a' : ch === 'w' ? '#ffffff' : '#ffd95a'; x.fillRect(i * 2, j * 2, 2, 2); }));
    return `url(${c.toDataURL()}) ${hot}, auto`;
  };
  const arrow = make(['o.........', 'oo........', 'owo.......', 'owwo......', 'owwwo.....', 'owwwwo....', 'owwwwwo...', 'owwwwwwo..', 'owwwwoooo.', 'owwowo....', 'owo.owo...', 'oo..owo...', 'o....owo..', '.....oo...'], '0 0');
  const hand = make(['....oo......', '...owwo.....', '...owwo.....', '...owwoooo..', '...owwowwoo.', '.ooowwowwowo', 'owwowwwwwowo', 'owwwwwwwwwwo', '.owwwwwwwwwo', '..owwwwwwwo.', '..owwwwwwwo.', '...owwwwwo..', '...ooooooo..'], '8 2');
  const st = document.createElement('style');
  st.textContent = `@media (pointer:fine){html,body{cursor:${arrow}}a,button,[role=button],.px-stage[style*="pointer"],label,summary,.inv div,input[type=range]{cursor:${hand}!important}}`;
  document.head.append(st);
};

/* Scroll progress drawn as an HP bar. */
FX.hpBar = function (el) {
  const fill = el.querySelector('i');
  const upd = () => { const h = document.documentElement; const p = h.scrollTop / Math.max(1, h.scrollHeight - innerHeight); fill.style.width = Math.round(p * 40) / 40 * 100 + '%'; };
  addEventListener('scroll', upd, { passive: true }); upd();
};

/* A parallax pixel horizon: hills, river and the city, synced to day/night. */
FX.horizon = function (host) {
  const W = 320, H = 64;
  const c = document.createElement('canvas'); c.width = W; c.height = H; c.className = 'horizon-cv';
  host.append(c);
  const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
  const R = (a, b, w, h, col) => { x.fillStyle = col; x.fillRect(a | 0, b | 0, w | 0, h | 0); };
  const ridge = (seed, base, amp, freq) => { const ys = []; for (let i = 0; i < W * 3; i++) ys.push(base + Math.round(Math.sin(i * freq + seed) * amp + Math.sin(i * freq * 2.7 + seed * 2) * amp * .4)); return ys; };
  const far = ridge(1, 30, 5, .035), mid = ridge(4, 38, 4, .06);
  const towers = []; for (let i = 0; i < 40; i++) towers.push({ x: i * 9 + (i * 7 % 5), w: 5 + (i * 3) % 5, h: 8 + (i * 13) % 14 });
  let scrollY = 0, t0 = performance.now(), visible = false;
  addEventListener('scroll', () => { scrollY = document.documentElement.scrollTop; }, { passive: true });
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(host);
  function frame(now) {
    requestAnimationFrame(frame);
    if (!visible) return;
    const t = reduced ? 0 : (now - t0) / 1000;
    const night = document.documentElement.dataset.night === '1';
    // sky
    const sky = night ? ['#141433', '#24245a', '#3a3570'] : ['#9fd3f0', '#c4e6f6', '#ffe2b8'];
    for (let j = 0; j < 40; j++) R(0, j, W, 1, j < 14 ? sky[0] : j < 28 ? sky[1] : sky[2]);
    for (let j = 13; j < 28; j += 2) for (let i = (j & 2); i < W; i += 4) R(i, j, 1, 1, j < 20 ? sky[1] : sky[2]);
    if (night) { for (let i = 0; i < 40; i++) if (((t * 2 + i) | 0) % 7) R((i * 53) % W, (i * 17) % 22, 1, 1, '#fff6d8'); R(260, 6, 5, 5, '#fff3c8'); R(262, 6, 3, 4, sky[0]); }
    else { R(262, 8, 8, 8, '#fff6d0'); R(264, 6, 4, 12, '#fff6d0'); R(260, 10, 12, 4, '#fff6d0'); }
    // clouds
    const cloud = night ? '#3e3a74' : '#ffffff';
    for (let k = 0; k < 4; k++) { const cx = ((k * 97 + t * (4 + k)) % (W + 60)) - 30, cy = 6 + k * 5; R(cx, cy, 18, 3, cloud); R(cx + 4, cy - 2, 9, 2, cloud); }
    const off = scrollY * .02;
    // far hills
    for (let i = 0; i < W; i++) { const y = far[(i + Math.round(off * .5)) % far.length]; R(i, y, 1, H - y, night ? '#2b2d5c' : '#8fb2c8'); }
    // city
    for (const tw of towers) {
      const tx = ((tw.x - off) % (W + 20) + W + 20) % (W + 20) - 10;
      R(tx, 40 - tw.h, tw.w, tw.h, night ? '#1f2048' : '#b9c7d2');
      for (let wy = 42 - tw.h; wy < 38; wy += 3) for (let wx = tx + 1; wx < tx + tw.w - 1; wx += 2) if ((wx * 7 + wy * 3) % 5 === 0) R(wx, wy, 1, 1, night ? '#ffd27a' : '#e8f1f6');
    }
    // mid hills
    for (let i = 0; i < W; i++) { const y = mid[(i + Math.round(off * 1.4)) % mid.length]; R(i, y, 1, H - y, night ? '#1d3a3a' : '#79b56a'); }
    // river with shimmer
    R(0, 46, W, 8, night ? '#1c2a55' : '#5aa9d6');
    for (let i = 0; i < 26; i++) { const sx = (i * 37 + t * 9) % W; R(sx, 47 + (i % 3) * 2, 4, 1, night ? '#3f5aa0' : '#bfe6f7'); }
    // near bank and trees
    R(0, 54, W, 10, night ? '#162a22' : '#4f8f4a');
    for (let i = 0; i < 18; i++) { const tx = ((i * 23 - off * 2.5) % (W + 30) + W + 30) % (W + 30) - 15; R(tx + 3, 48, 2, 7, night ? '#2a1f1a' : '#6e4026'); R(tx, 42, 8, 7, night ? '#173b2a' : '#3f8a4a'); R(tx + 1, 41, 6, 1, night ? '#173b2a' : '#3f8a4a'); R(tx + 1, 43, 2, 2, night ? '#24503a' : '#7cc36b'); }
  }
  requestAnimationFrame(frame);
};

window.FX = FX;
})();
