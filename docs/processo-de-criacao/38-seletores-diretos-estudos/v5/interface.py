"""Seletores diretos V3. Grade RGB nativa 480×360. Python 3 e Pillow."""
import json
from pathlib import Path
from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont

ROOT=Path(__file__).resolve().parent
W,H=480,360
N=1.5
CENTRO=239
MARCA='#192e38'
CREME='#fff2d1'
LAYOUT=json.loads((ROOT/'layout-v2.json').read_text())['mundos']

# Fundo profundo, três massas de água, espuma, parede profunda, face, platô, luz,
# textura e detalhe. São paletas distintas, com luz do mesmo lado.
MUNDOS={
 'praia':('Praia das Conchas','Areal em anel','#133e50','#235568','#367785','#629c9b','#b9dcc5','#805642','#ac8054','#efd19a','#ffe6ad','#d1a972','#689b91'),
 'recifes':('Recifes Expostos','Costão serrilhado','#102f46','#19495f','#2d6c82','#558f95','#aacdba','#44535a','#667879','#c6b494','#dfcba6','#a3947c','#647e83'),
 'mangue':('Mangue dos Siris Duplos','Canais gêmeos','#204341','#2c584f','#467467','#789882','#b6c6a0','#574d40','#75674a','#c6b487','#dcc99b','#a08a61','#627e6a'),
 'enseada':('Enseada da Garça','Degraus da falésia','#1c435e','#2e6580','#487c91','#77aab2','#cfdbcf','#515568','#747687','#d6c8aa','#e7dabb','#a8a295','#677d91'),
 'deriva':('Ilhas à Deriva','Ampulheta das correntes','#17434e','#286772','#438b81','#7eb29b','#c3dcbc','#776053','#a98865','#e5cba0','#fae0af','#c09d71','#6ca49a'),
 'grutas':('Grutas da Espuma','Geodo aberto','#262b47','#393a57','#5d5874','#878099','#cfc3d4','#51435d','#756280','#c7adb5','#e5c7cc','#a28a9f','#886e9b'),
 'ressaca':('Baía da Ressaca','Ferradura da baía','#253a4d','#355673','#527791','#87a7ad','#cedfd3','#6f5350','#926c59','#d7b497','#eccab0','#ab8b70','#748d9e'),
 'farol':('Arquipélago do Farol','Estrela de cristal','#242c50','#384568','#4c627f','#7889a6','#c1cddd','#554962','#7d687e','#d6bb9f','#eacfaa','#aa929f','#a597be'),
}
# Cada costa foi redesenhada em recortes ortogonais dados no plano do tabuleiro.
# São só as metades esquerdas, do topo ao pé: o desenho reflete com precisão.
COSTAS={
 'praia':((159,53),(121,53),(121,58),(95,58),(95,66),(70,66),(70,79),(53,79),(53,98),
          (42,98),(42,158),(50,158),(50,173),(64,173),(64,184),(86,184),(86,191),(113,191),(113,196),(159,196)),
 'recifes':((159,66),(139,66),(139,54),(117,54),(117,63),(99,63),(99,73),(82,73),(82,65),(67,65),
           (67,78),(53,78),(53,94),(41,94),(41,109),(34,109),(34,146),(46,146),(46,170),(56,170),
           (56,193),(77,193),(77,186),(94,186),(94,198),(116,198),(116,188),(134,188),(134,195),(159,195)),
 'mangue':((159,77),(143,77),(143,64),(114,64),(114,57),(72,57),(72,65),(49,65),(49,91),(55,91),(55,106),
          (66,106),(66,136),(54,136),(54,153),(42,153),(42,174),(51,174),(51,185),(72,185),(72,195),
          (110,195),(110,185),(136,185),(136,198),(159,198)),
 'enseada':((159,45),(138,45),(138,58),(122,58),(122,72),(109,72),(109,82),(90,82),(90,96),(69,96),
            (69,109),(52,109),(52,125),(41,125),(41,144),(31,144),(31,164),(49,164),(49,179),
            (71,179),(71,187),(101,187),(101,194),(119,194),(119,205),(159,205)),
 'deriva':((159,66),(137,66),(137,61),(108,61),(108,53),(56,53),(56,61),(43,61),(43,88),
           (55,88),(55,101),(70,101),(70,111),(84,111),(84,123),(94,123),(94,130),(77,130),
           (77,140),(60,140),(60,151),(49,151),(49,169),(39,169),(39,186),(48,186),(48,197),(118,197),
           (118,202),(159,202)),
 'grutas':((159,55),(144,55),(144,48),(115,48),(115,56),(96,56),(96,64),(77,64),(77,79),(57,79),
           (57,94),(48,94),(48,111),(37,111),(37,145),(51,145),(51,155),(65,155),(65,176),(81,176),
           (81,185),(103,185),(103,195),(126,195),(126,201),(159,201)),
 'ressaca':((159,114),(143,114),(143,96),(132,96),(132,76),(113,76),(113,64),(96,64),(96,53),(62,53),
            (62,61),(45,61),(45,80),(35,80),(35,108),(27,108),(27,146),(38,146),(38,169),(51,169),
            (51,184),(73,184),(73,193),(106,193),(106,201),(132,201),(132,205),(159,205)),
 'farol':((159,40),(144,40),(144,51),(135,51),(135,61),(114,61),(114,76),(97,76),(97,89),
          (73,89),(73,100),(53,100),(53,109),(38,109),(38,137),(52,137),(52,152),(64,152),
          (64,166),(78,166),(78,177),(99,177),(99,170),(116,170),(116,187),(132,187),(132,195),
          (144,195),(144,207),(159,207)),
}


