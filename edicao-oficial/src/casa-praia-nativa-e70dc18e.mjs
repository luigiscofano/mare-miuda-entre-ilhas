import { reduzirReflexos } from '@@MARE:modulo:src/selecionar-espalhados-8db16b0e.mjs@@';
import { cristasDaDeriva, pintarCristaRetangular } from '@@MARE:modulo:src/render/espuma-solta.mjs@@';
import { pintarVisitaDaPraia, comporVisitasDaPraia } from '@@MARE:modulo:src/nomes-das-rochas-6e85a20e.mjs@@';
                                                  
                                                 
import { graosDaCasa, tonsDosGraos } from '@@MARE:modulo:src/graos-da-casa-d8070a74.mjs@@';
import { ENFEITES_DA_PRAIA } from '@@MARE:modulo:src/enfeites-da-praia-d42f1758.mjs@@';
import { TEMA_DERIVA, TEMA_ENSEADA } from '@@MARE:modulo:src/tema-enseada-4a1214db.mjs@@';
import { TEMA_FAROL, TEMA_GRUTAS, TEMA_RESSACA } from '@@MARE:modulo:src/tema-grutas-70c6e67e.mjs@@';
import { TEMA_MANGUE, TEMA_RECIFES } from '@@MARE:modulo:src/tema-recifes-464652b5.mjs@@';
import { obstaculosOceanicos } from '@@MARE:modulo:src/modelos-oceanicos-3fe7fccf.mjs@@';
                                                           

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
}         ;

                              
                         
                                     
                  
                  
   
                                                                

                                                                                                                    

                                    
               
                               
                                    
                                                                                               
                                                   
   

const TEMA_PRAIA              = { cores: CORES_PRAIA, enfeites: ENFEITES_DA_PRAIA, tipo: 'praia', raios: [13, 9, 5, 2] };
const N = CASA_PRAIA_NATIVA;

export function usaTravessiaPraia(mundo               )          {
  return mundo === 'praia' || mundo === 'praia-enseadinha';
}

export function temaDaCosta(mundo               )                          {
  if (usaTravessiaPraia(mundo)) return TEMA_PRAIA;
  if (mundo === 'recifes') return TEMA_RECIFES;
  if (mundo === 'mangue') return TEMA_MANGUE;
  if (mundo === 'enseada') return TEMA_ENSEADA;
  if (mundo === 'deriva') return TEMA_DERIVA;
  if (mundo === 'grutas') return TEMA_GRUTAS;
  if (mundo === 'ressaca') return TEMA_RESSACA;
  if (mundo === 'farol') return TEMA_FAROL;
}

function ret(ctx                          , cor        , x        , y        , l        , a = 1)       {
  ctx.fillStyle = cor;
  ctx.fillRect(x, y, l, a);
}

function celula(mapa      , coluna        , linha        )         {
  return mapa[linha]?.[coluna] ?? '~';
}

function chao(tipo        , alta         )          {
  return tipo !== '~' && tipo !== 'I' && tipo !== '#' && (tipo !== '=' || !alta);
}

function aoRedor(mapa      , pos         , alta         ) {
  const { coluna, linha } = pos;
  return {
    norte: !chao(celula(mapa, coluna, linha - 1), alta),
    sul: !chao(celula(mapa, coluna, linha + 1), alta),
    oeste: !chao(celula(mapa, coluna - 1, linha), alta),
    leste: !chao(celula(mapa, coluna + 1, linha), alta),
  };
}

// A composição é constante durante cada virada; só o contorno costeiro acompanha a água.
function variante(coluna        , linha        , semente = 0)         {
  return ((Math.imul(coluna + 11, 73856093) ^ Math.imul(linha + 13, 19349663) ^ semente) >>> 0);
}

function sprite(ctx                          , desenho                   ,
  paleta                                  , x        , y        )       {
  desenho.forEach((linha, dy) => {
    [...linha].forEach((pixel, dx) => {
      const cor = paleta[pixel];
      if (cor) ret(ctx, cor, x + dx, y + dy, 1);
    });
  });
}

function pintarRefugio(ctx                          , x        , y        , { cores }             )       {
  // O ressalto atravessa quase a casa inteira: é areia da própria trilha,
  // não uma peça que o siri precisa contornar. A faixa escura é só relevo.
  ret(ctx, cores.areiaPonto, x + 1, y + 10, N - 2, 16);
  ret(ctx, cores.areiaClara, x + 2, y + 10, N - 4, 4);
  ret(ctx, cores.areiaClara, x + 5, y + 8, N - 10, 2);
  ret(ctx, cores.areia, x + 1, y + 14, N - 2, 7);
  ret(ctx, cores.areiaPonto, x + 1, y + 21, N - 2, 3);
  ret(ctx, cores.areiaBorda, x + 2, y + 24, N - 4, 2);
}

