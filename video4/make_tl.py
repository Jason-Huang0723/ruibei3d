import json, re, subprocess
D = json.load(open('vo_durs7.json')); S = dict(json.load(open('script6.json')))
P = json.load(open('aer/probe.json')); VO3 = {v['id']: v['t'] for v in P['vo']}
X = 0.6            # 段落之間淡入淡出
C0 = 5.7           # 3D 空拍片段從第幾秒開始用（第七版配音變慢，2-02 結尾在 5.97 秒）
def clauses(i, t0):
    txt = S[i]; parts = [p for p in re.split(r'[，：]', txt) if p]
    # 太短的合併（用全形空白）
    m = []
    for p in parts:
        if m and (len(m[-1]) <= 5 or len(p) <= 4) and len(m[-1]) + len(p) <= 16: m[-1] += '　' + p
        else: m.append(p)
    w = [len(re.sub(r'[、，。：　]', '', p)) + 1.0 for p in m]; tw = sum(w); c = t0; out = []
    for p, ww in zip(m, w):
        e = c + D[i] * ww / tw; out.append({'text': p.replace('Google', 'Google '), 's': round(c, 3), 'e': round(e, 3)}); c = e
    return out
def seq(ids, lead, gap, extra={}):
    t = lead; L = []
    for i in ids:
        t += extra.get(i, 0)
        L.append({'id': '2-' + i, 'text': S[i], 'start': round(t, 3), 'dur': D[i], 'clauses': clauses(i, t)}); t += D[i] + gap
    return L, t - gap
secs = []
L, e = seq(['01', '02'], 0.7, 0.75); L[0]['nosub'] = True; secs.append({'id': 'room1', 'lines': L, 'dur': round(e + 1.15, 3)})
L = [{'id': '2-' + i, 'text': S[i], 'start': round(VO3[i] - C0, 3), 'dur': D[i], 'clauses': clauses(i, VO3[i] - C0)} for i in ['03', '04', '05', '06', '07', '08']]
secs.append({'id': 'aer', 'lines': L, 'dur': round(P['dur'] - C0, 3), 'c0': C0})
L, e = seq(['09', '10', '11', '12', '13', '14', '15', '16', '17', '18'], 0.8, 0.5, {'10': 0.3, '16': 0.4}); secs.append({'id': 'table', 'lines': L, 'dur': round(e + 1.3, 3)})
ids = ['%02d' % k for k in range(19, 33)]
L, e = seq(ids, 0.9, 0.5, {'20': 0.6, '21': 0.3, '22': 0.2, '23': 0.9, '24': 0.4, '25': 0.4, '26': 0.9, '27': 0.3, '28': 0.4, '29': 0.4, '30': 0.4, '31': 0.4, '32': 0.5})
L22 = [l for l in L if l['id'] == '2-23'][0]['start']; CUT = round(L22 - 1.0, 3)
# 第四版改：2-18～2-21 改成使用者錄的街景（walk 段）；地圖段從 2-22 前一秒開始用（trim）
secs.append({'id': 'walk', 'lines': [l for l in L if l['id'] <= '2-22'], 'dur': round(CUT + X, 3)})
secs.append({'id': 'map', 'lines': L, 'dur': round(e + 1.3, 3), 'trim': CUT})
secs.append({'id': 'room2', 'lines': [], 'num': '2-32', 'dur': 3.9})
M = 0
for s in secs: s['m0'] = round(M, 3); M += s['dur'] - s.get('trim', 0) - X
END = round(M + X, 3)
json.dump({'X': X, 'END': END, 'secs': secs}, open('tl.json', 'w'), ensure_ascii=False, indent=1)
for s in secs: print(s['id'], s['m0'], s['dur'], [(l['id'], l['start']) for l in s['lines']])
print('END', END)
