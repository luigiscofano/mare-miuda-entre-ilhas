from pathlib import Path
from PIL import Image, ImageDraw, ImageChops
from letras import FONT

BASE = Path(__file__).resolve().parent
WATER = ('#102c43','#193e55','#23566a','#286f7a','#438d8b','#70b8a0','#a9d5b3','#d4ead1')
SAND = ('#664453','#8b5351','#ae6d52','#c88c5a','#e4b16d','#edc686','#f8d99a','#ffe9b8')
LEAF = ('#263e46','#315754','#437159','#538563','#78a66c','#a7bf7b','#d3d18f')
STONE = ('#3e4857','#555663','#727377','#8d938a','#adb3a0','#d5cfab','#f4e0ae')
IVORY = '#fff0cf'
RUST = '#a66457'
def rect(d, x, y, w, h, c):
    if w > 0 and h > 0:
        d.rectangle((x,y,x+w-1,y+h-1), fill=c)
def p(d, pts, c, x=0, y=0):
    d.polygon([(a+x,b+y) for a,b in pts], fill=c)
def print_px(d,x,y,title,c=IVORY):
    for ch in title:
        if ch in 'ÉÓ':rect(d,x+3,y-2,2,1,c)
        k=FONT.get({'É':'E','Ó':'O'}.get(ch,ch))
        if k:
            for j,row in enumerate(k.split()):
                for i,v in enumerate(row):
                    if v=='1':rect(d,x+i,y+j,1,1,c)
        x+=6 if ch!=' ' else 4

def pattern(d,x,y,c,points):
    for a,b,w in points:
        rect(d,x+a,y+b,w,1,c)