def px(x):
    return round(N*x)


def pts(pontos):
    return [(px(x),px(y)) for x,y in pontos]


def linha(d,pontos,cor,espessura=1):
    d.line(pts(pontos),fill=cor,width=espessura)


def poligono(d,pontos,cor,contorno=None):
    d.polygon(pts(pontos),fill=cor,outline=contorno)


def forma(nome):
    pontos=pts(COSTAS[nome])
    pontos[0]=(CENTRO,pontos[0][1])
    pontos[-1]=(CENTRO,pontos[-1][1])
    mask=Image.new('L',(W,H))
    ImageDraw.Draw(mask).polygon(pontos+[(2*CENTRO-x,y) for x,y in reversed(pontos)],fill=255)
    return mask


def descer(m,dy):
    r=Image.new('L',m.size)
    r.paste(m,(0,dy))
    return r


def tom_intermediario(a,b,peso):
    canais=lambda hex:tuple(bytes.fromhex(hex[1:]))
    rgb=(round(x+(y-x)*peso) for x,y in zip(canais(a),canais(b)))
    return '#'+''.join(f'{v:02x}' for v in rgb)


def camada(im,mascara,cor):
    im.paste(cor,(0,0,W,H),mascara)


def terreno(im,mundo,t):
    _,_,mar,longe,medio,rasa,espuma,fenda,parede,areia,luz,marca,det=t
    d=ImageDraw.Draw(im)
    mask=forma(mundo)
    # Água exterior mais espaçada; os bancos têm dois degraus e espuma fina.
    for y in range(57,329,8):
        for k in range(8,237,28):
            x=k+(y*3+k)%14
            if x<226 and (x+y)%7<4:
                d.line((x,y,x+6+(x%7),y),fill=longe)
                d.line((2*CENTRO-x-6-x%7,y,2*CENTRO-x,y),fill=longe)
    # A passagem de profundidade usa degraus inteiros de tom, não blur.
    for raio,cor in ((28,longe),(24,tom_intermediario(longe,medio,.38)),(19,medio),
                     (14,tom_intermediario(medio,rasa,.48)),(9,rasa)):
        camada(im,descer(mask.filter(ImageFilter.MaxFilter(2*raio+1)),6),cor)
    anel=ImageChops.subtract(descer(mask.filter(ImageFilter.MaxFilter(11)),9),
                           descer(mask.filter(ImageFilter.MaxFilter(5)),8))
    camada(im,anel,espuma)
    for dy,cor in ((14,fenda),(11,tom_intermediario(fenda,parede,.56)),
                   (8,parede),(5,tom_intermediario(parede,marca,.58)),(2,marca),(0,areia)):
        camada(im,descer(mask,dy),cor)
    d=ImageDraw.Draw(im)
    # Luz NW no bordo alto, linhas de erosão curtas no plano da ilha.
    for y in range(60,317):
        for x in range(33,448):
            if mask.getpixel((x,y)) and not mask.getpixel((x,y-1)):
                d.point((x,y),fill=luz if x<CENTRO+70 else marca)
    for y in range(63,312,7):
        for x in range(37+y%19,448,21):
            n=3+(y+x)%5
            if (x+y)%7<4 and all(mask.getpixel((x+k,y)) for k in (0,n-1)):
                d.line((x,y,x+n-1,y),fill=marca)
    # Estratos só no penhasco visível. Nada é suavizado entre camadas.
    face=ImageChops.subtract(descer(mask,13),mask)
    placas=Image.new('L',(W,H))
    dp=ImageDraw.Draw(placas)
    for y in range(63,327,6):
        for x in range(32+(y*3)%17,450,19):
            if (x+y)%7<4:
                dp.polygon(((x,y),(x+9+(x%6),y),(x+8+(x%6),y+2),(x-1,y+2)),fill=255)
    camada(im,ImageChops.multiply(face,placas),tom_intermediario(fenda,parede,.34))
    return mask


