import json, subprocess, sys
D = '/home/claude/m2v4'; TL = json.load(open(D + '/tl.json')); S = {s['id']: s for s in TL['secs']}
L = {}
for s in TL['secs']:
    tr = s.get('trim', 0)
    for l in s['lines']:
        if l['start'] >= tr and l['id'] not in L: L[l['id']] = (s['m0'] + l['start'] - tr, l)
END = TL['END']
b = [0, S['aer']['m0'] + 0.3, S['table']['m0'] + 0.3, S['walk']['m0'] + 0.3, L['2-23'][0] - 0.5, L['2-26'][0] - 0.5, S['room2']['m0'] + 0.3, END]
names = ['開場・校門口', '空拍・全校配置', '教室用途表格', '宿舍・雜貨店', '早上接小朋友', '回家路線', '結尾']
segs = [[f's0{i+1}', names[i], round(b[i], 3), round(b[i+1], 3)] for i in range(7)]
json.dump(segs, open(D + '/seg/segs.json', 'w'), ensure_ascii=False)
only = sys.argv[1:]
for sid, t, a, e in segs:
    if only and sid not in only: continue
    subprocess.check_call(['ffmpeg', '-v', 'error', '-y', '-ss', str(a), '-i', D + '/out/final_v6.mp4', '-t', str(e - a), '-vf', 'scale=1280:720', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '26', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', f'{D}/seg/{sid}.mp4'])
    lines = [{'id': k, 't': round(v[0] - a, 2), 'text': v[1]['text']} for k, v in sorted(L.items()) if a - 0.01 <= v[0] < e]
    json.dump({'n': int(sid[1:]), 'title': t, 'start': a, 'dur': round(e - a, 3), 'ver': 6, 'lines': lines}, open(f'{D}/seg/doc_{sid}.json', 'w'), ensure_ascii=False)
    print(sid, t, a, e, [l['id'] for l in lines])
