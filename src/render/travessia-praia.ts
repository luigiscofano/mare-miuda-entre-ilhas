import type { Mundo } from '../campanha/index.ts';
import type { Posicao } from '../motor/index.ts';
import { ENFEITES_DA_PRAIA } from './enfeites-da-praia.ts';
import { TEMA_DERIVA, TEMA_ENSEADA } from './costas-enseada-deriva.ts';
import { TEMA_FAROL, TEMA_GRUTAS, TEMA_RESSACA } from './costas-grutas-ressaca-farol.ts';
import { RAIZ_DE_MARGEM, TEMA_MANGUE, TEMA_RECIFES } from './costas-recifes-mangue.ts';

// Cada casa é desenhada na superfície nativa, sem interpolar os 32 × 32 pixels.
export const CASA_PRAIA_NATIVA = 32;

export const CORES_PRAIA = {
  mar: '#155562', fundo: '#196a70', raso: '#248281', beira: '#419d93',
  aguaClara: '#73c7af', espuma: '#dbefd0', fundoOnda: '#286672', onda: '#448f91',
  areia: '#f4d18a', areiaClara: '#ffe7ad', areiaPonto: '#e4b66d',
  areiaBorda: '#d3a268', barranco: '#b18054', barrancoEscuro: '#8f6750',
  umida: '#ccaf79', umidaSombra: '#bcaa7b', umidaLuz: '#dfbc82',
  poca: '#95aa8e', poucaLuz: '#a5ab84', cantos: '#90d7bb',
  rochaEscura: '#354853', rochaFace: '#4c6976', rochaFaceClara: '#587580',
  rochaTopo: '#8a9d91', rochaSol: '#c4bda1', rochaMeio: '#617a7d',
  plantaSombra: '#4e795d', plantaFolha: '#77935a', plantaLuz: '#acac70',
  conchaEscura: '#703949', conchaSombra: '#e68a7b', conchaFace: '#e59683',
  conchaLuz: '#ffc19d', conchaBrilho: '#ffe4b2',
} as const;

type Mapa = readonly string[];
type Retangulo = Readonly<{ x: number; y: number; largura: number; altura: number }>;
type Desenho = Readonly<{
  contexto: CanvasRenderingContext2D;
  origemX: number;
  origemY: number;
}>;
type Cores = Readonly<Record<keyof typeof CORES_PRAIA, string>>;

type Enfeite = Readonly<{ desenho: readonly string[]; paleta: Readonly<Record<string, string>> }>;

export type TemaDeCosta = Readonly<{
  cores: Cores;
  enfeites: readonly Enfeite[];
  desenhoConcha?: readonly string[];
  tipo: 'praia' | 'recifes' | 'mangue' | 'enseada' | 'deriva' | 'grutas' | 'ressaca' | 'farol';
  raios: readonly [number, number, number, number];
}>;

const TEMA_PRAIA: TemaDeCosta = { cores: CORES_PRAIA, enfeites: ENFEITES_DA_PRAIA, tipo: 'praia', raios: [13, 9, 5, 2] };
const N = CASA_PRAIA_NATIVA;

export function usaTravessiaPraia(mundo: Mundo | false): boolean {
  return mundo === 'praia' || mundo === 'praia-enseadinha';
}

export function temaDaCosta(mundo: Mundo | false): TemaDeCosta | undefined {
  if (usaTravessiaPraia(mundo)) return TEMA_PRAIA;
  if (mundo === 'recifes') return TEMA_RECIFES;
  if (mundo === 'mangue') return TEMA_MANGUE;
  if (mundo === 'enseada') return TEMA_ENSEADA;
  if (mundo === 'deriva') return TEMA_DERIVA;
  if (mundo === 'grutas') return TEMA_GRUTAS;
  if (mundo === 'ressaca') return TEMA_RESSACA;
  if (mundo === 'farol') return TEMA_FAROL;
}

function ret(ctx: CanvasRenderingContext2D, cor: string, x: number, y: number, l: number, a = 1): void {
  ctx.fillStyle = cor;
  ctx.fillRect(x, y, l, a);
}

