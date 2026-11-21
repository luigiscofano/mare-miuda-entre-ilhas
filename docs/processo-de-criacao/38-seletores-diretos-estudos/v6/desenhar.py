"""Estudos V4 de dioramas costeiros. Raster opaco nativo de 480 × 360."""
from pathlib import Path
from random import Random

from PIL import Image, ImageChops, ImageDraw, ImageFilter

import detalhes
import refino

from interface import LAYOUT,MUNDOS as TITULOS,botao,moldura

D=Path(__file__).resolve().parent
W,H=480,360
PALETAS={
 'praia':dict(mar='#157c82', fundo='#126c75', plataforma='#e4b979', areia='#f3cd89',
    seco='#fadf9b', alto='#fee5a9',sombra='#ce9e6b', folhagem='#9b9d56',
    certo='#aeaa64',verde='#7e8a51',clara='#c5b86b',
    pedra=('#674963','#89545d','#af654f','#cd805d','#e69a61','#f6b773'),
    agua=('#146c79','#22888b','#44a79c','#95cdb3','#eef1cb')),
 'ressaca':dict(mar='#254b5c', fundo='#203d55', plataforma='#9c6865', areia='#564957',
    seco='#786172', alto='#9f797a',sombra='#433e50',folhagem='#694851',
    certo='#80515a',verde='#705052',clara='#9a706c',
    pedra=('#2e2d45','#41364b','#584151','#72505a','#9c5b58','#be7b67'),
    agua=('#2f5771','#3e7182','#5e94a0','#a4bdb8','#e7e4cb')),
 'farol':dict(mar='#354a73', fundo='#2d3d68', plataforma='#af96a4', areia='#ddba9e',
    seco='#e8c7a9', alto='#f1d8bc',sombra='#cba399',folhagem='#8c8f96',
    certo='#aaa3a7',verde='#6f768b',clara='#bfb0ae',
    pedra=('#4a3c62','#62547d','#806581','#9f7d86','#bb918b','#e4b197'),
    agua=('#344773','#456183','#5e8497','#a2bcb9','#e0e6dc')),
}
PALETAS.update({
 'recifes':dict(mar='#195d6f',fundo='#184e64',plataforma='#b59a7a',areia='#d0b896',
    seco='#e7ce9d',alto='#f9dfaa',sombra='#a08e7c',folhagem='#b35f6a',
    certo='#d48b7f',verde='#a95a61',clara='#df9a8e',
    pedra=('#424b64','#536273','#7c7778','#a3927d','#c5a77f','#ecc998'),
    agua=('#1b5d74','#2f7a8a','#5caaa5','#9ecdc2','#e0e8cf')),
 'mangue':dict(mar='#3b6454',fundo='#315849',plataforma='#a59063',areia='#c1a879',
    seco='#d4bc84',alto='#e7cc92',sombra='#9b7b55',folhagem='#7d8753',
    certo='#9c985e',verde='#657949',clara='#b1a76b',
    pedra=('#4b414c','#5e5047','#7b634e','#a27b58','#ba985f','#e0b97f'),
    agua=('#3a6455','#4e7966','#679781','#a0b497','#d8d9ae')),
 'enseada':dict(mar='#265e7d',fundo='#244e6a',plataforma='#a7a2a2',areia='#d3c8b0',
    seco='#e5d7b5',alto='#f0e6ca',sombra='#a99a93',folhagem='#989297',
    certo='#999a9e',verde='#7e919a',clara='#aeafb3',
    pedra=('#47485f','#5d6077','#807888','#9b93a1','#c1ada8','#e0c7ae'),
    agua=('#2b6280','#3f8397','#6eaaaa','#a4c9c0','#e0e9d6')),
 'deriva':dict(mar='#26777b',fundo='#206471',plataforma='#b6a479',areia='#dcc49b',
    seco='#ebd3a3',alto='#f2e2b6',sombra='#ad9271',folhagem='#89976b',
    certo='#a7a371',verde='#78876a',clara='#b3ad79',
    pedra=('#69524f','#86674f','#a08055','#c0a471','#d6ba89','#f0cf9d'),
    agua=('#227078','#3a8b88','#66ada0','#a8cbb4','#e4e6c5')),
 'grutas':dict(mar='#45465f',fundo='#3a3c57',plataforma='#b39bb2',areia='#cbb1b7',
    seco='#e0c1c9',alto='#f2d3d7',sombra='#9e829f',folhagem='#876d9e',
    certo='#a486aa',verde='#746492',clara='#c4a4c4',
    pedra=('#3d344f','#564760','#735781','#94748d','#b68caa','#d9acbd'),
    agua=('#494866','#665e7d','#8e7f9d','#b8abc0','#ddd0db')),
})
ORDEM=('praia','recifes','mangue','enseada','deriva','grutas','ressaca','farol')
# Pontos do novo platô, a partir da metade do topo. As curvaturas são
# agrupamentos escalonados, não contornos anti-aliased.
PERFIL={
 'praia':((239,78),(203,78),(203,82),(184,82),(184,86),(150,86),(150,92),(121,92),
          (121,99),(102,99),(91,106),(75,106),(75,116),(68,116),(68,127),(60,127),
          (60,143),(54,143),(54,182),(61,182),(61,209),(78,209),(78,223),(91,223),
          (91,241),(104,241),(104,252),(121,252),(121,263),(141,263),(141,273),
          (164,273),(164,279),(188,279),(188,288),(211,288),(211,292),(239,292)),
 'ressaca':((239,143),(218,143),(218,129),(194,129),(194,112),(170,112),(170,94),
            (148,94),(148,83),(123,83),(123,76),(92,76),(92,83),(72,83),(72,96),
            (58,96),(58,114),(49,114),(49,141),(43,141),(43,178),(47,178),
            (47,211),(61,211),(61,234),(72,234),(72,252),(91,252),(91,266),
            (123,266),(123,279),(158,279),(158,289),(190,289),(190,297),(239,297)),
 'farol':((239,61),(225,61),(225,74),(214,74),(214,90),(198,90),(198,104),(175,104),
          (175,117),(153,117),(153,127),(124,127),(124,137),(99,137),(99,147),
          (70,147),(70,157),(57,157),(57,178),(74,178),(74,193),(92,193),(92,210),
          (105,210),(105,225),(121,225),(121,239),(104,239),(104,253),(125,253),
          (125,267),(146,267),(146,254),(169,254),(169,269),(184,269),(184,283),
          (202,283),(202,297),(222,297),(222,310),(239,310)),
}


