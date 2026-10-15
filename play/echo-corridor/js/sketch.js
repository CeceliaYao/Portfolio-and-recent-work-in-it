/**
 * Echo Corridor: Sound-Stealth Maze
 * DXB211 Creative Coding Project — Assessment 2
 * Student: Qinxi Yao
 * Student number: n12138401
 *
 * sketch.js — p5 entry point, canvas setup, font loading and global callbacks.
 * [Own work — DXB211] createCanvas(), draw loop, Game.init() wiring, keyboard callbacks.
 * [Own work — DXB211] Maximum canvas sizing to meet the 1280 × 720 submission limit.
 * [AI-assisted — disclosed] Dual Pixelify Sans font loading; DOM help button layout;
 * windowResized() guard logic; help open/close input handling.
 */

const PROJECT_TITLE = 'Echo Corridor: Sound-Stealth Maze';
const PROJECT_AUTHOR = 'Qinxi Yao';
const MAX_CANVAS_W = 1280;
const MAX_CANVAS_H = 720;
const MIN_CANVAS_W = 360;
const MIN_CANVAS_H = 360;

let gameFont;
let gameFontBold;
let helpButton;

function preload() {
  // Fonts are stored locally so the submitted ZIP keeps the intended pixel style.
  gameFont = loadFont('js/static/PixelifySans-Regular.ttf');
  gameFontBold = loadFont('js/static/PixelifySans-Bold.ttf');
}

/**
 * Keep the sketch within the task sheet limit while still fitting smaller previews.
 * p5 Web Editor previews can be narrow, while fullscreen browsers may exceed 1280 × 720.
 */
function getCanvasSize() {
  const w = constrain(windowWidth, MIN_CANVAS_W, MAX_CANVAS_W);
  const h = constrain(windowHeight, MIN_CANVAS_H, MAX_CANVAS_H);
  return { w: floor(w), h: floor(h) };
}

function setup() {
  if (document && document.title) document.title = PROJECT_TITLE + ' — Louie Cabinet';
  const size = getCanvasSize();
  createCanvas(size.w, size.h);

  pixelDensity(1);
  frameRate(60);
  noSmooth();
  if (gameFont) textFont(gameFont);

  helpButton = createButton('help');
  helpButton.attribute('aria-label', 'Open Echo Corridor help panel');
  helpButton.style('z-index', '2');
  helpButton.style('background', '#141824');
  helpButton.style('color', '#c8d4e8');
  helpButton.style('border', '1px solid #4a5a78');
  helpButton.style('font-family', '"Pixelify Sans", monospace');
  helpButton.style('font-weight', '700');
  helpButton.style('font-size', '12px');
  helpButton.style('cursor', 'pointer');
  helpButton.mousePressed((e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    toggleHelp();
    return false;
  });
  layoutHelpButton();

  Input.init();
  visualsInit();
  Game.init();
}

function layoutHelpButton() {
  if (!helpButton) return;
  const pad = 10;
  const btnW = constrain(floor(width * 0.06), 44, 72);
  const btnH = constrain(floor(height * 0.04), 24, 34);
  helpButton.size(btnW, btnH);
  helpButton.position(width - pad - btnW, pad);
}

function windowResized() {
  const size = getCanvasSize();
  resizeCanvas(size.w, size.h);
  layoutHelpButton();
  if (Maze.cols) Maze.layout();
}

function toggleHelp() {
  if (Game.state === STATE.ALL_WIN) return;
  UI.helpOpen = !UI.helpOpen;
}

function draw() {
  const t = millis() * 0.001;

  Sound.update();
  Footprints.update();
  Decoy.update();
  Game.update();
  Game.draw(t);

  if (Game.state === STATE.ALL_WIN) {
    helpButton.hide();
    UI.closeHelp();
  } else {
    helpButton.show();
  }

  Input.endFrame();
}

function mousePressed() {
  if (Game.state === STATE.ALL_WIN) return;
  if (UI.helpOpen) UI.closeHelp();
}

function keyPressed() {
  Input.onKeyDown(key, keyCode);
  if (Game.state !== STATE.ALL_WIN) {
    if (UI.helpOpen) {
      UI.closeHelp();
      Input.consumeAnyKey();
      Input.consumeButtons();
      return false;
    }
    if (key === 'h' || key === 'H') {
      UI.helpOpen = true;
    }
  }
  if (Input._isGameKey(keyCode)) return false;
}

function keyReleased() {
  if (Input._isGameKey(keyCode)) return false;
}
