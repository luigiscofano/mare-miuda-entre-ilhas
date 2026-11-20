"""Pranchas de Travessia em vista zenital. Nenhum desenho invade a célula vizinha."""
from pathlib import Path
import random
import unicodedata

from PIL import Image, ImageDraw
from letras import FONT

DIR = Path(__file__).parent
T = 44
W, H = 432, 348
OX, OY = 18, 53
SIRI = Image.open(DIR / 'siri-da-logo.png').convert('RGBA')
NEAREST = Image.Resampling.NEAREST
INK = '#142e3f'
PAPER = '#fff1ca'
WORLDS = (
    ('PRAIA DAS CONCHAS', 'praia', (
        '~~~~~~~~~', '~T..~~T~~', '~HS==.C~~',
        '~T.~==.~~', '~~~.~.T~~', '~~~~~~~~~')),
    ('RECIFES EXPOSTOS', 'recifes', (
        '~~~~~~~~~', '~~k~=~a~~', '~S.==.C~~',
        '~a~H.~k~~', '~~~a..~~~', '~~~~~~~~~')),
    ('MANGUE DOS SIRIS DUPLOS', 'mangue', (
        '~~~~~~~~~', '~~m~~m~~~', '~TS==.~~~',
        '~~H~~.C~~', '~~.~~T~~~', '~m~~~~~~~')),
)
LAND = set('S.HCT')
OCEAN = set('~kam')

def line(d, points, color, width=1):
    d.line(points, fill=color, width=width)

def shape(d, points, color):
    d.polygon(points, fill=color)

def txt(d, x, y, s, color=PAPER, scale=1):
    for ch in s.upper():
        norm = unicodedata.normalize('NFD', ch)
        g = FONT.get(norm[0])
        if g:
            for a, row in enumerate(g.split()):
                for b, ink in enumerate(row):
                    if ink == '1':
                        d.rectangle((x+b*scale,y+a*scale,x+(b+1)*scale-1,y+(a+1)*scale-1), fill=color)
            if len(norm)>1:
                d.point((x+3*scale,y-2),fill=color)
        x += 6*scale

def agua(d, rng, reef, mangue):
    pal = ('#24566c','#30657b','#397b90','#56929f') if reef else ('#1f697b','#287f8e','#3896a0','#64b0aa')
    if mangue:
        pal = ('#2b5561','#36656b','#457b78','#639489')
    d.rectangle((0,0,43,43),fill=pal[0])
    # Marcas da superfície usam apenas formas discretas e opacas.
    for k in range(4):
        x=rng.randrange(2,26); y=rng.randrange(3,39); n=rng.randrange(7,16)
        shape(d,[(x,y+1),(x+4,y),(x+n-2,y),(x+n,y+1),(x+n-3,y+2),(x+3,y+2)],pal[1+(k==0)])
    for k in range(2):
        x=rng.randrange(2,33); y=rng.randrange(2,42)
        line(d,[(x,y),(x+rng.randrange(2,7),y)],pal[1])

def costas(d, vizinhos, reef):
    """Faixas de água rasa pertencem ao pixel da célula de água, nunca ao vizinho."""
    escuro, meio, espuma = ('#377488','#489092','#b4d4ba') if reef else ('#388d97','#5eafa7','#c9e9bf')
    for lado, tem_terra in enumerate(vizinhos):
        if not tem_terra:
            continue
        def pos(a,b):
            return ((a,b),(43-b,a),(a,43-b),(b,a))[lado]
        for tom,forma in (
            (escuro,[(0,0),(43,0),(43,7),(36,8),(31,10),(23,9),(17,11),(10,10),(5,8),(0,7)]),
            (meio,[(0,0),(43,0),(43,4),(34,4),(29,6),(19,5),(13,8),(6,5),(0,4)]),
        ): shape(d,[pos(a,b) for a,b in forma],tom)
        for pontos in [[(1,2),(7,2),(9,3),(15,3)],[(19,2),(24,2),(26,1),(32,1)],[(35,3),(40,3)]]:
            line(d,[pos(a,b) for a,b in pontos],espuma)

