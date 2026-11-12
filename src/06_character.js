/* ================= 7. 走路的小人、時間軸、鏡頭 ================= */
RB.W3 = (x, y, h) => [x, RB.H(x, y) + h, -y];
function cr(p0, p1, p2, p3, t) { const t2 = t * t, t3 = t2 * t; return 0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3); }
RB.pathAt = (keys, t) => { const n = keys.length; if (t <= keys[0].t) return keys[0]; if (t >= keys[n - 1].t) return keys[n - 1]; let i = 0; while (i < n - 2 && t > keys[i + 1].t) i++; const k0 = keys[Math.max(0, i - 1)], k1 = keys[i], k2 = keys[i + 1], k3 = keys[Math.min(n - 1, i + 2)]; let u = (t - k1.t) / (k2.t - k1.t); u = u * u * (3 - 2 * u) * 0.45 + u * 0.55; const f = a => [0, 1, 2].map(j => cr(k0[a][j], k1[a][j], k2[a][j], k3[a][j], u)); return { p: f('p'), l: f('l'), fov: (k1.fov || 50) + ((k2.fov || 50) - (k1.fov || 50)) * u }; };

// 角色：three.js 範例的 Xbot（Mixamo 原地走路動畫）。步伐對應的速度約 1.4 m/s，動畫進度跟走過的距離綁在一起，腳不會滑。
RB.XBOT_URL = 'https://raw.githubusercontent.com/mrdoob/three.js/r160/examples/models/gltf/Xbot.glb';
RB.STRIDE = 1.4;
RB.loadCharacter = async () => {
  const g = await new GLTFLoader().loadAsync(RB.XBOT_URL); const root = g.scene;
  const body = new THREE.MeshStandardMaterial({ color: 0xf08a3c, roughness: 0.55 }), joint = new THREE.MeshStandardMaterial({ color: 0x33393f, roughness: 0.6 });
  root.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; o.frustumCulled = false; o.material = (o.material && /Joint/i.test(o.material.name)) ? joint : body; } });
  const mixer = new THREE.AnimationMixer(root), clip = n => g.animations.find(a => a.name === n);
  const walk = mixer.clipAction(clip('walk')), idle = mixer.clipAction(clip('idle'));
  for (const a of [walk, idle]) { a.play(); a.setEffectiveWeight(0); }
  RB.CH = { root, mixer, walk, idle, walkDur: clip('walk').duration, idleDur: clip('idle').duration };
  return root;
};

