"""Pranchas de navegação direta, em pixels inteiros. Python 3 e Pillow."""
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont,ImageFilter

D=Path(__file__).resolve().parent
W,H=320,240
CX=159
INK='#1a2933'
BEGE='#fff0cd'

TEMAS={
 'praia':dict(nome='PRAIA DAS CONCHAS', indice='01', fundo='#16475b', ondas='#1b5061',
    margem=('#286476','#38808b','#70aaa3','#cde7cb'), face=('#916349','#b08355','#dab477','#f3d39a'),
    sal='#e5bb81', cor='#481f2d',sub='AREAL EM ANEL'),
 'recifes':dict(nome='RECIFES EXPOSTOS', indice='02', fundo='#15364e', ondas='#1a4661',
    margem=('#225872','#367f8e','#609d99','#bedec6'), face=('#435960','#657375','#9b9990','#c7b28e'),
    sal='#9f9984', cor='#362229',sub='COSTÃO SERRILHADO'),
 'farol':dict(nome='ARQUIPÉLAGO DO FAROL', indice='08', fundo='#242b51', ondas='#2f3b64',
    margem=('#3b496b','#4b637e','#768ca7','#c2cddd'), face=('#51495b','#786175','#a8958a','#d9be9a'),
    sal='#a5929c', cor='#322640',sub='ESTRELA DE CRISTAL'),
}
AREAL=((40,87),(50,87),(50,75),(70,75),(70,63),(97,63),(97,56),(132,56),(132,51),(159,51),(159,199),(125,199),(125,192),(90,192),(90,183),(65,183),(65,171),(48,171),(48,153),(39,153))
RECIFE=((37,93),(49,93),(49,84),(58,84),(58,73),(70,73),(70,66),(89,66),(89,74),(103,74),(103,62),(121,62),(121,54),(137,54),(137,63),(159,63),(159,200),(135,200),(135,193),(112,193),(112,203),(94,203),(94,194),(76,194),(76,187),(59,187),(59,174),(47,174),(47,157),(37,157))
ESTRELA=((42,104),(58,104),(58,94),(79,94),(79,76),(106,76),(106,61),(125,61),(125,48),(145,48),(145,39),(159,39),(159,206),(139,206),(139,197),(123,197),(123,185),(107,185),(107,174),(90,174),(90,182),(66,182),(66,168),(53,168),(53,147),(42,147))

# Todas as direções usam simetria horizontal. Os pontos são só botões; nenhum caminho.
PONTOS={
 'praia':[(99,93),(159,84),(219,93),(159,119),(99,146),(159,151),(219,146)],
 'recifes':[(75,107),(117,98),(159,90),(201,98),(243,107),
            (75,139),(117,147),(159,155),(201,147),(243,139)],
 'farol':[(159,73),(209,86),(238,113),(226,146),(193,165),
          (125,165),(92,146),(80,113),(109,86),(159,122)],
}
EXTRAS={
 'praia':[(59,114),(59,145),(259,114),(259,145)],
 'recifes':[(112,176),(206,176)],
 'farol':[(159,168)],
}
CHEFES={
 'praia':[(135,175),(183,175)],
 'recifes':[(76,178),(242,178)],
 'farol':[(137,188),(181,188)],
}
PAREDES={'praia':AREAL,'recifes':RECIFE,'farol':ESTRELA}


def texto(imagem, texto, x,y, tamanho, cor, centro=False):
    # Raster de fonte convertido para máscara binária antes de compor.
    f=ImageFont.truetype('DejaVuSans-Bold.ttf',tamanho)
    a,b,c,d=f.getbbox(texto)
    m=Image.new('L',(c-a,d-b))
    ImageDraw.Draw(m).text((-a,-b),texto,font=f,fill=255)
    m=m.point(lambda p:255 if p>=128 else 0)
    if centro:
        x-=m.width//2
    imagem.paste(cor,(x,y,x+m.width,y+m.height),m)


def pintar_forma(im,masca,cor,dy=0):
    if dy:
        m=Image.new('L',(W,H))
        m.paste(masca,(0,dy))
        masca=m
    im.paste(cor,(0,0,W,H),masca)


def simetria(pontos):
    fim_do_topo=next(i for i,p in enumerate(pontos) if p[0]==CX)
    esquerda=list(reversed(pontos[:fim_do_topo+1]))+list(reversed(pontos[fim_do_topo+1:]))
    return esquerda+[(2*CX-x,y) for x,y in reversed(esquerda)]


