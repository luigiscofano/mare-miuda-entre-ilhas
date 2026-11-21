"""Entre Ilhas: três estudos reproduzíveis, com duas grades de cenário."""
from pathlib import Path
from random import Random
from PIL import Image, ImageDraw
import base as b

PASTA=Path(__file__).parent
DESTINO=PASTA/'renders'
MAR_S='#256c73'
ESPUMA='#b5ddae'
AREIA='#f0c58b'
LUZ='#cfdfaa'
PEDRA='#485f61'

def pano_fino(im):
    """Cria o suporte 2×. O detalhamento subsequente é redesenhado na nova grade."""
    return im.resize((772,544),Image.Resampling.NEAREST).convert('RGBA')

def traco(im,pts,cor,peso=1):
    ImageDraw.Draw(im).line(pts,fill=cor,width=peso)

def forma(im,pts,cor,borda=None):
    ImageDraw.Draw(im).polygon(pts,fill=cor,outline=borda)

def centro_preenchido(im,p,cor):
    return im.getpixel(p)[:3]==tuple(bytes.fromhex(cor[1:]))

def água_fina(im,seed):
    rng=Random(seed)
    # Todos os reflexos pertencem a células únicas e param antes da faixa costeira.
    for _ in range(410):
        x,y=rng.randrange(15,757),rng.randrange(104,459)
        n=rng.choice((2,3,5,7,9,12))
        if all(centro_preenchido(im,(x+dx,y),'#2b777e') for dx in range(n)):
            traco(im,[(x,y),(x+n-1,y)],rng.choice(('#367e82','#4a918b','#367e82','#57a196')))
            if n>8:
                traco(im,[(x+2,y+2),(x+n-4,y+2)],'#347c81')

def ondas(im, pontos):
    for x,y in pontos:
        traco(im,[(x-12,y+3),(x-8,y+3),(x-5,y),(x-3,y-2),(x+4,y-2),(x+7,y),(x+10,y)],'#70b2a0')
        traco(im,[(x-9,y+4),(x-6,y+4),(x-3,y+2),(x+3,y+2)],'#519d94')
        traco(im,[(x-3,y-2),(x+1,y-2)],'#9cccaa')

def detalhes_areia(im,seed):
    rng=Random(seed)
    # Pontos de poucos pixels agrupados pelo terreno, não um filtro espalhado na tela.
    for _ in range(7800):
        x,y=rng.randrange(48,726),rng.randrange(112,448)
        cor=im.getpixel((x,y))[:3]
        if cor in ((247,214,152),(230,180,119),(244,203,142)) and rng.randrange(8)==0:
            if (x+y)%6:
                traco(im,[(x,y),(x+rng.randrange(1,3),y)],rng.choice(('#d8ac74','#fce4ad','#e0b578')))
        if cor in ((66,135,103),(94,155,104)) and rng.randrange(15)==0:
            traco(im,[(x,y+1),(x+1,y-2),(x+2,y+1)],rng.choice(('#58966f','#649b6b','#4d8f69')))

