import { traduzir } from '@@MARE:modulo:src/idiomas/idioma.mjs@@';
import { pintarConchaDoMundo } from '@@MARE:modulo:src/conchas-dos-mundos-192a41fd.mjs@@';
export const LARGURA_PLACA=172, ALTURA_PLACA=60;

// Letras em grade nativa: cada número representa uma linha de cinco pixels.
const FONTE={
 F:[31,16,16,30,16,16,16], H:[17,17,17,31,17,17,17],
 K:[17,18,20,24,20,18,17], S:[15,16,16,14,1,1,30],
 W:[17,17,17,21,21,21,10], Y:[17,17,10,4,4,4,4],
 A:[14,17,17,31,17,17,17], B:[30,17,17,30,17,17,30],
 C:[15,16,16,16,16,16,15], D:[30,17,17,17,17,17,30],
 E:[31,16,16,30,16,16,31], G:[15,16,16,23,17,17,15],
 I:[14,4,4,4,4,4,14], L:[16,16,16,16,16,16,31],
 M:[17,27,21,21,17,17,17], N:[17,25,21,19,17,17,17], O:[14,17,17,17,17,17,14],
 P:[30,17,17,30,16,16,16], R:[30,17,17,30,20,18,17],
 T:[31,4,4,4,4,4,4], U:[17,17,17,17,17,17,14], V:[17,17,17,17,17,10,4], Z:[31,1,2,4,8,16,31],
 Ç:[15,16,16,16,16,16,15],
};
const TITULO={
 C:[15,24,24,24,24,24,15], F:[31,24,24,30,24,24,24],
 Y:[27,27,27,14,4,4,4],
 A:[14,27,27,31,27,27,27], D:[30,27,27,27,27,27,30],
 E:[31,24,24,30,24,24,31], I:[31,14,14,14,14,14,31],
 O:[14,27,27,27,27,27,14], R:[30,27,27,30,28,26,27],
 T:[31,14,14,14,14,14,14], V:[27,27,27,27,27,14,4],
};
const PALETAS={
 vitoria:{borda:'#513334', sombra:'#8e5044', luz:'#ffdda0', meio:'#b97550',
   fundo:'#55364a', friso:'#94605b', texto:['#fff0bf','#ffdb8d','#f6bd66'], legenda:'#fff2c8'},
 derrota:{borda:'#24273e', sombra:'#484464', luz:'#bb9cbd', meio:'#745b82',
   fundo:'#303047', friso:'#5c5172', texto:['#f8dff1','#dcbada','#b993c6'], legenda:'#f6e9fa'},
};
const POSITIVOS=new Set(['vitoria','vitória','ganhou','venceu']);
const REF_CAUSAS={
 mare:'Levada pela maré',garca:'Pego pela garça',ambas:'Maré e garça',
};

const px=(ctx,c,x,y,w=1,h=1)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h);};
function texto(ctx, fonte, frase, centro, y, escala, cor, sombra, folga=0){
 const chars=[...frase.toUpperCase()];
 const largura=(chars.length*6-1)*escala+(chars.length-1)*folga;
 const x=centro-Math.floor(largura/2);
 const partes=[];
 for(let i=0;i<chars.length;i++){
  const letra=chars[i];
  if(letra===' ')continue;
  const forma=fonte[letra]??fonte[letra.normalize('NFD')[0]];
  if(!forma)continue;
  const vx=x+i*(6*escala+folga);
  for(let j=0;j<7;j++)for(let k=0;k<5;k++){
   if(forma[j]&(16>>k))partes.push([vx+k*escala,y+j*escala,j]);
  }
  // O agudo não se confunde com a primeira linha; a cedilha fica sob o C.
  if(letra==='É'||letra==='Ó'){
   partes.push([vx+3*escala,y-3*escala,0],[vx+2*escala,y-2*escala,0]);
  }else if(letra==='Ç'){
   partes.push([vx+2*escala,y+7*escala,6],[vx+escala,y+8*escala,6]);
  }
 }
 if(sombra)for(const [a,b] of partes)px(ctx,sombra,a+escala,b+escala,escala,escala);
 for(const [a,b,j] of partes)px(ctx,Array.isArray(cor)?cor[j<2?0:j<5?1:2]:cor,a,b,escala,escala);
}
function formaDaPlaca(ctx,c,x,y,w,h){
 px(ctx,c,x+5,y,w-10,1);px(ctx,c,x+3,y+1,w-6,1);
 px(ctx,c,x+2,y+2,w-4,1);px(ctx,c,x+1,y+3,w-2,2);
 px(ctx,c,x,y+5,w,h-10);
 px(ctx,c,x+1,y+h-5,w-2,2);px(ctx,c,x+2,y+h-3,w-4,1);
 px(ctx,c,x+3,y+h-2,w-6,1);px(ctx,c,x+5,y+h-1,w-10,1);
}
function diamante(ctx,p,x,y){
 px(ctx,p.meio,x-3,y,7);px(ctx,p.meio,x,y-3,1,7);
 px(ctx,p.luz,x-2,y,5);px(ctx,p.luz,x,y-2,1,5);
}