def agua_interna(d,polig,t):
    _,_,_,_,m,_,espuma,_,f,_,l,_,det=t
    poligono(d,[(x,y+2) for x,y in polig],f)
    poligono(d,polig,det,l)
    for y in range(min(y for _,y in polig)+5,max(y for _,y in polig)-3,7):
        meio=sum(x for x,_ in polig)//len(polig)
        linha(d,((meio-5,y),(meio+4,y)),m)


def rocha(d,x,y,escala,t,cristal=False,espelho=1):
    _,_,_,_,_,_,_,fenda,sombra,luz,alto,_,det=t
    def p(seq):
        return [(x+u*espelho*escala,y+v*escala) for u,v in seq]
    poligono(d,p(((-9,1),(2,-2),(12,1),(13,4),(3,7),(-7,5))),sombra)
    if cristal:
        poligono(d,p(((-7,1),(-3,-9),(3,-13),(8,-6),(7,2),(1,5))),det,fenda)
        poligono(d,p(((-7,1),(-3,-9),(3,-13),(1,1))),alto)
        poligono(d,p(((3,-12),(7,-6),(6,1),(4,2),(5,-6))),tom_intermediario(det,luz,.62))
        linha(d,p(((3,-11),(5,-7))),luz)
    else:
        poligono(d,p(((-8,0),(-5,-7),(2,-8),(8,-5),(11,0),(6,4),(-3,4))),sombra,fenda)
        poligono(d,p(((-8,0),(-5,-7),(2,-8),(7,-5),(1,-2))),luz)
        linha(d,p(((-5,-6),(2,-7),(5,-5))),alto)
        poligono(d,p(((1,-2),(7,-5),(10,-1),(7,1),(2,2))),tom_intermediario(luz,sombra,.66))
        poligono(d,p(((3,2),(8,1),(9,0),(8,2),(6,3))),tom_intermediario(fenda,sombra,.43))


