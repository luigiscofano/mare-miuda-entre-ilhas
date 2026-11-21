import type { Acao, Fase, Posicao } from '../motor/index.ts';

const comandos = { L: 'esquerda', R: 'direita', X: 'trocar' } as const;
const rota = (letras: string): Acao[] => [...letras].map(letra => comandos[letra as keyof typeof comandos]);
const p = (coluna: number, linha: number): Posicao => ({ coluna, linha });

const ponteCoral = p(4, 0);
const ponteVerde = p(6, 2);
const ponteAmarelo = p(4, 4);

export const ULTIMA_VIRADA = {
  id: 'farol-chefe-ultima-virada',
  nome: 'Última Virada',
  mapa: [
    'S.=.I.....L.P.C',
    '###############',
    'A.L...I.P.=...T',
    '###############',
    'M...I..L..P.=.Y',
  ],
  dupla: { segundoAlvo: 'T', terceiroAlvo: 'Y' },
  farol: { passosPorOrientacao: 3, orientacoes: [
    { nome: 'oeste', lente: p(10, 0), placa: p(8, 2), plataformas: [ponteCoral, ponteAmarelo] },
    { nome: 'leste', lente: p(2, 2), placa: p(10, 4), plataformas: [ponteCoral, ponteVerde] },
    { nome: 'sul', lente: p(7, 4), placa: p(12, 0), plataformas: [ponteVerde, ponteAmarelo] },
  ] },
  objetivo: 'Acenda as três lentes com a ajuda de outro siri em cada placa. Depois ocupe a concha e os dois marcos.',
  ensino: 'Quando o feixe apontar para a lente, outro siri precisa estar na placa indicada. Passe pela primeira lente sem acendê-la e volte depois, se necessário. Uma lente acesa não se apaga quando a placa fica livre.',
  solucao: rota('RRRXXRRRRRRRRRRXRRRRRRXRRRRRRRRXXRRRXXLLLRRRRRRRXRRXRRRRRR'),
} as const satisfies Fase;
