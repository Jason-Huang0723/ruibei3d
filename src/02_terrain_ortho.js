/* ================= 2. 地形 ================= */
RB.RECT = { region: [-15000, 15000, -15000, 15000], village: [-1100, 700, -900, 1100], core: [-330, 230, -230, 330] };
function bil(G, x, y) { const fx = (x - G.xmin) / (G.xmax - G.xmin) * (G.nx - 1), fy = (G.ymax - y) / (G.ymax - G.ymin) * (G.ny - 1); const i = Math.max(0, Math.min(G.nx - 1.0001, fx)), j = Math.max(0, Math.min(G.ny - 1.0001, fy)); const i0 = Math.floor(i), j0 = Math.floor(j), u = i - i0, v = j - j0, E = G.E, n = G.nx; return E[j0 * n + i0] * (1 - u) * (1 - v) + E[j0 * n + i0 + 1] * u * (1 - v) + E[(j0 + 1) * n + i0] * (1 - u) * v + E[(j0 + 1) * n + i0 + 1] * u * v; }
RB.hRaw = (x, y) => { const [a, b, c, d] = RB.RECT.village; const hr = bil(RB.Hr, x, y); if (x < a || x > b || y < c || y > d) return hr; const t = Math.min(1, Math.min(x - a, b - x, y - c, d - y) / 150); return hr * (1 - t) + bil(RB.Hv, x, y) * t; };
RB.H = (x, y) => RB.hRaw(x, y) - RB.BASE;
RB.buildHeights = async () => { const [a, b, c, d] = RB.RECT.village; RB.Hv = await RB.terrainGrid(15, a, b, c, d, Math.round((b - a) / 8) + 1, Math.round((d - c) / 8) + 1); const [e, f, g, h] = RB.RECT.region; RB.Hr = await RB.terrainGrid(11, e, f, g, h, 301, 301); RB.BASE = RB.hRaw(0, 0); };
RB.terrainMesh = (rect, nx, ny, tex, hole, sink) => {
  const [a, b, c, d] = rect; const pos = new Float32Array(nx * ny * 3), uv = new Float32Array(nx * ny * 2); const M = tex.merc;
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { const x = a + (b - a) * i / (nx - 1), y = d - (d - c) * j / (ny - 1), k = j * nx + i; pos[k * 3] = x; pos[k * 3 + 1] = RB.H(x, y) - (sink || 0); if (RB.FLAT && RB.inPoly(RB.FLAT, x, y)) pos[k * 3 + 1] = Math.min(pos[k * 3 + 1], RB.GROUND - 0.05); pos[k * 3 + 2] = -y; const [lon, lat] = RB.toLL(x, y); uv[k * 2] = (RB.lon2x(lon, M.z) * 256 - M.px0) / M.W; uv[k * 2 + 1] = 1 - (RB.lat2y(lat, M.z) * 256 - M.py0) / M.H; }
  const idx = []; for (let j = 0; j < ny - 1; j++) for (let i = 0; i < nx - 1; i++) { const k = j * nx + i; if (hole) { const x0 = a + (b - a) * i / (nx - 1), x1 = a + (b - a) * (i + 1) / (nx - 1), y0 = d - (d - c) * (j + 1) / (ny - 1), y1 = d - (d - c) * j / (ny - 1); if (x0 >= hole[0] && x1 <= hole[1] && y0 >= hole[2] && y1 <= hole[3]) continue; } idx.push(k, k + nx, k + 1, k + 1, k + nx, k + nx + 1); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); return g;
};
RB.makeTex = (M, aniso) => { const t = new THREE.CanvasTexture(M.cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = aniso || 8; t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; t.merc = { z: M.z, px0: M.px0, py0: M.py0, W: M.W, H: M.H }; return t; };

/* ================= 3. 正射影像：去浮水印、調色 ================= */
// 國土測繪中心影像有半透明「NLSC 2022」浮水印，以固定地理格點排列（z19 約 620×449 px，z18 為一半）。
RB.cleanWM = (cv, opt = {}) => {
  const W = cv.width, H = cv.height, g = cv.getContext('2d', { willReadFrequently: true }), img = g.getImageData(0, 0, W, H), d = img.data;
  const Lm = new Float32Array(W * H); for (let p = 0; p < W * H; p++) Lm[p] = (d[p * 4] + d[p * 4 + 1] + d[p * 4 + 2]) / 3;
  const blur = (src, r) => { const tmp = new Float32Array(W * H), out = new Float32Array(W * H); for (let y = 0; y < H; y++) { let s = 0; for (let x = -r; x <= r; x++) s += src[y * W + Math.min(W - 1, Math.max(0, x))]; for (let x = 0; x < W; x++) { tmp[y * W + x] = s / (2 * r + 1); s += src[y * W + Math.min(W - 1, x + r + 1)] - src[y * W + Math.max(0, x - r)]; } } for (let x = 0; x < W; x++) { let s = 0; for (let y = -r; y <= r; y++) s += tmp[Math.min(H - 1, Math.max(0, y)) * W + x]; for (let y = 0; y < H; y++) { out[y * W + x] = s / (2 * r + 1); s += tmp[Math.min(H - 1, y + r + 1) * W + x] - tmp[Math.max(0, y - r) * W + x]; } } return out; };
  const sc = opt.scale || 1; const bl = blur(Lm, Math.max(2, Math.round(5 * sc))), bg = blur(Lm, Math.max(4, Math.round(12 * sc)));
  const hp = new Float32Array(W * H); for (let p = 0; p < W * H; p++) { const mx = Math.max(d[p * 4], d[p * 4 + 1], d[p * 4 + 2]), mn = Math.min(d[p * 4], d[p * 4 + 1], d[p * 4 + 2]); hp[p] = (mx - mn < 55) ? Math.max(0, Lm[p] - bl[p]) : 0; }
  const PX = Math.round(620 * sc), PY = Math.round(449 * sc), BW = Math.round(240 * sc), BH = Math.round(56 * sc), IW = Math.round(220 * sc), IH = Math.round(40 * sc);
  const I = new Float64Array((W + 1) * (H + 1)); for (let y = 0; y < H; y++) { let row = 0; for (let x = 0; x < W; x++) { row += hp[y * W + x]; I[(y + 1) * (W + 1) + x + 1] = I[y * (W + 1) + x + 1] + row; } }
  const box = (x, y, w, h) => { x = Math.max(0, x); y = Math.max(0, y); const x1 = Math.min(W, x + w), y1 = Math.min(H, y + h); if (x1 <= x || y1 <= y) return 0; return I[y1 * (W + 1) + x1] - I[y * (W + 1) + x1] - I[y1 * (W + 1) + x] + I[y * (W + 1) + x]; };
  let best = -1, bo = [0, 0]; for (let oy = 0; oy < PY; oy += 2) for (let ox = 0; ox < PX; ox += 2) { let s = 0; for (let y = oy; y < H - IH; y += PY) for (let x = ox; x < W - IW; x += PX) s += box(x, y, IW, IH); if (s > best) { best = s; bo = [ox, oy]; } }
  let inst = []; for (let y0 = bo[1] % PY - PY; y0 < H; y0 += PY) for (let x0 = bo[0] % PX - PX; x0 < W; x0 += PX) inst.push([x0 - Math.round(10 * sc), y0 - Math.round(8 * sc)]);
  const full = p => p[0] >= 0 && p[1] >= 0 && p[0] + BW <= W && p[1] + BH <= H; const T = new Float32Array(BW * BH);
  const build = () => { T.fill(0); let c = 0; for (const p of inst) { if (!full(p)) continue; for (let y = 0; y < BH; y++) for (let x = 0; x < BW; x++) T[y * BW + x] += hp[(p[1] + y) * W + p[0] + x]; c++; } for (let i = 0; i < T.length; i++) T[i] /= Math.max(1, c); };
  build(); const RR = Math.max(3, Math.round(8 * sc));
  for (let it = 0; it < 3; it++) { inst = inst.map(p => { let bb = -1e9, bp = p; for (let dy = -RR; dy <= RR; dy++) for (let dx = -RR; dx <= RR; dx++) { const qq = [p[0] + dx, p[1] + dy]; let s = 0; for (let y = 0; y < BH; y++) for (let x = 0; x < BW; x++) { const X = qq[0] + x, Y = qq[1] + y; if (X < 0 || Y < 0 || X >= W || Y >= H) continue; s += T[y * BW + x] * hp[Y * W + X]; } if (s > bb) { bb = s; bp = qq; } } return bp; }); build(); }
  const A = new Float32Array(BW * BH), C = new Float32Array(BW * BH); for (const p of inst) { if (!full(p)) continue; for (let y = 0; y < BH; y++) for (let x = 0; x < BW; x++) { const qq = (p[1] + y) * W + p[0] + x; A[y * BW + x] += (Lm[qq] - bg[qq]) / Math.max(40, 255 - bg[qq]); C[y * BW + x]++; } }
  let amax = 0; for (let i = 0; i < A.length; i++) { A[i] = C[i] ? A[i] / C[i] : 0; amax = Math.max(amax, A[i]); } for (let i = 0; i < A.length; i++) A[i] = A[i] < amax * 0.15 ? 0 : Math.min(0.85, A[i] * 1.5);
  for (const p of inst) for (let y = 0; y < BH; y++) for (let x = 0; x < BW; x++) { const a = A[y * BW + x]; if (a <= 0) continue; const X = p[0] + x, Y = p[1] + y; if (X < 0 || Y < 0 || X >= W || Y >= H) continue; const k = (Y * W + X) * 4; for (let c = 0; c < 3; c++) d[k + c] = Math.max(0, Math.min(255, (d[k + c] - 255 * a) / (1 - a))); }
  g.putImageData(img, 0, 0);
};
RB.cleanMosaic = (M, opt) => { const W = M.W, H = M.H, strip = 1600, ov = 240; for (let y0 = 0; y0 < H; y0 += strip) { const ys = Math.max(0, y0 - ov), ye = Math.min(H, y0 + strip + ov), h = ye - ys; if (h < 300) continue; const tc = new OffscreenCanvas(W, h); tc.getContext('2d', { willReadFrequently: true }).drawImage(M.cv, 0, ys, W, h, 0, 0, W, h); RB.cleanWM(tc, opt); const yy = Math.min(H, y0 + strip); M.g.drawImage(tc, 0, y0 - ys, W, yy - y0, 0, y0, W, yy - y0); } };
RB.grade = M => { const tmp = new OffscreenCanvas(M.W, M.H), tg = tmp.getContext('2d'); tg.filter = 'contrast(1.07) saturate(1.12) brightness(1.04)'; tg.drawImage(M.cv, 0, 0); tg.filter = 'none'; tg.globalCompositeOperation = 'multiply'; tg.fillStyle = 'rgb(255,244,226)'; tg.fillRect(0, 0, M.W, M.H); M.g.globalCompositeOperation = 'copy'; M.g.drawImage(tmp, 0, 0); M.g.globalCompositeOperation = 'source-over'; };
RB.decloud = M => { const id = M.g.getImageData(0, 0, M.W, M.H), d = id.data; for (let p = 0; p < d.length; p += 4) { const r = d[p], g = d[p + 1], b = d[p + 2], L = (r + g + b) / 3, sat = Math.max(r, g, b) - Math.min(r, g, b); if (L > 165 && sat < 40) { const t = Math.min(1, (L - 165) / 50); d[p] = r * (1 - t) + 70 * t; d[p + 1] = g * (1 - t) + 88 * t; d[p + 2] = b * (1 - t) + 62 * t; } } M.g.putImageData(id, 0, 0); };
RB.halve = M => { const W = Math.round(M.W / 2), H = Math.round(M.H / 2), cv = new OffscreenCanvas(W, H), g = cv.getContext('2d', { willReadFrequently: true }); g.imageSmoothingQuality = 'high'; g.drawImage(M.cv, 0, 0, W, H); return { cv, g, W, H, px0: M.px0 / 2, py0: M.py0 / 2, z: M.z - 1 }; };
RB.loadOrtho = async st => {
  const R_ = RB.RECT, O = {};
  st('下載大範圍影像', 0.30); O.region = await RB.mosaic('PHOTO2', 13, ...R_.region); RB.decloud(O.region);
  if (RB.LOW) {
    st('下載社區影像', 0.38); O.village = await RB.mosaic('PHOTO2', 17, ...R_.village, f => st('下載社區影像', 0.38 + 0.1 * f));
    st('下載學校周邊影像', 0.48); O.core = await RB.mosaic('PHOTO2', 18, ...R_.core); st('去除影像浮水印', 0.52); RB.cleanMosaic(O.core, { scale: 0.5 });
  } else {
    st('下載社區影像', 0.38); const vf = await RB.mosaic('PHOTO2', 18, ...R_.village, f => st('下載社區影像', 0.38 + 0.1 * f)); st('去除影像浮水印', 0.48); RB.cleanMosaic(vf, { scale: 0.5 }); O.village = RB.halve(vf);
    st('下載學校周邊影像', 0.52); O.core = await RB.mosaic('PHOTO2', 19, ...R_.core); st('去除影像浮水印', 0.56); RB.cleanMosaic(O.core, { scale: 1 });
  }
  for (const k of ['core', 'village', 'region']) RB.grade(O[k]); RB.ORTHO = O;
};
