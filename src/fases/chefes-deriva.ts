import type { Acao, Fase, Posicao } from '../motor/index.ts';

const comandos = { U: 'cima', D: 'baixo', L: 'esquerda', R: 'direita', X: 'trocar' } as const;
const rota = (letras: string): Acao[] => [...letras].map(letra => comandos[letra as keyof typeof comandos]);
const p = (coluna: number, linha: number): Posicao => ({ coluna, linha });

export const MESTRE_DAS_CORRENTES = {
  id: 'deriva-chefe-mestre-das-correntes',
  nome: 'Mestre das Correntes',
  mapa: [
    'SC~~~N..',
    '..###...',
    'N~~~~...',
    '........',
  ],
  balsas: [{ paradas: [p(2, 0), p(4, 0)] }, { paradas: [p(1, 2), p(4, 2)] }],
  atracacaoNaVirada: [p(5, 0), p(0, 2)],
  objetivo: 'Firme os dois ancoradouros no passo da virada e volte à saída.',
  ensino: 'Para firmar uma âncora, saia da balsa diretamente para a casa marcada quando falta um passo para a maré virar. A pé, ela não conta. O cais leste recebe na descida; o oeste, na subida.',
  solucao: rota('DDRDUDRUUULRDDDLLLLULUUR'),
} as const satisfies Fase;

export const PASSAGEM_DAS_BALSAS = {
  id: 'deriva-chefe-passagem-das-balsas',
  nome: 'Passagem das Balsas',
  mapa: [
    'S...~~.P.D...C',
    '....##..######',
    '##############',
    'A~~.D=P~~~..T#',
  ],
  balsas: [{ paradas: [p(4, 0), p(5, 0)] }, { paradas: [p(1, 3), p(2, 3)] }, { paradas: [p(9, 3), p(7, 3)] }],
  dupla: { segundoAlvo: 'T' },
  portoesVinculados: [{ portao: p(9, 0), placa: p(6, 3) }, { portao: p(4, 3), placa: p(7, 0) }],
  objetivo: 'Alterne as duas placas, atravesse os portões e leve os siris à concha e ao marco.',
  ensino: 'Deixe o coral a bordo e embarque com o verde: sua jogada carrega os dois. Cada placa abre o portão da outra margem. Só saia da placa depois de o parceiro entrar no portão.',
  solucao: rota('DUDURRRRXRRXRRXRRRXRRXRRRRXRRRR'),
} as const satisfies Fase;
