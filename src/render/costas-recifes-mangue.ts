import type { TemaDeCosta } from './travessia-praia.ts';

const CORAL = [
  '...........bb.....p.......', '......bb...bab...pup......',
  '...p..babb.bab..pulpp.....', '..pup..babaabb..puup...pp.',
  '..pulp..bbaab..puupp..plp.', '...puupp.bbab.ppuup..pup..',
  '....ppuup.babbpuupp.ppup..', '......ppuubbapuuup.ppup...',
  '...p....ppubbaaup.puup....', '..pup....ppuaauuppuup.....',
  '..puupp....puaauuuup......', '...ppuupppppuuaaaup.......',
  '.....ppuuuuuuuaaaap.......', '.......ppppppuaaaapp......',
  '..........pppuaaaappp.....', '.........ppppppppppppp....',
  '......wwwwwwwwwwwwwwwwww..', '........woooooooooooow....',
] as const;

const RECIFE_SUBMERSO = [
  '..........dddddddd......', '......ddddmmmmmmddddd...',
  '....ddmmmmmmllllmmmcdd..', '..ddmmmmlllllmmmmccmcdd.',
  'ddmmllllllllmmccccccccdd', 'dmmmmmmmmmmccccccmmmcccd',
  '.dddmmmmmmcccccmmmmmcdd.', '..wwdddddddddddddddddww.',
  '...wwwoooooooooooowww...', '......wwwwwwwwwwww......',
] as const;

const ANEMONA = [
  '......p..p.....', '..p...up.l..p..', '..lp.pup.lpuu..',
  '...lp.up.lupp..', '.lppuppuuup....', '..lpuuuuuuupp..',
  '..pppuuuuupp...', '....ppppppp....', '..wwwooooooww..', '.....wwwww.....',
] as const;

const RAIZES_ALTAS = [
  '............l...........', '..........lfvl..........',
  '.....lll.lfflv..........', '....llvllfvflv.ffl......',
  '...lffvllllfvlffvl......', '....vfvfvvffffvff.vl....',
  '.....vvvlvvfvffvv.vfl...', '........vfvfrvvlvffv....',
  '.......vvrrvrrrvfvv.....', '.........rrmrrvvr.......',
  '........rmmrrmmrr.......', '.......rmrsmrrmsmr......',
  '......rmrssmrrssmr......', '.....rmrs..mrr..smr.....',
  '....rmrs...mrr...smrr...', '...rmrs...mrr.....srrr..',
  '..ramrs..mrr.......rarr.', '.amrrs..mrra........mra.',
  '.arrs..aar...........rar', '..wwwwwmmmmwwwwwwwwwwww.',
  '....wooooooooooooooww...', '.......wwwwwwwwwww......',
] as const;

const RAIZ_BAIXA = [
  '.....lll.............', '....lffv.............',
  '..llfvfl.............', '..vfvfvr..lv.........',
  '....vvvr.lfvl...l....', '......mrrvfvvl.lfl...',
  '.......mrsrvvr.lfvf..', '......mrs..rmmrrvr...',
  '.....mrs.....rmrr....', '....mrs.....mrrsmr...',
  '...mrrs....mrs...mr..', '..rrrs....mrs.....rm.',
  '.wwwwwwwwwrw..wwwwwww', '..woooooooooooooooww.', '....wwwwwwwwwwwww....',
] as const;

const TRONCO_ENCALHADO = [
  '.....s...m.....l.......', '....rs..mr....lvl......',
  '....ms.mrs...llfvl.....', '.....rmrss.rvfvffv.....',
  '.....rrmsrrrvrvvv......', '....trrmmrmmrrrrr......',
  '...trrrmmrrmmrrmmr.....', '..trmmrrmmrmmrsrmrr....',
  '.trrrmsrrmssrs..mmrrs..', '.tmrss..rssrs....rmrss.',
  '..rss....sss......rss..', '...wwwwwwwwwwwwwwwwww..',
  '......wooooooooooow....',
] as const;

const FOLHAS_NA_LAMA = [
  '......lll....', '...lllfvvl...', '..lfflvfv....',
  '..lffvrr..ll.', '...vfmrlflvv.', '....mrrfvv...', '..wwmrrwv....',
] as const;

const CORAIS = {
  p: '#753f61', u: '#bd758b', l: '#f0af9f', b: '#35616b',
  a: '#58918c', w: '#23748a', o: '#5aa9a4',
};
const PEDRAS_DO_RECIFE = {
  d: '#283f57', m: '#4e7489', l: '#82b6bd', c: '#3c526b', w: '#23748a', o: '#5aa9a4',
};
const MANGUEZAL = {
  l: '#a4ad5d', f: '#699052', v: '#41694b', r: '#755642',
  m: '#9b7550', s: '#533d36', a: '#bd925a', t: '#c89e62', w: '#435f48', o: '#788660',
};

