import type { Acao, Fase } from '../motor/index.ts';

const comandos = { U: 'cima', D: 'baixo', L: 'esquerda', R: 'direita' } as const;
const rota = (letras: string): Acao[] => [...letras].map(letra => comandos[letra as keyof typeof comandos]);

export const VIGIA_DAS_ONDAS = {
  id: 'praia-chefe-vigia-das-ondas',
  nome: 'Vigia das ondas',
  mapa: [
    'S..#######',
    '##..H.==HC',
    '##...#HH##',
  ],
  // A primeira arena ensina a ler uma única faixa antes de alternar padrões.
  ressaca: { objetivo: 'atravessar', faixas: [{ linha: 1, primeiraColuna: 2, ultimaColuna: 8 }] },
  objetivo: 'Atravesse a faixa das ondas e alcance a concha.',
  ensino: 'Antes da subida, a espuma avisa onde a onda vai passar. Os refúgios de areia elevada protegem. Use a margem para ajustar os passos e cruze o baixio quando a maré baixar.',
  solucao: rota('RLRRDRRDURLRRRRR'),
} as const satisfies Fase;