def resolver_detalhes(im,nome,t):
    d=ImageDraw.Draw(im)
    if nome=='praia':
        agua_interna(d,[(148,103),(171,103),(171,108),(180,108),(180,131),(172,131),
                         (172,137),(147,137),(147,132),(139,132),(139,109),(148,109)],t)
        for x in (63,255):
            agua_interna(d,[(x-8,79),(x+7,79),(x+10,85),(x+4,91),(x-9,91)],t)
            rocha(d,x+3,170,.67,t,False,1 if x<159 else -1)
        for x in (85,233):
            poligono(d,((x-4,164),(x-2,160),(x+2,160),(x+5,164),(x+3,168),(x-3,169)),'#a96d64')
            linha(d,((x-2,163),(x+1,162),(x+3,164)),'#ffdec0')
    elif nome=='recifes':
        for x in (58,260,106,212):
            y=128 if x in (58,260) else 65
            rocha(d,x,y,.8,t,False,1 if x<159 else -1)
        # Bancos minerais mais baixos: manchas, não linhas no meio do caminho.
        for x,esp in ((110,1),(208,-1)):
            baixos=((-21,2),(-16,-3),(-5,-3),(-2,-6),(8,-6),(13,-4),(21,0),(18,4),(2,4),(-1,7),(-14,7))
            poligono(d,[(x+u*esp,124+v) for u,v in baixos],tom_intermediario(t[9],t[11],.55))
    elif nome=='mangue':
        agua_interna(d,[(147,79),(171,79),(171,103),(178,103),(178,145),(173,145),
                         (173,170),(146,170),(146,146),(140,146),(140,103),(147,103)],t)
        for x in (66,252,78,240):
            y=113 if x in (66,252) else 145
            rocha(d,x,y,.62,t,False,1 if x<159 else -1)
            linha(d,((x-4,y+4),(x+2,y+4),(x+6,y+2)),t[-1])
    elif nome=='enseada':
        for x,esp in ((119,1),(199,-1)):
            for y,escala in ((119,1.0),(140,.82),(174,.72)):
                banco=((-19,3),(-13,-4),(-6,-4),(-3,-7),(8,-7),(16,-3),(20,0),(15,5),(-6,5),(-10,8))
                poligono(d,[(x+esp*u*escala,y+v*escala) for u,v in banco],
                         tom_intermediario(t[9],t[11],.57))
                poligono(d,[(x+esp*u*escala,y+v*escala) for u,v in
                             ((-16,0),(-13,-4),(-6,-4),(-3,-7),(8,-7),(14,-4),(4,-2),(-8,-2))],
                         tom_intermediario(t[9],t[10],.56))
        for x in (77,241):
            rocha(d,x,174,.67,t,False,1 if x<159 else -1)
    elif nome=='deriva':
        for x in (83,235):
            s=1 if x<159 else -1
            agua_interna(d,[(x+s*u,v) for u,v in ((-8,108),(10,108),(14,114),(13,122),
                           (5,128),(-9,128),(-9,116))],t)
            linha(d,((x-8,113),(x+6,113)),t[6])
        for x in (63,255):
            rocha(d,x,180,.68,t,False,1 if x<159 else -1)
        linha(d,((121,126),(134,122),(148,122),(156,119),(164,119),(174,122),(188,122),(198,126)),t[-2],2)
    elif nome=='grutas':
        agua_interna(d,((142,91),(176,91),(176,98),(190,98),(190,131),(182,131),
                        (182,142),(139,142),(139,131),(128,131),(128,99),(142,99)),t)
        for x in (101,217,70,248):
            rocha(d,x,111 if x in (101,217) else 147,.73,t,True,1 if x<159 else -1)
    elif nome=='ressaca':
        agua_interna(d,((148,122),(171,122),(171,135),(183,135),(183,152),(173,152),
                        (173,163),(145,163),(145,151),(136,151),(136,135),(148,135)),t)
        for x in (105,213,78,240):
            rocha(d,x,146 if x in (105,213) else 64,.73,t,False,1 if x<159 else -1)
    elif nome=='farol':
        estrela=((159,54),(177,96),(232,101),(189,129),(202,174),(159,148),
                 (116,174),(129,129),(86,101),(141,96))
        poligono(d,estrela,'#c3ad9f',t[10])
        poligono(d,((159,58),(159,118),(231,102),(176,97)),'#d3baab')
        poligono(d,((159,118),(187,130),(202,174),(159,148)),'#b69fa0')
        linha(d,((159,61),(159,118),(198,169)),t[11])
        linha(d,((89,102),(159,118),(229,102)),t[10])
        for x in (76,242,116,202):
            rocha(d,x,142 if x in (76,242) else 66,.83,t,True,1 if x<159 else -1)


