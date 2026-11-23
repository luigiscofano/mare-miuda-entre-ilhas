                                              

const CAMPOS_ATIVOS                      = new Set([
  'id', 'nome', 'objetivo', 'ensino', 'mapa', 'solucao', 'ameaca', 'fendas', 'dupla',
]);

// A campanha aceita só estas peças. Bancos de areia são chão firme comum;
// o H muda apenas o desenho, sem proteção contra o rasante.
export function conferirRegrasDaCampanha(fase      )       {
  const camposExtras = Object.keys(fase).filter(chave => !CAMPOS_ATIVOS.has(chave)
    && fase[chave              ] !== undefined);
  if (camposExtras.length || fase.mapa.some(linha => /[^S.=#CBGHATMY]/.test(linha))
    || (fase.dupla !== undefined && fase.dupla.segundoAlvo !== 'T')
    || (fase.fendas && !/^(enseada|deriva|grutas|ressaca|farol)-/.test(fase.id))) {
    throw new Error(`Fase fora da campanha de maré: ${fase.id} (${camposExtras.join(', ')})`);
  }
  return fase;
}
