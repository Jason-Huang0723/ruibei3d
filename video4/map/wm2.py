import cv2, numpy as np, sys
def clean(src, out, tmpl, blur, thr_det, thr_mask, crop=None):
    im = cv2.imread(src); g = cv2.cvtColor(im, cv2.COLOR_BGR2GRAY).astype(np.float32)
    hp = g - cv2.GaussianBlur(g, (0, 0), blur); H, W = g.shape
    x0, y0, w, h = tmpl; T = hp[y0:y0+h, x0:x0+w].copy()
    R = cv2.matchTemplate(hp, T, cv2.TM_CCOEFF_NORMED); pts = []; Rc = R.copy()
    while True:
        _, mv, _, ml = cv2.minMaxLoc(Rc)
        if mv < thr_det: break
        pts.append(ml); x, y = ml; Rc[max(0,y-h):y+h, max(0,x-w):x+w] = -1
    def cluster(v):
        v = sorted(v); cl = [[v[0]]]
        for a in v[1:]:
            if a - cl[-1][-1] <= 3: cl[-1].append(a)
            else: cl.append([a])
        return [int(round(np.median(c))) for c in cl]
    xs, ys = cluster([p[0] for p in pts]), cluster([p[1] for p in pts])
    dx, dy = np.median(np.diff(xs)), np.median(np.diff(ys))
    xs = [int(xs[0] - dx)] + xs + [int(xs[-1] + dx)]; ys = [int(ys[0] - dy)] + ys + [int(ys[-1] + dy)]
    full = [(x, y) for x in xs for y in ys if 0 <= x and x + w <= W and 0 <= y and y + h <= H]
    tm = np.median(np.stack([hp[y:y+h, x:x+w] for x, y in full]), axis=0)
    mt = (tm > thr_mask).astype(np.uint8)*255; mt = cv2.dilate(mt, np.ones((3,3),np.uint8), iterations=2)
    M = np.zeros((H, W), np.uint8)
    for x in xs:
        for y in ys:
            ax0, ay0 = max(0, x), max(0, y); ax1, ay1 = min(W, x+w), min(H, y+h)
            if ax1 <= ax0 or ay1 <= ay0: continue
            M[ay0:ay1, ax0:ax1] = np.maximum(M[ay0:ay1, ax0:ax1], mt[ay0-y:ay1-y, ax0-x:ax1-x])
    res = cv2.inpaint(im, M, 3, cv2.INPAINT_TELEA)
    if crop: res = res[crop[1]:crop[3], crop[0]:crop[2]]
    cv2.imwrite(out, res, [cv2.IMWRITE_JPEG_QUALITY, 93]); print(out, len(xs), len(ys), len(full), res.shape)
    return res
clean('photo2_z18.jpg', 'z18_clean.jpg', (1166, 547, 104, 24), 3, 0.4, 3)
r = clean('photo2_z20.jpg', 'z20_clean.jpg', (1300, 805, 400, 70), 6, 0.45, 4, crop=(0, 0, 3760, 3072))
