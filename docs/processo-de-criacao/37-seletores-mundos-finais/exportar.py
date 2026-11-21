"""Cartas sem interface para os três últimos seletores. Python 3 e Pillow."""
from pathlib import Path
from random import Random
from PIL import Image, ImageDraw, ImageFilter

TAMANHO = (512, 384)
PASTA = Path(__file__).resolve().parent

# Projeção superior com face da costa voltada ao sul; todos os recortes usam degraus.
TERRA = {
    'grutas': [
        [(118,125),(142,125),(142,92),(161,92),(161,69),(190,69),(190,56),(246,56),
         (246,68),(295,68),(295,51),(344,51),(344,63),(384,63),(384,43),(435,43),
         (435,59),(473,59),(473,80),(493,80),(493,121),(502,121),(502,183),(490,183),
         (490,238),(466,238),(466,254),(422,254),(422,239),(365,239),(365,222),(342,222),
         (342,204),(323,204),(323,228),(307,228),(307,244),(286,244),(286,261),(257,261),
         (257,280),(202,280),(202,268),(157,268),(157,248),(132,248),(132,224),(114,224),
         (114,203),(98,203),(98,162),(118,162)],
        [(48,79),(91,79),(91,92),(107,92),(107,120),(85,120),(85,134),(55,134),
         (55,120),(37,120),(37,96),(48,96)],
        [(312,286),(346,286),(346,300),(373,300),(373,327),(354,327),(354,343),
         (303,343),(303,328),(286,328),(286,305),(312,305)],
        [(72,287),(102,287),(102,302),(122,302),(122,324),(101,324),(101,347),
         (61,347),(61,335),(45,335),(45,303),(72,303)],
    ],
    'ressaca': [
        [(113,125),(143,125),(143,102),(167,102),(167,84),(216,84),(216,65),(239,65),
         (239,48),(285,48),(285,58),(319,58),(319,40),(374,40),(374,53),(409,53),
         (409,63),(450,63),(450,52),(480,52),(480,67),(498,67),(498,105),(506,105),
         (506,159),(493,159),(493,208),(504,208),(504,242),(485,242),(485,260),(445,260),
         (445,247),(371,247),(371,266),(311,266),(311,252),(258,252),(258,267),(218,267),
         (218,253),(180,253),(180,233),(148,233),(148,217),(118,217),(118,190),(105,190),
         (105,153),(113,153)],
        [(54,76),(81,76),(81,92),(104,92),(104,117),(88,117),(88,137),(53,137),
         (53,121),(32,121),(32,96),(54,96)],
        [(150,281),(192,281),(192,294),(209,294),(209,316),(187,316),(187,332),(143,332),
         (143,318),(123,318),(123,298),(150,298)],
        [(387,288),(421,288),(421,304),(448,304),(448,335),(429,335),(429,347),(384,347),
         (384,329),(363,329),(363,308),(387,308)],
    ],
    'farol': [
        [(116,126),(147,126),(147,106),(185,106),(185,118),(224,118),(224,93),(237,93),
         (237,62),(262,62),(262,43),(313,43),(313,55),(356,55),(356,40),(415,40),
         (415,53),(461,53),(461,67),(500,67),(500,110),(505,110),(505,193),(499,193),
         (499,270),(485,270),(485,289),(443,289),(443,272),(399,272),(399,287),(361,287),
         (361,265),(338,265),(338,235),(351,235),(351,209),(327,209),(327,184),(313,184),
         (313,207),(290,207),(290,227),(272,227),(272,253),(243,253),(243,272),(204,272),
         (204,259),(162,259),(162,242),(145,242),(145,212),(128,212),(128,182),(110,182),(110,148),(116,148)],
        [(58,66),(90,66),(90,84),(111,84),(111,110),(91,110),(91,126),(56,126),
         (56,110),(37,110),(37,89),(58,89)],
        [(54,289),(90,289),(90,304),(116,304),(116,330),(101,330),(101,346),(57,346),
         (57,329),(32,329),(32,309),(54,309)],
        [(285,293),(323,293),(323,308),(350,308),(350,334),(334,334),(334,356),
         (286,356),(286,337),(266,337),(266,314),(285,314)],
    ],
}
VAGAS = {
    'grutas': [[(200,178),(228,178),(228,188),(256,188),(256,206),(237,206),(237,216),
                (214,216),(214,207),(187,207),(187,191),(200,191)]],
    'ressaca': [[(281,130),(300,130),(300,117),(346,117),(346,107),(384,107),(384,123),
                (400,123),(400,144),(400,173),(394,173),(394,190),(371,190),
                (371,201),(336,201),(336,191),(298,191),(298,173),(273,173),(273,151),(281,151)]],
    'farol': [[(358,172),(382,172),(382,181),(413,181),(413,187),(434,187),(434,200),
               (417,200),(417,205),(393,205),(393,199),(368,199),(368,191),(350,191),(350,181),(358,181)]],
}
PALETAS = {
    'grutas': dict(mar='#30354c', ondas=('#353b54','#394059'), agua=('#404963','#505778','#6b6e91'),
                   espuma='#a9a2ae', faces=('#55516a','#79738b'), borda='#a08fa1',
                   piso='#c3b1b5', luz='#dbc7c5', grao='#b2a2ad', poça=('#9a99ad','#6d87a4','#596f90')),
    'ressaca': dict(mar='#263d50', ondas=('#2b4559','#314b60'), agua=('#36536a','#49697c','#648590'),
                    espuma='#abd0c9', faces=('#695a56','#8b7462'), borda='#ac8a6c',
                    piso='#d4af80', luz='#ead1a6', grao='#be996e', poça=('#bba78b','#78969a','#557a83')),
    'farol': dict(mar='#242d52', ondas=('#2a355d','#303a62'), agua=('#343f68','#444c76','#64668b'),
                  espuma='#a6a3ab', faces=('#5c546c','#8a7880'), borda='#a89380',
                  piso='#cdb48e', luz='#ecd3a7', grao='#bca282', poça=('#ac9c9b','#757b9d','#57688f')),
}