function celula(mapa: Mapa, coluna: number, linha: number): string {
  return mapa[linha]?.[coluna] ?? '~';
}

function chao(tipo: string, alta: boolean): boolean {
  return tipo !== '~' && tipo !== 'I' && tipo !== '#' && (tipo !== '=' || !alta);
}

function aoRedor(mapa: Mapa, pos: Posicao, alta: boolean) {
  const { coluna, linha } = pos;
  return {
    norte: !chao(celula(mapa, coluna, linha - 1), alta),
    sul: !chao(celula(mapa, coluna, linha + 1), alta),
    oeste: !chao(celula(mapa, coluna - 1, linha), alta),
    leste: !chao(celula(mapa, coluna + 1, linha), alta),
  };
}

// A composição é constante durante cada virada; só o contorno costeiro acompanha a água.
function variante(coluna: number, linha: number, semente = 0): number {
  return ((Math.imul(coluna + 11, 73856093) ^ Math.imul(linha + 13, 19349663) ^ semente) >>> 0);
}

function sprite(ctx: CanvasRenderingContext2D, desenho: readonly string[],
  paleta: Readonly<Record<string, string>>, x: number, y: number): void {
  desenho.forEach((linha, dy) => {
    [...linha].forEach((pixel, dx) => {
      const cor = paleta[pixel];
      if (cor) ret(ctx, cor, x + dx, y + dy, 1);
    });
  });
}

const PEDRA_GRANDE = [
  '.......ddddddd.......',
  '.....ddttttttfdd.....',
  '....dtsssttttfffd....',
  '...dtssssttttfffd....',
  '..dtsssttttfffcffd...',
  '..dtttttttfffcfffd...',
  '..dttttffffccffffd...',
  '..dffffffffffmmfd....',
  '...dffffffffmmmd.....',
  '....ddffmmmmmdd......',
  '......ddddddd........',
] as const;
const PEDRA_MEDIA = [
  '.....dddddd...',
  '...ddttttffd..',
  '..dtssstfffd..',
  '.dtsttfffffmd.',
  '.dttfffffffmd.',
  '.dfffffmmmmd..',
  '..ddmmmmddd...',
  '....dddd......',
] as const;
const PEDRA_PEQUENA = [
  '...ddddd..', '..dttfffd.', '.dtsfffcfd', '.dfffffmd.', '..dmmddd..', '...ddd....',
] as const;
function rocha(ctx: CanvasRenderingContext2D, x: number, y: number, semente: number,
  { cores, tipo: costa }: TemaDeCosta, refugio = false) {
  const paletaPedra = {
    d: cores.rochaEscura, f: cores.rochaFace, c: cores.rochaFaceClara,
    t: cores.rochaTopo, s: cores.rochaSol, m: cores.rochaMeio,
  };
  // As bases se encostam para formar um afloramento, não três peças soltas.
  ret(ctx, refugio ? cores.areiaBorda : cores.fundo, x + 4, y + 23, 24, 3);
  ret(ctx, refugio ? cores.areiaPonto : cores.raso, x + 7, y + 26, 19, 1);
  if (refugio) {
    ret(ctx, cores.areiaClara, x + 7, y + 16, 17, 4);
    ret(ctx, cores.areiaClara, x + 9, y + 20, 14, 2);
    ret(ctx, cores.areiaBorda, x + 10, y + 22, 13, 2);
    if (costa === 'recifes') {
      // O refúgio tem tampa clara e estratos baixos: não parece uma barreira alta.
      ret(ctx, cores.rochaTopo, x + 8, y + 21, 15, 1);
      ret(ctx, cores.rochaMeio, x + 10, y + 23, 11, 1);
      ret(ctx, cores.rochaSol, x + 11, y + 17, 7, 1);
    }
    return;
  }
  const tipo = (semente >>> 7) % 7;
  if (tipo < 2) {
    sprite(ctx, PEDRA_GRANDE, paletaPedra, x + 4 + tipo * 3, y + 5 + tipo);
    sprite(ctx, PEDRA_MEDIA, paletaPedra, x + 3, y + 14 + tipo * 2);
    sprite(ctx, PEDRA_PEQUENA, paletaPedra, x + 18, y + 17);
  } else if (tipo < 4) {
    sprite(ctx, PEDRA_MEDIA, paletaPedra, x + 12 - tipo, y + 10);
    sprite(ctx, PEDRA_MEDIA, paletaPedra, x + 15, y + 15 + tipo);
    sprite(ctx, PEDRA_PEQUENA, paletaPedra, x + 5, y + 18);
  } else if (tipo < 6) {
    sprite(ctx, PEDRA_PEQUENA, paletaPedra, x + 15, y + 11 - tipo);
    sprite(ctx, PEDRA_GRANDE, paletaPedra, x + 5, y + 11);
    sprite(ctx, PEDRA_PEQUENA, paletaPedra, x + 17, y + 19);
  } else {
    sprite(ctx, PEDRA_MEDIA, paletaPedra, x + 13, y + 16);
    sprite(ctx, PEDRA_MEDIA, paletaPedra, x + 4, y + 15);
    sprite(ctx, PEDRA_PEQUENA, paletaPedra, x + 11, y + 9);
  }
  if (costa === 'recifes' || costa === 'enseada' || costa === 'grutas') {
    // Apenas a face de um dos blocos recebe o veio; o desenho continua angular.
    const recuo = tipo % 3;
    ret(ctx, cores.rochaFaceClara, x + 10 + recuo, y + 17, 8);
    ret(ctx, cores.rochaTopo, x + 11 + recuo, y + 18, 6);
  }
}

