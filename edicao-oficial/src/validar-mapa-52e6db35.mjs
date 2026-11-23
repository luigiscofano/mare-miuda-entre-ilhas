import { casasDoRasante, DIRECOES, FORMAS_DE_FENDA, executarPasso, iniciar, lerCelula } from '@@MARE:modulo:src/formas-de-fenda-70ff4532.mjs@@';
                                                    

const chave = ({ coluna, linha }                                   ) => `${coluna}:${linha}`;

export function validarMapa(fase      )       {
  const largura = fase.mapa[0]?.length ?? 0;
  const celulas = fase.mapa.join('');
  const contar = (simbolo        ) => [...celulas].filter(valor => valor === simbolo).length;
  if (!largura || fase.mapa.some(linha => linha.length !== largura) || /[^S.=#CBGHATMY]/.test(celulas)) {
    throw new Error(`Mapa retangular inválido: ${fase.id}.`);
  }
  if (contar('S') !== 1 || contar('C') + contar('G') !== 1 ||
    (contar('G') > 0 && contar('B') === 0) || (contar('B') > 0 && contar('G') === 0)) {
    throw new Error(`Início ou objetivo inválido: ${fase.id}.`);
  }
  if (fase.fendas) {
    const bocas = fase.fendas.flatMap(fenda => fenda.bocas);
    if (!fase.fendas.length || new Set(fase.fendas.map(fenda => fenda.forma)).size !== fase.fendas.length
      || fase.fendas.some(fenda => fenda.bocas.length !== 2 || !FORMAS_DE_FENDA.includes(fenda.forma))
      || new Set(bocas.map(chave)).size !== bocas.length || bocas.some(boca => {
        const celula = lerCelula(fase, boca);
        return !Number.isInteger(boca.coluna) || !Number.isInteger(boca.linha) || (celula !== '.' && celula !== '=');
      })) {
      throw new Error(`Bocas de fenda inválidas: ${fase.id}.`);
    }
  }
  if (fase.dupla && (contar('A') !== 1 || contar(fase.dupla.segundoAlvo) !== 1)) {
    throw new Error(`Configuração dupla inválida: ${fase.id}.`);
  }
  const temTrio = fase.dupla?.terceiroAlvo !== undefined;
  if (temTrio ? (contar('M') !== 1 || contar('Y') !== 1) : /[MY]/.test(celulas)) {
    throw new Error(`Configuração do trio inválida: ${fase.id}.`);
  }
  if ((!fase.dupla && /[AT]/.test(celulas)) ||
      (fase.dupla && fase.dupla.segundoAlvo !== 'T') ||
      (temTrio && fase.dupla.terceiroAlvo !== 'Y')) {
    throw new Error(`Saídas da equipe inválidas: ${fase.id}.`);
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

// Reproduz a jogada simultânea da interface. Soluções não podem ter
// seleção de siri nem comandos em que ninguém pode andar.
export function reproduzir(fase      , acoes                 ) {
  let estado = iniciar(fase);
  for (const acao of acoes) {
    if (!DIRECOES.some(direcao => direcao === acao)) throw new Error('Use apenas direções na solução.');
    const resultado = executarPasso(fase, estado, acao);
    if (resultado.estado === estado) throw new Error(`Comando inválido após ${estado.passos} passos.`);
    estado = resultado.estado;
  }
  return estado;
}

export function validarSolucao(fase      )          {
  validarMapa(fase);
  const estado = reproduzir(fase, fase.solucao);
  return estado.situacao === 'vitoria' && estado.levadas === 0;
}