def mascara(poligonos):
    m = Image.new('L', TAMANHO)
    d = ImageDraw.Draw(m)
    for p in poligonos:
        d.polygon(p, fill=255)
    return m


def mover(m, dy):
    nova = Image.new('L', TAMANHO)
    nova.paste(m, (0, dy))
    return nova


def margem(m, n, dentro=False):
    return m.filter((ImageFilter.MinFilter if dentro else ImageFilter.MaxFilter)(2*n+1))


def aplicar(im, cor, forma):
    im.paste(cor, (0, 0, *TAMANHO), forma)


def pol(d, x, y, pontos, cor):
    d.polygon([(x+dx,y+dy) for dx,dy in pontos], fill=cor)


def cristais(d, x, y, modelo):
    cores = [('#776486','#9a81aa','#c7a8cc'),('#655a86','#8980b2','#beb3d6'),
             ('#616988','#8795b6','#bac9d8')][modelo]
    pol(d,x,y,[(-15,2),(-11,-2),(8,-2),(15,1),(10,7),(-12,7)],'#a093a3')
    grupos = [[(-7,9,4),(0,15,6),(7,8,4)],[(-8,9,3),(0,13,4),(7,17,4)],[(-7,13,5),(2,10,4),(9,7,3)]]
    for dx,h,w in grupos[modelo]:
        px=x+dx
        pol(d,px,y,[(-w,1),(-w,-h+4),(-2,-h+1),(1,-h),(w,-h+4),(w,1),(0,4)],cores[0])
        pol(d,px,y,[(-w+1,0),(-w+1,-h+4),(-1,-h+1),(1,-h), (1,1),(0,2)],cores[1])
        d.line((px-1,y-h+3,px-1,y-h+7),fill=cores[2])