def solo(d, rng, reef, seco, vizinhos, mangue):
    """Vista de cima: iluminação corre pela superfície, sem paredes em perspectiva."""
    if reef:
        base,luz,sombra,escuro=('#c7c49a','#e2dbaf','#b2b08e','#74867e') if seco else ('#aaa989','#ccc5a1','#8c987f','#6d8c82')
    else:
        base,luz,sombra,escuro=('#e8bd75','#ffdc91','#cf9a60','#9a7656') if seco else ('#cba66e','#e6c989','#a88a5e','#8f805c')
    if mangue:
        base,luz,sombra,escuro=('#a5a36c','#c8c387','#898760','#696953') if seco else ('#969779','#b7ad83','#7a866e','#677d67')
    d.rectangle((0,0,43,43),fill=base)
    v=rng.randrange(-3,4)
    shape(d,[(0,0),(43,0),(43,14),(35,10),(26,10+v),(20,15),(8,14+v),(0,19)],luz)
    shape(d,[(0,34+v),(10,37),(20,35),(30,38),(38,31+v),(43,30),(43,43),(0,43)],sombra)
    for c in range(10 if seco else 8):
        x,y=rng.randrange(4,38),rng.randrange(3,40)
        cor=sombra if y<31 else escuro
        line(d,[(x,y),(x+1+c%3,y)],cor)
        if c%3==0:
            line(d,[(x,y+1),(x+2,y+1)],luz)
    for side, conectado in enumerate(vizinhos):
        if conectado:
            continue
        if side==0:
            line(d,[(0,0),(43,0)],luz,2)
        if side==1:
            line(d,[(43,0),(43,43)],escuro,2)
        if side==2:
            line(d,[(0,43),(43,43)],escuro,2)
        if side==3:
            line(d,[(0,0),(0,43)],luz,2)
    if not seco:
        for x,y in [(8,19),(17,25),(9,31)]:
            line(d,[(x,y),(x+4,y),(x+7,y-2),(x+17,y-2),(x+21,y)],escuro)
            line(d,[(x+8,y-1),(x+16,y-1)],luz)

def casa_mare(d):
    """Marca o baixio só quando está exposto."""
    for x,y in [(2,2),(41,2),(2,41),(41,41)]:
        a=1 if x==2 else -1; b=1 if y==2 else -1
        line(d,[(x+a*4,y),(x,y),(x,y+b*4)],'#fff0b0')

def encontro(d, vizinhos):
    """A espuma extra só aparece entre baixio inundado e areia firme."""
    for lado, tem_terra in enumerate(vizinhos):
        if not tem_terra:
            continue
        def pos(a,b):
            return ((a,b),(43-b,a),(a,43-b),(b,a))[lado]
        for tom,marcas in (
            ('#76b9ab', [[(1,5),(7,5),(9,6),(13,6)],[(17,5),(25,5),(27,4),(31,4)],[(35,5),(41,5)]]),
            ('#eef4ca', [[(2,2),(8,2),(10,3),(16,3)],[(21,2),(26,2),(28,1),(34,1)],[(37,3),(41,3)]])
        ):
            for pontos in marcas:
                line(d,[pos(a,b) for a,b in pontos],tom)

def rocha(d,reef):
    cinza,azul,verde,claro=('#364d64','#4c6879','#7e9b93','#b8c7a0') if reef else ('#775455','#9f7663','#cda077','#f3cf94')
    shape(d,[(9,29),(15,17),(28,14),(35,20),(41,31),(36,38),(23,40),(11,36)],cinza)
    shape(d,[(5,23),(8,16),(16,9),(25,7),(34,11),(38,20),(37,29),(30,34),(14,34),(7,29)],cinza)
    shape(d,[(7,23),(10,16),(17,10),(25,9),(33,13),(36,20),(34,24),(26,30),(14,31),(8,27)],azul)
    shape(d,[(9,20),(12,15),(17,10),(25,9),(31,12),(33,18),(26,22),(19,25),(12,25)],verde)
    line(d,[(13,17),(18,12),(24,11),(30,13)],claro,2)
    line(d,[(10,27),(16,29),(23,27),(27,25),(34,23)],verde)
    line(d,[(18,32),(25,31),(31,28)],azul)
    shape(d,[(11,24),(14,18),(19,16),(23,16),(26,19),(23,22),(18,24)],claro)
    shape(d,[(27,23),(31,19),(33,19),(34,22),(31,24),(28,25)],verde)
    line(d,[(12,26),(17,27),(21,26)],claro)
    line(d,[(27,31),(31,29),(34,26)],verde)
    line(d,[(19,37),(25,38),(30,36)],azul)


