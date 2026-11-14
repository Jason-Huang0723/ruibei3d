// ===== 山友吉祥物：瑞北建模版（ruibei3d src/06a_mascot.js 移植，加表情與動作） =====
const RBM = (() => {
  const T = THREE, W = 1.0, H = 0.9, LEG = 0.36, DEPTH = 0.13, BT = 0.12, BS = 0.045, INK = 0x1c1a18, SHOE = 0x3c90a9;
  const grad = (() => { const d = new Uint8Array([90, 90, 90, 255, 175, 175, 175, 255, 255, 255, 255, 255]); const t = new T.DataTexture(d, 3, 1, T.RGBAFormat); t.minFilter = t.magFilter = T.NearestFilter; t.needsUpdate = true; return t; })();
  const toon = (c, o) => new T.MeshToonMaterial(Object.assign({color: c, gradientMap: grad}, o || {}));
  const inkMat = new T.MeshBasicMaterial({color: INK, side: T.BackSide});
  const outline = (mesh, s) => { const o = new T.Mesh(mesh.geometry, inkMat); o.scale.setScalar(s || 1.06); mesh.add(o); return o; };
  const inflate = (geo, d) => { const p = geo.attributes.position, n = p.count, acc = new Map(), key = i => Math.round(p.getX(i)*1e4) + ',' + Math.round(p.getY(i)*1e4) + ',' + Math.round(p.getZ(i)*1e4);
    const nr = geo.attributes.normal; for (let i = 0; i < n; i++) { const k = key(i), a = acc.get(k) || [0, 0, 0]; a[0] += nr.getX(i); a[1] += nr.getY(i); a[2] += nr.getZ(i); acc.set(k, a); }
    const g = geo.clone(), q = g.attributes.position; for (let i = 0; i < n; i++) { const a = acc.get(key(i)), L = Math.hypot(a[0], a[1], a[2]) || 1; q.setXYZ(i, p.getX(i) + a[0]/L*d, p.getY(i) + a[1]/L*d, p.getZ(i) + a[2]/L*d); } q.needsUpdate = true; return g; };
  const P = [[0.50, 0.00], [0.86, 0.015], [0.965, 0.10], [0.985, 0.36], [0.975, 0.60], [0.935, 0.76], [0.86, 0.835], [0.77, 0.845], [0.70, 0.79], [0.635, 0.69],
    [0.575, 0.80], [0.515, 0.93], [0.425, 0.99], [0.335, 0.945], [0.27, 0.84], [0.215, 0.725], [0.165, 0.775], [0.09, 0.79], [0.03, 0.735], [0.008, 0.58], [0.012, 0.30], [0.04, 0.09], [0.14, 0.015]];
  const shape = new T.Shape();
  { const pts = P.map(([x, y]) => new T.Vector3((x - 0.5)*W, y*H, 0)), cur = new T.CatmullRomCurve3(pts, true, 'centripetal', 0.5), sp = cur.getSpacedPoints(160);
    shape.moveTo(sp[0].x, sp[0].y); for (let i = 1; i < sp.length; i++) shape.lineTo(sp[i].x, sp[i].y); }
  const bodyGeo = new T.ExtrudeGeometry(shape, {depth: DEPTH, bevelEnabled: true, bevelThickness: BT, bevelSize: BS, bevelSegments: 8, curveSegments: 4, steps: 1});
  bodyGeo.translate(0, -H/2, -DEPTH/2); bodyGeo.computeVertexNormals();
  const bodyInk = inflate(bodyGeo, 0.022);
  const armGeo = new T.CapsuleGeometry(0.035, 0.36, 4, 10); armGeo.translate(0, -0.21, 0); armGeo.scale(1, 1, 0.75);
  const legGeo = new T.CylinderGeometry(0.04, 0.04, LEG - 0.06, 10), bandGeo = new T.CylinderGeometry(0.043, 0.043, 0.014, 10), shoeGeo = new T.CapsuleGeometry(0.07, 0.12, 4, 10), stripeGeo = new T.BoxGeometry(0.145, 0.012, 0.02);
  const FACE = {};
  function faceTex(o) {
    const S = 1024, cv = document.createElement('canvas'); cv.width = cv.height = S; const g = cv.getContext('2d');
    const px = nx => nx*S, py = ny => (1 - ny)*S; g.lineCap = 'round'; g.lineJoin = 'round';
    for (const [cx, cy] of [[0.335, 0.255], [0.665, 0.272]]) { const col = o.cold ? '120,160,215' : '232,150,150'; const rg = g.createRadialGradient(px(cx), py(cy), 4, px(cx), py(cy), 90); rg.addColorStop(0, `rgba(${col},0.55)`); rg.addColorStop(1, `rgba(${col},0)`); g.fillStyle = rg; g.beginPath(); g.ellipse(px(cx), py(cy), 105, 62, 0, 0, 7); g.fill();
      if (!o.cold) { g.fillStyle = 'rgba(150,90,90,0.55)'; for (let k = 0; k < 14; k++) { const a = k*2.4, r = 18 + (k*37) % 55; g.beginPath(); g.arc(px(cx) + Math.cos(a)*r*1.3, py(cy) + Math.sin(a)*r*0.55, 3.2, 0, 7); g.fill(); } } }
    const pu = o.pupil || [0.14, -0.12];
    const eye = (cx, cy, rx, ry, rot) => { g.save(); g.translate(px(cx), py(cy)); g.rotate(rot);
      if (o.closed) { g.strokeStyle = '#1c1a18'; g.lineWidth = 14; g.beginPath(); g.arc(0, ry*0.15, rx*0.75, Math.PI*1.1, Math.PI*1.9); g.stroke(); g.restore(); return; }
      g.fillStyle = '#f4f3ef'; g.strokeStyle = '#1c1a18'; g.lineWidth = 11; g.beginPath(); g.ellipse(0, 0, rx, ry, 0, 0, 7); g.fill();
      g.save(); g.beginPath(); g.ellipse(0, 0, rx, ry, 0, 0, 7); g.clip(); g.fillStyle = '#16120f'; g.beginPath(); g.ellipse(rx*pu[0], ry*pu[1], rx*0.9, ry*0.9, 0, 0, 7); g.fill(); g.restore();
      g.beginPath(); g.ellipse(0, 0, rx, ry, 0, 0, 7); g.stroke();
      g.fillStyle = '#ffffff'; g.beginPath(); g.arc(-rx*0.08 + rx*(pu[0] - 0.14), ry*0.12 + ry*(pu[1] + 0.12), rx*0.13, 0, 7); g.fill(); g.beginPath(); g.arc(rx*0.22 + rx*(pu[0] - 0.14), ry*0.30 + ry*(pu[1] + 0.12), rx*0.075, 0, 7); g.fill(); g.restore(); };
    eye(0.383, 0.43, 90, 158, -0.13); eye(0.573, 0.446, 99, 157, -0.08);
    if (o.glasses) { g.strokeStyle = '#6B3F22'; g.lineWidth = 14; for (const [cx, cy] of [[0.383, 0.43], [0.573, 0.446]]) { g.beginPath(); g.ellipse(px(cx), py(cy), 120, 175, 0, 0, 7); g.stroke(); } g.beginPath(); g.moveTo(px(0.383) + 118, py(0.47)); g.quadraticCurveTo(px(0.478), py(0.5), px(0.573) - 120, py(0.48)); g.stroke(); }
    g.strokeStyle = '#1c1a18'; g.lineWidth = 8;
    if (o.worried) { for (const [cx, cy, s] of [[0.372, 0.625, 1], [0.553, 0.634, -1]]) { g.beginPath(); g.moveTo(px(cx) - 30, py(cy) + (s > 0 ? -6 : 10)); g.lineTo(px(cx) + 30, py(cy) + (s > 0 ? 10 : -6)); g.stroke(); } }
    else for (const [cx, cy] of [[0.372, 0.625], [0.553, 0.634]]) { g.beginPath(); g.arc(px(cx), py(cy) + 26, 32, Math.PI*1.15, Math.PI*1.85); g.stroke(); }
    g.lineWidth = 7; g.beginPath(); g.moveTo(px(0.476), py(0.312)); g.bezierCurveTo(px(0.518), py(0.33), px(0.528), py(0.282), px(0.488), py(0.278)); g.stroke();
    const m = o.mouth || 'smile';
    if (m === 'smile') { g.lineWidth = 8; g.beginPath(); g.moveTo(px(0.455), py(0.245)); g.quadraticCurveTo(px(0.497), py(0.19), px(0.538), py(0.245)); g.stroke();
      g.lineWidth = 6; g.beginPath(); g.moveTo(px(0.447), py(0.252)); g.lineTo(px(0.462), py(0.24)); g.stroke(); g.beginPath(); g.moveTo(px(0.546), py(0.252)); g.lineTo(px(0.531), py(0.24)); g.stroke(); }
    else if (m === 'open') { g.fillStyle = '#7A2E2A'; g.beginPath(); g.moveTo(px(0.45), py(0.25)); g.quadraticCurveTo(px(0.497), py(0.15), px(0.545), py(0.25)); g.closePath(); g.fill(); g.lineWidth = 7; g.stroke(); g.fillStyle = '#E98A8A'; g.beginPath(); g.ellipse(px(0.497), py(0.2), 22, 10, 0, 0, 7); g.fill(); }
    else if (m === 'oh') { g.fillStyle = '#5A2A26'; g.beginPath(); g.ellipse(px(0.497), py(0.225), 26, 32, 0, 0, 7); g.fill(); g.lineWidth = 7; g.stroke(); }
    else if (m === 'cold') { g.lineWidth = 7; g.beginPath(); g.moveTo(px(0.44), py(0.23)); [[0.462, 0.25], [0.484, 0.23], [0.506, 0.25], [0.528, 0.23], [0.55, 0.25]].forEach(q => g.lineTo(px(q[0]), py(q[1]))); g.stroke(); }
    else if (m === 'flat') { g.lineWidth = 8; g.beginPath(); g.moveTo(px(0.465), py(0.235)); g.lineTo(px(0.53), py(0.235)); g.stroke(); }
    g.lineWidth = 6; for (const [cx, cy, s] of [[0.29, 0.31, -1], [0.69, 0.35, 1]]) for (let k = 0; k < 3; k++) { g.beginPath(); g.arc(px(cx) - s*k*16, py(cy) + k*4, 36 - k*6, s > 0 ? -0.55 : Math.PI - 0.55, s > 0 ? 0.55 : Math.PI + 0.55); g.stroke(); }
    if (o.cold) { g.strokeStyle = 'rgba(70,110,170,.8)'; g.lineWidth = 6; for (const x of [0.3, 0.33, 0.66, 0.69]) { g.beginPath(); g.moveTo(px(x), py(0.3)); g.lineTo(px(x), py(0.25)); g.stroke(); } }
    g.strokeStyle = 'rgba(255,255,255,0.9)'; g.lineWidth = 12; g.beginPath(); g.moveTo(px(0.89), py(0.665)); g.quadraticCurveTo(px(0.91), py(0.60), px(0.906), py(0.535)); g.stroke(); g.fillStyle = 'rgba(255,255,255,0.9)'; g.beginPath(); g.arc(px(0.922), py(0.497), 7, 0, 7); g.fill();
    const t = new T.CanvasTexture(cv); t.colorSpace = T.SRGBColorSpace; t.anisotropy = 8; return t;
  }
  const FACEDEF = {n: {}, down: {pupil: [0.02, 0.2]}, left: {pupil: [-0.2, -0.05]}, right: {pupil: [0.22, -0.02]}, front: {pupil: [0.05, 0]}, closed: {closed: true},
    happy: {closed: true, mouth: 'open'}, oh: {pupil: [0.05, -0.05], mouth: 'oh'}, cold: {pupil: [0.05, 0.05], mouth: 'cold', cold: true, worried: true}, worried: {pupil: [0.05, 0.1], worried: true, mouth: 'flat'},
    shh: {pupil: [0.05, 0], mouth: 'flat'}, open: {mouth: 'open'}, downopen: {pupil: [0.02, 0.2], mouth: 'open'}, leftoh: {pupil: [-0.2, -0.05], mouth: 'oh'}};
  function face(key, glasses) { const k = key + (glasses ? '_g' : ''); if (!FACE[k]) FACE[k] = faceTex(Object.assign({glasses}, FACEDEF[key] || {})); return FACE[k]; }
  const GREEN = 0x84b194;
  function make(opt = {}) {
    const col = opt.color || GREEN;
    const root = new T.Group(), rig = new T.Group(); root.add(rig); rig.scale.setScalar(opt.scale || 0.92);
    const bodyPivot = new T.Group(); bodyPivot.position.y = LEG; rig.add(bodyPivot);
    const bodyMat = toon(col), armMat = toon(col);
    const body = new T.Mesh(bodyGeo, bodyMat); body.position.y = H/2; body.castShadow = true; bodyPivot.add(body); body.add(new T.Mesh(bodyInk, inkMat));
    const fm = new T.MeshBasicMaterial({map: face('n', opt.glasses), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2});
    const fc = new T.Mesh(new T.PlaneGeometry(W, H), fm); fc.position.set(0, H/2, DEPTH/2 + BT + 0.004); fc.renderOrder = 3; bodyPivot.add(fc);
    const arms = [], hands = [];
    for (const s of [-1, 1]) { const pv = new T.Group(); pv.position.set(s*(W/2 + BS*0.6), H*0.42, 0); const m = new T.Mesh(armGeo, armMat); m.castShadow = true; outline(m, 1.0).scale.set(1.5, 1.04, 1.5); pv.add(m); pv.rotation.z = s*0.55; bodyPivot.add(pv); arms.push(pv);
      const h = new T.Group(); h.position.set(0, -0.44, 0); pv.add(h); hands.push(h); }
    const legs = [-1, 1].map(s => { const hip = new T.Group(); hip.position.set(s*0.16, LEG + 0.02, 0); rig.add(hip);
      const leg = new T.Mesh(legGeo, toon(0xf4f1ea)); leg.position.y = -(LEG - 0.06)/2; leg.castShadow = true; outline(leg, 1.0).scale.set(1.45, 1.02, 1.45); hip.add(leg);
      for (const y of [-0.15, -0.18]) { const b = new T.Mesh(bandGeo, toon(0x3a6fa8)); b.position.y = y; hip.add(b); }
      const shoe = new T.Mesh(shoeGeo, toon(SHOE)); shoe.rotation.x = Math.PI/2; shoe.scale.set(1, 1, 0.8); shoe.position.set(0, -(LEG - 0.02) + 0.035, 0.05); shoe.castShadow = true; outline(shoe, 1.0).scale.set(1.12, 1.08, 1.12); hip.add(shoe);
      for (const z of [0.02, 0.07]) { const st = new T.Mesh(stripeGeo, toon(0xffffff)); st.position.set(0, -(LEG - 0.02) + 0.06, 0.05 + z - 0.04); hip.add(st); }
      return hip; });
    const acc = new T.Group(); bodyPivot.add(acc);
    const deco = (geo, c, ol = 1.08) => { const m = new T.Mesh(geo, toon(c)); m.castShadow = true; outline(m, ol); return m; };
    if (opt.bow) { const g = new T.Group(); g.position.set(-0.27, 0.86, 0.1); g.rotation.z = 0.5; acc.add(g);
      for (const s of [-1, 1]) { const b = deco(new T.SphereGeometry(1, 18, 12), 0xF58FAA); b.scale.set(0.085, 0.058, 0.05); b.position.x = s*0.075; b.rotation.z = s*0.35; g.add(b); }
      const k = deco(new T.SphereGeometry(0.034, 12, 8), 0xE06A8C); k.position.z = 0.02; g.add(k); }
    if (opt.cap) { const g = new T.Group(); g.position.set(-0.08, 0.82, 0); g.rotation.z = 0.08; acc.add(g);
      const c = deco(new T.SphereGeometry(0.2, 24, 12, 0, Math.PI*2, 0, Math.PI/2), 0x3E7CC0, 1.05); c.scale.set(1.15, 0.8, 1.2); g.add(c);
      const br = deco(new T.CylinderGeometry(0.17, 0.17, 0.022, 24, 1, false, -Math.PI/2, Math.PI), 0x3E7CC0, 1.05); br.position.set(0, 0.01, 0.2); br.scale.set(1, 1, 0.8); g.add(br); }
    if (opt.band) { const g = new T.Group(); g.position.set(-0.075, 0.74, 0); acc.add(g);
      const r = deco(new T.TorusGeometry(1, 0.17, 10, 40), 0xF07F35, 1.0); r.rotation.x = Math.PI/2; r.scale.set(0.235, 0.215, 0.2); g.add(r);
      const kn = deco(new T.SphereGeometry(0.045, 10, 8), 0xD8662A); kn.position.set(0.2, 0.02, -0.12); g.add(kn);
      for (const s of [-1, 1]) { const tl = deco(new T.ConeGeometry(0.03, 0.12, 8), 0xF07F35); tl.position.set(0.25, -0.02 + s*0.03, -0.14); tl.rotation.z = -1.2 + s*0.4; g.add(tl); } }
    if (opt.flower) { const g = new T.Group(); g.position.set(0.3, 0.8, 0.1); g.rotation.z = -0.4; acc.add(g);
      for (let i = 0; i < 6; i++) { const a = i/6*Math.PI*2; const p = deco(new T.SphereGeometry(1, 12, 8), 0xFFCF4F, 1.0); p.scale.set(0.05, 0.03, 0.022); p.position.set(Math.cos(a)*0.05, Math.sin(a)*0.05, 0); p.rotation.z = a; g.add(p); }
      const c = deco(new T.SphereGeometry(0.03, 12, 8), 0xE8873B); c.position.z = 0.015; g.add(c); }
    rig.traverse(o => { if (o.isMesh) o.frustumCulled = false; });
    root.userData = {rig, bodyPivot, body, bodyMat, armMat, face: fc, fm, arms, hands, legs, acc, glasses: !!opt.glasses, baseCol: col, LEG};
    return root;
  }
  return {make, face, LEG, H, W, toon, outline};
})();
const MINT_COLD = 0xA9C6DE;
function makeMascot(opt) { return RBM.make(opt); }
const armDeg = A => A <= -28 ? 0.55 + (A + 28)*Math.PI/180*0.6 : 0.55 + (A + 28)/98*1.85;
// pose: walk, ph, bob, lift, tilt, lean, sq, face, cold, blink, aL/aR {x,y,z} (z = outward), arm/armL (legacy deg), legs (sit 0..1), turn
function poseMascot(m, p = {}) {
  const d = m.userData, w = p.walk || 0, ph = p.ph || 0, sw = Math.sin(ph), t = p.t || 0;
  d.legs[0].rotation.x = 0.55*sw*w - (p.legs || 0)*1.35; d.legs[1].rotation.x = -0.55*sw*w - (p.legs || 0)*1.35;
  const bob = Math.abs(Math.cos(ph))*0.035*w, breathe = (1 - w)*Math.sin(t*2.2)*0.012;
  const bp = d.bodyPivot; bp.position.y = d.LEG + bob + (p.bob || 0) + (p.lift || 0); bp.rotation.z = 0.045*sw*w + (p.tilt || 0); bp.rotation.x = 0.06*w + (p.lean || 0); bp.rotation.y = p.turn || 0;
  const sq = p.sq || 0; bp.scale.set(1 - breathe*0.5 + sq*0.5, 1 + breathe - sq, 1 + sq*0.5);
  const arm = (i, a, legacy) => { const s = i ? 1 : -1, pv = d.arms[i], swing = (i ? 0.5 : -0.5)*sw*w;
    if (a) { pv.rotation.x = (a.x || 0) + swing; pv.rotation.y = a.y || 0; pv.rotation.z = s*(a.z == null ? 0.55 : a.z); }
    else { pv.rotation.x = swing; pv.rotation.y = 0; pv.rotation.z = s*(legacy == null ? 0.55 + 0.06*Math.sin(t*2.2)*(1 - w) : armDeg(legacy)); } };
  arm(0, p.aL, p.armL); arm(1, p.aR, p.arm);
  let fk = p.face || (p.cold ? 'cold' : 'n'); if (p.blink != null && p.blink < 0.5 && !['closed', 'happy', 'cold'].includes(fk)) fk = 'closed';
  const tex = RBM.face(fk, d.glasses); if (d.fm.map !== tex) { d.fm.map = tex; d.fm.needsUpdate = true; }
  const c = p.cold ? MINT_COLD : d.baseCol; d.bodyMat.color.setHex(c); d.armMat.color.setHex(c);
}
const blinkAt = (t, i = 0) => { const q = (t + i*1.37) % 3.6; return q < .12 ? .1 : 1; };
// phone held in front with both hands (attached to bodyPivot)
function holdPhone(m, ph) { m.userData.bodyPivot.add(ph); ph.position.set(0.02, 0.1, 0.5); ph.rotation.set(-0.85, Math.PI, 0); ph.scale.setScalar(1.6); }
const PHONE_ARMS = t => ({aL: {x: -1.0 + Math.sin(t*19)*0.06, z: -0.55}, aR: {x: -1.0 + Math.cos(t*23)*0.06, z: -0.55}});
