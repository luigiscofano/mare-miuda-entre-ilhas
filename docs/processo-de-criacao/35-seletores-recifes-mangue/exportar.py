"""Exporta duas paisagens 512×384 sem dados de interface. Python 3 + Pillow."""
from collections import Counter
from pathlib import Path
from random import Random
from PIL import Image, ImageDraw, ImageFilter

TAMANHO = (512, 384)
SAIDA = Path(__file__).resolve().parent

# Cartas topográficas em degraus: recortes de bancos de areia e lama,
# em perspectiva vertical curta. Sem trilhas, nós ou marcas pintadas.
RECIFES = [
    [(129, 88), (167, 88), (167, 70), (228, 70), (228, 79), (274, 79), (274, 61),
     (337, 61), (337, 48), (381, 48), (381, 62), (424, 62), (424, 102),
     (452, 102), (452, 118), (473, 118), (473, 178), (464, 178), (464, 248),
     (479, 248), (479, 287), (454, 287), (454, 303), (389, 303), (389, 286),
     (354, 286), (354, 235), (376, 235), (376, 207), (391, 207), (391, 174),
     (367, 174), (367, 187), (381, 187), (381, 225), (342, 225), (342, 248),
     (319, 248), (319, 264), (291, 264), (291, 281), (232, 281), (232, 297),
     (168, 297), (168, 278), (132, 278), (132, 251), (111, 251), (111, 213),
     (102, 213), (102, 166), (115, 166), (115, 127), (129, 127)],
    [(69, 75), (84, 75), (84, 84), (102, 84), (102, 102), (93, 102), (93, 119),
     (64, 119), (64, 109), (55, 109), (55, 88), (69, 88)],
    [(80, 298), (106, 298), (106, 309), (127, 309), (127, 336), (115, 336),
     (115, 348), (82, 348), (82, 339), (61, 339), (61, 311), (80, 311)],
    [(326, 316), (358, 316), (358, 326), (373, 326), (373, 347), (352, 347),
     (352, 359), (320, 359), (320, 349), (310, 349), (310, 329), (326, 329)],
]
MANGUE = [
    [(121, 138), (134, 138), (134, 100), (152, 100), (152, 77), (198, 77),
     (198, 63), (244, 63), (244, 74), (290, 74), (290, 60), (354, 60),
     (354, 72), (396, 72), (396, 54), (444, 54), (444, 72), (471, 72),
     (471, 99), (486, 99), (486, 154), (472, 154), (472, 182), (482, 182),
     (482, 228), (470, 228), (470, 260), (476, 260), (476, 291), (452, 291),
     (452, 311), (411, 311), (411, 295), (360, 295), (360, 276), (339, 276),
     (339, 234), (361, 234), (361, 207), (340, 207), (340, 227), (323, 227),
     (323, 247), (303, 247), (303, 277), (283, 277), (283, 298), (215, 298),
     (215, 315), (165, 315), (165, 299), (136, 299), (136, 272), (113, 272),
     (113, 246), (96, 246), (96, 201), (111, 201), (111, 161), (121, 161)],
    [(47, 88), (78, 88), (78, 102), (98, 102), (98, 127), (81, 127), (81, 143),
     (43, 143), (43, 124), (32, 124), (32, 105), (47, 105)],
    [(71, 279), (88, 279), (88, 294), (104, 294), (104, 326), (86, 326),
     (86, 340), (54, 340), (54, 327), (37, 327), (37, 299), (53, 299), (53, 288), (71, 288)],
    [(315, 314), (342, 314), (342, 327), (355, 327), (355, 347), (337, 347),
     (337, 360), (304, 360), (304, 348), (294, 348), (294, 329), (315, 329)],
]
PALETAS = {
    'recifes': dict(mar='#153c52', ondas=('#1a455a', '#1d4b60'), agua=('#235972','#29728a','#4d9b9f'),
                   espuma='#8cc5b6', face=('#606379','#87828a'), borda='#b6a58c',
                   piso='#d8c19a', sombra='#b9a98c', luz='#eed6a6', grao='#c9b390',
                   lago=('#8baca1','#5c9e9d','#438387')),
    'mangue': dict(mar='#22484a', ondas=('#285052','#305756'), agua=('#335e5d','#47736b','#669386'),
                   espuma='#9ba98a', face=('#514d40','#776849'), borda='#9e8255',
                   piso='#b39864', sombra='#8e8252', luz='#c7ad75', grao='#a48b59',
                   lago=('#9a9b6b','#597d68','#49675c')),
}
LAGOS = {
    'recifes': [
        [(227,177),(245,177),(245,190),(255,190),(255,203),(219,203),(219,187),(227,187)],
        [(201,245),(225,245),(225,253),(239,253),(239,268),(212,268),(212,276),(194,276),(194,257),(201,257)],
        [(410,244),(434,244),(434,260),(425,260),(425,272),(404,272),(404,255),(410,255)],
    ],
    'mangue': [
        [(210,189),(227,189),(227,181),(258,181),(258,193),(272,193),(272,205),
         (252,205),(252,218),(224,218),(224,209),(202,209),(202,197),(210,197)],
        [(415,174),(430,174),(430,197),(418,197),(418,201),(405,201),(405,181),(415,181)],
    ],
}


