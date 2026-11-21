import assert from 'node:assert/strict';
import test from 'node:test';
import { concluirFase, entradaEm, moverNoMapa, totalDeFasesRegulares } from '../src/campanha/index.ts';
import type { Progresso } from '../src/campanha/index.ts';
import { GUARDIAO_DAS_POCAS, VIGIA_DO_RECIFE } from '../src/fases/chefes-recifes.ts';
import { DIRECOES, executarPasso, iniciar, mareAlta, passagemDoRecifeFechada } from '../src/motor/index.ts';
import type { Estado, Fase } from '../src/motor/index.ts';
import { validarSolucao } from '../src/validacao/index.ts';

function chave(estado: Estado): string {
  const casa = ({ coluna, linha }: Estado['posicao']) => linha * 16 + coluna;
  return [casa(estado.posicao), casa(estado.ultimoFirme), estado.passos % 6,
    estado.levadas, Number(estado.temFragmento),
    estado.abrigosVisitados?.map(casa).sort((a, b) => a - b).join('.') ?? ''].join(':');
}

// A ida fixa a posição de retorno; as duas voltas da maré repetem os mesmos
// efeitos. Assim, a busca finita pode conferir até tentativas com duas levadas.
function auditarArena(fase: Fase) {
  const inicial = iniciar(fase);
  const estados = new Map([[chave(inicial), inicial]]);
  const fila = [chave(inicial)];
  const vencedores: string[] = [];
  const origens = new Map<string, Set<string>>();
  for (const origem of fila) {
    const atual = estados.get(origem)!;
    if (atual.situacao === 'vitoria') {
      vencedores.push(origem);
      continue;
    }
    for (const direcao of DIRECOES) {
      const { estado } = executarPasso(fase, atual, direcao);
      if (estado === atual || estado.situacao === 'derrota') continue;
      const destino = chave(estado);
      if (!origens.has(destino)) origens.set(destino, new Set());
      origens.get(destino)!.add(origem);
      if (!estados.has(destino)) {
        estados.set(destino, estado);
        fila.push(destino);
      }
    }
  }
  const recuperaveis = new Set(vencedores);
  for (const destino of recuperaveis) {
    for (const origem of origens.get(destino) ?? []) recuperaveis.add(origem);
  }
  const semLevadas = vencedores.map(id => estados.get(id)!).filter(estado => estado.levadas === 0);
  const menor = Math.min(...semLevadas.map(estado => estado.passos));
  return { menor, total: estados.size, semSaida: estados.size - recuperaveis.size };
}

test('Guardião das Poças exige os dois refúgios visitados na alta', () => {
  const fase = GUARDIAO_DAS_POCAS;
  assert.ok(validarSolucao(fase));
  const marcacoes = [];
  let estado = iniciar(fase);
  for (const direcao of fase.solucao) {
    const r = executarPasso(fase, estado, direcao);
    estado = r.estado;
    if (r.eventos.some(evento => evento.tipo === 'abrigo-visitado')) {
      assert.ok(mareAlta(estado.passos));
      marcacoes.push(estado.passos);
    }
  }
  assert.deepEqual(marcacoes, [4, 16]);
  assert.equal(estado.abrigosVisitados?.length, 2);
  const naConcha = { ...iniciar(fase), posicao: { coluna: 10, linha: 0 } };
  assert.deepEqual(executarPasso(fase, naConcha, 'direita').eventos, [{ tipo: 'faltam-abrigos' }]);
  assert.equal(auditarArena({ ...fase, recife: undefined }).menor, 17);
  assert.deepEqual(auditarArena(fase), { menor: 19, total: 710, semSaida: 0 });
});

test('Vigia do Recife inverte as comportas sem mudar a cadência da maré', () => {
  const fase = VIGIA_DO_RECIFE;
  const { ida, volta } = fase.recife;
  assert.ok(validarSolucao(fase));
  assert.equal(passagemDoRecifeFechada(fase, ida, false), false);
  assert.equal(passagemDoRecifeFechada(fase, volta, false), true);
  let estado = iniciar(fase);
  const rastro = [];
  for (const direcao of fase.solucao) {
    const r = executarPasso(fase, estado, direcao);
    estado = r.estado;
    if (r.eventos.some(evento => evento.tipo === 'recife-mudou-rota')) rastro.push(estado.passos);
  }
  assert.deepEqual(rastro, [15]);
  assert.equal(passagemDoRecifeFechada(fase, ida, true), true);
  assert.equal(passagemDoRecifeFechada(fase, volta, true), false);
  // Mesmo na maré baixa, tentar a volta enquanto a comporta está fechada não gasta passo.
  const barrado = { ...iniciar(fase), posicao: { coluna: 3, linha: 3 } };
  assert.equal(executarPasso(fase, barrado, 'direita').estado, barrado);
  assert.equal(auditarArena({ ...fase, recife: undefined }).menor, 23);
  assert.deepEqual(auditarArena(fase), { menor: 31, total: 162, semSaida: 0 });
});

test('os dois chefes são opcionais e não entram no contador dos Recifes', () => {
  const moverMapa = (p: Progresso, direcao: (typeof DIRECOES)[number]) => moverNoMapa(p, direcao).progresso;
  let p: Progresso = { mundo: 'recifes', posicao: { coluna: 6, linha: 1 },
    concluidas: ['recife-pedra-firme', 'recife-duas-pocas'], viuTutorial: true };
  assert.deepEqual(moverMapa(p, 'direita').posicao, p.posicao);
  p = concluirFase(p, 'recife-retorno');
  p = moverMapa(p, 'direita');
  assert.equal(entradaEm(p.posicao, 'recifes')?.id, GUARDIAO_DAS_POCAS.id);
  assert.deepEqual(moverMapa(p, 'baixo').posicao, p.posicao);
  p = moverMapa(concluirFase(p, GUARDIAO_DAS_POCAS.id), 'baixo');
  assert.equal(entradaEm(p.posicao, 'recifes')?.id, VIGIA_DO_RECIFE.id);
  assert.equal(entradaEm(p.posicao, 'recifes')?.chefe, true);
  assert.deepEqual(moverMapa(moverMapa(p, 'cima'), 'esquerda').posicao, { coluna: 6, linha: 1 });
  assert.equal(totalDeFasesRegulares('recifes'), 10);
});
