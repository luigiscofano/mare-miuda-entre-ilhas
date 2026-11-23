import { reduzirReflexos } from '@@MARE:modulo:src/selecionar-espalhados-8db16b0e.mjs@@';
import { apararCristaSolta } from '@@MARE:modulo:src/render/animacao-visual.mjs@@';
import { CASA_PRAIA, quadroDaPraia } from '@@MARE:modulo:src/render/praia-oficial-terreno.mjs@@';
                                                                    

                                               
                                                                             
                                                                                                
                                                                            

                                              
                                        
                        
                                    
                                                                                         
   

// Só a linha da costa conta: trocar uma pérola por areia, por exemplo, não
// invalida as posições aprovadas. O tamanho também faz parte da assinatura.
export function assinaturaDaCosta(mapa                   )         {
  const linhas = mapa.map(fila => Array.from(fila).reduce((bits, casa) =>
    2 * bits + Number(casa !== '#'), 0).toString(36));
  return `${mapa[0].length}:${linhas.join('.')}`;
}

export function encaixarRochas      (rochas                               , larguraAnterior        ,
  quadro        , larguraGrade        , alturaDaRocha                         = () => CASA_PRAIA,
)                                {
  const { largura, altura, origemX } = quadro;
  const fimDaGrade = origemX + larguraGrade * CASA_PRAIA;
  const mesmoLado = (x        ) => x + CASA_PRAIA / 2 < larguraAnterior / 2;
  const encaixes = rochas.map((rocha, i) => ({ rocha, i, esquerda: mesmoLado(rocha[1]) }));
  // Três peças em uma só margem apertam a composição e podem se sobrepor.
  if (encaixes.every(r => r.esquerda === encaixes[0].esquerda)) encaixes[1].esquerda = !encaixes[0].esquerda;

  const resultado                            = [];
  for (const esquerda of [true, false]) {
    const grupo = encaixes.filter(r => r.esquerda === esquerda).sort((a, b) => a.rocha[2] - b.rocha[2]);
    const x = esquerda ? Math.floor((origemX - CASA_PRAIA) / 2)
      : fimDaGrade + Math.floor((largura - fimDaGrade - CASA_PRAIA) / 2);
    const livre = altura - grupo.reduce((soma, { rocha }) => soma + alturaDaRocha(rocha[0]), 0);
    const intervalo = Math.floor(livre / (grupo.length + 1));
    let y = intervalo;
    for (const { rocha: [peca], i } of grupo) {
      resultado[i] = [peca, x, y];
      y += alturaDaRocha(peca) + intervalo;
    }
  }
  return resultado;
}

const SEIS_ESPUMAS = new Set([0, 4, 9, 15, 19, 23]);
const ANCORA_MAR = [
  [9,12], [30,8], [56,7], [82,13], [93,20], [19,27], [42,24], [68,28], [87,34],
  [7,46], [29,47], [54,48], [73,51], [90,57], [13,68], [37,64], [62,68], [79,74],
  [91,81], [7,89], [24,88], [44,93], [64,91], [77,90], [92,93],
]         ;

function separados([x, y, w, h]           , [u, v, p, q]           )          {
  const margem = 5;
  return x + w + margem <= u || u + p + margem <= x || y + h + margem <= v || v + q + margem <= y;
}

function reservarTerraERochas      (mapa                   , quadro        ,
  rochas                               ,
)              {
  const { origemX, origemY } = quadro;
  const reservas              = rochas.map(([, x, y]) => [x, y, CASA_PRAIA, CASA_PRAIA]);
  mapa.forEach((fila, j) => Array.from(fila).forEach((casa, i) => {
    if (casa !== '#') reservas.push([origemX + i * CASA_PRAIA, origemY + j * CASA_PRAIA, CASA_PRAIA, CASA_PRAIA]);
  }));
  return reservas;
}

