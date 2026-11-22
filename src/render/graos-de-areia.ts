type Grao = Readonly<{ x: number; y: number; lado: 2 | 3; tom: 0 | 1 }>;

// A mesma casa recebe os mesmos grãos nas duas marés. Faixas afastadas
// dos cantos e do centro deixam espaço para os símbolos da jogabilidade.
export function graosDaCasa(variante: number): readonly [Grao, Grao] {
  const grande = (variante >>> 10) % 3 === 0;
  return [
    { x: 8 + variante % 7, y: 4 + (variante >>> 6) % 2, lado: grande ? 3 : 2, tom: 0 },
    { x: 19 + (variante >>> 13) % 7, y: 20 + (variante >>> 19) % 5, lado: grande ? 2 : 3, tom: 1 },
  ];
}

export function tonsDosGraos(areia: string, barranco: string): readonly [string, string] {
  const daAreia = Number.parseInt(areia.slice(1), 16);
  const doBarranco = Number.parseInt(barranco.slice(1), 16);
  const misturar = (fracao: number) => '#' + [16, 8, 0].map(canal => {
    const base = (daAreia >>> canal) & 255;
    const sombra = (doBarranco >>> canal) & 255;
    return Math.round(base * (1 - fracao) + sombra * fracao).toString(16).padStart(2, '0');
  }).join('');
  return [misturar(0.34), misturar(0.49)];
}
