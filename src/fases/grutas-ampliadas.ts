import type { Acao, Fase } from '../motor/index.ts';

const comandos = { U: 'cima', D: 'baixo', L: 'esquerda', R: 'direita', X: 'trocar' } as const;
const rota = (letras: string): Acao[] =>
  [...letras].map(letra => comandos[letra as keyof typeof comandos]);

// A sequência está nos dados de cada fase; o motor conserva a mesma regra de portador.
export const FASES_GRUTAS_AMPLIADAS = [
  {
    id: 'grutas-alavanca-da-entrada', nome: 'A alavanca da entrada',
    objetivo: 'Leve a pérola pelo encaixe, volte à alavanca e abra o portão.',
    ensino: 'A alavanca está na primeira bifurcação, mas só funciona depois do encaixe. Guarde o acesso a ela para a volta.',
    mapa: ['F..###', '#.HEOC', 'KS=###'],
    etapasGruta: ['K', 'E', 'F'], solucao: rota('LRURRLULLRDRRRR'),
  },
  {
    id: 'grutas-dobra-da-camara', nome: 'Dobra da câmara',
    objetivo: 'Leve a pérola de uma câmara até o encaixe pela passagem da maré.',
    ensino: 'A seca deixa dois caminhos; quem carrega deve alcançar o encaixe. Use o refúgio antes de contornar a volta pela alavanca.',
    mapa: ['K.H.##F.', '.#==##..', 'S=H.H.E#', '..###.OC'],
    etapasGruta: ['K', 'E', 'F'], solucao: rota('UUDUDDRRRRRRUUDDDR'),
  },
  {
    id: 'grutas-coral-portador', nome: 'O coral leva a pérola',
    objetivo: 'Leve a pérola com o siri coral, abra os portões e reúna a dupla.',
    ensino: 'O encaixe não aceita o outro siri. O verde guarda a placa, mas só precisa continuar nela até a travessia do coral.',
    mapa: ['SK=H.E##', '####.ODC', '########', 'A.=H.PT#', '...#####'],
    dupla: { segundoAlvo: 'T' },
    etapasGruta: ['K', 'E'], solucao: rota('RRRRRDXRRRRRXRRXR'),
  },
  {
    id: 'grutas-alavanca-distante', nome: 'A alavanca distante',
    objetivo: 'Encaixe a pérola na câmara sul, acione a alavanca no norte e reúna os dois.',
    ensino: 'Quem leva a pérola também precisa encaixá-la. A alavanca fica na outra margem e só responde depois da entrega.',
    mapa: ['S.H=FODC', '########', 'A=KHEPT#', '..H#####'],
    dupla: { segundoAlvo: 'T' },
    etapasGruta: ['K', 'E', 'F'], solucao: rota('RXRRRRRXRRRRRRXR'),
  },
  {
    id: 'grutas-boca-labirinto', nome: 'Boca do labirinto',
    objetivo: 'Abra os dois portões, recolha a pérola de coleta e reúna os siris no final.',
    ensino: 'A dupla divide o encaixe e a alavanca em margens diferentes. Antes de liberar a placa, deixe o outro além da porta e proteja a volta pela água.',
    mapa: ['SK=H.E#####', '####.###B##', '####.OD...G', '###########', 'A.=H.FP==T#', '...####.H.#'],
    dupla: { segundoAlvo: 'T' },
    etapasGruta: ['K', 'E', 'F'], solucao: rota('RRRRRLXRRRRRRXDDRRRRXRRRXUDRR'),
  },
] as const satisfies readonly Fase[];

export type IdFaseGrutasAmpliadas = typeof FASES_GRUTAS_AMPLIADAS[number]['id'];
