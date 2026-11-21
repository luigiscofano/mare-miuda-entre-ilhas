import assert from 'node:assert/strict';
import { test } from 'node:test';
import { concluirFase, entradaEm, moverNoMapa, totalDeFasesRegulares } from '../src/campanha/index.ts';
import type { Progresso } from '../src/campanha/index.ts';
import { GUARDIAO_FAROL } from '../src/fases/guardiao-farol.ts';
import { DIRECOES, destinoPermitido, executarPasso, feixeNoTurno, iniciar, mesmaCasa, passosAteTrocaFeixe } from '../src/motor/index.ts';
import type { Estado, Fase } from '../src/motor/index.ts';
import { carregar, salvar } from '../src/persistencia/index.ts';
import { reproduzir, validarMapa, validarSolucao } from '../src/validacao/index.ts';

const p = (coluna: number, linha: number) => ({ coluna, linha });

function menorSolucao(fase: Fase): number | undefined {
  const fila: Estado[] = [iniciar(fase)];
  const vistos = new Set<string>();
  const periodo = 6 * (fase.farol?.passosPorOrientacao ?? 1) * (fase.farol?.orientacoes.length ?? 1);
  for (const estado of fila) {
    if (estado.situacao === 'vitoria') return estado.passos;
    const lentes = estado.lentesAcesas?.map(p => p.linha * fase.mapa[0].length + p.coluna).sort();
    // Sem levadas, o futuro depende do relógio compartilhado, da casa e das lentes.
    const chave = JSON.stringify([estado.passos % periodo, estado.posicao, lentes]);
    if (vistos.has(chave)) continue;
    vistos.add(chave);
    for (const d of DIRECOES) {
      const novo = executarPasso(fase, estado, d).estado;
      if (novo !== estado && !novo.levadas) fila.push(novo);
    }
  }
}

test('o feixe muda a cada três passos, sem depender da virada de maré', () => {
  const fase = GUARDIAO_FAROL;
  assert.deepEqual([0, 1, 2, 3, 4, 5, 6, 8, 9].map(t => feixeNoTurno(fase, t)?.nome),
    ['oeste', 'oeste', 'oeste', 'leste', 'leste', 'leste', 'sul', 'sul', 'oeste']);
  const antes = reproduzir(fase, ['baixo', 'cima', 'direita', 'direita', 'direita']);
  assert.equal(passosAteTrocaFeixe(fase, antes.passos), 1);
  assert.deepEqual(destinoPermitido(fase, antes, 'direita'), p(4, 0));
  const queda = executarPasso(fase, { ...antes, lentesAcesas: [p(6, 0)] }, 'direita');
  assert.deepEqual(queda.eventos, [{ tipo: 'virada', alta: false }, { tipo: 'levada', motivos: ['farol'] }]);
  assert.equal(queda.estado.passos, 6);
  assert.equal(queda.estado.levadas, 1);
  assert.deepEqual(queda.estado.posicao, p(3, 0));
  assert.deepEqual(queda.estado.lentesAcesas, [p(6, 0)]);
  const bloqueio = executarPasso(fase, queda.estado, 'direita');
  assert.equal(bloqueio.estado, queda.estado);
  assert.deepEqual(bloqueio.eventos, [{ tipo: 'bloqueado' }]);
});

test('lente só acende na chegada segura com feixe certo e a concha exige as três', () => {
  const fase = GUARDIAO_FAROL;
  const antes = { ...iniciar(fase), posicao: p(5, 0), ultimoFirme: p(5, 0) };
  const errado = executarPasso(fase, { ...antes, passos: 3 }, 'direita');
  assert.deepEqual(errado.eventos, [{ tipo: 'lente-fora-do-feixe' }]);
  assert.deepEqual(errado.estado.lentesAcesas, []);
  const certo = executarPasso(fase, { ...antes, passos: 8 }, 'direita');
  assert.deepEqual(certo.eventos, [{ tipo: 'virada', alta: true }, { tipo: 'lente-acesa' }]);
  assert.deepEqual(certo.estado.lentesAcesas, [p(6, 0)]);
  const repetido = executarPasso(fase, { ...certo.estado, posicao: p(5, 0) }, 'direita');
  assert.deepEqual(repetido.eventos, []);
  assert.deepEqual(repetido.estado.lentesAcesas, [p(6, 0)]);
  const incompleto = executarPasso(fase, { ...certo.estado, posicao: p(10, 2) }, 'direita');
  assert.deepEqual(incompleto.eventos, [{ tipo: 'faltam-lentes' }]);
  assert.deepEqual(iniciar(fase).lentesAcesas, []);
});

