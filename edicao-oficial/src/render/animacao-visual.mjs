import { desenharSiriSobAMare, siriCobertoPelaMare } from '@@MARE:modulo:src/render/mare-direcional.mjs@@';
import { desenharSiriComPulso } from '@@MARE:modulo:src/render/retorno-da-mare.mjs@@';
import { poseDoSiriEmPerigo } from '@@MARE:modulo:src/render/efeitos-de-perigo.mjs@@';
// Fora do quadro de jogo, exportações e reduções de movimento ficam estáticas.
let atual;
export function comQuadroAnimado(quadro, desenhar) {
  const anterior=atual;
  atual=quadro;
  try { return desenhar(); }
  finally { atual=anterior; }
}
export function puloDoSiri(indice) { return atual?.pulos?.[indice] ?? 0; }
// A previsão continua sendo calculada pelo motor. Só os cantos e suas
// insígnias esperam a equipe pousar, inclusive nas travessias por fenda.
export function mostrarCantosDeDestino() {
  return !atual?.pulos?.some(pose => pose && typeof pose === 'object')
    && !atual?.fendas?.some(Boolean);
}

export function brilhoDaEspuma(x,y) {
  const f=atual?.ambiente??0;
  if(!f)return 0;
  return [0,1,2,1][f%4] * (((x+y)%3===0)?-1:1);
}
export function oscilacaoDoVapor(x,y,dy) {
  const f=atual?.ambiente??0;
  if(!f||dy>=-5)return 0;
  return (([0,1,2,1][f%4]) * ((x+y)%5<2?-1:1));
}

// Reduz ou abre apenas a parte clara de uma crista solta dentro da própria máscara.
export function apararCristaSolta(x,y,largura) {
  const f=atual?.ambiente??0;
  if(!f||largura<2)return [0,largura];
  const avanco=Math.min(largura-1,[0,2,4,2][f%4]);
  return [(f+x+y)%2?avanco:0,largura-avanco];
}
export function subirVaporSolto(x,y,dy) {
  const f=atual?.ambiente??0;
  if(!f||dy>=-7)return 0;
  return (f+(x+y)%2)%4===2 ? 1 : 0;
}