const PIXELS_COROA=[
 '..o.....o.....o..',
 '.oLo...oLo...oLo.',
 '.oLoo.oLLLo.ooLo.',
 '..oLLooLLLooLLo..',
 '..oLLLLLLLLLLLo..',
 '...oMMLLLLMMo....',
 '...oMMMMMMMMo....',
 '...oSSSSSSSSo....',
 '....oooooooo.....',
];
function ornamento(ctx,p,cx,y){
 const cores={o:p.borda,L:p.texto[0],M:p.texto[1],S:p.texto[2]};
 for(const [j,linha] of PIXELS_COROA.entries())
  for(const [i,letra] of Array.from(linha).entries())
   if(cores[letra])px(ctx,cores[letra],cx-8+i,y-5+j);
}
// Raster aprovado de 28×28, convertido em faixas opacas sem retocar pixels.
const FAIXAS_DA_ESPIRAL=[
 [9,1,11,'#e8bcf3'],
 [8,2,1,'#a36dc2'],
 [9,2,1,'#e8bcf3'],
 [10,2,9,'#a36dc2'],
 [19,2,1,'#e8bcf3'],
 [20,2,1,'#a36dc2'],
 [7,3,1,'#4b3766'],
 [8,3,1,'#a36dc2'],
 [9,3,1,'#e8bcf3'],
 [10,3,9,'#a36dc2'],
 [19,3,5,'#e8bcf3'],
 [5,4,5,'#e8bcf3'],
 [10,4,1,'#a36dc2'],
 [11,4,7,'#4b3766'],
 [18,4,5,'#a36dc2'],
 [23,4,1,'#e8bcf3'],
 [24,4,1,'#a36dc2'],
 [4,5,1,'#a36dc2'],
 [5,5,1,'#e8bcf3'],
 [6,5,5,'#a36dc2'],
 [11,5,8,'#4b3766'],
 [19,5,4,'#a36dc2'],
 [23,5,1,'#e8bcf3'],
 [24,5,1,'#a36dc2'],
 [25,5,1,'#4b3766'],
 [3,6,1,'#4b3766'],
 [4,6,1,'#a36dc2'],
 [5,6,1,'#e8bcf3'],
 [6,6,4,'#a36dc2'],
 [10,6,1,'#4b3766'],
 [19,6,3,'#4b3766'],
 [22,6,1,'#a36dc2'],
 [23,6,3,'#e8bcf3'],
 [3,7,1,'#4b3766'],
 [4,7,1,'#a36dc2'],
 [5,7,1,'#e8bcf3'],
 [6,7,1,'#a36dc2'],
 [7,7,3,'#4b3766'],
 [10,7,9,'#e8bcf3'],
 [19,7,3,'#4b3766'],
 [22,7,3,'#a36dc2'],
 [25,7,1,'#e8bcf3'],
 [26,7,1,'#a36dc2'],
 [3,8,3,'#e8bcf3'],
 [6,8,1,'#a36dc2'],
 [7,8,2,'#4b3766'],
 [9,8,1,'#a36dc2'],
 [10,8,1,'#e8bcf3'],
 [11,8,7,'#a36dc2'],
 [18,8,1,'#e8bcf3'],
 [19,8,1,'#a36dc2'],
 [22,8,1,'#4b3766'],
 [23,8,2,'#a36dc2'],
 [25,8,1,'#e8bcf3'],
 [26,8,1,'#a36dc2'],
 [27,8,1,'#4b3766'],
 [2,9,1,'#a36dc2'],
 [3,9,1,'#e8bcf3'],
 [4,9,3,'#a36dc2'],
 [8,9,1,'#4b3766'],
 [9,9,1,'#a36dc2'],
 [10,9,1,'#e8bcf3'],
 [11,9,7,'#a36dc2'],
 [18,9,4,'#e8bcf3'],
 [23,9,1,'#4b3766'],
 [24,9,1,'#a36dc2'],
 [25,9,1,'#e8bcf3'],
 [26,9,1,'#a36dc2'],
 [27,9,1,'#4b3766'],
 [1,10,1,'#4b3766'],
 [2,10,1,'#a36dc2'],
 [3,10,1,'#e8bcf3'],
 [4,10,2,'#a36dc2'],
 [6,10,1,'#4b3766'],
 [8,10,3,'#e8bcf3'],
 [11,10,1,'#a36dc2'],
 [12,10,5,'#4b3766'],
 [17,10,4,'#a36dc2'],
 [21,10,1,'#e8bcf3'],
 [22,10,1,'#a36dc2'],
 [23,10,1,'#4b3766'],
 [24,10,1,'#a36dc2'],
 [25,10,1,'#e8bcf3'],
 [26,10,1,'#a36dc2'],
 [27,10,1,'#4b3766'],
 [1,11,1,'#4b3766'],
 [2,11,1,'#a36dc2'],
 [3,11,1,'#e8bcf3'],
 [4,11,1,'#a36dc2'],
 [5,11,1,'#4b3766'],
 [7,11,1,'#a36dc2'],
 [8,11,1,'#e8bcf3'],
 [9,11,3,'#a36dc2'],
 [12,11,6,'#4b3766'],
 [18,11,3,'#a36dc2'],
 [21,11,1,'#e8bcf3'],
 [22,11,1,'#a36dc2'],
 [23,11,1,'#4b3766'],
 [24,11,1,'#a36dc2'],
 [25,11,1,'#e8bcf3'],
 [26,11,1,'#a36dc2'],
 [27,11,1,'#4b3766'],
 [1,12,1,'#4b3766'],
 [2,12,1,'#a36dc2'],
 [3,12,1,'#e8bcf3'],
 [4,12,1,'#a36dc2'],
 [5,12,2,'#4b3766'],
 [7,12,1,'#a36dc2'],
 [8,12,1,'#e8bcf3'],
 [9,12,2,'#a36dc2'],
 [11,12,1,'#4b3766'],
 [18,12,2,'#4b3766'],
 [20,12,1,'#a36dc2'],
 [21,12,1,'#e8bcf3'],
 [22,12,1,'#a36dc2'],
 [23,12,1,'#4b3766'],
 [24,12,1,'#a36dc2'],
 [25,12,1,'#e8bcf3'],
 [26,12,1,'#a36dc2'],
 [27,12,1,'#4b3766'],
 [1,13,1,'#4b3766'],
 [2,13,1,'#a36dc2'],
 [3,13,1,'#e8bcf3'],
 [4,13,1,'#a36dc2'],
 [6,13,1,'#4b3766'],
 [7,13,1,'#a36dc2'],
 [8,13,1,'#e8bcf3'],
 [9,13,1,'#a36dc2'],
 [10,13,1,'#4b3766'],
 [12,13,4,'#e8bcf3'],
 [18,13,2,'#4b3766'],
 [20,13,1,'#a36dc2'],
 [21,13,1,'#e8bcf3'],
 [22,13,1,'#a36dc2'],
 [23,13,1,'#4b3766'],
 [24,13,1,'#a36dc2'],
 [25,13,1,'#e8bcf3'],
 [26,13,1,'#a36dc2'],
 [27,13,1,'#4b3766'],
 [1,14,1,'#4b3766'],
 [2,14,1,'#a36dc2'],
 [3,14,1,'#e8bcf3'],
 [4,14,1,'#a36dc2'],
 [6,14,1,'#4b3766'],
 [7,14,1,'#a36dc2'],
 [8,14,1,'#e8bcf3'],
 [9,14,1,'#a36dc2'],
 [10,14,1,'#4b3766'],
 [11,14,1,'#a36dc2'],
 [12,14,1,'#e8bcf3'],
 [13,14,3,'#a36dc2'],
 [20,14,1,'#a36dc2'],
 [21,14,1,'#e8bcf3'],
 [22,14,1,'#a36dc2'],
 [23,14,1,'#4b3766'],
 [24,14,1,'#a36dc2'],
 [25,14,1,'#e8bcf3'],
 [26,14,1,'#a36dc2'],
 [27,14,1,'#4b3766'],
 [1,15,1,'#4b3766'],
 [2,15,1,'#a36dc2'],
 [3,15,1,'#e8bcf3'],
 [4,15,1,'#a36dc2'],
 [6,15,1,'#4b3766'],
 [7,15,1,'#a36dc2'],
 [8,15,1,'#e8bcf3'],
 [9,15,1,'#a36dc2'],
 [10,15,1,'#4b3766'],
 [11,15,1,'#a36dc2'],
 [12,15,1,'#e8bcf3'],
 [13,15,3,'#a36dc2'],
 [19,15,3,'#e8bcf3'],
 [22,15,1,'#a36dc2'],
 [23,15,1,'#4b3766'],
 [24,15,1,'#a36dc2'],
 [25,15,1,'#e8bcf3'],
 [26,15,1,'#a36dc2'],
 [27,15,1,'#4b3766'],
 [1,16,1,'#4b3766'],
 [2,16,1,'#a36dc2'],
 [3,16,1,'#e8bcf3'],
 [4,16,1,'#a36dc2'],
 [6,16,1,'#4b3766'],
 [7,16,1,'#a36dc2'],
 [8,16,1,'#e8bcf3'],
 [9,16,1,'#a36dc2'],
 [10,16,1,'#4b3766'],
 [11,16,1,'#a36dc2'],
 [12,16,3,'#e8bcf3'],
 [15,16,1,'#4b3766'],
 [18,16,1,'#a36dc2'],
 [19,16,1,'#e8bcf3'],
 [20,16,3,'#a36dc2'],
 [23,16,1,'#4b3766'],
 [24,16,1,'#a36dc2'],
 [25,16,1,'#e8bcf3'],
 [26,16,1,'#a36dc2'],
 [27,16,1,'#4b3766'],
 [1,17,1,'#4b3766'],
 [2,17,1,'#a36dc2'],
 [3,17,1,'#e8bcf3'],
 [4,17,1,'#a36dc2'],
 [6,17,1,'#4b3766'],
 [7,17,1,'#a36dc2'],
 [8,17,1,'#e8bcf3'],
 [9,17,1,'#a36dc2'],
 [10,17,1,'#4b3766'],
 [11,17,3,'#a36dc2'],
 [14,17,1,'#e8bcf3'],
 [15,17,1,'#a36dc2'],
 [18,17,1,'#a36dc2'],
 [19,17,1,'#e8bcf3'],
 [20,17,2,'#a36dc2'],
 [22,17,1,'#4b3766'],
 [23,17,3,'#e8bcf3'],
 [26,17,1,'#a36dc2'],
 [27,17,1,'#4b3766'],
 [1,18,1,'#4b3766'],
 [2,18,3,'#a36dc2'],
 [6,18,1,'#4b3766'],
 [7,18,1,'#a36dc2'],
 [8,18,1,'#e8bcf3'],
 [9,18,1,'#a36dc2'],
 [10,18,2,'#4b3766'],
 [12,18,2,'#a36dc2'],
 [14,18,6,'#e8bcf3'],
 [20,18,1,'#a36dc2'],
 [21,18,1,'#4b3766'],
 [22,18,1,'#a36dc2'],
 [23,18,1,'#e8bcf3'],
 [24,18,3,'#a36dc2'],
 [27,18,1,'#4b3766'],
 [1,19,4,'#4b3766'],
 [6,19,1,'#4b3766'],
 [7,19,1,'#a36dc2'],
 [8,19,1,'#e8bcf3'],
 [9,19,1,'#a36dc2'],
 [12,19,1,'#4b3766'],
 [13,19,8,'#a36dc2'],
 [21,19,1,'#4b3766'],
 [22,19,1,'#a36dc2'],
 [23,19,1,'#e8bcf3'],
 [24,19,2,'#a36dc2'],
 [26,19,2,'#4b3766'],
 [6,20,1,'#4b3766'],
 [7,20,1,'#a36dc2'],
 [8,20,1,'#e8bcf3'],
 [9,20,1,'#a36dc2'],
 [12,20,2,'#4b3766'],
 [14,20,6,'#a36dc2'],
 [20,20,2,'#4b3766'],
 [22,20,1,'#a36dc2'],
 [23,20,1,'#e8bcf3'],
 [24,20,1,'#a36dc2'],
 [25,20,1,'#4b3766'],
 [6,21,1,'#4b3766'],
 [7,21,1,'#a36dc2'],
 [8,21,4,'#e8bcf3'],
 [14,21,5,'#4b3766'],
 [19,21,5,'#e8bcf3'],
 [24,21,1,'#a36dc2'],
 [25,21,1,'#4b3766'],
 [6,22,1,'#4b3766'],
 [7,22,4,'#a36dc2'],
 [11,22,1,'#e8bcf3'],
 [12,22,1,'#a36dc2'],
 [18,22,1,'#a36dc2'],
 [19,22,1,'#e8bcf3'],
 [20,22,5,'#a36dc2'],
 [25,22,1,'#4b3766'],
 [6,23,2,'#4b3766'],
 [8,23,3,'#a36dc2'],
 [11,23,9,'#e8bcf3'],
 [20,23,4,'#a36dc2'],
 [24,23,2,'#4b3766'],
 [8,24,2,'#4b3766'],
 [10,24,11,'#a36dc2'],
 [21,24,3,'#4b3766'],
 [9,25,2,'#4b3766'],
 [11,25,9,'#a36dc2'],
 [20,25,2,'#4b3766'],
 [11,26,9,'#4b3766']
];
function pintarEspiraisDaDerrota(ctx,cx,cy) {
 const y0=Math.round(cy)-14;
 for (const [x,y,w,cor] of FAIXAS_DA_ESPIRAL) {
  px(ctx,cor,Math.round(cx)-121+x,y0+y,w,1);
  px(ctx,cor,Math.round(cx)+121-x-w,y0+y,w,1);
 }
}