def gruta(d,x,y,w,h):
    pol(d,x,y,[(-w,5),(-w,-h+4),(-w+6,-h+4),(-w+6,-h),(w-7,-h),
             (w-7,-h+4),(w,-h+4),(w,5),(w-6,8),(-w+4,8)],'#756b85')
    pol(d,x,y,[(-w+1,-h+5),(-w+7,-h+5),(-w+7,-h+1),(w-8,-h+1),
             (w-8,-h+4),(w-1,-h+5),(w-1,-h+8),(-w+1,-h+8)],'#aba1b1')
    pol(d,x,y,[(-7,5),(-7,-3),(-4,-3),(-4,-7),(4,-7),(4,-4),(7,-4),(7,5)],'#4c465e')
    d.line((x-9,y+5,x+9,y+5),fill='#95869c')


def pilar(d,x,y,w,h, cor):
    sombra,face,luz=cor
    pol(d,x,y,[(-w-4,5),(-w,1),(w,1),(w+5,6),(w,9),(-w-3,9)],sombra)
    pol(d,x,y,[(-w,3),(-w,-h+5),(-w+4,-h+5),(-w+4,-h),(w-4,-h),
             (w-4,-h+4),(w,-h+4),(w,4),(w-3,6),(-w+3,6)],face)
    pol(d,x,y,[(-w+1,-h+6),(-w+5,-h+6),(-w+5,-h+1),(w-4,-h+1),(w-4,-h+4),
             (w-1,-h+4),(w-1,-h+8),(-w+1,-h+8)],luz)
    d.line((x-w+3,y+3,x+w-3,y+3),fill=sombra)


def torre(d,x,y):
    # Pequeno farol sobre uma base alta; a lanterna não coincide com nenhum marcador.
    pol(d,x,y,[(-20,4),(-15,-2),(8,-2),(19,4),(19,9),(-15,9),(-20,7)],'#a8957c')
    d.rectangle((x-11,y+1,x+11,y+5),fill='#766575')
    pol(d,x,y,[(-8,2),(-6,-21),(-6,-27),(6,-27),(6,-21),(9,2)],'#ded0a7')
    pol(d,x,y,[(3,2),(2,-22),(6,-23),(9,2)],'#a48f80')
    d.rectangle((x-6,y-15,x+6,y-12),fill='#b27d70')
    d.rectangle((x-2,y-5,x+2,y+2),fill='#6c5a6b')
    d.rectangle((x-6,y-27,x+6,y-22),fill='#765e75')
    d.rectangle((x-4,y-26,x+4,y-23),fill='#efcb78')
    d.rectangle((x-2,y-26,x+1,y-24),fill='#fff0ba')
    pol(d,x,y,[(-9,-27),(-9,-29),(-6,-29),(-6,-32),(-2,-32),(-2,-34),
               (2,-34),(2,-32),(6,-32),(6,-29),(9,-29),(9,-27)],'#916375')


def corrente(d,x,y,formas):
    for i,(dx,dy,tam) in enumerate(formas):
        d.line((x+dx,y+dy,x+dx+tam,y+dy),fill=('#577a88','#668c96','#80a6a8')[i%3])


