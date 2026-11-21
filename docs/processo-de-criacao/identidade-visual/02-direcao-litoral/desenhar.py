"""Três estudos de cenário, desenhados na resolução lógica (386 × 272)."""
from pathlib import Path
from math import cos,sin,pi
from random import Random
import unicodedata
from PIL import Image, ImageDraw, ImageFilter
W,H=386,272
O='#153644'; C='#fff1bb'; F='#daf2cc'; A='#72cbb1'; D='#256d71'
S='#e6b477'; L='#f7d698'; G='#428767'; N='#265b51'; HIL='#91ba70'
FONT={
"A":"01110/11011/11011/11111/11011/11011/11011","B":"11110/11011/11011/11110/11011/11011/11110",
"C":"01111/11000/11000/11000/11000/11000/01111","D":"11110/11011/11011/11011/11011/11011/11110",
"E":"11111/11000/11000/11110/11000/11000/11111","F":"11111/11000/11000/11110/11000/11000/11000",
"G":"01111/11000/11000/11011/11011/11011/01111","H":"11011/11011/11011/11111/11011/11011/11011",
"I":"111/010/010/010/010/010/111","J":"00111/00011/00011/00011/11011/11011/01110",
"K":"11011/11011/11110/11100/11110/11011/11011","L":"11000/11000/11000/11000/11000/11000/11111",
"M":"11011/11111/11111/11011/11011/11011/11011","N":"11011/11111/11111/11111/11011/11011/11011",
"O":"01110/11011/11011/11011/11011/11011/01110","P":"11110/11011/11011/11110/11000/11000/11000",
"Q":"01110/11011/11011/11011/11111/01110/00011","R":"11110/11011/11011/11110/11110/11011/11011",
"S":"01111/11000/11000/01110/00011/00011/11110","T":"11111/00100/00100/00100/00100/00100/00100",
"U":"11011/11011/11011/11011/11011/11011/01110","V":"11011/11011/11011/11011/11011/01110/00100",
"W":"11011/11011/11011/11011/11111/11111/11011","X":"11011/11011/01110/00100/01110/11011/11011",
"Y":"11011/11011/01110/00100/00100/00100/00100","Z":"11111/00011/00110/01100/11000/11000/11111",
" ":"000/000/000/000/000/000/000","1":"010/110/010/010/010/010/111","2":"1111/0001/0001/1111/1000/1000/1111",
"4":"1001/1001/1001/1111/0001/0001/0001","-":"000/000/000/111/000/000/000"}
FONT["É"]=FONT["E"]; FONT["Ú"]=FONT["U"]; FONT["Ê"]=FONT["E"]
FONT.update({'.':"0/0/0/0/0/1/1",'·':"0/0/0/1/0/0/0",'/':"001/001/010/010/010/100/100",'—':"00000/00000/00000/11111/00000/00000/00000",
    '0':"0110/1001/1001/1001/1001/1001/0110",'3':"1110/0001/0001/0110/0001/0001/1110",'5':"1111/1000/1000/1110/0001/0001/1110",
    '6':"0111/1000/1000/1110/1001/1001/0110",'7':"1111/0001/0010/0010/0100/0100/0100",'8':"0110/1001/1001/0110/1001/1001/0110"})
R=Random(12)
def text(im, xy, s, a, color=C):
    """Os glifos são matrizes de células opacas, inclusive acentos."""
    x,y=xy; zoom=2 if a>=16 else 1
    for c in s:
        v=unicodedata.normalize('NFD',c)
        rows=FONT[v[0]].split('/')
        for row, mask in enumerate(rows):
            for col, bit in enumerate(mask):
                if bit=='1': box(im,(x+col*zoom,y+row*zoom,x+(col+1)*zoom-1,y+(row+1)*zoom-1),color)
        if len(v)>1:
            if 'CEDILLA' in unicodedata.name(v[-1]): box(im,(x+2*zoom,y+7*zoom,x+3*zoom-1,y+8*zoom-1),color)
            else:
                for dx,dy in [(2,-1),(3,-2)] if 'ACUTE' in unicodedata.name(v[-1]) else [(1,-1),(2,-2),(3,-1)]:
                    box(im,(x+dx*zoom,y+dy*zoom,x+(dx+1)*zoom-1,y+(dy+1)*zoom-1),color)
        x+=(len(rows[0])+1)*zoom
