import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ehIdFase } from '../src/campanha/index.ts';
import {
  DIFICULDADES_MARE_A_MAO, gerarMareAMao, MUNDOS_MARE_A_MAO,
} from '../src/mare-a-mao/index.ts';
import type { OpcoesMareAMao } from '../src/mare-a-mao/index.ts';
import {
  casasDoRasante, DIRECOES, executarPasso, iniciar, LIMITE_LEVADAS, portaoLiberado, posicoesDosSiris, totalFragmentos,
} from '../src/motor/index.ts';
import type { Posicao } from '../src/motor/index.ts';
import { reproduzir, validarSolucao } from '../src/validacao/index.ts';

const BASE = { mundo: 'praia', dificuldade: 'Sossegado', siris: 1, garca: false, fragmento: false } as const;
const contar = (mapa: readonly string[], celula: string) => [...mapa.join('')].filter(casa => casa === celula).length;
const localizar = (mapa: readonly string[], celula: string): Posicao => {
  const linha = mapa.findIndex(fila => fila.includes(celula));
  return { linha, coluna: mapa[linha].indexOf(celula) };
};

test('a mesma semente e opções produzem a mesma fase; novos valores criam malhas diferentes', () => {
  const opcoes = { ...BASE, dificuldade: 'Mar Bravo', siris: 3, garca: true, fragmento: true } as const;
  const original = gerarMareAMao(opcoes, 'Concha Azul');
  assert.ok(original);
  assert.deepEqual(gerarMareAMao(opcoes, ' Concha Azul '), original);
  assert.deepEqual(gerarMareAMao(opcoes, 'Maré'), gerarMareAMao(opcoes, 'Mare\u0301'));
  const outros = Array.from({ length: 16 }, (_, i) => gerarMareAMao(opcoes, `enseada-${i}`));
  assert.ok(outros.every(Boolean));
  assert.ok(new Set(outros.map(fase => fase?.mapa.join('|'))).size >= 12);
  assert.ok(new Set(outros.map(fase => fase?.id)).size === 16);
  assert.match(original.nome, /Ilha de Improviso/);
});

test('a matriz toda tem vitória sem levadas provada pelo motor, com opções efetivas e três sementes', () => {
  let testadas = 0;
  for (const mundo of MUNDOS_MARE_A_MAO)
    for (const [grau, dificuldade] of DIFICULDADES_MARE_A_MAO.entries())
      for (const siris of [1, 2, 3] as const)
        for (const garca of [false, true])
          for (const fragmento of [false, true])
            for (const semente of ['fenda-7', 'encosta-8', 'Poça do Sol']) {
              const fase = gerarMareAMao({ mundo, dificuldade, siris, garca, fragmento }, semente);
              assert.ok(fase, JSON.stringify({ mundo, dificuldade, siris, garca, fragmento, semente }));
              assert.ok(validarSolucao(fase));
              const fim = reproduzir(fase, fase.solucao);
              assert.equal(fim.levadas, 0);
              assert.equal(fim.temFragmento, fragmento);
              assert.equal(posicoesDosSiris(fim).length, siris);
              assert.equal(fase.mapa.length, 4 * siris - 1);
              assert.equal(fase.mapa[0].length, 7 + grau * 2);
              assert.equal(contar(fase.mapa, '='), siris * (grau + 1));
              assert.equal(Boolean(fase.ameaca), garca);
              assert.equal(totalFragmentos(fase), Number(fragmento));
              assert.equal(contar(fase.mapa, 'C'), Number(!fragmento));
              assert.equal(contar(fase.mapa, 'G'), Number(fragmento));
              assert.equal(ehIdFase(fase.id), false);
              assert.equal(contar(fase.mapa, 'D'), Number(siris > 1 && grau >= 2));
              if (fase.ameaca) {
                assert.equal(fase.ameaca.periodo, 11 - grau * 2);
                assert.ok(casasDoRasante(fase, fase.ameaca.primeiroAtaque).length);
              }
              testadas++;
            }
  assert.equal(testadas, 1440);
});

test('pegar fragmento exige um desvio de ida e volta e abrir o portão exige outro siri', () => {
  const fase = gerarMareAMao({ ...BASE, dificuldade: 'Puxado', siris: 2, fragmento: true }, 'ilhota');
  assert.ok(fase);
  const portao = localizar(fase.mapa, 'D');
  const placa = localizar(fase.mapa, 'P');
  const fragmento = localizar(fase.mapa, 'B');
  const adjacentes = [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(([dx, dy]) => {
    const celula = fase.mapa[fragmento.linha + dy]?.[fragmento.coluna + dx];
    return celula && celula !== '#';
  });
  assert.equal(adjacentes.length, 1, 'o fragmento pede entrar e sair de um ramo');
  let estado = iniciar(fase);
  assert.equal(portaoLiberado(fase, portao, posicoesDosSiris(estado)), false);
  let abriu = false;
  for (const acao of fase.solucao) {
    estado = executarPasso(fase, estado, acao).estado;
    if (portaoLiberado(fase, portao, posicoesDosSiris(estado))) {
      abriu = true;
      assert.deepEqual(posicoesDosSiris(estado)[1], placa);
    }
  }
  assert.ok(abriu);
  assert.equal(estado.situacao, 'vitoria');
});

test('maré e garça podem causar levadas reais e a terceira levada encerra a fase', () => {
  const fase = gerarMareAMao({ ...BASE, dificuldade: 'Animado', garca: true }, 'Charco');
  assert.ok(fase?.ameaca);
  const periodo = 6 * fase.ameaca.periodo * (1 + (fase.ameaca.rota?.length ?? 0));
  const fila = [iniciar(fase)];
  const visitas = new Set<string>();
  const motivos = new Set<string>();
  let derrota = false;
  for (let i = 0; i < fila.length && !(derrota && motivos.has('mare') && motivos.has('garca')); i++) {
    const atual = fila[i];
    const ciclo = atual.passos < fase.ameaca.primeiroAtaque ? atual.passos : atual.passos % periodo + periodo;
    const id = [atual.posicao.coluna, atual.posicao.linha, atual.ultimoFirme.coluna, atual.ultimoFirme.linha, ciclo, atual.levadas].join(':');
    if (visitas.has(id)) continue;
    visitas.add(id);
    for (const acao of DIRECOES) {
      const depois = executarPasso(fase, atual, acao);
      for (const evento of depois.eventos) {
        if (evento.tipo === 'levada') evento.motivos.forEach(motivo => motivos.add(motivo));
      }
      if (depois.estado.situacao === 'derrota') {
        derrota = true;
        assert.equal(depois.estado.levadas, LIMITE_LEVADAS);
      } else if (depois.estado !== atual && depois.estado.situacao === 'jogando') fila.push(depois.estado);
    }
  }
  assert.ok(motivos.has('mare') && motivos.has('garca') && derrota);
});

test('opções e sementes inválidas são recusadas sem lançar erro', () => {
  for (const invalida of [
    { ...BASE, siris: 0 }, { ...BASE, dificuldade: 'Ressaca' }, { ...BASE, mundo: 'arquipelago' },
    { ...BASE, garca: 1 }, { ...BASE, fragmento: 'sim' }, null,
  ]) assert.equal(gerarMareAMao(invalida as unknown as OpcoesMareAMao, 'casca'), undefined);
  for (const invalida of ['', '   ', 'a'.repeat(81)]) assert.equal(gerarMareAMao(BASE, invalida), undefined);
});
