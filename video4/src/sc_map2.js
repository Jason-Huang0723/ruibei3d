// ===== 校外：同一張空拍地圖（2-18 宿舍與雜貨店、2-22 早上接小朋友、2-25 回家路線） =====
// 地圖座標：當地公尺 (e 東, n 北)，原點 23.5255, 121.379；1 單位 = 10 公尺。整張圖轉成「上方≈西」（跟使用者畫路線的圖同方向）
async function buildMap2() {
  const sec = SEC.map, L = id => sec.lines.find(l => l.id === id), at = (id, k) => L(id).start + k*L(id).dur, E_ = id => L(id).start + L(id).dur;
  const MD = MAPD, PSI = MD.rot*Math.PI/180;
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x3B2A1C);
  const cam = new THREE.PerspectiveCamera(36, 16/9, .1, 3000);
  const lights = warmLights(scene, {sunPos: [-6, 20, 8], sun: 1.9, hemi: 1.25, shadowR: 12});
  const G = new THREE.Group(); G.rotation.y = PSI; scene.add(G);
  const loadTex = src => new Promise((res, rej) => new THREE.TextureLoader().load(src, t => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; res(t); }, undefined, rej));
  const [t16, t18, t20] = await Promise.all([loadTex('map/photo2_z16.jpg'), loadTex('map/z18_clean.jpg'), loadTex('map/z20_clean.jpg')]);
  // 第七版：地面幾張圖只差 0.02 單位高，拉遠時深度精度不夠會互相打架（畫面邊緣一直閃深色）→ 都不寫深度、用 renderOrder 固定先後
  const plane = (B, tex, y, alpha, ro) => { const w = (B.e1 - B.e0)/10, h = (B.n1 - B.n0)/10;
    const m = new THREE.MeshStandardMaterial({map: tex, roughness: 1, color: 0xFFFFFF, emissive: 0xFFFFFF, emissiveMap: tex, emissiveIntensity: .3, transparent: !!alpha, alphaMap: alpha || null, depthWrite: false});
    const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m); p.rotation.x = -Math.PI/2; p.position.set((B.e0 + B.e1)/20, y, -(B.n0 + B.n1)/20); p.receiveShadow = true; p.renderOrder = ro; G.add(p); return p; };
  const feather = cvs(256, 256, (g, W, H) => { g.fillStyle = '#000'; g.fillRect(0, 0, W, H); const m = 22; for (let i = 0; i < m; i++) { const v = Math.round(255*i/m); g.strokeStyle = `rgb(${v},${v},${v})`; g.strokeRect(i + .5, i + .5, W - 2*i - 1, H - 2*i - 1); } g.fillStyle = '#fff'; g.fillRect(m, m, W - 2*m, H - 2*m); });
  feather.colorSpace = THREE.NoColorSpace; plane(MD.B16, t16, -.02, null, -9); plane(MD.B18, t18, 0, feather, -12); plane(MD.B20, t20, .02, feather, -11);
  const under = mesh(new THREE.PlaneGeometry(900, 900), new THREE.MeshStandardMaterial({color: 0x4A3A28, roughness: 1}), false); under.rotation.x = -Math.PI/2; under.position.y = -.05; under.material.depthWrite = false; under.renderOrder = -10; scene.add(under);
  G.updateMatrixWorld(true);
  const WP = (e, n, y = 0) => G.localToWorld(new THREE.Vector3(e/10, y, -n/10));
  const P = MD.pins, CF = (u, v) => [-50.7 + u*.9715 - v*.2371, 50.6 - u*.2371 - v*.9715];
  // ---- 圖釘 ----
  const mkPin = col => { const g = new THREE.Group(); const m = clay(col, .5, .006); const head = mesh(new THREE.SphereGeometry(.2, 28, 18), m); head.position.y = .72; g.add(head);
    const cone = mesh(new THREE.ConeGeometry(.12, .6, 24), m); cone.rotation.x = Math.PI; cone.position.y = .38; g.add(cone); const dot = mesh(new THREE.SphereGeometry(.075, 16, 12), M.white); dot.position.set(0, .74, .16); g.add(dot); scene.add(g); return g; };
  const PINS = [
    {k: 'school', p: P.school, col: 0xE8873B, t: -1, name: '瑞北國小', sub: '', dy: 0},
    {k: 'male', p: P.male, col: 0x4F8ED8, t: at('2-19', .6), name: '男教師宿舍', sub: '', dy: 0},
    {k: 'female', p: P.female, col: 0xEE7A9B, t: L('2-20').start + .1, name: '女教師宿舍', sub: '', dy: 0},
    {k: 'shop', p: P.shop, col: 0xD9534F, t: at('2-22', .31), name: '雜貨店', sub: 'Google 地圖：林上商號', dy: 0}];
  PINS.forEach(Q => { Q.g = mkPin(Q.col); const w = WP(...Q.p); Q.g.position.copy(w); Q.w = w; });
  // ---- 走路路線（學校 → 雜貨店），用累積距離對時間 ----
  const WK = MD.walk, CUM = [0]; for (let i = 1; i < WK.length; i++) CUM.push(CUM[i - 1] + Math.hypot(WK[i][0] - WK[i - 1][0], WK[i][1] - WK[i - 1][1]));
  const LEN = CUM[CUM.length - 1];
  const near = q => { let b = 0, d = 1e9; WK.forEach((p, i) => { const dd = Math.hypot(p[0] - q[0], p[1] - q[1]); if (dd < d) { d = dd; b = i; } }); return CUM[b]; };
  const sMale = near(P.male), sFem = near(P.female), sBr = near(P.bridge);
  const ptAt = s => { s = clamp(s, 0, LEN); let i = 1; while (i < CUM.length - 1 && CUM[i] < s) i++; const u = (s - CUM[i - 1])/((CUM[i] - CUM[i - 1]) || 1); return [lerp(WK[i - 1][0], WK[i][0], u), lerp(WK[i - 1][1], WK[i][1], u)]; };
  const sKeys = [[.3, 0], [at('2-19', .62), sMale], [L('2-20').start + .5, sFem], [L('2-22').start + .1, sFem], [at('2-22', .17), sBr], [at('2-22', .34), LEN]];
  const sAt = t => kf(t, sKeys, u => u*u*(3 - 2*u)*.5 + u*.5);
  const hero = makeMascot(); hero.scale.setScalar(1.15); scene.add(hero);
  const place = (m, e, n, t, prev) => { const w = WP(e, n); m.position.copy(w); return w; };
  const faceDir = (m, a, b) => { const v = b.clone().sub(a); if (v.lengthSq() > 1e-6) m.rotation.y = Math.atan2(v.x, v.z); };
  // ---- 早上：小朋友（同一個綠色，小一號）、接人的哥姐 ----
  const kidsN = 6, kids = [], KS = [];
  const sp = P.shop, spot = i => { const a = i/kidsN*Math.PI*2; return [sp[0] + 8*Math.cos(a) - 2, sp[1] + 7*Math.sin(a) - 11]; };
  const fromP = [[sp[0] - 2, sp[1] + 38], [sp[0] - 40, sp[1] - 12], [sp[0] + 34, sp[1] - 16], [sp[0] - 4, sp[1] + 46], [sp[0] - 48, sp[1] - 10], [sp[0] + 42, sp[1] - 18]];
  for (let i = 0; i < kidsN; i++) { const k = makeMascot({scale: .6}); k.scale.setScalar(1.1); scene.add(k); kids.push(k); }
  const sibs = [makeMascot(), makeMascot({cap: true})]; sibs.forEach(m => { m.scale.setScalar(1.05); scene.add(m); });
  const fl = flag(); sibs[0].userData.hands && sibs[0].userData.hands[1] ? sibs[0].userData.hands[1].add(fl) : sibs[0].add(fl); fl.scale.setScalar(1.3);
  const T22 = L('2-23').start, T23 = L('2-24').start, T24 = L('2-25').start;
  const tGo = at('2-24', .55), tArr = at('2-24', .74), tBack = at('2-24', .8), tHome = T24 + 1.6;
  // 哥姐：學校 → 雜貨店（沿走路路線），再一起走回學校
  const sibS = t => t < tArr ? kf(t, [[tGo, 0], [tArr, LEN - 4]]) : kf(t, [[tBack, LEN - 4], [tHome, 0]]);
  // ---- 回家路線（SVG 畫線，鏡頭投影） ----
  const RT = {common: WK, up: MD.up, red: MD.red, green: MD.green};
  const RCOL = {common: '#FFF3DC', up: '#4FA2FF', red: '#FF5B4A', green: '#7BDD3A'};
  const T27 = L('2-27').start, T28 = L('2-28').start, T29 = L('2-29').start, T30 = L('2-30').start, T31 = L('2-31').start;
  const RK = {common: [T27 + .2, T27 + 2.4], up: [T28 + .3, T28 + 2.0], red: [T29 + .2, T29 + 3.0], green: [T30 + .2, T30 + 4.6]};
  const spurI = (() => { let b = 0, d = 1e9; MD.green.forEach((p, i) => { const dd = Math.hypot(p[0] - MD.spurEnd[0], p[1] - MD.spurEnd[1]); if (dd < d) { d = dd; b = i; } }); return b; })();
  const tSpur = lerp(RK.green[0], RK.green[1], spurI/(MD.green.length - 1));
  // ---- 鏡頭 ----
  // [時間, 目標 e, 目標 n, 高度(單位), 傾斜]
  const bb = (() => { let e0 = 1e9, e1 = -1e9, n0 = 1e9, n1 = -1e9; for (const p of MD.red.concat(MD.green)) { e0 = Math.min(e0, p[0]); e1 = Math.max(e1, p[0]); n0 = Math.min(n0, p[1]); n1 = Math.max(n1, p[1]); } return {e: (e0 + e1)/2, n: (n0 + n1)/2}; })();
  const mid = [(P.gate[0] + P.shop[0])/2, (P.gate[1] + P.shop[1])/2], NB = CF(55, 10);
  const camK = [
    [0, P.gate[0] + 6, P.gate[1] + 10, 11, .55], [at('2-19', .62), P.male[0] + 6, P.male[1] - 6, 11.5, .55], [L('2-21').start, (P.male[0] + P.female[0])/2, (P.male[1] + P.female[1])/2 - 4, 11.5, .55],
    [at('2-22', .3), P.bridge[0] + 6, P.bridge[1], 12, .55], [E_('2-22'), P.shop[0] + 8, P.shop[1] - 4, 11, .55],
    [at('2-23', .6), P.shop[0] + 6, P.shop[1] - 8, 11, .55], [at('2-24', .45), mid[0] + 4, mid[1], 24, .3], [at('2-24', .9), mid[0] + 4, mid[1], 24, .3],
    [T24 + .9, NB[0] + 8, NB[1], 19, .32], [E_('2-25') + .3, NB[0] + 8, NB[1], 18.5, .32],
    [at('2-26', .18), mid[0] - 20, mid[1] + 10, 40, .25], [at('2-26', .5), bb.e + 200, bb.n + 160, 165, .12], [E_('2-26'), bb.e + 200, bb.n + 160, 162, .12],
    [T27 + .5, mid[0] + 4, mid[1], 32, .2], [T27 + 2.6, mid[0] + 4, mid[1], 31, .2],
    [T28 + .7, P.shop[0] - 120, P.shop[1] + 10, 45, .15], [T28 + 2.4, P.shop[0] - 125, P.shop[1] + 10, 44, .15],
    [T29 + .6, bb.e + 200, bb.n + 160, 165, .12], [E_('2-30') + .3, bb.e + 200, bb.n + 160, 160, .12], [T31 + 1.0, P.school[0] + 15, P.school[1] + 20, 40, .2], [sec.dur, P.school[0] + 15, P.school[1] + 20, 38, .2]];
  const camAt = t => { const c = kv(t, camK.map(k => [k[0], k.slice(1)]), u => u*u*(3 - 2*u)); return c; };
  const _t = new THREE.Vector3();
  function setCam(t) {
    let [e, n, h, tilt] = camAt(t);
    // 宿舍、雜貨店那段鏡頭跟著小人
    if (t < E_('2-22') + .3) { const q = ptAt(sAt(t)), q2 = ptAt(sAt(t + .6)), f = 1 - fade(t, E_('2-22') - .8, 1.1); e = lerp(e, (q[0] + q2[0])/2 + 4, f*.65); n = lerp(n, (q[1] + q2[1])/2 - 4, f*.65); }
    // 早上：跟著接小朋友的哥姐
    if (t > tGo - .6 && t < tHome + .6) { const q = ptAt(sibS(t)), f = win(t, tGo - .6, tHome + .6, .9); e = lerp(e, q[0] + 5, f*.7); n = lerp(n, q[1], f*.7); h = lerp(h, 16, f*.8); tilt = lerp(tilt, .4, f); }
    const T_ = WP(e, n); cam.position.set(T_.x, h, T_.z + h*tilt*1.9); cam.lookAt(T_.x, 0, T_.z - h*tilt*.15);
    const s = lights.sun, r = clamp(h*1.2, 8, 300); s.position.set(T_.x - 6, 40, T_.z + 16); s.target.position.set(T_.x, 0, T_.z); s.target.updateMatrixWorld();
    const sc = s.shadow.camera; if (sc.right !== r) { sc.left = -r; sc.right = r; sc.top = r; sc.bottom = -r; sc.far = 200; sc.updateProjectionMatrix(); }
    return h;
  }
  let H = 11;
  function update(t) {
    H = setCam(t);
    const ps = clamp(H/11, 1, 6)*1.4;
    PINS.forEach(Q => { const k = Q.t < 0 ? 1 : spring(t, Q.t, 1.6, 4.2); Q.g.visible = (Q.t < 0 || t > Q.t - .05) && !((Q.k === 'male' || Q.k === 'female') && t > at('2-26', .1)); Q.g.position.y = (1 - k)*2.2*ps; Q.g.scale.setScalar((Q.t < 0 || t > Q.t) ? ps : .01); Q.g.rotation.y = Math.sin(t*1.2 + Q.p[0])*.25; });
    // 走路的小人
    const s = sAt(t), q = ptAt(s), q2 = ptAt(s + .5), walking = sAt(t + 1/30) - s > .02;
    hero.visible = t < E_('2-22') + .6; const hw = place(hero, ...q); faceDir(hero, hw, WP(...q2));
    if (!walking) hero.rotation.y = Math.PI*.9;
    poseMascot(hero, {walk: walking ? 1 : 0, ph: t*12, t, face: walking ? 'n' : 'front', blink: blinkAt(t), aR: !walking && t > E_('2-22') - 1 ? {x: 0, z: 2.4 + Math.sin(t*14)*.3} : null});
    // 早上
    const kidsOn = t > T22 - .3 && t < tHome + .4;
    kids.forEach((k, i) => { k.visible = kidsOn; if (!kidsOn) return;
      let pos, mv;
      if (t < tBack) { const u = clamp((t - T22 - i*.12)/2.4, 0, 1), a = fromP[i], b = spot(i); pos = [lerp(a[0], b[0], ease(u)), lerp(a[1], b[1], ease(u))]; mv = u > 0 && u < 1; const w = place(k, ...pos); if (mv) faceDir(k, w, WP(...b)); else k.rotation.y = Math.PI*.9 + Math.sin(t*2 + i)*.3; }
      else { const ss = sibS(t) + 3 + i*1.6, a = ptAt(ss), b = ptAt(ss - .6); const w = place(k, ...a); faceDir(k, w, WP(...b)); mv = true; }
      poseMascot(k, {walk: mv ? 1 : 0, ph: t*14 + i, t, face: mv ? 'n' : 'happy', lift: mv ? 0 : hop((t + i*.37) % 1.4, .3, .35, .08), blink: blinkAt(t, i + 1)}); });
    sibs.forEach((m, i) => { const on = t > tGo - .3 && t < tHome + .4; m.visible = on; if (!on) return; const ss = sibS(t) - i*2.2, a = ptAt(ss), dir = t < tArr ? 1 : -1, b = ptAt(ss + dir*.6), w = place(m, ...a);
      const mv = (t > tGo && t < tArr) || (t > tBack && t < tHome); if (mv) faceDir(m, w, WP(...b)); else m.rotation.y = Math.PI*.9;
      poseMascot(m, {walk: mv ? 1 : 0, ph: t*12 + i*2, t, aR: i === 0 ? {x: -.4, z: 1.6} : (!mv && t > tArr ? {x: 0, z: 2.4 + Math.sin(t*14)*.3} : null), face: mv ? 'n' : 'front', blink: blinkAt(t, i + 7)}); });
  }
  // ---- 疊字 ----
  const sx = (e, n, y = 0) => scr(cam, ...WP(e, n, y).toArray());
  // 畫路線：投影到螢幕後，可以往法線方向平移幾個像素（紅、綠並排才看得出是兩條）
  // off 可以是數字或 i => 偏移（第七版之後：八鄰進社區那段去回要疊成同一條線，不偏移）
  const path = (pts, k, off = 0) => { const n = Math.min(pts.length, Math.max(2, Math.ceil(pts.length*k))); const P = []; for (let i = 0; i < n; i++) P.push(sx(...pts[i]));
    let d = ''; for (let i = 0; i < n; i++) { let [x, y] = P[i]; const o = typeof off === 'function' ? off(i) : off; if (o) { const a = P[Math.max(0, i - 2)], b = P[Math.min(n - 1, i + 2)], tx = b[0] - a[0], ty = b[1] - a[1], L = Math.hypot(tx, ty) || 1; x += -ty/L*o; y += tx/L*o; } d += (i ? 'L' : 'M') + x.toFixed(1) + ',' + y.toFixed(1); } return d; };
  // 綠線離開紅線（彎進八鄰社區、原路折返）的點：偏移漸變成 0
  const GOFF = (() => { const far = MD.green.map(p => { let m = 1e9; for (const q of MD.red) { const d = (p[0] - q[0])**2 + (p[1] - q[1])**2; if (d < m) m = d; } return Math.sqrt(m) > 6; });
    const idx = far.map((f, i) => f ? i : -1).filter(i => i >= 0); return MD.green.map((p, i) => { let k = 1e9; for (const j of idx) k = Math.min(k, Math.abs(i - j)); return 3.6*clamp(k/10, 0, 1); }); })();
  const POL = (x, y, src, name, op, r, w = 380) => { if (op <= 0) return ''; const h = w*692/568, sl = (1 - easeOut(op))*80;
    return `<g opacity="${op}" transform="translate(${x},${y + sl}) rotate(${r})"><rect x="${-w/2 - 4}" y="${-h/2 + 10}" width="${w + 28}" height="${h + 88}" fill="#1a0d06" opacity=".35" filter="url(#soft)"/><rect x="${-w/2 - 14}" y="${-h/2 - 14}" width="${w + 28}" height="${h + 84}" fill="#FFF8EC"/>
      <image href="${src}" x="${-w/2}" y="${-h/2}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice"/>${T(w/2 - 8, h/2 - 10, '影像：Google 街景', 16, '#fff', 'end', 500, 'stroke="#000" stroke-width="3" paint-order="stroke"')}
      <text x="0" y="${h/2 + 50}" text-anchor="middle" font-family="huninn" font-size="40" fill="#7A4A2A">${name}</text></g>`; };
  const shower = (x, y, s, op) => op <= 0 ? '' : `<g transform="translate(${x},${y}) scale(${s})" opacity="${op}" stroke="#2A160B" stroke-width="3" stroke-linecap="round"><path d="M-6,-26 v10 M-22,-16 h32 a12,12 0 0 1 -32,0 z" fill="#FFE9C4"/>${[-16, -6, 4].map((dx, i) => `<line x1="${dx}" y1="${2 + i%2*3}" x2="${dx - 4}" y2="${16 + i%2*3}" stroke="#7FC8F0" stroke-width="5"/>`).join('')}</g>`;
  const clockI = (x, y, r, hh, mm) => { const a1 = (hh%12 + mm/60)/12*Math.PI*2, a2 = mm/60*Math.PI*2; return `<g transform="translate(${x},${y})"><circle r="${r}" fill="#FFF6E6" stroke="#2A160B" stroke-width="4"/><line x2="${Math.sin(a1)*r*.5}" y2="${-Math.cos(a1)*r*.5}" stroke="#2A160B" stroke-width="5" stroke-linecap="round"/><line x2="${Math.sin(a2)*r*.75}" y2="${-Math.cos(a2)*r*.75}" stroke="#D9774E" stroke-width="4" stroke-linecap="round"/><circle r="4" fill="#2A160B"/></g>`; };
  function overlay(t) {
    let s = '';
    // 走過的路：奶油色小圓點
    if (t < E_('2-22') + .8) { const sNow = sAt(t), o = 1 - fade(t, E_('2-22') + .2, .5); let dots = ''; for (let d = 1; d < sNow - 1.5; d += 3.2) { const [x, y] = sx(...ptAt(d), .05); dots += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="6" fill="#FFF3DC" stroke="#3A2216" stroke-width="2.5"/>`; } s += `<g opacity="${o}">${dots}</g>`; }
    // 圖釘名稱
    PINS.forEach(Q => { if (Q.t >= 0 && t < Q.t + .15) return; let o = Q.t < 0 ? 1 : fade(t, Q.t + .15, .35); if (Q.k !== 'school' && Q.k !== 'shop') o *= 1 - fade(t, at('2-26', .12), .5); if (o <= 0) return;
      const [x, y] = scrObj(cam, Q.g, 1.05*Q.g.scale.x); o *= 1 - clamp((y - 830)/40, 0, 1); if (o <= 0) return; s += TT(x, y - 30, Q.name, 46, '#FFF6E6', 'middle', o); if (Q.sub) s += TT(x, y + 10, Q.sub, 30, '#FFE0B8', 'middle', o*fade(t, at('2-22', .5), .35)); });
    // 校門、台9線、火車橋
    { const o = win(t, .3, at('2-19', .55), .3); if (o > 0) { const [x, y] = sx(...P.gate); s += TT(x + 70, y + 60, '出校門右轉', 42, '#FFE8C8', 'start', o); } }
    { const o = win(t, at('2-19', .3), at('2-19', .8), .3); if (o > 0) { const [x, y] = sx(...P.light); s += TT(x, y - 70, '紅綠燈過馬路', 42, '#FFE8C8', 'middle', o); } }
    { const o = win(t, at('2-22', .08), E_('2-22') + .4, .3); if (o > 0) { const [x, y] = sx(...P.bridge); s += TT(x, y - 60, '火車橋', 44, '#FFE8C8', 'middle', o); } }
    { const o = fade(t, .2, .4)*(1 - fade(t, at('2-26', .12), .5)) + win(t, T27, T29, .4)*.0; if (o > 0) { const [x, y] = sx(-44, 150); s += TT(x, y, '台9線', 34, 'rgba(255,246,230,.85)', 'middle', o); } }
    // 宿舍照片＋可以洗澡
    const pm = win(t, at('2-19', .62), L('2-22').start + .3, .4), pf = win(t, L('2-20').start + .2, L('2-22').start + .3, .4);
    s += POL(330, 400, 'assets/dorm_m.jpg', '男教師宿舍', pm, -3) + POL(1590, 400, 'assets/dorm_f.jpg', '女教師宿舍', pf, 2.5);
    { const o = win(t, L('2-21').start + .2, L('2-22').start + .3, .3); if (o > 0) { s += shower(240, 790, 1.5, o) + TT(370, 808, '可以洗澡', 46, '#FFF6E6', 'middle', o) + shower(1500, 790, 1.5, o) + TT(1630, 808, '可以洗澡', 46, '#FFF6E6', 'middle', o); } }
    // 早上：時鐘卡
    { const o = win(t, T22, E_('2-24') + .3, .35); if (o > 0) { s += `<g opacity="${o}">` + TT(1560, 120, '早上', 52, '#FFE1A6', 'middle', 1);
      const a = fade(t, at('2-24', .3), .3), b = fade(t, at('2-24', .5), .3);
      if (a > 0) s += `<g opacity="${a}">` + clockI(1450, 210, 36, 7, 10) + TL_(1510, 226, '07:10　起床', 46, '#FFF6E6', 'start', 1) + `</g>`;
      if (b > 0) s += `<g opacity="${b}">` + clockI(1450, 310, 36, 7, 40) + TL_(1510, 326, '07:40　出發', 46, '#FFF6E6', 'start', 1) + `</g>`; s += `</g>`; } }
    { const o = win(t, at('2-24', .02), at('2-24', .5), .3); if (o > 0 && sibs[0].visible === false) { const [x, y] = sx(...P.school); } }
    { const o = win(t, tGo - .2, tArr + .5, .3); if (o > 0) { const [x, y] = scrObj(cam, sibs[0], 1.4); s += TT(x, y - 20, '接小朋友的哥姐', 38, '#FFF3DF', 'middle', o); } }
    { const o = win(t, T22 + .4, tBack, .3); if (o > 0) { const [x, y] = sx(sp[0] - 2, sp[1] - 9, .8); s += TT(x, y + 150, '小朋友在這裡集合', 38, '#FFF3DF', 'middle', o); } }
    // 2-24 會議室早餐、禮堂集合
    { const o = win(t, at('2-25', .05), at('2-26', .12), .3); if (o > 0) { const [x, y] = sx(...CF(23.5, 7), 1); s += TT(x, y - 30, '會議室：吃早餐', 44, '#FFF6E6', 'middle', o); } }
    { const o = win(t, at('2-25', .5), at('2-26', .12), .3); if (o > 0) { const [x, y] = sx(...CF(95, 9), 1); s += clockI(x - 200, y - 44, 30, 8, 10) + TT(x + 20, y - 30, '08:10 禮堂集合', 44, '#FFE1A6', 'middle', o); } }
    // 路線
    for (const k of ['red', 'green', 'up', 'common']) { const [a, b] = RK[k]; if (t < a) continue; const kk = clamp((t - a)/(b - a), 0, 1), o = k === 'common' ? 1 : 1;
      const d = path(RT[k], ease(kk), k === 'green' ? (i => GOFF[i]) : ({red: -3.6}[k] || 0)), sw = {red: 6, green: 6, up: 7, common: 7}[k]; s += `<path d="${d}" fill="none" stroke="#2A160B" stroke-width="${sw + 6}" stroke-linejoin="round" stroke-linecap="round" opacity=".5"/><path d="${d}" fill="none" stroke="${RCOL[k]}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round" opacity="${o}"/>`;
      if (kk < 1) { const pts = RT[k], i = Math.min(pts.length - 1, Math.ceil(pts.length*ease(kk)) - 1), [x, y] = sx(...pts[i]); s += `<circle cx="${x}" cy="${y}" r="13" fill="${RCOL[k]}" stroke="#FFF8EE" stroke-width="4"/>`; } }
    // 三個名詞 → 右上角圖例
    const W3 = [['向上', '#4FA2FF', .5, '藍色・最短'], ['向右', '#FF5B4A', .59, '紅色・繞一大圈'], ['八鄰', '#7BDD3A', .67, '綠色・彎進八鄰社區']];
    W3.forEach(([w, c, k, sub], i) => { const t0 = at('2-26', k); if (t < t0) return; const o = fade(t, t0, .3), mv = ease(clamp((t - at('2-26', .88))/.7, 0, 1));
      const x = lerp(900 + i*330, 1560, mv), y = lerp(560, 140 + i*86, mv), fs = lerp(120, 56, mv), act = t < T28 ? 1 : (i === 0 ? win(t, T28, T29, .3) : i === 1 ? win(t, T29, T30, .3) : win(t, T30, T31, .3));
      s += `<g opacity="${o}"><text x="${x}" y="${y}" text-anchor="middle" font-family="huninn" font-size="${fs}" fill="${c}" stroke="#2A160B" stroke-width="${lerp(10, 7, mv)}" paint-order="stroke" stroke-linejoin="round">${w}</text>`;
      if (mv > .5) s += TL_(x + 70, y - 8, sub, 30, '#FFF6E6', 'start', (mv - .5)*2*(.55 + .45*act)) + `<rect x="${x - 70}" y="${y - 58}" width="${380}" height="${76}" rx="14" fill="${c}" opacity="${.18*act*(mv - .5)*2}"/>`;
      s += `</g>`; });
    { const o = fade(t, tSpur - .2, .35); if (o > 0 && t > T30) { const [x, y] = sx(...MD.spurEnd); s += `<circle cx="${x}" cy="${y}" r="${18 + 6*Math.sin(t*5)}" fill="none" stroke="#7BDD3A" stroke-width="5" opacity="${o}"/>` + TT(x + 34, y + 14, '八鄰社區', 44, '#E6FFD0', 'start', o) + TT(x + 36, y + 60, '↩ 原路折返', 34, '#E6FFD0', 'start', o*fade(t, tSpur + .15, .35)); } }
    { const o = fade(t, T31 + .3, .35); if (o > 0) { const [x, y] = sx(...P.school); s += `<circle cx="${x}" cy="${y}" r="${30 + 8*Math.sin(t*5)}" fill="none" stroke="#FFE1A6" stroke-width="6" opacity="${o}"/>` + TT(x + 60, y + 18, '留校', 64, '#FFE1A6', 'start', o); } }
    // 指北針（地圖上方大約是西邊）
    { const [ax, ay] = sx(0, 0), [bx, by] = sx(0, 100), ang = Math.atan2(by - ay, bx - ax)*180/Math.PI, cx = 86, cy = 790;
      s += `<g transform="translate(${cx},${cy})" opacity=".92"><circle r="34" fill="rgba(10,16,40,.55)"/><g transform="rotate(${ang})"><path d="M26,0 L-12,-10 L-4,0 L-12,10 Z" fill="#ff5b4a"/></g></g>` + TL_(cx, cy + 66, '北', 28, '#FFF6E6', 'middle', 1); }
    s += `<text x="1890" y="868" text-anchor="end" font-family="huninn" font-size="22" fill="#FFF1DF" opacity=".75" stroke="#2A160B" stroke-width="3" paint-order="stroke">空拍影像：內政部國土測繪中心</text>`;
    return s;
  }
  return {scene, cam, update, overlay};
}
