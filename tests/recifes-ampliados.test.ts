import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  abriuEnseada, concluirFase, entradaEm, faseOpcional, moverNoMapa, nosDo, rotaLivre,
  saidaEm, totalDeFasesRegulares, trilhasDo, viajar,
} from '../src/campanha/index.ts';
import type { IdFase, Progresso } from '../src/campanha/index.ts';
import { FASES_RECIFES, TODAS_AS_FASES } from '../src/fases/index.ts';
import { FASES_RECIFES_AMPLIADOS } from '../src/fases/recifes-ampliados.ts';
import { DIRECOES, mesmaCasa } from '../src/motor/index.ts';
import { carregar, salvar } from '../src/persistencia/index.ts';
import { validarSolucao } from '../src/validacao/index.ts';

const no = (coluna: number, linha: number) => ({ coluna, linha });
const noCais = (concluidas: readonly IdFase[] = []): Progresso =>
  ({ mundo: 'recifes', posicao: no(1, 1), concluidas, viuTutorial: true });

test('as doze travessias são distintas e todas têm solução sem levadas no motor', () => {
  assert.equal(TODAS_AS_FASES.length, 45);
  assert.equal(new Set(FASES_RECIFES.map(fase => fase.mapa.join('\n'))).size, 12);
  assert.equal(totalDeFasesRegulares('recifes'), 10);
  for (const fase of TODAS_AS_FASES) assert.ok(validarSolucao(fase), fase.id);
});

test('o porto, a rota histórica e a abertura da Enseada não exigem o ramo novo', () => {
  let progresso = noCais(['mangue-reuniao']);
  assert.ok(!abriuEnseada(progresso));
  for (const id of ['recife-pedra-firme', 'recife-duas-pocas', 'recife-retorno'] as const) {
    progresso = moverNoMapa(progresso, 'direita').progresso;
    assert.equal(entradaEm(progresso.posicao, 'recifes')?.id, id);
    progresso = concluirFase(progresso, id);
  }
  assert.ok(abriuEnseada(progresso));
  progresso = moverNoMapa(progresso, 'baixo').progresso;
  assert.deepEqual(progresso.posicao, no(1, 1));
  const arquipelago = viajar(progresso, 'arquipelago');
  assert.deepEqual(arquipelago.posicao, no(2, 1));
  assert.deepEqual(moverNoMapa(arquipelago, 'direita').progresso.posicao, no(6, 1));
});

test('todos os marcos têm direção única e ida e volta válidas', () => {
  const provas = FASES_RECIFES.map(fase => fase.id as IdFase);
  const trilhas = trilhasDo('recifes');
  assert.equal(nosDo('recifes').length, 13);
  for (const t of trilhas) {
    const progresso = noCais(provas);
    assert.ok(rotaLivre(progresso, t));
    assert.deepEqual(moverNoMapa({ ...progresso, posicao: t.de }, t.ida).progresso.posicao, t.para);
    assert.deepEqual(moverNoMapa({ ...progresso, posicao: t.para }, t.volta).progresso.posicao, t.de);
  }
  for (const posicao of nosDo('recifes')) {
    const progresso = { ...noCais(provas), posicao };
    for (const direcao of DIRECOES) {
      const opcoes = trilhas.filter(t => mesmaCasa(t.de, posicao) && t.ida === direcao
        || mesmaCasa(t.para, posicao) && t.volta === direcao);
      assert.equal(opcoes.length, Number(saidaEm(progresso, direcao) !== undefined));
    }
  }
});

test('o ramo norte pode ser concluído sem desvios; saves novos e antigos voltam ao mesmo marco', () => {
  let progresso = noCais(['recife-pedra-firme', 'recife-duas-pocas', 'recife-retorno']);
  progresso = moverNoMapa(progresso, 'direita').progresso;
  const comandos = ['cima', 'direita', 'direita', 'direita', 'baixo', 'direita', 'baixo'] as const;
  for (const [i, direcao] of comandos.entries()) {
    progresso = moverNoMapa(progresso, direcao).progresso;
    const id = FASES_RECIFES_AMPLIADOS[i].id;
    assert.equal(entradaEm(progresso.posicao, 'recifes')?.id, id);
    assert.ok(!faseOpcional('recifes', id));
    progresso = concluirFase(progresso, id);
  }
  const desvio = moverNoMapa(progresso, 'esquerda').progresso;
  assert.ok(faseOpcional('recifes', 'recife-mosaico'));
  assert.ok(faseOpcional('recifes', 'recife-fio-coral'));
  assert.deepEqual(desvio.posicao, no(8, 3));

  let registro = '';
  const storage = { setItem: (_: string, bruto: string) => { registro = bruto; }, getItem: () => registro };
  for (const p of [desvio, { ...noCais(['recife-pedra-firme']), posicao: no(4, 1) }]) {
    const save = { progresso: p, audio: { musica: 0, efeitos: 0 } };
    assert.ok(salvar(storage, save));
    assert.deepEqual(carregar(storage), save);
  }
});
