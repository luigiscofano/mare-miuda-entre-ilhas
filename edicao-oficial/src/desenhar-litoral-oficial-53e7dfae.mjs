import { desenharSiriAnimado, sombraDoSiriAnimada, fendaEscondeSombra, pincelDeCantosSemSiris } from '@@MARE:modulo:src/render/animacao-visual.mjs@@';
import { pintarVegetacao } from '@@MARE:modulo:src/posicionar-vegetacao-33409cef.mjs@@';
import { conchasDaEquipe, pintarConchaDaEquipe } from '@@MARE:modulo:src/conchas-da-equipe-910d11c3.mjs@@';
import { entradasDosSiris, preverDirecoesDaEquipe } from '@@MARE:modulo:src/nomes-dos-siris-e97b332f.mjs@@';
import { casasDoRasante, mareAlta, posicoesDosSiris, totalFragmentos } from '@@MARE:modulo:src/formas-de-fenda-70ff4532.mjs@@';
                                                               
import { coletaPerolas, indiceDaPerola } from '@@MARE:modulo:src/coleta-perolas-31bd4890.mjs@@';
import { pintarEspumaDaAreia } from '@@MARE:modulo:src/render/praia-oficial-mar.mjs@@';
import { CASA_PRAIA, ORIGEM_SIRI_PRAIA, chaveDaCasa, marAbertoEm, montarSuperficie, pintarDestinoPraia,
  pintarJuntasPraia, pintarPisoPraia, pintarSombraDoSiri, quadroDaPraia } from '@@MARE:modulo:src/render/praia-oficial-terreno.mjs@@';
                                                                        

                                                            
                                               
                        
                                                                 
                                                                                                      
                                                                           
                                                                                                                                   
                                                                            
                                                                    
                                  
                                                                      
     
   

const PEROLAS = ['perola-creme', 'perola-rosa', 'perola-azul', 'perola-lilas']         ;
                                                                                                                                     
const larguraSiri = 31, alturaSiri = 23;
const SINAIS_SIRIS = [
  ['.x.', 'x.x', '.x.'],
  ['xxx', 'x.x', 'xxx'],
  ['.x.', 'x.x', 'xxx'],
]         ;
const SEM_FECHADOS = new Set        ();

function pintarInsignia(pintar        , i        , x        , y        , paleta               )       {
  pintar(paleta.destino, x, y, 7, 5);
  SINAIS_SIRIS[i].forEach((fila, dy) => [...fila].forEach((c, dx) => {
    if (c === 'x') pintar(paleta.seca[1], x + 2 + dx, y + 1 + dy, 1, 1);
  }));
}

function pintarSiri(ctx                          , logo                  ,
  fauna                              , i        , x        , y        )       {
  if (i === 0 && logo.complete && logo.naturalWidth === 180 && logo.naturalHeight === 94) {
    desenharSiriAnimado(ctx, logo, 75, 3, larguraSiri, alturaSiri, x, y, i);
  } else if (i > 0 && fauna?.complete && fauna.naturalWidth === larguraSiri * 5 && fauna.naturalHeight === alturaSiri) {
    desenharSiriAnimado(ctx, fauna, i * larguraSiri, 0, larguraSiri, alturaSiri, x, y, i);
  }
}

