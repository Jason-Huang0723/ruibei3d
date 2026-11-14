// clay helpers (were in the old mascot file)
function noiseTex(size = 256, amp = 40, base = 128, rep = 3) { const c = document.createElement('canvas'); c.width = c.height = size; const g = c.getContext('2d'); const im = g.createImageData(size, size); let s = 7; const rr = () => (s = (s*16807) % 2147483647)/2147483647; for (let i = 0; i < size*size; i++) { const v = base + (rr() - .5)*amp; im.data[i*4] = im.data[i*4+1] = im.data[i*4+2] = v; im.data[i*4+3] = 255; } g.putImageData(im, 0, 0); const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep, rep); return t; }
const CLAY_BUMP = noiseTex();
function clay(color, rough = .86, bump = .01) { return new THREE.MeshStandardMaterial({color, roughness: rough, metalness: 0, bumpMap: CLAY_BUMP, bumpScale: bump}); }
function shapeFromPath(pts) { const s = new THREE.Shape(); pts.forEach(p => { if (p[0] === 'M') s.moveTo(p[1], p[2]); else if (p[0] === 'C') s.bezierCurveTo(p[1], p[2], p[3], p[4], p[5], p[6]); else s.lineTo(p[1], p[2]); }); return s; }
// ---------- textures ----------
function cvs(w, h, fn) { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; }
let _seed = 11; const rnd = () => (_seed = (_seed*16807) % 2147483647)/2147483647;
function shade(hex, f) { const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255; r = clamp(Math.round(r*f), 0, 255); g = clamp(Math.round(g*f), 0, 255); b = clamp(Math.round(b*f), 0, 255); return `rgb(${r},${g},${b})`; }
function woodTex(base = '#B9774A', planks = 6, rep = [1, 1], vertical = false) {
  const t = cvs(1024, 1024, (g, w, h) => { const ph = h/planks;
    for (let i = 0; i < planks; i++) { g.fillStyle = shade(base, .9 + rnd()*.2); g.fillRect(0, i*ph, w, ph);
      for (let k = 0; k < 26; k++) { g.strokeStyle = `rgba(70,35,15,${.05 + rnd()*.09})`; g.lineWidth = 1 + rnd()*2.5; g.beginPath(); const y = i*ph + rnd()*ph; g.moveTo(0, y); for (let x = 0; x <= w; x += 64) g.lineTo(x, y + Math.sin(x*.01 + k)*3*rnd()); g.stroke(); }
      g.fillStyle = 'rgba(50,25,10,.45)'; g.fillRect(0, i*ph, w, 3); const off = rnd()*w; g.fillRect(off, i*ph, 3, ph); }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); if (vertical) { t.rotation = Math.PI/2; } return t;
}
function tileTex(base = '#F1E6D4', grout = '#CDBBA2', n = 4, rep = [1, 1]) {
  const t = cvs(512, 512, (g, w, h) => { g.fillStyle = grout; g.fillRect(0, 0, w, h); const s = w/n;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { g.fillStyle = shade(base, .96 + rnd()*.07); g.beginPath(); g.roundRect(i*s + 4, j*s + 4, s - 8, s - 8, 6); g.fill(); g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(i*s + 10, j*s + 10, s*.3, 4); } });
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); return t;
}
function plasterTex(base = '#E9B48A', stripe = null, rep = [1, 1]) {
  const t = cvs(512, 512, (g, w, h) => { g.fillStyle = base; g.fillRect(0, 0, w, h);
    if (stripe) { g.fillStyle = stripe; for (let x = 0; x < w; x += 64) g.fillRect(x, 0, 26, h); }
    for (let i = 0; i < 2500; i++) { g.fillStyle = `rgba(${rnd() < .5 ? '255,255,255' : '90,50,30'},${rnd()*.05})`; g.fillRect(rnd()*w, rnd()*h, 2 + rnd()*4, 2 + rnd()*4); } });
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); return t;
}
// painted wooden board with text
function boardTex(lines, w = 1024, h = 512, base = '#B87A47') {
  return cvs(w, h, (g, W, H) => { g.fillStyle = base; g.fillRect(0, 0, W, H);
    for (let k = 0; k < 60; k++) { g.strokeStyle = `rgba(80,40,15,${.04 + rnd()*.08})`; g.lineWidth = 1 + rnd()*3; g.beginPath(); const y = rnd()*H; g.moveTo(0, y); for (let x = 0; x <= W; x += 50) g.lineTo(x, y + Math.sin(x*.01 + k)*4); g.stroke(); }
    const grd = g.createRadialGradient(W/2, H/2, H*.2, W/2, H/2, W*.7); grd.addColorStop(0, 'rgba(255,230,190,.15)'); grd.addColorStop(1, 'rgba(60,25,5,.35)'); g.fillStyle = grd; g.fillRect(0, 0, W, H);
    g.textAlign = 'center'; g.textBaseline = 'middle';
    for (const l of lines) { g.font = `${l.size}px huninn`; g.fillStyle = 'rgba(50,20,5,.45)'; g.fillText(l.text, W/2 + 5, l.y + 7); g.lineJoin = 'round'; g.lineWidth = l.size*.1; g.strokeStyle = '#5A2E14'; g.strokeText(l.text, W/2, l.y); g.fillStyle = l.col || '#FFF7E8'; g.fillText(l.text, W/2, l.y); }
  });
}
// ---------- geometry ----------
function rrShape(w, h, r) { const s = new THREE.Shape(), x = -w/2, y = -h/2; s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h); s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s; }
function rbox(w, h, d, r, mat, shadow = true) { const b = Math.min(r, d/2 - .001, w/2 - .001, h/2 - .001); const g = new THREE.ExtrudeGeometry(rrShape(w - 2*b, h - 2*b, Math.min(b, (w - 2*b)/2 - .001, (h - 2*b)/2 - .001) > 0 ? Math.min(b, (w - 2*b)/2 - .001, (h - 2*b)/2 - .001) : .001), {depth: d - 2*b, bevelEnabled: true, bevelThickness: b, bevelSize: b, bevelSegments: 4, curveSegments: 6}); g.translate(0, 0, -(d - 2*b)/2);
  // fix uv for box-ish mapping on front face
  const m = new THREE.Mesh(g, mat); m.castShadow = shadow; m.receiveShadow = true; return m; }