export function traçosNoMar      (mapa                   , quadro        , rochas                               ,
  somenteCristas = false)                   {
  const { largura, altura } = quadro;
  const reservas = reservarTerraERochas(mapa, quadro, rochas);
  const mar          = [];
  ANCORA_MAR.forEach(([px, py], i) => {
    const crista = SEIS_ESPUMAS.has(i);
    if (somenteCristas && !crista) return;
    const x = Math.floor(largura * px / 100) - 8, y = Math.floor(altura * py / 100);
    const l = crista ? 19 : [16, 23, 20, 14, 18][i % 5];
    const caixa            = [x, y, l, 4];
    if (x < 0 || x + l > largura || y + 4 > altura || reservas.some(r => !separados(caixa, r))) return;
    reservas.push(caixa);
    if (crista) mar.push([x,y+1,14,3,1], [x+3,y,8,3,2], [x+14,y+2,5,2,1], [x+14,y+2,3,1,2]);
    else mar.push([x,y,l,i % 3 ? 3 : 4,0]);
  });
  return mar;
}

export function reencaixarCenario      (cenario                       , mapa                   , quadro        ,
  larguraAnterior        ,
)                        {
  const rochas = encaixarRochas(cenario.rochas, larguraAnterior, quadro, mapa[0].length);
  const espumaDasRochas          = [];
  for (const faixa of cenario.espumaDasRochas) {
    const [x, y, l, tinta] = faixa;
    const i = cenario.rochas.findIndex(([, a, b]) =>
      x >= a - 1 && x < a + CASA_PRAIA + 2 && y >= b + CASA_PRAIA / 2 && y <= b + CASA_PRAIA + 7);
    if (i < 0) continue;
    const [, antesX, antesY] = cenario.rochas[i];
    const [, novoX, novoY] = rochas[i];
    espumaDasRochas.push([x + novoX - antesX, y + novoY - antesY, l, tinta]);
  }
  // Esta espuma pertence às peças, não às casas. A beira das casas passa a
  // ser calculada pelo desenho da maré usando o novo mapa.
  return { rochas, mar: traçosNoMar(mapa, quadro, rochas), espumaDasRochas, beira: [] };
}

export function pintarTraçosDoMar(pintar        , traços                  , cores                                   )       {
  for (const [x, y, largura, altura, tinta] of reduzirReflexos(traços, t=>t[4]===0)) {
    const [dx,l] = tinta === 2 ? apararCristaSolta(x,y,largura) : [0,largura];
    pintar(cores[tinta], x+dx, y, l, altura);
  }
}

// Espuma solta da Enseada: dois grupos pequenos, estáticos e quebrados, sem
// tocar rochas ou casas. Não faz parte da maré, da garça ou da jogabilidade.
export function cristasSoltasDaEnseada      (mapa                   , quadro        ,
  cenario                       ,
)                   {
  const { largura, altura } = quadro;
  const reservas = reservarTerraERochas(mapa, quadro, cenario.rochas);
  for (const [x, y, l, a] of cenario.mar) reservas.push([x, y, l, a]);
  const regioes = [[17,68], [72,79], [77,20], [30,33], [25,76], [62,88], [76,85],
    [13,52], [91,37], [4,25], [93,68], [45,85], [16,17], [57,8], [31,13], [79,91], [6,88], [95,91]];
  const traços          = [];
  for (const [px, py] of regioes) {
    const x = Math.floor(largura * px / 100) - 7, y = Math.floor(altura * py / 100);
    const caixa            = [x, y, 17, 4];
    if (x < 3 || x + 17 > largura - 3 || reservas.some(r => !separados(caixa, r))) continue;
    // Reserva distâncias entre os dois novos grupos, em vez de desenhar um
    // segundo grupo ao lado do primeiro e transformá-los em uma faixa.
    reservas.push([x - 32, y - 24, 81, 52]);
    traços.push([x, y + 2, 9, 2, 1], [x + 2, y + 1, 5, 2, 2],
      [x + 11, y + 1, 6, 2, 1], [x + 13, y, 3, 2, 2]);
    if (traços.length === 8) break;
  }
  return traços;
}
