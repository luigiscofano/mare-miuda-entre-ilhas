import assert from 'node:assert/strict';
import { test } from 'node:test';
import { executarPasso, iniciar, mareAlta, passosAteVirada, vaiAtacar } from '../src/motor/index.ts';
import type { Fase } from '../src/motor/index.ts';
import { FASES } from '../src/fases/index.ts';
import { reproduzir, validarMapa, validarSolucao } from '../src/validacao/index.ts';

for (const fase of FASES) {
  test(`Solução sem erros no motor: ${fase.nome}`, () => assert.equal(validarSolucao(fase), true));
}
test('Cadência e previsão nas transições 2/3/5/6', () => {
  assert.deepEqual([0, 1, 2, 3, 4, 5, 6, 9].map(mareAlta), [false, false, false, true, true, true, false, true]);
  assert.deepEqual([0, 1, 2, 3, 4, 5, 6].map(passosAteVirada), [3, 2, 1, 3, 2, 1, 3]);
});
test('Movimento bloqueado não altera a tentativa', () => {
  const fase = FASES[0];
  const estado = iniciar(fase);
  const resultado = executarPasso(fase, estado, 'esquerda');
  assert.strictEqual(resultado.estado, estado);
  assert.deepEqual(resultado.eventos, [{ tipo: 'bloqueado' }]);
});
test('A subida leva o siri de volta, sem rebobinar o turno', () => {
  const fase = FASES[0];
  const estado = reproduzir(fase, ['baixo', 'cima', 'direita']);
  assert.deepEqual(estado.posicao, { coluna: 0, linha: 0 });
  assert.equal(estado.passos, 3);
  assert.equal(estado.levadas, 1);
  assert.equal(mareAlta(estado.passos), true);
});
test('Não entra em baixio coberto no próprio passo de descida', () => {
  const fase = FASES[0];
  const estado = reproduzir(fase, ['baixo', 'cima', 'direita', 'baixo', 'cima']);
  assert.equal(estado.passos, 5);
  assert.strictEqual(executarPasso(fase, estado, 'direita').estado, estado);
  assert.equal(executarPasso(fase, estado, 'baixo').estado.passos, 6);
});
test('Terceiro erro encerra e a tentativa não muda depois de acabar', () => {
  const fase: Fase = { ...FASES[0], ameaca: { alvo: { coluna: 1, linha: 0 }, primeiroAtaque: 1, periodo: 1 } };
  const estado = reproduzir(fase, ['direita', 'direita', 'direita']);
  assert.equal(estado.situacao, 'derrota');
  assert.equal(estado.levadas, 3);
  assert.strictEqual(executarPasso(fase, estado, 'baixo').estado, estado);
});
test('Concha segura no terceiro passo vence após notificar a virada', () => {
  const fase = FASES[0];
  const estado = reproduzir(fase, ['direita', 'direita']);
  const resultado = executarPasso(fase, estado, 'direita');
  assert.equal(resultado.estado.situacao, 'vitoria');
  assert.deepEqual(resultado.eventos.map(evento => evento.tipo), ['virada', 'vitoria']);
});
test('A ameaça tem prioridade sobre a concha no mesmo turno', () => {
  const fase: Fase = { ...FASES[0], ameaca: { alvo: { coluna: 3, linha: 0 }, primeiroAtaque: 3, periodo: 4 } };
  const estado = reproduzir(fase, ['direita', 'direita']);
  const resultado = executarPasso(fase, estado, 'direita');
  assert.equal(resultado.estado.situacao, 'jogando');
  assert.deepEqual(resultado.estado.posicao, estado.posicao);
  assert.deepEqual(resultado.eventos.map(evento => evento.tipo), ['virada', 'levada']);
});
test('A garça e a subida no mesmo passo descontam um erro só', () => {
  const fase: Fase = { ...FASES[0], ameaca: { alvo: { coluna: 1, linha: 0 }, primeiroAtaque: 3, periodo: 4 } };
  const estado = reproduzir(fase, ['baixo', 'cima']);
  const resultado = executarPasso(fase, estado, 'direita');
  assert.equal(resultado.estado.levadas, 1);
  assert.deepEqual(resultado.eventos[1], { tipo: 'levada', motivos: ['mare', 'garca'] });
});
test('A ameaça não se adianta em passos bloqueados e tem padrão 3, 7 e 11', () => {
  const fase = FASES[1];
  const estado = reproduzir(fase, ['direita', 'direita']);
  assert.deepEqual([1, 2, 3, 6, 7, 11].map(p => vaiAtacar(fase.ameaca, p)), [false, false, true, false, true, true]);
  const rejeitada = executarPasso(fase, estado, 'cima');
  assert.strictEqual(rejeitada.estado, estado);
  assert.equal(executarPasso(fase, estado, 'direita').estado.levadas, 1);
});
test('A saída não vale sem fragmento, coleta não duplica e reinício limpa estado', () => {
  const fase = FASES[2];
  const antes = iniciar(fase);
  const saida = executarPasso(fase, antes, 'direita');
  assert.equal(saida.estado.situacao, 'jogando');
  assert.deepEqual(saida.eventos, [{ tipo: 'falta-fragmento' }]);
  const aposColeta = reproduzir(fase, ['baixo', 'baixo', 'direita', 'esquerda']);
  const bis = executarPasso(fase, aposColeta, 'direita');
  assert.equal(bis.estado.temFragmento, true);
  assert.deepEqual(bis.eventos, []);
  assert.deepEqual(iniciar(fase), antes);
});
test('Validador rejeita mapa irregular, objetivo sem item e ameaça inválida', () => {
  assert.throws(() => validarMapa({ ...FASES[0], mapa: ['SC', '.'] }), /retangular/);
  assert.throws(() => validarMapa({ ...FASES[0], mapa: ['SG', '..'] }), /objetivo/);
  assert.throws(() => validarMapa({ ...FASES[1], ameaca: { alvo: { coluna: 0, linha: 1 }, primeiroAtaque: 3, periodo: 4 } }), /Ameaça/);
});
