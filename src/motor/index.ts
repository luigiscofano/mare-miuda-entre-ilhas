// O núcleo não lê tempo, DOM nem storage: reprodução e jogo usam a mesma função.
export type Direcao = 'cima' | 'baixo' | 'esquerda' | 'direita';
export type Acao = Direcao | 'trocar';
export type Celula = 'S' | '.' | '=' | '#' | 'C' | 'B' | 'G' | 'H' | 'A' | 'P' | 'D' | 'T' | '~' | EtapaGruta | 'O' | 'N' | 'M' | 'Y' | 'I' | 'L';
export type EtapaGruta = 'K' | 'E' | 'F';
export type Posicao = Readonly<{ coluna: number; linha: number }>;
export type Ameaca = Readonly<{ alvo: Posicao; primeiroAtaque: number; periodo: number; rota?: readonly Posicao[] }>;
export type FaixaRessaca = Readonly<{ linha: number; primeiraColuna: number; ultimaColuna: number }>;
export type OrientacaoFarol = Readonly<{
  nome: string;
  plataformas: readonly Posicao[];
  lente: Posicao;
  placa?: Posicao;
}>;
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
  etapasGruta?: readonly EtapaGruta[];
  farol?: Readonly<{ passosPorOrientacao: number; orientacoes: readonly OrientacaoFarol[] }>;
  ressaca?: Readonly<{ faixas: readonly FaixaRessaca[]; objetivo?: 'sobreviver' }>;
  dupla?: Readonly<{ segundoAlvo: 'T' | 'P'; terceiroAlvo?: 'Y' }>;
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
  terceiro?: Readonly<{ posicao: Posicao; ultimoFirme: Posicao; ativo: boolean }>;
  etapaGruta?: number;
  portadorGruta?: 'principal' | 'parceiro' | 'terceiro';
  ancoradouros?: readonly Posicao[];
  ondasSeguras?: number;
  lentesAcesas?: readonly Posicao[];
  situacao: 'jogando' | 'vitoria' | 'derrota';
}>;
export type MotivoErro = 'mare' | 'garca' | 'ressaca' | 'farol';
export type Evento =
  | Readonly<{ tipo: 'bloqueado' }>
  | Readonly<{ tipo: 'virada'; alta: boolean }>
  | Readonly<{ tipo: 'balsa' }>
  | Readonly<{ tipo: 'gruta-avancou'; etapa: EtapaGruta }>
  | Readonly<{ tipo: 'gruta-precisa-portador' }>
  | Readonly<{ tipo: 'gruta-fora-da-ordem'; proxima: EtapaGruta }>
  | Readonly<{ tipo: 'levada'; motivos: readonly MotivoErro[] }>
  | Readonly<{ tipo: 'fragmento' }>
  | Readonly<{ tipo: 'falta-fragmento' }>
  | Readonly<{ tipo: 'falta-parceiro' | 'faltam-siris' }>
  | Readonly<{ tipo: 'ancorou' | 'ancora-na-alta' | 'faltam-ancoradouros' }>
  | Readonly<{ tipo: 'faltam-ondas' | 'lente-acesa' | 'lente-fora-do-feixe' | 'lente-sem-placa' | 'faltam-lentes' }>
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

