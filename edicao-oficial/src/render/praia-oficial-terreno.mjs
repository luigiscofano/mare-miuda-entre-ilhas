import { pintarBaixioNaVirada } from '@@MARE:modulo:src/render/mare-direcional.mjs@@';
// Geometria em pixels inteiros da Travessia aprovada na Praia das Conchas.
                                                 

                                                                                                  
export const CASA_PRAIA = 48;
                                      
                                  
                                                                                                   
                                                                                           
                                                                                              
                                                  
                                                      
                                                         
                                                                
                                                         
                                                            
                                                             
                                                  
                  
                          
   

export const PALETA_PRAIA                = {
  mar: '#142e47', reflexoMar: '#205464',
  aguaRasa: ['#31787a', '#438687', '#4a8c8b', '#275e68', '#92c4be'],
  seca: ['#ead0a3', '#f5e2b4', '#b98a68', '#eed6ac', '#e2c69b'],
  molhada: ['#b68c6b', '#c79f7a', '#9b735d', '#bf9675', '#ad8465'],
  graos: ['#c39b73', '#cda77d'],
  juntaSeca: ['#cba77d', '#f8e2b9'], juntaMolhada: ['#986f55', '#d0a981'],
  umidade: ['#d2af84', '#dfbb8b', '#a87859'],
  sombraSeca: ['#c9a680', '#b9916b'], sombraMolhada: ['#9d795f', '#8c674f'],
  sombraSubmersa: ['#286569', '#24595f'], espuma: ['#82b8ba', '#e9f4e8'],
  destino: '#385658',
};
export const MAR_PRAIA = PALETA_PRAIA.mar;
const VIZINHOS = [[0, -1], [1, 0], [0, 1], [-1, 0]]         ;
const DIAGONAIS = [[-1, -1], [1, -1], [-1, 1], [1, 1]]         ;

                                                                  
                                                                                              
                                                              

export function quadroDaPraia(mapa                   )         {
  const gradeLargura = mapa[0].length * CASA_PRAIA;
  const gradeAltura = mapa.length * CASA_PRAIA;
  const largura = Math.max(394, gradeLargura + 104);
  const altura = Math.max(208, gradeAltura + 92);
  return { largura, altura, origemX: (largura - gradeLargura) / 2, origemY: (altura - gradeAltura) / 2 };
}

export const chaveDaCasa = ({ coluna, linha }         ) => `${coluna},${linha}`;
const casaEm = (mapa                   , coluna        , linha        ) => mapa[linha]?.[coluna] ?? '#';
const temTerra = (mapa                   , coluna        , linha        ) => casaEm(mapa, coluna, linha) !== '#';
const temPiso = (casa        , alta         ) => casa !== '#' && (casa !== '=' || !alta);

export function montarSuperficie({ largura, altura }        ) {
  const pixels = new Uint32Array(largura * altura);
  const numeros = new Map                ();
  const cores = new Map                ();
  const numero = (cor        ) => {
    const salvo = numeros.get(cor);
    if (salvo !== undefined) return salvo;
    const rgb = Number.parseInt(cor.slice(1), 16);
    numeros.set(cor, rgb);
    cores.set(rgb, cor);
    return rgb;
  };
  const pintar         = (cor, x, y, l, a) => {
    if (l <= 0 || a <= 0) return;
    const valor = numero(cor);
    const primeiroX = Math.max(0, x);
    const ultimoX = Math.min(largura, x + l);
    if (ultimoX <= primeiroX) return;
    for (let linha = Math.max(0, y); linha < Math.min(altura, y + a); linha++) {
      pixels.fill(valor, linha * largura + primeiroX, linha * largura + ultimoX);
    }
  };
  const corEm = (x        , y        ) => x < 0 || y < 0 || x >= largura || y >= altura
    ? undefined : cores.get(pixels[y * largura + x]);
  const desenhar = (ctx                          ) => {
    if ('createImageData' in ctx && 'putImageData' in ctx) {
      const quadro = ctx.createImageData(largura, altura);
      for (let i = 0; i < pixels.length; i++) {
        const valor = pixels[i];
        quadro.data[i * 4] = valor >>> 16;
        quadro.data[i * 4 + 1] = valor >>> 8 & 255;
        quadro.data[i * 4 + 2] = valor & 255;
        quadro.data[i * 4 + 3] = 255;
      }
      ctx.putImageData(quadro, 0, 0);
      return;
    }
    // Gravadores de teste e superfícies sem ImageData usam os mesmos pixels.
    for (let y = 0; y < altura; y++) {
      const linha = y * largura;
      let x = 0;
      while (x < largura) {
        const cor = pixels[linha + x];
        let fim = x + 1;
        while (fim < largura && pixels[linha + fim] === cor) fim++;
        ctx.fillStyle = cores.get(cor) ?? MAR_PRAIA;
        ctx.fillRect(x, y, fim - x, 1);
        x = fim;
      }
    }
  };
  return { pintar, corEm, desenhar };
}
                                                      

