import { PRAIA } from './praia.ts';
import { RECIFES } from './recifes.ts';
import { MANGUE } from './mangue.ts';
import { ENSEADA } from './enseada.ts';
import { DERIVA } from './deriva.ts';
import { GRUTAS } from './grutas.ts';
import { RESSACA } from './ressaca.ts';
import { FAROL } from './farol.ts';
import type { MundoDaExpansao, TravessiaDaExpansao } from './tipos.ts';

const POR_MUNDO: Readonly<Record<MundoDaExpansao, readonly TravessiaDaExpansao[]>> = {
  praia: PRAIA, recifes: RECIFES, mangue: MANGUE, enseada: ENSEADA, deriva: DERIVA,
  grutas: GRUTAS, ressaca: RESSACA, farol: FAROL,
};

export const EXPANSAO = Object.values(POR_MUNDO).flat();
export const travessiasDaExpansao = (mundo: MundoDaExpansao | 'praia-enseadinha' | 'arquipelago') =>
  mundo === 'arquipelago' ? [] : POR_MUNDO[mundo === 'praia-enseadinha' ? 'praia' : mundo];

// O save aceita somente IDs cadastrados, e não qualquer texto com o prefixo da expansão.
export const IDS_DA_EXPANSAO = new Set<string>(EXPANSAO.map(({ fase }) => fase.id));
