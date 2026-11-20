import type { Acao, Fase } from '../motor/index.ts';

const comandos = { U: 'cima', D: 'baixo', L: 'esquerda', R: 'direita' } as const;
const rota = (letras: string): Acao[] => [...letras].map(letra => comandos[letra as keyof typeof comandos]);

// A rota principal das Grutas ensina a entrega, a ordem e depois combina ambas com a maré.
export const FASES_GRUTAS: readonly Fase[] = [
  {
    id: 'grutas-encaixe', nome: 'Uma pérola para o portão',
    objetivo: 'Carregue a pérola até o encaixe A e atravesse o portão.',
    ensino: 'Pise na pérola e leve-a até A. O encaixe abre o portão sem gastar outro passo.',
    mapa: ['#K####', 'S..EOC'],
    etapasGruta: ['K', 'E'],
    solucao: rota('RUDRRRR'),
  },
  {
    id: 'grutas-ordem', nome: 'Duas câmaras, uma ordem',
    objetivo: 'Acione o encaixe A antes da alavanca B para abrir o portão.',
    ensino: 'B está perto, mas só responde depois de A. Você pode passar por B antes sem perder o progresso.',
    mapa: ['###E##', 'SF..OC'],
    etapasGruta: ['E', 'F'],
    solucao: rota('RRRUDLLRRRR'),
  },
  {
    id: 'grutas-retorno', nome: 'A pérola da maré baixa',
    objetivo: 'Leve a pérola até A, volte para acionar B e atravesse o portão.',
    ensino: 'A só aceita a pérola e B só responde depois de A. Use o chão firme de cada câmara para ajustar os passos antes do baixio.',
    mapa: ['##F#####', 'S..=E.OC', '#K######'],
    etapasGruta: ['K', 'E', 'F'],
    solucao: rota('RDUDURRRRLRLLLUDUDRRRRR'),
  },
];
