import assert from 'node:assert/strict';
import { test } from 'node:test';
import { concluirFase, criarProgresso, entradaEm, moverNoMapa, mundoAtual, totalDeFasesRegulares, viajar } from '../src/campanha/index.ts';
import type { Progresso } from '../src/campanha/index.ts';
import { carregar, salvar } from '../src/persistencia/index.ts';
import { FASES_FAROL } from '../src/fases/farol.ts';
import { DIRECOES, executarPasso, iniciar } from '../src/motor/index.ts';
import type { Acao, Estado, Fase } from '../src/motor/index.ts';
import { reproduzir, validarSolucao } from '../src/validacao/index.ts';

const comandos = { U: 'cima', D: 'baixo', L: 'esquerda', R: 'direita', X: 'trocar' } as const;
const rota = (letras: string): Acao[] => [...letras].map(letra => comandos[letra as keyof typeof comandos]);

function alcancaFarol(fase: Fase, trocar = true): boolean {
  const fila: Estado[] = [];
  const vistos = new Set<string>();
  const primeiro = fase.ameaca?.primeiroAtaque ?? 0;
  const periodo = 6 * (fase.ameaca?.periodo ?? 1) * (1 + (fase.ameaca?.rota?.length ?? 0));
  const acoes: readonly Acao[] = trocar ? [...DIRECOES, 'trocar'] : DIRECOES;
  const enfileirar = (estado: Estado) => {
    if (estado.situacao === 'derrota') return;
    const { passos, ...tabuleiro } = estado;
    // A chave mantém relógio, personagem ativo, refúgios e levadas. Não confunde
    // a fase antes do primeiro aviso com um ciclo de ameaça já em andamento.
    const relogio = passos < primeiro ? passos : primeiro + (passos - primeiro) % periodo;
    const chave = JSON.stringify([relogio, tabuleiro]);
    if (vistos.has(chave)) return;
    vistos.add(chave);
    fila.push(estado);
  };
  enfileirar(iniciar(fase));
  for (let i = 0; i < fila.length; i++) {
    const estado = fila[i];
    if (estado.situacao === 'vitoria') return true;
    for (const acao of acoes) {
      const proximo = executarPasso(fase, estado, acao).estado;
      if (proximo !== estado) enfileirar(proximo);
    }
  }
  return false;
}

test('Farol tem duas soluções seguras e exige toda a infraestrutura da dupla', () => {
  for (const fase of FASES_FAROL) {
    assert.ok(validarSolucao(fase), fase.id);
    assert.equal(alcancaFarol(fase, false), false, fase.id);
    for (const [i] of (fase.balsas ?? []).entries()) {
      // Preserve a patrulha e admita retorno por levada; só a balsa é retirada.
      const semBalsa = { ...fase, balsas: fase.balsas!.filter((_, j) => i !== j) };
      assert.equal(alcancaFarol(semBalsa), false, `${fase.id}: balsa ${i + 1}`);
    }
  }
});

test('No primeiro Farol, mover o ocupante da placa cedo fecha o portão ou deixa o outro no baixio', () => {
  const fase = FASES_FAROL[0];
  const antesDoPortao = reproduzir(fase, rota('RRXRRLX'));
  const fechado = executarPasso(fase, antesDoPortao, 'direita');
  assert.equal(fechado.estado, antesDoPortao);
  assert.equal(fechado.eventos[0]?.tipo, 'bloqueado');

  const noBaixio = reproduzir(fase, rota('RRXRRXRRRRX'));
  const largouCedo = executarPasso(fase, noBaixio, 'direita');
  assert.equal(largouCedo.estado.passos, 9);
  assert.ok(largouCedo.eventos.some(e => e.tipo === 'levada' && e.motivos.includes('mare')));
});

test('No segundo Farol, manter a placa cedo atrai o rasante e chegar tarde perde a janela do baixio', () => {
  const fase = FASES_FAROL[1];
  const antesDoRasante = reproduzir(fase, rota('XRRRXRRRRRRRXRDU'));
  assert.deepEqual(antesDoRasante.posicao, { coluna: 11, linha: 0 });
  assert.equal(antesDoRasante.dupla?.parceiroAtivo, true);
  const rasante = executarPasso(fase, antesDoRasante, 'direita');
  assert.ok(rasante.eventos.some(e => e.tipo === 'levada' && e.motivos.includes('garca')));

  const chegada = reproduzir(fase, rota('RDUDDRRXRUURRRRRLRXRR'));
  assert.equal(chegada.passos, 19);
  assert.equal(executarPasso(fase, chegada, 'direita').estado, chegada);
  const preparou = reproduzir(fase, rota('RDUDDRRXRUURRRRRLRXRRX'));
  const atraso = executarPasso(fase, executarPasso(fase, preparou, 'esquerda').estado, 'direita');
  assert.ok(atraso.eventos.some(e => e.tipo === 'levada' && e.motivos.includes('mare')));
  assert.equal(reproduzir(fase, fase.solucao).passos, 23);
});

test('Farol é progressão regular, recupera save e não exige desvio opcional', () => {
  const ressaca: Progresso = { ...criarProgresso(), mundo: 'arquipelago', posicao: { coluna: 9, linha: 3 } };
  assert.equal(moverNoMapa(ressaca, 'cima').progresso, ressaca);
  let progresso = viajar(
    moverNoMapa(concluirFase(ressaca, 'ressaca-dupla-ancoradouros'), 'cima').progresso, 'farol',
  );
  assert.equal(mundoAtual(progresso), 'farol');
  assert.equal(totalDeFasesRegulares('farol'), 2);
  assert.equal(moverNoMapa(progresso, 'baixo').progresso, progresso);
  for (const id of ['farol-fragmento-margens', 'farol-duas-luzes'] as const) {
    progresso = moverNoMapa(progresso, 'direita').progresso;
    assert.equal(entradaEm(progresso.posicao, 'farol')?.id, id);
    progresso = concluirFase(progresso, id);
  }
  let bruto = '';
  const storage = { getItem: () => bruto, setItem: (_: string, v: string) => { bruto = v; } };
  const save = { progresso, audio: { musica: .25, efeitos: .5 } };
  assert.ok(salvar(storage, save));
  assert.deepEqual(carregar(storage), save);
  const retorno = viajar(moverNoMapa(progresso, 'baixo').progresso, 'arquipelago');
  assert.equal(mundoAtual(retorno), 'arquipelago');
  assert.deepEqual(retorno.posicao, { coluna: 10, linha: 1 });
});
