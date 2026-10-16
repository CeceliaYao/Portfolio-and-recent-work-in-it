/* "Little Room", written for this site.
   A light, bouncy tune in G major: plucked violin and a music box carry the melody
   over off-beat harp chords, a round bass, a soft kick and a shaker.
   Played live by the browser (Web Audio). No recordings, no samples. */
(function () {
'use strict';

const BPM = 100, BEAT = 60 / BPM, BAR = 4;
const CH = {
  G: [43, [67, 71, 74]], Em: [40, [67, 71, 76]], C: [48, [67, 72, 76]], D: [50, [66, 69, 74]], Bm: [47, [66, 71, 74]]
};
// two chords per bar, half a bar each
const HALVES = [
  'G', 'G', 'Em', 'Em', 'C', 'C', 'D', 'D', 'G', 'G', 'Em', 'Em', 'C', 'D', 'G', 'G',
  'C', 'C', 'D', 'D', 'Bm', 'Bm', 'Em', 'Em', 'C', 'C', 'D', 'D', 'G', 'G', 'G', 'D'
];
// the tune: [midi note or 0 for a rest, beats]
const TUNE = [
  [74, .5], [71, .5], [74, .5], [79, .5], [78, .5], [79, .5], [74, 1],
  [76, .5], [79, .5], [76, .5], [71, .5], [76, 1], [0, 1],
  [72, .5], [76, .5], [79, .5], [76, .5], [72, .5], [76, .5], [79, 1],
  [78, .5], [76, .5], [74, .5], [72, .5], [69, 1], [0, 1],
  [71, .5], [74, .5], [79, .5], [74, .5], [71, .5], [74, .5], [79, 1],
  [79, .5], [78, .5], [76, .5], [74, .5], [71, 1], [76, 1],
  [76, .5], [79, .5], [76, .5], [72, .5], [74, .5], [78, .5], [81, 1],
  [79, 1], [74, .5], [71, .5], [67, 1], [0, 1],
  [79, 1.5], [76, .5], [72, 1], [76, 1],
  [78, 1.5], [74, .5], [69, 1], [74, 1],
  [74, .5], [78, .5], [83, 1], [81, .5], [78, .5], [74, 1],
  [76, .5], [79, .5], [83, 1], [79, 1], [76, 1],
  [76, .5], [78, .5], [79, .5], [76, .5], [72, 1], [67, 1],
  [69, .5], [71, .5], [72, .5], [74, .5], [76, .5], [78, .5], [81, 1],
  [79, .5], [74, .5], [71, .5], [74, .5], [79, 1.5], [0, .5],
  [0, 2], [74, .5], [76, .5], [78, 1]
];
const LOOP = HALVES.length / 2 * BAR;
const hz = m => 440 * Math.pow(2, (m - 69) / 12);

let ac = null, master = null, verb = null, dry = null, on = false, timer = 0, startAt = 0, nextStep = 0, noise = null;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

function build() {
  ac = new (window.AudioContext || window.webkitAudioContext)();
  master = ac.createGain(); master.gain.value = 0;
  const comp = ac.createDynamicsCompressor(); comp.threshold.value = -20; comp.ratio.value = 2.5;
  const soft = ac.createBiquadFilter(); soft.type = 'lowpass'; soft.frequency.value = 7000;
  master.connect(soft).connect(comp).connect(ac.destination);
  dry = ac.createGain(); dry.gain.value = .8; dry.connect(master);
  // a small, bright room
  verb = ac.createConvolver();
  const len = ac.sampleRate * 2.2, ir = ac.createBuffer(2, len, ac.sampleRate);
  for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.4); }
  verb.buffer = ir;
  const wet = ac.createGain(); wet.gain.value = .38; verb.connect(wet).connect(master);
}
function out(node, send) { node.connect(dry); const s = ac.createGain(); s.gain.value = send; node.connect(s).connect(verb); }