function mesh(geo, mat, shadow = true) { const m = new THREE.Mesh(geo, mat); m.castShadow = shadow; m.receiveShadow = true; return m; }
const M = {}; // shared materials
function initMats() {
  M.white = clay(0xF6F2EA, .5, .004); M.porcelain = new THREE.MeshStandardMaterial({color: 0xF7F7F2, roughness: .25}); M.chrome = new THREE.MeshStandardMaterial({color: 0xC9CDD2, roughness: .25, metalness: .8});
  M.wood = new THREE.MeshStandardMaterial({map: woodTex('#B9774A', 5), roughness: .7}); M.woodDark = new THREE.MeshStandardMaterial({map: woodTex('#7E4B2C', 5), roughness: .7});
  M.woodLight = new THREE.MeshStandardMaterial({map: woodTex('#D9A877', 5), roughness: .7});
  M.paper = clay(0xFBF8F1, .9, .003); M.dark = clay(0x3A2A22, .7); M.glowWarm = new THREE.MeshStandardMaterial({color: 0xFFE2A8, emissive: 0xFFC46B, emissiveIntensity: 1.6, roughness: .5});
  M.glass = new THREE.MeshStandardMaterial({color: 0xCFE8F2, roughness: .1, transparent: true, opacity: .35});
  M.leaf = clay(0x6FAE6B, .8); M.pot = clay(0xD6764A, .8); M.rope = clay(0x9A7650, .9);
}
// ---------- props ----------
function plant(s = 1) { const g = new THREE.Group(); const pot = mesh(new THREE.CylinderGeometry(.16, .12, .28, 24), M.pot); pot.position.y = .14; g.add(pot);
  for (let i = 0; i < 7; i++) { const a = i/7*Math.PI*2, r = .09 + (i % 2)*.05; const l = mesh(new THREE.SphereGeometry(1, 16, 12), M.leaf); l.scale.set(.09, .2, .05); l.position.set(Math.cos(a)*r, .42 + (i % 3)*.06, Math.sin(a)*r); l.rotation.set(Math.sin(a)*.6, -a, Math.cos(a)*.6); g.add(l); }
  g.scale.setScalar(s); return g; }