# Dois volumes maiores por ilha, desenhados nas frentes costeiras livres.
# A profundidade de 8 a 12 px lógicos é comum, não a silhueta de cada rocha.
FORMACOES={
 'praia':((82,185),(236,185)), 'recifes':((77,74),(241,74)),
 'mangue':((75,181),(243,181)), 'enseada':((124,131),(194,131)),
 'deriva':((62,184),(256,184)), 'grutas':((88,177),(230,177)),
 'ressaca':((63,174),(255,174)), 'farol':((123,137),(195,137)),
}


def formar_relevo(im,nome,t,mask):
    fenda,parede,areia,luz=t[7:11]
    largura,altura = {
        'praia':(1.08,.72), 'recifes':(1.03,1.16), 'mangue':(.92,.77),
        'enseada':(1.11,1.05), 'deriva':(1.0,.75), 'grutas':(.92,1.16),
        'ressaca':(1.14,.78), 'farol':(.9,1.16),
    }[nome]
    alcance=Image.new('L',(W,H))
    marcas=ImageDraw.Draw(alcance)
    for lista in LAYOUT[nome].values():
        for x,y in pts(lista):
            marcas.rectangle((x-19,y-17,x+20,y+19),fill=255)
    for i,(base_x,base_y) in enumerate(FORMACOES[nome]):
        esp=1 if i==0 else -1
        alta=2 if nome in ('recifes','farol','grutas') else 0
        for dx,dy,escala in ((0,0,1),(0,5,1),(-4,5,.96),(-7,6,.91),
                            (4,-2,.91),(-10,2,.81),(0,8,.82),(-4,5,.70),
                            (3,13,.68),(-5,15,.66),(-9,0,.66),(7,9,.69),(-12,9,.62)):
            cx,cy=base_x+dx*esp,base_y+dy
            rochedos=Image.new('RGBA',(W,H))
            d=ImageDraw.Draw(rochedos)
            def q(forma):
                return [(cx+u*esp*largura*escala,cy+v*altura*escala) for u,v in forma]
            # Mancha de contato: a luz cai de cima à esquerda; não é um traço solto.
            poligono(d,q(((-15,1),(-9,-5),(4,-6),(19,-2),(24,4),(19,8),(-2,10),(-14,7))),
                     tom_intermediario(areia,parede,.44))
            poligono(d,q(((-14,0),(-9,-9-alta),(-3,-14-alta),(6,-14-alta),(13,-8),(18,-3),
                          (16,4),(7,7),(-7,7))),fenda)
            poligono(d,q(((-13,-1),(-9,-8-alta),(-3,-13-alta),(6,-13-alta),(13,-8),(13,-5),
                          (5,-3),(-4,-3),(-7,0))),tom_intermediario(areia,luz,.73))
            poligono(d,q(((-7,0),(-4,-3),(5,-3),(13,-5),(17,-2),(15,3),(7,6),(-6,5))),
                     parede)
            poligono(d,q(((-5,0),(4,-2),(11,-4),(14,-2),(9,1),(1,3),(-5,3))),
                     tom_intermediario(parede,areia,.40))
            poligono(d,q(((2,3),(9,1),(14,-1),(13,3),(8,4),(0,5))),
                     tom_intermediario(parede,fenda,.48))
            if nome=='recifes':
                poligono(d,q(((-8,-5),(-5,-10),(-3,-7),(-1,-8),(1,-5),(-3,-4))),'#a96c65')
                poligono(d,q(((-3,-7),(-2,-10),(0,-9),(1,-7))), '#df9c85')
            elif nome=='mangue':
                poligono(d,q(((-8,-6),(0,-10),(7,-8),(7,-5),(2,-4),(-5,-4))), '#628274')
                poligono(d,q(((-4,-7),(0,-9),(3,-8),(1,-7))), '#98ae8c')
            elif nome=='deriva':
                poligono(d,q(((-11,-6),(-11,-15),(-6,-19),(0,-17),(1,-8),(-3,-4))),fenda)
                poligono(d,q(((-10,-15),(-6,-18),(-1,-16),(-2,-13),(-8,-12))),luz)
                poligono(d,q(((-8,-11),(-2,-13),(-2,-7),(-5,-5),(-8,-6))),parede)
            elif nome=='grutas':
                poligono(d,q(((-5,-6),(-6,-16),(0,-22),(5,-20),(11,-9),(4,-5))), '#917aa6',fenda)
                poligono(d,q(((-5,-14),(0,-21),(2,-17),(0,-8),(-5,-7))), '#cab5d7')
                poligono(d,q(((0,-8),(3,-17),(8,-13),(10,-9),(5,-6))), '#a98eb9')
            elif nome=='ressaca':
                poligono(d,q(((-12,-1),(-9,-7),(-2,-12),(5,-12),(11,-7),(8,-4),(0,-3))),
                         tom_intermediario(fenda,parede,.78))
                poligono(d,q(((-6,-6),(-2,-10),(5,-10),(8,-7),(1,-5))),tom_intermediario(parede,luz,.31))
            elif nome=='farol':
                poligono(d,q(((-6,-6),(-5,-14),(1,-21),(8,-17),(11,-9),(6,-6),(0,-4))), '#a297bd',fenda)
                poligono(d,q(((-4,-13),(1,-20),(5,-17),(2,-9),(-4,-7))), '#dfcde5')
                poligono(d,q(((2,-9),(6,-16),(9,-13),(10,-9),(5,-6))), '#cbb6cb')
            pixels=ImageChops.multiply(rochedos.getchannel('A'),mask)
            if not ImageChops.multiply(pixels,alcance).getbbox():
                im.paste(rochedos,(0,0),pixels)
                break
        else:
            raise RuntimeError(f'Não há margem segura para o relevo de {nome}.')


