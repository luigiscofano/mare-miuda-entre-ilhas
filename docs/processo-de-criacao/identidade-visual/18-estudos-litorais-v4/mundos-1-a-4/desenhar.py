"""Desenha quatro estudos do seletor, com perspectiva, luz e trilhas em grade nativa."""
from pathlib import Path
import math, random, unicodedata
from PIL import Image, ImageDraw, ImageFilter
import numpy as np
from letras import FONT

HERE=Path(__file__).resolve().parent
W,H=384,288
NAVY='#102c43'; IVORY='#fff0cf'; GOLD='#f4c977'; INK='#172337'
SPRITE=Image.open(HERE/'siri-seletor.png').convert('RGBA')
FONT.update({'7':'11111 00001 00010 00100 01000 01000 01000'})
def box(d,x,y,w,h,c):
    if w>0 and h>0:d.rectangle((x,y,x+w-1,y+h-1),fill=c)
def poly(d,p,c,x=0,y=0):
    d.polygon([(a+x,b+y) for a,b in p],fill=c)
def line(d,p,c,w=1):
    d.line(p,fill=c,width=w)
def label(d,x,y,txt,c=IVORY,scale=1):
    for raw in txt.upper():
        chars=unicodedata.normalize('NFD',raw)
        ch=chars[0]
        for j,row in enumerate(FONT.get(ch,'').split()):
            for i,n in enumerate(row):
                if n=='1':box(d,x+i*scale,y+j*scale,scale,scale,c)
        if len(chars)>1:
            if raw=='Ç':box(d,x+2*scale,y+7*scale,scale,scale,c)
            elif raw=='Ã':box(d,x+scale,y-2*scale,3*scale,scale,c)
            else:box(d,x+3*scale,y-2*scale,2*scale,scale,c)
        x+=scale*(4 if ch==' ' else 6)
def mask(points):
    m=Image.new('L',(W,H))
    ImageDraw.Draw(m).polygon(points,fill=255)
    return m
def shift(im,dx,dy):
    dst=Image.new('L',im.size);dst.paste(im,(dx,dy));return dst
def grow(im,n):
    return im.filter(ImageFilter.MaxFilter(n*2+1))
def shore(im, points, palette, deep, phase=0, tall=13):
    top=mask(points)
    cliff=shift(top,0,tall)
    # Projeta a face sob o piso; cada nível usa uma cor chapada e luz de noroeste.
    for off,c in [(31,'#1c4c5e'),(23,'#215f70'),(15,'#27777d'),(9,'#399085'),(5,'#65b0a0'),(2,'#96c8ad')]:
        im.paste(c,mask=grow(cliff,off))
    a=np.asarray(grow(cliff,1))>0;b=np.asarray(cliff)>0
    yy,xx=np.indices((H,W))
    foam=(a&~b)&(((xx+2*yy+phase)%31)<19)
    im.paste('#cfe7c6',mask=Image.fromarray(foam.astype(np.uint8)*255))
    for dy,c in [(tall,deep[0]),(tall-3,deep[1]),(tall-6,deep[2]),(4,deep[3]),(2,deep[4])]:
        im.paste(c,mask=shift(top,0,dy))
    im.paste(palette[0],mask=top)
    inner=top.filter(ImageFilter.MinFilter(11))
    body=top.filter(ImageFilter.MinFilter(29))
    im.paste(palette[1],mask=inner)
    im.paste(palette[2],mask=body)
    rng=random.Random(42+phase)
    d=ImageDraw.Draw(im)
    # Marcas de sedimento acompanham a face vertical, nunca a malha da trilha.
    for y in range(44,253,3):
        for x in range(9+(y*3)%13,372,13):
            if not b[y,x] or top.getpixel((x,y)) or rng.random()>.62:continue
            wid=rng.randrange(2,9)
            for u in range(x,min(x+wid,W)):
                if b[y,u] and not top.getpixel((u,y)):d.point((u,y),fill=deep[1 if rng.random()>.2 else 2])
    return top
