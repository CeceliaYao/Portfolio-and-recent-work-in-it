/* ==========================================================
   Pixel room engine
   The room is painted at 480 x 270 art pixels and scaled up
   with no smoothing. Light, glow and depth of field live on a
   second, full-resolution layer above it (an HD-2D style split:
   crisp pixels, soft light).
   ========================================================== */
(function () {
'use strict';

const W = 480, H = 270;
const ROOT = (document.currentScript && document.currentScript.dataset.root) || './';

const C = {
  ink: '#2a1f1a', inkSoft: '#4a3a33',
  beam: '#5c4436', beamHi: '#7a5a46',
  wall: '#efe6d2', wallHi: '#f8f1e3', wallSh: '#e2d6bd', wallDk: '#cdbd9f',
  side: '#d8c9ab', sideDk: '#c4b392',
  base: '#f6f1e6', baseSh: '#d8cfbd',
  rug: '#b9a791', rugHi: '#c9b9a3', rugDk: '#a7937b', rugDk2: '#95816b',
  birch: '#dcb88c', birchHi: '#ebcfa6', birchDk: '#b88c5c',
  white: '#f7f4ec', whiteSh: '#dcd6c9', whiteDk: '#bdb5a5',
  plum: '#4b3f86', plumHi: '#6b5fae', plumDk: '#33295f',
  sheer: '#fbf7ef',
  sky: '#a8d6f0', skyHi: '#d9f0fa', hill: '#7f9fb4', hillDk: '#6c8aa0', city: '#c3cfd8', cityDk: '#9fb0bd',
  steel: '#cfd4d8', steelHi: '#eef1f3', steelDk: '#9aa2a9', steelDk2: '#7b838b',
  chair: '#2f2c33', chairHi: '#4a4650', chairDk: '#1f1c22',
  screen: '#1d2a4a', screenHi: '#7fe3ff', glow: '#ffe7a8'
};

/* ---------- tiny canvas helpers ---------- */
function canvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); x.imageSmoothingEnabled = false; return [c, x]; }
function R(x, a, b, w, h, c) { x.fillStyle = c; x.fillRect(a | 0, b | 0, w | 0, h | 0); }
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
function dither(x, a, b, w, h, c, level) {           // level 0..1, ordered dither
  x.fillStyle = c;
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    if (BAYER[((b + j) & 3) * 4 + ((a + i) & 3)] / 16 < level) x.fillRect(a + i, b + j, 1, 1);
  }
}
function ellipse(x, cx, cy, rx, ry, c) {
  x.fillStyle = c;
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++)
    for (let i = Math.floor(cx - rx); i <= Math.ceil(cx + rx); i++) {
      const dx = (i + .5 - cx) / rx, dy = (y + .5 - cy) / ry;
      if (dx * dx + dy * dy <= 1) x.fillRect(i, y, 1, 1);
    }
}
function line(x, x0, y0, x1, y1, c) {
  x.fillStyle = c;
  let dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1, e = dx + dy;
  for (;;) { x.fillRect(x0, y0, 1, 1); if (x0 === x1 && y0 === y1) break; const e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } }
}
/* Adds a 1px ink outline around everything already drawn in a sprite canvas. */
function outline(cv, col) {
  const x = cv.getContext('2d'), w = cv.width, h = cv.height;
  const d = x.getImageData(0, 0, w, h), a = d.data, out = new Uint8Array(w * h);
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    if (a[(j * w + i) * 4 + 3]) continue;
    for (const [u, v] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const p = i + u, q = j + v;
      if (p >= 0 && q >= 0 && p < w && q < h && a[(q * w + p) * 4 + 3]) { out[j * w + i] = 1; break; }
    }
  }
  x.fillStyle = col || C.ink;
  for (let k = 0; k < w * h; k++) if (out[k]) x.fillRect(k % w, (k / w) | 0, 1, 1);
  return cv;
}
/* A soft halo sprite used for hover: the sprite's silhouette grown by 1px. */
function halo(img, col) {
  const [c, x] = canvas(img.width + 2, img.height + 2);
  x.drawImage(img, 1, 1);
  const d = x.getImageData(0, 0, c.width, c.height), a = d.data, out = new Uint8Array(c.width * c.height);
  for (let j = 0; j < c.height; j++) for (let i = 0; i < c.width; i++) {
    if (a[(j * c.width + i) * 4 + 3] > 0) { out[j * c.width + i] = 2; continue; }
    for (const [u, v] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const p = i + u, q = j + v;
      if (p >= 0 && q >= 0 && p < c.width && q < c.height && a[(q * c.width + p) * 4 + 3] > 0) { out[j * c.width + i] = 1; break; }
    }
  }
  x.clearRect(0, 0, c.width, c.height); x.fillStyle = col || '#fff6cf';
  for (let k = 0; k < out.length; k++) if (out[k] === 1) x.fillRect(k % c.width, (k / c.width) | 0, 1, 1);
  return c;
}

