/* "Little Room Shuffle", written for this site.
   A light, bouncy tune in G major: a violin playing short bowed notes over plucked strings,
   a soft bass and a tiny shaker, with a music-box bell joining the second time round,
   like a cosy pixel game. Played live by the browser (Web Audio). No recordings, no samples. */
(function () {
'use strict';

const BPM = 112, BEAT = 60 / BPM, BAR = 4;
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

let ac = null, master = null, verb = null, dry = null, on = false, timer = 0, startAt = 0, nextBeat = 0, pass = 0;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

function build() {
  ac = new (window.AudioContext || window.webkitAudioContext)();
  master = ac.createGain(); master.gain.value = 0;
  const comp = ac.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 3;
  master.connect(comp).connect(ac.destination);
  dry = ac.createGain(); dry.gain.value = .8; dry.connect(master);
  // a small room: decaying noise as the reverb
  verb = ac.createConvolver();
  const len = ac.sampleRate * 2.8, ir = ac.createBuffer(2, len, ac.sampleRate);
  for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2); }
  verb.buffer = ir;
  const wet = ac.createGain(); wet.gain.value = .42; verb.connect(wet).connect(master);
}
function out(node, send) { node.connect(dry); const s = ac.createGain(); s.gain.value = send; node.connect(s).connect(verb); }

/* violin: short bowed notes with a quick bite; longer notes bloom into a little vibrato */
function violin(m, t, dur, vel) {
  const f = hz(m), g = ac.createGain(), body = ac.createBiquadFilter(), air = ac.createBiquadFilter(), lp = ac.createBiquadFilter();
  body.type = 'peaking'; body.frequency.value = 560; body.gain.value = 5; body.Q.value = 1.2;
  air.type = 'peaking'; air.frequency.value = 3000; air.gain.value = 4; air.Q.value = 1.4;
  lp.type = 'lowpass'; lp.frequency.value = 4200; lp.Q.value = .6;
  const len = dur * BEAT, short = dur <= .5;
  const vib = ac.createOscillator(), vd = ac.createGain();
  vib.frequency.value = 5.8; vd.gain.setValueAtTime(0, t); vd.gain.linearRampToValueAtTime(short ? 0 : f * .005, t + Math.min(.35, len));
  vib.connect(vd);
  const oscs = [-5, 5].map(c => { const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = c; vd.connect(o.frequency); o.connect(body); return o; });
  body.connect(air).connect(lp).connect(g);
  const peak = .07 * vel, end = t + len * (short ? .62 : .9);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(peak, t + .025);
  g.gain.exponentialRampToValueAtTime(peak * (short ? .35 : .7), t + (short ? .12 : .2));
  g.gain.setValueAtTime(peak * (short ? .35 : .7), Math.max(t + .12, end - .05));
  g.gain.linearRampToValueAtTime(0, end + .08);
  out(g, .32);
  [...oscs, vib].forEach(o => { o.start(t); o.stop(end + .12); });
}
/* plucked strings, a little like a ukulele */
function pluck(m, t, vel) {
  const o = ac.createOscillator(), o2 = ac.createOscillator(), g = ac.createGain(), lp = ac.createBiquadFilter();
  o.type = 'triangle'; o.frequency.value = hz(m); o2.type = 'square'; o2.frequency.value = hz(m) * 2;
  const g2 = ac.createGain(); g2.gain.value = .12; o2.connect(g2);
  lp.type = 'lowpass'; lp.frequency.setValueAtTime(3200, t); lp.frequency.exponentialRampToValueAtTime(600, t + .25);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.045 * vel, t + .004); g.gain.exponentialRampToValueAtTime(.0005, t + .45);
  o.connect(lp); g2.connect(lp); lp.connect(g); out(g, .22);
  [o, o2].forEach(x => { x.start(t); x.stop(t + .5); });
}
/* round plucked bass */
function bass(m, t) {
  const o = ac.createOscillator(), g = ac.createGain(), lp = ac.createBiquadFilter();
  o.type = 'triangle'; o.frequency.value = hz(m);
  lp.type = 'lowpass'; lp.frequency.value = 700;
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.16, t + .008); g.gain.exponentialRampToValueAtTime(.001, t + .5);
  o.connect(lp).connect(g); out(g, .12);
  o.start(t); o.stop(t + .55);
}
/* music-box bell, for the pixel-game sparkle */
function bell(m, t, vel) {
  const o = ac.createOscillator(), o2 = ac.createOscillator(), g = ac.createGain();
  o.type = 'sine'; o.frequency.value = hz(m); o2.type = 'sine'; o2.frequency.value = hz(m) * 4.02;
  const g2 = ac.createGain(); g2.gain.value = .25; o2.connect(g2);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.03 * vel, t + .003); g.gain.exponentialRampToValueAtTime(.0004, t + .8);
  o.connect(g); g2.connect(g); out(g, .5);
  [o, o2].forEach(x => { x.start(t); x.stop(t + .85); });
}
/* soft kick and a shaker made of noise */
let noise = null;
function noiseBuf() { if (noise) return noise; noise = ac.createBuffer(1, ac.sampleRate * .3, ac.sampleRate); const d = noise.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return noise; }
function shaker(t, vel) {
  const n = ac.createBufferSource(), hp = ac.createBiquadFilter(), g = ac.createGain();
  n.buffer = noiseBuf(); hp.type = 'highpass'; hp.frequency.value = 6500;
  g.gain.setValueAtTime(.022 * vel, t); g.gain.exponentialRampToValueAtTime(.0003, t + .06);
  n.connect(hp).connect(g); out(g, .1); n.start(t); n.stop(t + .08);
}
function kick(t) {
  const o = ac.createOscillator(), g = ac.createGain();
  o.frequency.setValueAtTime(130, t); o.frequency.exponentialRampToValueAtTime(48, t + .12);
  g.gain.setValueAtTime(.12, t); g.gain.exponentialRampToValueAtTime(.001, t + .18);
  o.connect(g); out(g, 0); o.start(t); o.stop(t + .2);
}
/* the sound of tape coming off: a short burst of filtered noise that rises */
function rip(len) {
  if (!ac || !on) return;
  const t = ac.currentTime, d = .08 + len * .25;
  const n = ac.createBufferSource(), bp = ac.createBiquadFilter(), g = ac.createGain();
  n.buffer = noiseBuf(); n.loop = true; bp.type = 'bandpass'; bp.Q.value = 1.4;
  bp.frequency.setValueAtTime(900, t); bp.frequency.exponentialRampToValueAtTime(3800, t + d);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.05, t + .01);
  for (let k = .02; k < d; k += .018) g.gain.setValueAtTime(.02 + Math.random() * .04, t + k);
  g.gain.linearRampToValueAtTime(0, t + d);
  n.connect(bp).connect(g); out(g, .1); n.start(t); n.stop(t + d + .02);
}

