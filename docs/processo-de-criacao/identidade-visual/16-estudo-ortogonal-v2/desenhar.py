from PIL import Image,ImageDraw,ImageChops
from pathlib import Path
BASE=Path(__file__).resolve().parent
FONT={'A': '01110 10001 10001 11111 10001 10001 10001', 'B': '11110 10001 10001 11110 10001 10001 11110', 'C': '01111 10000 10000 10000 10000 10000 01111', 'D': '11110 10001 10001 10001 10001 10001 11110', 'E': '11111 10000 10000 11110 10000 10000 11111', 'F': '11111 10000 10000 11110 10000 10000 10000', 'G': '01111 10000 10000 10111 10001 10001 01111', 'H': '10001 10001 10001 11111 10001 10001 10001', 'I': '01110 00100 00100 00100 00100 00100 01110', 'J': '00111 00010 00010 00010 00010 10010 01100', 'L': '10000 10000 10000 10000 10000 10000 11111', 'M': '10001 11011 10101 10101 10001 10001 10001', 'N': '10001 11001 10101 10011 10001 10001 10001', 'O': '01110 10001 10001 10001 10001 10001 01110', 'P': '11110 10001 10001 11110 10000 10000 10000', 'Q': '01110 10001 10001 10001 10101 10010 01101', 'R': '11110 10001 10001 11110 10100 10010 10001', 'S': '01111 10000 10000 01110 00001 00001 11110', 'T': '11111 00100 00100 00100 00100 00100 00100', 'U': '10001 10001 10001 10001 10001 10001 01110', 'V': '10001 10001 10001 10001 10001 01010 00100', 'W': '10001 10001 10001 10101 10101 11011 10001', 'X': '10001 10001 01010 00100 01010 10001 10001', 'Y': '10001 10001 01010 00100 00100 00100 00100', 'Z': '11111 00001 00010 00100 01000 10000 11111', '0': '01110 10001 10011 10101 11001 10001 01110', '1': '00100 01100 00100 00100 00100 00100 01110', '2': '01110 10001 00001 00010 00100 01000 11111', '3': '11110 00001 00001 01110 00001 00001 11110', '4': '00010 00110 01010 10010 11111 00010 00010', '5': '11111 10000 10000 11110 00001 00001 11110', '6': '01111 10000 10000 11110 10001 10001 01110', '>': '01000 00100 00010 00001 00010 00100 01000', '*': '00000 00100 01010 11111 01010 00100 00000', ':': '00000 00100 00100 00000 00100 00100 00000', '/': '00001 00001 00010 00100 01000 10000 10000'}
SEA=('#122f43','#164259','#1b5265','#246b78','#318788','#50a698','#86c4a7','#c0dcc0')
CLIFF=('#704954','#985952','#b77755','#d69f62','#edc17b','#f8d59a','#ffe7b4')
G=('#203c47','#2c5351','#396a57','#54835d','#74a368','#9ab16c','#c7c27d')
INK='#153342'
CREAM='#fff0c9'
def r(d,x,y,w,h,c):
    d.rectangle((x,y,x+w-1,y+h-1),fill=c)
def poly(d,points,c,dx=0,dy=0):
    d.polygon([(x+dx,y+dy) for x,y in points],fill=c)
def txt(d,x,y,s,c=CREAM):
    for ch in s:
        if ch in 'ÉÓ':r(d,x+3,y-2,2,1,c)
        glyph=FONT.get({'É':'E','Ó':'O'}.get(ch,ch))
        if glyph:
            for yy,row in enumerate(glyph.split()):
                for xx,p in enumerate(row):
                    if p=='1':r(d,x+xx,y+yy,1,1,c)
        x+=6 if ch!=' ' else 4
def coast(d,points):
    for dy,col in [(10,SEA[2]),(8,SEA[3]),(6,SEA[5]),(5,SEA[6]),(3,CLIFF[0]),(1,CLIFF[1]),(-2,CLIFF[2]),(-4,CLIFF[4]),(-5,CLIFF[5])]:
        poly(d,points,col,0,dy)
