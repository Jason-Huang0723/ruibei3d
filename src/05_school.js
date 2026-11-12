/* ================= 6. 瑞北國小（依場地平面圖、建物框、舊必修2 口述） ================= */
// 校地座標：原點＝校地西北角，u 沿北側圍牆往東（m），v 往南（m）。校地 126 × 64.6 m，偏轉約 −14°。
RB.CF = { o: [-50.7, 50.6], eu: [0.9715, -0.2371], ev: [-0.2371, -0.9715] };
RB.uv2xy = (u, v) => [RB.CF.o[0] + u * RB.CF.eu[0] + v * RB.CF.ev[0], RB.CF.o[1] + u * RB.CF.eu[1] + v * RB.CF.ev[1]];
RB.campusAngle = Math.atan2(RB.CF.eu[1], RB.CF.eu[0]);
RB.GROUND = 0;
// 北排教室大樓尺寸
const S_ = RB.S = { F1: 0.3, F2: 3.9, FH: 3.6, EAVE: 7.5, V0: 2.0, V1: 12.2, V2: 15.0, UW: 13, UE: 77 };
// 房間（f=樓層）。門的位置 d：門中心的 u。
RB.ROOMS = [
  { f: 1, u0: 13, u1: 21.5, name: '穿堂', type: 'hall' },
  { f: 1, u0: 21.5, u1: 29.5, name: '辦公室', type: 'office', d: [25.5] },
  { f: 1, u0: 29.5, u1: 32.7, name: '樓梯', type: 'stairs' },
  { f: 1, u0: 32.7, u1: 42.0, name: '四教', type: 'class', d: [34.2, 40.4] },
  { f: 1, u0: 42.0, u1: 51.5, name: '三教', type: 'class', d: [43.5, 49.9] },
  { f: 1, u0: 51.5, u1: 60.6, name: '二教', type: 'class', d: [53.0, 59.0] },
  { f: 1, u0: 60.6, u1: 70.2, name: '一教', type: 'class', d: [62.1, 68.6] },
  { f: 1, u0: 70.2, u1: 77.0, name: '廁所', type: 'toilet', d: [73.6] },
  { f: 2, u0: 13, u1: 21.5, name: '校長室', type: 'principal', d: [17.2] },
  { f: 2, u0: 21.5, u1: 29.5, name: '會議室', type: 'meeting', d: [25.5] },
  { f: 2, u0: 29.5, u1: 32.7, name: '樓梯', type: 'stairs' },
  { f: 2, u0: 32.7, u1: 42.0, name: '圖書室', type: 'library', d: [34.2] },
  { f: 2, u0: 42.0, u1: 51.5, name: '英語教室', type: 'english', d: [43.5, 49.9] },
  { f: 2, u0: 51.5, u1: 60.6, name: '五教', type: 'sleep', d: [53.0, 59.0] },
  { f: 2, u0: 60.6, u1: 70.2, name: '六教', type: 'sleep', d: [62.1, 68.6] },
  { f: 2, u0: 70.2, u1: 77.0, name: '廁所', type: 'toilet', d: [73.6] },
];
RB.U = (u, v, h) => { const [x, y] = RB.uv2xy(u, v); return [x, RB.GROUND + h, -y]; };

