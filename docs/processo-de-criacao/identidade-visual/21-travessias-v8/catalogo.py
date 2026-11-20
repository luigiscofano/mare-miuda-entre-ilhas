import json
from itertools import product
from PIL import Image,ImageDraw
from desenhar import P, shell, text, N
fases=json.loads((P/'fases.json').read_text())
combinacoes=[(i%6,(i//6+i%6*5)%6) for i in range(36)]
especiais={'praia-fio-de-areia':(0,2),'recife-pedra-firme':(2,1)}
livres=iter(v for v in combinacoes if v not in especiais.values())
atlas=Image.new('RGB',(488,396),'#102e40')
d=ImageDraw.Draw(atlas)
text(d,(12,10),'CONCHAS ENTRE ILHAS',k=2)
text(d,(14,30),'NUMEROS NA ORDEM DA FICHA','#bfdcdb')
out=P/'siris-conchas';out.mkdir(exist_ok=True)
vistos=set()
for i,f in enumerate(fases):
    forma=especiais[f['id']] if f['id'] in especiais else next(livres)
    img=shell(*forma)
    assert img.tobytes() not in vistos and set(img.getchannel('A').getdata())=={0,255}
    vistos.add(img.tobytes())
    f['forma']=forma
    img.save(out/(f['id']+'.png'))
    x,y=13+(i%6)*79,46+(i//6)*55
    d.rounded_rectangle((x,y,x+68,y+48),radius=3,fill='#1c4050',outline='#3a6270')
    atlas.paste(img,(x+18,y+5),img.getchannel('A'))
    text(d,(x+7,y+37),f'{i+1:02d}', '#f9d688' if f['uso']=='concha' else '#b0cdd0')
text(d,(14,382),'OURO: OBJETIVO DE CONCHA    AZUL: RESERVA VISUAL','#bfdcdb')
atlas.resize((976,792),N).save(P/'catalogo-conchas.png')
(P/'conchas-por-fase.json').write_text(json.dumps(fases,ensure_ascii=False,indent=2)+'\n')
assert len(vistos)==len(fases)==36
