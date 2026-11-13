/* ================= 9. 場景 ================= */
RB.buildScene = async st => {
  const sc = new THREE.Scene(); RB.scene = sc;
  const az = 132 * Math.PI / 180, el = 38 * Math.PI / 180; RB.sunDir = new THREE.Vector3(Math.sin(az) * Math.cos(el), Math.sin(el), -Math.cos(az) * Math.cos(el));
  const sky = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16), new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, depthTest: false, fog: false, uniforms: { sunDir: { value: RB.sunDir.clone() } },
    vertexShader: 'varying vec3 vDir; void main(){ vDir = normalize(position); vec4 p = projectionMatrix*modelViewMatrix*vec4(position,1.0); gl_Position = p.xyww; }',
    fragmentShader: 'uniform vec3 sunDir; varying vec3 vDir; void main(){ float e = clamp(vDir.y,-0.2,1.0); vec3 c = mix(vec3(0.70,0.78,0.86), vec3(0.22,0.42,0.72), pow(max(e,0.0),0.55)); if(e<0.0) c = vec3(0.70,0.78,0.86)*0.95; float s = max(dot(normalize(vDir), normalize(sunDir)),0.0); c += vec3(1.0,0.92,0.75)*(pow(s,800.0)*6.0 + pow(s,12.0)*0.25); gl_FragColor = vec4(c,1.0); }' }));
  sky.frustumCulled = false; sky.renderOrder = -1; RB.sky = sky; sc.add(sky);
  sc.fog = new THREE.FogExp2(0xb8c6d2, 0.000062); RB.hemi = new THREE.HemisphereLight(0xbfd4ea, 0x8c8a7c, 0.95); sc.add(RB.hemi);
  const sun = new THREE.DirectionalLight(0xfff1dc, 3.1); sun.castShadow = true; sun.shadow.mapSize.set(RB.LOW ? 2048 : 4096, RB.LOW ? 2048 : 4096); sun.shadow.bias = -0.0003; sun.shadow.normalBias = 0.03; sc.add(sun, sun.target); RB.sun = sun;
  const O = RB.ORTHO, tR = RB.makeTex(O.region, 8), tV = RB.makeTex(O.village, 16), tC = RB.makeTex(O.core, 16); RB.tex = { tR, tV, tC };
  const R_ = RB.RECT, shrink = (r, m) => [r[0] + m, r[1] - m, r[2] + m, r[3] - m], dim = (r, s) => [Math.round((r[1] - r[0]) / s) + 1, Math.round((r[3] - r[2]) / s) + 1];
  st('建立地形', 0.82);
  // 校地內的地形壓平到校園地面以下，避免從地板、操場冒出來
  { let hs = 0, n = 0; for (let u = 0; u <= 126; u += 10) for (let v = 0; v <= 64; v += 8) { const [x, y] = RB.uv2xy(u, v); hs += RB.H(x, y); n++; } RB.GROUND = hs / n;
    const cx = RB.CAMPUS.reduce((s, p) => s + p[0], 0) / RB.CAMPUS.length, cy = RB.CAMPUS.reduce((s, p) => s + p[1], 0) / RB.CAMPUS.length; RB.FLAT = RB.CAMPUS.map(p => { const dx = p[0] - cx, dy = p[1] - cy, L = Math.hypot(dx, dy); return [p[0] + dx / L * 3, p[1] + dy / L * 3]; }); }
  for (const [rect, s, tex, hole, sink] of [[R_.region, 100, tR, shrink(R_.village, 250), 0.5], [R_.village, 10, tV, shrink(R_.core, 30), 0.12], [R_.core, 4, tC, null, 0]]) { const [nx, ny] = dim(rect, s); const m = new THREE.Mesh(RB.terrainMesh(rect, nx, ny, tex, hole, sink), new THREE.MeshStandardMaterial({ map: tex, roughness: 1 })); m.receiveShadow = true; sc.add(m); }
  st('建立房屋', 0.86); const C = RB.buildCommunity(), walls = new THREE.Mesh(C.walls, RB.facadeMaterial()); walls.castShadow = walls.receiveShadow = true; sc.add(walls);
  for (const [g, t] of [[C.roofCore, tC], [C.roofVillage, tV]]) { const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map: t, roughness: 0.9 })); m.castShadow = m.receiveShadow = true; sc.add(m); }
  st('種樹、鋪路', 0.9); RB.computeTrees(); for (const o of RB.buildTrees()) sc.add(o); for (const o of RB.buildRoads()) sc.add(o);
  st('建立學校（教室、樓梯、禮堂）', 0.93); sc.add(RB.buildSchool());
};
RB.setShadowFocus = (cx, cz, r) => { const s = RB.sun, d = RB.sunDir; s.target.position.set(cx, 0, cz); s.position.set(cx + d.x * 3000, d.y * 3000, cz + d.z * 3000); const c = s.shadow.camera; if (c.right !== r) { c.left = -r; c.right = r; c.top = r; c.bottom = -r; c.near = 100; c.far = 6000; c.updateProjectionMatrix(); } s.target.updateMatrixWorld(); };
// 店家招牌（掛在房屋面向道路的那一面）
RB.addShopSign = (text, f) => {
  const cv = new OffscreenCanvas(512, 128), g = cv.getContext('2d'); g.fillStyle = '#f4efe2'; g.fillRect(0, 0, 512, 128); g.strokeStyle = '#a3332b'; g.lineWidth = 10; g.strokeRect(5, 5, 502, 118); g.fillStyle = '#a3332b'; g.font = '700 78px ' + RB.FONT; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, 256, 68);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; const w = Math.min(4.2, f.len * 0.8);
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, w / 4, 0.12), [0, 1, 2, 3, 4, 5].map(i => new THREE.MeshStandardMaterial(i === 4 ? { map: t, roughness: 0.6 } : { color: 0x8e2a24, roughness: 0.7 })));
  const x = f.mid[0] + f.n[0] * 0.12, y = f.mid[1] + f.n[1] * 0.12; m.position.set(x, RB.H(x, y) + 2.9, -y); m.rotation.y = Math.atan2(f.n[0], -f.n[1]); m.castShadow = true; RB.scene.add(m); return m;
};

