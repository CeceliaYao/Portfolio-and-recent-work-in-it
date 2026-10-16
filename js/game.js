/* My Room, from What We Carry: three tiny games in my room.
   Find twelve things, What's missing? (a memory game) and Pack five (choose what to carry). */
(function () {
'use strict';
const { Room, canvas } = window.PixelRoom;
const { STORIES, WORKS } = window.SITE;
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

const GOALS = ['computer', 'trail', 'beads', 'jade', 'art', 'bar', 'scent', 'play', 'plants', 'photos', 'plush', 'view'];
const found = new Set();
let playing = false, talking = false, ended = false;

const room = new Room($('#stage'), { contain: innerWidth > innerHeight, focusX: 230 });

/* ---------- hints: a sparkle drifts over something you haven't looked at yet ---------- */
let sparkle = null, sparkleT = 0;
room.drawOverlay = (x, t) => {
  if (!playing || talking) return;
  if (!sparkle || t - sparkleT > 4200) {
    const left = room.objects.filter(o => o.img && GOALS.includes(o.group) && !found.has(o.group));
    sparkle = left.length ? left[(Math.random() * left.length) | 0] : null; sparkleT = t;
  }
  if (sparkle) {
    const k = ((t - sparkleT) / 160) | 0, a = k % 8 < 4;
    const sx = sparkle.x + sparkle.w - 2, sy = sparkle.y - 2 - (k % 4 === 1 ? 1 : 0);
    x.fillStyle = '#fff6cf';
    if (a) { x.fillRect(sx, sy - 2, 1, 5); x.fillRect(sx - 2, sy, 5, 1); } else x.fillRect(sx, sy, 1, 1);
  }
};

/* ---------- input ---------- */
room.on('select', o => { if (playing && !talking) look(o); });
const tip = $('#tip');
room.on('hover', o => {
  if (!o) return tip.classList.remove('on');
  tip.textContent = (found.has(o.group) ? '✓ ' : '') + o.name; const [sx, sy] = room.toScreen(o.x + o.w / 2, o.y);
  tip.style.left = sx + 'px'; tip.style.top = (sy - 8) + 'px'; tip.classList.add('on');
});
addEventListener('keydown', e => {
  const k = e.key.toLowerCase();
  if (!playing) { if ((k === 'enter' || k === ' ') && !$('#title').hidden && document.activeElement === document.body) { e.preventDefault(); start(); } return; }
  if (talking) { if (e.repeat) return; if (k === 'escape' || k === 'enter' || k === ' ') { e.preventDefault(); story._finish && typer ? story._finish() : closeStory(); } return; }
  if (k === 'n') toggleNight();
  if (k === 'm') toggleSound();
});
// on a phone the room is wider than the screen: drag to look around
let drag = null;
$('#stage').addEventListener('pointerdown', e => { drag = { x: e.clientX, f: room.focusX || 230 }; });
addEventListener('pointerup', () => { drag = null; });
addEventListener('pointermove', e => {
  if (!drag || room.opts.contain) return;
  room.focusX = Math.max(0, Math.min(480, drag.f - (e.clientX - drag.x) / room.scale));
});
(function pan() { if (!room.opts.contain) room.pan(room.focusX || 230); requestAnimationFrame(pan); })();

/* ---------- looking at things ---------- */
const story = $('#story');
let typer = null;
function look(o) {
  if (o.work) return showWork(o);
  const st = STORIES[o.group]; if (!st) return;
  if (st.toggle === 'lamp') { room.lampOn = !room.lampOn; blip(520, .08, 'square', .05); return; }
  if (st.toggle === 'door') return showDoor();
  const acts = [];
  if (o.group === 'computer') acts.push(`<a class="btn" href="../#work">Open my work ▸</a>`);
  if (st.toggle === 'night') acts.push(`<button class="btn ghost" type="button" data-night>${room.night ? 'Bring the sun back' : 'Wait for night'}</button>`);
  openStory(o, st, st.title, st.lines.slice(), acts.join(''));
  discover(o);
}
function showWork(o) {
  const w = WORKS.find(w => w.id === o.work);
  openStory(o, {}, w.title, [w.summary, w.unit + ' · ' + w.year], `<a class="btn" href="../#work">Read more ▸</a>`);
}
function showDoor() {
  const left = GOALS.length - found.size;
  openStory(room.find('door'), {}, 'Leaving already?', [left ? `There ${left === 1 ? 'is' : 'are'} still ${left} thing${left === 1 ? '' : 's'} you haven't looked at.` : 'You have seen everything in here.'], `<a class="btn" href="../">Back to the homepage ▸</a>`);
}
function openStory(o, st, title, lines, actsHTML) {
  talking = true; room.focus = o; tip.classList.remove('on');
  window.StoryPortrait($('#story-p'), o, st, room, '../');
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
  story.hidden = true; talking = false; room.focus = null; clearInterval(typer); typer = null;
  if (found.size === GOALS.length && !ended) { ended = true; setTimeout(showEnd, 300); }
}
story.querySelector('.x').addEventListener('click', closeStory);
story.addEventListener('click', e => { if (typer && !e.target.closest('button,a')) story._finish(); });

/* ---------- the bag ---------- */
const bag = $('#bag');
bag.innerHTML = GOALS.map(g => `<div data-g="${g}" title="?"></div>`).join('');
function iconFor(g) {
  const o = room.objects.find(o => o.group === g);
  return o.img.toDataURL ? o.img.toDataURL() : o.img.src;
}
function discover(o) {
  if (!GOALS.includes(o.group) || found.has(o.group)) return;
  found.add(o.group);
  const slot = bag.querySelector(`[data-g="${o.group}"]`);
  const img = new Image(); img.src = iconFor(o.group); img.alt = STORIES[o.group].title;
  img.onload = () => { const k = Math.min(34 / img.naturalHeight, 38 / img.naturalWidth); img.style.width = img.naturalWidth * k + 'px'; img.style.height = img.naturalHeight * k + 'px'; };
  slot.title = STORIES[o.group].title; slot.append(img); slot.classList.add('new');
  $('#count').textContent = found.size + ' / ' + GOALS.length;
  sparkle = null;
  setTimeout(() => { blip(784, .08, 'square', .05); blip(1046, .12, 'square', .05, .09); }, 200);
}
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

/* ---------- more games: What's missing? and Pack five ---------- */
// things that can go missing or be packed: every object with its own drawing, apart from the window and door
const POOL = ['visor', 'backpack', 'poles', 'perfume', 'penguin', 'lamp', 'ps5', 'picasso', 'beads', 'jade', 'whisky', 'bourbon', 'gin', 'catpot', 'succulent', 'kitty', 'water', 'photos'];
let mode = 'find';
const toast = $('#toast');
function say(t, ms) { toast.textContent = t; toast.hidden = false; clearTimeout(say.t); if (ms) say.t = setTimeout(() => toast.hidden = true, ms); }
const nameOf = id => room.find(id).name;
const iconOf = id => { const o = room.find(id); return o.img.toDataURL ? o.img.toDataURL() : o.img.src; };
const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
function showAll() { room.objects.forEach(o => { o.hidden = false; }); }
function result(k, h, ids, p) {
  $('#result-k').textContent = k; $('#result-h').textContent = h; $('#result-p').textContent = p;
  $('#result-icons').innerHTML = ids.map(id => `<div title="${esc(nameOf(id))}"><img src="${iconOf(id)}" alt="${esc(nameOf(id))}"></div>`).join('');
  $('#result').hidden = false;
}
function resetModes() {
  clearTimeout(miss.timer); clearInterval(miss.tick); $('#choices').hidden = true; $('#box').hidden = true; toast.hidden = true;
  $('#result').hidden = true; showAll(); packed.length = 0; drawSlots();
}
function menu() { resetModes(); closeStory(); playing = false; mode = 'find'; $('#bag').hidden = false; $('#title').hidden = false; }
$('#menu').onclick = menu;
$('#to-menu').onclick = menu;
$('#again').onclick = () => { $('#result').hidden = true; mode === 'missing' ? startMissing() : startPack(); };

/* What's missing? look, blink, one thing is gone, pick it from four */
const miss = { round: 0, score: 0, gone: null, used: [], timer: 0, tick: 0 };
function startMissing() {
  resetModes(); $('#title').hidden = true; $('#bag').hidden = true; mode = 'missing'; playing = false;
  Object.assign(miss, { round: 0, score: 0, gone: null, used: [] });
  nextRound();
}
function nextRound() {
  showAll(); $('#choices').hidden = true;
  if (miss.round >= 5) return endMissing();
  miss.round++;
  $('#count').textContent = `round ${miss.round} / 5`;
  let left = 4 - Math.min(2, miss.round - 1);   // a little less time to look each round
  say(`Remember the room… ${left}`);
  miss.tick = setInterval(() => { left--; if (left > 0) say(`Remember the room… ${left}`); }, 1000);
  miss.timer = setTimeout(() => { clearInterval(miss.tick); vanish(); }, left * 1000);
  blip(523, .08, 'square', .04);
}
function vanish() {
  const blink = $('#blink'); blink.classList.remove('on'); void blink.offsetWidth; blink.classList.add('on');
  blip(196, .25, 'triangle', .06);
  setTimeout(() => {
    const pool = POOL.filter(id => !miss.used.includes(id));
    miss.gone = pool[(Math.random() * pool.length) | 0]; miss.used.push(miss.gone);
    room.find(miss.gone).hidden = true;
    const opts = shuffle([miss.gone, ...shuffle(POOL.filter(id => id !== miss.gone)).slice(0, 3)]);
    $('#opts').innerHTML = opts.map(id => `<button type="button" data-id="${id}"><img src="${iconOf(id)}" alt=""><span>${esc(nameOf(id))}</span></button>`).join('');
    $('#choices-q').textContent = 'Something is gone. What was it?';
    $('#choices').hidden = false; say('Look closely…', 1500);
  }, 260);
}
$('#opts').addEventListener('click', e => {
  const b = e.target.closest('[data-id]'); if (!b || $('#opts').dataset.lock) return;
  const right = b.dataset.id === miss.gone; $('#opts').dataset.lock = '1';
  b.classList.add(right ? 'right' : 'wrong'); $('#opts').querySelector(`[data-id="${miss.gone}"]`).classList.add('right');
  if (right) { miss.score++; blip(784, .08, 'square', .05); blip(1046, .12, 'square', .05, .09); } else blip(220, .2, 'square', .05);
  $('#choices-q').textContent = right ? `Yes, the ${nameOf(miss.gone).toLowerCase()}.` : `It was the ${nameOf(miss.gone).toLowerCase()}.`;
  room.find(miss.gone).hidden = false; room.focus = room.find(miss.gone);
  setTimeout(() => { delete $('#opts').dataset.lock; room.focus = null; nextRound(); }, 1600);
});
function endMissing() {
  $('#count').textContent = `${miss.score} / 5`; toast.hidden = true;
  const line = miss.score === 5 ? 'You know this room as well as I do.' : miss.score >= 3 ? 'Some things stay with you, some slip away.' : 'Rooms are easy to forget. That is why I keep the things.';
  result('What\'s missing?', `${miss.score} of 5 remembered`, miss.used, line);
  [523, 659, 784].forEach((f, i) => blip(f, .12, 'square', .05, i * .1));
}
$('#start-missing').onclick = startMissing;

/* Pack five: click the things you'd carry; they leave the room and go into the box */
const packed = [];
function drawSlots() {
  $('#slots').innerHTML = Array.from({ length: 5 }, (_, i) => packed[i] ? `<button type="button" data-id="${packed[i]}" title="Put back: ${esc(nameOf(packed[i]))}"><img src="${iconOf(packed[i])}" alt="${esc(nameOf(packed[i]))}"></button>` : '<div></div>').join('');
  $('#pack-done').hidden = packed.length < 5;
  if (mode === 'pack') $('#count').textContent = `${packed.length} / 5 packed`;
}
function startPack() {
  resetModes(); $('#title').hidden = true; $('#bag').hidden = true; mode = 'pack'; playing = false;
  $('#box').hidden = false; drawSlots(); say('The box only fits five things. Click what you would carry.', 4000);
}
function packIt(o) {
  if (!POOL.includes(o.id) || packed.includes(o.id)) return;
  if (packed.length >= 5) { say('The box is full. Click something in the box to put it back.', 2500); blip(220, .15, 'square', .04); return; }
  // fly a copy of the drawing from the room down into the box
  const [sx, sy] = room.toScreen(o.x, o.y), fly = new Image(); fly.src = iconOf(o.id); fly.className = 'fly';
  fly.style.left = sx + 'px'; fly.style.top = sy + 'px'; fly.style.width = o.w * room.scale + 'px';
  document.body.append(fly);
  const slot = $('#slots').children[packed.length].getBoundingClientRect();
  requestAnimationFrame(() => { fly.style.transform = `translate(${slot.left - sx}px, ${slot.top - sy}px) scale(${36 / (o.w * room.scale)})`; fly.style.opacity = .3; });
  setTimeout(() => fly.remove(), 650);
  o.hidden = true; packed.push(o.id); tip.classList.remove('on');
  setTimeout(drawSlots, 600); blip(660, .06, 'square', .05);
}
$('#slots').addEventListener('click', e => {
  const b = e.target.closest('[data-id]'); if (!b) return;
  packed.splice(packed.indexOf(b.dataset.id), 1); room.find(b.dataset.id).hidden = false; drawSlots(); blip(440, .06, 'square', .04);
});
$('#pack-done').onclick = () => {
  const left = POOL.length - packed.length;
  result('Pack five', 'What I would carry', packed.slice(), `${left} things stay behind in the room. The memory box only has room for so much.`);
  [523, 659, 784, 1046].forEach((f, i) => blip(f, .12, 'square', .05, i * .1));
};
$('#start-pack').onclick = startPack;
room.on('select', o => { if (mode === 'pack' && !$('#box').hidden && $('#result').hidden) packIt(o); });

/* ---------- start ---------- */
function start() { if (playing) return; resetModes(); mode = 'find'; $('#bag').hidden = false; $('#title').hidden = true; playing = true; $('#count').textContent = '0 / ' + GOALS.length; blip(440, .08); blip(660, .1, 'square', .05, .08); }
$('#start').onclick = start;
addEventListener('resize', () => { room.opts.contain = innerWidth > innerHeight; room.fit(); });
})();
