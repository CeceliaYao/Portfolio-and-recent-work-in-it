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
    { label: 'Instagram', href: 'https://www.instagram.com/ceceliayao.design/' },
    { label: 'TikTok', href: 'https://www.tiktok.com/@ceceliayao.design' },
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
    lines: ['I love hiking. My visor, my daypack and my trekking poles come on every walk.', 'It is one of the hobbies that gives me ideas.'] },
  beads: { title: 'Shrimp cocktail', photo: ['beads'],
    lines: ['I make some of my fridge magnets myself. This shrimp cocktail is fuse beads, placed one pixel at a time.', 'It comes from Rusty Lake, a game I love. It gave me so many ideas, and it is the game that made me really think about games as art.'] },
  jade: { title: 'Hongshan jade dragon', photo: ['jade'],
    lines: ['A Hongshan jade dragon resting in an ancient Chinese wine cup.', 'A small piece of Chinese culture that I keep close.'] },
  art: { title: 'Picasso, next to the bottles', photo: ['picasso'],
    lines: ['Weeping Woman, on the fridge right beside my bottles.', 'Art and a good drink are both hobbies of mine. They give me ideas, and then help me slow down and focus on the design.'] },
  bar: { title: 'Whisky and gin', photo: ['whisky', 'gin'],
    lines: ['Lagavulin 16, Woodford Reserve Double Oaked and an Australian dry gin.', 'Tasting is a hobby. It gives me inspiration and helps me settle into focus when I design.'] },
  scent: { title: 'Two scents', photo: ['perfume'],
    lines: ['松月茶馆, a teahouse of pine and moonlight, and Hermès Rose Ikebana.'] },
  play: { title: 'Games', photo: ['ps5'],
    lines: ['Room games like Unpacking and Whisper of the House were some of my references for The Next Chapter.'] },
  plants: { title: 'Something green', photo: ['catpot', 'succulent'],
    lines: ['I bought these two because I like having something green to look at.'] },
  water: { title: 'Ten litres at a time', photo: ['water'],
    lines: ['Brisbane summers.'] },
  plush: { title: 'Roommates',
    lines: ['A Hello Kitty by the window and a penguin in a knitted beanie on the shelf.'] },
  photos: { title: 'The cork board', lines: ['Photos I took around Brisbane and the coast, pinned up so I see them every day.'] },
  view: { title: 'Out the window',
    lines: ['The city first, then the hills.'], toggle: 'night' },
  lamp: { title: 'Desk lamp', lines: ['Click to switch it on or off.'], toggle: 'lamp' },
  door: { title: 'The door', lines: ['Back out to the hallway.'], toggle: 'door' }
};

