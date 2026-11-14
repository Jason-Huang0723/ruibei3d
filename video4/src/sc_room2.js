// ===== 書房：開頭（2-01 標題、2-02 校門照片）與結尾（2-32） =====
function buildRoom2(mode) {
  const sec = SEC[mode], L = id => sec.lines.find(l => l.id === id);
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x2B1B12);
  const cam = new THREE.PerspectiveCamera(38, 16/9, .1, 60);
  warmLights(scene, {sunPos: [-3.5, 5.5, 4.5], sun: 2.2, hemi: 1.05, shadowR: 4.5});
  const floor = mesh(new THREE.PlaneGeometry(12, 8), new THREE.MeshStandardMaterial({map: woodTex('#B8784C', 8, [3, 2]), roughness: .75})); floor.rotation.x = -Math.PI/2; floor.position.z = 1; scene.add(floor);
  const rug = mesh(new THREE.CircleGeometry(1.25, 48), new THREE.MeshStandardMaterial({map: cvs(512, 512, (g, W, H) => { const cs = ['#E7A15B', '#F3D3A0', '#D9774E', '#F3D3A0', '#E7A15B', '#C9653F']; cs.forEach((c, i) => { g.fillStyle = c; g.beginPath(); g.arc(W/2, H/2, W/2*(1 - i*.15), 0, Math.PI*2); g.fill(); }); }), roughness: .95}), false);
  rug.rotation.x = -Math.PI/2; rug.position.set(0, .006, .55); rug.scale.set(1.35, 1, 1); scene.add(rug);
  const wall = mesh(new THREE.PlaneGeometry(12, 5), new THREE.MeshStandardMaterial({map: plasterTex(mode === 'room1' ? '#F0C495' : '#F2D08A', 'rgba(255,255,255,.12)', [5, 2]), roughness: .95})); wall.position.set(0, 2.5, -1.4); scene.add(wall);
  const wain = mesh(new THREE.PlaneGeometry(12, .9), new THREE.MeshStandardMaterial({map: woodTex('#9A5E38', 1, [1, 1]), roughness: .8})); wain.position.set(0, .45, -1.39); scene.add(wain);
  const rail = rbox(12, .06, .06, .02, M.woodDark); rail.position.set(0, .92, -1.37); scene.add(rail);
  const win_ = windowFrame(1.05, 1.15); win_.position.set(-2.35, 1.95, -1.36); scene.add(win_);
  const shelf = bookshelf(1.3, 1.85); shelf.position.set(2.45, 0, -1.18); scene.add(shelf);
  const pl = plant(1.3); pl.position.set(-1.45, 0, -.95); scene.add(pl);
  const lamp = floorLamp(); lamp.position.set(1.45, 0, -1.0); scene.add(lamp);
  const clk = makeClock(.3, 0xF2A65A); clk.position.set(-.95, 2.12, -1.36); scene.add(clk);
  const TXT = mode === 'room1' ? [{text: '出隊必修 2', size: 74, y: 150, col: '#FFE2B0'}, {text: '環境介紹', size: 210, y: 330}] : [{text: '瑞北國小・環境介紹', size: 70, y: 150, col: '#FFE2B0'}, {text: '出隊見！', size: 210, y: 330}];
  const board = new THREE.Group(); { const w = 2.6, h = 1.08; const back = rbox(w + .1, h + .1, .09, .035, M.woodDark); board.add(back);
    const face = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({map: boardTex(TXT, 1280, Math.round(1280*h/w)), roughness: .8})); face.position.z = .047; board.add(face);
    for (const s of [-1, 1]) { const r = mesh(new THREE.CylinderGeometry(.012, .012, 3.2, 6), M.rope); r.position.set(s*(w/2 - .3), h/2 + 1.6, 0); board.add(r); } scene.add(board); }
  const hero = makeMascot(); scene.add(hero);
  // 結尾：再多兩個小朋友一起揮手
  const kids = mode === 'room2' ? [[-.75, .55, .58], [1.05, .62, .5]].map(([x, z, s]) => { const k = makeMascot({scale: s}); k.position.set(x, 0, z); scene.add(k); return k; }) : [];
  const T2 = mode === 'room1' ? L('2-02').start : 99;
  function update(t) {
    const down = spring(t, .25, 1.1, 3.2); board.position.set(0, 2.25 + (1 - down)*3.2, -.7); board.rotation.z = Math.sin(t*5.5)*.05*Math.exp(-t*1.8);
    const u = fade(t, 0, 6); cam.position.set(lerp(.25, -.05, u), 1.35, lerp(6.5, 6.05, u)); cam.lookAt(0, 1.08, 0);
    const w = walker(t, [[0, 2.6, .3], [.15, 2.6, .3], [1.35, .15, .3]]); hero.position.set(w.x, 0, w.z); hero.rotation.y = w.walk > .1 ? -.7 : 0;
    let aR = null; if (t > 1.3 && t < 2.5) aR = {x: 0, z: 2.5 + Math.sin(t*16)*.3}; else if (t > 2.5) aR = {x: -.3, z: 2.2};
    if (mode === 'room2' && t > .9) aR = {x: 0, z: 2.5 + Math.sin(t*14)*.3};
    poseMascot(hero, {walk: w.walk, ph: w.ph, t, aR, face: t > 2.5 && mode === 'room1' ? 'n' : 'front', blink: blinkAt(t)});
    kids.forEach((k, i) => { k.rotation.y = i ? -.35 : .35; poseMascot(k, {t, aR: i ? null : {x: 0, z: 2.4 + Math.sin(t*15 + i)*.3}, aL: i ? {x: 0, z: 2.4 + Math.sin(t*13)*.3} : null, lift: hop(t % 1.6, .2 + i*.3, .4, .08), face: 'happy', blink: blinkAt(t, i + 2)}); });
  }
  function overlay(t) {
    let s = '';
    if (mode !== 'room1' || t < T2 - .3) return s;
    // 2-02：校門照片，從相框慢慢放大到全螢幕，接到 3D 校門口
    const o = fade(t, T2 - .3, .45), grow = ease(clamp((t - (sec.dur - 1.45))/1.25, 0, 1));
    s += `<rect width="1920" height="1080" fill="#1A0D06" opacity="${.55*o}"/>`;
    const AR = 2576/1313, w0 = 1320, h0 = w0/AR, sl = (1 - easeOut(o))*80;
    const W_ = lerp(w0, 1920*1.02, grow), H_ = W_/AR, cx = 960, cy = lerp(430 + sl, 540, grow);
    const kb = 1 + .04*clamp((t - T2)/4, 0, 1);
    const fr = 1 - grow, pad = 18*fr;
    s += `<g opacity="${o}"><rect x="${cx - W_/2 - pad}" y="${cy - H_/2 - pad}" width="${W_ + 2*pad}" height="${H_ + 2*pad + 70*fr}" fill="#FFF8EC" opacity="${fr}"/>`;
    s += `<clipPath id="gc"><rect x="${cx - W_/2}" y="${cy - H_/2}" width="${W_}" height="${H_}"/></clipPath><g clip-path="url(#gc)"><image href="assets/gate_sv.jpg" x="${cx - W_*kb/2}" y="${cy - H_*kb/2}" width="${W_*kb}" height="${H_*kb}" preserveAspectRatio="none"/></g>`;
    s += T(cx + W_/2 - 14, cy + H_/2 - 14, '影像：Google 街景', 20, '#fff', 'end', 500, 'stroke="#000" stroke-width="3" paint-order="stroke"');
    s += `<text x="${cx}" y="${cy + H_/2 + 52}" text-anchor="middle" font-family="huninn" font-size="42" fill="#7A4A2A" opacity="${fr}">瑞北國小　正門口</text></g>`;
    const c2 = L('2-02').clauses[1]; if (c2) { const k = win(t, c2.s - .25, sec.dur - 1.3, .35); s += TT(cx + 40, cy + H_/2 - 40, '遊覽車停這裡 ↓', 52, '#FFF6E6', 'middle', k*o); }
    return s;
  }
  return {scene, cam, update, overlay};
}
