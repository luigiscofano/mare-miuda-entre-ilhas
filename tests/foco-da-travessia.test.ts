import assert from 'node:assert/strict';
import { test } from 'node:test';
import { marcaBloqueioAdjacente } from '../src/render/index.ts';

test('Obstáculos só recebem cantos em adjacência ortogonal e conforme o destino permitido', () => {
  const atual = { coluna: 1, linha: 1 };
  const perto = { coluna: 2, linha: 1 };
  assert.ok(marcaBloqueioAdjacente(perto, atual, '#', false, []));
  assert.ok(!marcaBloqueioAdjacente({ coluna: 2, linha: 2 }, atual, '#', false, []));
  assert.ok(!marcaBloqueioAdjacente({ coluna: 3, linha: 1 }, atual, '#', false, []));
  assert.ok(!marcaBloqueioAdjacente(perto, atual, '=', false, []));
  assert.ok(marcaBloqueioAdjacente(perto, atual, '=', true, []));
  assert.ok(!marcaBloqueioAdjacente(perto, atual, 'D', false, [perto]));
  assert.ok(marcaBloqueioAdjacente(perto, atual, 'D', false, []));
  assert.ok(!marcaBloqueioAdjacente(perto, atual, 'C', false, []));
});
