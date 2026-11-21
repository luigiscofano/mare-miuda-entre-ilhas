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
    ps=lambda pts:[(round(x+a*s),round(y+b*s)) for a,b in pts]
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
    # Garras de frente, com braços curtos e ligação contínua à carapaça.
    ink='#623645'
    def point(dx,dy): return x+dx,y+dy
    def side(side,coords): return [point(side*a,b) for a,b in coords]
    poly(im,[point(*q) for q in [(-14,7),(-9,4),(9,4),(14,7),(9,11),(-9,11)]],'#937f61')
    for a in (-1,1):
        for b in (3,6,8):
            line(im,side(a,[(5,b-2),(9,b),(12,b+1)]),ink,2)
            line(im,side(a,[(6,b-2),(9,b),(11,b)]),'#cc6c54')
        line(im,side(a,[(5,3),(9,-1),(10,-4)]),ink,5)
        line(im,side(a,[(5,2),(8,-1),(10,-4)]),'#ed8964',2)
        shape=[(7,-3),(6,-7),(6,-11),(8,-14),(10,-14),(10,-8),(13,-10),(13,-15),(16,-15),(17,-13),(17,-8),(15,-4),(12,-2),(9,-2)]
        poly(im,side(a,shape),'#d76557',ink)
        poly(im,side(a,[(8,-13),(9,-13),(9,-8),(10,-5),(8,-6),(7,-8)]),'#ff9e6e')
        line(im,side(a,[(12,-4),(14,-6),(15,-9)]),'#b54f50')
        box(im,(x+a*4-1,y-8,x+a*4+1,y-2),ink)
        box(im,(x+a*4-1,y-8,x+a*4-1,y-7),'#fff0bc')
    poly(im,[point(*q) for q in [(-9,1),(-7,-2),(-4,-4),(4,-4),(7,-2),(9,1),(9,5),(6,8),(-6,8),(-9,5)]],'#ed8a65',ink)
    poly(im,[point(*q) for q in [(-7,3),(-4,4),(4,4),(7,3),(6,6),(4,7),(-4,7),(-6,6)]],'#ffe4aa')
    line(im,[point(-6,0),point(-4,-1),point(2,-1)],'#ffb983')
    line(im,[point(-1,3),point(1,3)],ink)
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
def sample(grade=False, exemplo_lateral=False):
    im=sea()
    land(im,[(28,204),(21,170),(31,136),(51,128),(57,109),(79,105),(98,91),(124,88),(138,96),(159,93),(168,108),(163,140),(176,156),(168,187),(148,203),(106,196),(80,206),(52,200)],[(34,170),(40,139),(59,134),(69,116),(92,114),(108,102),(124,101),(128,117),(118,129),(99,129),(91,156),(65,165),(56,181)])
    land(im,[(210,102),(235,91),(255,97),(273,85),(299,88),(308,99),(326,99),(354,113),(363,137),(357,160),(345,170),(318,174),(304,192),(279,192),(267,180),(244,179),(228,163),(205,164),(201,145),(209,133)])
    p=[(146,124),(170,121),(188,123),(211,119),(237,127),(246,143),(235,160),(208,154),(177,158),(155,151)]
    poly(im,p,'#99c8a6','#bae0b6')
    for q in [(158,128),(183,128),(208,128),(233,128),(158,152),(183,152),(208,152),(233,152)]:
        x,y=q
        line(im,[(x-7,y-2),(x+7,y-2)],'#9fbd97')
        dots(im,x-7,y-3,[(0,0),(1,0),(12,0)])
    if grade:
        # Malha do tabuleiro, não do mapa caminhável. A ilustração não determina a colisão.
        for filas,cols in [(range(4,7),range(1,7)),(range(3,7),range(9,15))]:
            for row in filas:
                for col in cols:
                    x=12+24*col;y=21+24*row
                    for dx,dy in [(-12,-12),(12,-12),(-12,12),(12,12)]:
                        if im.getpixel((x+dx,y+dy)) in ((247,214,152),(230,180,119),(66,135,103)):
                            box(im,(x+dx,y+dy,x+dx,y+dy),'#b7b189')
        for col in (6,7,8,9):
            x=12+24*col
            for xx in (x-12,x+12):
                line(im,[(xx,128),(xx,152)],'#90bb9c')
        def base_bloqueada(x,y,w=24):
            # Traça só se a base bloqueada tiver uma célula vizinha ortogonal ao siri.
            sx=108 if exemplo_lateral else 132
            if not any(abs(x+12+k-sx)+abs(y+12-141)==24 for k in range(0,w,24)): return
            for dx,dy in [(0,0),(w-1,0),(0,23),(w-1,23)]:
                xx=x+dx;yy=y+dy
                a=1 if dx==0 else -1;b=1 if dy==0 else -1
                line(im,[(xx+a*3,yy),(xx,yy),(xx,yy+b*3)],'#64775d')
        for col,row in [(2,5),(3,4),(4,4)]:
            x=12+24*col;y=21+24*row
            tree(im,x,y+4)
            base_bloqueada(x-12,y-12)
        for col,row in [(4,6),(14,5)]:
            x=12+24*col;y=21+24*row
            mound(im,x,y-1,.73)
            base_bloqueada(x-12,y-12)
        for x in (252,276):
            base_bloqueada(x-12,105)
        mound(im,266,112,1.45)
        for x in (252,276):
            base_bloqueada(x-12,105)
    else:
        for p in [(51,145),(75,133),(104,116),(65,154)]:tree(im,*p)
        for p in [(95,178),(139,108),(284,113),(313,128),(342,145)]:mound(im,*p)
    for p in [(115,188),(82,181),(136,149),(281,158),(291,173),(325,143),(261,97 if grade else 109),(246,159)]:beachweed(im,*p)
    for x,y in [(43,184),(132,179),(259,160),(326 if grade else 339,150)]:
        poly(im,[(x-3,y+1),(x-2,y-2),(x+3,y-1),(x+2,y+2)],'#d4a87d','#a68a6f')
    # O tabuleiro tem limites de célula opcionais bem discretos; a previsão aparece só sobre a casa afetada.
    def cantos(x,y,col):
        for xx,yy in [(x-11,y-11),(x+11,y-11),(x-11,y+11),(x+11,y+11)]:
            dx=1 if xx<x else -1;dy=1 if yy<y else -1
            line(im,[(xx+dx*4,yy),(xx,yy),(xx,yy+dy*4)],col)
    if grade:
        cantos(108 if exemplo_lateral else 132,141,'#fff1bb')
        livres=[(84,141),(132,141)] if exemplo_lateral else [(132,117),(108,141),(156,141),(132,165)]
        for x,y in livres:
            cantos(x,y,'#d0f3b3')
    else:
        x,y=183,139
        for xx,yy in [(x-12,y-11),(x+11,y-11),(x-12,y+12),(x+11,y+12)]:
            dx=1 if xx<x else -1;dy=1 if yy<y else -1
            line(im,[(xx+dx*4,yy),(xx,yy),(xx,yy+dy*4)],C)
    crab(im,108 if exemplo_lateral else 132,141);shell(im,290,142);glint(im,299,133)
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
    # As oito paletas marcam biomas de composição; não mudam nomes, regras nem ordem.
    def verdor(x,y):
        poly(im,[(x-24,y+2),(x-16,y-10),(x+1,y-16),(x+16,y-9),(x+25,y+2),(x+12,y+13),(x-11,y+12)],'#88b66e')
        for dx,dy in [(-11,-3),(-2,5),(14,4)]:cluster(im,x+dx,y+dy)
        poly(im,[(x-20,y-2),(x-9,y-11),(x+3,y-13),(x+12,y-7),(x+6,y-4),(x-7,y-6)],'#9cc57e')
        line(im,[(x-22,y+4),(x-13,y+9),(x+7,y+9),(x+19,y+4)],'#568c62')
        palm(im,x+6,y-8)
    def cascatas(x,y):
        mound(im,x-8,y-5,2);mound(im,x+10,y)
        for points,width,col in [([(x+3,y-12),(x+3,y-5),(x+8,y-1),(x+8,y+8),(x+16,y+11)],5,'#535f60'), ([(x+2,y-12),(x+2,y-5),(x+7,y-1),(x+7,y+7),(x+15,y+10)],4,'#70cfbe'), ([(x+1,y-11),(x+1,y-5),(x+6,y),(x+6,y+7),(x+11,y+11)],1,F)]:
            line(im,points,col,width)
        line(im,[(x-24,y+2),(x-21,y-6),(x-16,y-11),(x-8,y-13)],'#a1aa93')
        line(im,[(x-20,y+5),(x-13,y+2),(x-3,y+3)],'#758f85')
        wave(im,x+9,y+11)
        wave(im,x+15,y+15)
    def vulcao(x,y):
        poly(im,[(x-30,y+12),(x-21,y-3),(x-13,y-11),(x-7,y-22),(x+5,y-24),(x+16,y-16),(x+22,y),(x+31,y+11),(x+11,y+17),(x-15,y+15)],'#71565a','#453d49')
        poly(im,[(x-15,y+12),(x-13,y),(x-7,y-15),(x-3,y-19),(x+4,y-19),(x+10,y-15),(x+15,y+10),(x+22,y+15),(x+6,y+17)],'#956758')
        for pts,col in [([(-26,8),(-15,6),(-6,8),(4,5),(19,9),(26,9)],'#aa755f'),([(-23,11),(-12,10),(-2,12),(8,9),(22,15)],'#513f4a'),([(-19,1),(-10,-1),(-5,2),(3,-2),(14,2),(21,4)],'#ba835f'),([(-14,-5),(-7,-7),(0,-6),(6,-9),(15,-5)],'#714b4e'),([(-9,-12),(-4,-14),(1,-11),(9,-15),(13,-12)],'#b88661')]:
            line(im,[(x+dx,y+dy) for dx,dy in pts],col)
        poly(im,[(x-8,y-20),(x-3,y-23),(x+7,y-22),(x+9,y-19),(x+4,y-16),(x-3,y-16)],'#473746')
        line(im,[(x+4,y-18),(x+2,y-11),(x+7,y-4),(x+3,y+2),(x+8,y+9),(x+19,y+14)],'#e07950',5)
        line(im,[(x+4,y-17),(x+3,y-11),(x+8,y-4),(x+4,y+2),(x+9,y+8),(x+19,y+13)],'#ffc270',2)
    def picos(x,y):
        for dx,dy,h in [(-15,3,23),(1,3,33),(15,9,26)]:
            xx=x+dx; yy=y+dy
            poly(im,[(xx-13,yy+4),(xx-4,yy-12),(xx+1,yy-h),(xx+8,yy-12),(xx+14,yy+4)],'#5a7a74',O)
            poly(im,[(xx-10,yy+3),(xx-1,yy-16),(xx+1,yy-h+2),(xx+2,yy-4),(xx+9,yy+3)],'#8ba497')
            poly(im,[(xx+1,yy-h+2),(xx+7,yy-12),(xx+13,yy+3),(xx+6,yy+3),(xx+2,yy-7)],'#456867')
            poly(im,[(xx-5,yy-14),(xx+1,yy-h+3),(xx+6,yy-14),(xx+1,yy-16),(xx-1,yy-11)],'#edf3d8')
            poly(im,[(xx+1,yy-h+3),(xx+6,yy-14),(xx+1,yy-16)],'#95bbc2')
            line(im,[(xx-8,yy-3),(xx-5,yy-6),(xx-2,yy-5)],'#b0bca3')
    def giros(x,y):
        pool=[(x-18,y),(x-13,y-11),(x+1,y-14),(x+14,y-8),(x+20,y+4),(x+10,y+11),(x-6,y+11)]
        poly(im,pool,'#247a7b','#a8d8a9')
        line(im,[(x-15,y+3),(x-13,y-3),(x-7,y-10),(x+4,y-11),(x+14,y-6)],'#61b7a2')
        line(im,[(x-9,y+9),(x+4,y+9),(x+13,y+6),(x+17,y+3)],'#72c4ab')
        for dx,dy in [(0,0),(26,11)]:
            cx=x+dx;cy=y+dy
            line(im,[(cx-10,cy+4),(cx-11,cy-1),(cx-7,cy-6),(cx+1,cy-7),(cx+8,cy-3),(cx+9,cy+1),(cx+4,cy+4),(cx,cy+3),(cx-2,cy),(cx+2,cy-1)],'#b9e7bd',1)
    def grutas(x,y):
        cave(im,x+7,y)
        mound(im,x-21,y+6)
        line(im,[(x-10,y-11),(x-2,y-17),(x+8,y-16),(x+15,y-13)],'#a7ae91')
        line(im,[(x+15,y-8),(x+23,y-6),(x+31,y+2)],'#758b83')
    def costa(x,y):
        poly(im,[(x-30,y-1),(x-13,y-16),(x+5,y-21),(x+23,y-15),(x+34,y-3),(x+32,y+8),(x+12,y+15),(x-12,y+11)],'#f4cb8e')
        for dx,dy in [(-24,2),(-13,8),(21,9),(29,2)]:shell(im,x+dx,y+dy)
        for dx,dy in [(-29,3),(-17,4),(-8,8),(8,7),(15,4),(28,9)]:
            line(im,[(x+dx,y+dy),(x+dx+2,y+dy)],'#cf9c67')
        palm(im,x-11,y-11);palm(im,x+16,y-10)
    def cristais(x,y):
        for dx,dy,w,h,skew in [(-13,1,5,12,-2),(-6,3,9,22,-2),(4,8,10,29,1),(13,5,6,17,3),(10,10,4,9,-1)]:
            xx=x+dx; yy=y+dy; l=w//2; tip=xx+skew
            poly(im,[(xx-l,yy-2),(xx-l-1,yy-h+7),(tip,yy-h),(xx+l,yy-h+6),(xx+l,yy-1),(xx,yy+2)],'#7788bd','#3a5279')
            poly(im,[(xx-l+1,yy-2),(xx-l,yy-h+7),(tip,yy-h+1),(xx+1,yy-h+9),(xx,yy+1)],'#c2d5e7')
            poly(im,[(xx+1,yy-h+9),(xx+l-1,yy-h+7),(xx+l-1,yy-2),(xx,yy)],'#576aa6')
            line(im,[(tip-1,yy-h+4),(xx-l+1,yy-h+8),(xx-l+1,yy-h+11)],'#edf3e4')
    for (x,y,*_),paint in zip(P,(verdor,cascatas,vulcao,picos,giros,grutas,costa,cristais)):
        paint(x,y)
    for x,y in [(73,91),(49,151),(226,174),(326,211),(343,116)]: wave(im,x,y)
    for points in [[(72,176),(95,152),(109,123),(126,100),(149,123),(203,136)],[(72,176),(109,198),(164,192),(185,173),(203,136),(233,110),(242,70)],[(242,70),(270,88),(300,103),(314,126),(319,174),(353,139),(355,71)]]:
        for a,b in zip(points,points[1:]):
            for j in range(0,20,3):
                u=j/20;x=round(a[0]*(1-u)+b[0]*u);y=round(a[1]*(1-u)+b[1]*u)
                box(im,(x,y,x+1,y+1),C)
    for i,(x,y,*_) in enumerate(P,1):
        box(im,(x-5,y-5,x+5,y+5),O,C);text(im,(x-2,y-3),str(i),8,F)
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
def arvores(im,x,y):
    # Casuarina baixa e curvada: mantém pé único, mas a copa não repete o bosque alto.
    poly(im,[(x-9,y+5),(x+6,y+2),(x+14,y+6),(x+6,y+10),(x-7,y+10)],'#32634d')
    line(im,[(x-2,y+7),(x-1,y-1),(x+4,y-10)],'#775345',3)
    poly(im,[(x-13,y-6),(x-11,y-12),(x-7,y-14),(x-5,y-18),(x+2,y-20),(x+7,y-18),(x+14,y-16),(x+18,y-11),(x+13,y-7),(x+5,y-6),(x-2,y-3),(x-9,y-3)],N)
    poly(im,[(x-12,y-8),(x-8,y-13),(x-4,y-14),(x-2,y-17),(x+5,y-18),(x+9,y-14),(x+15,y-13),(x+15,y-10),(x+7,y-10),(x-1,y-6),(x-9,y-5)],'#5c9460')
    line(im,[(x-8,y-10),(x-5,y-12),(x-1,y-12),(x+3,y-15),(x+8,y-14)],HIL)
