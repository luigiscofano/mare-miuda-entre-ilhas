import assert from 'node:assert/strict';
import { test } from 'node:test';
import { coletaPerolas, indiceDaPerola } from '../src/campanha/coletaveis.ts';
import { TODAS_AS_FASES, TRES_MOEDAS } from '../src/fases/index.ts';
import { gerarMareAMao } from '../src/mare-a-mao/index.ts';
import { executarPasso, iniciar } from '../src/motor/index.ts';
import type { Estado, Fase } from '../src/motor/index.ts';
import { desenhar } from '../src/render/index.ts';
import { CORES_OSTRA, OSTRA_ABERTA, OSTRA_FECHADA } from '../src/render/ostra-de-chegada.ts';
import { paletaDaPerola, PEROLA_COLETAVEL } from '../src/render/perolas-coletaveis.ts';

const fase: Fase = { id: 'teste-quatro-perolas', nome: 'Teste', objetivo: '', ensino: '',
  mapa: ['SBB', 'BBG'], solucao: [] };

function quadro(jogo: Fase, estado: Estado): Map<string, string> {
  let escala = 2;
  const pilha: number[] = [];
  const marcas = new Map<string, string>();
  const ctx = {
    fillStyle: '', imageSmoothingEnabled: true,
    save() { pilha.push(escala); },
    restore() { escala = pilha.pop()!; },
    setTransform(n: number) { escala = n; },
    fillRect(x: number, y: number, l: number, a: number) {
      assert.ok([x, y, l, a].every(n => Number.isInteger(n * escala)));
      for (let linha = y * escala; linha < (y + a) * escala; linha++) {
        for (let coluna = x * escala; coluna < (x + l) * escala; coluna++) {
          marcas.set(`${coluna},${linha}`, this.fillStyle);
        }
      }
    },
  };
  desenhar(ctx as unknown as CanvasRenderingContext2D, jogo, estado,
    { complete: false } as HTMLImageElement, 'praia');
  assert.equal(pilha.length, 0);
  return marcas;
}

test('92 fases com B e G mostram pérolas, sem alterar moedas nem cenários sem saída de coleta', () => {
  const catalogo = TODAS_AS_FASES.filter(coletaPerolas);
  assert.equal(catalogo.length, 92);
  for (const moeda of [TRES_MOEDAS, ...TODAS_AS_FASES.filter(f => f.orcamentoMoedas !== undefined)]) {
    assert.equal(coletaPerolas(moeda), false);
  }
  assert.equal(coletaPerolas({ ...fase, mapa: ['SBC'] }), false);
  assert.equal(coletaPerolas({ ...fase, mapa: ['SKG'] }), false);
  assert.equal(indiceDaPerola(fase, { coluna: 3, linha: 0 }), undefined);
  for (const fragmento of [true, false]) {
    const improviso = gerarMareAMao({ mundo: 'praia', dificuldade: 'Animado', siris: 1, garca: false, fragmento }, 'teste-perolas');
    assert.ok(improviso);
    assert.equal(coletaPerolas(improviso), fragmento);
  }
});

test('Quatro pérolas têm o recorte nativo aprovado, sem mudar de cor após a coleta', () => {
  const inicio = iniciar(fase);
  const antes = quadro(fase, inicio);
  const depois = quadro(fase, executarPasso(fase, inicio, 'direita').estado);
  const posicoes = [{ coluna: 1, linha: 0 }, { coluna: 2, linha: 0 }, { coluna: 0, linha: 1 }, { coluna: 1, linha: 1 }];
  const contornos = ['#82766d', '#7f626d', '#536f79', '#68617d'];
  assert.equal(PEROLA_COLETAVEL.length, 20);
  posicoes.forEach((pos, i) => {
    assert.equal(indiceDaPerola(fase, pos), i);
    assert.equal(paletaDaPerola(i).a, contornos[i]);
    const x = 208 + pos.coluna * 32 + 6;
    const y = 160 + pos.linha * 32 + 6;
    PEROLA_COLETAVEL.forEach((linha, j) => [...linha].forEach((px, k) => {
      if (px === '.') return;
      const local = `${x + k},${y + j}`;
      assert.equal(antes.get(local), paletaDaPerola(i)[px]);
      if (i !== 0) assert.equal(depois.get(local), antes.get(local));
    }));
    if (i === 0) assert.notEqual(depois.get(`${x + 7},${y}`), contornos[i]);
  });
});


