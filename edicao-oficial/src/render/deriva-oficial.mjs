import { reduzirReflexos } from '@@MARE:modulo:src/selecionar-espalhados-8db16b0e.mjs@@';
import { crescimentoDeFiletesNaBase } from '@@MARE:modulo:src/render/animacao-visual.mjs@@';
import { desenharSiriAnimado, sombraDoSiriAnimada, fendaEscondeSombra, pincelDeCantosSemSiris, mostrarCantosDeDestino, brilhoDaEspuma, apararCristaSolta } from '@@MARE:modulo:src/render/animacao-visual.mjs@@';
import { pintarVegetacao } from '@@MARE:modulo:src/posicionar-vegetacao-33409cef.mjs@@';
import { pintarVisitaDaPraia, comporVisitasDaPraia, rochaComRespiro } from '@@MARE:modulo:src/nomes-das-rochas-6e85a20e.mjs@@';
import { conchasDaEquipe } from '@@MARE:modulo:src/conchas-da-equipe-910d11c3.mjs@@';
import { entradasDosSiris, preverDirecoesDaEquipe } from '@@MARE:modulo:src/nomes-dos-siris-e97b332f.mjs@@';
import { indiceDaPerola } from '@@MARE:modulo:src/coleta-perolas-31bd4890.mjs@@';
import { bocaSubmersa, casasDoRasante, fendaAtiva, mareAlta, posicoesDosSiris, totalFragmentos } from '@@MARE:modulo:src/formas-de-fenda-70ff4532.mjs@@';
                                                               
import { CENARIOS_DERIVA } from '@@MARE:modulo:src/cenarios-deriva-fcc394a9.mjs@@';
import { pintarPecaDeriva } from '@@MARE:modulo:src/pintar-peca-deriva-264f4576.mjs@@';
                                                            
import { CASA_PRAIA, ORIGEM_SIRI_PRAIA, chaveDaCasa, montarSuperficie, pintarJuntasPraia,
  pintarPisoPraia, pintarSombraDoSiri, quadroDaPraia } from '@@MARE:modulo:src/render/praia-oficial-terreno.mjs@@';
                                                                        

const PALETA_DERIVA                = {
  mar: '#142e47', reflexoMar: '#24584f',
  aguaRasa: ['#4a8274', '#6a9d8b', '#8bb2a0', '#397568', '#a0c4ad'],
  seca: ['#e8b77b', '#f3d49a', '#c48754', '#edc388', '#dcaa70'],
  molhada: ['#b68d68', '#d1a77a', '#946a54', '#c0956b', '#a67b59'],
  graos: ['#a56e46', '#b77d4b'],
  juntaSeca: ['#c38d59', '#f0cc95'], juntaMolhada: ['#986b50', '#c8a177'],
  umidade: ['#d0a274', '#e3bb87', '#ac764f'],
  sombraSeca: ['#c99564', '#ab764c'], sombraMolhada: ['#a37d5e', '#896447'],
  sombraSubmersa: ['#417264', '#306459'], espuma: ['#94c1ac', '#e0e9d0'],
  destino: '#34645b', graoJuntoDaBorda: true,
};

// Três tons de reflexo, seguidos do pé jade e da crista clara da espuma solta.
const TRACOS_DO_MAR = ['#24584f', '#2b6257', '#326b60', '#8bbeb1', '#eef0d9']         ;
const AGUA_DO_MAR = new Set                    ([PALETA_DERIVA.mar, ...TRACOS_DO_MAR.slice(0, 3)]);
const PEROLAS = ['perola-creme', 'perola-rosa', 'perola-azul', 'perola-lilas']         ;
const INSIGNIAS = ['insignia-coral', 'insignia-verde', 'insignia-amarelo']         ;

function pintarCadeado(pintar        , x        , y        )       {
  for (const [u, v, l, h] of [[35, 6, 7, 7], [37, 4, 3, 3], [38, 9, 1, 2]])
    pintar('#513f36', x + u, y + v, l, h);
  for (const [u, v, l, h] of [[36, 7, 5, 2], [36, 11, 5, 1], [36, 9, 2, 2], [39, 9, 2, 2]])
    pintar('#e4bb78', x + u, y + v, l, h);
}

