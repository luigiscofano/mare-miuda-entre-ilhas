"""Duas prévias estáticas de Travessia; execute com Python e Pillow 13."""
from pathlib import Path
from random import Random
from math import hypot, sin, cos, atan2
from PIL import Image, ImageDraw
from letras import FONT

PASTA = Path(__file__).parent
L, A, T = 480, 360, 38
FONT = {**FONT, 'É': '00010 00100 11111 10000 11110 10000 11111',
        'Á': '00010 00100 01110 10001 11111 10001 10001'}
PRAIA = dict(nome="TRILHA DAS PEDRAS", mapa=("#..H.#","S==.=C","#.####"), siri=(1,0),
             bloqueio=(0,0), ox=126, oy=132, seed=6094,
             agua=("#164266","#185677","#1e6d87","#287e92","#37989e","#4caea8","#68c2b3","#8bd3be"),
             chão=("#efda98","#fff0b1","#d1b57e","#baab83","#dbc891","#8f9f91"),
             pedra=("#645d65","#886961","#a8836c","#c4a77b","#e3bc86","#f2d2a0"),
             foco=(143,157), direcao=1, cenário="praia")
RECIFE = dict(nome="ACIMA DA ESPUMA", mapa=("S=H==C","##.###"), siri=(0,0),
              bloqueio=None, ox=126, oy=145, seed=2017,
              agua=("#192e59","#1d3e66","#215678","#256a85","#318495","#429ca2","#65b3ad","#82c7ba"),
              chão=("#cec9a7","#e9e2b7","#a7a47f","#a7b79d","#c8cba6","#759e9b"),
              pedra=("#494b6a","#63586f","#7b6880","#a3818b","#c4a198","#d9baad"),
              foco=(276,186), direcao=-1, cenário="recifes")