def texto(im,s,x,y,tamanho,cor,centro=False):
    f=ImageFont.truetype('DejaVuSans-Bold.ttf',tamanho)
    a,b,c,e=f.getbbox(s)
    m=Image.new('L',(c-a,e-b))
    ImageDraw.Draw(m).text((-a,-b),s,font=f,fill=255)
    m=m.point(lambda p:255 if p>=128 else 0)
    if centro:
        x-=m.width//2
    im.paste(cor,(x,y,x+m.width,y+m.height),m)


def moldura(im,mundo,t):
    d=ImageDraw.Draw(im)
    d.rectangle((0,0,W-1,46),fill='#122c39')
    d.rectangle((0,329,W-1,359),fill='#122c39')
    d.line((0,46,W-1,46),fill='#83a5a3')
    d.line((0,329,W-1,329),fill='#83a5a3')
    d.rectangle((13,10,47,35),fill='#315965')
    texto(im,f'{list(MUNDOS).index(mundo)+1:02d}',30,16,13,CREME,True)
    texto(im,t[0].upper(),57,10,17,CREME)
    texto(im,t[1].upper(),58,30,10,'#a8c9c1')
    for rotulo,x,cor in (
        ('FASE',31,'#f4d9b0'),('BÔNUS',114,'#b382ba'),('CHEFE',201,'#da8b76'),
        ('TRAVADA',285,'#bdb09b'),('CONCLUÍDA',370,'#7cad94'),
    ):
        d.rectangle((x-13,342,x-7,348),fill=cor)
        texto(im,rotulo,x,340,11,CREME)


