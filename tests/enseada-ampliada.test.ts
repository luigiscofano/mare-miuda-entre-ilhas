import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  concluirFase, entradaEm, faseOpcional, moverNoMapa, nosDo, saidaEm, totalDeFasesRegulares, trilhasDo, viajar,
} from '../src/campanha/index.ts';
import type { Progresso } from '../src/campanha/index.ts';
import { FASES_ENSEADA_AMPLIADA } from '../src/fases/enseada-ampliada.ts';
import { TODAS_AS_FASES } from '../src/fases/index.ts';
import { DIRECOES, alvoDaGarca, executarPasso, iniciar, mesmaCasa } from '../src/motor/index.ts';
import { carregar, salvar } from '../src/persistencia/index.ts';
import { validarSolucao } from '../src/validacao/index.ts';

const comandos = { U: 'cima', D: 'baixo', L: 'esquerda', R: 'direita', X: 'trocar' } as const;
const ponto = (coluna: number, linha: number) => ({ coluna, linha });

test('a Enseada tem dez travessias regulares e os dois desvios históricos; há soluções sem levadas', () => {
  assert.equal(totalDeFasesRegulares('enseada'), 10);
  assert.ok(faseOpcional('enseada', 'enseada-dupla-vigia'));
  assert.ok(faseOpcional('enseada', 'enseada-dupla-revezamento'));
  for (const fase of TODAS_AS_FASES) assert.ok(validarSolucao(fase), fase.id);
});

test('em cada fase nova, uma rota que ignora a garça funciona sem ela e falha num rasante anunciado', () => {
  const rotasIngenuas = [
    ['RRRR', 2], ['DRRURRRR', 4], ['DURRRRDRRR', 9], ['RRRDUDURRDULLLL', 10],
    ['RLRLRRRRRDURRDDLLLLLUUL', 10], ['UUDLULLRRDRRRRRDUDLLD', 15], ['XRRRDURXRRRRRRXDRR', 9],
  ] as const;
  for (const [i, [rota, passo]] of rotasIngenuas.entries()) {
    const fase = FASES_ENSEADA_AMPLIADA[i];
    const acoes = [...rota].map(letra => comandos[letra as keyof typeof comandos]);
    assert.ok(validarSolucao({ ...fase, ameaca: undefined, solucao: acoes }), fase.id);
    let estado = iniciar(fase);
    let acertou = false;
    for (const acao of acoes) {
      const alarme = alvoDaGarca(fase.ameaca, estado.passos + 1);
      const resultado = executarPasso(fase, estado, acao);
      if (resultado.eventos.some(e => e.tipo === 'levada' && e.motivos.includes('garca'))) {
        assert.ok(alarme, fase.id);
        assert.equal(resultado.estado.passos, passo, fase.id);
        acertou = true;
        break;
      }
      estado = resultado.estado;
    }
    assert.ok(acertou, fase.id);
  }
});

test('Vigia partilhada usa os dois siris e a placa para terminar em segurança', () => {
  const fase = FASES_ENSEADA_AMPLIADA[6];
  let estado = iniciar(fase);
  const moveram = new Set<string>();
  for (const acao of fase.solucao) {
    const ativo = estado.dupla?.parceiroAtivo ? 'parceiro' : 'principal';
    const resultado = executarPasso(fase, estado, acao);
    if (acao !== 'trocar' && resultado.estado !== estado) moveram.add(ativo);
    estado = resultado.estado;
  }
  assert.equal(moveram.size, 2);
  assert.equal(estado.situacao, 'vitoria');
  assert.equal(estado.levadas, 0);
  assert.ok(fase.mapa.some(linha => linha.includes('D')));
  assert.ok(fase.mapa.some(linha => linha.includes('P')));
  assert.ok(fase.solucao.filter(acao => acao === 'trocar').length >= 3);
});

test('novas trilhas têm volta e saves, e não alteram o acesso legado à Deriva', () => {
  let progresso: Progresso = { mundo: 'enseada', posicao: ponto(1, 1), concluidas: [], viuTutorial: true };
  for (const id of ['enseada-sombra-restinga', 'enseada-abrigo-ondas', 'enseada-farol-baixo'] as const) {
    progresso = moverNoMapa(progresso, 'direita').progresso;
    assert.equal(entradaEm(progresso.posicao, 'enseada')?.id, id);
    progresso = concluirFase(progresso, id);
  }
  const porto = moverNoMapa(progresso, 'baixo').progresso;
  const arquipelago = viajar(porto, 'arquipelago');
  assert.equal(viajar(moverNoMapa(arquipelago, 'direita').progresso, 'deriva').mundo, 'deriva');
  assert.equal(entradaEm(moverNoMapa(progresso, 'cima').progresso.posicao, 'enseada')?.id, 'enseada-dupla-vigia');

  let ramo: Progresso = { ...progresso, posicao: ponto(2, 1) };
  const direcoes = ['cima', 'direita', 'direita', 'direita', 'direita', 'direita', 'baixo'] as const;
  for (const [i, direcao] of direcoes.entries()) {
    ramo = moverNoMapa(ramo, direcao).progresso;
    const id = FASES_ENSEADA_AMPLIADA[i].id;
    assert.equal(entradaEm(ramo.posicao, 'enseada')?.id, id);
    ramo = concluirFase(ramo, id);
  }
  assert.equal(nosDo('enseada').length, 13);
  const todas = concluirFase(ramo, 'enseada-dupla-vigia');
  const trilhas = trilhasDo('enseada');
  for (const t of trilhas) {
    assert.deepEqual(moverNoMapa({ ...todas, posicao: t.de }, t.ida).progresso.posicao, t.para);
    assert.deepEqual(moverNoMapa({ ...todas, posicao: t.para }, t.volta).progresso.posicao, t.de);
  }
  for (const posicao of nosDo('enseada')) {
    for (const direcao of DIRECOES) {
      const opcoes = trilhas.filter(t => mesmaCasa(t.de, posicao) && t.ida === direcao
        || mesmaCasa(t.para, posicao) && t.volta === direcao);
      assert.equal(opcoes.length, Number(saidaEm({ ...todas, posicao }, direcao) !== undefined));
    }
  }
  let bruto = '';
  const storage = { setItem: (_: string, dados: string) => { bruto = dados; }, getItem: () => bruto };
  for (const p of [progresso, { ...ramo, posicao: ponto(6, -1) }, ramo]) {
    const save = { progresso: p, audio: { musica: 0, efeitos: 0 } };
    assert.ok(salvar(storage, save));
    assert.deepEqual(carregar(storage), save);
  }
});
