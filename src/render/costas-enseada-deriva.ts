import type { TemaDeCosta } from './travessia-praia.ts';

// A restinga usa silhuetas baixas, inclinadas pelo vento, sem desenhar aves.
const JUNCO_DA_RESTINGA = [
  '....l..........................', '.....lh....l...................',
  '..ll..rh....lhl.....lh.........', '....l..rh....rhh...lhh.........',
  '.....l..rh....rhh.lhh..........', '......h..rh..rrh.lhr..ll.......',
  '.......h..hr.rhr.hhrrlh........', '........hr.hrhrr.hrllh.........',
  '.........hhrhhrrlrrh...........', '.......ssrhhrhrrhrss...........',
  '.....ssssssrrrrrsssssss........', '....wwwssssssssssssswww........',
  '......wwooooooowwwwwww.........', '..........wwwwwwwww............',
] as const;

const LAJE_DA_ENSEADA = [
  '...............ssssss.......', '...........ssssmmmmms.......',
  '........ssssmmmmhhhmmmss....', '..sssssssmmmmmhhhhhmmmmss...',
  '.smmmmmmmmmmhhhhhmmmmmmms...', 'smmhhhhmmmmmmmmmcccccccmmss.',
  'smmccccccccccccccccccccccmms', '.ssssmmmmmmmmccccccccccmmmmms',
  '...ssssssssssmmmmmmmmmmsss..', '......wwwwwwwwwwwwwww.......',
  '...........wooooooww........',
] as const;

const ESPUMA_AFASTADA = [
  '...........o.........', '........ooohh........', '...oooohhhhooooooooo.',
  '.ooooooowwwwwwhhooo..', '...wwwwwwwhhhhoow....', '.......woowww........',
  '..........www........',
] as const;

const BOIA_OCEANICA = [
  '........h.........', '........hh........', '.......mho........', '.......mom........',
  '......smmmm.......', '.....smmmccs......', '.....scccmms......', '....smmmmmccs.....',
  '....smhmmmmmcs....', '.....sccccccs.....', '..wwwwsssssswwwww.',
  '....wooooooooow...', '.......wwww.......',
] as const;

const RAMO_DO_CANAL = [
  '...ll...................', '..lh.l.....llh..........', '...lrhl.....lrll........',
  '....rhr......rhr....ll..', '...rrr...l..rrr....hhll.',
  '..hrr...lr..hrr...rrrh..', '..rr....hrrrrrr..hhrr...',
  '..rrrr..rrrrr...rrrr....', '.wwrrrrrrrrrr.rrrrww....',
  '..woooowwwwwwoooow......', '.....wwwwwwwwww.........',
] as const;

const VAGA_DE_JADE = [
  '.......wow................', '....wwwwooooww...........',
  '..wwwoooohhhoooowww......', '...woooooooooooooooooow..',
  '.....wwwwwwwwooooooww....', '..........wwwwwww........',
] as const;

const RESTINGA = {
  l: '#d0ce96', h: '#a5b385', r: '#727e73',
  s: '#465a66', w: '#356479', o: '#6499a8',
};
const LAJES = { s: '#344654', m: '#55677b', h: '#929fa4', c: '#485b70', w: '#36637a', o: '#578391' };
const ESPUMA = { o: '#7ba7b4', h: '#a9c4c7', w: '#4c7c94' };
const BOIA = { s: '#31564b', h: '#f7d992', m: '#ce9063', c: '#925642', w: '#3f8274', o: '#78a890' };
const FOLHAS = { l: '#b8b977', h: '#80a06c', r: '#5f855b', w: '#3f8274', o: '#75ab90' };
const VAGA = { w: '#3f8274', o: '#689e91', h: '#85a998' };

const CONCHA_PONTA_VIOLETA = [
  '..............dddd....', '............ddlllld...', '..........ddlblllld...',
  '.........dlbllfflpd...', '......dddllfllfplpd...', '.....dlbllflffpplpd...',
  '...ddlbfllflpppldpd...', '..dlbllflflpfpdpdd....', '.dlblfllplpffdppd.....',
  'dlbllflffpfdppdd......', 'dlbpfffpfddppd........', '.dpffffffpppd.........',
  '..ddppppppdd..........', '....dddddd............',
] as const;

