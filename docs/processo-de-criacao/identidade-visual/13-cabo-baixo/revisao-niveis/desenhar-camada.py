"""Cabo Baixo intacto, mais camada de seleção e siri pequeno desenhado em 23 × 18."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageChops

RAIZ=Path(__file__).resolve().parent
FONTES=RAIZ/'fontes'
NOS=[
    (43,80,'1','primeira-onda'),
    (40,38,'2','sombra-da-garca'),
    (84,46,'3','busca-e-volta'),
    (123,32,'4','ponta-da-garca'),
    (119,106,'*','ilhota-perolada'),
]
NUMEROS={
    '1':("010","110","010","010","111"),
    '2':("110","001","010","100","111"),
    '3':("110","001","010","001","110"),
    '4':("101","101","111","001","001"),
    '*':("00100","01110","11011","01110","00100"),
}

def siri_pequeno():
    im=Image.new('RGBA',(23,18))
    d=ImageDraw.Draw(im)
    borda='#623645'; coral='#d76557'; luz='#ff9e6e'; corpo='#ed8a65'; creme='#ffe4aa'
    d.polygon(((3,15),(7,13),(16,13),(20,15),(18,17),(5,17)),fill='#937f61')
    for lado in (-1,1):
        def p(seq):
            return [(11+x*lado,y) for x,y in seq]
        for y in (11,13,15):
            d.line(p([(3,y-1),(5,y),(7,y),(8,y+1)]),fill=borda,width=2)
        d.line(p([(4,12),(6,10),(6,8),(8,6)]),fill=borda,width=3)
        d.line(p([(4,12),(6,10),(6,8),(8,6)]),fill=coral)
        d.polygon(p([(5,7),(4,5),(4,2),(5,1),(6,1),(6,4),(8,5),(8,1),(9,0),(10,0),(11,2),(11,5),(9,8),(7,9)]),fill=coral,outline=borda)
        d.line(p([(6,3),(6,5),(7,6)]),fill=luz)
        d.line(p([(2,11),(2,7),(3,7),(3,10)]),fill=borda)
        d.point(p([(2,7)])[0],fill='#fff0bc')
    d.polygon(((5,11),(6,9),(9,8),(13,8),(16,9),(17,11),(17,14),(15,16),(7,16),(5,14)),fill=corpo,outline=borda)
    d.polygon(((6,13),(9,14),(13,14),(16,13),(15,15),(8,15)),fill=creme)
    d.line(((8,11),(10,10),(13,10)),fill='#ffb983')
    d.line(((10,13),(12,13)),fill=borda)
    return im

def marcador(im,x,y,s):
    d=ImageDraw.Draw(im)
    opcional=s=='*'
    escura='#293b4a'
    telha='#486c6b' if not opcional else '#8d6549'
    bege='#f5dcaa'
    p=lambda seq:[(x+a,y+b) for a,b in seq]
    # A base aponta ao centro transitável do caminho, sem cobri-lo com uma caixa.
    d.polygon(p([(-5,-9),(-3,-11),(3,-11),(5,-9),(5,-2),(3,0),(1,0),(0,2),(-1,0),(-3,0),(-5,-2)]),fill=escura)
    d.polygon(p([(-4,-9),(-3,-10),(3,-10),(4,-9),(4,-3),(2,-1),(-2,-1),(-4,-3)]),fill=telha)
    d.line(p([(-4,-8),(-2,-9),(2,-9)]),fill='#88a38a' if not opcional else '#e3b77b')
    forma=NUMEROS[s]
    for i,row in enumerate(forma):
        for j,v in enumerate(row):
            if v=='1':
                d.point((x+j-len(row)//2,y-8+i),fill=bege)

def main():
    base=Image.open(FONTES/'caminho-base.png').convert('RGBA')
    assert base.size==(192,144) and set(base.getchannel('A').get_flattened_data())=={255}
    camada=Image.new('RGBA',base.size)
    for x,y,digito,_ in NOS:
        marcador(camada,x,y,digito)
    mini=siri_pequeno()
    assert mini.size==(23,18) and set(mini.getchannel('A').get_flattened_data())=={0,255}
    mini.save(FONTES/'siri-seletor-23x18.png',optimize=True)
    camada.alpha_composite(mini,(17,84))
    out=Image.alpha_composite(base,camada)
    for y in range(base.height):
        for x in range(base.width):
            overlay=camada.getpixel((x,y))
            assert out.getpixel((x,y))==(overlay if overlay[3] else base.getpixel((x,y)))
    camada.save(FONTES/'camada-do-seletor.png',optimize=True)
    out.save(RAIZ/'cabo-baixo-selecao-192.png',optimize=True)
    ampliada=out.resize((768,576),Image.Resampling.NEAREST)
    assert ImageChops.difference(ampliada.resize(base.size,Image.Resampling.NEAREST).convert('RGB'),out.convert('RGB')).getbbox() is None
    ampliada.save(RAIZ/'cabo-baixo-selecao-192-4x.png',optimize=True)

if __name__=='__main__':
    main()