/* ================= 10. 互動介面 ================= */
const $ = id => document.getElementById(id);
const canvas = $('view'), ov = $('ov'), og = ov.getContext('2d'), ls = $('ls'), bar = document.querySelector('#prog i');
const st = (msg, f) => { ls.textContent = msg; if (f !== undefined) bar.style.width = Math.round(f * 100) + '%'; };
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true, logarithmicDepthBuffer: true, powerPreference: 'high-performance' });
const DPR = () => Math.min(devicePixelRatio, RB.LOW ? 1.5 : 2);
renderer.setPixelRatio(DPR()); renderer.setSize(innerWidth, innerHeight, false); renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; RB.renderer = renderer;
const cam = new THREE.PerspectiveCamera(52, innerWidth / innerHeight, 0.15, 80000); RB.cam = cam;
const controls = new OrbitControls(cam, canvas); controls.enableDamping = true; controls.dampingFactor = 0.08; controls.maxPolarAngle = Math.PI * 0.495; controls.minDistance = 2; controls.maxDistance = 3000; controls.enabled = false;
let showLabels = true, free = false, playing = false, playAll = false, exporting = false, cur = 0, last = performance.now();
function sizeOverlay() { const d = devicePixelRatio || 1; ov.width = Math.round(innerWidth * d); ov.height = Math.round(innerHeight * d); }
sizeOverlay();
addEventListener('resize', () => { if (exporting) return; renderer.setSize(innerWidth, innerHeight, false); cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix(); sizeOverlay(); });
const fmt = s => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
// 室內時把環境光調亮一點（真實的室內有日光燈）
RB.applyLight = () => { const k = RB.player.indoor || 0; RB.hemi.intensity = 0.95 + 1.05 * k; renderer.toneMappingExposure = 1 + 0.25 * k; };
RB.renderFrame = () => { const P = RB.player, e = P.ev; if (free) RB.setShadowFocus(controls.target.x, controls.target.z, Math.max(40, Math.min(1500, cam.position.distanceTo(controls.target) * 0.9)));
  else { const aerial = e && e.seg.type === 'aerial', d = Math.hypot(P.cam[0] - P.look[0], P.cam[1] - P.look[1], P.cam[2] - P.look[2]); if (aerial || d > 40) RB.setShadowFocus(P.look[0], P.look[2], Math.max(60, Math.min(1500, d * 0.9))); else RB.setShadowFocus(e.pos[0], e.pos[2], 32); }
  RB.sky.position.copy(cam.position); RB.sky.scale.setScalar(50000); RB.applyLight(); renderer.render(RB.scene, cam); };