// ---- 把場景腳本編譯成時間軸 ----
// 步驟：{walk:[點或 {p, cam, label, caption}], speed, ff(快轉倍數), cam}、{stop:秒, face, cam, label, caption}、{aerial:秒, keys, blend}
const V3 = a => new THREE.Vector3(a[0], a[1], a[2]);
function sAt(seg, tau) { const { v, ta, L, T } = seg; if (tau <= 0) return 0; if (tau >= T) return L; if (tau < ta) return v * tau * tau / (2 * ta); if (tau > T - ta) return L - v * (T - tau) * (T - tau) / (2 * ta); return v * (tau - ta / 2); }
function vAt(seg, tau) { const { v, ta, T } = seg; if (tau <= 0 || tau >= T) return 0; if (tau < ta) return v * tau / ta; if (tau > T - ta) return v * (T - tau) / ta; return v; }
function tauAt(seg, s) { const { v, ta, L, T } = seg, sa = v * ta / 2; if (s <= sa) return Math.sqrt(2 * ta * Math.max(0, s) / v); if (s >= L - sa) return T - Math.sqrt(Math.max(0, 2 * ta * (L - s) / v)); return s / v + ta / 2; }
RB.compile = sc => {
  const segs = [], labels = (sc.labels || []).slice(), caps = (sc.caps || []).slice(); let t = 0, pos = sc.start.slice(), D = 0, lastCam = sc.cam0 || { mode: 'follow' }, resume = false;
  const addCap = (c, a, b) => caps.push({ title: c.title || '', text: c.text || '', in: a, out: b });
  for (const st of sc.steps) {
    if (st.walk) {
      const pts = [pos], ms = [];
      for (const w of st.walk) { if (Array.isArray(w)) pts.push(w); else { pts.push(w.p); ms.push(Object.assign({ i: pts.length - 1 }, w)); } }
      const curve = new THREE.CatmullRomCurve3(pts.map(V3), false, 'centripetal', 0.5), div = Math.max(240, pts.length * 80), lens = curve.getLengths(div), L = lens[div];
      const ff = st.ff || 1, v = st.speed || 1.35, ta = Math.min(0.75, L / v * 0.5), T = L / v + ta;
      const seg = { type: 'walk', t0: t, t1: t + T / ff, ff, curve, L, v, ta, T, D0: D, camIn: st.cam || (resume ? Object.assign({}, lastCam, { cut: false }) : lastCam), marks: [] }; resume = false;
      for (const m of ms) { const s = lens[Math.round(m.i / (pts.length - 1) * div)], tv = t + tauAt(seg, s) / ff;
        if (m.cam) seg.marks.push({ s, cam: m.cam });
        if (m.label) labels.push({ text: m.label.text, pos: m.label.pos, hot: m.label.hot, small: m.label.small, in: tv - (m.lead === undefined ? 0.6 : m.lead), out: tv + (m.ldur || 4.5) });
        if (m.caption) addCap(m.caption, tv, tv + (m.cdur || 6)); }
      lastCam = seg.marks.length ? seg.marks[seg.marks.length - 1].cam : seg.camIn;
      segs.push(seg); t = seg.t1; D += L; pos = pts[pts.length - 1].slice();
    } else if (st.stop !== undefined) {
      // 停下來但沒指定鏡頭時，鏡頭留在原地看著人（不要跟著轉身繞到前面）
      const auto = !st.cam && (lastCam.mode || 'follow') === 'follow';
      const seg = { type: 'stop', t0: t, t1: t + st.stop, ff: 1, pos: pos.slice(), face: st.face, cam: st.cam || (auto ? { mode: 'hold', lookH: 1.3 } : lastCam), D0: D }; if (!auto) lastCam = seg.cam; else resume = true;
      if (st.label) labels.push({ text: st.label.text, pos: st.label.pos, hot: st.label.hot, small: st.label.small, in: t + 0.15, out: seg.t1 + (st.ldur || 0) });
      if (st.caption) addCap(st.caption, t + 0.2, seg.t1 + (st.cdur || 0));
      segs.push(seg); t = seg.t1;
    } else if (st.aerial) {
      const seg = { type: 'aerial', t0: t, t1: t + st.aerial, ff: 1, pos: pos.slice(), face: st.face, cam: { mode: 'aerial', keys: st.keys, blend: st.blend || 0, cut: !st.blend }, D0: D }; lastCam = st.after || { mode: 'follow' };
      segs.push(seg); t = seg.t1;
    }
  }
  sc.segs = segs; sc.dur = t; sc.allLabels = labels; sc.allCaps = caps; return sc;
};
const angLerp = (a, b, k) => { let d = b - a; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return a + d * k; };
const yawTo = (from, to) => Math.atan2(to[0] - from[0], to[2] - from[2]);
RB.evalScene = (sc, t) => {
  let seg = sc.segs[sc.segs.length - 1]; for (const s of sc.segs) if (t < s.t1) { seg = s; break; }
  const tau = Math.max(0, Math.min(t - seg.t0, seg.t1 - seg.t0)) * (seg.ff || 1); const out = { seg, tau, walkW: 0, yawT: null, dist: seg.D0 };
  if (seg.type === 'walk') { const s = sAt(seg, tau), u = Math.min(1, s / seg.L), uu = Math.min(0.9999, Math.max(0.0001, u)); out.pos = seg.curve.getPointAt(u).toArray(); const tg = seg.curve.getTangentAt(uu); out.yawT = Math.atan2(tg.x, tg.z); out.walkW = Math.min(1, vAt(seg, tau) / seg.v * 1.5); out.dist = seg.D0 + s; out.s = s;
    let c = seg.camIn; for (const m of seg.marks) if (s >= m.s - 1e-6) c = m.cam; out.cam = c; }
  else { out.pos = seg.pos.slice(); if (seg.face) out.yawT = yawTo(seg.pos, seg.face); out.cam = seg.cam; }
  return out;
};

