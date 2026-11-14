// ===== v4 overlays: phone, DC mobile, sheet mobile, Google Sheets window, thought bubbles =====
let _clipN = 0;
// phone frame centred at (cx, cy), scale s; inner(svg string in 368x788 screen coords)
function phoneFrame(cx, cy, s, inner, op = 1, rot = 0) {
  const id = 'pc' + (_clipN++), W = 400, H = 820;
  return `<g opacity="${op}" transform="translate(${cx},${cy}) rotate(${rot}) scale(${s}) translate(${-W/2},${-H/2})">
  <rect x="10" y="22" width="${W}" height="${H}" rx="58" fill="#1a0d06" opacity=".35" filter="url(#soft)"/>
  <rect width="${W}" height="${H}" rx="58" fill="#1E1C1F"/><rect x="3" y="3" width="${W - 6}" height="${H - 6}" rx="55" fill="none" stroke="#4A464C" stroke-width="3"/>
  <defs><clipPath id="${id}"><rect x="16" y="16" width="368" height="788" rx="44"/></clipPath></defs>
  <g clip-path="url(#${id})"><g transform="translate(16,16)">${inner}</g></g>
  <rect x="150" y="26" width="100" height="26" rx="13" fill="#0E0D0F"/></g>`;
}
const statusBar = (dark = true, time = '16:30') => `<rect width="368" height="40" fill="${dark ? '#1E1F22' : '#1B5E3A'}"/>` + T(30, 28, time, 17, '#fff', 'start', 600) + `<rect x="318" y="15" width="28" height="13" rx="3" fill="none" stroke="#fff" stroke-width="1.6"/><rect x="321" y="18" width="20" height="7" rx="1.5" fill="#fff"/>`;
// Discord mobile: msgs [{t, name, col, nameCol, time, parts:[[txt,'m'|'t'],...], hl:{i: t0}}], typing {from, to, text, sendAt}
function dcMobile(msgs, t, typing) {
  let g = `<rect width="368" height="788" fill="#313338"/>` + statusBar(true);
  g += `<rect y="40" width="368" height="62" fill="#2B2D31"/><path d="M18,60 h20 M18,71 h20 M18,82 h20" stroke="#B5BAC1" stroke-width="3" stroke-linecap="round"/>`;
  g += `<text x="54" y="82" font-size="26" font-weight="700" fill="#F2F3F5"><tspan fill="#80848E" font-size="28">#</tspan> 洗澡排隊</text>` + T(345, 80, '慈幼山友', 14, '#949BA4', 'end', 400);
  let y = 126;
  msgs.filter(m => t >= m.t).forEach(m => { const o = fade(t, m.t, .25), dy = (1 - easeOut(o))*16;
    g += `<g opacity="${o}" transform="translate(0,${dy})"><circle cx="32" cy="${y + 24}" r="24" fill="${m.col}"/>` + T(32, y + 33, m.name.slice(-1), 22, '#fff', 'middle', 700);
    g += T(66, y + 20, m.name, 23, m.nameCol || '#F2F3F5', 'start', 700) + T(66 + tw(m.name, 23) + 10, y + 20, '今天 ' + m.time, 15, '#949BA4', 'start', 400);
    let x = 66, ly = y + 60; const lineW = 292, FS = 27;
    m.parts.forEach(([txt0, k], i) => { const txt = txt0.replace(/ /g, ' '); const ww = tw(txt0, FS);
      if (x + ww > 66 + lineW && k !== 'm') { // wrap plain text by characters
        let cur = ''; for (const ch of txt0) { const cw = tw(cur + ch, FS); if (x + cw > 66 + lineW) { g += T(x, ly, cur.replace(/ /g, ' '), FS, '#DBDEE1', 'start', 400); ly += 38; x = 66; cur = ch; } else cur += ch; }
        g += T(x, ly, cur.replace(/ /g, ' '), FS, '#DBDEE1', 'start', 400); x += tw(cur, FS); return; }
      if (k === 'm') { const hl = m.hl && m.hl[i] != null ? win(t, m.hl[i], m.hl[i] + 1.2, .2) : 0;
        if (hl > 0) g += `<rect x="${x - 6}" y="${ly - 31}" width="${ww + 12}" height="42" rx="8" fill="#FFD166" opacity="${hl*.55}"/>`;
        g += `<rect x="${x - 2}" y="${ly - 26}" width="${ww + 4}" height="34" rx="5" fill="rgba(88,101,242,.35)"/>`; }
      g += T(x, ly, txt, FS, k === 'm' ? '#C9CDFB' : '#DBDEE1', 'start', k === 'm' ? 700 : 400); x += ww; });
    g += `</g>`; y = ly + 36; });
  // input bar
  let typed_ = '', caret = false; if (typing && t >= typing.from && t < typing.sendAt) { typed_ = typing.text.slice(0, Math.ceil(clamp((t - typing.from)/(typing.to - typing.from), 0, 1)*typing.text.length)); caret = Math.floor(t*3) % 2 === 0; }
  g += `<rect x="12" y="716" width="300" height="52" rx="26" fill="#383A40"/>`;
  g += typed_ ? T(32, 750, typed_.replace(/ /g, ' ') + (caret ? '|' : ''), 19, '#F2F3F5', 'start', 400) : T(32, 750, '傳訊息到 #洗澡排隊', 18, '#6D6F78', 'start', 400);
  const send = typed_ ? 1 : 0; g += `<circle cx="340" cy="742" r="22" fill="${send ? '#5865F2' : '#383A40'}"/><path d="M331,742 l18,-8 -6,8 6,8 z" fill="#fff"/>`;
  return g;
}
// Excel mobile sheet: rows [{n, name}], vals {C3:'16:30'}, sel 'C3', who, swap [rA,rB,k], ok
function sheetMobile(rows, vals, t, sel, who, whoCol, extra = '') {
  let g = `<rect width="368" height="788" fill="#fff"/>` + statusBar(false);
  g += `<rect y="40" width="368" height="56" fill="#217346"/>` + T(184, 76, '洗澡表.xlsx', 19, '#fff', 'middle', 600) + `<path d="M20,68 l10,-9 M20,68 l10,9" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/>`;
  g += `<rect y="96" width="368" height="40" fill="#F3F2F1"/>` + T(14, 122, 'fx', 15, '#777', 'start', 400) + T(46, 122, sel ? (vals[sel] || '') : '', 16, '#222', 'start', 400);
  const COL = [['', 30], ['A', 58], ['B', 86], ['C', 98], ['D', 96]], RH = 46, Y0 = 136;
  let x = 0; COL.forEach(([k, w]) => { g += `<rect x="${x}" y="${Y0}" width="${w}" height="30" fill="#F3F3F3" stroke="#E1E1E1"/>` + T(x + w/2, Y0 + 21, k, 14, '#555', 'middle', 400); x += w; });
  const cx = c => { let xx = 0; for (const [k, w] of COL) { if (k === c) return [xx, w]; xx += w; } };
  const ry = r => Y0 + 30 + (r - 1)*RH;
  for (let r = 1; r <= 8; r++) { g += `<rect x="0" y="${ry(r)}" width="30" height="${RH}" fill="#F3F3F3" stroke="#E1E1E1"/>` + T(15, ry(r) + 29, String(r), 14, '#555', 'middle', 400) + `<line x1="30" y1="${ry(r) + RH}" x2="368" y2="${ry(r) + RH}" stroke="#E1E1E1"/>`; }
  x = 30; COL.slice(1).forEach(([k, w]) => { x += w; g += `<line x1="${x}" y1="${Y0 + 30}" x2="${x}" y2="${ry(9)}" stroke="#E1E1E1"/>`; });
  g += `<rect x="30" y="${ry(1)}" width="338" height="${RH}" fill="#C6E0B4"/>` + T(199, ry(1) + 30, '校長室', 18, '#1E4620', 'middle', 700);
  g += `<rect x="30" y="${ry(2)}" width="338" height="${RH}" fill="#E2EFDA"/>`;
  [['A', '順序'], ['B', '名字'], ['C', '去的時間'], ['D', '回的時間']].forEach(([c, s]) => { const [xx, w] = cx(c); g += T(xx + w/2, ry(2) + 29, s, 15, '#1E4620', 'middle', 700); });
  const sw = (extra && extra.swap) || null;
  const offOf = r => !sw ? 0 : r === sw[0] ? sw[2]*RH*(sw[1] - sw[0]) : r === sw[1] ? -sw[2]*RH*(sw[1] - sw[0]) : 0;
  rows.forEach((rw, i) => { if (rw.hl) g += `<rect x="30" y="${ry(i + 3)}" width="338" height="${RH}" fill="${rw.hl}" opacity=".85"/>`; });
  rows.forEach((rw, i) => { const r = i + 3, off = offOf(r);
    g += `<g transform="translate(0,${off})">`;
    const [ax, aw] = cx('A'), [bx] = cx('B'); g += `<g transform="translate(0,${-off})">` + T(ax + aw/2, ry(r) + 29, String(rw.n), 16, '#222', 'middle', 400) + `</g>` + T(bx + 10, ry(r) + 29, rw.name, 17, '#222', 'start', 500);
    for (const c of ['C', 'D']) { const v = vals[c + r]; if (v) { const [xx, w] = cx(c); g += T(xx + w - 8, ry(r) + 29, v, 16, '#222', 'end', 400); } }
    g += `</g>`; });
  if (sel) { const [xx, w] = cx(sel[0]), r = Number(sel.slice(1)); g += `<rect x="${xx}" y="${ry(r)}" width="${w}" height="${RH}" fill="none" stroke="#217346" stroke-width="3"/>`;
    if (who) { const lw = tw(who, 14) + 12; g += `<rect x="${Math.min(xx + w - lw, 368 - lw - 2)}" y="${ry(r) - 22}" width="${lw}" height="22" rx="3" fill="${whoCol}"/>` + T(Math.min(xx + w - lw, 368 - lw - 2) + lw/2, ry(r) - 6, who, 14, '#fff', 'middle', 700); } }
  return g + ((extra && extra.svg) || '');
}
// Google Sheets window with the real 36 平服 Day1 export
function sheetsWindow(x, y, w, op = 1) {
  const ih = w*700/1372, H = ih + 136;
  let g = `<g opacity="${op}" transform="translate(${x},${y})" font-family="${FONT_UI}"><rect x="8" y="14" width="${w}" height="${H}" rx="10" fill="#1a0d06" opacity=".4" filter="url(#soft)"/><rect width="${w}" height="${H}" rx="10" fill="#fff"/>`;
  g += `<rect x="18" y="14" width="30" height="38" rx="4" fill="#0F9D58"/><path d="M25,26 h16 M25,33 h16 M25,40 h16 M33,22 v22" stroke="#fff" stroke-width="2.4"/>`;
  g += T(62, 36, '36平服洗澡表', 22, '#202124', 'start', 400) + `<g font-size="15" fill="#444">` + ['檔案', '編輯', '查看', '插入', '格式', '資料', '工具', '擴充功能', '說明'].map((s, i) => `<text x="${62 + i*64}" y="${60}">${s}</text>`).join('') + `</g>`;
  g += `<rect x="12" y="74" width="${w - 24}" height="34" rx="17" fill="#EDF2FA"/>` + T(30, 97, '↶　↷　🖨︎　100%　NT$　%　.0　.00　123　預設　—　10　+　B　I', 14, '#444', 'start', 400).replace('🖨︎', '');
  g += `<image href="assets/sheet36.png" x="0" y="112" width="${w}" height="${ih}" preserveAspectRatio="none"/>`;
  g += `<rect y="${112 + ih}" width="${w}" height="24" fill="#F8F9FA"/><line x1="0" y1="${112 + ih}" x2="${w}" y2="${112 + ih}" stroke="#DADCE0"/>` + T(30, 130 + ih, '＋　≡　 先遣　', 14, '#444', 'start', 400) + `<rect x="150" y="${113 + ih}" width="70" height="23" fill="#E1F0E6"/>` + T(185, 130 + ih, 'Day1', 14, '#188038', 'middle', 700);
  return g + `</g>`;
}
// thought bubble with icon svg (icon drawn in a 200x150 box centred at 0,0)
function thought(cx, cy, k, icon, tailTo) {
  if (k <= 0) return ''; const s = back(clamp(k, 0, 1));
  let g = `<g transform="translate(${cx},${cy}) scale(${s})">`;
  g += `<ellipse cx="6" cy="10" rx="150" ry="112" fill="#1a0d06" opacity=".25" filter="url(#soft)"/>`;
  g += `<path d="M-120,-20 C-150,-80 -80,-120 -30,-100 C0,-140 80,-130 100,-90 C150,-90 160,-20 130,10 C150,60 90,100 40,88 C10,120 -70,110 -90,75 C-140,80 -160,20 -120,-20 Z" fill="#FFFDF8" stroke="#5A3420" stroke-width="5"/>`;
  g += icon + `</g>`;
  if (tailTo) { const [tx, ty] = tailTo; [0.3, 0.55, 0.78].forEach((f, i) => { const x = lerp(cx, tx, f), y = lerp(cy + 90, ty, f); g += `<circle cx="${x}" cy="${y}" r="${(14 - i*4)*s}" fill="#FFFDF8" stroke="#5A3420" stroke-width="4"/>`; }); }
  return g;
}
const ICON_COLD = `<g transform="translate(-10,-6)"><path d="M-60,-55 h50 a10,10 0 0 1 10,10 v10" fill="none" stroke="#8A8F96" stroke-width="10" stroke-linecap="round"/><path d="M-25,-30 h50 l-10,18 h-30 z" fill="#B8BEC6" stroke="#6E737A" stroke-width="4"/>
  ${[[-15, 0], [0, 12], [15, 0], [-8, 30], [8, 34], [-20, 40], [20, 44]].map(([x, y]) => `<path d="M${x},${y} q-6,10 0,14 q6,-4 0,-14 z" fill="#5AA9E6"/>`).join('')}
  <g transform="translate(70,-10)" stroke="#5AA9E6" stroke-width="7" stroke-linecap="round">${[0, 60, 120].map(a => `<line x1="${-30*Math.cos(a*Math.PI/180)}" y1="${-30*Math.sin(a*Math.PI/180)}" x2="${30*Math.cos(a*Math.PI/180)}" y2="${30*Math.sin(a*Math.PI/180)}"/>`).join('')}</g></g>`;
