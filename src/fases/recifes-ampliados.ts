import type { Acao, Fase } from '../motor/index.ts';

const comandos = { U: 'cima', D: 'baixo', L: 'esquerda', R: 'direita' } as const;
const rota = (letras: string): Acao[] =>
  [...letras].map(letra => comandos[letra as keyof typeof comandos]);

// O lote usa apenas regras já ensinadas: baixios, abrigos e fragmentos.
export const FASES_RECIFES_AMPLIADOS = [
  {
    id: 'recife-degraus', nome: 'Degraus da vazante',
    objetivo: 'Alcance a concha pelos dois bancos de areia.',
    ensino: 'Planeje a hora de sair de cada pedra: veja a próxima virada antes de pisar no baixio.',
    mapa: ['S=H##', '.#H##', '##H=C'],
    solucao: rota('RRDUDDRR'),
  },
  {
    id: 'recife-janelas', nome: 'Janelas do coral',
    objetivo: 'Atravesse as duas janelas de maré baixa até a concha.',
    ensino: 'Os baixios aparecem em pares. Use o bolsão de terra firme para ajustar o passo de cada travessia.',
    mapa: ['S==H####', '###H####', '##.H.==C', '###...##'],
    solucao: rota('RRRDDRRRR'),
  },
  {
    id: 'recife-pedra-oco', nome: 'Oco da pedra',
    objetivo: 'Recolha o fragmento guardado entre as pedras e siga à saída.',
    ensino: 'A passagem de volta tem outra posição no ciclo. Prepare-a no bolsão perto do fragmento.',
    mapa: ['S=H=G#', '.#.#.#', '##H=.B', '####..'],
    solucao: rota('RRDUDDRRRLUU'),
  },
  {
    id: 'recife-volta-costao', nome: 'Volta pelo costão',
    objetivo: 'Pegue o fragmento na outra margem e volte à saída do costão.',
    ensino: 'Você pode investigar os dois braços; eles têm distâncias diferentes até a primeira pedra firme.',
    mapa: ['SG.#B..', '.#=#.#.', '.#H=H=.', '...#.#.','##H=H..'],
    solucao: rota('DDDRRURRUUDDLLDUDUUUL'),
  },
  {
    id: 'recife-pocas-suspensas', nome: 'Poças suspensas',
    objetivo: 'Recolha dois fragmentos nos bolsões alto e baixo e regresse à saída.',
    ensino: 'O corredor central serve para trocar de margem. A pedra alta permite preparar cada incursão sem recuar ao começo.',
    mapa: ['B.=H==.', '.#.#.#.', 'H=HSH=H', '.#.#.#.', '.==H=.B', '###G###'],
    solucao: rota('LLLUUDDRRUDRRRRDDLLLD'),
  },
  {
    id: 'recife-cintura', nome: 'Cintura de espuma',
    objetivo: 'Atravesse a cintura do recife na baixa, busque o fragmento e encontre a saída.',
    ensino: 'A mesma curva pode ficar segura ou perigosa conforme o sentido e o passo em que você entra.',
    mapa: ['S==H#####', '.#.H=H..G', '...#.#=##', '##H=H=H.B', '#####...#'],
    solucao: rota('DUDDRRDRRUDUDRRRRLLUURR'),
  },
  {
    id: 'recife-tres-aneis', nome: 'Três anéis da vazante',
    objetivo: 'Reúna os três fragmentos espalhados pelos anéis e volte ao centro.',
    ensino: 'Os três braços exigem chegadas em momentos diferentes. Conte também o caminho de volta de cada braço.',
    mapa: ['B=.H###.B', '.##.###=.', 'H=H.HH=H.', '##.SG.###', '##H=HHH..', '####.##=.', '####H.=HB'],
    solucao: rota('UUUDULLLDUDURRRDDRRRRRUUDUDUDDLLLDDRRDDRUULLLUL'),
  },
  {
    id: 'recife-fio-coral', nome: 'Fio de coral',
    objetivo: 'Siga pela margem curta e encontre a concha escondida.',
    ensino: 'No desvio, cada banco de areia tem um único refúgio. Qual casa firme deixa a hora de chegada mais conveniente?',
    mapa: ['##..##', 'S=H=##', '.##H=C', '.==H##'],
    solucao: rota('DUDUDDRRRUDURR'),
  },
  {
    id: 'recife-mosaico', nome: 'Mosaico das poças',
    objetivo: 'Recolha os fragmentos dos braços do mosaico e alcance a saída.',
    ensino: 'Alguns atalhos de baixa são úteis na ida, outros na volta. Descubra qual trilha vale fazer em cada sentido.',
    mapa: ['B=H==H.B', '.#.##...','H.H==H##','##S.#.G#','B=H.H=H.','..==H...'],
    solucao: rota('UUDLLUUDDRRDDDLLUDURRUDRRRUUUURRDLLDDR'),
  },
] as const satisfies readonly Fase[];

export type IdFaseRecifesAmpliados = typeof FASES_RECIFES_AMPLIADOS[number]['id'];
