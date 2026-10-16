(function () {
'use strict';
const { Room, canvas, R, dither, ellipse, line, outline, spriteGirl } = window.PixelRoom;
const FX = window.FX;
const { PROFILE, STORIES, WORKS, SKILLS, PHOTOS } = window.SITE;
const { drawCover } = window.PixelCovers;
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const narrow = () => innerWidth < innerHeight;

/* ======================= door ======================= */
function paintHall() {
  const c = $('#door .hall'), x = c.getContext('2d');
  R(x, 0, 0, 160, 90, '#2e2540');
  for (let y = 4; y < 62; y += 8) for (let i = (y / 8 & 1) * 5; i < 160; i += 10) R(x, i, y, 1, 1, '#3b3152');
  R(x, 0, 56, 160, 2, '#4a3d66'); R(x, 0, 58, 160, 8, '#3a2f52'); dither(x, 0, 58, 160, 8, '#30264a', .4);
  R(x, 0, 66, 160, 24, '#6b4a35');
  for (let j = 66; j < 90; j += 4) { R(x, 0, j, 160, 1, '#5a3d2c'); for (let i = (j * 7) % 23; i < 160; i += 23) R(x, i, j, 1, 4, '#5a3d2c'); }
  // sconces
  for (const sx of [44, 112]) { R(x, sx, 20, 4, 6, '#ffd27a'); R(x, sx - 1, 26, 6, 1, '#8a6a3a'); }
  // a plant and a mat
  R(x, 128, 50, 8, 10, '#b07a42'); ellipse(x, 132, 46, 6, 6, '#3a9a62'); ellipse(x, 130, 43, 3, 3, '#6fd88a');
  const g = x.createRadialGradient(46, 23, 0, 46, 23, 26); g.addColorStop(0, 'rgba(255,210,122,.35)'); g.addColorStop(1, 'rgba(255,210,122,0)');
  x.fillStyle = g; x.fillRect(0, 0, 160, 90);
  const g2 = x.createRadialGradient(114, 23, 0, 114, 23, 26); g2.addColorStop(0, 'rgba(255,210,122,.35)'); g2.addColorStop(1, 'rgba(255,210,122,0)');
  x.fillStyle = g2; x.fillRect(0, 0, 160, 90);
  const fit = () => { const s = Math.max(innerWidth / 160, innerHeight / 90); c.style.width = 160 * s + 'px'; c.style.height = 90 * s + 'px'; c.style.left = (innerWidth - 160 * s) / 2 + 'px'; c.style.top = (innerHeight - 90 * s) / 2 + 'px'; };
  c.style.position = 'absolute'; c.style.inset = 'auto'; fit(); addEventListener('resize', fit);
}
function paintLeaf() {
  const c = $('#door .leaf canvas'), x = c.getContext('2d');
  R(x, 0, 0, 48, 88, '#c98a52'); R(x, 0, 0, 48, 2, '#e3b07a'); R(x, 0, 0, 2, 88, '#e3b07a');
  for (const [py, ph] of [[8, 30], [46, 34]]) { R(x, 7, py, 34, ph, '#b0743f'); R(x, 7, py, 34, 1, '#8a5a30'); R(x, 7, py, 1, ph, '#8a5a30'); R(x, 8, py + ph - 1, 33, 1, '#e3b07a'); R(x, 40, py + 1, 1, ph - 1, '#e3b07a'); }
  for (let j = 0; j < 88; j += 3) for (let i = (j * 5) % 7; i < 48; i += 7) R(x, i, j, 2, 1, '#bd8048');
  // name plate
  R(x, 10, 20, 29, 8, '#f3ead8'); R(x, 10, 27, 29, 1, '#b8a27a');
  const tiny = { C: ['111', '100', '100', '100', '111'], E: ['111', '100', '110', '100', '111'], L: ['100', '100', '100', '100', '111'], I: ['1', '1', '1', '1', '1'], A: ['010', '101', '111', '101', '101'] };
  let px = 12; for (const ch of 'CECELIA') { const g = tiny[ch]; g.forEach((row, j) => [...row].forEach((v, i) => v === '1' && R(x, px + i, 21 + j, 1, 1, '#2a1f1a'))); px += g[0].length + 1; }
  // knob + a heart sticker
  R(x, 40, 48, 4, 4, '#ffd95a'); R(x, 40, 48, 4, 1, '#fff3b0'); R(x, 41, 52, 2, 1, '#8a6a3a');
  R(x, 15, 60, 2, 1, '#ff8fb1'); R(x, 18, 60, 2, 1, '#ff8fb1'); R(x, 14, 61, 7, 2, '#ff8fb1'); R(x, 15, 63, 5, 1, '#ff8fb1'); R(x, 16, 64, 3, 1, '#ff8fb1'); R(x, 17, 65, 1, 1, '#ff8fb1');
  x.strokeStyle = '#2a1f1a'; x.strokeRect(.5, .5, 47, 87);
}
function setupDoor() {
  const door = $('#door');
  let seen = false; try { seen = sessionStorage.getItem('door') === '1'; } catch (e) {}
  if (seen || location.hash.length > 1) { door.remove(); return; }
  paintHall(); paintLeaf();
  document.body.style.overflow = 'hidden';
  let done = false;
  const open = (instant) => {
    if (done) return; done = true;
    try { sessionStorage.setItem('door', '1'); } catch (e) {}
    door.classList.add('open');
    setTimeout(() => door.classList.add('gone'), instant || reduced ? 0 : 650);
    setTimeout(() => { door.remove(); document.body.style.overflow = ''; }, instant || reduced ? 50 : 1900);
  };
  door.addEventListener('click', e => open(e.target.classList.contains('skip')));
  door.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
  addEventListener('keydown', e => { if (!done && (e.key === 'Escape')) open(true); });
  door.focus();
}

/* ======================= room ======================= */
const room = new Room($('#stage'), { focusX: innerWidth < innerHeight ? 200 : 262 });
const tip = $('#tip');
room.on('hover', o => {
  if (!o) { tip.classList.remove('on'); return; }
  tip.textContent = o.name;
  const [sx, sy] = room.toScreen(o.x + o.w / 2, o.y);
  tip.style.left = sx + 'px'; tip.style.top = (sy - 8) + 'px';
  tip.classList.add('on');
});
room.on('select', o => act(o));
// on a phone the room is wider than the screen: drift slowly across it, and let a finger drag it
let holdPan = 0, panFx = 250, drag = null;
const stageEl = $('#stage');
const wide = () => room.base.offsetWidth > stageEl.clientWidth + 4;
stageEl.addEventListener('pointerdown', e => {
  holdPan = performance.now() + 8000;
  const [ax] = room.toArt(stageEl.getBoundingClientRect().left + stageEl.clientWidth / 2, 0);
  drag = { x: e.clientX, fx: ax, moved: 0 }; panFx = ax;
});
addEventListener('pointermove', e => {
  if (!drag || !wide()) return;
  const dx = e.clientX - drag.x; drag.moved = Math.max(drag.moved, Math.abs(dx));
  panFx = drag.fx - dx / room.scale; holdPan = performance.now() + 8000;
  if (drag.moved > 6) tip.classList.remove('on');
}, { passive: true });
let dragged = 0;
addEventListener('pointerup', () => { dragged = drag ? drag.moved : 0; drag = null; });
// a drag is not a click
stageEl.addEventListener('click', e => { if (dragged > 8) { e.stopImmediatePropagation(); dragged = 0; } }, true);
room.drawOverlay = (x, t) => {
  if (!wide()) return;
  if (performance.now() < holdPan) room.pan(panFx);
  else if (!reduced && narrow()) room.pan(250 + Math.sin(t / 7000) * 150);
};
addEventListener('scroll', () => tip.classList.remove('on'), { passive: true });

const dn = $('#daynight');
const syncSun = () => { dn.textContent = room.night ? '☀' : '☾'; document.documentElement.dataset.night = room.night ? '1' : ''; };
room.on('night', syncSun); syncSun();
dn.addEventListener('click', () => setNight(!room.night));
function setNight(n) { room.setNight(n); island && island.setNight(n); }

function act(o) {
  if (o.work) return openCase(WORKS.findIndex(w => w.id === o.work));
  const st = STORIES[o.group];
  if (!st) return;
  if (st.open === 'os') return openOS();
  if (st.toggle === 'night') setNight(!room.night);
  if (st.toggle === 'lamp') { room.lampOn = !room.lampOn; return; }
  if (st.toggle === 'door') { try { sessionStorage.removeItem('door'); } catch (e) {} location.hash = ''; location.reload(); return; }
  showStory(o, st);
}

/* ======================= story dialog ======================= */
const story = $('#story');
let typer = null;
function showStory(o, st) {
  room.focus = o;
  window.StoryPortrait($('#story-p'), o, st, room, '');
  $('#story-t').textContent = st.title;
  const b = $('#story-b'); b.innerHTML = '';
  const acts = $('#story-a'); acts.innerHTML = '';
  if (st.toggle === 'night') { const btn = document.createElement('button'); btn.className = 'btn ghost'; btn.type = 'button'; btn.textContent = room.night ? 'Bring the sun back' : 'Wait for night'; btn.onclick = () => { setNight(!room.night); btn.textContent = room.night ? 'Bring the sun back' : 'Wait for night'; }; acts.append(btn); }
  if (o.group === 'photos') {
    const strip = document.createElement('div'); strip.className = 'pins';
    PHOTOS.slice(0, 6).forEach((src, k) => { const a = document.createElement('a'); a.href = src; a.target = '_blank'; a.rel = 'noopener'; a.style.setProperty('--r', ((k % 3) - 1) * 3 + 'deg'); const i = new Image(); i.src = src; i.alt = ''; i.loading = 'lazy'; a.append(i); strip.append(a); });
    acts.append(strip);
  }
  story.hidden = false;
  // type it out, one line at a time
  clearInterval(typer);
  const lines = st.lines.slice(); let li = 0, ci = 0, cur = null;
  const finish = () => { clearInterval(typer); typer = null; b.innerHTML = lines.map(l => '<p>' + esc(l) + '</p>').join(''); };
  if (reduced) return finish();
  typer = setInterval(() => {
    if (!cur) { cur = document.createElement('p'); b.append(cur); }
    cur.textContent = lines[li].slice(0, ++ci);
    if (ci >= lines[li].length) { li++; ci = 0; cur = null; if (li >= lines.length) { clearInterval(typer); typer = null; } }
  }, 18);
  story._finish = finish;
}
function closeStory() { story.hidden = true; room.focus = null; clearInterval(typer); }
story.querySelector('.x').addEventListener('click', closeStory);
story.addEventListener('click', e => { if (typer && !e.target.closest('button')) story._finish(); });
addEventListener('keydown', e => { if (e.key === 'Escape') { if (!$('#player').hidden) closePlayer(); else if (!$('#case').hidden) closeCase(); else if (!$('#os').hidden) closeOS(); else closeStory(); } });
$('#stage').addEventListener('click', e => { if (!room.pick(...room.toArt(e.clientX, e.clientY))) closeStory(); });

/* ======================= the desk computer ======================= */
const os = $('#os');
const APPS = [
  { id: 'work', label: 'Work', c: '#ffb86b' },
  { id: 'about', label: 'About', c: '#ff8fc8' },
  { id: 'arcade', label: 'Arcade', c: '#8fe3a8' },
  { id: 'contact', label: 'Contact', c: '#8fcfff' }
];
let clockT;
function openOS(app) {
  closeStory(); tip.classList.remove('on');
  const go = () => {
    os.hidden = false; document.body.style.overflow = 'hidden';
    renderApp(app || 'work');
    const tick = () => { $('#os-clock').textContent = new Date().toLocaleTimeString('en-AU', { timeZone: 'Australia/Brisbane', hour: '2-digit', minute: '2-digit' }) + ' Brisbane'; };
    tick(); clearInterval(clockT); clockT = setInterval(tick, 10000);
    os.querySelector('.icon[aria-current="true"]')?.focus();
  };
  if (reduced) return go();
  // lean in to the screen first
  const st = $('#stage'); const m = room.find('computer');
  const [sx, sy] = room.toScreen(m.x + m.w / 2, m.y + 15);
  const r = st.getBoundingClientRect();
  st.classList.add('zoom');
  for (const c of [room.base, room.light]) { c.style.transformOrigin = (sx - r.left - room.offX) + 'px ' + (sy - r.top - room.offY) + 'px'; c.style.transform = 'scale(5)'; }
  setTimeout(() => { go(); for (const c of [room.base, room.light]) c.style.transform = ''; setTimeout(() => st.classList.remove('zoom'), 50); }, 600);
}
function closeOS() { os.hidden = true; document.body.style.overflow = ''; clearInterval(clockT); }
os.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', closeOS));
$('#os-icons').innerHTML = APPS.map(a => `<button class="icon" type="button" data-app="${a.id}" style="--c:${a.c}"><i></i><span>${a.label}</span></button>`).join('');
$('#os-icons').addEventListener('click', e => { const b = e.target.closest('[data-app]'); if (b) renderApp(b.dataset.app); });
function renderApp(id) {
  os.querySelectorAll('.icon').forEach(i => i.setAttribute('aria-current', String(i.dataset.app === id)));
  const body = $('#os-body'); body.scrollTop = 0;
  $('#os-title').textContent = APPS.find(a => a.id === id).label;
  if (id === 'work') {
    body.innerHTML = '<div class="os-grid"></div>';
    const g = body.firstChild;
    WORKS.forEach((w, i) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'os-card';
      b.append(coverEl(w)); b.insertAdjacentHTML('beforeend', `<b>${esc(w.title)}</b><span>${esc(w.kind)} · ${esc(w.year)}</span>`);
      b.onclick = () => openCase(i); g.append(b);
    });
  } else if (id === 'about') {
    body.innerHTML = `<div class="about" style="grid-template-columns:160px 1fr"><div class="me frame" style="padding:14px"></div><div class="os-about">${[...document.querySelectorAll('.intro-text > p:not(.kicker), .intro-text .facts')].map(n => n.outerHTML).join('')}</div></div>`;
    const c = spriteGirl(0, 0); const big = scaleUp(c, 6); big.style.width = '70%'; body.querySelector('.me').append(big);
    body.querySelectorAll('.kicker').forEach(k => k.remove());
  } else if (id === 'arcade') {
    body.innerHTML = '<div class="arcade"></div>';
    $('#arcade').querySelectorAll('.cab').forEach(c => { const n = c.cloneNode(true); const src = c; n.querySelectorAll('.scr').forEach(sc => { sc.innerHTML = ''; if (sc.dataset.src) { const i = new Image(); i.src = sc.dataset.src; i.alt = ''; sc.append(i); } else sc.append(drawCover('myRoom')); }); n.onclick = e => { if (n.tagName === 'BUTTON') { e.preventDefault(); src.click(); } }; body.firstChild.append(n); });
  } else {
    body.innerHTML = `<h2 style="font-family:var(--display);font-size:52px;margin:0 0 24px">Find me.</h2><div class="links" style="display:flex;gap:18px;flex-wrap:wrap">${linksHTML()}</div>`;
  }
}

/* ======================= work list + case studies ======================= */
function coverEl(w) {
  if (w.image) { const i = new Image(); i.src = w.image; i.alt = ''; i.style.objectFit = 'cover'; i.style.imageRendering = 'auto'; return i; }
  const c = drawCover(w.cover); return c;
}
function scaleUp(src, k) { const [c, x] = canvas(src.width * k, src.height * k); x.imageSmoothingEnabled = false; x.drawImage(src, 0, 0, c.width, c.height); return c; }
const list = $('#works');
const chips = w => (w.skills || []).map(k => `<i>${esc(k)}</i>`).join('');
/* Each project sits under a strip of washi tape. Drag the tape sideways to peel it off. */
WORKS.forEach((w, i) => {
  const li = document.createElement('li'); li.className = 'work tapework'; li.dataset.id = w.id; li.dataset.reveal = '';
  li.style.setProperty('--ac', w.accent || 'var(--gold)'); li.style.setProperty('--i', i);
  li.innerHTML = `<div class="under">
      <div class="u-cv"></div>
      <div class="u-tx"><span class="n">${String(i + 1).padStart(2, '0')}</span><b>${esc(w.title)}</b><span class="s">${esc(w.summary)}</span><span class="sk">${chips(w)}</span></div>
      <button type="button" class="btn u-open">Open ▸</button>
    </div>
    <div class="tape" tabindex="0" role="button" aria-label="Peel the tape off ${esc(w.title)}">
      <div class="t-face"><span class="n">${String(i + 1).padStart(2, '0')}</span><span class="t">${esc(w.title)}</span><span class="m"><b>${esc(w.unit.split(' · ')[0])}</b>${esc(w.kind)} · ${esc(w.year)}</span><span class="pull">peel ⟶</span></div>
    </div>
    <div class="curl" aria-hidden="true"></div>`;
  const cv = coverEl(w); li.querySelector('.u-cv').append(cv);
  li.querySelector('.u-open').onclick = () => openCase(i);
  li.querySelector('.under').addEventListener('click', e => { if (li.classList.contains('peeled') && !e.target.closest('button')) openCase(i); });
  peelable(li);
  list.append(li);
});
function peelable(li) {
  const tape = li.querySelector('.tape'), curl = li.querySelector('.curl');
  let x = 0, start = 0, from = 0, down = false, raf = 0, moved = 0, lastSnd = 0;
  const W = () => li.clientWidth;
  // the tape is cut away left of the peel line; the peeled part folds back over it as the curl
  const draw = v => {
    x = Math.max(0, Math.min(W(), v));
    const fold = Math.min(x * .55, 160);
    tape.style.clipPath = `inset(0 0 0 ${x}px)`;
    curl.style.left = x + 'px'; curl.style.width = fold + 'px';
    curl.style.opacity = x > 2 && x < W() - 2 ? 1 : 0;
    li.style.setProperty('--peel', (x / W()).toFixed(3));
  };
  const settle = to => {
    cancelAnimationFrame(raf);
    const x0 = x, t0 = performance.now(), dur = to > x0 ? 520 : 440;
    const go = now => { const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3); draw(x0 + (to - x0) * e); if (k < 1) raf = requestAnimationFrame(go); else done(to); };
    if (reduced) { draw(to); done(to); } else raf = requestAnimationFrame(go);
  };
  const done = to => {
    const off = to >= W();
    li.classList.toggle('peeled', off);
    tape.setAttribute('aria-hidden', String(off)); tape.tabIndex = off ? -1 : 0;
    if (off) { tape.style.visibility = 'hidden'; curl.style.opacity = 0; li.querySelector('.u-open').focus({ preventScroll: true }); }
  };
  const peelOff = () => { rip(.6); settle(W()); };
  tape.addEventListener('pointerdown', e => { down = true; moved = 0; start = e.clientX; from = x; cancelAnimationFrame(raf); tape.setPointerCapture(e.pointerId); li.classList.add('grab'); });
  tape.addEventListener('pointermove', e => {
    if (!down) { if (!x) li.classList.add('lift'); return; }
    const dx = e.clientX - start; moved = Math.max(moved, Math.abs(dx));
    // pulled from either end, the tape comes away from the left
    draw(from + Math.abs(dx));
    const now = performance.now(); if (now - lastSnd > 70 && moved > 6) { lastSnd = now; rip(.25); }
  });
  const up = () => {
    if (!down) return; down = false; li.classList.remove('grab');
    if (moved < 6) return peelOff();            // a click peels it too
    if (x > W() * .45) peelOff(); else settle(0);
  };
  tape.addEventListener('pointerup', up); tape.addEventListener('pointercancel', up);
  tape.addEventListener('pointerleave', () => li.classList.remove('lift'));
  tape.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); peelOff(); } });
  li.restick = () => { tape.style.visibility = ''; li.classList.remove('peeled'); tape.tabIndex = 0; tape.removeAttribute('aria-hidden'); settle(0); };
  draw(0);
  addEventListener('resize', () => { if (li.classList.contains('peeled')) draw(W()); });
}
// stick everything back down
$('#restick').onclick = () => { document.querySelectorAll('.tapework').forEach((li, k) => setTimeout(() => li.restick(), k * 80)); coin(); };
// a dry little rip, only while sound is on
function rip(len) {
  if (!window.Music || !window.Music.on) return;
  window.Music.rip(len);
}
// on touch screens there is no hover, so pictures sharpen as they scroll into view
const canHover = matchMedia('(hover:hover)').matches;
function sharpenOnView(el, pc) { new IntersectionObserver(([e], o) => { if (e.isIntersecting) { o.disconnect(); setTimeout(() => pc.to(1), 250); } }, { threshold: .5 }).observe(el); }
// the same work as a deck of cards
const deck = document.createElement('div'); deck.className = 'deck'; deck.id = 'deck'; deck.hidden = true;
WORKS.forEach((w, i) => {
  const c = document.createElement('button'); c.type = 'button'; c.className = 'wcard'; c.dataset.id = w.id;
  c.style.setProperty('--ac', w.accent || 'var(--gold)'); c.style.setProperty('--i', i);
  const scr = document.createElement('div'); scr.className = 'wc-cv';
  if (w.image) { const pc = FX.pixelImage(w.image, { start: 12 }); scr.append(pc); FX.hoverResolve(c, pc, 12); if (!canHover) sharpenOnView(c, pc); } else scr.append(drawCover(w.cover));
  c.append(scr);
  c.insertAdjacentHTML('beforeend', `<span class="wc-n">${String(i + 1).padStart(2, '0')}</span><b>${esc(w.title)}</b><span class="wc-k">${esc(w.kind)} · ${esc(w.year)}</span><span class="sk">${chips(w)}</span><span class="wc-go">open ▸</span>`);
  c.onclick = () => openCase(i);
  c.addEventListener('pointerenter', () => tick());
  FX.tilt(c, 9);
  deck.append(c);
});
list.after(deck);
const views = $('#views');
function setView(v) {
  list.hidden = v === 'cards'; deck.hidden = v !== 'cards';
  views.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.view === v)));
  if (v === 'cards') deck.querySelectorAll('.wcard').forEach(c => { c.classList.remove('deal'); void c.offsetWidth; c.classList.add('deal'); });
  try { sessionStorage.setItem('view', v); } catch (e) {}
}
views.addEventListener('click', e => { const b = e.target.closest('[data-view]'); if (b) { coin(); setView(b.dataset.view); } });
// always open on the tape; the choice is remembered only for this visit
let v0 = 'list'; try { v0 = sessionStorage.getItem('view') || 'list'; } catch (e) {}
setView(v0);

