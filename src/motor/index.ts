// O núcleo não lê tempo, DOM nem storage: reprodução e jogo usam a mesma função.
export type Direcao = 'cima' | 'baixo' | 'esquerda' | 'direita';
export type Acao = Direcao | 'trocar';
export type Celula = 'S' | '.' | '=' | '#' | 'C' | 'B' | 'G' | 'H' | 'A' | 'P' | 'D' | 'T' | '~' | EtapaGruta | 'O' | 'N' | 'M' | 'Y' | 'I' | 'L';
export type EtapaGruta = 'K' | 'E' | 'F';
export type JanelaGruta = 'descida' | 'alta' | 'baixa';
type CondicaoGruta = Readonly<{ etapa: EtapaGruta; janela: JanelaGruta; placa?: Posicao }>;
export type Posicao = Readonly<{ coluna: number; linha: number }>;
export const FORMAS_DE_FENDA = ['redonda', 'estreita', 'bifurcada'] as const;
export type Fenda = Readonly<{
  forma: typeof FORMAS_DE_FENDA[number];
  bocas: readonly [Posicao, Posicao];
}>;
export type Ameaca = Readonly<{
  alvo: Posicao;
  primeiroAtaque: number;
  periodo: number;
  rota?: readonly Posicao[];
  rasante?: Readonly<{ eixo: 'linha' | 'coluna'; alcance: number }>;
}>;
export type FaixaRessaca = Readonly<{ linha: number; primeiraColuna: number; ultimaColuna: number }>;
export type OrientacaoFarol = Readonly<{
  nome: string;
  plataformas: readonly Posicao[];
  lente: Posicao;
  placa?: Posicao;
}>;
type ProvaRecife = Readonly<{ abrigos: readonly [Posicao, Posicao] }>
  | Readonly<{ ida: Posicao; volta: Posicao }>;
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
  portoesVinculados?: readonly Readonly<{ portao: Posicao; placa: Posicao }>[];
  etapasGruta?: readonly EtapaGruta[];
  condicoesGruta?: readonly CondicaoGruta[];
  farol?: Readonly<{ passosPorOrientacao: number; orientacoes: readonly OrientacaoFarol[] }>;
  ressaca?: Readonly<{ faixas: readonly FaixaRessaca[]; objetivo?: 'sobreviver' | 'atravessar' }>;
  recife?: ProvaRecife;
  fendas?: readonly Fenda[];
  atracacaoNaVirada?: readonly Posicao[];
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
  abrigosVisitados?: readonly Posicao[];
  situacao: 'jogando' | 'vitoria' | 'derrota';
}>;
export type MotivoErro = 'mare' | 'garca' | 'ressaca' | 'farol';
export type Evento =
  | Readonly<{ tipo: 'bloqueado' }>
  | Readonly<{ tipo: 'fenda-bloqueada'; motivo: 'ocupada' | 'interditada' }>
  | Readonly<{ tipo: 'fenda-atravessada'; forma: Fenda['forma'] }>
  | Readonly<{ tipo: 'virada'; alta: boolean }>
  | Readonly<{ tipo: 'balsa' }>
  | Readonly<{ tipo: 'gruta-avancou'; etapa: EtapaGruta }>
  | Readonly<{ tipo: 'gruta-precisa-portador' }>
  | Readonly<{ tipo: 'gruta-fora-da-janela'; janela: JanelaGruta }>
  | Readonly<{ tipo: 'gruta-sem-placa' }>
  | Readonly<{ tipo: 'gruta-fora-da-ordem'; proxima: EtapaGruta }>
  | Readonly<{ tipo: 'levada'; motivos: readonly MotivoErro[] }>
  | Readonly<{ tipo: 'abrigo-visitado' | 'faltam-abrigos' | 'recife-mudou-rota' }>
  | Readonly<{ tipo: 'fragmento' }>
  | Readonly<{ tipo: 'falta-fragmento' }>
  | Readonly<{ tipo: 'falta-parceiro' | 'faltam-siris' }>
  | Readonly<{ tipo: 'ancorou' | 'ancora-na-alta' | 'faltam-ancoradouros' | 'aguarde-desembarque' }>
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
    fragmentos: [], ...(fase.recife && 'abrigos' in fase.recife ? { abrigosVisitados: [] } : {}),
    ...(fase.farol ? { lentesAcesas: [] } : {}),
    ...(fase.atracacaoNaVirada ? { ancoradouros: [] } : fase.ressaca?.objetivo === 'sobreviver' ? { ondasSeguras: 0 } : fase.ressaca && !fase.ressaca.objetivo ? { ancoradouros: [] } : {}),
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