const ERVAS = [
  ['......l...', '..l...f...', '..f..lf.f.', '.lf..fffl.', '.sfflfffs.', '..sfsssfs.', '...sssss..'],
  ['........f.', '..l....lf.', '..ffl..fs.', '...ffsffs.', 'l...fsssf.', 'fs.fsfsf..', '.sssss....'],
  ['..l..l....', '..fl.ff.l.', '...f.ff.f.', '.l.f.sffs.', '.ffs.fss..', '..sfffss..', '...sssss..'],
] as const;
function concha(ctx: CanvasRenderingContext2D, x: number, y: number, { cores, desenhoConcha }: TemaDeCosta) {
  const abas = desenhoConcha ?? [
    '..........ddd..........', '.........dllld.........', '.......ddlbllldd.......',
    '......dpllblblldd......', '....ddplblblblplldd....', '...dplblblblbllblldd...',
    '..dpllblblblblblblldd..', '.dplblblblblblbllblpdd.', 'dplblblblblblblblblplpd',
    'dpflblblblblblblblplfpd', '.dpfllblblblblblplfpd..', '..dpfllblblblblplfpd...',
    '...dppflllbbblllffpd...', '.....dppfffbffppdd.....', '.......dddddddd........',
  ];
  ret(ctx, cores.areiaBorda, x + 5, y + 23, 23, 4);
  ret(ctx, cores.areiaPonto, x + 8, y + 27, 17, 1);
  const recuo = desenhoConcha ? Math.floor((N - abas[0].length) / 2) : 4;
  sprite(ctx, abas, { d: cores.conchaEscura, p: cores.conchaSombra,
    f: cores.conchaFace, b: cores.conchaBrilho, l: cores.conchaLuz }, x + recuo, y + 9);
  ret(ctx, cores.conchaBrilho, x + 26, y + 5, 1, 5);
  ret(ctx, cores.conchaBrilho, x + 24, y + 7, 5);
}

function marCalmo(ctx: CanvasRenderingContext2D, largura: number, altura: number, { cores, tipo }: TemaDeCosta): void {
  const entreOndasX = tipo === 'praia' ? 49 : 68;
  const entreOndasY = tipo === 'praia' ? 17 : 24;
  ret(ctx, cores.mar, 0, 0, largura, altura);
  for (let linha = 0; linha < altura; linha += entreOndasY) {
    for (let coluna = 3; coluna < largura; coluna += entreOndasX) {
      const v = variante(coluna, linha);
      const x = coluna + v % 27;
      const y = linha + (v >>> 7) % 10;
      ret(ctx, v % 4 === 0 ? cores.onda : cores.fundoOnda, x, y, 3 + v % 9);
      if (v % 3 === 0) ret(ctx, cores.fundoOnda, x + 2, y + 2, 4 + v % 3);
    }
  }
}

