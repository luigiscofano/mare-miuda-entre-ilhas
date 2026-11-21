"""Recorta a matriz original do siri da marca e preserva o mapa Cabo Baixo."""
import importlib.util
from pathlib import Path
from PIL import Image, ImageChops

RAIZ=Path(__file__).resolve().parent
PAI=RAIZ.parent
FONTES=RAIZ/'fontes'
REFERENCIA=PAI/'revisao-niveis'
MATRIZ_ORIGEM=PAI.parent/'mare-logos-estudo/desenhar.py'

def matriz_da_marca():
    arq=FONTES/'siri-da-placa-31x23.png'
    if not arq.exists():
        # O sprite foi isolado na escala original; a captura do iPhone não foi reamostrada.
        spec=importlib.util.spec_from_file_location('marca',MATRIZ_ORIGEM)
        marca=importlib.util.module_from_spec(spec)
        spec.loader.exec_module(marca)
        nativo=Image.new('RGBA',(31,23))
        marca.siri(nativo,0,0)
        nativo.save(arq,optimize=True)
    return Image.open(arq).convert('RGBA')

def main():
    base=Image.open(REFERENCIA/'fontes/caminho-base.png').convert('RGBA')
    nos=Image.open(REFERENCIA/'fontes/camada-do-seletor.png').convert('RGBA')
    antigo=nos.crop((17,84,40,102))
    assert antigo.tobytes()==Image.open(REFERENCIA/'fontes/siri-seletor-23x18.png').convert('RGBA').tobytes()
    nos.paste((0,0,0,0),(17,84,40,102))
    marca=matriz_da_marca()
    assert marca.size==(31,23) and set(marca.getchannel('A').get_flattened_data())=={0,255}
    nos.alpha_composite(marca,(13,79))
    nos.save(FONTES/'camada-do-seletor.png',optimize=True)
    novo=Image.alpha_composite(base,nos)
    anterior=Image.open(PAI/'revisao-siri-marca/cabo-baixo-siri-da-marca.png').convert('RGBA')
    x0,y0,x1,y1=ImageChops.difference(novo.convert('RGB'),anterior.convert('RGB')).getbbox()
    assert x0>=13 and y0>=79 and x1<=44 and y1<=102
    novo.save(RAIZ/'cabo-baixo-siri-exato-192.png',optimize=True)
    previa=novo.resize((768,576),Image.Resampling.NEAREST)
    assert previa.resize((192,144),Image.Resampling.NEAREST).tobytes()==novo.tobytes()
    previa.save(RAIZ/'cabo-baixo-siri-exato-192-4x.png',optimize=True)

if __name__=='__main__':
    main()
