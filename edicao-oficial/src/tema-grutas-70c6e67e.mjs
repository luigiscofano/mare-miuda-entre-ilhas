                                                        

// Volumes chapados e baixos, sem círculos claros que pareçam uma pérola.
const ESTALACTITES = [
  '....sssssssssssss........', '..ssssmmmmsmmmmsssss.....',
  '.smmmmmmmmmmmmlmmmsss....', 'smmmmllllmlllmmmmmmsms...',
  '.ssmmmmmshmmmmmmmsmmss...', '...ssmshs.hmsmsms.ms.....',
  '.....shs..hms.ms..s......', '......s....ss..s.........',
  '...wwwwwwwwwwwwwww.......', '......wooowwwwooowww.....',
  '........wwwwwww..........',
]         ;

const ROCHA_MINERAL = [
  '...............ssss.......', '............sssmmms.......',
  '........ssssmmmmmmmsss....', '......ssmmmmhhhhmmmmmms...',
  '....ssmmmmhhmhhmmmmmcms...', '..ssmmmmmhmhmmmmcccmmcms..',
  '.smmmmhmmmhmccccmmmmmcms..', 'smmmhhmmmhmmccccmcmmcmmms.',
  '.smmmmhmmmhmmmmccmcmcmmms.', '..ssmmmmmmmmmcmmmcccmmss..',
  '....ssssssmmmmmmmmmsww....', '......wwwwsssssssswww.....',
  '........wooooooooww.......',
]         ;

const ROCA_VAZADA = [
  '.........sss............', '........ssmss...........', '.......ssmmsmss.........',
  '.......smmmsmms.........', '......smmhmmmsmss.......', '......smmmsmsmmms.......',
  '.....ssmcmsmm..mss......', '....ssmmcmsm....mss.....', '...ssmmccmsm....mcss....',
  '..ssmmccmmsm...mmccss...', '.ssmmcmmmmsmm.mmmmccsss.',
  'sssssssssmmmsmmmmmmmmss.', '...wwwwwwssssssssssww...', '........wooooooooow.....',
]         ;

const LAJE_DE_TEMPESTADE = [
  '........ssssss...........', '.....ssssmmlmss..........',
  '...ssmmllmmmmsmss........', '..smmllmmmmmmsmmsss......',
  '.smmmmmhmmmmsmmmmmmsss...', 'smmhmmhmhmmsmmmchhhhmmss.',
  '.ssmmhmhmmsmmccccmcmmmmmss', '...ssmmmmmsmmccccmmmmmmss.',
  '.....sssssssssssssssssw..', '.......wwwoooooowwwww....',
]         ;

const ESPUMA_DA_BAIA = [
  '...........w.............', '.......wwwwwwwww.........',
  '....wwwwwwoowwwwwwww.....', '..wwwwooohhhoowwwowww....',
  '....wwoooohhhhoowooooow..', '.......wwoooooowwhhoow...',
  '........wwwwwoowoowww....', '............wwwwww.......',
]         ;

const VAGAS_BAIXAS = [
  '...............ww..........', '........wwwwwwwooow........',
  '....wwwwwoooowwwwwwwwww....', '..wwwwoowwwwwooooooooooww..',
  '.....wwwwwwoowwwwwoooow....', '..........wwwwwwwwww.......',
]         ;

const PENEDOS_DO_FAROL = [
  '...............sss........', '..............ssmss.......',
  '.............ssmmmss......', '.........sssssmmmmms......',
  '........ssmmmssmmmms......', '.......ssmmmmssmmmms......',
  '......ssmmhhmssmmcmss.....', '....ssssmmmhmmssmmmcss....',
  '..sssmmssmmmmmmmsmcmcss...', '.ssmmmmsmmmmmmcmmsmccmsss.',
  'ssmmcmcmmmmmmmcmmmcmmmcmss', '.ssssmmcmcmmmcmmsccmmsww..',
  '....wwsssssssssssswwww....', '......woooooooooww........',
]         ;

