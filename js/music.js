/* "Little Room Waltz", written for this site.
   A slow waltz in D major for violin, plucked strings and a low cello line,
   played live by the browser (Web Audio). No recordings, no samples. */
(function () {
'use strict';

const BPM = 84, BEAT = 60 / BPM;
// chords, one per bar: [bass note, plucked chord]
const C = {
  D: [50, [62, 66, 69]], Bm: [47, [62, 66, 71]], G: [43, [62, 67, 71]],
  A: [45, [61, 64, 69]], Fm: [42, [61, 66, 69]], Em: [40, [59, 64, 67]]
};
const BARS = ['D', 'Bm', 'G', 'A', 'D', 'Fm', 'G', 'A', 'Bm', 'G', 'D', 'A', 'G', 'A', 'D', 'D'];
// the tune: [midi note or 0 for a rest, beats], three beats to a bar
const TUNE = [
  [69, 2], [66, 1], [71, 2], [74, 1], [71, 1.5], [69, .5], [67, 1], [69, 3],
  [78, 2], [76, 1], [73, 2], [69, 1], [71, 1], [74, 1], [79, 1], [76, 3],
  [78, 2], [74, 1], [71, 2], [67, 1], [69, 1], [66, 1], [69, 1], [76, 2], [73, 1],
  [74, 1.5], [71, .5], [67, 1], [73, 1.5], [76, .5], [69, 1], [74, 3], [0, 2], [73, 1]
];
// a quieter answering line for the second time round, a third or sixth under the tune
const ANSWER = [
  [0, 3], [0, 3], [0, 3], [0, 3],
  [74, 2], [73, 1], [69, 2], [66, 1], [67, 1], [71, 1], [74, 1], [73, 3],
  [74, 2], [71, 1], [67, 2], [62, 1], [66, 1], [62, 1], [66, 1], [73, 2], [69, 1],
  [71, 1.5], [67, .5], [62, 1], [69, 1.5], [73, .5], [64, 1], [66, 3], [0, 3]
];
const LOOP = BARS.length * 3;
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

/* bowed violin: two saws, a slow bow attack, vibrato that blooms after the note starts */
function violin(m, t, dur, vel) {
  const f = hz(m), g = ac.createGain(), body = ac.createBiquadFilter(), air = ac.createBiquadFilter(), lp = ac.createBiquadFilter();
  body.type = 'peaking'; body.frequency.value = 520; body.gain.value = 5; body.Q.value = 1.2;
  air.type = 'peaking'; air.frequency.value = 2900; air.gain.value = 4; air.Q.value = 1.4;
  lp.type = 'lowpass'; lp.frequency.value = 3600; lp.Q.value = .6;
  const vib = ac.createOscillator(), vd = ac.createGain();
  vib.frequency.value = 5.3; vd.gain.setValueAtTime(0, t); vd.gain.linearRampToValueAtTime(0, t + .18); vd.gain.linearRampToValueAtTime(f * .006, t + .5);
  vib.connect(vd);
  const oscs = [-4, 4].map(c => { const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = c; vd.connect(o.frequency); o.connect(body); return o; });
  body.connect(air).connect(lp).connect(g);
  const end = t + dur * BEAT, peak = .085 * vel;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(peak, t + .12);
  g.gain.linearRampToValueAtTime(peak * .78, t + .3);
  g.gain.setValueAtTime(peak * .78, Math.max(t + .3, end - .12));
  g.gain.linearRampToValueAtTime(0, end + .22);
  out(g, .55);
  [...oscs, vib].forEach(o => { o.start(t); o.stop(end + .3); });
}
/* plucked strings for the waltz chords */
function pluck(m, t, vel) {
  const o = ac.createOscillator(), o2 = ac.createOscillator(), g = ac.createGain(), lp = ac.createBiquadFilter();
  o.type = 'triangle'; o.frequency.value = hz(m); o2.type = 'sine'; o2.frequency.value = hz(m) * 2;
  lp.type = 'lowpass'; lp.frequency.setValueAtTime(2400, t); lp.frequency.exponentialRampToValueAtTime(500, t + .4);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.05 * vel, t + .006); g.gain.exponentialRampToValueAtTime(.0005, t + .9);
  o.connect(lp); o2.connect(lp); lp.connect(g); out(g, .35);
  [o, o2].forEach(x => { x.start(t); x.stop(t + 1); });
}
/* low cello line on the first beat */
function cello(m, t, dur) {
  const o = ac.createOscillator(), g = ac.createGain(), lp = ac.createBiquadFilter();
  o.type = 'sawtooth'; o.frequency.value = hz(m);
  lp.type = 'lowpass'; lp.frequency.value = 520; lp.Q.value = .8;
  const end = t + dur * BEAT;
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.07, t + .14); g.gain.linearRampToValueAtTime(.045, end - .1); g.gain.linearRampToValueAtTime(0, end + .25);
  o.connect(lp).connect(g); out(g, .4);
  o.start(t); o.stop(end + .3);
}

/* everything that sounds inside one beat */
function eventsAt(beat) {
  const ev = [], b = beat % LOOP, bar = Math.floor(b / 3), inBar = b % 3, p = Math.floor(beat / LOOP);
  const [bass, chord] = C[BARS[bar]];
  if (inBar === 0) ev.push(t => cello(bass, t, 2.8));
  else ev.push(t => chord.forEach((m, i) => pluck(m, t + i * .012, inBar === 1 ? 1 : .8)));
  const line = (notes, vel, shift) => { let at = 0; for (const [m, d] of notes) { if (at >= b && at < b + 1 && m) { const off = (at - b) * BEAT, mm = m + shift; ev.push(t => violin(mm, t + off, d, vel)); } at += d; } };
  // first time through: the tune alone; second: an octave lower with the answering line on top
  if (p % 2 === 0) line(TUNE, 1, 0);
  else { line(TUNE, .8, -12); line(ANSWER, .75, 0); }
  return ev;
}
function schedule() {
  const ahead = ac.currentTime + .6;
  while (startAt + nextBeat * BEAT < ahead) {
    const t = startAt + nextBeat * BEAT;
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
  master.gain.linearRampToValueAtTime(.9, ac.currentTime + 2.5);
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
const PENT = [74, 76, 78, 81, 83, 86];
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
    const hint = document.createElement('div'); hint.className = 'music-hint'; hint.textContent = '♪ a little waltz I wrote for this room';
    document.body.append(hint);
    setTimeout(() => hint.classList.add('on'), 2600);
    setTimeout(() => { hint.classList.remove('on'); setTimeout(() => hint.remove(), 400); }, 8000);
    b.addEventListener('click', () => hint.remove(), { once: true });
  }
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();

window.Music = { play, stop, tick, get on() { return on; } };
})();
