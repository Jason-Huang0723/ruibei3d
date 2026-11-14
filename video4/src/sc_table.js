// ===== 2-09～2-18：各間教室的用途（左：Excel 表；右：2D 平面圖，講到哪間就亮哪間） =====
// [句子, 用途（可兩行）, 教室（可兩行）, 平面圖要亮的房間]
const ROOMT = [
  ['2-10', ['小朋友上課'], ['一、二、三年級教室'], ['c1', 'c2', 'c3']],
  ['2-11', ['哥姐休息'], ['四年級教室'], ['c4']],
  ['2-12', ['睡覺'], ['五、六年級教室', '圖書室・國幼班'], ['c5', 'c6', 'lib', 'kg']],
  ['2-13', ['放行李'], ['英語教室'], ['eng']],
  ['2-14', ['早餐・吹頭髮', '放各方案庶務'], ['會議室'], ['meet']],
  ['2-15', ['吃飯・檢討・營包・早操', '各方案、團本庶務'], ['禮堂'], ['hall']],
  ['2-17', ['團本工作・洗澡'], ['校長室'], ['prin']],
  ['2-18', ['小朋友不能玩'], ['溜滑梯'], ['slide']]];
function buildTable() {
  const sec = SEC.table, L = id => sec.lines.find(l => l.id === id), at = (id, k) => L(id).start + k*L(id).dur;
  const bgS = `<rect width="1920" height="1080" fill="#3A2618"/><radialGradient id="fl" cx="50%" cy="42%" r="70%"><stop offset="0" stop-color="#9A6238"/><stop offset=".6" stop-color="#5A371F"/><stop offset="1" stop-color="#2C1A0E"/></radialGradient><rect width="1920" height="1080" fill="url(#fl)"/>` +
    [[260, 220, 120, .12], [1640, 300, 160, .1], [1500, 820, 110, .08], [380, 840, 140, .09], [980, 120, 90, .07]].map(([x, y, r, o]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#FFD9A0" opacity="${o}" filter="url(#soft)"/>`).join('');
  const COLS = [['A', 400], ['B', 330]], RH = 66, W = 50 + COLS.reduce((a, c) => a + c[1], 0) + 24, HDR = 152, NR = ROOMT.length + 1;
  const colX = i => 50 + COLS.slice(0, i).reduce((a, c) => a + c[1], 0);
  // 哪一列在講：用句子時間
  const act = (id, t) => { const l = L(id); return win(t, l.start - .15, l.start + l.dur + .35, .25); };
  function cell(x, y, lines, fs, col, w) { if (lines.length === 1) return T(x, y + RH/2 + fs*.36, lines[0], fs, col, 'start', w);
    return T(x, y + RH/2 - 4, lines[0], fs - 4, col, 'start', w) + T(x, y + RH/2 + fs - 6, lines[1], fs - 6, col, 'start', w === 700 ? 500 : 400); }
  function sheet(t) {
    const H = HDR + RH*NR + 28;
    let g = `<g font-family="${FONT_UI}"><rect x="10" y="18" width="${W}" height="${H}" rx="12" fill="#1a0d06" opacity=".4" filter="url(#soft)"/><rect width="${W}" height="${H}" rx="12" fill="#fff"/>`;
    g += `<path d="M0,12 Q0,0 12,0 H${W - 12} Q${W},0 ${W},12 V48 H0 Z" fill="#217346"/>` + T(W/2, 33, '各間教室的用途.xlsx', 22, '#fff', 'middle', 500);
    g += `<path d="M${W - 110},24 h16 M${W - 70},16 h15 v15 h-15 z M${W - 32},16 l15,15 M${W - 17},16 l-15,15" stroke="#fff" stroke-width="2.2" fill="none"/>`;
    g += `<rect y="48" width="${W}" height="44" fill="#F3F2F1"/>`;
    ['檔案', '常用', '插入', '頁面配置', '公式', '資料'].reduce((x, s, i) => { g += T(x, 78, s, 20, i === 1 ? '#217346' : '#444', 'start', i === 1 ? 700 : 400); if (i === 1) g += `<rect x="${x}" y="85" width="${tw(s, 20)}" height="3" fill="#217346"/>`; return x + tw(s, 20) + 28; }, 22);
    g += `<rect y="92" width="${W}" height="24" fill="#fff"/><rect y="116" width="${W}" height="36" fill="#F3F3F3"/><rect y="116" width="50" height="${H - 126}" fill="#F3F3F3"/>`;
    COLS.forEach(([k, w], i) => { const x = colX(i); g += T(x + w/2, 141, k, 18, '#555', 'middle', 400) + `<line x1="${x + w}" y1="116" x2="${x + w}" y2="${H - 10}" stroke="#E1E1E1"/>`; });
    for (let r = 1; r <= NR; r++) { const y = HDR + (r - 1)*RH; g += T(25, y + RH/2 + 7, String(r), 18, '#555', 'middle', 400) + `<line x1="0" y1="${y + RH}" x2="${W}" y2="${y + RH}" stroke="#E1E1E1"/>`; }
    g += `<rect x="50" y="${HDR}" width="${W - 74}" height="${RH}" fill="#C6E0B4"/>`;
    ['用途', '教室'].forEach((s, i) => { g += T(colX(i) + 20, HDR + RH/2 + 10, s, 27, '#1E4620', 'start', 700); });
    ROOMT.forEach(([id, use, room], i) => {
      const l = L(id), y = HDR + (i + 1)*RH, o = fade(t, l.start - .15, .3); if (o <= 0) return;
      const hk = act(id, t) + (id === '2-14' || id === '2-15' ? act('2-16', t)*.8 : 0);
      if (hk > 0) g += `<rect x="50" y="${y}" width="${W - 74}" height="${RH}" fill="#FFF2B3" opacity="${Math.min(1, hk)}"/>`;
      const red = id === '2-18', sl = (1 - easeOut(o))*10;
      g += `<g opacity="${o}" transform="translate(0,${sl})">` + cell(colX(0) + 20, y, use, 29, red ? '#C0392B' : '#3A2A1A', 700) + cell(colX(1) + 20, y, room, 29, '#222', 400) + `</g>`;
    });
    return g + `</g>`;
  }
  // ---- 2D 平面圖（u 往右＝往東，v 往下＝往南；二樓另外畫在上面） ----
  const PX = 1000, PY = 116, K = 7.3, X = u => PX + 34 + u*K, Y2 = v => PY + 40 + v*K, Y1 = v => PY + 214 + v*K;
  const R1 = {off: [13, 21.4, '辦公室'], st1: [29.5, 32.7, ''], c4: [32.7, 42, '四年級'], c3: [42, 51.5, '三年級'], c2: [51.5, 60.6, '二年級'], c1: [60.6, 70.2, '一年級'], st2: [70.2, 73.4, ''], wc: [73.4, 77, '廁'], hall: [84.8, 101, '禮堂']};
  const R2 = {x2: [13, 17.6, ''], meet: [17.6, 29.5, '會議室'], s21: [29.5, 32.7, ''], lib: [32.7, 42, '圖書室'], eng: [42, 51.5, '英語教室'], c5: [51.5, 60.6, '五年級'], c6: [60.6, 70.2, '六年級'], s22: [70.2, 73.4, ''], w2: [73.4, 77, '廁']};
  const ON = (k, t) => { let v = 0; for (const [id, , , ks] of ROOMT) if (ks.includes(k)) v = Math.max(v, act(id, t)); if (k === 'meet' || k === 'hall') v = Math.max(v, act('2-16', t)); return v; };
  const box = (x0, y0, x1, y1, k, t, name, fs = 17) => { const on = ON(k, t), red = k === 'slide';
    const fill = on > 0 ? (red ? `rgba(232,90,70,${.25 + .6*on})` : `rgba(255,205,90,${.25 + .7*on})`) : '#FFF8EC';
    return `<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" fill="${fill}" stroke="#7A4A2A" stroke-width="2.5"/>` + (on > 0 ? `<rect x="${x0 - 3}" y="${y0 - 3}" width="${x1 - x0 + 6}" height="${y1 - y0 + 6}" fill="none" stroke="${red ? '#E5483F' : '#FFB703'}" stroke-width="${5*on}" opacity="${on}"/>` : '') +
      (name ? `<text x="${(x0 + x1)/2}" y="${(y0 + y1)/2 + fs*.36}" text-anchor="middle" font-family="huninn" font-size="${fs}" fill="#4A2A16">${name}</text>` : ''); };
  function plan(t) {
    let s = `<g><rect x="${PX}" y="${PY - 56}" width="${880}" height="${790}" rx="18" fill="#FFF3E0" stroke="#C99A6B" stroke-width="3"/><rect x="${PX}" y="${PY - 56}" width="${880}" height="${790}" rx="18" fill="#1a0d06" opacity=".0"/>`;
    s += `<text x="${PX + 440}" y="${PY - 14}" text-anchor="middle" font-family="huninn" font-size="34" fill="#7A4A2A">瑞北國小平面圖</text>`;
    // 二樓
    s += `<text x="${X(13) - 12}" y="${Y2(8.5) + 8}" text-anchor="end" font-family="huninn" font-size="24" fill="#7A4A2A">二樓</text>`;
    for (const k in R2) { const [a, b, n] = R2[k]; s += box(X(a), Y2(2), X(b), Y2(13), k, t, n, n.length > 3 ? 15 : n.length === 1 ? 16 : 20); }
    s += box(X(13), Y2(13), X(21.4), Y2(20), 'prin', t, '校長室', 18);
    s += `<rect x="${X(13)}" y="${Y2(2)}" width="${X(77) - X(13)}" height="${Y2(13) - Y2(2)}" fill="none" stroke="#7A4A2A" stroke-width="3"/>`;
    // 一樓＋校園
    s += `<rect x="${X(-1)}" y="${Y1(0)}" width="${X(106) - X(-1)}" height="${Y1(64.6) - Y1(0)}" fill="none" stroke="#B08A68" stroke-width="2" stroke-dasharray="8 6"/>`;
    s += `<rect x="${X(36.5)}" y="${Y1(26)}" width="${X(100) - X(36.5)}" height="${Y1(54) - Y1(26)}" rx="6" fill="#8CC77A" stroke="#5E9A4E" stroke-width="2"/><text x="${X(68)}" y="${Y1(41)}" text-anchor="middle" font-family="huninn" font-size="26" fill="#2F5A26">操場</text>`;
    s += `<text x="${X(13) - 12}" y="${Y1(8.5) + 8}" text-anchor="end" font-family="huninn" font-size="24" fill="#7A4A2A">一樓</text>`;
    for (const k in R1) { const [a, b, n] = R1[k]; s += box(X(a), Y1(2), X(b), Y1(13), k, t, n, n.length === 1 ? 16 : n.length > 2 ? 19 : 20); }
    s += box(X(21.4), Y1(2), X(29.5), Y1(13), 'x1', t, '', 17) + box(X(77), Y1(2), X(84.8), Y1(13), 'x3', t, '', 17);
    s += box(X(13), Y1(13), X(21.4), Y1(21), 'x4', t, '穿堂', 17);
    s += box(X(18.1), Y1(55.4), X(27.6), Y1(64.6), 'x5', t, '器材室', 17) + box(X(27.6), Y1(55.6), X(78.6), Y1(64.6), 'kg', t, '國幼班', 22) + box(X(79.5), Y1(55.6), X(91), Y1(62.5), 'slide', t, '溜滑梯', 18);
    s += `<text x="${X(-1) + 4}" y="${Y1(29)}" text-anchor="start" font-family="huninn" font-size="20" fill="#7A4A2A">大門</text><path d="M${X(-1) + 2},${Y1(31.5)} h30" stroke="#7A4A2A" stroke-width="5"/>`;
    s += `<text x="${PX + 440}" y="${Y1(64.6) + 40}" text-anchor="middle" font-family="huninn" font-size="18" fill="#9A7458">（示意圖，左邊是大門、上方是北）</text>`;
    // 2-16：營期中不能上二樓 → 庶務前一天拿到禮堂
    { const o = win(t, L('2-16').start, L('2-17').start - .1, .3); if (o > 0) {
      s += `<g opacity="${o}"><rect x="${X(13) - 6}" y="${Y2(2) - 6}" width="${X(77) - X(13) + 12}" height="${Y2(13) - Y2(2) + 12}" fill="none" stroke="#E5483F" stroke-width="5" stroke-dasharray="14 8"/></g>`;
      s += hcross(X(80) + 20, Y2(7.5), .4, fade(t, at('2-16', .08), .4), o) + TL_(X(80) + 46, Y2(7.5) + 10, '營期中不能上二樓', 26, '#FFB4A8', 'start', o);
      const k = ease(clamp((t - at('2-16', .55))/.9, 0, 1)); if (k > 0) { const x0 = X(23.5), y0 = Y2(13), x1 = X(93), y1 = Y1(2), mx = (x0 + x1)/2, my = y0 - 40;
        s += `<path d="M${x0},${y0} Q${mx},${my + 150} ${x1},${y1}" fill="none" stroke="#E07A1F" stroke-width="6" stroke-linecap="round" stroke-dasharray="${900*k} 900" opacity="${o}"/>`;
        if (k > .95) s += `<path d="M${x1 - 18},${y1 - 22} L${x1},${y1} L${x1 + 22},${y1 - 16}" fill="none" stroke="#E07A1F" stroke-width="6" stroke-linecap="round" opacity="${o}"/>` + TL_(mx + 40, Y1(-1.2), '前一天先拿下來', 26, '#E07A1F', 'middle', o); } } }
    { const l = L('2-18'); s += hcross(X(85.2), Y1(59), .55, fade(t, l.start + l.dur*.45, .4), 1); }
    return s + `</g>`;
  }
  function update(t) {}
  function overlay(t) {
    let s = bgS; const o = fade(t, .1, .45), sl = (1 - easeOut(o))*60;
    s += `<g opacity="${o}" transform="translate(${40},${60 + sl})">${sheet(t)}</g>`;
    const po = fade(t, L('2-09').start + .6, .5); s += `<g opacity="${po}" transform="translate(0,${(1 - easeOut(po))*40})">${plan(t)}</g>`;
    return s;
  }
  return {scene: null, cam: null, update, overlay, flat: true, noGL: true};
}
