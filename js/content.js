/* Everything the site says lives here. */
(function () {
'use strict';

const PROFILE = {
  name: 'Qinxi (Cecelia) Yao',
  short: 'Cecelia Yao',
  role: 'Interactive & visual designer',
  place: 'Brisbane, Australia',
  study: 'Interactive and Visual Design, QUT',
  photo: 'assets/me.jpg',
  links: [
    { label: 'Behance', href: 'https://www.behance.net/qinxiyao' },
    { label: 'GitHub', href: 'https://github.com/CeceliaYao' }
  ],
  email: '' // add an address here and a mail link appears in Contact
};

/* What each thing in the room says when you click it.
   `photo` names cut-outs in assets/cutouts (the real objects). */
const STORIES = {
  computer: { title: 'My desk', lines: ['Everything I have made lives in here.'], open: 'os' },
  trail: { title: 'Hiking', photo: ['backpack', 'visor', 'poles'],
    lines: ['I love hiking. My visor, my daypack and my trekking poles come on every walk.', 'A lot of my ideas show up somewhere on the trail.'] },
  beads: { title: 'Made by hand', photo: ['beads'],
    lines: ['I make some of my fridge magnets myself.', 'This spritz is fuse beads, placed one pixel at a time.'] },
  jade: { title: 'Hongshan jade dragon', photo: ['jade'],
    lines: ['A Hongshan jade dragon resting in an ancient Chinese wine cup.', 'A small piece of Chinese culture that I keep close.'] },
  art: { title: 'Picasso, next to the bottles', photo: ['picasso'],
    lines: ['Weeping Woman, on the fridge right beside my bottles.', 'Art and a good drink are both hobbies of mine. They give me ideas, and then help me slow down and focus on the design.'] },
  bar: { title: 'Whisky and gin', photo: ['whisky', 'gin'],
    lines: ['Lagavulin 16, Woodford Reserve Double Oaked and an Australian dry gin.', 'Tasting is a hobby. It gives me inspiration and helps me settle into focus when I design.'] },
  scent: { title: 'Two scents', photo: ['perfume'],
    lines: ['松月茶馆, a teahouse of pine and moonlight, and Hermès Rose Ikebana.'] },
  play: { title: 'Games', photo: ['ps5'],
    lines: ['Games are where I first learned that a room can tell a story without a single line of text.'] },
  plants: { title: 'Something green', photo: ['catpot', 'succulent'],
    lines: ['I bought these two because I like having something green to look at.'] },
  water: { title: 'Ten litres at a time', photo: ['water'],
    lines: ['Brisbane summers.'] },
  plush: { title: 'Roommates',
    lines: ['A Hello Kitty by the window and a penguin in a knitted beanie on the shelf.'] },
  photos: { title: 'Photographs', lines: ['Things I have seen around Brisbane and the coast.'], open: 'photos' },
  view: { title: 'Out the window',
    lines: ['The city first, then the hills.'], toggle: 'night' },
  lamp: { title: 'Desk lamp', lines: ['Click to switch it on or off.'], toggle: 'lamp' },
  door: { title: 'The door', lines: ['Back out to the hallway.'], toggle: 'door' }
};

/* Selected work. `image` is the cover; `gallery` and `play` fill the project page. */
const WORKS = [
  {
    id: 'next-chapter', title: 'The Next Chapter', unit: 'KKB385 · Creative Enterprise Studio 3', year: '2026',
    role: 'Main coder · team of four', kind: 'Exhibition game', cover: 'nextChapter', image: 'assets/work/next-chapter/title.png', pixel: true,
    gallery: ['assets/work/next-chapter/title.png', 'assets/work/next-chapter/teen-2014.png', 'assets/work/next-chapter/sprites.png', 'assets/work/next-chapter.jpg'],
    play: [
      { label: 'The Next Chapter (first pixel build)', href: 'play/the-next-chapter/', ratio: '16/9', hint: 'Drag things from the box into the room.' }
    ],
    summary: 'One room, from nursery to moving out: what we keep up, carry on, and leave behind.',
    body: [
      'An interactive game display about upkeep: the slow, never-finished job of looking after a room, and the things in it, while you grow up. The visitor tends one bedroom across six chapters of a girl\'s life. Each chapter she unpacks, tidies and decides what to carry into the next one. Teddy comes along every time. Mess comes back, Mum nags, and the memory box only has room for so much.',
      'My main contribution is coding and interaction design: translating a shared concept into playable interactions within a team. The first build here is fully pixel art, drawn at 320 × 180 and scaled up with no blur. The exhibition build that followed moved to an early-2000s desktop look.'
    ],
    tools: ['p5.js', 'JavaScript', 'Web Audio', 'Pixel art'],
    credits: 'Isabella Kiosses (film & didactic) · Lyebin Cho (film & photo) · Chloee Park (design) · Qinxi Yao (main coder)',
    links: [{ label: 'Exhibition build', href: 'https://ceceliayao.github.io/The-Next-Chapter/' }, { label: 'Source', href: 'https://github.com/CeceliaYao/The-Next-Chapter' }]
  },
  {
    id: 'echo-corridor', title: 'Echo Corridor', unit: 'DXB211 · Creative Coding', year: '2026',
    role: 'Solo', kind: 'Arcade game', cover: 'echoCorridor', image: 'assets/work/echo-corridor/p01.jpg',
    gallery: ['assets/work/echo-corridor/play.jpg', 'assets/work/echo-corridor/p02.jpg', 'assets/work/echo-corridor/p04.jpg', 'assets/work/echo-corridor/p05.jpg'],
    play: [{ label: 'Echo Corridor', href: 'play/echo-corridor/', ratio: '16/9', hint: 'Arrows or WASD to move. 1 pick up, 2 decoy, 3 mute.' }],
    summary: 'A sound stealth maze where the dark hunts your sound.',
    body: [
      'Echo Corridor is a pixel stealth maze designed for the Louie PLAY cabinet. The player explores a dark corridor, collects glowing memory shards, and escapes through the exit once every shard is taken. The enemies cannot see the player. They hunt sound. Each footstep creates a visible trace and a timed sound event, so the challenge is not simply moving quickly. The player must decide when to walk, when to distract, and when to stay silent.',
      'The project began after seeing a Pac-Man cabinet in West End, Brisbane. My first playable version was close to a standard chase game, and testing showed that it felt predictable and sometimes unfair, because the enemy always knew the player position. The breakthrough came when I made enemies respond to sound instead of sight: footsteps, decoys and mute states are stored as events with position, age and strength, and enemies use breadth-first search over the maze grid to move toward the strongest reachable sound.'
    ],
    tools: ['p5.js', 'BFS pathfinding', 'State machines', 'Pixelify Sans'],
    links: [{ label: 'Play full screen', href: 'play/echo-corridor/' }]
  },
  {
    id: 'hith-brick', title: 'HITH Brick', unit: 'DYB223 · Queensland Health', year: '2026',
    role: 'Solo · interaction design', kind: 'Health UX', image: 'assets/work/hith-brick/p01.jpg',
    gallery: ['p01', 'p03', 'p04', 'p07', 'p09'].map(p => 'assets/work/hith-brick/' + p + '.jpg'),
    summary: 'Shared care handover for Hospital in the Home: prepare, practise together, then hand over.',
    body: [
      'A home visit should not be made harder by clinicians searching through separate bags, cables and consumables while a patient waits. I followed the visit from beginning to end: the nurse prepares and inspects, nurse and patient plan and practise the morning checks together, the nurse reviews the devices and clinical tools, and only then does the Brick switch to patient mode.',
      'Amy, the patient, then runs her own blood pressure and oxygen checks, with clear states for "no reliable reading yet", "reading saved offline" and "measurement stopped", and keeps a plan, notes and reminders. Clinicians review the returned data. All sixty-two final Figma screens are ordered to follow the video\'s interaction progression.'
    ],
    tools: ['Figma', 'Clinical workflow', 'WCAG 2.2', 'Video prototype'],
    links: []
  },
  {
    id: 'shopmirror', title: 'ShopMirror 2032', unit: 'DXB210 · Interaction Design', year: '2026',
    role: 'Solo', kind: 'Speculative UX', cover: 'shopMirror', image: 'assets/work/shopmirror/p02.jpg',
    gallery: ['p01', 'p02', 'p03', 'p04', 'p05'].map(p => 'assets/work/shopmirror/' + p + '.jpg'),
    summary: 'The recommendation that reveals what it knows about you.',
    body: [
      'ShopMirror 2032 is a speculative AI shopping app set in Brisbane in 2032. The core interaction is a mode switch that lets users compare the same purchase task under two interface ethics. Deceptive Mode hides recommendation logic, uses urgency prompts, reveals service fees late and makes privacy control tiring. Ethical Mode shows reason cards, a privacy label, editable permissions and full cost before payment.',
      'The key interaction principle is timing: consent and explanation must appear before persuasion, not after commitment. I drew twelve directions by hand before selecting the mode switch, then built the same purchase task twice in Figma, with Mia, a late-night shopper, and RecSys-32, the recommendation engine, as personas.'
    ],
    tools: ['Figma', 'Hand sketching', 'Storyboarding', 'Speculative design'],
    links: []
  },
  {
    id: 'astrobius', title: 'Astrobius', unit: 'DVB201 · Experimental Type Design', year: '2026',
    role: 'Solo', kind: 'Typeface & zine', cover: 'astrobius', image: 'assets/work/astrobius/p01.jpg', tall: true,
    gallery: ['poster', 'p01', 'p04', 'p05', 'p06', 'p07', 'p13', 'p14', 'p15', 'p16'].map(p => 'assets/work/astrobius/' + p + '.jpg'),
    summary: 'Where the celestial meets the atomic. An experimental typeface for World Science Festival Brisbane.',
    body: [
      'The name is a portmanteau of Astro (the celestial) and Möbius (the infinite continuity). Inspired by the realisation that the laws of physics govern both the vastness of the cosmos and the precision of the microscopic world, the typeface serves as a visual bridge between two scales of existence.',
      'It began with soft ribbon sketches and moved toward orbit, rhythm and continuity. The zine documents that process from sketches to a printed result. I first explored bright accent colours, then removed them because they competed with the typeface and grey paper. The final zine uses a restrained black, grey and metallic direction, with Poppins for reading.'
    ],
    tools: ['Illustrator', 'InDesign', '3D render', 'Print'],
    links: []
  },
  {
    id: 'sketches', title: 'Three Behaviours', unit: 'DXB211 · Creative Coding', year: '2026',
    role: 'Solo', kind: 'Generative sketches', image: 'assets/work/sketches/ribbon.jpg',
    gallery: ['assets/work/sketches/ribbon.jpg', 'assets/work/sketches/painting.jpg', 'assets/work/sketches/snake.jpg'],
    play: [
      { label: 'Ribbon', href: 'play/ribbon/', ratio: '1/1', hint: 'Hold the mouse and draw. F freezes the fade.' },
      { label: 'Painting', href: 'play/painting/', ratio: '2/1', hint: 'Click the left side to move the brushes. P pauses, R resets.' },
      { label: 'Snake', href: 'play/snake/', ratio: '7/5', hint: 'Just watch. It spells as it eats.' }
    ],
    summary: 'Across these three sketches, I began to see code less as a tool for displaying an idea and more as a way to shape behaviour.',
    body: [
      'Ribbon is a disobedient drawing partner. It follows the mouse with delay and drift: drawing fast makes the brush wilder and thicker, drawing slow keeps it calm and thin, and old strokes fade, so you must keep drawing to hold the image together.',
      'Painting uses image data in a way that feels closer to painting than copying: wandering brushes sample colour and shrink over time, so the image moves from broad colour to finer detail. Here it paints my photo of Byron Bay lighthouse. Snake merges the classic game with text, turning eating into reading: a snake of letters finds the others in alphabetical order and forms a word.'
    ],
    tools: ['p5.js', 'Generative systems', 'Image sampling', 'Kinetic type'],
    links: []
  },
  {
    id: 'my-room', title: 'My Room: Objects I Carry', unit: 'KKB385 · Individual project', year: '2026',
    role: 'Solo', kind: 'Web game', cover: 'myRoom', image: 'assets/work/my-room.jpg', pixel: true,
    play: [{ label: 'My Room', href: 'room/', ratio: '16/9' }],
    summary: 'An interactive game based on my current room. Explore it and click the objects to learn more about me.',
    body: [
      'The objects in the room reflect my real life: my experiences, interests and things that are personally meaningful to me. It connects to our A3 project, The Next Chapter, through the same idea of meaningful objects.',
      'Every object is something I own, redrawn by hand as pixel art. Click one and the real thing appears, cut out from my photo. The light follows Brisbane time: sunbeams by day, fairy lights and a desk lamp at night.'
    ],
    tools: ['JavaScript', 'Canvas', 'Pixel art', 'Photo cut-outs'],
    links: [{ label: 'Play full screen', href: 'room/' }]
  }
];

const PHOTOS = ['Image_20250906184745_350_1', 'Image_20250906184752_351_1', 'Image_20250906184939_352_1', 'Image_20250906184955_353_1', 'Image_20250906185025_354_1', 'Image_20250906185056_355_1', 'Image_20250906185057_356_1', 'Image_20250906185149_357_1', 'Image_20250906185150_358_1', 'Image_20250906185520_359_1'].map(n => 'assets/photography/' + n + '.jpg');

const SKILLS = [
  { k: 'JavaScript', n: 'JS' }, { k: 'p5.js', n: 'p5' }, { k: 'Figma', n: 'Fg' }, { k: 'Generative art', n: '∿' },
  { k: 'Print & zine', n: 'Zn' }, { k: 'Pixel art', n: 'Px' }, { k: 'Interaction design', n: 'IxD' }, { k: 'Storyboarding', n: 'Sb' },
  { k: 'Game design', n: 'GD' }, { k: 'Photography', n: 'Ph' }, { k: 'Type design', n: 'Aa' }, { k: 'Research', n: 'Rs' }
];

window.SITE = { PROFILE, STORIES, WORKS, SKILLS, PHOTOS };
})();
