import type { Acao, Fase } from '../motor/index.ts';

const comandos = { U: 'cima', D: 'baixo', L: 'esquerda', R: 'direita', X: 'trocar' } as const;
const rota = (letras: string): Acao[] =>
  [...letras].map(letra => comandos[letra as keyof typeof comandos]);

// As duas posições contam para a maré, independentemente do siri selecionado.
export const FASES_MANGUE_AMPLIADO = [
  {
    id: 'mangue-duas-veredas', nome: 'Duas veredas',
    objetivo: 'Leve a dupla à concha e à raiz marcada, em veredas separadas.',
    ensino: 'Troque sem gastar um passo. Nenhum dos dois chega sozinho aos dois destinos.',
    mapa: ['S..C#', '#####', 'T..A#'],
    dupla: { segundoAlvo: 'T' }, solucao: rota('RRRXLLL'),
  },
  {
    id: 'mangue-janela-partilhada', nome: 'Janela partilhada',
    objetivo: 'Cruze os dois baixios e alcance a concha e a raiz marcada.',
    ensino: 'Não troque deixando o primeiro siri no baixio se a água estiver para subir. O refúgio de areia elevada é um lugar seguro para a troca.',
    mapa: ['S=H.C', '##.##', 'A.=HT'],
    dupla: { segundoAlvo: 'T' }, solucao: rota('RRDURRXRRRR'),
  },
  {
    id: 'mangue-trinco-salgado', nome: 'Trinco salgado',
    objetivo: 'Acione a placa da margem de baixo e mantenha-a pressionada até chegar à concha.',
    ensino: 'A maré dos dois é a mesma. Pare no refúgio enquanto o outro siri faz o trajeto até a placa.',
    mapa: ['S=HDDC', '.#.###', '###..P', 'A.=H##'],
    dupla: { segundoAlvo: 'P' }, solucao: rota('XRRRURRXRRRRR'),
  },
  {
    id: 'mangue-fragmentos-cruzados', nome: 'Fragmentos cruzados',
    objetivo: 'Recolha duas pérolas em margens opostas e alcance a saída e a raiz.',
    ensino: 'As pérolas fazem parte do objetivo dos dois. Não é preciso levar ambos à mesma pérola.',
    mapa: ['S=HB.G', '##.##.', '######', 'T.BH=A', '###.H.'],
    dupla: { segundoAlvo: 'T' }, solucao: rota('RRDURRRXLLLLL'),
  },
  {
    id: 'mangue-cotovelo', nome: 'Cotovelo das raízes',
    objetivo: 'Coloque os dois siris na concha e na raiz depois do cotovelo.',
    ensino: 'No caminho único, quem vai à frente precisa liberar a passagem do outro. Use os nichos firmes durante a alta.',
    mapa: ['S.###C', 'A.==TH', '##H.#.'],
    dupla: { segundoAlvo: 'T' }, solucao: rota('RDUDUDRRRRUXRRRR'),
  },
  {
    id: 'mangue-porteira-encontro', nome: 'Depois da porteira',
    objetivo: 'Passe pela porteira e reúna a dupla na concha e na raiz do outro lado.',
    ensino: 'Deixe um siri na placa só até o parceiro estar do outro lado. Depois atravesse o braço inferior na baixa, sem voltar pela porta.',
    mapa: ['S=H.D.C', '######T', 'A=H.P#.', '###H=H.'],
    dupla: { segundoAlvo: 'T' }, solucao: rota('XRRRDURXRRRRRRXDRRUU'),
  },
  {
    id: 'mangue-raizes-em-circuito', nome: 'Raízes em circuito',
    objetivo: 'Recolha as pérolas e faça a dupla se encontrar depois do portão.',
    ensino: 'Organize a coleta e a placa em turnos diferentes. Os dois corredores têm baixios e, depois da porta, o outro siri ainda precisa chegar à raiz.',
    mapa: ['S=H=DD.BG', '#########', 'A.=H.P==T', '##...##.#', '##B..##.#'],
    dupla: { segundoAlvo: 'T' }, solucao: rota('XRRDDUDUXRRXRURRXRRRRRXRRRXR'),
  },
] as const satisfies readonly Fase[];

export type IdFaseMangueAmpliado = typeof FASES_MANGUE_AMPLIADO[number]['id'];
