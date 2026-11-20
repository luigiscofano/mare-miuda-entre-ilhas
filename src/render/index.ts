import { mareAlta, mesmaCasa, vaiAtacar } from '../motor/index.ts';
import type { Estado, Fase } from '../motor/index.ts';
import { entradaEm, mapaDo, mundoAtual, portoes } from '../campanha/index.ts';
import type { Mundo, Progresso } from '../campanha/index.ts';

export const LARGURA = 256;
export const ALTURA = 192;
const TAMANHO_TILE = 16;

const TONS_CINZA = {
  agua: '#32343a', margem: '#484b52', areia: '#d1d2d4', areiaSombra: '#a8aaae',
  roca: '#6b6f77', linha: '#222327', branco: '#fafafa', cinza: '#e9eaed',
} as const;
type Tons = Readonly<Record<keyof typeof TONS_CINZA, string>>;
const TONS_PRAIA: Tons = {
  agua: '#24585e', margem: '#32747a', areia: '#f4d398', areiaSombra: '#83aa89',
  roca: '#576766', linha: '#243c41', branco: '#fff1d2', cinza: '#df7756',
};
const CORES_MUNDO: Readonly<Record<Mundo, Tons>> = {
  praia: TONS_PRAIA,
  arquipelago: { agua: '#3a7280', margem: '#549296', areia: '#efdba3', areiaSombra: '#acbb7c',
    roca: '#68796b', linha: '#27434c', branco: '#fff6d9', cinza: '#d77050' },
  recifes: { agua: '#205468', margem: '#38828c', areia: '#e9d49f', areiaSombra: '#7bad9f',
    roca: '#536978', linha: '#243746', branco: '#fff7d9', cinza: '#e37f56' },
  mangue: { agua: '#374c3f', margem: '#627550', areia: '#d9b879', areiaSombra: '#919768',
    roca: '#60654a', linha: '#333d34', branco: '#fff0c3', cinza: '#e1875b' },
};
const PARCEIRO = [
  '...ll..ll...',
  '...bl..lb...',
  '..llcllcll..',
  'lllcccccc.ll',
  'l.cccccccc.l',
  '..lcccccc.l.',
  '.l.lcllcl.l.',
  '..l.llll.l..',
  '....l..l....',
] as const;



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
const paleta = (tons: Tons) => ({ l: tons.linha, c: tons.cinza, b: tons.branco }) as Readonly<Record<string, string>>;

function pintarPixels(ctx: CanvasRenderingContext2D, sprite: readonly string[], x: number, y: number, cores: Readonly<Record<string, string>>) {
  sprite.forEach((linha, dy) => [...linha].forEach((pixel, dx) => {
    const cor = cores[pixel];
    if (!cor) return;
    ctx.fillStyle = cor;
    ctx.fillRect(x + dx, y + dy, 1, 1);
  }));
}

function bloco(ctx: CanvasRenderingContext2D, cor: string, x: number, y: number, largura: number, altura: number) {
  ctx.fillStyle = cor;
  ctx.fillRect(x, y, largura, altura);
}

function desenharCasa(ctx: CanvasRenderingContext2D, celula: string, alta: boolean, x: number, y: number, tons: Tons, placa = false) {
  bloco(ctx, tons.linha, x, y, TAMANHO_TILE, TAMANHO_TILE);
  const piso = celula === '=' ? (alta ? tons.agua : tons.areiaSombra)
    : celula === '#' ? tons.roca : tons.areia;
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
  if (celula === 'H') {
    // Duas faces e o topo claro diferenciam o refúgio transitável da rocha.
    bloco(ctx, tons.roca, x + 2, y + 8, 12, 5);
    bloco(ctx, tons.linha, x + 3, y + 7, 10, 3);
    bloco(ctx, tons.branco, x + 4, y + 4, 8, 4);
    bloco(ctx, tons.areiaSombra, x + 6, y + 3, 4, 2);
  }
  if (celula === 'P') {
    bloco(ctx, tons.linha, x + 3, y + 3, 10, 10);
    bloco(ctx, placa ? '#99b35b' : '#e9ac67', x + 4, y + 4, 8, 8);
    bloco(ctx, tons.branco, x + 7, y + 5, 2, 6);
  }
  if (celula === 'D') {
    const abertura = placa ? 2 : 8;
    bloco(ctx, tons.linha, x + 7, y + 4, 2, abertura);
    bloco(ctx, tons.linha, x + 3, y + 4, 2, 8);
    bloco(ctx, tons.linha, x + 11, y + 4, 2, 8);
  }
  if (celula === 'T') {
    bloco(ctx, tons.linha, x + 7, y + 4, 2, 9);
    bloco(ctx, tons.linha, x + 5, y + 8, 6, 2);
    bloco(ctx, tons.branco, x + 7, y + 3, 2, 2);
  }
  if (celula === 'C' || celula === 'G') {
    bloco(ctx, tons.linha, x + 4, y + 3, 8, 11);
    bloco(ctx, tons.branco, x + 6, y + 5, 4, 6);
    if (celula === 'G') bloco(ctx, tons.roca, x + 6, y + 7, 4, 2);
  }
}