def desenhar_costa(im,mundo,t):
    desenho=ImageDraw.Draw(im)
    forma=Image.new('L',(W,H))
    ImageDraw.Draw(forma).polygon(simetria(PAREDES[mundo]),fill=255)
    for dif,cor in zip((17,12,7,3),t['margem']):
        pintar_forma(im,forma.filter(ImageFilter.MaxFilter(2*dif+1)),cor,2)
    for dy,cor in zip((9,7,4,0),t['face']):
        pintar_forma(im,forma,cor,dy)
    # Iluminação de borda voltada ao topo; a encosta escurece para o sul.
    for y in range(45,204):
        for x in range(35,CX):
            if forma.getpixel((x,y)) and not forma.getpixel((x,y-1)):
                for xr in (x,2*CX-x):
                    desenho.point((xr,y),fill=BEGE)
    for y in range(57,202,7):
        for x in range(40+(7*y)%13,CX-2,13):
            if all(forma.getpixel((x+dx,y)) for dx in (-2,0,2)) and (x+y)%7<4:
                for xr in (x,2*CX-x):
                    desenho.line((xr-1,y,xr+1,y),fill=t['sal'])
    if mundo=='praia':
        # A lâmina rasa desenha uma oval de degraus atrás do marco central.
        desenho.polygon(((144,102),(174,102),(174,107),(182,107),(182,132),(174,132),
                         (174,137),(144,137),(144,132),(136,132),(136,107),(144,107)),fill='#cca772')
        desenho.polygon(((146,104),(172,104),(172,110),(178,110),(178,129),(172,129),
                         (172,133),(146,133),(146,129),(140,129),(140,110),(146,110)),fill='#83aaa0')
        desenho.line((147,106,171,106),fill='#a9c5ab')
        # Duas poças de areia baixa, conchas fora da malha dos botões.
        for x in (69,249):
            desenho.rounded_rectangle((x-13,76,x+13,93),radius=5,fill='#c49a69')
            desenho.rounded_rectangle((x-11,77,x+11,91),radius=4,fill='#669b91')
            desenho.line((x-6,79,x+5,79),fill='#9fc5a5')
        for x in (82,236):
            desenho.polygon(((x-5,170),(x-2,166),(x+2,166),(x+5,170),(x+3,173),(x-3,173)),fill='#ad655f')
            desenho.line((x-2,168,x+2,168),fill='#fde0bd')
    elif mundo=='recifes':
        # A lagoa costeira tem padronagem mineral em estratos curtos.
        for y in (117,121,125):
            for x,fim in ((82,119),(126,155),(163,192),(199,236)):
                desenho.line((x,y,fim,y),fill='#ae9f87' if y==117 else '#b9aa8e')
        for x in (56,262):
            desenho.polygon(((x-11,119),(x-7,111),(x+3,111),(x+10,118),(x+9,124),(x-7,124)),fill='#5a6264')
            desenho.polygon(((x-11,119),(x-7,111),(x+3,111),(x+4,115),(x-4,119)),fill='#908e85')
            desenho.line((x-7,117,x+3,117),fill='#c4b7a2')
        for x in (129,189):
            desenho.line(((x-6,65),(x-4,60),(x,63),(x+1,57),(x+5,62)),fill='#ab706a',width=2)
    else:
        estrela=((159,54),(175,95),(231,100),(187,127),(201,174),(159,146),
                 (117,174),(131,127),(87,100),(143,95))
        desenho.polygon(estrela,fill='#c2ad9d',outline='#e2c7a9')
        desenho.line(((159,56),(159,116),(199,172)),fill='#cdb7a2')
        desenho.line(((92,101),(159,116),(225,101)),fill='#cdb7a2')
        for x in (77,241,117,201):
            y=140 if x in (77,241) else 62
            desenho.polygon(((x-9,y+3),(x-2,y-11),(x+3,y-14),(x+9,y-2),(x+6,y+5),(x-4,y+7)),fill='#706a94')
            desenho.polygon(((x-2,y-11),(x+3,y-14),(x+2,y+1),(x-9,y+3)),fill='#b0abd1')
            desenho.line((x+3,y-10,x+6,y-3),fill='#d4c9ed')


