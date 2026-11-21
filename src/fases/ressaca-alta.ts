import type { Acao, Fase } from '../motor/index.ts';

const comandos = { U: 'cima', D: 'baixo', L: 'esquerda', R: 'direita', X: 'trocar' } as const;
const rota = (letras: string): Acao[] => [...letras].map(letra => comandos[letra as keyof typeof comandos]);

export const RESSACA_ALTA = {
  id: 'ressaca-chefe-ressaca-alta',
  nome: 'Ressaca Alta',
  mapa: [
    'S..H#..H=..H.C',
    '#.##..#######.',
    '..H==H=.H..#..',
    '##...###.##...',
    'A...H.==H....T',
  ],
  // As faixas alternam entre costa norte, costa sul e o trecho do meio.
  // A última coluna guarda os dois marcos e não é atingida pelas ondas.
  ressaca: { objetivo: 'sobreviver', faixas: [
    { linha: 0, primeiraColuna: 0, ultimaColuna: 12 },
    { linha: 4, primeiraColuna: 0, ultimaColuna: 12 },
    { linha: 2, primeiraColuna: 0, ultimaColuna: 12 },
  ] },
  dupla: { segundoAlvo: 'T' },
  objetivo: 'Sobreviva a três ondas seguidas e leve um siri à concha e o outro ao marco.',
  ensino: 'O aviso mostra a próxima faixa. As duas posições contam, mesmo quando só um siri se move. Use os refúgios ou saia da faixa antes da subida.',
  solucao: rota('RDXRRRRXDRDRRXRRRRRXDRRRRXRRRRUUUUXRRRRR'),
} as const satisfies Fase;