def mascara(formas):
    quadro = Image.new('L', TAMANHO)
    d = ImageDraw.Draw(quadro)
    for forma in formas:
        d.polygon(forma, fill=255)
    return quadro


def deslocar(m, dy):
    nova = Image.new('L', TAMANHO)
    nova.paste(m, (0, dy))
    return nova


def aplicar(im, cor, m):
    im.paste(cor, (0, 0, *TAMANHO), m)


def camada(m, raio, minimos=False):
    tipo = ImageFilter.MinFilter if minimos else ImageFilter.MaxFilter
    return m.filter(tipo(raio * 2 + 1))


def pintar_agua(im, p, acaso):
    d = ImageDraw.Draw(im)
    for _ in range(255):
        x, y = acaso.randint(0, 508), acaso.randint(1, 381)
        tamanho = acaso.choice((2, 4, 5, 7, 9))
        d.line((x, y, x + tamanho, y), fill=acaso.choice(p['ondas']))


def pintar_lago(im, forma, p):
    m = mascara([forma])
    for raio, cor in enumerate(p['lago']):
        aplicar(im, cor, camada(m, raio * 3, minimos=True) if raio else m)
    d = ImageDraw.Draw(im)
    # Reflexos localizados, nunca desenhados na área de jogo.
    x0, y0, x1, y1 = m.getbbox()
    x, y = (x0 + x1) // 2, (y0 + y1) // 2
    if m.getpixel((x + 4, y)):
        d.line((x-3, y, x+4, y), fill=p['lago'][1])


def pol(d, pontos, x, y, cor, lado=1):
    d.polygon([(x+lado*dx, y+dy) for dx,dy in pontos],fill=cor)


def pedra(d, x, y, forma=0):
    # Cumes altos e faces em recuo, com a mesma fonte de luz no noroeste.
    picos = [[(-14,1),(-13,-6),(-9,-10),(5,-10),(5,-7),(13,-7),(15,1),(10,7),(-11,7)],
             [(-12,0),(-10,-8),(-4,-8),(-4,-13),(8,-13),(8,-9),(14,-9),(15,3),(9,7),(-10,7)],
             [(-16,0),(-14,-4),(-9,-4),(-9,-8),(4,-8),(4,-12),(10,-12),(10,-7),(16,-7),(17,3),(8,7),(-12,7)]]
    pol(d,[(-17,4),(-11,0),(15,0),(19,5),(13,10),(-16,10)],x,y,'#a59c88')
    pol(d,picos[forma],x,y,'#737183')
    pol(d,[(-13,-2),(-11,-6),(-6,-6),(-6,-9),(4,-9),(4,-7),(11,-7),(12,-2),(7,2),(-10,2)],x,y,'#a6a098')
    pol(d,[(-12,-2),(-10,-5),(-5,-5),(-5,-8),(3,-8),(3,-6),(-2,-6),(-2,-3),(-7,-3),(-7,0),(-11,0)],x,y,'#c3b8a5')
    d.line((x-6,y+5,x+4,y+5),fill='#8c8190')


def coral(d, x, y, variante=0):
    # Ramagem em pequenos blocos; as pontas permanecem legíveis de longe.
    areia = ((-14,2),(-10,-3),(9,-3),(14,1),(11,5),(-11,5))
    pol(d, areia, x,y,'#b1ad91')
    pal=[('#9a5963','#c87f77','#ecaa8a'),('#7f627e','#ae7d99','#d9a0ae'),('#a46d4f','#ca9360','#f0bd7d')][variante]
    for lado,dx,altura in [(1,0,12),(-1,-7,7),(1,7,8)]:
        py=y-altura+1; px=x+dx
        pol(d,[(-3,altura),(-3,3),(-1,3),(-1,0),(2,0),(2,4),(4,4),(4,2),(6,2),(6,6),(2,7),(2,altura)],px,py,pal[0],lado)
        d.rectangle((px-1,py+2,px+1,py+min(altura-1,5)),fill=pal[1])
        d.point((px,py+1),fill=pal[2])


