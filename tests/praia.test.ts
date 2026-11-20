import assert from 'node:assert/strict';
import { test } from 'node:test';
import { concluirFase, criarProgresso, entradaEm, moverNoMapa } from '../src/campanha/index.ts';
import type { IdFasePraia, Progresso } from '../src/campanha/index.ts';
import { FASES_PRAIA } from '../src/fases/index.ts';
import { carregar, CHAVE_SAVE, salvar } from '../src/persistencia/index.ts';
import type { Direcao } from '../src/motor/index.ts';
import { reproduzir, validarSolucao } from '../src/validacao/index.ts';

const direcoes: Readonly<Record<string, Direcao>> = { U: 'cima', D: 'baixo', L: 'esquerda', R: 'direita' };
function rota(texto: string) { return [...texto].map(letra => direcoes[letra]); }
function caminhar(p: Progresso, texto: string) {
  return rota(texto).reduce((anterior, direcao) => {
    const novo = moverNoMapa(anterior, direcao);
    assert.notStrictEqual(novo.progresso, anterior, novo.mensagem);
    return novo.progresso;
  }, p);
}
const fim = FASES_PRAIA.find(fase => fase.id === 'ponta-da-garca')!;

test('As cinco fases têm solução integral sem erro no motor', () => {
  assert.equal(FASES_PRAIA.length, 5);
  assert.ok(FASES_PRAIA.every(validarSolucao));
});
test('Encontro final permite duas abordagens e não coleta na marca da garça', () => {
  const alternativa = reproduzir(fim, rota('RRRRRDDLRU'));
  assert.equal(alternativa.situacao, 'vitoria');
  assert.equal(alternativa.levadas, 0);
  const atingido = reproduzir(fim, rota('RRRDDR'));
  assert.equal(atingido.levadas, 1);
  assert.equal(atingido.temFragmento, false);
  assert.equal(atingido.passos, 6);
});
test('Rota principal completa sem precisar da ilhota', () => {
  let p = caminhar(criarProgresso(), 'R');
  assert.equal(entradaEm(p.posicao)?.id, 'primeira-onda');
  const beira = p;
  assert.strictEqual(moverNoMapa(beira, 'direita').progresso, beira);
  assert.strictEqual(moverNoMapa(beira, 'baixo').progresso, beira);
  for (const id of ['primeira-onda', 'sombra-da-garca', 'busca-e-volta'] as const) {
    p = concluirFase(p, id);
    p = caminhar(p, 'R');
  }
  assert.equal(entradaEm(p.posicao)?.id, 'ponta-da-garca');
  p = concluirFase(p, 'ponta-da-garca');
  assert.equal(p.concluidas.length, 4);
  assert.strictEqual(concluirFase(p, 'ponta-da-garca'), p);
});
test('A concha abre atalho mas não pula a Sombra da garça', () => {
  const completar = (p: Progresso, id: IdFasePraia) => concluirFase(p, id);
  const primeira = completar(caminhar(criarProgresso(), 'R'), 'primeira-onda');
  let opcional = caminhar(primeira, 'D');
  assert.equal(entradaEm(opcional.posicao)?.id, 'ilhota-perolada');
  assert.strictEqual(moverNoMapa(opcional, 'baixo').progresso, opcional);
  opcional = completar(opcional, 'ilhota-perolada');
  assert.strictEqual(moverNoMapa(opcional, 'baixo').progresso, opcional);
  const aberto = completar(opcional, 'sombra-da-garca');
  assert.equal(entradaEm(caminhar(aberto, 'D').posicao)?.id, 'busca-e-volta');
  assert.equal(entradaEm(caminhar(caminhar(aberto, 'D'), 'D').posicao)?.id, 'ilhota-perolada');
});
test('Salvamento versionado recupera ramo, posição e áudio sem tocar outros dados', () => {
  const itens = new Map([['miudezas', 'inalterado']]);
  const storage = {
    getItem: (chave: string) => itens.get(chave) ?? null,
    setItem: (chave: string, valor: string) => { itens.set(chave, valor); },
  };
  const progresso = concluirFase(caminhar(criarProgresso(), 'R'), 'primeira-onda');
  const registro = { progresso, audio: { musica: 0, efeitos: 0.7 } };
  assert.equal(salvar(storage, registro), true);
  assert.deepEqual(carregar(storage), registro);
  assert.equal(itens.get('miudezas'), 'inalterado');
  itens.set(CHAVE_SAVE, '{');
  assert.deepEqual(carregar(storage).progresso, criarProgresso());
  assert.equal(salvar(undefined, registro), false);
});