def desenho(cfg):
    agua, chão, pedra = (cfg[k] for k in ("agua","chão","pedra"))
    ox,oy=cfg["ox"],cfg["oy"]
    rng=Random(cfg["seed"])
    image=Image.new("RGB",(L,A),agua[0]); d=ImageDraw.Draw(image)
    def box(x,y,w,h,c):
        if w>0 and h>0:d.rectangle((x,y,x+w-1,y+h-1),fill=c)
    def poly(p,c,x=0,y=0): d.polygon([(a+x,b+y) for a,b in p],fill=c)
    def line(p,c,n=1): d.line(p,fill=c,width=n)
    def word(s,x,y,c,k=1):
        for ch in s:
            for j,row in enumerate(FONT.get(ch,"").split()):
                for i,v in enumerate(row):
                    if v=="1":box(x+i*k,y+j*k,k,k,c)
            x+=6*k
    cel={(x,y):c for y,s in enumerate(cfg["mapa"]) for x,c in enumerate(s) if c!="#"}
    solo=set(cel)
    if cfg["bloqueio"]:solo.add(cfg["bloqueio"])
    caixas=[(ox+x*T,oy+y*T,ox+(x+1)*T-1,oy+(y+1)*T+18) for x,y in solo]
    def dist(x,y):
        return min(hypot(max(a-x,0,x-c),max(b-y,0,y-e)) for a,b,c,e in caixas)
    # O fundo submarino escurece com a distância da ilha, sem raias retas.
    px=image.load()
    for y in range(56,325):
        for x in range(L):
            r=dist(x,y)
            mod=10*sin(x*.025+y*.031)+8*sin(y*.053-x*.009)
            # A plataforma submarina se abre para a enseada a leste.
            if cfg["direcao"]==1:mod-=39*max(0,(x-260)/220)*max(0,1-abs(y-259)/74)
            else:mod-=33*max(0,(270-x)/270)*max(0,1-abs(y-222)/91)
            faixa=sum(r+mod > lim for lim in (7,19,36,59,86,134,183))
            px[x,y]=tuple(bytes.fromhex(agua[7-faixa][1:]))
    # Recifes diferentes em forma, topografia, escala e cor.
    fundos=(
        [[(-20,135),(18,125),(34,131),(51,124),(75,134),(81,146),(64,160),(39,157),(32,169),(10,164),(-11,178)],
         [(364,109),(375,91),(401,83),(412,88),(421,100),(449,111),(468,108),(483,119),(487,141),(468,149),(450,138),(426,134),(410,118),(383,121)],
         [(335,262),(368,253),(382,235),(427,232),(461,206),(492,217),(500,252),(484,274),(469,284),(448,283),(420,300),(386,303),(353,286)]]
        if cfg["direcao"]==1 else
        [[(-10,242),(12,223),(38,222),(60,209),(80,219),(83,237),(104,252),(93,275),(69,275),(41,293),(16,283),(-12,288)],
         [(309,102),(344,92),(363,103),(387,96),(410,112),(412,123),(369,127),(354,118),(325,120)],
         [(368,237),(394,216),(434,217),(464,194),(493,192),(499,238),(472,253),(450,245),(436,264),(405,253),(382,259)]])
    for i, pts in enumerate(fundos):
        xc=sum(a for a,b in pts)/len(pts); yc=sum(b for a,b in pts)/len(pts)
        for j,f in enumerate((1.07,1,.78,.52,.31)):
            pp=[(round(xc+(x-xc)*f),round(yc+(y-yc)*f)) for x,y in pts]
            poly(pp,agua[min(7,2+i+j)])
        m=Image.new("1",image.size)
        ImageDraw.Draw(m).polygon(pts,fill=1)
        # Fendas ramificadas seguem a rocha submersa; as manchas não são ladrilhos.
        for j in range((25,17,41)[i]):
            x=rng.randrange(max(0,min(a for a,b in pts)), min(L,max(a for a,b in pts)))
            y=rng.randrange(min(b for a,b in pts), max(b for a,b in pts))
            largo=rng.randrange(5,(18,32,27)[i])
            col=rng.choice(agua[3:7])
            for s in range(largo):
                xi=x+s
                yi=y+round(2*sin(s*.14+x*.07))+s//(5+i*4)
                if xi<L and m.getpixel((xi,yi)):
                    d.point((xi,yi), fill=col)
    # O fluxo se estreita em torno das enseadas e se alonga em mar aberto.
    amostra=image.copy()
    cores=[tuple(bytes.fromhex(c[1:])) for c in agua]
    for _ in range(400):
        x,y=rng.randrange(-22,L-7),rng.randrange(65,318)
        rx=max(0,x); r=dist(rx,y)
        tamanho=rng.randrange(7,24) if r<42 else rng.randrange(12,42)
        p=[]; dy=rng.uniform(-.7,.75)
        for i in range(tamanho):
            xi=x+i
            a=atan2(y-cfg["foco"][1],rx-cfg["foco"][0]+.01)
            yi=y+round(1.7*sin(i*.15+x*.009)+dy*cos(a)*i*.16)
            p.append((xi,yi))
        rgb=amostra.getpixel((rx,y))
        idx=min(range(8),key=lambda n:sum((s-t)**2 for s,t in zip(rgb,cores[n])))
        brilho=rng.random()
        linha=agua[min(7,max(0,idx+(1 if brilho<.25 else -1)))]
        line(p,linha)
        if brilho<.09 and r<85:
            a=rng.randint(0,max(0,tamanho-8))
            line([(u,v-1) for u,v in p[a:a+5]],"#a4d6c8")
    # Faixas de refração curtas, ancoradas nos bancos submarinos.
    for x,y,l in ((32,149,28),(64,152,19),(405,109,38),(452,120,25),(380,263,40),(431,245,24),(460,257,31)) if cfg["direcao"]==1 else ((36,238,30),(68,254,16),(330,110,42),(377,119,22),(413,236,30),(457,226,17)):
        p=[(x+i,y+round(2*sin(i/l*3.14)+sin(i*.25))) for i in range(l)]
        line(p,"#8acac1")
        line(p[l//4:l//2],"#b1dfcd")
    # Nas extremidades da plataforma, arcos de água iluminada
    # curvam ao longo da corrente costeira, em vez de contornar todas as casas.
    curvas=( [(220,110,75,1.8),(348,224,77,4.3),(287,285,95,5.7),(52,188,54,-4.0)]
            if cfg["direcao"]==1 else
            [(140,108,93,-5.6),(333,173,74,4.6),(229,246,89,6.7),(35,203,72,-4.6)] )
    for x,y,w,k in curvas:
        p=[(x+i,y+round(k*sin(i/w*3.14)+.065*i)) for i in range(w)]
        line(p,agua[5])
        line([(a,b-1) for a,b in p[w//4:w//2]],agua[6])
        line([(a,b-2) for a,b in p[w//3:w//2-2]],"#b2dbca")
    # O mar recua visualmente, em paleta curta e contrastes discretos.
    # A amostragem não consome o gerador do solo: tabuleiro, areia,
    # indicadores, espuma costeira e siri ficam idênticos ao estudo V5.
    dominante = (
        ("#246d87","#27758b","#2d7f91","#338994","#3e959e")
        if cfg["direcao"]==1 else
        ("#285a7a","#2d6280","#316e88","#35778e","#3c8595")
    )
    for y in range(56,325):
        for x in range(L):
            r = dist(x,y)
            borda = 11*sin(x*.013+y*.025)+5*sin(x*.018-y*.013)
            faixa = 4-sum(r+borda>lim for lim in (8,18,38,92))
            px[x,y]=tuple(bytes.fromhex(dominante[faixa][1:]))
    if cfg["direcao"]==-1:
        poly([(361,203),(383,197),(401,200),(426,186),(462,186),(475,200),
              (467,211),(440,214),(426,229),(405,231),(385,222),(367,222)],
             "#326f88")
        poly([(382,210),(401,205),(420,199),(438,193),(456,194),(462,201),
              (449,206),(432,209),(415,219),(399,219)],"#36778d")
    brisa=Random(cfg["seed"]+73)
    for _ in range(58):
        x,y=brisa.randrange(12,L-30),brisa.randrange(70,311)
        r=dist(x,y)
        if r<19:continue
        atual=tuple(px[x,y])
        cores=[tuple(bytes.fromhex(c[1:])) for c in dominante]
        idx=min(range(5),key=lambda k:sum(abs(a-b) for a,b in zip(atual,cores[k])))
        if idx>=4:continue
        l=brisa.randrange(5,23)
        cor=tuple(min(255,canal+brisa.randrange(3,7)) for canal in atual)
        pontos=[(x+i,y+round(1.2*sin(i/l*3.14))) for i in range(l)]
        line(pontos, cor)
    # Terra lógica: área jogável continua ortogonal em células inteiras.
    for dep in range(23,0,-1):
        for x,y in sorted(solo):
            if (x,y+1) in solo:continue
            x0,y0=ox+x*T,oy+(y+1)*T
            inset=(dep//9 if (x-1,y) not in solo else 0)
            extr=dep//12 if (x+1,y) not in solo else 0
            col=pedra[0 if dep>20 else 1 if dep>16 else 2 if dep>11 else 3 if dep>5 else 4]
            box(x0+inset,y0+dep-1,T-inset-extr,1,col)
    for x,y in sorted(solo):
        X,Y=ox+x*T,oy+y*T
        v=cel.get((x,y),"#")
        baixa=v=="="
        box(X,Y,T,T,chão[3 if baixa else 0])
        box(X,Y,T,1,chão[4 if baixa else 1])
        box(X,Y,1,T,chão[2])
        if (x,y+1) not in solo:
            for j in range(14):
                z=rng.randrange(0,28)
                w=rng.randrange(3,min(13,T-z))
                k=rng.randrange(1,21)
                if k<5:col=pedra[5]
                elif k<15:col=rng.choice(pedra[1:4])
                else:col=rng.choice(pedra[:3])
                line([(X+z,Y+T+k),(X+z+w//2,Y+T+k),(X+z+w//2+1,Y+T+k+1),(X+z+w,Y+T+k+1)],col)
            # As espumas afloram de fraturas diferentes, não de todo contorno.
            for j in range(rng.randrange(1,4)):
                z=rng.randrange(3,27); q=rng.randrange(3,12)
                y0=Y+T+25+rng.randrange(-1,3)
                line([(X+z,y0),(X+z+q//2,y0),(X+z+q//2+1,y0-1),(X+z+q,y0-1)],"#dcf0d6")
        if (x-1,y) not in solo:
            box(X,Y,2,T,chão[1])
        if (x+1,y) not in solo:
            box(X+T-2,Y,2,T,chão[2])
        if baixa:
            for j in range(5):
                u=rng.randrange(3,11); w=rng.randrange(9,22); yy=Y+4+j*6
                line([(X+u,yy),(X+u+3,yy),(X+u+4,yy+1),(X+u+w,yy+1)],chão[5])
                box(X+u+6,yy+2,w//3,1,chão[4])
        else:
            # Microdesenhos discretos, deslocados de célula para célula.
            for _ in range(10):
                u=rng.randrange(2,T-6); q=rng.randrange(3,T-3)
                box(X+u,Y+q,rng.randrange(1,5),1,rng.choice(chão[1:3]))
    def rock(X,Y,alto):
        if alto and cfg["direcao"]==-1:
            # O recife tem o mesmo papel de refúgio, com uma silhueta própria.
            c=[(1,25),(4,20),(9,19),(9,13),(14,13),(14,11),(20,11),(20,5),(26,6),(29,11),(32,12),(35,18),(36,25),(31,29),(16,31),(8,29)]
            poly(c,"#9a9788",X+1,Y+3)
            poly(c,"#7e8f8e",X,Y)
            poly([(3,25),(9,21),(14,22),(15,18),(19,19),(22,14),(25,14),(28,9),(32,13),(35,19),(35,25),(29,28),(16,30),(7,27)],"#566a77",X,Y)
            poly([(6,22),(10,18),(10,14),(15,14),(15,12),(21,12),(21,7),(25,7),(28,12),(24,15),(20,17),(16,17),(13,22)],"#bebcb0",X,Y)
            line([(X+20,Y+10),(X+22,Y+8),(X+25,Y+8),(X+26,Y+10)],"#ece4bd",2)
            line([(X+13,Y+23),(X+17,Y+22),(X+19,Y+21)],"#aeb6aa")
            line([(X+26,Y+23),(X+29,Y+23),(X+30,Y+21)],"#ac9692")
            return
        if alto:
            cont=[(2,24),(4,17),(8,14),(9,10),(15,9),(16,5),(25,4),(29,7),(32,15),(35,17),(35,24),(30,28),(18,31),(8,29)]
            f1=[(5,19),(10,15),(10,11),(17,11),(17,6),(25,5),(29,9),(27,12),(22,13),(20,18),(14,20),(11,25),(7,25)]
            f2=[(12,13),(18,11),(19,7),(24,6),(27,8),(25,11),(20,12),(18,16),(13,19)]
            f3=[(17,27),(21,24),(24,18),(28,18),(30,14),(33,18),(34,23),(29,27),(20,29)]
        else:
            cont=[(1,24),(5,16),(10,16),(10,12),(16,12),(16,6),(21,5),(24,3),(28,4),(30,9),(30,13),(34,16),(35,22),(31,28),(23,31),(7,30)]
            f1=[(5,23),(8,18),(14,18),(13,13),(19,13),(19,7),(24,4),(28,6),(28,11),(24,14),(22,18),(18,19),(17,24),(11,27),(7,26)]
            f2=[(16,16),(20,13),(20,8),(25,6),(27,7),(26,10),(23,12),(21,15),(18,18)]
            f3=[(18,28),(20,25),(24,24),(25,19),(29,14),(32,16),(34,21),(30,27),(23,29)]
        poly(cont,chão[2],X+1,Y+3)
        p=("#4c6270","#778884","#a9ad8f","#e2dcb0") if alto else ("#555665","#7f8883","#afb092","#e9dfa9")
        poly(cont,p[1],X,Y)
        poly(f3,p[0],X,Y);poly(f1,p[2],X,Y);poly(f2,p[3],X,Y)
        if alto:
            line([(X+24,Y+13),(X+21,Y+16),(X+21,Y+18),(X+18,Y+21)],"#7a8979")
            box(X+11,Y+25,6,1,"#c1b398")
        else:
            line([(X+28,Y+12),(X+24,Y+16),(X+23,Y+20),(X+21,Y+22)],"#646c71")
            box(X+8,Y+27,5,1,"#a99d7f")
    def cantos(x,y,c,k=5):
        X,Y=ox+x*T+2,oy+y*T+2
        for a,b,v,w in [(X,Y,1,1),(X+T-5,Y,-1,1),(X,Y+T-5,1,-1),(X+T-5,Y+T-5,-1,-1)]:
            line([(a,b+w*k),(a,b),(a+v*k,b)],c)
    def shell(X,Y):
        poly([(0,7),(3,3),(9,1),(16,0),(22,4),(26,10),(24,16),(19,19),(11,18),(3,14)],"#905052",X,Y)
        poly([(1,7),(5,3),(12,1),(19,2),(24,7),(24,12),(20,15),(12,17),(5,13)],"#e9946e",X,Y)
        poly([(2,6),(7,2),(15,1),(20,5),(20,9),(15,12),(11,14),(4,11)],"#ffca94",X,Y)
        line([(X+14,Y+15),(X+10,Y+9),(X+7,Y+4)],"#c9785e",2)
        line([(X+18,Y+14),(X+17,Y+9),(X+13,Y+3)],"#c37566")
        line([(X+22,Y+12),(X+22,Y+8),(X+18,Y+4)],"#bd6d59")
        line([(X+5,Y+5),(X+8,Y+3),(X+11,Y+3)],"#fff0c4")
    for (x,y), c in cel.items():
        X,Y=ox+x*T,oy+y*T
        if c=="H": rock(X+1,Y+3,True)
        if c=="C":
            shell(X+6,Y+9)
            cantos(x,y,"#c87958",6)
            for a,b in [(28,7),(6,29),(30,27)]:box(X+a,Y+b,2,1,"#fff1cb")
    if cfg["bloqueio"]:
        x,y=cfg["bloqueio"]
        rock(ox+x*T+1,oy+y*T+3,False)
        cantos(x,y,"#fff1b7")
    sx,sy=cfg["siri"]
    for x,y in [(sx+1,sy),(sx-1,sy),(sx,sy+1),(sx,sy-1)]:
        if (x,y) in cel:cantos(x,y,"#9c7f65",4)
    cantos(sx,sy,"#e9a464",6)
    siri=Image.open(PASTA/"siri-logo.png").convert("RGBA")
    xy=(ox+sx*T+(T-siri.width)//2,oy+sy*T+30-siri.height)
    alpha=siri.getchannel("A")
    assert set(alpha.get_flattened_data())=={0,255}
    image.paste(siri,xy,alpha)
    for x in range(siri.width):
        for y in range(siri.height):
            sr=siri.getpixel((x,y))
            if sr[3]:assert image.getpixel((xy[0]+x,xy[1]+y))==sr[:3]
    box(0,0,L,57,"#16374b")
    box(0,55,L,2,"#5c999e")
    word(cfg["nome"],19,15,"#ffebbb",2)
    word("TRAVESSIA",20,38,"#a9d3cb")
    box(331,11,132,35,"#214b60")
    box(331,11,132,1,"#5c999e")
    word("MARÉ BAIXA",343,20,"#ffebbb")
    passo=2 if cfg["bloqueio"] else 0
    for i in range(3):
        box(406+i*14,21,10,4,"#e3b986" if i<passo else "#52717e")
    word("PASSOS DA VIRADA",343,32,"#b9d7ce")
    box(0,321,L,39,"#16374b")
    box(0,321,L,2,"#5c999e")
    for i,v in enumerate("WASD"):
        box(17+21*i,330,17,17,"#285a6a")
        box(17+21*i,330,17,1,"#6baba9")
        word(v,23+21*i,335,"#ffebbb")
    word("UMA CASA POR PASSO",115,335,"#c1e1d7")
    shell(325,329)
    word("ALCANCE A CONCHA",362,335,"#ffebbb")
    nome="travessia-v7-"+cfg["cenário"]
    image.save(PASTA/(nome+"-1x.png"),optimize=True)
    zoom=image.resize((L*2,A*2),Image.Resampling.NEAREST)
    assert zoom.resize(image.size,Image.Resampling.NEAREST).tobytes()==image.tobytes()
    zoom.save(PASTA/(nome+".png"),optimize=True)
    print(nome, image.size, len(image.getcolors(1024)))

if __name__=="__main__":
    desenho(PRAIA)
    desenho(RECIFE)