const BANCADA_DE_ARDOZIA = [
  '.......sssssss...........', '....ssssmmmmmsss.........',
  '...smmmhmhmmmcmssss......', '..smmhmmhmmmmmcmcmsss....',
  '.smmhmmmmmmmcmcmcmcms....', 'smcmcmcmcmcmcmcmmmmms....',
  '.ssssmcmcmmmmmmscmcmmss..', '....sssssssssssmmmcmmms..',
  '.......wwwwwwwwwsssssww..', '..........woooooowwww....',
]         ;

const AGUA_DE_ANIL = [
  '.......wwwww.............', '....wwwoooooowwww........',
  '..wwwooowwwwwwwwwwwww....', '...wwwwwwwooooowowoww....',
  '.......wwwwwwwwwwwww.....', '...........wwwwwww.......',
]         ;

const GRUTA = {
  s: '#423e57', m: '#68657d', l: '#8f8aa0', h: '#8a7e98',
  c: '#554e68', w: '#3d465c', o: '#626c84',
};
const MAR_AGITADO = {
  s: '#364353', m: '#536171', l: '#818f93', h: '#889c9e',
  c: '#475567', w: '#486477', o: '#68899a',
};
const NOITE = {
  s: '#333b62', m: '#545d85', h: '#687199', c: '#444970',
  w: '#333e62', o: '#4a577e',
};

const CONCHA_GRUTAS = [
  '.......dddd.......', '....dddbbblddd....',
  '..ddlbbbblllpldd..', '.dlbbblfffllpplpd.',
  'dlbbllffppfllfpd..', 'dlbllffppppfllfpd.',
  'dplflffppffpllpfd.', '.dpflffllflplfpd..',
  '..dppflfflffppd...', '....dddddddddd....',
]         ;

const CONCHA_RESSACA = [
  '........dddd.........', '......ddlllldd.......',
  '.....dlblllplpdd.....', '...ddlbfllfflplpdd...',
  '.ddlbllflplflflpld...', 'dlbllflfplflplflpdd..',
  'dlblflfplflplflblfpd.', '.dpfllflplflplflpffd.',
  '..dpfllflplflflpffpd.', '...dppfplflflfpffpd..',
  '.....dpppffffpppd....', '........dddddddd.....',
]         ;

const CONCHA_FAROL = [
  '.....ddddd.............', '...ddllblld............',
  '..dlbbllflddd..........', '.dlblllflldllldd.......',
  '.dlbldflflllllplddd....', 'dlbldflfllpllplpllldd.',
  'dlbldflflplplplplpfpd.', 'dlblffflplplplplpfpd..',
  '.dplflfplplplfpppdd...', '..dplfffpffpppdd......',
  '...dppffffppddd.......', '.....ddddddd..........',
]         ;

export const TEMA_GRUTAS              = {
  cores: {
    mar: '#33364b', fundo: '#3e4158', raso: '#484f65', beira: '#5f6179',
    aguaClara: '#828298', espuma: '#c2bdc4', fundoOnda: '#3a4157', onda: '#576179',
    areia: '#b6a795', areiaClara: '#d0bda5', areiaPonto: '#9e918c',
    areiaBorda: '#8d807d', barranco: '#766b78', barrancoEscuro: '#5f566b',
    umida: '#8c8790', umidaSombra: '#777583', umidaLuz: '#9c9395',
    poca: '#54677e', poucaLuz: '#788396', cantos: '#d0c6d2',
    rochaEscura: '#464153', rochaFace: '#68586f', rochaFaceClara: '#806882',
    rochaTopo: '#9a839d', rochaSol: '#bbb0b4', rochaMeio: '#75617c',
    plantaSombra: '#646052', plantaFolha: '#7b7558', plantaLuz: '#93846b',
    conchaEscura: '#695164', conchaSombra: '#a28797', conchaFace: '#baa7b4',
    conchaLuz: '#dbcac9', conchaBrilho: '#f9e9dc',
  },
  enfeites: [
    { desenho: ESTALACTITES, estrutura: true, paleta: GRUTA },
    { desenho: ROCHA_MINERAL, estrutura: true, paleta: GRUTA },
    { desenho: ROCA_VAZADA, estrutura: true, paleta: GRUTA },
  ],
  desenhoConcha: CONCHA_GRUTAS,
  tipo: 'grutas',
  raios: [10, 6, 3, 1],
};