function degraus(pintar        , cor        , x        , y        , faixas                      )       {
  for (const [a, b, c, d] of faixas) pintar(cor, x + a, y + b, c - a + 1, d - b + 1);
}

function perfilDeSombra(largura        )                       {
  return [[4, 0, largura - 6, 2], [0, 3, largura - 1, 6], [4, 7, largura - 6, 8]];
}

export const ORIGEM_SIRI_PRAIA = [8, 12]         ;
const SOMBRA_SIRI                       = [[7, 20, 24, 24], [4, 21, 28, 23], [12, 24, 24, 25]];
const FAIXAS_MOLHADAS                       = [[8, 33, 39, 35], [12, 32, 35, 36], [17, 36, 31, 37]];

function cruzaSombraDoSiri(faixas                      , ocupado         )          {
  if (!ocupado) return false;
  const [dx, dy] = ORIGEM_SIRI_PRAIA;
  return faixas.some(([a, b, c, d]) => SOMBRA_SIRI.some(([u, v, w, z]) =>
    a <= w + dx && u + dx <= c && b <= z + dy && v + dy <= d));
}

function pintarAreia(pintar        , x        , y        , [norte, leste, sul, oeste]          ,
  molhada         , ocupado         , paleta               )       {
  const [base, luz, sombra, , vinco] = molhada ? paleta.molhada : paleta.seca;
  for (let i = 0; i < CASA_PRAIA; i++) {
    const ponta = i <= 2 || i >= 45;
    const recuo = ((oeste && i <= 2) || (leste && i >= 45)) ? 3 : 2;
    const topo = norte && ponta ? recuo : 0;
    const pe = 47 - (sul && ponta ? recuo : 0);
    pintar(base, x + i, y + topo, 1, pe - topo + 1);
    if (norte) pintar(luz, x + i, y + topo, 1, 3);
    if (sul) pintar(sombra, x + i, y + pe - 3, 1, 4);
  }
  const dobras = [[0, 0, 1, 1, norte, oeste], [47, 0, -1, 1, norte, leste],
    [0, 47, 1, -1, sul, oeste], [47, 47, -1, -1, sul, leste]]         ;
  for (const [xx, yy, dx, dy, a, b] of dobras) {
    if (a || b) continue;
    [4, 3, 1].forEach((l, j) => pintar(vinco, x + xx + Math.min(0, dx * (l - 1)), y + yy + dy * j, l, 1));
  }
  if (molhada && !cruzaSombraDoSiri(FAIXAS_MOLHADAS, ocupado)) degraus(pintar, luz, x, y, FAIXAS_MOLHADAS);
}

                                                                   
const SOMBRAS_SECAS                                   = {
  '1,0': ['claro', 10, 16, 28], '4,0': ['fundo', 12, 21, 28],
  '3,1': ['claro', 9, 16, 31], '1,2': ['fundo', 10, 21, 28],
};
const SOMBRAS_UMIDAS                                   = {
  '1,1': ['fundo', 8, 17, 29], '2,1': ['claro', 10, 19, 27], '4,1': ['fundo', 11, 18, 25],
};

function pintarSedimento(pintar        , x        , y        , chave        , molhada         , ocupado         , paleta               )       {
  const mancha = (molhada ? SOMBRAS_UMIDAS : SOMBRAS_SECAS)[chave];
  if (!mancha) return;
  const [tom, dx, dy, largura] = mancha;
  const faixas = perfilDeSombra(largura).map(([u, v, g, h]) => [u + dx, v + dy, g + dx, h + dy]         );
  const cor = (molhada ? paleta.molhada : paleta.seca)[tom === 'claro' ? 3 : 4];
  if (!cruzaSombraDoSiri(faixas, ocupado)) degraus(pintar, cor, x, y, faixas);
}