PERFIL.update({
 'recifes':((239,106),(224,106),(224,94),(199,94),(199,80),(173,80),(173,91),(151,91),
 (151,77),(122,77),(122,90),(101,90),(101,104),(76,104),(76,116),(58,116),(58,128),
 (46,128),(46,148),(53,148),(53,177),(48,177),(48,194),(61,194),(61,211),
 (50,211),(50,228),(68,228),(68,251),(86,251),(86,270),(106,270),(106,257),(132,257),
 (132,280),(159,280),(159,268),(183,268),(183,291),(205,291),(205,279),(239,279)),
 'mangue':((239,128),(224,128),(224,108),(210,108),(210,96),(197,96),(197,85),(174,85),
 (174,77),(150,77),(150,83),(125,83),(125,77),(97,77),(97,87),(78,87),(78,103),(64,103),
 (64,124),(57,124),(57,152),(70,152),(70,174),(83,174),(83,193),(70,193),(70,213),
 (53,213),(53,243),(61,243),(61,263),(83,263),(83,280),(111,280),(111,290),(142,290),
 (142,282),(164,282),(164,272),(185,272),(185,285),(206,285),(206,297),(239,297)),
 'enseada':((239,66),(216,66),(216,76),(191,76),(191,94),(168,94),(168,109),(147,109),
 (147,126),(124,126),(124,145),(97,145),(97,159),(76,159),(76,177),(55,177),(55,191),
 (43,191),(43,223),(57,223),(57,247),(77,247),(77,264),(103,264),(103,276),(126,276),
 (126,288),(153,288),(153,297),(180,297),(180,307),(239,307)),
 'deriva':((239,93),(220,93),(220,83),(198,83),(198,73),(174,73),(174,80),(141,80),
 (141,68),(110,68),(110,76),(87,76),(87,89),(68,89),(68,111),(56,111),(56,139),
 (68,139),(68,151),(85,151),(85,168),(103,168),(103,186),(137,186),(137,199),
 (151,199),(151,207),(112,207),(112,219),(82,219),(82,241),(62,241),(62,270),
 (80,270),(80,289),(113,289),(113,299),(181,299),(181,289),(218,289),(218,302),(239,302)),
 'grutas':((239,87),(220,87),(220,79),(197,79),(197,68),(166,68),(166,77),(150,77),
 (150,86),(123,86),(123,101),(102,101),(102,117),(80,117),(80,133),(62,133),(62,156),
 (46,156),(46,210),(59,210),(59,231),(76,231),(76,251),(102,251),(102,267),(124,267),
 (124,281),(153,281),(153,294),(193,294),(193,303),(239,303)),
})


