// ===== 2-19～2-22：學校 → 男、女教師宿舍 → 火車橋 → 雜貨店（使用者 11/14 14:33 錄的 Google 街景，加速播放） =====
function buildWalk() {
  const sec = SEC.walk, L = id => sec.lines.find(l => l.id === id), at = (id, k) => L(id).start + k*L(id).dur;
  const C = id => L(id).clauses;
  const RM = 12.8, RF = 17.3;   // 男、女教師宿舍停下來的那一格（錄影秒數）
  // [影片時間 τ, 錄影時間 r]：走路的地方大約 4 倍速，到宿舍停住、到雜貨店放慢
  const K = [[0, 0], [1.3, .4], [C('2-19')[1].e - .1, 9.6], [C('2-19')[2].s + .6, RM], [L('2-20').start - .2, RM], [L('2-20').start + .6, RF],
    [L('2-22').start - .2, RF], [at('2-22', .25), 20.3], [C('2-22')[1].s + .5, 24.2], [sec.dur, 26.7]];
  const rAt = t => kf(t, K, u => u*u*(3 - 2*u)*.4 + u*.6);
  const fr = r => `walk/r_${String(clamp(Math.round(r*30) + 1, 1, 804)).padStart(4, '0')}.jpg`;
  function update(t) {}
  function bg(t) { return fr(rAt(t)); }
  const shower = (x, y, s, op) => op <= 0 ? '' : `<g transform="translate(${x},${y}) scale(${s})" opacity="${op}" stroke="#2A160B" stroke-width="3" stroke-linecap="round"><path d="M-6,-26 v10 M-22,-16 h32 a12,12 0 0 1 -32,0 z" fill="#FFE9C4"/>${[-16, -6, 4].map((dx, i) => `<line x1="${dx}" y1="${2 + i%2*3}" x2="${dx - 4}" y2="${16 + i%2*3}" stroke="#7FC8F0" stroke-width="5"/>`).join('')}</g>`;
  const tag = (x, y, txt, op, col = '#FFF6E6', fs = 66) => TT(x, y, txt, fs, col, 'middle', op);
  // 指向入口的箭頭（奶油色＋深棕外框）
  const door = (lx, ly, x1, y1, op, k) => { if (op <= 0) return ''; const mx = (lx + x1)/2, my = Math.min(ly, y1) - 60, d = `M${lx},${ly} Q${mx},${my} ${x1},${y1}`, a = Math.atan2(y1 - my, x1 - mx), h = (q) => `${x1 - 26*Math.cos(a + q)},${y1 - 26*Math.sin(a + q)}`;
    return `<g opacity="${op}" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="${d}" stroke="#2A160B" stroke-width="13" stroke-dasharray="${600*k} 600"/><path d="${d}" stroke="#FFE1A6" stroke-width="7" stroke-dasharray="${600*k} 600"/>` +
      (k > .95 ? `<path d="M${h(.5)} L${x1},${y1} L${h(-.5)}" stroke="#2A160B" stroke-width="13"/><path d="M${h(.5)} L${x1},${y1} L${h(-.5)}" stroke="#FFE1A6" stroke-width="7"/>` : '') + `</g>`; };
  const POL = (x, y, src, name, op, r, w = 430) => { if (op <= 0) return ''; const h = w*1080/1920, sl = (1 - easeOut(op))*60;
    return `<g opacity="${op}" transform="translate(${x},${y + sl}) rotate(${r})"><rect x="${-w/2 - 4}" y="${-h/2 + 10}" width="${w + 28}" height="${h + 88}" fill="#1a0d06" opacity=".35" filter="url(#soft)"/><rect x="${-w/2 - 14}" y="${-h/2 - 14}" width="${w + 28}" height="${h + 84}" fill="#FFF8EC"/>
      <image href="${src}" x="${-w/2}" y="${-h/2}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice"/><text x="0" y="${h/2 + 50}" text-anchor="middle" font-family="huninn" font-size="38" fill="#7A4A2A">${name}</text></g>`; };
  function overlay(t) {
    let s = '';
    s += tag(960, 170, '出校門右轉', win(t, .6, C('2-19')[1].s + .2, .3), '#FFE8C8', 58);
    s += tag(960, 170, '紅綠燈過馬路', win(t, C('2-19')[1].s + .3, C('2-19')[2].s + .45, .3), '#FFE8C8', 58);
    // 男教師宿舍＋入口
    { const a = C('2-19')[2].s + .55, b = L('2-20').start - .15, o = win(t, a, b, .3); if (o > 0) { s += tag(960, 160, '男教師宿舍', o); const k = clamp((t - a - .4)/.5, 0, 1); s += door(1330, 300, 1095, 330, o, k) + TL_(1350, 315, '入口', 50, '#FFE1A6', 'start', o*fade(t, a + .4, .3)); } }
    // 女教師宿舍＋入口
    { const a = L('2-20').start + .6, b = L('2-22').start - .25, o = win(t, a, b, .3); if (o > 0) { s += tag(960, 160, '女教師宿舍', o*(1 - fade(t, L('2-21').start - .1, .3))); const k = clamp((t - a - .3)/.5, 0, 1); s += door(400, 400, 622, 452, o, k) + TL_(380, 415, '入口', 50, '#FFE1A6', 'end', o*fade(t, a + .3, .3)); } }
    // 2-21：兩間都可以洗澡（兩張停格照片）
    { const o = win(t, L('2-21').start - .05, L('2-22').start - .2, .35); if (o > 0) { s += `<rect width="1920" height="1080" fill="#1A0D06" opacity="${.5*o}"/>` + POL(560, 470, fr(RM), '男教師宿舍', o, -2.5) + POL(1360, 470, fr(RF), '女教師宿舍', o, 2);
      s += shower(820, 150, 1.7, o) + TT(1000, 172, '兩間都可以洗澡', 62, '#FFE1A6', 'middle', o); } }
    s += tag(960, 170, '火車橋', win(t, at('2-22', .12), C('2-22')[1].s + .2, .3), '#FFE8C8', 58);
    { const o = fade(t, C('2-22')[1].s + .3, .35); if (o > 0) s += tag(960, 160, '雜貨店', o) + TT(960, 230, 'Google 地圖：林上商號', 40, '#FFE0B8', 'middle', o*fade(t, C('2-22')[2].s, .35)); }
    s += `<text x="1890" y="868" text-anchor="end" font-family="huninn" font-size="22" fill="#FFF1DF" opacity=".8" stroke="#2A160B" stroke-width="3" paint-order="stroke">影像：Google 街景</text>`;
    return s;
  }
  return {scene: null, cam: null, update, overlay, bg, noGL: true};
}
