from PIL import Image, ImageDraw, ImageChops

water=['#174d62','#1c6072','#247e85','#36969a','#51aaa2','#8ed6bd']
sand=['#b46955','#d98f61','#efb876','#f7d58e','#ffe6af']
grass=['#143c40','#245b49','#368051','#57a45d','#79b96a','#b1ce79']
cream='#fff0c8'
ink='#123c4b'
def rect(d,x,y,w,h,c): d.rectangle((x,y,x+w-1,y+h-1),fill=c)
def path(d,pts,w,c):
 for (x,y),(a,b) in zip(pts,pts[1:]):
  assert a==x or b==y
  rect(d,min(x,a)-w//2,min(y,b)-w//2,abs(a-x)+w,abs(b-y)+w,c)
FONT={
 'A':'01110 10001 10001 11111 10001 10001 10001','B':'11110 10001 10001 11110 10001 10001 11110','C':'01111 10000 10000 10000 10000 10000 01111','D':'11110 10001 10001 10001 10001 10001 11110','E':'11111 10000 10000 11110 10000 10000 11111','F':'11111 10000 10000 11110 10000 10000 10000','G':'01111 10000 10000 10111 10001 10001 01111','H':'10001 10001 10001 11111 10001 10001 10001','I':'01110 00100 00100 00100 00100 00100 01110','J':'00111 00010 00010 00010 00010 10010 01100','L':'10000 10000 10000 10000 10000 10000 11111','M':'10001 11011 10101 10101 10001 10001 10001','N':'10001 11001 10101 10011 10001 10001 10001','O':'01110 10001 10001 10001 10001 10001 01110','P':'11110 10001 10001 11110 10000 10000 10000','Q':'01110 10001 10001 10001 10101 10010 01101','R':'11110 10001 10001 11110 10100 10010 10001','S':'01111 10000 10000 01110 00001 00001 11110','T':'11111 00100 00100 00100 00100 00100 00100','U':'10001 10001 10001 10001 10001 10001 01110','V':'10001 10001 10001 10001 10001 01010 00100','W':'10001 10001 10001 10101 10101 11011 10001','X':'10001 10001 01010 00100 01010 10001 10001','Y':'10001 10001 01010 00100 00100 00100 00100','Z':'11111 00001 00010 00100 01000 10000 11111','0':'01110 10001 10011 10101 11001 10001 01110','1':'00100 01100 00100 00100 00100 00100 01110','2':'01110 10001 00001 00010 00100 01000 11111','3':'11110 00001 00001 01110 00001 00001 11110','4':'00010 00110 01010 10010 11111 00010 00010','5':'11111 10000 10000 11110 00001 00001 11110','6':'01111 10000 10000 11110 10001 10001 01110','>':'01000 00100 00010 00001 00010 00100 01000','*':'00000 00100 01010 11111 01010 00100 00000',':':'00000 00100 00100 00000 00100 00100 00000','/':'00001 00001 00010 00100 01000 10000 10000'}
def label(im,xy,s,c=cream):
 d=ImageDraw.Draw(im); x,y=xy
 for ch in s:
  if ch=='É':rect(d,x+3,y-2,2,1,c)
  glyph=FONT.get('E' if ch=='É' else ch)
  if glyph:
   for dy,row in enumerate(glyph.split()):
    for dx,bit in enumerate(row):
     if bit=='1':rect(d,x+dx,y+dy,1,1,c)
  x+=4 if ch==' ' else 6
def sea(w,h):
 im=Image.new('RGB',(w,h),water[0]);d=ImageDraw.Draw(im)
 for y in range(13,h,19):
  for x in range(9+(y%3)*9,w-8,31):
   rect(d,x,y,8,1,water[1]);rect(d,x+2,y+2,3,1,water[1])
 return im,d
def tree(d,x,y):
 for X,Y,W,H,C in [(3,14,14,3,grass[0]),(8,10,4,7,sand[0]),(2,5,16,9,grass[0]),(4,2,12,12,grass[1]),(6,0,8,11,grass[2]),(4,4,11,6,grass[3]),(7,2,6,4,grass[4]),(8,2,5,1,grass[5]),(3,7,3,3,grass[2]),(13,8,4,3,grass[2])]:
  rect(d,x+X,y+Y,W,H,C)
def rock(d,x,y):
 for X,Y,W,H,C in [(1,7,12,5,'#555e54'),(4,3,7,8,'#687d6c'),(3,5,7,4,'#90a08a'),(5,3,5,3,'#bcc29c'),(5,3,4,1,'#d7cca0'),(9,8,3,3,'#434e4c')]:
  rect(d,x+X,y+Y,W,H,C)
def shell(d,x,y):
 for yy,row in enumerate(['.....LL.....','...LLHHLL...','..LWHHHHWL..','.LWHMHMHWL.','LWHMHMHMHWL','LHHMHMHMHHL','.LMMMMMMML.','..LLLLLLL..','....LLL....']):
  for xx,c in enumerate(row):
   if c!='.':rect(d,x+xx,y+yy,1,1,{'L':'#984c4d','H':'#ffc598','M':'#e78474','W':'#fff3d2'}[c])
def save(im,fn,sprite,xy):
 assert im.mode=='RGB'
 ref=Image.open(sprite).convert('RGBA');assert set(ref.getchannel('A').getdata())<={0,255}
 im.paste(ref,xy,ref.getchannel('A'))
 for y in range(ref.height):
  for x in range(ref.width):
   rgba=ref.getpixel((x,y))
   if rgba[3]: assert im.getpixel((xy[0]+x,xy[1]+y))==rgba[:3]
 im.save(fn+'-1x.png')
 large=im.resize((im.width*4,im.height*4),Image.Resampling.NEAREST)
 assert ImageChops.difference(large.resize(im.size,Image.Resampling.NEAREST),im).getbbox() is None
 large.save(fn+'.png')
 print(fn, im.size, 'sprite exato',ref.size, 'ampliação inteira 4x')
def select():
 im,d=sea(192,144)
 # A faixa clara é toda composta por blocos; a trilha liga os mesmos marcos do mapa atual.
 coast=[(15,80),(24,80),(24,57),(25,57),(25,36),(33,36),(33,22),(71,22),(71,28),(109,28),(109,20),(137,20),(137,28),(162,28),(162,44),(173,44),(173,65),(159,65),(159,82),(145,82),(145,103),(135,103),(135,119),(98,119),(98,122),(58,122),(58,115),(20,115),(20,105),(15,105)]
 for dx,dy,c in [(0,7,water[1]),(0,5,water[3]),(0,3,water[5]),(0,0,sand[0]),(0,-2,sand[1]),(0,-4,sand[3])]:
  d.polygon([(x+dx,y+dy) for x,y in coast],fill=c)
 for pts,c in [([(26,42),(32,42),(32,27),(71,27),(71,33),(63,33),(63,46),(28,46),(28,58),(26,58)],grass[1]), ([(35,27),(70,27),(70,33),(63,33),(63,42),(31,42),(31,33),(35,33)],grass[3]), ([(91,35),(112,35),(112,27),(135,27),(135,34),(147,34),(147,42),(137,42),(137,54),(110,54),(110,50),(91,50)],grass[1]), ([(95,35),(112,35),(112,27),(135,27),(135,34),(145,34),(145,39),(134,39),(134,49),(107,49),(107,45),(95,45)],grass[3]), ([(121,78),(150,78),(150,63),(158,63),(158,75),(147,75),(147,94),(141,94),(141,106),(126,106),(126,99),(121,99)],grass[2])]:
  d.polygon(pts,fill=c)
 nodes=[(28,97),(43,80),(40,38),(84,46),(123,32),(119,106),(149,35)]
 a,b,c,e,f,g,h=nodes
 ways=[[a,(34,97),(34,80),b],[b,(54,80),(54,52),(40,52),c],[c,(63,38),(63,53),(84,53),e],[e,(101,46),(101,32),f],[b,(43,110),(78,110),(78,103),(108,103),(108,106),g],[g,(113,106),(113,76),(84,76),e],[f,(134,32),(134,42),(149,42),h]]
 for pts in ways:path(d,pts,7,sand[1]);path(d,pts,5,sand[4])
 for x,y in [(24,59),(59,67),(70,28),(139,56),(149,66),(24,43),(96,88),(66,84)]:
  tree(d,x,y)
 for x,y in [(20,82),(72,62),(125,66),(42,61),(84,93),(144,43),(55,89)]:
  rock(d,x,y)
 for x,y in [(65,103),(102,67),(130,101),(31,96),(82,58),(73,78),(21,69),(65,49),(149,50),(98,41)]:
  rect(d,x,y,3,1,sand[2]);rect(d,x+1,y+1,2,1,sand[2])
 for (x,y),name in zip(nodes,['','1','2','3','4','*','>']):
  if not name:continue
  rect(d,x-5,y-6,11,12,ink)
  rect(d,x-4,y-5,9,10,'#378185' if name not in '1*' else '#b46c51')
  rect(d,x-4,y-5,9,1,water[5] if name not in '1*' else '#fcaf74')
  label(im,(x-2,y-3),name)
 rect(d,10,3,172,1,water[3]);label(im,(12,7),'01 / CAMINHO DAS CONCHAS')
 rect(d,10,128,172,1,water[3]);label(im,(12,130),'WASD / SETAS: POR TRILHAS')
 save(im,'caminho-das-conchas-ortogonal','siri-seletor.png',(7,89))
def trav():
 im,d=sea(256,192)
 rect(d,14,13,228,1,water[3]);label(im,(15,19),'TRAVESSIA / TRILHA DAS PEDRAS')
 rect(d,14,35,228,21,water[1]);label(im,(20,42),'MARÉ BAIXA')
 for i in range(3):rect(d,83+i*10,43,6,5,'#8bd1bd' if i<2 else '#24585e')
 label(im,(123,42),'VIRA NO PROXIMO')
 # Estado real do #21: depois dos comandos direita e cima, siri em terra firme.
 grid=['#..H.#','S==.=C','#.####']
 ox,oy=69,94
 def cell(col,row):
  return grid[row][col] if 0<=row<len(grid) and 0<=col<len(grid[row]) else ' '
 for y,row in enumerate(grid):
  for x,c in enumerate(row):
   xx,yy=ox+16*x,oy+16*y
   if c!='#':
    for k,color in [(4,water[1]),(3,water[3]),(2,water[5])]:rect(d,xx-k,yy-k,16+2*k,16+2*k,color)
 for y,row in enumerate(grid):
  for x,c in enumerate(row):
   xx,yy=ox+16*x,oy+16*y
   if c=='#':continue
   base=sand[3] if c!='=' else '#cbb785'
   rect(d,xx,yy,16,16,base)
   for dx,dy,rx,ry,rw,rh in [(-1,0,0,0,1,16),(0,-1,0,0,16,1),(1,0,15,0,1,16),(0,1,0,15,16,1)]:
    if cell(x+dx,y+dy) in [' ','#']: rect(d,xx+rx,yy+ry,rw,rh,sand[4] if c!='=' else water[5])
    else:rect(d,xx+rx,yy+ry,rw,rh,'#d7ae79' if c!='=' else '#ad9f74')
   if c=='=':
    for bx,by in [(3,4),(9,7),(4,12),(9,13)]:rect(d,xx+bx,yy+by,3,1,'#8fa78a')
   if c in '.H':
    rect(d,xx+5,yy+9,3,1,sand[2]);rect(d,xx+2,yy+5,2,1,sand[2])
 for x,y in [(0,0)]:
  xx,yy=ox+x*16,oy+y*16;rect(d,xx,yy,16,16,grass[1]);rock(d,xx+1,yy+2)
  for vx in [0,15]:
   for vy in [0,15]:
    rect(d,xx+min(vx,12),yy+vy,4,1,cream);rect(d,xx+vx,yy+min(vy,12),1,4,cream)
 def corner(x,y,c):
  for vx in [1,14]:
   for vy in [1,14]:
    rect(d,x+min(vx,11),y+vy,4,1,c);rect(d,x+vx,y+min(vy,11),1,4,c)
 for x,y in [(2,0),(1,1)]: corner(ox+16*x,oy+16*y,'#857251')
 corner(ox+16,oy,'#763e3e')
 rock(d,ox+49,oy+1)
 x,y=ox+80,oy+16
 rect(d,x+2,y+2,12,12,'#f7bc76');shell(d,x+2,y+3);corner(x,y,'#994750')
 rect(d,x+14,y-6,1,5,cream);rect(d,x+12,y-4,5,1,cream)
 # Muretas fora do tabuleiro, sem decoração atravessando casas.
 for x,y in [(30,78),(41,84),(208,115),(189,119),(55,151),(181,151),(197,79),(170,69),(33,124),(134,156)]:
  rect(d,x,y,15,8,water[1]);rect(d,x+2,y+1,10,6,water[2]);rect(d,x+3,y-1,8,5,'#58887d');rect(d,x+4,y-2,6,2,'#83aaa0')
 rect(d,14,165,228,1,water[3]);label(im,(15,174),'WASD / SETAS: 1 CASA')
 shell(d,155,173);label(im,(171,174),'ALVO: CONCHA')
 save(im,'travessia-ortogonal','siri-fase.png',(ox+16-9,oy-11))
select();trav()
