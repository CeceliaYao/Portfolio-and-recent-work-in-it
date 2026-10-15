/**
 * Echo Corridor: Sound-Stealth Maze — DXB211 Creative Coding Project
 * Student: Qinxi Yao
 * Student number: n12138401
 *
 * player.js — grid movement, pickup interaction, mute ability and player drawing.
 * [Own work — DXB211] Object state, wall checking, cooldown timers and sound emission rule.
 * [Own work — DXB211] Core stealth design: footsteps create risk unless mute is active.
 * [AI-assisted — disclosed] lerp() tile slide and easeInOutCubic() interpolation.
 */
const Player = {
  gx: 0,
  gy: 0,
  px: 0,
  py: 0,
  targetGx: 0,
  targetGy: 0,
  moveProgress: 1,
  moveCooldown: 0,
  moveDelay: 14,
  lastDir: { x: 1, y: 0 },
  silentTimer: 0,
  silentCooldown: 0,
  silentDuration: 120,
  silentCdMax: 300,
  hitFlash: 0,

  reset(gx, gy) {
    this.gx = gx;
    this.gy = gy;
    this.targetGx = gx;
    this.targetGy = gy;
    const p = Maze.gridToPixel(gx, gy);
    this.px = p.x;
    this.py = p.y;
    this.moveProgress = 1;
    this.moveCooldown = 0;
    this.silentTimer = 0;
    this.silentCooldown = 0;
    this.hitFlash = 0;
  },

  tryMove(dir) {
    if (this.moveProgress < 1 || this.moveCooldown > 0) return;
    const nx = this.gx + dir.x;
    const ny = this.gy + dir.y;
    if (Maze.isWall(nx, ny)) return;
    if (dir.x !== 0 || dir.y !== 0) this.lastDir = { x: dir.x, y: dir.y };
    this.targetGx = nx;
    this.targetGy = ny;
    this.moveProgress = 0;
    this.moveCooldown = this.moveDelay;
  },

  update() {
    if (this.moveCooldown > 0) this.moveCooldown--;
    if (this.silentTimer > 0) this.silentTimer--;
    if (this.silentCooldown > 0) this.silentCooldown--;
    if (this.hitFlash > 0) this.hitFlash *= 0.88;

    if (this.moveProgress < 1) {
      // [AI-assisted] Smooth pixel movement between grid cells (lerp + easing)
      this.moveProgress = min(this.moveProgress + 0.18, 1);
      const from = Maze.gridToPixel(this.gx, this.gy);
      const to = Maze.gridToPixel(this.targetGx, this.targetGy);
      const e = easeInOutCubic(this.moveProgress);
      this.px = lerp(from.x, to.x, e);
      this.py = lerp(from.y, to.y, e);
      if (this.moveProgress >= 1) {
        this.gx = this.targetGx;
        this.gy = this.targetGy;
        if (this.silentTimer <= 0) {
          Sound.emit(this.gx, this.gy, 2.5, 45, 'foot');
          Footprints.add(this.gx, this.gy);
        }
        Game.onPlayerMoved();
      }
    } else {
      const p = Maze.gridToPixel(this.gx, this.gy);
      this.px = p.x;
      this.py = p.y;
    }
  },

  activateSilent() {
    if (this.silentCooldown > 0) return false;
    this.silentTimer = this.silentDuration;
    this.silentCooldown = this.silentCdMax;
    return true;
  },

  atExit() {
    return this.gx === Maze.exitGx && this.gy === Maze.exitGy;
  },

  draw(t) {
    const sz = ACTOR_SIZE();
    PX.drawActor('player', this.px, this.py, sz);

    if (this.silentTimer > 0) {
      // [Own work] Week 8: sin() for pulsing mute indicator ring
      noFill();
      strokeCol(PX.palette.checkpoint, 90 + sin(t * 8) * 40);
      strokeWeight(1);
      rectMode(CENTER);
      rect(this.px, this.py, sz + 4, sz + 4);
      rectMode(CORNER);
      noStroke();
    }

    if (this.hitFlash > 0.1) {
      noStroke();
      fill(255, 80, 80, this.hitFlash * 160);
      rectMode(CENTER);
      rect(this.px, this.py, sz, sz);
      rectMode(CORNER);
    }
  },
};

// [AI-assisted — disclosed] Cubic ease-in-out (not taught in core weeks)
function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - pow(-2 * t + 2, 3) / 2;
}
