from pathlib import Path
from PIL import Image, ImageDraw
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

def facetas(d, x, y, rows):
    """Desenha planos inteiros, com a luz chegando sempre do alto à esquerda."""
    for color, pontos in rows:
        poly(d, [(x + a, y + b) for a, b in pontos], color)

def estruturas(d, recife, alta):
    """Elementos da paisagem fora do tabuleiro, sem sugerir que são jogáveis."""
    if recife:
        # A crista mais baixa some sob a água na alta; o recife maior permanece.
        for x, y, corte in [(33, 156, False), (337, 66, True)]:
            if alta and corte:
                continue
            facetas(d, x, y, [
                ('#386b79', [(-24,12),(-18,2),(-5,-6),(19,-5),(33,1),(31,15),(16,23),(-11,23)]),
                ('#284d62', [(-16,12),(-13,4),(-5,-10),(8,-13),(19,-6),(24,8),(20,16),(0,20)]),
                ('#5c7782', [(-13,9),(-9,1),(-5,-8),(7,-11),(15,-7),(11,0),(2,5)]),
                ('#88a3a0', [(-8,1),(-4,-8),(7,-11),(12,-8),(4,-6),(0,0)]),
                ('#426173', [(2,6),(12,0),(18,-5),(22,7),(20,14),(7,17)]),
                ('#6c948e', [(-12,11),(-7,11),(-1,14),(4,14),(2,16),(-5,16)]),
                ('#b2c9be', [(-17,13),(-10,15),(-8,17),(-15,17),(-23,14)]),
            ])
            facetas(d, x, y, [
                ('#35576c', [(10,8),(15,2),(19,0),(23,5),(28,8),(27,14),(20,16)]),
                ('#7d958f', [(11,8),(15,3),(19,1),(23,6),(18,6),(17,9)]),
                ('#567581', [(16,10),(22,7),(27,9),(26,13),(20,14)]),
            ])
        facetas(d, 391, 191, [
            ('#386b79',[(-30,13),(-24,4),(-10,5),(-2,-4),(18,-9),(35,-2),(44,10),(32,18),(7,20),(-11,17)]),
            ('#375c6f',[(-24,12),(-16,4),(-6,8),(3,3),(14,-4),(22,0),(34,1),(39,10),(30,15),(8,18),(-10,15)]),
            ('#637e83',[(-22,10),(-17,5),(-7,8),(-4,11),(-10,13),(-15,11)]),
            ('#658587',[(0,10),(8,1),(15,-4),(21,-1),(19,3),(12,3),(6,8)]),
            ('#9cb0a3',[(8,1),(15,-4),(19,-2),(13,0),(10,3)]),
            ('#516f7b',[(10,11),(20,5),(27,3),(34,5),(35,10),(27,13),(19,15)]),
            ('#77978f',[(23,5),(28,3),(34,5),(32,7),(26,7)]),
            ('#96b2a8',[(-29,13),(-21,14),(-16,16),(-21,17),(-28,15)]),
        ])
    else:
        # Bancos de areia em meia-lua e uma pedra litorânea de tom quente.
        for x, y, flip in [(37, 125, -1), (352, 68, 1)]:
            shore = '#bbac7d' if not alta else '#679390'
            crest = '#e8ca90' if not alta else '#80a7a0'
            shapes = [
                ('#497e85', [(-26,7),(-19,-1),(1,-5),(17,-3),(27,3),(25,9),(8,16),(-10,16)]),
                ('#679c99', [(-23,7),(-16,0),(-4,-3),(12,-2),(23,3),(19,10),(2,13),(-15,12)]),
                (shore, [(-22,6),(-13,1),(0,-1),(11,0),(17,4),(7,4),(-4,4),(-11,7),(-20,8)]),
                (crest, [(-17,5),(-10,1),(0,0),(10,1),(12,2),(0,2),(-8,3),(-12,5)]),
                ('#a7c7b7', [(-22,8),(-13,8),(-7,7),(-4,8),(-13,10),(-20,10)]),
            ]
            facetas(d,x,y,[(cor,[(a*flip,b) for a,b in pontos]) for cor,pontos in shapes])

        pal = ('#669390','#8caf9d') if alta else ('#b9a779','#d8bf8b')
        facetas(d, 399, 176, [
            ('#437680',[(-28,12),(-21,1),(-10,-3),(2,0),(12,-4),(23,1),(33,10),(27,15),(10,21),(-10,20)]),
            ('#629592',[(-24,10),(-18,2),(-10,-1),(3,2),(13,-2),(25,3),(29,9),(20,13),(6,17),(-10,17)]),
            (pal[0],[(-20,8),(-14,2),(-8,2),(2,4),(12,0),(22,3),(25,7),(16,9),(7,8),(-2,10),(-11,13),(-17,11)]),
            (pal[1],[(-15,6),(-10,3),(-6,3),(-1,5),(8,4),(14,1),(20,4),(21,6),(13,4),(7,7),(-4,7),(-10,6)]),
            ('#507f85',[(-9,11),(-2,8),(7,8),(13,6),(20,7),(18,9),(8,13),(0,14)]),
            ('#a7c7b7',[(-23,11),(-16,12),(-12,15),(-19,14),(-25,13)]),
        ])

