"""Novos mapas panorâmicos dos mundos 5–8; exportação determinista em pixel art."""
from pathlib import Path
from random import Random
from unicodedata import normalize
from PIL import Image, ImageDraw, ImageChops, ImageFilter
from letras import FONT
DIR=Path(__file__).resolve().parent
W,H=512,384
NAV='#102c43'; CREAM='#fff0cf'; GOLD='#f4c977'
FONT.update({'7':'11111 00001 00010 00100 01000 01000 01000','8':'01110 10001 10001 01110 10001 10001 01110','9':'01110 10001 10001 01111 00001 00001 11110'})
SIRI=Image.open(DIR/'siri-seletor.png').convert('RGBA')
NAMES=('Ilhas à Deriva','Grutas da Espuma','Baía da Ressaca','Arquipélago do Farol')
SLUGS=('deriva','grutas','ressaca','farol')

def txt(d,x,y,s,c=CREAM,z=1):
    for original in s.upper():
        k=normalize('NFD',original)[0]
        if original in 'ÁÉÍÓÚÀ':
            p=[(2,-2),(3,-3)] if original!='À' else [(1,-3),(2,-2)]
            for a,b in p:d.rectangle((x+a*z,y+b*z,x+(a+1)*z-1,y+(b+1)*z-1),fill=c)
        for j,line in enumerate(FONT.get(k,'').split()):
            for i,v in enumerate(line):
                if v=='1':d.rectangle((x+i*z,y+j*z,x+(i+1)*z-1,y+(j+1)*z-1),fill=c)
        x+=6*z

def shape(p):
    m=Image.new('L',(W,H));ImageDraw.Draw(m).polygon(p,fill=255);return m

def slide(m,x,y):
    n=Image.new('L',m.size);n.paste(m,(x,y));return n

def ring(m,r):return m.filter(ImageFilter.MaxFilter(2*r+1))

def shore(im,m,p,r):
    for n,c in [(20,p[0]),(12,p[1]),(6,p[2]),(3,p[3])]:
        layer=ring(m,n);im.paste(c,mask=ImageChops.subtract(layer,m))
    # Manchas rasas reunidas em volta da costa; o mar aberto fica calmo.
    candidates=ImageChops.subtract(ring(m,27),ring(m,8))
    paint=Image.new('L',(W,H));d=ImageDraw.Draw(paint)
    for _ in range(1600):
        x=r.randrange(3,W-3);y=r.randrange(43,352);length=r.randrange(3,18)
        d.polygon([(x,y),(x+length,y),(x+length-2,y+2),(x+2,y+3),(x+2,y+1),(x,y+1)],fill=255)
    im.paste(p[2],mask=ImageChops.multiply(candidates,paint))
    crest=ImageChops.subtract(ring(m,5),ring(m,3))
    t=Image.new('L',m.size);dd=ImageDraw.Draw(t)
    for y in range(46,354,2):
        for x in range(0,W,25):
            dx=r.randrange(0,9);dd.line((x+dx,y,x+dx+11,y),fill=255,width=3)
    im.paste(p[4],mask=ImageChops.multiply(crest,t))