/* Selected work. `image` is the cover; `gallery` and `play` fill the project page. */
const WORKS = [
  {
    id: 'my-room', title: 'What We Carry', unit: 'KKB385 · Individual project', year: '2026',
    skills: ['Creative Coding & Interactive Prototyping', 'Three.js / Web 3D', 'Concept Development & Framing', 'Visual Storytelling'], accent: '#ffe08a',
    role: 'Solo', kind: 'Interactive web & 3D study', cover: 'myRoom', image: 'assets/work/my-room-cover.png', pixel: true,
    play: [{ label: 'My Room', href: 'room/', ratio: '16/9' }],
    summary: 'The Next Chapter: What We Carry. An individual interactive web and 3D prototyping study.',
    body: [
      'Developed after our A3 team discussions about one room evolving across life stages and the objects that recur, disappear or change meaning. It is an interactive game based on my current room. The objects in the room reflect my real life, including my experiences, interests and things that are personally meaningful to me. Players can explore the room and interact with different objects to learn more about me. It connects to our A3 group project through the idea of meaningful objects.',
      'For references I compared room games through presentation, colour and style. Unpacking and Whisper of the House show how a desk, books and keepsakes can carry someone\'s interests. A Storied Life: Tabitha was useful for a quieter memory theme and short descriptions of meaningful objects.',
      'One of my two-year goals is to expand creative coding into interactive 3D web experiences. The first step was a small Three.js scene for What We Carry: the floating room on the homepage. It builds on my p5.js foundation and is documented as research and precedents, interaction flow, prototype, testing, iteration and final playable outcome.'
    ],
    tools: ['JavaScript', 'Three.js', 'Canvas', 'Pixel art'],
    links: [{ label: 'Play full screen', href: 'room/' }, { label: 'Instagram series', href: 'https://www.instagram.com/ceceliayao.design/' }]
  },
  {
    id: 'echo-corridor', title: 'Echo Corridor', unit: 'DXB211 · Creative Coding', year: '2026',
    skills: ['p5.js / JavaScript', 'Game-state / Data Logic', 'Interaction Prototyping', 'User Research & Usability Testing'], accent: '#a9d8ef',
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
    id: 'next-chapter', title: 'The Next Chapter', unit: 'KKB385 · Creative Enterprise Studio 3', year: '2026',
    skills: ['Creative Coding & Interactive Prototyping', 'Team Collaboration', 'Game-state / Data Logic', 'Role Ownership'], accent: '#ffb8cc',
    role: 'Main coder · team of four', kind: 'Exhibition game', cover: 'nextChapter', image: 'assets/work/next-chapter/title.png', pixel: true,
    gallery: ['assets/work/next-chapter/title.png', 'assets/work/next-chapter/teen-2014.png', 'assets/work/next-chapter/sprites.png', 'assets/work/next-chapter.jpg'],
    play: [
      { label: 'The Next Chapter (first pixel build)', href: 'play/the-next-chapter/', ratio: '16/9', hint: 'Drag things from the box into the room.' }
    ],
    summary: 'One room, from nursery to moving out: what we keep up, carry on, and leave behind.',
    body: [
      'An interactive game display about upkeep. The visitor looks after one bedroom across six chapters of a girl\'s life, unpacking, tidying and deciding what to carry into the next chapter. The first build here is fully pixel art; the exhibition build that followed moved to an early-2000s desktop look.',
      'Our team uses a studio-role model with collaborative co-authorship: I am main coder; Chloee Park leads design and supports coding; Isabella Kiosses leads documentation and film; Lyebin Cho leads film and photo. Decisions are discussed collectively, while role holders make specialist calls; as primary coder, I make final technical decisions.',
      'I can claim the core interaction system, player input/state logic, asset integration, technical problem-solving and testing, while crediting teammates for visual and film contributions. The exhibition develops reliable interactive systems because it must run repeatedly on a public computer and withstand real visitor use.'
    ],
    tools: ['p5.js', 'JavaScript', 'Web Audio', 'Pixel art'],
    credits: 'Isabella Kiosses (film & didactic) · Lyebin Cho (film & photo) · Chloee Park (design) · Qinxi Yao (main coder)',
    links: [{ label: 'Exhibition build', href: 'https://ceceliayao.github.io/The-Next-Chapter/' }]
  },
  {
    id: 'astrobius', title: 'Astrobius', unit: 'DVB201 · Experimental Type Design', year: '2026',
    skills: ['Type Design', 'Visual Storytelling', 'Concept Development & Framing', 'Presentation & Documentation'], accent: '#c9c0e6',
    role: 'Solo', kind: 'Typeface & zine', cover: 'astrobius', image: 'assets/work/astrobius/p01.jpg', tall: true,
    gallery: ['poster', 'colour', 'thumbs', 'p01', 'p02', 'p03', 'p04', 'p05', 'p06', 'p07', 'p08', 'p09', 'p10', 'p11', 'p12', 'p13', 'p14', 'p15', 'p16'].map(p => 'assets/work/astrobius/' + p + '.jpg'),
    summary: 'Where the celestial meets the atomic. An experimental typeface for World Science Festival Brisbane.',
    body: [
      'The name is a portmanteau of Astro (the celestial) and Möbius (the infinite continuity). Inspired by the realisation that the laws of physics govern both the vastness of the cosmos and the precision of the microscopic world, the typeface serves as a visual bridge between two scales of existence.',
      'It began with soft ribbon sketches and moved toward orbit, rhythm and continuity. The zine documents that process from sketches to a printed result. I first explored bright accent colours, then removed them because they competed with the typeface and grey paper. The final zine uses a restrained black, grey and metallic direction, with Poppins for reading.'
    ],
    tools: ['Illustrator', 'InDesign', '3D render', 'Print'],
    links: []
  },
  {
    id: 'hith-brick', title: 'HITH Brick', unit: 'DYB223 · Queensland Health', year: '2026',
    skills: ['Interaction & UI/UX Design', 'Figma Prototyping', 'Research Synthesis', 'Audience Empathy'], accent: '#b5d99a',
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
    skills: ['Interaction & UI/UX Design', 'Figma Prototyping', 'Storyboarding & Scenario Design', 'Critical Reflection'], accent: '#ffc79a',
    role: 'Solo', kind: 'Speculative UX', cover: 'shopMirror', image: 'assets/work/shopmirror/personas.jpg',
    gallery: ['modes', 'sketches', 'storyboard', 'lofi'].map(p => 'assets/work/shopmirror/' + p + '.jpg'),
    summary: 'The recommendation that reveals what it knows about you.',
    quote: 'Can personalisation still create revenue when explanation appears before persuasion, not after commitment?',
    body: [
      'This concept continues my A1 challenge on purchase history and recommendations in shopping apps. ShopMirror 2032 is a speculative shopping app for late-night everyday purchases. It recommends products using purchase history, browsing rhythm and saved preferences.',
      'I started with twelve hand-drawn directions comparing manipulative and privacy-centred possibilities. The main interaction became a mode switch: Deceptive Mode hides recommendation logic, delays fees and makes privacy control tiring; Ethical Mode shows why an item appears, what data is used, what is excluded and the full price before payment.',
      'Mia and RecSys-32 operate as design constraints. Mia needs fast checkout, fair price and understandable data use. RecSys-32, the recommendation engine, can either optimise conversion or support trust. Eight hand-drawn storyboard frames and eight wireframes follow the same shopping task in both modes.',
      'I learned that dark patterns are not single tricks. In ShopMirror, urgency, hidden fees, sharing defaults and opt-out friction work as one system. The ethical version gives users explanation and reversible control, while the business still earns through transparent membership or voluntary data exchange.'
    ],
    tools: ['Figma', 'Hand sketching', 'Storyboarding', 'Speculative design'],
    links: []
  }
];

const PHOTOS = ['Image_20250906184745_350_1', 'Image_20250906184752_351_1', 'Image_20250906184939_352_1', 'Image_20250906184955_353_1', 'Image_20250906185025_354_1', 'Image_20250906185056_355_1', 'Image_20250906185057_356_1', 'Image_20250906185149_357_1', 'Image_20250906185150_358_1', 'Image_20250906185520_359_1'].map(n => 'assets/photography/' + n + '.jpg');

const SKILLS = [
  { k: 'JavaScript', n: 'JS' }, { k: 'p5.js', n: 'p5' }, { k: 'Figma', n: 'Fg' }, { k: 'Three.js', n: '3D' },
  { k: 'Print & zine', n: 'Zn' }, { k: 'Pixel art', n: 'Px' }, { k: 'Interaction design', n: 'IxD' }, { k: 'Storyboarding', n: 'Sb' },
  { k: 'Game design', n: 'GD' }, { k: 'Photography', n: 'Ph' }, { k: 'Type design', n: 'Aa' }, { k: 'Research', n: 'Rs' }
];

window.SITE = { PROFILE, STORIES, WORKS, SKILLS, PHOTOS };
})();
