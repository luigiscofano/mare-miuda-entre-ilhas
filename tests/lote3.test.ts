import assert from 'node:assert/strict';
import { test } from 'node:test';
import { FASES_GRUTAS } from '../src/fases/lote3.ts';
import { DIRECOES, executarPasso, iniciar, portaoDaGrutaAberto } from '../src/motor/index.ts';
import type { Estado, Fase } from '../src/motor/index.ts';
import { concluirFase, criarProgresso, entradaEm, moverNoMapa, mundoAtual, viajar } from '../src/campanha/index.ts';
import type { IdFase, Progresso } from '../src/campanha/index.ts';
import { carregar, salvar } from '../src/persistencia/index.ts';
import { reproduzir, validarMapa, validarSolucao } from '../src/validacao/index.ts';

function alcancaSaida(fase: Fase): boolean {
  const fila: Estado[] = [iniciar(fase)];
  const vistos = new Set<string>();
  for (let i = 0; i < fila.length; i++) {
    const estado = fila[i];
    if (estado.situacao === 'vitoria') return true;
    const { passos, ...tabuleiro } = estado;
    // Sem relógio de patrulha, o estado mais o resto de dois ciclos de três passos basta.
    // Inclui levadas e último firme: voltar pela água não pode contornar um mecanismo.
    const chave = JSON.stringify([passos % 6, tabuleiro]);
    if (vistos.has(chave)) continue;
    vistos.add(chave);
    for (const direcao of DIRECOES) {
      const proximo = executarPasso(fase, estado, direcao).estado;
      if (proximo !== estado) fila.push(proximo);
    }
  }
  return false;
}

test('Todas as Grutas vencem sem levadas e cada etapa é indispensável', () => {
  for (const fase of FASES_GRUTAS) {
    assert.ok(validarSolucao(fase), fase.id);
    assert.ok(alcancaSaida(fase), fase.id);
    for (const simbolo of fase.etapasGruta!) {
      const semEtapa = { ...fase, mapa: fase.mapa.map(linha => linha.replace(simbolo, '.')) };
      assert.equal(alcancaSaida(semEtapa), false, `${fase.id}: ${simbolo}`);
    }
  }
});

test('A ordem incorreta é inofensiva e o portão fechado não gasta passo', () => {
  const fase = FASES_GRUTAS[1];
  const inicio = iniciar(fase);
  const cedo = executarPasso(fase, inicio, 'direita');
  assert.deepEqual(cedo.eventos, [{ tipo: 'gruta-fora-da-ordem', proxima: 'E' }]);
  assert.equal(cedo.estado.passos, 1);
  assert.equal(cedo.estado.etapaGruta, 0);
  const antes = reproduzir(fase, ['direita', 'direita', 'direita']);
  const fechado = executarPasso(fase, antes, 'direita');
  assert.equal(fechado.estado, antes);
  assert.deepEqual(fechado.eventos, [{ tipo: 'bloqueado' }]);
});

test('Pérola, encaixe e alavanca mantêm a ordem e reiniciar limpa o tabuleiro', () => {
  const fase = FASES_GRUTAS[2];
  const aposColeta = reproduzir(fase, fase.solucao.slice(0, 2));
  assert.equal(aposColeta.etapaGruta, 1);
  const aposEntrega = reproduzir(fase, fase.solucao.slice(0, 8));
  assert.equal(aposEntrega.etapaGruta, 2);
  assert.equal(portaoDaGrutaAberto(fase, aposEntrega), false);
  assert.equal(portaoDaGrutaAberto(fase, reproduzir(fase, fase.solucao)), true);
  assert.equal(iniciar(fase).etapaGruta, 0);
  assert.throws(() => validarMapa({ ...fase, etapasGruta: ['K', 'K', 'F'] }), /inválidos/);
});

test('A trilha das Grutas abre após Corrente cruzada e salva sem opcionais', () => {
  const deriva: Progresso = { ...criarProgresso(), mundo: 'arquipelago', posicao: { coluna: 7, linha: 3 },
    concluidas: ['recife-retorno', 'mangue-reuniao', 'enseada-farol-baixo'] };
  assert.equal(moverNoMapa(deriva, 'cima').progresso, deriva);
  let p = viajar(moverNoMapa(concluirFase(deriva, 'deriva-corrente-cruzada'), 'cima').progresso, 'grutas');
  assert.equal(mundoAtual(p), 'grutas');
  for (const fase of FASES_GRUTAS) {
    p = moverNoMapa(p, 'direita').progresso;
    assert.equal(entradaEm(p.posicao, 'grutas')?.id, fase.id);
    p = concluirFase(p, fase.id as IdFase);
  }
  let bruto = '';
  const storage = { getItem: () => bruto, setItem: (_: string, v: string) => { bruto = v; } };
  const save = { progresso: p, audio: { musica: 0.3, efeitos: 0.4 } };
  assert.ok(salvar(storage, save));
  assert.deepEqual(carregar(storage), save);
  p = viajar(moverNoMapa(p, 'baixo').progresso, 'arquipelago');
  assert.equal(mundoAtual(p), 'arquipelago');
  assert.deepEqual(p.posicao, { coluna: 8, linha: 1 });
});
