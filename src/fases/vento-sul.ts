import type { Acao, Fase } from '../motor/index.ts';

const comandos = { U: 'cima', D: 'baixo', L: 'esquerda', R: 'direita' } as const;
const rota = (letras: string): Acao[] => [...letras].map(letra => comandos[letra as keyof typeof comandos]);

export const VENTO_SUL = {
  id: 'ressaca-chefe-vento-sul',
  nome: 'Vento Sul',
  mapa: [
    'S..N##..C',
    '.##H##.##',
    'N=.H=..N#',
    '.###H#.##',
    '.....####',
  ],
  ressaca: { faixas: [
    { linha: 0, primeiraColuna: 1, ultimaColuna: 3 },
    { linha: 2, primeiraColuna: 0, ultimaColuna: 7 },
    { linha: 0, primeiraColuna: 6, ultimaColuna: 8 },
  ] },
  objetivo: 'Firme os três ancoradouros na maré baixa e chegue à concha para vencer Vento Sul.',
  ensino: 'A cada subida, a onda varre a faixa de espuma indicada. Saia da faixa ou termine o passo no refúgio de areia elevada. Os ancoradouros ficam firmes depois de uma chegada segura na baixa.',
  solucao: rota('DDUURRRLRLRDDRRRRLRLUURR'),
} as const satisfies Fase;
