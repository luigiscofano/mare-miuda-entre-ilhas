import assert from 'node:assert/strict';
import { test } from 'node:test';
import { concluirFase, criarProgresso, entradaEm, moverNoMapa, mundoAtual, trilhasDo, viajar } from '../src/campanha/index.ts';
import type { IdFasePraia, Progresso } from '../src/campanha/index.ts';
import { FASES_PRAIA } from '../src/fases/index.ts';
import { FASES_ENSEADINHA } from '../src/fases/praia-enseadinha.ts';
import { caminhoDoCabo, marcadorCabo } from '../src/campanha/cabo-baixo.ts';
import { carregar, salvar } from '../src/persistencia/index.ts';
import { validarSolucao } from '../src/validacao/index.ts';

const direita = (p: Progresso) => moverNoMapa(p, 'direita').progresso;
function fimDaPrimeiraTela() {
  return ['primeira-onda', 'sombra-da-garca', 'busca-e-volta'].reduce(
    (p, fase) => direita(concluirFase(p, fase as IdFasePraia)), direita(criarProgresso()));
}

test('Praia reúne dez fases regulares, sem contar o encontro, e todas têm solução', () => {
  assert.equal(FASES_PRAIA.length + FASES_ENSEADINHA.length - 1, 10);
  assert.ok([...FASES_PRAIA, ...FASES_ENSEADINHA].every(validarSolucao));
});

test('O caminho antigo, a ida, a volta e o embarque adiante coexistem sem opcionais', () => {
  const antes = fimDaPrimeiraTela();
  assert.equal(direita(antes), antes);
  assert.equal(viajar(antes, 'praia-enseadinha'), antes);
  const venceu = concluirFase(antes, 'ponta-da-garca');
  assert.equal(mundoAtual(viajar(venceu, 'arquipelago')), 'arquipelago');
  const portal = direita(venceu);
  const entrada = viajar(portal, 'praia-enseadinha');
  assert.equal(mundoAtual(entrada), 'praia-enseadinha');
  assert.deepEqual(viajar(entrada, 'praia'), { ...portal, mundo: 'praia' });
  let p = direita(entrada);
  assert.equal(direita(p), p);
  assert.equal(moverNoMapa(p, 'baixo').progresso, p);
  for (const id of ['praia-fio-de-areia', 'praia-pocas-espelho', 'praia-mirante'] as const) {
    assert.equal(entradaEm(p.posicao, mundoAtual(p))?.id, id);
    p = direita(concluirFase(p, id));
  }
  const arquipelago = viajar(p, 'arquipelago');
  assert.equal(mundoAtual(arquipelago), 'arquipelago');
  assert.ok(!arquipelago.concluidas.includes('ilhota-perolada'));
  assert.equal(mundoAtual(viajar(arquipelago, 'praia')), 'praia');
});

test('A nova tela e os IDs de fase sobrevivem ao reload do mesmo save', () => {
  let bruto = '';
  const armazenamento = { getItem: () => bruto, setItem: (_: string, valor: string) => { bruto = valor; } };
  const fim = concluirFase(fimDaPrimeiraTela(), 'ponta-da-garca');
  const p = concluirFase(direita(viajar(direita(fim), 'praia-enseadinha')), 'praia-fio-de-areia');
  const save = { progresso: p, audio: { musica: 0, efeitos: 0.5 } };
  assert.ok(salvar(armazenamento, save));
  assert.deepEqual(carregar(armazenamento), save);
});


test('Cada trilha do Cabo tem projeção completa e reversível sobre o fundo aprovado', () => {
  for (const aresta of trilhasDo('praia')) {
    const caminho = caminhoDoCabo(aresta.de, aresta.para);
    assert.ok(caminho);
    for (const [extremo, posicao] of [[caminho[0], aresta.de], [caminho.at(-1)!, aresta.para]] as const) {
      assert.deepEqual([extremo.coluna, extremo.linha], marcadorCabo(posicao)?.ponto);
    }
    assert.deepEqual(caminhoDoCabo(aresta.para, aresta.de), [...caminho].reverse());
  }
});
