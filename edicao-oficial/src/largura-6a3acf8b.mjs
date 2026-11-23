import { desenharSiriComPulso } from '@@MARE:modulo:src/render/retorno-da-mare.mjs@@';
import { pintarVegetacao } from '@@MARE:modulo:src/posicionar-vegetacao-33409cef.mjs@@';
import { chaveDaPosicao, entradasDosSiris, preverDirecoesDaEquipe } from '@@MARE:modulo:src/nomes-dos-siris-e97b332f.mjs@@';
import { bocaSubmersa, fendaAtiva, casasDoRasante, mareAlta, mesmaCasa, posicoesDosSiris, totalFragmentos } from '@@MARE:modulo:src/formas-de-fenda-70ff4532.mjs@@';
                                                               
import { entradaEm, mundoAtual, nosDo, rotaLivre, trilhasDo } from '@@MARE:modulo:src/mundo-valido-900be48c.mjs@@';
                                                             
import { caminhoDoCabo, marcadorCabo } from '@@MARE:modulo:src/marcador-cabo-c7cc7d50.mjs@@';
import { desenharBocaDeFenda, desenharSaidaDeFenda } from '@@MARE:modulo:src/desenhar-boca-de-fenda-73be2c95.mjs@@';
import { prepararTravessia } from '@@MARE:modulo:src/preparar-travessia-c172032e.mjs@@';
import { coletaPerolas, indiceDaPerola } from '@@MARE:modulo:src/coleta-perolas-31bd4890.mjs@@';
import { pintarConchaDaCosta, pintarCosta, temaDaCosta } from '@@MARE:modulo:src/casa-praia-nativa-e70dc18e.mjs@@';
import { conchasDaEquipe, pintarConchaDaEquipe } from '@@MARE:modulo:src/conchas-da-equipe-910d11c3.mjs@@';
import { paletaDaPerola, PEROLA_COLETAVEL } from '@@MARE:modulo:src/perola-coletavel-60318f42.mjs@@';
import { CORES_OSTRA, OSTRA_ABERTA, OSTRA_FECHADA } from '@@MARE:modulo:src/cores-ostra-18efb2e8.mjs@@';
import { pintarSeletorArquipelago, podePintarArquipelago } from '@@MARE:modulo:src/seletor-arquipelago-2aba4f95.mjs@@';

import { mapaComFundoInterno, pintarCadeadoPraia, pintarMarcoDaPraia, pintarSeletorInterno, podePintarSeletorInterno } from '@@MARE:modulo:src/pintar-marco-da-praia-9c416198.mjs@@';

export const LARGURA = 256;
export const ALTURA = 192;
export const DENSIDADE = 2;
const RECORTE_SIRI = { x: 75, y: 3, largura: 31, altura: 23 }         ;
const TAMANHO_TILE = 16;

const TONS_CINZA = {
  agua: '#32343a', margem: '#484b52', areia: '#d1d2d4', areiaSombra: '#a8aaae',
  roca: '#6b6f77', linha: '#222327', branco: '#fafafa', cinza: '#e9eaed',
}         ;
                                                              
const TONS_PRAIA       = {
  agua: '#24585e', margem: '#32747a', areia: '#f4d398', areiaSombra: '#83aa89',
  roca: '#576766', linha: '#243c41', branco: '#fff1d2', cinza: '#df7756',
};
const CORES_MUNDO                                = {
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
]         ;
// A placa da abertura é a única fonte do protagonista. O recorte usa pixels
// nativos, enquanto o terreno permanece na grade lógica de 16 pixels por casa.
function desenharSiri(ctx                          , logo                  , centroX        , baseY        ) {
  if (!logo.complete || logo.naturalWidth !== 180 || logo.naturalHeight !== 94) return;
  const { x, y, largura, altura } = RECORTE_SIRI;
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  desenharSiriComPulso(ctx, logo, x, y, largura, altura,
    Math.round(centroX * DENSIDADE - largura / 2), Math.round(baseY * DENSIDADE) - altura, largura, altura, 0);
  ctx.restore();
}

