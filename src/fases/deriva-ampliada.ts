import type { Acao, Fase, Posicao } from '../motor/index.ts';

const comandos = { U: 'cima', D: 'baixo', L: 'esquerda', R: 'direita', X: 'trocar' } as const;
const rota = (letras: string): Acao[] =>
  [...letras].map(letra => comandos[letra as keyof typeof comandos]);
const ponto = (coluna: number, linha: number): Posicao => ({ coluna, linha });

// A posição de cada balsa é previsível: primeira parada na baixa, segunda na alta.
export const FASES_DERIVA_AMPLIADA = [
  {
    id: 'deriva-um-passo-ao-cais', nome: 'Um passo ao cais',
    objetivo: 'Use a balsa de leste e alcance a concha.',
    ensino: 'Confira se a balsa está ao lado do cais. O terceiro passo válido muda a maré e transporta quem embarcou.',
    mapa: ['S..~~~.C', '...#####'],
    balsas: [{ paradas: [ponto(3, 0), ponto(5, 0)] }],
    solucao: rota('RRRRR'),
  },
  {
    id: 'deriva-cais-da-alta', nome: 'O cais da alta',
    objetivo: 'Alcance a concha usando a balsa no sentido de volta.',
    ensino: 'A balsa começa longe do siri. Caminhe perto do cais para trazê-la, embarque na alta e use a descida para atravessar.',
    mapa: ['C.~~~~.S', '######..'],
    balsas: [{ paradas: [ponto(2, 0), ponto(5, 0)] }],
    solucao: rota('DUDULLLL'),
  },
  {
    id: 'deriva-duas-rampas', nome: 'Duas rampas',
    objetivo: 'Pegue a balsa e chegue à concha por um dos desembarques.',
    ensino: 'As rampas têm distâncias diferentes até o próximo baixio. A saída que parece mais curta no mapa pode dar na água alta.',
    mapa: ['S..~~~H=C', '...##H.=.', '######H..'],
    balsas: [{ paradas: [ponto(3, 0), ponto(5, 0)] }],
    solucao: rota('RRRDURRR'),
  },
  {
    id: 'deriva-balsas-alternadas', nome: 'Balsas alternadas',
    objetivo: 'Troque de balsa no ilhote e siga para a concha.',
    ensino: 'Uma balsa chega enquanto a outra parte. Desembarque no ilhote e mire a chegada da segunda na maré seguinte.',
    mapa: ['S..~~~~....~~.C', '#######...#####', '#######...#####'],
    balsas: [{ paradas: [ponto(3, 0), ponto(6, 0)] }, { paradas: [ponto(12, 0), ponto(11, 0)] }],
    solucao: rota('RRRRDUDURRRRRR'),
  },
  {
    id: 'deriva-ida-e-retorno', nome: 'Ida e retorno pela corrente',
    objetivo: 'Busque o fragmento do outro lado e volte ao cais inicial.',
    ensino: 'São duas balsas e cais diferentes para ida e volta. A balsa da ida não está no mesmo lugar quando você sai da margem.',
    mapa: ['SG.~~~~H.B', '..#####...', '..~~~~~~..'],
    balsas: [{ paradas: [ponto(3, 0), ponto(6, 0)] }, { paradas: [ponto(2, 2), ponto(7, 2)] }],
    solucao: rota('RRRRDURRDDLLLUU'),
  },
  {
    id: 'deriva-dois-ancoradouros', nome: 'Dois ancoradouros',
    objetivo: 'Recolha os dois fragmentos de margens opostas e siga até a saída de leste.',
    ensino: 'Planeje o primeiro desembarque e volte pelo outro braço. Depois, entre no ancoradouro que leva ao segundo fragmento.',
    mapa: ['B.~~~~S..~~~BG', '..####...#####', '..~~~~...#####'],
    balsas: [{ paradas: [ponto(5, 0), ponto(2, 0)] }, { paradas: [ponto(2, 2), ponto(5, 2)] }, { paradas: [ponto(9, 0), ponto(11, 0)] }],
    solucao: rota('DULLLDDRRRUURRRRR'),
  },
  {
    id: 'deriva-tripulacao-partilhada', nome: 'Tripulação partilhada',
    objetivo: 'Embarque com os dois siris, recolha o fragmento e chegue à saída e à raiz.',
    ensino: 'Deixe um siri a bordo e troque. O passo do parceiro pode virar a maré e transportar quem não está ativo.',
    mapa: ['S.~#~.BG', '########', 'A~##~..T'],
    balsas: [{ paradas: [ponto(2, 0), ponto(4, 0)] }, { paradas: [ponto(1, 2), ponto(4, 2)] }],
    dupla: { segundoAlvo: 'T' }, solucao: rota('RRXRRRXRRRXR'),
  },
] as const satisfies readonly Fase[];

export type IdFaseDerivaAmpliada = typeof FASES_DERIVA_AMPLIADA[number]['id'];
