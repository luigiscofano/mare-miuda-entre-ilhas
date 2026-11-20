import { alvoDaGarca, balsasNoTurno, DIRECOES, destinoPermitido, jogadorAtivo, mareAlta, mesmaCasa, portaoDaGrutaAberto } from '../motor/index.ts';
import type { Estado, Fase, Posicao } from '../motor/index.ts';
import { entradaEm, mundoAtual, nosDo, rotaLivre, trilhasDo } from '../campanha/index.ts';
import type { Mundo, Progresso } from '../campanha/index.ts';
import { caminhoDoCabo, marcadorCabo } from '../campanha/cabo-baixo.ts';
import { prepararTravessia } from '../campanha/travessia.ts';

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
  'praia-enseadinha': TONS_PRAIA,
  enseada: TONS_PRAIA,
  deriva: TONS_PRAIA,
  ressaca: TONS_PRAIA,
  grutas: { agua: '#26414e', margem: '#385966', areia: '#e4c394', areiaSombra: '#9d947f',
    roca: '#616174', linha: '#293143', branco: '#fff5dc', cinza: '#d97e62' },
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
  bloco(ctx, tons.margem, x, y, TAMANHO_TILE, TAMANHO_TILE);
  const piso = celula === '~' ? tons.agua : celula === '=' ? (alta ? tons.agua : tons.areiaSombra)
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
  if (celula === 'C') conchaObjetivo(ctx, x, y, tons);
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
  if (celula === 'G') {
    bloco(ctx, tons.linha, x + 4, y + 3, 8, 11);
    bloco(ctx, tons.branco, x + 6, y + 5, 4, 6);
    bloco(ctx, tons.roca, x + 6, y + 7, 4, 2);
  }
}

function cantos(ctx: CanvasRenderingContext2D, x: number, y: number, cor: string, margem: number, traco: number) {
  const fim = TAMANHO_TILE - 1 - margem;
  for (const dy of [margem, fim]) {
    for (const dx of [margem, fim]) {
      bloco(ctx, cor, x + (dx === margem ? dx : dx - traco + 1), y + dy, traco, 1);
      bloco(ctx, cor, x + dx, y + (dy === margem ? dy : dy - traco + 1), 1, traco);
    }
  }
}

function moeda(ctx: CanvasRenderingContext2D, x: number, y: number, tons: Tons) {
  bloco(ctx, tons.linha, x + 6, y + 4, 4, 8);
  bloco(ctx, tons.linha, x + 5, y + 5, 6, 6);
  bloco(ctx, tons.branco, x + 6, y + 5, 4, 6);
  bloco(ctx, tons.areiaSombra, x + 8, y + 6, 1, 4);
}

const CONCHA_OBJETIVO = [
  '...llll...',
  '..lbbbbl..',
  '.lbcbcbbl.',
  'lbcbcbcbbl',
  'lbbcbcbbl.',
  '.lbbcbbl..',
  '..lbbbl...',
  '...lll....',
] as const;

