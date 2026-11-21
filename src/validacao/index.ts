import { casasDoRasante, faixaAfeta, TOTAL_ANCORADOUROS, executarPasso, iniciar, lerCelula, mesmaCasa } from '../motor/index.ts';
import type { Acao, Fase } from '../motor/index.ts';

const chave = ({ coluna, linha }: { coluna: number; linha: number }) => `${coluna}:${linha}`;

export function validarMapa(fase: Fase): void {
  const largura = fase.mapa[0]?.length ?? 0;
  const celulas = fase.mapa.join('');
  const contar = (simbolo: string) => [...celulas].filter(valor => valor === simbolo).length;
  if (!largura || fase.mapa.some(linha => linha.length !== largura) || /[^S.=#CBGHAPDT~KEFONMYIL]/.test(celulas)) {
    throw new Error(`Mapa retangular inválido: ${fase.id}.`);
  }
  if (contar('S') !== 1 || contar('C') + contar('G') !== 1 ||
    (contar('G') > 0 && contar('B') === 0) || (contar('B') > 0 && contar('G') === 0)) {
    throw new Error(`Início ou objetivo inválido: ${fase.id}.`);
  }
  if (fase.dupla && (contar('A') !== 1 || contar(fase.dupla.segundoAlvo) !== 1)) {
    throw new Error(`Configuração dupla inválida: ${fase.id}.`);
  }
  const temTrio = fase.dupla?.terceiroAlvo !== undefined;
  if (temTrio ? (contar('M') !== 1 || contar('Y') !== 1) : /[MY]/.test(celulas)) {
    throw new Error(`Configuração do trio inválida: ${fase.id}.`);
  }
  if ((!fase.dupla && /[APDT]/.test(celulas)) || (contar('D') && !fase.portoesVinculados && contar('P') !== 1)) {
    throw new Error(`Mecanismo sem dupla ou placa: ${fase.id}.`);
  }
  const portoes = fase.portoesVinculados;
  if (portoes && (!fase.dupla || portoes.length < 2 || contar('D') !== portoes.length
    || contar('P') !== portoes.length || new Set(portoes.map(item => chave(item.portao))).size !== portoes.length
    || new Set(portoes.map(item => chave(item.placa))).size !== portoes.length
    || portoes.some(({ portao, placa }) => lerCelula(fase, portao) !== 'D' || lerCelula(fase, placa) !== 'P'))) {
    throw new Error(`Vínculos de portões inválidos: ${fase.id}.`);
  }
  if (fase.orcamentoMoedas !== undefined &&
    (!Number.isSafeInteger(fase.orcamentoMoedas) || fase.orcamentoMoedas < 1 || contar('B') !== 3)) {
    throw new Error(`Orçamento de três moedas inválido: ${fase.id}.`);
  }
  const etapas = fase.etapasGruta;
  const acoesGruta = ['K', 'E', 'F'] as const;
  if (etapas ? (contar('O') !== 1 || etapas.length < 2
    || new Set(etapas).size !== etapas.length || etapas.some(acao => !acoesGruta.includes(acao))
    || acoesGruta.some(acao => contar(acao) !== Number(etapas.includes(acao))))
    : /[KEFO]/.test(celulas)) {
    throw new Error(`Mecanismos da gruta inválidos: ${fase.id}.`);
  }
  const farol = fase.farol;
  if (farol) {
    const { passosPorOrientacao, orientacoes } = farol;
    const lentes = new Set(orientacoes.map(({ lente }) => chave(lente)));
    const pontes = new Set(orientacoes.flatMap(({ plataformas }) => plataformas.map(chave)));
    const placas = orientacoes.flatMap(o => o.placa ? [o.placa] : []);
    const sintoniaInvalida = placas.length > 0 && (!temTrio || placas.length !== orientacoes.length
      || new Set(placas.map(chave)).size !== placas.length || contar('P') !== placas.length
      || placas.some(pos => lerCelula(fase, pos) !== 'P'));
    if (sintoniaInvalida || !Number.isInteger(passosPorOrientacao) || passosPorOrientacao < 2 || orientacoes.length < 2
      || new Set(orientacoes.map(o => o.nome)).size !== orientacoes.length || contar('C') !== 1
      || lentes.size !== orientacoes.length || lentes.size !== contar('L') || pontes.size !== contar('I')
      || orientacoes.some(o => !o.nome || !o.plataformas.length
        || new Set(o.plataformas.map(chave)).size !== o.plataformas.length || lerCelula(fase, o.lente) !== 'L'
        || o.plataformas.some(pos => lerCelula(fase, pos) !== 'I'))) {
      throw new Error(`Configuração do feixe inválida: ${fase.id}.`);
    }
  } else if (/[IL]/.test(celulas)) {
    throw new Error(`Ponte ou lente sem feixe: ${fase.id}.`);
  }
  const faixas = fase.ressaca?.faixas;
  const sobrevivencia = fase.ressaca?.objetivo === 'sobreviver';
  if (faixas ? (contar('N') !== (fase.ressaca?.objetivo ? 0 : TOTAL_ANCORADOUROS)
    || contar('C') !== 1 || !faixas.length || (sobrevivencia &&
      (fase.dupla?.segundoAlvo !== 'T' || faixas.length < 2 || new Set(faixas.map(f => f.linha)).size !== faixas.length))
    || faixas.some(faixa => {
      const { linha, primeiraColuna, ultimaColuna } = faixa;
      return ![linha, primeiraColuna, ultimaColuna].every(Number.isInteger)
        || linha < 0 || linha >= fase.mapa.length || primeiraColuna < 0 || ultimaColuna >= largura
        || ultimaColuna <= primeiraColuna
        || [...fase.mapa[linha]].filter((_, coluna) => faixaAfeta(fase, faixa, { coluna, linha })).length < 2;
    })) : contar('N') > 0) {
    throw new Error(`Configuração de ressaca inválida: ${fase.id}.`);
  }
  if (sobrevivencia && fase.mapa.some((linha, y) => [...linha].some((casa, x) =>
    (casa === 'C' || casa === 'T') && faixas?.some(faixa => faixaAfeta(fase, faixa, { coluna: x, linha: y }))))) {
    throw new Error(`Destino atingido pela ressaca: ${fase.id}.`);
  }
  const recife = fase.recife;
  if (recife) {
    const correto = 'abrigos' in recife
      ? recife.abrigos.length === 2 && !mesmaCasa(...recife.abrigos)
        && recife.abrigos.every(pos => lerCelula(fase, pos) === 'H') && contar('C') === 1
      : !mesmaCasa(recife.ida, recife.volta)
        && lerCelula(fase, recife.ida) === '=' && lerCelula(fase, recife.volta) === '='
        && contar('B') === 1 && contar('G') === 1;
    if (!correto || fase.dupla) throw new Error(`Configuração de prova do recife inválida: ${fase.id}.`);
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
  const rasante = fase.ameaca.rasante;
  if (rasante && ((rasante.eixo !== 'linha' && rasante.eixo !== 'coluna')
    || !Number.isInteger(rasante.alcance) || rasante.alcance < 1 || rasante.alcance > 4
    || alvos.some((_, i) => casasDoRasante(fase, primeiroAtaque + i * periodo).length < 2))) {
    throw new Error(`Rasante inválido: ${fase.id}.`);
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