// Os estados lógicos de turno e de saída não aguardam estes quadros.
export const ENTRADA_DA_FENDA_MS = 96;
export const SAIDA_DA_FENDA_MS = 335;
export const FIM_DA_FENDA = 505;
// Retângulos de pixels escuros contidos inteiramente no fundo de cada boca.
// Coordenadas relativas ao tile; não incluem a borda clara nem a parede interna.
const BOCA_ESCURA = {
  redonda: [18,19,13,6],
  estreita: [25,24,5,3],
  bifurcada: [20,23,4,3],
};
const QUADROS_FENDA = [
  {ate:34,restante:3,alternancia:1}, {ate:68,restante:2,alternancia:-1},
  {ate:ENTRADA_DA_FENDA_MS,restante:1,alternancia:1},
  {ate:130,tamanho:4,entrada:true}, {ate:166,tamanho:3,entrada:true},
  {ate:203,tamanho:2,entrada:true}, {ate:239,tamanho:1,entrada:true},
  {ate:278,tamanho:0,entrada:true}, {ate:310,oculta:true,entrada:true},
  {ate:SAIDA_DA_FENDA_MS,oculta:true},
  {ate:373,tamanho:0}, {ate:406,tamanho:1}, {ate:439,tamanho:2},
  {ate:472,tamanho:3}, {ate:FIM_DA_FENDA,tamanho:4},
];
export function proximoQuadroDeFenda(tempo) {
  return QUADROS_FENDA.find(q=>tempo<q.ate)?.ate;
}
export function posesDeFenda(fendas,tempo) {
  if (!fendas?.some(Boolean)||tempo<0) return [];
  const quadro=QUADROS_FENDA.find(q=>tempo<q.ate);
  if(!quadro)return [];
  return fendas.map(pos=>{
    if(!pos)return undefined;
    if(quadro.restante) {
      const dx=pos.dxOrigem??0,dy=pos.dyOrigem??0;
      return {passada:{
        dx:pos.dx+Math.round(dx*quadro.restante/4),dy:pos.dy+Math.round(dy*quadro.restante/4),
        eixo:dx?'horizontal':'vertical',direcao:Math.sign(-(dx||dy)),alternancia:quadro.alternancia,
      }};
    }
    const {tamanho,oculta,entrada}=quadro;
    const direcao=Math.sign(-(pos.dxOrigem||pos.dyOrigem||-1));
    return {
      dx:entrada?pos.dx:0,dy:entrada?pos.dy:0,
      fenda:true, boca:BOCA_ESCURA[pos.forma]??BOCA_ESCURA.redonda, tamanho, oculta,
      areia:entrada?graosDaFenda(tempo-ENTRADA_DA_FENDA_MS,direcao):graosDaFenda(tempo-SAIDA_DA_FENDA_MS,-direcao),
    };
  });
}
// Duas rajadas curtas usam mechas da paleta de areia do tabuleiro. Os grãos
// de dois pixels se desfazem em um ao cair; nenhum usa opacidade intermediária.
const GRAOS_DA_BOCA=[
  [-7,-13,8,0,2,'#c09562'], [7,14,8,0,2,'#e9cc92'],
  [-4,-11,14,0,1,'#efd7a0'], [3,10,12,0,2,'#dfb67c'],
  [-10,-9,6,0,1,'#a67655'], [10,9,5,0,1,'#efd7a0'],
  [1,-5,9,0,1,'#b48a61'], [-3,-6,17,0,1,'#e9cc92'],
  [1,5,16,0,1,'#dfb67c'], [9,8,11,12,1,'#c09562'],
  [-10,-6,11,16,1,'#efd7a0'], [5,12,6,16,1,'#b48a61'],
  [-2,-7,10,18,2,'#dfb67c'], [4,9,13,21,1,'#efd7a0'],
  [-7,-11,4,23,1,'#e9cc92'], [11,8,6,27,1,'#c09562'],
  [1,-6,13,31,1,'#dfb67c'], [-5,-10,7,34,1,'#e9cc92'],
  [7,12,3,39,2,'#c09562'], [0,4,8,43,1,'#efd7a0'],
];
export function graosDaFenda(t,direcao=1) {
  return GRAOS_DA_BOCA.flatMap(([x,v,a,inicio,tamanho,cor],i)=>{
    const p=(t-inicio)/(111+(i%5)*7);
    if(p<0||p>=1)return [];
    const deslocamento=Math.round(x+v*p)*direcao;
    const altura=Math.round(4*a*p*(1-p));
    return [{x:deslocamento,y:-altura+(i%5)-1,tamanho:p>.78?1:tamanho,cor}];
  });
}
// A mesma silhueta encolhe em degraus até caber no núcleo escuro e
// refaz as mesmas poses na ordem inversa quando emerge do outro lado.
function medidasDaFenda(x,y,w,h,pose) {
  if(pose.oculta)return undefined;
  const [a,b,largura,altura]=pose.boca;
  const proporcao=[0,.23,.47,.70,1][pose.tamanho];
  const l=largura+Math.round((w-largura)*proporcao);
  const al=altura+Math.round((h-altura)*proporcao);
  const origemX=x+pose.dx-8,origemY=y+pose.dy-12;
  const px=origemX+Math.round(a+(largura-l)/2 + (23.5-(a+largura/2))*proporcao);
  const py=origemY+Math.round(b+(altura-al)/2 + (23.5-(b+altura/2))*proporcao);
  return [px,py,l,al];
}
// A posição lógica já foi resolvida. Só o desenho percorre a casa.
export const DURACAO_DA_PASSADA = 205;
const QUADROS_DA_PASSADA = [[66, 1], [136, -1], [DURACAO_DA_PASSADA, 1]];
const QUADROS_ANTERIORES = [[53, 1], [109, -1], [165, 1]];
const quadrosDaPassada = campanha => campanha ? QUADROS_DA_PASSADA : QUADROS_ANTERIORES;
export function proximaPoseDaPassada(tempo, campanha = true) {
  const trocaDePatas=quadrosDaPassada(campanha).find(([ate])=>tempo<ate)?.[0];
  if(trocaDePatas===undefined)return undefined;
  const taxa=1000/60;
  const pintura=(Math.floor((tempo+1e-6)/taxa)+1)*taxa;
  return Math.min(trocaDePatas,pintura);
}
export function posesDaPassada(passadas,tempo,campanha = true) {
  if(!passadas?.some(Boolean)||tempo<0)return [];
  const quadros=quadrosDaPassada(campanha);
  const quadro=quadros.find(([ate])=>tempo<ate);
  if(!quadro)return [];
  const [, alternancia] = quadro;
  const restante = 1 - tempo / quadros.at(-1)[0];
  return passadas.map(p=>p?{
    dx:Math.round(p.dx*restante),dy:Math.round(p.dy*restante),
    eixo:p.dx?'horizontal':'vertical',direcao:Math.sign(-(p.dx||p.dy)),alternancia,
  }:undefined);
}
function passadaDoSiri(i) {
  const pose=atual?.pulos?.[i];
  return pose&&typeof pose==='object'?pose:undefined;
}
export function fendaEscondeSombra(i) { return atual?.fendas?.[i]?.fenda===true; }
export function sombraDoSiriAnimada(x,y,i) {
  if(siriCobertoPelaMare(i))return [-100,-100];
  const ataque=atual?.perigos?.[i];
  if(ataque?.tipo==='garca'&&ataque.caminho){
    const r=poseDoSiriEmPerigo(ataque);
    return [x+r.dx,y+r.dy];
  }
  const fenda=atual?.fendas?.[i];
  const passo=fenda?.passada ?? fenda ?? passadaDoSiri(i);
  return passo?[x+passo.dx,y+passo.dy]:[x,y];
}
function desenharPassada(ctx,sprite,sx,sy,w,h,x,y,passo) {
  const base=19, meio=15;
  const ox=x+passo.dx,oy=y+passo.dy;
  ctx.drawImage(sprite,sx,sy,w,base,ox,oy,w,base);
  for(const [inicio,largura,lado] of [[0,meio,-1],[meio,w-meio,1]]){
    const fase=passo.alternancia*lado;
    // Na horizontal uma fileira avança e a outra recolhe; na vertical
    // as pontas se alternam em altura. O torso e a silhueta de repouso são os originais.
    const horizontal=passo.eixo==='horizontal';
    const dx=horizontal ? fase*passo.direcao*2 : fase;
    const dy=horizontal ? (fase>0?-1:1) : fase*passo.direcao*2;
    // A primeira linha de articulação preenche o vão quando as patas estendem.
    if(dy>0)ctx.drawImage(sprite,sx+inicio,sy+base,largura,1,ox+inicio+dx,oy+base,largura,dy);
    ctx.drawImage(sprite,sx+inicio,sy+base,largura,h-base,ox+inicio+dx,oy+base+dy,largura,h-base);
  }
}
export function desenharSiriAnimado(ctx,sprite,sx,sy,w,h,x,y,i) {
  if(desenharSiriSobAMare(ctx,sprite,sx,sy,w,h,x,y,i))return;
  const pose=poseDoSiriEmPerigo(atual?.perigos?.[i])??atual?.fendas?.[i];
  if(!pose){
    const passo=passadaDoSiri(i);
    if(passo)return desenharPassada(ctx,sprite,sx,sy,w,h,x,y,passo);
    desenharSiriComPulso(ctx,sprite,sx,sy,w,h,x,y+puloDoSiri(i),w,h,i);
    return;
  }
  if(pose.passada)return desenharPassada(ctx,sprite,sx,sy,w,h,x,y,pose.passada);
  if(pose.fenda){
    const medidas=medidasDaFenda(x,y,w,h,pose);
    if(medidas){
      const suave=ctx.imageSmoothingEnabled;
      ctx.imageSmoothingEnabled=false;
      ctx.drawImage(sprite,sx,sy,w,h,...medidas);
      ctx.imageSmoothingEnabled=suave;
    }
    const [a,b,l,al]=pose.boca;
    const centroX=x+pose.dx-8+a+Math.floor(l/2);
    const centroY=y+pose.dy-12+b+Math.floor(al/2);
    for(const p of pose.areia){
      ctx.fillStyle=p.cor;
      ctx.fillRect(centroX+p.x,centroY+p.y,p.tamanho,1);
    }
    return;
  }
  // Mantém o lábio do sprite de terreno exposto: as linhas mais baixas
  // do corpo desaparecem primeiro e o recorte fica mais estreito junto à boca.
  const altura=h-pose.oculto, ox=x+pose.dx, oy=y+pose.dy;
  const corte=pose.corteNaBoca??0;
  if(altura>0){
    const base=oy+pose.oculto-corte;
    const canal=pose.canal??0;
    if(!canal)ctx.drawImage(sprite,sx,sy,w,altura,ox,base,w,altura);
    else {
      const labios=Math.min(5,altura), torso=altura-labios;
      if(torso>0)ctx.drawImage(sprite,sx,sy,w,torso,ox,base,w,torso);
      for(let r=0;r<labios;r++){
        const margem=Math.min(10,Math.round((canal*(r+1))/labios));
        const largura=w-2*margem;
        ctx.drawImage(sprite,sx+margem,sy+torso+r,largura,1,ox+margem,base+torso+r,largura,1);
      }
    }
  }
  for(const p of pose.areia??[]) {
    ctx.fillStyle=p.cor;
    ctx.fillRect(ox+15+p.x,oy+19+p.y,p.tamanho,p.tamanho===2?1:p.tamanho);
  }
}