function marcarAlvo(ctx: CanvasRenderingContext2D, x: number, y: number, previsto: boolean, tons: Tons) {
  const cor = previsto ? tons.linha : tons.roca;
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

export function desenhar(ctx: CanvasRenderingContext2D, fase: Fase, estado: Estado, tema: Mundo | false = false): void {
  const tons: Tons = tema ? CORES_MUNDO[tema] : TONS_CINZA;
  const cores = paleta(tons);
  ctx.imageSmoothingEnabled = false;
  bloco(ctx, tons.agua, 0, 0, LARGURA, ALTURA);
  // Decoração estática mantém árvores e corais fora da grade navegável.
  for (let y = 10; y < ALTURA; y += 16) {
    for (let x = 10 + y % 12; x < LARGURA - 10; x += 35) bloco(ctx, tons.margem, x, y, 12, 1);
  }
  if (tema === 'recifes' || tema === 'mangue') {
    for (const [x, y] of [[26, 36], [207, 30], [34, 149], [218, 145], [66, 163]]) {
      if (tema === 'recifes') {
        bloco(ctx, '#6ba0a0', x, y + 8, 16, 3);
        bloco(ctx, '#da967c', x + 7, y + 3, 3, 7);
        bloco(ctx, '#da967c', x + 4, y + 3, 6, 2);
        bloco(ctx, '#e4b097', x + 7, y, 2, 4);
      } else {
        bloco(ctx, '#a88759', x + 7, y + 4, 3, 11);
        bloco(ctx, '#a88759', x + 3, y + 13, 10, 2);
        bloco(ctx, '#65794c', x + 2, y, 14, 6);
        bloco(ctx, '#839758', x + 5, y - 3, 8, 4);
      }
    }
  }
  const gradeLargura = fase.mapa[0].length * TAMANHO_TILE;
  const gradeAltura = fase.mapa.length * TAMANHO_TILE;
  const origemX = (LARGURA - gradeLargura) / 2;
  const origemY = (ALTURA - gradeAltura) / 2;
  bloco(ctx, tons.margem, origemX - 4, origemY - 4, gradeLargura + 8, gradeAltura + 8);

  const alta = mareAlta(estado.passos);
  const placa = [estado.posicao, estado.dupla?.posicao].some(pos => pos && fase.mapa[pos.linha]?.[pos.coluna] === 'P');
  fase.mapa.forEach((fileira, linha) => [...fileira].forEach((celula, coluna) => {
    const x = origemX + coluna * TAMANHO_TILE;
    const y = origemY + linha * TAMANHO_TILE;
    desenharCasa(ctx, celula, alta, x, y, tons, placa);
    if (celula === 'B' && !estado.fragmentos.some(pos => mesmaCasa({ coluna, linha }, pos))) pintarPixels(ctx, FRAGMENTO, x + 5, y + 5, cores);
    if (fase.ameaca && mesmaCasa(fase.ameaca.alvo, { coluna, linha })) {
      marcarAlvo(ctx, x, y, vaiAtacar(fase.ameaca, estado.passos + 1), tons);
    }
  }));

  if (estado.dupla) {
    const parceiro = estado.dupla.posicao;
    const x = origemX + parceiro.coluna * TAMANHO_TILE;
    const y = origemY + parceiro.linha * TAMANHO_TILE;
    pintarPixels(ctx, PARCEIRO, x + 2, y + 3, { l: tons.linha, c: '#a7b969', b: tons.branco });
    if (estado.dupla.parceiroAtivo) bloco(ctx, tons.branco, x + 6, y + 14, 4, 1);
  }
  const { coluna, linha } = estado.posicao;
  if (estado.dupla && !estado.dupla.parceiroAtivo) {
    bloco(ctx, tons.branco, origemX + coluna * TAMANHO_TILE + 6, origemY + linha * TAMANHO_TILE + 14, 4, 1);
  }
  pintarPixels(ctx, SIRI, origemX + coluna * TAMANHO_TILE + 2, origemY + linha * TAMANHO_TILE + 3, cores);
}

const MAPA_X = 56;
const MAPA_Y = 52;
const BEM_TE_VI = [
  '......lll..',
  '.....lwwll.',
  '....llwlld.',
  '..llllyyl..',
  '.lllllyyyl.',
  'lllllyyyyl.',
  '..lllllll..',
  '....l.l....',
] as const;
const CORES_BEM_TE_VI = {
  l: '#3e4235', w: '#fff0c7', y: '#dfb050', d: '#534324',
};

function desenharBemTeVi(ctx: CanvasRenderingContext2D) {
  const x = MAPA_X + 30;
  const y = MAPA_Y + 48;
  bloco(ctx, '#71897b', x - 3, y + 10, 19, 5);
  bloco(ctx, '#b1b49a', x, y + 8, 12, 5);
  bloco(ctx, '#c6c6a5', x + 2, y + 8, 7, 2);
  pintarPixels(ctx, BEM_TE_VI, x, y, CORES_BEM_TE_VI);
}

export function desenharPraia(ctx: CanvasRenderingContext2D, progresso: Progresso): void {
  const mundo = mundoAtual(progresso);
  const tons = CORES_MUNDO[mundo];
  const mapa = mapaDo(mundo);
  ctx.imageSmoothingEnabled = false;
  bloco(ctx, tons.agua, 0, 0, LARGURA, ALTURA);
  // Faixas curtas e sólidas criam textura sem borrar o contorno das rotas.
  for (let y = 13; y < ALTURA - 7; y += 11) {
    for (let x = 9 + y % 13; x < LARGURA - 18; x += 31) {
      bloco(ctx, tons.margem, x, y, 12, 1);
      if ((x + y) % 3 === 0) bloco(ctx, '#6fa393', x + 7, y - 1, 4, 1);
    }
  }
  mapa.forEach((fileira, linha) => [...fileira].forEach((celula, coluna) => {
    if (celula === '#') return;
    const x = MAPA_X + coluna * TAMANHO_TILE;
    const y = MAPA_Y + linha * TAMANHO_TILE;
    const coresDeAreia = linha > 2 ? '#d8bb89' : tons.areia;
    bloco(ctx, tons.margem, x - 4, y - 4, TAMANHO_TILE + 8, TAMANHO_TILE + 8);
    bloco(ctx, '#f3e4bb', x - 2, y - 2, TAMANHO_TILE + 4, TAMANHO_TILE + 4);
    bloco(ctx, coresDeAreia, x, y, TAMANHO_TILE, TAMANHO_TILE);
  }));

  mapa.forEach((fileira, linha) => [...fileira].forEach((celula, coluna) => {
    if (celula === '#') return;
    const x = MAPA_X + coluna * TAMANHO_TILE;
    const y = MAPA_Y + linha * TAMANHO_TILE;
    const entrada = entradaEm({ coluna, linha }, mundo);
    if (entrada) {
      const concluida = progresso.concluidas.some(id => id === entrada.id);
      bloco(ctx, tons.linha, x + 3, y + 3, 10, 10);
      bloco(ctx, concluida ? '#5e8664' : entrada.opcional ? '#bc715d' : '#bd9665', x + 4, y + 4, 8, 8);
      if (concluida) {
        bloco(ctx, tons.branco, x + 5, y + 8, 3, 2);
        bloco(ctx, tons.branco, x + 7, y + 6, 3, 2);
      } else {
        bloco(ctx, tons.branco, x + 7, y + 5, 2, 6);
        bloco(ctx, tons.branco, x + 5, y + 7, 6, 2);
      }
    } else {
      bloco(ctx, '#c9a97b', x + 5, y + 7, 6, 2);
    }
  }));

  // Segredo de cenário, sem presença na grade de navegação ou no motor.
  if (mundo === 'praia') desenharBemTeVi(ctx);
  for (const portao of portoes(progresso)) {
    const x = MAPA_X + (portao.de.coluna + portao.para.coluna) * TAMANHO_TILE / 2 + 8;
    const y = MAPA_Y + (portao.de.linha + portao.para.linha) * TAMANHO_TILE / 2 + 8;
    const vertical = portao.de.linha === portao.para.linha;
    bloco(ctx, tons.linha, x - (vertical ? 1 : 5), y - (vertical ? 5 : 1), vertical ? 2 : 10, vertical ? 10 : 2);
    bloco(ctx, '#be745c', x - (vertical ? 2 : 4), y - (vertical ? 4 : 2), vertical ? 4 : 8, vertical ? 8 : 4);
  }
  const { coluna, linha } = progresso.posicao;
  pintarPixels(ctx, SIRI, MAPA_X + coluna * TAMANHO_TILE + 2, MAPA_Y + linha * TAMANHO_TILE + 3, paleta(tons));
}
