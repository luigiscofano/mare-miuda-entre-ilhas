import { crescimentoDeFiletesNaBase } from '@@MARE:modulo:src/render/animacao-visual.mjs@@';
import { desenharSiriAnimado, sombraDoSiriAnimada, fendaEscondeSombra, pincelDeCantosSemSiris } from '@@MARE:modulo:src/render/animacao-visual.mjs@@';
import { pintarVegetacao } from '@@MARE:modulo:src/posicionar-vegetacao-33409cef.mjs@@';
import { pintarVisitaDaPraia, comporVisitasDaPraia } from '@@MARE:modulo:src/nomes-das-rochas-6e85a20e.mjs@@';
import { conchasDaEquipe, pintarConchaDaEquipe } from '@@MARE:modulo:src/conchas-da-equipe-910d11c3.mjs@@';
import { entradasDosSiris, preverDirecoesDaEquipe } from '@@MARE:modulo:src/nomes-dos-siris-e97b332f.mjs@@';
import { coletaPerolas, indiceDaPerola } from '@@MARE:modulo:src/coleta-perolas-31bd4890.mjs@@';
import { bocaSubmersa, casasDoRasante, fendaAtiva, mareAlta, posicoesDosSiris, totalFragmentos } from '@@MARE:modulo:src/formas-de-fenda-70ff4532.mjs@@';
                                                               
import { CENARIOS_ENSEADA } from '@@MARE:modulo:src/cenarios-enseada-c0cdd41e.mjs@@';
import { costaAprovada, larguraDaCostaOriginal } from '@@MARE:modulo:src/largura-da-costa-original-5a70c2b7.mjs@@';
import { cristasSoltasDaEnseada, pintarTraçosDoMar, reencaixarCenario } from '@@MARE:modulo:src/render/encaixe-costeiro.mjs@@';
import { pintarEspumaDaAreia } from '@@MARE:modulo:src/render/praia-oficial-mar.mjs@@';
import { pintarPecaEnseada } from '@@MARE:modulo:src/pintar-peca-enseada-7af0f0ca.mjs@@';
                                                              
import { CASA_PRAIA, ORIGEM_SIRI_PRAIA, chaveDaCasa, marAbertoEm, montarSuperficie, pintarJuntasPraia,
  pintarPisoPraia, pintarSombraDoSiri, quadroDaPraia } from '@@MARE:modulo:src/render/praia-oficial-terreno.mjs@@';
                                                                

export const PALETA_ENSEADA                = {
  mar: '#142e47', reflexoMar: '#416f90',
  aguaRasa: ['#527c9a', '#719ab1', '#8fb6c7', '#365e80', '#a7c6d7'],
  seca: ['#eadaba', '#fff0d9', '#b49b79', '#eedfc5', '#d4bf9f'],
  molhada: ['#b29e8b', '#c5ad98', '#8c786e', '#bca58f', '#9a8777'],
  graos: ['#a58464', '#b89978'],
  juntaSeca: ['#c5aa88', '#efddbd'], juntaMolhada: ['#8e786b', '#cfba9d'],
  umidade: ['#c6ad8a', '#dec7a3', '#ab9179'],
  sombraSeca: ['#c8ac89', '#aa8b68'], sombraMolhada: ['#958371', '#7e6a60'],
  sombraSubmersa: ['#496f8b', '#315b7c'], espuma: ['#9ac3dc', '#f4f4ef'],
  destino: '#295574', graoJuntoDaBorda: true,
};

const TRAÇOS_DO_MAR = [PALETA_ENSEADA.reflexoMar, ...PALETA_ENSEADA.espuma]         ;
const PEROLAS = ['perola-creme', 'perola-rosa', 'perola-azul', 'perola-lilas']         ;
const INSIGNIAS = ['insignia-coral', 'insignia-verde', 'insignia-amarelo']         ;

