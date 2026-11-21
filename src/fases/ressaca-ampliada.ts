import type { Acao, Fase, Posicao } from '../motor/index.ts';

const comandos = { U: 'cima', D: 'baixo', L: 'esquerda', R: 'direita', X: 'trocar' } as const;
const rota = (letras: string): Acao[] => [...letras].map(letra => comandos[letra as keyof typeof comandos]);
const ponto = (coluna: number, linha: number): Posicao => ({ coluna, linha });

// As duas paradas de cada balsa correspondem à maré baixa e à alta.
export const FASES_RESSACA_AMPLIADA = [
  {
    id: 'ressaca-refugio-de-pedra', nome: 'Refúgio de pedra',
    mapa: ['S=H==H#', '##.##HC', '##.####'],
    objetivo: 'Cruze os bancos de areia e alcance a concha.',
    ensino: 'O primeiro refúgio tem um bolso firme ao sul. Use-o para iniciar a travessia dos dois baixios logo que a maré baixar.',
    solucao: rota('RRDDUURRRDR'),
  },
  {
    id: 'ressaca-bolsos-opostos', nome: 'Bolsos opostos',
    mapa: ['S..#B', '==H=.', '..#..', 'B.=.G'],
    objetivo: 'Recolha os dois fragmentos em extremos opostos e saia a sudeste.',
    ensino: 'O bolso sul deixa você preparar a subida para o segundo fragmento. Ler o relógio na ida evita ficar preso na volta.',
    solucao: rota('RDDDLRRRRUUUDDD'),
  },
  {
    id: 'ressaca-vigia-da-placa', nome: 'Vigia da placa',
    mapa: ['S=H.DC', '...#.#', '####T#', 'A=H.P#'],
    dupla: { segundoAlvo: 'T' },
    objetivo: 'Sustente o portão para o outro siri e depois deixe a placa para chegar ao marco.',
    ensino: 'O siri que segura a placa muda de função depois da passagem. Não deixe o parceiro parado no baixio quando a água subir.',
    solucao: rota('XRRRRXDRRURRRXU'),
  },
  {
    id: 'ressaca-balsas-da-ponta', nome: 'Balsas da ponta',
    mapa: ['S..~~~H==B#', '######....#', 'BG.~~~H.###'],
    balsas: [{ paradas: [ponto(3, 0), ponto(5, 0)] }, { paradas: [ponto(5, 2), ponto(3, 2)] }],
    objetivo: 'Use as duas balsas, recolha os fragmentos e desembarque na saída da ponta.',
    ensino: 'Ao passar pela ilha central, recolha o fragmento antes de pegar a balsa de volta a oeste.',
    solucao: rota('RRRRDRRRUDLLDLLLLLR'),
  },
  {
    id: 'ressaca-cais-em-paralelo', nome: 'Cais em paralelo',
    mapa: ['S..~~H=BDG', '##########', 'A.~~H..PT#'],
    balsas: [{ paradas: [ponto(3, 0), ponto(4, 0)] }, { paradas: [ponto(2, 2), ponto(3, 2)] }],
    dupla: { segundoAlvo: 'T' },
    objetivo: 'Atravesse com os dois siris, recolha o fragmento e complete o portão e o marco.',
    ensino: 'Os cais não se comunicam. Um passo de um siri pode tirar o outro da margem se ele já estiver embarcado.',
    solucao: rota('RXRRRRRRXRRRLRRRRRXR'),
  },
  {
    id: 'ressaca-tres-moedas-do-cais', nome: 'Três moedas do cais',
    mapa: ['B.#.B', '.=.=.', 'H=S=G', '..=..', 'B.#.#'],
    orcamentoMoedas: 20,
    objetivo: 'Recolha três moedas e saia em até 20 passos válidos.',
    ensino: 'Escolha a ordem das moedas antes de partir. A saída pode ser alcançada no último passo, mas não concede tempo extra.',
    solucao: rota('DLDLUUUUDDDRRRRUUUDD'),
  },
  {
    id: 'ressaca-atracadouro-torto', nome: 'Atracadouro torto',
    mapa: ['S.=H==B####', '..##..~####', '######~~~##', 'A.~H=.~.DG#', '..####.PT##'],
    balsas: [{ paradas: [ponto(6, 1), ponto(6, 3)] }, { paradas: [ponto(2, 3), ponto(6, 2)] }],
    dupla: { segundoAlvo: 'T' },
    objetivo: 'Busque o fragmento no norte e reúna a dupla depois das duas balsas.',
    ensino: 'As balsas chegam a alturas diferentes do cais central. Planeje a travessia do baixio e escolha quem sustenta a placa.',
    solucao: rota('RRRXRDUXRDXRDRXRRUDXDXRRRXR'),
  },
  {
    id: 'ressaca-cofre-da-vazante', nome: 'Cofre da vazante',
    mapa: ['S..~~~.B..DG', '...###=#####', '######..B###', '###B..=.P.T#', 'A..~~~.#####'],
    balsas: [{ paradas: [ponto(3, 0), ponto(5, 0)] }, { paradas: [ponto(5, 4), ponto(3, 4)] }],
    dupla: { segundoAlvo: 'T' },
    orcamentoMoedas: 22,
    objetivo: 'Recolha as três moedas e ocupe a saída e o marco em até 22 passos válidos.',
    ensino: 'Planeje o embarque em conjunto. A troca de siri não gasta passo; um caminho a mais pode custar a próxima janela da maré.',
    solucao: rota('RXRRRURRXRRRRRXRRRXRRRXUDRR'),
  },
] as const satisfies readonly Fase[];

export type IdFaseRessacaAmpliada = typeof FASES_RESSACA_AMPLIADA[number]['id'];
