import { balsasNoTurno, casasDoRasante, DIRECOES, destinoPermitido, faixaAfeta, faixaRessacaNoTurno, feixeNoTurno, jogadorAtivo, janelaGrutaAtiva, mareAlta, mesmaCasa, passagemDoRecifeFechada, passosAteTrocaFeixe, passosAteVirada, portaoDaGrutaAberto, portaoLiberado, posicoesDosSiris, siriAtivo } from '../motor/index.ts';
import type { Estado, Fase, Posicao } from '../motor/index.ts';
import { entradaEm, mundoAtual, nosDo, rotaLivre, trilhasDo } from '../campanha/index.ts';
import type { Mundo, Progresso } from '../campanha/index.ts';
import { caminhoDoCabo, marcadorCabo } from '../campanha/cabo-baixo.ts';
import { prepararTravessia } from '../campanha/travessia.ts';
import { pintarTravessiaPraia, usaTravessiaPraia } from './travessia-praia.ts';

export const LARGURA = 256;
export const ALTURA = 192;
export const DENSIDADE = 2;
const RECORTE_SIRI = { x: 75, y: 3, largura: 31, altura: 23 } as const;
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
  farol: TONS_PRAIA,
  grutas: { agua: '#26414e', margem: '#385966', areia: '#e4c394', areiaSombra: '#9d947f',
    roca: '#616174', linha: '#293143', branco: '#fff5dc', cinza: '#d97e62' },
  arquipelago: { agua: '#3a7280', margem: '#549296', areia: '#efdba3', areiaSombra: '#acbb7c',
    roca: '#68796b', linha: '#27434c', branco: '#fff6d9', cinza: '#d77050' },
  recifes: { agua: '#205468', margem: '#38828c', areia: '#e9d49f', areiaSombra: '#7bad9f',
    roca: '#536978', linha: '#243746', branco: '#fff7d9', cinza: '#e37f56' },
  mangue: { agua: '#374c3f', margem: '#627550', areia: '#d9b879', areiaSombra: '#919768',
    roca: '#60654a', linha: '#333d34', branco: '#fff0c3', cinza: '#e1875b' },
};
const INSIGNIAS = [
  ['.x.', 'x.x', '.x.'],
  ['xxx', 'x.x', 'xxx'],
  ['.x.', 'x.x', 'xxx'],
] as const;
// A placa da abertura é a única fonte do protagonista. O recorte usa pixels
// nativos, enquanto o terreno permanece na grade lógica de 16 pixels por casa.
function desenharSiri(ctx: CanvasRenderingContext2D, logo: HTMLImageElement, centroX: number, baseY: number) {
  if (!logo.complete || logo.naturalWidth !== 180 || logo.naturalHeight !== 94) return;
  const { x, y, largura, altura } = RECORTE_SIRI;
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(logo, x, y, largura, altura,
    Math.round(centroX * DENSIDADE - largura / 2), Math.round(baseY * DENSIDADE) - altura, largura, altura);
  ctx.restore();
}

function desenharSiriDaEquipe(
  ctx: CanvasRenderingContext2D, folha: HTMLImageElement | undefined, indice: number, centroX: number, baseY: number,
) {
  const { largura, altura } = RECORTE_SIRI;
  if (!folha?.complete || folha.naturalWidth !== largura * 5 || folha.naturalHeight !== altura) return;
  // A folha usa a mesma resolução nativa do recorte original, sem escala.
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(folha, indice * largura, 0, largura, altura,
    Math.round(centroX * DENSIDADE - largura / 2), Math.round(baseY * DENSIDADE) - altura, largura, altura);
  ctx.restore();
}

function desenharInsignia(ctx: CanvasRenderingContext2D, indice: number, centroX: number, topoY: number, tons: Tons) {
  // A identificação fica acima da silhueta, fora dos pixels da arte aprovada.
  const x = Math.round(centroX * DENSIDADE) - 3;
  const y = Math.round(topoY * DENSIDADE);
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  bloco(ctx, tons.linha, x, y, 7, 5);
  pintarPixels(ctx, INSIGNIAS[indice], x + 2, y + 1, { x: tons.branco });
  ctx.restore();
}

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

function desenharPisoLegado(ctx: CanvasRenderingContext2D, celula: string, alta: boolean, x: number, y: number, tons: Tons) {
  bloco(ctx, tons.margem, x, y, TAMANHO_TILE, TAMANHO_TILE);
  const piso = celula === '~' || celula === 'I' ? tons.agua : celula === '=' ? (alta ? tons.agua : tons.areiaSombra)
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
}

