import assert from 'node:assert/strict';
import { test } from 'node:test';
import { concluirFase, entradaEm, moverNoMapa, totalDeFasesRegulares, viajar } from '../src/campanha/index.ts';
import type { Progresso } from '../src/campanha/index.ts';
import { PONTA_DA_RESSACA } from '../src/fases/ponta-da-ressaca.ts';
import { VIGIA_DAS_ONDAS } from '../src/fases/vigia-das-ondas.ts';
import { DIRECOES, executarPasso, faixaAfeta, faixaRessacaNoTurno, iniciar, mareAlta } from '../src/motor/index.ts';
import type { Estado, Fase } from '../src/motor/index.ts';
import { carregar, salvar } from '../src/persistencia/index.ts';
import { reproduzir, validarSolucao } from '../src/validacao/index.ts';

const p = (coluna: number, linha: number) => ({ coluna, linha });
const fase = PONTA_DA_RESSACA;

function analisarRotas(fase: Fase, incluiLevadas = false) {
  const inicio = iniciar(fase);
  const fila = [inicio];
  const inversas: number[][] = [[]];
  const vitorias: number[] = [];
  const periodo = 6 * (fase.ressaca?.faixas.length ?? 1);
  // Depois de uma levada a paridade entre passos e tabuleiro pode mudar.
  const chave = (e: Estado) => JSON.stringify([e.posicao, e.passos % periodo, e.situacao,
    ...(incluiLevadas ? [e.ultimoFirme, e.levadas] : [])]);
  const indices = new Map([[chave(inicio), 0]]);
  for (const [i, estado] of fila.entries()) {
    if (estado.situacao === 'vitoria') { vitorias.push(i); continue; }
    for (const direcao of DIRECOES) {
      const novo = executarPasso(fase, estado, direcao).estado;
      if (novo === estado || novo.situacao === 'derrota' || (!incluiLevadas && novo.levadas)) continue;
      const id = chave(novo);
      const j = indices.get(id) ?? fila.length;
      if (j === fila.length) {
        fila.push(novo);
        indices.set(id, j);
        inversas.push([]);
      }
      inversas[j].push(i);
    }
  }
  const minimo = fila[vitorias[0]]?.passos;
  const recuperaveis = new Set(vitorias);
  for (const j of vitorias) {
    for (const i of inversas[j]) {
      if (recuperaveis.has(i)) continue;
      recuperaveis.add(i);
      vitorias.push(i);
    }
  }
  return { minimo, total: fila.length, recuperaveis: recuperaveis.size };
}

test('as duas faixas alternam por subida; a saída da última faixa exige a pedra no turno da onda', () => {
  const [norte, sul] = fase.ressaca.faixas;
  assert.deepEqual([3, 9, 15, 21].map(t => faixaRessacaNoTurno(fase, t)), [norte, sul, norte, sul]);
  assert.equal(faixaRessacaNoTurno(fase, 18), undefined);
  assert.ok(faixaAfeta(fase, sul, p(11, 3)));
  assert.ok(!faixaAfeta(fase, sul, p(12, 3)));
  const antesDaPedra = reproduzir(fase, fase.solucao.slice(0, 20));
  assert.deepEqual(antesDaPedra.posicao, p(11, 3));
  const noRefugio = executarPasso(fase, antesDaPedra, 'direita');
  assert.deepEqual(noRefugio.estado.posicao, p(12, 3));
  assert.equal(noRefugio.estado.levadas, 0);
  const pedraTrocaPorAreia = { ...fase, mapa: fase.mapa.map((l, i) =>
    i === 3 ? l.slice(0, 12) + '.' + l.slice(13) : l) };
  assert.deepEqual(executarPasso(pedraTrocaPorAreia, antesDaPedra, 'direita').eventos,
    [{ tipo: 'virada', alta: true }, { tipo: 'levada', motivos: ['ressaca'] }]);

  const antesDoNorte = reproduzir(fase, fase.solucao.slice(0, 12).concat(['esquerda', 'direita']));
  const noAlvoNorte = executarPasso(fase, antesDoNorte, 'direita');
  assert.deepEqual(noAlvoNorte.eventos, [{ tipo: 'virada', alta: true }, { tipo: 'levada', motivos: ['ressaca'] }]);
});

test('a rota cruza dois baixios distintos em janelas diferentes e não deixa estados sem recuperação', () => {
  assert.ok(validarSolucao(fase));
  let estado = iniciar(fase);
  const baixios = [];
  for (const acao of fase.solucao) {
    estado = executarPasso(fase, estado, acao).estado;
    const { coluna, linha } = estado.posicao;
    if (fase.mapa[linha][coluna] === '=') baixios.push([linha, estado.passos, mareAlta(estado.passos)]);
  }
  assert.deepEqual(baixios, [[1, 7, false], [3, 19, false]]);
  assert.equal(estado.passos, 22);
  assert.equal(analisarRotas(fase).minimo, 22);
  for (const linha of [1, 3]) {
    const bloqueado = { ...fase, mapa: fase.mapa.map((l, i) => i === linha ? l.replaceAll('=', '#') : l) };
    assert.equal(analisarRotas(bloqueado).minimo, undefined);
  }
  const semPedras = { ...fase, mapa: fase.mapa.map(l => l.replaceAll('H', '.')) };
  assert.equal(analisarRotas(semPedras).minimo, 28);

  const recuperacao = analisarRotas(fase, true);
  assert.ok(recuperacao.total >= 400);
  assert.equal(recuperacao.recuperaveis, recuperacao.total);
});

test('o segundo chefe fica no desvio, preserva retorno, embarque, contadores e saves', () => {
  const vigia: Progresso = { mundo: 'praia-enseadinha', posicao: p(2, 0), concluidas: ['ponta-da-garca',
    'praia-fio-de-areia'], viuTutorial: true };
  assert.strictEqual(moverNoMapa(vigia, 'cima').progresso, vigia);
  const aprovado = concluirFase(vigia, VIGIA_DAS_ONDAS.id);
  const ponta = moverNoMapa(aprovado, 'cima').progresso;
  assert.deepEqual(ponta.posicao, p(2, -1));
  const entrada = entradaEm(ponta.posicao, 'praia-enseadinha');
  assert.equal(entrada?.id, fase.id);
  assert.equal(entrada?.chefe, true);
  assert.equal(entrada?.opcional, true);
  const concluido = concluirFase(ponta, fase.id);
  const trouxe = moverNoMapa(concluido, 'baixo').progresso;
  assert.deepEqual(trouxe.posicao, p(2, 0));
  assert.deepEqual(moverNoMapa(trouxe, 'baixo').progresso.posicao, p(2, 1));
  assert.equal(entradaEm(p(7, 1), 'praia')?.id, 'ponta-da-garca');
  assert.equal(totalDeFasesRegulares('praia-enseadinha'), 3);
  const original = ['praia-pocas-espelho', 'praia-mirante'] as const;
  let rota = moverNoMapa(vigia, 'baixo').progresso;
  for (const id of original) rota = concluirFase(moverNoMapa(rota, 'direita').progresso, id);
  assert.equal(viajar(moverNoMapa(rota, 'direita').progresso, 'arquipelago').mundo, 'arquipelago');
  let bruto = '';
  const storage = { setItem: (_: string, valor: string) => { bruto = valor; }, getItem: () => bruto };
  for (const progresso of [vigia, concluido]) {
    const save = { progresso, audio: { musica: .2, efeitos: .4 } };
    assert.ok(salvar(storage, save));
    assert.deepEqual(carregar(storage), save);
  }
});