// O canto é uma previsão, não parte do Siri. Recorta também o vão entre
// patas/pinças para que a cor não pareça atravessar o personagem.
export function pincelDeCantosSemSiris(pintar,siris,origemX,origemY,origemSiri) {
  const mascaras=siris.map(({coluna,linha},i)=>{
    const x=origemX+coluna*48+origemSiri[0],y=origemY+linha*48+origemSiri[1];
    const ataque=atual?.perigos?.[i];
    if(ataque?.tipo==='garca'&&ataque.caminho){
      const r=poseDoSiriEmPerigo(ataque);
      return [x+r.dx,y+r.dy,31,23];
    }
    const fenda=atual?.fendas?.[i], passo=fenda?.passada??passadaDoSiri(i);
    if(passo)return [x+passo.dx-2,y+passo.dy,35,25];
    if(fenda?.fenda)return medidasDaFenda(x,y,31,23,fenda);
    if(fenda){
      if(fenda.oculto>=23)return undefined;
      return [x+fenda.dx,y+fenda.dy+fenda.oculto-(fenda.corteNaBoca??0),31,23-fenda.oculto];
    }
    return [x,y+puloDoSiri(i),31,23];
  }).filter(Boolean);
  return (cor,x,y,w,h)=>{
    let partes=[[x,y,w,h]];
    for(const [a,b,l,m] of mascaras)partes=partes.flatMap(([px,py,pw,ph])=>{
      const x0=Math.max(px,a),y0=Math.max(py,b),x1=Math.min(px+pw,a+l),y1=Math.min(py+ph,b+m);
      if(x1<=x0||y1<=y0)return [[px,py,pw,ph]];
      return [[px,py,pw,y0-py],[px,y1,pw,py+ph-y1],
        [px,y0,x0-px,y1-y0],[x1,y0,px+pw-x1,y1-y0]].filter(([, ,w,h])=>w>0&&h>0);
    });
    for(const p of partes)pintar(cor,...p);
  };
}