const ICON_KIDS = `<g transform="translate(-6,10)">${[[-70, 0, 34, '#84b194'], [-10, 14, 24, '#F4B183'], [38, 18, 22, '#F2D27A'], [82, 20, 21, '#F2A7BC']].map(([x, y, r, c]) => `<circle cx="${x}" cy="${y - r}" r="${r}" fill="${c}" stroke="#2A1A10" stroke-width="4"/><circle cx="${x - r*.3}" cy="${y - r*1.1}" r="${r*.13}" fill="#1c1a18"/><circle cx="${x + r*.3}" cy="${y - r*1.1}" r="${r*.13}" fill="#1c1a18"/><path d="M${x - r*.3},${y - r*.7} q${r*.3},${r*.25} ${r*.6},0" fill="none" stroke="#1c1a18" stroke-width="3"/><line x1="${x - r*.45}" y1="${y}" x2="${x - r*.45}" y2="${y + 22}" stroke="#2A1A10" stroke-width="4"/><line x1="${x + r*.45}" y1="${y}" x2="${x + r*.45}" y2="${y + 22}" stroke="#2A1A10" stroke-width="4"/>`).join('')}
  <path d="M-36,-14 h12 M14,-6 h12 M58,-4 h10" stroke="#2A1A10" stroke-width="4" stroke-linecap="round"/><path d="M60,-70 l22,-18 22,18 v24 h-44 z" fill="#E98A6A" stroke="#2A1A10" stroke-width="4"/></g>`;