def shape(nome):
    p=PERFIL[nome]
    m=Image.new('L',(W,H))
    ImageDraw.Draw(m).polygon(list(p)+[(478-x,y) for x,y in reversed(p)],fill=255)
    return m


def deslocar(m,dy,dx=0):
    n=Image.new('L',(W,H))
    n.paste(m,(dx,dy))
    return n


def mascara_pontos(p):
    m=Image.new('L',(W,H))
    ImageDraw.Draw(m).polygon(p,fill=255)
    return m


def colar(im,cor,mask):
    im.paste(cor,(0,0,W,H),mask)


def anteparo(nome):
    """Área reservada para retângulo do botão, qualquer estado e margem."""
    m=Image.new('L',(W,H))
    d=ImageDraw.Draw(m)
    for classe in LAYOUT[nome].values():
        for u,v in classe:
            x,y=round(u*1.5),round(v*1.5)
            d.rectangle((x-22,y-19,x+22,y+21),fill=255)
    return m


def costa_agua(im,mask,c,rng):
    # Mesmo consumo da semente das outras camadas: só muda o acabamento da água.
    for _ in range(210):
        rng.randrange(9,W-22); rng.randrange(55,H-35)
        rng.choice((3,5,8,10,15,19))
    refino.orla_conectada(im, mask, c)


def falasia(im,mask,c,rng):
    # Direção da vista: leve deslocamento subordinado à superfície.
    pedra=c['pedra']
    for dy,dx,cor in ((25,4,pedra[0]),(20,4,pedra[1]),(17,3,pedra[2]),
                     (10,2,pedra[3]),(5,1,pedra[4]),(0,0,c['areia'])):
        colar(im,cor,deslocar(mask,dy,dx))
    face=ImageChops.subtract(deslocar(mask,24,4),mask)
    # Grupos irregulares que se encaixam na face; não riscas paralelas.
    for j in range(460):
        x,y=rng.randrange(55,433),rng.randrange(94,337)
        if not face.getpixel((x,y)):
            continue
        w,h=rng.randrange(4,13),rng.randrange(2,7)
        r=mascara_pontos(((x,y),(x+w-3,y-2),(x+w,y+1),(x+w-1,y+h-1),(x+2,y+h+1),(x,y+h-1)))
        colar(im,pedra[rng.choices((0,1,2,3,4,5),(1,2,2,3,3,1))[0]],ImageChops.multiply(r,face))
    # Lábio em direção da luz, com blocos de areia quente de espessuras variadas.
    beira=ImageChops.subtract(mask,deslocar(mask.filter(ImageFilter.MinFilter(5)),7,2))
    colar(im,c['seco'],beira)
    return face


def placa(pontos,dx=0,dy=0):
    return [(x+dx,y+dy) for x,y in pontos]