function pintarSubmerso(pintar        , x        , y        , coluna        , externas          , paleta               )       {
  const [rasa, reflexo, luz, costura, cantos] = paleta.aguaRasa;
  pintar(rasa, x, y, CASA_PRAIA, CASA_PRAIA);
  const [dx, dy, largura] = ([[10, 16, 28], [12, 21, 28], [9, 16, 31]]         )[coluna % 3];
  degraus(pintar, reflexo, x + dx, y + dy, perfilDeSombra(largura));
  degraus(pintar, luz, x + dx, y + dy, [[8, 2, 16, 2], [7, 3, 17, 3]]);
  const trechos = [[0, 10, 4], [10, 23, 5], [23, 35, 4], [35, CASA_PRAIA, 5]];
  const quinas                                           = [];
  VIZINHOS.forEach(([vx, vy], lado) => {
    if (!externas[lado]) return;
    const ponto = (trecho        , recuo        ) => [
      x + (vx === 0 ? trecho : vx > 0 ? 47 - recuo : recuo),
      y + (vy === 0 ? trecho : vy > 0 ? 47 - recuo : recuo),
    ]         ;
    for (const [inicio, fim, l] of trechos) {
      const [a, b] = ponto(inicio, 0);
      const [c, d] = ponto(fim - 1, l - 1);
      pintar(costura, Math.min(a, c), Math.min(b, d), Math.abs(c - a) + 1, Math.abs(d - b) + 1);
    }
    for (const ponta of [0, 47]) for (let d = 0; d < 7; d++) {
      const trecho = ponta === 0 ? d : ponta - d;
      const [mar, faixa] = d < 2 ? [4, 8] : d < 4 ? [2, 7] : [0, 6];
      for (let r = 0; r < faixa; r++) quinas.push([...ponto(trecho, r), r < mar ? paleta.mar : costura]);
    }
  });
  for (const [xx, yy, cor] of quinas) pintar(cor, xx, yy, 1, 1);
  for (const [a, b, sx, sy] of [[5, 5, 1, 1], [42, 5, -1, 1], [42, 42, -1, -1], [5, 42, 1, -1]]) {
    pintar(cantos, x + a + Math.min(0, 4 * sx), y + b, 5, 1);
    pintar(cantos, x + a, y + b + Math.min(0, 4 * sy), 1, 5);
  }
}

export function pintarPisoPraia(pintar        , mapa                   , quadro        ,
  alta         , coluna        , linha        , ocupado         , paleta = PALETA_PRAIA, forcarSubmerso = false)       {
  const casa = casaEm(mapa, coluna, linha);
  if (casa === '#') return;
  const x = quadro.origemX + coluna * CASA_PRAIA, y = quadro.origemY + linha * CASA_PRAIA;
  const externas = VIZINHOS.map(([dx, dy]) => !temTerra(mapa, coluna + dx, linha + dy))                       ;
  if(casa==='='&&!forcarSubmerso&&pintarBaixioNaVirada(pintar,x,y,coluna,linha,
      p=>{pintarAreia(p,x,y,externas,true,ocupado,paleta);
          pintarSedimento(p,x,y,coluna+','+linha,true,ocupado,paleta);},
      p=>pintarSubmerso(p,x,y,coluna,externas,paleta),paleta))return;
  if ((alta && casa === '=') || forcarSubmerso) {
    pintarSubmerso(pintar, x, y, coluna, externas, paleta);
    return;
  }
  pintarAreia(pintar, x, y, externas, casa === '=', ocupado, paleta);
  pintarSedimento(pintar, x, y, `${coluna},${linha}`, casa === '=', ocupado, paleta);
}

export function pintarDestinoPraia(pintar        , x        , y        , paleta = PALETA_PRAIA)       {
  const alcance = 5;
  for (const [a, b, sx, sy] of [[4, 4, 1, 1], [43, 4, -1, 1], [43, 43, -1, -1], [4, 43, 1, -1]]) {
    pintar(paleta.destino, x + a + Math.min(0, alcance * sx), y + b + Math.min(0, 2 * sy), alcance + 1, 3);
    pintar(paleta.destino, x + a + Math.min(0, 2 * sx), y + b + Math.min(0, alcance * sy), 3, alcance + 1);
  }
}