/* everything that sounds inside one eighth note */
function eventsAt(step) {
  const ev = [], beat = step / 2, b = beat % LOOP, p = Math.floor(beat / LOOP);
  const half = Math.floor(b / 2), [root, chord] = CH[HALVES[half]], inBar = b % BAR, off = step % 2 === 1;
  // bass on 1 and 3, a fifth above on the way
  if (!off && (inBar === 0 || inBar === 2)) ev.push(t => bass(inBar === 0 ? root : root + 7, t));
  // strummed chords on the off-beats: the bounce
  if (off) ev.push(t => chord.forEach((m, i) => pluck(m, t + i * .009, inBar === 1.5 || inBar === 3.5 ? .9 : .7)));
  // light rhythm
  if (!off && (inBar === 0 || inBar === 2)) ev.push(t => kick(t));
  ev.push(t => shaker(t, off ? 1 : .6));
  // the tune, and the music box on top the second time through
  let at = 0;
  for (const [m, d] of TUNE) {
    if (m && at >= b && at < b + .5) {
      const o = (at - b) * BEAT;
      ev.push(t => violin(m, t + o, d, 1));
      if (p % 2 === 1 && b >= 32) ev.push(t => bell(m + 12, t + o, .8));
    }
    at += d;
  }
  return ev;
}
function schedule() {
  const ahead = ac.currentTime + .6;
  while (startAt + nextBeat * BEAT / 2 < ahead) {
    const t = startAt + nextBeat * BEAT / 2;
    eventsAt(nextBeat).forEach(fn => fn(t));
    nextBeat++;
  }
}

function play() {
  if (!ac) build();
  ac.resume();
  on = true;
  startAt = ac.currentTime + .15; nextBeat = 0;
  master.gain.cancelScheduledValues(ac.currentTime);
  master.gain.setValueAtTime(master.gain.value, ac.currentTime);
  master.gain.linearRampToValueAtTime(1.15, ac.currentTime + 1.2);
  clearInterval(timer); timer = setInterval(schedule, 120); schedule();
  sync();
}
function stop() {
  on = false; sync();
  if (!ac) return;
  master.gain.cancelScheduledValues(ac.currentTime);
  master.gain.setValueAtTime(master.gain.value, ac.currentTime);
  master.gain.linearRampToValueAtTime(0, ac.currentTime + .8);
  setTimeout(() => { if (!on) { clearInterval(timer); ac.suspend(); } }, 900);
}
function sync() {
  const b = document.getElementById('music'); if (!b) return;
  b.setAttribute('aria-pressed', String(on));
  b.setAttribute('aria-label', on ? 'Stop music' : 'Play music');
  try { localStorage.setItem('music', on ? '1' : '0'); } catch (e) {}
}
// a soft note in the same key when hovering things, only while the music plays
const PENT = [79, 81, 83, 86, 88, 91];
let lastTick = 0;
function tick() {
  if (!on || !ac) return;
  const now = ac.currentTime; if (now - lastTick < .09) return; lastTick = now;
  pluck(PENT[Math.random() * PENT.length | 0], now + .01, .55);
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
