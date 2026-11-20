// O núcleo não lê tempo, DOM nem storage: reprodução e jogo usam a mesma função.
export type Direcao = 'cima' | 'baixo' | 'esquerda' | 'direita';
export type Acao = Direcao | 'trocar';
export type Celula = 'S' | '.' | '=' | '#' | 'C' | 'B' | 'G' | 'H' | 'A' | 'P' | 'D' | 'T' | '~';
export type Posicao = Readonly<{ coluna: number; linha: number }>;
export type Ameaca = Readonly<{ alvo: Posicao; primeiroAtaque: number; periodo: number; rota?: readonly Posicao[] }>;
export type Fase = Readonly<{
  id: string;
  nome: string;
  objetivo: string;
  ensino: string;
  mapa: readonly string[];
  solucao: readonly Acao[];
  ameaca?: Ameaca;
  balsas?: readonly Readonly<{ paradas: readonly [Posicao, Posicao] }>[];
  orcamentoMoedas?: number;
  dupla?: Readonly<{ segundoAlvo: 'T' | 'P' }>;
}>;
type EstadoDupla = Readonly<{ posicao: Posicao; ultimoFirme: Posicao; parceiroAtivo: boolean }>;
export type Estado = Readonly<{
  posicao: Posicao;
  ultimoFirme: Posicao;
  passos: number;
  levadas: number;
  temFragmento: boolean;
  fragmentos: readonly Posicao[];
  dupla?: EstadoDupla;
  situacao: 'jogando' | 'vitoria' | 'derrota';
}>;
export type MotivoErro = 'mare' | 'garca';
export type Evento =
  | Readonly<{ tipo: 'bloqueado' }>
  | Readonly<{ tipo: 'virada'; alta: boolean }>
  | Readonly<{ tipo: 'balsa' }>
  | Readonly<{ tipo: 'levada'; motivos: readonly MotivoErro[] }>
  | Readonly<{ tipo: 'fragmento' }>
  | Readonly<{ tipo: 'falta-fragmento' }>
  | Readonly<{ tipo: 'falta-parceiro' }>
  | Readonly<{ tipo: 'troca' }>
  | Readonly<{ tipo: 'orcamento-esgotado' }>
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

