"""Melhora o contraste da seleção sem alterar o cenário nem o siri."""
from pathlib import Path
from PIL import Image,ImageDraw

RAIZ=Path(__file__).resolve().parent
PAI=RAIZ.parent
NOS=[(46,78,'1'),(40,38,'2'),(84,46,'3'),(123,32,'4'),(119,106,'*')]
GLIFOS={
    '1':('0110','1110','0110','0110','0110','1111'),
    '2':('1110','0001','0010','0100','1000','1111'),
    '3':('1110','0001','0110','0001','0001','1110'),
    '4':('1010','1010','1010','1111','0010','0010'),
    '*':('00100','01110','11111','01110','01010'),
}
POS_SIRI=(13,79)
DIM=(192,144)

def main():
    base=Image.open(PAI/'revisao-niveis/fontes/caminho-base.png').convert('RGBA')
    siri=Image.open(PAI/'revisao-siri-exato/fontes/siri-da-placa-31x23.png').convert('RGBA')
    overlay=Image.new('RGBA',DIM)
    d=ImageDraw.Draw(overlay)
    for x,y,k in NOS:
        # A ponta marca a posição do nó; o símbolo não depende da cor.
        p=lambda seq:[(x+a,y+b) for a,b in seq]
        d.polygon(p([(-4,-11),(4,-11),(6,-9),(6,-3),(4,-1),(2,-1),(0,2),(-2,-1),(-4,-1),(-6,-3),(-6,-9)]),fill='#f1d8a4')
        d.polygon(p([(-4,-10),(4,-10),(5,-9),(5,-3),(4,-2),(1,-2),(0,0),(-1,-2),(-4,-2),(-5,-3),(-5,-9)]),fill='#253b44' if k!='*' else '#604331')
        for j,linha in enumerate(GLIFOS[k]):
            for i,v in enumerate(linha):
                if v=='1':
                    d.point((x+i-len(linha)//2,y-9+j),fill='#fff1ca')
    overlay.alpha_composite(siri,POS_SIRI)
    assert overlay.crop((13,79,44,102)).getchannel('A').getbbox() is not None
    out=Image.alpha_composite(base,overlay)
    antes=Image.open(PAI/'revisao-siri-exato/cabo-baixo-siri-exato-192.png').convert('RGBA')
    for y in range(DIM[1]):
        for x in range(DIM[0]):
            if out.getpixel((x,y))!=antes.getpixel((x,y)):
                assert any(abs(x-a)<=6 and b-11<=y<=b+2 for a,b,_ in NOS+[(43,80,'1')])
            if 13<=x<44 and 79<=y<102 and siri.getpixel((x-13,y-79))[3]:
                assert out.getpixel((x,y))==siri.getpixel((x-13,y-79))==antes.getpixel((x,y))
    overlay.save(RAIZ/'fontes/camada-seletor.png',optimize=True)
    out.save(RAIZ/'cabo-baixo-clean-192.png',optimize=True)
    zoom=out.resize((768,576),Image.Resampling.NEAREST)
    assert zoom.resize(DIM,Image.Resampling.NEAREST).tobytes()==out.tobytes()
    zoom.save(RAIZ/'cabo-baixo-clean-192-4x.png',optimize=True)

if __name__=='__main__':
    main()
