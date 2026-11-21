"""Fundo editável da Enseadinha, separado dos vértices da campanha."""
from pathlib import Path
from random import Random
from sys import argv

from PIL import Image, ImageDraw, ImageFilter

TAMANHO = (512, 384)
MAR = '#154d60'
AGUAS = ('#1f6770', '#287e82', '#4ca6a0', '#96ccc1')
AREIA = '#eac286'
# As coordenadas são pixels nativos: a costa dobra em ângulos retos e
# os portais encontram areia firme nos vértices existentes da Enseadinha.
COSTA = (
    (110, 146), (120, 146), (120, 126), (145, 126), (145, 78),
    (152, 78), (152, 63), (187, 63), (187, 72), (219, 72), (219, 89),
    (241, 89), (241, 104), (273, 104), (273, 124), (296, 124), (296, 113),
    (316, 113), (316, 94), (359, 94), (359, 113), (395, 113), (395, 132),
    (415, 132), (415, 172), (392, 172), (392, 190), (377, 190), (377, 221),
    (365, 221), (365, 243), (320, 243), (320, 228), (306, 228), (306, 192),
    (286, 192), (286, 204), (265, 204), (265, 230), (251, 230), (251, 251),
    (202, 251), (202, 235), (179, 235), (179, 211), (155, 211), (155, 201),
    (131, 201), (131, 184), (110, 184),
)
ILHOTAS = (
    ((68, 237), (96, 237), (96, 243), (112, 243), (112, 269), (94, 269),
     (94, 277), (61, 277), (61, 268), (47, 268), (47, 250), (68, 250)),
    ((428, 79), (448, 79), (448, 90), (466, 90), (466, 110), (451, 110),
     (451, 119), (420, 119), (420, 105), (410, 105), (410, 89), (428, 89)),
    ((394, 267), (407, 267), (407, 278), (429, 278), (429, 294), (411, 294),
     (411, 303), (380, 303), (380, 296), (370, 296), (370, 278), (394, 278)),
)


def mascara(poligonos, dilatacao=0):
    resultado = Image.new('L', TAMANHO)
    for pontos in poligonos:
        ImageDraw.Draw(resultado).polygon(pontos, fill=255)
    return resultado.filter(ImageFilter.MaxFilter(2*dilatacao+1)) if dilatacao else resultado


def bandeja(imagem, forma, cor, dy=0):
    if dy:
        deslocada = Image.new('L', TAMANHO)
        deslocada.paste(forma, (0, dy))
        forma = deslocada
    imagem.paste(cor, (0, 0, *TAMANHO), forma)


def vegetacao(desenho, x, y, espelho=1, formato=0):
    def v(pontos):
        return [(x + a*espelho, y + b) for a, b in pontos]

    desenho.polygon(v(((-12, 2), (2, -3), (17, 2), (19, 6), (0, 8), (-14, 6))), fill='#be955e')
    tronco = ((-3, 2), (-5, -4), (-4, -12), (0, -24), (4, -25),
              (1, -13), (0, -6), (2, 2))
    desenho.polygon(v(tronco), fill='#735641')
    desenho.line(v(((-2, 0), (-3, -5), (-2, -13), (1, -21))), fill='#d59854', width=2)
    if formato:
        folhas = (((3,-24),(-7,-34),(-19,-32),(-24,-28),(-7,-29)),
                  ((3,-24),(10,-36),(22,-36),(27,-31),(14,-31)),
                  ((3,-24),(20,-27),(29,-19),(22,-17),(12,-21)),
                  ((3,-24),(-9,-26),(-20,-21),(-23,-16),(-10,-20)))
    else:
        folhas = (((3,-24),(-5,-35),(-16,-36),(-24,-31),(-11,-32)),
                  ((3,-24),(9,-34),(20,-38),(28,-34),(15,-33)),
                  ((3,-24),(18,-29),(29,-23),(33,-17),(18,-22)),
                  ((3,-24),(-12,-25),(-22,-18),(-24,-13),(-11,-19)))
    for cor, folha in zip(('#38614e','#557a43','#335f4c','#557844'), folhas):
        desenho.polygon(v(folha), fill=cor)
        desenho.line(v((folha[0], folha[1], folha[2])), fill='#84a45c', width=1)
    desenho.line(v(((1,-22),(4,-23),(7,-22))), fill='#c48d52', width=2)


