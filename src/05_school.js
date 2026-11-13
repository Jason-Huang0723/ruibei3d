/* ================= 6. 瑞北國小（依場地平面圖、建物框、舊必修2 簡報照片與口述） ================= */
// 校地座標：原點＝校地西北角，u 沿北側圍牆往東（m），v 往南（m）。校地 126 × 64.6 m，偏轉約 −14°。
RB.CF = { o: [-50.7, 50.6], eu: [0.9715, -0.2371], ev: [-0.2371, -0.9715] };
RB.uv2xy = (u, v) => [RB.CF.o[0] + u * RB.CF.eu[0] + v * RB.CF.ev[0], RB.CF.o[1] + u * RB.CF.eu[1] + v * RB.CF.ev[1]];
RB.campusAngle = Math.atan2(RB.CF.eu[1], RB.CF.eu[0]);
RB.GROUND = 0;
// 北排教室大樓尺寸。西端是 L 形：一樓辦公室（北）＋穿堂（南），二樓會議室＋校長室（地板高 0.45 m，從樓梯口走幾階小樓梯上去）。
const S_ = RB.S = { F1: 0.3, F2: 3.9, FH: 3.6, EAVE: 7.5, V0: 2.0, V1: 12.2, V2: 15.0, UW: 13, UE: 77, PU: 21.4, PV: 22, WX: 21.4, WS: 22, FP: 4.35 };
// 房間（f=樓層）。門的位置 d：門中心的 u。x:true 的是不在北排一列裡的房間（有自己的 v 範圍）。
RB.ROOMS = [
  { f: 1, u0: 13, u1: 21.4, v0: 2, v1: 14, name: '辦公室', type: 'office', x: true },
  { f: 1, u0: 21.4, u1: 29.5, name: '', type: 'other', d: [27.8] },
  { f: 1, u0: 29.5, u1: 32.7, name: '樓梯', type: 'stairs' },
  { f: 1, u0: 32.7, u1: 42.0, name: '四教', type: 'class4', d: [34.2, 40.5] },
  { f: 1, u0: 42.0, u1: 51.5, name: '三教', type: 'class', d: [43.5, 50.0] },
  { f: 1, u0: 51.5, u1: 60.6, name: '二教', type: 'class', d: [53.0, 59.1] },
  { f: 1, u0: 60.6, u1: 70.2, name: '一教', type: 'class', d: [62.1, 68.7] },
  { f: 1, u0: 70.2, u1: 73.4, name: '樓梯', type: 'stairs' },
  { f: 1, u0: 73.4, u1: 77.0, name: '廁所', type: 'toilet', d: [74.3, 76.1] },
  { f: 2, u0: 13, u1: 17.6, v0: 2, v1: 15, name: '', type: 'other', x: true },
  { f: 2, u0: 17.6, u1: 29.5, v0: 2, v1: 15, name: '會議室', type: 'meeting', x: true },
  { f: 2, u0: 29.5, u1: 32.7, name: '樓梯', type: 'stairs' },
  { f: 2, u0: 32.7, u1: 42.0, name: '圖書室', type: 'library', d: [37.2], glass: true },
  { f: 2, u0: 42.0, u1: 51.5, name: '英語教室', type: 'english', d: [49.05], glass: true },
  { f: 2, u0: 51.5, u1: 60.6, name: '五教', type: 'sleep', d: [53.0, 59.1] },
  { f: 2, u0: 60.6, u1: 70.2, name: '六教', type: 'sleep', d: [62.1, 68.7] },
  { f: 2, u0: 70.2, u1: 73.4, name: '樓梯', type: 'stairs' },
  { f: 2, u0: 73.4, u1: 77.0, name: '廁所', type: 'toilet', d: [74.3, 76.1] },
  { f: 1, u0: 13, u1: 21.4, v0: 14, v1: 22, name: '穿堂', type: 'hall', x: true },
  { f: 2, u0: 13, u1: 21.4, v0: 15, v1: 22, name: '校長室', type: 'principal', x: true },
];
RB.U = (u, v, h) => { const [x, y] = RB.uv2xy(u, v); return [x, RB.GROUND + h, -y]; };

const canvasTex = (w, h, draw, rep) => { const cv = new OffscreenCanvas(w, h), g = cv.getContext('2d'); draw(g, w, h); const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; if (rep !== false) t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; };
const noiseFill = (g, n, base, amp, count, size) => { g.fillStyle = base; g.fillRect(0, 0, n, n); for (let i = 0; i < count; i++) { const x = Math.random() * n, y = Math.random() * n, r = Math.random() * size + 0.5, a = (Math.random() - 0.5) * amp; g.fillStyle = a > 0 ? 'rgba(255,255,230,' + a + ')' : 'rgba(0,20,0,' + (-a) + ')'; g.fillRect(x, y, r, r * (0.6 + Math.random())); } };
const FONT_ = '"Microsoft JhengHei","Noto Sans TC","PingFang TC",sans-serif';
const folds = (g, w, h, base, dark, n) => { g.fillStyle = base; g.fillRect(0, 0, w, h); for (let x = 0; x < w; x++) { const s = 0.5 + 0.5 * Math.sin(x / w * n * Math.PI * 2); g.fillStyle = 'rgba(' + dark + ',' + (0.45 * (1 - s)) + ')'; g.fillRect(x, 0, 1, h); g.fillStyle = 'rgba(255,255,255,' + (0.10 * s * s) + ')'; g.fillRect(x, 0, 1, h); } };
const grid = (g, w, h, base, line, nx, ny, lw) => { g.fillStyle = base; g.fillRect(0, 0, w, h); g.fillStyle = line; for (let i = 0; i <= nx; i++) g.fillRect(i * w / nx - lw / 2, 0, lw, h); for (let j = 0; j <= ny; j++) g.fillRect(0, j * h / ny - lw / 2, w, lw); };
const S_mat = o => new THREE.MeshStandardMaterial(o);
function textMat(text, o) { o = Object.assign({ w: 512, h: 128, bg: '#ffffff', fg: '#20304a', size: 64, border: null }, o || {}); return S_mat({ roughness: 0.6, map: canvasTex(o.w, o.h, (g, w, h) => { g.fillStyle = o.bg; g.fillRect(0, 0, w, h); if (o.border) { g.strokeStyle = o.border; g.lineWidth = 8; g.strokeRect(4, 4, w - 8, h - 8); } g.fillStyle = o.fg; g.font = '700 ' + o.size + 'px ' + FONT_; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, w / 2, h / 2 + 4); }, false) }); }