def decorar_plato(im,mask,livre,mundo,c,rng):
    # Textura em manchas largas e fraturas pequenas, restritas às margens.
    d=ImageDraw.Draw(im)
    zona=ImageChops.multiply(mask,livre)
    margem=ImageChops.subtract(mask,mask.filter(ImageFilter.MinFilter(27)))
    for j in range(215):
        x,y=rng.randrange(64,417),rng.randrange(74,312)
        if not zona.getpixel((x,y)) or (not margem.getpixel((x,y)) and j%4):
            continue
        u=rng.randrange(3,12)
        p=((x-u,y),(x-u+3,y-2),(x+u-4,y-3),(x+u,y),(x+u-3,y+3),(x+1,y+3),(x-2,y+4))
        cor=c['seco'] if j%3 else c['sombra']
        colar(im,cor,ImageChops.multiply(mascara_pontos(p),zona))
    if mundo=='praia':
        bancos=((98,149,23),(380,149,23),(104,232,18),(374,232,18),(173,108,17),(305,108,17))
        for x,y,r in bancos:
            p=((x-r,y),(x-r+4,y-6),(x-6,y-8),(x+4,y-6),(x+r-4,y-4),(x+r,y+1),
               (x+r-5,y+6),(x+4,y+6),(x-2,y+9),(x-r+4,y+6))
            base=ImageChops.multiply(mascara_pontos(placa(p,0,3)),zona)
            ilha=ImageChops.multiply(mascara_pontos(p),zona)
            colar(im,c['sombra'],base)
            colar(im,c['folhagem'],ilha)
            polos=((x-r+5,y),(x-r+7,y-4),(x-5,y-6),(x+6,y-4),(x+4,y),
                   (x-6,y+2),(x-r+8,y+2))
            colar(im,c['clara'],ImageChops.multiply(mascara_pontos(polos),ilha))
            manchas=((x-3,y+2),(x+8,y),(x+15,y+2),(x+9,y+4),(x+1,y+4))
            colar(im,c['verde'],ImageChops.multiply(mascara_pontos(manchas),ilha))
        concha=(
         (((215,94),(224,86),(246,86),(261,91),(265,100),(256,107),(225,107),(214,102)),'#b9a56e'),
         (((218,93),(228,87),(245,88),(257,93),(259,100),(251,105),(225,104),(218,100)),'#70b2a3'),
         (((230,96),(233,91),(239,90),(244,92),(249,97),(246,101),(237,102),(231,100)),'#e3a080'),
         (((233,95),(236,92),(242,92),(245,96),(239,98),(234,98)),'#ffdcaa'),
         (((237,94),(240,92),(243,94),(240,96)),'#fff0c4'),
        )
        for p,cor in concha:
            colar(im,cor,ImageChops.multiply(mascara_pontos(p),zona))
    elif mundo=='farol':
        estrela=((239,86),(258,146),(322,151),(270,188),(285,245),(239,215),
                 (193,245),(208,188),(156,151),(220,146))
        # A estrela é uma grande peça de relevo, não um caminho. Os
        # entalhes à volta dos botões fazem parte da moldura.
        poligonos=(
            (placa(estrela,2,4),c['sombra']), (estrela,c['plataforma']),
            (((239,89),(239,179),(320,151),(259,148)),c['seco']),
            (((239,179),(270,188),(285,245),(239,215)),c['sombra']),
        )
        for p,cor in poligonos:
            colar(im,cor,ImageChops.multiply(mascara_pontos(p),zona))

        torre=(
          (((224,86),(239,81),(252,84),(253,89),(235,92),(224,90)),c['sombra']),
          (((236,66),(242,66),(243,84),(234,84)),c['pedra'][0]),
          (((237,67),(241,67),(241,83),(236,83)),c['seco']),
          (((234,63),(239,59),(245,63),(245,67),(234,67)),c['pedra'][3]),
          (((237,63),(242,63),(242,66),(237,66)),'#fff1bd'),
        )
        for p,cor in torre:
            colar(im,cor,ImageChops.multiply(mascara_pontos(p),zona))
    elif mundo=='ressaca':
        # Interior côncavo e lava contida, sem nenhum brilho difuso.
        formas=(
         (((225,164),(254,164),(265,171),(279,202),(280,219),(265,239),(231,246),(203,231),(196,214),(201,195),(213,176)),'#443644'),
         (((224,166),(252,166),(266,176),(268,186),(251,179),(227,181),(206,201),(214,177)),'#ab765f'),
         (((270,190),(278,206),(277,221),(266,234),(257,238),(254,225),(261,211)),'#6e4a53'),
         (((203,203),(210,210),(220,229),(240,232),(254,225),(258,237),(237,243),(210,233),(199,217)),'#5d414e'),
         (((226,171),(256,171),(267,184),(272,211),(259,231),(228,234),(209,219),(205,201),(214,178)),'#463647'),
         (((226,175),(253,175),(263,186),(268,207),(257,226),(229,228),(214,216),(208,200),(217,182)),'#99685e'),
         (((227,180),(252,180),(259,188),(264,207),(254,222),(229,226),(217,216),(212,199),(221,187)),'#6e4b59'),
         (((226,191),(248,187),(259,195),(260,210),(249,221),(231,222),(218,211),(218,200)),'#3d3148'),
         (((230,200),(240,196),(250,199),(255,207),(249,216),(236,219),(225,213),(224,205)),'#ae5f56'),
         (((231,202),(240,198),(247,201),(251,207),(247,211),(240,209),(232,214),(227,210),(227,205)),'#df8a64'),
         (((233,206),(238,202),(244,203),(242,207),(236,208),(231,211)),'#ffd080'),
        )
        for p,cor in formas:
            colar(im,cor,ImageChops.multiply(mascara_pontos(p),zona))


    # Cada par abaixo define um marco físico único por ambiente. A máscara
    # livre recusa decoração no espaço reservado ao botão ou à sua borda.
    if mundo=='recifes':
        bancos=((181,182),(297,182))
        for x,y in bancos:
            p=placa(((-20,1),(-12,-7),(-1,-9),(7,-7),(17,-8),(22,0),(16,7),(2,10),(-11,8)),x,y)
            colar(im,c['sombra'],ImageChops.multiply(mascara_pontos(placa(p,0,4)),zona))
            colar(im,c['agua'][2],ImageChops.multiply(mascara_pontos(p),zona))
            coral=(((-12,4),(-9,-4),(-5,-2),(-4,-8),(0,-7),(0,-4),(4,-6),
                     (7,-3),(4,4),(-3,8)),c['folhagem'])
            colar(im,coral[1],ImageChops.multiply(mascara_pontos(placa(coral[0],x+3,y-1)),zona))
            p=placa(((-9,-1),(-6,-3),(-3,0),(-5,4),(-9,3)),x+3,y-1)
            colar(im,c['clara'],ImageChops.multiply(mascara_pontos(p),zona))
    elif mundo=='mangue':
        # Estreito em água salobra e sedimento rasteiro, não árvores.
        canal=((228,129),(249,129),(249,160),(262,179),(257,207),(251,225),
               (250,250),(227,250),(225,225),(215,205),(216,176),(228,157))
        for p,cor in ((placa(canal,0,4),c['sombra']),(canal,c['agua'][1]),
                      (((228,153),(238,143),(244,164),(250,175),(243,187),(232,190),(225,171)),c['agua'][2])):
            colar(im,cor,ImageChops.multiply(mascara_pontos(p),zona))
        for x,y,e in ((222,193,1),(258,225,-1),(219,234,1)):
            lingua=((x,y),(x+e*10,y-2),(x+e*17,y+3),(x+e*11,y+4),
                     (x+e*9,y+8),(x+e*7,y+5),(x+e*3,y+9),(x,y+5))
            colar(im,c['pedra'][2],ImageChops.multiply(mascara_pontos(lingua),zona))
    elif mundo=='enseada':
        # Queda pequena de água entre duas beiradas altas de calcário.
        queda=(
          (((219,137),(260,137),(265,143),(261,153),(220,153),(214,146)),c['sombra']),
          (((223,136),(255,136),(260,142),(257,149),(224,149),(219,145)),c['agua'][3]),
          (((232,143),(246,143),(246,161),(250,168),(249,184),(244,188),(231,187),(228,177),(232,166)),c['agua'][2]),
          (((235,146),(240,146),(240,174),(243,183),(235,182)),c['agua'][4]),
          (((218,182),(231,177),(249,179),(260,185),(258,193),(239,197),(219,193)),c['agua'][3]),
          (((225,184),(238,181),(250,183),(248,191),(233,192)),c['agua'][4]),
        )
        for p,cor in queda:
            colar(im,cor,ImageChops.multiply(mascara_pontos(p),zona))
    elif mundo=='deriva':
        # Duas enseadas em lados opostos da ampulheta, com água em movimento.
        for x,y,esp in ((82,186,1),(396,197,-1)):
            banco=((-19,1),(-14,-9),(-2,-12),(9,-9),(20,-4),(22,4),(9,8),(-5,8),(-12,10))
            p0=tuple((x+esp*dx,y+dy) for dx,dy in banco)
            colar(im,c['agua'][0],ImageChops.multiply(mascara_pontos(placa(p0,0,4)),livre))
            colar(im,c['agua'][2],ImageChops.multiply(mascara_pontos(p0),livre))
            ponta=((-13,-3),(-3,-8),(10,-6),(15,-2),(10,2),(3,1),(-1,4),(-9,2))
            p=tuple((x+esp*dx,y+dy) for dx,dy in ponta)
            colar(im,c['agua'][3],ImageChops.multiply(mascara_pontos(p),livre))
    elif mundo=='grutas':
        # Geodo irregular: paredes internas iluminadas deixam um núcleo escuro.
        # O botão de bônus fica fora da cavidade, acima dela.
        for x,y in ((202,190),(276,190)):
            pedras=(
             (((-21,-1),(-15,-12),(-1,-15),(11,-12),(22,-7),(23,6),(14,13),(-8,12),(-19,9)),c['sombra']),
             (((-18,0),(-13,-10),(1,-12),(15,-8),(20,-4),(18,7),(7,11),(-11,8)),c['pedra'][2]),
             (((-13,1),(-9,-6),(0,-8),(12,-6),(15,-2),(11,6),(-4,7),(-10,5)),c['pedra'][0]),
             (((-9,-7),(-5,-13),(1,-11),(4,-5),(-1,-2),(-6,-3)),c['alto']),
             (((7,-5),(12,-10),(16,-7),(16,-3),(9,0)),c['clara']),
            )
            for p,cor in pedras:
                colar(im,cor,ImageChops.multiply(mascara_pontos(placa(p,x,y)),zona))


