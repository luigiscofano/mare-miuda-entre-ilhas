// Aprovado no primeiro estudo: espuma baixa e onda frontal, sem faixa contínua.
// As matrizes são pixels nativos da casa de 32 × 32, sem gradiente ou alfa parcial.

export const ESPUMA_DE_AVISO = {
  x: 3, y: 15, pixels: [
    '........eeeccccc..........',
    '....eecccccccccceeee......',
    'eeccccccccccccccccccccccc.',
    'eeccccccccccccccccccccccce',
    '...eeeeeccccceeeeeeeeeeeee',
    '...........eeeeeee........',
  ],
} as const;

export const ONDA_FRONTAL = {
  x: 3, y: 7, pixels: [
    '.............bbbbb.........',
    '.............nnnnn.........',
    '........nnnncccccnnnnn.....',
    '........cccccccccccccn.....',
    '....bncccccccccccccccccn...',
    '....bncccccnnnccccnncccn...',
    '....bbrnnnnmmmnnnnmmnnnn...',
    '....bbrnnnnmmmnnnnmmmmrr...',
    '..bbrmmmmmmmmmmmmmmmmmrrbb.',
    '..bbrmmmmmmmmmmmmmmmmmrrbb.',
    '..bbrrrrrrmmmmmmmmmmrrrrbb.',
    '..bbrrrrrrmmmmmmrrrrrrrrbb.',
    '..bbrrrrrrrrrrrrrrrrrrrrbb.',
    'bbrrrrrrrrrmmmmmmmrrrrrrrrb',
    'bbrrrmmmmmmmmmmmmmmmmmrrrrb',
    'bbbbbbrrrrrrrrrrrrrrrbbbbbb',
    '....bbbbbbbbbbbbbbbbbb.....',
  ],
} as const;

export const CORES_ONDA = { e: '#9bb4a6', c: '#fff0d6', b: '#295365', r: '#3e8297', m: '#6bacb0', n: '#caddd2' } as const;
// A crista segue clara; o tom de suporte dá mais contraste a um passo da virada.
export const CORES_ESPUMA_IMINENTE = { ...CORES_ONDA, e: '#6c968f' } as const;
