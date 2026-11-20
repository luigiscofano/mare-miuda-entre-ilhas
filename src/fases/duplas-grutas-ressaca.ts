import type { Acao, Fase, Posicao } from '../motor/index.ts';

const comandos = { U: 'cima', D: 'baixo', L: 'esquerda', R: 'direita', X: 'trocar' } as const;
const rota = (s: string): Acao[] => [...s].map(letra => comandos[letra as keyof typeof comandos]);
const p = (coluna: number, linha: number): Posicao => ({ coluna, linha });

export const GRUTAS_DUPLA: readonly Fase[] = [
  {
    id: 'grutas-dupla-portao', nome: 'A pérola e a placa',
    mapa: ['S=HODC', '######', 'AK.EP#'],
    dupla: { segundoAlvo: 'P' },
    etapasGruta: ['K', 'E'],
    objetivo: 'Abra o portão das grutas encaixando a pérola e mantenha a placa pressionada até alcançar a concha.',
    ensino: 'A pérola fica com quem recolheu. Estacione esse siri na placa depois do encaixe; o outro cruza na baixa.',
    solucao: rota('RRXRRRRXRRR'),
  },
  {
    id: 'grutas-dupla-camaras', nome: 'Revezamento nas câmaras',
    mapa: ['S.HFODC', '##.####', 'A=K=EPT'],
    dupla: { segundoAlvo: 'T' },
    etapasGruta: ['K', 'E', 'F'],
    objetivo: 'Faça o encaixe, acione a alavanca da outra câmara e reúna os dois nos destinos.',
    ensino: 'Proteja quem carrega a pérola durante as viradas. Depois do encaixe, revezem-se entre a alavanca, a placa e o marco.',
    solucao: rota('XRRXRLRRXRRRXRRRRXR'),
  },
];

export const RESSACA_DUPLA: readonly Fase[] = [
  {
    id: 'ressaca-dupla-abrigo', nome: 'Abrigo dos dois cais',
    mapa: ['S..~####', '###~~###', 'A=.P~D.C', '##..T###'],
    dupla: { segundoAlvo: 'T' },
    balsas: [{ paradas: [p(3, 0), p(4, 2)] }],
    ameaca: { alvo: p(5, 2), rota: [p(4, 2), p(3, 2)], primeiroAtaque: 5, periodo: 4 },
    objetivo: 'Leve um siri de balsa, use a placa e reúna a dupla sem cair no rasante.',
    ensino: 'A garça muda o alvo entre os cais. Use o refúgio e prepare o próximo passo antes de trocar de siri.',
    solucao: rota('RRRDUDXRRRXURXDRXRR'),
  },
  {
    id: 'ressaca-dupla-ancoradouros', nome: 'Ancoradouros em revezamento',
    mapa: ['S..~########', '###~~~######', 'A..P.~.~~~DC', '##...#..T###'],
    dupla: { segundoAlvo: 'T' },
    balsas: [{ paradas: [p(3, 0), p(5, 2)] }, { paradas: [p(7, 2), p(9, 2)] }],
    ameaca: { alvo: p(6, 2), rota: [p(9, 2), p(3, 2), p(8, 3)], primeiroAtaque: 4, periodo: 4 },
    objetivo: 'Coordene as duas balsas e o portão para levar cada siri a um destino.',
    ensino: 'As duas balsas mudam juntas. Planeje quem fica na placa, quem vai pelo cais intermediário e onde cada siri espera o próximo rasante.',
    solucao: rota('RRRLRRRXRRRXRXDXRXURRRDRR'),
  },
];
