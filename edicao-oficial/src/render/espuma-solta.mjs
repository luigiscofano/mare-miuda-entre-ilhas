import { brilhoDaEspuma, apararCristaSolta } from '@@MARE:modulo:src/render/animacao-visual.mjs@@';
                                                           
                                                              

                                                                                                    

export function pintarCristaRetangular(pintar             , crista             ,
  [azul, branco]                           ,
)       {
  const { x, y, largura: l, pontaBranca } = crista;
  pintar(azul, x, y + 3, l - 5, 3);
  const inicio = x + 3 + brilhoDaEspuma(x,y);
  const [dx, comprimento] = apararCristaSolta(inicio,y,l-11);
  pintar(branco, inicio + dx, y + 2, comprimento, 3);
  pintar(azul, x + l - 5, y + 4, 5, 2);
  if (pontaBranca) pintar(branco, x + l - 5, y + 4, 3, 1);
}

const separadas = (a           , b           , margem        ) =>
  a.x + a.largura + margem <= b.x || b.x + b.largura + margem <= a.x
  || a.y + a.altura + margem <= b.y || b.y + b.altura + margem <= a.y;

// As cristas são do cenário. A reserva usa toda a malha, mesmo na alta,
// e inclui a caixa real da rocha da Praia quando ela estiver em visita.
export function cristasDaDeriva(id        , grade           , largura        , altura        ,
  rochas                      ,
)                         {
  if (!id.startsWith('deriva-')) return [];
  const semente = Array.from(id).reduce((soma, letra) => soma + letra.charCodeAt(0), 0);
  const resultado                = [];
  for (const lado of [0, 1]) {
    const margemEsquerda = lado === 0 ? 0 : grade.x + grade.largura + 14;
    const margemDireita = lado === 0 ? grade.x - 14 : largura;
    const l = (semente + lado) % 2 === 0 ? 19 : 21;
    if (margemDireita - margemEsquerda < l + 12) continue;
    const x = Math.floor((margemEsquerda + margemDireita - l) / 2);
    for (const proporcao of (lado === 0 ? [.60, .39, .82, .12, .92] : [.49, .66, .12, .90, .38])) {
      const y = Math.floor(altura * proporcao) + (semente % 13 - 6);
      const caixa = { x, y, largura: l, altura: 7 };
      if (y < 4 || y + 7 > altura - 4 || rochas.some(rocha => !separadas(rocha, caixa, 9))) continue;
      resultado.push({ x, y, largura: l, pontaBranca: true });
      break;
    }
  }
  return resultado;
}