def planta(d, variante):
    """Moita costeira com pétalas grandes e sombra deslocada para sudeste."""
    ink,col,med,luz='#326252','#41886a','#72ad6b','#b0cd76'
    shape(d,[(8,31),(14,17),(27,13),(37,20),(40,29),(34,37),(22,39),(12,37)],'#ab8e5e')
    if variante:
        shape(d,[(6,28),(6,22),(11,17),(14,9),(22,6),(28,9),(32,15),(38,17),(38,26),(35,32),(29,35),(19,34),(10,31)],ink)
        shape(d,[(8,24),(11,19),(15,18),(17,12),(22,9),(27,11),(30,17),(35,19),(35,25),(30,30),(24,32),(16,30),(11,29)],col)
        shape(d,[(10,23),(13,20),(18,20),(20,12),(24,11),(28,14),(28,19),(32,21),(29,25),(23,24),(18,29),(13,27)],med)
        line(d,[(13,23),(16,22),(20,23),(24,17),(25,14)],luz,2)
        d.rectangle((28,23,30,25),fill='#f0bd70')
    else:
        d.ellipse((8,12,36,35), fill=ink)
        for x,y in [(10,19),(17,10),(23,16),(22,24)]:
            d.ellipse((x,y,x+12,y+11),fill=col)
            d.ellipse((x+1,y+1,x+9,y+7),fill=med)
            line(d,[(x+2,y+4),(x+4,y+2),(x+7,y+2)],luz)
        d.rectangle((16,21,18,23),fill='#f7be77')
        d.rectangle((24,17,26,19),fill='#ffe09c')
        d.point((16,21),fill=PAPER)
    # Nervuras, brotos e sombra interna mantêm legível o contorno da moita.
    for a,b in ([(14,21),(23,16),(27,27)] if not variante else [(14,25),(22,14),(31,22)]):
        line(d,[(a-2,b),(a,b-2),(a+2,b-2)],luz)
        line(d,[(a,b+2),(a+2,b+1)],ink)
    line(d,[(16,34),(22,35),(28,34)],'#536e55')


def raiz(d):
    d.ellipse((7,15,37,37),fill='#20494c')
    d.ellipse((9,14,34,32),fill='#38706a')
    for pts in [[(22,23),(16,27),(12,35)],[(22,23),(24,27),(28,33)],[(21,21),(27,24),(34,24)],[(20,23),(15,24),(10,21)]]:
        line(d,pts,'#694954',4)
        line(d,[(x,y-1) for x,y in pts],'#b28564',2)
    shape(d,[(11,18),(13,11),(19,7),(24,7),(29,11),(31,17),(27,23),(19,24),(13,21)],'#23594d')
    shape(d,[(12,17),(15,11),(20,8),(25,9),(29,13),(28,19),(23,22),(16,21)],'#4d9664')
    shape(d,[(14,15),(16,11),(21,9),(25,11),(23,15),(17,18)],'#85b86b')
    line(d,[(16,13),(20,11),(23,11)],'#bfce7c')
    line(d,[(16,17),(19,15),(22,15)],'#a7c476')
    line(d,[(21,20),(25,19),(27,16)],'#7eb66b')
    line(d,[(13,31),(16,28),(18,27)],'#d0a074')
    line(d,[(26,30),(28,32),(30,33)],'#a77764')


def recife(d, coral):
    if coral:
        d.ellipse((7,14,38,36),fill='#214c63')
        d.ellipse((7,10,35,33),fill='#387384')
        d.ellipse((9,12,31,27),fill='#4d8891')
        for pts in [[(22,29),(21,22),(16,18),(16,13)],[(21,24),(26,22),(29,17)],[(22,27),(27,28),(33,25)],[(20,26),(13,26),(11,21)]]:
            line(d,pts,'#775975',5)
            line(d,[(x-1,y-1) for x,y in pts],'#ca838b',3)
        for x,y in [(15,11),(29,15),(33,23),(10,19)]:
            d.rectangle((x-1,y,x+1,y+2),fill='#f3a594')
        for pontos in [[(14,17),(16,18),(18,19)],[(25,21),(28,18)],[(28,27),(32,25)],[(12,24),(15,25)]]:
            line(d,pontos,'#ffd1a3')
        line(d,[(18,31),(23,32),(27,31)],'#5a83a0')

    else:
        shape(d,[(6,28),(15,17),(22,20),(31,16),(40,25),(37,33),(29,37),(15,36),(8,33)],'#234f66')
        shape(d,[(8,27),(16,17),(22,18),(28,13),(34,14),(37,23),(33,31),(25,34),(13,32)],'#537c89')
        shape(d,[(10,26),(16,17),(22,18),(28,13),(33,14),(35,18),(29,21),(23,22),(18,27)],'#85a599')
        line(d,[(16,19),(20,20),(25,18),(29,16)],'#b9c7a6',2)
        line(d,[(9,34),(16,36),(22,36)],'#68a5a5')
        line(d,[(11,26),(15,25),(20,26),(25,23),(31,22)],'#739895')
        line(d,[(23,30),(26,29),(29,29),(33,25)],'#9aaf9f')


