// ===== 書房：開頭（2-01 標題、2-02 校門照片）與結尾木牌 =====
// 第七版（使用者 11/14 19:02）：頭尾跟出隊必修 1 一致——同一間書房、同樣的鏡頭、木牌（含掛勾）、
// 開頭標題那句不打字幕；結尾是「祝大家／出隊順利！」木牌，不講話，最後淡出。
function buildRoom2(mode) {
  const sec = SEC[mode], L = id => sec.lines.find(l => l.id === id);
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x2B1B12);
  const cam = new THREE.PerspectiveCamera(38, 16/9, .1, 60);
  warmLights(scene, {sunPos: [-3.5, 5.5, 4.5], sun: 2.2, hemi: 1.05, shadowR: 4.5});
  const floor = mesh(new THREE.PlaneGeometry(12, 8), new THREE.MeshStandardMaterial({map: woodTex('#B8784C', 8, [3, 2]), roughness: .75})); floor.rotation.x = -Math.PI/2; floor.position.z = 1; scene.add(floor);
  const rug = mesh(new THREE.CircleGeometry(1.25, 48), new THREE.MeshStandardMaterial({map: cvs(512, 512, (g, W, H) => { const cs = ['#E7A15B', '#F3D3A0', '#D9774E', '#F3D3A0', '#E7A15B', '#C9653F']; cs.forEach((c, i) => { g.fillStyle = c; g.beginPath(); g.arc(W/2, H/2, W/2*(1 - i*.15), 0, Math.PI*2); g.fill(); }); }), roughness: 1}));
  rug.rotation.x = -Math.PI/2; rug.position.set(0, .006, .55); rug.scale.set(1.35, 1, 1); scene.add(rug);
  const wall = mesh(new THREE.PlaneGeometry(12, 5), new THREE.MeshStandardMaterial({map: plasterTex('#F0C495', 'rgba(255,255,255,.12)', [5, 2]), roughness: .95})); wall.position.set(0, 2.5, -1.4); scene.add(wall);
  const wain = mesh(new THREE.PlaneGeometry(12, .9), new THREE.MeshStandardMaterial({map: woodTex('#9A5E38', 1, [1, 1]), roughness: .8})); wain.position.set(0, .45, -1.39); scene.add(wain);
  const rail = rbox(12, .06, .06, .02, M.woodDark); rail.position.set(0, .92, -1.37); scene.add(rail);
  const win_ = windowFrame(1.05, 1.15); win_.position.set(-2.35, 1.95, -1.36); scene.add(win_);
  const shelf = bookshelf(1.3, 1.85); shelf.position.set(2.45, 0, -1.18); scene.add(shelf);
  const pl = plant(1.3); pl.position.set(-1.45, 0, -.95); scene.add(pl);
  const lamp = floorLamp(); lamp.position.set(1.45, 0, -1.0); scene.add(lamp);
  // 木牌（和必修 1 同一個做法：兩條吊繩＋兩顆掛勾）
  const TXT = mode === 'room1' ? [{text: '出隊必修 2', size: 74, y: 150, col: '#FFE2B0'}, {text: '環境介紹', size: 210, y: 330}]
                               : [{text: '祝大家', size: 120, y: 160, col: '#FFE2B0'}, {text: '出隊順利！', size: 180, y: 350}];
  const board = new THREE.Group(); { const w = 2.6, h = 1.08; board.add(rbox(w + .1, h + .1, .09, .035, M.woodDark));
    const face = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({map: boardTex(TXT, 1280, Math.round(1280*h/w)), roughness: .8})); face.position.z = .047; board.add(face);
    for (const s of [-1, 1]) { const r = mesh(new THREE.CylinderGeometry(.012, .012, 3.2, 6), M.rope); r.position.set(s*(w/2 - .3), h/2 + 1.6, 0); board.add(r);
      const k = mesh(new THREE.SphereGeometry(.035, 10, 8), M.chrome); k.position.set(s*(w/2 - .3), h/2 + .02, .03); board.add(k); }
    scene.add(board); }
  const A0 = mode === 'room1' ? .25 : .1;          // 木牌開始掉下來的時間
  const T2 = mode === 'room1' ? L('2-02').start : 99;
  // 鏡頭是對著必修 1 v9 的開頭畫面擬合出來的（1.2、2.0、3.0 秒三格）
  const CAM = {p0: [.12, 1.9, 6.03], p1: [-.03, 1.9, 5.645], l: [0, 1.95, 0], d: 3.5, dEnd: 4.5};
  function update(t) {
    const down = spring(t, A0, 1.1, 3.2); board.position.set(0, 2.25 + (1 - down)*3.2, -.7); board.rotation.z = Math.sin((t - A0)*5.5)*.05*Math.exp(-Math.max(0, t - A0)*1.8);
    const C = window.__CAMK || CAM, u = fade(t, 0, mode === 'room1' ? C.d : (C.dEnd || 4.5));
    cam.position.set(lerp(C.p0[0], C.p1[0], u), lerp(C.p0[1], C.p1[1], u), lerp(C.p0[2], C.p1[2], u)); cam.lookAt(C.l[0], C.l[1], C.l[2]);
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
