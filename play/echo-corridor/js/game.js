/**
 * Echo Corridor: Sound-Stealth Maze — DXB211 Creative Coding Project
 * Student: Qinxi Yao
 * Student number: n12138401
 *
 * game.js — state machine, levels, story, main loop logic.
 * [Own work — DXB211] Week 10 state modelling: TITLE → INTRO → PLAY → WIN/LOSE.
 * [Own work — DXB211] Story text, level progression, interaction rules and controls.
 * [AI-assisted — disclosed] Large update/draw switch structure and tutorial timing checks.
 */
const STATE = {
  TITLE: 'title',
  LEVEL_INTRO: 'level_intro',
  TUTORIAL: 'tutorial',
  PLAY: 'play',
  LEVEL_WIN: 'level_win',
  GAMEOVER: 'gameover',
  ALL_WIN: 'all_win',
};

/** Opening backstory — full paragraph, centered, press any key to continue */
const PROLOGUE =
  'The city sealed this corridor when people forgot how to listen. '
  + 'Now it lives only on echoes — footsteps, lies, and shards of broken memory. '
  + 'You are not a rescuer. You are what the maze could not swallow. '
  + 'The shadows cannot see you. They hunt every sound you make. '
  + 'Walk carefully. Trick the dark — or become another echo.';
const PROLOGUE_CTA = '... go explore.';

/** Shown when the player finishes the final level — no score, story only */
const EPILOGUE_HEADLINE = 'ALL MEMORY SHARDS COLLECTED';
const EPILOGUE =
  'The corridor exhales. Every fragment clicks into place — not treasure, but stolen seconds: '
  + 'laughter behind a door, rain on a bus window, a promise someone meant to keep. '
  + 'The shadows stop hunting. They were never beasts, only the city listening too hard. '
  + 'The exit is not a gate but a choice: carry these memories back into the light, '
  + 'or leave them here where no one can take them again. '
  + 'You walk out. The echo stays behind, softer now — keeping watch for the next soul '
  + 'who learns to move without being heard.';

const STORY = [
  {
    chapter: 'CHAPTER I',
    intro: [
      'You wake in a corridor with no light — only sound.',
      'Each step you take becomes a ripple the walls remember.',
      'Something in the dark listens. It does not see you. It hears you.',
      'Find the memory shards. Find the exit. Do not let the echo catch you.',
    ],
    fragment: ['A memory shard glows.', 'The past whispers in the walls.'],
    decoy: ['Noise thrown elsewhere.', 'Shadows turn toward the false echo.'],
    silent: ['You hold your breath.', 'The corridor forgets you.'],
    win: ['All shards in place. The exit wakes.', 'You leave with your memories whole.'],
    death: ['Shadows close in.', 'The corridor starts again.'],
  },
  {
    chapter: 'CHAPTER II',
    intro: [
      'The hall branches like a wound that never heals.',
      'Footsteps pile into layers — yours, and something mimicking yours.',
      'You learn a cruel rule: noise is bait. Silence is cover.',
      'Throw your voice where your body cannot go.',
    ],
    fragment: ['Another piece of memory returns.', 'The exit feels closer.'],
    decoy: ['The decoy detonates far away.', 'Hunters chase the wrong noise.'],
    silent: ['Mute lets you pass like a ghost.'],
    win: ['The door opens.', 'The echo bids farewell.'],
    death: ['Sound betrayed you.', 'Try a different rhythm.'],
  },
  {
    chapter: 'CHAPTER III',
    intro: [
      'Deeper now. The air tastes of old copper and rain.',
      'Patrol routes cross hunter trails — two kinds of hunger.',
      'The exit will not open until every shard is whole again.',
      'Complete the memory. Or become part of the corridor forever.',
    ],
    fragment: ['The last shard flickers.', 'The far end sharpens.'],
    decoy: ['Two seconds — enough to slip away.'],
    silent: ['Silence is your only armor.'],
    win: ['You leave the deep hall whole.', 'Light says: pass.'],
    death: ['Echo tears you apart.', 'Try again — the hall resets.'],
  },
];