function desenharSiriDaEquipe(
  ctx                          , folha                              , indice        , centroX        , baseY        ,
) {
  const { largura, altura } = RECORTE_SIRI;
  if (!folha?.complete || folha.naturalWidth !== largura * 5 || folha.naturalHeight !== altura) return;
  // A folha usa a mesma resolução nativa do recorte original, sem escala.
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  desenharSiriComPulso(ctx, folha, indice * largura, 0, largura, altura,
    Math.round(centroX * DENSIDADE - largura / 2), Math.round(baseY * DENSIDADE) - altura, largura, altura, indice);
  ctx.restore();
}

function desenharInsignia(ctx                          , indice        , centroX        , topoY        , tons      ) {
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
const paleta = (tons      ) => ({ l: tons.linha, c: tons.cinza, b: tons.branco })                                    ;

function pintarPixels(ctx                          , sprite                   , x        , y        , cores                                  ) {
  sprite.forEach((linha, dy) => [...linha].forEach((pixel, dx) => {
    const cor = cores[pixel];
    if (!cor) return;
    ctx.fillStyle = cor;
    ctx.fillRect(x + dx, y + dy, 1, 1);
  }));
}

function desenharSpriteNativoNaCasa(ctx                          , sprite                   ,
  x        , y        , paleta                                  )       {
  const lado = TAMANHO_TILE * DENSIDADE;
  const recuoX = Math.floor((lado - sprite[0].length) / 2);
  const recuoY = Math.floor((lado - sprite.length) / 2);
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  pintarPixels(ctx, sprite, x * DENSIDADE + recuoX, y * DENSIDADE + recuoY, paleta);
  ctx.restore();
}

function bloco(ctx                          , cor        , x        , y        , largura        , altura        ) {
  ctx.fillStyle = cor;
  ctx.fillRect(x, y, largura, altura);
}

function desenharPisoLegado(ctx                          , celula        , alta         , x        , y        , tons      , exibirConcha = true) {
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
  if (celula === 'C' && exibirConcha) conchaObjetivo(ctx, x, y, tons);
  if (celula === '#') {
    bloco(ctx, '#54575e', x + 3, y + 7, 10, 5);
    bloco(ctx, '#94979f', x + 5, y + 5, 6, 2);
  }
  if (celula === 'H') {
    // A bancada mantém a mesma ideia de piso elevado, também em cinza.
    bloco(ctx, tons.branco, x + 2, y + 4, 12, 2);
    bloco(ctx, tons.areia, x + 1, y + 6, 14, 4);
    bloco(ctx, tons.areiaSombra, x + 1, y + 10, 14, 2);
    bloco(ctx, tons.areiaSombra, x + 2, y + 12, 12, 1);
  }
}

function desenharMarcadoresDeChegada(ctx, celula, x, y, tons) {
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

function cantos(ctx                          , x        , y        , cor        , margem        , traco        ) {
  const fim = TAMANHO_TILE - 1 - margem;
  for (const dy of [margem, fim]) {
    for (const dx of [margem, fim]) {
      bloco(ctx, cor, x + (dx === margem ? dx : dx - traco + 1), y + dy, traco, 1);
      bloco(ctx, cor, x + dx, y + (dy === margem ? dy : dy - traco + 1), 1, traco);
    }
  }
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
]         ;

function conchaObjetivo(ctx                          , x        , y        , tons      ) {
  pintarPixels(ctx, CONCHA_OBJETIVO, x + 3, y + 5, paleta(tons));
  // Brilho fixo na grade: a concha não depende de animação ou cor para ser lida.
  bloco(ctx, tons.branco, x + 12, y + 2, 1, 3);
  bloco(ctx, tons.branco, x + 11, y + 3, 3, 1);
}

function marcarAlvo(ctx                          , x        , y        , previsto         , tons      ) {
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
  posicao         , atual         , celula        , alta         , vizinhas                    ,
)          {
  const distancia = Math.abs(posicao.coluna - atual.coluna) + Math.abs(posicao.linha - atual.linha);
  return distancia === 1 && (celula === '#' || (celula === '=' && alta))
    && !vizinhas.some(v => mesmaCasa(v, posicao));
}

function desenharFundoDaTravessia(ctx                          , tema               , tons      ) {
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

export function desenhar(ctx                          , fase      , estado        , logo                  , tema                = false, fauna                   )       {
  const tons       = tema ? CORES_MUNDO[tema] : TONS_CINZA;
  const cores = paleta(tons);
  ctx.imageSmoothingEnabled = false;
  const costa = temaDaCosta(tema);
  if (!costa) desenharFundoDaTravessia(ctx, tema, tons);

  const gradeLargura = fase.mapa[0].length * TAMANHO_TILE;
  const gradeAltura = fase.mapa.length * TAMANHO_TILE;
  const origemX = (LARGURA - gradeLargura) / 2;
  const origemY = (ALTURA - gradeAltura) / 2;
  const alta = mareAlta(estado.passos);
  const alvos = conchasDaEquipe(fase, estado);
  if (costa) {
    pintarCosta({ contexto: ctx, origemX: origemX * DENSIDADE, origemY: origemY * DENSIDADE },
      fase.mapa, alta, LARGURA * DENSIDADE, ALTURA * DENSIDADE, costa, fase.id, false);
  } else {
    bloco(ctx, tons.margem, origemX - 4, origemY - 4, gradeLargura + 8, gradeAltura + 8);
  }

  const grupo = estado.situacao === 'jogando' ? preverDirecoesDaEquipe(fase, estado) : [];
  const entradas = entradasDosSiris(grupo);
  const passosLegais = grupo.flatMap(({ movimentos }) => movimentos.filter(passo => 'destino' in passo));
  const vizinhas = passosLegais.map(passo => passo.entrada);
  const rasante = casasDoRasante(fase, estado.passos + 1);
  const siris = posicoesDosSiris(estado);
  const emEquipe = siris.length > 1;
  const temOstra = coletaPerolas(fase);
  const abriuOstra = temOstra && estado.fragmentos.length >= totalFragmentos(fase);
  if (costa && fase.id.startsWith('farol-')) {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    pintarVegetacao((cor, u, v, l, a) => bloco(ctx, cor, u, v, l, a), fase,
      origemX * DENSIDADE, origemY * DENSIDADE, TAMANHO_TILE * DENSIDADE, (coluna, linha) => {
        const p = { coluna, linha };
        return siris.some(q => mesmaCasa(q, p)) || rasante.some(q => mesmaCasa(q, p))
          || vizinhas.some(q => mesmaCasa(q, p));
      });
    ctx.restore();
  }
  fase.mapa.forEach((fileira, linha) => [...fileira].forEach((celula, coluna) => {
    const x = origemX + coluna * TAMANHO_TILE;
    const y = origemY + linha * TAMANHO_TILE;
    const pos = { coluna, linha };
    const alvoDaEquipe = alvos.get(chaveDaPosicao(pos));
    if (!costa) desenharPisoLegado(ctx, celula, alta, x, y, tons, alvoDaEquipe === undefined);
    if (alvoDaEquipe) {
      const px = x * DENSIDADE, py = y * DENSIDADE;
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      const pintar = (cor        , u        , v        , l        , a        ) => bloco(ctx, cor, u, v, l, a);
      pintarConchaDaEquipe(pintar, alvoDaEquipe, px, py, TAMANHO_TILE * DENSIDADE, (u, v) => {
        if (costa) {
          pintarConchaDoMundo(pintar, costa.tipo, u, v, 32);
          pintarBrilhosDoObjetivo(pintar, u, v, 'concha', 32, alvoDaEquipe.bloqueada);
        } else {
          // A bancada sempre usa o desenho cinza na grade lógica de 16 px.
          ctx.save();
          ctx.setTransform(DENSIDADE, 0, 0, DENSIDADE, u, v);
          conchaObjetivo(ctx, 0, 0, tons);
          ctx.restore();
        }
      }, tons.linha, tons.branco);
      ctx.restore();
    } else if (celula === 'G' && temOstra) {
      desenharSpriteNativoNaCasa(ctx, abriuOstra ? OSTRA_ABERTA : OSTRA_FECHADA, x, y, CORES_OSTRA);
      if (costa) {
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        pintarBrilhosDoObjetivo((cor, u, v, l, a) => bloco(ctx, cor, u, v, l, a), x * DENSIDADE, y * DENSIDADE,
          abriuOstra ? 'ostra-aberta' : 'ostra-fechada', 32);
        ctx.restore();
      }
    } else if (celula === 'C' && costa) {
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      const pintar = (cor, u, v, l, a) => bloco(ctx, cor, u, v, l, a);
      pintarConchaDoMundo(pintar, costa.tipo, x * DENSIDADE, y * DENSIDADE, 32);
      pintarBrilhosDoObjetivo(pintar, x * DENSIDADE, y * DENSIDADE, 'concha', 32);
      ctx.restore();
    } else desenharMarcadoresDeChegada(ctx, celula, x, y, tons);
    const fenda = fase.fendas?.find(par => par.bocas.some(boca => mesmaCasa(boca, pos)));
    // Na alta o baixio coberto conserva a arte normal da água, sem marca da fenda.
    if (fenda && !bocaSubmersa(fase, pos, estado.passos)) {
      desenharBocaDeFenda(ctx, fenda.forma, fendaAtiva(fase, fenda, estado.passos), x, y);
    }
    if (celula === 'B' && !estado.fragmentos.some(coleta => mesmaCasa(pos, coleta))) {
      const indice = indiceDaPerola(fase, pos);
      if (indice !== undefined) desenharSpriteNativoNaCasa(ctx, PEROLA_COLETAVEL, x, y, paletaDaPerola(indice));
      else pintarPixels(ctx, FRAGMENTO, x + 5, y + 5, cores);
    }
    // A marca histórica de obstáculos é solo. Em equipe aparecem só
    // destinos possíveis, identificados pelo símbolo de cada siri.
    if (!emEquipe && estado.situacao === 'jogando' && !(costa && celula === '=')
      && siris.some(origem => marcaBloqueioAdjacente(pos, origem, celula, alta, vizinhas))) {
      cantos(ctx, x, y, tons.branco, 2, 3);
    }
    const destinosDaCasa = entradas.get(chaveDaPosicao(pos));
    if (destinosDaCasa) cantos(ctx, x, y, tons.linha, 2, 3);
    const saida = passosLegais.find(passo => passo.fenda && mesmaCasa(passo.destino, pos));
    if (saida) desenharSaidaDeFenda(ctx, x, y, Boolean(saida.saidaVaiAlagar));
    if (siris.some(origem => mesmaCasa(origem, pos))) cantos(ctx, x, y, tons.linha, 1, 5);
    if (rasante.some(casa => mesmaCasa(casa, pos))) marcarAlvo(ctx, x, y, true, tons);
    else if (fase.ameaca && !fase.ameaca.rasante && !fase.ameaca.rota?.length && mesmaCasa(fase.ameaca.alvo, pos)) marcarAlvo(ctx, x, y, false, tons);
    // Duas direções distintas podem alcançar a mesma casa. Os símbolos
    // dos siris ficam lado a lado no pé do tile, sem cobrir seu mecanismo.
    if (emEquipe && destinosDaCasa) {
      for (const i of destinosDaCasa) desenharInsignia(ctx, i, x + 4 + 4 * i, y + 13, tons);
    }
  }));

  posicoesDosSiris(estado).forEach(({ coluna, linha }, indice) => {
    const x = origemX + coluna * TAMANHO_TILE;
    const y = origemY + linha * TAMANHO_TILE;
    if (emEquipe) desenharInsignia(ctx, indice, x + 8, y, tons);
    if (indice === 0) desenharSiri(ctx, logo, x + 8, y + 13);
    else desenharSiriDaEquipe(ctx, fauna, indice, x + 8, y + 13);
  });
}

const MAPA_X = 56;
const MAPA_Y = 52;
const centroNo = ({ coluna, linha }         ) => [
  Math.round(MAPA_X + coluna * TAMANHO_TILE + 8),
  Math.round(MAPA_Y + linha * TAMANHO_TILE + 8),
]         ;

// O mesmo caminho dirige o siri e desenha a areia; rasterizamos sem antialiasing.
function riscar(ctx                          , cor        , tamanho        , pontos                    ) {
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

const DIGITOS                                              = {
  '1': ['.b.', 'bb.', '.b.', '.b.', 'bbb'],
  '2': ['bb.', '..b', '.b.', 'b..', 'bbb'],
  '3': ['bb.', '..b', '.b.', '..b', 'bb.'],
  '4': ['b.b', 'b.b', 'bbb', '..b', '..b'],
  '*': ['..b..', '.bbb.', 'bbbbb', '.bbb.', '.b.b.'],
  '>': ['b..', '.b.', '..b', '.b.', 'b..'],
};
const CABO_X = 32;
const CABO_Y = 24;

export function podeDesenharCabo(mundo       , arte                  )          {
  return mundo === 'praia' && arte.complete && arte.naturalWidth === 192;
}

export function desenharCabo(
  ctx                          , progresso           , arte                  , logo                  , transito          ,
)       {
  ctx.imageSmoothingEnabled = false;
  bloco(ctx, '#138782', 0, 0, LARGURA, ALTURA);
  ctx.drawImage(arte, CABO_X, CABO_Y, 192, 144);
  for (const ponto of nosDo('praia')) {
    const marco = marcadorCabo(ponto);
    if (!marco?.simbolo) continue;
    const [x, y] = marco.ponto;
    const entrada = entradaEm(ponto);
    const concluida = progresso.concluidas.some(f => f === entrada?.id);
    const simbolo = marco.simbolo === '*' ? 'desvio' : marco.simbolo === '>' ? 'direita' : marco.simbolo;
    pintarMarcoDaPraia(ctx, CABO_X + x, CABO_Y + y, simbolo, concluida, true);
  }
  for (const trecho of trilhasDo('praia')) {
    if (rotaLivre(progresso, trecho)) continue;
    const pontos = caminhoDoCabo(trecho.de, trecho.para);
    if (!pontos) continue;
    const meio = prepararTravessia(pontos).ponto(.5);
    pintarCadeadoPraia(ctx, CABO_X + Math.round(meio.coluna), CABO_Y + Math.round(meio.linha));
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

export function desenharPraia(ctx                          , progresso           , logo                  ,
  transito = progresso.posicao, arquipelago                   , fundoInterno                   )       {
  const mundo = mundoAtual(progresso);
  if (mundo === 'arquipelago' && podePintarArquipelago(arquipelago)) {
    pintarSeletorArquipelago(ctx, progresso, ponto => {
      const [x, y] = centroNo(ponto);
      return [x * DENSIDADE, y * DENSIDADE];
    }, arquipelago);
    const [x, y] = centroNo(transito);
    desenharSiri(ctx, logo, x, y - 1);
    return;
  }
  if (mapaComFundoInterno(mundo) && podePintarSeletorInterno(fundoInterno)) {
    pintarSeletorInterno(ctx, progresso, centroNo, fundoInterno, mundo);
    const [x, y] = centroNo(transito);
    desenharSiri(ctx, logo, x, y - 1);
    return;
  }
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
  for (const [cor, tamanho] of [[tons.margem, 13], ['#f3e4bb', 11], [tons.areia, 7]]         ) {
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

const matrizConchaPraia = [["#bf8573",20,10,9,1],["#bf8573",20,11,9,1],["#bf8573",20,12,2,1],["#fff0c5",22,12,5,1],["#bf8573",27,12,2,1],["#bf8573",14,13,8,1],["#fff0c5",22,13,5,1],["#bf8573",27,13,8,1],["#bf8573",14,14,7,1],["#fff0c5",21,14,7,1],["#bf8573",28,14,7,1],["#bf8573",14,15,2,1],["#ffdbac",16,15,4,1],["#e69a82",20,15,1,1],["#fff0c5",21,15,7,1],["#e69a82",28,15,2,1],["#ffdbac",30,15,3,1],["#bf8573",33,15,2,1],["#bf8573",14,16,2,1],["#ffdbac",16,16,4,1],["#e69a82",20,16,1,1],["#fff0c5",21,16,7,1],["#e69a82",28,16,2,1],["#ffdbac",30,16,3,1],["#bf8573",33,16,2,1],["#bf8573",10,17,6,1],["#ffdbac",16,17,4,1],["#e69a82",20,17,1,1],["#fff0c5",21,17,7,1],["#e69a82",28,17,2,1],["#ffdbac",30,17,3,1],["#bf8573",33,17,6,1],["#bf8573",10,18,2,1],["#e69a82",12,18,1,1],["#ffdbac",13,18,7,1],["#e69a82",20,18,1,1],["#fff0c5",21,18,6,1],["#e69a82",27,18,2,1],["#ffdbac",29,18,7,1],["#e69a82",36,18,1,1],["#bf8573",37,18,2,1],["#bf8573",10,19,2,1],["#e69a82",12,19,1,1],["#ffdbac",13,19,7,1],["#e69a82",20,19,1,1],["#fff0c5",21,19,6,1],["#e69a82",27,19,2,1],["#ffdbac",29,19,7,1],["#e69a82",36,19,1,1],["#bf8573",37,19,2,1],["#bf8573",10,20,2,1],["#e69a82",12,20,1,1],["#ffdbac",13,20,7,1],["#e69a82",20,20,1,1],["#fff0c5",21,20,6,1],["#e69a82",27,20,2,1],["#ffdbac",29,20,7,1],["#e69a82",36,20,1,1],["#bf8573",37,20,2,1],["#bf8573",10,21,2,1],["#e69a82",12,21,1,1],["#ffdbac",13,21,7,1],["#e69a82",20,21,2,1],["#fff0c5",22,21,5,1],["#e69a82",27,21,2,1],["#ffdbac",29,21,7,1],["#e69a82",36,21,1,1],["#bf8573",37,21,2,1],["#a86b66",10,22,3,1],["#e69a82",13,22,2,1],["#ffdbac",15,22,6,1],["#e69a82",21,22,1,1],["#fff0c5",22,22,5,1],["#e69a82",27,22,2,1],["#ffdbac",29,22,6,1],["#e69a82",35,22,2,1],["#a86b66",37,22,2,1],["#a86b66",11,23,2,1],["#e69a82",13,23,3,1],["#ffdbac",16,23,5,1],["#e69a82",21,23,1,1],["#fff0c5",22,23,5,1],["#e69a82",27,23,1,1],["#ffdbac",28,23,6,1],["#e69a82",34,23,2,1],["#a86b66",36,23,2,1],["#a86b66",11,24,3,1],["#e69a82",14,24,3,1],["#ffdbac",17,24,5,1],["#fff0c5",22,24,4,1],["#e69a82",26,24,2,1],["#ffdbac",28,24,6,1],["#e69a82",34,24,1,1],["#a86b66",35,24,3,1],["#a86b66",12,25,2,1],["#e69a82",14,25,4,1],["#ffdbac",18,25,4,1],["#e69a82",22,25,1,1],["#fff0c5",23,25,3,1],["#e69a82",26,25,2,1],["#ffdbac",28,25,5,1],["#e69a82",33,25,2,1],["#a86b66",35,25,2,1],["#a86b66",12,26,3,1],["#e69a82",15,26,4,1],["#ffdbac",19,26,4,1],["#fff0c5",23,26,3,1],["#e69a82",26,26,2,1],["#ffdbac",28,26,3,1],["#e69a82",31,26,3,1],["#a86b66",34,26,3,1],["#a86b66",13,27,3,1],["#e69a82",16,27,6,1],["#ffdbac",22,27,1,1],["#fff0c5",23,27,3,1],["#e69a82",26,27,1,1],["#ffdbac",27,27,3,1],["#e69a82",30,27,3,1],["#a86b66",33,27,3,1],["#a86b66",14,28,3,1],["#e69a82",17,28,10,1],["#ffdbac",27,28,1,1],["#e69a82",28,28,4,1],["#a86b66",32,28,3,1],["#a86b66",15,29,3,1],["#e69a82",18,29,3,1],["#b46a71",21,29,8,1],["#e69a82",29,29,2,1],["#a86b66",31,29,3,1],["#a86b66",16,30,4,1],["#e69a82",20,30,1,1],["#b46a71",21,30,8,1],["#e69a82",29,30,1,1],["#a86b66",30,30,3,1],["#a86b66",17,31,5,1],["#b46a71",22,31,5,1],["#a86b66",27,31,5,1],["#bc9475",15,32,4,1],["#a86b66",19,32,11,1],["#bc9475",30,32,7,1],["#bc9475",15,33,5,1],["#a86b66",20,33,9,1],["#bc9475",29,33,8,1],["#bc9475",15,34,22,1],["#bc9475",19,35,13,1],["#bc9475",19,36,13,1]];
const pintarPecaPraiaCanonica = (pincel, _peca, x, y) => { for (const [cor, u, v, w, h] of matrizConchaPraia) pincel(cor, x+u, y+v,w,h); };

const CORES_ORIGINAIS = ['#bf8573', '#fff0c5', '#ffdbac', '#e69a82', '#a86b66', '#b46a71', '#bc9475']         ;
                                                                                  

// Mesma ordem dos tons aprovados: contorno, luz, face clara, meio,
// nervuras fundas, borda inferior, sombra de contato.
const CONCHAS_DOS_MUNDOS = {
  praia: CORES_ORIGINAIS,
  recifes: ['#7e86a3', '#fff5ed', '#d9ddf2', '#b0b3d5', '#696993', '#8483ad', '#a69ba9'],
  mangue: ['#9d644a', '#fff0b8', '#f2ca84', '#d39b60', '#83513c', '#ab714f', '#a4865b'],
  enseada: ['#83658e', '#fff0e7', '#e0cae8', '#b89bc9', '#73577f', '#956e9d', '#a48caa'],
  deriva: ['#a27a42', '#fff3c6', '#f5ce83', '#ddaf68', '#805b3c', '#bd9358', '#a58a63'],
  grutas: ['#bf83a1', '#fff0f3', '#f7c9dd', '#e698b9', '#a66188', '#b3709b', '#af899f'],
  ressaca: ['#a76556', '#f8d8ae', '#e7a681', '#c88062', '#874a43', '#ab6857', '#a17f73'],
  farol: ['#72719a', '#fff0cb', '#dad3ee', '#b5a1d1', '#605c83', '#8877a8', '#a093b2'],
}                                                      ;
                                                                                 
const MAPAS_DE_TONS = Object.fromEntries(Object.entries(CONCHAS_DOS_MUNDOS).map(([mundo, tons]) =>
  [mundo, new Map(CORES_ORIGINAIS.map((cor, i) => [cor, tons[i]]         ))]))   
                                                                                ;

// Em 48 px compartilha também a origem exata. O render de 32 px conserva
// todos os pixels opacos da concha e remove apenas o vazio das bordas.
function pintarConchaDoMundo(pintar             , mundo               ,
  x        , y        , lado          = 48,
)       {
  const tons = MAPAS_DE_TONS[mundo === 'praia-enseadinha' ? 'praia' : mundo];
  const recuo = lado === 32 ? -8 : 0;
  pintarPecaPraiaCanonica((cor, u, v, l, a) => pintar(tons.get(cor) ?? cor, u, v, l, a),
    'concha', x + recuo, y + recuo);
}

                                                                           
const LUZ = '#fff7e8', AUREO = '#f3dca7';

// Reflexos estáticos externos ao sprite, sem moldura, com o lado do
// cadeado reservado e longe de onde nascem os cantos de movimento.
function pintarBrilhosDoObjetivo(pintar             , x        , y        ,
  tipo                  , lado          = 48, bloqueada = false,
)       {
  const [esq, topo, dir, base] = lado === 48
    ? (tipo === 'ostra-aberta' ? [8, 9, 44, 12] : [10, 11, 40, 25])
    : (tipo === 'concha' ? [4, 7, 29, 18] : [5, 8, 28, 12]);
  const ponto = (u        , v        , cor        ) => pintar(cor, x + u, y + v, 1, 1);
  const cruz = (u        , v        ) => {
    ponto(u - 1, v, AUREO);ponto(u + 1, v, AUREO);
    ponto(u, v - 1, AUREO);ponto(u, v + 1, AUREO);ponto(u, v, LUZ);
  };
  if (tipo === 'ostra-fechada') {
    ponto(esq, topo, LUZ);ponto(esq - 2, topo + 3, AUREO);
    return;
  }
  cruz(esq, topo);
  if (!bloqueada) ponto(dir, base, LUZ);
}

