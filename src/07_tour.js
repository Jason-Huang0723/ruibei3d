/* ================= 8. 導覽腳本（小人走的路線、鏡頭、字幕） ================= */
// 找店面：離 near 最近的房屋輪廓，取最靠近道路那一邊當門面
RB.shopFront = (near, road) => {
  let best = null, bd = 30; for (const b of RB.BUILD || []) { const P = b.poly; if (P.length < 3) continue; const cx = P.reduce((s, p) => s + p[0], 0) / P.length, cy = P.reduce((s, p) => s + p[1], 0) / P.length; const d = RB.inPoly(P, near[0], near[1]) ? 0 : Math.hypot(cx - near[0], cy - near[1]); if (d < bd) { bd = d; best = P; } }
  if (!best) { const dx = road[0] - near[0], dy = road[1] - near[1], L = Math.hypot(dx, dy); return { mid: [near[0] + dx / L * 4, near[1] + dy / L * 4], n: [dx / L, dy / L], len: 5 }; }
  let e = null, ed = 1e9; for (let i = 0; i < best.length; i++) { const a = best[i], c = best[(i + 1) % best.length], m = [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2], len = Math.hypot(c[0] - a[0], c[1] - a[1]); if (len < 2.5) continue; const d = Math.hypot(m[0] - road[0], m[1] - road[1]); if (d < ed) { ed = d; e = { a, c, m, len }; } }
  const tx = (e.c[0] - e.a[0]) / e.len, ty = (e.c[1] - e.a[1]) / e.len; let n = [ty, -tx]; if (n[0] * (road[0] - e.m[0]) + n[1] * (road[1] - e.m[1]) < 0) n = [-ty, tx];
  return { mid: e.m, n, len: e.len };
};

