import assert from 'node:assert/strict';
import { test } from 'node:test';
import { concluirFase, entradaEm, moverNoMapa, totalDeFasesRegulares, viajar } from '../src/campanha/index.ts';
import type { Progresso } from '../src/campanha/index.ts';
import { VIGIA_DAS_ONDAS } from '../src/fases/vigia-das-ondas.ts';
import { DIRECOES, executarPasso, faixaAfeta, faixaRessacaNoTurno, iniciar } from '../src/motor/index.ts';
import type { Fase, Estado } from '../src/motor/index.ts';
import { carregar, salvar } from '../src/persistencia/index.ts';
import { reproduzir, validarSolucao } from '../src/validacao/index.ts';

const p = (coluna: number, linha: number) => ({ coluna, linha });
const fase = VIGIA_DAS_ONDAS;

function busca(fase: Fase, permiteLevadas = false) {
  const inicio = iniciar(fase);
  const fila = [inicio];
  const anteriores: number[][] = [[]];
  const vitorias: number[] = [];
  const chave = (e: Estado) => JSON.stringify([e.posicao, e.passos % 6, e.situacao,
    ...(permiteLevadas ? [e.ultimoFirme, e.levadas] : [])]);
  const indices = new Map([[chave(inicio), 0]]);
  for (const [i, e] of fila.entries()) {
    if (e.situacao === 'vitoria') { vitorias.push(i); continue; }
    for (const d of DIRECOES) {
      const n = executarPasso(fase, e, d).estado;
      if (n === e || n.situacao === 'derrota' || (!permiteLevadas && n.levadas)) continue;
      const assinatura = chave(n);
      const j = indices.get(assinatura) ?? fila.length;
      if (j === fila.length) {
        fila.push(n);
        indices.set(assinatura, j);
        anteriores.push([]);
      }
      anteriores[j].push(i);
    }
  }
  const minimo = fila[vitorias[0]]?.passos;
  const recuperaveis = new Set(vitorias);
  // Inclui mudanças de paridade após retorno ao último piso firme.
  for (const j of vitorias) {
    for (const i of anteriores[j]) {
      if (recuperaveis.has(i)) continue;
      recuperaveis.add(i);
      vitorias.push(i);
    }
  }
  return { minimo, estados: fila.length, recuperaveis: recuperaveis.size };
}

test('a espuma avisa o ataque a solo firme e a pedra alta protege', () => {
  const faixa = fase.ressaca.faixas[0];
  assert.deepEqual([3, 9, 15].map(t => faixaRessacaNoTurno(fase, t)), [faixa, faixa, faixa]);
  assert.equal(faixaRessacaNoTurno(fase, 6), undefined);
  assert.ok(faixaAfeta(fase, faixa, p(2, 1)));
  assert.ok(!faixaAfeta(fase, faixa, p(4, 1)));
  const antes = reproduzir(fase, ['direita', 'direita']);
  const atingiu = executarPasso(fase, antes, 'baixo');
  assert.deepEqual(atingiu.eventos, [{ tipo: 'virada', alta: true }, { tipo: 'levada', motivos: ['ressaca'] }]);
  assert.equal(atingiu.estado.passos, 3);
  assert.equal(atingiu.estado.levadas, 1);
  assert.deepEqual(atingiu.estado.posicao, p(2, 0));
  const refugio = reproduzir(fase, fase.solucao.slice(0, 9));
  assert.equal(refugio.levadas, 0);
  assert.deepEqual(refugio.posicao, p(4, 1));
  assert.equal(iniciar(fase).ancoradouros, undefined);
  assert.equal(iniciar(fase).ondasSeguras, undefined);
});

test('a rota ensina refúgio e relógio, e todas as posições sem derrota permitem recuperação', () => {
  assert.ok(validarSolucao(fase));
  assert.equal(reproduzir(fase, fase.solucao).passos, 16);
  assert.equal(busca(fase).minimo, 16);
  assert.equal(busca({ ...fase, ressaca: undefined }).minimo, 10);
  const semRefugio = { ...fase, mapa: fase.mapa.map(l => l.replaceAll('H', '.')) };
  assert.equal(busca(semRefugio).minimo, undefined);
  const comErros = busca(fase, true);
  assert.ok(comErros.estados > 200);
  assert.equal(comErros.recuperaveis, comErros.estados);
});

test('o primeiro chefe não altera a Ponta da garça, o embarque nem saves anteriores', () => {
  const a: Progresso = { mundo: 'praia-enseadinha', posicao: p(2, 1), concluidas: ['ponta-da-garca'], viuTutorial: true };
  assert.equal(moverNoMapa(a, 'cima').progresso, a);
  const fio = concluirFase(a, 'praia-fio-de-areia');
  const arena = moverNoMapa(fio, 'cima').progresso;
  const chefe = entradaEm(arena.posicao, 'praia-enseadinha');
  assert.equal(chefe?.id, fase.id);
  assert.equal(chefe?.chefe, true);
  assert.equal(chefe?.opcional, true);
  assert.deepEqual(moverNoMapa(arena, 'baixo').progresso, fio);
  assert.equal(entradaEm(p(7, 1), 'praia')?.id, 'ponta-da-garca');
  assert.equal(totalDeFasesRegulares('praia-enseadinha'), 3);
  let caminho = fio;
  for (const id of ['praia-pocas-espelho', 'praia-mirante'] as const) {
    caminho = concluirFase(moverNoMapa(caminho, 'direita').progresso, id);
  }
  const embarque = moverNoMapa(caminho, 'direita').progresso;
  assert.equal(viajar(embarque, 'arquipelago').mundo, 'arquipelago');

  let bruto = '';
  const storage = { setItem: (_: string, valor: string) => { bruto = valor; }, getItem: () => bruto };
  for (const progresso of [fio, concluirFase(arena, fase.id)]) {
    const save = { progresso, audio: { musica: .2, efeitos: .4 } };
    assert.ok(salvar(storage, save));
    assert.deepEqual(carregar(storage), save);
  }
});
