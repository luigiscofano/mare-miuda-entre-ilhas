import assert from 'node:assert/strict';
import { test } from 'node:test';
import { concluirFase, entradaEm, moverNoMapa, totalDeFasesRegulares, viajar } from '../src/campanha/index.ts';
import type { Progresso } from '../src/campanha/index.ts';
import { TRES_REFUGIOS } from '../src/fases/trio-grutas.ts';
import { DIRECOES, destinoPermitido, executarPasso, iniciar, posicoesDosSiris, siriAtivo } from '../src/motor/index.ts';
import type { Fase, Estado } from '../src/motor/index.ts';
import { carregar, salvar } from '../src/persistencia/index.ts';
import { reproduzir, validarMapa, validarSolucao } from '../src/validacao/index.ts';

const p = (coluna: number, linha: number) => ({ coluna, linha });

function menorTravessia(fase: Fase, fixo = -1): number | undefined {
  const fila: Estado[][] = [[iniciar(fase)]];
  const vistos = new Set<string>();
  for (let passos = 0; passos < fila.length; passos++) {
    for (const estado of fila[passos] ?? []) {
      const chave = JSON.stringify([passos % 6, siriAtivo(estado), posicoesDosSiris(estado)]);
      if (vistos.has(chave)) continue;
      vistos.add(chave);
      if (estado.situacao === 'vitoria') return passos;
      const acoes = siriAtivo(estado) === fixo ? ['trocar'] as const : [...DIRECOES, 'trocar'] as const;
      for (const acao of acoes) {
        const s = executarPasso(fase, estado, acao).estado;
        if (s !== estado && !s.levadas) (fila[s.passos] ??= []).push(s);
      }
    }
    fila[passos] = [];
  }
}

test('a troca circula pelos três sem mover ninguém e qualquer siri inativo bloqueia a casa', () => {
  const fase = TRES_REFUGIOS;
  const inicio = iniciar(fase);
  let estado = inicio;
  for (const proximo of [1, 2, 0]) {
    estado = executarPasso(fase, estado, 'trocar').estado;
    assert.equal(siriAtivo(estado), proximo);
    assert.equal(estado.passos, 0);
    assert.deepEqual(posicoesDosSiris(estado), posicoesDosSiris(inicio));
  }
  const apertado: Estado = { ...inicio, posicao: p(1, 0),
    dupla: { ...inicio.dupla!, posicao: p(2, 0) },
    terceiro: { ...inicio.terceiro!, posicao: p(0, 0) } };
  assert.equal(destinoPermitido(fase, apertado, 'direita'), undefined);
  assert.equal(destinoPermitido(fase, apertado, 'esquerda'), undefined);
  assert.deepEqual(executarPasso(fase, apertado, 'esquerda'), {
    estado: apertado, eventos: [{ tipo: 'bloqueado' }],
  });
});

test('a virada alcança os dois inativos, conta só uma levada e retorna o grupo antes da vitória', () => {
  const fase = TRES_REFUGIOS;
  const inicial = iniciar(fase);
  const antes: Estado = { ...inicial, passos: 2, posicao: p(6, 0),
    dupla: { ...inicial.dupla!, posicao: p(4, 2) },
    terceiro: { ...inicial.terceiro!, posicao: p(5, 2) } };
  const chegada = executarPasso(fase, antes, 'direita');
  assert.deepEqual(chegada.eventos, [{ tipo: 'virada', alta: true }, { tipo: 'levada', motivos: ['mare'] }]);
  assert.equal(chegada.estado.levadas, 1);
  assert.equal(chegada.estado.passos, 3);
  assert.equal(chegada.estado.situacao, 'jogando');
  assert.deepEqual(posicoesDosSiris(chegada.estado), posicoesDosSiris(inicial));
});

test('as duas balsas levam os dois inativos no mesmo turno do siri em terra', () => {
  const fase: Fase = { ...TRES_REFUGIOS, mapa: ['S......C', '########', 'A~##~.T#', '########', 'M~##~.Y#'],
    balsas: [{ paradas: [p(1, 2), p(4, 2)] }, { paradas: [p(1, 4), p(4, 4)] }] };
  const inicio = iniciar(fase);
  const antes: Estado = { ...inicio, passos: 2,
    dupla: { ...inicio.dupla!, posicao: p(1, 2) }, terceiro: { ...inicio.terceiro!, posicao: p(1, 4) } };
  const resultado = executarPasso(fase, antes, 'direita');
  assert.deepEqual(resultado.eventos, [{ tipo: 'virada', alta: true }, { tipo: 'balsa' }]);
  assert.deepEqual(posicoesDosSiris(resultado.estado), [p(1, 0), p(4, 2), p(4, 4)]);
});

test('Três refúgios precisa do portão e do movimento de todos os siris', () => {
  const fase = TRES_REFUGIOS;
  assert.ok(validarSolucao(fase));
  assert.equal(menorTravessia(fase), 19);
  for (const fixo of [0, 1, 2]) assert.equal(menorTravessia(fase, fixo), undefined);
  assert.equal(menorTravessia({ ...fase, mapa: fase.mapa.map(linha => linha.replace('D', '#')) }), undefined);
  const noRefugio = reproduzir(fase, fase.solucao.slice(0, 3));
  assert.equal(destinoPermitido(fase, noRefugio, 'direita'), undefined);
  const placaComAmarelo = reproduzir(fase, fase.solucao.slice(0, 16));
  assert.deepEqual(placaComAmarelo.terceiro?.posicao, p(4, 4));
  assert.deepEqual(destinoPermitido(fase, placaComAmarelo, 'direita'), p(4, 0));
  const semMarco = { ...reproduzir(fase, fase.solucao.slice(0, -1)), terceiro: placaComAmarelo.terceiro };
  assert.deepEqual(executarPasso(fase, semMarco, 'direita').eventos, [{ tipo: 'faltam-siris' }]);
  assert.throws(() => validarMapa({ ...fase, mapa: fase.mapa.map(linha => linha.replace('Y', '.')) }), /trio/);
});

test('o desvio não altera as dez regulares, a abertura da Baía nem os saves antigos', () => {
  const base: Progresso = { mundo: 'grutas', posicao: p(8, 1), viuTutorial: true,
    concluidas: ['grutas-encaixe', 'grutas-ordem', 'grutas-retorno'] };
  assert.equal(moverNoMapa(base, 'baixo').progresso, base);
  const antigo = concluirFase(base, 'grutas-dupla-portao');
  const novo = moverNoMapa(antigo, 'baixo').progresso;
  assert.equal(entradaEm(novo.posicao, 'grutas')?.id, TRES_REFUGIOS.id);
  assert.equal(entradaEm(novo.posicao, 'grutas')?.opcional, true);
  assert.equal(totalDeFasesRegulares('grutas'), 10);
  assert.deepEqual(moverNoMapa(novo, 'cima').progresso, antigo);
  const legado = concluirFase(moverNoMapa(antigo, 'direita').progresso, 'grutas-dupla-camaras');
  const arquipelago = viajar(moverNoMapa(legado, 'baixo').progresso, 'arquipelago');
  assert.equal(viajar(moverNoMapa(arquipelago, 'direita').progresso, 'ressaca').mundo, 'ressaca');
  let registro = '';
  const storage = { setItem: (_: string, valor: string) => { registro = valor; }, getItem: () => registro };
  for (const progresso of [antigo, concluirFase(novo, TRES_REFUGIOS.id)]) {
    const save = { progresso, audio: { musica: .2, efeitos: .4 } };
    assert.ok(salvar(storage, save));
    assert.deepEqual(carregar(storage), save);
  }
});