/* ---------- hand-drawn sprites (things not photographed) ---------- */
function spritePenguin() {
  const [c, x] = canvas(14, 16);
  ellipse(x, 7, 10, 5.5, 5.5, '#2d3346');            // body
  ellipse(x, 7, 11, 3.6, 4.2, '#f4f1ea');             // belly
  R(x, 4, 7, 6, 3, '#f4f1ea');                        // face
  R(x, 5, 8, 1, 1, C.ink); R(x, 8, 8, 1, 1, C.ink);
  R(x, 6, 9, 2, 1, '#f2a541');                        // beak
  R(x, 3, 3, 8, 4, '#8fb8e8'); R(x, 3, 6, 8, 1, '#6d97cf');   // beanie
  R(x, 6, 1, 2, 2, '#f4f1ea');                        // pompom
  R(x, 4, 15, 2, 1, '#f2a541'); R(x, 8, 15, 2, 1, '#f2a541');
  return outline(c);
}
function spriteKitty() {
  const [c, x] = canvas(22, 26);
  // overalls body
  ellipse(x, 11, 19, 7, 6, '#8b7bd1'); R(x, 6, 14, 10, 4, '#f4d35e');
  R(x, 4, 15, 3, 4, '#f4d35e'); R(x, 15, 15, 3, 4, '#f4d35e');           // sleeves
  R(x, 4, 19, 3, 2, '#fbf8f2'); R(x, 15, 19, 3, 2, '#fbf8f2');           // paws
  R(x, 8, 15, 6, 4, '#8b7bd1');
  // head
  ellipse(x, 11, 8, 9, 6.5, '#fbf8f2');
  R(x, 3, 1, 3, 3, '#fbf8f2'); R(x, 16, 1, 3, 3, '#fbf8f2');             // ears
  R(x, 14, 1, 5, 3, '#8b7bd1'); R(x, 16, 2, 1, 1, '#b7a8f0');            // bow
  R(x, 6, 8, 1, 2, C.ink); R(x, 15, 8, 1, 2, C.ink);
  R(x, 10, 10, 2, 1, '#f4d35e');
  R(x, 2, 9, 3, 1, '#c9c2b4'); R(x, 17, 9, 3, 1, '#c9c2b4');             // whiskers
  ellipse(x, 11, 23, 5, 2, '#8b7bd1');
  return outline(c);
}
function spriteMonitor() {
  const [c, x] = canvas(48, 40);
  R(x, 0, 0, 48, 31, '#26232a'); R(x, 2, 2, 44, 27, C.screen);
  R(x, 21, 31, 6, 5, '#3a363f'); R(x, 14, 36, 20, 3, '#3a363f'); R(x, 14, 36, 20, 1, '#55505b');
  return outline(c);
}
function spriteLamp() {
  const [c, x] = canvas(26, 34);
  ellipse(x, 6, 31, 6, 2.2, C.white);
  line(x, 6, 30, 6, 12, C.white); line(x, 7, 30, 7, 12, C.whiteSh);
  line(x, 6, 12, 18, 3, C.white); line(x, 6, 13, 18, 4, C.whiteSh);
  R(x, 12, 2, 13, 3, C.white); R(x, 13, 5, 11, 1, '#fff2c4');
  return outline(c);
}
function spriteWindow() { const [c] = canvas(88, 98); return c; } // painted live; used for hit area
function spriteDoor() { const [c] = canvas(40, 88); return c; }

/* Cecelia, for the game. dir: 0 down, 1 up, 2 left, 3 right; f: walk frame */
function spriteGirl(dir, f) {
  const [c, x] = canvas(16, 28);
  const skin = '#f2cdb0', hair = '#2b1d1a', hairHi = '#4a3129', top = '#7fc6e6', topDk = '#5aa6cc', pant = '#3b3a4a', shoe = '#f4f1ea';
  const bob = (f === 1 || f === 3) ? 1 : 0;
  const ly = f === 1 ? 1 : 0, ry = f === 3 ? 1 : 0;
  // legs
  R(x, 5, 20, 2, 6 - ly, pant); R(x, 9, 20, 2, 6 - ry, pant);
  R(x, 4, 26 - ly, 3, 2, shoe); R(x, 9, 26 - ry, 3, 2, shoe);
  // body
  R(x, 4, 13 + bob, 8, 8, top); R(x, 4, 19 + bob, 8, 2, topDk);
  R(x, 2, 14 + bob, 2, 6, top); R(x, 12, 14 + bob, 2, 6, top);
  R(x, 2, 20 + bob, 2, 1, skin); R(x, 12, 20 + bob, 2, 1, skin);
  // head
  ellipse(x, 8, 7 + bob, 5.2, 5.4, skin);
  if (dir === 1) { ellipse(x, 8, 7 + bob, 5.6, 5.8, hair); R(x, 3, 8 + bob, 10, 8, hair); }
  else {
    R(x, 3, 2 + bob, 10, 3, hair); R(x, 2, 4 + bob, 2, 11, hair); R(x, 12, 4 + bob, 2, 11, hair);
    R(x, 4, 1 + bob, 8, 1, hair); R(x, 5, 2 + bob, 4, 1, hairHi);
    if (dir === 0) { R(x, 5, 8 + bob, 1, 2, C.ink); R(x, 10, 8 + bob, 1, 2, C.ink); R(x, 4, 10 + bob, 1, 1, '#f3a3a0'); R(x, 11, 10 + bob, 1, 1, '#f3a3a0'); }
    if (dir === 2) { R(x, 8, 2 + bob, 6, 13, hair); R(x, 4, 8 + bob, 1, 2, C.ink); }
    if (dir === 3) { R(x, 2, 2 + bob, 6, 13, hair); R(x, 11, 8 + bob, 1, 2, C.ink); }
  }
  return outline(c);
}

