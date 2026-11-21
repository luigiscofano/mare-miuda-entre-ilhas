import type { Acao, Fase, Posicao } from '../motor/index.ts';

const comandos = { L: 'esquerda', R: 'direita', X: 'trocar' } as const;
const rota = (letras: string): Acao[] => [...letras].map(letra => comandos[letra as keyof typeof comandos]);
const ponto = (coluna: number, linha: number): Posicao => ({ coluna, linha });

// Cada balsa tem uma parada na baixa e outra na alta, compartilhadas pelos três siris.
export const ECO_DOS_TRES_CAIS = {
  id: 'ressaca-trio-eco-dos-tres-cais',
  nome: 'Eco dos três cais',
  mapa: [
    'S.~~~~H.BDG',
    '..#########',
    'A=.H==H.P.T',
    '###########',
    'M.~~H..Y###',
  ],
  dupla: { segundoAlvo: 'T', terceiroAlvo: 'Y' },
  balsas: [
    { paradas: [ponto(2, 0), ponto(5, 0)] },
    { paradas: [ponto(2, 4), ponto(3, 4)] },
  ],
  objetivo: 'Atravesse os dois braços de balsa, recupere o fragmento e reúna os três siris na saída e nos marcos.',
  ensino: 'Você pode deixar um siri embarcado e virar a maré com outro. Use as pedras altas no canal do meio e segure a placa até o portão ser cruzado.',
  solucao: rota('RXXRRRRRXRXRRXRXRXRRRRRRXXRRRRXRR'),
} as const satisfies Fase;

export const TRES_LUZES_EM_REVEZAMENTO = {
  id: 'farol-trio-tres-luzes',
  nome: 'Três luzes em revezamento',
  mapa: [
    'S.=H==H.DFO...C',
    '..####.########',
    'A=H.K.~~~H==E.T',
    '#########.#####',
    'M..~~H=.P==H.Y#',
  ],
  dupla: { segundoAlvo: 'T', terceiroAlvo: 'Y' },
  etapasGruta: ['K', 'E', 'F'],
  balsas: [
    { paradas: [ponto(6, 2), ponto(8, 2)] },
    { paradas: [ponto(3, 4), ponto(4, 4)] },
  ],
  objetivo: 'Encaixe a pérola, sustente a placa para chegar à alavanca e abra o portão final. Termine nos três destinos.',
  ensino: 'Quem recolhe a pérola precisa encaixá-la. A placa libera a primeira passagem, mas o portão final só abre depois de ligar a alavanca.',
  solucao: rota('XRRRXRRXRRRXXRRXXRRRXRRRLRXRRRRRXRRRRXXRXRRXRRRRRXRRRRR'),
} as const satisfies Fase;
