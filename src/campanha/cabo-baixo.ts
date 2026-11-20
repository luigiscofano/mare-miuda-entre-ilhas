import { mesmaCasa } from '../motor/index.ts';
import type { Posicao } from '../motor/index.ts';

// Âncoras em pixels da composição nativa; não entram no progresso salvo.
type Ponto = readonly [number, number];
type EntradaVisual = Readonly<{ ponto: Ponto; simbolo?: string }>;
const MARCOS: Readonly<Record<string, EntradaVisual>> = {
  '1,1': { ponto: [28, 97] },
  '2,1': { ponto: [43, 80], simbolo: '1' },
  '4,1': { ponto: [40, 38], simbolo: '2' },
  '6,1': { ponto: [84, 46], simbolo: '3' },
  '7,1': { ponto: [123, 32], simbolo: '4' },
  '3,3': { ponto: [119, 106], simbolo: '*' },
  '8,1': { ponto: [149, 35], simbolo: '>' },
};
type Percurso = readonly [inicio: string, fim: string, curvas: readonly Ponto[]];
const PERCURSOS: readonly Percurso[] = [
  ['1,1', '2,1', [[33, 87]]],
  ['2,1', '4,1', [[51, 65], [49, 54], [44, 46]]],
  ['4,1', '6,1', [[49, 54], [53, 63], [63, 58], [72, 51]]],
  ['6,1', '7,1', [[98, 42], [108, 35], [115, 32]]],
  ['2,1', '3,3', [[33, 88], [39, 96], [59, 97], [74, 105], [90, 101], [105, 103]]],
  ['3,3', '6,1', [[107, 102], [98, 89], [104, 78], [112, 62], [105, 54], [94, 51]]],
  ['7,1', '8,1', [[124, 40], [132, 42]]],
];

const chave = (p: Posicao) => `${p.coluna},${p.linha}`;
const projetar = ([x, y]: Ponto): Posicao => ({ coluna: x, linha: y });
export const marcadorCabo = (p: Posicao): EntradaVisual | undefined => MARCOS[chave(p)];

export function caminhoDoCabo(de: Posicao, para: Posicao): readonly Posicao[] | undefined {
  if (mesmaCasa(de, para)) return;
  const inicio = chave(de);
  const fim = chave(para);
  for (const [a, b, curvas] of PERCURSOS) {
    if (a === inicio && b === fim) return [MARCOS[a].ponto, ...curvas, MARCOS[b].ponto].map(projetar);
    if (a === fim && b === inicio) return [MARCOS[b].ponto, ...[...curvas].reverse(), MARCOS[a].ponto].map(projetar);
  }
}