/* plucked violin: a quick, round pluck with a little body resonance */
function pizz(m, t, vel) {
  const f = hz(m), o = ac.createOscillator(), o2 = ac.createOscillator(), g = ac.createGain(), body = ac.createBiquadFilter(), lp = ac.createBiquadFilter();
  o.type = 'triangle'; o.frequency.value = f; o2.type = 'sawtooth'; o2.frequency.value = f;
  const g2 = ac.createGain(); g2.gain.value = .18; o2.connect(g2);
  body.type = 'peaking'; body.frequency.value = 600; body.gain.value = 4; body.Q.value = 1;
  lp.type = 'lowpass'; lp.frequency.setValueAtTime(3200, t); lp.frequency.exponentialRampToValueAtTime(900, t + .3);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.075 * vel, t + .005); g.gain.exponentialRampToValueAtTime(.0005, t + .55);
  o.connect(body); g2.connect(body); body.connect(lp).connect(g); out(g, .3);
  [o, o2].forEach(x => { x.start(t); x.stop(t + .75); });
}
/* music box / celesta: a bright fundamental with a faint high partial, ringing out */
function celesta(m, t, vel) {
  const f = hz(m), g = ac.createGain();
  const o = ac.createOscillator(), o2 = ac.createOscillator(), o3 = ac.createOscillator();
  o.type = 'sine'; o.frequency.value = f; o2.type = 'sine'; o2.frequency.value = f * 4.01; o3.type = 'sine'; o3.frequency.value = f * 2;
  const g2 = ac.createGain(); g2.gain.setValueAtTime(.18, t); g2.gain.exponentialRampToValueAtTime(.001, t + .35); o2.connect(g2);
  const g3 = ac.createGain(); g3.gain.value = .12; o3.connect(g3);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.05 * vel, t + .004); g.gain.exponentialRampToValueAtTime(.0004, t + 2.2);
  o.connect(g); g2.connect(g); g3.connect(g); out(g, .85);
  [o, o2, o3].forEach(x => { x.start(t); x.stop(t + 2.3); });
}
/* harp: a soft pluck */
function harp(m, t, vel) {
  const o = ac.createOscillator(), g = ac.createGain(), lp = ac.createBiquadFilter();
  o.type = 'triangle'; o.frequency.value = hz(m);
  lp.type = 'lowpass'; lp.frequency.setValueAtTime(2600, t); lp.frequency.exponentialRampToValueAtTime(700, t + .5);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.03 * vel, t + .006); g.gain.exponentialRampToValueAtTime(.0004, t + .8);
  o.connect(lp).connect(g); out(g, .35);
  o.start(t); o.stop(t + .85);
}
/* round plucked bass */
function bass(m, t) {
  const o = ac.createOscillator(), g = ac.createGain(), lp = ac.createBiquadFilter();
  o.type = 'triangle'; o.frequency.value = hz(m);
  lp.type = 'lowpass'; lp.frequency.value = 650;
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.13, t + .01); g.gain.exponentialRampToValueAtTime(.001, t + .55);
  o.connect(lp).connect(g); out(g, .1);
  o.start(t); o.stop(t + .6);
}
function kick(t) {
  const o = ac.createOscillator(), g = ac.createGain();
  o.frequency.setValueAtTime(120, t); o.frequency.exponentialRampToValueAtTime(50, t + .1);
  g.gain.setValueAtTime(.07, t); g.gain.exponentialRampToValueAtTime(.001, t + .15);
  o.connect(g); out(g, 0); o.start(t); o.stop(t + .17);
}
function shaker(t, vel) {
  const n = ac.createBufferSource(), hp = ac.createBiquadFilter(), g = ac.createGain();
  n.buffer = noiseBuf(); hp.type = 'highpass'; hp.frequency.value = 7000;
  g.gain.setValueAtTime(.012 * vel, t); g.gain.exponentialRampToValueAtTime(.0002, t + .05);
  n.connect(hp).connect(g); out(g, .1); n.start(t); n.stop(t + .07);
}
function noiseBuf() { if (noise) return noise; noise = ac.createBuffer(1, ac.sampleRate * .4, ac.sampleRate); const d = noise.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return noise; }
/* the sound of tape coming off: soft, short, filtered */
function rip(len) {
  if (!ac || !on) return;
  const t = ac.currentTime, d = .06 + len * .2;
  const n = ac.createBufferSource(), bp = ac.createBiquadFilter(), g = ac.createGain();
  n.buffer = noiseBuf(); n.loop = true; bp.type = 'bandpass'; bp.Q.value = 1.2;
  bp.frequency.setValueAtTime(1200, t); bp.frequency.exponentialRampToValueAtTime(3400, t + d);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.025, t + .01);
  for (let k = .02; k < d; k += .02) g.gain.setValueAtTime(.01 + Math.random() * .02, t + k);
  g.gain.linearRampToValueAtTime(0, t + d);
  n.connect(bp).connect(g); out(g, .2); n.start(t); n.stop(t + d + .02);
}