/* ---------- the static room, painted once ---------- */
function paintRoom(x) {
  // ceiling beam + back wall
  R(x, 0, 0, W, 10, C.beam); R(x, 0, 9, W, 1, C.beamHi);
  R(x, 0, 10, W, 158, C.wall);
  // wallpaper: faint pixel diamonds, Stardew-style
  for (let y = 22; y < 160; y += 14) for (let i = (y / 14 & 1) * 9; i < W; i += 18) { R(x, i, y, 1, 1, C.wallSh); R(x, i - 1, y + 1, 3, 1, C.wallSh); R(x, i, y + 2, 1, 1, C.wallSh); }
  dither(x, 0, 10, W, 14, C.wallSh, .35);
  // side walls (slight perspective)
  x.fillStyle = C.side; x.beginPath(); x.moveTo(0, 0); x.lineTo(26, 10); x.lineTo(26, 168); x.lineTo(0, 196); x.fill();
  x.beginPath(); x.moveTo(W, 0); x.lineTo(W - 18, 10); x.lineTo(W - 18, 168); x.lineTo(W, 190); x.fill();
  dither(x, 0, 10, 26, 180, C.sideDk, .25);
  R(x, 26, 10, 1, 158, C.wallDk); R(x, W - 19, 10, 1, 158, C.wallDk);
  // floor / carpet
  R(x, 0, 168, W, H - 168, C.rug);
  for (let j = 168; j < H; j++) for (let i = 0; i < W; i++) {
    const n = (i * 7 + j * 13 + (i * j) % 7) % 11;
    if (n === 0) R(x, i, j, 1, 1, C.rugDk); else if (n === 5 && j > 190) R(x, i, j, 1, 1, C.rugHi);
  }
  dither(x, 0, 236, W, 34, C.rugDk2, .3);
  // skirting board
  R(x, 26, 164, W - 45, 4, C.base); R(x, 26, 167, W - 45, 1, C.baseSh);

  // ---- door (open, hallway beyond) ----
  R(x, 34, 78, 44, 90, C.white); R(x, 37, 81, 38, 87, '#6f6253');
  dither(x, 37, 81, 38, 87, '#5b4f43', .5);
  R(x, 37, 150, 38, 18, '#8a7a66'); R(x, 37, 81, 38, 6, '#857563');
  R(x, 30, 80, 6, 90, '#e9e2d4'); R(x, 30, 80, 1, 90, C.whiteDk);   // door leaf open against wall
  R(x, 33, 124, 2, 3, '#c9a36a');

  // ---- coat hooks ----
  R(x, 82, 92, 30, 2, C.birchDk); R(x, 86, 94, 2, 3, C.steelDk); R(x, 104, 94, 2, 3, C.steelDk);

  // ---- wall shelf + brackets (like the real one) ----
  R(x, 120, 92, 66, 4, C.white); R(x, 120, 95, 66, 1, C.whiteSh);
  for (const bx of [128, 172]) { line(x, bx, 96, bx, 112, C.birchDk); line(x, bx + 1, 96, bx + 1, 112, C.birch); line(x, bx + 1, 97, bx + 9, 96, C.birch); line(x, bx + 1, 110, bx + 9, 97, C.birch); }

  // ---- desk ----
  R(x, 112, 142, 124, 14, C.birch); R(x, 112, 142, 124, 2, C.birchHi);
  dither(x, 112, 150, 124, 6, C.birchDk, .25);
  R(x, 112, 156, 124, 3, C.white); R(x, 112, 158, 124, 1, C.whiteSh);
  for (const lx of [116, 228]) { R(x, lx, 159, 3, 36, C.white); R(x, lx + 2, 159, 1, 36, C.whiteSh); }
  R(x, 118, 159, 3, 12, C.whiteSh); R(x, 226, 159, 3, 12, C.whiteSh);
  R(x, 112, 141, 124, 1, C.ink); R(x, 111, 141, 1, 18, C.ink); R(x, 236, 141, 1, 18, C.ink); R(x, 112, 159, 124, 1, C.ink);
  // keyboard + mouse + mat
  R(x, 150, 148, 40, 5, '#2b2a30'); R(x, 152, 149, 36, 3, '#3d3b44');
  R(x, 196, 148, 14, 7, '#2b2a30'); R(x, 200, 150, 4, 3, '#4a4752');
  // power board on the floor (it is in the photo, so it stays)
  R(x, 160, 214, 14, 4, C.white); R(x, 160, 217, 14, 1, C.whiteDk); R(x, 163, 215, 2, 1, '#e24b3c');

  // ---- mini fridge ----
  R(x, 242, 122, 36, 74, C.steel); R(x, 242, 122, 36, 3, C.steelHi);
  for (let i = 0; i < 36; i += 3) R(x, 242 + i, 125, 1, 71, '#c6cbd0');
  R(x, 244, 140, 3, 50, C.steelHi); R(x, 272, 128, 2, 18, C.steelDk2);
  R(x, 242, 160, 36, 1, C.steelDk);
  x.strokeStyle = C.ink; x.lineWidth = 1; x.strokeRect(241.5, 121.5, 37, 75);
  R(x, 243, 196, 34, 2, '#00000033');

  // ---- black rack (the real one holds shoes; here it holds the bar) ----
  R(x, 286, 104, 2, 92, '#24222a'); R(x, 322, 104, 2, 92, '#24222a');
  for (const sy of [128, 160, 192]) { R(x, 284, sy, 42, 3, '#2e2b33'); R(x, 284, sy, 42, 1, '#4a4650'); }
  R(x, 296, 186, 8, 6, '#e9e5dc'); R(x, 306, 187, 9, 5, '#3a3a46'); R(x, 296, 186, 8, 1, C.ink); R(x, 306, 187, 9, 1, C.ink); // shoes peeking

  // ---- bed ----
  R(x, 332, 124, 132, 40, C.white); R(x, 332, 124, 132, 2, '#ffffff'); R(x, 332, 156, 132, 8, C.whiteSh);
  x.strokeStyle = C.ink; x.strokeRect(331.5, 123.5, 133, 41);
  // mattress + sheet
  R(x, 326, 160, 146, 76, '#ece7dc'); dither(x, 326, 160, 146, 76, '#e1dacb', .25);
  // pillows
  for (const px of [338, 386]) { R(x, px, 162, 42, 16, '#fbf9f4'); R(x, px, 174, 42, 4, C.whiteSh); R(x, px + 2, 163, 38, 1, '#ffffff'); x.strokeStyle = C.ink; x.strokeRect(px - .5, 161.5, 43, 17); }
  // duvet: folded band, then the chevron tufting from the real one
  R(x, 326, 182, 146, 54, C.white); R(x, 326, 182, 146, 6, '#ffffff'); R(x, 326, 188, 146, 2, C.whiteSh);
  for (let j = 194; j < 234; j += 7) for (let i = 0; i < 146; i++) {
    const yy = j + Math.abs(((i + 3) % 16) - 8) - 4;
    if (yy > 190 && yy < 235) { R(x, 326 + i, yy, 1, 1, '#ddd5c6'); if (i % 2) R(x, 326 + i, yy + 1, 1, 1, '#ebe5da'); }
  }
  dither(x, 326, 222, 146, 14, C.whiteSh, .4);
  // the overhang, with a soft wavy hem
  R(x, 324, 236, 150, 14, '#f1ede4'); dither(x, 324, 236, 150, 14, C.whiteSh, .3);
  for (let i = 0; i < 150; i++) R(x, 324 + i, 249 + (((i / 6) | 0) % 2), 1, 1, C.whiteDk);
  R(x, 326, 251, 146, 9, C.whiteSh); R(x, 398, 252, 1, 8, C.whiteDk); R(x, 360, 255, 6, 1, C.whiteDk); R(x, 432, 255, 6, 1, C.whiteDk);
  x.strokeStyle = C.ink; x.beginPath(); x.moveTo(325.5, 236); x.lineTo(325.5, 160.5); x.lineTo(472.5, 160.5); x.lineTo(472.5, 236); x.stroke();
  x.strokeRect(323.5, 235.5, 151, 15); x.strokeRect(325.5, 250.5, 147, 10);
  R(x, 326, 261, 146, 3, '#00000022');

  // ---- rug ----
  { const rx = 86, ry = 226, rw = 214, rh = 34;
    R(x, rx, ry, rw, rh, '#c9a3c9'); R(x, rx + 3, ry + 3, rw - 6, rh - 6, '#e7c6dc');
    for (let i = 0; i < rw - 12; i += 12) { R(x, rx + 8 + i, ry + 12, 6, 2, '#b07fb4'); R(x, rx + 10 + i, ry + 10, 2, 6, '#b07fb4'); }
    R(x, rx + 3, ry + rh - 6, rw - 6, 3, '#c9a3c9');
    for (let i = 0; i < rw; i += 3) { R(x, rx + i, ry - 2, 1, 2, '#e7c6dc'); R(x, rx + i, ry + rh, 1, 2, '#e7c6dc'); }
    x.strokeStyle = C.ink; x.strokeRect(rx - .5, ry - .5, rw + 1, rh + 1); }
  // ---- office chair (in front of the desk) ----
  R(x, 150, 160, 34, 30, C.chair); R(x, 152, 162, 30, 3, C.chairHi);
  R(x, 146, 186, 42, 8, C.chairDk); R(x, 146, 186, 42, 2, C.chairHi);
  R(x, 142, 172, 6, 3, C.chair); R(x, 186, 172, 6, 3, C.chair); R(x, 142, 172, 3, 14, C.chair); R(x, 189, 172, 3, 14, C.chair);
  R(x, 165, 194, 4, 18, '#18161b'); R(x, 150, 212, 34, 3, '#18161b');
  for (const wx of [148, 165, 182]) R(x, wx, 215, 4, 3, '#18161b');
  x.strokeStyle = C.ink; x.strokeRect(149.5, 159.5, 35, 31);
  R(x, 140, 222, 50, 3, '#00000022');
  // cable for the lamp, because there always is one
  line(x, 120, 159, 112, 210, '#ffffff'); line(x, 112, 210, 96, 230, '#ffffff');
}