const CONCHA_CRESCENTE = [
  '...dddd...........ddd.', '..dllld..........dlld.',
  '.dlblld.........dlfld.', 'dlblbfd.......ddlpfd..',
  'dlfbffld.....dlbfpd...', 'dlfbflldd...dlbfpd....',
  'dlfbpflfldddlbfpd.....', '.dlfbpflflbllfpd......',
  '.dlfbplflbflfpd.......', '..dlfbpffflfpd........', '...dppfllllpd.........',
  '.....dddddd...........',
] as const;

export const TEMA_ENSEADA: TemaDeCosta = {
  cores: {
    mar: '#284858', fundo: '#34576a', raso: '#426d7f', beira: '#5c8b98',
    aguaClara: '#89b1b6', espuma: '#d3e8df', fundoOnda: '#335966', onda: '#568298',
    areia: '#e8d7b3', areiaClara: '#f4e5c1', areiaPonto: '#c9b99d',
    areiaBorda: '#b0a28d', barranco: '#918777', barrancoEscuro: '#6c6d70',
    umida: '#abb4a9', umidaSombra: '#8a9e9b', umidaLuz: '#c8c7ad',
    poca: '#648b98', poucaLuz: '#8eadae', cantos: '#c3e0dd',
    rochaEscura: '#3b495b', rochaFace: '#56687d', rochaFaceClara: '#6e8195',
    rochaTopo: '#889fa8', rochaSol: '#bac4b6', rochaMeio: '#556774',
    plantaSombra: '#59736b', plantaFolha: '#839470', plantaLuz: '#b3bc8b',
    conchaEscura: '#584b67', conchaSombra: '#98798e', conchaFace: '#b599ae',
    conchaLuz: '#d6c0c6', conchaBrilho: '#fff0ce',
  },
  enfeites: [
    { desenho: LAJE_DA_ENSEADA, paleta: LAJES },
    { desenho: JUNCO_DA_RESTINGA, paleta: RESTINGA },
    { desenho: ESPUMA_AFASTADA, paleta: ESPUMA },
  ],
  desenhoConcha: CONCHA_PONTA_VIOLETA,
  tipo: 'enseada',
  raios: [15, 10, 5, 2],
};

export const TEMA_DERIVA: TemaDeCosta = {
  cores: {
    mar: '#2e655e', fundo: '#36786c', raso: '#428a78', beira: '#5fa092',
    aguaClara: '#92c1a5', espuma: '#e1e6be', fundoOnda: '#3d7469', onda: '#61998a',
    areia: '#e8c893', areiaClara: '#f5dda8', areiaPonto: '#cdae79',
    areiaBorda: '#bb9563', barranco: '#a68361', barrancoEscuro: '#735f4d',
    umida: '#b4b18b', umidaSombra: '#949d82', umidaLuz: '#d4c096',
    poca: '#5d8c77', poucaLuz: '#80a891', cantos: '#c7dfb6',
    rochaEscura: '#42564b', rochaFace: '#5b7561', rochaFaceClara: '#75907b',
    rochaTopo: '#9aa38c', rochaSol: '#c3c6a1', rochaMeio: '#657664',
    plantaSombra: '#587051', plantaFolha: '#819266', plantaLuz: '#aeb77b',
    conchaEscura: '#78513c', conchaSombra: '#c29564', conchaFace: '#ddaf68',
    conchaLuz: '#f5ce83', conchaBrilho: '#fff3c6',
  },
  enfeites: [
    { desenho: RAMO_DO_CANAL, paleta: FOLHAS },
    { desenho: BOIA_OCEANICA, paleta: BOIA },
    { desenho: VAGA_DE_JADE, paleta: VAGA },
  ],
  desenhoConcha: CONCHA_CRESCENTE,
  tipo: 'deriva',
  raios: [10, 6, 3, 1],
};
