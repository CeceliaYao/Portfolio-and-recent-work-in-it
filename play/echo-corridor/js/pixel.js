/**
 * Echo Corridor: Sound-Stealth Maze — DXB211 Creative Coding Project
 * Student: Qinxi Yao
 * Student number: n12138401
 *
 * pixel.js — colour palette, pixel sprites and text helpers.
 * [Own work — DXB211] RGB palette decisions, tile drawing and icon language.
 * [Own work — DXB211] Dark corridor atmosphere and readable public-display contrast.
 * [AI-assisted — disclosed] 8 × 8 sprite grid renderer, wrapped text measurement and centring.
 */
const ACTOR_SIZE = () => TILE * 0.875;

const PX = {

  palette: {
    bg0: [22, 24, 32],
    bg1: [12, 13, 18],
    floor: [32, 36, 56],
    floorAlt: [26, 30, 48],
    floorDot: [42, 46, 68],
    wall: [58, 62, 88],
    wallMid: [44, 48, 72],
    wallDark: [32, 36, 54],
    wallHi: [88, 94, 128],
    wallEdge: [110, 118, 150],
    player: [0, 220, 200],
    playerHi: [180, 255, 240],
    enemy: [255, 60, 100],
    enemyPatrol: [255, 140, 60],
    enemyStalk: [180, 80, 255],
    fragment: [255, 220, 80],
    checkpoint: [80, 255, 180],
    exit: [255, 210, 90],
    exitLock: [70, 58, 42],
    sound: [140, 120, 255],
    footprint: [100, 130, 200],
    blast: [255, 180, 80],
    decoy: [255, 255, 120],
    ui: [200, 210, 235],
    uiDim: [110, 118, 145],
    storyTitle: [210, 212, 220],
    storyBody: [175, 178, 188],
    storyCta: [145, 148, 158],
    storyHint: [95, 98, 108],
    titleEcho: [0, 235, 215],
    titleCorridor: [255, 200, 95],
  },

  _sprites: {},

  init() {
    this._sprites.player = this._makePlayer();
    this._sprites.enemy = this._makeEnemy('hunter');
    this._sprites.patrol = this._makeEnemy('patrol');
    this._sprites.stalker = this._makeEnemy('stalker');
    this._sprites.fragment = this._makeFragment();
    this._sprites.exitOpen = this._makeExit(false);
    this._sprites.exitLock = this._makeExit(true);
    this._sprites.decoy = this._makeDecoy();
  },

  // [AI-assisted] Build 8×8 bitmap from a function (pixel art pipeline)
  _grid(w, h, fn) {
    const g = [];
    for (let y = 0; y < h; y++) {
      const row = [];
      for (let x = 0; x < w; x++) row.push(fn(x, y) ? 1 : 0);
      g.push(row);
    }
    return g;
  },

  _makePlayer() {
    return this._grid(8, 8, (x, y) => {
      if (y <= 2 && x >= 2 && x <= 5) return true;
      if (y >= 3 && y <= 6 && x >= 1 && x <= 6) return true;
      if (y === 7 && x >= 2 && x <= 5) return true;
      return false;
    });
  },

  _makeEnemy(type) {
    return this._grid(8, 8, (x, y) => {
      if (type === 'patrol') return x >= 1 && x <= 6 && y >= 1 && y <= 6;
      if (type === 'stalker') return dist(x, y, 4, 4) < 3.2;
      const d = dist(x, y, 4, 4);
      return d > 1.5 && d < 3.5;
    });
  },

  _makeFragment() {
    return this._grid(8, 8, (x, y) => {
      const d = dist(x, y, 4, 4);
      return d > 1.2 && d < 3.2;
    });
  },

  _makeExit(locked) {
    return this._grid(8, 8, (x, y) => {
      if (locked) return x >= 2 && x <= 5 && y >= 2 && y <= 5;
      return (x >= 1 && x <= 6 && (y <= 1 || y >= 6)) || (y >= 2 && y <= 5 && x >= 2 && x <= 5);
    });
  },

  _makeDecoy() {
    return this._grid(8, 8, (x, y) => dist(x, y, 4, 4) < 2);
  },

  colorForSprite(name) {
    const p = this.palette;
    const map = {
      player: p.player, patrol: p.enemyPatrol, stalker: p.enemyStalk,
      enemy: p.enemy, fragment: p.fragment,
      exitOpen: p.exit, exitLock: p.exitLock, decoy: p.decoy,
    };
    return map[name] || p.floor;
  },

  drawSprite(name, px, py, drawSize) {
    const spr = this._sprites[name];
    if (!spr) return;
    const col = this.colorForSprite(name);
    const hi = this.palette.playerHi;
    const s = drawSize / spr[0].length;
    push();
    translate(px, py);
    noStroke();
    for (let y = 0; y < spr.length; y++) {
      for (let x = 0; x < spr[y].length; x++) {
        if (!spr[y][x]) continue;
        fill(col[0], col[1], col[2]);
        rect(x * s, y * s, s, s);
        if (name === 'player' && x === 3 && y === 1) {
          fill(hi[0], hi[1], hi[2]);
          rect(x * s, y * s, s, s);
        }
      }
    }
    pop();
  },

  // [AI-assisted — disclosed] Visual centre of filled pixels (for drawActorVisual)
  _spriteVisualCenter(spr) {
    let minX = 8;
    let minY = 8;
    let maxX = -1;
    let maxY = -1;
    for (let y = 0; y < spr.length; y++) {
      for (let x = 0; x < spr[y].length; x++) {
        if (!spr[y][x]) continue;
        minX = min(minX, x);
        maxX = max(maxX, x);
        minY = min(minY, y);
        maxY = max(maxY, y);
      }
    }
    if (maxX < 0) return { x: 4, y: 4 };
    return { x: (minX + maxX + 1) / 2, y: (minY + maxY + 1) / 2 };
  },

  /** Centered actor (player / enemy) at half tile */
  drawActor(name, cx, cy, size) {
    const sz = size ?? ACTOR_SIZE();
    this.drawSprite(name, cx - sz / 2, cy - sz / 2, sz);
  },

  /** [AI-assisted — disclosed] Offset sprite so visual centre sits on cx,cy */
  drawActorVisual(name, cx, cy, size) {
    const spr = this._sprites[name];
    if (!spr) return;
    const sz = size ?? ACTOR_SIZE();
    const cell = sz / spr[0].length;
    const vc = this._spriteVisualCenter(spr);
    const ox = (4 - vc.x) * cell;
    const oy = (4 - vc.y) * cell;
    this.drawSprite(name, cx - sz / 2 + ox, cy - sz / 2 + oy, sz);
  },

  /** Prop centered in cell, slightly smaller than tile */
  drawProp(name, gx, gy, tileX, tileY) {
    const sz = TILE * 0.8;
    const cx = tileX + (TILE - sz) / 2;
    const cy = tileY + (TILE - sz) / 2;
    this.drawSprite(name, cx, cy, sz);
  },

  // [AI-assisted] Animated title colours (sin / pulse)
  drawGameTitle(cx, y, t) {
    const p = this.palette;
    const pulse = 0.88 + sin((t || 0) * 2.2) * 0.12;
    const echoSize = 28;
    const corSize = 20;
    const echoCol = [
      floor(p.titleEcho[0] * pulse),
      floor(p.titleEcho[1] * pulse),
      floor(p.titleEcho[2] * pulse),
    ];

    pixelText('ECHO', cx, y, echoSize, echoCol, CENTER, TOP, true);
    const corY = y + echoSize + 6;
    pixelText('CORRIDOR', cx, corY, corSize, p.titleCorridor, CENTER, TOP, true);

    stroke(p.titleEcho[0], p.titleEcho[1], p.titleEcho[2], 80 + sin((t || 0) * 3) * 40);
    strokeWeight(1);
    const lineW = max(
      measureTextWidth('ECHO', echoSize, true),
      measureTextWidth('CORRIDOR', corSize, true),
    );
    line(cx - lineW / 2 - 8, corY + corSize + 8, cx + lineW / 2 + 8, corY + corSize + 8);
    noStroke();

    return corY + corSize + 14;
  },

  // [AI-assisted] Title screen character icons row
  drawTitleShowcase(cx, y, t) {
    const p = this.palette;
    const items = [
      { spr: 'player', label: 'YOU', col: p.player },
      { spr: 'enemy', label: 'SHADOW', col: p.enemy },
      { spr: 'fragment', label: 'SHARD F', col: p.fragment },
      { spr: 'exitOpen', label: 'EXIT G', col: p.exit },
      { spr: 'decoy', label: 'DECOY', col: p.blast },
    ];
    const iconSize = 30;
    const gap = 82;
    const totalW = (items.length - 1) * gap;
    const left = cx - totalW / 2;
    const padH = 54;

    push();
    noStroke();

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const x = left + i * gap;
      const bob = sin((t || 0) * 2.5 + i * 1.1) * 2;
      const colX = Math.round(x);
      const cy = Math.round(y + 18 + bob);
      this.drawActorVisual(item.spr, colX, cy, iconSize);
      pixelText(item.label, colX, y + padH - 12, 7, item.col, CENTER, TOP);
    }
    pop();

    return y + padH + 10;
  },

  drawFloorTile(x, y, alt) {
    const p = this.palette;
    fill(...(alt ? p.floorAlt : p.floor));
    noStroke();
    rect(x, y, TILE, TILE);
    fill(...p.floorDot);
    const off = alt ? 1 : 0;
    for (let py = 2; py < TILE; py += 4) {
      for (let px = 2 + ((py + off) % 4); px < TILE; px += 4) {
        rect(x + px, y + py, 1, 1);
      }
    }
  },

  drawWallTile(x, y, gx, gy) {
    const p = this.palette;
    fill(...p.wallDark);
    noStroke();
    rect(x, y, TILE, TILE);

    const brickW = 4;
    const brickH = 4;
    const shift = (gy % 2) * 2;
    for (let by = 0; by < TILE; by += brickH) {
      for (let bx = 0; bx < TILE; bx += brickW) {
        const ox = x + bx + ((by / brickH + gx) % 2 === 0 ? 0 : shift % brickW);
        const oy = y + by;
        if (ox + brickW > x + TILE) continue;
        fill(...p.wallMid);
        rect(ox, oy, brickW - 1, brickH - 1);
        fill(...p.wall);
        rect(ox, oy, brickW - 2, brickH - 2);
        fill(...p.wallHi);
        rect(ox, oy, brickW - 2, 1);
        rect(ox, oy, 1, brickH - 2);
      }
    }

    // top edge highlight when wall above is empty (optional: always subtle rim)
    fill(...p.wallEdge);
    rect(x, y, TILE, 1);
    rect(x, y, 1, TILE);
    fill(...p.wallDark);
    rect(x + TILE - 1, y, 1, TILE);
    rect(x, y + TILE - 1, TILE, 1);
  },

  drawBg() {
    const p = this.palette;
    noStroke();
    for (let y = 0; y < height; y++) {
      const t = y / height;
      fill(lerpColor(color(...p.bg0), color(...p.bg1), t));
      rect(0, y, width, 1);
    }
  },

  /** [AI-assisted] One centered solid pixel block per step; alpha fades over time */
  drawFootprint(gx, gy, alpha) {
    const c = this.palette.footprint;
    const size = 4;
    const x = gx * TILE + floor((TILE - size) / 2);
    const y = gy * TILE + floor((TILE - size) / 2);
    noStroke();
    fill(c[0], c[1], c[2], alpha);
    rect(x, y, size, size);
  },

  drawSoundRing(gx, gy, radius, alpha, col) {
    const p = Maze.gridToPixel(gx, gy);
    const r = radius * max(1, TILE / 16);
    noFill();
    stroke(col[0], col[1], col[2], alpha);
    strokeWeight(1);
    rectMode(CENTER);
    rect(p.x, p.y, r * 2, r * 2);
    rectMode(CORNER);
    noStroke();
  },
};

