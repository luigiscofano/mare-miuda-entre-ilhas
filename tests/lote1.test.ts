import assert from 'node:assert/strict';
import { test } from 'node:test';
import { abriuEnseada, concluirFase, criarProgresso, entradaEm, moverNoMapa, mundoAtual, viajar } from '../src/campanha/index.ts';
import type { Progresso, Mundo } from '../src/campanha/index.ts';
import { FASES_MANGUE, FASES_RECIFES, TODAS_AS_FASES } from '../src/fases/index.ts';
import { executarPasso, iniciar, mesmaCasa } from '../src/motor/index.ts';
import type { Acao, Direcao, Fase } from '../src/motor/index.ts';
import { carregar, CHAVE_SAVE, salvar } from '../src/persistencia/index.ts';
import { reproduzir, validarSolucao } from '../src/validacao/index.ts';

const letras = { U: 'cima', D: 'baixo', L: 'esquerda', R: 'direita', X: 'trocar' } as const;
const comandos = (string: string): Acao[] => [...string].map(c => letras[c as keyof typeof letras]);
function andar(p: Progresso, string: string): Progresso {
  return comandos(string).reduce((anterior, acao) => {
    const transicao = moverNoMapa(anterior, acao as Direcao);
    assert.notEqual(transicao.progresso, anterior, transicao.mensagem);
    return transicao.progresso;
  }, p);
}
const praia = (): Progresso => andar({
  ...criarProgresso(),
  concluidas: ['primeira-onda', 'sombra-da-garca', 'busca-e-volta', 'ponta-da-garca'],
}, 'RRRRRR');

