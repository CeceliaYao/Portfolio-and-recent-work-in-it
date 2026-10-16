/* "Window Light", written for this site.
   A slow, airy piece in G: soft pad chords, a sparse music-box melody,
   a quiet harp underneath and faint string harmonics on the second pass,
   all in a long, soft reverb. Played live by the browser (Web Audio).
   No recordings, no samples. */
(function () {
'use strict';

const BPM = 72, BEAT = 60 / BPM, BAR = 4;
// one chord per bar (pad voicing, low to high)
const CHORDS = {
  Gmaj7: [55, 59, 62, 66], DF: [54, 57, 62, 64], Em7: [52, 59, 62, 67], Cmaj7s11: [48, 55, 59, 66],
  Bm7: [47, 57, 62, 66], Cmaj7: [48, 55, 59, 64], Dsus: [50, 57, 62, 67], Dadd9: [50, 57, 64, 66], Am7: [45, 55, 60, 64]
};
const BARS = ['Gmaj7', 'DF', 'Em7', 'Cmaj7s11', 'Gmaj7', 'Bm7', 'Cmaj7', 'Dsus', 'Em7', 'Cmaj7', 'Gmaj7', 'Dadd9', 'Cmaj7', 'Am7', 'Dsus', 'Gmaj7'];
// the melody: [midi note or 0 for a rest, beats]
const TUNE = [
  [0, 1], [83, 1], [81, .5], [79, .5], [78, 1],
  [76, 2], [0, 1], [74, 1],
  [0, 1], [79, 1], [78, .5], [76, .5], [71, 1],
  [78, 3], [0, 1],
  [0, 1], [83, 1], [86, 1], [83, 1],
  [81, 2], [78, 1], [74, 1],
  [76, 1], [79, 1], [83, 1.5], [81, .5],
  [79, 2], [78, 2],
  [0, 2], [83, 1], [79, 1],
  [78, 2], [76, 1], [79, 1],
  [74, 1], [78, 1], [81, 1], [83, 1],
  [81, 3], [0, 1],
  [0, 1], [79, 1], [76, 1], [72, 1],
  [76, 2], [74, 1], [72, 1],
  [74, 2], [0, 1], [78, 1],
  [79, 4]
];
const LOOP = BARS.length * BAR;
const hz = m => 440 * Math.pow(2, (m - 69) / 12);

let ac = null, master = null, verb = null, dry = null, on = false, timer = 0, startAt = 0, nextStep = 0, noise = null;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

function build() {
  ac = new (window.AudioContext || window.webkitAudioContext)();
  master = ac.createGain(); master.gain.value = 0;
  const comp = ac.createDynamicsCompressor(); comp.threshold.value = -20; comp.ratio.value = 2.5;
  const soft = ac.createBiquadFilter(); soft.type = 'lowpass'; soft.frequency.value = 7000;
  master.connect(soft).connect(comp).connect(ac.destination);
  dry = ac.createGain(); dry.gain.value = .55; dry.connect(master);
  // a long, gentle hall
  verb = ac.createConvolver();
  const len = ac.sampleRate * 4.5, ir = ac.createBuffer(2, len, ac.sampleRate);
  for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
  verb.buffer = ir;
  const wet = ac.createGain(); wet.gain.value = .75; verb.connect(wet).connect(master);
}
function out(node, send) { node.connect(dry); const s = ac.createGain(); s.gain.value = send; node.connect(s).connect(verb); }

/* soft pad: detuned triangles that swell in and fade out slowly */
function pad(notes, t, dur) {
  const g = ac.createGain(), lp = ac.createBiquadFilter();
  lp.type = 'lowpass'; lp.frequency.value = 1100; lp.Q.value = .3;
  const end = t + dur;
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.026, t + 1.4); g.gain.setValueAtTime(.026, end - .4); g.gain.linearRampToValueAtTime(0, end + 1.6);
  lp.connect(g); out(g, .9);
  notes.forEach(m => [-7, 7].forEach(c => {
    const o = ac.createOscillator(); o.type = 'triangle'; o.frequency.value = hz(m); o.detune.value = c;
    o.connect(lp); o.start(t); o.stop(end + 1.7);
  }));
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
/* harp: a soft pluck that rings */
function harp(m, t, vel) {
  const o = ac.createOscillator(), g = ac.createGain(), lp = ac.createBiquadFilter();
  o.type = 'triangle'; o.frequency.value = hz(m);
  lp.type = 'lowpass'; lp.frequency.setValueAtTime(2200, t); lp.frequency.exponentialRampToValueAtTime(700, t + .8);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.022 * vel, t + .01); g.gain.exponentialRampToValueAtTime(.0004, t + 1.6);
  o.connect(lp).connect(g); out(g, .8);
  o.start(t); o.stop(t + 1.7);
}
/* string harmonic: a pure, high tone with a slow shimmer */
function harmonic(m, t, dur) {
  const o = ac.createOscillator(), g = ac.createGain(), lfo = ac.createOscillator(), ld = ac.createGain();
  o.type = 'sine'; o.frequency.value = hz(m);
  lfo.frequency.value = 4.6; ld.gain.value = hz(m) * .003; lfo.connect(ld).connect(o.frequency);
  const end = t + dur;
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.012, t + 1.2); g.gain.setValueAtTime(.012, end - .5); g.gain.linearRampToValueAtTime(0, end + 1);
  o.connect(g); out(g, 1);
  [o, lfo].forEach(x => { x.start(t); x.stop(end + 1.1); });
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
const ARP = [0, 1, 2, 3, 2, 3, 1, 2];
function eventsAt(step) {
  const ev = [], beat = step / 2, b = beat % LOOP, pass = Math.floor(beat / LOOP);
  const bar = Math.floor(b / BAR), inBar = b % BAR, chord = CHORDS[BARS[bar]];
  if (inBar === 0) {
    ev.push(t => pad(chord, t, BAR * BEAT));
    // faint high harmonics the second time through
    if (pass % 2 === 1) ev.push(t => harmonic(chord[3] + 24, t, BAR * BEAT));
  }
  // a gentle harp, an octave above the pad, rising through the chord
  const k = Math.round(inBar * 2);
  if (k % 2 === 0 || pass % 2 === 1) ev.push(t => harp(chord[ARP[k]] + 12, t, k === 0 ? 1 : .7));
  let at = 0;
  for (const [m, d] of TUNE) {
    if (m && at >= b && at < b + .5) { const o = (at - b) * BEAT; ev.push(t => celesta(m, t + o, d >= 2 ? 1 : .85)); }
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
  master.gain.linearRampToValueAtTime(1.4, ac.currentTime + 3);
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
const NOTES = [79, 81, 83, 86, 88, 90];
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