function schoolMaterials() {
  const M = {}, S = S_mat;
  // 牆、柱、框（照片：米白牆、白色窗框）
  M.wall = S({ color: 0xf1ebda, roughness: 0.85 });
  M.wallIn = S({ color: 0xf3eedf, roughness: 0.9 });
  M.trim = S({ color: 0xdcd6c6, roughness: 0.8 });
  M.column = S({ color: 0xf0eadb, roughness: 0.8 });
  M.frame = S({ color: 0xf2f2ee, roughness: 0.5, metalness: 0.1 });
  M.glass = S({ color: 0x9fbccb, roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.25, depthWrite: false });
  M.rail = S({ color: 0x6f8796, roughness: 0.5, metalness: 0.4 });
  M.dado = S({ color: 0x3f8f8c, roughness: 0.7 });                                   // 二樓走廊牆腳的藍綠色
  // 地板：磨石子（教室、走廊）、紅磚（穿堂）、木地板（圖書室）
  M.floor = S({ roughness: 0.7, map: canvasTex(512, 512, (g, n) => { g.fillStyle = '#bdbbb4'; g.fillRect(0, 0, n, n); const cs = ['#8f8c86', '#e9e7e1', '#6a6862', '#cbbca4', '#a5a29c']; for (let i = 0; i < 26000; i++) { g.fillStyle = cs[i % cs.length]; const x = Math.random() * n, y = Math.random() * n, r = 0.6 + Math.random() * 2.4; g.fillRect(x, y, r, r * (0.5 + Math.random())); } g.fillStyle = 'rgba(90,85,75,0.55)'; g.fillRect(0, 0, n, 3); g.fillRect(0, 0, 3, n); }) });
  M.paver = S({ roughness: 0.9, map: canvasTex(512, 512, (g, n) => { g.fillStyle = '#7d4a3a'; g.fillRect(0, 0, n, n); const bw = 64, bh = 32; for (let y = 0; y < n; y += bh) for (let x = ((y / bh) % 2) * bw / 2 - bw; x < n; x += bw) { const l = 38 + Math.random() * 14; g.fillStyle = 'hsl(' + (12 + Math.random() * 8) + ',38%,' + l + '%)'; g.fillRect(x + 2, y + 2, bw - 4, bh - 4); } }) });
  M.woodFloor = S({ roughness: 0.45, map: canvasTex(512, 512, (g, n) => { const pw = 32; for (let x = 0; x < n; x += pw) { let y = -Math.random() * 200; while (y < n) { const L = 120 + Math.random() * 160, l = 24 + Math.random() * 10; g.fillStyle = 'hsl(' + (10 + Math.random() * 8) + ',55%,' + l + '%)'; g.fillRect(x, y, pw, L); for (let k = 0; k < 6; k++) { g.fillStyle = 'rgba(30,8,0,' + (0.08 + Math.random() * 0.1) + ')'; g.fillRect(x + Math.random() * pw, y, 1, L); } g.fillStyle = 'rgba(20,5,0,0.7)'; g.fillRect(x, y, pw, 2); y += L; } g.fillStyle = 'rgba(20,5,0,0.7)'; g.fillRect(x, 0, 2, n); } }) });
  M.tileGrid = S({ roughness: 0.35, map: canvasTex(256, 256, (g, w, h) => grid(g, w, h, '#f3f3ef', '#8e938f', 8, 8, 3)) });
  M.tileW = S({ color: 0xdfe6e8, roughness: 0.4 });
  // 教室家具：綠色桌墊的木課桌、木椅、鐵灰老師桌
  M.deskTop = S({ color: 0x3e7a5c, roughness: 0.6 }); M.deskBody = S({ color: 0xb98450, roughness: 0.7 });
  M.chair = S({ color: 0xa8703f, roughness: 0.7 }); M.metal = S({ color: 0x6d7378, roughness: 0.5, metalness: 0.6 });
  M.tdesk = S({ color: 0x5f666b, roughness: 0.6, metalness: 0.3 }); M.desk = S({ color: 0xc9a77a, roughness: 0.7 });
  M.board = S({ color: 0x2e5e4a, roughness: 0.9 }); M.boardFrame = S({ color: 0xc8ccce, roughness: 0.4, metalness: 0.6 });
  M.tv = S({ color: 0x121416, roughness: 0.3 }); M.screen = S({ color: 0x1e3550, roughness: 0.2, emissive: 0x0c1826 });
  const bulletinTex = rep => canvasTex(512, 256, (g, w, h) => { g.fillStyle = '#e7b7c9'; g.fillRect(0, 0, w, h); const cs = ['#fff3b0', '#bde0fe', '#caffbf', '#ffd6a5', '#ffffff', '#a0c4ff', '#ffadad']; for (let i = 0; i < 46; i++) { g.save(); g.translate(Math.random() * w, Math.random() * h); g.rotate((Math.random() - 0.5) * 0.3); g.fillStyle = cs[i % cs.length]; g.fillRect(-22, -16, 30 + Math.random() * 40, 22 + Math.random() * 30); g.fillStyle = 'rgba(60,60,90,0.5)'; for (let k = 0; k < 3; k++) g.fillRect(-16, -8 + k * 7, 24, 2); g.restore(); } g.strokeStyle = '#8a5a3a'; g.lineWidth = 10; g.strokeRect(5, 5, w - 10, h - 10); }, rep);
  M.bulletin = S({ roughness: 0.9, map: bulletinTex(false) }); M.bulletinRow = S({ roughness: 0.9, map: bulletinTex(true) }); M.bulletinRow.map.repeat.set(3, 1);
  M.locker = S({ roughness: 0.6, map: canvasTex(256, 64, (g, w, h) => { g.fillStyle = '#5ea9d6'; g.fillRect(0, 0, w, h); g.fillStyle = '#2f6d96'; for (let i = 0; i < 8; i++) for (let j = 0; j < 2; j++) g.fillRect(i * 32 + 3, j * 32 + 3, 26, 26); g.fillStyle = '#9fd0ee'; for (let i = 0; i < 8; i++) for (let j = 0; j < 2; j++) g.fillRect(i * 32 + 6, j * 32 + 6, 20, 4); }) }); M.locker.map.repeat.set(3, 1);
  M.clock = S({ roughness: 0.4, map: canvasTex(128, 128, (g, w) => { g.fillStyle = '#f7f7f2'; g.fillRect(0, 0, w, w); g.strokeStyle = '#222'; g.lineWidth = 8; g.beginPath(); g.arc(64, 64, 58, 0, 7); g.stroke(); g.lineWidth = 5; g.beginPath(); g.moveTo(64, 64); g.lineTo(64, 24); g.moveTo(64, 64); g.lineTo(92, 74); g.stroke(); }, false) });
  M.fan = S({ color: 0xe8e8e4, roughness: 0.5 }); M.ac = S({ color: 0xf6f6f2, roughness: 0.4 }); M.fanWood = S({ color: 0x7a5236, roughness: 0.6 });
  M.light = S({ color: 0xffffff, emissive: 0xfffbe8, emissiveIntensity: 1.0 });
  M.ceil = S({ color: 0xf5f3ec, roughness: 0.95, emissive: 0x77756e });
  M.shelf = S({ color: 0xa6774a, roughness: 0.8 }); M.book = S({ vertexColors: true, roughness: 0.8 });
  M.sofa = S({ color: 0x5b3f33, roughness: 0.9 }); M.cabinet = S({ color: 0xd9d4c8, roughness: 0.6, metalness: 0.2 });
  M.mtTop = S({ color: 0xd9874a, roughness: 0.5 }); M.mtBody = S({ color: 0xd6cfbd, roughness: 0.6 }); M.blueChair = S({ color: 0x2f86c8, roughness: 0.5 });
  M.kidR = S({ color: 0xd9343a, roughness: 0.5 }); M.kidY = S({ color: 0xf2c230, roughness: 0.5 }); M.kidB = S({ color: 0x2f6fd0, roughness: 0.5 });
  M.white = S({ color: 0xf2f2ee, roughness: 0.6 }); M.stall = S({ color: 0x7fa7c4, roughness: 0.6 });
  M.door = S({ color: 0x8a5a3a, roughness: 0.7 });
  M.curtain2 = S({ roughness: 0.95, side: THREE.DoubleSide, map: canvasTex(256, 64, (g, w, h) => folds(g, w, h, '#ece4cf', '120,100,70', 14), true) });
  // 禮堂：紅絨布幕、玫瑰紅窗簾、白磁磚舞台、粉綠牆
  M.velvet = S({ roughness: 0.95, side: THREE.DoubleSide, map: canvasTex(256, 64, (g, w, h) => folds(g, w, h, '#b3161d', '50,0,0', 10)) });
  M.rose = S({ roughness: 0.95, side: THREE.DoubleSide, map: canvasTex(128, 64, (g, w, h) => folds(g, w, h, '#a45362', '60,10,20', 5)) });
  M.pinkCurtain = S({ roughness: 0.95, side: THREE.DoubleSide, map: canvasTex(128, 64, (g, w, h) => folds(g, w, h, '#cf8597', '90,30,50', 6)) });
  M.hall = S({ color: 0xf2e6d8, roughness: 0.85 }); M.teal = S({ color: 0xa9d5cf, roughness: 0.85 }); M.paleGreen = S({ color: 0xdbe9d2, roughness: 0.85 });
  M.stageFloor = S({ color: 0xb98c5a, roughness: 0.55 }); M.fold = S({ color: 0x8b9197, roughness: 0.5, metalness: 0.5 }); M.hallTable = S({ color: 0x4c4f53, roughness: 0.6 });
  // 穿堂：彩色天花板（原住民圖紋邊框＋標語）、彩繪柱子、紅字跑馬燈
  M.hallCeil = S({ roughness: 0.8, emissive: 0xffffff, emissiveIntensity: 0.42, map: canvasTex(2048, 1024, (g, w, h) => {
    g.fillStyle = '#f5f2ea'; g.fillRect(0, 0, w, h); const P = [['#3fa34d', '守規矩，擁有良好品德'], ['#2459b8', '愛人愛己，懂得感恩'], ['#e8762c', '具創意與自信解決問題'], ['#f2c230', '主動參與學習，勇於嘗試']];
    for (let i = 0; i < 4; i++) { const x0 = (i % 2) * w / 2, y0 = Math.floor(i / 2) * h / 2, pw = w / 2, ph = h / 2; g.fillStyle = P[i][0]; g.fillRect(x0 + 30, y0 + 30, pw - 60, ph - 60);
      const bd = 46; g.fillStyle = '#ffffff'; g.fillRect(x0 + 30, y0 + ph - 30 - bd * 2, pw - 60, bd * 2); for (let x = x0 + 30; x < x0 + pw - 30 - 40; x += 40) { g.fillStyle = ['#d32f2f', '#1b1b1b', '#1e5bb8', '#f2c230'][Math.floor((x - x0) / 40) % 4]; g.beginPath(); g.moveTo(x, y0 + ph - 30 - bd * 2); g.lineTo(x + 20, y0 + ph - 30 - bd); g.lineTo(x + 40, y0 + ph - 30 - bd * 2); g.fill(); g.beginPath(); g.moveTo(x, y0 + ph - 30); g.lineTo(x + 20, y0 + ph - 30 - bd); g.lineTo(x + 40, y0 + ph - 30); g.fill(); }
      g.fillStyle = '#ffffff'; g.font = '700 60px ' + FONT_; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(P[i][1], x0 + pw / 2, y0 + ph - 30 - bd * 2 - 50); }
    g.fillStyle = '#d9d4c6'; g.fillRect(w / 2 - 14, 0, 28, h); g.fillRect(0, h / 2 - 14, w, 28); }, false) }); M.hallCeil.emissiveMap = M.hallCeil.map;
  M.hallCol = S({ roughness: 0.8, map: canvasTex(256, 512, (g, w, h) => { const cs = ['#f2c230', '#d32f2f', '#1e5bb8', '#1b1b1b', '#ffffff']; for (let y = 0; y < h; y += 64) { g.fillStyle = cs[(y / 64) % 5]; g.fillRect(0, y, w, 64); g.fillStyle = cs[(y / 64 + 2) % 5]; for (let x = 0; x < w; x += 32) { g.beginPath(); g.moveTo(x, y + 64); g.lineTo(x + 16, y + 18); g.lineTo(x + 32, y + 64); g.fill(); } } }) });
  M.led = S({ roughness: 0.4, emissive: 0x330000, map: canvasTex(512, 64, (g, w, h) => { g.fillStyle = '#0d0d0d'; g.fillRect(0, 0, w, h); g.fillStyle = '#ff2a2a'; g.font = '700 40px ' + FONT_; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('趴下、掩護、穩住', w / 2, h / 2 + 2); }, false) });
  M.banner = S({ roughness: 0.8, map: canvasTex(1024, 128, (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, '#5ec3f0'); gr.addColorStop(0.5, '#9be15d'); gr.addColorStop(1, '#ffd166'); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = '#ffffff'; g.font = '700 64px ' + FONT_; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('快樂學習・健康成長', w / 2, h / 2 + 4); for (let i = 0; i < 10; i++) { g.fillStyle = ['#ef476f', '#118ab2', '#ffffff'][i % 3]; g.beginPath(); g.arc(30 + i * 108, i % 2 ? 18 : h - 18, 10, 0, 7); g.fill(); } }, false) });
  // 圖書室壁畫（大樹與看書的小朋友）
  M.libMural = S({ roughness: 0.85, map: canvasTex(1024, 256, (g, w, h) => { g.fillStyle = '#cfeaf6'; g.fillRect(0, 0, w, h); g.fillStyle = '#7cc35a'; g.beginPath(); g.moveTo(0, h); for (let x = 0; x <= w; x += 32) g.lineTo(x, h - 50 - 20 * Math.sin(x / 90)); g.lineTo(w, h); g.fill();
    for (const tx of [140, 520, 860]) { g.fillStyle = '#7a4a2a'; g.fillRect(tx - 10, 90, 20, h - 120); g.fillStyle = '#3f9a49'; g.beginPath(); g.arc(tx, 80, 70, 0, 7); g.fill(); g.beginPath(); g.arc(tx - 50, 110, 50, 0, 7); g.fill(); g.beginPath(); g.arc(tx + 50, 110, 50, 0, 7); g.fill(); }
    for (const [kx, c] of [[300, '#ef476f'], [380, '#118ab2'], [680, '#ffd166'], [740, '#06d6a0']]) { g.fillStyle = '#f6d1b0'; g.beginPath(); g.arc(kx, h - 110, 16, 0, 7); g.fill(); g.fillStyle = c; g.fillRect(kx - 16, h - 94, 32, 40); g.fillStyle = '#ffffff'; g.fillRect(kx - 22, h - 86, 44, 18); } }, false) });
  // 國幼班西側山牆彩繪（愛心與小朋友）
  M.kMural = S({ roughness: 0.85, map: canvasTex(512, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#8fd3f4'); gr.addColorStop(1, '#d8f3dc'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    const heart = (x, y, s, c) => { g.fillStyle = c; g.beginPath(); g.moveTo(x, y + s * 0.3); g.bezierCurveTo(x, y, x - s / 2, y, x - s / 2, y + s * 0.3); g.bezierCurveTo(x - s / 2, y + s * 0.6, x, y + s * 0.8, x, y + s); g.bezierCurveTo(x, y + s * 0.8, x + s / 2, y + s * 0.6, x + s / 2, y + s * 0.3); g.bezierCurveTo(x + s / 2, y, x, y, x, y + s * 0.3); g.fill(); };
    heart(110, 30, 80, '#e63946'); heart(250, 50, 60, '#ff7f50'); heart(390, 25, 90, '#e63946');
    for (let i = 0; i < 5; i++) { const x = 60 + i * 95, c = ['#ffbe0b', '#3a86ff', '#ff006e', '#8338ec', '#06d6a0'][i]; g.fillStyle = '#f6d1b0'; g.beginPath(); g.arc(x, 165, 20, 0, 7); g.fill(); g.fillStyle = c; g.fillRect(x - 18, 186, 36, 50); g.fillStyle = '#333'; g.fillRect(x - 7, 160, 4, 4); g.fillRect(x + 3, 160, 4, 4); } }, false) });
  M.roof = S({ roughness: 0.7, side: THREE.DoubleSide, map: canvasTex(128, 128, (g, w, h) => { g.fillStyle = '#c0533c'; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 8) { g.fillStyle = 'rgba(0,0,0,0.22)'; g.fillRect(0, y, w, 2); for (let x = (y / 8 % 2) * 8; x < w; x += 16) { g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(x, y, 1, 8); } } }) });
  M.canopy = S({ color: 0x67b8aa, roughness: 0.4, transparent: true, opacity: 0.8, side: THREE.DoubleSide });
  M.mat1 = S({ color: 0xe86a5a, roughness: 0.9 }); M.mat2 = S({ color: 0x5aa0e8, roughness: 0.9 }); M.mat3 = S({ color: 0xf2c94c, roughness: 0.9 }); M.mat4 = S({ color: 0x6fcf97, roughness: 0.9 });
  M.fence = S({ color: 0x4d6b5c, roughness: 0.6, metalness: 0.3 });
  M.gate = S({ color: 0xb9bec2, roughness: 0.35, metalness: 0.7 });
  M.play = S({ color: 0xd94f3a, roughness: 0.6 }); M.play2 = S({ color: 0x2f7fc1, roughness: 0.6 }); M.play3 = S({ color: 0xf2c230, roughness: 0.6 });
  M.flag = S({ color: 0xd8262c, roughness: 0.8, side: THREE.DoubleSide });
  // 大門：灰色石材門柱＋粉黑三角圖騰、地球儀、校名牆
  M.pillar = S({ roughness: 0.85, map: canvasTex(256, 256, (g, n) => { noiseFill(g, n, '#77797a', 0.18, 6000, 2); for (const [y0, flip] of [[18, 0], [170, 1]]) for (let x = 0; x < n; x += 64) { g.fillStyle = '#d99a95'; g.beginPath(); if (!flip) { g.moveTo(x + 4, y0); g.lineTo(x + 32, y0 + 60); g.lineTo(x + 60, y0); } else { g.moveTo(x + 4, y0 + 60); g.lineTo(x + 32, y0); g.lineTo(x + 60, y0 + 60); } g.fill(); g.fillStyle = '#2a2a2a'; g.beginPath(); if (!flip) { g.moveTo(x + 18, y0); g.lineTo(x + 32, y0 + 30); g.lineTo(x + 46, y0); } else { g.moveTo(x + 18, y0 + 60); g.lineTo(x + 32, y0 + 30); g.lineTo(x + 46, y0 + 60); } g.fill(); } }) });
  M.globe = S({ roughness: 0.4, map: canvasTex(256, 128, (g, w, h) => { g.fillStyle = '#2f73b7'; g.fillRect(0, 0, w, h); g.fillStyle = '#7cc3a0'; for (let i = 0; i < 9; i++) { g.beginPath(); g.ellipse(Math.random() * w, Math.random() * h, 12 + Math.random() * 30, 8 + Math.random() * 18, Math.random(), 0, Math.PI * 2); g.fill(); } }, true) });
  M.plaque = textMat('瑞 北 國 民 小 學', { bg: '#6c6e70', fg: '#3a3a3a', size: 62 });
  M.sign = textMat('花蓮縣瑞北國民小學', { bg: '#f1ebda', fg: '#5a5a5a', size: 56 });
  M.grass = S({ roughness: 1, map: canvasTex(512, 512, (g, n) => { noiseFill(g, n, '#6c8a4c', 0.24, 30000, 3); for (let i = 0; i < 40; i++) { const x = Math.random() * n, y = Math.random() * n, r = 20 + Math.random() * 60, gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(140,120,70,0.22)'); gr.addColorStop(1, 'rgba(140,120,70,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); } }) });
  M.clay = S({ roughness: 1, map: canvasTex(256, 256, (g, n) => noiseFill(g, n, '#a95b3c', 0.18, 18000, 3)) });
  M.conc = S({ roughness: 0.95, map: canvasTex(256, 256, (g, n) => { noiseFill(g, n, '#b9b6ad', 0.10, 9000, 2); g.strokeStyle = 'rgba(60,60,60,0.35)'; g.lineWidth = 2; for (let i = 0; i <= n; i += n / 2) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, n); g.stroke(); g.beginPath(); g.moveTo(0, i); g.lineTo(n, i); g.stroke(); } }) });
  M.court = S({ roughness: 0.9, color: 0x3f6f5a }); M.line = S({ color: 0xf2f2ea, roughness: 0.8 });
  M.bag = S({ vertexColors: true, roughness: 0.9 });
  M.doorGreen = S({ color: 0x3f8f5f, roughness: 0.6 }); M.knob = S({ color: 0xc9ccd0, roughness: 0.3, metalness: 0.8 }); M.foamR = S({ color: 0xd9433a, roughness: 0.9 }); M.foamB = S({ color: 0x2f6fd0, roughness: 0.9 });
  M.glassDoor = S({ color: 0xbfd6e2, roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.35, depthWrite: false, side: THREE.DoubleSide });
  return M;
}

