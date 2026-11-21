import type { Acao, Fase, Posicao } from '../motor/index.ts';

const comandos = { U: 'cima', D: 'baixo', L: 'esquerda', R: 'direita' } as const;
const rota = (letras: string): Acao[] => [...letras].map(letra => comandos[letra as keyof typeof comandos]);
const p = (coluna: number, linha: number): Posicao => ({ coluna, linha });
const ponteDaEntrada = p(4, 0);
const ponteDaSaida = p(7, 2);
const ponteDoSul = p(7, 4);

export const GUARDIAO_FAROL = {
  id: 'farol-chefe-guardiao',
  nome: 'Guardião do Farol',
  mapa: [
    'S...I.L#####',
    '..###.######',
    '#####..I..LC',
    '#####...####',
    '#####..I=.L#',
    '######..#..#',
  ],
  // Os espelhos de cada orientação revelam travessias diferentes.
  farol: { passosPorOrientacao: 3, orientacoes: [
    { nome: 'oeste', lente: p(6, 0), plataformas: [ponteDaEntrada, ponteDoSul] },
    { nome: 'leste', lente: p(10, 2), plataformas: [ponteDaEntrada, ponteDaSaida, ponteDoSul] },
    { nome: 'sul', lente: p(10, 4), plataformas: [ponteDaSaida] },
  ] },
  objetivo: 'Acenda três lentes usando as pontes de luz e alcance a concha.',
  ensino: 'O feixe gira a cada três passos válidos. Entre apenas nas pontes acesas e saia antes de apagarem. Chegue às lentes quando o feixe estiver voltado para elas.',
  solucao: rota('RRRRRDUDDDDRRRRRDULLLUULLUURLDUDDRRRRLRRR'),
} as const satisfies Fase;