def rochedos(im,mask,livre,mundo,c):
    locais={
        'praia':((96,116),(384,118),(157,273),(321,272)),
        'recifes':((99,132),(379,132),(109,256),(369,256)),
        'mangue':((102,267),(376,267),(107,143),(371,143)),
        'enseada':((144,185),(334,185),(135,276),(343,276)),
        'deriva':((111,268),(367,268),(94,142),(384,142)),
        'grutas':((152,267),(326,267),(133,156),(345,156)),
        'ressaca':((110,237),(368,237),(142,133),(338,133)),
        'farol':((162,132),(315,132),(199,183),(279,183),(203,265),(275,265)),
    }[mundo]
    usados=Image.new('L',(W,H))
    for i,(base_x,base_y) in enumerate(locais):
        tamanho=(1.11,.84,.92,1.0,1.04,.88)[i]
        for dx,dy,esc in ((0,0,1),(-7,2,.86),(7,2,.86),(0,9,.78),
                          (-13,10,.72),(12,12,.73),(0,-12,.68),(0,18,.66)):
            escala=tamanho*esc
            x,y=base_x+dx,base_y+dy
            tall=mundo in ('farol','grutas')
            brilho,cima,parede,escuro=c['pedra'][-1],c['pedra'][-2],c['pedra'][2],c['pedra'][0]
            # Cada rocha tem todos os seus pixels no lugar antes de entrar no tabuleiro.
            planos=(
                (((-24,7),(-18,1),(-5,-1),(8,1),(18,4),(24,8),(22,13),(5,16),(-9,15),(-21,12)),c['sombra']),
                (((-19,6),(-16,-3),(-8,-9),(0,-12),(12,-9),(17,-3),(19,4),(16,10),(4,13),(-12,10)),escuro),
                (((-18,4),(-14,-4),(-8,-9),(0,-12),(11,-8),(13,-4),(6,2),(-2,5),(-11,6)),cima),
                (((-14,-4),(-8,-9),(0,-12),(9,-9),(6,-5),(1,-3),(-8,-3),(-12,1)),brilho),
                (((-14,7),(-9,4),(-2,5),(5,2),(13,-4),(17,0),(16,6),(9,10),(0,11),(-7,9)),parede),
                (((2,7),(7,6),(11,2),(16,0),(17,4),(13,7),(8,9),(4,10)),c['pedra'][3]),
            )
            if tall:
                planos+=(
                  (((-10,1),(-7,-15),(-1,-27),(8,-22),(12,-11),(8,0),(2,5)),escuro),
                  (((-8,-1),(-6,-14),(-1,-26),(3,-17),(1,-5)),c['alto']),
                  (((1,-5),(3,-17),(7,-22),(11,-12),(8,-2),(2,4)),c['plataforma']),
                  (((4,-17),(6,-19),(8,-17),(9,-12),(7,-12)),c['seco']),
                )
            camadas=[]
            junta=Image.new('L',(W,H))
            for p,cor in planos:
                m=mascara_pontos(tuple((round(x+u*escala),round(y+v*escala)) for u,v in p))
                camadas.append((m,cor))
                junta=ImageChops.lighter(junta,m)
            if ImageChops.subtract(junta,mask).getbbox() or ImageChops.subtract(junta,livre).getbbox():
                continue
            if ImageChops.multiply(junta,usados).getbbox():
                continue
            for m,cor in camadas:
                colar(im,cor,m)
            usados=ImageChops.lighter(usados,junta.filter(ImageFilter.MaxFilter(7)))
            break


