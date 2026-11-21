"""Uniões de água e rocha, facetas e sombras por máscaras binárias."""
from PIL import Image, ImageChops, ImageDraw, ImageFilter
from detalhes import W,H,colocar,tom


def mover(mask,x,y):
    nova=Image.new('L',(W,H))
    nova.paste(mask,(x,y))
    return nova


def pintar(im,cor,mask):
    im.paste(cor,(0,0,W,H),mask)


def maior(mask,raio):
    return mask.filter(ImageFilter.MaxFilter(raio*2+1))


def orla_conectada(im,solo,pal):
    agua=pal['agua']
    corpo=ImageChops.lighter(mover(solo,4,25),ImageChops.lighter(mover(solo,2,14),solo))
    # Os rasos e a espuma partilham o mesmo pé da falésia; nenhum retalho flutua.
    for raio,cor in ((13,agua[0]),(9,agua[1]),(6,agua[2]),(3,agua[3])):
        pintar(im,cor,maior(corpo,raio))
    borda=ImageChops.subtract(maior(corpo,2),corpo)
    cristas=Image.new('L',(W,H)); d=ImageDraw.Draw(cristas)
    for x,y,larg,alt in ((55,160,39,103),(83,246,47,53),(128,287,74,48),
                        (210,275,55,63),(284,291,68,43),(358,248,55,49),
                        (390,179,48,70),(89,105,82,36),(323,100,68,47)):
        d.polygon(((x,y+7),(x+larg//2,y),(x+larg,y+8),(x+larg-4,y+alt),
                   (x+7,y+alt-3)),fill=255)
    pintar(im,tom(agua[3],agua[4],.83),ImageChops.multiply(borda,cristas))


def costa(im,solo,face,livre,pal):
    pedra=pal['pedra']
    frente=ImageChops.multiply(face,livre)
    # As junções acompanham a direção de cada face: sombra na virada inferior
    # direita, planos iluminados no ombro esquerdo da encosta.
    virada=ImageChops.subtract(face,mover(face,-3,-4))
    pintar(im,tom(pedra[0],pedra[1],.40),ImageChops.multiply(virada,frente))
    ombro=ImageChops.multiply(ImageChops.subtract(mover(solo,2,5),solo),frente)
    pintar(im,tom(pedra[3],pedra[5],.35),ombro)
    borda=ImageChops.multiply(ImageChops.subtract(solo,mover(solo,-2,-3)),livre)
    pintar(im,tom(pal['areia'],pal['sombra'],.47),borda)


def marcos(im,nome,solo,livre,pal):
    zona=ImageChops.multiply(solo,livre)
    p=pal['pedra']; a=pal['agua']
    # Facetas e contato seguem a geometria dos marcos já existentes. Não
    # acrescentam objetos, nem avançam sobre os controles.
    areas={
       'praia': [(tom(p[3],p[1],.52),((221,106),(238,110),(256,105),(252,109),(241,113),(229,112)))],
       'recifes': [('#916878',((159,187),(174,182),(184,183),(195,180),(191,186),(178,189),(168,190))),
                   ('#9d6f7a',((281,187),(295,182),(307,182),(310,185),(299,188),(289,190)))],
       'mangue': [(tom(p[1],p[3],.28),((219,188),(230,184),(236,181),(234,185),(225,190),(218,191))),
                   (tom(p[1],p[3],.28),((249,223),(258,216),(267,212),(265,217),(256,222),(248,225)))],
       'enseada': [(a[2],((227,190),(236,189),(245,189),(251,188),(247,192),(237,195),(231,194))),
                   (a[4],((233,180),(237,179),(241,181),(245,183),(242,184),(235,183)))],
       'deriva': [(p[2],((88,269),(94,271),(101,271),(106,269),(104,274),(94,276),(88,274))),
                  (p[3],((375,145),(382,146),(388,144),(386,148),(378,149)))],
       'grutas': [(p[0],((194,196),(205,194),(214,194),(210,198),(202,202),(195,201))),
                  ('#73658f',((277,180),(282,184),(283,189),(279,194),(276,194),(279,188)))],
       'ressaca': [('#69434a',((221,179),(230,175),(246,172),(254,172),(247,176),(232,178),(224,183))),
                   ('#ec926b',((267,209),(267,215),(262,221),(255,226),(253,225),(260,219),(264,212)))],
       'farol': [('#826d89',((201,186),(204,182),(206,178),(207,181),(205,186),(202,188))),
                 ('#826d89',((281,186),(284,182),(286,178),(287,181),(285,186),(282,188))),
                 ('#967e88',((234,86),(243,84),(248,86),(251,87),(243,91),(235,90)))],
    }
    for cor,geometria in areas[nome]:
        colocar(im,zona,geometria,cor)