def water(w,h):
    im=Image.new('RGB',(w,h),SEA[1]); d=ImageDraw.Draw(im)
    for j in range(1,6):
        y=25+j*(h-38)//6
        for q in range(4):
            x=(q*w//4)+(j*7%17)
            r(d,x,y,18+(q+j)%4*4,1,SEA[2])
            r(d,x+5,y+2,11,1,SEA[2])
        for i in range(6):
            x=6+((i*43+j*13)%(w-26))
            r(d,x,y-5,9+(i+j)%5,1,SEA[3]);r(d,x+3,y-3,5,1,SEA[2])
    return im,d
def rug(d,x,y,c):
    poly(d,[(0,4),(4,4),(4,2),(13,2),(13,0),(21,0),(21,2),(28,2),(28,7),(23,7),(23,10),(6,10),(6,8),(0,8)],c,x,y)
def foam(d,x,y,w):
    r(d,x,y,w,1,SEA[5])
    r(d,x+3,y-1,max(2,w-8),1,SEA[6])
    r(d,x+8,y+2,max(2,w-12),1,SEA[4])
    r(d,x+w+3,y+1,4,1,SEA[4])
def dune(d,x,y):
    poly(d,[(0,4),(6,4),(6,2),(16,2),(16,0),(24,0),(24,2),(30,2),(30,4),(36,4),(36,7),(23,7),(23,9),(8,9),(8,7),(0,7)],CLIFF[4],x,y)
    r(d,x+12,y+3,13,1,CLIFF[5]);r(d,x+15,y+2,8,1,CLIFF[6])
def flora(d,x,y,k=0):
    # Copas em planos deslocados: luz do alto à esquerda, sombra à direita.
    pts=[(0,10),(3,10),(3,5),(7,5),(7,2),(14,2),(14,0),(22,0),(22,3),(29,3),(29,7),(34,7),(34,14),(31,14),(31,19),(25,19),(25,23),(9,23),(9,20),(3,20),(3,16),(0,16)]
    if k%2:pts=[(34-a,b) for a,b in pts]
    r(d,x+6,y+23,31,4,G[0]);r(d,x+12,y+16,5,10,CLIFF[0]);r(d,x+13,y+17,2,7,CLIFF[2])
    poly(d,pts,G[0],x+1,y+2);poly(d,pts,G[1],x,y)
    poly(d,[(4,10),(8,10),(8,5),(15,5),(15,2),(22,2),(22,5),(27,5),(27,9),(31,9),(31,13),(24,13),(24,17),(12,17),(12,15),(4,15)],G[3],x,y)
    poly(d,[(8,10),(9,6),(15,6),(15,3),(21,3),(21,6),(25,6),(25,9),(21,9),(21,12),(12,12),(12,14),(8,14)],G[4],x,y)
    for a,b,w in [(11,8,4),(16,5,5),(17,10,4)]:r(d,x+a,y+b,w,1,G[5])
def boulder(d,x,y):
    colors=('#635569','#7f7778','#9a9a89','#b5b998','#d6ca9e')
    for pts,c in [
      ([(0,13),(3,13),(3,8),(7,8),(7,4),(13,4),(13,1),(19,1),(19,4),(22,4),(22,8),(25,8),(25,16),(20,16),(20,19),(4,19),(4,17),(0,17)],colors[0]),
      ([(4,9),(7,9),(7,5),(13,5),(13,2),(18,2),(18,5),(21,5),(21,8),(19,8),(19,12),(13,12),(13,15),(4,15)],colors[2]),
      ([(8,6),(14,6),(14,3),(18,3),(18,6),(16,6),(16,9),(8,9)],colors[3]),
      ([(16,12),(20,12),(20,8),(23,8),(23,14),(20,14),(20,16),(15,16)],colors[1])]:
       poly(d,pts,c,x,y)
    r(d,x+14,y+3,3,1,colors[4])
def grasses(d,x,y,c):
    for dx,dy,w,h in [(0,4,1,4),(1,5,1,3),(2,3,1,5),(3,4,2,4),(5,6,1,2),(8,2,1,5),(9,4,2,3),(11,5,1,2)]:
        r(d,x+dx,y+dy,w,h,c)
def trail(d,pts,n,color):
    for (x,y),(a,b) in zip(pts,pts[1:]):
        assert x==a or y==b
        r(d,min(x,a)-n//2,min(y,b)-n//2,abs(a-x)+n,abs(b-y)+n,color)
def ctl(d,x,y,label):
    r(d,x,y,19,14,SEA[0]);r(d,x+1,y+1,17,11,SEA[3]);r(d,x+1,y+1,17,1,SEA[5])
    txt(d,x+7,y+3,label)
def panel(d,w,title):
    r(d,0,0,w,26,SEA[0]);r(d,11,24,w-22,1,SEA[4]);r(d,11,26,w-22,1,SEA[2])
    txt(d,12,11,title)
def save(im,stem,sprite,pos):
    src=Image.open(BASE/sprite).convert('RGBA')
    assert set(src.getchannel('A').get_flattened_data())=={0,255}
    im.paste(src,pos,src.getchannel('A'))
    for y in range(src.height):
        for x in range(src.width):
            p=src.getpixel((x,y))
            if p[3]:assert im.getpixel((x+pos[0],y+pos[1]))==p[:3]
    fn=BASE/(stem+'-1x.png'); im.save(fn,optimize=True)
    large=im.resize((im.width*4,im.height*4),Image.Resampling.NEAREST)
    assert ImageChops.difference(im,large.resize(im.size,Image.Resampling.NEAREST)).getbbox() is None
    large.save(BASE/(stem+'.png'),optimize=True)
    print(stem,im.size,'siri:',src.size)
def selector():
    im,d=water(240,180)
    # O desenho tem bordas em L; não representa células navegáveis.
    coast(d,[(24,114),(24,89),(32,89),(32,70),(46,70),(46,51),(61,51),(61,38),(111,38),(111,48),(129,48),(129,40),(166,40),(166,48),(192,48),(192,61),(208,61),(208,84),(214,84),(214,110),(200,110),(200,125),(183,125),(183,138),(141,138),(141,146),(72,146),(72,139),(42,139),(42,130),(24,130)])
    zones=[
      [(41,75),(51,75),(51,58),(68,58),(68,47),(98,47),(98,52),(107,52),(107,67),(88,67),(88,79),(58,79),(58,96),(41,96)],
      [(124,53),(142,53),(142,45),(163,45),(163,53),(187,53),(187,64),(199,64),(199,78),(183,78),(183,85),(154,85),(154,79),(124,79)],
      [(149,112),(165,112),(165,101),(191,101),(191,95),(204,95),(204,108),(194,108),(194,119),(176,119),(176,132),(151,132),(151,124),(149,124)],
      [(68,115),(87,115),(87,102),(113,102),(113,111),(135,111),(135,126),(120,126),(120,134),(79,134),(79,125),(68,125)]
    ]
    for z in zones:poly(d,z,CLIFF[3],2,3);poly(d,z,G[1]);poly(d,z,G[3],0,-2)
    a,b,c,e,f,g,h=[(40,118),(63,91),(73,59),(106,76),(151,58),(161,123),(188,71)]
    paths=[[a,(54,118),(54,91),b],[b,(66,91),(66,74),(73,74),c],[c,(92,59),(92,76),e],[e,(123,76),(123,62),(151,62),f],[b,(63,109),(75,109),(75,128),(134,128),(134,123),g],[g,(154,123),(154,97),(106,97),e],[f,(171,58),(171,71),h]]
    for x,y in [(39,94),(117,91),(172,93),(113,132),(179,120),(37,74)]:
        dune(d,x,y)
    for x,y,w in [(33,144,30),(78,151,20),(105,151,27),(148,147,17),(172,144,16),(186,134,18),(203,122,16),(20,117,15),(20,136,17),(212,99,18)]:
        foam(d,x,y,w)
    for x,y in [(44,58),(100,61),(143,58),(99,116),(180,91)]:
        rug(d,x+2,y+12,G[2])
    for p in paths:
        for n,c0,dy in [(10,CLIFF[2],2),(8,CLIFF[3],0),(5,CLIFF[6],0)]:
            trail(d,[(x,y+dy) for x,y in p],n,c0)
    for x,y,k in [(45,49,0),(95,46,1),(145,40,1),(176,76,0),(93,103,0)]:
        flora(d,x,y,k)
    for x,y in [(75,80),(123,81),(169,104),(33,56)]:
        boulder(d,x,y)
    for x,y,c in [(45,54,CLIFF[6]),(50,69,G[5]),(112,60,G[5]),(163,75,G[5]),(145,92,CLIFF[4]),(170,97,G[4]),(105,134,G[5]),(83,136,CLIFF[6]),(47,111,CLIFF[6]),(192,120,G[6])]:
        for dx,dy,w in [(0,0,4),(3,2,3),(10,4,2)]:r(d,x+dx,y+dy,w,1,c)
    for x,y,k in [(34,102,1),(59,52,3),(112,52,2),(180,42,3),(111,104,1),(147,112,2),(203,92,2),(91,144,1),(191,118,1),(51,122,2)]:
        grasses(d,x,y,G[k])
    for x,y,name in [(63,91,'1'),(73,59,'2'),(106,76,'3'),(151,58,'4'),(161,123,'*'),(188,71,'>')]:
        r(d,x-6,y-5,14,14,CLIFF[0]);r(d,x-7,y-7,14,14,INK)
        col='#b77755' if name in '1*' else SEA[4]
        r(d,x-6,y-6,12,12,col);r(d,x-6,y-6,12,1,CLIFF[6] if name in '1*' else SEA[6])
        txt(d,x-2,y-3,name)
    panel(d,240,'CAMINHO DAS CONCHAS')
    txt(d,203,11,'01',SEA[7])
    r(d,0,161,240,19,SEA[0]);r(d,12,161,215,1,SEA[4]);txt(d,13,168,'WASD / SETAS: SIGA A TRILHA',SEA[7])
    save(im,'caminho-das-conchas-ortogonal-v2','siri-seletor.png',(25,103))
def shell(d,x,y):
    design=['.....llll.....','...llhhhhll...','..lhwhhwhhl..','.lhwmwhmwhhl.','lhwmwhmwmwhhl','lhhmwhmwmwhhl','.lhhmhmhmhhl.','..lmmmmmmml..','....lllll....']
    palette={'l':'#774b58','h':'#e89e78','w':'#fff0c9','m':'#c27270'}
    for yy,row in enumerate(design):
        for xx,px in enumerate(row):
            if px!='.':r(d,x+xx,y+yy,1,1,palette[px])
def boulder_tile(im,d,x,y):
    # As duas bordas exteriores da rocha ficam dentro dos 24 pixels da casa.
    tile=Image.new('RGB',(26,20),'#fe00fe')
    boulder(ImageDraw.Draw(tile),0,0)
    for yy in range(20):
        for xx in range(1,25):
            p=tile.getpixel((xx,yy))
            if p!=(254,0,254):
                r(d,x+xx-1,y+yy,1,1,p)
def corner(d,x,y,n,c):
    for dx,dy in [(2,2),(n-7,2),(2,n-3),(n-7,n-3)]:
        r(d,x+dx,y+dy,5,1,c)
    for dx,dy in [(2,2),(n-3,2),(2,n-7),(n-3,n-7)]:
        r(d,x+dx,y+dy,1,5,c)
def board():
    im,d=water(320,240)
    n=24; ox=83; oy=97
    grid=['#..H.#','S==.=C','#.####']
    actual={(x,y):v for y,row in enumerate(grid) for x,v in enumerate(row) if v!='#'}
    for dy,margin,col in [(9,7,SEA[2]),(6,5,SEA[3]),(4,3,SEA[6]),(2,1,CLIFF[1])]:
        for x,y in actual:
            r(d,ox+x*n-margin,oy+y*n+dy-margin,n+2*margin,n+2*margin,col)
    for (x,y),v in actual.items():
        xx,yy=ox+x*n,oy+y*n
        c='#c8b67d' if v=='=' else CLIFF[5]
        r(d,xx,yy,n,n,c)
        # Os limites usam sombra de contato; não há cantos cortados ou diagonais.
        r(d,xx,yy,n,1,'#e5d296' if v=='=' else CLIFF[6])
        r(d,xx,yy,1,n,'#c0b47e' if v=='=' else CLIFF[4])
        r(d,xx,yy+n-2,n,2,'#9e9b74' if v=='=' else CLIFF[3])
        if v=='=':
            for bx,by,l in [(4,5,7),(14,9,6),(7,14,8),(3,18,4)]:
                r(d,xx+bx,yy+by,l,1,'#8da088')
        elif v not in 'HC':
            r(d,xx+6,yy+8,4,1,CLIFF[4]);r(d,xx+15,yy+17,2,1,CLIFF[4])
    # Recife decorativo fora da área navegável, com bordas em degraus.
    for x,y,scale in [(19,70,1),(28,74,1),(249,71,1),(258,76,1),(36,158,1),(245,178,1),(267,174,1),(63,181,1)]:
        poly(d,[(0,10),(5,10),(5,5),(10,5),(10,2),(18,2),(18,5),(22,5),(22,9),(26,9),(26,16),(20,16),(20,19),(3,19),(3,16),(0,16)],SEA[2],x,y)
        poly(d,[(5,10),(9,10),(9,6),(12,6),(12,4),(18,4),(18,7),(20,7),(20,13),(16,13),(16,16),(5,16)],SEA[4],x,y)
        r(d,x+10,y+7,7,3,SEA[5])
    # Espuma quebrada no limite externo, sem cruzar nenhuma casa navegável.
    for x,y,w in [(69,149,13),(73,156,11),(142,156,18),(166,158,14),(195,156,18),(216,150,18),(108,180,14),(94,175,9),(176,91,18),(150,93,12),(221,127,13)]:
        foam(d,x,y,w)
    # Plataformas decorativas rasas se distinguem pelas cores frias e ausência de marcação.
    for x,y in [(5,125),(269,116),(11,163),(282,153),(225,186),(55,84)]:
        rug(d,x,y,SEA[2]);r(d,x+4,y+4,16,1,SEA[3])
    # A rocha vizinha bloqueia; a pedra alta entre as casas claras é atravessável.
    r(d,ox,oy,n,n,G[0]);boulder_tile(im,d,ox,oy+3);corner(d,ox,oy,n,CREAM)
    boulder_tile(im,d,ox+3*n,oy+2)
    corner(d,ox+n,oy,n,'#9f5b54')
    for x,y in [(2,0),(1,1)]:corner(d,ox+x*n,oy+y*n,n,'#967952')
    x,y=ox+5*n,oy+n
    r(d,x+4,y+5,16,15,CLIFF[3]);r(d,x+4,y+3,16,15,CLIFF[6])
    shell(d,x+5,y+6);corner(d,x,y,n,'#ad6056')
    r(d,x+20,y-7,1,7,CREAM);r(d,x+17,y-4,7,1,CREAM)
    panel(d,320,'TRAVESSIA / TRILHA DAS PEDRAS')
    r(d,12,35,296,24,SEA[2]);r(d,12,35,296,1,SEA[4])
    txt(d,20,44,'MARÉ BAIXA',SEA[7]);txt(d,169,44,'VIRA NO PRÓXIMO')
    for k in range(3):r(d,91+k*18,44,13,6,SEA[6] if k<2 else SEA[0])
    r(d,0,205,320,35,SEA[0]);r(d,12,205,296,1,SEA[4])
    ctl(d,13,216,'W');ctl(d,35,216,'A');ctl(d,57,216,'S');ctl(d,79,216,'D')
    txt(d,111,219,'1 CASA / SETAS',SEA[7])
    shell(d,217,218);txt(d,237,219,'CONCHA',CREAM)
    save(im,'travessia-ortogonal-v2','siri-fase.png',(ox+n-5,oy-7))
if __name__=='__main__':
    selector()
    board()