const PERFIS_ARESTA = [
  [[3, -2], [7, 2], [12, 0], [17, -3], [22, 1], [27, 3], [33, -2], [39, 1], [43, -1]],
  [[4, 1], [9, 3], [13, -2], [19, 0], [24, -3], [30, 1], [36, 3], [41, -2], [44, 1]],
  [[3, -1], [8, -3], [14, 2], [19, 0], [24, 3], [29, -1], [34, -3], [40, 2], [44, -1]],
]         ;
const GRUPOS_ARESTA = [
  [[-1, -2, 0], [0, 0, 1], [2, 2, 0], [3, 2, 0]],
  [[-1, 1, 0], [1, -2, 0], [2, -2, 0], [3, 1, 1]],
  [[-2, 1, 1], [-1, 1, 1], [1, -2, 0], [2, 2, 0]],
  [[-1, -1, 0], [1, 1, 1], [2, -1, 0]],
]         ;
function paraCadaCasa(mapa                   , quadro        ,
  executar                                                                             )       {
  mapa.forEach((fila, linha) => [...fila].forEach((casa, coluna) =>
    executar(casa, coluna, linha, quadro.origemX + coluna * CASA_PRAIA, quadro.origemY + linha * CASA_PRAIA)));
}

function pintarEncaixes({ pintar, corEm }            , mapa                   , quadro        , alta         , paleta               , pisos                                 )       {
  function faixa(x        , y        , vertical         , c1        , c2        , indice        )       {
    PERFIS_ARESTA[indice % PERFIS_ARESTA.length].forEach(([dist, desvio], i) => {
      const grupo = GRUPOS_ARESTA[(i + indice) % GRUPOS_ARESTA.length].slice(0, 2 + (i + indice) % 2);
      for (const [dd, dr, tom] of grupo) {
        const longo = dist + dd, recuo = desvio + dr;
        if (longo < 3 || longo > CASA_PRAIA - 4) continue;
        const px = x + (vertical ? recuo : longo), py = y + (vertical ? longo : recuo);
        if (!pisos.has(corEm(px, py))) continue;
        const tinta = (recuo < 0 ? c1 : c2) === '=' ? paleta.juntaMolhada : paleta.juntaSeca;
        pintar(tinta[tom], px, py, 1, 1);
      }
    });
  }
  paraCadaCasa(mapa, quadro, (casa, i, j, x, y) => {
    if (!temPiso(casa, alta)) return;
    const leste = casaEm(mapa, i + 1, j), sul = casaEm(mapa, i, j + 1);
    if (temPiso(leste, alta)) faixa(x + CASA_PRAIA, y, true, casa, leste, i + 3 * j);
    if (temPiso(sul, alta)) faixa(x, y + CASA_PRAIA, false, casa, sul, i + 3 * j + 1);
  });
}

function pintarQuinas({ pintar, corEm }            , mapa                   , quadro        , paleta               )       {
  const alteraveis = new Set                    ([paleta.molhada[0], ...paleta.juntaMolhada, paleta.molhada[4]]);
  paraCadaCasa(mapa, quadro, (casa, i, j, x, y) => {
    if (casa !== '=') return;
    for (const [dx, dy] of DIAGONAIS) {
      const horiz = casaEm(mapa, i + dx, j), vert = casaEm(mapa, i, j + dy);
      if (horiz === '=' || vert === '=' || (horiz === '#' && vert === '#')) continue;
      const origemX = x + (dx > 0 ? 47 : 0), origemY = y + (dy > 0 ? 47 : 0);
      [5, 5, 3, 3].forEach((l, v) => {
        for (let u = 0; u < l; u++) {
          const px = origemX - dx * u, py = origemY - dy * v;
          if (alteraveis.has(corEm(px, py))) pintar(paleta.seca[0], px, py, 1, 1);
        }
      });
    }
  });
}