def terrace(im,poly,colors,depth,r,complexity=1):
    m=shape(poly)
    outline,bottom,face,vein,cap,shade,light=colors
    im.paste(outline,mask=slide(m,6,depth+6))
    for z in range(depth,0,-1):
        c=bottom if z>=depth-2 else vein if z in (4,7,13,19,25) else face
        im.paste(c,mask=slide(m,z//5,z))
    # Veios descontínuos e aresta superior iluminada; tudo recortado à rocha.
    surface=Image.new('RGB',(W,H),cap);d=ImageDraw.Draw(surface)
    x0,y0,x1,y1=m.getbbox()
    for j in range((x1-x0)*(y1-y0)//(850//complexity)):
        x=r.randrange(x0,x1);y=r.randrange(y0,y1);a=r.randrange(7,30)
        c=r.choice((shade,shade,cap,light))
        d.polygon([(x,y),(x+a,y),(x+a-3,y+2),(x+3,y+2),(x+3,y+4),(x-2,y+4),(x-2,y+1),(x,y+1)],fill=c)
    im.paste(surface,mask=m)
    im.paste(light,mask=ImageChops.subtract(m,slide(m,2,2)))
    im.paste(shade,mask=ImageChops.subtract(m,slide(m,-2,-2)))

def slab(d,x,y,w,h,c):
    a,b,t,lit=c
    poly=[(x,y+h//3),(x+w//5,y+h//3),(x+w//5,y+h//7),(x+w//2,y),(x+w*5//6,y+2),(x+w,y+h//3),(x+w,y+h*3//4),(x+w*3//4,y+h),(x+w//4,y+h),(x,y+h*3//4)]
    d.polygon(poly,fill=a)
    d.polygon(poly[:6]+[(x+w*2//3,y+h//2),(x+w//4,y+h//2)],fill=t)
    d.polygon([poly[5],poly[6],poly[7],poly[8],(x+w//4,y+h//2),(x+w*2//3,y+h//2)],fill=b)
    d.line((x+w//5,y+h//7,x+w//2,y+1,x+w*5//6,y+3),fill=lit,width=2)
    for i in range(2):d.line((x+w//3+i*5,y+h//2+4+i*3,x+w*3//4,y+h//2+4+i*3),fill=a)

def wood(d,x,y,l,v=False):
    # Madeira com junção, pranchas transversais e estacas de sustentação.
    k=lambda a,b: (x+b,y+a) if v else (x+a,y+b)
    box=lambda a,b,c,e,color:d.rectangle(tuple(q for pair in (k(a,b),k(c,e)) for q in pair),fill=color)
    for p in range(8,l,24):
        xx,yy=k(p,11)
        d.line((xx,yy,xx+4,yy+14),fill='#203e4a',width=6)
        d.line((xx-1,yy,xx+2,yy+12),fill='#735845',width=3)
    box(0,-6,l,10,'#3d3f48');box(0,-6,l,6,'#a17a55')
    for a in range(2,l-1,5):box(a,-5,a,5,'#6f5346')
    for b in (-7,7):
        box(0,b,l,b+1,'#ead0a0')
    for a in range(3,l,13):
        box(a-1,-9,a+1,-6,'#f4d8a5');box(a-1,7,a+1,11,'#744e3e')

def path(d,pts,c='#f1c98a'):
    dark='#33414a' if c=='#f1c98a' else '#234853'
    for step in [[dark,11,2],['#907459',8,1],[c,6,0],['#fff0bb' if c=='#f1c98a' else '#b6ccc1',1,-2]]:
        col,width,offset=step
        for (x,y),(a,b) in zip(pts,pts[1:]):
            assert x==a or y==b
            q=width//2;d.rectangle((min(x,a)-q,min(y,b)-q+offset,max(x,a)+q,max(y,b)+q+offset),fill=col)

def badge(d,x,y,n,active=False):
    d.rectangle((x-12,y-10,x+13,y+14),fill=NAV)
    d.rectangle((x-10,y-8,x+11,y+11),fill=GOLD if active else '#3d6373')
    d.line((x-10,y-8,x+11,y-8),fill=CREAM if active else '#a8c9bd')
    txt(d,x-4,y-5,str(n),NAV if active else CREAM,2)

def beams(d,x,y,w,h):
    d.polygon([(x,y),(x-w,y+h),(x-w+12,y+h+5),(x,y+4)],fill='#bea47d')
    d.polygon([(x,y),(x+w,y-h),(x+w-8,y-h+8),(x,y+5)],fill='#d7b67d')

def navig(d,pts,nodes):
    for n,p in enumerate(pts):path(d,p,'#88aaa0' if n else '#f1c98a')
    for a,p in enumerate(nodes):badge(d,*p,a+1,a==0)

# Trilhas traduzem as sequências do protótipo #29, sem inventar novas fases.
TERRAIN=[
[[(23,233),(50,233),(50,212),(114,212),(114,240),(153,240),(153,277),(118,277),(118,308),(55,308),(55,287),(23,287)],
[(158,135),(180,135),(180,113),(267,113),(267,133),(321,133),(321,167),(298,167),(298,218),(265,218),(265,244),(201,244),(201,225),(167,225),(167,193),(158,193)],
[(344,121),(363,121),(363,98),(414,98),(414,77),(480,77),(480,112),(498,112),(498,166),(475,166),(475,199),(425,199),(425,182),(381,182),(381,157),(344,157)]],
[[(39,228),(56,228),(56,168),(77,168),(77,100),(126,100),(126,75),(235,75),(235,52),(328,52),(328,74),(418,74),(418,93),(459,93),(459,126),(484,126),(484,270),(459,270),(459,311),(347,311),(347,323),(264,323),(264,286),(170,286),(170,306),(73,306),(73,283),(39,283)]],
[[(20,230),(57,230),(57,205),(124,205),(124,226),(158,226),(158,289),(113,289),(113,317),(48,317),(48,294),(20,294)],
[(201,133),(235,133),(235,101),(280,101),(280,80),(372,80),(372,116),(401,116),(401,137),(429,137),(429,175),(469,175),(469,205),(492,205),(492,250),(449,250),(449,275),(393,275),(393,310),(316,310),(316,279),(271,279),(271,254),(220,254),(220,217),(201,217)]],
[[(30,237),(56,237),(56,214),(105,214),(105,228),(146,228),(146,250),(168,250),(168,291),(131,291),(131,321),(65,321),(65,296),(30,296)],
[(190,238),(213,238),(213,200),(252,200),(252,160),(280,160),(280,128),(308,128),(308,100),(350,100),(350,66),(413,66),(413,85),(453,85),(453,114),(484,114),(484,165),(459,165),(459,196),(421,196),(421,231),(381,231),(381,259),(303,259),(303,285),(243,285),(243,306),(190,306)]]]
SEAS=[
('#143f56','#22556b','#327d82','#59a29a','#d7e5c6'),
('#173347','#245466','#326979','#579398','#b2d8c8'),
('#1a334c','#25465c','#3c657a','#638d97','#e1e9d7'),
('#15364d','#245068','#317588','#599699','#d2ddbc')]
LAND=[
('#203d41','#3f584f','#766d50','#9a865c','#a3a274','#798f6e','#cfc08c'),
('#223442','#363a49','#4b5060','#757380','#787e74','#6c7371','#b2aa91'),
('#263748','#454d5c','#6d6571','#a09087','#aa9387','#96817c','#d2b797'),
('#1f3746','#4b5354','#757662','#a99a78','#a8ab88','#919779','#d5c39b')]

def render(i):
    r=Random(8314+i);im=Image.new('RGB',(W,H),SEAS[i][0]);d=ImageDraw.Draw(im)
    # As faixas largas acompanham o escoamento em vez de espalhar marcas no vazio.
    for x,y,l in [(10,68,106),(339,58,154),(25,161,78),(383,279,113),(174,325,134),(16,331,107)]:
        c=SEAS[i][1]
        d.polygon([(x,y),(x+l,y),(x+l-17,y+3),(x+l-40,y+4),(x+l-40,y+6),(x+9,y+6)],fill=c)
    m=Image.new('L',(W,H))
    for p in TERRAIN[i]:m=ImageChops.lighter(m,shape(p))
    shore(im,slide(m,2,12),SEAS[i],r)
    for p in sorted(TERRAIN[i],key=lambda p:min(y for x,y in p)):terrace(im,p,LAND[i],(21,30,25,24)[i],r,2)
    d=ImageDraw.Draw(im)
    if i==0:
        # Ilhas delta em alturas diferentes, com três estruturas leves de cais.
        for poly in [[(69,218),(98,218),(98,231),(130,231),(130,247),(98,247),(98,266),(64,266),(64,251),(50,251),(50,234),(69,234)],[(192,126),(246,126),(246,139),(284,139),(284,157),(259,157),(259,184),(218,184),(218,172),(184,172),(184,144),(192,144)],[(389,112),(430,112),(430,88),(470,88),(470,114),(492,114),(492,132),(470,132),(470,154),(416,154),(416,147),(389,147)]]:
            terrace(im,poly,('#354e49','#5a6955','#7c775c','#a69766','#8ca77b','#78956a','#c1c088'),11,r,2)
        d=ImageDraw.Draw(im)
        for x,y,w,h in [(64,232,25,14),(233,132,39,21),(440,99,30,18)]:
            slab(d,x,y,w,h,('#3f6452','#617c5c','#91aa79','#bec187'))
        wood(d,106,248,93);wood(d,301,157,68);wood(d,264,195,29,True)
        for x,y,l in [(284,258,42),(330,196,31),(111,173,29)]:
            d.polygon([(x+3,y+5),(x+l,y+5),(x+l-7,y+14),(x+11,y+14)],fill='#234e5b')
            d.polygon([(x,y),(x+l,y),(x+l-5,y+9),(x+7,y+9)],fill='#704f43')
            d.line((x+1,y,x+l-1,y),fill='#e1b97e',width=2)
            d.line((x+5,y+4,x+l-8,y+4),fill='#a57750')
            d.line((x+8,y+10,x+l-10,y+10),fill='#73b1aa')
        n=[(83,278),(207,248),(271,190),(371,155),(448,135)]
        p=[[(54,285),(54,278),(83,278),(83,247),(207,247),(207,248),(207,219),(271,219),(271,190)],
           [(271,190),(301,190),(301,157),(371,157),(371,155),(404,155),(404,135),(448,135)]]
    elif i==1:
        # Cadeia calcária, entrada em arco profundo e espelho de água interior.
        for poly,z in [([(88,118),(123,118),(123,92),(168,92),(168,81),(222,81),(222,98),(246,98),(246,154),(228,154),(228,190),(115,190),(115,166),(88,166)],21), ([(286,73),(359,73),(359,89),(417,89),(417,112),(446,112),(446,159),(405,159),(405,178),(344,178),(344,161),(300,161),(300,141),(275,141),(275,111),(286,111)],18)]:
            terrace(im,poly,('#202f45','#364253','#596172','#89908b','#999b8a','#7f8b83','#beb7a0'),z,r,2)
        d=ImageDraw.Draw(im)
        for x,y,w,h in [(84,149,162,82),(142,97,64,25)]:
            p0=[(x,y+h),(x,y+h//2),(x+14,y+h//2),(x+14,y+h//3),(x+28,y+h//3),(x+28,y+12),(x+50,y+12),(x+50,y),(x+w-39,y),(x+w-39,y+15),(x+w-24,y+15),(x+w-24,y+h//2),(x+w,y+h//2),(x+w,y+h)]
            if w>90:
                d.polygon(p0,fill='#475560');d.line(p0[1:10],fill='#c0b8a0',width=3)
                d.polygon([(x+13,y+h),(x+13,y+h//2+8),(x+28,y+h//2+8),(x+28,y+h//3+9),(x+49,y+h//3+9),(x+49,y+18),(x+w-56,y+18),(x+w-56,y+28),(x+w-41,y+28),(x+w-41,y+h//2+7),(x+w-19,y+h//2+7),(x+w-19,y+h)],fill='#14283a')
                d.polygon([(x+23,y+h-17),(x+w-22,y+h-17),(x+w-22,y+h+2),(x+w-41,y+h+2),(x+w-41,y+h+11),(x+30,y+h+11),(x+30,y+h+3),(x+23,y+h+3)],fill='#326d73')
                for u,k,l in [(30,12,49),(60,7,57),(43,-1,29)]:d.line((x+u,y+h+k,x+u+l,y+h+k),fill='#72afa7')
                for u,k in [(31,55),(110,44),(70,37)]:d.polygon([(x+u,y+k),(x+u+5,y+k-6),(x+u+9,y+k),(x+u+2,y+k+17)],fill='#5a6872')
            else:slab(d,x,y,w,h,('#445060','#68747b','#a3a796','#c5bda1'))
        for x,y,w,h in [(292,129,28,54),(324,115,40,74),(385,134,26,40),(399,271,27,43),(263,281,20,31)]:
            d.polygon([(x,y+h),(x+4,y+19),(x+w//2,y),(x+w-2,y+13),(x+w,y+h-9),(x+w-5,y+h)],fill='#6e6785')
            d.polygon([(x,y+h),(x+4,y+19),(x+w//2,y),(x+w//2+4,y+14),(x+w//2-1,y+h-2)],fill='#88b8ad')
            d.line((x+6,y+21,x+w//2,y+2),fill='#cae0bf',width=2)
        n=[(76,267),(210,239),(279,276),(368,220),(447,259)]
        p=[[(52,278),(52,267),(76,267),(127,267),(127,250),(210,250),(210,239),(244,239),(244,276),(279,276),(314,276),(314,230),(368,230),(368,220),(410,220),(410,259),(447,259)]]
    elif i==2:
        for poly,z in [([(243,109),(275,109),(275,94),(361,94),(361,124),(395,124),(395,160),(379,160),(379,231),(338,231),(338,196),(276,196),(276,169),(236,169),(236,130),(243,130)],26), ([(399,195),(446,195),(446,209),(476,209),(476,244),(451,244),(451,260),(403,260),(403,249),(384,249),(384,223),(399,223)],15)]:
            terrace(im,poly,('#364453','#58606b','#7c7079','#b9a18b','#bba18d','#a78e80','#dec4a7'),z,r,2)
        d=ImageDraw.Draw(im)
        for x,y,w,h in [(63,216,37,25),(257,107,66,43),(311,96,32,24),(423,201,45,30),(358,255,32,20)]:
            slab(d,x,y,w,h,('#43485a','#716777','#ada1a0','#d5bdac'))
        # Quebra-mar em blocos de alturas diferentes em volta da bacia.
        for x,y,w,h in [(84,199,15,28),(104,184,16,30),(124,177,13,25),(143,172,12,19),(418,295,15,24),(437,286,18,26),(455,275,16,25)]:
            slab(d,x,y,w,h,('#3d4f5c','#6d7275','#a2a1a0','#d6c7b0'))
        for xx,yy,ln in [(35,210,91),(123,319,112),(224,185,31),(353,320,86),(440,161,55)]:
            d.line((xx,yy,xx+ln,yy),fill='#abc8c4',width=2)
            d.line((xx+7,yy+4,xx+ln-11,yy+4),fill='#648d9a',width=2)
        wood(d,139,269,102);wood(d,393,274,55)
        n=[(105,280),(371,237)]
        p=[[(63,297),(63,280),(105,280),(105,269),(239,269),(239,255),(272,255),(272,237),(371,237)]]
    else:
        for poly,z in [([(251,198),(274,198),(274,157),(301,157),(301,128),(327,128),(327,100),(357,100),(357,80),(413,80),(413,101),(443,101),(443,131),(462,131),(462,159),(432,159),(432,179),(407,179),(407,204),(370,204),(370,227),(329,227),(329,244),(286,244),(286,233),(251,233)],18), ([(349,112),(349,94),(366,94),(366,75),(410,75),(410,90),(428,90),(428,122),(412,122),(412,136),(368,136),(368,130),(349,130)],12)]:
            terrace(im,poly,('#3e5359','#616e60','#7a8069','#b3a480','#9eaa82','#879675','#d2c69b'),z,r,2)
        d=ImageDraw.Draw(im)
        wood(d,147,264,60)
        for x,y,w,h in [(56,226,34,25),(228,193,34,21),(287,147,34,19),(431,149,30,19)]:
            slab(d,x,y,w,h,('#415d57','#687867','#a7b08c','#d3c8a0'))
        # A torre tem base, sombra projetada, corpo cônico, galeria e lâmpada.
        x,y=381,128
        d.polygon([(x-23,y+4),(x+24,y+4),(x+56,y+28),(x+7,y+28)],fill='#67786e')
        d.rectangle((x-25,y,x+26,y+7),fill='#7d7c71')
        d.line((x-25,y,x+26,y),fill='#e5d9ac',width=2)
        d.polygon([(x-18,y),(x-13,y-57),(x+12,y-57),(x+19,y)],fill='#e6d4aa')
        d.polygon([(x+2,y),(x+3,y-57),(x+12,y-57),(x+19,y)],fill='#ad9479')
        for yy,a in [(52,13),(32,15),(12,17)]:
            d.rectangle((x-a,y-yy,x+a,y-yy+9),fill='#a65448')
            d.rectangle((x-a,y-yy,x+1,y-yy+2),fill='#d88868')
            d.rectangle((x+3,y-yy,x+a,y-yy+9),fill='#834949')
        d.rectangle((x-20,y-59,x+20,y-56),fill='#454b54')
        d.rectangle((x-13,y-72,x+14,y-60),fill='#243e4a')
        beams(d,x,y-65,70,10)
        d.rectangle((x-9,y-70,x+10,y-61),fill='#ffd793')
        for xx in (x-9,x,x+9):d.line((xx,y-70,xx,y-61),fill='#825f50')
        d.polygon([(x-20,y-73),(x-14,y-80),(x-3,y-86),(x+9,y-83),(x+19,y-73)],fill='#b7604e')
        d.line((x-13,y-80,x-3,y-85,x+7,y-82),fill='#ecb583',width=2)
        for xx in range(x-21,x+23,5):d.line((xx,y-62,xx,y-58),fill='#716554')
        d.line((x-21,y-62,x+21,y-62),fill='#e8c08c')
        d.rectangle((x-5,y-9,x+1,y),fill='#554b44')
        for yy,w in [(128,16),(133,21),(138,26),(143,32)]:d.line((x-w,yy,x+w//2,yy),fill='#d6c69c',width=2)
        n=[(108,286),(406,180)]
        p=[[(57,301),(57,286),(108,286),(108,263),(213,263),(213,239),(263,239),(263,211),(325,211),(325,192),(355,192),(355,180),(406,180)]]
    navig(d,p,n)
    a,b=p[0][0];a-=15;b-=22;im.paste(SIRI,(a,b),SIRI)
    for v in range(23):
        for u in range(31):
            rr,gg,bb,aa=SIRI.getpixel((u,v))
            if aa:assert aa==255 and im.getpixel((a+u,b+v))==(rr,gg,bb)
    d.rectangle((0,0,511,39),fill=NAV);d.line((20,37,491,37),fill='#62868a')
    d.rectangle((20,11,51,29),fill='#294a5a');txt(d,24,14,f'0{i+5}',GOLD,2)
    txt(d,62,14,NAMES[i],CREAM,2)
    d.rectangle((0,355,511,383),fill=NAV);d.line((20,355,491,355),fill='#62868a')
    txt(d,20,364,'WASD / SETAS', '#accbbc',1);txt(d,132,364,'SIGA A TRILHA',CREAM,1);txt(d,411,364,'ESTUDO',GOLD,1)
    return im

def main():
    sheet=Image.new('RGB',(1040,784),NAV)
    for i,slug in enumerate(SLUGS):
        im=render(i); enlarged=im.resize((1024,768),Image.Resampling.NEAREST)
        assert im.tobytes()==enlarged.resize(im.size,Image.Resampling.NEAREST).tobytes()
        im.save(DIR/f'{slug}-1x.png');enlarged.save(DIR/f'{slug}-2x.png')
        sheet.paste(im,(i%2*528,i//2*400))
    sheet.save(DIR/'seletores-mundos-5-a-8-v6.png')

if __name__=='__main__':main()