export function desenharPlacaResultado(ctx,tipo,causa,cx,cy,espirais=false){
 const victoria=POSITIVOS.has(String(tipo).toLowerCase());
 const p=PALETAS[victoria?'vitoria':'derrota'];
 const x=Math.round(cx)-LARGURA_PLACA/2,y=Math.round(cy)-ALTURA_PLACA/2;
 const centro=x+LARGURA_PLACA/2;
 formaDaPlaca(ctx,p.borda,x,y+2,LARGURA_PLACA,ALTURA_PLACA-2);
 formaDaPlaca(ctx,p.meio,x,y,LARGURA_PLACA,ALTURA_PLACA-2);
 formaDaPlaca(ctx,p.luz,x+1,y+1,LARGURA_PLACA-2,ALTURA_PLACA-4);
 formaDaPlaca(ctx,p.sombra,x+2,y+3,LARGURA_PLACA-4,ALTURA_PLACA-8);
 formaDaPlaca(ctx,p.fundo,x+3,y+4,LARGURA_PLACA-6,ALTURA_PLACA-10);
 diamante(ctx,p,x+16,y+22);diamante(ctx,p,x+LARGURA_PLACA-17,y+22);
 px(ctx,p.friso,x+19,y+40,LARGURA_PLACA-38);
 texto(ctx,TITULO,traduzir(victoria?'VITÓRIA':'DERROTA'),centro,y+14,3,p.texto,p.borda);
 if(victoria){
// A concha vem do mesmo modulo que desenha a concha jogavel, sem escala
// nem espelhamento; os dois exemplares acompanham a entrada da placa.
 const ch=cy-23;
 const concha=(cor,x,y,w,h)=>px(ctx,cor,x,y,w,h);
 pintarConchaDoMundo(concha,'praia',cx-131,ch);
 pintarConchaDoMundo(concha,'praia',cx+81,ch);
 ornamento(ctx,p,centro,y+49);return;
 }
 const codigo=Array.isArray(causa)?
   causa.includes('mare')&&causa.includes('garca')?'ambas':causa[0]:causa;
 texto(ctx,FONTE,traduzir(REF_CAUSAS[codigo]??'Tente outra vez'),centro,y+45,1,p.legenda,1);
 if(espirais)pintarEspiraisDaDerrota(ctx,cx,cy);
}

