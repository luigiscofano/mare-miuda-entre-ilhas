import { comporExtrasDaPraia, pintarVisitaDaPraia } from '@@MARE:modulo:src/nomes-das-rochas-6e85a20e.mjs@@';
                                                      
import { desenharLitoralOficial } from '@@MARE:modulo:src/desenhar-litoral-oficial-53e7dfae.mjs@@';
                                                        
import { comporEstruturasPraia, pintarEspumaDasEstruturasPraia, pintarEstruturasPraia } from '@@MARE:modulo:src/compor-estruturas-praia-d23b935a.mjs@@';
                                                                    
import { pintarMarPraia } from '@@MARE:modulo:src/render/praia-oficial-mar.mjs@@';
import { pintarPecaPraia } from '@@MARE:modulo:src/pecas-praia-d4603eb0.mjs@@';
import { PALETA_PRAIA } from '@@MARE:modulo:src/render/praia-oficial-terreno.mjs@@';

export { quadroDaPraia } from '@@MARE:modulo:src/render/praia-oficial-terreno.mjs@@';

// Recuo decorativo: se a pedra apertar a rota, testa poucos deslocamentos
// inteiros sem encostar em outra pedra nem sair da vista aprovada.
const composicoes = new WeakMap();
function darRespiroNaCosta(fase, quadro, estruturas) {
  const { largura, altura, origemX, origemY } = quadro;
  const casas = [];
  const separadas = (a,b,m) => a.x+a.largura+m <= b.x || b.x+b.largura+m <= a.x
    || a.y+a.altura+m <= b.y || b.y+b.altura+m <= a.y;
  fase.mapa.forEach((linha,j) => Array.from(linha).forEach((casa,i) => {
    if(casa!=='#'&&casa!=='~')casas.push({x:origemX+48*i,y:origemY+48*j,largura:48,altura:48});
  }));
  const resultado = [];
  estruturas.forEach((item,i) => {
    const lado = item.x+item.largura/2<largura/2 ? -1 : 1;
    let nova = item;
    for (const [dx,dy] of [[0,0],[8,0],[12,0],[16,0],[8,-8],[8,8],[0,-12],[0,12]]) {
      const candidato={...item,x:item.x+dx*lado,y:item.y+dy};
      if(candidato.x<1||candidato.y<1||candidato.x+candidato.largura>largura-1||candidato.y+candidato.altura>altura-1)continue;
      if(!casas.every(casa=>separadas(candidato,casa,12)))continue;
      if(![...resultado,...estruturas.slice(i+1)].every(outra=>separadas(candidato,outra,8)))continue;
      nova=item.visita?{...candidato,visita:{...item.visita,x:candidato.x,y:candidato.y}}:candidato;
      break;
    }
    resultado.push(nova);
  });
  return resultado;
}

const ARTE_PRAIA                              = {
  paleta: PALETA_PRAIA,
  compor: (fase, quadro) => {
    if(composicoes.has(fase))return composicoes.get(fase);
    const {largura, altura, origemX, origemY}=quadro;
    const locais = comporEstruturasPraia(fase, largura, altura, origemX, origemY);
    const costa = { largura, altura, inicioDaGrade: origemX, fimDaGrade: origemX + fase.mapa[0].length * 48 };
    const todas=[...locais, ...comporExtrasDaPraia(fase.id, costa, locais).map(nova => ({ ...nova, visita: nova }))];
    const resultado=darRespiroNaCosta(fase,quadro,todas);
    composicoes.set(fase,resultado);
    return resultado;
  },
  pintarMar: (pintar, fase, quadro, estruturas) => pintarMarPraia(pintar, fase.mapa, quadro, estruturas),
  pintarEstruturas: (pintar, estruturas) => {
    pintarEstruturasPraia(pintar, estruturas.filter(item => !item.visita));
    for (const item of estruturas) if (item.visita)
      pintarVisitaDaPraia(pintar, item.visita, PALETA_PRAIA.espuma);
  },
  pintarEspumaDasEstruturas: (pintar, estruturas, agua) => pintarEspumaDasEstruturasPraia(pintar, estruturas.filter(item => !item.visita), agua),
  pintarPeca: pintarPecaPraia,
};

export function desenharPraiaOficial(ctx                          , fase      , estado        ,
  logo                  , fauna                   )       {
  desenharLitoralOficial(ctx, fase, estado, logo, fauna, ARTE_PRAIA);
}
