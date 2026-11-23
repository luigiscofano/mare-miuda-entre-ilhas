import { alvosDasConchasDaEquipe, lerCelula, totalFragmentos } from '@@MARE:modulo:src/formas-de-fenda-70ff4532.mjs@@';
                                                      
import { chaveDaPosicao } from '@@MARE:modulo:src/nomes-dos-siris-e97b332f.mjs@@';
                                                         

                                                                                   

export function conchasDaEquipe(fase      , estado        )                                      {
  if (!fase.dupla) return new Map();
  const faltamPerolas = estado.fragmentos.length < totalFragmentos(fase);
  return new Map(alvosDasConchasDaEquipe(fase).map(({ posicao, sobrePlaca }) => [
    chaveDaPosicao(posicao), { sobrePlaca, bloqueada: faltamPerolas && lerCelula(fase, posicao) === 'G' },
  ]));
}

const CADEADO = [
  '..####..',
  '.##..##.',
  '.##..##.',
  '########',
  '##++++##',
  '##+#++##',
  '##++++##',
  '########',
]         ;

// A própria concha do mundo é a mesma em todos os destinos. Só a concha
// que depende de pérolas ganha um cadeado; outros símbolos continuam separados.
export function pintarConchaDaEquipe(
  pintar        , alvo                , x        , y        , lado        ,
  concha                                , contorno        , luz        ,
)       {
  // Mesmo desenho e posição, inclusive quando a casa também é placa.
  concha(x, y);
  if (!alvo.bloqueada) return;
  const escala = lado === 48 ? 2 : 1;
  const esquerda = x + lado - 9 * escala;
  const topo = y + 3;
  for (const [dy, fila] of CADEADO.entries()) {
    for (const [dx, pixel] of Array.from(fila).entries()) {
      if (pixel !== '.') pintar(pixel === '#' ? contorno : luz,
        esquerda + dx * escala, topo + dy * escala, escala, escala);
    }
  }
}