function conchaObjetivo(ctx: CanvasRenderingContext2D, x: number, y: number, tons: Tons) {
  pintarPixels(ctx, CONCHA_OBJETIVO, x + 3, y + 5, paleta(tons));
  // Brilho fixo na grade: a concha não depende de animação ou cor para ser lida.
  bloco(ctx, tons.branco, x + 12, y + 2, 1, 3);
  bloco(ctx, tons.branco, x + 11, y + 3, 3, 1);
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

export function marcaBloqueioAdjacente(
  posicao: Posicao, atual: Posicao, celula: string, alta: boolean, vizinhas: readonly Posicao[],
): boolean {
  const distancia = Math.abs(posicao.coluna - atual.coluna) + Math.abs(posicao.linha - atual.linha);
  return distancia === 1 && (celula === '#' || (celula === '=' && alta) || celula === 'D' || celula === '~' || celula === 'O')
    && !vizinhas.some(v => mesmaCasa(v, posicao));
}

const MARCAS_GRUTA = {
  K: ['.lll.', 'lbbbl', 'lbbbl', 'lbcbl', '.lll.'],
  E: ['.lll.', 'll.ll', 'lllll', 'll.ll', 'll.ll'],
  F: ['llll.', 'll.ll', 'llll.', 'll.ll', 'llll.'],
} as const;

function desenharMecanismoDaGruta(
  ctx: CanvasRenderingContext2D, fase: Fase, estado: Estado, celula: string, x: number, y: number, tons: Tons,
) {
  if (celula === 'O') {
    const aberto = portaoDaGrutaAberto(fase, estado);
    bloco(ctx, tons.linha, x + 2, y + 2, 2, 12);
    bloco(ctx, tons.linha, x + 12, y + 2, 2, 12);
    if (!aberto) for (const altura of [4, 7, 10]) bloco(ctx, tons.linha, x + 4, y + altura, 8, 2);
  }
  if (celula !== 'K' && celula !== 'E' && celula !== 'F') return;
  const indice = fase.etapasGruta?.indexOf(celula) ?? -1;
  if (indice === -1) return;
  const concluida = indice < (estado.etapaGruta ?? 0);
  if (celula === 'K' && concluida) return;
  bloco(ctx, tons.branco, x + 4, y + 4, 7, 7);
  pintarPixels(ctx, MARCAS_GRUTA[celula], x + 5, y + 5, paleta(tons));
  if (concluida) bloco(ctx, tons.linha, x + 5, y + 12, 5, 1);
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
  const atual = jogadorAtivo(estado);
  const vizinhas = estado.situacao === 'jogando'
    ? DIRECOES.map(d => destinoPermitido(fase, estado, d)).filter(v => v !== undefined)
    : [];
  const alvo = alvoDaGarca(fase.ameaca, estado.passos + 1);
  const balsas = balsasNoTurno(fase, estado.passos);
  const placa = [estado.posicao, estado.dupla?.posicao].some(pos => pos && fase.mapa[pos.linha]?.[pos.coluna] === 'P');
  fase.mapa.forEach((fileira, linha) => [...fileira].forEach((celula, coluna) => {
    const x = origemX + coluna * TAMANHO_TILE;
    const y = origemY + linha * TAMANHO_TILE;
    desenharCasa(ctx, celula, alta, x, y, tons, placa);
    const pos = { coluna, linha };
    if (celula === 'B' && !estado.fragmentos.some(coleta => mesmaCasa(pos, coleta))) {
      if (fase.orcamentoMoedas) moeda(ctx, x, y, tons);
      else pintarPixels(ctx, FRAGMENTO, x + 5, y + 5, cores);
    }
    desenharMecanismoDaGruta(ctx, fase, estado, celula, x, y, tons);
    // Só o obstáculo imediatamente relevante ao próximo passo recebe cantos.
    if (estado.situacao === 'jogando' && marcaBloqueioAdjacente(pos, atual, celula, alta, vizinhas)) {
      cantos(ctx, x, y, tons.branco, 2, 3);
    }
    if (vizinhas.some(v => mesmaCasa(v, pos))) cantos(ctx, x, y, tons.linha, 2, 3);
    if (mesmaCasa(atual, pos)) cantos(ctx, x, y, tons.linha, 1, 5);
    if (balsas.some(balsa => mesmaCasa(balsa, pos))) {
      bloco(ctx, tons.linha, x + 2, y + 3, 12, 10);
      bloco(ctx, '#bb965f', x + 3, y + 4, 10, 8);
      for (const h of [5, 8, 11]) bloco(ctx, '#eadab0', x + 4, y + h, 8, 1);
    }
    if (alvo && mesmaCasa(alvo, pos)) marcarAlvo(ctx, x, y, true, tons);
    else if (fase.ameaca && !fase.ameaca.rota?.length && mesmaCasa(fase.ameaca.alvo, pos)) marcarAlvo(ctx, x, y, false, tons);
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

const DIGITOS: Readonly<Record<string, readonly string[]>> = {
  '1': ['.b.', 'bb.', '.b.', '.b.', 'bbb'],
  '2': ['bb.', '..b', '.b.', 'b..', 'bbb'],
  '3': ['bb.', '..b', '.b.', '..b', 'bb.'],
  '4': ['b.b', 'b.b', 'bbb', '..b', '..b'],
  '*': ['..b..', '.bbb.', 'bbbbb', '.bbb.', '.b.b.'],
  '>': ['b..', '.b.', '..b', '.b.', 'b..'],
};
const CABO_X = 32;
const CABO_Y = 24;

export function podeDesenharCabo(mundo: Mundo, arte: HTMLImageElement): boolean {
  return mundo === 'praia' && arte.complete && arte.naturalWidth === 192;
}

export function desenharCabo(
  ctx: CanvasRenderingContext2D, progresso: Progresso, arte: HTMLImageElement, transito?: Posicao,
): void {
  ctx.imageSmoothingEnabled = false;
  bloco(ctx, '#138782', 0, 0, LARGURA, ALTURA);
  ctx.drawImage(arte, CABO_X, CABO_Y, 192, 144);
  for (const ponto of nosDo('praia')) {
    const marco = marcadorCabo(ponto);
    if (!marco?.simbolo) continue;
    const [x, y] = marco.ponto;
    const entrada = entradaEm(ponto);
    const concluida = progresso.concluidas.some(f => f === entrada?.id);
    const cor = concluida ? '#5f805a' : entrada?.opcional ? '#8d6549' : '#486c6b';
    bloco(ctx, '#293b4a', CABO_X + x - 5, CABO_Y + y - 10, 11, 10);
    bloco(ctx, cor, CABO_X + x - 4, CABO_Y + y - 9, 9, 8);
    bloco(ctx, '#293b4a', CABO_X + x - 1, CABO_Y + y, 3, 2);
    const desenho = DIGITOS[marco.simbolo];
    pintarPixels(ctx, desenho, CABO_X + x - Math.floor(desenho[0].length / 2), CABO_Y + y - 7, { b: '#f5dcaa' });
  }
  for (const trecho of trilhasDo('praia')) {
    if (rotaLivre(progresso, trecho)) continue;
    const pontos = caminhoDoCabo(trecho.de, trecho.para);
    if (!pontos) continue;
    const meio = prepararTravessia(pontos).ponto(.5);
    bloco(ctx, '#293b4a', CABO_X + Math.round(meio.coluna) - 2, CABO_Y + Math.round(meio.linha), 5, 3);
  }
  const atual = marcadorCabo(progresso.posicao)?.ponto;
  const x = transito?.coluna ?? atual?.[0];
  const y = transito?.linha ?? atual?.[1];
  // Cursor neutro durante a revisão da arte do siri deste seletor.
  if (x !== undefined && y !== undefined) {
    const cx = CABO_X + Math.round(x), cy = CABO_Y + Math.round(y);
    bloco(ctx, '#623645', cx - 4, cy + 2, 9, 5);
    bloco(ctx, '#fff1bc', cx - 3, cy + 3, 7, 3);
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
