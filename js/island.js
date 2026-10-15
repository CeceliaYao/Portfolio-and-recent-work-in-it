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
  cam.position.set(46, 38, 46); cam.lookAt(0, 1.5, 0);

  /* ---------- lights ---------- */
  const hemi = new THREE.HemisphereLight('#cfe9ff', '#e6cfa8', 1.05); scene.add(hemi);
  const sun = new THREE.DirectionalLight('#fff1d6', 1.6);
  sun.position.set(18, 30, 10); sun.castShadow = true;
  sun.shadow.mapSize.set(512, 512);
  Object.assign(sun.shadow.camera, { left: -22, right: 22, top: 22, bottom: -22, near: 1, far: 90 });
  sun.shadow.bias = -0.002;
  scene.add(sun);
  const lamp = new THREE.PointLight('#ffb35a', 0, 14, 1.6); lamp.position.set(-6.4, 5.2, -4.9); island.add(lamp);
  const screenLight = new THREE.PointLight('#7fd0ff', 0, 7, 2); screenLight.position.set(-6.2, 4.4, -2); island.add(screenLight);
  const lantern = new THREE.PointLight('#ffd27a', 0, 9, 2); lantern.position.set(9.5, 3.4, 9.5); island.add(lantern);

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

  /* ---------- the floating island: instanced voxel columns ---------- */
  const R = 13.2, cells = [];
  const rnd = (x, z) => { const s = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453; return s - Math.floor(s); };
  for (let x = -14; x <= 14; x++) for (let z = -14; z <= 14; z++) {
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

  /* ---------- the room ---------- */
  B(-9, -1, -9, 17, 1, 17, COL.carpet);                         // floor
  B(-3, 0, 0, 8, .15, 4, COL.pink);                            // rug
  // back wall with a window
  B(-9, 0, -9, 11, 11, 1, COL.wall); B(7, 0, -9, 2, 11, 1, COL.wall);
  B(2, 0, -9, 5, 4, 1, COL.wall); B(2, 9, -9, 5, 2, 1, COL.wall);
  const glass = B(2, 4, -8.8, 5, 5, .2, '#a8d6f0', 'window', '#3a6a88');
  B(1.6, 3.7, -8.3, 5.8, .35, .9, COL.white);                  // sill
  B(4.4, 4, -8.7, .2, 5, .2, COL.white); B(2, 6.4, -8.7, 5, .2, .2, COL.white);
  B(.9, 3, -8.2, .7, 8, .5, COL.plum); B(7.4, 3, -8.2, .5, 8, .4, '#fbf7ef');   // curtains
  // left wall with a door
  B(-9, 0, -8, 1, 11, 13.5, COL.wall); B(-9, 6.5, 5.5, 1, 4.5, 2.5, COL.wall); B(-9, 0, 8, 1, 11, 1, COL.wall);
  B(-8.9, 0, 5.5, .2, 6.5, 2.5, '#6f6253', 'door');
  B(-8.2, 0, 5.2, .3, 6.8, .3, COL.white); B(-8.2, 0, 7.9, .3, 6.8, .3, COL.white); B(-8.2, 6.5, 5.2, .3, .3, 3, COL.white);
  // skirting
  B(-8, 0, -8, 16, .5, .2, COL.white); B(-8, 0, -8, .2, .5, 13.2, COL.white);

  // desk along the left wall
  B(-8, 3, -6, 3, .4, 7, COL.birch);
  for (const [lx, lz] of [[-5.5, -5.8], [-5.5, .7], [-7.8, -5.8], [-7.8, .7]]) B(lx, 0, lz, .3, 3, .3, COL.white);
  B(-7.9, 3.4, -4, .5, .3, 2.6, '#3a363f');                     // monitor foot
  B(-7.7, 3.7, -3.1, .3, .9, .6, '#3a363f');
  B(-7.8, 4.5, -4.6, .4, 2.4, 3.8, '#26232a', 'computer');
  const screen = B(-7.38, 4.7, -4.4, .05, 2, 3.4, '#20305a', 'computer', '#2c5aa0');
  B(-6.8, 3.4, -4.2, .9, .15, 2.4, '#2b2a30', 'computer');      // keyboard
  B(-7.6, 3.4, -5.8, .9, .2, .9, COL.white, 'lamp'); B(-7.25, 3.6, -5.45, .2, 2, .2, COL.white, 'lamp');
  B(-7.4, 5.5, -5.6, 1.6, .35, .7, COL.white, 'lamp', '#000000');
  B(-7.7, 3.4, -.6, .7, 2.2, 1, '#f4f4f4', 'ps5'); B(-7.05, 3.5, -.45, .08, 2, .7, '#1f1c22', 'ps5');
  // chair
  B(-5, 1.6, -3.7, 1.9, .4, 1.9, '#2f2c33'); B(-3.5, 1.6, -3.7, .4, 2.6, 1.9, '#2f2c33'); B(-4.15, 0, -2.85, .2, 1.6, .2, '#1f1c22'); B(-5, 0, -3.7, 1.9, .2, 1.9, '#1f1c22');
  // water carton under the desk
  B(-7.8, 0, -.2, 1.6, 1.3, 1.3, COL.blue, 'water'); B(-7.8, 1.3, -.2, 1.6, .1, 1.3, '#ffffff', 'water');
  // wall shelf with perfume, penguin and books
  B(-8, 6.8, -6, 1.3, .25, 4.4, COL.white);
  B(-7.8, 7.05, -5.7, .45, .6, .45, '#d9933f', 'perfume'); B(-7.8, 7.65, -5.65, .35, .25, .35, '#2c2730', 'perfume');
  B(-7.8, 7.05, -5.05, .45, .9, .45, '#f6b3c4', 'perfume'); B(-7.75, 7.95, -5, .3, .25, .3, '#d9534a', 'perfume');
  B(-7.85, 7.05, -4.3, .8, .9, .8, '#2d3346', 'penguin'); B(-7.1, 7.15, -4.15, .1, .6, .5, '#f4f1ea', 'penguin'); B(-7.85, 7.95, -4.3, .8, .35, .8, '#8fb8e8', 'penguin');
  ['#d9534a', '#4fa3e0', '#f5d061', '#7cc36b', '#a78bdc'].forEach((c, i) => B(-7.8, 7.05, -3.3 + i * .32, .7, .8 + (i % 2) * .25, .28, c));
  // hiking things by the door
  B(-8, 3.4, 2.6, .9, 2.2, 1.7, COL.blue, 'backpack'); B(-7.15, 3.6, 2.9, .1, 1.8, .25, COL.navy, 'backpack'); B(-7.15, 3.6, 3.75, .1, 1.8, .25, COL.navy, 'backpack');
  B(-7.15, 4.6, 2.75, .1, .25, 1.4, COL.navy, 'backpack');
  B(-8, 6, 2.8, .7, .35, 1.3, '#fbf7ef', 'visor'); B(-7.4, 5.9, 2.8, .4, .12, 1.3, '#e3dccf', 'visor');
  B(-7.9, 0, 4.6, .22, 4.8, .22, '#d9789a', 'poles'); B(-7.5, 0, 4.9, .22, 4.6, .22, '#d9789a', 'poles');
  B(-7.9, 4.8, 4.6, .3, .9, .3, COL.ink, 'poles'); B(-7.5, 4.6, 4.9, .3, .9, .3, COL.ink, 'poles');
  // bar rack in the back corner
  B(-7.9, 0, -8, .2, 4.6, .2, COL.ink); B(-5.3, 0, -8, .2, 4.6, .2, COL.ink); B(-7.9, 0, -6.6, .2, 4.6, .2, COL.ink); B(-5.3, 0, -6.6, .2, 4.6, .2, COL.ink);
  for (const y of [1.4, 2.9, 4.4]) B(-7.9, y, -8, 2.8, .2, 1.6, '#3a363f');
  B(-7.5, 4.6, -7.6, .45, 1.4, .45, '#6b3a1c', 'whisky'); B(-7.45, 6, -7.55, .35, .25, .35, '#2f8f8a', 'whisky');
  B(-6.8, 4.6, -7.7, .7, 1, .35, '#d9933f', 'whisky');
  B(-6, 4.6, -7.6, .5, 1.2, .5, '#e3dcf2', 'gin'); B(-5.95, 5.8, -7.55, .4, .3, .4, '#ffffff', 'gin');
  // fridge with my magnets
  B(-4.4, 0, -8, 2.6, 4.6, 2.1, COL.steel); B(-4.4, 2.6, -5.88, 2.6, .08, .02, '#9aa2a9');
  B(-4.1, 3.3, -5.92, .7, .85, .1, '#a78bdc', 'picasso');
  B(-3.1, 3.1, -5.92, .7, 1, .1, '#e86a6a', 'beads'); B(-2.95, 3.9, -5.92, .45, .3, .1, '#f6b3c4', 'beads');
  B(-3.9, 1.6, -5.92, .8, .8, .1, '#e8c27a', 'jade');
  // cork board and posters on the back wall
  B(-8, 6.4, -8.1, 2.6, 2.2, .15, '#c99a62', 'photos');
  [['#4f7fb0', -7.8, 7.6], ['#e8a14e', -6.9, 6.7], ['#3f8a4a', -6.4, 7.7], ['#2c2730', -7.6, 6.6]].forEach(([c, x, y]) => B(x, y, -7.98, .75, .65, .05, c, 'photos'));
  B(-4.6, 6, -8.1, 2.2, 1.6, .15, '#ffb46b', 'poster-next-chapter'); B(-4.3, 6.2, -7.98, .8, .6, .05, '#8fcfff', 'poster-next-chapter');
  B(-2, 6.2, -8.1, 2, 1.4, .15, '#0b0d1a', 'poster-echo-corridor'); B(-1.6, 6.6, -7.98, .25, .25, .05, '#5fe0ff', 'poster-echo-corridor', '#2a6070'); B(-.7, 6.8, -7.98, .25, .25, .05, '#ff5fb4', 'poster-echo-corridor', '#702040');
  B(.3, 6.4, -8.1, 1.3, 1.3, .15, '#efe9f6', 'poster-shopmirror'); B(.45, 6.6, -7.98, .45, .9, .05, '#ff6478', 'poster-shopmirror'); B(1, 6.6, -7.98, .45, .9, .05, '#6fd88a', 'poster-shopmirror');
  B(-4, 8.3, -8.1, 1.2, 1.6, .15, '#d6d6d4', 'poster-astrobius'); B(-3.7, 8.7, -7.98, .6, .7, .05, '#1d1d1f', 'poster-astrobius');
  // plants on the sill
  B(2.4, 4.05, -8.5, .8, 1, .7, '#fbf7ef', 'catpot'); B(2.5, 5.05, -8.45, .6, .4, .6, '#7cc36b', 'catpot'); B(2.75, 5.45, -8.3, .1, 1.3, .1, '#7cc36b', 'catpot'); B(2.7, 6.7, -8.3, .3, .2, .2, '#f5d061', 'catpot');
  B(5.9, 4.05, -8.5, .8, .7, .7, '#2c2730', 'succulent'); B(5.95, 4.75, -8.45, .7, .15, .6, '#f5d061', 'succulent'); B(6.05, 4.9, -8.35, .5, .5, .45, '#8fd1a8', 'succulent');
  // bed in the corner by the window
  B(2.5, 0, -8, 5.5, 1.4, 9, COL.white); B(2.5, 1.4, -8, 5.5, 2.6, .5, COL.white);
  B(2.6, 1.4, -7.5, 5.3, .9, 8.4, '#f3efe6');
  B(2.6, 2.3, -4.6, 5.4, .45, 5.5, '#ffffff');
  for (let i = 0; i < 5; i++) B(2.6, 2.75, -4.2 + i * 1.05, 5.4, .06, .25, '#e3ddd1');
  B(3, 2.3, -7.3, 2.1, .6, 1.6, '#fbf9f4'); B(5.4, 2.3, -7.3, 2.1, .6, 1.6, '#fbf9f4');
  B(6.4, 2.3, -6.1, 1.2, 1, 1, '#8b7bd1', 'kitty'); B(6.3, 3.3, -6.2, 1.4, 1.1, 1.2, '#fbf8f2', 'kitty'); B(7.2, 4.3, -6.1, .5, .35, .4, '#8b7bd1', 'kitty');
  // fairy lights along the walls
  const bulbs = [];
  const bulbCols = ['#ffd95a', '#ff8fb1', '#8fe3d0', '#c3a6ff'];
  for (let i = 0; i < 14; i++) bulbs.push(B(-8 + i * 1.15, 10.1 - (i % 2) * .35, -7.85, .28, .35, .25, bulbCols[i % 4], null));
  for (let i = 0; i < 11; i++) bulbs.push(B(-7.85, 10.1 - (i % 2) * .35, -7 + i * 1.15, .25, .35, .28, bulbCols[(i + 1) % 4], null));
  bulbs.forEach((b, i) => { b.material = new THREE.MeshLambertMaterial({ color: bulbCols[i % 4], emissive: '#000000' }); b.castShadow = false; });

  // outside: a tree, a lamp post, some flowers
  // a tree behind the bedroom wall
  { const tx = -11.2, tz = -6; B(tx, -1, tz, 1, 6, 1, '#6e4026');
    for (const [x, y, z, w, h, d] of [[-1.6, 4.5, -1.6, 4.2, 2.6, 4.2], [-1, 6.8, -1, 3, 1.8, 3], [-.5, 8.4, -.5, 2, 1, 2]]) B(tx + x, y, tz + z, w, h, d, '#3f8a4a');
    B(tx - 1.8, 5.4, tz - 1.7, 1, .8, 1, '#7cc36b'); B(tx + 1.4, 7, tz + 1.2, .8, .8, .8, '#7cc36b'); }
  B(9.8, -1, 9.8, .3, 4.4, .3, COL.ink); const bulb = B(9.55, 3.4, 9.55, .8, .8, .8, '#fff3c8', null, '#000000');
  [[11, 6], [10.6, -3], [-11, 3], [3, 11], [-4, 11.5], [8, -9], [12, 0]].forEach(([x, z], i) => { B(x, -1, z, .3, .5, .3, '#3f8a4a'); B(x - .15, -.5, z - .15, .6, .5, .6, ['#ff8fb1', '#f5d061', '#ffffff', '#c3a6ff'][i % 4]); });

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
    glass.material.color.set(n ? '#1b2142' : '#a8d6f0'); glass.material.emissive.set(n ? '#121a40' : '#3a6a88');
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
    const aspect = r.width / Math.max(1, r.height), view = r.width < 520 ? 18 : 16.5;
    cam.left = -view * aspect; cam.right = view * aspect; cam.top = view; cam.bottom = -view; cam.updateProjectionMatrix();
    request();
  }
  new ResizeObserver(size).observe(host);

  /* ---------- interaction: drag to turn, hover, click ---------- */
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  const MIN = -0.8, MAX = 0.7, HOME = -0.2;
  let rotY = HOME, vel = 0, dragging = false, startX = 0, lastX = 0, moved = 0, hoverTag = null, idle = 0, mx = 0, my = 0;
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
  cv.addEventListener('pointerdown', e => { dragging = true; startX = lastX = e.clientX; moved = 0; vel = 0; idle = 0; cv.setPointerCapture(e.pointerId); });
  cv.addEventListener('pointermove', e => {
    mx = e.clientX; my = e.clientY;
    if (dragging) { const dx = e.clientX - lastX; lastX = e.clientX; moved += Math.abs(dx); const out = rotY < MIN || rotY > MAX; rotY += dx * .008 * (out ? .3 : 1); vel = dx * .008; if (moved > 6) setHover(null); request(); return; }
    setHover(pick(e), e);
  });
  cv.addEventListener('pointerup', e => {
    dragging = false;
    if (moved < 6) { const t = pick(e); if (t) { pop(t); opts.onSelect(t); } }
  });
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
      rotY += vel; vel *= .9; idle += dt;
      // the room is open on two sides only, so it swings rather than spins
      if (rotY > MAX) rotY += (MAX - rotY) * .15; if (rotY < MIN) rotY += (MIN - rotY) * .15;
      if (!reduced && idle > 3) rotY += (HOME + Math.sin(now / 4200) * .45 - rotY) * Math.min(1, dt * .8);
    }
    world.rotation.y = rotY;
    island.position.y = reduced ? 0 : Math.sin(now / 1400) * .35;
    clouds.forEach(c => { const u = c.userData; u.a += dt * u.s * (reduced ? 0 : 1); c.position.set(Math.cos(u.a) * u.r, u.y, Math.sin(u.a) * u.r); c.rotation.y = -u.a; });
    if (night) bulbs.forEach((b, i) => b.material.emissive.set(Math.sin(now / 700 + i * 1.7) > -.5 ? bulbCols[i % 4] : '#000000'));
    else bulbs.forEach(b => b.material.emissive.set('#000000'));
    screen.material.emissive.set(night ? '#4f8fe0' : '#2c5aa0');
    for (let i = hops.length - 1; i >= 0; i--) { const h = hops[i]; h.t += dt; h.m.position.y = h.y + Math.sin(Math.min(1, h.t / .35) * Math.PI) * .8; if (h.t > .35) { h.m.position.y = h.y; hops.splice(i, 1); } }
    renderer.render(scene, cam);
    if (visible && (!reduced || dragging || hops.length || Math.abs(vel) > .0005)) raf = requestAnimationFrame(frame);
  }
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) request(); }).observe(host);
  size(); setNight(!!opts.night);

  return { setNight, rotate: (a) => { idle = 0; rotY = Math.max(MIN, Math.min(MAX, rotY + a)); request(); } };
}
