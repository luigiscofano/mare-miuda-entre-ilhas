import assert from 'node:assert/strict';
import { test } from 'node:test';
import { concluirFase, entradaEm, moverNoMapa, totalDeFasesRegulares, viajar } from '../src/campanha/index.ts';
import type { Progresso } from '../src/campanha/index.ts';
import { VENTO_SUL } from '../src/fases/vento-sul.ts';
import { executarPasso, faixaAfeta, faixaRessacaNoTurno, iniciar } from '../src/motor/index.ts';
import { carregar, salvar } from '../src/persistencia/index.ts';
import { reproduzir, validarMapa, validarSolucao } from '../src/validacao/index.ts';

const p = (coluna: number, linha: number) => ({ coluna, linha });

test('o mesmo relógio governa maré, aviso e faixa de ressaca em três subidas', () => {
  const faixas = VENTO_SUL.ressaca.faixas;
  assert.deepEqual([3, 9, 15, 21].map(turno => faixaRessacaNoTurno(VENTO_SUL, turno)),
    [...faixas, faixas[0]]);
  for (const turno of [0, 1, 2, 4, 6, 7, 12, 18]) {
    assert.equal(faixaRessacaNoTurno(VENTO_SUL, turno), undefined);
  }
  const faixa = faixas[0];
  assert.ok(faixaAfeta(VENTO_SUL, faixa, p(1, 0)));
  assert.ok(faixaAfeta(VENTO_SUL, faixa, p(2, 0)));
  assert.ok(faixaAfeta(VENTO_SUL, faixa, p(3, 0)));
  assert.ok(!faixaAfeta(VENTO_SUL, faixa, p(0, 0)));
  assert.ok(!faixaAfeta(VENTO_SUL, faixas[1], p(3, 2)));
  const antesDaVirada = { ...iniciar(VENTO_SUL), posicao: p(3, 1), ultimoFirme: p(3, 1), passos: 8 };
  const abrigo = executarPasso(VENTO_SUL, antesDaVirada, 'baixo');
  assert.deepEqual(abrigo.estado.posicao, p(3, 2));
  assert.equal(abrigo.estado.levadas, 0);
});

test('a onda e a maré são resolvidas antes da coleta, da checagem da saída e do retorno', () => {
  let estado = reproduzir(VENTO_SUL, ['direita', 'direita']);
  const bloqueado = executarPasso(VENTO_SUL, estado, 'baixo');
  assert.equal(bloqueado.estado, estado);
  const perda = executarPasso(VENTO_SUL, estado, 'direita');
  assert.deepEqual(perda.eventos, [{ tipo: 'virada', alta: true }, { tipo: 'levada', motivos: ['ressaca'] }]);
  assert.deepEqual(perda.estado.posicao, p(2, 0));
  assert.equal(perda.estado.passos, 3);
  assert.deepEqual(perda.estado.ancoradouros, []);

  const faixaCentral = reproduzir(VENTO_SUL, VENTO_SUL.solucao.slice(0, 8));
  assert.deepEqual(faixaCentral.ancoradouros, [p(0, 2), p(3, 0)]);
  const subidaForaDaFaixa = executarPasso(VENTO_SUL, faixaCentral, 'direita');
  assert.equal(subidaForaDaFaixa.estado.levadas, 0);

  // Simula as duas condições simultâneas numa célula baixia da faixa central.
  const antesDaOnda = { ...iniciar(VENTO_SUL), posicao: p(3, 2), ultimoFirme: p(3, 2), passos: 8,
    ancoradouros: [p(0, 2)] };
  const simultanea = executarPasso(VENTO_SUL, antesDaOnda, 'direita');
  assert.deepEqual(simultanea.eventos, [{ tipo: 'virada', alta: true },
    { tipo: 'levada', motivos: ['mare', 'ressaca'] }]);
  assert.deepEqual(simultanea.estado.ancoradouros, [p(0, 2)]);
  assert.equal(simultanea.estado.levadas, 1);

  estado = { ...estado, posicao: p(7, 0), ultimoFirme: p(7, 0), passos: 14,
    ancoradouros: [p(0, 2), p(3, 0), p(7, 2)] };
  assert.equal(executarPasso(VENTO_SUL, estado, 'direita').estado.situacao, 'jogando');
  assert.ok(executarPasso(VENTO_SUL, estado, 'direita').eventos.some(evento => evento.tipo === 'levada'));
});