def arvore(d, x, y, variante=0):
    espelho = (-1,1,1)[variante]
    pol(d,[(-22,4),(-15,1),(8,1),(20,5),(17,10),(-13,10),(-22,8)],x,y,'#817047',espelho)
    for dx,dy in [(-15,7),(-8,10),(9,8),(16,5)]:
        pol(d,[(1,-13),(4,-7),(dx,dy),(dx-4,dy),(0,-4),(-4,-1)],x,y,'#5a5040',espelho)
        pol(d,[(0,-8),(dx,dy),(dx-2,dy),(-1,-4)],x,y,'#9e7b4f',espelho)
    pol(d,[(-4,3),(-4,-15),(3,-19),(5,-3),(3,2)],x,y,'#725944',espelho)
    pol(d,[(-2,-1),(-2,-12),(0,-13),(1,-1)],x,y,'#9e794f',espelho)
    copas = [
        [(-13,-12,8),(7,-13,12),(-7,-23,11),(5,-22,10)],
        [(-13,-13,10),(10,-14,11),(-3,-25,14)],
        [(-11,-15,9),(12,-12,9),(-2,-20,15),(8,-26,8)],
    ]
    for dx,dy,w in copas[variante]:
        cy=y+dy; cx=x+dx*espelho
        pol(d,[(-w,3),(-w,-2),(-w+3,-2),(-w+3,-6),(-w+7,-6),(-w+7,-8),
               (w-5,-8),(w-5,-5),(w-1,-5),(w-1,-2),(w,0),(w,4),(w-4,4),(w-4,7),(-w+4,7),(-w+4,5),(-w,5)],
            cx,cy,'#37594c')
        pol(d,[(-w+2,1),(-w+2,-2),(-w+6,-2),(-w+6,-5),(-w+9,-5),(-w+9,-7),
               (w-5,-7),(w-5,-4),(w-1,-4),(w-1,-1),(w-5,-1),(w-5,2),(-w+4,2),(-w+4,4),(-w+1,4)],cx,cy,'#507356')
        d.line((cx-w+7,cy-5,cx+w-7,cy-5),fill='#6b875b')


def pintar_composicao(nome):
    p = PALETAS[nome]
    acaso = Random(438 if nome == 'recifes' else 918)
    im = Image.new('RGB', TAMANHO, p['mar'])
    pintar_agua(im, p, acaso)
    m = mascara(RECIFES if nome == 'recifes' else MANGUE)
    for raio, cor in zip((18,12,7), p['agua']):
        aplicar(im, cor, camada(deslocar(m,3),raio))
    aplicar(im,p['espuma'],camada(deslocar(m,4),3))
    aplicar(im,p['face'][0],deslocar(m,7))
    aplicar(im,p['face'][1],deslocar(m,4))
    aplicar(im,p['borda'],m)
    aplicar(im,p['piso'],camada(m,3,minimos=True))
    # Filetes iluminados apenas nas bordas superiores; chão central silencioso.
    d=ImageDraw.Draw(im)
    for y in range(1, TAMANHO[1]-4):
        inicio=None
        for x in range(TAMANHO[0]):
            topo=m.getpixel((x,y)) and not m.getpixel((x,y-1))
            if topo and inicio is None:
                inicio=x
            elif not topo and inicio is not None:
                if x-inicio>10:
                    d.line((inicio+3,y+2,x-4,y+2),fill=p['luz'])
                inicio=None
    for _ in range(480):
        x,y=acaso.randint(2,510),acaso.randint(2,382)
        if im.getpixel((x,y)) != rgb(p['piso']):
            continue
        d.line((x,y,x+acaso.choice((0,1,2,3)),y),fill=acaso.choice((p['grao'],p['luz'],p['grao'])))
    for forma in LAGOS[nome]:
        pintar_lago(im,forma,p)
    d=ImageDraw.Draw(im)
    if nome == 'recifes':
        for x,y,form in [(77,97,0),(110,322,2),(170,104,2),(256,93,0),
                      (336,81,1),(408,87,2),(145,233,0),(289,251,1),
                      (357,209,2),(460,276,1),(329,341,0)]:
            pedra(d,x,y,form)
        for x,y,var in [(92,315,0),(174,253,1),(232,216,0),(289,160,2),
                     (397,256,1),(466,133,0),(342,333,2),(62,102,2)]:
            coral(d,x,y,var)
    else:
        for x,y,var in [(68,121,0),(74,316,1),(128,207,1),(181,271,0),
                      (269,277,2),(282,91,0),(360,88,1),(450,81,2),
                      (463,259,0),(419,286,1),(320,345,2)]:
            arvore(d,x,y,var)
        for x,y in [(102,224),(229,274),(291,192),(327,194),(390,201),(424,291),(248,88),(459,113)]:
            for dx,altura in [(-4,4),(0,7),(4,4)]:
                d.line((x+dx,y,x+dx-2,y-altura),fill='#65714c')
                d.point((x+dx-2,y-altura),fill='#929469')
    return im,m


def rgb(hexadecimal):
    h=hexadecimal.lstrip('#')
    return tuple(int(h[i:i+2],16) for i in range(0,6,2))


def main():
    for nome in PALETAS:
        imagem,_=pintar_composicao(nome)
        caminho=SAIDA/f'{nome}-512.png'
        assert imagem.size==TAMANHO and imagem.mode=='RGB'
        assert all(n>4 for n in Counter(imagem.getdata() if not hasattr(imagem, 'get_flattened_data') else imagem.get_flattened_data()).values())
        imagem.save(caminho,optimize=True)


if __name__=='__main__':
    main()
