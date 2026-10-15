/**
 * Echo Corridor: Sound-Stealth Maze — DXB211 Creative Coding Project
 * Student: Qinxi Yao
 * Student number: n12138401
 *
 * input.js — keyboard and Louie cabinet button mapping.
 * [Own work — DXB211] Arrow/WASD movement, keyPressed flags and one-frame button events.
 * [Own work — DXB211] Buttons 1/2/3 match the PLAY cabinet brief.
 * p5 callback functions keyPressed() and keyReleased() live in sketch.js.
 */
const Input = {
  _justBtn1: false,
  _justBtn2: false,
  _justBtn3: false,
  _anyKeyJust: false,

  init() {
    this._justBtn1 = false;
    this._justBtn2 = false;
    this._justBtn3 = false;
    this._anyKeyJust = false;
  },

  /** Called at end of each frame — clears one-frame “just pressed” flags */
  endFrame() {
    this._justBtn1 = false;
    this._justBtn2 = false;
    this._justBtn3 = false;
    this._anyKeyJust = false;
  },

  consumeButtons() {
    this._justBtn1 = false;
    this._justBtn2 = false;
    this._justBtn3 = false;
    this._anyKeyJust = false;
  },

  consumeAnyKey() {
    this._anyKeyJust = false;
  },

  anyKeyJust() {
    return this._anyKeyJust;
  },

  onKeyDown(k, code) {
    this._anyKeyJust = true;
    if (this._isBtn1(k, code)) this._justBtn1 = true;
    if (this._isBtn2(k, code)) this._justBtn2 = true;
    if (this._isBtn3(k, code)) this._justBtn3 = true;
  },

  _isBtn1(k, code) {
    return k === '1' || code === 49 || code === 97 || code === ENTER;
  },
  _isBtn2(k, code) {
    return k === '2' || code === 50 || code === 98;
  },
  _isBtn3(k, code) {
    return k === '3' || code === 51 || code === 99;
  },

  _isGameKey(code) {
    return (
      code === UP_ARROW || code === DOWN_ARROW || code === LEFT_ARROW || code === RIGHT_ARROW ||
      code === 87 || code === 65 || code === 83 || code === 68 ||
      code === 49 || code === 50 || code === 51 ||
      code === 97 || code === 98 || code === 99 ||
      code === ENTER || code === 32
    );
  },

  getMoveDir() {
    let x = 0;
    let y = 0;
    if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) x = -1;
    else if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) x = 1;
    if (keyIsDown(UP_ARROW) || keyIsDown(87)) y = -1;
    else if (keyIsDown(DOWN_ARROW) || keyIsDown(83)) y = 1;
    if (x !== 0 && y !== 0) x = 0;
    return { x, y };
  },

  btn1Just() { return this._justBtn1; },
  btn2Just() { return this._justBtn2; },
  btn3Just() { return this._justBtn3; },
};