const Game = {
  state: STATE.TITLE,
  time: 0,
  levelIndex: 0,
  tutorialPhase: 0,
  winTimer: 0,
  goTimer: 0,
  firstPlay: true,
  pendingTutorial: false,
  levelTime: 0,
  init() {
    this.state = STATE.TITLE;
    this.time = 0;
    this.levelIndex = 0;
  },

  collectFragment() {
    const s = STORY[this.levelIndex] || STORY[0];
    UI.showCaption(s.fragment[0], 150);
  },

  startLevel(index, opts = {}) {
    this.levelIndex = index;
    const lvl = LEVELS[index];
    Maze.loadLevel(index);
    Sound.reset();
    Footprints.reset();
    Decoy.reset();
    Player.reset(Maze.startGx, Maze.startGy);
    Enemies.reset(lvl.enemies, lvl.grace);
    this.levelTime = 0;
    this.winTimer = 0;

    if (!opts.skipIntro) {
      this.state = STATE.LEVEL_INTRO;
      const s = STORY[this.levelIndex] || STORY[0];
      UI.openLevelStory(s.chapter, s.intro, 'level');
      Input.consumeButtons();
      return;
    }

    this.beginPlay();
  },

  beginPlay() {
    UI.closeLevelStory();
    const lvl = LEVELS[this.levelIndex];
    if (this.pendingTutorial) {
      this.state = STATE.TUTORIAL;
      this.pendingTutorial = false;
      this.tutorialPhase = 0;
    } else {
      this.state = STATE.PLAY;
    }
    UI.setMessage(lvl.hint, 200);
    UI.setObjective(this.getObjectiveText());
    UI.showCaption('PRESS 1 ON F TO PICK UP SHARDS', 140);
    Input.consumeButtons();
  },

  getObjectiveText() {
    const left = Maze.fragmentsLeft();
    const total = Maze.totalFragments();
    const taken = Maze.fragmentsTaken();
    if (left > 0) return `SHARDS ${taken}/${total} - COLLECT ALL TO OPEN EXIT`;
    return 'EXIT OPEN - GO TO G';
  },

  startTutorial() {
    this.pendingTutorial = true;
    this.startLevel(0);
  },

  startFromTitle() {
    Input.consumeButtons();
    Input.consumeAnyKey();
    if (this.firstPlay) {
      this.firstPlay = false;
      this.startTutorial();
    } else {
      this.startLevel(0);
    }
  },

  onPlayerMoved() {
    UI.setObjective(this.getObjectiveText());
  },

  handlePlayInput() {
    const dir = Input.getMoveDir();
    if (dir.x !== 0 || dir.y !== 0) Player.tryMove(dir);

    if (Input.btn1Just()) {
      const msg = Maze.tryPickupFragment(Player.gx, Player.gy);
      if (msg) {
        UI.setMessage(msg, 80);
        UI.setObjective(this.getObjectiveText());
      } else if (Maze.isFragmentHere(Player.gx, Player.gy)) {
        UI.setMessage('STAND ON F, PRESS 1', 50);
      } else {
        UI.setMessage('NO SHARD HERE', 45);
      }
    }

    if (Input.btn2Just()) {
      const d = Input.getMoveDir();
      const throwDir = (d.x !== 0 || d.y !== 0) ? d : Player.lastDir;
      if (Decoy.throwForward(Player.gx, Player.gy, throwDir)) {
        const s = STORY[this.levelIndex] || STORY[0];
        UI.setMessage('DECOY OUT - EXPLODES IN 2s', 70);
        UI.showCaption(s.decoy[0], 90);
      } else {
        UI.setMessage('DECOY BUSY OR BLOCKED', 50);
      }
    }

    if (Input.btn3Just()) {
      if (Player.activateSilent()) {
        const s = STORY[this.levelIndex] || STORY[0];
        UI.setMessage('MUTE - NO FOOTSTEPS', 60);
        UI.showCaption(s.silent[0], 90);
      } else {
        UI.setMessage('MUTE ON COOLDOWN', 50);
      }
    }
  },

  tryWin() {
    if (!Player.atExit()) return false;
    if (!Maze.canReachExit()) {
      UI.setMessage(`NEED ${Maze.fragmentsLeft()} MORE SHARD(S)`, 90);
      return false;
    }
    this.state = STATE.LEVEL_WIN;
    this.winTimer = 0;
    UI.setMessage('LEVEL CLEAR', 120);

    const s = STORY[this.levelIndex] || STORY[0];
    UI.showCaption(s.win[0], 180);
    return true;
  },

  respawn() {
    this.startLevel(this.levelIndex);
  },

  update() {
    this.time += 0.016;
    UI.update();

    // [Own work] Week 10: one active state per frame (state machine)
    switch (this.state) {
      case STATE.TITLE:
        if (!UI.helpOpen && Input.anyKeyJust()) this.startFromTitle();
        break;

      case STATE.LEVEL_INTRO:
        UI.tickStoryIntro();
        if (!UI.helpOpen && (Input.anyKeyJust() || UI.shouldAutoAdvanceStory())) {
          Input.consumeAnyKey();
          if (UI.advanceStory()) this.beginPlay();
        }
        break;

      case STATE.TUTORIAL:
      case STATE.PLAY:
        this.levelTime++;
        if (!UI.helpOpen) this.handlePlayInput();
        Player.update();
        Enemies.update();

        if (this.state === STATE.TUTORIAL) this.tutorialPhase++;

        if (Enemies.checkCollision(Player.gx, Player.gy)) {
          Player.hitFlash = 1;
          UI.shake = 10;
          this.state = STATE.GAMEOVER;
          this.goTimer = 0;
          const s = STORY[this.levelIndex] || STORY[0];
          UI.showCaption(s.death[0], 160);
        } else {
          this.tryWin();
        }
        break;

      case STATE.LEVEL_WIN:
        this.winTimer++;
        if (this.winTimer > 120) {
          if (this.levelIndex < LEVELS.length - 1) {
            this.startLevel(this.levelIndex + 1);
          } else {
            this.state = STATE.ALL_WIN;
            this.winTimer = 0;
          }
        }
        break;

      case STATE.ALL_WIN:
        if (Input.anyKeyJust()) {
          Input.consumeAnyKey();
          this.state = STATE.TITLE;
        }
        break;

      case STATE.GAMEOVER:
        this.goTimer++;
        if (this.goTimer > 90) {
          this.respawn();
        }
        break;
    }
  },

  draw(t) {
    colorMode(RGB, 255);

    if (this.state === STATE.TITLE) {
      UI.drawTitle(PROLOGUE, PROLOGUE_CTA, t);
      UI.drawHelpPanelOverlay();
      return;
    }

    if (this.state === STATE.ALL_WIN) {
      UI.closeHelp();
      UI.drawEnding(EPILOGUE_HEADLINE, EPILOGUE);
      return;
    }

    drawBgGradient();

    push();
    if (UI.shake > 0) UI.shake = screenShake(UI.shake, 0.88);

    Maze.draw(t);
    Sound.draw(t);
    Decoy.draw(t);
    Enemies.draw(t);
    Player.draw(t);

    pop();

    const lvl = LEVELS[this.levelIndex];
    const inIntro = this.state === STATE.LEVEL_INTRO;

    UI.drawHUD({
      levelName: lvl.name,
      fragments: `${Maze.fragmentsTaken()}/${Maze.totalFragments()}`,
      silentCd: Player.silentCooldown,
      decoyReady: Decoy.canThrow(),
      objective: inIntro ? '' : (UI.objective || this.getObjectiveText()),
      exitOpen: Maze.canReachExit(),
      time: floor(this.levelTime / 60),
      minimal: inIntro,
    });

    if (inIntro) {
      UI.drawStoryBelowMap();
    } else {
      UI.drawMinimap();
      if (Enemies.spawnGrace > 0) UI.drawGraceTimer(Enemies.spawnGrace);
      if (this.state === STATE.TUTORIAL) UI.drawTutorialHint(this.tutorialPhase);
      if (this.state === STATE.LEVEL_WIN) UI.drawLevelWin();
      if (this.state === STATE.GAMEOVER) UI.drawGameOver();
      UI.drawBottomBar();
    }

    UI.drawHelpPanelOverlay();
  },
};
