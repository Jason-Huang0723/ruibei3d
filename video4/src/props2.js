// ===== v4 additional props =====
function phone2(caseCol = 0x2A2523) { const g = new THREE.Group(); const b = rbox(.095, .17, .016, .014, clay(caseCol, .45)); g.add(b);
  const s = new THREE.Mesh(new THREE.PlaneGeometry(.08, .145), new THREE.MeshStandardMaterial({color: 0xFFE7C4, emissive: 0xFFD7A0, emissiveIntensity: .7})); s.position.z = .0095; g.add(s); return g; }
// handheld shower: origin at grip; head at +Y; nozzle child: spray along its local -Y
function showerHand() { const g = new THREE.Group();
  const h = mesh(new THREE.CylinderGeometry(.022, .026, .24, 12), M.chrome); h.position.y = .1; g.add(h);
  const head = new THREE.Group(); head.position.y = .23; head.rotation.x = .9; g.add(head);
  const hd = mesh(new THREE.CylinderGeometry(.075, .05, .05, 24), M.chrome); head.add(hd);
  const hf = new THREE.Mesh(new THREE.CircleGeometry(.07, 24), new THREE.MeshStandardMaterial({color: 0xDDE3E8, roughness: .3})); hf.rotation.x = Math.PI/2; hf.position.y = -.026; head.add(hf);
  const nz = new THREE.Object3D(); nz.position.y = -.03; head.add(nz); g.userData.nozzle = nz; return g; }
function trashCan() { const g = new THREE.Group(); const c = mesh(new THREE.CylinderGeometry(.13, .11, .3, 20, 1, true), clay(0x8FB8C9, .6)); c.position.y = .15; c.material.side = THREE.DoubleSide; g.add(c);
  const b = mesh(new THREE.CircleGeometry(.11, 20), clay(0x7AA3B5, .6)); b.rotation.x = -Math.PI/2; b.position.y = .005; g.add(b);
  const r = mesh(new THREE.TorusGeometry(.13, .012, 6, 24), clay(0x7AA3B5, .6)); r.rotation.x = Math.PI/2; r.position.y = .3; g.add(r); return g; }
function stool() { const g = new THREE.Group(); const top = mesh(new THREE.CylinderGeometry(.2, .2, .05, 24), clay(0x7FC4E0, .5)); top.position.y = .28; g.add(top);
  for (let i = 0; i < 4; i++) { const a = i*Math.PI/2 + .78; const l = mesh(new THREE.CylinderGeometry(.025, .03, .27, 8), clay(0x6AB0CD, .5)); l.position.set(Math.cos(a)*.13, .135, Math.sin(a)*.13); g.add(l); } return g; }
function towelFold(col = 0xFFF3DC) { const g = new THREE.Group(); const t = rbox(.22, .07, .16, .03, clay(col, .95)); g.add(t); const s = rbox(.221, .015, .16, .005, clay(0xE8964B, .9)); s.position.y = .015; g.add(s); return g; }
function bottle(col, h = .2) { const g = new THREE.Group(); const b = rbox(.08, h, .08, .025, clay(col, .45)); b.position.y = h/2; g.add(b); const c = mesh(new THREE.CylinderGeometry(.022, .022, .04, 10), M.white); c.position.y = h + .02; g.add(c); return g; }
function basketEmpty() { const g = new THREE.Group(); const b = rbox(.36, .16, .24, .05, clay(0xD39A5E, .85)); b.position.y = .08; g.add(b);
  const hd = mesh(new THREE.TorusGeometry(.15, .015, 8, 24, Math.PI), clay(0xB07A44, .85)); hd.position.y = .16; g.add(hd); return g; }
// generic wall clock with a wedge (progress 0..1 of `span` minutes) and spinning hands
function makeClock(r = .26, wedgeCol = 0xF2A65A) {
  const clk = new THREE.Group();
  const rim = mesh(new THREE.CylinderGeometry(r + .04, r + .04, .06, 40), M.woodDark); rim.rotation.x = Math.PI/2; clk.add(rim);
  const face = new THREE.Mesh(new THREE.CircleGeometry(r, 48), new THREE.MeshStandardMaterial({map: cvs(256, 256, (g, W, H) => { g.fillStyle = '#FFF8EA'; g.fillRect(0, 0, W, H); g.strokeStyle = '#4A3020'; g.lineCap = 'round'; for (let i = 0; i < 12; i++) { const a = i/12*Math.PI*2; g.lineWidth = i % 3 ? 4 : 9; g.beginPath(); g.moveTo(W/2 + Math.sin(a)*100, H/2 - Math.cos(a)*100); g.lineTo(W/2 + Math.sin(a)*118, H/2 - Math.cos(a)*118); g.stroke(); } }), roughness: .6})); face.position.z = .032; clk.add(face);
  const wm = new THREE.MeshBasicMaterial({color: wedgeCol, transparent: true, opacity: .8}); let wedge = null, wk = -1;
  const mh = mesh(new THREE.BoxGeometry(.018, r*.78, .01), M.dark, false); mh.geometry.translate(0, r*.36, 0); mh.position.z = .04; clk.add(mh);
  const hh = mesh(new THREE.BoxGeometry(.026, r*.5, .01), M.dark, false); hh.geometry.translate(0, r*.21, 0); hh.position.z = .045; clk.add(hh);
  const pin = mesh(new THREE.CylinderGeometry(.02, .02, .02, 12), M.dark, false); pin.rotation.x = Math.PI/2; pin.position.z = .05; clk.add(pin);
  // set(startMin, k, spanMin): minute hand from startMin, wedge covering k*span minutes
  clk.userData.set = (startMin, k, span) => { const L = Math.max(.001, k*span/60*Math.PI*2);
    if (Math.abs(k - wk) > .003) { wk = k; if (wedge) { clk.remove(wedge); wedge.geometry.dispose(); } const a0 = Math.PI/2 - startMin/60*Math.PI*2; wedge = new THREE.Mesh(new THREE.CircleGeometry(r*.88, 40, a0 - L, L), wm); wedge.position.z = .034; clk.add(wedge); }
    const m = startMin + k*span; mh.rotation.z = -m/60*Math.PI*2; hh.rotation.z = -((4 + m/60)/12)*Math.PI*2; };
  clk.userData.set(0, 0, 0); return clk; }
// rope/hose tube between two world points with sag
function hoseUpdate(hose, a, b, sag = .25) { const mid = a.clone().lerp(b, .5); mid.y -= sag; const cur = new THREE.CatmullRomCurve3([a, a.clone().lerp(mid, .5).add(new THREE.Vector3(0, -sag*.4, .05)), mid, mid.clone().lerp(b, .5), b]);
  const g = new THREE.TubeGeometry(cur, 30, .014, 6); hose.geometry.dispose(); hose.geometry = g; }
