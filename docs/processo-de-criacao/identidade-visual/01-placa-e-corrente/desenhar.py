"""Estudos Entre Ilhas: máscaras autorais e exportação em grade inteira."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageChops, ImageFilter
import argparse

# Cada caractere ocupa uma pequena matriz binária sem subpixel.
FONT={
"A":"01110/11011/11011/11111/11011/11011/11011","B":"11110/11011/11011/11110/11011/11011/11110",
"C":"01111/11000/11000/11000/11000/11000/01111","D":"11110/11011/11011/11011/11011/11011/11110",
"E":"11111/11000/11000/11110/11000/11000/11111","F":"11111/11000/11000/11110/11000/11000/11000",
"G":"01111/11000/11000/11011/11011/11011/01111","H":"11011/11011/11011/11111/11011/11011/11011",
"I":"111/010/010/010/010/010/111","J":"00111/00011/00011/00011/11011/11011/01110",
"K":"11011/11011/11110/11100/11110/11011/11011","L":"11000/11000/11000/11000/11000/11000/11111",
"M":"11011/11111/11111/11011/11011/11011/11011","N":"11011/11111/11111/11111/11011/11011/11011",
"O":"01110/11011/11011/11011/11011/11011/01110","P":"11110/11011/11011/11110/11000/11000/11000",
"Q":"01110/11011/11011/11011/11111/01110/00011","R":"11110/11011/11011/11110/11110/11011/11011",
"S":"01111/11000/11000/01110/00011/00011/11110","T":"11111/00100/00100/00100/00100/00100/00100",
"U":"11011/11011/11011/11011/11011/11011/01110","V":"11011/11011/11011/11011/11011/01110/00100",
"W":"11011/11011/11011/11011/11111/11111/11011","X":"11011/11011/01110/00100/01110/11011/11011",
"Y":"11011/11011/01110/00100/00100/00100/00100","Z":"11111/00011/00110/01100/11000/11000/11111",
" ":"000/000/000/000/000/000/000","1":"010/110/010/010/010/010/111","2":"1111/0001/0001/1111/1000/1000/1111",
"4":"1001/1001/1001/1111/0001/0001/0001","-":"000/000/000/111/000/000/000"}
FONT["É"]=FONT["E"]; FONT["Ú"]=FONT["U"]; FONT["Ê"]=FONT["E"]
INK="#302638"; MARINHO="#163d4b"; CREAM="#ffefbe"; CORAL="#fb956d"; SOFT="#ffc5a3"
SEA="#207d80"; FOAM="#aeead8"; WATER="#4dbeb1"; BLUE="#25766e"

def texto(img, word, center, y, scale=1, fill=CREAM, bichrome=False, outline=None, arc=False):
    """Desenha contorno do conjunto inteiro para que as sombras não virem serrilha."""
    widths=[len(FONT[c].split("/")[0]) + 1 for c in word]
    x=center-(sum(widths)-1)*scale//2
    layers=[Image.new("L",img.size),Image.new("L",img.size),Image.new("L",img.size)]
    d=[ImageDraw.Draw(layer) for layer in layers]
    for i,(c,width) in enumerate(zip(word,widths)):
        yy=y+(round(3*(abs(i-(len(word)-1)/2)/max(1,(len(word)-1)/2))**2) if arc else 0)
        for row, line in enumerate(FONT[c].split("/")):
            for col, bit in enumerate(line):
                if bit=="1":
                    q=(x+col*scale,yy+row*scale,x+(col+1)*scale-1,yy+(row+1)*scale-1)
                    d[0].rectangle(q,fill=255);d[1 if row<3 else 2].rectangle(q,fill=255)
        if c in "ÉÚÊ":
            for xx,offset in ([(1,-2),(2,-3),(3,-2)] if c=="Ê" else [(2,-2),(3,-3)]):
                q=(x+xx*scale,yy+offset*scale,x+(xx+1)*scale-1,yy+(offset+1)*scale-1)
                d[0].rectangle(q,fill=255);d[1].rectangle(q,fill=255)
        x += width*scale
    mask=layers[0]
    if outline:
        # Filtro máximo binário: a máscara de contorno continua apenas 0/255.
        fat=mask.filter(ImageFilter.MaxFilter(3 if scale==1 else 5))
        shadow=Image.new("L",img.size)
        shadow.paste(fat,(0,1 if scale==1 else 3))
        img.paste(INK,(0,0,*img.size),shadow)
        img.paste(outline,(0,0,*img.size),fat)
    if bichrome:
        img.paste(CORAL,(0,0,*img.size),layers[1]);img.paste(CREAM,(0,0,*img.size),layers[2])
    else: img.paste(fill,(0,0,*img.size),mask)

def siri(canvas,x,y,scale=1):
    """Sprite de emblema: olhos, pinças e carapaça com áreas chapadas."""
    img=Image.new("RGBA",(31,23));d=ImageDraw.Draw(img)
    d.line([(9,16),(6,19),(3,19)],fill=INK,width=3)
    d.line([(21,16),(24,19),(27,19)],fill=INK,width=3)
    d.line([(12,18),(10,21),(7,21)],fill=INK,width=2)
    d.line([(18,18),(20,21),(23,21)],fill=INK,width=2)
    d.line([(7,9),(10,14),(15,15),(20,14),(23,9)],fill=INK,width=5)
    d.line([(7,9),(10,14),(15,15),(20,14),(23,9)],fill=CORAL,width=2)
    a=[(2,0),(6,0),(6,4),(9,2),(11,5),(11,8),(8,12),(4,12),(0,8),(0,4)]
    for p in (a,[(30-x,y) for x,y in a]):
        d.polygon(p,fill="#db5c58",outline=INK)
    d.rectangle((2,3,3,7),fill=CORAL);d.rectangle((27,3,28,7),fill=CORAL)
    d.polygon([(8,12),(11,10),(19,10),(22,12),(23,16),(20,19),(10,19),(7,16)],fill=CORAL,outline=INK)
    d.line([(10,15),(20,15)],fill=SOFT,width=1)
    d.line([(10,17),(12,18),(18,18),(20,17)],fill=CREAM,width=2)
    for xx in (11,17):
        d.rectangle((xx,7,xx+2,12),fill=INK);d.point((xx,8),fill=CREAM)
    d.point((15,15), fill=INK)
    canvas.alpha_composite(img.resize((31*scale,23*scale),Image.Resampling.NEAREST),(x,y))

def concha(d,x,y):
    p=[(x,y+6),(x+1,y+2),(x+4,y),(x+8,y),(x+11,y+2),(x+12,y+6),(x+9,y+9),(x+3,y+9)]
    d.polygon(p,fill=SOFT,outline="#72535a")
    d.line([(x+3,y+3),(x+5,y+6),(x+5,y+7)],fill="#ae7466")
    d.line([(x+6,y+2),(x+6,y+7)],fill="#ae7466")
    d.line([(x+9,y+3),(x+7,y+6),(x+7,y+7)],fill="#ae7466")

def onda(d,x,y):
    d.line([(x,y+3),(x+3,y+3),(x+6,y),(x+11,y),(x+14,y+3),(x+18,y+3)],fill=FOAM,width=1)
    d.line([(x+3,y+5),(x+7,y+3),(x+10,y+3)],fill=WATER,width=1)

def enseada(lang):
    img=Image.new("RGBA",(180,94));d=ImageDraw.Draw(img)
    coast=[(2,52),(8,40),(20,35),(34,36),(45,30),(66,37),(79,31),(106,34),(118,29),(143,37),(157,32),(172,40),(177,50),(175,66),(163,78),(150,78),(139,84),(112,86),(90,91),(66,86),(47,88),(25,80),(12,77),(4,66)]
    for dy,col in [(4,MARINHO),(2,SEA),(0,FOAM)]:
        d.polygon([(x,y+dy) for x,y in coast],fill=col)
    d.polygon([(8,52),(18,44),(33,43),(46,37),(64,43),(81,37),(105,40),(119,36),(140,43),(155,38),(167,47),(171,58),(165,69),(151,71),(137,79),(110,82),(89,85),(64,81),(46,83),(27,75),(15,72),(8,62)],fill="#ddae75")
    d.polygon([(13,52),(20,47),(38,46),(48,42),(65,47),(80,42),(105,45),(124,41),(145,47),(158,44),(166,51),(165,62),(150,66),(133,74),(106,76),(89,80),(62,76),(47,79),(29,71),(17,67)],fill="#f6d29b")
    for x,y in [(3,46),(14,72),(147,72),(157,47)]: onda(d,x,y)
    for x,y in [(23,63),(142,66),(28,54),(149,54),(57,75),(123,74),(22,58),(152,59)]:
        d.rectangle((x,y,x+1,y+1),fill="#c99468")
    concha(d,31,65);concha(d,135,64)
    siri(img,75,3)
    title, sub=("MARÉ MIÚDA","ENTRE ILHAS") if lang=="pt" else ("TINY TIDE","BETWEEN ISLANDS")
    texto(img,title,90,40,2,bichrome=True,outline=MARINHO,arc=True)
    texto(img,sub,90,65,1,fill=MARINHO)
    return img

def corrente(lang):
    img=Image.new("RGBA",(180,94));d=ImageDraw.Draw(img)
    crest=[(1,75),(18,73),(31,63),(34,51),(28,46),(20,46),(13,53),(12,44),(19,34),(35,31),(50,37),(56,46),(71,39),(93,39),(117,42),(132,35),(149,33),(160,26),(167,15),(179,14),(173,21),(170,36),(176,49),(179,54),(176,69),(158,78),(150,87),(127,91),(107,87),(86,92),(72,89),(46,93),(27,91),(11,86)]
    d.polygon(crest,fill=MARINHO)
    d.polygon([(9,77),(24,73),(36,62),(40,50),(33,43),(24,41),(17,45),(22,38),(36,35),(52,42),(58,50),(73,43),(92,43),(120,46),(135,39),(150,37),(163,30),(168,22),(166,39),(172,51),(175,55),(170,66),(152,75),(147,83),(127,87),(107,83),(84,88),(66,85),(43,89),(29,87),(14,84)],fill=SEA)
    d.line([(12,78),(28,73),(41,64),(46,51),(39,41),(26,38),(21,41)],fill=FOAM,width=2)
    d.line([(121,47),(139,40),(150,39),(163,31),(171,19),(178,15)],fill=FOAM,width=2)
    d.line([(20,84),(42,83),(56,75),(76,75),(90,79)],fill=WATER,width=2)
    d.line([(103,83),(116,78),(140,78),(153,71),(164,66),(170,61)],fill=WATER,width=2)
    d.line([(33,55),(30,60),(21,66)],fill=WATER,width=2)
    concha(d,148,66)
    for x,y in [(28,30),(22,27),(39,35),(157,47),(158,42),(172,38),(31,74),(43,79),(43,82),(147,80),(134,84)]:
        d.rectangle((x,y,x+1,y+1),fill=FOAM)
    siri(img,68,2)
    title, sub=("MARÉ MIÚDA","ENTRE ILHAS") if lang=="pt" else ("TINY TIDE","BETWEEN ISLANDS")
    texto(img,title,89,35,2,bichrome=True,outline=MARINHO)
    d.polygon([(42,62),(53,59),(130,59),(140,62),(138,73),(130,76),(53,76),(41,73)],fill=MARINHO,outline=FOAM)
    texto(img,sub,90,64,1,fill=CREAM)
    return img

def compacto(direcao):
    canvas=Image.new("RGBA",(40,32));d=ImageDraw.Draw(canvas)
    d.polygon([(5,13),(10,8),(27,8),(34,12),(39,20),(33,28),(22,31),(10,30),(2,25),(1,19)],fill=MARINHO)
    if direcao=="enseada":
        d.polygon([(4,20),(8,15),(15,13),(27,13),(34,17),(36,20),(32,25),(22,29),(12,28),(5,24)],fill="#e7bc83",outline=FOAM)
        d.line([(6,28),(13,30),(20,30)],fill=WATER)
    else:
        d.polygon([(3,20),(10,18),(12,15),(9,12),(15,13),(18,17),(25,17),(34,13),(36,20),(32,25),(22,29),(12,28),(5,24)],fill=SEA,outline=FOAM)
        d.line([(6,25),(13,28),(24,29),(30,27)],fill=WATER)
    siri(canvas,4,1)
    return canvas

def salvar(img,path):
    assert img.mode=="RGBA"
    assert set(img.getchannel("A").get_flattened_data())<= {0,255}
    img.save(path,optimize=True)
    assert Image.open(path).tobytes()==img.tobytes()

def ampliar(img,f):
    return img.resize((img.width*f,img.height*f),Image.Resampling.NEAREST)

def prancha(out):
    # A grade da prancha também é inteira. Todos os painéis são o próprio original ampliado.
    board=Image.new("RGBA",(420,440),"#152a34")
    d=ImageDraw.Draw(board)
    texto(board,"ESTUDOS DE MARCA",210,14,2,fill=CREAM)
    texto(board,"MARÉ MIÚDA  -  TINY TIDE",210,35,1,fill=FOAM)
    for i,(name,render,label) in enumerate((("enseada",enseada,"A  PLACA DE AREIA"),("corrente",corrente,"B  CORRENTE DE ESPUMA"))):
        y=57+i*168
        d.rectangle((12,y,407,y+156),fill="#203c48",outline="#386470")
        d.line((210,y+26,210,y+132),fill="#386470")
        texto(board,label,210,y+9,1,fill=CREAM)
        for lang,x in (("pt",19),("en",220)):
            im=render(lang)
            salvar(im,out/f"{name}-{lang}-1x.png")
            upscale=ampliar(im,4)
            assert upscale.resize(im.size,Image.Resampling.NEAREST).tobytes()==im.tobytes()
            salvar(upscale,out/f"{name}-{lang}-4x.png")
            board.alpha_composite(im,(x,y+30))
        icon=compacto(name)
        salvar(icon,out/f"{name}-compacta-1x.png")
        board.alpha_composite(icon,(190,y+120))
        texto(board,"PORTUGUÊS",107,y+133,1,fill=FOAM)
        texto(board,"ENGLISH",310,y+133,1,fill=FOAM)
    d.line((12,397,407,397),fill="#386470")
    texto(board,"GRADE INTEIRA  -  ESTUDOS",210,410,1,fill=FOAM)
    salvar(ampliar(board,3),out/"mare-miuda-estudos-de-marca.png")

if __name__=="__main__":
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument("destino",type=Path,nargs="?",default=Path("renders"))
    args=parser.parse_args()
    args.destino.mkdir(parents=True,exist_ok=True)
    prancha(args.destino)
