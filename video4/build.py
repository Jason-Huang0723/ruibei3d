import json, os
D = os.path.dirname(os.path.abspath(__file__))
TL = json.load(open(f'{D}/tl.json'))
# core.js 需要 TL.lines、TL.END：給它所有句子（各段的本地時間）
TL['lines'] = [l for s in TL['secs'] for l in s['lines']]
SEC = {s['id']: s for s in TL['secs']}
probe = json.load(open(f'{D}/aer/probe.json')); probe.pop('vo', None)
mapd = json.load(open(f'{D}/map/mapdata2.json'))
src = ['core.js', 'm3d.js', 'props.js', 'props2.js', 'ui.js', 'sc_room2.js', 'sc_aer.js', 'sc_table.js', 'sc_walk.js', 'sc_map2.js', 'main.js']
js = '\n'.join(open(f'{D}/src/{f}').read() for f in src)
html = """<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:'huninn';src:url('fonts/huninn.ttf')}
html,body{margin:0;width:1920px;height:1080px;overflow:hidden;background:#000}
#gl,#gl canvas{position:absolute;left:0;top:0;width:1920px;height:1080px;z-index:0}
#ph{position:absolute;left:0;top:0;width:1920px;height:1080px;z-index:1;display:none}
svg{position:absolute;left:0;top:0;z-index:2;font-family:'Noto Sans CJK TC',sans-serif}
</style></head><body><div id="gl"></div><img id="ph"><svg id="sv" width="1920" height="1080" viewBox="0 0 1920 1080"></svg>
<script src="v3/three.min.js"></script><script>
const TL = """ + json.dumps(TL, ensure_ascii=False) + ";\nconst SEC = " + json.dumps(SEC, ensure_ascii=False) + ";\nconst PROBE = " + json.dumps(probe) + ";\nconst MAPD = " + json.dumps(mapd) + ";\n" + js + "\n</script></body></html>"
open(f'{D}/index.html', 'w').write(html); print('index.html', len(html))
