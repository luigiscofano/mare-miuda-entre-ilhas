import type { Acao, Fase, Posicao } from '../motor/index.ts';

const comandos = { U: 'cima', D: 'baixo', L: 'esquerda', R: 'direita', X: 'trocar' } as const;
const rota = (letras: string): Acao[] => [...letras].map(letra => comandos[letra as keyof typeof comandos]);
const p = (coluna: number, linha: number): Posicao => ({ coluna, linha });

export const FASES_FAROL: readonly Fase[] = [
  {
    id: 'farol-fragmento-margens', nome: 'O fragmento das duas margens',
    mapa: ['S..D..=...G', '#######.###', 'A.P~###~.B#', '..#####..T#'],
    balsas: [{ paradas: [p(3, 2), p(7, 2)] }], dupla: { segundoAlvo: 'T' },
    objetivo: 'Abra o portão para um siri. Depois, use a balsa com o outro, recupere o fragmento e alcance os dois destinos.',
    ensino: 'Mantenha um siri na placa até o outro passar. Se um estiver no baixio, leve-o a terra firme antes de trocar na véspera da subida.',
    solucao: rota('RRXRRXRRRRRDURRRXRRRD'),
  },
  {
    id: 'farol-duas-luzes', nome: 'As duas luzes do farol',
    mapa: ['S..~###~=B.P#', '#..##########', 'A..~###~B=D.G', '#..#####..###'],
    balsas: [{ paradas: [p(7, 0), p(3, 0)] }, { paradas: [p(3, 2), p(7, 2)] }],
    dupla: { segundoAlvo: 'P' },
    ameaca: { alvo: p(11, 0), rota: [p(8, 3), p(7, 2)], primeiroAtaque: 14, periodo: 4 },
    objetivo: 'Acenda as duas luzes, reúna os fragmentos e atravesse o portão com um siri na placa.',
    ensino: 'As balsas partem em sentidos opostos. Confira onde fica o siri inativo durante cada virada e rasante. A placa não é um abrigo: aproxime-se depois do aviso e sincronize o último baixio com o portão.',
    solucao: rota('RDUDDRRXRUURRRRRLRXRRXRXRRR'),
  },
];
