import { DIRECOES, destinoPermitido, jogadorAtivo, mareAlta, mesmaCasa, vaiAtacar } from '../motor/index.ts';
import type { Estado, Fase, Posicao } from '../motor/index.ts';
import { entradaEm, mundoAtual, nosDo, rotaLivre, trilhasDo } from '../campanha/index.ts';
import type { Mundo, Progresso } from '../campanha/index.ts';
import { prepararTravessia } from '../campanha/travessia.ts';

export const LARGURA = 256;
export const ALTURA = 192;
const TAMANHO_TILE = 16;
const TAMANHO_TILE_TRAVESSIA = 40;
export const LARGURA_TRAVESSIA = 280;
export const ALTURA_TRAVESSIA = 240;
const ANCORA_SIRI = { x: 17, y: 15 };

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

function pintarPixels(ctx: CanvasRenderingContext2D, sprite: readonly string[], x: number, y: number, cores: Readonly<Record<string, string>>, escala = 1) {
  sprite.forEach((linha, dy) => [...linha].forEach((pixel, dx) => {
    const cor = cores[pixel];
    if (!cor) return;
    ctx.fillStyle = cor;
    ctx.fillRect(x + dx * escala, y + dy * escala, escala, escala);
  }));
}

function bloco(ctx: CanvasRenderingContext2D, cor: string, x: number, y: number, largura: number, altura: number) {
  ctx.fillStyle = cor;
  ctx.fillRect(x, y, largura, altura);
}

type Pincel = (cor: string, x: number, y: number, largura: number, altura: number) => void;

function desenharCasa(pintar: Pincel, celula: string, alta: boolean, x: number, y: number, tons: Tons, placa = false) {
  pintar(tons.margem, x, y, TAMANHO_TILE, TAMANHO_TILE);
  const piso = celula === '=' ? (alta ? tons.agua : tons.areiaSombra)
    : celula === '#' ? tons.roca : tons.areia;
  pintar(piso, x + 1, y + 1, 14, 14);
  if (celula === '=') {
    const cor = alta ? '#c9cbd0' : '#62646b';
    // Padrões diferentes permitem distinguir a maré sem depender de tonalidade.
    for (let linha = 4; linha <= 12; linha += 4) {
      pintar(cor, x + 3, y + linha, alta ? 10 : 3, 1);
      if (!alta) pintar(cor, x + 9, y + linha, 3, 1);
    }
  }
  if (celula === '#') {
    pintar('#54575e', x + 3, y + 7, 10, 5);
    pintar('#94979f', x + 5, y + 5, 6, 2);
  }
  if (celula === 'H') {
    // Duas faces e o topo claro diferenciam o refúgio transitável da rocha.
    pintar(tons.roca, x + 2, y + 8, 12, 5);
    pintar(tons.linha, x + 3, y + 7, 10, 3);
    pintar(tons.branco, x + 4, y + 4, 8, 4);
    pintar(tons.areiaSombra, x + 6, y + 3, 4, 2);
  }
  if (celula === 'P') {
    pintar(tons.linha, x + 3, y + 3, 10, 10);
    pintar(placa ? '#99b35b' : '#e9ac67', x + 4, y + 4, 8, 8);
    pintar(tons.branco, x + 7, y + 5, 2, 6);
  }
  if (celula === 'D') {
    const abertura = placa ? 2 : 8;
    pintar(tons.linha, x + 7, y + 4, 2, abertura);
    pintar(tons.linha, x + 3, y + 4, 2, 8);
    pintar(tons.linha, x + 11, y + 4, 2, 8);
  }
  if (celula === 'T') {
    pintar(tons.linha, x + 7, y + 4, 2, 9);
    pintar(tons.linha, x + 5, y + 8, 6, 2);
    pintar(tons.branco, x + 7, y + 3, 2, 2);
  }
  if (celula === 'C' || celula === 'G') {
    pintar(tons.linha, x + 4, y + 3, 8, 11);
    pintar(tons.branco, x + 6, y + 5, 4, 6);
    if (celula === 'G') pintar(tons.roca, x + 6, y + 7, 4, 2);
  }
}

function cantos(ctx: CanvasRenderingContext2D, x: number, y: number, cor: string, margem: number, traco: number, tile: number) {
  const fim = tile - 1 - margem;
  for (const dy of [margem, fim]) {
    for (const dx of [margem, fim]) {
      bloco(ctx, cor, x + (dx === margem ? dx : dx - traco + 1), y + dy, traco, 1);
      bloco(ctx, cor, x + dx, y + (dy === margem ? dy : dy - traco + 1), 1, traco);
    }
  }
}

function moeda(pintar: Pincel, x: number, y: number, tons: Tons) {
  pintar(tons.linha, x + 6, y + 4, 4, 8);
  pintar(tons.linha, x + 5, y + 5, 6, 6);
  pintar(tons.branco, x + 6, y + 5, 4, 6);
  pintar(tons.areiaSombra, x + 8, y + 6, 1, 4);
}