test('Onze fases têm testemunhas aceitas pelo motor real', () => {
  assert.equal(TODAS_AS_FASES.length, 11);
  for (const f of TODAS_AS_FASES) assert.ok(validarSolucao(f), f.id);
});
test('Pedra alta é refúgio e rocha continua bloqueada', () => {
  const fase = FASES_RECIFES[0];
  const inicio = iniciar(fase);
  assert.strictEqual(executarPasso(fase, inicio, 'baixo').estado, inicio);
  const pos = reproduzir(fase, comandos('RRDU'));
  assert.equal(fase.mapa[pos.posicao.linha][pos.posicao.coluna], 'H');
  assert.equal(pos.passos, 4);
  assert.equal(pos.levadas, 0);
});
test('Dois fragmentos únicos, sem duplicar; primeira coleta não libera saída', () => {
  const fase = FASES_RECIFES[1];
  const um = executarPasso(fase, iniciar(fase), 'cima');
  assert.deepEqual(um.eventos, [{ tipo: 'falta-fragmento' }]);
  const piso = reproduzir(fase, comandos('RRRDUDU'));
  assert.equal(piso.fragmentos.length, 1);
  assert.equal(reproduzir(fase, fase.solucao).fragmentos.length, 2);
});
test('A troca é gratuita, e dois perigos num turno só devolvem a dupla a marcos distintos', () => {
  const fase: Fase = {
    ...FASES_MANGUE[0], mapa: ['S=H.C', 'A=H.T'],
    ameaca: { alvo: { coluna: 2, linha: 1 }, primeiroAtaque: 3, periodo: 4 },
  };
  const primeiro = executarPasso(fase, iniciar(fase), 'direita').estado;
  const troca = executarPasso(fase, primeiro, 'trocar');
  assert.equal(troca.estado.passos, primeiro.passos);
  assert.equal(troca.estado.dupla?.parceiroAtivo, true);
  const anterior = executarPasso(fase, troca.estado, 'direita').estado;
  const depois = executarPasso(fase, anterior, 'direita');
  assert.deepEqual(depois.eventos, [{ tipo: 'virada', alta: true },
    { tipo: 'levada', motivos: ['mare', 'garca'] }]);
  assert.equal(depois.estado.levadas, 1);
  assert.equal(depois.estado.passos, 3);
  assert.ok(depois.estado.dupla);
  assert.ok(!mesmaCasa(depois.estado.posicao, depois.estado.dupla.posicao));
  assert.ok(mesmaCasa(depois.estado.posicao, primeiro.ultimoFirme));
  assert.ok(mesmaCasa(depois.estado.dupla.posicao, primeiro.dupla!.ultimoFirme));
});
test('Portão fica bloqueado sem a placa; fase final exige reunião nos dois alvos', () => {
  const fase = FASES_MANGUE[1];
  const antesDaPlaca = reproduzir(fase, comandos('RR'));
  assert.strictEqual(executarPasso(fase, antesDaPlaca, 'direita').estado, antesDaPlaca);
  assert.equal(reproduzir(fase, fase.solucao).situacao, 'vitoria');

  const reencontro = FASES_MANGUE[2];
  const momentos = reencontro.solucao.slice(0, -2);
  assert.equal(reproduzir(reencontro, momentos).situacao, 'jogando');
  assert.equal(reproduzir(reencontro, reencontro.solucao).situacao, 'vitoria');
});
for (const ordem of [['recifes', 'mangue'], ['mangue','recifes']] as const) {
  test(`O arquipélago aceita ${ordem.join(' → ')} e só abre a Enseada depois de ambos`, () => {
    let p = viajar(praia(), 'arquipelago');
    assert.equal(mundoAtual(p), 'arquipelago');
    const rotaDe = (estava: Mundo, destino: Mundo) => destino === 'recifes'
      ? (estava === 'mangue' ? 'LLLUU' : 'RUU') : (estava === 'recifes' ? 'DDRRR' : 'RRRR');
    assert.equal(abriuEnseada(p), false);
    const conferirGate = (a: Progresso, doMundo: Mundo) => {
      const entrada = andar(a, doMundo === 'mangue' ? 'LUUR' : doMundo === 'recifes' ? 'RRR' : 'RRRUUR');
      assert.strictEqual(moverNoMapa(entrada, 'direita').progresso, entrada);
    };
    conferirGate(p, 'arquipelago');
    let anterior: Mundo = 'arquipelago';
    for (const mundo of ordem) {
      const apoio = andar(p, rotaDe(anterior, mundo));
      p = viajar(apoio, mundo);
      assert.equal(mundoAtual(p), mundo);
      assert.strictEqual(moverNoMapa(p, 'baixo').progresso, p);
      const ids = mundo === 'recifes'
        ? ['recife-pedra-firme', 'recife-duas-pocas', 'recife-retorno'] as const
        : ['mangue-dois-encontros', 'mangue-placa', 'mangue-reuniao'] as const;
      for (const [i, id] of ids.entries()) {
        p = andar(p, i === 0 ? 'R' : 'RR');
        assert.equal(entradaEm(p.posicao, mundo)?.id, id);
        p = concluirFase(p, id);
      }
      p = viajar(andar(p, 'DDLLLLLUU'), 'arquipelago');
      if (anterior === 'arquipelago') conferirGate(p, mundo);
      anterior = mundo;
    }
    assert.equal(abriuEnseada(p), true);
    assert.equal(entradaEm(andar(p, anterior === 'mangue' ? 'LUURR' : 'RRRR').posicao, 'arquipelago')?.id, 'enseada');
  });
}
test('Um save v0.2 sem campo mundo continua na praia; o novo mundo sobrevive ao reload', () => {
  let bruto = JSON.stringify({ versao: 1,
    progresso: { ...praia(), viuTutorial: true }, audio: { musica: 0, efeitos: 0.25 } });
  const storage = {
    getItem: (key: string) => { assert.equal(key, CHAVE_SAVE); return bruto; },
    setItem: (key: string, item: string) => { assert.equal(key, CHAVE_SAVE); bruto = item; },
  };
  const p = carregar(storage);
  assert.equal(mundoAtual(p.progresso), 'praia');
  assert.equal(p.progresso.concluidas.length, 4);
  const arq = viajar(p.progresso, 'arquipelago');
  const recife = viajar(andar(arq, 'RUU'), 'recifes');
  const registro = { ...p, progresso: andar(recife, 'R') };
  assert.equal(salvar(storage, registro), true);
  assert.deepEqual(carregar(storage), registro);
});