/* everything that sounds inside one eighth note */
function eventsAt(step) {
  const ev = [], beat = step / 2, b = beat % LOOP, pass = Math.floor(beat / LOOP);
  const [root, chord] = CH[HALVES[Math.floor(b / 2)]], inBar = b % BAR, off = step % 2 === 1;
  if (!off && (inBar === 0 || inBar === 2)) ev.push(t => bass(inBar === 0 ? root : root + 7, t));
  // light harp chords on the off-beats keep it moving
  if (off) ev.push(t => chord.forEach((m, i) => harp(m, t + i * .012, .8)));
  ev.push(t => shaker(t, off ? 1 : .55));
  if (!off && (inBar === 0 || inBar === 2)) ev.push(t => kick(t));
  let at = 0;
  for (const [m, d] of TUNE) {
    if (m && at >= b && at < b + .5) {
      const o = (at - b) * BEAT;
      ev.push(t => pizz(m, t + o, 1));
      // the music box joins an octave up the second time round
      if (pass % 2 === 1) ev.push(t => celesta(m + 12, t + o, .5));
    }
    at += d;
  }
  return ev;
}
function schedule() {
  const ahead = ac.currentTime + .8;
  while (startAt + nextStep * BEAT / 2 < ahead) {
    const t = startAt + nextStep * BEAT / 2;
    eventsAt(nextStep).forEach(fn => fn(t));
    nextStep++;
  }
}

function play() {
  if (!ac) build();
  ac.resume();
  on = true;
  startAt = ac.currentTime + .15; nextStep = 0;
  master.gain.cancelScheduledValues(ac.currentTime);
  master.gain.setValueAtTime(master.gain.value, ac.currentTime);
  master.gain.linearRampToValueAtTime(1.2, ac.currentTime + 1.5);
  clearInterval(timer); timer = setInterval(schedule, 150); schedule();
  sync();
}
function stop() {
  on = false; sync();
  if (!ac) return;
  master.gain.cancelScheduledValues(ac.currentTime);
  master.gain.setValueAtTime(master.gain.value, ac.currentTime);
  master.gain.linearRampToValueAtTime(0, ac.currentTime + 1.2);
  setTimeout(() => { if (!on) { clearInterval(timer); ac.suspend(); } }, 1300);
}
function sync() {
  const b = document.getElementById('music'); if (!b) return;
  b.setAttribute('aria-pressed', String(on));
  b.setAttribute('aria-label', on ? 'Stop music' : 'Play music');
  try { localStorage.setItem('music', on ? '1' : '0'); } catch (e) {}
}
// a soft music-box note in the same key when hovering things, only while the music plays
const NOTES = [79, 81, 83, 86, 88, 91];
let lastTick = 0;
function tick() {
  if (!on || !ac) return;
  const now = ac.currentTime; if (now - lastTick < .12) return; lastTick = now;
  celesta(NOTES[Math.random() * NOTES.length | 0], now + .01, .4);
}

document.addEventListener('visibilitychange', () => { if (!ac || !on) return; document.hidden ? ac.suspend() : ac.resume(); });

function init() {
  const b = document.getElementById('music'); if (!b) return;
  b.addEventListener('click', () => (on ? stop() : play()));
  let want = false; try { want = localStorage.getItem('music') === '1'; } catch (e) {}
  // browsers only allow sound after a click, so a returning listener's choice waits for their first one
  if (want) addEventListener('pointerdown', function first(e) { removeEventListener('pointerdown', first, true); if (!on && !e.target.closest('#music')) play(); }, true);
  else if (!reduced) {
    const hint = document.createElement('div'); hint.className = 'music-hint'; hint.textContent = '♪ a little tune I wrote for this room';
    document.body.append(hint);
    setTimeout(() => hint.classList.add('on'), 2600);
    setTimeout(() => { hint.classList.remove('on'); setTimeout(() => hint.remove(), 400); }, 8000);
    b.addEventListener('click', () => hint.remove(), { once: true });
  }
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();

window.Music = { play, stop, tick, rip, get on() { return on; } };
})();