const CONCHA_NACARADA = [
  '.........dddd.........', '......dddllllddd......',
  '....ddlllbbbbllldd....', '...dlbbbllllbbbblld...',
  '..dlbblffppfflbblldd..', '.dlbblfppffppflbblldd.',
  'dlblffppffffppfflbllpd', 'dlblfppffffffppflbllpd',
  '.dpllfppffffppfllbfpd.', '..dpfllffppfflllfpd...',
  '....dppflllllfppdd....', '......dddddddddd......',
] as const;

const CONCHA_ESPIRAL = [
  '........ddd........', '......ddllpdd......', '.....dlbblpffd.....',
  '....dlbfplppffd....', '...dlbflbdpflffd...', '..dlbflbdflpflffd..',
  '.dlblfdbpblflplffd.', '.dlblfdplflplplffd.', 'dlblllfflplplplfffd',
  'dlbllpflplplplffffd', '.dpllfplplplffffffd', '..dpppppfffppfffdd.',
  '....dddddddddddd...',
] as const;

export const TEMA_RECIFES: TemaDeCosta = {
  cores: {
    mar: '#153c58', fundo: '#17576d', raso: '#23748a', beira: '#368a94',
    aguaClara: '#69b8b0', espuma: '#ccede2', fundoOnda: '#205065', onda: '#4e889e',
    areia: '#e8d19d', areiaClara: '#fcdfb0', areiaPonto: '#cfb98a',
    areiaBorda: '#c19b74', barranco: '#a28165', barrancoEscuro: '#675b60',
    umida: '#9eb6aa', umidaSombra: '#7b9c9d', umidaLuz: '#c3cbb3',
    poca: '#498994', poucaLuz: '#7fbab1', cantos: '#ace0d6',
    rochaEscura: '#283b51', rochaFace: '#4a687c', rochaFaceClara: '#628da2',
    rochaTopo: '#7a9fa9', rochaSol: '#b9c8b9', rochaMeio: '#515d74',
    plantaSombra: '#47736e', plantaFolha: '#66928d', plantaLuz: '#a5b398',
    conchaEscura: '#4d5576', conchaSombra: '#98a7b7', conchaFace: '#b9bec9',
    conchaLuz: '#dde6dd', conchaBrilho: '#fff6dc',
  },
  enfeites: [
    { desenho: RECIFE_SUBMERSO, paleta: PEDRAS_DO_RECIFE },
    { desenho: CORAL, paleta: CORAIS },
    { desenho: ANEMONA, paleta: CORAIS },
  ],
  desenhoConcha: CONCHA_NACARADA,
  tipo: 'recifes',
  raios: [17, 11, 6, 2],
};

export const TEMA_MANGUE: TemaDeCosta = {
  cores: {
    mar: '#303e35', fundo: '#3b5142', raso: '#435f48', beira: '#587050',
    aguaClara: '#808b61', espuma: '#b4bc86', fundoOnda: '#394b40', onda: '#5c7558',
    areia: '#b9a477', areiaClara: '#d9ca99', areiaPonto: '#a08862',
    areiaBorda: '#927457', barranco: '#82634c', barrancoEscuro: '#594a3d',
    umida: '#8e8560', umidaSombra: '#7b7254', umidaLuz: '#ad9c70',
    poca: '#5f735b', poucaLuz: '#859170', cantos: '#c4d29f',
    rochaEscura: '#354539', rochaFace: '#5d624b', rochaFaceClara: '#7b8260',
    rochaTopo: '#8c936a', rochaSol: '#bab786', rochaMeio: '#6d7457',
    plantaSombra: '#485c41', plantaFolha: '#68794a', plantaLuz: '#b2aa6d',
    conchaEscura: '#6e4638', conchaSombra: '#bc7451', conchaFace: '#cf885b',
    conchaLuz: '#ecb777', conchaBrilho: '#fff0b8',
  },
  enfeites: [
    { desenho: RAIZES_ALTAS, paleta: MANGUEZAL },
    { desenho: RAIZ_BAIXA, paleta: MANGUEZAL },
    { desenho: FOLHAS_NA_LAMA, paleta: MANGUEZAL },
  ],
  desenhoConcha: CONCHA_ESPIRAL,
  tipo: 'mangue',
  raios: [10, 6, 3, 1],
};

export const RAIZ_DE_MARGEM = [
  { desenho: RAIZES_ALTAS, paleta: MANGUEZAL },
  { desenho: RAIZ_BAIXA, paleta: MANGUEZAL },
  { desenho: TRONCO_ENCALHADO, paleta: MANGUEZAL },
] as const;
