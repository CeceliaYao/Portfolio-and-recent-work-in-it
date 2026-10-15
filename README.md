# Cecelia Yao: portfolio

Personal site of Qinxi (Cecelia) Yao, interactive and visual designer, Brisbane.

The front page is my room. You open the door, walk in, and everything you can click is a real object I own, redrawn by hand as pixel art; click it and the real thing appears, cut out from my photo. The desk computer opens my work, the posters on the wall are projects, and the cork board holds my photographs.

- `index.html`: the homepage (room, work, about, contact)
- `room/`: **My Room: Objects I Carry**, the same room as a small walk-around game
- `play/`: work that runs in the browser: the first pixel build of The Next Chapter (KKB385), Echo Corridor (DXB211), and the Ribbon / Painting / Snake sketches (DXB211)

QUT work on the site: The Next Chapter (KKB385), Echo Corridor and Three Behaviours (DXB211), HITH Brick (DYB223), ShopMirror 2032 (DXB210), Astrobius (DVB201), My Room: Objects I Carry (KKB385).

No build step. Plain HTML, CSS and canvas JavaScript; open `index.html` through any static server (`python3 -m http.server`) or GitHub Pages.

## Editing

| What | Where |
| --- | --- |
| Projects (titles, text, links, tools, team) | `js/content.js` → `WORKS` |
| A real screenshot for a project | put it in `assets/work/` and set `image: 'assets/work/name.jpg'` |
| Gallery images / playable builds | `gallery` and `play` on each project in `WORKS` |
| What each object says | `js/content.js` → `STORIES` |
| Email, Behance, GitHub | `js/content.js` → `PROFILE` |
| Object positions in the room | `js/room-engine.js` → `OBJECTS` |
| The pixel drawings of my things | `js/pixel-art.js` |
| Real cut-out photos shown on click | `assets/cutouts/` |
| Pixel covers for projects without screenshots | `js/covers.js` |

## How it looks the way it does

- The room is painted at 480 × 270 pixels and scaled up with no smoothing.
- Light is a separate full-resolution layer: sunbeams and dust by day, desk lamp and screen glow by night, with a slight depth-of-field blur at the top and bottom of the frame.
- Day or night follows the time in Brisbane. The window and the moon/sun button switch it.
- Every object is drawn by hand as a small pixel grid in `js/pixel-art.js`; the real photos, cut out, are in `assets/cutouts/`.
- At night, darkness is laid over the room and light is cut out of it (desk lamp, screen, fairy lights, moon), so the pixels stay crisp inside the light.
- Fonts: Pixelify Sans, VT323 and DotGothic16 (Google Fonts, SIL OFL). p5.js is bundled in `play/lib/` (LGPL-2.1).

## Credits

The Next Chapter: Isabella Kiosses, Lyebin Cho, Chloee Park and Qinxi Yao.
