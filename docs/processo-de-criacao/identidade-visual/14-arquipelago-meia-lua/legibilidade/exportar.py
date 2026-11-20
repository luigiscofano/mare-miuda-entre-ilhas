"""Separa, por forma e cor, os cais e as rotas da espuma e dos relevos."""
from pathlib import Path
from math import hypot
from PIL import Image,ImageDraw,ImageChops

RAIZ=Path(__file__).resolve().parent
PAI=RAIZ.parent
DIM=(288,216)
CAIS=[(79,196),(125,162),(177,186),(205,127),(212,66),(56,105),(163,46),(84,54)]
RAMOS=[
    [(79,196),(87,187),(102,176),(113,174)],
    [(113,174),(120,170),(125,162)],
    [(113,174),(126,175),(145,178),(158,182),(177,186)],
    [(125,162),(134,169),(146,168),(164,155),(176,148),(187,144)],
    [(177,186),(173,178),(172,170),(176,159),(187,144)],
    [(187,144),(194,138),(205,127)],
    [(205,127),(191,122),(180,115),(173,105),(174,94),(180,81),(193,73),(212,66)],
    [(212,66),(188,74),(162,84),(138,93),(111,104),(87,112),(72,111),(56,105)],
    [(56,105),(78,104),(91,98),(103,85),(124,72),(145,58),(163,46)],
    [(163,46),(147,51),(130,58),(115,62),(102,62),(93,59),(84,54)],
]
MAR={(5,94,107),(2,114,131),(4,68,94)}
def pontos(rota,dist):
    falta=3
    for (x,y),(u,v) in zip(rota,rota[1:]):
        tam=hypot(u-x,v-y)
        while falta<tam:
            t=falta/tam
            yield round(x+(u-x)*t),round(y+(v-y)*t)
            falta+=dist
        falta-=tam

def main():
    base=Image.open(PAI/'fontes/arquipelago-base.png').convert('RGBA')
    restaura=Image.open(PAI/'sem-casas/fontes/restauracao.png').convert('RGBA')
    espuma=Image.open(PAI/'espuma/fontes/espuma.png').convert('RGBA')
    fundo=Image.alpha_composite(Image.alpha_composite(base,restaura),espuma)
    camada=Image.new('RGBA',DIM)
    d=ImageDraw.Draw(camada)
    for i,rota in enumerate(RAMOS):
        principal=i<3
        for x,y in pontos(rota,7 if principal else 10):
            if min(hypot(x-u,y-v) for u,v in CAIS)<8:
                continue
            coords=[(x,y),(x+1,y),(x,y+1),(x+1,y+1)] if principal else [(x,y),(x+1,y)]
            for ponto in coords:
                if fundo.getpixel(ponto)[:3] in MAR and not espuma.getpixel(ponto)[3]:
                    d.point(ponto,fill='#d2ae72' if principal else '#709a92')
    for i,(x,y) in enumerate(CAIS):
        d.polygon([(x-3,y-5),(x+3,y-5),(x+5,y-3),(x+5,y+2),(x+2,y+4),(x-2,y+4),(x-5,y+2),(x-5,y-3)],fill='#24374a')
        d.polygon([(x-3,y-4),(x+3,y-4),(x+4,y-3),(x+4,y+1),(x+2,y+3),(x-2,y+3),(x-4,y+1),(x-4,y-3)],fill=('#cc815b' if i==0 else '#4c7775'))
        d.polygon([(x,y-3),(x+3,y),(x,y+2),(x-3,y)],fill='#ffe2a5' if i<3 else '#bbccab')
        if i==0:
            d.point((x,y),fill='#cc815b')
    assert set(camada.getchannel('A').get_flattened_data())=={0,255}
    original=Image.open(PAI/'espuma/meia-lua-espuma-288.png').convert('RGBA')
    antiga=Image.open(PAI/'sem-casas/fontes/rotas-e-cais.png').convert('RGBA')
    out=Image.alpha_composite(fundo,camada)
    for y in range(DIM[1]):
        for x in range(DIM[0]):
            p=x,y
            if original.getpixel(p)!=out.getpixel(p):
                assert camada.getpixel(p)[3] or antiga.getpixel(p)[3]
                assert not espuma.getpixel(p)[3]
    out.save(RAIZ/'meia-lua-clean-288.png',optimize=True)
    camada.save(RAIZ/'fontes/camada-navegacao.png',optimize=True)
    zoom=out.resize((864,648),Image.Resampling.NEAREST)
    assert zoom.resize(DIM,Image.Resampling.NEAREST).tobytes()==out.tobytes()
    zoom.save(RAIZ/'meia-lua-clean-288-3x.png',optimize=True)

if __name__=='__main__':
    main()