const canvasTex = (w, h, draw, rep) => { const cv = new OffscreenCanvas(w, h), g = cv.getContext('2d'); draw(g, w, h); const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; if (rep !== false) t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; };
const noiseFill = (g, n, base, amp, count, size) => { g.fillStyle = base; g.fillRect(0, 0, n, n); for (let i = 0; i < count; i++) { const x = Math.random() * n, y = Math.random() * n, r = Math.random() * size + 0.5, a = (Math.random() - 0.5) * amp; g.fillStyle = a > 0 ? 'rgba(255,255,230,' + a + ')' : 'rgba(0,20,0,' + (-a) + ')'; g.fillRect(x, y, r, r * (0.6 + Math.random())); } };
function schoolMaterials() {
  const M = {}, S = o => new THREE.MeshStandardMaterial(o);
  M.wall = S({ color: 0xf1f0ea, roughness: 0.85 });
  M.wallIn = S({ color: 0xf4f2ec, roughness: 0.9 });
  M.trim = S({ color: 0xd9d6cc, roughness: 0.8 });
  M.column = S({ color: 0xf3f2ec, roughness: 0.8 });
  M.floor = S({ roughness: 0.9, map: canvasTex(256, 256, (g, n) => { noiseFill(g, n, '#a9a8a2', 0.12, 9000, 2); g.strokeStyle = 'rgba(70,70,70,0.25)'; g.lineWidth = 2; g.strokeRect(1, 1, n - 2, n - 2); }) });
  M.wood = S({ roughness: 0.6, map: canvasTex(256, 256, (g, n) => { g.fillStyle = '#9a6a3e'; g.fillRect(0, 0, n, n); for (let y = 0; y < n; y += 16) { g.fillStyle = 'rgba(0,0,0,' + (0.08 + Math.random() * 0.1) + ')'; g.fillRect(0, y, n, 1.5); for (let x = Math.random() * 64; x < n; x += 64 + Math.random() * 64) g.fillRect(x, y, 1.5, 16); } }) });
  M.roof = S({ roughness: 0.7, side: THREE.DoubleSide, map: canvasTex(128, 128, (g, w, h) => { g.fillStyle = '#c0533c'; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 8) { g.fillStyle = 'rgba(0,0,0,0.22)'; g.fillRect(0, y, w, 2); for (let x = (y / 8 % 2) * 8; x < w; x += 16) { g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(x, y, 1, 8); } } }) });
  M.glass = S({ color: 0x8fb0c0, roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.28, depthWrite: false });
  M.frame = S({ color: 0xb8c0c4, roughness: 0.4, metalness: 0.5 });
  M.rail = S({ color: 0x2f6b55, roughness: 0.6, metalness: 0.2 });
  M.door = S({ color: 0x8a5a3a, roughness: 0.7 });
  M.board = S({ color: 0x2d5a45, roughness: 0.9 });
  M.desk = S({ color: 0xc9a77a, roughness: 0.7 });
  M.metal = S({ color: 0x6d7378, roughness: 0.5, metalness: 0.6 });
  M.chair = S({ color: 0x3d6fa8, roughness: 0.7 });
  M.shelf = S({ color: 0xb08a5c, roughness: 0.8 });
  M.book = S({ vertexColors: true, roughness: 0.8 });
  M.sofa = S({ color: 0x6b4b3a, roughness: 0.9 });
  M.light = S({ color: 0xffffff, emissive: 0xfffbe8, emissiveIntensity: 0.9 });
  M.ceil = S({ color: 0xf4f2ec, roughness: 0.95, emissive: 0x77756e });
  M.tileW = S({ color: 0xdfe6e8, roughness: 0.4 });
  M.stall = S({ color: 0x7fa7c4, roughness: 0.6 });
  M.stage = S({ color: 0x8a6440, roughness: 0.6 });
  M.curtain = S({ color: 0x9e2b2b, roughness: 0.95, side: THREE.DoubleSide });
  M.curtain2 = S({ color: 0xe8e0c8, roughness: 0.95, side: THREE.DoubleSide, transparent: true, opacity: 0.92 });
  M.hall = S({ color: 0xf1efe8, roughness: 0.85 });
  M.mat1 = S({ color: 0xe86a5a, roughness: 0.9 }); M.mat2 = S({ color: 0x5aa0e8, roughness: 0.9 }); M.mat3 = S({ color: 0xf2c94c, roughness: 0.9 }); M.mat4 = S({ color: 0x6fcf97, roughness: 0.9 });
  M.bag = S({ vertexColors: true, roughness: 0.9 });
  M.fence = S({ color: 0x4d6b5c, roughness: 0.6, metalness: 0.3 });
  M.gate = S({ color: 0xb9bec2, roughness: 0.35, metalness: 0.7 });
  M.play = S({ color: 0xd94f3a, roughness: 0.6 }); M.play2 = S({ color: 0x2f7fc1, roughness: 0.6 }); M.play3 = S({ color: 0xf2c230, roughness: 0.6 });
  M.stageFloor = S({ color: 0xb98c5a, roughness: 0.55 });
  M.flag = S({ color: 0xd8262c, roughness: 0.8, side: THREE.DoubleSide });
  M.pillar = S({ roughness: 0.85, map: canvasTex(256, 256, (g, n) => { g.fillStyle = '#6b4a3a'; g.fillRect(0, 0, n, n); g.fillStyle = '#e9e1cf'; for (let y = 24; y < n; y += 96) for (let x = 0; x < n; x += 32) { g.beginPath(); g.moveTo(x, y + 28); g.lineTo(x + 16, y); g.lineTo(x + 32, y + 28); g.closePath(); g.fill(); } g.fillStyle = '#3a2a22'; for (let y = 0; y < n; y += 96) g.fillRect(0, y + 64, n, 8); }) });
  M.globe = S({ roughness: 0.4, map: canvasTex(256, 128, (g, w, h) => { g.fillStyle = '#2f73b7'; g.fillRect(0, 0, w, h); g.fillStyle = '#e8eef2'; for (let i = 0; i < 9; i++) { g.beginPath(); g.ellipse(Math.random() * w, Math.random() * h, 12 + Math.random() * 30, 8 + Math.random() * 18, Math.random(), 0, Math.PI * 2); g.fill(); } }, true) });
  M.plaque = S({ roughness: 0.6, map: canvasTex(512, 128, (g, w, h) => { g.fillStyle = '#5d6062'; g.fillRect(0, 0, w, h); g.fillStyle = '#d9b45a'; g.font = '700 64px "Microsoft JhengHei","Noto Sans TC",sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('瑞北國民小學', w / 2, h / 2 + 4); }, false) });
  M.sign = S({ roughness: 0.6, map: canvasTex(512, 128, (g, w, h) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h); g.fillStyle = '#2b4a8a'; g.font = '700 60px "Microsoft JhengHei","Noto Sans TC",sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('花蓮縣瑞北國小', w / 2, h / 2 + 4); }, false) });
  M.mural = S({ roughness: 0.8, map: canvasTex(1024, 128, (g, w, h) => { const cs = ['#f2994a', '#56ccf2', '#6fcf97', '#f2c94c', '#bb6bd9', '#eb5757']; g.fillStyle = '#fdf6e3'; g.fillRect(0, 0, w, h); for (let i = 0; i < 40; i++) { g.fillStyle = cs[i % cs.length]; g.beginPath(); g.arc(Math.random() * w, Math.random() * h, 10 + Math.random() * 30, 0, Math.PI * 2); g.fill(); } g.fillStyle = '#2d6a4f'; for (let x = 0; x < w; x += 60) { g.fillRect(x + 20, h - 50, 8, 50); g.beginPath(); g.arc(x + 24, h - 55, 22, 0, Math.PI * 2); g.fill(); } }, false) });
  M.grass = S({ roughness: 1, map: canvasTex(512, 512, (g, n) => { noiseFill(g, n, '#6c8a4c', 0.24, 30000, 3); for (let i = 0; i < 40; i++) { const x = Math.random() * n, y = Math.random() * n, r = 20 + Math.random() * 60, gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(140,120,70,0.22)'); gr.addColorStop(1, 'rgba(140,120,70,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); } }) });
  M.clay = S({ roughness: 1, map: canvasTex(256, 256, (g, n) => noiseFill(g, n, '#a95b3c', 0.18, 18000, 3)) });
  M.conc = S({ roughness: 0.95, map: canvasTex(256, 256, (g, n) => { noiseFill(g, n, '#b9b6ad', 0.10, 9000, 2); g.strokeStyle = 'rgba(60,60,60,0.35)'; g.lineWidth = 2; for (let i = 0; i <= n; i += n / 2) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, n); g.stroke(); g.beginPath(); g.moveTo(0, i); g.lineTo(n, i); g.stroke(); } }) });
  M.court = S({ roughness: 0.9, color: 0x3f6f5a }); M.line = S({ color: 0xf2f2ea, roughness: 0.8 });
  return M;
}

// ---- 幾何小工具（所有靜態零件最後依材質合併，減少繪製次數） ----
const PARTS = new Map();
function addPart(mat, geo, matrix) { const g = geo.index ? geo.toNonIndexed() : geo.clone(); g.applyMatrix4(matrix); if (!g.attributes.uv) g.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2)); if (!g.attributes.normal) g.computeVertexNormals(); if (!PARTS.has(mat)) PARTS.set(mat, []); PARTS.get(mat).push(g); }
const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _s = new THREE.Vector3(1, 1, 1), _p = new THREE.Vector3(), _up = new THREE.Vector3(0, 1, 0);
// 校地座標下的長方體：u0..u1 × v0..v1 × 高度 h0..h1（相對校地地面）
function obox(mat, u0, u1, v0, v1, h0, h1, uvScale) {
  const ext = (h0 === 0 && h1 > 0.5) ? 1.5 : 0; h0 -= ext; const w = u1 - u0, dd = v1 - v0, h = h1 - h0; if (w <= 0.001 || dd <= 0.001 || h <= 0.001) return; const g = new THREE.BoxGeometry(w, h, dd);
  if (uvScale) { const uv = g.attributes.uv, n = g.attributes.normal, p = g.attributes.position; for (let i = 0; i < uv.count; i++) { const nx = Math.abs(n.getX(i)), ny = Math.abs(n.getY(i)), px = p.getX(i) + w / 2 + u0, py = p.getY(i) + h / 2 + h0, pz = p.getZ(i) + dd / 2 + v0; if (ny > 0.5) uv.setXY(i, px / uvScale[0], pz / uvScale[0]); else if (nx > 0.5) uv.setXY(i, pz / uvScale[0], py / uvScale[1]); else uv.setXY(i, px / uvScale[0], py / uvScale[1]); } }
  const [x, y] = RB.uv2xy((u0 + u1) / 2, (v0 + v1) / 2); _p.set(x, RB.GROUND + (h0 + h1) / 2, -y); _q.setFromAxisAngle(_up, RB.campusAngle); _m.compose(_p, _q, _s); addPart(mat, g, _m);
}
// 一般幾何放到校地座標 (u,v,h) 並旋轉 yaw（以校地 u 軸為 0）
function place(mat, geo, u, v, h, yaw, sc) { const [x, y] = RB.uv2xy(u, v); _p.set(x, RB.GROUND + h, -y); _q.setFromAxisAngle(_up, RB.campusAngle + (yaw || 0)); const s = sc || 1; _m.compose(_p, _q, new THREE.Vector3(s, s, s)); addPart(mat, geo, _m); }
// 沿 u 方向的牆（厚度在 v0..v1），openings: [{a,b,lo,hi,glass}]
function wallU(M, mat, v0, v1, u0, u1, h0, h1, openings, uvs) {
  const ops = (openings || []).slice().sort((p, q) => p.a - q.a); let cur = u0;
  for (const o of ops) { obox(mat, cur, o.a, v0, v1, h0, h1, uvs); if (o.lo > h0) obox(mat, o.a, o.b, v0, v1, h0, o.lo, uvs); obox(mat, o.a, o.b, v0, v1, o.hi, h1, uvs);
    if (o.glass) { const vm = (v0 + v1) / 2; obox(M.glass, o.a, o.b, vm - 0.01, vm + 0.01, o.lo, o.hi); obox(M.frame, o.a, o.b, vm - 0.04, vm + 0.04, o.lo, o.lo + 0.05); obox(M.frame, o.a, o.b, vm - 0.04, vm + 0.04, o.hi - 0.05, o.hi); for (let k = 0; k <= Math.round((o.b - o.a) / 1.0); k++) { const uu = o.a + (o.b - o.a) * k / Math.max(1, Math.round((o.b - o.a) / 1.0)); obox(M.frame, uu - 0.025, uu + 0.025, vm - 0.04, vm + 0.04, o.lo, o.hi); } }
    cur = o.b; }
  obox(mat, cur, u1, v0, v1, h0, h1, uvs);
}
// 沿 v 方向的牆（厚度在 u0..u1）
function wallV(M, mat, u0, u1, v0, v1, h0, h1, openings) {
  const ops = (openings || []).slice().sort((p, q) => p.a - q.a); let cur = v0;
  for (const o of ops) { obox(mat, u0, u1, cur, o.a, h0, h1); if (o.lo > h0) obox(mat, u0, u1, o.a, o.b, h0, o.lo); obox(mat, u0, u1, o.a, o.b, o.hi, h1); if (o.glass) { const um = (u0 + u1) / 2; obox(M.glass, um - 0.01, um + 0.01, o.a, o.b, o.lo, o.hi); } cur = o.b; }
  obox(mat, u0, u1, cur, v1, h0, h1);
}
function gableRoof(mat, u0, u1, v0, v1, he, r, o) { const vm = (v0 + v1) / 2, P = (u, v, h) => { const [x, y] = RB.uv2xy(u, v); return [x, RB.GROUND + h, -y]; };
  const a = P(u0 - o, v0 - o, he - o * 0.4), b = P(u1 + o, v0 - o, he - o * 0.4), c = P(u1 + o, vm, he + r), d = P(u0 - o, vm, he + r), e = P(u0 - o, v1 + o, he - o * 0.4), f = P(u1 + o, v1 + o, he - o * 0.4);
  const L = u1 - u0 + 2 * o, S = Math.hypot(vm - v0 + o, r + o * 0.4), g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute([...a, ...b, ...c, ...a, ...c, ...d, ...e, ...d, ...c, ...e, ...c, ...f, ...a, ...d, ...e, ...b, ...f, ...c], 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, L / 2, 0, L / 2, S / 2, 0, 0, L / 2, S / 2, 0, S / 2, 0, 0, 0, S / 2, L / 2, S / 2, 0, 0, L / 2, S / 2, L / 2, 0, 0, 0, 0.5, 0.5, 1, 0, 0, 0, 1, 0, 0.5, 0.5], 2)); g.computeVertexNormals(); addPart(mat, g, new THREE.Matrix4()); }
