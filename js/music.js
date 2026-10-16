/* "Late Desk", written for this site.
   A slow downtempo piece in A minor: warm synth chords, a deep round bass,
   a sparse plucked melody with a soft echo, and a quiet half-time beat.
   Played live by the browser (Web Audio). No recordings, no samples. */
(function () {
'use strict';

const BPM = 84, BEAT = 60 / BPM, BAR = 4, STEP = BEAT / 4; // scheduled in sixteenths
// one chord per bar: [bass note, pad voicing]
const CH = {
  Am9: [45, [60, 64, 67, 71]], Fmaj9: [41, [57, 60, 64, 67]], Cmaj7: [48, [55, 59, 64, 71]],
  G6: [43, [59, 62, 64, 67]], Dm9: [50, [57, 60, 64, 65]], Esus: [40, [57, 59, 64, 69]]
};
const BARS = ['Am9', 'Fmaj9', 'Cmaj7', 'G6', 'Am9', 'Fmaj9', 'Dm9', 'Esus'];
// the melody: [midi note or 0 for a rest, beats]
const TUNE = [
  [76, .75], [74, .75], [72, .5], [0, 2],
  [69, 1.5], [72, .5], [0, 2],
  [76, .75], [79, .75], [76, .5], [0, 1], [71, 1],
  [74, 3], [0, 1],
  [76, .75], [74, .75], [72, .5], [0, .5], [69, .5], [72, 1],
  [69, 2], [0, 2],
  [72, .75], [74, .75], [76, .5], [77, 1], [76, 1],
  [71, 2], [0, 2]
];
const LOOP = BARS.length * BAR;
const hz = m => 440 * Math.pow(2, (m - 69) / 12);

let ac = null, master = null, verb = null, dry = null, echo = null, on = false, timer = 0, startAt = 0, nextStep = 0, noise = null;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

function build() {
  ac = new (window.AudioContext || window.webkitAudioContext)();
  master = ac.createGain(); master.gain.value = 0;
  const warm = ac.createBiquadFilter(); warm.type = 'lowpass'; warm.frequency.value = 9000;
  const comp = ac.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 3; comp.attack.value = .01; comp.release.value = .2;
  master.connect(warm).connect(comp).connect(ac.destination);
  dry = ac.createGain(); dry.gain.value = .85; dry.connect(master);
  // a soft room
  verb = ac.createConvolver();
  const len = ac.sampleRate * 3, ir = ac.createBuffer(2, len, ac.sampleRate);
  for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3); }
  verb.buffer = ir;
  const wet = ac.createGain(); wet.gain.value = .4; verb.connect(wet).connect(master);
  // a dotted-eighth echo for the plucks, darkened on each repeat
  echo = ac.createDelay(2); echo.delayTime.value = BEAT * .75;
  const fb = ac.createGain(), dark = ac.createBiquadFilter(), eo = ac.createGain();
  fb.gain.value = .38; dark.type = 'lowpass'; dark.frequency.value = 2400; eo.gain.value = .5;
  echo.connect(dark).connect(fb).connect(echo); dark.connect(eo).connect(master);
}
function out(node, send, echoSend) {
  node.connect(dry);
  const s = ac.createGain(); s.gain.value = send; node.connect(s).connect(verb);
  if (echoSend) { const e = ac.createGain(); e.gain.value = echoSend; node.connect(e).connect(echo); }
}
function noiseBuf() { if (noise) return noise; noise = ac.createBuffer(1, ac.sampleRate * .5, ac.sampleRate); const d = noise.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return noise; }