// ---- 幾何小工具（所有靜態零件最後依材質合併，減少繪製次數） ----
const PARTS = new Map();
function addPart(mat, geo, matrix) { const g = geo.index ? geo.toNonIndexed() : geo.clone(); g.applyMatrix4(matrix); if (!g.attributes.uv) g.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2)); if (!g.attributes.normal) g.computeVertexNormals(); for (const k of Object.keys(g.attributes)) if (!['position', 'normal', 'uv'].includes(k)) g.deleteAttribute(k); if (!PARTS.has(mat)) PARTS.set(mat, []); PARTS.get(mat).push(g); }
const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _s = new THREE.Vector3(1, 1, 1), _p = new THREE.Vector3(), _up = new THREE.Vector3(0, 1, 0);
// 校地座標下的長方體：u0..u1 × v0..v1 × 高度 h0..h1（相對校地地面）；uvScale：[水平, 垂直] 每幾公尺一張貼圖
function obox(mat, u0, u1, v0, v1, h0, h1, uvScale) {
  const ext = (h0 === 0 && h1 > 0.5) ? 1.5 : 0; h0 -= ext; const w = u1 - u0, dd = v1 - v0, h = h1 - h0; if (w <= 0.001 || dd <= 0.001 || h <= 0.001) return; const g = new THREE.BoxGeometry(w, h, dd);
  if (uvScale) { const uv = g.attributes.uv, n = g.attributes.normal, p = g.attributes.position; for (let i = 0; i < uv.count; i++) { const nx = Math.abs(n.getX(i)), ny = Math.abs(n.getY(i)), px = p.getX(i) + w / 2 + u0, py = p.getY(i) + h / 2 + h0, pz = p.getZ(i) + dd / 2 + v0; if (ny > 0.5) uv.setXY(i, px / uvScale[0], pz / uvScale[0]); else if (nx > 0.5) uv.setXY(i, pz / uvScale[0], py / uvScale[1]); else uv.setXY(i, px / uvScale[0], py / uvScale[1]); } }
  const [x, y] = RB.uv2xy((u0 + u1) / 2, (v0 + v1) / 2); _p.set(x, RB.GROUND + (h0 + h1) / 2, -y); _q.setFromAxisAngle(_up, RB.campusAngle); _m.compose(_p, _q, _s); addPart(mat, g, _m);
}
// 貼一張圖的平面：axis 'u'（牆面朝 ±v）、'v'（牆面朝 ±u）、'h'（水平，朝下或朝上）。貼圖 0..1 剛好鋪滿。
function panel(mat, axis, a0, a1, b0, b1, c, face) {
  let P; if (axis === 'u') P = (s, t) => RB.U(a0 + (a1 - a0) * s, c, b0 + (b1 - b0) * t); else if (axis === 'v') P = (s, t) => RB.U(c, a0 + (a1 - a0) * s, b0 + (b1 - b0) * t); else P = (s, t) => RB.U(a0 + (a1 - a0) * s, b0 + (b1 - b0) * t, c);
  const A = P(0, 0), B = P(1, 0), C = P(1, 1), D = P(0, 1), pos = face > 0 ? [...A, ...B, ...C, ...A, ...C, ...D] : [...A, ...C, ...B, ...A, ...D, ...C], uv = face > 0 ? [0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1] : [0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1];
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.computeVertexNormals(); addPart(mat, g, new THREE.Matrix4());
}
// 一般幾何放到校地座標 (u,v,h) 並旋轉 yaw（以校地 u 軸為 0）
function place(mat, geo, u, v, h, yaw, sc) { const [x, y] = RB.uv2xy(u, v); _p.set(x, RB.GROUND + h, -y); _q.setFromAxisAngle(_up, RB.campusAngle + (yaw || 0)); const s = sc || 1; _m.compose(_p, _q, new THREE.Vector3(s, s, s)); addPart(mat, geo, _m); }
// 窗：玻璃＋白框（橫框、直框、中間橫檔）
function winU(M, a, b, vm, lo, hi) { obox(M.glass, a, b, vm - 0.01, vm + 0.01, lo, hi); obox(M.frame, a, b, vm - 0.05, vm + 0.05, lo, lo + 0.06); obox(M.frame, a, b, vm - 0.05, vm + 0.05, hi - 0.06, hi); obox(M.frame, a, b, vm - 0.04, vm + 0.04, lo + (hi - lo) * 0.72, lo + (hi - lo) * 0.72 + 0.05); const n = Math.max(1, Math.round((b - a) / 0.8)); for (let k = 0; k <= n; k++) { const uu = a + (b - a) * k / n; obox(M.frame, uu - 0.03, uu + 0.03, vm - 0.05, vm + 0.05, lo, hi); } }
function winV(M, um, a, b, lo, hi) { obox(M.glass, um - 0.01, um + 0.01, a, b, lo, hi); obox(M.frame, um - 0.05, um + 0.05, a, b, lo, lo + 0.06); obox(M.frame, um - 0.05, um + 0.05, a, b, hi - 0.06, hi); const n = Math.max(1, Math.round((b - a) / 0.8)); for (let k = 0; k <= n; k++) { const vv = a + (b - a) * k / n; obox(M.frame, um - 0.05, um + 0.05, vv - 0.03, vv + 0.03, lo, hi); } }
// 沿 u 方向的牆（厚度在 v0..v1），openings: [{a,b,lo,hi,glass}]
function wallU(M, mat, v0, v1, u0, u1, h0, h1, openings, uvs) {
  const ops = (openings || []).slice().sort((p, q) => p.a - q.a); let cur = u0;
  for (const o of ops) { obox(mat, cur, o.a, v0, v1, h0, h1, uvs); if (o.lo > h0) obox(mat, o.a, o.b, v0, v1, h0, o.lo, uvs); obox(mat, o.a, o.b, v0, v1, o.hi, h1, uvs); if (o.glass) winU(M, o.a, o.b, (v0 + v1) / 2, o.lo, o.hi); cur = o.b; }
  obox(mat, cur, u1, v0, v1, h0, h1, uvs);
}
// 沿 v 方向的牆（厚度在 u0..u1）
function wallV(M, mat, u0, u1, v0, v1, h0, h1, openings) {
  const ops = (openings || []).slice().sort((p, q) => p.a - q.a); let cur = v0;
  for (const o of ops) { obox(mat, u0, u1, cur, o.a, h0, h1); if (o.lo > h0) obox(mat, u0, u1, o.a, o.b, h0, o.lo); obox(mat, u0, u1, o.a, o.b, o.hi, h1); if (o.glass) winV(M, (u0 + u1) / 2, o.a, o.b, o.lo, o.hi); cur = o.b; }
  obox(mat, u0, u1, cur, v1, h0, h1);
}
// 牆腳（磁磚或油漆）：沿牆面貼一層，跳過門
function dadoU(mat, vFace, dir, u0, u1, fl, top, gaps) { const gs = (gaps || []).slice().sort((p, q) => p[0] - q[0]); let cur = u0; for (const [a, b] of gs) { if (a > cur) obox(mat, cur, a, Math.min(vFace, vFace + dir * 0.02), Math.max(vFace, vFace + dir * 0.02), fl, top, [0.8, 0.8]); cur = Math.max(cur, b); } if (u1 > cur) obox(mat, cur, u1, Math.min(vFace, vFace + dir * 0.02), Math.max(vFace, vFace + dir * 0.02), fl, top, [0.8, 0.8]); }
function dadoV(mat, uFace, dir, v0, v1, fl, top, gaps) { const gs = (gaps || []).slice().sort((p, q) => p[0] - q[0]); let cur = v0; for (const [a, b] of gs) { if (a > cur) obox(mat, Math.min(uFace, uFace + dir * 0.02), Math.max(uFace, uFace + dir * 0.02), cur, a, fl, top, [0.8, 0.8]); cur = Math.max(cur, b); } if (v1 > cur) obox(mat, Math.min(uFace, uFace + dir * 0.02), Math.max(uFace, uFace + dir * 0.02), cur, v1, fl, top, [0.8, 0.8]); }
function gableRoof(mat, u0, u1, v0, v1, he, r, o) { const vm = (v0 + v1) / 2, P = (u, v, h) => { const [x, y] = RB.uv2xy(u, v); return [x, RB.GROUND + h, -y]; };
  const a = P(u0 - o, v0 - o, he - o * 0.4), b = P(u1 + o, v0 - o, he - o * 0.4), c = P(u1 + o, vm, he + r), d = P(u0 - o, vm, he + r), e = P(u0 - o, v1 + o, he - o * 0.4), f = P(u1 + o, v1 + o, he - o * 0.4);
  const L = u1 - u0 + 2 * o, S = Math.hypot(vm - v0 + o, r + o * 0.4), g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute([...a, ...b, ...c, ...a, ...c, ...d, ...e, ...d, ...c, ...e, ...c, ...f, ...a, ...d, ...e, ...b, ...f, ...c], 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, L / 2, 0, L / 2, S / 2, 0, 0, L / 2, S / 2, 0, S / 2, 0, 0, 0, S / 2, L / 2, S / 2, 0, 0, L / 2, S / 2, L / 2, 0, 0, 0, 0.5, 0.5, 1, 0, 0, 0, 1, 0, 0.5, 0.5], 2)); g.computeVertexNormals(); addPart(mat, g, new THREE.Matrix4()); }
function groundPatch(mat, u0, u1, v0, v1, lift, uvm) { const nu = Math.max(2, Math.ceil((u1 - u0) / 2) + 1), nv = Math.max(2, Math.ceil((v1 - v0) / 2) + 1), pos = [], uv = [], idx = [];
  for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) { const u = u0 + (u1 - u0) * i / (nu - 1), v = v0 + (v1 - v0) * j / (nv - 1), [x, y] = RB.uv2xy(u, v); pos.push(x, RB.GROUND + lift, -y); uv.push((u - u0) / uvm, (v - v0) / uvm); }
  for (let j = 0; j < nv - 1; j++) for (let i = 0; i < nu - 1; i++) { const k = j * nu + i; idx.push(k, k + nu, k + 1, k + 1, k + nu, k + nu + 1); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); addPart(mat, g, new THREE.Matrix4()); }

