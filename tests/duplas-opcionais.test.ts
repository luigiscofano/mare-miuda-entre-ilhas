import assert from 'node:assert/strict';
import { test } from 'node:test';
import { concluirFase, criarProgresso, entradaEm, moverNoMapa, viajar } from '../src/campanha/index.ts';
import type { IdFase, Progresso } from '../src/campanha/index.ts';
import { DUPLA_DERIVA, DUPLA_DERIVA_CONTRAMAO, DUPLA_ENSEADA, DUPLA_ENSEADA_REVEZAMENTO } from '../src/fases/duplas-opcionais.ts';
import { DIRECOES, executarPasso, iniciar } from '../src/motor/index.ts';
import type { Acao, Estado, Fase } from '../src/motor/index.ts';
import { carregar, salvar } from '../src/persistencia/index.ts';
import { reproduzir, validarSolucao } from '../src/validacao/index.ts';

function temCaminho(fase: Fase, acoes: readonly Acao[]): boolean {
  const fila: Estado[] = [iniciar(fase)];
  const visitados = new Set<string>();
  const primeiroAtaque = fase.ameaca?.primeiroAtaque ?? 0;
  // Após o primeiro ataque, o produto contém períodos inteiros de maré e patrulha.
  const periodo = 6 * (fase.ameaca?.periodo ?? 1) * (1 + (fase.ameaca?.rota?.length ?? 0));
  for (let i = 0; i < fila.length; i += 1) {
    const estado = fila[i];
    if (estado.situacao === 'vitoria') return true;
    if (estado.situacao === 'derrota') continue;
    const { passos, ...tabuleiro } = estado;
    const relogio = passos < primeiroAtaque ? passos : primeiroAtaque + (passos - primeiroAtaque) % periodo;
    const chave = JSON.stringify([relogio, tabuleiro]);
    if (visitados.has(chave)) continue;
    visitados.add(chave);
    for (const acao of acoes) {
      const proximo = executarPasso(fase, estado, acao).estado;
      if (proximo !== estado) fila.push(proximo);
    }
  }
  return false;
}

test('Os quatro desvios têm solução sem levadas e não vencem sem alternar', () => {
  for (const fase of [DUPLA_ENSEADA, DUPLA_DERIVA, DUPLA_ENSEADA_REVEZAMENTO, DUPLA_DERIVA_CONTRAMAO]) {
    assert.ok(validarSolucao(fase), fase.id);
    assert.ok(temCaminho(fase, [...DIRECOES, 'trocar']), fase.id);
    assert.equal(temCaminho(fase, DIRECOES), false, fase.id);
  }
  assert.equal(temCaminho({ ...DUPLA_DERIVA, balsas: [] }, [...DIRECOES, 'trocar']), false);
});

test('Na Enseada, a garça alcança o siri inativo e a troca não adianta o rasante', () => {
  const antesDaTroca = reproduzir(DUPLA_ENSEADA, ['direita', 'direita', 'direita']);
  const troca = executarPasso(DUPLA_ENSEADA, antesDaTroca, 'trocar');
  assert.equal(troca.estado.passos, 3);
  const antesDoAtaque = reproduzir(DUPLA_ENSEADA, [
    'direita', 'direita', 'direita', 'trocar', 'direita', 'direita',
  ]);
  const passagem = executarPasso(DUPLA_ENSEADA, antesDoAtaque, 'direita');
  assert.deepEqual(passagem.eventos, [{ tipo: 'virada', alta: false }, { tipo: 'levada', motivos: ['garca'] }]);
  assert.equal(passagem.estado.levadas, 1);
  assert.notDeepEqual(passagem.estado.dupla?.posicao, { coluna: 3, linha: 2 });
});

test('Na Deriva, o ativo não atravessa o portão sozinho e a balsa leva o inativo', () => {
  const embarcado = reproduzir(DUPLA_DERIVA, ['direita', 'direita', 'direita']);
  const bloqueado = executarPasso(DUPLA_DERIVA, embarcado, 'direita');
  assert.strictEqual(bloqueado.estado, embarcado);
  const antesDaVolta = reproduzir(DUPLA_DERIVA, [
    'direita', 'direita', 'direita', 'trocar', 'direita', 'direita',
  ]);
  const volta = executarPasso(DUPLA_DERIVA, antesDaVolta, 'esquerda');
  assert.deepEqual(volta.estado.posicao, { coluna: 3, linha: 0 });
  assert.deepEqual(volta.estado.dupla?.posicao, { coluna: 1, linha: 2 });
  assert.deepEqual(volta.eventos.map(e => e.tipo), ['virada', 'balsa']);
});

