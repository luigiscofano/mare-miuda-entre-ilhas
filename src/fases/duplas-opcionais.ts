import type { Acao, Fase, Posicao } from '../motor/index.ts';

const comandos = { U: 'cima', D: 'baixo', L: 'esquerda', R: 'direita', X: 'trocar' } as const;
const rota = (s: string): Acao[] => [...s].map(letra => comandos[letra as keyof typeof comandos]);
const p = (coluna: number, linha: number): Posicao => ({ coluna, linha });

export const DUPLA_ENSEADA: Fase = {
  id: 'enseada-dupla-vigia', nome: 'Vigia em dupla',
  mapa: ['S=H.DC', '######', 'A..P..'],
  dupla: { segundoAlvo: 'P' },
  ameaca: { alvo: p(3, 0), rota: [p(4, 0)], primeiroAtaque: 6, periodo: 4 },
  objetivo: 'Deixe um siri na placa e leve o outro à concha sem cair no rasante.',
  ensino: 'A garça pode acertar o siri parado durante o passo do outro. Deixe-o no refúgio antes de trocar.',
  solucao: rota('RRRLXRRRXRRR'),
};

export const DUPLA_DERIVA: Fase = {
  id: 'deriva-dupla-cais', nome: 'Encontro nos dois cais',
  mapa: ['S..~##', '###~##', 'A.P~DC', '##..T#'],
  dupla: { segundoAlvo: 'T' },
  balsas: [{ paradas: [p(3, 0), p(3, 2)] }],
  objetivo: 'Atravesse de balsa, abra o portão em dupla e reúna os siris na concha e no marco.',
  ensino: 'Uma balsa leva seu ocupante mesmo quando o outro siri anda. Saia dela antes da próxima virada ou prepare o retorno.',
  solucao: rota('RRRXRRXRRXDRR'),
};