// ---- 家具幾何（原點在地板、+z 朝前） ----
const mergeBoxes = list => { const gs = list.map(([w, h, d, x, y, z]) => { const g = new THREE.BoxGeometry(w, h, d).toNonIndexed(); g.translate(x, y, z); return g; }); return mergeGeometries(gs); };
const colorize = (g, c) => { const cc = new Float32Array(g.attributes.position.count * 3); for (let k = 0; k < cc.length; k += 3) { cc[k] = c.r; cc[k + 1] = c.g; cc[k + 2] = c.b; } g.setAttribute('color', new THREE.BufferAttribute(cc, 3)); return g; };
let FURN = null;
function furniture() { if (FURN) return FURN; FURN = {
  deskTop: mergeBoxes([[0.62, 0.025, 0.46, 0, 0.725, 0]]),
  deskBody: mergeBoxes([[0.04, 0.71, 0.04, -0.28, 0.355, -0.2], [0.04, 0.71, 0.04, 0.28, 0.355, -0.2], [0.04, 0.71, 0.04, -0.28, 0.355, 0.2], [0.04, 0.71, 0.04, 0.28, 0.355, 0.2], [0.58, 0.14, 0.42, 0, 0.64, 0], [0.56, 0.03, 0.03, 0, 0.12, -0.2], [0.56, 0.03, 0.03, 0, 0.12, 0.2]]),
  chair: mergeBoxes([[0.38, 0.03, 0.36, 0, 0.42, 0], [0.38, 0.22, 0.03, 0, 0.66, -0.17], [0.03, 0.42, 0.03, -0.17, 0.21, -0.16], [0.03, 0.42, 0.03, 0.17, 0.21, -0.16], [0.03, 0.42, 0.03, -0.17, 0.21, 0.16], [0.03, 0.42, 0.03, 0.17, 0.21, 0.16], [0.03, 0.26, 0.03, -0.17, 0.55, -0.17], [0.03, 0.26, 0.03, 0.17, 0.55, -0.17]]),
  fold: mergeBoxes([[0.42, 0.03, 0.4, 0, 0.45, 0], [0.42, 0.3, 0.02, 0, 0.72, -0.2], [0.025, 0.86, 0.025, -0.2, 0.43, -0.2], [0.025, 0.86, 0.025, 0.2, 0.43, -0.2], [0.025, 0.47, 0.025, -0.2, 0.23, 0.18], [0.025, 0.47, 0.025, 0.2, 0.23, 0.18]]),
  kidChair: mergeBoxes([[0.32, 0.03, 0.3, 0, 0.3, 0], [0.32, 0.24, 0.03, 0, 0.45, -0.14], [0.03, 0.3, 0.03, -0.14, 0.15, -0.13], [0.03, 0.3, 0.03, 0.14, 0.15, -0.13], [0.03, 0.3, 0.03, -0.14, 0.15, 0.13], [0.03, 0.3, 0.03, 0.14, 0.15, 0.13]]),
  table: mergeBoxes([[1.8, 0.04, 0.75, 0, 0.74, 0], [0.05, 0.74, 0.05, -0.85, 0.37, -0.32], [0.05, 0.74, 0.05, 0.85, 0.37, -0.32], [0.05, 0.74, 0.05, -0.85, 0.37, 0.32], [0.05, 0.74, 0.05, 0.85, 0.37, 0.32]]),
  mtTop: mergeBoxes([[1.6, 0.04, 0.6, 0, 0.74, 0]]), mtBody: mergeBoxes([[1.54, 0.6, 0.03, 0, 0.42, 0.27], [0.03, 0.72, 0.56, -0.76, 0.36, 0], [0.03, 0.72, 0.56, 0.76, 0.36, 0]]),
  roundTop: (() => { const g = new THREE.CylinderGeometry(0.75, 0.75, 0.04, 28); g.translate(0, 0.58, 0); return mergeGeometries([g.toNonIndexed(), mergeBoxes([[0.08, 0.56, 0.08, 0, 0.28, 0]])]); })(),
  shelf: mergeBoxes([[1.8, 1.6, 0.04, 0, 0.8, -0.17], [0.04, 1.6, 0.36, -0.88, 0.8, 0], [0.04, 1.6, 0.36, 0.88, 0.8, 0], [1.8, 0.03, 0.36, 0, 0.05, 0], [1.8, 0.03, 0.36, 0, 0.55, 0], [1.8, 0.03, 0.36, 0, 1.05, 0], [1.8, 0.03, 0.36, 0, 1.58, 0]]),
  books: (() => { const gs = []; for (let r = 0; r < 3; r++) for (let i = 0; i < 26; i++) { if (Math.random() < 0.08) continue; const w = 0.04 + Math.random() * 0.03, h = 0.28 + Math.random() * 0.14; const g = new THREE.BoxGeometry(w, h, 0.24).toNonIndexed(); g.translate(-0.85 + i * 0.066, 0.08 + r * 0.5 + h / 2, 0); gs.push(colorize(g, new THREE.Color().setHSL(Math.random(), 0.45, 0.42 + Math.random() * 0.15))); } return mergeGeometries(gs); })(),
  bag: (() => { const g = new THREE.CapsuleGeometry(0.28, 1.4, 4, 8).toNonIndexed(); g.rotateZ(Math.PI / 2); g.scale(1, 0.45, 1); g.translate(0, 0.13, 0); return colorize(g, new THREE.Color().setHSL(0.6, 0.6, 0.45)); })(),
  bag2: (() => { const g = new THREE.CapsuleGeometry(0.28, 1.4, 4, 8).toNonIndexed(); g.rotateZ(Math.PI / 2); g.scale(1, 0.45, 1); g.translate(0, 0.13, 0); return colorize(g, new THREE.Color().setHSL(0.02, 0.6, 0.5)); })(),
  suitcase: mergeBoxes([[0.45, 0.65, 0.26, 0, 0.33, 0], [0.2, 0.08, 0.04, 0, 0.7, 0]]),
  backpack: mergeBoxes([[0.32, 0.42, 0.2, 0, 0.21, 0], [0.26, 0.18, 0.08, 0, 0.16, 0.13]]),
  pc: mergeBoxes([[0.5, 0.32, 0.03, 0, 1.0, 0], [0.05, 0.25, 0.05, 0, 0.82, 0.02], [0.24, 0.02, 0.16, 0, 0.75, 0.03]]),
  wallFan: (() => { const g = new THREE.CylinderGeometry(0.22, 0.22, 0.1, 20); g.rotateX(Math.PI / 2); g.translate(0, 0, 0.18); return mergeGeometries([g.toNonIndexed(), mergeBoxes([[0.1, 0.1, 0.18, 0, 0, 0.06]])]); })(),
  ceilFan: (() => { const gs = [new THREE.CylinderGeometry(0.12, 0.12, 0.14, 12).toNonIndexed(), mergeBoxes([[0.04, 0.4, 0.04, 0, 0.27, 0]])]; for (let k = 0; k < 5; k++) { const b = new THREE.BoxGeometry(0.62, 0.015, 0.13).toNonIndexed(); b.translate(0.42, -0.03, 0); b.rotateY(k * Math.PI * 2 / 5); gs.push(b); } return mergeGeometries(gs); })(),
}; return FURN; }

