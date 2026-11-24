import { desenharSiriAnimado, sombraDoSiriAnimada, fendaEscondeSombra, pincelDeCantosSemSiris, mostrarCantosDeDestino } from '@@MARE:modulo:src/render/animacao-visual.mjs@@';
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
  const mostrarCantos = mostrarCantosDeDestino();
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
    if (casa === 'C' && !conchas.has(chave)) arte.pintarPeca(pintar, 'concha', x, y);
    if (mostrarCantos && destinos.has(chave)) pintarDestinoPraia(pintarCanto, x, y, arte.paleta);
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
        (u, v) => arte.pintarPeca(pintar, 'concha', u, v), escuro, luz);
    } else if (casa === 'G' && coletaPerolas(fase)) {
      arte.pintarPeca(pintar, abreOstra ? 'ostra-aberta' : 'ostra-fechada', x, y);
    }
    mecanismos?.pintar(pintar, pos, x, y);
    if (rasante.has(chave) || chave === alvo) arte.pintarPeca(pintar, rasante.has(chave) ? 'garca-imediata' : 'garca-aviso', x, y);
    if (mostrarCantos && siris.length > 1) {
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
