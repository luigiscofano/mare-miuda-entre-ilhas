import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  CHAVE_HISTORICO_MARE, incluirNoHistorico, lerHistoricoMare, salvarHistoricoMare,
  type EntradaMareAMao,
} from '../src/interface/historico-mare-a-mao.ts';

const entrada = (semente: string): EntradaMareAMao => ({
  semente, opcoes: { mundo: 'ressaca', dificuldade: 'Maré Feroz', siris: 3, garca: true, fragmento: true },
});

test('o histórico preserva somente as 12 combinações recentes e pode reabrir uma semente', () => {
  let historico: EntradaMareAMao[] = [];
  for (let i = 0; i < 18; i++) historico = incluirNoHistorico(historico, entrada(String(i)));
  assert.equal(historico.length, 12);
  assert.equal(historico.at(-1)?.semente, '6');
  historico = incluirNoHistorico(historico, entrada('6'));
  assert.equal(historico.length, 12);
  assert.equal(historico[0].semente, '6');
  assert.equal(historico.filter(i => i.semente === '6').length, 1);
  const dados = new Map<string, string>([['campanha-fixture', ' intacta ']]);
  assert.ok(salvarHistoricoMare({ setItem: (k,v) => { dados.set(k,v); } }, historico));
  assert.equal(dados.get('campanha-fixture'), ' intacta ');
  assert.deepEqual(lerHistoricoMare({ getItem: k => dados.get(k) ?? null }), historico);
});

test('o histórico descarta dados inválidos e não bloqueia jogo sem armazenamento', () => {
  const ok = entrada('boa');
  assert.deepEqual(lerHistoricoMare({ getItem: () => JSON.stringify([
    null, {}, entrada('  '), { semente:'outra', opcoes:{...ok.opcoes,siris:0} }, ok,
  ]) }), [ok]);
  assert.deepEqual(lerHistoricoMare({ getItem: () => '{' }), []);
  assert.deepEqual(lerHistoricoMare({ getItem: () => { throw Error('Negado'); } }), []);
  assert.equal(salvarHistoricoMare({ setItem: () => { throw Error('Negado'); } }, [ok]), false);
  assert.match(CHAVE_HISTORICO_MARE, /mare-a-mao-v1$/);
});
