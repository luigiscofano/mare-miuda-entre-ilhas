"""Produz uma variante de mapa fiel ao siri da Placa de Areia, sem alterar o Cabo Baixo."""
from pathlib import Path
from PIL import Image,ImageDraw,ImageChops
RAIZ=Path(__file__).resolve().parent
FONTES=RAIZ/'fontes'
INK='#302638'
CORAL='#fb956d'
CREME='#ffefbe'
ROSA='#ffc5a3'
VERMELHO='#db5c58'

def siri():
    # O gesto do emblema é frontal: pinças levantadas, braços curtos e olhos próximos.
    im=Image.new('RGBA',(25,19))
    d=ImageDraw.Draw(im)
    d.line([(7,13),(5,16),(2,16)],fill=INK,width=2)
    d.line([(17,13),(19,16),(22,16)],fill=INK,width=2)
    d.line([(9,15),(7,17),(5,18)],fill=INK,width=2)
    d.line([(15,15),(17,17),(19,18)],fill=INK,width=2)
    bracos=[(5,8),(8,12),(12,13),(16,12),(19,8)]
    d.line(bracos,fill=INK,width=4)
    d.line(bracos,fill=CORAL,width=2)
    p=[(2,0),(5,0),(5,3),(7,2),(9,4),(9,7),(6,10),(3,10),(0,7),(0,3)]
    for pinça in (p,[(24-x,y) for x,y in p]):
        d.polygon(pinça,fill=VERMELHO,outline=INK)
    d.line([(2,3),(2,6)],fill=CORAL,width=2)
    d.line([(22,3),(22,6)],fill=CORAL,width=2)
    d.polygon([(7,10),(9,8),(15,8),(17,10),(18,13),(16,16),(8,16),(6,13)],fill=CORAL,outline=INK)
    d.line([(8,12),(16,12)],fill=ROSA)
    d.line([(8,14),(10,15),(14,15),(16,14)],fill=CREME)
    for x in (9,14):
        d.rectangle((x,6,x+1,10),fill=INK)
        d.point((x,7),fill=CREME)
    d.point((12,13),fill=INK)
    return im

def main():
    base=Image.open(FONTES/'caminho-base.png').convert('RGBA')
    nos=Image.open(FONTES/'camada-do-seletor.png').convert('RGBA')
    # Retira apenas a ocorrência anterior do siri. A janela não contém marcadores.
    antigo=nos.crop((17,84,40,102))
    assert antigo.tobytes()==Image.open(FONTES/'siri-anterior.png').convert('RGBA').tobytes()
    nos.paste((0,0,0,0),(17,84,40,102))
    escolhido=siri()
    escolhido.save(FONTES/'siri-da-marca-25x19.png',optimize=True)
    nos.alpha_composite(escolhido,(16,83))
    assert set(nos.getchannel('A').get_flattened_data())=={0,255}
    render=Image.alpha_composite(base,nos)
    assert render.size==(192,144)
    diff=ImageChops.difference(render.convert('RGB'),Image.open(FONTES/'comparacao-anterior.png').convert('RGB'))
    x0,y0,x1,y1=diff.getbbox()
    assert x0>=16 and y0>=83 and x1<=41 and y1<=102
    render.save(RAIZ/'cabo-baixo-siri-da-marca.png',optimize=True)
    ampliada=render.resize((768,576),Image.Resampling.NEAREST)
    assert ampliada.resize(render.size,Image.Resampling.NEAREST).tobytes()==render.tobytes()
    ampliada.save(RAIZ/'cabo-baixo-siri-da-marca-4x.png',optimize=True)

if __name__=='__main__':
    main()
