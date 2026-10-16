/* What We Carry — my room as a small floating voxel island.
   Rendered at low resolution and scaled up, so it reads as pixel art in 3D. */
import * as THREE from '../lib/three.module.min.js';

const COL = {
  grass: '#7cc36b', grassDk: '#5fa556', dirt: '#a86a3d', dirtDk: '#8a5530', stone: '#8d8a96', stoneDk: '#6e6b78',
  carpet: '#c9b8a2', wall: '#efe6d2', wallSh: '#e2d6bd', white: '#f7f4ec', birch: '#dcb88c', ink: '#2c2730',
  steel: '#cfd4d8', plum: '#4b3f86', blue: '#4fa3e0', navy: '#24477a', pink: '#e7c6dc'
};

export function createIsland(host, opts) {
  opts = Object.assign({ onSelect: () => {}, onHover: () => {}, pixel: 3 }, opts || {});
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(1);
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.BasicShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const cv = renderer.domElement; cv.className = 'island-cv';
  host.append(cv);

  const scene = new THREE.Scene();
  const world = new THREE.Group(); scene.add(world);
  const island = new THREE.Group(); world.add(island);

  /* ---------- camera: orthographic, three-quarter view ---------- */
  const cam = new THREE.OrthographicCamera(-20, 20, 20, -20, 0.1, 400);
  // the camera orbits a target: theta goes all the way round, phi tilts from overhead to below the island
  const target = new THREE.Vector3(0, 2.5, 0), DIST = 80;
  const HOME = { theta: Math.PI / 4 - .2, phi: 1.02, zoom: 1 };
  const PHI_MIN = .12, PHI_MAX = 2.2;
  let theta = HOME.theta, phi = HOME.phi, vT = 0, vP = 0;
  function placeCamera() {
    cam.position.set(target.x + DIST * Math.sin(phi) * Math.sin(theta), target.y + DIST * Math.cos(phi), target.z + DIST * Math.sin(phi) * Math.cos(theta));
    cam.up.set(0, 1, 0); cam.lookAt(target);
  }
  placeCamera();

  /* ---------- lights ---------- */
  const hemi = new THREE.HemisphereLight('#cfe9ff', '#e6cfa8', 1.05); scene.add(hemi);
  const sun = new THREE.DirectionalLight('#fff1d6', 1.6);
  sun.position.set(18, 30, 10); sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -24, right: 24, top: 24, bottom: -24, near: 1, far: 100 });
  sun.shadow.bias = -0.002;
  scene.add(sun);
  const lamp = new THREE.PointLight('#ffb35a', 0, 14, 1.6); lamp.position.set(-7.8, 4.7, -6.0); island.add(lamp);
  const screenLight = new THREE.PointLight('#7fd0ff', 0, 7, 2); screenLight.position.set(-7.1, 4.9, -5.6); island.add(screenLight);
  const lantern = new THREE.PointLight('#ffd27a', 0, 9, 2); lantern.position.set(11.5, 3.4, 9.3); island.add(lantern);

  /* ---------- building blocks ---------- */
  const unit = new THREE.BoxGeometry(1, 1, 1); unit.translate(0.5, 0.5, 0.5);
  const mats = {};
  const mat = (c, em) => { const k = c + (em || ''); return mats[k] || (mats[k] = new THREE.MeshLambertMaterial({ color: c, emissive: em || '#000000' })); };
  const pickables = [];
  // box from its minimum corner; tagged boxes get their own material so they can light up on hover
  function B(x, y, z, w, h, d, c, tag, em) {
    const m = new THREE.Mesh(unit, tag ? new THREE.MeshLambertMaterial({ color: c, emissive: em || '#000000' }) : mat(c, em));
    m.position.set(x, y, z); m.scale.set(w, h, d);
    m.castShadow = true; m.receiveShadow = true;
    if (tag) { m.userData.tag = tag; m.userData.em = new THREE.Color(em || '#000000'); pickables.push(m); }
    island.add(m); return m;
  }

  // walls get their own materials so a wall between the camera and the room can fade away (cutaway view)
  const wallMats = { back: new THREE.MeshLambertMaterial({ color: COL.wall, transparent: true }), left: new THREE.MeshLambertMaterial({ color: COL.wall, transparent: true }) };
  function Wall(side, x, y, z, w, h, d) { const m = B(x, y, z, w, h, d, COL.wall); m.material = wallMats[side]; return m; }

  /* ---------- the floating island: instanced voxel columns ---------- */
  const R = 15.6, cells = [];
  const rnd = (x, z) => { const s = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453; return s - Math.floor(s); };
  for (let x = -17; x <= 17; x++) for (let z = -17; z <= 17; z++) {
    const d = Math.hypot(x + .5, z + .5) + (rnd(x, z) - .5) * 1.6;
    if (d > R) continue;
    const depth = Math.max(1, Math.round((R - d) * 0.9 + rnd(z, x) * 2.5));
    cells.push([x, z, depth]);
  }
  const count = { grass: 0, dirt: 0, stone: 0 };
  cells.forEach(([, , dp]) => { count.grass++; count.dirt += Math.min(2, dp - 1); count.stone += Math.max(0, dp - 3); });
  const inst = {};
  for (const k of ['grass', 'dirt', 'stone']) {
    inst[k] = new THREE.InstancedMesh(unit, new THREE.MeshLambertMaterial({ color: COL[k] }), Math.max(1, count[k]));
    inst[k].castShadow = inst[k].receiveShadow = true; island.add(inst[k]);
  }
  const mtx = new THREE.Matrix4(), cnt = { grass: 0, dirt: 0, stone: 0 }, tint = new THREE.Color();
  cells.forEach(([x, z, dp]) => {
    const put = (k, y, alt) => { mtx.makeTranslation(x, y, z); inst[k].setMatrixAt(cnt[k], mtx); inst[k].setColorAt(cnt[k], tint.set(alt ? COL[k + 'Dk'] : COL[k])); cnt[k]++; };
    put('grass', -2, rnd(x * 3, z) > .8);
    for (let j = 1; j < dp; j++) { if (j <= 2) put('dirt', -2 - j, rnd(x, z * j) > .7); else put('stone', -2 - j, rnd(x * j, z) > .6); }
  });
  for (const k in inst) { inst[k].count = cnt[k]; inst[k].instanceMatrix.needsUpdate = true; if (inst[k].instanceColor) inst[k].instanceColor.needsUpdate = true; }

  /* ---------- the room, laid out like the real one ----------
     back wall (z = -7), left to right: desk with the shelf above, posters, fridge,
     the black rack with the bottles, then the window with the bed beneath it.
     left wall (x = -10): cork board, the hiking gear on hooks, the door. */
  const tex = new THREE.TextureLoader();
  function T(src) {
    const t = tex.load(src, () => request()); t.colorSpace = THREE.SRGBColorSpace; t.magFilter = THREE.NearestFilter; return t;
  }
  function canvasTex(w, h, draw) {
    const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; return t;
  }
  // a flat picture: on the back wall it faces +z, on the left wall it faces +x
  function P(x, y, z, w, h, map, wall, tag, alpha) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshLambertMaterial({ map, transparent: !!alpha, alphaTest: alpha ? .4 : 0, emissive: '#000000' }));
    m.position.set(x, y, z); if (wall === 'left') m.rotation.y = Math.PI / 2;
    m.receiveShadow = true;
    if (tag) { m.userData.tag = tag; m.userData.em = new THREE.Color('#000000'); pickables.push(m); }
    island.add(m); return m;
  }
  const WH = 11;
  B(-10, -1, -7, 20, 1, 14, COL.carpet);                                    // floor
  // walls (the back wall has an opening for the window, the left wall one for the door)
  Wall('back', -11, 0, -8, 13.4, WH, 1); Wall('back', 8.6, 0, -8, 1.4, WH, 1);
  Wall('back', 2.4, 0, -8, 6.2, 3.6, 1); Wall('back', 2.4, 9.2, -8, 6.2, WH - 9.2, 1);
  Wall('left', -11, 0, -7, 1, WH, 10.6); Wall('left', -11, 7, 3.6, 1, WH - 7, 2.8); Wall('left', -11, 0, 6.4, 1, WH, .6);
  B(-10, 0, -7, 20, .45, .18, COL.white); B(-10, 0, -7, .18, .45, 10.6, COL.white);            // skirting
  // rug with a row of crosses, like the one in the pixel room
  B(-6, 0, -3.4, 8, .12, 4, '#e3bfd6');
  for (let i = 0; i < 7; i++) { B(-5.3 + i * 1.1, .12, -1.5, .5, .04, .14, '#cfa3c3'); B(-5.12 + i * 1.1, .12, -1.68, .14, .04, .5, '#cfa3c3'); }

  // desk: birch top on white legs
  B(-9.7, 3, -7, 5.2, .3, 2.5, COL.birch); B(-9.7, 2.75, -7, 5.2, .25, 2.5, '#c9a172');
  for (const [lx, lz] of [[-9.6, -6.9], [-9.6, -4.75], [-4.75, -6.9], [-4.75, -4.75]]) B(lx, 0, lz, .25, 2.75, .25, COL.white);
  // monitor with the desktop on screen
  B(-7.6, 3.3, -6.7, 1, .12, .6, '#2b2a30', 'computer'); B(-7.25, 3.42, -6.55, .3, .9, .25, '#2b2a30', 'computer');
  B(-8.45, 4.05, -6.75, 2.7, 1.75, .22, '#1f1c22', 'computer');
  const screenTex = canvasTex(54, 34, (x, w, h) => {
    x.fillStyle = '#2c4277'; x.fillRect(0, 0, w, h);
    for (let j = 0; j < h; j += 4) { x.fillStyle = '#2a3f72'; x.fillRect(0, j, w, 2); }
    [['#ffb86b', 3], ['#ff8fc8', 11], ['#8fe3a8', 19]].forEach(([c, y]) => { x.fillStyle = c; x.fillRect(3, y, 5, 4); });
    x.fillStyle = '#fbf6ea'; x.fillRect(13, 4, 37, 24); x.fillStyle = '#ff8fc8'; x.fillRect(13, 4, 37, 4);
    x.fillStyle = '#ffb46b'; x.fillRect(16, 11, 14, 8); x.fillStyle = '#7fc6e6'; x.fillRect(33, 11, 14, 8);
    x.fillStyle = '#d9e6f2'; x.fillRect(0, h - 3, w, 3);
  });
  const screen = P(-7.1, 4.92, -6.52, 2.5, 1.55, screenTex, 'back', 'computer');
  screen.material.emissiveMap = screenTex; screen.material.emissive.set('#ffffff'); screen.material.emissiveIntensity = .55; screen.userData.em = new THREE.Color('#ffffff');
  B(-8.2, 3.3, -5.6, 1.9, .1, .65, '#2b2a30', 'computer'); B(-6.05, 3.3, -5.45, .3, .12, .45, '#f4f4f4', 'computer');   // keyboard, mouse
  // desk lamp: base, upright, arm and shade
  B(-9.5, 3.3, -6.8, .8, .14, .8, COL.white, 'lamp'); B(-9.2, 3.44, -6.5, .18, 2.2, .18, COL.white, 'lamp');
  B(-9.2, 5.5, -6.5, 1.3, .16, .18, COL.white, 'lamp'); B(-8.15, 5.05, -6.65, .7, .5, .5, COL.white, 'lamp'); B(-8.05, 4.98, -6.55, .5, .08, .3, '#fff3c8', 'lamp');
  // the console, standing at the end of the desk
  B(-5.35, 3.3, -6.85, .5, 2.2, 1.5, '#f4f4f2', 'ps5'); B(-5.2, 3.3, -6.85, .2, 2.05, 1.52, '#1f1c22', 'ps5'); B(-5.45, 3.3, -6.95, .7, .1, 1.7, '#1f1c22', 'ps5');
  // chair: seat, backrest, arms, gas lift and a five-star base
  B(-7.9, 1.8, -4.4, 2, .35, 1.9, '#2f2c33'); B(-7.9, 2.15, -2.75, 2, 2.4, .3, '#2f2c33'); B(-7.8, 4.4, -2.7, 1.8, .2, .2, '#3d3942');
  B(-8.05, 2.15, -4.1, .2, .9, 1.3, '#3d3942'); B(-5.95, 2.15, -4.1, .2, .9, 1.3, '#3d3942');
  B(-7.05, .35, -3.6, .3, 1.45, .3, '#1f1c22');
  for (const [dx, dz, w, d] of [[-1.1, -.08, 2.5, .16], [-.08, -1.1, .16, 2.5]]) B(-6.9 + dx, .25, -3.45 + dz, w, .14, d, '#1f1c22');
  for (const [cx, cz] of [[-8.05, -3.6], [-5.6, -3.6], [-6.95, -4.7], [-6.95, -2.3]]) B(cx, 0, cz, .3, .25, .3, '#111014');
  // water cartons under the desk
  for (const zx of [-9.5, -8.2]) { B(zx, 0, -6.8, 1.2, 1.5, 1.4, '#f2f6fa', 'water'); B(zx, .45, -5.41, 1.2, .9, .02, '#3a8fd6', 'water'); B(zx + .2, 1.5, -6.4, .8, .12, .5, '#2f78c0', 'water'); }
  // wall shelf with the two perfumes, the penguin in its beanie and a row of books
  B(-9.7, 6.2, -7, 4.6, .22, 1, COL.white); B(-9.3, 5.6, -7, .15, .6, .7, COL.white); B(-5.6, 5.6, -7, .15, .6, .7, COL.white);
  B(-9.4, 6.42, -6.6, .6, .75, .45, '#d9933f', 'perfume'); B(-9.25, 6.6, -6.14, .3, .3, .02, '#f3e2c0', 'perfume'); B(-9.3, 7.17, -6.5, .4, .25, .25, '#2c2730', 'perfume');
  B(-8.6, 6.42, -6.6, .55, .95, .45, '#f6b3c4', 'perfume'); B(-8.5, 6.6, -6.14, .35, .4, .02, '#fbf7ef', 'perfume'); B(-8.45, 7.37, -6.5, .25, .3, .25, '#d9534a', 'perfume');
  B(-7.75, 6.42, -6.7, .9, 1, .75, '#2d3346', 'penguin'); B(-7.55, 6.5, -5.96, .5, .65, .02, '#f4f1ea', 'penguin'); B(-7.4, 6.95, -5.97, .2, .12, .1, '#f0a03a', 'penguin');
  B(-7.8, 7.42, -6.75, 1, .45, .85, '#8fb8e8', 'penguin'); B(-7.4, 7.87, -6.42, .2, .2, .2, '#fbf7ef', 'penguin');
  ['#d9534a', '#4fa3e0', '#f5d061', '#7cc36b', '#a78bdc', '#e8a14e'].forEach((c, i) => B(-6.6 + i * .17, 6.42, -6.85, .15, .85 + (i % 3) * .12, .7, c));
  // a round clock above the shelf
  const clockTex = canvasTex(16, 16, (x) => { x.fillStyle = '#7a5236'; x.beginPath(); x.arc(8, 8, 8, 0, 7); x.fill(); x.fillStyle = '#fbf7ef'; x.beginPath(); x.arc(8, 8, 6.5, 0, 7); x.fill(); x.fillStyle = '#2a1f1a'; x.fillRect(7.5, 3, 1, 5.5); x.fillRect(8, 7.5, 4, 1); });
  P(-8.6, 8.9, -6.97, 1.1, 1.1, clockTex, 'back', null, true);
  // my four project posters, in wooden frames
  const framed = (x, y, w, h) => B(x - w / 2 - .12, y - h / 2 - .12, -7, w + .24, h + .24, .1, '#b8865a');
  [['poster-next-chapter', 'assets/work/next-chapter/title.png', -3.4, 8.7, 2.4, 1.35],
   ['poster-astrobius', 'assets/work/astrobius/poster.jpg', -1.1, 8.6, 1.15, 1.62],
   ['poster-shopmirror', 'assets/work/shopmirror/personas.jpg', .85, 8.9, 1.7, .96],
   ['poster-echo-corridor', 'assets/work/echo-corridor/p01.jpg', -2.6, 6.3, 1.9, 1.42]].forEach(([tag, src, x, y, w, h]) => { framed(x, y, w, h); P(x, y, -6.89, w, h, T(src), 'back', tag); });
  // the fridge, with my magnets on the door
  B(-4.3, 0, -7, 2.6, 4.9, 2.1, '#dfe3e6'); B(-4.3, 3.15, -4.91, 2.6, .06, .02, '#9aa2a9');
  B(-2.0, 3.4, -4.88, .12, 1.2, .1, '#b7bec4'); B(-2.0, 1.2, -4.88, .12, 1.6, .1, '#b7bec4');
  P(-3.75, 3.95, -4.88, .62, 1.1, T('assets/cutouts/picasso.webp'), 'back', 'picasso', true);
  P(-2.85, 3.85, -4.88, .55, 1.07, T('assets/cutouts/beads.webp'), 'back', 'beads', true);
  P(-3.2, 2.0, -4.88, .85, 1.04, T('assets/cutouts/jade.webp'), 'back', 'jade', true);
  // the black rack with the bottles on top
  for (const [px, pz] of [[-1.5, -6.95], [.5, -6.95], [-1.5, -5.75], [.5, -5.75]]) B(px, 0, pz, .12, 4.6, .12, '#26232a');
  for (const y of [.4, 1.9, 3.4, 4.5]) B(-1.5, y, -6.95, 2.12, .1, 1.32, '#3a363f');
  B(-1.35, 4.6, -6.6, .45, 1.15, .45, '#25402e', 'whisky'); B(-1.3, 5.75, -6.55, .35, .45, .35, '#25402e', 'whisky'); B(-1.27, 6.2, -6.52, .29, .2, .29, '#2f8f8a', 'whisky');
  B(-1.36, 4.85, -6.14, .47, .55, .02, '#efe2c2', 'whisky');
  B(-.75, 4.6, -6.7, .7, .85, .5, '#9c5a22', 'bourbon'); B(-.55, 5.45, -6.55, .3, .35, .25, '#9c5a22', 'bourbon'); B(-.57, 5.8, -6.57, .34, .2, .29, '#2c2730', 'bourbon');
  B(-.76, 4.85, -6.19, .72, .35, .02, '#f3e2c0', 'bourbon');
  B(.0, 4.6, -6.65, .45, 1.05, .45, '#d6e4ee', 'gin'); B(.08, 5.65, -6.57, .29, .35, .29, '#d6e4ee', 'gin'); B(.06, 6.0, -6.59, .33, .22, .33, '#fbf7ef', 'gin');
  B(-.01, 4.8, -6.19, .47, .45, .02, '#fbf7ef', 'gin'); B(.08, 4.95, -6.18, .29, .12, .02, '#24477a', 'gin');
  B(-1.3, .5, -6.6, .4, .5, .4, '#e8eef2'); B(-.6, .5, -6.6, .4, .5, .4, '#e8eef2'); B(-1.2, 2.0, -6.7, 1.4, .7, .9, '#c9b8a2');
  // window with the city and the hills outside, day and night
  const viewDay = canvasTex(62, 56, (x, w, h) => {
    const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#8fcff0'); g.addColorStop(1, '#d8eef6'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    x.fillStyle = '#ffffff'; x.fillRect(8, 8, 12, 3); x.fillRect(11, 6, 6, 2); x.fillRect(40, 13, 10, 2);
    x.fillStyle = '#9fb7a0'; for (let i = 0; i < w; i++) x.fillRect(i, 30 + Math.round(Math.sin(i / 7) * 3), 1, 30);
    [[4, 30, 6], [12, 22, 5], [19, 26, 7], [28, 18, 5], [35, 24, 6], [43, 28, 5], [50, 21, 7]].forEach(([bx, by, bw]) => { x.fillStyle = '#b6c3d2'; x.fillRect(bx, by, bw, h); x.fillStyle = '#d4dde7'; for (let j = by + 2; j < h; j += 3) for (let i = bx + 1; i < bx + bw - 1; i += 2) x.fillRect(i, j, 1, 1); });
  });
  const viewNight = canvasTex(62, 56, (x, w, h) => {
    x.fillStyle = '#1b2142'; x.fillRect(0, 0, w, h); x.fillStyle = '#fff3c8'; x.fillRect(48, 6, 5, 5); x.fillStyle = '#1b2142'; x.fillRect(50, 5, 4, 4);
    x.fillStyle = '#2b3360'; for (let i = 0; i < w; i++) x.fillRect(i, 30 + Math.round(Math.sin(i / 7) * 3), 1, 30);
    [[4, 30, 6], [12, 22, 5], [19, 26, 7], [28, 18, 5], [35, 24, 6], [43, 28, 5], [50, 21, 7]].forEach(([bx, by, bw], k) => { x.fillStyle = '#323b6e'; x.fillRect(bx, by, bw, h); x.fillStyle = '#ffd27a'; for (let j = by + 2; j < h; j += 3) for (let i = bx + 1; i < bx + bw - 1; i += 2) if ((i * 7 + j * 3 + k) % 5 < 2) x.fillRect(i, j, 1, 1); });
  });
  const glass = P(5.5, 6.4, -7.55, 6.2, 5.6, viewDay, 'back', 'window');
  glass.material.emissiveMap = viewDay; glass.material.emissive.set('#ffffff'); glass.material.emissiveIntensity = .35; glass.userData.em = new THREE.Color('#ffffff');
  B(2.3, 3.4, -7.2, 6.4, .25, .9, COL.white);                                   // sill
  B(2.3, 9.1, -7.3, 6.4, .2, .4, COL.white); B(5.4, 3.65, -7.3, .18, 5.45, .25, COL.white); B(2.3, 6.3, -7.3, 6.4, .16, .25, COL.white);
  for (let i = 0; i < 4; i++) B(1.55 + (i % 2) * .12, 2.7, -6.95 + i * .12, .55, 7.1, .35, i % 2 ? '#5d4a9b' : COL.plum);   // gathered curtain
  B(8.6, 2.8, -6.95, .55, 7, .3, '#fbf7ef'); B(8.75, 2.8, -6.6, .4, 7, .2, '#efe9df');                                  // sheer
  B(1.3, 9.8, -6.85, 8.2, .12, .12, '#c9c3b8');                                                                        // rail
  // cat planter and succulent on the sill
  B(2.8, 3.65, -7.05, .95, .8, .75, '#fbf7ef', 'catpot'); B(2.85, 4.45, -7.0, .2, .2, .2, '#fbf7ef', 'catpot'); B(3.5, 4.45, -7.0, .2, .2, .2, '#fbf7ef', 'catpot');
  B(2.95, 3.9, -6.31, .2, .08, .02, '#4f7fb0', 'catpot'); B(3.4, 3.9, -6.31, .2, .08, .02, '#4f7fb0', 'catpot'); B(3.2, 3.75, -6.31, .1, .08, .02, '#e8a14e', 'catpot');
  B(2.9, 4.45, -6.95, .75, .15, .55, '#3a2f2a', 'catpot');
  [[3.0, .9], [3.25, 1.5], [3.5, 1.1]].forEach(([lx, lh]) => B(lx, 4.6, -6.75, .14, lh, .14, '#5fa556', 'catpot')); B(3.18, 6.1, -6.75, .3, .2, .2, '#f5d061', 'catpot');
  B(7.2, 3.65, -7.05, .85, .7, .7, '#2c2730', 'succulent'); B(7.15, 4.35, -7.1, .95, .12, .8, '#f5d061', 'succulent');
  [[7.25, -6.95, .35], [7.6, -6.8, .45], [7.45, -6.55, .3]].forEach(([sx, sz, sh]) => B(sx, 4.47, sz, .3, sh, .3, '#8fd1a8', 'succulent'));
  // bed along the back wall, under the window: white frame, chevron duvet, two pillows, Hello Kitty at the foot
  B(2.1, 0, -7, .35, 3.6, 4.4, COL.white); B(2.45, 0, -7, 7.5, 1.2, 4.4, COL.white); B(2.45, 1.2, -6.9, 7.4, .8, 4.2, '#f3efe6');
  B(4.1, 2.0, -6.95, 5.85, .45, 4.3, '#ffffff');
  for (let i = 0; i < 9; i++) for (let k = 0; k < 4; k++) B(4.25 + i * .64, 2.45, -6.6 + k * 1.05 + (i % 2) * .25, .44, .05, .16, '#ddd6c8');
  B(2.6, 2.0, -6.8, 1.4, .55, 1.8, '#fbf9f4'); B(2.6, 2.0, -4.85, 1.4, .55, 1.8, '#fbf9f4');
  B(8.6, 2.45, -6.75, 1.05, .85, .9, '#8b7bd1', 'kitty'); B(8.5, 3.3, -6.8, 1.25, 1.0, 1.0, '#fbf8f2', 'kitty');
  B(8.55, 4.3, -6.75, .3, .3, .3, '#fbf8f2', 'kitty'); B(9.4, 4.3, -6.75, .3, .3, .3, '#fbf8f2', 'kitty'); B(9.2, 4.25, -6.85, .5, .35, .35, '#8b7bd1', 'kitty');
  B(8.75, 3.7, -5.79, .12, .16, .02, '#2c2730', 'kitty'); B(9.35, 3.7, -5.79, .12, .16, .02, '#2c2730', 'kitty'); B(9.05, 3.55, -5.79, .12, .08, .02, '#f5d061', 'kitty');

  // left wall: cork board with my photographs, the hiking gear on hooks, the door
  B(-10, 5.9, -6.4, .14, 2.8, 3.8, '#b8865a', 'photos'); B(-9.92, 6.0, -6.3, .1, 2.6, 3.6, '#c99a62', 'photos');
  [[0, -5.65, 7.65, .95, .72], [1, -4.55, 7.8, .9, .68], [2, -3.5, 7.55, .95, .72], [3, -5.4, 6.65, .9, .68], [4, -4.1, 6.6, 1, .74]].forEach(([k, z, y, w, h]) => {
    P(-9.8, y, z, w, h, T('assets/photography/' + ['Image_20250906184745_350_1', 'Image_20250906184752_351_1', 'Image_20250906184939_352_1', 'Image_20250906184955_353_1', 'Image_20250906185025_354_1'][k] + '.jpg'), 'left', 'photos');
    B(-9.82, y + h / 2 - .1, z - .05, .08, .1, .1, ['#d9534a', '#4fa3e0', '#f5d061'][k % 3], 'photos');
  });
  B(-10, 6.5, -1.9, .3, .15, 4.6, COL.white); for (const hz of [-1.3, .3, 1.7]) B(-9.9, 6.2, hz, .35, .3, .12, '#9aa2a9');
  B(-9.9, 3.6, -2.0, .95, 2.5, 1.7, '#3f8fd8', 'backpack'); B(-9.0, 3.8, -1.75, .12, 1.4, 1.2, '#2f78c0', 'backpack');
  B(-9.0, 4.2, -2.1, .1, 2.0, .22, '#24477a', 'backpack'); B(-9.0, 4.2, -.52, .1, 2.0, .22, '#24477a', 'backpack'); B(-9.6, 6.05, -1.45, .2, .2, .6, '#24477a', 'backpack');
  B(-9.9, 5.35, .9, .9, .16, 1.4, '#fbf7ef', 'visor'); B(-9.95, 5.5, .9, .2, .55, 1.4, '#e8e2d6', 'visor'); B(-9.1, 5.33, .9, .12, .1, 1.4, '#9aa2a9', 'visor');
  const pole = (z, tilt) => { const g = new THREE.Group(); g.position.set(-9.6, 0, z); g.rotation.x = tilt;
    [[0, 4.4, .16, '#d9789a'], [4.4, .9, .26, '#2c2730'], [0, .3, .1, '#9aa2a9']].forEach(([y, h, w, c]) => { const m = new THREE.Mesh(unit, new THREE.MeshLambertMaterial({ color: c, emissive: '#000000' })); m.position.set(-w / 2, y, -w / 2); m.scale.set(w, h, w); m.castShadow = true; m.userData.tag = 'poles'; m.userData.em = new THREE.Color('#000000'); pickables.push(m); g.add(m); });
    island.add(g); };
  pole(2.4, -.06); pole(2.85, .05);
  B(-10.05, 0, 3.6, .1, 7, 2.8, '#b0743f', 'door'); B(-9.95, .5, 3.85, .05, 2.6, 2.3, '#9c6534', 'door'); B(-9.95, 3.6, 3.85, .05, 2.9, 2.3, '#9c6534', 'door');
  B(-9.9, 3.3, 5.8, .2, .3, .3, '#ffd95a', 'door');
  B(-10, 0, 3.4, .25, 7.3, .2, COL.white); B(-10, 0, 6.4, .25, 7.3, .2, COL.white); B(-10, 7, 3.4, .25, .3, 3.2, COL.white);

  // fairy lights along the top of both walls
  const bulbs = [];
  const bulbCols = ['#ffd95a', '#ff8fb1', '#8fe3d0', '#c3a6ff'];
  B(-10, 10.35, -6.95, 20, .05, .05, '#5a4a40'); B(-9.95, 10.35, -7, .05, .05, 14, '#5a4a40');
  for (let i = 0; i < 17; i++) bulbs.push(B(-9.6 + i * 1.18, 10.0 - (i % 2) * .3, -6.95, .26, .34, .24, bulbCols[i % 4], null));
  for (let i = 0; i < 12; i++) bulbs.push(B(-9.95, 10.0 - (i % 2) * .3, -6.3 + i * 1.12, .24, .34, .26, bulbCols[(i + 1) % 4], null));
  bulbs.forEach((b, i) => { b.material = new THREE.MeshLambertMaterial({ color: bulbCols[i % 4], emissive: '#000000' }); b.castShadow = false; });

  // outside: a tree behind the left wall, a lamp post, some flowers
  { const tx = -13.4, tz = -3.2; B(tx, -1, tz, 1, 6, 1, '#6e4026');
    for (const [x, y, z, w, h, d] of [[-1.6, 4.5, -1.6, 4.2, 2.6, 4.2], [-1, 6.8, -1, 3, 1.8, 3], [-.5, 8.4, -.5, 2, 1, 2]]) B(tx + x, y, tz + z, w, h, d, '#3f8a4a');
    B(tx - 1.8, 5.4, tz - 1.7, 1, .8, 1, '#7cc36b'); B(tx + 1.4, 7, tz + 1.2, .8, .8, .8, '#7cc36b'); }
  B(11.4, -1, 9.2, .3, 4.4, .3, COL.ink); const bulb = B(11.15, 3.4, 8.95, .8, .8, .8, '#fff3c8', null, '#000000');
  [[12.6, 4], [12.2, -4], [-12.8, 5], [3, 12.4], [-5, 12.2], [8, -10.5], [13.4, 0], [-3, -10.6]].forEach(([x, z], i) => { B(x, -1, z, .3, .5, .3, '#3f8a4a'); B(x - .15, -.5, z - .15, .6, .5, .6, ['#ff8fb1', '#f5d061', '#ffffff', '#c3a6ff'][i % 4]); });

  /* ---------- clouds drifting around ---------- */
  const clouds = [];
  for (let k = 0; k < 4; k++) {
    const g = new THREE.Group();
    const cm = new THREE.MeshLambertMaterial({ color: '#ffffff', transparent: true, opacity: .92 });
    for (const [x, y, z, w, h, d] of [[0, 0, 0, 5, 1.6, 3], [1, 1.2, .5, 3, 1.2, 2], [-1.6, -.4, .4, 2, 1.2, 2.2], [3.4, -.3, .3, 2, 1.1, 2]]) {
      const m = new THREE.Mesh(unit, cm); m.position.set(x, y, z); m.scale.set(w, h, d); g.add(m);
    }
    g.userData = { a: k * Math.PI / 2, r: 21 + (k % 2) * 4, y: 4 + k * 2.5, s: .05 + k * .015 };
    world.add(g); clouds.push(g);
  }

  /* ---------- day / night ---------- */
  let night = false;
  function setNight(n) {
    night = n;
    hemi.intensity = n ? .32 : 1.05; hemi.color.set(n ? '#5a6ab8' : '#cfe9ff'); hemi.groundColor.set(n ? '#2a2440' : '#e6cfa8');
    sun.intensity = n ? .35 : 1.6; sun.color.set(n ? '#8fa0ff' : '#fff1d6');
    lamp.intensity = n ? 26 : 0; screenLight.intensity = n ? 7 : 1.2; lantern.intensity = n ? 14 : 0;
    glass.material.map = glass.material.emissiveMap = n ? viewNight : viewDay; glass.material.emissiveIntensity = n ? .9 : .35; glass.material.needsUpdate = true;
    bulb.material.emissive.set(n ? '#ffd27a' : '#000000');
    clouds.forEach(c => c.children.forEach(m => m.material.color.set(n ? '#5a5a9a' : '#ffffff')));
    request();
  }

  /* ---------- size: render small, scale up crisp ---------- */
  function size() {
    const r = host.getBoundingClientRect();
    const pf = opts.pixel * (r.width < 520 ? .85 : 1);
    const w = Math.max(80, Math.round(r.width / pf)), h = Math.max(80, Math.round(r.height / pf));
    renderer.setSize(w, h, false);
    const aspect = r.width / Math.max(1, r.height), view = r.width < 520 ? 17.5 : 15.5;
    cam.left = -view * aspect; cam.right = view * aspect; cam.top = view; cam.bottom = -view; cam.updateProjectionMatrix();
    request();
  }
  new ResizeObserver(size).observe(host);

  /* ---------- interaction: drag to turn, hover, click ---------- */
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  let dragging = false, lastX = 0, lastY = 0, moved = 0, hoverTag = null, idle = 0, goHome = false;
  function pick(e) {
    const r = cv.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, cam);
    const hit = ray.intersectObjects(pickables, false)[0];
    return hit ? hit.object.userData.tag : null;
  }
  function setHover(tag, e) {
    if (tag === hoverTag) { if (tag && e) opts.onHover(tag, e.clientX, e.clientY); return; }
    hoverTag = tag;
    pickables.forEach(m => m.material.emissive.copy(m.userData.tag === tag ? new THREE.Color('#5a4a20') : m.userData.em));
    cv.style.cursor = tag ? 'pointer' : 'grab';
    opts.onHover(tag, e && e.clientX, e && e.clientY);
    request();
  }
  // any drag takes over at once: inertia, auto-orbit and the trip home all stop.
  // one finger or the mouse orbits in every direction; two fingers pinch to zoom.
  const pts = new Map(); let pinch = 0;
  const spread = () => { const [a, b] = [...pts.values()]; return Math.hypot(a.x - b.x, a.y - b.y); };
  cv.addEventListener('pointerdown', e => {
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY }); try { cv.setPointerCapture(e.pointerId); } catch (err) {}
    goHome = false; vT = vP = 0; idle = 0;
    if (pts.size === 2) { pinch = spread(); moved = 99; return; }
    dragging = true; lastX = e.clientX; lastY = e.clientY; moved = 0;
  });
  cv.addEventListener('pointermove', e => {
    if (pts.has(e.pointerId)) pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pts.size === 2 && pinch) {
      const d = spread(); cam.zoom = Math.max(.7, Math.min(2.4, cam.zoom * d / pinch)); pinch = d; cam.updateProjectionMatrix(); request(); return;
    }
    if (dragging) {
      e.preventDefault();
      const dx = e.clientX - lastX, dy = e.clientY - lastY; lastX = e.clientX; lastY = e.clientY; moved += Math.abs(dx) + Math.abs(dy);
      vT = -dx * .009; theta += vT;
      vP = -dy * .007; phi = Math.max(PHI_MIN, Math.min(PHI_MAX, phi + vP));
      if (moved > 6) setHover(null); request(); return;
    }
    if (e.pointerType === 'mouse') setHover(pick(e), e);
  });
  const lift = e => { pts.delete(e.pointerId); if (pts.size < 2) pinch = 0; if (pts.size === 0) dragging = false; };
  cv.addEventListener('dblclick', () => { goHome = true; idle = 0; request(); });
  cv.addEventListener('pointerup', e => {
    const tap = dragging && moved < 6 && pts.size === 1; lift(e);
    if (tap) { const t = pick(e); if (t) { pop(t); opts.onSelect(t); } }
  });
  cv.addEventListener('pointercancel', lift);
  // the mouse wheel zooms only while ctrl / pinch-to-zoom on a trackpad is held, so the page still scrolls normally
  cv.addEventListener('wheel', e => { if (!e.ctrlKey) return; e.preventDefault(); cam.zoom = Math.max(.7, Math.min(2.4, cam.zoom * (e.deltaY < 0 ? 1.08 : .93))); cam.updateProjectionMatrix(); idle = 0; request(); }, { passive: false });
  cv.addEventListener('pointerleave', () => { if (!dragging) setHover(null); });
  // a little hop when something is chosen
  const hops = [];
  function pop(tag) { pickables.filter(m => m.userData.tag === tag).forEach(m => hops.push({ m, y: m.position.y, t: 0 })); request(); }

  /* ---------- loop ---------- */
  let raf = 0, visible = true, last = performance.now(), want = true;
  function request() { want = true; if (!raf) raf = requestAnimationFrame(frame); }
  function frame(now) {
    raf = 0;
    const dt = Math.min(50, now - last) / 1000; last = now;
    if (!dragging) {
      theta += vT; phi = Math.max(PHI_MIN, Math.min(PHI_MAX, phi + vP)); vT *= .92; vP *= .88; idle += dt;
      if (goHome) {
        // take the short way round back to the home view
        const dT = Math.atan2(Math.sin(HOME.theta - theta), Math.cos(HOME.theta - theta));
        theta += dT * Math.min(1, dt * 5); phi += (HOME.phi - phi) * Math.min(1, dt * 5); cam.zoom += (HOME.zoom - cam.zoom) * Math.min(1, dt * 5); cam.updateProjectionMatrix();
        if (Math.abs(dT) < .002 && Math.abs(HOME.phi - phi) < .002) goHome = false;
      } else if (!reduced && idle > 4) theta += dt * .12;   // a slow orbit while nobody is touching it
    }
    placeCamera();
    // cutaway: a wall between the camera and the room fades to glass
    const fade = (m, outside) => { const to = outside ? .12 : 1; m.opacity += (to - m.opacity) * Math.min(1, dt * 8); m.depthWrite = m.opacity > .9; };
    const cx = cam.position.x - target.x, cz = cam.position.z - target.z;
    fade(wallMats.back, cz < -2); fade(wallMats.left, cx < -2);
    island.position.y = reduced ? 0 : Math.sin(now / 1400) * .35;
    clouds.forEach(c => { const u = c.userData; u.a += dt * u.s * (reduced ? 0 : 1); c.position.set(Math.cos(u.a) * u.r, u.y, Math.sin(u.a) * u.r); c.rotation.y = -u.a; });
    if (night) bulbs.forEach((b, i) => b.material.emissive.set(Math.sin(now / 700 + i * 1.7) > -.5 ? bulbCols[i % 4] : '#000000'));
    else bulbs.forEach(b => b.material.emissive.set('#000000'));
    screen.material.emissiveIntensity = night ? 1 : .55;
    for (let i = hops.length - 1; i >= 0; i--) { const h = hops[i]; h.t += dt; h.m.position.y = h.y + Math.sin(Math.min(1, h.t / .35) * Math.PI) * .8; if (h.t > .35) { h.m.position.y = h.y; hops.splice(i, 1); } }
    renderer.render(scene, cam);
    if (visible && (!reduced || dragging || goHome || hops.length || Math.abs(vT) + Math.abs(vP) > .0005)) raf = requestAnimationFrame(frame);
  }
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) request(); }).observe(host);
  size(); setNight(!!opts.night);

  return {
    setNight,
    // buttons: turn round, tilt up or down, zoom, and go back to the home view
    orbit: (dT, dP) => { idle = 0; goHome = false; vT = dT * .08; vP = dP * .08; request(); },
    zoom: k => { idle = 0; cam.zoom = Math.max(.7, Math.min(2.2, cam.zoom * k)); cam.updateProjectionMatrix(); request(); },
    reset: () => { goHome = true; idle = 0; request(); }
  };
}
