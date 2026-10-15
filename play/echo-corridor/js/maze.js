/**
 * Echo Corridor: Sound-Stealth Maze — DXB211 Creative Coding Project
 * Student: Qinxi Yao
 * Student number: n12138401
 *
 * maze.js — tile maps, collisions and level drawing.
 * [Own work — DXB211] Nested loops over grid data; wall, floor, shard and exit logic.
 * [Own work — DXB211] ASCII level maps designed for a maze-based public arcade interaction.
 * [AI-assisted — disclosed] Breadth-first search helpers for enemy pathfinding and distance.
 */
const TILE = 16;

const CELL = {
  FLOOR: 0,
  WALL: 1,
  EXIT: 3,
};

const LEVELS = [
  {
    name: '1 - AWAKENING',
    grace: 90,
    hint: '1:PICKUP 2:DECOY 3:MUTE - STEPS MAKE NOISE',
    rows: [
      '######################',
      '#S...................#',
      '#....................#',
      '#....F...............#',
      '#....####............#',
      '#....#..#............#',
      '#....#..#............#',
      '#....####............#',
      '#....................#',
      '#...................F#',
      '#....................G',
      '######################',
    ],
    enemies: [{ type: 'hunter', moveEvery: 22, start: { gx: 16, gy: 5 } }],
  },
  {
    name: '2 - FORKS',
    grace: 75,
    hint: 'ENEMIES HEAR SOUND ONLY - USE DECOYS',
    rows: [
      '########################',
      '#S.....................#',
      '#......................#',
      '#..######......######..#',
      '#..#....#..F...#....#..#',
      '#..#.##.#......#.##.#..#',
      '#..#....########....#..#',
      '#..######......######..#',
      '#......................#',
      '#....F.................#',
      '#......................#',
      '#...................F..#',
      '#......................#',
      '#......................G',
      '########################',
    ],
    enemies: [
      { type: 'hunter', moveEvery: 18, start: { gx: 19, gy: 7 } },
      { type: 'stalker', moveEvery: 30, start: { gx: 5, gy: 11 }, startDelay: 45 },
    ],
  },
  {
    name: '3 - DEEP HALL',
    grace: 60,
    hint: '4 SHARDS - ORANGE RING = DECOY BLAST',
    rows: [
      '##############################',
      '#S...........................#',
      '#............................#',
      '#....####............####....#',
      '#....#..#............#..#....#',
      '#....#..#............#..#....#',
      '#....#...F...#...F...#.......#',
      '#....#..#............#..#....#',
      '#....####....####....####....#',
      '#............#..#............#',
      '#..F.........#..#.........F..#',
      '#............#..#............#',
      '#....####....####....####....#',
      '#....#..#............#..#....#',
      '#....#...F...#...F...#.......#',
      '#....#..#............#..#....#',
      '#....####............####....#',
      '#............................#',
      '#............................G',
      '##############################',
    ],
    enemies: [
      { type: 'patrol', moveEvery: 18, start: { gx: 12, gy: 9 }, patrol: [{ gx: 12, gy: 9 }, { gx: 18, gy: 9 }] },
      { type: 'hunter', moveEvery: 16, start: { gx: 22, gy: 12 } },
      { type: 'stalker', moveEvery: 28, start: { gx: 7, gy: 14 }, startDelay: 50 },
    ],
  },
];