def pedrafendida(im,x,y):
    poly(im,[(x-12,y+2),(x-11,y-4),(x-4,y-8),(x+2,y-11),(x+8,y-7),(x+11,y-1),(x+10,y+5),(x+3,y+8),(x-7,y+7)],'#4a6463','#2a5057')
    poly(im,[(x-10,y+1),(x-9,y-4),(x-3,y-6),(x+1,y-9),(x+5,y-6),(x+3,y-1),(x+7,y+2),(x-5,y+4)],'#9da18a')
    line(im,[(x+3,y-6),(x+2,y-2),(x-2,y),(x-2,y+3)],'#d0c69d')
def pocairregular(im,x,y):
    pts=[(x-17,y+2),(x-16,y-3),(x-12,y-7),(x-4,y-6),(x+2,y-9),(x+9,y-8),(x+11,y-4),(x+16,y-1),(x+16,y+5),(x+10,y+8),(x+3,y+5),(x-5,y+8),(x-13,y+6)]
    poly(im,pts,'#4e978a','#a7c38d')
    line(im,[(x-13,y+1),(x-10,y-3),(x-5,y-3),(x-1,y-5),(x+2,y-5)],'#79b6a0')
    line(im,[(x+1,y+2),(x+8,y+2),(x+10,y)],'#79b6a0')
