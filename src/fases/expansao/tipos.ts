import type { Fase } from '../../motor/index.ts';

export type MundoDaExpansao = 'praia' | 'recifes' | 'mangue' | 'enseada' | 'deriva' | 'grutas' | 'ressaca' | 'farol';
export type IdFaseDaExpansao = `${MundoDaExpansao}-exp-${string}`;

export type TravessiaDaExpansao<Mundo extends MundoDaExpansao = MundoDaExpansao> = Readonly<{
  depoisDe: string;
  fase: Fase & { readonly id: `${Mundo}-exp-${string}` };
}>;
