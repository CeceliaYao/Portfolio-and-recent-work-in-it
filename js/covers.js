/* Pixel covers for the work list, drawn at 160 x 90. */
(function () {
'use strict';
const { canvas, R, dither, ellipse, line } = window.PixelRoom;
const CW = 160, CH = 90;

const COVERS = {
  nextChapter(x) {
    // a warm Y2K bedroom: orange wall, pink rug, Teddy on the bed, moving box
    R(x, 0, 0, CW, 58, '#ffb46b'); dither(x, 0, 0, CW, 58, '#ff9a4d', .3);
    R(x, 0, 58, CW, 32, '#ffd0ea'); dither(x, 0, 74, CW, 16, '#ff9fd6', .35);
    R(x, 18, 12, 34, 28, '#fff4e6'); R(x, 20, 14, 30, 24, '#8fcfff'); R(x, 34, 14, 2, 24, '#fff4e6'); R(x, 20, 25, 30, 2, '#fff4e6');
    R(x, 86, 40, 60, 10, '#fff4e6'); R(x, 82, 50, 68, 18, '#c3a6ff'); R(x, 82, 50, 68, 3, '#e6d8ff');
    ellipse(x, 100, 44, 6, 6, '#c98a52'); ellipse(x, 95, 38, 2.5, 2.5, '#c98a52'); ellipse(x, 105, 38, 2.5, 2.5, '#c98a52');
    R(x, 98, 43, 1, 1, '#2a1f1a'); R(x, 102, 43, 1, 1, '#2a1f1a'); R(x, 99, 46, 3, 1, '#8e5634');
    R(x, 30, 64, 30, 18, '#d79b5b'); R(x, 30, 64, 30, 4, '#ecbc84'); R(x, 44, 64, 2, 18, '#c47a2c');
    R(x, 120, 16, 22, 3, '#fff4e6'); for (let i = 0; i < 4; i++) R(x, 122 + i * 5, 10, 3, 6, ['#00b5ff', '#ff5400', '#ffc700', '#8de328'][i]);
  },
  echoCorridor(x) {
    R(x, 0, 0, CW, CH, '#0b0d1a');
    const map = ['################', '#..#......#....#', '#..#.####.#.##.#', '#.....#......#.#', '###.#.#.####.#.#', '#...#...#......#', '#.###.#.#.####.#', '#.....#........#', '################'];
    for (let j = 0; j < map.length; j++) for (let i = 0; i < 16; i++) if (map[j][i] === '#') { R(x, i * 10, j * 10, 10, 10, '#1d2440'); R(x, i * 10, j * 10, 10, 1, '#2f3a66'); }
    // sound rings from footsteps
    for (const [cx, cy, r, a] of [[25, 35, 9, .9], [45, 35, 6, .6], [65, 55, 4, .35]]) { x.globalAlpha = a; x.strokeStyle = '#5fe0ff'; x.lineWidth = 1; x.beginPath(); x.arc(cx, cy, r, 0, 7); x.stroke(); }
    x.globalAlpha = 1;
    R(x, 22, 32, 6, 6, '#5fe0ff'); R(x, 23, 33, 4, 4, '#b5fff4');
    for (const [sx, sy] of [[92, 52], [124, 32]]) { R(x, sx, sy, 7, 8, '#ff5fb4'); R(x, sx + 1, sy + 2, 2, 2, '#fff'); R(x, sx + 4, sy + 2, 2, 2, '#fff'); dither(x, sx - 2, sy + 8, 11, 3, '#ff5fb4', .4); }
    for (const [gx, gy] of [[75, 15], [135, 75], [15, 75]]) { R(x, gx, gy, 3, 3, '#ffd95a'); R(x, gx + 1, gy - 1, 1, 5, '#fff6b8'); }
    R(x, 142, 12, 6, 7, '#6fd88a');
  },
  shopMirror(x) {
    R(x, 0, 0, CW, CH, '#efe9f6'); R(x, 80, 0, 80, CH, '#e5f4ec');
    const phone = (px, dark) => {
      R(x, px, 8, 44, 76, '#2a1f1a'); R(x, px + 3, 12, 38, 66, dark ? '#2b1720' : '#ffffff');
      if (dark) {
        R(x, px + 6, 16, 32, 20, '#ff6478'); R(x, px + 8, 18, 14, 3, '#fff'); R(x, px + 8, 24, 22, 2, '#ffd0d6');
        R(x, px + 6, 40, 32, 7, '#ffd95a'); R(x, px + 10, 42, 10, 3, '#2a1f1a');
        R(x, px + 6, 52, 32, 10, '#c4304e'); R(x, px + 12, 55, 20, 4, '#fff');
        dither(x, px + 6, 66, 32, 8, '#6b3a4a', .6);
      } else {
        R(x, px + 6, 16, 32, 20, '#c8f7cf'); R(x, px + 8, 18, 14, 3, '#3a9a62'); R(x, px + 8, 24, 22, 2, '#6fd88a');
        R(x, px + 6, 40, 32, 14, '#f3f8ff'); R(x, px + 8, 42, 4, 4, '#5a86e6'); R(x, px + 14, 43, 20, 2, '#8fcfff'); R(x, px + 14, 48, 16, 2, '#d2f0ff');
        R(x, px + 6, 58, 32, 8, '#3a9a62'); R(x, px + 12, 61, 20, 2, '#fff');
        R(x, px + 6, 70, 14, 4, '#e4def4'); R(x, px + 24, 70, 14, 4, '#e4def4');
      }
    };
    phone(18, true); phone(98, false);
    R(x, 78, 30, 4, 30, '#2a1f1a'); R(x, 76, 42, 8, 6, '#ffd95a');
  },
  relaxMake(x) {
    R(x, 0, 0, CW, 40, '#bfe6f5'); dither(x, 0, 30, CW, 10, '#d9f0fa', .5);
    R(x, 0, 40, CW, 50, '#8fcf6a'); dither(x, 0, 40, CW, 50, '#76b955', .3);
    for (const tx of [14, 132]) { R(x, tx + 6, 20, 4, 22, '#8e5634'); ellipse(x, tx + 8, 16, 13, 11, '#3a9a62'); ellipse(x, tx + 5, 13, 6, 5, '#6fd88a'); }
    // fluorescent ground painting
    const cols = ['#ff5fb4', '#ffd95a', '#5fe0d0', '#c3a6ff'];
    for (let i = 0; i < 4; i++) { x.globalAlpha = .9; ellipse(x, 52 + i * 18, 64 + (i % 2) * 8, 9, 5, cols[i]); }
    x.globalAlpha = 1;
    line(x, 44, 64, 112, 70, '#fff6b8');
    // wind chimes
    R(x, 70, 6, 30, 2, '#8e5634'); for (let i = 0; i < 5; i++) { line(x, 72 + i * 6, 8, 72 + i * 6, 16 + i % 3 * 4, '#7b838b'); R(x, 71 + i * 6, 16 + i % 3 * 4, 3, 7, ['#ff9fd6', '#8fcfff', '#ffd95a', '#b5fff4', '#c3a6ff'][i]); }
    // coasters
    for (const [cx, cy, c] of [[124, 74, '#fff4e6'], [138, 80, '#ffd0ea']]) { ellipse(x, cx, cy, 7, 4, c); ellipse(x, cx, cy, 3, 2, '#ff6478'); }
    R(x, 20, 70, 14, 14, '#ffffff'); for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) if ((i * 3 + j * 5) % 3) R(x, 22 + i * 3, 72 + j * 3, 2, 2, '#2a1f1a');
  },
  astrobius(x) {
    // grey paper, a chrome loop letter and orbiting dots
    R(x, 0, 0, CW, CH, '#d6d6d4'); dither(x, 0, 0, CW, CH, '#cbcbc8', .25);
    for (let a = 0; a < Math.PI * 2; a += .02) {
      const r = 26 + Math.sin(a * 3) * 8, px = 80 + Math.cos(a) * r * 1.3, py = 44 + Math.sin(a) * r * .9;
      ellipse(x, px, py, 5, 5, '#1d1d1f');
    }
    for (let a = 0; a < Math.PI * 2; a += .03) {
      const r = 26 + Math.sin(a * 3) * 8, px = 80 + Math.cos(a) * r * 1.3, py = 44 + Math.sin(a) * r * .9;
      ellipse(x, px - 1, py - 1, 2.6, 2.6, a % 1 < .5 ? '#f4f4f6' : '#9a9aa2');
    }
    for (const [dx, dy, r] of [[24, 70, 4], [134, 18, 3], [140, 66, 5], [36, 16, 2]]) ellipse(x, dx, dy, r, r, '#1d1d1f');
  },
  myRoom(x) {
    // drawn from the real room render if it exists
    const src = document.querySelector('.px-base');
    if (src) { x.drawImage(src, 70, 20, 380, 214, 0, 0, CW, CH); return; }
    R(x, 0, 0, CW, 56, '#efe6d2'); R(x, 0, 56, CW, 34, '#b9a791');
  }
};

function drawCover(name) {
  const [c, x] = canvas(CW, CH);
  (COVERS[name] || COVERS.myRoom)(x);
  x.strokeStyle = '#2a1f1a'; x.lineWidth = 1;
  return c;
}
window.PixelCovers = { drawCover, CW, CH };
})();
