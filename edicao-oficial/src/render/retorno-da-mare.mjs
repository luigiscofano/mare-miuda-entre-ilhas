// Pulso apenas no sprite, nunca no tabuleiro. Preserva alfa, silhueta e olhos.
export const PAUSA_DA_MARE=264;
export const DURACAO_DA_LEVADA_DA_MARE=504;
export const PAUSA_COM_LEVADA=784;
const PULSOS=[[0,20,0],[20,65,1],[65,96,0],[96,132,-1],
              [132,152,0],[152,197,1],[197,228,0]];
const FRAQUESA=[.17,.31];
const TINTAS=[[255,221,211],[231,247,213],[255,242,206]];
let brilhoAtual;
const cache=new WeakMap();

export function quadroDoRetornoDaMare(retorno, agora) {
 if(!retorno)return;
 const t=agora-retorno.inicio;
 if(t<0)return {ate:retorno.inicio,indices:[]};
 const passo=PULSOS.find(([a,b])=>t>=a&&t<b);
 if(!passo)return;
 const [,fim,tom]=passo;
 return {ate:retorno.inicio+fim,indices:tom<0?[]:retorno.indices,tom};
}
export function comRetornoDaMare(quadro,desenhar){
 const anterior=brilhoAtual;
 brilhoAtual=quadro?.indices.length?quadro:undefined;
 try{return desenhar();}finally{brilhoAtual=anterior;}
}

function spriteComPulso(sprite,sx,sy,w,h,i,tom){
 const chave=[sx,sy,w,h,i,tom].join(':');
 const atlas=cache.get(sprite)??new Map();
 if(atlas.has(chave))return atlas.get(chave);
 if(typeof document==='undefined')return;
 const recorte=document.createElement('canvas');
 recorte.width=w;
 recorte.height=h;
 const ctx=recorte.getContext('2d');
 if(!ctx?.getImageData||!ctx?.putImageData)return;
 ctx.imageSmoothingEnabled=false;
 ctx.drawImage(sprite,sx,sy,w,h,0,0,w,h);
 const imagem=ctx.getImageData(0,0,w,h), cor=imagem.data;
 const mistura=FRAQUESA[tom], luz=TINTAS[i]??TINTAS[0];
 for(let p=0;p<cor.length;p+=4){
  if(!cor[p+3])continue;
  const max=Math.max(cor[p],cor[p+1],cor[p+2]), min=Math.min(cor[p],cor[p+1],cor[p+2]);
  if(max<100||max-min<16)continue;
  for(let j=0;j<3;j++)cor[p+j]=Math.round(cor[p+j]*(1-mistura)+luz[j]*mistura);
 }
 ctx.putImageData(imagem,0,0);
 atlas.set(chave,recorte);
 cache.set(sprite,atlas);
 return recorte;
}
export function desenharSiriComPulso(ctx,sprite,sx,sy,w,h,x,y,l,a,i){
 const brilho=brilhoAtual?.indices.includes(i)?spriteComPulso(sprite,sx,sy,w,h,i,brilhoAtual.tom):undefined;
 if(brilho)ctx.drawImage(brilho,0,0,w,h,x,y,l,a);
 else ctx.drawImage(sprite,sx,sy,w,h,x,y,l,a);
}
