/**
 * Echo Corridor: Sound-Stealth Maze — DXB211 Creative Coding Project
 * Student: Qinxi Yao
 * Student number: n12138401
 *
 * visuals.js — small drawing helpers and atmospheric polish.
 * [Own work — DXB211] RGB stroke helper and dark background integration.
 * [AI-assisted — disclosed] screenShake() helper pattern using random() translation.
 */
function strokeCol(c, a) {
  if (a !== undefined) stroke(c[0], c[1], c[2], a);
  else stroke(c[0], c[1], c[2]);
}

function visualsInit() {
  PX.init();
}

function drawBgGradient() {
  PX.drawBg();
}

function screenShake(intensity, decay) {
  if (intensity > 0.5) {
    const s = intensity;
    translate(floor(random(-s, s)), floor(random(-s, s)));
    return intensity * decay;
  }
  return 0;
}
