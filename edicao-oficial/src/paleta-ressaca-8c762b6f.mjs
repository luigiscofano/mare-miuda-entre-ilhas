import { reduzirReflexos } from '@@MARE:modulo:src/selecionar-espalhados-8db16b0e.mjs@@';
import { pintarPecaPraia } from '@@MARE:modulo:src/pecas-praia-d4603eb0.mjs@@';
import { pintarConchaDoMundo, pintarBrilhosDoObjetivo } from '@@MARE:modulo:src/conchas-dos-mundos-192a41fd.mjs@@';
                                                      
import { casasDoRasante, posicoesDosSiris } from '@@MARE:modulo:src/formas-de-fenda-70ff4532.mjs@@';
import { entradasDosSiris, preverDirecoesDaEquipe } from '@@MARE:modulo:src/nomes-dos-siris-e97b332f.mjs@@';
import { conchasDaEquipe } from '@@MARE:modulo:src/conchas-da-equipe-910d11c3.mjs@@';
import { desenharLitoralOficial } from '@@MARE:modulo:src/desenhar-litoral-oficial-238d1ca4.mjs@@';
                                                                      
import { chaveDaCasa } from '@@MARE:modulo:src/render/praia-oficial-terreno.mjs@@';
                                                                
import { traçosNoMar } from '@@MARE:modulo:src/render/encaixe-costeiro.mjs@@';
import { visitaDaPraia, ROCHAS_EM_VISITA } from '@@MARE:modulo:src/nomes-das-rochas-6e85a20e.mjs@@';
                                                                
import { pintarEspumaDasEstruturasPraia } from '@@MARE:modulo:src/compor-estruturas-praia-d23b935a.mjs@@';
import { pintarCristaRetangular } from '@@MARE:modulo:src/render/espuma-solta.mjs@@';
import { comporEfeitosDoMar, pintarVaporDoBasalto, pintarVaporDoMar } from '@@MARE:modulo:src/render/efeitos-do-mar-das-brasas.mjs@@';
import { pintarPecaRessaca } from '@@MARE:modulo:src/pintar-peca-ressaca-7a4f6fdd.mjs@@';

export const PALETA_RESSACA                = {
  mar: '#142e47', reflexoMar: '#223e4d',
  aguaRasa: ['#284e62','#365e71','#537b90','#214253','#a4c9c9'],
  seca: ['#777378','#aba6a7','#4c484f','#847f85','#6e686f'],
  molhada: ['#464850','#626671','#35363e','#50515c','#41434c'],
  graos: ['#49464e','#59555e'],
  juntaSeca: ['#625d65','#88838a'], juntaMolhada: ['#3a3c44','#666972'],
  umidade: ['#64616b','#72717b','#53515d'],
  sombraSeca: ['#5d575f','#423c47'],
  sombraMolhada: ['#3b3a42','#2e2e36'],
  sombraSubmersa: ['#214654','#1e384b'],
  espuma: ['#719aa9','#e1edf0'], destino: '#303b44',
};
export const pintarConchaCobre                         = (pintar, _nome, x, y) =>
  pintarConchaDoMundo((cor,u,v,l,a)=>pintar(cor==='#a17f73'?'#615e66':cor,u,v,l,a), 'ressaca', x, y);

                                                                                                               
const CONTATO_DAS_PEROLAS                                  = {
  '#c39e77':'#615e66', '#d6b48b':'#6b6870',
};
export function pintarPecaComSombraDasBrasas(pintar                                      ,
  nome               ,x       ,y       )      {
  // Todos os destinos e pérolas estão em piso firme. Só remapeamos os
  // pigmentos reservados ao contato; os recessos da ostra não são sombras no chão.
  const eOstra = nome.startsWith('ostra');
  pintarPecaPraia((cor,u,v,l,a)=>{
    const tom = eOstra ? (cor==='#b2876f'?'#615e66':cor) : (CONTATO_DAS_PEROLAS[cor]??cor);
    pintar(tom,u,v,l,a);
  },nome,x,y);
}

export function pintarAlertaDasBrasas(
  pintar                                       ,
  nome                                  , x        , y        ,
)       {
  // O desenho original mantém a cor. O filete mineral sob os traços
  // separa o sinal vermelho do piso escuro sem preencher a célula.
  pintarPecaPraia((_cor,u,v,l,a)=>pintar('#c1a9a5',u-1,v-1,l+2,a+2),nome,x,y);
  pintarPecaPraia(pintar,nome,x,y);
}

const FORMAS_LOCAIS = ['bloco', 'seixo', 'cunha', 'gemeas']         ;
                                                                                                                 
                                                                                    

function semente(id       )        {
  return [...id].reduce((n,v)=>(Math.imul(n,31)+v.charCodeAt(0))>>>0,7);
}

export function comporRessaca(fase     , quadro             )                      {
  const { largura, altura, origemX }=quadro;
  const a=Math.floor((origemX-48)/2), b=largura-a-48;
  const hash=semente(fase.id), [esq,dir]=hash%2===0?[a,b]:[b,a];
  const coordenadas=[[esq,Math.floor(altura*.23)-24],[dir,Math.floor(altura*.40)-24],
    [esq,Math.floor(altura*.79)-24]];
  const diferenciadas=FORMAS_LOCAIS.filter(peca=>peca!==ROCHAS_EM_VISITA[fase.id]);
  const locais=coordenadas.map(([x,y],i)          =>({
    peca:diferenciadas[((hash>>>5)+i)%diferenciadas.length],x,y,largura:48,altura:48,
  }));
  const visita=visitaDaPraia(fase.id,{largura,altura,inicioDaGrade:origemX,
    fimDaGrade:origemX+fase.mapa[0].length*48},locais);
  if (!visita) throw new Error(`A Baía precisa de uma rocha da Praia: ${fase.id}`);
  return locais.map((r,i)=>i===visita.indice?{...r,...visita,visita}:r);
}