def granito(im,x,y,w,h,faceta=0):
    """Pedras roliças e partidas, com plano superior quente e base fria."""
    a=x-w//2
    forma(im,[(a-2,y+3),(x-6,y+1),(x+w//2+6,y+1),(x+w//2+4,y+6),(a+1,y+8)],'#526f58')
    forma(im,[(a,y),(a+1,y-h//2),(a+w//4,y-h+2),(x+2,y-h),(x+w//3,y-h+4),(x+w//2,y-4),(x+w//3,y+3),(x-4,y+5)],'#415b5c','#294c54')
    forma(im,[(a+1,y-3),(a+3,y-h//2),(a+w//4,y-h+3),(x+1,y-h+1),(x+w//3,y-h+5),(x+w//3,y-5),(x+4,y-2),(x-5,y-3)],'#87917c')
    forma(im,[(a+3,y-h//2),(a+w//4,y-h+3),(x-2,y-h+2),(x+3,y-h+4),(x-4,y-h//2+1)],'#b3ae89')
    traco(im,[(x+faceta,y-h+4),(x+faceta+3,y-h//2),(x-2+faceta,y-3)],'#d3c095')
    traco(im,[(x-6,y+1),(x+2,y+2),(x+w//3,y-1)],'#526f65')

def folha_fina(im,x,y,r,v):
    col=('#82aa70','#86b47b','#6b9e6e')[v%3]
    x0=x-r
    forma(im,[(x0,y+1),(x0+1,y-3),(x-r//2,y-5),(x-r//3,y-9),(x+1,y-10),(x+4,y-6),(x+r-2,y-4),(x+r,y+1),(x+3,y+4),(x-r//2,y+4)],'#367c60')
    forma(im,[(x0+1,y),(x0+3,y-3),(x-r//2,y-4),(x-r//3,y-8),(x+1,y-9),(x+4,y-5),(x+r-2,y-2),(x+2,y+2),(x-r//2,y+3)],col)
    traco(im,[(x-r//2,y-3),(x-r//3,y-6),(x+1,y-7),(x+3,y-5)],'#adc380')

def faixa_rocha(im,x,y,pts,cor):
    traco(im,[(x+a,y+c) for a,c in pts],cor)

def picos(im,x,y):
    for dx,dy,r,h in [(-27,6,27,49),(0,-4,30,76),(24,16,24,42)]:
        xx=x+dx;yy=y+dy
        forma(im,[(xx-r,yy+8),(xx-r//2,yy-h//2),(xx+2,yy-h),(xx+8,yy-h+8),(xx+r,yy+5),(xx+5,yy+14)],'#466766','#2b5058')
        forma(im,[(xx-r+1,yy+7),(xx-r//2+1,yy-h//2),(xx+2,yy-h),(xx+1,yy-h//2+5),(xx-3,yy-1),(xx+6,yy+12)],'#8ba58f')
        forma(im,[(xx+2,yy-h),(xx+8,yy-h+8),(xx+18,yy-h//2+3),(xx+9,yy-h//2-3),(xx+3,yy-h//2-2),(xx+2,yy-h//2+5),(xx-5,yy-h//2+4),(xx-9,yy-h//2-3)],'#e0ead1')
        forma(im,[(xx+2,yy-h),(xx+8,yy-h+8),(xx+18,yy-h//2+3),(xx+7,yy-h//2-4),(xx+3,yy-h//2-2)],'#96b6b3')
        traco(im,[(xx-r//2,yy+2),(xx-r//2+2,yy-7),(xx-4,yy-12)],'#bcc4a0')
        traco(im,[(xx+8,yy-12),(xx+13,yy-5),(xx+15,yy-7),(xx+19,yy-2)],'#628584')

def cristal(im,x,y,h,w,d):
    """O perfil inclinado muda com o cristal; os dois planos não compartilham cor."""
    k=w//2;tip=x+d; top=y-h
    forma(im,[(x-k,y-4),(x-k-2,top+9),(tip,top),(tip+k+4,top+5),(x+k,y-3),(x+1,y+2)],'#6f8bbd','#34546f')
    forma(im,[(x-k+1,y-5),(x-k-1,top+10),(tip,top+1),(x+2,top+11),(x,y-1)],'#b9d8df')
    forma(im,[(x+2,top+11),(tip+k+3,top+6),(x+k-1,y-4),(x+1,y+1)],'#5778ad')
    forma(im,[(tip,top+1),(tip+k+3,top+5),(x+2,top+11),(x-k-1,top+9)],'#e5ecd4')
    traco(im,[(x-k+2,top+15),(x-k+2,top+22)],'#e5ecdf')

def arquipelago():
    # Mesmos centros e ligações da rodada aprovada; as novas faces têm 1 px da grade mais fina.
    original=b.mundo()
    im=pano_fino(original)
    água_fina(im,1661)
    detalhes_areia(im,7833)
    ondas(im,[(105,173),(259,136),(384,158),(530,277),(566,342),(686,269),(186,421),(732,331)])
    picos(im,407,270)
    # Vinha verde, faixas da falésia, água corrente e minerais nas demais ilhas.
    for pt in ((115,330,7,0),(128,322,8,1),(167,363,6,2),(121,367,6,1),(153,324,8,0)):
        folha_fina(im,*pt)
    for x,y in [(226,211),(234,221),(258,215),(274,214),(267,201)]:
        faixa_rocha(im,x,y,[(-8,-2),(-5,-3),(0,-3),(3,-1),(7,0)],'#a6ad8e')
    for x,y in [(269,211),(274,217),(285,229),(289,230)]:
        traco(im,[(x,y),(x+2,y+2),(x+5,y+2)],'#c8e1bd')
    for pts,c in [([(-52,19),(-33,16),(-19,14),(-7,16),(3,13),(16,16),(33,19),(48,18)],'#704950'),([(-48,22),(-33,20),(-16,22),(-2,19),(11,21),(27,23),(41,25)],'#c1876a'),([(-31,-5),(-21,-6),(-9,-3),(1,-6),(13,-4),(22,-2),(33,2)],'#b67b58'),([(-19,-24),(-7,-27),(3,-25),(12,-30),(20,-25)],'#b6825f')]:
        faixa_rocha(im,328,384,pts,c)
    traco(im,[(335,345),(337,351),(335,357),(339,364),(337,374),(344,381),(343,392),(349,400),(359,406)],'#ffd98d',2)
    for n in range(3):
        traco(im,[(460+n*3,142+n*2),(465+n*4,152+n),(479,156+n*2),(491+n*2,154+n)],'#8dceb0')
    for x,y in [(575,181),(598,154),(603,168),(620,178),(642,197),(642,212),(630,227)]:
        faixa_rocha(im,x,y,[(-8,3),(-4,1),(1,1),(4,0),(9,2)],'#a1a88d')
    for x,y in [(609,330),(622,311),(665,323),(665,342)]:
        traco(im,[(x-6,y),(x-2,y-2),(x+3,y-2),(x+8,y)],'#b68367')
    for x,y,h,w,d in [(676,145,20,7,-4),(687,137,37,14,-7),(702,152,49,13,3),(721,152,43,13,4),(730,144,26,8,6),(738,154,16,6,3)]:
        cristal(im,x,y,h,w,d)
    # Recoloca marcos da navegação sobre os novos planos geométricos.
    for i,(x,y) in enumerate([(72,174),(126,100),(164,192),(203,136),(242,70),(300,103),(319,174),(355,71)],1):
        rec=original.crop((x-5,y-5,x+6,y+6)).resize((22,22),Image.Resampling.NEAREST)
        im.paste(rec,(2*x-10,2*y-10))
    rec=original.crop((350,42,367,64)).resize((34,44),Image.Resampling.NEAREST)
    # O farol não impõe paleta às facetas. Só preserva seus próprios pixels.
    for yy in range(rec.height):
        for xx in range(rec.width):
            c=rec.getpixel((xx,yy))
            if c in ((255,241,187),(220,108,95),(214,118,99),(21,54,68)):
                im.putpixel((700+xx,84+yy),c+(255,))
    return im

def seletor():
    # Sem bem-te-vi. O cenário ganha resolução, o siri é composto depois sem reamostragem.
    desenho_siri=b.crab
    desenho_bemtevi=b.bemtevi
    b.crab=lambda *_:None
    b.bemtevi=lambda *_:None
    try:
        im=pano_fino(b.praia())
    finally:
        b.crab=desenho_siri
        b.bemtevi=desenho_bemtevi
    água_fina(im,530)
    detalhes_areia(im,520)
    ondas(im,[(71,225),(78,405),(135,195),(175,458),(418,468),(515,463),(687,357),(729,267),(719,195),(522,102)])
    for i,(x,y,r) in enumerate([(238,157,8),(247,163,10),(331,173,9),(351,175,10),(435,185,11),(498,190,10),(535,151,12),(558,143,10),(569,153,12),(603,135,10),(627,141,10),(87,263,9),(128,243,7),(180,370,10),(204,409,8),(326,388,9),(343,390,9),(659,260,7),(687,276,11)]):
        folha_fina(im,x,y,r,i)
    for pt in [(143,398,26,22,-2),(587,329,33,23,3),(611,341,12,11,-1),(116,399,13,9,-3),(521,359,10,8,2)]:
        granito(im,*pt)
    for points,col in [([(194,221),(210,208),(231,207),(249,197),(269,193),(287,200)],'#4c9a71'), ([(298,215),(325,208),(342,199),(374,197),(389,201)],'#75a477'), ([(246,385),(254,374),(267,378),(275,373),(286,378)],'#96c893'), ([(451,394),(467,394),(472,391),(480,391),(487,394)],'#7fbd9e'), ([(475,405),(486,403),(503,402)],'#9bc797')]:
        traco(im,points,col)
    for x,y in [(203,309),(219,299),(245,282),(286,293),(331,308),(378,319),(430,301),(463,274),(513,251),(556,236),(587,229),(472,354),(514,335)]:
        traco(im,[(x,y),(x+2,y),(x+4,y-1)],'#aca376')
        traco(im,[(x+1,y+1),(x+3,y+1)],'#f0d39d')
    siri=Image.open(PASTA/'siri-aprovado-1x.png')
    assert siri.size==(35,27) and set(siri.getchannel('A').get_flattened_data())=={0,255}
    im.alpha_composite(siri,(174-17,336-15))
    return im

def travessia():
    # Mesma cena e malha. Limpa somente marcas distantes e destaca a concha.
    original=b.sample(grade=True,exemplo_lateral=True)
    # Estado didático na mesma configuração: uma célula à esquerda, com dois bloqueios ortogonais.
    objetivo=(290,142)
    x,y=objetivo
    for dx,dy in ((-12,-10),(12,-10),(-12,10),(12,10)):
        u,v=x+dx,y+dy
        sx=1 if dx<0 else -1;sy=1 if dy<0 else -1
        traco(original,[(u+3*sx,v),(u,v),(u,v+3*sy)],'#9b5160')
    for dx,dy in ((0,-10),(1,-11),(-1,-11),(0,-12),(-13,3),(13,-3)):
        ImageDraw.Draw(original).point((x+dx,y+dy),fill='#fff1bb')
    return original.convert('RGBA')

def arquivo(nome,im):
    assert set(im.getchannel('A').get_flattened_data())=={255}
    im.save(DESTINO/f'{nome}-1x.png',optimize=True)
    hi=im.resize((im.width*2,im.height*2),Image.Resampling.NEAREST)
    assert hi.resize(im.size,Image.Resampling.NEAREST).tobytes()==im.tobytes()
    hi.save(DESTINO/f'{nome}-2x.png',optimize=True)

if __name__=='__main__':
    DESTINO.mkdir(exist_ok=True)
    for f,n in ((arquipelago,'01-arquipelago'),(seletor,'02-caminho-das-conchas'),(travessia,'03-travessia')):
        b.R.seed(12)
        arquivo(n,f())
