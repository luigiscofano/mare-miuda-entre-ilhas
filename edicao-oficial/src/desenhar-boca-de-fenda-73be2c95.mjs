                                               

// Contornos irregulares, interior escuro e beirada baixa da própria rocha.
// Não há brilho nem efeito que pareça portal; cada forma é legível sem cor.
const BOCA                                                      = {
  redonda: [
    '...lll....',
    '.lloooll..',
    '.loiiiol..',
    'loiiiiotl.',
    'loiiiiotl.',
    '.loooottl.',
    '..ltttll..',
    '...lll....',
  ],
  estreita: [
    '.....ll...',
    '....lool..',
    '...loil...',
    '..loitl...',
    '..loitl...',
    '.loitl....',
    '.lotl.....',
    '..ll......',
  ],
  bifurcada: [
    '.ll...ll..',
    '.lollotl..',
    '..liliol..',
    '...liol...',
    '...litl...',
    '...lotl...',
    '....ll....',
    '..........',
  ],
};

export function desenharBocaDeFenda(ctx                                                          ,
  forma                , ativa         , x        , y        ,
) {
  const cores                                   = ativa
    ? { l: '#596157', o: '#39473f', i: '#273b35', t: '#927e60' }
    : { l: '#bc986b', o: '#d6b682', t: '#d6b682' };
  BOCA[forma].forEach((fileira, linha) => [...fileira].forEach((pixel, coluna) => {
    const cor = cores[pixel];
    if (!cor) return;
    ctx.fillStyle = cor;
    ctx.fillRect(Math.round(x) + 3 + coluna, Math.round(y) + 4 + linha, 1, 1);
  }));
}

// O contorno é uma indicação de jogo, separada da fenda na areia. A saída
// perigosa também traz um ponto de exclamação legível sem distinguir cores.
export function desenharSaidaDeFenda(ctx                                                          ,
  x        , y        , vaiAlagar         ,
) {
  x = Math.round(x);
  y = Math.round(y);
  ctx.fillStyle = '#313e3e';
  for (const [dx, dy] of [[0, 0], [10, 0], [0, 10], [10, 10]]) ctx.fillRect(x + dx, y + dy, 6, 6);
  ctx.fillStyle = vaiAlagar ? '#f5bd6d' : '#f5e4b0';
  for (const [dx, dy] of [[1, 1], [11, 1], [1, 11], [11, 11]]) ctx.fillRect(x + dx, y + dy, 4, 4);
  if (vaiAlagar) {
    ctx.fillStyle = '#313e3e';
    ctx.fillRect(x + 6, y + 1, 4, 8);
    ctx.fillStyle = '#ffdf87';
    ctx.fillRect(x + 7, y + 2, 2, 4);
    ctx.fillRect(x + 7, y + 7, 2, 1);
  }
}
