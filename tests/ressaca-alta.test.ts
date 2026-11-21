import assert from 'node:assert/strict';
import { test } from 'node:test';
import { concluirFase, entradaEm, moverNoMapa, totalDeFasesRegulares, viajar } from '../src/campanha/index.ts';
import type { Progresso } from '../src/campanha/index.ts';
import { RESSACA_ALTA } from '../src/fases/ressaca-alta.ts';
import { FASES_RESSACA_AMPLIADA } from '../src/fases/ressaca-ampliada.ts';
import { VENTO_SUL } from '../src/fases/vento-sul.ts';
import { DIRECOES, executarPasso, faixaAfeta, faixaRessacaNoTurno, iniciar } from '../src/motor/index.ts';
import type { Acao, Estado, Fase } from '../src/motor/index.ts';
import { carregar, salvar } from '../src/persistencia/index.ts';
import { reproduzir, validarMapa, validarSolucao } from '../src/validacao/index.ts';

const p = (coluna: number, linha: number) => ({ coluna, linha });
const teclas = { U: 'cima', D: 'baixo', L: 'esquerda', R: 'direita', X: 'trocar' } as const;
const rota = (letras: string): Acao[] => [...letras].map(l => teclas[l as keyof typeof teclas]);

function passosSeguros(fase: Fase, trocar = true): number | undefined {
  const periodo = 6 * (fase.ressaca?.faixas.length ?? 1);
  const acoes: readonly Acao[] = trocar ? [...DIRECOES, 'trocar'] : DIRECOES;
  const fila: Estado[][] = [[iniciar(fase)]];
  const vistos = new Set<string>();
  for (let passo = 0; passo < fila.length; passo++) {
    // Uma troca é expandida no mesmo degrau, pois não altera o relógio.
    for (const estado of fila[passo] ?? []) {
      const chave = JSON.stringify([passo % periodo, estado.ondasSeguras, estado.posicao,
        estado.dupla?.posicao, estado.dupla?.parceiroAtivo]);
      if (vistos.has(chave)) continue;
      vistos.add(chave);
      if (estado.situacao === 'vitoria') return passo;
      for (const acao of acoes) {
        const novo = executarPasso(fase, estado, acao).estado;
        if (novo !== estado && !novo.levadas) (fila[novo.passos] ??= []).push(novo);
      }
    }
    fila[passo] = [];
  }
}

test('três faixas seguidas usam o relógio compartilhado e a levada zera a sequência', () => {
  const fase = RESSACA_ALTA;
  assert.deepEqual([3, 9, 15, 21].map(t => faixaRessacaNoTurno(fase, t)?.linha), [0, 4, 2, 0]);
  const umaOnda = reproduzir(fase, rota('RRR'));
  assert.equal(umaOnda.ondasSeguras, 1);
  const antesDaOnda = reproduzir(fase, rota('RRRLRLRL'));
  const troca = executarPasso(fase, antesDaOnda, 'trocar').estado;
  assert.equal(troca.passos, 8);
  assert.equal(troca.ondasSeguras, 1);
  const levou = executarPasso(fase, antesDaOnda, 'direita');
  assert.deepEqual(levou.eventos, [{ tipo: 'virada', alta: true }, { tipo: 'levada', motivos: ['ressaca'] }]);
  assert.equal(levou.estado.passos, 9);
  assert.equal(levou.estado.ondasSeguras, 0);
  assert.equal(levou.estado.levadas, 1);
  assert.ok(faixaAfeta(fase, fase.ressaca.faixas[1], p(0, 4)), 'A onda atingiu o siri inativo.');
  const reinicio = iniciar(fase);
  assert.equal(reinicio.ondasSeguras, 0);
  assert.equal(reinicio.ancoradouros, undefined);
  assert.equal(iniciar(VENTO_SUL).ondasSeguras, undefined);
});

