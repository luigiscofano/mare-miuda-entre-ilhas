import type { Fase } from '../motor/index.ts';

export const ENTRE_DUAS_FENDAS = {
  id: 'enseada-fenda-entre-rochas',
  nome: 'Entre duas fendas',
  objetivo: 'Atravesse a rocha pela fenda e alcance a concha.',
  ensino: 'Pise na boca redonda. A outra boca com o mesmo desenho é a saída; atravessar conta como um passo.',
  mapa: ['S.##.C'],
  fendas: [{ forma: 'redonda', bocas: [{ coluna: 1, linha: 0 }, { coluna: 4, linha: 0 }] }],
  solucao: ['direita', 'direita'],
} as const satisfies Fase;

export const FENDA_DA_VAZANTE = {
  id: 'enseada-fenda-da-vazante',
  nome: 'A fenda da vazante',
  objetivo: 'Espere a água baixar e atravesse a fenda até a concha.',
  ensino: 'A boca seca vira piso comum quando a outra alaga. Contorne por baixo, pise nela na alta e saia para fazer a maré baixar. Depois entre nela de novo. Se a água subir no mesmo passo da chegada, o siri é levado.',
  mapa: ['S...#=C', '##..###'],
  fendas: [{ forma: 'estreita', bocas: [{ coluna: 3, linha: 0 }, { coluna: 5, linha: 0 }] }],
  solucao: ['direita', 'direita', 'baixo', 'direita', 'cima', 'baixo', 'cima', 'direita'],
} as const satisfies Fase;

export const FENDAS_DA_ENSEADA = [ENTRE_DUAS_FENDAS, FENDA_DA_VAZANTE] as const;
