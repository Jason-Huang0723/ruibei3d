// ---------- timing ----------
const LN = Object.fromEntries(TL.lines.map(l => [l.id, l]));
const S_ = id => LN[id].start, E_ = id => LN[id].start + LN[id].dur, CL = (id, k) => LN[id].clauses[k].s;
const END = TL.END; window.END = END;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, u) => a + (b - a)*u;
const ease = u => u < .5 ? 4*u*u*u : 1 - Math.pow(-2*u + 2, 3)/2;
const easeOut = u => 1 - Math.pow(1 - u, 3);
const easeIn = u => u*u*u;
const back = u => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3*Math.pow(u - 1, 3) + c1*Math.pow(u - 1, 2); };
function kf(t, keys, fn = ease) { if (t <= keys[0][0]) return keys[0][1]; for (let i = 1; i < keys.length; i++) if (t <= keys[i][0]) { const [t0, v0] = keys[i-1], [t1, v1] = keys[i]; return v0 + (v1 - v0)*fn((t - t0)/(t1 - t0)); } return keys[keys.length-1][1]; }
// vector keyframes [[t,[x,y,z]],...]
function kv(t, keys, fn = ease) { if (t <= keys[0][0]) return keys[0][1]; for (let i = 1; i < keys.length; i++) if (t <= keys[i][0]) { const [t0, v0] = keys[i-1], [t1, v1] = keys[i]; const u = fn((t - t0)/(t1 - t0)); return v0.map((a, j) => a + (v1[j] - a)*u); } return keys[keys.length-1][1]; }
const fade = (t, t0, d = .4) => clamp((t - t0)/d, 0, 1);
const win = (t, t0, t1, d = .35) => Math.min(fade(t, t0, d), 1 - fade(t, t1 - d, d));
const pop = (t, t0, d = .35) => back(fade(t, t0, d));
// damped spring 0->1 starting at t0
const spring = (t, t0, f = 2.2, z = 4) => { const u = t - t0; if (u <= 0) return 0; return 1 - Math.exp(-z*u)*Math.cos(f*Math.PI*2*u); };
const hop = (t, t0, d = .45, h = .25) => { const u = (t - t0)/d; return u > 0 && u < 1 ? Math.sin(u*Math.PI)*h : 0; };
// walking along a polyline path [[t,x,z],...] -> {x,z,walk,ph,ry}
function walker(t, keys, seed = 0) {
  const p = kv(t, keys.map(k => [k[0], [k[1], k[2]]]), u => u), p2 = kv(t + 1/30, keys.map(k => [k[0], [k[1], k[2]]]), u => u);
  const vx = (p2[0] - p[0])*30, vz = (p2[1] - p[1])*30, v = Math.hypot(vx, vz);
  return {x: p[0], z: p[1], v, walk: Math.min(1, v/.5), ph: t*13 + seed, dir: Math.atan2(vx, vz)};
}
// ---------- SVG helpers ----------
const FONT_T = `'huninn'`, FONT_UI = `'Noto Sans CJK TC'`;
const T = (x, y, txt, size = 40, col = '#fff', anchor = 'middle', w = 700, extra = '') => `<text x="${x}" y="${y}" text-anchor="${anchor}" font-size="${size}" font-weight="${w}" fill="${col}" ${extra}>${txt}</text>`;
// warm title text (no box): soft shadow + cream
const TT = (x, y, txt, size = 60, col = '#FFF6E8', anchor = 'middle', op = 1) => op <= 0 ? '' : `<g opacity="${op}" font-family="${FONT_T}"><text x="${x}" y="${y}" text-anchor="${anchor}" font-size="${size}" fill="#3A2216" opacity=".55" filter="url(#tsh)">${txt}</text><text x="${x}" y="${y}" text-anchor="${anchor}" font-size="${size}" fill="${col}" stroke="#5A3420" stroke-width="${size*.08}" paint-order="stroke" stroke-linejoin="round">${txt}</text></g>`;
const tw = (s, fs) => [...s].reduce((w, ch) => w + (ch.charCodeAt(0) > 0x2E80 ? fs : ch === ' ' || ch === ' ' ? fs*.3 : ch === '@' ? fs*.88 : fs*.58), 0);
// hand-drawn check / cross with draw-on animation (k 0..1)
function hcheck(x, y, s, k, op = 1) { if (k <= 0 || op <= 0) return ''; const L = 150, d = `M-38,4 C-28,12 -18,24 -10,34 C6,6 26,-22 46,-40`;
  return `<g transform="translate(${x},${y}) scale(${s})" opacity="${op}" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="${d}" stroke="#FFF8EC" stroke-width="26" stroke-dasharray="${L*k} 400" opacity=".9"/><path d="${d}" stroke="#4FB05A" stroke-width="15" stroke-dasharray="${L*k} 400"/></g>`; }
