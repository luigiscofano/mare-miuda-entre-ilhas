import type { Fase } from '../motor/index.ts';

export const FASES: readonly Fase[] = [
  {
    id: 'primeira-onda',
    nome: 'Passagem da primeira onda',
    objetivo: 'Atravesse o baixio e chegue à concha.',
    ensino: 'A maré vira a cada três passos válidos. Termine o terceiro passo em terra firme.',
    mapa: ['S=.C', '.###'],
    solucao: ['direita', 'direita', 'direita'],
  },
  {
    id: 'sombra-da-garca',
    nome: 'A sombra da garça',
    objetivo: 'Chegue à concha sem entrar na casa atacada no próximo passo.',
    ensino: 'Contorne a casa marcada pelo abrigo abaixo da trilha. O ataque não depende da velocidade do jogador.',
    mapa: ['S=..C', '##.##'],
    ameaca: { alvo: { coluna: 3, linha: 0 }, primeiroAtaque: 3, periodo: 4 },
    solucao: ['direita', 'direita', 'baixo', 'cima', 'direita', 'direita'],
  },
  {
    id: 'busca-e-volta',
    nome: 'Busca e volta',
    objetivo: 'Pegue o fragmento na ilhota e leve-o de volta à saída.',
    ensino: 'A saída exige o fragmento. Caminhe na ilha firme até a maré baixar antes de voltar pelo baixio.',
    mapa: ['SG#', '=##', '.B#'],
    solucao: ['baixo', 'baixo', 'direita', 'esquerda', 'direita', 'esquerda', 'cima', 'cima', 'direita'],
  },
];

// A bancada continua restrita às três travessias históricas.
export const FASES_PRAIA: readonly Fase[] = [
  ...FASES,
  {
    id: 'ilhota-perolada',
    nome: 'O segredo da ilhota',
    objetivo: 'Alcance a Concha Perolada e abra um caminho de volta.',
    ensino: 'A trilha de baixo tem espaço para marcar a descida antes da travessia.',
    mapa: ['S=.##', '.##=C', '...=.'],
    solucao: ['direita', 'esquerda', 'baixo', 'baixo', 'direita', 'direita', 'direita', 'direita', 'cima'],
  },
  {
    id: 'ponta-da-garca',
    nome: 'A ponta da garça',
    objetivo: 'Busque o fragmento e chegue à saída depois da curva, evitando a garça.',
    ensino: 'O sexto passo fecha um ciclo da água, mas a garça também ataca nesse turno. Veja o aviso antes de coletar.',
    mapa: ['S=....', '###.#G', '....B.'],
    ameaca: { alvo: { coluna: 4, linha: 2 }, primeiroAtaque: 6, periodo: 4 },
    solucao: ['direita', 'direita', 'direita', 'baixo', 'baixo', 'esquerda', 'direita', 'direita', 'direita', 'cima'],
  },
];

const comandos = {
  U: 'cima', D: 'baixo', L: 'esquerda', R: 'direita', X: 'trocar',
} as const;
type Comando = keyof typeof comandos;
const rota = (letras: string) => [...letras].map(letra => comandos[letra as Comando]);

export const FASES_RECIFES: readonly Fase[] = [
  {
    id: 'recife-pedra-firme', nome: 'Acima da espuma',
    objetivo: 'Use a pedra alta como refúgio e alcance a concha.',
    ensino: 'Pedra alta é firme e atravessável; rocha escura bloqueia. Volte à pedra quando a água baixar.',
    mapa: ['S=H==C', '##.###'], solucao: rota('RRDUDURRR'),
  },
  {
    id: 'recife-duas-pocas', nome: 'Duas poças do recife',
    objetivo: 'Recolha os dois fragmentos em lados opostos e retorne à saída.',
    ensino: 'As poças só se ligam na baixa. Os bolsões laterais têm chão firme para preparar o retorno.',
    mapa: ['###G###', 'B=.S.=B', '..#..#.'], solucao: rota('RRRDUDULLLRLLLLDRLRURRU'),
  },
  {
    id: 'recife-retorno', nome: 'A volta do recife',
    objetivo: 'Busque o fragmento na enseadinha e volte por três baixios até a saída.',
    ensino: 'Quando a maré subir, use os bolsões próximos à pedra para montar a volta em vários ciclos.',
    mapa: ['SG####', '=#.###', 'H=.###', '.#=B.#', '###..#'],
    solucao: rota('DDDUDURRUDUDDRRLRLLUUDUDLLDUDUUUR'),
  },
];

export const FASES_MANGUE: readonly Fase[] = [
  {
    id: 'mangue-dois-encontros', nome: 'Raízes vizinhas',
    objetivo: 'Leve um siri à concha e o outro à raiz marcada.',
    ensino: 'Troque com Espaço ou no botão Trocar siri. A troca não avança a maré; cada passo válido dos dois conta no mesmo relógio.',
    mapa: ['SC###', '##T.A'], dupla: { segundoAlvo: 'T' }, solucao: rota('RXLL'),
  },
  {
    id: 'mangue-placa', nome: 'Um segura, outro passa',
    objetivo: 'Mantenha um siri na placa enquanto o outro cruza o portão e chega à concha.',
    ensino: 'O siri de trás só abre a passagem enquanto pisa na placa. A pedra alta é segura na maré alta.',
    mapa: ['S=HDC', '.####', 'A.P##'],
    dupla: { segundoAlvo: 'P' }, solucao: rota('RRXRRXRR'),
  },
  {
    id: 'mangue-reuniao', nome: 'Reencontro na ponta do mangue',
    objetivo: 'Abra o portão e reúna os siris na concha e na raiz do outro lado.',
    ensino: 'Os dois são atingidos pela virada, mesmo quem está parado. Cruze o primeiro siri, depois tire o segundo da placa e leve-o à raiz.',
    mapa: ['S=H.DC', '.#.##T', 'A=H.P.'],
    dupla: { segundoAlvo: 'T' }, solucao: rota('RRRLRLXRRRRXRRRXRU'),
  },
];

export const TODAS_AS_FASES = [...FASES_PRAIA, ...FASES_RECIFES, ...FASES_MANGUE];
