"""Estudos V6, com projeção ortográfica, materiais e rotas desenhados em pixels."""
from pathlib import Path
import math, random, unicodedata
from PIL import Image, ImageDraw
import numpy as np
from scipy.ndimage import distance_transform_edt, gaussian_filter
from letras import FONT

HERE=Path(__file__).resolve().parent
W,H=512,384
N='#102c43'; IV='#fff0cf'; G='#f4c977'
CRAB=Image.open(HERE/'siri-seletor.png').convert('RGBA')
Y,X=np.indices((H,W))
def box(d,x,y,w,h,c):
    if w>0 and h>0:d.rectangle((x,y,x+w-1,y+h-1),fill=c)
def poly(d,pts,c,x=0,y=0):d.polygon([(a+x,b+y) for a,b in pts],fill=c)
def ln(d,pts,c,w=1):d.line(pts,fill=c,width=w)
def rgb(h):return tuple(bytes.fromhex(h[1:]))
def word(d,x,y,s,c=IV,sz=1):
    for raw in s.upper():
        z=unicodedata.normalize('NFD',raw); ch=z[0]
        for v,row in enumerate(FONT.get(ch,'').split()):
            for u,k in enumerate(row):
                if k=='1':box(d,x+u*sz,y+v*sz,sz,sz,c)
        if len(z)>1:
            if raw=='Ç':box(d,x+2*sz,y+7*sz,sz,sz,c)
            else:box(d,x+2*sz,y-2*sz,2*sz,sz,c)
        x+=sz*(4 if ch==' ' else 6)
def footprint(points):
    m=Image.new('L',(W,H));ImageDraw.Draw(m).polygon(points,fill=255)
    return np.asarray(m)>0
def moved(points,dx,dy):return [(x+dx,y+dy) for x,y in points]