def concha(d, tema):
    """Cada bioma tem sua própria silhueta; o brilho usa pixels opacos."""
    sombra = {'praia':'#b18662','recifes':'#929478','mangue':'#747655'}[tema]
    d.ellipse((8,25,39,37),fill=sombra)
    if tema == 'praia':
        shape(d,[(5,19),(7,13),(11,9),(16,9),(19,6),(25,6),(28,9),(33,9),(37,13),(38,20),(36,25),(29,30),(26,35),(17,35),(14,30),(8,25)],'#704854')
        shape(d,[(7,18),(9,13),(13,10),(18,11),(21,8),(25,8),(28,11),(32,10),(36,14),(36,20),(32,25),(25,30),(24,33),(18,33),(15,29),(9,24)],'#d4806d')
        shape(d,[(8,17),(11,12),(16,11),(19,13),(22,9),(25,9),(28,12),(32,11),(35,15),(33,20),(27,24),(22,29),(17,25),(12,23)],'#f8ac82')
        for pts in [[(11,16),(15,20),(19,27)],[(16,13),(19,19),(21,27)],[(23,11),(23,18),(22,25)],[(31,14),(29,19),(25,25)]]:
            line(d,pts,'#ffdfb0',2)
        line(d,[(17,29),(20,31),(24,31),(27,28)],'#ffc292')
    elif tema == 'recifes':
        shape(d,[(9,26),(8,18),(11,11),(17,7),(25,6),(32,10),(36,15),(36,22),(32,27),(38,30),(36,34),(27,37),(18,36),(12,32)],'#65465f')
        shape(d,[(11,25),(10,18),(13,12),(18,9),(25,8),(31,11),(34,15),(34,21),(29,27),(35,30),(34,32),(26,35),(18,34),(13,30)],'#bc8294')
        shape(d,[(11,23),(11,17),(15,12),(20,9),(25,9),(29,11),(32,16),(32,21),(28,25),(21,27),(16,25)],'#e5aab0')
        line(d,[(30,15),(27,12),(21,12),(17,14),(15,18),(16,22),(20,24),(24,24),(27,21),(27,17),(23,15),(20,16),(19,19),(21,21),(23,20)],'#79566f',2)
        line(d,[(28,14),(25,13),(21,13),(17,16),(17,19)],'#ffe0c2')
        line(d,[(17,29),(23,31),(28,30),(33,30)],'#ffc1b1',2)
    else:
        shape(d,[(6,23),(10,17),(16,14),(22,8),(33,5),(38,8),(36,15),(35,20),(36,26),(30,31),(23,31),(17,36),(10,34)],'#604752')
        shape(d,[(8,23),(12,18),(17,16),(23,10),(33,7),(36,9),(34,15),(33,20),(34,25),(28,29),(22,29),(16,34),(11,32)],'#bf8a63')
        shape(d,[(9,23),(13,19),(20,16),(24,11),(32,8),(34,9),(31,14),(28,17),(30,22),(27,26),(22,26),(16,31),(12,30)],'#e7be83')
        for pts in [[(11,25),(17,23),(25,17),(32,11)],[(14,28),(20,26),(28,20)],[(13,21),(19,18),(23,14)]]:
            line(d,pts,'#ffdfa0',2)
        line(d,[(22,29),(27,29),(31,26)],'#e1aa77',2)
    for x,y in [(5,11),(38,23)]:
        line(d,[(x-2,y),(x+2,y)],PAPER)
        line(d,[(x,y-2),(x,y+2)],PAPER)

