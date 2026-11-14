// ===== 必修2 第四版：分段算圖（每段各自的時間軸），段落之間由 ffmpeg 淡入淡出 =====
const R = new THREE.WebGLRenderer({antialias: true, preserveDrawingBuffer: true});
R.setSize(1920, 1080); R.setPixelRatio(1); R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFSoftShadowMap;
R.outputColorSpace = THREE.SRGBColorSpace; R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 1.12;
document.getElementById('gl').appendChild(R.domElement);
const DEFS = `<defs><filter id="tsh" x="-20%" y="-40%" width="140%" height="180%"><feGaussianBlur stdDeviation="6"/></filter>
<filter id="soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="10"/></filter>
<radialGradient id="vig" cx="50%" cy="48%" r="75%"><stop offset="55%" stop-color="#1E0F06" stop-opacity="0"/><stop offset="100%" stop-color="#1E0F06" stop-opacity=".42"/></radialGradient>
<linearGradient id="band" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#140A05" stop-opacity="0"/><stop offset=".45" stop-color="#140A05" stop-opacity=".6"/><stop offset="1" stop-color="#140A05" stop-opacity=".82"/></linearGradient></defs>`;
const SCN = {}; const ph = document.getElementById('ph'), gl = document.getElementById('gl'), sv = document.getElementById('sv');
const SUBS = {}; for (const s of TL.secs) { const A = []; s.lines.forEach(l => l.clauses.forEach(c => A.push([c.s, c.e + .15, c.text]))); for (let i = 0; i < A.length - 1; i++) if (A[i+1][0] - A[i][1] < .7) A[i][1] = A[i+1][0]; SUBS[s.id] = A; }
async function init() {
  await Promise.all([document.fonts.load('100px huninn'), document.fonts.load('30px "Noto Sans CJK TC"'), document.fonts.load('bold 30px "Noto Sans CJK TC"')]);
  await Promise.all(['assets/gate_sv.jpg', 'assets/dorm_m.jpg', 'assets/dorm_f.jpg'].map(src => new Promise(r => { const i = new Image(); i.onload = i.onerror = r; i.src = src; })));
  initMats();
  const only = new URLSearchParams(location.search).get('sec');
  if (!only || only === 'room1') SCN.room1 = buildRoom2('room1');
  if (!only || only === 'room2') SCN.room2 = buildRoom2('room2');
  if (!only || only === 'aer') SCN.aer = buildAer();
  if (!only || only === 'table') SCN.table = buildTable();
  if (!only || only === 'walk') SCN.walk = buildWalk();
  if (!only || only === 'map') SCN.map = await buildMap2();
  for (const k in SCN) { const S = SCN[k]; if (S.scene) { S.update(.5); R.compile(S.scene, S.cam); } }
  window.ready = true;
}
async function render(id, t) {
  const S = SCN[id], sec = SEC[id];
  if (S.bg) { const src = S.bg(t); if (ph.dataset.src !== src) { ph.src = src; ph.dataset.src = src; await ph.decode(); } ph.style.display = 'block'; } else ph.style.display = 'none';
  S.update(t); if (S.noGL) gl.style.visibility = 'hidden'; else { gl.style.visibility = 'visible'; R.render(S.scene, S.cam); }
  let s = DEFS + (S.flat ? '' : `<rect width="1920" height="1080" fill="url(#vig)"/>`) + S.overlay(t);
  s += `<rect x="0" y="880" width="1920" height="200" fill="url(#band)"/>`;
  const sub = SUBS[id].find(([a, b]) => t >= a && t < b);
  if (sub) s += `<text x="960" y="1030" text-anchor="middle" font-family="huninn" font-size="54" fill="#FFF8EE" stroke="#2A160B" stroke-width="7" paint-order="stroke" stroke-linejoin="round">${sub[2]}</text>`;
  let num = ''; sec.lines.forEach(l => { if (t >= l.start - .3) num = l.id; });
  if (num) s += `<text x="36" y="54" text-anchor="start" font-family="huninn" font-size="28" fill="#FFF1DF" opacity=".75" stroke="#3A2214" stroke-width="4" paint-order="stroke">${num}</text>`;
  let k = 0; if (id === 'room1') k = 1 - fade(t, 0, .5); if (id === 'room2') k = fade(t, sec.dur - 1.1, 1.0);
  if (k > 0) s += `<rect width="1920" height="1080" fill="#1A0D06" opacity="${clamp(k, 0, 1)}"/>`;
  sv.innerHTML = s;
}
window.render = render;
init().catch(e => { console.log('INIT ERR', e.message, e.stack); });