function localizar(fase: Fase, simbolo: 'S' | 'A'): Posicao {
  const linha = fase.mapa.findIndex(fileira => fileira.includes(simbolo));
  if (linha < 0) throw new Error(`Fase sem casa inicial ${simbolo}.`);
  return { linha, coluna: fase.mapa[linha].indexOf(simbolo) };
}
export function iniciar(fase: Fase): Estado {
  const posicao = localizar(fase, 'S');
  let dupla: EstadoDupla | undefined;
  if (fase.dupla) {
    const parceiro = localizar(fase, 'A');
    dupla = { posicao: parceiro, ultimoFirme: parceiro, parceiroAtivo: false };
  }
  return { posicao, ultimoFirme: posicao, passos: 0, levadas: 0, temFragmento: false,
    fragmentos: [], ...(dupla ? { dupla } : {}), situacao: 'jogando' };
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

// A mesma função descreve o aviso e resolve o rasante. A rota não tem relógio separado.
export function alvoDaGarca(ameaca: Ameaca | undefined, passo: number): Posicao | undefined {
  if (!ameaca || !vaiAtacar(ameaca, passo)) return;
  if (!ameaca.rota?.length) return ameaca.alvo;
  const indice = (passo - ameaca.primeiroAtaque) / ameaca.periodo;
  const ciclo = [ameaca.alvo, ...ameaca.rota];
  return ciclo[indice % ciclo.length];
}

export function balsasNoTurno(fase: Fase, passos: number): readonly Posicao[] {
  const parada = mareAlta(passos) ? 1 : 0;
  return (fase.balsas ?? []).map(balsa => balsa.paradas[parada]);
}


export function totalFragmentos(fase: Fase): number {
  return fase.mapa.reduce((n, linha) => n + [...linha].filter(celula => celula === 'B').length, 0);
}

function calcularDestino(posicao: Posicao, direcao: Direcao): Posicao {
  const delta = DELTAS[direcao];
  return { coluna: posicao.coluna + delta.coluna, linha: posicao.linha + delta.linha };
}

function ameacasNoTurno(fase: Fase, posicoes: readonly Posicao[], passos: number): MotivoErro[] {
  const motivos: MotivoErro[] = [];
  if (mareAlta(passos) && posicoes.some(pos => lerCelula(fase, pos) === '=')) motivos.push('mare');
  const alvo = alvoDaGarca(fase.ameaca, passos);
  if (alvo && posicoes.some(pos => mesmaCasa(alvo, pos))) motivos.push('garca');
  return motivos;
}

function resolverObjetivo(fase: Fase, celulas: readonly (Celula | undefined)[], fragmentos: number, eventos: Evento[]) {
  const chegou = celulas.includes('C') || celulas.includes('G');
  if (!chegou) return false;
  if (fragmentos < totalFragmentos(fase)) {
    eventos.push({ tipo: 'falta-fragmento' });
    return false;
  }
  if (fase.dupla && !celulas.includes(fase.dupla.segundoAlvo)) {
    eventos.push({ tipo: 'falta-parceiro' });
    return false;
  }
  eventos.push({ tipo: 'vitoria' });
  return true;
}

export function jogadorAtivo(estado: Estado): Posicao {
  return estado.dupla?.parceiroAtivo ? estado.dupla.posicao : estado.posicao;
}

export function destinoPermitido(fase: Fase, estado: Estado, direcao: Direcao): Posicao | undefined {
  const origem = jogadorAtivo(estado);
  const outro = estado.dupla && (estado.dupla.parceiroAtivo ? estado.posicao : estado.dupla.posicao);
  const destino = calcularDestino(origem, direcao);
  const celula = lerCelula(fase, destino);
  const placa = outro && lerCelula(fase, outro) === 'P';
  if (!celula || celula === '#' || (celula === '=' && mareAlta(estado.passos)) ||
    (celula === '~' && !balsasNoTurno(fase, estado.passos).some(p => mesmaCasa(p, destino))) ||
    (celula === 'D' && !placa) || (outro && mesmaCasa(outro, destino))) return;
  return destino;
}

function terminouOrcamento(fase: Fase, passos: number, eventos: Evento[]): boolean {
  if (fase.orcamentoMoedas === undefined || passos < fase.orcamentoMoedas) return false;
  eventos.push({ tipo: 'orcamento-esgotado' });
  return true;
}

// A maré anterior decide se o passo pode começar. A nova, junto das ameaças,
// decide se os dois siris ficam seguros antes de qualquer coleta ou vitória.
export function executarPasso(fase: Fase, anterior: Estado, acao: Acao): Transicao {
  if (anterior.situacao !== 'jogando') return { estado: anterior, eventos: [] };
  const dupla = anterior.dupla;
  if (acao === 'trocar') {
    if (!dupla) return { estado: anterior, eventos: [] };
    return { estado: { ...anterior, dupla: { ...dupla, parceiroAtivo: !dupla.parceiroAtivo } },
      eventos: [{ tipo: 'troca' }] };
  }
  const movendoParceiro = dupla?.parceiroAtivo ?? false;
  const outro = dupla ? (movendoParceiro ? anterior.posicao : dupla.posicao) : undefined;
  const entrada = destinoPermitido(fase, anterior, acao);
  if (!entrada) {
    return { estado: anterior, eventos: [{ tipo: 'bloqueado' }] };
  }
  let destino = entrada;
  const passos = anterior.passos + 1;
  const eventos: Evento[] = [];
  if (passos % PASSOS_POR_MARE === 0) {
    eventos.push({ tipo: 'virada', alta: mareAlta(passos) });
    const montada = balsasNoTurno(fase, anterior.passos).findIndex(p => mesmaCasa(p, entrada));
    if (montada >= 0) {
      destino = balsasNoTurno(fase, passos)[montada];
      eventos.push({ tipo: 'balsa' });
    }
  }
  const celula = lerCelula(fase, destino);
  const posicoes = outro ? [destino, outro] : [destino];
  const motivos = ameacasNoTurno(fase, posicoes, passos);

  if (motivos.length > 0) {
    const levadas = anterior.levadas + 1;
    eventos.push({ tipo: 'levada', motivos });
    const perdeu = terminouOrcamento(fase, passos, eventos) || levadas >= LIMITE_LEVADAS;
    return {
      estado: { ...anterior, passos, levadas, posicao: anterior.ultimoFirme,
        ...(dupla ? { dupla: { ...dupla, posicao: dupla.ultimoFirme } } : {}),
        situacao: perdeu ? 'derrota' : 'jogando' },
      eventos,
    };
  }

  const coletou = celula === 'B' && !anterior.fragmentos.some(p => mesmaCasa(p, destino));
  const fragmentos = coletou ? [...anterior.fragmentos, destino] : anterior.fragmentos;
  if (coletou) eventos.push({ tipo: 'fragmento' });
  const celulas = posicoes.map(p => lerCelula(fase, p));
  const venceu = resolverObjetivo(fase, celulas, fragmentos.length, eventos);
  // Uma saída segura pode completar a missão exatamente no último passo.
  const perdeu = !venceu && terminouOrcamento(fase, passos, eventos);
  const posicao = movendoParceiro ? anterior.posicao : destino;
  const posicaoParceiro = dupla ? (movendoParceiro ? destino : dupla.posicao) : undefined;
  // Os marcos da dupla sempre vêm de um mesmo turno seguro e não se sobrepõem.
  // Portões móveis não são marcos firmes: podem fechar depois do retorno.
  const firmes = celulas.every(casa => casa !== '=' && casa !== 'D' && casa !== '~');
  const novaDupla = dupla && posicaoParceiro
    ? { ...dupla, posicao: posicaoParceiro, ultimoFirme: firmes ? posicaoParceiro : dupla.ultimoFirme }
    : undefined;
  return {
    estado: { ...anterior, posicao, passos, temFragmento: fragmentos.length > 0, fragmentos,
      ultimoFirme: firmes ? posicao : anterior.ultimoFirme,
      ...(novaDupla ? { dupla: novaDupla } : {}), situacao: venceu ? 'vitoria' : perdeu ? 'derrota' : 'jogando' },
    eventos,
  };
}
