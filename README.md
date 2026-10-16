# Cecelia Yao: portfolio

Personal site of Qinxi (Cecelia) Yao, interactive and visual designer, Brisbane.

The page opens with a short introduction, then steps into my room. You open the door, walk in, and everything you can click is a real object I own, redrawn by hand as pixel art; click it and the real thing appears. The desk computer opens my work and the posters on the wall are projects. In Selected work each project is taped down: drag the tape sideways to peel it off. Further down, the same room floats as a small 3D island (What We Carry).

- `index.html`: the homepage (intro, room, work, What We Carry in 3D, arcade, contact)
- `room/`: **My Room**, the same room as a small click-around game
- `play/`: work that runs in the browser: the first pixel build of The Next Chapter (KKB385) and Echo Corridor (DXB211)

QUT work on the site: The Next Chapter (KKB385), Echo Corridor (DXB211), HITH Brick (DYB223), ShopMirror 2032 (DXB210), Astrobius (DVB201), What We Carry (KKB385).

No build step. Plain HTML, CSS and JavaScript; open `index.html` through any static server (`python3 -m http.server`) or GitHub Pages. It works on phones too: the room can be dragged sideways and the 3D island turned with a finger.

## Editing

| What | Where |
| --- | --- |
| Projects (titles, text, links, tools, team) | `js/content.js` → `WORKS` |
| A real screenshot for a project | put it in `assets/work/` and set `image: 'assets/work/name.jpg'` |
| Gallery images / playable builds | `gallery` and `play` on each project in `WORKS` |
| What each object says | `js/content.js` → `STORIES` |
| Instagram, TikTok, Behance, GitHub | `js/content.js` → `PROFILE` |
| Object positions in the room | `js/room-engine.js` → `OBJECTS` |
| The pixel drawings of my things | `js/pixel-art.js` |
| Real photos shown on click | `assets/cutouts/` (cut-outs as .webp, plain photos as .jpg) |
| The 3D island | `js/island.js` (Three.js, in `lib/`) |
| Pixel covers for projects without screenshots | `js/covers.js` |

## How it looks the way it does

- The room is painted at 480 × 270 pixels and scaled up with no smoothing.
- Light is a separate full-resolution layer: sunbeams and dust by day, desk lamp and screen glow by night, with a slight depth-of-field blur at the top and bottom of the frame.
- Day or night follows the time in Brisbane. The window and the moon/sun button switch it.
- Every object is drawn by hand as a small pixel grid in `js/pixel-art.js`; the real photos, cut out, are in `assets/cutouts/`.
- At night, darkness is laid over the room and light is cut out of it (desk lamp, screen, fairy lights, moon), so the pixels stay crisp inside the light.
- The 3D island is built from boxes in Three.js, rendered at a third of the screen resolution and scaled up without smoothing, so it reads as pixel art. It swings rather than spins because the room is open on two sides.
- The background music, Little Room Shuffle, is a light tune in G major written for this site (`js/music.js`): short bowed violin notes over plucked strings, a soft bass and a shaker, with a music-box bell on the second pass. Everything is played live by the browser with Web Audio. No recordings or samples, so there are no rights to clear. It only starts when the music button is pressed.
- Fonts: Pixelify Sans, VT323 and DotGothic16 (Google Fonts, SIL OFL), and Astrobius, my own typeface, on the Astrobius page. p5.js is bundled in `play/lib/` (LGPL-2.1); Three.js in `lib/` (MIT).

## Credits

The Next Chapter: Isabella Kiosses, Lyebin Cho, Chloee Park and Qinxi Yao.