const peek = $('#peek');
const peekCache = {};
function showPeek(w) {
  peek.innerHTML = '';
  peek.style.setProperty('--ac', w.accent || 'var(--gold)');
  const src = w.image;
  if (src) { const c = peekCache[w.id] || (peekCache[w.id] = FX.pixelImage(src, { start: 18 })); c.to(18); peek.append(c); requestAnimationFrame(() => { c.repaint(); c.to(1); }); }
  else peek.append(coverEl(w));
  peek.insertAdjacentHTML('beforeend', '<span class="badge">open ▸</span>');
  peek.classList.add('on');
}
// the preview trails the pointer and leans into the direction it moves
let px = 0, py = 0, pvx = 0, ptx = 0, pty = 0, praf = 0;
addEventListener('pointermove', e => { ptx = e.clientX + Math.min(300, innerWidth * .22); pty = e.clientY; if (!praf) praf = requestAnimationFrame(trail); }, { passive: true });
function trail() {
  praf = 0;
  const dx = ptx - px; px += dx * .2; py += (pty - py) * .2; pvx = pvx * .8 + dx * .02;
  peek.style.left = px + 'px'; peek.style.top = py + 'px'; peek.style.setProperty('--lean', Math.max(-8, Math.min(8, pvx)) - 2 + 'deg');
  if (Math.abs(dx) > .5 || Math.abs(pty - py) > .5) praf = requestAnimationFrame(trail);
}