def poly(im,p,c,e=None):
    ImageDraw.Draw(im).polygon(p,fill=c,outline=e)
def line(im,p,c,w=1):
    ImageDraw.Draw(im).line(p,fill=c,width=w)
def box(im,r,c,e=None,w=1):
    ImageDraw.Draw(im).rectangle(r,c,e,w)
def dots(im,x,y,cols):
    ImageDraw.Draw(im).point([(x+i,y+j) for i,j in cols], fill=F)
def land(im,shape,grass=None):
    mask=Image.new('L',im.size);ImageDraw.Draw(mask).polygon(shape,fill=255)
    for size,offset,c in [(27,(0,0),'#317d80'),(17,(0,0),'#489a92'),(9,(0,1),'#65b4a3'),(3,(0,1),'#b6e0b4'),(1,(0,6),'#498577'),(1,(0,3),'#a68a58'),(1,(0,0),S)]:
        m=mask.filter(ImageFilter.MaxFilter(size)) if size>1 else mask
        if offset!=(0,0):
            q=Image.new('L',im.size); q.paste(m,offset);m=q
        im.paste(c,(0,0,*im.size),m)
    inner=mask.filter(ImageFilter.MinFilter(7));im.paste(L,(0,0,*im.size),inner)
    for i in range(600):
        x=R.randrange(W);y=R.randrange(H)
        if inner.getpixel((x,y)) and R.randrange(4)==0:
            box(im,(x,y,x+R.randrange(1,3),y),R.choice([S,'#fce5ad','#d2a26c']))
    if grass:
        m=Image.new('L',im.size);ImageDraw.Draw(m).polygon(grass,fill=255)
        for k,c in [(7,'#ba9b65'),(3,N),(1,G)]:
            im.paste(c,(0,0,*im.size),m.filter(ImageFilter.MaxFilter(k)) if k>1 else m)
        for i in range(1200):
            x=R.randrange(W);y=R.randrange(H)
            if m.getpixel((x,y)) and R.randrange(5)==0:
                line(im,[(x-1,y),(x,y-1),(x+1,y)],R.choice([HIL,'#5da268',N]))
    return mask
def mound(im,x,y,s=1):
    shell=[(-11,9),(-13,4),(-10,1),(-5,-7),(4,-9),(10,-6),(15,1),(14,7),(10,11),(-5,12)]
    ps=lambda pts:[(x+a*s,y+b*s) for a,b in pts]
    poly(im,ps(shell),'#4e6865','#284d52')
    poly(im,ps([(-11,4),(-6,-5),(4,-7),(10,-4),(13,2),(4,4),(-4,2)]),'#839590')
    poly(im,ps([(-9,3),(-5,-4),(2,-5),(4,-3),(0,-2),(-4,2)]),'#a9ac93')
    poly(im,ps([(-10,5),(-3,5),(-1,8),(5,8),(11,5),(10,10),(-5,11)]),'#3a5e5d')
    line(im,ps([(-5,6),(0,4),(4,5),(8,1)]),'#607975')
    dots(im,x-3*s,y-3*s,[(0,0),(1,0)])
