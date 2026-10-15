(function () {
'use strict';
const { Room, Walker, canvas, R, dither, ellipse, line, outline, spriteGirl } = window.PixelRoom;
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
// on a phone the room is wider than the screen: drift slowly across it, pause while touched
let holdPan = 0;
$('#stage').addEventListener('pointerdown', () => { holdPan = performance.now() + 6000; });
room.drawOverlay = (x, t) => { if (!reduced && narrow() && performance.now() > holdPan) room.pan(250 + Math.sin(t / 7000) * 150); };
addEventListener('scroll', () => tip.classList.remove('on'), { passive: true });

const dn = $('#daynight');
const syncSun = () => { dn.textContent = room.night ? '☀' : '☾'; document.documentElement.dataset.night = room.night ? '1' : ''; };
room.on('night', syncSun); syncSun();
dn.addEventListener('click', () => { room.setNight(!room.night); mini && mini.setNight(room.night); });

function act(o) {
  if (o.work) return openCase(WORKS.findIndex(w => w.id === o.work));
  const st = STORIES[o.group];
  if (!st) return;
  if (st.open === 'os') return openOS();
  if (st.toggle === 'night') { room.setNight(!room.night); mini && mini.setNight(room.night); }
  if (st.toggle === 'lamp') { room.lampOn = !room.lampOn; return; }
  if (st.toggle === 'door') { try { sessionStorage.removeItem('door'); } catch (e) {} location.hash = ''; location.reload(); return; }
  showStory(o, st);
}

/* ======================= story dialog ======================= */
const story = $('#story');
let typer = null;
function showStory(o, st) {
  room.focus = o;
  const p = $('#story-p'); p.innerHTML = '';
  const ids = st.photo || [];
  const sprite = new Image(); sprite.alt = '';
  if (ids.length) sprite.src = 'assets/sprites/' + (ids.includes(o.id) ? o.id : ids[0]) + '-big.png';
  else {
    // no photo: crop the live room around the object
    const pad = 6, sw = o.w + pad * 2, sh = o.h + pad * 2;
    const [c, x] = canvas(sw, sh); x.drawImage(room.base, o.x - pad, o.y - pad, sw, sh, 0, 0, sw, sh);
    sprite.src = c.toDataURL(); const k = Math.max(1, Math.floor(150 / Math.max(sw, sh)));
    sprite.style.width = sw * k + 'px'; sprite.style.maxWidth = 'none'; sprite.style.maxHeight = 'none';
  }
  p.append(sprite);
  if (ids.length) {
    const pid = ids.includes(o.id) ? o.id : ids[0];
    const flip = document.createElement('button'); flip.className = 'flip'; flip.type = 'button'; flip.textContent = 'photo';
    let photo = false;
    flip.onclick = () => { photo = !photo; sprite.className = photo ? 'photo' : ''; sprite.src = photo ? 'assets/photos/' + pid + '.jpg' : 'assets/sprites/' + pid + '-big.png'; flip.textContent = photo ? 'pixels' : 'photo'; };
    p.append(flip);
  }
  $('#story-t').textContent = st.title;
  const b = $('#story-b'); b.innerHTML = '';
  const acts = $('#story-a'); acts.innerHTML = '';
  if (st.toggle === 'night') { const btn = document.createElement('button'); btn.className = 'btn ghost'; btn.type = 'button'; btn.textContent = room.night ? 'Bring the sun back' : 'Wait for night'; btn.onclick = () => { room.setNight(!room.night); mini && mini.setNight(room.night); btn.textContent = room.night ? 'Bring the sun back' : 'Wait for night'; }; acts.append(btn); }
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
  { id: 'photos', label: 'Photos', c: '#ffd95a' },
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
    body.innerHTML = `<div class="about" style="grid-template-columns:160px 1fr"><div class="me frame" style="padding:14px"></div><div>${$('#about .about > div:last-child').innerHTML}</div></div>`;
    const c = spriteGirl(0, 0); const big = scaleUp(c, 6); big.style.width = '70%'; body.querySelector('.me').append(big);
    body.querySelectorAll('.kicker').forEach(k => k.remove());
  } else if (id === 'arcade') {
    body.innerHTML = '<div class="arcade"></div>';
    $('#arcade').querySelectorAll('.cab').forEach(c => { const n = c.cloneNode(true); const src = c; n.querySelectorAll('canvas').forEach(cv => cv.replaceWith(drawCover('myRoom'))); n.onclick = e => { if (n.tagName === 'BUTTON') { e.preventDefault(); src.click(); } }; body.firstChild.append(n); });
  } else if (id === 'photos') {
    body.innerHTML = '<div class="photos" style="grid-auto-flow:row;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));overflow:visible">' + $('#photos').innerHTML + '</div>';
  } else {
    body.innerHTML = `<h2 style="font-family:var(--display);font-size:52px;margin:0 0 24px">Say hello.</h2><div class="links" style="display:flex;gap:18px;flex-wrap:wrap">${linksHTML()}</div>`;
  }
}

/* ======================= work list + case studies ======================= */
function coverEl(w) {
  if (w.image) { const i = new Image(); i.src = w.image; i.alt = ''; i.style.objectFit = 'cover'; i.style.imageRendering = 'auto'; return i; }
  const c = drawCover(w.cover); return c;
}
function scaleUp(src, k) { const [c, x] = canvas(src.width * k, src.height * k); x.imageSmoothingEnabled = false; x.drawImage(src, 0, 0, c.width, c.height); return c; }
const list = $('#works');
WORKS.forEach((w, i) => {
  const li = document.createElement('li'); li.className = 'work';
  li.innerHTML = `<button type="button"><span class="n">${String(i + 1).padStart(2, '0')}</span><span class="t">${esc(w.title)}</span><span class="m">${esc(w.kind)}<br>${esc(w.year)}</span><span class="s">${esc(w.summary)}</span></button>`;
  const mc = coverEl(w); mc.classList.add('mcover'); li.querySelector('.s').after(mc);
  li.querySelector('button').addEventListener('click', () => openCase(i));
  li.addEventListener('pointerenter', () => showPeek(w));
  li.addEventListener('pointerleave', () => peek.classList.remove('on'));
  list.append(li);
});
const peek = $('#peek');
function showPeek(w) { peek.innerHTML = ''; peek.append(coverEl(w)); peek.classList.add('on'); }
addEventListener('pointermove', e => { peek.style.left = (e.clientX + 200) + 'px'; peek.style.top = e.clientY + 'px'; }, { passive: true });

const caseEl = $('#case');
let lastFocus = null;
function openCase(i) {
  const w = WORKS[i]; lastFocus = document.activeElement;
  const next = WORKS[(i + 1) % WORKS.length], prev = WORKS[(i + WORKS.length - 1) % WORKS.length];
  caseEl.innerHTML = `<button class="btn ghost close" type="button">Close ×</button>
  <div class="in">
    <div class="cv"></div>
    <h2>${esc(w.title)}</h2>
    <p class="lede">${esc(w.summary)}</p>
    <div class="cols">
      <dl>
        <dt>Unit</dt><dd>${esc(w.unit)}</dd>
        <dt>Year</dt><dd>${esc(w.year)}</dd>
        <dt>Role</dt><dd>${esc(w.role)}</dd>
        <dt>Tools</dt><dd>${w.tools.map(esc).join('<br>')}</dd>
        ${w.credits ? `<dt>Team</dt><dd>${esc(w.credits).replace(/ · /g, '<br>')}</dd>` : ''}
      </dl>
      <div class="body">${w.body.map(p => `<p>${esc(p)}</p>`).join('')}
        ${w.play ? `<div class="plays">${w.play.map((g, k) => `<button class="btn" type="button" data-play="${k}">Play ${esc(g.label)} here ▸</button>`).join('')}</div>` : ''}
        ${w.links.length ? `<p style="display:flex;gap:18px;flex-wrap:wrap;margin-top:30px">${w.links.map(l => `<a class="btn" href="${esc(l.href)}" ${/^http/.test(l.href) ? 'target="_blank" rel="noopener"' : ''}>${esc(l.label)} ▸</a>`).join('')}</p>` : ''}
      </div>
    </div>
    ${w.gallery && w.gallery.length ? `<div class="gallery${w.tall ? ' tall' : ''}">${w.gallery.map(src => `<a href="${esc(src)}" target="_blank" rel="noopener"><img src="${esc(src)}" alt="" loading="lazy"></a>`).join('')}</div>` : ''}
    <div class="nav2"><button class="btn ghost" type="button" data-go="${(i + WORKS.length - 1) % WORKS.length}">◂ ${esc(prev.title)}</button><button class="btn ghost" type="button" data-go="${(i + 1) % WORKS.length}">${esc(next.title)} ▸</button></div>
  </div>`;
  const cv = coverEl(w); cv.classList.add('cover'); caseEl.querySelector('.cv').append(cv);
  caseEl.hidden = false; caseEl.scrollTop = 0; document.body.style.overflow = 'hidden';
  caseEl.querySelector('.close').onclick = closeCase;
  caseEl.querySelectorAll('[data-go]').forEach(b => b.onclick = () => openCase(+b.dataset.go));
  caseEl.querySelectorAll('[data-play]').forEach(b => b.onclick = () => openPlayer(w.play[+b.dataset.play]));
  caseEl.querySelector('.close').focus();
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

const PLAYABLE = [];
WORKS.forEach(w => (w.play || []).forEach(g => PLAYABLE.push({ g, w })));
const ext = WORKS.find(w => w.id === 'next-chapter');
const grid = $('#arcade');
const cards = [{ g: { label: 'The Next Chapter', href: ext.links[0].href, external: true }, w: ext }].concat(PLAYABLE);
const sketchImg = { Ribbon: 'assets/work/sketches/ribbon.jpg', Painting: 'assets/work/sketches/painting.jpg', Snake: 'assets/work/sketches/snake.jpg', 'Echo Corridor': 'assets/work/echo-corridor/play.jpg' };
cards.forEach(({ g, w }) => {
  const b = document.createElement(g.external ? 'a' : 'button');
  b.className = 'cab';
  if (g.external) { b.href = g.href; b.target = '_blank'; b.rel = 'noopener'; } else b.type = 'button';
  const src = sketchImg[g.label] || w.image;
  const scr = document.createElement('div'); scr.className = 'scr';
  if (src) { const i = new Image(); i.src = src; i.alt = ''; i.loading = 'lazy'; scr.append(i); } else scr.append(drawCover(w.cover));
  b.append(scr);
  b.insertAdjacentHTML('beforeend', `<b>${esc(g.label)}</b><span>${esc(w.unit.split(' · ')[0])} · ${esc(w.year)}</span><i>${g.external ? 'open ↗' : 'insert coin ▸'}</i>`);
  if (!g.external) b.onclick = () => g.href === 'room/' ? window.open(g.href, '_blank', 'noopener') : openPlayer(g);
  grid.append(b);
});
$('#photos').innerHTML = PHOTOS.map(src => `<a href="${esc(src)}" target="_blank" rel="noopener"><img src="${esc(src)}" alt="" loading="lazy"></a>`).join('');

/* ======================= about, contact ======================= */
const me = $('#me'); const big = scaleUp(spriteGirl(0, 0), 1); me.getContext('2d').drawImage(big, 0, 0);
let blink = 0; setInterval(() => { blink = (blink + 1) % 4; const x = me.getContext('2d'); x.clearRect(0, 0, 16, 28); x.drawImage(spriteGirl(0, blink === 3 ? 1 : 0), 0, 0); }, 900);
$('#inv').innerHTML = SKILLS.map(s => `<div data-k="${esc(s.k)}" tabindex="0" aria-label="${esc(s.k)}">${esc(s.n)}</div>`).join('');
function linksHTML() {
  const ls = PROFILE.links.slice(); if (PROFILE.email) ls.unshift({ label: PROFILE.email, href: 'mailto:' + PROFILE.email });
  return ls.map(l => `<a class="btn" href="${esc(l.href)}" ${/^http/.test(l.href) ? 'target="_blank" rel="noopener"' : ''}>${esc(l.label)} ▸</a>`).join('');
}
$('#links').innerHTML = linksHTML();

/* ======================= the little game preview ======================= */
let mini = null;
const miniHost = $('#mini');
const io = new IntersectionObserver(es => {
  es.forEach(e => {
    if (!e.isIntersecting || mini) return;
    mini = new Room(miniHost, { interactive: false, night: room.night, focusX: 250 });
    const g = new Walker(110, 236); mini.actors.push(g);
    const route = [[110, 236], [205, 240], [300, 214], [300, 262], [430, 264], [300, 262], [120, 206], [60, 250]];
    let k = 1, last = 0;
    mini.drawOverlay = (x, t) => {
      const dt = Math.min(50, t - last || 16); last = t;
      const [tx, ty] = route[k]; const dx = tx - g.x, dy = ty - g.y;
      if (Math.hypot(dx, dy) < 2) { k = (k + 1) % route.length; g.step(0, 0, dt); } else g.step(dx, dy, dt);
    };
  });
}, { rootMargin: '200px' });
io.observe(miniHost);

/* top bar turns solid over the light sections */
const bar = $('#top');
const heroIO = new IntersectionObserver(([e]) => bar.classList.toggle('solid', !e.isIntersecting), { threshold: .05 });
heroIO.observe($('#room'));

room.ready.then(() => {
  // the cover for "My Room" is drawn from the live room once it exists
  setTimeout(() => {
    const w = WORKS.find(w => w.cover === 'myRoom');
    document.querySelectorAll('.work').forEach((li, i) => { if (WORKS[i] === w) { const old = li.querySelector('.mcover'); const n = drawCover('myRoom'); n.classList.add('mcover'); old.replaceWith(n); } });
  }, 300);
});

setupDoor();
})();
