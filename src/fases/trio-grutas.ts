import type { Acao, Fase } from '../motor/index.ts';

const comandos = { R: 'direita', X: 'trocar' } as const;
const rota = (letras: string): Acao[] => [...letras].map(letra => comandos[letra as keyof typeof comandos]);

export const TRES_REFUGIOS = {
  id: 'grutas-trio-tres-refugios',
  nome: 'Três refúgios',
  mapa: [
    'S.=HD..C',
    '##.#####',
    'A..H==T#',
    '##.#####',
    'M...P.Y#',
  ],
  dupla: { segundoAlvo: 'T', terceiroAlvo: 'Y' },
  objetivo: 'Mantenha a placa pressionada para atravessar o portão. Depois ocupe a concha e os dois marcos com os três siris.',
  ensino: 'Espaço ou Trocar siri alterna Coral, Verde e Amarelo, sem gastar passo. A maré conta para todos: não deixe nenhum siri no baixio ao subir.',
  solucao: rota('RRRXRRRRRRXRRRRXRRXXRRXRR'),
} as const satisfies Fase;
