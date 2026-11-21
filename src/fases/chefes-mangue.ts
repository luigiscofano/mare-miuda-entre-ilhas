import type { Acao, Fase, Posicao } from '../motor/index.ts';

const comandos = { U: 'cima', D: 'baixo', L: 'esquerda', R: 'direita', X: 'trocar' } as const;
const rota = (letras: string): Acao[] => [...letras].map(letra => comandos[letra as keyof typeof comandos]);
const p = (coluna: number, linha: number): Posicao => ({ coluna, linha });

export const GUARDIAO_DA_RAIZ = {
  id: 'mangue-chefe-guardiao-da-raiz',
  nome: 'Guardião da Raiz',
  mapa: [
    'S.==H.D..P..C',
    '#############',
    'A..P=H.D..=.T',
  ],
  dupla: { segundoAlvo: 'T' },
  portoesVinculados: [
    { portao: p(6, 0), placa: p(3, 2) },
    { portao: p(7, 2), placa: p(9, 0) },
  ],
  objetivo: 'Abra as duas raízes, revezando nas placas correspondentes, e ocupe os dois destinos.',
  ensino: 'Cada placa só abre a raiz com o mesmo número. Deixe Verde na placa 1; depois, deixe Coral na 2. Use as pedras altas quando a maré virar.',
  solucao: rota('XRRRXRLRRRRRRRXRRXRRXRRXRRRXRRLRRRR'),
} as const satisfies Fase;

export const DUPLA_NO_MANGUE = {
  id: 'mangue-chefe-dupla-no-mangue',
  nome: 'Dupla no Mangue',
  mapa: [
    'S..H==H.D.=H=C',
    '#########.#.##',
    '##############',
    'A.=H...P.==H.T',
    '#####..#.##.##',
  ],
  dupla: { segundoAlvo: 'T' },
  ameaca: { alvo: p(7, 3), rota: [p(12, 0), p(9, 3)], primeiroAtaque: 5, periodo: 2 },
  objetivo: 'Sustente a placa entre os rasantes, atravesse o portão e leve a dupla aos dois destinos.',
  ensino: 'A garça anuncia o próximo rasante e pode atingir quem está parado na placa. Cruze durante a folga; quando a mira voltar, tire o parceiro da placa.',
  solucao: rota('XRRRXRRRRRRXRRRRXRRXRDURRRRXRDURRDUDURRXR'),
} as const satisfies Fase;