def cena(world, alta):
    nome,tema,rows=world
    reef=tema=='recifes'
    mangue=tema=='mangue'
    im=Image.new('RGB',(W,H),INK)
    d=ImageDraw.Draw(im)
    def codigo(x,y):
        return rows[y][x] if 0<=x<9 and 0<=y<6 else '~'
    def firme(c):
        return c in LAND or (c=='=' and not alta)
    for j,row in enumerate(rows):
        for i,c in enumerate(row):
            tile=Image.new('RGB',(T,T))
            zona=ImageDraw.Draw(tile)
            rng=random.Random(3261+119*i+257*j+79*reef)
            perto=[firme(codigo(x,y)) for x,y in [(i,j-1),(i+1,j),(i,j+1),(i-1,j)]]
            if firme(c):
                solo(zona,rng,reef,c!='=',perto,mangue)
            elif c in OCEAN or c=='=':
                agua(zona,rng,reef,mangue)
                costas(zona,perto,reef)
            if c=='=':
                encontro(zona,perto) if alta else casa_mare(zona)
            if c=='H':
                rocha(zona,reef)
            if c=='T':
                planta(zona,(i+j)%2)
            if c in 'ak':
                recife(zona,c=='a')
            if c=='m':
                raiz(zona)
            if c=='C':
                concha(zona,tema)
            if c=='S':
                zona.ellipse((7,18,35,36),fill='#8c8c72' if reef else '#b58a60')
                tile.paste(SIRI,(6,10),SIRI.getchannel('A'))
                for py in range(SIRI.height):
                    for px in range(SIRI.width):
                        cor=SIRI.getpixel((px,py))
                        if cor[3]: assert tile.getpixel((6+px,10+py))==cor[:3]
            im.paste(tile,(OX+T*i,OY+T*j))
    d.rectangle((OX-1,OY-1,OX+9*T,OY+6*T),outline='#6f9a94')
    d.rectangle((18,15,23,37),fill='#7cb6a1' if reef else '#e6ae6d')
    if mangue:
        txt(d,31,15,'MANGUE',scale=2)
    else:
        txt(d,31,15,nome,scale=2)
    txt(d,31,34,'SIRIS DUPLOS / ESTUDO VISUAL' if mangue else 'TRAVESSIA / ESTUDO VISUAL','#a9cfbf')
    d.rectangle((322,13,413,41),fill='#28686f' if alta else '#695a47')
    txt(d,329,18,'MARÉ ALTA' if alta else 'MARÉ BAIXA')
    txt(d,329,30,'SUBMERSO' if alta else 'TRANSITÁVEL','#d8e8cc')
    txt(d,18,328,'3 PASSOS VÁLIDOS MUDAM A MARÉ','#bcd8c7')
    txt(d,306,328,'ALCANCE A CONCHA')
    return im

def salvar(world):
    nome=world[1]
    imagens=[cena(world,alta) for alta in (False,True)]
    for im,alt in zip(imagens,('baixa','alta')):
        im.save(DIR/f'{nome}-mare-{alt}-1x.png')
    prancha=Image.new('RGB',(W,2*H+8),'#0e2534')
    for i,im in enumerate(imagens):
        prancha.paste(im,(0,i*(H+8)))
    zoom=prancha.resize((W*2,prancha.height*2),NEAREST)
    assert zoom.resize(prancha.size,NEAREST).tobytes()==prancha.tobytes()
    zoom.save(DIR/f'travessia-{nome}-v13.png')