// Interlúdio decorativo; quem decide vitória, fracasso e salvamento ainda é o motor.
const VITORIA=[0,58,116,174,228,290,350,419,495,560];
const DERROTA=[0,45,95,280,390,460];
const pixel=(ctx,c,x,y,w=1,h=1)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h);};
export function quadroDoResultado(base,agora,esperando,estatico=false) {
 if(!base)return undefined;
 if(estatico||base.estatico){base.estatico=true;return {...base,placa:true,deslocamento:0,ate:Infinity,t:0};}
 if(esperando)return {pendente:true,ate:Infinity};
 base.inicio??=agora;
 const t=agora-base.inicio;
 const tabela=base.tipo==='vitoria'?VITORIA:DERROTA;
 const i=tabela.findLastIndex(a=>a<=t);
 if(i<0)return undefined;
 if(i===tabela.length-1){
  const entrada=t-tabela.at(-1);
  const marcos=[0,35,72,110,151,192,232];
  const etapa=marcos.findLastIndex(a=>a<=entrada);
  return {...base,placa:true,deslocamento:[12,8,4,1,-2,1,0][etapa],t,
   ate:etapa<marcos.length-1?tabela.at(-1)+marcos[etapa+1]:Infinity};
 }
 return {...base,i,t,ate:tabela[i+1]};
}
export function pulosDoResultado(q) {
 if(!q||q.pendente||q.placa||q.tipo!=='vitoria')return [];
 const arco=[0,-1,-3,-4,-2,0,-1,-1,0];
 return q.siris.map((_,i)=>arco[Math.max(0,q.i-(i%2))]);
}
function brilhar(ctx,x,y,k,cor,centro) {
 if(!k)return;
 pixel(ctx,cor,x-k,y,k*2+1);
 pixel(ctx,cor,x,y-k,1,k*2+1);
 pixel(ctx,centro,x,y);
}
// Cada estrela tem ritmo e tamanho próprios; os raios ficam nas bordas da
// chegada, não no centro da concha/ostra nem na trajetória das patinhas.
const ESTRELAS = [
 [7,9,  [0,2,3,3,2,1,0,0,0], '#f6ce81'],
 [35,7, [0,0,1,2,3,2,1,0,0], '#fff9e6'],
 [43,17,[0,1,2,2,1,0,1,2,1], '#ffdc91'],
 [4,27, [0,0,0,1,2,2,2,1,0], '#fff9e6'],
 [41,39,[0,0,1,1,0,1,2,2,1], '#f6ce81'],
 [12,41,[0,0,0,0,0,1,2,2,0], '#fff9e6'],
 [22,4, [0,1,1,0,0,0,1,1,0], '#f6ce81'],
];
function pintarBrilhos(ctx,q,grade) {
 const {origemX,origemY,lado}=grade;
 const marcas=q.alvos.length?q.alvos:q.siris;
 for(const [i,p] of marcas.entries()){
  const frame=Math.max(0,q.i-i%2);
  const x=origemX+p.coluna*lado,y=origemY+p.linha*lado;
  for(const [u,v,tempos,cor] of ESTRELAS){
   const k=tempos[frame];
   const cx=x+Math.round(u*lado/48),cy=y+Math.round(v*lado/48);
   brilhar(ctx,cx,cy-(k>1?q.i%2:0),k,cor,'#fffdf6');
  }
 }
}
// São protegidos o sprite inteiro, a insígnia e a sombra. A coordenada
// nativa (8,12) e a caixa de 31x23 são comuns aos oito mundos oficiais.
const caixaSiri=(x,y,lado)=>lado===48
 ? [x+3,y,x+43,y+41] : [x-3,y-5,x+35,y+37];
