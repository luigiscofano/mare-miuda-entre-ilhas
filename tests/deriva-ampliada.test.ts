import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  concluirFase, entradaEm, faseOpcional, moverNoMapa, nosDo, saidaEm, totalDeFasesRegulares, trilhasDo, viajar,
} from '../src/campanha/index.ts';
import type { Progresso } from '../src/campanha/index.ts';
import { FASES_DERIVA_AMPLIADA } from '../src/fases/deriva-ampliada.ts';
import { TODAS_AS_FASES } from '../src/fases/index.ts';
import { DIRECOES, executarPasso, iniciar, mesmaCasa, balsasNoTurno } from '../src/motor/index.ts';
import type { Acao, Estado, Fase } from '../src/motor/index.ts';
import { carregar, salvar } from '../src/persistencia/index.ts';
import { reproduzir, validarSolucao } from '../src/validacao/index.ts';

const ponto = (coluna: number, linha: number) => ({ coluna, linha });

function veioDeCarona(antes: Estado, depois: Estado): boolean {
  if (!antes.dupla || !depois.dupla || antes.passos === depois.passos) return false;
  return antes.dupla.parceiroAtivo ? !mesmaCasa(antes.posicao, depois.posicao)
    : !mesmaCasa(antes.dupla.posicao, depois.dupla.posicao);
}

function existeVitoria(fase: Fase, maxPassos?: number, semCarona = false): boolean {
  const acoes: readonly Acao[] = fase.dupla ? [...DIRECOES, 'trocar'] : DIRECOES;
  const fila = [iniciar(fase)];
  const vistos = new Set<string>();
  for (const estado of fila) {
    if (estado.situacao === 'vitoria') return true;
    for (const acao of acoes) {
      const proximo = executarPasso(fase, estado, acao).estado;
      if (proximo === estado || proximo.levadas || (maxPassos !== undefined && proximo.passos > maxPassos)
        || (semCarona && veioDeCarona(estado, proximo))) continue;
      // Sem patrulha, a maré e as balsas repetem a cada seis passos. A busca não considera levadas.
      const tempo = maxPassos === undefined ? proximo.passos % 6 : proximo.passos;
      const chave = JSON.stringify([tempo, proximo.posicao, proximo.dupla?.posicao, proximo.dupla?.parceiroAtivo,
        proximo.fragmentos.map(p => p.linha * fase.mapa[0].length + p.coluna).sort()]);
      if (vistos.has(chave)) continue;
      vistos.add(chave);
      fila.push(proximo);
    }
  }
  return false;
}

test('as Ilhas à Deriva somam dez regulares, dois desvios e soluções sem levadas', () => {
  assert.equal(totalDeFasesRegulares('deriva'), 10);
  assert.ok(faseOpcional('deriva', 'deriva-dupla-cais'));
  assert.ok(faseOpcional('deriva', 'deriva-dupla-contramao'));
  assert.equal(TODAS_AS_FASES.length, 66);
  for (const fase of TODAS_AS_FASES) assert.ok(validarSolucao(fase), fase.id);
});

test('cada balsa das sete novas travessias é necessária', () => {
  for (const fase of FASES_DERIVA_AMPLIADA) {
    const semUmaBalsa = (remover: number): Fase => ({
      ...fase, balsas: fase.balsas.filter((_, indice) => indice !== remover),
    });
    for (const indice of fase.balsas.keys()) assert.equal(existeVitoria(semUmaBalsa(indice)), false, fase.id);
  }
});

test('Tripulação partilhada leva dois siris na mesma virada, e a carona reduz os passos', () => {
  const fase = FASES_DERIVA_AMPLIADA[6];
  const antes = reproduzir(fase, fase.solucao.slice(0, 3));
  assert.equal(antes.passos, 2);
  assert.deepEqual(antes.posicao, balsasNoTurno(fase, 2)[0]);
  assert.equal(antes.dupla?.parceiroAtivo, true);
  const { estado, eventos } = executarPasso(fase, antes, 'direita');
  assert.equal(estado.passos, 3);
  assert.ok(veioDeCarona(antes, estado));
  assert.deepEqual([estado.posicao, estado.dupla?.posicao], balsasNoTurno(fase, 3));
  assert.ok(eventos.some(e => e.tipo === 'balsa'));
  assert.equal(existeVitoria(fase, 9, true), false);
  assert.equal(existeVitoria(fase, 12, true), false);
  assert.equal(existeVitoria(fase, 13, true), true);
});

test('o ramo novo tem ida, volta e save, e conserva o acesso anterior às Grutas', () => {
  let p: Progresso = { mundo: 'deriva', posicao: ponto(1, 1), viuTutorial: true, concluidas: [] };
  for (const id of ['deriva-primeira-balsa', 'deriva-duas-margens', 'deriva-corrente-cruzada'] as const) {
    p = moverNoMapa(p, 'direita').progresso;
    assert.equal(entradaEm(p.posicao, 'deriva')?.id, id);
    p = concluirFase(p, id);
  }
  const porto = moverNoMapa(p, 'baixo').progresso;
  const arquipelago = viajar(porto, 'arquipelago');
  assert.equal(viajar(moverNoMapa(arquipelago, 'cima').progresso, 'grutas').mundo, 'grutas');
  assert.equal(entradaEm(moverNoMapa(p, 'cima').progresso.posicao, 'deriva')?.id, 'deriva-dupla-cais');

  let ramo: Progresso = { ...p, posicao: ponto(2, 1) };
  const direcoes = ['cima', 'direita', 'direita', 'direita', 'direita', 'direita', 'baixo'] as const;
  for (const [i, direcao] of direcoes.entries()) {
    ramo = moverNoMapa(ramo, direcao).progresso;
    const id = FASES_DERIVA_AMPLIADA[i].id;
    assert.equal(entradaEm(ramo.posicao, 'deriva')?.id, id);
    ramo = concluirFase(ramo, id);
  }
  assert.equal(nosDo('deriva').length, 13);
  const todos = concluirFase(ramo, 'deriva-dupla-cais');
  const trilhas = trilhasDo('deriva');
  for (const t of trilhas) {
    assert.deepEqual(moverNoMapa({ ...todos, posicao: t.de }, t.ida).progresso.posicao, t.para);
    assert.deepEqual(moverNoMapa({ ...todos, posicao: t.para }, t.volta).progresso.posicao, t.de);
  }
  for (const posicao of nosDo('deriva')) {
    for (const direcao of DIRECOES) {
      const opcoes = trilhas.filter(t => mesmaCasa(t.de, posicao) && t.ida === direcao
        || mesmaCasa(t.para, posicao) && t.volta === direcao);
      assert.equal(opcoes.length, Number(saidaEm({ ...todos, posicao }, direcao) !== undefined));
    }
  }
  let bruto = '';
  const storage = { setItem: (_: string, dados: string) => { bruto = dados; }, getItem: () => bruto };
  for (const progresso of [p, { ...ramo, posicao: ponto(6, -1) }, ramo]) {
    const save = { progresso, audio: { musica: 0, efeitos: 0 } };
    assert.ok(salvar(storage, save));
    assert.deepEqual(carregar(storage), save);
  }
});