def recife(desenho, x, y, variante=0):
    base = ((-8,1),(-4,-3),(0,-4),(5,-2),(10,1),(6,4),(-5,4))
    desenho.polygon(tuple((x+a,y+b) for a,b in base), fill='#328c8f')
    cor = ('#827a6c','#908374','#828974')[variante]
    desenho.polygon(((x-5,y),(x-4,y-4),(x,y-7),(x+3,y-6),(x+6,y-1),(x+3,y+2),(x-2,y+2)), fill=cor)
    desenho.line(((x-4,y-3),(x,y-6),(x+3,y-5)), fill='#c8b68c', width=2)
    desenho.line(((x+4,y-2),(x+3,y+1),(x,y+1)), fill='#5d696a', width=2)


def exportar(destino):
    imagem = Image.new('RGB', TAMANHO, MAR)
    costa = (COSTA, *ILHOTAS)
    for largura, cor in zip((27, 17, 8, 3), AGUAS):
        bandeja(imagem, mascara(costa, largura), cor, 2 if largura > 3 else 0)
    firme = mascara(costa)
    for dy, cor in ((9,'#559594'),(7,'#8c6e58'),(4,'#b68354'),(0,AREIA)):
        bandeja(imagem, firme, cor, dy)
    desenho = ImageDraw.Draw(imagem)
    rng = Random(34)
    # Ruído em grupos curtos, colorido conforme a camada da margem; nada de alfa.
    agua_grupos = {'#154d60':'#19566a','#1f6770':'#27757a','#287e82':'#398e90'}
    alvos = {tuple(bytes.fromhex(a[1:])): b for a, b in agua_grupos.items()}
    for _ in range(360):
        x, y = rng.randrange(8, 495), rng.randrange(8, 366)
        w = rng.randrange(3, 12)
        cor = imagem.getpixel((x, y))
        if cor in alvos and imagem.getpixel((x+w, y)) == cor:
            desenho.line((x, y, x+w, y), fill=alvos[cor])
    for _ in range(490):
        x, y = rng.randrange(44, 465), rng.randrange(59, 303)
        w = rng.randrange(2, 7)
        if all(firme.getpixel((x+a,y)) and firme.getpixel((x+a,y+1)) for a in range(w)):
            desenho.line((x,y,x+w-1,y), fill=rng.choice(('#f6d69a','#e2b777','#d9ac73')))
    # A espuma enfatiza a borda iluminada, sem abraçar as trilhas.
    for poligono in costa:
        for (x,y),(fim_x,fim_y) in zip(poligono,poligono[1:]+poligono[:1]):
            if y == fim_y and x+9 < fim_x:
                desenho.line((x+2,y-2,fim_x-3,y-2),fill='#e2f1ce', width=1)
                desenho.line((x+3,y+1,min(fim_x-3,x+13),y+1),fill='#ffe4a9', width=1)
    vegetacao(desenho, 132, 172, 1, 1)
    vegetacao(desenho, 290, 187, -1)
    vegetacao(desenho, 343, 132, 1)
    vegetacao(desenho, 241, 239, -1, 1)
    vegetacao(desenho, 81, 262, 1)
    vegetacao(desenho, 438, 103, -1, 1)
    for x, y, v in ((87, 198, 0),(150, 219, 1),(174, 113, 2),(282, 101, 1),(386, 129, 1),
                    (332, 236, 2),(391, 281, 2),(409, 288, 0),(458, 181, 0),(74, 111, 1)):
        recife(desenho,x,y,v)
    for x, y in ((136,185),(206,89),(235,101),(312,136),(357,202),(205,222),(233,234),(70,257),(424,106)):
        desenho.line((x,y,x+6,y),fill='#ad8e5b',width=2)
        desenho.line(((x+1,y-1),(x,y-5)),fill='#6c8754',width=2)
        desenho.line(((x+3,y-1),(x+4,y-5)),fill='#829a58',width=2)
    imagem.save(destino)


if __name__ == '__main__':
    exportar(Path(argv[1]))
