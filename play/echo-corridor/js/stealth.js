/**
 * Echo Corridor: Sound-Stealth Maze — DXB211 Creative Coding Project
 * Student: Qinxi Yao
 * Student number: n12138401
 *
 * stealth.js — sound events, decoys and footprint traces, not audio playback.
 * [Own work — DXB211] Arrays of objects, update loops and sound-as-gameplay concept.
 * [Own work — DXB211] Decoy fuse countdown and footstep generation when not muted.
 * [AI-assisted — disclosed] Blast rings, fading footprint marks and sound source scoring support.
 */
const Sound = {
  /** @type {{gx:number,gy:number,power:number,age:number,maxAge:number,type:'foot'|'blast'|'other'}[]} */
  sources: [],

  reset() {
    this.sources = [];
  },

  /**
   * @param {number} gx
   * @param {number} gy
   * @param {number} power  Higher means more attractive.
   * @param {number} maxAge Frames to live.
   * @param {'foot'|'blast'|'other'} type
   */
  emit(gx, gy, power, maxAge, type) {
    this.sources.push({
      gx,
      gy,
      power: power ?? 1,
      age: 0,
      maxAge: maxAge ?? 60,
      type: type || 'other',
    });
  },

  update() {
    for (let i = this.sources.length - 1; i >= 0; i--) {
      const s = this.sources[i];
      s.age++;
      if (s.age >= s.maxAge) this.sources.splice(i, 1);
    }
  },

  getActive() {
    return this.sources;
  },

  getLoudest() {
    let best = null;
    let bestScore = -Infinity;
    for (const s of this.sources) {
      const t = 1 - s.age / s.maxAge;
      const score = s.power * (0.35 + 0.65 * t);
      if (score > bestScore) {
        bestScore = score;
        best = s;
      }
    }
    return best;
  },

  draw(t) {
    // Draw decoy blast rings only (footsteps have no ring — avoids clutter)
    for (const s of this.sources) {
      if (s.type !== 'blast') continue;
      const life = 1 - s.age / s.maxAge;
      const radius = 3 + life * 4;
      const alpha = floor(60 + life * 140);
      PX.drawSoundRing(s.gx, s.gy, radius, alpha, PX.palette.blast);
    }
  },
};

// [AI-assisted — disclosed] Visible footstep marks (centred block, alpha fade)
const Footprints = {
  marks: [],
  maxAge: 210,
  maxMarks: 100,

  reset() {
    this.marks = [];
  },

  add(gx, gy) {
    this.marks.push({ gx, gy, age: 0 });
    if (this.marks.length > this.maxMarks) this.marks.shift();
  },

  update() {
    for (let i = this.marks.length - 1; i >= 0; i--) {
      this.marks[i].age++;
      if (this.marks[i].age >= this.maxAge) this.marks.splice(i, 1);
    }
  },

  draw() {
    if (!Maze.cols || !this.marks.length) return;
    colorMode(RGB, 255);
    noStroke();
    for (const m of this.marks) {
      const life = 1 - m.age / this.maxAge;
      const alpha = floor(life * 220);
      PX.drawFootprint(m.gx, m.gy, alpha);
    }
  },
};

const Decoy = {
  /** @type {{gx:number,gy:number,fuse:number,exploded:boolean}[]} */
  list: [],
  fuseFrames: 120, // 2 seconds at 60fps
  blastLife: 110,
  blastPower: 14,
  maxActive: 1,

  reset() {
    this.list = [];
  },

  canThrow() {
    return this.list.filter((d) => !d.exploded).length < this.maxActive;
  },

  /**
   * Throws a decoy to a target grid cell.
   * Implementation starts simple: spawn at (gx,gy) if walkable.
   */
  throwTo(gx, gy) {
    if (!this.canThrow()) return false;
    if (Maze?.isWall?.(gx, gy)) return false;
    this.list.push({ gx, gy, fuse: this.fuseFrames, exploded: false });
    return true;
  },

  /**
   * Convenience: throw forward from player using a direction.
   * @param {number} fromGx
   * @param {number} fromGy
   * @param {{x:number,y:number}} dir
   */
  throwForward(fromGx, fromGy, dir) {
    const dx = dir?.x ?? 0;
    const dy = dir?.y ?? 0;
    const tx = fromGx + (dx !== 0 || dy !== 0 ? dx : 1);
    const ty = fromGy + (dx !== 0 || dy !== 0 ? dy : 0);
    return this.throwTo(tx, ty);
  },

  update() {
    for (const d of this.list) {
      if (d.exploded) continue;
      d.fuse--;
      if (d.fuse <= 0) {
        d.exploded = true;
        Sound.emit(d.gx, d.gy, this.blastPower, this.blastLife, 'blast');
      }
    }
    // keep exploded decoys a short while for rendering if needed
    for (let i = this.list.length - 1; i >= 0; i--) {
      const d = this.list[i];
      if (d.exploded && d.fuse <= -20) this.list.splice(i, 1);
      if (d.exploded) d.fuse--;
    }
  },

  draw(t) {
    for (const d of this.list) {
      if (d.exploded) continue;
      const p = Maze.gridToPixel(d.gx, d.gy);
      const pulse = sin(t * 10) > 0;
      if (pulse) {
        PX.drawActor('decoy', p.x, p.y, ACTOR_SIZE());
      }
      // Decoy sprite blinks while fuse counts down
    }
  },
};
