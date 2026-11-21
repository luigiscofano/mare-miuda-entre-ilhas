"""Fundos nativos da Enseada e da Deriva; Python 3 e Pillow."""
from pathlib import Path
from random import Random
from PIL import Image, ImageDraw, ImageFilter

TAMANHO = (512, 384)
SAIDA = Path(__file__).resolve().parent
TERRA = {
    'enseada': [
        [(94, 132), (116, 132), (116, 107), (148, 107), (148, 92), (221, 92),
         (221, 101), (269, 101), (269, 71), (296, 71), (296, 55), (371, 55),
         (371, 65), (414, 65), (414, 44), (464, 44), (464, 58), (497, 58),
         (497, 109), (505, 109), (505, 240), (486, 240), (486, 263), (453, 263),
         (453, 252), (390, 252), (390, 239), (372, 239), (372, 216), (350, 216),
         (350, 200), (337, 200), (337, 221), (325, 221), (325, 236), (300, 236),
         (300, 252), (268, 252), (268, 271), (202, 271), (202, 260), (170, 260),
         (170, 244), (139, 244), (139, 225), (115, 225), (115, 207), (97, 207),
         (97, 180), (83, 180), (83, 153), (94, 153)],
        [(57, 60), (90, 60), (90, 69), (109, 69), (109, 94), (83, 94), (83, 108),
         (50, 108), (50, 94), (36, 94), (36, 76), (57, 76)],
        [(319, 282), (350, 282), (350, 295), (371, 295), (371, 322), (359, 322),
         (359, 335), (310, 335), (310, 323), (295, 323), (295, 305), (319, 305)],
        [(96, 296), (133, 296), (133, 310), (150, 310), (150, 332), (128, 332),
         (128, 344), (84, 344), (84, 332), (69, 332), (69, 311), (96, 311)],
    ],
    'deriva': [
        [(117, 123), (144, 123), (144, 93), (181, 93), (181, 104), (241, 104),
         (241, 90), (268, 90), (268, 61), (294, 61), (294, 49), (354, 49),
         (354, 63), (393, 63), (393, 72), (418, 72), (418, 53), (478, 53),
         (478, 67), (499, 67), (499, 125), (490, 125), (490, 171), (505, 171),
         (505, 226), (496, 226), (496, 246), (453, 246), (453, 229), (440, 229),
         (440, 255), (406, 255), (406, 274), (381, 274), (381, 252), (367, 252),
         (367, 214), (350, 214), (350, 209), (327, 209), (327, 224), (314, 224),
         (314, 240), (290, 240), (290, 254), (261, 254), (261, 268), (234, 268),
         (234, 286), (187, 286), (187, 268), (164, 268), (164, 246), (143, 246),
         (143, 228), (125, 228), (125, 202), (102, 202), (102, 158), (117, 158)],
        [(46, 60), (87, 60), (87, 75), (109, 75), (109, 93), (73, 93), (73, 111),
         (42, 111), (42, 100), (25, 100), (25, 76), (46, 76)],
        [(53, 253), (82, 253), (82, 269), (112, 269), (112, 284), (86, 284),
         (86, 305), (49, 305), (49, 289), (27, 289), (27, 270), (53, 270)],
        [(319, 283), (353, 283), (353, 299), (369, 299), (369, 319), (350, 319),
         (350, 334), (306, 334), (306, 319), (281, 319), (281, 304), (319, 304)],
        [(434, 302), (470, 302), (470, 313), (488, 313), (488, 331), (468, 331),
         (468, 341), (422, 341), (422, 329), (401, 329), (401, 314), (434, 314)],
    ],
}
LAGOAS = {
    'enseada': [
        [(199,181),(221,181),(221,174),(247,174),(247,189),(270,189),(270,205),
         (259,205),(259,220),(223,220),(223,209),(197,209),(197,194),(189,194),(189,185),(199,185)],
        [(399,159),(412,159),(412,145),(433,145),(433,159),(443,159),(443,191),
         (423,191),(423,179),(399,179)],
    ],
    'deriva': [
        [(191,178),(236,178),(236,185),(263,185),(263,192),(286,192),(286,205),
         (260,205),(260,218),(215,218),(215,211),(185,211),(185,193),(191,193)],
        [(401,159),(427,159),(427,147),(450,147),(450,172),(435,172),(435,188),
         (418,188),(418,180),(401,180)],
    ],
}
PALETAS = {
    'enseada': dict(mar='#234962', ondas=('#28536a','#2b5870'), brilho=('#315b71','#356276'),
        agua=('#2d647b','#397f91','#5c9caa'), espuma='#a9cabe', face=('#57657a','#89939a'),
        borda='#bda894', piso='#dfc9aa', luz='#f1ddba', grao='#cdb79d',
        lago=('#aebfba','#7eabb1','#6495a5')),
    'deriva': dict(mar='#235956', ondas=('#2a625e','#2b6963'), brilho=('#31716a','#377a71'),
        agua=('#2e7066','#398b7c','#65a691'), espuma='#b3c9a4', face=('#77705b','#aa9c70'),
        borda='#bca67a', piso='#dcbe89', luz='#ead7a5', grao='#cba972',
        lago=('#b2bb89','#77a58b','#579784')),
}