export const TEMA_RESSACA              = {
  cores: {
    mar: '#293d50', fundo: '#314b60', raso: '#3f6074', beira: '#556f82',
    aguaClara: '#829aa3', espuma: '#bbc4b6', fundoOnda: '#33495c', onda: '#5f7c90',
    areia: '#c5a078', areiaClara: '#e0bd90', areiaPonto: '#b48c6e',
    areiaBorda: '#9a765e', barranco: '#8a6656', barrancoEscuro: '#67504a',
    umida: '#8f8980', umidaSombra: '#788188', umidaLuz: '#a39a87',
    poca: '#557183', poucaLuz: '#7793a2', cantos: '#d2dfd5',
    rochaEscura: '#414555', rochaFace: '#596269', rochaFaceClara: '#74848c',
    rochaTopo: '#87969a', rochaSol: '#b1b3a3', rochaMeio: '#627577',
    plantaSombra: '#596857', plantaFolha: '#7d8664', plantaLuz: '#a7a379',
    conchaEscura: '#693e40', conchaSombra: '#a25547', conchaFace: '#bc6b4f',
    conchaLuz: '#d99166', conchaBrilho: '#f6cf9b',
  },
  enfeites: [
    { desenho: LAJE_DE_TEMPESTADE, estrutura: true, paleta: MAR_AGITADO },
    { desenho: ESPUMA_DA_BAIA, paleta: MAR_AGITADO },
    { desenho: VAGAS_BAIXAS, paleta: MAR_AGITADO },
  ],
  desenhoConcha: CONCHA_RESSACA,
  tipo: 'ressaca',
  raios: [14, 9, 4, 2],
};

export const TEMA_FAROL              = {
  cores: {
    mar: '#242d52', fundo: '#2c3a63', raso: '#3a4872', beira: '#505984',
    aguaClara: '#7c82a0', espuma: '#c2c3bd', fundoOnda: '#2d385a', onda: '#4b5982',
    areia: '#d5b67d', areiaClara: '#ecd19b', areiaPonto: '#bca075',
    areiaBorda: '#a88a6e', barranco: '#997c60', barrancoEscuro: '#6d5961',
    umida: '#9d9186', umidaSombra: '#7e798b', umidaLuz: '#b2a08d',
    poca: '#5b6487', poucaLuz: '#7e83a1', cantos: '#c7c9de',
    rochaEscura: '#3d4261', rochaFace: '#57607f', rochaFaceClara: '#6e7896',
    rochaTopo: '#828ca4', rochaSol: '#b4b4b5', rochaMeio: '#666989',
    plantaSombra: '#6a685b', plantaFolha: '#8e8b62', plantaLuz: '#ada172',
    conchaEscura: '#544564', conchaSombra: '#8a719e', conchaFace: '#a790b9',
    conchaLuz: '#c7b6d1', conchaBrilho: '#f7d9ae',
  },
  enfeites: [
    { desenho: PENEDOS_DO_FAROL, estrutura: true, paleta: NOITE },
    { desenho: BANCADA_DE_ARDOZIA, estrutura: true, paleta: NOITE },
    { desenho: AGUA_DE_ANIL, paleta: NOITE },
  ],
  desenhoConcha: CONCHA_FAROL,
  tipo: 'farol',
  raios: [16, 10, 4, 2],
};