const caseEl = $('#case');
let lastFocus = null, caseIndex = 0;
// reading progress and a slow drift on the cover
caseEl.addEventListener('scroll', () => {
  const k = caseEl.scrollTop / Math.max(1, caseEl.scrollHeight - caseEl.clientHeight);
  const bar = caseEl.querySelector('.cprog i'); if (bar) bar.style.width = (k * 100).toFixed(1) + '%';
  const cv = caseEl.querySelector('.cover'); if (cv && !reduced) cv.style.transform = `translateY(${Math.min(120, caseEl.scrollTop * .15)}px) scale(${1 + Math.min(.06, caseEl.scrollTop / 8000)})`;
}, { passive: true });
addEventListener('keydown', e => {
  if (caseEl.hidden || !player.hidden) return;
  if (e.key === 'ArrowRight') openCase((caseIndex + 1) % WORKS.length);
  if (e.key === 'ArrowLeft') openCase((caseIndex + WORKS.length - 1) % WORKS.length);
});
function openCase(i) {
  const w = WORKS[i]; lastFocus = document.activeElement;
  const next = WORKS[(i + 1) % WORKS.length], prev = WORKS[(i + WORKS.length - 1) % WORKS.length];
  caseEl.style.setProperty('--ac', w.accent || 'var(--gold)'); caseIndex = i;
  caseEl.innerHTML = `<div class="cprog"><i></i></div><button class="btn ghost close" type="button">Close ×</button>
  <div class="in">
    <div class="cv"></div>
    <h2>${esc(w.title)}</h2>
    <p class="lede">${esc(w.summary)}</p>
    ${w.skills ? `<div class="shows"><span>What this shows</span>${chips(w)}</div>` : ''}
    <div class="cols">
      <dl>
        <dt>Unit</dt><dd>${esc(w.unit)}</dd>
        <dt>Year</dt><dd>${esc(w.year)}</dd>
        <dt>Role</dt><dd>${esc(w.role)}</dd>
        <dt>Tools</dt><dd>${w.tools.map(esc).join('<br>')}</dd>
        ${w.credits ? `<dt>Team</dt><dd>${esc(w.credits).replace(/ · /g, '<br>')}</dd>` : ''}
      </dl>
      <div class="body">${w.body.map((p, k) => `<p>${esc(p)}</p>` + (k === 1 && w.quote ? `<blockquote>${esc(w.quote)}</blockquote>` : '')).join('')}
        ${w.play ? `<div class="plays">${w.play.map((g, k) => `<button class="btn" type="button" data-play="${k}">Play ${esc(g.label)} here ▸</button>`).join('')}</div>` : ''}
        ${w.links.length ? `<p style="display:flex;gap:18px;flex-wrap:wrap;margin-top:30px">${w.links.map(l => `<a class="btn" href="${esc(l.href)}" ${/^http/.test(l.href) ? 'target="_blank" rel="noopener"' : ''}>${esc(l.label)} ▸</a>`).join('')}</p>` : ''}
      </div>
    </div>
    ${w.gallery && w.gallery.length ? `<div class="gallery${w.tall ? ' tall' : ''}">${w.gallery.map(src => `<a href="${esc(src)}" target="_blank" rel="noopener"><img src="${esc(src)}" alt="" loading="lazy"></a>`).join('')}</div>` : ''}
    <div class="nav2"><button class="btn ghost" type="button" data-go="${(i + WORKS.length - 1) % WORKS.length}">◂ ${esc(prev.title)}</button><button class="btn ghost" type="button" data-go="${(i + 1) % WORKS.length}">${esc(next.title)} ▸</button></div>
  </div>`;
  const cv = coverEl(w); cv.classList.add('cover'); caseEl.querySelector('.cv').append(cv);
  caseEl.dataset.work = w.id; caseEl.hidden = false; caseEl.scrollTop = 0; document.body.style.overflow = 'hidden';
  caseEl.querySelector('.close').onclick = closeCase;
  caseEl.querySelectorAll('[data-go]').forEach(b => b.onclick = () => openCase(+b.dataset.go));
  caseEl.querySelectorAll('[data-play]').forEach(b => b.onclick = () => openPlayer(w.play[+b.dataset.play]));
  caseEl.querySelector('.close').focus();
  caseEl.querySelectorAll('.body p, .body blockquote, .gallery a, .shows').forEach((n, k) => { n.style.setProperty('--k', k); n.classList.add('rise'); });
}
function closeCase() { caseEl.hidden = true; if (os.hidden) document.body.style.overflow = ''; lastFocus && lastFocus.focus && lastFocus.focus(); }