function groundPatch(mat, u0, u1, v0, v1, lift, uvm) { const nu = Math.max(2, Math.ceil((u1 - u0) / 2) + 1), nv = Math.max(2, Math.ceil((v1 - v0) / 2) + 1), pos = [], uv = [], idx = [];
  for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) { const u = u0 + (u1 - u0) * i / (nu - 1), v = v0 + (v1 - v0) * j / (nv - 1), [x, y] = RB.uv2xy(u, v); pos.push(x, RB.H(x, y) + lift, -y); uv.push((u - u0) / uvm, (v - v0) / uvm); }
  for (let j = 0; j < nv - 1; j++) for (let i = 0; i < nu - 1; i++) { const k = j * nu + i; idx.push(k, k + nu, k + 1, k + 1, k + nu, k + nu + 1); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); addPart(mat, g, new THREE.Matrix4()); }
// 家具幾何
const mergeBoxes = list => { const gs = list.map(([w, h, d, x, y, z]) => { const g = new THREE.BoxGeometry(w, h, d).toNonIndexed(); g.translate(x, y, z); return g; }); return mergeGeometries(gs); };
let FURN = null;
function furniture() { if (FURN) return FURN; FURN = {
  desk: mergeBoxes([[0.62, 0.03, 0.46, 0, 0.72, 0], [0.03, 0.72, 0.03, -0.28, 0.36, -0.2], [0.03, 0.72, 0.03, 0.28, 0.36, -0.2], [0.03, 0.72, 0.03, -0.28, 0.36, 0.2], [0.03, 0.72, 0.03, 0.28, 0.36, 0.2], [0.56, 0.12, 0.4, 0, 0.62, 0]]),
  chair: mergeBoxes([[0.4, 0.03, 0.38, 0, 0.42, 0], [0.4, 0.32, 0.03, 0, 0.62, -0.18], [0.03, 0.42, 0.03, -0.18, 0.21, -0.17], [0.03, 0.42, 0.03, 0.18, 0.21, -0.17], [0.03, 0.42, 0.03, -0.18, 0.21, 0.17], [0.03, 0.42, 0.03, 0.18, 0.21, 0.17]]),
  table: mergeBoxes([[1.8, 0.04, 0.75, 0, 0.74, 0], [0.05, 0.74, 0.05, -0.85, 0.37, -0.32], [0.05, 0.74, 0.05, 0.85, 0.37, -0.32], [0.05, 0.74, 0.05, -0.85, 0.37, 0.32], [0.05, 0.74, 0.05, 0.85, 0.37, 0.32]]),
  shelf: mergeBoxes([[1.8, 2.0, 0.04, 0, 1.0, -0.17], [0.04, 2.0, 0.36, -0.88, 1.0, 0], [0.04, 2.0, 0.36, 0.88, 1.0, 0], [1.8, 0.03, 0.36, 0, 0.05, 0], [1.8, 0.03, 0.36, 0, 0.55, 0], [1.8, 0.03, 0.36, 0, 1.05, 0], [1.8, 0.03, 0.36, 0, 1.55, 0], [1.8, 0.03, 0.36, 0, 1.98, 0]]),
  books: (() => { const gs = []; const col = []; for (let r = 0; r < 4; r++) for (let i = 0; i < 26; i++) { const w = 0.04 + Math.random() * 0.03, h = 0.3 + Math.random() * 0.12; const g = new THREE.BoxGeometry(w, h, 0.24).toNonIndexed(); g.translate(-0.85 + i * 0.066, 0.08 + r * 0.5 + h / 2, 0); const c = new THREE.Color().setHSL(Math.random(), 0.45, 0.45); const cc = new Float32Array(g.attributes.position.count * 3); for (let k = 0; k < cc.length; k += 3) { cc[k] = c.r; cc[k + 1] = c.g; cc[k + 2] = c.b; } g.setAttribute('color', new THREE.BufferAttribute(cc, 3)); gs.push(g); } return mergeGeometries(gs); })(),
  bag: (() => { const g = new THREE.CapsuleGeometry(0.28, 1.4, 4, 8).toNonIndexed(); g.rotateZ(Math.PI / 2); g.scale(1, 0.45, 1); g.translate(0, 0.13, 0); const c = new THREE.Color(); const cc = new Float32Array(g.attributes.position.count * 3); c.setHSL(0.6, 0.6, 0.45); for (let k = 0; k < cc.length; k += 3) { cc[k] = c.r; cc[k + 1] = c.g; cc[k + 2] = c.b; } g.setAttribute('color', new THREE.BufferAttribute(cc, 3)); return g; })(),
  suitcase: mergeBoxes([[0.45, 0.65, 0.26, 0, 0.33, 0], [0.2, 0.08, 0.04, 0, 0.7, 0]]),
  pc: mergeBoxes([[0.5, 0.32, 0.03, 0, 1.0, 0], [0.05, 0.25, 0.05, 0, 0.82, 0.02], [0.24, 0.02, 0.16, 0, 0.75, 0.03]]),
}; return FURN; }

