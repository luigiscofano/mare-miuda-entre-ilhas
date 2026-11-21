import assert from 'node:assert/strict';
import { test } from 'node:test';
import { concluirFase, entradaEm, moverNoMapa, totalDeFasesRegulares } from '../src/campanha/index.ts';
import type { Progresso } from '../src/campanha/index.ts';
import { ULTIMA_VIRADA as fase } from '../src/fases/ultima-virada.ts';
import { DIRECOES, executarPasso, feixeNoTurno, iniciar, mareAlta, mesmaCasa, posicoesDosSiris, siriAtivo } from '../src/motor/index.ts';
import type { Estado, Fase, Posicao } from '../src/motor/index.ts';
import { carregar, salvar } from '../src/persistencia/index.ts';
import { reproduzir, validarMapa, validarSolucao } from '../src/validacao/index.ts';

const p = (coluna: number, linha: number): Posicao => ({ coluna, linha });
const linhas = [0, 2, 4] as const;
const largura = fase.mapa[0].length;
const ciclo = 18;
const todosOsFarois = (1 << fase.farol.orientacoes.length) - 1;
// Cada trilha tem a largura do tabuleiro e tem sempre o mesmo ocupante.
const chave = (ativo: number, turno: number, lentes: number, x: number, y: number, z: number) =>
  (((x * largura + y) * largura + z) * 3 + ativo) * ciclo * 8 + turno * 8 + lentes;

function menorRotaSemLevadas(arena: Fase): number | undefined {
  const acoes = [...DIRECOES, 'trocar'] as const;
  const filas: Estado[][] = [[iniciar(arena)]];
  const vistos = new Uint8Array(largura ** 3 * 3 * ciclo * 8);
  for (let passos = 0; passos < filas.length; passos++) {
    for (const estado of filas[passos]) {
      const [x, y, z] = posicoesDosSiris(estado).map(pos => pos.coluna);
      const lentes = fase.farol.orientacoes.reduce((bits, o, i) =>
        estado.lentesAcesas?.some(pos => mesmaCasa(pos, o.lente)) ? bits | (1 << i) : bits, 0);
      const k = chave(siriAtivo(estado), passos % ciclo, lentes, x, y, z);
      if (vistos[k]) continue;
      vistos[k] = 1;
      if (estado.situacao === 'vitoria') return passos;
      for (const acao of acoes) {
        const novo = executarPasso(arena, estado, acao).estado;
        if (novo !== estado && !novo.levadas) (filas[novo.passos] ??= []).push(novo);
      }
    }
    filas[passos] = [];
  }
}

test('a Última Virada exige um desvio: 48 passos com placas, 42 sem a sintonia', () => {
  assert.ok(validarSolucao(fase));
  assert.equal(menorRotaSemLevadas(fase), 48);
  const orientacoes = fase.farol.orientacoes.map(({ placa: _placa, ...orientacao }) => orientacao);
  assert.equal(menorRotaSemLevadas({ ...fase, farol: { ...fase.farol, orientacoes } }), 42);
  const fim = reproduzir(fase, fase.solucao);
  for (const [i, casa] of ['C', 'T', 'Y'].entries()) {
    assert.equal(fase.mapa[linhas[i]].indexOf(casa), largura - 1);
    assert.equal(posicoesDosSiris(fim)[i].coluna, largura - 1);
    assert.equal(fase.mapa[linhas[i]][0], ['S', 'A', 'M'][i]);
  }
  assert.equal(fim.lentesAcesas?.length, 3);
});

test('a lente só acende com o feixe e a placa da vez, depois de resolver riscos', () => {
  const antes = reproduzir(fase, ['direita', 'trocar', 'direita']);
  const semPlaca = executarPasso(fase, antes, 'direita');
  assert.ok(semPlaca.eventos.some(evento => evento.tipo === 'lente-sem-placa'));
  assert.deepEqual(semPlaca.estado.lentesAcesas, []);
  const comPlaca = { ...antes, terceiro: { ...antes.terceiro!, posicao: p(10, 4), ultimoFirme: p(10, 4) } };
  const acendeu = executarPasso(fase, comPlaca, 'direita');
  assert.ok(acendeu.eventos.some(evento => evento.tipo === 'lente-acesa'));
  assert.deepEqual(acendeu.estado.lentesAcesas, [p(2, 2)]);
  // Um parceiro continua vulnerável mesmo enquanto outro tenta acender uma lente.
  const exposto = { ...comPlaca, posicao: p(4, 0), ultimoFirme: p(3, 0), passos: 5 };
  const caiu = executarPasso(fase, exposto, 'direita');
  assert.deepEqual(caiu.eventos, [{ tipo: 'virada', alta: false }, { tipo: 'levada', motivos: ['farol'] }]);
  assert.deepEqual(caiu.estado.lentesAcesas, []);
  assert.deepEqual(caiu.estado.posicao, p(3, 0));
  assert.equal(caiu.estado.passos, 6);
  assert.equal(caiu.estado.levadas, 1);
  const duplicadas = fase.farol.orientacoes.map(o => ({ ...o, placa: fase.farol.orientacoes[0].placa }));
  assert.throws(() => validarMapa({ ...fase, farol: { ...fase.farol, orientacoes: duplicadas } }), /feixe inválida/);
});