function desenharMecanismosBase(ctx: CanvasRenderingContext2D, celula: string, x: number, y: number, tons: Tons, placa: boolean) {
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
  if (celula === 'Y') {
    bloco(ctx, tons.linha, x + 5, y + 3, 6, 10);
    bloco(ctx, '#edb735', x + 6, y + 4, 4, 3);
    bloco(ctx, tons.branco, x + 6, y + 9, 4, 3);
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

// O losango identifica o refúgio marcado. Comportas fechadas ganham grades;
// abertas conservam a textura do baixio e exibem só as laterais.
function desenharSinalDoRecife(ctx: CanvasRenderingContext2D, x: number, y: number, tons: Tons,
  sinal: 'refugio' | 'refugio-visitado' | 'comporta-fechada' | 'comporta-aberta',
): void {
  if (sinal === 'refugio' || sinal === 'refugio-visitado') {
    bloco(ctx, tons.linha, x + 5, y + 2, 6, 4);
    bloco(ctx, tons.branco, x + 7, y + 1, 2, 1);
    bloco(ctx, tons.branco, x + 6, y + 2, 4, 1);
    bloco(ctx, tons.branco, x + 5, y + 3, 1, 1);
    bloco(ctx, tons.branco, x + 10, y + 3, 1, 1);
    bloco(ctx, tons.branco, x + 6, y + 4, 4, 1);
    bloco(ctx, tons.branco, x + 7, y + 5, 2, 1);
    if (sinal === 'refugio-visitado') bloco(ctx, tons.branco, x + 6, y + 3, 4, 1);
    return;
  }
  for (const dx of [2, 12]) bloco(ctx, tons.linha, x + dx, y + 5, 2, 6);
  if (sinal === 'comporta-fechada') {
    for (const dy of [5, 9]) bloco(ctx, tons.linha, x + 4, y + dy, 8, 2);
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
  const condicao = fase.condicoesGruta?.find(item => item.etapa === celula);
  if (!concluida && condicao) {
    // A seta indica a direção da maré; o ponto marca a descida exata.
    const cor = janelaGrutaAtiva(condicao.janela, estado.passos + 1) ? tons.branco : tons.linha;
    const alta = condicao.janela === 'alta';
    bloco(ctx, cor, x + 11, y + (alta ? 6 : 8), 3, 1);
    bloco(ctx, cor, x + 12, y + 6, 1, 3);
    if (condicao.janela === 'descida') bloco(ctx, cor, x + 14, y + 5, 1, 1);
  }
  if (concluida) bloco(ctx, tons.linha, x + 5, y + 12, 5, 1);
}

// Espuma no topo da célula, distinta dos cantos de movimento e da mira da garça.
function desenharAvisoRessaca(ctx: CanvasRenderingContext2D, x: number, y: number, tons: Tons, imediata: boolean) {
  bloco(ctx, tons.linha, x + 1, y + 1, 14, 5);
  for (const i of [2, 7, 12]) {
    bloco(ctx, tons.branco, x + i, y + 4, 3, 1);
    if (imediata) bloco(ctx, tons.branco, x + i + 1, y + 3, 2, 1);
  }
}

function desenharAncoradouro(ctx: CanvasRenderingContext2D, x: number, y: number, tons: Tons, firme: boolean) {
  bloco(ctx, tons.linha, x + 4, y + 6, 8, 8);
  bloco(ctx, firme ? '#799958' : '#936949', x + 5, y + 7, 6, 6);
  if (firme) {
    bloco(ctx, tons.branco, x + 6, y + 10, 2, 2);
    bloco(ctx, tons.branco, x + 8, y + 8, 2, 3);
  } else {
    bloco(ctx, tons.branco, x + 7, y + 7, 2, 5);
    bloco(ctx, tons.branco, x + 5, y + 11, 6, 1);
  }
}

function desenharFeixe(
  ctx: CanvasRenderingContext2D, celula: string, pos: Posicao, x: number, y: number, tons: Tons,
  feixe: ReturnType<typeof feixeNoTurno>, seguinte: ReturnType<typeof feixeNoTurno>, estado: Estado,
): void {
  if (celula === 'I') {
    const iluminada = feixe?.plataformas.some(p => mesmaCasa(p, pos));
    const permanece = seguinte?.plataformas.some(p => mesmaCasa(p, pos));
    // Barras sólidas são piso; pontos nunca indicam uma entrada permitida.
    if (iluminada) {
      bloco(ctx, tons.linha, x + 1, y + 5, 14, 6);
      bloco(ctx, tons.branco, x + 2, y + 6, 12, 4);
      for (const coluna of [4, 8, 12]) bloco(ctx, tons.roca, x + coluna, y + 6, 1, 4);
      if (!permanece) cantos(ctx, x, y, '#f3ab5b', 2, 3);
    } else {
      for (const coluna of [4, 7, 10]) bloco(ctx, permanece ? tons.branco : tons.margem, x + coluna, y + 8, 1, 1);
    }
  } else if (celula === 'P' && feixe?.placa && mesmaCasa(feixe.placa, pos)) {
    bloco(ctx, tons.linha, x + 2, y + 3, 12, 1);
    bloco(ctx, tons.branco, x + 2, y + 2, 4, 1);
    bloco(ctx, tons.branco, x + 7, y + 2, 4, 1);
  } else if (celula === 'L') {
    bloco(ctx, tons.linha, x + 4, y + 4, 8, 8);
    if (estado.lentesAcesas?.some(p => mesmaCasa(p, pos))) {
      bloco(ctx, tons.branco, x + 6, y + 6, 4, 4);
    } else if (feixe && mesmaCasa(feixe.lente, pos)) {
      bloco(ctx, tons.branco, x + 7, y + 5, 2, 6);
      bloco(ctx, tons.branco, x + 5, y + 7, 6, 2);
    } else {
      bloco(ctx, tons.branco, x + 7, y + 7, 2, 2);
    }
  }
}

function desenharFundoDaTravessia(ctx: CanvasRenderingContext2D, tema: Mundo | false, tons: Tons) {
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
}

export function desenhar(ctx: CanvasRenderingContext2D, fase: Fase, estado: Estado, logo: HTMLImageElement, tema: Mundo | false = false, fauna?: HTMLImageElement): void {
  const tons: Tons = tema ? CORES_MUNDO[tema] : TONS_CINZA;
  const cores = paleta(tons);
  ctx.imageSmoothingEnabled = false;
  const praia = usaTravessiaPraia(tema);
  if (!praia) desenharFundoDaTravessia(ctx, tema, tons);

  const gradeLargura = fase.mapa[0].length * TAMANHO_TILE;
  const gradeAltura = fase.mapa.length * TAMANHO_TILE;
  const origemX = (LARGURA - gradeLargura) / 2;
  const origemY = (ALTURA - gradeAltura) / 2;
  const alta = mareAlta(estado.passos);
  if (praia) {
    pintarTravessiaPraia({ contexto: ctx, origemX: origemX * DENSIDADE, origemY: origemY * DENSIDADE },
      fase.mapa, alta, LARGURA * DENSIDADE, ALTURA * DENSIDADE);
  } else {
    bloco(ctx, tons.margem, origemX - 4, origemY - 4, gradeLargura + 8, gradeAltura + 8);
  }

  const atual = jogadorAtivo(estado);
  const vizinhas = estado.situacao === 'jogando'
    ? DIRECOES.map(d => destinoPermitido(fase, estado, d)).filter(v => v !== undefined)
    : [];
  const rasante = casasDoRasante(fase, estado.passos + 1);
  const faltam = passosAteVirada(estado.passos);
  const faixa = !alta && estado.situacao === 'jogando' ? faixaRessacaNoTurno(fase, estado.passos + faltam) : undefined;
  const balsas = balsasNoTurno(fase, estado.passos);
  const feixe = feixeNoTurno(fase, estado.passos);
  const pertoDaTroca = passosAteTrocaFeixe(fase, estado.passos);
  const seguinte = pertoDaTroca === 1 ? feixeNoTurno(fase, estado.passos + 1) : feixe;
  const siris = posicoesDosSiris(estado);
  const recife = fase.recife;
  fase.mapa.forEach((fileira, linha) => [...fileira].forEach((celula, coluna) => {
    const x = origemX + coluna * TAMANHO_TILE;
    const y = origemY + linha * TAMANHO_TILE;
    const pos = { coluna, linha };
    const placaOcupada = celula === 'P' ? siris.some(siri => mesmaCasa(siri, pos))
      : celula === 'D' && portaoLiberado(fase, pos, siris);
    const comportaFechada = passagemDoRecifeFechada(fase, pos, estado.temFragmento);
    const piso = comportaFechada ? '~' : celula;
    if (!praia) desenharPisoLegado(ctx, piso, alta, x, y, tons);
    desenharMecanismosBase(ctx, piso, x, y, tons, placaOcupada);
    if (celula === 'P' || celula === 'D') {
      const indice = fase.portoesVinculados?.findIndex(item => mesmaCasa(item.placa, pos) || mesmaCasa(item.portao, pos)) ?? -1;
      const numero = DIGITOS[String(indice + 1)];
      if (indice >= 0 && numero) {
        bloco(ctx, tons.linha, x + 10, y + 1, 5, 7);
        pintarPixels(ctx, numero, x + 11, y + 2, { b: tons.branco });
      }
    }
    if (recife && 'abrigos' in recife && recife.abrigos.some(abrigo => mesmaCasa(abrigo, pos))) {
      const visitado = estado.abrigosVisitados?.some(abrigo => mesmaCasa(abrigo, pos));
      desenharSinalDoRecife(ctx, x, y, tons, visitado ? 'refugio-visitado' : 'refugio');
    }
    if (recife && 'ida' in recife && (mesmaCasa(recife.ida, pos) || mesmaCasa(recife.volta, pos))) {
      desenharSinalDoRecife(ctx, x, y, tons, comportaFechada ? 'comporta-fechada' : 'comporta-aberta');
    }
    if (celula === 'B' && !estado.fragmentos.some(coleta => mesmaCasa(pos, coleta))) {
      if (fase.orcamentoMoedas) moeda(ctx, x, y, tons);
      else pintarPixels(ctx, FRAGMENTO, x + 5, y + 5, cores);
    }
    if (feixe) desenharFeixe(ctx, celula, pos, x, y, tons, feixe, seguinte, estado);
    desenharMecanismoDaGruta(ctx, fase, estado, celula, x, y, tons);
    if (celula === 'N') desenharAncoradouro(ctx, x, y, tons,
      estado.ancoradouros?.some(ancora => mesmaCasa(ancora, pos)) ?? false);
    // Só o obstáculo imediatamente relevante ao próximo passo recebe cantos.
    if (estado.situacao === 'jogando' && !(praia && celula === '=')
      && marcaBloqueioAdjacente(pos, atual, celula, alta, vizinhas)) {
      cantos(ctx, x, y, tons.branco, 2, 3);
    }
    if (vizinhas.some(v => mesmaCasa(v, pos))) cantos(ctx, x, y, tons.linha, 2, 3);
    if (mesmaCasa(atual, pos)) cantos(ctx, x, y, tons.linha, 1, 5);
    if (balsas.some(balsa => mesmaCasa(balsa, pos))) {
      bloco(ctx, tons.linha, x + 2, y + 3, 12, 10);
      bloco(ctx, '#bb965f', x + 3, y + 4, 10, 8);
      for (const h of [5, 8, 11]) bloco(ctx, '#eadab0', x + 4, y + h, 8, 1);
    }
    if (faixa && faixaAfeta(fase, faixa, pos)) desenharAvisoRessaca(ctx, x, y, tons, faltam === 1);
    if (rasante.some(casa => mesmaCasa(casa, pos))) marcarAlvo(ctx, x, y, true, tons);
    else if (fase.ameaca && !fase.ameaca.rasante && !fase.ameaca.rota?.length && mesmaCasa(fase.ameaca.alvo, pos)) marcarAlvo(ctx, x, y, false, tons);
  }));

  const ativo = siriAtivo(estado);
  posicoesDosSiris(estado).forEach(({ coluna, linha }, indice) => {
    const x = origemX + coluna * TAMANHO_TILE;
    const y = origemY + linha * TAMANHO_TILE;
    if (estado.dupla) {
      desenharInsignia(ctx, indice, x + 8, y, tons);
      if (indice === ativo) bloco(ctx, tons.branco, x + 6, y + 14, 4, 1);
    }
    if (indice === 0) desenharSiri(ctx, logo, x + 8, y + 13);
    else desenharSiriDaEquipe(ctx, fauna, indice, x + 8, y + 13);
  });
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
  ctx: CanvasRenderingContext2D, progresso: Progresso, arte: HTMLImageElement, logo: HTMLImageElement, transito?: Posicao,
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
  // Ancora os pés junto ao marco sem encobrir o número da fase.
  if (x !== undefined && y !== undefined) {
    const cx = CABO_X + Math.round(x), cy = CABO_Y + Math.round(y);
    desenharSiri(ctx, logo, cx, cy + 14);
  }
}

export function desenharPraia(ctx: CanvasRenderingContext2D, progresso: Progresso, logo: HTMLImageElement, transito = progresso.posicao): void {
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
    } else if (entrada?.chefe) {
      pintarPixels(ctx, DIGITOS['*'], x - 2, y - 2, { b: tons.branco });
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
  desenharSiri(ctx, logo, x, y - 1);
}
