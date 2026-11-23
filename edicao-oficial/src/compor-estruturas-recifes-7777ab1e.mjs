import { crescimentoDaBaseNaMascara } from '@@MARE:modulo:src/render/animacao-visual.mjs@@';
import { apararCristaSolta } from '@@MARE:modulo:src/render/animacao-visual.mjs@@';
import { pintarVisitaDaPraia, comporVisitasDaPraia } from '@@MARE:modulo:src/nomes-das-rochas-6e85a20e.mjs@@';
                                                                
                                              
import { costaAprovada, larguraDaCostaOriginal } from '@@MARE:modulo:src/largura-da-costa-original-5a70c2b7.mjs@@';
import { encaixarRochas, pintarTraçosDoMar, traçosNoMar } from '@@MARE:modulo:src/render/encaixe-costeiro.mjs@@';
                                                                
                                                              
import { pintarPecaRecifes } from '@@MARE:modulo:src/pecas-recifes-0665cea8.mjs@@';

                                                                                                                      
                                         
                                                                            
                         
   

// Cada fase tem uma composição fixa de três formas distintas. Estas são
// posições decorativas em água aberta e nunca fazem parte da travessia.
const LUGARES                                                                                 = {
  'recife-pedra-firme': [['coral-encrostado', 2, 17], ['cunha-de-calcario', 2, 132], ['calcario-em-laje', 343, 48]],
  'recifes-exp-arco-do-coral': [['tres-pedras', 14, 35], ['calcario-em-laje', 14, 150], ['coral-encrostado', 331, 58]],
  'recifes-exp-ponte-em-zigue': [['tres-pedras', 14, 52], ['coral-encrostado', 331, 55], ['calcario-em-laje', 331, 197]],
  'recifes-exp-ombro-do-costao': [['tres-pedras', 14, 39], ['pedras-pareadas', 14, 205], ['coral-encrostado', 331, 78]],
  'recife-duas-pocas': [['pedras-pareadas', 2, 32], ['cunha-de-calcario', 390, 32], ['coral-encrostado', 390, 153]],
  'recifes-exp-meia-volta-de-nacre': [['tres-pedras', 14, 55], ['calcario-em-laje', 331, 49], ['pedras-pareadas', 331, 241]],
  'recifes-exp-bacia-estreita': [['pedras-pareadas', 14, 42], ['tres-pedras', 331, 59], ['calcario-em-laje', 331, 238]],
  'recifes-exp-poco-do-ourico': [['coral-encrostado', 14, 65], ['tres-pedras', 14, 208], ['pedras-pareadas', 331, 62]],
  'recife-retorno': [['pedras-pareadas', 2, 65], ['tres-pedras', 2, 215], ['coral-encrostado', 343, 78]],
  'recifes-exp-volta-das-fendas': [['coral-encrostado', 14, 78], ['calcario-em-laje', 14, 244], ['cunha-de-calcario', 331, 52]],
  'recifes-exp-porta-do-norte': [['calcario-em-laje', 14, 39], ['cunha-de-calcario', 331, 49], ['pedras-pareadas', 331, 234]],
  'recifes-exp-costura-de-sal': [['coral-encrostado', 14, 42], ['tres-pedras', 331, 78], ['calcario-em-laje', 331, 228]],
  'recife-degraus': [['pedras-pareadas', 14, 35], ['coral-encrostado', 14, 160], ['cunha-de-calcario', 331, 35]],
  'recifes-exp-ilhas-de-vies': [['tres-pedras', 2, 42], ['calcario-em-laje', 390, 72], ['coral-encrostado', 390, 231]],
  'recife-janelas': [['cunha-de-calcario', 2, 32], ['calcario-em-laje', 2, 194], ['coral-encrostado', 438, 55]],
  'recifes-exp-anel-da-concha': [['calcario-em-laje', 2, 68], ['cunha-de-calcario', 2, 218], ['pedras-pareadas', 343, 92]],
  'recife-pedra-oco': [['calcario-em-laje', 2, 35], ['cunha-de-calcario', 343, 58], ['coral-encrostado', 343, 194]],
  'recife-volta-costao': [['tres-pedras', 2, 45], ['calcario-em-laje', 390, 88], ['coral-encrostado', 390, 238]],
  'recife-pocas-suspensas': [['coral-encrostado', 2, 48], ['pedras-pareadas', 390, 93], ['tres-pedras', 390, 276]],
  'recifes-exp-margens-de-tres': [['coral-encrostado', 2, 59], ['tres-pedras', 343, 78], ['pedras-pareadas', 343, 234]],
  'recife-cintura': [['cunha-de-calcario', 2, 68], ['pedras-pareadas', 486, 68], ['tres-pedras', 486, 198]],
  'recifes-exp-triangulo-do-baixio': [['cunha-de-calcario', 2, 74], ['calcario-em-laje', 390, 93], ['tres-pedras', 390, 257]],
  'recifes-exp-saida-apos-espuma': [['calcario-em-laje', 2, 59], ['tres-pedras', 2, 253], ['pedras-pareadas', 390, 63]],
  'recife-tres-aneis': [['tres-pedras', 2, 65], ['calcario-em-laje', 2, 271], ['cunha-de-calcario', 486, 108]],
  'recifes-exp-coroa-da-vazante': [['cunha-de-calcario', 2, 100], ['pedras-pareadas', 390, 117], ['coral-encrostado', 390, 314]],
  'recife-fio-coral': [['tres-pedras', 2, 38], ['cunha-de-calcario', 2, 183], ['calcario-em-laje', 343, 64]],
  'recife-mosaico': [['coral-encrostado', 2, 67], ['cunha-de-calcario', 438, 86], ['calcario-em-laje', 438, 261]],
  'recife-chefe-guardiao-das-pocas': [['cunha-de-calcario', 3, 70], ['tres-pedras', 298, 150], ['pedras-pareadas', 630, 97]],
  'recife-chefe-vigia-do-recife': [['cunha-de-calcario', 3, 61], ['tres-pedras', 441, 245], ['calcario-em-laje', 578, 155]],
};

