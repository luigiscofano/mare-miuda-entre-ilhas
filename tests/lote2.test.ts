import assert from 'node:assert/strict';
import { test } from 'node:test';
import { FASES_DERIVA, FASES_ENSEADA } from '../src/fases/lote2.ts';
import { alvoDaGarca, balsasNoTurno, DIRECOES, executarPasso, iniciar } from '../src/motor/index.ts';
import { concluirFase, criarProgresso, entradaEm, moverNoMapa, mundoAtual, viajar } from '../src/campanha/index.ts';
import type { IdFase, Progresso } from '../src/campanha/index.ts';
import type { Estado, Fase } from '../src/motor/index.ts';
import { carregar, salvar } from '../src/persistencia/index.ts';
import { reproduzir, validarMapa, validarSolucao } from '../src/validacao/index.ts';

function temSolucaoSemErros(fase: Fase): boolean {
  const fila: Estado[] = [iniciar(fase)];
  const vistos = new Set<string>();
  const garca = fase.ameaca;
  // O produto contém um ciclo inteiro de maré e de patrulha. Antes do
  // primeiro rasante, os passos não podem ser confundidos com ciclos posteriores.
  const periodo = 6 * (garca?.periodo ?? 1) * (1 + (garca?.rota?.length ?? 0));
  const primeiro = garca?.primeiroAtaque ?? 0;
  for (let i = 0; i < fila.length; i++) {
    const estado = fila[i];
    if (estado.situacao === 'vitoria') return true;
    const { passos, ...tabuleiro } = estado;
    const faseDoRelogio = passos < primeiro ? passos : primeiro + (passos - primeiro) % periodo;
    const chave = JSON.stringify([faseDoRelogio, tabuleiro]);
    if (vistos.has(chave)) continue;
    vistos.add(chave);
    for (const direcao of DIRECOES) {
      const proximo = executarPasso(fase, estado, direcao).estado;
      if (proximo !== estado && proximo.levadas === 0) fila.push(proximo);
    }
  }
  return false;
}

test('A busca independente encontra rota sem erros nas seis fases novas', () => {
  for (const fase of [...FASES_ENSEADA, ...FASES_DERIVA]) assert.ok(temSolucaoSemErros(fase), fase.id);
});

test('Patrulha anuncia a mesma célula que atacará e só avança com ação válida', () => {
  const fase = FASES_ENSEADA[0];
  const antes = reproduzir(fase, ['direita', 'direita']);
  const ataque = alvoDaGarca(fase.ameaca, antes.passos + 1);
  assert.deepEqual(ataque, { coluna: 3, linha: 0 });
  assert.equal(executarPasso(fase, antes, 'cima').estado, antes);
  assert.equal(executarPasso(fase, antes, 'direita').estado.levadas, 1);
  assert.deepEqual(alvoDaGarca(fase.ameaca, 7), { coluna: 1, linha: 0 });
  assert.ok(FASES_ENSEADA.every(validarSolucao));
});

test('Virada move a balsa e o siri atomicamente; rasante resolve no ponto de chegada', () => {
  const fase = FASES_DERIVA[0];
  const antes = reproduzir(fase, ['direita', 'direita']);
  const depois = executarPasso(fase, antes, 'direita');
  const cais = fase.balsas![0].paradas[1];
  assert.deepEqual(depois.estado.posicao, cais);
  assert.deepEqual(depois.eventos.map(e => e.tipo), ['virada', 'balsa']);
  assert.deepEqual(balsasNoTurno(fase, 6), balsasNoTurno(fase, 0));
  const garca = { ...fase, ameaca: { alvo: cais, primeiroAtaque: 3, periodo: 4 } };
  const atingiu = executarPasso(garca, antes, 'direita');
  assert.equal(atingiu.estado.levadas, 1);
  assert.deepEqual(atingiu.estado.posicao, antes.ultimoFirme);
  assert.deepEqual(atingiu.eventos.map(e => e.tipo), ['virada', 'balsa', 'levada']);
  assert.ok(FASES_DERIVA.every(validarSolucao));
});

test('Balsas são indispensáveis às soluções: água sem balsa não permite embarque', () => {
  for (const fase of FASES_DERIVA) {
    const semBalsa = { ...fase, balsas: [] };
    assert.throws(() => reproduzir(semBalsa, fase.solucao), /inválido/);
    assert.equal(temSolucaoSemErros(semBalsa), false, fase.id);
  }
  const fase = FASES_DERIVA[0];
  const cais = fase.balsas![0].paradas[0];
  assert.throws(() => validarMapa({ ...fase, balsas: [{ paradas: [cais, cais] }] }), /repetida/);
  assert.deepEqual(iniciar(fase).posicao, { coluna: 0, linha: 0 });
});

test('Enseada e Ilhas mantêm embarque, saída e recarga sem exigir opcionais', () => {
  const concluidas: readonly IdFase[] = ['recife-retorno', 'mangue-reuniao'];
  let p: Progresso = { ...criarProgresso(), mundo: 'arquipelago', posicao: { coluna: 6, linha: 1 }, concluidas };
  const direita = (p: Progresso) => moverNoMapa(p, 'direita').progresso;
  assert.equal(direita(p), p);
  for (const [mundo, fases] of [['enseada', FASES_ENSEADA], ['deriva', FASES_DERIVA]] as const) {
    p = viajar(p, mundo);
    assert.equal(mundoAtual(p), mundo);
    assert.equal(moverNoMapa(p, 'baixo').progresso, p);
    for (const fase of fases) {
      p = direita(p);
      assert.equal(entradaEm(p.posicao, mundo)?.id, fase.id);
      p = concluirFase(p, fase.id as IdFase);
    }
    let bruto = '';
    const storage = { getItem: () => bruto, setItem: (_: string, v: string) => { bruto = v; } };
    const save = { progresso: p, audio: { musica: .1, efeitos: 0 } };
    assert.ok(salvar(storage, save));
    assert.deepEqual(carregar(storage), save);
    p = viajar(moverNoMapa(p, 'baixo').progresso, 'arquipelago');
    assert.equal(mundoAtual(p), 'arquipelago');
    if (mundo === 'enseada') p = direita(p);
  }
  assert.ok(!p.concluidas.includes('ilhota-perolada'));
});