// ---- 播放（逐格前進；匯出影片與互動播放結果相同） ----
RB.player = { sc: null, t: 0, yaw: 0, cam: null, look: null, fov: 50, camObj: null, indoor: 0 };
const smooth = x => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };
const lerp3 = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
RB.resetScene = sc => { const P = RB.player; P.sc = sc; P.t = 0; P.cam = null; P.look = null; P.camObj = null; P.from = null; const e = RB.evalScene(sc, 0); P.yaw = e.yawT !== null ? e.yawT : (sc.yaw0 || 0); RB.step(0, true); };
RB.seek = t => { const P = RB.player; RB.resetScene(P.sc); const dt = 1 / 30; while (P.t < t - 1e-6) RB.step(Math.min(dt, t - P.t)); };
RB.step = (dt, snap) => {
  const P = RB.player, sc = P.sc; P.t = Math.min(sc.dur, P.t + dt); const e = RB.evalScene(sc, P.t); P.ev = e; const seg = e.seg, ff = seg.ff || 1, ch = RB.CH;
  if (e.yawT !== null) P.yaw = snap ? e.yawT : angLerp(P.yaw, e.yawT, 1 - Math.exp(-dt * ff * (seg.type === 'walk' ? 8 : 4)));
  // 角色姿勢：走路動畫的進度＝走過的距離 ÷ 步伐速度
  ch.root.position.set(e.pos[0], e.pos[1], e.pos[2]); ch.root.rotation.y = P.yaw;
  ch.walk.setEffectiveWeight(e.walkW); ch.idle.setEffectiveWeight(1 - e.walkW); ch.walk.time = (e.dist / RB.STRIDE) % ch.walkDur; ch.idle.time = (P.t % ch.idleDur); ch.mixer.update(0);
  // 鏡頭
  const c = e.cam || { mode: 'follow' }; if (c !== P.camObj) { P.camObj = c; P.camT0 = P.t; P.from = P.cam ? { p: P.cam.slice(), l: P.look.slice(), f: P.fov } : null; if (c.cut || !P.cam) snap = true; }
  const cy = (snap && e.yawT !== null) ? e.yawT : P.yaw, head = [e.pos[0], e.pos[1] + (c.lookH === undefined ? 1.2 : c.lookH), e.pos[2]], fwd = [Math.sin(cy), 0, Math.cos(cy)], right = [Math.cos(cy), 0, -Math.sin(cy)];
  let dp, dl, fov = c.fov || sc.fov || 52, mode = c.mode || 'follow', expo = 0;
  if (mode === 'follow') { const f = Object.assign({ dist: 3.6, height: 2.0, side: 0.45, lookH: 1.3, ahead: 1.6, tau: 0.5 }, sc.follow || {}, c); dp = [e.pos[0] - fwd[0] * f.dist + right[0] * f.side, e.pos[1] + f.height, e.pos[2] - fwd[2] * f.dist + right[2] * f.side]; dl = [e.pos[0] + fwd[0] * f.ahead, e.pos[1] + f.lookH, e.pos[2] + fwd[2] * f.ahead]; expo = f.tau; fov = c.fov || f.fov || fov; }
  else if (mode === 'aerial') { const k = RB.pathAt(c.keys, e.tau); dp = k.p; dl = k.l; fov = k.fov || fov; if (c.blend && P.from) { const b = smooth((P.t - P.camT0) / c.blend); dp = lerp3(P.from.p, dp, b); dl = lerp3(P.from.l, dl, b); fov = P.from.f + (fov - P.from.f) * b; } }
  else if (mode === 'hold') { dp = P.from ? P.from.p : P.cam; dl = head; expo = c.tau || 0.6; }
  else { // fixed／track：固定機位，track 會跟著看人
    dp = c.pos; dl = c.look || head; if (c.track) dl = lerp3(c.look || head, head, c.track === true ? 0.55 : c.track);
    if (c.move && P.from && !snap) { const b = smooth((P.t - P.camT0) / c.move); dp = lerp3(P.from.p, dp, b); dl = lerp3(P.from.l, dl, b); fov = P.from.f + (fov - P.from.f) * b; }
    else expo = c.tau || 0.35; }
  if (snap || !P.cam) { P.cam = dp.slice(); P.look = dl.slice(); P.fov = fov; }
  else if (expo) { const k = 1 - Math.exp(-dt * (mode === 'follow' ? ff : 1) / expo); for (let i = 0; i < 3; i++) { P.cam[i] += (dp[i] - P.cam[i]) * k; P.look[i] += (dl[i] - P.look[i]) * k; } P.fov += (fov - P.fov) * k; }
  else { P.cam = dp.slice(); P.look = dl.slice(); P.fov = fov; }
  // 跟拍時不讓鏡頭鑽進地面
  if (mode === 'follow') { const x = P.cam[0], y = -P.cam[2], g = RB.inPoly(RB.CAMPUS, x, y) ? RB.GROUND + 0.5 : RB.H(x, y) + 0.8; if (P.cam[1] < g) P.cam[1] = g; }
  const ind = c.indoor ? 1 : 0; P.indoor = snap ? ind : P.indoor + (ind - P.indoor) * (1 - Math.exp(-dt / 0.4));
};
RB.applyCamera = cam => { const P = RB.player; cam.position.set(P.cam[0], P.cam[1], P.cam[2]); cam.lookAt(P.look[0], P.look[1], P.look[2]); cam.fov = P.fov; cam.updateProjectionMatrix(); };

