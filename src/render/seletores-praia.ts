import { entradaEm, nosDo, rotaLivre, trilhasDo } from '../campanha/index.ts';
import type { Mundo, Progresso } from '../campanha/index.ts';
import { prepararTravessia } from '../campanha/travessia.ts';
import type { Posicao } from '../motor/index.ts';

type Ponto = readonly [number, number];
const INK = '#263b45';
const CLARO = '#fff1cb';
const DIGITOS: Readonly<Record<string, readonly string[]>> = {
  '1': ['.#.', '##.', '.#.', '.#.', '###'],
  '2': ['##.', '..#', '.#.', '#..', '###'],
  '3': ['##.', '..#', '.#.', '..#', '##.'],
  '4': ['#.#', '#.#', '###', '..#', '..#'],
  '5': ['###', '#..', '##.', '..#', '##.'],
  '6': ['.##', '#..', '###', '#.#', '###'],
  '7': ['###', '..#', '.#.', '.#.', '#..'],
  '8': ['###', '#.#', '###', '#.#', '###'],
  '9': ['###', '#.#', '###', '..#', '##.'],
  '10': ['..#..###', '.##..#.#', '..#..#.#', '..#..#.#', '.###.###'],
  desvio: ['..#..', '.###.', '#####', '.###.', '..#..'],
  chefe: ['#...#', '#.#.#', '#####', '.###.', '.###.'],
  direita: ['..#..', '...#.', '#####', '...#.', '..#..'],
  esquerda: ['..#..', '.#...', '#####', '.#...', '..#..'],
  pronto: ['....#', '...#.', '#.#..', '.#...', '.....'],
};

function placa(ctx: CanvasRenderingContext2D, cor: string, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = cor;
  ctx.fillRect(x, y, w, h);
}

function grafar(ctx: CanvasRenderingContext2D, glifo: readonly string[], x: number, y: number, cor: string) {
  const esquerda = x - Math.floor(glifo[0].length / 2);
  glifo.forEach((linha, dy) => {
    for (let dx = 0; dx < linha.length; dx++) if (linha[dx] === '#') placa(ctx, cor, esquerda + dx, y + dy, 1, 1);
  });
}

export function pintarMarcoDaPraia(
  ctx: CanvasRenderingContext2D, x: number, y: number,
  simbolo: string, concluido: boolean, acima: boolean,
) {
  const topo = acima ? y - 11 : y + 3;
  const cor = simbolo === 'desvio' ? '#725274' : simbolo === 'chefe' ? '#843f49'
    : simbolo === 'esquerda' || simbolo === 'direita' ? '#326668' : '#5c452f';
  placa(ctx, INK, x - 5, topo, 11, 10);
  placa(ctx, cor, x - 4, topo + 1, 9, 8);
  placa(ctx, '#efc787', x - 4, topo + 1, 9, 1);
  placa(ctx, INK, x - 1, acima ? topo + 10 : topo - 2, 3, 2);
  grafar(ctx, DIGITOS[simbolo], x, topo + 3, CLARO);
  if (concluido) {
    placa(ctx, INK, x + 4, topo - 2, 7, 7);
    placa(ctx, '#42664c', x + 5, topo - 1, 5, 5);
    grafar(ctx, DIGITOS.pronto, x + 7, topo - 1, CLARO);
  }
}

export function pintarCadeadoPraia(ctx: CanvasRenderingContext2D, x: number, y: number) {
  placa(ctx, INK, x - 3, y - 4, 7, 8);
  placa(ctx, CLARO, x - 2, y - 3, 5, 1);
  placa(ctx, CLARO, x - 2, y - 2, 1, 2);
  placa(ctx, CLARO, x + 2, y - 2, 1, 2);
  placa(ctx, '#e3976c', x - 2, y, 5, 3);
  placa(ctx, INK, x, y + 1, 1, 1);
}

export function podePintarSeletorInterno(arte?: HTMLImageElement): arte is HTMLImageElement {
  return Boolean(arte?.complete && arte.naturalWidth === 512 && arte.naturalHeight === 384);
}