function bookshelf(w = 1.4, h = 1.8) { const g = new THREE.Group(); const d = .34;
  for (const x of [-w/2, w/2]) { const s = rbox(.06, h, d, .015, M.woodDark); s.position.set(x, h/2, 0); g.add(s); }
  const cols = [0xD9634A, 0xE9B44C, 0x5B8FB9, 0x7DB07A, 0xC5785B, 0xF0D9B5, 0x9C6FB0, 0x4E7A6A];
  for (let k = 0; k < 4; k++) { const y = .04 + k*h/4; const b = rbox(w, .05, d, .015, M.woodDark); b.position.set(0, y, 0); g.add(b);
    if (k < 4) { let x = -w/2 + .08; while (x < w/2 - .12) { const bw = .05 + rnd()*.05, bh = .22 + rnd()*.16; if (rnd() < .12) { x += .1; continue; } const bk = rbox(bw, bh, .24, .01, clay(cols[Math.floor(rnd()*cols.length)], .8)); bk.position.set(x + bw/2, y + .025 + bh/2, 0); if (rnd() < .1) bk.rotation.z = .2; g.add(bk); x += bw + .008; } } }
  const top = rbox(w + .06, .05, d + .02, .015, M.woodDark); top.position.y = h; g.add(top); return g; }
function floorLamp() { const g = new THREE.Group(); const base = mesh(new THREE.CylinderGeometry(.16, .18, .04, 24), M.dark); base.position.y = .02; g.add(base);
  const pole = mesh(new THREE.CylinderGeometry(.018, .018, 1.5, 8), M.dark); pole.position.y = .77; g.add(pole);
  const shadeM = new THREE.MeshStandardMaterial({color: 0xFFE9C4, emissive: 0xFFB45A, emissiveIntensity: .9, roughness: .8, side: THREE.DoubleSide});
  const sh = mesh(new THREE.CylinderGeometry(.16, .26, .3, 24, 1, true), shadeM, false); sh.position.y = 1.55; g.add(sh);
  const L = new THREE.PointLight(0xFFB869, 1.2, 4.5, 1.6); L.position.y = 1.5; g.add(L); return g; }
