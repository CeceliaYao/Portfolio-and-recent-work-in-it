/* A pixel portrait drawn from my photo: long black hair parted to one side,
   a gold hoop, a thin gold chain with a round pendant, a black top.
   It breathes, blinks, follows the pointer with its eyes, and smiles when you come close. */
(function () {
'use strict';
const W = 48, H = 56;
const C = {
  h0: '#120d0f', h1: '#1e1618', h2: '#2e2326', h3: '#463538',
  s1: '#f8e4d6', s2: '#f1d0bd', s3: '#e2b49e', s4: '#c99784',
  br: '#3a2924', ir: '#24160f', iw: '#e8d6cc', ln: '#4a3029', hl: '#fff8f0',
  l0: '#d9978d', l1: '#bf766f',
  g0: '#c99a3e', g1: '#f2d27c', gw: '#fff6d8'
};
// my photo, reduced to 48 x 56: . background, a-d hair from darkest, 1-4 skin from lightest
const MAP = [
  '................................................',
  '......................333dd332..................',
  '....................3cbaaabbbc32................',
  '..................3cbaaaaaaaabbd2...............',
  '................2dbaaaaaaaaaaaabd...............',
  '...............3baaaaaaaaaaaaaaac3..............',
  '..............3baaaaaaaaaaaaaaaaac3.............',
  '.............3baaaaaaaaaaaabbbbbbbac............',
  '.............cbaaaaaaaaaaabcdddcbbbad...........',
  '............3baaaaaaaaaaabd44444cbaaa3..........',
  '...........2bbaaaaaaaaaabd44333444baad..........',
  '...........3bbbaaaaaaaabc443333334daab2.........',
  '..........2bbbbaaaaaaaabd4332222334caa3.........',
  '..........3bbbaaaaaaaabc433222222344aa3.........',
  '..........dbbbbbabaaaabd432222222334bad.........',
  '..........bbbbbbbbaaabc4432222222334cac.........',
  '.........3babbbbbbaabbd4332222222334cac.........',
  '.........3aaababbbbbbbd4332222222334cac.........',
  '.........daaabaabbbbbd44332222222334cac.........',
  '.........baaaaaabbbbbd44332222223344ca3.........',
  '........2baaaaaaabbbbccd332222233344db2.........',
  '........3baaaaaaaabbbdbc332222233344dc2.........',
  '........3aaaaaaaabbbd443332222233334dd..........',
  '........3aaaaaaaabbb44332222222333333d..........',
  '........daaaaaaaabbc43322222222223333d..........',
  '........cbaaaaaaabbd432222222222223322..........',
  '.......2cbaaaaaaabb4332222222222222222..........',
  '.......3cbaaaaaabbb4322222222222222222..........',
  '.......3cbaaaaaabbc4322222222222222221..........',
  '.......3caaabaaabbd432222222222222332...........',
  '......2dcaaaaaaabb4332222222222233332...........',
  '......2dbaaaaaaabc4332222223333333db2...........',
  '......34baaaaaaabd4322222233333334bc2...........',
  '......34baaaaaaabd432222233333334da3............',
  '......d4baaaaaaaad432222223333444aa3............',
  '......3dbaaaaaaaac43322222233344bab3............',
  '......3cbaaaaaaaabd332222223344caab3............',
  '......3baaaaaaaaab443322222344caaab3............',
  '......4baaaaaaaaab44332222334daaaab3............',
  '......dbaaaaaaaaabd433222334baaaaab3............',
  '......cabaaaaaaaabd43322234caaaaaab42...........',
  '.....3baaaaaaaaaabd43322334caaaaaab42...........',
  '.....3baaaaaaaaaabd43322334caaaaaabd2...........',
  '.....3aaaaaaaaaaaad43322234caaaaaabc3...........',
  '.....daaaaaaaaaaaad43322234dbaaabaab3...........',
  '....2caaaabaaaaaaac44332233dcbaaaaab3...........',
  '....2abdbaaaaaaaaab443322334ccaaaaaa43..........',
  '...12344daaaaaaaaaac443323334dcaaaaac32.........',
  '..11223344baaaaaaaabd4333333444baaaaa432........',
  '.111122334caaaaaaaaad4333233344baaaaac321.......',
  '11111122344aaaaaaaaac4433333344caaaaaa432.......',
  '11111112234caaaaaaaaad443333444baaaaaab421......',
  '11111112234caaaaaaaaabd4444444caaaaaaab432......',
  '11111111233daaaaaaaaaaabcddccaaaaaaaaaac32......',
  '111111112234baaaaaaaaaaaaaaaaaaaaaaaaaaa42......',
  '111111112234caaaaaaaaaaaaaaaaaaaaaaaaaabc31.....',
];
const TONE = { a: C.h0, b: C.h1, c: C.h2, d: C.h3, 1: C.s1, 2: C.s2, 3: C.s3, 4: C.s4 };

function draw(x, s) {
  const p = (px, py, c) => { if (c) { x.fillStyle = c; x.fillRect(px | 0, py | 0, 1, 1); } };
  const r = (px, py, w, h, c) => { x.fillStyle = c; x.fillRect(px, py, w, h); };
  x.clearRect(0, 0, W, H);
  const b = s.breathe ? 1 : 0;   // below the chin everything rises a pixel on the in-breath
  for (let y = 0; y < H; y++) {
    const row = MAP[y], sy = y >= 42 ? y - b : y;
    for (let i = 0; i < W; i++) p(i, sy, TONE[row[i]]);
  }
  if (b) for (let i = 0; i < W; i++) p(i, H - 1, TONE[MAP[H - 1][i]]);
  // the loose ends of the hair drift
  const sw = s.sway;
  [[5, 47], [6, 45], [37, 46], [38, 48]].forEach(([sx, sy], k) => { if ((sw + k) % 4 < 2) p(sx, sy - b, C.h1); });
  // shine running down the hair
  [[16, 12], [16, 13], [15, 15], [15, 16], [14, 19], [14, 20], [13, 24], [13, 25], [12, 30], [12, 31], [12, 36], [23, 5], [24, 4], [26, 4]].forEach(([hx, hy], k) => p(hx, hy, k % 3 ? C.h2 : C.h3));

  // brows
  r(22, 18, 4, 1, C.br); p(21, 19, C.br); p(26, 18, C.br);
  r(32, 18, 4, 1, C.br); p(36, 19, C.br);
  // eyes: soft lids, dark irises that follow the pointer
  const ex = s.lookX > .35 ? 1 : s.lookX < -.35 ? -1 : 0, ey = s.lookY > .55 ? 1 : 0;
  [[22, 21], [32, 22]].forEach(([e0, y0]) => {
    if (s.blink) { r(e0, y0, 4, 1, C.ln); p(e0 + 1, y0 + 1, C.s3); return; }
    r(e0, y0 - 1, 4, 1, C.ln);
    r(e0, y0, 4, 1, C.iw);
    const ix = Math.max(e0, Math.min(e0 + 2, e0 + 1 + ex));
    r(ix, y0, 2, 1, C.ir); if (ey) r(ix, y0 + 1, 2, 1, C.ir); p(ix + 1, y0, C.hl);
    p(e0, y0 + 1, C.s3);
  });
  // nose
  p(28, 26, C.s3); p(28, 27, C.s3); p(27, 29, C.s4); p(29, 29, C.s4);
  // mouth
  if (s.smile) { p(24, 32, C.l1); r(25, 33, 6, 1, C.l0); p(31, 32, C.l1); r(26, 34, 4, 1, C.l1); p(22, 31, C.l0); p(33, 31, C.l0); }
  else { r(25, 33, 6, 1, C.l1); r(26, 34, 4, 1, C.l0); }
  // gold hoop
  p(13, 28, C.g1); p(12, 29, C.g0); p(12, 30, C.g0); p(13, 31, C.g1); p(14, 30, C.g0);
  // thin chain and round pendant
  [[22, 43], [23, 44], [24, 46], [25, 47], [26, 48], [27, 49], [32, 44], [31, 45], [30, 47], [29, 48], [28, 49]].forEach(([cx, cy]) => p(cx, cy - b, C.g0));
  r(27, 50 - b, 2, 2, C.g1); p(28, 51 - b, C.g0);
  if (s.glint) { p(27, 49 - b, C.gw); p(29, 50 - b, C.gw); p(26, 50 - b, C.gw); p(27, 52 - b, C.gw); p(28, 50 - b, C.gw); }
}

function mount(cv) {
  cv.width = W; cv.height = H;
  const x = cv.getContext('2d');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const s = { lookX: 0, lookY: 0, blink: 0, breathe: 0, sway: 0, smile: 0, glint: 0 };
  let near = false, t0 = 0;
  const paint = () => draw(x, s);
  paint();
  addEventListener('pointermove', e => {
    const r = cv.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height * .4);
    const lx = Math.max(-1, Math.min(1, dx / 260)), ly = Math.max(-1, Math.min(1, dy / 260));
    near = Math.hypot(dx, dy) < Math.max(140, r.width);
    if (Math.abs(lx - s.lookX) > .1 || Math.abs(ly - s.lookY) > .1 || !!s.smile !== near) { s.lookX = lx; s.lookY = ly; s.smile = near ? 1 : 0; paint(); }
  }, { passive: true });
  const glint = () => { s.glint = 1; s.smile = 1; paint(); setTimeout(() => { s.glint = 0; s.smile = near ? 1 : 0; paint(); }, 700); };
  cv.addEventListener('pointerdown', glint);
  if (reduced) return;
  // blink every few seconds, sometimes twice
  const blink = () => {
    s.blink = 1; paint();
    setTimeout(() => { s.blink = 0; paint(); if (Math.random() < .25) setTimeout(() => { s.blink = 1; paint(); setTimeout(() => { s.blink = 0; paint(); }, 110); }, 180); }, 130);
    setTimeout(blink, 2600 + Math.random() * 3200);
  };
  setTimeout(blink, 1800);
  // slow breathing and hair drift
  setInterval(() => { t0++; s.breathe = t0 % 4 < 2 ? 1 : 0; s.sway = (s.sway + 1) % 4; paint(); }, 900);
  // the pendant catches the light now and then
  setInterval(() => { if (Math.random() < .5) glint(); }, 7000);
}

window.Avatar = { draw, mount, W, H };
})();
