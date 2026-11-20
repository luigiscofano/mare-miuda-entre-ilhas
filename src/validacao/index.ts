import { executarPasso, iniciar, lerCelula, mesmaCasa } from '../motor/index.ts';
import type { Acao, Fase } from '../motor/index.ts';

export function validarMapa(fase: Fase): void {
  const largura = fase.mapa[0]?.length ?? 0;
  const celulas = fase.mapa.join('');
  const contar = (simbolo: string) => [...celulas].filter(valor => valor === simbolo).length;
  if (!largura || fase.mapa.some(linha => linha.length !== largura) || /[^S.=#CBGHAPDT~KEFO]/.test(celulas)) {
    throw new Error(`Mapa retangular inválido: ${fase.id}.`);
  }
  if (contar('S') !== 1 || contar('C') + contar('G') !== 1 ||
    (contar('G') > 0 && contar('B') === 0) || (contar('B') > 0 && contar('G') === 0)) {
    throw new Error(`Início ou objetivo inválido: ${fase.id}.`);
  }
  if (fase.dupla && (contar('A') !== 1 || contar(fase.dupla.segundoAlvo) !== 1)) {
    throw new Error(`Configuração dupla inválida: ${fase.id}.`);
  }
  if ((!fase.dupla && /[APDT]/.test(celulas)) || (contar('D') && contar('P') !== 1)) {
    throw new Error(`Mecanismo sem dupla ou placa: ${fase.id}.`);
  }
  if (fase.orcamentoMoedas !== undefined &&
    (!Number.isSafeInteger(fase.orcamentoMoedas) || fase.orcamentoMoedas < 1 || contar('B') !== 3)) {
    throw new Error(`Orçamento de três moedas inválido: ${fase.id}.`);
  }
  const etapas = fase.etapasGruta;
  const acoesGruta = ['K', 'E', 'F'] as const;
  if (etapas ? (fase.dupla || contar('O') !== 1 || etapas.length < 2
    || new Set(etapas).size !== etapas.length || etapas.some(acao => !acoesGruta.includes(acao))
    || acoesGruta.some(acao => contar(acao) !== Number(etapas.includes(acao))))
    : /[KEFO]/.test(celulas)) {
    throw new Error(`Mecanismos da gruta inválidos: ${fase.id}.`);
  }
  const balsas = fase.balsas ?? [];
  const agua = balsas.flatMap(balsa => balsa.paradas);
  if (agua.some((pos, i) => lerCelula(fase, pos) !== '~'
    || agua.slice(0, i).some(outra => mesmaCasa(outra, pos)))) {
    throw new Error(`Parada de balsa inválida ou repetida: ${fase.id}.`);
  }
  if (!fase.ameaca) return;
  const { alvo, primeiroAtaque, periodo } = fase.ameaca;
  const alvos = [alvo, ...(fase.ameaca.rota ?? [])];
  if (alvos.some(pos => !lerCelula(fase, pos) || lerCelula(fase, pos) === '#') || !Number.isInteger(periodo) || periodo < 1
    || !Number.isInteger(primeiroAtaque) || primeiroAtaque < 1) {
    throw new Error(`Ameaça inválida: ${fase.id}.`);
  }
}

// Reproduz as mesmas teclas ou toques da interface; troca de siri é uma ação
// válida sem passo e movimento bloqueado não é parte de uma solução.
export function reproduzir(fase: Fase, acoes: readonly Acao[]) {
  let estado = iniciar(fase);
  for (const acao of acoes) {
    const resultado = executarPasso(fase, estado, acao);
    if (resultado.estado === estado) throw new Error(`Comando inválido após ${estado.passos} passos.`);
    estado = resultado.estado;
  }
  return estado;
}

export function validarSolucao(fase: Fase): boolean {
  validarMapa(fase);
  const estado = reproduzir(fase, fase.solucao);
  return estado.situacao === 'vitoria' && estado.levadas === 0;
}