def background(w,h):
    im=Image.new('RGB',(w,h),WATER[0])
    d=ImageDraw.Draw(im)
    for x,y,a,b,shade in [(0,27,w,50,1),(0,78,w,36,1),(0,115,w,26,1)]:
        rect(d,x,y,a,b,WATER[shade])
    for j in range(8):
        y=31+((h-62)*j)//8
        for i in range(7):
            x=(i*(w-18)//7+(j*29)%40)%w
            pattern(d,x,y,WATER[2],[(0,0,10+(i+j)%7),(4,2,9),(9,3,4)])
            if (i+j)%3==0:pattern(d,x+5,y-8,WATER[3],[(0,0,8),(2,1,5)])
    return im,d
def tide_foam(d,x,y,w):
    pattern(d,x,y,WATER[4],[(-4,3,w+5),(6,4,w-3),(13,6,w//3)])
    pattern(d,x,y,WATER[5],[(0,0,w),(5,1,w-7),(15,2,w//3)])
    pattern(d,x,y,WATER[6],[(5,0,w//2),(8,-1,w//3),(w-4,0,4)])
    pattern(d,x,y,WATER[7],[(8,-1,4),(w-4,0,2)])
REEF=((0,9),(6,9),(6,5),(12,5),(12,2),(20,2),(20,0),(29,0),(29,4),(39,4),(39,6),(45,6),(45,12),(40,12),(40,16),(33,16),(33,20),(12,20),(12,18),(5,18),(5,15),(0,15))
def reef(d,x,y,mirror=False):
    a=[(45-u,v) for u,v in REEF] if mirror else REEF
    p(d,a,WATER[1],x+3,y+4)
    p(d,a,WATER[2],x,y)
    p(d,[(5,9),(12,9),(12,6),(20,6),(20,3),(28,3),(28,6),(37,6),(37,10),(31,10),(31,13),(27,13),(27,16),(10,16),(10,13),(5,13)],WATER[3],x,y)
    pattern(d,x,y,WATER[4],[(15,7,9),(19,6,6),(25,10,7),(8,12,4)])
    pattern(d,x,y,WATER[2],[(17,14,5),(19,13,4),(30,8,5)])
def rim(d,pts):
    # O mesmo contorno passa por sete faixas sólidas: a última é solo iluminado.
    for off,i in [(16,2),(13,3),(10,4),(8,5)]:
        p(d,pts,WATER[i],0,off)
    for off,i in [(6,0),(4,1),(1,2),(-2,3),(-4,4),(-6,6)]:
        p(d,pts,SAND[i],0,off)
def rock(d,x,y,variant=0,small=False,stones=STONE):
    if small:
        source=Image.new('RGB',(39,32),'#ff00ff')
        rock(ImageDraw.Draw(source),0,0,variant,False,stones)
        source=source.resize((27,22),Image.Resampling.NEAREST)
        for j in range(22):
            for i in range(27):
                px=source.getpixel((i,j))
                if px!=(255,0,255):rect(d,x+i,y+j,1,1,px)
        return
    outer=[(0,19),(4,19),(4,13),(8,13),(8,8),(13,8),(13,5),(18,5),(18,2),(26,2),(26,5),(31,5),(31,9),(34,9),(34,15),(37,15),(37,22),(31,22),(31,26),(22,26),(22,28),(7,28),(7,25),(0,25)]
    if variant%2:outer=[(37-a,b) for a,b in outer]
    p(d,outer,stones[0],x+1,y+2)
    p(d,outer,stones[1],x,y)
    p(d,[(4,17),(8,17),(8,10),(14,10),(14,6),(19,6),(19,3),(25,3),(25,7),(30,7),(30,12),(27,12),(27,17),(19,17),(19,21),(10,21),(10,23),(4,23)],stones[2],x,y)
    p(d,[(9,12),(15,12),(15,7),(20,7),(20,4),(25,4),(25,8),(28,8),(28,11),(23,11),(23,14),(16,14),(16,17),(9,17)],stones[3],x,y)
    p(d,[(14,11),(17,11),(17,7),(24,7),(24,10),(20,10),(20,13),(14,13)],stones[4],x,y)
    pattern(d,x,y,stones[5],[(21,5,4),(18,8,5),(12,13,4)])
    pattern(d,x,y,stones[0],[(25,18,6),(27,16,3),(23,23,7),(11,24,5)])
    pattern(d,x,y,stones[3],[(20,19,3),(8,20,3),(30,16,3)])
    pattern(d,x,y,stones[4],[(21,24,2),(29,19,3),(11,19,3)])
def crown(d,x,y,mirror=False):
    base=[(0,14),(3,14),(3,8),(8,8),(8,5),(13,5),(13,2),(20,2),(20,0),(29,0),(29,3),(34,3),(34,6),(38,6),(38,9),(44,9),(44,15),(48,15),(48,23),(42,23),(42,28),(37,28),(37,33),(26,33),(26,36),(11,36),(11,32),(5,32),(5,27),(0,27)]
    if mirror:base=[(48-i,j) for i,j in base]
    p(d,[(3,36),(11,36),(11,32),(23,32),(23,29),(43,29),(43,32),(48,32),(48,39),(36,39),(36,42),(7,42),(7,39),(3,39)],LEAF[1],x+8,y)
    rect(d,x+21,y+24,7,15,SAND[0]);rect(d,x+22,y+27,3,11,SAND[3])
    p(d,base,LEAF[0],x+1,y+2);p(d,base,LEAF[1],x,y)
    for sx,sy,t in [(2,10,0),(13,4,1),(23,8,2),(5,19,1),(18,16,2),(29,15,0),(15,25,0)]:
        outline=[(0,6),(3,6),(3,3),(8,3),(8,1),(13,1),(13,3),(17,3),(17,6),(20,6),(20,10),(16,10),(16,13),(5,13),(5,10),(0,10)]
        p(d,outline,LEAF[2+t],x+sx,y+sy)
        pattern(d,x+sx,y+sy,LEAF[3+t],[(3,6,9),(7,4,7),(9,3,4),(11,7,5)])
        pattern(d,x+sx,y+sy,LEAF[2],[(8,10,5),(14,9,3)])
def scrub(d,x,y):
    p(d,[(0,7),(4,7),(4,3),(9,3),(9,1),(16,1),(16,3),(21,3),(21,7),(24,7),(24,10),(18,10),(18,13),(5,13),(5,10),(0,10)],LEAF[2],x,y)
    pattern(d,x,y,LEAF[4],[(4,6,9),(8,4,7),(11,3,4),(15,7,5),(6,9,3)])
    pattern(d,x,y,LEAF[5],[(8,5,3),(12,4,2)])
def ripple_sand(d,x,y,shade=0):
    c=SAND[4+shade]
    pattern(d,x,y,c,[(0,0,6),(4,1,15),(13,2,7),(26,1,3),(7,5,8),(20,4,6)])
    pattern(d,x,y,SAND[7],[(8,3,9),(21,5,3)])
def track(d,points,width,c,dy=0):
    for (x,y),(a,b) in zip(points,points[1:]):
        assert x==a or y==b
        rect(d,min(x,a)-width//2,min(y,b)-width//2+dy,abs(a-x)+width,abs(b-y)+width,c)
def heading(d,w,title,meta=None):
    rect(d,0,0,w,26,WATER[0]);rect(d,14,25,w-28,1,WATER[4]);print_px(d,15,10,title)
    if meta:print_px(d,w-45,10,meta,WATER[6])
def footer(d,w,h):
    rect(d,0,h-29,w,29,WATER[0]);rect(d,14,h-29,w-28,1,WATER[4])
def marker(d,x,y,glyph,active=False):
    rect(d,x-7,y-5,16,15,SAND[1]);rect(d,x-8,y-8,16,16,WATER[0])
    rect(d,x-7,y-7,14,14,RUST if active else WATER[4]);rect(d,x-7,y-7,14,2,SAND[6] if active else WATER[6])
    rect(d,x-7,y+5,14,2,SAND[1] if active else WATER[3]);print_px(d,x-2,y-3,glyph)
def verify_save(im,name,sprite,location):
    asset=Image.open(BASE/sprite).convert('RGBA'); x0,y0=location
    mask=asset.getchannel('A')
    assert set(mask.get_flattened_data())=={0,255}
    im.paste(asset,location,mask)
    for y in range(asset.height):
        for x in range(asset.width):
            rr,gg,bb,aa=asset.getpixel((x,y))
            if aa:assert im.getpixel((x+x0,y+y0))==(rr,gg,bb)
    im.save(BASE/(name+'-1x.png'),optimize=True)
    out=im.resize((im.width*3,im.height*3),Image.Resampling.NEAREST)
    assert ImageChops.difference(im,out.resize(im.size,Image.Resampling.NEAREST)).getbbox() is None
    out.save(BASE/(name+'.png'),optimize=True)
    print(name,im.size,'sprite',asset.size,'cores',len(im.getcolors(1<<24)))
def selector():
    w,h=304,228
    im,d=background(w,h)
    for x,y,m in [(5,65,False),(251,83,True),(0,119,True),(265,133,False),(226,169,False),(28,179,True),(109,190,False)]:reef(d,x,y,m)
    silhouette=[(27,143),(27,118),(40,118),(40,94),(49,94),(49,77),(65,77),(65,58),(84,58),(84,43),(125,43),(125,50),(143,50),(143,59),(160,59),(160,44),(204,44),(204,51),(227,51),(227,66),(251,66),(251,82),(267,82),(267,112),(277,112),(277,140),(257,140),(257,153),(245,153),(245,166),(212,166),(212,175),(187,175),(187,181),(161,181),(161,187),(78,187),(78,180),(45,180),(45,168),(27,168)]
    rim(d,silhouette)
    ledges=[
      [(44,112),(44,101),(59,101),(59,85),(75,85),(75,66),(90,66),(90,54),(111,54),(111,64),(127,64),(127,76),(116,76),(116,82),(98,82),(98,96),(78,96),(78,102),(59,102),(59,112)],
      [(141,72),(155,72),(155,61),(175,61),(175,52),(204,52),(204,62),(217,62),(217,77),(234,77),(234,89),(209,89),(209,96),(175,96),(175,88),(149,88),(149,85),(141,85)],
      [(65,150),(71,150),(71,134),(92,134),(92,119),(113,119),(113,127),(139,127),(139,140),(145,140),(145,153),(126,153),(126,165),(89,165),(89,161),(65,161)],
      [(203,160),(203,137),(213,137),(213,125),(231,125),(231,116),(258,116),(258,136),(244,136),(244,154),(226,154),(226,169),(203,169)]
    ]
    for a in ledges:
        p(d,a,SAND[2],2,5);p(d,a,LEAF[1],1,3);p(d,a,LEAF[3]);p(d,a,LEAF[4],0,-2)
    for args in [(31,133,0),(53,114,1),(61,104,0),(115,95,1),(119,106,0),(151,96,0),(219,101,1),(208,112,0),(105,167,0),(157,159,1),(71,167,1),(113,54,0),(191,100,1),(176,171,0),(245,144,0)]:
        ripple_sand(d,*args)
    for args in [(34,174,37),(62,185,33),(99,192,28),(133,197,37),(173,187,38),(213,177,23),(247,151,26),(258,138,28),(257,103,17),(20,155,24),(29,128,14),(237,76,19),(199,51,17)]:
        tide_foam(d,*args)
    nodes=[(48,153),(77,122),(91,76),(133,94),(184,72),(201,143),(236,85)]
    a,b,c,e,f,g,i=nodes
    paths=[[a,(63,153),(63,122),b],[b,(83,122),(83,94),(91,94),c],[c,(111,76),(111,94),e],[e,(155,94),(155,76),(184,76),f],[b,(77,145),(91,145),(91,168),(171,168),(171,143),g],[g,(191,143),(191,111),(133,111),e],[f,(210,72),(210,85),i]]
    for route in paths:
        for wid,col,dy in [(12,SAND[2],4),(11,SAND[3],1),(9,SAND[5],0),(6,SAND[7],-1)]:
            track(d,route,wid,col,dy)
    # A luz deixa as copas mais claras no topo e as sombras caem a sudeste da trilha.
    for x,y,m in [(46,56,False),(115,62,True),(173,49,True),(225,94,False),(107,127,False)]:
        crown(d,x,y,m)
    for args in [(32,83,0),(92,101,1),(155,103,0),(218,130,1)]:
        rock(d,*args)
    for x,y in [(33,121),(154,48),(208,88),(241,113),(113,119),(142,141),(46,104),(97,144),(101,64),(152,150),(214,115),(58,160),(238,149)]:
        scrub(d,x,y)
    # Marcos por cima da vegetação; os vértices originais permanecem conectados.
    for (x,y),g0 in zip(nodes[1:],('1','2','3','4','*','>')):marker(d,x,y,g0,g0 in '1*')
    heading(d,w,'CAMINHO DAS CONCHAS','01')
    footer(d,w,h)
    print_px(d,15,210,'WASD / SETAS: SIGA A TRILHA',WATER[6])
    verify_save(im,'caminho-das-conchas-ortogonal-v3','siri-seletor.png',(33,136))
def shell(d,x,y):
    rows=['.......llll.......','....lllhhhhlll....','...lwwhhmhw hhl...'.replace(' ',''),'..lwhmwhmhw hmhl..'.replace(' ',''),'.lwhmwhmwhmw hmhl.'.replace(' ',''),'lwhmwhmwhmw hmhmhl'.replace(' ',''),'l hhmwhmwhmwmhhhl'.replace(' ',''),'.lhhmhmhmmhmhhhl.','..lmmhmmmhmhhml..','...lmmmmmmmmml...','.....llllllll....']
    pal={'l':'#784656','h':'#e8a37e','m':'#cb7870','w':'#ffefd4'}
    for j,row in enumerate(rows):
        for i,v in enumerate(row):
            if v in pal:rect(d,x+i,y+j,1,1,pal[v])
def corner(d,x,y,edge,c):
    for dx,dy in [(2,2),(edge-8,2),(2,edge-3),(edge-8,edge-3)]:
        rect(d,x+dx,y+dy,6,1,c)
    for dx,dy in [(2,2),(edge-3,2),(2,edge-8),(edge-3,edge-8)]:
        rect(d,x+dx,y+dy,1,6,c)
def board():
    w,h=400,300
    im,d=background(w,h)
    for x,y,m in [(10,94,False),(41,102,True),(58,83,False),(0,164,False),(38,186,True),(317,93,False),(345,102,True),(345,167,True),(363,184,True),(282,221,False),(69,235,True),(306,235,True),(115,226,False)]:
        reef(d,x,y,m)
    for a in [(13,128,18),(42,128,34),(344,131,31),(347,200,30),(290,245,33),(74,257,33),(18,188,13)]:tide_foam(d,*a)
    # O contorno de cada casa transitável ocupa uma célula inteira. A sombra não conta como piso.
    t=30;ox=107;oy=111
    grid=['#..H.#','S==.=C','#.####']
    cells={(x,y):v for y,row in enumerate(grid) for x,v in enumerate(row) if v!='#'}
    for dy,margin,c in [(15,9,WATER[2]),(13,7,WATER[3]),(11,5,WATER[4]),(8,3,WATER[5]),(6,1,SAND[0]),(3,0,SAND[2])]:
        for x,y in cells:
            rect(d,ox+x*t-margin,oy+y*t+dy-margin,t+2*margin,t+2*margin,c)
    for (x,y),kind in cells.items():
        x0,y0=ox+x*t,oy+y*t
        low=kind=='='
        rect(d,x0,y0,t,t,'#cbb686' if low else SAND[6])
        rect(d,x0,y0,t,1,'#e1cf9e' if low else SAND[7]);rect(d,x0,y0,1,t,'#b8a77a' if low else SAND[5])
        rect(d,x0,y0+t-2,t,2,'#9e997a' if low else SAND[4])
        if low:
            pattern(d,x0,y0,'#a3a58b',[(3,5,12),(8,6,11),(10,13,13),(4,17,12),(7,18,6),(17,22,8),(10,23,8)])
            pattern(d,x0,y0,'#ddd0a0',[(7,7,7),(14,14,10),(6,19,8)])
        elif kind not in 'HC':
            pattern(d,x0,y0,SAND[5],[(4,7,8),(7,8,12),(12,9,7),(14,20,9),(19,21,5),(6,23,4)])
            pattern(d,x0,y0,SAND[7],[(7,9,5),(14,22,6),(4,12,3)])
        if (x,y+1) not in cells:
            pattern(d,x0,y0+30,SAND[1],[(3,2,7),(10,0,9),(17,3,10)])
            tide_foam(d,x0+1,y0+37,19)
        elif (x-1,y) not in cells:
            tide_foam(d,x0-12,y0+24,10)
    # Mostramos o estado real após direita e cima na Trilha das Pedras.
    rect(d,ox,oy,t,t,LEAF[0]);rock(d,ox+1,oy+6,0,True)
    corner(d,ox,oy,t,IVORY)
    rock(d,ox+3*t+1,oy+5,1,True,('#404c55','#625e65','#8b8d85','#9ca493','#c3c9a6','#ece0b4','#f9eabd'))
    corner(d,ox+t,oy,t,RUST)
    for x,y in [(2,0),(1,1)]:corner(d,ox+x*t,oy+y*t,t,'#927452')
    tx,ty=ox+5*t,oy+t; marker(d,tx+15,ty+15,'',True)
    rect(d,tx+5,ty+7,20,17,SAND[5]);rect(d,tx+5,ty+6,20,16,SAND[7])
    shell(d,tx+6,ty+8);corner(d,tx,ty,t,RUST)
    rect(d,tx+25,ty-8,1,9,IVORY);rect(d,tx+21,ty-4,9,1,IVORY)
    heading(d,w,'TRAVESSIA / TRILHA DAS PEDRAS')
    rect(d,14,36,w-28,26,WATER[2]);rect(d,14,36,w-28,1,WATER[4])
    print_px(d,23,45,'MARÉ BAIXA',WATER[7]);print_px(d,216,45,'VIRA NO PRÓXIMO')
    for k in range(3):rect(d,105+19*k,45,14,6,WATER[5] if k<2 else WATER[0])
    footer(d,w,h)
    for k,ch in enumerate('WASD'):marker(d,22+20*k,285,ch)
    print_px(d,101,282,'1 CASA / SETAS',WATER[6])
    shell(d,270,279);print_px(d,293,282,'CONCHA')
    verify_save(im,'travessia-ortogonal-v3','siri-fase.png',(ox+t-3,oy-8))
if __name__=='__main__':
    selector()
    board()