/* ---------- live layer: window, screen, sprites ---------- */
function paintWindow(x, t, night) {
  const X = 340, Y = 22, WW = 80, HH = 92;
  // sky
  const top = night ? '#1b2142' : C.sky, bot = night ? '#3a3f6e' : C.skyHi;
  for (let j = 0; j < HH; j++) {
    const k = j / HH;
    R(x, X, Y + j, WW, 1, k < .55 ? top : bot);
    if (k >= .45 && k < .55 && (j & 1)) dither(x, X, Y + j, WW, 1, bot, .5);
  }
  if (night) { for (let i = 0; i < 14; i++) { const sx = X + (i * 37) % WW, sy = Y + (i * 23) % 40; if (((t / 600 + i) | 0) % 5) R(x, sx, sy, 1, 1, '#fff6d8'); } ellipse(x, X + 60, Y + 14, 4, 4, '#fff3c8'); ellipse(x, X + 62, Y + 13, 3, 3, top); }
  else {
    const cx = X + ((t / 260) % (WW + 40)) - 20;
    for (const [dx, dy, r] of [[0, 18, 5], [6, 16, 6], [13, 18, 5]]) ellipse(x, cx + dx, Y + dy, r, r * .6, '#ffffff');
  }
  // hills + city
  x.fillStyle = night ? '#2b3158' : C.hill; x.beginPath(); x.moveTo(X, Y + 62); x.lineTo(X + 18, Y + 50); x.lineTo(X + 34, Y + 56); x.lineTo(X + 52, Y + 44); x.lineTo(X + 70, Y + 54); x.lineTo(X + WW, Y + 50); x.lineTo(X + WW, Y + HH); x.lineTo(X, Y + HH); x.fill();
  for (let i = 0; i < 9; i++) {
    const bw = 6 + (i * 5) % 7, bh = 10 + (i * 11) % 20, bx = X + i * 9;
    R(x, bx, Y + HH - bh, bw, bh, night ? '#252a4a' : (i & 1 ? C.city : C.cityDk));
    for (let wy = Y + HH - bh + 2; wy < Y + HH - 2; wy += 3) for (let wx = bx + 1; wx < bx + bw - 1; wx += 2)
      if (night ? ((wx * 3 + wy) % 5 === 0) : ((wx + wy) % 7 === 0)) R(x, wx, wy, 1, 1, night ? '#ffd27a' : '#e9f2f7');
  }
  // frame + mullions + sill
  x.strokeStyle = C.white; x.lineWidth = 3; x.strokeRect(X - 1.5, Y - 1.5, WW + 3, HH + 3);
  R(x, X + WW / 2 - 1, Y, 2, HH, C.white); R(x, X, Y + 46, WW, 2, C.white);
  x.lineWidth = 1; x.strokeStyle = C.ink; x.strokeRect(X - 3.5, Y - 3.5, WW + 7, HH + 7);
  R(x, X - 8, Y + HH + 2, WW + 16, 5, C.white); R(x, X - 8, Y + HH + 6, WW + 16, 1, C.whiteSh);
  x.strokeRect(X - 8.5, Y + HH + 1.5, WW + 17, 6);
  // curtain rail, plum curtain (left), sheer (right, sways)
  R(x, X - 22, Y - 10, WW + 46, 2, C.steelDk2);
  for (let i = 0; i < 18; i++) { const c = i % 6 < 2 ? C.plumHi : i % 6 < 4 ? C.plum : C.plumDk; R(x, X - 20 + i, Y - 8, 1, 150, c); }
  R(x, X - 20, Y + 140, 18, 2, C.plumDk); R(x, X - 21, Y - 8, 1, 152, C.ink); R(x, X - 2, Y - 8, 1, 152, C.ink);
  const sway = Math.sin(t / 900) * 1.5;
  for (let i = 0; i < 22; i++) {
    const off = Math.round(Math.sin(i / 3 + t / 700) * sway);
    x.globalAlpha = i % 4 === 0 ? .9 : .62;
    R(x, X + WW - 6 + i + off, Y - 8, 1, 140, C.sheer);
  }
  x.globalAlpha = 1;
}
function paintScreen(x, t, on) {
  const X = 163, Y = 106, w = 44, h = 27;
  if (!on) { R(x, X, Y, w, h, C.screen); return; }
  R(x, X, Y, w, h, '#20305a');
  dither(x, X, Y, w, h, '#2c4277', .5);
  // a tiny desktop: name + three icons, a blinking cursor
  R(x, X + 3, Y + 3, 22, 2, '#bfe9ff');
  const cols = ['#ffb86b', '#ff8fc8', '#8fe3a8'];
  for (let i = 0; i < 3; i++) { R(x, X + 4 + i * 12, Y + 10, 8, 7, cols[i]); R(x, X + 4 + i * 12, Y + 18, 8, 1, '#9fc3e6'); }
  if (((t / 500) | 0) % 2) R(x, X + 27, Y + 3, 2, 2, '#ffffff');
  R(x, X, Y + h - 3, w, 3, '#d9e6f2'); R(x, X + 1, Y + h - 2, 5, 1, '#5a86e6');
  for (let j = 0; j < h; j += 2) { x.globalAlpha = .12; R(x, X, Y + j, w, 1, '#000'); } x.globalAlpha = 1;
}

