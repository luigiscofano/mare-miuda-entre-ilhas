import assert from 'node:assert/strict';
import { test } from 'node:test';
import { concluirFase, entradaEm, faseOpcional, moverNoMapa, totalDeFasesRegulares } from '../src/campanha/index.ts';
import type { Progresso } from '../src/campanha/index.ts';
import { ECO_DOS_TRES_CAIS, TRES_LUZES_EM_REVEZAMENTO } from '../src/fases/trio-avancado.ts';
import { DIRECOES, executarPasso, iniciar, mesmaCasa, posicoesDosSiris, siriAtivo } from '../src/motor/index.ts';
import type { Acao, Estado, Fase, Posicao } from '../src/motor/index.ts';
import { carregar, salvar } from '../src/persistencia/index.ts';
import { validarSolucao } from '../src/validacao/index.ts';

const p = (coluna: number, linha: number): Posicao => ({ coluna, linha });

function menorRotaSemLevadas(fase: Fase, siriImovel?: number): number | undefined {
  const acoes: readonly Acao[] = [...DIRECOES, 'trocar'];
  const porPassos: Estado[][] = [[iniciar(fase)]];
  const vistos = new Set<string>();
  const largura = fase.mapa[0].length;
  const casa = (pos: Posicao) => pos.linha * largura + pos.coluna;
  for (let passos = 0; passos < porPassos.length; passos++) {
    const estados = porPassos[passos];
    for (const estado of estados) {
      const ativo = siriAtivo(estado);
      // As balsas dependem da maré do turno. Sem levadas, posições antigas não afetam a busca.
      const chave = [...posicoesDosSiris(estado).map(casa), ativo, passos % 6, estado.etapaGruta,
        estado.portadorGruta, estado.fragmentos.map(casa).sort().join('.')].join(',');
      if (vistos.has(chave)) continue;
      vistos.add(chave);
      if (estado.situacao === 'vitoria') return passos;
      for (const acao of acoes) {
        if (acao !== 'trocar' && ativo === siriImovel) continue;
        const seguinte = executarPasso(fase, estado, acao).estado;
        if (seguinte !== estado && !seguinte.levadas) (porPassos[seguinte.passos] ??= []).push(seguinte);
      }
    }
    // Não é preciso manter os estados já expandidos, só os identificadores.
    porPassos[passos] = [];
  }
}

test('as duas travessias têm rotas sem levadas de 23 e 40 passos e exigem os três siris e cada balsa', () => {
  for (const [fase, minimo] of [[ECO_DOS_TRES_CAIS, 23], [TRES_LUZES_EM_REVEZAMENTO, 40]] as const) {
    assert.ok(validarSolucao(fase));
    assert.equal(menorRotaSemLevadas(fase), minimo);
    for (const siri of [0, 1, 2]) assert.equal(menorRotaSemLevadas(fase, siri), undefined, fase.id);
    for (const balsa of fase.balsas) {
      assert.equal(menorRotaSemLevadas({ ...fase, balsas: fase.balsas.filter(outra => outra !== balsa) }),
        undefined, fase.id);
    }
  }
});

test('uma virada leva o coral inativo na Baía e a equipe divide placa, pérola e alavanca no Farol', () => {
  let estado = iniciar(ECO_DOS_TRES_CAIS);
  let caronaPeloVerde = false;
  for (const acao of ECO_DOS_TRES_CAIS.solucao) {
    const turno = executarPasso(ECO_DOS_TRES_CAIS, estado, acao);
    if (siriAtivo(estado) === 1 && turno.eventos.some(evento => evento.tipo === 'balsa')
      && !mesmaCasa(estado.posicao, turno.estado.posicao)) caronaPeloVerde = true;
    estado = turno.estado;
  }
  assert.ok(caronaPeloVerde);
  const fase = TRES_LUZES_EM_REVEZAMENTO;
  estado = iniciar(fase);
  const autores = new Map<string, number>();
  let placaSustentada = false;
  for (const acao of fase.solucao) {
    const ativo = siriAtivo(estado);
    const turno = executarPasso(fase, estado, acao);
    for (const evento of turno.eventos) {
      if (evento.tipo === 'gruta-avancou') autores.set(evento.etapa, ativo);
    }
    if (ativo === 0 && mesmaCasa(turno.estado.posicao, p(8, 0))) {
      assert.ok(mesmaCasa(estado.terceiro!.posicao, p(8, 4)));
      placaSustentada = true;
    }
    estado = turno.estado;
  }
  assert.ok(placaSustentada);
  assert.deepEqual([...autores], [['K', 1], ['E', 1], ['F', 0]]);
  assert.equal(estado.situacao, 'vitoria');
});

test('sem a placa ou qualquer etapa do Farol não se chega à saída', () => {
  for (const [fase, simbolo] of [[ECO_DOS_TRES_CAIS, 'P'], [TRES_LUZES_EM_REVEZAMENTO, 'P'],
    [TRES_LUZES_EM_REVEZAMENTO, 'K'], [TRES_LUZES_EM_REVEZAMENTO, 'E'],
    [TRES_LUZES_EM_REVEZAMENTO, 'F']] as const) {
    assert.equal(menorRotaSemLevadas({ ...fase, mapa: fase.mapa.map(linha => linha.replaceAll(simbolo, '.')) }),
      undefined, fase.id + ' sem ' + simbolo);
  }
});

test('os marcos de trio são opcionais, reabrem no save e não alteram os dez níveis regulares', () => {
  const casos = [
    { mundo: 'ressaca', marco: p(10, -1), lado: 'baixo', volta: 'cima', fase: ECO_DOS_TRES_CAIS,
      concluidas: ['ressaca-dupla-abrigo', 'ressaca-dupla-ancoradouros', 'ressaca-refugio-de-pedra',
        'ressaca-bolsos-opostos', 'ressaca-vigia-da-placa', 'ressaca-balsas-da-ponta', 'ressaca-cais-em-paralelo'] },
    { mundo: 'farol', marco: p(11, 3), lado: 'esquerda', volta: 'direita', fase: TRES_LUZES_EM_REVEZAMENTO,
      concluidas: ['farol-fragmento-margens', 'farol-duas-luzes', 'farol-faroleiros-de-vigia',
        'farol-turno-dos-guardioes', 'farol-salao-das-lanternas', 'farol-luz-das-duas-mares'] },
  ] as const;
  for (const { mundo, marco, lado, volta, fase, concluidas } of casos) {
    const antes: Progresso = { mundo, posicao: marco, viuTutorial: true, concluidas: concluidas.slice(0, -1) };
    assert.strictEqual(moverNoMapa(antes, lado).progresso, antes);
    const aberto: Progresso = { ...antes, concluidas };
    const desvio = moverNoMapa(aberto, lado).progresso;
    assert.equal(entradaEm(desvio.posicao, mundo)?.id, fase.id);
    assert.equal(faseOpcional(mundo, fase.id), true);
    assert.equal(totalDeFasesRegulares(mundo), 10);
    assert.deepEqual(moverNoMapa(desvio, volta).progresso, aberto);
    let bruto = '';
    const storage = { getItem: () => bruto, setItem: (_: string, novo: string) => { bruto = novo; } };
    const save = { progresso: concluirFase(desvio, fase.id), audio: { musica: 0, efeitos: 0 } };
    assert.ok(salvar(storage, save));
    assert.deepEqual(carregar(storage), save);
  }
});