def bemtevi(im,x,y):
    # Perfil autoral esguio, com cauda em degraus, bico estreito e dois pés.
    poly(im,[(x-13,y+5),(x-10,y+2),(x-6,y+1),(x-2,y-3),(x+3,y-6),(x+7,y-5),(x+8,y-2),(x+13,y-2),(x+14,y-1),(x+8,y),(x+6,y+3),(x+3,y+5),(x-3,y+5),(x-7,y+4)],'#73564b',O)
    poly(im,[(x-5,y+3),(x-1,y+1),(x+4,y),(x+7,y-1),(x+6,y+2),(x+2,y+4),(x-3,y+4)],'#e9b64f')
    poly(im,[(x-1,y-2),(x+2,y-5),(x+6,y-4),(x+8,y-2),(x+6,y),(x+2,y)],'#3b4744')
    line(im,[(x+1,y-3),(x+3,y-4),(x+6,y-3)],'#fff0bf')
    line(im,[(x+7,y-1),(x+12,y-1)],'#b69566')
    line(im,[(x-2,y+5),(x-3,y+7),(x-5,y+7)],'#583e38')
    line(im,[(x+1,y+5),(x+1,y+7),(x-1,y+8)],'#583e38')
def praia():
    im=sea()
    land(im,[(19,185),(22,143),(32,120),(55,113),(70,94),(104,87),(117,75),(151,78),(171,66),(193,68),(209,63),(232,70),(250,54),(284,50),(306,59),(316,72),(343,82),(365,98),(369,124),(353,154),(328,177),(301,174),(273,188),(255,210),(213,215),(193,224),(158,228),(121,224),(99,220),(78,209),(49,209)],[(27,169),(34,135),(63,124),(82,105),(111,96),(122,83),(154,87),(172,74),(195,78),(210,73),(227,80),(247,67),(268,67),(281,58),(303,66),(306,80),(335,90),(350,103),(353,124),(333,151),(295,157),(262,178),(251,191),(214,202),(189,216),(162,218),(123,209),(98,208),(82,194),(53,193)])
    path=[(44,192),(67,184),(87,171),(102,151),(122,139),(151,148),(173,157),(205,152),(226,135),(251,124),(278,118),(313,111),(330,109)]
    branch=[(204,152),(212,171),(220,177),(240,175),(259,162),(268,147)]
    for pts in [path,branch]:
        for color,width in [('#7c965f',11),('#bbac73',8),('#eaca8f',6)]:
            line(im,pts,color,width)
    # O relevo e a água são fundo. Cada objeto apoiado em terra é desenhado
    # depois, da margem traseira para a dianteira, e nenhum lago cruza seus pés.
    poly(im,[(96,105),(119,90),(150,94),(177,79),(194,85),(189,101),(164,108),(143,101),(120,117)],'#4d9169')
    line(im,[(97,110),(121,94),(146,99),(178,84),(191,89)],'#77a873')
    poly(im,[(94,176),(112,165),(141,171),(167,184),(179,203),(164,220),(121,209)],'#5e9b68')
    tidepool(im,133,184)
    pocairregular(im,236,197)
    for x,y in [(20,113),(57,90),(61,218),(31,197),(87,236),(173,242),(230,224),(283,218),(327,188),(355,166),(360,67),(180,54),(230,55)]: wave(im,x,y)
    objects=[
        (78,tree,292),(78,tree,304),(89,palm,249),(92,tree,274),
        (104,arvores,129),(109,tree,152),(106,tree,173),(109,tree,195),
        (118,tree,94),(123,cluster,218),(93,cave,330),
        (139,palm,43),(139,arvores,65),(143,cluster,238),(144,cluster,289),
        (154,tree,54),(157,cluster,331),(151,palm,331),(167,pedrafendida,292),
        (198,pedrafendida,69),(191,cluster,169),(193,cluster,197),
        (202,palm,187),(209,tree,106),(208,arvores,160),
    ]
    for y,obj,x in sorted(objects,key=lambda item:item[0]):
        obj(im,x,y)
    for x,y in [(48,167),(73,148),(185,121),(169,160),(231,188),(273,183),(317,148)]:
        beachweed(im,x,y)
    entry(im,58,186,'1');entry(im,150,151,'2');entry(im,269,149,'3');entry(im,314,114,'4')
    crab(im,87,168)
    for x,y in [(95,161),(99,154),(105,151),(141,145),(146,148),(177,158),(208,152),(215,145),(225,136),(238,134),(262,121),(271,119),(287,114),(303,116),(249,174),(255,169),(263,155)]:
        box(im,(x,y,x+1,y),'#b29b67')
    bemtevi(im,219,107)
    box(im,(12,237,374,250),O,'#5f9e91')
    text(im,(21,241),'SIGA PELA COSTA   ·   EXPLORE A BIFURCAÇÃO',8,F)
    header(im,'PRAIA DAS CONCHAS','03 / MAPA CAMINHÁVEL      ROTA E RAMIFICAÇÃO')
    return im