/* ---------- objects ---------- */
// x,y = top-left in art pixels. group = what it tells you about.
const OBJECTS = [
  { id: 'door', group: 'door', name: 'Door', x: 34, y: 78, art: 'door' },
  { id: 'poster-next-chapter', work: 'next-chapter', name: 'The Next Chapter', x: 72, y: 36, art: 'poster:nextChapter' },
  { id: 'poster-relax-and-make', work: 'relax-and-make', name: 'Relax & Make', x: 196, y: 44, art: 'poster:relaxMake', small: 1 },
  { id: 'poster-echo-corridor', work: 'echo-corridor', name: 'Echo Corridor', x: 230, y: 38, art: 'poster:echoCorridor' },
  { id: 'poster-shopmirror', work: 'shopmirror', name: 'ShopMirror 2032', x: 276, y: 46, art: 'poster:shopMirror', small: 1 },
  { id: 'visor', group: 'trail', name: 'Visor', x: 98, y: 86, src: 'visor' },
  { id: 'backpack', group: 'trail', name: 'Daypack', x: 72, y: 94, src: 'backpack' },
  { id: 'poles', group: 'trail', name: 'Trekking poles', x: 70, y: 136, src: 'poles' },
  { id: 'perfume', group: 'scent', name: 'Perfume', x: 132, y: 76, src: 'perfume' },
  { id: 'penguin', group: 'plush', name: 'Penguin', x: 156, y: 77, art: 'penguin' },
  { id: 'lamp', group: 'lamp', name: 'Desk lamp', x: 116, y: 109, art: 'lamp' },
  { id: 'computer', group: 'computer', name: 'Computer', x: 161, y: 104, art: 'monitor' },
  { id: 'ps5', group: 'play', name: 'Console', x: 211, y: 112, src: 'ps5' },
  { id: 'picasso', group: 'fridge', name: 'Picasso magnet', x: 248, y: 128, src: 'picasso' },
  { id: 'cocktail', group: 'cocktail', name: 'Bead cocktail', x: 262, y: 138, src: 'cocktail' },
  { id: 'bangle', group: 'fridge', name: 'Jade bangle', x: 249, y: 166, src: 'bangle' },
  { id: 'whisky', group: 'bar', name: 'Whisky', x: 293, y: 103, src: 'whisky' },
  { id: 'gin', group: 'bar', name: 'Gin', x: 299, y: 139, src: 'gin' },
  { id: 'window', group: 'view', name: 'Window', x: 336, y: 18, art: 'window' },
  { id: 'catpot', group: 'plants', name: 'Cat planter', x: 352, y: 97, src: 'catpot' },
  { id: 'succulent', group: 'plants', name: 'Succulent', x: 398, y: 105, src: 'succulent' },
  { id: 'kitty', group: 'plush', name: 'Hello Kitty', x: 437, y: 152, art: 'kitty' },
  { id: 'water', group: 'water', name: 'Water', x: 119, y: 172, src: 'water' }
];

