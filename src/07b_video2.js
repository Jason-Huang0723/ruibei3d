/* ================= 9. 必修2 影片用場景（Google 小姐配音對時；匯出時不畫說明字幕） ================= */
// 第二版（2026-11-14）：主角換成山友吉祥物；每間教室只講用途——走到門口、推開門、進去看一下就出來。
RB.VO = {"01":3.969,"02":4.081,"03":3.185,"04":7.465,"05":3.826,"06":3.657,"07":3.815,"08":7.52,"09":3.32,"10":3.962,"11":2.614,"12":4.169,"13":4.866,"14":2.661,"15":3.105,"16":1.509,"17":2.029,"18":5.889,"19":5.626,"20":3.725,"21":4.556,"22":4.445,"23":2.093,"24":6.094,"25":1.565,"26":4.767,"27":3.921,"28":5.028,"29":4.01,"30":2.97,"31":6.678,"32":4.623,"33":6.217,"34":6.362,"35":3.223,"36":4.154,"37":3.406,"38":6.458,"39":2.645,"40":2.614};
RB.makeV2 = () => {
  const U = RB.U, S = RB.S, F1 = S.F1, F2 = S.F2, FP = S.FP, CV = 13.6, half = (F2 - F1) / 2;
  const fl = f => (f === 2 ? F2 : F1);
  const R = (name, f) => RB.ROOMS.find(r => r.name === name && r.f === f);
  const mid = r => (r.u0 + r.u1) / 2;
  const did = (r, i) => r.f + '-' + r.name + '-' + i;
  const follow = o => Object.assign({ mode: 'follow', cut: true }, o || {});
  // 房間裡的鏡頭：在離門較遠的那一角、靠北牆上方，看著門口，吉祥物進門時正好面對鏡頭
  const doorCam = (d, dir, f) => ({ mode: 'track', pos: U(d - dir * 2.5, 14.3, f + 1.6), look: U(d + dir * 0.2, 11.6, f + 0.9), track: 0.25, lookH: 0.8, cut: true, fov: 60 });
  const roomCam = (r, d, o) => { const far = (d - r.u0) < (r.u1 - d) ? r.u1 - 0.8 : r.u0 + 0.8, f = fl(r.f); return Object.assign({ mode: 'track', pos: U(far, 3.2, f + 2.55), look: U(mid(r) + (d - mid(r)) * 0.6, 9.0, f + 0.7), track: 0.35, lookH: 0.8, cut: true, indoor: true, fov: 66 }, o || {}); };
  // 走到教室門口 → 推開門 → 走進去看一下 → 出來
  const peek = (r, i, dir, vo, lbl, o) => { const d = r.d[i], f = fl(r.f); o = o || {};
    return [
      { walk: (o.pre || []).concat([{ p: U(d - dir * 1.3, CV, f), cam: doorCam(d, dir, f) }, U(d, 13.25, f)]), ff: o.ff || 2.6, speed: 1.4, cam: o.cam },
      { stop: 0.45, face: U(d, 9, f), open: did(r, i), openAt: 0.0, doorDur: 0.6 },
      { walk: [{ p: U(d, 12.3, f), cam: roomCam(r, d, o.room) }, U(d, 11.2, f), U(d, 10.4, f)], speed: 1.3, vo, voAt: 0.25, labels: [Object.assign({ text: lbl, pos: U(mid(r), 7, f + 2.3), on: vo, k: 0.05, off: { at: vo }, fs: 30, color: o.color || 'rgba(20,28,36,0.88)' }, o.lab || {})] },
      { stop: 0, waitVo: true, face: U(d, 9, f), pad: o.pad === undefined ? 0.35 : o.pad },
      { walk: [U(d, 11.3, f), U(d, 12.6, f), { p: U(d, 13.3, f), cam: follow() }, U(d + dir * 1.2, CV, f)], speed: 1.4, ff: 2.4 }];
  };
  const c4 = R('四教', 1), c3 = R('三教', 1), meet = R('會議室', 2), lib = R('圖書室', 2), eng = R('英語教室', 2), c6 = R('六教', 2);
  const E = U(12, 34.9, 0.1);
  // 空拍：鏡頭在校地中心西邊一點往下看，畫面上方＝東（校門在畫面下方）
  const C0 = U(50, 35, 0), TOP = U(31, 35, 228), TOP2 = U(32.5, 35, 218);
  const roof = (u, v) => U(u, v, 10), LBL = 'rgba(20,28,36,0.88)', L2 = 'rgba(20,92,110,0.92)', EDGE2 = '#7fe3f0';
  const north1 = [['辦公室', 17.2, 0.12, 0, 8], ['樓梯', 31.1, 0.3, 0], ['四年級教室', 37.35, 0.5], ['三年級教室', 46.75, 0.62], ['二年級教室', 56.05, 0.74], ['一年級教室', 65.4, 0.86], ['樓梯', 71.8, 0.3, 12]];
  const aerialLabels = north1.map(([t, u, k, dy, v]) => ({ text: t, pos: roof(u, v || 7), dx: -250, dy: dy || 0, fs: 25, color: LBL, on: '04', k, off: { at: '08', k: 0.05 } }))
    .concat([{ text: '廁所', pos: roof(75.2, 7), dx: -250, dy: -22, fs: 25, color: LBL, on: '05', k: 0.08, off: { at: '08', k: 0.05 } },
      { text: '禮堂', pos: U(95, 8.5, 10.5), dx: -250, fs: 25, color: LBL, on: '05', k: 0.55 },
      { text: '國幼班', pos: U(60, 61, 4.5), dx: 230, fs: 25, color: LBL, on: '06', k: 0.35 },
      { text: '器材室', pos: U(26.5, 68, 4.5), dx: 230, fs: 25, color: LBL, on: '06', k: 0.7 },
      { text: '操場', pos: U(42, 21.3, 0.3), dx: 0, dy: -46, fs: 25, color: LBL, on: '07', k: 0.08 },
      { text: '足球場', pos: U(62, 39, 0.3), dx: 0, dy: -46, fs: 25, color: LBL, on: '07', k: 0.3 },
      { text: '籃球場', pos: U(115, 25, 0.3), dx: 0, dy: -46, fs: 25, color: LBL, on: '07', k: 0.68 }])
    .concat([['2F 會議室', 23.5, 7, -250, 0.22], ['2F 校長室', 17.2, 18.5, 230, 0.36], ['2F 圖書室', 37.35, 7, -250, 0.5], ['2F 英語教室', 46.75, 7, -250, 0.62], ['2F 五年級教室', 56.05, 7, -250, 0.76], ['2F 六年級教室', 65.4, 7, -250, 0.86]]
      .map(([t, u, v, dx, k]) => ({ text: t, pos: roof(u, v), dx, fs: 25, color: L2, edge: EDGE2, on: '08', k })));
  const stairCamE = { mode: 'track', pos: U(71.8, 7.0, F2 + 2.45), look: U(71.7, 11.2, F1 + 1.1), track: 0.55, lookH: 0.8, cut: true, indoor: true, fov: 66 };
  const corrCam = { mode: 'track', pos: U(27.5, 14.4, F1 + 2.0), look: U(42, 13.2, F1 + 1.0), track: 0.3, lookH: 0.9, cut: true, fov: 58 };
  const hallCam = { mode: 'track', pos: U(97.6, 3.4, 4.4), look: U(87, 12.6, 1.0), track: 0.45, lookH: 0.8, cut: true, indoor: true, fov: 66 };
  const meetCam = { mode: 'track', pos: U(18.6, 3.2, F2 + 2.6), look: U(27.2, 12.4, F2 + 0.8), track: 0.4, lookH: 0.8, cut: true, indoor: true, fov: 66 };
  const prinCam = { mode: 'track', pos: U(13.7, 17.9, FP + 2.35), look: U(19.8, 20.6, FP + 0.7), track: 0.45, lookH: 0.8, cut: true, indoor: true, fov: 68 };
  const stepCam = { mode: 'track', pos: U(24.0, 16.9, FP + 1.75), look: U(30.8, 15.0, F2 + 0.6), track: 0.5, lookH: 0.8, cut: true, indoor: true, fov: 60 };
  const passCam = { mode: 'track', pos: U(23.0, 21.6, FP + 2.2), look: U(25.5, 16.4, FP + 0.8), track: 0.55, lookH: 0.8, cut: true, indoor: true, fov: 64 };
  const kCam = { mode: 'track', pos: U(75.5, 65.2, 2.9), look: U(58.5, 60.3, 0.6), track: 0.4, lookH: 0.8, cut: true, indoor: true, fov: 64 };
  const kCorr = { mode: 'track', pos: U(53.8, 60.9, 2.7), look: U(33, 59.9, 0.9), track: 0.5, lookH: 0.8, cut: true, indoor: true, fov: 60 };
  const fn = (text, pos, on, o) => Object.assign({ text, pos, on, k: 0.15, fs: 30, color: 'rgba(20,28,36,0.88)' }, o || {});
  const SLEEP = 'rgba(40,70,160,0.92)', STAFF = 'rgba(176,64,40,0.93)';

  const A = { key: 'v2a', name: '必修2-校園', start: U(-2.6, 34.9, 0.1), yaw0: 1.33, follow: { dist: 3.4, height: 1.9 }, cam0: follow(), labels: [], steps: [
    { aerial: 0, vo: '02', voAt: 0.35, face: E, keys: [{ t: 0, p: U(-20, 35.6, 2.2), l: U(18, 33.6, 3.8), fov: 54 }, { t: 'end', p: U(-13.5, 35.4, 2.0), l: U(18, 33.6, 3.4), fov: 54 }] },
    { aerial: 0, vo: ['03', '04', '05', '06', '07', '08'], voAt: 0.2, pad: 0.7, face: E, labels: aerialLabels, keys: [
      { t: 0, p: U(-13.5, 35.4, 2.0), l: U(18, 33.6, 3.4), fov: 54 },
      { t: { at: '03', k: 0.5 }, p: U(8, 35.5, 70), l: U(52, 35, 0), fov: 46 },
      { t: { at: '03', k: 1, off: 0.25 }, p: TOP, l: C0, fov: 40 },
      { t: 'end', p: TOP2, l: C0, fov: 40 }] },
    { aerial: 2.6, face: E, keys: [{ t: 0, p: TOP2, l: C0, fov: 40 }, { t: 1.5, p: U(-15, 34.6, 14), l: U(4, 34.8, 1.0), fov: 50 }, { t: 2.6, p: U(-5.4, 34.45, 1.8), l: U(-1.0, 34.9, 1.0), fov: 52 }] },
    // 從校門走進去：左手邊是穿堂，穿過穿堂到走廊
    { walk: [U(1.5, 34.6, 0.1), U(6.5, 33.0, 0.1), U(11, 29.5, 0.1), U(14.2, 25, 0.1), U(15.8, 21.4, F1), U(18.0, 18.0, F1), U(20.6, 15.4, F1), U(23.0, CV, F1), U(27.5, CV, F1)], vo: '09', ff: 4.0, speed: 1.5,
      labels: [fn('穿堂', U(17.2, 18.0, F1 + 2.9), '09', { k: 0.5, off: 3.5 })] },
    { walk: [U(31.5, CV, F1)], vo: '10', cam: corrCam, speed: 1.4,
      labels: [fn('四年級教室', U(37.35, 12.6, F1 + 2.9), '10', { k: 0.3, fs: 26, off: 3.4 }), fn('三、二、一年級教室', U(54.5, 12.6, F1 + 2.9), '10', { k: 0.55, fs: 26, lift: 0.12, off: 2.6 })] },
    ...peek(c4, 0, 1, '11', '四年級教室：哥姐休息', { color: STAFF, cam: corrCam }),
    ...peek(c3, 0, 1, '12', '一、二、三年級教室：小朋友上課', { ff: 2.0 }),
    // 走到底是禮堂：沿走廊往東，經過廁所，走過一條窄窄的走廊，推開禮堂的門
    { walk: [U(52, CV, F1), U(62, CV, F1), U(70, CV, F1), U(77.5, CV, F1), U(82.5, CV, F1), U(84.0, 13.5, F1)], vo: '13', voAt: 0.3, ff: 4.2, speed: 1.5,
      labels: [fn('禮堂：吃飯・檢討・營包・早操', U(92, 8.5, 6.4), '13', { k: 0.55, off: 9 })] },
    { stop: 0.5, face: U(90, 13.5, F1), open: ['hallW1', 'hallW2'], openAt: 0.0, doorDur: 0.6 },
    { walk: [{ p: U(85.4, 13.5, F1), cam: hallCam }, U(87.0, 13.3, F1), U(88.4, 12.4, F1)], speed: 1.1 },
    { stop: 0.5, waitVo: true, pad: 0.2, face: U(98, 8.5, F1) },
    { walk: [U(87.2, 13.4, F1), { p: U(85.0, 13.5, F1), cam: follow() }, U(82.5, CV, F1), U(77.5, CV, F1), U(73.8, 13.4, F1), U(71.6, 13.1, F1)], vo: '14', voAt: 0.2, ff: 3.6, speed: 1.5 },
    { walk: [{ p: U(71.05, 12.2, F1), cam: stairCamE }, U(71.05, 11.75, F1), U(71.05, 10.1, F1 + half / 2), U(71.05, 8.5, F1 + half), U(71.25, 7.4, F1 + half), U(72.35, 7.4, F1 + half), U(72.55, 8.5, F1 + half), U(72.55, 10.1, F1 + half * 1.5), U(72.55, 11.75, F2), U(72.3, 12.9, F2), { p: U(71.2, CV, F2), cam: follow() }], ff: 2.8, speed: 1.4 },
    ...peek(c6, 1, -1, '15', '五、六年級教室：睡覺', { color: SLEEP }),
    ...peek(eng, 0, -1, '16', '英語教室：放行李', { pre: [U(60, CV, F2), U(55, CV, F2)], ff: 3.6, pad: 0.6 }),
    ...peek(lib, 0, -1, '17', '圖書室：睡覺', { pre: [U(46, CV, F2)], ff: 3.0, color: SLEEP, pad: 0.5 }),
    // 圖書室西邊的玻璃門 → 樓梯口：正對面就是會議室的門
    { walk: [U(34.6, CV, F2)], speed: 1.3 },
    { stop: 0.45, face: U(30, CV, F2), open: ['glass2a', 'glass2b'], openAt: 0.0, doorDur: 0.6 },
    { walk: [U(32.7, CV, F2), U(31.0, 13.5, F2), U(30.3, 13.5, F2)], speed: 1.5, ff: 1.5 },
    { stop: 0.45, face: U(26, 13.5, F2), open: 'meet', openAt: 0.0, doorDur: 0.6 },
    { walk: [{ p: U(29.0, 13.5, F2), cam: meetCam }, U(28.0, 13.3, F2), U(27.0, 12.6, F2)], speed: 1.3, vo: '18', voAt: 0.25, labels: [fn('會議室：早餐・吹風機', U(23.8, 8, F2 + 2.4), '18', { k: 0.05, off: { at: '18' } })] },
    { stop: 0, waitVo: true, pad: 0.2, face: U(23.8, 8.4, F2) },
    // 樓梯口正前方的小樓梯 → 往西 → 往南，右手邊是校長室
    { walk: [U(28.2, 13.5, F2), U(29.6, 13.7, F2), { p: U(31.0, 14.4, F2), cam: stepCam }, U(31.1, 15.2, F2 + 0.15), U(31.1, 15.6, F2 + 0.3), U(31.0, 16.1, FP), U(30.0, 16.4, FP), U(26.0, 16.3, FP), U(23.4, 16.6, FP), { p: U(23.0, 17.8, FP), cam: passCam }, U(23.0, 19.8, FP), U(22.9, 20.65, FP)], vo: '19', voAt: 0.6, ff: 2.2, speed: 1.4 },
    { stop: 0.45, face: U(18, 20.65, FP), open: 'prin', openAt: 0.0, doorDur: 0.6 },
    { walk: [{ p: U(21.6, 20.65, FP), cam: prinCam }, U(20.4, 20.65, FP), U(19.5, 20.2, FP)], speed: 1.1,
      labels: [fn('校長室：團本工作區', U(17.2, 19.5, FP + 2.2), '19', { k: 0.55, color: STAFF, off: 'scene' })] },
    { stop: 0.8, waitVo: true, pad: 0.4, face: U(14.4, 19.4, FP) }] };

  const B = { key: 'v2b', name: '必修2-國幼班', start: U(25.5, 57.0, F1), yaw0: 1.3, follow: { dist: 3.4, height: 1.9 }, cam0: follow(), labels: [], steps: [
    { aerial: 2.4, face: U(32, 60, F1), keys: [{ t: 0, p: U(26, 30, 30), l: U(36, 60, 0), fov: 50 }, { t: 2.4, p: U(22.4, 55.8, 2.3), l: U(30, 59.6, 1.0), fov: 54 }] },
    { walk: [U(28.2, 58.6, F1), U(30.9, 59.95, F1)], speed: 1.4 },
    { stop: 0.45, face: U(40, 59.95, F1), open: 'kWest', openAt: 0.0, doorDur: 0.6 },
    { walk: [{ p: U(32.8, 59.95, F1), cam: kCorr }, U(40, 59.95, F1), U(50, 59.95, F1), U(53.4, 59.95, F1)], ff: 4.5, speed: 1.5 },
    { stop: 0.45, face: U(60, 59.95, F1), open: 'kIn', openAt: 0.0, doorDur: 0.6 },
    { walk: [{ p: U(55.0, 59.95, F1), cam: kCam }, U(56.6, 60.3, F1), U(58.2, 61.4, F1)], speed: 1.3, vo: '20', voAt: 0.2, labels: [fn('國幼班：睡覺', U(65, 62, F1 + 2.4), '20', { k: 0.35, color: SLEEP, off: { at: '21', k: 0 } })] },
    { stop: 0, waitVo: true, pad: 0.3, face: U(70, 63, F1) },
    { aerial: 0, vo: '21', voAt: 0.2, face: U(70, 63, F1), keys: [{ t: 0, p: U(73, 49.5, 4.6), l: U(84.0, 58.2, 1.6), fov: 54 }, { t: 'end', p: U(75, 49.6, 4.4), l: U(84.5, 58.2, 1.6), fov: 54 }],
      labels: [fn('溜滑梯：小朋友都不能去玩', U(83.5, 58.5, 4.6), '21', { k: 0.1, color: 'rgba(176,64,40,0.95)', fs: 32 })] }] };

  RB.V2 = [A, B].map(sc => RB.compile(sc));
};