def sea(idx):
    rng=random.Random(6322+idx)
    # Faixas discretas vêm de um campo largo de profundidade; a textura só
    # ocupa grupos esparsos de pixels, evitando ruído uniforme.
    yy,xx=np.indices((H,W))
    size=0.24 + 0.5*(yy/H) + .12*np.sin((xx+37*idx)/79+yy/73) - .11*np.cos(yy/16+xx/141)
    pal=np.array([(17,47,68),(20,57,77),(22,62,83),(24,68,88),(26,74,93),(30,85,100),(32,93,104),(38,102,107)])
    im=Image.fromarray(pal[np.minimum(7,np.maximum(0,(size*10).astype(int)))].astype('uint8'))
    d=ImageDraw.Draw(im)
    brush=['#23566a','#296477','#2d727d','#35828a','#479697']
    for _ in range(265):
        x=rng.randrange(4,W-25);y=rng.randrange(35,260)
        k=max(0,min(4, int((y-18)/78)+rng.randrange(-1,2)))
        w=rng.choice([2,4,6,7,11,14,19,23])
        box(d,x,y,w,1,brush[k])
        if w>10:
            box(d,x+4,y+1,w-7,1,brush[max(0,k-1)])
            if rng.random()<.42:box(d,x-2,y-2,max(2,w//3),1,brush[min(k+1,4)])
    return im

# Quatro plantas distintas: restinga, franja calcária, manguezal e falésia.
PRAIA=[(20,111),(36,111),(36,91),(65,91),(65,73),(116,73),(116,62),(191,62),(191,72),(225,72),(225,85),(262,85),(262,78),(308,78),(308,96),(344,96),(344,112),(365,112),(365,150),(346,150),(346,169),(315,169),(315,190),(273,190),(273,203),(229,203),(229,217),(188,217),(188,233),(125,233),(125,222),(99,222),(99,207),(81,207),(81,183),(54,183),(54,167),(25,167),(25,148),(20,148)]
RECIFE=[(24,131),(44,131),(44,118),(83,118),(83,109),(108,109),(108,89),(133,89),(133,84),(185,84),(185,103),(208,103),(208,112),(235,112),(235,101),(281,101),(281,112),(324,112),(324,135),(351,135),(351,151),(339,151),(339,172),(300,172),(300,198),(268,198),(268,224),(212,224),(212,237),(104,237),(104,217),(70,217),(70,201),(49,201),(49,181),(34,181),(34,162),(24,162)]
MANGUE=[(14,115),(34,115),(34,88),(64,88),(64,69),(139,69),(139,81),(163,81),(163,101),(185,101),(185,116),(221,116),(221,104),(242,104),(242,87),(285,87),(285,73),(344,73),(344,84),(371,84),(371,147),(350,147),(350,165),(325,165),(325,190),(296,190),(296,202),(257,202),(257,224),(211,224),(211,241),(142,241),(142,229),(105,229),(105,211),(79,211),(79,192),(50,192),(50,178),(26,178),(26,145),(14,145)]
ENSEADA=[(17,150),(38,150),(38,129),(71,129),(71,117),(110,117),(110,124),(143,124),(143,105),(167,105),(167,86),(200,86),(200,75),(240,75),(240,61),(264,61),(264,49),(340,49),(340,60),(366,60),(366,87),(377,87),(377,130),(356,130),(356,153),(340,153),(340,185),(305,185),(305,201),(274,201),(274,225),(207,225),(207,236),(138,236),(138,220),(90,220),(90,204),(59,204),(59,188),(33,188),(33,170),(17,170)]

def trail(d,points,kind):
    if kind=='side': under='#735752';middle='#c68c59';highlight='#e3b77b'
    elif kind=='shortcut': under='#46505a';middle='#8f8f7a';highlight='#b2b195'
    else: under='#805447';middle='#d89f63';highlight='#f2c77f'
    for p,q in zip(points,points[1:]):
        assert p[0]==q[0] or p[1]==q[1]
        line(d,(p,q),under,9);line(d,(p,(q[0],q[1])),middle,6);line(d,((p[0],p[1]-1),(q[0],q[1]-1)),highlight,3)
    for x,y in points[1:-1]:
        box(d,x-3,y-3,7,7,middle);box(d,x-2,y-2,5,3,highlight)
def badge(d,x,y,name,kind):
    outer=[(-7,-5),(-5,-5),(-5,-8),(5,-8),(5,-5),(7,-5),(7,7),(4,7),(4,9),(-4,9),(-4,7),(-7,7)]
    poly(d,outer,INK,x+1,y+1);poly(d,outer,('#e9b373' if kind!='side' else '#a7c8bf'),x,y)
    box(d,x-5,y-5,11,11,'#1e3d4e')
    if name in '1234':label(d,x-2,y-3,name)
    elif name=='*':label(d,x-2,y-3,'*','#b0ddbf')
    elif name=='>':label(d,x-2,y-3,'>',GOLD)
    else:
        box(d,x-4,y+1,9,2,'#a8d9bc');box(d,x-2,y-3,5,4,'#a8d9bc');box(d,x+3,y+2,2,2,'#a8d9bc')
def pebble(d,x,y,s,c,variant):
    h=max(4,s//2)
    shape=[(0,h-3),(3,h-3),(3,h-6),(s//3,h-6),(s//3,0),(s*2//3,0),(s*2//3,2),(s-4,2),(s-4,h//2),(s,h//2),(s,h+1),(s-5,h+1),(s-5,h+4),(3,h+4),(3,h+2),(0,h+2)]
    if s<12:
        shape=[(0,h-2),(2,h-2),(2,1),(s-2,1),(s-2,h-1),(s,h-1),(s,h+2),(2,h+2),(2,h),(0,h)]
    poly(d,shape,c[0],x+3,y+3);poly(d,shape,c[1],x,y);poly(d,shape,c[2],x,y-3)
    box(d,x+s//3,y-2,max(2,s//3),2,c[3]);box(d,x+3,y+h-1,max(2,s//3),1,c[3])
    if variant%3==0:box(d,x+s*2//3,y+h//2,3,2,c[1])
def canopy(d,x,y,size,style,rng):
    # Copas têm aglomerados soltos, silhuetas escalonadas e sombra projetada.
    trunk='#704b43' if style=='shore' else '#584a3d'
    dark,mid,lit,hi=(('#244b42','#387458','#65985b','#afbc72') if style=='shore' else ('#173d38','#285742','#558257','#9bad65'))
    box(d,x-9,y+7,size+10,6,'#324c40')
    box(d,x-3,y-2,7,13,trunk);box(d,x-3,y+1,2,9,'#b98551')
    if style=='mangue':
        for dx in [-8,-5,3,6]:
            line(d,[(x,y),(x+dx//2,y+5),(x+dx,y+10)],trunk,2)
    for j in range(6):
        a=x+rng.randrange(-size//2,size//2);b=y+rng.randrange(-size//2,2)
        w=rng.randrange(size//3,size//2+3);h=rng.randrange(6,size//3+4)
        p=[(0,4),(4,4),(4,1),(w-3,1),(w-3,4),(w,4),(w,h-3),(w-3,h-3),(w-3,h),(2,h),(2,h-3),(0,h-3)]
        poly(d,p,dark,a+1,b+2);poly(d,p,mid,a,b)
        box(d,a+3,b+2,w-6,2,lit);box(d,a+2,b+4,w-5,2,lit)
        if j%2:box(d,a+4,b+1,w//3,1,hi)
        box(d,a+w//2,b+h-3,w//4,1,dark)
def palm(d,x,y,s,rng):
    shadow='#a77b58'
    line(d,[(x,y),(x+s//3,y-1),(x+s//2,y-7)],shadow,3)
    line(d,[(x,y),(x-2,y-7),(x-1,y-s+6)],'#674840',4)
    line(d,[(x-1,y-2),(x-3,y-8),(x-2,y-s+6)],'#c69053',1)
    cy=y-s+5
    for k,(dx,dy) in enumerate([(-s//3,2),(-s//2,7),(-s//2,-2),(-s//4,-6),(s//4,-5),(s//3,-1),(s//2,6),(s//3,10)]):
        points=[(x-1,cy),(x+dx//2,cy+dy//2-2),(x+dx,cy+dy),(x+dx+1,cy+dy+4),(x+dx//2,cy+dy//2+3)]
        poly(d,points,'#35684e');line(d,points[:3],('#83a961' if k in [1,2,3,4,5] else '#609454'))
        if k in [2,4,5]:box(d,x+dx//2,cy+dy//2,4,1,'#b1bd6d')
def grasses(d,x,y,c,a,rng):
    for j in range(rng.randrange(3,6)):
        dx=rng.randint(-5,5);hh=rng.randint(2,6)
        line(d,[(x+dx,y),(x+dx,y-hh),(x+2*dx,y-hh-1)],c)
        box(d,x+dx,y-hh,1,2,a)
def wharf(d,x,y,reverse=False):
    h=28;w=15
    for dx in [0,w-1]:
        box(d,x+dx,y+3,2,h,'#463e42')
    box(d,x,y,w,h,'#805448');box(d,x+1,y+1,w-2,h-3,'#ac7752')
    for j in range(2,h-1,4):
        box(d,x+1,y+j,w-2,1,'#dfad6a');box(d,x+1,y+j+2,w-2,1,'#674b42')
    for dx in [-2,w]:
        for dy in [1,h-3]:
            box(d,x+dx,y+dy,3,5,'#533d3e');box(d,x+dx,y+dy,2,1,'#f5c883')
def pool(d,p,colors):
    poly(d,[(a,b+2) for a,b in p],colors[0]);poly(d,p,colors[1])
    for q,c in [(2,colors[2]),(5,colors[3])]:
        xs=[a for a,b in p];ys=[b for a,b in p];cx=(min(xs)+max(xs))//2;cy=(min(ys)+max(ys))//2
        poly(d,[(a+(q if a<cx else -q),b+(q if b<cy else -q)) for a,b in p],c)
def coral(d,x,y,v):
    color=['#a75d6b','#be755f','#b4905d','#a3798e'][v%4]
    hi=['#de9293','#e8a17d','#e6bb85','#ceb0a8'][v%4]
    box(d,x-1,y-8,3,9,color);box(d,x-5,y-8,2,5,color);box(d,x-4,y-4,5,2,color)
    box(d,x+3,y-10,2,7,color);box(d,x+1,y-4,4,2,color)
    box(d,x-1,y-8,1,7,hi);box(d,x-5,y-8,1,3,hi);box(d,x+3,y-10,1,5,hi)
def sea_life(d,x,y,kind):
    if kind=='fish':
        p=[(-3,0),(-5,-2),(-5,3),(-2,1),(2,2),(5,1),(5,-1),(2,-2),(-1,-1)]
        poly(d,p,'#63aeb0',x,y);box(d,x+2,y-1,2,1,'#a2cac0')
    else:
        line(d,[(x-6,y),(x-3,y),(x-3,y-2),(x+5,y-2)],'#77bfac')
        line(d,[(x-2,y+2),(x+4,y+2),(x+4,y),(x+8,y)],'#bad8bf')
def landscape(idx):
    im=sea(idx);rng=random.Random(1582+idx)
    themes=[(PRAIA,['#f5cf8a','#e4b275','#d7a467'],['#4b4450','#7e5d55','#a86b51','#bd8659','#e1aa67']),
       (RECIFE,['#ceb37f','#ada275','#999f82'],['#434958','#666273','#88887b','#9c9076','#caaa7e']),
       (MANGUE,['#b49c6f','#859258','#59794e'],['#39433c','#5e5c49','#8b7352','#917f50','#b39865']),
       (ENSEADA,['#d7b87c','#b29667','#8b9664'],['#574b50','#6d645c','#938360','#ad956b','#cdc07b'])]
    contour,pal,rockface=themes[idx]
    # Rochedos distantes e areia submersa não repetem o mapa jogável.
    if idx==0:
        shore(im,[(263,55),(277,55),(277,49),(303,49),(303,55),(329,55),(329,64),(305,64),(305,71),(263,71)],pal,rockface,5,8)
    if idx==1:
        shore(im,[(35,65),(51,65),(51,54),(89,54),(89,61),(106,61),(106,78),(89,78),(89,85),(52,85),(52,77),(35,77)],pal,rockface,7,9)
        shore(im,[(252,61),(272,61),(272,50),(319,50),(319,63),(341,63),(341,72),(331,72),(331,80),(274,80),(274,72),(252,72)],pal,rockface,8,8)
    if idx==2:
        shore(im,[(181,69),(196,69),(196,61),(222,61),(222,69),(237,69),(237,81),(213,81),(213,89),(191,89),(191,80),(181,80)],pal,rockface,13,6)
    top=shore(im,contour,pal,rockface,idx*5,13+idx)
    d=ImageDraw.Draw(im)
    detail=[('#e4b778','#f8da9b'),('#b4aa90','#dbbf82'),('#738753','#a6a563'),('#a39768','#c3b17a')][idx]
    for _ in range(270):
        x=rng.randrange(21,363);y=rng.randrange(50,243)
        if top.getpixel((x,y)) and top.getpixel((min(x+12,W-1),y)):
            count=rng.randrange(1,12)
            box(d,x,y,count,1,detail[0])
            if count>7:box(d,x+3,y+2,count//2,1,detail[1])
    if idx==0:
        for x,y,s in [(79,100,40),(96,104,32),(121,102,27),(292,112,36),(314,116,43),(101,186,29),(176,196,31),(243,172,27)]:
            palm(d,x,y,s,rng)
        for x,y,s in [(144,89,18),(170,91,26),(209,100,17),(295,156,22),(316,151,14)]:
            pebble(d,x,y,s,['#a77b58','#947464','#bb9c7c','#f3d5a0'],x)
        for x,y in [(91,157),(216,99),(181,188),(193,191),(335,111),(119,215),(276,155),(80,138),(123,104)]:
            grasses(d,x,y,'#738c56','#a0a95f',rng)
        for x,y in [(99,172),(194,205),(282,174),(330,145),(153,107)]:
            stagger=[(-3,0),(2,0),(-6,3),(0,3),(-3,5)]
            for j,(a,b) in enumerate(stagger):box(d,x+a,y+b,2+j%2,1,'#fbdea4')
        for x,y in [(279,230),(305,212),(350,181),(50,212)]:sea_life(d,x,y,'fish')
    if idx==1:
        for p in [[(72,158),(92,158),(92,165),(111,165),(111,176),(101,176),(101,185),(74,185),(74,178),(62,178),(62,165),(72,165)],[(170,172),(191,172),(191,163),(214,163),(214,171),(242,171),(242,188),(227,188),(227,197),(197,197),(197,188),(171,188)],[(123,202),(140,202),(140,194),(159,194),(159,204),(178,204),(178,219),(159,219),(159,225),(132,225),(132,218),(123,218)]]:
            pool(d,p,['#847d76','#dcc497','#74a397','#407982'])
        for x,y,v in [(66,175,0),(92,181,1),(178,180,2),(223,186,0),(117,193,3),(146,210,0),(161,219,2),(279,185,1),(295,188,3),(90,104,2),(118,103,1)]:
            coral(d,x,y,v)
        for x,y,s in [(141,106,17),(154,103,25),(182,116,15),(247,114,19),(278,125,22),(293,151,31),(320,143,18),(109,193,13),(206,153,13)]:
            pebble(d,x,y,s,['#655f68','#797478','#aaa38a','#e3ce9b'],y)
        for x,y in [(95,55),(258,87),(332,94),(320,207),(293,232),(54,220),(113,235)]:sea_life(d,x,y,'fish' if x%2 else 'surf')
    if idx==2:
        for p in [[(133,149),(143,149),(143,160),(164,160),(164,168),(196,168),(196,156),(212,156),(212,147),(241,147),(241,154),(263,154),(263,174),(236,174),(236,180),(211,180),(211,193),(184,193),(184,182),(151,182),(151,170),(129,170),(129,159),(114,159),(114,152),(133,152)],[(198,207),(220,207),(220,199),(240,199),(240,210),(224,210),(224,222),(201,222),(201,216),(184,216),(184,211),(198,211)]]:
            pool(d,p,['#53624a','#b09665','#76a88a','#3f756a'])
        for x,y,s in [(72,109,33),(102,90,48),(128,102,34),(154,113,41),(284,108,52),(308,116,38),(334,106,42),(327,144,32),(291,157,38),(83,177,40),(111,172,36),(139,207,48),(159,220,37),(247,217,45),(277,192,33),(304,183,43)]:
            canopy(d,x,y,s,'mangue',rng)
        for x,y in [(76,151),(226,192),(247,198),(263,175),(198,188),(122,181),(295,172),(92,132),(303,170)]:
            grasses(d,x,y,'#4d7450','#94ad68',rng)
        for x,y in [(291,224),(316,213),(357,161),(367,88),(50,214)]:sea_life(d,x,y,'fish')
    if idx==3:
        # O promontório acrescenta uma face alta de arenito; o caminho continua ortogonal.
        cliff=[(231,87),(255,87),(255,73),(280,73),(280,62),(336,62),(336,74),(360,74),(360,97),(346,97),(346,111),(320,111),(320,119),(287,119),(287,109),(248,109),(248,100),(231,100)]
        dl=['#5a4d59','#746861','#9a8667','#b89f6a','#a4a865','#b6b47d']
        for dy,c in [(20,dl[0]),(17,dl[1]),(12,dl[2]),(7,dl[3]),(3,dl[4]),(0,dl[5])]:poly(d,cliff,c,0,dy)
        for y,x,w in [(105,250,21),(110,261,19),(117,296,19),(123,310,13),(126,326,12),(116,327,16),(112,347,7),(96,335,13),(98,275,12)]:
            box(d,x,y,w,1,dl[3]);box(d,x+4,y+2,w//2,1,dl[1])
        # Farol baixo da Enseada, ainda parte do tema, não um novo nó.
        x,y=333,70
        box(d,x-4,y+2,22,4,'#6f7359');box(d,x,y-11,14,14,'#9d7868');box(d,x,y-11,9,14,'#ebd092')
        box(d,x-2,y-14,18,4,'#6e5358');box(d,x+1,y-19,12,6,'#c98754')
        box(d,x+3,y-18,7,4,'#f5d892');box(d,x-3,y-21,20,3,'#594855')
        box(d,x+4,y-4,4,7,'#614e4c')
        for x,y,s in [(73,155,24),(104,145,13),(149,143,25),(171,124,15),(185,118,27),(209,112,13),(273,162,26),(302,158,33),(324,161,18),(164,198,21),(183,195,15),(209,190,23)]:
            pebble(d,x,y,s,['#64575e','#8b7f6d','#b4a583','#e1ce9f'],x)
        for x,y in [(40,158),(74,179),(127,159),(142,166),(156,155),(198,155),(236,137),(257,147),(286,130),(317,112),(190,216),(225,212),(258,206),(273,182),(306,172)]:
            grasses(d,x,y,'#708450','#aab570',rng)
        for x,y in [(23,182),(312,206),(362,164),(349,209),(76,228)]:sea_life(d,x,y,'surf')
        # Silhueta discreta da garça sobre a água, não confundida com um ponto de fase.
        p=[(0,4),(8,3),(12,0),(15,0),(15,3),(12,5),(20,5),(19,7),(12,8),(9,6),(4,6)]
        poly(d,p,'#f0d9aa',218,47);box(d,231,46,7,1,'#b98562')
    return im

SCENES=[
    ('praia-das-conchas','Praia das Conchas','Cabo Baixo','Primeira onda',
      [(47,131),(104,128),(184,124),(250,128),(293,127),(338,123),(144,184)],
      [(0,1,[(76,131),(76,128)],'main'),(1,2,[(129,128),(129,117),(160,117),(160,124)],'main'),(2,3,[(206,124),(206,139),(229,139),(229,128)],'main'),(3,4,[(271,128),(271,127)],'main'),(4,5,[(315,127),(315,123)],'main'),
       (1,6,[(104,151),(123,151),(123,184)],'side'),(6,3,[(144,201),(205,201),(205,164),(250,164)],'shortcut')],
      ['c','1','2','3','4','>','*']),
    ('recifes-expostos','Recifes Expostos','Franja de Pedra','Acima da espuma',
      [(53,146),(130,142),(218,135),(310,151)],
      [(0,1,[(82,146),(82,141),(105,141),(105,142)],'main'),(1,2,[(154,142),(154,126),(191,126),(191,135)],'main'),(2,3,[(251,135),(251,156),(286,156),(286,151)],'main'),
       (0,3,[(53,176),(92,176),(92,196),(186,196),(186,221),(257,221),(257,192),(289,192),(289,169),(310,169)],'shortcut')],
      ['c','1','2','3']),
    ('mangue-dos-siris-duplos','Mangue dos Siris Duplos','Raízes e remansos','Raízes vizinhas',
      [(37,143),(109,130),(210,133),(327,130)],
      [(0,1,[(57,143),(57,130)],'main'),(1,2,[(147,130),(147,122),(184,122),(184,133)],'main'),(2,3,[(234,133),(234,119),(302,119),(302,130)],'main'),
       (0,3,[(37,158),(62,158),(62,172),(91,172),(91,196),(120,196),(120,223),(179,223),(179,232),(245,232),(245,196),(271,196),(271,166),(314,166),(314,152),(327,152)],'shortcut')],
      ['c','1','2','3']),
    ('enseada-da-garca','Enseada da Garça','Costa de arenito','Sombra na restinga',
      [(42,161),(113,155),(187,141),(224,125),(278,100),(326,89)],
      [(0,1,[(78,161),(78,155)],'main'),(1,2,[(145,155),(145,146),(169,146),(169,141)],'main'),(2,3,[(207,141),(207,125)],'main'),(3,4,[(224,113),(263,113),(263,100)],'side'),(4,5,[(300,100),(300,90),(312,90),(312,89)],'side'),
       (0,3,[(42,172),(62,172),(62,194),(107,194),(107,213),(155,213),(155,219),(214,219),(214,185),(235,185),(235,160),(224,160)],'shortcut')],
      ['c','1','2','3','*','*'])]
def screen(scene,idx):
    id,title,subtitle,focus,nodes,edges,badges=scene
    im=landscape(idx);d=ImageDraw.Draw(im)
    portx,porty=nodes[0]
    wharf(d,portx-7,porty+3)
    for a,b,dots,kind in sorted(edges,key=lambda e:e[3]!='shortcut'):
        trail(d,[nodes[a],*dots,nodes[b]],kind)
    x,y=nodes[1];box(d,x-13,y-12,27,25,'#ffe3a2');box(d,x-12,y-11,25,23,'#1a3b4c')
    for j,((x,y),name) in enumerate(zip(nodes,badges)):badge(d,x,y,name,'side' if name=='*' else 'main')
    x,y=nodes[1]
    # Pés acima do marcador, sem cobrir o número nem reamostrar o sprite aprovado.
    anchor=(x-15,y-33)
    box(d,x-10,y-11,21,3,'#503e45')
    im.paste(SPRITE,anchor,SPRITE.getchannel('A'));d=ImageDraw.Draw(im)
    box(d,0,0,W,32,NAVY);box(d,0,31,W,1,'#617f82');box(d,0,32,W,1,'#304d5b')
    box(d,9,8,24,18,'#203e50');box(d,9,8,24,1,'#779295')
    label(d,13,13,f'0{idx+1}',GOLD)
    label(d,41,10,title,IVORY,2)
    box(d,0,263,W,25,NAVY);box(d,0,263,W,1,'#6e9090')
    label(d,11,272,subtitle,'#9dc7bf')
    label(d,165,272,focus,IVORY)
    label(d,332,272,'ESTUDO',GOLD)
    return im,anchor
def main():
    imgs=[]
    for idx,scene in enumerate(SCENES):
        im,anchor=screen(scene,idx)
        # Valida RGB opaco, sprites exatos em área opaca e exportações sem interpolação.
        assert im.mode=='RGB' and im.size==(384,288)
        assert set(SPRITE.getchannel('A').getdata())=={0,255}
        crop=np.asarray(im.crop((*anchor,anchor[0]+31,anchor[1]+23)))
        src=np.asarray(SPRITE)
        assert np.array_equal(crop[src[:,:,3]>0],src[:,:,:3][src[:,:,3]>0])
        zoom=im.resize((W*3,H*3),Image.Resampling.NEAREST)
        assert zoom.resize((W,H),Image.Resampling.NEAREST).tobytes()==im.tobytes()
        im.save(HERE/(scene[0]+'-1x.png'),optimize=True)
        zoom.save(HERE/(scene[0]+'-3x.png'),optimize=True)
        imgs.append(im)
        print(scene[0],len(im.getcolors(2000)),'cores')
    sheet=Image.new('RGB',(W*2+18,H*2+18),NAVY)
    for i,im in enumerate(imgs):sheet.paste(im,(6+(i%2)*(W+6),6+i//2*(H+6)))
    sheet.resize((sheet.width*2,sheet.height*2),Image.Resampling.NEAREST).save(HERE/'seletores-mundos-1-a-4.png',optimize=True)
if __name__=='__main__':main()