// Cenário e peças são o kit homologado; maré, elementos, recortes e indicações
// são calculados a cada desenho. Nenhum PNG de tabuleiro é carregado.
export function desenharDerivaOficial(ctx                          , fase      , estado        ,
  logo                  , fauna                   )       {
  const { mapa } = fase;
  const quadro = quadroDaPraia(mapa);
  const { origemX, origemY, largura, altura } = quadro;
  const tela = montarSuperficie(quadro);
  const { pintar } = tela;
  const alta = mareAlta(estado.passos);
  const siris = posicoesDosSiris(estado);
  const mostrarCantos = mostrarCantosDeDestino();
  const pintarCanto = pincelDeCantosSemSiris(pintar, siris, origemX, origemY, ORIGEM_SIRI_PRAIA);
  const ocupadas = new Set(siris.map(chaveDaCasa));
  const conchas = conchasDaEquipe(fase, estado);
  const jogando = estado.situacao === 'jogando';
  const previsoes = jogando ? preverDirecoesDaEquipe(fase, estado) : [];
  const entradas = entradasDosSiris(previsoes);
  const bocas = new Map                    ();
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

  pintar(PALETA_DERIVA.mar, 0, 0, largura, altura);
  const cenario = CENARIOS_DERIVA[fase.id];
  for (const [x, y, l, a, tinta] of reduzirReflexos(cenario?.mar ?? [], t=>t[4]<3)) {
    const [dx, largura] = tinta === 4 ? apararCristaSolta(x,y,l) : [0,l];
    pintar(TRACOS_DO_MAR[tinta],x+dx,y,largura,a);
  }
  // Uma visita reaproveita o lugar de uma formação, sem tocar a grade ou o mar.
  const rochas = cenario?.rochas ?? [];
  const locais = rochas.map(([nome, x, y]) => ({
    x, y, largura: CASA_PRAIA, altura: nome === 'tres-em-pe-compartilhadas' ? CASA_PRAIA * 2 : CASA_PRAIA,
  }));
  const costa = { largura, altura, inicioDaGrade: origemX, fimDaGrade: origemX + mapa[0].length * CASA_PRAIA };
  const temVisitaOriginal = rochas.some(([nome]) => nome.includes('compartilhad'));
  const visitas = temVisitaOriginal ? [] : comporVisitasDaPraia(fase.id, costa, locais);
  const visita = visitas.find(item => item.indice < rochas.length);
  // As três visitas já incorporadas à arte da Deriva continuam na mesma posição.
  const lajeExtra = temVisitaOriginal ? rochaComRespiro(fase.id, costa, locais, 'bloco', 20) : undefined;
  if (lajeExtra) pintarPecaDeriva(pintar, 'laje-do-canal', lajeExtra.x, lajeExtra.y);
  rochas.forEach(([rocha, x, y], indice) => {
    if (indice === visita?.indice) pintarVisitaDaPraia(pintar, visita, PALETA_DERIVA.espuma);
    else pintarPecaDeriva(pintar, rocha, x, y);
  });
  for (const nova of visitas.filter(item => item.indice >= rochas.length))
    pintarVisitaDaPraia(pintar, nova, PALETA_DERIVA.espuma);

  const percorrer = (acao                                                                         ) =>
    mapa.forEach((fila, linha) => [...fila].forEach((c, coluna) => {
      const casa = { coluna, linha };
      if (c !== '#') acao(c, casa, chaveDaCasa(casa), origemX + coluna * CASA_PRAIA, origemY + linha * CASA_PRAIA);
    }));
  percorrer((c, casa, chave, x, y) => {
    pintarPisoPraia(pintar, mapa, quadro, alta, casa.coluna, casa.linha, ocupadas.has(chave), PALETA_DERIVA);
    if (c === '=' && alta) return;
    if (c === 'H') pintarPecaDeriva(pintar, 'refugio-elevado', x, y);

  });
  pintarJuntasPraia(tela, mapa, quadro, alta, PALETA_DERIVA);
  pintarVegetacao(pintar, fase, quadro.origemX, quadro.origemY, 48, (coluna, linha) => {
    const chave = chaveDaCasa({ coluna, linha });
    return ocupadas.has(chave) || rasante.has(chave) || entradas.has(chave);
  });
  percorrer((c, casa, chave, x, y) => {
    const alvoDaEquipe = conchas.get(chave);
    if (alvoDaEquipe || c === 'C') {
      pintarConchaDoMundo(pintar, 'deriva', x, y);
      pintarBrilhosDoObjetivo(pintar, x, y, 'concha', 48, alvoDaEquipe?.bloqueada);
      if (alvoDaEquipe?.bloqueada) pintarCadeado(pintar, x, y);
    } else if (c === 'G') {
      pintarPecaDeriva(pintar, abreOstra ? 'ostra-aberta' : 'ostra-fechada', x, y);
      pintarBrilhosDoObjetivo(pintar, x, y, abreOstra ? 'ostra-aberta' : 'ostra-fechada');
    }
    const boca = bocas.get(chave);
    if (boca) pintarPecaDeriva(pintar, boca, x, y);
    if (c === 'B' && !coletadas.has(chave)) {
      const indice = indiceDaPerola(fase, casa);
      if (indice !== undefined) pintarPecaDeriva(pintar, PEROLAS[indice % PEROLAS.length], x, y);
    }
    if (rasante.has(chave) || aviso === chave)
      pintarPecaDeriva(pintar, rasante.has(chave) ? 'rasante' : 'aviso', x, y);
    const elegiveis = mostrarCantos ? entradas.get(chave) : undefined;
    if (elegiveis) {
      const bits = siris.length > 1 ? Array.from(elegiveis).reduce((m, i) => m | 1 << i, 0) : 0;
      pintarPecaDeriva(pintarCanto, `cantos-${bits                                 }`, x, y);
    }
    const alaga = saidas.get(chave);
    if (alaga !== undefined) pintarPecaDeriva(pintar, alaga ? 'saida-fenda-1' : 'saida-fenda-0', x, y);
  });

  const espuma = (faixas,dasRochas=false) => {
    for (const [x, y, l, tinta] of faixas) for (let dx = 0; dx < l; dx++) {
      if (AGUA_DO_MAR.has(tela.corEm(x + dx, y))) pintar(PALETA_DERIVA.espuma[dasRochas?tinta:(tinta && brilhoDaEspuma(x,y)!==0 && (dx+y)%7===0 ? 0 : tinta)], x + dx, y, 1, 1);
    }
    const permite=(x,y)=>AGUA_DO_MAR.has(tela.corEm(x,y));
    if(dasRochas)for(const [a,b,t] of crescimentoDeFiletesNaBase(faixas,locais,permite))
      if(permite(a,b))pintar(PALETA_DERIVA.espuma[t==='w'?1:0],a,b,1,1);
  };
  for (const [coluna, linha, faixas] of cenario?.beira ?? []) {
    if (!alta || mapa[linha][coluna] !== '=') espuma(faixas);
  }
  // Remove só o filete da formação substituída; os filetes das outras ficam.
  const anterior = visita && locais[visita.indice];
  espuma((cenario?.espumaDasRochas ?? []).filter(([x, y, l]) => !anterior
    || x + l <= anterior.x - 4 || x >= anterior.x + anterior.largura + 4
    || y < anterior.y || y >= anterior.y + anterior.altura + 4),true);
  const corte = siris.map(({ coluna, linha }, i) => {
    const x = origemX + coluna * CASA_PRAIA, y = origemY + linha * CASA_PRAIA;
    if (siris.length > 1) pintarPecaDeriva(pintar, INSIGNIAS[i], x, y);
    const px = x + ORIGEM_SIRI_PRAIA[0], py = y + ORIGEM_SIRI_PRAIA[1];
    if (!fendaEscondeSombra(i)) pintarSombraDoSiri(pintar, ...sombraDoSiriAnimada(px, py, i), mapa[linha][coluna] === '=', alta, PALETA_DERIVA);
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

