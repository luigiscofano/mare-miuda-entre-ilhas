"""Estudo do arquipélago em uma grade nativa de 288 × 216."""
from pathlib import Path
import base64
from PIL import Image,ImageDraw
PROJ=Path(__file__).resolve().parent
FONTES=PROJ/'fontes'
DIM=(288,216)

# Os canais curvam entre as costas. Saídas iniciais da Praia são independentes;
# Recifes e Mangue se reencontram antes da passagem para a Enseada.
CAIS={
    'praia':(79,196),'recifes':(125,162),'mangue':(177,186),'enseada':(205,127),
    'deriva':(212,66),'grutas':(56,105),'baia':(163,46),'farol':(84,54),
}
ROTAS=[
    [(79,196),(90,186),(101,178),(112,174),(125,162)],
    [(79,196),(90,186),(101,178),(112,174),(136,176),(155,181),(177,186)],
    [(125,162),(134,173),(145,172),(173,148),(187,144)],
    [(177,186),(172,170),(178,154),(187,144)],
    [(187,144),(194,138),(205,127)],
    [(205,127),(180,115),(172,102),(180,81),(196,70),(212,66)],
    [(212,66),(186,75),(156,86),(119,102),(84,113),(56,105)],
    [(56,105),(89,100),(105,83),(133,65),(163,46)],
    [(163,46),(143,51),(125,57),(105,64),(84,54)],
]

def cria_base():
    pal=[[4,68,94],[2,95,113],[1,97,115],[1,98,116],[1,98,117],[2,99,117],[2,100,118],[2,100,119],[2,114,131],[15,40,76],[29,35,70],[62,46,75],[43,49,97],[84,58,93],[83,58,106],[91,59,118],[44,82,66],[81,100,63],[101,96,70],[110,127,58],[77,72,116],[111,74,120],[31,110,124],[109,101,134],[75,131,164],[61,176,177],[139,88,70],[134,140,56],[144,150,54],[187,86,66],[185,129,66],[239,123,69],[169,165,53],[211,175,59],[234,192,64],[141,81,108],[161,112,113],[234,142,103],[140,94,149],[147,126,166],[176,122,152],[196,132,191],[222,187,120],[250,198,130],[253,207,140],[187,207,216],[245,221,203],[254,224,173]]
    # O canal aberto é uma única cor; remove diferenças superficiais da água.
    for i in range(1,8):
        pal[i]=[5,94,107]
    dados=base64.b64decode(''.join((FONTES/f'{letra}.b64').read_text() for letra in 'ab'))
    base=Image.frombytes('P',DIM,dados)
    base.putpalette(sum(pal,[]))
    base.convert('RGB').save(FONTES/'arquipelago-base.png',optimize=True)

def pontilhado(d, pontos):
    trilha=Image.new('1',DIM)
    t=ImageDraw.Draw(trilha)
    n=0
    for a,b in zip(pontos,pontos[1:]):
        dx,dy=b[0]-a[0],b[1]-a[1]
        tam=max(abs(dx),abs(dy))
        for i in range(tam):
            if n%7<3:
                t.point((a[0]+round(dx*i/tam),a[1]+round(dy*i/tam)),fill=1)
            n+=1
    for y in range(DIM[1]):
        for x in range(DIM[0]):
            if trilha.getpixel((x,y)):
                d.point((x,y),fill='#75a996')

def cais(d,x,y,ativo=False):
    # A concha dourada sinaliza o início; os demais cais são círculos de leitura rápida.
    d.polygon([(x-3,y-4),(x+3,y-4),(x+5,y-2),(x+5,y+2),(x+3,y+4),(x-3,y+4),(x-5,y+2),(x-5,y-2)],fill='#203b50')
    d.polygon([(x-3,y-3),(x+3,y-3),(x+4,y-1),(x+4,y+1),(x+2,y+3),(x-2,y+3),(x-4,y+1),(x-4,y-1)],fill='#d88a62' if ativo else '#56827c')
    d.line([(x-2,y-2),(x+2,y-2)],fill='#ffe4a3' if ativo else '#a0ba93')
    d.rectangle((x-1,y-1,x+1,y+1),fill='#ffe4a3' if ativo else '#e8d6a3')
    if ativo:
        d.point((x,y+2),fill='#ffe4a3')

def main():
    if not (FONTES/'arquipelago-base.png').is_file():
        cria_base()
    base=Image.open(FONTES/'arquipelago-base.png').convert('RGBA')
    overlay=Image.new('RGBA',DIM)
    d=ImageDraw.Draw(overlay)
    for rota in ROTAS: pontilhado(d,rota)
    for id_,(x,y) in CAIS.items(): cais(d,x,y,id_=='praia')
    assert set(overlay.getchannel('A').get_flattened_data())=={0,255}
    overlay.save(FONTES/'rotas-e-cais.png',optimize=True)
    final=Image.alpha_composite(base,overlay)
    assert final.size==DIM and set(final.getchannel('A').get_flattened_data())=={255}
    final.save(PROJ/'arquipelago-meia-lua-288.png',optimize=True)
    previa=final.resize((864,648),Image.Resampling.NEAREST)
    assert previa.resize(DIM,Image.Resampling.NEAREST).tobytes()==final.tobytes()
    previa.save(PROJ/'arquipelago-meia-lua-288-3x.png',optimize=True)

if __name__=='__main__':
    main()