def decorar(d,nome):
    if nome=='grutas':
        for x,y,w,h in [(69,105,21,17),(163,116,15,16),(412,64,24,17),(459,183,13,14),
                        (273,249,19,15),(325,324,22,19),(85,321,20,12)]:
            gruta(d,x,y,w,h)
        for x,y,v in [(92,115,2),(267,70,0),(355,57,1),(447,69,0),(358,218,2),
                      (136,201,1),(228,249,0),(352,327,2),(59,330,1)]:
            cristais(d,x,y,v)
    elif nome=='ressaca':
        ferrugem=('#b18c6a','#a67e61','#d7b487')
        xisto=('#af9172','#987b68','#c8ae8e')
        for x,y,w,h,c in [(71,113,19,16,xisto),(155,120,14,15,ferrugem),(288,74,18,18,xisto),
                          (347,62,13,14,ferrugem),(447,67,19,14,xisto),(457,194,12,11,ferrugem),
                          (221,243,12,11,xisto),(337,246,17,13,ferrugem),(165,310,23,11,xisto),
                          (415,326,20,19,ferrugem)]:
            pilar(d,x,y,w,h,c)
    else:
        torre(d,309,333)
        ouro=('#af977d','#a48b76','#dbc29a')
        xisto=('#b29b8d','#89788a','#b4a5a6')
        for x,y,w,h,c in [(67,103,15,13,xisto),(158,188,14,11,ouro),(273,60,15,13,xisto),
                          (386,64,20,18,xisto),(466,59,13,9,ouro),(232,237,16,13,xisto),
                          (365,275,13,12,ouro),(456,267,16,13,xisto),(74,320,20,12,ouro)]:
            pilar(d,x,y,w,h,c)
        for x,y in [(295,307),(321,346),(277,333),(335,322),(396,262)]:
            d.rectangle((x-2,y-1,x+2,y+1),fill='#c8a97b')
            d.point((x-1,y-1),fill='#e3c793')


def pintar(nome):
    p=PALETAS[nome]
    rng=Random({'grutas':313,'ressaca':409,'farol':509}[nome])
    im=Image.new('RGB',TAMANHO,p['mar'])
    d=ImageDraw.Draw(im)
    for _ in range(213):
        x,y=rng.randrange(512),rng.randrange(384)
        d.line((x,y,x+rng.choice((2,4,6,9,12)),y),fill=rng.choice(p['ondas']))
    if nome=='ressaca':
        for x,y in [(24,173),(39,218),(57,272),(256,320),(287,351),(460,286),(454,369)]:
            corrente(d,x,y,[(0,0,19),(7,4,20),(12,8,13),(17,10,8),(-3,13,14)])
    m=mascara(TERRA[nome])
    for raio,cor in zip((19,12,7),p['agua']):
        aplicar(im,cor,margem(mover(m,3),raio))
    aplicar(im,p['espuma'],margem(mover(m,4),3))
    for dy,cor in zip((9,5),p['faces']):
        aplicar(im,cor,mover(m,dy))
    aplicar(im,p['borda'],m)
    aplicar(im,p['piso'],margem(m,3,True))
    d=ImageDraw.Draw(im)
    for y in range(1,369):
        inicio=None
        for x in range(512):
            sob_luz=m.getpixel((x,y)) and not m.getpixel((x,y-1))
            if sob_luz and inicio is None:
                inicio=x
            elif not sob_luz and inicio is not None:
                if x-inicio>12:
                    d.line((inicio+4,y+2,x-5,y+2), fill=p['luz'])
                inicio=None
    piso=tuple(bytes.fromhex(p['piso'][1:]))
    for _ in range(590):
        x,y=rng.randrange(6,507),rng.randrange(8,370)
        largura=rng.choice((0,1,2,3))
        if all(im.getpixel((i,y))==piso for i in range(x,x+largura+1)):
            d.line((x,y,x+largura,y),fill=rng.choice((p['grao'],p['grao'],p['luz'])))
    for forma in VAGAS[nome]:
        lago=mascara([forma])
        for raio,cor in zip((0,2,5),p['poça']):
            aplicar(im,cor,margem(lago,raio,True) if raio else lago)
    decorar(ImageDraw.Draw(im),nome)
    return im,m


def main():
    for nome in PALETAS:
        im,_ = pintar(nome)
        assert im.size==TAMANHO and im.mode=='RGB'
        im.save(PASTA/f'{nome}-512.png',optimize=True)


if __name__=='__main__':
    main()