# Cada terreno é uma planta ortogonal explicitamente diferente. Os vazios e
# perspectivas vêm das margens recortadas e dos volumes que se sobrepõem.
PLAN=[
 [([(22,151),(37,151),(37,119),(67,119),(67,90),(106,90),(106,75),(170,75),(170,88),(202,88),(202,112),(229,112),(229,143),(254,143),(254,210),(221,210),(221,241),(180,241),(180,264),(121,264),(121,279),(78,279),(78,262),(51,262),(51,240),(30,240),(30,215),(22,215)],8),
  ([(291,113),(308,113),(308,86),(346,86),(346,69),(408,69),(408,83),(450,83),(450,112),(481,112),(481,161),(470,161),(470,191),(427,191),(427,215),(383,215),(383,228),(341,228),(341,209),(306,209),(306,191),(291,191)],18),
  ([(281,264),(301,264),(301,245),(333,245),(333,250),(365,250),(365,268),(388,268),(388,291),(367,291),(367,313),(333,313),(333,325),(296,325),(296,314),(266,314),(266,286),(281,286)],5)],
 [([(29,117),(58,117),(58,93),(106,93),(106,81),(164,81),(164,98),(181,98),(181,129),(197,129),(197,179),(175,179),(175,198),(146,198),(146,221),(90,221),(90,203),(54,203),(54,180),(29,180)],19),
  ([(206,85),(236,85),(236,63),(278,63),(278,54),(341,54),(341,73),(369,73),(369,95),(392,95),(392,141),(362,141),(362,162),(309,162),(309,178),(247,178),(247,161),(217,161),(217,143),(206,143)],24),
  ([(330,208),(354,208),(354,189),(385,189),(385,176),(438,176),(438,186),(472,186),(472,205),(489,205),(489,256),(471,256),(471,288),(437,288),(437,303),(376,303),(376,286),(349,286),(349,267),(327,267),(327,239),(330,239)],14),
  ([(106,263),(137,263),(137,248),(175,248),(175,258),(200,258),(200,279),(218,279),(218,305),(184,305),(184,319),(136,319),(136,309),(106,309)],7)],
 [([(32,113),(57,113),(57,84),(103,84),(103,67),(154,67),(154,82),(183,82),(183,100),(210,100),(210,122),(197,122),(197,166),(168,166),(168,193),(140,193),(140,213),(97,213),(97,198),(66,198),(66,181),(32,181)],9),
  ([(281,97),(306,97),(306,76),(363,76),(363,89),(404,89),(404,103),(455,103),(455,128),(483,128),(483,174),(463,174),(463,195),(425,195),(425,220),(390,220),(390,231),(347,231),(347,206),(317,206),(317,170),(285,170),(285,150),(260,150),(260,121),(281,121)],16),
  ([(90,266),(121,266),(121,231),(162,231),(162,208),(209,208),(209,178),(242,178),(242,162),(266,162),(266,192),(293,192),(293,218),(314,218),(314,251),(344,251),(344,281),(318,281),(318,308),(281,308),(281,327),(222,327),(222,315),(181,315),(181,325),(140,325),(140,312),(106,312),(106,287),(90,287)],7)],
 [([(34,223),(55,223),(55,193),(87,193),(87,164),(113,164),(113,146),(145,146),(145,126),(188,126),(188,141),(217,141),(217,178),(236,178),(236,221),(210,221),(210,257),(176,257),(176,277),(143,277),(143,289),(92,289),(92,275),(55,275),(55,251),(34,251)],12),
  ([(199,122),(228,122),(228,102),(257,102),(257,82),(292,82),(292,61),(340,61),(340,49),(396,49),(396,61),(446,61),(446,80),(477,80),(477,121),(465,121),(465,153),(435,153),(435,176),(398,176),(398,192),(360,192),(360,231),(331,231),(331,253),(286,253),(286,238),(252,238),(252,202),(232,202),(232,174),(207,174),(207,149),(199,149)],29)]
]
SEA=[
 ['#0e3859','#12516d','#186782','#26829b','#3da3aa','#66bbb5','#97d1bc','#b5dfc8'],
 ['#103a5e','#135773','#226f89','#318ba1','#51a8ab','#71b9af','#a1d2b6','#c3dfb8'],
 ['#123948','#18505a','#1b6164','#287876','#459288','#64a38f','#8bb89d','#b7c7aa'],
 ['#163951','#1b4d65','#26667f','#317e91','#3b999e','#5babac','#8ac2b7','#aed2b6']]
TERRAIN=[
 ['#54433e','#8e624e','#a87651','#bc8a5d','#e4b67b','#efc885','#f8dfa2'],
 ['#414c5b','#606375','#777a84','#919384','#bfb998','#d6c39a','#e7d3aa'],
 ['#333f39','#55604b','#697052','#858253','#7d955c','#9aa26b','#c1b57e'],
 ['#534a4d','#73645e','#8d7565','#a48c72','#a8a276','#c4b78e','#e0c896']]
