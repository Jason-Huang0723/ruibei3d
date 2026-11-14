#!/usr/bin/env python3
"""第四版合成：各段 → 淡入淡出接起來 → 配音音軌 → 成品"""
import json, subprocess, glob, math, os, sys
D = '/home/claude/m2v4'; OUT = D + '/out'
TL = json.load(open(D + '/tl.json')); X = TL['X']
run = lambda a: subprocess.check_call(a)
segs = []
for s in TL['secs']:
    N = math.ceil(s['dur']*30) + 1
    parts = sorted(glob.glob(f"{OUT}/{s['id']}_c_*.mp4"), key=lambda f: int(f.split('_c_')[1][:5]))
    parts = [p for p in parts if not p.endswith('.tmp.mp4')]
    lst = f"{OUT}/{s['id']}_list.txt"; open(lst, 'w').write(''.join(f"file '{p}'\n" for p in parts))
    dst = f"{OUT}/sec_{s['id']}.mp4"
    run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lst, '-c', 'copy', dst])
    n = int(subprocess.check_output(['ffprobe', '-v', 'error', '-count_packets', '-select_streams', 'v:0', '-show_entries', 'stream=nb_read_packets', '-of', 'csv=p=0', dst]).strip())
    f0 = int(parts[0].split('_c_')[1][:5]); s['_f0'] = f0
    print(s['id'], 'frames', n, 'need', N - f0, 'from', f0); assert n >= N - f0 - 1, s['id']
    segs.append(dst)
# 配音
vo = []
for s in TL['secs']:
    tr = s.get('trim', 0)
    for l in s['lines']:
        if l['start'] >= tr: vo.append((l['id'][2:], s['m0'] + l['start'] - tr))
END = TL['END']
args = ['ffmpeg', '-v', 'error', '-y']
for i, _ in vo: args += ['-i', f'{D}/vo7/{i}.wav']
fc = ''.join(f'[{n}:a]aresample=48000,adelay={int(round(t*1000))}:all=1[a{n}];' for n, (i, t) in enumerate(vo))
fc += ''.join(f'[a{n}]' for n in range(len(vo))) + f'amix=inputs={len(vo)}:normalize=0:dropout_transition=0,apad,atrim=0:{END:.3f}[out]'
args += ['-filter_complex', fc, '-map', '[out]', '-ac', '1', '-ar', '48000', OUT + '/vo_track.wav']; run(args)
# 影像：淡入淡出串起來
inp = []
for f in segs: inp += ['-i', f]
inp += ['-i', OUT + '/vo_track.wav']
fc = ''.join(f"[{k}:v]trim=start={max(0, TL['secs'][k].get('trim', 0) - TL['secs'][k]['_f0']/30):.4f},settb=AVTB,setpts=PTS-STARTPTS,fps=30,format=yuv420p[v{k}];" for k in range(len(segs)))
last = 'v0'
for k in range(1, len(segs)):
    off = TL['secs'][k]['m0']; fc += f'[{last}][v{k}]xfade=transition=fade:duration={X}:offset={off:.3f}[x{k}];'; last = f'x{k}'
# 回家路線是沿 OpenStreetMap 的道路描的：那段畫面加上 OSM 標示
SM = {x['id']: x for x in TL['secs']}; mp = SM['map']
t28 = mp['m0'] + [l for l in mp['lines'] if l['id'] == '2-28'][0]['start'] - mp.get('trim', 0) - 0.5; t_end = SM['room2']['m0'] + 0.3
fc += f"[{last}]drawtext=fontfile={D}/fonts/huninn.ttf:text='道路：© OpenStreetMap 貢獻者':fontsize=22:fontcolor=0xFFF1DF@0.8:borderw=3:bordercolor=0x2A160B:x=1890-text_w:y=822:enable='between(t,{t28:.2f},{t_end:.2f})'[osm];"; last = 'osm'
fc = fc.rstrip(';')
out = sys.argv[1] if len(sys.argv) > 1 else OUT + '/final_v7.mp4'
cmd = ['ffmpeg', '-v', 'error', '-stats', '-y'] + inp + ['-filter_complex', fc, '-map', f'[{last}]', '-map', f'{len(segs)}:a', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '19', '-pix_fmt', 'yuv420p', '-r', '30', '-c:a', 'aac', '-b:a', '160k', '-t', f'{END:.3f}', '-movflags', '+faststart', out]
run(cmd); print('done', out, END)