/* ======================= in-page player ======================= */
const player = $('#player');
function openPlayer(g) {
  player.querySelector('.ptitle').textContent = g.label;
  player.querySelector('.phint').textContent = g.hint || '';
  player.querySelector('.popen').href = g.href;
  const box = player.querySelector('.pbox');
  const [rw, rh] = (g.ratio || '16/9').split('/').map(Number);
  box.style.aspectRatio = rw + '/' + rh;
  box.style.width = `min(100%, calc((100svh - 130px) * ${rw / rh}))`;
  box.innerHTML = `<iframe src="${esc(g.href)}" title="${esc(g.label)}" allow="autoplay; fullscreen" loading="eager"></iframe>`;
  player.hidden = false; document.body.style.overflow = 'hidden';
  setTimeout(() => box.querySelector('iframe').focus(), 300);
}
function closePlayer() { player.hidden = true; player.querySelector('.pbox').innerHTML = ''; if (caseEl.hidden && os.hidden) document.body.style.overflow = ''; }
player.querySelector('.pclose').onclick = closePlayer;
player.addEventListener('click', e => { if (e.target === player) closePlayer(); });

// same order as the work list; The Next Chapter's exhibition build sits next to its first pixel build
const cards = [];
WORKS.forEach(w => {
  if (w.id === 'next-chapter') cards.push({ g: { label: 'The Next Chapter', href: w.links[0].href, external: true }, w });
  (w.play || []).forEach(g => cards.push({ g, w }));
});
const grid = $('#arcade');
const sketchImg = { 'Echo Corridor': 'assets/work/echo-corridor/play.jpg' };
cards.forEach(({ g, w }) => {
  const b = document.createElement(g.external ? 'a' : 'button');
  b.className = 'cab';
  if (g.external) { b.href = g.href; b.target = '_blank'; b.rel = 'noopener'; } else b.type = 'button';
  const src = sketchImg[g.label] || w.image;
  const scr = document.createElement('div'); scr.className = 'scr'; if (src) scr.dataset.src = src;
  let pc = null;
  if (src) { pc = FX.pixelImage(src, { start: 10 }); scr.append(pc); } else scr.append(drawCover(w.cover));
  b.append(scr); b.dataset.reveal = '';
  if (pc) { FX.hoverResolve(b, pc, 10); if (!canHover) sharpenOnView(b, pc); }
  b.insertAdjacentHTML('beforeend', `<b>${esc(g.label)}</b><span>${esc(w.unit.split(' · ')[0])} · ${esc(w.year)}</span><i>${g.external ? 'open ↗' : 'insert coin ▸'}</i>`);
  b.addEventListener('click', () => coin());
  if (!g.external) b.onclick = () => g.href === 'room/' ? window.open(g.href, '_blank', 'noopener') : openPlayer(g);
  grid.append(b);
});