def mascara(poligonos):
    m = Image.new('L', TAMANHO)
    d = ImageDraw.Draw(m)
    for pontos in poligonos:
        d.polygon(pontos, fill=255)
    return m


def mover(m, dy):
    n = Image.new('L', TAMANHO)
    n.paste(m, (0, dy))
    return n


def aplicar(im, cor, m):
    im.paste(cor, (0, 0, *TAMANHO), m)


def margem(m, raio, interna=False):
    operacao = ImageFilter.MinFilter if interna else ImageFilter.MaxFilter
    return m.filter(operacao(raio * 2 + 1))


def pol(d, x, y, pontos, cor):
    d.polygon([(x+dx, y+dy) for dx,dy in pontos], fill=cor)


def ondas(im, cores, acaso, deriva):
    d = ImageDraw.Draw(im)
    for _ in range(225):
        x, y = acaso.randrange(512), acaso.randrange(384)
        tam = acaso.choice((2,4,5,8,11,13))
        d.line((x,y,x+tam,y), fill=acaso.choice(cores['ondas']))
    # Grupos de correntes no mar aberto sem sinalizar faixas jogáveis.
    grupos = [(16,181),(96,257),(245,317),(413,350)] if deriva else [(31,207),(50,256),(221,316),(401,279)]
    for x, y in grupos:
        for largura, dx, dy in [(18,0,0),(13,7,4),(9,11,7),(5,-2,10)]:
            d.line((x+dx,y+dy,x+dx+largura,y+dy), fill=acaso.choice(cores['brilho']))


def ardósia(d, x, y, largura, altura):
    w, h = largura//2, altura
    pol(d,x,y,[(-w-4,1),(-w+3,-4),(w-2,-2),(w+4,5),(w-2,9),(-w,9)],'#b7ad9f')
    pol(d,x,y,[(-w,4),(-w,-h+4),(-w+5,-h+4),(-w+5,-h),(w-7,-h),
              (w-7,-h+4),(w-2,-h+4),(w,-h+9),(w,4),(w-4,7),(-w+2,7)],'#687585')
    pol(d,x,y,[(-w,-h+5),(-w+6,-h+5),(-w+6,-h),(w-7,-h),
              (w-7,-h+4),(w-2,-h+4),(w,-h+9),(w-5,-h+10),(-w+3,-h+10)],'#aeb5b4')
    d.line((x-w+2,y+2,x+w-4,y+2),fill='#82929c')
    if w >= 15:
        d.line((x-w+4,y-2,x+2,y-2),fill='#828c97')


def junco(d, x, y, curva):
    pol(d,x,y,[(-9,0),(-6,-3),(5,-3),(10,0),(5,3),(-7,3)],'#c0ad92')
    for dx,h in [(-6,6),(-3,8),(1,11),(3,7),(6,5)]:
        d.line((x+dx,y,x+dx+curva,y-h),fill='#697866')
        if h>6:
            d.line((x+dx+curva,y-h,x+dx+curva+2,y-h),fill='#a1996b')


def conchas(d, x, y, variante):
    pigmento = ['#b08d66','#a98167','#bd9b73'][variante]
    for dx,dy,w in [(-6,2,3),(4,-1,5),(11,3,2)]:
        d.rectangle((x+dx-w,y+dy-1,x+dx+w,y+dy+1),fill='#b8a277')
        pol(d,x+dx,y+dy,[(-w,0),(-w+1,-2),(0,-3),(w-1,-2),(w,0),(w-1,1),(-w+1,1)],pigmento)
        d.line((x+dx-w+1,y+dy-1,x+dx,y+dy-2),fill='#f4dfaf')


def boia(d, x, y):
    # Pequena baliza redonda, sem tablado: não se confunde com balsa.
    pol(d,x,y,[(-5,1),(-2,-3),(1,-3),(5,0),(4,2),(-4,2)],'#a9704a')
    d.rectangle((x-2,y-2,x+1,y-1),fill='#e3b579')
    d.point((x-2,y-2),fill='#efd4a3')
    d.line((x-7,y+4,x-2,y+4),fill='#6c9b86')
    d.line((x+2,y+3,x+8,y+3),fill='#6c9b86')


