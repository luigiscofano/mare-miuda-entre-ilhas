"""Estudo de arte da Travessia, independente do motor. Execute com Pillow 13."""
from pathlib import Path
from random import Random
from math import sin, cos, pi
from PIL import Image, ImageDraw, ImageFilter

from letras import FONT

FONT = {**FONT, 'É': '00010 00100 11111 10000 11110 10000 11111', 'Ó': '00010 00100 01110 10001 10001 10001 01110'}

PASTA = Path(__file__).parent
L, A = 480, 360
rng = Random(40621)
im = Image.new("RGB", (L, A), "#12547a")
d = ImageDraw.Draw(im)

def forma(pts, cor, dx=0, dy=0):
    d.polygon([(x+dx, y+dy) for x,y in pts], fill=cor)

def linha(pts, cor, largura=1):
    d.line(pts, fill=cor, width=largura)

def caixa(x,y,w,h,cor):
    d.rectangle((x,y,x+w-1,y+h-1), fill=cor)

def letra(s,x,y,cor,sz=1):
    for ch in s:
        for j,row in enumerate(FONT.get(ch,"").split()):
            for i,b in enumerate(row):
                if b=="1": caixa(x+sz*i,y+sz*j,sz,sz,cor)
        x+=6*sz

def agua():
    """Faixas de profundidade e correntes têm geometrias independentes."""
    bandas=[
      ("#216c91",[(0,240),(89,252),(145,265),(221,271),(320,256),(411,218),(480,179),(480,300),(401,326),(219,353),(0,351)]),
      ("#1d608a",[(0,284),(116,300),(210,308),(294,293),(389,270),(480,219),(480,386),(0,386)]),
      ("#237f9b",[(0,96),(82,104),(146,114),(187,134),(227,148),(311,124),(395,113),(480,134),(480,205),(398,241),(310,269),(156,275),(84,254),(0,230)]),
      ("#2a8fa3",[(0,111),(71,117),(133,123),(204,146),(220,158),(307,141),(393,129),(431,147),(480,153),(480,182),(430,207),(362,244),(307,247),(249,258),(144,258),(99,242),(43,231),(0,209)]),
      ("#318da9",[(0,51),(109,56),(214,54),(369,63),(480,67),(480,88),(431,91),(337,78),(191,69),(77,77),(0,79)]),
    ]
    for c,p in bandas: forma(p,c)
    snap=im.copy()
    correntes={
      (18,84,122):("#205f81","#2c7594","#4088a0"),
      (33,108,145):("#257fa1","#3386a4","#569eb2"),
      (29,96,138):("#226f94","#2b789d","#4587a7"),
      (35,127,155):("#297d9b","#3898aa","#60b0bc"),
      (42,143,163):("#2f899f","#42a0b0","#79c2c3"),
      (49,141,169):("#337a9c","#4799b2","#7db7c7"),
    }
    # Arcos finos e incompletos evitam um padrão de ondas repetido na tela.
    for k in range(450):
        x,y=rng.randrange(-35,L-8),rng.randrange(48,333)
        c=correntes[snap.getpixel((max(0,x),y))]
        span=rng.randrange(10,52); amp=rng.uniform(.8,3)
        rs=rng.random()
        if rs<.21 and y<290: col=c[2]
        elif rs<.52: col=c[1]
        else: col=c[0]
        pts=[(x+i,y+round(amp*sin((i/span)*pi))) for i in range(span)]
        linha(pts,col)
        if rs<.16:
            a=rng.randrange(1,span//2); b=min(span,a+rng.randrange(3,14))
            linha([(i,j-1) for i,j in pts[a:b]],c[1])

def reef(p,tons,seed):
    """Cada recife possui um desenho e uma profundidade distintos."""
    x0=min(x for x,_ in p); x1=max(x for x,_ in p); y0=min(y for _,y in p); y1=max(y for _,y in p)
    mask=Image.new("1",(L,A))
    ImageDraw.Draw(mask).polygon(p,fill=1)
    border=mask.filter(ImageFilter.MaxFilter(7))
    im.paste(tons[0],(0,0,L,A),border)
    forma(p,tons[1])
    for k in range(2,5):
        cx=(x0+x1)//2-3*k; cy=(y0+y1)//2-k
        f=1-(k-1)*.16
        pts=[(round(cx+(x-cx)*f),round(cy+(y-cy)*f)) for x,y in p]
        forma(pts,tons[k])
    rr=Random(seed)
    for _ in range({13:155,26:120,35:230,66:70}[seed]):
        x,y=rr.randrange(max(0,x0),min(L,x1)),rr.randrange(max(0,y0),min(A,y1))
        if not mask.getpixel((x,y)): continue
        w=rr.randint(2,{13:6,26:15,35:7,66:18}[seed])
        for j in range(w):
            if x+j < L and mask.getpixel((x+j,y)) and rr.random()>.2:
                d.point((x+j,y),fill=rr.choice(tons[1:]))

def terra(cells, ox, oy, t):
    area=Image.new("1",(L,A))
    a=ImageDraw.Draw(area)
    for x,y in cells: a.rectangle((ox+x*t,oy+y*t,ox+(x+1)*t-1,oy+(y+1)*t-1),fill=1)
    for r,dy,c in [(24,17,"#258d9f"),(19,14,"#399eaa"),(13,15,"#52b6b6"),(8,16,"#72c9bd"),(4,18,"#168b96")]:
        m=Image.new("1",(L,A))
        m.paste(area.filter(ImageFilter.MaxFilter(r+1 if not r%2 else r)),(0,dy))
        im.paste(c,(0,0,L,A),m)
    for i in range(19,0,-1):
        c="#675b60" if i>=17 else "#906f66" if i>=12 else "#ad816c" if i>=8 else "#cca277"
        im.paste(c,(0,i),area)
    # Costas e faces de rocha respeitam os limites do tabuleiro.
    for (x,y),tipo in cells.items():
        X,Y=ox+x*t,oy+y*t
        baixa=tipo=="="
        caixa(X,Y,t,t,"#c9ba88" if baixa else "#edd49a")
        caixa(X,Y,t,1,"#f3e1ab" if baixa else "#fff0b9")
        caixa(X,Y,1,t,"#aaa779" if baixa else "#d6b77f")
        caixa(X,Y+t-1,t,1,"#a29270" if baixa else "#b99a70")
        if (x,y+1) not in cells:
            for i in range(26):
                xx=X+rng.randrange(2,t-5); yy=Y+t+rng.randrange(1,18)
                caixa(xx,yy,min(X+t-xx,rng.randrange(2,13)),1,rng.choice(["#785f63","#a07869","#b68970","#e2b57f"]))
            caixa(X+rng.randrange(0,4),Y+t+4,t-8,1,"#eac291")
            if not baixa: caixa(X+t//3,Y+t+8,t//2,1,"#9a7264")
        # Granulação em pares, em vez de ruído por toda a superfície.
        for _ in range(18):
            xx,yy=rng.randrange(2,t-6),rng.randrange(3,t-3)
            caixa(X+xx,Y+yy,rng.randint(1,4),1,rng.choice(["#d4ba83","#f4dfa6","#d9c28a"] if not baixa else ["#b4af8b","#a8a188","#dfcb9b"]))
        if baixa:
            for i in range(4):
                xx,yy=X+rng.randrange(3,12),Y+5+i*7
                ln=rng.randrange(13,21)
                linha([(xx,yy),(xx+4,yy),(xx+4,yy+1),(xx+ln,yy+1)],"#91a99a")
                caixa(xx+5,yy+2,ln//2,1,"#c7d1ac")
    # Arrebentação irregular em filamentos; só nas bordas reais da ilha.
    for x,y in cells:
        X,Y=ox+x*t,oy+y*t
        for vx,vy in [(0,1),(0,-1),(-1,0),(1,0)]:
            if (x+vx,y+vy) in cells: continue
            for k in range(rng.randrange(2,5)):
                s=rng.randrange(0,27); q=rng.randint(3,10)
                if vy:
                    bx=X+s; by=Y+(-4 if vy<0 else t+21)+rng.randrange(-2,3)
                    linha([(bx,by),(bx+2,by),(bx+2,by+1),(bx+q,by+1)],rng.choice(["#daf3d7","#9de7d4","#e8f7db"]))
                    caixa(bx+3,by+2,2,1,"#8ed7c8")
                else:
                    bx=X+(-5 if vx<0 else t+4)+rng.randrange(-1,2); by=Y+s+5
                    linha([(bx,by),(bx,by+q//2),(bx+vx,by+q//2),(bx+vx,by+q)],"#bae9d3")

def rock(x,y,v):
    if v==0:
        cont=[(1,26),(4,17),(8,15),(8,9),(14,8),(17,2),(23,2),(28,5),(32,12),(34,23),(29,28),(20,31),(7,31)]
        facets=[([(4,17),(8,15),(8,9),(15,8),(18,3),(24,3),(24,9),(19,14),(19,21),(12,24),(7,28),(4,25)],"#a5a795"), ([(10,14),(10,10),(16,10),(19,5),(23,5),(23,8),(18,13),(16,14),(16,19),(10,21)],"#e0daa9"), ([(19,21),(23,17),(27,18),(28,13),(32,14),(33,20),(29,27),(18,30),(13,28)],"#59616b")]
    else:
        cont=[(1,20),(4,14),(10,12),(10,7),(20,7),(20,4),(30,4),(33,8),(33,15),(36,17),(36,24),(26,28),(16,26),(7,28),(1,24)]
        facets=[([(4,15),(11,13),(11,8),(21,8),(21,5),(29,5),(31,8),(27,12),(18,12),(18,16),(11,16),(9,21),(4,21)],"#b3ad88"), ([(14,9),(22,9),(22,6),(29,6),(29,8),(25,10),(17,11),(12,14),(10,14)],"#f0dcaa"), ([(15,23),(21,19),(27,19),(27,16),(32,16),(35,18),(35,23),(29,25),(22,26),(16,25)],"#55636a")]
    forma(cont,"#ad946a",x+1,y+3)
    forma(cont,"#7e887e",x,y)
    for p,c in facets: forma(p,c,x,y)
    if v==0:
        linha([(x+19,y+15),(x+24,y+14),(x+24,y+12),(x+29,y+11)],"#645f60")
        caixa(x+9,y+26,5,1,"#ab9b7f")
    else:
        linha([(x+6,y+22),(x+13,y+22),(x+13,y+20),(x+19,y+19)],"#7e725e")
        caixa(x+21,y+14,6,1,"#c5c291")

def shell(x,y):
    forma([(0,5),(4,1),(13,0),(20,3),(25,10),(23,15),(15,19),(7,17),(1,13)],"#975351",x,y)
    forma([(1,6),(5,2),(14,1),(20,5),(23,10),(18,14),(13,17),(5,14)],"#eca279",x,y)
    forma([(3,5),(9,2),(15,3),(20,7),(14,12),(12,14),(5,10)],"#ffd7aa",x,y)
    linha([(x+14,y+15),(x+10,y+10),(x+6,y+4)],"#ce7855",2)
    linha([(x+16,y+14),(x+15,y+9),(x+12,y+3)],"#bd6d58")
    linha([(x+18,y+13),(x+20,y+9),(x+19,y+7)],"#ae5d56")
    linha([(x+7,y+3),(x+12,y+3),(x+13,y+4)],"#fff0cb")

def cantos(x,y,t,c,l=6):
    for x0,y0,vx,vy in [(x,y,1,1),(x+t-1,y,-1,1),(x,y+t-1,1,-1),(x+t-1,y+t-1,-1,-1)]:
        linha([(x0,y0+vy*l),(x0,y0),(x0+vx*l,y0)],c)

agua()
reef([(-12,155),(14,144),(31,144),(38,136),(59,137),(70,145),(72,156),(60,165),(48,165),(49,179),(30,188),(14,179),(-12,184)],["#328fa3","#3ba4ac","#4eb6b4","#68c2b8","#7bc7b3"],13)
reef([(359,96),(374,91),(403,91),(420,100),(440,102),(462,113),(464,122),(440,133),(419,128),(397,133),(377,128),(363,114)],["#2b899c","#359ba8","#47a9ae","#66bcb8","#85ccb9"],26)
reef([(355,213),(385,195),(406,195),(417,183),(449,177),(480,178),(497,195),(495,222),(471,233),(452,250),(413,258),(390,249),(384,237),(363,234)],["#298599","#3a9ca8","#4aaeb1","#66bdbc","#82cdbd"],35)
reef([(3,271),(29,270),(49,279),(91,278),(104,288),(127,292),(126,303),(100,310),(60,310),(45,301),(18,300),(3,287)],["#227094","#287b9b","#398ca5","#50a3b0","#6ab9b7"],66)
# Espuma sobre recifes em posições singulares.
for a in [[(11,164),(20,161),(32,161),(36,158),(46,158)],[(59,157),(66,154),(66,150)],[(368,110),(374,108),(390,108),(394,105)],[(425,125),(437,128),(449,126),(455,123)],[(395,222),(405,219),(416,219),(420,216),(436,216)],[(454,207),(457,204),(472,204),(479,201)],[(426,249),(440,244),(448,244)],[(67,284),(77,284),(84,287),(92,288)]]:
    linha([(x+1,y+2) for x,y in a],"#70c8c2",2)
    linha(a,"#cbefd5")

# Reflexos coesos por cima da crista: os arcos diferem em extensão e ritmo.
for pontos, c0, c1 in [
    ([(43,124),(52,125),(56,127),(67,129),(75,128),(88,129),(101,134),(113,135)], "#62b9bf", "#aee0ce"),
    ([(381,156),(397,151),(414,151),(424,147),(435,148),(449,153),(469,154),(480,156)], "#57adba", "#8bcbd0"),
    ([(281,289),(297,285),(308,286),(325,282),(334,276),(354,273),(365,268),(380,267)], "#408eaf", "#62abc1"),
    ([(16,219),(31,223),(49,224),(57,222),(66,221),(78,223),(96,227)], "#428fab", "#68b0ba"),
]:
    linha([(x,y+2) for x,y in pontos], c0, 2)
    linha(pontos[1:-1], c0)
    for i in range(1,len(pontos)-1,3): linha(pontos[i:i+2], c1)

grade=("#..H.#","S==.=C","#.####")
ox,oy,t=126,123,38
cells={(x,y):c for y,ls in enumerate(grade) for x,c in enumerate(ls) if c!="#"}
# A face rochosa ocupa o seu quadrado bloqueado, marcando a borda jogável.
cells[0,0]="#"
terra(cells,ox,oy,t)
caixa(ox,oy,t,t,"#d4bf8d")
rock(ox+2,oy+3,0)
rock(ox+t*3,oy+5,1)
cantos(ox+2,oy+2,t-4,"#fff2b9")
for x,y in [(2,0),(1,1)]:
    cantos(ox+x*t+3,oy+y*t+3,t-6,"#9a795b",5)
cantos(ox+t+2,oy+2,t-4,"#e9a65c")
tx,ty=ox+5*t,oy+t
for dx,dy in [(4,13),(31,10),(29,25),(9,28),(18,4)]:
    caixa(tx+dx,ty+dy,2,1,"#fff5cc")
cantos(tx+2,ty+2,t-4,"#c78560",7)
shell(tx+7,ty+8)
siri=Image.open(PASTA/"siri-fase.png").convert("RGBA")
anchor=(ox+t+1,oy+2)
alpha=siri.getchannel("A")
assert set(alpha.get_flattened_data())=={0,255}
im.paste(siri,anchor,alpha)
for y in range(siri.height):
    for x in range(siri.width):
        pixel=siri.getpixel((x,y))
        if pixel[3]: assert im.getpixel((x+anchor[0],y+anchor[1]))==pixel[:3]

# Moldura do protótipo editorial; não usa posições ou lógica novas.
caixa(0,0,L,64,"#15394f")
caixa(0,62,L,2,"#6faeb0")
letra("TRAVESSIA",18,14,"#ffedbb",2)
letra("TRILHA DAS PEDRAS",18,42,"#9fd2cb")
caixa(274,11,187,41,"#234a60")
caixa(274,11,187,1,"#39868d")
letra("MARÉ BAIXA",288,21,"#fff0bd")
letra("VIRA NO PRÓXIMO PASSO",288,37,"#b0d5ce")
for i in range(3):
    caixa(394+i*20,19,14,6,"#e5bb7a" if i<2 else "#466979")
    caixa(394+i*20,19,14,1,"#ffe8a8" if i<2 else "#7898a2")

caixa(0,320,L,40,"#15394f")
caixa(0,320,L,2,"#6faeb0")
for i,key in enumerate("WASD"):
    caixa(16+19*i,330,16,16,"#2b6571")
    caixa(16+19*i,330,16,1,"#66a7a5")
    letra(key,21+19*i,335,"#ffedc3")
letra("UMA CASA POR PASSO",107,335,"#bee0d6")
shell(326,330)
letra("ALCANCE A CONCHA",362,336,"#ffedc3")

src=PASTA/"travessia-v4-1x.png"
im.save(src,optimize=True)
zoom=im.resize((L*2,A*2),Image.Resampling.NEAREST)
assert zoom.resize(im.size,Image.Resampling.NEAREST).tobytes()==im.tobytes()
zoom.save(PASTA/"travessia-v4.png",optimize=True)
print(im.size,len(im.getcolors(1024)),anchor)
