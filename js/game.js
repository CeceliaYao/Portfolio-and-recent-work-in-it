/* My Room: Objects I Carry — walk, look, remember. */
(function () {
'use strict';
const { Room, Walker, canvas, blocked } = window.PixelRoom;
const { STORIES, WORKS } = window.SITE;
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

const GOALS = ['computer', 'trail', 'play', 'scent', 'plush', 'fridge', 'cocktail', 'bar', 'plants', 'view', 'water'];
const found = new Set();
let playing = false, talking = false;

const room = new Room($('#stage'), { contain: innerWidth > innerHeight, focusX: 230 });
const girl = new Walker(70, 232);
room.actors.push(girl);

/* where you stand to look at each thing (feet position) */
function standPoint(o) {
  const cx = o.x + o.w / 2;
  if (['window', 'catpot', 'succulent', 'kitty'].includes(o.id)) return [Math.min(456, Math.max(330, cx)), 263];
  let y = Math.max(204, Math.min(262, o.y + o.h + 4));
  if (o.id === 'water') y = 206;
  let x = cx;
  for (let k = 0; k < 40 && blocked(x, y); k++) y += 2;
  return [x, y];
}
let near = null, target = null, pending = null, route = [];
/* the bed is the only real obstacle: go round its foot */
function routeTo(tx, ty) {
  const bedSide = x => x > 316;
  route = [];
  if (bedSide(tx) !== bedSide(girl.x) && (ty > 255 || girl.y > 255)) route.push([308, 263], [330, 263]);
  if (!bedSide(tx) && bedSide(girl.x)) route = [[330, 263], [308, 263]];
  route.push([tx, ty]);
  target = route.shift();
}
function nearest() {
  let best = null, bd = 30;
  for (const o of room.objects) {
    if (!o.img || (!STORIES[o.group] && !o.work)) continue;
    const [sx, sy] = standPoint(o);
    const d = Math.hypot((girl.x - sx) * .8, girl.y - sy);
    if (d < bd) { bd = d; best = o; }
  }
  return best;
}

/* ---------- input ---------- */
const keys = new Set();
addEventListener('keydown', e => {
  if (e.target.closest && e.target.closest('input,textarea')) return;
  const k = e.key.toLowerCase();
  if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) e.preventDefault();
  if (!playing) { if (k === 'enter' || k === ' ') start(); return; }
  if (talking) { if (e.repeat) return; if (k === 'escape' || k === 'e' || k === ' ' || k === 'enter') { story._finish && typer ? story._finish() : closeStory(); } return; }
  if (k === 'e' || k === ' ' || k === 'enter') { if (near) look(near); return; }
  if (k === 'n') toggleNight();
  if (k === 'm') toggleSound();
  keys.add(k); target = null; route = [];
});
addEventListener('keyup', e => keys.delete(e.key.toLowerCase()));
addEventListener('blur', () => keys.clear());
room.on('select', o => { if (!playing || talking) return; const [sx, sy] = standPoint(o); routeTo(sx, sy); pending = o; });
$('#stage').addEventListener('click', e => {
  if (!playing || talking) return;
  const [ax, ay] = room.toArt(e.clientX, e.clientY);
  if (room.pick(ax, ay)) return;
  if (ay > 190) { routeTo(ax, Math.max(200, ay)); pending = null; }
});
const tip = $('#tip');
room.on('hover', o => {
  if (!o) return tip.classList.remove('on');
  tip.textContent = o.name; const [sx, sy] = room.toScreen(o.x + o.w / 2, o.y);
  tip.style.left = sx + 'px'; tip.style.top = (sy - 8) + 'px'; tip.classList.add('on');
});

/* ---------- loop: runs inside the room's frame ---------- */
let last = 0;
const prompt = $('#prompt');
room.drawOverlay = (x, t) => {
  const dt = Math.min(50, t - last || 16); last = t;
  if (!playing || talking) { girl.step(0, 0, dt); return; }
  let dx = 0, dy = 0;
  if (keys.has('arrowleft') || keys.has('a')) dx -= 1;
  if (keys.has('arrowright') || keys.has('d')) dx += 1;
  if (keys.has('arrowup') || keys.has('w')) dy -= 1;
  if (keys.has('arrowdown') || keys.has('s')) dy += 1;
  if (!dx && !dy && target) {
    const ox = girl.x, oy = girl.y;
    dx = target[0] - girl.x; dy = target[1] - girl.y;
    const arrive = () => {
      if (route.length) { target = route.shift(); return; }
      target = null;
      if (pending && (nearest() === pending || Math.hypot(dx, dy) < 2)) { const p = pending; pending = null; look(p); } else pending = null;
    };
    if (Math.hypot(dx, dy) < 2) { girl.step(0, 0, dt); arrive(); }
    else { girl.step(dx, dy, dt); if (Math.hypot(girl.x - ox, girl.y - oy) < .075 * dt * .3) { stuck += dt; if (stuck > 250) { stuck = 0; route = []; arrive(); } } else stuck = 0; }
  } else girl.step(dx, dy, dt);
  if (girl.moving && ((t / 280) | 0) !== stepBeat) { stepBeat = (t / 280) | 0; blip(140 + Math.random() * 30, .03, 'triangle', .04); }
  room.pan(girl.x);
  near = nearest(); room.focus = near;
  if (near) {
    const [sx, sy] = room.toScreen(near.x + near.w / 2, near.y);
    prompt.textContent = (matchMedia('(hover:none)').matches ? 'tap ' : 'E  ') + near.name;
    prompt.style.left = sx + 'px'; prompt.style.top = (sy - 10) + 'px'; prompt.classList.add('on');
  } else prompt.classList.remove('on');
};
let stepBeat = 0, stuck = 0;

/* ---------- looking at things ---------- */
const story = $('#story');
let typer = null;
function look(o) {
  if (o.work) return showWork(o);
  const st = STORIES[o.group]; if (!st) return;
  if (st.toggle === 'lamp') { room.lampOn = !room.lampOn; blip(520, .08, 'square', .05); return; }
  if (st.toggle === 'door') return showDoor();
  const lines = st.lines.slice();
  const acts = [];
  if (o.group === 'computer') { lines[0] = 'Everything I have made lives in here.'; acts.push(`<a class="btn" href="../#work">Open my work ▸</a>`); }
  if (st.toggle === 'night') acts.push(`<button class="btn ghost" type="button" data-night>${room.night ? 'Bring the sun back' : 'Wait for night'}</button>`);
  openStory(o, st.title, lines, acts.join(''), st.photo);
  discover(o);
}
function showWork(o) {
  const w = WORKS.find(w => w.id === o.work);
  openStory(o, w.title, [w.summary, w.unit + ' · ' + w.year], `<a class="btn" href="../#work" >Read more ▸</a>${w.links.filter(l => /^http/.test(l.href)).map(l => `<a class="btn ghost" href="${esc(l.href)}" target="_blank" rel="noopener">${esc(l.label)} ▸</a>`).join('')}`);
}
function showDoor() {
  const left = GOALS.length - found.size;
  const o = room.find('door');
  openStory(o, 'Leaving already?', [left ? `There ${left === 1 ? 'is' : 'are'} still ${left} thing${left === 1 ? '' : 's'} you haven't looked at.` : 'You have seen everything in here.'], `<a class="btn" href="../">Back to the homepage ▸</a>`);
}
function openStory(o, title, lines, actsHTML, photo) {
  talking = true; keys.clear(); target = null; prompt.classList.remove('on');
  const p = $('#story-p'); p.innerHTML = '';
  const img = new Image(); img.alt = '';
  if (photo && photo.length) {
    const pid = photo.includes(o.id) ? o.id : photo[0];
    img.src = '../assets/sprites/' + pid + '-big.png';
    const flip = document.createElement('button'); flip.type = 'button'; flip.className = 'flip'; flip.textContent = 'photo';
    let ph = false;
    flip.onclick = () => { ph = !ph; img.className = ph ? 'photo' : ''; img.src = ph ? '../assets/photos/' + pid + '.jpg' : '../assets/sprites/' + pid + '-big.png'; flip.textContent = ph ? 'pixels' : 'photo'; };
    p.append(img, flip);
  } else {
    const pad = 6, sw = o.w + pad * 2, sh = o.h + pad * 2;
    const [c, x] = canvas(sw, sh); x.drawImage(room.base, o.x - pad, o.y - pad, sw, sh, 0, 0, sw, sh);
    img.src = c.toDataURL(); const k = Math.max(1, Math.floor(150 / Math.max(sw, sh)));
    img.style.width = sw * k + 'px'; img.style.maxWidth = 'none'; img.style.maxHeight = 'none';
    p.append(img);
  }
  $('#story-t').textContent = title;
  $('#story-a').innerHTML = actsHTML || '';
  const nb = $('#story-a [data-night]');
  if (nb) nb.onclick = () => { toggleNight(); nb.textContent = room.night ? 'Bring the sun back' : 'Wait for night'; };
  story.hidden = false;
  const b = $('#story-b'); b.innerHTML = '';
  clearInterval(typer);
  const finish = () => { clearInterval(typer); typer = null; b.innerHTML = lines.map(l => '<p>' + esc(l) + '</p>').join(''); };
  story._finish = finish;
  blip(660, .06, 'square', .05); setTimeout(() => blip(880, .06, 'square', .04), 70);
  if (reduced) return finish();
  let li = 0, ci = 0, cur = null;
  typer = setInterval(() => {
    if (!cur) { cur = document.createElement('p'); b.append(cur); }
    cur.textContent = lines[li].slice(0, ++ci);
    if (ci % 3 === 0) blip(300 + Math.random() * 80, .02, 'square', .015);
    if (ci >= lines[li].length) { li++; ci = 0; cur = null; if (li >= lines.length) { clearInterval(typer); typer = null; } }
  }, 18);
}
function closeStory() {
  story.hidden = true; talking = false; clearInterval(typer); typer = null;
  if (found.size === GOALS.length && !ended) { ended = true; setTimeout(showEnd, 300); }
}
story.querySelector('.x').addEventListener('click', closeStory);
story.addEventListener('click', e => { if (typer && !e.target.closest('button,a')) story._finish(); });

/* ---------- the bag ---------- */
const bag = $('#bag');
bag.innerHTML = GOALS.map(g => `<div data-g="${g}" title="?"></div>`).join('');
function iconFor(g) {
  const st = STORIES[g];
  if (st.photo) return '../assets/sprites/' + st.photo[0] + '.png';
  const o = room.objects.find(o => o.group === g);
  const pad = 2, sw = o.w + pad * 2, sh = o.h + pad * 2;
  const [c, x] = canvas(sw, sh); x.drawImage(room.base, o.x - pad, o.y - pad, sw, sh, 0, 0, sw, sh);
  return c.toDataURL();
}
function discover(o) {
  if (!GOALS.includes(o.group) || found.has(o.group)) return;
  found.add(o.group);
  const slot = bag.querySelector(`[data-g="${o.group}"]`);
  const img = new Image(); img.src = iconFor(o.group); img.alt = STORIES[o.group].title;
  img.onload = () => { const k = Math.min(36 / img.naturalHeight, 40 / img.naturalWidth); img.style.width = img.naturalWidth * k + 'px'; img.style.height = img.naturalHeight * k + 'px'; };
  slot.title = STORIES[o.group].title; slot.append(img); slot.classList.add('new');
  $('#count').textContent = found.size + ' / ' + GOALS.length;
  setTimeout(() => { blip(784, .08, 'square', .05); blip(1046, .12, 'square', .05, .09); }, 200);
}
let ended = false;
function showEnd() {
  $('#carry').innerHTML = GOALS.map(g => `<div title="${esc(STORIES[g].title)}"><img src="${iconFor(g)}" alt="${esc(STORIES[g].title)}"></div>`).join('');
  $('#end').hidden = false; playing = false;
  [523, 659, 784, 1046].forEach((f, i) => blip(f, .14, 'square', .05, i * .12));
}
$('#stay').onclick = () => { $('#end').hidden = true; playing = true; };

/* ---------- sound: a few square-wave blips ---------- */
let ac = null, soundOn = true;
function blip(f, d, type, vol, delay) {
  if (!soundOn) return;
  try {
    ac = ac || new (window.AudioContext || window.webkitAudioContext)();
    const t = ac.currentTime + (delay || 0), o = ac.createOscillator(), g = ac.createGain();
    o.type = type || 'square'; o.frequency.value = f; g.gain.setValueAtTime(vol || .05, t); g.gain.exponentialRampToValueAtTime(.0001, t + d);
    o.connect(g).connect(ac.destination); o.start(t); o.stop(t + d + .02);
  } catch (e) {}
}
function toggleSound() { soundOn = !soundOn; $('#sound').setAttribute('aria-pressed', String(soundOn)); }
function toggleNight() { room.setNight(!room.night); }
$('#sound').setAttribute('aria-pressed', 'true');
$('#sound').onclick = toggleSound;
$('#night').onclick = toggleNight;
room.on('night', n => $('#night').textContent = n ? '☀' : '☾');
$('#night').textContent = room.night ? '☀' : '☾';

/* ---------- start ---------- */
function start() { if (playing) return; $('#title').hidden = true; playing = true; blip(440, .08); blip(660, .1, 'square', .05, .08); }
$('#start').onclick = start;
addEventListener('resize', () => { room.opts.contain = innerWidth > innerHeight; room.fit(); });
})();