// Solo firme também é atingido. O voo passa por cima dos obstáculos,
// mas o refúgio elevado oculta o siri e nunca recebe a marca do rasante.
export function casasDoRasante(fase: Fase, passo: number): Posicao[] {
  const alvo = alvoDaGarca(fase.ameaca, passo);
  if (!alvo) return [];
  const rasante = fase.ameaca?.rasante;
  if (!rasante) return [alvo];
  const casas: Posicao[] = [];
  for (let deslocamento = -rasante.alcance; deslocamento <= rasante.alcance; deslocamento++) {
    const pos = rasante.eixo === 'linha'
      ? { coluna: alvo.coluna + deslocamento, linha: alvo.linha }
      : { coluna: alvo.coluna, linha: alvo.linha + deslocamento };
    const celula = lerCelula(fase, pos);
    if (celula && celula !== '#' && celula !== 'H' && celula !== '~') casas.push(pos);
  }
  return casas;
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

export function totalAncoradouros(fase: Fase): number {
  return fase.atracacaoNaVirada?.length ?? TOTAL_ANCORADOUROS;
}

// No Mestre das Correntes, conta a posição antes do passo, não a balsa
// depois da virada: desembarcar e ser transportado são ações diferentes.
function resolverAncoradouro(fase: Fase, anterior: Estado, destino: Posicao,
  casa: Celula | undefined, passos: number, eventos: Evento[],
): Estado['ancoradouros'] {
  const anteriores = anterior.ancoradouros;
  if (!anteriores || casa !== 'N' || anteriores.some(pos => mesmaCasa(pos, destino))) return anteriores;
  if (fase.atracacaoNaVirada) {
    if (!fase.atracacaoNaVirada.some(pos => mesmaCasa(pos, destino))) return anteriores;
    const estavaABordo = balsasNoTurno(fase, anterior.passos)
      .some(parada => mesmaCasa(parada, jogadorAtivo(anterior)));
    if (!estavaABordo || passos % PASSOS_POR_MARE !== 0) {
      eventos.push({ tipo: 'aguarde-desembarque' });
      return anteriores;
    }
  } else if (mareAlta(passos)) {
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

export function nomeDaJanelaGruta(janela: JanelaGruta): string {
  return { alta: 'maré alta', baixa: 'maré baixa', descida: 'passo da descida' }[janela];
}

export function janelaGrutaAtiva(janela: JanelaGruta, passos: number): boolean {
  const alta = mareAlta(passos);
  if (janela === 'alta') return alta;
  if (janela === 'baixa') return !alta;
  return !alta && passos > 0 && passos % PASSOS_POR_MARE === 0;
}

// A cadeia só avança após um passo seguro. Um acionamento fora da ordem
// avisa o que falta, sem apagar etapas anteriores nem gerar um turno extra.
function resolverGruta(fase: Fase, estado: Estado, celula: Celula | undefined, passos: number,
  posicoes: readonly Posicao[], eventos: Evento[],
) {
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
    const condicao = fase.condicoesGruta?.find(item => item.etapa === celula);
    // As condições olham o turno já resolvido, não a água de antes do passo.
    if (condicao && !janelaGrutaAtiva(condicao.janela, passos)) {
      eventos.push({ tipo: 'gruta-fora-da-janela', janela: condicao.janela });
      return atual;
    }
    const placa = condicao?.placa;
    if (placa && !posicoes.some(pos => mesmaCasa(pos, placa))) {
      eventos.push({ tipo: 'gruta-sem-placa' });
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
  const rasante = casasDoRasante(fase, passos);
  if (posicoes.some(pos => rasante.some(casa => mesmaCasa(casa, pos)))) motivos.push('garca');
  if (fase.farol && posicoes.some(pos => lerCelula(fase, pos) === 'I' && !ponteIluminada(fase, pos, passos))) motivos.push('farol');
  const faixa = faixaRessacaNoTurno(fase, passos);
  if (faixa && posicoes.some(pos => faixaAfeta(fase, faixa, pos))) motivos.push('ressaca');
  return motivos;
}

// As duas comportas são complementares. Só a rota aberta ainda pode depender da maré.
export function passagemDoRecifeFechada(fase: Fase, posicao: Posicao, temFragmento: boolean): boolean {
  const recife = fase.recife;
  return recife !== undefined && 'ida' in recife
    && mesmaCasa(posicao, temFragmento ? recife.ida : recife.volta);
}

function registrarAbrigo(fase: Fase, estado: Estado, posicao: Posicao, passos: number,
  eventos: Evento[],
): Estado['abrigosVisitados'] {
  const visitados = estado.abrigosVisitados;
  if (!visitados || !fase.recife || !('abrigos' in fase.recife) || !mareAlta(passos)
    || !fase.recife.abrigos.some(abrigo => mesmaCasa(abrigo, posicao))
    || visitados.some(abrigo => mesmaCasa(abrigo, posicao))) return visitados;
  eventos.push({ tipo: 'abrigo-visitado' });
  return [...visitados, posicao];
}

function resolverObjetivo(fase: Fase, celulas: readonly (Celula | undefined)[], fragmentos: number,
  ancoradouros: Estado['ancoradouros'], ondasSeguras: Estado['ondasSeguras'],
  lentesAcesas: Estado['lentesAcesas'], abrigosVisitados: Estado['abrigosVisitados'], eventos: Evento[],
) {
  const chegou = celulas.includes('C') || celulas.includes('G');
  if (!chegou) return false;
  if (abrigosVisitados && fase.recife && 'abrigos' in fase.recife
    && abrigosVisitados.length < fase.recife.abrigos.length) {
    eventos.push({ tipo: 'faltam-abrigos' });
    return false;
  }
  if (lentesAcesas && lentesAcesas.length < (fase.farol?.orientacoes.length ?? 0)) {
    eventos.push({ tipo: 'faltam-lentes' });
    return false;
  }
  if (ancoradouros && ancoradouros.length < totalAncoradouros(fase)) {
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

// Portões sem vínculo mantêm a regra original de uma única placa.
export function portaoLiberado(fase: Fase, portao: Posicao, siris: readonly Posicao[]): boolean {
  const vinculo = fase.portoesVinculados?.find(item => mesmaCasa(item.portao, portao));
  if (fase.portoesVinculados) return vinculo !== undefined && lerCelula(fase, vinculo.placa) === 'P' && siris.some(pos => mesmaCasa(pos, vinculo.placa));
  return siris.some(pos => lerCelula(fase, pos) === 'P');
}

export function bocaSubmersa(fase: Fase, boca: Posicao, passos: number): boolean {
  return lerCelula(fase, boca) === '=' && mareAlta(passos);
}

export function fendaAtiva(fase: Fase, fenda: Fenda, passos: number): boolean {
  return !fenda.bocas.some(boca => bocaSubmersa(fase, boca, passos));
}

type PrevisaoPasso =
  | Readonly<{ entrada: Posicao; motivo: 'bloqueado' | 'ocupada' | 'interditada' }>
  | Readonly<{ entrada: Posicao; destino: Posicao; fenda?: Fenda; saidaVaiAlagar?: boolean }>;

function passagemLivre(fase: Fase, estado: Estado, destino: Posicao, outros: readonly Posicao[]): boolean {
  const celula = lerCelula(fase, destino);
  return !!celula && celula !== '#' && !bocaSubmersa(fase, destino, estado.passos) &&
    !passagemDoRecifeFechada(fase, destino, estado.temFragmento) &&
    (celula !== 'I' || ponteIluminada(fase, destino, estado.passos)) &&
    (celula !== '~' || balsasNoTurno(fase, estado.passos).some(p => mesmaCasa(p, destino))) &&
    (celula !== 'D' || portaoLiberado(fase, destino, outros)) &&
    (celula !== 'O' || portaoDaGrutaAberto(fase, estado)) &&
    !outros.some(outro => mesmaCasa(outro, destino));
}

export function preverPasso(fase: Fase, estado: Estado, direcao: Direcao): PrevisaoPasso {
  const posicoes = posicoesDosSiris(estado);
  const ativo = siriAtivo(estado);
  const outros = posicoes.filter((_, i) => i !== ativo);
  const entrada = calcularDestino(posicoes[ativo], direcao);
  if (!passagemLivre(fase, estado, entrada, outros)) return { entrada, motivo: 'bloqueado' };
  const fenda = fase.fendas?.find(par => par.bocas.some(boca => mesmaCasa(boca, entrada)));
  if (!fenda || !fendaAtiva(fase, fenda, estado.passos)) return { entrada, destino: entrada };

  // Só a casa em que se pisa ativa o par. A saída não dispara outra viagem.
  const destino = mesmaCasa(fenda.bocas[0], entrada) ? fenda.bocas[1] : fenda.bocas[0];
  if (outros.some(outro => mesmaCasa(outro, destino))) return { entrada, motivo: 'ocupada' };
  if (!passagemLivre(fase, estado, destino, outros)) return { entrada, motivo: 'interditada' };
  return { entrada, destino, fenda, saidaVaiAlagar: bocaSubmersa(fase, destino, estado.passos + 1) };
}

// A marca de movimento aponta para a boca pisada, não para a saída distante.
export function destinoPermitido(fase: Fase, estado: Estado, direcao: Direcao): Posicao | undefined {
  const previsao = preverPasso(fase, estado, direcao);
  return 'destino' in previsao ? previsao.entrada : undefined;
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
  const previsao = preverPasso(fase, anterior, acao);
  if ('motivo' in previsao) {
    const { motivo } = previsao;
    const evento: Evento = motivo === 'bloqueado' ? { tipo: 'bloqueado' } : { tipo: 'fenda-bloqueada', motivo };
    return { estado: anterior, eventos: [evento] };
  }
  const passos = anterior.passos + 1;
  const eventos: Evento[] = [];
  if (previsao.fenda) eventos.push({ tipo: 'fenda-atravessada', forma: previsao.fenda.forma });
  let posicoes = posicoesDosSiris(anterior);
  posicoes[ativo] = previsao.destino;
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
  if (coletou) {
    eventos.push({ tipo: 'fragmento' });
    if (fase.recife && 'ida' in fase.recife) eventos.push({ tipo: 'recife-mudou-rota' });
  }
  const celulas = posicoes.map(p => lerCelula(fase, p));
  const etapaGruta = resolverGruta(fase, anterior, celula, passos, posicoes, eventos);
  // A pérola não muda de siri numa troca. A alavanca não precisa do portador.
  let portadorGruta = anterior.portadorGruta;
  if (dupla && etapaGruta !== anterior.etapaGruta) {
    if (celula === 'K') portadorGruta = nomeInternoDoSiri(ativo);
    if (celula === 'E') portadorGruta = undefined;
  }
  const ancoradouros = resolverAncoradouro(fase, anterior, destino, celula, passos, eventos);
  // O ciclo de sobrevivência conta só ondas sem levada. Uma perda devolve a
  // dupla aos marcos e reinicia a sequência sem rebobinar a maré.
  const ondasSeguras = anterior.ondasSeguras !== undefined && faixaRessacaNoTurno(fase, passos)
    ? Math.min(anterior.ondasSeguras + 1, fase.ressaca?.faixas.length ?? 0) : anterior.ondasSeguras;
  const lentesAcesas = acenderLente(fase, anterior.lentesAcesas, destino, celula, passos, posicoes, eventos);
  // Refúgios só contam depois de resolver a maré e as ameaças do passo.
  const abrigosVisitados = registrarAbrigo(fase, anterior, destino, passos, eventos);
  const venceu = resolverObjetivo(fase, celulas, fragmentos.length,
    ancoradouros, ondasSeguras, lentesAcesas, abrigosVisitados, eventos);
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
      ...(abrigosVisitados === undefined ? {} : { abrigosVisitados }),
      ...(etapaGruta === undefined ? {} : { etapaGruta }),
      ...(dupla && etapaGruta !== undefined ? { portadorGruta } : {}),
      ...(novaDupla ? { dupla: novaDupla } : {}),
      ...(terceiro && posicaoTerceiro ? { terceiro: { ...terceiro, posicao: posicaoTerceiro,
        ultimoFirme: firmes ? posicaoTerceiro : terceiro.ultimoFirme } } : {}),
      situacao: venceu ? 'vitoria' : perdeu ? 'derrota' : 'jogando' },
    eventos,
  };
}