function conferirOstra(jogo: Fase, estado: Estado, aberta: boolean): void {
  const y = jogo.mapa.findIndex(linha => linha.includes('G'));
  const x = jogo.mapa[y].indexOf('G');
  const posX = (512 - jogo.mapa[0].length * 32) / 2 + x * 32;
  const posY = (384 - jogo.mapa.length * 32) / 2 + y * 32;
  const imagem = quadro(jogo, estado);
  const matriz = aberta ? OSTRA_ABERTA : OSTRA_FECHADA;
  let contados = 0;
  matriz.forEach((linha, j) => [...linha].forEach((pixel, i) => {
    assert.equal(linha.length, 32);
    if (pixel === '.') return;
    assert.equal(imagem.get(`${posX + i},${posY + j}`), CORES_OSTRA[pixel], jogo.id);
    contados++;
  }));
  assert.ok(contados > 230);
}

test('Busca e volta mostra a ostra fechada até recolher a pérola e depois mostra a cavidade', () => {
  const busca = TODAS_AS_FASES.find(f => f.id === 'busca-e-volta')!;
  let estado = iniciar(busca);
  conferirOstra(busca, estado, false);
  const cedo = executarPasso(busca, estado, 'direita');
  assert.equal(cedo.estado.situacao, 'jogando');
  assert.ok(cedo.eventos.some(evento => evento.tipo === 'falta-fragmento'));
  for (const movimento of busca.solucao.slice(0, 3)) estado = executarPasso(busca, estado, movimento).estado;
  assert.equal(estado.fragmentos.length, 1);
  conferirOstra(busca, estado, true);
  conferirOstra(busca, iniciar(busca), false);
  for (const movimento of busca.solucao.slice(3)) estado = executarPasso(busca, estado, movimento).estado;
  assert.equal(estado.situacao, 'vitoria');
});

test('Ostra exige todas as pérolas e não aparece nos objetivos de moeda ou de encaixe', () => {
  const jogo: Fase = { ...fase, mapa: ['SB.BG'] };
  let estado = iniciar(jogo);
  estado = executarPasso(jogo, estado, 'direita').estado;
  conferirOstra(jogo, estado, false);
  estado = executarPasso(jogo, estado, 'direita').estado;
  estado = executarPasso(jogo, estado, 'direita').estado;
  conferirOstra(jogo, estado, true);

  for (const excluida of [TRES_MOEDAS, { ...fase, mapa: ['SKG'] }, { ...fase, mapa: ['SBC'] }]) {
    const desenho = quadro(excluida, iniciar(excluida));
    assert.ok(![...desenho.values()].includes(CORES_OSTRA.v), excluida.id);
    assert.ok(![...desenho.values()].includes(CORES_OSTRA.b), excluida.id);
  }
});

test('Ilha de Improviso com pérola usa a mesma ostra', () => {
  const jogo = gerarMareAMao({ mundo: 'praia', dificuldade: 'Animado', siris: 1, garca: false, fragmento: true }, 'ostra-improviso');
  assert.ok(jogo);
  let estado = iniciar(jogo);
  conferirOstra(jogo, estado, false);
  for (const acao of jogo.solucao) {
    estado = executarPasso(jogo, estado, acao).estado;
    if (estado.fragmentos.length === 1) break;
  }
  conferirOstra(jogo, estado, true);
});