// ---- 畫面上的字（標籤、說明字幕、場景標題）——互動播放與匯出共用 ----
RB.FONT = '"Microsoft JhengHei","Noto Sans TC","PingFang TC",sans-serif';
function wrapText(g, text, maxW) { const lines = []; let cur = ''; for (const ch of text) { if (ch === '\n') { lines.push(cur); cur = ''; continue; } if (g.measureText(cur + ch).width > maxW && cur) { lines.push(cur); cur = ch; } else cur += ch; } if (cur) lines.push(cur); return lines; }
const win = (t, a, b, f) => Math.max(0, Math.min(1, (t - a) / f, (b - t) / f));
const _v = new THREE.Vector3();
function drawLabel(g, L, a, W, H, cam, S) {
  _v.set(L.pos[0], L.pos[1], L.pos[2]).project(cam); if (_v.z > 1 || _v.z < -1) return; const sx = (_v.x * 0.5 + 0.5) * W, sy = (-_v.y * 0.5 + 0.5) * H; if (sx < -100 || sx > W + 100 || sy < -100 || sy > H + 100) return;
  const fs = Math.round((L.small ? 26 : 32) * S), pad = fs * 0.45, bh = fs * 1.5; g.font = '700 ' + fs + 'px ' + RB.FONT; const tw = g.measureText(L.text).width, ty = sy - (L.lift !== undefined ? L.lift * H : 64 * S);
  g.globalAlpha = a; g.strokeStyle = 'rgba(255,255,255,0.95)'; g.lineWidth = Math.max(2, 3 * S); g.beginPath(); g.moveTo(sx, sy); g.lineTo(sx, ty + bh / 2); g.stroke(); g.fillStyle = '#fff'; g.beginPath(); g.arc(sx, sy, 6 * S, 0, Math.PI * 2); g.fill();
  g.fillStyle = L.hot ? 'rgba(176,64,40,0.93)' : 'rgba(20,28,36,0.84)'; g.beginPath(); g.roundRect(sx - tw / 2 - pad, ty - bh / 2, tw + pad * 2, bh, bh * 0.3); g.fill(); g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(L.text, sx, ty + fs * 0.05); g.globalAlpha = 1;
}
RB.drawOverlay = (g, W, H, cam, opt) => {
  const P = RB.player, sc = P.sc, st = P.t, S = Math.max(Math.min(W / 1920, H / 1080) * (opt.scale || 1), opt.minS || 0), show = opt.labels !== false, top = opt.top || 0; g.save();
  if (show) for (const L of sc.allLabels) { const a = win(st, L.in, L.out, 0.5); if (a > 0.01) drawLabel(g, L, a, W, H, cam, S); }
  // 說明字幕（同一時間只顯示最新的一則）
  let cap = null; for (const c of sc.allCaps) if (st >= c.in - 0.4 && st < c.out + 0.4 && (!cap || c.in > cap.in)) cap = c;
  if (show && cap) { const a = win(st, cap.in - 0.4, cap.out + 0.4, 0.4); if (a > 0.01) { const fsT = Math.round(36 * S), fs = Math.round(31 * S), maxW = Math.min(W - 60 * S, 1360 * S); g.font = '500 ' + fs + 'px ' + RB.FONT; const lines = cap.text ? wrapText(g, cap.text, maxW - 70 * S) : [];
      g.font = '700 ' + fsT + 'px ' + RB.FONT; const tW = g.measureText(cap.title).width; g.font = '500 ' + fs + 'px ' + RB.FONT;
      const bw = Math.min(maxW, Math.max(tW, ...lines.map(l => g.measureText(l).width), 260 * S) + 70 * S), bh = fsT * 1.45 + lines.length * fs * 1.5 + 34 * S, x = W / 2 - bw / 2, y = H - bh - (opt.bottom !== undefined ? opt.bottom : 44 * S);
      g.globalAlpha = a; g.fillStyle = 'rgba(14,20,26,0.86)'; g.beginPath(); g.roundRect(x, y, bw, bh, 16 * S); g.fill(); g.fillStyle = '#e0a640'; g.fillRect(x, y + 16 * S, 6 * S, bh - 32 * S);
      g.textAlign = 'left'; g.textBaseline = 'top'; g.fillStyle = '#ffcf70'; g.font = '700 ' + fsT + 'px ' + RB.FONT; g.fillText(cap.title, x + 34 * S, y + 17 * S); g.fillStyle = '#fff'; g.font = '500 ' + fs + 'px ' + RB.FONT; lines.forEach((l, i) => g.fillText(l, x + 34 * S, y + 17 * S + fsT * 1.45 + i * fs * 1.5)); g.globalAlpha = 1; } }
  // 場景標題
  if (show && sc.title) { const a = win(st, 0.3, 4.2, 0.7); if (a > 0.01) { g.globalAlpha = a; g.shadowColor = 'rgba(0,0,0,0.6)'; g.shadowBlur = 16 * S; g.fillStyle = '#fff'; g.textAlign = 'left'; g.textBaseline = 'alphabetic'; g.font = '700 ' + Math.round(64 * S) + 'px ' + RB.FONT; g.fillText(sc.title, 72 * S, top + 128 * S); if (sc.sub) { g.font = '500 ' + Math.round(34 * S) + 'px ' + RB.FONT; g.fillText(sc.sub, 74 * S, top + 180 * S); } g.shadowBlur = 0; g.globalAlpha = 1; } }
  // 快轉標示
  const fs_ = P.ev && P.ev.seg; if (show && fs_ && fs_.ff > 1) { const a = win(st, fs_.t0, fs_.t1, 0.3); g.globalAlpha = a; g.font = '700 ' + Math.round(30 * S) + 'px ' + RB.FONT; g.fillStyle = 'rgba(14,20,26,0.78)'; g.beginPath(); g.roundRect(W - 200 * S, top + 40 * S, 156 * S, 54 * S, 12 * S); g.fill(); g.fillStyle = '#ffcf70'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('▶▶ ' + fs_.ff + '×', W - 122 * S, top + 67 * S); g.globalAlpha = 1; }
  // 頭尾淡入淡出
  if (opt.fade !== false) { const f = Math.max(0, 1 - st / 0.6, 1 - (sc.dur - st) / 0.6); if (f > 0) { g.fillStyle = 'rgba(0,0,0,' + Math.min(1, f) + ')'; g.fillRect(0, 0, W, H); } }
  g.restore();
};
// 自由視角時的常駐標籤（依距離顯示）
RB.drawFreeLabels = (g, W, H, cam) => { const S = Math.min(W / 1920, H / 1080) * 1.3, cp = cam.position; g.save(); for (const L of RB.FREE_LABELS) { const d = Math.hypot(cp.x - L.pos[0], cp.y - L.pos[1], cp.z - L.pos[2]); if (d > L.max || d < (L.min || 0)) continue; if (L.floor === 2 && cp.y < RB.GROUND + RB.S.F2 + 1) continue; drawLabel(g, L, 1, W, H, cam, S); } g.restore(); };
