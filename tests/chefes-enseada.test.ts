import assert from 'node:assert/strict';
import { test } from 'node:test';
import { concluirFase, entradaEm, moverNoMapa, totalDeFasesRegulares, viajar } from '../src/campanha/index.ts';
import type { Progresso } from '../src/campanha/index.ts';
import { GARCA_DA_RESTINGA, VIGIA_DAS_FALESIAS } from '../src/fases/chefes-enseada.ts';
import { casasDoRasante, DIRECOES, executarPasso, iniciar, jogadorAtivo, posicoesDosSiris, siriAtivo } from '../src/motor/index.ts';
import type { Acao, Estado, Fase } from '../src/motor/index.ts';
import { carregar, salvar } from '../src/persistencia/index.ts';
import { reproduzir, validarMapa, validarSolucao } from '../src/validacao/index.ts';

const p = (coluna: number, linha: number) => ({ coluna, linha });
const comandos = { U: 'cima', D: 'baixo', L: 'esquerda', R: 'direita', X: 'trocar' } as const;
const rota = (letras: string): Acao[] => [...letras].map(l => comandos[l as keyof typeof comandos]);
const mdc = (a: number, b: number): number => b ? mdc(b, a % b) : a;

function chaveDoEstado(fase: Fase, e: Estado, aceitaErros: boolean): string {
  const a = fase.ameaca;
  const ataques = a ? a.periodo * (1 + (a.rota?.length ?? 0)) : 1;
  const ciclo = 6 * ataques / mdc(6, ataques);
  const inicio = Math.max(0, (a?.primeiroAtaque ?? 1) - 1);
  const relogio = e.passos < inicio ? e.passos : inicio + (e.passos - inicio) % ciclo;
  return JSON.stringify([relogio, siriAtivo(e), posicoesDosSiris(e), e.fragmentos, e.situacao,
    ...(aceitaErros ? [e.levadas, e.ultimoFirme, e.dupla?.ultimoFirme] : [])]);
}

function menorSolucao(fase: Fase, permiteTroca = true): number | undefined {
  const porPasso: Estado[][] = [[iniciar(fase)]];
  const acoes = fase.dupla && permiteTroca ? [...DIRECOES, 'trocar'] as const : DIRECOES;
  const vistos = new Set<string>();
  // A troca fica no mesmo degrau; o peso da busca é o passo, não a tecla.
  for (let passo = 0; passo < porPasso.length; passo++) {
    for (const e of porPasso[passo] ?? []) {
      const chave = chaveDoEstado(fase, e, false);
      if (vistos.has(chave)) continue;
      vistos.add(chave);
      if (e.situacao === 'vitoria') return passo;
      for (const acao of acoes) {
        const n = executarPasso(fase, e, acao).estado;
        if (n !== e && !n.levadas) (porPasso[n.passos] ??= []).push(n);
      }
    }
    porPasso[passo] = [];
  }
}

function verificarRecuperacao(fase: Fase) {
  const fila = [iniciar(fase)];
  const anteriores: number[][] = [[]];
  const saidas: number[] = [];
  const indices = new Map([[chaveDoEstado(fase, fila[0], true), 0]]);
  const acoes = fase.dupla ? [...DIRECOES, 'trocar'] as const : DIRECOES;
  for (const [i, e] of fila.entries()) {
    if (e.situacao === 'vitoria') { saidas.push(i); continue; }
    for (const acao of acoes) {
      const n = executarPasso(fase, e, acao).estado;
      if (n === e || n.situacao === 'derrota') continue;
      const chave = chaveDoEstado(fase, n, true);
      const j = indices.get(chave) ?? fila.length;
      if (j === fila.length) {
        fila.push(n);
        indices.set(chave, j);
        anteriores.push([]);
      }
      anteriores[j].push(i);
    }
  }
  const recuperaveis = new Set(saidas);
  // Só a terceira levada pode encerrar sem saída; voltar da vitória marca o restante.
  for (const j of saidas) for (const i of anteriores[j]) {
    if (recuperaveis.has(i)) continue;
    recuperaveis.add(i);
    saidas.push(i);
  }
  return { total: fila.length, recuperaveis: recuperaveis.size };
}

