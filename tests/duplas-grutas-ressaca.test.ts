import assert from 'node:assert/strict';
import { test } from 'node:test';
import { concluirFase, criarProgresso, moverNoMapa, totalDeFasesRegulares, viajar } from '../src/campanha/index.ts';
import type { Progresso } from '../src/campanha/index.ts';
import { GRUTAS_DUPLA, RESSACA_DUPLA } from '../src/fases/duplas-grutas-ressaca.ts';
import { DIRECOES, executarPasso, iniciar } from '../src/motor/index.ts';
import type { Acao, Estado, Fase } from '../src/motor/index.ts';
import { carregar, salvar } from '../src/persistencia/index.ts';
import { reproduzir, validarSolucao } from '../src/validacao/index.ts';

const todasAsAcoes: readonly Acao[] = [...DIRECOES, 'trocar'];

function existeVitoria(fase: Fase, acoes: readonly Acao[]): boolean {
  const primeiroAtaque = fase.ameaca?.primeiroAtaque ?? 0;
  const periodo = 6 * (fase.ameaca?.periodo ?? 1) * (1 + (fase.ameaca?.rota?.length ?? 0));
  const fila: Estado[] = [];
  const vistos = new Set<string>();
  function visitar(estado: Estado): void {
    if (estado.situacao === 'derrota') return;
    const { passos, ...tabuleiro } = estado;
    // A fase do relógio, as duas posições, o portador e as levadas distinguem cada estado.
    const relogio = passos < primeiroAtaque ? passos : primeiroAtaque + (passos - primeiroAtaque) % periodo;
    const chave = JSON.stringify([relogio, tabuleiro]);
    if (vistos.has(chave)) return;
    vistos.add(chave);
    fila.push(estado);
  }
  visitar(iniciar(fase));
  for (const estado of fila) {
    if (estado.situacao === 'vitoria') return true;
    for (const acao of acoes) {
      const proximo = executarPasso(fase, estado, acao).estado;
      if (proximo !== estado) visitar(proximo);
    }
  }
  return false;
}

test('Quatro fases regulares têm testemunhas sem levadas, e nenhuma vence sem trocar', () => {
  for (const fase of [...GRUTAS_DUPLA, ...RESSACA_DUPLA]) {
    assert.ok(validarSolucao(fase), fase.id);
    assert.equal(existeVitoria(fase, DIRECOES), false, fase.id);
  }
});

test('Cada encaixe nas Grutas e cada balsa na Ressaca são indispensáveis', () => {
  for (const fase of GRUTAS_DUPLA) {
    const semEncaixe = { ...fase, mapa: fase.mapa.map(linha => linha.replace('E', '.')) };
    assert.equal(existeVitoria(semEncaixe, todasAsAcoes), false, fase.id);
  }
  for (const fase of RESSACA_DUPLA) {
    (fase.balsas ?? []).forEach((_, indice) => {
      const balsas = fase.balsas?.filter((_, atual) => atual !== indice);
      assert.equal(existeVitoria({ ...fase, balsas }, todasAsAcoes), false, fase.id);
    });
  }
});

test('A pérola não troca de dono e um encaixe sem o portador não abre o portão', () => {
  const fase: Fase = { ...GRUTAS_DUPLA[0], mapa: ['SK.EOC', 'A..P##'] };
  const antes = reproduzir(fase, ['direita', 'trocar', 'direita', 'direita', 'cima']);
  const resultado = executarPasso(fase, antes, 'direita');
  assert.equal(resultado.estado.portadorGruta, 'principal');
  assert.equal(resultado.estado.etapaGruta, 1);
  assert.ok(resultado.eventos.some(e => e.tipo === 'gruta-precisa-portador'));
  const reinicio = iniciar(fase);
  assert.equal(reinicio.etapaGruta, 0);
  assert.equal(reinicio.portadorGruta, undefined);
});

test('A Ressaca abre após os dois desafios em dupla e pode ser retomada pelo save', () => {
  const base: Progresso = { ...criarProgresso(), mundo: 'arquipelago',
    posicao: { coluna: 8, linha: 1 }, concluidas: ['grutas-encaixe', 'grutas-ordem', 'grutas-retorno'] };
  const direita = (p: Progresso) => moverNoMapa(p, 'direita').progresso;
  assert.strictEqual(direita(base), base);
  const primeira = concluirFase(base, 'grutas-dupla-portao');
  assert.strictEqual(direita(primeira), primeira);
  const completa = concluirFase(primeira, 'grutas-dupla-camaras');
  let ressaca = viajar(direita(completa), 'ressaca');
  assert.equal(ressaca.mundo, 'ressaca');
  assert.equal(totalDeFasesRegulares('grutas'), 5);
  assert.equal(totalDeFasesRegulares('ressaca'), 2);
  ressaca = direita(ressaca);
  assert.strictEqual(direita(ressaca), ressaca);
  const noFinal = direita(concluirFase(ressaca, 'ressaca-dupla-abrigo'));
  assert.deepEqual(noFinal.posicao, { coluna: 4, linha: 1 });
  assert.strictEqual(moverNoMapa(noFinal, 'baixo').progresso, noFinal);
  const completo = concluirFase(noFinal, 'ressaca-dupla-ancoradouros');
  const porto = moverNoMapa(completo, 'baixo').progresso;
  assert.equal(viajar(porto, 'arquipelago').mundo, 'arquipelago');
  const previa = { progresso: completo, audio: { musica: 0.2, efeitos: 0.4 } };
  let dados = '';
  const storage = { getItem: () => dados, setItem: (_: string, valor: string) => { dados = valor; } };
  assert.ok(salvar(storage, previa));
  assert.deepEqual(carregar(storage), previa);
});
