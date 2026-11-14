// ===== 2-18～2-21：學校 → 男、女教師宿舍 → 火車橋 → 雜貨店（使用者錄的 Google 街景，加速播放） =====
function buildWalk() {
  const sec = SEC.walk, L = id => sec.lines.find(l => l.id === id), at = (id, k) => L(id).start + k*L(id).dur;
  const C = id => L(id).clauses;
  // [影片時間 τ, 錄影時間 r]：中間走路的地方大約 4 倍速，到宿舍、雜貨店時放慢
  const K = [[0, 0], [1.4, .6], [C('2-18')[1].e - .1, 12.4], [C('2-18')[2].s + .7, 16.0], [L('2-19').start - .15, 18.6], [L('2-19').start + .6, 20.3],
    [L('2-21').start - .2, 22.3], [at('2-21', .26), 24.9], [C('2-21')[1].s + .55, 28.2], [sec.dur, 30.6]];
  const rAt = t => kf(t, K, u => u);
  function update(t) {}
  function bg(t) { return `walk/r_${String(clamp(Math.round(rAt(t)*30) + 1, 1, 921)).padStart(4, '0')}.jpg`; }
  const shower = (x, y, s, op) => op <= 0 ? '' : `<g transform="translate(${x},${y}) scale(${s})" opacity="${op}" stroke="#2A160B" stroke-width="3" stroke-linecap="round"><path d="M-6,-26 v10 M-22,-16 h32 a12,12 0 0 1 -32,0 z" fill="#FFE9C4"/>${[-16, -6, 4].map((dx, i) => `<line x1="${dx}" y1="${2 + i%2*3}" x2="${dx - 4}" y2="${16 + i%2*3}" stroke="#7FC8F0" stroke-width="5"/>`).join('')}</g>`;
  const tag = (x, y, txt, op, col = '#FFF6E6', fs = 66) => TT(x, y, txt, fs, col, 'middle', op);
  function overlay(t) {
    let s = '';
    s += tag(960, 170, '出校門右轉', win(t, .6, C('2-18')[1].s + .2, .3), '#FFE8C8', 58);
    s += tag(960, 170, '紅綠燈過馬路', win(t, C('2-18')[1].s + .3, C('2-18')[2].s + .5, .3), '#FFE8C8', 58);
    s += tag(960, 170, '男教師宿舍', win(t, C('2-18')[2].s + .5, L('2-19').start - .1, .3));
    s += tag(960, 170, '女教師宿舍', win(t, L('2-19').start + .4, L('2-20').start + .1, .3));
    { const o = win(t, L('2-20').start, L('2-21').start - .1, .35); if (o > 0) s += tag(960, 160, '男教師宿舍・女教師宿舍', o, '#FFF6E6', 60) + shower(800, 238, 1.6, o) + TT(990, 258, '都可以洗澡', 58, '#FFE1A6', 'middle', o); }
    s += tag(960, 170, '火車橋', win(t, at('2-21', .12), C('2-21')[1].s + .2, .3), '#FFE8C8', 58);
    { const o = fade(t, C('2-21')[1].s + .3, .35); if (o > 0) s += tag(960, 160, '雜貨店', o) + TT(960, 230, 'Google 地圖：林上商號', 40, '#FFE0B8', 'middle', o*fade(t, C('2-21')[2].s, .35)); }
    s += `<text x="1890" y="868" text-anchor="end" font-family="huninn" font-size="22" fill="#FFF1DF" opacity=".8" stroke="#2A160B" stroke-width="3" paint-order="stroke">影像：Google 街景</text>`;
    return s;
  }
  return {scene: null, cam: null, update, overlay, bg, noGL: true};
}
