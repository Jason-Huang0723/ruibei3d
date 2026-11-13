/* ================= 9. 必修2 影片用場景（Google 小姐配音對時；匯出時不畫說明字幕） ================= */
RB.VO = {"01":3.969,"02":4.081,"03":3.185,"04":7.465,"05":3.826,"06":3.657,"07":3.815,"08":7.52,"09":3.32,"10":3.962,"11":2.614,"12":4.169,"13":4.866,"14":2.661,"15":3.105,"16":1.509,"17":2.029,"18":5.889,"19":3.472,"20":3.725,"21":4.986,"22":4.445,"23":2.093,"24":6.094,"25":1.565,"26":4.767,"27":3.921,"28":5.028,"29":4.01,"30":2.97,"31":6.678,"32":4.623,"33":6.217,"34":6.362,"35":3.223,"36":4.154,"37":3.406,"38":6.458,"39":2.645,"40":2.614};
RB.makeV2 = () => {
  const U = RB.U, S = RB.S, F1 = S.F1, F2 = S.F2, CV = 13.6, half = (F2 - F1) / 2;
  const fl = f => (f === 2 ? F2 : F1);
  const R = (name, f) => RB.ROOMS.find(r => r.name === name && r.f === f);
  const mid = r => (r.u0 + r.u1) / 2;
  const follow = o => Object.assign({ mode: 'follow', cut: true }, o || {});
  const roomCam = (r, d, o) => { const far = (d - r.u0) < (r.u1 - d) ? r.u1 - 0.7 : r.u0 + 0.7, f = fl(r.f); return Object.assign({ mode: 'track', pos: U(far, 3.0, f + 2.65), look: U(mid(r) + (d - mid(r)) * 0.5, 8.6, f + 0.8), track: 0.4, lookH: 1.0, cut: true, indoor: true, fov: 64 }, o || {}); };
  const into = (r, d, dir, o) => { const f = fl(r.f); return [U(d - dir * 1.3, CV, f), { p: U(d, 12.75, f), cam: roomCam(r, d, o) }, U(d, 11.7, f), U(d - dir * 0.5, 11.0, f)]; };
  const outOf = (r, d, dir) => { const f = fl(r.f); return [U(d, 11.7, f), U(d, 12.75, f), U(d + dir * 0.7, 13.45, f), { p: U(d + dir * 1.7, CV, f), cam: follow() }]; };
  const inside = r => U(mid(r), 7, fl(r.f) + 0.5);
  const c4 = R('四教', 1), c3 = R('三教', 1), c2 = R('二教', 1), c1 = R('一教', 1);
  const meet = R('會議室', 2), prin = R('校長室', 2), lib = R('圖書室', 2), eng = R('英語教室', 2), c5 = R('五教', 2), c6 = R('六教', 2);
  const E = U(12, 34.9, 0.1);
  // 空拍：鏡頭在校地中心西邊一點往下看，畫面上方＝東（校門在畫面下方）
  const C0 = U(50, 33, 0), TOP = U(31, 33, 224), TOP2 = U(32.5, 33, 214);
  const roof = (u, v) => U(u, v, 10), LBL = 'rgba(20,28,36,0.88)', L2 = 'rgba(20,92,110,0.92)', EDGE2 = '#7fe3f0';
  const north1 = [['辦公室', 21, 0.12], ['樓梯', 31.1, 0.3, 0], ['四年級教室', 37.35, 0.5], ['三年級教室', 46.75, 0.62], ['二年級教室', 56.05, 0.74], ['一年級教室', 65.4, 0.86], ['樓梯', 71.8, 0.3, 12]];
  const aerialLabels = north1.map(([t, u, k, dy]) => ({ text: t, pos: roof(u, 7), dx: -250, dy: dy || 0, fs: 25, color: LBL, on: '04', k, off: { at: '08', k: 0.05 } }))
    .concat([{ text: '廁所', pos: roof(75.2, 7), dx: -250, dy: -22, fs: 25, color: LBL, on: '05', k: 0.08, off: { at: '08', k: 0.05 } },
      { text: '禮堂', pos: U(95, 8.5, 10.5), dx: -250, fs: 25, color: LBL, on: '05', k: 0.55 },
      { text: '國幼班', pos: U(54, 61, 4.5), dx: 230, fs: 25, color: LBL, on: '06', k: 0.35 },
      { text: '器材室', pos: U(26, 60, 4.5), dx: 230, fs: 25, color: LBL, on: '06', k: 0.7 },
      { text: '操場', pos: U(42, 21.3, 0.3), dx: 0, dy: -46, fs: 25, color: LBL, on: '07', k: 0.08 },
      { text: '足球場', pos: U(62, 39, 0.3), dx: 0, dy: -46, fs: 25, color: LBL, on: '07', k: 0.3 },
      { text: '籃球場', pos: U(115, 25, 0.3), dx: 0, dy: -46, fs: 25, color: LBL, on: '07', k: 0.68 }])
    .concat([['2F 會議室', 21, 7, -250, 0.22], ['2F 校長室', 19.5, 18, 230, 0.36], ['2F 圖書室', 37.35, 7, -250, 0.5], ['2F 英語教室', 46.75, 7, -250, 0.62], ['2F 五年級教室', 56.05, 7, -250, 0.76], ['2F 六年級教室', 65.4, 7, -250, 0.86]]
      .map(([t, u, v, dx, k]) => ({ text: t, pos: roof(u, v), dx, fs: 25, color: L2, edge: EDGE2, on: '08', k })));
  const stairCamE = { mode: 'track', pos: U(71.8, 7.0, F2 + 2.45), look: U(71.7, 11.2, F1 + 1.3), track: 0.55, lookH: 1.0, cut: true, indoor: true, fov: 66 };
  const corrCam = { mode: 'track', pos: U(29.2, 14.4, F1 + 2.2), look: U(44, 13.2, F1 + 1.2), track: 0.3, lookH: 1.1, cut: true, fov: 58 };
  const hallCam = { mode: 'track', pos: U(86.9, 3.4, 4.6), look: U(89.5, 13.0, 1.0), track: 0.45, lookH: 1.0, cut: true, indoor: true, fov: 64 };
  const meetCam = { mode: 'track', pos: U(14.4, 3.1, F2 + 2.7), look: U(24.5, 9.5, F2 + 0.8), track: 0.35, lookH: 1.0, cut: true, indoor: true, fov: 64 };
  const corr2 = { mode: 'track', pos: U(20.6, 13.0, F2 + 2.35), look: U(25.2, 14.2, F2 + 1.0), track: 0.5, lookH: 1.1, cut: true, indoor: true, fov: 62 };
  const prinCam = { mode: 'track', pos: U(17.6, 20.3, F2 + 2.6), look: U(23.4, 16.0, F2 + 0.9), track: 0.4, lookH: 1.0, cut: true, indoor: true, fov: 64 };
  const kCam = { mode: 'track', pos: U(48.5, 65.1, 2.9), look: U(40.5, 59.8, 0.6), track: 0.35, lookH: 1.0, cut: true, indoor: true, fov: 64 };
  const fn = (text, pos, on, o) => Object.assign({ text, pos, on, k: 0.15, fs: 30, color: 'rgba(20,28,36,0.88)' }, o || {});

  const A = { key: 'v2a', name: '必修2-校園', start: U(-2.6, 34.9, 0.1), yaw0: 1.33, follow: { dist: 4.2, height: 2.3 }, cam0: follow(), labels: [], steps: [
    { aerial: 0, vo: '02', voAt: 0.35, face: E, keys: [{ t: 0, p: U(-20, 35.6, 2.2), l: U(18, 33.6, 3.8), fov: 54 }, { t: 'end', p: U(-13.5, 35.4, 2.0), l: U(18, 33.6, 3.4), fov: 54 }] },
    { aerial: 0, vo: ['03', '04', '05', '06', '07', '08'], voAt: 0.2, pad: 0.7, face: E, labels: aerialLabels, keys: [
      { t: 0, p: U(-13.5, 35.4, 2.0), l: U(18, 33.6, 3.4), fov: 54 },
      { t: { at: '03', k: 0.5 }, p: U(8, 33.5, 70), l: U(52, 33, 0), fov: 46 },
      { t: { at: '03', k: 1, off: 0.25 }, p: TOP, l: C0, fov: 40 },
      { t: 'end', p: TOP2, l: C0, fov: 40 }] },
    { aerial: 2.6, face: E, keys: [{ t: 0, p: TOP2, l: C0, fov: 40 }, { t: 1.5, p: U(-16, 34.6, 16), l: U(4, 34.8, 1.2), fov: 50 }, { t: 2.6, p: U(-6.2, 34.45, 2.1), l: U(-1.0, 34.9, 1.4), fov: 52 }] },
    { walk: [U(1.5, 34.6, 0.1), U(6.5, 33.0, 0.1), U(11, 29.5, 0.1), U(14.6, 25, 0.1), U(16.2, 21.6, F1), U(18.4, 17.8, F1), U(21.6, 15.4, F1), U(25.5, CV, F1), U(29.5, CV, F1)], vo: '09', ff: 4.0, speed: 1.5,
      labels: [fn('穿堂', U(19.5, 16.8, F1 + 2.9), '09', { k: 0.5, off: 3.5 })] },
    { walk: [U(33, CV, F1)].concat(into(c4, 40.4, 1)), vo: '10', cam: corrCam, ff: 1.5, speed: 1.5,
      labels: [fn('四年級教室', U(40.4, 12.6, F1 + 2.9), '10', { k: 0.3, fs: 26, off: 3.2 }), fn('三、二、一年級教室', U(54.5, 12.6, F1 + 2.9), '10', { k: 0.55, fs: 26, lift: 0.12, off: 2.4 })] },
    { stop: 0, vo: '11', face: inside(c4), labels: [fn('四年級教室：哥姐休息', U(37.35, 7, F1 + 2.4), '11', { k: 0.05, color: 'rgba(176,64,40,0.93)' })] },
    { walk: outOf(c4, 40.4, 1).concat([U(48, CV, F1)]).concat(into(c2, 53.0, 1)), ff: 3.4, speed: 1.5 },
    { stop: 0, vo: '12', face: inside(c2), labels: [fn('一、二、三年級教室：小朋友上課', U(56.05, 7, F1 + 2.4), '12', { k: 0.05 })] },
    { walk: outOf(c2, 53.0, 1).concat([U(62, CV, F1), U(70, CV, F1), U(76.5, CV, F1), U(80.5, 14.2, F1), U(83.2, 16.0, 0.1), U(86.4, 16.7, 0.1), U(87.8, 16.3, 0.1), { p: U(87.8, 15.3, F1), cam: hallCam }, U(87.8, 14.0, F1), U(88.6, 12.7, F1), U(91.5, 12.5, F1)]), vo: '13', voAt: 0.3, ff: 4.2, speed: 1.5,
      labels: [fn('禮堂：吃飯・檢討・營包・早操', U(85.5, 9, 7.2), '13', { k: 0.5, off: 5.5 })] },
    { stop: 0.6, face: U(98, 8.5, F1) },
    { walk: [U(88.6, 12.9, F1), U(87.8, 14.2, F1), U(87.8, 15.4, F1), U(87.4, 16.4, 0.1), U(83.5, 16.3, 0.1), U(80.5, 14.4, F1), U(76.5, CV, F1), U(73.6, 13.5, F1), U(71.4, 13.1, F1)], vo: '14', voAt: 0.2, ff: 4.0, speed: 1.5, cam: follow() },
    { walk: [{ p: U(71.05, 12.2, F1), cam: stairCamE }, U(71.05, 11.75, F1), U(71.05, 10.1, F1 + half / 2), U(71.05, 8.5, F1 + half), U(71.25, 7.4, F1 + half), U(72.35, 7.4, F1 + half), U(72.55, 8.5, F1 + half), U(72.55, 10.1, F1 + half * 1.5), U(72.55, 11.75, F2), U(72.3, 12.9, F2), { p: U(71.2, CV, F2), cam: follow() }].concat(into(c6, 68.6, -1)), ff: 2.8, speed: 1.4 },
    { stop: 0, vo: '15', face: inside(c6), labels: [fn('五、六年級教室：睡覺', U(65.4, 7, F2 + 2.4), '15', { k: 0.05, color: 'rgba(40,70,160,0.92)' })] },
    { walk: outOf(c6, 68.6, -1).concat([U(60, CV, F2)]).concat(into(eng, 49.9, -1)), ff: 4.0, speed: 1.5 },
    { stop: 0, vo: '16', face: inside(eng), pad: 0.6, labels: [fn('英語教室：放行李', U(46.75, 7, F2 + 2.4), '16', { k: 0.0 })] },
    { walk: outOf(eng, 49.9, -1).concat([U(42, CV, F2)]).concat(into(lib, 34.2, -1)), ff: 4.0, speed: 1.5 },
    { stop: 0, vo: '17', face: inside(lib), pad: 0.5, labels: [fn('圖書室：睡覺', U(37.35, 7, F2 + 2.4), '17', { k: 0.0, color: 'rgba(40,70,160,0.92)' })] },
    { walk: outOf(lib, 34.2, -1).concat([U(31.5, CV, F2), U(29.8, CV, F2), U(28.0, CV, F2), { p: U(26.6, 12.75, F2), cam: meetCam }, U(26.6, 11.7, F2), U(26.0, 10.9, F2)]), ff: 3.2, speed: 1.4 },
    { stop: 0, vo: '18', face: U(21, 7, F2), labels: [fn('會議室：早餐・吹風機', U(21, 7, F2 + 2.4), '18', { k: 0.05 })] },
    { walk: [U(26.6, 11.7, F2), { p: U(26.6, 12.75, F2), cam: corr2 }, U(26.0, 13.6, F2), U(24.9, 14.0, F2), { p: U(24.6, 14.75, F2), cam: prinCam }, U(24.6, 15.6, F2), U(23.9, 16.5, F2)], ff: 2.2, speed: 1.3 },
    { stop: 0, vo: '19', face: U(19.5, 17.5, F2), pad: 0.6, labels: [fn('校長室：團本工作區', U(19.5, 18, F2 + 2.4), '19', { k: 0.05, color: 'rgba(176,64,40,0.93)' })] }] };

  const B = { key: 'v2b', name: '必修2-國幼班', start: U(40, 56.9, F1), yaw0: -0.24, follow: { dist: 4.2, height: 2.3 }, cam0: follow(), labels: [], steps: [
    { aerial: 2.2, face: U(40, 60, F1), keys: [{ t: 0, p: U(24, 24, 30), l: U(46, 58, 0), fov: 50 }, { t: 2.2, p: U(39.3, 52.6, 2.7), l: U(40.2, 59.5, 1.2), fov: 54 }] },
    { walk: [{ p: U(40, 58.0, F1), cam: kCam }, U(40, 59.4, F1), U(41.2, 60.6, F1)], speed: 1.1, vo: '20', voAt: 0.1,
      labels: [fn('國幼班：睡覺', U(45, 62, F1 + 2.4), '20', { k: 0.2, color: 'rgba(40,70,160,0.92)', off: 'scene' })] },
    { stop: 1.0, face: U(36, 62, F1) },
    { aerial: 0, vo: '21', voAt: 0.2, face: U(36, 62, F1), keys: [{ t: 0, p: U(73, 49.5, 4.6), l: U(84.5, 58, 1.8), fov: 54 }, { t: 'end', p: U(75, 49.6, 4.4), l: U(85, 58, 1.8), fov: 54 }],
      labels: [fn('遊樂器材區：小朋友不能過去', U(83.5, 58.5, 4.8), '21', { k: 0.1, color: 'rgba(176,64,40,0.95)', fs: 32 })] }] };

  RB.V2 = [A, B].map(sc => RB.compile(sc));
};