// Os mesmos vértices alimentam o traço e a animação; nenhum azulejo novo muda a navegação.
const MAPAS_COM_FUNDO = ['praia-enseadinha', 'recifes', 'mangue', 'enseada', 'deriva', 'grutas', 'ressaca', 'farol'] as const;
type MapaInterno = typeof MAPAS_COM_FUNDO[number];

export function mapaComFundoInterno(mundo: Mundo): mundo is MapaInterno {
  return MAPAS_COM_FUNDO.some(comFundo => comFundo === mundo);
}

export function pintarSeletorInterno(
  ctx: CanvasRenderingContext2D, progresso: Progresso,
  centro: (ponto: Posicao) => Ponto, arte: HTMLImageElement, mundo: MapaInterno,
) {
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(arte, 0, 0, 256, 192);
  const caminhos = trilhasDo(mundo).map(trecho => {
    const pontos = [trecho.de, ...trecho.curvas, trecho.para].map(centro);
    return {
      aberto: rotaLivre(progresso, trecho),
      distancia: pontos.slice(1).reduce((total, [x, y], i) => total + Math.hypot(x - pontos[i][0], y - pontos[i][1]), 0),
      fita: prepararTravessia(pontos.map(([coluna, linha]) => ({ coluna, linha }))),
    };
  });

  for (const { aberto, distancia, fita } of caminhos) {
    for (let i = 0; i <= distancia; i++) {
      const p = fita.ponto(i / distancia);
      const x = Math.round(p.coluna), y = Math.round(p.linha);
      placa(ctx, '#674c3c', x - 4, y - 3, 9, 7);
    }
    for (let i = 0; i <= distancia; i++) {
      const p = fita.ponto(i / distancia);
      const x = Math.round(p.coluna), y = Math.round(p.linha);
      placa(ctx, aberto ? '#efc987' : '#a28f73', x - 3, y - 2, 7, 4);
    }
    for (let i = 5; i < distancia - 4; i += 8) {
      const p = fita.ponto(i / distancia);
      placa(ctx, aberto ? '#fff1be' : '#5d6465', Math.round(p.coluna) - 1, Math.round(p.linha), aberto ? 3 : 4, aberto ? 2 : 1);
    }
  }
  for (const { aberto, fita } of caminhos) {
    if (aberto) continue;
    const p = fita.ponto(.5);
    pintarCadeadoPraia(ctx, Math.round(p.coluna), Math.round(p.linha));
  }
  let numero = mundo === 'praia-enseadinha' ? 5 : 1;
  for (const p of nosDo(mundo)) {
    const entrada = entradaEm(p, mundo);
    if (!entrada) continue;
    const [x, y] = centro(p);
    const simbolo = entrada.chefe ? 'chefe' : entrada.opcional ? 'desvio'
      : entrada.destino === 'praia' || entrada.destino === 'arquipelago' && mundo !== 'praia-enseadinha' ? 'esquerda' : entrada.destino ? 'direita' : String(numero++);
    placa(ctx, INK, x - 2, y - 2, 5, 5);
    placa(ctx, CLARO, x - 1, y - 1, 3, 3);
    // No ramal norte, a placa lateral não some atrás do Siri no vértice vizinho.
    const lateral = p.linha < 1 || (mundo === 'farol' && p.linha >= 3);
    // A coluna mais à direita não tem margem para uma placa voltada ao litoral.
    const deslocamento = lateral ? (x >= 240 ? -13 : 13) : 0;
    // Nos ramais norte destes mapas, os cadeados ficam na horizontal.
    // Ele não pode ficar por baixo da placa lateral do vértice ao lado.
    const acimaDaTrilha = p.linha <= 0 && (mundo !== 'praia-enseadinha' && mundo !== 'recifes' && mundo !== 'mangue');
    if (lateral) {
      placa(ctx, INK, x + (deslocamento > 0 ? 3 : -10), y, 8, 2);
      if (acimaDaTrilha) placa(ctx, INK, x + (deslocamento > 0 ? 9 : -10), y - 5, 2, 5);
    }
    pintarMarcoDaPraia(ctx, x + deslocamento, y + (acimaDaTrilha ? -15 : lateral ? -8 : 0),
      simbolo, progresso.concluidas.some(id => id === entrada.id), false);
  }
}
