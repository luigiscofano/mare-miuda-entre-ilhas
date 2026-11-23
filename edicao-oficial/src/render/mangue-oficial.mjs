import { crescimentoDeFiletesNaBase } from '@@MARE:modulo:src/render/animacao-visual.mjs@@';
import { desenharSiriAnimado, sombraDoSiriAnimada, fendaEscondeSombra, pincelDeCantosSemSiris } from '@@MARE:modulo:src/render/animacao-visual.mjs@@';
import { pintarVegetacao } from '@@MARE:modulo:src/posicionar-vegetacao-33409cef.mjs@@';
import { pintarVisitaDaPraia, comporVisitasDaPraia } from '@@MARE:modulo:src/nomes-das-rochas-6e85a20e.mjs@@';
import { conchasDaEquipe, pintarConchaDaEquipe } from '@@MARE:modulo:src/conchas-da-equipe-910d11c3.mjs@@';
import { entradasDosSiris, preverDirecoesDaEquipe } from '@@MARE:modulo:src/nomes-dos-siris-e97b332f.mjs@@';
import { coletaPerolas, indiceDaPerola } from '@@MARE:modulo:src/coleta-perolas-31bd4890.mjs@@';
import { casasDoRasante, mareAlta, posicoesDosSiris, totalFragmentos } from '@@MARE:modulo:src/formas-de-fenda-70ff4532.mjs@@';
                                                               
import { CENARIOS_MANGUE } from '@@MARE:modulo:src/cenarios-mangue-9f01654f.mjs@@';
import { costaAprovada, larguraDaCostaOriginal } from '@@MARE:modulo:src/largura-da-costa-original-5a70c2b7.mjs@@';
import { pintarTraçosDoMar, reencaixarCenario } from '@@MARE:modulo:src/render/encaixe-costeiro.mjs@@';
import { pintarEspumaDaAreia } from '@@MARE:modulo:src/render/praia-oficial-mar.mjs@@';
import { pintarPecaMangue } from '@@MARE:modulo:src/pintar-peca-mangue-dda9fec3.mjs@@';
                                                            
import { CASA_PRAIA, ORIGEM_SIRI_PRAIA, chaveDaCasa, marAbertoEm, montarSuperficie, pintarJuntasPraia,
  pintarPisoPraia, pintarSombraDoSiri, quadroDaPraia } from '@@MARE:modulo:src/render/praia-oficial-terreno.mjs@@';
                                                                

export const PALETA_MANGUE                = {
  mar: '#142e47', reflexoMar: '#386055',
  aguaRasa: ['#41665a', '#639085', '#75a095', '#355b50', '#9cbbad'],
  seca: ['#e1b873', '#edcb8c', '#ad8049', '#e7bd79', '#d7a965'],
  molhada: ['#91765d', '#a08466', '#735c4b', '#9b8167', '#836954'],
  graos: ['#ac7943', '#bd8a4d'],
  juntaSeca: ['#c59656', '#e8c386'], juntaMolhada: ['#725946', '#ad906d'],
  umidade: ['#ba985e', '#cca76d', '#986d46'],
  sombraSeca: ['#ba8b52', '#9e7147'], sombraMolhada: ['#78614e', '#6d5240'],
  sombraSubmersa: ['#3d6358', '#2c5147'], espuma: ['#91bbc4', '#e9f2e8'],
  destino: '#2e6259', graoJuntoDaBorda: true,
};

const TRAÇOS_DO_MAR = [PALETA_MANGUE.reflexoMar, ...PALETA_MANGUE.espuma]         ;
const PEROLAS = ['perola-creme', 'perola-rosa', 'perola-azul', 'perola-lilas']         ;
const INSIGNIAS = ['insignia-coral', 'insignia-verde', 'insignia-amarelo']         ;

// T continua sendo um alvo de chegada; a concha da equipe tem prioridade.
function marcadorDeRaiz(siris, celula, casa) {
  if (celula !== 'T') return;
  return siris.some(siri => chaveDaCasa(siri) === chaveDaCasa(casa)) ? 't-1-0' : 't-0-0';
}