// Cenário e peças são o kit homologado; maré, elementos, recortes e indicações
// são calculados a cada desenho. Nenhum PNG de tabuleiro é carregado.
export function desenharEnseadaOficial(ctx                          , fase      , estado        ,
  logo                  , fauna                   )       {
  const { mapa } = fase;
  const conchaDoTile = (p, x, y, bloqueada = false) => { pintarConchaDoMundo(p, 'enseada', x, y); pintarBrilhosDoObjetivo(p, x, y, 'concha', 48, bloqueada); };
  const quadro = quadroDaPraia(mapa);
  const { origemX, origemY, largura, altura } = quadro;
  const tela = montarSuperficie(quadro);
  const { pintar } = tela;
  const alta = mareAlta(estado.passos);
  const siris = posicoesDosSiris(estado);
  const pintarCanto = pincelDeCantosSemSiris(pintar, siris, origemX, origemY, ORIGEM_SIRI_PRAIA);
  const ocupadas = new Set(siris.map(chaveDaCasa));
  const conchas = conchasDaEquipe(fase, estado);
  const jogando = estado.situacao === 'jogando';
  const previsoes = jogando ? preverDirecoesDaEquipe(fase, estado) : [];
  const entradas = entradasDosSiris(previsoes);
  const bocas = new Map                     ();
  for (const fenda of fase.fendas ?? []) {
    const ativa = fendaAtiva(fase, fenda, estado.passos) ? 1 : 0;
    for (const boca of fenda.bocas) {
      if (!bocaSubmersa(fase, boca, estado.passos))
        bocas.set(chaveDaCasa(boca), `fenda-${fenda.forma}-${ativa}`);
    }
  }
  const saidas = new Map                 ();
  for (const { movimentos } of previsoes) for (const m of movimentos) {
    if ('destino' in m && m.fenda) {
      const chave = chaveDaCasa(m.destino);
      saidas.set(chave, Boolean(saidas.get(chave) || m.saidaVaiAlagar));
    }
  }
  const ameaca = fase.ameaca;
  const aviso = jogando && ameaca && !ameaca.rasante && !ameaca.rota?.length
    ? chaveDaCasa(ameaca.alvo) : undefined;
  const rasante = new Set(jogando ? casasDoRasante(fase, estado.passos + 1).map(chaveDaCasa) : []);
  const coletadas = new Set(estado.fragmentos.map(chaveDaCasa));
  const abreOstra = coletadas.size >= totalFragmentos(fase);

  pintar(PALETA_ENSEADA.mar, 0, 0, largura, altura);
  const original = CENARIOS_ENSEADA[fase.id];
  const larguraAnterior = larguraDaCostaOriginal(fase.id);
  const mudouCosta = original && larguraAnterior !== undefined && !costaAprovada(fase.id, mapa);
  const cenario = mudouCosta ? reencaixarCenario(original, mapa, quadro, Math.max(394, larguraAnterior * CASA_PRAIA + 104))
    : original;
  const rochas = cenario?.rochas ?? [];
  const visitas = comporVisitasDaPraia(fase.id, { largura, altura, inicioDaGrade: origemX,
    fimDaGrade: origemX + mapa[0].length * CASA_PRAIA }, rochas.map(([rocha, x, y]) => ({
    x, y, largura: CASA_PRAIA, altura: CASA_PRAIA,
    preservar: rocha.startsWith('garca-na-'),
  })));
  // Em Vigia em dupla, inverte as duas peças pedidas no mesmo eixo visual.
  // O espigão tem 96 px e a garça 48 px; igualar os centros mantém as margens.
  const trocaPedras = fase.id === 'enseada-dupla-vigia' ? (() => {
    const garca = rochas.findIndex(([nome]) => nome === 'garca-no-trio');
    const espigao = visitas.findIndex(item => item.peca === 'espigao' && item.indice >= rochas.length);
    if (garca < 0 || espigao < 0) return;
    const [, x, y] = rochas[garca];
    const peca = visitas[espigao];
    const dx = peca.x - x, dy = peca.y + (peca.altura - CASA_PRAIA) / 2 - y;
    const novasRochas = rochas.map(([nome, u, v], i) => i === garca ? [nome, u + dx, v + dy] : [nome, u, v]);
    const novasVisitas = visitas.map((p, i) => i !== espigao ? p : {
      ...p, x, y: y + (CASA_PRAIA - peca.altura) / 2,
    });
    return { antigas: { x, y }, dx, dy, novasRochas, novasVisitas };
  })() : undefined;
  const rochasNaCosta = trocaPedras?.novasRochas ?? rochas;
  const visitasNaCosta = trocaPedras?.novasVisitas ?? visitas;
  const visita = visitasNaCosta.find(item => item.indice < rochas.length);
  const tracosDoMar = [...(cenario?.mar ?? []),
    ...(cenario ? cristasSoltasDaEnseada(mapa, quadro, cenario) : [])];
  pintarTraçosDoMar(pintar, afastarEspumaDosBicos(tracosDoMar, rochasNaCosta, visita?.indice), TRAÇOS_DO_MAR);
  rochasNaCosta.forEach(([rocha, x, y], i) => {
    if (i === visita?.indice) pintarVisitaDaPraia(pintar, visita, PALETA_ENSEADA.espuma);
    else pintarPecaEnseada(pintar, rocha, x, y);
  });
  for (const nova of visitasNaCosta.filter(item => item.indice >= rochas.length))
    pintarVisitaDaPraia(pintar, nova, PALETA_ENSEADA.espuma);

  const percorrer = (acao                                                                         ) =>
    mapa.forEach((fila, linha) => [...fila].forEach((c, coluna) => {
      const casa = { coluna, linha };
      if (c !== '#') acao(c, casa, chaveDaCasa(casa), origemX + coluna * CASA_PRAIA, origemY + linha * CASA_PRAIA);
    }));
  percorrer((c, casa, chave, x, y) => {
    pintarPisoPraia(pintar, mapa, quadro, alta, casa.coluna, casa.linha, ocupadas.has(chave), PALETA_ENSEADA);
    if (c === '=' && alta) return;
    if (c === 'H') pintarPecaEnseada(pintar, 'refugio-elevado', x, y);

  });
  pintarJuntasPraia(tela, mapa, quadro, alta, PALETA_ENSEADA, mapa, new Set(bocas.keys()));
  pintarVegetacao(pintar, fase, quadro.origemX, quadro.origemY, 48, (coluna, linha) => {
    const chave = chaveDaCasa({ coluna, linha });
    return ocupadas.has(chave) || rasante.has(chave) || entradas.has(chave);
  });
  percorrer((c, casa, chave, x, y) => {
    if (c === 'C' && !conchas.has(chave)) conchaDoTile(pintar, x, y);
    const boca = bocas.get(chave);
    if (boca) pintarPecaEnseada(pintar, boca, x, y);
    if (c === 'B' && !coletadas.has(chave)) {
      const indice = indiceDaPerola(fase, casa);
      if (indice !== undefined) pintarPecaEnseada(pintar, PEROLAS[indice % PEROLAS.length], x, y);
    }
    const alvoDaEquipe = conchas.get(chave);
    if (!alvoDaEquipe && c === 'G' && coletaPerolas(fase)) {
      pintarPecaEnseada(pintar, abreOstra ? 'ostra-aberta' : 'ostra-fechada', x, y);
      pintarBrilhosDoObjetivo(pintar, x, y, abreOstra ? 'ostra-aberta' : 'ostra-fechada');
    }
    if (alvoDaEquipe) {
      pintarConchaDaEquipe(pintar, alvoDaEquipe, x, y, CASA_PRAIA,
        (u, v) => conchaDoTile(pintar, u, v, alvoDaEquipe.bloqueada), PALETA_ENSEADA.destino, PALETA_ENSEADA.seca[1]);
    }
    if (rasante.has(chave) || aviso === chave)
      pintarPecaEnseada(pintar, rasante.has(chave) ? 'rasante' : 'aviso', x, y);
    const elegiveis = entradas.get(chave);
    if (elegiveis) {
      const bits = siris.length > 1 ? Array.from(elegiveis).reduce((m, i) => m | 1 << i, 0) : 0;
      pintarPecaEnseada(pintarCanto, `cantos-${bits                                 }`, x, y);
    }
    const alaga = saidas.get(chave);
    if (alaga !== undefined) pintarPecaEnseada(pintar, alaga ? 'saida-fenda-1' : 'saida-fenda-0', x, y);
  });

  const podePintarEspuma = (x        , y        ) => marAbertoEm(tela, x, y, PALETA_ENSEADA);
  const espuma = (faixas,dasRochas=false) => {
    for (const [x, y, l, tinta] of faixas) for (let dx = 0; dx < l; dx++) {
      if (podePintarEspuma(x + dx, y)) pintar(PALETA_ENSEADA.espuma[tinta], x + dx, y, 1, 1);
    }
    const permite=podePintarEspuma;
    if(dasRochas)for(const [a,b,t] of crescimentoDeFiletesNaBase(faixas,rochasNaCosta.map(([nome,x,y])=>({x,y,altura:/espigao|tres-em-pe/.test(nome)?96:48})),permite))
      if(permite(a,b))pintar(PALETA_ENSEADA.espuma[t==='w'?1:0],a,b,1,1);
  };
  if (mudouCosta) pintarEspumaDaAreia(pintar, podePintarEspuma, mapa, quadro, alta, PALETA_ENSEADA);
  else for (const [coluna, linha, faixas] of cenario?.beira ?? []) {
    if (!alta || mapa[linha][coluna] !== '=') espuma(faixas);
  }
  const substituida = visita && rochasNaCosta[visita.indice];
  const faixasDasRochas = (cenario?.espumaDasRochas ?? []).map(([x, y, l, tinta]) => {
    if (!trocaPedras) return [x, y, l, tinta];
    const antiga = trocaPedras.antigas;
    return x + l >= antiga.x - 2 && x <= antiga.x + CASA_PRAIA + 2
      && y >= antiga.y + CASA_PRAIA / 2 && y <= antiga.y + CASA_PRAIA + 8
      ? [x + trocaPedras.dx, y + trocaPedras.dy, l, tinta] : [x, y, l, tinta];
  });
  espuma(faixasDasRochas.filter(([x, y, l]) => !substituida ||
    x + l < substituida[1] - 2 || x > substituida[1] + CASA_PRAIA + 2 ||
    y < substituida[2] + CASA_PRAIA / 2 || y > substituida[2] + CASA_PRAIA + 8),true);
  const corte = siris.map(({ coluna, linha }, i) => {
    const x = origemX + coluna * CASA_PRAIA, y = origemY + linha * CASA_PRAIA;
    if (siris.length > 1) pintarPecaEnseada(pintar, INSIGNIAS[i], x, y);
    const px = x + ORIGEM_SIRI_PRAIA[0], py = y + ORIGEM_SIRI_PRAIA[1];
    if (!fendaEscondeSombra(i)) pintarSombraDoSiri(pintar, ...sombraDoSiriAnimada(px, py, i), mapa[linha][coluna] === '=', alta, PALETA_ENSEADA);
    return [px, py]         ;
  });

  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.imageSmoothingEnabled = false;
  tela.desenhar(ctx);
  corte.forEach(([x, y], i) => {
    if (i === 0 && logo.complete && logo.naturalWidth === 180 && logo.naturalHeight === 94)
      desenharSiriAnimado(ctx, logo, 75, 3, 31, 23, x, y, i);
    else if (i > 0 && fauna?.complete && fauna.naturalWidth === 155 && fauna.naturalHeight === 23)
      desenharSiriAnimado(ctx, fauna, i * 31, 0, 31, 23, x, y, i);
  });
  ctx.restore();
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


// A espuma do mar usa tintas 1/2. Os reflexos (0), a espuma das margens,
// as pedras e a própria arte das aves continuam nos seus passes originais.
const FOLGA_DO_BICO = 4;
const separacaoDaFaixa = (a, b) => Math.max(
  0, a[0] - (b[0] + b[2] - 1), b[0] - (a[0] + a[2] - 1),
  a[1] - (b[1] + b[3] - 1), b[1] - (a[1] + a[3] - 1),
);

function afastarEspumaDosBicos(tracos, rochas, indiceSubstituido) {
  const bicos = [];
  rochas.forEach(([nome, x, y], i) => {
    if (i === indiceSubstituido || !nome.startsWith('garca-')) return;
    pintarPecaEnseada((cor, u, v, l, a) => {
      // O ocre é exclusivo do bico. Usa os pixels originais, sem desmontar a ave.
      if (cor === '#d6b985')
        for (let j = v; j < v + a; j++) for (let k = u; k < u + l; k++) bicos.push([k, j, 1, 1]);
    }, nome, x, y);
  });
  if (!bicos.length) return tracos;
  const candidatas = tracos.filter(f => f[4] === 1 || f[4] === 2);
  const remover = new Set();
  for (const faixa of candidatas) {
    if (bicos.some(b => separacaoDaFaixa(faixa, b) <= FOLGA_DO_BICO))
      remover.add(faixa);
  }
  // Uma crista pixelada costuma ter uma crista clara e um pé azul.
  // Retira todo o grupo encostado, não só a sua parte branca.
  for (const faixa of remover) {
    for (const candidata of candidatas) {
      if (!remover.has(candidata) && separacaoDaFaixa(faixa, candidata) <= 2)
        remover.add(candidata);
    }
  }
  return tracos.filter(faixa => !remover.has(faixa));
}