def frame(cfg, high):
    recife = cfg['shell'][0] != 0
    rows = cfg['grid']
    x0, y0, t = 75, 96, 50
    def tile(i,j):
        return rows[j][i] if 0 <= j < len(rows) and 0 <= i < len(rows[j]) else '#'
    def alagada(c):
        return c=='=' and high
    def borda(c):
        return c=='#' or alagada(c)

    im=Image.new('RGB',(W,H),cfg['base'])
    volumes = [(x0+i*t,y0+j*t,x0+(i+1)*t-1,y0+(j+1)*t+10)
               for j,row in enumerate(rows) for i,c in enumerate(row) if c!='#' and not alagada(c)]
    tons = [cfg['base'], *cfg['band'][:2],
            '#3d7584' if recife else '#427b83', '#528690' if recife else '#548f93']
    mar = im.load()
    paleta = [tuple(bytes.fromhex(c[1:])) for c in tons]
    for yy in range(47,248):
        for xx in range(W):
            dist = min(max(a-xx,0,xx-c)**2 + max(b-yy,0,yy-d)**2 for a,b,c,d in volumes)
            ajuste = 3*math.sin(xx/23+yy/42)+2*math.cos(yy/13-xx/54)
            raio = math.sqrt(dist)+ajuste
            faixa = 4 if raio<8 else 3 if raio<17 else 2 if raio<29 else 1 if raio<42 else 0
            mar[xx,yy] = paleta[faixa]
    d=ImageDraw.Draw(im)
    estruturas(d, recife, high)
    for x,y,span in [(14,75,24),(152,71,16),(213,60,32),(264,219,20),(29,222,29),(381,230,28),(408,94,19),(145,228,18)]:
        d.line([(x,y),(x+span//3,y),(x+span//3+3,y-1),(x+span,y-1)],fill=cfg['band'][1])
    floor, lit, rim, walls, shadow=cfg['sand']
    for j,row in enumerate(rows):
        for i,c in enumerate(row):
            if c == '#':
                continue
            x,y=x0+i*t,y0+j*t
            if alagada(c):
                d.rectangle((x,y,x+t-1,y+t-1),fill=cfg['wet'])
                facetas(d,x,y,[
                    ('#56939b',[(1,4),(49,4),(49,17),(34,14),(25,17),(13,13),(1,14)]),
                    ('#3a7283',[(0,38),(14,36),(27,40),(38,37),(49,38),(49,49),(0,49)]),
                    ('#4e8790',[(1,23),(16,20),(28,21),(36,20),(49,24),(49,29),(34,27),(19,29),(0,27)]),
                ])
                for n in range(3):
                    xx=x+6+((i+n)*5)%12; yy=y+12+n*12
                    d.line([(xx,yy),(xx+10,yy),(xx+13,yy-1),(xx+23,yy-1)],fill='#6ea3a6')
                continue
            # A areia iluminada, a areia úmida e a parede formam planos distintos.
            if borda(tile(i,j+1)):
                facetas(d,x,y,[
                    (cfg['reef'],[(-1,57),(47,56),(53,59),(53,66),(2,67),(-3,64)]),
                    (shadow,[(0,49),(49,49),(49,63),(0,63)]),
                    (walls,[(0,49),(49,49),(49,56),(37,58),(22,56),(10,59),(0,58)]),
                    (rim,[(0,49),(49,49),(49,52),(31,53),(19,52),(10,54),(0,53)]),
                ])
                for a,b,l in [(4,56,7),(14,54,4),(23,58,10),(38,55,9),(2,60,6)]:
                    d.line((x+a,y+b,x+a+l,y+b),fill=walls if b>56 else rim)
                d.line([(x+1,y+63),(x+10,y+63),(x+13,y+65),(x+27,y+65),(x+32,y+64),(x+43,y+64),(x+48,y+62)],fill=cfg['foam'])
                d.line((x+17,y+67,x+23,y+67),fill='#95bcb0')
            d.rectangle((x,y,x+49,y+49),fill=cfg['low'] if c=='=' else floor)
            light_patch=('#c4b88d' if recife else '#cebf87') if c=='=' else lit
            middle=('#b7ad89' if recife else '#c4b17a') if c=='=' else ('#d7d1a9' if recife else '#f3d497')
            damp=('#928f7e' if recife else '#ad945f') if c=='=' else rim
            facetas(d,x,y,[
                (middle,[(1,1),(48,1),(48,25),(39,30),(25,28),(18,32),(8,30),(1,35)]),
                (light_patch,[(1,1),(48,1),(48,9),(34,14),(21,13),(15,18),(6,17),(1,21)]),
                (damp,[(2,43),(13,39),(26,41),(38,36),(49,36),(49,49),(1,49)]),
                (cfg['low'] if c=='=' else floor,[(2,43),(12,41),(25,43),(38,38),(47,38),(46,42),(36,41),(25,46),(12,44),(2,46)]),
            ])
            rng=random.Random(310+43*i+73*j+17*recife)
            for n in range(12):
                xx,yy=rng.randrange(4,43),rng.randrange(5,45)
                # Pequenos aglomerados, sem ruído solto na borda das células.
                le=2+(n*3)%4
                d.line((x+xx,y+yy,x+xx+le,y+yy),fill=middle if n%3 else damp)
                if n%4==0:
                    d.line((x+xx+1,y+yy-1,x+xx+le-1,y+yy-1),fill=light_patch)
            for a,b in [(8+i%3,31),(31,19+(i*3)%8)]:
                d.line([(x+a,y+b),(x+a+4,y+b),(x+a+7,y+b-1),(x+a+11,y+b-1)],fill=damp)
            for side,pts in [
                (tile(i,j-1), (x,y,x+49,y)), (tile(i-1,j),(x,y,x,y+49))
            ]:
                d.line(pts,fill=lit if borda(side) else rim)
            if borda(tile(i-1,j)):
                d.line([(x-2,y+3),(x-2,y+16),(x-3,y+21),(x-3,y+33),(x-2,y+36),(x-2,y+47)],fill=cfg['foam'])
            if borda(tile(i+1,j)):
                d.line([(x+51,y+5),(x+52,y+9),(x+52,y+22),(x+51,y+26),(x+51,y+44)],fill=cfg['foam'])
            if borda(tile(i,j-1)):
                for a,b in [(3,13),(15,27),(31,44)]:
                    d.line([(x+a,y-2),(x+b,y-2),(x+b+2,y-1)],fill=cfg['foam'])
            if c=='H':
                r=['#4a6671','#647c82','#87958e','#b6b99e','#d3cfad'] if recife else ['#735455','#926e60','#b28a6e','#d9b895','#ebcfaa']
                facetas(d,x,y,[
                    (damp,[(5,35),(24,31),(42,29),(48,37),(45,43),(24,45),(9,42)]),
                    (r[0],[(6,31),(11,21),(19,18),(24,9),(33,8),(38,14),(44,27),(45,35),(35,41),(17,40)]),
                    (r[1],[(8,30),(13,22),(21,18),(26,10),(33,9),(38,15),(41,24),(34,33),(18,37),(10,35)]),
                    (r[2],[(9,29),(14,22),(23,18),(26,11),(32,10),(37,16),(33,22),(20,30),(13,32)]),
                    (r[3],[(13,24),(23,18),(27,11),(32,10),(36,14),(31,16),(26,22),(18,25)]),
                    (r[4],[(23,17),(27,11),(32,10),(33,12),(28,13),(27,16)]),
                    (r[0],[(18,35),(28,30),(34,26),(40,23),(41,26),(34,30),(30,34),(24,34)]),
                    (r[2],[(18,36),(24,35),(30,35),(36,31),(34,35),(26,38),(16,38)]),
                ])
            if c=='C':
                # O halo é feito de elipses de cores sólidas; a concha é a mesma do estudo anterior.
                d.ellipse((x+4,y+5,x+45,y+44),fill=middle)
                d.ellipse((x+8,y+9,x+41,y+41),fill=lit)
                for dx,dy in [(4,4),(45,4),(4,45),(45,45)]:
                    sg=1 if dx<20 else -1; sy=1 if dy<20 else -1
                    d.line([(x+dx+sg*6,y+dy),(x+dx,y+dy),(x+dx,y+dy+sy*6)],fill='#ad6d44')
                art=shell(*cfg['shell'])
                im.paste(art,(x+8,y+10),art.getchannel('A'))

    sx,sy=cfg['high'] if high else (0,0)
    x,y=x0+sx*t,y0+sy*t
    d=ImageDraw.Draw(im)
    d.ellipse((x+10,y+33,x+40,y+41),fill=rim)
    im.paste(SIRI,(x+9,y+15),SIRI.getchannel('A'))
    d=ImageDraw.Draw(im)
    d.rectangle((0,0,W-1,46),fill='#102e40')
    d.rectangle((0,248,W-1,H-1),fill='#102e40')
    d.line((0,46,W,46),fill='#6592a0')
    d.line((0,248,W,248),fill='#6592a0')
    text(d,(15,10),cfg['title'],k=2)
    text(d,(16,32),cfg['world'],'#bfdcdb')
    d.rectangle((300,6,432,39),fill='#245575' if high else '#415c50')
    text(d,(310,11),'MARÉ ALTA' if high else 'MARÉ BAIXA')
    text(d,(310,26),'BAIXIOS COBERTOS' if high else 'BAIXIOS EXPOSTOS','#e0eee5')
    text(d,(15,260),'WASD / SETAS','#b7dad8')
    text(d,(170,260),'ESTUDO VISUAL','#a4c8c9')
    text(d,(325,260),'ALCANCE A CONCHA')
    for yy in range(SIRI.height):
        for xx in range(SIRI.width):
            px=SIRI.getpixel((xx,yy))
            if px[3]==255:
                assert im.getpixel((x+9+xx,y+15+yy))==px[:3]
    return im

def pair(cfg,name):
    a,b=(frame(cfg,v) for v in (False,True))
    a.save(P/(name+'-baixa-1x.png'))
    b.save(P/(name+'-alta-1x.png'))
    out=Image.new('RGB',(W,H*2+8),'#0b2330')
    out.paste(a,(0,0))
    out.paste(b,(0,H+8))
    result=out.resize((W*2,(H*2+8)*2),N)
    assert result.resize(out.size,N).tobytes()==out.tobytes()
    result.save(P/(name+'.png'))

if __name__=='__main__':
    pair(worlds[0],'travessia-v9-praia-das-conchas')
    pair(worlds[1],'travessia-v9-recifes-expostos')
