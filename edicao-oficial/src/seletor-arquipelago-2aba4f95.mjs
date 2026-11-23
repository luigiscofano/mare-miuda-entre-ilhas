import { entradaEm, normalizarPosicao, nosDo, rotaLivre, trilhasDo } from '@@MARE:modulo:src/mundo-valido-900be48c.mjs@@';
                                                      
import { prepararTravessia } from '@@MARE:modulo:src/preparar-travessia-c172032e.mjs@@';
import { mesmaCasa } from '@@MARE:modulo:src/formas-de-fenda-70ff4532.mjs@@';
                                                 

export const SELETOR_ARQUIPELAGO = { largura: 512, altura: 384 }         ;
                                                   
                                                  

export const CORES_DO_SELETOR = {
  mar: '#055e6b', orla: '#173d4d', aberta: '#ffe3a2', trancada: '#86b8ae',
  fundoMarco: '#315260', fundoBloqueio: '#536678', travamento: '#e0eee1',
}         ;

function bloco(ctx                          , cor        , x        , y        , l        , a = 1)       {
  ctx.fillStyle = cor;
  ctx.fillRect(x, y, l, a);
}

function losango(ctx                          , cor        , x        , y        , raio        )       {
  for (let dy = -raio; dy <= raio; dy++) {
    const largura = raio - Math.abs(dy);
    bloco(ctx, cor, x - largura, y + dy, largura * 2 + 1);
  }
}

function cadeado(ctx                          , cor        , x        , y        )       {
  bloco(ctx, cor, x - 2, y - 5, 5, 2);
  bloco(ctx, cor, x - 3, y - 3, 2, 4);
  bloco(ctx, cor, x + 2, y - 3, 2, 4);
  bloco(ctx, cor, x - 4, y, 9, 4);
}

function pontoDeRota(ctx                          , x        , y        , livre         )       {
  const c = CORES_DO_SELETOR;
  // Trilha aberta tem miolo quadrado; bloqueada tem traço fino e cadeado.
  bloco(ctx, c.orla, x - 3, y - 3, 6, 6);
  bloco(ctx, livre ? c.aberta : c.trancada, x - 1, y - 1, 3, livre ? 3 : 2);
}

function pintarRotas(ctx                          , progresso           , projetar          )       {
  for (const trecho of trilhasDo('arquipelago')) {
    const caminho = [trecho.de, ...trecho.curvas, trecho.para];
    const pontos = caminho.map(projetar);
    const distancia = pontos.slice(1).reduce((total, [x, y], i) =>
      total + Math.hypot(x - pontos[i][0], y - pontos[i][1]), 0);
    const percurso = prepararTravessia(caminho);
    const livre = rotaLivre(progresso, trecho);
    const intervalo = livre ? 11 : 13;
    for (let d = 12; d <= distancia - 12; d += intervalo) {
      const [x, y] = projetar(percurso.ponto(d / distancia));
      pontoDeRota(ctx, x, y, livre);
    }
    if (!livre) {
      const [x, y] = projetar(percurso.ponto(0.5));
      losango(ctx, CORES_DO_SELETOR.orla, x, y, 7);
      cadeado(ctx, CORES_DO_SELETOR.travamento, x, y);
    }
  }
}

function pintarMarcos(ctx                          , progresso           , projetar          )       {
  const c = CORES_DO_SELETOR;
  for (const posicao of nosDo('arquipelago')) {
    const [x, y] = projetar(posicao);
    const entrada = entradaEm(posicao, 'arquipelago');
    if (!entrada) {
      losango(ctx, c.orla, x, y, 6);
      losango(ctx, c.aberta, x, y, 3);
      continue;
    }
    const alcancavel = mesmaCasa(posicao, normalizarPosicao('arquipelago', posicao, progresso.concluidas));
    losango(ctx, c.orla, x, y, 11);
    losango(ctx, alcancavel ? c.fundoMarco : c.fundoBloqueio, x, y, 9);
    if (alcancavel) {
      losango(ctx, c.aberta, x, y, 6);
      losango(ctx, c.fundoMarco, x, y, 2);
    } else {
      cadeado(ctx, c.travamento, x, y);
    }
  }
}

export function podePintarArquipelago(arte                              )                           {
  return arte?.complete === true && arte.naturalWidth === SELETOR_ARQUIPELAGO.largura
    && arte.naturalHeight === SELETOR_ARQUIPELAGO.altura;
}

// O fundo é uma imagem nativa; a posição, as rotas e os bloqueios vêm da campanha.
export function pintarSeletorArquipelago(ctx                          , progresso           ,
  projetar          , arte                  )       {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(arte, 0, 0);
  pintarRotas(ctx, progresso, projetar);
  pintarMarcos(ctx, progresso, projetar);
  ctx.restore();
}
