// ===== 2-09～2-17：各間教室的用途（Excel 視窗，同功能放同一列，講到哪列就亮哪列） =====
const ROOMT = [
  ['2-10', '小朋友上課', '一、二、三年級教室', '一樓'],
  ['2-11', '哥姐休息', '四年級教室', '一樓'],
  ['2-12', '睡覺', '五、六年級教室・圖書室・國幼班', '二樓／國幼班在操場對面'],
  ['2-13', '放行李', '英語教室', '二樓'],
  ['2-14', '早餐・吹頭髮', '會議室', '二樓'],
  ['2-15', '吃飯・檢討・營包・早操', '禮堂', '一樓走廊走到底'],
  ['2-16', '團本工作・洗澡', '校長室', '二樓，會議室旁的小樓梯'],
  ['2-17', '小朋友不能玩', '溜滑梯', '國幼班旁邊']];
function buildTable() {
  const sec = SEC.table, L = id => sec.lines.find(l => l.id === id);
  const bgS = `<rect width="1920" height="1080" fill="#3A2618"/><radialGradient id="fl" cx="50%" cy="42%" r="70%"><stop offset="0" stop-color="#9A6238"/><stop offset=".6" stop-color="#5A371F"/><stop offset="1" stop-color="#2C1A0E"/></radialGradient><rect width="1920" height="1080" fill="url(#fl)"/>` +
    [[260, 220, 120, .12], [1640, 300, 160, .1], [1500, 820, 110, .08], [380, 840, 140, .09], [980, 120, 90, .07]].map(([x, y, r, o]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#FFD9A0" opacity="${o}" filter="url(#soft)"/>`).join('');
  const COLS = [['A', 360], ['B', 560], ['C', 500]], RH = 60, W = 50 + COLS.reduce((a, c) => a + c[1], 0) + 30, HDR = 152;
  const colX = i => 50 + COLS.slice(0, i).reduce((a, c) => a + c[1], 0);
  function update(t) {}
  function sheet(t) {
    const H = HDR + RH*9 + 40;
    let g = `<g font-family="${FONT_UI}"><rect x="10" y="18" width="${W}" height="${H}" rx="12" fill="#1a0d06" opacity=".4" filter="url(#soft)"/><rect width="${W}" height="${H}" rx="12" fill="#fff"/>`;
    g += `<path d="M0,12 Q0,0 12,0 H${W - 12} Q${W},0 ${W},12 V48 H0 Z" fill="#217346"/>` + T(W/2, 33, '各間教室的用途.xlsx', 24, '#fff', 'middle', 500);
    g += `<path d="M${W - 120},24 h18 M${W - 76},15 h16 v16 h-16 z M${W - 34},15 l16,16 M${W - 18},15 l-16,16" stroke="#fff" stroke-width="2.2" fill="none"/>`;
    g += `<rect y="48" width="${W}" height="44" fill="#F3F2F1"/>`;
    ['檔案', '常用', '插入', '頁面配置', '公式', '資料', '校閱'].reduce((x, s, i) => { g += T(x, 78, s, 21, i === 1 ? '#217346' : '#444', 'start', i === 1 ? 700 : 400); if (i === 1) g += `<rect x="${x}" y="85" width="${tw(s, 21)}" height="3" fill="#217346"/>`; return x + tw(s, 21) + 30; }, 24);
    g += `<rect y="92" width="${W}" height="24" fill="#fff"/><rect y="116" width="${W}" height="36" fill="#F3F3F3"/><rect y="116" width="50" height="${H - 126}" fill="#F3F3F3"/>`;
    COLS.forEach(([k, w], i) => { const x = colX(i); g += T(x + w/2, 141, k, 19, '#555', 'middle', 400) + `<line x1="${x + w}" y1="116" x2="${x + w}" y2="${H - 10}" stroke="#E1E1E1"/>`; });
    for (let r = 1; r <= 9; r++) { const y = HDR + (r - 1)*RH; g += T(25, y + RH/2 + 7, String(r), 19, '#555', 'middle', 400) + `<line x1="0" y1="${y + RH}" x2="${W}" y2="${y + RH}" stroke="#E1E1E1"/>`; }
    // 表頭
    g += `<rect x="50" y="${HDR}" width="${W - 80}" height="${RH}" fill="#C6E0B4"/>`;
    ['用途', '教室', '在哪裡'].forEach((s, i) => { g += T(colX(i) + 22, HDR + RH/2 + 10, s, 28, '#1E4620', 'start', 700); });
    ROOMT.forEach(([id, use, room, where], i) => {
      const l = L(id), r = i + 2, y = HDR + (r - 1)*RH, o = fade(t, l.start - .15, .3); if (o <= 0) return;
      const on = t >= l.start - .15 && t < l.start + l.dur + .35, hk = on ? win(t, l.start - .15, l.start + l.dur + .35, .25) : 0;
      if (hk > 0) g += `<rect x="50" y="${y}" width="${W - 80}" height="${RH}" fill="#FFF2B3" opacity="${hk}"/>`;
      const red = id === '2-17', sl = (1 - easeOut(o))*10;
      g += `<g opacity="${o}" transform="translate(0,${sl})">` + T(colX(0) + 22, y + RH/2 + 11, use, 31, red ? '#C0392B' : '#3A2A1A', 'start', 700) + T(colX(1) + 22, y + RH/2 + 11, room, 31, '#222', 'start', 400) + T(colX(2) + 22, y + RH/2 + 10, where, 27, '#555', 'start', 400) + `</g>`;
    });
    if (on2(t)) g += `<rect x="${colX(1) - 2}" y="${HDR + RH*8}" width="${COLS[1][1] + 4}" height="${RH}" fill="none" stroke="#C0392B" stroke-width="4" opacity="${fade(t, L('2-17').start + .3, .3)}"/>`;
    return g + `</g>`;
  }
  const on2 = t => t > L('2-17').start + .2;
  function overlay(t) {
    let s = bgS; const o = fade(t, .1, .45), sl = (1 - easeOut(o))*60, sc = 1.12, x0 = (1920 - W*sc)/2;
    s += `<g opacity="${o}" transform="translate(${x0},${52 + sl}) scale(${sc})">${sheet(t)}</g>`;
    const l17 = L('2-17'); s += markNG(x0 + (colX(2) + 330)*sc, 52 + (HDR + RH*8 + RH/2)*sc, t, l17.start + l17.dur*.45, 999, .8);
    return s;
  }
  return {scene: null, cam: null, update, overlay, flat: true, noGL: true};
}