def marcar(im,x,y,classe,estado,numero=None):
    d=ImageDraw.Draw(im)
    cor={'regular':'#80623e','extra':'#6c466d','chefe':'#855054'}[classe]
    cor= {'travada':'#4b4f57','concluida':'#396b60'}.get(estado,cor)
    placa=((x-11,y-6),(x-8,y-10),(x+8,y-10),(x+11,y-6),(x+11,y+6),
           (x+7,y+10),(x-7,y+10),(x-11,y+6))
    d.polygon([(a,b+2) for a,b in placa],fill='#685448')
    d.polygon(placa,fill=INK)
    d.polygon(((x-9,y-5),(x-6,y-8),(x+6,y-8),(x+9,y-5),(x+9,y+4),(x+6,y+7),(x-6,y+7),(x-9,y+4)),fill=cor)
    d.line((x-6,y-8,x+6,y-8),fill='#ad9c7f' if estado=='travada' else '#e5bf83')
    d.line((x-5,y+8,x+5,y+8),fill='#bdb09b' if estado=='travada' else '#958465')
    if numero is not None:
        texto(im,str(numero),x,y-5,11,BEGE,True)
    if classe=='extra':
        d.polygon(((x,y-5),(x+5,y),(x,y+5),(x-5,y)),fill='#f4d9b0')
        d.point((x,y),fill='#845c83')
    if classe=='chefe':
        d.polygon(((x-6,y-4),(x-3,y-1),(x,y-5),(x+3,y-1),(x+6,y-4),(x+5,y+4),(x-5,y+4)),fill='#f6dfba')
        d.line((x-4,y+2,x+4,y+2),fill='#b57867')
    if estado=='travada':
        # Cadeado separado: o número continua legível.
        d.rectangle((x+6,y+4,x+13,y+12),fill=INK)
        d.rectangle((x+8,y+5,x+11,y+8),outline='#f1e0b4')
        d.rectangle((x+7,y+8,x+12,y+11),fill='#d7b783')
        d.point((x+9,y+10),fill=INK)
    if estado=='concluida':
        d.rectangle((x+6,y+4,x+13,y+12),fill=INK)
        d.rectangle((x+7,y+5,x+12,y+11),fill='#527e65')
        d.line(((x+8,y+8),(x+9,y+9),(x+11,y+6)),fill=BEGE)


def renderizar(mundo):
    t=TEMAS[mundo]
    im=Image.new('RGB',(W,H),t['fundo'])
    d=ImageDraw.Draw(im)
    for y in range(42,214,7):
        for x in range(11+y%13,151,23):
            if (x+y)%5<3:
                d.line((x,y,x+5+(x%7),y),fill=t['ondas'])
                d.line((2*CX-x-5-(x%7),y,2*CX-x,y),fill=t['ondas'])
    desenhar_costa(im,mundo,t)
    d.rectangle((0,0,W-1,33),fill='#142b3a')
    d.line((0,33,W-1,33),fill='#789c9c')
    d.rectangle((10,9,33,25),fill='#315965')
    texto(im,t['indice'],22,13,9,BEGE,True)
    texto(im,t['nome'],42,8,13,BEGE)
    texto(im,t['sub'],43,22,7,'#a8c9c1')
    d.rectangle((0,219,W-1,H-1),fill='#142b3a')
    d.line((0,219,W-1,219),fill='#789c9c')
    for numero,(x,y) in enumerate(PONTOS[mundo],1):
        marcar(im,x,y,'regular','concluida' if numero<3 else 'livre' if numero<=4 else 'travada',numero)
    for i,(x,y) in enumerate(EXTRAS[mundo]):
        marcar(im,x,y,'extra','livre' if i==0 else 'travada')
    for i,(x,y) in enumerate(CHEFES[mundo]):
        marcar(im,x,y,'chefe','livre' if i==0 else 'travada')
    for label,x in zip(('FASE','BÔNUS','CHEFE','TRAVADA','CONCLUÍDA'),(24,77,132,188,249)):
        d.rectangle((x-9,229,x-5,233),fill={'FASE':'#f4d9b0','BÔNUS':'#b382ba','CHEFE':'#da8b76','TRAVADA':'#bdb09b','CONCLUÍDA':'#7cad94'}[label])
        texto(im,label,x,227,8,BEGE)
    return im


if __name__=='__main__':
    todos=[]
    for mundo in TEMAS:
        im=renderizar(mundo)
        im.save(D/f'{mundo}-1x.png')
        im.resize((3*W,3*H),Image.Resampling.NEAREST).save(D/f'{mundo}-3x.png')
        todos.append(im)
    salto=6
    painel=Image.new('RGB',(W*3+salto*4,H+salto*2),'#0d2030')
    for i,im in enumerate(todos):
        painel.paste(im,(salto+i*(W+salto),salto))
    painel.resize((painel.width*2,painel.height*2),Image.Resampling.NEAREST).save(D/'seletores-diretos.png')