function pintarEnfeitesNoMar(ctx: CanvasRenderingContext2D, grade: Retangulo, largura: number, altura: number,
  enfeites: readonly Enfeite[]): void {
  // Reserve folga em torno dos limites da grade. O jogador nunca confunde
  // um enfeite do oceano com uma casa transitável, mesmo nas arenas maiores.
  const xCentro = Math.floor(largura / 2);
  const yCentro = Math.floor(altura / 2);
  const posicoes = [[grade.x - 68, yCentro - 26], [grade.x + grade.largura + 26, yCentro + 10],
    [xCentro - 58, grade.y + grade.altura + 29]] as const;
  enfeites.forEach(({ desenho, paleta }, indice) => {
    const [x, y] = posicoes[indice];
    if (x < 7 || y < 7 || x + desenho[0].length > largura - 7 || y + desenho.length > altura - 7) return;
    sprite(ctx, desenho, paleta, x, y);
  });
}

function localDeRocha(mapa: Mapa, coluna: number, linha: number): boolean {
  const costa = [[-1, 0], [1, 0], [0, -1], [0, 1]]
    .some(([dc, dl]) => chao(celula(mapa, coluna + dc, linha + dl), false));
  if (!costa) return false;
  // Deixe intervalos de água entre fileiras de afloramentos. As extremidades
  // mantêm a forma inteira; águas abertas continuam fora da trilha.
  const cercada = (celula(mapa, coluna - 1, linha) === '#' && celula(mapa, coluna + 1, linha) === '#')
    || (celula(mapa, coluna, linha - 1) === '#' && celula(mapa, coluna, linha + 1) === '#');
  return !cercada || (coluna + linha) % 3 === 0;
}

function faixaDaCosta(ctx: CanvasRenderingContext2D, casa: Retangulo, raio: number, cor: string) {
  const { x, y, largura, altura } = casa;
  // Chanfros em degraus suavizam a água, mas o limite do piso continua ortogonal.
  const chanfro = Math.ceil(raio / 2);
  ret(ctx, cor, x - raio, y - raio + chanfro, largura + raio * 2, altura + (raio - chanfro) * 2);
  ret(ctx, cor, x - raio + chanfro, y - raio, largura + (raio - chanfro) * 2, altura + raio * 2);
  const meio = Math.ceil(chanfro / 2);
  ret(ctx, cor, x - raio + meio, y - raio + meio, largura + (raio - meio) * 2, altura + (raio - meio) * 2);
}

function sombraDeAreia(ctx: CanvasRenderingContext2D, x: number, y: number,
  lados: ReturnType<typeof aoRedor>, v: number, cores: Cores): void {
  if (lados.norte) {
    ret(ctx, cores.espuma, x, y, N, 2);
    ret(ctx, cores.areiaClara, x, y + 2, N, 2);
  }
  if (lados.oeste) {
    ret(ctx, cores.espuma, x, y, 2, N);
    ret(ctx, cores.areiaClara, x + 2, y + 1, 2, N - 2);
  }
  if (lados.leste) {
    ret(ctx, cores.areiaBorda, x + N - 3, y, 1, N);
    ret(ctx, cores.areiaClara, x + N - 2, y, 1, N);
    ret(ctx, cores.espuma, x + N - 1, y, 1, N);
  }
  if (lados.sul) {
    ret(ctx, cores.areiaBorda, x, y + N - 5, N, 2);
    ret(ctx, cores.barrancoEscuro, x, y + N - 3, N, 1);
    ret(ctx, cores.espuma, x, y + N - 2, N, 2);
  }
  const d = v % 9 + 7;
  if (lados.norte) ret(ctx, cores.aguaClara, x + d, y - 1, 5);
  if (lados.sul) ret(ctx, cores.aguaClara, x + N - d - 5, y + N, 5);
  if (lados.oeste) ret(ctx, cores.aguaClara, x - 1, y + d, 1, 5);
  if (lados.leste) ret(ctx, cores.aguaClara, x + N, y + d, 1, 5);
}