def tree(im,x,y,k=1):
    def p(seq):return [(x+a*k,y+b*k) for a,b in seq]
    poly(im,p([(-9,6),(-1,2),(10,4),(13,8),(4,11),(-6,10)]),'#32634d')
    box(im,(x-2*k,y-7*k,x+k,y+8*k),'#674e45')
    for pts,c in [
        ([(-12,-3),(-14,-9),(-11,-14),(-9,-21),(-4,-25),(4,-26),(9,-22),(12,-17),(15,-10),(11,-3),(6,0),(-4,1)],N),
        ([(-12,-9),(-9,-16),(-6,-20),(-2,-23),(4,-24),(10,-19),(11,-15),(14,-10),(9,-5),(5,-4),(0,-2),(-6,-4)],G),
        ([(-9,-14),(-6,-16),(-4,-20),(1,-23),(5,-22),(9,-18),(5,-18),(3,-15),(-3,-15),(-5,-11)],'#69a368'),
        ([(1,-21),(5,-20),(3,-18),(-2,-17),(-4,-14),(-7,-15),(-3,-20)],HIL),
        ([(-11,-10),(-8,-9),(-4,-10),(-1,-15),(3,-14),(4,-10),(8,-11),(10,-14),(12,-11),(7,-6),(2,-6),(-4,-5)],'#36765e'),
    ]: poly(im,p(pts),c)
    line(im,p([(-5,-8),(-2,-9),(0,-8),(2,-10)]),'#5eab70')
def crab(im,x,y):
    poly(im,[(x-14,y+5),(x-5,y+1),(x+7,y+1),(x+14,y+7),(x+9,y+11),(x-10,y+11)],'#937f61')
    for direction in (-1,1):
        def p(pts):return [(x+a*direction,y+b) for a,b in pts]
        for yy in (2,5,8):
            line(im,p([(4,yy-1),(8,yy),(10,yy+2),(12,yy+2)]),'#7c4850',2)
            line(im,p([(5,yy-1),(8,yy),(10,yy+1)]),'#de775e',1)
        poly(im,p([(5,1),(11,-4),(11,-7),(8,-8),(8,-13),(12,-15),(12,-11),(15,-13),(17,-10),(17,-7),(14,-4),(9,3)]),'#dc655c','#653748')
        line(im,p([(10,-12),(10,-10),(12,-8),(15,-8)]),'#ffad75',2)
        box(im,(x+direction*4-1,y-8,x+direction*4+1,y-2),'#373848')
        box(im,(x+direction*4-1,y-8,x+direction*4-1,y-7),'#ffebc1')
    poly(im,[(x-9,y+2),(x-6,y-3),(x+6,y-3),(x+9,y+2),(x+7,y+7),(x-6,y+7)],'#ee8164','#78364c')
    poly(im,[(x-6,y+4),(x+6,y+4),(x+5,y+6),(x-4,y+6)],'#ffe2a1')
    line(im,[(x-5,y),(x-2,y-1),(x+1,y-1)],'#ffbb83')
