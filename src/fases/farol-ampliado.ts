import type { Acao, Fase, Posicao } from '../motor/index.ts';

const comandos = { U: 'cima', D: 'baixo', L: 'esquerda', R: 'direita', X: 'trocar' } as const;
const rota = (letras: string): Acao[] => [...letras].map(letra => comandos[letra as keyof typeof comandos]);
const p = (coluna: number, linha: number): Posicao => ({ coluna, linha });
const balsa = (baixa: Posicao, alta: Posicao) => ({ paradas: [baixa, alta] as const });

// O Farol combina os mecanismos ensinados nos mundos anteriores sem alterar as regras do turno.
export const FASES_FAROL_AMPLIADO = [
  {
    id: 'farol-faroleiros-de-vigia', nome: 'Faroleiros de vigia',
    objetivo: 'Recolha a pérola e ocupe a saída e o marco sem cair no rasante.',
    ensino: 'O portão encurta o revezamento, mas existe um contorno. Confira os alvos da garça antes de deixar um siri na placa.',
    mapa: ['S=H.##B#', '##..P..#', 'A.H=D.G#', '.####.T#'],
    dupla: { segundoAlvo: 'T' },
    ameaca: { alvo: p(4, 1), rota: [p(3, 1), p(5, 2), p(3, 0)],
      primeiroAtaque: 5, periodo: 3 },
    solucao: rota('XRXRRRDRXRRRRRDXRRUDD'),
  },
  {
    id: 'farol-turno-dos-guardioes', nome: 'Turno dos guardiões',
    objetivo: 'Alinhe as duas balsas, recupere as pérolas e reúna a dupla depois do portão.',
    ensino: 'Deixe o parceiro em terra firme ou embarcado antes de mover o siri ativo. Leia o aviso da garça perto da placa e do marco.',
    mapa: ['S..~~~H=B.DG', '...#####.###', '########..##', 'AB.~~~H=.PT#', '...####.#.##'],
    balsas: [balsa(p(3, 0), p(5, 0)), balsa(p(5, 3), p(3, 3))],
    dupla: { segundoAlvo: 'T' },
    ameaca: { alvo: p(8, 2), rota: [p(10, 3), p(9, 3), p(7, 3)],
      primeiroAtaque: 13, periodo: 4 },
    solucao: rota('RRRXRRRRRRXRXRRLXRRRRRXR'),
  },
  {
    id: 'farol-costa-das-tres-luzes', nome: 'Costa das três luzes',
    objetivo: 'Recolha as três moedas e alcance a saída em até 29 passos válidos.',
    ensino: 'Escolha uma rota entre os bolsos da costa. Dois passos de folga bastam para um desvio curto, mas não para cruzar um banco na hora errada.',
    mapa: ['B...#..B#', '.=...==.#', 'H===H.#.#', '..#S=H..G', '.=.=..#.#', 'B..#..H.#'],
    orcamentoMoedas: 29,
    solucao: rota('DLDLRLRLLUUUUURRRDRRURRDDDR'),
  },
  {
    id: 'farol-faisca-de-entrada', nome: 'Faísca de entrada',
    objetivo: 'Leve a pérola ao encaixe, volte à alavanca e alcance a saída do faroleiro.',
    ensino: 'O anel de terra firme permite voltar à alavanca por dois lados. Use o refúgio antes de cruzar dois baixios na mesma janela.',
    mapa: ['#F...#####', '##....H###', 'SK=H==..##', '..#..#.E##', '..H...#OC#'],
    etapasGruta: ['K', 'E', 'F'],
    solucao: rota('RRRURRRDRDLULLLULULRRRDRRDRDDR'),
  },
  {
    id: 'farol-salao-das-lanternas', nome: 'Salão das lanternas',
    objetivo: 'Leve a pérola da gruta ao Encaixe A, acione a alavanca e reúna a dupla além dos dois portões.',
    ensino: 'Recolha também a pérola de coleta. O siri que recolhe a pérola de encaixe precisa encaixá-la; o outro aciona a alavanca e segura a placa. Depois da passagem, contorne pela galeria sul.',
    mapa: ['SK=H.E.######', '####.#O..B###', '########.DG##', 'A.=H.FPH##T##', '...####....##'],
    dupla: { segundoAlvo: 'T' },
    etapasGruta: ['K', 'E', 'F'],
    solucao: rota('RRRRRXRRRRRRXRDRRRDRXRDRRRU'),
  },
  {
    id: 'farol-quatro-cais', nome: 'Quatro cais do farol',
    objetivo: 'Recolha as três pérolas, atravesse quatro cais e volte à saída no oeste.',
    ensino: 'As balsas alternam os sentidos. Você pode andar no cais para ajustar o momento da partida antes de embarcar.',
    mapa: ['S..~~.B.#####', '..#####..####', '#######..~~B#', '...####..##.#', 'G.B~~~..###.#', '######...~~~.'],
    balsas: [balsa(p(3, 0), p(4, 0)), balsa(p(10, 2), p(9, 2)), balsa(p(5, 4), p(3, 4)), balsa(p(9, 5), p(11, 5))],
    solucao: rota('RRRRRRDRDRLRRDDDRLLRLLRLLULLLL'),
  },
  {
    id: 'farol-lentes-em-contramare', nome: 'Lentes em contramaré',
    objetivo: 'Leve a pérola da gruta ao Encaixe A, acione a alavanca, busque a pérola de coleta e reúna a dupla.',
    ensino: 'O coral cuida da lente na margem norte. O verde vira a maré na outra margem, alcança a alavanca e sustenta a placa até a travessia.',
    mapa: ['SK=H~~~..E###', '...######.OB#', '##########.##', 'A..~~~H...DG#', '...####=F####', '######..P.T##'],
    balsas: [balsa(p(4, 0), p(6, 0)), balsa(p(5, 3), p(3, 3))],
    dupla: { segundoAlvo: 'T' },
    etapasGruta: ['K', 'E', 'F'],
    solucao: rota('RRRXRRRRRXRRRRXRDDXDRRLDDRXRR'),
  },
  {
    id: 'farol-luz-das-duas-mares', nome: 'A luz das duas marés',
    objetivo: 'Abra os dois portões, recolha as três pérolas e ocupe a saída e o marco.',
    ensino: 'A alavanca na margem sul abre o portão da lente. Na última balsa, faça uma ida e volta para completar a coleta e só então coordene a placa e a chegada.',
    mapa: ['S.KH~~~..=EOB##', '...####.###.###', '###########~B##', 'A.B~~~H....####', '...####=F##~###', '######..P....DG', '##########T####'],
    balsas: [balsa(p(4, 0), p(6, 0)), balsa(p(5, 3), p(3, 3)), balsa(p(11, 2), p(11, 4))],
    dupla: { segundoAlvo: 'T' },
    etapasGruta: ['K', 'E', 'F'],
    ameaca: { alvo: p(10, 6), rota: [p(9, 3), p(12, 2)],
      primeiroAtaque: 17, periodo: 4 },
    solucao: rota('RXRRRXRRRXRRRXRRRRXDDXRRLRLRLDDRLDRRRXRRD'),
  },
] as const satisfies readonly Fase[];

export type IdFaseFarolAmpliado = typeof FASES_FAROL_AMPLIADO[number]['id'];
