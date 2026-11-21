import type { Acao, Fase, Posicao } from '../motor/index.ts';

const comandos = { U: 'cima', D: 'baixo', L: 'esquerda', R: 'direita' } as const;
const rota = (letras: string): Acao[] => [...letras].map(letra => comandos[letra as keyof typeof comandos]);
const ponto = (coluna: number, linha: number): Posicao => ({ coluna, linha });

export const GUARDIAO_DAS_POCAS = {
  id: 'recife-chefe-guardiao-das-pocas',
  nome: 'Guardião das Poças',
  mapa: ['S..H=.H=.H.C', '.#.H.####H##', '...######.##'],
  recife: { abrigos: [ponto(3, 1), ponto(9, 1)] },
  objetivo: 'Visite os dois refúgios marcados na maré alta e alcance a concha.',
  ensino: 'Os dois refúgios marcados só contam na alta. Aproveite a baixa para cruzar os baixios e use as casas secas para preparar a próxima chegada.',
  solucao: rota('RRDRUDURRRLRRRRDURR'),
} as const satisfies Fase;

export const VIGIA_DO_RECIFE = {
  id: 'recife-chefe-vigia-do-recife',
  nome: 'Vigia do Recife',
  mapa: ['###.H######', 'SG.H=.H..B#', '.#.#####..#', '...H=H=H..#', '###.#.#.###'],
  recife: { ida: ponto(4, 1), volta: ponto(4, 3) },
  objetivo: 'Pegue o fragmento e volte à saída pela passagem sul.',
  ensino: 'O fragmento é o contrapeso das comportas. Pegá-lo fecha a ida ao norte e abre a volta ao sul. A passagem aberta ainda depende da maré baixa.',
  solucao: rota('DUDURRRRRRLRRRRDDLLLLDUDULLLUUL'),
} as const satisfies Fase;
