"""Quatro estudos de seletores, desenhados na grade lógica 384 × 288."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageChops, ImageFilter
from random import Random
from unicodedata import normalize
from letras import FONT
DIR=Path(__file__).resolve().parent
W,H=384,288
NAV='#102c43'; CREAM='#fff0cf'; GOLD='#f4c977'
FONT.update({'7':'11111 00001 00010 00100 01000 01000 01000','8':'01110 10001 10001 01110 10001 10001 01110','9':'01110 10001 10001 01111 00001 00001 11110','-':'00000 00000 00000 11111 00000 00000 00000'})
SIRI=Image.open(DIR/'siri-seletor.png').convert('RGBA')
def label(d,p,s,ink=CREAM,z=1):
    x,y=p
    for original in s.upper():
        c=normalize('NFD',original)[0]
        if original in 'ÁÉÍÓÚÀ':
            u=2*z if original!='À' else 3*z
            d.line((x+u,y-2*z,x+u+z,y-3*z),fill=ink,width=z) if original!='À' else d.line((x+u-z,y-3*z,x+u,y-2*z),fill=ink,width=z)
        for i,row in enumerate(FONT.get(c,'').split()):
            for j,k in enumerate(row):
                if k=='1': d.rectangle((x+j*z,y+i*z,x+(j+1)*z-1,y+(i+1)*z-1),fill=ink)
        x+=6*z

def mask(poly):
    m=Image.new('L',(W,H))
    ImageDraw.Draw(m).polygon(poly,fill=255)
    return m

def pxy(m,dx,dy):
    a=Image.new('L',(W,H));a.paste(m,(dx,dy));return a

def spread(m,n):
    return m.filter(ImageFilter.MaxFilter(2*n+1))

def earth(im,poly,colors,r,depth,t):
    m=mask(poly)
    dark,face,mid,cap,hi=colors
    shadow=pxy(spread(m,3),7,depth+5)
    im.paste(dark,mask=shadow)
    for off in range(depth,0,-1):
        c=dark if off>depth-3 else face if off>depth*.65 else mid if off%6 in (0,1) else face
        im.paste(c,mask=pxy(m,0,off))
    rock=Image.new('RGB',(W,H),cap)
    dd=ImageDraw.Draw(rock)
    # Facetas quebradas e estratos em grupos de pixels, não ruído uniforme.
    for _ in range(58):
        x=r.randrange(12,365);y=r.randrange(44,248);w=r.randrange(7,23)
        c=r.choice((cap,mid,mid,hi))
        dd.line((x,y,x+w,y),fill=c,width=r.choice((1,1,1,2,3)))
        if w>10: dd.line((x+r.randrange(2,6),y+2,x+w-2,y+2),fill=c,width=1)
    im.paste(rock,mask=m)
    im.paste(hi,mask=ImageChops.subtract(m,pxy(m,2,2)))
    return m

def sea(im,p,r):
    d=ImageDraw.Draw(im)
    cols=p[:4]
    # Bancos de corrente em quatro faixas e reflexos em comprimentos variados.
    d.rectangle((0,30,383,263),fill=cols[0])
    for i in range(9):
        x=r.randrange(-110,334);y=r.randrange(38,260);w=r.randrange(38,150)
        d.polygon([(x,y),(x+w,y),(x+w+14,y+4),(x+w-10,y+4),(x+w-10,y+7),(x+9,y+7),(x+9,y+4),(x,y+4)],fill=cols[r.choice((1,1,2))])

def reefs(im,m,foam,r,deep):
    # A rebentação deixa aberturas de água; desenhada só fora do terreno.
    rings=ImageChops.subtract(spread(m,11),spread(m,1))
    img=Image.new('RGB',(W,H),deep); im.paste(img,mask=rings)
    for n,c in [(7,foam[0]),(3,foam[1])]:
        ring=ImageChops.subtract(spread(m,n),spread(m,n-1))
        t=Image.new('L',(W,H),0);d=ImageDraw.Draw(t)
        for y in range(35,260,2):
            for x in range(-10,W,20):
                j=r.randrange(0,7);d.line((x+j,y,x+12+j,y),fill=255,width=2)
        im.paste(c,mask=ImageChops.multiply(ring,t))

def rock(d,x,y,s,c):
    sc=lambda pts:[(x+a*s,y+b*s) for a,b in pts]
    d.polygon(sc([(0,3),(1,1),(3,0),(6,1),(7,3),(6,5),(2,5)]),fill=c[0])
    d.polygon(sc([(0,3),(1,1),(3,0),(6,1),(4,2),(2,3)]),fill=c[2])
    d.polygon(sc([(2,3),(4,2),(6,1),(7,3),(6,4),(4,4)]),fill=c[1])
    d.line(sc([(1,3),(2,1),(3,1)]),fill=c[3],width=max(1,s//2))

def terrace(d,poly,c):
    for shift,color in ((5,c[0]),(3,c[1]),(0,c[2])):
        d.polygon([(x,y+shift) for x,y in poly],fill=color)
    for (x,y),(a,b) in zip(poly,poly[1:]):
        if y==b and a>x: d.line((x,y,a,y),fill=c[3])

def grasses(d,x,y,w,r,c):
    for _ in range(w//2):
        a=x+r.randrange(w); b=y+r.randrange(12)
        h=r.randrange(2,7)
        d.line((a,b,a,b-h),fill=r.choice(c))
        if h>3:d.point((a-1,b-h),fill=c[-1])

def crest(d,points,r,p):
    # A onda tem três bandas e espuma quebrada na frente da crista.
    for offset,w,c in ((4,8,p[0]),(1,6,p[1]),(-1,3,p[2])):
        d.line([(x,y+offset) for x,y in points],fill=c,width=w)
    for (x,y),(a,b) in zip(points,points[1:]):
        if y!=b:continue
        for u in range(x+2,a,7):d.line((u,y-3,min(u+r.randrange(2,6),a),y-3),fill=p[3])

def timber(d,x,y,length):
    # Marcas de marcenaria restritas às tábuas do passadiço.
    d.rectangle((x,y,x+length,y+10),fill='#433d43')
    d.rectangle((x+1,y,x+length-1,y+7),fill='#9e7651')
    for start in range(x+2,x+length-3,4):
        d.line((start,y+1,start,y+6),fill='#bb956a')
    d.rectangle((x-1,y-1,x+length+1,y),fill='#efce96')
    for u in (x,x+length-1):
        d.rectangle((u-1,y-3,u+2,y+10),fill='#675345')
        d.line((u-1,y-3,u+2,y-3),fill='#e9c890')
        d.point((u,y+3),fill='#292e38')

def bedding(d,x,y,width,c,levels=4):
    # Mesa de pedra com lâminas contínuas aderidas à própria face.
    outline=[(x,y+8),(x+7,y+8),(x+7,y+3),(x+15,y+3),(x+15,y),(x+width-8,y),(x+width-8,y+6),(x+width,y+6),(x+width,y+18),(x+width-7,y+18),(x+width-7,y+22),(x+5,y+22),(x+5,y+17),(x,y+17)]
    d.polygon([(a+3,b+5) for a,b in outline],fill=c[0])
    d.polygon(outline,fill=c[1])
    d.polygon(outline[:8]+[(x+width-6,y+11),(x+7,y+14),(x,y+12)],fill=c[2])
    for j in range(levels):
        x0=x+7+2*j; x1=x+width-3-j
        d.line((x0,y+14+j*2,x1,y+12+j*2),fill=c[0] if j%2==0 else c[3])
    d.line((x+15,y+1,x+width-9,y+1),fill=c[3])

def bridge(d,x0,x1,y):
    d.rectangle((x0,y-5,x1,y+8), fill='#193243')
    d.rectangle((x0,y-5,x1,y+4), fill='#97684b')
    for x in range(x0,x1,5):
        d.line((x,y-4,x,y+4),fill='#e9be7c')
    d.line((x0,y-4,x1,y-4),fill='#f3d398')

def trail(d,pts,active):
    for width,c,dy in ((12,'#192a33',3),(9,'#715a51',1),(7,'#e0b881' if active else '#648581',0),(2,'#ffe4a8' if active else '#9bb4a7',-2)):
        for ((x,y),(a,b)) in zip(pts,pts[1:]):
            assert x==a or y==b
            d.rectangle((min(x,a)-width//2,min(y,b)-width//2+dy,max(x,a)+width//2,max(y,b)+width//2+dy),fill=c)

def node(d,x,y,s,selected=False,opt=False):
    d.rectangle((x-9,y-8,x+10,y+10),fill='#13283b')
    d.rectangle((x-7,y-6,x+8,y+8),fill=GOLD if selected else '#376d73' if opt else '#456873')
    d.line((x-7,y-6,x+8,y-6),fill=CREAM if selected else '#95bdaf')
    label(d,(x-2,y-3),s,NAV if selected else CREAM)

PAL=[
('#153d57','#225771','#32798a','#59a4a2','#263949','#637066','#879278','#bbc38d','#e3d396'),
('#173b4b','#1e5664','#2e7982','#56a6a0','#172638','#3a4658','#5f6a70','#828779','#d1c5a0'),
('#182f4d','#24466a','#426780','#67949e','#212c42','#534c60','#7d686c','#a58e81','#dfc5a1'),
('#173651','#244c6b','#336f87','#68a1ad','#1b3044','#4d535c','#6f7772','#a0a68e','#dbd8ab')]
MAP=[
([
[(19,173),(34,173),(34,135),(56,135),(56,106),(105,106),(105,119),(122,119),(122,162),(114,162),(114,201),(82,201),(82,222),(19,222)],
[(151,110),(163,110),(163,77),(210,77),(210,83),(233,83),(233,125),(256,125),(256,164),(213,164),(213,199),(156,199),(156,169),(145,169),(145,128),(151,128)],
[(275,70),(349,70),(349,93),(365,93),(365,147),(344,147),(344,164),(277,164),(277,145),(268,145),(268,101),(275,101)],
],[(66,174),(181,140),(230,140),(298,116),(340,104)],
[(0,173),(1,140),(2,140),(3,116),(4,104)]),
([
[(25,160),(38,160),(38,97),(60,97),(60,72),(104,72),(104,59),(174,59),(174,76),(259,76),(259,49),(324,49),(324,69),(349,69),(349,108),(367,108),(367,205),(334,205),(334,230),(204,230),(204,208),(100,208),(100,231),(26,231)],
],[(70,183),(124,133),(193,175),(267,130),(325,177)],[]),
([
[(17,170),(31,170),(31,145),(77,145),(77,163),(108,163),(108,195),(93,195),(93,219),(43,219),(43,208),(17,208)],
[(118,97),(138,97),(138,67),(208,67),(208,82),(230,82),(230,129),(207,129),(207,176),(162,176),(162,151),(119,151)],
[(241,129),(260,129),(260,109),(306,109),(306,67),(345,67),(345,100),(371,100),(371,170),(347,170),(347,202),(297,202),(297,220),(245,220)],
],[(76,178),(303,148)],[]),
([
[(20,162),(37,162),(37,149),(79,149),(79,122),(117,122),(117,145),(138,145),(138,191),(118,191),(118,220),(52,220),(52,201),(20,201)],
[(173,117),(189,117),(189,91),(224,91),(224,66),(273,66),(273,51),(331,51),(331,73),(360,73),(360,118),(343,118),(343,140),(303,140),(303,162),(262,162),(262,181),(193,181),(193,163),(175,163)],
],[(86,174),(304,124)],[])
]
NAMES=['ILHAS À DERIVA','GRUTAS DA ESPUMA','BAÍA DA RESSACA','ARQUIPÉLAGO DO FAROL']
def art(i):
    im=Image.new('RGB',(W,H),NAV);r=Random(339+i);p=PAL[i]
    sea(im,p,r)
    polys,nodes,_=MAP[i]
    union=Image.new('L',(W,H))
    for poly in polys: union=ImageChops.lighter(union,mask(poly))
    reefs(im,pxy(union,0,8),(p[3],'#def0d3'),r,p[2])
    for j,poly in enumerate(polys):earth(im,poly,p[4:],r,(13,22,14,17)[i]+j%2*4,i)
    d=ImageDraw.Draw(im)
    if i==0:
        # Ilhotas e passadiços de madeira sobre o canal corrente.
        bridge(d,102,163,173);bridge(d,239,281,140)
        terrace(d,[(57,111),(105,111),(105,118),(114,118),(114,138),(95,138),(95,148),(60,148),(60,136),(47,136),(47,124),(57,124)],('#536653','#6e805d','#92a974','#c7cea0'))
        terrace(d,[(163,82),(206,82),(206,94),(232,94),(232,115),(210,115),(210,122),(164,122),(164,112),(157,112),(157,99),(163,99)],('#476961','#607d66','#829e72','#b9c78b'))
        terrace(d,[(282,73),(335,73),(335,79),(348,79),(348,101),(328,101),(328,106),(285,106),(285,94),(277,94),(277,81),(282,81)],('#4b6a62','#6c876c','#90a780','#c6cea0'))
        for x,y,w in [(65,122,23),(170,91,29),(204,108,14),(287,81,26),(324,89,16),(24,213,13),(199,184,10)]:grasses(d,x,y,w,r,('#687b61','#8ea576','#c6cd98'))
        for pts in [[(91,101),(113,101),(113,105),(137,105)],[(270,173),(317,173),(317,165),(356,165)],[(127,220),(178,220),(178,213),(216,213)]]:
            crest(d,pts,r,('#22576a','#327c83','#55aba1','#a5cfc0'))
        timber(d,94,176,38); timber(d,239,144,35)
        # Canais de corrente distintas desenhados como faixas, não tracinhos no mar.
        crest(d,[(125,204),(150,204),(150,210),(182,210)],r,('#165068','#287580','#428e8c','#83afa2'))
        d.rectangle((181,176,192,189),fill='#526553')
        d.rectangle((181,174,194,177),fill='#b8a47c')
        d.line((183,178,190,178),fill='#c9b693')
        routes=[[(43,201),(66,201),(66,174),(118,174),(118,166),(181,166),(181,140),(230,140)],[(230,140),(285,140),(285,116),(298,116),(322,116),(322,104),(340,104)]]
        for x,y,s in [(43,130,4),(208,89,4),(328,118,4)]:
            rock(d,x,y,s,('#2e584f','#5a8261','#86a775','#e2d498'))
        for x,y in [(126,119),(255,178),(264,193)]:
            d.polygon([(x,y),(x+24,y),(x+18,y+9),(x+4,y+9)],fill='#70483d')
            d.line((x+1,y,x+23,y),fill=GOLD); d.line((x+4,y+3,x+19,y+3),fill='#c69863')
    elif i==1:
        # Boca escura da caverna, lago interno e formações pontuais.
        earth(im,[(49,101),(49,86),(67,86),(67,74),(118,74),(118,82),(153,82),(153,92),(156,92),(156,117),(130,117),(130,128),(78,128),(78,119),(49,119)],('#152133','#2c3648','#4e5665','#6a7377','#b4b6ad'),r,13,1)
        d=ImageDraw.Draw(im)
        d.polygon([(61,119),(61,105),(68,105),(68,97),(83,97),(83,92),(111,92),(111,98),(130,98),(130,106),(141,106),(141,122),(124,122),(124,126),(70,126),(70,119)],fill='#263949')
        d.polygon([(65,116),(65,105),(73,105),(73,98),(113,98),(113,102),(128,102),(128,116),(117,116),(117,121),(74,121),(74,116)],fill='#122433')
        d.line((61,105,67,105,67,97,83,97,83,92,110,92),fill='#9d9b8e',width=2)
        d.line((77,119,74,109,80,103,83,113,87,116),fill='#59636a',width=2)
        d.line((117,116,122,107,125,111,128,111),fill='#465764',width=2)
        bedding(d,278,67,38,('#3f5060','#6d7780','#a09c91','#acb2a0'))
        bedding(d,266,195,57,('#3f5060','#65767b','#8d9287','#bdac94'))
        d.polygon([(71,120),(123,120),(123,125),(142,125),(142,140),(111,140),(111,135),(72,135)],fill='#3d9996')
        d.line((83,125,123,125),fill='#a6d9ba')
        terrace(d,[(166,79),(192,79),(192,84),(213,84),(213,107),(174,107),(174,100),(158,100),(158,89),(166,89)],('#465469','#737481','#9c9e8b','#c9bfaa'))
        terrace(d,[(258,55),(314,55),(314,68),(343,68),(343,92),(308,92),(308,104),(266,104),(266,96),(247,96),(247,76),(258,76)],('#3b465a','#666577','#a4a396','#cabfa6'))
        d.polygon([(173,154),(202,154),(202,148),(217,148),(217,158),(231,158),(231,184),(210,184),(210,195),(157,195),(157,174),(173,174)],fill='#4d5b64')
        d.polygon([(177,158),(202,158),(202,152),(214,152),(214,163),(225,163),(225,181),(204,181),(204,192),(162,192),(162,178),(177,178)],fill='#376a71')
        for x,y,w in [(182,164,17),(202,170,9),(168,185,12),(214,165,6)]:d.line((x,y,x+w,y),fill='#70aaab',width=1)
        for x,y in [(63,103),(123,110),(77,153),(243,116),(320,150)]:
            d.rectangle((x-1,y-1,x+2,y+2),fill='#f5cf8a')
            d.line((x-4,y+4,x+5,y+4),fill='#af8c66')
        for x,y,s in [(184,95,5),(231,91,3),(274,74,4),(298,101,2),(323,113,3),(217,192,3),(155,189,2),(294,204,3)]:
            d.polygon([(x,y),(x+s,y-s*4),(x+s*3,y-s*5),(x+s*4,y-s),(x+s*3,y+s)],fill='#594f78')
            d.polygon([(x,y),(x+s,y-s*4),(x+s*3,y-s*5),(x+s*2,y-s),(x+s,y+s)],fill='#9ac9bc')
            d.line((x+s+1,y-s*4,x+s*2,y-s*2),fill='#eff3cd')
        routes=[[(43,193),(70,193),(70,183),(105,183),(105,133),(124,133),(144,133),(144,175),(193,175),(217,175),(217,130),(267,130),(286,130),(286,177),(325,177)]]
    elif i==2:
        # Arrebentação longa ao redor do molhe e porto em camadas.
        for x,y,s in [(24,151,4),(151,85,6),(332,87,4),(326,177,4)]:
            rock(d,x,y,s,('#403a50','#777484','#a6a3a0','#dccbc0'))
        for pts in [[(8,215),(36,215),(36,231),(90,231),(90,228),(122,228)],[(83,183),(116,183),(116,190),(147,190),(147,197),(175,197)],[(195,212),(232,212),(232,216),(273,216),(273,231),(315,231)],[(305,62),(349,62),(349,72),(382,72)],[(76,122),(102,122),(102,112),(125,112)]]:
            crest(d,pts,r,('#233a57','#476b88','#8aafb4','#eaf0dc'))
        terrace(d,[(259,114),(297,114),(297,103),(345,103),(345,116),(362,116),(362,135),(337,135),(337,141),(269,141),(269,133),(259,133)],('#66596c','#897375','#b3a092','#dab9a3'))
        for x0,y0 in [(122,193),(185,213)]:
            d.line((x0,y0,x0+31,y0,x0+31,y0+4,x0+25,y0+4),fill='#d4e2de',width=2)
            d.line((x0+3,y0+5,x0+21,y0+5),fill='#86abaf')
        bedding(d,122,103,69,('#4b4056','#826d78','#b2a1a0','#c9b5ac'))
        bedding(d,278,143,51,('#55495d','#83717e','#af968d','#cab4a0'))
        timber(d,247,192,42)
        for x,base in [(260,201),(280,201)]:
            d.line((x,base,x,base+8),fill='#806f66',width=2)
        for x0,x1,y0 in [(99,162,170),(172,248,169),(259,287,155)]:
            bridge(d,x0,x1,y0)
        routes=[[(49,195),(76,195),(76,178),(102,178),(102,170),(162,170),(162,154),(185,154),(185,169),(248,169),(248,156),(283,156),(283,148),(303,148)]]
    else:
        # Farol e terraços: luz branca, faces frias e contraste da torre.
        for x,y,s in [(26,161,4),(86,132,5),(201,104,5),(226,97,4),(291,66,4),(334,81,3)]:
            rock(d,x,y,s,('#394e59','#647265','#a4a983','#ded9aa'))
        terrace(d,[(196,96),(221,96),(221,77),(252,77),(252,73),(285,73),(285,63),(321,63),(321,75),(345,75),(345,96),(330,96),(330,110),(296,110),(296,119),(239,119),(239,108),(196,108)],('#58636a','#7b8270','#b0ae89','#d5cfab'))
        terrace(d,[(71,160),(85,160),(85,132),(112,132),(112,151),(129,151),(129,177),(108,177),(108,185),(71,185)],('#57686c','#737c69','#a0a584','#d6cf9e'))
        for pts in [[(11,220),(31,220),(31,234),(76,234),(76,224),(129,224)],[(116,127),(140,127),(140,135),(168,135)],[(178,203),(227,203),(227,194),(256,194),(256,177),(296,177)],[(310,145),(348,145),(348,129),(371,129)]]:
            crest(d,pts,r,('#244659','#376978','#6ca3a4','#b9d8c8'))
        for x,y,w in [(32,185,20),(93,142,19),(188,127,13),(208,115,18),(291,107,17),(324,90,16)]:grasses(d,x,y,w,r,('#687a66','#98a47a','#c7c392'))
        bridge(d,126,184,179)
        routes=[[(52,198),(86,198),(86,174),(121,174),(121,179),(184,179),(184,161),(218,161),(218,146),(257,146),(257,124),(304,124)]]
        d.polygon([(256,72),(214,80),(190,87),(217,85),(256,76)],fill='#cab17b')
        d.polygon([(265,73),(318,64),(346,64),(318,69),(265,77)],fill='#e6c48a')
        d.polygon([(247,100),(278,100),(293,116),(263,116)],fill='#686c68')
        d.rectangle((245,101,281,105),fill='#555d60')
        d.rectangle((246,102,279,104),fill='#8c8877')
        d.polygon([(251,103),(254,75),(256,64),(270,64),(272,76),(276,103)],fill='#efdfb8')
        d.polygon([(263,66),(270,64),(272,76),(276,103),(265,103)],fill='#a98f7a')
        d.rectangle((254,80,273,86),fill='#ac594d');d.rectangle((253,92,274,98),fill='#ac594d')
        d.rectangle((253,63,272,73),fill='#294452');d.rectangle((256,65,268,70),fill='#ffd888')
        d.line((256,67,268,67),fill='#fff0bb')
        d.line((261,65,261,70),fill='#a8775e')
        d.line((247,75,277,75),fill='#3d4b53',width=2)
        for post in range(248,278,5):d.line((post,71,post,75),fill='#675f61')
        d.line((249,72,276,72),fill='#dfbea0')
        for yy in (82,94,98):
            d.line((264,yy,271,yy),fill='#884b49')
        d.polygon([(251,63),(255,59),(261,55),(268,58),(275,63)],fill='#ad634e')
        d.line((256,59,264,59),fill='#efc19c')
        d.rectangle((254,99,257,103),fill='#473e45')
        d.line((252,104,243,104,243,108,234,108),fill='#d8c69d',width=2)
        d.line((265,104,281,104,281,106,291,106),fill='#5b6061',width=2)
        d.line((255,75,269,75),fill='#fbefc6')
        d.line((255,85,264,85),fill='#de9076')
        d.line((255,95,263,95),fill='#df9177')
    for j,route in enumerate(routes):trail(d,route,j==0)
    for j,(x,y) in enumerate(nodes):node(d,x,y,str(j+1),j==0,i==0 and j>=3)
    cx,cy=routes[0][0];im.paste(SIRI,(cx-15,cy-24),SIRI)
    assert SIRI.size == (31,23)
    for dy in range(SIRI.height):
        for dx in range(SIRI.width):
            sr,sg,sb,alpha=SIRI.getpixel((dx,dy))
            assert alpha in (0,255)
            if alpha: assert im.getpixel((cx-15+dx,cy-24+dy))==(sr,sg,sb)
    d.rectangle((0,0,383,30),fill=NAV);d.line((17,28,367,28),fill='#4d858a')
    label(d,(17,8),NAMES[i],CREAM,2);label(d,(342,12),f'0{i+5}',GOLD,1)
    d.rectangle((0,264,383,287),fill=NAV);d.line((17,265,367,265),fill='#4d858a')
    label(d,(17,273),'WASD / SETAS: SIGA A TRILHA','#b1d1bb');label(d,(296,273),'ESTUDO',GOLD)
    return im
def main():
    sheet=Image.new('RGB',(784,592),NAV)
    for i,name in enumerate(('deriva','grutas','ressaca','farol')):
        a=art(i);big=a.resize((W*3,H*3),Image.Resampling.NEAREST)
        assert a.tobytes()==big.resize(a.size,Image.Resampling.NEAREST).tobytes()
        a.save(DIR/f'{name}-1x.png');big.save(DIR/f'{name}-3x.png')
        sheet.paste(a,((i%2)*400,(i//2)*304))
    sheet.resize((1568,1184),Image.Resampling.NEAREST).save(DIR/'seletores-mundos-5-a-8-v5.png')
if __name__=='__main__':main()
