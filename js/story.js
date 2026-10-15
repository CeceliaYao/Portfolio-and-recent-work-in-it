/* The picture side of the dialog box: the real object, cut out from my photo,
   with a switch to its pixel version and small tabs for related objects. */
(function () {
'use strict';
const PHOTO_ONLY = ['visor', 'whisky', 'gin', 'water'];
function portrait(host, o, st, room, root) {
  host.innerHTML = '';
  host.classList.remove('real');
  const ids = (st.photo || []).slice();
  const art = id => { const ob = room.find(id) || o; return ob.img; };
  const big = (src, k) => { const [c, x] = window.PixelRoom.canvas(src.width * k, src.height * k); x.imageSmoothingEnabled = false; x.drawImage(src, 0, 0, c.width, c.height); return c; };
  if (!ids.length) {
    const pad = 6, sw = o.w + pad * 2, sh = o.h + pad * 2;
    const [c, x] = window.PixelRoom.canvas(sw, sh); x.drawImage(room.base, o.x - pad, o.y - pad, sw, sh, 0, 0, sw, sh);
    const k = Math.max(1, Math.floor(150 / Math.max(sw, sh)));
    host.append(big(c, k));
    return;
  }
  let cur = ids.includes(o.id) ? o.id : ids[0], real = true;
  const stage = document.createElement('div'); stage.className = 'pstage';
  const flip = document.createElement('button'); flip.type = 'button'; flip.className = 'flip';
  const render = () => {
    stage.innerHTML = '';
    host.classList.toggle('real', real);
    if (real) {
      // a few things photograph better as they are, so they show as a plain photo
      const snap = PHOTO_ONLY.includes(cur);
      const im = new Image(); im.alt = ''; im.className = snap ? 'snap' : 'cut'; im.src = root + 'assets/cutouts/' + cur + (snap ? '.jpg' : '.webp');
      stage.append(im);
    } else {
      const src = art(cur); const k = Math.max(2, Math.floor(130 / Math.max(src.width, src.height)));
      stage.append(big(src, k));
    }
    flip.textContent = real ? 'pixels' : 'real photo';
    tabs.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.id === cur)));
  };
  const tabs = document.createElement('div'); tabs.className = 'ptabs';
  if (ids.length > 1) ids.forEach(id => {
    const b = document.createElement('button'); b.type = 'button'; b.dataset.id = id;
    const src = art(id); if (src) b.append(big(src, Math.max(1, Math.floor(22 / Math.max(src.width, src.height)))));
    b.onclick = () => { cur = id; render(); };
    tabs.append(b);
  });
  flip.onclick = () => { real = !real; render(); };
  host.append(stage, tabs, flip);
  render();
}
window.StoryPortrait = portrait;
})();