function hcross(x, y, s, k, op = 1) { if (k <= 0 || op <= 0) return ''; const L = 120, k1 = clamp(k*2, 0, 1), k2 = clamp(k*2 - 1, 0, 1), a = `M-36,-38 C-14,-14 10,12 38,36`, b = `M36,-40 C12,-14 -10,10 -38,38`;
  return `<g transform="translate(${x},${y}) scale(${s})" opacity="${op}" fill="none" stroke-linecap="round"><path d="${a}" stroke="#FFF8EC" stroke-width="26" stroke-dasharray="${L*k1} 400" opacity=".9"/><path d="${b}" stroke="#FFF8EC" stroke-width="26" stroke-dasharray="${L*k2} 400" opacity=".9"/><path d="${a}" stroke="#E5483F" stroke-width="15" stroke-dasharray="${L*k1} 400"/><path d="${b}" stroke="#E5483F" stroke-width="15" stroke-dasharray="${L*k2} 400"/></g>`; }
// mark that draws on at t0 and fades out at t1
const markOK = (x, y, t, t0, t1, s = 1) => hcheck(x, y, s, fade(t, t0, .35), 1 - fade(t, t1, .3));
const markNG = (x, y, t, t0, t1, s = 1) => hcross(x, y, s, fade(t, t0, .4), 1 - fade(t, t1, .3));
// ---------- Discord-like chat ----------
function dc(x, y, w, h, msgs, t, channel = '洗澡排隊', sc = 1) {
  let g = `<g transform="translate(${x},${y}) scale(${sc})" font-family="${FONT_UI}"><rect x="6" y="12" width="${w}" height="${h}" rx="14" fill="#1a0f0a" opacity=".35"/><rect width="${w}" height="${h}" rx="14" fill="#313338"/>`;
  g += `<path d="M14,0 H190 V${h} H14 Q0,${h} 0,${h - 14} V14 Q0,0 14,0 Z" fill="#2B2D31"/>`;
  g += T(24, 42, '慈幼山友', 24, '#F2F3F5', 'start', 700) + `<line x1="0" y1="62" x2="190" y2="62" stroke="#1F2023" stroke-width="2"/>`;
  [['公告', 0], [channel, 1], ['閒聊', 0]].forEach(([c, sel], i) => { const yy = 100 + i*46; if (sel) g += `<rect x="10" y="${yy - 30}" width="170" height="40" rx="6" fill="#404249"/>`; g += `<text x="24" y="${yy}" font-size="24" fill="${sel ? '#F2F3F5' : '#949BA4'}"><tspan fill="#80848E" font-size="26">#</tspan> ${c}</text>`; });
  g += `<line x1="190" y1="62" x2="${w}" y2="62" stroke="#1F2023" stroke-width="2"/><text x="214" y="42" font-size="26" font-weight="700" fill="#F2F3F5"><tspan fill="#80848E">#</tspan> ${channel}</text>`;
  let yy = 84; const vis = msgs.filter(m => t >= m.t);
  const hs = vis.map(m => 64 + m.lines.length*42 + 14); let tot = hs.reduce((a, b) => a + b, 0), skip = 0;
  while (tot > h - 160 && skip < vis.length - 1) { tot -= hs[skip]; skip++; }
  vis.slice(skip).forEach(m => { const o = fade(t, m.t, .3);
    g += `<g opacity="${o}" transform="translate(0,${(1 - easeOut(o))*14})"><circle cx="240" cy="${yy + 26}" r="24" fill="${m.col}"/>${T(240, yy + 35, m.name.slice(-1), 22, '#fff')}`;
    g += T(278, yy + 24, m.name, 26, m.nameCol || '#F2F3F5', 'start', 700) + T(278 + tw(m.name, 26) + 14, yy + 24, '今天 ' + m.time, 20, '#949BA4', 'start', 400);
    m.lines.forEach((ln, i) => { const lo = ln.t ? fade(t, ln.t, .25) : 1; if (lo <= 0) return; let xx = 278; const ly = yy + 64 + i*42;
      g += `<g opacity="${lo}">`;
      for (const [txt0, k] of ln.parts) { const txt = txt0.replace(/ /g, ' '); const ww = tw(txt0, 28); if (k === 'm') g += `<rect x="${xx - 3}" y="${ly - 27}" width="${ww + 6}" height="36" rx="5" fill="rgba(88,101,242,.32)"/>`; g += T(xx, ly, txt, 28, k === 'm' ? '#C9CDFB' : '#DBDEE1', 'start', k === 'm' ? 700 : 400); xx += ww; }
      g += `</g>`; });
    g += `</g>`; yy += 64 + m.lines.length*42 + 14; });
  g += `<rect x="210" y="${h - 70}" width="${w - 230}" height="52" rx="10" fill="#383A40"/>` + T(232, h - 35, '傳訊息到 #' + channel, 24, '#6D6F78', 'start', 400);
  return g + `</g>`;
}
// ---------- Excel-like sheet ----------
const XC = [['A', 96], ['B', 160], ['C', 180], ['D', 180], ['E', 150], ['F', 84]];
function xlCell(c, r) { let x = 50; for (const [k, w] of XC) { if (k === c) return [x, 160 + (r - 1)*46, w, 46]; x += w; } }
function xl(st, t) {
  const W = 900, H = 520;
  let g = `<g font-family="${FONT_UI}"><rect x="8" y="14" width="${W}" height="${H}" rx="10" fill="#1a0f0a" opacity=".35"/><rect width="${W}" height="${H}" rx="10" fill="#fff"/>`;
  g += `<path d="M0,10 Q0,0 10,0 H${W - 10} Q${W},0 ${W},10 V44 H0 Z" fill="#217346"/>` + T(W/2, 30, '洗澡表.xlsx', 22, '#fff', 'middle', 500);
  g += `<path d="M${W - 112},22 h18 M${W - 70},14 h16 v16 h-16 z M${W - 30},14 l16,16 M${W - 14},14 l-16,16" stroke="#fff" stroke-width="2" fill="none"/>`;
  g += `<rect y="44" width="${W}" height="40" fill="#F3F2F1"/>`;
  ['檔案', '常用', '插入', '頁面配置', '公式', '資料', '校閱'].reduce((x, s, i) => { g += T(x, 71, s, 20, i === 1 ? '#217346' : '#444', 'start', i === 1 ? 700 : 400); if (i === 1) g += `<rect x="${x}" y="78" width="${tw(s, 20)}" height="3" fill="#217346"/>`; return x + tw(s, 20) + 28; }, 20);
  g += `<rect y="84" width="${W}" height="42" fill="#fff" stroke="#E1E1E1"/><rect x="8" y="90" width="78" height="30" fill="#fff" stroke="#C8C8C8"/>` + T(47, 112, st.sel || 'A1', 18, '#333', 'middle', 400) + T(110, 112, 'fx', 20, '#777', 'start', 400);
  g += T(150, 113, st.sel ? (st.vals[st.sel] || '') : '', 22, '#222', 'start', 400);
  g += `<rect y="126" width="${W}" height="34" fill="#F3F3F3"/><rect y="126" width="50" height="${H - 136}" fill="#F3F3F3"/>`;
  let x = 50; for (const [k, w] of XC) { g += T(x + w/2, 150, k, 18, '#555', 'middle', 400) + `<line x1="${x + w}" y1="126" x2="${x + w}" y2="${H - 10}" stroke="#E1E1E1"/>`; x += w; }
  for (let r = 1; r <= 7; r++) { const yy = 160 + (r - 1)*46; g += T(25, yy + 30, String(r), 18, '#555', 'middle', 400) + `<line x1="0" y1="${yy + 46}" x2="${W}" y2="${yy + 46}" stroke="#E1E1E1"/>`; }
  g += `<rect x="50" y="160" width="616" height="46" fill="#C6E0B4"/>` + T(358, 191, '校長室', 24, '#1E4620', 'middle', 700);
  g += `<rect x="50" y="206" width="616" height="46" fill="#E2EFDA"/>`;
  [['A', '順序'], ['B', '名字'], ['C', '去的時間'], ['D', '回的時間']].forEach(([c, s]) => { const [cx, cy, cw] = xlCell(c, 2); g += T(cx + cw/2, cy + 31, s, 22, '#1E4620', 'middle', 700); });
  const sw = st.swap || [0, 0, 0]; // [rowA,rowB,amount]
  const off = r => r === sw[0] ? sw[2]*46*(sw[1] - sw[0]) : r === sw[1] ? -sw[2]*46*(sw[1] - sw[0]) : 0;
  for (let r = 3; r <= 7; r++) { const ro = st.rowOp ? st.rowOp(r) : 1; if (ro <= 0) continue;
    if (st.hl && st.hl[r]) g += `<rect x="50" y="${160 + (r - 1)*46 + off(r)}" width="616" height="46" fill="${st.hl[r][0]}" opacity="${st.hl[r][1]}"/>`;
    g += `<g opacity="${ro}" transform="translate(0,${off(r)})">`;
    for (const c of ['A', 'B', 'C', 'D']) { const v = st.vals[c + r]; if (!v) continue; const [cx, cy, cw] = xlCell(c, r); g += T(c === 'A' ? cx + cw/2 : c === 'B' ? cx + 16 : cx + cw - 16, cy + 31, v, 24, '#222', c === 'A' ? 'middle' : c === 'B' ? 'start' : 'end', 400); }
    g += `</g>`; }
  if (st.sel) { const [cx, cy, cw, ch] = xlCell(st.sel[0], Number(st.sel.slice(1))); const yy = cy + off(Number(st.sel.slice(1)));
    g += `<rect x="${cx}" y="${yy}" width="${cw}" height="${ch}" fill="none" stroke="#217346" stroke-width="3.5"/><rect x="${cx + cw - 5}" y="${yy + ch - 5}" width="9" height="9" fill="#217346" stroke="#fff" stroke-width="1.5"/>`;
    if (st.who) { const lw = tw(st.who, 20) + 18; g += `<rect x="${cx + cw + 3}" y="${yy + 9}" width="${lw}" height="28" rx="4" fill="${st.whoCol || '#E8964B'}"/>` + T(cx + cw + 3 + lw/2, yy + 30, st.who, 20, '#fff', 'middle', 700); } }
  return g + `</g>`;
}
const typed = (s, t, t0, d = .5) => s.slice(0, Math.floor(clamp((t - t0)/d, 0, 1)*s.length));
// ---------- projection 3D -> screen ----------
const _v = new THREE.Vector3();
function scr(cam, x, y, z) { _v.set(x, y, z).project(cam); return [(_v.x + 1)/2*1920, (1 - _v.y)/2*1080]; }
function scrObj(cam, obj, dy = 0) { obj.updateWorldMatrix(true, false); _v.setFromMatrixPosition(obj.matrixWorld); _v.y += dy; _v.project(cam); return [(_v.x + 1)/2*1920, (1 - _v.y)/2*1080]; }