const TAMANHO = 48;
function estrutura(peca              , x        , y        )                   {
  return { x, y, largura: TAMANHO, altura: TAMANHO, peca };
}

export function comporEstruturasRecifes(fase                           , largura        , altura        ,
  origemX        , origemY        ,
)                              {
  const lugares = LUGARES[fase.id];
  if (lugares) {
    const anterior = larguraDaCostaOriginal(fase.id);
    const rochas = anterior !== undefined && !costaAprovada(fase.id, fase.mapa)
      ? encaixarRochas(lugares, Math.max(394, anterior * TAMANHO + 104), { largura, altura, origemX, origemY }, fase.mapa[0].length)
      : lugares;
    const locais = rochas.map(([forma, x, y]) => estrutura(forma, x, y));
    const visitas = comporVisitasDaPraia(fase.id, { largura, altura, inicioDaGrade: origemX,
      fimDaGrade: origemX + fase.mapa[0].length * TAMANHO },
      locais.map(p => ({ ...p, preservar: p.peca === 'coral-encrostado' })));
    const visita = visitas.find(item => item.indice < locais.length);
    return [...locais.map((p, i) => i === visita?.indice ? { ...p, ...visita, peca: p.peca, visita } : p),
      ...visitas.filter(item => item.indice >= locais.length).map(nova => ({ ...nova, visita: nova }))];
  }
  // As partidas improvisadas não têm arranjo aprovado individual: mantêm
  // a mesma regra de três formas imóveis, sempre nas margens do quadro.
  const fim = origemX + fase.mapa[0].length * TAMANHO;
  const esquerda = Math.floor((origemX - TAMANHO) / 2);
  const direita = fim + Math.floor((largura - fim - TAMANHO) / 2);
  return [
    estrutura('calcario-em-laje', esquerda, Math.floor(altura * 0.23)),
    estrutura('coral-encrostado', direita, Math.floor(altura * 0.16)),
    estrutura('tres-pedras', direita, Math.floor(altura * 0.69)),
  ];
}

export function pintarEstruturasRecifes(pintar             , estruturas                             )       {
  for (const { peca, x, y, visita } of estruturas) {
    if (visita) pintarVisitaDaPraia(pintar, visita, [AZUL_ESPUMA, BRANCO_ESPUMA]);
    else pintarPecaRecifes(pintar, peca, x, y);
  }
}