RB.buildSchool = () => {
  PARTS.clear(); const G = new THREE.Group(), M = schoolMaterials(); RB.SM = M; const F = furniture();
  let hs = 0, n = 0; for (let u = 0; u <= 126; u += 10) for (let v = 0; v <= 64; v += 8) { const [x, y] = RB.uv2xy(u, v); hs += RB.H(x, y); n++; } RB.GROUND = hs / n;
  const { F1, F2, FH, EAVE, V0, V1, V2, UW, UE } = S_; const VI = V0 + 0.25; // 北牆內側
  // ===== 北排教室大樓 =====
  obox(M.floor, UW, UE, V0, V2, 0, F1, [3, 3]);                     // 一樓地坪（含走廊）
  // 二樓樓板（樓梯間留洞）
  obox(M.trim, UW, 29.5, V0, V2 + 0.1, F2 - 0.3, F2); obox(M.trim, 32.7, UE, V0, V2 + 0.1, F2 - 0.3, F2); obox(M.trim, 29.5, 32.7, 11.8, V2 + 0.1, F2 - 0.3, F2);
  obox(M.floor, UW, 29.5, V0 + 0.25, V2, F2, F2 + 0.01, [3, 3]); obox(M.floor, 32.7, UE, V0 + 0.25, V2, F2, F2 + 0.01, [3, 3]);
  obox(M.trim, UW - 0.3, UE + 0.3, V0 - 0.3, V2 + 0.5, EAVE - 0.3, EAVE);   // 屋頂板
  gableRoof(M.roof, UW, UE, V0, V2, EAVE, 2.2, 0.6);
  // 天花板（略帶自發光，室內才不會一片暗）
  obox(M.ceil, UW, 29.5, V0 + 0.25, V2, F2 - 0.31, F2 - 0.3); obox(M.ceil, 32.7, UE, V0 + 0.25, V2, F2 - 0.31, F2 - 0.3); obox(M.ceil, 29.5, 32.7, 11.8, V2, F2 - 0.31, F2 - 0.3); obox(M.ceil, UW, UE, V0 + 0.25, V2, EAVE - 0.31, EAVE - 0.3);
  // 北外牆（窗）
  for (const fl of [1, 2]) { const hb = fl === 1 ? 0 : F2, ht = fl === 1 ? F2 - 0.3 : EAVE - 0.3; const ops = []; for (const r of RB.ROOMS.filter(r => r.f === fl && r.type !== 'stairs' && r.type !== 'hall')) for (let a = r.u0 + 0.6; a < r.u1 - 1.0; a += 2.2) ops.push({ a, b: Math.min(a + 1.7, r.u1 - 0.5), lo: hb + 1.0, hi: hb + 2.7, glass: true }); wallU(M, M.wall, V0, V0 + 0.25, UW, UE, hb, ht, ops); }
  // 西端牆（一樓穿堂開放，二樓實牆＋校名）、東端牆
  obox(M.wall, UW - 0.25, UW, V0, V2, F2 - 0.3, EAVE - 0.3); obox(M.sign, UW - 0.27, UW - 0.25, 4, 11, 5.0, 6.6); obox(M.wall, UE, UE + 0.25, V0, V1, 0, EAVE - 0.3);
  // 走廊側牆（門、窗）與隔間
  for (const r of RB.ROOMS) { const hb = r.f === 1 ? 0 : F2, fl = r.f === 1 ? F1 : F2, ht = r.f === 1 ? F2 - 0.3 : EAVE - 0.3;
    if (r.type === 'hall' || r.type === 'stairs') continue;
    const ops = []; for (const d of (r.d || [])) ops.push({ a: d - 0.55, b: d + 0.55, lo: fl, hi: fl + 2.2 });
    // 走廊側高窗
    let cur = r.u0 + 0.4; const ds = (r.d || []).map(d => [d - 0.75, d + 0.75]); while (cur < r.u1 - 1.2) { const a = cur, b = Math.min(cur + 1.6, r.u1 - 0.4); if (!ds.some(([p, q]) => b > p && a < q)) ops.push({ a, b, lo: fl + 1.1, hi: fl + 2.4, glass: true }); cur += 2.0; }
    wallU(M, M.wall, V1 - 0.2, V1, r.u0, r.u1, hb, ht, ops);
    // 隔間牆（英語教室和圖書室之間是窗簾）
    if (!(r.f === 2 && r.u0 === 42.0)) obox(M.wallIn, r.u0 - 0.1, r.u0 + 0.1, VI, V1 - 0.2, hb, ht); else { obox(M.curtain2, r.u0 - 0.03, r.u0 + 0.03, VI, V1 - 0.2, fl, fl + 3.1); }
  }
  // 樓梯間兩側牆
  for (const u of [29.5, 32.7]) obox(M.wallIn, u - 0.1, u + 0.1, VI, V1 - 0.2, 0, EAVE - 0.3);
  // 天花板燈（每間）
  for (const r of RB.ROOMS) { if (r.type === 'stairs') continue; const ceil = r.f === 1 ? F2 - 0.31 : EAVE - 0.31; for (let u = r.u0 + 1.6; u < r.u1 - 1; u += 2.6) for (const v of [5.0, 9.0]) obox(M.light, u, u + 1.2, v, v + 0.3, ceil - 0.03, ceil); }
  // 走廊柱子、二樓欄杆
  const cols = [13, 17.25, 21.5, 25.5, 29.5, 32.7, 37.35, 42, 46.75, 51.5, 56.05, 60.6, 65.4, 70.2, 73.6, 77];
  for (const u of cols) obox(M.column, u - 0.22, u + 0.22, V2 - 0.45, V2, 0, EAVE - 0.3);
  obox(M.wall, UW, UE, V2 - 0.15, V2, F2, F2 + 0.95); obox(M.rail, UW, UE, V2 - 0.12, V2 + 0.02, F2 + 0.95, F2 + 1.02); obox(M.trim, UW, UE, V2 - 0.35, V2 + 0.05, 0, F1 + 0.05);
  // 樓梯（兩跑）：第一跑往北升到平台，第二跑往南升到二樓
  { const half = (F2 - F1) / 2, n = 12, run = 0.28; for (let i = 0; i < n; i++) { const v = 11.8 - (i + 1) * run; obox(M.floor, 29.6, 31.1, v, v + run, F1, F1 + half * (i + 1) / n); obox(M.floor, 31.1, 32.6, 8.44 + i * run, 8.44 + (i + 1) * run, F1, F1 + half + half * (i + 1) / n); }
    obox(M.floor, 29.6, 32.6, 6.6, 8.44, F1, F1 + half); obox(M.rail, 31.07, 31.13, 8.44, 11.8, F1 + 0.9, F1 + 1.0 + half); obox(M.wallIn, 29.6, 32.6, VI, 6.6, 0, EAVE - 0.3); }
  // ===== 室內家具 =====
  const desks = [], chairs = [], tables = [], shelves = [], bagsP = [], cases = [], pcs = [];
  for (const r of RB.ROOMS) { const fl = r.f === 1 ? F1 : F2, um = (r.u0 + r.u1) / 2;
    if (r.type === 'class' || r.type === 'sleep' || r.type === 'english') { obox(M.board, r.u1 - 0.14, r.u1 - 0.1, 4.0, 10.0, fl + 0.9, fl + 2.1); obox(M.desk, r.u1 - 2.1, r.u1 - 0.9, 6.3, 7.8, fl, fl + 0.78);
      for (let i = 0; i < 4; i++) for (let j = 0; j < 5; j++) { const u = r.u0 + 1.6 + i * 1.5, v = 3.6 + j * 1.6; if (u > r.u1 - 2.6) continue; desks.push([u, v, fl, Math.PI / 2]); chairs.push([u - 0.5, v, fl, Math.PI / 2]); }
      obox(M.shelf, r.u0 + 0.12, r.u0 + 0.5, 3, 11, fl, fl + 1.0); }
    if (r.type === 'sleep') for (let k = 0; k < 6; k++) bagsP.push([r.u0 + 1.2, 3.4 + k * 1.25, fl, 0]);
    if (r.type === 'english') for (let k = 0; k < 14; k++) cases.push([r.u0 + 0.9 + (k % 7) * 0.55, 2.9 + Math.floor(k / 7) * 0.5, fl, 0]);
    if (r.type === 'library') { obox(M.wood, r.u0 + 0.1, r.u1 - 0.1, VI, V1 - 0.2, fl, fl + 0.02); for (let k = 0; k < 4; k++) shelves.push([r.u0 + 1.4 + k * 2.0, VI + 0.25, fl, 0]); for (let k = 0; k < 3; k++) shelves.push([r.u1 - 0.35, 4.4 + k * 2.2, fl, -Math.PI / 2]); for (let k = 0; k < 8; k++) bagsP.push([r.u0 + 1.4 + (k % 4) * 1.6, 7.0 + Math.floor(k / 4) * 1.6, fl + 0.02, Math.PI / 2]); }
    if (r.type === 'meeting') { for (let i = 0; i < 3; i++) { tables.push([r.u0 + 2.2 + i * 1.9, 6.6, fl, 0]); tables.push([r.u0 + 2.2 + i * 1.9, 8.1, fl, 0]); for (const v of [5.8, 8.9]) for (const du of [-0.5, 0.5]) chairs.push([r.u0 + 2.2 + i * 1.9 + du, v, fl, v < 7 ? 0 : Math.PI]); } obox(M.board, r.u1 - 0.14, r.u1 - 0.1, 4.5, 9.5, fl + 0.9, fl + 2.1); }
    if (r.type === 'principal') { obox(M.desk, r.u0 + 4.6, r.u0 + 6.4, 4.0, 4.8, fl, fl + 0.78); pcs.push([r.u0 + 5.5, 4.2, fl, 0]); obox(M.sofa, r.u0 + 1.0, r.u0 + 3.6, 8.6, 9.5, fl, fl + 0.45); obox(M.sofa, r.u0 + 1.0, r.u0 + 3.6, 9.3, 9.5, fl, fl + 0.85); obox(M.desk, r.u0 + 1.4, r.u0 + 3.2, 7.2, 8.2, fl, fl + 0.42);
      wallU(M, M.wallIn, 5.6, 5.75, r.u0 + 0.1, r.u0 + 3.2, fl, fl + 3.1, [{ a: r.u0 + 1.6, b: r.u0 + 2.5, lo: fl, hi: fl + 2.1 }]); obox(M.wallIn, r.u0 + 3.1, r.u0 + 3.25, VI, 5.75, fl, fl + 3.1); obox(M.tileW, r.u0 + 0.1, r.u0 + 3.1, VI, 5.6, fl, fl + 0.02); }
    if (r.type === 'office') for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { obox(M.desk, r.u0 + 1.2 + i * 3.2, r.u0 + 2.7 + i * 3.2, 4.0 + j * 3.2, 4.8 + j * 3.2, fl, fl + 0.78); pcs.push([r.u0 + 1.95 + i * 3.2, 4.2 + j * 3.2, fl, 0]); chairs.push([r.u0 + 1.95 + i * 3.2, 5.3 + j * 3.2, fl, Math.PI]); }
    if (r.type === 'toilet') { obox(M.tileW, r.u0 + 0.1, r.u1 - 0.1, VI, V1 - 0.2, fl, fl + 0.02); for (let k = 0; k < 4; k++) { obox(M.stall, r.u0 + 0.6 + k * 1.3, r.u0 + 0.65 + k * 1.3, VI, 4.0, fl, fl + 1.9); } obox(M.stall, r.u0 + 0.6, r.u0 + 5.85, 3.95, 4.0, fl, fl + 1.9); obox(M.tileW, r.u0 + 0.5, r.u1 - 0.5, 9.6, 10.2, fl, fl + 0.85); }
    if (r.type === 'hall') { obox(M.board, r.u0 + 1.5, r.u1 - 1.5, VI + 0.02, VI + 0.06, F1 + 1.0, F1 + 2.4); for (const u of [r.u0 + 2, r.u1 - 3]) obox(M.desk, u, u + 1.6, 9.5, 9.9, F1, F1 + 0.45); }
  }
  const inst = (geo, mat, list) => { if (!list.length) return; const im = new THREE.InstancedMesh(geo, mat, list.length); list.forEach(([u, v, h, yaw], i) => { const [x, y] = RB.uv2xy(u, v); _p.set(x, RB.GROUND + h, -y); _q.setFromAxisAngle(_up, RB.campusAngle + yaw); _m.compose(_p, _q, _s); im.setMatrixAt(i, _m); }); im.castShadow = true; im.receiveShadow = true; G.add(im); };
  inst(F.desk, M.desk, desks); inst(F.chair, M.chair, chairs); inst(F.table, M.desk, tables); inst(F.shelf, M.shelf, shelves); inst(F.books, M.book, shelves.map(s => [s[0], s[1], s[2] + 0.02, s[3]]));
  const bagM = new THREE.MeshStandardMaterial({ roughness: 0.9, vertexColors: true }); inst(F.bag, bagM, bagsP); inst(F.suitcase, M.chair, cases); inst(F.pc, M.metal, pcs);
  // ===== 穿堂前的雨遮（二樓為陽台）、旗桿 =====
  obox(M.trim, 13, 24, V2, 21, FH - 0.1, FH + 0.2); obox(M.ceil, 13, 24, V2, 21, FH - 0.11, FH - 0.1); obox(M.wall, 13, 24, 20.85, 21, FH + 0.2, FH + 1.2); obox(M.wall, 23.85, 24, V2, 21, FH + 0.2, FH + 1.2); obox(M.floor, 13, 24, V2, 21, 0, F1, [3, 3]);
  for (const [u, v] of [[13.3, 20.6], [23.7, 20.6], [23.7, 17.5]]) obox(M.column, u - 0.25, u + 0.25, v - 0.25, v + 0.25, 0, FH);
  for (const [u, k] of [[8.5, 0], [10.5, 1]]) { obox(M.gate, u - 0.05, u + 0.05, 22.5, 22.6, 0, 9); if (k === 0) obox(M.flag, u + 0.05, u + 1.6, 22.53, 22.57, 7.8, 8.9); }
  // ===== 司令台 =====
  obox(M.trim, 58, 68, 15, 18.6, 0, 1.1); obox(M.wall, 58.5, 67.5, 15.2, 18.4, 3.9, 4.2); for (const u of [58.8, 67.2]) obox(M.column, u - 0.2, u + 0.2, 18.0, 18.4, 1.1, 3.9);
  // ===== 廁所東側通道、禮堂（風雨教室） =====
  obox(M.floor, 77, 84.8, V0, V2, 0, F1, [3, 3]); obox(M.trim, 77, 84.8, V0, V2, FH - 0.1, FH + 0.2); obox(M.ceil, 77, 84.8, V0, V2, FH - 0.11, FH - 0.1); gableRoof(M.roof, 77.3, 84.5, V0, V2, FH + 0.2, 0.8, 0.3);
  { const u0 = 84.8, u1 = 105, hh = 7.8; obox(M.stageFloor, u0, u1, V0, V2, 0, F1, [3, 3]);
    const winS = [], winN = []; for (let a = u0 + 3.5; a < u1 - 2; a += 3.4) { winN.push({ a, b: a + 1.8, lo: 2.2, hi: 6.2, glass: true }); if (a > u0 + 5) winS.push({ a, b: a + 1.8, lo: 2.2, hi: 6.2, glass: true }); }
    winS.push({ a: u0 + 2.0, b: u0 + 4.0, lo: F1, hi: F1 + 2.5 });   // 後門（靠操場）
    wallU(M, M.hall, V0, V0 + 0.25, u0, u1, 0, hh, winN); wallU(M, M.hall, V2 - 0.25, V2, u0, u1, 0, hh, winS);
    wallV(M, M.hall, u0, u0 + 0.25, V0, V2, 0, hh, [{ a: 7.6, b: 9.4, lo: F1, hi: F1 + 2.3 }]); obox(M.door, u0 + 0.25, u0 + 0.3, 7.6, 9.4, F1, F1 + 2.3); wallV(M, M.hall, u1 - 0.25, u1, V0, V2, 0, hh);
    // 舞台與左右小房間（面向舞台時：左＝北側放庶務、右＝南側電源）
    obox(M.stageFloor, 99.5, u1 - 0.25, 5.0, 12.0, F1, F1 + 1.0); obox(M.curtain, u1 - 0.4, u1 - 0.3, 5.0, 12.0, F1 + 1.0, 6.5); obox(M.curtain, 99.4, 99.6, 5.0, 5.8, F1 + 1.0, 6.5); obox(M.curtain, 99.4, 99.6, 11.2, 12.0, F1 + 1.0, 6.5);
    for (const [va, vb, vw] of [[V0 + 0.25, 5.0, 5.0], [12.0, V2 - 0.25, 12.0]]) { obox(M.hall, 99.5, u1 - 0.25, vw - 0.1, vw + 0.1, F1, 3.2); wallV(M, M.hall, 99.4, 99.6, va, vb, F1, 3.2, [{ a: (va + vb) / 2 - 0.5, b: (va + vb) / 2 + 0.5, lo: F1, hi: F1 + 2.1 }]); obox(M.hall, 99.5, u1 - 0.25, va, vb, 3.2, 3.35); }
    obox(M.trim, u0, u1, V0, V2, hh - 0.2, hh); obox(M.ceil, u0 + 0.25, u1 - 0.25, V0 + 0.25, V2 - 0.25, hh - 0.21, hh - 0.2); gableRoof(M.roof, u0, u1, V0, V2, hh, 2.6, 0.7);
    // 小隊桌（6 組 × 8 人）
    for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) { const uc = 88.2 + i * 3.6, vc = 5.6 + j * 4.4; obox(M.desk, uc - 1.2, uc + 1.2, vc - 0.8, vc + 0.8, F1, F1 + 0.74); const cl = []; for (const du of [-0.9, -0.3, 0.3, 0.9]) { cl.push([uc + du, vc - 1.15, F1, 0]); cl.push([uc + du, vc + 1.15, F1, Math.PI]); } inst(F.chair, M.chair, cl); }
    for (let u = u0 + 2; u < u1 - 1; u += 3.2) for (const v of [5, 10]) obox(M.light, u, u + 1.2, v, v + 0.3, hh - 0.25, hh - 0.2); }
  // ===== 西側連通走廊（白色鋼構雨遮） =====
  obox(M.trim, 20, 24, 21, 55, 3.0, 3.25); obox(M.ceil, 20, 24, 21, 55, 2.99, 3.0); for (let v = 21; v <= 55; v += 3.4) { obox(M.column, 20.15, 20.35, v - 0.1, v + 0.1, 0, 3.0); obox(M.column, 23.65, 23.85, v - 0.1, v + 0.1, 0, 3.0); } obox(M.floor, 20, 24, 21, 55, 0, 0.15, [3, 3]);
  // ===== 南排：器材室、國幼班（一層樓，北側走廊面向操場）、遊樂器材 =====
  obox(M.wall, 20, 32, 55.5, 64, 0, FH + 0.3); obox(M.door, 25, 26.8, 55.45, 55.5, 0.15, 2.4); gableRoof(M.roof, 20, 32, 55.5, 64, FH + 0.3, 1.4, 0.4);
  { const u0 = 32, u1 = 77, vC = 58.5, vB = 66; obox(M.floor, u0, u1, 56, vB, 0, F1, [3, 3]); const ops = [{ a: 39.45, b: 40.55, lo: F1, hi: F1 + 2.2 }, { a: 61.45, b: 62.55, lo: F1, hi: F1 + 2.2 }]; for (let a = 34; a < u1 - 2; a += 2.6) if (!ops.some(o => a + 1.6 > o.a - 0.3 && a < o.b + 0.3)) ops.push({ a, b: a + 1.6, lo: F1 + 0.9, hi: F1 + 2.3, glass: true });
    wallU(M, M.wall, vC, vC + 0.2, u0, u1, 0, FH, ops); obox(M.mural, u0, u1, vC - 0.02, vC, FH - 0.9, FH - 0.05); wallU(M, M.wall, vB - 0.2, vB, u0, u1, 0, FH); obox(M.wall, u0, u0 + 0.2, vC, vB, 0, FH); obox(M.wall, u1 - 0.2, u1, vC, vB, 0, FH); obox(M.wallIn, 54.4, 54.6, vC, vB, 0, FH);
    for (let u = u0; u <= u1 + 0.01; u += 3.2) obox(M.column, u - 0.15, u + 0.15, 56, 56.3, 0, FH); obox(M.trim, u0, u1, 55.8, vB, FH, FH + 0.3); obox(M.ceil, u0, u1, 55.8, vB, FH - 0.01, FH); gableRoof(M.roof, u0, u1, 56, vB, FH + 0.3, 1.6, 0.5);
    const mats = [M.mat1, M.mat2, M.mat3, M.mat4]; for (let i = 0; i < 18; i++) for (let j = 0; j < 5; j++) obox(mats[(i + j) % 4], u0 + 0.4 + i * 1.2, u0 + 1.6 + i * 1.2, vC + 0.4 + j * 1.4, vC + 1.8 + j * 1.4, F1, F1 + 0.04);
    obox(M.shelf, 40.8, 42.6, vC + 0.3, vC + 0.6, F1, F1 + 0.6); }
  obox(M.play2, 80, 84, 57, 60, 0, 2.2); obox(M.play, 80.5, 83.5, 57.3, 59.7, 2.2, 3.2); obox(M.play3, 84, 88, 58, 59, 0.4, 0.6); for (const u of [88.5, 91.5]) obox(M.gate, u - 0.06, u + 0.06, 55.5, 55.62, 0, 2.6); obox(M.gate, 88.5, 91.5, 55.5, 55.62, 2.5, 2.62);
  // ===== 其他校內建物 =====
  obox(M.wall, 2.5, 7, 45, 62, 0, FH); obox(M.wall, 3, 17, 62, 66.5, 0, FH); obox(M.wall, 99, 112, 46.5, 58.5, 0, FH); obox(M.wall, 100.5, 114.5, 60.5, 68, 0, FH);
  for (const [a, b, c, d] of [[2.5, 7, 45, 62], [3, 17, 62, 66.5], [99, 112, 46.5, 58.5], [100.5, 114.5, 60.5, 68]]) obox(M.trim, a - 0.2, b + 0.2, c - 0.2, d + 0.2, FH, FH + 0.3);
  // ===== 大門（原住民圖騰門柱、地球儀、伸縮門、校名牆）與西側圍牆 =====
  obox(M.pillar, -0.6, 0.6, 31.4, 32.6, 0, 2.5, [1.2, 2.5]); obox(M.pillar, -0.6, 0.6, 37.2, 38.4, 0, 2.5, [1.2, 2.5]); obox(M.trim, -0.7, 0.7, 31.3, 32.7, 2.5, 2.7); obox(M.trim, -0.7, 0.7, 37.1, 38.5, 2.5, 2.7);
  obox(M.trim, -0.12, 0.12, 37.68, 37.92, 2.7, 3.6); { const g = new THREE.SphereGeometry(0.62, 24, 16); place(M.globe, g, 0, 37.8, 4.25, 0); }
  for (let k = 0; k < 14; k++) { const v = 28.0 + k * 0.25; obox(M.gate, -0.08 + (k % 2) * 0.16, 0.08 + (k % 2) * 0.16, v, v + 0.04, 0.1, 1.7); } obox(M.gate, -0.1, 0.25, 27.9, 31.4, 1.65, 1.7);
  for (const [va, vb] of [[0.5, 27.8], [38.4, 44]]) { obox(M.trim, -0.2, 0.4, va, vb, 0, 0.7); obox(M.fence, 0.05, 0.15, va, vb, 0.7, 1.9); for (let v = va; v < vb; v += 0.15) obox(M.fence, 0.07, 0.13, v, v + 0.03, 0.7, 1.9); obox(M.grass, -1.4, -0.2, va, vb, 0, 0.5); }
  obox(M.plaque, -0.45, -0.4, 39.2, 42.8, 0.8, 1.7);
  // ===== 地面 =====
  groundPatch(M.conc, 0.6, 26, 15, 46, 0.07, 6); groundPatch(M.conc, 24, 105, 15, 18.7, 0.07, 6); groundPatch(M.clay, 26, 103, 18.7, 24, 0.08, 4); groundPatch(M.grass, 26, 98, 24, 54, 0.08, 8); groundPatch(M.conc, 24, 98, 54, 56, 0.07, 6); groundPatch(M.court, 106, 124, 6, 44, 0.08, 5);
  groundPatch(M.line, 107, 123, 25, 25.15, 0.1, 1); groundPatch(M.line, 107, 107.15, 8, 42, 0.1, 1); groundPatch(M.line, 122.85, 123, 8, 42, 0.1, 1); groundPatch(M.conc, -6, 0.6, 30, 40, 0.06, 6);
  // 依材質合併
  for (const [mat, list] of PARTS) { const geo = mergeGeometries(list, false); const mesh = new THREE.Mesh(geo, mat); mesh.castShadow = !mat.transparent && mat !== M.light; mesh.receiveShadow = true; if (mat.transparent) mesh.renderOrder = 2; G.add(mesh); }
  PARTS.clear(); return G;
};
