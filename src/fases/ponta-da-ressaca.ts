import type { Acao, Fase } from '../motor/index.ts';

const comandos = { U: 'cima', D: 'baixo', L: 'esquerda', R: 'direita' } as const;
const rota = (letras: string): Acao[] => [...letras].map(letra => comandos[letra as keyof typeof comandos]);

export const PONTA_DA_RESSACA = {
  id: 'praia-chefe-ponta-da-ressaca',
  nome: 'Ponta da Ressaca',
  mapa: [
    'S...##########',
    '###H=HH..#####',
    '###.####..####',
    '#########H=.HC',
    '#########..###',
  ],
  // Cada subida alterna de faixa. Entre os baixios há uma margem fora das duas.
  ressaca: { objetivo: 'atravessar', faixas: [
    { linha: 1, primeiraColuna: 2, ultimaColuna: 8 },
    { linha: 3, primeiraColuna: 9, ultimaColuna: 12 },
  ] },
  objetivo: 'Cruze os dois baixios em janelas diferentes e alcance a concha.',
  ensino: 'A espuma alterna entre norte e sul a cada subida. Saia da primeira faixa pela margem do meio e acerte a baixa para o segundo baixio. Termine a travessia no refúgio de areia elevada antes da onda do sul.',
  solucao: rota('RRRDDURRRRLRRDRDDURRRR'),
} as const satisfies Fase;