/* warm pad: detuned saws through a soft low-pass that opens slowly */
function pad(notes, t, dur) {
  const g = ac.createGain(), lp = ac.createBiquadFilter();
  lp.type = 'lowpass'; lp.Q.value = .5;
  lp.frequency.setValueAtTime(500, t); lp.frequency.linearRampToValueAtTime(1300, t + dur * .6); lp.frequency.linearRampToValueAtTime(800, t + dur);
  const end = t + dur;
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.016, t + .6); g.gain.setValueAtTime(.016, end - .3); g.gain.linearRampToValueAtTime(0, end + .9);
  lp.connect(g); out(g, .6);
  notes.forEach(m => [-9, 9].forEach(c => {
    const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.value = hz(m); o.detune.value = c;
    o.connect(lp); o.start(t); o.stop(end + 1);
  }));
}
/* deep round bass */
function sub(m, t, dur) {
  const o = ac.createOscillator(), o2 = ac.createOscillator(), g = ac.createGain(), lp = ac.createBiquadFilter();
  o.type = 'sine'; o.frequency.value = hz(m); o2.type = 'triangle'; o2.frequency.value = hz(m);
  const g2 = ac.createGain(); g2.gain.value = .25; o2.connect(g2);
  lp.type = 'lowpass'; lp.frequency.value = 420;
  const end = t + dur;
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.11, t + .03); g.gain.setValueAtTime(.09, end - .12); g.gain.linearRampToValueAtTime(0, end);
  o.connect(lp); g2.connect(lp); lp.connect(g); out(g, 0);
  [o, o2].forEach(x => { x.start(t); x.stop(end + .05); });
}
/* plucked synth for the melody, with an echo */
function pluck(m, t, vel) {
  const f = hz(m), o = ac.createOscillator(), o2 = ac.createOscillator(), g = ac.createGain(), lp = ac.createBiquadFilter();
  o.type = 'triangle'; o.frequency.value = f; o2.type = 'sine'; o2.frequency.value = f * 2; o2.detune.value = 4;
  const g2 = ac.createGain(); g2.gain.value = .3; o2.connect(g2);
  lp.type = 'lowpass'; lp.frequency.setValueAtTime(3800, t); lp.frequency.exponentialRampToValueAtTime(900, t + .4);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.055 * vel, t + .006); g.gain.exponentialRampToValueAtTime(.0005, t + .9);
  o.connect(lp); g2.connect(lp); lp.connect(g); out(g, .35, .45);
  [o, o2].forEach(x => { x.start(t); x.stop(t + .95); });
}
/* soft beat: a round kick, a brushed snare in the room, quiet hats */
function kick(t, vel) {
  const o = ac.createOscillator(), g = ac.createGain();
  o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(42, t + .16);
  g.gain.setValueAtTime(.16 * vel, t); g.gain.exponentialRampToValueAtTime(.001, t + .38);
  o.connect(g); out(g, 0); o.start(t); o.stop(t + .4);
}
function snare(t) {
  const n = ac.createBufferSource(), bp = ac.createBiquadFilter(), g = ac.createGain();
  n.buffer = noiseBuf(); bp.type = 'bandpass'; bp.frequency.value = 2000; bp.Q.value = .7;
  g.gain.setValueAtTime(.05, t); g.gain.exponentialRampToValueAtTime(.001, t + .22);
  n.connect(bp).connect(g); out(g, .5); n.start(t); n.stop(t + .25);
  const o = ac.createOscillator(), og = ac.createGain();
  o.frequency.setValueAtTime(190, t); o.frequency.exponentialRampToValueAtTime(140, t + .08);
  og.gain.setValueAtTime(.035, t); og.gain.exponentialRampToValueAtTime(.001, t + .12);
  o.connect(og); out(og, .3); o.start(t); o.stop(t + .14);
}
function hat(t, vel) {
  const n = ac.createBufferSource(), hp = ac.createBiquadFilter(), g = ac.createGain();
  n.buffer = noiseBuf(); hp.type = 'highpass'; hp.frequency.value = 8000;
  g.gain.setValueAtTime(.011 * vel, t); g.gain.exponentialRampToValueAtTime(.0002, t + .045);
  n.connect(hp).connect(g); out(g, .12); n.start(t); n.stop(t + .06);
}
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

/* everything that sounds inside one sixteenth */
function eventsAt(step) {
  const ev = [], beat = step / 4, b = beat % LOOP, pass = Math.floor(beat / LOOP);
  const bar = Math.floor(b / BAR), inBar = b % BAR, [root, chord] = CH[BARS[bar]];
  if (inBar === 0) { ev.push(t => pad(chord, t, BAR * BEAT)); ev.push(t => sub(root, t, BEAT * 2.4)); }
  if (inBar === 2.5) ev.push(t => sub(root, t, BEAT * 1.3));
  // the beat comes in after the first two bars of the very first pass
  const drums = beat >= 8;
  if (drums) {
    if (inBar === 0) ev.push(t => kick(t, 1));
    if (inBar === 1.75) ev.push(t => kick(t, .6));
    if (inBar === 2) ev.push(t => snare(t));
    if (Number.isInteger(inBar * 2)) ev.push(t => hat(t, Number.isInteger(inBar) ? .5 : 1));
    else if (inBar === 3.75) ev.push(t => hat(t, .5));
  }
  let at = 0;
  for (const [m, d] of TUNE) {
    if (m && at >= b && at < b + .25) {
      const o = (at - b) * BEAT;
      // second time round the melody moves up an octave, quieter
      ev.push(t => pluck(pass % 2 === 1 ? m + 12 : m, t + o, pass % 2 === 1 ? .7 : 1));
    }
    at += d;
  }
  return ev;
}
function schedule() {
  const ahead = ac.currentTime + .6;
  while (startAt + nextStep * STEP < ahead) {
    const t = startAt + nextStep * STEP;
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
  master.gain.linearRampToValueAtTime(.5, ac.currentTime + 2);
  clearInterval(timer); timer = setInterval(schedule, 120); schedule();
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
// a soft pluck in the same key when hovering things, only while the music plays
const NOTES = [69, 72, 74, 76, 79, 81];
let lastTick = 0;
function tick() {
  if (!on || !ac) return;
  const now = ac.currentTime; if (now - lastTick < .15) return; lastTick = now;
  pluck(NOTES[Math.random() * NOTES.length | 0] + 12, now + .01, .35);
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
