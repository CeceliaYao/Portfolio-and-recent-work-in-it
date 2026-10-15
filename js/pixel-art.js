/* Hand-drawn pixel sprites for the things in my room.
   Each grid row is one line of pixels; letters pick a colour from PAL.
   An ink outline is added around every sprite afterwards. */
(function () {
'use strict';

const PAL = {
  o: '#3a2a35', x: '#ffffff',
  w: '#fbf7ef', W: '#e3dccf', g: '#b9b0a4', G: '#7d7570',
  k: '#2c2730', K: '#4a4452',
  b: '#4fa3e0', B: '#2c6cad', c: '#a9d8f5', C: '#24477a',
  r: '#d9534a', R: '#9c2f3a', p: '#f6b3c4', P: '#d9789a',
  y: '#f5d061', Y: '#c9962e', n: '#a86a3d', N: '#6e4026',
  m: '#d9933f', M: '#6b3a1c', h: '#f3e2c0', H: '#d9bf8f',
  e: '#7cc36b', E: '#3f8a4a', j: '#8fd1a8', J: '#4f9a72', q: '#e8c27a', Q: '#b8853a',
  t: '#5fc9c2', T: '#2f8f8a', v: '#a78bdc', V: '#5d4a9b', l: '#dcd4f2', L: '#b3a6d8',
  s: '#f2c9a8', S: '#d9a07f', u: '#e8a14e', U: '#f6d9a8'
};

function canvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function outline(c, col) {
  const x = c.getContext('2d'), w = c.width, h = c.height, d = x.getImageData(0, 0, w, h).data, add = [];
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    if (d[(j * w + i) * 4 + 3]) continue;
    for (const [u, v] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const p = i + u, q = j + v;
      if (p >= 0 && q >= 0 && p < w && q < h && d[(q * w + p) * 4 + 3]) { add.push([i, j]); break; }
    }
  }
  x.fillStyle = col || PAL.o; add.forEach(([i, j]) => x.fillRect(i, j, 1, 1));
  return c;
}
/* rows → canvas with 1px padding for the outline */
function grid(rows) {
  const w = Math.max(...rows.map(r => r.length)), h = rows.length;
  const c = canvas(w + 2, h + 2), x = c.getContext('2d');
  rows.forEach((r, j) => [...r].forEach((ch, i) => { if (PAL[ch]) { x.fillStyle = PAL[ch]; x.fillRect(i + 1, j + 1, 1, 1); } }));
  return outline(c);
}
function draw(w, h, fn) { const c = canvas(w + 2, h + 2), x = c.getContext('2d'); x.translate(1, 1); fn(x, (a, b, cw, ch, col) => { x.fillStyle = PAL[col] || col; x.fillRect(a, b, cw, ch); }); return outline(c); }

const ART = {
  /* the white running visor I take on every walk */
  visor: () => grid([
    '.....wwwwww.....',
    '...wwwwwwwwww...',
    '..wwwwwwwwwrww..',
    '..WkkkkkkkkkkW..',
    '.WwwwwwwwwwwwwW.',
    'gwwwwwwwwwwwwwwg',
    'gWWWWWWWWWWWWWWg',
    '.gggggggggggggg.'
  ]),
  /* blue daypack, navy straps, a little sheep charm on the zip */
  backpack: () => grid([
    '......bbbbbbbb......',
    '....bbcccccccbbb....',
    '...bbcCCCCCCCCcbb...',
    '..bbcCbbbbbbbbCcbb..',
    '..bbCbbbbbbbbbbCbb..',
    '..bbbbbbCwwCbbbbbb..',
    '..bbbbbbCCCCbwwbbb..',
    '.CCCCCCCCggCCwkCCCC.',
    '.CbbbbbbbCbbbbbbbbC.',
    'CCCbbbbbbCbbbbbbbCCC',
    'CCCbbbbbbCbbbbbbbCCC',
    'CCCcbbbbbCbbbbbbcCCC',
    '.CCCCCCCCggCCCCCCCC.',
    '.CCbbbbbbCbbbbbbbCC.',
    '.CCbbbbbbCbbbbbbbCC.',
    '..bbbbbbbCbbbbbbbb..',
    '..bcbbbbbbbbbbbbcb..',
    '..bbbbbbbbbbbbbbbb..',
    '...BBBBBBBBBBBBBB...',
    '....BBBBBBBBBBBB....'
  ]),
  /* two trekking poles, pink and grey, leaning */
  poles: () => draw(12, 40, (x, R) => {
    // two poles leaning on the wall: black grips, wrist straps, pink upper shafts, grey lower shafts
    const pole = (x0) => {
      R(x0, 0, 3, 7, 'k'); R(x0 + 1, 1, 1, 5, 'K');
      R(x0 - 1, 1, 1, 6, 'P'); R(x0 - 2, 6, 1, 2, 'P');
      R(x0, 7, 3, 1, 'g');
      R(x0 + 1, 8, 2, 14, 'P'); R(x0 + 1, 8, 1, 14, 'p'); R(x0 + 1, 13, 2, 1, 'w');
      R(x0 + 1, 22, 2, 1, 'g');
      R(x0 + 1, 23, 2, 13, 'G'); R(x0 + 1, 23, 1, 13, 'g');
      R(x0, 34, 4, 1, 'k'); R(x0 + 1, 36, 2, 3, 'k'); R(x0 + 2, 39, 1, 1, 'K');
    };
    pole(2); pole(7);
  }),
  /* ten litres of water in a carton */
  water: () => grid([
    'bbbbbbbbbbbbbbbbbbbbbb',
    'bWWWWWWWWkkkkWWWWWWWWb',
    'bbbbbbbbbbbbbbbbbbbbbb',
    'bbbbwwwwwwwwwwwwwwwwwW',
    'bxbbwwwwwwwwwwwwwwwwwW',
    'bxbbwwwwBBwBwBwBBBwwwW',
    'bbbbwwwwBwwBwBwBwwwwwW',
    'bbbbwwwwwwwwwwwwwwwwwW',
    'bbbbwwwWWwwwwwwwwwwwwW',
    'bbbbwwWwwWwwwwwwwwwwwW',
    'bbbbwWwcwwWwwwwwwBBwwW',
    'bbbbwWccccWwwwwwwwwwwW',
    'bbbbwwWWWWwwwwwwwtwwwW',
    'bbbbwwwwwwwwwwwwwwwwwW',
    'BBBBWWWWWWWWWWWWWWWWWg'
  ]),
  /* console standing up, controller resting beside it */
  ps5: () => draw(26, 32, (x, R) => {
    R(2, 1, 9, 30, 'w'); R(3, 0, 7, 1, 'w'); R(2, 1, 1, 30, 'W'); R(10, 2, 1, 28, 'W');
    R(2, 15, 9, 1, 'g');
    R(11, 2, 3, 28, 'k'); R(12, 3, 1, 26, 'K');
    R(14, 1, 2, 30, 'w'); R(15, 2, 1, 28, 'W');
    R(1, 30, 16, 2, 'W'); R(5, 4, 2, 2, 'g');
    // controller
    const C = ['.wwwwwwww.', 'wwkwwwwkww', 'wkkkwwkwkw', 'wwkwkkwkww', 'www....www', '.w......w.'];
    C.forEach((r, j) => [...r].forEach((ch, i) => { if (ch !== '.') R(16 + i, 25 + j, 1, 1, ch); }));
  }),
  /* Picasso, Weeping Woman, as a souvenir magnet */
  picasso: () => grid([
    'vvvvvvvvvv',
    'vrrrbrrrGv',
    'vkkyyyyyGv',
    'vkeekyekGv',
    'vkeeeeelGv',
    'vkkerewwGv',
    'vkkeeWwwlv',
    'vkkkeWwwlv',
    'vkkkkeGGGv',
    'vvvvvvvvvv',
    'VVVVVVVVVV'
  ]),
  /* a Hongshan jade dragon resting in an ancient Chinese wine cup */
  jade: () => grid([
    'QQ............',
    '.Qqq..qqqq....',
    '..qqqqQ...qq..',
    '..qq.......q..',
    '.qq........qq.',
    '.qQ........qQ.',
    'hqqhhhhhhhhqqh',
    'hhqqhhhhhhqqhh',
    '.hhpqqqqqqphh.',
    '..hpppppppph..',
    '...hppPPpph...',
    '.....hjjh.....',
    '......jj......',
    '......JJ......',
    '....jjJJjj....'
  ]),
  /* fuse-bead spritz I made myself */
  /* the shrimp cocktail from Rusty Lake, in fuse beads */
  beads: () => grid([
    '.....PP.....',
    '....PpP..gg.',
    '....pPp.gg..',
    '...ppPpg....',
    '...pPppg.yy.',
    '..PpPpg.yyyY',
    'wwPpppwwyyYw',
    'wrRrprrryYrw',
    'wrrRrrrrrrrw',
    '.wrrrRrrRrw.',
    '.wrRrrrrrrw.',
    '..wrrrRrrw..',
    '...wrrrrw...',
    '....wwww....',
    '.....hh.....',
    '.....hh.....',
    '.....hh.....',
    '.....hh.....',
    '....hhhh....',
    '...NhhhhN...'
  ]),
  /* Islay single malt */
  whisky: () => grid([
    '..hh...',
    '..TT...',
    '..MM...',
    '..MM...',
    '.MMMM..',
    'MMMMMMM',
    'MMhhhMM',
    'MhhYhhM',
    'MMhhhMM',
    'MMMMMMM',
    'MhhhhhM',
    'MhrrhhM',
    'MhhrhhM',
    'MhhhhhM',
    'MMMMMMM',
    'MMMMMMM'
  ]),
  /* double oaked bourbon in its flat bottle */
  bourbon: () => grid([
    '...NN....',
    '...hh....',
    '...mm....',
    '..mmmm...',
    '.mmmmmmm.',
    'mmmmmmmmm',
    'mUmmmmmUm',
    'mmhhhhhmm',
    'mmhkkkhmm',
    'mmhhhhhmm',
    'mmmmmmmmm',
    'mUmmmmmMm',
    '.mmmmmmm.'
  ]),
  /* Australian dry gin with the round ink label */
  gin: () => grid([
    '..ww....',
    '..ww....',
    '..lc....',
    '..lc....',
    '.llll...',
    'llllllll',
    'llwwwwll',
    'lwwVVwwl',
    'lwVwwwwl',
    'lwwVVwwl',
    'llwwwwll',
    'llllllll',
    'lhhhhhhl',
    'lhVVVVhl',
    'lhhhhhhl',
    'llllllll',
    'cccccccc'
  ]),
  /* a teahouse in pine and moonlight, and a pink rose */
  perfume: () => draw(15, 13, (x, R) => {
    const a = ['.kkk..', '.kkk..', 'mmmmmm', 'mhhhhm', 'mhGGhm', 'mhghhm', 'mhhhhm', 'mmmmmm', 'MMMMMM'];
    const b = ['..rr..', '..rr..', '..Rr..', 'pccccp', 'pwwwwp', 'pwrwwp', 'pwwwwp', 'pwwwwp', 'pwwwwp', 'pppppp', 'pPPPPp'];
    a.forEach((r, j) => [...r].forEach((ch, i) => { if (ch !== '.') R(i, 4 + j, 1, 1, ch); }));
    b.forEach((r, j) => [...r].forEach((ch, i) => { if (ch !== '.') R(8 + i, 2 + j, 1, 1, ch); }));
  }),
  /* sleepy cat planter with a flowering succulent */
  catpot: () => grid([
    '.........y.y.',
    '..........y..',
    '..........e..',
    '.........e...',
    '........e....',
    '...e.e.e.....',
    '..eEeEee.....',
    '.eeEeEeEe....',
    '..kkkkkkk....',
    '..wwkkkww....',
    '.wwwwwwwww...',
    '.wBBwwwBBw...',
    '.wwwwmwwww...',
    '.YwwwwwwwY...',
    '.Bwwwwwwwy...',
    '.YwwwwwwwY...',
    '.Bwwwwwwwy...',
    '..wwwwwww....'
  ]),
  /* small succulent bedded in yellow pebbles */
  succulent: () => grid([
    '...e...e....',
    '..eEe.eEe...',
    '..EeE.EeE...',
    '..eEe.eEe...',
    '..EeE.EeE...',
    'yyyEyyyEyyy.',
    'kyyyyyyyyyk.',
    'kkkkkkkkkkk.',
    '.kKkkkkkkk..',
    '.kKkkkkkkk..',
    '.kKkkkkkkk..',
    '..kkkkkkk...'
  ]),
  /* fairy lights for the night */
  bulbs: ['#ffd95a', '#ff8fb1', '#8fe3d0', '#c3a6ff']
};

window.PixelArt = { PAL, grid, draw, outline, ART };
})();
