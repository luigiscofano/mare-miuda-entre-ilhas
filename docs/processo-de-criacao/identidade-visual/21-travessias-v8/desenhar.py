from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
import random, math, unicodedata
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
def frame(cfg,high):
    im=Image.new('RGB',(W,H),cfg['base']);d=ImageDraw.Draw(im)
    sea=Image.new('L',(W,H));sd=ImageDraw.Draw(sea)
    x0,y0,t=75,96,50
    # Projeção fixa: topo ortogonal e espessura visível ao sul.
    for j,row in enumerate(cfg['grid']):
        for i,c in enumerate(row):
            if c not in '#':
                x,y=x0+i*t,y0+j*t
                sd.rectangle((x,y,x+t-1,y+t+17),fill=255)
    for size,color in zip((87,57,27),cfg['band']):
        b=sea.filter(ImageFilter.MaxFilter(size))
        # Suaviza a geometria apenas nos contornos submersos, sem tons intermediários.
        b=b.filter(ImageFilter.MinFilter(11)).filter(ImageFilter.MaxFilter(9))
        im.paste(color,(0,0,W,H),b)
    d=ImageDraw.Draw(im)
    if cfg['shell'][0]==0:
        poly(d,[(0,220),(25,218),(42,222),(60,220),(86,225),(51,232),(0,227)],cfg['band'][0])
        poly(d,[(371,55),(400,54),(424,58),(448,58),(448,63),(407,62),(380,59)],cfg['band'][0])
    else:
        poly(d,[(391,184),(397,175),(407,173),(415,166),(432,170),(448,168),(448,193),(429,196),(409,190)],cfg['reef'])
        poly(d,[(404,181),(418,173),(425,174),(429,180),(419,187),(411,185)],cfg['band'][0])
    d.line([(15,66),(38,66),(44,67),(66,67)],fill=cfg['band'][0],width=1)
    d.line([(380,222),(398,222),(405,220),(423,220)],fill=cfg['band'][0],width=1)
    floor,lit,rim,walls,shadow=cfg['sand']
    rows=cfg['grid']
    def tile(i,j):
        return rows[j][i] if 0<=j<len(rows) and 0<=i<len(rows[j]) else '#'
    def solid(c):return c not in '#=' or (c=='=' and not high)
    def exposed(c):return c=='#' or (c=='=' and high)
    rng=random.Random(71+cfg['shell'][0])
    for j,row in enumerate(rows):
        for i,c in enumerate(row):
            if c=='#': continue
            x,y=x0+i*t,y0+j*t
            if c=='=' and high:
                d.rectangle((x,y,x+t-1,y+t-1),fill=cfg['wet'])
                d.line([(x+2,y+1),(x+t-3,y+1)],fill=cfg['band'][2])
                for n in range(3):
                    yy=y+11+n*12;xx=x+7+(i*4+n*3)%8
                    d.line([(xx,yy),(xx+10,yy),(xx+16,yy-2),(xx+26,yy-2)],fill=cfg['band'][1],width=2)
                continue
            if exposed(tile(i,j+1)):
                poly(d,[(x-4,y+t+14),(x+t+10,y+t+14),(x+t+16,y+t+20),(x+4,y+t+20)],cfg['reef'])
                d.rectangle((x,y+t-2,x+t-1,y+t+14),fill=walls)
                poly(d,[(x,y+t+6),(x+14,y+t+4),(x+31,y+t+6),(x+t-1,y+t+4),(x+t-1,y+t+12),(x,y+t+14)],shadow)
                d.line([(x+1,y+t+3),(x+17,y+t+2),(x+32,y+t+3),(x+t-2,y+t+1)],fill=rim)
                d.line([(x+2,y+t+16),(x+9,y+t+16),(x+12,y+t+17),(x+29,y+t+17),(x+34,y+t+16),(x+t-3,y+t+16)],fill=cfg['foam'],width=1)
            d.rectangle((x,y,x+t-1,y+t-1),fill=cfg['low'] if c=='=' else floor)
            if c=='=':
                for k in range(3):
                    yy=y+14+k*9
                    d.line([(x+9+k*3,yy),(x+29+k*2,yy),(x+33+k,yy-1)],fill=rim)
            else:
                for k in range(8):
                    xx=x+rng.randrange(4,t-4); yy=y+rng.randrange(4,t-4)
                    d.line([(xx,yy),(xx+rng.randrange(1,5),yy)],fill=rim if k%3==0 else lit,width=1)
            d.line([(x,y),(x+t-1,y)],fill=lit if exposed(tile(i,j-1)) else rim)
            d.line([(x,y),(x,y+t-1)],fill=lit if exposed(tile(i-1,j)) else rim)
            if exposed(tile(i-1,j)):
                d.line([(x-2,y+5),(x-2,y+16),(x-3,y+22),(x-3,y+t-5)],fill=cfg['foam'])
            if exposed(tile(i+1,j)):
                d.line([(x+t+1,y+10),(x+t+1,y+21),(x+t+2,y+24),(x+t+2,y+t-8)],fill=cfg['foam'])
            if c=='H':
                # Rocha alta: base chata, plano de luz e sombra projetada na areia.
                poly(d,[(x+9,y+33),(x+39,y+28),(x+46,y+39),(x+29,y+44),(x+12,y+43)],rim)
                poly(d,[(x+5,y+32),(x+10,y+20),(x+19,y+16),(x+23,y+9),(x+32,y+8),(x+40,y+19),(x+44,y+31),(x+33,y+39),(x+13,y+39)],shadow)
                poly(d,[(x+7,y+30),(x+12,y+21),(x+21,y+17),(x+25,y+10),(x+32,y+10),(x+38,y+19),(x+28,y+28),(x+12,y+32)],lit)
                poly(d,[(x+12,y+33),(x+27,y+28),(x+38,y+20),(x+42,y+30),(x+34,y+36),(x+15,y+37)],rim)
            if c=='C':
                for dx,dy in [(4,4),(t-5,4),(4,t-5),(t-5,t-5)]:
                    sg=1 if dx<20 else -1;sy=1 if dy<20 else -1
                    d.line([(x+dx+sg*6,y+dy),(x+dx,y+dy),(x+dx,y+dy+sy*6)],fill='#ad6d44',width=2)
                art=shell(*cfg['shell'])
                im.paste(art,(x+8,y+10),art.getchannel('A'))
    sx,sy=cfg['high'] if high else (0,0)
    x,y=x0+sx*t,y0+sy*t
    d=ImageDraw.Draw(im)
    d.ellipse((x+10,y+33,x+40,y+41),fill=rim)
    im.paste(SIRI,(x+9,y+15),SIRI.getchannel('A'))
    d=ImageDraw.Draw(im)
    d.rectangle((0,0,W-1,46),fill='#102e40');d.rectangle((0,248,W-1,H-1),fill='#102e40')
    d.line((0,46,W,46),fill='#6592a0'); d.line((0,248,W,248),fill='#6592a0')
    text(d,(15,10),cfg['title'],k=2);text(d,(16,32),cfg['world'],'#bfdcdb')
    label='MARÉ ALTA' if high else 'MARÉ BAIXA'
    d.rectangle((300,6,432,39),fill='#245575' if high else '#415c50')
    text(d,(310,11),label)
    text(d,(310,26),'BAIXIOS COBERTOS' if high else 'BAIXIOS EXPOSTOS','#e0eee5')
    text(d,(15,260),'WASD / SETAS', '#b7dad8')
    text(d,(170,260),'ESTUDO VISUAL','#a4c8c9')
    text(d,(325,260),'ALCANCE A CONCHA')
    for yyy in range(23):
        for xxx in range(31):
            px=SIRI.getpixel((xxx,yyy))
            if px[3]==255: assert im.getpixel((x+9+xxx,y+15+yyy))==px[:3]
    return im
def pair(cfg,name):
    a,b=(frame(cfg,v) for v in (False,True))
    a.save(P/(name+'-baixa-1x.png'));b.save(P/(name+'-alta-1x.png'))
    out=Image.new('RGB',(W,H*2+8),'#0b2330');out.paste(a,(0,0));out.paste(b,(0,H+8))
    result=out.resize((W*2,(H*2+8)*2),N);assert result.resize(out.size,N).tobytes()==out.tobytes()
    result.save(P/(name+'.png'))
if __name__=='__main__':
    pair(worlds[0],'praia-mare-alta-e-baixa')
    pair(worlds[1],'recifes-mare-alta-e-baixa')
