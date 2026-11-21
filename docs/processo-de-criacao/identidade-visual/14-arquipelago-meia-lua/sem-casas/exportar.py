"""Restaura os terrenos sob cinco casas e refaz somente a camada de rotas."""
from math import hypot
from pathlib import Path
import importlib.util
from PIL import Image, ImageDraw, ImageChops

RAIZ=Path(__file__).resolve().parent
PAI=RAIZ.parent
spec=importlib.util.spec_from_file_location('meialua', PAI/'exportar.py')
arte=importlib.util.module_from_spec(spec)
spec.loader.exec_module(arte)

# Máscaras de recorte sobre as casas, sem incluir o trajeto em areia vizinho.
RECORTES=[
    [(33,129),(42,129),(47,132),(47,137),(45,137),(45,142),(34,142),(34,137),(32,135)],
    [(20,139),(43,140),(48,143),(51,147),(48,150),(46,150),(46,157),(27,158),(26,152),(22,151),(20,147)],
    [(13,164),(22,163),(30,165),(36,167),(39,170),(39,174),(36,174),(36,179),(22,179),(20,176),(18,175),(13,170)],
    [(214,96),(218,95),(233,95),(235,94),(237,98),(235,102),(234,106),(219,107),(218,104),(214,103)],
    [(251,86),(257,83),(270,82),(276,85),(277,87),(274,89),(274,92),(254,93),(252,91),(251,90)],
]

# Cada ramo guarda curvas próprias; os dois primeiros só divergem no ponto comum.
ROTAS=[
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

def terreno(im):
    # A cor de fundo e os tufos seguem os planos de luz da vizinhança.
    reparo=Image.new('RGBA',im.size)
    cores=['#86913e','#929836','#b9a53b','#a9a535','#869839']
    for pol, cor in zip(RECORTES, cores):
        forma=Image.new('L',im.size)
        ImageDraw.Draw(forma).polygon(pol,fill=255)
        remendo=Image.new('RGBA',im.size,cor)
        d=ImageDraw.Draw(remendo)
        x0,y0,x1,y1=forma.getbbox()
        a=x0+2; b=x1-3; c=(a+b)//2
        d.polygon([(x0,y1-4),(a,y1-7),(c,y1-6),(b,y1-5),(x1,y1-7),(x1,y1),(x0,y1)],fill='#58663f' if y0<163 else '#8c8647')
        d.polygon([(a,y0+5),(a+4,y0+2),(c,y0+1),(c+3,y0+3),(b,y0+3),(b+2,y0+6),(c+2,y0+7),(a+3,y0+7)],fill='#a9a535')
        d.line([(a+3,y0+4),(a+6,y0+3),(c,y0+3)],fill='#cab04a',width=1)
        d.line([(c+2,y1-6),(c+5,y1-7),(b,y1-7)],fill='#74813c',width=1)
        # Copas baixas e pedrinhas organizadas à mão para cada clareira.
        plantios={
            129:[(37,133,4),(42,138,3)],139:[(27,146,5),(37,152,4),(44,145,3)],
            163:[(19,169,4),(26,173,4),(33,170,3)],94:[(219,100,4),(229,102,4)],
            82:[(257,87,4),(267,87,5),(273,86,3)],
        }
        for cx,cy,z in plantios[y0]:
            d.polygon([(cx-z,cy+1),(cx-z+2,cy-2),(cx+z-1,cy-2),(cx+z+1,cy+1),(cx+z,cy+3),(cx-z+1,cy+3)],fill='#4c654a')
            d.polygon([(cx-z,cy),(cx-z+1,cy-2),(cx-1,cy-3),(cx+1,cy-3),(cx+2,cy-2),(cx+z,cy-1),(cx+z,cy+1),(cx+2,cy+2),(cx-2,cy+1)],fill='#74813c')
            d.line([(cx-z+1,cy-1),(cx-1,cy-2),(cx+1,cy-2)],fill='#b9aa43',width=1)
        reparo.paste(remendo,(0,0),forma)
    return reparo

def pontos(caminho, intervalo=6):
    """Interpola marcas em distância euclidiana acumulada, inclusive nas curvas."""
    falta=3.0
    ultimo=None
    for (x,y),(u,v) in zip(caminho,caminho[1:]):
        distancia=hypot(u-x,v-y)
        while falta<distancia:
            s=falta/distancia
            novo=round(x+s*(u-x)),round(y+s*(v-y))
            if novo!=ultimo:
                yield novo
                ultimo=novo
            falta+=intervalo
        falta-=distancia

def rotas(base):
    camada=Image.new('RGBA',base.size)
    d=ImageDraw.Draw(camada)
    for caminho in ROTAS:
        for x,y in pontos(caminho):
            # As marcas sobem de contraste só no mar; não passam sobre terra.
            if base.getpixel((x,y))[:3] in ((5,94,107),(2,114,131),(4,68,94)):
                d.point((x,y), fill='#8db8a0')
                if base.getpixel((x+1,y))[:3]==(5,94,107):
                    d.point((x+1,y), fill='#659f92')
    for id_,(x,y) in arte.CAIS.items():
        arte.cais(d,x,y,id_=='praia')
    return camada

def main():
    base=Image.open(PAI/'fontes/arquipelago-base.png').convert('RGBA')
    restauracao=terreno(base)
    sem_casas=Image.alpha_composite(base,restauracao)
    rotas_novas=rotas(sem_casas)
    novo=Image.alpha_composite(sem_casas,rotas_novas)
    anterior=Image.open(PAI/'arquipelago-meia-lua-288.png').convert('RGBA')
    rotas_antigas=Image.open(PAI/'fontes/rotas-e-cais.png').convert('RGBA')
    contagem=0
    for y in range(base.height):
        for x in range(base.width):
            p=(x,y)
            if novo.getpixel(p)!=anterior.getpixel(p):
                assert restauracao.getpixel(p)[3] or rotas_novas.getpixel(p)!=rotas_antigas.getpixel(p)
                contagem+=1
    print(f'{contagem} pixels alterados (somente nas cinco máscaras e nas rotas)')
    assert set(novo.getchannel('A').get_flattened_data())=={255} and novo.size==(288,216)
    for nome,img in [('restauracao',restauracao),('rotas-e-cais',rotas_novas)]:
        assert set(img.getchannel('A').get_flattened_data())=={0,255}
        img.save(RAIZ/'fontes'/f'{nome}.png',optimize=True)
    novo.save(RAIZ/'meia-lua-sem-casas-288.png',optimize=True)
    previa=novo.resize((864,648),Image.Resampling.NEAREST)
    assert previa.resize(novo.size,Image.Resampling.NEAREST).tobytes()==novo.tobytes()
    previa.save(RAIZ/'meia-lua-sem-casas-288-3x.png',optimize=True)

if __name__=='__main__':
    main()