function baixioDescoberto(ctx: CanvasRenderingContext2D, x: number, y: number,
  mapa: Mapa, { coluna, linha }: Posicao, v: number, { cores, tipo }: TemaDeCosta): void {
  const borda = 3;
  const esquerda = celula(mapa, coluna - 1, linha) === '=' ? 0 : borda;
  const direita = celula(mapa, coluna + 1, linha) === '=' ? 0 : borda;
  const cima = celula(mapa, coluna, linha - 1) === '=' ? 0 : borda;
  const baixo = celula(mapa, coluna, linha + 1) === '=' ? 0 : borda;
  ret(ctx, cores.umidaLuz, x + esquerda, y + cima, N - esquerda - direita, N - cima - baixo);
  ret(ctx, cores.umida, x + esquerda, y + cima + 2, N - esquerda - direita, N - cima - baixo - 2);
  ret(ctx, cores.umidaSombra, x + esquerda, y + N - baixo - 3, N - esquerda - direita, 3);
  const d = v % 9;
  ret(ctx, cores.poca, x + 7 + d, y + 13, 9, 3);
  ret(ctx, cores.poca, x + 9 + d, y + 12, 5, 1);
  ret(ctx, cores.poucaLuz, x + 8 + d, y + 13, 5);
  ret(ctx, cores.umidaLuz, x + 5, y + 23, 7 + v % 4);
  ret(ctx, cores.umidaLuz, x + 19, y + 9, 6);
  if (tipo === 'recifes') {
    ret(ctx, cores.poca, x + 21, y + 20, 6, 3);
    ret(ctx, cores.poucaLuz, x + 22, y + 20, 4);
  }
}

function baixioSubmerso(ctx: CanvasRenderingContext2D, x: number, y: number, cores: Cores) {
  // Forma fixa, não depende de matiz nem de o siri já estar perto da casa.
  for (const u of [5, N - 6]) {
    for (const v of [5, N - 6]) {
      ret(ctx, cores.cantos, x + (u === 5 ? u : u - 3), y + v, 4);
      ret(ctx, cores.cantos, x + u, y + (v === 5 ? v : v - 3), 1, 4);
    }
  }
  ret(ctx, cores.onda, x + 12, y + 16, 8);
  ret(ctx, cores.onda, x + 15, y + 18, 3);
}

function areia(ctx: CanvasRenderingContext2D, x: number, y: number, v: number, decorar: boolean, { cores, tipo }: TemaDeCosta): void {
  ret(ctx, cores.areia, x, y, N, N);
  const sementes = [v & 31, (v >>> 5) & 31, (v >>> 10) & 31, (v >>> 15) & 31];
  sementes.forEach((n, i) => ret(ctx, i === 0 ? cores.areiaClara : cores.areiaPonto,
    x + 5 + n % 18, y + 5 + ((n * 3 + i * 7) % 20), 1 + n % 4));
  if (decorar && v % 5 === 0) {
    ret(ctx, cores.areiaPonto, x + 6, y + 22, 11, 2);
    sprite(ctx, ERVAS[(v >>> 4) % ERVAS.length],
      { s: cores.plantaSombra, l: cores.plantaLuz, f: cores.plantaFolha }, x + 6, y + 16);
  }
  if (decorar && tipo === 'recifes' && v % 5 === 2) {
    // Pequenos cacos de concha no chão; o rosa ou o nácar grande fica reservado ao objetivo.
    ret(ctx, cores.areiaClara, x + 8, y + 19, 3, 2);
    ret(ctx, cores.areiaBorda, x + 12, y + 21, 3);
  }
  if (decorar && tipo === 'enseada' && v % 7 === 3) {
    // Penas não entram na paisagem. Os traços chapados são sedimento do vento.
    ret(ctx, cores.areiaBorda, x + 9, y + 24, 8);
    ret(ctx, cores.areiaClara, x + 12, y + 23, 6);
    ret(ctx, cores.areiaClara, x + 20, y + 22, 3);
  }
  if (decorar && tipo === 'deriva' && v % 7 === 3) {
    // Um graveto pequeno repousa no piso, bem menor que o casco navegável.
    ret(ctx, cores.areiaPonto, x + 8, y + 24, 9);
    ret(ctx, cores.barranco, x + 9, y + 23, 6);
    ret(ctx, cores.barrancoEscuro, x + 14, y + 22, 2);
  }
  if (decorar && tipo === 'grutas' && v % 5 === 2) {
    // Veio rente ao chão, escuro, sem parecer item.
    ret(ctx, cores.areiaBorda, x + 6, y + 25, 7);
    ret(ctx, cores.barranco, x + 11, y + 24, 8);
    ret(ctx, cores.areiaBorda, x + 16, y + 23, 6);
  }
  if (decorar && tipo === 'farol' && v % 5 === 2) {
    ret(ctx, cores.areiaBorda, x + 10, y + 23, 7);
    ret(ctx, cores.areiaPonto, x + 14, y + 22, 6);
  }
  if (decorar && tipo === 'mangue') {
    const a = 6 + v % 12;
    ret(ctx, cores.barranco, x + a, y + 25, 5);
    ret(ctx, cores.areiaBorda, x + a + 4, y + 24, 3);
    if (v % 7 === 0) {
      ret(ctx, cores.plantaFolha, x + 11, y + 13, 2);
      ret(ctx, cores.plantaFolha, x + 13, y + 14, 5);
      ret(ctx, cores.plantaLuz, x + 14, y + 13, 3);
    }
  }
}