/* ======================= about, contact ======================= */
const me = $('#me'); const big = scaleUp(spriteGirl(0, 0), 1); me.getContext('2d').drawImage(big, 0, 0);
let blink = 0; setInterval(() => { blink = (blink + 1) % 4; const x = me.getContext('2d'); x.clearRect(0, 0, 16, 28); x.drawImage(spriteGirl(0, blink === 3 ? 1 : 0), 0, 0); }, 900);
$('#inv').innerHTML = SKILLS.map(s => `<div data-k="${esc(s.k)}" tabindex="0" aria-label="${esc(s.k)}">${esc(s.n)}</div>`).join('');
function linksHTML() {
  const ls = PROFILE.links.slice(); if (PROFILE.email) ls.unshift({ label: PROFILE.email, href: 'mailto:' + PROFILE.email });
  return ls.map(l => `<a class="btn" href="${esc(l.href)}" ${/^http/.test(l.href) ? 'target="_blank" rel="noopener"' : ''}>${esc(l.label)} ▸</a>`).join('');
}
$('#links').innerHTML = linksHTML();
$('#links-top').innerHTML = linksHTML();

/* ======================= What We Carry: the 3D island ======================= */
let island = null;
window.mountIsland = create => {
  const host = $('#island'), wrap = host.parentElement;
  const go = () => {
    try { island = create(host, {
      night: room.night,
      onHover: (tag, x, y) => {
        const o = tag && room.find(tag);
        if (!o) { tip.classList.remove('on'); return; }
        tip.textContent = o.name; tip.style.left = x + 'px'; tip.style.top = (y - 18) + 'px'; tip.classList.add('on');
      },
      onSelect: tag => { const o = room.find(tag); if (o) { coin(); tip.classList.remove('on'); act(o); } },
      onFocus: tag => { $('#island-back').hidden = !tag; if (!tag) closeStory(); },
      onCarry: (list, full) => {
        const name = t => (room.find(t) || {}).name || t;
        $('#carry-count').textContent = full ? 'The box is full.' : `${list.length} of 5 packed. Click what you would carry.`;
        $('#carry-chips').innerHTML = list.map(t => `<button type="button" data-back="${esc(t)}" title="Put it back">${esc(name(t))} ×</button>`).join('');
        $('#carry-list').innerHTML = list.map(t => `<li>${esc(name(t))}</li>`).join('');
        $('#carry-card').hidden = !full; if (full) coin();
      }
    }); } catch (e) { wrap.querySelector('.island-fallback').hidden = false; host.remove(); return; }
    wrap.querySelectorAll('[data-orbit]').forEach(b => b.onclick = () => { const [t, p] = b.dataset.orbit.split(',').map(Number); island.orbit(t, p); });
    wrap.querySelectorAll('[data-zoom]').forEach(b => b.onclick = () => island.zoom(+b.dataset.zoom));
    wrap.querySelector('[data-reset]').onclick = () => island.reset();
    // ways to play
    const panel = $('#island-panel');
    wrap.querySelectorAll('[data-mode]').forEach(b => b.onclick = () => {
      const m = b.dataset.mode; coin();
      wrap.querySelectorAll('[data-mode]').forEach(x => x.setAttribute('aria-selected', String(x === b)));
      panel.querySelectorAll('[data-for]').forEach(d => d.hidden = d.dataset.for !== m);
      $('#carry-card').hidden = true; closeStory();
      if (m !== 'unpack') $('#island-unpack').value = 0;
      if (m === 'sun') { $('#island-hour').value = 13; $('#hour-label').textContent = '13:00'; }
      island.setMode(m);
      if (m === 'carry') { $('#carry-count').textContent = 'The box has room for five things. Click what you would carry.'; $('#carry-chips').innerHTML = ''; }
    });
    $('#island-unpack').oninput = e => island.setUnpack(e.target.value / 100);
    $('#island-hour').oninput = e => { const h = +e.target.value; island.setHour(h); $('#hour-label').textContent = `${Math.floor(h)}:${String(Math.round((h % 1) * 60)).padStart(2, '0').replace('60', '00')}`; };
    $('#island-back').onclick = () => { island.unfocus(); closeStory(); };
    $('#carry-chips').onclick = e => { const b = e.target.closest('[data-back]'); if (b) island.putBack(b.dataset.back); };
    $('#carry-again').onclick = () => { island.unpackAll(); $('#carry-card').hidden = true; };
  };
  // build it only when it is about to be seen
  new IntersectionObserver(([e], o) => { if (e.isIntersecting) { o.disconnect(); go(); } }, { rootMargin: '300px' }).observe(host);
};
$('#carry-read').onclick = () => openCase(WORKS.findIndex(w => w.id === 'my-room'));

