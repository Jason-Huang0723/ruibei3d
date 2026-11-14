// node render2d.mjs test | all | P3 ...
import { createRequire } from 'module'; const require = createRequire(import.meta.url); const { chromium } = require('playwright');
import { spawn } from 'child_process';
import fs from 'fs';
const DIR = process.env.V3 || '/home/claude/v3', OUT = DIR + '/out';
fs.mkdirSync(OUT, { recursive: true });
const D = JSON.parse(fs.readFileSync(DIR + '/vo_durs.json', 'utf8'));
const PTvo = {}; { let t = 0.3; for (const id of ['09', '10', '11', '12', '13', '14', '15', '16', '17']) { PTvo[id] = +t.toFixed(3); t += D[id] + 0.4; } }
const PTend = PTvo['17'] + D['17'];
const TL = {
  P1: { dur: 4.8, vo: { '01': 0.35 } },
  PT: { dur: +(PTend + 1.3).toFixed(2), endHL: +(PTend + 0.3).toFixed(2), vo: PTvo },
  P2: { dur: 17.2, a1: 3.6, m1: 5.1, s1: 7.45, f1: 10.15, items: [0, 3.6, 5.1, 10.15, 12.9], vo: { 18: 0.3, 19: 5.15, 20: 7.6, 21: 10.45 } },
  P4: { dur: 15.7, vo: { 22: 0.3, 23: 3.52, 24: 10.45 } },
  P5: { dur: 35.0, vo: { 25: 0.3, 26: 6.77, 27: 13.38, 28: 16.85, 29: 21.25, 30: 24.91, 31: 31.62 } },
  P6: { dur: 3.8, vo: { 32: 0.3 } },
};
for (const k in TL) { TL[k].d = {}; for (const id in TL[k].vo) TL[k].d[id] = D[id]; }
fs.writeFileSync(OUT + '/tl.json', JSON.stringify(TL, null, 1));
const mode = process.argv[2] || 'test';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
p.on('console', m => console.log('[page]', m.text()));
await p.addInitScript(([tl, rt]) => { window.TL = tl; window.ROUTES = rt; }, [TL, JSON.parse(fs.readFileSync(DIR + '/routes.json', 'utf8'))]);
const http = require('http'), path = require('path');
const MT = { '.html': 'text/html; charset=utf-8', '.jpg': 'image/jpeg', '.png': 'image/png', '.js': 'text/javascript' };
const srv = http.createServer((q, r) => { const f = path.join(DIR, decodeURIComponent(q.url.split('?')[0])); fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'Content-Type': MT[path.extname(f)] || 'application/octet-stream' }); r.end(d); }); }).listen(8765);
await p.goto('http://127.0.0.1:8765/render2d.html');
console.log('loaded', await p.evaluate(() => loadAll(108, 197)));
const grab = async (seg, t, q) => Buffer.from((await p.evaluate(([s, t, q]) => frame(s, t, q), [seg, t, q])).split(',')[1], 'base64');
if (mode === 'test') {
  const shots = (process.argv[3] || 'PT:5,PT:20,PT:39,P2:8.5,P2:13,P5:15,P5:19,P5:23.5,P5:28,P5:33').split(',');
  fs.mkdirSync(OUT + '/test', { recursive: true });
  for (const s of shots) { const [seg, t] = s.split(':'); fs.writeFileSync(`${OUT}/test/${seg}_${t}.jpg`, await grab(seg, +t, 0.85)); }
} else {
  const PILLS = [['1', '學校正門'], ['2', '校園配置'], ['3', '教室用途'], ['4', '往雜貨店'], ['5', '早上接小朋友'], ['6', '回家路線']];
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