function marcarAlvo(pintar: Pincel, x: number, y: number, previsto: boolean, tons: Tons) {
  const cor = previsto ? tons.linha : tons.roca;
  for (let d = 0; d < 4; d++) {
    pintar(cor, x + 2 + d, y + 2, 1, 1);
    pintar(cor, x + 10 + d, y + 2, 1, 1);
    pintar(cor, x + 2 + d, y + 13, 1, 1);
    pintar(cor, x + 10 + d, y + 13, 1, 1);
  }
  if (previsto) {
    for (let d = 0; d < 8; d++) {
      pintar(cor, x + 4 + d, y + 4 + d, 1, 1);
      pintar(cor, x + 11 - d, y + 4 + d, 1, 1);
    }
  }
}

export function desenhar(ctx: CanvasRenderingContext2D, fase: Fase, estado: Estado, tema: Mundo | false = false, siriAprovado?: HTMLImageElement): void {
  const tons: Tons = tema ? CORES_MUNDO[tema] : TONS_CINZA;
  const cores = paleta(tons);
  const tile = tema ? TAMANHO_TILE_TRAVESSIA : TAMANHO_TILE;
  const largura = ctx.canvas?.width ?? LARGURA;
  const altura = ctx.canvas?.height ?? ALTURA;
  const escala = tema ? 2 : 1;
  const margemTile = tema ? 4 : 0;
  ctx.imageSmoothingEnabled = false;
  bloco(ctx, tons.agua, 0, 0, largura, altura);
  // Decoração estática mantém árvores e corais fora da grade navegável.
  for (let y = 10; y < altura; y += 16) {
    for (let x = 10 + y % 12; x < largura - 10; x += 35) bloco(ctx, tons.margem, x, y, 12, 1);
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
  const gradeLargura = fase.mapa[0].length * tile;
  const gradeAltura = fase.mapa.length * tile;
  const origemX = (largura - gradeLargura) / 2;
  const origemY = (altura - gradeAltura) / 2;
  bloco(ctx, tons.margem, origemX - 4, origemY - 4, gradeLargura + 8, gradeAltura + 8);

  const alta = mareAlta(estado.passos);
  const atual = jogadorAtivo(estado);
  const vizinhas = estado.situacao === 'jogando'
    ? DIRECOES.map(d => destinoPermitido(fase, estado, d)).filter(v => v !== undefined)
    : [];
  const placa = [estado.posicao, estado.dupla?.posicao].some(pos => pos && fase.mapa[pos.linha]?.[pos.coluna] === 'P');
  fase.mapa.forEach((fileira, linha) => [...fileira].forEach((celula, coluna) => {
    const x = origemX + coluna * tile;
    const y = origemY + linha * tile;
    // Adereços antigos usam 2× inteiro no miolo, sem esticar o novo sprite.
    const pincel: Pincel = (cor, px, py, w, h) =>
      bloco(ctx, cor, x + margemTile + px * escala, y + margemTile + py * escala, w * escala, h * escala);
    const piso = celula === '=' ? (alta ? tons.agua : tons.areiaSombra) : celula === '#' ? tons.roca : tons.areia;
    if (tema) bloco(ctx, piso, x + 1, y + 1, tile - 2, tile - 2);
    desenharCasa(pincel, celula, alta, 0, 0, tons, placa);
    const pos = { coluna, linha };
    if (celula === 'B' && !estado.fragmentos.some(coleta => mesmaCasa(pos, coleta))) {
      if (fase.orcamentoMoedas) moeda(pincel, 0, 0, tons);
      else pintarPixels(ctx, FRAGMENTO, x + margemTile + 5 * escala, y + margemTile + 5 * escala, cores, escala);
    }
    if (celula === '#' || (celula === 'D' && !placa) || (celula === '=' && alta)) {
      cantos(ctx, x, y, tons.branco, 2, tema ? 5 : 3, tile);
    }
    if (vizinhas.some(v => mesmaCasa(v, pos))) cantos(ctx, x, y, tons.linha, 2, tema ? 5 : 3, tile);
    if (mesmaCasa(atual, pos)) cantos(ctx, x, y, tons.linha, 1, tema ? 8 : 5, tile);
    if (fase.ameaca && mesmaCasa(fase.ameaca.alvo, pos)) {
      marcarAlvo(pincel, 0, 0, vaiAtacar(fase.ameaca, estado.passos + 1), tons);
    }
  }));

  if (estado.dupla) {
    const parceiro = estado.dupla.posicao;
    const x = origemX + parceiro.coluna * tile;
    const y = origemY + parceiro.linha * tile;
    pintarPixels(ctx, PARCEIRO, x + margemTile + 2 * escala, y + margemTile + 3 * escala,
      { l: tons.linha, c: '#a7b969', b: tons.branco }, escala);
    if (estado.dupla.parceiroAtivo) bloco(ctx, tons.branco, x + tile / 2 - 3, y + tile - 3, 6, 1);
  }
  const { coluna, linha } = estado.posicao;
  const x = origemX + coluna * tile;
  const y = origemY + linha * tile;
  if (estado.dupla && !estado.dupla.parceiroAtivo) {
    bloco(ctx, tons.branco, x + tile / 2 - 3, y + tile - 3, 6, 1);
  }
  if (tema && siriAprovado?.complete && siriAprovado.naturalWidth === 35 && siriAprovado.naturalHeight === 27) {
    ctx.drawImage(siriAprovado, x + tile / 2 - ANCORA_SIRI.x, y + tile / 2 - ANCORA_SIRI.y);
  } else {
    pintarPixels(ctx, SIRI, x + margemTile + 2 * escala, y + margemTile + 3 * escala, cores, escala);
  }
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

const centroNo = ({ coluna, linha }: Posicao) => [
  Math.round(MAPA_X + coluna * TAMANHO_TILE + 8),
  Math.round(MAPA_Y + linha * TAMANHO_TILE + 8),
] as const;

// O mesmo caminho dirige o siri e desenha a areia; rasterizamos sem antialiasing.
function riscar(ctx: CanvasRenderingContext2D, cor: string, tamanho: number, pontos: readonly Posicao[]) {
  const raio = Math.floor(tamanho / 2);
  for (let i = 1; i < pontos.length; i++) {
    let [x, y] = centroNo(pontos[i - 1]);
    const [fimX, fimY] = centroNo(pontos[i]);
    const dx = Math.abs(fimX - x), dy = Math.abs(fimY - y);
    const sx = Math.sign(fimX - x), sy = Math.sign(fimY - y);
    let erro = dx - dy;
    for (;;) {
      bloco(ctx, cor, x - raio, y - raio, tamanho, tamanho);
      if (x === fimX && y === fimY) break;
      const passo = 2 * erro;
      if (passo > -dy) { erro -= dy; x += sx; }
      if (passo < dx) { erro += dx; y += sy; }
    }
  }
}

export function desenharPraia(ctx: CanvasRenderingContext2D, progresso: Progresso, transito = progresso.posicao): void {
  const mundo = mundoAtual(progresso);
  const tons = CORES_MUNDO[mundo];
  const trilhas = trilhasDo(mundo);
  ctx.imageSmoothingEnabled = false;
  bloco(ctx, tons.agua, 0, 0, LARGURA, ALTURA);
  for (let y = 13; y < ALTURA - 7; y += 11) {
    for (let x = 9 + y % 13; x < LARGURA - 18; x += 31) {
      bloco(ctx, tons.margem, x, y, 12, 1);
      if ((x + y) % 3 === 0) bloco(ctx, '#6fa393', x + 7, y - 1, 4, 1);
    }
  }
  const caminhos = trilhas.map(t => [t.de, ...t.curvas, t.para]);
  for (const [cor, tamanho] of [[tons.margem, 13], ['#f3e4bb', 11], [tons.areia, 7]] as const) {
    for (const pontos of caminhos) riscar(ctx, cor, tamanho, pontos);
  }
  for (const posicao of nosDo(mundo)) {
    const [x, y] = centroNo(posicao);
    const entrada = entradaEm(posicao, mundo);
    bloco(ctx, tons.linha, x - 5, y - 5, 10, 10);
    const concluida = progresso.concluidas.some(id => id === entrada?.id);
    bloco(ctx, concluida ? '#5e8664' : entrada?.opcional ? '#bc715d' : '#bd9665', x - 4, y - 4, 8, 8);
    if (concluida) {
      bloco(ctx, tons.branco, x - 3, y, 3, 2);
      bloco(ctx, tons.branco, x - 1, y - 2, 3, 2);
    } else if (entrada) {
      bloco(ctx, tons.branco, x - 1, y - 3, 2, 6);
      bloco(ctx, tons.branco, x - 3, y - 1, 6, 2);
    } else {
      bloco(ctx, tons.branco, x - 1, y - 1, 2, 2);
    }
  }
  // Segredo de cenário: não cria nó, caminho ou objetivo.
  if (mundo === 'praia') desenharBemTeVi(ctx);
  trilhas.forEach((t, i) => {
    if (rotaLivre(progresso, t)) return;
    const [x, y] = centroNo(prepararTravessia(caminhos[i]).ponto(0.5));
    bloco(ctx, tons.linha, x - 4, y - 4, 8, 8);
    bloco(ctx, '#be745c', x - 3, y - 3, 6, 6);
    bloco(ctx, tons.branco, x - 2, y, 4, 1);
  });
  const [x, y] = centroNo(transito);
  pintarPixels(ctx, SIRI, x - 6, y - 5, paleta(tons));
}