function poster(name, small) {
  const iw = small ? 30 : 40, ih = small ? 22 : 28;
  const [c, x] = canvas(iw + 4, ih + 4);
  R(x, 0, 0, iw + 4, ih + 4, C.birchDk); R(x, 1, 1, iw + 2, ih + 2, C.birch);
  if (window.PixelCovers) {
    const cv = window.PixelCovers.drawCover(name);
    x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high';
    const sw = cv.height * iw / ih;
    x.drawImage(cv, (cv.width - sw) / 2, 0, sw, cv.height, 2, 2, iw, ih);
  }
  return outline(c);
}
function load(src) { return new Promise(res => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; }); }

class Room {
  constructor(host, opts) {
    this.opts = Object.assign({ interactive: true, night: null }, opts || {});
    this.host = host;
    host.classList.add('px-stage');
    this.base = document.createElement('canvas'); this.base.width = W; this.base.height = H; this.base.className = 'px-base';
    this.light = document.createElement('canvas'); this.light.className = 'px-light';
    this.dof = document.createElement('div'); this.dof.className = 'px-dof';
    host.append(this.base, this.light, this.dof);
    this.ctx = this.base.getContext('2d'); this.ctx.imageSmoothingEnabled = false;
    this.lctx = this.light.getContext('2d');
    const [sc, sx] = canvas(W, H); paintRoom(sx); this.staticLayer = sc;
    const h = new Date(new Date().toLocaleString('en-US', { timeZone: 'Australia/Brisbane' })).getHours();
    this.night = this.opts.night != null ? this.opts.night : (h < 6 || h >= 18);
    this.lampOn = true; this.screenOn = true;
    this.hover = null; this.objects = OBJECTS.map(o => Object.assign({}, o));
    this.actors = []; this.motes = Array.from({ length: 26 }, (_, i) => ({ x: 250 + (i * 53) % 150, y: 60 + (i * 37) % 170, s: .2 + (i % 5) / 12, p: i }));
    this.scale = 1; this.offX = 0; this.offY = 0;
    this.listeners = {};
    this.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.ready = this._load();
    new ResizeObserver(() => this.fit()).observe(host);
    if (this.opts.interactive) this._bindPointer();
  }
  on(ev, fn) { (this.listeners[ev] = this.listeners[ev] || []).push(fn); }
  emit(ev, a) { (this.listeners[ev] || []).forEach(f => f(a)); }
  async _load() {
    const art = { penguin: spritePenguin(), kitty: spriteKitty(), monitor: spriteMonitor(), lamp: spriteLamp(), window: spriteWindow(), door: spriteDoor() };
    await Promise.all(this.objects.map(async o => {
      o.img = o.src ? await load(ROOT + 'assets/sprites/' + o.src + '.png') : (o.art.startsWith('poster:') ? poster(o.art.slice(7), o.small) : art[o.art]);
      if (!o.img) return;
      o.w = o.img.width; o.h = o.img.height;
      if (o.id === 'window') { o.w = 96; o.h = 110; }
      o.halo = (o.id === 'window' || o.id === 'door') ? null : halo(o.img);
      if (o.id === 'door') { o.w = 44; o.h = 90; }
    }));
    this.fit(); this.start();
  }
  fit() {
    const r = this.host.getBoundingClientRect();
    const s = this.opts.contain ? Math.min(r.width / W, r.height / H) : Math.max(r.width / W, r.height / H);
    this.scale = s;
    const cw = W * s, ch = H * s;
    this.offX = (r.width - cw) / 2; this.offY = (r.height - ch) / 2;
    if (!this.opts.contain && cw > r.width) {
      const fx = this.opts.focusX != null ? this.opts.focusX : W / 2;
      this.offX = Math.min(0, Math.max(r.width - cw, r.width / 2 - fx * s));
    }
    if (this.opts.anchorY != null && !this.opts.contain) this.offY = Math.min(0, Math.max(r.height - ch, (r.height - ch) * this.opts.anchorY));
    for (const c of [this.base, this.light]) { c.style.width = cw + 'px'; c.style.height = ch + 'px'; c.style.left = this.offX + 'px'; c.style.top = this.offY + 'px'; }
    const dpr = Math.min(2, devicePixelRatio || 1);
    this.light.width = Math.round(cw * dpr); this.light.height = Math.round(ch * dpr);
    this.lscale = cw * dpr / W;
  }
  pan(fx) {               // follow something horizontally when the room is wider than the screen
    if (this.opts.contain) return;
    const r = this.host.getBoundingClientRect(), cw = W * this.scale;
    if (cw <= r.width) return;
    const want = Math.min(0, Math.max(r.width - cw, r.width / 2 - fx * this.scale));
    this.offX += (want - this.offX) * .08;
    for (const c of [this.base, this.light]) c.style.left = this.offX + 'px';
  }
  toArt(cx, cy) { const r = this.host.getBoundingClientRect(); return [(cx - r.left - this.offX) / this.scale, (cy - r.top - this.offY) / this.scale]; }
  toScreen(ax, ay) { const r = this.host.getBoundingClientRect(); return [r.left + this.offX + ax * this.scale, r.top + this.offY + ay * this.scale]; }
  pick(ax, ay) {
    for (let i = this.objects.length - 1; i >= 0; i--) {
      const o = this.objects[i]; if (!o.img) continue;
      if (ax < o.x || ay < o.y || ax >= o.x + o.w || ay >= o.y + o.h) continue;
      if (o.src) {               // pixel-accurate for photo sprites, with 2px slack
        const ix = Math.floor(ax - o.x), iy = Math.floor(ay - o.y);
        if (!o._alpha) { const [c, x] = canvas(o.w, o.h); x.drawImage(o.img, 0, 0); o._alpha = x.getImageData(0, 0, o.w, o.h).data; }
        let hit = false;
        for (let dy = -2; dy <= 2 && !hit; dy++) for (let dx = -2; dx <= 2 && !hit; dx++) {
          const px = ix + dx, py = iy + dy; if (px >= 0 && py >= 0 && px < o.w && py < o.h && o._alpha[(py * o.w + px) * 4 + 3]) hit = true;
        }
        if (!hit) continue;
      }
      return o;
    }
    return null;
  }
  _bindPointer() {
    this.host.addEventListener('pointermove', e => {
      const [ax, ay] = this.toArt(e.clientX, e.clientY);
      const o = this.pick(ax, ay);
      if (o !== this.hover) { this.hover = o; this.host.style.cursor = o ? 'pointer' : ''; this.emit('hover', o); }
    });
    this.host.addEventListener('pointerleave', () => { this.hover = null; this.emit('hover', null); });
    this.host.addEventListener('click', e => {
      const [ax, ay] = this.toArt(e.clientX, e.clientY);
      const o = this.pick(ax, ay); if (o) this.emit('select', o);
    });
  }
  find(id) { return this.objects.find(o => o.id === id); }
  setNight(v) { this.night = v; this.emit('night', v); }
  start() {
    if (this._raf) return;
    const loop = t => { this._raf = requestAnimationFrame(loop); this.draw(this.reduced ? 0 : t); };
    this._raf = requestAnimationFrame(loop);
  }
  draw(t) {
    const x = this.ctx;
    x.drawImage(this.staticLayer, 0, 0);
    paintWindow(x, t, this.night);
    // objects + actors sorted so the girl can walk in front of / behind the bed and chair
    const list = this.objects.filter(o => o.img && o.id !== 'window' && o.id !== 'door');
    const draws = list.map(o => ({ z: o.z != null ? o.z : 0, f: () => {
      const lift = (o === this.hover || o === this.focus) && !this.reduced ? -1 : 0;
      if ((o === this.hover || o === this.focus) && o.halo) x.drawImage(o.halo, o.x - 1, o.y - 1 + lift);
      x.drawImage(o.img, o.x, o.y + lift);
      if (o.id === 'computer') paintScreen(x, t, this.screenOn);
    } }));
    for (const a of this.actors) draws.push({ z: a.z, f: () => a.draw(x, t) });
    draws.sort((a, b) => a.z - b.z).forEach(d => d.f());
    if (this.drawOverlay) this.drawOverlay(x, t);
    // window & door hover frames
    const hv = this.hover || this.focus;
    if (hv && (hv.id === 'window' || hv.id === 'door')) {
      x.strokeStyle = '#fff6cf'; x.lineWidth = 1; x.setLineDash([2, 2]); x.lineDashOffset = -((t / 120) | 0);
      x.strokeRect(hv.x + .5, hv.y + .5, hv.w - 1, hv.h - 1); x.setLineDash([]);
    }
    this.drawLight(t);
  }
  /* soft light layer: sun shafts by day; lamp, screen and city glow by night */
  drawLight(t) {
    const L = this.lctx, s = this.lscale, cw = this.light.width, ch = this.light.height;
    L.setTransform(1, 0, 0, 1, 0, 0); L.clearRect(0, 0, cw, ch);
    L.setTransform(s, 0, 0, s, 0, 0);
    const P = (pts) => { L.beginPath(); pts.forEach(([a, b], i) => i ? L.lineTo(a, b) : L.moveTo(a, b)); L.closePath(); };
    if (!this.night) {
      // warm grade + sunbeams from the window falling down-left
      L.globalCompositeOperation = 'soft-light'; L.fillStyle = 'rgba(255,200,140,.16)'; L.fillRect(0, 0, W, H);
      L.globalCompositeOperation = 'screen';
      const g = L.createLinearGradient(380, 20, 260, 260);
      g.addColorStop(0, 'rgba(255,244,205,.42)'); g.addColorStop(1, 'rgba(255,236,190,0)');
      L.fillStyle = g; P([[340, 22], [420, 22], [352, 268], [214, 268]]); L.fill();
      const g2 = L.createLinearGradient(380, 20, 300, 268);
      g2.addColorStop(0, 'rgba(255,250,225,.30)'); g2.addColorStop(1, 'rgba(255,250,225,0)');
      L.fillStyle = g2; P([[382, 22], [418, 22], [330, 268], [280, 268]]); L.fill();
      // dust motes in the beam
      L.fillStyle = 'rgba(255,250,230,.85)';
      for (const m of this.motes) {
        const yy = (m.y + t * m.s / 60) % 210 + 40, xx = m.x - (yy - 40) * .45 + Math.sin(t / 1400 + m.p) * 4;
        if (xx > 214 && xx < 420) L.fillRect(Math.round(xx), Math.round(yy), 1, 1);
      }
    } else {
      L.globalCompositeOperation = 'multiply'; L.fillStyle = 'rgba(44,48,104,1)'; L.globalAlpha = .7; L.fillRect(0, 0, W, H); L.globalAlpha = 1;
      L.globalCompositeOperation = 'screen';
      const glow = (cx, cy, r, col, a) => { const g = L.createRadialGradient(cx, cy, 0, cx, cy, r); g.addColorStop(0, col.replace('A', a)); g.addColorStop(1, col.replace('A', 0)); L.fillStyle = g; L.fillRect(cx - r, cy - r, r * 2, r * 2); };
      if (this.lampOn) { glow(128, 118, 150, 'rgba(255,190,110,A)', .55); glow(128, 120, 40, 'rgba(255,230,170,A)', .6); }
      if (this.screenOn) glow(185, 120, 70, 'rgba(120,200,255,A)', .38 + Math.sin(t / 300) * .02);
      glow(380, 70, 90, 'rgba(120,140,255,A)', .22);
      const g = L.createLinearGradient(380, 20, 280, 268);
      g.addColorStop(0, 'rgba(150,170,255,.18)'); g.addColorStop(1, 'rgba(150,170,255,0)');
      L.fillStyle = g; P([[340, 22], [420, 22], [352, 268], [214, 268]]); L.fill();
    }
    // vignette
    L.globalCompositeOperation = 'source-over';
    const v = L.createRadialGradient(W / 2, H / 2, H * .35, W / 2, H / 2, W * .62);
    v.addColorStop(0, 'rgba(20,10,20,0)'); v.addColorStop(1, this.night ? 'rgba(8,6,20,.55)' : 'rgba(60,30,20,.28)');
    L.fillStyle = v; L.fillRect(0, 0, W, H);
  }
}

