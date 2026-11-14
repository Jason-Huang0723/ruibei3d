// ===== 3D 空拍（瑞北 3D 模型匯出的畫格當底圖），標籤照每格記錄的螢幕座標畫 =====
function buildAer() {
  const sec = SEC.aer, C0 = sec.c0, L = id => sec.lines.find(l => l.id === id);
  const PK = PROBE.keys, IDX = Object.fromEntries(PK.map((k, i) => [k, i]));
  const at = (id, k) => L(id).start + k*L(id).dur;
  const F1 = '#FFF6E6', F2 = '#D8F3F0';
  // [探針名稱, 顯示文字, 出現, 消失, dx, dy, 字色]
  const LB = [
    ['辦公室', '辦公室', at('2-04', .08), L('2-06').start - .1, -210, 0],
    ['樓梯1', '樓梯', at('2-04', .22), L('2-06').start - .1, -210, 0],
    ['四年級教室', '四年級教室', at('2-04', .40), L('2-06').start - .1, -210, 0],
    ['三年級教室', '三年級教室', at('2-04', .52), L('2-06').start - .1, -210, 0],
    ['二年級教室', '二年級教室', at('2-04', .64), L('2-06').start - .1, -210, 0],
    ['一年級教室', '一年級教室', at('2-04', .76), L('2-06').start - .1, -210, 0],
    ['樓梯2', '樓梯', at('2-04', .88), L('2-06').start - .1, -210, 16],
    ['廁所', '廁所', at('2-05', .08), L('2-06').start - .1, -210, -18],
    ['禮堂', '禮堂', at('2-05', .55), 999, -210, 0],
    ['會議室', '二樓　會議室', at('2-06', .16), L('2-07').start + .2, -230, 0, F2],
    ['校長室', '二樓　校長室', at('2-06', .28), L('2-07').start + .2, 230, 0, F2],
    ['圖書室', '二樓　圖書室', at('2-06', .40), L('2-07').start + .2, -230, 0, F2],
    ['英語教室', '二樓　英語教室', at('2-06', .52), L('2-07').start + .2, -230, 0, F2],
    ['五年級教室', '二樓　五年級教室', at('2-06', .68), L('2-07').start + .2, -230, 0, F2],
    ['六年級教室', '二樓　六年級教室', at('2-06', .80), L('2-07').start + .2, -230, 0, F2],
    ['國幼班', '國幼班', at('2-07', .30), 999, 230, 0],
    ['遊樂區', '遊樂區（溜滑梯）', at('2-07', .62), 999, 230, 0],
    ['操場', '操場', at('2-08', .06), 999, 0, -64],
    ['大足球場', '大足球場', at('2-08', .24), 999, 0, -64],
    ['小足球場', '小足球場', at('2-08', .42), 999, 0, -64],
    ['籃球場', '籃球場', at('2-08', .72), 999, 0, -64]];
  // 探針點挪動（公尺，u 往東、v 往南）：用同一格裡其他探針推出每公尺在畫面上的位移
  const SH = {'國幼班': [-13, 0]};
  const P3 = {'國幼班': [60, 61], '遊樂區': [82, 58.5], '大足球場': [58.9, 40.25]};
  function shifted(fr, k) { const g = n => [fr[IDX[n]*3], fr[IDX[n]*3 + 1]], A = g('國幼班'), B = g('遊樂區'), C = g('大足球場');
    const d1 = [B[0] - A[0], B[1] - A[1]], d2 = [C[0] - A[0], C[1] - A[1]], a1 = [P3['遊樂區'][0] - 60, P3['遊樂區'][1] - 61], a2 = [P3['大足球場'][0] - 60, P3['大足球場'][1] - 61];
    const det = a1[0]*a2[1] - a1[1]*a2[0], eu = [(d1[0]*a2[1] - d2[0]*a1[1])/det, (d1[1]*a2[1] - d2[1]*a1[1])/det], ev = [(d2[0]*a1[0] - d1[0]*a2[0])/det, (d2[1]*a1[0] - d1[1]*a2[0])/det];
    const P = g(k), [du, dv] = SH[k]; return [P[0] + du*eu[0] + dv*ev[0], P[1] + du*eu[1] + dv*ev[1]]; }
  function update(t) {}
  const pad5 = n => String(n).padStart(5, '0');
  const frameOf = t => clamp(Math.round((C0 + t)*30), 120, PROBE.frames.length - 1);
  function bg(t) { return `aer/f_${pad5(frameOf(t))}.jpg`; }
  function overlay(t) {
    const fr = PROBE.frames[frameOf(t)]; let s = '';
    for (const [k, txt, a, b, dx, dy, col] of LB) {
      const o = win(t, a, b, .35); if (o <= 0) continue; const i = IDX[k]; if (!fr[i*3 + 2]) continue;
      const [x, y] = SH[k] ? shifted(fr, k) : [fr[i*3], fr[i*3 + 1]], k2 = easeOut(fade(t, a, .45)), dy2 = Math.min(dy, 862 - y), ex = x + dx*k2, ey = y + dy2*k2;
      const anchor = dx < 0 ? 'end' : dx > 0 ? 'start' : 'middle', tx = ex + (dx < 0 ? -12 : dx > 0 ? 12 : 0), ty = ey + (dx === 0 ? -8 : 13);
      s += `<g opacity="${o}"><line x1="${x}" y1="${y}" x2="${ex}" y2="${ey}" stroke="#3A2216" stroke-width="7" stroke-linecap="round" opacity=".55"/><line x1="${x}" y1="${y}" x2="${ex}" y2="${ey}" stroke="${col || F1}" stroke-width="3.5" stroke-linecap="round"/>`;
      s += `<circle cx="${x}" cy="${y}" r="8" fill="${col || F1}" stroke="#3A2216" stroke-width="3.5"/></g>`;
      s += TL_(tx, ty, txt, 38, col || F1, anchor, o);
    }
    s += `<text x="1890" y="868" text-anchor="end" font-family="huninn" font-size="22" fill="#FFF1DF" opacity=".75" stroke="#2A160B" stroke-width="3" paint-order="stroke">空拍影像：內政部國土測繪中心</text>`;
    return s;
  }
  return {scene: null, cam: null, update, overlay, bg, noGL: true};
}
// 標籤字：奶油色＋深棕描邊（不加框）
const TL_ = (x, y, txt, size, col, anchor, op) => op <= 0 ? '' : `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="huninn" font-size="${size}" fill="${col}" stroke="#2A160B" stroke-width="7" paint-order="stroke" stroke-linejoin="round" opacity="${op}">${txt}</text>`;