export function pintarCosta(
  { contexto: ctx, origemX, origemY }: Desenho, mapa: Mapa, alta: boolean,
  largura: number, altura: number, tema: TemaDeCosta,
): void {
  const { cores, tipo, enfeites, raios } = tema;
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  marCalmo(ctx, largura, altura, tema);
  const casas = mapa.flatMap((fileira, linha) => [...fileira].map((tipo, coluna) => ({
    tipo, coluna, linha, x: origemX + coluna * N, y: origemY + linha * N,
    largura: N, altura: N, v: variante(coluna, linha, largura + mapa[0].length * 47 + mapa.length * 17),
  })));
  pintarEnfeitesNoMar(ctx, { x: origemX, y: origemY, largura: mapa[0].length * N, altura: mapa.length * N },
    largura, altura, enfeites);
  const bancos = casas.filter(casa => chao(casa.tipo, alta));
  for (const [raio, cor] of [[raios[0], cores.fundo], [raios[1], cores.raso], [raios[2], cores.beira], [raios[3], cores.aguaClara]] as const) {
    for (const casa of bancos) faixaDaCosta(ctx, casa, raio, cor);
  }
  for (const casa of bancos) {
    const { tipo, x, y, v } = casa;
    areia(ctx, x, y, v, tipo === '.', tema);
    if (tipo === '=') baixioDescoberto(ctx, x, y, mapa, casa, v, tema);
  }
  for (const casa of bancos) sombraDeAreia(ctx, casa.x, casa.y, aoRedor(mapa, casa, alta), casa.v, cores);
  for (const { tipo: casa, x, y, v, coluna, linha } of casas) {
    // Rocha junto à trilha sinaliza limite. O oceano distante já sinaliza bloqueio
    // sem preencher cada casa intransitável com o mesmo afloramento.
    if (casa === '#' && localDeRocha(mapa, coluna, linha)) {
      if (tipo === 'mangue' && v % 3 !== 0) {
        const { desenho, paleta } = RAIZ_DE_MARGEM[(coluna + 2 * linha + (v >>> 9)) % RAIZ_DE_MARGEM.length];
        const recuo = Math.floor((N - desenho[0].length) / 2);
        sprite(ctx, desenho, paleta, x + recuo, y + 27 - desenho.length);
      } else rocha(ctx, x, y, v, tema);
    } else if (casa === 'H') rocha(ctx, x, y, v, tema, true);
    else if (casa === 'C') concha(ctx, x, y, tema);
    else if (casa === '=' && alta) baixioSubmerso(ctx, x, y, cores);
  }
  ctx.restore();
}