function pintarLateraisMolhadas({ pintar, corEm }            , mapa                   , quadro        , paleta               , pisos                                 )       {
  const lados = [[1, 0], [-1, 0], [0, 1], [0, -1]]         ;
  paraCadaCasa(mapa, quadro, (casa, i, j, x, y) => {
    if (casa === '#' || casa === '=') return;
    for (const [dx, dy] of lados) {
      if (casaEm(mapa, i + dx, j + dy) !== '=') continue;
      for (let t = 0; t < CASA_PRAIA; t++) {
        const largura = t < 5 || t >= CASA_PRAIA - 5 ? 3 : 4;
        for (let r = 0; r < largura; r++) {
          const px = x + (dx === 0 ? t : dx > 0 ? 47 - r : r);
          const py = y + (dy === 0 ? t : dy > 0 ? 47 - r : r);
          const cor = corEm(px, py);
          if (pisos.has(cor)) pintar(paleta.umidade[cor === paleta.seca[1] ? 1 : cor === paleta.seca[2] ? 2 : 0], px, py, 1, 1);
        }
      }
    }
  });
}

                                             
const GRAOS                                            = {
  '1,0': [[9, 11, 0], [34, 29, 1], [18, 39, 0]],
  '2,0': [[14, 8, 1], [38, 36, 0]],
  '3,0': [[8, 9, 0], [33, 39, 1]],
  '4,0': [[30, 10, 1], [13, 33, 0], [35, 37, 1]],
  '0,1': [[11, 8, 0], [36, 10, 1], [18, 39, 0]],
  '3,1': [[30, 10, 0], [10, 30, 1], [26, 38, 0]],
  '5,1': [[10, 8, 0], [33, 39, 1]],
  '1,2': [[11, 12, 1], [36, 33, 0], [17, 36, 1]],
};
const TIPOS_DE_GRAOS = Object.values(GRAOS);
function pintarGraos({ pintar, corEm }            , mapa                   , quadro        , paleta               , bocas                      )       {
  paraCadaCasa(mapa, quadro, (casa, i, j, x, y) => {
    if (casa === '#' || casa === '=') return;
    const graos = GRAOS[`${i},${j}`] ?? TIPOS_DE_GRAOS[(i * 17 + j * 27) % TIPOS_DE_GRAOS.length];
    // No Mangue, um grão escapa das peças centrais sem desenhar moldura.
    const bordas                  = [[11, 6, 1], [33, 6, 1], [13, 7, 1], [35, 7, 1]];
    let grupos = paleta.graoJuntoDaBorda ? [...graos, bordas[(i + j * 3) % 4]] : graos;
    if (bocas?.has(chaveDaCasa({ coluna: i, linha: j }))) {
      const periferia = grupos.filter(([u, v]) => v < 5 || v >= 36 || u < 5 || u >= 42);
      const distancia = ([u, v]      ) => Math.abs(u - 24) + Math.abs(v - 23);
      // Tire os grãos soltos de perto da boca, preservando os mais distantes.
      grupos = periferia.length ? periferia : [grupos.reduce((a, b) => distancia(a) >= distancia(b) ? a : b)];
    }
    for (const [u, v, tipo] of grupos) {
      const lado = tipo === 0 ? 3 : 2;
      let livre = true;
      for (let dy = 0; dy < lado; dy++) for (let dx = 0; dx < lado; dx++) {
        if (corEm(x + u + dx, y + v + dy) !== paleta.seca[0]) livre = false;
      }
      if (livre) pintar(paleta.graos[tipo], x + u, y + v, lado, lado);
    }
  });
}

export function pintarJuntasPraia(tela            , mapa                   , quadro        , alta         ,
  paleta = PALETA_PRAIA, mapaDaTextura = mapa, bocas                      )       {
  const pisos = new Set                    ([...paleta.seca, ...paleta.molhada]);
  pintarEncaixes(tela, mapaDaTextura, quadro, alta, paleta, pisos);
  if (alta) pintarLateraisMolhadas(tela, mapa, quadro, paleta, pisos);
  else pintarQuinas(tela, mapa, quadro, paleta);
  pintarGraos(tela, mapaDaTextura, quadro, paleta, bocas);
}

export const marAbertoEm = ({ corEm }            , x        , y        , paleta = PALETA_PRAIA) => {
  const cor = corEm(x, y);
  return cor === paleta.mar || cor === paleta.reflexoMar;
};

export function pintarSombraDoSiri(pintar        , x        , y        , emBaixio         , alta         ,
  paleta = PALETA_PRAIA)       {
  const [difusa, contato] = !emBaixio ? paleta.sombraSeca : alta ? paleta.sombraSubmersa : paleta.sombraMolhada;
  degraus(pintar, difusa, x, y, SOMBRA_SIRI);
  degraus(pintar, contato, x, y, [[9, 21, 25, 22], [18, 23, 25, 23]]);
}
