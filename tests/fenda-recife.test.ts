import assert from 'node:assert/strict';
import { test } from 'node:test';
import { criarProgresso, concluirFase, faseOpcional, trilhasDo } from '../src/campanha/index.ts';
import type { Progresso } from '../src/campanha/index.ts';
import { opcoesDoSeletor, selecionarMarco } from '../src/campanha/seletor.ts';
import { ENTRE_DUAS_FENDAS, FENDA_DA_VAZANTE, FENDAS_DA_ENSEADA } from '../src/fases/fendas-da-enseada.ts';
import { destinoPermitido, executarPasso, iniciar, jogadorAtivo, preverPasso } from '../src/motor/index.ts';
import type { Fase } from '../src/motor/index.ts';
import { carregar } from '../src/persistencia/index.ts';
import { desenhar } from '../src/render/index.ts';
import { reproduzir, validarMapa, validarSolucao } from '../src/validacao/index.ts';

const p = (coluna: number, linha = 0) => ({ coluna, linha });
const dupla: Fase = {
  ...ENTRE_DUAS_FENDAS, mapa: ['S.##.C', '###TA#'], dupla: { segundoAlvo: 'T' },
};
const ids = FENDAS_DA_ENSEADA.map(fase => fase.id);

test('a fenda seca funciona nos dois sentidos, em um passo e sem encadear nem mover o inativo', () => {
  const base = iniciar(dupla);
  assert.deepEqual(destinoPermitido(dupla, base, 'direita'), p(1));
  const ida = executarPasso(dupla, base, 'direita');
  assert.deepEqual(ida.estado.posicao, p(4));
  assert.equal(ida.estado.passos, 1);
  assert.deepEqual(ida.estado.dupla?.posicao, p(4, 1));
  assert.deepEqual(ida.eventos, [{ tipo: 'fenda-atravessada', forma: 'redonda' }]);
  const troca = executarPasso(dupla, ida.estado, 'trocar');
  assert.equal(troca.estado.passos, 1);
  assert.deepEqual(troca.estado.posicao, p(4));
  assert.deepEqual(jogadorAtivo(troca.estado), p(4, 1));
  const reverso = executarPasso(dupla, { ...base, posicao: p(5) }, 'esquerda');
  assert.deepEqual(reverso.estado.posicao, p(1));
  assert.equal(reverso.estado.passos, 1);

  // Um segundo par distinto não interfere com o primeiro.
  const duas: Fase = { ...ENTRE_DUAS_FENDAS, mapa: ['S.##..#..C'],
    fendas: [...ENTRE_DUAS_FENDAS.fendas, { forma: 'bifurcada', bocas: [p(5), p(8)] }] };
  const passos = reproduzir(duas, ['direita', 'direita', 'direita']);
  assert.equal(passos.situacao, 'vitoria');
  assert.equal(passos.passos, 3);
  validarMapa(duas);
});

test('a boca seca é piso na alta, e reabrir sob um siri não o teletransporta', () => {
  const fase = FENDA_DA_VAZANTE;
  const duranteAlta = reproduzir(fase, ['direita', 'direita', 'baixo', 'direita', 'cima']);
  assert.deepEqual(duranteAlta.posicao, p(3));
  assert.equal(duranteAlta.passos, 5);
  const sobreABoca = { ...duranteAlta, posicao: p(3, 1), ultimoFirme: p(3, 1) };
  const descida = executarPasso(fase, sobreABoca, 'cima');
  assert.deepEqual(descida.estado.posicao, p(3));
  assert.equal(descida.estado.passos, 6);
  assert.deepEqual(descida.eventos, [{ tipo: 'virada', alta: false }]);
  const alagada = { ...duranteAlta, posicao: p(6) };
  assert.deepEqual(executarPasso(fase, alagada, 'esquerda'), { estado: alagada, eventos: [{ tipo: 'bloqueado' }] });

  // Um siri inativo sobre a boca não viaja quando a água desce.
  const comDupla: Fase = { ...fase, mapa: ['S...#=C', '##..#AT'], dupla: { segundoAlvo: 'T' } };
  const comBocaOcupada = { ...iniciar(comDupla), passos: 5, dupla: { posicao: p(3), ultimoFirme: p(3), parceiroAtivo: false } };
  const semViagem = executarPasso(comDupla, comBocaOcupada, 'direita');
  assert.deepEqual(semViagem.estado.dupla?.posicao, p(3));
  assert.deepEqual(semViagem.eventos, [{ tipo: 'virada', alta: false }]);
});

test('a previsão alerta para a saída que alaga na chegada e o terceiro passo cobra uma levada', () => {
  const fase = FENDA_DA_VAZANTE;
  const antes = reproduzir(fase, ['direita', 'direita']);
  assert.deepEqual(preverPasso(fase, antes, 'direita'), {
    entrada: p(3), destino: p(5), fenda: fase.fendas[0], saidaVaiAlagar: true,
  });
  const resultado = executarPasso(fase, antes, 'direita');
  assert.equal(resultado.estado.passos, 3);
  assert.equal(resultado.estado.levadas, 1);
  assert.deepEqual(resultado.estado.posicao, p(2));
  assert.deepEqual(resultado.eventos, [
    { tipo: 'fenda-atravessada', forma: 'estreita' },
    { tipo: 'virada', alta: true }, { tipo: 'levada', motivos: ['mare'] },
  ]);
  const oposto = executarPasso({ ...fase, ameaca: { alvo: p(5), primeiroAtaque: 3, periodo: 3 } },
    { ...antes, posicao: p(6) }, 'esquerda');
  assert.deepEqual(oposto.estado.posicao, p(3));
  assert.equal(oposto.estado.levadas, 0, 'A agua e a garça atuam na saída, não na entrada.');
});

