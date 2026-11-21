import assert from 'node:assert/strict';
import { test } from 'node:test';
import { concluirFase, entradaEm, moverNoMapa, nosDo, totalDeFasesRegulares, trilhasDo } from '../src/campanha/index.ts';
import type { Progresso } from '../src/campanha/index.ts';
import { FASES_FAROL_AMPLIADO } from '../src/fases/farol-ampliado.ts';
import { TODAS_AS_FASES } from '../src/fases/index.ts';
import { DIRECOES, executarPasso, iniciar } from '../src/motor/index.ts';
import type { Acao, Estado, Fase } from '../src/motor/index.ts';
import { carregar, salvar } from '../src/persistencia/index.ts';
import { reproduzir, validarSolucao } from '../src/validacao/index.ts';

const [vigia, , costa, , , cais, lentes, final] = FASES_FAROL_AMPLIADO;
const p = (coluna: number, linha: number) => ({ coluna, linha });
const retirar = (fase: Fase, simbolo: string): Fase =>
  ({ ...fase, mapa: fase.mapa.map(linha => linha.replaceAll(simbolo, '#')) });

function menorVitoriaSemLevadas(fase: Fase): number | undefined {
  const acoes: readonly Acao[] = fase.dupla ? [...DIRECOES, 'trocar'] : DIRECOES;
  const primeira = fase.ameaca?.primeiroAtaque ?? 0;
  const periodo = 6 * (fase.ameaca?.periodo ?? 1) * (1 + (fase.ameaca?.rota?.length ?? 0));
  const porPasso: Estado[][] = [[iniciar(fase)]];
  const vistos = new Set<string>();
  // Trocar de siri custa zero passos. Expanda todas as trocas no mesmo degrau
  // antes de seguir para o próximo turno; visitas não precisam dos refúgios
  // anteriores porque a busca descarta toda tentativa que sofre uma levada.
  for (let passo = 0; passo < porPasso.length; passo++) {
    for (const estado of porPasso[passo] ?? []) {
      const tempo = fase.orcamentoMoedas !== undefined || passo < primeira
        ? passo : primeira + (passo - primeira) % periodo;
      const fragmentos = estado.fragmentos.map(({ coluna, linha }) => coluna + 16 * linha).sort();
      const chave = JSON.stringify([tempo, estado.posicao, estado.dupla?.posicao,
        estado.dupla?.parceiroAtivo, estado.etapaGruta, estado.portadorGruta, fragmentos]);
      if (vistos.has(chave)) continue;
      vistos.add(chave);
      if (estado.situacao === 'vitoria') return passo;
      for (const acao of acoes) {
        const novo = executarPasso(fase, estado, acao).estado;
        if (novo !== estado && !novo.levadas && novo.situacao !== 'derrota') {
          (porPasso[novo.passos] ??= []).push(novo);
        }
      }
    }
    // O relógio já processou estas posições; não guarde referências aos estados.
    porPasso[passo] = [];
  }
}

test('o Farol tem dez regulares; as oito novas encerram sem levadas', () => {
  assert.equal(totalDeFasesRegulares('farol'), 10);
  assert.equal(FASES_FAROL_AMPLIADO.filter(f => 'dupla' in f).length, 5);
  assert.equal(TODAS_AS_FASES.length, 95);
  assert.equal(new Set(TODAS_AS_FASES.map(f => f.id)).size, TODAS_AS_FASES.length);
  for (const fase of TODAS_AS_FASES) assert.ok(validarSolucao(fase), fase.id);
});

test('a vigia permite contorno, mas balsas e portões são decisivos em trechos posteriores', () => {
  assert.equal(menorVitoriaSemLevadas(vigia), 17);
  assert.equal(menorVitoriaSemLevadas(retirar(vigia, 'D')), 19);
  for (const fase of [cais, final]) {
    for (const [i] of fase.balsas.entries()) {
      const parcial = { ...fase, balsas: fase.balsas.filter((_, j) => i !== j) };
      assert.equal(menorVitoriaSemLevadas(parcial), undefined, fase.id + ' sem balsa ' + (i + 1));
    }
  }
  for (const fase of [lentes, final]) {
    assert.equal(menorVitoriaSemLevadas(retirar(fase, 'D')), undefined, fase.id + ' sem placa');
    assert.equal(menorVitoriaSemLevadas(retirar(fase, 'O')), undefined, fase.id + ' sem pérola e alavanca');
  }
});

test('a costa tem orçamento justo e o fechamento combina dez viradas ou mais', () => {
  assert.equal(menorVitoriaSemLevadas(costa), 27);
  assert.equal(menorVitoriaSemLevadas({ ...costa, orcamentoMoedas: 26 }), undefined);
  assert.equal(menorVitoriaSemLevadas(final), 34);
  const fim = reproduzir(final, final.solucao);
  assert.equal(fim.fragmentos.length, 3);
  assert.equal(fim.etapaGruta, 3);
  assert.equal(fim.situacao, 'vitoria');
});

test('os ramais preservam o save e o último desafio não obriga a rota norte', () => {
  const antigo: Progresso = { mundo: 'farol', posicao: p(4, 1), viuTutorial: true,
    concluidas: ['farol-fragmento-margens', 'farol-duas-luzes'] };
  let bruto = '';
  const storage = { getItem: () => bruto, setItem: (_: string, v: string) => { bruto = v; } };
  const reabrir = (progresso: Progresso) => {
    const save = { progresso, audio: { musica: 0, efeitos: .25 } };
    assert.ok(salvar(storage, save));
    assert.deepEqual(carregar(storage), save);
  };
  reabrir(antigo);
  assert.deepEqual(moverNoMapa(antigo, 'baixo').progresso.posicao, p(1, 1));
  let corrente = antigo;
  for (const i of [0, 1, 4, 7]) {
    corrente = moverNoMapa(corrente, i === 7 ? 'baixo' : 'direita').progresso;
    const id = FASES_FAROL_AMPLIADO[i].id;
    assert.equal(entradaEm(corrente.posicao, 'farol')?.id, id);
    corrente = concluirFase(corrente, id);
  }
  reabrir(corrente);
  assert.equal(corrente.concluidas.length, 6);

  let norte = antigo;
  for (const i of [2, 3, 5, 6]) {
    norte = moverNoMapa(norte, i === 2 ? 'cima' : 'direita').progresso;
    const id = FASES_FAROL_AMPLIADO[i].id;
    assert.equal(entradaEm(norte.posicao, 'farol')?.id, id);
    norte = concluirFase(norte, id);
  }
  assert.equal(moverNoMapa(norte, 'baixo').progresso, norte);
  const completo = { ...norte, concluidas: [...new Set([...norte.concluidas, ...corrente.concluidas])] };
  reabrir(completo);
  assert.equal(nosDo('farol').length, 14);
  const todosOsMarcos = concluirFase(completo, 'farol-chefe-guardiao');
  for (const t of trilhasDo('farol')) {
    assert.deepEqual(moverNoMapa({ ...todosOsMarcos, posicao: t.de }, t.ida).progresso.posicao, t.para);
    assert.deepEqual(moverNoMapa({ ...todosOsMarcos, posicao: t.para }, t.volta).progresso.posicao, t.de);
  }
});
