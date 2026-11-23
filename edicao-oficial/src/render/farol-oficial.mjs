import { reduzirReflexos } from '@@MARE:modulo:src/selecionar-espalhados-8db16b0e.mjs@@';
import { crescimentoDeFiletesNaBase } from '@@MARE:modulo:src/render/animacao-visual.mjs@@';
import { pintarPecaPraia } from '@@MARE:modulo:src/pecas-praia-d4603eb0.mjs@@';
import { pintarConchaDoMundo, pintarBrilhosDoObjetivo } from '@@MARE:modulo:src/conchas-dos-mundos-192a41fd.mjs@@';
                                                      
import { casasDoRasante, posicoesDosSiris } from '@@MARE:modulo:src/formas-de-fenda-70ff4532.mjs@@';
import { entradasDosSiris, preverDirecoesDaEquipe } from '@@MARE:modulo:src/nomes-dos-siris-e97b332f.mjs@@';
import { conchasDaEquipe } from '@@MARE:modulo:src/conchas-da-equipe-910d11c3.mjs@@';
import { desenharLitoralOficial } from '@@MARE:modulo:src/desenhar-litoral-oficial-b81e24d9.mjs@@';
                                                                      
import { chaveDaCasa, quadroDaPraia } from '@@MARE:modulo:src/render/praia-oficial-terreno.mjs@@';
                                                                
import { traçosNoMar } from '@@MARE:modulo:src/render/encaixe-costeiro.mjs@@';
import { visitaDaPraia, pintarVisitaDaPraia } from '@@MARE:modulo:src/nomes-das-rochas-6e85a20e.mjs@@';
                                                                
import { pintarPecaFarol } from '@@MARE:modulo:src/pintar-peca-farol-dd1d3834.mjs@@';
import { pintarCristaRetangular } from '@@MARE:modulo:src/render/espuma-solta.mjs@@';

export const PALETA_FAROL                = {
  mar: '#142e47', reflexoMar: '#27445b',
  aguaRasa: ['#294e65','#38687b','#568697','#244559','#9abac0'],
  seca: ['#cbd0b0','#e7e7cb','#8e9988','#d9dcc0','#b8c2a7'],
  molhada: ['#919e99','#a7b8ad','#657b7c','#a0ada2','#94a39a'],
  graos: ['#84917d','#a1ad90'],
  juntaSeca: ['#9fac91','#e0e2c6'], juntaMolhada: ['#778a83','#b3c0b1'],
  umidade: ['#a3afa1','#c1cdb7','#84968d'],
  sombraSeca: ['#aab79d','#929f91'],
  sombraMolhada: ['#778b85','#687c7b'],
  sombraSubmersa: ['#395d72','#2e5068'],
  espuma: ['#8aaeb9','#e9ede4'], destino: '#43565c',
};
export const pintarConchaLavanda                         = (pintar, _nome, x, y) =>
  pintarConchaDoMundo(pintar, 'farol', x, y);

                                                                                
                                                                                        
                                                           
                                                                        
const lonjuras = (a      ,b      ,m       ) =>
  a.x+a.largura+m<=b.x||b.x+b.largura+m<=a.x||a.y+a.altura+m<=b.y||b.y+b.altura+m<=a.y;

function semente(id       )        {
  return [...id].reduce((n,v)=>(Math.imul(n,31)+v.charCodeAt(0))>>>0,7);
}

export function quadroDoFarol(mapa                  )              {
  const base=quadroDaPraia(mapa);
  // Só mar lateral: a grade nativa, suas coordenadas internas e suas regras não mudam.
  return {...base,largura:base.largura+192,origemX:base.origemX+96};
}

export function comporFarol(fase     , quadro             )                      {
  const { largura, altura, origemX }=quadro;
  const fim=origemX+fase.mapa[0].length*48;
  const hash=semente(fase.id), aEsquerda=hash%2===0;
  const farol           ={peca:'farol_grande',x:aEsquerda?0:largura-134,y:altura-149,
    arteX:aEsquerda?-18:largura-134,largura:aEsquerda?138:134,altura:149};
  const locais                      =[
    farol,
    {peca:hash%3===0?'moirao':hash%3===1?'bloco':'seixo',
     x:aEsquerda?largura-65:17,y:Math.floor(altura*.42),largura:48,altura:48},
    {peca:'bloco',x:aEsquerda?25:largura-73,y:Math.floor(altura*.12),largura:48,altura:48},
  ];
  const visita=visitaDaPraia(fase.id,{largura,altura,inicioDaGrade:origemX,fimDaGrade:fim},
    locais.map((r,i)=>({...r,preservar:i!==2})));
  if (!visita) throw new Error(`O Farol precisa de uma rocha da Praia: ${fase.id}`);
  return locais.map((r,i)=>i===visita.indice?{...r,...visita,peca:r.peca,visita}:r);
}