def botao(im,x,y,categoria,estado,numero=None):
    x,y=px(x),px(y)
    d=ImageDraw.Draw(im)
    categoria_cor={'regular':'#8b704a','extra':'#7f5380','chefes':'#a05a5e'}[categoria]
    cor={'travada':'#4d5157','concluida':'#3f7164'}.get(estado,categoria_cor)
    base=((-16,-8),(-11,-14),(11,-14),(16,-8),(16,8),(11,14),(-11,14),(-16,8))
    dentro=((-13,-7),(-10,-11),(10,-11),(13,-7),(13,5),(9,10),(-9,10),(-13,5))
    d.polygon([(x+u,y+v+3) for u,v in base],fill='#665046')
    d.polygon([(x+u,y+v) for u,v in base],fill=MARCA)
    d.polygon([(x+u,y+v) for u,v in dentro],fill=cor)
    d.line((x-9,y-11,x+9,y-11),fill='#c3a47a' if estado=='travada' else '#ecd398')
    d.line((x-8,y+10,x+8,y+10),fill='#716c5d')
    if numero is not None:
        texto(im,str(numero),x,y-7,15,CREME,True)
    if categoria=='extra':
        d.polygon(((x,y-7),(x+7,y),(x,y+7),(x-7,y)),fill=CREME)
        d.point((x,y),fill='#976e9b')
    if categoria=='chefes':
        d.polygon(((x-8,y-5),(x-4,y-1),(x,y-7),(x+4,y-1),(x+8,y-5),
                   (x+6,y+6),(x-6,y+6)),fill=CREME)
        d.line((x-5,y+4,x+5,y+4),fill='#b57867')
    if estado in ('travada','concluida'):
        d.rectangle((x+9,y+6,x+19,y+17),fill=MARCA)
        if estado=='travada':
            d.rectangle((x+12,y+7,x+16,y+12),outline='#f1e0b4')
            d.rectangle((x+11,y+11,x+17,y+15),fill='#d7b783')
            d.point((x+14,y+13),fill=MARCA)
        else:
            d.rectangle((x+10,y+7,x+18,y+16),fill='#527e65')
            d.line(((x+11,y+11),(x+13,y+13),(x+16,y+9)),fill=CREME,width=2)


def quadro(mundo):
    t=MUNDOS[mundo]
    im=Image.new('RGB',(W,H),t[2])
    mask=terreno(im,mundo,t)
    resolver_detalhes(im,mundo,t)
    formar_relevo(im,mundo,t,mask)
    moldura(im,mundo,t)
    im.save(ROOT/f'{mundo}-fundo.png')
    w=LAYOUT[mundo]
    for i,(x,y) in enumerate(w['regular'],1):
        botao(im,x,y,'regular','concluida' if i<=2 else 'livre' if i<=4 else 'travada',i)
    for i,(x,y) in enumerate(w['bonus']):
        botao(im,x,y,'extra','livre' if i==0 else 'travada')
    for i,(x,y) in enumerate(w['chefes']):
        botao(im,x,y,'chefes','livre' if i==0 else 'travada')
    im.save(ROOT/f'{mundo}-1x.png')
    im.resize((W*2,H*2),Image.Resampling.NEAREST).save(ROOT/f'{mundo}-2x.png')
    return im


def main():
    quadros={nome:quadro(nome) for nome in MUNDOS}
    for pagina,nomes in enumerate((list(MUNDOS)[:4],list(MUNDOS)[4:]),1):
        margem=10
        painel=Image.new('RGB',(2*W+3*margem,2*H+3*margem),'#0c2330')
        for i,nome in enumerate(nomes):
            painel.paste(quadros[nome],(margem+(i%2)*(W+margem),margem+(i//2)*(H+margem)))
        painel.save(ROOT/f'seletores-v3-{pagina}.png')
    layout={w:{k:pts(v) for k,v in m.items()} for w,m in LAYOUT.items()}
    (ROOT/'layout.json').write_text(json.dumps({'grade':[W,H],'estados_exemplo':True,'mundos':layout},
                                               ensure_ascii=False,indent=2)+chr(10))


if __name__=='__main__':
    main()