test('só chegada segura na baixa firma; não pode duplicar nem sair faltando âncora', () => {
  assert.ok(validarSolucao(VENTO_SUL));
  let estado = reproduzir(VENTO_SUL, VENTO_SUL.solucao.slice(0, 16));
  const alta = executarPasso(VENTO_SUL, estado, 'direita');
  assert.deepEqual(alta.eventos, [{ tipo: 'ancora-na-alta' }]);
  assert.equal(alta.estado.ancoradouros?.length, 2);
  estado = reproduzir(VENTO_SUL, VENTO_SUL.solucao.slice(0, 19));
  assert.equal(estado.ancoradouros?.length, 3);
  estado = executarPasso(VENTO_SUL, estado, 'esquerda').estado;
  assert.equal(executarPasso(VENTO_SUL, estado, 'direita').estado.ancoradouros?.length, 3);
  const incompleta = { ...estado, posicao: p(7, 0), passos: 23, ancoradouros: [p(0, 2), p(3, 0)] };
  assert.ok(executarPasso(VENTO_SUL, incompleta, 'direita').eventos.some(evento => evento.tipo === 'faltam-ancoradouros'));
  assert.equal(reproduzir(VENTO_SUL, VENTO_SUL.solucao).passos, 24);
  assert.deepEqual(iniciar(VENTO_SUL).ancoradouros, []);
  assert.throws(() => validarMapa({ ...VENTO_SUL, ressaca: { faixas: [] } }), /ressaca/);
});

test('arena separada é liberada pelo Cofre; salva conclusão sem bloquear ida ao Farol', () => {
  const concluidas = ['ressaca-dupla-abrigo', 'ressaca-dupla-ancoradouros', 'ressaca-refugio-de-pedra',
    'ressaca-bolsos-opostos', 'ressaca-vigia-da-placa', 'ressaca-balsas-da-ponta', 'ressaca-cais-em-paralelo',
    'ressaca-tres-moedas-do-cais', 'ressaca-atracadouro-torto'] as const;
  const noCofre: Progresso = { mundo: 'ressaca', posicao: p(8, 3), concluidas, viuTutorial: true };
  assert.equal(moverNoMapa(noCofre, 'esquerda').progresso, noCofre);
  const entrada = moverNoMapa(concluirFase(noCofre, 'ressaca-cofre-da-vazante'), 'esquerda');
  assert.match(entrada.mensagem, /Chefe opcional: Vento Sul/);
  assert.equal(entradaEm(entrada.progresso.posicao, 'ressaca')?.chefe, true);
  const completo = concluirFase(entrada.progresso, VENTO_SUL.id);
  assert.deepEqual(moverNoMapa(completo, 'direita').progresso.posicao, noCofre.posicao);
  assert.equal(totalDeFasesRegulares('ressaca'), 10);
  let bruto = '';
  const storage = { setItem: (_: string, valor: string) => { bruto = valor; }, getItem: () => bruto };
  const save = { progresso: completo, audio: { musica: 0, efeitos: 0 } };
  assert.ok(salvar(storage, save));
  assert.deepEqual(carregar(storage), save);

  const antiga: Progresso = { ...noCofre, posicao: p(4, 1), concluidas: concluidas.slice(0, 2) };
  const arquipelago = viajar(moverNoMapa(antiga, 'baixo').progresso, 'arquipelago');
  assert.equal(viajar(moverNoMapa(arquipelago, 'cima').progresso, 'farol').mundo, 'farol');
});