const toca=(x,y,b)=>x>=b[0]&&x<=b[2]&&y>=b[1]&&y<=b[3];
const RISCOS=[
 [1,0,0],[1,-1,1],[0,-1,0],[-1,-1,1],[-1,0,1],[-1,1,0],[0,1,1],[1,1,0],
];
const ZIGUE=[0,0,1,2,2,1,0,-1,-1,0,1,1,0];
function pintarZigues(ctx,q,grade,caixas) {
 const {origemX,origemY,lado,largura,altura}=grade;
 const t=[0,4,8,13,18][q.i];
 const cor=['#a470d2','#ca94f2','#dbadff','#ba84e7','#9764c7'][q.i];
 const centro=Math.floor(lado/2);
 for(const [i,p] of q.siris.entries()){
  const x=origemX+p.coluna*lado,y=origemY+p.linha*lado;
  for(const [n,[dx,dy,fase]] of RISCOS.entries()){
   if(q.i===0 && (n+i)%2===1)continue;
   const pixels=ZIGUE.slice(0,q.i===0?8:q.i===4?9:ZIGUE.length).map((u,j)=>{
    const r=centro+2+t+j+(fase?2:0);
    const v=u*(fase?-1:1);
    return [x+centro+dx*r-dy*v,y+centro+dy*r+dx*v];
   });
   // Descartar o raio inteiro evita que uma linha mordida pareça tocar
   // um segundo Siri nem a borda do quadro.
   if(pixels.some(([a,b])=>a<2||b<2||a>=largura-2||b>=altura-2||
      caixas.some(c=>toca(a,b,c)||toca(a+1,b,c)||toca(a+1,b+1,c))))continue;
   pixels.forEach(([a,b],j)=>{
    pixel(ctx,'#593d80',a+1,b+1);
    pixel(ctx,cor,a,b);
    if(j===4||j===8)pixel(ctx,q.i===2?'#e8cafa':cor,a+1,b);
   });
  }
 }
}
// Canvas fixo independente da camera e das dimensoes do mapa.
let ultimoQuadroPlaca;
export function pintarPlacaNaTela(canvas,q) {
 if(!q?.placa){
  if(!canvas.hidden){canvas.hidden=true;ultimoQuadroPlaca=undefined;}
  return;
 }
 const quadro=JSON.stringify([q.tipo,q.causa,q.deslocamento,canvas.dataset.placaDaCampanha]);
 if(!canvas.hidden&&ultimoQuadroPlaca===quadro)return;
 const ctx=canvas.getContext('2d');
 ctx.clearRect(0,0,canvas.width,canvas.height);
 desenharPlacaResultado(ctx,q.tipo,q.causa,canvas.width/2,canvas.height/2-q.deslocamento,canvas.dataset.placaDaCampanha==='sim');
 ultimoQuadroPlaca=quadro;
 canvas.hidden=false;
}
export function pintarResultado(ctx,q,grade) {
 if(!q||q.pendente||q.placa)return;
 ctx.save();ctx.setTransform(1,0,0,1,0,0);
 const caixas=q.siris.map(p=>caixaSiri(grade.origemX+p.coluna*grade.lado,grade.origemY+p.linha*grade.lado,grade.lado));
 if(q.tipo==='vitoria')pintarBrilhos(ctx,q,grade);
 else pintarZigues(ctx,q,grade,caixas);
 ctx.restore();
}
