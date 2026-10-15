/* Everything the site says lives here. */
(function () {
'use strict';

const PROFILE = {
  name: 'Qinxi (Cecelia) Yao',
  short: 'Cecelia Yao',
  role: 'Interactive & visual designer',
  place: 'Brisbane, Australia',
  study: 'Interactive and Visual Design, QUT',
  links: [
    { label: 'Behance', href: 'https://www.behance.net/qinxiyao' },
    { label: 'GitHub', href: 'https://github.com/CeceliaYao' }
  ],
  email: '' // add an address here and a mail link appears in Contact
};

/* What each thing in the room says when you click it. */
const STORIES = {
  computer: { title: 'My desk', lines: ['Everything I have made lives in here.'], open: 'os' },
  trail: { title: 'Trail kit', photo: ['backpack', 'poles', 'visor'],
    lines: ['A blue daypack, two poles in a mesh bag and a visor for the Queensland sun.', 'Most of my ideas turn up somewhere around the third hour of a walk.'] },
  bar: { title: 'After hours', photo: ['whisky', 'gin'],
    lines: ['Lagavulin 16 for slow nights, Woodford Double Oaked when it is cold, an Australian dry gin for anything bright.', 'Mixing a drink is the same job as design: ratio, balance and a little theatre.'] },
  cocktail: { title: 'Bead spritz', photo: ['cocktail'],
    lines: ['A fuse-bead cocktail on the fridge door.', 'I was making pixel art long before this website.'] },
  fridge: { title: 'Fridge door gallery', photo: ['picasso', 'bangle'],
    lines: ['Weeping Woman as a souvenir magnet: the colour does the crying.', 'And a jade bangle that rests in a small ceramic flower when I am not wearing it.'] },
  scent: { title: 'Two atmospheres', photo: ['perfume'],
    lines: ['松月茶馆, a teahouse of pine and moonlight, and Hermès Rose Ikebana.', 'I collect moods more than scents.'] },
  play: { title: 'Field research', photo: ['ps5'],
    lines: ['Games taught me that a room can tell a story without a single line of text.'] },
  plants: { title: 'Upkeep', photo: ['catpot', 'succulent'],
    lines: ['A succulent in a sleepy-eyed cat pot, and a smaller one bedded in yellow pebbles.', 'Looking after things, practised daily.'] },
  water: { title: 'Ten litres at a time', photo: ['water'],
    lines: ['Brisbane summers do not negotiate.'] },
  plush: { title: 'Roommates',
    lines: ['A Hello Kitty who guards the window and a penguin in a knitted beanie who supervises the shelf.'] },
  view: { title: 'Out the window',
    lines: ['The city first, then the hills.'], toggle: 'night' },
  lamp: { title: 'Desk lamp', lines: ['Click to switch it on or off.'], toggle: 'lamp' },
  door: { title: 'The door', lines: ['Back out to the hallway.'], toggle: 'door' }
};

/* Selected work. `cover` names a pixel illustration in covers.js;
   put a screenshot path in `image` to show the real thing instead. */
const WORKS = [
  {
    id: 'next-chapter', title: 'The Next Chapter', unit: 'KKB385 · Creative Enterprise Studio 3', year: '2026',
    role: 'Main coder · team of four', kind: 'Game · exhibition', cover: 'nextChapter', image: 'assets/work/next-chapter.jpg',
    summary: 'One bedroom, from nursery to moving out. An exhibition game about upkeep: what we look after, carry on and leave behind.',
    body: [
      'The visitor tends one room across six chapters of a girl\'s life. Each chapter she unpacks, tidies and decides what goes into a memory box with limited space. Teddy comes every time, and gets a little more worn.',
      'I built the game in p5.js: a small pixel engine (320 × 180, scaled 4×), drag-and-drop placement with snapping surfaces, an upkeep meter, messenger-style pop-ups from Mum and a little brother, a memory player for the team\'s photos and film, and an exhibition mode that resets itself for the next visitor.'
    ],
    tools: ['p5.js', 'JavaScript', 'Web Audio', 'Pixel art'],
    credits: 'Isabella Kiosses (film & didactic) · Lyebin Cho (film & photo) · Chloee Park (design) · Qinxi Yao (code)',
    links: [{ label: 'Play it', href: 'https://ceceliayao.github.io/The-Next-Chapter/' }, { label: 'Source', href: 'https://github.com/CeceliaYao/The-Next-Chapter' }]
  },
  {
    id: 'echo-corridor', title: 'Echo Corridor', unit: 'DXB211 · Creative Coding', year: '2026',
    role: 'Solo', kind: 'Arcade game', cover: 'echoCorridor', image: '',
    summary: 'A pixel stealth maze for the Louie PLAY cabinet, where the dark hunts your sound.',
    body: [
      'It started with a Pac-Man cabinet in West End. My first build was a plain chase maze, and testing showed it felt unfair: the enemies always knew where you were. So I took their eyes away. The shadows now hunt sound.',
      'Every footstep becomes a sound event with a position, an age and a strength. Enemies run a breadth-first search over the grid toward the loudest thing they can reach. The three cabinet buttons all change your relationship with noise: pick up a shard, throw a decoy, or go silent for a few seconds.'
    ],
    tools: ['p5.js', 'BFS pathfinding', 'State machines', 'Pixelify Sans'],
    links: []
  },
  {
    id: 'shopmirror', title: 'ShopMirror 2032', unit: 'DXB210 · Interaction Design', year: '2026',
    role: 'Solo', kind: 'Speculative UX', cover: 'shopMirror', image: '',
    summary: 'The recommendation that reveals what it knows about you.',
    body: [
      'A speculative AI shopping app set in Brisbane, 2032. One switch shows the same purchase under two sets of ethics. Deceptive Mode hides its logic, runs countdowns, reveals fees at checkout and turns privacy settings into a maze.',
      'Ethical Mode shows a reason card for every recommendation, a privacy label, editable permissions and the full price before payment. The principle is timing: explanation and consent arrive before persuasion, not after commitment. Personas include Mia, a late-night shopper, and RecSys-32, the engine itself.'
    ],
    tools: ['Figma', 'Storyboarding', 'Dark-pattern research', 'Speculative design'],
    links: []
  },
  {
    id: 'relax-and-make', title: 'Relax & Make', unit: 'KKB285 · Creative Placemaking', year: '2026',
    role: 'Team of three', kind: 'Public space', cover: 'relaxMake', image: '',
    summary: 'Small, low-pressure making at Parer Place: wind chimes, colouring coasters, a QR message wall and fluorescent ground painting.',
    body: [
      'A proposal for a lawn on campus where people pause between classes. We moved away from a technology-heavy idea toward things you can do in five minutes and walk away from feeling better.',
      'I prototyped the fluorescent ground painting and the colouring coasters, wrote the context and systems-thinking sections, and ran the risk assessment. The lesson I kept: start from the site and the people already in it.'
    ],
    tools: ['Site research', 'Prototyping', 'Systems thinking', 'Risk planning'],
    links: []
  },
  {
    id: 'my-room', title: 'My Room: Objects I Carry', unit: 'KKB385 · Independent project', year: '2026',
    role: 'Solo', kind: 'Web game', cover: 'myRoom', image: '',
    summary: 'This page. My real room, photographed object by object and redrawn in pixels. Walk around and find out who lives here.',
    body: [
      'Each object is a real thing I own: cut out from a photo, reduced to a few dozen pixels and redrawn with an outline and a limited palette. The light is the opposite: soft and full resolution on top of the crisp pixels, with sunbeams by day and a desk lamp at night, following Brisbane time.',
      'The room is both the front page of this site and a small game of its own.'
    ],
    tools: ['Canvas 2D', 'JavaScript', 'OpenCV cut-outs', 'Pixel art'],
    links: [{ label: 'Play it', href: 'room/' }]
  }
];

const SKILLS = [
  { k: 'JavaScript', n: 'JS' }, { k: 'p5.js', n: 'p5' }, { k: 'Figma', n: 'Fg' }, { k: 'Blender', n: 'Bl' },
  { k: 'Three.js', n: '3D' }, { k: 'Pixel art', n: 'Px' }, { k: 'Interaction design', n: 'IxD' }, { k: 'Storyboarding', n: 'Sb' },
  { k: 'Game design', n: 'GD' }, { k: 'Sound', n: '♪' }, { k: 'Visual identity', n: 'Id' }, { k: 'Research', n: 'Rs' }
];

window.SITE = { PROFILE, STORIES, WORKS, SKILLS };
})();