test('a travessia tem solução de 41 passos e cada ponte é indispensável', () => {
  const fase = GUARDIAO_FAROL;
  assert.ok(validarSolucao(fase));
  const fim = reproduzir(fase, fase.solucao);
  assert.equal(fim.passos, 41);
  assert.equal(fim.lentesAcesas?.length, 3);
  assert.equal(menorSolucao(fase), 41);
  const pontes = [p(4, 0), p(7, 4), p(7, 2)];
  const unificado = { ...fase, farol: { ...fase.farol,
    orientacoes: fase.farol.orientacoes.map(o => ({ ...o, plataformas: pontes })) } };
  assert.equal(menorSolucao(unificado), 33);
  for (const ponte of pontes) {
    const sem = { ...fase, farol: { ...fase.farol,
      orientacoes: fase.farol.orientacoes.map(o => ({ ...o, plataformas: o.plataformas.filter(q => !mesmaCasa(q, ponte)) })) } };
    assert.equal(menorSolucao(sem), undefined);
    assert.throws(() => validarMapa(sem), /feixe/);
  }
});

test('nenhum estado alcançável sem derrota exige reiniciar a arena', () => {
  const fase = GUARDIAO_FAROL;
  const inicio = iniciar(fase);
  const fila = [inicio];
  const anteriores: number[][] = [[]];
  const saidas: number[] = [];
  const chave = (estado: Estado) => JSON.stringify([estado.passos % 18, estado.posicao,
    estado.ultimoFirme, estado.levadas, estado.situacao,
    estado.lentesAcesas?.map(p => p.coluna + p.linha * fase.mapa[0].length).sort()]);
  const indices = new Map([[chave(inicio), 0]]);
  // O relógio conjunto se repete a cada 18 passos. A ordem das lentes não
  // importa; a última casa firme importa quando uma queda troca a paridade.
  for (const [origem, estado] of fila.entries()) {
    if (estado.situacao === 'vitoria') { saidas.push(origem); continue; }
    for (const d of DIRECOES) {
      const novo = executarPasso(fase, estado, d).estado;
      if (novo === estado || novo.situacao === 'derrota') continue;
      const assinatura = chave(novo);
      const destino = indices.get(assinatura) ?? fila.length;
      if (destino === fila.length) {
        fila.push(novo);
        anteriores.push([]);
        indices.set(assinatura, destino);
      }
      anteriores[destino].push(origem);
    }
  }
  const recuperaveis = new Set(saidas);
  for (const destino of saidas) for (const origem of anteriores[destino]) {
    if (recuperaveis.has(origem)) continue;
    recuperaveis.add(origem);
    saidas.push(origem);
  }
  assert.ok(fila.length > 10000);
  assert.equal(recuperaveis.size, fila.length);
});

test('a arena preserva as dez regulares, o desvio em trio e saves do Farol', () => {
  const antigas = ['farol-fragmento-margens', 'farol-duas-luzes', 'farol-faroleiros-de-vigia',
    'farol-turno-dos-guardioes', 'farol-salao-das-lanternas'] as const;
  const antes: Progresso = { mundo: 'farol', posicao: p(11, 3), concluidas: antigas, viuTutorial: true };
  assert.equal(moverNoMapa(antes, 'baixo').progresso, antes);
  const capstone = concluirFase(antes, 'farol-luz-das-duas-mares');
  const trio = moverNoMapa(capstone, 'esquerda').progresso;
  assert.match(entradaEm(trio.posicao, 'farol')?.nome ?? '', /luzes|marés|siris/i);
  const arena = moverNoMapa(capstone, 'baixo').progresso;
  assert.equal(entradaEm(arena.posicao, 'farol')?.id, GUARDIAO_FAROL.id);
  assert.equal(entradaEm(arena.posicao, 'farol')?.chefe, true);
  assert.equal(totalDeFasesRegulares('farol'), 10);
  assert.deepEqual(moverNoMapa(arena, 'cima').progresso, capstone);
  let registro = '';
  const storage = { setItem: (_: string, valor: string) => { registro = valor; }, getItem: () => registro };
  for (const progresso of [capstone, concluirFase(arena, GUARDIAO_FAROL.id)]) {
    const save = { progresso, audio: { musica: .2, efeitos: .4 } };
    assert.ok(salvar(storage, save));
    assert.deepEqual(carregar(storage), save);
  }
});
