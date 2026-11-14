import json, sys, glob, numpy as np, cv2
cand = json.load(open(sys.argv[1]))['list']; d = sys.argv[2]; ref = sys.argv[3]
def prep(f):
    a = cv2.imread(f, cv2.IMREAD_GRAYSCALE); a = cv2.resize(a, (320, 180), interpolation=cv2.INTER_AREA); a = cv2.GaussianBlur(a, (5, 5), 0).astype(float)
    return a[12:140, :]   # 去掉左上編號與下方字幕帶
R = prep(ref); res = []
for i, c in enumerate(cand):
    a = prep(f'{d}/c_{i:04d}.jpg'); res.append((np.abs(a - R).mean(), i, c))
res.sort(key=lambda x: x[0])
for s, i, c in res[:8]: print(round(s, 2), i, c['p1'], c['l'])
