#!/usr/bin/env python3
"""Build global timeline → VO track (wav), ASS subtitles, ffmpeg filter for final video."""
import json, re, subprocess, os, sys
V = '/home/claude/v2'; UP = '/mnt/user-data/uploads/Downloads/37必修課重做/必修2'
OUT = V + '/out'
D = json.load(open(V + '/vo_durs.json'))
S = json.load(open(V + '/script.json'))
S = {k: v for k, v in (S.items() if isinstance(S, dict) else [(x[0], x[1]) for x in S])}
TL = json.load(open(OUT + '/tl.json'))

def dur(f):
    return float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).strip())

SEGS = [('P1', OUT + '/P1.mp4'), ('v2a', UP + '/v2a.mp4'), ('v2b', UP + '/v2b.mp4'), ('P2', OUT + '/P2.mp4'),
        ('P3', OUT + '/P3.mp4'), ('P4', OUT + '/P4.mp4'), ('P5', OUT + '/P5.mp4'), ('P6', OUT + '/P6.mp4')]
# 3D 片段內的 VO 錨點（RB.compile 算出來的 sc.vo）
A3 = {'v2a': {'02': 0.35, '03': 5.031, '04': 8.436, '05': 16.121, '06': 20.167, '07': 24.044, '08': 28.079, '09': 39.049,
              '10': 45.883, '11': 51.084, '12': 59.588, '13': 65.961, '14': 78.291, '15': 87.252, '16': 96.841, '17': 104.585,
              '18': 114.010, '19': 120.699},
      'v2b': {'20': 12.148, '21': 16.892}}
base, t = {}, 0.0
for k, f in SEGS:
    # 用畫格數算長度，避免 container duration 的小誤差累積
    n = int(subprocess.check_output(['ffprobe', '-v', 'error', '-count_packets', '-select_streams', 'v:0', '-show_entries', 'stream=nb_read_packets', '-of', 'csv=p=0', f]).strip())
    base[k] = (t, n / 30.0); t += n / 30.0
TOTAL = t
VO = {}
for k in base:
    src = A3.get(k) or {i: x for i, x in TL[k]['vo'].items()}
    for i, x in src.items():
        VO[i.zfill(2)] = base[k][0] + x
assert len(VO) == 40, sorted(VO)
ids = sorted(VO)
for a, b in zip(ids, ids[1:]):
    if VO[a] + D[a] > VO[b] - 0.05: print('overlap!', a, b, VO[a] + D[a], VO[b])

# ---- ASS ----
def ts(x):
    x = max(0, x); h = int(x // 3600); m = int(x % 3600 // 60); s = x % 60
    return f'{h}:{m:02d}:{s:05.2f}'
ass = ['[Script Info]', 'ScriptType: v4.00+', 'PlayResX: 1920', 'PlayResY: 1080', 'WrapStyle: 2', 'ScaledBorderAndShadow: yes', '',
       '[V4+ Styles]', 'Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding',
       'Style: Sub,Noto Sans CJK TC,58,&H00FFFFFF,&H00FFFFFF,&H00000000,&H00000000,-1,0,0,0,100,100,2,0,1,0,0,2,60,60,44,1',
       'Style: Id,Noto Sans CJK TC,30,&H40FFFFFF,&H40FFFFFF,&H90000000,&H00000000,-1,0,0,0,100,100,1,0,1,2,0,9,40,40,34,1', '',
       '[Events]', 'Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text']
for n, i in enumerate(ids):
    txt = S[i]; t0 = VO[i]; d = D[i]
    nxt = VO[ids[n + 1]] if n + 1 < len(ids) else TOTAL
    parts = [p for p in re.split(r'[，：]', txt) if p]
    w = [len(re.sub(r'[、，。：]', '', p)) + 1.2 for p in parts]
    tw = sum(w); c = t0
    for j, (p, ww) in enumerate(zip(parts, w)):
        e = c + d * ww / tw
        end = e if j < len(parts) - 1 else min(nxt - 0.02, e + 0.6)
        ass.append(f'Dialogue: 1,{ts(c)},{ts(end)},Sub,,0,0,0,,{p}')
        c = e
    ass.append(f'Dialogue: 0,{ts(t0)},{ts(min(nxt, TOTAL))},Id,,0,0,0,,2-{i}')
open(OUT + '/subs.ass', 'w').write('\n'.join(ass) + '\n')

# ---- VO 音軌 ----
args = ['ffmpeg', '-v', 'error', '-y']
for i in ids: args += ['-i', f'{UP}/vo/{i}.wav']
fc = ''.join(f'[{n}:a]aresample=48000,adelay={int(round(VO[i] * 1000))}:all=1[a{n}];' for n, i in enumerate(ids))
fc += ''.join(f'[a{n}]' for n in range(len(ids))) + f'amix=inputs={len(ids)}:normalize=0:dropout_transition=0,apad,atrim=0:{TOTAL:.3f},volume=1.0[out]'
args += ['-filter_complex', fc, '-map', '[out]', '-ac', '1', '-ar', '48000', OUT + '/vo_track.wav']
subprocess.check_call(args)

# ---- 章節標籤時間 ----
b = lambda k: base[k][0]
PILL = [(1, 0, b('v2a') + 5.0), (2, b('v2a') + 5.0, b('v2a') + 38.9), (3, b('v2a') + 38.9, b('P2')), (4, b('P2'), b('P3')),
        (5, b('P3'), b('P4')), (6, b('P4'), b('P5')), (7, b('P5'), b('P6'))]
json.dump({'base': base, 'total': TOTAL, 'vo': VO, 'pill': PILL}, open(OUT + '/global.json', 'w'), indent=1)

# ---- 最後合成指令 ----
inp = []
for k, f in SEGS: inp += ['-i', f]
for n, a, e in PILL: inp += ['-loop', '1', '-framerate', '30', '-t', f'{TOTAL:.3f}', '-i', f'{OUT}/pill{n}.png']
inp += ['-i', OUT + '/vo_track.wav']
NS = len(SEGS)
fc = ''.join(f'[{n}:v]setpts=PTS-STARTPTS,fps=30,format=yuv420p,setsar=1[s{n}];' for n in range(NS))
fc += ''.join(f'[s{n}]' for n in range(NS)) + f'concat=n={NS}:v=1:a=0[cat];'
fc += '[cat]drawbox=x=0:y=930:w=1920:h=150:color=black@1:t=fill[v0];'
last = 'v0'
for j, (n, a, e) in enumerate(PILL):
    fc += f"[{last}][{NS + j}:v]overlay=0:0:shortest=0:eof_action=pass:enable='between(t,{a:.3f},{e - 0.001:.3f})'[p{j}];"; last = f'p{j}'
fc += f"[{last}]ass={OUT}/subs.ass:fontsdir=/usr/share/fonts[vout]"
cmd = ['ffmpeg', '-v', 'error', '-stats', '-y'] + inp + ['-filter_complex', fc, '-map', '[vout]', '-map', f'{NS + len(PILL)}:a',
       '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '19', '-pix_fmt', 'yuv420p', '-r', '30', '-c:a', 'aac', '-b:a', '160k',
       '-t', f'{TOTAL:.3f}', '-movflags', '+faststart', OUT + '/final.mp4']
open(OUT + '/final_cmd.json', 'w').write(json.dumps(cmd))
print('TOTAL', round(TOTAL, 3)); print({k: [round(x, 3) for x in v] for k, v in base.items()})
