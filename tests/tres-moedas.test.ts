import assert from 'node:assert/strict';
import { test } from 'node:test';
import { TRES_MOEDAS as fase, TODAS_AS_FASES } from '../src/fases/index.ts';
import { destinoPermitido, DIRECOES, executarPasso, iniciar } from '../src/motor/index.ts';
import { reproduzir, validarMapa, validarSolucao } from '../src/validacao/index.ts';

test('As três moedas são exclusivas do laboratório e é possível vencer no último passo', () => {
  assert.ok(TODAS_AS_FASES.every(desafio => desafio.id !== fase.id && desafio.orcamentoMoedas === undefined));
  assert.ok(validarSolucao(fase));
  const final = reproduzir(fase, fase.solucao);
  assert.equal(final.passos, fase.orcamentoMoedas);
  assert.equal(final.fragmentos.length, 3);
  assert.equal(final.situacao, 'vitoria');
  assert.throws(() => validarMapa({ ...fase, orcamentoMoedas: -1 }), /Orçamento/);
});

test('Moeda não duplica e gastar os passos sem o objetivo encerra uma única vez', () => {
  const inicio = iniciar(fase);
  const desvio = reproduzir(fase, ['cima','cima','baixo','cima']);
  assert.equal(desvio.fragmentos.length, 1);
  const vaiEVolta = Array.from({ length: 7 }, () => ['cima', 'baixo'] as const).flat();
  const antes = reproduzir(fase, vaiEVolta.slice(0, -1));
  const ult = executarPasso(fase, antes, 'baixo');
  assert.equal(ult.estado.situacao, 'derrota');
  assert.ok(ult.eventos.some(e => e.tipo === 'orcamento-esgotado'));
  assert.deepEqual(executarPasso(fase, ult.estado, 'direita'), { estado: ult.estado, eventos: [] });
  assert.deepEqual(iniciar(fase), inicio);
  assert.equal(reproduzir(fase, fase.solucao).situacao, 'vitoria');
});

test('A consulta visual de destinos coincide com a regra em todas as soluções', () => {
  for (const desafio of [...TODAS_AS_FASES, fase]) {
    let estado = iniciar(desafio);
    for (const acao of desafio.solucao) {
      for (const direcao of DIRECOES) {
        assert.equal(Boolean(destinoPermitido(desafio, estado, direcao)),
          executarPasso(desafio, estado, direcao).estado !== estado, desafio.id);
      }
      estado = executarPasso(desafio, estado, acao).estado;
    }
  }
});
