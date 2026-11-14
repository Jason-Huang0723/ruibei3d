/* ================= 9. 必修2 影片用場景（Google 小姐配音對時；匯出時不畫說明字幕） ================= */
// 第四版（2026-11-14）：只剩校門口＋空拍（2-02～2-08），標籤改由影片合成時畫（匯出時記錄每格的標籤螢幕座標）。
RB.VO = {"01": 2.514, "02": 3.969, "03": 1.979, "04": 7.465, "05": 3.826, "06": 7.356, "07": 4.001, "08": 4.956, "09": 4.058, "10": 4.169, "11": 2.614, "12": 5.841, "13": 1.509, "14": 5.889, "15": 3.525, "16": 4.021, "17": 4.961, "18": 5.456, "19": 2.093, "20": 2.511, "21": 6.094, "22": 2.97, "23": 6.678, "24": 4.623, "25": 6.217, "26": 6.362, "27": 3.223, "28": 4.05, "29": 3.406, "30": 6.458, "31": 2.645, "32": 2.614};
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
      { text: '遊樂區（溜滑梯）', pos: U(82, 58.5, 3.4), dx: 230, fs: 25, color: LBL, on: '06', k: 0.62 },
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
  const stepCam = { mode: 'track', pos: U(21.75, 15.25, FP + 2.45), look: U(30.8, 15.8, F2 + 0.4), track: 0.5, lookH: 0.8, cut: true, indoor: true, fov: 60 };
  const passCam = { mode: 'track', pos: U(24.1, 15.5, FP + 2.3), look: U(22.6, 20.9, FP + 0.7), track: 0.55, lookH: 0.8, cut: true, indoor: true, fov: 64 };
  const kCam = { mode: 'track', pos: U(75.5, 65.2, 2.9), look: U(58.5, 60.3, 0.6), track: 0.4, lookH: 0.8, cut: true, indoor: true, fov: 64 };
  const kCorr = { mode: 'track', pos: U(53.8, 60.9, 2.7), look: U(33, 59.9, 0.9), track: 0.5, lookH: 0.8, cut: true, indoor: true, fov: 60 };
  const fn = (text, pos, on, o) => Object.assign({ text, pos, on, k: 0.15, fs: 30, color: 'rgba(20,28,36,0.88)' }, o || {});
  const SLEEP = 'rgba(40,70,160,0.92)', STAFF = 'rgba(176,64,40,0.93)';

  // 第四版：一個連續的空拍步驟——校門口（2-02）→ 平順升到正上方（2-03）→ 推近北排（一樓 2-04、2-05、二樓 2-06）→ 移到國幼班（2-07）→ 拉遠看操場（2-08）
  const N1 = (u, v) => U(u, v, 0);
  const A = { key: 'v2a', name: '必修2-校園空拍', start: U(-2.6, 34.9, 0.1), yaw0: 1.33, follow: { dist: 3.4, height: 1.9 }, cam0: follow(), labels: [], voGap: 0.45, steps: [
    { aerial: 0, vo: ['02', '03', '04', '05', '06', '07', '08'], voAt: 0.6, pad: 1.0, face: E, keys: [
      { t: 0, p: U(-20, 35.6, 2.2), l: U(18, 33.6, 3.8), fov: 54 },
      { t: { at: '02', k: 1 }, p: U(-14.5, 35.4, 2.6), l: U(18, 33.6, 3.6), fov: 54 },
      { t: { at: '03', k: 0.6 }, p: U(4, 34.4, 70), l: U(52, 33.4, 0), fov: 46 },
      // 第五版（使用者 11/14：畫面不要一直左右晃）：升到正上方後鏡頭固定，只極慢地往下推一點
      { t: { at: '03', k: 1, off: 0.6 }, p: U(44, 33, 192), l: N1(63, 33), fov: 40 },
      { t: 'end', p: U(44.6, 33, 186), l: N1(63, 33), fov: 40 }] }] };
  // 標籤的位置（世界座標）：匯出時每格投影成螢幕座標，給合成時畫字
  RB.V2PROBE = Object.fromEntries([
    ['辦公室', 17.2, 8, 10], ['樓梯1', 31.1, 7, 10], ['四年級教室', 37.35, 7, 10], ['三年級教室', 46.75, 7, 10], ['二年級教室', 56.05, 7, 10], ['一年級教室', 65.4, 7, 10], ['樓梯2', 71.8, 12, 10],
    ['廁所', 75.2, 7, 10], ['禮堂', 95, 8.5, 10.5], ['會議室', 23.5, 7, 10], ['校長室', 17.2, 18.5, 10], ['圖書室', 37.35, 7, 10], ['英語教室', 46.75, 7, 10], ['五年級教室', 56.05, 7, 10], ['六年級教室', 65.4, 7, 10],
    ['國幼班', 60, 61, 4.5], ['遊樂區', 82, 58.5, 3.4], ['操場', 42, 21.3, 0.3], ['大足球場', 58.9, 40.25, 0.3], ['小足球場', 89.5, 40.25, 0.3], ['籃球場', 115, 25, 0.3], ['校門', -1, 33, 1]]
    .map(([k, u, v, h]) => [k, U(u, v, h)]));
  RB.V2 = [A].map(sc => RB.compile(sc));
};