// [AI-assisted — disclosed] Switch Regular vs Bold for titles (used by pixelText / wrapTextLines)
function applyPixelFont(bold) {
  if (bold && gameFontBold) textFont(gameFontBold);
  else if (gameFont) textFont(gameFont);
}

function measureTextWidth(str, size, bold) {
  push();
  applyPixelFont(bold);
  textSize(size ?? 14);
  const w = textWidth(String(str ?? ''));
  pop();
  return w;
}

/** @returns {string[]} wrapped lines */
function wrapTextLines(str, maxWidth, size, bold) {
  const s = String(str ?? '').trim();
  if (!s) return [];
  const sz = size ?? 14;
  const words = s.split(/\s+/);
  const lines = [];
  let current = '';
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (measureTextWidth(test, sz, bold) > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [s];
}

function pixelTextBlockCentered(lines, cx, y, size, col, lineHeight, bold) {
  const lh = lineHeight ?? (size ?? 14) * 1.35;
  let yy = y;
  for (const line of lines) {
    pixelText(line, cx, yy, size, col, CENTER, TOP, bold);
    yy += lh;
  }
  return yy - y;
}

function pixelText(str, x, y, size, col, alignX, alignY, bold) {
  const s = String(str ?? '');
  if (!s) return;

  const c = col || PX.palette.ui;
  let ha = LEFT;
  if (alignX === CENTER || alignX === 'center') ha = CENTER;
  else if (alignX === RIGHT || alignX === 'right') ha = RIGHT;

  let va = TOP;
  if (alignY === CENTER || alignY === 'center') va = CENTER;
  else if (alignY === BOTTOM || alignY === 'bottom') va = BOTTOM;

  push();
  applyPixelFont(bold);
  textSize(size ?? 14);
  noStroke();
  fill(c[0], c[1], c[2]);
  textAlign(ha, va);
  text(s, x, y);
  pop();
}