function localizar(fase: Fase, simbolo: 'S' | 'A' | 'M'): Posicao {
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
  const terceiroInicio = fase.dupla?.terceiroAlvo ? localizar(fase, 'M') : undefined;
  const terceiro = terceiroInicio ? { posicao: terceiroInicio, ultimoFirme: terceiroInicio, ativo: false } : undefined;
  return { posicao, ultimoFirme: posicao, passos: 0, levadas: 0, temFragmento: false,
    fragmentos: [], ...(fase.farol ? { lentesAcesas: [] } : {}),
    ...(fase.ressaca?.objetivo === 'sobreviver' ? { ondasSeguras: 0 } : fase.ressaca ? { ancoradouros: [] } : {}),
    ...(fase.etapasGruta ? { etapaGruta: 0 } : {}), ...(dupla ? { dupla } : {}),
    ...(terceiro ? { terceiro } : {}), situacao: 'jogando' };
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

// Cada subida golpeia uma faixa inteira. A sequência avança pelo relógio da
// maré, inclusive após uma levada; não existe um contador separado da arena.
export function faixaRessacaNoTurno(fase: Fase, passos: number): FaixaRessaca | undefined {
  if (!fase.ressaca || passos < PASSOS_POR_MARE || passos % PASSOS_POR_MARE !== 0 || !mareAlta(passos)) return;
  const subidasAnteriores = Math.floor(passos / (2 * PASSOS_POR_MARE));
  return fase.ressaca.faixas[subidasAnteriores % fase.ressaca.faixas.length];
}

export function faixaAfeta(fase: Fase, faixa: FaixaRessaca, posicao: Posicao): boolean {
  const casa = lerCelula(fase, posicao);
  return posicao.linha === faixa.linha && posicao.coluna >= faixa.primeiraColuna
    && posicao.coluna <= faixa.ultimaColuna && casa !== undefined && casa !== 'H' && casa !== '#' && casa !== '~';
}

export const TOTAL_ANCORADOUROS = 3;

function resolverAncoradouro(anteriores: Estado['ancoradouros'], destino: Posicao,
  casa: Celula | undefined, passos: number, eventos: Evento[],
): Estado['ancoradouros'] {
  if (!anteriores || casa !== 'N' || anteriores.some(pos => mesmaCasa(pos, destino))) return anteriores;
  if (mareAlta(passos)) {
    eventos.push({ tipo: 'ancora-na-alta' });
    return anteriores;
  }
  eventos.push({ tipo: 'ancorou' });
  return [...anteriores, destino];
}

// A mesma orientação governa o aviso, a ponte transitável e a lente acesa.
export function feixeNoTurno(fase: Fase, passos: number): OrientacaoFarol | undefined {
  const farol = fase.farol;
  if (!farol) return;
  return farol.orientacoes[Math.floor(passos / farol.passosPorOrientacao) % farol.orientacoes.length];
}

export function passosAteTrocaFeixe(fase: Fase, passos: number): number {
  const periodo = fase.farol?.passosPorOrientacao;
  return periodo ? periodo - passos % periodo : 0;
}

function ponteIluminada(fase: Fase, posicao: Posicao, passos: number): boolean {
  return feixeNoTurno(fase, passos)?.plataformas.some(p => mesmaCasa(p, posicao)) ?? false;
}

function acenderLente(fase: Fase, anteriores: Estado['lentesAcesas'], destino: Posicao,
  casa: Celula | undefined, passos: number, posicoes: readonly Posicao[], eventos: Evento[],
): Estado['lentesAcesas'] {
  if (!anteriores || casa !== 'L' || anteriores.some(pos => mesmaCasa(pos, destino))) return anteriores;
  const feixe = feixeNoTurno(fase, passos);
  if (!feixe || !mesmaCasa(feixe.lente, destino)) {
    eventos.push({ tipo: 'lente-fora-do-feixe' });
    return anteriores;
  }
  // A placa correspondente precisa estar ocupada no fim do mesmo turno.
  // O siri na lente não pode também ocupar a placa.
  const placa = feixe.placa;
  if (placa && !posicoes.some(pos => mesmaCasa(pos, placa))) {
    eventos.push({ tipo: 'lente-sem-placa' });
    return anteriores;
  }
  eventos.push({ tipo: 'lente-acesa' });
  return [...anteriores, destino];
}

export function balsasNoTurno(fase: Fase, passos: number): readonly Posicao[] {
  const parada = mareAlta(passos) ? 1 : 0;
  return (fase.balsas ?? []).map(balsa => balsa.paradas[parada]);
}


export function totalFragmentos(fase: Fase): number {
  return fase.mapa.reduce((n, linha) => n + [...linha].filter(celula => celula === 'B').length, 0);
}

export function portaoDaGrutaAberto(fase: Fase, estado: Estado): boolean {
  return fase.etapasGruta !== undefined && estado.etapaGruta === fase.etapasGruta.length;
}

export function nomeDaEtapaGruta(etapa: EtapaGruta): string {
  return { K: 'Pérola', E: 'Encaixe A', F: 'Alavanca B' }[etapa];
}

// A cadeia só avança após um passo seguro. Um acionamento fora da ordem
// avisa o que falta, sem apagar etapas anteriores nem gerar um turno extra.
function resolverGruta(fase: Fase, estado: Estado, celula: Celula | undefined, eventos: Evento[]) {
  const etapas = fase.etapasGruta;
  const atual = estado.etapaGruta;
  if (atual === undefined || (celula !== 'K' && celula !== 'E' && celula !== 'F')) return atual;
  const proxima = etapas?.[atual];
  if (proxima === celula) {
    const ativo = nomeInternoDoSiri(siriAtivo(estado));
    if (celula === 'E' && estado.portadorGruta && estado.portadorGruta !== ativo) {
      eventos.push({ tipo: 'gruta-precisa-portador' });
      return atual;
    }
    eventos.push({ tipo: 'gruta-avancou', etapa: celula });
    return atual + 1;
  }
  if (proxima && etapas?.slice(atual + 1).includes(celula)) {
    eventos.push({ tipo: 'gruta-fora-da-ordem', proxima });
  }
  return atual;
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
  if (fase.farol && posicoes.some(pos => lerCelula(fase, pos) === 'I' && !ponteIluminada(fase, pos, passos))) motivos.push('farol');
  const faixa = faixaRessacaNoTurno(fase, passos);
  if (faixa && posicoes.some(pos => faixaAfeta(fase, faixa, pos))) motivos.push('ressaca');
  return motivos;
}

function resolverObjetivo(fase: Fase, celulas: readonly (Celula | undefined)[], fragmentos: number,
  ancoradouros: Estado['ancoradouros'], ondasSeguras: Estado['ondasSeguras'],
  lentesAcesas: Estado['lentesAcesas'], eventos: Evento[],
) {
  const chegou = celulas.includes('C') || celulas.includes('G');
  if (!chegou) return false;
  if (lentesAcesas && lentesAcesas.length < (fase.farol?.orientacoes.length ?? 0)) {
    eventos.push({ tipo: 'faltam-lentes' });
    return false;
  }
  if (ancoradouros && ancoradouros.length < TOTAL_ANCORADOUROS) {
    eventos.push({ tipo: 'faltam-ancoradouros' });
    return false;
  }
  if (fragmentos < totalFragmentos(fase)) {
    eventos.push({ tipo: 'falta-fragmento' });
    return false;
  }
  if (fase.dupla?.terceiroAlvo &&
    (!celulas.includes(fase.dupla.segundoAlvo) || !celulas.includes(fase.dupla.terceiroAlvo))) {
    eventos.push({ tipo: 'faltam-siris' });
    return false;
  }
  if (fase.dupla && !celulas.includes(fase.dupla.segundoAlvo)) {
    eventos.push({ tipo: 'falta-parceiro' });
    return false;
  }
  if (ondasSeguras !== undefined && ondasSeguras < (fase.ressaca?.faixas.length ?? 0)) {
    eventos.push({ tipo: 'faltam-ondas' });
    return false;
  }
  eventos.push({ tipo: 'vitoria' });
  return true;
}

// Ordem estável no mapa em texto, no seletor e na troca: coral, verde, amarelo.
export function posicoesDosSiris(estado: Estado): Posicao[] {
  return [estado.posicao, ...(estado.dupla ? [estado.dupla.posicao] : []),
    ...(estado.terceiro ? [estado.terceiro.posicao] : [])];
}

export function siriAtivo(estado: Estado): 0 | 1 | 2 {
  return estado.terceiro?.ativo ? 2 : estado.dupla?.parceiroAtivo ? 1 : 0;
}

function nomeInternoDoSiri(ativo: ReturnType<typeof siriAtivo>): NonNullable<Estado['portadorGruta']> {
  return (['principal', 'parceiro', 'terceiro'] as const)[ativo];
}

export function jogadorAtivo(estado: Estado): Posicao {
  return posicoesDosSiris(estado)[siriAtivo(estado)];
}

export function destinoPermitido(fase: Fase, estado: Estado, direcao: Direcao): Posicao | undefined {
  const origem = jogadorAtivo(estado);
  const outros = posicoesDosSiris(estado).filter((_, i) => i !== siriAtivo(estado));
  const destino = calcularDestino(origem, direcao);
  const celula = lerCelula(fase, destino);
  const placa = outros.some(outro => lerCelula(fase, outro) === 'P');
  if (!celula || celula === '#' || (celula === '=' && mareAlta(estado.passos)) ||
    (celula === 'I' && !ponteIluminada(fase, destino, estado.passos)) ||
    (celula === '~' && !balsasNoTurno(fase, estado.passos).some(p => mesmaCasa(p, destino))) ||
    (celula === 'D' && !placa) || (celula === 'O' && !portaoDaGrutaAberto(fase, estado)) || outros.some(outro => mesmaCasa(outro, destino))) return;
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
  const { dupla, terceiro } = anterior;
  const ativo = siriAtivo(anterior);
  if (acao === 'trocar') {
    if (!dupla) return { estado: anterior, eventos: [] };
    const proximo = (ativo + 1) % (terceiro ? 3 : 2);
    return { estado: { ...anterior, dupla: { ...dupla, parceiroAtivo: proximo === 1 },
      ...(terceiro ? { terceiro: { ...terceiro, ativo: proximo === 2 } } : {}) }, eventos: [{ tipo: 'troca' }] };
  }
  const entrada = destinoPermitido(fase, anterior, acao);
  if (!entrada) {
    return { estado: anterior, eventos: [{ tipo: 'bloqueado' }] };
  }
  const passos = anterior.passos + 1;
  const eventos: Evento[] = [];
  let posicoes = posicoesDosSiris(anterior);
  posicoes[ativo] = entrada;
  if (passos % PASSOS_POR_MARE === 0) {
    eventos.push({ tipo: 'virada', alta: mareAlta(passos) });
    const balsasAntes = balsasNoTurno(fase, anterior.passos);
    const balsasDepois = balsasNoTurno(fase, passos);
    const transportar = (pos: Posicao) => {
      const indice = balsasAntes.findIndex(parada => mesmaCasa(parada, pos));
      return balsasDepois[indice] ?? pos;
    };
    // A corrente transporta todo siri que estiver embarcado, inclusive os inativos.
    const transportadas = posicoes.map(transportar);
    if (transportadas.some((pos, i) => pos !== posicoes[i])) eventos.push({ tipo: 'balsa' });
    posicoes = transportadas;
  }
  const destino = posicoes[ativo];
  const celula = lerCelula(fase, destino);
  const motivos = ameacasNoTurno(fase, posicoes, passos);

  if (motivos.length > 0) {
    const levadas = anterior.levadas + 1;
    eventos.push({ tipo: 'levada', motivos });
    const perdeu = terminouOrcamento(fase, passos, eventos) || levadas >= LIMITE_LEVADAS;
    return {
      estado: { ...anterior, passos, levadas, posicao: anterior.ultimoFirme,
        ...(anterior.ondasSeguras === undefined ? {} : { ondasSeguras: 0 }),
        ...(dupla ? { dupla: { ...dupla, posicao: dupla.ultimoFirme } } : {}),
        ...(terceiro ? { terceiro: { ...terceiro, posicao: terceiro.ultimoFirme } } : {}),
        situacao: perdeu ? 'derrota' : 'jogando' },
      eventos,
    };
  }

  const coletou = celula === 'B' && !anterior.fragmentos.some(p => mesmaCasa(p, destino));
  const fragmentos = coletou ? [...anterior.fragmentos, destino] : anterior.fragmentos;
  if (coletou) eventos.push({ tipo: 'fragmento' });
  const celulas = posicoes.map(p => lerCelula(fase, p));
  const etapaGruta = resolverGruta(fase, anterior, celula, eventos);
  // A pérola não muda de siri numa troca. A alavanca não precisa do portador.
  let portadorGruta = anterior.portadorGruta;
  if (dupla && etapaGruta !== anterior.etapaGruta) {
    if (celula === 'K') portadorGruta = nomeInternoDoSiri(ativo);
    if (celula === 'E') portadorGruta = undefined;
  }
  const ancoradouros = resolverAncoradouro(anterior.ancoradouros, destino, celula, passos, eventos);
  // O ciclo de sobrevivência conta só ondas sem levada. Uma perda devolve a
  // dupla aos marcos e reinicia a sequência sem rebobinar a maré.
  const ondasSeguras = anterior.ondasSeguras !== undefined && faixaRessacaNoTurno(fase, passos)
    ? Math.min(anterior.ondasSeguras + 1, fase.ressaca?.faixas.length ?? 0) : anterior.ondasSeguras;
  const lentesAcesas = acenderLente(fase, anterior.lentesAcesas, destino, celula, passos, posicoes, eventos);
  const venceu = resolverObjetivo(fase, celulas, fragmentos.length, ancoradouros, ondasSeguras, lentesAcesas, eventos);
  // Uma saída segura pode completar a missão exatamente no último passo.
  const perdeu = !venceu && terminouOrcamento(fase, passos, eventos);
  const [posicao, posicaoParceiro, posicaoTerceiro] = posicoes;
  // Os marcos do grupo vêm de um mesmo turno seguro e não se sobrepõem.
  // Portões móveis não são marcos firmes: podem fechar depois do retorno.
  const firmes = celulas.every(casa => casa !== '=' && casa !== 'D' && casa !== '~' && casa !== 'I');
  const novaDupla = dupla && posicaoParceiro
    ? { ...dupla, posicao: posicaoParceiro, ultimoFirme: firmes ? posicaoParceiro : dupla.ultimoFirme }
    : undefined;
  return {
    estado: { ...anterior, posicao, passos, temFragmento: fragmentos.length > 0, fragmentos,
      ultimoFirme: firmes ? posicao : anterior.ultimoFirme,
      ...(ancoradouros === undefined ? {} : { ancoradouros }),
      ...(ondasSeguras === undefined ? {} : { ondasSeguras }),
      ...(lentesAcesas === undefined ? {} : { lentesAcesas }),
      ...(etapaGruta === undefined ? {} : { etapaGruta }),
      ...(dupla && etapaGruta !== undefined ? { portadorGruta } : {}),
      ...(novaDupla ? { dupla: novaDupla } : {}),
      ...(terceiro && posicaoTerceiro ? { terceiro: { ...terceiro, posicao: posicaoTerceiro,
        ultimoFirme: firmes ? posicaoTerceiro : terceiro.ultimoFirme } } : {}),
      situacao: venceu ? 'vitoria' : perdeu ? 'derrota' : 'jogando' },
    eventos,
  };
}
