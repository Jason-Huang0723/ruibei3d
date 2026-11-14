// node camfit.mjs <cands.json> <outdir>  → 每個候選鏡頭算一張（room1）
import { createRequire } from 'module'; const require = createRequire(import.meta.url);
const { chromium } = require('playwright'); import fs from 'fs';
const [cf, out] = process.argv.slice(2); const C = JSON.parse(fs.readFileSync(cf)); fs.mkdirSync(out, {recursive: true});
const b = await chromium.launch({args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files']});
const p = await b.newPage({viewport: {width: 1920, height: 1080}});
p.on('pageerror', e => console.log('ERR', e.message));
await p.goto(`file:///home/claude/m2v4/index.html?sec=${C.sec || 'room1'}`, {waitUntil: 'load'}); await p.waitForFunction(() => window.ready === true, null, {timeout: 180000});
for (const [i, c] of C.list.entries()) {
  await p.evaluate(([c, t, sec]) => { window.__CAMK = c; return render(sec, t); }, [c, c.t, C.sec || 'room1']);
  await p.screenshot({path: `${out}/c_${String(i).padStart(4, '0')}.jpg`, type: 'jpeg', quality: 80});
}
await b.close();
