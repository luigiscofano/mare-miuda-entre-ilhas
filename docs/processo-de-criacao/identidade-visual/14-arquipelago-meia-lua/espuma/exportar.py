"""Aplica linhas curtas de espuma branca sem tocar nas ilhas nem na interface."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageChops

RAIZ=Path(__file__).resolve().parent
PAI=RAIZ.parent
FUNDO=PAI/'sem-casas/meia-lua-sem-casas-288.png'
MAR={(5,94,107),(2,114,131),(4,68,94)}
# Cristais, vulcão, neve, gruta, cascatas, recifes, mangue e praia.
TRECHOS=[
    [(35,56),(41,58),(48,58),(52,57)],
    [(69,57),(74,58),(79,58)],
    [(132,43),(137,47),(145,49),(151,49)],
    [(174,49),(182,48),(187,46)],
    [(205,66),(209,69),(215,72),(222,73),(229,73)],
    [(255,71),(263,68),(268,65)],
    [(22,109),(27,112),(33,113),(39,112)],
    [(59,112),(67,112),(73,109)],
    [(189,122),(193,126),(199,130)],
    [(219,135),(224,136),(228,136),(234,138),(242,139)],
    [(93,155),(95,159),(101,163),(108,167)],
    [(131,167),(137,167),(142,164)],
    [(174,193),(185,194),(190,195)],
    [(206,201),(211,204),(217,204)],
    [(235,204),(243,204),(250,201)],
    [(53,206),(58,209),(67,210),(74,210),(82,209)],
    [(92,198),(89,195),(86,192)],
    [(61,182),(65,178),(73,174),(79,173)],
]

def main():
    base=Image.open(FUNDO).convert('RGBA')
    assert base.size==(288,216)
    camada=Image.new('RGBA',base.size)
    d=ImageDraw.Draw(camada)
    for linha in TRECHOS:
        molde=Image.new('1',base.size)
        ImageDraw.Draw(molde).line(linha,fill=1)
        caixa=molde.getbbox()
        # Só permanecem pixels de água junto a bordas da massa terrestre.
        pontos=[]
        for x in range(caixa[0],caixa[2]):
            for y in range(caixa[1],caixa[3]):
                if not molde.getpixel((x,y)) or base.getpixel((x,y))[:3] not in MAR:
                    continue
                vizinhos=[base.getpixel((x+j,y+i))[:3] for j in range(-3,4) for i in range(-3,4) if j*j+i*i<=10]
                if any(c[0]>47 and c[1]>55 and c[0]>c[2]*0.65 for c in vizinhos):
                    pontos.append((x,y))
        # Pequenas pausas dão ritmo sem converter a costa em um contorno único.
        for i,ponto in enumerate(pontos):
            if i%8 in (0,1,4,5,6):
                d.point(ponto, fill='#efeddb' if i%8 in (1,4,5) else '#c3dbca')
    assert set(camada.getchannel('A').get_flattened_data())=={0,255}
    camada.save(RAIZ/'fontes/espuma.png',optimize=True)
    novo=Image.alpha_composite(base,camada)
    assert ImageChops.difference(novo.convert('RGB'),base.convert('RGB')).convert('L').point(lambda p:255 if p else 0).tobytes()==camada.getchannel('A').tobytes()
    print('Pixels de espuma:',camada.getchannel('A').histogram()[255])
    novo.save(RAIZ/'meia-lua-espuma-288.png',optimize=True)
    previa=novo.resize((864,648),Image.Resampling.NEAREST)
    assert previa.resize((288,216),Image.Resampling.NEAREST).tobytes()==novo.tobytes()
    previa.save(RAIZ/'meia-lua-espuma-288-3x.png',optimize=True)

if __name__=='__main__':
    main()