/* ---------- someone to walk around ---------- */
// feet-space walk area and furniture footprints (art pixels)
const FLOOR = { x0: 30, x1: 466, y0: 200, y1: 266 };
const BLOCKS = [
  { x0: 318, x1: 476, y0: 150, y1: 258 },   // bed
  { x0: 144, x1: 190, y0: 150, y1: 212 },   // chair
  { x0: 0, x1: 70, y0: 150, y1: 182 }       // poles
];
function blocked(x, y) {
  if (x < FLOOR.x0 || x > FLOOR.x1 || y < FLOOR.y0 || y > FLOOR.y1) return true;
  for (const b of BLOCKS) if (x > b.x0 && x < b.x1 && y > b.y0 && y < b.y1) return true;
  return false;
}
class Walker {
  constructor(x, y) {
    this.x = x; this.y = y; this.dir = 0; this.f = 0; this.moving = false; this.t = 0;
    this.frames = [0, 1, 2, 3].map(d => [0, 1, 2, 3].map(f => spriteGirl(d, f)));
  }
  get z() { return this.y; }
  step(dx, dy, dt) {
    const sp = .075 * dt;
    this.moving = !!(dx || dy);
    if (!this.moving) { this.f = 0; return; }
    const len = Math.hypot(dx, dy); dx /= len; dy /= len;
    if (Math.abs(dx) > Math.abs(dy)) this.dir = dx < 0 ? 2 : 3; else this.dir = dy < 0 ? 1 : 0;
    const nx = this.x + dx * sp, ny = this.y + dy * sp;
    if (!blocked(nx, this.y)) this.x = nx;
    if (!blocked(this.x, ny)) this.y = ny;
    this.t += dt; this.f = ((this.t / 140) | 0) % 4;
  }
  draw(x) {
    const img = this.frames[this.dir][this.f];
    x.fillStyle = 'rgba(42,31,26,.25)'; x.fillRect(Math.round(this.x) - 6, Math.round(this.y) - 1, 12, 2);
    x.drawImage(img, Math.round(this.x) - 8, Math.round(this.y) - 28);
  }
}

window.PixelRoom = { Walker, blocked, FLOOR, Room, W, H, C, spriteGirl, canvas, outline, R, dither, ellipse, line, OBJECTS };
})();
