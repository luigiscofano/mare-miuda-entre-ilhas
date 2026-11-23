// Recorte nativo de 20 × 20 px da arte aprovada, sem mudar a silhueta.
export const PEROLA_COLETAVEL = [
  '......aaaaaaaa......',
  '......aaaaaaaa......',
  '..aaaaccccccbbaaaa..',
  '..aaacdddddccbbaaa..',
  '..aaccdddddccccbaa..',
  'aaabdddccccccccbbaaa',
  'aaacdddcccccccccbaaa',
  'aabcccccccccccccbbaa',
  'aabcccccccccccccbbaa',
  'aabbcccccccccccbbbaa',
  'aaabcccccccccccbbaaa',
  'aaabbbccccccccbbbaaa',
  '..aabbbccccccbbbba..',
  '..aaaabbbbbbbbbaaa..',
  '..aaaaabbbbbbaaaaa..',
  '......aaaaaaaa......',
  '......aaaaaaaa......',
  '....xxxxxxxxxxxxx...',
  '....xxxxxxxxxxxxx...',
  '......yyyyyyyy......',
]         ;

const TONS = [
  ['#82766d', '#c4ab93', '#ede0bf', '#fff4d8', '#c39e77', '#d6b48b'],
  ['#7f626d', '#be8992', '#edc6b9', '#fff0dd', '#c39e77', '#d6b48b'],
  ['#536f79', '#8fb3b6', '#c9ded5', '#eff5d9', '#c39e77', '#d6b48b'],
  ['#68617d', '#a79ac1', '#d9c9e2', '#f7eafa', '#c39e77', '#d6b48b'],
]         ;

// Contorno, meio-tom, nácar, brilho e dois tons compartilhados de sombra.
export function paletaDaPerola(indice        )                                   {
  const [a, b, c, d, x, y] = TONS[indice % TONS.length];
  return { a, b, c, d, x, y };
}
