import type { Acao, Fase, Posicao } from '../motor/index.ts';
const comandos = { U: 'cima', D: 'baixo', L: 'esquerda', R: 'direita' } as const;
const rota = (letras: string): Acao[] => [...letras].map(l => comandos[l as keyof typeof comandos]);
const p = (coluna: number, linha: number): Posicao => ({ coluna, linha });

export const FASES_ENSEADA: readonly Fase[] = [
  {
    id: 'enseada-sombra-restinga', nome: 'Sombra na restinga',
    mapa: ['S...C', '##.##'],
    ameaca: { alvo: p(3, 0), rota: [p(1, 0)], primeiroAtaque: 3, periodo: 4 },
    objetivo: 'Alcance a concha depois do primeiro rasante.',
    ensino: 'A garça alterna duas casas. Use o nicho de areia para evitar a primeira marca.',
    solucao: rota('RRDURR'),
  },
  {
    id: 'enseada-abrigo-ondas', nome: 'Abrigo entre ondas',
    mapa: ['S=.H=C', '##...#'],
    ameaca: { alvo: p(4, 0), rota: [p(3, 0)], primeiroAtaque: 5, periodo: 4 },
    objetivo: 'Use o refúgio para atravessar a água e a patrulha.',
    ensino: 'A pedra alta protege da maré, mas o aviso do rasante vale também ali.',
    solucao: rota('RRRDUDURR'),
  },
  {
    id: 'enseada-farol-baixo', nome: 'Corrida ao farol baixo',
    mapa: ['SG.###', '##..B#', '##H=..'],
    ameaca: { alvo: p(3, 1), rota: [p(4, 1), p(2, 1)], primeiroAtaque: 4, periodo: 3 },
    objetivo: 'Busque o fragmento e volte à saída de cais.',
    ensino: 'A garça desloca o alvo. Escolha o caminho de volta olhando o próximo rasante e a maré.',
    solucao: rota('RRDUDUDRRLLUL'),
  },
];

export const FASES_DERIVA: readonly Fase[] = [
  {
    id: 'deriva-primeira-balsa', nome: 'A primeira balsa',
    mapa: ['S..~##', '###~##', '###~.C'],
    balsas: [{ paradas: [p(3, 0), p(3, 2)] }],
    objetivo: 'Embarque e alcance a concha na margem oposta.',
    ensino: 'A balsa carrega quem estiver nela na virada. Água sem balsa bloqueia o passo.',
    solucao: rota('RRRRR'),
  },
  {
    id: 'deriva-duas-margens', nome: 'Duas margens',
    mapa: ['SG.~...','###~~..','###~.~~','####..B'],
    balsas: [{ paradas: [p(3, 0), p(3, 2)] }, { paradas: [p(4, 1), p(5, 2)] }],
    objetivo: 'Busque o fragmento e use a balsa no retorno.',
    ensino: 'A margem direita tem espaço para acertar a virada de volta. Use os dois cais em sentidos diferentes e ajuste o passo pela margem.',
    solucao: rota('RRRRRUUDLDRLLUUUULLLL'),
  },
  {
    id: 'deriva-corrente-cruzada', nome: 'Corrente cruzada',
    mapa: ['###########', 'S..~~~.~~~C', '#..###.####'],
    balsas: [{ paradas: [p(3, 1), p(5, 1)] }, { paradas: [p(7, 1), p(9, 1)] }],
    objetivo: 'Use as duas balsas e a faixa de areia intermediária.',
    ensino: 'As balsas se movem na mesma virada. O refúgio central permite esperar o retorno da próxima.',
    solucao: rota('RRRRDURLRR'),
  },
];