// Em repouso preserva a espuma original. Na crista, o filete cresce
// em degraus inteiros no mar à frente, sem tocar nas laterais da rocha.
function projetarEspumaDaBase(sementes, limites, permite, jaTemEspuma = () => false) {
  const fase = atual?.ambiente ?? 0;
  if (fase !== 1 && fase !== 2) return [];
  const candidatos = sementes.filter(([x,y]) =>
    x >= limites[0] && x < limites[1]);
  if (!candidatos.length) return [];
  const ultimoY = Math.max(...candidatos.map(([,y])=>y));
  const borda = new Map();
  for (const [x,y] of candidatos) {
    if (y < ultimoY - 2) continue;
    borda.set(x, Math.max(borda.get(x) ?? -Infinity,y));
  }
  const pontos = [];
  const adicionar = (x,y,t) => {
    if (x >= limites[0] && x < limites[1] && permite(x,y)) pontos.push([x,y,t]);
  };
  for (const [x,y] of borda) {
    adicionar(x,y+1,'w');
    if (fase === 1 && borda.has(x-1) && borda.has(x+1) && jaTemEspuma(x,y+1))
      adicionar(x,y+2,'b');
    if (fase === 2) {
      // Continua a onda abaixo do filete já pintado, mas nunca passa por terra.
      if (permite(x,y+1) || jaTemEspuma(x,y+1)) adicionar(x,y+2,'w');
      if (!borda.has(x-1)) adicionar(x-1,y+1,'b');
      if (!borda.has(x+1)) adicionar(x+1,y+1,'b');
    }
  }
  return pontos;
}

export function crescimentoDaBaseNaMascara(linhas, offsetX, permite) {
  const sementes = [];
  for (let j = Math.max(0, linhas.length-7); j < linhas.length; j++) {
    for(let i = 0; i < linhas[j].length; i++) {
      if(linhas[j][i] === 'w') sementes.push([i,j]);
    }
  }
  return projetarEspumaDaBase(sementes,[9-offsetX,39-offsetX],permite,(x,y)=>['w','b'].includes(linhas[y]?.[x]));
}

export function crescimentoDeFiletesNaBase(faixas, rochas, permite) {
  const pixels = new Map();
  for(const {x,y,largura=48,altura=48} of rochas) {
    const sementes = [];
    const jaTemEspuma = (u,v) => faixas.some(([a,b,l])=>v===b && u>=a && u<a+l);
    for(const [a,b,l,clara] of faixas) {
      if (!clara || b < y+altura-16 || b > y+altura+5) continue;
      for(let i=0; i<l; i++) sementes.push([a+i,b]);
    }
    for(const [a,b,t] of projetarEspumaDaBase(sementes,[x+9,x+largura-9],permite,jaTemEspuma)) {
      const chave = a + ',' + b;
      if (t === 'w' || !pixels.has(chave)) pixels.set(chave,[a,b,t]);
    }
  }
  return [...pixels.values()];
}
