import numpy as np, json, networkx as nx
from PIL import Image
from skimage.morphology import skeletonize
def skel_graph(name, thr=128):
    m=np.array(Image.open(f'/home/claude/v3/assets/mask_{name}.png').convert('L'))>thr
    sk=skeletonize(m); ys,xs=np.nonzero(sk); G=nx.Graph()
    S=set(zip(xs.tolist(),ys.tolist()))
    for x,y in S:
        for dx in (-1,0,1):
            for dy in (-1,0,1):
                if (dx or dy) and (x+dx,y+dy) in S: G.add_edge((x,y),(x+dx,y+dy),weight=(dx*dx+dy*dy)**0.5)
    return G
def nearest(G,p): return min(G.nodes, key=lambda q:(q[0]-p[0])**2+(q[1]-p[1])**2)
def simplify(path, step=6):
    out=[path[0]]; acc=0
    for a,b in zip(path,path[1:]):
        acc+=((a[0]-b[0])**2+(a[1]-b[1])**2)**0.5
        if acc>=step: out.append(b); acc=0
    if out[-1]!=path[-1]: out.append(path[-1])
    return out
res={}
# 共同：學校 → 雜貨店路口
G=skel_graph('black'); comps=list(nx.connected_components(G)); print('black comps',[len(c) for c in comps])
G=G.subgraph(max(comps,key=len)).copy()
a=nearest(G,(210,1272)); b=nearest(G,(322,1102)); res['common']=simplify(nx.shortest_path(G,a,b,weight='weight'))
# 向上：路口 → 往上到底
G=skel_graph('blue'); G=G.subgraph(max(nx.connected_components(G),key=len)).copy()
ends=[n for n in G.nodes if G.degree(n)==1]; a=nearest(G,(322,1102)); far=max(ends,key=lambda q:(q[0]-a[0])**2+(q[1]-a[1])**2)
res['up']=simplify(nx.shortest_path(G,a,far,weight='weight'))
# 八鄰／向右：綠色大圈＋往右的支線
G=skel_graph('green'); comps=list(nx.connected_components(G)); print('green comps',[len(c) for c in comps]); G=G.subgraph(max(comps,key=len)).copy()
ends=[n for n in G.nodes if G.degree(n)==1]; print('green ends',ends[:10])
json.dump(res,open('paths_raw.json','w')); 
for k,v in res.items(): print(k,len(v),v[0],v[-1])
cyc=sorted(nx.cycle_basis(G),key=len,reverse=True); print('cycles',[len(c) for c in cyc[:6]])
main=cyc[0]
# 從雜貨店路口開始、先往右（x 變大）
i0=min(range(len(main)),key=lambda i:(main[i][0]-322)**2+(main[i][1]-1102)**2)
seq=main[i0:]+main[:i0]
if seq[min(30,len(seq)-1)][0] < seq[0][0]: seq=[seq[0]]+seq[1:][::-1]
seq.append(seq[0])
res['loop']=simplify(seq,6)

loop=res['loop']; xs=[p[0] for p in loop]
spur_idx=[i for i,p in enumerate(loop) if p[0]>1045]; print('spur idx',spur_idx[0],spur_idx[-1],len(loop))
res['loop_red']=loop[:spur_idx[0]]+loop[spur_idx[-1]+1:]
json.dump(res,open('paths_raw.json','w'))
for k,v in res.items(): print(k,len(v),v[0],v[-1])
