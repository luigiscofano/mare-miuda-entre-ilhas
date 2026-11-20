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