def quadro(mundo):
    cor=PALETAS[mundo]
    rng=Random({'praia':75,'ressaca':66,'farol':43}.get(mundo,13+ORDEM.index(mundo)*9))
    im=Image.new('RGB',(W,H),cor['mar'])
    m=shape(mundo)
    reserva=anteparo(mundo)
    livre=ImageChops.invert(reserva)
    costa_agua(im,m,cor,rng)
    face=falasia(im,m,cor,rng)
    detalhes.costa(im,face,m,livre,cor)
    refino.costa(im,m,face,livre,cor)
    decorar_plato(im,m,livre,mundo,cor,rng)
    rochedos(im,m,livre,mundo,cor)
    detalhes.objetos(im,mundo,m,livre,cor)
    refino.marcos(im,mundo,m,livre,cor)
    moldura(im,mundo,TITULOS[mundo])
    limpo=im.copy()
    w=LAYOUT[mundo]
    for i,(x,y) in enumerate(w['regular'],1):
        botao(im,x,y,'regular','concluida' if i<=2 else 'livre' if i<=4 else 'travada',i)
    for i,(x,y) in enumerate(w['bonus']):
        botao(im,x,y,'extra','livre' if i==0 else 'travada')
    for i,(x,y) in enumerate(w['chefes']):
        botao(im,x,y,'chefes','livre' if i==0 else 'travada')
    diferenca=ImageChops.difference(limpo,im).convert('L').point(lambda p:255 if p else 0)
    assert not ImageChops.subtract(diferenca,reserva).getbbox(), mundo
    limpo.save(D/f'{mundo}-fundo.png')
    im.save(D/f'{mundo}-1x.png')
    im.resize((W*2,H*2),Image.Resampling.NEAREST).save(D/f'{mundo}-2x.png')
    return im


if __name__=='__main__':
    import json
    for pagina,nomes in enumerate((ORDEM[:4],ORDEM[4:]),1):
        painel=Image.new('RGB',(2*W+30,2*H+30),'#102936')
        for i,nome in enumerate(nomes):
            painel.paste(quadro(nome),(10+(i%2)*(W+10),10+(i//2)*(H+10)))
        painel.save(D/f'seletores-v6-{pagina}.png')
    (D/'layout.json').write_text(json.dumps({'grade':[W,H],'estados_exemplo':True,
        'mundos':{k:{grupo:[[round(x*1.5),round(y*1.5)] for x,y in v]
                     for grupo,v in LAYOUT[k].items()}
                  for k in ORDEM}},ensure_ascii=False,indent=2)+chr(10))