test('As duplas ficam em desvios retomáveis e não travam a campanha', () => {
  for (const [mundo, final, fase] of [
    ['enseada', 'enseada-farol-baixo', DUPLA_ENSEADA],
    ['deriva', 'deriva-corrente-cruzada', DUPLA_DERIVA],
  ] as const) {
    const posicao = { coluna: 6, linha: 1 };
    const antes: Progresso = { ...criarProgresso(), posicao, mundo };
    assert.strictEqual(moverNoMapa(antes, 'cima').progresso, antes);
    const fim = concluirFase(antes, final);
    const desvio = moverNoMapa(fim, 'cima').progresso;
    assert.equal(entradaEm(desvio.posicao, mundo)?.id, fase.id);
    assert.equal(entradaEm(desvio.posicao, mundo)?.opcional, true);
    assert.deepEqual(moverNoMapa(desvio, 'baixo').progresso, fim);
    const porto = moverNoMapa(fim, 'baixo').progresso;
    assert.equal(viajar(porto, 'arquipelago').mundo, 'arquipelago');
    // A retomada respeita também as fases anteriores necessárias para chegar ao nó.
    const concluidas: readonly IdFase[] = mundo === 'enseada'
      ? ['enseada-sombra-restinga', 'enseada-abrigo-ondas', final, fase.id as IdFase]
      : ['deriva-primeira-balsa', 'deriva-duas-margens', final, fase.id as IdFase];
    let dados = '';
    const storage = { getItem: () => dados, setItem: (_: string, valor: string) => { dados = valor; } };
    const save = { progresso: { ...desvio, concluidas }, audio: { musica: .25, efeitos: .5 } };
    assert.ok(salvar(storage, save));
    assert.deepEqual(carregar(storage), save);
  }
});

test('Na restinga, a patrulha obriga alternar qual siri fica em segurança', () => {
  const fase = DUPLA_ENSEADA_REVEZAMENTO;
  const antesDaVirada = reproduzir(fase, fase.solucao.slice(0, 12));
  assert.equal(antesDaVirada.passos, 11);
  assert.ok(antesDaVirada.dupla?.parceiroAtivo);
  const deixouOVermelhoNaMira = executarPasso(fase, antesDaVirada, 'direita');
  assert.deepEqual(deixouOVermelhoNaMira.eventos, [
    { tipo: 'virada', alta: false }, { tipo: 'levada', motivos: ['garca'] },
  ]);

  const antesDoSegundoRasante = reproduzir(fase, fase.solucao.slice(0, 15));
  assert.equal(antesDoSegundoRasante.passos, 13);
  assert.equal(antesDoSegundoRasante.dupla?.parceiroAtivo, false);
  const deixouOVerdeNaMira = executarPasso(fase, antesDoSegundoRasante, 'direita');
  assert.deepEqual(deixouOVerdeNaMira.eventos, [{ tipo: 'levada', motivos: ['garca'] }]);
});

test('O segundo desvio da Deriva precisa de cada uma das duas balsas', () => {
  const fase = DUPLA_DERIVA_CONTRAMAO;
  assert.equal(reproduzir(fase, fase.solucao).passos, 20);
  for (const balsa of fase.balsas ?? []) {
    assert.equal(temCaminho({ ...fase, balsas: [balsa] }, [...DIRECOES, 'trocar']), false);
  }
});

test('Os novos desvios seguem os primeiros sem alterar volta ao porto nem retomada', () => {
  const casos: readonly [Progresso['mundo'], readonly IdFase[], IdFase][] = [
    ['enseada', ['enseada-sombra-restinga', 'enseada-abrigo-ondas', 'enseada-farol-baixo', 'enseada-dupla-vigia'], 'enseada-dupla-revezamento'],
    ['deriva', ['deriva-primeira-balsa', 'deriva-duas-margens', 'deriva-corrente-cruzada', 'deriva-dupla-cais'], 'deriva-dupla-contramao'],
  ];
  for (const [mundo, concluidas, novaFase] of casos) {
    const posicao = { coluna: 7, linha: 0 };
    const antes = { ...criarProgresso(), posicao, mundo, concluidas: concluidas.slice(0, -1) };
    assert.strictEqual(moverNoMapa(antes, 'direita').progresso, antes);
    const pronto = concluirFase(antes, concluidas[3]);
    const desvio = moverNoMapa(pronto, 'direita').progresso;
    assert.equal(entradaEm(desvio.posicao, mundo)?.id, novaFase);
    assert.equal(entradaEm(desvio.posicao, mundo)?.opcional, true);
    assert.deepEqual(moverNoMapa(desvio, 'esquerda').progresso, pronto);
    const retorno = moverNoMapa(moverNoMapa(pronto, 'baixo').progresso, 'baixo').progresso;
    assert.equal(viajar(retorno, 'arquipelago').mundo, 'arquipelago');
    let dados = '';
    const storage = { getItem: () => dados, setItem: (_: string, valor: string) => { dados = valor; } };
    const save = { progresso: concluirFase(desvio, novaFase), audio: { musica: .25, efeitos: .5 } };
    assert.ok(salvar(storage, save));
    assert.deepEqual(carregar(storage), save);
  }
});
