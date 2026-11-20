import assert from 'node:assert/strict';
import { test } from 'node:test';
import { concluirFase, criarProgresso, moverNoMapa, normalizarPosicao, nosDo, trilhasDo } from '../src/campanha/index.ts';
import { prepararTravessia } from '../src/campanha/travessia.ts';
import { carregar } from '../src/persistencia/index.ts';

test('Só há uma saída por direção em cada nó e curvas não são casas de parada', () => {
  for (const mundo of ['praia', 'recifes', 'mangue', 'arquipelago'] as const) {
    const destinos = new Set<string>();
    const nos = nosDo(mundo);
    for (const t of trilhasDo(mundo)) {
      for (const [p, dir] of [[t.de, t.ida], [t.para, t.volta]] as const) {
        const chave = `${p.coluna},${p.linha},${dir}`;
        assert.equal(destinos.has(chave), false, chave);
        destinos.add(chave);
      }
      for (const curva of t.curvas) {
        assert.ok(!nos.some(p => p.coluna === curva.coluna && p.linha === curva.linha));
      }
    }
  }
});

test('Uma pressão cruza toda a trilha diagonal, e a volta usa a curva inversa', () => {
  const p = concluirFase(moverNoMapa(criarProgresso(), 'direita').progresso, 'primeira-onda');
  const ida = moverNoMapa(p, 'baixo');
  assert.deepEqual(ida.progresso.posicao, { coluna: 3, linha: 3 });
  assert.equal(ida.caminho?.length, 4);
  const plano = prepararTravessia(ida.caminho!);
  assert.deepEqual(plano.ponto(0), p.posicao);
  assert.deepEqual(plano.ponto(1), ida.progresso.posicao);
  assert.ok(plano.ponto(0.5).coluna > 2 && plano.ponto(0.5).linha > 1);
  assert.deepEqual(moverNoMapa(ida.progresso, 'cima').caminho, [...ida.caminho!].reverse());
  assert.strictEqual(ida.progresso.concluidas, p.concluidas);
  assert.strictEqual(moverNoMapa(p, 'cima').progresso, p);
});

test('Migração encaminha casa intermediária ao nó alcançável e mantém áudio e vitórias', () => {
  const carregarPosicao = (mundo: unknown, coluna: number, linha: number) =>
    carregar({ getItem: () => JSON.stringify({ versao: 1, progresso: {
      mundo, posicao: { coluna, linha }, concluidas: ['primeira-onda'], viuTutorial: true,
    }, audio: { musica: 0.14, efeitos: 0 } }) });
  const antigo = carregarPosicao(undefined, 3, 2);
  assert.deepEqual(antigo.progresso.posicao, { coluna: 3, linha: 3 });
  assert.deepEqual(antigo.progresso.concluidas, ['primeira-onda']);
  assert.deepEqual(antigo.audio, { musica: 0.14, efeitos: 0 });
  assert.deepEqual(carregarPosicao('recifes', 3, 3).progresso.posicao, { coluna: 2, linha: 1 });
  assert.deepEqual(normalizarPosicao('praia', { coluna: 3, linha: 1 }, ['primeira-onda']), { coluna: 2, linha: 1 });
  assert.deepEqual(normalizarPosicao('arquipelago', { coluna: 6, linha: 1 }, []), { coluna: 5, linha: 3 });
});
