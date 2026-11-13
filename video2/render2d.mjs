// node render2d.mjs test | all | P3 ...
import { createRequire } from 'module'; const require = createRequire(import.meta.url); const { chromium } = require('playwright');
import { spawn } from 'child_process';
import fs from 'fs';
const DIR = '/home/claude/v2', OUT = DIR + '/out';
fs.mkdirSync(OUT, { recursive: true });
const D = JSON.parse(fs.readFileSync(DIR + '/vo_durs.json', 'utf8'));
const TL = {
  P1: { dur: 4.8, vo: { '01': 0.35 } },
  P2: { dur: 14.6, a1: 3.6, m1: 5.1, f1: 7.4, items: [0, 3.6, 5.1, 7.4, 10.0], vo: { 22: 0.3, 23: 5.15, 24: 7.55 } },
  P3: { dur: 21.2, vo: { 25: 0.3, 26: 2.12, 27: 7.14, 28: 11.31, 29: 16.59 } },
  P4: { dur: 15.7, vo: { 30: 0.3, 31: 3.52, 32: 10.45 } },
  P5: { dur: 35.0, vo: { 33: 0.3, 34: 6.77, 35: 13.38, 36: 16.85, 37: 21.25, 38: 24.91, 39: 31.62 } },
  P6: { dur: 3.8, vo: { 40: 0.3 } },
};
for (const k in TL) { TL[k].d = {}; for (const id in TL[k].vo) TL[k].d[id] = D[id]; }
fs.writeFileSync(OUT + '/tl.json', JSON.stringify(TL, null, 1));
const mode = process.argv[2] || 'test';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
p.on('console', m => console.log('[page]', m.text()));
await p.addInitScript(tl => { window.TL = tl; }, TL);
const http = require('http'), path = require('path');
const MT = { '.html': 'text/html; charset=utf-8', '.jpg': 'image/jpeg', '.png': 'image/png', '.js': 'text/javascript' };
const srv = http.createServer((q, r) => { const f = path.join(DIR, decodeURIComponent(q.url.split('?')[0])); fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'Content-Type': MT[path.extname(f)] || 'application/octet-stream' }); r.end(d); }); }).listen(8765);
await p.goto('http://127.0.0.1:8765/render2d.html');
console.log('loaded', await p.evaluate(() => loadAll(108, 197)));
const grab = async (seg, t, q) => Buffer.from((await p.evaluate(([s, t, q]) => frame(s, t, q), [seg, t, q])).split(',')[1], 'base64');
if (mode === 'test') {
  const shots = (process.argv[3] || 'P1:3,P2:2,P2:4.5,P2:6,P2:11,P3:20,P4:14,P5:5,P5:12,P5:15,P5:19,P5:23,P5:28,P5:33,P6:2.5').split(',');
  fs.mkdirSync(OUT + '/test', { recursive: true });
  for (const s of shots) { const [seg, t] = s.split(':'); fs.writeFileSync(`${OUT}/test/${seg}_${t}.jpg`, await grab(seg, +t, 0.85)); }
} else {
  const PILLS = [['1', '學校正門'], ['2', '校園配置'], ['3', '走進校園'], ['4', '往雜貨店'], ['5', '總複習'], ['6', '早上接小朋友'], ['7', '回家路線']];
  for (const [n, s] of PILLS) fs.writeFileSync(`${OUT}/pill${n}.png`, Buffer.from((await p.evaluate(([n, s]) => pill(n, s), [n, s])).split(',')[1], 'base64'));
  const segs = mode === 'all' ? Object.keys(TL) : mode.split(',');
  for (const seg of segs) {
    const N = Math.round(TL[seg].dur * 30), t0 = Date.now();
    const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', '30', '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '17', '-pix_fmt', 'yuv420p', '-r', '30', `${OUT}/${seg}.mp4`], { stdio: ['pipe', 'inherit', 'inherit'] });
    for (let i = 0; i < N; i++) { const buf = await grab(seg, i / 30, 0.93); if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r)); }
    ff.stdin.end(); await new Promise(r => ff.on('close', r));
    console.log(seg, N, 'frames', ((Date.now() - t0) / 1000).toFixed(1) + 's');
  }
}
await b.close(); srv.close();
