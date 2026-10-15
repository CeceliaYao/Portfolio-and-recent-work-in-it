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
    role: 'Main coder · team of four', kind: 'Exhibition game', cover: 'nextChapter', image: 'assets/work/next-chapter.jpg',
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
    id: 'hith-brick', title: 'HITH Brick', unit: 'DYB223 · Queensland Health', year: '2026',
    role: 'Solo · interaction design', kind: 'Health UX', image: 'assets/work/hith-brick/p01.jpg',
    gallery: ['p01', 'p03', 'p04', 'p07', 'p09'].map(p => 'assets/work/hith-brick/' + p + '.jpg'),
    summary: 'A shared-care handover for Hospital in the Home: the nurse sets it up, practises it with the patient, then hands it over.',
    body: [
      'The Brick is a kit of clinical devices that goes home with a patient. My part was the screen that carries the handover. The flow follows a home visit: the nurse prepares and inspects, nurse and patient plan and practise the morning checks together, and only then does the Brick switch to patient mode.',
      'Amy, the patient, then runs her own blood pressure and oxygen checks, sees clear states for "no reliable reading yet", "saved offline" and "measurement stopped", and keeps notes, a plan and reminders. Clinicians review the returned data on their side. Sixty-two final Figma screens, ordered to match the demo video and checked against WCAG 2.2.'
    ],
    tools: ['Figma', 'Clinical workflow mapping', 'Accessibility (WCAG 2.2)', 'Video prototyping'],
    links: []
  },
  {
    id: 'echo-corridor', title: 'Echo Corridor', unit: 'DXB211 · Creative Coding', year: '2026',
    role: 'Solo', kind: 'Arcade game', cover: 'echoCorridor', image: 'assets/work/echo-corridor/p01.jpg',
    gallery: ['assets/work/echo-corridor/play.jpg', 'assets/work/echo-corridor/p02.jpg', 'assets/work/echo-corridor/p04.jpg', 'assets/work/echo-corridor/p05.jpg'],
    play: [{ label: 'Echo Corridor', href: 'play/echo-corridor/', ratio: '16/9' }],
    summary: 'A pixel stealth maze for the Louie PLAY cabinet, where the dark hunts your sound.',
    body: [
      'It started with a Pac-Man cabinet in West End. My first build was a plain chase maze, and testing showed it felt unfair: the enemies always knew where you were. So I took their eyes away. The shadows now hunt sound.',
      'Every footstep becomes a sound event with a position, an age and a strength. Enemies run a breadth-first search over the grid toward the loudest thing they can reach. The three cabinet buttons all change your relationship with noise: pick up a shard, throw a decoy, or go silent for a few seconds.'
    ],
    tools: ['p5.js', 'BFS pathfinding', 'State machines', 'Pixelify Sans'],
    links: [{ label: 'Play full screen', href: 'play/echo-corridor/' }]
  },
  {
    id: 'shopmirror', title: 'ShopMirror 2032', unit: 'DXB210 · Interaction Design', year: '2026',
    role: 'Solo', kind: 'Speculative UX', cover: 'shopMirror', image: 'assets/work/shopmirror/p02.jpg',
    gallery: ['p01', 'p02', 'p03', 'p04', 'p05'].map(p => 'assets/work/shopmirror/' + p + '.jpg'),
    summary: 'The recommendation that reveals what it knows about you.',
    body: [
      'A speculative AI shopping app set in Brisbane, 2032. One switch shows the same purchase under two sets of ethics. Deceptive Mode hides its logic, runs countdowns, reveals fees at checkout and turns privacy settings into a maze.',
      'Ethical Mode shows a reason card for every recommendation, a privacy label, editable permissions and the full price before payment. The principle is timing: explanation and consent arrive before persuasion, not after commitment. I drew twelve directions by hand before choosing the mode switch, then built both flows in Figma.'
    ],
    tools: ['Figma', 'Hand sketching', 'Storyboarding', 'Dark-pattern research'],
    links: []
  },
  {
    id: 'astrobius', title: 'Astrobius', unit: 'DVB201 · Experimental Type Design', year: '2026',
    role: 'Solo', kind: 'Typeface & zine', image: 'assets/work/astrobius/p01.jpg', tall: true,
    gallery: ['poster', 'p01', 'p04', 'p05', 'p06', 'p07', 'p13', 'p14', 'p15', 'p16'].map(p => 'assets/work/astrobius/' + p + '.jpg'),
    summary: 'An experimental display typeface where the celestial meets the atomic, made for World Science Festival Brisbane.',
    body: [
      'Astro plus Möbius. The letters began as fluid ribbon sketches and were slowly pulled into orbits, loops and continuous strokes, so that each glyph reads like a small system in motion. Chrome renders turned the type into an object.',
      'The process is documented in a sixteen-page zine and a set of posters. I first tried bright accent colours and took them out again because they fought the letterforms; the final print is black, grey and metallic, with Poppins doing the quiet reading work.'
    ],
    tools: ['Illustrator', 'InDesign', '3D rendering', 'Print production'],
    links: []
  },
  {
    id: 'relax-and-make', title: 'Relax & Make', unit: 'KKB285 · Creative Placemaking', year: '2026',
    role: 'Team of three', kind: 'Public space', cover: 'relaxMake', image: 'assets/work/relax-and-make/parer.jpg',
    gallery: ['assets/work/relax-and-make/parer.jpg'],
    summary: 'Small, low-pressure making at Parer Place: wind chimes, colouring coasters, a QR message wall and fluorescent ground painting.',
    body: [
      'A proposal for a lawn on campus where people pause between classes. We moved away from a technology-heavy idea toward things you can do in five minutes and walk away from feeling better.',
      'I prototyped the fluorescent pathway and the colouring coasters, ran day and night studies of the site, wrote the context and systems-thinking sections, and did the risk assessment. The lesson I kept: start from the site and the people already in it.'
    ],
    tools: ['Site research', 'Digital mockups', 'Systems thinking', 'Risk planning'],
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
    summary: 'Three small p5.js sketches about code as behaviour: a brush with a mind of its own, a painter made of wandering dots, a snake that spells.',
    body: [
      'Ribbon is a disobedient drawing partner. It follows the mouse with delay and drift, gets wilder when you draw fast, and lets old strokes fade so you have to keep drawing to hold the image together.',
      'Painting sends twenty brushes on a random walk across a photo, sampling its colours and shrinking as they go, so the picture arrives the way a painting does: broad first, details last. The source here is my own photo of Byron Bay lighthouse. Snake turns eating into reading: a line of letters finds the rest of the alphabet in order and spells a word.'
    ],
    tools: ['p5.js', 'Generative systems', 'Image sampling', 'Kinetic type'],
    links: []
  },
  {
    id: 'my-room', title: 'My Room: Objects I Carry', unit: 'KKB385 · Independent project', year: '2026',
    role: 'Solo', kind: 'Web game', cover: 'myRoom', image: 'assets/work/my-room.jpg',
    play: [{ label: 'My Room', href: 'room/', ratio: '16/9' }],
    summary: 'This page. My real room, photographed object by object and redrawn in pixels. Walk around and find out who lives here.',
    body: [
      'Each object is a real thing I own: cut out from a photo, reduced to a few dozen pixels and redrawn with an outline and a limited palette. The light is the opposite: soft and full resolution on top of the crisp pixels, with sunbeams by day and a desk lamp at night, following Brisbane time.',
      'The room is both the front page of this site and a small game of its own.'
    ],
    tools: ['Canvas 2D', 'JavaScript', 'Photo cut-outs', 'Pixel art'],
    links: [{ label: 'Play full screen', href: 'room/' }]
  },
  {
    id: 'music-blender', title: 'Music Blender', unit: 'DXB110 · Interaction Design', year: '2025',
    role: 'Solo', kind: 'Interaction concept', image: 'assets/work/music-blender/p02.jpg',
    gallery: ['p01', 'p02', 'p03', 'p05', 'p06'].map(p => 'assets/work/music-blender/' + p + '.jpg'),
    summary: 'What if the blender ran your Spotify? A kitchen appliance turned into a music controller for greasy hands.',
    body: [
      'I interviewed someone who cooks to music and found the real problem: wet hands, a noisy kitchen and a phone that wants to be touched. So the blender\'s own controls became the interface. Power plays and pauses, Low and High change volume and, held down, switch to calmer or livelier playlists. Turning the jar browses the library; twisting the lid turns on surround sound.',
      'Plugging it in reconnects to the last device, and blender noise nudges the volume up on its own. My photos of a real Ninja blender, annotated, plus a user flow and a hand-drawn storyboard.'
    ],
    tools: ['User interviews', 'User flows', 'Storyboarding', 'Annotation'],
    links: []
  },
  {
    id: 'boldhive', title: 'BoldHive', unit: 'DVB101 · Visual Communication', year: '2025',
    role: 'Solo', kind: 'Brand identity', image: 'assets/work/boldhive/p07.jpg',
    gallery: ['p01', 'p03', 'p06', 'p07', 'p09'].map(p => 'assets/work/boldhive/' + p + '.jpg').concat(['assets/work/boldhive/logo-1.jpg', 'assets/work/boldhive/logo-2.jpg']),
    summary: 'An identity for a youth housing community: Build bold. House all. Hold hive.',
    body: [
      'BoldHive imagines housing for young people facing homelessness, built like a hive where every unit holds up the next. The mark stacks a circle, a triangle and a square into something between a house and a running figure: green for hope, warm yellow for home, a gradient square for the young people with everything still ahead.',
      'From hand-drawn wordmarks to logotype variations, colourways and mockups on shirts, signage and street posters.'
    ],
    tools: ['Illustrator', 'Logotype design', 'Gestalt principles', 'Mockups'],
    links: []
  },
  {
    id: 'first-site', title: 'My First Website', unit: 'DXB111 · Web Design', year: '2025',
    role: 'Solo', kind: 'HTML & CSS', image: 'play/photography/images/Image_20250906185057_356_1.jpg',
    play: [{ label: 'Website', href: 'play/photography/', ratio: '16/10' }],
    gallery: ['350', '352', '353', '354', '356', '359'].map(n => 'play/photography/images/' + ({ '350': 'Image_20250906184745_350_1', '352': 'Image_20250906184939_352_1', '353': 'Image_20250906184955_353_1', '354': 'Image_20250906185025_354_1', '356': 'Image_20250906185057_356_1', '359': 'Image_20250906185520_359_1' })[n] + '.jpg'),
    summary: 'A photography portfolio written by hand in HTML and CSS, a year before this one. All photos are mine.',
    body: [
      'Four pages, a gallery with a slider and a contact form, built from W3Schools and a lot of trial and error. I kept it as it was, so you can see where this started.',
      'The photos are from around Brisbane and the coast: two cats, a marina at night, a rainy street, a bartender lighting a drink, Byron Bay lighthouse and an old fig tree.'
    ],
    tools: ['HTML', 'CSS', 'Photography'],
    links: [{ label: 'Open the site', href: 'play/photography/' }]
  }
];

const PHOTOS = ['350', '351', '352', '353', '354', '355', '356', '357', '358', '359'].map((n, i) => 'play/photography/images/' + ['Image_20250906184745_350_1', 'Image_20250906184752_351_1', 'Image_20250906184939_352_1', 'Image_20250906184955_353_1', 'Image_20250906185025_354_1', 'Image_20250906185056_355_1', 'Image_20250906185057_356_1', 'Image_20250906185149_357_1', 'Image_20250906185150_358_1', 'Image_20250906185520_359_1'][i] + '.jpg');

const SKILLS = [
  { k: 'JavaScript', n: 'JS' }, { k: 'p5.js', n: 'p5' }, { k: 'Figma', n: 'Fg' }, { k: 'Blender', n: 'Bl' },
  { k: 'Three.js', n: '3D' }, { k: 'Pixel art', n: 'Px' }, { k: 'Interaction design', n: 'IxD' }, { k: 'Storyboarding', n: 'Sb' },
  { k: 'Game design', n: 'GD' }, { k: 'Sound', n: '♪' }, { k: 'Visual identity', n: 'Id' }, { k: 'Research', n: 'Rs' }
];

window.SITE = { PROFILE, STORIES, WORKS, SKILLS, PHOTOS };
})();
