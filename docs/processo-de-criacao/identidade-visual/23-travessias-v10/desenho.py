from pathlib import Path
from PIL import Image, ImageDraw
import random, unicodedata
from letras import FONT
P=Path(__file__).parent
W,H=448,280
N=Image.Resampling.NEAREST
CREAM='#ffedbf'
SIRI=Image.open(P/'siri-da-logo.png').convert('RGBA')
def text(d,xy,s,color=CREAM,k=1):
    x,y=xy
    for ch in s.upper():
        normal=unicodedata.normalize('NFD',ch)
        key=normal[0]
        glyph=FONT.get(key)
        if glyph:
            for i,line in enumerate(glyph.split()):
                for j,c in enumerate(line):
                    if c=='1': d.rectangle((x+j*k,y+i*k,x+(j+1)*k-1,y+(i+1)*k-1),fill=color)
            if len(normal)>1:
                d.rectangle((x+2*k,y-k,x+3*k-1,y-1),fill=color)
        x+=k*(6 if key!=' ' else 4)
def poly(d,points,c):
    d.polygon(points,fill=c)
def shell(kind=0,variant=0):
    im=Image.new('RGBA',(34,28));d=ImageDraw.Draw(im)
    outline='#714342';deep,mid,lit,pale=[
      ('#aa554e','#d77d66','#f9b189','#ffe3b8'),
      ('#7f6181','#ae7c9b','#e6abc0','#ffe0df'),
      ('#9c6c49','#cc9964','#efc783','#fff0b0'),
      ('#597b71','#83a495','#b6cdc0','#eff6d1'),
      ('#98626c','#d4939b','#f7bbc0','#ffedcf'),
      ('#866249','#af936a','#e0c69a','#fff0ce')][variant%6]
    # Silhuetas seguem famílias naturais, com volumes e dobraduras próprias.
    if kind in (0,1):
        left=3 if kind==0 else 7
        right=30 if kind==0 else 29
        poly(d,[(16,25),(left,15),(left-1,8),(left+2,5),(left+6,5),(left+7,2),(15,3),(18,1),(22,3),(26,3),(right,7),(right+1,12),(right-1,17),(20,25)],outline)
        poly(d,[(16,23),(left+1,14),(left+1,8),(left+3,6),(left+7,6),(left+8,4),(15,4),(18,3),(23,5),(26,5),(right-1,8),(right,12),(right-2,16),(20,23)],mid)
        for n,tip in enumerate((left+2,left+6,left+10,18,23,27)):
            d.line([(tip,7+(n%2)),(tip+(18-tip)//3,15),(17+n//3,22)],fill=deep,width=2)
            d.line([(tip+1,6+(n%2)),(tip+1+(18-tip)//3,14),(17+n//3,19)],fill=lit,width=2)
        d.line([(left+2,8),(left+5,6),(left+8,6),(left+10,4),(15,4),(18,3),(21,4)],fill=pale,width=2)
        d.rectangle((15,23,20,24),fill=deep)
    if kind in (2,3):
        ox=2 if kind==2 else 0
        poly(d,[(3,17),(4,11),(7,7),(13,5),(17,6),(21,4),(24,5),(26,3),(31,2),(29,8),(25,11),(26,16),(23,21),(18,24),(9,24),(5,22)],outline)
        poly(d,[(5,18),(6,11),(11,8),(15,7),(20,8),(23,6),(25,7),(28,4),(29,4),(27,8),(23,11),(24,15),(22,19),(17,22),(9,22)],mid)
        d.line([(6,17),(7,12),(11,9),(16,9),(19,12),(19,16),(16,19),(12,19),(9,16),(11,13),(14,12),(16,14),(15,16),(13,16)],fill=deep,width=3)
        d.line([(7,14),(9,11),(13,9),(16,10),(18,13),(17,16),(15,17),(12,16),(12,14),(14,14)],fill=lit,width=2)
        d.line([(9,10),(13,8),(17,8)],fill=pale,width=2)
        for i in range(3+ox): d.line([(20+i,8-i),(22+i,11-i)],fill=lit)
    if kind in (4,5):
        cap=3 if kind==4 else 5
        poly(d,[(3,12),(6,cap+4),(13,cap),(19,cap),(25,cap+3),(30,11),(31,16),(28,22),(21,25),(12,25),(6,22),(3,18)],outline)
        poly(d,[(5,13),(8,cap+5),(14,cap+2),(19,cap+2),(24,cap+5),(28,11),(29,16),(26,21),(20,23),(12,23),(8,21),(5,17)],deep)
        for i in range(4):
            y=9+i*3
            d.line([(6+i%2,y+4),(12,y),(21,y),(27-i%2,y+3)],fill=lit if i==0 else mid,width=2)
        d.line([(7,12),(10,9),(14,7),(19,7)],fill=pale,width=2)
        d.line([(8,20),(13,22),(21,22),(27,19)],fill=mid,width=2)
    if kind in (1,3,5): im=im.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
    d=ImageDraw.Draw(im)
    # Microdetalhes chapados de espécie, nunca brilho disperso fora da concha.
    for i in range((variant%3)+1):
        x=10+i*3+variant%2;y=12+(i+variant)%4
        if im.getpixel((x,y))[3]: d.point((x,y),fill=pale)
    return im
worlds=[
dict(title='FIO DE AREIA',world='PRAIA DAS CONCHAS',grid=['S==H=C','##..##'],high=(3,0),base='#254e60',band=['#2e5a69','#366674','#427681'],reef='#315e6c', sand=['#efcf88','#f8dca1','#d6aa67','#93664e','#654750'],low='#baaa75',wet='#477e89',foam='#e3f0d7',shell=(0,2)),
dict(title='ACIMA DA ESPUMA',world='RECIFES EXPOSTOS',grid=['S=H==C','##.###'],high=(2,1),base='#24475e',band=['#2a5267','#315e72','#3c6d7d'],reef='#32586b',sand=['#cfc9a3','#e2ddad','#a79a86','#686577','#464b61'],low='#a7a683',wet='#497888',foam='#e4f0e1',shell=(2,1))]

from PIL import ImageColor
from functools import lru_cache

@lru_cache
def cor(c):
    return ImageColor.getrgb(c) if isinstance(c,str) else c

def mistura(a,b,t):
    return tuple(round(x+(y-x)*t) for x,y in zip(cor(a),cor(b)))

def p(d,x,y,color,pts):
    d.polygon([(x+a,y+b) for a,b in pts],fill=color)

def tr(d,x,y,color,pts,w=1):
    d.line([(x+a,y+b) for a,b in pts],fill=color,width=w)

def litoral(d,x,y,w,depth,recife,seed):
    """Laje de cenário vista das três faces. As camadas de rocha seguem juntas."""
    rng=random.Random(seed)
    roof,light,base,medium,dark,wet=(
        ('#88a29a','#bfd0a9','#516777','#617b80','#293e57','#497f92') if recife
        else ('#d6b47d','#ffe0a1','#987350','#b69360','#64534f','#429ca0'))
    front=w-7
    p(d,x,y,wet,[(-6,depth+9),(4,depth+22),(front-3,depth+25),(w+10,depth+16),(w+10,depth+7)])
    p(d,x,y,dark,[(0,depth),(front,depth),(w,0),(w,12),(front,depth+15),(0,depth+15)])
    p(d,x,y,base,[(0,depth),(front,depth),(front,depth+12),(front-11,depth+13),(front-22,depth+11),(0,depth+13)])
    p(d,x,y,medium,[(0,depth),(front,depth),(front,depth+4),(front-14,depth+7),(front-32,depth+5),(0,depth+8)])
    p(d,x,y,roof,[(7,0),(w,0),(front,depth),(0,depth)])
    tr(d,x,y,light,[(1,depth-1),(front-2,depth-1),(w-1,1)],2)
    for k in range(max(4,w//3)):
        a=rng.randrange(7,max(8,front-4)); b=rng.randrange(2,max(3,depth-1))
        tr(d,x,y,light if k%3==0 else mistura(roof,base,.30),[(a,b),(a+rng.randrange(1,5),b)])
    for a in [5,16,27,41,54]:
        if a+4>=front: continue
        tr(d,x,y,medium,[(a,depth+10),(a+4,depth+10)])
    tr(d,x,y,'#b0ded4',[(0,depth+17),(9,depth+17),(11,depth+19),(22,depth+19),(26,depth+18),(front-7,depth+18)],1)

def folhagem(d,x,y,seed,recife=False,small=False):
    rng=random.Random(seed)
    h=23 if small else 35
    if recife:
        # Coral de ventarola: ramo com silhueta ramificada e sem pixels semitransparentes.
        tr(d,x,y,'#488088',[(0,2),(18,4),(28,2)],4)
        tr(d,x,y,'#7c657f',[(0,0),(1,-9),(8,-16),(6,-25)],4)
        tr(d,x,y,'#c58e92',[(0,-7),(-7,-12),(-10,-20)],3)
        tr(d,x,y,'#dda69c',[(0,-10),(8,-17),(7,-25)],2)
        tr(d,x,y,'#d99d98',[(7,-15),(17,-18),(20,-24)],3)
        tr(d,x,y,'#f3b6a2',[(17,-18),(20,-23),(22,-22)])
        return
    p(d,x,y,'#568d75',[(-7,0),(2,-4),(26,-4),(34,1),(26,6),(5,7)])
    tr(d,x,y,'#74614c',[(0,0),(-3,-9),(-1,-h//2),(4,-h)],5)
    tr(d,x,y,'#d6ac6a',[(-1,-1),(-3,-10),(-1,-h//2),(3,-h+2)],2)
    for a in range(-h+8,-2,5):
        tr(d,x,y,'#946947',[(-3,a),(1,a-1)])
    leaves=[[(4,0),(-9,-8),(-20,-6),(-26,1),(-12,-2),(-3,3)],
            [(4,0),(-3,-10),(-8,-13),(-10,-11),(-5,-4),(0,4)],
            [(3,0),(12,-13),(24,-12),(28,-7),(17,-8),(11,-3),(8,4)],
            [(3,0),(20,-5),(31,-1),(34,6),(26,3),(16,2),(8,6)],
            [(3,0),(-13,1),(-20,9),(-22,13),(-12,9),(-4,7),(3,5)],
            [(4,0),(17,2),(23,10),(22,16),(13,10),(7,7),(2,4)]]
    colors=['#368565','#50a46f','#65b773','#4b9d73','#34816c','#307660']
    for points,c in zip(leaves,colors):
        if small: points=[(int(a*.75),int(b*.75)) for a,b in points]
        p(d,x,y-h,c,points)
        a,b=points[2]; tr(d,x,y-h,mistura(c,'#d2e59a',.54),[(4,0),(int(a*.62),int(b*.60)),(a,b)])
    for a,b in [(1,1),(5,2)]:
        d.rectangle((x+a,y-h+b,x+a+2,y-h+b+2), fill='#b48a52')

def campo(d,x0,y0,seed,recife):
    rng=random.Random(seed)
    for _ in range(9):
        x,y=x0+rng.randrange(-13,15),y0+rng.randrange(-4,5)
        h=rng.randrange(2,8)
        tr(d,x,y,'#568a80' if recife else '#5c8d62',[(0,0),(-1,-h+2),(-3,-h)])
        tr(d,x,y,'#a8b494' if recife else '#b5c879',[(0,0),(1,-h+1),(3,-h)])

def cenario(im,recife,high):
    d=ImageDraw.Draw(im)
    bg='#30677f' if recife else '#307f91'
    d.rectangle((0,44,W,250),fill=bg)
    mar=[bg,'#38768a' if recife else '#3a90a0','#408698' if recife else '#48a4a7','#4a959f' if recife else '#5ab2ac']
    for color,pts in zip(mar[1:],[
        [(0,76),(56,68),(117,74),(158,63),(246,62),(299,75),(393,61),(448,66),(448,205),(389,216),(342,208),(291,226),(190,215),(123,239),(39,216),(0,222)],
        [(13,108),(100,91),(166,81),(239,86),(330,81),(416,92),(430,157),(407,191),(337,194),(251,205),(207,197),(136,219),(74,191),(19,172)],
        [(49,134),(91,110),(169,102),(236,94),(321,97),(401,116),(414,157),(374,175),(326,179),(268,185),(203,180),(122,192),(64,167)]
    ]): d.polygon(pts,fill=color)
    rng=random.Random(993+recife)
    for _ in range(93):
        x=rng.randint(3,429);y=rng.randint(49,245);le=rng.randint(3,18)
        c=mistura(im.getpixel((x,y)),'#a1d3cd',rng.choice((.09,.15,.20)))
        tr(d,x,y,c,[(0,1),(le//3,1),(le//3+2,0),(le,0)])
    if recife:
        litoral(d,18,174,67,23,True,3)
        litoral(d,28,175,39,12,True,13)
        campo(d,50,189,4,True)
        folhagem(d,42,186,72,True)
        litoral(d,295,73,81,18,True,76)
        litoral(d,319,67,58,11,True,19)
        litoral(d,372,197,64,19,True,6)
        litoral(d,408,185,31,12,True,11)
        folhagem(d,401,210,30,True)
        if not high: litoral(d,154,214,62,12,True,14)
    else:
        litoral(d,0,86,66,22,False,13)
        litoral(d,-6,76,63,15,False,24)
        campo(d,39,91,29,False)
        folhagem(d,31,89,77,small=True)
        litoral(d,293,75,111,18,False,70)
        litoral(d,339,65,74,14,False,48)
        campo(d,310,85,9,False); campo(d,392,77,50,False)
        folhagem(d,371,85,32,small=True)
        litoral(d,361,203,81,16,False,76)
        campo(d,407,209,6,False)
        folhagem(d,420,208,42)
        if not high: litoral(d,92,210,83,14,False,61)
    return d

def frame(cfg,high):
    recife=cfg['shell'][0]!=0
    im=Image.new('RGB',(W,H),'#172e44')
    d=cenario(im,recife,high)
    xs,ys,t=75,100,50
    rows=cfg['grid']
    terra=('#cbcca1','#e9e4b9','#aab094','#748b84','#56717b','#3c566c') if recife else (
           '#e7c281','#ffe1a2','#caa270','#a97a59','#805d4f','#5d4e51')
    mid,light,wet,r0,r1,dark=terra
    def code(i,j):
        return rows[j][i] if 0<=j<len(rows) and 0<=i<len(rows[j]) else '#'
    def solo(c):
        return c!='#' and not (high and c=='=')
    def base(x,y,c,i,j):
        rng=random.Random(931+i*59+j*23+recife)
        if not solo(c):
            top='#4b8f9c' if recife else '#54a5a5'
            d.rectangle((x,y,x+49,y+49),fill=top)
            p(d,x,y,mistura(top,'#294f70',.32),[(0,31),(14,29),(28,31),(44,26),(49,26),(49,49),(0,49)])
            for a,b,l in [(4,11,13),(23,15,15),(10,28,16),(30,39,14),(3,44,11)]:
                tr(d,x,y,mistura(top,'#c9e6cb',.33),[(a,b),(a+l//2,b),(a+l//2+3,b-2),(a+l,b-2)])
            return
        n=c=='='
        ext=not solo(code(i,j+1))
        if ext:
            p(d,x,y,'#428e99',[(0,47),(49,47),(55,62),(49,67),(3,68),(-4,63)])
            if not n: p(d,x,y,dark,[(0,46),(49,46),(49,64),(0,64)])
            p(d,x,y,r1,[(0,47),(49,47),(49,56 if n else 61),(39,62 if not n else 56),(28,56),(18,59 if not n else 56),(0,58 if not n else 56)])
            p(d,x,y,r0,[(0,46),(49,46),(49,52),(38,54),(26,52),(20,55),(9,52),(0,54)])
            for _ in range(15):
                a,b=rng.randint(1,44),rng.randint(51,54 if n else 60)
                tr(d,x,y,mistura(r0,r1,rng.choice((.28,.65))),[(a,b),(a+3,b)])
            tr(d,x,y,'#c5e6d4',[(0,59 if n else 64),(11,60 if n else 65),(21,59 if n else 64),(32,59 if n else 64),(38,60 if n else 65),(49,59 if n else 64)])
        top=mistura(mid,wet,.63) if n else mid
        d.rectangle((x,y,x+49,y+49),fill=top)
        gl=mistura(top,light,.68 if n else .83)
        edge=mistura(top,wet,.80)
        u=(i*11+j*13)%13
        p(d,x,y,mistura(top,gl,.56),[(0,0),(49,0),(49,13+u//2),(34,17+u//2),(26,16+u),(12,23-u//2),(0,18+u//2)])
        p(d,x,y,gl,[(0,0),(49,0),(49,5),(36,7),(23,6+u//2),(14,11+u//2),(0,8)])
        p(d,x,y,edge,[(0,45),(12,43),(21,45),(31,39+u//3),(44,40),(49,37),(49,49),(0,49)])
        for k in range(22):
            a,b=rng.randint(2,44),rng.randint(3,46)
            ln=rng.randrange(2,5)
            shade=mistura(top,wet,.65) if k%4==0 else mistura(top,gl,.52)
            tr(d,x,y,shade,[(a,b),(a+ln,b)])
            if k%4==0: tr(d,x,y,gl,[(a+1,b-1),(a+ln-1,b-1)])
        if i in (0,5) or ext:
            for a,b in [(4+i%3,39),(35,29+i%4)]:
                p(d,x+a,y+b,mistura(top,dark,.25),[(0,0),(4,0),(5,2),(1,3),(0,2)])
                tr(d,x+a,y+b,gl,[(0,0),(2,0),(3,1)])
        tr(d,x,y,gl,[(0,49),(0,0),(49,0)])
        if not solo(code(i-1,j)): tr(d,x,y,'#c5e6d4',[(-2,8),(-2,17),(-3,22),(-3,35),(-2,43)])
        if not solo(code(i+1,j)): tr(d,x,y,'#c5e6d4',[(51,11),(51,22),(52,26),(52,36),(51,45)])
        if c=='H':
            bb='#67878a' if recife else '#a27b60'
            p(d,x,y,mistura(top,dark,.4),[(7,33),(39,21),(49,36),(42,45),(13,46),(5,42)])
            p(d,x,y,mistura(bb,dark,.68),[(6,24),(15,11),(32,8),(42,19),(44,32),(34,41),(12,40),(6,35)])
            p(d,x,y,bb,[(7,23),(16,12),(31,9),(39,18),(32,27),(13,30)])
            p(d,x,y,mistura(bb,light,.62),[(8,22),(16,12),(31,9),(33,13),(25,17),(20,17),(15,24)])
            p(d,x,y,mistura(bb,light,.28),[(9,25),(18,24),(23,18),(34,15),(39,18),(32,25),(14,29)])
            tr(d,x,y,mistura(bb,light,.48),[(11,33),(22,33),(27,31),(34,31),(40,26)])
            tr(d,x,y,bb,[(15,37),(21,37),(27,35),(34,35),(40,31)])
        if c=='C':
            d.ellipse((x+6,y+8,x+45,y+43),fill=mistura(top,light,.36))
            d.ellipse((x+10,y+10,x+41,y+37),fill=gl)
            for a,b in [(3,3),(46,3),(3,46),(46,46)]:
                dx=1 if a<20 else -1;dy=1 if b<20 else -1
                tr(d,x,y,'#a8784f',[(a+dx*6,b),(a,b),(a,b+dy*6)])
            art=shell(*cfg['shell'])
            im.paste(art,(x+8,y+10),art.getchannel('A'))

    # A água fica atrás das células sólidas, inclusive das escarpas.
    for state in (False,True):
        for j,row in enumerate(rows):
            for i,c in enumerate(row):
                if c!='#' and solo(c)==state:
                    base(xs+i*t,ys+j*t,c,i,j)
    sx,sy=cfg['high'] if high else (0,0)
    x,y=xs+sx*t,ys+sy*t
    d.ellipse((x+10,y+34,x+39,y+41),fill=mistura(mid,dark,.42))
    im.paste(SIRI,(x+9,y+15),SIRI.getchannel('A'))
    for sy in range(SIRI.height):
        for sx in range(SIRI.width):
            a=SIRI.getpixel((sx,sy))
            if a[3]: assert im.getpixel((x+9+sx,y+15+sy))==a[:3]
    for y1,y2 in [(0,43),(251,279)]: d.rectangle((0,y1,W-1,y2),fill='#18334a')
    for y1 in (43,251): d.line((0,y1,W-1,y1),fill='#7eb7ad')
    text(d,(13,8),cfg['title'],k=2)
    text(d,(14,31),cfg['world'],'#c5e0ce')
    d.rectangle((298,5,432,36),fill='#295e78' if high else '#3d654f')
    text(d,(307,8),'MARÉ ALTA' if high else 'MARÉ BAIXA')
    text(d,(307,23),'BAIXIOS COBERTOS' if high else 'BAIXIOS EXPOSTOS','#c6e2d8')
    text(d,(14,261),'WASD / SETAS','#b7dad8')
    text(d,(168,261),'ESTUDO VISUAL','#a4c8c9')
    text(d,(322,261),'ALCANCE A CONCHA')
    return im

def exportar(cfg,nome):
    out=Image.new('RGB',(W,H*2+8),'#13273c')
    for i,alta in enumerate((False,True)):
        im=frame(cfg,alta)
        im.save(P/(nome+('-alta' if alta else '-baixa')+'-1x.png'))
        out.paste(im,(0,i*(H+8)))
    grande=out.resize((W*2,out.height*2),N)
    assert grande.resize(out.size,N).tobytes()==out.tobytes()
    grande.save(P/(nome+'.png'))

if __name__=='__main__':
    exportar(worlds[0],'travessia-v10-praia-das-conchas')
    exportar(worlds[1],'travessia-v10-recifes-expostos')