def water(idx, plans, rng):
    land=np.zeros((H,W),dtype=bool)
    for p,h in plans:land |= footprint(moved(p,0,h))
    dist=distance_transform_edt(~land)
    smooth=gaussian_filter(rng.random((H,W)),4)*2-1
    large=np.sin(X/55+Y/43)+np.cos(X/69-Y/127)
    off=dist-5*large-11*smooth
    val=np.digitize(off,[3,7,13,23,37,56,77]); val=7-val
    arr=np.array([rgb(c) for c in SEA[idx]],dtype=np.uint8)[val]
    im=Image.fromarray(arr);d=ImageDraw.Draw(im)
    # Refracted ripples form groups within a shallow band, never random strokes
    # over the deep sea or a navigation line.
    for i in range(380):
        x=int(rng.integers(2,W-21));y=int(rng.integers(44,352))
        if not 3<dist[y,x]<47:continue
        shade=val[y,x];s=int(rng.integers(3,17)); c=SEA[idx][min(shade+1,7)]
        for u in range(s):
            v=y+(u* u//(max(8,s)*6))
            if 3<dist[v,x+u]<47 and val[v,x+u]==shade: d.point((x+u,v),fill=c)
        if s>12:
            for u in range(4,9):
                if 3<dist[y+2,x+u]<47 and val[y+2,x+u]==shade:d.point((x+u,y+2),fill=SEA[idx][max(0,shade-1)])
    # Broken foam along the lower deposits, linked to their exact footprint.
    crest=(dist>=1)&(dist<=3)&(Y>67)&(((X*3+Y*5)//9)%17<11)
    pixel=np.array(im); pixel[crest]=np.array(rgb('#bfd8bd')); return Image.fromarray(pixel)
def island(im, pts, height, colors, idx, seed):
    d=ImageDraw.Draw(im)
    dark,shade,rock,warm,soil,lit,edge=colors
    poly(d,moved(pts,6,height+5),SEA[idx][2])
    for z in range(height,0,-1):
        c=dark if z>=height-2 else [shade,rock,warm,rock][min(3,(z*4)//height)]
        poly(d,moved(pts,0,z),c)
    top=footprint(pts);bottom=footprint(moved(pts,0,height))
    # Stone joints follow connected exposed faces on a shared slant.
    r=random.Random(seed)
    for y in range(47,350,3):
        for x in range(6+(y*5)%13,500,13):
            if not bottom[y,x] or top[y,x] or r.random()<.29:continue
            for u in range(r.randint(3,13)):
                if bottom[y,x+u] and not top[y,x+u]:d.point((x+u,y),fill=warm if y%7<3 else shade)
    inside=distance_transform_edt(top)
    rng=np.random.default_rng(seed+91)
    field=gaussian_filter(rng.random((H,W)),5)
    pal=np.array([rgb(c) for c in (edge,lit,soil)], dtype=np.uint8)
    v=np.where(inside<4,0,np.where((inside<11)|(field>.512),1,2))
    pix=np.array(im);pix[top]=pal[v[top]];im.paste(Image.fromarray(pix))
    d=ImageDraw.Draw(im); accents=[lit,soil,warm]
    for y in range(55,343,5):
        for x in range(10+(y*7)%13,496,13):
            if inside[y,x]<8 or r.random()>.49:continue
            w=r.randint(2,5)
            box(d,x,y,w,1,accents[0]);box(d,x+1,y+1,max(1,w-2),1,accents[1])
    return top

# Elementos com origem de luz NO e sombra projetada SE. Os telhados têm
# beiral e cumeeira, enquanto os pilares tocam a base da ponte.
MAT=[('#695349','#9c7755','#c79864','#e7ba7d'),('#545564','#858178','#aaa590','#d3bf9a'),('#4f4f44','#695941','#9a754b','#c29f64'),('#554c52','#877065','#a48972','#cbaa88')]
def mass(d,x,y,w,h,z,variant):
    ink,a,b,c=MAT[variant]
    p=[(0,5),(5,5),(5,1),(w//2,1),(w//2,0),(w-7,0),(w-7,4),(w,4),(w,h-4),(w-8,h-4),(w-8,h),(5,h),(5,h-3),(0,h-3)]
    poly(d,p,ink,x+6,y+z+3)
    for t,color in [(z,ink),(z-3,a),(3,b),(0,c)]:poly(d,p,color,x,y+t)
    box(d,x+7,y+1,w//2,1,'#e3c7a2')
    for j in range(0,w-8,9):
        box(d,x+j+4,y+h+2+(j%4),5,1,b)
        box(d,x+j+7,y+h+6+(j%3),3,1,ink)
def palm(d,x,y,s,kind):
    ln(d,[(x,y+1),(x+s//3,y+7),(x+s//2,y+8)],'#987453',4)
    path=[(x,y),(x-2,y-8),(x+1,y-s//2),(x+5,y-s)]
    ln(d,path,'#604b43',4)
    ln(d,[(a-1,b) for a,b in path],'#d6ab69')
    a,b=path[-1]
    arms=([(-26,3),(-30,12),(-19,-7),(-7,-13),(10,-15),(25,-9),(32,5),(18,12)]
          if kind==0 else [(-16,-1),(-26,8),(-10,-12),(1,-15),(15,-10),(24,-4),(26,6),(18,14)])
    for i,(u,v) in enumerate(arms):
        u=u*s//33;v=v*s//33
        xy=[(a,b),(a+u//2,b+v//2-3),(a+u,b+v),(a+u,b+v+5),(a+u//2,b+v//2+3)]
        poly(d,xy,'#36594b');ln(d,xy[:3],'#87a961' if i in [2,3,4,5] else '#628e59',2)
        for step in [4,7,11]:
            dx=u*step//12;dy=v*step//12
            ln(d,[(a+dx,b+dy-1),(a+dx+u//9,b+dy+3)],'#a5b06f' if i<6 else '#508052')
def patch(d,x,y,s,seed):
    r=random.Random(seed)
    for dx,dy in [(-s//2,13),(-s//3,16),(s//3,14),(s//2,11)]:
        ln(d,[(x,y),(x+dx//2,y+dy//2),(x+dx,y+dy)],'#4b4838',4)
        ln(d,[(x-1,y-1),(x+dx//2-1,y+dy//2-1),(x+dx-1,y+dy-1)],'#9c8153')
    box(d,x-2,y-14,5,18,'#745435');box(d,x-2,y-11,2,14,'#ac8959')
    for i in range(8):
        u=x+r.randint(-s//2,s//3);v=y+r.randint(-s//2,-8);w=r.randint(s//4,s//2);h=r.randint(9,s//3)
        t=[(0,4),(3,4),(3,1),(w//2,1),(w//2,0),(w-3,0),(w-3,3),(w,3),(w,h-3),(w-4,h-3),(w-4,h),(4,h),(4,h-3),(0,h-3)]
        poly(d,t,'#25483a',u+3,v+3);poly(d,t,'#376749',u,v)
        for k in range(3):
            box(d,u+3+k*2,v+2+k,w//2-k,1,'#709358')
            if k>0:box(d,u+w//2,v+h-k-1,w//3,1,'#2d5642')
def steps(d,x,y,w,z,theme):
    ink,a,b,c=MAT[theme]
    box(d,x+3,y+2,w+4,z*4+4,ink)
    for j in range(z):
        box(d,x,y+j*4,w,4,a if j%2 else b)
        box(d,x,y+j*4,w-1,1,c);box(d,x+w-2,y+j*4,2,4,ink)
        box(d,x+(9*j+2)%(w-3),y+j*4+1,2,1,b if j%2 else a)
def lighthouse(d,x,y):
    # Lantern's glass and eight-pixel plinth anchor the vertical form.
    p=[(0,0),(27,0),(27,5),(40,5),(40,17),(31,17),(31,24),(0,24)]
    poly(d,p,'#716956',x+6,y+5)
    steps(d,x+6,y+3,24,5,3)
    box(d,x,y-10,35,13,'#887266');box(d,x,y-10,27,5,'#c8af8c');box(d,x+3,y-13,29,4,'#dfc39a')
    box(d,x+7,y-53,23,40,'#b69879');box(d,x+7,y-53,17,40,'#ead1aa');box(d,x+26,y-49,4,34,'#87645d')
    for y0 in [-48,-42,-32,-26,-19]:
        box(d,x+8,y+y0,13,1,'#ceb28a');box(d,x+18,y+y0+1,8,1,'#967a68')
    box(d,x+12,y-29,6,16,'#584b50');box(d,x+12,y-29,5,1,'#a58063')
    box(d,x+25,y-42,4,6,'#604a52');box(d,x+25,y-42,1,6,'#d4b289')
    box(d,x+4,y-56,31,6,'#80575a');box(d,x+4,y-57,25,2,'#bd8671')
    box(d,x+8,y-67,23,10,'#906757');box(d,x+9,y-66,20,7,'#efb97c');box(d,x+10,y-66,14,5,'#ffdf9e')
    for k in [9,17,25,29]:box(d,x+k,y-67,1,10,'#8a6057')
    poly(d,[(3,-67),(3,-70),(8,-70),(8,-74),(14,-74),(14,-77),(22,-77),(22,-74),(28,-74),(28,-70),(34,-70),(34,-67)],'#945e59',x,y)
    ln(d,[(x+6,y-70),(x+13,y-70),(x+13,y-73),(x+22,y-73),(x+22,y-75)],'#d59675',1)

def bridge(d,x,y,w,h,theme,vertical=False):
    # Projeção da passarela e escora no nível inferior: não flutua na água.
    sh,dark,mid,lit=MAT[theme]
    if vertical:
        box(d,x-4,y+7,w+9,h+9,'#225965')
        for j in range(y+6,y+h,13):
            box(d,x-2,j,3,11,sh);box(d,x+w,j+1,3,11,sh)
        box(d,x,y+2,w,h+2,dark);box(d,x+2,y,w-4,h,mid)
        for j in range(y+1,y+h,4):
            box(d,x+2,j,w-4,1,lit);box(d,x+w//2+((j%3)-1)*2,j+1,1,2,dark)
    else:
        box(d,x+2,y+6,w,h+9,'#245765')
        for j in range(x+5,x+w,16):
            box(d,j,y+h-1,5,13,sh);box(d,j,y+h-1,2,11,dark)
            box(d,j+1,y-4,4,6,sh);box(d,j+1,y-4,3,1,lit)
        box(d,x,y,w,h+4,sh);box(d,x,y,w,h,dark);box(d,x,y+2,w,h-4,mid)
        for j in range(x+4,x+w,5):
            box(d,j,y+2,1,h-4,lit);box(d,j-1,y+3,1,h-5,dark)
        box(d,x,y,w,2,lit)
def building(d,x,y,theme,variant):
    ink,a,b,c=MAT[theme]
    shape=[(0,0),(25+variant*3,0),(25+variant*3,5),(35+variant*3,5),(35+variant*3,15),(28,15),(28,25),(0,25)]
    poly(d,shape,ink,x+9,y+12);poly(d,shape,a,x,y+7);poly(d,shape,b,x,y)
    for v in [7,14,21]:
        ln(d,[(x+2,y+v),(x+19,y+v)],c)
        for u in [5+v%3,14+v%4,24]:
            box(d,x+u,y+v+1,1,4,a)
    box(d,x+5,y+15,7,13,ink);box(d,x+6,y+16,4,9,a)
    roof=[(-4,4),(-4,0),(0,0),(0,-5),(4,-5),(4,-10),(21,-10),(21,-5),(27,-5),(27,0),(32,-0),(32,7),(26,7),(26,10),(0,10),(0,8),(-4,8)]
    poly(d,roof,'#454552',x,y-7);poly(d,roof,['#a26757','#7d827f','#817148','#996e66'][theme],x,y-10)
    for i in range(3):
        box(d,x+2+i*2,y-14+i*4,21-i,1,['#cf9370','#b1b299','#baa16b','#bf9473'][theme])
        box(d,x+5+(i*7)%11,y-13+i*4,1,2,ink)
    box(d,x+21,y+16,5,4,ink);box(d,x+21,y+16,2,1,c)
def pool(im,pts,theme):
    d=ImageDraw.Draw(im);m=footprint(pts)
    dist=distance_transform_edt(m)
    colors=[TERRAIN[theme][-2],SEA[theme][6],SEA[theme][4],SEA[theme][3]]
    a=np.array(im); lut=np.array([rgb(c) for c in colors])
    a[m]=lut[np.digitize(dist,[2,5,8])][m]
    im.paste(Image.fromarray(a))
    d=ImageDraw.Draw(im)
    for j in range(65,328,4):
        for i in range(13+j%19,495,17):
            if dist[j,i]>3 and dist[j,i+4]>3:
                box(d,i,j,4,1,SEA[theme][5])
def flora(d,x,y,s,theme,c):
    r=random.Random(x*31+y)
    base=['#7b8557','#7d6b67','#435c48','#6f7559'][theme]
    for z in range(7):
        dx=r.randint(-s,s);dy=r.randint(0,4)
        hh=r.randint(3,8)
        ln(d,[(x+dx,y+dy),(x+dx,y+dy-hh//2),(x+dx+(dx//3),y+dy-hh)],base,2)
        box(d,x+dx+dx//3,y+dy-hh,2,2,c)
def rail(d,pts,kind,theme):
    if kind=='shortcut': c=['#3c5960','#79908a','#acbca5']
    elif kind=='side': c=['#62604f','#b79b65','#edc280']
    else:c=['#695044','#bc8c5b','#f1ca88']
    for (x,y),(u,v) in zip(pts,pts[1:]):
        assert x==u or y==v, (x,y,u,v)
        if x==u:
            lo,hi=sorted((y,v));box(d,x-5,lo,11,hi-lo+1,c[0]);box(d,x-4,lo,8,hi-lo+1,c[1]);box(d,x-4,lo,1,hi-lo+1,c[2])
        else:
            lo,hi=sorted((x,u));box(d,lo,y-4,hi-lo+1,10,c[0]);box(d,lo,y-3,hi-lo+1,7,c[1]);box(d,lo,y-3,hi-lo+1,1,c[2])
    for x,y in pts[1:-1]:
        box(d,x-4,y-3,8,7,c[1]);box(d,x-4,y-3,2,2,c[2])
SCENES=[
 ('praia-das-conchas','Praia das Conchas','Cabo Baixo','Primeira onda',
   [(50,178),(107,133),(197,160),(325,151),(393,115),(465,138),(322,286)],
   [(0,1,[(50,150),(82,150),(82,133)],'main'),(1,2,[(141,133),(141,160)],'main'),(2,3,[(227,160),(227,151)],'main'),(3,4,[(349,151),(349,115)],'main'),(4,5,[(429,115),(429,138)],'main'),
    (1,6,[(107,202),(116,202),(116,245),(157,245),(157,278),(290,278),(290,286)],'side'),(6,3,[(353,286),(353,195),(325,195)],'shortcut')],
   ['c','1','2','3','4','>','*']),
 ('recifes-expostos','Recifes Expostos','Franja de Pedra','Acima da espuma',
   [(54,157),(127,129),(291,110),(417,238)],
   [(0,1,[(85,157),(85,129)],'main'),(1,2,[(164,129),(164,116),(246,116),(246,110)],'main'),(2,3,[(307,110),(307,136),(343,136),(343,206),(377,206),(377,238)],'main'),
    (0,3,[(54,185),(102,185),(102,255),(168,255),(168,280),(253,280),(253,264),(373,264),(373,254),(417,254)],'shortcut')],
    ['c','1','2','3']),
 ('mangue-dos-siris-duplos','Mangue dos Siris Duplos','Raízes e remansos','Raízes vizinhas',
   [(64,153),(132,141),(235,197),(423,147)],
   [(0,1,[(89,153),(89,141)],'main'),(1,2,[(132,174),(175,174),(175,197)],'main'),(2,3,[(276,197),(276,173),(352,173),(352,147)],'main'),
    (0,3,[(64,177),(105,177),(105,213),(136,213),(136,277),(194,277),(194,300),(288,300),(288,258),(393,258),(393,205),(423,205)],'shortcut')],
   ['c','1','2','3']),
 ('enseada-da-garca','Enseada da Garça','Costa de arenito','Sombra na restinga',
   [(59,241),(130,216),(207,185),(283,147),(346,121),(432,94)],
   [(0,1,[(85,241),(85,216)],'main'),(1,2,[(159,216),(159,185)],'main'),(2,3,[(239,185),(239,147)],'main'),(3,4,[(302,147),(302,121)],'side'),(4,5,[(375,121),(375,94)],'side'),
    (0,3,[(59,265),(117,265),(117,248),(255,248),(255,210),(283,210)],'shortcut')],
   ['c','1','2','3','*','*'])
]
def scene_art(k):
    im=water(k,PLAN[k],np.random.default_rng(220+k))
    for i,(p,z) in enumerate(PLAN[k]):island(im,p,z,TERRAIN[k],k,110+k*13+i)
    d=ImageDraw.Draw(im)
    if k==0:
        for x,y,s,v in [(73,114,37,1),(93,109,27,0),(151,112,39,0),(147,224,34,1),
                         (380,102,29,0),(406,102,40,1),(452,159,35,0),(311,306,32,1),(331,316,26,0)]:palm(d,x,y,s,v)
        for x,y,w,h,z in [(108,191,60,17,8),(310,93,41,13,8),(197,199,25,13,6),(382,166,47,16,11)]:mass(d,x,y,w,h,z,0)
        for x,y,s in [(67,203,7),(174,198,6),(93,222,5),(395,200,7),(300,292,4),(351,300,8)]:
            flora(d,x,y,s,k,'#a3a45e')
        building(d,437,167,k,0)
        bridge(d,232,143,85,16,k);bridge(d,146,270,145,16,k)
        bridge(d,345,213,16,45,k,True)
        steps(d,38,179,30,6,k);steps(d,340,114,20,7,k)
    elif k==1:
        for p in [[(52,161),(74,161),(74,147),(106,147),(106,156),(129,156),(129,173),(103,173),(103,191),(68,191),(68,178),(52,178)],[(224,92),(242,92),(242,81),(268,81),(268,100),(256,100),(256,113),(224,113)],[(363,224),(383,224),(383,209),(416,209),(416,214),(447,214),(447,223),(465,223),(465,240),(444,240),(444,265),(418,265),(418,271),(381,271),(381,254),(358,254),(358,239),(363,239)],[(131,278),(148,278),(148,267),(177,267),(177,274),(195,274),(195,287),(178,287),(178,299),(146,299),(146,294),(131,294)]]:pool(im,p,k)
        d=ImageDraw.Draw(im)
        for x,y,w,h,z in [(97,90,65,24,18),(313,64,51,30,16),(240,128,46,17,11),(425,190,40,17,10),(418,272,38,14,12),(139,286,25,12,7)]:mass(d,x,y,w,h,z,k)
        for x,y,s in [(69,177,5),(115,160,6),(157,187,7),(382,246,5),(450,241,8),(162,284,5),(259,104,4)]:flora(d,x,y,s,k,'#da937c')
        bridge(d,166,108,85,17,k);bridge(d,334,154,18,63,k,True);bridge(d,202,272,124,15,k)
        steps(d,43,158,26,6,k);steps(d,303,137,26,6,k)
    elif k==2:
        for p in [[(123,253),(153,253),(153,236),(185,236),(185,256),(200,256),(200,271),(165,271),(165,291),(142,291),(142,277),(123,277)],[(315,153),(341,153),(341,143),(362,143),(362,159),(374,159),(374,174),(352,174),(352,185),(325,185),(325,173),(315,173)]]:pool(im,p,k)
        d=ImageDraw.Draw(im)
        for x,y,s in [(86,115,48),(116,96,58),(142,108,46),(167,134,37),(410,121,51),(441,125,48),(459,149,43),(389,128,50),(304,132,39),(108,181,37),(209,260,59),(241,268,52),(250,245,36),(282,267,47),(319,279,40),(144,306,36),(269,196,36)]:
            patch(d,x,y,s,x*3+y)
        for x,y in [(73,135),(181,231),(179,290),(221,307),(363,198),(409,198),(442,182)]:
            flora(d,x,y,8,k,'#acaa68')
        building(d,431,182,k,2)
        bridge(d,170,188,75,17,k);bridge(d,269,164,93,18,k)
        bridge(d,97,194,16,72,k,True);bridge(d,306,250,88,15,k)
        bridge(d,385,204,16,62,k,True);steps(d,55,154,24,6,k)
    else:
        # Duas prateleiras elevadas, com escadaria apoiada no próprio promontório.
        for x,y,w,h,z in [(277,83,96,40,29),(365,59,98,52,35),(227,113,66,25,20),(262,178,63,27,21),(152,193,63,28,16),(109,241,50,22,12),(314,196,40,23,16)]:
            mass(d,x,y,w,h,z,k)
        lighthouse(d,399,126)
        steps(d,365,103,25,9,k);steps(d,288,125,34,8,k);steps(d,223,149,28,9,k)
        for x,y,s in [(75,217,7),(176,152,8),(132,248,7),(192,234,9),(354,161,11),(330,216,4),(286,192,7),(452,142,6)]:
            flora(d,x,y,s,k,'#a7b477')
        bridge(d,216,177,31,15,k);bridge(d,214,240,52,16,k)
        steps(d,49,241,24,5,k)
        # Garça recortada aparece longe do tabuleiro/indicadores.
        poly(d,[(0,10),(14,8),(23,0),(29,0),(27,6),(22,10),(39,8),(43,9),
                (39,12),(29,13),(22,15),(15,13),(7,13)],'#cbd5be',91,78)
        box(d,118,87,19,1,'#dfba82')
    return im

def badge(d,x,y,s,selected=False):
    edge=G if s!='*' else '#a9c9ab'; bg='#1e3b50'
    if selected:
        box(d,x-12,y-12,25,25,'#ffe3a4');box(d,x-11,y-11,23,23,bg)
    p=[(-8,-5),(-5,-5),(-5,-8),(5,-8),(5,-5),(8,-5),(8,5),(5,5),(5,8),(-5,8),(-5,5),(-8,5)]
    poly(d,p,'#253544',x+2,y+2);poly(d,p,edge,x,y)
    box(d,x-5,y-5,11,11,bg)
    if s=='c':
        box(d,x-4,y-1,8,3,'#b7d7bb');box(d,x-2,y-3,4,3,'#b7d7bb')
    else:word(d,x-2,y-3,s)
def render(k):
    id,title,subtitle,focus,nodes,links,labels=SCENES[k]
    im=scene_art(k);d=ImageDraw.Draw(im)
    for a,b,way,kind in sorted(links,key=lambda e:e[3]!='shortcut'):
        rail(d,[nodes[a],*way,nodes[b]],kind,k)
    for j,(x,y) in enumerate(nodes):badge(d,x,y,labels[j],j==1)
    px,py=nodes[1];anchor=(px-15,py-36)
    box(d,px-10,py-12,21,4,'#4e4347')
    im.paste(CRAB,anchor,CRAB.getchannel('A'));d=ImageDraw.Draw(im)
    box(d,0,0,W,41,N);box(d,0,39,W,1,'#6c8788');box(d,0,40,W,1,'#355567')
    box(d,10,9,28,24,'#234452');box(d,10,9,28,1,'#829794')
    word(d,15,15,f'0{k+1}',G)
    word(d,48,12,title,IV,2)
    box(d,0,354,W,30,N);box(d,0,354,W,1,'#7a9991')
    word(d,12,365,subtitle,'#afd0c0',1);word(d,223,365,focus);word(d,461,365,'ESTUDO',G)
    arr=np.asarray(im.crop((*anchor,anchor[0]+31,anchor[1]+23)))
    src=np.asarray(CRAB)
    assert np.array_equal(arr[src[:,:,3]>0], src[:,:,:3][src[:,:,3]>0])
    return im
def main():
    assert set(np.unique(np.asarray(CRAB.getchannel('A'))))=={0,255}
    sheet=Image.new('RGB',(W*2+18,H*2+18),N)
    for k,info in enumerate(SCENES):
        im=render(k); assert im.mode=='RGB' and im.size==(W,H)
        zoom=im.resize((W*2,H*2),Image.Resampling.NEAREST)
        assert zoom.resize((W,H),Image.Resampling.NEAREST).tobytes()==im.tobytes()
        im.save(HERE/(info[0]+'-1x.png'),optimize=True)
        zoom.save(HERE/(info[0]+'-2x.png'),optimize=True)
        sheet.paste(im,(6+(k%2)*(W+6),6+(k//2)*(H+6)))
    sheet.save(HERE/'entre-ilhas-v6-mundos-1-a-4.png',optimize=True)
if __name__=='__main__':main()