// ---- 會開關的門（推門）：每扇門是一個以門軸為中心的群組，RB.setDoor(id, 0..1) 控制開的程度 ----
// axis 'u'：牆沿 u（門板沿 u，從 a 到 b），開門時往 to（±1）的 v 方向轉；axis 'v'：牆沿 v，往 to 的 u 方向轉。hinge：門軸在 a 端或 b 端。
RB.DOORS = {};
RB.setDoor = (id, k) => { const d = RB.DOORS[id]; if (d) d.pv.rotation.y = d.base + d.phi * k; };
const doorId = (r, i) => r.f + '-' + (r.name || ('r' + r.u0)) + '-' + i;
function doorLeaf(G, M, id, o) {
  const w = o.b - o.a, s = o.hinge === 'b' ? -1 : 1, ha = s > 0 ? o.a : o.b, [hu, hv] = o.axis === 'u' ? [ha, o.c] : [o.c, ha];
  const pv = new THREE.Group(), [x, y] = RB.uv2xy(hu, hv), base = RB.campusAngle + (o.axis === 'v' ? -Math.PI / 2 : 0); pv.position.set(x, RB.GROUND + o.h0, -y); pv.rotation.y = base;
  const th = o.th || 0.045, h = o.h1 - o.h0;
  const box = (m, x0, x1, y0, y1, z0, z1) => { const me = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), m); me.position.set(s * (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2); me.castShadow = !m.transparent; me.receiveShadow = true; pv.add(me); };
  if (o.glass) { for (const [x0, x1, y0, y1] of [[0, w, 0, 0.07], [0, w, h - 0.07, h], [0, 0.07, 0, h], [w - 0.07, w, 0, h], [0, w, 0.95, 1.0]]) box(M.frame, x0, x1, y0, y1, -th / 2, th / 2); box(M.glassDoor, 0.07, w - 0.07, 0.07, h - 0.07, -0.006, 0.006); }
  else { box(o.mat || M.door, 0.01, w - 0.01, 0, h, -th / 2, th / 2); if (o.win) box(M.glass, w * 0.28, w * 0.72, h * 0.6, h * 0.86, -th / 2 - 0.003, th / 2 + 0.003); }
  box(M.knob, w - 0.13, w - 0.07, h * 0.44, h * 0.47, -th / 2 - 0.06, th / 2 + 0.06);
  G.add(pv); RB.DOORS[id] = { pv, base, phi: (o.axis === 'u' ? -s : s) * (o.to || 1) * (o.ang || 1.45) };
}
RB.buildSchool = () => {
  PARTS.clear(); RB.DOORS = {}; const G = new THREE.Group(), M = schoolMaterials(); RB.SM = M; const F = furniture();
  let hs = 0, n = 0; for (let u = 0; u <= 126; u += 10) for (let v = 0; v <= 64; v += 8) { const [x, y] = RB.uv2xy(u, v); hs += RB.H(x, y); n++; } RB.GROUND = hs / n;
  const { F1, F2, FH, EAVE, V0, V1, V2, UW, UE, PU, PV, WX, WS } = S_; const VI = V0 + 0.25, CEIL1 = F2 - 0.31, CEIL2 = EAVE - 0.31;
  const rowRooms = RB.ROOMS.filter(r => !r.x), STAIRS = [29.5, 70.2];
  const inst = (geo, mat, list, shadow) => { if (!list.length) return; const im = new THREE.InstancedMesh(geo, mat, list.length); list.forEach(([u, v, h, yaw], i) => { const [x, y] = RB.uv2xy(u, v); _p.set(x, RB.GROUND + h, -y); _q.setFromAxisAngle(_up, RB.campusAngle + (yaw || 0)); _m.compose(_p, _q, _s); im.setMatrixAt(i, _m); }); im.castShadow = shadow !== false; im.receiveShadow = true; G.add(im); };
  const L = { deskTop: [], deskBody: [], chair: [], fold: [], kidR: [], kidY: [], kidB: [], table: [], mtTop: [], mtBody: [], blue: [], round: [], shelf: [], bag: [], bag2: [], cases: [], packs: [], pcs: [], wallFan: [], ceilFan: [] };
  // ===== 北排教室大樓：地坪、樓板、屋頂 =====
  // 第四版（2026-11-14，依使用者在平面圖上畫的）：西端是 L 形——一樓辦公室（北）＋穿堂（南），二樓會議室＋校長室；
  // 一樓走廊到西端往南轉，接風雨走廊；二樓從西側樓梯上來，右邊會議室、左邊玻璃門通走廊、正前方幾階小樓梯通到校長室。
  const NB = { 1: [[UW, WX], [WX, 29.5], [32.7, 42], [42, 51.5], [51.5, 60.6], [60.6, 70.2], [73.4, UE]], 2: [[UW, 17.6], [17.6, 29.5], [32.7, 42], [42, 51.5], [51.5, 60.6], [60.6, 70.2], [73.4, UE]] };
  obox(M.floor, UW, UE, V0, V1, 0, F1, [2, 2]); obox(M.floor, 29.5, UE, V1, V2, 0, F1, [2, 2]); obox(M.floor, UW, WX, V1, 14, 0, F1, [2, 2]);
  const slab = (u0, u1, v0, v1) => { obox(M.trim, u0, u1, v0, v1, F2 - 0.3, F2); obox(M.floor, u0, u1, v0, v1, F2, F2 + 0.01, [2, 2]); obox(M.ceil, u0, u1, v0, v1, CEIL1 - 0.0, CEIL1 + 0.01); };
  slab(UW, 29.5, V0 + 0.25, V2); slab(32.7, 70.2, V0 + 0.25, V2); slab(73.4, UE, V0 + 0.25, V2); for (const s of STAIRS) slab(s, s + 3.2, 11.8, V2);
  obox(M.trim, UW, UE, V0, V0 + 0.25, F2 - 0.3, F2); obox(M.trim, 32.7, UE, V2 - 0.05, V2 + 0.1, F2 - 0.3, F2);
  obox(M.trim, UW - 0.3, UE + 0.3, V0 - 0.3, V2 + 0.5, EAVE - 0.3, EAVE); obox(M.ceil, UW, UE, V0 + 0.25, V2, CEIL2, CEIL2 + 0.01);
  gableRoof(M.roof, UW, UE, V0, V2, EAVE, 2.2, 0.6);
  // 北外牆（大窗）
  for (const fl of [1, 2]) { const hb = fl === 1 ? 0 : F2, ht = fl === 1 ? F2 - 0.3 : EAVE - 0.3, ops = []; for (const [a0, a1] of NB[fl]) for (let a = a0 + 0.6; a < a1 - 1.0; a += 2.3) ops.push({ a, b: Math.min(a + 1.9, a1 - 0.5), lo: hb + 0.9, hi: hb + 2.8, glass: true }); for (const s of STAIRS) ops.push({ a: s + 0.6, b: s + 2.6, lo: hb + 1.6, hi: hb + 2.9, glass: true }); wallU(M, M.wall, V0, V0 + 0.25, UW, UE, hb, ht, ops); }
  // 西牆（一樓到辦公室南牆、二樓到 v=15）、東端
  for (const fl of [1, 2]) { const hb = fl === 1 ? 0 : F2, ht = fl === 1 ? F2 - 0.3 : EAVE - 0.3; wallV(M, M.wall, UW - 0.25, UW, V0, fl === 1 ? 14 : V2, hb, ht, [{ a: 4.2, b: 6.4, lo: hb + 0.9, hi: hb + 2.8, glass: true }, { a: 7.6, b: 9.8, lo: hb + 0.9, hi: hb + 2.8, glass: true }, { a: 11.0, b: 12.8, lo: hb + 0.9, hi: hb + 2.8, glass: true }]); }
  obox(M.wall, UE, UE + 0.25, V0, V1, 0, EAVE - 0.3);
  // 走廊側牆（門、高窗）、隔間、二樓走廊牆腳；教室門是推門（往教室裡開），每間前後各一扇
  for (const r of rowRooms) { const hb = r.f === 1 ? 0 : F2, fl = r.f === 1 ? F1 : F2, ht = r.f === 1 ? F2 - 0.3 : EAVE - 0.3; if (r.type === 'stairs') continue;
    const dw = r.type === 'toilet' ? 0.45 : 0.55, ops = [], gaps = [];
    r.d.forEach((d, i) => { ops.push({ a: d - dw, b: d + dw, lo: fl, hi: fl + 2.2 }); gaps.push([d - dw - 0.05, d + dw + 0.05]); obox(M.door, d - dw - 0.05, d - dw, V1 - 0.2, V1, fl, fl + 2.2); obox(M.door, d + dw, d + dw + 0.05, V1 - 0.2, V1, fl, fl + 2.2); obox(M.door, d - dw - 0.05, d + dw + 0.05, V1 - 0.2, V1, fl + 2.2, fl + 2.26);
      doorLeaf(G, M, doorId(r, i), { axis: 'u', a: d - dw, b: d + dw, c: V1 - 0.1, h0: fl, h1: fl + 2.18, hinge: 'a', to: -1, glass: r.glass, win: !r.glass }); });
    let cur = r.u0 + 0.4; const ds = r.d.map(d => [d - 0.75, d + 0.75]); while (cur < r.u1 - 1.2) { const a = cur, b = Math.min(cur + 1.6, r.u1 - 0.4); if (!ds.some(([p, q]) => b > p && a < q)) ops.push({ a, b, lo: fl + 1.1, hi: fl + 2.4, glass: true }); cur += 2.0; }
    wallU(M, M.wall, V1 - 0.2, V1, r.u0, r.u1, hb, ht, ops);
    if (r.f === 2 && r.u0 >= 29.5) dadoU(M.dado, V1, 1, r.u0, r.u1, fl, fl + 1.1, gaps);
    if (r.u0 > WX) { if (r.f === 2 && r.u0 === 42.0) obox(M.curtain2, r.u0 - 0.03, r.u0 + 0.03, VI, V1 - 0.2, fl, fl + 3.1); else obox(M.wallIn, r.u0 - 0.1, r.u0 + 0.1, VI, V1 - 0.2, hb, ht); }
    // 門上方的教室牌（凸出走廊，橘底白字）；廁所：男（左）、女（右）
    if (r.type === 'toilet') { obox(textMat('男', { w: 96, h: 96, bg: '#2f6fd0', fg: '#ffffff', size: 64 }), r.d[0] - 0.02, r.d[0] + 0.02, V1, V1 + 0.42, fl + 2.4, fl + 2.82); obox(textMat('女', { w: 96, h: 96, bg: '#d9433a', fg: '#ffffff', size: 64 }), r.d[1] - 0.02, r.d[1] + 0.02, V1, V1 + 0.42, fl + 2.4, fl + 2.82); }
    else if (r.d.length && r.name) { const sm = textMat(r.name, { w: 256, h: 96, bg: '#e8892c', fg: '#ffffff', size: 52 }); obox(sm, r.d[r.d.length - 1] - 0.02, r.d[r.d.length - 1] + 0.02, V1, V1 + 0.62, fl + 2.45, fl + 2.7); }
  }
  // 樓梯間（兩座：西端、廁所旁）：兩跑，第一跑往北升到平台、第二跑往南到二樓
  for (const s of STAIRS) { obox(M.wallIn, s - 0.1, s + 0.1, VI, V1 - 0.2, 0, EAVE - 0.3); obox(M.wallIn, s + 3.1, s + 3.3, VI, V1 - 0.2, 0, EAVE - 0.3);
    const half = (F2 - F1) / 2, nst = 12, run = 0.28; for (let i = 0; i < nst; i++) { const v = 11.8 - (i + 1) * run; obox(M.floor, s + 0.1, s + 1.6, v, v + run, F1, F1 + half * (i + 1) / nst, [2, 2]); obox(M.floor, s + 1.6, s + 3.1, 8.44 + i * run, 8.44 + (i + 1) * run, F1, F1 + half + half * (i + 1) / nst, [2, 2]); }
    obox(M.floor, s + 0.1, s + 3.1, 6.6, 8.44, F1, F1 + half, [2, 2]); obox(M.rail, s + 1.57, s + 1.63, 8.44, 11.8, F1 + 0.9, F1 + 1.0 + half); obox(M.wallIn, s + 0.1, s + 3.1, VI, 6.6, 0, EAVE - 0.3);
    obox(M.rail, s + 0.12, s + 3.08, 11.75, 11.82, F2 + 0.9, F2 + 0.96); }
  // 天花板日光燈、壁扇
  for (const r of rowRooms) { if (r.type === 'stairs') continue; const ceil = r.f === 1 ? CEIL1 : CEIL2, fl = r.f === 1 ? F1 : F2; for (let u = r.u0 + 1.4; u < r.u1 - 1; u += 2.4) for (const v of [5.0, 9.0]) { obox(M.light, u, u + 1.2, v, v + 0.12, ceil - 0.12, ceil - 0.08); obox(M.metal, u + 0.1, u + 0.12, v + 0.05, v + 0.07, ceil - 0.08, ceil); obox(M.metal, u + 1.08, u + 1.1, v + 0.05, v + 0.07, ceil - 0.08, ceil); }
    if (r.type !== 'toilet' && r.type !== 'other') for (const u of [r.u0 + 2.5, r.u1 - 2.5]) L.wallFan.push([u, VI, fl + 2.6, 0]); }
  for (let u = 23; u < UE; u += 4.6) obox(M.light, u, u + 1.2, 13.55, 13.67, CEIL1 - 0.06, CEIL1); for (let u = 33.5; u < UE; u += 4.6) obox(M.light, u, u + 1.2, 13.55, 13.67, CEIL2 - 0.06, CEIL2);
  // 走廊柱子；二樓走廊外側：女兒牆＋欄杆，圖書室到英語教室這段整排窗；玻璃門在圖書室西邊（通往樓梯口）
  for (const u of [WX, 24.6, 29.5, 32.7, 37.35, 42, 46.75, 51.5, 56.05, 60.6, 65.4, 70.2, 73.4, 77]) obox(M.column, u - 0.22, u + 0.22, V2 - 0.45, V2, 0, F2 - 0.3);
  for (const u of [32.7, 37.35, 42, 46.75, 51.5, 56.05, 60.6, 65.4, 70.2, 73.4, 77]) obox(M.column, u - 0.22, u + 0.22, V2 - 0.45, V2, F2, EAVE - 0.3);
  obox(M.wall, 32.7, UE, V2 - 0.15, V2, F2, F2 + 0.95); obox(M.trim, 24.6, UE, V2 - 0.35, V2 + 0.05, 0, F1 + 0.05);
  obox(M.rail, 51.5, UE, V2 - 0.12, V2 + 0.02, F2 + 0.95, F2 + 1.02);
  for (let a = 32.95; a < 51.3; a += 2.32) winU(M, a, Math.min(a + 2.2, 51.3), V2 - 0.08, F2 + 0.95, CEIL2 - 0.05); obox(M.trim, 32.7, 51.5, V2 - 0.15, V2, CEIL2 - 0.05, CEIL2);
  { const ug = 32.7; obox(M.frame, ug - 0.05, ug + 0.05, V1, V1 + 0.12, F2, CEIL2); obox(M.frame, ug - 0.05, ug + 0.05, V2 - 0.27, V2 - 0.15, F2, CEIL2); obox(M.frame, ug - 0.05, ug + 0.05, V1 + 0.12, V2 - 0.27, F2 + 2.3, F2 + 2.36); obox(M.glass, ug - 0.01, ug + 0.01, V1 + 0.12, V2 - 0.27, F2 + 2.36, CEIL2);
    const w = (V2 - 0.27 - V1 - 0.12) / 2; doorLeaf(G, M, 'glass2a', { axis: 'v', a: V1 + 0.12, b: V1 + 0.12 + w, c: ug, h0: F2, h1: F2 + 2.28, hinge: 'a', to: 1, glass: true }); doorLeaf(G, M, 'glass2b', { axis: 'v', a: V2 - 0.27 - w, b: V2 - 0.27, c: ug, h0: F2, h1: F2 + 2.28, hinge: 'b', to: 1, glass: true }); }
  // 廁所正對面（走廊外側）的洗手台，一、二樓都有
  for (const fl of [F1, F2]) { obox(M.tileW, 73.75, 76.65, 14.0, 14.5, fl, fl + 0.82); for (const u of [74.3, 75.2, 76.1]) obox(M.metal, u - 0.02, u + 0.02, 14.1, 14.35, fl + 0.82, fl + 1.05); }

  // ===== 西端 L 形 =====
  // 一樓辦公室（u 13–21.4、v 2–14）：南牆對著穿堂、東牆有門對著走廊轉角
  { const ht = F2 - 0.3; wallU(M, M.wall, 13.8, 14.0, UW, WX, 0, ht, [{ a: 14.6, b: 16.6, lo: F1 + 0.9, hi: F1 + 2.4, glass: true }, { a: 17.6, b: 19.6, lo: F1 + 0.9, hi: F1 + 2.4, glass: true }]);
    wallV(M, M.wall, WX - 0.2, WX, V0, 14.0, 0, ht, [{ a: 12.6, b: 13.7, lo: F1, hi: F1 + 2.2 }, { a: 4.0, b: 5.6, lo: F1 + 1.1, hi: F1 + 2.4, glass: true }, { a: 7.6, b: 9.2, lo: F1 + 1.1, hi: F1 + 2.4, glass: true }]);
    doorLeaf(G, M, 'office', { axis: 'v', a: 12.6, b: 13.7, c: WX - 0.1, h0: F1, h1: F1 + 2.18, hinge: 'a', to: -1, win: true });
    obox(M.cabinet, 14.0, 20.8, VI, VI + 0.45, F1, F1 + 1.9); for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) { const u = 14.6 + i * 2.2, v = 5.0 + j * 3.4; obox(M.tdesk, u, u + 1.4, v, v + 0.75, F1, F1 + 0.76); L.pcs.push([u + 0.7, v + 0.2, F1, 0]); L.chair.push([u + 0.7, v + 1.15, F1, Math.PI]); } }
  // 一樓穿堂（u 13–21.4、v 14–22）：紅磚地、彩色天花板、彩繪柱；東邊接走廊轉角（往南接風雨走廊）
  obox(M.paver, UW, WX, 14, WS, 0, F1, [3, 3]); obox(M.paver, WX, 24.6, V1, WS, 0, F1, [3, 3]); obox(M.paver, 24.6, 29.5, V1, V2, 0, F1, [3, 3]);
  panel(M.hallCeil, 'h', UW, WX, 14, WS, CEIL1 - 0.01, 1); obox(M.ceil, WX, 32.7, V2, 17.4, CEIL1, CEIL1 + 0.01); obox(M.ceil, WX, 24.6, 17.4, WS, CEIL1, CEIL1 + 0.01);
  for (const [u, v] of [[UW + 0.3, WS - 0.3], [17.2, WS - 0.3], [WX - 0.3, WS - 0.3], [UW + 0.3, 18.0]]) obox(M.hallCol, u - 0.28, u + 0.28, v - 0.28, v + 0.28, F1, CEIL1, [1.12, 1.6]);
  for (const [u, v] of [[24.4, 17.2], [24.4, WS - 0.2], [28.6, 17.2], [32.5, 17.2]]) obox(M.column, u - 0.2, u + 0.2, v - 0.2, v + 0.2, 0, F2);
  obox(M.led, 15.4, 19.0, 14.0, 14.09, F1 + 2.55, F1 + 2.95); obox(M.bulletin, 13.8, 16.2, 14.0, 14.04, F1 + 0.9, F1 + 2.1);
  // 二樓：會議室（u 17.6–29.5、v 2–15）：門在東牆，正對走廊的玻璃門；西邊另一間（不開放）
  { const fl = F2, ht = EAVE - 0.3;
    obox(M.wallIn, 17.5, 17.7, VI, V2 - 0.2, F2, ht);
    wallU(M, M.wall, V2 - 0.2, V2, UW, 29.6, F2, ht, [{ a: 22.0, b: 24.0, lo: fl + 1.1, hi: fl + 2.4, glass: true }, { a: 25.6, b: 27.6, lo: fl + 1.1, hi: fl + 2.4, glass: true }]);
    wallV(M, M.wall, 29.4, 29.6, V1 - 0.2, V2 - 0.2, F2, ht, [{ a: 12.9, b: 14.1, lo: fl, hi: fl + 2.2 }]);
    doorLeaf(G, M, 'meet', { axis: 'v', a: 12.9, b: 14.1, c: 29.5, h0: fl, h1: fl + 2.18, hinge: 'a', to: -1, win: true });
    const sm = textMat('會議室', { w: 256, h: 96, bg: '#e8892c', fg: '#ffffff', size: 52 }); obox(sm, 29.6, 30.2, 13.5 - 0.02, 13.5 + 0.02, fl + 2.45, fl + 2.7);
    // 長方形會議桌（南北向）、藍椅子、白板、冷氣、吊扇、吹風機
    obox(M.mtTop, 22.4, 25.2, 4.8, 12.0, fl + 0.72, fl + 0.77); for (const [u, v] of [[22.6, 5.0], [25.0, 5.0], [22.6, 11.8], [25.0, 11.8]]) obox(M.metal, u - 0.03, u + 0.03, v - 0.03, v + 0.03, fl, fl + 0.72);
    for (let v = 5.4; v < 11.8; v += 0.9) { L.blue.push([21.85, v, fl, Math.PI / 2]); L.blue.push([25.75, v, fl, -Math.PI / 2]); } L.blue.push([23.8, 12.6, fl, Math.PI]); L.blue.push([23.8, 4.2, fl, 0]);
    obox(M.white, 17.75, 17.85, 5.5, 8.5, fl + 0.8, fl + 1.9); obox(M.ac, 22.0, 22.9, VI, VI + 0.24, fl + 2.55, fl + 2.85); L.ceilFan.push([20.5, 8.4, CEIL2 - 0.4, 0]); L.ceilFan.push([26.6, 8.4, CEIL2 - 0.4, 0.6]); obox(M.cabinet, 27.4, 29.2, VI, VI + 0.45, fl, fl + 1.9);
    obox(M.desk, 27.6, 29.2, 13.9, 14.6, fl, fl + 0.78); for (const u of [27.9, 28.6]) obox(M.ac, u, u + 0.32, 14.05, 14.3, fl + 0.78, fl + 0.98);   // 吹風機（放在門邊小桌）
    for (let u = 18.4; u < 29; u += 2.6) for (const v of [5.0, 9.6]) obox(M.light, u, u + 1.2, v, v + 0.12, CEIL2 - 0.12, CEIL2 - 0.08); }
  // 二樓樓梯口往南：幾階小樓梯（+0.45 m）→ 通道往西 → 沿西翼東側往南 → 右手邊是校長室的門
  { const fl = F2, up = 0.45, FP = F2 + up, ht = EAVE - 0.3;
    for (let k = 0; k < 3; k++) obox(M.floor, 29.6, 32.6, V2 + k * 0.4, V2 + (k + 1) * 0.4, F2 - 0.3, F2 + up * (k + 1) / 3, [2, 2]);
    obox(M.trim, WX, 29.6, V2, 17.4, F2 - 0.3, FP - 0.01); obox(M.floor, WX, 29.6, V2, 17.4, FP - 0.01, FP, [2, 2]); obox(M.trim, WX, 24.6, 17.4, WS, F2 - 0.3, FP - 0.01); obox(M.floor, WX, 24.6, 17.4, WS, FP - 0.01, FP, [2, 2]);
    obox(M.trim, 29.6, 32.7, V2 + 1.2, 17.4, F2 - 0.3, FP - 0.01); obox(M.floor, 29.6, 32.6, V2 + 1.2, 17.4, FP - 0.01, FP, [2, 2]);
    wallU(M, M.wall, 17.2, 17.4, 24.4, 32.7, F2 - 0.3, ht, [{ a: 25.4, b: 27.4, lo: FP + 0.9, hi: FP + 2.3, glass: true }, { a: 28.6, b: 30.6, lo: FP + 0.9, hi: FP + 2.3, glass: true }]);
    wallV(M, M.wall, 32.5, 32.7, V2, 17.4, F2 - 0.3, ht, [{ a: 15.4, b: 17.0, lo: FP + 0.9, hi: FP + 2.3, glass: true }]);
    wallV(M, M.wall, 24.4, 24.6, 17.4, WS, F2 - 0.3, ht, [{ a: 18.4, b: 20.6, lo: FP + 0.9, hi: FP + 2.3, glass: true }]);
    wallU(M, M.wall, WS - 0.2, WS, WX, 24.6, F2 - 0.3, ht, [{ a: 22.2, b: 23.8, lo: FP + 0.9, hi: FP + 2.3, glass: true }]);
    obox(M.ceil, WX, 32.7, V2, 17.4, CEIL2, CEIL2 + 0.01); obox(M.ceil, WX, 24.6, 17.4, WS, CEIL2, CEIL2 + 0.01); obox(M.trim, WX - 0.2, 32.9, V2, 17.6, EAVE - 0.3, EAVE); obox(M.trim, WX - 0.2, 24.8, 17.4, WS + 0.2, EAVE - 0.3, EAVE);
    for (const [u, v] of [[23.0, 16.2], [27.4, 16.2], [23.0, 19.6]]) obox(M.light, u, u + 1.2, v, v + 0.12, CEIL2 - 0.12, CEIL2 - 0.08);
    // 校長室（u 13–21.4、v 15–22，地板 +0.45）：東牆有門（推門）；北邊綠色牆＋綠色門（外門）→ 內門 → 廁所
    obox(M.trim, UW, WX, V2, WS, F2 - 0.3, FP - 0.01); obox(M.floor, UW, WX, V2, WS, FP - 0.01, FP, [2, 2]);
    wallV(M, M.wall, WX - 0.2, WX, V2, WS, F2, ht, [{ a: 20.1, b: 21.2, lo: FP, hi: FP + 2.2 }]);
    doorLeaf(G, M, 'prin', { axis: 'v', a: 20.1, b: 21.2, c: WX - 0.1, h0: FP, h1: FP + 2.18, hinge: 'b', to: -1, win: true });
    const sm = textMat('校長室', { w: 256, h: 96, bg: '#e8892c', fg: '#ffffff', size: 52 }); obox(sm, WX, WX + 0.6, 21.9 - 0.02, 21.9 + 0.02, FP + 2.45, FP + 2.7);
    wallU(M, M.wall, WS - 0.25, WS, UW - 0.25, WX, F2, ht, [{ a: 14.6, b: 16.8, lo: FP + 0.8, hi: FP + 2.6, glass: true }, { a: 17.8, b: 20.0, lo: FP + 0.8, hi: FP + 2.6, glass: true }]);
    wallV(M, M.wall, UW - 0.25, UW, V2, WS, F2, ht, [{ a: 18.0, b: 21.0, lo: FP + 0.8, hi: FP + 2.6, glass: true }]);
    wallU(M, M.doorGreen, 17.3, 17.42, UW, 18.4, FP, CEIL2, [{ a: 15.4, b: 16.3, lo: FP, hi: FP + 2.1 }]); obox(M.doorGreen, 18.3, 18.42, V2 + 0.2, 17.42, FP, CEIL2);
    doorLeaf(G, M, 'prinWC1', { axis: 'u', a: 15.4, b: 16.3, c: 17.36, h0: FP, h1: FP + 2.08, hinge: 'a', to: -1, mat: M.doorGreen });
    wallU(M, M.wallIn, 16.2, 16.3, UW, 18.3, FP, CEIL2, [{ a: 15.4, b: 16.2, lo: FP, hi: FP + 2.05 }]); doorLeaf(G, M, 'prinWC2', { axis: 'u', a: 15.4, b: 16.2, c: 16.25, h0: FP, h1: FP + 2.03, hinge: 'a', to: -1 });
    obox(M.tileW, UW, 18.3, V2 + 0.2, 16.2, FP, FP + 0.02);
    // L 型沙發（北側）、茶几、校長辦公桌（南側，團本在這裡工作）、櫃子
    obox(M.sofa, 14.6, 18.0, 17.65, 18.45, FP, FP + 0.45); obox(M.sofa, 14.6, 18.0, 17.5, 17.7, FP, FP + 0.85); obox(M.sofa, 17.3, 18.1, 17.65, 19.6, FP, FP + 0.45); obox(M.sofa, 17.9, 18.1, 17.5, 19.6, FP, FP + 0.85);
    { const g = new THREE.CylinderGeometry(0.6, 0.6, 0.06, 24); g.scale(1.3, 1, 0.8); place(M.desk, g, 15.4, 19.0, FP + 0.42, 0); obox(M.metal, 15.35, 15.45, 18.95, 19.05, FP, FP + 0.4); }
    obox(M.desk, 14.4, 18.0, 20.3, 21.2, FP, FP + 0.78); L.pcs.push([15.4, 20.6, FP, Math.PI]); L.pcs.push([16.9, 20.6, FP, Math.PI]); L.chair.push([15.4, 21.55, FP, Math.PI]); L.chair.push([16.9, 21.55, FP, Math.PI]);
    obox(M.cabinet, 18.6, 21.0, 17.6, 18.0, FP, FP + 1.9);
    for (const u of [15.0, 18.6]) obox(M.light, u, u + 1.2, 19.6, 19.72, CEIL2 - 0.12, CEIL2 - 0.08);
    obox(M.trim, UW - 0.2, WX, V2, WS + 0.2, EAVE - 0.3, EAVE); obox(M.ceil, UW, WX, V2 + 0.2, WS - 0.25, CEIL2, CEIL2 + 0.01); }
  // 二樓西側陽台（從大門看得到的那個，掛彩色布條）
  obox(M.trim, UW - 1.2, UW, V1, WS, F2 - 0.3, F2); obox(M.floor, UW - 1.2, UW, V1, WS, F2, F2 + 0.01, [2, 2]); obox(M.wall, UW - 1.2, UW - 1.05, V1, WS, F2, F2 + 1.0); obox(M.wall, UW - 1.2, UW, V1 - 0.15, V1, F2, F2 + 1.0); obox(M.wall, UW - 1.2, UW, WS, WS + 0.15, F2, F2 + 1.0);
  panel(M.banner, 'v', V1 + 0.6, WS - 0.6, F2 + 0.1, F2 + 0.9, UW - 1.22, 1);
  panel(M.sign, 'u', 14.2, 20.4, EAVE + 0.05, EAVE + 0.85, WS + 0.21, 1); obox(M.wall, UW - 0.2, WX + 0.2, WS, WS + 0.2, EAVE, EAVE + 0.9);

  // ===== 室內 =====
  const desks6 = (uc, vc, fl, rot) => { for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) { const u = uc + (i - 1) * 0.62, v = vc + (j - 0.5) * 0.46; L.deskTop.push([u, v, fl, 0]); L.deskBody.push([u, v, fl, 0]); L.chair.push([u, vc + (j ? 0.85 : -0.85), fl, j ? Math.PI : 0]); } };
  for (const r of rowRooms) { const fl = r.f === 1 ? F1 : F2, um = (r.u0 + r.u1) / 2, ceil = r.f === 1 ? CEIL1 : CEIL2;
    if (r.type === 'class' || r.type === 'class4' || r.type === 'sleep' || r.type === 'english') {
      // 前方（東牆）黑板（英語教室是白板、沒有電視）、老師桌；後方（西牆）布告欄、置物櫃、時鐘
      if (r.type === 'english') { obox(M.boardFrame, r.u1 - 0.16, r.u1 - 0.1, 4.4, 9.6, fl + 0.85, fl + 2.15); obox(M.white, r.u1 - 0.18, r.u1 - 0.1, 4.5, 9.5, fl + 0.9, fl + 2.1); }
      else { obox(M.boardFrame, r.u1 - 0.16, r.u1 - 0.1, 3.9, 10.1, fl + 0.85, fl + 2.15); obox(M.board, r.u1 - 0.18, r.u1 - 0.1, 4.0, 10.0, fl + 0.9, fl + 2.1); obox(M.boardFrame, r.u1 - 0.35, r.u1 - 0.1, 4.0, 10.0, fl + 0.86, fl + 0.9);
        obox(M.tv, r.u1 - 0.22, r.u1 - 0.18, 5.6, 7.3, fl + 1.1, fl + 2.05); obox(M.screen, r.u1 - 0.225, r.u1 - 0.22, 5.66, 7.24, fl + 1.16, fl + 1.99); }
      obox(M.tdesk, r.u1 - 1.9, r.u1 - 0.8, 2.6, 3.6, fl, fl + 0.76);
      obox(M.bulletinRow, r.u0 + 0.1, r.u0 + 0.14, 3.0, 11.0, fl + 1.15, fl + 2.55); obox(M.locker, r.u0 + 0.1, r.u0 + 0.5, 3.0, 11.0, fl, fl + 0.9); panel(M.clock, 'v', 6.8, 7.2, fl + 2.65, fl + 3.05, r.u0 + 0.15, -1);
      if (r.type === 'class') { // 一到三年級：前半間兩組，各 6 張桌子併在一起
        desks6(r.u1 - 2.7, 6.3, fl); desks6(r.u1 - 2.7, 9.7, fl);
        for (let k = 0; k < 6; k++) L.chair.push([r.u0 + 0.75, 3.4 + k * 0.5, fl, Math.PI / 2]); }   // 教室後面的摺疊小椅子
      else if (r.type === 'class4') { desks6(35.9, 5.75, fl); desks6(39.0, 5.3, fl); desks6(35.8, 9.35, fl); desks6(39.0, 8.8, fl); }   // 四年級（哥姐休息）：四組
      else if (r.type === 'sleep') { // 桌椅靠北牆，地上鋪睡袋
        for (let i = 0; i < 12; i++) { const u = r.u0 + 1.0 + i * 0.64; if (u > r.u1 - 1.2) break; for (const v of [2.75, 3.25]) { L.deskTop.push([u, v, fl, 0]); L.deskBody.push([u, v, fl, 0]); } }
        for (let k = 0; k < 10; k++) (k % 2 ? L.bag2 : L.bag).push([r.u0 + 1.4 + (k % 5) * 1.6, 6.2 + Math.floor(k / 5) * 2.4, fl, Math.PI / 2]); }
      else { // 英語教室：桌子併成五組（5、5、3、6、6 張），行李疊在旁邊；西北角是巧拼區（矮桌）
        const grp = (u0, u1, v0, v1, n) => { const cols = Math.max(1, Math.round((u1 - u0) / 0.62)), rows = Math.ceil(n / cols); let k = 0; for (let j = 0; j < rows; j++) for (let i = 0; i < cols && k < n; i++, k++) { const u = u0 + 0.31 + i * ((u1 - u0 - 0.62) / Math.max(1, cols - 1) || 0), v = v0 + 0.25 + j * ((v1 - v0 - 0.5) / Math.max(1, rows - 1) || 0); L.deskTop.push([u, v, fl, 0]); L.deskBody.push([u, v, fl, 0]); } };
        grp(45.4, 47.8, 5.8, 7.4, 5); grp(48.6, 50.6, 5.5, 7.1, 5); grp(43.7, 44.6, 9.2, 11.2, 3); grp(45.6, 48.2, 9.4, 10.8, 6); grp(48.6, 50.7, 9.3, 10.7, 6);
        for (const [u0, v0, n] of [[45.6, 8.0, 6], [48.8, 7.7, 6], [44.9, 9.4, 4], [45.8, 11.3, 6], [48.8, 11.2, 6], [43.2, 8.2, 4]]) for (let k = 0; k < n; k++) (k % 3 ? L.cases : L.packs).push([u0 + (k % 3) * 0.6, v0 + Math.floor(k / 3) * 0.4, fl, (k % 5) * 0.2]);
        for (let i = 0; i < 4; i++) for (let j = 0; j < 6; j++) obox((i + j) % 2 ? M.foamR : M.foamB, 42.9 + i * 0.6, 43.5 + i * 0.6, 3.9 + j * 0.57, 4.47 + j * 0.57, fl, fl + 0.03);
        obox(M.desk, 43.4, 44.6, 5.0, 5.9, fl + 0.28, fl + 0.32); for (const [u, v] of [[43.5, 5.1], [44.5, 5.1], [43.5, 5.8], [44.5, 5.8]]) obox(M.desk, u - 0.03, u + 0.03, v - 0.03, v + 0.03, fl, fl + 0.28);
        for (let k = 0; k < 4; k++) L.cases.push([43.2 + k * 0.5, 6.7, fl + 0.03, 0.3]); } }
    if (r.type === 'library') { // 進門是一小塊磁磚，其餘木地板；矮書櫃、壁畫、圓桌與彩色小椅子、睡袋
      obox(M.woodFloor, r.u0 + 0.1, r.u1 - 0.1, VI, V1 - 0.2, fl, fl + 0.02, [3, 3]); obox(M.tileW, 35.8, 38.5, 9.7, V1 - 0.2, fl, fl + 0.03);
      for (let k = 0; k < 4; k++) L.shelf.push([r.u0 + 1.3 + k * 1.9, VI + 0.22, fl, 0]); for (let k = 0; k < 4; k++) L.shelf.push([r.u1 - 0.33, 3.4 + k * 1.9, fl, -Math.PI / 2]);
      panel(M.libMural, 'v', VI + 0.2, V1 - 0.4, fl + 1.3, fl + 3.1, r.u0 + 0.12, -1);
      for (const [u, v] of [[r.u0 + 2.2, 4.6], [r.u0 + 5.0, 4.6]]) { L.round.push([u, v, fl, 0]); [[0.9, 0, -Math.PI / 2], [-0.9, 0, Math.PI / 2], [0, 0.9, Math.PI], [0, -0.9, 0]].forEach(([du, dv, y], i) => [L.kidR, L.kidY, L.kidB, L.kidR][i].push([u + du, v + dv, fl, y])); }
      for (let k = 0; k < 6; k++) (k % 2 ? L.bag2 : L.bag).push([r.u0 + 1.2 + (k % 3) * 1.4, 7.0 + Math.floor(k / 3) * 1.9, fl + 0.02, Math.PI / 2]); }
    if (r.type === 'toilet') { obox(M.tileW, r.u0 + 0.1, r.u1 - 0.1, VI, V1 - 0.2, fl, fl + 0.02); obox(M.wallIn, 75.15, 75.25, VI, V1 - 0.2, fl, fl + 2.6);   // 左男右女
      for (const u of [73.9, 74.9, 75.8, 76.6]) obox(M.stall, u, u + 0.05, VI, 4.0, fl, fl + 1.9); obox(M.stall, 73.9, 76.65, 3.95, 4.0, fl, fl + 1.9); for (let k = 0; k < 3; k++) obox(M.white, 73.75 + k * 0.32, 73.95 + k * 0.32, 8.0, 8.35, fl + 0.4, fl + 1.1);
      dadoU(M.tileGrid, VI, 1, r.u0 + 0.1, r.u1 - 0.1, fl, fl + 1.6); }
  }

  // ===== 旗桿（穿堂前）、司令台 =====
  for (const [u, k] of [[8.5, 0], [10.5, 1]]) { obox(M.gate, u - 0.05, u + 0.05, 22.5, 22.6, 0, 9); if (k === 0) obox(M.flag, u + 0.05, u + 1.6, 22.53, 22.57, 7.8, 8.9); }
  obox(M.trim, 58, 68, 15, 18.6, 0, 1.1); obox(M.wall, 58.5, 67.5, 15.2, 18.4, 3.9, 4.2); for (const u of [58.8, 67.2]) obox(M.column, u - 0.2, u + 0.2, 18.0, 18.4, 1.1, 3.9);
  // ===== 廁所東邊到禮堂：一條不寬的走廊（有屋頂）；禮堂（風雨教室） =====
  obox(M.paver, 77, 84.8, V1, V2, 0, F1, [3, 3]); obox(M.trim, 77, 84.8, V1 - 0.1, V2 + 0.1, FH - 0.1, FH + 0.15); obox(M.ceil, 77, 84.8, V1, V2, FH - 0.11, FH - 0.1);
  for (const u of [79.6, 82.2]) for (const v of [V1 + 0.15, V2 - 0.15]) obox(M.column, u - 0.12, u + 0.12, v - 0.12, v + 0.12, 0, FH - 0.1);
  { const u0 = 84.8, u1 = 105, hh = 7.8, wi = 0.25; obox(M.floor, u0, u1, V0, V2, 0, F1, [2, 2]);
    const winS = [], winN = []; for (let a = u0 + 3.5; a < u1 - 6; a += 3.4) { winN.push({ a, b: a + 1.8, lo: 2.2, hi: 6.2, glass: true }); if (a > u0 + 5) winS.push({ a, b: a + 1.8, lo: 2.2, hi: 6.2, glass: true }); }
    winS.push({ a: u0 + 2.0, b: u0 + 4.0, lo: F1, hi: F1 + 2.5 });   // 後門（靠操場）
    wallU(M, M.hall, V0, V0 + wi, u0, u1, 0, hh, winN); wallU(M, M.hall, V2 - wi, V2, u0, u1, 0, hh, winS);
    // 西牆：門在走廊盡頭（雙開，往禮堂裡開）
    wallV(M, M.teal, u0, u0 + wi, V0, V2, 0, hh, [{ a: 12.5, b: 14.5, lo: F1, hi: F1 + 2.3 }]);
    doorLeaf(G, M, 'hallW1', { axis: 'v', a: 12.5, b: 13.5, c: u0 + wi / 2, h0: F1, h1: F1 + 2.28, hinge: 'a', to: 1 }); doorLeaf(G, M, 'hallW2', { axis: 'v', a: 13.5, b: 14.5, c: u0 + wi / 2, h0: F1, h1: F1 + 2.28, hinge: 'b', to: 1 });
    wallV(M, M.paleGreen, u1 - wi, u1, V0, V2, 0, hh);
    obox(M.door, u0 + 1.95, u0 + 2.0, V2 - wi, V2, F1, F1 + 2.5); obox(M.door, u0 + 4.0, u0 + 4.05, V2 - wi, V2, F1, F1 + 2.5);
    // 牆腳白磁磚、窗邊玫瑰紅窗簾、冷氣
    dadoU(M.tileGrid, V0 + wi, 1, u0 + wi, 99.4, F1, F1 + 1.3); dadoU(M.tileGrid, V2 - wi, -1, u0 + wi, 99.4, F1, F1 + 1.3, [[u0 + 2.0, u0 + 4.0]]); dadoV(M.tileGrid, u0 + wi, 1, V0 + wi, V2 - wi, F1, F1 + 1.3, [[12.45, 14.55]]);
    for (const o of winN) { obox(M.rose, o.a - 0.55, o.a - 0.05, V0 + wi + 0.05, V0 + wi + 0.12, 1.7, 6.6); obox(M.rose, o.b + 0.05, o.b + 0.55, V0 + wi + 0.05, V0 + wi + 0.12, 1.7, 6.6); }
    for (const o of winS.filter(o => o.glass)) { obox(M.rose, o.a - 0.55, o.a - 0.05, V2 - wi - 0.12, V2 - wi - 0.05, 1.7, 6.6); obox(M.rose, o.b + 0.05, o.b + 0.55, V2 - wi - 0.12, V2 - wi - 0.05, 1.7, 6.6); }
    for (const a of [u0 + 7.6, u0 + 14.4]) { obox(M.ac, a, a + 1.0, V0 + wi, V0 + wi + 0.26, 6.55, 6.88); obox(M.ac, a, a + 1.0, V2 - wi - 0.26, V2 - wi, 6.55, 6.88); }
    // 舞台：正面白磁磚、木地板、紅絨布幕（中間拉開）、上方垂幕、後牆粉綠
    obox(M.stageFloor, 99.5, u1 - wi, 5.0, 12.0, F1, F1 + 1.0); dadoV(M.tileGrid, 99.5, -1, 5.0, 12.0, F1, F1 + 1.0);
    obox(M.velvet, u1 - 0.55, u1 - 0.45, 5.0, 12.0, F1 + 1.0, 6.9, [1.2, 6]); obox(M.velvet, 99.7, 99.82, 5.0, 7.4, F1 + 1.0, 6.9, [1.2, 6]); obox(M.velvet, 99.7, 99.82, 9.6, 12.0, F1 + 1.0, 6.9, [1.2, 6]); obox(M.velvet, 99.6, 99.72, 4.9, 12.1, 6.2, 7.0, [1.2, 6]);
    obox(M.paleGreen, 99.4, 99.6, 4.9, 12.1, 7.0, hh);
    // 舞台兩側小房間（面向舞台：左＝北側放庶務、右＝南側電源）
    for (const [va, vb, vw] of [[V0 + wi, 5.0, 5.0], [12.0, V2 - wi, 12.0]]) { obox(M.hall, 99.5, u1 - wi, vw - 0.1, vw + 0.1, F1, 4.2); wallV(M, M.hall, 99.4, 99.6, va, vb, F1, 4.2, [{ a: (va + vb) / 2 - 0.5, b: (va + vb) / 2 + 0.5, lo: F1, hi: F1 + 2.1 }]); obox(M.door, 99.36, 99.4, (va + vb) / 2 - 0.5, (va + vb) / 2 - 0.45, F1, F1 + 2.1); obox(M.hall, 99.5, u1 - wi, va, vb, 4.2, 4.35); obox(M.tileGrid, 99.36, 99.4, va, (va + vb) / 2 - 0.55, F1, F1 + 1.3); obox(M.tileGrid, 99.36, 99.4, (va + vb) / 2 + 0.55, vb, F1, F1 + 1.3); }
    obox(M.trim, u0, u1, V0, V2, hh - 0.2, hh); obox(M.ceil, u0 + wi, u1 - wi, V0 + wi, V2 - wi, hh - 0.21, hh - 0.2); gableRoof(M.roof, u0, u1, V0, V2, hh, 2.6, 0.7);
    // 桌子（依使用者畫的）：舞台前一張橫放的長桌，前面六張桌子，後面（西半邊）空著
    const tbl = (a, b, c, d) => { obox(M.hallTable, a, b, c, d, F1 + 0.72, F1 + 0.76); for (const [u, v] of [[a + 0.1, c + 0.1], [b - 0.1, c + 0.1], [a + 0.1, d - 0.1], [b - 0.1, d - 0.1]]) obox(M.metal, u - 0.02, u + 0.02, v - 0.02, v + 0.02, F1, F1 + 0.72);
      if (b - a > d - c) { for (let u = a + 0.35; u < b - 0.2; u += 0.6) { L.fold.push([u, c - 0.35, F1, 0]); L.fold.push([u, d + 0.35, F1, Math.PI]); } } else { for (let v = c + 0.35; v < d - 0.2; v += 0.6) { L.fold.push([a - 0.35, v, F1, Math.PI / 2]); L.fold.push([b + 0.35, v, F1, -Math.PI / 2]); } } };
    obox(M.hallTable, 97.9, 98.7, 6.3, 11.3, F1 + 0.72, F1 + 0.76); for (const v of [6.4, 11.2]) for (const u of [98.0, 98.6]) obox(M.metal, u - 0.02, u + 0.02, v - 0.02, v + 0.02, F1, F1 + 0.72); for (let v = 6.6; v < 11.2; v += 0.7) L.fold.push([97.5, v, F1, Math.PI / 2]);
    tbl(89.9, 90.7, 5.2, 7.9); tbl(89.9, 90.7, 8.8, 11.0); tbl(91.9, 94.1, 5.2, 6.4); tbl(94.6, 96.8, 5.1, 6.3); tbl(92.2, 94.5, 9.4, 10.6); tbl(94.9, 97.1, 9.3, 10.5);
    for (let u = u0 + 2; u < u1 - 6; u += 3.2) for (const v of [5, 10]) obox(M.light, u, u + 1.2, v, v + 0.12, hh - 0.32, hh - 0.27); }
  // ===== 西側風雨走廊（藍綠色透光雨遮、白色鋼柱），從走廊轉角往南接到國幼班 =====
  obox(M.canopy, 20.6, 24.8, WS, 55, 3.0, 3.06); for (let v = WS + 0.2; v <= 55; v += 3.4) { obox(M.column, 20.95, 21.15, v - 0.1, v + 0.1, 0, 3.0); obox(M.column, 24.25, 24.45, v - 0.1, v + 0.1, 0, 3.0); obox(M.column, 20.95, 24.45, v - 0.05, v + 0.05, 2.9, 3.0); } obox(M.column, 20.95, 21.15, WS, 55, 2.9, 3.0); obox(M.column, 24.25, 24.45, WS, 55, 2.9, 3.0); obox(M.floor, 20.8, 24.6, WS, 55, 0, 0.15, [2, 2]);
  // ===== 南排：器材室（往後移到國幼班西南邊）、國幼班（西側推門→長走廊→推門→一小塊磁磚，其餘木地板）、溜滑梯 =====
  obox(M.wall, 20.5, 32.5, 64.6, 72, 0, FH + 0.3); obox(M.door, 25, 26.8, 64.55, 64.6, 0.15, 2.4); gableRoof(M.roof, 20.5, 32.5, 64.6, 72, FH + 0.3, 1.4, 0.4); panel(M.kMural, 'v', 65.1, 71.5, 0.6, FH + 0.1, 20.48, 1);
  groundPatch(M.conc, 19.5, 33.0, 55, 64.6, 0.07, 6);
  { const u0 = 32, u1 = 77, vC = 58.5, vB = 66, vK = 61.4, uP = 54.5; obox(M.floor, u0, u1, 56, vC, 0, F1, [2, 2]);
    obox(M.tileW, u0 + 0.2, uP, vC + 0.2, vK, 0, F1 + 0.01); obox(M.tileW, uP, 59.8, vC + 0.2, vK, 0, F1 + 0.01); obox(M.woodFloor, uP + 0.1, u1 - 0.2, vC + 0.2, vB - 0.2, 0, F1, [3, 3]); obox(M.floor, u0 + 0.2, uP, vK, vB - 0.2, 0, F1, [2, 2]);
    const ops = []; for (let a = 33.0; a < u1 - 2; a += 2.6) ops.push({ a, b: a + 1.6, lo: F1 + 1.0, hi: F1 + 2.4, glass: true });
    wallU(M, M.wall, vC, vC + 0.2, u0, u1, 0, FH, ops); wallU(M, M.wall, vB - 0.2, vB, u0, u1, 0, FH);
    wallV(M, M.wall, u0, u0 + 0.2, vC, vB, 0, FH, [{ a: 59.4, b: 60.5, lo: F1, hi: F1 + 2.2 }]); obox(M.wall, u1 - 0.2, u1, vC, vB, 0, FH);
    doorLeaf(G, M, 'kWest', { axis: 'v', a: 59.4, b: 60.5, c: u0 + 0.1, h0: F1, h1: F1 + 2.18, hinge: 'a', to: 1, mat: M.doorGreen, win: true });
    // 室內長走廊（白牆）到底的推門
    wallU(M, M.white, vK, vK + 0.15, u0 + 0.2, uP, F1, FH); wallV(M, M.wallIn, uP - 0.1, uP + 0.1, vC + 0.2, vB - 0.2, F1, FH, [{ a: 59.4, b: 60.5, lo: F1, hi: F1 + 2.2 }]);
    doorLeaf(G, M, 'kIn', { axis: 'v', a: 59.4, b: 60.5, c: uP, h0: F1, h1: F1 + 2.18, hinge: 'a', to: 1, win: true });
    for (const u of [40.0, 47.5]) obox(M.wallIn, u - 0.08, u + 0.08, vK + 0.15, vB - 0.2, F1, FH);
    dadoU(M.tileGrid, vC + 0.2, 1, uP + 0.1, u1 - 0.2, F1, F1 + 1.25); dadoU(M.tileGrid, vB - 0.2, -1, uP + 0.1, u1 - 0.2, F1, F1 + 1.25);
    for (const o of ops.filter(o => o.a > uP)) { obox(M.pinkCurtain, o.a - 0.35, o.a + 0.05, vC + 0.22, vC + 0.28, F1 + 0.9, F1 + 2.6); obox(M.pinkCurtain, o.b - 0.05, o.b + 0.35, vC + 0.22, vC + 0.28, F1 + 0.9, F1 + 2.6); }
    for (let u = u0; u <= u1 + 0.01; u += 3.2) obox(M.column, u - 0.15, u + 0.15, 56, 56.3, 0, FH); obox(M.trim, u0, u1, 55.8, vB, FH, FH + 0.3); obox(M.ceil, u0, u1, 55.8, vB, FH - 0.01, FH); gableRoof(M.roof, u0, u1, 56, vB, FH + 0.3, 1.6, 0.5);
    obox(M.white, 64, 68.5, 62.5, 63.5, F1 + 0.32, F1 + 0.37); for (let k = 0; k < 8; k++) (k % 2 ? L.bag2 : L.bag).push([62 + (k % 4) * 3.2, 60.6 + Math.floor(k / 4) * 3.6, F1 + 0.02, 0]);
    for (let u = u0 + 2; u < u1 - 1; u += 3) obox(M.light, u, u + 1.2, 62, 62.12, FH - 0.12, FH - 0.08); for (let u = u0 + 2; u < uP; u += 4) obox(M.light, u, u + 1.2, 59.9, 60.02, FH - 0.12, FH - 0.08); }
  { // 遊樂器材：只有溜滑梯（平台塔＋滑梯＋爬梯）
    for (const [u, v] of [[80.6, 57.1], [83.4, 57.1], [80.6, 59.9], [83.4, 59.9]]) obox(M.play2, u - 0.08, u + 0.08, v - 0.08, v + 0.08, 0, 3.0);
    obox(M.play3, 80.5, 83.5, 57.0, 60.0, 1.3, 1.42); gableRoof(M.play, 80.5, 83.5, 57.0, 60.0, 3.0, 0.9, 0.25);
    for (const v of [57.0, 60.0]) obox(M.play3, 80.6, 83.4, v - 0.03, v + 0.03, 1.42, 2.3); obox(M.play3, 80.47, 80.53, 57.1, 59.9, 1.42, 2.3);
    const ang = Math.atan2(1.15, 4.2), Ls = Math.hypot(1.15, 4.2), sg = new THREE.BoxGeometry(Ls, 0.05, 0.75); sg.rotateZ(-ang); place(M.play, sg, 85.6, 58.5, 0.86, 0);
    for (const dv of [-0.4, 0.4]) { const rg = new THREE.BoxGeometry(Ls, 0.22, 0.05); rg.rotateZ(-ang); place(M.play, rg, 85.6, 58.5 + dv, 0.97, 0); }
    for (const v of [57.6, 58.5]) obox(M.play2, 79.6, 79.7, v - 0.04, v + 0.04, 0, 1.45); for (let k = 1; k <= 4; k++) obox(M.play3, 79.6, 79.75, 57.6, 58.5, k * 0.29 - 0.03, k * 0.29);
    obox(M.play2, 79.6, 80.5, 57.55, 57.65, 1.38, 1.44); obox(M.play2, 79.6, 80.5, 58.45, 58.55, 1.38, 1.44); }
  // ===== 其他校內建物 =====
  obox(M.wall, 2.5, 7, 45, 62, 0, FH); obox(M.wall, 3, 17, 62, 66.5, 0, FH); obox(M.wall, 99, 112, 46.5, 58.5, 0, FH); obox(M.wall, 100.5, 114.5, 60.5, 68, 0, FH);
  for (const [a, b, c, d] of [[2.5, 7, 45, 62], [3, 17, 62, 66.5], [99, 112, 46.5, 58.5], [100.5, 114.5, 60.5, 68]]) obox(M.trim, a - 0.2, b + 0.2, c - 0.2, d + 0.2, FH, FH + 0.3);
  // ===== 大門（灰石門柱＋三角圖騰、地球儀、伸縮門、校名牆）與西側圍牆 =====
  obox(M.pillar, -0.6, 0.6, 31.4, 32.6, 0, 2.6, [1.2, 2.6]); obox(M.pillar, -0.6, 0.6, 37.2, 38.4, 0, 3.4, [1.2, 3.4]); obox(M.trim, -0.7, 0.7, 31.3, 32.7, 2.6, 2.75); obox(M.trim, -0.7, 0.7, 37.1, 38.5, 3.4, 3.55);
  { const ring = new THREE.TorusGeometry(0.62, 0.1, 10, 28); place(M.metal, ring, 0, 37.8, 4.25, Math.PI / 2); const g = new THREE.SphereGeometry(0.5, 24, 16); place(M.globe, g, 0, 37.8, 4.25, 0); }
  for (let k = 0; k < 14; k++) { const v = 28.0 + k * 0.25; obox(M.gate, -0.08 + (k % 2) * 0.16, 0.08 + (k % 2) * 0.16, v, v + 0.04, 0.1, 1.7); } obox(M.gate, -0.1, 0.25, 27.9, 31.4, 1.65, 1.7);
  for (const [va, vb] of [[0.5, 27.8], [38.4, 44]]) { obox(M.pillar, -0.3, 0.4, va, vb, 0, 1.1, [1.2, 1.1]); obox(M.fence, 0.05, 0.15, va, vb, 1.1, 1.9); for (let v = va; v < vb; v += 0.15) obox(M.fence, 0.07, 0.13, v, v + 0.03, 1.1, 1.9); obox(M.grass, -1.4, -0.3, va, vb, 0, 0.5); obox(M.trim, -1.5, -1.3, va, vb, 0, 0.55); }
  panel(M.plaque, 'v', 39.0, 43.4, 0.4, 1.0, -0.32, 1);
  // ===== 地面 =====
  groundPatch(M.conc, 0.6, 26, PV, 46, 0.07, 6); groundPatch(M.conc, 0.6, UW - 1.2, V1, PV, 0.07, 6); groundPatch(M.conc, 26, 105, 15, 18.7, 0.07, 6); groundPatch(M.clay, 26, 103, 18.7, 24, 0.08, 4); groundPatch(M.grass, 26, 98, 24, 54, 0.08, 8); groundPatch(M.conc, 24, 98, 54, 56, 0.07, 6); groundPatch(M.court, 106, 124, 6, 44, 0.08, 5);
  groundPatch(M.line, 107, 123, 25, 25.15, 0.1, 1); groundPatch(M.line, 107, 107.15, 8, 42, 0.1, 1); groundPatch(M.line, 122.85, 123, 8, 42, 0.1, 1); groundPatch(M.conc, -6, 0.6, 30, 40, 0.06, 6);
  // 家具（實例化）
  inst(F.deskTop, M.deskTop, L.deskTop); inst(F.deskBody, M.deskBody, L.deskBody); inst(F.chair, M.chair, L.chair); inst(F.fold, M.fold, L.fold); inst(F.kidChair, M.kidR, L.kidR); inst(F.kidChair, M.kidY, L.kidY); inst(F.kidChair, M.kidB, L.kidB);
  inst(F.mtTop, M.mtTop, L.mtTop); inst(F.mtBody, M.mtBody, L.mtBody); inst(F.chair, M.blueChair, L.blue); inst(F.roundTop, M.white, L.round); inst(F.shelf, M.shelf, L.shelf); inst(F.books, M.book, L.shelf.map(s => [s[0], s[1], s[2] + 0.02, s[3]]));
  inst(F.bag, M.bag, L.bag); inst(F.bag2, M.bag, L.bag2); inst(F.suitcase, M.blueChair, L.cases); inst(F.backpack, M.kidR, L.packs); inst(F.pc, M.metal, L.pcs); inst(F.wallFan, M.fan, L.wallFan, false); inst(F.ceilFan, M.fanWood, L.ceilFan, false);
  // 依材質合併
  for (const [mat, list] of PARTS) { const geo = mergeGeometries(list, false); const mesh = new THREE.Mesh(geo, mat); mesh.castShadow = !mat.transparent && mat !== M.light && mat !== M.ceil && mat !== M.hallCeil; mesh.receiveShadow = true; if (mat.transparent) mesh.renderOrder = 2; G.add(mesh); }
  PARTS.clear(); return G;
};