const ERVAS = [
  ['......l...', '..l...f...', '..f..lf.f.', '.lf..fffl.', '.sfflfffs.', '..sfsssfs.', '...sssss..'],
  ['........f.', '..l....lf.', '..ffl..fs.', '...ffsffs.', 'l...fsssf.', 'fs.fsfsf..', '.sssss....'],
  ['..l..l....', '..fl.ff.l.', '...f.ff.f.', '.l.f.sffs.', '.ffs.fss..', '..sfffss..', '...sssss..'],
]         ;
export function pintarConchaDaCosta(ctx                          , x        , y        , { cores, desenhoConcha }             ) {
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

function marCalmo(ctx                          , largura        , altura        , { cores, tipo }             )       {
  const entreOndasX = tipo === 'praia' ? 49 : 68;
  const entreOndasY = tipo === 'praia' ? 17 : 24;
  ret(ctx, cores.mar, 0, 0, largura, altura);
  const reflexos=[];
  for (let linha = 0; linha < altura; linha += entreOndasY) {
    for (let coluna = 3; coluna < largura; coluna += entreOndasX) {
      const v = variante(coluna, linha);
      const x = coluna + v % 27;
      const y = linha + (v >>> 7) % 10;
      reflexos.push([x,y,v]);
    }
  }
  // Uma marca e seu pequeno eco contam como um único reflexo.
  for(const [x,y,v] of reduzirReflexos(reflexos, ([x,y])=>x<largura&&y<altura)){
    ret(ctx, v%4===0 ? cores.onda : cores.fundoOnda, x, y, 3+v%9);
    if(v%3===0)ret(ctx, cores.fundoOnda, x+2,y+2,4+v%3);
  }
}

function pintarEstruturasNoMar(ctx                          , grade           ,
  largura        , altura        , idFase        , { cores, enfeites, tipo }             )       {
  const caixas = obstaculosOceanicos(grade, largura, altura, idFase);
  const visitas = comporVisitasDaPraia(idFase, { largura, altura, inicioDaGrade: grade.x,
    fimDaGrade: grade.x + grade.largura }, caixas);
  const visita = visitas.find(item => item.indice < caixas.length);
  const adicionais = visitas.filter(item => item.indice >= caixas.length);
  const pincel = (cor, x, y, l, a) => ret(ctx, cor, x, y, l, a);
  for (const nova of adicionais) pintarVisitaDaPraia(pincel, nova, [cores.aguaClara, cores.espuma]);
  const cristal = tipo === 'grutas' ? VAGAS_DAS_AMETISTAS[idFase] : undefined;
  caixas.forEach((caixa, indice) => {
    if (cristal?.indice === indice) {
      pintarAmetistaAprovada(pincel, cristal);
      return;
    }
    if (indice === visita?.indice) {
      pintarVisitaDaPraia((cor, x, y, l, a) => ret(ctx, cor, x, y, l, a), visita, [cores.aguaClara, cores.espuma]);
      return;
    }
    const tematica = enfeites[indice];
    if (tematica?.estrutura) {
      pintarMatrizNaCaixa(ctx, caixa, tematica);
      return;
    }
    // Rebatemos as faixas de cada forma na área livre, sempre em pixels
    // inteiros. O afloramento tem uma base comum e conta como uma peça.
    const { x, y, largura: l, altura: a, forma } = caixa;
    const bloco = (cor        , u        , v        , w        , h        ) => {
      const inicio = Math.round(u * l / 16);
      const fim = Math.round((u + w) * l / 16);
      const topo = Math.round(v * a / 12);
      const fundo = Math.round((v + h) * a / 12);
      if (fim > inicio && fundo > topo) ret(ctx, cor, x + inicio, y + topo, fim - inicio, fundo - topo);
    };
    if (forma === 'afloramento') {
      bloco(cores.rochaEscura, 0, 7, 16, 4);
      bloco(cores.rochaFace, 1, 6, 6, 4);
      bloco(cores.rochaFaceClara, 5, 3, 7, 6);
      bloco(cores.rochaFace, 10, 6, 5, 4);
      bloco(cores.rochaTopo, 1, 5, 5, 2);
      bloco(cores.rochaTopo, 6, 2, 5, 3);
      bloco(cores.rochaTopo, 11, 5, 4, 2);
      bloco(cores.rochaSol, 6, 2, 3, 1);
    } else {
      const canto = forma === 'bloco' ? 1 : 2;
      bloco(cores.rochaEscura, canto, 6, 16 - canto * 2, 5);
      bloco(cores.rochaFace, canto, 4, 16 - canto * 2, 6);
      bloco(cores.rochaTopo, canto + 1, 3, 14 - canto * 2, 3);
      bloco(cores.rochaTopo, canto + 2, 2, 12 - canto * 2, 2);
      bloco(cores.rochaSol, canto + 2, 2, 7 - canto, 1);
      bloco(cores.rochaFaceClara, canto + 1, 6, 10 - canto, 2);
    }
  });
  if (tipo === 'deriva') {
    const ocupadas = [...caixas.map((caixa, i) => i === visita?.indice ? visita : caixa), ...adicionais];
    for (const crista of cristasDaDeriva(idFase, grade, largura, altura, ocupadas)) {
      pintarCristaRetangular((cor, x, y, w, h) => ret(ctx, cor, x, y, w, h),
        crista, [cores.aguaClara, '#edf1df']);
    }
  }
}

function pintarMatrizNaCaixa(ctx                          , caixa           , { desenho, paleta }         )       {
  const largura = Math.max(...desenho.map(linha => linha.length));
  const altura = desenho.length;
  const proporcao = Math.min(1, caixa.largura / largura, caixa.altura / altura);
  const l = Math.max(1, Math.floor(largura * proporcao));
  const a = Math.max(1, Math.floor(altura * proporcao));
  const x = caixa.x + Math.floor((caixa.largura - l) / 2);
  const y = caixa.y + Math.floor((caixa.altura - a) / 2);
  // Só os temas com estrutura reconhecível ocupam a caixa. Ondas e espuma
  // não contam como uma peça. O desenho sempre usa pixels físicos inteiros.
  for (let j = 0; j < a; j++) {
    const linha = desenho[Math.min(altura - 1, Math.floor((j + 0.5) * altura / a))];
    for (let i = 0; i < l; i++) {
      const cor = paleta[linha[Math.min(largura - 1, Math.floor((i + 0.5) * largura / l))]];
      if (cor) ret(ctx, cor, x + i, y + j, 1);
    }
  }
}

function faixaDaCosta(ctx                          , casa           , raio        , cor        ) {
  const { x, y, largura, altura } = casa;
  // Chanfros em degraus suavizam a água, mas o limite do piso continua ortogonal.
  const chanfro = Math.ceil(raio / 2);
  ret(ctx, cor, x - raio, y - raio + chanfro, largura + raio * 2, altura + (raio - chanfro) * 2);
  ret(ctx, cor, x - raio + chanfro, y - raio, largura + (raio - chanfro) * 2, altura + raio * 2);
  const meio = Math.ceil(chanfro / 2);
  ret(ctx, cor, x - raio + meio, y - raio + meio, largura + (raio - meio) * 2, altura + (raio - meio) * 2);
}

function sombraDeAreia(ctx                          , x        , y        ,
  lados                            , v        , cores       )       {
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

function baixioDescoberto(ctx                          , x        , y        ,
  mapa      , { coluna, linha }         , v        , { cores, tipo }             )       {
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

function baixioSubmerso(ctx                          , x        , y        , cores       ) {
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

function areia(ctx                          , x        , y        , v        , decorar         , { cores, tipo }             )       {
  ret(ctx, cores.areia, x, y, N, N);
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
  { contexto: ctx, origemX, origemY }         , mapa      , alta         ,
  largura        , altura        , tema             , idFase = '', pintarConchas = true,
)       {
  const { cores, raios } = tema;
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  marCalmo(ctx, largura, altura, tema);
  const casas = mapa.flatMap((fileira, linha) => [...fileira].map((tipo, coluna) => ({
    tipo, coluna, linha, x: origemX + coluna * N, y: origemY + linha * N,
    largura: N, altura: N, v: variante(coluna, linha, largura + mapa[0].length * 47 + mapa.length * 17),
  })));
  const bancos = casas.filter(casa => chao(casa.tipo, alta));
  for (const [raio, cor] of [[raios[0], cores.fundo], [raios[1], cores.raso], [raios[2], cores.beira], [raios[3], cores.aguaClara]]         ) {
    for (const casa of bancos) faixaDaCosta(ctx, casa, raio, cor);
  }
  for (const casa of bancos) {
    const { tipo, x, y, v } = casa;
    areia(ctx, x, y, v, tipo === '.', tema);
    if (tipo === '=') baixioDescoberto(ctx, x, y, mapa, casa, v, tema);
  }
  for (const casa of bancos) sombraDeAreia(ctx, casa.x, casa.y, aoRedor(mapa, casa, alta), casa.v, cores);
  const tonsGraos = tonsDosGraos(cores.areia, cores.barranco);
  for (const { tipo, x, y, v } of bancos) {
    if (tipo === '=') continue;
    // Os alvos, os objetos e o siri são pintados depois deste detalhe do chão.
    for (const grao of graosDaCasa(v)) ret(ctx, tonsGraos[grao.tom], x + grao.x, y + grao.y, grao.lado, grao.lado);
  }
  for (const { tipo: casa, x, y } of casas) {
    if (casa === 'H') pintarRefugio(ctx, x, y, tema);
    else if (casa === 'C' && pintarConchas) pintarConchaDaCosta(ctx, x, y, tema);
    else if (casa === '=' && alta) baixioSubmerso(ctx, x, y, cores);
  }
  pintarEstruturasNoMar(ctx, { x: origemX, y: origemY, largura: mapa[0].length * N, altura: mapa.length * N },
    largura, altura, idFase, tema);
  ctx.restore();
}

const AMETISTAS_APROVADAS = {"ametista_mar":[[22,10,9,"#5a466f"],[21,11,1,"#5a466f"],[22,11,9,"#ac88be"],[31,11,1,"#5a466f"],[20,12,1,"#5a466f"],[21,12,2,"#ac88be"],[23,12,8,"#c1a2d0"],[31,12,1,"#ac88be"],[32,12,1,"#5a466f"],[19,13,1,"#5a466f"],[20,13,2,"#ac88be"],[22,13,8,"#c1a2d0"],[30,13,2,"#ac88be"],[32,13,1,"#5a466f"],[18,14,1,"#5a466f"],[19,14,2,"#ac88be"],[21,14,9,"#c1a2d0"],[30,14,3,"#ac88be"],[33,14,1,"#5a466f"],[17,15,1,"#5a466f"],[18,15,2,"#ac88be"],[20,15,9,"#c1a2d0"],[29,15,5,"#ac88be"],[34,15,1,"#5a466f"],[16,16,1,"#5a466f"],[17,16,5,"#ac88be"],[22,16,1,"#c1a2d0"],[23,16,10,"#ac88be"],[33,16,1,"#6c5285"],[34,16,1,"#5a466f"],[15,17,1,"#5a466f"],[16,17,15,"#ac88be"],[31,17,3,"#6c5285"],[34,17,5,"#5a466f"],[15,18,1,"#5a466f"],[16,18,1,"#80629a"],[17,18,1,"#5a466f"],[18,18,12,"#ac88be"],[30,18,4,"#6c5285"],[34,18,1,"#5a466f"],[35,18,4,"#ac88be"],[39,18,1,"#5a466f"],[15,19,1,"#5a466f"],[16,19,3,"#80629a"],[19,19,10,"#ac88be"],[29,19,5,"#6c5285"],[34,19,1,"#5a466f"],[35,19,1,"#ac88be"],[36,19,3,"#c1a2d0"],[39,19,1,"#ac88be"],[40,19,1,"#5a466f"],[15,20,1,"#5a466f"],[16,20,5,"#80629a"],[21,20,1,"#ac88be"],[22,20,6,"#80629a"],[28,20,6,"#6c5285"],[34,20,1,"#5a466f"],[35,20,4,"#c1a2d0"],[39,20,2,"#ac88be"],[41,20,1,"#5a466f"],[15,21,1,"#5a466f"],[16,21,2,"#80629a"],[18,21,7,"#8c6ba5"],[25,21,3,"#80629a"],[28,21,6,"#6c5285"],[34,21,1,"#5a466f"],[35,21,3,"#c1a2d0"],[38,21,4,"#ac88be"],[42,21,1,"#5a466f"],[11,22,3,"#5a466f"],[15,22,1,"#5a466f"],[16,22,2,"#80629a"],[18,22,7,"#8c6ba5"],[25,22,3,"#80629a"],[28,22,6,"#6c5285"],[34,22,1,"#5a466f"],[35,22,3,"#c1a2d0"],[38,22,5,"#ac88be"],[43,22,1,"#5a466f"],[10,23,1,"#5a466f"],[11,23,3,"#ac88be"],[14,23,2,"#5a466f"],[16,23,2,"#80629a"],[18,23,5,"#8c6ba5"],[23,23,5,"#80629a"],[28,23,6,"#6c5285"],[34,23,1,"#5a466f"],[35,23,1,"#ac88be"],[36,23,1,"#c1a2d0"],[37,23,5,"#ac88be"],[42,23,1,"#6c5285"],[43,23,1,"#5a466f"],[10,24,2,"#ac88be"],[12,24,2,"#c1a2d0"],[14,24,1,"#ac88be"],[15,24,1,"#5a466f"],[16,24,12,"#80629a"],[28,24,6,"#6c5285"],[34,24,1,"#5a466f"],[35,24,5,"#ac88be"],[40,24,3,"#6c5285"],[43,24,1,"#5a466f"],[9,25,1,"#5a466f"],[10,25,2,"#ac88be"],[12,25,2,"#c1a2d0"],[14,25,1,"#ac88be"],[15,25,1,"#5a466f"],[16,25,12,"#80629a"],[28,25,6,"#6c5285"],[34,25,1,"#5a466f"],[35,25,4,"#ac88be"],[39,25,4,"#6c5285"],[43,25,1,"#5a466f"],[8,26,1,"#5a466f"],[9,26,2,"#ac88be"],[11,26,3,"#c1a2d0"],[14,26,1,"#ac88be"],[15,26,1,"#5a466f"],[16,26,12,"#80629a"],[28,26,6,"#6c5285"],[34,26,1,"#5a466f"],[35,26,3,"#ac88be"],[38,26,5,"#6c5285"],[43,26,1,"#5a466f"],[7,27,1,"#5a466f"],[8,27,3,"#ac88be"],[11,27,3,"#c1a2d0"],[14,27,1,"#ac88be"],[15,27,1,"#5a466f"],[16,27,12,"#80629a"],[28,27,6,"#6c5285"],[34,27,1,"#5a466f"],[35,27,1,"#ac88be"],[36,27,1,"#80629a"],[37,27,6,"#6c5285"],[43,27,1,"#5a466f"],[7,28,1,"#5a466f"],[8,28,5,"#ac88be"],[13,28,1,"#c1a2d0"],[14,28,1,"#ac88be"],[15,28,1,"#5a466f"],[16,28,12,"#80629a"],[28,28,6,"#6c5285"],[34,28,1,"#5a466f"],[35,28,2,"#80629a"],[37,28,6,"#6c5285"],[43,28,1,"#5a466f"],[6,29,1,"#5a466f"],[7,29,8,"#ac88be"],[15,29,1,"#5a466f"],[16,29,12,"#80629a"],[28,29,6,"#6c5285"],[34,29,1,"#5a466f"],[35,29,2,"#80629a"],[37,29,6,"#6c5285"],[43,29,1,"#5a466f"],[6,30,1,"#5a466f"],[7,30,1,"#80629a"],[8,30,1,"#5a466f"],[9,30,6,"#ac88be"],[15,30,1,"#5a466f"],[16,30,12,"#80629a"],[28,30,6,"#6c5285"],[34,30,1,"#5a466f"],[35,30,2,"#80629a"],[37,30,6,"#6c5285"],[43,30,1,"#5a466f"],[6,31,1,"#5a466f"],[7,31,3,"#80629a"],[10,31,4,"#ac88be"],[14,31,1,"#6c5285"],[15,31,1,"#5a466f"],[16,31,12,"#80629a"],[28,31,6,"#6c5285"],[34,31,1,"#5a466f"],[35,31,2,"#80629a"],[37,31,6,"#6c5285"],[43,31,1,"#5a466f"],[7,32,1,"#483e67"],[8,32,4,"#80629a"],[12,32,1,"#ac88be"],[13,32,2,"#6c5285"],[15,32,1,"#5a466f"],[16,32,12,"#80629a"],[28,32,6,"#6c5285"],[34,32,1,"#5a466f"],[35,32,2,"#80629a"],[37,32,5,"#6c5285"],[42,32,1,"#483e67"],[43,32,1,"#5a466f"],[8,33,7,"#483e67"],[15,33,1,"#5a466f"],[16,33,12,"#80629a"],[28,33,6,"#6c5285"],[34,33,1,"#5a466f"],[35,33,2,"#80629a"],[37,33,3,"#6c5285"],[40,33,2,"#483e67"],[42,33,1,"#5a466f"],[5,34,4,"#2c3556"],[9,34,6,"#483e67"],[15,34,1,"#5a466f"],[16,34,12,"#80629a"],[28,34,5,"#6c5285"],[33,34,1,"#483e67"],[34,34,1,"#5a466f"],[35,34,6,"#483e67"],[41,34,1,"#5a466f"],[5,35,5,"#2c3556"],[10,35,7,"#483e67"],[17,35,11,"#80629a"],[28,35,3,"#6c5285"],[31,35,2,"#483e67"],[33,35,1,"#5a466f"],[34,35,7,"#483e67"],[41,35,3,"#2c3556"],[5,36,5,"#2c3556"],[10,36,7,"#444568"],[17,36,15,"#483e67"],[32,36,1,"#5a466f"],[33,36,7,"#483e67"],[40,36,4,"#2c3556"],[5,37,6,"#2c3556"],[11,37,4,"#394361"],[15,37,3,"#2c3556"],[18,37,13,"#483e67"],[31,37,8,"#444568"],[39,37,5,"#2c3556"],[5,38,14,"#2c3556"],[19,38,12,"#483e67"],[31,38,2,"#2c3556"],[33,38,5,"#394361"],[38,38,1,"#2c3556"],[12,39,6,"#2c3556"],[18,39,12,"#444568"],[30,39,9,"#2c3556"],[16,40,4,"#2c3556"],[20,40,8,"#394361"],[20,41,1,"#2c3556"],[22,41,5,"#394361"]],"dobra_ametista":[[45,5,12,"#5a466f"],[44,6,1,"#5a466f"],[45,6,12,"#ac88be"],[57,6,1,"#5a466f"],[43,7,1,"#5a466f"],[44,7,2,"#ac88be"],[46,7,11,"#c1a2d0"],[57,7,1,"#ac88be"],[58,7,1,"#5a466f"],[42,8,1,"#5a466f"],[43,8,2,"#ac88be"],[45,8,11,"#c1a2d0"],[56,8,2,"#ac88be"],[58,8,1,"#5a466f"],[41,9,1,"#5a466f"],[42,9,2,"#ac88be"],[44,9,12,"#c1a2d0"],[56,9,3,"#ac88be"],[59,9,1,"#5a466f"],[40,10,1,"#5a466f"],[41,10,2,"#ac88be"],[43,10,12,"#c1a2d0"],[55,10,5,"#ac88be"],[60,10,1,"#5a466f"],[39,11,1,"#5a466f"],[40,11,5,"#ac88be"],[45,11,1,"#c1a2d0"],[46,11,13,"#ac88be"],[59,11,1,"#6c5285"],[60,11,1,"#5a466f"],[38,12,1,"#5a466f"],[39,12,18,"#ac88be"],[57,12,3,"#6c5285"],[60,12,1,"#5a466f"],[65,12,8,"#5a466f"],[38,13,1,"#5a466f"],[39,13,1,"#80629a"],[40,13,1,"#5a466f"],[41,13,15,"#ac88be"],[56,13,4,"#6c5285"],[60,13,1,"#5a466f"],[64,13,1,"#5a466f"],[65,13,8,"#ac88be"],[73,13,1,"#5a466f"],[30,14,7,"#5a466f"],[38,14,1,"#5a466f"],[39,14,3,"#80629a"],[42,14,13,"#ac88be"],[55,14,5,"#6c5285"],[60,14,1,"#5a466f"],[63,14,1,"#5a466f"],[64,14,2,"#ac88be"],[66,14,7,"#c1a2d0"],[73,14,1,"#5a466f"],[29,15,1,"#5a466f"],[30,15,7,"#ac88be"],[37,15,2,"#5a466f"],[39,15,5,"#80629a"],[44,15,1,"#ac88be"],[45,15,9,"#80629a"],[54,15,6,"#6c5285"],[60,15,1,"#5a466f"],[62,15,1,"#5a466f"],[63,15,2,"#ac88be"],[65,15,7,"#c1a2d0"],[72,15,2,"#ac88be"],[74,15,1,"#5a466f"],[29,16,1,"#5a466f"],[30,16,1,"#ac88be"],[31,16,6,"#c1a2d0"],[37,16,1,"#ac88be"],[38,16,1,"#5a466f"],[39,16,2,"#80629a"],[41,16,10,"#8c6ba5"],[51,16,3,"#80629a"],[54,16,6,"#6c5285"],[60,16,2,"#5a466f"],[62,16,1,"#ac88be"],[63,16,8,"#c1a2d0"],[71,16,3,"#ac88be"],[74,16,1,"#5a466f"],[28,17,1,"#5a466f"],[29,17,2,"#ac88be"],[31,17,6,"#c1a2d0"],[37,17,1,"#ac88be"],[38,17,1,"#5a466f"],[39,17,2,"#80629a"],[41,17,10,"#8c6ba5"],[51,17,3,"#80629a"],[54,17,6,"#6c5285"],[60,17,1,"#5a466f"],[61,17,1,"#ac88be"],[62,17,8,"#c1a2d0"],[70,17,5,"#ac88be"],[75,17,1,"#5a466f"],[28,18,1,"#5a466f"],[29,18,2,"#ac88be"],[31,18,7,"#c1a2d0"],[38,18,1,"#5a466f"],[39,18,2,"#80629a"],[41,18,8,"#8c6ba5"],[49,18,5,"#80629a"],[54,18,6,"#6c5285"],[60,18,1,"#5a466f"],[61,18,3,"#ac88be"],[64,18,1,"#c1a2d0"],[65,18,9,"#ac88be"],[74,18,1,"#6c5285"],[75,18,1,"#5a466f"],[27,19,1,"#5a466f"],[28,19,3,"#ac88be"],[31,19,7,"#c1a2d0"],[38,19,1,"#5a466f"],[39,19,15,"#80629a"],[54,19,6,"#6c5285"],[60,19,1,"#5a466f"],[61,19,11,"#ac88be"],[72,19,3,"#6c5285"],[75,19,1,"#5a466f"],[27,20,1,"#5a466f"],[28,20,5,"#ac88be"],[33,20,1,"#c1a2d0"],[34,20,4,"#ac88be"],[38,20,1,"#5a466f"],[39,20,15,"#80629a"],[54,20,6,"#6c5285"],[60,20,1,"#5a466f"],[61,20,10,"#ac88be"],[71,20,4,"#6c5285"],[75,20,1,"#5a466f"],[26,21,1,"#5a466f"],[27,21,11,"#ac88be"],[38,21,1,"#5a466f"],[39,21,15,"#80629a"],[54,21,6,"#6c5285"],[60,21,1,"#5a466f"],[61,21,9,"#ac88be"],[70,21,5,"#6c5285"],[75,21,1,"#5a466f"],[26,22,1,"#5a466f"],[27,22,1,"#80629a"],[28,22,1,"#5a466f"],[29,22,9,"#ac88be"],[38,22,1,"#5a466f"],[39,22,15,"#80629a"],[54,22,6,"#6c5285"],[60,22,1,"#5a466f"],[61,22,2,"#80629a"],[63,22,1,"#ac88be"],[64,22,5,"#80629a"],[69,22,6,"#6c5285"],[75,22,1,"#5a466f"],[19,23,5,"#5a466f"],[26,23,1,"#5a466f"],[27,23,3,"#80629a"],[30,23,8,"#ac88be"],[38,23,1,"#5a466f"],[39,23,15,"#80629a"],[54,23,6,"#6c5285"],[60,23,1,"#5a466f"],[61,23,5,"#8c6ba5"],[66,23,3,"#80629a"],[69,23,6,"#6c5285"],[75,23,1,"#5a466f"],[18,24,1,"#5a466f"],[19,24,5,"#ac88be"],[24,24,1,"#5a466f"],[26,24,1,"#5a466f"],[27,24,5,"#80629a"],[32,24,1,"#ac88be"],[33,24,4,"#80629a"],[37,24,1,"#6c5285"],[38,24,1,"#5a466f"],[39,24,15,"#80629a"],[54,24,6,"#6c5285"],[60,24,1,"#5a466f"],[61,24,5,"#8c6ba5"],[66,24,3,"#80629a"],[69,24,6,"#6c5285"],[75,24,1,"#5a466f"],[18,25,2,"#ac88be"],[20,25,4,"#c1a2d0"],[24,25,1,"#ac88be"],[25,25,2,"#5a466f"],[27,25,2,"#80629a"],[29,25,5,"#8c6ba5"],[34,25,3,"#80629a"],[37,25,1,"#6c5285"],[38,25,1,"#5a466f"],[39,25,15,"#80629a"],[54,25,6,"#6c5285"],[60,25,1,"#5a466f"],[61,25,3,"#8c6ba5"],[64,25,5,"#80629a"],[69,25,6,"#6c5285"],[75,25,1,"#5a466f"],[80,25,3,"#5a466f"],[17,26,1,"#5a466f"],[18,26,2,"#ac88be"],[20,26,4,"#c1a2d0"],[24,26,2,"#ac88be"],[26,26,1,"#5a466f"],[27,26,2,"#80629a"],[29,26,5,"#8c6ba5"],[34,26,3,"#80629a"],[37,26,1,"#6c5285"],[38,26,1,"#5a466f"],[39,26,15,"#80629a"],[54,26,6,"#6c5285"],[60,26,1,"#5a466f"],[61,26,8,"#80629a"],[69,26,6,"#6c5285"],[75,26,1,"#5a466f"],[79,26,1,"#5a466f"],[80,26,3,"#ac88be"],[83,26,1,"#5a466f"],[16,27,1,"#5a466f"],[17,27,2,"#ac88be"],[19,27,5,"#c1a2d0"],[24,27,2,"#ac88be"],[26,27,1,"#5a466f"],[27,27,2,"#80629a"],[29,27,3,"#8c6ba5"],[32,27,5,"#80629a"],[37,27,1,"#6c5285"],[38,27,1,"#5a466f"],[39,27,15,"#80629a"],[54,27,6,"#6c5285"],[60,27,1,"#5a466f"],[61,27,8,"#80629a"],[69,27,6,"#6c5285"],[75,27,1,"#5a466f"],[78,27,1,"#5a466f"],[79,27,2,"#ac88be"],[81,27,2,"#c1a2d0"],[83,27,1,"#ac88be"],[84,27,1,"#5a466f"],[15,28,1,"#5a466f"],[16,28,3,"#ac88be"],[19,28,5,"#c1a2d0"],[24,28,2,"#ac88be"],[26,28,1,"#5a466f"],[27,28,10,"#80629a"],[37,28,1,"#6c5285"],[38,28,1,"#5a466f"],[39,28,15,"#80629a"],[54,28,6,"#6c5285"],[60,28,1,"#5a466f"],[61,28,8,"#80629a"],[69,28,6,"#6c5285"],[75,28,1,"#5a466f"],[77,28,1,"#5a466f"],[78,28,2,"#ac88be"],[80,28,2,"#c1a2d0"],[82,28,2,"#ac88be"],[84,28,1,"#5a466f"],[15,29,1,"#5a466f"],[16,29,5,"#ac88be"],[21,29,1,"#c1a2d0"],[22,29,4,"#ac88be"],[26,29,1,"#5a466f"],[27,29,10,"#80629a"],[37,29,1,"#6c5285"],[38,29,1,"#5a466f"],[39,29,15,"#80629a"],[54,29,6,"#6c5285"],[60,29,1,"#5a466f"],[61,29,8,"#80629a"],[69,29,6,"#6c5285"],[75,29,2,"#5a466f"],[77,29,2,"#ac88be"],[79,29,3,"#c1a2d0"],[82,29,3,"#ac88be"],[85,29,1,"#5a466f"],[14,30,1,"#5a466f"],[15,30,11,"#ac88be"],[26,30,1,"#5a466f"],[27,30,10,"#80629a"],[37,30,1,"#6c5285"],[38,30,1,"#5a466f"],[39,30,15,"#80629a"],[54,30,6,"#6c5285"],[60,30,1,"#5a466f"],[61,30,8,"#80629a"],[69,30,6,"#6c5285"],[75,30,1,"#5a466f"],[76,30,2,"#ac88be"],[78,30,3,"#c1a2d0"],[81,30,5,"#ac88be"],[86,30,1,"#5a466f"],[14,31,1,"#5a466f"],[15,31,1,"#80629a"],[16,31,1,"#5a466f"],[17,31,8,"#ac88be"],[25,31,1,"#6c5285"],[26,31,1,"#5a466f"],[27,31,10,"#80629a"],[37,31,1,"#6c5285"],[38,31,1,"#5a466f"],[39,31,15,"#80629a"],[54,31,6,"#6c5285"],[60,31,1,"#5a466f"],[61,31,8,"#80629a"],[69,31,5,"#6c5285"],[74,31,1,"#5a466f"],[75,31,5,"#ac88be"],[80,31,1,"#c1a2d0"],[81,31,4,"#ac88be"],[85,31,1,"#6c5285"],[86,31,1,"#5a466f"],[10,32,5,"#2c3556"],[15,32,1,"#483e67"],[16,32,2,"#80629a"],[18,32,6,"#ac88be"],[24,32,2,"#6c5285"],[26,32,1,"#5a466f"],[27,32,10,"#80629a"],[37,32,1,"#6c5285"],[38,32,1,"#5a466f"],[39,32,15,"#80629a"],[54,32,6,"#6c5285"],[60,32,1,"#5a466f"],[61,32,8,"#80629a"],[69,32,4,"#6c5285"],[73,32,1,"#5a466f"],[74,32,9,"#ac88be"],[83,32,2,"#6c5285"],[85,32,1,"#483e67"],[86,32,1,"#5a466f"],[10,33,6,"#2c3556"],[16,33,12,"#483e67"],[28,33,9,"#80629a"],[37,33,1,"#6c5285"],[38,33,1,"#5a466f"],[39,33,15,"#80629a"],[54,33,6,"#6c5285"],[60,33,1,"#5a466f"],[61,33,8,"#80629a"],[69,33,3,"#6c5285"],[72,33,3,"#483e67"],[75,33,1,"#80629a"],[76,33,6,"#ac88be"],[82,33,1,"#6c5285"],[83,33,2,"#483e67"],[85,33,1,"#5a466f"],[86,33,2,"#2c3556"],[11,34,6,"#2c3556"],[17,34,10,"#483e67"],[27,34,1,"#2c3556"],[28,34,10,"#483e67"],[38,34,1,"#5a466f"],[39,34,15,"#80629a"],[54,34,5,"#6c5285"],[59,34,1,"#483e67"],[60,34,1,"#5a466f"],[61,34,12,"#483e67"],[73,34,1,"#5a466f"],[74,34,1,"#2c3556"],[75,34,9,"#483e67"],[84,34,1,"#5a466f"],[85,34,3,"#2c3556"],[11,35,7,"#2c3556"],[18,35,8,"#483e67"],[26,35,3,"#2c3556"],[29,35,11,"#483e67"],[40,35,14,"#80629a"],[54,35,3,"#6c5285"],[57,35,2,"#483e67"],[59,35,1,"#5a466f"],[60,35,13,"#483e67"],[73,35,3,"#2c3556"],[76,35,8,"#483e67"],[84,35,4,"#2c3556"],[12,36,7,"#2c3556"],[19,36,6,"#483e67"],[25,36,5,"#2c3556"],[30,36,28,"#483e67"],[58,36,1,"#5a466f"],[59,36,2,"#2c3556"],[61,36,11,"#483e67"],[72,36,5,"#2c3556"],[77,36,6,"#483e67"],[83,36,5,"#2c3556"],[12,37,19,"#2c3556"],[31,37,8,"#483e67"],[39,37,2,"#2c3556"],[41,37,17,"#483e67"],[58,37,4,"#2c3556"],[62,37,9,"#483e67"],[71,37,7,"#2c3556"],[78,37,4,"#483e67"],[20,38,7,"#2c3556"],[27,38,12,"#444568"],[39,38,3,"#2c3556"],[42,38,15,"#483e67"],[57,38,3,"#2c3556"],[60,38,11,"#444568"],[71,38,6,"#2c3556"],[77,38,7,"#394361"],[20,39,10,"#2c3556"],[30,39,7,"#394361"],[37,39,5,"#2c3556"],[42,39,15,"#444568"],[57,39,5,"#2c3556"],[62,39,7,"#394361"],[69,39,11,"#2c3556"],[36,40,9,"#2c3556"],[45,40,10,"#394361"],[55,40,15,"#2c3556"],[48,41,5,"#394361"],[53,41,17,"#2c3556"],[51,42,19,"#2c3556"]]};
const VAGAS_DAS_AMETISTAS = {"grutas-exp-biblioteca-submersa":{"peca":"ametista_mar","indice":1,"x":462,"y":60},"grutas-exp-coluna-de-vidro":{"peca":"ametista_mar","indice":1,"x":462,"y":66},"grutas-exp-mapas-na-parede":{"peca":"dobra_ametista","indice":2,"x":414,"y":240},"grutas-exp-alavanca-no-oco":{"peca":"dobra_ametista","indice":1,"x":414,"y":60},"grutas-exp-cisterna-de-areia":{"peca":"dobra_ametista","indice":2,"x":414,"y":262},"grutas-exp-varanda-das-conchas":{"peca":"dobra_ametista","indice":0,"x":2,"y":12},"grutas-exp-margens-da-fechadura":{"peca":"ametista_mar","indice":0,"x":14,"y":54},"grutas-exp-rua-dos-refugios":{"peca":"dobra_ametista","indice":0,"x":2,"y":36},"grutas-exp-ponte-do-diapiro":{"peca":"ametista_mar","indice":0,"x":2,"y":182},"grutas-alavanca-distante":{"peca":"dobra_ametista","indice":0,"x":74,"y":312},"grutas-boca-labirinto":{"peca":"dobra_ametista","indice":0,"x":2,"y":182},"grutas-trio-tres-refugios":{"peca":"dobra_ametista","indice":0,"x":2,"y":324},"grutas-chefe-cofre-das-espumas":{"peca":"ametista_mar","indice":0,"x":2,"y":54}};
// Peças nativas aprovadas das Grutas. Cada linha preserva a cor original
// do PNG; a espuma de contato é pintada só sobre os vazios da própria peça.
function pintarAmetistaAprovada(pintar, cristal) {
  const { peca, x, y } = cristal;
  const linhas = AMETISTAS_APROVADAS[peca];
  const ocupa = new Set();
  for (const [u, v, l, cor] of linhas) {
    pintar(cor, x + u, y + v, l, 1);
    for (let i = 0; i < l; i++) ocupa.add((u + i) + v * 96);
  }
  const espuma = peca === 'ametista_mar'
    ? [[7,38,6,0],[11,39,4,1],[17,41,9,0],[25,40,8,0],[28,41,4,1],[36,38,7,0]]
    : [[11,37,8,0],[15,38,4,1],[24,39,10,0],[33,40,6,0],[41,41,12,0],[44,42,5,1],
      [57,43,9,0],[67,40,11,0],[73,41,5,1],[79,38,9,0]];
  const tintas = ['#8ca7bf', '#edf0e8'];
  for (const [u, v, l, tinta] of espuma) for (let i = 0; i < l; i++) {
    if (!ocupa.has((u + i) + v * 96)) pintar(tintas[tinta], x + u + i, y + v, 1, 1);
  }
}
