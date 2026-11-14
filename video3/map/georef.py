import math, json, sys
from PIL import Image
lat0,lon0=23.5255,121.3790
mx=111320*math.cos(math.radians(lat0)); my=110574
Z=18; TX0,TY0=219449,113429
def loc2ph(ex,ny):
    lon=lon0+ex/mx; lat=lat0+ny/my
    X=(lon+180)/360*2**Z*256; r=math.radians(lat); Y=(1-math.log(math.tan(r)+1/math.cos(r))/math.pi)/2*2**Z*256
    return X-TX0*256, Y-TY0*256
def make(S_img,S_loc,P_img,P_loc,W=1458,H=1418,dx=0,dy=0,dth=0,ds=1):
    vi=(P_img[0]-S_img[0], -(P_img[1]-S_img[1])); vr=(P_loc[0]-S_loc[0], P_loc[1]-S_loc[1])
    th=math.atan2(vi[1],vi[0])-math.atan2(vr[1],vr[0])+math.radians(dth); s=math.hypot(*vi)/math.hypot(*vr)*ds
    def img2loc(x,y):
        ddx,ddy=(x-S_img[0])/s, -(y-S_img[1])/s; c,sn=math.cos(-th),math.sin(-th)
        return (S_loc[0]+dx+c*ddx-sn*ddy, S_loc[1]+dy+sn*ddx+c*ddy)
    # affine output(x,y)->input(photo px) from 3 points
    pts=[(0,0),(W,0),(0,H)]; src=[loc2ph(*img2loc(*p)) for p in pts]
    (x0,y0),(x1,y1),(x2,y2)=src
    a=(x1-x0)/W; b=(x2-x0)/H; c=x0; d=(y1-y0)/W; e=(y2-y0)/H; f=y0
    return (a,b,c,d,e,f), img2loc, th, s
if __name__=='__main__':
    p=json.loads(sys.argv[1]) if len(sys.argv)>1 else {}
    A,_,th,s=make((210,1272),(-0.7,2.4),(340,1035),(-186,138),**p)
    ph=Image.open('photo2_z18.jpg')
    out=ph.transform((1458,1418),Image.AFFINE,A,resample=Image.BICUBIC)
    out.save('ortho_rot.jpg',quality=92)
    base=out.convert('RGBA')
    for k,c in [('black',(0,0,0)),('blue',(0,90,255)),('red',(255,40,30)),('green',(120,255,40))]:
        m=Image.open(f'/home/claude/v3/assets/mask_{k}.png').convert('L')
        lay=Image.new('RGBA',base.size,c+(0,)); lay.putalpha(m.point(lambda v: 150 if v>128 else 0)); base=Image.alpha_composite(base,lay)
    base.convert('RGB').resize((972,945)).save('check.jpg',quality=88)
    print('rot',math.degrees(th),'scale',s)