const ESPUMAS                                                    
                                                  
       = {
  'calcario-em-laje': [
    [2, 29, [
      'bw............................................bb',
      '.b............................................b',
      '.b............................................b',
      '.b............................................b',
      'bb...........................................bbb',
      '.b...........................................b',
      '',
      '',
      '',
      '..............................bbbbww',
      '..................................bbb',
      '............bbbbwwwbbbbb',
      '................bbb...b',
    ]],
    [3, 29, [
      'b............................................b',
      '',
      '',
      '',
      '',
      '',
      '',
      'b........................................bbbb',
      'bbb....................................bbb',
      '..bb......................bbwwwbbbbbbbbb',
      '...bb.....................b.bbb...b',
      '..bb..bbbbwwwbbbbb......bbb',
      '..........bbb...b',
    ]],
    [2, 31, [
      '.b............................................b',
      '.b............................................b',
      '.b...........................................bb',
      '.b...........................................b',
      'bw...........................................bb',
      'bw........................................bbbbb',
      'bwww....................................bbbbbbb',
      '...bb......................bbbbb....bbbbb',
      '....bbw....................b..b',
      '......wwwbbbbb......bbbbwwwb',
      '......bbb...b...........bbb',
    ]],
  ],
  'coral-encrostado': [
    [6, 26, [
      '.b..............................bbbb',
      'bww................................bbbb',
      'bbw..................................bb',
      '.bw..................................bb',
      '..b..................................b',
      '..b..................................b',
      '..b..................................b',
      '.bb..................................bb',
      '..b.................................bb',
      '',
      '',
      '',
      '',
      '',
      '...............................wwb',
      '...........................bbbwwb',
      '........bbbbwwwbbbbb......bb..bbb',
      '............bbb...b',
    ]],
    [6, 26, [
      '.b..............................bbbb',
      '.bb................................bbb',
      'bbb..................................bb',
      '..b..................................b',
      '',
      '',
      '',
      '',
      '',
      '',
      '..b.................................b',
      '..b.................................b',
      '..b................................bb',
      '...bb..............................b',
      '....bb.........................bb.bbb',
      '.....bbw...................wbbbb...bb',
      '.......wwwbbbbb......bbbbwww...b',
      '.......bbb...b...........bbb',
    ]],
    [7, 31, [
      '.b..................................b',
      '.b..................................b',
      '.b..................................b',
      '.b.................................bb',
      'bw.................................bbb',
      'bw.................................bb',
      'bw.................................bb',
      '.b................................bb',
      '.www..............................b',
      '.bbwb............................bb',
      '..bbbbb...................b.......bb',
      '...b..bbb......bbbbwwwbbbbb',
      '.......b...........bbb...b',
    ]],
  ],
  'pedras-pareadas': [
    [4, 31, [
      '...b.....................................b',
      '..bb.....................................b',
      'bbb......................................bb',
      '.bb......................................b',
      '',
      '',
      '',
      '',
      '',
      '................................wwwb',
      '............................bbbbwbb',
      '..........bbbbwwwbbbbb..........bb',
      '..............bbb...b',
    ]],
    [5, 36, [
      'b.......................................b',
      'b......................................bb',
      'bbb..................................bbb',
      '..b.................................bb',
      '.b..bbb........................bbb.bbbb',
      '......bbw.................wwwbbbb...bb',
      '........wwwbbbbb......bbbbwbb...b',
      '........bbb...b...........bb',
    ]],
    [4, 31, [
      '...b.....................................b',
      '..bb.....................................b',
      '..b......................................b',
      '.bb......................................b',
      'bw.......................................bb',
      'bw.......................................bb',
      'bw......................................bbb',
      '.bbb..................................bbb',
      '...bw................................bb',
      '....wwwb............................bb',
      '....bbbbbb.................bbb.......bb',
      '......b..bbb......bbbbwwwbbbb',
      '..........b...........bbb...b',
    ]],
  ],
  'cunha-de-calcario': [
    [3, 24, [
      '.bbb......................................b',
      '.b........................................b',
      '.b........................................b',
      'bw........................................bbb',
      'bw........................................bbb',
      'bw.........................................bb',
      '.b.........................................b',
      '.b.........................................b',
      '.b.........................................b',
      'bb........................................bbb',
      '.b........................................b',
      '',
      '',
      '',
      '................................bww',
      '...........bbbbwwwbbbbb......bbbbbbb',
      '...............bbb...b...........b',
    ]],
    [3, 24, [
      'bwww......................................bb',
      '.b........................................b',
      '.b........................................b',
      '.b........................................b',
      'bb........................................bbb',
      '.b.........................................b',
      '',
      '',
      '',
      '',
      '',
      '',
      '.b.....................................bbbb',
      '.bbb...............................bbbbb',
      '...bbb..........................bbbb',
      '......bbbbwwwbbbbb......bbbbwwwbb.b',
      '..........bbb...b...........bbb',
    ]],
    [3, 24, [
      '.bbb......................................b',
      '',
      '',
      '',
      '',
      '',
      '',
      '.b.........................................b',
      '.b.........................................b',
      '.b........................................bb',
      '.b........................................b',
      'bw........................................bb',
      'bw.....................................bbbbb',
      'bwww...............................bbbbbbbbb',
      '...bbb.............................b',
      '.....wwwbbbbb......bbbbwwwbbbbb',
      '.....bbb...b...........bbb...b',
    ]],
  ],
  'tres-pedras': [
    [1, 25, [
      '..b..........................................b',
      '..b..........................................bb',
      '.bw...........................................bb',
      '.bw...........................................bb',
      'bbw...........................................bb',
      '.bb...........................................b',
      '.b............................................b',
      '.b............................................b',
      'bb............................................bb',
      '.b............................................b',
      '',
      '',
      '',
      '',
      '',
      '.............bbbbwwwbbbbb',
      '.................bbb...b.......bbbbwwwbbbb',
      '...................................bbb',
    ]],
    [2, 25, [
      '.b..........................................b',
      '.b..........................................bb',
      '.b...........................................b',
      'bb...........................................bb',
      '.b...........................................b',
      '',
      '',
      '',
      '',
      '',
      '',
      '.b...........................................b',
      '.b..........................................bb',
      '.bbbb.....................................bbb',
      '....bb.b.................................bb',
      '...bb..bbbbwwwbbbbb.....................bbbb',
      '...........bbb...b.......bbbbwwwbbbbb..bbbb',
      '.............................bbb...b....bb',
    ]],
    [1, 31, [
      '.b............................................b',
      '.b............................................b',
      '.b............................................b',
      '.b............................................b',
      'bww...........................................bb',
      'bbw...........................................bb',
      '.bw..........................................bbb',
      '..bbbb.....................................bbb',
      '.....bbww.................................bb',
      '.......bwwbbbbb......bbbbw...............bb',
      '.......bbb...b...........wwwbbbbb......bbbbb',
      '.........................bbb...b',
    ]],
  ],
};