test('qualquer checkpoint firme ainda tem rota segura, mesmo com duas levadas', () => {
  for (const linha of [1, 3]) assert.match(fase.mapa[linha], /^#+$/);
  for (const linha of linhas) assert.doesNotMatch(fase.mapa[linha], /#/);
  assert.equal(fase.farol.passosPorOrientacao * fase.farol.orientacoes.length, 9);
  const dim = largura ** 3 * 3 * ciclo * 8;
  const vistos = new Uint8Array(dim);
  const fila = new Int32Array(dim);
  const alvo = largura - 1;
  let fim = 0;
  function descobrir(id: number) {
    if (!vistos[id]) { vistos[id] = 1; fila[fim++] = id; }
  }
  const luzes = Array.from({ length: ciclo }, (_, passos) => feixeNoTurno(fase, passos)!);
  const permitido = luzes.map((feixe, tempo) => linhas.map(linha =>
    [...fase.mapa[linha]].map((casa, coluna) => casa === '=' ? !mareAlta(tempo)
      : casa === 'I' ? feixe.plataformas.some(pos => mesmaCasa(pos, p(coluna, linha))) : true)));
  for (let turno = 0; turno < ciclo; turno++) {
    for (let ativo = 0; ativo < 3; ativo++) descobrir(chave(ativo, turno, todosOsFarois, alvo, alvo, alvo));
  }
  // Percorra o tabuleiro ao contrário, começando nos três destinos. Um passo
  // precisa ser seguro antes e depois; uma troca não muda o relógio.
  for (let i = 0; i < fim; i++) {
    const id = fila[i];
    const lentes = id % 8;
    const turno = Math.floor(id / 8) % ciclo;
    const ativo = Math.floor(id / (8 * ciclo)) % 3;
    const pos = Math.floor(id / (8 * ciclo * 3));
    const casas: [number, number, number] = [Math.floor(pos / largura ** 2), Math.floor(pos / largura) % largura, pos % largura];
    descobrir(chave((ativo + 2) % 3, turno, lentes, ...casas));
    const antes = (turno + ciclo - 1) % ciclo;
    const destino = casas[ativo];
    if (!permitido[antes][ativo][destino] || !casas.every((casa, siri) => permitido[antes][siri][casa])) continue;
    const luz = luzes[turno];
    const controle = linhas.findIndex(linha => linha === luz.placa?.linha);
    const acendeu = luz.lente.linha === linhas[ativo] && luz.lente.coluna === destino && casas[controle] === luz.placa?.coluna;
    const bit = 1 << Math.floor(turno % 9 / 3);
    if (acendeu && !(lentes & bit)) continue;
    for (const c of [destino - 1, destino + 1]) {
      if (!permitido[antes][ativo][c]) continue;
      const anteriores: [number, number, number] = [...casas];
      anteriores[ativo] = c;
      descobrir(chave(ativo, antes, lentes, ...anteriores));
      if (acendeu) descobrir(chave(ativo, antes, lentes & ~bit, ...anteriores));
    }
  }
  let checkpoints = 0;
  for (let x = 0; x < largura; x++) for (let y = 0; y < largura; y++) for (let z = 0; z < largura; z++) {
    if ([x, y, z].some((coluna, siri) => /[I=]/.test(fase.mapa[linhas[siri]][coluna]))) continue;
    for (let turno = 0; turno < ciclo; turno++) for (let ativo = 0; ativo < 3; ativo++) {
      for (let lentes = 0; lentes <= todosOsFarois; lentes++) {
        assert.ok(vistos[chave(ativo, turno, lentes, x, y, z)], 'um retorno firme não pode exigir nova levada');
        checkpoints++;
      }
    }
  }
  assert.equal(checkpoints, 949104);
});

test('só o Guardião abre a arena opcional, e conclusão e retorno sobrevivem ao save', () => {
  const parcial: Progresso = { mundo: 'farol', posicao: p(11, 4), viuTutorial: true,
    concluidas: ['farol-fragmento-margens', 'farol-duas-luzes', 'farol-faroleiros-de-vigia',
      'farol-turno-dos-guardioes', 'farol-salao-das-lanternas', 'farol-luz-das-duas-mares'] };
  assert.strictEqual(moverNoMapa(parcial, 'esquerda').progresso, parcial);
  const abriu = concluirFase(parcial, 'farol-chefe-guardiao');
  const arena = moverNoMapa(abriu, 'esquerda').progresso;
  assert.equal(entradaEm(arena.posicao, 'farol')?.id, fase.id);
  assert.equal(entradaEm(arena.posicao, 'farol')?.chefe, true);
  assert.equal(totalDeFasesRegulares('farol'), 10);
  assert.deepEqual(moverNoMapa(arena, 'direita').progresso, abriu);
  let bruto = '';
  const storage = { getItem: () => bruto, setItem: (_: string, valor: string) => { bruto = valor; } };
  const save = { progresso: concluirFase(arena, fase.id), audio: { musica: 0, efeitos: 0 } };
  assert.ok(salvar(storage, save));
  assert.deepEqual(carregar(storage), save);
});
