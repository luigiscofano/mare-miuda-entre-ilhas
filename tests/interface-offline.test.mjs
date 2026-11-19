import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

// Este ensaio carrega o módulo realmente embutido no arquivo offline.
// Simula DOM/Canvas para isolar comandos e desenho; não substitui o Chromium.
class ElementoFalso {
  textContent = '';
  hidden = false;
  open = false;
  style = {};
  atributos = {};
  eventos = {};
  constructor(dataset = {}) { this.dataset = dataset; }
  addEventListener(nome, fn) { this.eventos[nome] = fn; }
  setAttribute(nome, valor) { this.atributos[nome] = valor; }
  click() { this.eventos.click(); }
}
function prepararInterface() {
  const elementos = new Map();
  const pegar = chave => {
    if (!elementos.has(chave)) elementos.set(chave, new ElementoFalso());
    return elementos.get(chave);
  };
  const quadros = [];
  const contexto = { fillStyle: '', fillRect(...args) { quadros.push([this.fillStyle, ...args]); } };
  pegar('#tabuleiro').getContext = () => contexto;
  pegar('#moldura').clientWidth = 500;
  const fases = Array.from({ length: 3 }, (_, i) => new ElementoFalso({ fase: String(i + 1) }));
  const botoes = Object.fromEntries(
    ['cima', 'baixo', 'esquerda', 'direita'].map(direcao => [direcao, new ElementoFalso({ direcao })]),
  );
  globalThis.document = {
    querySelector: pegar,
    querySelectorAll: seletor => seletor === '[data-fase]' ? fases : Object.values(botoes),
  };
  globalThis.window = new ElementoFalso();
  globalThis.Element = ElementoFalso;
  globalThis.ResizeObserver = class { observe() {} };
  function tecla(key, repeat = false) {
    window.eventos.keydown({ key, repeat, preventDefault() {} });
  }
  return { pegar, quadros, fases, botoes, tecla };
}

test('HTML autônomo executa três fases, indicadores, teclado e cliques sem rede', async () => {
  const html = await readFile(new URL('../dist/mare-miuda-prototipo.html', import.meta.url), 'utf8');
  const modulo = html.match(/<script type="module" src="(data:[^"]+)"/)?.[1];
  assert.ok(modulo, 'A versão offline precisa embutir seu módulo.');
  assert.ok(html.includes('<style>'));
  assert.ok(!html.includes("href=\"./styles.css\""));
  const { pegar, quadros, fases, botoes, tecla } = prepararInterface();
  await import(modulo);
  const ler = id => pegar(id).textContent;
  assert.equal(ler('#nome-fase'), 'Passagem da primeira onda');
  assert.equal(pegar('#tabuleiro').style.width, '256px');
  assert.ok(quadros.length > 0);
  assert.ok(quadros.every(([cor, ...pos]) => /^#[0-9a-f]{6}$/i.test(cor) && pos.every(Number.isInteger)));
  tecla('ArrowRight', true);
  assert.equal(ler('#passos'), '0');
  tecla('ArrowLeft');
  assert.equal(ler('#passos'), '0');
  ['ArrowRight', 'd', 'ArrowRight'].forEach(key => tecla(key));
  assert.equal(ler('#mare'), 'Alta');
  assert.match(ler('#feedback'), /Fase concluída/);
  fases[1].click();
  ['direita', 'direita'].forEach(dir => botoes[dir].click());
  assert.match(ler('#previsao'), /Garça no próximo passo/);
  botoes.direita.click();
  assert.equal(ler('#erros'), '1 / 3');
  tecla('r');
  assert.equal(ler('#passos'), '0');
  ['direita', 'direita', 'baixo', 'cima', 'direita', 'direita'].forEach(dir => botoes[dir].click());
  assert.match(ler('#feedback'), /Fase concluída/);
  fases[2].click();
  botoes.direita.click();
  assert.match(ler('#feedback'), /encontre o fragmento/);
  pegar('#reiniciar').click();
  ['baixo','baixo','direita','esquerda','direita','esquerda','cima','cima','direita'].forEach(dir => botoes[dir].click());
  assert.match(ler('#feedback'), /Fase concluída/);
  assert.equal(ler('#fragmento'), 'Fragmento no inventário');
  pegar('#reiniciar').click();
  assert.equal(ler('#fragmento'), 'Fragmento ainda na ilha');
  assert.equal(ler('#erros'), '0 / 3');
  assert.equal(ler('#mare'), 'Baixa');
});
