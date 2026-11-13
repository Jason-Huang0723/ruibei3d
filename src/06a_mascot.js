/* ================= 7a. 山友吉祥物（3D） ================= */
// 依 36th／37th 頭貼裡的綠色小山畫：左肩較低、中間主峰最高、右邊凹口再一個小峰，身體下緣微彎；
// 大眼睛（黑眼珠往右上看、白色反光點）、小眉毛、捲捲的小鼻子、微笑、腮紅點點、眼旁三條小弧線；
// 細細的手臂、白襪藍條紋、藍色球鞋。卡通著色＋深色描邊。原點在兩腳中間的地面，面向 +z。
RB.makeMascot = () => {
  const T = THREE, W = 1.0, H = 0.9, LEG = 0.36, DEPTH = 0.13, BT = 0.12, BS = 0.045;
  const GREEN = 0x84b194, INK = 0x1c1a18, SHOE = 0x3c90a9;
  const grad = (() => { const d = new Uint8Array([90, 90, 90, 255, 175, 175, 175, 255, 255, 255, 255, 255]); const t = new T.DataTexture(d, 3, 1, T.RGBAFormat); t.minFilter = t.magFilter = T.NearestFilter; t.needsUpdate = true; return t; })();
  const toon = (c, o) => new T.MeshToonMaterial(Object.assign({ color: c, gradientMap: grad }, o || {}));
  const inkMat = new T.MeshBasicMaterial({ color: INK, side: T.BackSide });
  const outline = (mesh, s) => { const o = new T.Mesh(mesh.geometry, inkMat); o.scale.setScalar(s || 1.06); o.castShadow = false; mesh.add(o); return o; };
  // 沿平滑法線往外推一點，做成描邊用的外殼（凹口也一樣粗）
  const inflate = (geo, d) => { const p = geo.attributes.position, n = p.count, acc = new Map(), key = i => Math.round(p.getX(i) * 1e4) + ',' + Math.round(p.getY(i) * 1e4) + ',' + Math.round(p.getZ(i) * 1e4);
    const nr = geo.attributes.normal; for (let i = 0; i < n; i++) { const k = key(i), a = acc.get(k) || [0, 0, 0]; a[0] += nr.getX(i); a[1] += nr.getY(i); a[2] += nr.getZ(i); acc.set(k, a); }
    const g = geo.clone(), q = g.attributes.position; for (let i = 0; i < n; i++) { const a = acc.get(key(i)), L = Math.hypot(a[0], a[1], a[2]) || 1; q.setXYZ(i, p.getX(i) + a[0] / L * d, p.getY(i) + a[1] / L * d, p.getZ(i) + a[2] / L * d); } q.needsUpdate = true; return g; };
  // ---- 身體輪廓（x 往右、y 往上，0..1 正規化）----
  const P = [[0.50, 0.00], [0.86, 0.015], [0.965, 0.10], [0.985, 0.36], [0.975, 0.60], [0.935, 0.76], [0.86, 0.835], [0.77, 0.845], [0.70, 0.79], [0.635, 0.69],
    [0.575, 0.80], [0.515, 0.93], [0.425, 0.99], [0.335, 0.945], [0.27, 0.84], [0.215, 0.725], [0.165, 0.775], [0.09, 0.79], [0.03, 0.735], [0.008, 0.58], [0.012, 0.30], [0.04, 0.09], [0.14, 0.015]];
  const shape = new T.Shape(P.map(([x, y]) => new T.Vector2((x - 0.5) * W, y * H)).map((v, i, a) => v));
  // 用閉合的平滑曲線（CatmullRom）重畫，讓所有角都是圓的
  { const pts = P.map(([x, y]) => new T.Vector3((x - 0.5) * W, y * H, 0)), cur = new T.CatmullRomCurve3(pts, true, 'centripetal', 0.5), sp = cur.getSpacedPoints(160);
    shape.curves = []; shape.moveTo(sp[0].x, sp[0].y); for (let i = 1; i < sp.length; i++) shape.lineTo(sp[i].x, sp[i].y); }
  const bodyGeo = new T.ExtrudeGeometry(shape, { depth: DEPTH, bevelEnabled: true, bevelThickness: BT, bevelSize: BS, bevelSegments: 8, curveSegments: 4, steps: 1 });
  bodyGeo.translate(0, -H / 2, -DEPTH / 2); bodyGeo.computeVertexNormals();
  const root = new T.Group(), rig = new T.Group(); root.add(rig);
  const bodyPivot = new T.Group(); bodyPivot.position.y = LEG; rig.add(bodyPivot);
  const body = new T.Mesh(bodyGeo, toon(GREEN)); body.position.y = H / 2; body.castShadow = true; bodyPivot.add(body); body.add(new T.Mesh(inflate(bodyGeo, 0.022), inkMat));
  // ---- 臉（貼在正面的透明貼圖）----
  const faceTex = (() => {
    const S = 1024, cv = document.createElement('canvas'); cv.width = cv.height = S; const g = cv.getContext('2d');
    const px = nx => nx * S, py = ny => (1 - ny) * S; // nx, ny 都是 0..1 正規化座標
    g.lineCap = 'round'; g.lineJoin = 'round';
    // 腮紅（粉色漸層＋小點）
    for (const [cx, cy] of [[0.335, 0.255], [0.665, 0.272]]) { const rg = g.createRadialGradient(px(cx), py(cy), 4, px(cx), py(cy), 90); rg.addColorStop(0, 'rgba(232,150,150,0.55)'); rg.addColorStop(1, 'rgba(232,150,150,0)'); g.fillStyle = rg; g.beginPath(); g.ellipse(px(cx), py(cy), 105, 62, 0, 0, 7); g.fill();
      g.fillStyle = 'rgba(150,90,90,0.55)'; for (let k = 0; k < 14; k++) { const a = k * 2.4, r = 18 + (k * 37) % 55; g.beginPath(); g.arc(px(cx) + Math.cos(a) * r * 1.3, py(cy) + Math.sin(a) * r * 0.55, 3.2, 0, 7); g.fill(); } }
    // 眼睛：白眼球（黑框）＋大黑眼珠往右上＋兩顆反光點
    const eye = (cx, cy, rx, ry, rot) => { g.save(); g.translate(px(cx), py(cy)); g.rotate(rot);
      g.fillStyle = '#f4f3ef'; g.strokeStyle = '#1c1a18'; g.lineWidth = 11; g.beginPath(); g.ellipse(0, 0, rx, ry, 0, 0, 7); g.fill();
      g.save(); g.beginPath(); g.ellipse(0, 0, rx, ry, 0, 0, 7); g.clip(); g.fillStyle = '#16120f'; g.beginPath(); g.ellipse(rx * 0.14, -ry * 0.12, rx * 0.9, ry * 0.9, 0, 0, 7); g.fill(); g.restore();
      g.beginPath(); g.ellipse(0, 0, rx, ry, 0, 0, 7); g.stroke();
      g.fillStyle = '#ffffff'; g.beginPath(); g.arc(-rx * 0.08, ry * 0.12, rx * 0.13, 0, 7); g.fill(); g.beginPath(); g.arc(rx * 0.22, ry * 0.30, rx * 0.075, 0, 7); g.fill(); g.restore(); };
    eye(0.383, 0.43, 90, 158, -0.13); eye(0.573, 0.446, 99, 157, -0.08);
    g.strokeStyle = '#1c1a18'; g.lineWidth = 8;
    // 眉毛
    for (const [cx, cy] of [[0.372, 0.625], [0.553, 0.634]]) { g.beginPath(); g.arc(px(cx), py(cy) + 26, 32, Math.PI * 1.15, Math.PI * 1.85); g.stroke(); }
    // 鼻子（小捲）
    g.lineWidth = 7; g.beginPath(); g.moveTo(px(0.476), py(0.312)); g.bezierCurveTo(px(0.518), py(0.33), px(0.528), py(0.282), px(0.488), py(0.278)); g.stroke();
    // 微笑
    g.lineWidth = 8; g.beginPath(); g.moveTo(px(0.455), py(0.245)); g.quadraticCurveTo(px(0.497), py(0.19), px(0.538), py(0.245)); g.stroke();
    g.lineWidth = 6; g.beginPath(); g.moveTo(px(0.447), py(0.252)); g.lineTo(px(0.462), py(0.24)); g.stroke(); g.beginPath(); g.moveTo(px(0.546), py(0.252)); g.lineTo(px(0.531), py(0.24)); g.stroke();
    // 眼旁小弧線
    g.lineWidth = 6; for (const [cx, cy, s] of [[0.29, 0.31, -1], [0.69, 0.35, 1]]) for (let k = 0; k < 3; k++) { g.beginPath(); g.arc(px(cx) - s * k * 16, py(cy) + k * 4, 36 - k * 6, s > 0 ? -0.55 : Math.PI - 0.55 + 0.0, s > 0 ? 0.55 : Math.PI + 0.55); g.stroke(); }
    // 右上反光
    g.strokeStyle = 'rgba(255,255,255,0.9)'; g.lineWidth = 12; g.beginPath(); g.moveTo(px(0.89), py(0.665)); g.quadraticCurveTo(px(0.91), py(0.60), px(0.906), py(0.535)); g.stroke(); g.fillStyle = 'rgba(255,255,255,0.9)'; g.beginPath(); g.arc(px(0.922), py(0.497), 7, 0, 7); g.fill();
    const t = new T.CanvasTexture(cv); t.colorSpace = T.SRGBColorSpace; t.anisotropy = 8; return t;
  })();
  const face = new T.Mesh(new T.PlaneGeometry(W, H), new T.MeshBasicMaterial({ map: faceTex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }));
  face.position.set(0, H / 2, DEPTH / 2 + BT + 0.004); face.renderOrder = 3; bodyPivot.add(face);
  // ---- 手臂（細長、扁扁的，從身體兩側伸出）----
  const armGeo = new T.CapsuleGeometry(0.035, 0.36, 4, 10); armGeo.translate(0, -0.21, 0); armGeo.scale(1, 1, 0.75);
  const arms = [-1, 1].map(s => { const pv = new T.Group(); pv.position.set(s * (W / 2 + BS * 0.6), H * 0.42, 0); const m = new T.Mesh(armGeo, toon(GREEN)); m.castShadow = true; outline(m, 1.0).scale.set(1.5, 1.04, 1.5); pv.add(m); pv.rotation.z = s * 0.55; bodyPivot.add(pv); return pv; });
  // ---- 腳：細腳、白襪（兩條藍線）、藍色球鞋（白條紋）----
  const legs = [-1, 1].map(s => {
    const hip = new T.Group(); hip.position.set(s * 0.16, LEG + 0.02, 0); rig.add(hip);
    const leg = new T.Mesh(new T.CylinderGeometry(0.04, 0.04, LEG - 0.06, 10), toon(0xf4f1ea)); leg.position.y = -(LEG - 0.06) / 2; leg.castShadow = true; outline(leg, 1.0).scale.set(1.45, 1.02, 1.45); hip.add(leg);
    for (const y of [-0.15, -0.18]) { const b = new T.Mesh(new T.CylinderGeometry(0.043, 0.043, 0.014, 10), toon(0x3a6fa8)); b.position.y = y; hip.add(b); }
    const shoe = new T.Mesh(new T.CapsuleGeometry(0.07, 0.12, 4, 10), toon(SHOE)); shoe.rotation.x = Math.PI / 2; shoe.scale.set(1, 1, 0.8); shoe.position.set(0, -(LEG - 0.02) + 0.035, 0.05); shoe.castShadow = true; outline(shoe, 1.0).scale.set(1.12, 1.08, 1.12); hip.add(shoe);
    for (const z of [0.02, 0.07]) { const st = new T.Mesh(new T.BoxGeometry(0.145, 0.012, 0.02), toon(0xffffff)); st.position.set(0, -(LEG - 0.02) + 0.06, 0.05 + z - 0.04); hip.add(st); }
    return hip; });
  rig.traverse(o => { if (o.isMesh) o.frustumCulled = false; });
  // ---- 動作：走路的進度跟走過的距離綁在一起（腳不會滑）----
  const STRIDE = 0.62;   // 一步（左右各一次）約 0.62 m
  const update = (walkW, dist, t) => {
    const ph = dist / STRIDE * Math.PI, w = walkW, sw = Math.sin(ph);
    legs[0].rotation.x = 0.55 * sw * w; legs[1].rotation.x = -0.55 * sw * w;
    arms[0].rotation.x = -0.5 * sw * w; arms[1].rotation.x = 0.5 * sw * w;
    const bob = Math.abs(Math.cos(ph)) * 0.035 * w, breathe = (1 - w) * Math.sin(t * 2.2) * 0.012;
    bodyPivot.position.y = LEG + bob; bodyPivot.rotation.z = 0.045 * sw * w; bodyPivot.rotation.x = 0.06 * w;
    bodyPivot.scale.set(1 - breathe * 0.5, 1 + breathe, 1);
    for (const [i, a] of arms.entries()) a.rotation.z = (i ? 1 : -1) * (0.55 + 0.06 * Math.sin(t * 2.2) * (1 - w));
  };
  update(0, 0, 0);
  return { root, update, height: LEG + H, faceH: LEG + H * 0.45 };
};
