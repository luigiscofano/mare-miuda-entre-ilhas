import assert from 'node:assert/strict';
import { test } from 'node:test';
import { concluirFase, criarProgresso, ehIdFase, entradasDo, faseOpcional, trilhasDo, viajar } from '../src/campanha/index.ts';
import type { IdFase, Mundo, Progresso } from '../src/campanha/index.ts';
import { opcoesDoSeletor, selecionarMarco } from '../src/campanha/seletor.ts';
import { EXPANSAO, travessiasDaExpansao } from '../src/fases/expansao/index.ts';
import { carregar, salvar } from '../src/persistencia/index.ts';
import { validarSolucao } from '../src/validacao/index.ts';

const REGIOES: readonly Mundo[] = ['praia', 'praia-enseadinha', 'recifes', 'mangue', 'enseada', 'deriva', 'grutas', 'ressaca', 'farol'];
const MUNDOS: readonly Mundo[] = REGIOES.filter(mundo => mundo !== 'praia-enseadinha');

test('cada lote conserva 25 regulares no mundo que recebeu expansão e não usa desvios como âncora', () => {
  assert.equal(new Set(EXPANSAO.map(({ fase }) => fase.id)).size, EXPANSAO.length);
  for (const mundo of MUNDOS) {
    const extras = travessiasDaExpansao(mundo);
    const regioes = mundo === 'praia' ? ['praia', 'praia-enseadinha'] as const : [mundo];
    const entradas = regioes.flatMap(regiao => entradasDo(regiao));
    const regulares = entradas.filter(e => !e.destino && !e.opcional);
    assert.equal(extras.length, extras.length === 0 ? 0 : 25 - regulares.length, mundo);
    for (const { depoisDe, fase } of extras) {
      assert.match(fase.id, new RegExp(`^${mundo}-exp-[a-z0-9-]+$`));
      assert.ok(regulares.some(e => e.id === depoisDe), `${fase.id} exige ${depoisDe}`);
      assert.ok(ehIdFase(fase.id));
      assert.ok(validarSolucao(fase), fase.id);
    }
    const opcoes = regioes.flatMap(regiao => opcoesDoSeletor({ ...criarProgresso(), mundo: regiao }));
    assert.equal(opcoes.filter(o => o.categoria === 'regular').length, regulares.length + extras.length);
    assert.equal(opcoes.filter(o => o.depoisDe).length, extras.length);
  }
  assert.equal(ehIdFase('praia-exp-inexistente'), false);
});

test('a sequência avança só na vitória e usa posição/versão antigas do save', () => {
  for (const mundo of REGIOES) {
    const canonicas = entradasDo(mundo).filter(e => !e.destino && ehIdFase(e.id) && !e.opcional).map(e => e.id as IdFase);
    const base: Progresso = { ...criarProgresso(), mundo, concluidas: canonicas };
    const opcoes = opcoesDoSeletor(base);
    for (const id of canonicas) {
      let p = base;
      let anterior = id;
      const ancora = opcoes.find(o => o.id === id)!;
      const sequencia = opcoes.filter(o => o.depoisDe === id);
      assert.deepEqual(opcoes.slice(opcoes.indexOf(ancora) + 1, opcoes.indexOf(ancora) + 1 + sequencia.length), sequencia);
      assert.ok(!faseOpcional(mundo, id));
      for (const { fase } of sequencia) {
        assert.ok(fase);
        assert.equal(selecionarMarco({ ...p, concluidas: p.concluidas.filter(v => v !== anterior) }, fase), undefined);
        const selecao = selecionarMarco(p, fase);
        assert.equal(selecao?.opcao.estado, 'disponivel', fase);
        assert.deepEqual(selecao?.progresso.posicao, ancora.posicao);
        assert.deepEqual(selecao?.progresso.concluidas, p.concluidas);
        p = concluirFase(selecao!.progresso, fase);
        let sendoSalvo = '';
        const audio = { musica: 0, efeitos: 0 };
        assert.ok(salvar({ setItem: (_, dados) => { sendoSalvo = dados; } }, { progresso: p, audio }));
        assert.equal(JSON.parse(sendoSalvo).versao, 1);
        assert.deepEqual(carregar({ getItem: () => sendoSalvo }), { progresso: p, audio });
        assert.equal(selecionarMarco(p, fase)?.opcao.estado, 'concluida', fase);
        anterior = fase;
      }
    }
    for (const trilha of trilhasDo(mundo)) {
      assert.ok(trilha.precisa.every(id => !id.includes('-exp-')), mundo);
    }
  }
  const p: Progresso = { ...criarProgresso(), mundo: 'praia', concluidas: ['primeira-onda', 'sombra-da-garca', 'busca-e-volta', 'ponta-da-garca'] };
  const cabo = selecionarMarco(p, 'embarque-cabo')!;
  assert.equal(viajar(cabo.progresso, 'arquipelago').mundo, 'arquipelago');
});