// Separam-se paletas e peças da ordem de desenho. Cada pixel segue o estado
// vivo do motor, nunca um quadro ou uma posição de jogo pré-renderizada.
export function desenharLitoralOficial           (ctx                          , fase      ,
  estado        , logo                  , fauna                              , arte                        )       {
  const { mapa } = fase;
  const mundoConcha = fase.id.startsWith('recife') ? 'recifes' : 'praia';
  const conchaDoTile = (p, x, y, bloqueada = false) => { pintarConchaDoMundo(p, mundoConcha, x, y); pintarBrilhosDoObjetivo(p, x, y, 'concha', 48, bloqueada); };
  const quadro = quadroDaPraia(mapa);
  const { origemX, origemY } = quadro;
  const alta = mareAlta(estado.passos);
  const jogando = estado.situacao === 'jogando';
  const siris = posicoesDosSiris(estado);
  const ocupadas = new Set(siris.map(chaveDaCasa));
  const conchas = conchasDaEquipe(fase, estado);
  const destinos = entradasDosSiris(jogando ? preverDirecoesDaEquipe(fase, estado) : []);
  const rasante = new Set(jogando ? casasDoRasante(fase, estado.passos + 1).map(chaveDaCasa) : []);
  const ameaca = fase.ameaca;
  const alvo = jogando && ameaca && !ameaca.rasante && !ameaca.rota?.length ? chaveDaCasa(ameaca.alvo) : '';
  const fragmentos = new Set(estado.fragmentos.map(chaveDaCasa));
  const abreOstra = estado.fragmentos.length >= totalFragmentos(fase);
  const mecanismos = arte.mecanismos?.(fase, estado, alta);
  const fechados = mecanismos?.fechados ?? SEM_FECHADOS;
  const mapaDaTextura = fechados.size === 0 ? mapa : mapa.map((fila, linha) => [...fila].map((c, coluna) =>
    fechados.has(chaveDaCasa({ coluna, linha })) ? '#' : c).join(''));
  const tela = montarSuperficie(quadro);
  const { pintar } = tela;
  const pintarCanto = pincelDeCantosSemSiris(pintar, siris, origemX, origemY, ORIGEM_SIRI_PRAIA);
  const estruturas = arte.compor(fase, quadro);
  arte.pintarMar(pintar, fase, quadro, estruturas);
  arte.pintarEstruturas(pintar, estruturas);
  const percorrer = (operacao                                                                           ) =>
    mapa.forEach((fila, linha) => [...fila].forEach((casa, coluna) => {
      if (casa !== '#') operacao(casa, chaveDaCasa({ linha, coluna }),
        origemX + coluna * CASA_PRAIA, origemY + linha * CASA_PRAIA, { linha, coluna });
    }));
  percorrer((casa, chave, x, y, { coluna, linha }) => {
    const fechada = fechados.has(chave);
    pintarPisoPraia(pintar, mapa, quadro, alta, coluna, linha, ocupadas.has(chave), arte.paleta, fechada);
    if (fechada || (alta && casa === '=')) return;
    if (casa === 'H') arte.pintarPeca(pintar, 'banco', x, y);
    if (casa === 'C' && !conchas.has(chave)) conchaDoTile(pintar, x, y);
    if (destinos.has(chave)) pintarDestinoPraia(pintarCanto, x, y, arte.paleta);
  });
  pintarJuntasPraia(tela, mapa, quadro, alta, arte.paleta, mapaDaTextura);
  pintarVegetacao(pintar, fase, quadro.origemX, quadro.origemY, 48, (coluna, linha) => {
    const chave = chaveDaCasa({ coluna, linha });
    return ocupadas.has(chave) || rasante.has(chave) || destinos.has(chave);
  });
  percorrer((casa, chave, x, y, pos) => {
    if (casa === 'B' && !fragmentos.has(chave)) {
      const i = indiceDaPerola(fase, pos);
      if (i !== undefined) arte.pintarPeca(pintar, PEROLAS[i % PEROLAS.length], x, y);
    }
    const alvoDaEquipe = conchas.get(chave);
    if (alvoDaEquipe) {
      const escuro = arte.paleta.destino, luz = arte.paleta.seca[1];
      pintarConchaDaEquipe(pintar, alvoDaEquipe, x, y, CASA_PRAIA,
        (u, v) => conchaDoTile(pintar, u, v, alvoDaEquipe.bloqueada), escuro, luz);
    } else if (casa === 'G' && coletaPerolas(fase)) {
      arte.pintarPeca(pintar, abreOstra ? 'ostra-aberta' : 'ostra-fechada', x, y);
      pintarBrilhosDoObjetivo(pintar, x, y, abreOstra ? 'ostra-aberta' : 'ostra-fechada');
    }
    mecanismos?.pintar(pintar, pos, x, y);
    if (rasante.has(chave) || chave === alvo) arte.pintarPeca(pintar, rasante.has(chave) ? 'garca-imediata' : 'garca-aviso', x, y);
    if (siris.length > 1) {
      for (const i of destinos.get(chave) ?? []) pintarInsignia(pintar, i, x + 10 + 13 * i, y + 39, arte.paleta);
    }
  });
  const permiteEspuma = (x        , y        ) => marAbertoEm(tela, x, y, arte.paleta);
  pintarEspumaDaAreia(pintar, permiteEspuma, mapa, quadro, alta, arte.paleta, fechados);
  arte.pintarEspumaDasEstruturas(pintar, estruturas, permiteEspuma);
  const posicoes = siris.map(({ coluna, linha }, i) => {
    const x = origemX + coluna * CASA_PRAIA + ORIGEM_SIRI_PRAIA[0];
    const y = origemY + linha * CASA_PRAIA + ORIGEM_SIRI_PRAIA[1];
    if (!fendaEscondeSombra(i)) pintarSombraDoSiri(pintar, ...sombraDoSiriAnimada(x, y, i), mapa[linha][coluna] === '=', alta, arte.paleta);
    if (siris.length > 1) pintarInsignia(pintar, i, x + 12, y - 7, arte.paleta);
    return [x, y]         ;
  });
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.imageSmoothingEnabled = false;
  tela.desenhar(ctx);
  posicoes.forEach(([x, y], i) => pintarSiri(ctx, logo, fauna, i, x, y));
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