const Maze = {
  cols: 0,
  rowCount: 0,
  grid: [],
  offsetX: 0,
  offsetY: 0,
  startGx: 0,
  startGy: 0,
  exitGx: 0,
  exitGy: 0,
  levelIndex: 0,
  fragments: [],

  loadLevel(index, opts) {
    this.levelIndex = index;
    const lvl = LEVELS[index];
    this.fragments = [];
    this.rowCount = lvl.rows.length;
    this.cols = lvl.rows[0].length;
    this.grid = [];

    for (let gy = 0; gy < this.rowCount; gy++) {
      const row = [];
      for (let gx = 0; gx < this.cols; gx++) {
        const ch = lvl.rows[gy][gx];
        let cell = CELL.WALL;
        if (ch === '.' || ch === 'S') cell = CELL.FLOOR;
        if (ch === 'G') { cell = CELL.EXIT; this.exitGx = gx; this.exitGy = gy; }
        if (ch === 'F') { cell = CELL.FLOOR; this.fragments.push({ gx, gy, taken: false }); }
        if (ch === 'S') { this.startGx = gx; this.startGy = gy; }
        row.push(cell);
      }
      this.grid.push(row);
    }

    this.layout();
  },

  /** Map position is fixed — story draws in the gap below without shifting the maze. */
  layout() {
    const mw = this.cols * TILE;
    const mh = this.rowCount * TILE;
    const hudTop = 48;
    const bottomPad = UI.bottomBarH + 8;
    const usableH = height - hudTop - bottomPad;
    this.offsetX = floor((width - mw) / 2);
    this.offsetY = hudTop + max(0, floor((usableH - mh) / 2));
    this.storyPanelTop = this.offsetY + mh + 12;
    this.mapPixelW = mw;
    this.mapPixelH = mh;
  },

  storyZoneHeight() {
    return max(56, height - UI.bottomBarH - 12 - this.storyPanelTop);
  },

  tryPickupFragment(gx, gy) {
    for (const f of this.fragments) {
      if (!f.taken && f.gx === gx && f.gy === gy) {
        f.taken = true;
        Game.collectFragment();
        return 'SHARD +100';
      }
    }
    return null;
  },

  fragmentsLeft() {
    return this.fragments.filter((f) => !f.taken).length;
  },

  totalFragments() {
    return this.fragments.length;
  },

  fragmentsTaken() {
    return this.fragments.filter((f) => f.taken).length;
  },

  isWall(gx, gy) {
    if (gx < 0 || gy < 0 || gx >= this.cols || gy >= this.rowCount) return true;
    return this.grid[gy][gx] === CELL.WALL;
  },

  canReachExit() {
    return this.fragmentsLeft() === 0;
  },

  isFragmentHere(gx, gy) {
    return this.fragments.some((f) => !f.taken && f.gx === gx && f.gy === gy);
  },

  manhattan(ax, ay, bx, by) {
    return abs(ax - bx) + abs(ay - by);
  },

  // [AI-assisted — disclosed] Breadth-first search: first step toward target
  bfsNextStep(fromGx, fromGy, toGx, toGy) {
    if (fromGx === toGx && fromGy === toGy) return null;
    const key = (x, y) => `${x},${y}`;
    const visited = new Set([key(fromGx, fromGy)]);
    const queue = [{ gx: fromGx, gy: fromGy, first: null }];
    const dirs = [
      { x: 1, y: 0 }, { x: -1, y: 0 },
      { x: 0, y: 1 }, { x: 0, y: -1 },
    ];

    while (queue.length > 0) {
      const cur = queue.shift();
      for (const d of dirs) {
        const nx = cur.gx + d.x;
        const ny = cur.gy + d.y;
        const k = key(nx, ny);
        if (visited.has(k) || this.isWall(nx, ny)) continue;
        visited.add(k);
        const step = cur.first || { x: d.x, y: d.y };
        if (nx === toGx && ny === toGy) return step;
        queue.push({ gx: nx, gy: ny, first: step });
      }
    }
    return null;
  },

  // [AI-assisted — disclosed] BFS distance (used by enemy sound scoring)
  bfsDistance(fromGx, fromGy, toGx, toGy) {
    if (fromGx === toGx && fromGy === toGy) return 0;
    const key = (x, y) => `${x},${y}`;
    const visited = new Set([key(fromGx, fromGy)]);
    const queue = [{ gx: fromGx, gy: fromGy, dist: 0 }];
    const dirs = [
      { x: 1, y: 0 }, { x: -1, y: 0 },
      { x: 0, y: 1 }, { x: 0, y: -1 },
    ];

    while (queue.length > 0) {
      const cur = queue.shift();
      for (const d of dirs) {
        const nx = cur.gx + d.x;
        const ny = cur.gy + d.y;
        const k = key(nx, ny);
        if (visited.has(k) || this.isWall(nx, ny)) continue;
        visited.add(k);
        if (nx === toGx && ny === toGy) return cur.dist + 1;
        queue.push({ gx: nx, gy: ny, dist: cur.dist + 1 });
      }
    }
    return 9999;
  },

  gridToPixel(gx, gy) {
    return {
      x: this.offsetX + gx * TILE + TILE / 2,
      y: this.offsetY + gy * TILE + TILE / 2,
    };
  },

  draw(t) {
    push();
    translate(this.offsetX, this.offsetY);
    noStroke();

    for (let gy = 0; gy < this.rowCount; gy++) {
      for (let gx = 0; gx < this.cols; gx++) {
        const c = this.grid[gy][gx];
        if (c === CELL.WALL) continue;
        PX.drawFloorTile(gx * TILE, gy * TILE, (gx + gy) % 2);
      }
    }

    Footprints.draw(); // [AI-assisted] fading step marks — see stealth.js

    for (const f of this.fragments) {
      if (f.taken) continue;
      if (sin(t * 5 + f.gx) > -0.2) {
        PX.drawProp('fragment', f.gx, f.gy, f.gx * TILE, f.gy * TILE);
      }
    }

    for (let gy = 0; gy < this.rowCount; gy++) {
      for (let gx = 0; gx < this.cols; gx++) {
        if (this.grid[gy][gx] !== CELL.WALL) continue;
        PX.drawWallTile(gx * TILE, gy * TILE, gx, gy);
      }
    }

    const locked = !this.canReachExit();
    PX.drawProp(locked ? 'exitLock' : 'exitOpen', this.exitGx, this.exitGy, this.exitGx * TILE, this.exitGy * TILE);

    pop();
  },
};