test('a concha exige o marco do parceiro e a terceira onda sem levada', () => {
  const fase = RESSACA_ALTA;
  const base = iniciar(fase);
  const antes: Estado = { ...base, passos: 13, ondasSeguras: 2, posicao: p(12, 0),
    dupla: { posicao: p(13, 4), ultimoFirme: p(13, 4), parceiroAtivo: false } };
  const cedo = executarPasso(fase, antes, 'direita');
  assert.equal(cedo.estado.situacao, 'jogando');
  assert.deepEqual(cedo.eventos, [{ tipo: 'faltam-ondas' }]);
  const sozinho = executarPasso(fase, { ...antes, ondasSeguras: 3, dupla: base.dupla }, 'direita');
  assert.deepEqual(sozinho.eventos, [{ tipo: 'falta-parceiro' }]);
  const terceira = executarPasso(fase, { ...antes, passos: 14 }, 'direita');
  assert.equal(terceira.estado.ondasSeguras, 3);
  assert.equal(terceira.estado.situacao, 'vitoria');
  const destinos = [p(13, 0), p(13, 4)];
  assert.ok(fase.ressaca.faixas.every(f => destinos.every(casa => !faixaAfeta(fase, f, casa))));
  const faixas = [{ ...fase.ressaca.faixas[0], ultimaColuna: 13 }, ...fase.ressaca.faixas.slice(1)];
  assert.throws(() => validarMapa({ ...fase, ressaca: { ...fase.ressaca, faixas } }), /Destino atingido/);
});

test('as faixas mudam a travessia e os refúgios reduzem os passos', () => {
  const fase = RESSACA_ALTA;
  assert.ok(validarSolucao(fase));
  assert.equal(reproduzir(fase, fase.solucao).passos, 34);
  assert.equal(passosSeguros(fase), 34);
  assert.equal(passosSeguros(fase, false), undefined);
  const semRefugios = { ...fase, mapa: fase.mapa.map(linha => linha.replaceAll('H', '.')) };
  assert.equal(passosSeguros(semRefugios), 36);
  const semOnda = { ...fase, ressaca: undefined };
  assert.equal(passosSeguros(semOnda), 30);
  const atalho = rota('XRRXRDDRRRRXRRRRRRRRRRRXUURRRRRRRR');
  assert.equal(reproduzir(semOnda, atalho).situacao, 'vitoria');
  const antesDaOnda = reproduzir(fase, atalho.slice(0, 4));
  assert.ok(executarPasso(fase, antesDaOnda, atalho[4]).eventos.some(e => e.tipo === 'levada' && e.motivos.includes('ressaca')));
});

test('só Vento Sul libera o segundo chefe, e o Farol continua independente', () => {
  const antigo: Progresso = { mundo: 'ressaca', posicao: p(6, 3), viuTutorial: true, concluidas: [
    'ressaca-dupla-abrigo', 'ressaca-dupla-ancoradouros', ...FASES_RESSACA_AMPLIADA.map(fase => fase.id),
  ] };
  assert.equal(moverNoMapa(antigo, 'esquerda').progresso, antigo);
  const liberado = concluirFase(antigo, VENTO_SUL.id);
  const entrada = moverNoMapa(liberado, 'esquerda').progresso;
  assert.equal(entradaEm(entrada.posicao, 'ressaca')?.id, RESSACA_ALTA.id);
  assert.equal(entradaEm(entrada.posicao, 'ressaca')?.opcional, true);
  assert.equal(entradaEm(entrada.posicao, 'ressaca')?.chefe, true);
  assert.equal(totalDeFasesRegulares('ressaca'), 10);
  const completo = concluirFase(entrada, RESSACA_ALTA.id);
  assert.deepEqual(moverNoMapa(completo, 'direita').progresso.posicao, antigo.posicao);
  let registro = '';
  const storage = { setItem: (_: string, valor: string) => { registro = valor; }, getItem: () => registro };
  for (const progresso of [antigo, liberado, completo]) {
    const save = { progresso, audio: { musica: .2, efeitos: .4 } };
    assert.ok(salvar(storage, save));
    assert.deepEqual(carregar(storage), save);
  }
  const semChefes: Progresso = { ...antigo, posicao: p(4, 1),
    concluidas: ['ressaca-dupla-abrigo', 'ressaca-dupla-ancoradouros'] };
  const arquipelago = viajar(moverNoMapa(semChefes, 'baixo').progresso, 'arquipelago');
  assert.equal(viajar(moverNoMapa(arquipelago, 'cima').progresso, 'farol').mundo, 'farol');
});
