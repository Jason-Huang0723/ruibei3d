import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

/* ================= 1. 座標、圖磚、快取 ================= */
const RB = window.RB = {};
const q = new URLSearchParams(location.search);
RB.LOW = q.get('q') === 'low' || (q.get('q') !== 'high' && (/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) || (navigator.deviceMemory && navigator.deviceMemory <= 4) || Math.min(innerWidth, innerHeight) < 600));
RB.GEO = { lat0: 23.5255, lon0: 121.3790 };
RB.GEO.mx = 111320 * Math.cos(RB.GEO.lat0 * Math.PI / 180); RB.GEO.my = 110574;
RB.toLocal = (lon, lat) => [(lon - RB.GEO.lon0) * RB.GEO.mx, (lat - RB.GEO.lat0) * RB.GEO.my];
RB.toLL = (x, y) => [RB.GEO.lon0 + x / RB.GEO.mx, RB.GEO.lat0 + y / RB.GEO.my];
RB.lon2x = (lon, z) => (lon + 180) / 360 * 2 ** z;
RB.lat2y = (lat, z) => { const s = Math.sin(lat * Math.PI / 180); return (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * 2 ** z; };
RB.x2lon = (x, z) => x / 2 ** z * 360 - 180;
RB.y2lat = (y, z) => { const n = Math.PI - 2 * Math.PI * y / 2 ** z; return 180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n))); };
RB.pool = async (items, n, fn) => { const res = new Array(items.length); let i = 0; await Promise.all(Array.from({ length: n }, async () => { while (i < items.length) { const k = i++; try { res[k] = await fn(items[k], k); } catch (e) { res[k] = null; } } })); return res; };
// IndexedDB 快取（失敗就不快取）
let dbp = null;
const openDB = () => dbp || (dbp = new Promise(res => { try { const r = indexedDB.open('ruibei3d', 1); r.onupgradeneeded = () => r.result.createObjectStore('kv'); r.onsuccess = () => res(r.result); r.onerror = () => res(null); } catch (e) { res(null); } }));
RB.idbGet = async k => { const db = await openDB(); if (!db) return undefined; return new Promise(res => { try { const t = db.transaction('kv').objectStore('kv').get(k); t.onsuccess = () => res(t.result); t.onerror = () => res(undefined); } catch (e) { res(undefined); } }); };
RB.idbPut = async (k, v) => { const db = await openDB(); if (!db) return false; return new Promise(res => { try { const t = db.transaction('kv', 'readwrite'); t.objectStore('kv').put(v, k); t.oncomplete = () => res(true); t.onerror = () => res(false); } catch (e) { res(false); } }); };
RB.fetchBlob = async url => { let b = await RB.idbGet('u:' + url); if (b) return b; const r = await fetch(url); if (!r.ok) throw new Error(r.status + ' ' + url); b = await r.blob(); RB.idbPut('u:' + url, b); return b; };
RB.wmts = (layer, z, x, y) => 'https://wmts.nlsc.gov.tw/wmts/' + layer + '/default/GoogleMapsCompatible/' + z + '/' + y + '/' + x;
RB.tileBitmap = async (layer, z, x, y) => { try { return await createImageBitmap(await RB.fetchBlob(RB.wmts(layer, z, x, y))); } catch (e) { return null; } };
RB.mosaic = async (layer, z, xmin, xmax, ymin, ymax, onp) => {
  const [lonA, latA] = RB.toLL(xmin, ymax), [lonB, latB] = RB.toLL(xmax, ymin);
  const px0 = RB.lon2x(lonA, z) * 256, py0 = RB.lat2y(latA, z) * 256, px1 = RB.lon2x(lonB, z) * 256, py1 = RB.lat2y(latB, z) * 256;
  const W = Math.round(px1 - px0), H = Math.round(py1 - py0); const cv = new OffscreenCanvas(W, H); const g = cv.getContext('2d', { willReadFrequently: true });
  const L = []; for (let y = Math.floor(py0 / 256); y <= Math.floor((py1 - 1) / 256); y++) for (let x = Math.floor(px0 / 256); x <= Math.floor((px1 - 1) / 256); x++) L.push([x, y]);
  let done = 0; await RB.pool(L, 12, async ([x, y]) => { const bm = await RB.tileBitmap(layer, z, x, y); if (bm) g.drawImage(bm, x * 256 - px0, y * 256 - py0); if (onp && ++done % 20 === 0) onp(done / L.length); });
  return { cv, g, W, H, px0, py0, z };
};
RB.terrainGrid = async (z, xmin, xmax, ymin, ymax, nx, ny) => {
  const [lonA, latA] = RB.toLL(xmin, ymax), [lonB, latB] = RB.toLL(xmax, ymin);
  const tx0 = Math.floor(RB.lon2x(lonA, z)), ty0 = Math.floor(RB.lat2y(latA, z)), tx1 = Math.floor(RB.lon2x(lonB, z)), ty1 = Math.floor(RB.lat2y(latB, z));
  const W = (tx1 - tx0 + 1) * 256, H = (ty1 - ty0 + 1) * 256; const cv = new OffscreenCanvas(W, H); const g = cv.getContext('2d', { willReadFrequently: true });
  const L = []; for (let y = ty0; y <= ty1; y++) for (let x = tx0; x <= tx1; x++) L.push([x, y]);
  await RB.pool(L, 8, async ([x, y]) => { const b = await RB.fetchBlob('https://s3.amazonaws.com/elevation-tiles-prod/terrarium/' + z + '/' + x + '/' + y + '.png'); const bm = await createImageBitmap(b, { colorSpaceConversion: 'none', premultiplyAlpha: 'none' }); g.drawImage(bm, (x - tx0) * 256, (y - ty0) * 256); });
  const d = g.getImageData(0, 0, W, H).data; const E = new Float32Array(W * H); for (let i = 0; i < W * H; i++) E[i] = d[i * 4] * 256 + d[i * 4 + 1] + d[i * 4 + 2] / 256 - 32768;
  const smp = (gx, gy) => { gx = Math.max(0, Math.min(W - 1.001, gx)); gy = Math.max(0, Math.min(H - 1.001, gy)); const x0 = Math.floor(gx), y0 = Math.floor(gy), fx = gx - x0, fy = gy - y0, i = y0 * W + x0; return E[i] * (1 - fx) * (1 - fy) + E[i + 1] * fx * (1 - fy) + E[i + W] * (1 - fx) * fy + E[i + W + 1] * fx * fy; };
  const out = new Float32Array(nx * ny);
  for (let j = 0; j < ny; j++) { const yl = ymax - (ymax - ymin) * j / (ny - 1); for (let i = 0; i < nx; i++) { const xl = xmin + (xmax - xmin) * i / (nx - 1); const [lon, lat] = RB.toLL(xl, yl); out[j * nx + i] = smp(RB.lon2x(lon, z) * 256 - tx0 * 256 - 0.5, RB.lat2y(lat, z) * 256 - ty0 * 256 - 0.5); } }
  return { E: out, nx, ny, xmin, xmax, ymin, ymax };
};