test('a saída ocupada ou interdita bloqueia o passo, inclusive quando o siri verde está ativo', () => {
  const base = iniciar(dupla);
  const antes = { ...base, passos: 2, posicao: p(4), dupla: { posicao: p(0), ultimoFirme: p(0), parceiroAtivo: true } };
  assert.equal(destinoPermitido(dupla, antes, 'direita'), undefined);
  assert.deepEqual(executarPasso(dupla, antes, 'direita'), {
    estado: antes, eventos: [{ tipo: 'fenda-bloqueada', motivo: 'ocupada' }],
  });
  // A topologia inválida é rejeitada pelo catálogo; o motor não entra na rocha nem fora do mapa.
  for (const mapa of [['S.###C'], ['S.##']]) {
    const fase = { ...ENTRE_DUAS_FENDAS, mapa };
    const inicio = iniciar(fase);
    assert.deepEqual(executarPasso(fase, inicio, 'direita'), {
      estado: inicio, eventos: [{ tipo: 'fenda-bloqueada', motivo: 'interditada' }],
    });
  }
});

test('o validador exige pares distintos, coordenadas inteiras, chão/baixio e silhuetas únicas', () => {
  const original = ENTRE_DUAS_FENDAS;
  const bocas = original.fendas[0].bocas;
  const fendas: Fase['fendas'][] = [
    [], [{ forma: 'redonda', bocas: [bocas[0], bocas[0]] }],
    [{ forma: 'redonda', bocas: [p(1.5), bocas[1]] }],
    [{ forma: 'redonda', bocas: [p(2), bocas[1]] }],
    [{ forma: 'redonda', bocas: [p(0), bocas[1]] }],
    [{ forma: 'redonda', bocas: [p(20), bocas[1]] }],
    [...original.fendas, { forma: 'redonda', bocas: [p(5), p(8)] }],
    [...original.fendas, { forma: 'estreita', bocas: [p(4), p(8)] }],
  ];
  for (const pares of fendas) {
    const fase = { ...original, mapa: ['S.##..#..C'], fendas: pares };
    assert.throws(() => validarMapa(fase), /Bocas de fenda inválidas/);
  }
  for (const fase of FENDAS_DA_ENSEADA) assert.ok(validarSolucao(fase));
});

test('no seletor, ambos os desvios preservam 25 regulares, gates e save v1', () => {
  const inicio: Progresso = { ...criarProgresso(), mundo: 'enseada' };
  const [primeira, segunda] = ids;
  assert.equal(selecionarMarco(inicio, primeira), undefined);
  const antigo: Progresso = { ...inicio, concluidas: ['enseada-sombra-restinga', 'enseada-abrigo-ondas', 'enseada-farol-baixo'] };
  assert.equal(opcoesDoSeletor(antigo).filter(o => o.categoria === 'regular').length, 25);
  assert.equal(selecionarMarco(antigo, primeira)?.opcao.categoria, 'bonus');
  assert.equal(selecionarMarco(antigo, segunda), undefined);
  const parcial = concluirFase(selecionarMarco(antigo, primeira)!.progresso, primeira);
  const salvo = carregar({ getItem: () => JSON.stringify({ versao: 1, progresso: parcial }) });
  assert.deepEqual(salvo.progresso, parcial);
  assert.equal(selecionarMarco(salvo.progresso, primeira)?.opcao.estado, 'concluida');
  assert.ok(selecionarMarco(salvo.progresso, segunda));
  for (const id of ids) assert.ok(faseOpcional('enseada', id));
  for (const mundo of ['enseada', 'arquipelago'] as const) {
    assert.ok(trilhasDo(mundo).every(t => !t.precisa.some(id => ids.some(fenda => fenda === id))));
  }
});

test('pixel sólido: a boca submersa usa os mesmos pixels do piso padrão, a seca permanece desenhada', () => {
  const fase = FENDA_DA_VAZANTE;
  const pixels = (f: Fase, passos: number, posicao?: ReturnType<typeof p>) => {
    const dados: Array<[string, number, number, number, number]> = [];
    const ctx = { fillStyle: '', save() {}, restore() {}, setTransform() {}, fillRect(x: number, y: number, w: number, h: number) {
      dados.push([this.fillStyle, x, y, w, h]);
    } };
    desenhar(ctx as unknown as CanvasRenderingContext2D, f, { ...iniciar(f), passos, ...(posicao ? { posicao } : {}) }, {} as HTMLImageElement, 'enseada');
    return dados;
  };
  const semFenda = { ...fase, fendas: undefined };
  const encontrar = (passos: number, cores: RegExp) => pixels(fase, passos).filter(p => cores.test(p[0]) && p[3] === 1 && p[4] === 1);
  const ativa = /^(#596157|#39473f|#273b35|#927e60)$/;
  const baixa = encontrar(0, ativa);
  const alta = encontrar(3, /^(#bc986b|#d6b682)$/);
  assert.ok(baixa.some(p => p[1] >= 152));
  assert.ok(baixa.some(p => p[1] < 150));
  assert.ok(alta.length > 0);
  assert.equal(encontrar(3, ativa).length, 0);
  assert.ok(alta.every(p => p[1] < 150 && Number.isInteger(p[1]) && Number.isInteger(p[2])));
  const naBocaAlagada = (registros: ReturnType<typeof pixels>) => registros.filter(([, x]) => x >= 152 && x < 168);
  assert.deepEqual(naBocaAlagada(pixels(fase, 3)), naBocaAlagada(pixels(semFenda, 3)));
  const alerta = naBocaAlagada(pixels(fase, 2, p(2)));
  assert.ok(alerta.some(([cor]) => cor === '#ffdf87'), 'A saída que alaga tem o ponto de exclamação.');
});
