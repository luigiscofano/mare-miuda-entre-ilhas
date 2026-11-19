// O núcleo não lê tempo, DOM nem storage: reprodução e jogo usam a mesma função.
export type Direcao = 'cima' | 'baixo' | 'esquerda' | 'direita';
export type Celula = 'S' | '.' | '=' | '#' | 'C' | 'B' | 'G';
export type Posicao = Readonly<{ coluna: number; linha: number }>;
export type Ameaca = Readonly<{
  alvo: Posicao;
  primeiroAtaque: number;
  periodo: number;
}>;
export type Fase = Readonly<{
  id: string;
  nome: string;
  objetivo: string;
  ensino: string;
  mapa: readonly string[];
  solucao: readonly Direcao[];
  ameaca?: Ameaca;
}>;
export type Estado = Readonly<{
  posicao: Posicao;
  ultimoFirme: Posicao;
  passos: number;
  levadas: number;
  temFragmento: boolean;
  situacao: 'jogando' | 'vitoria' | 'derrota';
}>;
export type MotivoErro = 'mare' | 'garca';
export type Evento =
  | Readonly<{ tipo: 'bloqueado' }>
  | Readonly<{ tipo: 'virada'; alta: boolean }>
  | Readonly<{ tipo: 'levada'; motivos: readonly MotivoErro[] }>
  | Readonly<{ tipo: 'fragmento' }>
  | Readonly<{ tipo: 'falta-fragmento' }>
  | Readonly<{ tipo: 'vitoria' }>;
type Transicao = Readonly<{ estado: Estado; eventos: readonly Evento[] }>;

export const PASSOS_POR_MARE = 3;
export const LIMITE_LEVADAS = 3;
export const DIRECOES = ['cima', 'baixo', 'esquerda', 'direita'] as const;
const DELTAS: Record<Direcao, Posicao> = {
  cima: { coluna: 0, linha: -1 },
  baixo: { coluna: 0, linha: 1 },
  esquerda: { coluna: -1, linha: 0 },
  direita: { coluna: 1, linha: 0 },
};

export function iniciar(fase: Fase): Estado {
  const linha = fase.mapa.findIndex(fileira => fileira.includes('S'));
  if (linha < 0) throw new Error('Fase sem casa inicial.');
  const posicao = { linha, coluna: fase.mapa[linha].indexOf('S') };
  return { posicao, ultimoFirme: posicao, passos: 0, levadas: 0, temFragmento: false, situacao: 'jogando' };
}

export function mareAlta(passos: number): boolean {
  return Math.floor(passos / PASSOS_POR_MARE) % 2 === 1;
}

export function passosAteVirada(passos: number): number {
  return PASSOS_POR_MARE - passos % PASSOS_POR_MARE;
}

export function mesmaCasa(a: Posicao, b: Posicao): boolean {
  return a.coluna === b.coluna && a.linha === b.linha;
}

export function lerCelula(fase: Fase, posicao: Posicao): Celula | undefined {
  return fase.mapa[posicao.linha]?.[posicao.coluna] as Celula | undefined;
}

export function vaiAtacar(ameaca: Ameaca | undefined, passo: number): boolean {
  return ameaca !== undefined && passo >= ameaca.primeiroAtaque
    && (passo - ameaca.primeiroAtaque) % ameaca.periodo === 0;
}

function calcularDestino(posicao: Posicao, direcao: Direcao): Posicao {
  const delta = DELTAS[direcao];
  return { coluna: posicao.coluna + delta.coluna, linha: posicao.linha + delta.linha };
}

// O destino é julgado pela água de antes da jogada. A água nova só afeta quem
// já chegou, portanto não se entra num baixio coberto no mesmo passo da descida.
export function executarPasso(fase: Fase, anterior: Estado, direcao: Direcao): Transicao {
  if (anterior.situacao !== 'jogando') return { estado: anterior, eventos: [] };
  const destino = calcularDestino(anterior.posicao, direcao);
  const celula = lerCelula(fase, destino);
  if (!celula || celula === '#' || (celula === '=' && mareAlta(anterior.passos))) {
    return { estado: anterior, eventos: [{ tipo: 'bloqueado' }] };
  }

  const passos = anterior.passos + 1;
  const eventos: Evento[] = [];
  if (passos % PASSOS_POR_MARE === 0) eventos.push({ tipo: 'virada', alta: mareAlta(passos) });

  // Correntes e plataformas entram aqui em marcos futuros, antes de avaliar
  // as ameaças. Duas ameaças no mesmo passo produzem uma única levada.
  const motivos: MotivoErro[] = [];
  if (celula === '=' && mareAlta(passos)) motivos.push('mare');
  const ameaca = fase.ameaca;
  if (ameaca && vaiAtacar(ameaca, passos) && mesmaCasa(destino, ameaca.alvo)) motivos.push('garca');

  if (motivos.length > 0) {
    const levadas = anterior.levadas + 1;
    eventos.push({ tipo: 'levada', motivos });
    return {
      estado: {
        ...anterior, passos, levadas, posicao: anterior.ultimoFirme,
        situacao: levadas >= LIMITE_LEVADAS ? 'derrota' : 'jogando',
      },
      eventos,
    };
  }

  const temFragmento = anterior.temFragmento || celula === 'B';
  const venceu = celula === 'C' || (celula === 'G' && temFragmento);
  if (celula === 'B' && !anterior.temFragmento) eventos.push({ tipo: 'fragmento' });
  if (celula === 'G' && !temFragmento) eventos.push({ tipo: 'falta-fragmento' });
  if (venceu) eventos.push({ tipo: 'vitoria' });

  return {
    estado: {
      ...anterior, posicao: destino, passos, temFragmento,
      ultimoFirme: celula === '=' ? anterior.ultimoFirme : destino,
      situacao: venceu ? 'vitoria' : 'jogando',
    },
    eventos,
  };
}
