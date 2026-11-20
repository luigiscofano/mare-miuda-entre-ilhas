"""Exporta as duas prévias a partir das fontes em pixel art e do sprite isolado."""
from pathlib import Path
from PIL import Image

RAIZ=Path(__file__).resolve().parent
FONTES=RAIZ/'fontes'
POSICAO=(42,86)

def cena(nome):
    base=Image.open(FONTES/f'{nome}-base.png').convert('RGBA')
    assert base.size==(224,168) and set(base.getchannel('A').get_flattened_data())=={255}
    return base

def inserir_siri(base):
    sprite=Image.open(FONTES/'siri-aprovado-1x.png').convert('RGBA')
    assert sprite.size==(35,27)
    assert set(sprite.getchannel('A').get_flattened_data())=={0,255}
    base.alpha_composite(sprite,POSICAO)
    x,y=POSICAO
    for j in range(sprite.height):
        for i in range(sprite.width):
            pixel=sprite.getpixel((i,j))
            if pixel[3]:
                assert base.getpixel((x+i,y+j))==pixel

def salvar(im,nome):
    assert set(im.getchannel('A').get_flattened_data())=={255}
    path=RAIZ/nome
    # Indexação por cor exata: o PNG fica leve sem alterar nenhum RGB.
    rgb=im.convert('RGB')
    cores=sorted(set(rgb.get_flattened_data()))
    assert len(cores)<=256
    indice={c:i for i,c in enumerate(cores)}
    indexada=Image.frombytes('P',rgb.size,bytes(indice[c] for c in rgb.get_flattened_data()))
    indexada.putpalette([canal for cor in cores for canal in cor])
    indexada.save(path,optimize=True)
    ver=Image.open(path).convert('RGBA')
    assert ver.tobytes()==im.tobytes()
    ampliada=im.resize((im.width*4,im.height*4),Image.Resampling.NEAREST)
    assert ampliada.resize(im.size,Image.Resampling.NEAREST).tobytes()==im.tobytes()
    ampliada.save(RAIZ/nome.replace(".png","-4x.png"),optimize=True)

def main():
    caminho=cena('caminho')
    inserir_siri(caminho)
    salvar(caminho,'02-caminho-das-conchas-grade-224.png')

if __name__=='__main__':
    main()
