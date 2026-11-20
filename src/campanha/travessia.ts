import type { Posicao } from '../motor/index.ts';

// A velocidade é constante ao longo das curvas, não por segmento ou por célula.
export function prepararTravessia(caminho: readonly Posicao[]) {
  const segmentos = caminho.slice(1).map((fim, i) => {
    const inicio = caminho[i];
    return { inicio, fim, extensao: Math.hypot(fim.coluna - inicio.coluna, fim.linha - inicio.linha) };
  });
  const extensao = segmentos.reduce((total, trecho) => total + trecho.extensao, 0);
  return {
    duracao: Math.min(640, Math.max(120, extensao * 115)),
    ponto(fracao: number): Posicao {
      let restante = Math.max(0, Math.min(1, fracao)) * extensao;
      for (const { inicio, fim, extensao: comprimento } of segmentos) {
        if (!comprimento) continue;
        if (restante <= comprimento) {
          const t = restante / comprimento;
          return {
            coluna: inicio.coluna + (fim.coluna - inicio.coluna) * t,
            linha: inicio.linha + (fim.linha - inicio.linha) * t,
          };
        }
        restante -= comprimento;
      }
      return caminho[caminho.length - 1];
    },
  };
}
