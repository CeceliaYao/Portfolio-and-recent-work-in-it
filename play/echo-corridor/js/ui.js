/**
 * Echo Corridor: Sound-Stealth Maze — DXB211 Creative Coding Project
 * Student: Qinxi Yao
 * Student number: n12138401
 *
 * ui.js — HUD, title screen, story panels, minimap and help overlay.
 * [Own work — DXB211] HUD information hierarchy, objective messages and title/story writing.
 * [Own work — DXB211] Public-player onboarding through simple icon labels and short prompts.
 * [AI-assisted — disclosed] Minimap scaling, wrapped help-panel layout and responsive spacing.
 */
const UI = {
  message: '',
  messageTimer: 0,
  caption: '',
  captionTimer: 0,
  objective: '',
  shake: 0,
  bottomBarH: 36,
  storyPanelHeight: 100,
  storyChapter: '',
  storyLines: [],
  storyLineIndex: 0,
  storyLineTimer: 0,
  storyAutoFrames: 120,
  storyOpen: false,
  storyKind: 'level',
  helpOpen: false,

  // [AI-assisted — disclosed] Help overlay: typed entries, height layout, sprite + text rows
  HELP_ENTRIES: [
    { type: 'title', text: 'ECHO CORRIDOR — HOW TO PLAY' },
    { type: 'gap' },
    { type: 'text', text: 'MOVE: Arrow keys or WASD' },
    { type: 'text', text: 'Steps make noise. Enemies hunt sound, not sight.' },
    { type: 'gap' },
    { type: 'text', text: '1 — Stand on F, press 1 to pick up memory shard' },
    { type: 'text', text: '2 — Press 2: sound decoy (2s fuse, lures shadows)' },
    { type: 'text', text: '3 — Press 3: mute (no footsteps for a while)' },
    { type: 'gap' },
    { type: 'section', text: 'ICONS' },
    { type: 'gap' },
    { type: 'icon', spr: 'player', text: 'YOU — your character' },
    { type: 'icon', spr: 'enemy', text: 'SHADOW — hunter, follows footsteps and decoys' },
    { type: 'icon', spr: 'patrol', text: 'PATROL — walks a set route, still hears noise' },
    { type: 'icon', spr: 'stalker', text: 'STALKER — fast shadow, still hears noise' },
    { type: 'icon', spr: 'fragment', text: 'F / SHARD — memory shard, press 1 on it' },
    { type: 'icon', spr: 'exitOpen', text: 'G green — exit open after all shards collected' },
    { type: 'icon', spr: 'exitLock', text: 'G dim — exit locked until all shards taken' },
    { type: 'icon', spr: 'decoy', text: 'DECOY — sound lure; orange ring = blast radius' },
    { type: 'icon', spr: 'footprint', text: 'Footprints — trail of where you walked, fades over time' },
  ],

  helpIconSize: 24,

  closeHelp() {
    this.helpOpen = false;
  },

  drawHelpIcon(spr, cx, cy) {
    push();
    noStroke();
    if (spr === 'footprint') {
      const c = PX.palette.footprint;
      fill(c[0], c[1], c[2]);
      rect(floor(cx - 2), floor(cy - 2), 4, 4);
    } else {
      PX.drawActorVisual(spr, cx, cy, this.helpIconSize);
    }
    pop();
  },

  measureHelpEntryHeight(entry, layout) {
    const { bodySize, titleSize, lineH, titleLineH, innerW } = layout;
    const iconGap = 12;
    const iconRowH = max(lineH, this.helpIconSize + 6);

    if (entry.type === 'gap') return lineH * 0.4;
    if (entry.type === 'title') {
      return wrapTextLines(entry.text, innerW, titleSize, true).length * titleLineH + 10;
    }
    if (entry.type === 'section') {
      return wrapTextLines(entry.text, innerW, bodySize, true).length * lineH;
    }
    if (entry.type === 'icon') {
      const textW = innerW - this.helpIconSize - iconGap;
      const rows = wrapTextLines(entry.text, textW, bodySize, false).length;
      return max(iconRowH, rows * lineH);
    }
    return wrapTextLines(entry.text, innerW, bodySize, false).length * lineH;
  },

  /** [AI-assisted — disclosed] Panel size from wrapped entry list */
  getHelpPanelLayout() {
    const margin = 32;
    const padX = 28;
    const padTop = 32;
    const padBottom = 40;
    const titleSize = 17;
    const bodySize = 13;
    const hintSize = 11;
    const lineH = bodySize * 1.42;
    const titleLineH = titleSize * 1.25;
    const pw = min(580, width - margin * 2);
    const innerW = pw - padX * 2;
    const cx = width / 2;

    let contentH = padTop;
    for (const entry of this.HELP_ENTRIES) {
      contentH += this.measureHelpEntryHeight(entry, {
        bodySize, titleSize, lineH, titleLineH, innerW,
      });
    }
    contentH += padBottom;

    const maxPH = max(160, height - margin * 2);
    const ph = min(floor(contentH), maxPH);
    const px = floor((width - pw) / 2);
    const py = floor((height - ph) / 2);

    return {
      px, py, pw, ph, padX, padTop, padBottom,
      titleSize, bodySize, hintSize, lineH, titleLineH, innerW, cx,
    };
  },

  hitHelpPanel(mx, my) {
    const { px, py, pw, ph } = this.getHelpPanelLayout();
    return mx >= px && mx < px + pw && my >= py && my < py + ph;
  },

  /** Close help on canvas click (help button uses its own DOM mousePressed) */
  handleHelpClick() {
    if (this.helpOpen) {
      this.helpOpen = false;
      return true;
    }
    return false;
  },

  drawHelpPanel() {
    if (!this.helpOpen) return;

    const layout = this.getHelpPanelLayout();
    const {
      px, py, pw, ph, padX, padTop, padBottom,
      titleSize, bodySize, hintSize, lineH, titleLineH, innerW, cx,
    } = layout;
    const p = PX.palette;

    push();
    resetMatrix();
    colorMode(RGB, 255);
    noStroke();
    applyPixelFont(false);

    fill(0, 0, 0, 160);
    rect(0, 0, width, height);

    fill(18, 22, 34, 245);
    strokeCol(p.wallHi, 100);
    strokeWeight(1);
    rect(px, py, pw, ph);
    noStroke();

    const iconGap = 12;
    const iconRowH = max(lineH, this.helpIconSize + 6);
    const iconCx = px + padX + this.helpIconSize / 2 + 2;
    const textX = px + padX + this.helpIconSize + iconGap;

    let y = py + padTop;
    for (const entry of this.HELP_ENTRIES) {
      if (entry.type === 'gap') {
        y += lineH * 0.4;
        continue;
      }

      if (entry.type === 'title') {
        const wrapped = wrapTextLines(entry.text, innerW, titleSize, true);
        pixelTextBlockCentered(wrapped, cx, y, titleSize, p.storyCta, titleLineH, true);
        y += wrapped.length * titleLineH + 10;
        continue;
      }

      if (entry.type === 'section') {
        const wrapped = wrapTextLines(entry.text, innerW, bodySize, true);
        pixelTextBlockCentered(wrapped, cx, y, bodySize, p.storyCta, lineH, true);
        y += wrapped.length * lineH;
        continue;
      }

      if (entry.type === 'icon') {
        const textW = innerW - this.helpIconSize - iconGap;
        const wrapped = wrapTextLines(entry.text, textW, bodySize, false);
        const rowH = max(iconRowH, wrapped.length * lineH);
        this.drawHelpIcon(entry.spr, iconCx, y + rowH / 2);
        let ty = y;
        for (const wl of wrapped) {
          pixelText(wl, textX, ty, bodySize, p.storyBody, LEFT, TOP);
          ty += lineH;
        }
        y += rowH;
        continue;
      }

      const wrapped = wrapTextLines(entry.text, innerW, bodySize, false);
      pixelTextBlockCentered(wrapped, cx, y, bodySize, p.storyBody, lineH);
      y += wrapped.length * lineH;
    }
    pixelText('CLICK OR PRESS ANY KEY', cx, py + ph - padBottom + 10, hintSize, p.storyHint, CENTER, TOP);
    pop();
  },

  /** [AI-assisted — disclosed] resetMatrix isolation so maze translate does not shift overlay */
  drawHelpPanelOverlay() {
    if (!this.helpOpen) return;
    push();
    resetMatrix();
    this.drawHelpPanel();
    pop();
  },

  setMessage(msg, frames) {
    this.message = msg;
    this.messageTimer = frames || 90;
  },

  showCaption(text, frames) {
    this.caption = text || '';
    this.captionTimer = frames || 120;
  },

  setObjective(text) {
    this.objective = text;
  },

  openLevelStory(chapter, lines, kind) {
    this.storyKind = kind || 'level';
    this.storyChapter = chapter || '';
    this.storyLines = Array.isArray(lines) ? lines : [String(lines)];
    this.storyLineIndex = 0;
    this.storyLineTimer = 0;
    this.storyOpen = true;
    if (this.storyKind === 'level') {
      this.storyPanelHeight = this.calcStoryPanelHeight(this.storyLines);
    }
  },

  // [AI-assisted — disclosed] Story zone height from wrapped line count
  calcStoryPanelHeight(lines) {
    const padX = 14;
    const maxW = max(180, (Maze.mapPixelW || Maze.cols * TILE) - padX * 2);
    const size = 13;
    const lineH = size * 1.38;
    let maxRows = 1;
    for (const line of lines) {
      maxRows = max(maxRows, wrapTextLines(line, maxW, size).length);
    }
    const needed = floor(34 + maxRows * lineH + 22);
    const avail = Maze.cols ? Maze.storyZoneHeight() : needed;
    return min(needed, avail);
  },

  closeLevelStory() {
    this.storyOpen = false;
    this.storyKind = 'level';
    this.storyLines = [];
    this.storyChapter = '';
    this.storyLineIndex = 0;
    this.storyLineTimer = 0;
  },

  getCurrentStoryLine() {
    return this.storyLines[this.storyLineIndex] || '';
  },

  tickStoryIntro() {
    if (!this.storyOpen) return;
    this.storyLineTimer++;
  },

  shouldAutoAdvanceStory() {
    return this.storyLineTimer >= this.storyAutoFrames;
  },

  /** @returns {boolean} true when all lines done */
  advanceStory() {
    this.storyLineIndex++;
    this.storyLineTimer = 0;
    return this.storyLineIndex >= this.storyLines.length;
  },

  update() {
    if (this.messageTimer > 0) this.messageTimer--;
    if (this.captionTimer > 0) this.captionTimer--;
    if (this.shake > 0.5) this.shake *= 0.88;
    else this.shake = 0;
  },

  drawStoryBelowMap() {
    if (!this.storyOpen || this.storyKind !== 'level' || !this.storyLines.length) return;
    colorMode(RGB, 255);

    const p = PX.palette;
    const cx = Maze.offsetX + Maze.mapPixelW / 2;
    const maxW = Maze.mapPixelW - 24;
    const zoneTop = Maze.storyPanelTop;
    const bodySize = 13;
    const lineH = bodySize * 1.4;
    const wrapped = wrapTextLines(this.getCurrentStoryLine(), maxW, bodySize);

    pixelText(this.storyChapter, cx, zoneTop + 6, 9, p.storyHint, CENTER, TOP, true);
    pixelTextBlockCentered(wrapped, cx, zoneTop + 22, bodySize, p.storyBody, lineH);

    const hint = `${this.storyLineIndex + 1}/${this.storyLines.length}  ·  KEY OR WAIT`;
    pixelText(hint, cx, zoneTop + 22 + wrapped.length * lineH + 8, 8, p.storyHint, CENTER, TOP);
  },

  drawTitle(prologueText, prologueCta, t) {
    colorMode(RGB, 255);
    PX.drawBg();

    const p = PX.palette;
    const cx = width / 2;
    const maxW = min(480, width - 120);
    const bodySize = 12;
    const lineH = bodySize * 1.38;
    const wrapped = wrapTextLines(prologueText || '', maxW, bodySize);
    const bodyH = wrapped.length * lineH;
    const cta = prologueCta || '... go explore.';

    // [AI-assisted — disclosed] Vertical stack height + constrain for title screen
    const titleH = 68;
    const showcaseH = 64;
    const tailH = 12 + 11 + 20 + 10;
    const mainH = titleH + showcaseH + bodyH + tailH;
    const footerReserve = 44;
    let y = floor((height - mainH - footerReserve) * 0.54 + 28);
    y = constrain(y, 80, height - mainH - 72);

    y = PX.drawGameTitle(cx, y, t);
    y = PX.drawTitleShowcase(cx, y, t);

    pixelTextBlockCentered(wrapped, cx, y, bodySize, p.storyBody, lineH);
    y += bodyH + 12;
    pixelText(cta, cx, y, 11, p.storyCta, CENTER, TOP);
    y += 20;
    pixelText('PRESS ANY KEY', cx, y, 10, p.storyHint, CENTER, TOP);

    pixelText('1:PICKUP  2:DECOY  3:MUTE', cx, height - 32, 8, p.uiDim, CENTER, TOP);
  },

  drawHUD(opts) {
    colorMode(RGB, 255);
    push();
    fill(18, 20, 28, 200);
    noStroke();
    rect(0, 0, width, 44);

    if (!opts.minimal) {
      // [AI-assisted — disclosed] Right HUD: reserve help button, measure widths, skill chips
      const helpReserve = floor(width * 0.052) + 18;
      const hudRight = width - helpReserve;
      const sz = 9;
      const timeStr = `${opts.time}s`;
      pixelText(timeStr, hudRight, 20, sz, PX.palette.uiDim, RIGHT, CENTER);
      const fStr = `F ${opts.fragments}`;
      const fW = measureTextWidth(fStr, sz);
      const fRight = hudRight - measureTextWidth(timeStr, sz) - 10;
      pixelText(fStr, fRight, 20, sz, opts.exitOpen ? PX.palette.exit : PX.palette.uiDim, RIGHT, CENTER);

      const skillSz = 8;
      const icons = [
        { label: 'GET', key: '1', col: PX.palette.fragment },
        { label: 'DECOY', key: '2', col: PX.palette.blast },
        { label: 'MUTE', key: '3', col: PX.palette.checkpoint },
      ];
      const gap = 3;
      const widths = icons.map((ic) => max(40, 11 + measureTextWidth(ic.label, skillSz) + 5));
      const totalW = widths.reduce((a, b) => a + b, 0) + gap * (icons.length - 1);
      let ix = fRight - fW - 10 - totalW;
      for (let i = 0; i < icons.length; i++) {
        UI.drawSkillIcon(ix, 12, icons[i], widths[i], skillSz);
        ix += widths[i] + gap;
      }
    }

    pop();
  },

  drawBottomBar() {
    let barText = '';
    if (this.captionTimer > 0 && this.caption) barText = this.caption;
    else if (this.messageTimer > 0 && this.message) barText = this.message;
    else if (this.objective) barText = this.objective;
    if (!barText) return;

    colorMode(RGB, 255);
    const h = this.bottomBarH;
    const y = height - h;
    push();
    fill(16, 18, 26, 220);
    noStroke();
    rect(0, y, width, h);
    strokeCol(PX.palette.wallHi, 100);
    strokeWeight(1);
    line(0, y, width, y);
    noStroke();
    pixelText(barText, width / 2, y + 10, 13, PX.palette.ui, CENTER, TOP);
    pop();
  },

  // [AI-assisted — disclosed] Small map in corner (scaled rects)
  drawMinimap() {
    if (!Maze.cols) return;
    const mw = 96;
    const mh = 68;
    const mx = width - mw - 8;
    const my = height - mh - this.bottomBarH - 8;
    const scale = min(mw / Maze.cols, mh / Maze.rowCount);

    push();
    fill(4, 6, 14, 200);
    strokeCol(PX.palette.wallHi, 80);
    strokeWeight(1);
    rect(mx - 2, my - 2, mw + 4, mh + 4);

    for (let gy = 0; gy < Maze.rowCount; gy++) {
      for (let gx = 0; gx < Maze.cols; gx++) {
        const c = Maze.grid[gy][gx];
        const x = mx + gx * scale;
        const y = my + gy * scale;
        if (c === 1) fill(PX.palette.wallDark[0], PX.palette.wallDark[1], PX.palette.wallDark[2]);
        else fill(PX.palette.floor[0], PX.palette.floor[1], PX.palette.floor[2]);
        noStroke();
        rect(x, y, max(1, scale), max(1, scale));
      }
    }

    for (const f of Maze.fragments) {
      if (f.taken) continue;
      fill(PX.palette.fragment[0], PX.palette.fragment[1], PX.palette.fragment[2]);
      rect(mx + f.gx * scale, my + f.gy * scale, scale, scale);
    }

    const ex = Maze.canReachExit() ? PX.palette.exit : PX.palette.exitLock;
    fill(ex[0], ex[1], ex[2]);
    rect(mx + Maze.exitGx * scale, my + Maze.exitGy * scale, scale, scale);

    fill(PX.palette.player[0], PX.palette.player[1], PX.palette.player[2]);
    rect(mx + Player.gx * scale, my + Player.gy * scale, scale, scale);

    for (const e of Enemies.list) {
      const ec = e.type === 'patrol' ? PX.palette.enemyPatrol
        : e.type === 'stalker' ? PX.palette.enemyStalk : PX.palette.enemy;
      fill(ec[0], ec[1], ec[2]);
      rect(mx + e.gx * scale, my + e.gy * scale, scale, scale);
    }
    pop();
  },

  // [AI-assisted — disclosed] Compact skill label chip (width from measureTextWidth)
  drawSkillIcon(x, y, ic, boxW, size) {
    const sz = size ?? 8;
    const h = 18;
    const w = boxW ?? max(40, 11 + measureTextWidth(ic.label, sz) + 5);
    push();
    fill(12, 14, 28, 230);
    noStroke();
    rect(x, y, w, h);
    pixelText(ic.key, x + 3, y + 3, sz, ic.col, LEFT, TOP);
    pixelText(ic.label, x + 11, y + 3, sz, PX.palette.uiDim, LEFT, TOP);
    pop();
    return w;
  },

  drawGameOver() {
    colorMode(RGB, 255);
    push();
    fill(0, 0, 0, 175);
    rect(0, 0, width, height - this.bottomBarH);
    pixelText('CAUGHT', width / 2, height / 2 - 20, 18, PX.palette.enemy, CENTER, CENTER, true);
    pixelText('RESTARTING...', width / 2, height / 2 + 8, 13, PX.palette.ui, CENTER, CENTER);
    pop();
  },

  drawEnding(headline, bodyText) {
    colorMode(RGB, 255);
    PX.drawBg();

    const p = PX.palette;
    const cx = width / 2;
    const maxW = min(520, width - 100);
    const headlineSize = 16;
    const bodySize = 12;
    const lineH = bodySize * 1.42;
    const wrapped = wrapTextLines(bodyText || '', maxW, bodySize);
    const bodyH = wrapped.length * lineH;

    let y = floor((height - headlineSize - bodyH - 50) / 2);
    y = max(56, y);

    pixelText(headline || 'ALL MEMORY SHARDS COLLECTED', cx, y, headlineSize, p.exit, CENTER, TOP, true);
    y += headlineSize + 20;
    pixelTextBlockCentered(wrapped, cx, y, bodySize, p.storyBody, lineH);
    y += bodyH + 24;
    pixelText('PRESS ANY KEY', cx, y, 10, p.storyHint, CENTER, TOP);
  },

  drawLevelWin() {
    colorMode(RGB, 255);
    push();
    fill(255, 209, 102, 18);
    rect(0, 0, width, height - this.bottomBarH);
    pixelText('LEVEL CLEAR', width / 2, height / 2, 16, PX.palette.exit, CENTER, CENTER, true);
    pop();
  },

  drawGraceTimer(frames) {
    const sec = ceil(frames / 60);
    pixelText(`ENEMIES WAKE IN ${sec}s`, width / 2, 50, 12, PX.palette.checkpoint, CENTER, TOP);
  },

  drawTutorialHint(phase) {
    const hints = [
      'MOVE = FOOTSTEPS (ENEMIES HEAR YOU)',
      'STAND ON F, PRESS 1 TO PICK UP',
      'PRESS 2 - SOUND DECOY (2s FUSE)',
      'PRESS 3 - MUTE (NO FOOTSTEPS)',
      'COLLECT ALL F, THEN EXIT G OPENS',
    ];
    const idx = min(floor(phase / 120), hints.length - 1);
    if (this.captionTimer <= 0) this.showCaption(hints[idx], 110);
  },
};