function drawUIOverlay() { const W = ov.width, H = ov.height, d = devicePixelRatio || 1; og.clearRect(0, 0, W, H); if (!showLabels) return;
  if (free) { RB.drawFreeLabels(og, W, H, cam); return; }
  const barH = $('bar').getBoundingClientRect().height * d, headH = document.querySelector('header').getBoundingClientRect().height * d;
  RB.drawOverlay(og, W, H, cam, { fade: false, bottom: barH + 14 * d, top: headH, minS: 0.55 * d }); }
function setScene(i, autoplay) { cur = i; RB.resetScene(RB.SCENES[i]); free = false; controls.enabled = false; $('free').classList.remove('on');
  [...$('presets').children].forEach((c, k) => c.classList.toggle('on', k === i)); $('seek').max = RB.SCENES[i].dur.toFixed(2); playing = !!autoplay; updPlay(); }
function updPlay() { $('play').textContent = playing ? '❚❚ 暫停' : '▶ 播放'; }
function updTime() { const P = RB.player; $('seek').value = P.t.toFixed(2); $('time').textContent = fmt(P.t) + ' / ' + fmt(P.sc.dur); }
function frame(now) { requestAnimationFrame(frame); if (exporting) { last = now; return; } const dt = Math.min(0.05, (now - last) / 1000); last = now; const P = RB.player;
  if (!free && playing) { RB.step(dt); if (P.t >= P.sc.dur - 1e-6) { if (playAll && cur < RB.SCENES.length - 1) setScene(cur + 1, true); else { playing = false; playAll = false; updPlay(); } } }
  if (free) controls.update(); else RB.applyCamera(cam);
  RB.renderFrame(); drawUIOverlay(); if (!free) updTime(); }

/* ================= 11. 匯出影片（電腦版 Chrome/Edge） ================= */
// 讓出執行緒（用 MessageChannel，分頁在背景時也不會被計時器節流拖慢）
const yieldNow = () => new Promise(r => { const c = new MessageChannel(); c.port1.onmessage = () => r(); c.port2.postMessage(0); });
async function exportScenes(list, opt, msg) {
  if (typeof VideoEncoder === 'undefined') { msg('這個瀏覽器不支援匯出，請用電腦版 Chrome 或 Edge。'); return; }
  const { Muxer, ArrayBufferTarget } = await import('https://cdn.jsdelivr.net/npm/mp4-muxer@5/+esm');
  const W = 1920, H = 1080, fps = opt.fps || 30; let codec = 'avc1.640028', hwPref = 'prefer-hardware';
  // 優先用顯示卡硬體編碼（快很多），不支援再退回一般設定
  try { if (!(await VideoEncoder.isConfigSupported({ codec, width: W, height: H, bitrate: 14e6, framerate: fps, hardwareAcceleration: hwPref })).supported) { hwPref = 'no-preference'; if (!(await VideoEncoder.isConfigSupported({ codec, width: W, height: H, bitrate: 14e6, framerate: fps })).supported) codec = 'avc1.4d0028'; } } catch (e) { hwPref = 'no-preference'; codec = 'avc1.4d0028'; }
  exporting = true; playing = false; updPlay(); renderer.setPixelRatio(1); renderer.setSize(W, H, false); cam.aspect = W / H; cam.updateProjectionMatrix();
  const comp = new OffscreenCanvas(W, H), cg = comp.getContext('2d'); const files = [];
  try { for (const i of list) { const sc = (opt.scenes || RB.SCENES)[i], target = new ArrayBufferTarget(), mux = new Muxer({ target, video: { codec: 'avc', width: W, height: H, frameRate: fps }, fastStart: 'in-memory' }); let err = null;
      const enc = new VideoEncoder({ output: (c, m) => mux.addVideoChunk(c, m), error: e => err = e }); enc.configure({ codec, width: W, height: H, bitrate: fps > 30 ? 20e6 : 14e6, framerate: fps, hardwareAcceleration: hwPref });
      RB.resetScene(sc); const N = Math.round(sc.dur * fps) + 1;
      for (let f = 0; f < N; f++) { if (f > 0) RB.step(1 / fps); RB.applyCamera(cam); RB.renderFrame(); cg.drawImage(canvas, 0, 0, W, H); RB.drawOverlay(cg, W, H, cam, Object.assign({ labels: opt.labels, fade: true }, opt.ov || {}));
        const fr = new VideoFrame(comp, { timestamp: Math.round(f * 1e6 / fps), duration: Math.round(1e6 / fps) }); enc.encode(fr, { keyFrame: f % (fps * 2) === 0 }); fr.close(); if (err) throw err;
        while (enc.encodeQueueSize > 4) await yieldNow(); if (f % 15 === 0) { msg(sc.name + '：' + Math.round(f / N * 100) + '%（' + (list.indexOf(i) + 1) + '/' + list.length + '）'); RB.expProgress = { scene: i, f, N }; await yieldNow(); } }
      await enc.flush(); mux.finalize(); const name = opt.scenes ? sc.key + '.mp4' : '瑞北導覽_' + String(i).padStart(2, '0') + '_' + sc.name + (opt.labels ? '' : '_無字幕') + '.mp4';
      const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([target.buffer], { type: 'video/mp4' })); a.download = name; document.body.appendChild(a); a.click(); files.push(name); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 60000); }
    msg('完成，已下載 ' + files.length + ' 個影片。'); }
  catch (e) { msg('匯出失敗：' + e.message); console.error(e); }
  finally { exporting = false; renderer.setPixelRatio(DPR()); renderer.setSize(innerWidth, innerHeight, false); cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix(); setScene(cur, false); }
  return files;
}
RB.exportScenes = exportScenes;