RB.makeTour = () => {
  const U = RB.U, W3 = RB.W3, S = RB.S, F1 = S.F1, F2 = S.F2, CV = 13.6;
  const fl = f => (f === 2 ? F2 : F1);
  const C = (u, f, v) => U(u, v === undefined ? CV : v, fl(f || 1));
  const R = (name, f) => RB.ROOMS.find(r => r.name === name && r.f === f);
  const mid = r => (r.u0 + r.u1) / 2;
  const lbl = (r, text, o) => Object.assign({ text: text || r.name, pos: U(mid(r), 7, fl(r.f) + 2.4) }, o || {});
  const follow = o => Object.assign({ mode: 'follow', cut: true }, o || {});
  // 室內機位：放在房間北側、離門較遠的角落，看向門口（人從門口走進來）
  const roomCam = (r, d, o) => { const far = (d - r.u0) < (r.u1 - d) ? r.u1 - 0.7 : r.u0 + 0.7, f = fl(r.f); return Object.assign({ mode: 'track', pos: U(far, 3.0, f + 2.65), look: U(mid(r) + (d - mid(r)) * 0.5, 8.6, f + 0.8), track: 0.4, lookH: 1.0, cut: true, indoor: true, fov: 64 }, o || {}); };
  // 從走廊走進房間（dir：沿走廊前進方向 +1 往東、-1 往西）
  const into = (r, d, dir, o) => { const f = fl(r.f); return [U(d - dir * 1.3, CV, f), { p: U(d, 12.75, f), cam: roomCam(r, d, o) }, U(d, 11.7, f), U(d - dir * 0.5, 11.0, f)]; };
  const outOf = (r, d, dir) => { const f = fl(r.f); return [U(d, 11.7, f), U(d, 12.75, f), U(d + dir * 0.7, 13.45, f), { p: U(d + dir * 1.7, CV, f), cam: follow() }]; };
  const inside = (r, d) => U(mid(r), 7, fl(r.f) + 0.5);

  const out = {   // 戶外（台9線路肩）
    road: y => -87 + (y + 95) * 0.17582,            // 台9線中心線 x（y < 87）
  };
  const shoulder = (y, side, h) => { const x = out.road(y) + side * 7; return W3(x, y, h === undefined ? 0.1 : h); };

  const SC = [];
  // ---------- 0. 開場：這一區的空拍 ----------
  const gateStart = U(-1.8, 34.8, 0.1);
  SC.push({ key: 'open', name: '開場', title: '瑞北國小與周邊', sub: '花蓮縣瑞穗鄉・中正北路二段 35 號', start: gateStart, yaw0: Math.PI / 2,
    steps: [{ aerial: 17, face: U(10, 34.8, 0), keys: [
      { t: 0, p: W3(250, -320, 310), l: W3(-70, 45, 0), fov: 44 },
      { t: 6, p: W3(140, -200, 175), l: W3(-65, 45, 0), fov: 44 },
      { t: 11.5, p: W3(-5, -95, 70), l: W3(-55, 25, 0), fov: 46 },
      { t: 17, p: U(-13, 45, 4.2), l: U(5, 32.5, 1.2), fov: 52 }] }],
    labels: [
      { text: '瑞北國小', pos: W3(2, 6, 14), in: 1.0, out: 11.5, hot: true },
      { text: '台9線（中正北路二段）', pos: W3(-81, -60, 1), in: 2.0, out: 11.0, lift: 0.05 },
      { text: '東輪機車行', pos: W3(-97, 21, 5), in: 3.0, out: 11.0 },
      { text: '公車站「瑞北國小」', pos: W3(-75.6, 78, 3), in: 3.6, out: 11.0, small: true },
      { text: '祥北路', pos: W3(-140, 110, 1), in: 4.2, out: 11.0, small: true, lift: 0.04 },
      { text: '林上商號（雜貨店）', pos: W3(-186, 138, 5), in: 4.8, out: 11.0, hot: true },
      { text: '大門口', pos: U(0, 34.8, 3.4), in: 13.0, out: 16.5 }] });

  // ---------- 1. 一樓 ----------
  const office = R('辦公室', 1), c4 = R('四教', 1), c3 = R('三教', 1), c2 = R('二教', 1), c1 = R('一教', 1), wc1 = R('廁所', 1), hall = R('穿堂', 1);
  SC.push({ key: 'f1', name: '一樓', title: '一樓', sub: '大門 → 穿堂 → 教室走廊', start: gateStart, cam0: follow({ dist: 4.2, height: 2.3 }),
    steps: [
      { walk: [U(1.5, 34.8, 0.1), { p: U(6.5, 33.6, 0.1), label: { text: '大門口', pos: U(0, 34.8, 3.4) }, caption: { title: '大門口', text: '大門朝西，面對台9線（中正北路二段）。' }, lead: 1.5, cdur: 5 },
        U(12.5, 28.5, 0.1), U(16.6, 22.5, 0.1), { p: U(17.3, 18.5, F1), cam: follow({ cut: false }) }, U(18.3, 13.4, F1)] },
      { stop: 4.5, face: U(17.3, 6, F1), label: lbl(hall), caption: { title: '穿堂', text: '進大門直走就是穿堂，往東接一樓走廊。' } },
      { walk: [U(19.5, 13.7, F1), U(23.6, CV, F1), U(25.3, 13.2, F1), U(25.5, 12.45, F1)] },
      { stop: 4.5, face: U(25.5, 6, F1), cam: roomCam(office, 25.5), label: lbl(office), caption: { title: '辦公室', text: '學校的辦公室，上二樓的樓梯就在旁邊。' } },
      { walk: [U(25.5, 13.0, F1), U(26.3, CV, F1), { p: U(27.3, CV, F1), cam: follow() }, { p: U(29.6, CV, F1), label: { text: '樓梯', pos: U(31.1, 10.5, F1 + 2.6) }, lead: 0.4 }, U(36, CV, F1)].concat(into(c4, 40.4, 1)) },
      { stop: 5.5, face: inside(c4), label: lbl(c4, '四教'), caption: { title: '四教', text: '哥姐午休的教室。' } },
      { walk: outOf(c4, 40.4, 1).concat([
        { p: U(45, CV, F1), label: lbl(c3), caption: { title: '一～四教', text: '不要用教室裡的垃圾桶，不要動老師的東西和黑板。' }, cdur: 7 },
        { p: U(54, CV, F1), label: lbl(c2), caption: { title: '教室復原', text: '用教室前先錄影、桌椅貼上編號貼紙、把配置圖寫在黑板上；離開時照原樣排回去。' }, cdur: 8 },
        { p: U(63.5, CV, F1), label: lbl(c1) }, U(71.5, CV, F1), U(73.3, 13.4, F1)]) },
      { stop: 4.5, face: U(73.6, 6, F1), cam: { mode: 'hold', lookH: 1.4 }, label: { text: '廁所', pos: U(73.6, 12.2, F1 + 2.7) }, caption: { title: '廁所', text: '在一樓走廊最東邊，再過去是禮堂。' } }] });

  // ---------- 2. 二樓 ----------
  const meet = R('會議室', 2), prin = R('校長室', 2), lib = R('圖書室', 2), eng = R('英語教室', 2), c5 = R('五教', 2), c6 = R('六教', 2);
  const stairCam = { mode: 'track', pos: U(31.1, 7.0, F2 + 2.45), look: U(31.0, 11.2, F1 + 1.3), track: 0.55, lookH: 1.0, cut: true, indoor: true, fov: 66 };
  const half = (F2 - F1) / 2;
  SC.push({ key: 'f2', name: '二樓', title: '二樓', sub: '樓梯 → 會議室、校長室 → 睡覺的教室', start: C(25.5, 1), yaw0: Math.PI / 2,
    steps: [
      { walk: [C(28.6, 1), U(30.2, 13.3, F1), { p: U(30.35, 12.2, F1), cam: stairCam, label: { text: '樓梯', pos: U(31.1, 9.5, F1 + 2.6) }, ldur: 4 }, U(30.35, 11.75, F1), U(30.35, 10.1, F1 + half / 2), U(30.35, 8.5, F1 + half),
        U(30.55, 7.4, F1 + half), U(31.65, 7.4, F1 + half), U(31.85, 8.5, F1 + half), U(31.85, 10.1, F1 + half * 1.5), U(31.85, 11.75, F2), U(31.6, 12.9, F2), { p: U(29.8, CV, F2), cam: follow() }].concat(into(meet, 25.5, -1)), speed: 1.2 },
      { stop: 5.5, face: inside(meet), label: lbl(meet), caption: { title: '會議室', text: '吃早餐的地方，晚上可以在這裡聊天；吹風機也在這裡。' } },
      { walk: outOf(meet, 25.5, -1).concat(into(prin, 17.2, -1)) },
      { stop: 5.5, face: inside(prin), label: lbl(prin, '校長室（團本部）', { hot: true }), caption: { title: '校長室', text: '團本部，裡面有浴室。' } },
      { walk: outOf(prin, 17.2, 1).concat([U(28, CV, F2)]).concat(into(lib, 34.2, 1)), ff: 1.5 },
      { stop: 5.5, face: inside(lib), label: lbl(lib), caption: { title: '圖書室', text: '睡覺的地方，木地板。' } },
      { walk: outOf(lib, 34.2, 1).concat(into(eng, 43.5, 1)) },
      { stop: 5.5, face: inside(eng), label: lbl(eng), caption: { title: '英語教室', text: '放行李。和圖書室中間用布簾隔開。' } },
      { walk: outOf(eng, 43.5, 1).concat([U(51.5, CV, F2), U(52.8, 13.2, F2), U(53.0, 12.45, F2)]) },
      { stop: 5.5, face: U(53.0, 6, F2), cam: roomCam(c5, 53.0), label: lbl(c5), caption: { title: '五教、六教', text: '也是睡覺的教室；五教是打呼的人專用。' } },
      { walk: [U(53.0, 13.0, F2), U(53.8, CV, F2), { p: U(54.8, CV, F2), cam: follow() }, { p: U(61, CV, F2), label: { text: '六教', pos: U(62.1, 12.2, F2 + 2.7) } }, U(64.5, CV, F2)] },
      { stop: 3.5, face: U(66, 7, F2), cam: { mode: 'hold', lookH: 1.4 } }] });

  // ---------- 3. 國幼班 ----------
  const kCam = { mode: 'track', pos: U(48.5, 65.1, 2.9), look: U(40.5, 59.8, 0.6), track: 0.35, lookH: 1.0, cut: true, indoor: true, fov: 64 };
  SC.push({ key: 'kinder', name: '國幼班', title: '國幼班', sub: '穿過操場，在南邊那排', start: C(53, 1), yaw0: Math.PI, cam0: follow({ dist: 4.6, height: 2.6 }),
    steps: [
      { walk: [U(52.6, 15.4, F1), U(51.5, 18.5, 0.1), { p: U(49, 25, 0.1), label: { text: '司令台', pos: U(63, 16.8, 1.8) }, caption: { title: '操場', text: '教室大樓南邊是紅土跑道和草皮操場，司令台在大樓前面。' }, cdur: 6 },
        U(44.5, 38, 0.1), { p: U(41.2, 48, 0.1), label: { text: '國幼班', pos: U(43, 62, 3.4) }, lead: 1 }, U(40.2, 54.5, 0.1), U(40, 56.6, F1)], ff: 1.5 },
      { stop: 4.5, face: U(40, 62, F1), caption: { title: '國幼班', text: '睡覺的地方，進去前要脫鞋。' } },
      { walk: [{ p: U(40, 58.0, F1), cam: kCam }, U(40, 59.4, F1), U(41.2, 60.6, F1)], speed: 1.1 },
      { stop: 5.5, face: U(36, 62, F1), label: { text: '國幼班（睡覺・脫鞋）', pos: U(43.5, 62, F1 + 2.4) } },
      { walk: [U(40.2, 59.6, F1), U(40, 58.0, F1), U(41.2, 57.1, F1), { p: U(43.5, 57.2, F1), cam: follow({ dist: 4.6, height: 2.6 }) }, U(60, 57.2, F1), U(76, 57.2, F1), U(78.6, 56.4, 0.1)], ff: 2 },
      { stop: 5, face: U(84, 58.5, 0), label: { text: '遊樂器材', pos: U(82, 58.5, 3.6), hot: true }, caption: { title: '遊樂器材', text: '營期間禁止使用。' }, cam: { mode: 'fixed', pos: U(74.5, 50.5, 3.2), look: U(81.5, 58, 1.2), move: 2.2, fov: 55 } }] });

  // ---------- 4. 禮堂 ----------
  const hallCam = { mode: 'track', pos: U(86.9, 3.4, 4.6), look: U(89.5, 13.0, 1.0), track: 0.45, lookH: 1.0, cut: true, indoor: true, fov: 64 };
  SC.push({ key: 'hall', name: '禮堂', title: '禮堂（風雨教室）', sub: '吃飯・檢討・營包・早操', start: C(72, 1), yaw0: Math.PI / 2,
    steps: [
      { walk: [C(76.5, 1), U(80.5, 14.2, F1), U(83.2, 16.0, 0.1), U(86.4, 16.7, 0.1), U(87.8, 16.3, 0.1)] },
      { stop: 4.5, face: U(87.8, 10, F1), label: { text: '後門（只走這扇）', pos: U(87.8, 15.0, 3.0), hot: true }, caption: { title: '禮堂後門', text: '進出禮堂只走靠操場的這扇後門。' } },
      { walk: [{ p: U(87.8, 15.3, F1), cam: hallCam }, U(87.8, 14.0, F1), U(88.6, 12.7, F1), U(92, 12.55, F1), { p: U(94, 12.55, F1), cam: follow({ cut: false, dist: 4.4, height: 2.4, tau: 0.8 }), caption: { title: '禮堂（風雨教室）', text: '吃飯、檢討、營包、早操都在這裡。' }, cdur: 6 }, U(97.0, 11.0, F1), U(98.0, 8.6, F1)] },
      { stop: 7, face: U(104, 8.5, F1), cam: { mode: 'fixed', pos: U(93.6, 9.2, 2.9), look: U(102, 8.5, 1.6), move: 2.4, fov: 60, indoor: true },
        caption: { title: '舞台', text: '面對舞台，右邊的小房間是電源，左邊的小房間放庶務。' } }],
    labels: [] });
  // 舞台標籤要等到最後那段才出現
  { const sc = SC[SC.length - 1]; sc.lateLabels = [{ text: '舞台', pos: U(102.3, 8.5, 3.6) }, { text: '電源（右）', pos: U(102.2, 13.4, 2.6), hot: true, small: true }, { text: '庶務（左）', pos: U(102.2, 3.6, 2.6), small: true }]; }

  // ---------- 5. 校外：雜貨店 ----------
  const shop = RB.shopFront([-186, 138], [-169, 117]), shopStand = [shop.mid[0] + shop.n[0] * 3.2, shop.mid[1] + shop.n[1] * 3.2];
  const xa = out.road(80);
  SC.push({ key: 'shop', name: '雜貨店', title: '校外：雜貨店', sub: '林上商號', start: U(15, 25, 0.1), yaw0: -Math.PI / 2, follow: { dist: 4.8, height: 2.7 }, cam0: follow(),
    steps: [
      { walk: [U(9, 31.5, 0.1), U(3.5, 34.4, 0.1), U(-0.8, 34.8, 0.1), shoulder(19, 1), { p: shoulder(24, 1), label: { text: '東輪機車行', pos: W3(-97, 21, 5) }, ldur: 5 },
        shoulder(45, 1), { p: shoulder(66, 1), label: { text: '公車站', pos: W3(-75.6, 78, 3), small: true }, ldur: 5 }, shoulder(77, 1),
        W3(xa + 6.6, 80, 0.3), W3(xa, 81.2, 0.32), W3(xa - 6.8, 82.4, 0.3), W3(-65.75, 91.97, 0.32),
        { p: W3(-89.75, 98.16, 0.32), label: { text: '祥北路', pos: W3(-112, 104, 1) }, ldur: 5 }, W3(-134.75, 109.77, 0.32), W3(-158.75, 115.97, 0.32),
        W3(-167.5, 118.6, 0.32), W3(-170.6, 123.5, 0.32), W3(-171.2, 128.4, 0.3), W3(shopStand[0], shopStand[1], 0.12)], ff: 3 },
      { stop: 6.5, face: W3(shop.mid[0], shop.mid[1], 1), label: { text: '林上商號（雜貨店）', pos: W3(shop.mid[0], shop.mid[1], 4.2), hot: true },
        caption: { title: '林上商號', text: '送完小朋友回家，哥姐可能會來這間雜貨店。從校門沿台9線往北，過馬路接祥北路就到。' },
        cam: { mode: 'fixed', pos: W3(shopStand[0] + shop.n[0] * 6 - shop.n[1] * 3, shopStand[1] + shop.n[1] * 6 + shop.n[0] * 3, 3.0), look: W3(shop.mid[0], shop.mid[1], 1.8), move: 2.2, fov: 55 } },
      { aerial: 9, blend: 2.5, face: W3(shop.mid[0], shop.mid[1], 1), keys: [{ t: 0, p: W3(shopStand[0] + 30, shopStand[1] - 40, 40), l: W3(-140, 100, 0), fov: 50 }, { t: 9, p: W3(70, -190, 230), l: W3(-85, 65, 0), fov: 50 }] }],
    labels: [] });
  { const sc = SC[SC.length - 1]; sc.lateLabels = [{ text: '瑞北國小', pos: W3(2, 6, 14), hot: true }, { text: '林上商號', pos: W3(-186, 138, 5) }]; }

  for (const sc of SC) { RB.compile(sc);
    if (sc.lateLabels) { const lastSeg = sc.segs[sc.segs.length - 1]; for (const L of sc.lateLabels) sc.allLabels.push(Object.assign({ in: lastSeg.t0 + 1.0, out: sc.dur + 1 }, L)); } }
  RB.SCENES = SC;

  // 自由視角時的常駐標籤
  const FL = [];
  for (const r of RB.ROOMS) FL.push({ text: r.name, pos: U(mid(r), 7, fl(r.f) + 2.4), max: 70, floor: r.f, small: true });
  FL.push({ text: '大門口', pos: U(0, 34.8, 3.4), max: 220 }, { text: '禮堂', pos: U(95, 8.5, 9), max: 260 }, { text: '國幼班', pos: U(54.5, 61, 4.5), max: 220 }, { text: '司令台', pos: U(63, 16.8, 4.5), max: 160, small: true },
    { text: '遊樂器材', pos: U(84, 58.5, 3.6), max: 160, small: true }, { text: '籃球場', pos: U(115, 25, 0.5), max: 200, small: true },
    { text: '瑞北國小', pos: W3(2, 6, 14), max: 3000, min: 230, hot: true }, { text: '台9線', pos: W3(-81, -60, 1), max: 1200, min: 40 }, { text: '東輪機車行', pos: W3(-97, 21, 5), max: 700 }, { text: '林上商號（雜貨店）', pos: W3(-186, 138, 5), max: 700 }, { text: '公車站', pos: W3(-75.6, 78, 3), max: 400, small: true });
  RB.FREE_LABELS = FL;
  RB.SHOP = shop;
};
