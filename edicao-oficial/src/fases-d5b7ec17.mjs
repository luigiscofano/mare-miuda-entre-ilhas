import { conferirRegrasDaCampanha } from '@@MARE:modulo:src/conferir-regras-da-campanha-b4dc2813.mjs@@';
import { ordem } from '@@MARE:modulo:src/campanha/fichas/ordem.mjs@@';
import { reutilizadas, perolas } from '@@MARE:modulo:src/campanha/fichas/bancada.mjs@@';
import { etapas as mundo1 } from '@@MARE:modulo:src/campanha/fichas/praia.mjs@@';
import { etapas as mundo2 } from '@@MARE:modulo:src/campanha/fichas/recifes.mjs@@';
import { etapas as mundo3 } from '@@MARE:modulo:src/campanha/fichas/mangue.mjs@@';
import { etapas as mundo4 } from '@@MARE:modulo:src/campanha/fichas/enseada.mjs@@';
import { etapas as mundo5 } from '@@MARE:modulo:src/campanha/fichas/deriva.mjs@@';
import { etapas as mundo6 } from '@@MARE:modulo:src/campanha/fichas/grutas.mjs@@';
import { etapas as mundo7 } from '@@MARE:modulo:src/campanha/fichas/ressaca.mjs@@';
import { etapas as mundo8 } from '@@MARE:modulo:src/campanha/fichas/farol.mjs@@';

// A edição executa uma única ficha por ID. Cópias antigas não voltam ao jogo.
const fichasPorId = new Map([...mundo1, ...mundo2, ...mundo3, ...mundo4, ...mundo5, ...mundo6, ...mundo7, ...mundo8].map(fase => [fase.id, fase]));
export const TODAS_AS_FASES = ordem.map(id => conferirRegrasDaCampanha(faseDaCampanha(id)));

export function faseDaCampanha(id) {
  const fase = fichasPorId.get(id);
  if (!fase) throw new Error(`Fase desconhecida: ${id}`);
  return fase;
}
export const FASES_BANCADA = [...reutilizadas.map(faseDaCampanha), conferirRegrasDaCampanha(perolas)];
