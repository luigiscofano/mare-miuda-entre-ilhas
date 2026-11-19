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
