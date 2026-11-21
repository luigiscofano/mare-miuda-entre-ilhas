import { ULTIMA_VIRADA } from './ultima-virada.ts';
import { ECO_DOS_TRES_CAIS, TRES_LUZES_EM_REVEZAMENTO } from './trio-avancado.ts';
import { TRES_REFUGIOS } from './trio-grutas.ts';
import { GUARDIAO_FAROL } from './guardiao-farol.ts';
import { RESSACA_ALTA } from './ressaca-alta.ts';
import { VENTO_SUL } from './vento-sul.ts';
import { FASES_RESSACA_AMPLIADA } from './ressaca-ampliada.ts';
import { FASES_GRUTAS_AMPLIADAS } from './grutas-ampliadas.ts';
import { FASES_DERIVA_AMPLIADA } from './deriva-ampliada.ts';
import { FASES_ENSEADA_AMPLIADA } from './enseada-ampliada.ts';
import { FASES_MANGUE_AMPLIADO } from './mangue-ampliado.ts';
import { FASES_RECIFES_AMPLIADOS } from './recifes-ampliados.ts';
import { FASES_ENSEADINHA } from './praia-enseadinha.ts';
import { FASES_DERIVA, FASES_ENSEADA } from './lote2.ts';
import { FASES_GRUTAS } from './lote3.ts';
import { DUPLA_DERIVA, DUPLA_DERIVA_CONTRAMAO, DUPLA_ENSEADA, DUPLA_ENSEADA_REVEZAMENTO } from './duplas-opcionais.ts';
import { GRUTAS_DUPLA, RESSACA_DUPLA } from './duplas-grutas-ressaca.ts';
import { FASES_FAROL_AMPLIADO } from './farol-ampliado.ts';
import { FASES_FAROL } from './farol.ts';
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

// As três travessias históricas não incluem o teste de moedas do laboratório.
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
  ...FASES_RECIFES_AMPLIADOS,
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
  ...FASES_MANGUE_AMPLIADO,
];

export const TODAS_AS_FASES = [...FASES_PRAIA, ...FASES_ENSEADINHA, ...FASES_RECIFES, ...FASES_MANGUE, ...FASES_ENSEADA, ...FASES_ENSEADA_AMPLIADA, ...FASES_DERIVA, ...FASES_DERIVA_AMPLIADA, DUPLA_ENSEADA, DUPLA_ENSEADA_REVEZAMENTO, DUPLA_DERIVA, DUPLA_DERIVA_CONTRAMAO, ...FASES_GRUTAS, ...GRUTAS_DUPLA, ...FASES_GRUTAS_AMPLIADAS, TRES_REFUGIOS, ...RESSACA_DUPLA, ...FASES_RESSACA_AMPLIADA, VENTO_SUL, RESSACA_ALTA, ECO_DOS_TRES_CAIS, ...FASES_FAROL, ...FASES_FAROL_AMPLIADO, GUARDIAO_FAROL, TRES_LUZES_EM_REVEZAMENTO, ULTIMA_VIRADA];

export const TRES_MOEDAS: Fase = {
  id: 'laboratorio-tres-moedas', nome: 'Três moedas na restinga',
  objetivo: 'Recolha três moedas e retorne à saída em até 14 passos válidos.',
  ensino: 'As moedas ficam em ramos distintos. Escolha a ordem; um passo inválido não gasta orçamento.',
  mapa: ['##B##', '##.##', 'B.S.G', '##.##', '##B##'],
  orcamentoMoedas: 14, solucao: rota('UUDDLLRRDDUURR'),
};
export const FASES_BANCADA = [...FASES, TRES_MOEDAS];