const AZUL_ESPUMA = '#89b8cb';
const BRANCO_ESPUMA = '#e9f4ee';

export function pintarEspumaDasEstruturasRecifes(pintar             , estruturas                             ,
  podePintar                                   ,
)       {
  estruturas.forEach(({ peca, x, y, visita }, indice) => {
    if (visita) return;
    const variantes = ESPUMAS[peca];
    const [offsetX, offsetY, linhas] = variantes[indice % variantes.length];
    linhas.forEach((linha, j) => {
      for (let i = 0; i < linha.length; i++) {
        const sinal = linha[i];
        if (sinal === '.') continue;
        const px = x + offsetX + i;
        const py = y + offsetY + j;
        if (podePintar(px, py)) pintar(sinal === 'w' ? BRANCO_ESPUMA : AZUL_ESPUMA, px, py, 1, 1);
      }
    });
    const permite=(i,j)=>!['w','b'].includes(linhas[j]?.[i]) && podePintar(x+offsetX+i,y+offsetY+j);
    for(const [i,j,t] of crescimentoDaBaseNaMascara(linhas,offsetX,
      (i,j)=>podePintar(x+offsetX+i,y+offsetY+j))) {
      if(permite(i,j))pintar(t==='w'?BRANCO_ESPUMA:AZUL_ESPUMA,x+offsetX+i,y+offsetY+j,1,1);
    }
  });
}

