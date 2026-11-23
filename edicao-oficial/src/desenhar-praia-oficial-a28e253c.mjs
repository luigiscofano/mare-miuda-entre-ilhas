import { comporExtrasDaPraia, pintarVisitaDaPraia } from '@@MARE:modulo:src/nomes-das-rochas-6e85a20e.mjs@@';
                                                      
import { desenharLitoralOficial } from '@@MARE:modulo:src/desenhar-litoral-oficial-53e7dfae.mjs@@';
                                                        
import { comporEstruturasPraia, pintarEspumaDasEstruturasPraia, pintarEstruturasPraia } from '@@MARE:modulo:src/compor-estruturas-praia-d23b935a.mjs@@';
                                                                    
import { pintarMarPraia } from '@@MARE:modulo:src/render/praia-oficial-mar.mjs@@';
import { pintarPecaPraia } from '@@MARE:modulo:src/pecas-praia-d4603eb0.mjs@@';
import { PALETA_PRAIA } from '@@MARE:modulo:src/render/praia-oficial-terreno.mjs@@';

export { quadroDaPraia } from '@@MARE:modulo:src/render/praia-oficial-terreno.mjs@@';

const ARTE_PRAIA                              = {
  paleta: PALETA_PRAIA,
  compor: (fase, { largura, altura, origemX, origemY }) => {
    const locais = comporEstruturasPraia(fase, largura, altura, origemX, origemY);
    const costa = { largura, altura, inicioDaGrade: origemX, fimDaGrade: origemX + fase.mapa[0].length * 48 };
    return [...locais, ...comporExtrasDaPraia(fase.id, costa, locais).map(nova => ({ ...nova, visita: nova }))];
  },
  pintarMar: (pintar, fase, quadro, estruturas) => pintarMarPraia(pintar, fase.mapa, quadro, estruturas.filter(item => !item.visita)),
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