test('o rasante horizontal avisa as casas reais e o refúgio elevado protege mesmo no centro do voo', () => {
  const fase = GARCA_DA_RESTINGA;
  assert.deepEqual(casasDoRasante(fase, 5), []);
  assert.deepEqual(casasDoRasante(fase, 6), [4, 5, 6, 8, 9, 10].map(c => p(c, 1)));
  const antes = reproduzir(fase, rota('RRRRR'));
  const erro = executarPasso(fase, antes, 'baixo');
  assert.deepEqual(erro.eventos, [{ tipo: 'virada', alta: false }, { tipo: 'levada', motivos: ['garca'] }]);
  assert.deepEqual(erro.estado.posicao, antes.ultimoFirme);
  const coberto = reproduzir(fase, fase.solucao.slice(0, 12));
  assert.deepEqual(coberto.posicao, p(7, 1));
  assert.equal(coberto.passos, 12);
  assert.equal(coberto.levadas, 0);
  assert.throws(() => validarMapa({ ...fase, ameaca: { ...fase.ameaca, rasante: { eixo: 'linha', alcance: 0 } } }), /Rasante/);
});

test('o Vigia alterna colunas e alcança o parceiro inativo antes de verificar o objetivo', () => {
  const fase = VIGIA_DAS_FALESIAS;
  assert.deepEqual(casasDoRasante(fase, 2), [p(4, 0), p(4, 1)]);
  assert.deepEqual(casasDoRasante(fase, 4), [p(5, 3), p(5, 4)]);
  const antes = reproduzir(fase, rota('RRRRXDURRR'));
  assert.equal(siriAtivo(antes), 1);
  assert.ok(!casasDoRasante(fase, 10).some(casa => casa.linha === jogadorAtivo(antes).linha));
  const erro = executarPasso(fase, antes, 'esquerda');
  assert.deepEqual(erro.eventos, [{ tipo: 'levada', motivos: ['garca'] }]);
  assert.equal(erro.estado.levadas, 1);
  assert.deepEqual(posicoesDosSiris(erro.estado), [antes.ultimoFirme, antes.dupla?.ultimoFirme]);
  assert.equal(menorSolucao(fase, false), undefined);
  const semPortao = { ...fase, mapa: fase.mapa.map(l => l.replaceAll('D', '#')) };
  assert.equal(menorSolucao(semPortao), undefined);
});

test('cada arena exige leitura do rasante e todo estado sem derrota permite recuperação', () => {
  for (const [fase, minimo, semAtaque] of [
    [GARCA_DA_RESTINGA, 18, 14], [VIGIA_DAS_FALESIAS, 22, 20],
  ] as const) {
    assert.ok(validarSolucao(fase));
    assert.equal(reproduzir(fase, fase.solucao).passos, minimo);
    assert.equal(menorSolucao(fase), minimo);
    assert.equal(menorSolucao({ ...fase, ameaca: undefined }), semAtaque);
    const grafo = verificarRecuperacao(fase);
    assert.ok(grafo.total > 400);
    assert.equal(grafo.recuperaveis, grafo.total);
  }
});

test('as arenas são opcionais, voltam ao marco regular e não bloqueiam a Deriva', () => {
  const antiga: Progresso = { mundo: 'enseada', posicao: p(6, 1), viuTutorial: true,
    concluidas: ['enseada-sombra-restinga', 'enseada-abrigo-ondas'] };
  assert.equal(moverNoMapa(antiga, 'direita').progresso, antiga);
  const remate = concluirFase(antiga, 'enseada-farol-baixo');
  const primeira = moverNoMapa(remate, 'direita').progresso;
  assert.equal(entradaEm(primeira.posicao, 'enseada')?.id, GARCA_DA_RESTINGA.id);
  assert.equal(moverNoMapa(primeira, 'baixo').progresso, primeira);
  const segunda = moverNoMapa(concluirFase(primeira, GARCA_DA_RESTINGA.id), 'baixo').progresso;
  assert.deepEqual(entradaEm(segunda.posicao, 'enseada'), {
    id: VIGIA_DAS_FALESIAS.id, nome: VIGIA_DAS_FALESIAS.nome, posicao: p(9, 3), chefe: true, opcional: true,
  });
  assert.deepEqual(moverNoMapa(moverNoMapa(segunda, 'cima').progresso, 'esquerda').progresso.posicao, remate.posicao);
  assert.equal(totalDeFasesRegulares('enseada'), 10);
  const arquipelago = viajar(moverNoMapa(remate, 'baixo').progresso, 'arquipelago');
  assert.equal(viajar(moverNoMapa(arquipelago, 'direita').progresso, 'deriva').mundo, 'deriva');
  let bruto = '';
  const storage = { setItem: (_: string, valor: string) => { bruto = valor; }, getItem: () => bruto };
  for (const progresso of [remate, concluirFase(segunda, VIGIA_DAS_FALESIAS.id)]) {
    const save = { progresso, audio: { musica: .2, efeitos: .4 } };
    assert.ok(salvar(storage, save));
    assert.deepEqual(carregar(storage), save);
  }
});