function windowFrame(w = 1.1, h = 1.3, glowCol = 0xFFD8A0) { const g = new THREE.Group();
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({map: cvs(256, 256, (c, W, H) => { const gr = c.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#FFC98A'); gr.addColorStop(.6, '#FFE3B5'); gr.addColorStop(1, '#F6B98A'); c.fillStyle = gr; c.fillRect(0, 0, W, H); c.fillStyle = 'rgba(120,150,110,.55)'; for (let i = 0; i < 9; i++) { c.beginPath(); c.arc(i*32, H*.92, 30 + (i % 3)*10, 0, Math.PI*2); c.fill(); } })})); g.add(sky);
  const fm = M.woodLight; for (const [x, y, ww, hh] of [[0, h/2, w + .12, .07], [0, -h/2, w + .16, .08], [-w/2, 0, .07, h + .1], [w/2, 0, .07, h + .1], [0, 0, .04, h], [0, 0, w, .04]]) { const b = rbox(ww, hh, .08, .015, fm); b.position.set(x, y, .03); g.add(b); }
  const sill = rbox(w + .3, .05, .2, .015, fm); sill.position.set(0, -h/2 - .05, .08); g.add(sill); return g; }
function desk(w = 1.6) { const g = new THREE.Group(); const top = rbox(w, .07, .8, .02, M.wood); top.position.y = .74; g.add(top);
  for (const [x, z] of [[-w/2 + .08, -.32], [w/2 - .08, -.32], [-w/2 + .08, .32], [w/2 - .08, .32]]) { const l = mesh(new THREE.CylinderGeometry(.03, .025, .72, 10), M.woodDark); l.position.set(x, .36, z); g.add(l); } return g; }
function laptop(screenTex) { const g = new THREE.Group(); const base = rbox(.5, .025, .34, .01, clay(0xD7D9DC, .4)); base.position.y = .0125; g.add(base);
  const lid = new THREE.Group(); lid.position.set(0, .02, -.17); lid.rotation.x = -.25; g.add(lid); const sc = rbox(.5, .34, .02, .01, clay(0xD7D9DC, .4)); sc.position.set(0, .17, 0); lid.add(sc);
  const disp = new THREE.Mesh(new THREE.PlaneGeometry(.46, .3), new THREE.MeshBasicMaterial({map: screenTex})); disp.position.set(0, .17, .0115); lid.add(disp); g.userData.lid = lid; return g; }
function mug() { const g = new THREE.Group(); const c = mesh(new THREE.CylinderGeometry(.05, .045, .11, 18), clay(0xE8964B, .5)); c.position.y = .055; g.add(c); const h = mesh(new THREE.TorusGeometry(.03, .01, 8, 16), clay(0xE8964B, .5)); h.position.set(.055, .06, 0); g.add(h); return g; }
// door with pivot; returns {g, leaf}
function door(w = .95, h = 2.05, col = 0xC98F5E) { const g = new THREE.Group(); const fm = M.woodDark;
  for (const [x, y, ww, hh] of [[-w/2 - .05, h/2, .1, h + .1], [w/2 + .05, h/2, .1, h + .1], [0, h + .05, w + .2, .1]]) { const b = rbox(ww, hh, .14, .02, fm); b.position.set(x, y, 0); g.add(b); }
  const back = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({color: 0x2A1A12})); back.position.set(0, h/2, -.06); g.add(back);
  const pivot = new THREE.Group(); pivot.position.set(-w/2, 0, .0); g.add(pivot);
  const leaf = rbox(w - .02, h - .02, .06, .02, clay(col, .7, .004)); leaf.position.set(w/2, h/2, 0); pivot.add(leaf);
  for (const [y, hh] of [[h*.7, h*.36], [h*.26, h*.36]]) { const p = rbox(w*.66, hh, .02, .015, clay(shade('#' + col.toString(16).padStart(6, '0'), .88) === '' ? col : col - 0x0A0A08, .7)); p.position.set(w/2, y, .035); pivot.add(p); }
  const knob = mesh(new THREE.SphereGeometry(.04, 16, 12), M.chrome); knob.position.set(w - .1, h*.48, .06); pivot.add(knob);
  return {g, pivot}; }
function wallLamp() { const g = new THREE.Group(); const b = mesh(new THREE.CylinderGeometry(.03, .03, .12, 10), M.dark); b.rotation.x = Math.PI/2; b.position.z = .06; g.add(b);
  const bulbM = new THREE.MeshStandardMaterial({color: 0xFFF1D6, emissive: 0xFFC36A, emissiveIntensity: 0, roughness: .4}); const bulb = mesh(new THREE.SphereGeometry(.09, 20, 14), bulbM, false); bulb.position.set(0, -.04, .14); g.add(bulb);
  const L = new THREE.PointLight(0xFFB050, 0, 3.5, 1.8); L.position.set(0, -.1, .3); g.add(L); g.userData = {bulbM, L}; return g; }
function basket(withItems = true) { const g = new THREE.Group(); const b = rbox(.36, .16, .24, .05, clay(0xD39A5E, .85)); b.position.y = .08; g.add(b);
  const hd = mesh(new THREE.TorusGeometry(.15, .015, 8, 24, Math.PI), clay(0xB07A44, .85)); hd.position.y = .16; g.add(hd);
  if (withItems) { const bt = rbox(.08, .2, .08, .025, clay(0x7CC4E8, .5)); bt.position.set(-.09, .22, 0); g.add(bt); const cap = mesh(new THREE.CylinderGeometry(.025, .025, .04, 10), M.white); cap.position.set(-.09, .34, 0); g.add(cap);
    const bt2 = rbox(.07, .16, .07, .025, clay(0xF59BB0, .5)); bt2.position.set(.02, .2, .02); g.add(bt2);
    const tw_ = rbox(.14, .07, .2, .03, clay(0xFFF3DC, .95)); tw_.position.set(.1, .17, 0); g.add(tw_); const st = rbox(.141, .02, .2, .005, clay(0xE8964B, .9)); st.position.set(.1, .17, 0); g.add(st); }
  return g; }
function phone() { const g = new THREE.Group(); g.scale.setScalar(1.45); const b = rbox(.09, .16, .015, .012, clay(0x2A2523, .4)); g.add(b); const s = new THREE.Mesh(new THREE.PlaneGeometry(.075, .135), new THREE.MeshStandardMaterial({color: 0xFFE2B8, emissive: 0xFFC890, emissiveIntensity: .6})); s.position.z = .009; g.add(s); return g; }
function towelOnHead() { const g = new THREE.Group(); const m = clay(0xFFF3DC, .95); const t = mesh(new THREE.SphereGeometry(.22, 20, 12, 0, Math.PI*2, 0, Math.PI/2), m); t.scale.set(1.3, .55, 1.15); g.add(t); const tw_ = mesh(new THREE.TorusGeometry(.08, .04, 10, 20), m); tw_.position.set(.2, .1, 0); tw_.rotation.y = .5; g.add(tw_); const s = mesh(new THREE.TorusGeometry(.26, .012, 6, 30), clay(0xE8964B, .9)); s.rotation.x = Math.PI/2; s.scale.set(1.15, 1, 1); s.position.y = .03; g.add(s); return g; }
function flag() { const g = new THREE.Group(); const p = mesh(new THREE.CylinderGeometry(.012, .012, .7, 8), M.woodDark); p.position.y = .35; g.add(p); const f = new THREE.Mesh(new THREE.PlaneGeometry(.3, .2), new THREE.MeshStandardMaterial({map: cvs(256, 170, (c, W, H) => { c.fillStyle = '#F2B544'; c.fillRect(0, 0, W, H); c.fillStyle = '#7A3E1E'; c.font = '90px huninn'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('山友', W/2, H/2 + 4); }), side: THREE.DoubleSide, roughness: .8})); f.position.set(.16, .58, 0); g.add(f); return g; }
function clipboard() { const g = new THREE.Group(); const b = rbox(.2, .26, .015, .015, M.woodLight); g.add(b); const p = new THREE.Mesh(new THREE.PlaneGeometry(.17, .2), new THREE.MeshStandardMaterial({map: cvs(128, 160, (c, W, H) => { c.fillStyle = '#FFFDF6'; c.fillRect(0, 0, W, H); c.strokeStyle = '#B9AFA0'; c.lineWidth = 3; for (let y = 30; y < H; y += 22) { c.beginPath(); c.moveTo(14, y); c.lineTo(W - 14, y); c.stroke(); } })})); p.position.set(0, -.01, .009); g.add(p); const clip = rbox(.08, .03, .02, .008, M.chrome); clip.position.set(0, .12, .01); g.add(clip); return g; }
// ---------- lighting helpers ----------
function warmLights(scene, opt = {}) {
  const hemi = new THREE.HemisphereLight(opt.sky || 0xFFE9CF, opt.ground || 0x6B4632, opt.hemi == null ? 1.0 : opt.hemi); scene.add(hemi);
  const sun = new THREE.DirectionalLight(opt.sunCol || 0xFFD3A0, opt.sun == null ? 2.4 : opt.sun); const sp = opt.sunPos || [-3, 5, 4]; sun.position.set(...sp); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048); const r = opt.shadowR || 5; Object.assign(sun.shadow.camera, {left: -r, right: r, top: r, bottom: -r, near: .5, far: 30}); sun.shadow.radius = 5; sun.shadow.bias = -.0004; sun.shadow.normalBias = .02;
  if (opt.target) sun.target.position.set(...opt.target); scene.add(sun); scene.add(sun.target);
  return {hemi, sun};
}