def shell(im,x,y):
    poly(im,[(x-8,y+3),(x-7,y-2),(x-4,y-5),(x+3,y-5),(x+8,y-2),(x+8,y+3),(x+3,y+6),(x-4,y+6)],'#ffc099','#936660')
    for dx in (-4,0,4):line(im,[(x+dx,y-3),(x+dx//2,y+2),(x+dx//2,y+4)],'#c07468')
    line(im,[(x-6,y),(x-5,y-2),(x-3,y-3)],C)
def beachweed(im,x,y):
    for dx,dy in [(-3,-3),(1,-6),(5,-4)]:
        line(im,[(x,y),(x+dx//2,y+dy//2),(x+dx,y+dy)],G)
        ImageDraw.Draw(im).point((x+dx,y+dy),fill=HIL)
def sea():
    im=Image.new('RGB',(W,H),'#2b777e')
    for i in range(155):
        x=R.randrange(-10,W);y=R.randrange(28,H-16);size=R.randrange(2,11)
        line(im,[(x,y),(x+size,y),(x+size+2,y-1)],R.choice(['#3d8987','#438e88','#438e88','#327e82','#56a79d']))
        if i%7==0: line(im,[(x-2,y+3),(x+3,y+3)],'#3d8987')
    return im
def header(im,a,b):
    box(im,(0,0,W,29),O)
    line(im,[(0,29),(W,29)],'#97ba97')
    text(im,(12,4),a,16);text(im,(13,36),b,8,F)
    box(im,(0,H-19,W,H),O)
    text(im,(13,H-15),'MARÉ MIÚDA  /  ESTUDO VISUAL — NÃO APLICADO',8,F)
def glint(im,x,y):
    line(im,[(x-3,y),(x+3,y)],C);line(im,[(x,y-3),(x,y+3)],C)
def cave(im,x,y):
    mound(im,x,y,2)
    poly(im,[(x-11,y+16),(x-11,y+5),(x-6,y-2),(x+4,y-3),(x+10,y+4),(x+12,y+15)],O,'#657873')
    line(im,[(x-6,y+11),(x-6,y+5),(x-2,y+1)],'#41606a',2)
    box(im,(x-14,y+16,x+14,y+17),S)
def sign(im,x,y,t):
    box(im,(x-1,y+5,x+1,y+14),'#764e44')
    box(im,(x-10,y-3,x+10,y+6),'#674e45',O)
    box(im,(x-9,y-2,x+9,y+3),'#edc384')
    text(im,(x-7,y-4),t,8,O)
def sample():
    im=sea()
    land(im,[(28,204),(21,170),(31,136),(51,128),(57,109),(79,105),(98,91),(124,88),(138,96),(159,93),(168,108),(163,140),(176,156),(168,187),(148,203),(106,196),(80,206),(52,200)],[(34,170),(40,139),(59,134),(69,116),(92,114),(108,102),(124,101),(128,117),(118,129),(99,129),(91,156),(65,165),(56,181)])
    land(im,[(210,102),(235,91),(255,97),(273,85),(299,88),(308,99),(326,99),(354,113),(363,137),(357,160),(345,170),(318,174),(304,192),(279,192),(267,180),(244,179),(228,163),(205,164),(201,145),(209,133)])
    p=[(146,124),(170,121),(188,123),(211,119),(237,127),(246,143),(235,160),(208,154),(177,158),(155,151)]
    poly(im,p,'#99c8a6','#bae0b6')
    for q in [(158,128),(183,128),(208,128),(233,128),(158,152),(183,152),(208,152),(233,152)]:
        x,y=q
        line(im,[(x-7,y-2),(x+7,y-2)],'#9fbd97')
        dots(im,x-7,y-3,[(0,0),(1,0),(12,0)])
    for p in [(51,145),(75,133),(104,116),(65,154)]:tree(im,*p)
    for p in [(95,178),(139,108),(284,113),(313,128),(342,145)]:mound(im,*p)
    for p in [(115,188),(82,181),(136,149),(281,158),(291,173),(325,143),(261,109),(246,159)]:beachweed(im,*p)
    for x,y in [(43,184),(132,179),(259,160),(339,150)]:
        poly(im,[(x-3,y+1),(x-2,y-2),(x+3,y-1),(x+2,y+2)],'#d4a87d','#a68a6f')
    # O tabuleiro tem limites de célula opcionais bem discretos; a previsão aparece só sobre a casa afetada.
    x,y=183,139
    for xx,yy in [(x-12,y-11),(x+11,y-11),(x-12,y+12),(x+11,y+12)]:
        dx=1 if xx<x else -1;dy=1 if yy<y else -1
        line(im,[(xx+dx*4,yy),(xx,yy),(xx,yy+dy*4)],C)
    crab(im,132,141);shell(im,290,142);glint(im,299,133)
    box(im,(9,213,376,247),O,'#5f9e91')
    text(im,(20,217),'BAIXA',12);text(im,(21,231),'SOBE EM 2 PASSOS',8,F)
    for i,c in enumerate((C,'#4d817e','#4d817e')): box(im,(140+i*13,224,147+i*13,231),c)
    for i,(tx,col) in enumerate((('AREIA',L),('BAIXIO','#99c8a6'),('ÁGUA','#448f8a'))):
        xx=199+i*60;box(im,(xx,222,xx+7,229),col); text(im,(xx+11,220),tx,7,F)
    header(im,'A TRAVESSIA','01 / TABULEIRO      PRAIA DAS CONCHAS')
    return im
def island(im,x,y,dx,dy):
    shape=[(x-dx,y),(x-dx+5,y-dy//2),(x-dx//2,y-dy+1),(x-4,y-dy+3),(x+dx//4,y-dy),(x+dx//2,y-dy//2),(x+dx-2,y-dy//3),(x+dx,y+3),(x+dx//2,y+dy),(x+2,y+dy-2),(x-dx//3,y+dy+2),(x-dx//2,y+dy//3)]
    grass=[(x-dx+5,y-1),(x-dx//2,y-dy+5),(x-5,y-dy+8),(x+dx//4,y-dy+4),(x+dx//2,y-dy//2),(x+dx-8,y),(x+dx//3,y+dy-6),(x-5,y+dy-7),(x-dx//3,y+dy-4)]
    land(im,shape,grass if dx>22 else None)
def mundo():
    im=sea();P=[(72,174,38,24),(126,100,33,24),(164,192,42,24),(203,136,34,29),(242,70,27,19),(300,103,37,25),(319,174,47,30),(355,71,19,16)]
    for p in P+[(37,110,10,10),(113,220,12,10),(255,198,12,9),(264,111,11,6),(358,213,14,9),(173,70,13,8)]:
        island(im,*p)
    for x,y,dx,dy in P:
        for t in range(4):
            X=x-dx//2+t*(dx//4);Y=y-2+R.randrange(-8,8)
            if t==0:mound(im,X,Y)
            else:tree(im,X,Y)
        if dx>30:
            beachweed(im,x+dx//2,y+8)
    # Silhuetas e marcos próprios distinguem os biomas à escala regional.
    for x,y in [(80,148),(92,163),(58,182)]:
        palm(im,x,y)
    for x,y in [(112,105),(101,91),(134,114),(143,93)]:
        mound(im,x,y)
    for x,y in [(145,192),(165,188),(185,193)]:
        tidepool(im,x,y)
    for x,y in [(188,130),(210,126),(211,153)]:
        cluster(im,x,y)
    for x,y in [(246,61),(252,79),(229,75)]:
        wave(im,x,y)
    cave(im,312,102)
    for x,y in [(303,178),(318,184),(342,165)]:
        mound(im,x,y)
    for x,y in [(228,174),(205,196),(326,211),(343,116),(73,91),(49,151)]:
        wave(im,x,y)
    for points in [[(72,176),(95,152),(109,123),(126,100),(149,123),(203,136)],[(72,176),(109,198),(164,192),(185,173),(203,136),(233,110),(242,70)],[(242,70),(270,88),(300,103),(314,126),(319,174),(353,139),(355,71)]]:
        for a,b in zip(points,points[1:]):
            for j in range(0,20,3):
                u=j/20;x=round(a[0]*(1-u)+b[0]*u);y=round(a[1]*(1-u)+b[1]*u)
                box(im,(x,y,x+1,y+1),C)
    for i,(x,y,*_) in enumerate(P,1):
        box(im,(x-5,y-5,x+5,y+5),O,C);text(im,(x-2,y-6),str(i),8,F)
    # O farol, a rosa dos ventos e os percursos usam a mesma grade da geografia.
    box(im,(354,48,359,62),C,O);box(im,(354,53,359,55),'#d67663')
    poly(im,[(352,48),(356,43),(361,48)],'#dc6c5f',O);glint(im,364,47)
    poly(im,[(28,62),(33,77),(28,91),(23,77)],C,O)
    poly(im,[(28,64),(31,77),(28,78),(25,77)],'#e48065',O)
    text(im,(23,48),'N',8,F)
    box(im,(12,225,374,248),O,'#5f9e91')
    for i,(tx,xx) in enumerate([('1 PRAIA',21),('2 RECIFES',81),('3 MANGUE',145),('8 FAROL',212)]):
        text(im,(xx,232),tx,8,F)
    text(im,(270,232),'· ROTAS ENTRE ILHAS',8,C)
    header(im,'ENTRE ILHAS','02 / MAPA-MÚNDI      O ARQUIPÉLAGO')
    return im
def cluster(im,x,y,s=1):
    # Vegetação de costa baixa: o contorno se diferencia do bosque alto.
    p=lambda pts:[(x+dx*s,y+dy*s) for dx,dy in pts]
    poly(im,p([(-7,2),(-6,-2),(-3,-2),(-1,-6),(4,-6),(5,-3),(8,-2),(8,3),(5,5),(-5,5)]),'#326750')
    poly(im,p([(-6,1),(-4,-1),(-2,-1),(0,-5),(4,-5),(4,-2),(7,-1),(7,2),(4,3),(-4,3)]),'#6ba46a')
    poly(im,p([(-5,1),(-4,-1),(-2,-1),(0,-4),(3,-4),(1,-2),(1,0),(-2,1)]),HIL)
    for a,b in [(-3,0),(2,-3),(5,0)]:
        box(im,(x+a*s,y+b*s,x+a*s,y+b*s),'#efbe78')
def palm(im,x,y):
    poly(im,[(x-7,y+4),(x+4,y+1),(x+15,y+6),(x+10,y+9),(x-3,y+9)],'#68815c')
    line(im,[(x,y+4),(x+2,y-7),(x+6,y-18)],'#98654d',3)
    line(im,[(x-1,y+2),(x+1,y-9),(x+5,y-18)],'#d3a568')
    for stem in [[(-10,-13),(-7,-18),(-1,-20),(6,-18)],[(6,-18),(12,-22),(18,-20),(20,-17)],[(6,-18),(12,-17),(16,-14),(18,-10)],[(6,-18),(2,-16),(-1,-12),(-2,-8)],[(6,-18),(7,-14),(11,-9),(12,-7)],[(6,-18),(3,-23),(-2,-25),(-6,-23)]]:
        p=[(x+i,y+j) for i,j in stem];line(im,p,'#355e51',4);line(im,p,'#77a968',2)
    box(im,(x+4,y-18,x+7,y-16),'#ae864f')
def tidepool(im,x,y):
    shape=[(-18,-1),(-16,-7),(-8,-10),(-2,-8),(7,-9),(16,-6),(18,0),(15,6),(7,9),(-4,8),(-10,10),(-16,5)]
    poly(im,[(x+i,y+j) for i,j in shape],'#709a73','#b5c892')
    poly(im,[(x+i,y+j) for i,j in [(-15,0),(-12,-6),(-7,-7),(-2,-5),(7,-6),(14,-4),(15,1),(10,5),(0,6),(-5,5),(-10,7),(-13,4)]],'#448e84')
    line(im,[(x-12,y+1),(x-6,y+1),(x-3,y-1),(x+3,y-1)],'#8dc9a3')
    line(im,[(x+6,y+2),(x+11,y+2)],'#72bba4')
def entry(im,x,y,num):
    # Os marcos são entradas de percurso, não cartões. O degrau claro mostra onde encostar.
    poly(im,[(x-9,y+1),(x-9,y-8),(x-6,y-12),(x+6,y-12),(x+9,y-8),(x+9,y+1)],'#41645e',O)
    poly(im,[(x-6,y+1),(x-6,y-7),(x-4,y-9),(x+4,y-9),(x+6,y-7),(x+6,y+1)],'#234758')
    line(im,[(x-8,y+2),(x+8,y+2)],'#f1d18d',2)
    text(im,(x-2,y-7),num,7,C)
def wave(im,x,y):
    line(im,[(x,y+2),(x+2,y+2),(x+4,y),(x+9,y),(x+12,y+2),(x+17,y+2)],'#6fb9a2')
    line(im,[(x+4,y+4),(x+7,y+3),(x+10,y+3)],'#559e91')
def praia():
    im=sea()
    land(im,[(19,185),(22,143),(32,120),(55,113),(70,94),(104,87),(117,75),(151,78),(171,66),(193,68),(209,63),(232,70),(250,54),(284,50),(306,59),(316,72),(343,82),(365,98),(369,124),(353,154),(328,177),(301,174),(273,188),(255,210),(213,215),(193,233),(158,240),(121,225),(99,230),(78,209),(49,209)],[(27,169),(34,135),(63,124),(82,105),(111,96),(122,83),(154,87),(172,74),(195,78),(210,73),(227,80),(247,67),(268,67),(281,58),(303,66),(306,80),(335,90),(350,103),(353,124),(333,151),(295,157),(262,178),(251,191),(214,202),(189,221),(162,227),(123,210),(98,212),(82,194),(53,193)])
    path=[(44,192),(67,184),(87,171),(102,151),(122,139),(151,148),(173,157),(205,152),(226,135),(251,124),(278,118),(318,108)]
    branch=[(204,152),(212,171),(220,177),(240,175),(259,162),(268,147)]
    for pts in [path,branch]:
        for color,width in [('#7c965f',11),('#bbac73',8),('#eaca8f',6)]:
            line(im,pts,color,width)
    # Clareiras, encosta e moitas não repetem a silhueta e os mesmos objetos em todas as margens.
    poly(im,[(97,110),(122,83),(155,88),(176,75),(202,83),(201,99),(181,109),(147,103),(125,119)],'#4d9169')
    line(im,[(95,113),(120,90),(151,95),(175,83),(200,89)],'#77a873')
    poly(im,[(89,177),(106,162),(125,159),(154,166),(177,174),(186,203),(170,217),(119,207)],'#5e9b68')
    for x,y in [(61,152),(103,123),(115,112),(147,107),(168,112),(193,101),(263,89),(290,83),(318,89),(128,192),(145,207),(184,201),(284,151),(313,149)]:
        tree(im,x,y)
    for x,y in [(45,166),(77,133),(80,196),(105,183),(154,176),(169,187),(204,179),(238,124),(278,128),(339,143)]:
        cluster(im,x,y)
    for x,y in [(39,156),(102,199),(221,187),(253,90),(340,157),(288,75)]:
        palm(im,x,y)
    tidepool(im,116,173);tidepool(im,253,200)
    for x,y in [(20,113),(57,90),(61,218),(31,197),(87,236),(173,242),(230,224),(283,218),(327,188),(355,166),(360,67),(180,54),(230,55)]:
        wave(im,x,y)
    for p in [(65,198),(139,165),(246,160),(271,178),(329,162),(234,197),(342,119)]:mound(im,*p)
    for p in [(50,184),(78,198),(117,165),(147,178),(162,183),(178,208),(281,169),(242,138),(294,121)]:beachweed(im,*p)
    cave(im,323,104)
    entry(im,65,181,'1');entry(im,155,147,'2');entry(im,268,147,'3');entry(im,304,111,'4')
    crab(im,87,169)
    # Bem-te-vi pequeno e lateral: barriga amarela, faixa clara na cabeça, dorso castanho.
    x,y=208,103
    poly(im,[(x-6,y+1),(x-3,y-3),(x+2,y-4),(x+6,y-1),(x+5,y+2),(x+1,y+4),(x-5,y+4)],'#694f46',O)
    poly(im,[(x-1,y+1),(x+5,y),(x+3,y+4),(x-3,y+4)],'#edc953')
    line(im,[(x+1,y-2),(x+5,y-2),(x+7,y-1)],F)
    line(im,[(x+5,y),(x+8,y+1)],'#59483d')
    box(im,(12,231,374,248),O,'#5f9e91')
    text(im,(21,236),'SIGA PELA COSTA   ·   EXPLORE A BIFURCAÇÃO',8,F)
    header(im,'PRAIA DAS CONCHAS','03 / MAPA CAMINHÁVEL      ROTA E RAMIFICAÇÃO')
    return im
if __name__=='__main__':
    dest=Path(__file__).parent/'renders';dest.mkdir(exist_ok=True)
    for name,fn in [('01-travessia',sample),('02-arquipelago',mundo),('03-mapa-da-praia',praia)]:
        im=fn().convert('RGBA');assert set(im.getchannel('A').get_flattened_data())=={255}
        for n in (1,3):
            out=im.resize((W*n,H*n),Image.Resampling.NEAREST)
            assert out.resize(im.size,Image.Resampling.NEAREST).tobytes()==im.tobytes()
            out.save(dest/f'{name}-{n}x.png',optimize=True)