export function efeitosDasBrasas(fase     ,vista             ,estruturas                     ) {
  const rochas=estruturas.flatMap(({peca,x,y,altura})=>
    Array.from({length:altura/48},(_,i)=>[peca,x,y+i*48]         ));
  const traços=traçosNoMar(fase.mapa,vista,rochas);
  const terra=fase.mapa.flatMap((fila,j)=>[...fila].flatMap((c,i)=>
    c==='#'?[]:[[vista.origemX+i*48,vista.origemY+j*48,48,48]         ]));
  const reservas=[...terra,...estruturas.map(r=>[r.x,r.y,r.largura,r.altura]         ),
    ...traços.filter(t=>t[4]===0).map(([x,y,l,a])=>[x,y,l,a]         )];
  const efeitos=comporEfeitosDoMar(vista.largura,vista.altura,reservas,semente(fase.id));
  return {traços,efeitos};
}

const ARTE_RESSACA                       ={
  paleta:PALETA_RESSACA,
  compor:comporRessaca,
  pintarMar(pintar,fase,vista,estruturas) {
    pintar(PALETA_RESSACA.mar,0,0,vista.largura,vista.altura);
    const {traços,efeitos}=efeitosDasBrasas(fase,vista,estruturas);
    for(const [x,y,l,a,t] of reduzirReflexos(traços, t=>t[4]===0))
      if(t===0) pintar(PALETA_RESSACA.reflexoMar,x,y,l,a);
    efeitos.forEach((efeito,i)=>{
      if(efeito.especie==='vapor') pintarVaporDoMar(pintar,efeito,i);
      else {
        const [x,y]=efeito.caixa;
        pintarCristaRetangular(pintar,{x:x+1,y,largura:19,pontaBranca:true},PALETA_RESSACA.espuma);
      }
    });
  },
  pintarEstruturas(pintar,estruturas) {
    for(const {peca,x,y} of estruturas) {
      pintarPecaRessaca(pintar,peca,x,y);
      pintarVaporDoBasalto(pintar,peca,x,y);
    }
  },
  pintarEspumaDasEstruturas(pintar,estruturas,pode) {
    for (const r of estruturas) {
      // Aproveita a geometria costeira da Praia. Só ficam os pixels
      // inferiores, dentro da reserva marinha e em água realmente livre.
      const faixaInferior=r.peca==='espigao'?73:31;
      pintarEspumaDasEstruturasPraia(pintar,[r],(u,v)=>
        u>=r.x && u<r.x+r.largura && v>=r.y+faixaInferior && v<r.y+r.altura
        && pode(u,v),PALETA_RESSACA.espuma);
    }
  },
  pintarPeca(pintar, nome,x,y) {
    if(nome==='banco') {
      // Antigo abrigo é apenas terra caminável. O desenho não parece rocha ou botão.
      pintar(PALETA_RESSACA.seca[4],x+11,y+22,24,8);
      pintar(PALETA_RESSACA.seca[3],x+14,y+21,16,3);
      pintar(PALETA_RESSACA.graos[0],x+19,y+25,2,2);
      pintar(PALETA_RESSACA.graos[1],x+27,y+26,2,2);
    } else if(nome==='concha') {
      pintarConchaCobre(pintar,nome,x,y);
      pintarBrilhosDoObjetivo(pintar,x,y,'concha');
    } else if(nome==='garca-imediata'||nome==='garca-aviso') {
      pintarAlertaDasBrasas(pintar,nome,x,y);
    } else {
      pintarPecaComSombraDasBrasas(pintar,nome,x,y);
      if(nome==='ostra-aberta'||nome==='ostra-fechada') pintarBrilhosDoObjetivo(pintar,x,y,nome);
    }
  },
  mecanismos(fase,estado) {
    // Enfeites se limitam a terra firme vazia, sem sobrepor marcas úteis.
    const protegidas=new Set([
      ...posicoesDosSiris(estado).map(chaveDaCasa),
      ...casasDoRasante(fase,estado.passos+1).map(chaveDaCasa),
      ...entradasDosSiris(estado.situacao==='jogando'?preverDirecoesDaEquipe(fase,estado):[]),
      ...conchasDaEquipe(fase,estado).keys(),
      ...(fase.ameaca?[chaveDaCasa(fase.ameaca.alvo)]:[]),
    ]);
    const hash=semente(fase.id);
    return { fechados:new Set(), pintar(pintar,pos,x,y) {
      const {linha,coluna}=pos;
      if(fase.mapa[linha][coluna]!=='.'||protegidas.has(chaveDaCasa(pos))) return;
      if((hash+linha*13+coluna*17)%31===0) pintarPecaRessaca(pintar,'roseta',x,y);
      else if((hash+linha*11+coluna*13)%37===0) pintarPecaRessaca(pintar,'grama',x,y);
    }};
  },
};
export function desenharRessacaPrevia(ctx                         ,fase     ,estado       ,
  logo                 ,fauna                  )      {
  desenharLitoralOficial(ctx,fase,estado,logo,fauna,ARTE_RESSACA);
}
