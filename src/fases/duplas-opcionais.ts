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

export const DUPLA_ENSEADA_REVEZAMENTO: Fase = {
  id: 'enseada-dupla-revezamento', nome: 'Revezamento na restinga',
  mapa: ['S=H.D.BG', '##..####', 'A=H.PB.T', '##..####'],
  dupla: { segundoAlvo: 'T' },
  ameaca: { alvo: p(3, 0), rota: [p(4, 2), p(5, 0), p(2, 2)], primeiroAtaque: 4, periodo: 2 },
  objetivo: 'Reúna as duas pérolas e chegue à saída e ao marco com a dupla.',
  ensino: 'O rasante alterna as duas margens, inclusive sobre a placa. Use o caminho entre elas para acertar o relógio e a hora de revezar.',
  solucao: rota('RRDUDURXRRRRXRRXRRXRRXR'),
};

export const DUPLA_DERIVA_CONTRAMAO: Fase = {
  id: 'deriva-dupla-contramao', nome: 'Balsas na contramão',
  mapa: ['S..~#########', '###~#########', 'A.P~D..~~~.BG', '.==.#=####.##', '##T.######B##'],
  dupla: { segundoAlvo: 'T' },
  balsas: [{ paradas: [p(3, 0), p(3, 2)] }, { paradas: [p(9, 2), p(7, 2)] }],
  objetivo: 'Abra o canal em dupla, recolha as pérolas e alcance a saída e o marco.',
  ensino: 'As duas balsas viram juntas, mas em sentidos diferentes. A placa libera o canal; deixe o outro siri atravessar antes de voltar ao marco.',
  solucao: rota('RRRXRRXRRXDDRXRRRDDUURRXL'),
};
