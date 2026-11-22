import { faixaRessacaNoTurno } from '../motor/index.ts';
import type { Evento, FaixaRessaca, Fase } from '../motor/index.ts';

type Agendar = (fim: () => void, milissegundos: number) => () => void;
type Impacto = Readonly<{ fase: Fase; passo: number; faixa: FaixaRessaca }>;

export const DURACAO_DA_ONDA = 360;

// O motor dita a virada. A interface apenas mantém um quadro estático
// breve, inclusive com movimento reduzido, sem atrasar ou repetir ações.
export function criarOndaVisual(agendar: Agendar, redesenhar: () => void) {
  let ativo: Impacto | undefined;
  let ultimo: Impacto | undefined;
  let cancelar: (() => void) | undefined;

  function encerrar(): void {
    cancelar?.();
    cancelar = undefined;
    ativo = undefined;
  }

  function aposAcao(fase: Fase, passo: number, eventos: readonly Evento[]): void {
    if (ativo && (ativo.fase !== fase || ativo.passo !== passo)) encerrar();
    if (!eventos.some(evento => evento.tipo === 'virada' && evento.alta)) return;
    if (ultimo?.fase === fase && ultimo.passo === passo) return;
    const faixa = faixaRessacaNoTurno(fase, passo);
    if (!faixa) return;

    const impacto = { fase, passo, faixa };
    ativo = ultimo = impacto;
    cancelar = agendar(() => {
      if (ativo !== impacto) return;
      ativo = undefined;
      cancelar = undefined;
      redesenhar();
    }, DURACAO_DA_ONDA);
  }

  function reiniciar(): void {
    encerrar();
    ultimo = undefined;
  }

  return { aposAcao, reiniciar, faixa: () => ativo?.faixa };
}