def motivos(d, mundo):
    if mundo == 4:
        # Tufo de restinga atrás de um seixo redondo, sem indicar obstáculo no mar.
        d.ellipse((5,23,39,37),fill='#957b63')
        shape(d,[(8,27),(10,20),(17,18),(25,20),(30,25),(28,32),(19,34),(10,32)],'#6d7978')
        shape(d,[(10,25),(13,20),(17,19),(24,21),(27,24),(23,28),(14,28)],'#acb59a')
        for i,(x,y) in enumerate([(14,21),(19,20),(26,23),(31,25),(34,26)]):
            line(d,[(x,y),(x-1,y-8),(x-4,y-13)],'#356b61',2)
            line(d,[(x,y),(x+1,y-8),(x+4,y-15+i)],'#98b16a',2)
            line(d,[(x+3,y-12),(x+4,y-15+i)],'#ebce90')
    if mundo == 5:
        d.ellipse((5,21,41,38),fill='#22495e')
        d.rectangle((7,12,36,31),fill='#563f4d')
        for i in range(5):
            x=9+i*5
            d.rectangle((x,14,x+3,29),fill='#a87259' if i%2 else '#bc875e')
            line(d,[(x,15),(x,25)],'#e2b780')
        for y in (16,27):
            line(d,[(7,y),(37,y)],'#473a4a',3)
            line(d,[(8,y-1),(36,y-1)],'#dfba86')
        line(d,[(10,34),(16,34),(20,36),(30,36),(34,35)],'#609d9c')
    if mundo == 6:
        shape(d,[(6,28),(9,20),(18,17),(24,18),(32,15),(39,24),(38,34),(30,38),(16,38),(9,34)],'#3d476e')
        for x,y,h,color in [(12,24,12,'#7b83ac'),(22,24,16,'#a099cd'),(30,27,10,'#767eac')]:
            shape(d,[(x-4,y),(x-3,y-h+4),(x,y-h),(x+5,y-h+5),(x+5,y),(x,y+3)],'#555982')
            shape(d,[(x-3,y-1),(x-2,y-h+4),(x,y-h),(x+2,y-h+3),(x+1,y)],color)
            line(d,[(x-1,y-h+3),(x,y-h),(x+2,y-h+2)],'#dbcee9')
        line(d,[(13,32),(17,33),(21,31)],'#8b94bc')
    if mundo == 7:
        d.ellipse((7,22,37,39),fill='#294454')
        d.ellipse((9,13,36,36),fill='#365971')
        d.ellipse((10,11,34,31),fill='#658987')
        d.ellipse((12,12,33,28),fill='#a7bba3')
        line(d,[(14,16),(19,13),(26,13),(29,16)],'#d6d6ab')
        d.ellipse((17,15,28,24),fill='#71535c')
        d.ellipse((19,16,26,21),fill='#d8b984')
        line(d,[(20,19),(20,29),(26,32),(31,30),(34,32),(34,35)],'#876666',3)
        line(d,[(19,20),(19,28),(25,31),(31,29),(33,30)],'#cfae79')
    if mundo == 8:
        d.ellipse((5,18,41,38),fill='#8e785f')
        d.ellipse((10,14,35,33),fill='#aa9c79')
        d.ellipse((13,13,32,30),fill='#ecd2a0')
        d.ellipse((11,9,33,27),fill='#79495b')
        d.ellipse((13,8,31,24),fill='#b66562')
        d.ellipse((14,9,29,22),fill='#e28a73')
        d.ellipse((17,11,27,20),fill='#6d6673')
        d.rectangle((20,13,24,17),fill='#ffe1a0')
        d.line((22,9,22,22),fill='#f2ab86')
        for x,y in [(6,12),(36,11),(30,5)]:
            line(d,[(x-2,y),(x+2,y)],PAPER)
            line(d,[(x,y-2),(x,y+2)],PAPER)

def atlas():
    nomes=['PRAIA','RECIFES','MANGUE','ENSEADA','À DERIVA','GRUTAS','RESSACA','FAROL']
    im=Image.new('RGB',(360,182),INK)
    d=ImageDraw.Draw(im)
    txt(d,15,11,'OITO MUNDOS',scale=2)
    txt(d,15,27,'DETALHES DE CENÁRIO / ESTUDO VISUAL','#a9cfbf')
    for i,nome in enumerate(nomes):
        x=16+i%4*85;y=43+i//4*65
        tile=Image.new('RGB',(T,T))
        zona=ImageDraw.Draw(tile)
        rng=random.Random(561+i)
        if i in (0,3,7): solo(zona,rng,False,True,[True]*4,False)
        else: agua(zona,rng,i!=2,i==2)
        if i==0: planta(zona,False)
        elif i==1: recife(zona,True)
        elif i==2: raiz(zona)
        else: motivos(zona,i+1)
        im.paste(tile,(x+11,y))
        d.rectangle((x+10,y-1,x+55,y+44),outline='#709b98')
        txt(d,x+2,y+50,nome)
    im.save(DIR/'motivos-dos-mundos-1x.png')
    im.resize((720,364),NEAREST).save(DIR/'motivos-dos-mundos.png')

if __name__=='__main__':
    for world in WORLDS:
        salvar(world)
    atlas()
