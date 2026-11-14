// node render.mjs <sec> <f0> <f1> <outdir> [chunk]  → outdir/<sec>_c_<start>.mp4（已算好的會跳過）
// node render.mjs test <sec> <t1,t2,...> <outdir>  → 單張 jpg
import { createRequire } from 'module'; const require = createRequire(import.meta.url);
const { chromium } = require('playwright'); import { spawn } from 'child_process'; import fs from 'fs';
const A = process.argv.slice(2); const test = A[0] === 'test';
const sec = test ? A[1] : A[0];
const b = await chromium.launch({args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files']});
const p = await b.newPage({viewport: {width: 1920, height: 1080}});
p.on('pageerror', e => console.log('ERR', e.message)); p.on('console', m => { if (/ERR|rror/.test(m.text())) console.log('LOG', m.text()); });
await p.goto(`file:///home/claude/m2v4/index.html?sec=${sec}`, {waitUntil: 'load'}); await p.waitForFunction(() => window.ready === true, null, {timeout: 180000});
if (test) {
  fs.mkdirSync(A[3], {recursive: true});
  for (const t of A[2].split(',')) { await p.evaluate(([s, t]) => render(s, t), [sec, +t]); await p.screenshot({path: `${A[3]}/${sec}_${t}.jpg`, type: 'jpeg', quality: 85}); }
} else {
  const [f0, f1, out, ch] = [Number(A[1]), Number(A[2]), A[3], Number(A[4] || 240)]; fs.mkdirSync(out, {recursive: true});
  for (let s = f0; s < f1; s += ch) {
    const e = Math.min(f1, s + ch), name = `${out}/${sec}_c_${String(s).padStart(5, '0')}.mp4`; if (fs.existsSync(name)) continue;
    const tmp = name.replace('.mp4', '.tmp.mp4');
    const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', '30', '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '17', '-pix_fmt', 'yuv420p', '-r', '30', tmp], {stdio: ['pipe', 'inherit', 'inherit']});
    const t0 = Date.now();
    for (let i = s; i < e; i++) { await p.evaluate(([sc, t]) => render(sc, t), [sec, i/30]); const buf = await p.screenshot({type: 'jpeg', quality: 92}); if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r)); }
    ff.stdin.end(); await new Promise(r => ff.on('close', r)); fs.renameSync(tmp, name);
    console.log(sec, 'chunk', s, e, ((Date.now() - t0)/(e - s)).toFixed(0), 'ms/f');
  }
}
await b.close();