def agua_interior(im, formas, paleta):
    for forma in formas:
        m = mascara([forma])
        for raio, cor in zip((0,2,5), paleta):
            aplicar(im, cor, margem(m, raio, True) if raio else m)


PATAMARES = {
    'enseada': [
        ([(310,58),(339,58),(339,63),(361,63),(361,73),(346,73),(346,76),(305,76),(305,66),(310,66)],
         ('#b2a191','#c9baa3')),
        ([(208,239),(232,239),(232,244),(268,244),(268,253),(246,253),(246,261),(212,261),(212,252),(199,252),(199,245),(208,245)],
         ('#b9a092','#cbb69c')),
    ],
    'deriva': [
        ([(289,56),(341,56),(341,62),(370,62),(370,74),(347,74),(347,77),(290,77),(290,71),(282,71),(282,62),(289,62)],
         ('#a69d72','#bbc28a')),
        ([(178,252),(197,252),(197,244),(222,244),(222,250),(251,250),(251,260),(229,260),(229,270),(197,270),(197,264),(178,264)],
         ('#a49865','#bdba81')),
        ([(385,226),(405,226),(405,232),(426,232),(426,241),(411,241),(411,247),(391,247),(391,240),(378,240),(378,232),(385,232)],
         ('#a0956a','#b4b57f')),
    ],
}


def patamares(im, nome):
    # Pequenos bancos elevados, com face inferior e contornos deliberadamente escalonados.
    for forma, cores in PATAMARES[nome]:
        m = mascara([forma])
        aplicar(im, cores[0], mover(m, 3))
        aplicar(im, cores[1], m)


def pintar(nome):
    p = PALETAS[nome]
    deriva = nome == 'deriva'
    acaso = Random(211 if deriva else 478)
    im = Image.new('RGB', TAMANHO, p['mar'])
    ondas(im, p, acaso, deriva)
    m = mascara(TERRA[nome])
    for raio, cor in zip((17,11,6), p['agua']):
        aplicar(im,cor,margem(mover(m,3),raio))
    aplicar(im,p['espuma'],margem(mover(m,3),3))
    aplicar(im,p['face'][0],mover(m,8 if deriva else 10))
    aplicar(im,p['face'][1],mover(m,4 if deriva else 6))
    aplicar(im,p['borda'],m)
    aplicar(im,p['piso'],margem(m,3,True))
    d = ImageDraw.Draw(im)
    # A luz acompanha os degraus voltados ao norte; não se desenha um traço solto no interior.
    for y in range(1, 365):
        xs = [x for x in range(511) if m.getpixel((x,y)) and not m.getpixel((x,y-1))]
        grupos = []
        for x in xs:
            if grupos and x == grupos[-1][-1] + 1:
                grupos[-1].append(x)
            else:
                grupos.append([x])
        for grupo in grupos:
            if len(grupo)>11:
                d.line((grupo[0]+4,y+2,grupo[-1]-4,y+2),fill=p['luz'])
    areia = im.getpixel((154,155))
    for _ in range(520):
        x, y = acaso.randrange(6,507), acaso.randrange(10,373)
        largura = acaso.choice((0,1,2,3))
        if all(im.getpixel((i,y)) == areia for i in range(x,x+largura+1)):
            d.line((x,y,x+largura,y),fill=acaso.choice((p['grao'],p['grao'],p['luz'])))
    patamares(im, nome)
    agua_interior(im,LAGOAS[nome],p['lago'])
    d = ImageDraw.Draw(im)
    if deriva:
        for x,y,v in [(70,78,0),(65,280,2),(158,190,1),(228,253,2),(323,68,1),
                      (450,104,0),(455,205,2),(398,236,1),(337,316,0),(453,323,2)]:
            conchas(d,x,y,v)
        for x,y in [(89,219),(239,305),(405,285),(111,52)]:
            boia(d,x,y)
    else:
        for x,y,w,h in [(65,86,26,12),(101,168,25,13),(145,118,28,13),(210,99,22,11),
                        (324,66,34,14),(430,62,30,17),(461,183,17,12),(398,238,20,13),
                        (258,251,30,12),(111,322,36,12),(336,319,30,13)]:
            ardósia(d,x,y,w,h)
        for x,y,i in [(114,192,4),(226,244,5),(253,109,3),(280,193,3),(427,194,4),
                      (464,238,4),(462,61,3),(326,296,3),(95,340,3),(83,83,3)]:
            junco(d,x,y,i)
    return im,m


def main():
    for nome in PALETAS:
        im,_ = pintar(nome)
        assert im.size == TAMANHO and im.mode == 'RGB'
        im.save(SAIDA/f'{nome}-512.png', optimize=True)


if __name__ == '__main__':
    main()
