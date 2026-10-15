/**
 * Echo Corridor: Sound-Stealth Maze — DXB211 Creative Coding Project
 * Student: Qinxi Yao
 * Student number: n12138401
 *
 * enemy.js — shadows that chase sound, not the player.
 * [Own work — DXB211] Week 7 objects; grid collision with the player.
 * [Own work — DXB211] Patrol lists, spawn grace timer and enemy type data.
 * [AI-assisted — disclosed] pickSoundTarget() scoring; movement via Maze.bfsNextStep().
 */
const Enemies = {
  list: [],
  spawnGrace: 0,

  reset(configs, grace) {
    this.list = [];
    this.spawnGrace = grace || 0;
    for (const cfg of configs) {
      this.list.push({
        type: cfg.type || 'hunter',
        gx: cfg.start.gx,
        gy: cfg.start.gy,
        moveEvery: cfg.moveEvery || 20,
        moveTimer: cfg.startDelay || 0,
        patrol: cfg.patrol || null,
        patrolIdx: 0,
        flash: 0,
      });
    }
  },

  /**
   * Briefly delays all shadows after level transitions or future feedback events.
   * This keeps the method meaningful instead of leaving an unused empty hook.
   */
  stunAll(frames = 18) {
    for (const e of this.list) {
      e.moveTimer = min(e.moveTimer, -frames);
      e.flash = max(e.flash, 1);
    }
  },

  // [AI-assisted] Choose footstep/decoy sound by power, age, and maze distance
  pickSoundTarget(ex, ey) {
    const sounds = Sound.getActive();
    if (sounds.length === 0) return null;

    let best = null;
    let bestScore = -Infinity;
    for (const s of sounds) {
      const dist = Maze.bfsDistance(ex, ey, s.gx, s.gy);
      const t = 1 - s.age / s.maxAge;
      const score = (s.power * (0.4 + 0.6 * t)) / (1 + dist * 0.35);
      if (score > bestScore) {
        bestScore = score;
        best = s;
      }
    }
    return best;
  },

  patrolStep(e) {
    if (!e.patrol || e.patrol.length < 2) return;
    const target = e.patrol[e.patrolIdx];
    if (e.gx === target.gx && e.gy === target.gy) {
      e.patrolIdx = (e.patrolIdx + 1) % e.patrol.length;
    }
    const next = e.patrol[e.patrolIdx];
    const step = Maze.bfsNextStep(e.gx, e.gy, next.gx, next.gy);
    if (step) {
      e.gx += step.x;
      e.gy += step.y;
    }
  },

  update() {
    if (this.spawnGrace > 0) {
      this.spawnGrace--;
      return;
    }

    for (const e of this.list) {
      if (e.flash > 0) e.flash *= 0.9;
      e.moveTimer++;
      if (e.moveTimer < e.moveEvery) continue;
      e.moveTimer = 0;

      const sound = this.pickSoundTarget(e.gx, e.gy);
      if (sound) {
        const step = Maze.bfsNextStep(e.gx, e.gy, sound.gx, sound.gy);
        if (step) {
          e.gx += step.x;
          e.gy += step.y;
        }
      } else if (e.type === 'patrol') {
        this.patrolStep(e);
      }
      // hunter/stalker without sound: stay put
    }
  },

  checkCollision(px, py) {
    if (this.spawnGrace > 0) return false;
    for (const e of this.list) {
      if (e.gx === px && e.gy === py) return true;
    }
    return false;
  },

  draw(t) {
    const sz = ACTOR_SIZE();
    for (const e of this.list) {
      const p = Maze.gridToPixel(e.gx, e.gy);
      const spr = e.type === 'patrol' ? 'patrol' : e.type === 'stalker' ? 'stalker' : 'enemy';
      PX.drawActor(spr, p.x, p.y, sz);

      if (e.flash > 0.1) {
        noStroke();
        fill(255, 255, 255, e.flash * 120);
        rectMode(CENTER);
        rect(p.x, p.y, sz, sz);
        rectMode(CORNER);
      }
    }
  },
};