def temas():
    im=sea()
    for x,title in [(20,'MANGUE'),(204,'CRISTAIS')]:
        text(im,(x,67),title,12,C)
        land(im,[(x,150),(x+6,122),(x+29,109),(x+60,102),(x+98,106),(x+114,117),(x+146,129),(x+155,156),(x+137,183),(x+101,187),(x+66,179),(x+30,185),(x+3,173)])
        poly(im,[(x+32,136),(x+48,128),(x+67,134),(x+83,128),(x+101,135),(x+109,154),(x+93,162),(x+65,157),(x+45,165),(x+33,157)],'#99c8a6','#b6dfb1')
        for xx in (x+43,x+67,x+91):
            line(im,[(xx,137),(xx,158)],'#86b598')
        shell(im,x+128,148)
        crab(im,x+24,147)
    # No mangue, o tronco e as raízes sinalizam o mesmo obstáculo de base.
    x,y=73,118
    tree(im,x,y-3)
    for dx in (-11,-6,6,11):
        line(im,[(x,y-1),(x+dx//2,y+4),(x+dx,y+9)],'#6c5e46',2)
    cluster(im,109,120)
    # Afloramentos de cristal têm a mesma lógica de terreno sólido, outra silhueta.
    for x,y,h in [(268,121,24),(280,123,19),(302,129,16)]:
        poly(im,[(x-6,y+1),(x-6,y-h+5),(x,y-h),(x+7,y-h+6),(x+7,y+2),(x+1,y+5)],'#788bc0','#344e66')
        poly(im,[(x-4,y),(x-4,y-h+6),(x,y-h+2),(x+1,y-h+6),(x,y+3)],'#becfe4')
    box(im,(14,217,373,248),O,'#5f9e91')
    text(im,(26,227),'OS MOTIVOS MUDAM. AREIA · BAIXIO E MAR CONTINUAM.',8,F)
    header(im,'A TRAVESSIA','05 / MOTIVOS DE ILHA      DOIS EXEMPLOS CONCEITUAIS')
    return im

if __name__=='__main__':
    dest=Path(__file__).parent/'renders';dest.mkdir(exist_ok=True)
    for (name,fn),semente in zip([('01-travessia',sample),('02-arquipelago',mundo),('03-mapa-da-praia',praia),('04-travessia-malha',lambda:sample(grade=True)),('05-motivos-de-ilha',temas)],(None,None,None,12,520)):
        if semente is not None: R.seed(semente)
        im=fn().convert('RGBA');assert set(im.getchannel('A').get_flattened_data())=={255}
        for n in (1,3):
            out=im.resize((W*n,H*n),Image.Resampling.NEAREST)
            assert out.resize(im.size,Image.Resampling.NEAREST).tobytes()==im.tobytes()
            out.save(dest/f'{name}-{n}x.png',optimize=True)

    camada=Image.new('RGBA',(48,48))
    crab(camada,24,24)
    sprite=camada.crop(camada.getbbox())
    assert sprite.size==(35,27) and set(sprite.getchannel('A').get_flattened_data())=={0,255}
    sprite.save(dest/'siri-aprovado-1x.png')
