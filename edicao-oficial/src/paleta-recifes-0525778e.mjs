import { reduzirReflexos } from '@@MARE:modulo:src/selecionar-espalhados-8db16b0e.mjs@@';
                                                      
import { desenharLitoralOficial } from '@@MARE:modulo:src/desenhar-litoral-oficial-53e7dfae.mjs@@';
                                                                      
import { CASA_PRAIA } from '@@MARE:modulo:src/render/praia-oficial-terreno.mjs@@';
                                                                                   
import { pintarPecaRecifes } from '@@MARE:modulo:src/pecas-recifes-0665cea8.mjs@@';
import { comporEstruturasRecifes, pintarEspumaDasEstruturasRecifes,
  pintarEspumaSoltaRecifes, pintarEstruturasRecifes } from '@@MARE:modulo:src/compor-estruturas-recifes-7777ab1e.mjs@@';
                                                                         

export const PALETA_RECIFES                = {
  mar: '#142e47', reflexoMar: '#215264',
  aguaRasa: ['#326a76', '#4c8591', '#568d97', '#285767', '#91bdc7'],
  seca: ['#e2dcca', '#f1e9d4', '#aa9787', '#e8e0ce', '#d9d1bd'],
  molhada: ['#9f877e', '#b09a8b', '#856f68', '#ab9182', '#947c73'],
  graos: ['#b2a088', '#bca990'],
  juntaSeca: ['#c1b19b', '#ece1cc'], juntaMolhada: ['#846d64', '#b6a093'],
  umidade: ['#c4b1a2', '#d1bdab', '#a08979'],
  sombraSeca: ['#bcaa91', '#ad957f'], sombraMolhada: ['#876f64', '#786357'],
  sombraSubmersa: ['#2e5a64', '#244c5d'], espuma: ['#89b8cb', '#e9f4ee'],
  destino: '#35575f',
};

const REFLEXOS = [
  [9, 11], [31, 8], [59, 12], [83, 13], [94, 24], [19, 27], [42, 24], [68, 35],
  [84, 38], [7, 46], [26, 50], [51, 48], [75, 55], [90, 64], [13, 72], [37, 67],
  [64, 68], [79, 76], [91, 84], [7, 89], [24, 89], [42, 93], [62, 91], [79, 90], [92, 94],
]         ;

function separados([x, y, w, h]           , [u, v, p, q]           )          {
  return x + w + 8 <= u || u + p + 8 <= x || y + h + 8 <= v || v + q + 8 <= y;
}

function pintarMarRecifes(pintar        , fase      , quadro              , estruturas                             )       {
  const { largura, altura, origemX, origemY } = quadro;
  pintar(PALETA_RECIFES.mar, 0, 0, largura, altura);
  const reservas              = estruturas.map(e => [e.x, e.y, e.largura, e.altura]);
  fase.mapa.forEach((fila, j) => [...fila].forEach((casa, i) => {
    if (casa !== '#') reservas.push([origemX + i * CASA_PRAIA, origemY + j * CASA_PRAIA, CASA_PRAIA, CASA_PRAIA]);
  }));
  const reflexos=[];
  REFLEXOS.forEach(([px, py], k) => {
    const x = Math.floor(px * largura / 100) - 8, y = Math.floor(py * altura / 100);
    const l = [16, 23, 20, 14, 18][k % 5];
    const caixa            = [x, y, l, 4];
    if (reservas.some(r => !separados(caixa, r))) return;
    reservas.push(caixa);
    reflexos.push([x,y,l,k % 3 ? 3 : 4]);
  });
  for(const faixa of reduzirReflexos(reflexos))pintar(PALETA_RECIFES.reflexoMar,...faixa);
  pintarEspumaSoltaRecifes(pintar, fase, quadro, estruturas);
}

const ARTE_RECIFES                                = {
  paleta: PALETA_RECIFES,
  compor: (fase, { largura, altura, origemX, origemY }) => comporEstruturasRecifes(fase, largura, altura, origemX, origemY),
  pintarMar: pintarMarRecifes,
  pintarEstruturas: pintarEstruturasRecifes,
  pintarEspumaDasEstruturas: pintarEspumaDasEstruturasRecifes,
  pintarPeca: pintarPecaRecifes,
};

export function desenharRecifesOficiais(ctx                          , fase      , estado        ,
  logo                  , fauna                   )       {
  desenharLitoralOficial(ctx, fase, estado, logo, fauna, ARTE_RECIFES);
}