/* ================= 12. 啟動 ================= */
(async () => {
  try {
    st('讀取地形', 0.05); await RB.buildHeights();
    st('讀取道路', 0.2); await RB.loadOSM();
    await RB.loadOrtho(st);
    st('描出房屋輪廓', 0.62); await RB.loadBuildings(st);
    await RB.buildScene(st);
    st('載入走路的小人', 0.96); RB.scene.add(await RB.loadCharacter());
    RB.makeTour(); if (RB.makeV2) RB.makeV2(); RB.addShopSign('林上商號', RB.SHOP); RB.addShopSign('東輪機車行', RB.shopFront([-97, 21], [-74, 21]));
    const pre = $('presets'), sel = $('expScene');
    RB.SCENES.forEach((s, i) => { const b = document.createElement('button'); b.className = 'chip'; b.textContent = s.name; b.onclick = () => { playAll = false; setScene(i, true); }; pre.appendChild(b);
      const o = document.createElement('option'); o.value = i; o.textContent = s.name + '（' + fmt(s.dur) + '）'; sel.appendChild(o); });
    const tot = RB.SCENES.reduce((s, x) => s + x.dur, 0); sel.firstElementChild.textContent = '全部（' + RB.SCENES.length + ' 段，共 ' + fmt(tot) + '）';
    $('play').onclick = () => { if (free) { free = false; controls.enabled = false; $('free').classList.remove('on'); } if (RB.player.t >= RB.player.sc.dur - 1e-6) RB.resetScene(RB.player.sc); playing = !playing; updPlay(); };
    $('all').onclick = () => { playAll = true; setScene(0, true); };
    $('seek').oninput = e => { playing = false; updPlay(); RB.seek(+e.target.value); };
    $('free').onclick = () => { free = !free; $('free').classList.toggle('on', free); if (free) { playing = false; updPlay(); const P = RB.player; controls.target.set(P.look[0], P.look[1], P.look[2]); controls.enabled = true; controls.update(); } else { controls.enabled = false; } };
    $('lbl').onclick = e => { showLabels = !showLabels; e.currentTarget.classList.toggle('on', showLabels); };
    const exp = $('exp'), msg = s => $('expMsg').textContent = s;
    $('expBtn').onclick = () => { exp.style.display = exp.style.display === 'block' ? 'none' : 'block'; };
    $('expClose').onclick = () => exp.style.display = 'none';
    $('expGo').onclick = () => { if (exporting) return; const v = sel.value; exportScenes(v === 'all' ? RB.SCENES.map((_, i) => i) : [+v], { labels: $('expLbl').checked, fps: +$('expFps').value }, msg); };
    setScene(0, false);
    $('loading').remove(); requestAnimationFrame(frame);
  } catch (e) { st('載入失敗：' + e.message + '（請確認網路，或重新整理）'); console.error(e); }
})();