// Cenário e peças são o kit homologado; maré, elementos, recortes e indicações
// são calculados a cada desenho. Nenhum PNG de tabuleiro é carregado.
export function desenharMangueOficial(ctx                          , fase      , estado        ,
  logo                  , fauna                   )       {
  const { mapa } = fase;
  const conchaDoTile = (p, x, y, bloqueada = false) => { pintarConchaDoMundo(p, 'mangue', x, y); pintarBrilhosDoObjetivo(p, x, y, 'concha', 48, bloqueada); };
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
  const entradas = entradasDosSiris(jogando ? preverDirecoesDaEquipe(fase, estado) : []);
  const rasante = new Set(jogando ? casasDoRasante(fase, estado.passos + 1).map(chaveDaCasa) : []);
  const coletadas = new Set(estado.fragmentos.map(chaveDaCasa));
  const abreOstra = coletadas.size >= totalFragmentos(fase);

  pintar(PALETA_MANGUE.mar, 0, 0, largura, altura);
  const original = CENARIOS_MANGUE[fase.id];
  const larguraAnterior = larguraDaCostaOriginal(fase.id);
  const mudouCosta = original && larguraAnterior !== undefined && !costaAprovada(fase.id, mapa);
  const cenario = mudouCosta ? reencaixarCenario(original, mapa, quadro, Math.max(394, larguraAnterior * CASA_PRAIA + 104))
    : original;
  pintarTraçosDoMar(pintar, cenario?.mar ?? [], TRAÇOS_DO_MAR);
  const rochas = cenario?.rochas ?? [];
  const visitas = comporVisitasDaPraia(fase.id, { largura, altura, inicioDaGrade: origemX,
    fimDaGrade: origemX + mapa[0].length * CASA_PRAIA }, rochas.map(([rocha, x, y]) => ({
    x, y, largura: CASA_PRAIA, altura: CASA_PRAIA,
    preservar: rocha === 'rocha-de-raizes' || rocha === 'raizes-baixas',
  })));
  const visita = visitas.find(item => item.indice < rochas.length);
  rochas.forEach(([rocha, x, y], i) => {
    if (i === visita?.indice) pintarVisitaDaPraia(pintar, visita, PALETA_MANGUE.espuma);
    else pintarPecaMangue(pintar, rocha, x, y);
  });
  for (const nova of visitas.filter(item => item.indice >= rochas.length))
    pintarVisitaDaPraia(pintar, nova, PALETA_MANGUE.espuma);

  const percorrer = (acao                                                                         ) =>
    mapa.forEach((fila, linha) => [...fila].forEach((c, coluna) => {
      const casa = { coluna, linha };
      if (c !== '#') acao(c, casa, chaveDaCasa(casa), origemX + coluna * CASA_PRAIA, origemY + linha * CASA_PRAIA);
    }));
  percorrer((c, casa, chave, x, y) => {
    pintarPisoPraia(pintar, mapa, quadro, alta, casa.coluna, casa.linha, ocupadas.has(chave), PALETA_MANGUE);
    if (c === '=' && alta) return;
    if (c === 'H') pintarPecaMangue(pintar, 'refugio-elevado', x, y);
    if (c === 'C' && !conchas.has(chave)) conchaDoTile(pintar, x, y);
    if (entradas.has(chave)) pintarPecaMangue(pintarCanto, 'cantos-passo-possivel', x, y);
  });
  pintarJuntasPraia(tela, mapa, quadro, alta, PALETA_MANGUE);
  pintarVegetacao(pintar, fase, quadro.origemX, quadro.origemY, 48, (coluna, linha) => {
    const chave = chaveDaCasa({ coluna, linha });
    return ocupadas.has(chave) || rasante.has(chave) || entradas.has(chave);
  });
  percorrer((c, casa, chave, x, y) => {
    if (c === 'B' && !coletadas.has(chave)) {
      const indice = indiceDaPerola(fase, casa);
      if (indice !== undefined) pintarPecaMangue(pintar, PEROLAS[indice % PEROLAS.length], x, y);
    }
    const alvoDaEquipe = conchas.get(chave);
    if (!alvoDaEquipe && c === 'G' && coletaPerolas(fase)) {
      pintarPecaMangue(pintar, abreOstra ? 'ostra-aberta' : 'ostra-fechada', x, y);
      pintarBrilhosDoObjetivo(pintar, x, y, abreOstra ? 'ostra-aberta' : 'ostra-fechada');
    }
    const raiz = marcadorDeRaiz(siris, c, casa);
    if (raiz && !alvoDaEquipe) pintarPecaMangue(pintar, raiz, x, y);
    if (alvoDaEquipe) {
      pintarConchaDaEquipe(pintar, alvoDaEquipe, x, y, CASA_PRAIA,
        (u, v) => conchaDoTile(pintar, u, v, alvoDaEquipe.bloqueada), PALETA_MANGUE.destino, PALETA_MANGUE.seca[1]);
    }
    if (rasante.has(chave)) pintarPecaMangue(pintar, 'rasante', x, y);
  });

  const podePintarEspuma = (x        , y        ) => marAbertoEm(tela, x, y, PALETA_MANGUE);
  const espuma = (faixas,dasRochas=false) => {
    for (const [x, y, l, tinta] of faixas) for (let dx = 0; dx < l; dx++) {
      if (podePintarEspuma(x + dx, y)) pintar(PALETA_MANGUE.espuma[tinta], x + dx, y, 1, 1);
    }
    const permite=podePintarEspuma;
    if(dasRochas)for(const [a,b,t] of crescimentoDeFiletesNaBase(faixas,rochas.map(([nome,x,y])=>({x,y,altura:/espigao|tres-em-pe/.test(nome)?96:48})),permite))
      if(permite(a,b))pintar(PALETA_MANGUE.espuma[t==='w'?1:0],a,b,1,1);
  };
  if (mudouCosta) pintarEspumaDaAreia(pintar, podePintarEspuma, mapa, quadro, alta, PALETA_MANGUE);
  else for (const [coluna, linha, faixas] of cenario?.beira ?? []) {
    if (!alta || mapa[linha][coluna] !== '=') espuma(faixas);
  }
  const substituida = visita && rochas[visita.indice];
  espuma((cenario?.espumaDasRochas ?? []).filter(([x, y, l]) => !substituida ||
    x + l < substituida[1] - 2 || x > substituida[1] + CASA_PRAIA + 2 ||
    y < substituida[2] + CASA_PRAIA / 2 || y > substituida[2] + CASA_PRAIA + 8),true);
  const corte = siris.map(({ coluna, linha }, i) => {
    const x = origemX + coluna * CASA_PRAIA, y = origemY + linha * CASA_PRAIA;
    if (siris.length > 1) pintarPecaMangue(pintar, INSIGNIAS[i], x, y);
    const px = x + ORIGEM_SIRI_PRAIA[0], py = y + ORIGEM_SIRI_PRAIA[1];
    if (!fendaEscondeSombra(i)) pintarSombraDoSiri(pintar, ...sombraDoSiriAnimada(px, py, i), mapa[linha][coluna] === '=', alta, PALETA_MANGUE);
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

