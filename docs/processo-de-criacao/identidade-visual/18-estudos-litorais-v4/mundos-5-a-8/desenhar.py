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
    for _ in range(155):
        x=r.randrange(12,365);y=r.randrange(44,248);w=r.randrange(5,28)
        c=r.choice((cap,mid,face,hi,hi))
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
    for i in range(17):
        x=r.randrange(-110,334);y=r.randrange(38,260);w=r.randrange(38,150)
        d.polygon([(x,y),(x+w,y),(x+w+14,y+4),(x+w-10,y+4),(x+w-10,y+7),(x+9,y+7),(x+9,y+4),(x,y+4)],fill=cols[r.choice((1,1,2))])
    for _ in range(142):
        x=r.randrange(372);y=r.randrange(33,262);w=r.randrange(2,17)
        d.line((x,y,x+w,y),fill=r.choice(cols[1:]),width=1)
        if w>11:d.line((x+5,y+2,x+w-2,y+2),fill=cols[1])

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
        routes=[[(43,201),(66,201),(66,174),(118,174),(118,166),(181,166),(181,140),(230,140)],[(230,140),(285,140),(285,116),(298,116),(322,116),(322,104),(340,104)]]
        for x,y,s in [(43,130,5),(151,99,5),(208,88,5),(283,72,4),(327,116,4),(52,203,2)]:
            rock(d,x,y,s,('#2e584f','#5a8261','#86a775','#e2d498'))
        for x,y in [(141,119),(257,177),(277,194),(99,78)]:
            d.polygon([(x,y),(x+24,y),(x+18,y+9),(x+4,y+9)],fill='#70483d')
            d.line((x+1,y,x+23,y),fill=GOLD); d.line((x+4,y+3,x+19,y+3),fill='#c69863')
    elif i==1:
        # Boca escura da caverna, lago interno e formações pontuais.
        earth(im,[(49,101),(49,86),(67,86),(67,74),(118,74),(118,82),(153,82),(153,92),(156,92),(156,117),(130,117),(130,128),(78,128),(78,119),(49,119)],('#152133','#2c3648','#4e5665','#6a7377','#b4b6ad'),r,13,1)
        d=ImageDraw.Draw(im)
        d.polygon([(64,116),(64,105),(69,105),(69,96),(119,96),(119,102),(129,102),(129,118)],fill='#152638')
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
        for x,y,s in [(20,149,4),(48,148,3),(138,90,7),(171,84,6),(194,111,3),(260,115,5),(328,86,5),(326,179,4)]:
            rock(d,x,y,s,('#403a50','#777484','#a6a3a0','#dccbc0'))
        for pts in [[(8,215),(36,215),(36,231),(90,231),(90,228),(122,228)],[(83,183),(116,183),(116,190),(147,190),(147,197),(175,197)],[(195,212),(232,212),(232,216),(273,216),(273,231),(315,231)],[(305,62),(349,62),(349,72),(382,72)],[(76,122),(102,122),(102,112),(125,112)]]:
            crest(d,pts,r,('#233a57','#476b88','#8aafb4','#eaf0dc'))
        terrace(d,[(259,114),(297,114),(297,103),(345,103),(345,116),(362,116),(362,135),(337,135),(337,141),(269,141),(269,133),(259,133)],('#66596c','#897375','#b3a092','#dab9a3'))
        for x0,y0 in [(122,179),(179,201),(232,176),(89,111),(291,220)]:
            d.line((x0,y0,x0+31,y0,x0+31,y0+4,x0+25,y0+4),fill='#d4e2de',width=2)
            d.line((x0+3,y0+5,x0+21,y0+5),fill='#86abaf')
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
        d.polygon([(256,72),(205,83),(178,92),(207,91),(256,76)],fill='#d5ad76')
        d.polygon([(265,73),(336,62),(368,63),(330,69),(265,77)],fill='#e7c583')
        d.rectangle((248,101,280,106),fill='#42515c')
        d.polygon([(251,103),(254,75),(256,64),(270,64),(272,76),(276,103)],fill='#efdfb8')
        d.polygon([(263,66),(270,64),(272,76),(276,103),(265,103)],fill='#a98f7a')
        d.rectangle((254,80,273,86),fill='#ac594d');d.rectangle((253,92,274,98),fill='#ac594d')
        d.rectangle((253,63,272,73),fill='#294452');d.rectangle((256,65,268,70),fill='#ffd888')
        d.polygon([(251,63),(255,59),(261,55),(268,58),(275,63)],fill='#ad634e')
        d.line((256,59,264,59),fill='#efc19c')
        d.rectangle((254,99,257,103),fill='#473e45')
        d.line((252,104,243,104,243,108,234,108),fill='#d8c69d',width=2)
        d.line((265,104,281,104,281,106,291,106),fill='#5b6061',width=2)
        d.line((255,75,269,75),fill='#fbefc6')
        d.line((255,85,264,85),fill='#de9076')
        d.line((255,95,263,95),fill='#df9177')
    # Seixos e plantas dispostos por local e bioma, sem moldes de árvores.
    for x,y,steps,c in [
       [(37,186,4,'#829970'),(74,127,3,'#a0b07d'),(166,183,5,'#879e77'),(200,158,3,'#93a77d'),(309,95,3,'#799570'),(349,125,4,'#91a781')],
       [(41,177,3,'#b2ab99'),(81,151,5,'#a6a391'),(134,164,4,'#707a77'),(181,132,3,'#a2a696'),(239,209,6,'#666f7a'),(355,147,4,'#a4a08b')],
       [(48,200,4,'#8f777b'),(83,203,3,'#cdb099'),(157,140,4,'#b0a099'),(186,124,6,'#9f8a87'),(306,182,5,'#ceb299'),(346,164,4,'#927e82')],
       [(57,201,4,'#d1ca9f'),(77,154,3,'#7a886e'),(104,203,6,'#9fa382'),(194,147,4,'#c9c29a'),(231,127,4,'#82927a'),(327,105,6,'#b5b294')]][i]:
        for line in range(steps): d.line((x+line*2,y+line,x+4+line*2,y+line),fill=c)
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
    sheet.resize((1568,1184),Image.Resampling.NEAREST).save(DIR/'seletores-mundos-5-a-8.png')
if __name__=='__main__':main()
