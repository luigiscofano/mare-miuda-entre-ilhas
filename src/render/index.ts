import { mareAlta, mesmaCasa, vaiAtacar } from '../motor/index.ts';
import type { Estado, Fase } from '../motor/index.ts';

export const LARGURA = 256;
export const ALTURA = 192;
const TAMANHO_TILE = 16;

const TONS = {
  agua: '#32343a', margem: '#484b52', areia: '#d1d2d4', areiaSombra: '#a8aaae',
  roca: '#6b6f77', linha: '#222327', branco: '#fafafa', cinza: '#e9eaed',
} as const;

// Cada caractere é uma célula quadrada: sem opacidade parcial ou suavização.
const SIRI = [
  '............',
  '.l........l.',
  '.bl......lb.',
  '..l.l..l.l..',
  '...lcllcl...',
  '..lcccccc.l.',
  '.lccccccccl.',
  '..lcccccl...',
  '.l.lccc.l.l.',
  '.l..lll..l..',
  '............',
];
const FRAGMENTO = ['..l..', '.lcl.', 'lcbcl', '.lcl.', '..l..'];
const PALETA: Readonly<Record<string, string>> = { l: TONS.linha, c: TONS.cinza, b: TONS.branco };

function pintarPixels(ctx: CanvasRenderingContext2D, sprite: readonly string[], x: number, y: number) {
  sprite.forEach((linha, dy) => [...linha].forEach((pixel, dx) => {
    const cor = PALETA[pixel];
    if (!cor) return;
    ctx.fillStyle = cor;
    ctx.fillRect(x + dx, y + dy, 1, 1);
  }));
}

function bloco(ctx: CanvasRenderingContext2D, cor: string, x: number, y: number, largura: number, altura: number) {
  ctx.fillStyle = cor;
  ctx.fillRect(x, y, largura, altura);
}

function desenharCasa(ctx: CanvasRenderingContext2D, celula: string, alta: boolean, x: number, y: number) {
  bloco(ctx, TONS.linha, x, y, TAMANHO_TILE, TAMANHO_TILE);
  const piso = celula === '=' ? (alta ? TONS.agua : TONS.areiaSombra)
    : celula === '#' ? TONS.roca : TONS.areia;
  bloco(ctx, piso, x + 1, y + 1, 14, 14);
  if (celula === '=') {
    const cor = alta ? '#c9cbd0' : '#62646b';
    // Padrões diferentes permitem distinguir a maré sem depender de tonalidade.
    for (let linha = 4; linha <= 12; linha += 4) {
      bloco(ctx, cor, x + 3, y + linha, alta ? 10 : 3, 1);
      if (!alta) bloco(ctx, cor, x + 9, y + linha, 3, 1);
    }
  }
  if (celula === '#') {
    bloco(ctx, '#54575e', x + 3, y + 7, 10, 5);
    bloco(ctx, '#94979f', x + 5, y + 5, 6, 2);
  }
  if (celula === 'C' || celula === 'G') {
    bloco(ctx, TONS.linha, x + 4, y + 3, 8, 11);
    bloco(ctx, TONS.branco, x + 6, y + 5, 4, 6);
    if (celula === 'G') bloco(ctx, TONS.roca, x + 6, y + 7, 4, 2);
  }
}

function marcarAlvo(ctx: CanvasRenderingContext2D, x: number, y: number, previsto: boolean) {
  const cor = previsto ? TONS.linha : TONS.roca;
  for (let d = 0; d < 4; d++) {
    bloco(ctx, cor, x + 2 + d, y + 2, 1, 1);
    bloco(ctx, cor, x + 10 + d, y + 2, 1, 1);
    bloco(ctx, cor, x + 2 + d, y + 13, 1, 1);
    bloco(ctx, cor, x + 10 + d, y + 13, 1, 1);
  }
  if (previsto) {
    for (let d = 0; d < 8; d++) {
      bloco(ctx, cor, x + 4 + d, y + 4 + d, 1, 1);
      bloco(ctx, cor, x + 11 - d, y + 4 + d, 1, 1);
    }
  }
}

export function desenhar(ctx: CanvasRenderingContext2D, fase: Fase, estado: Estado): void {
  ctx.imageSmoothingEnabled = false;
  bloco(ctx, TONS.agua, 0, 0, LARGURA, ALTURA);
  // Decoração provisória deliberadamente estática: não mascara as casas jogáveis.
  for (let y = 10; y < ALTURA; y += 16) {
    for (let x = 10 + y % 12; x < LARGURA - 10; x += 35) bloco(ctx, TONS.margem, x, y, 12, 1);
  }
  const gradeLargura = fase.mapa[0].length * TAMANHO_TILE;
  const gradeAltura = fase.mapa.length * TAMANHO_TILE;
  const origemX = (LARGURA - gradeLargura) / 2;
  const origemY = (ALTURA - gradeAltura) / 2;
  bloco(ctx, TONS.margem, origemX - 4, origemY - 4, gradeLargura + 8, gradeAltura + 8);

  const alta = mareAlta(estado.passos);
  fase.mapa.forEach((fileira, linha) => [...fileira].forEach((celula, coluna) => {
    const x = origemX + coluna * TAMANHO_TILE;
    const y = origemY + linha * TAMANHO_TILE;
    desenharCasa(ctx, celula, alta, x, y);
    if (celula === 'B' && !estado.temFragmento) pintarPixels(ctx, FRAGMENTO, x + 5, y + 5);
    if (fase.ameaca && mesmaCasa(fase.ameaca.alvo, { coluna, linha })) {
      marcarAlvo(ctx, x, y, vaiAtacar(fase.ameaca, estado.passos + 1));
    }
  }));

  const { coluna, linha } = estado.posicao;
  pintarPixels(ctx, SIRI, origemX + coluna * TAMANHO_TILE + 2, origemY + linha * TAMANHO_TILE + 3);
}