/* ======================= portrait: pixels ↔ photo ======================= */
const mePhoto = FX.pixelImage(PROFILE.photo, { start: 22 });
$('#mephoto').append(mePhoto);
const slider = $('#pxslider');
slider.addEventListener('input', () => mePhoto.to(29 - +slider.value));
slider.value = 7; mePhoto.to(22);
new IntersectionObserver(([e], o) => { if (!e.isIntersecting) return; o.disconnect(); setTimeout(() => { mePhoto.to(1); slider.value = 28; }, 400); }, { threshold: .4 }).observe($('#mephoto'));

/* ======================= skills filter the work list ======================= */
const SKILLMAP = {
  'JavaScript': ['next-chapter', 'echo-corridor', 'my-room'], 'p5.js': ['next-chapter', 'echo-corridor'], 'Three.js': ['my-room'],
  'Figma': ['hith-brick', 'shopmirror'], 'Pixel art': ['next-chapter', 'echo-corridor', 'my-room'],
  'Interaction design': ['hith-brick', 'shopmirror', 'next-chapter', 'my-room'], 'Storyboarding': ['shopmirror', 'hith-brick'],
  'Game design': ['next-chapter', 'echo-corridor', 'my-room'], 'Photography': ['my-room', 'next-chapter'],
  'Type design': ['astrobius'], 'Research': ['shopmirror', 'hith-brick'], 'Print & zine': ['astrobius']
};
const filterEl = $('#filter');
function setFilter(k) {
  const ids = k ? SKILLMAP[k] || [] : null;
  document.querySelectorAll('.work').forEach(li => li.classList.toggle('dim', !!ids && !ids.includes(li.dataset.id)));
  document.querySelectorAll('#inv div').forEach(d => d.classList.toggle('sel', d.dataset.k === k));
  filterEl.hidden = !k; filterEl.innerHTML = k ? `${esc(k)} <button type="button" aria-label="Clear filter">×</button>` : '';
  if (k) { filterEl.querySelector('button').onclick = () => setFilter(null); $('#work').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' }); }
}
$('#inv').addEventListener('click', e => { const d = e.target.closest('[data-k]'); if (d) { coin(); setFilter(d.classList.contains('sel') ? null : d.dataset.k); } });
$('#inv').addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target.dataset.k) { e.preventDefault(); e.target.click(); } });

/* ======================= little sounds ======================= */
function tick() { window.Music && window.Music.tick(); }
let ac = null;
function coin() {
  try {
    ac = ac || new (window.AudioContext || window.webkitAudioContext)();
    [988, 1319].forEach((f, i) => { const t = ac.currentTime + i * .07, o = ac.createOscillator(), g = ac.createGain(); o.type = 'square'; o.frequency.value = f; g.gain.setValueAtTime(.04, t); g.gain.exponentialRampToValueAtTime(.0001, t + .12); o.connect(g).connect(ac.destination); o.start(t); o.stop(t + .14); });
  } catch (e) {}
}

/* ======================= page-wide effects ======================= */
FX.cursors();
FX.hpBar($('#hp'));
document.querySelectorAll('.horizon').forEach(h => FX.horizon(h));
document.querySelectorAll('#hello .w').forEach((w, i) => { w.style.setProperty('--d', i); FX.hop(w); });
FX.tilt($('#tilt'));
document.querySelectorAll('.cab').forEach(c => FX.tilt(c, 8));
FX.sparkles($('#intro'), $('#stars'));
FX.reveal();

setupDoor();
})();
