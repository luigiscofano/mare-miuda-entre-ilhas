import type { Acao, Fase, Posicao } from '../motor/index.ts';

const comandos = { U: 'cima', D: 'baixo', L: 'esquerda', R: 'direita', X: 'trocar' } as const;
const rota = (letras: string): Acao[] => [...letras].map(letra => comandos[letra as keyof typeof comandos]);
const p = (coluna: number, linha: number): Posicao => ({ coluna, linha });

export const GARCA_DA_RESTINGA = {
  id: 'enseada-chefe-garca-da-restinga',
  nome: 'Garça da Restinga',
  mapa: [
    'S..H..#######',
    '##.==..H....#',
    '##..#..H....C',
    '##...########',
  ],
  ameaca: { alvo: p(6, 2), rota: [p(7, 1), p(3, 1)], primeiroAtaque: 4, periodo: 2,
    rasante: { alcance: 3, eixo: 'linha' } },
  objetivo: 'Atravesse a restinga e alcance a concha sem se expor aos rasantes.',
  ensino: 'A garça anuncia uma linha de casas no próximo passo. Mude de fileira ou suba numa pedra alta antes do rasante.',
  solucao: rota('RLRLRRRRRDRRDRRRRR'),
} as const satisfies Fase;

export const VIGIA_DAS_FALESIAS = {
  id: 'enseada-chefe-vigia-das-falesias',
  nome: 'Vigia das Falésias',
  mapa: [
    '.....#...##',
    'S..H..D...C',
    '###########',
    'A..H.=P...T',
    '...#..H.###',
  ],
  dupla: { segundoAlvo: 'T' },
  // O voo muda de margem; guarda e travessia dividem o mesmo relógio.
  ameaca: { alvo: p(4, 0), rota: [p(5, 3), p(7, 0), p(7, 3)], primeiroAtaque: 2, periodo: 2,
    rasante: { alcance: 1, eixo: 'coluna' } },
  objetivo: 'Sustente a placa para atravessar o portão e ocupe a concha e o marco com a dupla.',
  ensino: 'O rasante alterna entre as margens. Faça o revezamento perto de um abrigo, mantenha a placa até o portão ser cruzado e não abandone um siri em uma casa marcada.',
  solucao: rota('UDRXRRRRRRXRRRRRRRRRXRRRR'),
} as const satisfies Fase;