export function espumasDoFarol(fase     ,vista             ,estruturas                     ,
  tracos                               ) {
  const fim=vista.origemX+fase.mapa[0].length*48;
  const reservas        =[...estruturas,
    ...tracos.filter(t=>t[4]===0).map(([x,y,largura,altura])=>({x,y,largura,altura}))];
  const grupos        =[];
  for(const x of [vista.origemX-41,fim+20]) {
    const passos=[.58,.22,.41,.74,.31,.12,.86,.47];
    for(const p of passos) {
      const y=Math.floor(vista.altura*p);
      const g={x,y,largura:19,altura:7};
      if(!reservas.every(r=>lonjuras(g,r,10))) continue;
      if (y<4 || y+7>vista.altura-4) continue;
      grupos.push(g); reservas.push(g); break;
    }
  }
  return grupos;
}

const ARTE_FAROL                       ={
  paleta:PALETA_FAROL,
  quadro:quadroDoFarol,
  compor:comporFarol,
  pintarMar(pintar,fase,vista,estruturas) {
    pintar(PALETA_FAROL.mar,0,0,vista.largura,vista.altura);
    const rochas=estruturas.flatMap(({peca,x,y,largura,altura})=>
      Array.from({length:Math.ceil(largura/48)*Math.ceil(altura/48)},(_,i)=>
        [peca,x+(i%Math.ceil(largura/48))*48,y+Math.floor(i/Math.ceil(largura/48))*48]         ));
    const tracos=traçosNoMar(fase.mapa,vista,rochas);
    for(const [x,y,l,a,t] of reduzirReflexos(tracos, t=>t[4]===0))
      if(t===0) pintar(PALETA_FAROL.reflexoMar,x,y,l,a);
    for(const {x,y,largura} of espumasDoFarol(fase,vista,estruturas,tracos))
      pintarCristaRetangular(pintar,{x,y,largura,pontaBranca:true},PALETA_FAROL.espuma);
  },
  pintarEstruturas(pintar,estruturas) {
    for(const {peca,x,y,visita,arteX} of estruturas) {
      if(visita?.peca === 'cunha') pintarPecaFarol(pintar,'cunha_farol',x,y);
      else if(visita) pintarVisitaDaPraia(pintar,visita,PALETA_FAROL.espuma);
      else if(peca==='bloco' || peca==='seixo') pintarPecaPraia(pintar,peca,x,y);
      else if(peca==='moirao') pintarPecaFarol(pintar,peca,x,y);
      // O farol conserva a reserva; a câmera o desenha na moldura inferior.
    }
  },
  pintarEspumaDasEstruturas(pintar,estruturas,pode) {
    for(const {peca,x,y,visita} of estruturas) {
      if(peca==='farol_grande') continue;
      if(visita && visita.peca !== 'cunha') continue;
      const faixas=[[7,40,10,0],[15,42,13,0],[19,42,4,1],[31,41,11,0],[34,41,4,1]]         ;
      for(const [u,v,l,t] of faixas)
        if(Array.from({length:l},(_,i)=>pode(x+u+i,y+v)).every(Boolean))
          pintar(PALETA_FAROL.espuma[t],x+u,y+v,l,1);
      const coordenadas=faixas.map(([u,v,l,t])=>[x+u,y+v,l,t]);
      for(const [a,b,t] of crescimentoDeFiletesNaBase(coordenadas,[{x,y}],pode))
        if(pode(a,b))pintar(PALETA_FAROL.espuma[t==='w'?1:0],a,b,1,1);
    }
  },
  pintarPeca(pintar, nome,x,y) {
    if(nome==='banco') {
      // Antigo abrigo é apenas terra caminável. O desenho não parece rocha ou botão.
      pintar(PALETA_FAROL.seca[4],x+11,y+22,24,8);
      pintar(PALETA_FAROL.seca[3],x+14,y+21,16,3);
      pintar(PALETA_FAROL.graos[0],x+19,y+25,2,2);
      pintar(PALETA_FAROL.graos[1],x+27,y+26,2,2);
    } else if(nome==='concha') {
      pintarConchaLavanda(pintar,nome,x,y);
      pintarBrilhosDoObjetivo(pintar,x,y,'concha');
    } else {
      pintarPecaPraia(pintar,nome,x,y);
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
      if((hash+linha*13+coluna*17)%31===0) pintarPecaFarol(pintar,'arbusto',x,y);
      else if((hash+linha*11+coluna*13)%37===0) pintarPecaFarol(pintar,'duna',x,y);
    }};
  },
};
export function desenharFarolPrevia(ctx                         ,fase     ,estado       ,
  logo                 ,fauna                  )      {
  desenharLitoralOficial(ctx,fase,estado,logo,fauna,ARTE_FAROL);
}