// A espuma destacada segue a mesma crista de 19 × 4 px da Praia. As
// posições aprovadas são fixas; não respondem ao relógio ou a ataques.
const CRISTAS                                                                   = {
  'recife-pedra-firme': [[117, 162], [349, 160], [65, 27]],
  'recifes-exp-arco-do-coral': [[274, 21], [93, 200], [349, 181]],
  'recifes-exp-ponte-em-zigue': [[247, 244], [93, 241], [337, 122]],
  'recifes-exp-ombro-do-costao': [[97, 53], [22, 285], [274, 29]],
  'recife-duas-pocas': [[285, 61], [127, 61], [307, 195]],
  'recifes-exp-meia-volta-de-nacre': [[337, 29], [30, 215], [38, 119]],
  'recifes-exp-bacia-estreita': [[274, 29], [30, 215], [38, 119]],
  'recifes-exp-poco-do-ourico': [[349, 295], [22, 285], [274, 29]],
  'recife-retorno': [[349, 255], [337, 142], [22, 285]],
  'recifes-exp-volta-das-fendas': [[30, 215], [349, 255], [337, 142]],
  'recifes-exp-porta-do-norte': [[337, 29], [30, 215], [38, 119]],
  'recifes-exp-costura-de-sal': [[337, 29], [22, 285], [349, 295]],
  'recife-degraus': [[93, 200], [349, 181], [274, 21]],
  'recifes-exp-ilhas-de-vies': [[378, 142], [391, 295], [43, 119]],
  'recife-janelas': [[317, 73], [435, 218], [78, 218]],
  'recifes-exp-anel-da-concha': [[65, 43], [337, 29], [349, 255]],
  'recife-pedra-oco': [[117, 221], [337, 122], [18, 14]],
  'recife-volta-costao': [[307, 29], [70, 255], [21, 16]],
  'recife-pocas-suspensas': [[105, 323], [307, 315], [21, 19]],
  'recifes-exp-margens-de-tres': [[337, 34], [156, 338], [349, 338]],
  'recife-cintura': [[462, 29], [33, 285], [478, 295], [28, 16]],
  'recifes-exp-triangulo-do-baixio': [[21, 19], [21, 361], [109, 349]],
  'recifes-exp-saida-apos-espuma': [[378, 34], [307, 315], [21, 19]],
  'recife-tres-aneis': [[350, 111], [157, 111], [87, 329], [28, 21]],
  'recifes-exp-coroa-da-vazante': [[391, 380], [127, 111], [307, 38]],
  'recife-fio-coral': [[349, 218], [274, 25], [156, 252]],
  'recife-mosaico': [[420, 163], [25, 19], [25, 361]],
  'recife-chefe-guardiao-das-pocas': [[480, 21], [609, 210], [38, 11], [38, 224]],
  'recife-chefe-vigia-do-recife': [[41, 285], [161, 53], [566, 295], [572, 89]],
};

export function pintarEspumaSoltaRecifes(pintar             , fase                           ,
  quadro                                  , estruturas                             ,
)       {
  const { largura, altura } = quadro;
  if (larguraDaCostaOriginal(fase.id) !== undefined && !costaAprovada(fase.id, fase.mapa)) {
    const rochas = estruturas.map(({ peca, x, y }) => [peca, x, y]         );
    pintarTraçosDoMar(pintar, traçosNoMar(fase.mapa, quadro, rochas, true), [AZUL_ESPUMA, AZUL_ESPUMA, BRANCO_ESPUMA]);
    return;
  }
  const cristas = CRISTAS[fase.id] ?? [
    [Math.floor(largura * 0.21), 12],
    [Math.floor(largura * 0.71), altura - 18],
  ];
  for (const [x, y] of cristas) {
    pintar(AZUL_ESPUMA, x, y + 1, 14, 3);
    const [dx,l] = apararCristaSolta(x,y,8);
    pintar(BRANCO_ESPUMA, x + 3 + dx, y, l, 3);
    pintar(AZUL_ESPUMA, x + 14, y + 2, 5, 2);
    pintar(BRANCO_ESPUMA, x + 14, y + 2, 3, 1);
  }
}
